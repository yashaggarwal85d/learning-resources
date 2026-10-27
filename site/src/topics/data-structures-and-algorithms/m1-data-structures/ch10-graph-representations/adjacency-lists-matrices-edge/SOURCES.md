## Wikipedia — "Adjacency list"

URL: https://en.wikipedia.org/wiki/Adjacency_list
Version: fetched 2026-10-27

> In graph theory and computer science, an adjacency list is a collection of unordered lists used to represent a finite graph. Each unordered list within an adjacency list describes the set of neighbours of a particular vertex in the graph. This is one of several commonly used representations of graphs for use in computer programs.

> The main operation performed by the adjacency list data structure is to report a list of the neighbours of a given vertex. Using any of the implementations detailed above, this can be performed in constant time per neighbour. In other words, the total time to report all of the neighbours of a vertex v is proportional to the degree of v.

> It is also possible, but not as efficient, to use adjacency lists to test whether an edge exists or does not exist between two specified vertices. In an adjacency list in which the neighbours of each vertex are unsorted, testing for the existence of an edge may be performed in time proportional to the minimum degree of the two given vertices, by using a sequential search through the neighbours of this vertex.

> The main alternative to the adjacency list is the adjacency matrix, a matrix whose rows and columns are indexed by vertices and whose cells contain a Boolean value that indicates whether an edge is present between the vertices corresponding to the row and column of the cell. For a sparse graph (one in which most pairs of vertices are not connected by edges) an adjacency list is significantly more space-efficient than an adjacency matrix (stored as a two-dimensional array): the space usage of the adjacency list is proportional to the number of edges and vertices in the graph, while for an adjacency matrix stored in this way the space is proportional to the square of the number of vertices.

> The other significant difference between adjacency lists and adjacency matrices is in the efficiency of the operations they perform. In an adjacency list, the neighbours of each vertex may be listed efficiently, in time proportional to the degree of the vertex. In an adjacency matrix, this operation takes time proportional to the number of vertices in the graph, which may be significantly higher than the degree. On the other hand, the adjacency matrix allows testing whether two vertices are adjacent to each other in constant time; the adjacency list is slower to support this operation.

### Contents (item by item, this topic's scope)

- The adjacency list's own definition: one unordered list per vertex, holding that vertex's own neighbours.
- Its two costs, stated directly: neighbour-listing in time proportional to the vertex's own degree (cheap); edge-existence testing in time proportional to the minimum of the two vertices' own degrees (not O(1)).
- The direct, sourced trade-off against the adjacency matrix this topic's own comparison rests on: space proportional to V + E for the list against V² for the matrix; O(V) neighbour-listing for the matrix against O(degree) for the list; O(1) edge-existence for the matrix against O(min degree) for the list.

## Wikipedia — "Adjacency matrix"

URL: https://en.wikipedia.org/wiki/Adjacency_matrix
Version: fetched 2026-10-27

> In graph theory and computer science, an adjacency matrix is a square matrix used to represent a finite graph. The elements of the matrix indicate whether pairs of vertices are adjacent or not within the graph.

> The same concept can be extended to multigraphs and graphs with loops by storing the number of edges between each two vertices in the corresponding matrix element, and by allowing nonzero diagonal elements.

### Contents (item by item, this topic's scope)

- The adjacency matrix's own definition (first quote above): a square matrix over the vertex set, cell marking whether an edge is present.
- The multigraph extension, and the honest limit this topic's own scope clause rests on: "storing the number of edges" works for an unweighted multigraph (a count in the cell), but a cell holds only one single value — not a count and a set of distinct weights together, which is exactly why a weighted multigraph's parallel edges can't both keep their own weight in the matrix.
- The matrix's own space cost (proportional to V², sourced a second way via the Graph (abstract data type) page below) is cross-checked against the adjacency list page's own direct V² vs V+E comparison, already quoted above.

## Wikipedia — "Edge list"

URL: https://en.wikipedia.org/wiki/Edge_list
Version: fetched 2026-10-27

> An edge list is a data structure used to represent a graph as a list of its edges. An (unweighted) edge is defined by its start and end vertex, so each edge may be represented by two numbers.

### Contents (item by item, this topic's scope)

- The edge list's own definition: a flat list of edges, each one its own start and end vertex (two numbers unweighted; the source separately gives three numbers once a weight is added) — directly supporting this topic's own weighted-edge-list clause. The page further states (not reproduced verbatim here) that the total space for an edge list is Θ(|E|), the source for this topic's stated edge-list space cost, distinct from the adjacency list's own V + E and the matrix's own V².

## Wikipedia — "Multigraph"

URL: https://en.wikipedia.org/wiki/Multigraph
Version: fetched 2026-10-27

> In mathematics, and more specifically in graph theory, a multigraph is a graph which is permitted to have multiple edges

> Thus two vertices may be connected by more than one edge.

### Contents (item by item, this topic's scope)

- The multigraph's own definition: a graph permitting more than one edge between the identical pair of vertices — the chapter's own small graph builds in exactly one such pair, to show how each of the three representations handles it.

## Wikipedia — "Directed acyclic graph"

URL: https://en.wikipedia.org/wiki/Directed_acyclic_graph
Version: fetched 2026-10-27

> In mathematics, particularly graph theory, and computer science, a directed acyclic graph (DAG) is a directed graph with no directed cycles. That is, it consists of vertices and edges (also called arcs), with each edge directed from one vertex to another, such that following those directions will never form a closed loop. A directed graph is a DAG if and only if it can be topologically ordered, by arranging the vertices as a linear ordering that is consistent with all edge directions.

> Directed acyclic graphs are also called acyclic directed graphs

### Contents (item by item, this topic's scope)

- The DAG's own definition this topic names: a directed graph with no directed cycle, equivalently one that can be topologically ordered — stated here as vocabulary a later Milestone 2 topic (topological sort, DAG shortest paths) will assume without re-defining.

## Wikipedia — "Graph (abstract data type)"

URL: https://en.wikipedia.org/wiki/Graph_(abstract_data_type)
Version: fetched 2026-10-27

> Vertices are stored as records or objects, and every vertex stores a list of adjacent vertices. This data structure allows the storage of additional data on the vertices.

> A two-dimensional matrix, in which the rows represent source vertices and columns represent destination vertices. Data on edges and vertices must be stored externally. Only the cost for one edge can be stored between each pair of vertices.

### Contents (item by item, this topic's scope)

- A second, independent source confirming the adjacency list's own vertex-keyed-list shape and the adjacency matrix's own source-row/destination-column shape.
- "Only the cost for one edge can be stored between each pair of vertices" — a second, independent confirmation of the adjacency matrix's own multigraph limit this topic's scope clause names.
