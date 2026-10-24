# Sources — Isolation levels and their anomalies

## PostgreSQL Docs: 13.1. Introduction (Concurrency Control)
URL: https://www.postgresql.org/docs/current/mvcc-intro.html
Fetched: 2026-10-24, cached at `sources/mvcc-intro.txt`.
> PostgreSQL maintains this guarantee even when providing the strictest level of transaction isolation through the use of an innovative Serializable Snapshot Isolation (SSI) level.

## PostgreSQL Docs: 13.2. Transaction Isolation
URL: https://www.postgresql.org/docs/current/transaction-iso.html
Fetched: 2026-10-24, cached at `sources/transaction-iso.txt`.
> The result of successfully committing a group of transactions is inconsistent with all possible orderings of running those transactions one at a time.

> This level emulates serial transaction execution for all committed transactions; as if transactions had been executed one after another, serially, rather than concurrently.

> If either transaction were running at the Repeatable Read isolation level, both would be allowed to commit; but since there is no serial order of execution consistent with the result, using Serializable transactions will allow one transaction to commit and will roll the other back

> The Repeatable Read isolation level only sees data committed before the transaction began; it never sees either uncommitted data or changes committed by concurrent transactions during the transaction's execution.
