"""Toy streaming-to-lakehouse model: a commit-cadence writer that trades freshness against file
count on a fixed input volume, and an LSM-buffered writer (modeling Paimon's merge-on-compaction
layer) that absorbs the same commit cadence into far fewer physical files.
"""

import math


def commit_cadence_file_count(total_events, commit_interval_events):
    """A writer that seals one new table file every commit_interval_events events, the way an
    Iceberg or Delta sink commits a batch of buffered records on each checkpoint. Fewer events
    per commit means fresher data (a shorter wait before a write becomes visible) but more,
    smaller files for the same total volume."""
    file_count = math.ceil(total_events / commit_interval_events)
    avg_staleness_events = commit_interval_events / 2
    return file_count, avg_staleness_events


def lsm_buffered_file_count(total_events, commit_interval_events, compaction_batch):
    """The same commit cadence, but each committed file lands in an LSM buffer first; once
    compaction_batch small files accumulate, they merge into one compacted file, the way
    Paimon's LSM layer absorbs frequent small writes before they become final table files."""
    small_files = math.ceil(total_events / commit_interval_events)
    compacted_files = math.ceil(small_files / compaction_batch)
    return compacted_files


if __name__ == "__main__":
    total_events = 10_000

    files_slow, staleness_slow = commit_cadence_file_count(total_events, 1_000)
    files_fast, staleness_fast = commit_cadence_file_count(total_events, 500)
    print(
        f"commit every 1000 events: {files_slow} files, "
        f"average staleness {staleness_slow:.0f} events"
    )
    print(
        f"commit every 500 events: {files_fast} files, "
        f"average staleness {staleness_fast:.0f} events"
    )
    assert files_fast == files_slow * 2, "halving the commit interval should double the file count"
    assert staleness_fast == staleness_slow / 2, "halving the commit interval should halve staleness"

    naive_files = commit_cadence_file_count(total_events, 500)[0]
    lsm_files = lsm_buffered_file_count(total_events, 500, compaction_batch=5)
    print(
        f"same 500-event commit cadence, LSM-buffered and compacted in groups of 5: "
        f"{lsm_files} files, versus {naive_files} uncompacted"
    )
    assert lsm_files < naive_files, "LSM compaction should land far fewer files at the same commit cadence"
    assert lsm_files == naive_files // 5

    print(
        "freshness improves with a shorter commit interval, file count worsens with it, and "
        "an LSM buffer absorbs that same cadence into fewer files without changing when a "
        "write first becomes visible"
    )
