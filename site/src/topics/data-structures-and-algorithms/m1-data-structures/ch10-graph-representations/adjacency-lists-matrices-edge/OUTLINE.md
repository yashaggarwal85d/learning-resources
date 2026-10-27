# Outline — Adjacency lists, matrices and edge lists (topic 36, dsa.adjacency-lists-matrices-edge, refresher)

## Learning outcomes

- State the space cost and the cost of an edge-existence check and a neighbour-iteration for each of the three representations, and verify them against a real graph.
- Represent the identical directed, weighted, multi-edge graph in all three ways, and name the one query each representation makes expensive.
- Define a DAG and recognise the one representation detail (multi-edges) that an adjacency matrix cannot express.

## Engagement arc (refresher: 1 predict, ~5 min)

- **Hook** (step 1): the identical graph, the identical question — "does an edge exist from X to Y?" — asked against three different representations at once, before any of them is built.
- **Predict 1** (step 3, "MatrixPredict"): does the graph's own real multi-edge survive into the adjacency matrix the same way it survived into the list?
- **Surprising number**: `examples.py`'s own real cell/entry counts for the three representations over the identical small graph, scaled up to show how fast V² outgrows V + E.
- **Takeaways** (steps 4, 5, 7).
- **Recap** (step 7, "WhichRepReveal").

## 8-step reel storyboard

1. **Opening.** *Title:* topic 35's own handoff, quoted word for word (see "Bridge" below). *Body:* "Does an edge exist from this vertex to that one? Ask three different representations of the identical graph, and get three different costs for the identical answer." *Visual:* the chapter's own small directed, weighted graph (with its one real multi-edge) drawn once, with one query highlighted and three empty panels waiting to be filled — list, matrix, edge list.

2. **ListReveal.** *Title:* "An adjacency list stores one short chain of neighbours per vertex. Reading off a vertex's own neighbours costs time proportional to its degree — but checking one specific edge means searching that chain." *Body:* "Space proportional to V + E. Cheap to list a vertex's own neighbours; not free to test one specific pair." *Visual:* the graph redrawn as a row of vertices, each with its own short chain of neighbour cells, the one multi-edge shown as two separate entries in the same vertex's own chain.
   *Takeaway (step 2):* skipped — this is the reel's own "from" step for the phone-swipe check (QUALITY.md #64); its point carries in the body instead.

3. **MatrixPredict.** *Title:* "An adjacency matrix stores one cell per ordered pair of vertices. Does the graph's own real multi-edge survive into the matrix the same way it survived into the list?" *Predict options:* (a) "Yes — the matrix stores both parallel edges, each with its own weight" (b) "It stores that there are two edges, but not each one's own separate weight", correct (c) "No — the matrix can only represent one edge between any pair, full stop" (d) "It depends on whether the graph is directed." *Visual:* the identical graph, the one multi-edge pair highlighted, a single empty matrix cell waiting at that pair's row and column.

4. **MatrixReveal.** *Title:* "A cell holds one value. Two parallel edges can share that one cell as a count — but not as two different weights; one of them is always overwritten." *Body:* "Space proportional to V². Testing one specific edge is now a single lookup; reading a vertex's own neighbours means scanning a whole row." *Visual:* the matrix built over the identical graph, the multi-edge's own cell shown holding a count (2) in cherry, with a small strike-through on the weight that didn't fit.
   *Takeaway (step 4):* "A matrix cell holds one value, so two parallel edges share a count, not two separate weights."

5. **EdgeListReveal.** *Title:* "An edge list is neither a list of neighbours nor a grid of pairs — it is simply every edge, once, as its own entry. Space proportional to E alone, with no cost at all for a vertex that has none." *Body:* "The one representation with no per-vertex structure — which is exactly why it is the natural starting format, not the natural structure to query." *Visual:* the identical graph's edges laid out as a flat row of (u, v, weight) triples, the multi-edge shown as two ordinary, unremarkable rows.
   *Takeaway (step 5):* "An edge list costs space proportional to the edges alone, with nothing paid for a vertex that has none."

