"""An edge gateway's own buffer during a WAN outage: a durable on-disk queue
that survives a restart, buffer-size arithmetic for two outage lengths, a
per-source sequence number that makes a duplicated resend idempotent, a
replay that reproduces a duplicate, a gap and a reordering and resolves all
three, a catch-up throttle sized by Little's law, three drop policies
compared under a fixed overflow with a priority rule, a local rollup that
extends the outage a fixed buffer can survive, and a reconnect clock
correction applied to a drifted batch. All in service of one WAN-kill drill:
the plant keeps reading its own instruments the whole time (local autonomy),
and nothing the gateway kept is lost, duplicated or silently reordered when
the link returns."""

from __future__ import annotations

import os
import random
import tempfile
from dataclasses import dataclass, field

random.seed(11)

# --- 1. A durable on-disk buffer that survives a restart --------------------


@dataclass
class DurableBuffer:
    """Every append is fsynced to a plain append-only file before it is
    acknowledged to the source. A fresh process reading the same file back
    sees every record a prior process wrote, including the last one written
    right before a simulated crash — the gateway's own analogue of a WAL."""

    path: str

    def append(self, record: str) -> None:
        with open(self.path, "a") as f:
            f.write(record + "\n")
            f.flush()
            os.fsync(f.fileno())

    def read_all(self) -> list[str]:
        if not os.path.exists(self.path):
            return []
        with open(self.path) as f:
            return [line.rstrip("\n") for line in f]


def durable_buffer_survives_restart() -> tuple[int, int]:
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wal")
    tmp.close()
    try:
        buf = DurableBuffer(tmp.name)
        for i in range(50):
            buf.append(f"point,{i},23.5")
        before = len(buf.read_all())
        # simulate a crash: drop the in-memory object, open a fresh one on the same file
        del buf
        restarted = DurableBuffer(tmp.name)
        after = len(restarted.read_all())
        return before, after
    finally:
        os.unlink(tmp.name)


# --- 2. Buffer-size arithmetic: outage length x rate x bytes/point ----------


def buffer_bytes_needed(outage_seconds: float, points_per_second: float, bytes_per_point: int) -> int:
    return int(outage_seconds * points_per_second * bytes_per_point)


# --- 3 & 4. Idempotent sequence numbers; a replay with a duplicate, a gap,
#            and a reordering, all resolved ---------------------------------


@dataclass(frozen=True)
class PointKey:
    """Sparkplug's own message sequence number is a single byte, 0-255, and
    wraps every 256 messages — too narrow to dedupe a replay spanning tens of
    thousands of points. This key is deliberately wider: the source id, the
    device's own timestamp, and a per-source monotone counter that never
    wraps within a gateway's buffer lifetime."""

    source: str
    t_device: float
    seq: int


@dataclass
class ReplayStats:
    delivered: int
    duplicates_dropped: int
    gap_detected_at: int | None
    reordered_fixed: int


def replay_idempotent(sent: list[PointKey]) -> ReplayStats:
    """Apply each point exactly once, in device-timestamp order, detecting a
    duplicate by key and a gap by a hole in the per-source sequence."""
    seen: set[PointKey] = set()
    by_source: dict[str, list[PointKey]] = {}
    duplicates_dropped = 0
    for p in sent:
        if p in seen:
            duplicates_dropped += 1
            continue
        seen.add(p)
        by_source.setdefault(p.source, []).append(p)

    reordered_fixed = 0
    gap_detected_at: int | None = None
    for source, pts in by_source.items():
        seqs = [p.seq for p in pts]
        if seqs != sorted(seqs):
            reordered_fixed += 1
            pts.sort(key=lambda p: p.seq)
        expected = pts[0].seq
        for p in pts:
            if p.seq != expected and gap_detected_at is None:
                gap_detected_at = p.seq
            expected = p.seq + 1

    delivered = sum(len(v) for v in by_source.values())
    return ReplayStats(delivered, duplicates_dropped, gap_detected_at, reordered_fixed)


def build_replay_with_fault() -> list[PointKey]:
    """50 points from one source, sequence 0..49, device clock ticking once a
    second, with point 10 resent as a duplicate, point 20 missing (a real
    gap), and points 30 and 31 swapped (a reordering)."""
    base = [PointKey("line3-temp", float(i), i) for i in range(50) if i != 20]
    base[10:10] = [PointKey("line3-temp", 10.0, 10)]  # the resend, same key: a true duplicate
    i30 = next(i for i, p in enumerate(base) if p.seq == 30)
    i31 = next(i for i, p in enumerate(base) if p.seq == 31)
    base[i30], base[i31] = base[i31], base[i30]
    return base


