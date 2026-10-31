# Sources — de.incremental-extraction-high-watermark

`CHAPTER.md` names PostgreSQL's own date/time functions and sequence functions documentation, the
`INSERT ... ON CONFLICT`/`MERGE` documentation, and `pg_stat_activity` as primary sources, plus
dlt's and Airbyte's own documentation of the same fix as productised features (used for framing,
not quoted here). This topic quotes PostgreSQL's own current documentation on `transaction_timestamp()`
and `now()`, and on `nextval()`'s behaviour under rollback — two independent pages, satisfying the
≥2-source rule.

## PostgreSQL (current documentation): Date/Time Functions and Operators

URL: https://www.postgresql.org/docs/current/functions-datetime.html
Fetched: 2026-10-31.

Quotes:
> transaction_timestamp() is equivalent to CURRENT_TIMESTAMP, but is named to clearly reflect what it returns.

> Since these functions return the start time of the current transaction, their values do not change during the transaction.

> clock_timestamp() returns the actual current time, and therefore its value changes even within a single SQL statement.

Items: the exact mechanism this topic's lab reproduces directly — a transaction's own
`transaction_timestamp()` is fixed at its start and never advances, which is why a slow
transaction's committed row carries a timestamp already behind a cursor's watermark by the time it
commits.

## PostgreSQL (current documentation): Sequence Manipulation Functions

URL: https://www.postgresql.org/docs/current/functions-sequence.html
Fetched: 2026-10-31.

Quotes:
> the value obtained by nextval is not reclaimed for re-use if the calling transaction later aborts.

Items: the named reason a sequence-id cursor is not commit-order either — a value handed out by
`nextval` is never returned to the sequence even if its own transaction rolls back, which is why
sequence ids can have gaps and need not reflect commit order.
