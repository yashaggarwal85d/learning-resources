# FACT-CHECK: Cut property and Kruskal's algorithm

## Claims table

| # | Claim | Source | Verified how |
|---|---|---|---|
| 1 | For any cut that respects the edges already in A, a strictly lightest crossing edge belongs to all MSTs of the graph | Wikipedia, "Minimum spanning tree" | Word-for-word quoted in `SOURCES.md`; `sources.mjs check` confirms it word for word |
| 2 | For any cycle, an edge that is strictly heavier than every other edge on that cycle belongs to no MST | Wikipedia, "Minimum spanning tree" | Word-for-word quoted in `SOURCES.md`; confirmed by `sources.mjs check` |
| 3 | The "safe edge" lemma (an edge is safe if some MST contains it) is Erickson's own independent statement of the identical fact under a different name, attributed by Erickson to Prim | Erickson, *Algorithms* (2019), Ch. 7 | Three short quotes in `SOURCES.md`; confirmed by `sources.mjs check` |
| 4 | SciPy's own minimum spanning tree function is computed using Kruskal's algorithm | SciPy Documentation, `scipy.sparse.csgraph.minimum_spanning_tree` | Word-for-word quoted in `SOURCES.md`; confirmed by `sources.mjs check` |
| 5 | NetworkX offers Kruskal, Prim and Borůvka, with Kruskal the default | NetworkX Documentation, `minimum_spanning_tree` | Word-for-word quoted in `SOURCES.md`; confirmed by `sources.mjs check` |
| 6 | On this topic's own ten-edge graph, Kruskal's sorted scan accepts the five edges C–D (1), A–C (2), D–E (2), B–C (3), E–F (3) and rejects the other five, for a minimum spanning tree weight of eleven | Computed directly | `examples.py`: `accepted_pairs == ["CD", "AC", "DE", "BC", "EF"]`, `mst_weight == 11` |
| 7 | Cutting {A, C} away from the rest of the graph, the lightest crossing edge is C–D at weight one, and it is one of the minimum spanning tree's own edges | Computed directly | `examples.py`: lightest crossing edge for `S = {"A", "C"}` is `("C", "D", 1)`, confirmed a member of `mst_edge_set` |
| 8 | On the triangle A–B–C, the heaviest edge (A–B, weight four) is confirmed absent from the computed minimum spanning tree | Computed directly | `examples.py`: `("A", "B", 4)` not in `mst_edge_set` |
| 9 | This graph has exactly eighty-nine spanning trees in total (counting both parallel A–B edges), fifty-five without the heavier parallel edge; exactly one tree achieves the minimum weight of eleven, and the next-cheapest tree costs twelve | Computed directly, brute force over every vertex subset of edges | `examples.py`: `len(all_tree_weights) == 89`, `len(without_7_weights) == 55`, `num_minimum == 1`, `second_best == 12` |
| 10 | A four-vertex cycle with all four edges at the identical weight has exactly four different spanning trees, each at the identical total weight | Computed directly, brute force | `examples.py`: `len(tie_weights) == 4`, all four equal |
| 11 | The shortest-path tree from A on this topic's own graph weighs twelve, one more than the minimum spanning tree's eleven | Computed directly, Dijkstra from A | `examples.py`: `sp_weight == 12` against `mst_weight == 11` |
| 12 | Shifting every edge weight by the identical negative constant leaves Kruskal's accepted-edge set unchanged | Computed directly | `examples.py`: identical `accepted_pairs` before and after a uniform shift of every weight by negative twenty |

## Currency check

- Wikipedia's "Minimum spanning tree" article, the SciPy documentation, and the NetworkX documentation are all living pages, fetched 2026-11-05; no claim is extended beyond what each page states as of that fetch.
- Erickson's *Algorithms* (2019) is a stable, author-posted PDF (fetched at the corrected URL `07-mst.pdf`, Chapter 7), unchanged content since 2019.
- Kruskal (1956) and Graham & Hell (1985) are cited bibliographically only (title, container-title, volume, issue, pages, year), each checked against the Crossref API at planning time, never opened or quoted.

## Red team

1. **CLRS 4th ed.'s own minimum-spanning-trees chapter is not opened this session** (paywalled). No claim here rests on its exact section numbers or wording; its citation is bibliographic only, per `references.md`.
2. **Erickson's own chapter never uses the name "cut property"** — he states the identical fact as the "safe edge" lemma, attributed to Prim. This topic's own choice to use Wikipedia's naming (`cut property`, `cycle property`) as the primary vocabulary, with Erickson cited as an independent, differently-named confirmation of the same fact, is noted explicitly in `OUTLINE.md` and `post-notes.md` rather than silently conflated.
3. **The bottleneck spanning tree property (an MST also minimizes the maximum edge on the tree path between any two vertices) is named only**, per Wikipedia's one-sentence mention, and is not proved or demonstrated in this topic's own `examples.py`.
4. **Borůvka's algorithm, the randomized linear-time Karger–Klein–Tarjan algorithm, and single-linkage clustering read as an MST cut are named only** in `post-notes.md`'s frontier section, per `CHAPTER.md`'s own instruction, and are built in neither this topic nor the next.
5. **Erickson's PDF drops or mangles several mathematical symbols during text extraction** (set-difference, subset and inequality signs render as stray glyphs or vanish). Worked around by quoting only the handful of short, symbol-free prose sentences that survive extraction cleanly.
6. **The general exchange-argument technique, matroids, and the counter-examples where greedy fails (coin systems, 0/1 knapsack) belong to a later chapter** on exchange arguments and matroids, named only in this topic's hook and `post-notes.md`'s frontier section, never built here.

## Corrections applied

- `examples.py`'s cut-property demonstration originally asserted the lightest edge crossing the cut `S = {"A", "C"}` was `("A", "C", 2)`. This is wrong: both endpoints of that edge are inside S, so it is not a crossing edge at all. Running `python3 examples.py` raised an `AssertionError` on this line. Fixed by correctly identifying the lightest actual crossing edge as `("C", "D", 1)` (C is in S, D is not), and updating the assertion; re-running confirms every assertion now passes.
- Three takeaways (the tie-trap takeaway, the spanning-tree-count takeaway, and the negative-weights takeaway) were 26, 22 and 24 words respectively, over this project's 20-word limit, reported by `check-all.mjs --skip reels,links,narration`'s build-time check. Shortened to 20, 18 and 18 words.
