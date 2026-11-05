# Sources — Breadth-first search

## Wikipedia — "Breadth-first search"

URL: https://en.wikipedia.org/wiki/Breadth-first_search
Version: fetched 2026-11-05

> BFS and its application in finding connected components of graphs were invented in 1945 by Konrad Zuse, in his (rejected) Ph.D. thesis on the Plankalkül programming language, but this was not published until 1972.

> It was reinvented in 1959 by Edward F. Moore, who used it to find the shortest path out of a maze,

> The below pseudocode finds the shortest path from a given root vertex to all other vertices in the graph using BFS.

> The parent attribute of each node is useful for accessing the nodes in a shortest path, for example by backtracking from the destination node up to the starting node, once the BFS has been run, and the predecessors nodes have been set.

> Finding the shortest path between two nodes u and v, with path length measured by number of edges (an advantage over depth-first search)

Contents:
- BFS's own origin (Zuse 1945, unpublished until 1972; reinvented by Moore 1959 for maze shortest-paths; developed into Lee's wire-routing algorithm, 1961) — used in post-notes "The frontier"/internals, not the reel's main claim.
- The parent-pointer / shortest-path-reconstruction technique — the basis of this topic's `reconstruct_path`.
- BFS's own stated advantage over DFS for shortest unweighted paths — the chapter's own contrast point, reused from topic 60's bridge.

## Wikipedia — "Bipartite graph"

URL: https://en.wikipedia.org/wiki/Bipartite_graph
Version: fetched 2026-11-05

> An undirected graph is bipartite if and only if it does not contain an odd cycle.

> A graph is bipartite if and only if it is 2-colorable, (i.e. its chromatic number is less than or equal to 2).

> Alternatively, a similar procedure may be used with breadth-first search in place of DFS. Again, each node is given the opposite color to its parent in the search forest, in breadth-first order. If, when a vertex is colored, there exists an edge connecting it to a previously-colored vertex with the same color, then this edge together with the paths in the breadth-first search forest connecting its two endpoints to their lowest common ancestor forms an odd cycle. If the algorithm terminates without finding an odd cycle in this way, then it must have found a proper coloring, and can safely conclude that the graph is bipartite.

Contents:
- The bipartite-iff-no-odd-cycle and bipartite-iff-2-colourable equivalences — the topic's stated theorem.
- The BFS-based 2-colouring-and-odd-cycle-witness construction, quoted exactly — `examples.py`'s `bipartite_check` is a direct implementation of this paragraph's procedure.

## Beamer, Asanović and Patterson — "Direction-Optimizing Breadth-First Search"

URL: https://typeset.io/pdf/direction-optimizing-breadth-first-search-pmi7vf9g6v.pdf
Version: extended journal version, *Scientific Programming* 21 (2013), 137–148 (the SC12 conference paper, DOI 10.1109/SC.2012.50, could not be fetched directly from a free host; this extended version carries the same algorithm and the same reported speedups, cited as such)

> We propose a hybrid approach that is advantageous for low-diameter graphs, which combines a conventional top-down algorithm along with a novel bottom-up algorithm. The bottom-up algorithm can dramatically reduce the number of edges examined, which in turn accelerates the search as a whole. On a multi-socket server, our hybrid approach demonstrates speedups of 3.3–7.8 on a range of standard synthetic graphs and speedups of 2.4–4.6 on graphs from real social networks when compared to a strong baseline.

> In the top-down approach, nodes in the active frontier search for an unvisited child, while in our new bottom-up approach, unvisited nodes search for a parent in the active frontier.

> The bottom-up approach is not always advantageous, so we combine it with the conventional topdown approach, and use a simple heuristic to dynamically select the appropriate approach to use at each step

Contents:
- The top-down-vs-bottom-up hybrid idea itself, and the claim that bottom-up wins when the frontier is a large fraction of the graph — directly motivates this topic's `bfs_hybrid_count` switching rule.
- The paper's own reported speedups (3.3–7.8x synthetic, 2.4–4.6x real social-network graphs) — stated in post-notes/internals as the paper's own figures, distinct from this topic's own much smaller demonstration numbers (a from-scratch, unparallelised toggle on a synthetic graph, honestly labelled as showing the *shape* of the saving, not a reproduction of the paper's tuned heuristic or its parallel implementation).
- The dynamic per-step switching heuristic (choosing top-down or bottom-up each round) — the structural idea `bfs_hybrid_count`'s `switch_frac` threshold is a simplified stand-in for.

Red team note: the SC12 conference version's own PDF was not found at a free, directly fetchable host (IEEE Xplore paywalls it); the 2013 *Scientific Programming* journal version, hosted on a third-party aggregator (typeset.io), carries the same hybrid algorithm and reports the same speedup ranges, and is used here instead, with the substitution stated plainly rather than silently.
