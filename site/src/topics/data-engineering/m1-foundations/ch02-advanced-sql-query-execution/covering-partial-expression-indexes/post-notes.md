## After this topic you can

- Build a covering index with INCLUDE columns, explain why it enables an index-only scan, and name the visibility map as the one condition deciding whether that scan actually pays off.
- Recognize `Heap Fetches` in `EXPLAIN` output as the tell that a covering index's own advantage has been lost, and know that `VACUUM` is what restores it.
- Design a partial index over a genuinely small hot subset of a table, and explain why it reduces both its own storage size and its ongoing write-maintenance cost.
- Explain why an expression index only helps a query that writes the identical expression, and recognize when a semantically equivalent but syntactically different expression silently falls back to a full scan.

## Into the internals

### Why the visibility map is so much smaller than the heap

PostgreSQL's own documentation states the reason directly: the visibility map is four orders of magnitude smaller than the heap it describes, which is why checking it is so much cheaper than visiting the heap itself, and why it stays cached in memory in most situations. This topic's own measurement shows the practical shape of that: a covering index with the visibility map intact answers a query in under 30 milliseconds; the identical index, after an UPDATE clears the relevant bits, takes over 300.

### Suffix truncation and INCLUDE columns

PostgreSQL's own documentation on covering indexes notes that INCLUDE columns, as payload rather than key columns, are always removed from upper B-Tree levels by suffix truncation, since they're never used to guide a search through the tree. Before the INCLUDE syntax existed, people built covering indexes by listing payload columns as ordinary key columns instead — which often avoided storing them in upper levels anyway, but not as reliably as an explicit INCLUDE clause does.

### Why index expressions are "relatively expensive to maintain"

PostgreSQL's own documentation states this plainly for expression indexes: the expression has to be recomputed on every row insertion and non-HOT update, even though it's never recomputed during a search (since the computed value is already stored in the index). This topic's own measurement doesn't isolate that specific write cost directly, but it follows the same shape as topic 28's own measured write/storage cost for ordinary indexes — an expression index adds that same kind of per-write overhead, plus the extra computation itself.

## In production

- The planner's own warning against many small partial indexes (one per category value) instead of a single composite index — quoted directly in topic 28's own material — applies here too: a partial index is a specialized tool for a genuinely skewed predicate, not a general substitute for composite index design.
- A sudden regression in a query that used to be fast (via an index-only scan) after a batch UPDATE or bulk load is a real, checkable pattern: look at `Heap Fetches` in `EXPLAIN (ANALYZE)` before assuming the index itself needs to be rebuilt.
- An expression index is a real commitment to one specific way of writing a computation; a refactor that changes how application code expresses the same logic (switching `||` for `concat()`, for instance) can silently stop using an index that still exists, with no error or warning.

## Next

This chapter's own next section after covering, partial, and expression indexes is confirmed by re-running `node scripts/next-topic.mjs de` once this topic is live.
