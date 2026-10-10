# de-m1 change log — Data Engineering Milestone 1 (original.md lines 46–198)

## Corrections
- §2.3 "optimizers use heuristics/genetic search past ~10 joins": made precise for PostgreSQL. Join search collapses at `from_collapse_limit`/`join_collapse_limit` = 8 and GEQO starts at `geqo_threshold` = 12 FROM items. Source: https://www.postgresql.org/docs/current/runtime-config-query.html
- §2.3 / SiP: the Volcano iterator model is now one execution model among three (vectorized, compiled). The SiP no longer implies every engine runs tuple-at-a-time.
- §2.1 MERGE/UPSERT: the "concurrency implications" are now stated. PostgreSQL MERGE can raise unique violations under concurrent inserts, while INSERT … ON CONFLICT is race-safe (PostgreSQL MERGE docs; well established).
- §2.2 QUALIFY: added its Teradata origin and kept the note that it is not ISO SQL.
- §1.3 numeric bugs: added timestamp resolution (pandas 3.0 now infers µs when parsing strings). Source: https://pandas.pydata.org/docs/whatsnew/v3.0.0.html
- SiP Cloud warehouses: the vague claim that "Redshift's planner picks a distribution-aware join strategy" is now a concrete case study (co-located vs redistribute/broadcast, compiled segments, RA3), based on the SIGMOD 2015 and 2022 Redshift papers.

