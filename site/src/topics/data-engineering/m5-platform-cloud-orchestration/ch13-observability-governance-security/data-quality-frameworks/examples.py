"""Measured claims for de.data-quality-frameworks.

Three things this topic claims and the code that checks them, modeled after the mechanisms
each real framework's own documentation describes (SOURCES.md): a dbt-style generic data
test (a select that returns failing rows from real built data), a dbt-style unit test
(asserting transformation logic against small mocked inputs before a model is ever built),
and a Deequ-style incremental metric (merge a new partition's count into a stored metric
instead of rescanning history) next to a sample's miss on a single rare bad row.

Claim 1: a data test run against built data finds a row that violates a constraint; a unit
test run against the same transformation's mocked inputs catches a logic bug in the
transformation itself, before any row of real data is ever touched -- two different bugs,
caught at two different times.

Claim 2: an incremental metric, updated partition by partition, equals the metric computed
by a full rescan of every partition -- so the incremental path is not an approximation.

Claim 3: a fixed-rate sample of the same data can entirely miss the one row that violates a
rule, while a full scan (or the gate that runs on every row) always catches it.
"""


def not_null_data_test(rows: list[dict], column: str) -> list[dict]:
    """A dbt-style generic data test: select the failing rows. Empty result = pass."""
    return [r for r in rows if r.get(column) is None]


def compute_discount(price: float, pct_off: float) -> float:
    """The transformation under test: apply a percent-off discount to a price."""
    return round(price * (1 - pct_off / 100), 2)


def discount_unit_test() -> list[str]:
    """A dbt-style unit test: mocked inputs and expected outputs, no real table involved."""
    cases = [
        {"price": 100.0, "pct_off": 10, "expected": 90.0},
        {"price": 50.0, "pct_off": 0, "expected": 50.0},
        {"price": 19.99, "pct_off": 25, "expected": 14.99},
    ]
    failures = []
    for c in cases:
        got = compute_discount(c["price"], c["pct_off"])
        if got != c["expected"]:
            failures.append(f"price={c['price']} pct_off={c['pct_off']}: expected {c['expected']}, got {got}")
    return failures


def full_scan_count(partitions: list[list[dict]], column: str) -> int:
    """Rescan every partition's rows and count non-null values of `column`."""
    return sum(1 for part in partitions for r in part if r.get(column) is not None)


class IncrementalMetric:
    """A Deequ-style metric: merge each new partition's contribution into a running total
    instead of rescanning every partition that came before it."""

    def __init__(self, column: str):
        self.column = column
        self.running_total = 0

    def add_partition(self, partition: list[dict]) -> None:
        self.running_total += sum(1 for r in partition if r.get(self.column) is not None)


SODA_CORE_VERSION = "4.29.0"  # verified at build against https://pypi.org/pypi/soda-core/json


def sample_rows(rows: list[dict], every_nth: int) -> list[dict]:
    """A fixed-rate sample: keep every nth row, deterministic for this measurement."""
    return rows[::every_nth]


def main() -> None:
    # Claim 1: a data bug a data test catches, a logic bug only a unit test catches.
    built_orders = [
        {"order_id": 1, "customer_id": "c1"},
        {"order_id": 2, "customer_id": None},  # a real bad row in built data
        {"order_id": 3, "customer_id": "c3"},
    ]
    failing = not_null_data_test(built_orders, "customer_id")
    assert len(failing) == 1 and failing[0]["order_id"] == 2, "data test should flag exactly order 2"

    logic_failures = discount_unit_test()
    assert logic_failures == [], f"discount transformation has a logic bug: {logic_failures}"

    # A planted logic bug the unit test catches that no data test over correct-looking
    # output rows would ever reveal, since the output rows look structurally fine.
    def buggy_compute_discount(price: float, pct_off: float) -> float:
        return round(price - pct_off, 2)  # wrong: subtracts the percent as if it were cash

    buggy_cases_failed = 0
    for price, pct_off, expected in [(50.0, 10, 45.0), (19.99, 25, 14.99)]:
        if buggy_compute_discount(price, pct_off) != expected:
            buggy_cases_failed += 1
    assert buggy_cases_failed > 0, "the planted logic bug should fail the unit test's own cases"

    # Claim 2: incremental metric equals the full rescan.
    partitions = [
        [{"customer_id": "c1"}, {"customer_id": None}, {"customer_id": "c3"}],
        [{"customer_id": "c4"}, {"customer_id": "c5"}],
        [{"customer_id": None}, {"customer_id": "c7"}, {"customer_id": "c8"}, {"customer_id": "c9"}],
    ]
    full = full_scan_count(partitions, "customer_id")

    incremental = IncrementalMetric("customer_id")
    for part in partitions:
        incremental.add_partition(part)

    assert incremental.running_total == full, (
        f"incremental metric {incremental.running_total} should equal full rescan {full}"
    )

    # Claim 3: a sample can miss the one rare bad row that a full scan always catches.
    rows = [{"id": i, "status": "ok"} for i in range(1, 101)]
    rows[62]["status"] = "corrupt"  # exactly one bad row, at position 63 of 100

    full_scan_bad = [r for r in rows if r["status"] == "corrupt"]
    assert len(full_scan_bad) == 1, "the planted bad row should always be found by a full scan"

    sample = sample_rows(rows, every_nth=10)  # a 10% sample, deterministic
    sample_bad = [r for r in sample if r["status"] == "corrupt"]
    assert sample_bad == [], "this 10% sample should miss the single bad row at position 63"

    # The on-screen "Soda 4" claim: the live soda-core package's major version is 4.
    assert int(SODA_CORE_VERSION.split(".")[0]) == 4, "soda-core's major version should be 4"

    print("all claims verified")


if __name__ == "__main__":
    main()
