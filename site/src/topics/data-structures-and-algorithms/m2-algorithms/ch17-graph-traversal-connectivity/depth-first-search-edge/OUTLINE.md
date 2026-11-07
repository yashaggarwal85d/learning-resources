# Outline — Depth-first search and edge classification

## Learning outcomes

- Compute discovery/finish times for a DFS and classify every edge as tree, back, forward or cross from them alone.
- Detect a cycle in a directed graph by three-colouring and in an undirected graph by a parent check, and explain why the two tests differ.
- Convert a recursive DFS to an explicit-stack iterative one, and reproduce the recursion-depth failure the conversion fixes.

## Reel steps (storyboard)

1. **Opening.** A single path diving deep through the directed graph `DIRECTED_ADJ`, contrasted with BFS's widening ring. Caption: as deep as possible, before ever backing up.
2. **PredictBackEdge.** The 0→1→2→0 cycle, the closing edge highlighted. Predict: which edge type, and the cycle consequence. Answer: a back edge, and a cycle.
3. **DFSMechanism.** Discovery/finish timestamps appearing live on the same graph, the parenthesis property stated. Takeaway: intervals nest or sit apart, never partly overlap.
4. **EdgeTypes.** The four names, each against its defining relation. Takeaway: undirected graphs have only tree and back edges.
5. **PredictUndirectedEdges.** A plain undirected triangle. Predict: can an undirected DFS ever produce a forward or cross edge? Answer: no, with the structural reason.
6. **CycleDetection.** Three-colour test (directed) side by side with parent-check (undirected). Takeaway: the two tests differ because cross edges can exist in one case, not the other.
7. **IterativeDFS.** A bar-growth animation: recursive call stack growing then crashing, against an explicit stack completing. Takeaway: a crash on a deep chain is a call-stack limit, not an algorithm bug.
8. **Recap.** The same graph, edges now labelled, handoff to topological sort.

## Engagement arc

- Hook (step 1): DFS as the opposite shape of traversal from BFS.
- First predict (step 2, within first four steps): back-edge-implies-cycle.
- Second predict (step 5): undirected graphs can't produce forward/cross edges.
- Takeaways: steps 3, 4, 6, 7, 8 (five).
- Recap (step 8): names DFS's finish order as the free output topic 61 builds on.

## Narrator's line of thought, by step

1. Names DFS as the structural opposite of BFS, not a variant of it.
2. Poses the back-edge predict as a direct consequence to trace, not a trick.
3. Explains why the parenthesis property is a fact about ranges, not merely stated.
4. Explains all four edge types as consequences of the same two timestamps, not four separate rules.
5. Explains why the two cycle tests differ structurally (cross edges possible vs. impossible).
6. Explains the crash as a resource limit, not a logic bug, and the fix as moving where state lives.
7. Names the free byproduct (reversed finish order) as the bridge to the next topic.

## Post-notes headings

- Internals: why forward/cross edges are impossible in an undirected graph.
- Lab: `examples.py`'s checks (parenthesis property, forward-edge graph, undirected edge types, both cycle tests, the recursion crash and its iterative fix).
- Production: the explicit-stack technique's generality beyond DFS.
- Frontier: Eulerian paths (Hierholzer's algorithm, DFS-like) and articulation points/bridges (low-link, the undirected analogue of topic 62's SCC low-link) — both skipped syllabus topics named once.
- Where this goes next: handoff to topic 61.

## Examples to execute and what each asserts

- `dfs_classify` on `DIRECTED_ADJ`: correct edge types for a tree, a back, and a cross edge; `intervals_consistent` holds for all pairs.
- `dfs_classify` on `FORWARD_ADJ` (built specifically for a forward edge): correct forward classification; `is_descendant` matches the parenthesis-property corollary.
- `dfs_classify_undirected` on a triangle-containing undirected graph: edge types are only tree/back.
- `has_cycle_directed` / `has_cycle_undirected`: correct true/false on a cyclic and an acyclic instance each.
- A 50,000-vertex chain: recursive DFS raises `RecursionError` at a lowered recursion limit; iterative DFS visits all 50,000 vertices without crashing.

## Bridge and handoff

- Bridge: topic 59's handoff, word for word.
- Handoff: to topic 61 (topological sort), word for word as stated in CHAPTER.md.

## Concept ledger

- Introduces: `depth-first-search`, `discovery-finish-time`, `edge-classification`, `parenthesis-property`, `three-colour-cycle-detection`, `iterative-dfs-explicit-stack`.
- Uses: `adjacency-list` (Chapter 10), `stack` (Chapter 2), `breadth-first-search` (topic 59, contrast only), `big-o-theta-omega` (Chapter 1).
- Declared: none.

## Claims list

1. Discovery/finish intervals satisfy the Parenthesis Theorem (disjoint or nested, never partly overlapping) — University of Crete CS-583 notes, quoted; demonstrated directly in `examples.py`.
2. v is a proper descendant of u iff d[u] < d[v] < f[v] < f[u] — same source, quoted; used in `is_descendant`.
3. The four edge types (tree, back, forward, cross) are defined from discovery/finish times and tree membership — Wikipedia "Depth-first search" and the CS-583 notes, both quoted.
4. An undirected graph's DFS produces only tree and back edges — Wikipedia "Depth-first search", quoted; confirmed directly in `examples.py`.
5. A directed graph is acyclic iff its DFS yields no back edges, both directions — CS-583 notes (Lemma 3.4), quoted; demonstrated in `examples.py`.
6. An explicit stack of (vertex, iterator) pairs yields the identical traversal order to recursive DFS — Wikipedia "Depth-first search", quoted; `examples.py`'s `iterative_dfs_count` matches the recursive count on every input that doesn't crash the recursive version.
7. A sufficiently long recursive DFS chain overflows Python's call stack at a realistic recursion limit — demonstrated directly in `examples.py` (a real `RecursionError`, not claimed from memory).

## Changes from the chapter plan

None. The topic follows CHAPTER.md's scope, outcomes, bridge and handoff exactly, with the one-predict-question choice noted above under "Engagement arc."
