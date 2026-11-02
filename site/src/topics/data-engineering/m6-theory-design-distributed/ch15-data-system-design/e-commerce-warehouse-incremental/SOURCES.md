# Sources — de.e-commerce-warehouse-incremental

`CHAPTER.md` names Kimball and Ross's *The Data Warehouse Toolkit* as the in-course anchor via
Chapter 3 (not a fetched source here — its claims are already quoted and cited there), plus
dbt's incremental-models documentation, the Iceberg/Delta or PostgreSQL `MERGE` documentation,
and a public engineering write-up, leaving the builder to select and verify at research time.
This topic quotes dbt's own incremental-models page (the `unique_key` mechanism this design's
merge load is built on) and PostgreSQL's `MERGE` documentation (the statement, and specifically
the `WHEN NOT MATCHED BY SOURCE` clause, that the deleted-source-row hazard turns on), both
fetched and verified directly — satisfying the ≥2-source rule.

## dbt Developer Hub, "Configure incremental models"

URL: https://docs.getdbt.com/docs/build/incremental-models
Fetched: 2026-10-30.

Quotes:
> If you don't specify a unique_key, most adapters will result in append-only behavior, which means dbt inserts all rows returned by the model's SQL into the preexisting target table without regard for whether the rows represent duplicates.

> If the same unique_key is present in the "new" and "old" model data, dbt will update/replace the old row with the new row of data.

Items: (1) an incremental load without a stated unique key degrades to pure append, silently
producing duplicates on any re-run or any changed row sent again — exactly the correctness
burden this design's merge load has to name and close; (2) a unique key is what lets a changed
row replace its old version instead of appending a duplicate, the mechanism behind "pull only
changed rows... merge into the target idempotently."

## PostgreSQL Documentation, "MERGE"

URL: https://www.postgresql.org/docs/current/sql-merge.html
Fetched: 2026-10-30.

Quotes:
> MERGE provides a single SQL statement that can conditionally INSERT, UPDATE or DELETE rows, a task that would otherwise require multiple procedural language statements.

> If the WHEN clause specifies WHEN NOT MATCHED BY SOURCE and the candidate change row represents a row in the target table that does not match a row in the data_source, the WHEN clause is executed if the condition is absent or it evaluates to true.

Items: (1) `MERGE` can delete rows, but only when the design writes a clause that asks it to —
an incremental extract that only ever sends changed-or-new rows never triggers a `WHEN NOT
MATCHED BY SOURCE` delete on its own, which is exactly why a source-side delete goes unseen
unless the design adds this clause deliberately; (2) `WHEN NOT MATCHED BY SOURCE` is the named
mechanism for detecting a target row with no matching source row — the deleted-source-row
hazard's own guard, stated precisely rather than invented.
