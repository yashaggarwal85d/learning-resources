# References

- Apache Iceberg Documentation, "Branching and Tagging": https://iceberg.apache.org/docs/latest/branching/
- AWS Big Data Blog, "Write-audit-publish pattern with Apache Iceberg branching": https://aws.amazon.com/blogs/big-data/

Last verified: 2026-10-31. Expert sign-off: pending.

Source substitution: CHAPTER.md's stated scope named Tabular.io's own apache-iceberg-cookbook write-up on write-audit-publish as a candidate source; that URL now 301-redirects to Databricks's own site (Tabular was acquired by Databricks), so it was dropped in favor of AWS's own Big Data Blog post on the identical WAP-with-Iceberg-branching pattern, a legitimate primary engineering source on the same mechanism. CHAPTER.md also named Netflix's and Apple's own published engineering write-ups on WAP as candidate sources; neither was reachable or independently located in this sandbox, so this topic is sourced instead from Iceberg's own specification documentation plus the AWS write-up, both read and quoted directly.

Software run in this sandbox: Python 3 standard library for a real `SnapshotTable` class modeling Iceberg's own branch/snapshot/fast-forward mechanism, a real diff-and-tolerance audit reusing topic 16's technique, a blue-green pointer swap, a shadow-run diff, a canary rollout measured by partition, a feature-flagged transform toggle, and a time-travel rollback -- all run against a synthetic table modeled on the shop's own `fct_orders`. Every quote is verified word for word against the fetched source text.
