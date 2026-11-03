## OpenJDK — `DualPivotQuicksort.java`

URL: https://raw.githubusercontent.com/openjdk/jdk/jdk-21-ga/src/java.base/share/classes/java/util/DualPivotQuicksort.java
Version: `jdk-21-ga` tag, fetched 2026-11-03 (fetched raw via `curl` and manually seeded into the
cache after `sources.mjs fetch` mangled the file's own `<<` shift operators and generic-looking
text — see Red team)

> This class implements powerful and fully optimized versions, both sequential and parallel, of
> the Dual-Pivot Quicksort algorithm by Vladimir Yaroslavskiy, Jon Bentley and Josh Bloch. This
> algorithm offers O(n log(n)) performance on all data sets, and is typically faster than
> traditional (one-pivot) Quicksort implementations.

> private static final int DELTA = 3 << 1;

> private static final int MAX_RECURSION_DEPTH = 64 * DELTA;

> private static boolean tryMergeRuns(Sorter sorter, int[] a, int low, int size)

> private static void heapSort(int[] a, int low, int high)

> private static void countingSort(byte[] a, int low, int high)

### Contents (item by item, this topic's scope)

- The file's own author list and its own claim for itself — "typically faster than traditional
  (one-pivot) Quicksort implementations" — naming Yaroslavskiy's dual-pivot scheme as the one
  actually shipped in a production JDK's primitive-array sort, the real-system anchor for this
  topic's dual-pivot clause.
- `DELTA` and `MAX_RECURSION_DEPTH`'s own literal definitions, read here exactly as the source
  defines them, not reconstructed — `MAX_RECURSION_DEPTH = 64 * (3 << 1) = 384`, the depth at
  which this real implementation gives up on partitioning and falls back to heapsort, supporting
  this topic's own "every quicksort has a fallback" framing without the topic inventing a number.
- `tryMergeRuns` and `heapSort`'s own presence in the same file, naming (not demonstrating) the
  two real safety nets a production dual-pivot quicksort carries: a cheap check for already-sorted
  runs before partitioning at all, and a guaranteed-O(n log n) fallback when recursion runs deep —
  both cited here only by name, since this topic's own `examples.py` builds its own fallback
  rule rather than porting Java's.
- `countingSort`'s own presence, overloaded per primitive type (`byte`, `char`, `short`), naming
  the real system's small-alphabet special case — cited only to note that a production sort
  switches strategy entirely below some range, not analysed further here (chapter 15's own
  counting/radix/bucket topic, 53, owns that ground).

## Wild & Nebel — "Average Case Analysis of Java 7's Dual Pivot Quicksort" (ESA 2012)

URL: https://arxiv.org/abs/1310.7409
Version: arXiv:1310.7409, fetched 2026-11-03

> a random permutation of length $n$ is sorted using $1.9n\ln n-2.46n+\mathcal{O}(\ln n)$ key
> comparisons and $0.6n\ln n+0.08n+\mathcal{O}(\ln n)$ swaps.

> Best paper award at ESA 2012

### Contents (item by item, this topic's scope)

- The paper's own exact average-case comparison and swap counts for Yaroslavskiy's dual-pivot
  scheme — `1.9n ln n` comparisons against classic one-pivot quicksort's own well-known
  `2.0n ln n` (quoted below, from Kushagra et al.'s own restatement of the same two numbers side
  by side) — the real theoretical number behind "fewer comparisons" rather than an invented one.
- The paper's own award note (Best paper, ESA 2012) establishes it as the first rigorous analysis
  of the algorithm Oracle shipped three years earlier on empirical grounds alone — supporting this
  topic's own framing that dual-pivot quicksort's theory arrived after its adoption, not before.

## Kushagra, López-Ortiz, Munro & Qiao — "Multi-Pivot Quicksort: Theory and Experiments" (ALENEX 2014)

URL: https://cs.uwaterloo.ca/~skushagr/multipivotQuicksort.pdf
Version: University of Waterloo preprint, submitted 7 Nov 2013, fetched 2026-11-03 (no arXiv
listing found for this paper this session — see Red team)

> The dual pivot approach actually uses less comparisons (1.9n ln n vs 2.0n ln n) on average.

> in our experiments, the 3-pivot algorithm is about 7-8% faster than Yaroslavskiy's 2-pivot
> algorithm.

### Contents (item by item, this topic's scope)

- The paper's own side-by-side restatement of the dual-pivot comparison count (1.9n ln n) against
  classic one-pivot quicksort's own count (2.0n ln n) — the direct, named real-system comparison
  this topic's own measured counts are checked against, not a figure this topic invented.
- The paper's own measured, experimental (not theoretical) performance gap for their 3-pivot
  variant against Yaroslavskiy's shipped 2-pivot scheme — 7-8% — cited only to name that more
  pivots is not free and does not automatically keep winning, without this topic building or
  measuring a 3-pivot or higher partitioning scheme itself (CHAPTER.md scopes this topic to one,
  two and three-way, not multi-pivot beyond two).

## Edelkamp & Weiß — "BlockQuicksort: How Branch Mispredictions don't affect Quicksort" (ESA 2016)

