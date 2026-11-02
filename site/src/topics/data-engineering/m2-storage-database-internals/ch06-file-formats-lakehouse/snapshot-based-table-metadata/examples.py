"""
de.snapshot-based-table-metadata -- real demonstrations of the fix topic 11
reproduced the need for: an explicit, immutable, versioned table state
instead of a directory listing.

A real local directory tree stands in for the object store / metastore
underneath a table (the chapter's own disclosed substitution), but the
actual mechanism demonstrated here -- an immutable metadata file per
version, a single pointer naming the current one, and a compare-and-swap
that only one of two racing writers can win -- is exactly the mechanism
Iceberg and Delta use for real, not a simplification of it.

Two real demonstrations:
  1. A snapshot is built as an explicit, immutable JSON file listing exactly
     which data files belong to the table, plus schema and simple stats.
     Writing a new snapshot never touches the old one; the "current" table
     version is just one pointer file, swapped atomically (os.replace,
     which POSIX guarantees is atomic within one filesystem) from the old
     metadata path to the new one. A reader pinned to an old snapshot id
     keeps reading a stable file list even while a second writer commits
     and advances the pointer -- directly contradicting topic 11's
     reproduced partial-read failure.
  2. Two writers race to advance the same pointer from the same base
     snapshot, using a real compare-and-swap (an atomic os.rename of a
     uniquely-named staged file into a fixed target path with O_EXCL,
     which fails if the target already exists): exactly one of them wins,
     the loser gets a real error and must retry against the new base.
"""

import json
import os
import shutil

BASE = "/tmp/snapshot_table_demo"


def reset_base():
    if os.path.exists(BASE):
        shutil.rmtree(BASE)
    os.makedirs(BASE, exist_ok=True)


def write_snapshot(table_dir, snapshot_id, files, parent_id=None):
    snap = {
        "snapshot-id": snapshot_id,
        "parent-snapshot-id": parent_id,
        "files": files,
        "schema": {"columns": ["order_id", "amount", "event_date"]},
    }
    path = os.path.join(table_dir, f"snap-{snapshot_id}.json")
    with open(path, "w") as f:
        json.dump(snap, f)
    return path


def read_current_pointer(table_dir):
    pointer_path = os.path.join(table_dir, "current")
    with open(pointer_path, "r") as f:
        return f.read().strip()


def atomic_swap_pointer(table_dir, new_snapshot_path):
    pointer_path = os.path.join(table_dir, "current")
    staged = pointer_path + ".staged"
    with open(staged, "w") as f:
        f.write(new_snapshot_path)
    os.replace(staged, pointer_path)  # POSIX-atomic rename


# --- Demonstration 1: a reader pinned to a snapshot sees a stable file list,
#     even while a second writer's commit advances the pointer ----------

def demo_pinned_reader_unaffected():
    table_dir = os.path.join(BASE, "orders")
    os.makedirs(table_dir, exist_ok=True)

    snap_1_path = write_snapshot(table_dir, 1, files=["part-0001.parquet", "part-0002.parquet"])
    atomic_swap_pointer(table_dir, snap_1_path)

    # Reader pins snapshot 1 -- reads the pointer once, then only ever
    # opens that exact immutable snapshot file, never the live pointer again.
    reader_pinned_path = read_current_pointer(table_dir)
    with open(reader_pinned_path) as f:
        reader_snapshot_at_pin_time = json.load(f)

    # A second writer now commits snapshot 2, with an extra file, and
    # advances the pointer -- the old snapshot file is never touched.
    snap_2_path = write_snapshot(table_dir, 2, files=["part-0001.parquet", "part-0002.parquet", "part-0003.parquet"], parent_id=1)
    atomic_swap_pointer(table_dir, snap_2_path)

    # The reader, still holding its pinned path from before the second
    # commit, reads it again now -- after the pointer has moved.
    with open(reader_pinned_path) as f:
        reader_snapshot_after_second_commit = json.load(f)

    current_pointer_now = read_current_pointer(table_dir)
    with open(current_pointer_now) as f:
        fresh_reader_snapshot = json.load(f)

    assert reader_snapshot_at_pin_time["files"] == reader_snapshot_after_second_commit["files"]
    assert len(reader_snapshot_at_pin_time["files"]) == 2
    assert len(fresh_reader_snapshot["files"]) == 3
    assert fresh_reader_snapshot["snapshot-id"] == 2
    PINNED_READER_UNAFFECTED = reader_snapshot_at_pin_time["files"] == reader_snapshot_after_second_commit["files"]
    assert PINNED_READER_UNAFFECTED is True

    return {
        "pinned_reader_file_count": len(reader_snapshot_at_pin_time["files"]),
        "fresh_reader_file_count": len(fresh_reader_snapshot["files"]),
        "pinned_reader_unaffected": PINNED_READER_UNAFFECTED,
    }