6. **DAGReveal.** *Title:* "A directed graph with no directed cycle is a DAG — and a directed graph is a DAG exactly when its vertices admit a single consistent ordering that every edge agrees with." *Body:* "Any of the three representations above can hold a DAG; being a DAG is a property of the edges, not a fourth way to store them." *Visual:* the identical graph (or a trimmed, cycle-free view of it) with its vertices slid into one consistent left-to-right ordering, every edge arrow pointing the same direction along it.

7. **WhichRepReveal.** *Title:* "Breadth-first and depth-first search want a vertex's own neighbours, cheaply and repeatedly — the adjacency list's own strength. An algorithm that keeps asking whether one specific pair is connected wants the matrix's O(1) lookup instead. The edge list is what you start with, before any of the other two exists." *Body:* "Three different costs, three different jobs — no single representation is simply 'the right one.'" *Visual:* the three representations shown side by side one final time, each one's own cheap operation underlined in caramel.
   *Takeaway (step 7):* "No representation is free: pick the one whose cheap operation is the operation the algorithm actually repeats."

8. **ProveIt.** *Title:* "Prove it." *Body:* "Measured, not assumed: this topic's own `examples.py` counts the real cells and entries each representation holds for the identical graph, and for a larger one scaled up from it." *Visual:* three bars (list, matrix, edge list), their real counts at the chapter's own small graph size, beside a second, much taller set of three bars at a scaled-up vertex count, V² visibly running away from V + E.

## Narrator's line of thought (one bullet per step)

1. Same graph, same question, three different costs — that's the whole topic in one line, before any of the three is even built.
2. Here's the adjacency list: a chain per vertex. Reading them off is cheap. Checking one specific pair means walking the chain.
3. Before the reveal: this graph has one real multi-edge — think about what a single matrix cell can actually hold once both of those edges want to live in it.
4. Here's the catch: a cell is one value. Count both edges, sure — but their two separate weights don't both fit.
5. This one has no per-vertex cost at all — which is exactly why it's what you start with, not what you query.
6. DAG isn't a fourth way to store a graph. It's a property — no cycle — that any of the three representations above can hold just fine.
7. Three real jobs, three real winners: cheap neighbours, cheap one-pair lookup, cheap to start from. Pick for the job, not out of habit.
8. Every number here is counted, not estimated — and watch how much faster the matrix's own bars grow once the vertex count goes up.

## Post-notes headings

