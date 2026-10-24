# Chapter 9 plan: Spatial and High-Dimensional Indexes (Data Structures & Algorithms, Milestone 1)

This is the contract for this chapter's one surviving topic. The builder keeps to this entry. If the topic really can't keep to it, record why under `OUTLINE.md` → "Changes from the chapter plan" and say so in the report.

- **Planned:** 24 October 2026, from `syllabus/data-structures-and-algorithms.md` (Chapter 9, §9.1) and Chapter 8's final handoff.
- **Registry fields shared by every topic:** `domain: 'data-structures-and-algorithms'`, `milestone: { number: 1, title: 'Data Structures' }`, `chapter: { number: 9, title: 'Spatial and High-Dimensional Indexes', section: '9.1' }`. The registry `title` and `syllabusTitle` are both the syllabus title word for word.
- **Folders:** the topic lives in `…/m1-data-structures/ch09-spatial-high-dimensional-indexes/<folder>`, next to this file.
- **Inherits from earlier chapters** (not re-taught; used directly): none this topic reuses as a mechanism. Lowest-set-bit-style bit manipulation (Chapter 8's own Fenwick trees) is a distant cousin — both interleave or decompose binary representations — but this topic's own bit-interleaving (Morton codes) is introduced fresh, not presented as a reuse of Chapter 8's own arithmetic.

---

## The chapter

### The problem it solves

Every structure through Chapter 8 answered a question about one array, indexed by position or by key: which key is here, what's the running aggregate over a range. This chapter asks a different kind of question about dimension instead of position: given points scattered across two or three dimensions (a map coordinate, a sensor reading, a location), how do you order them in a single line — the shape every earlier structure in this course assumes its keys already have — so that points which are near each other in space end up near each other in that one ordering too? A naive row-major or column-major scan of a 2D grid does not have this property: two cells that are neighbours on the map can be arbitrarily far apart in that ordering. A space-filling curve fixes this by construction: it visits every cell of a multi-dimensional grid exactly once, along a path that keeps nearby cells close together in the resulting one-dimensional order, which is exactly the property a B-tree, an LSM-tree, or a Fenwick tree needs to index spatial data efficiently using the same one-dimensional structures this course has already built.

### Order of ideas, and why

1. **§9.1 Space-filling curves and cell indexes (35).** Z-order (Morton) curves, built by interleaving each dimension's own bits; Hilbert curves, which keep locality tighter at the cost of a more involved construction; cell-index systems built on these curves in production — geohash, S2 cells, H3 hexagons — each one's own choice of curve and cell shape, and the real cost trade-off (locality quality against construction and decoding cost) that choice makes. k-d trees, quadtrees/octrees, and R-trees are all skipped (see "Skipped in this chapter" below): this chapter keeps the one family of techniques (linearize first, then reuse an ordinary one-dimensional index) rather than the family of techniques that build a genuinely new, multi-dimensional tree shape.
2. **§9.2 Approximate nearest-neighbour search.** Both topics (graph-based ANN, quantization-based ANN) are skipped (see below); this chapter's one topic is also, therefore, the whole chapter — there is no second topic to sequence it against.
3. **Handoff to Chapter 10.** Topic 35 ends having answered how to linearize points scattered across dimensions into one ordering that preserves locality, closing Milestone 1's own run of structures that organize data along one dimension (an array, a key space, now a curve over several dimensions at once). Chapter 10 asks a structural question instead: not how values are ordered, but how a graph's own connections are laid out in memory, and why that layout decides which algorithms run fast on it.

### One running example: a small set of 2D map coordinates

Chapters 1–8 kept the log's own single-field keys or per-minute slots. This chapter needs points in two dimensions — a small, fixed set of (x, y) integer coordinates, small enough that every curve this topic builds fits one frame, large enough that a locality difference between a row-major scan and a space-filling curve is visible. Topic 35 builds a Z-order (Morton) code and a Hilbert-curve code for the identical point set, measures each curve's own locality (how far apart, in the one-dimensional ordering, two points that are near each other on the grid actually land), and names (without rebuilding) the production cell-index systems — geohash, S2, H3 — that each make a different concrete choice of curve and cell shape over the identical underlying idea. Every number on screen is computed or asserted in the topic's own `examples.py`; the values here are planning values, and the builder who finds one wrong fixes it in `examples.py` and records it in `REVIEW.md`.

| Piece | Planning values (the builder computes and asserts its own) | Used by |
|---|---|---|
| The points | a small, fixed set of 2D integer (x, y) coordinates on a grid, distinct from every earlier chapter's single-field key or per-minute slot | 35 |
| Grid size | small enough (a power of two per axis) that every Morton/Hilbert code and curve diagram fits one frame; large enough that a locality gap between row-major order and a space-filling curve is visible | 35 |
| Locality measurement | a fixed set of near-neighbour point pairs on the grid, each pair's own distance in row-major order, Z-order, and Hilbert order measured and compared directly | 35 |

### Shared notation and terms

- **Space-filling curve:** a path that visits every cell of a multi-dimensional grid exactly once, defining a one-dimensional ordering over all of them.
- **Z-order (Morton) code:** a point's own coordinates, bit-interleaved (one bit from each axis in turn) into a single integer giving that point's position in Z-order.
- **Hilbert curve:** a different space-filling curve, built recursively rather than by simple bit interleaving, that keeps nearby grid cells closer together in its own one-dimensional order than Z-order does, at the cost of a more involved encode/decode step.
- **Cell index:** a production system (geohash, S2, H3) that fixes a specific curve and a specific cell shape (square, or a hexagon for H3) over the globe or a plane, so a point's own cell id can be looked up, compared, or range-queried using an ordinary one-dimensional index.
- **Spoken numbers:** narration has no digits, symbols or code names (automatic check); say "order key length" style phrasing is not this chapter's own concern, but "bit-interleaved," "Morton code," "Hilbert curve" should be said as named terms, and any digit spoken in words; add new terms the first time each appears (`space-filling curve`, `morton code`, `hilbert curve`, `cell index`, QUALITY.md #29).

### One visual language for the chapter's reel

The chapter builds from `site/src/reels/kit.tsx` and `DESIGN.md`'s briefing theme (PROJECT_PLAN.md, "Theme — briefing"): black and white carry everything, colour is rare and means something. On top of that this chapter shares one grammar:

- **Colour:** `crema` the grid's own live state (every cell, drawn once); `latte` secondary labels (a coordinate pair, a curve's own step number); `taupe` a cell not yet visited by the curve being drawn; `caramel` **the thing to look at**: the curve's own path as it's traced, cell by cell, in visiting order; `cinnamon` (rare) **the alternative being compared**: Z-order's own path set directly against Hilbert's own path over the identical grid; `cherry` with `cherryText` **the bad outcome**: two cells that are near neighbours on the grid landing far apart in a naive row-major ordering.
- **The grid is drawn the same way for every curve:** a small square grid, each cell labeled with its own real coordinates, the curve traced as a connected path visiting every cell exactly once, never an instant reveal of the whole ordering at once.
- **Locality measurement:** a fixed pair (or small set) of near-neighbour grid cells, their own real distance apart measured in row-major order, Z-order, and Hilbert order, shown as three real numbers side by side, never a claimed ratio without the count behind it.
- **Reel shape.** Topic 35 is a full topic (about 12–14 minutes, 2–4 predict questions): open on the problem (two neighbouring points on a map, far apart in a naive ordering), a predict question in the first three to four steps, Z-order's own construction, Hilbert's own construction and its locality advantage, the production cell-index systems named, then "Prove it."

