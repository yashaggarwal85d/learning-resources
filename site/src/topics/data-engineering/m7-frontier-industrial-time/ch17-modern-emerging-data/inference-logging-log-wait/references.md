Last verified: 30 October 2026. Expert sign-off: pending. Three real measured experiments run in
this sandbox (`examples.py`, against this sandbox's own Postgres cluster): a log-and-wait join
checked for zero mismatches against the logged value, a storage-cost estimate from stated request-
rate and vector-width numbers, and a cardinality check on redacted logged vectors.

- Google for Developers, "Rules of Machine Learning": [developers.google.com](https://developers.google.com/machine-learning/guides/rules-of-ml). Rule #29 (log served features for training), quoted directly.
- AWS Prescriptive Guidance, "7. Continuous deployment" (MLOps checklist): [docs.aws.amazon.com](https://docs.aws.amazon.com/prescriptive-guidance/latest/mlops-checklist/continuous-deployment.html). The canary and shadow deployment definitions, quoted directly.
- Tecton documentation, "Create and Manage Datasets": [docs.tecton.ai](https://docs.tecton.ai/docs/reading-feature-data/reading-feature-data-for-training/creating-and-managing-datasets). A real feature-store vendor's own feature-logging mechanism, quoted directly.
- This course's own topic 2, "Feature stores and online/offline consistency" (`de.feature-stores-online-offline`, held): the three named skew causes, reused by id, not re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=inference-logging-log-wait:%20).
