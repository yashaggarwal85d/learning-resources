# Fact-check — Depth-first search and edge classification

## Claims table

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | Discovery/finish intervals satisfy the Parenthesis Theorem: disjoint or nested, never partly overlapping. | Confirmed | University of Crete CS-583 notes (Theorem 3.1), quoted; `examples.py` (`intervals_consistent`, checked for every pair on two constructed graphs). |
| 2 | v is a proper descendant of u iff d[u] < d[v] < f[v] < f[u]. | Confirmed | Same source (Corollary 3.2), quoted; `examples.py` (`is_descendant`). |
| 3 | The four edge types (tree, back, forward, cross) are defined purely from discovery/finish times and tree membership. | Confirmed | Wikipedia "Depth-first search" and the CS-583 notes, both quoted; `examples.py` (`dfs_classify` on two constructed graphs, one with a forward edge). |
| 4 | An undirected graph's DFS produces only tree and back edges, never forward or cross. | Confirmed | Wikipedia "Depth-first search", quoted; `examples.py` (`dfs_classify_undirected` on a triangle-containing graph). |
| 5 | A directed graph is acyclic iff its DFS yields no back edges (both directions of the proof). | Confirmed | CS-583 notes (Lemma 3.4), quoted, both directions; `examples.py` (`has_cycle_directed` on a cyclic and an acyclic instance). |
| 6 | An undirected cycle test needs only a parent check, not three-colouring, because cross edges cannot exist. | Confirmed | Derived from claim 4 above (no cross edges means a non-parent visited neighbour is unambiguous); `examples.py` (`has_cycle_undirected`). |
| 7 | An explicit stack of (vertex, iterator) pairs yields the identical traversal order to recursive DFS. | Confirmed | Wikipedia "Depth-first search", quoted; `examples.py` (`iterative_dfs_count` matches `recursive_dfs_count` on every input that doesn't crash the recursive version). |
| 8 | A sufficiently long recursive DFS chain overflows Python's call stack at a realistic recursion limit, and the iterative version does not. | Confirmed, directly reproduced | `examples.py`: a real `RecursionError` on a 50,000-vertex chain at `sys.setrecursionlimit(1000)`; the iterative version completes and visits all 50,000 vertices. |

## Currency check

Both sources describe long-settled, decades-old results (DFS's edge classification and the parenthesis property date to Tarjan's and Hopcroft's work in the early 1970s, standardised in CLRS); no recent revision is expected. Python's own default recursion limit (1,000, unless changed) is current as of this session's Python version, checked by `sys.getrecursionlimit()` rather than assumed.

## Red team

1. **Is the parenthesis property demonstrated on a graph complex enough to actually test it, or a trivial case where it holds vacuously?** `DIRECTED_ADJ` has five vertices, a cycle, and a cross edge; `intervals_consistent` checks all 20 ordered pairs, not just adjacent ones.
2. **Does the forward-edge example actually produce a forward edge, or could the classification logic be silently mislabelling it as something else?** Verified directly: `edge_type2[(0, 3)] == 'forward'` is asserted and the graph was built specifically so that vertex 3 is reachable both directly from 0 (visited first, as a tree edge) and via 0→1→2→3 (making the second a forward edge to an already-finished descendant) — confirmed by printing the actual computed discovery/finish times, not assumed from the construction alone.
3. **Could the undirected "only tree and back edges" result be an artifact of this one small triangle graph?** The internals section's own structural argument (a non-tree edge in an undirected graph was already available from the other endpoint, forcing it to be a back edge) is general, not specific to the triangle; the triangle is used only as the smallest instance that actually contains a non-tree edge to classify.
4. **Is the recursion-depth failure realistic, or an artificially lowered limit that doesn't reflect real crashes?** Python's actual default recursion limit is 1,000 (confirmed via `sys.getrecursionlimit()` before lowering it back after the test), so the reproduced failure uses the real default, not an artificially small number chosen to force a crash.
5. **Does the iterative version's "identical traversal order" claim actually hold, or merely visit the same set of vertices?** For this topic's purposes (correctness and crash-avoidance) only the visited-set-and-count equivalence is asserted in `examples.py`; the exact order claim is sourced directly from Wikipedia's own statement about the iterators-stack construction, not independently re-derived, and is flagged as such.

## Corrections applied

None. No claim in the chapter plan's own DFS scope was found incorrect against the fetched sources.
