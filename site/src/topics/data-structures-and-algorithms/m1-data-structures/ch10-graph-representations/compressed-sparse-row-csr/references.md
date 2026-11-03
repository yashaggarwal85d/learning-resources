Last verified: 2026-11-03. Expert sign-off: pending.

- "Sparse matrix" (Wikipedia) — CSR's and CSC's own three/two-array layouts, the format this topic's two arrays specialise to the unweighted-graph case. [source](https://en.wikipedia.org/wiki/Sparse_matrix)
- "Cuthill–McKee algorithm" (Wikipedia) — RCM's own relabelling procedure and its peripheral-vertex starting rule. [source](https://en.wikipedia.org/wiki/Cuthill%E2%80%93McKee_algorithm)
- "Optimizing Cache Performance for Graph Analytics" (Zhang, Kiriansky, Mendis, Zaharia, Amarasinghe; arXiv:1608.01362v2) — degree-sort reordering's own published measurement, the real-world result this topic's own smaller-scale measurement reproduces the mechanism of, not the exact figure. [source](https://arxiv.org/abs/1608.01362v2)
- "Community structure" (Wikipedia) — the formal definition of a graph community, behind community-order reordering. [source](https://en.wikipedia.org/wiki/Community_structure)

The chapter's own small graph (6 vertices, 10 edges, identical to topic 36's) and the 2,000,000-vertex synthetic graph's own measured cache-line counts (1,995 before reordering, 250 after, an 8.0&times; drop) are computed and asserted in this topic's `examples.py`.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=compressed-sparse-row-csr:%20).
