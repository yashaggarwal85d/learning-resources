"""Lab for de.clickstream-ad-click-analytics.

The late-event simulation (the share of events past the correction window,
and the gap it produces between the streaming count and the reconciled
batch count) and the estimate sheet are this topic's executable evidence.
"""

SESSION_GAP_SECONDS = 1800


def sessionize(events, gap_seconds=SESSION_GAP_SECONDS):
    """Group events into sessions by a gap of inactivity, not a fixed clock
    window (Flink's own session-window mechanism).
    """
    sessions = []
    current = []
    for event in sorted(events, key=lambda e: e["ts"]):
        if current and event["ts"] - current[-1]["ts"] > gap_seconds:
            sessions.append(current)
            current = []
        current.append(event)
    if current:
        sessions.append(current)
    return sessions


def classify_bot(event, clicks_per_second_threshold=5):
    """A false-positive-costed classification step, not a certainty."""
    return event.get("clicks_per_second", 0) > clicks_per_second_threshold


def streaming_count(events, watermark_ts, allowed_lateness_seconds=0):
    """A late event is dropped once the watermark has passed the window,
    unless an explicit allowed lateness is configured (Flink's own default).
    """
    cutoff = watermark_ts + allowed_lateness_seconds
    return sum(1 for e in events if e["ts"] <= cutoff)


def batch_reconciled_count(events):
    """The batch recomputes from the immutable log — every event counts,
    regardless of when it arrived.
    """
    return len(events)


def late_event_share(events, watermark_ts):
    """The share of events past the correction window — the gap's own
    direct cause.
    """
    late = [e for e in events if e["ts"] > watermark_ts]
    return len(late) / len(events) if events else 0.0


def billed_count(streaming_value, batch_value):
    """The stream is for speed; the reconciled batch is the number of
    record — the batch always overrides for anything billed.
    """
    return batch_value


def idempotent_upsert(store, event):
    """Idempotent upserts keyed by a deterministic id absorb a duplicate
    burst without double-counting.
    """
    store[event["event_id"]] = event
    return store


def dual_logic_drift(stream_logic_version, batch_logic_version):
    """Running the same transformation twice carries a real, unfixable
    cost: drift opens whenever only one copy gets updated.
    """
    return stream_logic_version != batch_logic_version


EVENTS_PER_SECOND_PEAK = 50_000
BYTES_PER_EVENT = 500
SECONDS_PER_DAY = 86_400
REPLICATION_FACTOR = 3


def estimate_sheet(events_per_second_peak, bytes_per_event, replication_factor, days_retained):
    bytes_per_day = events_per_second_peak * bytes_per_event * SECONDS_PER_DAY
    storage_with_replication = bytes_per_day * days_retained * replication_factor
    return {
        "bytes_per_day": bytes_per_day,
        "storage_with_replication": storage_with_replication,
    }


def dominant_cost_lever(costs):
    """The waterfall picks the single largest cost line, not the one the
    team has spent the most time tuning.
    """
    return max(costs, key=costs.get)


FAILURE_TABLE = {
    "collector_down": {"blast_radius": "all events since last healthy check, buffered at the SDK"},
    "poison_event": {"blast_radius": "one partition's consumer, until skipped or fixed"},
    "duplicate_burst_after_retry_storm": {"blast_radius": "absorbed by idempotent keying, not billing"},
    "region_loss": {"blast_radius": "every hop in that region, until failover completes"},
}


def check():
    events = [
        {"event_id": "e1", "ts": 0},
        {"event_id": "e2", "ts": 100},
        {"event_id": "e3", "ts": 200},
        {"event_id": "e4", "ts": 2200},  # new session: gap > 1800s from e3
        {"event_id": "e5", "ts": 2300},
        {"event_id": "e6", "ts": 50_000},  # arrives late, after the watermark below
    ]
    sessions = sessionize(events)
    assert len(sessions) == 3
    assert [e["event_id"] for e in sessions[0]] == ["e1", "e2", "e3"]

    watermark = 2500
    stream = streaming_count(events, watermark)
    assert stream == 5  # e6 is late, dropped by default

    batch = batch_reconciled_count(events)
    assert batch == 6  # the log has every event

    share = late_event_share(events, watermark)
    assert abs(share - (1 / 6)) < 1e-9

    assert billed_count(stream, batch) == batch

    store = {}
    for e in events + [events[0]]:  # a retry resends e1
        store = idempotent_upsert(store, e)
    assert len(store) == 6  # the duplicate resend didn't double-count

    assert dual_logic_drift("v3", "v3") is False
    assert dual_logic_drift("v3", "v2") is True

    sheet = estimate_sheet(EVENTS_PER_SECOND_PEAK, BYTES_PER_EVENT, REPLICATION_FACTOR, days_retained=30)
    assert sheet["bytes_per_day"] == EVENTS_PER_SECOND_PEAK * BYTES_PER_EVENT * SECONDS_PER_DAY
    assert sheet["storage_with_replication"] == sheet["bytes_per_day"] * 30 * REPLICATION_FACTOR

    costs = {"lake_scan": 900, "cross_az_replication": 400, "compute": 300}
    assert dominant_cost_lever(costs) == "lake_scan"

    assert FAILURE_TABLE["region_loss"]["blast_radius"].startswith("every hop")


if __name__ == "__main__":
    check()
    print("de.clickstream-ad-click-analytics: all checks passed")
