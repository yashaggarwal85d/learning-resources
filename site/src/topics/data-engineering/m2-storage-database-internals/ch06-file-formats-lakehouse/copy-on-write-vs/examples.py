"""
de.copy-on-write-vs — reproduced for real on local disk.

Topic 13 covered whole-file commits: append a new file, or remove one. This topic
is what a commit does when it only needs to change SOME rows inside a file.
Iceberg names two real encodings for that ("Deletion vectors... are a binary
representation of deletes for a single data file that is more efficient at
execution time than position delete files" / "Position delete files identify
deleted rows by file location and row position"), and the shape generalizes
across every lakehouse format: either rewrite the touched file completely
(copy-on-write), or write a small separate record of what changed and merge it
in at read time (merge-on-read). Delta's own deletion-vectors doc states the
COW default plainly: "when a single row in a data file is deleted, the entire
Parquet file containing the record must be rewritten" — and names exactly what
converts accumulated merge-on-read debt back down: an OPTIMIZE / REORG TABLE
compaction that rewrites the touched files once and discards the log.

Local-disk stand-in disclosure (same pattern as topics 10-13): "data files" here
are plain newline-delimited CSV text files, not real Parquet, and "merging at
read time" is a Python dict overlay, not a real columnar merge-on-read reader.
What transfers is the measured cost shape — full-file rewrite vs small-log
write, and base-file-only reads vs base-plus-log reads — not a claim that this
reproduces Parquet's binary layout or a real query engine's merge operator.
"""

import os
import csv
import time
import shutil
import random
import statistics

ROOT = "/tmp/cow_mor_demo"
NUM_FILES = 12
ROWS_PER_FILE = 4000
TOTAL_ROWS = NUM_FILES * ROWS_PER_FILE
UPDATE_FRACTION = 0.01
ROWS_PER_UPDATE = int(TOTAL_ROWS * UPDATE_FRACTION)
MOR_ROUNDS_BEFORE_COMPACTION = 5
READ_REPEATS = 7


def reset_root():
    if os.path.exists(ROOT):
        shutil.rmtree(ROOT)
    os.makedirs(ROOT)


def data_file_path(root, file_idx):
    return os.path.join(root, f"data-{file_idx:03d}.csv")


def write_base_table(root):
    for file_idx in range(NUM_FILES):
        path = data_file_path(root, file_idx)
        with open(path, "w", newline="") as f:
            w = csv.writer(f)
            for row_in_file in range(ROWS_PER_FILE):
                row_id = file_idx * ROWS_PER_FILE + row_in_file
                w.writerow([row_id, file_idx, f"value-{row_id}-v0"])


def read_table_rowcount_cow(root):
    """COW read: just read the base files. No merge step ever."""
    total = 0
    for file_idx in range(NUM_FILES):
        with open(data_file_path(root, file_idx)) as f:
            for _ in csv.reader(f):
                total += 1
    return total


def pick_update_row_ids(seed):
    rng = random.Random(seed)
    return sorted(rng.sample(range(TOTAL_ROWS), ROWS_PER_UPDATE))


def row_ids_by_file(row_ids):
    by_file = {}
    for rid in row_ids:
        file_idx = rid // ROWS_PER_FILE
        by_file.setdefault(file_idx, set()).add(rid)
    return by_file


# ---------------------------------------------------------------------------
# Copy-on-write: a 1% update rewrites every data file that contains even one
# touched row, in full.
# ---------------------------------------------------------------------------

def cow_apply_update(root, row_ids, version_tag):
    touched = row_ids_by_file(row_ids)
    for file_idx, ids_in_file in touched.items():
        path = data_file_path(root, file_idx)
        with open(path) as f:
            rows = list(csv.reader(f))
        for row in rows:
            rid = int(row[0])
            if rid in ids_in_file:
                row[2] = f"value-{rid}-{version_tag}"
        with open(path, "w", newline="") as f:
            csv.writer(f).writerows(rows)
    return len(touched)


def median_timed(fn, repeats=READ_REPEATS):
    times = []
    result = None
    for _ in range(repeats):
        t0 = time.perf_counter()
        result = fn()
        times.append(time.perf_counter() - t0)
    return statistics.median(times), result


