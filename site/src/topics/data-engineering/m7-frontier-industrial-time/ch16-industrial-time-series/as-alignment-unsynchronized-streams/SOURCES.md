# Sources

## pandas: `merge_asof`

URL: https://pandas.pydata.org/docs/reference/api/pandas.merge_asof.html
Version: pandas 3.1.0 documentation (installed in this environment: pandas 3.0.5; run)

> This is similar to a left-join except that we match on nearest key rather than equal keys. Both DataFrames must be first sorted by the merge key in ascending order before calling this function.

> A "backward" search selects the last row in the right DataFrame whose 'on' key is less than or equal to the left's key.

> toleranceint or timedelta, optional, default None Select asof tolerance within this range; must be compatible with the merge index.

Contents: the `by`/`left_by`/`right_by` partition-key parameters, `direction` (`backward`/`forward`/`nearest`), and `allow_exact_matches`. Run in this environment (`examples.py`).

## DuckDB: AsOf Join guide

URL: https://duckdb.org/docs/2.0/guides/sql_features/asof_join.html
Version: DuckDB 2.0 documentation, retrieved 2026-10-31 (the `/docs/stable/...` and `/docs/preview/...` URLs both redirect here via a client-side meta refresh, not followed by a plain HTTP fetch — the canonical `/docs/2.0/...` URL was fetched directly instead)

> Because AsOf produces at most one match from the right hand side, the left side table will not grow as a result of the join, but it could shrink if there are missing times on the right.

Contents: the `ASOF JOIN ... ON h.ticker = p.ticker AND h.when >= p.when` inequality-plus-equality pattern, and the `USING (ticker, "when")` shorthand restriction that the inequality field must be last. Run in this environment (`examples.py`, DuckDB 2.0.0 Python package).

## ClickHouse: `JOIN` clause documentation (ASOF)

URL: https://clickhouse.com/docs/en/sql-reference/statements/select/join
Version: current ClickHouse documentation, retrieved 2026-10-31

> Joining sequences with a non-exact match. ASOF JOIN usage is described below.

> In an ASOF JOIN, the closest-match column is compared by ordering, which NaN does not support — filter such rows out on both sides.

> You can use any number of equality conditions and exactly one closest match condition.

Contents (not run — no ClickHouse instance in this environment; **sourced-only**, per CHAPTER.md's own allowance): `ASOF JOIN is supported only by hash and full_sorting_merge join algorithms`, and the closest-match condition operators (`>`, `>=`, `<`, `<=`).

## kdb+/q: `aj`, `aj0`, `ajf`, `ajf0` reference

URL: https://code.kx.com/q/ref/aj/
Version: kdb+ and q documentation, retrieved 2026-10-31

> returns a table with records from the left-join of t1 and t2. In the join, columns c0...cn-1 are matched for equality, and the last value of cn (most recent time) is taken.

Contents (not run — no kdb+/q instance in this environment; **sourced-only**): the signature `aj[c;t1;t2]`, and that unmatched left records get null right-hand columns rather than being dropped.

## Chapter 2's as-of join (in-course, used)

URL: (none — a prior topic in this same site, not an external fetch)
Version: n/a

Named, not quoted. `as-of-join`, `point-in-time-join-plans` and `temporal-leakage` (all introduced earlier in the Data Engineering syllabus) are used by this topic's `uses` list; this topic applies the already-taught join mechanism to telemetry rather than re-deriving its logical plan shapes, per CHAPTER.md's own instruction ("does not re-teach the join's plan shapes").
