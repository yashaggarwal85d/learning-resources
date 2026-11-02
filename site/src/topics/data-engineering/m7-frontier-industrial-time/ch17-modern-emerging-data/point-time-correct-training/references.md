Last verified: 30 October 2026. Expert sign-off: pending. Two real measured experiments run in
this sandbox (`examples.py`, against this sandbox's own Postgres cluster): a synthetic churn
dataset with engineered temporal and post-outcome leakage, naive join AUC measured against as-of
join AUC; and both documented point-in-time-join TTL edge cases (too early, too stale), confirmed
to join to null rather than the nearest available value.

- Google for Developers, "Rules of Machine Learning": [developers.google.com](https://developers.google.com/machine-learning/guides/rules-of-ml). Rule #31 (a joined table's data can change between training and serving) and Rule #32 (reuse code between training and serving pipelines), quoted directly.
- Feast documentation, "Point-in-time joins" (v0.59-branch): [docs.feast.dev](https://docs.feast.dev/v0.59-branch/getting-started/concepts/point-in-time-joins). The as-of join mechanism and the TTL's reference frame (relative to each label's own timestamp, never to query time), quoted directly.
- Hex, "Feature leakage in ML: Detect, Prevent, and Fix It": [hex.tech](https://hex.tech/blog/feature-leakage/). The definition of a post-outcome field and its causal test, quoted directly.
- This course's own Chapter 2 topic, "Point-in-time and as-of joins" (`de.point-in-time-as-of-joins`, live): the as-of join mechanism and `temporal-leakage`, reused by id, not re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=point-time-correct-training:%20).
