"""
de.snapshot-lifecycle-time-travel -- real demonstrations of how far back a
snapshot-based table (topic 13's own immutable-metadata-file, atomic-pointer
model, reused directly here) lets you go, and how it eventually forgets.

A real local directory tree stands in for the object store underneath a
table (this chapter's own disclosed substitution). The mechanism itself --
an explicit snapshot chain, time travel by snapshot id or commit time,
rollback by moving the current pointer, expiring old snapshots, and
deleting data files no longer referenced by any remaining snapshot -- is
the real mechanism Iceberg's expireSnapshots/deleteOrphanFiles and Delta's
VACUUM/RESTORE use, not a simplification of it.

Four real demonstrations:
  1. Time travel by snapshot id and by timestamp, and rollback by each,
     reproduced on a real chain of snapshots.
  2. Expiring old snapshots and removing the data files they alone
     reference reclaims real, measured storage.
  3. A hard "GDPR" delete only rewrites the current snapshot -- the
     original file with the deleted row stays readable by time travel
     until the old snapshot referencing it is expired and vacuumed.
  4. A too-short retention window expires a snapshot a reader is still
     pinned to mid-read, and the read genuinely fails -- a real
     reproduction of Iceberg's and Delta's own documented danger.
"""

import json
import os
import shutil

BASE = "/tmp/snapshot_lifecycle_demo"
FILE_SIZE_BYTES = 40_000
T0 = 1_700_000_000  # an arbitrary fixed base commit time (seconds)
HOUR = 3600


def reset_base():
    if os.path.exists(BASE):
        shutil.rmtree(BASE)
    os.makedirs(BASE, exist_ok=True)


def create_data_file(table_dir, name, size_bytes=FILE_SIZE_BYTES):
    path = os.path.join(table_dir, name)
    with open(path, "wb") as f:
        f.write(b"x" * size_bytes)
    return path


def write_snapshot(table_dir, snapshot_id, files, commit_time, parent_id=None):
    snap = {
        "snapshot-id": snapshot_id,
        "parent-snapshot-id": parent_id,
        "commit-time": commit_time,
        "files": files,
    }
    path = os.path.join(table_dir, f"snap-{snapshot_id}.json")
    with open(path, "w") as f:
        json.dump(snap, f)
    return path


def read_current_pointer(table_dir):
    with open(os.path.join(table_dir, "current")) as f:
        return f.read().strip()


def atomic_swap_pointer(table_dir, new_snapshot_path):
    pointer_path = os.path.join(table_dir, "current")
    staged = pointer_path + ".staged"
    with open(staged, "w") as f:
        f.write(new_snapshot_path)
    os.replace(staged, pointer_path)


def all_snapshot_paths(table_dir):
    return [os.path.join(table_dir, n) for n in os.listdir(table_dir) if n.startswith("snap-") and n.endswith(".json")]


def time_travel_by_id(table_dir, snapshot_id):
    path = os.path.join(table_dir, f"snap-{snapshot_id}.json")
    with open(path) as f:  # raises FileNotFoundError once expired
        return json.load(f)


def time_travel_by_timestamp(table_dir, query_time):
    candidates = []
    for p in all_snapshot_paths(table_dir):
        with open(p) as f:
            snap = json.load(f)
        if snap["commit-time"] <= query_time:
            candidates.append(snap)
    if not candidates:
        raise LookupError("no snapshot committed at or before that timestamp")
    return max(candidates, key=lambda s: s["commit-time"])


def rollback_to_snapshot(table_dir, snapshot_id):
    path = os.path.join(table_dir, f"snap-{snapshot_id}.json")
    with open(path):  # raises FileNotFoundError if the target was already expired
        pass
    atomic_swap_pointer(table_dir, path)


def expire_snapshots_older_than(table_dir, cutoff_time, keep_ids):
    expired = []
    for p in all_snapshot_paths(table_dir):
        with open(p) as f:
            snap = json.load(f)
        if snap["commit-time"] < cutoff_time and snap["snapshot-id"] not in keep_ids:
            os.remove(p)
            expired.append(snap["snapshot-id"])
    return expired


