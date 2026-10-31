# OUTLINE: Energy and utility metering (`de.energy-utility-metering`)

## Learning outcomes
1. Convert a cumulative meter register to interval consumption, correctly classifying a rollover and a reset, and state why an unobserved reset's loss can only be bounded, never recovered exactly.
2. Show that the previous "fix" (dropping negative differences) is worse than an honest bound: it reports a confident zero instead of a flagged, bounded loss.
3. Split a meter-swap series at the swap rather than diffing across it.
4. Convert a power series to energy by integration, and show the real error of averaging unevenly-spaced power readings instead.
5. Allocate a shared header meter's consumption to lines under two different rules and report the spread between them as a real, costed uncertainty.
6. Compute energy per good unit, and show that it inherits whichever allocation rule produced the energy it was divided from.

## Changes from the chapter plan
CHAPTER.md's hook describes a meter swap producing an enormous naive difference (4,100 kWh most days, 58,000,000 on one) and a prior "drop negative differences" bug silently deleting a real reset. `examples.py` builds each of the three counter failures (rollover, reset, swap) as its own minimal, separately assertable case rather than one combined dramatic number, since each needs a different fix and conflating them would blur which fix addresses which failure. The chapter's exact 58,000,000 figure is kept only in the reel's prose as the motivating scenario, not as a number `examples.py` reproduces.

CHAPTER.md also asks the builder to select and verify an IEC meter-data-exchange standard for this topic's counter-reset vocabulary, "not cited from memory." IEC's standards (e.g. IEC 61968/62056) are commercial documents with no quotable free text found. This topic instead sources the counter-reset *concept* from Prometheus's own documented, freely fetchable treatment of `rate()`/`increase()`/`resets()` (a real, verifiable close analogue this course can check), named explicitly as an analogue rather than the metering industry's own standard — logged here as the gap, per this chapter's established pattern.

## Reel steps (storyboard)

1. **Hook** — fig: a line's daily energy total reads an ordinary figure most days and an astronomical one on the day a meter was swapped; the fix applied the week before (dropping negative differences) had already silently deleted a real reset. Visual: two Rows, "most days" / "a normal total" fading to "swap day" / "an astronomical one".
2. **Reveal: a register is cumulative, consumption is a difference** — fig: the meter's own reading only ever goes up; interval consumption is the difference of two readings, which works until the register does something other than keep counting up. Takeaway: "A meter's own reading only ever goes up; consumption is a difference of two readings, and that difference breaks in three distinct ways."
3. **Predict** — "A register's difference between two readings comes back negative. Does that always mean the same thing happened to the meter?" Options: Yes, a negative difference always means the same failure / No, a negative difference can mean three different things, each needing a different fix (correct). Explain: a rollover, a reset and a meter swap all produce a negative-looking difference, but only one of the three can be corrected by arithmetic alone.
4. **Reveal: a rollover, corrected for real** — fig: a register near its fixed width wraps around; knowing the register's own width lets the real consumption be recovered exactly. Takeaway: "A register wrapping at its own fixed width isn't lost data — knowing that width recovers the real consumption exactly."
5. **Reveal: a reset, bounded but never recovered** — fig: a device restart drops the register near zero; the consumption lost between the last good reading and the restart has no formula that recovers it, only an upper bound from the elapsed time and the line's own known maximum rate.
6. **Reveal: the old fix was worse than an honest bound** — fig: the previous handling (dropping a negative difference, reporting zero) against this topic's own bounded estimate. Takeaway: "The previous fix reported a confident zero instead of an honest, bounded range — it didn't lose precision, it hid a real loss."
7. **Reveal: a meter swap, split rather than diffed** — fig: the same equipment, a new meter, a new register starting from its own recorded baseline; diffing straight across the swap gives a nonsensical enormous number, splitting it gives the real consumption on each side.
8. **Reveal: power integrated into energy, against the naive average** — fig: a power series, irregularly sampled, integrated properly against a naive unweighted average that ignores how far apart the samples actually are. Takeaway: "Averaging unevenly-spaced power readings instead of integrating them gave a real, measurably wrong energy total."
9. **Reveal: one header meter, two allocation rules, a costed spread** — fig: a shared header meter's total split to one line by running hours and by production count, with the difference between the two converted into an actual currency spread. Takeaway: "Two defensible allocation rules gave two different energy figures for the identical header meter — the spread between them is a real, costed uncertainty, not a rounding error."
10. **Recap** — a difference breaks in three distinct ways, a reset bounded rather than hidden, a swap split rather than diffed, power integrated rather than averaged, and an allocation rule's own uncertainty costed in real currency.
11. **Prove it** — "A sustainability report needs one energy-per-good-unit figure for a line fed by a shared header meter. Does the choice of allocation rule change that reported figure?" Options: No, energy per unit is a physical fact once the energy is measured / Yes, the reported figure depends on which allocation rule produced the energy it was divided from (correct).

