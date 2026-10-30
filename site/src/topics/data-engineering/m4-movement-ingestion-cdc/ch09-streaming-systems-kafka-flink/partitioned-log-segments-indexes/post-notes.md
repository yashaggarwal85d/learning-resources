<section data-section="outcomes">

## Outcomes

A real toy partition, four hundred records appended through this topic's own `examples.py`,
rolls to a new segment three separate times as it crosses its configured four-thousand-and-
ninety-six-byte limit, ending with four segments total — one still open, three sealed. Its
sparse offset index holds fifty entries for those four hundred records: far fewer than one per
record, and still enough that a seek for a record near the end touches only four records plus
one index lookup, against three hundred and ninety-six records for a naive scan of the same
log. A consumer that rewinds its own stored offset from five back to zero and re-reads is
measured, byte for byte, to leave the partition's segments and index completely unchanged —
direct, run evidence for "the broker tracks no per-consumer state," not an assertion taken on
faith. Zero-copy reads (the kernel's `sendfile` call serving bytes straight from its own page
cache to the network) are named and sourced directly from Kafka's own design documentation,
since this sandbox has no real multi-broker cluster to measure a real zero-copy read against.

</section>

<section data-section="lab">

## Lab

This topic hosts the first leg of the 9.1 chapter lab (`CHAPTER.md`): "build a toy segmented
log with an offset index and consumer offset tracking." `examples.py` does exactly that — a
`Partition` class that rolls real segment files on disk at a real configured byte limit, a
sparse `IndexEntry` list built the same way Kafka's own `log.index.interval.bytes` works
conceptually (an entry added only once enough bytes have accumulated since the last one, never
one entry per record), and a `Consumer` class whose only state is a single integer offset,
entirely outside the partition's own files. Every number this topic's reel shows — the roll
count, the index size, the two scan counts, the rewind-and-reread proof — is asserted in
`examples.py` and reproduced from a real run, not invented for the picture.

</section>

<section data-section="production">

## Production failures this topic warns about

**Setting `log.segment.bytes` far smaller than the real default to "see rolls happen more
often."** A tiny segment size multiplies the number of open file handles and index files a
broker must hold per partition, and multiplies the per-segment overhead (an index file, a time
index file) for no benefit once the system is at real scale — this topic's own toy log uses a
small limit for exactly the opposite reason (so a roll is visible on screen in a few hundred
records instead of a gigabyte of data), and says so plainly rather than implying the toy number
is realistic.

**Assuming the sparse index means "approximate" or "lossy."** The index never loses a record —
it only narrows a seek down to the right segment and a nearby byte position, after which a
short, exact linear scan finds the precise record. This topic's own run proves the sparse-index
seek and a full naive scan return the bit-for-bit identical record for the same offset, every
time; "sparse" describes the index's own size, not the correctness of what it finds.

</section>

<section data-section="frontier">

## Frontier

Kafka's own design documentation goes further than this topic measures: `sendfile`/zero-copy is
explicitly *not* used once TLS is enabled, because TLS termination happens in user space and the
kernel can no longer hand bytes straight from its page cache to an unencrypted socket — a real,
named operational cost of turning on encryption that this topic names but does not measure,
since no real broker runs in this sandbox to compare an encrypted and unencrypted read path
directly. The real, current `log.index.interval.bytes` default (four thousand and ninety-six
bytes, confirmed from Kafka's own `ServerLogConfigs.java` at planning time, re-verified here) is
the one builders should check against the live documentation again before citing it in a future
topic, since it is a build-time default, not an architectural constant.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A partition is a log a producer writes to. What a producer actually sends — batched, compressed,
with a chosen acknowledgement level — and what it risks by not waiting for one, is the next
topic.

</section>
