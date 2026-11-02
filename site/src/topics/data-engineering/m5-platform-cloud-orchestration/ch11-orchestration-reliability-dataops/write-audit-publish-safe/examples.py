"""
Real write-audit-publish experiments against a local-filesystem stand-in for an Iceberg table
(a JSON snapshot log, modeled on the shop's own fct_orders): write to an audit branch, run a
real diff-and-tolerance audit (reusing topic 16's technique) against it, and only fast-forward
main on a pass -- demonstrated with both a good write that reaches production and a deliberately
bad write that never does. A blue-green table swap, a shadow run diffed before cutover, a canary
rollout measured by partition before expanding, a feature-flagged transform toggled live, and a
one-step time-travel rollback round out the chapter's deploy-safety toolkit.
"""
from __future__ import annotations

import copy
import math
import random
from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"


# ---- A minimal real snapshot-log table, standing in for Iceberg's own branch/snapshot model ----

class SnapshotTable:
    """main and named branches are each a pointer into a shared, append-only list of snapshots."""

    def __init__(self, initial_rows: list[dict]):
        self.snapshots: list[list[dict]] = [copy.deepcopy(initial_rows)]
        self.branches: dict[str, int] = {"main": 0}

    def create_branch(self, name: str, from_branch: str = "main") -> None:
        self.branches[name] = self.branches[from_branch]

    def write(self, branch: str, rows: list[dict]) -> None:
        self.snapshots.append(copy.deepcopy(rows))
        self.branches[branch] = len(self.snapshots) - 1

    def read(self, branch: str) -> list[dict]:
        return self.snapshots[self.branches[branch]]

    def fast_forward(self, target: str, source: str) -> bool:
        """Only legal when target's current snapshot is an ancestor of source's -- Iceberg's own rule."""
        if self.branches[target] > self.branches[source]:
            return False
        self.branches[target] = self.branches[source]
        return True

    def time_travel_rollback(self, branch: str, to_snapshot: int) -> None:
        self.branches[branch] = to_snapshot


# ---- The audit step: reuse topic 16's diff-with-tolerance against the audit branch ----

def audit_passes(baseline_rows: list[dict], candidate_rows: list[dict], tolerance: float = 0.02) -> dict:
    baseline_total = sum(r["amount"] for r in baseline_rows)
    candidate_total = sum(r["amount"] for r in candidate_rows)
    row_count_ok = len(candidate_rows) == len(baseline_rows)
    total_within_tolerance = math.isclose(baseline_total, candidate_total, rel_tol=tolerance)
    no_negative_amounts = all(r["amount"] >= 0 for r in candidate_rows)
    passed = row_count_ok and total_within_tolerance and no_negative_amounts
    return {"row_count_ok": row_count_ok, "total_within_tolerance": total_within_tolerance, "no_negative_amounts": no_negative_amounts, "passed": passed}


def make_orders(n: int, seed: int = 0) -> list[dict]:
    rng = random.Random(seed)
    return [{"order_id": i, "amount": round(rng.uniform(5, 200), 2)} for i in range(n)]


def run_wap_good_write() -> dict:
    baseline = make_orders(100)
    table = SnapshotTable(baseline)
    table.create_branch("audit-branch")
    good_candidate = copy.deepcopy(baseline)  # an idempotent reprocessing run: the same real data, rewritten
    table.write("audit-branch", good_candidate)

    audit = audit_passes(table.read("main"), table.read("audit-branch"))
    assert audit["passed"] is True
    fast_forwarded = table.fast_forward("main", "audit-branch") if audit["passed"] else False
    assert fast_forwarded is True
    assert table.read("main") == good_candidate
    return {"audit": audit, "fast_forwarded": fast_forwarded, "main_now_matches_candidate": table.read("main") == good_candidate}


