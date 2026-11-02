Sources fetched and quoted for `de.real-time-olap-ingestion`.

## Storage overview (Apache Druid, latest docs)

URL: https://druid.apache.org/docs/latest/design/storage/

> Each segment is created by a Middle Manager as mutable and uncommitted. Data is queryable as soon as it is added to an uncommitted segment.

> Indexing is the mechanism by which new segments are created, and handoff is the mechanism by which they are published and served by Historical services.

> If the indexing task is a realtime task (like a Kafka task) then the segment is immediately queryable at this point. It's available, but unpublished.

> With these methods, Druid commits stream offsets to its metadata store alongside segment metadata, in the same transaction. Note that ingestion of data that has not yet been published can be rolled back if ingestion tasks fail. In this case, partially-ingested data is discarded, and Druid will resume ingestion from the last committed set of stream offsets. This ensures exactly-once publishing behavior.

## Stream ingestion with Upsert (Apache Pinot, release 1.4.0 docs)

URL: https://docs.pinot.apache.org/release-1.4.0/manage-data/data-import/upsert-and-dedup/upsert

> FULL upsert means that a new record will replace the older record completely if they have same primary key.

> Upsert maintains metadata in memory containing which docIds are valid in a particular segment (ValidDocIndexes).

> Unlike other real-time tables, Upsert table takes up more memory resources as it needs to bookkeep the record locations in memory.

## Kafka table engine (ClickHouse, current docs)

URL: https://clickhouse.com/docs/en/engines/table-engines/integrations/kafka

> Publish or subscribe to data flows.

> Organize fault-tolerant storage.

> Process streams as they become available.

> If you're on ClickHouse Cloud, we recommend using ClickPipes instead. ClickPipes natively supports private network connections, scaling ingestion and cluster resources independently, and comprehensive monitoring for streaming Kafka data into ClickHouse.
