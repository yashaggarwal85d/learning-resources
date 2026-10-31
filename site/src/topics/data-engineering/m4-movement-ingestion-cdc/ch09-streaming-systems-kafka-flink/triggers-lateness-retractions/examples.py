"""Toy windowed aggregator: early/on-time/late firings for one window, allowed lateness vs
dropping, the three accumulation modes (discarding, accumulating, accumulating-and-retracting),
and a downstream sum-of-sums that goes wrong under the wrong mode.
"""


class Pane:
    """One window's accumulator state: the records seen so far, and whether it's still open."""
    def __init__(self, end, allowed_lateness):
        self.end = end
        self.close_at = end + allowed_lateness
        self.values = []
        self.last_reported_total = 0
        self.open = True

    def add(self, value):
        self.values.append(value)

    def total(self):
        return sum(self.values)


def run_firings(records, window_end, allowed_lateness, early_after=2):
    """Replays records (value, event_time, arrival_order) against one window, emitting a firing
    each time: after `early_after` elements have arrived (early), when the watermark first passes
    window_end (on time), and again each time a late-but-not-dropped record arrives (late)."""
    pane = Pane(window_end, allowed_lateness)
    firings = []  # (kind, total_at_firing)
    watermark = -1
    fired_on_time = False

    for value, event_time, arrival_watermark in records:
        watermark = max(watermark, arrival_watermark)
        if watermark > pane.close_at:
            continue  # arrives after the pane has already closed: dropped, no firing at all
        pane.add(value)
        if not fired_on_time and len(pane.values) == early_after:
            firings.append(("early", pane.total()))
        if not fired_on_time and watermark >= window_end:
            fired_on_time = True
            firings.append(("on-time", pane.total()))
        elif fired_on_time and watermark <= pane.close_at:
            firings.append(("late", pane.total()))

    return firings, pane


def apply_discarding(firings):
    """Each firing reports only the delta since the previous firing."""
    reported = []
    prev_total = 0
    for _kind, total in firings:
        reported.append(total - prev_total)
        prev_total = total
    return reported


def apply_accumulating(firings):
    """Each firing reports the full current total, superseding the previous report."""
    return [total for _kind, total in firings]


def apply_accumulating_and_retracting(firings):
    """Each firing emits a retraction of its previous value, then the new value."""
    stream = []
    prev_total = 0
    for _kind, total in firings:
        if prev_total:
            stream.append(-prev_total)
        stream.append(total)
        prev_total = total
    return stream


def downstream_sum_assuming_accumulating(reported_values):
    """A naive downstream sum-of-sums that just adds up whatever it receives, assuming
    accumulating mode (each value supersedes the last, so only the final one should count,
    but a sum-of-sums consumer sums everything blindly regardless)."""
    return sum(reported_values)


if __name__ == "__main__":
    window_end = 10
    allowed_lateness = 5

    records = [
        (3, 1, -1),
        (4, 2, -1),
        (5, 4, 8),
        (2, 7, 10),
        (6, 9, 13),
        (9, 20, 20),
    ]

    firings, pane = run_firings(records, window_end, allowed_lateness)
    kinds = [k for k, _ in firings]
    assert kinds == ["early", "on-time", "late"], f"expected early, on-time, late firings, got {kinds}"
    early_total, on_time_total, late_total = (t for _, t in firings)
    assert early_total == 7, f"early firing should total 3+4=7, got {early_total}"
    assert on_time_total == 14, f"on-time firing should total 3+4+5+2=14, got {on_time_total}"
    assert late_total == 20, f"late firing should total 3+4+5+2+6=20, got {late_total}"
    print(f"firings for this window: {[(k, t) for k, t in firings]}")

    dropped_value, dropped_event_time, dropped_watermark = 9, 20, 20
    assert dropped_watermark > pane.close_at, "the last record must land after the pane closes"
    ground_truth_with_everything = 3 + 4 + 5 + 2 + 6 + 9
    assert pane.total() != ground_truth_with_everything
    assert pane.total() == 20, f"the pane's final total should exclude the dropped record, got {pane.total()}"
    print(f"allowed lateness closes the pane at watermark {pane.close_at}; "
          f"a record at watermark {dropped_watermark} arrives after that and is dropped, "
          f"final total {pane.total()} (not {ground_truth_with_everything})")

    discarding = apply_discarding(firings)
    accumulating = apply_accumulating(firings)
    retracting = apply_accumulating_and_retracting(firings)
    assert discarding == [7, 7, 6], f"discarding should report deltas [7, 7, 6], got {discarding}"
    assert accumulating == [7, 14, 20], f"accumulating should report running totals, got {accumulating}"
    assert retracting == [7, -7, 14, -14, 20], f"retracting should interleave retractions, got {retracting}"

    true_final_total = pane.total()
    naive_sum_discarding = downstream_sum_assuming_accumulating(discarding)
    naive_sum_accumulating = downstream_sum_assuming_accumulating(accumulating)
    naive_sum_retracting = downstream_sum_assuming_accumulating(retracting)

    assert naive_sum_discarding == true_final_total, (
        f"a sum-of-sums downstream happens to get discarding mode right: "
        f"{naive_sum_discarding} == {true_final_total}"
    )
    assert naive_sum_accumulating != true_final_total, (
        "a sum-of-sums downstream must get accumulating mode wrong by double-counting"
    )
    assert naive_sum_accumulating == 41, f"expected the wrong total 41, got {naive_sum_accumulating}"
    assert naive_sum_retracting == true_final_total, (
        f"a sum-of-sums downstream that applies every value, including retractions, "
        f"gets the right answer under accumulating-and-retracting: "
        f"{naive_sum_retracting} == {true_final_total}"
    )
    print(f"ground truth: {true_final_total}")
    print(f"downstream sum-of-sums under discarding: {naive_sum_discarding} (correct)")
    print(f"downstream sum-of-sums under accumulating: {naive_sum_accumulating} (wrong, double-counted)")
    print(f"downstream sum-of-sums under accumulating-and-retracting: {naive_sum_retracting} (correct)")

    print("all checks passed")
