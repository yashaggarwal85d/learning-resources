<section data-section="outcomes">

## Outcomes

A semantic layer compiles one metric definition to SQL consistently, across whatever different
grain or dimension a question actually asks for — this topic's own lab declared a `revenue`
metric once in MetricFlow and compiled it both to a plain monthly total and to a joined
day-and-category breakdown, both cross-checked against an independent aggregate and both
correct. Entities are the declared join keys that make that compilation possible: the lab's own
automatic join only happened because a relationship was explicitly declared, not inferred from
matching column names. A time spine — a dedicated base table for time-based joins — is required
before any time-based metric can compile at all, confirmed directly by a build failure this lab
hit until one was added. MetricFlow itself was open-sourced under Apache 2.0 at Coalesce 2025,
aligned with the Open Semantic Interchange initiative, which has since been renamed Apache Ossie
(incubating) — an industry-wide standardization effort, not one vendor's convenience feature,
still maturing and renaming itself as it goes.

</section>

<section data-section="lab">

## Lab

Real hands-on lab (`lab/mf_shop/`, `examples.py`): a dbt project over the shop's own star
schema, with three metrics (`revenue`, `order_count`, `average_order_value`) declared once in
MetricFlow's own YAML format, compiled with the `mf` CLI to multiple different, correct SQL
queries, each cross-checked against an independently written plain-SQL aggregate.
`lab/README.md` has the exact steps to reproduce the compilation itself, including the separate
virtualenv MetricFlow needs.

</section>

<section data-section="production">

## Production failures this topic warns about

**A team that redefines "revenue" separately in every BI tool it uses.** Each tool's own
definition drifts slightly over time — a different date-boundary convention here, a different
filter there — and nobody notices until two dashboards disagree on the same number, which is
exactly this topic's own hook.

**A team that tries to join tables by matching column names instead of declaring entities.**
It works until two tables happen to share a column name that isn't actually a join key, or two
semantically identical columns are named differently — declaring the relationship explicitly is
what makes the join predictable rather than coincidental.

</section>

<section data-section="frontier">

## Frontier

Cube, LookML, and warehouse-native semantic layers (Snowflake semantic views, Databricks metric
views) solve the same underlying problem with different concrete mechanics and different
vendor relationships — none of them were built hands-on in this topic, per CHAPTER.md's own
instruction, but they're named because a real team's choice among them matters. The Open
Semantic Interchange initiative (now Apache Ossie) aims to make a metric defined in one of
these tools portable to the others; evaluating how complete that interchange actually is today
is outside this topic's own scope.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A semantic layer defined what a metric means. Next: the tool that actually builds the models a
semantic layer sits on top of, in most real warehouses today — dbt, its models, its tests, and
the lineage graph it builds from them.

</section>
