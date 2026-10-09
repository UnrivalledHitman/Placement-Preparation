# Chapter 6: Time Series Forecasting
%Baselines first, backtesting with a rolling origin, exponential smoothing, SARIMA and boosted trees on lag features, metrics and intervals

## 6.1 The structure of a series

A time series usually combines a **trend** (long-run growth or decline), **seasonality** (patterns repeating with a fixed period: daily, weekly, yearly), **events** (holidays, promotions, outages) and **noise**. Forecasting differs from ordinary supervised learning in one crucial way: the future may only be predicted from the past, so **random train/test splits are forbidden**. They leak future information into training and make every model look better than it is.

The examples use two years of simulated daily electricity demand for a city: growth, a weekly cycle (lower at weekends), a yearly cycle (summer peak) and noise.

```python run Two years of daily demand and its decomposition
import numpy as np, pandas as pd
from statsmodels.tsa.seasonal import STL
rng = np.random.default_rng(30)
days = pd.date_range('2024-01-01', periods=730, freq='D')
t = np.arange(730)
weekly = np.array([4, 5, 5, 5, 4, -8, -15])[days.dayofweek]
yearly = 18 * np.sin(2 * np.pi * (t - 80) / 365)
demand = 200 + 0.05 * t + weekly + yearly + rng.normal(0, 4, 730)
series = pd.Series(demand, index=days, name='demand_mwh')
series.to_csv('demand.csv')
stl = STL(series, period=7, robust=True).fit()
print(series.describe()[['mean', 'std', 'min', 'max']].round(1).to_dict())
print('average weekly pattern (Mon..Sun):',
      stl.seasonal.groupby(series.index.dayofweek).mean().round(1).tolist())
print(f'trend: {stl.trend.iloc[30]:.1f} in Jan 2024, {stl.trend.iloc[-30]:.1f} in Dec 2025')
```

With period 7, STL separates the weekly pattern cleanly; the yearly cycle ends up inside its trend component, which therefore rises and falls with the seasons as well as growing.

## 6.2 Backtesting with a rolling origin

To evaluate a forecasting method, repeat what will happen in production: train on everything up to a date, forecast the next *h* days, move the origin forward, and repeat. Then average the errors. Always include **naive baselines**: "tomorrow equals today" and the **seasonal naive** "same day last week". A complex model that cannot beat them is not worth deploying.

```python run Five methods backtested over six 14-day horizons
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.statespace.sarimax import SARIMAX
from lightgbm import LGBMRegressor

y = pd.read_csv('demand.csv', index_col=0, parse_dates=True)['demand_mwh']
h, origins = 14, range(730 - 6 * 14, 730, 14)

def features(s):
    df = pd.DataFrame({'y': s})
    for lag in (14, 21, 28, 364):   # lags of at least h: no recursion needed
        df[f'lag{lag}'] = s.shift(lag)
    df['mean28_lag14'] = s.shift(14).rolling(28).mean()
    df['dow'] = s.index.dayofweek
    df['doy'] = s.index.dayofyear
    return df

def forecast(method, train, idx):
    if method == 'naive':
        return np.repeat(train.iloc[-1], h)
    if method == 'seasonal naive':
        return np.tile(train.iloc[-7:].to_numpy(), 2)
    if method == 'Holt-Winters':
        fit = ExponentialSmoothing(train, trend='add', seasonal='add',
                seasonal_periods=7).fit()
        return fit.forecast(h).to_numpy()
    if method == 'SARIMA':
        fit = SARIMAX(train, order=(1, 1, 1), seasonal_order=(1, 0, 1, 7)).fit(disp=False)
        return fit.forecast(h).to_numpy()
    if method == 'LightGBM lags':
        f = features(pd.concat([train, pd.Series(np.nan,
                index=idx)])).dropna(subset=['lag364'])
        tr, te = f[f.index <= train.index[-1]], f.loc[idx]
        m = LGBMRegressor(n_estimators=300, learning_rate=0.05, n_jobs=1, verbose=-1,
                random_state=0)
        m.fit(tr.drop(columns='y'), tr['y'])
        return m.predict(te.drop(columns='y'))

methods = ['naive', 'seasonal naive', 'Holt-Winters', 'SARIMA', 'LightGBM lags']
errors = {m: [] for m in methods}
for o in origins:
    train, test = y.iloc[:o], y.iloc[o:o + h]
    for m in methods:
        errors[m].append(np.mean(np.abs(forecast(m, train, test.index) - test.to_numpy())))
hist = y.iloc[:origins[0]].to_numpy()
scale = np.mean(np.abs(hist[7:] - hist[:-7]))           # seasonal-naive in-sample MAE
for m in methods:
    mae = np.mean(errors[m])
    print(f'{m:15} MAE {mae:5.2f} MWh  MASE {mae / scale:4.2f}  per-fold '
            f'{np.round(errors[m], 1)}')
```