def referenced_files(table_dir):
    refs = set()
    for p in all_snapshot_paths(table_dir):
        with open(p) as f:
            snap = json.load(f)
        refs.update(snap["files"])
    return refs


def remove_orphan_files(table_dir):
    refs = referenced_files(table_dir)
    deleted, reclaimed_bytes = [], 0
    for name in os.listdir(table_dir):
        if name.endswith(".bin") and name not in refs:
            path = os.path.join(table_dir, name)
            reclaimed_bytes += os.path.getsize(path)
            os.remove(path)
            deleted.append(name)
    return deleted, reclaimed_bytes


# --- Demonstration 1: time travel and rollback, by snapshot id and by
#     timestamp, on a real chain of three snapshots ----------------------

def demo_time_travel_and_rollback():
    table_dir = os.path.join(BASE, "orders")
    os.makedirs(table_dir, exist_ok=True)

    f1 = create_data_file(table_dir, "orders-0001.bin")
    snap1 = write_snapshot(table_dir, 1, files=["orders-0001.bin"], commit_time=T0)
    atomic_swap_pointer(table_dir, snap1)

    f2 = create_data_file(table_dir, "orders-0002.bin")
    snap2 = write_snapshot(table_dir, 2, files=["orders-0001.bin", "orders-0002.bin"], commit_time=T0 + 1 * HOUR, parent_id=1)
    atomic_swap_pointer(table_dir, snap2)

    f3 = create_data_file(table_dir, "orders-0003.bin")
    snap3 = write_snapshot(table_dir, 3, files=["orders-0001.bin", "orders-0002.bin", "orders-0003.bin"], commit_time=T0 + 2 * HOUR, parent_id=2)
    atomic_swap_pointer(table_dir, snap3)

    by_id = time_travel_by_id(table_dir, 1)
    by_timestamp = time_travel_by_timestamp(table_dir, T0 + 1 * HOUR + 1800)  # 30 min after snapshot 2

    assert len(by_id["files"]) == 1
    assert by_id["snapshot-id"] == 1
    assert len(by_timestamp["files"]) == 2
    assert by_timestamp["snapshot-id"] == 2

    rollback_to_snapshot(table_dir, 1)
    current_after_rollback = json.load(open(read_current_pointer(table_dir)))
    assert current_after_rollback["snapshot-id"] == 1
    assert len(current_after_rollback["files"]) == 1

    return {
        "time_travel_by_id_file_count": len(by_id["files"]),
        "time_travel_by_timestamp_snapshot_id": by_timestamp["snapshot-id"],
        "rolled_back_to_snapshot_id": current_after_rollback["snapshot-id"],
    }


# --- Demonstration 2: expiring old snapshots and removing the files they
#     alone referenced reclaims real, measured storage ------------------

