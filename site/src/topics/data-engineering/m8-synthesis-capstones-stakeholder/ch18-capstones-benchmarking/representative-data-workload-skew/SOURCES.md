## PostgreSQL — 14.2.2. Extended Statistics (Documentation: 18)

URL: https://www.postgresql.org/docs/current/planner-stats.html
Version: PostgreSQL 18 documentation, current as of research time (2026-10-30)

> It is common to see slow queries running bad execution plans because multiple columns used in the query clauses are correlated. The planner normally assumes that multiple conditions are independent of each other, an assumption that does not hold when column values are correlated. Regular statistics, because of their per-individual-column nature, cannot capture any knowledge about cross-column correlation.

Used for: the planner's own documented independence assumption, and the cardinality-estimate
error correlated columns cause — the mechanism this topic reproduces directly on the shop's
schema.

## YCSB — Workload A (project repository)

URL: https://raw.githubusercontent.com/brianfrankcooper/YCSB/master/workloads/workloada
Version: brianfrankcooper/YCSB, master branch, fetched 2026-10-30

> # Request distribution: zipfian

Used for: YCSB's own standard core workload (Workload A, "update heavy") configures its request
distribution as Zipfian — the specific, citable fact behind the syllabus's "(the YCSB default)"
parenthetical. (YCSB's underlying `CoreWorkload` class falls back to `uniform` only when a
workload file does not set `requestdistribution` at all; every one of YCSB's own shipped core
workload files does set it, most to `zipfian`, which this topic states precisely rather than
implying every possible YCSB run defaults to Zipfian with no configuration.)

## YCSB — ZipfianGenerator.java (project repository)

URL: https://raw.githubusercontent.com/brianfrankcooper/YCSB/master/core/src/main/java/site/ycsb/generator/ZipfianGenerator.java
Version: brianfrankcooper/YCSB, master branch, fetched 2026-10-30

> A generator of a zipfian distribution. It produces a sequence of items, such that some items are more popular than
> * others, according to a zipfian distribution.

Used for: YCSB's own description of what the Zipfian generator does (a small number of items made
disproportionately popular), the mechanism this topic reproduces on the shop's customer ids.

## TPC-H — Standard Specification, Revision 3.0.1

URL: https://www.tpc.org/tpc_documents_current_versions/pdf/tpc-h_v3.0.1.pdf
Version: TPC Benchmark H Standard Specification, Revision 3.0.1

> The number/formula below each table name represents the cardinality (number of rows) of the table. Some
> are factored by SF, the Scale Factor, to obtain the chosen database size.

> The database size is defined with reference to scale factor 1 (i.e., SF = 1; approximately 1GB as per Clause 4.2.5),
> the minimum required size for a test database.

Used for: TPC's own definition of "scale factor," the convention this topic's own, much smaller
stated scale factor follows.