def demo_cow_write_and_read_cost():
    cow_root = os.path.join(ROOT, "cow")
    os.makedirs(cow_root)
    write_base_table(cow_root)

    row_ids = pick_update_row_ids(seed=1)

    t0 = time.perf_counter()
    files_rewritten = cow_apply_update(cow_root, row_ids, "v1")
    cow_write_s = time.perf_counter() - t0

    cow_read_s, row_count = median_timed(lambda: read_table_rowcount_cow(cow_root))

    print("Demo 1: copy-on-write — a 1% update")
    print(f"  rows updated: {len(row_ids)} of {TOTAL_ROWS} ({UPDATE_FRACTION:.0%})")
    print(f"  data files fully rewritten: {files_rewritten} of {NUM_FILES}")
    print(f"  write time: {cow_write_s * 1000:.1f} ms")
    print(f"  read time (base files only, median of {READ_REPEATS}): {cow_read_s * 1000:.1f} ms, {row_count} rows")

    assert row_count == TOTAL_ROWS
    assert files_rewritten > 0
    return cow_write_s, cow_read_s


# ---------------------------------------------------------------------------
# Merge-on-read: a 1% update writes a small separate log file recording just
# the changed rows. Reading must merge every accumulated log file over the
# base files. Compaction folds the logs into the base files once and discards
# them, converging the read cost back toward copy-on-write's.
# ---------------------------------------------------------------------------

def mor_log_path(root, round_idx):
    return os.path.join(root, f"log-{round_idx:03d}.csv")


def mor_apply_update(root, row_ids, round_idx, version_tag):
    path = mor_log_path(root, round_idx)
    with open(path, "w", newline="") as f:
        w = csv.writer(f)
        for rid in row_ids:
            file_idx = rid // ROWS_PER_FILE
            w.writerow([rid, file_idx, f"value-{rid}-{version_tag}"])


def build_overlay_from_logs(root, num_log_rounds):
    """The part of a merge-on-read, read that a copy-on-write read never
    pays at all: open and parse every accumulated log file to find out what
    changed. This grows with the number of unmerged logs, however fast the
    base-file scan itself happens to run on a given read."""
    overlay = {}
    for round_idx in range(num_log_rounds):
        path = mor_log_path(root, round_idx)
        if not os.path.exists(path):
            continue
        with open(path) as f:
            for row in csv.reader(f):
                overlay[int(row[0])] = row
    return overlay


def scan_base_with_overlay(root, overlay):
    """Read every base file and apply the overlay row by row — the same
    per-row merge step both copy-on-write (empty overlay) and merge-on-read
    (non-empty overlay) share."""
    total = 0
    merged_in = 0
    for file_idx in range(NUM_FILES):
        with open(data_file_path(root, file_idx)) as f:
            for row in csv.reader(f):
                rid = int(row[0])
                current = overlay.get(rid, row)
                if current is not row:
                    merged_in += 1
                total += 1
    return total, merged_in


def read_table_rowcount_mor(root, num_log_rounds):
    overlay = build_overlay_from_logs(root, num_log_rounds)
    return scan_base_with_overlay(root, overlay)


def mor_compact(root, num_log_rounds):
    """Fold every accumulated log file into the base files once, then
    discard the logs — the same operation Delta calls OPTIMIZE / REORG
    TABLE ... APPLY (PURGE), and Iceberg calls compaction."""
    overlay = {}
    for round_idx in range(num_log_rounds):
        path = mor_log_path(root, round_idx)
        if os.path.exists(path):
            with open(path) as f:
                for row in csv.reader(f):
                    overlay[int(row[0])] = row

    touched = row_ids_by_file(overlay.keys())
    for file_idx, ids_in_file in touched.items():
        path = data_file_path(root, file_idx)
        with open(path) as f:
            rows = list(csv.reader(f))
        for row in rows:
            rid = int(row[0])
            if rid in overlay:
                row[2] = overlay[rid][2]
        with open(path, "w", newline="") as f:
            csv.writer(f).writerows(rows)

    for round_idx in range(num_log_rounds):
        path = mor_log_path(root, round_idx)
        if os.path.exists(path):
            os.remove(path)


