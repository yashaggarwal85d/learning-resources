# Fact-check

1. **A dbt unit test validates SQL modeling logic on a small set of static inputs before materializing the full model in production, and currently only supports unit testing SQL models, defined in a YML file.** Sourced and reproduced directly: `examples.py` asserts dbt's own Developer Hub documentation states this, verified word for word against the fetched page text.

2. **pytest is one of the most popular Python testing frameworks for writing real tests against PySpark code, and a fixture can share one Spark session across a test file.** Sourced and reproduced directly: `examples.py` asserts Apache Spark's own "Testing PySpark" documentation states this, verified word for word against the fetched page text (after normalizing spacing the source's own markup inserts around punctuation).

3. **A dbt-unit-test-style mocked input and expected output, run directly against the shop's `stg_orders` transform logic, passes.** Run and reproduced directly, this topic's own experiment: `examples.py` applies `stg_orders_transform` to a static mocked input and asserts the output matches a static expected output.

4. **A real pytest test against a real local Spark session checks a pure transformation function (adding tax to a total) without materializing a full model or a cluster.** Run and reproduced directly: `examples.py` starts a real `SparkSession.builder.master("local[1]")`, runs `add_total_with_tax` against a real Spark DataFrame, and asserts the computed values.

5. **A property stated once -- a merge never decreases a total -- catches a real counterexample in a deliberately buggy merge function, and the fixed version survives the same search.** Run and reproduced directly: `examples.py` runs a real `hypothesis` `@given` search (with an `@example` guard forcing a known-bad case) against `merge_totals_buggy`, finds a genuine counterexample, then runs the same search against `merge_totals_fixed` and confirms it survives.

6. **A golden-dataset snapshot, diffed whole, catches an unintended rounding regression that a narrow unit test on a round number never exercises.** Run and reproduced directly: `examples.py` compares a regressed output against a frozen `GOLDEN_SNAPSHOT` and asserts the mismatch is caught, while a narrow single-value assertion on the same regressed output would not have been.

7. **An unordered result compared position by position genuinely fails on some runs and not others, and a sorted comparison does not.** Run and reproduced directly: `examples.py` runs `group_totals_unordered` with 20 different seeds, counts real positional-comparison failures (non-zero) against zero sorted-comparison failures.

8. **A baked-in exact timestamp comparison genuinely fails the moment the clock moves on, and a tolerant recency check does not.** Run and reproduced directly: `examples.py` demonstrates an exact-timestamp-match failure and a passing tolerant recency check against the same underlying event.

9. **The same three numbers, added in forward and reverse order via a plain running-total accumulator, genuinely land on a different floating-point result, while remaining within a reasonable tolerance.** Run and reproduced directly: `examples.py`'s manual `_running_total` accumulator sums `[0.1, 0.7, 0.3]` forward and reversed, finds `1.0999999999999999` versus `1.1`, confirms exact equality fails and `math.isclose` tolerant equality passes.

10. **In-pipeline expectation tests run inside the live pipeline itself against real production data, not in CI, and are a later chapter's own subject (§13.3), used here only as the top rung's name.** This topic's own framing of CHAPTER.md's stated scope, not independently sourced and demonstrated live here; the full tooling (dbt tests, Great Expectations, Soda) is Chapter 13's, referenced here by name only, consistent with CHAPTER.md's "used here as a named top rung, not re-taught" framing.
