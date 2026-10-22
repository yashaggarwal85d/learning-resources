# Outline — OLTP vs OLAP workload shapes

Refresher, about five minutes. Scope (CHAPTER.md / syllabus): point reads/writes vs large scans and aggregates;
normalization pressure, row vs column layout and indexing, and why one schema rarely serves both.

Running example: the existing `shop.orders` table (2.4 million rows), measured directly on the session's
PostgreSQL 16.15 sandbox.

1. **Opening.** "Same entities, two workloads, in five minutes." The same `orders` table answers two very
   different kinds of question.
2. **Reveal: the OLTP access pattern.** A point lookup by `order_id`, through the existing B-tree index: a handful
   of buffers, under a millisecond. Measured directly.
3. **Reveal: the OLAP access pattern.** A `SUM(amount)` over the whole table forces a sequential scan: tens of
   thousands of buffers, hundreds of milliseconds. Measured directly, same table.
4. **Predict.** The SUM query only needs one column, `amount`, which is a small fraction of each row's bytes.
   Does the row-oriented engine read any less data because of that? Plausible wrong answer: yes, it reads only
   what the query needs.
5. **Reveal: the answer — row storage reads whole rows regardless.** `amount` is about an eighth of each row's
   bytes (measured: avg_width 6 of 48), but PostgreSQL's heap has no way to skip the other columns; the scan
   reads every byte of every row. Takeaway: a row-oriented engine cannot read less than a whole row, no matter
   how few of its columns a query needs.
6. **Reveal: what column storage changes.** A columnar engine stores each column's values together, so a query
   over five of a hundred columns reads about five percent of the table — the opposite trade from row storage.
   Takeaway: columnar storage turns "read the columns you need" from impossible into cheap.
7. **Reveal: normalization pressure.** OLTP schemas split data into small, less redundant tables so independent
   transactions do not collide; OLAP queries over that same normalized shape need joins to denormalize it back,
   which gets expensive at aggregate scale. Takeaway: normalization helps the workload doing point writes and
   hurts the workload doing large scans — the same schema cannot win both ways.
8. **Recap ("In one breath").** Point reads want few, whole rows; large scans want few, whole columns. Swipe on to
   the next refresher: the notation that names the same relationships regardless of which workload reads them.

Predict lands on step 4, within the first four steps. Three takeaways, on steps 5, 6 and 7.
