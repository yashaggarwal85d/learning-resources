# Fact-check — de.bigquery-dremel-execution-storage

| # | Claim | Checked against |
|---|---|---|
| 1 | Dremel was migrated to Borg, a cluster management system, in early 2009 | Yes, quoted verbatim, Dremel decade retrospective (PVLDB 2020) |
| 2 | Borg was the first unified container-management system developed at Google, a precursor to Kubernetes | Yes, quoted verbatim, same source |
| 3 | Google's file system was migrated from GFS's single-master model to the distributed multi-master model in Colossus | Yes, quoted verbatim, same source |
| 4 | In 2014, Google began migrating storage to an improved columnar format, Capacitor, built on the original Dremel paper's foundation | Yes, quoted verbatim, same source |
| 5 | Filtering is embedded directly into the Capacitor data access library | Yes, quoted verbatim, same source |
| 6 | Capacitor's partition and predicate pruning eliminates partitions guaranteed to not contain any matching rows | Yes, quoted verbatim, same source |
| 7 | Compute in BigQuery is Dremel, a large multi-tenant cluster executing Standard SQL queries | Yes, quoted verbatim, Google Cloud blog "Separation of storage and compute in BigQuery" |
| 8 | Storage in BigQuery is Colossus, Google's global storage system | Yes, quoted verbatim, same source |
| 9 | Compute and storage communicate through the petabit Jupiter network | Yes, quoted verbatim, same source |
| 10 | BigQuery is orchestrated via Borg, Google's precursor to Kubernetes | Yes, quoted verbatim, same source |
| 11 | Dremel, BigQuery's execution engine, is a multi-tenant cluster powered by millions of cores | Yes, quoted verbatim, same source |
| 12 | A partitioned table is divided into segments, called partitions, that make it easier to manage and query data | Yes, quoted verbatim, BigQuery docs "Introduction to partitioned tables" |
| 13 | A qualifying filter on the partitioning column lets BigQuery scan matching partitions and skip the rest -- pruning | Yes, quoted verbatim, same source |
| 14 | Clustered tables reduce query cost by pruning data that isn't processed -- block pruning | Yes, quoted verbatim, BigQuery docs "Introduction to clustered tables" |
| 15 | BigQuery sorts a clustered table's data by the clustering columns, organized into blocks | Yes, quoted verbatim, same source |
| 16 | BigQuery precomputes materialized views in the background when base tables change | Yes, quoted verbatim, BigQuery docs "Introduction to materialized views" |
| 17 | BigQuery automatically adds incremental data changes to materialized views, with no user action required | Yes, quoted verbatim, same source |
| 18 | BigQuery reroutes a base-table query to a materialized view when any part of it can be resolved there | Yes, quoted verbatim, same source |
| 19 | BI Engine is a fast, in-memory analysis service that accelerates SQL queries by caching frequently used data | Yes, quoted verbatim, BigQuery docs "Introduction to BI Engine" |
| 20 | Batch loading ingests data from Cloud Storage or a local file into a table in a single load job, across several formats | Yes, quoted verbatim, BigQuery docs "Batch loading data" |
| 21 | The Storage Write API gives exactly-once write semantics through the use of stream offsets | Yes, quoted verbatim, BigQuery docs "Use the Storage Write API (REST)" |
| 22 | The Storage Write API was previously known as the legacy tabledata.insertAll method | Yes, quoted verbatim, BigQuery docs "Streaming data into BigQuery" |

### Red team

This topic is disclosed as sourced-only throughout, the same pattern as topic 37: this sandbox
has no BigQuery or GCP account, so no claim here is independently executed or measured. The
Dremel paper quoted here is the 2020 retrospective ("A Decade of Interactive SQL Analysis at Web
Scale"), a distinct paper from the original 2010 Dremel VLDB paper topic 6 cites -- both describe
the same lineage of systems at different points in its history, and this topic's Borg/Colossus/
Capacitor claims are specifically the retrospective's own historical account, not re-derived from
the 2010 paper. CHAPTER.md's syllabus line names "legacy insertAll streaming" as the contrast to
the modern Storage Write API; the Storage Write API's own docs page never names insertAll, so
that specific comparison is backed instead by a second, separate BigQuery docs page ("Streaming
data into BigQuery") that explicitly states the API replaced the legacy method. `reel.tsx` spells
every number as words, since no `examples.py` exists to back a raw digit on screen.

### Scope boundary

In scope and sourced directly from the Dremel retrospective paper and Google's own current
BigQuery documentation: the Capacitor/Colossus/Borg/Jupiter architecture and its history,
partitioning and clustering as two layers of pruning, materialized views' automatic maintenance,
BI Engine's in-memory caching, and the batch-load-job vs. Storage-Write-API-vs-legacy-insertAll
contrast.

Not independently demonstrated, by design: every claim in this topic, since no BigQuery/GCP
account exists in this sandbox (unlike the §6.4 engine topics, each of which ran a real local
engine). The parallel to topic 37's micro-partition pruning is drawn conceptually in the reveal
and recap, not run side by side against a live comparison.
