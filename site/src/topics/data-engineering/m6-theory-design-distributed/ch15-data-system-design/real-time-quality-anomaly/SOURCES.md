# Sources — de.real-time-quality-anomaly

`CHAPTER.md` names NIST's EWMA control-chart documentation and the NIST handbook's control-chart
material (Shewhart charts, control limits and run rules) as candidates for the three baseline
families this topic compares. This topic quotes two pages of the NIST Engineering Statistics
Handbook — "EWMA Control Charts" (the EWMA statistic's own definition and its contrast with a
Shewhart chart) and "What are Control Charts?" (the control-limit and out-of-control-signal
mechanics behind the SPC-rule baseline) — two sources, satisfying the ≥2-source rule.

## NIST Engineering Statistics Handbook, "EWMA Control Charts"

URL: https://itl.nist.gov/div898/handbook/pmc/section3/pmc324.htm
Fetched: 2026-10-31.

Quotes:
> The Exponentially Weighted Moving Average (EWMA) is a statistic for monitoring the process that averages the data in a way that gives less and less weight to data as they are further removed in time.

> depends solely on the most recent measurement from the process

> is an exponentially weighted average of all prior data, including the most recent measurement.

> the EWMA control procedure can be made sensitive to a small or gradual drift in the process, whereas the Shewhart control procedure can only react when the last data point is outside a control limit.

Items: (1) the EWMA statistic's own definition, the mechanism behind this topic's first baseline
family; (2) the Shewhart chart's own decision rule, stated for contrast; (3) the EWMA's own
decision rule, drawing on all prior data rather than only the latest point; (4) the exact
trade-off this topic states as the EWMA's own failure: it adapts to a slow drift that is itself
the fault, precisely because it is built to be sensitive to a gradual drift.

## NIST Engineering Statistics Handbook, "What are Control Charts?"

URL: https://itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm
Fetched: 2026-10-31.

Quotes:
> Control charts are used to routinely monitor quality.

> almost all of the data points will fall within these limits as long as the process remains in-control.

> the process is probably out of control

> Statistical methods to detect sequences or nonrandom patterns can be applied to the interpretation of control charts.

Items: (1) the control chart's own stated purpose, the mechanism behind this topic's third
baseline family (SPC rules); (2) the control limit's own definition, assuming a stationary
in-control process, exactly the assumption this topic states as the SPC rule's own failure; (3)
the out-of-control signal a point outside the limits triggers; (4) the run-rule mechanism (a
non-random pattern, not only a single out-of-limits point) this topic's SPC-rule baseline is
built on.
