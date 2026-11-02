- **Retention**: discarding old data once it's past a configured age or the partition's past a
  size limit. *Where you meet it:* the setup step onward.
- **Segment deletion**: the unit retention actually deletes — a whole closed segment file, never
  a single record. *Where you meet it:* the first predict/reveal pair.
- **Log cleaner**: the background thread pool that performs compaction by recopying segments.
  *Where you meet it:* the second predict/reveal pair onward.
- **Dirty ratio**: the fraction of a log not yet compacted; crossing a configured threshold is
  what triggers a cleaning pass. *Where you meet it:* the second predict/reveal pair.
- **Compaction lag**: the minimum and maximum time a record waits before it's eligible to be
  compacted away. *Where you meet it:* the third reveal.
- **Tombstone**: a null value marking a key's deletion, itself retained for a fixed window before
  it vanishes. *Where you meet it:* the fourth reveal.
- **Changelog**: a compacted topic read start to finish, giving the latest value per key — a
  table snapshot in log form. *Where you meet it:* the recap.
