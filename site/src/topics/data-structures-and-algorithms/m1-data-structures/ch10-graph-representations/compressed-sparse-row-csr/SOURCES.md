## "Sparse matrix" (Wikipedia)

URL: https://en.wikipedia.org/wiki/Sparse_matrix
Version: accessed 2026-11-03

> The compressed sparse row (CSR) or compressed row storage (CRS) or Yale format represents a matrix M by three (one-dimensional) arrays, that respectively contain nonzero values, the extents of rows, and column indices.

> The CSR format stores a sparse m × n matrix M in row form using three (one-dimensional) arrays (V, COL_INDEX, ROW_INDEX).

> The arrays V and COL_INDEX are of length NNZ, and contain the non-zero values and the column indices of those values respectively

> The array ROW_INDEX is of length m + 1 and encodes the index in V and COL_INDEX where the given row starts.

> CSC is similar to CSR except that values are read first by column, a row index is stored for each value, and column pointers are stored.

> This format is efficient for arithmetic operations, column slicing, and matrix-vector products.

Contents:
- CSR's three-array layout (values, column indices, row-start offsets) and how a row is extracted as a slice of the other two arrays.
- CSC as the transposed idea: values read column-first, with a row index per value and column-start offsets.
- CSC's own strengths: column slicing and matrix-vector products, the reverse-direction analogue of what CSR is good at.

## "Cuthill–McKee algorithm" (Wikipedia)

URL: https://en.wikipedia.org/wiki/Cuthill%E2%80%93McKee_algorithm
Version: accessed 2026-11-03

> The Cuthill–McKee algorithm is then a relabeling of the vertices of the graph to reduce the bandwidth of the adjacency matrix.

> First we choose a peripheral vertex (the vertex with the lowest degree)

> The algorithm produces an ordered n-tuple

Contents:
- RCM relabels vertices to reduce adjacency-matrix bandwidth (how far, in the new numbering, a vertex's neighbours sit from it).
- The algorithm starts from a peripheral (lowest-degree) vertex and builds the new order by visiting in a breadth-first sweep from there.
- "Reverse" Cuthill–McKee is the plain Cuthill–McKee order read backwards, which in practice narrows the matrix's profile further than the forward order.

## "Optimizing Cache Performance for Graph Analytics" (Zhang, Kiriansky, Mendis, Zaharia, Amarasinghe; arXiv:1608.01362v2)

URL: https://arxiv.org/abs/1608.01362v2
Version: v2, 5 Aug 2016

> The first, vertex reordering, sorts the vertices by degree to improve the utilization of each cache line with no runtime overhead.

> Our techniques combined give speedups of up to 4$\times$ for PageRank and Collaborative Filtering, and 2$\times$ for Betweenness Centrality over the best published results.

Contents:
- Degree-sort reordering: relabel vertices by descending degree so that high-degree ("hub") vertices, which dominate random accesses during traversal, share cache lines instead of being scattered.
- Measured payoff from degree-sort reordering combined with a second technique (CSR segmenting): up to 4x on PageRank/Collaborative Filtering and 2x on Betweenness Centrality, against the best published in-memory graph frameworks of the time.
- The paper frames this as a cache-line utilization problem, not an asymptotic complexity change — the real win this topic's own measurement reproduces at a smaller scale.

## "Community structure" (Wikipedia)

URL: https://en.wikipedia.org/wiki/Community_structure
Version: accessed 2026-11-03

> a network is said to have community structure if the nodes of the network can be easily grouped into (potentially overlapping) sets of nodes such that each set of nodes is densely connected internally

> the network divides naturally into groups of nodes with dense connections internally and sparser connections between groups

Contents:
- A community is a set of vertices that are densely connected to each other and more sparsely connected to the rest of the graph.
- Community-order reordering relabels vertices by which detected community they fall into, so densely-interconnected (and so frequently co-traversed) vertices land at nearby labels — the same cache-locality goal as degree sort and RCM, pursued from the graph's cluster structure instead of from degree or breadth-first distance.
