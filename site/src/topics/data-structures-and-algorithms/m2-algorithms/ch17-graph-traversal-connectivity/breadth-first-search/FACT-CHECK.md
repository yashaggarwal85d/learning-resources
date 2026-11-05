# Fact-check — Breadth-first search

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | BFS visits vertices in non-decreasing distance order; the first time a vertex is reached, its distance is final. | Confirmed | `examples.py` (`bfs`, `reconstruct_path`); the FIFO-invariant argument in post-notes "Into the internals" is a direct re-derivation, not a quote. |
| 2 | Multi-source BFS in one pass costs O(n+m); k single-source passes cost O(k(n+m)) for the same result. | Confirmed | `examples.py` (`multi_source_bfs` measured directly: ratio ≈ 3.00 for k = 3). |
| 3 | 0-1 BFS with a deque gives identical results to Dijkstra on a 0/1-weighted graph. | Confirmed | `examples.py` (`zero_one_bfs` vs. `dijkstra`, 60 vertices, exact match asserted). |
| 4 | A graph is bipartite iff it has no odd cycle, iff it is 2-colourable. | Confirmed | Wikipedia "Bipartite graph", quoted in `SOURCES.md`. |
| 5 | BFS's 2-colouring test returns a constructive odd-cycle witness (the clashing edge plus the BFS-tree paths to the common ancestor) on failure. | Confirmed | Wikipedia "Bipartite graph", quoted; `examples.py` (`bipartite_check` on the 5-cycle, returns a genuine witness edge). |
| 6 | Direction-optimizing BFS's hybrid approach reports speedups of 3.3–7.8x on synthetic graphs and 2.4–4.6x on real social networks. | Confirmed, with a substitution noted | Beamer, Asanović and Patterson's own abstract, quoted; the SC12 conference PDF itself could not be fetched from a free host (IEEE-paywalled), so the 2013 *Scientific Programming* extended journal version (same authors, same algorithm, same reported figures) is used instead, as stated plainly in `SOURCES.md`. |
| 7 | BFS was first described by Konrad Zuse in 1945 (unpublished until 1972), independently reinvented by Edward F. Moore in 1959. | Confirmed | Wikipedia "Breadth-first search", quoted. Used only in post-notes "The frontier", not as a reel claim, since the reel does not depend on the precise attribution history. |
| 8 | This topic's own direction-optimizing demonstration (`bfs_hybrid_count`) is a simplified stand-in, not a reproduction of the paper's tuned heuristic or parallel implementation. | Confirmed, by construction | `examples.py`'s own comment states this; `FACT-CHECK.md` and `SOURCES.md` both state it as a demonstration of the shape of the saving, honestly labelled. |

## Currency check

Both Wikipedia pages were fetched 2026-11-05 and reflect standard, long-settled graph-theory results (BFS's shortest-path guarantee, bipartiteness characterisations) with no recent revision expected to change them. The Beamer et al. paper is from 2012/2013; no more recent primary source superseding its specific reported speedup figures was sought, since the topic cites those figures as the paper's own historical measurement, not a claim about current hardware.

## Red team

1. **Is the shortest-path guarantee specific to this one graph, or general?** The FIFO-invariant argument in post-notes is stated generally (any graph, any source), and `examples.py`'s own test graph was constructed specifically to have multiple paths of different lengths, so the guarantee is exercised, not merely assumed on a trivial input.
2. **Does multi-source BFS's measured 3x ratio hold for a different number of sources, or is it a coincidence of k=3?** The claim ("k single-source passes cost roughly k times as much") is a direct consequence of each pass re-scanning the same graph; the measured ratio (2.5–3.5 asserted range) is a sanity check on this specific k, not a claim that the ratio is exactly k for all k (edge overlap between sources' explored regions could push it slightly under k on some graphs) — the assertion range accounts for this.
3. **Does the 0-1 BFS/Dijkstra equivalence hold only by luck on this one random graph?** The test seeds the random generator and runs on 60 vertices with a non-trivial edge density; the equivalence is a general theorem (0-1 BFS is a specialisation of Dijkstra for the 0/1 case), not merely an empirical coincidence on this instance, and the post-notes section states the general boundary (why it fails to generalise past weight 1 without a bucket queue).
4. **Is the bipartiteness witness construction's prose accurate to what `examples.py` actually returns?** Checked directly: `bipartite_check`'s returned witness edge is confirmed same-coloured in the assertion, matching the Wikipedia-sourced construction's own claim.
5. **Could the direction-optimizing demonstration's numbers be an artifact of this one random seed?** The graph generator is seeded for reproducibility, and the measured ratio (23.96x in the shipped run) comfortably clears the asserted threshold (greater than 5x); the claim in the reel and post-notes is stated as "a sizeable reduction," not a specific multiplier, so it does not depend on reproducing this exact figure on a different seed.

## Corrections applied

None. No claim in the chapter plan's own BFS scope was found incorrect against the fetched sources.
