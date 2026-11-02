<section data-section="outcomes">

## Outcomes

Read an `EXPLAIN FORMATTED` plan tree and name which of Catalyst's four stages — parse, analysis,
logical optimisation, physical planning — produced each node, using concrete textual signals (an
unresolved tick, a resolved attribute id, a reordered operator, a chosen join strategy) rather than
guessing. Find the `Exchange` nodes in a physical plan and say precisely which operator forced each
one, including the case where a join forces none at all.

</section>

<section data-section="internals">

## Reading EXPLAIN FORMATTED

`EXPLAIN FORMATTED` prints two sections for a query: a physical plan outline, numbering each node,
and a separate per-node detail block listing that node's own inputs and arguments. This topic's own
measurements use the Scala API's `queryExecution` object directly (`.analyzed`, `.optimizedPlan`,
`.executedPlan`) to get the same four stages' plan text programmatically; reading `EXPLAIN FORMATTED`
by eye in a shell or notebook is the same information, laid out for a person rather than a script.

## Cost-based reordering, from real table statistics

Strategy selection for one join (broadcast vs. shuffle) happens by default, using size estimates
Catalyst already has. Reordering which table joins first in a multi-way join is a stricter case:
it requires `spark.sql.cbo.enabled` and real statistics collected by running `ANALYZE TABLE` on
every table involved, stored in the catalog specifically so the optimizer can find a better plan
than the join order as written. Not measured here, since reliably demonstrating a reordering needs
a genuine multi-way join and stable row-count estimates this topic's small, synthetic data doesn't
produce consistently.

</section>

<section data-section="production">

## Production failures this topic warns about

**Reading query cost from the code's own written order.** This topic's own measurement shows the
optimizer freely reordering a filter and a select without asking. A team optimising a query by
reordering its own clauses by hand is fighting a battle Catalyst already won — the written order
was never the plan.

**Assuming a join always shuffles because it's a wide dependency.** Chapters 2 and 3 of this topic
established shuffles as the norm for wide operations. This topic's own broadcast measurement is the
counter-case: below a size threshold, the planner skips the shuffle entirely, and a team tuning for
"every join shuffles" will misdiagnose a job that's actually broadcasting correctly.

</section>

<section data-section="frontier">

## Frontier

AQE, disabled throughout this topic's own `examples.py` to keep Catalyst's own up-front decisions
legible, can override a chosen strategy at runtime — specifically converting an already-planned
SortMergeJoin into a broadcast join if actual shuffle statistics come in smaller than Catalyst's
own up-front estimate predicted. The mirror case to this topic's forced-SortMergeJoin demonstration,
named here and built in this chapter's own later AQE topic.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Catalyst decides the physical plan's shape: which join strategy, which operators, in which order.
Tungsten, next, decides how fast the chosen shape actually runs once it's settled — a different
layer entirely, planning versus execution.

</section>
