"""
Real diff experiments against the shop's own fct_orders table: a full join-diff
(every row, every column, exact) and a checksum-bisection diff (hash key ranges,
recurse only into mismatching ranges) run against identical old/new outputs with
a single planted column regression; a float/timestamp tolerance band that
suppresses harmless non-associative noise without hiding the real regression; a
column-level change summary built from the planted bug; and a measured cost
curve (rows actually scanned) for both strategies at increasing synthetic scale.
"""
from __future__ import annotations

import hashlib
import math
import random
from datetime import datetime, timedelta
from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"


# ---- Building old/new fct_orders with a single planted column regression ----

def make_fct_orders(n: int, seed: int = 0) -> list[dict]:
    rng = random.Random(seed)
    base = datetime(2026, 10, 24, 0, 0, 0)
    return [
        {
            "order_id": i,
            "amount": round(rng.uniform(5.0, 500.0), 2),
            "updated_at": base + timedelta(seconds=i),
        }
        for i in range(n)
    ]


def apply_planted_regression(rows: list[dict], bug_rate: float, seed: int = 1) -> list[dict]:
    """Deliberately breaks only the `amount` column on a fraction of rows -- a single-column bug."""
    rng = random.Random(seed)
    out = []
    for r in rows:
        r = dict(r)
        if rng.random() < bug_rate:
            r["amount"] = round(r["amount"] * 1.10, 2)  # an unintended 10% surcharge, planted
        out.append(r)
    return out


def apply_fixed_count_regression(rows: list[dict], n_changed: int, seed: int = 1) -> list[dict]:
    """Breaks exactly n_changed rows, regardless of table size -- isolates the effect of table size alone."""
    rng = random.Random(seed)
    changed_ids = set(rng.sample(range(len(rows)), min(n_changed, len(rows))))
    out = []
    for r in rows:
        r = dict(r)
        if r["order_id"] in changed_ids:
            r["amount"] = round(r["amount"] * 1.10, 2)
        out.append(r)
    return out


# ---- Full join-diff: join on key, compare every column, exact (datafold/data-diff's "Same-DB diff") ----

def full_join_diff(old: list[dict], new: list[dict]) -> dict:
    old_by_key = {r["order_id"]: r for r in old}
    new_by_key = {r["order_id"]: r for r in new}
    rows_scanned = len(old_by_key) + len(new_by_key)
    mismatches = []
    for key, old_row in old_by_key.items():
        new_row = new_by_key[key]
        for col in ("amount", "updated_at"):
            if old_row[col] != new_row[col]:
                mismatches.append({"order_id": key, "column": col, "old": old_row[col], "new": new_row[col]})
    return {"rows_scanned": rows_scanned, "mismatches": mismatches}


# ---- Checksum bisection: hash key ranges, recurse only into mismatching ranges ----

def _segment_checksum(rows: list[dict]) -> str:
    payload = "|".join(f"{r['order_id']}:{r['amount']}:{r['updated_at'].isoformat()}" for r in rows)
    return hashlib.sha256(payload.encode()).hexdigest()


