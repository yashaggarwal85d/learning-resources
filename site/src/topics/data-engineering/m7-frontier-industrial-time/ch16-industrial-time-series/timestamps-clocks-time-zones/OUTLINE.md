# OUTLINE: Timestamps, clocks and time zones in telemetry (`de.timestamps-clocks-time-zones`)

## Learning outcomes
1. Name the three clocks (device, gateway, ingest) and say what each is good for.
2. Show a backwards NTP step producing an out-of-order device timestamp, while the gateway and ingest clocks stay monotone.
3. Store an instant in UTC with its source zone kept separately, and render the correct plant-local time and offset from it.
4. Generate a shift calendar from the tz database (not a hard-coded "shifts are 8 hours" table) and show a 7-hour and a 9-hour shift on the two clock-change days.
5. Show the shift-boundary OEE bug reappearing on a DST day: a hard-coded shift length divided into the same output gives a number over 100 percent.
6. State the event-time decision rule (device clock if disciplined and within tolerance, else gateway) and record which clock was chosen as data, not implied by which column happens to be populated.

## Changes from the chapter plan
CHAPTER.md's hook is the Munich plant's night shift reading 114 percent OEE on the last Sunday of
March, from a hard-coded 8-hour shift-length assumption dividing into the real output of a shift
that actually ran 7 hours. `examples.py` reproduces this exactly: `night_shift_spring` computes to
7.0 hours from the tz database, and dividing a constant `hard_coded_hours = 8.0` by it (the shape
of an OEE-style ratio) gives `114.29`, matching CHAPTER.md's own figure without that figure being
asserted as a given input — it falls out of the real calculation, which is the stronger form of
the claim.

The syllabus scope and CHAPTER.md both ask for IEEE 1588-2019 only as an "abstract" pointer, not
a taught deployment; `examples.py` has no PTP code for this reason, and `SOURCES.md` quotes only
the standard's own abstract, found on IEEE SA's standard page (a different, freely-readable page
from IEEE Xplore's paywalled full text).

The first attempt at the spring-forward/fall-back `examples.py` cases used the DST transition day
itself as the shift's start date (`shift_length_hours(date(2026, 3, 29), 22, 6, ...)`), which gave
a plain 8-hour result: Europe/Berlin's spring-forward transition happens at 02:00 local, hours
before a 22:00 shift start on the same calendar date, so a shift starting that evening doesn't
cross it. Fixed by starting the shift the evening *before* the transition date (22:00 on March 28
for the March 29 transition, 22:00 on October 24 for the October 25 transition), which is also the
realistic case: a night shift spans midnight, so the transition always falls inside the *previous*
day's shift, not the transition day's own evening shift.

## Reel steps (storyboard)

1. **Hook** — fig: the Munich plant's night shift reads 114 percent OEE on the last Sunday of March; the shift calendar assumes 8 hours and the clocks went forward, so the shift was 7.
2. **Reveal: three clocks, three different jobs** — fig: a reading's device, gateway and ingest timestamps drawn in the chapter's clock lanes, each later than the last; device is closest to the truth but only as trustworthy as the sensor's own clock, ingest is monotone but says when the platform heard, not when it happened.
3. **Predict** — "A sensor's clock gets corrected backwards by NTP between two readings taken seconds apart. Does the second reading's device timestamp still come after the first's?" Options: Yes, device timestamps always increase / No, a backwards clock step can make a later reading's own timestamp come before an earlier one's (correct). Explain: the device clock is the one of the three that can actually be stepped backwards; the gateway and ingest clocks, never corrected mid-stream, stay in order regardless.
4. **Reveal: the step, measured** — fig: two readings taken a second apart on the wall clock; after an NTP correction lands between them, the second reading's own device timestamp is earlier than the first's, even though gateway and ingest both still increase. Takeaway: "A device clock stepped backwards by NTP can make a later reading's own timestamp come before an earlier one's, while the clocks nobody corrects mid-stream stay in order."
5. **Reveal: UTC stored, local rendered** — fig: one instant stored once in UTC with its zone kept as a separate fact, rendered back into the plant's own local time and offset on demand.
6. **Reveal: a calendar generated, not hard-coded** — fig: the tz database itself, not a fixed table, produces the shift boundaries for a given zone and date; an ordinary day's night shift comes out to 8 hours, a spring-forward day's comes out to 7, a fall-back day's to 9.
7. **Reveal: the same bug, in a different chapter** — fig: dividing the real output by a hard-coded 8-hour shift length, on the spring-forward day's true 7-hour shift, produces a number over 100 percent — the exact shape of topic 4's shift-boundary bug, now caused by a clock change instead of a crossing downtime event. Takeaway: "A number over 100 percent isn't a great shift — it's evidence the denominator, not the numerator, is wrong."
8. **Reveal: choosing event time, and recording the choice** — fig: a per-signal rule, device clock if disciplined and close enough to the gateway's, otherwise gateway; the chosen source is written down as a column, not left for a reader to guess from which field happens to be populated.
9. **Recap** — three clocks, each good for something different; a backwards step breaks the one a pipeline trusted most; UTC storage with local rendering, never the reverse; a calendar generated from the tz database catches what a hard-coded one cannot; event time is a stated, recorded decision.
10. **Prove it** — "A different plant reports its night shift ran 'exactly 8 hours' every day for a full year, including both DST transition days. Is that plant's shift table trustworthy?" Options: Yes, consistency across a full year is good evidence it's correct / No, a shift spanning both transition days running exactly 8 hours each time is itself the red flag (correct). Explain: a shift that truly spans a DST transition cannot run the same length as an ordinary day; reporting "exactly 8 hours" on those two days is evidence of a hard-coded table, not evidence it's right.

## Narrator's persona notes
She treats the three clocks as answering different questions (what happened, when the plant
heard about it, when it was stored) rather than ranking them best-to-worst, and lands the DST
reveal on "the same bug, different cause" rather than re-explaining shift-boundary splitting from
scratch (topic 4 already taught it). Exact figures (the offset, the shift lengths, the percentage)
live in the drawing and in `examples.py`.

## Post-notes headings
- **Outcomes**: the three-clock vocabulary, a measured backwards-step out-of-order case, UTC storage with local rendering, a tz-database-generated shift calendar, the DST-day shift-boundary bug, and the recorded event-time decision.
- **Lab**: `examples.py`'s own transit-delay, out-of-order, UTC/local, shift-calendar and event-time-choice computations (this topic has no lab of its own per CHAPTER.md; it feeds §16.2's lab as an input).
- **Production**: a hard-coded shift-length table instead of one generated from the tz database for the plant's own zone; reporting an event time without recording which of the three clocks it came from.
- **Frontier**: IEEE 1588-2019 (PTP), named only as the sub-millisecond alternative to NTP this topic doesn't deploy; event-time windows, watermarks and allowed lateness, which belong to §9.2, not here.
- **Where this goes next**: hands off to topic 8 (resampling and gap filling).

