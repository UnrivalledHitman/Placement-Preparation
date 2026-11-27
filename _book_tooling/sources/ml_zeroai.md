# Chapter 1: Pure-NumPy ML From Scratch (Zero-AI)
%Building scalers, Ridge/Logistic SGD and leak-free CV with sklearn, PyTorch and AI turned off

Calling `model.fit(X_train, y_train)` hides the exact mechanics interviewers probe for 14–18 LPA AI/ML engineering roles: numerical stability, bias regularization bugs, silent data leakage before cross-validation, and vectorization complexity. Rebuilding core primitives in pure NumPy eliminates black-box reliance permanently.

## 1.1 Pure-NumPy `StandardScaler` & Leak-Free Pipelines

A classic research and interview bug is fitting `StandardScaler` on the full dataset *before* splitting into train/validation folds. Validation mean and variance leak into training features, inflating offline metrics that collapse in production.

```python Pure-NumPy StandardScaler (no sklearn)
import numpy as np

class StandardScalerNP:
    def __init__(self, eps: float = 1e-8):
        self.eps = eps
        self.mean_ = None
        self.std_ = None

    def fit(self, X: np.ndarray) -> "StandardScalerNP":
        X = np.asarray(X, dtype=np.float64)
        self.mean_ = X.mean(axis=0)
        self.std_ = X.std(axis=0)
        self.std_ = np.where(self.std_ < self.eps, 1.0, self.std_)
        return self

    def transform(self, X: np.ndarray) -> np.ndarray:
        return (np.asarray(X, dtype=np.float64) - self.mean_) / self.std_

    def fit_transform(self, X: np.ndarray) -> np.ndarray:
        return self.fit(X).transform(X)
```

> TRAP: Never divide by raw `X.std(axis=0)` without guarding zero-variance constant columns (`std < eps -> 1.0`), otherwise a single constant sensor channel turns the entire feature matrix into `NaN`.

## 1.2 OLS, Ridge Regression & Logistic Regression with L2 (Excluding Bias!)

Two critical rules separate clean ML implementations from textbook traps:

1. **Never regularize the bias term `b`.** Penalizing `b` shifts predictions arbitrarily toward zero instead of shrinking feature weights.
2. **Numerical stability in sigmoid and log-loss:** Clip logits or use the piecewise stable formulation `where(z >= 0, 1/(1+exp(-z)), exp(z)/(1+exp(z)))` so large negative logits never trigger `OverflowError` or `log(0)`.

```python Closed-form Ridge & Mini-Batch SGD Logistic Regression (pure NumPy)
def fit_ridge_closed_form(X: np.ndarray, y: np.ndarray, lam: float):
    n, d = X.shape
    Xb = np.hstack([X, np.ones((n, 1))])
    reg = np.eye(d + 1) * lam
    reg[-1, -1] = 0.0  # CRITICAL: do NOT penalize bias term!
    theta = np.linalg.solve(Xb.T @ Xb + reg, Xb.T @ y)
    return theta[:-1], float(theta[-1])

def stable_sigmoid(z: np.ndarray) -> np.ndarray:
    pos = z >= 0
    out = np.empty_like(z, dtype=np.float64)
    out[pos] = 1.0 / (1.0 + np.exp(-z[pos]))
    ez = np.exp(z[~pos])
    out[~pos] = ez / (1.0 + ez)
    return out

def fit_logistic_sgd(X, y, lr=0.1, lam=1e-2, epochs=200, batch_size=64, seed=42):
    rng = np.random.default_rng(seed)
    n, d = X.shape
    w = np.zeros(d, dtype=np.float64)
    b = 0.0
    for _ in range(epochs):
        perm = rng.permutation(n)
        for start in range(0, n, batch_size):
            idx = perm[start : start + batch_size]
            xb, yb = X[idx], y[idx]
            p = stable_sigmoid(xb @ w + b)
            err = (p - yb) / len(idx)
            grad_w = xb.T @ err + lam * w  # L2 penalty on weights only
            grad_b = float(err.sum())      # Bias excluded from L2
            w -= lr * grad_w
            b -= lr * grad_b
    return w, b
```

