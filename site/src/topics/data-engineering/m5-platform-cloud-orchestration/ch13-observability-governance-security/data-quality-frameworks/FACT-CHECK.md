# Fact-check — de.data-quality-frameworks

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | dbt data tests are SQL select statements that seek to grab failing records that disprove an assertion. | dbt — Data tests | Verified, quoted in `SOURCES.md`. |
| 2 | A singular data test is a saved SQL query returning failing rows; a generic data test is a parameterized query that accepts arguments. | dbt — Data tests | Verified, quoted. |
| 3 | dbt unit tests validate SQL modeling logic on a small set of static inputs before the full model is materialized in production, and don't need to run on the data platform because they use static fixtures. | dbt — Unit tests | Verified, quoted. |
| 4 | An Expectation is a verifiable assertion about data; an Expectation Suite is a collection of Expectations. | GX Core overview | Verified, quoted. |
| 5 | Fivetran will become the new steward of the Great Expectations open-source community and the GX Core project; GX and FICO completed a definitive agreement for FICO to acquire GX Cloud; GX Core continues as an open-source, community-driven project. | GX blog, "An Update for the Great Expectations Community," 6 May 2026 | Verified, quoted with its publication date. |
| 6 | A Soda data contract is a YAML document containing data quality checks, similar to unit tests for testing software. | Soda — Contract Language Reference | Verified, quoted. No explicit "Soda 4" version string found on this specific page — the reel's prose says "Soda's current contracts-first engine" rather than citing a specific version number not found on the page actually fetched. |
| 7 | Deequ is a library built on top of Apache Spark for defining "unit tests for data," which measure data quality in large datasets. | Deequ README (awslabs/deequ) | Verified, quoted — fetched via `raw.githubusercontent.com` after `github.com/awslabs/deequ` itself returned HTTP 403 to this session's scoped GitHub access (the same access limitation topic 10 hit on Amundsen's repo); the raw-content mirror is the actual README text, machine-checked by `sources.mjs check` the same as any other source. |
| 8 | DQX is the data quality framework for Databricks; its Core package defines and runs checks in PySpark pipelines and notebooks for both batch and streaming. | Databricks DQX project site | Verified, quoted. |
| 9 | `import pyspark` fails in this build environment. | Read directly by running `python3 -c "import pyspark"` in this session, not a vendor page. | Verified by direct execution — `ModuleNotFoundError`. |
| 10 | `dbt-core` 1.12.6 and `dbt-duckdb` 1.11.1 run a real `dbt build` to completion in this environment, producing a real `run_results.json`. | Read directly from this session's own `dbt build` run (see `examples.py`), not a vendor page. | Verified by direct execution. |
| 11 | `great_expectations` 1.24.1 (matching `CHAPTER.md`'s own planning-time version citation) runs a real validation in this environment. | Read directly from this session's own Python run (see `examples.py`), not a vendor page. | Verified by direct execution. |

## Red-team analysis

- **Is the GX Core version claim ("1.24.1, matching the documentation read at planning") actually
  checked, or just assumed to match?** Checked: `pip index versions great_expectations` was run
  directly in this session and the latest available version is exactly `1.24.1`, matching
  `CHAPTER.md`'s own stated planning-time version — not assumed, confirmed by installing it.
- **Does calling the dbt and GX results "real" overstate a toy example?** No — the claim is
  narrow and accurate: a real `dbt build` subprocess call against a real DuckDB file, and a real
  `great_expectations` Python library call against a real pandas DataFrame, both catching a
  genuinely planted problem (a missing `customer_id`), not a hand-coded "pass"/"fail" string. The
  data itself is synthetic (five rows), which is disclosed, not hidden.
- **Could the sampling-miss example be cherry-picked to always show a miss, rather than being an
  honest "can miss"?** Checked: the example's 1-in-10 sample over a 100-row table built by
  repeating a 5-row pattern lands on the same relative position in every repetition (index 0 of
  each 5-row cycle), which never includes the null at index 3 of the cycle — this is a genuine,
  reproducible miss given the deterministic sampling stride, not a result selectively reported;
  `reel.tsx`'s own prose states the general claim ("can miss a single rare bad row"), not a false
  universal ("sampling always misses").
- **Is the Soda version claim appropriately hedged given the page fetched doesn't state a version
  number?** Yes — `SOURCES.md` quotes only what the Contract Language Reference page actually
  says (what a contract is), and does not claim a specific "Soda 4.x" version number beyond what
  the syllabus itself already states (the installed `soda-core` package's own latest available
  version, `4.29.0`, was checked via `pip index versions soda-core` and is consistent with "Soda
  4", but Soda's own checks were not run, so this is reported as a version check only, not a run).
- **Deequ source access — same pattern as Amundsen (topic 10)?** Yes, and resolved the same way:
  `github.com/awslabs/deequ` 403s to this session's scoped GitHub tools, but
  `raw.githubusercontent.com/awslabs/deequ/master/README.md` fetched cleanly and is the exact same
  README content, machine-verified by `sources.mjs check` — unlike the Amundsen case, no caveated,
  unverifiable claim was needed here since the raw-content mirror let the automated checker
  confirm the quote itself.
