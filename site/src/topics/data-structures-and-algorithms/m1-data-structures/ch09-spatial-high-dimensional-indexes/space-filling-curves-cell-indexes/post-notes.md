---
id: dsa.space-filling-curves-cell-indexes
title: Space-filling curves and cell indexes
---

<section data-section="outcomes">

## After this topic you can

- Build a Z-order (Morton) code for a 2D point by hand, by interleaving its coordinates' own bits, and verify it visits every grid cell exactly once.
- Build a Hilbert curve's own ordering for the identical point set, and measure, on a fixed set of near-neighbour pairs, that it keeps them closer together in the resulting one-dimensional order than Z-order does.
- Name geohash, S2 cells, and H3 hexagons as production systems built on this same idea, and state the one specific design choice that distinguishes each from the others.

</section>

<section data-section="internals">

## Into the internals

### Why Z-order's own boundary jump isn't a bug, it's the construction

Bit-interleaving ties the ordering to both coordinates' bits together, but a quadrant boundary is exactly where a high bit flips in one coordinate while the low bits of both reset. Nothing in the interleaving construction gives that flip any special treatment — it's just another bit position. A Hilbert curve's own recursive construction is built specifically to choose each quadrant's visiting order and orientation so that the path never has to jump across a boundary it's about to come back to, which is the structural reason it keeps the identical pair adjacent where Z-order jumps.

### Why the measured advantage isn't claimed everywhere

`examples.py` reports the honest result at the pair nearest the grid's own origin: Z-order already ties row-major there, and Hilbert is not the smallest of the three measured orderings for that one pair. The sourced claim ("Hilbert order has better locality-preserving behavior") is about the aggregate, database-scale case, not every single pair — this topic measures three real pairs and reports what each one actually shows, favourable and not.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds row-major, Z-order, and Hilbert orderings over the identical small grid, verifies each is a bijection onto every cell, and measures real one-dimensional distances for three fixed near-neighbour pairs: one near the grid's own origin (no boundary crossed), one crossing a horizontal quadrant boundary, one crossing a vertical quadrant boundary. Z-order's own worst measured jump, among the three, is twenty-two cells on the boundary-crossing pair; Hilbert's worst is one.

</section>

<section data-section="production">

## In production

Three named systems each fix one specific curve and cell shape over this same idea: geohash interleaves latitude and longitude Z-order-style, encoded in base-32 text; S2 projects the sphere onto a cube's six faces and runs a Hilbert curve independently on each one, stitched into a single 64-bit cell id; H3 tiles the sphere in hexagonal cells instead of squares, specifically because every one of a hexagon's six neighbours sits at the identical distance from its centre, where a square's corner neighbours sit farther away than its edge neighbours. Delta Lake's own `ZORDER BY` and liquid clustering use these exact techniques in a real system, covered in this course's Data Engineering track (§6.3).

</section>

<section data-section="frontier">

## The frontier

k-d trees, quadtrees/octrees, and R-trees are named here only in passing — this chapter's own syllabus marks all three as skipped, since they build a genuinely new multi-dimensional tree shape rather than linearizing points first and reusing an ordinary one-dimensional index, which is the one family of techniques this chapter keeps to.

</section>

<section data-section="questions">

## More questions

- If the grid were three-dimensional instead of two, would a Hilbert curve's own boundary-crossing advantage over Z-order grow, shrink, or stay roughly the same?
- H3's own twelve pentagons sit at fixed, known locations on the globe. What happens to a hexagon-based cell index's own neighbour-distance guarantee for data that happens to fall on one of them?

</section>

<section data-section="next">

## Where this goes next

A space-filling curve turns points scattered across several dimensions into one ordering that keeps nearby points nearby, letting an ordinary one-dimensional structure index spatial data directly. The next chapter asks a structural question instead, about connections rather than coordinates: how a graph's own edges are laid out in memory, and why that layout alone decides which algorithms run fast on it. Adjacency lists, matrices and edge lists, next.

</section>