## 1.3 Leak-Free Cross-Validation: Stratified, Time-Series & LOSO

Choosing the wrong CV splitter silently invalidates every ablation table:

| Data Regime | Correct Splitter | Why Naive K-Fold Fails |
|---|---|---|
| Imbalanced i.i.d. tabular | Stratified K-Fold | Rare positive class missing from some validation folds |
| Financial / demand forecasting | Expanding / Rolling Time-Series Split | Future timestamps leak into past training windows |
| Wearable / medical subjects | Leave-One-Subject-Out (LOSO) / GroupKFold | Model memorizes subject physiology instead of generalizing |

> EXAM: In `Wearable-Sensor-Data-Analytics`, windows from the same participant are heavily autocorrelated. Random window-level K-Fold gives inflated 99% accuracy while failing completely on unseen users. Always fit scalers inside each **LOSO** training fold.

# Chapter 2: Pure-NumPy 2-Layer MLP, Backprop & Normalization
%Deriving forward/backward passes by hand and proving them with finite-difference gradient checks

## 2.1 Forward & Backward Pass (ReLU + Softmax Cross-Entropy)

For input batch `X` of shape `(N, D)`, hidden size `H`, and `C` classes:

- `Z1 = X @ W1 + b1`, `A1 = max(0, Z1)` (ReLU)
- `Z2 = A1 @ W2 + b2`
- Stable softmax: subtract `max(Z2, axis=1, keepdims=True)` before `exp`.
- Combined gradient of Softmax + Cross-Entropy simplifies cleanly to `dZ2 = (P - Y_onehot) / N`.

```python 2-Layer ReLU + Softmax CE MLP forward & backward (pure NumPy)
def mlp_forward_backward(X, y, params, lam=1e-4):
    W1, b1, W2, b2 = params["W1"], params["b1"], params["W2"], params["b2"]
    N = X.shape[0]
    Z1 = X @ W1 + b1
    A1 = np.maximum(0.0, Z1)
    Z2 = A1 @ W2 + b2
    Z2_shift = Z2 - Z2.max(axis=1, keepdims=True)
    exp_z = np.exp(Z2_shift)
    P = exp_z / exp_z.sum(axis=1, keepdims=True)

    loss = -np.log(P[np.arange(N), y] + 1e-12).mean()
    loss += 0.5 * lam * (np.sum(W1 * W1) + np.sum(W2 * W2))

    dZ2 = P.copy()
    dZ2[np.arange(N), y] -= 1.0
    dZ2 /= N

    dW2 = A1.T @ dZ2 + lam * W2
    db2 = dZ2.sum(axis=0)
    dA1 = dZ2 @ W2.T
    dZ1 = dA1 * (Z1 > 0)
    dW1 = X.T @ dZ1 + lam * W1
    db1 = dZ1.sum(axis=0)
    return loss, {"W1": dW1, "b1": db1, "W2": dW2, "b2": db2}
```

## 2.2 Central Finite-Difference Numerical Gradient Checker (`< 1e-6`)

Never trust a handwritten backward pass by eyeballing loss curves. Verify every parameter tensor against central finite differences `(L(theta + eps) - L(theta - eps)) / (2 * eps)` using `float64` and `eps = 1e-6`:

