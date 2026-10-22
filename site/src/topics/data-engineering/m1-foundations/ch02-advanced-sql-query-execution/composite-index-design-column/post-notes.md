## After this topic you can

- Explain why a composite index's column order changes how much of the index actually gets scanned, and measure that difference directly with `EXPLAIN (ANALYZE, BUFFERS)`.
- Design a composite index so its column order matches a query's own `ORDER BY`, and recognize when a mismatched order forces a full sort instead.
- Name PostgreSQL 18's B-tree skip scan as the case that lets a multicolumn index help even when its leading column has no predicate, and say when that trade pays off.
- State that every index adds a real, measurable cost to writes and disk space, as the reason to use multicolumn indexes sparingly.

## Into the internals

### Skip scan's own "dynamic equality constraint"

PostgreSQL 18's own documentation describes skip scan as generating a constraint internally, one that matches every possible value in a column lacking an explicit equality constraint from the query — effectively turning `WHERE y = 7700` against an index on `(x, y)` into a sequence of `WHERE x = N AND y = 7700` searches, one per value of `x` actually stored in the index. This topic's own measurement shows that mechanism directly: `Index Searches: 12` on a column with 10 distinct values, roughly one search per value plus a couple of boundary searches.

### Why `Index Searches` is itself worth knowing to look for

This field is new enough to matter on its own: it didn't appear in this chapter's pre-18 `EXPLAIN` output at all (topic 27's own PostgreSQL 16 runs never show it). Its presence in a plan is itself evidence that some kind of repeated internal searching happened — skip scan among other possible causes — which makes it a specific thing worth scanning for when reading a plan from PostgreSQL 18 or later, beyond just the row and buffer counts this chapter has used so far.

### Why the mismatched-ORDER-BY measurement fell back to a sequential scan, not just a slower index scan

A B-tree index physically stores its entries in exactly one order (or its exact reverse, via a backward scan). `ORDER BY b, a` against an index built `(a, b)` can't be satisfied by reading that index in any direction — the planner's only options are to read the table some other way and sort explicitly, or (as measured) scan it in parallel and sort. This is a strictly bigger problem than the equality-before-range measurement, where the index order was still usable, just less efficiently; here it's not usable for retrieval-in-order at all.

## In production

- The write/storage cost measured here (about 4.8x slower inserts, plus real disk space) is exactly why PostgreSQL's own documentation says multicolumn indexes should be used sparingly, and why an index with no query to justify it is a pure cost with no offsetting benefit.
- A composite index built for one query's column order can silently stop helping a different query's `ORDER BY` or `WHERE` shape — reading the actual `EXPLAIN` output per query, not assuming an existing index covers a new access pattern, is the real check.
- Skip scan is a genuine PostgreSQL 18 capability worth factoring into existing index designs, but its payoff is conditional on the leading column's own cardinality — worth checking, specifically, rather than assuming it always makes an old "wrong-order" index fine now.

## Next

This chapter's own next section after reading plans and designing composite indexes is confirmed by re-running `node scripts/next-topic.mjs de` once this topic is live.
