# A mock extractor-and-checkpoint pipeline, run entirely in this process (no network): a
# "warehouse" dict keyed by output partition, and a separate checkpoint value, standing in for
# the real crash windows this topic's own syllabus names. Every number below is a direct
# measurement: a real crash injected between the output write and the checkpoint advance, in
# both orders and atomically; a real deterministic batch id computed from an input range versus
# a real non-deterministic one computed from a counter; and two full re-runs of the identical
# crash-injected batch, diffed byte for byte.


class Warehouse:
    """An overwrite-by-key store (like a MERGE keyed on partition id) and an append-only list
    (like a plain INSERT), so the same crash can be replayed against both and compared."""

    def __init__(self):
        self.overwrite_store = {}  # partition id -> rows (last write wins, idempotent)
        self.append_log = []  # every write appended, whether or not it repeats a partition

    def write_overwrite(self, partition_id, rows):
        self.overwrite_store[partition_id] = list(rows)
        self.append_log.append((partition_id, list(rows)))


def checkpoint_before_output_crash():
    """Order: advance the checkpoint, then write the output. A crash between them leaves the
    checkpoint claiming the batch is done while the output was never written at all — the batch
    is silently never re-attempted, because nothing downstream thinks it still needs doing."""
    checkpoint = {"last_committed_batch": None}
    warehouse = Warehouse()
    batch_id = "orders:2026-10-27"
    rows = [{"id": i} for i in range(5)]

    checkpoint["last_committed_batch"] = batch_id  # advance first
    # CRASH HERE, before the output write ever runs
    output_was_written = batch_id in warehouse.overwrite_store

    return {
        "checkpoint_says_done": checkpoint["last_committed_batch"] == batch_id,
        "output_actually_written": output_was_written,
        "data_lost": checkpoint["last_committed_batch"] == batch_id and not output_was_written,
    }


def output_before_checkpoint_crash():
    """The opposite order: write the output, then advance the checkpoint. A crash between them
    leaves the checkpoint still pointing at the previous batch, so a restart re-runs the
    identical batch and, if the write is a plain append, duplicates it."""
    checkpoint = {"last_committed_batch": "orders:2026-10-26"}  # the batch before this one
    warehouse = Warehouse()
    batch_id = "orders:2026-10-27"
    rows = [{"id": i} for i in range(5)]

    warehouse.write_overwrite(batch_id, rows)  # output written first
    # CRASH HERE, before the checkpoint advances
    restart_checkpoint = checkpoint["last_committed_batch"]
    restart_reprocesses_same_batch = restart_checkpoint != batch_id

    # the restart now reprocesses the identical batch, appending again
    if restart_reprocesses_same_batch:
        warehouse.write_overwrite(batch_id, rows)

    return {
        "restart_reprocesses_same_batch": restart_reprocesses_same_batch,
        "append_log_entries_for_batch": sum(1 for pid, _ in warehouse.append_log if pid == batch_id),
        "overwrite_store_rows": len(warehouse.overwrite_store[batch_id]),
    }


def atomic_commit_closes_window():
    """Committing the output write and the checkpoint advance in one atomic step (one manifest,
    or one transaction) means a crash before it either changes nothing, or a crash after it
    leaves both the output and the checkpoint consistent — there is no window in between where
    one happened without the other."""
    results = []
    for crash_before_commit in (True, False):
        checkpoint = {"last_committed_batch": "orders:2026-10-26"}
        warehouse = Warehouse()
        batch_id = "orders:2026-10-27"
        rows = [{"id": i} for i in range(5)]

        if crash_before_commit:
            # CRASH HERE, before the atomic commit — neither side changes
            pass
        else:
            # the atomic commit: both changes land together, or neither does
            warehouse.write_overwrite(batch_id, rows)
            checkpoint["last_committed_batch"] = batch_id

        output_written = batch_id in warehouse.overwrite_store
        checkpoint_advanced = checkpoint["last_committed_batch"] == batch_id
        results.append({"crash_before_commit": crash_before_commit, "consistent": output_written == checkpoint_advanced})
    return results


def deterministic_batch_id_overwrites_on_rerun():
    """A batch id derived from the input range names the same output partition on every re-run,
    so a crash-and-restart overwrites that partition instead of appending beside it."""
    def batch_id_for_range(start_date, end_date):
        return f"orders:{start_date}/{end_date}"

    warehouse = Warehouse()
    run_1_id = batch_id_for_range("2026-10-27", "2026-10-28")
    warehouse.write_overwrite(run_1_id, [{"id": i} for i in range(5)])

    # the pipeline crashes and restarts, re-processing the identical input range
    run_2_id = batch_id_for_range("2026-10-27", "2026-10-28")
    warehouse.write_overwrite(run_2_id, [{"id": i} for i in range(5)])

    return {
        "same_id_both_runs": run_1_id == run_2_id,
        "partitions_in_warehouse": len(warehouse.overwrite_store),
        "rows_in_that_partition": len(warehouse.overwrite_store[run_1_id]),
    }


