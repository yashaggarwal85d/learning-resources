"""
The hook's own four combinations, run as an ISR simulator: replication factor three, one
follower already dropped from the in-sync set, acks=all, and the leader plus the remaining
in-sync follower both failing together. Whether the acknowledged write survives depends only on
min.insync.replicas and whether unclean leader election is enabled -- nothing else. Also: an
Iceberg-style compare-and-swap commit, and why a losing writer retries instead of failing.
"""

from dataclasses import dataclass


@dataclass
class Replica:
    name: str
    in_sync: bool
    has_the_write: bool


def acks_all_commits_only_once_every_isr_member_has_it(isr: list[Replica], write_id: str) -> bool:
    return all(r.has_the_write for r in isr)


def survives_leader_failure(isr: list[Replica], out_of_sync: Replica, min_insync_replicas: int, unclean_election_enabled: bool) -> bool:
    # The leader and every other ISR member fail together, leaving only the out-of-sync replica.
    surviving = [out_of_sync]
    isr_alive = [r for r in isr if r in surviving]

    if not unclean_election_enabled:
        # Kafka's own design doc: wait for a replica in the ISR to come back, favoring
        # consistency over availability. The out-of-sync replica is NOT in the ISR, so the
        # partition stays unavailable -- the acknowledged write is still safe on a dead broker's
        # disk, waiting for it to come back.
        partition_available_now = len(isr_alive) > 0
        write_is_safe_though_unavailable = not partition_available_now
        return write_is_safe_though_unavailable or out_of_sync.has_the_write

    # Unclean leader election enabled: the first replica to come back becomes leader, even if
    # it was never in sync -- here, that is the out-of-sync replica, which never had the write.
    new_leader = out_of_sync
    return new_leader.has_the_write


def the_hooks_four_combinations():
    # Replication factor three: leader, one in-sync follower, one already-dropped follower.
    leader = Replica("leader", in_sync=True, has_the_write=False)
    in_sync_follower = Replica("in-sync-follower", in_sync=True, has_the_write=False)
    out_of_sync_follower = Replica("out-of-sync-follower", in_sync=False, has_the_write=False)
    isr = [leader, in_sync_follower]

    # acks=all with min.insync.replicas=2: the write is only acknowledged once both ISR members
    # (leader and in-sync-follower) have it.
    leader.has_the_write = True
    in_sync_follower.has_the_write = True
    acknowledged = acks_all_commits_only_once_every_isr_member_has_it(isr, "write-1")
    assert acknowledged
    print("write acknowledged: both ISR members (leader, in-sync follower) have it; min.insync.replicas=2 was satisfied")

    # Combination 1: min.insync.replicas=2, unclean election OFF.
    result_1 = survives_leader_failure(isr, out_of_sync_follower, min_insync_replicas=2, unclean_election_enabled=False)
    assert result_1
    print("min.insync.replicas=2, unclean election OFF: partition stays unavailable, write stays safe on a dead broker's disk")

    # Combination 2: min.insync.replicas=2, unclean election ON.
    result_2 = survives_leader_failure(isr, out_of_sync_follower, min_insync_replicas=2, unclean_election_enabled=True)
    assert not result_2
    print("min.insync.replicas=2, unclean election ON: the out-of-sync replica becomes leader, and the acknowledged write is gone")

    # Combination 3: min.insync.replicas=1 lets an ISR of just the leader acknowledge a write
    # that exists on only ONE broker -- a weaker starting point before any failure even happens.
    isr_of_one = [leader]
    leader.has_the_write = True
    weakly_acknowledged = acks_all_commits_only_once_every_isr_member_has_it(isr_of_one, "write-2")
    assert weakly_acknowledged
    print("min.insync.replicas=1: an ISR of just the leader can acknowledge a write that exists on a single broker")

    # Combination 4: min.insync.replicas=1, unclean election ON is the worst of both relaxations
    # stacked -- the same unclean-election loss above, starting from an even thinner guarantee.
    result_4 = survives_leader_failure(isr_of_one, out_of_sync_follower, min_insync_replicas=1, unclean_election_enabled=True)
    assert not result_4
    print("min.insync.replicas=1, unclean election ON: the weakest combination stacks both relaxations together")


def isr_needs_fewer_replicas_than_majority_vote_for_the_same_failure_tolerance():
    failures_to_tolerate = 1
    majority_vote_replicas_needed = 2 * failures_to_tolerate + 1
    isr_replicas_needed = failures_to_tolerate + 1
    assert majority_vote_replicas_needed == 3
    assert isr_replicas_needed == 2
    print("to tolerate one failure, majority vote needs", majority_vote_replicas_needed, "replicas; the ISR approach needs", isr_replicas_needed)


def iceberg_commit_as_compare_and_swap():
    catalog_pointer = {"current_metadata": "metadata-v1.json"}

    def commit(base_metadata: str, new_metadata: str) -> bool:
        if catalog_pointer["current_metadata"] != base_metadata:
            return False  # the swap's base is stale; the catalog has already moved on
        catalog_pointer["current_metadata"] = new_metadata
        return True

    # Writer A reads v1, builds v2, and commits -- succeeds, because the pointer still says v1.
    writer_a_commits = commit(base_metadata="metadata-v1.json", new_metadata="metadata-v2-a.json")
    assert writer_a_commits
    print("writer A's compare-and-swap succeeds: the pointer still matched A's base version")

    # Writer B also read v1 (concurrently, before A committed) and tries to commit its own v2 --
    # fails, because the pointer now says v2-a, not v1.
    writer_b_commits = commit(base_metadata="metadata-v1.json", new_metadata="metadata-v2-b.json")
    assert not writer_b_commits
    print("writer B's compare-and-swap fails: the pointer moved to A's version while B was building its own")
    print("B retries against the new current version rather than losing its work, which Iceberg's spec expects")


if __name__ == "__main__":
    the_hooks_four_combinations()
    isr_needs_fewer_replicas_than_majority_vote_for_the_same_failure_tolerance()
    iceberg_commit_as_compare_and_swap()
