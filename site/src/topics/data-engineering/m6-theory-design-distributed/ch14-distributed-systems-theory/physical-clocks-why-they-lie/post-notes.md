<section data-section="internals">

## Internals: what NTP actually promises

RFC 5905's own four-timestamp exchange (quoted in `SOURCES.md`) is worth working through
directly, because the formula is where the symmetric-path assumption actually lives.
`examples.py`'s `ntp_offset_and_delay` reproduces it exactly: with `t1` the client's send time,
`t2` the server's receive time, `t3` the server's send time and `t4` the client's receive time,
the offset is `((t2 - t1) + (t3 - t4)) / 2` and the round-trip delay is `(t4 - t1) - (t3 - t2)`.
Both formulas silently assume the outbound and return legs took the same amount of time — the
offset term only cancels the one-way delay correctly if it's the same number on both legs.
`ntp_offset_formula_matches_a_known_worked_example` confirms the formula recovers a true
thirty-millisecond offset exactly when the path is symmetric (ten milliseconds each way).
`asymmetric_delay_corrupts_the_offset_estimate` keeps the same true offset but makes the
outbound leg eighty milliseconds and the return leg ten, and the computed offset comes back
well off from the true value — not because NTP is buggy, but because the formula has no way to
tell the two legs apart from four timestamps alone. RFC 5905's dispersion mechanism is the
honest acknowledgment of this: it accumulates an uncertainty bound alongside the offset rather
than reporting the offset as exact, and a large computed offset gets stepped (the wall clock
jumps) while a small one gets slewed (the clock's rate is nudged gradually) — which is exactly
why a wall clock can move backward: a step can be negative.

Quartz drift is the reason any of this correction is needed continuously rather than once.
Spanner's own quoted worst-case figure (200 microseconds per second drift) is not a
per-incident number — `seconds_of_drift_per_day` shows it compounds to roughly 17.3 seconds
every single day if left uncorrected, which is why TrueTime's uncertainty bound is built from
"conservatively applied worst-case clock drift" (quoted) rather than a one-time calibration:
the bound has to grow with time since the last synchronization, because the oscillator never
stops drifting.

</section>

<section data-section="lab">

## Lab: a bounded-error clock reading the same skewed pair

`last_write_wins_loses_the_later_write_under_skew` is the hook made executable: node A's clock
runs one hundred milliseconds fast, node B's is accurate, and in real time A writes first and B
writes fifty milliseconds later — genuinely the later write. Last-write-wins keeps whichever
timestamp is larger, and A's inflated timestamp wins, so the store keeps the *earlier* write
and silently discards the later one. `no_loss_once_skew_is_smaller_than_the_write_gap` is the
same two nodes with ten milliseconds of skew instead of one hundred: once skew is smaller than
the real gap between the writes, last-write-wins happens to get it right — which is exactly why
this class of bug is intermittent and hard to reproduce: it only bites when skew exceeds the
gap between concurrent writes.

`bounded_clocks_flag_an_unorderable_pair_instead_of_guessing` re-runs the same skewed scenario
through a `BoundedClock` that returns an interval instead of a point: `(reading - error_bound,
reading + error_bound)`. Node A's interval and node B's interval overlap, and an overlap is the
clock's own honest admission that it cannot say which write happened first — rather than
last-write-wins's silent, confident, wrong answer. This is the same interval logic Spanner's
TrueTime and AWS ClockBound both ship in production, not a simplification invented for the lab.

</section>

<section data-section="production">

## Production: a leap second's day-long shadow

Google's own leap-smear page (quoted in `SOURCES.md`) describes a twenty-four-hour linear smear
from noon to noon UTC, adopted by AWS and run across all of Google's services, as the
alternative to stepping the clock the instant a leap second occurs. `smearing_and_stepping_
clocks_disagree_mid_window` computes exactly how much disagreement that trades in: a smeared
clock and a stepped clock agree at the start and end of the twenty-four-hour window but disagree
by very nearly half of the whole extra second at its midpoint. Google's own text is explicit
that "smeared time briefly deviates from UTC during the smear period but realigns after 24
hours" — the word "briefly" there means the entire day the smear is running, not an instant. Any
system mixing a smearing NTP source with a non-smearing one during that window is, by
construction, reading two different and equally "correct" versions of the current time for a
full day — the real-world incident class the Linux kernel's own leap-second-related futex and
timer bugs (named, not reproduced here) trace back to.

</section>

<section data-section="frontier">

## Frontier: TrueTime and ClockBound, side by side

Spanner's TrueTime (quoted) and AWS ClockBound (quoted) are two real, independently built, named
implementations of the exact interval idea this topic's lab reproduces in miniature. TrueTime's
`TTinterval` is "an interval with bounded time uncertainty," built from "worst-case clock drift"
plus time-master uncertainty and communication delay, with multiple modern clock references
(GPS and atomic) keeping typical uncertainty under ten milliseconds. ClockBound's own README
describes its "Clock Error Bound" the same way: "two timestamps (earliest, latest) within which
true time exists," synchronized from a PTP Hardware Clock, an NTP source, or a VMClock device.
Neither system claims to know the instant; both hand back a range and let the caller decide
whether two ranges overlap — which is the entire mechanism this chapter's lease and fencing
topic (topic 10) builds on: a lease is only safe once its length exceeds the maximum skew the
two clocks involved could disagree by.

</section>

<section data-section="where-next">

## Where this goes next

A bounded-error clock admits when it can't order two events — but it still needs real time to
reason about, and real time is exactly what's unreliable here. The next topic drops the clock
entirely and asks what "happened before" can mean using only the messages processes actually
exchange: a Lamport clock and the happens-before relation it defines.

</section>
