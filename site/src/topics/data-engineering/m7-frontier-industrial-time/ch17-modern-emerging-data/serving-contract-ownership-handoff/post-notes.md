<section data-section="outcomes">

## Outcomes

State exactly what data engineering hands off at this boundary (a conformed mart, a compiled
metric layer, a documented grain, a freshness SLA) and what it does not (BI tooling, dashboard
design, ad hoc analysis); diagnose a double-counted dashboard as an undocumented-grain failure;
explain why metric ownership typically moves to analytics engineers past this point and what
negotiation keeps a metric from being computed two ways; summarize Minerva's architecture and its
single-definition claim from a detailed secondary account of Airbnb's own posts.

</section>

<section data-section="internals">

## Internals

Minerva, per a secondary write-up that directly quotes and summarizes Airbnb's own posts, "took
fact and dimension tables as inputs, performed data denormalization, and served the aggregated
data to downstream applications." At the scale that write-up describes, Minerva "contained more
than 12,000 metrics and 4,000 dimensions, with 200+ data producers across different functions and
teams" — a figure attributed explicitly to that secondary source, since Airbnb's own posts (hosted
on medium.com) could not be fetched directly in this sandbox. The same write-up and an independent
second source agree the platform ran on "Airflow for workflow orchestration," "Apache Hive and
Apache Spark for the compute engine," and "Presto and Apache Druid for serving." The independent
source adds Minerva's own stated design goal: to let users "define metrics once, use them
everywhere."

</section>

<section data-section="lab">

## Lab

This topic hosts no lab of its own, by design: it is a conceptual, organizational topic. This
topic's own `examples.py` still makes the hook's claim concrete rather than purely asserted: a
small SQLite mart where one query at the mart's actual grain and a second query that joins to a
finer-grained table (fanning out) each run correctly on their own terms but disagree (three active
users vs. six), and where making both "dashboards" call a single compiled metric function instead
produces identical results by construction.

</section>

<section data-section="production">

## Production failures this topic warns about

**Shipping a mart without a documented grain.** Every query against it is technically correct
SQL; the dashboard built on top of it is wrong the moment someone joins it to anything that
changes the effective row count, and nobody can tell which dashboard was right.

**Bypassing the compiled metric layer "just this once."** Writing a metric's logic by hand instead
of calling the shared definition is a second, independent computation of the same thing, which is
exactly the failure a single-definition metric layer exists to prevent.

</section>

<section data-section="frontier">

## Frontier

The actual negotiation process — who may change a shared metric's definition, and how a
conflicting request gets resolved — is named here only as a mechanism that has to exist and keep
running; its organizational detail is Chapter 19's stakeholder-engineering material (§19.1, not
yet live in this course), reused here by name rather than re-derived.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A contract names what the mart promises. It says nothing about which actual tool an analyst opens
to use it. The next topic, a refresher, is that tool: the BI layer itself.

</section>
