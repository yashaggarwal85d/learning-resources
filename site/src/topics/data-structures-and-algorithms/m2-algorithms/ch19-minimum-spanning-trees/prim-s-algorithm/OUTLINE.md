# OUTLINE: Prim's algorithm

Thirteen steps, following `CHAPTER.md`'s own plan for topic 68.

1. **Hook.** A complete graph on a huge number of points: an astronomical number of edges. Sorting them all for Kruskal is the slow part before a single decision is made; a heap-based Prim touches every edge and pays a heap operation for the useful ones; a plain array with no heap at all, doing many scans of many entries, looks wasteful yet may be the one that wins. Which structure wins depends on one ratio.
2. **Predict: array or heap for a dense graph?** Before naming the ratio, ask directly: on a dense graph, does the structure with the fancier data structure (the heap) win, or does the plain array?
3. **Prim's algorithm, the mechanism.** Grow one tree from a start vertex; the cut is (T, V∖T); the lightest crossing edge is added next. Correctness in one line from topic 67's own cut property.
4. **Lazy Prim.** Push every edge leaving a newly added vertex; pop the minimum; discard it if both ends are already in the tree. Run on the chapter's own graph from A.
5. **Eager Prim (keyed vertices).** Each outside vertex holds the cheapest edge into the tree seen so far; a decrease-key (a sift-up on Chapter 6's binary heap) when a new edge improves it. Run on the identical graph; identical tree, weight eleven, same order A, C, D, E, B, F as Kruskal's own tree.
6. **Prim and Dijkstra, one line apart.** The identical loop, with the key being an edge's own weight rather than the path length so far.
7. **The O(n²) array version.** An array of keys, a linear scan for the minimum, as many scans as vertices, no heap at all: Θ(n²) regardless of how many edges the graph has. Run on the chapter's own graph: twenty-one comparisons, fixed by the vertex count alone.
8. **Predict: does the array's own cost change with more edges?** Before the crossover is derived, ask: does adding more edges to the same six vertices change the array version's own cost at all?
9. **The crossover, derived.** The array costs Θ(n²); the heap version costs O(m log n); the heap wins while m log n is less than n², i.e. while m is below roughly n² over log base two of n.
10. **The crossover, measured.** On random graphs with the vertex count fixed and the edge count swept, the heap-based cost first exceeds the array's own fixed cost at a point in the same broad range as the derived ratio predicts.
11. **Kruskal against Prim.** Kruskal's cost is keyed to the edge count through its sort; Prim's array version is keyed only to the vertex count. On a dense graph Prim's array version wins by the measured margin; on a sparse or already-sorted input Kruskal is competitive or better.
12. **Implementation facts that decide real choices.** The array version needs an adjacency matrix or list but touches memory in a straight line; the heap version needs an adjacency list or CSR and pays heap overhead. Dense and complete graphs (geometric point sets where every pair is an edge) are the array version's home.
13. **Handoff.** A minimum spanning tree was certified by one lemma about cuts. The next chapter keeps the cuts and changes what the edges mean: an edge becomes a pipe with a capacity. Max-flow min-cut, next.

## Changes from the chapter plan

- `CHAPTER.md`'s own hook names a complete graph on twenty thousand points and a predicted-but-not-measured winner; this topic keeps that shape but states every count as a spelled-out word in `reel.tsx` (the project's own digit-literalness check), and its own measured crossover (from `examples.py`, run at a vertex count of two hundred, not twenty thousand, for a script that finishes in seconds) is reported honestly as an order-of-magnitude match to the derived ratio, not an exact one — Big-O hides constant factors, and `examples.py`'s own heap-cost proxy (summing log₂ of the heap's size at each operation) is a stand-in for real elapsed time, not a claim about actual CPU seconds.
- Jarník's own priority is stated in this topic's own prose rather than as a direct quote from Erickson's PDF, because that PDF drops every diacritic in "Vojtěch" and "Borůvka" and every numeral giving a year during text extraction (see `SOURCES.md`'s own Red team).
- The Fibonacci-heap bound, Jarník's own exact year, and the frontier citations (Karger–Klein–Tarjan, Chazelle, Pettie–Ramachandran) are named only, per `CHAPTER.md`'s own instruction, with their own bibliographic details checked against Crossref at planning time and not claimed beyond that.
