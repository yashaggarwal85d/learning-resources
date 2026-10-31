## Before this topic

- **dynamic table** — a Flink SQL table whose contents change over time, built from a stream's changelog rather than a fixed, static snapshot.
- **changelog** — the ordered sequence of inserts, updates, and deletes that turns a stream into a table (or a table's own history of changes).
- **append / upsert / retract** — the three ways Flink's dynamic tables encode a change when converting a table back into a stream.
- **regular / interval / temporal / lookup join** — four ways to join two streaming inputs, each keeping a different amount of state.
- **materialised table** — a Flink SQL table type that defines its own refresh pipeline and freshness target, rather than being manually populated.
- **compacted changelog topic** — a Kafka topic retaining only the latest value per key, the mechanism topic 6 covered that upsert mode generalizes into SQL.
