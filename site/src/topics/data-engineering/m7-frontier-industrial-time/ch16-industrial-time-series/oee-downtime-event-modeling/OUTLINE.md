# OUTLINE: OEE and downtime event modeling (`de.oee-downtime-event-modeling`)

## Learning outcomes
1. Derive a machine-state interval table from raw state events and compute Availability, Performance, Quality and OEE, reconciled exactly against oee.com's own published worked example.
2. Split a shift-spanning downtime interval at the shift boundary rather than assigning it wholly to one shift.
3. Reproduce a real double-count from an overlapping (gateway-replay) interval and fix it by merging overlapping intervals before summing.
4. Build a reason-code hierarchy and roll it up to the category level.
5. Compute MTBF and MTTR from a synthetic failure stream, handling the censored interval after the last observed failure.
6. State how the planned/unplanned policy choice changes Availability, and therefore OEE, for the identical raw downtime.

## Changes from the chapter plan
CHAPTER.md's hook describes two plants disagreeing on a shift's OEE by three points because of a shift-boundary split and an overlapping-interval duplicate. `examples.py` builds both bugs as the cleanest, most general form each can take (a single downtime crossing one boundary; a single duplicated interval overlapping a real one) so each is exactly assertable, and separately reconciles the three-factor formula and its "simplest" reduced form against oee.com's own full worked numeric example (a different scenario from the chapter's two-plant hook), since that reconciliation is the one place this topic can check its own arithmetic against an external, independently published answer.

CHAPTER.md also asks to confirm whether ISO 22400-2 defines OEE and cite only what it states, and to use ISA-95 Part 3 for the event vocabulary. Neither standard's own text was fetchable: ISO's store page returns HTTP 403 with no quotable abstract (a standards-reseller catalog preview suggests the standard does define OEE with its own "Effectiveness" term in place of "Performance," but that preview could not be re-fetched as clean text, so it is named only as an unconfirmed pattern, not quoted). ISA-95 Part 3 is a commercial document with no public page beyond the multi-part effort's general scope. This topic therefore sources the OEE formula and worked example entirely from oee.com, and treats the machine-state-interval model, reason-code hierarchy and MTBF/MTTR mechanics as this course's own data-modeling material (as topic 3 did for mean/standard deviation), not as a quoted claim about either standard's specific text. Logged here as the gap, per CHAPTER.md's own allowance for a source that turns out to be genuinely inaccessible at research time.

## Reel steps (storyboard)

1. **Hook** — fig: a changeover spans a shift boundary; one plant assigns it wholly to one shift, another splits it, and a duplicated interval from a gateway replay inflates one plant's downtime further — the two plants report different OEE for the identical shift. Visual: two Rows, "same shift" / "two different OEE numbers".
2. **Reveal: OEE as availability times performance times quality** — fig: the three factors multiplied, reconciled exactly against oee.com's own published worked example. Takeaway: "Availability, Performance and Quality, multiplied together, reconciled exactly against a published worked example, not just a formula copied down."
3. **Reveal: a machine-state interval table, not stored directly** — fig: raw state-change events (running, down) turned into intervals by pairing consecutive events, the same gaps-and-islands idea from earlier in this course applied to a sensor state stream. Visual: two Rows, "raw events" / "state changes" then "intervals" / "derived, not stored".
4. **Predict** — "A changeover starts before a shift boundary and ends after it. Does assigning its whole duration to the shift it started in ever give a different number than splitting it at the boundary?" Options: No, the total downtime is the same either way / Yes, each shift's own reported downtime changes depending on where the split happens, even though the total doesn't (correct).
5. **Reveal: the shift-boundary split, computed for real** — fig: the identical downtime interval, run through a real split function, giving the exact minutes that belong to each shift. Takeaway: "The same downtime interval split into two exact, different minute counts, one for each shift it actually crossed."
6. **Reveal: the double-count, and the fix** — fig: a gateway replay's duplicate interval overlapping a real one; naively summing both gives a bigger number than merging the overlap first. Takeaway: "A duplicated interval from a gateway replay inflated the naive total; merging overlapping intervals before summing gave back the real one."
7. **Reveal: reason codes roll up; micro-stops hide in Performance** — fig: a small reason-code hierarchy (category, reason, sub-reason) rolled up to category totals; a stop too short to log a reason doesn't vanish, it counts against Performance instead. Visual: two Rows, "reason codes" / "roll up by category" then "micro-stops" / "inside Performance, not Availability".
8. **Reveal: MTBF and MTTR, with one censored interval** — fig: a synthetic failure stream over a window; the up-time before the first failure and between failures counted, but the interval after the last observed failure, up to the window's end, excluded as censored (no second failure observed to close it). Takeaway: "The interval after the last observed failure was real time, but counting it as a complete up-time would have overstated how reliable the machine actually is."
9. **Reveal: the same downtime, two policies, two different Availability numbers** — fig: the identical raw changeover-plus-breakdown minutes, classified as planned-only-excluded under one policy and changeover-also-unplanned under another, giving two different Availability figures from the same raw data.
10. **Recap** — A×P×Q reconciled against a published example, a machine-state table derived rather than stored, a shift-boundary split, a double-count fixed by merging, reason codes rolled up with micro-stops inside Performance, MTBF/MTTR with a censored tail, and one policy choice changing the number.
11. **Prove it** — "A plant manager decides a changeover should count as planned, not unplanned, the day after reviewing this month's numbers. Does the plant's own machines or output change at all because of that decision?" Options: Yes, reclassifying changeovers changes how the machines actually ran that month / No, nothing about the machines or the output changes; only the reported Availability number does (correct).

