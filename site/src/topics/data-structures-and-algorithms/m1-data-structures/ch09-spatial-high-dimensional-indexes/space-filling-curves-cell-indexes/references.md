Last verified: 2026-10-24. Expert sign-off: pending.

- "Z-order curve" (Wikipedia) — the bit-interleaving construction, its locality property, and its use in commercial database systems. [source](https://en.wikipedia.org/wiki/Z-order_curve)
- "Hilbert curve" (Wikipedia) — the curve's own locality property, and its stated advantage over Z-order for multidimensional databases. [source](https://en.wikipedia.org/wiki/Hilbert_curve)
- "Geohash" (Wikipedia) — geohash's own relationship to Z-order, base-32 encoding, and its one-directional prefix-locality guarantee. [source](https://en.wikipedia.org/wiki/Geohash)
- "S2 Cells" (S2Geometry official developer guide) — the cube projection and the per-face Hilbert curve construction. [source](https://s2geometry.io/devguide/s2cell_hierarchy.html)
- "Aggregation" and "Overview of the H3 Geospatial Indexing System" (H3 official docs) — the equidistant-neighbour rationale for hexagonal cells, and the twelve-pentagon limit. [source](https://h3geo.org/docs/highlights/aggregation/)

Canonical numbers (real distances for three near-neighbour pairs, in row-major, Z-order, and
Hilbert order, over an 8x8 grid) are computed and asserted directly in this topic's `examples.py`,
on this machine, in one run.

Related tracks (see Prerequisites): Chapter 8's own Fenwick and segment trees (prior topics) for
the one-dimensional structures this chapter's own curves exist to let stand in for a
multi-dimensional index; Data Engineering §6.3 for Delta Lake's `ZORDER BY` and liquid clustering,
the real system using these exact techniques; adjacency lists, matrices and edge lists (next) for
Chapter 10.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=space-filling-curves-cell-indexes:%20).
