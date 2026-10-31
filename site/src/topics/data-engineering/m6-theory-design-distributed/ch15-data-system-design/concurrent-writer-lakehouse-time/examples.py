"""Lab for de.concurrent-writer-lakehouse-time.

The writer-conflict simulation (conflict rate for overlapping versus
disjoint partition layouts, with a retry policy) and the retention-cost
estimate for a pinned history are this topic's executable evidence,
alongside the maintenance-versus-ingest scheduling check.
"""


def writers_conflict(partitions_a, partitions_b):
    """Two writers conflict exactly when their touched partitions overlap —
    the atomic-swap commit protocol's own cause of a retry or a failure.
    """
    return len(partitions_a & partitions_b) > 0


def conflict_rate(writer_runs):
    """Across a sequence of (partitions_a, partitions_b) writer-pair runs,
    the share that actually conflict.
    """
    if not writer_runs:
        return 0.0
    conflicts = sum(1 for a, b in writer_runs if writers_conflict(a, b))
    return conflicts / len(writer_runs)


def retry_outcome(attempts_available, conflicts_remaining):
    """A writer that conflicts retries until it succeeds or runs out of
    attempts; retrying doesn't change which files it touches, so a writer
    on fully overlapping partitions never resolves by retrying alone.
    """
    if conflicts_remaining <= 0:
        return "succeeded"
    if attempts_available <= 0:
        return "failed"
    return retry_outcome(attempts_available - 1, conflicts_remaining - 1)


def retention_cost(pinned_snapshot_bytes, cost_per_byte_per_day, days_pinned):
    """The cost of keeping one tagged snapshot past general expiry — the
    price a legal-hold tag pays without changing the policy for every
    other snapshot.
    """
    return pinned_snapshot_bytes * cost_per_byte_per_day * days_pinned


def maintenance_overlaps_ingest(maintenance_window, ingest_windows):
    """Maintenance is a writer too; it conflicts with ingest exactly when
    their time windows overlap, the same way two partition sets do.
    """
    m_start, m_end = maintenance_window
    for i_start, i_end in ingest_windows:
        if m_start < i_end and i_start < m_end:
            return True
    return False


def check():
    cdc_merge = {"p1", "p2"}
    compaction_overlapping = {"p2", "p3"}
    compaction_disjoint = {"p4", "p5"}

    assert writers_conflict(cdc_merge, compaction_overlapping) is True
    assert writers_conflict(cdc_merge, compaction_disjoint) is False

    overlapping_runs = [(cdc_merge, compaction_overlapping)] * 4
    disjoint_runs = [(cdc_merge, compaction_disjoint)] * 4
    assert conflict_rate(overlapping_runs) == 1.0
    assert conflict_rate(disjoint_runs) == 0.0

    assert retry_outcome(attempts_available=3, conflicts_remaining=2) == "succeeded"
    assert retry_outcome(attempts_available=1, conflicts_remaining=2) == "failed"  # retries exhausted, same files

    cost_short_hold = retention_cost(pinned_snapshot_bytes=1_000, cost_per_byte_per_day=0.01, days_pinned=5)
    cost_long_hold = retention_cost(pinned_snapshot_bytes=1_000, cost_per_byte_per_day=0.01, days_pinned=400)
    assert cost_short_hold == 50
    assert cost_long_hold == 4_000  # a legal hold held long pays proportionally more

    maintenance_clear = (10, 11)
    maintenance_colliding = (10, 12)
    ingest_windows = [(11, 13)]
    assert maintenance_overlaps_ingest(maintenance_clear, ingest_windows) is False
    assert maintenance_overlaps_ingest(maintenance_colliding, ingest_windows) is True


if __name__ == "__main__":
    check()
    print("de.concurrent-writer-lakehouse-time: all checks passed")