```python Central finite-difference relative error checker
def check_gradients(X, y, params, lam=1e-4, eps=1e-6):
    _, grads = mlp_forward_backward(X, y, params, lam=lam)
    max_rel_err = 0.0
    for name, arr in params.items():
        num_grad = np.zeros_like(arr)
        it = np.nditer(arr, flags=["multi_index"], op_flags=["readwrite"])
        while not it.finished:
            idx = it.multi_index
            orig = arr[idx]
            arr[idx] = orig + eps
            lp, _ = mlp_forward_backward(X, y, params, lam=lam)
            arr[idx] = orig - eps
            lm, _ = mlp_forward_backward(X, y, params, lam=lam)
            arr[idx] = orig
            num_grad[idx] = (lp - lm) / (2.0 * eps)
            it.iternext()
        denom = np.maximum(1e-8, np.abs(grads[name]) + np.abs(num_grad))
        rel_err = float(np.max(np.abs(grads[name] - num_grad) / denom))
        max_rel_err = max(max_rel_err, rel_err)
    assert max_rel_err < 1e-6, f"Gradient check failed: {max_rel_err}"
    return max_rel_err
```

> TIP: If a ReLU pre-activation `Z1` sits within `[-eps, +eps]` of `0`, finite differences straddle the non-differentiable kink. Use small synthetic inputs away from `0` (or verify with `tanh` first) during gradient checks.

## 2.3 BatchNorm vs LayerNorm vs RevIN Intuition

| Norm Layer | Normalizes Across | Running Stats? | Primary Domain & Intuition |
|---|---|---|---|
| **BatchNorm** | `(N, H, W)` per channel `C` | Yes (`eval()` differs) | CNNs with large batches; fails on batch size 1 or non-stationary sequences |
| **LayerNorm** | Feature dim `D` per sample | No | Transformers & RNNs; invariant to batch size and sequence length |
| **RevIN** | Temporal dim `T` per `(sample, channel)` + symmetric denorm | No | Non-stationary time-series (wearables, forecasting): removes per-window distribution shift before the backbone and restores scale at output |

# Chapter 3: PyTorch-to-ONNX Parity & FastAPI Serving
%Building production inference inside Wearable-Sensor-Data-Analytics/app/

Shipping raw PyTorch inside a Docker API container bloats images to 3–6 GB and slows cold starts. Exporting to **ONNX (`opset=17`)** and serving with `onnxruntime` slashes image size under 450 MB and cuts CPU p95 latency dramatically.

## 3.1 Exporting PyTorch to ONNX with Strict Numerical Parity

Always call `model.eval()`, wrap export in `torch.no_grad()`, define dynamic batch axes, and verify numerical parity against `onnxruntime.InferenceSession` using `np.testing.assert_allclose(rtol=1e-4, atol=1e-5)`.

```python PyTorch -> ONNX export + parity gate (export_onnx.py)
import numpy as np
import onnxruntime as ort
import torch

def export_and_verify(model: torch.nn.Module, dummy: torch.Tensor, out_path: str):
    model.eval()
    with torch.no_grad():
        pt_out = model(dummy).cpu().numpy()

    torch.onnx.export(
        model,
        dummy,
        out_path,
        export_params=True,
        opset_version=17,
        do_constant_folding=True,
        input_names=["sensor_window"],
        output_names=["logits"],
        dynamic_axes={"sensor_window": {0: "batch"}, "logits": {0: "batch"}},
    )
    sess = ort.InferenceSession(out_path, providers=["CPUExecutionProvider"])
    ort_out = sess.run(["logits"], {"sensor_window": dummy.cpu().numpy()})[0]
    np.testing.assert_allclose(pt_out, ort_out, rtol=1e-4, atol=1e-5)
```

## 3.2 FastAPI `lifespan` Serving & Pydantic v2 `NaN`/`Inf` Rejection

Load the ONNX session **once** during FastAPI `lifespan` startup—never inside the request handler. Validate incoming sensor windows strictly with Pydantic v2 so `NaN`, `Inf`, wrong channel counts, or oversized batches fail fast with `422 Unprocessable Entity`.

