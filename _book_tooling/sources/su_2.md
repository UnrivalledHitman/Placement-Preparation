# Chapter 5: More Advanced ML
%Time-series basics, deep learning in Keras and PyTorch, CNN and RNN shape arithmetic, and how SHAP explains a prediction

## 5.1 Time series

A time series is ordered in time, so its observations are not independent: today's sales depend on yesterday's. It typically combines **trend**, **seasonality** (repeating patterns), cycles and noise.

```python run Decompose a monthly series, build lag features, and compare forecasts on a time-based split
import numpy as np
import pandas as pd
from statsmodels.tsa.seasonal import seasonal_decompose

rng = np.random.default_rng(5)
idx = pd.date_range('2021-01-01', periods=48, freq='MS')
sales = pd.Series(200 + 3 * np.arange(48) + 25 * np.sin(2 * np.pi * np.arange(48) / 12)
                  + rng.normal(0, 6, 48), index=idx).round(1)
parts = seasonal_decompose(sales, model='additive', period=12)
print('trend rises by about', round(parts.trend.dropna().diff().mean(), 2), 'per month')
print('seasonal effect, Jan..Jun:', parts.seasonal.iloc[:6].round(1).tolist())

df = pd.DataFrame({'y': sales})
df['lag_1'] = df['y'].shift(1)                 # last month
df['lag_12'] = df['y'].shift(12)               # same month last year
df['ma_3'] = df['y'].shift(1).rolling(3).mean()   # mean of the previous 3 months
train, test = df.iloc[:36], df.iloc[36:]       # never shuffle time series
mae = lambda pred: float(np.mean(np.abs(test['y'] - pred)))
print(f"MAE  naive (last month): {mae(test['lag_1']):.1f}")
print(f"MAE  3-month moving average: {mae(test['ma_3']):.1f}")
print(f"MAE  seasonal naive (same month last year): {mae(test['lag_12']):.1f}")
growth = (train['y'] - train['lag_12']).mean()
print(f"MAE  seasonal naive + yearly growth: {mae(test['lag_12'] + growth):.1f}")
```

The result is instructive. The plain seasonal naive forecast ("same month last year") is the **worst** here: with a trend of about 3 per month, every month is roughly 36 higher than a year earlier, so copying last year is always too low. Last month's value does better because it is only one month of trend behind, and the moving average is worse because it averages over the seasonal swing. Adding the average yearly growth to the seasonal naive forecast captures both components, trend and seasonality, and gives by far the lowest error. Good forecasts model every component the series has. Every feature uses only **past** values (`shift`), and the split is by time: evaluating on randomly shuffled rows would leak the future.

| Concept | Meaning |
|---|---|
| Stationarity | Constant mean and variance over time; many models (ARIMA) need it; differencing removes trend |
| ARIMA(p, d, q) | AutoRegressive terms (p lags), Integrated (d differences), Moving-Average terms (q past errors); SARIMA adds seasonality |
| Exponential smoothing (Holt–Winters) | Weighted averages favouring recent data, with trend and seasonal components |
| ML approach | Lag and rolling features plus gradient boosting; Prophet; LSTMs or transformers for long, complex series |
| Validation | Walk-forward or `TimeSeriesSplit`; metrics MAE, RMSE, MAPE |

## 5.2 Deep learning in Keras

```python run A Keras Sequential classifier (Keras 3 on the PyTorch backend), with parameter counts
import os
os.environ['KERAS_BACKEND'] = 'torch'
import keras, torch
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
torch.set_num_threads(1)
keras.utils.set_random_seed(0)

X, y = make_moons(n_samples=1000, noise=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
model = keras.Sequential([
    keras.Input(shape=(2,)),
    keras.layers.Dense(16, activation='relu'),
    keras.layers.Dropout(0.2),
    keras.layers.Dense(8, activation='relu'),
    keras.layers.Dense(1, activation='sigmoid'),
])
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
for layer in model.layers:
    print(f'{layer.name:<10} params {layer.count_params()}')
print('total parameters:', model.count_params())
history = model.fit(X_tr, y_tr, epochs=60, batch_size=32, validation_split=0.2, verbose=0)
loss, acc = model.evaluate(X_te, y_te, verbose=0)
print(f"epochs run: {len(history.history['loss'])}, test accuracy {acc:.3f}")
```

