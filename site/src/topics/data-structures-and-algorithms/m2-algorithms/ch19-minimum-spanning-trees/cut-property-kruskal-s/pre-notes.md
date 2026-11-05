- **Weighted undirected graph** (carried over from Chapter 10): vertices joined by edges
  that go both ways, each edge carrying a cost. *Where you meet it:* every edge in this
  topic's graph can be crossed in either direction, and has a price.
- **Connected graph**: every vertex is reachable from every other. *Where you meet it:* the
  question this topic answers only makes sense when the graph already is one.
- **Cycle**: a path that returns to where it started without repeating an edge. *Where you
  meet it:* an edge that would close a cycle is exactly the edge Kruskal's algorithm must
  reject.
- **Tree**: a connected graph with no cycle. *Where you meet it:* a minimum spanning tree is
  a tree, never anything with a cycle in it.
- **Partition of a set**: splitting a set into two non-overlapping pieces that together cover
  everything. *Where you meet it:* a cut is a partition of the vertices into two sides.
- **Greedy algorithm**: take the best local choice right now, and never reconsider it. *Where
  you meet it:* this topic's whole subject is why that instinct, usually wrong, is provably
  right here.
- **Stable sort** (carried over from Chapter 15): equal keys keep their input order. *Where
  you meet it:* sorting edges by weight before Kruskal's scan.
