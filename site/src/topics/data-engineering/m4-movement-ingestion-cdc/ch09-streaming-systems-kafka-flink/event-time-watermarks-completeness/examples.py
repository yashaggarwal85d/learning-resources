"""Toy models for de.event-time-watermarks-completeness: a real synthetic late/duplicate event
stream (generated here, reused by this chapter's lab), a real bounded-out-of-orderness watermark,
a real idle-source stall and its fix, real watermark alignment, and a real measured latency vs
completeness trade-off. Deterministic (seeded), no real Flink cluster."""

import random


def generate_stream(n=200, late_fraction=0.02, dup_fraction=0.01, seed=7):
    """A synthetic event stream: most events arrive shortly after their event time; a small
    fraction arrive much later (out of order); a small fraction are exact duplicates re-delivered.
    This is the 9.2 chapter lab's shared synthetic stream."""
    rng = random.Random(seed)
    base_events = []
    for i in range(n):
        event_time = i + 1
        is_late = rng.random() < late_fraction
        delay = rng.randint(20, 40) if is_late else rng.randint(0, 2)
        base_events.append(
            {"id": i, "event_time": event_time, "arrival_time": event_time + delay, "is_dup": False}
        )
    n_dups = max(1, round(n * dup_fraction))
    for ev in rng.sample(base_events, n_dups):
        base_events.append(
            {
                "id": ev["id"],
                "event_time": ev["event_time"],
                "arrival_time": ev["arrival_time"] + rng.randint(1, 5),
                "is_dup": True,
            }
        )
    base_events.sort(key=lambda e: e["arrival_time"])
    return base_events, n_dups


def test_generate_stream_matches_its_stated_fractions():
    events, n_dups = generate_stream(n=200, late_fraction=0.02, dup_fraction=0.01, seed=7)
    non_dup = [e for e in events if not e["is_dup"]]
    late = [e for e in non_dup if e["arrival_time"] - e["event_time"] > 5]
    # roughly late_fraction of 200 events arrive much later than their event time
    assert 1 <= len(late) <= 10
    assert n_dups == 2
    dup_events = [e for e in events if e["is_dup"]]
    assert len(dup_events) == n_dups


def compute_watermarks(events, bound):
    """A bounded-out-of-orderness watermark: as events arrive, the watermark trails the highest
    event time seen so far by a fixed bound."""
    max_event_time = 0
    out = []
    for e in events:
        max_event_time = max(max_event_time, e["event_time"])
        watermark = max_event_time - bound
        is_late = e["event_time"] < watermark
        out.append({**e, "watermark_at_arrival": watermark, "is_late": is_late})
    return out


def test_tighter_bound_marks_more_events_late():
    events, _ = generate_stream(seed=7)
    tight = compute_watermarks(events, bound=2)
    loose = compute_watermarks(events, bound=30)
    tight_late = sum(1 for e in tight if e["is_late"])
    loose_late = sum(1 for e in loose if e["is_late"])
    # a tighter bound leaves less slack for late data, so it marks strictly more events late
    assert tight_late > loose_late


def naive_global_watermark(partition_watermarks):
    return min(partition_watermarks.values())


def idle_aware_global_watermark(partition_watermarks, idle_partitions):
    active = {p: wm for p, wm in partition_watermarks.items() if p not in idle_partitions}
    if not active:
        return min(partition_watermarks.values())
    return min(active.values())


def test_idle_source_stalls_the_naive_watermark():
    # partition A keeps advancing; partition B goes idle at tick 5 and never reports again
    a_watermarks = list(range(0, 40, 2))  # advances every tick
    b_frozen_at = 5
    final_tick = len(a_watermarks) - 1

    naive_final = naive_global_watermark({"A": a_watermarks[final_tick], "B": b_frozen_at})
    # the naive global watermark is stuck at B's last reported value, no matter how far A gets
    assert naive_final == b_frozen_at

    # idle-source detection excludes B from the minimum once it's been silent past a timeout
    idle_aware_final = idle_aware_global_watermark(
        {"A": a_watermarks[final_tick], "B": b_frozen_at}, idle_partitions={"B"}
    )
    assert idle_aware_final == a_watermarks[final_tick]
    assert idle_aware_final > naive_final


def aligned_watermark(fast_wm, slow_wm, max_drift):
    """Watermark alignment: a fast partition's effective watermark is capped at the slow
    partition's watermark plus a bounded drift, simulating pausing the fast source."""
    return min(fast_wm, slow_wm + max_drift)


def test_watermark_alignment_bounds_the_drift():
    fast_wm, slow_wm, max_drift = 100, 10, 20
    unaligned_drift = fast_wm - slow_wm
    aligned = aligned_watermark(fast_wm, slow_wm, max_drift)
    aligned_drift = aligned - slow_wm
    assert unaligned_drift > max_drift
    assert aligned_drift == max_drift


def test_latency_completeness_trade_off():
    events, _ = generate_stream(seed=7)
    bounds = [2, 10, 30]
    completeness = []
    for bound in bounds:
        results = compute_watermarks(events, bound)
        complete_fraction = 1 - (sum(1 for e in results if e["is_late"]) / len(results))
        completeness.append(complete_fraction)
    # completeness (fraction not late) never decreases as the bound (latency budget) grows
    assert completeness[0] <= completeness[1] <= completeness[2]


if __name__ == "__main__":
    test_generate_stream_matches_its_stated_fractions()
    test_tighter_bound_marks_more_events_late()
    test_idle_source_stalls_the_naive_watermark()
    test_watermark_alignment_bounds_the_drift()
    test_latency_completeness_trade_off()
    print("all asserts passed")
    events, n_dups = generate_stream(seed=7)
    print("stream size ->", len(events), "duplicates ->", n_dups)
    for bound in (2, 10, 30):
        results = compute_watermarks(events, bound)
        late = sum(1 for e in results if e["is_late"])
        print(f"bound={bound} -> late/revised: {late}/{len(results)}")
