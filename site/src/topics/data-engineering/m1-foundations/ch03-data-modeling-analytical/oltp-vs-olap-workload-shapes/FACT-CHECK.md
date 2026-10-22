# Fact-check — OLTP vs OLAP workload shapes

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | A point lookup by `order_id` on the 2.4M-row `orders` table uses the existing B-tree index, touching 7 buffers in 0.635 ms. | Measured directly (EXPLAIN ANALYZE, BUFFERS). | This session's PostgreSQL 16.15 sandbox |
| 2 | A full-table `SUM(amount)`, forced to a sequential scan, touches 46,484 buffers in 479.426 ms. | Measured directly (EXPLAIN ANALYZE, BUFFERS). | This session's PostgreSQL 16.15 sandbox |
| 3 | `amount`'s average width is 6 bytes of the row's 48-byte total average width. | Measured directly (`pg_stats.avg_width`). | This session's PostgreSQL 16.15 sandbox |
| 4 | Row-wise storage stores an entire record's values together per block; OLTP applications typically read or write entire records, so row-wise storage suits them. | Confirmed, quoted directly. | Amazon Redshift, "Columnar storage" |
| 5 | Columnar storage stores each column's values together; a query touching 5 of 100 columns reads about 5% of the table's data, versus a row-wise database reading the other 95 columns' blocks too. | Confirmed, quoted directly. | Amazon Redshift, "Columnar storage" |
| 6 | OLTP's normalization splits data into smaller, less redundant tables so transactions can be processed independently. | Confirmed, quoted directly. | Azure Architecture Center, "OLTP" |
| 7 | Querying highly normalized data for analytics tends to need joins to denormalize it, and aggregate queries over many transactions are resource-intensive for an OLTP system. | Confirmed, quoted directly. | Azure Architecture Center, "OLTP" |

Red-team on the predict step (step 4): the plausible wrong answer is that a row-oriented engine, knowing a query
only needs one column, would read only that column's bytes. The Redshift source and this topic's own measurement
both rule this out: a row's bytes are physically interleaved in one block, so a sequential scan over the heap
reads every stored column of every row it visits — the engine cannot address one column's bytes independently of
the rest of the row. This is exactly why columnar storage (step 6) exists as a separate, deliberate trade.

No claim here is sourced-but-unmeasured: every claim about this topic's own running example (claims 1-3) is a
direct measurement, and every claim about row-wise versus columnar storage mechanics or OLTP normalization
(claims 4-7) is quoted directly from vendor documentation, not inferred.