## Currency updates (with source URLs)
- PostgreSQL 18 (GA Sept 2025): B-tree skip scan (§2.4), async I/O with `io_method` including `io_uring` (§1.3), `uuidv7()` (§3.1 keys), `WITHOUT OVERLAPS` and `PERIOD` temporal constraints (§3.2 bitemporal), RETURNING OLD/NEW (§2.1). Sources: https://www.postgresql.org/about/news/postgresql-18-released-3142/ , https://www.postgresql.org/about/press/presskit18
- PostgreSQL 18 `EXPLAIN ANALYZE` now shows BUFFERS by default (§2.3). Source: https://www.depesz.com/2025/01/15/waiting-for-postgresql-18-enable-buffers-with-explain-analyze-by-default/
- PostgreSQL 19 (beta 4 on 2026-09-24, not GA): `pg_plan_advice`/`pg_stash_advice` (§2.3 plan regressions), eager aggregation (§2.3), GROUP BY ALL (§2.1), all marked "beta". SQL/PGQ and `FOR PORTION OF` were reverted in beta 4, so they are not claimed for PostgreSQL. Sources: https://www.postgresql.org/about/news/postgresql-19-beta-1-released-3313/ , https://www.postgresql.org/about/news/postgresql-19-beta-4-3386/
- SQL pipe syntax `|>` (BigQuery; Spark 4.0 / Databricks Runtime 16.2+) added to §2.1 dialect topic. Sources: https://www.databricks.com/blog/sql-gets-easier-announcing-new-pipe-syntax , https://www.databricks.com/blog/introducing-apache-spark-40
- VARIANT / Iceberg v3 variant type (§2.1 nested data). Sources: https://docs.snowflake.com/ja/release-notes/2026/other/2026-03-04-iceberg-v3-support-preview , https://www.snowflake.com/ko/blog/apache-iceberg-v3-table-spec-oss-shared-success/
- pandas 3.0.0 (2026-01-21): Copy-on-Write always on, default `str` dtype (PyArrow-backed when installed), µs datetime inference (§4.2 "pandas 3.0 semantics"). Source: https://pandas.pydata.org/docs/whatsnew/v3.0.0.html
- Polars 2.0: the streaming engine is the default for lazy queries and row order is no longer implicit (§4.2). The cuDF GPU engine now has a streaming backend. Sources: https://docs.pola.rs/releases/upgrade/2/ , https://pypi.org/pypi/polars/json (2.0.0 latest), https://developer.nvidia.com/blog/rapids-adds-gpu-polars-streaming-a-unified-gnn-api-and-zero-code-ml-speedups/
- Python 3.14 (Oct 2025): free-threaded build officially supported but optional (PEP 779; ~5–10% single-thread overhead), `concurrent.interpreters` + InterpreterPoolExecutor (PEP 734), PEP 768 remote attach, `compression.zstd` (§4.1, SiP). Sources: https://discuss.python.org/t/pep-779-criteria-for-supported-status-for-free-threaded-python/84319 , https://peps.python.org/pep-0734/ , https://peps.python.org/pep-0768 , https://www.python.org/downloads/release/python-3140
- Python 3.15: `profiling.sampling` (PEP 799, "Tachyon") cited in §4.1. 3.15.0 final was scheduled for 2026-10-09 after rc3 and was not yet listed on python.org when checked. Sources: https://www.python.org/downloads/release/python-3150rc3/ , https://docs.python.org/sv/dev/whatsnew/3.15.html , https://www.python.org/downloads/
- Arrow PyCapsule interface (`__arrow_c_stream__`) and Narwhals (§4.1, §4.2). Sources: https://arrow.apache.org/docs/format/CDataInterface/PyCapsuleInterface.html , https://labs.quansight.org/blog/narwhals-pycapsule
- uv + PEP 751 `pylock.toml` export (§4.3). Source: https://docs.astral.sh/uv/concepts/projects/export/
- OpenAI's agreement to acquire Astral (uv, Ruff, ty), Mar 19 2026 (§4.3 stewardship note). Source: https://openai.com/index/openai-to-acquire-astral
- dbt: Fusion engine (public beta May 2025) is GA on Snowflake for dbt platform projects and preview elsewhere. The Fivetran–dbt Labs merger closed June 1 2026, and the Fusion runtime was open-sourced as dbt Core v2.0 (Apache 2.0, alpha) (§3.4). Sources: https://docs.getdbt.com/docs/fusion/fusion-readiness , https://www.getdbt.com/blog/fivetran-dbt-labs-complete-merger-to-create-the-data-infrastructure-for-trusted-ai-agents
- SQLMesh: Fivetran acquired Tobiko (SQLMesh), so both transformation tools now sit under one owner (§3.4). Source: https://www.techtarget.com/searchdatamanagement/news/366632699/Fivetran-DBT-Labs-merge-to-add-complementary-capabilities
- Semantic layer: MetricFlow open-sourced under Apache 2.0 (Coalesce, Oct 2025) as the OSI reference implementation. Snowflake semantic views are GA. Databricks Unity Catalog metric views are documented as a production feature (§3.4). Sources: https://tools.prnewswire.com/en-us/live/20813/release/20251014EN96968 , https://www.getdbt.com/blog/the-osi-spec-updates , https://docs.snowflake.com/en/release-notes/2025/june-summit , https://docs.databricks.com/aws/en/metric-views
- Open Data Contract Standard v3.1.0 (Bitol, Linux Foundation) named in §3.4 data contracts. Source: https://bitol.io/bitol-announces-odcs-v3-1-0-stronger-smarter-and-stricter/
- Pandera supports pandas ≥3 and has a Polars backend (0.30.0, Mar 2026); GX Core is on 1.x (§4.2). Source: https://newreleases.io/project/pypi/pandera/release/0.30.0
- DuckDB current lines are 1.5.x, with 1.4.x as LTS. No version is pinned in the syllabus; the DuckDB references stay version-agnostic. Source: https://duckdb.org/2026/07/22/announcing-duckdb-155

## Added topics
- §1.2 The external-memory (I/O) cost model (Aggarwal–Vitter); replaces the loose "Big-O in I/O terms" bullet with a teachable model.
- §1.3 Object storage as a storage tier (latency, request limits, range GETs, conditional writes).
- §1.4 Tail latency under fan-out (Dean & Barroso 2013).
- §2.1 SQL standards and dialect portability (SQL:2023, QUALIFY/GROUP BY ALL/EXCLUDE, pipe syntax, SQLGlot).
- §2.2 Window function execution internals (segment trees, sort reuse; Leis et al. 2015).
- §2.3 Query rewrites and subquery unnesting; Execution models: iterator, vectorized, compiled (moved from §2.4 and expanded); Parallel and distributed query plans; Adaptive execution and runtime filters; Plan caching and plan regressions.
- §3.2 Wide-table and activity-schema alternatives (OBT, activity schema).
- §3.4 Incremental models and snapshots in dbt (incremental strategies incl. microbatch), split out of the dbt bullet.
- §4.1 Buffer protocol and zero-copy interchange (PEP 3118, Arrow C Data/PyCapsule, DLPack).
- §4.2 pandas 3.0 semantics; Polars lazy query engine.
- New §4.3 Python toolchain and native acceleration: Reproducible environments with uv; Native extensions with Rust and PyO3.
- Labs: original M1 had no labs. Added one build-break-measure lab to every section (15 labs).
- Systems in Production: 2 case-study groups (5 bullets) → 12 reel-sized case studies: System R, PostgreSQL planner/executor, PostgreSQL MVCC + Mandrill XID-wraparound postmortem, Join Order Benchmark, MonetDB/X100, HyPer + morsel-driven, DuckDB, Snowflake, Dremel/BigQuery, Redshift, Apache Arrow, free-threaded CPython (PEP 703).

