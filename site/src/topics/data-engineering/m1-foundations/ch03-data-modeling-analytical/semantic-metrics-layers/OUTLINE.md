# Outline — de.semantic-metrics-layers

13-step plan. Real hands-on lab (MetricFlow). First predict within the first four steps.

1. **Hook.** Finance's dashboard says one revenue number. Marketing's dashboard, built in a
   different BI tool, says a different number for the same month. Same underlying data. Why
   do they disagree?
2. **Reveal: what a semantic layer actually does, quoted directly.** MetricFlow's own stated
   purpose — a SQL query generation tool that compiles one metric definition across different
   data dimensions (quote 1).
3. **Predict.** If a metric is defined once in a semantic layer, does it only ever compile to
   one fixed SQL query? (within the first four steps)
4. **Reveal: the lab — one metric, declared once.** `revenue` declared over a single measure in
   `_semantic_models.yml`, on top of the shop's own star schema.
5. **Reveal: the lab — two compiled queries from one declaration.** `mf query` compiles
   `revenue` by month (no join) and by day-and-category (an automatic join to `dim_product`) —
   both correct, both traced back to the one declaration, verified against an independent
   aggregate. Takeaway: a semantic layer's job is compiling one definition many ways, not
   picking one fixed query.
6. **Predict.** Does declaring the join key (the entity) on a fact table matter, or could
   MetricFlow just guess which tables to join based on column names?
7. **Reveal: entities as declared join keys, quoted directly.** MetricFlow's own definition —
   entities are the explicit traversal paths between semantic models (quote 4); the lab's own
   automatic join (step 5) only worked because `product` was declared as an entity on
   `fact_orders`.
8. **Reveal: the DRY principle, quoted directly.** MetricFlow's own stated design principle —
   minimize redundancy by enabling one metric definition wherever possible (quote 3). Takeaway:
   the two-queries-from-one-definition result in the lab isn't a convenience; it's the
   semantic layer's entire reason to exist.
9. **Predict.** Does a semantic layer need a special dedicated date table, or can any table
   with a date column serve as the basis for time-based grouping?
10. **Reveal: the time spine, quoted directly.** MetricFlow's own requirement — a dedicated time
    spine table, confirmed directly in the lab (the build failed with a clear error until one
    was added). Takeaway: time-based metrics in a semantic layer depend on a declared
    structure, not an assumption about which column happens to hold a date.
11. **Reveal: the other tools, named and sourced; MetricFlow's own open-sourcing.** Cube,
    LookML, warehouse-native Snowflake semantic views, and Databricks metric views named as
    the other real approaches to this same problem; MetricFlow's own move to Apache 2.0 at
    Coalesce 2025, aligned with the Open Semantic Interchange initiative (now renamed Apache
    Ossie), quoted directly, including the honest disclosure of that rename.
12. **Recap.** A semantic layer compiles one metric definition to many correct SQL queries;
    entities are the declared join keys that make that compilation possible; a time spine is a
    required, declared structure for any time-based metric; this isn't one vendor's trick — it's
    an industry-wide standardization effort, still renaming itself as it matures.
13. **Prove it.** Finance wants `average_order_value` broken down by customer region instead of
    by month. Does that need a new metric definition written from scratch, or does the existing
    `average_order_value` declaration already cover it?