def demo_expire_and_vacuum_reclaims_storage():
    table_dir = os.path.join(BASE, "events")
    os.makedirs(table_dir, exist_ok=True)

    create_data_file(table_dir, "events-0001.bin")
    snap1 = write_snapshot(table_dir, 101, files=["events-0001.bin"], commit_time=T0)
    atomic_swap_pointer(table_dir, snap1)

    create_data_file(table_dir, "events-0002.bin")
    snap2 = write_snapshot(table_dir, 102, files=["events-0001.bin", "events-0002.bin"], commit_time=T0 + 1 * HOUR, parent_id=101)
    atomic_swap_pointer(table_dir, snap2)

    # A compaction-style commit rewrites events-0001 and events-0002 into a
    # single new file; the old snapshots 101 and 102 are now the only
    # references keeping events-0001.bin and events-0002.bin alive.
    create_data_file(table_dir, "events-0003-compacted.bin")
    snap3 = write_snapshot(table_dir, 103, files=["events-0003-compacted.bin"], commit_time=T0 + 2 * HOUR, parent_id=102)
    atomic_swap_pointer(table_dir, snap3)

    before_expiry_size = os.path.getsize(os.path.join(table_dir, "events-0001.bin")) + os.path.getsize(os.path.join(table_dir, "events-0002.bin"))
    assert before_expiry_size == 2 * FILE_SIZE_BYTES

    expired_ids = expire_snapshots_older_than(table_dir, cutoff_time=T0 + 2 * HOUR, keep_ids={103})
    deleted_files, reclaimed_bytes = remove_orphan_files(table_dir)

    assert sorted(expired_ids) == [101, 102]
    assert sorted(deleted_files) == ["events-0001.bin", "events-0002.bin"]
    assert reclaimed_bytes == 2 * FILE_SIZE_BYTES
    assert os.path.exists(os.path.join(table_dir, "events-0003-compacted.bin"))

    time_travel_now_fails = False
    try:
        time_travel_by_id(table_dir, 101)
    except FileNotFoundError:
        time_travel_now_fails = True
    assert time_travel_now_fails is True

    return {
        "reclaimed_bytes": reclaimed_bytes,
        "expired_snapshot_ids": sorted(expired_ids),
        "time_travel_to_expired_snapshot_fails": time_travel_now_fails,
    }


# --- Demonstration 3: a hard "GDPR" delete rewrites the current snapshot,
#     but the original file stays reachable by time travel until the old
#     snapshot referencing it is expired and vacuumed -------------------

def demo_gdpr_delete_conflict_with_time_travel():
    table_dir = os.path.join(BASE, "customers")
    os.makedirs(table_dir, exist_ok=True)

    create_data_file(table_dir, "customers-0001-with-pii.bin")
    snap1 = write_snapshot(table_dir, 201, files=["customers-0001-with-pii.bin"], commit_time=T0)
    atomic_swap_pointer(table_dir, snap1)

    # The "right to be forgotten" commit: a new file rewritten without the
    # deleted customer's row becomes current. The PII file is not deleted.
    create_data_file(table_dir, "customers-0002-redacted.bin")
    snap2 = write_snapshot(table_dir, 202, files=["customers-0002-redacted.bin"], commit_time=T0 + 1 * HOUR, parent_id=201)
    atomic_swap_pointer(table_dir, snap2)

    pii_file_still_on_disk_after_delete_commit = os.path.exists(os.path.join(table_dir, "customers-0001-with-pii.bin"))
    pii_still_time_travelable = time_travel_by_id(table_dir, 201)["files"] == ["customers-0001-with-pii.bin"]
    assert pii_file_still_on_disk_after_delete_commit is True
    assert pii_still_time_travelable is True

    expire_snapshots_older_than(table_dir, cutoff_time=T0 + 1 * HOUR, keep_ids={202})
    _, reclaimed_bytes = remove_orphan_files(table_dir)

    pii_file_gone_after_vacuum = not os.path.exists(os.path.join(table_dir, "customers-0001-with-pii.bin"))
    pii_time_travel_now_fails = False
    try:
        time_travel_by_id(table_dir, 201)
    except FileNotFoundError:
        pii_time_travel_now_fails = True

    assert pii_file_gone_after_vacuum is True
    assert pii_time_travel_now_fails is True
    assert reclaimed_bytes == FILE_SIZE_BYTES

    return {
        "pii_file_survived_the_delete_commit": pii_file_still_on_disk_after_delete_commit,
        "pii_still_time_travelable_before_vacuum": pii_still_time_travelable,
        "pii_file_gone_after_vacuum": pii_file_gone_after_vacuum,
        "pii_time_travel_fails_after_vacuum": pii_time_travel_now_fails,
    }


# --- Demonstration 4: a retention window shorter than an in-flight read
#     expires the snapshot a reader is pinned to, and the read genuinely
#     fails -- Iceberg's and Delta's own documented danger, reproduced --

