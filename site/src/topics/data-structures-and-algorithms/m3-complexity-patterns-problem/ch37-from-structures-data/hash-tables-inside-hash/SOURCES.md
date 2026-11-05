## PostgreSQL nodeHash.c

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/executor/nodeHash.c
Version: `master`, fetched 2026-11-05

> #define NTUP_PER_BUCKET 1

> *bucketno = hashvalue & (nbuckets - 1);
> *batchno = pg_rotate_right32(hashvalue,
> hashtable->log2_nbuckets) & (nbatch - 1);

Notes: `ExecHashGetBucketAndBatch` takes the low bits of the 32-bit hash for the bucket and,
separately, rotates the hash right by `log2_nbuckets` bits before masking for the batch, so a
row's bucket and batch come from non-overlapping views of the same hash value. `NTUP_PER_BUCKET`
is the average load the executor sizes the bucket array for.

## PostgreSQL nodeHashjoin.c

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/backend/executor/nodeHashjoin.c
Version: `master`, fetched 2026-11-05

> The number of batches is always a power of two, so an increase in the number

> retained all or none of its tuples, the executor disables growth in the

Notes: the file's header comment (quoted in two pieces because the full sentences run across
several C comment lines) says the batch count only ever doubles, and that growth is disabled
globally once a batch is found that keeps either all or none of its tuples after a split — the
case of a single key too frequent to separate by hashing it further.

## PostgreSQL hashjoin.h

URL: https://raw.githubusercontent.com/postgres/postgres/master/src/include/executor/hashjoin.h
Version: `master`, fetched 2026-11-05

> uint32 hashvalue; /* tuple's hash code */

> The skew hashtable is limited to SKEW_HASH_MEM_PERCENT of the total memory

> #define SKEW_HASH_MEM_PERCENT 2

Notes: every stored tuple keeps its own 32-bit hash value, so the executor never rehashes a
tuple it has already seen. The skew optimization's dedicated, always-resident buckets for the
hottest build-side keys are capped at two percent of the hash table's allowed memory.

## Spark HashedRelation.scala

URL: https://raw.githubusercontent.com/apache/spark/master/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/HashedRelation.scala
Version: `master`, fetched 2026-11-05

> is determined by `key1 % cap`. Quadratic probing with triangular numbers is used to address

Notes: `LongToUnsafeRowMap`, the structure used when the join key is a single `long`, is an
open-addressing map, not the chained bucket array PostgreSQL uses; the file's own comment names
quadratic probing with triangular numbers as its collision strategy.

## Spark InjectRuntimeFilter.scala

URL: https://raw.githubusercontent.com/apache/spark/master/sql/catalyst/src/main/scala/org/apache/spark/sql/catalyst/optimizer/InjectRuntimeFilter.scala
Version: `master`, fetched 2026-11-05

> Insert a runtime filter on one side of the join (we call this side the application side) if

> we can extract a runtime filter from the other side (creation side). A simple case is that

> The runtime filter is logically an IN subquery with the join keys. Currently it's always

Notes: the rule's own header names the two sides (application, creation) and states plainly
that today the runtime filter is always a Bloom filter, whatever shape the comment's "logically
an IN subquery" phrasing suggests it could be in principle.

## Spark configuration page

URL: https://spark.apache.org/docs/latest/configuration.html
Version: Spark 4.3.0 documentation, fetched 2026-11-05

> spark.sql.optimizer.runtime.bloomFilter.expectedNumItems

> 1000000

> spark.sql.optimizer.runtime.bloomFilter.numBits

> 8388608

> spark.sql.optimizer.runtime.bloomFilter.applicationSideScanSizeThreshold

> 10GB

Notes: the live documentation (Spark 4.3.0, fetched at research time rather than the 4.2.0
planned) still carries the same default values for these three settings. 8,388,608 bits for
1,000,000 expected items is the 8.4 bits-per-item ratio `examples.py` uses.

## Spark BloomFilter.java

URL: https://raw.githubusercontent.com/apache/spark/master/common/sketch/src/main/java/org/apache/spark/util/sketch/BloomFilter.java
Version: `master`, fetched 2026-11-05

> private static int optimalNumOfHashFunctions(long n, long m) {

Notes: the method rounds `m / n * ln(2)` to the nearest integer, at least one; at Spark's
default ratio this gives the six hash functions `examples.py` computes and uses.

## Trino dynamic filtering documentation

URL: https://trino.io/docs/current/admin/dynamic-filtering.html
Version: Trino 484 documentation, fetched 2026-11-05

> exceeds these thresholds,

> Trino switches to collecting min and max values per column to reduce overhead.

Notes: Trino's dynamic filters start as the build side's exact distinct values and fall back to
a coarser per-column min/max range once the build side is too large — a different, lossier
filter than Spark's fixed-size Bloom filter, named here only for contrast.