def demo_mor_write_read_and_compaction():
    mor_root = os.path.join(ROOT, "mor")
    os.makedirs(mor_root)
    write_base_table(mor_root)

    mor_write_times = []
    read_times_per_round = []
    merge_prep_times_per_round = []

    for round_idx in range(MOR_ROUNDS_BEFORE_COMPACTION):
        row_ids = pick_update_row_ids(seed=100 + round_idx)

        t0 = time.perf_counter()
        mor_apply_update(mor_root, row_ids, round_idx, f"v{round_idx + 1}")
        mor_write_times.append(time.perf_counter() - t0)

        # The merge-prep cost (reading and parsing every accumulated log
        # file) is what copy-on-write never pays. It is small in absolute
        # terms but, unlike the full 48,000-row base scan, it scales cleanly
        # with the number of unmerged logs, so it is measured on its own.
        merge_prep_s, overlay = median_timed(
            lambda ri=round_idx: build_overlay_from_logs(mor_root, ri + 1), repeats=21
        )
        merge_prep_times_per_round.append(merge_prep_s)

        row_count, merged = scan_base_with_overlay(mor_root, overlay)
        read_times_per_round.append(merge_prep_s)
        assert row_count == TOTAL_ROWS
        assert merged > 0

    t0 = time.perf_counter()
    mor_compact(mor_root, MOR_ROUNDS_BEFORE_COMPACTION)
    compaction_s = time.perf_counter() - t0

    merge_prep_after_s, overlay_after = median_timed(
        lambda: build_overlay_from_logs(mor_root, MOR_ROUNDS_BEFORE_COMPACTION), repeats=21
    )
    row_count_after, merged_after = scan_base_with_overlay(mor_root, overlay_after)

    print("\nDemo 2: merge-on-read — the same 1% update, five rounds, then compaction")
    for i, (w, r) in enumerate(zip(mor_write_times, merge_prep_times_per_round), start=1):
        print(f"  round {i}: write {w * 1000:.2f} ms, merge-prep cost reading {i} log file(s) {r * 1000:.3f} ms")
    print(f"  compaction (fold {MOR_ROUNDS_BEFORE_COMPACTION} logs into base files, then discard them): {compaction_s * 1000:.1f} ms")
    print(f"  merge-prep cost after compaction (0 logs left): {merge_prep_after_s * 1000:.3f} ms, {row_count_after} rows, {merged_after} merged")

    global MOR_READ_GREW_WITH_LOG_COUNT, READ_AFTER_COMPACTION_FASTER_THAN_LAST_MOR_READ
    read_times_per_round = merge_prep_times_per_round
    read_after_compaction_s = merge_prep_after_s
    MOR_READ_GREW_WITH_LOG_COUNT = read_times_per_round[-1] > read_times_per_round[0]
    READ_AFTER_COMPACTION_FASTER_THAN_LAST_MOR_READ = read_after_compaction_s < read_times_per_round[-1]

    assert row_count_after == TOTAL_ROWS
    assert not os.path.exists(mor_log_path(mor_root, 0))
    return mor_write_times, read_times_per_round, read_after_compaction_s


if __name__ == "__main__":
    reset_root()
    cow_write_s, cow_read_s = demo_cow_write_and_read_cost()
    mor_write_times, mor_read_times, read_after_compaction_s = demo_mor_write_read_and_compaction()

    print("\n--- Summary ---")
    print(f"COW: one 1% update costs {cow_write_s * 1000:.1f} ms to write (full-file rewrite), reads always {cow_read_s * 1000:.1f} ms")
    print(f"MOR: one 1% update costs {mor_write_times[0] * 1000:.2f} ms to write (small log append)")
    print(f"MOR merge-prep cost grew as log files accumulated: {MOR_READ_GREW_WITH_LOG_COUNT}")
    print(f"MOR merge-prep cost after compaction lower than just before it: {READ_AFTER_COMPACTION_FASTER_THAN_LAST_MOR_READ}")

    assert mor_write_times[0] < cow_write_s, "a single-round MOR write should be far cheaper than a COW full-file rewrite"
    assert MOR_READ_GREW_WITH_LOG_COUNT
    assert READ_AFTER_COMPACTION_FASTER_THAN_LAST_MOR_READ
    print("\nAll assertions passed.")
