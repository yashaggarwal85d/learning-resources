# Outline — de.data-layout-sorting-z

1. **Hook.** Topic 18 answered what file size costs. This topic is the other half: whether the
   rows inside each file are actually laid out so a statistic can prune anything at all, for a
   predicate that filters on two columns at once.
2. **Predict: a table is sorted by column A only — does that help a predicate that filters on both
   A and B?** Yes, fully / Only partly. Correct: only partly.
3. **Reveal: reproduced for real — the same 256 rows, three different physical orders.** The
   identical dataset, laid out as arrival order, a linear sort by (A, B), and a real Z-order —
   same rows, same count, genuinely different order on disk.
4. **Reveal: reproduced for real — real row-group bounds, computed directly.** Sixteen real row
   groups per layout; the linear sort's own groups line up exactly with single A-values, each
   spanning the full range of B.
5. **Reveal: reproduced for real — the identical two-column predicate, measured against each
   layout.** Arrival order needs every group. A linear sort prunes on A alone. A real Z-order
   prunes to a single group.
6. **Predict: does Delta's liquid clustering rewrite the whole table every time new data
   arrives?** Yes, always / No, only what's needed. Correct: no, only what's needed.
7. **Reveal: Delta's, Iceberg's, and Hudi's own words — three formats, the same one idea.** Delta's
   liquid clustering, Iceberg's sort orders, and Hudi's clustering all exist to make the physical
   layout match the columns a query actually filters on.
8. **Reveal: reproduced for real — incremental versus full reclustering, measured by rows
   rewritten.** New rows landing in one already-clustered group: incremental reclustering rewrites
   only that group; a full reclustering rewrites the entire table.
9. **Recap.** A linear sort order only prunes on its leading column; a real Z-order gives a
   genuine multi-column predicate real pruning on every column at once; and reclustering an
   already-laid-out table can be incremental, touching only what changed, or full.
