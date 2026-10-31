"""Toy real-time OLAP ingestion model: a per-partition consuming task that seals its own
independent segments, an atomic offset-and-segment commit compared against a naive non-atomic
one, and an upsert query-time overlay that answers a key's latest value without ever rewriting
the sealed segment physically containing its original row.
"""


def build_segments(events, segment_size):
    """A consuming task buffers events and seals a new, immutable segment once it fills up,
    leaving any remainder as one final, still-growing segment."""
    segments = []
    current = []
    for event in events:
        current.append(event)
        if len(current) == segment_size:
            segments.append(tuple(current))
            current = []
    if current:
        segments.append(tuple(current))
    return segments


def partition_consumer_segments(num_partitions, events_per_partition, segment_size):
    """Each Kafka partition gets its own consuming task, building its own independent sequence
    of segments — the per-partition-consumer model Druid and Pinot both use."""
    return {
        p: build_segments([f"p{p}-e{i}" for i in range(events_per_partition)], segment_size)
        for p in range(num_partitions)
    }


def atomic_offset_segment_commit(committed_state, new_event_count, should_fail):
    """The offset and the segment advance together, in one atomic action, or neither does. A
    failed commit leaves state completely unchanged, so a retry simply redoes identical work
    instead of producing a gap or a duplicate."""
    if should_fail:
        return dict(committed_state)
    return {
        "offset": committed_state["offset"] + new_event_count,
        "segment_count": committed_state["segment_count"] + 1,
    }


def naive_offset_then_segment_commit(committed_state, new_event_count, crash_before_segment):
    """Not atomic: the offset advances first, and the segment is only sealed afterward. A
    crash in between leaves the offset looking committed even though no matching segment ever
    landed — the offset and segment count fall out of step."""
    new_offset = committed_state["offset"] + new_event_count
    if crash_before_segment:
        return {"offset": new_offset, "segment_count": committed_state["segment_count"]}
    return {"offset": new_offset, "segment_count": committed_state["segment_count"] + 1}


def upsert_query(sealed_segment_rows, overlay, key):
    """A sealed segment's row for a key stays physically unchanged forever. A later update for
    that same key lives in a separate overlay, checked first at query time, the way Pinot's
    upsert tables answer a query without ever rewriting a sealed segment."""
    if key in overlay:
        return overlay[key]
    return sealed_segment_rows.get(key)


if __name__ == "__main__":
    by_partition = partition_consumer_segments(num_partitions=4, events_per_partition=10, segment_size=4)
    segment_counts = {p: len(segs) for p, segs in by_partition.items()}
    print(f"four partitions, each building its own segments independently: {segment_counts}")
    assert len(by_partition) == 4
    assert all(count == 3 for count in segment_counts.values())

    start_state = {"offset": 0, "segment_count": 0}
    failed_commit = atomic_offset_segment_commit(start_state, new_event_count=5, should_fail=True)
    print(f"atomic commit, forced to fail: state stays at {failed_commit}")
    assert failed_commit == start_state, "a failed atomic commit must leave state untouched"
    retried_commit = atomic_offset_segment_commit(failed_commit, new_event_count=5, should_fail=False)
    print(f"retried atomic commit, this time succeeding: {retried_commit}")
    assert retried_commit == {"offset": 5, "segment_count": 1}

    naive_crashed = naive_offset_then_segment_commit(start_state, new_event_count=5, crash_before_segment=True)
    print(f"naive non-atomic commit, crashing between the two steps: {naive_crashed}")
    assert naive_crashed["offset"] == 5 and naive_crashed["segment_count"] == 0, (
        "the naive commit should leave the offset ahead of the segment it was supposed to match"
    )

    sealed_rows = {"order-1": "pending"}
    overlay = {"order-1": "delivered"}
    answer = upsert_query(sealed_rows, overlay, "order-1")
    print(f"sealed segment still says 'pending'; the upsert query answers '{answer}'")
    assert sealed_rows["order-1"] == "pending", "the sealed segment's row must stay untouched"
    assert answer == "delivered"

    print(
        "each partition seals its own segments independently, an atomic offset-and-segment "
        "commit never falls out of step the way a naive one can, and an upsert overlay answers "
        "a query with the newest value without ever rewriting the sealed segment underneath it"
    )
