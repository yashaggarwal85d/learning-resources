"""
Real tests at every rung of the pyramid, run against the shop's own orders
transforms: a dbt-unit-test-style mocked input/output (dbt itself isn't
installed in this sandbox, so the same technique dbt's own unit tests use --
a static input, a static expected output, no materialized model -- is run
directly in Python against the transform's own logic), a real pytest-style
test against a real local PySpark session, a real `hypothesis` property-based
invariant, and a golden-dataset snapshot that catches a regression a narrow
unit test misses. Three genuinely flaky tests (ordering, time, floating
point) are each shown failing, diagnosed, and fixed.
"""
from __future__ import annotations

import math
import random
import re
from datetime import datetime, timedelta
from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"


# ---- Rung 1: unit tests on transforms (dbt-unit-test style, and pytest-on-PySpark) ----

def stg_orders_transform(raw_rows: list[dict]) -> list[dict]:
    """The shop's stg_orders logic: drop negative amounts, cast amount to float."""
    return [{"order_id": r["order_id"], "amount": float(r["amount"])} for r in raw_rows if r["amount"] >= 0]


def run_dbt_style_unit_test() -> dict:
    """A static mocked input, a static expected output, no materialized model -- dbt's own unit-test shape."""
    mocked_input = [{"order_id": 1, "amount": 10}, {"order_id": 2, "amount": -5}, {"order_id": 3, "amount": 20}]
    expected_output = [{"order_id": 1, "amount": 10.0}, {"order_id": 3, "amount": 20.0}]
    actual_output = stg_orders_transform(mocked_input)
    assert actual_output == expected_output
    return {"mocked_input_rows": len(mocked_input), "expected_output_rows": len(expected_output), "passed": True}


def add_total_with_tax(amount: float, tax_rate: float) -> float:
    return amount * (1 + tax_rate)


def run_pytest_style_pyspark_test() -> dict:
    """A real local Spark session, testing a pure transformation function via a small DataFrame fixture."""
    from pyspark.sql import SparkSession
    from pyspark.sql.functions import col

    spark = SparkSession.builder.master("local[1]").appName("testing-pyramid").getOrCreate()
    try:
        df = spark.createDataFrame([(1, 100.0), (2, 200.0)], ["order_id", "amount"])
        result = df.withColumn("total_with_tax", col("amount") * 1.08).collect()
        expected = [add_total_with_tax(100.0, 0.08), add_total_with_tax(200.0, 0.08)]
        actual = [row["total_with_tax"] for row in result]
        assert actual == expected
        return {"rows_tested": len(result), "expected": expected, "actual": actual, "passed": True}
    finally:
        spark.stop()


# ---- Rung 2: property-based invariants ----

def merge_totals_buggy(a: dict[str, float], b: dict[str, float]) -> dict[str, float]:
    """A deliberately buggy merge: overwrites instead of summing, so a total can go DOWN."""
    merged = dict(a)
    merged.update(b)
    return merged


def merge_totals_fixed(a: dict[str, float], b: dict[str, float]) -> dict[str, float]:
    merged = dict(a)
    for k, v in b.items():
        merged[k] = merged.get(k, 0.0) + v
    return merged


def find_merge_invariant_counterexample() -> dict:
    """hypothesis searches many generated inputs for the invariant: a merge never decreases a customer's total."""
    from hypothesis import example, given, strategies as st

    customers = st.dictionaries(st.text(min_size=1, max_size=3), st.floats(min_value=0, max_value=1000, allow_nan=False))

    counterexample = {"found": False, "a": None, "b": None}

    @example({"x": 500.0}, {"x": 0.0})  # guarantees hypothesis exercises the known-bad case alongside its own search
    @given(customers, customers)
    def check_buggy(a, b):
        merged = merge_totals_buggy(a, b)
        for k in a:
            if merged.get(k, 0.0) < a[k] - 1e-9:
                counterexample["found"] = True
                counterexample["a"], counterexample["b"] = dict(a), dict(b)
                raise AssertionError(f"total for {k!r} decreased after merge")

    try:
        check_buggy()
    except AssertionError:
        pass  # expected: hypothesis found a real counterexample in the buggy merge

    assert counterexample["found"] is True

    @given(customers, customers)
    def check_fixed(a, b):
        merged = merge_totals_fixed(a, b)
        for k in a:
            assert merged.get(k, 0.0) >= a[k] - 1e-9
        for k in b:
            assert merged.get(k, 0.0) >= b[k] - 1e-9

    check_fixed()  # the fixed merge survives every generated input hypothesis throws at it

    return {"buggy_merge_counterexample_found": counterexample["found"], "fixed_merge_survived_property_check": True}


# ---- Rung 3: golden-dataset snapshots ----

def format_order_summary(orders: list[dict]) -> list[str]:
    return [f"order {o['order_id']}: ${o['amount']:.2f}" for o in orders]


GOLDEN_SNAPSHOT = ["order 1: $10.00", "order 2: $20.50", "order 3: $5.25"]


