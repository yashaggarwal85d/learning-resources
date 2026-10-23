## Athanassoulis, Kester, Idreos, Ailamaki, Stoica, Callaghan — "Designing Access Methods: The RUM Conjecture" (EDBT 2016)

URL: https://openproceedings.org/2016/conf/edbt/paper-12.pdf
Version: EDBT 2016 proceedings (OpenProceedings.org), fetched 2026-10-23

> The RUM Conjecture: Read, Update, Memory – Optimize Two
at the Expense of the Third.

> we conjecture that it is not possible to optimize
across all three dimensions at the same time.

> The RUM Conjecture. An access method that can set an upper
bound for two out of the read, update, and memory overheads, also
sets a lower bound for the third overhead.

> In other words, we can choose which two overheads to prioritize

> there are three quantities and design parameters that researchers
always try to minimize: (1) the read overhead (R), (2) the update overhead (U), and (3) the memory (or storage) overhead (M),
henceforth called the RUM overheads.

### Contents (item by item, this topic's scope)

- The RUM conjecture's own name and precise statement: optimizing two of read/update/memory overheads sets a hard lower bound on the third — used as the chapter-closing generalization the measured amplification numbers instantiate.
- The three named overheads (read, update, memory/storage) as the conjecture's own terms, mapped onto this topic's read/write/space amplification without claiming the paper itself uses "write" or "space amplification" as its own vocabulary.

## Dayan, Athanassoulis, Idreos — "Monkey: Optimal Navigable Key-Value Store" (SIGMOD 2017)

URL: https://nivdayan.github.io/monkeykeyvaluestore.pdf
Version: SIGMOD 2017, fetched 2026-10-23

> The first problem is that existing designs assign the same false
positive rate (i.e., number of bits per element) to every Bloom filter
regardless of the size of the run that it corresponds to.

> Our insight
is that the worst-case point lookup cost over the whole LSM-tree
is proportional to the sum of the false positive rates of all filters.

> Assigning equal false positive rates to all filters, however, does not
minimize this sum.

> The core idea is setting the false positive rate of each Bloom
filter to be proportional to the number of entries in the run that it
corresponds to (meaning that the false positive rates for shallower
levels are exponentially decreasing).

> We show analytically that
this way shaves a factor of O(L) from the worst-case lookup cost

> All implementations that we know
of use 10 bits per entry for their Bloom filters by default [3, 4, 5,
15, 19, 29]. The corresponding false positive rate is ≈ 1%.

### Contents (item by item, this topic's scope)