---

## The topics, in syllabus order

Folder prefix: `site/src/topics/data-structures-and-algorithms/m1-data-structures/ch09-spatial-high-dimensional-indexes/`. Concept ids are kebab-case. A concept is in `uses` only if an earlier topic introduces it, or this topic `declared` it.

**Skipped in this chapter** (stay in the curriculum, get no reel, per `syllabus/review-notes/dsa-cuts.md`): k-d trees, Quadtrees and octrees, R-trees (§9.1); Graph-based ANN (HNSW and Vamana), Quantization-based ANN (IVF and PQ) (§9.2). Where the syllabus's own *Lab* bullet needs a piece that doesn't depend on a skipped structure (building a k-d tree and an HNSW index, plotting recall vs. queries per second), both named structures are entirely out of this chapter's own scope — the Lab bullet is not reproduced by any topic in this chapter; see "Notes for the release run" below.

### 35. Space-filling curves and cell indexes (`dsa.space-filling-curves-cell-indexes`): full, §9.1

- **Folder:** `space-filling-curves-cell-indexes`. About 13 min.
- **Scope (syllabus clause → what it delivers):**
  - "Z-order (Morton) and Hilbert curves linearising multi-dimensional keys": both curves built directly over the chapter's own small point set — Z-order by bit-interleaving each coordinate's own binary representation; Hilbert by its own recursive construction — each one's resulting one-dimensional ordering verified to visit every grid cell exactly once, and each curve's own locality measured directly on a fixed set of near-neighbour pairs, not assumed from a diagram.
  - "geohash, S2 cells and H3 hexagons": named and explained as production systems that each fix one specific curve and cell shape — geohash uses a Z-order-style interleaving over latitude/longitude with base-32 encoding; S2 projects the sphere onto a cube and runs a Hilbert-curve-style ordering per face; H3 uses hexagonal cells instead of squares specifically because a hexagon's neighbours are all equidistant, where a square's diagonal neighbours are farther than its edge neighbours — named and sourced, not rebuilt at production scale.
  - "Z-order in Delta Lake `ZORDER BY` and Hilbert curves in Delta liquid clustering": named in passing as where these exact techniques are used in a real system this course's own Data Engineering track will cover (§6.3 there), establishing the cross-domain link without rebuilding Delta Lake's own clustering logic here.