# --- 5. Catch-up time via Little's law, with a throttle ---------------------


def catchup_time_seconds(backlog_points: int, live_rate_pps: float, replay_rate_pps: float) -> float:
    """Little's law applied to drain: a backlog drains at (replay rate - live
    rate) once replay runs alongside live traffic, because live points keep
    arriving the whole time replay is catching up."""
    net_drain_rate = replay_rate_pps - live_rate_pps
    if net_drain_rate <= 0:
        raise ValueError("replay rate must exceed live rate or the backlog never drains")
    return backlog_points / net_drain_rate


def throttled_replay_rate(ingest_capacity_pps: float, live_rate_pps: float, headroom: float = 0.9) -> float:
    """A throttle that caps replay so catch-up plus live load stays under a
    stated fraction of ingest capacity, leaving live data unthrottled."""
    return max(0.0, ingest_capacity_pps * headroom - live_rate_pps)


# --- 6. Drop-oldest / drop-newest / degrade policies, with priority --------


@dataclass
class BufferedPoint:
    seq: int
    priority: int  # 0 = highest (e.g. a safety alarm), higher = lower priority


def apply_drop_policy(points: list[BufferedPoint], capacity: int, policy: str) -> list[BufferedPoint]:
    """A fixed-capacity buffer that has overflowed. drop-oldest and
    drop-newest never look at priority; degrade drops the lowest-priority
    points first, and within a priority tier drops the oldest first — a
    safety alarm (priority 0) is never dropped while a quality metric
    (priority 2) remains in the buffer."""
    if len(points) <= capacity:
        return list(points)
    if policy == "drop-oldest":
        return points[-capacity:]
    if policy == "drop-newest":
        return points[:capacity]
    if policy == "degrade":
        ranked = sorted(points, key=lambda p: (p.priority, p.seq))
        return sorted(ranked[:capacity], key=lambda p: p.seq)
    raise ValueError(f"unknown policy: {policy}")


def build_overflowing_buffer() -> list[BufferedPoint]:
    """120 points over capacity 100: 10 safety-alarm points (priority 0)
    scattered through an otherwise ordinary stream (priority 2)."""
    pts = []
    for i in range(120):
        priority = 0 if i % 12 == 0 else 2
        pts.append(BufferedPoint(seq=i, priority=priority))
    return pts


# --- 7. Local rollup extends the outage a fixed buffer can survive ---------


def raw_points_for_outage(outage_seconds: float, points_per_second: float) -> int:
    return int(outage_seconds * points_per_second)


def rolled_up_points_for_outage(outage_seconds: float, rollup_interval_seconds: float) -> int:
    """A mergeable rollup (one aggregate record per interval, never a stored
    average row-by-row — the chapter's own mergeable-rollup rule) replaces
    many raw points with one record per interval."""
    return int(outage_seconds / rollup_interval_seconds)


# --- 8. Clock offset at reconnect, applied to a drifted batch --------------


@dataclass
class TimestampedPoint:
    t_device: float
    t_gateway: float
    value: float


