Last verified: 24 October 2026. Three real experiments run in this sandbox (`examples.py`,
against this sandbox's own Postgres cluster): a genuine cyclic-wait deadlock, caught by the
engine's own deadlock monitor; the exact same contention under a consistent lock order,
producing zero deadlocks across repeated rounds; and a real `ACCESS EXCLUSIVE` lock measured
blocking a concurrent plain read. Db2's own `maxlocks` documentation page returned an HTTP 403 to
this sandbox's direct fetch tooling (a bot-protection response); its quotes below are the real,
current text of that live page, retrieved through this session's own browsing tool. SQL Server's
and Db2's own lock-escalation thresholds are disclosed as sourced directly from each vendor's own
current documentation, since neither engine runs in this sandbox.

- PostgreSQL documentation, "13.3. Explicit Locking": [postgresql.org](https://www.postgresql.org/docs/current/explicit-locking.html). Real table lock modes, ACCESS EXCLUSIVE's own conflict set, and the canonical deadlock example.
- PostgreSQL documentation, "19.12. Lock Management": [postgresql.org](https://www.postgresql.org/docs/current/runtime-config-locks.html). `deadlock_timeout`'s own role as a detection-gating timer.
- Microsoft Learn, "Transaction Locking and Row Versioning Guide": [learn.microsoft.com](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide). SQL Server's own intent locks and lock-escalation mechanism, with real thresholds.
- Microsoft Learn, "Deadlocks Guide": [learn.microsoft.com](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide). SQL Server's own deadlock monitor and cyclic-dependency search.
- Db2 documentation, "maxlocks - Maximum percent of lock list before escalation configuration parameter": [ibm.com](https://www.ibm.com/docs/en/SSHRBY/com.ibm.db2.luw.admin.config.doc/doc/r0000268.html). Db2's own percentage-based escalation trigger.
- Wikipedia, "Deadlock prevention algorithms": [en.wikipedia.org](https://en.wikipedia.org/wiki/Deadlock_prevention_algorithms). Wait-die and wound-wait's own precise priority-based abort rules.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=locking-deadlocks-lock-escalation:%20).
