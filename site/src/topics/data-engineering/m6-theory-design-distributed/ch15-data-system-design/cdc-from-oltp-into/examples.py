"""Lab for de.cdc-from-oltp-into.

The replication-slot WAL-growth simulation (retained WAL over time while
the consumer is stopped, with and without a cap and a heartbeat) and the
merge-throughput estimate are this topic's executable evidence, alongside
the compaction-to-slot interaction a stalled merge job creates.
"""


def retained_wal(hours_stopped, wal_bytes_per_hour):
    """A replication slot retains every byte of WAL since its last
    confirmed position — the slot's own guarantee, which is what a
    stopped connector turns into a growing liability.
    """
    return hours_stopped * wal_bytes_per_hour


def hours_until_cap(cap_bytes, wal_bytes_per_hour):
    """The time a stopped connector has before the slot's retained WAL
    reaches the configured cap.
    """
    if wal_bytes_per_hour <= 0:
        return None
    return cap_bytes / wal_bytes_per_hour


def slot_invalidated(retained_wal_bytes, cap_bytes):
    """Past the cap, the slot can no longer continue replication because
    the WAL it still needs has been removed — max_slot_wal_keep_size's own
    stated consequence.
    """
    return retained_wal_bytes > cap_bytes


def heartbeat_closes_quiet_gap(minutes_since_last_relevant_change, heartbeat_interval_minutes):
    """A heartbeat event advances the slot's confirmed position on an
    otherwise-quiet table, closing the gap a connector watching only the
    tracked tables would otherwise leave open.
    """
    return heartbeat_interval_minutes <= minutes_since_last_relevant_change


def merge_throughput_cost(changed_rows_per_run, cost_per_row_merged, fixed_overhead):
    """The merge's own cost per run: proportional to the changed rows, plus
    a fixed overhead the merge pays regardless of how many rows changed.
    """
    return changed_rows_per_run * cost_per_row_merged + fixed_overhead


def compaction_backlog(merge_runs, small_files_per_run, compaction_runs, files_removed_per_compaction):
    """Small delete and data files a row-level merge stream produces,
    net of what compaction has removed so far.
    """
    produced = merge_runs * small_files_per_run
    removed = compaction_runs * files_removed_per_compaction
    return max(produced - removed, 0)


def slot_growth_with_stalled_compaction(wal_bytes_per_hour, hours_stalled, merge_blocked):
    """A stalled compaction job slows the sink; once the sink falls far
    enough behind, the merge job itself stalls, which stalls slot
    consumption, which grows the source's WAL — the new interaction this
    design creates.
    """
    if not merge_blocked:
        return 0
    return retained_wal(hours_stalled, wal_bytes_per_hour)


def check():
    wal_rate = 2_000  # bytes/hour, a stated rate for the simulation
    cap = 50_000

    retained_at_stop = retained_wal(hours_stopped=10, wal_bytes_per_hour=wal_rate)
    assert retained_at_stop == 20_000
    assert slot_invalidated(retained_at_stop, cap) is False

    retained_long_stop = retained_wal(hours_stopped=30, wal_bytes_per_hour=wal_rate)
    assert retained_long_stop == 60_000
    assert slot_invalidated(retained_long_stop, cap) is True  # past the cap — forced re-snapshot

    hours_left = hours_until_cap(cap, wal_rate)
    assert hours_left == 25

    assert heartbeat_closes_quiet_gap(minutes_since_last_relevant_change=90, heartbeat_interval_minutes=60) is True
    assert heartbeat_closes_quiet_gap(minutes_since_last_relevant_change=30, heartbeat_interval_minutes=60) is False

    cost_small = merge_throughput_cost(changed_rows_per_run=100, cost_per_row_merged=2.0, fixed_overhead=500)
    cost_large = merge_throughput_cost(changed_rows_per_run=100_000, cost_per_row_merged=2.0, fixed_overhead=500)
    assert cost_small == 700
    assert cost_large == 200_500

    backlog_before = compaction_backlog(merge_runs=10, small_files_per_run=4, compaction_runs=0, files_removed_per_compaction=0)
    backlog_after = compaction_backlog(merge_runs=10, small_files_per_run=4, compaction_runs=2, files_removed_per_compaction=15)
    assert backlog_before == 40
    assert backlog_after == 10  # compaction caught most of it

    grown_while_stalled = slot_growth_with_stalled_compaction(wal_rate, hours_stalled=12, merge_blocked=True)
    not_grown_when_unblocked = slot_growth_with_stalled_compaction(wal_rate, hours_stalled=12, merge_blocked=False)
    assert grown_while_stalled == 24_000
    assert not_grown_when_unblocked == 0  # the interaction only fires when compaction has actually blocked the merge


if __name__ == "__main__":
    check()
    print("de.cdc-from-oltp-into: all checks passed")