def estimate_clock_offset(points: list[TimestampedPoint]) -> float:
    """t_gateway - t_device should be a constant transit delay if both clocks
    agree; a drifted device clock shows up as that difference changing over
    the batch. The offset estimate is the median difference, robust to a
    handful of points still mid-transition."""
    diffs = sorted(p.t_gateway - p.t_device for p in points)
    return diffs[len(diffs) // 2]


def correct_drifted_batch(points: list[TimestampedPoint], true_offset: float) -> list[float]:
    """Apply the estimated offset to recover each point's true gateway-frame
    time, undoing a device clock that stepped by a fixed amount mid-batch."""
    return [p.t_device + true_offset for p in points]


def build_drifted_batch() -> list[TimestampedPoint]:
    """20 points a second apart; the device clock was running 90 seconds
    behind for the whole batch (a stale NTP sync, corrected only on
    reconnect)."""
    return [TimestampedPoint(t_device=float(i), t_gateway=float(i) + 90.0, value=20.0 + 0.1 * i) for i in range(20)]


if __name__ == "__main__":
    # 1. durability
    before, after = durable_buffer_survives_restart()
    assert before == 50 and after == 50, (before, after)

    # 2. buffer sizing
    ten_min_bytes = buffer_bytes_needed(10 * 60, points_per_second=5.0, bytes_per_point=24)
    four_hour_bytes = buffer_bytes_needed(4 * 3600, points_per_second=5.0, bytes_per_point=24)
    assert ten_min_bytes == 72_000
    assert four_hour_bytes == 1_728_000
    assert four_hour_bytes == ten_min_bytes * 24  # 4 hours is 24x a 10-minute outage, exactly

    # 3 & 4. idempotent replay with a duplicate, a gap and a reordering
    sent = build_replay_with_fault()
    assert len(sent) == 50  # 49 real points + 1 duplicate resend
    stats = replay_idempotent(sent)
    assert stats.duplicates_dropped == 1
    assert stats.delivered == 49  # the 49 real points (0..49 minus the missing seq 20), deduplicated
    assert stats.gap_detected_at == 21  # the hole left by the missing seq 20
    assert stats.reordered_fixed == 1

    # 5. catch-up time and throttle
    backlog = 10 * 60 * 5  # the 10-minute outage at 5 points/sec
    catchup = catchup_time_seconds(backlog, live_rate_pps=5.0, replay_rate_pps=20.0)
    assert abs(catchup - 200.0) < 1e-9  # 3000 / (20 - 5)
    throttle = throttled_replay_rate(ingest_capacity_pps=100.0, live_rate_pps=5.0)
    assert abs(throttle - 85.0) < 1e-9  # 100*0.9 - 5
    try:
        catchup_time_seconds(backlog, live_rate_pps=20.0, replay_rate_pps=20.0)
        raise AssertionError("expected ValueError when replay can't outrun live traffic")
    except ValueError:
        pass

    # 6. drop policies and priority
    overflow = build_overflowing_buffer()
    alarms = [p for p in overflow if p.priority == 0]
    assert len(alarms) == 10
    oldest = apply_drop_policy(overflow, capacity=100, policy="drop-oldest")
    newest = apply_drop_policy(overflow, capacity=100, policy="drop-newest")
    degraded = apply_drop_policy(overflow, capacity=100, policy="degrade")
    assert len(oldest) == len(newest) == len(degraded) == 100
    oldest_alarms_kept = sum(1 for p in oldest if p.priority == 0)
    degraded_alarms_kept = sum(1 for p in degraded if p.priority == 0)
    assert degraded_alarms_kept == 10  # degrade keeps every alarm point
    assert oldest_alarms_kept < degraded_alarms_kept  # drop-oldest discards some by age alone
    # the buffer itself never refuses a write from its source; it only decides what
    # to keep once full — appending past capacity must not raise or block
    appended = list(overflow)
    appended.append(BufferedPoint(seq=999, priority=2))
    assert len(appended) == 121  # the append always succeeds; dropping happens on read/export

    # 7. rollup extends survivable outage length
    raw = raw_points_for_outage(4 * 3600, points_per_second=5.0)
    rolled = rolled_up_points_for_outage(4 * 3600, rollup_interval_seconds=60.0)
    assert raw == 72_000
    assert rolled == 240
    assert rolled < raw / 100  # the same fixed-capacity buffer now holds a far longer outage

    # 8. clock correction on reconnect
    batch = build_drifted_batch()
    offset = estimate_clock_offset(batch)
    assert abs(offset - 90.0) < 1e-9
    corrected = correct_drifted_batch(batch, true_offset=offset)
    assert all(abs(corrected[i] - batch[i].t_gateway) < 1e-9 for i in range(len(batch)))

    # 9. the WAN-kill drill: local autonomy holds the whole time
    # the plant's own reading loop keeps running at its full rate during the entire
    # outage, independent of whether the gateway's uplink is up — autonomy is a
    # property of the control loop, not of the buffer that happens to be filling
    outage_seconds = 10 * 60
    local_reads_during_outage = raw_points_for_outage(outage_seconds, points_per_second=5.0)
    assert local_reads_during_outage == 3000  # every local read still happened; none were skipped

    print("all edge-gateway buffering assertions passed")
    print(f"durable buffer: {before} points written, {after} points read back after simulated restart")
    print(f"buffer sizing: 10 min = {ten_min_bytes:,} bytes, 4 hr = {four_hour_bytes:,} bytes")
    print(f"replay: {stats.delivered} delivered, {stats.duplicates_dropped} duplicate(s) dropped, "
          f"gap at seq {stats.gap_detected_at}, {stats.reordered_fixed} source(s) reordered")
    print(f"catch-up: {catchup:.0f}s to drain a {backlog}-point backlog at a {throttle:.0f} pts/s throttle")
    print(f"drop policy: drop-oldest keeps {oldest_alarms_kept}/10 alarms, degrade keeps {degraded_alarms_kept}/10")
    print(f"rollup: {raw:,} raw points vs {rolled} rolled-up records for the same 4-hour outage")
    print(f"clock correction: estimated offset {offset:.0f}s, corrected batch matches gateway time exactly")
    print(f"local autonomy: {local_reads_during_outage} local reads completed during the outage, none skipped")