All three models beat both baselines, and the simplest of them, Holt-Winters, is the best on average: on a series with clean trend and weekly seasonality, extra flexibility buys nothing. The gradient-boosted model, which must forecast 14 days ahead from lags of at least 14 days, comes last of the three. All three models do worst on the fourth fold, which falls in the steep autumn decline of the yearly cycle that the weekly models only follow with a delay.

**MASE** (mean absolute scaled error) divides the error by the in-sample error of the seasonal naive forecast, and it is comparable across series of different sizes. Values below 1 mean the forecast beats the baseline's **in-sample, one-step** error, a demanding standard: the seasonal naive forecast itself scores 1.10 here, because forecasting up to 14 days ahead out of sample is harder than repeating last week in hindsight. The fold-by-fold errors matter as much as the average: a method that is excellent on average but terrible in one season may be unusable.

## 6.3 Which model when

| Method | Strength | Weakness |
|---|---|---|
| Naive / seasonal naive | The baseline every method must beat | No trend, no events |
| Exponential smoothing (ETS, Holt-Winters) | Fast, robust, good with clear trend and seasonality | One seasonal period; no external drivers |
| ARIMA / SARIMA(X) | Models autocorrelation; external regressors via the X; prediction intervals | Needs stationarity checks; slow for long seasonal periods (such as 365) |
| Prophet-style additive models | Several seasonalities, holidays, changepoints, easy to explain | Often beaten by simpler methods; not a magic default |
| Gradient boosting on lag and calendar features | External features (weather, prices, promotions), many series at once (a **global** model) | Must engineer lags carefully; cannot extrapolate a trend beyond the training range |
| Deep learning (N-BEATS, TFT, foundation models) | Thousands of related series, complex patterns | Data-hungry, harder to debug; check against the baselines |

> TRAP: Tree models predict within the range of target values seen in training. On a strongly trending series, they flatten out at the training maximum. Model the trend separately (for example, predict differences or ratios to a moving average), or use a linear component.

## 6.4 Stationarity and differencing

ARIMA-family models assume a **stationary** series: constant mean and variance over time. Trends and seasonality break this; differencing (y<sub>t</sub> − y<sub>t−1</sub>, or y<sub>t</sub> − y<sub>t−7</sub> for weekly seasonality) usually restores it. The augmented Dickey–Fuller test checks for a unit root (non-stationarity).

```python run The ADF test before and after differencing
import pandas as pd
from statsmodels.tsa.stattools import adfuller
y = pd.read_csv('demand.csv', index_col=0, parse_dates=True)['demand_mwh']
for name, s in [('raw series', y), ('weekly difference', y.diff(7).dropna()),
                ('weekly + first difference', y.diff(7).diff().dropna())]:
    stat, p = adfuller(s, autolag='AIC')[:2]
    print(f'{name:26}: ADF statistic {stat:6.2f}, p = {p:.3f} -> '
          f'{"stationary" if p < 0.05 else "unit root not rejected"}')
```

## 6.5 Forecast metrics and intervals

| Metric | Formula | Watch out for |
|---|---|---|
| MAE | mean \|y − ŷ\| | In the units of the data; robust |
| RMSE | √mean (y − ŷ)<sup>2</sup> | Penalises large misses; sensitive to outliers |
| MAPE | mean \|y − ŷ\| / \|y\| | Explodes when actuals are near zero; penalises over-forecasts more than under-forecasts |
| sMAPE, WAPE | Symmetric or volume-weighted percentage error | WAPE (Σ\|error\| / Σ\|actual\|) is the safer business percentage |
| MASE | MAE / naive in-sample MAE | Scale-free; below 1 beats the baseline |
| Pinball (quantile) loss | Asymmetric loss for a chosen quantile | For intervals and stocking decisions |

