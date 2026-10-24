## Wikipedia — "Z-order curve"

URL: https://en.wikipedia.org/wiki/Z-order_curve
Version: fetched 2026-10-24

> In mathematical analysis and computer science, functions which are Z-order, Lebesgue curve, Morton space-filling curve,[1] Morton order or Morton code map multidimensional data to one dimension while preserving locality of the data points (two points close together in multidimensions with high probability lie also close together in Morton order).

> The z-value of a point in multidimensions is simply calculated by bit interleaving the binary representations of its coordinate values.

> Once the data are sorted by bit interleaving, any one-dimensional data structure can be used, such as simple one dimensional arrays, binary search trees, B-trees, skip lists or (with low significant bits truncated) hash tables. The resulting ordering can equivalently be described as the order one would get from a depth-first traversal of a quadtree or octree.

> The figure below shows the Z-values for the two dimensional case with integer coordinates 0 ≤ x ≤ 7, 0 ≤ y ≤ 7 (shown both in decimal and binary). Interleaving the binary coordinate values (starting to the right with the x-bit (in blue) and alternating to the left with the y-bit (in red)) yields the binary z-values (tilted by 45° as shown). Connecting the z-values in their numerical order produces the recursively Z-shaped curve.

> Although Z-order is preserving locality well, for efficient range searches an algorithm is necessary for calculating, from a point encountered in the data structure, the next possible Z-value which is in the multidimensional search range:

> Z-order is one of the few multidimensional access methods that has found its way into commercial database systems.[13]

### Contents (item by item, this topic's scope)

- Z-order/Morton code's own definition: multidimensional coordinates mapped to one dimension by bit-interleaving, preserving locality with high probability.
- The exact interleaving construction (x-bit and y-bit alternated, starting from the low bit) used to build the curve's own ordering by hand.
- Once sorted by interleaved bits, any one-dimensional structure (array, BST, B-tree) can index the result directly — the justification for reusing earlier chapters' structures.
- The honest caveat: Z-order preserves locality "well," not perfectly — a point close in two-dimensional space does not always land close in the one-dimensional order (hence BIGMIN/LITMAX range-search machinery, named but not built in this topic).
- Z-order's real adoption: "one of the few multidimensional access methods that has found its way into commercial database systems."

## Wikipedia — "Hilbert curve"

URL: https://en.wikipedia.org/wiki/Hilbert_curve
Version: fetched 2026-10-24

> Both the true Hilbert curve and its discrete approximations are useful because they give a mapping between 1D and 2D space that preserves locality fairly well.[4] This means that two data points which are close to each other in one-dimensional space are also close to each other after folding. The converse is not always true.

> For multidimensional databases, Hilbert order has been proposed to be used instead of Z order because it has better locality-preserving behavior.

### Contents (item by item, this topic's scope)

- The Hilbert curve's own locality property, stated the same careful way as Z-order's (locality preserved "fairly well," not a perfect guarantee, and the converse — close in 2D implies close in 1D — is explicitly not claimed).
- The direct, sourced comparison this topic measures itself: Hilbert order over Z order specifically because of "better locality-preserving behavior" — the claim the topic's own measured near-neighbour-pair distances must confirm, not just repeat.

## Wikipedia — "Geohash"

URL: https://en.wikipedia.org/wiki/Geohash
Version: fetched 2026-10-24

> Geohash is a public domain geocode system invented in 2008 by Gustavo Niemeyer[2] which encodes a geographic location into a short string of letters and digits.

> It is a hierarchical spatial data structure which subdivides space into buckets of grid shape, which is one of the many applications of what is known as a Z-order curve, and generally space-filling curves.

> Geohashing guarantees that the longer a shared prefix between two geohashes is, the spatially closer they are together. The reverse of this is not guaranteed, as two points can be very close but have a short or no shared prefix.

> Apparently, in the late 2000s, G. Niemeyer still didn't know about Morton's work, and reinvented it, adding the use of base32 representation.

> For exact latitude and longitude translations Geohash is a spatial index of base 4, because it transforms the continuous latitude and longitude space coordinates into a hierarchical discrete grid, using a recurrent four-partition of the space. To be a compact code it uses base 32 and represents its values by the following alphabet, that is the "standard textual representation".

### Contents (item by item, this topic's scope)

- Geohash is explicitly built on the Z-order curve (independently reinvented by Niemeyer in 2008, decades after Morton's 1966 original), confirming it as this chapter's first production example of the Z-order idea.
- Geohash's own prefix-locality guarantee, and its honest asymmetry: a shared prefix implies closeness, but closeness does not imply a shared prefix — the same one-directional locality caveat the topic's Z-order section states.
- The one design choice that distinguishes geohash from a bare Morton code: base-32 text encoding over the interleaved bits, for a human-shareable string.

## S2Geometry — "S2 Cells" (official developer guide)

URL: https://s2geometry.io/devguide/s2cell_hierarchy.html
Version: fetched 2026-10-24

> The top level of the hierarchy is obtained by projecting the six faces of a cube onto the unit sphere, and lower levels are obtained by subdividing each cell into four children recursively.

> Each cell is uniquely identified by a 64-bit S2CellId.

> The particular curve used by S2 is called the S2 space-filling curve, and consists of six Hilbert curves linked together to form a single continuous loop over the entire sphere.

> The S2 curve is based on the Hilbert curve.

### Contents (item by item, this topic's scope)

- S2's own two-step construction: project the sphere onto a cube's six faces, then run a Hilbert curve independently on each face, stitched into one continuous loop and encoded as a single 64-bit cell id.
- The one design choice that distinguishes S2 from geohash: a Hilbert-curve ordering (for its tighter locality) over a cube projection (to avoid a flat plane's distortion near the poles), rather than geohash's Z-order ordering over raw latitude/longitude.

## H3 (official docs) — "Aggregation"

URL: https://h3geo.org/docs/highlights/aggregation/
Version: fetched 2026-10-24

> The cell shape of that grid system is an important consideration. For simplicity, it should be a polygon that tiles regularly: the triangle, the square, or the hexagon. Of these, triangles and squares have neighbors with different distances. Triangles have three different distances, and squares have two different distances. For hexagons, all neighbors are equidistant.

> Triangles have 12 neighbors
Squares have 8 neighbors
Hexagons have 6 neighbors

> Hexagons are also optimally space-filling. On average, a polygon may be filled with hexagon tiles with a smaller margin of error than would be present with square tiles.

### Contents (item by item, this topic's scope)

- The one design choice that distinguishes H3 from geohash and S2: a hexagonal cell shape, chosen specifically because every one of a hexagon's six neighbours sits at the identical distance from its centre, where a square's edge- and corner-neighbours sit at two different distances.

## H3 (official docs) — "Overview of the H3 Geospatial Indexing System"

URL: https://h3geo.org/docs/core-library/overview/
Version: fetched 2026-10-24

> The H3 geospatial indexing system is a discrete global grid system (see Sahr et al., 2003) consisting of a multi-precision hexagonal tiling of the sphere with hierarchical indexes.

> Note that it is impossible to tile the sphere/icosahedron completely with hexagons; each resolution of an icosahedral hexagon grid must contain exactly 12 pentagons at every resolution, with one pentagon centered on each of the icosahedron vertices.

> H3 provides 15 finer grid resolutions in addition to the resolution 0 base cells.

### Contents (item by item, this topic's scope)

- H3's own honest limit, named alongside its hexagon choice rather than glossed over: a sphere cannot be tiled purely in hexagons, so every resolution keeps exactly 12 pentagons.
