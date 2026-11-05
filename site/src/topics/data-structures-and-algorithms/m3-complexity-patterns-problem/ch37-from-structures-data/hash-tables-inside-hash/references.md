# References

- PostgreSQL, "nodeHash.c, nodeHashjoin.c, hashjoin.h", source code, `master` branch.
  [nodeHash.c](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/executor/nodeHash.c)
  — fetched 2026-11-05. Read in full for the bucket/batch split, batch growth and the skew
  hashtable.
- Apache Spark, "HashedRelation.scala, InjectRuntimeFilter.scala, BloomFilter.java", source
  code, `master` branch.
  [HashedRelation.scala](https://raw.githubusercontent.com/apache/spark/master/sql/core/src/main/scala/org/apache/spark/sql/execution/joins/HashedRelation.scala)
  — fetched 2026-11-05. Read for the open-addressed probe-side table, the runtime filter's
  application/creation sides, and the optimal-hash-count formula.
- Apache Spark, "Configuration", documentation, 4.3.0.
  [configuration.html](https://spark.apache.org/docs/latest/configuration.html) — fetched
  2026-11-05 (the chapter plan's own planning-time read was of the 4.2.0 page; the three
  settings this topic cites are unchanged between the two, confirmed by reading the live page
  directly).
- Trino, "Dynamic filtering", documentation, 484.
  [dynamic-filtering.html](https://trino.io/docs/current/admin/dynamic-filtering.html) —
  fetched 2026-11-05. Named once, for contrast with Spark's fixed-size Bloom filter.
- Chapter 31, "Partitioned hash joins: Grace and hybrid", syllabus title, not yet a published
  topic at build time, confirmed by checking `registry.ts` directly. Named as the general
  algorithm this topic's production executor is one instance of; not read as a source since it
  has no published plan or reel yet.

Last verified: 2026-11-05. Expert sign-off: pending.