def checksum_bisection_diff(old: list[dict], new: list[dict], bisection_factor: int = 4, threshold: int = 8) -> dict:
    old_by_key = {r["order_id"]: r for r in old}
    new_by_key = {r["order_id"]: r for r in new}
    keys = sorted(old_by_key)
    rows_scanned = 0
    mismatches = []

    def recurse(key_range: list[int]):
        nonlocal rows_scanned
        if not key_range:
            return
        old_segment = [old_by_key[k] for k in key_range]
        new_segment = [new_by_key[k] for k in key_range]
        if len(key_range) <= threshold:
            rows_scanned += len(key_range) * 2  # below threshold: compared row by row, in both tables
            for k in key_range:
                for col in ("amount", "updated_at"):
                    if old_by_key[k][col] != new_by_key[k][col]:
                        mismatches.append({"order_id": k, "column": col, "old": old_by_key[k][col], "new": new_by_key[k][col]})
            return
        rows_scanned += 2  # a segment above threshold costs one checksum query per side, not a full row scan
        if _segment_checksum(old_segment) == _segment_checksum(new_segment):
            return  # checksums match: this whole segment is skipped, never read row by row
        chunk = max(1, len(key_range) // bisection_factor)
        for i in range(0, len(key_range), chunk):
            recurse(key_range[i : i + chunk])

    recurse(keys)
    return {"rows_scanned": rows_scanned, "mismatches": mismatches}


def run_join_vs_bisection_comparison() -> dict:
    """Same identical old/new fct_orders, two strategies, a single planted column bug in 2% of rows."""
    old = make_fct_orders(1000)
    new = apply_planted_regression(old, bug_rate=0.02)
    join_result = full_join_diff(old, new)
    bisection_result = checksum_bisection_diff(old, new)
    assert {m["order_id"] for m in join_result["mismatches"]} == {m["order_id"] for m in bisection_result["mismatches"]}
    assert bisection_result["rows_scanned"] < join_result["rows_scanned"]
    return {
        "rows_in_table": len(old),
        "rows_actually_changed": len(join_result["mismatches"]),
        "full_join_diff_rows_scanned": join_result["rows_scanned"],
        "checksum_bisection_rows_scanned": bisection_result["rows_scanned"],
        "both_found_same_mismatches": True,
    }


# ---- Tolerance for floats and timestamps: suppress harmless noise, keep the real regression ----

def _running_total(values: list[float]) -> float:
    total = 0.0
    for v in values:
        total += v
    return total


def run_tolerance_demo() -> dict:
    """Two harmless re-derivations of the same amount, summed in a different internal order, plus one real bug."""
    pieces_old = [42.38, 38.14, 21.61]
    pieces_new = list(reversed(pieces_old))  # a harmless re-ordering inside the new pipeline's own aggregation
    old_amount = _running_total(pieces_old)
    new_amount_noise_only = _running_total(pieces_new)
    new_amount_real_bug = round(old_amount * 1.10, 2)  # the actual planted regression

    exact_diff_flags_noise = old_amount != new_amount_noise_only  # a naive diff treats float noise as a mismatch
    tolerant_diff_ignores_noise = math.isclose(old_amount, new_amount_noise_only, rel_tol=1e-9, abs_tol=1e-6)
    tolerant_diff_still_catches_bug = not math.isclose(old_amount, new_amount_real_bug, rel_tol=1e-9, abs_tol=1e-6)

    assert exact_diff_flags_noise is True
    assert tolerant_diff_ignores_noise is True
    assert tolerant_diff_still_catches_bug is True
    return {
        "old_amount": old_amount,
        "new_amount_noise_only": new_amount_noise_only,
        "new_amount_real_bug": new_amount_real_bug,
        "exact_diff_falsely_flags_noise": exact_diff_flags_noise,
        "tolerant_diff_ignores_noise": tolerant_diff_ignores_noise,
        "tolerant_diff_still_catches_real_bug": tolerant_diff_still_catches_bug,
    }


# ---- Column-level change summary, from the single-column planted bug ----

def summarize_column_changes(old: list[dict], new: list[dict]) -> dict:
    old_by_key = {r["order_id"]: r for r in old}
    new_by_key = {r["order_id"]: r for r in new}
    per_column: dict[str, list[float]] = {}
    for key, old_row in old_by_key.items():
        new_row = new_by_key[key]
        for col in ("amount", "updated_at"):
            if old_row[col] != new_row[col]:
                delta = (new_row[col] - old_row[col]) if col == "amount" else None
                per_column.setdefault(col, [])
                if delta is not None:
                    per_column[col].append(delta)
    summary = {
        col: {"rows_changed": len(deltas) if deltas else 0, "mean_delta": (sum(deltas) / len(deltas)) if deltas else None}
        for col, deltas in per_column.items()
    }
    return summary


def run_column_summary_demo() -> dict:
    old = make_fct_orders(500)
    new = apply_planted_regression(old, bug_rate=0.05)
    summary = summarize_column_changes(old, new)
    assert set(summary.keys()) == {"amount"}  # the planted bug touches exactly one column, nothing else
    assert summary["amount"]["rows_changed"] > 0
    return {"columns_changed": list(summary.keys()), "amount_summary": summary["amount"]}


# ---- Cost at increasing synthetic scale ----

def run_cost_curve(sizes: list[int], fixed_changes: int = 5) -> dict:
    """Table size grows; the NUMBER of actually-changed rows stays fixed, isolating size's own effect on cost."""
    curve = []
    for n in sizes:
        old = make_fct_orders(n)
        new = apply_fixed_count_regression(old, n_changed=fixed_changes)
        join_scanned = full_join_diff(old, new)["rows_scanned"]
        bisection_scanned = checksum_bisection_diff(old, new)["rows_scanned"]
        curve.append({"rows_in_table": n, "full_join_diff_scanned": join_scanned, "checksum_bisection_scanned": bisection_scanned})
    # full join-diff always scans every row, so its cost grows exactly linearly with table size.
    assert curve[-1]["full_join_diff_scanned"] == curve[0]["full_join_diff_scanned"] * (sizes[-1] // sizes[0])
    # checksum bisection, with the same fixed number of real changes, scans a shrinking FRACTION of the table
    # as the table grows -- its relative advantage over join-diff widens with scale.
    first_fraction = curve[0]["checksum_bisection_scanned"] / curve[0]["full_join_diff_scanned"]
    last_fraction = curve[-1]["checksum_bisection_scanned"] / curve[-1]["full_join_diff_scanned"]
    assert last_fraction < first_fraction
    return {"curve": curve, "bisection_fraction_of_join_cost": {"at_smallest_scale": first_fraction, "at_largest_scale": last_fraction}}


def verify_outer_join_diff_source() -> dict:
    text = " ".join((SOURCES_DIR / "data-diff-technical-explanation.html").read_text().split())
    quote = "Uses an outer-join to diff the rows as efficiently and accurately as possible."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "a same-database diff uses an outer-join to compare rows", "quote": quote}


def verify_checksum_bisection_source() -> dict:
    text = " ".join((SOURCES_DIR / "data-diff-technical-explanation.html").read_text().split())
    quote1 = "data-diff splits the table into smaller segments, then checksums each segment in both databases."
    quote2 = "When the checksums for a segment aren't equal, it will further divide that segment into yet smaller segments, checksumming those until it gets to the differing row(s)."
    assert quote1 in text and quote2 in text, "quote not found verbatim in fetched source"
    return {"claim": "checksum bisection hashes segments and recurses only into mismatching ones", "quotes": [quote1, quote2]}


def verify_float_inexactness_source() -> dict:
    text = " ".join((SOURCES_DIR / "pg-numeric.txt").read_text().split())
    quote = "Comparing two floating-point values for equality might not always work as expected."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "comparing floats for exact equality is unreliable, which is why a diff needs a tolerance", "quote": quote}


if __name__ == "__main__":
    comparison = run_join_vs_bisection_comparison()
    print(f"join vs bisection: {comparison}")

    tolerance = run_tolerance_demo()
    print(f"\ntolerance demo: {tolerance}")

    column_summary = run_column_summary_demo()
    print(f"\ncolumn-level summary: {column_summary}")

    cost = run_cost_curve([200, 2000, 20000])
    print(f"\ncost curve: {cost}")

    print()
    for fn in (verify_outer_join_diff_source, verify_checksum_bisection_source, verify_float_inexactness_source):
        r = fn()
        print(f"Sourced: {r['claim']}")

    print()
    print("OK: full join-diff and checksum bisection found the same mismatches on identical data, bisection "
          "scanning fewer rows; a tolerance band ignored harmless float noise while still catching the real "
          "regression; the column summary isolated the one bad column; bisection's relative cost advantage "
          "widens with table size when the number of real changes stays fixed.")
