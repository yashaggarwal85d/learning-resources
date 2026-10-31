## Evidently AI documentation — Customize Data Drift

URL: https://docs.evidentlyai.com/metrics/customize_data_drift

> ks
> Kolmogorov–Smirnov (K-S) test
> tabular data
> only numerical
>
> Default method for numerical data, if ≤ 1000 objects
> returns p_value
> drift detected when p_value < threshold
> default threshold: 0.05

> psi
>  Population Stability Index (PSI)
> tabular data
> numerical and categorical
> returns psi_value
> drift detected when psi_value ≥ threshold
> default threshold: 0.1

> jensenshannon
>  Jensen-Shannon distance
> tabular data
> numerical and categorical
>
> Default method for categorical, if > 1000 objects
> returns distance
> drift detected when distance ≥ threshold
> default threshold: 0.1

## Wikipedia — Jensen–Shannon divergence

URL: https://en.wikipedia.org/wiki/Jensen%E2%80%93Shannon_divergence

> The Jensen–Shannon divergence (JSD) is a symmetrized and smoothed version of the Kullback–Leibler divergence

> The Jensen–Shannon divergence is bounded by 1 for two discrete probability distributions, given that one uses the base 2 logarithm:

> The square root of the Jensen–Shannon divergence is a metric often referred to as Jensen–Shannon distance.

## Wikipedia — Kolmogorov–Smirnov test

URL: https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test

> The two-sample K–S test is one of the most useful and general nonparametric methods for comparing two samples, as it is sensitive to differences in both location and shape of the empirical cumulative distribution functions of the two samples.
