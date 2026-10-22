## Kimball Group, "Type 2: Add New Row"
URL: https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/

> Slowly changing dimension type 2 changes add a new row in the dimension with the updated attribute values.

> This requires generalizing the primary key of the dimension beyond the natural or durable key because there will potentially be multiple rows describing each member.

> When a new row is created for a dimension member, a new primary surrogate key is assigned and used as a foreign key in all fact tables from the moment of the update until a subsequent change creates a new dimension key and updated dimension row.

> A minimum of three additional columns should be added to the dimension row with type 2 changes: 1) row effective date or date/time stamp; 2) row expiration date or date/time stamp; and 3) current row indicator.

## PostgreSQL Documentation, "MERGE"
URL: https://www.postgresql.org/docs/current/sql-merge.html

> MERGE performs actions that modify rows in the target table identified as target_table_name, using the data_source.

> MERGE provides a single SQL statement that can conditionally INSERT, UPDATE or DELETE rows, a task that would otherwise require multiple procedural language statements.

> For each candidate change row, the status of MATCHED, NOT MATCHED BY SOURCE, or NOT MATCHED [BY TARGET] is set just once, after which WHEN clauses are evaluated in the order specified.

> No more than one WHEN clause is executed for any candidate change row.

## Measured directly on this sandbox
URL: n/a — measured on this session's PostgreSQL sandbox (port 5433, a throwaway schema built for this topic and dropped immediately after)

A real customer dimension, starting with one current address row, was loaded with a single real
`MERGE` statement carrying the customer's changed address: the statement both expired the old row
(setting it no longer current) and inserted the new current row, in one atomic command, confirmed
by the two rows it reported changing. Running that identical `MERGE` statement a second time
changed zero rows, confirming the load is idempotent. Separately, a fresh customer's real
three-event address history was fed in out of order, with one event duplicated, into a loader that
first deduplicates by the exact address content and then rebuilds the effective/expiry chain purely
from each event's own timestamp. The rebuilt chain came out identical to the correct history
regardless of the feed's arrival order: three distinct versions, correctly chained, with the
middle version's address recovered exactly by an as-of query for a date between its own effective
and expiry timestamps. Rebuilding the identical chain a second time from the same raw feed produced
byte-identical results, confirming the rebuild itself is also idempotent.
