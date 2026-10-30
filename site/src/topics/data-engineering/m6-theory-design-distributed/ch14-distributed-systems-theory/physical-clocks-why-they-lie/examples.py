"""Physical clocks: what they actually promise, computed rather than assumed.

Chapter 14's shared tool is a deterministic simulator; this topic's slice of it injects clock
skew into the chapter's `stock` register and shows last-write-wins losing a write, while also
computing the arithmetic behind quartz drift, NTP's round-trip offset estimate, and a leap
smear's disagreement window, each asserted against the primary sources quoted in SOURCES.md.
"""

from dataclasses import dataclass


# ── Quartz drift: Spanner's own quoted worst-case figure, 200 microseconds per second ──
SPANNER_WORST_CASE_DRIFT_PPM = 200  # 200 microseconds per second = 200 parts per million


def seconds_of_drift_per_day(ppm):
    seconds_per_day = 24 * 60 * 60
    return ppm * 1e-6 * seconds_per_day


def quartz_drift_is_tens_of_seconds_a_day_at_spanners_worst_case():
    drift = seconds_of_drift_per_day(SPANNER_WORST_CASE_DRIFT_PPM)
    assert 17.0 < drift < 18.0, f"expected roughly seventeen point three seconds a day, got {drift}"
    return drift


# ── NTP: the on-wire offset/delay formulas from RFC 5905 ──
def ntp_offset_and_delay(t1, t2, t3, t4):
    """t1=origin (client send), t2=receive (server recv), t3=transmit (server send),
    t4=destination (client recv). RFC 5905's own formulas for offset (theta) and
    round-trip delay (delta)."""
    offset = ((t2 - t1) + (t3 - t4)) / 2
    delay = (t4 - t1) - (t3 - t2)
    return offset, delay


def ntp_offset_formula_matches_a_known_worked_example():
    # A server that is exactly thirty milliseconds ahead of the client, with a symmetric
    # ten-millisecond one-way network delay each direction.
    t1 = 0.0
    t2 = t1 + 0.010 + 0.030  # one-way delay + the server's thirty-millisecond lead
    t3 = t2 + 0.001          # the server takes one millisecond to respond
    t4 = t3 + 0.010 - 0.030  # the return trip, minus the server's lead, in client time
    offset, delay = ntp_offset_and_delay(t1, t2, t3, t4)
    assert abs(offset - 0.030) < 1e-9, f"expected a thirty-millisecond offset, got {offset}"
    assert abs(delay - 0.020) < 1e-9, f"expected a twenty-millisecond round trip, got {delay}"
    return offset, delay


def asymmetric_delay_corrupts_the_offset_estimate():
    # The identical thirty-millisecond true offset, but now the outbound leg is much slower
    # than the return leg (an asymmetric path) -- RFC 5905's own caveat that the formula
    # assumes a symmetric path, and an asymmetric one biases the offset estimate.
    t1 = 0.0
    t2 = t1 + 0.080 + 0.030  # a slow eighty-millisecond outbound leg
    t3 = t2 + 0.001
    t4 = t3 + 0.010 - 0.030  # a fast ten-millisecond return leg
    offset, _ = ntp_offset_and_delay(t1, t2, t3, t4)
    assert abs(offset - 0.030) > 0.02, f"expected the asymmetric path to bias the offset well away from thirty ms, got {offset}"
    return offset


# ── Leap smear: Google's 24-hour linear smear vs. an abrupt step ──
LEAP_SMEAR_WINDOW_SECONDS = 24 * 60 * 60


def smeared_clock_offset_at(elapsed_seconds):
    """A linear smear spreads one extra second over the whole window: at any point inside
    it, the smeared clock has already absorbed a proportional fraction of that second."""
    if elapsed_seconds <= 0:
        return 0.0
    if elapsed_seconds >= LEAP_SMEAR_WINDOW_SECONDS:
        return 1.0
    return elapsed_seconds / LEAP_SMEAR_WINDOW_SECONDS


def smearing_and_stepping_clocks_disagree_mid_window():
    halfway = LEAP_SMEAR_WINDOW_SECONDS / 2
    smeared_offset = smeared_clock_offset_at(halfway)
    stepped_offset = 1.0  # a stepping clock applies the whole leap second at the boundary
    disagreement = abs(stepped_offset - smeared_offset)
    assert abs(smeared_offset - 0.5) < 1e-9, f"expected the smear to be half-applied at the midpoint, got {smeared_offset}"
    assert disagreement > 0.49, f"expected the two clocks to disagree by nearly half a second mid-window, got {disagreement}"
    end_offset = smeared_clock_offset_at(LEAP_SMEAR_WINDOW_SECONDS)
    assert abs(end_offset - stepped_offset) < 1e-9, "the two clocks must agree again once the smear window ends"
    return disagreement