- **Outcomes:**
  - Build a Z-order (Morton) code for a 2D point by hand, by interleaving its coordinates' own bits, and verify it visits every grid cell exactly once.
  - Build a Hilbert curve's own ordering for the identical point set, and measure, on a fixed set of near-neighbour pairs, that it keeps them closer together in the resulting one-dimensional order than Z-order does.
  - Name geohash, S2 cells, and H3 hexagons as production systems built on this same idea, and state the one specific design choice (interleaving scheme, projection, or cell shape) that distinguishes each from the others.
- **Introduces:** `space-filling-curve`, `morton-code`, `hilbert-curve`, `cell-index`. **Uses:** none from an earlier chapter as a reused mechanism. **Declared:** none new beyond its own.
- **Bridge:** word for word, topic 34's own handoff above ("Fenwick trees and segment trees both answer aggregate questions over a changing array in O(log n)... Space-filling curves, next.").
- **Handoff:** "A space-filling curve turns points scattered across several dimensions into one ordering that keeps nearby points nearby, letting an ordinary one-dimensional structure index spatial data directly. The next chapter asks a structural question instead, about connections rather than coordinates: how a graph's own edges are laid out in memory, and why that layout alone decides which algorithms run fast on it. Adjacency lists, matrices and edge lists, next."
- **Prerequisites panel:** none from an earlier chapter as a direct prerequisite (bit-interleaving and the Hilbert construction are introduced fresh in this topic). On-site: none new.
- **Visual idea:** a small square grid, each cell labeled with its own real coordinates; a Z-order path traced cell by cell by bit-interleaving; a Hilbert-curve path traced cell by cell by its own recursive construction, over the identical grid; a locality comparison showing a fixed near-neighbour pair's own real distance apart in row-major order, Z-order, and Hilbert order, as three real measured numbers.
- **Sources to start from:** a current, careful reference on Z-order/Morton codes and their bit-interleaving construction; a current, careful reference on Hilbert curves and their own locality property relative to Z-order; current documentation or a well-documented source for geohash, S2 cells, and H3 hexagons, each independently, since all three are real production systems with their own official documentation.

---

## Concept ledger at a glance (introduces, in order)

35. `space-filling-curve`, `morton-code`, `hilbert-curve`, `cell-index`

Each concept is introduced once. No concept is declared a second time in this chapter.

## Notes for the release run

1. **Verification discipline carries over from Chapters 1–8.** Every "to verify" claim above is a placeholder for the research stage (section 3 of the skill): fetch or read a current primary or well-documented source, quote or cite it in `SOURCES.md`, and only then commit the claim to `OUTLINE.md`. Nothing above is to be taken on screen from this plan's memory.
2. **Seams to check at release:** topic 35's own handoff against Chapter 10's first topic's actual opening (the exact wording above, "Adjacency lists, matrices and edge lists, next," must match whatever Chapter 10's plan actually names as its own first topic, refresher or not); the geohash/S2/H3 naming against each system's own current official documentation, not a secondary summary.
3. **The syllabus's own Lab bullet** ("build a k-d tree and an HNSW index over 1M vectors at d = 2, 16 and 128; plot recall@10 vs queries/second and show where the k-d tree collapses") depends entirely on two structures (a k-d tree, an HNSW index) this chapter skips outright. No topic in this chapter reproduces any part of this Lab bullet.
4. **Cross-domain links:** this chapter's own §9.1 syllabus line names Data Engineering §6.3 directly (Delta Lake's `ZORDER BY` and liquid clustering) as where these exact techniques are used in a real system; topic 35 names this link in passing without rebuilding Delta Lake's own clustering logic.
