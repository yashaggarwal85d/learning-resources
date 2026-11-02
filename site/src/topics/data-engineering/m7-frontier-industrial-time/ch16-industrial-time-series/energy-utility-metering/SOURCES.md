## Query functions (Prometheus documentation)

URL: https://prometheus.io/docs/prometheus/latest/querying/functions/
Version: Prometheus documentation, latest, retrieved 2026-10-31

The in-course analogue this topic names: how `rate()` and `increase()` treat a counter that goes backwards.

> increase(v range-vector) calculates the increase in the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for.

> rate(v range-vector) calculates the per-second average rate of increase of the time series in the range vector. Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for.

The specific detection rule `resets()` states, which this topic's own reset/rollover logic mirrors.

> For each input time series, resets(v range-vector) returns the number of counter resets within the provided time range as an instant vector. Any decrease in the value between two consecutive float samples is interpreted as a counter reset.

Contents: `increase()`, `rate()`, `irate()` and `resets()`, each defined; the shared rule that any decrease between consecutive samples is treated as a reset (not a rollover, not a swap — Prometheus doesn't distinguish these, which this topic's own claims list notes as a limitation this topic's own handling improves on); the warning that aggregating before rating loses reset detection.

## SI Brochure, 9th edition (BIPM)

URL: https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-EN.pdf
Version: BIPM, 9th edition (2019, updated), retrieved 2026-10-31

The two unit definitions this topic's power-vs-energy distinction rests on.

> Joule (unit of energy or work). — The joule is the work done when the point of application of 1 MKS unit of force [newton] moves a distance of 1 metre in the direction of the force.

> Watt (unit of power). — The watt is the power which in one second gives rise to energy of 1 joule.

The dimensional relationship, in the brochure's own unit table.

> power, radiant flux

> watt

> W

> kg m2 s−3

> J/s

Contents: the historical CIPM definitions of the joule and the watt (and the newton, ampere, volt and ohm, not used here); the modern SI base/derived unit table showing the watt's dimension as joule per second, confirming power is energy per unit time, not a separately defined quantity.

## Metering-data-exchange standards (not used; disclosed)

URL: https://www.iec.ch/dyn/www/f?p=103:7:::::FSP_ORG_ID:1316
Version: no quotable full text fetchable (IEC's own standard documents, e.g. IEC 61968/62056, are commercial)

CHAPTER.md asks the builder to select and verify a metering-data-exchange standard (for example the IEC meter-data-exchange standards) rather than citing one from memory. IEC's standard documents are commercial, the same way ISA's and ISO's are elsewhere in this chapter, and no free, quotable primary text was found for the specific register-rollover/reset/swap handling this topic needs. This topic's counter-reset, rollover and meter-swap handling is therefore sourced from Prometheus's own documented treatment above (a real, fetchable, close analogue this course can verify) plus this topic's own data-modeling reasoning, not from an IEC standard's specific text — logged here as the gap, per this chapter's established pattern for a genuinely inaccessible primary source.
