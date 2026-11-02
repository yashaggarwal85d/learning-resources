<section data-section="outcomes">

## Outcomes

Predict and confirm the planner's own default strategy for two large, unhinted equi-joined
tables, and that a hint can switch strategies completely — removing every sort step, not just the
one on the hinted side — at the cost of a real, named memory risk sort-merge doesn't share.

</section>

<section data-section="internals">

## The planner's own hint-priority order and preferSortMergeJoin, the sourced-only half

Spark's own planner comment documents a fixed priority when more than one hint is present:
broadcast over sort-merge over shuffle-hash over shuffle-replicate-NL. When both sides carry a
hint for the same strategy, the planner breaks the tie by picking the smaller side as the build
side, based on table statistics. Separately, `spark.sql.join.preferSortMergeJoin` (default `true`)
is the config that keeps the planner reaching for sort-merge even when a side is small enough to
hash — flipping it to `false` lets shuffled hash get picked automatically, without any hint at
all. This topic's own `examples.py` applies exactly one hint to one side and leaves
`preferSortMergeJoin` at its default throughout; the priority order and the config-based route are
named and quoted, not independently exercised.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a `SHUFFLE_HASH` hint degrades the same way a plain sort-merge join would under memory
pressure.** It doesn't. A sort can always spill to disk and keep running, slower but correct; a
hash table being built has no equivalent fallback once it's too large to fit, which is exactly why
the planner's own source names it as an OOM risk specifically.

**Hinting `SHUFFLE_HASH` on a side whose size can grow unpredictably in production**, such as a
table that's small in a test dataset but large in practice. The hint removes the sort step
entirely, but doesn't remove the underlying risk the sort step's absence trades away.

</section>

<section data-section="frontier">

## Frontier

AQE's own runtime mechanism, this chapter's own next topic, can convert a statically-planned
sort-merge join into a shuffled hash join (or a broadcast join) once real post-shuffle statistics
show one side is small — overriding the exact static choice this topic measures, after the fact
rather than before the query runs. Named here, built next.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

These two strategies are what AQE, next, is allowed to rewrite at runtime once real shuffle
statistics exist — the planner's static choice meeting the evidence a static plan can't have.

</section>
