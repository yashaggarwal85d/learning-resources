- **Source offset**: the position in the database's own log (an LSN, or a GTID, or a
  file-and-offset) that says how far the connector has read, stored by the connector itself.
- **Kafka offset**: the position of the record a connector wrote into its output topic, stored
  by Kafka's own consumer-offset machinery, not the same position and not stored in the same
  place.
- **Offset commit**: Kafka Connect's own act of writing the current source offset to its
  compacted `offset.storage.topic`, done periodically rather than after every record.
- **At-least-once**: a delivery guarantee that never loses a record but can repeat one, which is
  what a crash between producing records and committing their offset actually leaves behind.
- **Exactly-once**: a delivery guarantee that neither loses nor repeats a record, which Kafka
  Connect's own source support builds by writing records and offsets in one transaction.
- **Fencing**: stopping an old, still-running copy of a task (a "zombie") from writing anything
  once a newer copy has taken over, so the two can never both produce for the same offset.
- **Jepsen**: an independent testing project whose reports probe distributed systems for
  consistency violations under real faults, cited here against Kafka's own transaction guarantees.
