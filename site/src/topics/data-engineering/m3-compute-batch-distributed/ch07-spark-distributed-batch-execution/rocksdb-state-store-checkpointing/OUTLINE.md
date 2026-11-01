# Outline: de.rocksdb-state-store-checkpointing

1. **Hook.** Exactly-once leans on the state store surviving a restart. This topic is what that
   store actually is, and when the default one stops being enough.
2. **Reveal: the default provider keeps state in the JVM's own heap.** Millions of keys means
   millions of objects the garbage collector now has to walk. [from]
3. **Predict: a million-key aggregation, on the default provider. GC time stays flat, or
   climbs?** [idx2]
4. **Reveal: climbs, measured directly.** The same workload on RocksDB stays flat -- its state
   never touches the JVM heap at all.
5. **Elaborate: native memory and local disk, not JVM objects.** RocksDB moves the millions of
   key-value entries out of the one place the GC has to scan. [takeaway1]
6. **Predict: every checkpoint re-uploads the full state snapshot. True, or false?** [idx5]
7. **Reveal: false -- changelog checkpointing uploads only what changed.** Measured: the bytes
   written per checkpoint collapse once changelog checkpointing is on.
8. **Elaborate: a full snapshot still happens -- just not every batch.** Changelog checkpointing
   defers the expensive part without ever skipping it. [takeaway2]
9. **Reveal: this chapter's own numbers never needed any of this.** The scale where RocksDB
   earns its cost is measured in millions of keys, not the chapter's own examples.
10. **Recap.** [takeaway3]