## Narrator's persona notes
She teaches *why* each failure needs a different fix (a formula can undo a wrap, no formula can undo an unobserved restart, a split is the only honest response to a swap) rather than reading the three names off the screen; exact figures (the rollover correction, the bound, the allocation spread) live in the drawing and in `examples.py`.

## Post-notes headings
- **Outcomes**: rollover correction, reset bounding, meter-swap splitting, power-to-energy integration, allocation spread and cost, energy per good unit.
- **Lab**: `examples.py`'s own register-correction, integration and allocation computations (this topic has no lab of its own per CHAPTER.md; these are its worked examples).
- **Production**: the "drop negative differences" fix that hides a real reset instead of bounding it; reporting an energy-per-unit KPI without disclosing which allocation rule produced it.
- **Frontier**: the IEC meter-data-exchange standards, named as a pointer (not fetchable as free quotable text) past this topic's Prometheus-sourced analogue.
- **Where this goes next**: hands off to topic 6 (the IT/OT boundary and data ownership).

## Examples to execute and assert
`examples.py`: classifies and corrects a rollover using the register's known width; classifies a reset and asserts its true loss is never reported as a number, only an upper bound from elapsed time and a known maximum rate; asserts the old "drop negative diffs" fix reports a confident zero strictly less than the honest bound; splits a meter-swap series and asserts the post-swap consumption is computed from the new meter's own baseline, never by diffing across the swap; integrates an irregularly-sampled power series into energy by the trapezoid rule and asserts it differs from a naive unweighted average of the same readings; allocates a shared header meter's total to two lines under two rules (running hours vs. production count) and asserts the resulting spread and its costed value; computes energy per good unit under both rules and asserts the two figures differ.

## Bridge and handoff
- **Bridge** (from topic 4's handoff): as in CHAPTER.md — "OEE is built from events: a machine changes state and a part is counted. Some plant data is not an event at all but a running total that only ever goes up. This topic is the energy and utility meter, whose raw reading is a counter, and what it takes to turn a counter into consumption you can add up."
- **Handoff** (to topic 6): as in CHAPTER.md — "The meter, the PLC and the MES each hold a piece of the plant's data, and each sits in a network that must never be disturbed by a data platform. The next topic is the boundary between the plant floor and the rest of the company: where the networks are segmented, who owns each copy of the data, and how to read without touching control."

## Concept ledger
- **Introduces**: `cumulative-counter-to-interval-consumption`, `counter-reset-rollover-meter-swap`, `power-vs-energy-integration`, `shared-utility-allocation-rule`, `energy-per-unit-kpi`.
- **Uses**: `equipment-hierarchy-dimension`, `hierarchy-as-of-versioning` (topic 1), `oee-availability-performance-quality` (topic 4, the good count) — all confirmed live in `registry.ts`. CHAPTER.md also lists `integer-overflow`, `timestamp-resolution`, `measure-additivity-classes` and `bounded-reprocessing-window`; confirmed live and kept.
- **Declared**: basic familiarity with the physical units watt and joule.

## Claims list
1. `increase()` and `rate()` automatically adjust for breaks in monotonicity (counter resets) — Prometheus documentation. Confirmed verbatim.
2. `resets()` treats any decrease between two consecutive samples as a counter reset — same source. Confirmed verbatim.
3. The joule is the work done when a unit of force moves a unit distance in its own direction; the watt is the power giving one joule of energy in one second — SI Brochure, 9th edition (BIPM). Confirmed verbatim.
4. The watt's dimension is joule per second, confirming power is energy per unit time — same source, the unit table. Confirmed verbatim.
5. IEC's metering-data-exchange standards — not fetchable as quotable primary text; named as a gap, not asserted. See SOURCES.md.
6. The rollover correction, the reset's bounded (not recovered) loss, the meter-swap split, the power-to-energy integration, and the allocation spread and its costed value — this topic's own `examples.py`, executed and asserted.
