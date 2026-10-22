# Fact-check, currency and red team, 2026-10-22

Re-derived each claim from the fetched PostgreSQL, Snowflake and Databricks docs and this topic's own four local measurements. Red-teamed the predict questions for edge cases.

| # | Claim | Status | Evidence |
|---|---|---|---|
| 1 | REFRESH MATERIALIZED VIEW completely replaces the view's contents by rerunning the defining query | Confirmed | Quoted verbatim from PostgreSQL docs; measured directly: a full refresh of a three-million-row aggregate costs 973.776 ms with no change to the base table, and 993.897 ms after inserting ten new rows — essentially the same cost either way, because the entire query reruns regardless |
| 2 | An incrementally maintained equivalent only touches the rows a change affects, at dramatically lower cost | Confirmed | Sourced from Snowflake/Databricks incremental-refresh docs; measured directly with a trigger-maintained summary table standing in for incremental view maintenance: the identical ten-row insert costs 5.536 ms, about 180 times less than the 993.897 ms full refresh |
| 3 | Without CONCURRENTLY, a refresh can block concurrent reads; with it, reads are never blocked, in exchange for requiring a UNIQUE index covering every row | Confirmed | Quoted verbatim from PostgreSQL docs; measured directly across two sessions: a `SELECT` against the view takes 861.419 ms while a plain refresh is running (blocked on the refresh's lock), versus 4.671 ms while `REFRESH ... CONCURRENTLY` is running instead — about 184 times faster, never blocked |
| 4 | Floating-point aggregates (SUM, AVG, covariance) can force a fallback to full recompute under incremental refresh; casting to DECIMAL keeps incremental refresh working | Confirmed, not independently measured | Quoted verbatim from Databricks docs. This sandbox's PostgreSQL has no built-in incremental-refresh materialized view feature to reproduce the specific fallback against — PostgreSQL's own REFRESH is always a full recompute, which is exactly why this topic needs a different engine's documentation for this claim |
| 5 | A staleness bound like Snowflake's target lag is a target the engine tries to keep, not a strict guarantee | Confirmed, not independently measured | Quoted verbatim from Snowflake docs. No Snowflake account available to this sandbox — the same honest-gap reasoning as prior cross-engine topics in this chapter |

## Red team: predict questions
- **Step 2** ("does a full refresh's cost shrink with the size of the change?"): the tempting wrong answer is "yes, of course — less data changed, so less work" — ruled out directly by the measured contrast: 973.776 ms with no change, 993.897 ms after a ten-row change, essentially the same.
- **Step 5** ("how much cheaper should incremental maintenance be?"): red-teamed against assuming "a bit cheaper" rather than "dramatically cheaper" — the measured ratio (about 180 times) is large enough that understating it would undersell the actual mechanism.
- **Step 7** ("does PostgreSQL offer a way to update without blocking readers?"): the tempting wrong answer is "no, a refresh always locks the view" — ruled out directly by the measured contrast between a blocked 861 ms read and an unblocked 4.671 ms read.
- **Step 10** ("does a floating-point sum still maintain incrementally?"): the tempting wrong answer is "yes, SUM is SUM regardless of type" — ruled out by Databricks's own documented floating-point non-determinism caveat, which this topic states as sourced, not measured, since it is specific to warehouse engines this sandbox cannot run.

## Currency check
PostgreSQL 16.15, measured directly on this sandbox (the existing instance from topics 23–31), is current as of 2026-10-22, and REFRESH MATERIALIZED VIEW's full-replacement and CONCURRENTLY semantics are unchanged from PostgreSQL 16 through 18 (not a version-gated feature). The fetched PostgreSQL 18, Snowflake, and Databricks documentation pages are the current pages as of this date.

No corrections to OUTLINE.md were needed; all claims passed as planned.