# ── Last-write-wins under clock skew: the chapter's stock register, two writing nodes ──
@dataclass
class Clock:
    offset: float  # this node's clock minus true time, in seconds

    def now(self, true_time):
        return true_time + self.offset


def last_write_wins_loses_the_later_write_under_skew():
    # Node A's clock runs fast; node B's clock is accurate. The true, real-time order is:
    # A writes first, B writes fifty milliseconds later (B's write is the genuinely later one).
    a_clock = Clock(offset=0.100)  # A is one hundred milliseconds fast
    b_clock = Clock(offset=0.0)
    true_time_of_a_write = 0.0
    true_time_of_b_write = 0.050  # fifty milliseconds after A's write, in real time
    a_timestamp = a_clock.now(true_time_of_a_write)
    b_timestamp = b_clock.now(true_time_of_b_write)
    # last-write-wins keeps whichever write carries the larger timestamp
    kept = "A" if a_timestamp > b_timestamp else "B"
    assert true_time_of_b_write > true_time_of_a_write, "B's write is genuinely the later one in real time"
    assert kept == "A", f"expected the skewed clock to make the store keep the EARLIER write, kept {kept}"
    return a_timestamp, b_timestamp, kept


def no_loss_once_skew_is_smaller_than_the_write_gap():
    # The same two writes, but now the clock skew (ten milliseconds) is smaller than the
    # real gap between the writes (fifty milliseconds): last-write-wins gets it right.
    a_clock = Clock(offset=0.010)
    b_clock = Clock(offset=0.0)
    a_timestamp = a_clock.now(0.0)
    b_timestamp = b_clock.now(0.050)
    kept = "A" if a_timestamp > b_timestamp else "B"
    assert kept == "B", f"expected the store to correctly keep the later write once skew is smaller than the gap, kept {kept}"
    return a_timestamp, b_timestamp, kept


# ── A bounded-error clock: an interval makes "cannot order" explicit instead of guessing ──
@dataclass
class BoundedClock:
    offset: float
    error_bound: float  # the clock is correct to within plus or minus this many seconds

    def interval(self, true_time):
        reading = true_time + self.offset
        return reading - self.error_bound, reading + self.error_bound


def bounded_clocks_flag_an_unorderable_pair_instead_of_guessing():
    a_clock = BoundedClock(offset=0.100, error_bound=0.120)  # Spanner-style generous bound
    b_clock = BoundedClock(offset=0.0, error_bound=0.010)
    a_earliest, a_latest = a_clock.interval(0.0)
    b_earliest, b_latest = b_clock.interval(0.050)
    overlap = a_earliest <= b_latest and b_earliest <= a_latest
    assert overlap, "the two intervals should overlap, correctly flagging the pair as unorderable rather than silently picking one"
    return (a_earliest, a_latest), (b_earliest, b_latest), overlap


def main():
    drift = quartz_drift_is_tens_of_seconds_a_day_at_spanners_worst_case()
    offset, delay = ntp_offset_formula_matches_a_known_worked_example()
    biased_offset = asymmetric_delay_corrupts_the_offset_estimate()
    disagreement = smearing_and_stepping_clocks_disagree_mid_window()
    a_ts, b_ts, kept = last_write_wins_loses_the_later_write_under_skew()
    a_ts2, b_ts2, kept2 = no_loss_once_skew_is_smaller_than_the_write_gap()
    a_int, b_int, overlap = bounded_clocks_flag_an_unorderable_pair_instead_of_guessing()

    print(f"quartz drift at Spanner's worst-case {SPANNER_WORST_CASE_DRIFT_PPM} ppm: {drift:.1f} seconds/day")
    print(f"NTP symmetric-path offset/delay: {offset*1000:.0f}ms offset, {delay*1000:.0f}ms round trip")
    print(f"NTP asymmetric-path offset: {biased_offset*1000:.0f}ms (true offset was 30ms)")
    print(f"leap smear vs. step disagreement at the midpoint: {disagreement:.3f}s")
    print(f"last-write-wins under {100}ms skew keeps node {kept} (timestamps {a_ts:.3f} vs {b_ts:.3f})")
    print(f"last-write-wins under {10}ms skew keeps node {kept2} (timestamps {a_ts2:.3f} vs {b_ts2:.3f})")
    print(f"bounded-error intervals overlap: {overlap} -> correctly flagged as unorderable")
    print("physical-clocks-why-they-lie examples: all checks pass")


if __name__ == "__main__":
    main()
