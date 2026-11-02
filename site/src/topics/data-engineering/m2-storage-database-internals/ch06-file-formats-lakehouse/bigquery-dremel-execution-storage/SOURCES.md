# Sources — de.bigquery-dremel-execution-storage

This topic is entirely sourced-only: this sandbox has no BigQuery/GCP account, and BigQuery's
architecture (Capacitor, Colossus, Borg, Jupiter, the shuffle tier) has no local or embeddable
equivalent. Every architectural and numeric claim below is a word-for-word quote from Google's
own published documentation and the Dremel retrospective paper, disclosed throughout in
FACT-CHECK.md, coverage.json and references.md.

## Dremel: A Decade of Interactive SQL Analysis at Web Scale

URL: https://www.vldb.org/pvldb/vol13/p3461-melnik.pdf
Version: PVLDB Vol. 13, No. 12 (Melnik et al., 2020), fetched 2026-11-02

> A major shift happened in early 2009. Dremel was migrated to
a cluster management system called Borg

> Borg was the first
unified container-management system developed at Google, and a
precursor to the open-source platform Kubernetes

> Google’s file system was migrated from the single-master model in
GFS to the distributed multi-master model in its successor, Colossus

> In 2014, we began migration of the storage to an improved
columnar format, Capacitor. It was built on the foundation
described in the original Dremel paper, and added many new features

> To make filtering as efficient as possible, we embedded it directly
into the Capacitor data access library

> Partition and predicate pruning: Various statistics are maintained about the values in each column. They are used both
to eliminate partitions that are guaranteed to not contain any
matching rows, and to simplify the filter by removing tautologies

## Storage and compute separation in BigQuery (Google Cloud blog)

URL: https://cloud.google.com/blog/products/bigquery/separation-of-storage-and-compute-in-bigquery
Version: fetched 2026-11-02

> Compute is Dremel, a large multi-tenant cluster that executes Standard SQL queries.

> Storage is Colossus, Google's global storage system.

> Compute and storage talk to each other through the petabit Jupiter network.

> BigQuery is orchestrated via Borg, Google's precursor to Kubernetes.

> Dremel, BigQuery's execution engine, is a multi-tenant cluster powered by millions of cores

## Use the Storage Write API (REST)

URL: https://docs.cloud.google.com/bigquery/docs/write-api
Version: fetched 2026-11-02

> Exactly-once write semantics through the use of stream offsets.

## Streaming data into BigQuery

URL: https://docs.cloud.google.com/bigquery/docs/streaming-data-into-bigquery
Version: fetched 2026-11-02

> The BigQuery Storage Write API (REST),
previously known as the legacy tabledata.insertAll method, lets you stream
rows into BigQuery tables without running a load job.

## Introduction to partitioned tables

URL: https://docs.cloud.google.com/bigquery/docs/partitioned-tables
Version: fetched 2026-11-02

> A partitioned table is divided into segments, called partitions, that make it easier to manage and query your data.

> If a query uses a qualifying filter on the value of the partitioning column, BigQuery can scan the partitions that match the filter and skip the rest. This process is called pruning.

## Introduction to clustered tables

URL: https://docs.cloud.google.com/bigquery/docs/clustered-tables
Version: fetched 2026-11-02

> Clustered tables can help you to reduce query costs by pruning data so it's not processed by the query. This process is called block pruning.

> BigQuery sorts the data in a clustered table based on the values in the clustering columns and organizes them into blocks.

## Introduction to materialized views

URL: https://docs.cloud.google.com/bigquery/docs/materialized-views-intro
Version: fetched 2026-11-02

> BigQuery precomputes materialized views in the background when base tables change.

> BigQuery automatically adds incremental data changes from base tables to materialized views, with no user action required.

> If any part of a query against a base table can be resolved by querying the materialized view, then BigQuery reroutes the query to use the materialized view for improved performance and efficiency.

## Introduction to BI Engine

URL: https://docs.cloud.google.com/bigquery/docs/bi-engine-intro
Version: fetched 2026-11-02

> BigQuery BI Engine is a fast, in-memory analysis service that accelerates many SQL queries in BigQuery by intelligently caching the data that you use most frequently.

## Batch loading data

URL: https://docs.cloud.google.com/bigquery/docs/batch-loading-data
Version: fetched 2026-11-02

> BigQuery batch loading lets you ingest data from Cloud Storage or a local file into a new or existing table in a single load job. You can load Avro, comma-separated values (CSV), newline-delimited JSON, ORC, or Parquet files, as well as Datastore and Firestore exports stored in Cloud Storage.

### Red team

Every claim in this topic is sourced-only: this sandbox has no BigQuery or GCP account, so nothing
here is independently executed or measured, the same disclosure as topic 37 (Snowflake). The
Dremel paper quoted is the 2020 retrospective ("A Decade of Interactive SQL Analysis at Web
Scale"), a separate paper from the original 2010 Dremel VLDB paper topic 6 cites — both describe
the same lineage but at different points in its history; this topic's quotes on Borg, Colossus and
Capacitor come specifically from the 2020 retrospective's own historical narrative. CHAPTER.md's
syllabus line names "legacy insertAll streaming" as a contrast to the Storage Write API; the
Storage Write API's own docs page does not name insertAll, so that specific comparison is sourced
from a second, separate Google Cloud docs page ("Streaming data into BigQuery") that explicitly
states the Storage Write API replaced the legacy `tabledata.insertAll` method. No examples.py
exists, so (as on topic 37) every number in reel.tsx is spelled out as words, nothing backs a digit.
