- **Anomaly**: a measurement that departs from what a baseline expects. *Where you meet it:* the
  hook and the baseline-families reveal.
- **Baseline**: the expected-value model a detector compares a new reading against. *Where you
  meet it:* the baseline-families reveal.
- **Moving average**: a running mean, often weighted to favor recent data. *Where you meet it:*
  the baseline-families reveal.
- **Control limit**: a bound a reading isn't expected to cross while a process stays steady.
  *Where you meet it:* the baseline-families reveal.
- **Seasonality**: a pattern that repeats on a schedule, such as shift, day or week. *Where you
  meet it:* the baseline-families reveal.
- **Cold start**: the period a new series has too little history to trust a baseline. *Where you
  meet it:* the state-sizing reveal.
- **Deduplication**: collapsing repeated alerts for one condition into a single alert. *Where you
  meet it:* the deduplication-and-grouping reveal.
- **Suppression**: deliberately silencing alerts during a known, planned condition. *Where you
  meet it:* the deduplication-and-grouping reveal.
- **Backtest**: replaying a detector over history to score it against known past incidents.
  *Where you meet it:* the backtest reveal.
- **False alarm**: an alert that fires when nothing was actually wrong. *Where you meet it:* the
  hook and the precision-metric reveal.