- The specific inefficiency Monkey identifies: a uniform per-filter false-positive rate (the convention topic 28 already measured against) wastes memory relative to sizing each level's filter by its own run size.
- Monkey's own fix: size each level's Bloom filter's false-positive rate in proportion to that level's run size, smaller levels getting tighter (lower false-positive) filters.
- The confirmation that uniform, non-tuned filters (as topic 28's own `examples.py` used) are the real-world default this result improves on.

## Dayan, Idreos — "Dostoevsky: Better Space-Time Trade-Offs for LSM-Tree Based Key-Value Stores via Adaptive Removal of Superfluous Merging" (SIGMOD 2018)

URL: https://nivdayan.github.io/dostoevsky.pdf
Version: SIGMOD 2018, fetched 2026-10-23

> To address this problem, we introduce Lazy Leveling, a new design that removes merge operations from all levels of LSM-tree but
the largest.

> Lazy Leveling improves the worst-case complexity of
update cost while maintaining the same bounds on point lookup
cost, long range lookup cost, and storage space.

> Dostoevsky analytically finds the
tuning of Fluid LSM-tree that maximizes throughput for a particular
application workload and hardware subject to a user constraint
on space-amplification.

> Since the worst-case point lookup cost, long range lookup cost
and space-amplification derive mostly from the largest level, merge
operations at all levels of LSM-tree but the largest (i.e., most merge
operations) hardly improve on these metrics while significantly
adding to the amortized cost of updates.

> Relative
to Lazy Leveling, Fluid LSM-tree can optimize more for updates by
merging less at the largest level, or it can optimize more for short
range lookups by merging more at all other levels.

### Contents (item by item, this topic's scope)

- Dostoevsky's own diagnosis: merging at every level but the largest barely helps worst-case lookup cost or space amplification, because both are dominated by the largest level, while it costs update throughput at every level it happens on.
- Lazy Leveling's own fix: merge only at the largest level, leaving every smaller level unmerged (tiered), trading some range-lookup cost for much cheaper updates at the same space-amplification bound.
- Dostoevsky as the system that picks where on the tiered-to-leveled spectrum to sit per workload, under an explicit space-amplification constraint — the paper's own term for a hybrid, workload-adaptive policy.

## RocksDB Compaction (wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Compaction.md
Version: `wiki` branch, fetched 2026-10-23

> Classic Leveled compaction, introduced by LSM-tree paper by O'Neil et al, minimizes space amplification at the cost of read and write amplification.

> Tiered compaction minimizes write amplification at the cost of read and space amplification.

> Tiered+Leveled has less write amplification than leveled and less space amplification than tiered.

> The tiered+leveled approach is a hybrid that uses tiered for the smaller levels and leveled for the larger levels.

> Compaction into level N (Ln) merges data from Ln-1 into Ln.

> The size ratio of adjacent levels is sometimes called the fanout and write amplification is minimized when the same fanout is used between all levels.

### Contents (item by item, this topic's scope)

- The three-way trade-off, named directly: leveled minimizes space at the cost of read+write; tiered minimizes write at the cost of read+space; a leveled/tiered hybrid lands in between on both axes it mixes.
- The per-level merge mechanic (`Ln-1` merged into `Ln`) and the size-ratio/fanout definition this topic's own `examples.py` uses to size its levels.
- Confirmation that RocksDB itself implements exactly these three families (Level Compaction = tiered+leveled, Universal Compaction = tiered), a real, current production engine, not a textbook abstraction.

## RocksDB Leveled Compaction (wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Leveled-Compaction.md
Version: `wiki` branch, fetched 2026-10-23

> All non-0 levels have target sizes. Compaction's goal will be to restrict data size of those levels to be under the target. The size targets are usually exponentially increasing

> In this case, we will pick at least one file from L1 and merge it with the overlapping range of L2. The result files will be placed in L2

### Contents (item by item, this topic's scope)

- The literal, file-level mechanic of a leveled compaction: a level has a target size, and a compaction moves a file (or files) from one level into the overlapping range of the next level down, rewriting it there — the two-or-more-blocks-sweeping-together move the chapter's visual grammar draws.
- Exponentially increasing per-level target sizes, confirming the fanout/size-ratio claim from the Compaction overview above in a single, specific engine's real design.

## RocksDB Universal Compaction (wiki)

URL: https://raw.githubusercontent.com/wiki/facebook/rocksdb/Universal-Compaction.md
Version: `wiki` branch, fetched 2026-10-23

> Universal Compaction Style is a compaction style, targeting the use cases requiring lower write amplification, trading off read amplification and space amplification.

> The key difference between the two strategies is that leveled compaction tends to aggressively merge a smaller sorted run into a larger one, while "tiered" waits for several sorted runs with similar size and merge them together.

> size amplification ratio = (size(R1) + size(R2) + ... size(Rn-1)) / size(Rn)

> 0 is the perfect size amplification and 100 means DB size is double the space of live data, and 200 means triple.

### Contents (item by item, this topic's scope)

- Tiered (Universal)'s own merge trigger: several similar-sized runs merged together only once accumulated, rather than leveled's smaller-into-larger-immediately rule — the mechanical reason tiered trades space for write cost.
- A real, named formula for a space-amplification ratio this topic's own `examples.py` adapts directly: total non-largest-run bytes over the largest run's bytes, with 0 the ideal and larger values meaning proportionally more wasted disk.
