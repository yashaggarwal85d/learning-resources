Last verified: 30 October 2026. Expert sign-off: pending. Four real measured experiments run in
this sandbox (`examples.py`, pure NumPy — no scipy in this sandbox): an obvious mean shift all
three tests agree on, a concept-drift case where PSI on the feature stays near zero while a fixed
rule's precision collapses, a null-rate creep hidden by mean-imputation, and a narrow shift where
PSI and KS disagree.

- Evidently AI documentation, "Customize Data Drift": [docs.evidentlyai.com](https://docs.evidentlyai.com/metrics/customize_data_drift). Each test's default method and flag threshold, quoted directly.
- Wikipedia, "Jensen–Shannon divergence": [en.wikipedia.org](https://en.wikipedia.org/wiki/Jensen%E2%80%93Shannon_divergence). Its definition, boundedness and metric property, quoted directly.
- Wikipedia, "Kolmogorov–Smirnov test": [en.wikipedia.org](https://en.wikipedia.org/wiki/Kolmogorov%E2%80%93Smirnov_test). The two-sample test's own description, quoted directly.
- This course's own topic 4, "Training-set versioning and lineage" (`de.training-set-versioning-lineage`, held): the reproducibility and label-version-drift vocabulary this topic builds on, reused by id, not re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=drift-label-delay-monitoring:%20).