## Examples to execute and assert
`examples.py`: computes transit delay across a synthetic fleet's device/gateway/ingest timestamps
and asserts it's constant and always positive; constructs a backwards NTP step and asserts the
resulting reading is out of order on its device timestamp while gateway and ingest stay ordered;
stores a UTC instant with a separate zone and asserts the rendered local time and offset; derives
a shift calendar from the tz database for an ordinary day, a spring-forward day and a fall-back
day and asserts 8, 7 and 9 hours respectively; divides a constant by the real 7-hour shift length
and asserts the result exceeds 100 percent, reproducing CHAPTER.md's own hook figure from the real
calculation rather than asserting it as a given; and asserts the event-time decision rule picks
the device clock when disciplined and the gateway clock when drifted beyond tolerance.

## Bridge and handoff
- **Bridge** (from topic 6's handoff): as in CHAPTER.md — "That closes the model of the plant: its hierarchy, what it makes, how well it makes it, what it consumes and who owns what. Everything so far assumed a reading arrives with its time attached. This topic is about that time, and the first thing that goes wrong: three clocks, none of them right, and a time zone that skips an hour."
- **Handoff** (to topic 8): as in CHAPTER.md — "Once a reading has a trustworthy time, the next problem is that the sensors do not sample on the same grid. One reports every millisecond, another every ten seconds, another only when it changes. The next topic is how to put such series onto a grid without inventing data."

## Concept ledger
- **Introduces**: `device-gateway-ingest-timestamps`, `event-time-source-decision`, `utc-storage-local-presentation`, `dst-gap-repeat-shift-calendar`.
- **Uses**: `clock-drift-ntp-error`, `wall-vs-monotonic-clock`, `bounded-error-clock-interval` (Chapter 14), `timestamp-resolution` (Chapter 1), `shift-boundary-interval-splitting` (topic 4) — confirmed live in `registry.ts`. CHAPTER.md also lists `equipment-hierarchy-dimension` (topic 1: the plant's zone as a site attribute) and `bounded-reprocessing-window` (Chapter 3); confirmed live and kept.
- **Declared**: none (per CHAPTER.md).

## Claims list
1. OPC UA's DataValue carries a source timestamp and a server timestamp, with the source timestamp never changing once assigned to a value instance — OPC UA Part 4 §7.11. Confirmed verbatim.
2. `TimestampsToReturn` lets a client ask for the source timestamp, the server timestamp, both, or neither — same source, §7.39, Table 180. Confirmed verbatim.
3. NTP's on-wire protocol depends only on measured clock offsets, not reliable message delivery — RFC 5905, §3. Confirmed verbatim.
4. RFC 3339's Unknown Local Offset Convention represents a known UTC instant with an unknown local offset as "-00:00" — RFC 3339 §4.3. Confirmed verbatim.
5. Time zone abbreviations are ambiguous across regions and numeric UT offsets should be used instead — the IANA tz database's theory document. Confirmed verbatim.
6. IEEE 1588-2019's own abstract: a protocol providing precise synchronization of clocks in packet-based networked systems, sub-microsecond accuracy with minimal resources — IEEE SA's standard page. Confirmed verbatim.
7. The transit-delay, out-of-order, UTC/local, shift-calendar and event-time-choice results — this topic's own `examples.py`, executed and asserted.
