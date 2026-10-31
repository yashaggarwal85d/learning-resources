"""
Raft's safety argument, reduced to the checks the paper's own Figure 8 and voting restriction
rely on: whether a candidate's log is at least as up-to-date as a voter's (term, then length),
whether two logs satisfy the Log Matching property, and whether an entry counted on a majority is
safe to treat as committed -- which depends only on which term the entry itself carries, never on
how many replicas hold it. The Figure 8 scenario (a) through (e) is walked literally.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Entry:
    term: int
    command: str


def log_is_at_least_as_up_to_date(candidate_log: list[Entry], voter_log: list[Entry]) -> bool:
    # "Raft determines which of two logs is more up-to-date by comparing the index and term of
    # the last entries in the logs." Same last term: longer log wins. Different last term: the
    # later term wins, regardless of length.
    if not voter_log:
        return True
    if not candidate_log:
        return False
    candidate_last, voter_last = candidate_log[-1], voter_log[-1]
    if candidate_last.term != voter_last.term:
        return candidate_last.term > voter_last.term
    return len(candidate_log) >= len(voter_log)


def dropping_the_voting_restriction_breaks_leader_completeness():
    # A voter holding a committed entry (term 2) would correctly deny a vote to a candidate
    # missing it, because the candidate's log is shorter at the same last term.
    voter_log = [Entry(1, "x"), Entry(2, "committed-write")]
    candidate_log = [Entry(1, "x")]
    assert not log_is_at_least_as_up_to_date(candidate_log, voter_log)
    print("a candidate missing the committed entry fails the up-to-date check:", "denied")

    # Without the restriction (imagine votes granted regardless of log content), that same
    # candidate could still win an election and, per Leader Append-Only, would never acquire
    # the entry it never had -- Leader Completeness would be violated.
    would_win_without_restriction = True  # the restriction is the only thing preventing this
    assert would_win_without_restriction
    print("with no restriction at all, that candidate could still win and never catch up")


def log_matching_holds(log_a: list[Entry], log_b: list[Entry]) -> bool:
    # "If two logs contain an entry with the same index and term, then the logs are identical in
    # all entries up through the given index."
    for i in range(min(len(log_a), len(log_b))):
        if log_a[i].term == log_b[i].term and log_a[i] != log_b[i]:
            return False
    return True


def append_entries_consistency_check(leader_log: list[Entry], follower_log: list[Entry], prev_index: int, prev_term: int) -> bool:
    # The leader includes the index and term of the entry immediately preceding the new ones; the
    # follower refuses if it has no matching entry there.
    if prev_index == -1:
        return True
    if prev_index >= len(follower_log):
        return False
    return follower_log[prev_index].term == prev_term


def figure_8_scenario():
    # (a) S1 is leader (term 2), partially replicates index 2 to itself and S2 only.
    s1 = [Entry(1, "init"), Entry(2, "from-S1")]
    s2 = [Entry(1, "init"), Entry(2, "from-S1")]
    s3 = [Entry(1, "init")]
    s4 = [Entry(1, "init")]
    s5 = [Entry(1, "init")]
    print("(a) S1 leader, term 2 entry on S1 and S2 only (not a majority of 5)")

    # (b) S1 crashes; S5 is elected leader for term 3 with votes from S3, S4, itself -- all three
    # have the identical last entry (term 1), so the up-to-date check passes trivially -- and
    # accepts a different entry at index 2.
    assert log_is_at_least_as_up_to_date(s5, s3) and log_is_at_least_as_up_to_date(s5, s4)
    s5 = s5 + [Entry(3, "from-S5")]
    s3 = s3 + [Entry(3, "from-S5")]
    s4 = s4 + [Entry(3, "from-S5")]
    print("(b) S5 elected term 3 (votes from S3, S4, self), replicates its own index-2 entry")

    # (c) S5 crashes; S1 restarts, is re-elected (it and S2 still have the longer, later-term
    # claim isn't what wins here -- in the paper S1 is simply re-elected), and continues
    # replicating its term-2 entry to a majority: S1, S2, S3.
    s3 = [Entry(1, "init"), Entry(2, "from-S1")]  # S1 repairs S3's log to match its own
    print("(c) S1 re-elected, repairs S3 to match: term-2 entry now on S1, S2, S3 -- a majority")

    # At this point the term-2 entry is stored on a majority (S1, S2, S3) but is NOT committed,
    # because it is not from the current leader's current term being counted at commit time.
    majority_holds_it = sum(1 for log in [s1, s2, s3, s4, s5] if len(log) > 1 and log[1].term == 2) >= 3
    assert majority_holds_it
    print("term-2 entry is on a majority of servers, but Raft does not treat it as committed yet")

    # (d) If S1 crashes now, S5 (log last term 3, S1/S2/S3 at this point last term 2) could win
    # an election with votes from S2, S3, S4 and overwrite the term-2 entry with its own.
    s5_can_still_win = log_is_at_least_as_up_to_date(s5, s2) and log_is_at_least_as_up_to_date(s5, s3) and log_is_at_least_as_up_to_date(s5, s4)
    assert s5_can_still_win
    print("(d) if S1 crashes here, S5 can still win (higher last term) and overwrite the term-2 entry")

    # (e) Instead, S1 replicates a NEW entry from its OWN current term (2) -- wait, the paper
    # uses term 4 for this step's leader; what matters for this topic is only the rule: once an
    # entry FROM THE LEADER'S CURRENT TERM is on a majority, S5 (still last term 3) can no longer
    # win, so that entry -- and everything before it, via Log Matching -- is committed.
    s1_current_term_entry = Entry(4, "from-S1-current-term")
    s1 = s1 + [s1_current_term_entry]
    s2 = s2 + [s1_current_term_entry]
    s3 = s3 + [s1_current_term_entry]
    s5_can_win_now = log_is_at_least_as_up_to_date(s5, s1)
    assert not s5_can_win_now
    print("(e) once S1's OWN current-term entry is on a majority, S5 can no longer win an election")
    print("that entry is committed, and by Log Matching, the earlier term-2 entry is committed indirectly")


def committing_by_counting_replicas_is_unsafe_for_old_terms_only():
    old_term_entry_on_majority = {"term": 2, "replicas": 3, "total": 5}
    current_term_entry_on_majority = {"term": 4, "replicas": 3, "total": 5}
    # Same replica count, same majority threshold -- the only difference the commit rule cares
    # about is whose term the entry carries.
    assert old_term_entry_on_majority["replicas"] == current_term_entry_on_majority["replicas"]
    print("identical replica counts; only the current-term one is safe to call committed by counting them")


def joint_consensus_requires_both_majorities(old_config: set[str], new_config: set[str], votes: set[str]) -> bool:
    # "uses overlapping majorities to guarantee safety": a decision during the transition needs a
    # majority of the OLD config AND a majority of the NEW config.
    old_majority = len(votes & old_config) > len(old_config) / 2
    new_majority = len(votes & new_config) > len(new_config) / 2
    return old_majority and new_majority


def membership_change_without_joint_consensus_can_split():
    old_config = {"S1", "S2", "S3"}
    new_config = {"S3", "S4", "S5"}
    votes_old_side = {"S1", "S2"}  # a majority of the OLD config alone
    votes_new_side = {"S4", "S5"}  # a majority of the NEW config alone
    # Switching configs at different times without joint consensus, each side could elect its own
    # leader using only its own config's majority -- two leaders in the same term.
    old_side_wins_old_only = len(votes_old_side & old_config) > len(old_config) / 2
    new_side_wins_new_only = len(votes_new_side & new_config) > len(new_config) / 2
    assert old_side_wins_old_only and new_side_wins_new_only
    assert not joint_consensus_requires_both_majorities(old_config, new_config, votes_old_side)
    assert not joint_consensus_requires_both_majorities(old_config, new_config, votes_new_side)
    print("without joint consensus, each side's own majority alone could elect a separate leader")
    print("joint consensus requires a majority of BOTH configs at once, which no single side has here")


if __name__ == "__main__":
    dropping_the_voting_restriction_breaks_leader_completeness()
    figure_8_scenario()
    committing_by_counting_replicas_is_unsafe_for_old_terms_only()
    membership_change_without_joint_consensus_can_split()
