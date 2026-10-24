Last verified against these sources: 24 October 2026. Real measurements run in this sandbox
(`examples.py`, against this sandbox's own PostgreSQL 16 cluster, via the `pageinspect`
extension): a real index's own `bt_metap()` level and real page count for a fifty-thousand-row
table; real page-count growth under identical mid-range inserts for a tightly packed versus a
loosely packed index; real page-count difference for deduplication on versus off on a heavily
duplicated column. The Lehman-Yao algorithm and the InnoDB clustered-index contrast are
disclosed, sourced-only claims, since neither can be run or reproduced against this sandbox.

- PostgreSQL docs, "67.4. Implementation": [postgresql.org](https://www.postgresql.org/docs/16/btree-implementation.html). B-tree structure, page splits, and deduplication, in the engine's own words.
- PostgreSQL docs, "CREATE INDEX": [postgresql.org](https://www.postgresql.org/docs/16/sql-createindex.html). `fillfactor`'s own documented trade-off.
- PostgreSQL `nbtree` README (source tree): [github.com](https://raw.githubusercontent.com/postgres/postgres/REL_16_STABLE/src/backend/access/nbtree/README). Postgres's own description of the Lehman-Yao concurrency algorithm.
- PostgreSQL docs, "E.6. Release 18": [postgresql.org](https://www.postgresql.org/docs/18/release-18.html). Skip scan as a real, versioned feature.
- MariaDB Documentation, "PRIMARY KEY Constraints": [mariadb.com](https://mariadb.com/docs/server/architecture/server-constraints/primary-key-constraints). InnoDB's clustered-index design.
- MariaDB Documentation, "Building the best INDEX for a given SELECT": [mariadb.com](https://mariadb.com/docs/server/ha-and-performance/optimization-and-tuning/optimization-and-indexes/building-the-best-index-for-a-given-select). A secondary-index lookup's real cost on a clustered table.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=b-tree-indexes-production:%20).
