Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
sandbox's own real PostgreSQL cluster, the identical `orders` table earlier topics of this
chapter use: a real logical replication slot decoded with `test_decoding`, a real
`AFTER INSERT OR UPDATE` trigger copying changes into a shadow table, and a comparison of change
events returned against the full table's own row count.

- PostgreSQL docs, "Logical Decoding Concepts": [www.postgresql.org](https://www.postgresql.org/docs/current/logicaldecoding-explanation.html). The mechanism this topic's own measurements read directly.
- Debezium docs, PostgreSQL connector: [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). The WAL-retention cost this topic names as "operationally coupled to the source."

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=query-based-vs-log:%20).
