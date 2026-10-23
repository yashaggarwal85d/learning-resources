# Sources — de.semantic-metrics-layers

MetricFlow's own documentation, fetched and quoted directly, matching CHAPTER.md's attribution
instruction. MetricFlow is also built hands-on in this topic's own lab (`examples.py`,
`lab/`), run locally against a DuckDB target.

## MetricFlow, "About MetricFlow"

URL: https://docs.getdbt.com/docs/build/about-metricflow
Fetched: 2026-10-22.

Quotes:
> MetricFlow is a SQL query generation tool designed to streamline metric creation across different data dimensions for diverse business needs.

> MetricFlow is distributed under the Apache 2.0 license.

> DRY (Don't Repeat Yourself): Minimize redundancy by enabling metric definitions whenever possible.

> Entities: The join keys of your semantic model (think of these as the traversal paths, or edges between semantic models).

> Dimensions: These are the ways you want to group or slice/dice your metrics.

Items: (1) MetricFlow's own stated purpose — compiling one metric definition to SQL across different grains; (2) its own license, confirming the Apache 2.0 claim; (3) the DRY principle, which this topic's own lab demonstrates directly (one `revenue` metric, two compiled queries); (4) entities as the declared join keys MetricFlow uses to traverse between semantic models; (5) dimensions as the declared slicing axes a metric can be grouped by.

## MetricFlow, "MetricFlow time spine"

URL: https://docs.getdbt.com/docs/build/metricflow-time-spine
Fetched: 2026-10-22.

Quotes:
> It's common in analytics engineering to have a date dimension or "time spine" table as a base table for different types of time-based joins and aggregations.

> To use MetricFlow with time-based metrics and dimensions, you must provide a time spine.

Items: (1) the time spine's own stated purpose — a dedicated date table for time-based joins and aggregations, distinct from an ordinary dimension table; (2) MetricFlow's own requirement that a time spine exist before any time-based metric or dimension can compile at all, confirmed directly in this topic's own lab (a `metricflow_time_spine` model had to be added before `dbt parse` succeeded).

## dbt Labs, "Announcing open source MetricFlow: Governed metrics to power trustworthy AI and agents"

URL: https://www.getdbt.com/blog/open-source-metricflow-governed-metrics
Fetched: 2026-10-22.

Quotes:
> Today, at Coalesce 2025, we announced our clear commitment to open, portable semantics for everyone.

> We are open sourcing MetricFlow, the technology that powers the dbt Semantic Layer, by moving it to the Apache 2.0 license.

> We are aligning MetricFlow with the goals of Open Semantic Interchange (OSI) so any vendor can participate and any team can adopt without lock-in.

Items: (1) dbt Labs' own announcement, at Coalesce 2025, confirming CHAPTER.md's "open-sourced... Oct 2025" claim (Coalesce 2025 is dbt Labs' own annual October conference); (2) the Apache 2.0 move, in dbt Labs' own words, confirming the "About MetricFlow" page's license statement independently; (3) MetricFlow's own stated alignment with the Open Semantic Interchange initiative.

## Apache Ossie (Incubating) [formerly Open Semantic Interchange], project homepage

URL: https://ossie.apache.org/
Fetched: 2026-10-22.

Quotes:
> Apache Ossie (incubating) is an industry-wide specification effort to standardize how we exchange semantic metadata across analytics, AI and BI platforms, providing a vendor neutral, single source of truth for semantic data. Ossie was previously known as Open Semantic Interchange (OSI).

> The Open Semantic Interchange project has been accepted into the Apache Incubator under a new name — Apache Ossie (incubating). The spec, the community, and the mission haven't changed, but the name, governance home, and long-term trajectory have.

### Disclosure: OSI's rename

CHAPTER.md's own scope line names "the Open Semantic Interchange (OSI) spec." At the time of
this research (2026-10-22), the project's own homepage states it has since been accepted into
the Apache Incubator and renamed Apache Ossie (incubating) — the same spec, community, and
mission, under a new name and governance home. This topic quotes and teaches against the
project's current name and home, disclosing the rename rather than silently teaching a name the
project itself has since moved past (the same kind of version/name drift disclosed for the Open
Data Contract Standard in the previous topic).

### Disclosure

This topic has a real hands-on lab (`lab/`, `examples.py`): three metrics (`revenue`,
`order_count`, `average_order_value`) defined once in MetricFlow's own YAML format over the
shop's star schema (`fact_orders`, `dim_customer`, `dim_product`, plus a required
`metricflow_time_spine` model), compiled by the actual `mf query --explain` command to two
different SQL queries at two different grains (by month; by day and product category, the
second requiring a join `mf` added on its own), and cross-checked against an independently
computed plain-SQL aggregate to confirm the compiled query's own numbers are correct. The
Cube, LookML, warehouse-native Snowflake semantic views, and Databricks metric views named in
CHAPTER.md's scope line are named only, not built hands-on, per CHAPTER.md's own instruction.
The Open Semantic Interchange (OSI) spec is sourced separately below, or flagged if it could not
be fetched directly.
