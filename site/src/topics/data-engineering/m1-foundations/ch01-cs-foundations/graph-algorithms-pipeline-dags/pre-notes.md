- **Graph, vertex, edge**: a graph is a set of vertices (things) joined by edges (relationships). *Where you meet it:* a road map, a social network, or a list of which task depends on which.
- **Directed vs undirected edge**: a directed edge is an arrow from one vertex to another; an undirected edge joins two vertices with no direction. *Where you meet it:* "follows" on a social network is directed, "friends" is not.
- **Path**: a sequence of vertices where each is joined to the next by an edge. *Where you meet it:* a route from one city to another through intermediate stops.
- **Queue**: a first-in, first-out list: the oldest item leaves first. *Where you meet it:* a print queue, or Python's `collections.deque`.
- **O(V + E)**: a cost that grows with the number of vertices plus the number of edges. *Where you meet it:* "a traversal visits every vertex and edge once" is O(V + E).

**Check yourself:** in the chain `ingest → clean → load`, which vertices can you reach from `clean` by following arrows? (Answer: `load` only.)
