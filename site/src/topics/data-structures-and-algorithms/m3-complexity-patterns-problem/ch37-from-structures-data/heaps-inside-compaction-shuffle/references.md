# References

- Pebble, "merging_iter.go", source code, `master` branch.
  [merging_iter.go](https://raw.githubusercontent.com/cockroachdb/pebble/master/merging_iter.go)
  — fetched 2026-11-07. Read in full for the heap of child iterators and its direction switch.
- RocksDB, "merging_iterator.cc, dbformat.h, version_set.cc, compaction_iterator.h", source code,
  `main` branch.
  [merging_iterator.cc](https://raw.githubusercontent.com/facebook/rocksdb/main/table/merging_iterator.cc)
  — fetched 2026-11-07. Read for the independent heap design, the internal-key comparator, a
  compaction's own input iterator, and where shadowed versions are dropped.
- Velox, "TreeOfLosers.h, Merge.cpp", source code, `main` branch.
  [TreeOfLosers.h](https://raw.githubusercontent.com/facebookincubator/velox/main/velox/common/base/TreeOfLosers.h)
  — fetched 2026-11-07. Read for the tree of losers and its own twelve-stream worked example.
- Apache Spark, "UnsafeSorterSpillMerger.java, ExternalSorter.scala, BoundedPriorityQueue.scala,
  RDD.scala, limit.scala", source code, `master` branch.
  [ExternalSorter.scala](https://raw.githubusercontent.com/apache/spark/master/core/src/main/scala/org/apache/spark/util/collection/ExternalSorter.scala)
  — fetched 2026-11-07. Read for both of Spark's heap-based merges and the bounded top-K behind
  `takeOrdered`, `top` and `TakeOrderedAndProjectExec`. The comment attributed by the chapter
  plan to `limit.scala` ("This could have been named TopK...") was not found in the current
  `master` branch read at research time and is not quoted or attributed here (SOURCES.md).
- PostgreSQL, "tuplesort.c", source code, `master` branch.
  [tuplesort.c](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/utils/sort/tuplesort.c)
  — fetched 2026-11-07. Read for `make_bounded_heap`, the switch rule into a bounded heapsort,
  and `EXPLAIN`'s method names.
- `dsa.tournament-loser-trees` (Chapter 6, live), its own `examples.py`. Measured counts (k=8,
  k=6) reused directly, not re-derived, per the chapter plan's instruction; the plan's own
  "256-way" figure does not correspond to anything that topic actually built (OUTLINE.md →
  "Changes from the chapter plan").
- `dsa.sorting-inside-spilling-operators` (Chapter 37 topic 118, held), its registry entry and
  handoff, confirmed directly with the thread that built it and matching `registry.ts` word for
  word.

Last verified: 2026-11-07. Expert sign-off: pending.
