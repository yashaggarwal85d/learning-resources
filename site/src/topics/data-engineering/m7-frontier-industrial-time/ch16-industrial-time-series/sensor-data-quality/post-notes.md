<section data-section="outcomes">

## Outcomes

A flatlined sensor, a range violation, a rate-of-change violation and a median-based spike, each
detected on a synthetic fleet with planted faults, with measured precision and recall. A firmware
scale change detected as a level shift via a change-point check. A replayed gateway batch
deduplicated by an idempotent key, and a backfilled batch told apart from a clock fault by
comparing two timestamps. Quality flags and a quarantine table applied at ingest without deleting
a single point. The per-point cost of running every check, measured directly and extrapolated to
the plant's own write rate.

</section>

<section data-section="lab">

## Lab

`examples.py` builds a synthetic fleet of twenty sensors, four of which each carry one planted
fault type (a frozen flatline, a handful of isolated spikes, a below-absolute-zero out-of-range
excursion, and a firmware-style scale change), with sixteen healthy sensors to measure false
positives against. `detect_flatline` flags a trailing window whose variance is effectively zero;
`detect_range` flags values outside a sourced span; `detect_spike_mad` uses a median/MAD test that
excludes the candidate point itself; `detect_change_point` compares the median before and after a
candidate split to find a level shift. Precision and recall are computed over the three point-rule
fault types; the change point is checked by its own direct assertion. `dedup_by_idempotent_key`
collapses an exact gateway replay; `classify_late_arrival` tells a backfill from a clock fault by
comparing a device timestamp against a gateway timestamp. `build_quarantine` routes every flagged
point to a quarantine entry while asserting every original series keeps its full original length.
The per-point check cost is measured directly with `time.perf_counter` and extrapolated to the
plant's own documented write rate from a prior topic of this chapter.

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a dashboard that has no flatline check.** The hook is the production shape of this
failure: a value that's plausible and hasn't jumped passes every rule except the one nobody wrote
— a windowed variance check specifically for "has this stopped moving."

**Deleting a flagged point instead of quarantining it.** A team that deletes what a rule calls bad
loses the record a post-mortem would need if the rule itself turns out to have been wrong, or if
the flagged point turns out to be the one real event worth investigating.

</section>

<section data-section="frontier">

## Frontier

The flatline-vs-legitimately-constant distinction CHAPTER.md names (telling a frozen sensor from a
held setpoint using the signal's own expected-variation metadata) is not demonstrated here: this
topic's synthetic fleet has no legitimately-constant sensor to measure that distinction against,
disclosed directly in `FACT-CHECK.md`'s red-team rather than silently skipped. The measured
per-point check cost is this sandbox's own CPU and does not claim to represent any specific
production hardware; the claim this topic stands behind is the shape of the cost arithmetic, not
the absolute number. AVEVA PI's own data-quality and digital-state documentation, named by
CHAPTER.md as a possible source, was not reachable at a stable, fetchable URL at research time; this
topic falls back to OPC UA's own EURange property and worked example instead, as CHAPTER.md's own
text allows.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

That closes this section: a series has a time, a grid, a rollup, a codec, an index, an engine, a
decision and a quality flag. The next section follows the readings upstream to the machine, and the
first protocol on the way: OPC UA, whose address space gives raw tags the meaning they lack.

</section>