URL: https://arxiv.org/abs/1604.06697
Version: arXiv:1604.06697v2, fetched 2026-11-03 (CHAPTER.md's own note: the arXiv title differs
slightly from the ESA 2016 proceedings title; both refer to the same paper — noted, not resolved)

> Quicksort -- which is commonly considered as one of the fastest in-place sorting algorithms --
> suffers in an essential way from branch mispredictions

> we split the input in blocks of constant size (we propose 128 data elements); then, all elements
> in one block are compared with the pivot and the outcomes of the comparisons are stored in a
> buffer

> the average total number of branch mispredictions is at most $\epsilon n \log n + O(n)$ for some
> small $\epsilon$ depending on the block size when sorting $n$ elements.

> we achieve an increase in speed of 80% over the GCC implementation of C++ std::sort

### Contents (item by item, this topic's scope)

- The paper's own stated mechanism — store comparison outcomes in a buffer for a fixed-size block
  (128 elements), then rearrange in a second pass, avoiding conditional branches on the comparison
  result itself — the real technique this topic names (not builds) as branchless block
  partitioning.
- The paper's own proven bound (`εn log n + O(n)` mispredictions) and its own measured headline
  number (80% faster than GCC's `std::sort` on random integer data, with an explicit carve-out for
  sorted/nearly-sorted input) — both cited by name only, consistent with CHAPTER.md scoping this
  technique to a citation, not an implementation, in this topic.

## Wikipedia — "Quicksort"

URL: https://en.wikipedia.org/wiki/Quicksort
Version: fetched 2026-11-03

> the expected number of comparisons needed to sort n elements (see § Average-case analysis)
> with random pivot selection is 1.386 n log n. Median-of-three pivoting brings this down to
> Cn,2 ≈ 1.188 n log n, at the expense of a three-percent increase in the expected number of
> swaps.

> To solve the Lomuto partition scheme problem (sometimes called the Dutch national flag
> problem[8]), an alternative linear-time partition routine can be used that separates the
> values into three groups: values less than the pivot, values equal to the pivot, and values
> greater than the pivot.

> Bentley and McIlroy call this a "fat partition" and it was already implemented in the qsort of
> Version 7 Unix

### Contents (item by item, this topic's scope)

- The article's own two comparison-count figures for random-pivot (1.386 n log n) versus
  median-of-three-pivot (1.188 n log n) selection, with the three-percent swap-count cost of the
  improvement named in the same sentence — used here only to find the citation, per CHAPTER.md's
  own permission; this topic's own `examples.py` measures its own counts on its own 1,024-key
  array independently rather than reusing these constants directly.
- The article's own naming of the three-way partition as "sometimes called the Dutch national flag
  problem," and its own note that the technique already existed as a "fat partition" in Version 7
  Unix's `qsort` before Dijkstra's flag framing became the common name — read here only to source
  the attribution this topic uses for its own three-way (Dutch national flag) partitioning clause,
  not as a claim this topic re-derives.

### Red team

- McIlroy's "A Killer Adversary for Quicksort" could not be fetched this session: `sources.mjs
  fetch` on `https://www.cs.dartmouth.edu/~doug/mdmspe.pdf` failed with an SSL certificate error
  (self-signed certificate in the chain), and a direct `WebFetch` on the same URL returned HTTP
  503. Per CHAPTER.md's own instruction for this clause ("the topic builds a small adversary
  against a fixed pivot rule itself... not McIlroy's code"), this topic's own `examples.py` builds
  an original small median-of-three killer input directly against this topic's own fixed
  median-of-three pivot rule, rather than reproducing McIlroy's published adversary.
- Hoare's original 1961/1962 papers ("Algorithm 64: Quicksort", "Quicksort") and Bentley &
  McIlroy's "Engineering a Sort Function" (1993) are citation-only this session, per CHAPTER.md's
  own "to verify" framing — both are behind paywalls this session did not attempt to cross; the
  Lomuto/Hoare partition mechanics and the engineering trade-offs they describe are instead
  verified directly in this topic's own `examples.py` (real instrumented comparison/swap counts),
  not taken from either paper's own stated numbers.
- No arXiv listing could be confirmed for Kushagra et al.'s paper this session — only the
  University of Waterloo preprint PDF above (which fetched cleanly as real PDF text, not HTML) and
  DBLP's own record, which lists the ALENEX 2014 proceedings abstract as missing. The preprint is
  used directly, dated by its own submission line (7 Nov 2013), with this gap noted rather than
  papered over.
- `sources.mjs fetch` mangles any non-PDF response by running HTML-stripping on it unconditionally,
  which ate `DualPivotQuicksort.java`'s own `<<` shift operators and the text between them and the
  next literal `>` (this swallowed `MAX_RECURSION_DEPTH`'s own definition). Worked around by
  `curl`-ing the raw file directly, confirming it was clean, and manually seeding it into
  `sources.mjs check`'s own expected cache filename (computed from the URL's own slug+hash) so the
  check step uses the clean copy rather than re-fetching a mangled one.
- Wikipedia's Quicksort page is used, per CHAPTER.md's own permission, only to find a citation (the
  Dutch national flag partitioning scheme's own attribution to Dijkstra), not as a source of claims
  in its own right; no direct quote from it appears in this topic.
