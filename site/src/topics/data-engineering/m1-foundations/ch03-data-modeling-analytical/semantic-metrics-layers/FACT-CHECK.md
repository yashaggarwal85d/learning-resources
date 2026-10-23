# Fact-check — de.semantic-metrics-layers

This topic has a real hands-on lab (`lab/`, `examples.py`), unlike most of this chapter's other
§3.3-3.4 topics. Every sourced claim traces to a direct, word-for-word quote from MetricFlow's
own documentation or dbt Labs' own announcement (`SOURCES.md`, verified by
`scripts/sources.mjs check`). Every lab claim is independently executed and cross-checked in
`examples.py` and/or the standalone `mf` CLI session recorded in `lab/README.md`.

## Claims

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | MetricFlow is a SQL query generation tool that compiles metrics across different grains | MetricFlow "About MetricFlow", quote 1 | Confirmed |
| 2 | MetricFlow is distributed under the Apache 2.0 license | MetricFlow "About MetricFlow", quote 2; dbt Labs announcement, quote 9 | Confirmed, two independent confirmations |
| 3 | DRY: minimize redundancy by defining a metric once wherever possible | MetricFlow "About MetricFlow", quote 3 | Confirmed, and directly demonstrated in the lab |
| 4 | Entities are the declared join keys / traversal paths between semantic models | MetricFlow "About MetricFlow", quote 4 | Confirmed, and directly demonstrated in the lab |
| 5 | Dimensions are the declared slicing/grouping axes for a metric | MetricFlow "About MetricFlow", quote 5 | Confirmed |
| 6 | A dedicated time spine table is required for time-based metrics/dimensions | MetricFlow "MetricFlow time spine", quotes 6, 7 | Confirmed, and directly hit as a build error in the lab until added |
| 7 | MetricFlow was open-sourced under Apache 2.0 at Coalesce 2025 | dbt Labs announcement, quote 8 | Confirmed |
| 8 | MetricFlow aligned itself with the Open Semantic Interchange (OSI) initiative | dbt Labs announcement, quote 10 | Confirmed |
| 9 | OSI has since been renamed Apache Ossie (incubating), same spec and community, new governance home | Apache Ossie homepage, quotes 11, 12 | Confirmed — version/name drift disclosed |

## Lab claims (executed, not just sourced)

- **One metric, two correct compiled queries.** `mf query --metrics revenue --group-by metric_time__month --explain` and `mf query --metrics revenue --group-by metric_time__day,product__category --explain`, run against the identical `revenue` metric declaration, produce two different SQL queries — the second with an automatic join `mf` added on its own. Both queries' results are cross-checked in `examples.py` against an independently written plain-SQL aggregate (`select sum(amount) from fact_orders`, and the same filtered to January) — both match exactly.
- **The time spine is actually required, not merely documented as a best practice.** `dbt parse` failed with an explicit error ("The semantic layer requires a time spine model... but none was found") until a `metricflow_time_spine` model was added — reproduced directly, not assumed from the docs.
- **A ratio metric recombines without redefinition.** `average_order_value` (declared once as a ratio of `revenue` over `order_count`) was queried by month, then by customer region, with no change to its own declaration — both runs produce a correctly joined, correctly computed query (`lab/README.md`, step 13's own closing scenario).

## Red-team: the three predicts

- **Step 3** (does one metric declaration compile to only one fixed query?): the plausible
  wrong answer is "yes, a metric is tied to whatever grain it was first written for." The
  reveal at steps 4-5 refutes this directly by executing the same declaration at two different
  grains.
- **Step 6** (does declaring an entity matter, or could MetricFlow guess joins from column
  names?): the plausible wrong answer is "it could probably guess, since `product_id` obviously
  matches `product_id`." The reveal at step 7 corrects this with MetricFlow's own definition —
  entities are explicitly declared traversal paths, not inferred from naming conventions; the
  lab's own join only worked because `product` was declared as an entity.
- **Step 9** (does time-based grouping need a dedicated table, or can any date column serve?):
  the plausible wrong answer is "any column with a date in it should work." The reveal at step
  10 corrects this with MetricFlow's own stated requirement, confirmed by the lab's own build
  failure until a dedicated time spine model was added.

## Checks run

- `node scripts/sources.mjs check` — 12/12 quotes verified word for word.
- `python3 examples.py` — pass, cross-checked against an independent aggregate.
- `mf query` (standalone, `lab/README.md`) — both compiled queries and the ratio-metric
  recombination, run and inspected directly.
