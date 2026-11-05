# FACT-CHECK: Prim's algorithm

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | NetworkX lists `'prim'` as a selectable algorithm choice for `minimum_spanning_tree` | NetworkX Documentation | Word-for-word quoted in `SOURCES.md`; `sources.mjs check` confirms it word for word |
| 2 | Jarník's algorithm grows a forest with exactly one nontrivial component, the rest isolated vertices | Erickson, *Algorithms* (2019), §7.4 | Word-for-word quoted in `SOURCES.md`; confirmed by `sources.mjs check` |
| 3 | The algorithm was first described by Jarník in a letter to Borůvka, published by Jarník the following year, and independently rediscovered afterward by Kruskal, (arguably) Prim, Loberman and Weinberger, and Dijkstra | Erickson, *Algorithms* (2019), §7.4 | Stated in this topic's own prose, sourced to Erickson's own account (not quoted verbatim, since the PDF drops the diacritics and years in this passage — see `SOURCES.md`'s Red team) |
| 4 | The lazy implementation uses a priority queue to hold the crossing edges, leaving ineligible edges on the queue and deferring the ineligibility test to removal | Sedgewick & Wayne, booksite §4.3 | Word-for-word quoted in `SOURCES.md`; confirmed by `sources.mjs check` |
| 5 | The eager implementation keeps only the minimum-weight edge per outside vertex on the queue | Sedgewick & Wayne, booksite §4.3 | Word-for-word quoted in `SOURCES.md`; confirmed by `sources.mjs check` |
| 6 | The lazy version costs O(E log E) with space O(E); the eager version costs O(E log V) with space O(V) | Sedgewick & Wayne, booksite §4.3 | Word-for-word quoted in `SOURCES.md`; confirmed by `sources.mjs check` |
| 7 | On this topic's own six-vertex graph, lazy Prim, eager Prim, and the array version from A all produce the identical tree (weight eleven, the identical five edges Kruskal's own run keeps) in the identical order of vertices added (A, C, D, E, B, F) | Computed directly | `examples.py`: `lazy_order == eager_order == array_order == ["A","C","D","E","B","F"]`; all three `edge_set(...) == KRUSKAL_MST_PAIRS`; `mst_weight(...) == 11` for all three |
| 8 | The array version's own comparison count on this graph is twenty-one, fixed by the vertex count alone | Computed directly | `examples.py`: `array_comparisons == 21` |
| 9 | On a two-hundred-vertex random graph, the array version's own comparison count is identical at two very different edge counts (just enough edges to connect it, and every possible edge) | Computed directly | `examples.py`: `array_cost_sparse == array_cost_dense == N * (N + 1) // 2` |
| 10 | The eager version never pushes more entries onto its queue than the lazy version does, on this topic's own graph | Computed directly | `examples.py`: `eager_pushes <= lazy_pushes` (nine against ten) |
| 11 | The derived array-against-heap crossover (roughly the vertex count squared over the base-two logarithm of the vertex count) and a measured crossover (found by sweeping the edge count on random two-hundred-vertex graphs until a heap-cost proxy exceeds the array's own fixed cost) land in the same broad order of magnitude | Computed directly | `examples.py`: `measured_crossover / predicted_crossover` asserted between 0.1 and 2 (measured: roughly fifteen hundred against a predicted roughly five thousand) |
| 12 | R. C. Prim's 1957 paper is "Shortest connection networks and some generalizations," *Bell System Technical Journal* 36(6), pp. 1389–1401 | Crossref API | Confirmed against Crossref at planning time; not opened or quoted |
| 13 | M. L. Fredman and R. E. Tarjan's 1987 paper is "Fibonacci heaps and their uses in improved network optimization algorithms," *Journal of the ACM* 34(3), pp. 596–615 | Crossref API | Confirmed against Crossref at planning time; not opened or quoted |

## Currency check

- NetworkX's documentation is a living page, fetched 2026-11-05; no claim is extended beyond what it states as of that fetch.
- Erickson's *Algorithms* (2019) and Sedgewick & Wayne's booksite are stable, author-posted pages, fetched 2026-11-05.
- Prim (1957) and Fredman & Tarjan (1987) are stable, fixed publications, each checked against Crossref at planning time; neither independently opened or quoted this session.

## Red team

1. **CLRS 4th ed.'s own Prim's-algorithm section is not opened this session** (paywalled). No claim here rests on its exact section numbers or wording.
2. **Erickson's own PDF drops the diacritics in "Vojtěch" and "Borůvka," and every numeral giving a year, during text extraction.** This topic states Jarník's priority and the rediscovery history in its own prose rather than as a direct quote, and quotes only the one short, cleanly-extracted sentence about the shape of the forest the algorithm grows.
3. **Jarník's own 1930 paper is not independently found or opened this session**; a Crossref search by title returns no match. Its own exact title, venue and year are not claimed beyond what Erickson's own account states ("published his discovery the following year" after a letter to Borůvka).
4. **Whether Graham & Hell (1985) itself credits Jarník is not checked this session** — that paper, cited only bibliographically on topic 67, is not opened here either.
5. **The Fibonacci-heap bound O(m + n log n) is named only**, per `CHAPTER.md`'s own instruction; this topic builds and measures only the binary-heap versions, never a Fibonacci heap.
6. **The measured crossover (roughly fifteen hundred edges) is smaller than the derived prediction (roughly five thousand edges) by a factor of about three.** This is expected, not a bug: Big-O hides constant factors, and `examples.py`'s own heap-cost proxy (summing log₂ of the heap's size at each push and pop) is a stand-in for real elapsed time on a real binary heap, not a claim about actual CPU seconds. The topic states this explicitly rather than claiming an exact match.
7. **The hook's twenty-thousand-point complete graph is never the scale `examples.py` actually runs at** (it runs at two hundred vertices, for a script that finishes in seconds); the hook names an edge count only, never a timing claim.
8. **Borůvka's algorithm, Karger–Klein–Tarjan, Chazelle's algorithm, and Pettie–Ramachandran's algorithm are named only**, per `CHAPTER.md`'s own instruction, each checked against Crossref at planning time for bibliographic details, none opened or quoted.

## Corrections applied

None required for this topic's own content this session; `examples.py` passed on its first full run with no assertion failures, and `check-all.mjs`'s three stages (build; links/narration; reels) all passed clean for this topic on the first attempt. Two pre-existing, unrelated bugs on `main` — a duplicate `declared` key (topic 67) and a missing `chapter.section` field (a sibling thread's `dsa.binary-search-invariants-boundaries` entry, found while adding this topic's own registry entry) — were found and fixed along the way; see this topic's own commit message and [[dsa-pipeline-ch15-19-20-23]] in project memory.
