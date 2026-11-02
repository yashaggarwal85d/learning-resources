"""A synthetic fleet of sensors with four planted fault types (flatline, spike,
out-of-range/impossible, firmware scale change), detected with a windowed
variance/run-length check, a range check, a MAD-based spike detector, and a
change-point (median level shift) detector, scored for precision and recall;
a gateway-replay dedup and a backfill-vs-clock-fault classifier; a quality-flag
and quarantine table that never deletes a point; and the measured per-point
compute cost of running every check, extrapolated to the plant's own write rate."""

from __future__ import annotations

import math
import random
import time
from dataclasses import dataclass, field

random.seed(20261031)

N_SENSORS = 20
INTERVAL_SECONDS = 5
HOURS = 3
N_POINTS = (HOURS * 60 * 60) // INTERVAL_SECONDS  # 2160 points/sensor

ABSOLUTE_ZERO_C = -273.15  # NIST: 0 K = -273.15 degrees C


def build_fleet() -> tuple[dict[int, list[float]], dict[int, set[int]]]:
    """A baseline process-like signal (slow drift + noise) per sensor, with
    four sensors each carrying one planted fault type. Returns the values and
    the ground-truth set of faulted indices per sensor."""
    fleet: dict[int, list[float]] = {}
    ground_truth: dict[int, set[int]] = {s: set() for s in range(N_SENSORS)}

    for s in range(N_SENSORS):
        base = 50.0 + 5.0 * math.sin(s)
        values = [base + 3.0 * math.sin(i / 97.0) + random.gauss(0, 0.4) for i in range(N_POINTS)]
        fleet[s] = values

    # Sensor 0: flatline — frozen at its own value for a long stretch (the hook's furnace).
    flat_start, flat_end = 400, 1400
    frozen = fleet[0][flat_start]
    for i in range(flat_start, flat_end):
        fleet[0][i] = frozen
    ground_truth[0] |= set(range(flat_start, flat_end))

    # Sensor 1: a handful of isolated spikes (robust-to-itself test for the MAD detector).
    spike_indices = [300, 900, 1700]
    for i in spike_indices:
        fleet[1][i] += 40.0
    ground_truth[1] |= set(spike_indices)

    # Sensor 2: out-of-range / physically impossible — briefly below absolute zero.
    oor_start, oor_end = 600, 620
    for i in range(oor_start, oor_end):
        fleet[2][i] = ABSOLUTE_ZERO_C - 10.0
    ground_truth[2] |= set(range(oor_start, oor_end))

    # Sensor 3: firmware scale change — a unit/scale re-mapping shifts the median at one timestamp.
    scale_change_at = 1080
    for i in range(scale_change_at, N_POINTS):
        fleet[3][i] = fleet[3][i] * 1.8 + 32.0  # a C-to-F-shaped re-scaling
    ground_truth[3] |= set(range(scale_change_at, N_POINTS))

    return fleet, ground_truth


def detect_flatline(values: list[float], window: int = 20, min_variance: float = 1e-6) -> set[int]:
    """A rolling variance over a trailing window; a window whose variance is
    effectively zero is flagged across its own span."""
    flagged: set[int] = set()
    for i in range(window, len(values)):
        segment = values[i - window : i]
        mean = sum(segment) / window
        variance = sum((x - mean) ** 2 for x in segment) / window
        if variance < min_variance:
            flagged.update(range(i - window, i))
    return flagged


def detect_range(values: list[float], low: float, high: float) -> set[int]:
    return {i for i, v in enumerate(values) if v < low or v > high}


def detect_rate_of_change(values: list[float], interval_seconds: float, max_rate: float) -> set[int]:
    flagged: set[int] = set()
    for i in range(1, len(values)):
        rate = abs(values[i] - values[i - 1]) / interval_seconds
        if rate > max_rate:
            flagged.add(i)
    return flagged


def _median(xs: list[float]) -> float:
    s = sorted(xs)
    n = len(s)
    mid = n // 2
    return s[mid] if n % 2 else (s[mid - 1] + s[mid]) / 2


