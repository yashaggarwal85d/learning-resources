# Fact-check: Retention and log compaction (`de.retention-log-compaction`)

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | The default "delete" policy discards whole old segments by retention time or size, not single records. | Confirmed | Topic config reference: "The 'delete' policy (which is the default) will discard old segments when their retention time or size limit has been reached." |
| 2 | The "compact" policy retains the latest value per key. | Confirmed | Topic config reference: "The 'compact' policy will enable log compaction, which retains the latest value for each key." |
| 3 | Compaction guarantees at least the last known value per key. | Confirmed | Design docs: "Log compaction ensures that Kafka will always retain at least the last known value for each message key within the log of data for a single topic partition." |
| 4 | The cleaner fires only once the dirty ratio crosses its threshold (default 50%). | Confirmed | Topic config reference: "By default we will avoid cleaning a log where more than 50% of the log has been compacted." |
| 5 | `min.compaction.lag.ms` holds a fresh record ineligible for a minimum time. | Confirmed | Topic config reference ("min.compaction.lag.ms" entry, via `log.cleaner.min.compaction.lag.ms`): "This can be used to prevent messages newer than a minimum message age from being subject to compaction." |
| 6 | `max.compaction.lag.ms` forces eligibility after a maximum delay. | Confirmed | Topic config reference: "The maximum time a message will remain ineligible for compaction in the log." |
| 7 | A tombstone is retained for `delete.retention.ms` (default 24h). | Confirmed | Topic config reference: "The amount of time to retain delete tombstone markers for log compacted topics." / Design docs: "...the topic's delete.retention.ms setting (the default is 24 hours)." |
| 8 | A consumer sees every delete marker only if it reaches the head within `delete.retention.ms`. | Confirmed | Design docs: "it is possible for a consumer to miss delete markers if it lags by more than delete.retention.ms." |
| 9 | The log cleaner recopies segments, keeping relative order intact. | Confirmed | Design docs: "Log compaction is handled by the log cleaner, a pool of background threads that recopy log segment files, removing records whose key appears in the head of the log." / "Ordering of messages is always maintained. Compaction will never re-order messages, just remove some." |

## Currency check

- Both sources are the same version-pinned Kafka 4.4 documentation pages (topic config
  reference, design doc) already used and confirmed clean for topics 1-3 — compaction and
  segment-based retention are stable, long-shipped mechanics, not a moving target.

## Red team: predict step 3 ("does retention delete a single record, or the whole segment?")

- Tempting wrong answer: "a single record, once it individually ages past retention.ms" — this
  sounds like the natural per-record interpretation of "retention time," but the topic config
  reference is explicit that deletion operates on whole segments, which is a direct, sharp
  consequence of topic 1's segment-file layout (an open segment can't be partially truncated from
  the middle without rewriting it).

## Red team: predict step 5 ("does compaction run continuously, or wait for something?")

- Tempting wrong answer: "continuously, as soon as any record is superseded" — wrong because the
  dirty-ratio threshold exists specifically to bound how often the cleaner re-copies a log;
  without it, a log with a trickle of updates would be rewritten constantly for little benefit.

## Red team: the toy measurements themselves

- **`segment_deletion`**: a direct age-threshold comparison against each segment's newest
  record — matches the sourced rule that a segment survives in full until its newest record
  (not its oldest) ages past `retention.ms`. Re-derived by hand: with `retention_ms=600` and
  `now_ms=1000`, seg-1's newest record is 1000ms old (deleted), seg-2's is 500ms old (kept),
  seg-3's is 50ms old (kept) — matches `examples.py`'s asserted `deleted`/`kept` lists.
- **`dirty_ratio_trigger`**: a direct ratio-versus-threshold comparison, not a simulation of real
  cleaner-thread scheduling or disk I/O — isolates the one claim this topic needs (the ratio
  gates cleaning, nothing else).
- **`compaction_lag_window`**: direct threshold logic reimplementing the sourced three-way rule
  (too fresh → never eligible; past the max lag → forced eligible regardless of dirty ratio;
  in between → the dirty ratio decides) — not a model of real wall-clock cleaner timing.
- **`tombstone_visible_to_lagging_consumer`**: a direct comparison of consumer lag against
  `delete.retention.ms`, modeling the sourced visibility guarantee directly, not real consumer
  fetch-loop timing.

## Corrections applied to OUTLINE.md

None needed — every claim is directly confirmed by Kafka's own current documentation, with no
unconfirmed version numbers in this topic's scope line.
