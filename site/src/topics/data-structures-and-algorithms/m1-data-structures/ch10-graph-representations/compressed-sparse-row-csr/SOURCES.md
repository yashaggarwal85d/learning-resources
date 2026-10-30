# Sources — dsa.compressed-sparse-row-csr

## cuSPARSE 13.4 documentation (NVIDIA)
URL: https://docs.nvidia.com/cuda/cusparse/index.html
Version: 13.4

> The CSR format is similar to COO, where the row indices are compressed and replaced by an array of offsets.

> The CSR format has exactly the same memory layout as its transpose in CSC format (and vice versa).

Contents (for coverage.json):
- CSR's row-offset + column-index array layout, confirming the two-array ("offsets"/"targets" in this topic's own naming) shape.
- CSR/CSC as transposes of each other with identical memory layout — the primary-source backing for this topic's "CSC is CSR transposed" claim.

## SciPy `scipy.sparse.csgraph.reverse_cuthill_mckee` reference (SciPy v1.18.0)
URL: https://docs.scipy.org/doc/scipy/reference/generated/scipy.sparse.csgraph.reverse_cuthill_mckee.html
Version: 1.18.0

> Returns the permutation array that orders a sparse CSR or CSC matrix in Reverse-Cuthill McKee ordering.

Cites: E. Cuthill and J. McKee, "Reducing the Bandwidth of Sparse Symmetric Matrices", ACM '69 Proceedings of the 1969 24th national conference (1969) — original RCM paper, named but not yet separately fetched.

Contents (for coverage.json):
- Confirms RCM operates directly on a CSR/CSC-represented graph (reordering composes with the representation this topic builds), and that it is a bandwidth-reduction/permutation technique, not a from-scratch layout.

## "Locality-based Graph Reordering for Processing Speed-Ups and Impact of Diameter" (Satav, IIT Bombay thesis, arXiv:2111.12281)
URL: https://arxiv.org/pdf/2111.12281
Version: July 4th, 2021

> Earlier research has shown that the cache miss latency is responsible for more than half of the graph processing time, with the CPU execution having the smaller share.

> Graph Reordering attempts to exploit the power-law distribution of graphs- few sparsely-populated vertices in the graph have high number of connections- to keep the frequently accessed vertices together locally and hence decrease the cache misses. However, reordering the graph by keeping the hot vertices together may affect the spatial locality of the graph, and thus add to the total CPU compute time.

> A simple reordering of the graph vertices on the basis of their degree would threaten to disrupt the spatial locality of neighbourhoods in the original graph structure. For graph processing algorithms that are neighbourhood-based, like BFS, decreasing the spatial locality can therefore lead to worse, if not the same, post-reordering execution time.

Contents (for coverage.json):
- The actual measured motivation for reordering at all: cache miss latency, not CPU compute, dominates graph-processing time — this is the primary-source number behind this topic's "measured, not asserted" locality claim.
- The real tradeoff a degree-sort-only reordering has: it clusters hot (high-degree) vertices together for temporal-locality reuse, but can disrupt the spatial locality that neighbourhood-walking algorithms (BFS, this topic's own traversal) depend on — this is the primary-source backing for naming BFS/RCM and community order as real alternatives to plain degree sort, not just restating the syllabus line.

Note — still needed before fact-check closes (not a source, no quotes here):
- The original Cuthill–McKee 1969 paper is paywalled (ACM DL, DOI 10.1145/800195.805928); no freely fetchable full text found this session. SciPy's own reference (above) is kept as the primary source for "what RCM computes and that it operates on CSR/CSC," which is the only claim this topic needs about RCM itself — the historical bandwidth-reduction framing is dropped rather than cited secondhand.
- This topic's own `examples.py` measurement (degree-sort reordering vs. no reordering, cache misses or wall-clock, on the chapter's large synthetic graph) is the thing actually shown on screen; the arXiv source above is the cross-check that the direction and rough order of magnitude of the effect is real, not that this topic reproduces its exact numbers.