def demo_too_aggressive_cleanup_corrupts_reader():
    results = {}
    for label, retention_covers_the_read in [("too_short", False), ("long_enough", True)]:
        table_dir = os.path.join(BASE, f"reader_race_{label}")
        os.makedirs(table_dir, exist_ok=True)

        create_data_file(table_dir, "r-0001.bin")
        create_data_file(table_dir, "r-0002.bin")
        snap_a = write_snapshot(table_dir, 1, files=["r-0001.bin", "r-0002.bin"], commit_time=T0)
        atomic_swap_pointer(table_dir, snap_a)

        # The reader pins snapshot 1 -- it has read the file list, but has
        # not yet opened the data files themselves (an in-flight read).
        reader_pinned_path = read_current_pointer(table_dir)
        reader_file_list = json.load(open(reader_pinned_path))["files"]

        # A compaction commits snapshot 2, replacing both files with one.
        create_data_file(table_dir, "r-0003-compacted.bin")
        snap_b = write_snapshot(table_dir, 2, files=["r-0003-compacted.bin"], commit_time=T0 + 1 * HOUR, parent_id=1)
        atomic_swap_pointer(table_dir, snap_b)

        if not retention_covers_the_read:
            # Maintenance runs with a retention window shorter than the
            # reader's still-in-flight read, expiring snapshot 1 too soon.
            expire_snapshots_older_than(table_dir, cutoff_time=T0 + 1 * HOUR, keep_ids={2})
            remove_orphan_files(table_dir)

        read_failed = False
        try:
            for name in reader_file_list:
                with open(os.path.join(table_dir, name), "rb") as f:
                    f.read()
        except FileNotFoundError:
            read_failed = True

        if not retention_covers_the_read:
            # The reader finishes (or fails) before maintenance ever runs.
            pass
        results[label] = read_failed

    assert results["too_short"] is True
    assert results["long_enough"] is False

    return {
        "too_short_retention_corrupts_reader": results["too_short"],
        "long_enough_retention_reader_succeeds": not results["long_enough"],
    }


if __name__ == "__main__":
    reset_base()
    tt = demo_time_travel_and_rollback()
    expiry = demo_expire_and_vacuum_reclaims_storage()
    gdpr = demo_gdpr_delete_conflict_with_time_travel()
    reader = demo_too_aggressive_cleanup_corrupts_reader()
    shutil.rmtree(BASE, ignore_errors=True)

    print("time travel and rollback:")
    print(f"  time travel by id (snapshot 1) file count: {tt['time_travel_by_id_file_count']}")
    print(f"  time travel by timestamp resolved to snapshot: {tt['time_travel_by_timestamp_snapshot_id']}")
    print(f"  rolled back to snapshot id: {tt['rolled_back_to_snapshot_id']}")
    print()
    print("expire + vacuum reclaims real storage:")
    print(f"  reclaimed bytes: {expiry['reclaimed_bytes']}")
    print(f"  expired snapshot ids: {expiry['expired_snapshot_ids']}")
    print(f"  time travel to an expired snapshot fails: {expiry['time_travel_to_expired_snapshot_fails']}")
    print()
    print("GDPR delete vs. long time travel:")
    print(f"  PII file survived the delete commit: {gdpr['pii_file_survived_the_delete_commit']}")
    print(f"  still time-travelable before vacuum: {gdpr['pii_still_time_travelable_before_vacuum']}")
    print(f"  gone after vacuum: {gdpr['pii_file_gone_after_vacuum']}")
    print(f"  time travel fails after vacuum: {gdpr['pii_time_travel_fails_after_vacuum']}")
    print()
    print("too-aggressive cleanup vs. a pinned reader:")
    print(f"  too-short retention corrupts the reader: {reader['too_short_retention_corrupts_reader']}")
    print(f"  long-enough retention lets the reader succeed: {reader['long_enough_retention_reader_succeeds']}")
    print()
    print("All assertions passed.")
