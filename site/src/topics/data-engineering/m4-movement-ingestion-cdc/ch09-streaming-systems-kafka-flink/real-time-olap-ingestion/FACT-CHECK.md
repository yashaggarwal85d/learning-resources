# Fact-check — Real-time OLAP ingestion

| Claim | Source | Status |
|---|---|---|
| Each segment is created by a consuming task as mutable and uncommitted, and data is queryable as soon as it's added to an uncommitted segment | Apache Druid, latest docs | Confirmed, quoted verbatim |
| Indexing is the mechanism by which new segments are created, and handoff is the mechanism by which they are published and served | Apache Druid, latest docs | Confirmed, quoted verbatim |
| A realtime (Kafka) indexing task's segment is immediately queryable while still unpublished | Apache Druid, latest docs | Confirmed, quoted verbatim |
| Druid commits stream offsets to its metadata store alongside segment metadata in the same transaction, ensuring exactly-once publishing behavior | Apache Druid, latest docs | Confirmed, quoted verbatim |
| Pinot's FULL upsert mode replaces an older record completely when a new record shares its primary key | Apache Pinot, release 1.4.0 docs | Confirmed, quoted verbatim |
| Pinot upsert maintains in-memory metadata (ValidDocIndexes) tracking which docIds are valid within a segment | Apache Pinot, release 1.4.0 docs | Confirmed, quoted verbatim |
| Pinot upsert tables take up more memory than append-only real-time tables because they bookkeep record locations in memory | Apache Pinot, release 1.4.0 docs | Confirmed, quoted verbatim |
| ClickHouse's Kafka table engine publishes/subscribes to data flows, organizes fault-tolerant storage, and processes streams as they become available | ClickHouse, current docs | Confirmed, quoted verbatim |
| ClickHouse recommends ClickPipes instead of the Kafka table engine for ClickHouse Cloud users, citing private network connections, independent scaling, and monitoring | ClickHouse, current docs | Confirmed, quoted verbatim |
| Four Kafka partitions each build their own independent sequence of segments | Modeled and measured directly in `examples.py` (`partition_consumer_segments`) | Confirmed by the toy model's own real run |
| An atomic offset-and-segment commit, forced to fail, leaves state completely unchanged; retrying it afterward succeeds cleanly | Modeled and measured directly in `examples.py` (`atomic_offset_segment_commit`) | Confirmed by the toy model's own real run |
| A naive, non-atomic commit that advances the offset before sealing the segment leaves the offset ahead of the segment count after a crash between the two steps | Modeled and measured directly in `examples.py` (`naive_offset_then_segment_commit`) | Confirmed by the toy model's own real run |
| An upsert query answers with an overlay's newer value while the sealed segment's own row stays physically unchanged | Modeled and measured directly in `examples.py` (`upsert_query`) | Confirmed by the toy model's own real run |

## Red-team

- **Does this topic overstate Druid's and Pinot's similarity by describing both with the same
  "per-partition consumer builds a segment" sentence?** No — the Druid source explicitly
  describes this model (`handoffConditionTimeout`, realtime-task queryability before publish),
  and Pinot's own real-time ingestion architecture (not separately quoted here, since CHAPTER.md
  scopes this topic to echo topic 1's segment vocabulary via Druid's docs, with Pinot's distinct
  contribution being upsert) is consistent with the same per-partition task model documented
  across Apache's own real-time OLAP projects generally.
- **Is the toy atomic-vs-naive commit model a fair representation, or does it trivially assume
  its own conclusion?** It implements exactly the mechanism the Druid docs describe (offset and
  segment committed together, in the same transaction) against a naive alternative that commits
  them separately, and measures only the property claimed: whether the two stay in step after an
  identical forced failure. Disclosed as a deliberately simplified toy model, not a port of
  Druid's actual metadata-store transaction logic.
- **Does citing Pinot's release-1.4.0 docs risk citing an unstable/pre-release page?** 1.4.0 is
  the newest point release found with full page content retrievable at research time; the specific
  claims quoted (FULL upsert semantics, in-memory ValidDocIndexes, memory bookkeeping cost) are
  also present, with consistent wording, across multiple earlier Pinot release docs (0.9 through
  1.3) found during research, so they're a stable, long-standing behavior, not a 1.4.0-only
  feature.
- **Is naming ClickPipes' specific feature list (private network connections, independent
  scaling, monitoring) overstating what's confirmed, since that list came from a secondary
  summary rather than the ClickPipes reference page itself?** The quoted sentence is the Kafka
  table engine's own current docs page recommending ClickPipes and summarizing why — it is
  ClickHouse's own first-party docs, not a third-party summary, even though the deeper ClickPipes
  reference page itself wasn't separately fetched; this is disclosed, and the claim made in the
  reel is the narrower, fully-sourced one (a managed alternative exists and is recommended), not
  an exhaustive ClickPipes feature list.
- **Does the upsert-overlay toy model correctly represent "no rewrite," or could it be read as
  trivial dictionary lookup unrelated to the real mechanism?** The model deliberately keeps the
  sealed segment's row and the overlay as two separate structures and asserts the sealed row is
  provably untouched after the overlay is read — the same separation Pinot's own
  ValidDocIndexes-plus-segment design uses, disclosed as a simplified standalone demonstration.
