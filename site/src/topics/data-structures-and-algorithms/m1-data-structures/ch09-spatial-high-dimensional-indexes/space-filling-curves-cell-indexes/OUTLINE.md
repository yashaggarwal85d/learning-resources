# Outline — Space-filling curves and cell indexes (topic 35, dsa.space-filling-curves-cell-indexes, full)

## Learning outcomes

- Build a Z-order (Morton) code for a 2D point by hand, by interleaving its coordinates' own bits, and verify it visits every grid cell exactly once.
- Build a Hilbert curve's own ordering for the identical point set, and measure, on a fixed set of near-neighbour pairs, that it keeps them closer together in the resulting one-dimensional order than Z-order does.
- Name geohash, S2 cells, and H3 hexagons as production systems built on this same idea, and state the one specific design choice (interleaving scheme, projection, or cell shape) that distinguishes each from the others.

## Engagement arc (full topic: 2 predicts, 13 min)

- **Hook** (step 1): every structure through Chapter 8 ordered one array by position or key; this chapter asks how to order points scattered across two dimensions the same way.
- **Predict 1** (step 3, "ZOrderPredict"): does bit-interleaving actually fix row-major's own locality problem, or just move it?
- **Predict 2** (step 6, "HilbertPredict"): can a different curve fix the specific case where Z-order still breaks?
- **Surprising number**: the topic's own `examples.py` measures real one-dimensional distances for three near-neighbour pairs, in row-major, Z-order, and Hilbert order.
- **Takeaways** (steps 4, 7, 9). Step 2 carries its own point in the body instead (the "from" step the phone-swipe check watches).
- **Recap** (step 9, "ProveIt").

## 9-step reel storyboard

1. **Opening.** *Title:* topic 34's own handoff, quoted word for word (see "Bridge" below). *Body:* "Two points that are neighbours on a map — how far apart do they land once they're squeezed into one line?" *Visual:* a small grid of 2D points, two neighbouring cells highlighted.

2. **NaiveReveal.** *Title:* "The obvious ordering is row-major: number the cells left to right, row by row. It works as an ordering — every cell gets a distinct number — but two cells that are neighbours on the grid can land arbitrarily far apart in it, the moment they're in different rows." *Body:* "Row-major has no special relationship to the grid's own two dimensions. One step down is a huge jump in the ordering." *Visual:* the grid numbered row-major, a vertically adjacent pair's own large gap highlighted in cherry.

3. **ZOrderPredict.** *Title:* "Z-order fixes this by interleaving each coordinate's own bits into a single ordering. Does that actually keep every pair of grid neighbours close together, or only some of them?" *Predict options:* (a) "Yes — bit-interleaving keeps every neighbour pair close, with no exceptions" (b) "It keeps most neighbour pairs close, but still breaks down at some boundaries", correct (c) "No — bit-interleaving is no better than row-major" (d) "It only works for horizontal neighbours, never vertical ones." *Visual:* the same grid, a question mark over the ordering about to be traced.

4. **ZOrderReveal.** *Title:* "Z-order interleaves each coordinate's own bits, one bit from each axis in turn, into a single z-value. Connecting the z-values in order traces a recursively Z-shaped path, and the whole construction visits every one of the grid's cells exactly once." *Body:* "A point's own ordering now depends on both coordinates together, not one row at a time." *Visual:* the Z-order path traced cell by cell by bit-interleaving, in caramel.
   *Takeaway (step 4):* "Z-order orders points by interleaving their coordinates' own bits, one bit per axis in turn, visiting every grid cell exactly once."

5. **BoundaryReveal.** *Title:* "Near the grid's own origin corner, Z-order's ordering is already about as tight as row-major's. But a step across a power-of-two boundary — crossing from one quadrant into the next — can jump the ordering by far more than a single step." *Body:* "The same interleaving that keeps nearby bits together inside one quadrant has nothing to say about two cells on opposite sides of a boundary." *Visual:* a vertically adjacent pair straddling a quadrant boundary, its own large z-order gap highlighted in cherry, directly beside the small, tight gap from a pair inside one quadrant.

6. **HilbertPredict.** *Title:* "A Hilbert curve is built recursively instead of by simple bit-interleaving. Can a curve built this way avoid Z-order's own boundary jump?" *Predict options:* (a) "No — any space-filling curve must jump at some boundary" (b) "Yes — a Hilbert curve can keep exactly this pair adjacent", correct (c) "Yes, but only by giving up the one-cell-per-visit guarantee" (d) "No — Hilbert curves are only defined for one dimension at a time." *Visual:* the same boundary-straddling pair, now beside a sketched Hilbert path's own turn at that same boundary.

