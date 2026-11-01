- **Kafka Connect**: the framework and runtime that runs source connectors (sending records into
  Kafka) and sink connectors (propagating records out of Kafka) as a service beside the broker.
- **Connector**: the piece of configuration and code that moves records in or out of Kafka —
  Debezium is a source connector, a JDBC sink is a sink connector.
- **SMT**: a single message transform, a small unit of logic a Kafka Connect connector applies
  to each record it handles, chained one after another.
- **Envelope**: the full shape of one Debezium change event — `before`, `after`, `source`, `op`
  and `ts_ms` together, before any SMT has touched it.
- **`op`**: the envelope's own one-letter field naming what kind of change it carries — create,
  update, delete, read (a snapshot row) or truncate.
- **Source block**: the envelope's own `source` field, naming the connector, database, table,
  log position and whether the event came from a snapshot.
- **Sink connector**: a Kafka Connect connector that writes records out of a topic into another
  system, such as a database table.
- **Upsert**: a single write that inserts a row if its key is new and updates it if the key
  already exists, which is what makes a sink connector's writes replay-safe.
