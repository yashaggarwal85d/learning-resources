# Outline — Breadth-first search

## Learning outcomes

- Implement BFS with a FIFO queue and parent pointers, and prove it finds unweighted shortest paths.
- Run multi-source BFS and 0-1 BFS with a deque, and say when each is the right tool over plain BFS or Dijkstra.
- 2-colour a graph by BFS to test bipartiteness, and produce a witnessing odd cycle when it fails.

## Reel steps (storyboard)

1. **Opening.** A widening ring spreading outward from a source on the ring-plus-chord graph `MULTI_PATH_ADJ`. Moves: a layer-by-layer fade-in timed to the BFS layer each vertex belongs to. Caption: the frontier never backtracks, never skips ahead. Final frame: the widening visibly stalls once the whole graph is lit.
2. **PredictShortestPath.** The source alone against the rest of the graph, the question stated plainly. Predict: is the first reach always shortest? Answer: yes, with the one-line reason (nothing one step farther is even enqueued before everything one step closer is dequeued).
3. **BFSMechanism.** The same graph, layers locking in one at a time with a distance label, the edges to the current layer highlighted. Takeaway: a FIFO frontier guarantees the shortest unweighted path the first time, always. Final frame: every vertex labelled with its final distance.
4. **MultiSource.** A 6x6 grid with three simultaneous "fire" sources, cells lighting up in expanding Manhattan-distance rings. Takeaway: one multi-source pass costs what one single-source pass costs; k separate passes cost k times as much for the same answer.
5. **ZeroOneBFS.** A small deque of four items, each tagged with its edge weight (0 or 1), 0-weight pushes drawn to the front. Caption: the deque's own order already shows non-decreasing distance.
6. **PredictBipartite.** A 5-cycle, the question of 2-colourability stated. Predict: can an odd cycle be 2-coloured cleanly? Answer: no, with the one-line reason (walking around an odd cycle alternating colour returns to the start colour).
7. **Bipartiteness.** The same 5-cycle colouring outward from one vertex, the last edge visibly clashing in cherry, with a caption naming the two same-coloured vertices and the path between them as the witness. Takeaway: a bipartiteness test that fails hands back the odd cycle, constructively.
8. **DirectionOptimizing.** A two-bar comparison of edges examined by top-down vs. a hybrid toggle on the same large-frontier step. Takeaway: the hybrid reduces edges examined by switching direction, not by changing the answer.
9. **Recap.** The opening graph once more, fully lit, captioned with the handoff to depth-first search.

## Engagement arc

- Hook (step 1): the billion-edge, few-steps claim.
- First predict (step 2, within the first four steps): shortest-path guarantee.
- Second predict (step 6): bipartiteness of an odd cycle.
- Takeaways: steps 3, 4, 7, 8 (four, one more than the minimum).
- Recap (step 9): names the chapter's own closing idea (distance, from a widening frontier) against the next topic's different shape (depth, from a single deep path).

## Narrator's line of thought, by step

1. Names the problem's scale and the one invariant (never more than one step past what's confirmed) before any mechanism.
2. Poses the predict as a real question about ordering, not a trick.
3. Explains *why* the FIFO order proves the guarantee — the invariant, not just the algorithm's steps.
4. Explains why seeding several sources at once is one pass, not merged separate passes — the cost argument, not just the result.
5. Explains why a deque suffices here specifically (only two weights) rather than claiming it works for general weights.
6. Poses the odd-cycle predict as a direct consequence of walking the cycle, inviting the learner to trace it mentally.
7. Explains the witness construction as a constructive fact, not merely "the test says no."
8. Explains the trade (examining fewer edges, same answer) as the production reason real systems use the hybrid.
9. Names the shift from distance (BFS) to depth (DFS) as the chapter's next move.

## Post-notes headings

- Internals: why the FIFO queue's own order proves the shortest-path guarantee.
- Lab: `examples.py`'s five checks (shortest path, multi-source, 0-1 BFS vs. Dijkstra, bipartiteness with witness, direction-optimizing shape).
- Production: BFS at billion-edge scale; the k-weight bucket-queue generalisation of 0-1 BFS.
- Frontier: BFS's own pre-1959 origin (Zuse); the bottom-up step's need for the inverse graph on directed inputs; the skipped lowest-common-ancestor topic's relationship to a BFS tree.
- Where this goes next: handoff to topic 60.

## Examples to execute and what each asserts

- `bfs` on `MULTI_PATH_ADJ`: shortest path 0→6 has length 2 via vertex 7, not 6 via the long way round; `reconstruct_path` returns the correct vertex sequence.
- `multi_source_bfs` on a 20x20 grid with 3 sources vs. 3 single-source `multi_source_bfs([s])` calls: identical per-vertex minimum distances; single-source total edge count roughly 3x the multi-source total.
- `zero_one_bfs` vs. `dijkstra` on an identical randomly-weighted 0/1 graph (60 vertices): identical distance arrays.
- `bipartite_check` on an odd 5-cycle: returns not-bipartite with a genuine same-colour witness edge; on an even 6-cycle: returns bipartite with every edge properly 2-coloured.
- `bfs_top_down_count` vs. `bfs_hybrid_count` on a random low-diameter graph (n=2000, avg degree 20): hybrid examines markedly fewer edges once the frontier crosses 15% of the graph.

## Bridge and handoff

- Bridge: topic 58's handoff, word for word.
- Handoff: to topic 60 (depth-first search and edge classification), word for word as stated in CHAPTER.md.

## Concept ledger

- Introduces: `breadth-first-search`, `frontier`, `unweighted-shortest-path`, `multi-source-bfs`, `zero-one-bfs-deque`, `bipartiteness-two-coloring`, `direction-optimizing-bfs`.
- Uses: `adjacency-list`, `edge-list` (Chapter 10), `queue`, `deque` (Chapter 2), `big-o-theta-omega` (Chapter 1).
- Declared: none.

## Claims list

1. BFS visits vertices in non-decreasing distance order — CLRS-standard result, also proved directly from the FIFO invariant in post-notes; demonstrated in `examples.py`.
2. Multi-source BFS costs O(n+m), one single-source pass per source costs O(k(n+m)) — demonstrated by direct measurement in `examples.py`.
3. 0-1 BFS with a deque gives identical results to Dijkstra on a 0/1-weighted graph — demonstrated by direct comparison in `examples.py`.
4. A graph is bipartite iff it has no odd cycle, iff it is 2-colourable — Wikipedia "Bipartite graph", quoted.
5. BFS's 2-colouring test returns a constructive odd-cycle witness on failure — Wikipedia "Bipartite graph", quoted; demonstrated in `examples.py`.
6. Direction-optimizing BFS's hybrid top-down/bottom-up approach reduces edges examined, with reported speedups of 3.3-7.8x (synthetic) and 2.4-4.6x (social networks) — Beamer, Asanović and Patterson, quoted.
7. BFS's own origin predates its usual 1959 attribution, per Zuse's unpublished 1945 thesis — Wikipedia "Breadth-first search", quoted; stated in post-notes only, not the reel's main claim.

## Changes from the chapter plan

None. The topic follows CHAPTER.md's scope, outcomes, bridge and handoff exactly.