7. **HilbertReveal.** *Title:* "A Hilbert curve's own recursive construction — each quadrant visited in an order and orientation chosen so the path never has to jump across a boundary it's about to re-enter — keeps the identical boundary pair adjacent in its ordering, where Z-order's jump was large." *Body:* "More involved to construct than interleaving bits, but the construction itself is what buys the tighter locality." *Visual:* the Hilbert path traced cell by cell by its own recursive construction, over the identical grid, in caramel beside Z-order's own path in cinnamon.
   *Takeaway (step 7):* "A Hilbert curve's recursive construction keeps the boundary pair Z-order jumped on close together instead, at the cost of a more involved encode and decode step."

8. **CellIndexReveal.** *Title:* "Three production systems fix one specific curve and cell shape over this same idea: geohash interleaves latitude and longitude Z-order-style into a base-32 string; S2 projects the sphere onto a cube and runs a Hilbert curve on each of its six faces; H3 tiles the sphere in hexagons instead of squares, because a hexagon's six neighbours are all the same distance from its centre, where a square's corner neighbours sit farther away than its edge neighbours." *Body:* "Three different answers to the identical question this topic just built by hand: which curve, and which cell shape." *Visual:* three small panels, one per system, each showing its own one distinguishing choice over the identical grid motif.

9. **ProveIt.** *Title:* "Prove it." *Body:* "Measured, not assumed: three real near-neighbour pairs, each one's real distance apart in row-major order, Z-order, and Hilbert order, computed directly in this topic's own code." *Visual:* three grouped bars, one group per pair, populated with `examples.py`'s own measured numbers.
   *Takeaway (step 9):* "Across three measured near-neighbour pairs, Z-order's own worst jump is twenty-two cells where Hilbert's worst is one — but right at the grid's own origin, Z-order already ties row-major, and Hilbert is not the smallest there."

## Narrator's line of thought (one bullet per step)

1. Every structure so far ordered one array. This chapter asks the same ordering question about points in two dimensions instead of one.
2. Before any special ordering: the most obvious thing, number the grid row by row. It's a real ordering. It's also not a good one for neighbours in different rows.
3. Before the reveal, think about what happens to a point's own ordering if you weave its two coordinates' bits together instead of numbering by rows.
4. Here's the construction: alternate bits from each axis, build one number, and the whole thing is still a bijection onto every cell.
5. Here's the catch people miss: interleaving fixes most of row-major's problem, but it has nothing special to say about two cells that happen to sit on opposite sides of a power-of-two boundary.
6. Before this reveal, think about whether a differently built curve could specifically avoid the exact case that just broke.
7. This is the whole trick: a recursive construction, not a flat bit-interleave, chosen so the path never jumps across the boundary it's about to come back to.
8. These aren't abstractions — three real, named production systems each made one specific choice on top of the identical idea just built by hand.
9. This is the one place in the whole topic where every claimed number gets checked against a real count, including the honest case where Z-order isn't actually behind.

## Post-notes headings

- **Internals**: the bit-interleaving construction behind Z-order, and the quadrant-by-quadrant recursive construction behind the Hilbert curve, side by side.
- **Lab**: `examples.py`'s own measured distances for three near-neighbour pairs, in row-major, Z-order, and Hilbert order, including the honest result at the grid's own origin.
- **Production**: geohash, S2 cells, and H3 hexagons, each one's own distinguishing design choice over the identical underlying idea.
- **Frontier**: named only in passing — k-d trees, quadtrees/octrees, and R-trees (the family of techniques that build a genuinely new multi-dimensional tree shape, rather than linearizing first), and Delta Lake's own `ZORDER BY` and liquid clustering, where this course's Data Engineering track picks these exact techniques back up.
- **Where this goes next**: Chapter 10's own opening question — not how values are ordered, but how a graph's own edges are laid out in memory.

## Examples-to-execute list

1. Build row-major, Z-order (Morton), and Hilbert orderings over the identical small grid, and verify each one visits every cell exactly once (a bijection onto the full index range).
2. Hand-verify one Z-order code directly from its coordinates' own interleaved bits.
3. Measure the real one-dimensional distance, in each of the three orderings, for three fixed near-neighbour pairs: one near the grid's own origin, one crossing a horizontal quadrant boundary, one crossing a vertical quadrant boundary.
4. Confirm Z-order's own worst jump, among the three pairs, is the boundary-crossing pair, and that Hilbert keeps that identical pair adjacent.
5. Report the honest exception along with the favourable cases: at the pair nearest the grid's own origin, Z-order ties row-major and Hilbert is not the smallest of the three.

