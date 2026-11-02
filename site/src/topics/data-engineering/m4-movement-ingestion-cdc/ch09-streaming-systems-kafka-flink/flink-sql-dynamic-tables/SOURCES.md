Sources fetched and quoted for `de.flink-sql-dynamic-tables`.

## Dynamic Tables (Apache Flink, 2.3 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/concepts/sql-table-concepts/dynamic_tables/

> A database table results from a stream of INSERT, UPDATE, and DELETE DML statements, often called changelog stream.

> Processing streams with a relational query require converting it into a Table. Conceptually, each record of the stream is interpreted as an INSERT modification on the resulting table. We are building a table from an INSERT-only changelog stream.

> The first query updates previously emitted results, i.e., the changelog stream that defines the result table contains INSERT and UPDATE changes.

> The second query only appends to the result table, i.e., the result table's changelog stream only consists of INSERT changes.

> Append-only stream: A dynamic table that is only modified by INSERT changes can be converted into a stream by emitting the inserted rows.

> Retract stream: A retract stream is a stream with two types of messages, add messages and retract messages. A dynamic table is converted into a retract stream by encoding an INSERT change as add message, a DELETE change as a retract message, and an UPDATE change as a retract message for the updated (previous) row, and an additional message for the updating (new) row.

> Upsert stream: An upsert stream is a stream with two types of messages, upsert messages and delete messages. A dynamic table that is converted into an upsert stream requires a (possibly composite) unique key. A dynamic table with a unique key is transformed into a stream by encoding INSERT and UPDATE changes as upsert messages and DELETE changes as delete messages. The stream consuming operator needs to be aware of the unique key attribute to apply messages correctly. The main difference to a retract stream is that UPDATE changes are encoded with a single message and hence more efficient.

## Joins (Apache Flink, 2.3 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/reference/queries/joins/

> Regular joins are the most generic type of join in which any new record, or changes to either side of the join, are visible and affect the entirety of the join result.

> However, this operation has important operational implications: it requires to keep both sides of the join input in Flink state forever.

> An interval join requires at least one equi-join predicate and a join condition that bounds the time on both sides.

> For streaming queries, compared to the regular join, interval join only supports append-only tables with time attributes.

> Temporal joins take an arbitrary table (left input/probe site) and correlate each row to the corresponding row's relevant version in the versioned table (right input/build side).

> In contrast to regular joins, the previous temporal table results will not be affected despite the changes on the build side.

> Compared to interval joins, temporal table joins do not define a time window within which the records will be joined.

> A lookup join is typically used to enrich a table with data that is queried from an external system. The join requires one table to have a processing time attribute and the other table to be backed by a lookup source connector.

## Configuration (Apache Flink, 2.3 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/dev/table/config/

> Strategy for optimizing the delta-join. Only AUTO, FORCE or NONE can be set. Default it AUTO.

> "AUTO": Optimizer will try to use delta join first. If it fails, it will fallback to the regular join.

## Apache Flink 2.2.0 release announcement

URL: https://flink.apache.org/2025/12/04/apache-flink-2.2.0-advancing-real-time-data--ai-and-empowering-stream-processing-for-the-ai-era/

> Apache Flink has supported leveraging LLM capabilities through the ML_PREDICT function in Flink SQL since version 2.1, enabling users to perform semantic analysis in a simple and efficient way.

> In 2.1, Apache Flink has introduced a new delta join operator to mitigate the challenges caused by big state in regular joins. It replaces the large state maintained by regular joins with a bidirectional lookup-based join that directly reuses data from the source tables.

## Materialized Table Overview (Apache Flink, 2.3 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/materialized-table/overview/

> Materialized Table is a new table type introduced in Flink SQL, aimed at simplifying both batch and stream data pipelines, providing a consistent development experience. By specifying data freshness and query when creating Materialized Table, the engine automatically derives the schema for the materialized table and creates corresponding data refresh pipeline to achieve the specified freshness.

> Data freshness defines the maximum amount of time that the materialized table's content should lag behind updates to the base tables. Freshness is not a guarantee. Instead, it is a target that Flink attempts to meet.

> CONTINUOUS mode: Launches a Flink streaming job that continuously refreshes the materialized table data.

> FULL mode: The workflow scheduler periodically triggers a Flink batch job to refresh the materialized table data.

## Process Table Functions (Apache Flink, 2.3 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/dev/table/functions/ptfs/

> Process Table Functions (PTFs) are the most powerful function kind for Flink SQL and Table API. They enable implementing user-defined operators that can be as feature-rich as built-in operations. PTFs can take (partitioned) tables to produce a new table. They have access to Flink's managed state, event-time and timer services, and underlying table changelogs.

## Changelog Conversion (Apache Flink, 2.3 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/reference/queries/changelog/

> The FROM_CHANGELOG PTF converts an append-only table with an explicit operation code column into a (potentially updating) dynamic table. Each input row is expected to have a string column that indicates the change operation. The operation column is interpreted by the engine and removed from the output.

> The TO_CHANGELOG PTF converts a dynamic table (i.e. an updating table) into an append-only table with an explicit operation code column. Each input row - regardless of its original change operation (INSERT, UPDATE_BEFORE, UPDATE_AFTER, DELETE) - is emitted as an INSERT-only row with a string column indicating the original operation.

## Model Inference (Apache Flink, 2.3 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/sql/reference/queries/model-inference/

> Flink SQL provides the ML_PREDICT table-valued function (TVF) to perform model inference in SQL queries. This function allows you to apply machine learning models to your data streams directly in SQL.

> The ML_PREDICT function takes a table input, applies a model to it, and returns a new table with the model's predictions. The function offers support for synchronous/asynchronous inference modes when the underlying model permits both.

> ML_PREDICT only supports append-only tables. CDC (Change Data Capture) tables are not supported because ML_PREDICT results are non-deterministic.

Notes on this topic's research: all seven documents fetched clean (the dynamic-tables, joins,
table-config, materialized-table-overview, PTFs, changelog-conversion, and model-inference pages
were all found at the 2.3 release docs path after one redirect each; the Flink 2.2.0 release
announcement blog, already stable public content, supplied the version-introduction currency
facts for ML_PREDICT and delta join since the docs pages themselves don't state a version number).
CHAPTER.md's "delta joins and multi-way joins that cut state" clause is sourced here via the
`table.optimizer.delta-join.strategy` configuration reference (the Joins docs page itself doesn't
cover delta joins) plus the 2.2.0 release announcement's own description of the mechanism;
"multi-way joins" is covered by the Joins page's own mention of the MultiJoin operator for
multiple chained regular joins, a related but distinct state-reduction mechanism, disclosed as
such rather than conflated with delta joins.
