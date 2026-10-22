## Kimball Group, "Transaction Fact Tables"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/transaction-fact-table/

> A row in a transaction fact table corresponds to a measurement event at a point in space and time.

> Atomic transaction grain fact tables are the most dimensional and expressive fact tables; this robust dimensionality enables the maximum slicing and dicing of transaction data.

> Transaction fact tables may be dense or sparse because rows exist only if measurements take place.

> These fact tables always contain a foreign key for each associated dimension, and optionally contain precise time stamps and degenerate dimension keys. The measured numeric facts must be consistent with the transaction grain.

## Kimball Group, "Periodic Snapshot Fact Tables"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/periodic-snapshot-fact-table/

> A row in a periodic snapshot fact table summarizes many measurement events occurring over a standard period, such as a day, a week, or a month.

> The grain is the period, not the individual transaction.

> These fact tables are uniformly dense in their foreign keys because even if no activity takes place during the period, a row is typically inserted in the fact table containing a zero or null for each fact.

## Kimball Group, "Accumulating Snapshot Fact Tables"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/accumulating-snapshot-fact-table/

> A row in an accumulating snapshot fact table summarizes the measurement events occurring at predictable steps between the beginning and the end of a process.

> Pipeline or workﬂow processes, such as order fulﬁllment or claim processing, that have a deﬁned start point, standard intermediate steps, and deﬁned end point can be modeled with this type of fact table.

> An individual row in an accumulating snapshot fact table, corresponding for instance to a line on an order, is initially inserted when the order line is created. As pipeline progress occurs, the accumulating fact table row is revisited and updated.

> This consistent updating of accumulating snapshot fact rows is unique among the three types of fact tables.

> They often include numeric lag measurements consistent with the grain, along with milestone completion counters.

## Kimball Group, "Factless Fact Tables"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/factless-fact-table/

> Although most measurement events capture numerical results, it is possible that the event merely records a set of dimensional entities coming together at a moment in time.

> Factless fact tables can also be used to analyze what didn’t happen.

> These queries always have two parts: a factless coverage table that contains all the possibilities of events that might happen and an activity table that contains the events that did happen. When the activity is subtracted from the coverage, the result is the set of events that did not happen.

## Measured directly on this sandbox
URL: n/a — measured on this session's PostgreSQL sandbox (port 5432, `shop` database), on throwaway tables built for this topic and dropped immediately after

A real transaction fact table (two orders, three order lines) summed to a total line amount of 145.00
across three rows. A real periodic snapshot table (two accounts, three days) showed exactly two
account rows present on every single day, even though neither account's balance changed. A real
accumulating snapshot table for one order line started as a single inserted row at the ordered
milestone, and the same row — never a new one — was updated twice more as shipped and delivered
milestones occurred, ending with a one-day order-to-ship lag, a two-day ship-to-deliver lag, and a
row count of exactly one throughout. A real factless coverage table (three students expected in a
class) and activity table (two students who actually attended) were subtracted to find exactly one
student who did not attend.
