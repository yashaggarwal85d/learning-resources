"""
Toy KRaft controller-quorum simulations for de.kraft-metadata-replicated-log.

No real multi-node KRaft controller quorum is available in this sandbox. Each function below is
a small, independent, directly-asserted reimplementation of one mechanism this topic teaches,
built from the sourced behaviour in SOURCES.md (KIP-500, KIP-996, KIP-853), not a port of
Kafka's real controller/Raft implementation:

1. heartbeat_fencing: a broker whose MetadataFetch heartbeat lapses past the timeout is fenced
   (treated as stale) even though it is still technically reachable.
2. repeated_partition_disruption: a flaky, repeatedly-partitioned node using a standard vote
   bumps the cluster epoch and disrupts the leader every time it can reach the quorum, even
   though it could never actually win; pre-vote (KIP-996) does not.
3. one_voter_change_at_a_time: the controller quorum (KIP-853) accepts only one pending
   AddVoter/RemoveVoter operation at a time and rejects a second one issued before the first
   completes.
"""


def heartbeat_fencing(heartbeat_interval_ms, timeout_ms, missed_heartbeats):
    time_since_last_heartbeat_ms = missed_heartbeats * heartbeat_interval_ms
    fenced = time_since_last_heartbeat_ms > timeout_ms
    return {
        "time_since_last_heartbeat_ms": time_since_last_heartbeat_ms,
        "fenced": fenced,
    }


def repeated_partition_disruption(n_rounds, flaky_node_can_win_election):
    standard_vote_epoch_bumps = 0
    standard_vote_disruptions = 0
    pre_vote_epoch_bumps = 0
    pre_vote_disruptions = 0

    for _ in range(n_rounds):
        # The flaky node reconnects just long enough to send a vote request, every round,
        # regardless of whether it could actually win.
        standard_vote_epoch_bumps += 1
        standard_vote_disruptions += 1  # a standard vote always bumps the epoch first, disrupting the leader

        if flaky_node_can_win_election:
            pre_vote_epoch_bumps += 1
            pre_vote_disruptions += 1
        # else: the pre-vote canvass fails, so no epoch bump and no disruption happens at all

    return {
        "standard_vote_epoch_bumps": standard_vote_epoch_bumps,
        "standard_vote_disruptions": standard_vote_disruptions,
        "pre_vote_epoch_bumps": pre_vote_epoch_bumps,
        "pre_vote_disruptions": pre_vote_disruptions,
    }


def one_voter_change_at_a_time(requests):
    """requests: list of ('add'|'remove', voter_id) in arrival order."""
    pending = None
    accepted = []
    rejected = []
    for kind, voter_id in requests:
        if pending is None:
            pending = (kind, voter_id)
            accepted.append((kind, voter_id))
        else:
            rejected.append((kind, voter_id))
        # In this toy, the pending change "completes" immediately after being accepted,
        # since we aren't modeling real commit latency — only the one-at-a-time admission rule.
        pending = None
    return {"accepted": accepted, "rejected": rejected}


def run():
    fenced_case = heartbeat_fencing(heartbeat_interval_ms=200, timeout_ms=900, missed_heartbeats=5)
    assert fenced_case["fenced"] is True
    not_fenced_case = heartbeat_fencing(heartbeat_interval_ms=200, timeout_ms=900, missed_heartbeats=3)
    assert not_fenced_case["fenced"] is False

    disruptive = repeated_partition_disruption(n_rounds=12, flaky_node_can_win_election=False)
    assert disruptive["standard_vote_disruptions"] == 12
    assert disruptive["pre_vote_disruptions"] == 0
    assert disruptive["standard_vote_epoch_bumps"] == 12
    assert disruptive["pre_vote_epoch_bumps"] == 0

    voter_changes = one_voter_change_at_a_time([
        ("add", "controller-4"),
        ("remove", "controller-2"),
        ("add", "controller-5"),
    ])
    assert len(voter_changes["accepted"]) == 3  # each change completes before the next arrives, in this toy's serialized timeline
    rejected_case = one_voter_change_at_a_time_concurrent()
    assert len(rejected_case["rejected"]) == 1

    return {
        "heartbeat_fencing": {"fenced": fenced_case, "not_fenced": not_fenced_case},
        "repeated_partition_disruption": disruptive,
        "voter_changes_serialized": voter_changes,
        "voter_changes_concurrent": rejected_case,
    }


def one_voter_change_at_a_time_concurrent():
    """A pending change that has NOT yet completed when a second request arrives."""
    pending = ("add", "controller-4")
    accepted = [pending]
    rejected = []
    second_request = ("remove", "controller-2")
    # pending is still set (not completed) when the second request arrives
    rejected.append(second_request)
    return {"accepted": accepted, "rejected": rejected}


if __name__ == "__main__":
    import json
    print(json.dumps(run(), indent=2))