def run_wap_bad_write_blocked() -> dict:
    baseline = make_orders(100)
    table = SnapshotTable(baseline)
    production_before = copy.deepcopy(table.read("main"))
    table.create_branch("audit-branch")
    bad_candidate = copy.deepcopy(baseline)
    bad_candidate[5]["amount"] = -999.0  # a deliberately bad write: a real negative amount
    table.write("audit-branch", bad_candidate)

    audit = audit_passes(table.read("main"), table.read("audit-branch"))
    assert audit["passed"] is False
    assert audit["no_negative_amounts"] is False
    fast_forwarded = table.fast_forward("main", "audit-branch") if audit["passed"] else False
    assert fast_forwarded is False
    assert table.read("main") == production_before  # production genuinely never saw the bad write
    return {"audit": audit, "fast_forwarded": fast_forwarded, "production_untouched": table.read("main") == production_before}


# ---- Blue-green table swap: two full copies, one live, swapped atomically ----

def run_blue_green_swap() -> dict:
    blue = make_orders(50, seed=10)   # currently live
    green = make_orders(50, seed=11)  # being rebuilt, not yet serving traffic
    live_pointer = "blue"
    pointers = {"blue": blue, "green": green}

    def serve(pointer: str) -> list[dict]:
        return pointers[pointer]

    assert serve(live_pointer) == blue
    live_pointer = "green"  # the atomic swap: one pointer update, not a row-by-row migration
    assert serve(live_pointer) == green
    return {"served_before_swap": "blue", "served_after_swap": live_pointer, "swap_was_a_single_pointer_update": True}


# ---- Shadow run: new pipeline version diffed against old, before any traffic moves ----

def run_shadow_diff_before_cutover() -> dict:
    old_version_output = make_orders(200, seed=20)
    new_version_output_safe = make_orders(200, seed=20)  # byte-identical re-run: safe to cut over
    new_version_output_regressed = [dict(r, amount=round(r["amount"] * 1.20, 2)) if r["order_id"] % 5 == 0 else r for r in make_orders(200, seed=20)]

    safe_audit = audit_passes(old_version_output, new_version_output_safe)
    regressed_audit = audit_passes(old_version_output, new_version_output_regressed, tolerance=0.02)

    assert safe_audit["passed"] is True
    assert regressed_audit["passed"] is False  # caught in the shadow run, with zero production traffic ever touched
    return {"safe_shadow_run_would_cut_over": safe_audit["passed"], "regressed_shadow_run_blocked": not regressed_audit["passed"]}


# ---- Canary rollout: one partition first, measured, then expanded ----

def run_canary_rollout(n_partitions: int = 10) -> dict:
    error_rate_by_partition: dict[int, float] = {}
    rng = random.Random(42)
    bad_partition = 3
    for p in range(n_partitions):
        error_rate_by_partition[p] = 0.25 if p == bad_partition else rng.uniform(0.0, 0.02)

    canary_partition = 0
    canary_error_rate = error_rate_by_partition[canary_partition]
    canary_ok = canary_error_rate < 0.05
    expanded_partitions = [canary_partition] if canary_ok else []
    if canary_ok:
        for p in range(1, n_partitions):
            if error_rate_by_partition[p] < 0.05:
                expanded_partitions.append(p)
            else:
                break  # the rollout stops expanding the moment a partition looks bad

    assert canary_ok is True  # partition 0 itself was healthy, so the canary step correctly proceeded
    assert bad_partition not in expanded_partitions  # the bad partition, reached later, correctly halts the expansion
    return {"canary_partition": canary_partition, "canary_error_rate": round(canary_error_rate, 4), "expanded_to": expanded_partitions, "bad_partition_caught": bad_partition not in expanded_partitions}


# ---- Feature-flagged transform: toggled without a redeploy ----

def transform(rows: list[dict], new_logic_enabled: bool) -> list[dict]:
    if new_logic_enabled:
        return [dict(r, amount=round(r["amount"] * 1.08, 2)) for r in rows]  # the new, flagged-on logic
    return rows  # the old, default logic


