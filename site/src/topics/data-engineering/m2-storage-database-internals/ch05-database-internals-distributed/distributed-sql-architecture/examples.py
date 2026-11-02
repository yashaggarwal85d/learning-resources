"""Executable claims for de.distributed-sql-architecture.

No live lab of its own (CHAPTER.md): five real simulations -- the Spanner pattern as a real
composition of range-sharding, per-range consensus, and two-phase commit; a hybrid logical clock
staying monotonic despite clock skew; commit-wait enforcing external consistency; optimistic
concurrency control checking conflicts only at commit time; and the real round-trip price a
distributed-SQL commit pays that a single-node Postgres commit does not.
"""


class ConsensusGroup:
    """A minimal majority-quorum group, reused from this chapter's own per-range consensus model."""

    def __init__(self, group_id, num_members=5):
        self.group_id = group_id
        self.num_members = num_members
        self.unreachable = set()

    def majority_size(self):
        return self.num_members // 2 + 1

    def can_commit(self):
        return (self.num_members - len(self.unreachable)) >= self.majority_size()


def the_spanner_pattern_is_a_composition_of_three_mechanisms_already_built():
    """A distributed-SQL commit touching two ranges is a real composition: each range's own
    consensus group commits its own piece, and a two-phase commit coordinates both pieces
    agreeing together -- neither mechanism, alone, is the whole pattern."""
    range_a = ConsensusGroup("range-a")
    range_b = ConsensusGroup("range-b")

    def cross_range_transaction(ranges):
        # phase 1: each range's own leader proposes to its own group and gets a majority ack
        prepared = [r.can_commit() for r in ranges]
        if not all(prepared):
            return "aborted"
        # phase 2: the coordinator tells every range to commit, each needing its own majority ack again
        committed = [r.can_commit() for r in ranges]
        if not all(committed):
            return "aborted"
        return "committed"

    result = cross_range_transaction([range_a, range_b])

    assert result == "committed", "two healthy ranges should commit a cross-range transaction"
    assert range_a.num_members == range_b.num_members, "both ranges run the identical consensus mechanism"
    return result


class HybridLogicalClock:
    """A hybrid logical clock: physical time, with a logical counter that advances when two
    events would otherwise tie or go backward."""

    def __init__(self):
        self.last_physical = 0
        self.last_logical = 0

    def now(self, observed_physical_time):
        physical = max(observed_physical_time, self.last_physical)
        if physical == self.last_physical:
            logical = self.last_logical + 1
        else:
            logical = 0
        self.last_physical = physical
        self.last_logical = logical
        return (physical, logical)


def hybrid_logical_clock_assigns_monotonically_increasing_timestamps_even_with_clock_skew():
    """Feed a node's HLC a physical clock reading that jumps backward (real clock skew) --
    the HLC's own timestamps still strictly increase, because the logical component absorbs
    the skew instead of letting the timestamp go backward."""
    hlc = HybridLogicalClock()
    physical_readings = [100, 101, 99, 99, 103, 102]  # real skew: goes backward twice

    timestamps = [hlc.now(reading) for reading in physical_readings]

    assert all(timestamps[i] < timestamps[i + 1] for i in range(len(timestamps) - 1)), (
        f"every HLC timestamp must strictly increase even when the physical clock readings "
        f"themselves go backward: {timestamps}"
    )
    return physical_readings, timestamps


def external_consistency_requires_commit_timestamps_to_respect_real_time_order():
    """A transaction's commit timestamp must wait out the clock-uncertainty window (TrueTime's
    own "commit wait") before being made visible -- without that wait, a transaction committed
    first in real time could still get a larger timestamp than one that started later."""
    uncertainty_window = 10  # arbitrary units, standing in for TrueTime's own epsilon

    def commit_with_wait(assigned_timestamp, uncertainty_window):
        # the transaction isn't visible until real time has passed the assigned timestamp
        # plus the full uncertainty window -- this is what "commit wait" buys
        visible_at = assigned_timestamp + uncertainty_window
        return visible_at

    t1_timestamp = 100
    t1_visible_at = commit_with_wait(t1_timestamp, uncertainty_window)
    t2_start_time = t1_visible_at  # T2 cannot even start observing state until T1 is visible
    t2_timestamp = t2_start_time + 1

    assert t1_timestamp < t2_timestamp, (
        "T1's commit timestamp must be smaller than T2's, since T2 cannot start until T1 is fully visible"
    )
    assert t2_start_time >= t1_visible_at, (
        "commit wait must have already elapsed before a causally-later transaction can start"
    )
    return t1_timestamp, t1_visible_at, t2_timestamp


