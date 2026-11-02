<section data-section="outcomes">

## Predicting which provider a key-count estimate calls for

The default, HDFS-backed provider keeps every key's state as a JVM object, so its own garbage
collector has to walk all of them on every collection. Measured directly: a growing-key
aggregation on the default provider pays real, climbing GC time; the identical workload on
RocksDB stays far lower, since RocksDB's state lives in native memory and on local disk instead
of the JVM heap. An estimate in the thousands of keys rarely needs RocksDB; an estimate in the
millions, where this chapter's own examples never ventured, calls for it.

</section>

<section data-section="How changelog checkpointing avoids re-uploading the full state">

## How changelog checkpointing avoids re-uploading the full state

Measured directly: switching on changelog checkpointing collapses the bytes written per
checkpoint for the identical workload that otherwise re-uploads a full RocksDB snapshot every
commit. It does this by uploading only the changes since the last checkpoint. The full snapshot
doesn't disappear -- it still happens periodically in the background -- but changelog
checkpointing defers that expensive cost instead of paying it on every single commit.

</section>

<section data-section="production failures">

## The GC/OOM failure that forces the switch

The failure this topic's scope names -- large JVM GC pauses, high variance in micro-batch
times, and eventually out-of-memory failures -- is the real cost of letting a growing key count
sit as JVM objects on the default provider. It isn't a bug to fix; it's the signal that the
key count has crossed into the range RocksDB exists for.

</section>

<section data-section="frontier">

## Where this goes next

Structured Streaming is done: the engine, the correctness boundary and the state store that
scales it. The next section turns from the engine's execution model to the platform itself --
what changed under Spark's feet in its 4.x releases.

</section>
