# Sources — dsa.sweep-line-algorithms

Fetched at research time (2026-11-05) into `sources/`. Checked with
`node scripts/sources.mjs check sweep-line-algorithms`.

## 1. Wikipedia, "Bentley–Ottmann algorithm"

URL: https://en.wikipedia.org/wiki/Bentley%E2%80%93Ottmann_algorithm
Local copy: `sources/wiki-bentley-ottmann.txt`

> In computational geometry, the Bentley–Ottmann algorithm is a sweep line algorithm for
> listing all crossings in a set of line segments, i.e. it finds the intersection points (or,
> simply, intersections) of line segments. It extends the Shamos–Hoey algorithm,[1] a similar
> previous algorithm for testing whether or not a set of line segments has any crossings.

> The algorithm was initially developed by Jon Bentley and Thomas Ottmann (1979); it is
> described in more detail in the textbooks Preparata & Shamos (1985), O'Rourke (1998), and de
> Berg et al. (2000).

> The main idea of the Bentley–Ottmann algorithm is to use a sweep line approach, in which a
> vertical line L moves from left to right (or, e.g., from top to bottom) across the plane,
> intersecting the input line segments in sequence as it moves.

> No two line segment endpoints or crossings have the same x-coordinate

> A binary search tree (the "sweep line status tree"), containing the set of input line
> segments that cross L, ordered by the y-coordinates of the points where these segments cross
> L.

> A priority queue (the "event queue"), used to maintain a sequence of potential future events
> in the Bentley–Ottmann algorithm.

> The binary search tree may be any balanced binary search tree data structure, such as a
> red–black tree; all that is required is that insertions, deletions, and searches take
> logarithmic time.

> The O(n log n) part of the time bound for the Bentley–Ottmann algorithm is necessary, as
> there are matching lower bounds for the problem of detecting intersecting line segments in
> algebraic decision tree models of computation.

> Clarkson (1988) and Mulmuley (1988) both provided randomized algorithms for constructing the
> planar graph whose vertices are endpoints and crossings of line segments, and whose edges are
> the portions of the segments connecting these vertices, in expected time O(n log n + k), and
> this problem of arrangement construction was solved deterministically in the same
> O(n log n + k) time bound by Chazelle & Edelsbrunner (1992).

> Balaban (1995) described a different algorithm that lists all intersections in time
> O(n log n + k) and space O(n).

Note: this article states the O(n log n) lower bound is in the "algebraic decision tree
models of computation" and cites Clarkson, Mulmuley, Chazelle & Edelsbrunner, and Balaban for
faster algorithms — it does **not** say the lower bound reduces from element distinctness.
That connection (named in `CHAPTER.md` as "the topic's one reduction, to verify against the
source before it is said") is **not confirmed** by this source, so the reel does not state it;
post-notes says only what this article actually says.

## 2. Wikipedia, "Klee's measure problem"

URL: https://en.wikipedia.org/wiki/Klee%27s_measure_problem
Local copy: `sources/wiki-klee.txt`

> In computational geometry, Klee's measure problem is the problem of determining how
> efficiently the measure of a union of (multidimensional) rectangular ranges can be computed.

> In 1977, Victor Klee considered the following problem: given a collection of n intervals in
> the real line, compute the length of their union.

> Later in 1977, Jon Bentley considered a 2-dimensional analogue of this problem: given a
> collection of n rectangles, find the area of their union.

> He also obtained a complexity

(the complexity itself renders as a MathML block in the fetched text, immediately followed by)

> algorithm, now known as Bentley's algorithm, based on reducing the problem to n 1-dimensional
> problems: this is done by sweeping a vertical line across the area.

> Bentley's algorithm is now also known to be optimal (in the 2-dimensional case), and is used
> in computer graphics, among other areas.

> When generalized to the d-dimensional case, Bentley's algorithm has a running time of

(followed by the MathML rendering of) `O(n^(d-1) log n)`.

> This turns out not to be optimal, because it only decomposes the d-dimensional problem into n
> (d-1)-dimensional problems, and does not further decompose those subproblems.

## 3. Wikipedia, "Sweep line algorithm"

URL: https://en.wikipedia.org/wiki/Sweep_line_algorithm
Local copy: `sources/wiki-sweepline.txt`

> In computational geometry, a sweep line algorithm or plane sweep algorithm is an algorithmic
> paradigm that uses a conceptual sweep line or sweep surface to solve various problems in
> Euclidean space.

> The idea behind algorithms of this type is to imagine that a line (often a vertical line) is
> swept or moved across the plane, stopping at some points. Geometric operations are restricted
> to geometric objects that either intersect or are in the immediate vicinity of the sweep line
> whenever it stops, and the complete solution is available once the line has passed over all
> objects.

> An application of the approach had led to a breakthrough in the computational complexity of
> geometric algorithms when Shamos and Hoey presented algorithms for line segment intersection
> in the plane in 1976. In particular, they described how a combination of the scanline
> approach with efficient data structures (self-balancing binary search trees) makes it
> possible to detect whether there are intersections among N segments in the plane in time
> complexity of O(N log N).

> The closely related Bentley–Ottmann algorithm uses a sweep line technique to report all K
> intersections among any N segments in the plane in time complexity of O((N + K) log N) and
> space complexity of O(N).

> Shamos, Michael I.; Hoey, Dan (1976), "Geometric intersection problems", Proc. 17th IEEE Symp.
> Foundations of Computer Science (FOCS '76), pp. 208–215

## 4. DuckDB blog, "Range Joins in DuckDB"

URL: https://duckdb.org/2022/05/27/iejoin.html
Local copy: `sources/duckdb-iejoin.txt`

> and occur when two inequality conditions are present in a join predicate.

> Instead, DuckDB leverages its fast sorting logic to implement two highly optimized parallel
> join operators

> We have recently added a new join called IEJoin, which sorts on two predicates to really
> speed things up.

> The way that IEJoin works is to first sort both tables on the values for the first condition
> and merge the two sort keys into a combined table that tracks the two input tables' row
> numbers. Next, it sorts the positions in the combined table on the second range condition.

**Named, not read** (per CHAPTER.md; cited only for attribution, nothing attributed beyond the title/author/year below):

- Bentley, J. L. and Ottmann, T., "Algorithms for reporting and counting geometric
  intersections", IEEE Transactions on Computers C-28(9), 1979, pp. 643–647.
- Shamos, M. I. and Hoey, D., "Geometric intersection problems", Proc. 17th IEEE Symp.
  Foundations of Computer Science (FOCS 1976), pp. 208–215 — confirmed via source 3 above.
- de Berg, M., Cheong, O., van Kreveld, M., and Overmars, M., *Computational Geometry:
  Algorithms and Applications*.
- Shewchuk, J. R., "Adaptive precision floating-point arithmetic and fast robust geometric
  predicates", Discrete & Computational Geometry 18(3), 1997 — named once in post-notes, for
  the skipped "Orientation tests and robust predicates" topic, per `CHAPTER.md`.
