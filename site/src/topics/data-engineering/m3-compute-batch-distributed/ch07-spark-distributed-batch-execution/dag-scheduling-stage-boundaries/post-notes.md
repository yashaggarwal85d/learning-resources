<section data-section="outcomes">

## Outcomes

Classify any transformation as narrow (each output partition depends on at most one input
partition — `map`, `filter`, `select`) or wide (an output partition may depend on many or all
input partitions — `groupBy`, `join` against non-co-partitioned data, `repartition`). Predict a
job's stage count from its code alone: one, plus one more for every wide dependency it actually
contains, regardless of how many narrow operations are chained around them. State precisely why
the cut happens where it does: a wide dependency cannot produce any output until every input
partition's rows have been redistributed by key, and that redistribution — the shuffle — is the
boundary itself, not a separate consequence of it.

</section>

<section data-section="internals">

## The DAGScheduler's real algorithm

Spark's DAGScheduler walks a job's lineage graph backward from the final RDD, exactly as the
original RDD paper describes: it finds every shuffle (wide) dependency in that lineage and cuts a
stage boundary there, then greedily extends each stage backward through every narrow dependency
it can reach without crossing another shuffle. This is a lineage-graph algorithm, not a simple
count of operators — a stage's actual boundary is decided by the dependency *type* between two
RDDs, never by how many transformations sit between them. Exchange elimination (Chapter 7's own
later topic, §7.2) is the one case where a wide dependency's shuffle gets skipped anyway, because
the data already happens to sit in the partitioning a later operator needs.

</section>

<section data-section="production">

## Production failures this topic warns about

**Assuming a long transformation chain is automatically expensive.** This topic's own measurement
shows a three-operation narrow chain costing exactly as much, in stage terms, as a single `select`
alone: one stage, no shuffle. A team chasing a slow job by shortening an unrelated narrow chain is
optimising the wrong thing — the question is never "how many lines of code," only "how many wide
dependencies."

**Chaining shuffles without noticing each one is a separate cost.** Two independent `groupBy`
calls back to back cost two full shuffles, not one amortised shuffle "since it's the same kind of
operation." This topic's own three-stage measurement is the smallest possible demonstration of a
mistake that gets expensive fast once the data is large and the chained shuffles are many.

</section>

<section data-section="frontier">

## Frontier

Exchange elimination — skipping a shuffle Spark's planner can prove is already unnecessary
because the data's current partitioning already satisfies what a later wide operation needs — is
named here as a boundary this refresher-adjacent topic does not build, and is this chapter's own
later topic (§7.2, partitioning and joins) to measure directly.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A stage boundary is cut at a shuffle; this topic opened what that boundary is, never what the
shuffle itself actually writes and reads to make the next stage's input exist. The next topic is
exactly that: sort-based shuffle mechanics, the real files on disk and the real network transfer
behind the word "Exchange."

</section>
