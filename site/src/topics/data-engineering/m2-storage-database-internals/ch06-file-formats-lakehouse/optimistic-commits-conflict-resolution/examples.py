"""
de.optimistic-commits-conflict-resolution — reproduced for real on local disk.

Topic 12 showed that when two writers race for the same atomic pointer swap,
exactly one wins the swap itself (a bare compare-and-swap). This topic goes one
level deeper: what must the LOSER do next? Iceberg's "Commit Conflict Resolution
and Retry" section says the answer depends on the operation type — an append has
no requirements and can always be re-applied and retried, but a delete/replace
must re-verify that the specific files it touches are still in the table before
it can retry; if they are not, it must fail permanently rather than retry blindly.

Local-disk stand-in disclosure (same pattern as topics 10-12): there is no real
Iceberg/Delta catalog here. A JSON "snapshot" file lists the data files current
at that version, and `os.open(path, O_CREAT | O_EXCL)` on a "pointer" file
stands in for the catalog's compare-and-swap / check-and-put that a real
metastore performs. The specific thing that transfers to a real system is not
"local files are a catalog" — it is the validate-before-retry shape: an append's
validation condition is always true, so it is always safe to retry; a
delete/replace's validation condition depends on whether the files it named are
still present, so it is only safe to retry if they still are.
"""

import os
import json
import shutil

ROOT = "/tmp/optimistic_commit_demo"


def reset_root():
    if os.path.exists(ROOT):
        shutil.rmtree(ROOT)
    os.makedirs(ROOT)


def write_staged_snapshot(version, files):
    """Writes this writer's proposed snapshot to a uniquely-named file, so two
    writers racing for the same version never clobber each other's staged
    file — only the CAS below decides which one becomes canonical."""
    unique = f"{version}-{os.urandom(4).hex()}"
    path = os.path.join(ROOT, f"snapshot-{unique}.json")
    with open(path, "w") as f:
        json.dump({"version": version, "files": sorted(files)}, f)
    return os.path.basename(path)


def read_current_pointer():
    pointer_path = os.path.join(ROOT, "CURRENT")
    with open(pointer_path) as f:
        target = f.read().strip()
    with open(os.path.join(ROOT, target)) as f:
        return json.load(f)


def init_table(initial_files):
    reset_root()
    snap_name = write_staged_snapshot(0, initial_files)
    with open(os.path.join(ROOT, "CURRENT"), "w") as f:
        f.write(snap_name)


