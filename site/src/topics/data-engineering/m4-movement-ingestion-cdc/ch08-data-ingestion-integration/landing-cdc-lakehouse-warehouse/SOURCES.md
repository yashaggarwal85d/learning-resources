# Sources — de.landing-cdc-lakehouse-warehouse

## BigQuery docs: Change data capture

URL: https://docs.cloud.google.com/bigquery/docs/change-data-capture
Fetched: 2026-11-01.

Quotes:
> The pseudocolumn _CHANGE_TYPE only accepts the values UPSERT and DELETE.

Items: the `_CHANGE_TYPE` pseudocolumn's two accepted values, named directly in the reveal step
on warehouse-native CDC ingestion.

## BigQuery docs: Change data capture (primary keys)

URL: https://docs.cloud.google.com/bigquery/docs/change-data-capture
Fetched: 2026-11-01.

Quotes:
> You must declare primary keys for the destination table in BigQuery.

Items: the primary-key requirement, named directly in the same reveal step.

## BigQuery docs: Change data capture (composite keys)

URL: https://docs.cloud.google.com/bigquery/docs/change-data-capture
Fetched: 2026-11-01.

Quotes:
> Composite primary keys containing up to 16 columns are supported.

Items: the composite-key allowance CHAPTER.md names, named directly in the same reveal step.

## BigQuery docs: Change data capture (max_staleness)

URL: https://docs.cloud.google.com/bigquery/docs/change-data-capture
Fetched: 2026-11-01.

Quotes:
> Applying these row modifications at query run time increases query latency and cost.

Items: why `max_staleness` exists at all — read-time merging has a cost — named directly in the
same reveal step.

## Snowflake docs: Snowpipe Streaming, Named Channels and exactly-once delivery

URL: https://docs.snowflake.com/en/user-guide/snowpipe-streaming/snowpipe-streaming-channels
Fetched: 2026-11-01.

Quotes:
> Named Channels provide ordered, exactly-once ingestion for applications that coordinate Snowflake commits with source offsets.

Items: the Named Channels claim CHAPTER.md quotes, named directly in the reveal step on
warehouse-native CDC ingestion.

## Snowflake docs: Snowpipe Streaming, choosing Named Channels for CDC

URL: https://docs.snowflake.com/en/user-guide/snowpipe-streaming/snowpipe-streaming-channels
Fetched: 2026-11-01.

Quotes:
> Use them for partitioned sources such as Kafka or Change Data Capture (CDC), where each source partition maps to a channel.

Items: why Named Channels suit Kafka partitions and CDC specifically, named directly in the
same reveal step.

## Snowflake docs: Snowpipe Streaming overview (latency figure)

URL: https://docs.snowflake.com/en/user-guide/snowpipe-streaming/data-load-snowpipe-streaming-overview
Fetched: 2026-11-01.

Quotes:
> ingest-to-queryable latency as low as 5 seconds

Items: Snowflake's own vendor figure for ingest-to-queryable latency, named directly in the
same reveal step and disclosed in the reel's own language as a vendor figure rather than a
measured one.

## Flink CDC docs: Iceberg pipeline connector

URL: https://nightlies.apache.org/flink/flink-cdc-docs-release-3.7/docs/connectors/pipeline-connectors/iceberg/
Fetched: 2026-11-01 (already fetched for topic 21; re-used here for this clause).

Items: named only — Flink CDC's own Iceberg sink as one of the two streaming-upsert examples
CHAPTER.md names alongside Paimon for merge-on-read landing, confirmed live in topic 21's own
SOURCES.md.

## Debezium docs: JDBC sink connector

URL: https://debezium.io/documentation/reference/stable/connectors/jdbc.html
Fetched: 2026-11-01 (already fetched for topic 19; re-used here for this clause).

Items: named only — the JDBC sink's own upsert-mode idempotency, the mechanism this topic's own
append-then-MERGE landing generalizes from a single relational target to a lakehouse
current-state table.

## Airbyte docs: Incremental | Append + Deduped sync mode

URL: https://docs.airbyte.com/platform/using-airbyte/core-concepts/sync-modes/incremental-append-deduped
Fetched: 2026-11-01.

Quotes:
> this sync mode will combine the two rows in the destination and use the most recent data

Items: named only — a third, vendor-managed way to the same current-state table CHAPTER.md's
own "topic-to-table materialisation" clause points to (Chapter 9 topic 26's own subject), shown
here only as a contrast: it deduplicates to the latest row without exposing the LSN-tiebreak
mechanism this topic's own lab measures directly.

Note: this topic's own disclosed scope decision — no lakehouse table-format library (Iceberg
or Paimon) is available in this sandbox (no JVM, no `pyiceberg`), so `examples.py` runs its
lab on a real DuckDB database instead, per CHAPTER.md's own disclosed fallback ("on Chapter 6's
table-format library if live, else on DuckDB, disclosed") — is recorded in `REVIEW.md`, not
here, since it names no additional fetched source.
