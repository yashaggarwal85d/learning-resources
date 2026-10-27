---
id: dsa.adjacency-lists-matrices-edge
title: Adjacency lists, matrices and edge lists
---

<section data-section="outcomes">

## After this topic you can

- State the space cost and the cost of an edge-existence check and a neighbour-iteration for each of the three representations, and verify them against a real graph.
- Represent the identical directed, weighted, multi-edge graph in all three ways, and name the one query each representation makes expensive.
- Define a DAG and recognise the one representation detail (multi-edges) that an adjacency matrix cannot express.

</section>

<section data-section="internals">

## Into the internals

### The three costs, side by side

| Representation | Space | List a vertex's own neighbours | Test one specific edge |
|---|---|---|---|
| Adjacency list | O(V + E) | O(out-degree) | O(out-degree of the source), searching its own chain |
| Adjacency matrix | O(V²) | O(V), a full row scan | O(1), one cell |
| Edge list | O(E), no per-vertex term | not supported directly (scan all E) | O(E) in the worst case, scanning every row |

Wikipedia's own general statement of the adjacency-list edge-test cost is "time proportional to the minimum degree of the two given vertices" — that framing applies when the same edge is reachable from *either* endpoint's own list, which is the normal case for an **undirected** graph (every edge is entered at both endpoints). This topic's own graph is directed, and its adjacency list holds only *out*-edges at their source; there is only one list to search, so the cost reduces to the source vertex's own out-degree specifically, a special case of the same general claim rather than a different one.

### Directed, undirected, weighted — one variation each, not three new structures

A directed edge is one entry (list), one asymmetric cell (matrix), one ordered triple (edge list). An undirected edge is the identical edge entered twice in a list (once per endpoint), one symmetric pair of cells in a matrix, or one unordered pair in an edge list. A weight just changes what each entry holds — a pair instead of a bare neighbour, a stored value instead of a boolean, a third field in the triple. None of the three are a fourth representation; each is the same shape, read one way or the other.

### Loops

A self-edge (a vertex pointing at itself) is forbidden outright in a *simple* graph; once loops are allowed, the matrix's own diagonal convention differs by source depending on whether the graph is directed or undirected (a loop is sometimes counted once, sometimes twice, as long as one convention is followed consistently). This topic's own small graph has no loops, by choice, not by the inability of any representation to hold one.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds the chapter's own small graph (6 vertices, 10 directed weighted edges, one real multi-edge) and derives all three representations from it programmatically — never drawn by hand only. It asserts the real space each one occupies (16 list entries including empty chains' own headers, 36 matrix cells, 10 edge-list rows), demonstrates directly that the matrix's own (A, B) cell keeps the second edge's weight (7) and loses the first (4), and counts the real number of probes each representation needs to list A's own neighbours (3, matching its out-degree) and to test a non-edge (A to F: 3 probes against the list's own chain, one lookup against the matrix). It then scales the identical construction to 1,000 vertices at an average out-degree of 3, and reports the real crossover: the adjacency list's own space is 4,000 units, the edge list's is 3,000, and the matrix's is 1,000,000 — 250 times the list's own size, for the identical graph.

</section>

<section data-section="production">

## In production

Real graph libraries rarely implement a textbook "array of linked lists" adjacency list exactly as described here, for the reason this chapter's own next topic opens on directly: a linked list pays a pointer and a heap allocation per edge, which adds up fast at scale and scatters a vertex's own neighbours across memory instead of keeping them together. Compressed sparse row, next, is built specifically to remove that per-edge pointer overhead while keeping an adjacency-list-like cost profile.

</section>

<section data-section="frontier">

## The frontier

Graphs as sparse matrices (the GraphBLAS API, expressing graph algorithms like BFS as matrix-vector multiplication over a semiring) and property-graph storage (the index-free adjacency and labelled-property model behind graph databases) are both named here only in passing — this chapter's own syllabus marks both as skipped (`syllabus/review-notes/dsa-cuts.md`).

</section>

<section data-section="questions">

## More questions

- A graph has 1,000 vertices and only 500 edges, most of them isolated. Which of the three representations here is genuinely the smallest, and by how much, against each of the other two?
- Why does testing "does an edge exist" never cost more than one lookup in a matrix, no matter how large the graph's own vertex count grows — and why is that specifically *not* true for an adjacency list, however the graph is laid out?

</section>

<section data-section="next">

## Where this goes next

Three representations, three different costs for the same two queries — and none of them is free at scale: an adjacency list pays a pointer and an allocation per edge, millions of times over on a billion-edge graph. The next topic asks what a graph representation looks like when it's built for exactly that scale instead of for convenience. Compressed sparse row, next.

</section>
