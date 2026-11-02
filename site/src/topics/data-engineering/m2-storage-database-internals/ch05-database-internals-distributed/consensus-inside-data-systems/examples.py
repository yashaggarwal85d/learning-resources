"""Executable claims for de.consensus-inside-data-systems.

No live lab of its own (CHAPTER.md): five real simulations -- majority quorum vs. unanimity under
node failures, a quorum loss refusing writes rather than guessing, the blast-radius difference
between one global consensus group and many independent per-range groups, and the real round-trip
cost difference between a single-group commit and a cross-range commit.
"""


class ConsensusGroup:
    """A minimal majority-quorum group: commits a write only if a majority of its members are
    reachable; unanimity requires every single member."""

    def __init__(self, group_id, num_members):
        self.group_id = group_id
        self.num_members = num_members
        self.unreachable = set()

    def majority_size(self):
        return self.num_members // 2 + 1

    def reachable_count(self):
        return self.num_members - len(self.unreachable)

    def can_commit_majority(self):
        return self.reachable_count() >= self.majority_size()

    def can_commit_unanimous(self):
        return self.reachable_count() == self.num_members


def majority_quorum_tolerates_failures_unanimity_does_not(num_members=5):
    """A cluster of five members can still commit a write with a majority of three reachable,
    even with two members down -- a rule requiring every member to ack cannot survive even one."""
    group = ConsensusGroup("g1", num_members)
    group.unreachable = {"m3", "m4"}  # two of five down; three reachable

    majority_can_commit = group.can_commit_majority()
    unanimous_can_commit = group.can_commit_unanimous()

    assert majority_can_commit, "a majority (3 of 5) should still be able to commit"
    assert not unanimous_can_commit, "unanimity should fail the moment any member is unreachable"
    return group.reachable_count(), group.majority_size(), majority_can_commit, unanimous_can_commit


def losing_quorum_refuses_writes_rather_than_guessing(num_members=5):
    """Drop below a majority of reachable members, and a correctly-built consensus group refuses
    the write outright -- it does not guess, and does not fall back to a smaller, unsafe quorum."""
    group = ConsensusGroup("g1", num_members)
    group.unreachable = {"m2", "m3", "m4"}  # three of five down; only two reachable

    def attempt_write(group, value):
        if not group.can_commit_majority():
            return "refused"
        return "committed"

    result = attempt_write(group, "order-42")

    assert result == "refused", (
        f"with only {group.reachable_count()} of {num_members} members reachable (below the "
        f"majority of {group.majority_size()}), the write must be refused, not attempted"
    )
    return group.reachable_count(), group.majority_size(), result


def a_single_global_consensus_group_halts_everything_on_quorum_loss(num_keys=1000):
    """A single, global consensus group covering an entire keyspace (etcd's own documented model
    for its whole dataset) halts writes to every key the moment that one group loses quorum --
    there is no smaller unit of availability than the whole group."""
    group = ConsensusGroup("global", 5)
    group.unreachable = {"m3", "m4", "m5"}  # quorum lost cluster-wide

    keys = [f"key-{i}" for i in range(num_keys)]
    writable_keys = [k for k in keys if group.can_commit_majority()]

    assert len(writable_keys) == 0, (
        "with the single global group below quorum, not one key in the keyspace should remain writable"
    )
    return num_keys, len(writable_keys)


def per_range_consensus_groups_isolate_the_blast_radius(num_ranges=10, num_members_per_range=5):
    """Splitting the keyspace into many independent consensus groups (one per range, as
    CockroachDB and TiKV document) means losing quorum in exactly one group only halts writes to
    that one range -- every other range keeps accepting writes normally."""
    ranges = [ConsensusGroup(f"range-{i}", num_members_per_range) for i in range(num_ranges)]
    ranges[3].unreachable = {"m3", "m4", "m5"}  # only range 3 loses quorum

    writable_ranges = [r for r in ranges if r.can_commit_majority()]
    halted_ranges = [r for r in ranges if not r.can_commit_majority()]

    assert len(halted_ranges) == 1, "exactly one range should have lost quorum"
    assert len(writable_ranges) == num_ranges - 1, (
        f"the other {num_ranges - 1} ranges should remain fully writable, unaffected by range 3's quorum loss"
    )
    return num_ranges, len(writable_ranges), len(halted_ranges)


def a_cross_range_commit_costs_more_round_trips_than_a_single_group_commit():
    """A write landing entirely inside one consensus group commits in a single round trip (the
    leader's proposal and the followers' acks); a transaction spanning two separate groups pays a
    two-phase-commit on top of that, at least doubling the round trips before it can commit."""

    def single_group_commit_round_trips():
        # one round trip: leader sends AppendEntries to followers, followers ack back
        return 1

    def cross_range_commit_round_trips(num_ranges_touched):
        # a two-phase commit across N ranges: a prepare round trip to every range's own leader,
        # then a commit round trip to every range's own leader, each of which still needs its
        # own single-group round trip to get a majority ack from its own followers
        prepare_round_trips = 1
        commit_round_trips = 1
        return (prepare_round_trips + commit_round_trips) * num_ranges_touched

    single = single_group_commit_round_trips()
    cross_two_ranges = cross_range_commit_round_trips(2)

    assert cross_two_ranges > single * 3, (
        f"a two-range cross-range commit ({cross_two_ranges} round trips) should cost "
        f"substantially more than a single-group commit ({single} round trip)"
    )
    return single, cross_two_ranges


def main():
    reachable, majority, maj_ok, unan_ok = majority_quorum_tolerates_failures_unanimity_does_not()
    print(f"majority vs unanimity: {reachable} of 5 reachable (majority {majority}) -> majority commits: {maj_ok}, unanimous commits: {unan_ok}")

    reachable2, majority2, result = losing_quorum_refuses_writes_rather_than_guessing()
    print(f"losing quorum: {reachable2} of 5 reachable (majority {majority2}) -> write {result}")

    num_keys, writable = a_single_global_consensus_group_halts_everything_on_quorum_loss()
    print(f"single global group below quorum: {writable} of {num_keys} keys remain writable")

    num_ranges, writable_ranges, halted_ranges = per_range_consensus_groups_isolate_the_blast_radius()
    print(f"per-range groups: {halted_ranges} of {num_ranges} ranges halted, {writable_ranges} stay writable")

    single, cross = a_cross_range_commit_costs_more_round_trips_than_a_single_group_commit()
    print(f"commit cost: single-group {single} round trip vs cross-range (two ranges) {cross} round trips")

    print("consensus-inside-data-systems examples: all checks pass")


if __name__ == "__main__":
    main()
