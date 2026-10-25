<section data-section="outcomes">

## Outcomes

Trace a real write through RocksDB's own WAL, memtable, immutable memtable and flushed SSTable
path, measured directly against a real instance: flushing a single write produces exactly one
new file on disk, never edited again. Explain why a point read checks newest structures first —
the active memtable, then older structures from newest to oldest, stopping at the first match —
and how a per-file Bloom filter and block index make that check cheap: the filter proves absence
in one shot for the large majority of lookups on keys that don't exist, and the index turns "scan
the whole file" into "load one data block" for the rest. Explain how a range read merges many
sorted runs instead of stopping early, keeping only the newest version of any key more than one
structure holds. Explain a tombstone and why a delete in an LSM tree is not free, measured
directly: deleting and flushing a batch of keys produces a second file, made almost entirely of
tombstones, growing total bytes on disk rather than shrinking them.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` runs five real measurements directly against a real RocksDB
instance in this sandbox (`rocksdict`). First, a single write flushed produces exactly one new
SST file at level 0 with exactly one entry, where none existed before. Second, a key flushed to
disk and then overwritten again in the still-active memtable is answered, on read, by the
memtable alone: RocksDB's own `rocksdb.memtable.hit` and `rocksdb.l0.hit` statistics counters
show one hit and zero hits respectively, proving the older file is never even opened. Third, a
full keyspace scan across a flushed file (five keys) and an overlapping memtable (one shared key
overwritten, one new key) returns all six keys exactly once, in sorted order, with the memtable's
newer value winning for the shared key. Fourth, flushing five hundred keys produces one file;
deleting half of them and flushing again produces a second, separate file holding only
tombstones, with the original file untouched and total bytes on disk measurably higher than
before the delete. Fifth, and the chapter's own lab measurement: five hundred lookups for keys
chosen to be absent but lexically inside an existing file's own key range (so RocksDB's coarse
file-range pruning can't skip the file before the Bloom filter is even consulted) are checked
against that file's real 10-bits-per-key Bloom filter, with the large majority rejected without
touching a data block and the rest never resolving to an actual match.

</section>

<section data-section="production">

## Production failures this topic warns about

**Tombstone build-up as a real operational cost.** A delete in an LSM tree writes a new record;
it never shrinks anything on its own. A workload with heavy deletes and infrequent compaction
accumulates tombstones (and the stale data they shadow) faster than anything reclaims them,
growing disk usage and slowing every read that has to skip past them — the exact production
failure the next topic's compaction strategies exist to bound.

**A point read's cost depends on how many structures it has to check before the first match.**
This topic's own measurement shows the best case (the newest write, answered by the memtable
alone, with zero disk reads). A workload that keeps writing the same keys repeatedly without
ever letting compaction merge the resulting files down stays fast; one that scatters writes
across many keys that never get touched again accumulates files a point read for an old, cold
key may have to check one by one, newest to oldest, before it finds (or fails to find) a match.

</section>

<section data-section="frontier">

## Frontier

RocksDB's partitioned and legacy block-based Bloom filters, and the Ribbon filter (a newer
space-for-CPU trade-off, saving roughly 30% of filter memory at several times the CPU cost to
build), are named directly in the RocksDB Bloom Filter documentation but not taught here — one
measured full-filter rejection rate is enough for this topic's own outcomes. The exact
false-positive-rate math (the Poisson-distribution analysis of cache-local filter sharding) is
likewise named in the source and left for a reader who wants the derivation, not reproduced.
RocksDB's own `Snapshot` API, a separate point-in-time view mechanism from the plain `get()` and
iterator reads this topic measures, is named in the RocksDB Overview documentation and left for
a future topic on isolation.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

An LSM tree accumulates sorted runs forever unless something merges them back down. That
something is compaction, and how it merges them decides the trade-off the whole structure is
built around.

</section>