```python FastAPI ONNX serving with lifespan & strict validation (app/main.py)
from contextlib import asynccontextmanager
import math
from typing import List
from fastapi import FastAPI, HTTPException
import numpy as np
import onnxruntime as ort
from pydantic import BaseModel, Field, field_validator

state = {"session": None, "model_version": "wearable-v1.0.0"}

@asynccontextmanager
async def lifespan(_app: FastAPI):
    state["session"] = ort.InferenceSession(
        "artifacts/model.onnx", providers=["CPUExecutionProvider"]
    )
    yield
    state["session"] = None

app = FastAPI(title="Wearable Sensor Inference API", lifespan=lifespan)

class SensorWindowRequest(BaseModel):
    # Shape: [timesteps, channels], bounded for memory safety
    window: List[List[float]] = Field(..., min_length=16, max_length=512)

    @field_validator("window")
    @classmethod
    def reject_non_finite(cls, v: List[List[float]]) -> List[List[float]]:
        cols = len(v[0])
        for row in v:
            if len(row) != cols:
                raise ValueError("Ragged sensor window rows are not allowed")
            if any(not math.isfinite(x) for x in row):
                raise ValueError("NaN or Inf detected in sensor payload")
        return v

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    if state["session"] is None:
        raise HTTPException(status_code=503, detail="MODEL_NOT_LOADED")
    return {"status": "ready", "model_version": state["model_version"]}

@app.post("/v1/predict")
def predict(req: SensorWindowRequest):
    sess = state["session"]
    if sess is None:
        raise HTTPException(status_code=503, detail="MODEL_NOT_LOADED")
    arr = np.asarray(req.window, dtype=np.float32)[None, :, :]
    logits = sess.run(["logits"], {"sensor_window": arr})[0][0]
    exp_l = np.exp(logits - logits.max())
    probs = (exp_l / exp_l.sum()).tolist()
    return {
        "predicted_class": int(np.argmax(probs)),
        "probabilities": probs,
        "model_version": state["model_version"],
    }
```

# Chapter 4: Slim Docker, Latency Benchmarks, PSI Drift & MLflow CI
%Turning a research repository into an auditable production ML service

## 4.1 Multi-Stage Slim Non-Root Dockerfile (`< 450 MB`)

Separate build dependencies from the minimal runtime image, install wheels cleanly, and drop root privileges:

```text Multi-stage slim Dockerfile for ONNX FastAPI service (< 450 MB)
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements-serve.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements-serve.txt

FROM python:3.12-slim AS runtime
WORKDIR /app
RUN useradd --create-home --shell /usr/sbin/nologin appuser
COPY --from=builder /install /usr/local
COPY --chown=appuser:appuser app/ ./app/
COPY --chown=appuser:appuser artifacts/model.onnx ./artifacts/model.onnx
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD python -c \
  "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/ready')"
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

## 4.2 Concurrency Latency Benchmarking (`p50` / `p95` / `p99`)

Average latency hides tail spikes caused by GIL contention or ONNX intra-op thread oversubscription. Benchmark at concurrency `c = 1, 8, 32`, record `p50`, `p95`, `p99`, and RPS, and tune `SessionOptions.intra_op_num_threads` so workers do not thrash CPU cores.

## 4.3 Input Drift Monitoring with Population Stability Index (PSI)

PSI quantifies covariate shift between training reference feature distributions `E` and live production traffic `A` across `B` quantile bins:

`PSI = sum_{i=1..B} (A_i - E_i) * ln(A_i / E_i)`

| PSI Range | Interpretation | Automated Action |
|---|---|---|
| `< 0.10` | No meaningful shift | Keep current model |
| `0.10 – 0.25` | Moderate shift | Log warning, inspect top-drifting sensor channels |
| `> 0.25` | Significant shift | Trigger alert & schedule retraining / recalibration |

```python Pure-NumPy PSI drift detector (monitoring/drift.py)
def compute_psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    quantiles = np.linspace(0.0, 1.0, bins + 1)
    edges = np.unique(np.quantile(expected, quantiles))
    if len(edges) < 3:
        return 0.0
    edges[0], edges[-1] = -np.inf, np.inf
    e_pct = np.histogram(expected, bins=edges)[0] / len(expected)
    a_pct = np.histogram(actual, bins=edges)[0] / len(actual)
    eps = 1e-6
    e_pct = np.clip(e_pct, eps, 1.0)
    a_pct = np.clip(a_pct, eps, 1.0)
    return float(np.sum((a_pct - e_pct) * np.log(a_pct / e_pct)))
