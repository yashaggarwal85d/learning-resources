<section data-section="outcomes">

## Outcomes

Write a Postgres row policy and a column mask and show them applied to two roles; show on
EXPLAIN what a policy does to the plan and measure the cost; explain why an engine-side policy
is stronger than an application filter and list three ways data still escapes it; map one
policy intent to the five named engines' mechanisms without claiming more than each one's
documentation says.

</section>

<section data-section="measuring-the-plan-change">

## Measuring the plan change

`examples.py` deliberately runs `EXPLAIN SELECT * FROM customers;` with no `WHERE` clause at
all, specifically so that any `Filter` node appearing in the plan can only have come from the
row-security policy itself, not from a predicate the query wrote. Before any policy exists, the
plan has no filter step; after `CREATE POLICY region_only_us` is applied, PostgreSQL's planner
adds one, exactly as Databricks' own documentation describes for its row filters and column
masks ("it always makes the secure choice"). The row count drops from three thousand to exactly
one thousand — the fraction of the synthetic data tagged with the one allowed region — showing
the policy, not the query text, decided what came back.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting an application-side filter as the only line of defence.** The Hook's own scenario —
masking applied somewhere, and an analyst still recovering real addresses — is what happens when
the only protection sits in application code that a derived table, an ad-hoc query tool, or a
direct file read never passes through. An engine-enforced policy closes exactly that gap, for
every query against the table itself.

**Assuming an engine policy protects everything downstream of the table.** `examples.py`'s own
superuser-bypass measurement shows a privileged role seeing every row regardless of the policy —
the real-world equivalents are a direct read of the underlying Parquet or CSV files, an extract
already exported before the policy existed, or a materialized view built from an unmasked
snapshot. None of these paths ever ask the engine's policy anything.

</section>

<section data-section="frontier">

## Frontier

PostgreSQL's own row-security model is richer than this topic's single-policy measurement
shows: separate `USING` (visibility) and `WITH CHECK` (insert/update) expressions, and
`RESTRICTIVE` policies that `AND` together with `PERMISSIVE` ones rather than simply `OR`-ing
every applicable policy. A real deployment with several overlapping policies needs to reason
about that combination logic, not just a single allow condition.

</section>
