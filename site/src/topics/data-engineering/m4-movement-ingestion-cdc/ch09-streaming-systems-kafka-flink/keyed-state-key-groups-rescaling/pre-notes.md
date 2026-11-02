- **Heap state**: state held as plain objects on the JVM heap, fast but bounded by cluster memory.
  *Where you meet it:* the backends reveal.
- **RocksDB**: an embedded, on-disk key-value store per TaskManager, bounded by disk rather than
  memory. *Where you meet it:* the backends reveal.
- **Key group**: a fixed partition keyed state is hashed into, determined once by max
  parallelism. *Where you meet it:* the key-groups reveal.
- **Max parallelism**: the setting that fixes the number of key groups a job will ever have; not
  changeable without a full state migration. *Where you meet it:* the key-groups reveal.
- **State TTL**: a configured idle period after which a key's state expires and is cleaned up.
  *Where you meet it:* the TTL/schema reveal.
- **Savepoint migration**: restoring a savepoint taken on one Flink version into a different one,
  subject to real, documented compatibility limits. *Where you meet it:* the version-break reveal.