```

## 4.4 MLflow Tracking & GitHub Actions ML CI

Log every training run with `mlflow.log_params`, `mlflow.log_metrics` (LOSO macro-F1, ECE, latency), and `mlflow.log_artifact("model.onnx")`. In GitHub Actions CI, run: (1) pure-NumPy unit & gradient tests, (2) FastAPI `TestClient` schema/NaN/health tests, (3) ONNX parity test on a lightweight fixture, and (4) `docker build` size assertion (`< 450 MB`).

# Chapter 5: Repo De-Bloating & Cold Whiteboard Defense
%Cleaning multi-GB caches out of Git and defending your research repos with zero notes

## 5.1 De-Bloating Multi-GB `.npz` Caches Out of Git History

Committing `.npz`, `.pt`, or `.csv` caches balloons repository clones to gigabytes and signals amateur hygiene to hiring managers.

1. Add `*.npz`, `*.pt`, `*.ckpt`, `data/raw/`, and `artifacts/*.onnx` to `.gitignore`.
2. Track small model hashes or DVC/release links instead of raw binaries; ship a `scripts/download_data.py` or `make data` bootstrap command.
3. Rewrite history safely using `git filter-repo --path-glob '*.npz' --invert-paths` on a fresh mirror, verify `git count-objects -vH` drops under `20 MB`, and force-push with `--force-with-lease` after coordinating collaborators.

## 5.2 Cold Whiteboard Defense Protocol

Every Friday in Phase 2, pick one subsystem from **`Wearable-Sensor-Data-Analytics`** or **`Prompt-Routing-Research-Journal`** and defend it for 15 minutes on a blank whiteboard or paper **with zero notes, zero slides, and zero AI**:

| Defense Axis | Questions You Must Answer Cold |
|---|---|
| 1. Problem & Metric | Why macro-F1 / cost-quality Pareto frontier instead of raw accuracy? |
| 2. Leakage & Splits | How did you prevent subject/window leakage (LOSO) or prompt-template leakage? |
| 3. Architecture Choice | Why RevIN / temporal convolution / router calibration over a heavier baseline? |
| 4. Failure Modes | What inputs cause your worst errors, and how does production monitoring catch them? |
| 5. Complexity & Cost | Exact parameter count, inference latency (ms), and USD/1K-request routing savings? |

# Chapter 6: 12 Weekly Zero-AI Friday Proof Gates (M1.1–M6.2)
%Attempt each gate on Fridays (Weeks 13–24) from a blank file with AI completely off

## Part 1: Pure-NumPy ML & Backprop (Weeks 13–16)

**M1.1 · Medium · Code · Pure-NumPy StandardScaler and Leak-Free CV Harness.** Implement `StandardScalerNP` (constant-column safe) and a stratified K-Fold + LOSO splitter in pure NumPy, proving with a synthetic test that pre-split scaling inflates validation accuracy while in-fold scaling removes leakage.

**M1.2 · Medium · Code · Closed-Form Ridge & Mini-Batch SGD Logistic Regression.** Write both models in pure NumPy excluding bias from L2 regularization, with numerically stable sigmoid/log-loss, verifying parameter convergence within `1e-3` of `sklearn` reference on synthetic data.

**M2.1 · Hard · Code · 2-Layer ReLU + Softmax Cross-Entropy MLP From Scratch.** Implement forward/backward passes, He initialization, mini-batch SGD with momentum, and training loop on synthetic multi-class blobs in pure NumPy achieving > 95% validation accuracy.

**M2.2 · Hard · Code · Central Finite-Difference Gradient Checker & Norm Comparison.** Implement `check_gradients` achieving `< 1e-6` max relative error on your NumPy MLP, and write a clean NumPy demo contrasting BatchNorm, LayerNorm, and RevIN outputs on shifted time-series windows.

## Part 2: ONNX Export, FastAPI Serving & Slim Docker (Weeks 17–20)

**M3.1 · Medium · Build · PyTorch-to-ONNX Opset-17 Export with Parity Gate.** Export a wearable time-series PyTorch model with dynamic batch axes to ONNX (`opset=17`) and verify `np.testing.assert_allclose(rtol=1e-4, atol=1e-5)` across batch sizes 1, 8, and 32.

**M3.2 · Medium · Build · FastAPI Lifespan ONNX Service for Wearable App.** Build `app/main.py` inside `Wearable-Sensor-Data-Analytics/app/` with `lifespan` model loading, `/health`, `/ready`, `/v1/predict`, and Pydantic v2 validation rejecting `NaN`, `Inf`, and ragged shapes with `422`.

**M4.1 · Medium · Deploy · Multi-Stage Slim Non-Root Inference Container.** Containerize the FastAPI ONNX server with a multi-stage `python:3.12-slim` Dockerfile running as `appuser`, asserting final image size `< 450 MB` and green `/ready` healthcheck.

**M4.2 · Hard · Build · Async Latency Benchmark Suite (p50/p95/p99).** Write a Python `asyncio` + `httpx` load generator hitting `/v1/predict` at concurrency 1, 8, and 32, outputting `p50`/`p95`/`p99` ms and RPS, and tune `intra_op_num_threads` to cut tail latency.

## Part 3: Drift, MLflow CI, De-Bloat & Cold Defense (Weeks 21–24)

**M5.1 · Medium · Code · PSI Covariate Drift Detector & Alert Pipeline.** Implement pure-NumPy `compute_psi` across multi-channel wearable windows, unit-test `PSI < 0.10` (no shift) vs `PSI > 0.25` (shifted mean/scale), and emit JSON drift reports.

**M5.2 · Medium · Pipeline · MLflow Experiment Tracking + GitHub Actions ML CI.** Wire MLflow logging (params, LOSO macro-F1, ONNX artifact) and a GitHub Actions workflow executing NumPy gradient checks, FastAPI `TestClient` tests, ONNX parity, and Docker size gate.

**M6.1 · Medium · Debug · Git Repo De-Bloat & Reproducible Data Bootstrap.** Audit repo pack size, strip multi-GB `.npz` caches using `git filter-repo`, lock `.gitignore`, and add a deterministic checksum-verified data bootstrap script.

**M6.2 · Hard · Defense · 30-Minute Cold Whiteboard Defense (Two Research Repos).** Deliver two unassisted 15-minute whiteboard defenses—one on `Wearable-Sensor-Data-Analytics` and one on `Prompt-Routing-Research-Journal`—covering metrics, leakage controls, architecture trade-offs, and failure modes.

## Hints (Read Only After 30 Minutes of Unassisted Effort)

| Exercise | Targeted Hint |
|---|---|
| M1.1 | Fit `StandardScalerNP` strictly inside the `for train_idx, val_idx in splits:` loop, never on `X` beforehand. |
| M1.2 | Set `reg[-1, -1] = 0.0` in the augmented Ridge matrix and omit `lam * b` from `grad_b` in SGD. |
| M2.1 | Subtract `Z2.max(axis=1, keepdims=True)` before `np.exp` and remember `dZ2 = (P - Y_onehot) / N`. |
| M2.2 | Use `np.float64` throughout gradient checking and evaluate `(L(x+eps) - L(x-eps)) / (2*eps)` with `eps = 1e-6`. |
| M3.1 | Call `model.eval()` before `torch.onnx.export` so Dropout/BatchNorm freeze into deterministic inference behavior. |
| M3.2 | Check `math.isfinite(x)` inside a Pydantic v2 `@field_validator` because JSON/Python floats accept `NaN`/`Infinity` unless rejected. |
| M4.1 | Exclude `torch` from `requirements-serve.txt`—only install `fastapi`, `uvicorn`, `pydantic`, `numpy`, and `onnxruntime`. |
| M4.2 | Warm up 20 requests before timing, use `np.percentile(latencies, [50, 95, 99])`, and test `intra_op_num_threads=1` vs `2` under multi-worker uvicorn. |
| M5.1 | Clip bin proportions to `1e-6` before `np.log(a_pct / e_pct)` so empty production bins never yield `inf` or `nan`. |
| M5.2 | In GitHub Actions, verify image size via `docker image inspect --format='{{.Size}}' img` and assert `< 471859200` bytes (450 MB). |
| M6.1 | Always test `git filter-repo` on a fresh clone first and verify `git log --stat` + `git count-objects -vH` before touching origin. |
| M6.2 | Structure each 15-min defense into 3m Problem/Metric -> 4m Leakage/Data -> 4m Model/Math -> 4m Failures/Deployment. |

## Verification Rubrics & Solution Checkpoints

### M1.1 Leak-Free CV Checkpoint
Confirm constant feature column produces `0.0` (no `NaN`), LOSO puts zero shared subject IDs across train/val, and leakage experiment reproduces measurable metric inflation.

### M1.2 Ridge & Logistic SGD Checkpoint
Confirm bias term receives zero penalty and both `w` and `b` match `sklearn` (`Ridge` / `LogisticRegression`) within `1e-3` tolerance.

### M2.1 Pure-NumPy MLP Checkpoint
Confirm loss decreases monotonically across epochs with zero `NaN` warnings and validation accuracy exceeds 95% on a 3-class non-linear dataset.

### M2.2 Gradient Checker & Norms Checkpoint
Confirm `max_rel_err < 1e-6` for all four tensors (`W1, b1, W2, b2`) and RevIN preserves per-window denormalization invertibility within `1e-6`.

### M3.1 ONNX Parity Checkpoint
Confirm `np.testing.assert_allclose` passes for batch sizes `1`, `8`, and `32` with `rtol=1e-4, atol=1e-5`.

### M3.2 FastAPI Lifespan Service Checkpoint
Confirm `POST /v1/predict` returns `422` on `[NaN]`, `[Inf]`, and ragged arrays, `200` on valid windows, and `/ready` reports `200` only after model load.

### M4.1 Slim Docker Checkpoint
Confirm `docker images` shows `< 450 MB`, container user is `appuser`, and `/ready` passes inside the running container.

### M4.2 Latency Benchmark Checkpoint
Confirm benchmark script prints reproducible `p50`, `p95`, `p99`, and RPS table at concurrency `1`, `8`, and `32` with zero HTTP 5xx errors.

### M5.1 PSI Drift Checkpoint
Confirm identical distributions score `< 0.02`, shifted distributions score `> 0.25`, and empty bins never produce `NaN`.

### M5.2 MLflow & ML CI Checkpoint
Confirm MLflow UI/store logs params, metrics, and ONNX artifact, and GitHub Actions workflow passes end-to-end.

### M6.1 Repo De-Bloat Checkpoint
Confirm zero `.npz` files remain in history (`git rev-list --objects --all | grep '\.npz'` empty) and repository size is compact.

### M6.2 Cold Whiteboard Defense Checkpoint
Confirm you answered all 5 defense axes for both `Wearable-Sensor-Data-Analytics` and `Prompt-Routing-Research-Journal` cleanly under 15 minutes each without notes.

## Progress Tracker

<<TRACKER>>
