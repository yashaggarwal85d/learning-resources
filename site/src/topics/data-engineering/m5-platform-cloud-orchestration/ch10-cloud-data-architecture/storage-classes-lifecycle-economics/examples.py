"""Storage-tier pricing arithmetic and a local reproduction of the lifecycle-rule-vs-snapshot
corruption mechanism. Object Lock is sourced-only (see OUTLINE.md): its governance/compliance
enforcement needs a real cloud account's IAM, which this chapter's engine-of-record note already
scopes out of local reproduction.
"""

import os
import shutil
import tempfile


def early_deletion_fee_cool_tier():
    """Azure's own worked example: a blob moved to the cool tier (30-day minimum) and deleted
    after 21 days is charged for the remaining 9 days (30 - 21)."""
    minimum_days = 30
    days_held = 21
    days_charged = minimum_days - days_held
    assert days_charged == 9
    return {"minimum_days": minimum_days, "days_held": days_held, "days_charged": days_charged}


def early_deletion_fee_archive_tier():
    """Azure's own worked example: a blob moved to the archive tier (180-day minimum) and deleted
    after 45 days is charged for the remaining 135 days (180 - 45)."""
    minimum_days = 180
    days_held = 45
    days_charged = minimum_days - days_held
    assert days_charged == 135
    return {"minimum_days": minimum_days, "days_held": days_held, "days_charged": days_charged}


def _build_table(root):
    """A minimal local stand-in for a table: a data file, and a manifest that references it as
    part of one live snapshot."""
    os.makedirs(root, exist_ok=True)
    data_file = os.path.join(root, "part-00000.parquet")
    with open(data_file, "w") as f:
        f.write("data")
    manifest = {"snapshot": {"id": "snap-1", "files": [data_file]}, "age_days": {data_file: 95}}
    return data_file, manifest


def _lifecycle_delete_older_than(manifest, cutoff_days):
    """A time-based lifecycle rule: deletes any file older than cutoff_days, directly off disk,
    with no knowledge of any table manifest."""
    for path, age in list(manifest["age_days"].items()):
        if age >= cutoff_days and os.path.exists(path):
            os.remove(path)


def _expire_snapshot(manifest):
    """The table format's own maintenance operation: drops the snapshot's reference to files it
    no longer needs for time travel or rollback."""
    manifest["snapshot"]["files"] = []


def lifecycle_rule_blind_to_snapshot_corrupts_table():
    """Broken order: the lifecycle rule deletes a file (age 95 >= cutoff 90) while a live
    snapshot still references it. The table is now corrupt: the manifest points at a missing
    file. Reproduces the hook (step 1)."""
    root = tempfile.mkdtemp()
    try:
        data_file, manifest = _build_table(root)
        _lifecycle_delete_older_than(manifest, cutoff_days=90)

        still_referenced = data_file in manifest["snapshot"]["files"]
        file_exists = os.path.exists(data_file)
        corrupted = still_referenced and not file_exists
        assert corrupted is True
        return {"still_referenced": still_referenced, "file_exists": file_exists, "corrupted": corrupted}
    finally:
        shutil.rmtree(root, ignore_errors=True)


def expire_snapshot_before_lifecycle_rule_prevents_corruption():
    """Fixed order: expire_snapshots runs first, dropping the file's only reference, before the
    time-based lifecycle rule runs. No corruption, because nothing live points at the deleted
    file anymore."""
    root = tempfile.mkdtemp()
    try:
        data_file, manifest = _build_table(root)
        _expire_snapshot(manifest)
        _lifecycle_delete_older_than(manifest, cutoff_days=90)

        still_referenced = data_file in manifest["snapshot"]["files"]
        file_exists = os.path.exists(data_file)
        corrupted = still_referenced and not file_exists
        assert corrupted is False
        assert still_referenced is False
        return {"still_referenced": still_referenced, "file_exists": file_exists, "corrupted": corrupted}
    finally:
        shutil.rmtree(root, ignore_errors=True)


def retrieval_windows_by_tier():
    """The sourced typical-completion windows for Expedited/Standard/Bulk retrieval, encoded as
    plain data (hours), matching AWS's own documented figures exactly. Not a live measurement."""
    windows_hours = {
        "flexible_retrieval": {"expedited_max": 5 / 60, "standard_max": 5, "bulk_max": 12},
        "deep_archive": {"standard_max": 12, "bulk_max": 48},
    }
    assert windows_hours["flexible_retrieval"]["standard_max"] == 5
    assert windows_hours["flexible_retrieval"]["bulk_max"] == 12
    assert windows_hours["deep_archive"]["standard_max"] == 12
    assert windows_hours["deep_archive"]["bulk_max"] == 48
    return windows_hours


def main():
    results = {}
    results["early_deletion_fee_cool_tier"] = early_deletion_fee_cool_tier()
    results["early_deletion_fee_archive_tier"] = early_deletion_fee_archive_tier()
    results["lifecycle_rule_blind_to_snapshot_corrupts_table"] = lifecycle_rule_blind_to_snapshot_corrupts_table()
    results["expire_snapshot_before_lifecycle_rule_prevents_corruption"] = expire_snapshot_before_lifecycle_rule_prevents_corruption()
    results["retrieval_windows_by_tier"] = retrieval_windows_by_tier()
    for name, value in results.items():
        print(f"{name}: {value}")
    print("\nAll examples passed.")


if __name__ == "__main__":
    main()
