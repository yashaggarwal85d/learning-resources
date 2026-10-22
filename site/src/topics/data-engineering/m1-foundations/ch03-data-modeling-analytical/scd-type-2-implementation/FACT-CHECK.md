# Fact-check — de.scd-type-2-implementation

| # | Claim | Status |
|---|---|---|
| 1 | SCD Type 2 changes add a new row with the updated attribute values, rather than overwriting | Confirmed, quoted directly (Kimball Group, "Type 2: Add New Row") |
| 2 | This requires generalizing the primary key beyond the natural/durable key, since multiple rows can describe one member | Confirmed, quoted directly |
| 3 | A new surrogate key is assigned and used in fact tables from the update until a subsequent change | Confirmed, quoted directly |
| 4 | A minimum of three columns are added: row effective timestamp, row expiration timestamp, current row indicator | Confirmed, quoted directly |
| 5 | MERGE performs actions that modify rows in the target table using the data_source | Confirmed, quoted directly (PostgreSQL Documentation, "MERGE") |
| 6 | MERGE provides a single SQL statement that can conditionally INSERT, UPDATE or DELETE rows, instead of multiple procedural statements | Confirmed, quoted directly |
| 7 | Each candidate row's status (MATCHED / NOT MATCHED BY SOURCE / NOT MATCHED) is set once, then WHEN clauses evaluate in order | Confirmed, quoted directly |
| 8 | No more than one WHEN clause executes for any candidate row | Confirmed, quoted directly |
| 9 | A real single MERGE statement, run on a customer with one current address, both expired the old row and inserted the new current row, reporting 2 rows changed | Measured directly on this sandbox; see examples.py |
| 10 | Running the identical MERGE statement a second time changed 0 rows, confirming idempotency | Measured directly on this sandbox; see examples.py |
| 11 | A real 4-row change feed (one event duplicated) for a fresh customer deduplicated to exactly 3 distinct versions, correctly chained by effective/expiry timestamp regardless of the feed's out-of-order arrival | Measured directly on this sandbox; see examples.py |
| 12 | An as-of query for a date inside the middle version's own effective/expiry window recovered that exact version | Measured directly on this sandbox; see examples.py |
| 13 | Rebuilding the chain a second time from the identical raw feed produced byte-identical results | Measured directly on this sandbox; see examples.py |
