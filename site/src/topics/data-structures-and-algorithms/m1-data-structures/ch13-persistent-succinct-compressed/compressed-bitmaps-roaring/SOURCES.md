# Sources: Compressed bitmaps: Roaring (`dsa.compressed-bitmaps-roaring`)

## Chambi, Lemire, Kaser and Godin, "Better bitmap performance with Roaring bitmaps"

URL: https://arxiv.org/pdf/1402.6407
Version: arXiv:1402.6407v10, fetched 2026-10-31 (clean text, no mangling); published Software:
Practice and Experience 46(5), 2016

> significant digits. We use specialized containers to store their 16 least significant bits.
> When a chunk contains no more than 4096 integers, we use a sorted array of packed 16-bit
> integers. When there are more than 4096 integers, we use a 216 -bit bitmap. Thus, we have two types
> of containers: an array container for sparse chunks and a bitmap container for dense chunks. The
> 4096 threshold insures that at the level of the containers, each integer uses no more than 16 bits:

> significantly better (e.g., 2×) and (2) are faster than the compressed alternatives (up to 900× faster for
> intersections). Our results challenge the view that RLE-based bitmap compression is best.

> For unions, if the sum of the cardinalities is no more than 4096, we use a merge
> algorithm between the two arrays. Otherwise, we set the bits corresponding to both arrays in a
> bitmap container. We then compute the cardinality using fast instructions. If the cardinality is
> no more than 4096, we convert the bitmap container to an array container (see Algorithm 2).
> For intersections, we use a simple merge (akin to what is done in merge sort) when the two
> arrays have cardinalities that differ by less than a factor of 64. Otherwise, we use galloping
> intersections [8]. The result is always written to a new array container. Galloping is superior
> to a simple merge when one array (r) is much smaller than other one (f ) because it can skip
> many comparisons.

Contents: the two-container structure (array for ≤4096, bitmap for >4096, giving ≤16 bits per
integer), the paper's own abstract-level performance claims (2× smaller, up to 900× faster
intersections on its own datasets), the array/array union-then-maybe-convert-back rule, and the
galloping-vs-merge threshold (a factor of 64 cardinality difference). (PDF text extraction note:
superscripts are rendered inline without markers, e.g. "216" for 2^16 and "⌈⌉" ceiling brackets
lost around some formulas; quoted exactly as extracted.)

## Lemire, Ssi-Yan-Kai and Kaser, "Consistently faster and smaller compressed bitmaps with Roaring"

URL: https://arxiv.org/pdf/1603.06549
Version: arXiv:1603.06549, fetched 2026-10-31 (clean text, no mangling); published Software:
Practice and Experience 46(11), 2016

> We found that Roaring could compress better than WAH and Concise while providing superior
> speed (up to two orders of magnitude). Consequently, many widely used systems have since adopted
> Roaring: Apache Lucene [8, 9] and its extensions (Solr, Elastic), Apache Spark [10], Apache Kylin,
> Druid [11], and so forth.

> Thus, when first creating a Roaring bitmap, it is usually made of array and bitmap containers.
> Runs are not compressed. Upon request, the storage of the Roaring bitmap can be optimized using
> the runOptimize function. This triggers a scan through the array and bitmap containers that
> converts them, if helpful, to run containers. In a given application, this might be done prior to
> storing the bitmaps as immutable objects to be queried. Run containers may also arise from calling
> a function to add a range of values.

> To decide the best container type, we are motivated to minimize storage. In serialized form, a run
> container uses 2 + 4r bytes given r runs, a bitmap container always uses 8192 bytes and an array
> container uses 2c + 2 bytes, where c is the cardinality. Therefore, we apply the following rules:
> • All array containers are such that they use no more space than they would as a bitmap
> container: they contain no more than 4096 values.
> • Bitmap containers use less space than they would as array containers: they contain more than
> 4096 values.
> • A run container is only allowed to exist if it is smaller than either the array container or
> the bitmap container that could equivalently store the same values. If the run container has
> cardinality greater than 4096 values, then it must contain no more than ⌈(8192 − 2)/4⌉ =
> 2047 runs. If the run container has cardinality no more than 4096, then the number of runs
> must be less than half the cardinality.