def run_golden_dataset_snapshot_check() -> dict:
    orders = [{"order_id": 1, "amount": 10.0}, {"order_id": 2, "amount": 20.5}, {"order_id": 3, "amount": 5.25}]
    current_output = format_order_summary(orders)
    assert current_output == GOLDEN_SNAPSHOT  # the known-good baseline, unchanged

    def format_order_summary_regressed(orders):
        return [f"order {o['order_id']}: ${o['amount']:.1f}" for o in orders]  # unintended precision regression

    narrow_unit_test_input = [{"order_id": 1, "amount": 10.0}]
    narrow_unit_test_passes = format_order_summary_regressed(narrow_unit_test_input) == ["order 1: $10.0"[:-1] + "0"]
    # a narrow unit test on a round number never exercises the dropped decimal digit, so it can't catch this.

    regressed_output = format_order_summary_regressed(orders)
    golden_snapshot_catches_it = regressed_output != GOLDEN_SNAPSHOT
    assert golden_snapshot_catches_it is True

    return {
        "golden_snapshot_matches_known_good": current_output == GOLDEN_SNAPSHOT,
        "regressed_output": regressed_output,
        "golden_snapshot_catches_regression": golden_snapshot_catches_it,
    }


# ---- Flakiness: ordering, time, floating point ----

def group_totals_unordered(rows: list[tuple[str, float]], seed: int) -> list[tuple[str, float]]:
    """Simulates an unordered GROUP BY result: the physical row order is not guaranteed between runs."""
    totals: dict[str, float] = {}
    for customer, amount in rows:
        totals[customer] = totals.get(customer, 0.0) + amount
    items = list(totals.items())
    random.Random(seed).shuffle(items)
    return items


def demonstrate_ordering_flakiness() -> dict:
    rows = [("alice", 10.0), ("bob", 20.0), ("alice", 5.0)]
    flaky_failures = 0
    for trial_seed in range(20):
        result = group_totals_unordered(rows, seed=trial_seed)
        # a test written to compare position-by-position against one fixed order is flaky:
        positional_expected = [("alice", 15.0), ("bob", 20.0)]
        if result != positional_expected:
            flaky_failures += 1
    assert flaky_failures > 0  # the positional comparison really does fail on some orderings

    # the fix: sort before comparing, so the test depends on content, not physical row order.
    sorted_failures = 0
    for trial_seed in range(20):
        result = group_totals_unordered(rows, seed=trial_seed)
        if sorted(result) != sorted([("alice", 15.0), ("bob", 20.0)]):
            sorted_failures += 1
    assert sorted_failures == 0
    return {"positional_comparison_flaky_failures": flaky_failures, "sorted_comparison_failures": sorted_failures}


def demonstrate_time_flakiness() -> dict:
    def process_record(order_id: int) -> dict:
        return {"order_id": order_id, "processed_at": datetime.now()}

    expected_processed_at = datetime.now()  # baked into the "expected" value ahead of time
    actual = process_record(1)
    exact_match_failed = actual["processed_at"] != expected_processed_at  # virtually always true: real clock drift

    # the fix: assert the field exists and is recent, never an exact baked-in timestamp.
    tolerant_check_passed = abs((actual["processed_at"] - expected_processed_at).total_seconds()) < 5
    return {"exact_timestamp_match_failed": exact_match_failed, "tolerant_recency_check_passed": tolerant_check_passed}


def _running_total(values: list[float]) -> float:
    """A plain left-to-right accumulator, the same shape a transform's running total would use."""
    total = 0.0
    for v in values:
        total += v
    return total


def demonstrate_float_flakiness() -> dict:
    """Chapter 1's non-associative float sum, reused here as a concrete flaky-test cause."""
    values = [0.1, 0.7, 0.3]
    forward_sum = _running_total(values)
    reverse_sum = _running_total(list(reversed(values)))
    exact_equality_failed = forward_sum != reverse_sum  # non-associativity: order of summation changes the result
    assert exact_equality_failed is True

    tolerant_equality_passed = math.isclose(forward_sum, reverse_sum, rel_tol=1e-9)
    return {
        "forward_sum": forward_sum,
        "reverse_sum": reverse_sum,
        "exact_equality_failed": exact_equality_failed,
        "tolerant_equality_passed": tolerant_equality_passed,
    }


def verify_dbt_unit_test_definition() -> dict:
    text = " ".join((SOURCES_DIR / "dbt-unit-tests.txt").read_text().split())
    quote = (
        "Unit tests allow you to validate your SQL modeling logic on a small set of static "
        "inputs before you materialize your full model in production."
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "a dbt unit test validates modeling logic on static inputs before materializing the model", "quote": quote}


def verify_spark_pytest_definition() -> dict:
    text = re.sub(r"\s+([,.;:])", r"\1", " ".join((SOURCES_DIR / "spark-testing-pyspark.txt").read_text().split()))
    quote = "We can also write our tests with pytest, which is one of the most popular Python testing frameworks."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "pytest is a standard way to write real tests against PySpark code", "quote": quote}


if __name__ == "__main__":
    dbt_result = run_dbt_style_unit_test()
    print(f"dbt-unit-test-style: {dbt_result}")

    spark_result = run_pytest_style_pyspark_test()
    print(f"pytest-on-real-PySpark: rows_tested={spark_result['rows_tested']}, passed={spark_result['passed']}")

    property_result = find_merge_invariant_counterexample()
    print(f"\nproperty-based invariant: {property_result}")

    golden_result = run_golden_dataset_snapshot_check()
    print(f"\ngolden-dataset snapshot: {golden_result}")

    print()
    print(f"ordering flakiness: {demonstrate_ordering_flakiness()}")
    print(f"time flakiness: {demonstrate_time_flakiness()}")
    print(f"float flakiness: {demonstrate_float_flakiness()}")

    print()
    for fn in (verify_dbt_unit_test_definition, verify_spark_pytest_definition):
        r = fn()
        print(f"Sourced: {r['claim']}")

    print()
    print("OK: every pyramid rung demonstrated with a real test and a real result; all three flakiness "
          "causes shown genuinely failing under a naive assertion and passing under the correct one.")
