## Pebble merging_iter.go

URL: https://raw.githubusercontent.com/cockroachdb/pebble/master/merging_iter.go
Version: `master`, fetched 2026-11-07

> The core of a mergingIter is a heap of internalIterators (see
> // mergingIterHeap). The heap can operate as either a min-heap, used during
> // forward iteration (First, SeekGE, Next) or a max-heap, used during reverse
> // iteration (Last, SeekLT, Prev). The heap is initialized in calls to First,
> // Last, SeekGE, and SeekLT. A call to Next or Prev takes the current top
> // element on the heap, advances its iterator, and then "fixes" the heap
> // property. When one of the child iterators is exhausted during Next/Prev
> // iteration, it is removed from the heap.

Notes: one heap of child iterators (one per LSM level/table/memtable) serves both forward and
reverse iteration by switching between min-heap and max-heap comparators; `Next`/`Prev` is pop,
advance, sift — the textbook k-way merge.

## RocksDB table/merging_iterator.cc

URL: https://raw.githubusercontent.com/facebook/rocksdb/main/table/merging_iterator.cc
Version: `main`, fetched 2026-11-07

> MergingIterator uses a min/max heap to combine data from point iterators.

Notes: same kernel, same two-directions-one-heap design as Pebble's, independently built. The
file calls the heap entries `HeapItem`, one per input iterator.

## RocksDB db/dbformat.h

URL: https://raw.githubusercontent.com/facebook/rocksdb/main/db/dbformat.h
Version: `main`, fetched 2026-11-07

> A comparator for internal keys that uses a specified comparator for
> // the user key portion and breaks ties by decreasing sequence number.

Notes: `InternalKeyComparator` orders by user key first, then by **decreasing** sequence number,
so among several versions of the same user key the newest (highest sequence number) sorts first
— the merging iterator's comparator puts the newest version of a key at the front without any
special case.

## RocksDB db/version_set.cc

URL: https://raw.githubusercontent.com/facebook/rocksdb/main/db/version_set.cc
Version: `main`, fetched 2026-11-07

> InternalIterator* VersionSet::MakeInputIterator(

Notes: `MakeInputIterator` walks every input file of every input level of a `Compaction`,
opens a `TableReader`-backed iterator per file (concatenated per level above L0, one per file at
L0), and the trace point further down the function is named
`VersionSet::MakeInputIterator:NewCompactionMergingIterator` — confirming a compaction's input is
built as a merging iterator over every one of those per-file iterators, each carrying its range
tombstones alongside it.

## RocksDB db/compaction/compaction_iterator.h

URL: https://raw.githubusercontent.com/facebook/rocksdb/main/db/compaction/compaction_iterator.h
Version: `main`, fetched 2026-11-07

> void NextFromInput();

Notes: `CompactionIterator` wraps the merging input iterator from `MakeInputIterator` and exposes
its own `Next()`/`NextFromInput()`, which is where shadowed (older, already-superseded) versions
of a key and expired tombstones are dropped as the compaction advances past them — read at
research time, not quoted verbatim, since the drop logic is spread across several branches of
`NextFromInput()` rather than one quotable sentence.

## Velox common/base/TreeOfLosers.h

URL: https://raw.githubusercontent.com/facebookincubator/velox/main/velox/common/base/TreeOfLosers.h
Version: `main`, fetched 2026-11-07

> Implements a tree of losers algorithm for merging ordered streams. The
> /// TreeOfLosers owns one or more instances of Stream. At each call of next(),
> /// it returns the Stream that has the lowest value as first value from the set
> /// of Streams.

> Suppose 12 streams. The last level has 16 places, the second
> // last 8. If we fill the second last level we have 8 streams
> // and 4 left over. These 4 need parents on the second last
> // level. So, we end up with 4 inner nodes on the second last
> // level and 8 nodes on the last level. The streams at the left
> // of the second last level become inner nodes and their streams
> // move to the level below.

Notes: the second quote is the constructor's own worked example for laying leaves onto the last
two levels of a complete tree when the stream count is not a power of two (12 streams → 8 on the
last level, 4 on the level above).

## Velox exec/Merge.cpp

URL: https://raw.githubusercontent.com/facebookincubator/velox/main/velox/exec/Merge.cpp
Version: `main`, fetched 2026-11-07

Notes: `Merge` (the operator that merges locally-sorted sources) builds and drives a
`TreeOfLosers` over one `MergeStream` per source. Read for how `next()` is called in a loop and
not quoted verbatim beyond the class's own header above.

## Spark core/.../unsafe/sort/UnsafeSorterSpillMerger.java

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/java/org/apache/spark/util/collection/unsafe/sort/UnsafeSorterSpillMerger.java
Version: `master`, fetched 2026-11-07

> private final PriorityQueue priorityQueue;

> We only add the spillReader to the priorityQueue if it is not empty. We do this to

Notes: a `java.util.PriorityQueue` of spill readers, ordered by the current record's key; the
comment explains that an empty reader is never enqueued, avoiding an "extra empty record" bug the
author names explicitly in the surrounding comment.

## Spark core/.../util/collection/ExternalSorter.scala

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/util/collection/ExternalSorter.scala
Version: `master`, fetched 2026-11-07

> Use the reverse order (compare(y,x)) because PriorityQueue dequeues the max

Notes: `mergeSort` builds a Scala `mutable.PriorityQueue` of buffered iterators with the
comparator reversed, because Scala/Java's priority queue always dequeues the maximum; dequeuing
the "maximum" under a reversed comparator is dequeuing the minimum key — the same pop-then-replace
kernel as Pebble's and RocksDB's heaps, through a max-heap API.

## Spark core/.../util/BoundedPriorityQueue.scala

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/util/BoundedPriorityQueue.scala
Version: `master`, fetched 2026-11-07

> Bounded priority queue. This class wraps the original PriorityQueue
> * class and modifies it such that only the top K elements are retained.

> if (size < maxSize) {
> underlying.offer(elem)
> } else {
> maybeReplaceLowest(elem)
> }

> val head = underlying.peek()
> if (head != null && ord.gt(a, head)) {
> underlying.poll()
> underlying.offer(a)
> }

Notes: a wrapped `java.util.PriorityQueue` capped at `maxSize`; once full, a new element only
replaces the current lowest-ranked kept element (the queue's head, under its ordering) when it
ranks higher, which is a bounded top-K heap keyed however the caller's `Ordering` says.

## Spark core/.../rdd/RDD.scala (takeOrdered)

URL: https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/rdd/RDD.scala
Version: `master`, fetched 2026-11-07

> implicit Ordering[T] and maintains the ordering. This does the opposite of [[top]].

Notes: `takeOrdered`'s own doc comment; `top` keeps the K largest with a min-heap root, so
`takeOrdered`'s K smallest necessarily keeps a max-heap root — the same bounded-heap structure,
comparator flipped. (`RDD.top` itself is implemented with `BoundedPriorityQueue` reduced across
partitions; `takeOrdered` is read below via `TakeOrderedAndProjectExec`, which calls into the same
family of helpers.)

## Spark sql/core/.../execution/limit.scala

URL: https://raw.githubusercontent.com/apache/spark/master/sql/core/src/main/scala/org/apache/spark/sql/execution/limit.scala
Version: `master`, fetched 2026-11-07

> val localTopK = if (orderingSatisfies) {
> childRDD.mapPartitionsInternal(_.map(_.copy()).take(limit))
> } else {
> childRDD.mapPartitionsInternal { iter =>
> Utils.takeOrdered(iter.map(_.copy()), limit)(ord)
> }
> }

> val limited = Utils.takeOrdered(iter.map(_.copy()), limit)(ord)

Notes: the plan that backs `ORDER BY … LIMIT` computes a per-partition bounded top-`limit` with
`Utils.takeOrdered` (which builds a `BoundedPriorityQueue` of size `limit`), shuffles only those
local top-K rows to one partition, then runs the same bounded top-`limit` again over the merged,
already-small result. **Not verified in the current source**: a comment some earlier version of
this file carried ("This could have been named TopK, but Spark's top operator does the opposite
in ordering") was not found in the `master` branch read at research time; it is not attributed or
quoted here.

## PostgreSQL src/backend/utils/sort/tuplesort.c (bounded heap)

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/utils/sort/tuplesort.c
Version: `master`, fetched 2026-11-07

> Check if it's time to switch over to a bounded heapsort. We do
> * so if the input tuple count exceeds twice the desired tuple
> * count (this is a heuristic for where heapsort becomes cheaper
> * than a quicksort), or if we've just filled workMem and have
> * enough tuples to meet the bound.

> at the root (array entry zero), instead of the smallest as in the normal
> * sort case. This allows us to discard the largest entry cheaply.

> return "top-N heapsort";

> return "external merge";

Notes: `make_bounded_heap` reverses the sort direction so the *worst* kept tuple (largest, for an
ascending bound) sits at the heap's root, since the root is what a bounded heap discards cheaply;
the switch from an in-memory array to this bounded heapsort fires once the input exceeds twice the
bound, or once `workMem` fills with enough tuples to meet it. `EXPLAIN` reports the method by name
(`"top-N heapsort"`, `"external merge"`, among others read in the same function).