## Removed or merged (with reason)
- §1.1 "Software-engineering workflow" kept as a refresher; its dependency-management part now points to §4.3.
- §1.2 "Heaps/priority queues (top-N, k-way merge)" merged into "External merge sort and k-way merge": the heap there is a step of the same mechanism.
- §1.2 "Streaming/online algorithms (forward ref)" removed as a duplicate of §5.6.
- §1.2 "Big-O in the context of I/O and network cost" merged into the new I/O cost-model topic.
- §1.4 "Serialization on the wire" removed as a duplicate. The cross-reference sits in "Bandwidth, latency and data locality" (→ §6.1, §4.1).
- §2.1 "Set operations" merged into "Relational algebra and bag semantics" (too small alone; same algebraic story).
- §2.1 "PIVOT/UNPIVOT" merged with grouping sets into one aggregation-shapes topic.
- §2.2 "Nested windows via staged CTEs" merged into "Window frame semantics".
- §2.2 "Ranking, sessionization, gaps-and-islands, change detection" and "Top-N per group / dedup" + QUALIFY restructured into "Ranking, top-N and deterministic dedup" (ranking + QUALIFY) and "Gaps-and-islands and sessionization" (change detection).
- §2.3 "Statistics, histograms, stale statistics" merged into "Cardinality estimation and statistics" (one mechanism).
- §2.3 "Join-order explosion…" and "join reordering" merged into "Cost models and join-order search".
- §2.3 "Spills to disk, memory pressure" merged into "Memory budgets, spilling and grace hash join".
- §2.4 "Partial and expression indexes" merged with covering indexes.
- §3.1 "Relationship cardinality" merged with "ER modeling" into one refresher.
- §3.2 "Surrogate keys" (duplicate of §3.1 keys) merged into "Key design: natural, surrogate, durable, hash"; "late-arriving facts" became its own topic with late-arriving dimensions.
- §3.2 "Conformed, degenerate, role-playing" and "Junk, mini, outrigger" regrouped: conformed → "Conformed dimensions and drill-across"; degenerate/role-playing/junk/outrigger → "Special-purpose dimension patterns"; mini-dimensions → "SCD types 0–7" (they are SCD Type 4).
- §3.3 "Warehouse workloads, columnar execution" and "Lakehouse architecture" and "Data lakes" merged into "From warehouse to lake to lakehouse" plus "Object storage and query economics" (columnar execution lives in §2.3/§6.5).
- §3.3 "Serving layers and semantic models" removed as a duplicate of §3.4 semantic layer, §5.5 serving stores and Ch.17 BI serving boundary.
- §3.3 "Data contracts and domain ownership" merged into §3.4 (data mesh + data contracts). It duplicated them.
- §3.4 "Data contracts enforced in CI" refocused on the contract specification. CI enforcement mechanics stay in §11.4 (single home) and governance in §13.4.
- §3.4 "dbt Fusion / dbt Mesh / SQLMesh" bullet: Mesh merged into the dbt core topic.
- §4.1 "Iterators/generators for streaming processing" merged into the §1.1 Python refresher (basic for this audience) and exercised in the §4.1 lab.
- §4.1 "Multiprocessing, threads, GIL implications, process boundaries" rewritten as "GIL, free-threading and subinterpreters".
- §4.2 "Pandas vs Polars vs Spark vs Dask vs Ray vs DuckDB" kept as "Choosing a DataFrame engine". Engine-specific mechanisms are split out (see Split topics).