A point forecast is rarely enough: a grid operator needs to know how high demand **could** go. Check that intervals have the **coverage** they claim on backtests.

```python run Do SARIMA's 90% intervals contain 90% of actual values?
import warnings; warnings.filterwarnings('ignore')
import numpy as np, pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
y = pd.read_csv('demand.csv', index_col=0, parse_dates=True)['demand_mwh']
inside, total, widths = 0, 0, []
for o in range(730 - 6 * 14, 730, 14):
    fit = SARIMAX(y.iloc[:o], order=(1, 1, 1), seasonal_order=(1, 0, 1, 7)).fit(disp=False)
    ci = fit.get_forecast(14).conf_int(alpha=0.10).to_numpy()
    actual = y.iloc[o:o + 14].to_numpy()
    inside += np.sum((actual >= ci[:, 0]) & (actual <= ci[:, 1])); total += 14
    widths.append(np.mean(ci[:, 1] - ci[:, 0]))
print(f'actuals inside the 90% interval: {inside} of {total} = {inside / total:.0%}')
print(f'average interval width: {np.mean(widths):.1f} MWh')
```

Coverage is 88% against a nominal 90%, close enough given only 84 forecast days, so these intervals can be trusted roughly as stated. Intervals that cover far less than claimed (common when a model ignores parameter uncertainty or regime changes) understate risk.

## 6.6 Practical lessons

- Never split time series randomly; backtest with a rolling origin.
- Start with naive and seasonal naive baselines; report MASE and per-fold errors.
- Use lags at least as long as the horizon, or forecast recursively; trees cannot extrapolate trends.
- Prefer MAE or WAPE to MAPE; check that prediction intervals achieve their nominal coverage.

# Chapter 7: Survival Analysis and Churn
%Censoring, the Kaplan–Meier estimator, Cox proportional hazards, and customer lifetime value from survival curves

## 7.1 Censoring breaks naive averages

"How long do customers stay?" sounds like an average. But on any given day, many customers have **not churned yet**: their lifetime is only known to be **at least** their current tenure. Such observations are **right-censored**. Both obvious shortcuts are biased:

- averaging only the customers who churned ignores the long-lived ones still active (too short);
- treating active customers' current tenure as their lifetime cuts them off early (also too short).

```python run Naive averages versus the truth under censoring
import numpy as np
rng = np.random.default_rng(31)
n = 5000
signup = rng.uniform(0, 24, n)                       # signed up over the last 24 months
lifetime = rng.weibull(1.3, n) * 18                  # true lifetimes in months
observed = np.minimum(lifetime, 24 - signup)         # what we can see today
churned = lifetime <= 24 - signup
print(f'true median lifetime                  : {np.median(lifetime):5.1f} months')
print(f'median over churned customers only    : {np.median(observed[churned]):5.1f}')
print(f'median treating active tenure as final: {np.median(observed):5.1f}')
print(f'share of customers still active (censored): {1 - churned.mean():.0%}')
np.save('surv.npy', np.vstack([observed, churned]))
```

## 7.2 The Kaplan–Meier estimator

The **survival function** S(t) is the probability of still being a customer at time t. Kaplan–Meier estimates it using every customer for as long as they are observed: at each churn time, S is multiplied by (1 − churns / customers still at risk). Censored customers count as "at risk" until they leave the observation window, and then simply drop out.

```python run Kaplan-Meier from scratch, checked against statsmodels
import numpy as np
from statsmodels.duration.survfunc import SurvfuncRight
observed, churned = np.load('surv.npy')
churned = churned.astype(bool)

def kaplan_meier(t, event):
    times = np.unique(t[event])
    s, curve = 1.0, []
    for u in times:
        at_risk = np.sum(t >= u)
        deaths = np.sum((t == u) & event)
        s *= 1 - deaths / at_risk
        curve.append((u, s))
    return np.array(curve)

km = kaplan_meier(observed, churned)
median = km[km[:, 1] <= 0.5][0, 0]
sm = SurvfuncRight(observed, churned)
for month in [6, 12, 18]:
    mine = km[km[:, 0] <= month][-1, 1]
    print(f'S({month:2} months): from scratch {mine:.3f}, statsmodels '
            f'{sm.surv_prob[sm.surv_times <= month][-1]:.3f}')
print(f'Kaplan-Meier median lifetime: {median:.1f} months (true median from 7.1: 13.8)')
```

