- **Total order**: the guarantee that every record within a single partition keeps a fixed,
  consistent sequence. *Where you meet it:* the setup step onward.
- **In-flight requests**: requests a producer has sent but not yet gotten an acknowledgement
  for. *Where you meet it:* the second predict/reveal pair.
- **Idempotent producer**: a producer configuration that guarantees exactly one copy of each
  message is written, even across retries. *Where you meet it:* the second predict/reveal pair.
- **Partitioner**: the logic that decides which partition a record goes to, by default hashing
  its key. *Where you meet it:* the last reveal before the recap.
- **Repartitioning**: increasing a topic's partition count, which changes the default
  partitioner's key-to-partition mapping going forward. *Where you meet it:* the hook, and the
  last reveal.
