"""Toy windowing aggregator: tumbling vs sliding state cost, session-window merging,
global windows with a custom trigger, and pane-per-key cleanup bounded by a watermark.
Reuses this chapter's 9.2 lab synthetic stream shape from event-time-watermarks-completeness.
"""
import random


def generate_keyed_stream(n=200, seed=7):
    """Events for one key, spaced roughly 1 time unit apart, event_time in whole units."""
    rng = random.Random(seed)
    events = []
    t = 0
    for i in range(n):
        t += rng.choice([1, 1, 1, 2])
        events.append({"id": i, "event_time": t})
    return events


# --- Tumbling vs sliding: window assignment and state cost ---

def tumbling_windows(events, size):
    """Each event belongs to exactly one window: floor(event_time / size)."""
    windows = {}
    for ev in events:
        w = ev["event_time"] // size
        windows.setdefault(w, []).append(ev["id"])
    return windows


def sliding_windows(events, size, step):
    """Each event belongs to every window whose [start, start+size) contains its event_time."""
    windows = {}
    for ev in events:
        et = ev["event_time"]
        first_start = ((et - size) // step + 1) * step
        start = max(0, first_start)
        while start <= et:
            if start <= et < start + size:
                windows.setdefault(start, []).append(ev["id"])
            start += step
    return windows


def live_pane_count(windows):
    return len(windows)


def total_assigned_copies(windows):
    """Sum of elements across all windows — one copy per window an element was assigned to."""
    return sum(len(v) for v in windows.values())


# --- Session windows that merge as gaps close ---

class SessionWindow:
    def __init__(self, start, end, ids):
        self.start = start
        self.end = end
        self.ids = list(ids)

    def overlaps_or_adjacent(self, other):
        return self.start <= other.end and other.start <= self.end


def assign_session_window(event, gap):
    """Each element gets its own candidate window extending `gap` beyond its timestamp,
    per the Dataflow Model's AssignWindows step for sessions."""
    et = event["event_time"]
    return SessionWindow(et, et + gap, [event["id"]])


def merge_session_windows(windows):
    """Repeatedly merge any two windows that overlap or touch, per MergeWindows."""
    merged = True
    while merged:
        merged = False
        for i in range(len(windows)):
            for j in range(i + 1, len(windows)):
                if windows[i].overlaps_or_adjacent(windows[j]):
                    a, b = windows[i], windows[j]
                    new = SessionWindow(min(a.start, b.start), max(a.end, b.end), a.ids + b.ids)
                    windows = [w for k, w in enumerate(windows) if k not in (i, j)] + [new]
                    merged = True
                    break
            if merged:
                break
    return windows


def run_session_merge_demo(gap=4):
    """Two sessions, separated by a gap wide enough to stay apart, then a late record
    lands inside that gap and the two sessions merge into one."""
    events = [
        {"id": "a1", "event_time": 0},
        {"id": "a2", "event_time": 1},
        {"id": "b1", "event_time": gap + 2},
        {"id": "b2", "event_time": gap + 3},
    ]
    windows = [assign_session_window(e, gap) for e in events]
    before = merge_session_windows(windows)

    late = {"id": "late", "event_time": 3}
    windows_with_late = [assign_session_window(e, gap) for e in events] + [assign_session_window(late, gap)]
    after = merge_session_windows(windows_with_late)
    return before, after


# --- Global windows need a custom trigger ---

class CountTrigger:
    """Fires once the global window's buffered element count reaches `threshold`."""
    def __init__(self, threshold):
        self.threshold = threshold

    def should_fire(self, buffered_count):
        return buffered_count % self.threshold == 0 and buffered_count > 0


def run_global_window_no_trigger(events):
    """A global window with Flink's own default trigger (fire when the watermark passes
    the window's end) never fires, since the global window has no end."""
    buffered = list(events)
    fired_outputs = []
    watermark_passes_window_end = False
    if watermark_passes_window_end:
        fired_outputs.append(sum(1 for _ in buffered))
    return buffered, fired_outputs


def run_global_window_custom_trigger(events, threshold=25):
    trigger = CountTrigger(threshold)
    buffered = []
    fired_outputs = []
    for ev in events:
        buffered.append(ev)
        if trigger.should_fire(len(buffered)):
            fired_outputs.append(len(buffered))
    return buffered, fired_outputs


# --- Pane-per-key state cleanup, bounded by the watermark (+ allowed lateness) ---

def compute_watermark(events_seen_so_far, bound):
    if not events_seen_so_far:
        return -1
    return max(e["event_time"] for e in events_seen_so_far) - bound


def run_pane_cleanup_demo(events, window_size=10, bound=18, allowed_lateness=5):
    """Panes (per-window accumulator state) open on first arrival, close and drop their
    state once the watermark passes window_end + allowed_lateness. Once the source goes
    idle at end of stream, the watermark advances to infinity and every remaining pane
    must close too, so live pane count drops to zero."""
    panes = {}
    live_counts = []
    seen = []
    for ev in events:
        seen.append(ev)
        w = ev["event_time"] // window_size
        panes.setdefault(w, []).append(ev["id"])
        wm = compute_watermark(seen, bound)
        closed = [w2 for w2 in panes if (w2 * window_size + window_size - 1) + allowed_lateness < wm]
        for w2 in closed:
            del panes[w2]
        live_counts.append(len(panes))

    # Source goes idle: watermark advances to infinity, every remaining pane closes.
    peak_before_drain = max(live_counts)
    for _ in panes.copy():
        panes.popitem()
        live_counts.append(len(panes))
    return live_counts, peak_before_drain


if __name__ == "__main__":
    events = generate_keyed_stream()

    tumbling = tumbling_windows(events, size=10)
    sliding = sliding_windows(events, size=10, step=5)
    assert live_pane_count(sliding) >= live_pane_count(tumbling)
    tumbling_copies = total_assigned_copies(tumbling)
    sliding_copies = total_assigned_copies(sliding)
    assert tumbling_copies == len(events)
    assert sliding_copies > tumbling_copies
    overlap_factor = sliding_copies / tumbling_copies
    print(f"tumbling: {live_pane_count(tumbling)} panes, {tumbling_copies} assigned copies")
    print(f"sliding (50% overlap): {live_pane_count(sliding)} panes, {sliding_copies} assigned copies")
    print(f"sliding state-cost multiplier vs tumbling: {overlap_factor:.2f}x")
    assert 1.8 <= overlap_factor <= 2.2

    before, after = run_session_merge_demo(gap=4)
    assert len(before) == 2, f"expected 2 separate sessions before the late record, got {len(before)}"
    assert len(after) == 1, f"expected the late record to merge both sessions into 1, got {len(after)}"
    merged = after[0]
    assert set(merged.ids) == {"a1", "a2", "b1", "b2", "late"}
    print(f"session merge: {len(before)} sessions before the late record, {len(after)} after")

    no_trigger_events = [{"id": i, "event_time": i} for i in range(60)]
    buffered_nt, outputs_nt = run_global_window_no_trigger(no_trigger_events)
    assert outputs_nt == [], "a global window with the default trigger must never fire"
    buffered_ct, outputs_ct = run_global_window_custom_trigger(no_trigger_events, threshold=25)
    assert outputs_ct == [25, 50], f"expected fires at 25 and 50 elements, got {outputs_ct}"
    print(f"global window, default trigger: {len(outputs_nt)} outputs (never fires)")
    print(f"global window, custom count trigger: fires at {outputs_ct}")

    live_counts, peak = run_pane_cleanup_demo(events)
    assert peak >= 1
    assert live_counts[-1] == 0, "live pane count must drop to zero once the source goes idle"
    print(f"pane-per-key cleanup: peak {peak} live panes while streaming, 0 live once the source goes idle")

    print("all checks passed")
