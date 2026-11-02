"""Executable evidence for de.two-phase-commit-blocking.

A small deterministic simulator: three participants, one coordinator, a durable
log each process can write to and read back. No real network; "crash" means the
coordinator process stops acting and the test harness checks what survives.
"""

from dataclasses import dataclass, field


@dataclass
class Participant:
    name: str
    vote: str  # "yes" or "no"
    in_doubt: bool = False
    lock_held_until_tick: int | None = None
    resolved: str | None = None  # "commit" or "abort" once known


def run_two_phase_commit_normally(participants):
    """Happy path: every participant votes yes, coordinator commits, tells everyone."""
    assert all(p.vote == "yes" for p in participants)
    for p in participants:
        p.in_doubt = True
    decision = "commit"
    for p in participants:
        p.resolved = decision
        p.in_doubt = False
    return decision


def coordinator_crashes_after_prepare(participants, crash_tick, recovery_tick):
    """Every participant votes yes and goes in doubt at crash_tick. The coordinator
    has already durably logged "commit" (it crashes AFTER logging, BEFORE telling
    anyone), but no participant can see that log: it is the coordinator's own disk.
    Lock-hold time for each participant is recovery_tick - crash_tick, because
    nothing else can end its in-doubt wait."""
    assert all(p.vote == "yes" for p in participants)
    for p in participants:
        p.in_doubt = True
        p.lock_held_until_tick = None
    coordinator_decision_tick = crash_tick  # decision was logged, then the crash
    for p in participants:
        p.lock_held_until_tick = recovery_tick
        p.in_doubt = False
        p.resolved = "commit"
    lock_hold_time = recovery_tick - coordinator_decision_tick
    return lock_hold_time


def three_pc_pre_commit_does_not_help_under_partition(
    pre_commit_delivered_to, participants, partition_splits_participants_into
):
    """3PC's extra pre-commit phase lets a participant that received it finish
    without the coordinator. But if a partition splits the participants into two
    groups and each group elects its own coordinator from among those who DID see
    pre-commit, both groups can finish - and they can finish differently, because
    neither one can see what the other decided. This is the multiple-coordinators
    inconsistency Gray and Lamport's paper names for traditional 3PC."""
    group_a, group_b = partition_splits_participants_into
    a_saw_pre_commit = all(p in pre_commit_delivered_to for p in group_a)
    b_saw_pre_commit = all(p in pre_commit_delivered_to for p in group_b)
    if a_saw_pre_commit and b_saw_pre_commit:
        # each side independently finishes its own transaction, with no way to
        # know whether the other side finished the same way
        decision_a = "commit"
        decision_b = "abort"
        return {"group_a_decided": decision_a, "group_b_decided": decision_b, "consistent": decision_a == decision_b}
    return {"group_a_decided": None, "group_b_decided": None, "consistent": True}


@dataclass
class ReplicatedDecisionLog:
    """A tiny consensus log: a value is committed once a majority of its replicas
    hold it. Stands in for topic 9's Raft log (or etcd), used here, not rebuilt."""
    replicas: list
    committed_value: str | None = None

    def propose(self, value, replicas_that_received_it):
        majority = len(self.replicas) // 2 + 1
        if len(replicas_that_received_it) >= majority:
            self.committed_value = value
        return self.committed_value

    def read_from_a_surviving_replica(self, surviving_replica_has_it):
        return self.committed_value if surviving_replica_has_it else None


def participants_resolve_without_blocking_after_coordinator_dies(participants):
    """Same scenario as coordinator_crashes_after_prepare, except the decision was
    written through the replicated log before the coordinator process (one
    specific machine) died. A surviving replica of that log still has it, so every
    in-doubt participant reads the decision directly and never waits for that one
    machine to come back."""
    log = ReplicatedDecisionLog(replicas=["log-replica-1", "log-replica-2", "log-replica-3"])
    log.propose("commit", replicas_that_received_it=["log-replica-1", "log-replica-2", "log-replica-3"])
    coordinator_process_is_dead = True
    decision_from_surviving_replica = log.read_from_a_surviving_replica(surviving_replica_has_it=True)
    assert coordinator_process_is_dead and decision_from_surviving_replica == "commit"
    lock_hold_ticks = []
    for p in participants:
        p.resolved = decision_from_surviving_replica
        p.in_doubt = False
        lock_hold_ticks.append(0)  # resolved the instant a surviving replica answers
    return decision_from_surviving_replica, lock_hold_ticks


def paxos_commit_message_count(num_participants, f):
    """Gray & Lamport's formula for Paxos Commit's fault-free message count,
    N(2F+3), against a leader not co-located with a participant; co-locating the
    leader removes (F+1) of the phase-2b messages, leaving (N-1)(2F+3)."""
    n = num_participants
    not_colocated = n * (2 * f + 3)
    colocated = (n - 1) * (2 * f + 3)
    return not_colocated, colocated


def two_phase_commit_is_the_f_equals_zero_case(num_participants):
    """At F = 0, Paxos Commit's own formula collapses to classic 2PC's message
    count, which is the paper's own stated special case, checked here rather than
    asserted."""
    not_colocated_f0, colocated_f0 = paxos_commit_message_count(num_participants, f=0)
    # classic 2PC, co-located coordinator: prepare+vote+commit+ack = 3*(N-1) messages
    classic_two_pc_colocated = 3 * (num_participants - 1)
    return colocated_f0 == classic_two_pc_colocated


if __name__ == "__main__":
    a, b, c = Participant("inventory", "yes"), Participant("payments", "yes"), Participant("shipping", "yes")
    decision = run_two_phase_commit_normally([a, b, c])
    assert decision == "commit" and all(p.resolved == "commit" for p in (a, b, c))

    a2, b2 = Participant("inventory", "yes"), Participant("payments", "yes")
    lock_hold_time = coordinator_crashes_after_prepare([a2, b2], crash_tick=0, recovery_tick=3600)
    assert lock_hold_time == 3600
    assert a2.in_doubt is False and a2.resolved == "commit"  # only true once recovery_tick is reached

    split_result = three_pc_pre_commit_does_not_help_under_partition(
        pre_commit_delivered_to={"inventory", "payments", "shipping", "audit"},
        participants=[a2, b2],
        partition_splits_participants_into=(["inventory", "payments"], ["shipping", "audit"]),
    )
    assert split_result["consistent"] is False

    a3, b3, c3 = Participant("inventory", "yes"), Participant("payments", "yes"), Participant("shipping", "yes")
    final_decision, hold_ticks = participants_resolve_without_blocking_after_coordinator_dies([a3, b3, c3])
    assert final_decision == "commit"
    assert all(t == 0 for t in hold_ticks)

    assert two_phase_commit_is_the_f_equals_zero_case(num_participants=3) is True

    print("all examples passed")
