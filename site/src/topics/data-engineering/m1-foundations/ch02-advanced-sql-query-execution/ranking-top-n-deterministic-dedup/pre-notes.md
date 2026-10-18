- **Tie**: two rows with the same value in the ordering column. *Where you meet it:* two customers with the same order count.
- **Primary key**: a column whose values are unique per row. *Where you meet it:* `order_id`.
- **Idempotent job**: a job that gives the same result however many times it runs. *Where you meet it:* a nightly dedup that must not change its answer on a rerun.
- **Window function**: a calculation over rows related to the current one that keeps every row, written with `OVER (PARTITION BY … ORDER BY …)`. *Where you meet it:* `ROW_NUMBER() OVER (PARTITION BY customer ORDER BY ts)`.

**Check yourself:** why is `ORDER BY score DESC` alone not a total order if two rows share a score? (Answer: the order of the tied rows is unspecified.)
