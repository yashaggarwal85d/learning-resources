## Rules of Machine Learning (Google for Developers)

URL: https://developers.google.com/machine-learning/guides/rules-of-ml
Version: live page, fetched 2026-10-30

> Rule #29: The best way to make sure that you train like you serve is to save the set of features used at serving time, and then pipe those features to a log to use them at training time.

> Even if you can’t do this for every example, do it for a small fraction, such that you can verify the consistency between serving and training (see Rule #37). Teams that have made this measurement at Google were sometimes surprised by the results. YouTube home page switched to logging features at serving time with significant quality improvements and a reduction in code complexity, and many teams are switching their infrastructure as we speak.

Contents:
- Rule #29, in full: the fix topic 2 only pointed at — save the exact features used at serving time and log them, rather than recomputing from source tables at training time
- Google's own production evidence: even logging a small fraction of traffic is enough to verify training/serving consistency, and at least one real Google product (YouTube's home page) switched to this pattern with measured quality gains and less code complexity — used as evidence this isn't a theoretical fix

## 7. Continuous deployment (AWS Prescriptive Guidance, MLOps checklist)

URL: https://docs.aws.amazon.com/prescriptive-guidance/latest/mlops-checklist/continuous-deployment.html
Version: live page, fetched 2026-10-30

> For an ML system to be continuously deployed, it must be able to divert traffic from or between live models. A continuously deployed system has at least one way by which models are promoted to production: canary, shadow, blue/green, or A/B.

> The system can deploy by using a canary. A small portion of traffic is sent to the new model initially. Over time, all traffic shifts to the new model. This shift is closely monitored because the testing happens in the production environment.

> The system can run a shadow deployment in which the new model works alongside the existing model. Both models receive traffic, but only the earlier model outputs inference. Assessments are run on the new model compared with the existing model, and then the new model is manually promoted.

Contents:
- Canary deployment, AWS's own definition: a small, growing portion of real traffic is sent to the new model, and its output is acted on (served to users) from the start — risk is bounded by how much traffic is exposed, not by whether the output is used
- Shadow deployment, AWS's own definition: the new model receives the same real traffic as the existing one, but only the existing model's output is ever served; the new model's predictions are compared, never acted on — this is the clause this topic uses to distinguish shadow from canary precisely: traffic exposure is the same in spirit, but shadow withholds the decision entirely

## Create and Manage Datasets (Tecton documentation)

URL: https://docs.tecton.ai/docs/reading-feature-data/reading-feature-data-for-training/creating-and-managing-datasets
Version: live page, fetched 2026-10-30

> Feature Services have the ability to continuously log online requests and feature vector responses as Tecton Datasets. These logged feature datasets can be used for auditing, analysis, and training dataset generation.

> To enable feature logging on a Feature Service, simply add a LoggingConfig like in the example below and optionally specify a sample rate. Then run tecton apply to apply your changes.

Contents:
- A real feature-store vendor's own implementation of exactly this topic's mechanism: a Feature Service logs the request and the served feature vector response itself (not the raw input, the post-transformation output), accumulated into a dataset usable for training — a worked, production example of "log the exact vector the model scored," read for comparison and not assumed
- Logging is opt-in and sample-rate configurable, which is the production reality behind this topic's own storage-cost discussion: logging every served vector is a choice with a dial, not an all-or-nothing default