def detect_spike_mad(values: list[float], window: int = 10, k: float = 6.0) -> set[int]:
    """A median/MAD outlier test over a short window that EXCLUDES the
    candidate point itself, so a single spike can't drag its own baseline."""
    flagged: set[int] = set()
    half = window // 2
    for i in range(half, len(values) - half):
        neighborhood = values[i - half : i] + values[i + 1 : i + 1 + half]
        med = _median(neighborhood)
        mad = _median([abs(x - med) for x in neighborhood]) or 1e-9
        if abs(values[i] - med) > k * mad * 1.4826:
            flagged.add(i)
    return flagged


def detect_change_point(values: list[float], window: int = 60, min_shift: float = 3.0) -> set[int]:
    """Compares the median of the window before a candidate split against the
    median of the window after it; a split whose shift exceeds the threshold
    marks every point from that split onward as having moved to a new level."""
    flagged: set[int] = set()
    for split in range(window, len(values) - window):
        before = _median(values[split - window : split])
        after = _median(values[split : split + window])
        if abs(after - before) > min_shift:
            flagged.add(split)
    if not flagged:
        return flagged
    first_shift = min(flagged)
    return set(range(first_shift, len(values)))


@dataclass
class ScoreCard:
    tp: int = 0
    fp: int = 0
    fn: int = 0

    def precision(self) -> float:
        return self.tp / (self.tp + self.fp) if (self.tp + self.fp) else 1.0

    def recall(self) -> float:
        return self.tp / (self.tp + self.fn) if (self.tp + self.fn) else 1.0


def score(flagged: set[int], truth: set[int], n: int) -> ScoreCard:
    card = ScoreCard()
    for i in range(n):
        in_flag, in_truth = i in flagged, i in truth
        if in_flag and in_truth:
            card.tp += 1
        elif in_flag and not in_truth:
            card.fp += 1
        elif in_truth and not in_flag:
            card.fn += 1
    return card


@dataclass
class Reading:
    series_id: int
    t_device: int
    t_gateway: int
    gateway_seq: int
    value: float


def dedup_by_idempotent_key(readings: list[Reading]) -> list[Reading]:
    seen: set[tuple[int, int, int]] = set()
    deduped: list[Reading] = []
    for r in readings:
        key = (r.series_id, r.t_device, r.gateway_seq)
        if key in seen:
            continue
        seen.add(key)
        deduped.append(r)
    return deduped


def classify_late_arrival(t_device: int, t_gateway: int) -> str:
    """A reading whose device timestamp is at or before the gateway's own
    receipt timestamp is a legitimate backfill (an outage held it back). A
    reading whose device timestamp is AFTER the gateway ever saw it is
    impossible under a correct clock — it's a clock fault, not a backfill."""
    if t_device <= t_gateway:
        return "backfill"
    return "clock_fault"


class QualityFlag:
    GOOD = "good"
    SUSPECT = "suspect"
    BAD = "bad"


@dataclass
class QuarantineEntry:
    sensor_id: int
    index: int
    value: float
    rule: str
    flag: str


def build_quarantine(
    fleet: dict[int, list[float]],
    hard_rules: dict[int, set[int]],
    soft_rules: dict[int, set[int]],
) -> tuple[list[QuarantineEntry], dict[int, list[float]]]:
    """Flags points by severity and routes them to a quarantine list. The
    original series is returned UNCHANGED (same length, same values) — nothing
    is ever deleted, per CHAPTER.md's own rule."""
    quarantine: list[QuarantineEntry] = []
    original_lengths = {s: len(v) for s, v in fleet.items()}
    for s in fleet:
        for i in sorted(hard_rules.get(s, set())):
            quarantine.append(QuarantineEntry(s, i, fleet[s][i], "hard", QualityFlag.BAD))
        for i in sorted(soft_rules.get(s, set()) - hard_rules.get(s, set())):
            quarantine.append(QuarantineEntry(s, i, fleet[s][i], "soft", QualityFlag.SUSPECT))
    assert all(len(fleet[s]) == original_lengths[s] for s in fleet), "quarantine must never shrink the original series"
    return quarantine, fleet


