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

Note — still needed before fact-check closes (not a source, no quotes here):
- The original Cuthill–McKee 1969 paper, or a textbook treatment, fetched directly (currently only cited secondhand via SciPy's docs).
- A primary source with a measured locality/cache-miss result for degree-sort or RCM reordering on a large graph, to cross-check this topic's own `examples.py` measurement against, per CHAPTER.md's "Sources to start from." Candidates to try next session: GAP Benchmark Suite paper, a graph-processing systems paper (Ligra/GraphIt/GBBS) with a reordering ablation, or Intel/academic cache-locality-of-graph-layouts papers. (One guessed VLDB PDF URL this session resolved to the journal's landing page, not the paper — discarded, not cited.)
