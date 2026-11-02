# Fact-check — de.drift-label-delay-monitoring

## Claims table

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Evidently's KS test defaults to a p-value threshold of 0.05, used by default for numerical columns at ≤1000 objects. | Evidently AI docs, Customize Data Drift | Verified, quoted |
| 2 | Evidently's PSI flags drift when `psi_value` ≥ its default threshold of 0.1. | Evidently AI docs, Customize Data Drift | Verified, quoted |
| 3 | Evidently's Jensen-Shannon distance flags drift at `distance` ≥ its default threshold of 0.1, and is the default method for categorical columns above 1000 objects. | Evidently AI docs, Customize Data Drift | Verified, quoted |
| 4 | Jensen-Shannon divergence is a symmetrized, smoothed version of KL divergence. | Wikipedia, Jensen-Shannon divergence | Verified, quoted |
| 5 | Jensen-Shannon divergence is bounded by 1 for two discrete distributions when using the base-2 logarithm. | Wikipedia, Jensen-Shannon divergence | Verified, quoted |
| 6 | The square root of the Jensen-Shannon divergence is itself a metric, called the Jensen-Shannon distance. | Wikipedia, Jensen-Shannon divergence | Verified, quoted |
| 7 | The two-sample KS test compares two samples' empirical CDFs directly, without binning, sensitive to both location and shape differences. | Wikipedia, Kolmogorov-Smirnov test | Verified, quoted |
| 8 | All three tests (hand-implemented PSI, KS statistic, JS distance) agree cleanly on an engineered mean-shift case. | This topic's own examples.py (NumPy, measured) | Measured in this sandbox |
| 9 | A feature's PSI can stay near zero (0.007) while a fixed decision rule's precision collapses (1.00 → 0.00) when only the label relationship moved, not the feature. | This topic's own examples.py (NumPy, measured) | Measured in this sandbox |
| 10 | Mean-imputing a ~12% null rate keeps PSI on the imputed column under the 0.1 flag threshold (0.091 measured), while the null rate itself (11.8%) is clearly elevated and directly checkable. | This topic's own examples.py (NumPy, measured) | Measured in this sandbox |
| 11 | A narrowly concentrated shift (4% of rows collapsed onto one value) registers a higher KS statistic (0.022) than PSI (0.012) on the identical data. | This topic's own examples.py (NumPy, measured) | Measured in this sandbox |

## Currency check

- Evidently AI's documented default thresholds (PSI 0.1, KS p-value 0.05, Jensen-Shannon distance
  0.1) are read from its live "Customize Data Drift" docs page at research time (30 October 2026)
  and are explicitly stated as defaults, not laws — this topic presents them as one real,
  documented convention to calibrate against, exactly as CHAPTER.md's scope line requires ("read
  for the convention, not asserted as a standard").
- The Jensen-Shannon boundedness claim is stated precisely as the source states it: bounded by 1
  specifically under the base-2 logarithm, not unconditionally — the topic does not claim a
  universal [0,1] bound regardless of log base, since the source itself notes the bound's
  conditions vary by variant and log base.
- This course's own PSI/KS/JS implementations are pure NumPy, written for this topic because the
  sandbox has no scipy; they follow each test's standard definition (PSI's binned
  log-ratio-weighted-by-difference sum, KS's maximum empirical-CDF gap, JS's symmetrized KL via
  the mixture distribution) and are not claimed to be any vendor's exact numerical implementation.

## Red team

1. **Is it fair to call the null-rate-creep result "silent" if PSI on the imputed column did rise
   to 0.091 — close to the 0.1 threshold?** The claim is precise: PSI stayed *under* the flag
   threshold at this null rate, not that it stayed at zero. The topic's point is that the margin is
   thin and disappears as either the null rate or the threshold's exact value varies slightly —
   which is itself the argument for a direct null-rate check rather than trusting a distributional
   test to always catch it indirectly.
2. **Does the concept-drift experiment's precision collapse (1.00 → 0.00) look artificially
   extreme?** It is deliberately extreme because the experiment fully inverts the label rule (what
   predicted "retained" now predicts "churned") to make the structural point unambiguous — a
   partial concept shift would show a smaller, noisier precision drop with the same PSI-stays-quiet
   property, but would make the demonstration harder to read, not different in kind.
3. **Does the PSI-vs-KS disagreement case prove KS is simply "better"?** No — the topic does not
   claim either test is superior; it reproduces one specific, narrow shift shape (a thin spike)
   where KS's full-resolution comparison happens to register more than PSI's coarser binning. A
   different shift shape (e.g., a shift concentrated at a bin edge PSI's quantile binning already
   splits on) could show the opposite. The claim is "they can disagree," reproduced directly, not
   "one is always right."
4. **Is Jensen-Shannon distance (the square root) the same thing as Jensen-Shannon divergence?**
   No, and the topic is careful about this: the source distinguishes them explicitly (the
   divergence vs. its square root, called the distance, which is a metric). This topic's own
   `jensen_shannon_distance` function computes the divergence and then takes the square root,
   matching the source's own distinction rather than conflating the two.
5. **Does Evidently's own JS-distance default method selection ("default for categorical, if
   >1000 objects") get misrepresented as a general recommendation for all data?** No — the claims
   table quotes the condition exactly as stated (categorical columns, above 1000 objects); the
   topic does not generalize it to numerical or small-sample cases.

## Problem Solving

No source substitutions were needed. Evidently AI's own documentation page was live and directly
quotable on the first attempt; Wikipedia's Jensen-Shannon divergence and Kolmogorov-Smirnov test
pages were live and directly quotable as the statistics references CHAPTER.md's sourcing line
calls for ("a statistics reference for the Kolmogorov-Smirnov test's definition," "a reference on
Jensen-Shannon divergence's boundedness and symmetry"). The one real engineering problem was
numerical, not sourcing: this sandbox has no scipy, so all three tests were implemented directly
in NumPy rather than called from a library, and each implementation's correctness was checked
against the obvious mean-shift case (claim 8) before being trusted on the subtler cases.