## Narrator's persona notes
She teaches the "why" behind each bug (a boundary and a replay are both just a place where real-world timing collides with a naive assumption), not the labels on screen; exact figures (availability, MTBF hours, split minutes) live in the drawing and in `examples.py`.

## Post-notes headings
- **Outcomes**: OEE reconciled against oee.com's worked example; the shift-boundary split; the double-count fix; reason-code rollup and micro-stops; MTBF/MTTR with a censored tail; the planned/unplanned policy effect.
- **Lab**: `examples.py`'s own reconciliation, split, merge, rollup and MTBF/MTTR computations (the OEE leg of the §16.1 lab; the quality leg is topic 3's).
- **Production**: trusting a naive interval sum after a known gateway-replay incident; silently changing the planned/unplanned policy without disclosing it alongside a reported Availability number.
- **Frontier**: ISO 22400-2's own apparent "Effectiveness" terminology (named as an unconfirmed pattern, not a verified quote) as a pointer past this topic's own oee.com-sourced vocabulary.
- **Where this goes next**: hands off to topic 5 (energy and utility metering).

## Examples to execute and assert
`examples.py`: reconciles Availability, Performance, Quality and OEE exactly against oee.com's own published worked example (shift length, breaks, downtime, ideal cycle time, total count, reject count all taken from that source); derives a machine-state interval table from raw events and asserts total unplanned downtime; splits a shift-crossing downtime at a boundary and asserts both resulting durations; reproduces a double-counted overlapping interval and asserts the merged total is smaller and correct; rolls up a reason-code hierarchy to category totals; computes MTBF and MTTR over a synthetic failure stream, asserting the censored tail after the last failure is excluded from the up-time count; and asserts that two different planned/unplanned policies give two different Availability numbers from the identical raw downtime.

## Bridge and handoff
- **Bridge** (from topic 3's handoff): as in CHAPTER.md — "Quality asks whether the parts were good. The plant also asks how much of its time it was making good parts at all. This topic is OEE, computed from the state and count events the machines emit, and the bugs that make two plants report different numbers for the same shift."
- **Handoff** (to topic 5): as in CHAPTER.md — "OEE is built from events: a machine changes state and a part is counted. Some plant data is not an event at all but a running total that only ever goes up. The next topic is the energy and utility meter, whose raw reading is a counter, and what it takes to turn a counter into consumption."

## Concept ledger
- **Introduces**: `oee-availability-performance-quality`, `machine-state-interval-model`, `shift-boundary-interval-splitting`, `downtime-reason-hierarchy-micro-stops`, `mtbf-mttr`.
- **Uses**: `equipment-hierarchy-dimension`, `hierarchy-as-of-versioning` (topic 1), `quality-fact-process-context` (topic 3), `lag-lead-change-detection`, `row-number-difference-islands`, `running-sum-session-id`, `event-stream-compression`, `fact-table-types-transaction-snapshot-accumulating-factless`, `bounded-reprocessing-window` — all confirmed live in `registry.ts`.
- **Declared**: basic familiarity with a production shift.

## Claims list
1. Availability = Run Time / Planned Production Time; Run Time = Planned Production Time − Stop Time — oee.com. Confirmed verbatim.
2. Performance accounts for slow cycles and small stops; Quality accounts for parts needing rework — oee.com. Confirmed verbatim.
3. OEE = Availability × Performance × Quality, reducing to (Good Count × Ideal Cycle Time) / Planned Production Time — oee.com. Confirmed verbatim.
4. The full worked numeric example (shift length, breaks, downtime, ideal cycle time, counts, and the resulting 74.79% OEE by both routes) — oee.com. Confirmed verbatim, reconciled by direct execution.
5. MTBF is the predicted elapsed time between inherent failures, used for repairable systems; MTTF is used for non-repairable ones — Wikipedia, "Mean time between failures." Confirmed verbatim.
6. MDT is usually broader than MTTR, which is narrower and more technical — same source. Confirmed verbatim.
7. ISO 22400-2's OEE formula and ISA-95 Part 3's event vocabulary — not fetchable as quotable primary text; named as a gap, not asserted. See SOURCES.md.
8. The reconciled OEE figures, the shift-boundary split, the double-count fix, the reason-code rollup, and the MTBF/MTTR computation — this topic's own `examples.py`, executed and asserted.
