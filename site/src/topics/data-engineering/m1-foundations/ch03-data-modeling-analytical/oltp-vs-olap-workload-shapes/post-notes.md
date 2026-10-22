---
id: de.oltp-vs-olap-workload-shapes
title: OLTP vs OLAP workload shapes
---

<section data-section="outcomes">

## After this refresher you can

- Contrast OLTP and OLAP by their actual access pattern — point reads/writes touching few rows, versus large
  scans and aggregates touching many — rather than only by name.
- Explain why a row-oriented engine cannot read less than a whole row even when a query needs only one column,
  and why column-oriented storage exists specifically to change that trade.
- State why normalization pressure pulls OLTP schemas toward many small tables and makes the same shape
  expensive for OLAP queries, which need to rejoin it.

</section>

<section data-section="internals">

## A little deeper

Both measurements in this refresher ran on the same table, the existing 2.4-million-row `orders` table on this
session's PostgreSQL sandbox, so the only thing that changed between them was the query's own shape. A point
lookup through the existing B-tree index touched seven buffers in well under a millisecond. Forcing the planner
away from any index, a `SUM(amount)` over every row touched forty-six thousand four hundred eighty-four buffers
in about four hundred seventy-nine milliseconds — thousands of times the I/O, for a query that in principle needs
only one of the table's six columns.

That gap is not a PostgreSQL quirk; it is a direct consequence of row-oriented storage, which Amazon Redshift's
own documentation states plainly: a row's columns are stored sequentially together in the same disk block, so a
scan over that block reads every column of every row it visits, whether or not the query asked for all of them.
`pg_stats` confirms how much waste that is here specifically: `amount`, the one column the sum actually needs,
averages six bytes out of each row's forty-eight — about an eighth. The other forty-two bytes get read and
discarded on every single row.

Columnar storage flips exactly that trade, at a cost nothing in this refresher shows: writing or updating a
single row now means touching one block per column instead of one block total, which is exactly why OLTP systems
mostly do not use it. Normalization follows the same logic one level up the stack: breaking data into small,
independent tables keeps OLTP's single-row transactions cheap and uncontended, but the same split forces an OLAP
query to rejoin everything back together before it can aggregate across it, which is costly exactly where OLTP
transactions are not. Neither schema shape is a mistake; each is the direct cost of optimizing for the other
workload.

</section>
