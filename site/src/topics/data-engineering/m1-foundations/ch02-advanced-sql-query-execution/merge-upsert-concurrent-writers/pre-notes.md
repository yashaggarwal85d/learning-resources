- **Transaction**: a group of statements that succeed or fail together. *Where you meet it:* `BEGIN … COMMIT`.
- **Snapshot read**: a query sees the data as of one moment, not changes committed afterwards. *Where you meet it:* two sessions in `READ COMMITTED` seeing different data between statements.
- **Unique index / constraint**: a rule, backed by an index, that no two rows share a key. *Where you meet it:* a primary key.
- **Parquet data file**: an immutable columnar file; a table is a set of them. *Where you meet it:* lakehouse tables.

**Check yourself:** two sessions insert the same primary key at once. What does the second one get? (Answer: a unique-violation error, or it waits for the first to commit and then fails.)