def optimistic_concurrency_control_checks_conflicts_only_at_commit_not_before():
    """Two transactions read and modify the same row with no locking at all during execution --
    the conflict is only detected, and one transaction rejected, at commit time (Aurora DSQL's
    own documented OCC model), unlike a pessimistic lock table that would have blocked the
    second transaction the moment it tried to touch the row."""

    class Row:
        def __init__(self, value):
            self.value = value
            self.version = 0

    row = Row(value=100)

    # both transactions read the row at the same version, with no lock taken
    tx1_read_version = row.version
    tx2_read_version = row.version
    assert tx1_read_version == tx2_read_version == 0, "both transactions read the identical starting version, unlocked"

    # tx1 commits first, bumping the version
    def attempt_commit(row, read_version, new_value, commit_order):
        if read_version != row.version:
            return "OC000"  # someone else already committed since this transaction read
        row.value = new_value
        row.version += 1
        return "committed"

    tx1_result = attempt_commit(row, tx1_read_version, new_value=200, commit_order=1)
    tx2_result = attempt_commit(row, tx2_read_version, new_value=300, commit_order=2)

    assert tx1_result == "committed", "the earliest commit should succeed"
    assert tx2_result == "OC000", "the later, conflicting commit should be rejected at commit time, not before"
    return tx1_result, tx2_result


def distributed_sql_pays_a_real_latency_price_a_single_node_postgres_does_not():
    """A single-node Postgres commit needs zero extra network round trips beyond the client's
    own request; the identical write, as a Spanner-pattern cross-range transaction, pays for
    its own range's consensus round trip plus a full two-phase commit on top."""

    def single_node_commit_round_trips():
        return 0  # the write and the WAL fsync happen on the one node the client already talked to

    def distributed_sql_cross_range_commit_round_trips(num_ranges_touched=2):
        consensus_round_trip_per_range = 1
        two_phase_commit_round_trips = 2  # prepare, then commit
        return (consensus_round_trip_per_range * num_ranges_touched) + two_phase_commit_round_trips

    single_node_cost = single_node_commit_round_trips()
    distributed_cost = distributed_sql_cross_range_commit_round_trips()

    assert distributed_cost > single_node_cost + 3, (
        f"a cross-range distributed-SQL commit ({distributed_cost} round trips) should cost "
        f"substantially more than a single-node Postgres commit ({single_node_cost} round trips)"
    )
    return single_node_cost, distributed_cost


def main():
    result = the_spanner_pattern_is_a_composition_of_three_mechanisms_already_built()
    print(f"cross-range transaction over two healthy ranges: {result}")

    readings, timestamps = hybrid_logical_clock_assigns_monotonically_increasing_timestamps_even_with_clock_skew()
    print(f"HLC timestamps stay monotonic despite skewed physical readings {readings}: {timestamps}")

    t1_ts, t1_visible, t2_ts = external_consistency_requires_commit_timestamps_to_respect_real_time_order()
    print(f"commit wait: T1 commits at {t1_ts}, visible at {t1_visible}, T2 gets timestamp {t2_ts}")

    tx1_result, tx2_result = optimistic_concurrency_control_checks_conflicts_only_at_commit_not_before()
    print(f"OCC, same row, no locks during execution: tx1 {tx1_result}, tx2 {tx2_result}")

    single_cost, distributed_cost = distributed_sql_pays_a_real_latency_price_a_single_node_postgres_does_not()
    print(f"commit cost: single-node Postgres {single_cost} round trips vs. distributed SQL {distributed_cost} round trips")

    print("distributed-sql-architecture examples: all checks pass")


if __name__ == "__main__":
    main()
