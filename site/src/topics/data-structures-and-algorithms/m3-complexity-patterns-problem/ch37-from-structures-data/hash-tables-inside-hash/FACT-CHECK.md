# FACT-CHECK — Hash tables inside hash joins

| # | Claim | Checked against |
|---|---|---|
| 1 | `NTUP_PER_BUCKET` is 1 | `nodeHash.c`, `#define NTUP_PER_BUCKET 1`, read directly |
| 2 | Bucket is the hash's low bits masked against `nbuckets - 1`; batch is the hash rotated right by `log2_nbuckets` then masked against `nbatch - 1` | `nodeHash.c`, `ExecHashGetBucketAndBatch`, read directly; reproduced and simulated in `examples.py` |
| 3 | The number of batches is always a power of two; growth doubles it | `nodeHashjoin.c` header comment, quoted word for word in SOURCES.md |
| 4 | Growth is disabled globally once a batch retains all or none of its tuples after a split | `nodeHashjoin.c` header comment, quoted word for word |
| 5 | Every stored tuple keeps its own 32-bit `hashvalue` | `hashjoin.h`, `uint32 hashvalue; /* tuple's hash code */`, quoted |
| 6 | The skew hashtable is capped at 2% (`SKEW_HASH_MEM_PERCENT`) of allowed memory | `hashjoin.h`, quoted; `examples.py` applies the literal cap to the chosen budget |
| 7 | At a budget of one twentieth of 4,000 customers (200 rows), the batch-doubling simulation lands on 32 batches | `examples.py`, `NBATCH == 32`, asserted and printed |
| 8 | About 92% of the simulated 80,000 orders are assigned to a batch other than the resident batch zero | `examples.py`, `SPILLED_PERCENT_ROUNDED == 92`, measured from the real bucket/batch assignment, not estimated |
| 9 | The 4-row skew table (2% of 200) keeps roughly a sixth of all simulated orders off disk | `examples.py`, `FRACTION_SKEW_AVOIDS_SPILL`, measured against the simulated order-frequency distribution |
| 10 | Spark's `LongToUnsafeRowMap` uses open addressing with quadratic probing and triangular numbers | `HashedRelation.scala`, quoted word for word |
| 11 | Spark's runtime filter names the application side and creation side, and is currently always a Bloom filter | `InjectRuntimeFilter.scala`, quoted word for word |
| 12 | Spark's live defaults: `expectedNumItems` 1,000,000; `numBits` 8,388,608; `applicationSideScanSizeThreshold` 10GB | `spark.apache.org/docs/latest/configuration.html` (Spark 4.3.0 live documentation), quoted and read directly, confirmed unchanged from the chapter plan's planning-time 4.2.0 read |
| 13 | The optimal hash count formula rounds `m/n · ln(2)`, at least 1 | `BloomFilter.java`, `optimalNumOfHashFunctions`, quoted and reproduced in `examples.py` |
| 14 | At Spark's default ratio (8.4 bits/item) the optimal hash count is 6 | `examples.py`, `SPARK_K == 6`, computed from the quoted formula |
| 15 | A filter built at the same ratio and probed with unseen keys measures a false-positive rate close to the formula's prediction | `examples.py`, `abs(MEASURED_FPR - SPARK_FPR) < 0.01`, independently built and measured, not assumed |
| 16 | Trino's dynamic filter switches from exact distinct values to per-column min/max once the build side exceeds a size threshold | Trino 484 "Dynamic filtering" documentation, quoted word for word |
| 17 | Chapter 31's "Partitioned hash joins: Grace and hybrid" is not yet a live topic | `registry.ts`, grepped directly, confirmed absent at build time (2026-11-05) |

## Red-team pass

- **Is the shop instance's exact sizing (4,000 customers, 80,000 orders, budget 200) taken from
  any source?** No — CHAPTER.md explicitly leaves each topic's planning values to the builder;
  documented in OUTLINE.md.
- **Does the scaled-down Bloom filter test (100x smaller) actually test Spark's real ratio?**
  Yes — the scaling keeps the exact bits-per-item ratio (8.388608) and recomputes the optimal
  hash count from that same ratio, landing on the identical k = 6 as the full-size filter.
- **Is the cache/TLB motivation for partitioning (named in the syllabus clause) actually
  measured, or only asserted?** Only asserted, in post-notes.md's "Partitioning is also a cache
  and TLB decision" section — explicitly scoped there to Chapter 31's own radix-partitioning
  topic rather than claimed as a measurement of this topic's own code.
- **Does the topic claim anything about PostgreSQL's `ExecHashIncreaseBatchSize` (growing the
  table instead of doubling batches)?** No — it is read and named in post-notes.md's
  "In production" section as a real complication this topic's row-count model does not
  simulate, not built or measured here.
- **Is the Spark documentation version actually current, or assumed from the chapter plan?**
  Checked directly: the live page serves Spark 4.3.0, not the planned 4.2.0; the three cited
  defaults were confirmed unchanged on the 4.3.0 page itself, not assumed.

## Corrections applied

None.
