Last verified against these sources: 31 October 2026. Real measurements run in this sandbox
(`examples.py`, a toy per-partition-segment, commit, and upsert-overlay model, no real
Druid/Pinot/ClickHouse cluster available): a four-partition segment-building model; an atomic
commit compared against a naive non-atomic one under a forced failure; an upsert query answered
from an overlay without rewriting a sealed segment. Druid's, Pinot's, and ClickHouse's own
current capabilities are disclosed, sourced-only claims from each project's own current
documentation.

- Storage overview (Apache Druid, latest docs):
  [druid.apache.org/docs/latest/design/storage/](https://druid.apache.org/docs/latest/design/storage/).
  The per-partition realtime-task segment model and the exactly-once offset/segment commit
  this topic cites.
- Stream ingestion with Upsert (Apache Pinot, release 1.4.0 docs):
  [docs.pinot.apache.org/release-1.4.0/manage-data/data-import/upsert-and-dedup/upsert](https://docs.pinot.apache.org/release-1.4.0/manage-data/data-import/upsert-and-dedup/upsert).
  The full-upsert semantics and in-memory row-validity bookkeeping this topic cites.
- Kafka table engine (ClickHouse, current docs):
  [clickhouse.com/docs/en/engines/table-engines/integrations/kafka](https://clickhouse.com/docs/en/engines/table-engines/integrations/kafka).
  The in-process Kafka engine and the ClickPipes managed-alternative recommendation this topic
  cites.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=real-time-olap-ingestion:%20).
