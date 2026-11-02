- **Tombstone**: a Kafka record with a key and a null value, which log compaction treats as
  permission to drop every earlier record for that key.
- **Log compaction**: Kafka's own rule of keeping only the latest record for each key in a
  topic, run periodically rather than instantly.
- **Soft delete**: marking a row deleted (a `deleted_at` or `status` column) while keeping the
  row itself, so it travels as an ordinary update.
- **Hard delete**: actually removing a row, so it travels only through the log, never through a
  later query of the table itself.
- **Delete file**: a merge-on-read table format's own record of which rows a later read should
  skip, without rewriting the data files those rows live in.
- **Retention window**: the time Kafka keeps a tombstone around before removing it too, after
  which a consumer reading from scratch can no longer see that a key was ever deleted.
- **`MERGE`**: the single SQL statement that can insert, update or delete a target table's own
  rows in one pass, based on how each incoming row matches it.
