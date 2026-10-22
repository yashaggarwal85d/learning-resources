## After this topic you can

- Explain what a block-range index actually stores — a summary per range of physically adjacent pages, not an entry per row — and why that makes it dramatically smaller than a B-tree over the same column.
- State the physical-correlation requirement directly, recognize when a column satisfies it, and explain what happens, measurably, when it doesn't.
- Explain why this kind of index is lossy, and what cost that lossiness adds once a matching range comes back.
- Recognize the same min/max-per-chunk idea in Parquet row-group statistics and Snowflake micro-partition metadata as one principle applied at different layers of a system.

## Into the internals

### The pages_per_range tradeoff

PostgreSQL's own documentation states this directly: the size of a block range is set by the `pages_per_range` storage parameter, and the number of index entries equals the size of the table in pages divided by that value. A smaller `pages_per_range` makes the index itself larger, since there are more ranges to summarize, but it also makes each range's own summary tighter — so more of the table's unmatched blocks can actually be skipped during a scan. This topic's own measurements use the default value throughout; the tradeoff itself is sourced directly from the documentation rather than independently measured at multiple settings.

### Autosummarization, and when a range goes stale

A newly inserted page range does not automatically get a summary the moment it fills — PostgreSQL's own documentation describes `VACUUM` (manual or automatic) as the mechanism that creates the initial summary for any unsummarized range, with an optional `autosummarize` setting that can trigger this sooner, via autovacuum, without waiting for the table's own vacuum schedule. A range whose underlying values have since changed in a way that makes its old summary a poor fit can be explicitly cleared with `brin_desummarize_range`, to be resummarized later. An append-only table whose rows stay in the order they were written needs almost none of this maintenance; a table whose rows get reordered or updated across old ranges needs it actively managed.

## In production

- A block-range summary index earns its size advantage specifically from physical correlation that already exists for free — an append-only timestamp column, an auto-incrementing id, a naturally time-ordered log. It is not a general substitute for a B-tree on a column whose values don't naturally cluster by row position.
- The measured contrast in this topic (essentially no benefit, and a small net cost, on an uncorrelated column) is the practical reason this kind of index is a narrow, situational tool rather than a default choice: checking whether a candidate column is actually correlated with insertion order, before building one, is a real and checkable step.
- The same min/max-per-chunk principle recurring in Parquet statistics and Snowflake micro-partition pruning means the underlying intuition — "read the summary before touching the data" — transfers directly across a single-engine index, a file format, and a cloud warehouse's own storage layer.

## Next

This chapter's own next topic after zone maps and BRIN indexes is confirmed via `node scripts/next-topic.mjs de` once this topic is live.
