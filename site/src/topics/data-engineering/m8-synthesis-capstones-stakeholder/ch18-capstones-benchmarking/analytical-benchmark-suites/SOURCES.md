## TPC-H — Standard Specification, Revision 3.0.1

URL: https://www.tpc.org/tpc_documents_current_versions/pdf/tpc-h_v3.0.1.pdf
Version: TPC Benchmark H Standard Specification, Revision 3.0.1

> The components of the TPC-H database are defined to consist of eight separate and individual tables (the Base Tables).

> This Clause describes the twenty-two decision support queries and the two database refresh functions that must be executed as part of the TPC-H benchmark.

Used for: TPC-H's own stated eight-table schema and twenty-two-query workload, the first of the
five suites this topic names.

## TPC-DS — Standard Specification, Version 3.2.0

URL: https://www.tpc.org/tpc_documents_current_versions/pdf/tpc-ds_v3.2.0.pdf
Version: TPC Benchmark DS Standard Specification, Version 3.2.0

> The TPC-DS schema is a snowflake schema. It consists of multiple dimension and fact tables.

> A query stream consists of the 99 queries defined in Clause 4.

Used for: TPC-DS's own stated snowflake schema and ninety-nine-query workload, contrasted against
TPC-H's simpler eight-table schema and smaller query count.

## ClickBench — README (project repository)

URL: https://raw.githubusercontent.com/ClickHouse/ClickBench/main/README.md
Version: ClickHouse/ClickBench, main branch, fetched 2026-10-30; citation dated 2022

> The workload consists of 43 queries and test the efficiency of full scan and filtered scan, as well as index lookups, and the main relational operations.

> The dataset is a single flat table. This is different from classical data warehouses, which use a normalized star or snowflake data model. Therefore, classical data warehouses may have an unfair disadvantage in ClickHouse.

Used for: ClickBench's own stated shape (one single flat table, forty-three queries) and its own
documented blind spot (no join-model data at all, stated as a potential unfair disadvantage for
classical warehouses) — the exact mechanism this topic names as ClickBench's own trade-off, not an
outside criticism. ClickBench's own README credits itself to "Alexey Milovidov, 2022" under
References and Citation; this topic's hook phrase "ClickHouse, 2022" refers to that citation year,
not to the original 2013 dataset the same README's own History and Motivation section describes.

## Leis et al. — "How Good Are Query Optimizers, Really?" (PVLDB 2015)

URL: https://www.vldb.org/pvldb/vol9/p204-leis.pdf
Version: Proceedings of the VLDB Endowment, Vol. 9, No. 3, 2015

> In this paper, we introduce the Join Order Benchmark (JOB) and experimentally revisit the main components in the classic query optimizer architecture using a complex, real-world data set and realistic multi-join queries.

> We design a challenging workload named Join Order Benchmark (JOB), which is based on the IMDB data set.

> In reality, cardinality estimates are usually computed based on simplifying assumptions like uniformity and independence.

Used for: the Join Order Benchmark's own stated purpose (a real-world, IMDB-based workload for
join ordering and cardinality estimation) and its own stated reason (uniformity-and-independence
assumptions failing on real data) — the direct, named industry-scale descendant of topic 3's
correlated-column demonstration.

## TPC — Current Specifications listing

URL: https://www.tpc.org/tpc_documents_current_versions/current_specifications5.asp
Version: TPC's own current specifications page, fetched 2026-10-30

> Obsolete Workloads (latest version)

> TPC-DI

Used for: confirming, directly against TPC's own current specifications page rather than assumed
from memory, that TPC-DI is listed under TPC's own "Obsolete Workloads" table alongside TPC-A,
TPC-APP, TPC-B, TPC-D and TPC-R — TPC's own stated status for its only data-integration/ETL
benchmark.

## Wikipedia — "David DeWitt," DeWitt Clause section

URL: https://en.wikipedia.org/wiki/DeWitt_Clause
Version: Wikipedia, "David DeWitt" article (redirected from "DeWitt Clause"), revision fetched 2026-10-30

> Several commercial database vendors include an end-user license agreement provision, known as the DeWitt Clause, that prohibits researchers and scientists from explicitly using the names of their systems in academic papers.

> In essence, a DeWitt Clause forbids the publication of database benchmarks that the database vendor has not sanctioned.

Used for: a reputable tertiary write-up of the DeWitt-clause practice's name, mechanism and origin
(no single vendor's own documentation states the practice candidly, so this topic cites an
independent reference source instead, per the chapter's own stated sourcing plan).
