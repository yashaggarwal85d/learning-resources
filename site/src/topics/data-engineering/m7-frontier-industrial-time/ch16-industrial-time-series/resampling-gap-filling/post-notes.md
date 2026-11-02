<section data-section="outcomes">

## Outcomes

A mixed set of continuous, step and counter signals resampled to a common one-minute grid, each
with the aggregate its type demands: a mean for the continuous reading, the last value carried
forward for the state code, the difference of end values for the counter. The wrong-aggregate bug
shown directly: averaging two machine-state codes the way a temperature would be averaged produces
1.5, a state that never existed. A real excursion hidden inside a four-hour outage, and both
carry-forward and linear interpolation shown independently erasing it when asked to fill across
the gap. A max-gap rule and a per-point observed/filled/missing flag, giving an honest aggregate
that reports how many of each contributed rather than silently treating a filled or missing point
as real. The signal's type declared as tag metadata, not inferred from the data.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a continuous temperature series, an event-driven
state-code series and a cumulative energy counter, each resampled to the same one-minute grid with
its own correct aggregate, with the resampled interval sums checked against the counter's real
total rise; a direct two-point illustration of the state-mean bug; a four-hour outage removed from
the temperature series (overlapping a real 30-degree excursion) and filled by both LOCF and linear
interpolation, each checked to reproduce the flat pre-outage value; a max-gap rule applied with a
per-point flag, checked to report a gap past the threshold as missing and a shorter gap as filled;
and an honest aggregate over a bucket of flagged points, checked to return `NaN` when nothing is
observed or filled rather than a fabricated number.

</section>

<section data-section="production">

## Production failures this topic warns about

**Resampling every tag with the same default aggregate.** A pipeline that applies `.mean()` to
every numeric column because that is the tool's default produces the state-code bug on any tag
that happens to be an integer code rather than a true measurement — the fix is declaring each
tag's type once, not special-casing it after the fact.

**A dashboard that fills every gap and never shows one.** The hook's four-hour outage is this
topic's worked version: a line that never breaks is not proof of uptime, it is proof that a fill
method ran, and the only way to tell the difference is a flag column the dashboard chooses to show
or hide.

</section>

<section data-section="frontier">

## Frontier

TimescaleDB's `time_bucket_gapfill` and the InfluxDB 3 Core Gapfill plugin are both named and
quoted in `SOURCES.md` for their own max-gap and nesting conventions, but neither was run in this
environment (no TimescaleDB or InfluxDB 3 instance here) — both are **sourced-only**, as
CHAPTER.md allows for named engines that aren't installable. Aligning two different series against
each other (one series' value at the moment another spiked) is deferred entirely to the next
topic, the as-of join.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Resampling puts one series on a grid. The more common question is across series: what was the
temperature at the moment the pressure spiked, when the two were never sampled together? The next
topic is the as-of join.

</section>
