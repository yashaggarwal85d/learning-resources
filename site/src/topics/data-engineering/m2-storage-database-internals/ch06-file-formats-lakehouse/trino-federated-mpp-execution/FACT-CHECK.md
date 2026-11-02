# Fact-check — Trino: federated MPP execution (topic 34, §6.4)

| # | Claim | Verified? |
|---|---|---|
| 1 | The coordinator parses statements, plans queries, and manages workers | Yes, quoted verbatim (SOURCES.md #1, via "keeps track of the activity on each worker") |
| 2 | A connector adapts Trino to a data source via a standard SPI | Yes, quoted verbatim (SOURCES.md #2) |
| 3 | Stages model a distributed query plan; exchanges transfer data between stages | Yes, quoted verbatim (SOURCES.md #3, #4) |
| 4 | Dynamic filtering collects candidate join keys from the build side | Yes, quoted verbatim (SOURCES.md #5) |
| 5 | Dynamic filters require two distinct connector-level capabilities: table-scan-runtime pushdown and splits-enumeration-stage pushdown | Yes, quoted verbatim, two separate bullets (SOURCES.md #6, #7) |
| 6 | Hive connector pushes dynamic filters into ORC/Parquet readers for stripe/row-group pruning | Yes, quoted verbatim (SOURCES.md #8) |
| 7 | Dynamic filters skip loading partitions that don't match the join criteria | Yes, quoted verbatim (SOURCES.md #9) |
| 8 | Cost-based join enumeration uses table statistics from connectors to pick the lowest-cost join order | Yes, quoted verbatim (SOURCES.md #10, #11) |
| 9 | Without usable statistics, Trino falls back to the ELIMINATE_CROSS_JOINS strategy, not full cost-based ordering | Yes, quoted verbatim (SOURCES.md #12) |
| 10 | Cost-based strategies require the connector to supply table statistics | Yes, quoted verbatim (SOURCES.md #13) |
| 11 | The Iceberg connector has a dynamic-filtering wait-timeout config property | Yes, quoted verbatim (SOURCES.md #14) |
| 12 | The Iceberg connector has a table-statistics-enabled config property feeding the CBO | Yes, quoted verbatim (SOURCES.md #15) |
| 13 | The Iceberg connector supports projection pushdown | Yes, quoted verbatim (SOURCES.md #16) |
| 14 | Iceberg connector collects column statistics via ANALYZE | Yes, quoted verbatim (SOURCES.md #17) |
| 15 | Fault-tolerant execution is off by default | Yes, quoted verbatim (SOURCES.md #18) |
| 16 | QUERY retry policy retries a whole query on worker error; best for many small queries | Yes, quoted verbatim (SOURCES.md #19) |
| 17 | TASK retry policy retries individual tasks; requires an exchange manager; recommended for large batch queries | Yes, quoted verbatim (SOURCES.md #20, #21) |
| 18 | TASK retry requires external-storage spooling for intermediate exchange data | Yes, quoted verbatim (SOURCES.md #22) |
| 19 | Default (no fault tolerance) behavior fails the whole query on a worker-resource failure, requiring a manual re-run | Yes, quoted from the docs' "By default, if a Trino node lacks the resources..." sentence (same page as #18-22; the exact clause is reflected in examples.py's `run_with_query_retry_on_task_failure` model, disclosed in SOURCES.md's Red team section as a modeled mechanism, not a literal re-run of Trino itself) |
| 20 | PrestoSQL's founders split from Facebook's Presto governance in January 2019 by founding an independent foundation | Yes, quoted verbatim (SOURCES.md #23, #26) |
| 21 | Facebook founded a competing Presto Foundation under the Linux Foundation and applied for the Presto trademark, forcing the rename | Yes, quoted verbatim (SOURCES.md #24, #25) |
| 22 | The rename to Trino happened in December 2020 | Yes — the announcement itself is dated and titled "We're rebranding PrestoSQL as Trino," published 27 December 2020 (SOURCES.md source page) |
| 23 | Prestissimo replaces Presto's Java worker with a C++ process built on Velox | Yes, quoted verbatim (SOURCES.md #27) |
| 24 | Prestissimo is a drop-in C++ replacement for Presto workers, keeping the Java coordinator | Yes, quoted verbatim (SOURCES.md #28, #29) |
| 25 | Prestissimo/Velox adoption at Meta is described as "in various stages of integration," not blanket production-everywhere | Yes, quoted verbatim (SOURCES.md #30) |
| 26 | The decision-framework/engine model in examples.py (coordinator/worker scheduling, dynamic filtering, cost-based build-side choice, TASK-retry spooling) is executed Python, run and asserted | Yes, executed; 3 runs byte-identical, all assertions pass |

## Red team

- No real Trino cluster or JVM process runs in this sandbox (no Docker daemon
  available) — `examples.py` models four of Trino's documented mechanisms with real,
  executed Python and real threading, not Trino's own code. Disclosed in
  `examples.py`'s docstring and SOURCES.md's Red team section.
- The exact sentence describing broadcast-join local pushdown and partitioned-join
  distribution to workers could not be pinned to one short, clean contiguous quote;
  the two connector-capability bullets (quotes #6, #7) are used instead, covering the
  same two-level mechanism.
- "Puffin" is not named anywhere in Trino's own Iceberg connector docs (checked
  directly) — this topic does not attribute a Puffin-specific claim to Trino's docs,
  even though topic 25 (a prerequisite) covers Puffin files from Iceberg's own side.
- Prestissimo's speedup numbers (3-6x, 6-7x) are Meta's own reported experiment
  results, not an independently reproduced benchmark — stated as Meta's own claim.
- A PrestoDB blog post reportedly calling the C++ worker "Presto 2.0" with 3-4x
  production gains returned HTTP 403 when fetched and is not used as a sourced claim
  anywhere in this topic.

## Scope boundary

This topic covers Trino's coordinator/worker architecture, connector SPI/pushdown,
dynamic filtering, cost-based join ordering via table statistics, fault-tolerant
(TASK/QUERY retry) execution, and the Presto/Trino/Prestissimo history and alternative
C++ worker path — all from Trino's/Meta's own current documentation and announcements,
modeled with real executed code where a live Trino cluster isn't available in this
sandbox. It does not cover Trino's full SQL surface, security/authentication, or
cluster deployment/sizing, which are out of scope for this chapter.
