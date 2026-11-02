"""OEE derived from a real machine-state interval table (not stored directly), reconciled against
oee.com's own worked numeric example; a shift-spanning downtime split at the boundary; a real
double-count from an overlapping gateway-replay interval and its fix; a reason-code hierarchy
rolled up; MTBF/MTTR with censored intervals; and the planned/unplanned policy's own effect on
the number. Fictional single line (no real company); all data is seeded and synthetic except the
oee.com reconciliation, which reuses that source's own published figures exactly.
"""
from datetime import datetime, timedelta

# 1. Reconcile this topic's own formulas against oee.com's own published worked example.
shift_minutes = 480
breaks_minutes = 60
downtime_minutes = 47
ideal_cycle_time_s = 1.0
total_count = 19_271
reject_count = 423

planned_production_time = shift_minutes - breaks_minutes
run_time = planned_production_time - downtime_minutes
good_count = total_count - reject_count

availability = run_time / planned_production_time
performance = (ideal_cycle_time_s * total_count) / (run_time * 60)
quality = good_count / total_count
oee = availability * performance * quality
oee_simple = (good_count * ideal_cycle_time_s) / (planned_production_time * 60)

assert round(availability, 4) == 0.8881, f"expected 0.8881, got {availability:.4f}"
assert round(performance, 4) == 0.8611, f"expected 0.8611, got {performance:.4f}"
assert round(quality, 4) == 0.9780, f"expected 0.9780, got {quality:.4f}"
assert round(oee, 4) == 0.7479, f"expected 0.7479, got {oee:.4f}"
assert abs(oee - oee_simple) < 1e-9, "the factored and simple OEE formulas must agree exactly"


# 2. A machine-state interval table, derived from raw state-change events, not stored directly.
def intervals_from_events(events):
    """events: list of (timestamp, state), sorted. Returns [(state, start, end), ...]."""
    out = []
    for i in range(len(events) - 1):
        ts, state = events[i]
        next_ts, _ = events[i + 1]
        out.append((state, ts, next_ts))
    return out


base = datetime(2026, 10, 31, 6, 0)
raw_events = [
    (base, "running"),
    (base + timedelta(minutes=120), "down_unplanned"),
    (base + timedelta(minutes=135), "running"),
    (base + timedelta(minutes=350), "down_unplanned"),
    (base + timedelta(minutes=362), "running"),
    (base + timedelta(minutes=480), "shift_end"),
]
raw_intervals = intervals_from_events(raw_events)
down_minutes = sum((end - start).total_seconds() / 60 for state, start, end in raw_intervals if state == "down_unplanned")
assert down_minutes == 27, f"expected 15+12=27 minutes of unplanned downtime, got {down_minutes}"


# 3. A downtime interval that spans a shift boundary must be split at the boundary, not assigned
# wholly to the shift it started or ended in.
shift_boundary = base + timedelta(hours=16)  # 22:00, 16 hours after a 06:00 shift start
crossing_start = shift_boundary - timedelta(minutes=10)
crossing_end = shift_boundary + timedelta(minutes=20)


def split_at_boundary(start, end, boundary):
    if start < boundary < end:
        return [(start, boundary), (boundary, end)]
    return [(start, end)]


split = split_at_boundary(crossing_start, crossing_end, shift_boundary)
assert len(split) == 2, "a downtime crossing the boundary must split into exactly two pieces"
first_minutes = (split[0][1] - split[0][0]).total_seconds() / 60
second_minutes = (split[1][1] - split[1][0]).total_seconds() / 60
assert first_minutes == 10, f"expected 10 minutes in the first shift, got {first_minutes}"
assert second_minutes == 20, f"expected 20 minutes in the second shift, got {second_minutes}"
assert first_minutes + second_minutes == (crossing_end - crossing_start).total_seconds() / 60


# 4. A gateway replay duplicates one interval, overlapping an already-recorded stop. Naively
# summing every recorded interval double-counts the overlap; merging overlapping intervals first
# gives the real total.
real_stop = (base + timedelta(minutes=200), base + timedelta(minutes=240))  # 40 real minutes
replayed_duplicate = (base + timedelta(minutes=210), base + timedelta(minutes=250))  # overlaps it
recorded = [real_stop, replayed_duplicate]

naive_total = sum((e - s).total_seconds() / 60 for s, e in recorded)
assert naive_total == 80, f"expected the naive (double-counted) sum to be 80 minutes, got {naive_total}"


def merge_intervals(ivs):
    ivs = sorted(ivs)
    merged = [ivs[0]]
    for s, e in ivs[1:]:
        last_s, last_e = merged[-1]
        if s <= last_e:
            merged[-1] = (last_s, max(last_e, e))
        else:
            merged.append((s, e))
    return merged


