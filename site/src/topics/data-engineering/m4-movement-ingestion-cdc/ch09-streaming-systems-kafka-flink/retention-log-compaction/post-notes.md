<section data-section="outcomes">

## Outcomes

A toy segment-retention check confirms a segment whose newest record is still inside the
retention window survives entirely, while a segment whose newest record has aged past it is
deleted whole — never a single record removed from the middle of a segment. A toy dirty-ratio
check shows the cleaner staying off below a configured threshold and firing once the threshold is
crossed. A toy compaction-lag model confirms a fresh record stays ineligible regardless of the
dirty ratio, an old enough record is forced eligible regardless of the dirty ratio, and only the
window in between actually depends on it. A toy tombstone-visibility check shows a consumer that
catches up in time seeing a delete marker, while one that lags past the retention window can miss
it.

</section>

<section data-section="lab">

## Lab

This topic has no lab leg of its own; the compacted-topic-as-changelog idea it establishes feeds
directly into a later topic's state-store explanation. `examples.py` builds four small,
independent simulations — segment-age retention, the dirty-ratio trigger, the compaction-lag
window, and tombstone visibility under consumer lag — and asserts every number this topic's reel
shows.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming retention trims a log record by record.** Deletion operates at segment granularity —
a segment survives in full until its newest record ages out, which means a single old record can
sit on disk far longer than `retention.ms` suggests if it shares a segment with newer ones.

**Reading from offset zero on a compacted topic slower than `delete.retention.ms`.** A consumer
that takes longer than the tombstone retention window to reach the head of the log can silently
miss delete markers for keys it should have seen removed — the key simply never shows up as
deleted, rather than erroring.

**Tuning `min.compaction.lag.ms` without checking the dirty-ratio interaction.** A high minimum
lag protects fresh records, but the dirty ratio still gates when a cleaning pass actually fires —
raising the minimum lag alone doesn't guarantee faster compaction once records do become
eligible.

</section>

<section data-section="frontier">

## Frontier

The log cleaner's own internal summary of the log head is a compact, fixed-size-per-key hash
table — named in the design documentation as the mechanism that keeps one cleaner iteration able
to process hundreds of gigabytes of log head per pass, not measured or tuned in this topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Compaction rewrites a log by key, out of record order. What "in order" actually guarantees in
Kafka — and what it never promised — is the next topic.

</section>