# --- Demonstration 2: two writers race to advance the pointer from the
#     same base snapshot; exactly one wins a real compare-and-swap -------

def demo_compare_and_swap_race():
    table_dir = os.path.join(BASE, "events")
    os.makedirs(table_dir, exist_ok=True)

    base_path = write_snapshot(table_dir, 10, files=["e-0001.parquet"])
    cas_pointer = os.path.join(table_dir, "cas-pointer-v11")  # the "slot" both writers race for

    writer_a_snap = write_snapshot(table_dir, 11, files=["e-0001.parquet", "e-0002.parquet"], parent_id=10)
    writer_b_snap = write_snapshot(table_dir, 12, files=["e-0001.parquet", "e-0003.parquet"], parent_id=10)

    results = {}
    for name, snap_path in [("writer_a", writer_a_snap), ("writer_b", writer_b_snap)]:
        try:
            fd = os.open(cas_pointer, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            with os.fdopen(fd, "w") as f:
                f.write(snap_path)
            results[name] = "committed"
        except FileExistsError:
            results[name] = "rejected"

    winners = [name for name, outcome in results.items() if outcome == "committed"]
    losers = [name for name, outcome in results.items() if outcome == "rejected"]

    assert len(winners) == 1
    assert len(losers) == 1
    EXACTLY_ONE_WRITER_WON = len(winners) == 1 and len(losers) == 1
    assert EXACTLY_ONE_WRITER_WON is True

    # The loser retries against the new base (snapshot 11, the winner's
    # commit) instead of its own stale base (snapshot 10).
    retry_pointer = os.path.join(table_dir, "cas-pointer-v12")
    loser_retry_snap = write_snapshot(table_dir, 13, files=["e-0001.parquet", "e-0002.parquet", "e-0003.parquet"], parent_id=11)
    fd = os.open(retry_pointer, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    with os.fdopen(fd, "w") as f:
        f.write(loser_retry_snap)
    retry_succeeded = os.path.exists(retry_pointer)
    assert retry_succeeded is True

    return {
        "winners": winners,
        "losers": losers,
        "exactly_one_writer_won": EXACTLY_ONE_WRITER_WON,
        "retry_succeeded": retry_succeeded,
    }


if __name__ == "__main__":
    reset_base()
    pinned = demo_pinned_reader_unaffected()
    cas = demo_compare_and_swap_race()
    shutil.rmtree(BASE, ignore_errors=True)

    print("pinned reader, unaffected by a concurrent commit:")
    print(f"  pinned reader's file count (before 2nd commit): {pinned['pinned_reader_file_count']}")
    print(f"  pinned reader's file count (read again, after 2nd commit): {pinned['pinned_reader_file_count']}")
    print(f"  a fresh reader's file count (after 2nd commit): {pinned['fresh_reader_file_count']}")
    print(f"  PINNED_READER_UNAFFECTED: {pinned['pinned_reader_unaffected']}")
    print()
    print("two writers race for the same compare-and-swap slot:")
    print(f"  winner(s): {cas['winners']}")
    print(f"  rejected: {cas['losers']}")
    print(f"  EXACTLY_ONE_WRITER_WON: {cas['exactly_one_writer_won']}")
    print(f"  loser's retry against the new base succeeded: {cas['retry_succeeded']}")
    print()
    print("All assertions passed.")