- **Internals**: the three representations' own exact cost table (space; neighbour-listing; edge-existence), gathered in one place for reference, plus the array-vs-hash-table implementation variants the adjacency-list source names.
- **Lab**: `examples.py`'s own counted cells/entries for the chapter's small graph and for a scaled-up vertex count, showing the V² vs V + E crossover directly.
- **Production**: a brief, honest note that real libraries (and this chapter's own next topic, CSR) depart from a literal "array of linked lists" adjacency list for exactly the reasons the next topic opens on: pointer and allocation overhead at scale.
- **Frontier**: named only in passing — graphs as sparse matrices (GraphBLAS) and property-graph storage, this chapter's own two skipped topics (`syllabus/review-notes/dsa-cuts.md`).
- **Where this goes next**: this topic's own handoff into compressed sparse row.

## Examples-to-execute list

1. Build the chapter's own small directed, weighted, multi-edge graph once, and derive an adjacency list, an adjacency matrix and an edge list from it programmatically (not drawn by hand only).
2. Assert each representation's own real space (a count of list entries, matrix cells, edge-list rows) matches the stated V + E / V² / E formulas for this graph's own V and E.
3. Assert the adjacency matrix's own multi-edge cell holds a count (2), and that attempting to store two distinct weights in one cell loses one of them (demonstrated directly, not merely asserted).
4. Time (or count operations for) a neighbour-iteration and an edge-existence check against each representation, confirming the stated relative costs on this graph.
5. Scale the identical construction up to a larger synthetic vertex count and report the real V + E, V² and E counts side by side, to produce the "surprising number" the reel's own final step shows.
6. Verify the graph (or the cycle-free view used for step 6) is correctly classified as acyclic and admits at least one valid topological ordering, by trying to produce one.

## Bridge (topic 35's own handoff, quoted word for word)

"A space-filling curve turns points scattered across several dimensions into one ordering that keeps nearby points nearby, letting an ordinary one-dimensional structure index spatial data directly. The next chapter asks a structural question instead, about connections rather than coordinates: how a graph's own edges are laid out in memory, and why that layout alone decides which algorithms run fast on it. Adjacency lists, matrices and edge lists, next."

## Handoff (this topic's own, quoted word for word from `CHAPTER.md`)

"Three representations, three different costs for the same two queries — and none of them is free at scale: an adjacency list pays a pointer and an allocation per edge, millions of times over on a billion-edge graph. The next topic asks what a graph representation looks like when it's built for exactly that scale instead of for convenience. Compressed sparse row, next."

## Concept ledger

- **Introduces:** `adjacency-list`, `adjacency-matrix`, `edge-list`, `directed-acyclic-graph`.
- **Uses:** none from an earlier chapter as a reused mechanism.
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. An adjacency list is a collection of unordered lists, one per vertex, holding that vertex's own neighbours → Wikipedia "Adjacency list".
2. Listing a vertex's own neighbours from an adjacency list costs time proportional to that vertex's degree → Wikipedia.
3. Testing whether one specific edge exists in an (unsorted) adjacency list costs time proportional to the smaller of the two vertices' own degrees → Wikipedia.
4. An adjacency list's own space is proportional to V + E; an adjacency matrix's own space (stored as a plain two-dimensional array) is proportional to V² → Wikipedia "Adjacency list".
5. An adjacency matrix is a square matrix whose cell marks whether an edge is present between the row and column vertex → Wikipedia "Adjacency matrix".
6. The adjacency matrix extends to multigraphs by storing the number of edges between each pair of vertices in the corresponding cell → Wikipedia.
7. The adjacency matrix's own cell-per-pair row/column shape, and that only one value can be stored for one edge between a pair, is independently confirmed by the "Graph (abstract data type)" page → Wikipedia.
8. An edge list represents a graph as a flat list of its edges, each one its own start and end vertex (two numbers unweighted) → Wikipedia "Edge list".
9. A multigraph is a graph permitted to have more than one edge between the identical pair of vertices (parallel edges) → Wikipedia "Multigraph".
10. A directed acyclic graph (DAG) is a directed graph with no directed cycle, and a directed graph is a DAG if and only if it can be topologically ordered → Wikipedia "Directed acyclic graph".
11. Directed acyclic graphs are also called acyclic directed graphs → Wikipedia.

## Claims not made

- The adjacency matrix's own multi-edge cell is not claimed to lose information in every case: for an *unweighted* multigraph, a count faithfully represents the edges; the real limit this topic states is specifically about a *weighted* multigraph, where two parallel edges' own distinct weights cannot both live in one scalar cell. This distinction is stated explicitly (step 4), not glossed over.
- This topic does not claim one representation is universally better; "which representation each later algorithm assumes" is stated as a real trade-off against the same costs this topic itself states (step 7), not as a fixed rule.
- Graphs as sparse matrices (GraphBLAS) and property-graph storage are named only in the post-notes "frontier" section, per the chapter plan's own skip list (`syllabus/review-notes/dsa-cuts.md`); neither is built here.
- Space-filling benchmarks or production-library implementation details (e.g. a specific language's own standard-library graph type) are not claimed; the three representations are kept at the textbook level this refresher's own syllabus line asks for, with the scale argument (why none of the three stays satisfying at a billion edges) left for topic 37's own opening.
