# Fact-check — de.fact-table-types

| # | Claim | Status |
|---|---|---|
| 1 | A transaction fact row corresponds to a measurement event at a point in space and time | Confirmed, quoted directly (Kimball Group, "Transaction Fact Tables") |
| 2 | Atomic transaction grain fact tables are the most dimensional and expressive, enabling maximum slicing and dicing | Confirmed, quoted directly |
| 3 | Transaction fact tables may be dense or sparse, since rows exist only if measurements take place | Confirmed, quoted directly |
| 4 | Transaction fact tables always carry a foreign key per dimension, optionally precise timestamps and degenerate dimensions; facts must match the transaction grain | Confirmed, quoted directly |
| 5 | A periodic snapshot row summarizes many measurement events over a standard period (day/week/month) | Confirmed, quoted directly (Kimball Group, "Periodic Snapshot Fact Tables") |
| 6 | The grain is the period, not the individual transaction | Confirmed, quoted directly |
| 7 | Periodic snapshot tables are uniformly dense: a row is inserted for every entity every period, even with zero activity | Confirmed, quoted directly |
| 8 | An accumulating snapshot row summarizes measurement events at predictable steps between a process's defined start and end | Confirmed, quoted directly (Kimball Group, "Accumulating Snapshot Fact Tables") |
| 9 | Pipeline/workflow processes with a defined start, standard intermediate steps, and defined end fit this type | Confirmed, quoted directly |
| 10 | An accumulating snapshot row is inserted once, at creation, then revisited and updated as pipeline progress occurs | Confirmed, quoted directly |
| 11 | This consistent updating of rows is unique among the fact table types | Confirmed, quoted directly |
| 12 | Accumulating snapshots often carry numeric lag measurements and milestone completion counters | Confirmed, quoted directly |
| 13 | A measurement event can record only a set of dimensional entities coming together, with no numeric fact at all | Confirmed, quoted directly (Kimball Group, "Factless Fact Tables") |
| 14 | Factless fact tables can analyze what didn't happen | Confirmed, quoted directly |
| 15 | The "didn't happen" query needs a coverage table (all possible events) and an activity table (events that occurred); subtracting activity from coverage finds what didn't happen | Confirmed, quoted directly |
| 16 | A real transaction fact table (3 rows, 2 orders) sums to a line-amount total of 145.00 | Measured directly on this sandbox; see examples.py |
| 17 | A real periodic snapshot table shows exactly 2 accounts present on each of 3 days, with no activity | Measured directly on this sandbox; see examples.py |
| 18 | A real accumulating snapshot row for one order line stays at row count 1 through 3 milestones, computing a 1-day order-to-ship lag and a 2-day ship-to-deliver lag via UPDATE, never INSERT | Measured directly on this sandbox; see examples.py |
| 19 | A real factless coverage table (3 students) minus a real activity table (2 students) finds exactly 1 student who did not attend | Measured directly on this sandbox; see examples.py |
