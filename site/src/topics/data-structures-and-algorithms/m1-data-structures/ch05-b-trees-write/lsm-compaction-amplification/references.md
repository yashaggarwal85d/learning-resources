Last verified: 2026-10-23. Expert sign-off: pending.

- Athanassoulis, Kester, Idreos, Ailamaki, Stoica, Callaghan, "Designing Access Methods: The RUM Conjecture" (EDBT 2016) — the general read/update/memory trade-off this topic's own write/read/space amplification numbers instantiate for compaction specifically. [source](https://openproceedings.org/2016/conf/edbt/paper-12.pdf)
- Dayan, Athanassoulis, Idreos, "Monkey: Optimal Navigable Key-Value Store" (SIGMOD 2017) — why a uniform per-level Bloom-filter false-positive rate is suboptimal, and the proportional-to-run-size fix. [source](https://nivdayan.github.io/monkeykeyvaluestore.pdf)
- Dayan, Idreos, "Dostoevsky: Better Space-Time Trade-Offs for LSM-Tree Based Key-Value Stores via Adaptive Removal of Superfluous Merging" (SIGMOD 2018) — Lazy Leveling and the tiered-to-leveled design spectrum. [source](https://nivdayan.github.io/dostoevsky.pdf)
- RocksDB Compaction (wiki) — the leveled/tiered/hybrid taxonomy and their trade-offs, in a real, current production engine. [source](https://raw.githubusercontent.com/wiki/facebook/rocksdb/Compaction.md)
- RocksDB Leveled Compaction (wiki) — the literal file-level mechanic of a leveled compaction. [source](https://raw.githubusercontent.com/wiki/facebook/rocksdb/Leveled-Compaction.md)
- RocksDB Universal Compaction (wiki) — the tiered merge trigger and the size-amplification-ratio formula this topic's `examples.py` adapts. [source](https://raw.githubusercontent.com/wiki/facebook/rocksdb/Universal-Compaction.md)

Canonical numbers (write, read and space amplification for leveled and tiered compaction on one
real, identical workload; and the summed false-positive rate of a uniform versus a Monkey-style
per-level Bloom-filter memory split at the same total memory budget) are computed and asserted
directly in this topic's `examples.py`, on this machine, in one run.

Related tracks (see Prerequisites): `dsa.lsm-tree-write-read` (this chapter) for the write and read
paths this topic's compaction cleans up and measures against; binary heaps (next) for Chapter 6.

Spotted an error? [Open an issue](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=lsm-compaction-amplification:%20).
