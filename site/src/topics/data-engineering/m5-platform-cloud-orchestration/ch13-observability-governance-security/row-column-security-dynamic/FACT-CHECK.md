# Fact-check — de.row-column-security-dynamic

| # | Claim in the reel | Source | Verdict |
|---|---|---|---|
| 1 | A row security policy restricts, per user, which rows normal queries can return. | PostgreSQL row security docs | Verbatim. |
| 2 | Superusers, `BYPASSRLS` roles and (normally) the table owner bypass row security. | PostgreSQL row security docs | Verbatim. |
| 3 | A row policy's expression runs for every row before the user's own conditions, except leakproof functions, which the optimizer may run earlier. | PostgreSQL row security docs | Verbatim. |
| 4 | Snowflake masking policies are schema-level objects. | Snowflake masking-policy docs | Verbatim. |
| 5 | A Snowflake masking policy is applied to the column at every location it appears, at query runtime. | Snowflake masking-policy docs | Verbatim. |
| 6 | A Snowflake row access policy determines whether a given row can be viewed; query output only includes rows the policy evaluates to `TRUE`. | Snowflake row-access-policy docs | Verbatim. |
| 7 | BigQuery row-level security filters rows via a `filter_expression` that functions like a `WHERE` clause; callers not on the allowed list are denied. | BigQuery row-level-security docs | Verbatim. |
| 8 | Lake Formation data filters give column-, row- and cell-level security, and apply only to read operations. | Lake Formation data-filtering docs | Verbatim. |
| 9 | Unity Catalog row filter and column mask policies are UDF-backed: the row filter's UDF returns a boolean per row; the column mask's UDF returns the original or a masked value; rows where the UDF returns `FALSE` are excluded. | Databricks ABAC policy docs | Verbatim. |
| 10 | Trino's OPA integration retrieves row-filter definitions and column masks from configured OPA endpoints. | Trino OPA access-control docs | Verbatim. |
| 11 | A policy enforced in the application only protects requests that pass through that application. | Topic's own framing (`CHAPTER.md` clause 1) | Consistent with how RLS/masking docs above describe engine-level, not app-level, enforcement — no source states the app-side failure mode directly, so this is presented as the reel's own reasoning, not a quoted claim. |
| 12 | A materialized view, extract or direct file read sits outside any of the engine's row/column policies. | Topic's own framing, consistent with Lake Formation's own "filters apply only to read operations [through the engine]" scope and the general nature of a materialized view as a separately stored table | Reasoned claim, not independently sourced per bypass path; flagged below. |
| 13 | A pushed-down row policy filters at the scan (lower rows-examined); one that isn't scans everything first. | General `EXPLAIN`/pushdown behavior (Chapter 2's `explain-triage`, not re-sourced here) | Consistent with established pushdown semantics; the specific row-filter pushdown numbers in `examples.py` are the topic's own synthetic illustration, not a vendor-published benchmark. | 

## Red-team analysis

- **Predict question (step 2):** three paths — masked-column query, derived-table query, direct
  file read. The temptation is to assume "a policy exists" means "every path is covered." The
  correct reading, per the sources above, is narrower: the policy covers exactly the paths that
  go through the engine's query execution against the live table; a derived table built earlier
  and a direct file read are both outside that scope, regardless of how strict the policy itself
  is. Checked against Lake Formation's own explicit scoping ("filters apply only to read
  operations") and the general nature of how a masking/row policy attaches to a table object.
- **Bypass claims (steps 7–9):** none of the six vendor sources state "a materialized view can
  leak unmasked values" or "an extract bypasses the policy" as an explicit warning — these are
  architectural consequences of how each policy attaches (to a table/column object, evaluated at
  query time against that live object) rather than a documented pitfall. Flagged as reasoned,
  not directly sourced, in `coverage.json`'s `gapReview` is unnecessary since the underlying
  mechanism (mask attaches to the object, not to copies of its output) is itself drawn from the
  sourced definitions above; the specific bypass scenarios are the topic's own extrapolation,
  consistent with `CHAPTER.md`'s own framing of the "bypass paths" clause.
- **Predict question (step 12):** tests whether the reader generalizes the bypass-path claim to a
  second artefact (a materialized view) with its own timing (refreshed before the mask existed)
  rather than only recalling the export example from step 8.