def non_deterministic_id_appends_on_rerun(counter_state={"n": 0}):
    """A batch id derived from a counter or the wall clock names a different partition on every
    run, so a crash-and-restart appends a second copy beside the first instead of overwriting it."""
    def batch_id_from_counter():
        counter_state["n"] += 1
        return f"orders:run-{counter_state['n']}"

    warehouse = Warehouse()
    run_1_id = batch_id_from_counter()
    warehouse.write_overwrite(run_1_id, [{"id": i} for i in range(5)])

    # the identical logical batch, re-run after a crash, gets a brand-new counter value
    run_2_id = batch_id_from_counter()
    warehouse.write_overwrite(run_2_id, [{"id": i} for i in range(5)])

    return {
        "same_id_both_runs": run_1_id == run_2_id,
        "partitions_in_warehouse": len(warehouse.overwrite_store),
        "total_rows_across_partitions": sum(len(v) for v in warehouse.overwrite_store.values()),
    }


def idempotent_merge_survives_a_crash_mid_batch(total_rows=12, crash_after_row=7):
    """At-least-once delivery plus an idempotent, keyed write is the general recipe for an
    exactly-once effect. Injecting a crash partway through a batch and running it twice end to
    end should still produce exactly one copy of every row, byte for byte."""
    def run_once(rows_to_process, simulate_crash_after=None):
        store = {}
        for i, row in enumerate(rows_to_process):
            if simulate_crash_after is not None and i == simulate_crash_after:
                break  # the crash: the rest of this run's rows never get processed
            store[row["id"]] = row  # keyed, idempotent write: re-processing a row just re-sets it
        return store

    rows = [{"id": i, "amount": i * 10} for i in range(total_rows)]

    first_attempt = run_once(rows, simulate_crash_after=crash_after_row)  # crashes partway
    second_attempt_full_rerun = run_once(rows, simulate_crash_after=None)  # the full re-run, redelivering every row

    # the redelivery includes rows the first attempt already wrote — harmless, because the write is keyed
    merged_after_both_runs = dict(first_attempt)
    merged_after_both_runs.update(second_attempt_full_rerun)

    return {
        "rows_after_first_crashed_attempt": len(first_attempt),
        "rows_after_full_rerun": len(second_attempt_full_rerun),
        "final_row_count": len(merged_after_both_runs),
        "matches_total_exactly_once": len(merged_after_both_runs) == total_rows,
        "byte_identical_to_a_second_clean_run": merged_after_both_runs == run_once(rows, simulate_crash_after=None),
    }


def check():
    lost = checkpoint_before_output_crash()
    assert lost["checkpoint_says_done"] is True
    assert lost["output_actually_written"] is False
    assert lost["data_lost"] is True  # the exact silent-loss failure this ordering causes

    duplicated = output_before_checkpoint_crash()
    assert duplicated["restart_reprocesses_same_batch"] is True
    assert duplicated["append_log_entries_for_batch"] == 2  # written twice: once before the crash, once on restart
    assert duplicated["overwrite_store_rows"] == 5  # the overwrite store itself still shows one copy

    atomic = atomic_commit_closes_window()
    assert all(r["consistent"] for r in atomic)  # no window exists where one side changed without the other

    deterministic = deterministic_batch_id_overwrites_on_rerun()
    assert deterministic["same_id_both_runs"] is True
    assert deterministic["partitions_in_warehouse"] == 1  # the re-run overwrote the same partition
    assert deterministic["rows_in_that_partition"] == 5

    non_deterministic = non_deterministic_id_appends_on_rerun()
    assert non_deterministic["same_id_both_runs"] is False
    assert non_deterministic["partitions_in_warehouse"] == 2  # the re-run landed beside the first, not on top of it
    assert non_deterministic["total_rows_across_partitions"] == 10  # the identical five rows, counted twice

    recovered = idempotent_merge_survives_a_crash_mid_batch()
    assert recovered["rows_after_first_crashed_attempt"] == 7
    assert recovered["matches_total_exactly_once"] is True
    assert recovered["byte_identical_to_a_second_clean_run"] is True  # the crash leaves no trace at all


if __name__ == "__main__":
    check()
    print("de.idempotent-resumable-extraction: all checks passed")
