# Before you watch

- **Action vs. transformation.** A transformation describes work lazily; an action actually
  runs it. Where you meet it: every "run" in this topic is an action, and transformations
  without one are never executed at all.
- **Lineage.** The chain of transformations a DataFrame would need to replay to rebuild
  itself from its original source. Where you meet it: what `cache` keeps intact underneath
  the cached data, and what a reliable checkpoint replaces entirely.
- **Storage level.** The specific choice of where cached data lives and how (memory, disk,
  serialized, replicated). Where you meet it: the single setting this topic's own measured
  contrast (recompute vs. read-back) comes down to.
- **Eviction.** Dropping cached data to make room for something else under memory pressure.
  Where you meet it: the event this topic's own second claim measures the consequence of.
- **Non-deterministic UDF.** A user function whose return value isn't fixed by its input alone
  — it can differ between calls on the identical row. Where you meet it: the computation this
  topic's own third claim freezes by caching it.