def try_atomic_swap(new_version, new_files):
    """Returns True if this writer won the compare-and-swap for new_version.
    Each writer stages its own snapshot file first (never shared), then races
    on a single CAS marker per version — only the winner's staged file is
    ever pointed to by CURRENT."""
    snap_name = write_staged_snapshot(new_version, new_files)
    cas_marker = os.path.join(ROOT, f"CAS-CLAIM-{new_version}")
    try:
        fd = os.open(cas_marker, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.close(fd)
    except FileExistsError:
        return False
    tmp = os.path.join(ROOT, f"CURRENT.tmp.{os.getpid()}")
    with open(tmp, "w") as f:
        f.write(snap_name)
    os.replace(tmp, os.path.join(ROOT, "CURRENT"))
    return True


# ---------------------------------------------------------------------------
# Demo 1: two concurrent appends — the loser re-validates and retries, and
# succeeds, because "append operations have no requirements and can always
# be applied" (Iceberg spec, Commit Conflict Resolution and Retry).
# ---------------------------------------------------------------------------

def demo_append_conflict_retries_successfully():
    init_table(["data-0001.parquet", "data-0002.parquet"])
    base = read_current_pointer()
    assert base["version"] == 0

    # Writer A stages an append of a new file, based on version 0.
    writer_a_new_files = set(base["files"]) | {"data-a-0003.parquet"}
    # Writer B stages a *different* append, also based on version 0.
    writer_b_new_files = set(base["files"]) | {"data-b-0003.parquet"}

    # Writer A wins the race for version 1.
    a_won = try_atomic_swap(1, writer_a_new_files)
    # Writer B races for the same version 1 slot and loses.
    b_won_v1 = try_atomic_swap(1, writer_b_new_files)

    assert a_won is True
    assert b_won_v1 is False

    # Writer B revalidates: its operation is an append, which the spec says
    # "can always be applied" — there is nothing to re-check against the new
    # base, so it just re-stages against version 1 and retries.
    new_base = read_current_pointer()
    assert new_base["version"] == 1
    assert "data-a-0003.parquet" in new_base["files"]
    retry_files = set(new_base["files"]) | {"data-b-0003.parquet"}
    b_retry_won = try_atomic_swap(2, retry_files)

    assert b_retry_won is True
    final = read_current_pointer()

    global APPEND_RETRY_SUCCEEDED, FINAL_FILE_COUNT_AFTER_APPEND_RETRY
    APPEND_RETRY_SUCCEEDED = b_retry_won
    FINAL_FILE_COUNT_AFTER_APPEND_RETRY = len(final["files"])

    print("Demo 1: append-vs-append conflict")
    print(f"  writer A won version 1: {a_won}")
    print(f"  writer B lost version 1, revalidated (append has no requirements), retried as version 2: {b_retry_won}")
    print(f"  final file count: {FINAL_FILE_COUNT_AFTER_APPEND_RETRY} (started with 2, both writers' files present)")
    assert final["files"] == sorted(
        ["data-0001.parquet", "data-0002.parquet", "data-a-0003.parquet", "data-b-0003.parquet"]
    )


# ---------------------------------------------------------------------------
# Demo 2: two concurrent deletes of the SAME file — the loser's retry fails
# permanently, because "delete operations must verify that specific files to
# delete are still in the table" and the file is already gone.
# ---------------------------------------------------------------------------

def demo_overlapping_delete_fails_permanently():
    init_table(["data-0001.parquet", "data-0002.parquet", "data-0003.parquet"])
    base = read_current_pointer()
    assert base["version"] == 0

    target_file = "data-0002.parquet"
    assert target_file in base["files"]

    # Writer A stages a delete of data-0002.parquet (e.g. a row-level delete
    # rewriting it away), based on version 0.
    writer_a_new_files = set(base["files"]) - {target_file}
    # Writer B stages a *different* delete that also removes data-0002.parquet
    # (e.g. a compaction rewriting the same file into a new one), also based
    # on version 0.
    writer_b_new_files = (set(base["files"]) - {target_file}) | {"data-0002-compacted.parquet"}

    a_won = try_atomic_swap(1, writer_a_new_files)
    b_won_v1 = try_atomic_swap(1, writer_b_new_files)

    assert a_won is True
    assert b_won_v1 is False

    # Writer B revalidates against the new current version: its delete
    # operation must verify that data-0002.parquet is still in the table.
    new_base = read_current_pointer()
    assert new_base["version"] == 1
    file_still_present = target_file in new_base["files"]

    global DELETE_RETRY_REJECTED_PERMANENTLY
    DELETE_RETRY_REJECTED_PERMANENTLY = not file_still_present

    print("Demo 2: delete-vs-delete conflict on the same file")
    print(f"  writer A won version 1, removed {target_file}: {a_won}")
    print(f"  writer B lost version 1; revalidating delete of {target_file} against new base...")
    print(f"  {target_file} still present in new base: {file_still_present}")
    print(f"  writer B's delete fails permanently (not retried): {DELETE_RETRY_REJECTED_PERMANENTLY}")

    assert file_still_present is False
    assert DELETE_RETRY_REJECTED_PERMANENTLY is True

    # Confirm the table stayed at version 1 — unlike demo 1, there is no
    # valid retry to stage, so no further atomic-swap attempt is made and
    # no CAS claim for version 2 is ever created.
    assert not os.path.exists(os.path.join(ROOT, "CAS-CLAIM-2"))
    final = read_current_pointer()
    assert final["version"] == 1
    assert final["files"] == sorted(["data-0001.parquet", "data-0003.parquet"])


if __name__ == "__main__":
    demo_append_conflict_retries_successfully()
    print()
    reset_root()
    demo_overlapping_delete_fails_permanently()
    print()
    print("All assertions passed.")
