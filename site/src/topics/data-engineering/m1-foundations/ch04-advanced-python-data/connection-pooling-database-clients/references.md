Last verified against these sources: 23 October 2026. Real measurements on this sandbox's own
PostgreSQL cluster and two live PgBouncer instances (`examples.py`).

- PgBouncer, "Features": [pgbouncer.org](https://www.pgbouncer.org/features.html). The three pooling modes and their feature-compatibility trade-offs.
- PgBouncer, "Configuration": [pgbouncer.org](https://www.pgbouncer.org/config.html). `max_prepared_statements`, the internal name-rewriting mechanism, the "cached plan must not change result type" error.
- PgBouncer, "FAQ": [pgbouncer.org](https://www.pgbouncer.org/faq.html). The session-pooling reset-query requirement; the version (1.21.0) transaction-pooling prepared-statement tracking requires.
- Vlad Mihalcea, "The simple scalability equation": [vladmihalcea.com](https://vladmihalcea.com/the-simple-scalability-equation/). Little's Law applied to a connection pool, with a fully worked example.
- psycopg 3 docs, "Cursor types": [psycopg.org](https://www.psycopg.org/psycopg3/docs/advanced/cursors.html). Server-side cursors, when they help and when they hurt.
- psycopg 3 docs, "Using COPY TO and COPY FROM": [psycopg.org](https://www.psycopg.org/psycopg3/docs/basic/copy.html). `Cursor.copy()`, why COPY is an efficient load path.
- ADBC, "PostgreSQL Driver": [arrow.apache.org](https://arrow.apache.org/adbc/current/driver/postgresql.html). The Arrow-native driver's use of COPY internally for query execution and bulk ingestion.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=connection-pooling-database-clients:%20).
