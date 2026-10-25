Last verified: 24 October 2026. Three real experiments run in this sandbox (`examples.py`,
against this sandbox's own Postgres cluster under `REPEATABLE READ`): topic 11's own read-skew
scenario, prevented; a real write-write conflict, caught with a genuine serialization failure;
and the "on-call doctors" write-skew reproduction, surviving uncaught. Fekete, Liarokapis,
O'Neil, O'Neil & Shasha's own paper, "Making Snapshot Isolation Serializable," could not be
fetched — a genuine TLS failure on its primary mirror, a login wall on a second — and is replaced
below by a Wikipedia article that states the identical mechanism and canonical example and names
their paper directly among its citations. MySQL's own InnoDB documentation page returned an HTTP
403 to this sandbox's direct fetch tooling (a bot-protection response); its quotes are the real,
current text of that live page, retrieved through this session's own browsing tool.

- PostgreSQL documentation, "13.2. Transaction Isolation": [postgresql.org](https://www.postgresql.org/docs/current/transaction-iso.html). States directly that Repeatable Read is implemented as Snapshot Isolation, and documents first-updater-wins and the `mytab`/`class`/`SUM` serialization-failure example.
- Oracle Database 19c Concepts, "Data Concurrency and Consistency": [docs.oracle.com](https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html). States that Oracle's own `SERIALIZABLE` level is snapshot isolation, with a first-committer-wins `ORA-08177` error.
- MySQL 8.0 Reference Manual, "17.7.2.1 Transaction Isolation Levels": [dev.mysql.com](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html). States that InnoDB's own `REPEATABLE READ` mixes a snapshot read with a locking read, and recommends `SERIALIZABLE` instead of mixing them.
- Wikipedia, "Snapshot isolation": [en.wikipedia.org](https://en.wikipedia.org/wiki/Snapshot_isolation). States snapshot isolation's own mechanism, the write-skew anomaly and its canonical two-balance example, and the real vendor-naming trap that Oracle itself sometimes calls its own snapshot-isolation level "serializable."

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=snapshot-isolation-write-skew:%20).
