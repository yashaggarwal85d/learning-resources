# Sources — Depth-first search and edge classification

## Wikipedia — "Depth-first search"

URL: https://en.wikipedia.org/wiki/Depth-first_search
Version: fetched 2026-11-05

> The result of a depth-first search of a graph can be conveniently described in terms of a spanning tree of the vertices reached during the search. Based on this spanning tree, the edges of the original graph can be divided into three classes: forward edges, which point from a node of the tree to one of its descendants, back edges, which point from a node to one of its ancestors, and cross edges, which do neither. Sometimes tree edges, edges which belong to the spanning tree itself, are classified separately from forward edges. If the original graph is undirected then all of its edges are tree edges or back edges.

> Another possible implementation of iterative depth-first search uses a stack of iterators of the list of neighbors of a node, instead of a stack of nodes. This yields the same traversal as recursive DFS.

Contents:
- The four-way edge classification and the stated fact that an undirected graph's DFS has only tree and back edges — the topic's own structural claim, reused from Chapter 17's shared notation.
- The stack-of-iterators iterative DFS technique, which yields the identical traversal order to the recursive version — the construction `examples.py`'s iterative DFS is built from.

## University of Crete, CS-583 course notes — "Graph Algorithms" (Chapter 3: DFS)

URL: https://www.csd.uoc.gr/~hy583/papers/ch3_4.pdf
Version: fetched 2026-11-05 (course notes presenting the CLRS treatment of DFS; cited as a secondary restatement of CLRS, not CLRS itself, since the original textbook could not be fetched directly)

> In addition, it assigns two timestamps to each vertex: discovery and finishing time. The algorithm initializes each vertex to "white" to indicate that they are not discovered yet.

> Theorem 3.1 (Parenthesis Theorem)

> The intervals [d[u], f[u]] and [d[v], f[v]] are entirely disjoint

> The interval [d[u], f[u]] is contained entirely within the interval [d[v], f[v]], and u is a

> Vertex v is a proper descendant of vertex u in the depth first forest for a graph G if and only if d[u] < d[v] < f[v] < f[u]

> Tree edges are edges in the depth-first forest G . Edge (u,v) is a tree edge if v was first discovered by exploring edge (u,v).

> Back edges are those edges (u,v) connecting a vertex u to an ancestor u in a depth-first tree.

> Forward edges are those non-tree edges (u,v) connecting a vertex u to a descendant v in a depth-first tree.

> Cross edges are all other edges.

> Lemma 3.4 A directed graph G is acyclic (DAG

> if and only if a depth-first search of G yields

> no back edges.

> Suppose that there is a back edge (u, v). Then vertex v is an ancestor of vertex u in the depth-first forest. There is thus a path from v to u in G, and the back edge (u,v) completes a cycle.

Contents:
- Discovery/finish timestamps, the white/grey/black vertex colouring, and the exact definitions of all four edge types (tree, back, forward, cross) — the topic's core definitions.
- The Parenthesis Theorem and the descendant-interval-nesting corollary (`d[u] < d[v] < f[v] < f[u]` iff v is a proper descendant of u) — the structural fact behind every edge classification, quoted and used directly.
- Lemma 3.4 and its proof (a directed graph is acyclic iff DFS yields no back edges) — the exact theorem behind this topic's cycle-detection claim, both directions quoted.

Red team note: this is a university course's own teaching notes presenting the CLRS textbook's results (CLRS 4th ed. chapter on elementary graph algorithms itself could not be fetched directly — no free, legally hosted full text was found). The notes are cited as a secondary restatement, not as CLRS's own words, and every quote above is checked word for word against this specific document, not against CLRS.
