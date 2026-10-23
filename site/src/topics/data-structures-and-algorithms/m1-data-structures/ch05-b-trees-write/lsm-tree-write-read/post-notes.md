---
id: dsa.lsm-tree-write-read
title: LSM-tree write and read paths
---

<section data-section="outcomes">

## After this topic you can

- Trace a write through the WAL, the memtable, and a flush to an immutable sorted run.
- Trace a read that must check several runs newest-first, and show how a Bloom filter and a fence pointer each let it skip work.
- Explain why a delete is recorded as a tombstone rather than an in-place removal, and what that implies until compaction runs.

</section>

<section data-section="internals">

## Into the internals

### Why a flushed run's immutability is the load-bearing property

Everything else this topic teaches depends on a run never changing once it's written: a Bloom filter built for it stays valid forever (no key is ever added or removed from a run after the fact), and a fence pointer's stored min/max range never goes stale. The original log-structured merge tree, proposed by O'Neil, Cheng, Gawlick and O'Neil in 1996, is named here only in passing — this topic's mechanics are verified against current production documentation, not the original paper.

### Why "newest wins" needs more than wall-clock time

A real system can't rely on timestamps alone to break ties between writes that land in the same instant. Production engines (RocksDB's own documentation, among others) attach a strictly increasing sequence number to every write, in every WAL record, memtable entry, and SST file entry. "Newest" means highest sequence number, not clock time — which is also what makes a crash-and-replay deterministic: the recovered state always agrees with whatever the log says happened last.

</section>

<section data-section="lab">

## In the lab

`examples.py` builds a minimal WAL, memtable, and immutable-SSTable structure from scratch, and verifies a WAL replay reconstructs an unflushed memtable's exact contents, including a tombstone. It then measures a real Bloom filter's observed false-positive rate against RocksDB's own published bits-per-key table, confirms zero false negatives across every key actually inserted, and counts how many on-disk runs a batch of point reads actually has to open with a Bloom filter and a fence pointer in place, against how many an unfiltered read would have opened on the identical key set.

</section>

<section data-section="production">

## In production

LevelDB's and RocksDB's own design documentation describe the identical write path this topic teaches: a log file capped at a size threshold, a memtable consulted on every read, and a flush that produces a new, never-modified sorted table. RocksDB embeds a Bloom filter directly in each SST file and publishes its own bits-per-key-to-false-positive-rate table; both engines store a fence pointer as an index block, one boundary key per data block, inside the SSTable's own file format.

</section>

<section data-section="frontier">

## The frontier

RocksDB ships more than one Bloom filter implementation, including a newer "Ribbon filter" that trades a higher construction cost for less memory per key at the same false-positive rate — named here only in passing, not taught as its own mechanism.

</section>

<section data-section="questions">

## More questions

- Why can't a Bloom filter's "maybe" answer ever be treated as confirmation that a key is present?
- What would go wrong with "newest wins" if two writes to the same key could ever receive the identical sequence number?

</section>

<section data-section="next">

## Where this goes next

Flushing a full memtable to its own run solves the write problem, but only by deferring it: every run flushed is one more run every read has to check, and one more copy of every key compaction will eventually have to rewrite. Compaction and amplification, next: what it costs to clean this up, and why no policy makes that cost disappear.

</section>
