<section data-section="outcomes">

## Outcomes

Say which partitioner a given shuffle uses from its purpose — hash for grouping and joins, range
for a global sort. Recognise, from a plan, when Spark skipped an Exchange it would otherwise have
needed, and confirm it against a case where the same sharing genuinely doesn't apply.

</section>

<section data-section="internals">

## DSv2 partition-stats filtering, the sourced-only half

A DataSource V2 source can implement `SupportsPushDownFilters` to receive filters directly and
report which ones it already satisfied, letting a compatible source prune using its own
statistics rather than a Hive-style directory layout at all. This topic's own `examples.py`
measures static pruning specifically on a Hive-style directory layout; the DSv2 statistics path
is named and quoted here, not independently exercised against a real DSv2-compatible source.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming sort and group-by shuffle the same way just because both are "wide operations."**
This topic's own measurement shows them tagged with two entirely different partitioners. Tuning
one as if it behaved like the other — for instance, expecting a sort to respect a hash-based
`spark.sql.shuffle.partitions` the same way a group-by does — misreads the actual mechanism.

**Repeating an explicit `repartition` call "just to be safe" before every wide step.** If the
data is already partitioned the way the next step needs, that call pays for a real shuffle for
nothing — the planner would have skipped adding a redundant one on its own.

</section>

<section data-section="frontier">

## Frontier

A third partition-pruning mechanism, dynamic partition pruning, prunes at execution time using a
runtime filter result from the other side of a join — covering exactly the case this topic's own
static pruning can't reach, a filter whose value isn't known until the query actually runs. Named
here, built as this chapter's own later topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Pruning skips reading partitions that can't match. Bucketing, next, goes further: pre-arranging
the partitions at write time so a later join skips the shuffle entirely, not just the read.

</section>
