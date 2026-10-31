<section data-section="outcomes">

## Outcomes

The shop gets a line-quality dashboard and streaming anomaly detector for the manufacturing
telemetry platform, with an SLO set for detection latency and alert precision; three baseline
alternatives (EWMA, seasonal decomposition, SPC rules) with their own named failure modes; a
per-series state estimate with a cold-start and churn policy; a deduplication, grouping and
suppression design measured by a precision target; and a backtest plan with a clean time-split.
The three baselines run on a synthetic series with a planted slow drift and a planted step,
showing which each detects and which it misses. The next bottleneck at ten times the series
count is named as the per-series state's own memory footprint and churn-driven cold-start rate,
not baseline accuracy.

</section>

<section data-section="internals">

## Internals

None claimed independently here. Statistical process control and quality data modelling, OEE and
downtime events, sensor-data quality, time-series storage and compression, and the industrial
data model are each named as a forward pointer to a later chapter, never used as a concept before
that chapter introduces them. Machine-learned anomaly models are named only, not built. The
telemetry platform this topic runs on, the data-quality monitoring platform whose alert-precision
and grouping ideas are reused here, and alert-routing mechanics are each named as built on, not
re-derived.

</section>

<section data-section="lab">

## Lab

None of its own as a separate syllabus lab leg. The three-baseline comparison on a synthetic
series with a planted slow drift and a planted step, the per-series state estimate, and the
backtest on a held-out period are this topic's executable evidence. `examples.py`'s own lab:
`ewma_flags()`, `seasonal_flags()` and `spc_flags()` compare the three baseline families against
the same planted faults; `per_series_state_bytes()` and `cold_start_ready()` size the per-series
state and its cold-start gate; `backtest_precision()` scores a detector against labelled
incidents.

</section>

<section data-section="production">

## Production failures this topic warns about

**A baseline that learns the fault.** An EWMA that adapts smoothly into a slow drift is doing
exactly what it was built to do; when the drift is itself the fault, that same adaptation is
what makes the detector go silent right when it matters most.

**An alert nobody suppressed on purpose.** A detector that fires on every normal changeover ramp,
with no suppression rule for a known, planned condition, trains operators to ignore the channel
entirely, including the one alert that was real.

</section>

<section data-section="frontier">

## Frontier

None claimed. EWMA, seasonal decomposition, SPC rules, alert deduplication and grouping, and
backtesting with a time-split are each established practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

That closes the chapter, and with it the milestone: a method for turning a vague request into a
defensible design, and fourteen designs that applied it. Two of them borrowed words from a domain
they did not stop to teach: assets, hierarchies, OPC UA, historians, series that compress, sensors
that lie. The next chapter is that domain, opening where those designs started: the ISA-95
hierarchy and the automation pyramid that decides what a plant's data means.

</section>