## Split topics
- §2.2 Window functions → "Window frame semantics" + "Window function execution internals".
- §2.3 "Cost-based optimization, cardinality estimation" → "Cardinality estimation and statistics" + "Cost models and join-order search".
- §3.2 "SCD Type 1/2/3" + "SCD Type 4/6" → "SCD Type 2 implementation" (deep mechanism) + "SCD types 0–7 and selection".
- §3.4 "Transformation-as-code with dbt" → "dbt models, tests and lineage" + "Incremental models and snapshots in dbt".
- §3.4 "Transformation-layer evolution" → "dbt Fusion engine and SQL comprehension" + "SQLMesh plans and virtual environments".
- §4.1 "Object overhead / zero-copy" → "CPython object model and memory cost" + "Buffer protocol and zero-copy interchange".
- §4.2 DataFrame comparison → "pandas 3.0 semantics", "Polars lazy query engine", "Choosing a DataFrame engine".
- SiP "PostgreSQL" → planner/executor case study + MVCC/wraparound case study; SiP "Cloud warehouse planners" → Snowflake, Dremel/BigQuery, Redshift case studies.

## Moved
- §2.4 "Vectorized / columnar query execution" → §2.3 "Execution models: iterator, vectorized, compiled" (execution model belongs with the executor, not index tuning).
- §2.2 "Anti-joins, semi-joins, existence semantics" → §2.1 "Semi-joins, anti-joins and existence" (relational semantics, paired with NULL logic).
- §3.3 "Data contracts and domain ownership" → §3.4.
- §4.1 generators → §1.1 refresher.
- Section retitles: §1.2 "Algorithms that dominate data-system cost", §2.1 "Relational semantics and advanced query constructs", §2.2 "Window functions and temporal joins", §2.4 "Physical design and SQL performance", §4.1 "Memory, concurrency and high-throughput processing". New §4.3 appended (no renumbering).

## Refresher-tagged
- §1.1 Python language essentials; Git branching and history workflows; Linux shell and process toolkit; Software delivery workflow.
- §1.2 B+-trees vs LSM-trees at a glance; Graph algorithms for pipeline DAGs.
- §1.4 TCP/IP layers and their costs.
- §3.1 Conceptual, logical and physical models; OLTP vs OLAP workload shapes; ER modeling and relationship cardinality.

## Unverified
- Data Vault 2.1: I could not find a primary source for a published 2.1 specification. The topic stays "Data Vault 2.0" as in the original.
- Python 3.15.0 final release: scheduled for 2026-10-09 but not yet listed on python.org when checked. The syllabus cites only `profiling.sampling` "(3.15)" and no release date.
- Databricks Unity Catalog metric views GA date: the docs present it as a production feature, but I found no dated GA note. The syllabus does not claim GA.
- The exact year Fivetran acquired Tobiko/SQLMesh (believed 2025) has no primary source here. The syllabus says only that both tools now sit under Fivetran.
- The OSI spec name: a dbt Summit session calls it "Apache Ossie". This is unconfirmed, so the syllabus uses "Open Semantic Interchange (OSI)".
- Engine lists for QUALIFY, GROUP BY ALL and ASOF JOIN come from established knowledge and were not re-checked one by one in this pass.
- The web-search budget ran out near the end of the pass, so the items above could not get more searches.

Topics: before 102 (+2 Systems-in-Production case-study groups, 5 bullets) → after 102 (+12 Systems-in-Production case studies; 15 labs added)

## Reorder, 10 October 2026 (prerequisite order)

Building the first reel's Prerequisites panel showed that Chapter 1 taught the cost model before the hardware it rests on.

- §1.2 and §1.3 swapped: **§1.2 is now Computer architecture and OS fundamentals**, **§1.3 is now Algorithms that dominate data-system cost**. The I/O cost model uses the memory hierarchy, storage devices and object storage, so those come first.
- Within §1.3, **B+-trees vs LSM-trees at a glance** *(refresher)* moved ahead of **The external-memory (I/O) cost model**, which uses index lookups.
- §1.1: added **Asymptotic notation and logarithms** *(refresher)*; the cost model needs logarithms in any base. Full treatment stays in *Data Structures & Algorithms* Ch.1.
- References updated: "external merge sort, §1.2" → §1.3 (Ch.7 spill topic); *DSA* "→ *Data Engineering* §1.2" → §1.3.

Topics: before 552 → after 553.