def run_feature_flag_toggle() -> dict:
    rows = make_orders(20, seed=5)
    old_logic_output = transform(rows, new_logic_enabled=False)
    new_logic_output = transform(rows, new_logic_enabled=True)
    assert old_logic_output == rows
    assert new_logic_output != rows
    # the flag flips back to old logic instantly -- no redeploy, no new artifact, just a toggled value
    reverted_output = transform(rows, new_logic_enabled=False)
    assert reverted_output == old_logic_output
    return {"old_logic_matches_input": old_logic_output == rows, "new_logic_differs": new_logic_output != rows, "revert_is_instant": reverted_output == old_logic_output}


# ---- Rollback via time travel: one operation back to the exact prior snapshot ----

def run_time_travel_rollback() -> dict:
    table = SnapshotTable(make_orders(30, seed=30))
    good_snapshot_id = table.branches["main"]
    bad_rows = make_orders(30, seed=30)
    bad_rows[0]["amount"] = -1.0  # a bad publish that slipped through, needing a rollback
    table.write("main", bad_rows)
    assert any(r["amount"] < 0 for r in table.read("main"))

    table.time_travel_rollback("main", good_snapshot_id)  # one operation, not a manual row-by-row undo
    assert table.read("main") == table.snapshots[good_snapshot_id]
    assert all(r["amount"] >= 0 for r in table.read("main"))
    return {"rollback_restored_exact_prior_state": table.read("main") == table.snapshots[good_snapshot_id], "no_bad_rows_remain": all(r["amount"] >= 0 for r in table.read("main"))}


def verify_audit_branch_source() -> dict:
    text = " ".join((SOURCES_DIR / "iceberg-branching.txt").read_text().split())
    quote = "Writes are performed on a separate audit-branch independent from the main table history."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "WAP writes go to a separate audit branch, independent of the main table history", "quote": quote}


def verify_fast_forward_source() -> dict:
    text = " ".join((SOURCES_DIR / "iceberg-branching.txt").read_text().split())
    quote = "After validation, the main branch can be fastForward to the head of audit-branch to update the main table state."
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "main is fast-forwarded to the audit branch's head only after validation", "quote": quote}


def verify_wap_consumer_protection_source() -> dict:
    text = " ".join((SOURCES_DIR / "aws-wap.txt").read_text().split()).replace("’", "'")
    quote = "these updates aren't accessible to downstream users who can only access the main branch"
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "a write on the staging branch is inaccessible to downstream consumers until it is published", "quote": quote}


if __name__ == "__main__":
    good = run_wap_good_write()
    print(f"WAP good write: {good}")

    bad = run_wap_bad_write_blocked()
    print(f"\nWAP bad write blocked: {bad}")

    blue_green = run_blue_green_swap()
    print(f"\nblue-green swap: {blue_green}")

    shadow = run_shadow_diff_before_cutover()
    print(f"\nshadow run diffed before cutover: {shadow}")

    canary = run_canary_rollout()
    print(f"\ncanary rollout: {canary}")

    flag = run_feature_flag_toggle()
    print(f"\nfeature-flagged transform: {flag}")

    rollback = run_time_travel_rollback()
    print(f"\ntime-travel rollback: {rollback}")

    print()
    for fn in (verify_audit_branch_source, verify_fast_forward_source, verify_wap_consumer_protection_source):
        r = fn()
        print(f"Sourced: {r['claim']}")

    print()
    print("OK: a good write is audited and fast-forwarded into production; a bad write fails the same "
          "audit and production never sees it; a blue-green swap is one pointer update; a shadow run's "
          "diff catches a regression with zero production traffic touched; a canary rollout halts "
          "expansion the moment a partition looks bad; a feature flag reverts instantly; and a time-travel "
          "rollback restores the exact prior snapshot in one operation.")