def main() -> None:
    fleet, ground_truth = build_fleet()

    start = time.perf_counter()
    hard_flags: dict[int, set[int]] = {}
    soft_flags: dict[int, set[int]] = {}
    for s, values in fleet.items():
        flat = detect_flatline(values)
        rng = detect_range(values, ABSOLUTE_ZERO_C, 200.0)
        spike = detect_spike_mad(values)
        rate = detect_rate_of_change(values, INTERVAL_SECONDS, max_rate=4.0)
        change = detect_change_point(values)
        hard_flags[s] = flat | rng | spike
        soft_flags[s] = rate | change
    elapsed = time.perf_counter() - start

    total_points = N_SENSORS * N_POINTS
    per_point_seconds = elapsed / total_points
    assert per_point_seconds > 0

    # --- precision/recall over the point-rule faults (flatline, spike, out-of-range);
    #     the firmware scale change is a level shift, scored separately below, since a
    #     change-point detector answers a different question than a per-point rule does ---
    point_rule_sensors = {0, 1, 2}
    all_flagged = {(s, i) for s, idxs in hard_flags.items() for i in idxs}
    all_truth = {(s, i) for s, idxs in ground_truth.items() if s in point_rule_sensors for i in idxs}
    tp = len(all_flagged & all_truth)
    fp = len(all_flagged - all_truth)
    fn = len(all_truth - all_flagged)
    precision = tp / (tp + fp) if (tp + fp) else 1.0
    recall = tp / (tp + fn) if (tp + fn) else 1.0
    assert precision > 0.8, f"precision too low: {precision:.3f}"
    assert recall > 0.8, f"recall too low: {recall:.3f}"

    # --- each fault type is individually caught by its own named rule ---
    assert ground_truth[0] & detect_flatline(fleet[0]), "the flatline must be caught by the flatline check"
    assert set(range(600, 620)) <= detect_range(fleet[2], ABSOLUTE_ZERO_C, 200.0), "the impossible reading must be caught by the range check"
    spike_hits = detect_spike_mad(fleet[1])
    assert {300, 900, 1700} <= spike_hits, "every planted spike must be caught by the MAD detector"
    change_hits = detect_change_point(fleet[3])
    assert 1080 in change_hits or any(abs(c - 1080) <= 60 for c in change_hits), "the firmware scale change must be caught near its own timestamp"

    # --- dedup and backfill-vs-clock-fault ---
    base_readings = [Reading(series_id=7, t_device=1000 + i, t_gateway=1000 + i, gateway_seq=i, value=1.0) for i in range(50)]
    replayed = base_readings + base_readings[10:20]  # the gateway resends a chunk after an outage
    deduped = dedup_by_idempotent_key(replayed)
    assert len(deduped) == len(base_readings), "an exact gateway replay must dedupe back to the original batch"

    assert classify_late_arrival(t_device=500, t_gateway=900) == "backfill"
    assert classify_late_arrival(t_device=950, t_gateway=900) == "clock_fault"

    # --- quality flags and quarantine, never deleting ---
    quarantine, surviving_fleet = build_quarantine(fleet, hard_flags, soft_flags)
    assert len(quarantine) > 0
    assert all(len(surviving_fleet[s]) == N_POINTS for s in surviving_fleet), "quarantine must leave every original series intact"
    bad_entries = [q for q in quarantine if q.flag == QualityFlag.BAD]
    suspect_entries = [q for q in quarantine if q.flag == QualityFlag.SUSPECT]
    assert bad_entries and suspect_entries, "both severities must appear across the fleet's planted faults"

    # --- cost of the checks, extrapolated to the plant's own write rate (topic 13: ~129.7 samples/sec) ---
    PLANT_SAMPLES_PER_SECOND = 129.7
    compute_seconds_per_second_of_data = per_point_seconds * PLANT_SAMPLES_PER_SECOND
    assert compute_seconds_per_second_of_data < 1.0, "checking every point must cost less compute time than the second of data it covers"

    print("all detector/precision-recall/dedup/quarantine/cost assertions passed")
    print(f"  precision: {precision:.3f}, recall: {recall:.3f} (tp={tp}, fp={fp}, fn={fn})")
    print(f"  per-point check cost: {per_point_seconds*1e6:.2f} microseconds")
    print(f"  at the plant's write rate: {compute_seconds_per_second_of_data*1000:.3f} ms of compute per second of data")
    print(f"  quarantine: {len(quarantine)} entries ({len(bad_entries)} bad, {len(suspect_entries)} suspect), 0 points deleted")


if __name__ == "__main__":
    main()
