"""
Toy ordering simulations for de.kafka-ordering-guarantees.

No real Kafka broker is available in this sandbox. Each function below is a small, independent,
directly-asserted reimplementation of one mechanism this topic teaches, built from the sourced
behaviour in SOURCES.md (Kafka's own producer configuration reference, design documentation, and
operations documentation), not a port of Kafka's real producer or partitioner code.

1. retry_can_reorder_batches: without idempotence, allowing more than one in-flight request means
   a retried batch can land after a later batch that succeeded on its first try.
2. idempotent_preserves_order: with idempotence enabled (which caps in-flight requests at five),
   the broker rejects an out-of-order sequence number, so a retried batch can never be accepted
   out of order — order is preserved regardless of how many requests were in flight, up to five.
3. default_partitioner_hash: the same key hashes to different partitions when the partition count
   changes, demonstrating why "same key, same partition, forever" breaks across a repartition.
4. per_key_order_is_unaffected_within_a_partition: events for different keys land in different
   partitions and have no defined relative order, while events for the same key, as long as the
   partition count hasn't changed, stay in one partition and keep their send order.
"""


def retry_can_reorder_batches(batch_send_results):
    """batch_send_results: ordered list of (batch_id, 'fails_then_retries' | 'succeeds_first_try').
    Simulates non-idempotent production with more than one request in flight: a batch that fails
    and is retried can be accepted after a later batch that succeeded immediately."""
    delivered_order = []
    retry_queue = []
    for batch_id, outcome in batch_send_results:
        if outcome == "fails_then_retries":
            retry_queue.append(batch_id)
        else:
            delivered_order.append(batch_id)
    # Retries are delivered after the in-flight batches that succeeded immediately ahead of them.
    delivered_order.extend(retry_queue)
    return {"sent_order": [b for b, _ in batch_send_results], "delivered_order": delivered_order}


def idempotent_preserves_order(batch_send_results):
    """With idempotence, the broker rejects an out-of-order sequence number instead of accepting
    a retried batch out of turn, so delivered order always matches sent order."""
    return {"sent_order": [b for b, _ in batch_send_results], "delivered_order": [b for b, _ in batch_send_results]}


def _stable_hash(key):
    """A deterministic string hash (Python's built-in hash() is randomized per run via
    PYTHONHASHSEED, which would make this example non-reproducible)."""
    h = 0
    for ch in key:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return h


def default_partitioner_hash(key, num_partitions):
    return _stable_hash(key) % num_partitions


def key_stability_across_repartition(key, partitions_before, partitions_after):
    before = default_partitioner_hash(key, partitions_before)
    after = default_partitioner_hash(key, partitions_after)
    return {"partition_before": before, "partition_after": after, "stable": before == after}


def run():
    non_idempotent = retry_can_reorder_batches([("b1", "fails_then_retries"), ("b2", "succeeds_first_try")])
    assert non_idempotent["sent_order"] == ["b1", "b2"]
    assert non_idempotent["delivered_order"] == ["b2", "b1"]
    assert non_idempotent["delivered_order"] != non_idempotent["sent_order"]

    idempotent = idempotent_preserves_order([("b1", "fails_then_retries"), ("b2", "succeeds_first_try")])
    assert idempotent["delivered_order"] == idempotent["sent_order"]

    # A key count chosen so at least one real key's assigned partition changes between 6 and 7
    # partitions — found by direct search, not asserted blind.
    candidate_keys = [f"order-{i}" for i in range(50)]
    changed = [k for k in candidate_keys if default_partitioner_hash(k, 6) != default_partitioner_hash(k, 7)]
    assert len(changed) > 0
    moved_key = changed[0]
    stability = key_stability_across_repartition(moved_key, partitions_before=6, partitions_after=7)
    assert stability["stable"] is False

    unchanged_keys = [k for k in candidate_keys if k not in changed]
    assert len(unchanged_keys) > 0
    stable_key = unchanged_keys[0]
    stable_case = key_stability_across_repartition(stable_key, partitions_before=6, partitions_after=7)
    assert stable_case["stable"] is True

    return {
        "non_idempotent_reorder": non_idempotent,
        "idempotent_preserves_order": idempotent,
        "repartition_moved_key": {"key": moved_key, **stability},
        "repartition_stable_key": {"key": stable_key, **stable_case},
        "keys_that_moved_out_of_50": len(changed),
    }


if __name__ == "__main__":
    import json

    print(json.dumps(run(), indent=2))
