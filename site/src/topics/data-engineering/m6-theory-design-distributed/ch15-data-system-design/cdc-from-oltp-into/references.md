Last verified against these sources: 30 October 2026. Expert sign-off: pending.

- PostgreSQL documentation, "19.6. Replication" (Server Configuration): [postgresql.org](https://www.postgresql.org/docs/current/runtime-config-replication.html). The max_slot_wal_keep_size setting this topic's cap-and-cost reveal is built on.
- Debezium documentation, "Debezium connector for PostgreSQL": [debezium.io](https://debezium.io/documentation/reference/stable/connectors/postgresql.html). The slot's WAL-retention guarantee and the heartbeat fix this topic's guarantee-is-hazard and cap reveals are built on.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cdc-from-oltp-into:%20).
