# References

- Splink, "Clustering" API documentation.
  [clustering.html](https://moj-analytical-services.github.io/splink/api_docs/clustering.html)
  — fetched 2026-11-07. Read in full for `cluster_pairwise_predictions_at_threshold`'s own
  description of clustering as connected components over the pairwise match predictions.
- GraphFrames, "graphframes package" Python API documentation.
  [graphframes.html](https://graphframes.io/api/python/graphframes.html)
  — fetched 2026-11-07. Read for `connectedComponents`'s signature and parameters. The chapter
  plan's provisional default algorithm name (`'graphframes'`) is now a deprecated alias for the
  current default, `'two_phase'`, per this source (OUTLINE.md → "Changes from the chapter
  plan").
- Kiveris, Lattanzi, Mirrokni, Rastogi and Vassilvitskii, "Connected Components in MapReduce
  and Beyond", Proceedings of the ACM Symposium on Cloud Computing, 2014.
  [doi.org/10.1145/2670979.2670997](https://doi.org/10.1145/2670979.2670997) — citation checked
  against Crossref's metadata API (the DOI landing page itself returned HTTP 403 through this
  project's fetch tool); the paper's own content is not read or quoted, per the chapter plan.
- `dsa.union-find` (Chapter 11 topic 38, live): union by size, path compression and the
  O(α(n)) amortized bound are that topic's own result, reused directly here, not re-derived;
  this topic's `UnionFind` class re-implements the same structure rather than importing across
  topic folders, since the structure is a few lines.
- `dsa.topological-sort-inside-schedulers` (Chapter 37 topic 120, held): bridge text reused
  word for word, per the chapter plan.

Last verified: 2026-11-07. Expert sign-off: pending.