Both frameworks train the same 193-parameter network in 5.3, but this Keras run uses dropout, mini-batches and the default learning rate (0.001) for 60 epochs, while the PyTorch run uses a larger learning rate on full batches; the accuracy difference comes from those settings, not from the framework. A `Dense(16)` layer on 2 inputs has 2 × 16 weights + 16 biases = 48 parameters; the next has 16 × 8 + 8 = 136; the output 8 + 1 = 9; dropout has none. The workflow is always **define → compile (optimizer, loss, metrics) → fit (epochs, batch size, validation) → evaluate → predict**.

| Task | Output layer | Loss |
|---|---|---|
| Binary classification | `Dense(1, activation='sigmoid')` | `binary_crossentropy` |
| Multi-class, integer labels | `Dense(k, activation='softmax')` | `sparse_categorical_crossentropy` |
| Multi-class, one-hot labels | `Dense(k, activation='softmax')` | `categorical_crossentropy` |
| Regression | `Dense(1)` (linear) | `mse` or `mae` |

Useful callbacks: `EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)` and `ModelCheckpoint`.

## 5.3 The same model in PyTorch

```python run A PyTorch training loop: forward, loss, backward, step
import torch
from torch import nn
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
torch.manual_seed(0); torch.set_num_threads(1)

X, y = make_moons(n_samples=1000, noise=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)
X_tr, X_te = torch.tensor(X_tr, dtype=torch.float32), torch.tensor(X_te,
        dtype=torch.float32)
y_tr, y_te = torch.tensor(y_tr, dtype=torch.float32), torch.tensor(y_te,
        dtype=torch.float32)

class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(nn.Linear(2, 16), nn.ReLU(), nn.Linear(16, 8),
                nn.ReLU(),
                                    nn.Linear(8, 1))
    def forward(self, x):
        return self.layers(x).squeeze(1)             # raw scores (logits)

model = Net()
loss_fn = nn.BCEWithLogitsLoss()   # sigmoid + binary cross-entropy, stable
opt = torch.optim.Adam(model.parameters(), lr=0.01)
for epoch in range(1, 201):
    model.train()
    opt.zero_grad()                                  # 1. clear old gradients
    loss = loss_fn(model(X_tr), y_tr)                # 2. forward pass and loss
    loss.backward()                                  # 3. backpropagation
    opt.step()                                       # 4. update weights
    if epoch in (1, 50, 200):
        print(f'epoch {epoch:>3}: training loss {loss.item():.3f}')
model.eval()
with torch.no_grad():                                # no gradient tracking for evaluation
    acc = ((model(X_te) > 0).float() == y_te).float().mean().item()
print('parameters:', sum(p.numel() for p in model.parameters()), ' test accuracy:',
        round(acc, 3))
```

| PyTorch idiom | Why |
|---|---|
| `class Net(nn.Module)` with `__init__` and `forward` | Define layers, then the computation |
| `opt.zero_grad()` before `loss.backward()` | Gradients accumulate by default |
| `model.train()` / `model.eval()` | Switch dropout and batch-norm behaviour |
| `torch.no_grad()` | Inference without building a graph |
| `BCEWithLogitsLoss` / `CrossEntropyLoss` | Take raw logits; apply sigmoid/softmax internally |
| `DataLoader(dataset, batch_size, shuffle=True)` | Mini-batches for real datasets |

## 5.4 CNN and RNN shape arithmetic

For a convolution, **output size = (W − K + 2P) / S + 1** for input width W, kernel K, padding P and stride S. A Conv2D layer has **(K × K × input channels + 1) × filters** parameters, independent of the image size.

