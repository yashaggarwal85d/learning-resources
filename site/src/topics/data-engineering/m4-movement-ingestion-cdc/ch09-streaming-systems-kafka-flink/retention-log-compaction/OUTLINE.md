# Outline: Retention and log compaction (`de.retention-log-compaction`)

## Claims list (all sourced in SOURCES.md)

1. The default "delete" policy discards whole old segments once their retention time or size
   limit is reached — never a single record out of a segment.
2. The "compact" policy retains the latest value for each key instead.
3. Log compaction guarantees at least the last known value for each key is retained.
4. The log cleaner only fires a cleaning pass once the dirty (uncompacted) fraction of the log
   crosses `min.cleanable.dirty.ratio` (default 50%).
5. `min.compaction.lag.ms` holds a fresh record ineligible for compaction for a minimum time.
6. `max.compaction.lag.ms` forces a record eligible for compaction after a maximum delay,
   regardless of the dirty ratio.
7. A tombstone (delete marker) is retained for `delete.retention.ms` (default 24 hours) before
   being collected.
8. A consumer reading from the start of the log sees every delete marker only if it reaches the
   head within `delete.retention.ms` of a tombstone being written — a consumer lagging longer can
   miss it.
9. Log compaction is handled by a background log cleaner that recopies segment files, keeping the
   log's relative record order intact.

## Storyboard (10 steps)

1. **Hook**: a team expects a compacted topic to shrink the instant a new value lands; a full day
   later the old value is still readable — not a bug.
2. **Setup**: the partition strip from topic 1, now with two different rules for what gets kept:
   delete by age, or keep only the latest per key.
3. **Predict**: does retention ever delete a single old record out of a segment, or always the
   whole segment at once?
4. **Reveal**: a real toy run — a segment whose newest record is still fresh survives entirely;
   one whose newest record has aged out is deleted whole.
5. **Predict**: does the log cleaner compact continuously, or wait for something?
6. **Reveal**: the dirty-ratio gauge — a real toy run shows cleaning staying off below the
   threshold and firing once it's crossed.
7. **Reveal**: the compaction-lag window — a fresh record stays protected, an old one gets forced
   eligible regardless of the dirty ratio, and the middle case depends on the ratio.
8. **Reveal**: a tombstone survives for a fixed window — a consumer that catches up in time sees
   the delete; one that lags past it can miss it entirely.
9. **Prove it**: every number from this reel read straight off a real run of `examples.py`.
10. **Recap**: segment-granularity deletion, a dirty-ratio gate, a lag window with a floor and a
    ceiling, and a tombstone's own expiration — a compacted topic as a changelog, precisely.

## Concept ledger

Introduces: `retention-vs-compaction`, `tombstone-retention`.
Uses: `partition-segment-index` (topic 1), `consumer-group-offsets` (topic 5).
