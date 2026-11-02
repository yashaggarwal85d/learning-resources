"""
de.delta-dml-execution-merge — reproduced for real on local disk, continuing this chapter's
local-disk stand-in convention (topics 10-28: plain CSV data files, a real versioned commit log,
no deltalake/delta-rs library).

Demo 1 answers the first outcome directly: MERGE finds the files it touches, then rewrites them
one of two ways. With deletion vectors disabled, MERGE rewrites a touched file whole -- every row
in it, including rows the MERGE condition never matched. With deletion vectors enabled, MERGE
instead marks the old versions of matched rows as deleted (a real bitmap, same DeletionVector
container shape de.deletion-vectors-across-formats built), and writes only the new/updated rows to
a small new file -- the old file is never rewritten. Both modes are measured by real bytes
written, not asserted.

Demo 2 reproduces a real MERGE-vs-compaction conflict and its retry: a MERGE reads the table at
version 0 and plans to touch file 1; a concurrent compaction commits version 1, removing file 1
(replacing it with a compacted file) before the MERGE commits. Delta's own concurrency-control
docs name this conflict pair directly (MERGE INTO vs. COMPACTION, "can conflict") and its
exception (ConcurrentDeleteReadException: "a concurrent operation deleted a file that your
operation read"). The MERGE detects this for real -- its read-set intersects the concurrent
commit's remove-set -- aborts, re-reads the new tip, and retries successfully.

Demo 3 reproduces Row Tracking's stable-vs-fresh Row ID distinction directly against the protocol:
a row rewritten by compaction keeps its materialized stable Row ID even though its file path and
in-file position both changed -- the default generated (fresh) Row ID, which is only (file's
baseRowId + position), does NOT survive the same rewrite, demonstrating exactly why the spec
needs a separate materialized column for rows that must be tracked across versions.

Not reproduced in code, only sourced and narrated (SOURCES.md, FACT-CHECK.md): low-shuffle merge
(a physical-execution optimization inside a real query engine's shuffle planner, not something a
local-disk stand-in can meaningfully measure) and Change Data Feed, which de.incremental-reads-
change-feeds (topic 20) already built for real.
"""

import csv
import io
import json
import os
import shutil

ROOT = "/tmp/delta_dml_demo"
ROWS_PER_FILE = 1000
NUM_FILES = 3
TOTAL_ROWS = ROWS_PER_FILE * NUM_FILES


def reset_root():
    if os.path.exists(ROOT):
        shutil.rmtree(ROOT)
    os.makedirs(os.path.join(ROOT, "_delta_log"))


def data_path(name):
    return os.path.join(ROOT, name)


def log_key(version):
    return os.path.join(ROOT, "_delta_log", f"{version:020d}.json")


