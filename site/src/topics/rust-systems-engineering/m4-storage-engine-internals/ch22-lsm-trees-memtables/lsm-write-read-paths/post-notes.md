---
title: "LSM write and read paths"
---

## Outcomes

- Build a real, minimal LSM tree: a durable log append, an active memtable, rotation to an immutable memtable, and a flush to an immutable, sorted SSTable.
- Measure that a key overwritten after its own SSTable flush is still found via the newest structure, not the stale, already-flushed one.
- Measure that a read genuinely has to fall through multiple structures, newest first, to find or rule out a key.
- Measure that a flushed SSTable's own bytes are genuinely never modified by any later read against it.
- State, from RocksDB's own wiki, how a real memtable switch and a real immutable memtable actually work.

## Internals

The immutability claim uses a content fold over the SSTable's own entry bytes, taken immediately after flush and again after several further reads, both hits and honest misses — a genuine before-and-after measurement, not a structural guarantee taken on faith. The fall-through claim measures a real checked-structure count the lookup itself returns, so the oldest key's higher cost and the newest key's lower cost are both genuine consequences of the real read path's newest-first order, not an assumption about which structure should have been checked.

## In production

RocksDB's own wiki states the read path directly: new writes always insert into the memtable, and reads have to query the memtable before reading from SST files, because the memtable holds the newest data. Its own Terminology page names the structure a memtable switch produces plainly: a closed memtable that is waiting to be flushed, created the moment the active memtable is closed and a new write-ahead log file starts.

## The frontier

This topic's own memtable, immutable-memtable list, and SSTable list are all plain in-memory Rust collections rather than real files, continuing this chapter's own convention that nothing here needs real file I/O, root access, or special hardware. The write-ahead log itself is represented only as a generation counter, since the claims under test are about read-path ordering and SSTable immutability, not log durability.

## Where this goes next

Flushed SSTables accumulate forever unless something merges them back together; what that background process costs is this chapter's next question.