Contents: the run container (added in this, the second paper, not the 2016 Chambi et al. paper),
its serialization size (2 + 4r bytes), the `runOptimize` function's own name and behavior exactly
as the paper states it, the three containers' size-ordering rules, and the adoption statement
naming Lucene, Spark, Kylin and Druid (this topic verifies each adoption claim against that
system's own source, not by repeating this sentence alone — see the sections below).

## RoaringFormatSpec README

URL: https://raw.githubusercontent.com/RoaringBitmap/RoaringFormatSpec/master/README.md
Version: `master` branch, fetched 2026-10-31

> Let us recap that Roaring bitmaps are designed to store sets of 32-bit (unsigned) integers. Thus a Roaring bitmap can contain up to 4294967296 integers. They are made of three types of 16-bit containers: array, bitset and run containers. There are between 1 and 65536 (inclusively) containers. Each container has a cardinality (value in [1, 65536]), and it has a 16-bit most significant value (also called "key") in [0,65536). All containers are non-empty.

> SERIAL_COOKIE_NO_RUNCONTAINER = 12346,

> SERIAL_COOKIE = 12347,

> are run containers; otherwise, we know that there are no run containers. For the containers
> that are not run containers, then we use the cardinality to determine the type: a
> cardinality of up and including 4096 indicates an array container whereas a cardinality above
> 4096 indicates a bitset container.

> A run container is serialized as a 16-bit integer indicating the number of runs, followed by a pair of 16-bit values for each run. Runs are non-overlapping and sorted. Thus a run container with x runs will use 2 + 4 x bytes. Each pair of 16-bit values contains the starting index of the run followed by the length of the run minus 1. That is, we interleave values and lengths, so that if you have the values 11,12,13,14,15, you store that as 11,4 where 4 means that beyond 11 itself, there are 4 contiguous values that follow.

Contents: the two cookie constants (12346 without run containers, 12347 with them), the
cardinality-based container-type rule in serialized form (≤4096 array, >4096 bitset), and the
run container's exact serialized layout (start, length-minus-one pairs).

## Apache Lucene, `RoaringDocIdSet.java`

URL: https://raw.githubusercontent.com/apache/lucene/main/lucene/core/src/java/org/apache/lucene/util/RoaringDocIdSet.java
Version: `main` branch, fetched 2026-10-31 via `curl` (no mangling; plain Java source)

> {@link DocIdSet} implementation inspired from http://roaringbitmap.org/

> The space is divided into blocks of 2^16 bits and each block is encoded independently. In each
> * block, if less than 2^12 bits are set, then documents are simply stored in a short[]. If more
> * than 2^16-2^12 bits are set, then the inverse of the set is encoded in a simple short[].
> * Otherwise a {@link FixedBitSet} is used.

Contents: Lucene's own `RoaringDocIdSet` (distinct from the RoaringBitmap library itself, as this
topic states explicitly) credits roaringbitmap.org by name and uses the same 2^16-block,
2^12-threshold shape, plus a third case not in the original Roaring paper (storing the inverse
set when a block is very dense).

## Apache Lucene, `IndexedDISI.java`

URL: https://raw.githubusercontent.com/apache/lucene/main/lucene/core/src/java/org/apache/lucene/codecs/lucene90/IndexedDISI.java
Version: `main` branch, fetched 2026-10-31 via `curl` (no mangling; plain Java source)

> roaring bitmaps} and encodes ranges of {@code 65536} documents independently and picks between 3

> {@code ALL} if the range contains 65536 documents exactly,

> {@code DENSE} if the range contains 4096 documents or more; in that case documents are

Contents: a second, separate Lucene class also inspired by Roaring, with its own three-way
(ALL/DENSE/SPARSE) choice at the same 65536-range, 4096-threshold shape.

## Apache Spark, `MapStatus.scala`

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/scheduler/MapStatus.scala
Version: `master` branch, fetched 2026-10-31 via `curl` (no mangling; plain Scala source)

> import org.roaringbitmap.RoaringBitmap

Contents: Spark's `MapStatus` imports the RoaringBitmap library directly (not a Roaring-inspired
reimplementation, unlike the two Lucene classes above) and uses it (confirmed by reading the
surrounding file) to track empty and skewed shuffle map output blocks.

## Apache Pinot, `BitmapInvertedIndexReader.java`

URL: https://raw.githubusercontent.com/apache/pinot/master/pinot-segment-local/src/main/java/org/apache/pinot/segment/local/segment/index/readers/BitmapInvertedIndexReader.java
Version: `master` branch, fetched 2026-10-31 via `curl` (no mangling; plain Java source)

> import org.roaringbitmap.buffer.ImmutableRoaringBitmap;

Contents: Pinot's bitmap inverted index reader returns `ImmutableRoaringBitmap` (the
memory-mapped, read-only variant of the RoaringBitmap library) directly from disk-backed storage.

## Apache Druid, "Segments" design page

URL: https://druid.apache.org/docs/latest/design/segments/
Version: page as of 2026-10-31, fetched via `sources.mjs` (clean HTML-to-text, no mangling)

> Druid exploits this using compression algorithms that are specially suited for bitmaps, such as Roaring bitmap compression.

> Druid uses LZ4 by default to compress blocks of values for string, long, float, and double columns. Druid uses Roaring to compress bitmaps for string columns and numeric null values. We recommend that you use these defaults unless you've experimented with your data and query patterns suggest that non-default options will perform better in your specific case.

Contents: Druid's own documentation names Roaring as its default bitmap-index compression for
string columns and numeric null values, with Concise as the named alternative.

## RoaringBitmap (Java library) README

URL: https://raw.githubusercontent.com/RoaringBitmap/RoaringBitmap/master/README.md
Version: `master` branch, fetched 2026-10-31 (clean text, no mangling)

> This library is used by

> *   [Apache Spark](http://spark.apache.org/),

Contents: the library's own "used by" list, cited only to corroborate the Spark adoption already
independently confirmed by reading `MapStatus.scala` directly above — not used as the sole source
for any adoption claim in this topic.

### Citation only, not read beyond title/abstract

- Lemire, Kaser, Kurz et al., "Roaring bitmaps: implementation of an optimized software library,"
  *Software: Practice and Experience* 48(4), 2018. Title and venue checked; not read. Attributed
  only by name and date, no claim quoted from it.