## Bridge (topic 34's own handoff, quoted word for word)

"Fenwick trees and segment trees both answer aggregate questions over a changing array in O(log n), whichever one fits the operator and the update pattern. The next chapter asks a different question about dimension instead: not where a value sits along one array, but how to order points scattered across two or three dimensions so that nearby points end up nearby in a single linear ordering. Space-filling curves, next."

## Handoff (this topic's own, quoted word for word from `CHAPTER.md`)

"A space-filling curve turns points scattered across several dimensions into one ordering that keeps nearby points nearby, letting an ordinary one-dimensional structure index spatial data directly. The next chapter asks a structural question instead, about connections rather than coordinates: how a graph's own edges are laid out in memory, and why that layout alone decides which algorithms run fast on it. Adjacency lists, matrices and edge lists, next."

## Concept ledger

- **Introduces:** `space-filling-curve`, `morton-code`, `hilbert-curve`, `cell-index`.
- **Uses:** none from an earlier chapter as a reused mechanism.
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. Z-order/Morton code maps multidimensional data to one dimension by bit-interleaving, preserving locality of nearby points with high probability → Wikipedia "Z-order curve".
2. The z-value is calculated by bit-interleaving the binary representations of a point's own coordinates, built by alternating the x-bit and y-bit starting from the low bit → Wikipedia.
3. Once sorted by interleaved bits, any one-dimensional structure (array, BST, B-tree, skip list, hash table) can index the result directly → Wikipedia.
4. Z-order preserves locality "well" but not perfectly; efficient range queries still need extra machinery (BIGMIN/LITMAX) for the cases it does not handle → Wikipedia.
5. Z-order is one of the few multidimensional access methods that has found its way into commercial database systems → Wikipedia.
6. A Hilbert curve preserves locality between 1D and 2D "fairly well," and the converse (close in 1D implies close in 2D) is not guaranteed → Wikipedia "Hilbert curve".
7. Hilbert order has been proposed over Z-order for multidimensional databases specifically because it has better locality-preserving behavior → Wikipedia.
8. Geohash is built directly on the Z-order curve (independently reinvented by Niemeyer in 2008, decades after Morton's 1966 original), encoded in base-32 → Wikipedia "Geohash".
9. Geohash's own prefix-locality guarantee is one-directional: a shared prefix implies closeness, but closeness does not guarantee a shared prefix → Wikipedia.
10. S2 projects the sphere's six cube faces and runs a Hilbert curve on each, joined into one continuous loop and encoded as a single 64-bit cell id → S2Geometry official developer guide.
11. H3 chooses hexagonal cells specifically because all six of a hexagon's neighbours are equidistant, where a triangle has three different neighbour distances and a square has two → H3 official docs ("Aggregation").
12. H3 cannot tile a sphere purely in hexagons; every resolution keeps exactly 12 pentagons → H3 official docs ("Overview").

## Claims not made

- The exact numeric locality advantage of Hilbert over Z-order is not claimed as universal: this topic's own `examples.py` measures three fixed pairs and reports the honest result that at the pair nearest the grid's own origin, Z-order already matches row-major and Hilbert is not the smallest of the three — the advantage shows up specifically at the boundary-crossing pairs, not everywhere. Averaging all three pairs still favours Hilbert, but the per-pair result is reported honestly rather than only the favourable average.
- Neither k-d trees, quadtrees/octrees, nor R-trees are built or compared against Z-order/Hilbert in this topic; the chapter plan skips all three outright (`syllabus/review-notes/dsa-cuts.md`), and this topic keeps to the one family of techniques it was planned to cover (linearize first, reuse a one-dimensional index) rather than building the skipped family's own tree shapes.
- Geohash, S2, and H3 are named and sourced from each one's own official documentation, but none of the three is rebuilt at production scale; only the one design choice that distinguishes each from the others is stated.
- Delta Lake's own `ZORDER BY` and liquid clustering are named in passing, per the chapter plan's own cross-domain link to this course's Data Engineering track (§6.3), not rebuilt here.
- The BIGMIN/LITMAX range-search algorithm that makes Z-order efficient for range queries is named (Wikipedia's own caveat about Z-order's locality not being perfect) but not built; this topic's own scope is the ordering and its locality, not range-query machinery on top of it.