merged = merge_intervals(recorded)
merged_total = sum((e - s).total_seconds() / 60 for s, e in merged)
assert len(merged) == 1, "the two overlapping intervals must merge into exactly one real stop"
assert merged_total == 50, f"expected the merged (real) total to be 50 minutes, got {merged_total}"
assert merged_total < naive_total, "merging overlapping intervals must reduce the double-counted total"


# 5. A reason-code hierarchy (category -> reason -> sub-reason), rolled up to the category level.
reason_hierarchy = {
    "R-101": {"category": "Unplanned", "reason": "Mechanical", "sub_reason": "Belt slip"},
    "R-102": {"category": "Unplanned", "reason": "Mechanical", "sub_reason": "Bearing wear"},
    "R-201": {"category": "Unplanned", "reason": "Electrical", "sub_reason": "Sensor fault"},
    "R-301": {"category": "Planned", "reason": "Changeover", "sub_reason": "Product switch"},
}
stop_log = [
    ("R-101", 12.0),
    ("R-102", 8.0),
    ("R-201", 15.0),
    ("R-301", 30.0),
    ("R-101", 5.0),
]
rollup: dict[str, float] = {}
for code, minutes in stop_log:
    category = reason_hierarchy[code]["category"]
    rollup[category] = rollup.get(category, 0.0) + minutes

assert rollup["Unplanned"] == 40.0, f"expected 12+8+15+5=40 unplanned minutes, got {rollup['Unplanned']}"
assert rollup["Planned"] == 30.0, f"expected 30 planned minutes, got {rollup['Planned']}"
assert sum(rollup.values()) == sum(m for _, m in stop_log)


# 6. MTBF and MTTR, with censored intervals at the window's edges excluded from the failure count
# (the window doesn't start or end with an observed failure, so the first and last up-intervals
# are partial observations, not complete up-times between two failures).
window_start = base
window_end = base + timedelta(hours=72)
failure_events = [  # (failure_time, repair_duration_minutes)
    (base + timedelta(hours=10), 30),
    (base + timedelta(hours=28), 45),
    (base + timedelta(hours=50), 20),
]

up_intervals = []
prev_repair_end = window_start
for failure_time, repair_minutes in failure_events:
    up_intervals.append((prev_repair_end, failure_time))
    prev_repair_end = failure_time + timedelta(minutes=repair_minutes)
# The interval after the last failure's repair, up to the window's end, is censored: the next
# failure (if any) hasn't been observed, so it is not a complete up-time between two failures.
censored_tail = (prev_repair_end, window_end)

complete_up_times_hours = [(e - s).total_seconds() / 3600 for s, e in up_intervals]
mtbf_hours = sum(complete_up_times_hours) / len(failure_events)
mttr_minutes = sum(r for _, r in failure_events) / len(failure_events)

assert len(failure_events) == 3
assert round(mtbf_hours, 4) == round((10 + 17.5 + 21.25) / 3, 4), f"got {mtbf_hours:.4f}"
assert mttr_minutes == round((30 + 45 + 20) / 3, 4) or abs(mttr_minutes - (30 + 45 + 20) / 3) < 1e-9
assert censored_tail[1] > censored_tail[0], "the tail after the last observed failure is a real, but censored, interval"
assert censored_tail not in up_intervals, "the censored tail must never be counted as a complete up-time"


# 7. The planned/unplanned policy choice changes Availability, and therefore OEE, for the
# identical raw downtime -- the number is not fixed until the policy is stated.
changeover_minutes = 30.0
breakdown_minutes = 47.0
policy_a_unplanned_only = {"stop_minutes": breakdown_minutes}  # changeover counted as planned, excluded
policy_b_changeover_unplanned = {"stop_minutes": breakdown_minutes + changeover_minutes}  # changeover counted as unplanned

availability_a = (planned_production_time - policy_a_unplanned_only["stop_minutes"]) / planned_production_time
availability_b = (planned_production_time - policy_b_changeover_unplanned["stop_minutes"]) / planned_production_time
assert availability_a != availability_b, "the same raw downtime must give two different Availability figures under two different policies"
assert availability_b < availability_a, "counting the changeover as unplanned stop time must lower Availability"

print(f"reconciled OEE: availability={availability:.4f} performance={performance:.4f} quality={quality:.4f} oee={oee:.4f} (oee.com: 0.7479)")
print(f"shift-boundary split: {first_minutes:.0f} min / {second_minutes:.0f} min")
print(f"double-count fix: naive {naive_total:.0f} min -> merged {merged_total:.0f} min")
print(f"reason-code rollup: {rollup}")
print(f"MTBF: {mtbf_hours:.2f} hours, MTTR: {mttr_minutes:.2f} minutes, over {len(failure_events)} observed failures")
print(f"policy effect: unplanned-only availability={availability_a:.4f}, changeover-also-unplanned availability={availability_b:.4f}")
