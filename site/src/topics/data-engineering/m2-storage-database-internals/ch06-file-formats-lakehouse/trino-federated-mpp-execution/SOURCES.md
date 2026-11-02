## Trino documentation, "Trino concepts"

URL: https://trino.io/docs/current/overview/concepts.html
Version: fetched 2026-11-02

> The coordinator keeps track of the activity on each worker and

> A connector adapts Trino to a data source such as a data lake using Hadoop/Hive

> Stages are what the coordinator uses to

> Exchanges transfer data between Trino nodes for different stages of

## Trino documentation, "Dynamic filtering"

URL: https://trino.io/docs/current/admin/dynamic-filtering.html
Version: fetched 2026-11-02

> When dynamic filtering is enabled, Trino collects candidate values for join condition

> Connector support for utilizing dynamic filters pushed into the table scan at runtime.

> Connector support for utilizing dynamic filters at the splits enumeration stage.

> the Hive connector can push dynamic filters into ORC and Parquet readers

> to skip loading of partitions which don't match the join criteria.

## Trino documentation, "Cost-based optimizations"

URL: https://trino.io/docs/current/optimizer/cost-based-optimizations.html
Version: fetched 2026-11-02

> With cost-based join enumeration, Trino uses Table statistics

> provided by connectors to estimate the costs for different join orders and

> ELIMINATE_CROSS_JOINS strategy is used instead.

> the connector implementation must provide Table statistics.

## Trino documentation, "Iceberg connector"

URL: https://trino.io/docs/current/connector/iceberg.html
Version: fetched 2026-11-02

> iceberg.dynamic-filtering.wait-timeout

> iceberg.table-statistics-enabled

> iceberg.projection-pushdown-enabled

> The Iceberg connector can collect column statistics using ANALYZE

## Trino documentation, "Fault-tolerant execution"

URL: https://trino.io/docs/current/admin/fault-tolerant-execution.html
Version: fetched 2026-11-02

> Fault-tolerant execution is turned off by default. To enable the feature, set the

> A QUERY retry policy instructs Trino to automatically retry a query in the

> A TASK retry policy instructs Trino to retry individual query tasks in the event of failure. You must configure an

> This policy is recommended when executing large batch queries, as the cluster

> strongly recommended to configure an exchange manager that utilizes external storage for spooled data and

## Trino project announcement, "We're rebranding PrestoSQL as Trino"

URL: https://trino.io/blog/2020/12/27/announcing-trino
Version: fetched 2026-11-02

> We started the Presto Software Foundation in January 2019 as an independent entity to oversee the development of the

> Months after this consolidation, Facebook decided to create a competing community using The Linux Foundation

> Facebook applied for a trademark on Presto

> we had no choice but to leave Facebook in order to focus on making sure Presto

## Meta Engineering, "Introducing Velox: An open source unified execution engine"

URL: https://engineering.fb.com/2023/03/09/open-source/velox-open-source-execution-engine/
Version: fetched 2026-11-02

> Velox is being integrated into Presto as part of the Prestissimo project, where Presto Java workers are replaced by a C++ process based on Velox.

> Prestissimo provides a C++ implementation of Presto's HTTP REST interface, including worker-to-worker exchange serialization protocol, coordinator-to-worker orchestration, and status reporting endpoints, thereby providing a drop-in C++ replacement for Presto workers.

> The main query workflow consists of receiving a Presto plan fragment from a Java coordinator, translating it into a Velox query plan, and handing it off to Velox for execution.

> Velox is under active development, but it's already in various stages of integration with more than a dozen data systems at Meta

### Red team

- **No real Trino cluster runs in this sandbox.** No Docker daemon is available here
  (`docker ps` fails: "no such file or directory" for the socket), so neither Trino
  itself nor a JVM-based single-node cluster can be started. `examples.py` is instead a
  real, executed, minimal model of four of Trino's documented mechanisms — coordinator
  task scheduling onto worker threads, a dynamic filter built from a real join build
  side and used to prune a real probe-side scan, cost-based build-side selection from
  real row-count statistics, and TASK-retry spooling that avoids recomputing completed
  splits — run over real in-memory data with real threading and a real measured
  row-reduction effect, not Trino's own source code and not merely narrated.
- **Exact wording for broadcast/local pushdown and split-level distribution to
  workers** (two sentences in the "Dynamic filtering" doc describing where filters land
  after collection) could not be pinned to a single clean, standalone contiguous quote
  short enough to cite cleanly without surrounding sentence fragments; the two
  connector-capability bullets quoted above are used instead, which state the same
  two-level mechanism (table-scan-runtime vs. splits-enumeration-stage) more concisely
  and just as accurately.
- **"Puffin" statistics are not named anywhere in Trino's own Iceberg connector
  docs** (checked directly; absent from the fetched page). The topic therefore does not
  attribute a Puffin-specific claim to Trino's docs — Iceberg's statistics support is
  sourced only via the `iceberg.table-statistics-enabled` config property and the
  `ANALYZE`-based collection sentence above, which is what the Trino docs actually say.
- **Prestissimo's production maturity is stated in measured terms, not as a blanket
  claim.** Meta's own blog describes it as "under active development" and "in various
  stages of integration" — this topic does not claim Prestissimo is the universal
  production default; it states only what's directly quoted: it is a drop-in C++
  replacement for the Java worker, keeping the Java coordinator in place. Prestissimo's
  own measured speedup numbers (3-6x and 6-7x in two different Meta experiments) are
  cited in prose from Meta's own blog post, not an independent benchmark.
- **The Trino announcement blog never uses the word "fork."** It describes the 2019
  split as the original creators leaving Facebook and founding an independent
  foundation, with Facebook's own Presto lineage continuing separately under the Linux
  Foundation months later and then applying for the Presto trademark, which is what
  forced the December 2020 rename to Trino. This topic follows the primary source's own
  framing rather than asserting "fork" as a direct quote.
- **A PrestoDB blog post reportedly naming the C++ worker "Presto 2.0" and citing
  3-4x production gains could not be fetched** (HTTP 403 in this sandbox) and is
  therefore NOT used as a sourced claim anywhere in this topic — only the
  directly-fetched Meta Engineering blog's own wording and numbers are used.
