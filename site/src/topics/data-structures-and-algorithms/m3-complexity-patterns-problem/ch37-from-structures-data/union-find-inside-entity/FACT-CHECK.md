# FACT-CHECK — Union-find inside entity resolution

| # | Claim | Checked against |
|---|---|---|
| 1 | `cluster_pairwise_predictions_at_threshold` clusters pairwise match predictions into groups of connected records using the connected components algorithm, with a match-probability threshold deciding matches | Splink `clustering.html`, quoted word for word |
| 2 | GraphFrames' `connectedComponents` computes the connected components of a graph, with parameters `algorithm`, `checkpointInterval`, `broadcastThreshold`, etc. | `graphframes.html`, quoted word for word |
| 3 | GraphFrames' current default algorithm is `'graphframes'`, a deprecated alias for `'two_phase'`; `'randomized_contraction'` and `'graphx'` are also supported | `graphframes.html`, quoted word for word |
| 4 | Kiveris, Lattanzi, Mirrokni, Rastogi and Vassilvitskii, "Connected Components in MapReduce and Beyond", ACM Symposium on Cloud Computing, 2014, DOI 10.1145/2670979.2670997 | Crossref metadata API, quoted word for word (title, first author, DOI) |
| 5 | The DOI landing page for the Kiveris paper returns HTTP 403 through this project's fetch tool | `node scripts/sources.mjs check`, run directly, confirmed the failure before switching to the Crossref API URL |
| 6 | Union by size with path compression gives each record's entity id as the root of its parent-pointer tree | `examples.py`, `UnionFind.find`/`UnionFind.union`, implemented and exercised directly |
| 7 | On the chapter's 24-record match graph (three groups of eight, two weak bridging pairs at scores 0.58 and 0.62), the largest cluster size at thresholds 0.50/0.55/0.59/0.60/0.63/0.70 is 24/24/16/16/8/8 | `examples.py`, `SWEEP_RESULTS`/`LARGEST_CLUSTER_SIZE_BY_THRESHOLD`, asserted directly |
| 8 | Record 0's entity id changes at least once as the 26 scored pairs are unioned in score-descending order | `examples.py`, `REPRESENTATIVE_TRACE`, asserted directly (`len(set(...)) > 1`) |
| 9 | The chapter's small lineage graph (7 edges, 9 nodes: orders/customers/revenue versus inventory/alerts) splits into connected components of size 6 and 3 | `examples.py`, `LINEAGE_COMPONENT_SIZES`, asserted directly |
| 10 | A label-propagation loop (each node adopts the minimum label among itself and its neighbors, round by round) on the identical match graph at threshold 0.60 converges to the same clustering (sizes 16 and 8) as union-find, but takes 10 rounds against union-find's 1 pass | `examples.py`, `LPA_ROUNDS`/`LPA_SIZES`, asserted directly |
| 11 | Chapter 11's `dsa.union-find` already introduces `union-by-rank-or-size`, `path-compression` and the O(α(n)) bound, and cites Tarjan 1979 for the matching lower bound | `dsa.union-find/SOURCES.md`, read directly |

## Red-team pass

- **Is the two-bridge match graph engineered to produce a clean result, overclaiming how
  "typical" a real match graph's over-merge looks?** The reel, post-notes and this topic's
  "Questions worth sitting with" section all state directly that the graph was built with two
  deliberately weak bridges and nothing in between, and that a real matcher's scores rarely
  look this clean — the claim is scoped to this one measured graph, not generalized.
- **Does the "no split" claim overstate union-find's limitation — could path compression or
  union-by-size somehow support an inverse operation?** Checked directly against the
  implementation: `union` discards the information (which specific edge, in what order) that
  any undo would need; neither path compression nor union-by-size changes this, since both are
  about making `find`/`union` fast, not about retaining merge history.
- **Is the "ten rounds" number specific to this one graph, or stated as if it generalizes?**
  Stated as a measurement on the chapter's own 24-record graph only; post-notes' own "At the
  frontier" section explicitly calls the graph "far too small" to speak to real distributed
  rounds-versus-communication trade-offs, pointing to the Kiveris citation instead of
  extrapolating from the measured number.
- **Does citing the GraphFrames algorithm names risk going stale again, the way the chapter
  plan's own provisional name already did?** The topic states the names as read at a specific
  research date (2026-11-07) and notes in OUTLINE.md that the API had already changed once
  between planning and research — the same caution CHAPTER.md itself asks for ("read at
  research time... no default is asserted from this plan" pattern used elsewhere in this
  chapter) is applied here too.

## Corrections applied

1. CHAPTER.md's provisional description of GraphFrames' `connectedComponents` default algorithm
   as simply `'graphframes'`, run iteratively with periodic checkpoints, was updated after
   research-time reading found the library now exposes `'two_phase'` and
   `'randomized_contraction'` as named algorithms, with `'graphframes'` kept only as a
   deprecated alias (claim #3, OUTLINE.md → "Changes from the chapter plan").
2. The Kiveris et al. 2014 citation was verified against Crossref's metadata API rather than the
   DOI landing page, after the landing page returned HTTP 403 through this project's fetch tool
   (claim #5); the citation itself (title, authors, venue, year, DOI) matches exactly.
