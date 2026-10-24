Last verified: 24 October 2026. Real transactions run in this sandbox (`examples.py`, against this
sandbox's real Postgres cluster): a CHECK-constrained transfer that fails partway, left unchanged;
a declared constraint blocking a bad update while an undeclared one is silently broken; the
identical read-modify-reread interleaving measured under Read Committed and Repeatable Read; and a
commit's own WAL position measured advancing, with a fresh connection reading the result back. The
original ACID coinage (Härder & Reuter, 1983, ACM Computing Surveys) is paywalled on the ACM
Digital Library; no free mirror could be fetched (every candidate course-site URL tried either hit
a genuine TLS failure or redirected to an unrelated page) — replaced below by two Wikipedia
articles that quote and cite the original paper directly.

- Wikipedia, "ACID": [en.wikipedia.org](https://en.wikipedia.org/wiki/ACID). The 1983 coinage, the 1973 IBM IMS precedent, and the four properties' own precise definitions, including the bank-transfer atomicity example this topic's own `examples.py` reproduces.
- Wikipedia, "Consistency (database systems)": [en.wikipedia.org](https://en.wikipedia.org/wiki/Consistency_%28database_systems%29). The precise engine/application split this topic's own second half is built on.
- PostgreSQL docs, "13.2. Transaction Isolation": [postgresql.org](https://www.postgresql.org/docs/current/transaction-iso.html). The SQL standard's own precise definition of Serializable.
- PostgreSQL docs, "13.1. Introduction" (Concurrency Control): [postgresql.org](https://www.postgresql.org/docs/current/mvcc-intro.html). MVCC as Postgres's own real isolation mechanism, measured directly in this topic.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=acid-guarantees-precisely-stated:%20).
