## Consensus in the Presence of Partial Synchrony (Dwork, Lynch, Stockmeyer) — internal cross-reference, not re-fetched

URL: internal-not-fetched-timing-failure-models-topic
Version: already fetched and quoted for topic 1 (`../timing-failure-models/SOURCES.md`); this topic only reuses the `timing-models-sync-partial-async` concept it introduced, with no new claim of its own from this source.

## Spanner: Google's Globally-Distributed Database (Corbett et al., OSDI 2012)

URL: https://www.cs.princeton.edu/courses/archive/fall15/cos518/papers/spanner.pdf
Version: OSDI 2012 (the version most mirrors carry; a later extended version appeared in ACM TOCS 2013)

> This implementation keeps uncertainty small (generally less than 10ms) by using multiple modern clock

> which is an interval with bounded time uncertainty (unlike standard time interfaces that give clients no notion of uncertainty). The endpoints of a TTinterval are of

> time uncertainty that is derived from conservatively applied worst-case clock drift. GPS masters advertise uncertainty that is typically close to zero.

Contents (for the coverage map): TrueTime as a bounded-error clock API returning an interval `TTinterval` (earliest, latest), not a point; the uncertainty bound built from worst-case local clock drift plus time-master uncertainty and communication delay; the paper's own stated typical uncertainty (under 10 ms) with multiple modern clock references (GPS and atomic clocks) per time master; GPS-source failure modes named (antenna/receiver failures, local radio interference, correlated failures, leap-second handling bugs).

## RFC 5905: Network Time Protocol Version 4 (Mills, Martin, Burbank, Kasch, IETF 2010)

URL: https://www.rfc-editor.org/rfc/rfc5905.txt
Version: RFC 5905, June 2010

> round-trip delay.

Contents: the on-wire protocol's offset (θ) and round-trip delay (δ) computation from four timestamps; dispersion as the accumulating uncertainty bound; the slew-vs-step correction choice (a large offset is stepped, a small one slewed) and why a stepped correction can move the wall clock backward.

## Leap Smear | Public NTP (Google for Developers)

URL: https://developers.google.com/time/smear
Version: page last updated 2023-10-23 UTC (fetched 2026-10-30)

> Google uses a "leap smear" to handle leap seconds, gradually adjusting time over 24 hours instead of abrupt clock steps.

> Google's recommended leap smear standard is a 24-hour linear smear from noon to noon UTC for distributed computing applications.

> Smeared time briefly deviates from UTC during the smear period but realigns after 24 hours.

> The leap smear applies to all Google services, including all our APIs.

Contents: the 24-hour linear noon-to-noon smear as Google's recommended standard, adopted by AWS; the open-source "unsmear" library for converting smeared time back to TAI/GPS time; a reminder that mixing a smearing NTP source with a non-smearing one during the smear window produces disagreement between clocks that both report themselves as synchronized.

## Dynamo: Amazon's Highly Available Key-value Store (DeCandia et al., SOSP 2007)

URL: https://www.read.seas.harvard.edu/~kohler/class/08w-dsi/decandia07dynamo.pdf
Version: SOSP 2007

Contents: last-write-wins by physical timestamp named as one of Dynamo's own reconciliation choices for conflicting versions (contrasted, in this topic's handoff, with the vector-clock reconciliation Dynamo actually ships as its default, which topic 4 covers); the general shape of "the client, not the store, decides how two concurrent writes merge."

## Dynamo | Apache Cassandra Documentation

URL: https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html
Version: Apache Cassandra documentation, "latest" (fetched 2026-10-30)

> uses a simpler last-write-wins model where every mutation is timestamped

> resolve according to the conflict resolution rule of last write wins.

Contents: Cassandra's own documentation naming last-write-wins, by client-supplied or server-assigned timestamp, as its actual conflict-resolution rule (unlike Dynamo's vector-clock siblings) — the production system this topic's hook and lab are modeled on.

## clock_gettime(2) — Linux manual page

URL: https://man7.org/linux/man-pages/man2/clock_gettime.2.html
Version: Linux man-pages (fetched 2026-10-30, current online edition)

Contents: `CLOCK_REALTIME` described as settable and subject to discontinuous jumps (NTP, the system administrator); `CLOCK_MONOTONIC` described as nonsettable, representing monotonic time since an unspecified starting point, not affected by discontinuous jumps — the two clocks this topic's "duration vs. instant" distinction rests on.

## AWS ClockBound (aws/clock-bound, GitHub)

URL: https://raw.githubusercontent.com/aws/clock-bound/main/README.md
Version: README as of the main branch (fetched 2026-10-30)

> The clockbound daemon that keeps the system clock synchronized by accessing local PTP Hardware Clock (PHC) device or

> The window of uncertainty (the Clock Error Bound) is defined by two timestamps (earliest, latest) within which true time exists.

Contents: ClockBound as a daemon plus client library returning a bounded interval (earliest, latest) rather than a point reading, synchronized from a PTP Hardware Clock, an NTP source, or a VMClock device; the production, open-source analogue of Spanner's TrueTime this topic names as a real, available bounded-error clock service.

## How to do distributed locking (Kleppmann, 2016)

URL: https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html
Version: blog post, 8 February 2016 (fetched 2026-10-30)

Contents: the process-pause examples (garbage collection, hypervisor live migration, disk I/O, swapping) that can suspend a process for an unbounded time between a clock read and that reading's use — this topic's reason a synchronized clock still doesn't make "now" safe to act on, independent of any replication protocol the article itself goes on to critique (Redlock, out of scope here).
