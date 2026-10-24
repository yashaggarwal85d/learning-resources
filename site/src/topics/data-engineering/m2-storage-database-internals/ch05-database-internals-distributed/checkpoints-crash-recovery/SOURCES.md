# Sources — Checkpoints and crash recovery

## wal-redo-roll-forward — PostgreSQL 16 documentation (30.3. Write-Ahead Logging (WAL))
URL: https://www.postgresql.org/docs/16/wal-intro.html
Fetched: 2026-10-24, cached at `sources/wal-intro.txt`.

> If we follow this procedure, we do not need to flush data pages to disk on every transaction commit, because we know that in the event of a crash we will be able to recover the database using the log: any changes that have not been applied to the data pages can be redone from the WAL records. (This is roll-forward recovery, also known as REDO.)

## checkpoint-redo-record — PostgreSQL 16 documentation (30.5. WAL Configuration)
URL: https://www.postgresql.org/docs/16/wal-configuration.html
Fetched: 2026-10-24, cached at `sources/wal-configuration.txt`.

> In the event of a crash, the crash recovery procedure looks at the latest checkpoint record to determine the point in the WAL (known as the redo record) from which it should start the REDO operation.

## checkpoint-frequency-tradeoff — PostgreSQL 16 documentation (30.5. WAL Configuration)
URL: https://www.postgresql.org/docs/16/wal-configuration.html
Fetched: 2026-10-24, cached at `sources/wal-configuration.txt`.

> Reducing checkpoint_timeout and/or max_wal_size causes checkpoints to occur more often. This allows faster after-crash recovery, since less work will need to be redone. However, one must balance this against the increased cost of flushing dirty data pages more often. If full_page_writes is set (as is the default), there is another factor to consider. To ensure data page consistency, the first modification of a data page after each checkpoint results in logging the entire page content. In that case, a smaller checkpoint interval increases the volume of output to the WAL, partially negating the goal of using a smaller interval, and in any case causing more disk I/O.

## wal-pitr-substrate — PostgreSQL 16 documentation (26.3. Continuous Archiving and Point-in-Time Recovery (PITR))
URL: https://www.postgresql.org/docs/16/continuous-archiving.html
Fetched: 2026-10-24, cached at `sources/continuous-archiving.txt`.

> It is not necessary to replay the WAL entries all the way to the end. We could stop the replay at any point and have a consistent snapshot of the database as it was at that time. Thus, this technique supports point-in-time recovery: it is possible to restore the database to its state at any time since your base backup was taken.

**Named but not quoted** (OCR scan unreliable for word-for-word quoting):

Mohan, C., Haderle, D., Lindsay, B., Pirahesh, H., Schwarz, P. "ARIES: A Transaction Recovery Method Supporting Fine-Granularity Locking and Partial Rollbacks Using Write-Ahead Logging." *ACM Transactions on Database Systems*, Vol. 17, No. 1, March 1992.

Fetched (several identical mirrors, all the same scanned/OCR'd copy, e.g. `https://cs.uwaterloo.ca/~david/cs448/aries-mohan.pdf`, cached at `sources/aries-paper.txt`): the OCR text is positionally scrambled by the paper's two-column layout (words and lines reordered, at least one OCR misread already visible in the abstract — "Recouery" for "Recovery"), so it cannot be quoted word for word with confidence. This topic cites the paper by full reference for its well-established three-pass (analysis, redo, undo) recovery structure — standard, uncontested database-systems material, confirmed by the paper's own clearly legible comparison table noting "DB2 makes three passes (analysis, redo, and then undo)" (`sources/aries-paper.txt`, around the Table of recovery passes by system) — without a block quote from the garbled running text, per OUTLINE.md → "Changes from the chapter plan."

Last verified: 2026-10-24. Expert sign-off: pending.
