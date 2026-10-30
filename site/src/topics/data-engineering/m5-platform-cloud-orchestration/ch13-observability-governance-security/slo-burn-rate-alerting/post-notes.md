<section data-section="outcomes">

## Outcomes

Compute burn rate from an SLO and an observed error rate and the time to exhaustion at that rate;
build a multi-window rule from a long window and a short window and show it firing and then
resetting on a replayed incident; explain why a fixed freshness threshold pages every night and
fix it with a schedule-aware SLI; state, for a given SLO, whether the workbook's recommended
thresholds can fire at all; apply the actionable-page test to a list of alerts.

</section>

<section data-section="internals">

## Internals

A freshness SLO is not a different kind of SLO — it is the same error-budget shape (a target
fraction of time within bound, over a rolling window) with freshness as the SLI instead of
latency or availability. That means the whole multiwindow, multi-burn-rate machinery applies to it
unchanged: `examples.py`'s own `burn_rate_and_time_to_exhaustion` works identically whether the
"error" being counted is a failed request or a minute spent over a freshness bound. What does not
carry over automatically is the workbook's own worked numbers: they were derived for a 99.9% SLO,
and this topic's own `low_availability_threshold_never_fires` example shows directly why a lower
target (90%, in this case) needs its own thresholds recomputed — a complete, hour-long outage at
that target only spends 1.4% of the 30-day budget, under the documented 2% page threshold, so the
threshold would never fire at all for that target. The lesson is not "the numbers are wrong," it's
that the numbers are a starting point tied to a specific SLO and must be checked against whatever
SLO a given alert is actually guarding.

</section>

<section data-section="lab">

## Lab: the burn-rate freshness alert

This topic hosts the last leg of the §13.1 chapter lab directly: build a burn-rate freshness alert
from topic 1's own freshness metric, and replay a stale-source incident against it, measuring time
to detect, the reset time after recovery, and false alarms over a simulated month with and without
schedule awareness. `examples.py`'s own `fixed_vs_schedule_aware_freshness_false_alarms` is that
measurement: ten false alarms from a fixed threshold over twenty-nine healthy nights, versus zero
from the schedule-aware version, with both still catching the one genuinely stale night.

</section>

<section data-section="production">

## Production failures this topic warns about

**Shipping the workbook's own numbers unchecked.** The 2%/1hr, 5%/6hr, 10%/3day thresholds are a
starting point for a specific SLO shape, not a universal constant — this topic's own measurement
shows them silently unable to fire at all for a 90% target. An alert that can never fire is worse
than no alert: it looks like coverage exists when it does not.

**A freshness threshold set to the alert's own worst-case, not the schedule.** Setting the
threshold just above the normal overnight gap (as this topic's fixed-threshold example does)
produces a false alarm every single night until someone widens it or starts ignoring it — exactly
the failure mode the SRE book's own "every page should be actionable" principle warns about.

</section>

<section data-section="frontier">

## Frontier

Chapter 11's own asset-level ownership and incident-response material (not yet built as of this
topic) is where "owner routing" gets a real mechanism — a declared ownership mapping an alert can
look up — rather than the by-hand pipeline-strip grouping this topic uses as a stand-in. Named
here, not built.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Observability tells you the platform is healthy. It says nothing about what the platform holds.
Before anything can be protected, masked or deleted, someone has to know which columns are
personal data. That is classification, and it is where the governance half of this chapter starts.

</section>
