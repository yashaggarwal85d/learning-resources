<section data-section="outcomes">

## Outcomes

OEE derived from a machine-state interval table, never stored directly, and reconciled exactly
against a published worked example by two independent routes (the factored and the simplest
form). A downtime interval that crosses a shift boundary, split into two exact pieces rather
than assigned whole to one shift. A real double-count from a replayed, overlapping interval,
fixed by merging overlapping intervals before summing. A reason-code hierarchy rolled up to
category totals, with micro-stops folded into Performance rather than Availability. MTBF and
MTTR computed from a synthetic failure stream, with the censored interval after the last
observed failure correctly excluded. And the same raw downtime minutes, classified under two
different planned/unplanned policies, giving two different Availability figures from identical
underlying data.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a reconciliation against oee.com's own published
shift example; a derivation of a machine-state interval table from raw events; a shift-boundary
split function run on a real crossing interval; an interval-merge fix for a duplicated,
overlapping interval; a reason-code rollup; an MTBF/MTTR computation over a synthetic failure
stream with censoring handled; and a side-by-side comparison of two planned/unplanned policies
applied to the identical raw downtime (the OEE leg of the §16.1 lab; the quality leg is topic
3's).

</section>

<section data-section="production">

## Production failures this topic warns about

**Trusting a naive interval sum after a known gateway-replay incident.** This topic's own
double-count scenario is the production shape of the bug: a system that re-sends an interval
during a retry or reconnect will inflate every naive sum downstream unless overlapping intervals
are merged before they're aggregated.

**Changing a planned/unplanned policy without disclosing it next to the number.** A reported
Availability figure is only meaningful alongside the policy that produced it; silently
reclassifying changeovers to improve a monthly number, without saying so, misleads anyone
comparing it to a prior month under the old policy.

</section>

<section data-section="frontier">

## Frontier

A standards-reseller catalog preview suggests ISO 22400-2 defines its own version of this
formula, using "Effectiveness" in place of "Performance," with a second, alternative calculation
in an annex. That preview could not be re-fetched as clean, verifiable text, so it is named here
only as an unconfirmed pointer past this topic's own oee.com-sourced vocabulary, not asserted as
a verified claim (see `FACT-CHECK.md`).

</section>

<section data-section="where-this-goes-next">

## Where this goes next

OEE is built from events: a machine changes state and a part is counted. Some plant data is not
an event at all but a running total that only ever goes up. The next topic is the energy and
utility meter, whose raw reading is a counter, and what it takes to turn a counter into
consumption.

</section>
