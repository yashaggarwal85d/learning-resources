"""
Toy replication/ISR/high-watermark simulations for de.replication-isr-high-watermark.

No real multi-broker Kafka cluster is available in this sandbox. Each function below is a
small, independent, directly-asserted reimplementation of one mechanism this topic teaches,
built from the sourced behaviour in SOURCES.md, not a port of Kafka's real broker code:

1. hw_is_minimum_of_isr: the high watermark is the minimum offset held by every in-sync
   replica, not the leader's own offset.
2. min_insync_rejects_writes: once the in-sync set shrinks below min.insync.replicas, writes
   stop succeeding rather than silently continuing on a smaller set.
3. leader_epoch_truncation: a direct reimplementation of KIP-101's own worked example — a
   follower that truncates to its recorded high watermark loses a message its leader epoch
   log would have told it to keep.
4. last_replica_standing: KIP-966's "last replica standing" scenario — classic high-watermark
   advancement (gated only on ISR being non-empty) exposes new writes to global data loss once
   the ISR shrinks to one replica; gating high-watermark advancement on min.insync.replicas
   (KIP-966's proposed fix) does not.
"""


def hw_is_minimum_of_isr(leader_offset, follower_lags):
    follower_offsets = [leader_offset - lag for lag in follower_lags]
    isr_offsets = [leader_offset] + follower_offsets
    high_watermark = min(isr_offsets)
    return {
        "leader_offset": leader_offset,
        "follower_offsets": follower_offsets,
        "high_watermark": high_watermark,
    }


def min_insync_rejects_writes(phases, min_insync_replicas):
    """phases: list of (isr_size, n_writes_attempted) tuples, in order."""
    results = []
    for isr_size, n_writes_attempted in phases:
        if isr_size >= min_insync_replicas:
            succeeded, rejected = n_writes_attempted, 0
        else:
            succeeded, rejected = 0, n_writes_attempted
        results.append({"isr_size": isr_size, "succeeded": succeeded, "rejected": rejected})
    return results


def leader_epoch_truncation():
    follower_log = ["m1", "m2"]
    recorded_high_watermark = 1
    leader_epoch_end_offset = 2

    hw_truncated_log = follower_log[:recorded_high_watermark]
    epoch_truncated_log = follower_log[:leader_epoch_end_offset]

    return {
        "hw_truncation_result": hw_truncated_log,
        "epoch_truncation_result": epoch_truncated_log,
        "hw_truncation_lost_m2": "m2" not in hw_truncated_log,
        "epoch_truncation_kept_m2": "m2" in epoch_truncated_log,
    }


def last_replica_standing(n_committed_before_shrink, n_writes_during_shrink, n_lost_on_unclean_shutdown,
                           enforce_min_insync_on_hw, min_insync_replicas):
    """
    Models KIP-966's "last replica standing" scenario: the ISR shrinks from several replicas to
    one under network partitions, leaving that single replica (the former leader) as the sole
    ISR member. It keeps accepting writes, then suffers an unclean shutdown that drops its
    unflushed tail, then restarts and is re-elected leader (the only replica around), so
    whatever it lost is now gone from every replica.

    enforce_min_insync_on_hw=False models classic Kafka: the high watermark advances as long as
    the ISR is non-empty, even once it has shrunk below min.insync.replicas, so writes made
    during the shrink are accepted and become loss-exposed.

    enforce_min_insync_on_hw=True models KIP-966's proposed rule ("the High Watermark can only
    advance if the ISR size is larger or equal to min.insync.replicas"): once the ISR drops to
    one replica (below min_insync_replicas), no new acks=all write can be acknowledged, so
    nothing new becomes loss-exposed during the shrink window.
    """
    committed_before = list(range(n_committed_before_shrink))

    if enforce_min_insync_on_hw and 1 < min_insync_replicas:
        accepted_during_shrink = []
    else:
        accepted_during_shrink = list(
            range(n_committed_before_shrink, n_committed_before_shrink + n_writes_during_shrink)
        )

    sole_replica_log = committed_before + accepted_during_shrink
    lost_count = min(n_lost_on_unclean_shutdown, len(sole_replica_log))
    lost_records = set(sole_replica_log[len(sole_replica_log) - lost_count:])

    writes_during_shrink_now_lost = len(set(accepted_during_shrink) & lost_records)
    return {
        "accepted_during_shrink": len(accepted_during_shrink),
        "writes_during_shrink_now_lost": writes_during_shrink_now_lost,
    }


def run():
    hw = hw_is_minimum_of_isr(leader_offset=200, follower_lags=[20, 50])
    assert hw["high_watermark"] == min(hw["follower_offsets"])
    assert hw["high_watermark"] < hw["leader_offset"]
    assert hw["high_watermark"] == 150

    min_insync = min_insync_rejects_writes(
        phases=[(3, 100), (1, 40), (2, 60)],
        min_insync_replicas=2,
    )
    assert min_insync[0]["succeeded"] == 100 and min_insync[0]["rejected"] == 0
    assert min_insync[1]["succeeded"] == 0 and min_insync[1]["rejected"] == 40
    assert min_insync[2]["succeeded"] == 60 and min_insync[2]["rejected"] == 0

    epoch = leader_epoch_truncation()
    assert epoch["hw_truncation_lost_m2"] is True
    assert epoch["epoch_truncation_kept_m2"] is True

    classic = last_replica_standing(
        n_committed_before_shrink=50,
        n_writes_during_shrink=6,
        n_lost_on_unclean_shutdown=4,
        enforce_min_insync_on_hw=False,
        min_insync_replicas=2,
    )
    elr_rule = last_replica_standing(
        n_committed_before_shrink=50,
        n_writes_during_shrink=6,
        n_lost_on_unclean_shutdown=4,
        enforce_min_insync_on_hw=True,
        min_insync_replicas=2,
    )
    assert classic["writes_during_shrink_now_lost"] > 0
    assert elr_rule["accepted_during_shrink"] == 0
    assert elr_rule["writes_during_shrink_now_lost"] == 0

    return {
        "high_watermark": hw,
        "min_insync_replicas": min_insync,
        "leader_epoch_truncation": epoch,
        "last_replica_standing_classic": classic,
        "last_replica_standing_elr_rule": elr_rule,
    }


if __name__ == "__main__":
    import json
    print(json.dumps(run(), indent=2))
