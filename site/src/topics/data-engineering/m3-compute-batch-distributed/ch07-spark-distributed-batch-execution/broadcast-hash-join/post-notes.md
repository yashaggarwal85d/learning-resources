<section data-section="outcomes">

## Outcomes

Predict and confirm whether a join between a small and a large table broadcasts, from the small
side's size against the threshold, and that crossing it falls back completely rather than
partially. Predict and confirm that a non-equi condition still broadcasts, but trades a hash
lookup for a full pairwise comparison.

</section>

<section data-section="internals">

## Why a stale broadcast risks the driver, the sourced-only half

`BroadcastExchangeExec`'s own scaladoc names the mechanism directly: collect the small side's
rows to the driver, transform them into a lookup structure, then broadcast that structure to every
executor. Each step assumes the small side really is small. If the table's own statistics are
stale — the table grew since they were last computed, or a filter looked more selective than it
actually was — Spark can still choose to broadcast a side that no longer fits comfortably in the
driver's own memory, risking a driver OOM before the join ever runs. This topic's own
`examples.py` never approaches that risk deliberately; the mechanism is named and quoted, not
reproduced.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a table's stored statistics to still reflect its current size.** A table that grew
well past the broadcast threshold since statistics were last computed can still get broadcast,
because the planner estimates from the stale numbers, not the table's actual current size.

**Assuming a filter "obviously" shrinks the broadcast side enough to be safe.** The planner
estimates the filtered size from statistics, not from actually running the filter first. A filter
that looks highly selective in the code can still leave more rows than the threshold allows,
without the mistake showing up until the broadcast itself is already too large.

</section>

<section data-section="frontier">

## Frontier

The `BROADCAST` join hint overrides the size threshold entirely, forcing a broadcast even when
statistics suggest a table is too large — prioritized over every other join-strategy hint, though
not guaranteed, since not every join type can be run that way. AQE's own runtime mechanism works
in the opposite direction: once real post-shuffle statistics are known, it can convert a
sort-merge join into a broadcast hash join Spark's static planner never would have chosen. Both
named and sourced only here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Broadcasting is the strategy for when one side is small. The next topic is what happens when
neither side is — the two shuffle join strategies, chosen against each other.

</section>