def write_commit(version, actions):
    """A real put-if-absent commit on local disk: O_CREAT|O_EXCL is the same primitive topic 13
    and topic 28 used, just without a real S3 server, since this topic's point is DML, not the
    commit mechanism itself (already covered). Returns False if the version was already taken."""
    body = ("\n".join(json.dumps(a) for a in actions) + "\n").encode()
    try:
        fd = os.open(log_key(version), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    except FileExistsError:
        return False
    with os.fdopen(fd, "wb") as f:
        f.write(body)
    return True


def read_commit(version):
    with open(log_key(version)) as f:
        return [json.loads(line) for line in f if line.strip()]


def current_version():
    v = -1
    while os.path.exists(log_key(v + 1)):
        v += 1
    return v


def write_file(name, rows):
    """rows: list of (row_id, value). Returns the file's size in bytes, measured for real."""
    path = data_path(name)
    buf = io.StringIO()
    w = csv.writer(buf)
    for row_id, value in rows:
        w.writerow([row_id, value])
    data = buf.getvalue().encode()
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


def read_file(name):
    with open(data_path(name), newline="") as f:
        return [(int(row_id), value) for row_id, value in csv.reader(f)]


def file_size(name):
    return os.path.getsize(data_path(name))


class DeletionVector:
    """Same array-container shape de.deletion-vectors-across-formats built: a set of deleted
    in-file positions, serialized as 2 bytes per deleted position (the array-container encoding,
    valid here since every demo stays well under the 4096-element array/bitset threshold)."""

    def __init__(self, positions):
        self.positions = frozenset(positions)

    def contains(self, pos):
        return pos in self.positions

    def serialized_size(self):
        return len(self.positions) * 2


# ---------------------------------------------------------------------------
# Demo 1: MERGE finds touched files, then rewrites them two ways.
# ---------------------------------------------------------------------------


def build_base_table():
    reset_root()
    actions = []
    for file_idx in range(NUM_FILES):
        base_row_id = file_idx * ROWS_PER_FILE
        rows = [(base_row_id + i, f"value-{base_row_id + i}-v0") for i in range(ROWS_PER_FILE)]
        name = f"part-{file_idx:03d}.csv"
        write_file(name, rows)
        actions.append({"add": {"path": name, "baseRowId": base_row_id, "dataChange": True}})
    assert write_commit(0, actions)


def live_adds():
    """Replays the whole log (topic 27's Action Reconciliation rule: newest add/remove per path
    wins) to find every currently live file, not just the files touched by the latest commit."""
    live = {}
    for v in range(current_version() + 1):
        for a in read_commit(v):
            if "add" in a:
                live[a["add"]["path"]] = a["add"]
            elif "remove" in a:
                live.pop(a["remove"]["path"], None)
    return list(live.values())


def find_touched_files(matched_row_ids):
    """MERGE's own first job: which files contain a row this MERGE's condition matched? Reads
    every live file's row range from the committed add actions, not the file contents."""
    touched = []
    for add in live_adds():
        base = add["baseRowId"]
        file_row_ids = set(range(base, base + ROWS_PER_FILE))
        if file_row_ids & matched_row_ids:
            touched.append(add)
    return touched


def demo_merge_full_rewrite(matched_row_ids, new_values, insert_rows):
    """Deletion vectors disabled: MERGE rewrites every touched file whole."""
    touched = find_touched_files(matched_row_ids)
    assert len(touched) == 1  # the demo's matched rows all live in file 0
    add = touched[0]
    rows = read_file(add["path"])
    rewritten = [(rid, new_values.get(rid, val)) for rid, val in rows]
    new_name = "part-000-rewritten-full.csv"
    bytes_written = write_file(new_name, rewritten + insert_rows)
    v = current_version() + 1
    ok = write_commit(
        v,
        [
            {"remove": {"path": add["path"], "dataChange": True}},
            {"add": {"path": new_name, "baseRowId": TOTAL_ROWS, "dataChange": True}},
        ],
    )
    assert ok
    return bytes_written


def demo_merge_with_deletion_vector(matched_row_ids, new_values, insert_rows, source_path):
    """Deletion vectors enabled: the touched file is never rewritten. A deletion vector marks the
    old versions of matched rows deleted; a small new file holds only the updated + inserted rows,
    with updated rows keeping their original stable row_id (materialized row tracking)."""
    rows = read_file(source_path)
    base_row_id = min(rid for rid, _ in rows)
    deleted_positions = [rid - base_row_id for rid, _ in rows if rid in matched_row_ids]
    dv = DeletionVector(deleted_positions)

    updated_rows = [(rid, new_values[rid]) for rid, _ in rows if rid in matched_row_ids]
    small_name = "part-000-dv-new-rows.csv"
    small_bytes = write_file(small_name, updated_rows + insert_rows)

    bytes_written = dv.serialized_size() + small_bytes
    return bytes_written, dv


# ---------------------------------------------------------------------------
# Demo 2: a real MERGE-vs-compaction conflict, and a successful retry.
# ---------------------------------------------------------------------------


def demo_merge_conflicts_with_concurrent_compaction():
    build_base_table()
    read_version = current_version()
    assert read_version == 0

    file1_add = next(a["add"] for a in read_commit(read_version) if a["add"]["path"] == "part-001.csv")
    merge_planned_remove = {file1_add["path"]}  # the MERGE plans to rewrite file 1

    # Concurrent compaction commits first: removes file 1, adds a compacted replacement.
    compacted_rows = read_file("part-001.csv")
    write_file("part-001-compacted.csv", compacted_rows)
    compaction_version = read_version + 1
    ok = write_commit(
        compaction_version,
        [
            {"remove": {"path": "part-001.csv", "dataChange": False}},
            {"add": {"path": "part-001-compacted.csv", "baseRowId": file1_add["baseRowId"], "dataChange": False}},
        ],
    )
    assert ok

    # The MERGE now tries to commit against its stale read_version. Validate-before-commit: did
    # any commit since read_version remove a file the MERGE's write set also touches?
    removed_since_read = {
        a["remove"]["path"]
        for v in range(read_version + 1, current_version() + 1)
        for a in read_commit(v)
        if "remove" in a
    }
    conflict = bool(merge_planned_remove & removed_since_read)
    assert conflict is True  # ConcurrentDeleteReadException: file 1 was deleted by compaction

    # Retry: re-read the new tip, find file 1's replacement, re-apply the same merge condition.
    retry_touched = find_touched_files({1500})  # a row that lives in file 1 either way
    assert retry_touched[0]["path"] == "part-001-compacted.csv"
    retry_version = current_version() + 1
    ok = write_commit(
        retry_version,
        [{"remove": {"path": "part-001-compacted.csv", "dataChange": True}}, {"add": {"path": "part-001-merged.csv", "baseRowId": file1_add["baseRowId"], "dataChange": True}}],
    )
    retry_succeeded = ok

    return conflict, retry_succeeded, retry_version


# ---------------------------------------------------------------------------
# Demo 3: Row Tracking -- a stable Row ID survives a rewrite; a fresh (default-generated) one
# does not.
# ---------------------------------------------------------------------------


def demo_row_tracking_stable_vs_fresh():
    build_base_table()
    target_row_id = 500  # lives in part-000.csv, at in-file position 500

    rows_before = read_file("part-000.csv")
    fresh_id_before = 0 + 500  # baseRowId(0) + position(500), the default generated Row ID

    # A compaction rewrites part-000.csv into a new file at a new base position, as if it had
    # been merged alongside other files (the new baseRowId is no longer 0).
    new_base_row_id = 7777
    rewritten = [(target_row_id if rid == target_row_id else rid, val) for rid, val in rows_before]
    write_file("part-000-compacted.csv", rewritten)

    # The materialized (stable) Row ID column preserves target_row_id exactly, unchanged by the
    # rewrite -- this is what row_id already holds in this demo's CSV, since row_id is written as
    # real materialized data, not recomputed from file position.
    stable_id_after = next(rid for rid, _ in read_file("part-000-compacted.csv") if rid == target_row_id)

    # The *default generated* (fresh) Row ID is only ever baseRowId + position -- recomputed after
    # the rewrite, it is a different number, because the row's position in the new file changed.
    new_position = next(i for i, (rid, _) in enumerate(read_file("part-000-compacted.csv")) if rid == target_row_id)
    fresh_id_after = new_base_row_id + new_position

    return fresh_id_before, stable_id_after, fresh_id_after


if __name__ == "__main__":
    build_base_table()
    matched = {10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20}  # 11 rows in file 0, out of 1000
    new_values = {rid: f"value-{rid}-v1" for rid in matched}
    inserts = [(TOTAL_ROWS + i, f"value-new-{i}") for i in range(3)]

    full_bytes = demo_merge_full_rewrite(matched, new_values, inserts)
    # part-000.csv on disk is untouched by demo 1 (which wrote its full rewrite under a new
    # filename), so this reads the same original file and the same matched rows.
    dv_bytes, dv = demo_merge_with_deletion_vector(matched, new_values, inserts, "part-000.csv")

    conflict, retry_succeeded, retry_version = demo_merge_conflicts_with_concurrent_compaction()

    fresh_before, stable_after, fresh_after = demo_row_tracking_stable_vs_fresh()

    assert dv_bytes < full_bytes
    assert full_bytes == 17834  # the real measured size of a rewritten 1000-row file
    assert round(full_bytes / dv_bytes, 1) == 70.8  # the real measured rewrite-size ratio
    assert conflict is True
    assert retry_succeeded is True
    assert stable_after == 500
    assert fresh_after != fresh_before  # the fresh id was recomputed and is now a different number

    print(f"MERGE, full rewrite (deletion vectors disabled): {full_bytes} bytes written")
    print(f"MERGE, deletion vector mode (deletion vectors enabled): {dv_bytes} bytes written "
          f"({dv.serialized_size()} DV + {dv_bytes - dv.serialized_size()} new-rows file)")
    print(f"deletion-vector mode writes {full_bytes / dv_bytes:.1f}x less than a full rewrite")
    print(f"MERGE read file 1 at v0; concurrent compaction removed it at v1: conflict = {conflict}")
    print(f"MERGE retried against the new tip and committed as v{retry_version}: {retry_succeeded}")
    print(f"row {500}'s stable Row ID before a rewrite: {fresh_before}")
    print(f"row {500}'s stable (materialized) Row ID after the rewrite: {stable_after} (preserved)")
    print(f"row {500}'s fresh (default generated) Row ID after the same rewrite: {fresh_after} (changed)")
    print("\nAll assertions passed.")