```python run Output shapes and parameter counts for a small CNN and an LSTM
import torch
from torch import nn
torch.manual_seed(0)
cnn = nn.Sequential(
    nn.Conv2d(1, 8, kernel_size=3),               # 28x28x1 -> 26x26x8
    nn.ReLU(), nn.MaxPool2d(2),                   # -> 13x13x8
    nn.Conv2d(8, 16, kernel_size=3, padding=1),   # 'same' padding keeps 13x13
    nn.ReLU(), nn.MaxPool2d(2),                   # -> 6x6x16
    nn.Flatten(), nn.Linear(16 * 6 * 6, 10))
x = torch.zeros(4, 1, 28, 28)                     # batch of 4 grayscale 28x28 images
for layer in cnn:
    x = layer(x)
    n = sum(p.numel() for p in layer.parameters())
    print(f'{layer.__class__.__name__:<9} -> {tuple(x.shape)}   params {n}')
lstm = nn.LSTM(input_size=5, hidden_size=12, batch_first=True)
out, (h, c) = lstm(torch.zeros(4, 7, 5))          # batch 4, sequence length 7, 5 features
print('LSTM output', tuple(out.shape), 'last hidden', tuple(h.shape),
      'params', sum(p.numel() for p in lstm.parameters()))
```

The first convolution has (3 × 3 × 1 + 1) × 8 = 80 parameters and the second (3 × 3 × 8 + 1) × 16 = 1,168, while the final dense layer has 576 × 10 + 10 = 5,770: convolutions share weights across positions, which is why CNNs need far fewer parameters than dense networks on images. An LSTM returns one hidden vector per time step plus the final hidden and cell states; it has 4 gates, each with input and recurrent weights: 4 × (5 × 12 + 12 × 12 + 12 + 12) = 912 parameters (PyTorch keeps two bias vectors).

## 5.5 How SHAP explains a prediction

**SHAP** values attribute a prediction to features using Shapley values from game theory: a feature's value is its average marginal contribution over all orders in which features could be added. They sum to the difference between this prediction and the average prediction. For small models they can be computed exactly:

```python run Exact Shapley values for a three-feature model, by enumerating feature orders
from itertools import permutations

def model(income, debt, age):                         # a toy credit score
    return 0.5 * income - 0.8 * debt + 0.1 * age + 0.002 * income * age

baseline = {'income': 50, 'debt': 20, 'age': 35}       # average customer
customer = {'income': 80, 'debt': 10, 'age': 30}
features = list(customer)

def value(coalition):   # features in the coalition take the customer's values
    x = {f: (customer[f] if f in coalition else baseline[f]) for f in features}
    return model(**x)

shap = {f: 0.0 for f in features}
orders = list(permutations(features))
for order in orders:
    present = set()
    for f in order:
        shap[f] += (value(present | {f}) - value(present)) / len(orders)
        present.add(f)
print({f: round(v, 2) for f, v in shap.items()})
print('sum of SHAP values:', round(sum(shap.values()), 2),
      '| prediction - baseline:', round(model(**customer) - model(**baseline), 2))
```

The three values add up exactly to how far this customer's score is from the average customer's, which is SHAP's defining property (local accuracy). The `shap` library computes the same quantities efficiently (TreeExplainer for tree ensembles). **LIME** instead fits a simple local model around one prediction; **partial dependence plots** show the average effect of one feature; permutation importance (guide, Chapter 7) ranks features globally.

## 5.6 Practical lessons

- Time series: trend + seasonality + noise; lag features from the past only; split by time; seasonal naive is a strong baseline.
- Keras: define → compile → fit → evaluate; sigmoid + binary cross-entropy, softmax + categorical cross-entropy.
- PyTorch loop: zero_grad → forward → loss → backward → step; `eval()` and `no_grad()` for inference.
- Conv output = (W − K + 2P)/S + 1; Conv2D params = (K·K·C_in + 1)·filters; Dense params = in·out + out.
- SHAP values sum to prediction minus baseline; LIME fits a local surrogate.
