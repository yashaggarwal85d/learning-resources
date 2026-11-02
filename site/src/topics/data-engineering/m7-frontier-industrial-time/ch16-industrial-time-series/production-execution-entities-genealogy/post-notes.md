<section data-section="outcomes">

## Outcomes

A work order, a run (bound to one exact recipe version, never "the recipe" in general) and a
lot, modelled as tables with a consume/produce edge table connecting lots to each other. ISA-88's
own two models, named separately: the physical model (ISA's own standard, confirmed from its own
standard-series page; its six-level nesting confirmed from a secondary source per CHAPTER.md's own
allowance) and the procedural model (four levels, same secondary source). A real, executed
unprotected recursive query over a lot DAG containing a genuine rework loop, capped at a depth of
several hundred rows and filling that entire cap rather than converging early — the executed
proof that it would never terminate unaided. PostgreSQL's own `CYCLE` clause, run for real,
answering the identical forward and backward genealogy questions safely. And the real, measured
cost of one missing consume/produce edge: two specific, named lots silently dropped from a recall,
with no error or warning anywhere in the query's own output.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every measurement directly against this sandbox's own PostgreSQL 16 cluster:
an eight-edge synthetic lot DAG (a merge, a split, and a rework loop) loaded into a real table;
the cycle-protected forward and backward recursive queries (`WITH RECURSIVE ... CYCLE lot SET
is_cycle USING path`) run and their exact lot sets asserted; the same graph with one split edge
removed, and the exact smaller set and the exact two missing lots asserted; an unprotected,
depth-capped version of the identical query, asserted to fill its cap rather than stop short of
it.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a reachability query's silence.** This topic's own "Prove it" scenario is the
production shape of the bug: a recall team re-runs its query, gets a bigger answer the second
time after someone manually patches a missing edge, and treats the first run as merely an
undercount rather than the worse failure it actually was — every lot it silently dropped was
never recalled while the team trusted a complete-looking answer.

**Shipping a recursive query with no cycle protection "because the data shouldn't loop."**
Rework is a real, ordinary production event, not an edge case to design away; a query that
assumes the edge table is acyclic will eventually meet a real rework loop and hang.

</section>

<section data-section="frontier">

## Frontier

The syllabus's own pointer (§17.4, graph as operational backend, skipped in this course) names
the alternative once a recursive CTE's per-step join cost stops being affordable: a dedicated
graph database built for large-scale reachability and pattern queries. Named here as the
pointer the syllabus itself gives, not built, since this course's own lab tooling (PostgreSQL,
DuckDB, pandas) is the engine of record for Chapter 16.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A lot has a parentage. It also has a measurement history: the thickness it was inspected at, the
limits it had to meet. The next topic is that quality data, and the statistical rules that read
it.

</section>
