# Sources: LSM compaction and the RUM trade-off (`de.lsm-compaction-rum-trade`)

## Designing Access Methods: The RUM Conjecture (Athanassoulis, Kester, Maas, Stoica, Idreos, Ailamaki, Callaghan; EDBT 2016)

URL: https://users.cs.utah.edu/~pandey/courses/cs6530/fall22/papers/indexdesign/rum.pdf
Version: EDBT 2016 proceedings copy, retrieved 2026-10-24

> The fundamental challenges that every researcher, systems architect, or designer faces when designing a new access method are how to minimize, i) read times (R), ii) update cost (U), and iii) memory (or storage) overhead (M). In this paper, we conjecture that when optimizing the read-update-memory overheads, optimizing in any two areas negatively impacts the third.

> Read Overhead (RO). The RO of an access method is given by the data accesses to auxiliary data when retrieving the necessary base data. We refer to RO as the read amplification: the ratio between the total amount of data read including auxiliary and base data, divided by the amount of retrieved data.

> Update Overhead (UO). The UO is given by the amount of updates applied to the auxiliary data in addition to the updates to the main data. We refer to UO as the write amplification: the ratio between the size of the physical updates performed for one logical update, divided by the size of the logical update.

> Memory Overhead (MO). The MO is the space overhead induced by storing auxiliary data. We refer to MO as the space amplification, defined as the ratio between the space utilized for auxiliary and base data, divided by the space utilized for base data.

> The theoretical minimum for each overhead is to have the ratio equal to 1.0, implying that the base data is always read and updated directly and no extra bit of memory is wasted. Achieving these bounds for all three overheads simultaneously, however, is not possible as there is always a price to pay for every optimization.

> Hypothesis. An access method that is optimal with respect to one of the read, update, and memory overheads, cannot achieve the optimal value for both remaining overheads.

Contents: the three overheads (read, update, memory) and their precise "amplification" definitions as ratios; the conjecture itself, stated as a hypothesis; the theoretical minimum of 1.0 for each overhead and why all three can't hit it at once.

## RocksDB Compaction (RocksDB wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Compaction.md
Version: retrieved 2026-10-24 (GitHub wiki, facebook/rocksdb)

> The lowest-numbered level, L0, can be called the **top** level or **first** level.

> Classic Leveled compaction, introduced by LSM-tree paper by O'Neil et al, minimizes space amplification at the cost of read and write amplification.

> While write amplification is usually worse with leveled than with tiered, there are a few cases where leveled is competitive.

> For tiered compaction the notion of levels are usually a concept to reason about the shape of the LSM tree and estimate write amplification. With RocksDB they are also an implementation detail.

> Tiered compaction in RocksDB code base is termed Universal Compaction.

> The FIFOStyle Compaction drops oldest file when obsolete and can be used for cache-like data.

Contents: L0 as the newest-data level; leveled compaction's own space-vs-read/write amplification trade (minimizes space, costs read and write); tiered compaction's own trade (named Universal in RocksDB's code); FIFO compaction as the drop-oldest, cache-like-data style.

## RocksDB Write Stalls (RocksDB wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Write-Stalls.md
Version: retrieved 2026-10-24 (GitHub wiki, facebook/rocksdb)

> RocksDB has extensive system to slow down writes when flush or compaction can't keep up with the incoming write rate. Without such a system, if users keep writing more than the hardware can handle, the database will:

> * Increase space amplification, which could lead to running out of disk space;
> * Increase read amplification, significantly degrading read performance.

> **Too many level-0 SST files.** When the number of level-0 SST files reaches `level0_slowdown_writes_trigger`, writes are stalled. When the number of level-0 SST files reaches `level0_stop_writes_trigger`, writes are fully stopped to wait for level-0 to level-1 compaction reduce the number of level-0 files.

> **Too many pending compaction bytes.** When estimated bytes pending for compaction reaches `soft_pending_compaction_bytes`, writes are stalled. When estimated bytes pending for compaction reaches `hard_pending_compaction_bytes`, write are fully stopped to wait for compaction.

> Whenever stall conditions are triggered, RocksDB will reduce write rate to `delayed_write_rate`, and could possibly reduce write rate to even lower than `delayed_write_rate` if estimated pending compaction bytes accumulates.

Contents: why write stalls exist at all (unchecked writes grow space and read amplification without bound); the two concrete, named triggers this topic measures (too many L0 files, too many pending compaction bytes) each with its own slowdown and full-stop threshold; what RocksDB actually does once triggered (throttle to a configured rate, not just block).
