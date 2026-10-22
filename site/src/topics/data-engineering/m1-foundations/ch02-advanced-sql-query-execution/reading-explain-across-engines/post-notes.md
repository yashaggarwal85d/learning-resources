## After this topic you can

- Read "estimated vs. actual rows" and "loops" on any engine's own plan output, and say what a large gap or a high loop count means for the node under it.
- Explain the one concrete, version-dated change this topic measured (PostgreSQL 18 turning `BUFFERS` on by default with `ANALYZE`) as an instance of a general lesson: a plan's own defaults can change across versions, so read the actual output rather than a memorized format.
- Find spill and memory indicators in Spark's UI and REST API, name Snowflake Query Profile's and BigQuery's execution graph's equivalent fields by name, and say what Trino's `EXPLAIN ANALYZE` reports that plain `EXPLAIN` doesn't.
- Apply a fixed triage order to an unfamiliar plan from any of these five engines.

## Into the internals

### Why PostgreSQL 18 changed the default

PostgreSQL's own documentation states the change plainly, without explaining the motivation in the same breath, but the shape of the change is itself informative: `BUFFERS` detail was judged valuable enough, specifically alongside `ANALYZE`'s own real execution, that the project chose to show it automatically rather than leave it opt-in. `ANALYZE` already means "actually run this query and report real numbers"; once a user has opted into that cost, a second opt-in just to also see I/O detail apparently stopped pulling its weight as a separate decision.

### The exact Spark REST API endpoint used

This topic's own Spark measurements went through `http://localhost:<port>/api/v1/applications/<app_id>/stages`, with `spark.ui.enabled=true` and an explicit `spark.ui.port` set before the session started. The fields read directly from that endpoint's JSON were `shuffleWriteBytes`, `shuffleReadBytes`, `memoryBytesSpilled`, and `diskBytesSpilled` — none of which appear anywhere in `explain()`'s own printed text, cost-mode or not.

### Snowflake's and BigQuery's own access requirements

Both vendors' documentation states real prerequisites for even viewing this information, independent of the query itself: Snowflake's Query Profile and BigQuery's execution graph are both account-level monitoring surfaces, gated by role and project permissions respectively, not something a query's own output carries along with it the way `EXPLAIN` does. That's a real, practical difference from PostgreSQL, Spark, and Trino, where the triage information travels with the command itself.

## In production

- A fixed triage order — biggest estimate-vs-actual gap, then a high loop count multiplying a small per-call cost, then spill or memory pressure, then the single slowest or widest operator — travels across engines even though none of their vocabularies match exactly.
- A version upgrade can change what a familiar command shows by default, not just what it's capable of showing; PostgreSQL 18's `BUFFERS`-with-`ANALYZE` change is one concrete, dated instance of that general risk.
- Spilling and shuffling are easy to conflate from field names alone; this topic's own measured contrast (`shuffleWriteBytes` nonzero and normal, `memoryBytesSpilled`/`diskBytesSpilled` zero in a healthy run and nonzero only under pressure) is the check worth remembering by the actual numbers, not just the names.
- Snowflake's and BigQuery's own documentation names real permission requirements to see this data at all — worth checking for before assuming a slow query's profile is just a click away.

## Next

This chapter has gone from a single operator (topics 16-22) to a whole distributed plan (23-25) to a plan that revises itself as it runs (26) to reading any of these plans across five different engines (this topic). What's left in this chapter's own syllabus is confirmed by re-running `node scripts/next-topic.mjs de` once this topic is live.
