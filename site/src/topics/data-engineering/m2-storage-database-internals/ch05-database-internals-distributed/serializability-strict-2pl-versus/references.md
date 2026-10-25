Last verified: 24 October 2026. Three real experiments run in this sandbox (`examples.py`,
against this sandbox's own Postgres cluster under `SERIALIZABLE`): topic 12's own doctors
scenario rerun, now caught; a real retry succeeding on its first attempt; and a real abort rate
measured rising with contention, stable across seven repeated runs. Cahill, Röhm & Fekete's own
2008 paper could not be fetched — a login wall on one mirror, a genuine TLS failure on a second,
matching topic 12's own documented failure on the same host — and is replaced below by
PostgreSQL's own `README-SSI`, which states Cahill et al.'s own algorithm directly and by name
and *is itself* Ports & Grittner's own Postgres implementation, maintained in the same source
tree as the code it documents.

- PostgreSQL source tree, `README-SSI`: [raw.githubusercontent.com](https://raw.githubusercontent.com/postgres/postgres/master/src/backend/storage/lmgr/README-SSI). States strict two-phase locking's own mechanism, SSI's own mechanism and dangerous-structure algorithm (attributed to Cahill et al.), and the retry-friendly SQLSTATE 40001 design.
- PostgreSQL documentation, "13.2. Transaction Isolation": [postgresql.org](https://www.postgresql.org/docs/current/transaction-iso.html). States the mandatory retry requirement under `SERIALIZABLE`, the retry mechanics, and predicate locking's own non-blocking design.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=serializability-strict-2pl-versus:%20).
