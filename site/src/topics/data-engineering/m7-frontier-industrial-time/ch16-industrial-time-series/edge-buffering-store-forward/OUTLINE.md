# Outline — edge buffering and store-and-forward

## Registry gaps (verified via grep/python against `registry.ts`'s `introduces` arrays)

Three ids CHAPTER.md's own `uses` list names are not introduced by any shipped topic:
`edge-buffer-sizing-from-outage`, `plant-autonomy-and-catch-up`, `manufacturing-telemetry-platform-design`
— all three traceable to Chapter 15 topic 24, which has not shipped. Omitted from `registry.ts`'s
`uses` list and disclosed in `SOURCES.md`. `manufacturing-telemetry-platform-design` is the same
recurring gap already disclosed in topic 17.

The remaining 17 ids in CHAPTER.md's `uses` list were each confirmed present in some shipped
topic's `introduces` array before being written into `registry.ts`.

## In-course anchors

CHAPTER.md's own Sources line names two in-course anchors, not external fetches: Chapter 15 topic
24 (not shipped — covered by the disclosed-gap section above) and Chapter 14 topic 13, which is
`de.exactly-once-as-end` ("Exactly-once as an end-to-end property") — shipped, and linked directly
in `prerequisites.mdx`.

## Three synthetic demonstrations in one `examples.py`, each isolating one claim

Following the pattern established in topic 18 (three separate signals, each built to cleanly
demonstrate one claim rather than forcing one scenario to prove everything): this topic's
`examples.py` runs nine independent checks, each simulating one mechanism from CHAPTER.md's scope
line directly rather than reusing a single end-to-end scenario, so that a reader can see each
property (durability, idempotence, throttling, priority, rollup, clock correction) in isolation.

## Sequence-key design

CHAPTER.md explicitly names Sparkplug's own 0-255 wrapping sequence number as too narrow for a
global idempotency key and proposes `(source, t_device, seq)` with a wider counter. `examples.py`
implements this as a `PointKey` dataclass (frozen, hashable) rather than widening Sparkplug's own
byte — the topic's own gateway adds a wider counter independent of the wire protocol's own field,
which is the realistic fix (a protocol's field width cannot be changed by a single implementation).

## Drop-policy priority rule

CHAPTER.md's scope line states "a full buffer must never backpressure a controller or PLC" as a
restated property from topic 6 (IT/OT boundary). `examples.py` tests this directly: appending past
a buffer's stated capacity always succeeds (the append never raises or blocks); dropping happens
only when a policy is applied to decide what the buffer keeps, which is a choice made on read or
export, never on write.

## Three synthetic "fault" constructions

- `build_replay_with_fault`: a 50-point sequence where one real point (seq 20) is genuinely
  missing (a gap), one point (seq 10) is sent twice with an identical key (a true duplicate, not
  a near-miss), and two points (seq 30, 31) are swapped (a reordering) — chosen so the three
  faults are independently verifiable and don't interact with each other's detection.
- `build_overflowing_buffer`: 120 points against a 100-point capacity, with every 12th point
  marked priority 0 (a safety alarm) — 10 alarms total, enough to show a measurable difference
  between an age-only policy (which can drop some) and a priority-first policy (which drops none).
- `build_drifted_batch`: 20 points a second apart with a constant 90-second device-clock drift —
  deliberately a fixed offset rather than a growing one, since this topic's claim is about
  correcting a reconnect-time snapshot, not about tracking drift continuously over time.