Kaplan–Meier recovers a median far closer to the truth than either naive average, using exactly the same data. The curve becomes unreliable at long tenures where few customers remain at risk; report confidence bands and the number at risk.

## 7.3 Cox proportional hazards

To ask **which factors** shorten or lengthen lifetimes, model the **hazard** (the instantaneous churn rate among those still active). The Cox model assumes h(t | x) = h<sub>0</sub>(t) exp(β · x): covariates multiply a common baseline hazard, and exp(β) is the **hazard ratio**. It handles censoring correctly and needs no assumption about the shape of h<sub>0</sub>(t).

```python run Hazard ratios recovered by a Cox model
import numpy as np, pandas as pd
from statsmodels.duration.hazard_regression import PHReg
rng = np.random.default_rng(32)
n = 6000
df = pd.DataFrame({'basic_plan': rng.integers(0, 2, n), 'tickets': rng.poisson(1.5, n),
                   'annual_contract': rng.integers(0, 2, n)})
beta = np.array([0.5, 0.25, -0.9])                     # true log hazard ratios
rate = 0.04 * np.exp(df.to_numpy() @ beta)
lifetime = rng.exponential(1 / rate)
window = rng.uniform(0, 36, n)
time, event = np.minimum(lifetime, window), (lifetime <= window).astype(int)
fit = PHReg(time, df, status=event).fit()
for name, b, se, true in zip(df.columns, fit.params, fit.bse, beta):
    print(f'{name:16} hazard ratio {np.exp(b):.2f} (95% CI {np.exp(b - 1.96 * se):.2f}-'
          f'{np.exp(b + 1.96 * se):.2f}), true {np.exp(true):.2f}')
print(f'events observed: {event.sum()} of {n} ({1 - event.mean():.0%} censored)')
```

The estimated hazard ratio of 1.64 for the basic plan means basic-plan customers churn at a 64% higher rate at every tenure, other things equal; an annual contract cuts the rate to about 40%. Check the proportional-hazards assumption (for example, by plotting Kaplan–Meier curves per group on a log scale): if one group's churn is front-loaded and the other's back-loaded, a single ratio misleads.

## 7.4 From survival to lifetime value

**Customer lifetime value** (CLV) is the expected discounted margin over a customer's lifetime: CLV = Σ<sub>t</sub> margin × S(t) / (1 + d)<sup>t</sup>. Survival curves per segment turn directly into CLVs, which set how much a business can spend to acquire or retain each kind of customer.

```python run Lifetime value by plan from Kaplan-Meier curves
import numpy as np
from statsmodels.duration.survfunc import SurvfuncRight
rng = np.random.default_rng(33)
# (scale of lifetime in months, margin/month)
plans = {'basic': (12, 300), 'pro': (28, 900)}
monthly_discount = 0.01
for plan, (scale, margin) in plans.items():
    life = rng.weibull(1.2, 3000) * scale
    window = rng.uniform(0, 48, 3000)
    t, e = np.minimum(life, window), life <= window
    sf = SurvfuncRight(t, e)
    months = np.arange(1, 61)
    surv = np.array([sf.surv_prob[sf.surv_times <= m][-1] if np.any(sf.surv_times <= m)
            else 1.0
                     for m in months])
    clv = np.sum(margin * surv / (1 + monthly_discount) ** months)
    print(f'{plan:5}: S(12) = {surv[11]:.2f}, S(36) = {surv[35]:.2f}, '
          f'5-year CLV = Rs {clv:,.0f} per customer')
```

## 7.5 Practical lessons

- Lifetimes of active customers are censored: never average them naively.
- Kaplan–Meier estimates survival using every customer for as long as they are observed.
- Cox models give hazard ratios per factor; check the proportional-hazards assumption.
- Survival curves per segment give lifetime values, which bound acquisition and retention spend.
