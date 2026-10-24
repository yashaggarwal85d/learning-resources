# Outline: LSM write and read paths (`rust.lsm-write-read-paths`)

Chapter 22, topic 56 (first of three). Single `/make-topic` session, 2026-10-24.

## Learning outcomes

1. Build a real, minimal LSM tree: a durable log append, an active memtable, rotation to an immutable memtable, and a flush to an immutable, sorted SSTable.
2. Measure that a key overwritten after its own SSTable flush is still found via the newest structure, not the stale, already-flushed one.
3. Measure that a read genuinely has to fall through multiple structures, newest first, to find or rule out a key — a hit on the newest key costs far less than a hit on the oldest, and a genuine miss costs checking everything.
4. Measure that a flushed SSTable's own bytes are genuinely never modified by any later read against it.
5. State, from RocksDB's own wiki, how a real memtable switch and a real immutable memtable actually work.

## Changes from the chapter plan

None. All claims are measured directly against a real, deterministic LSM tree built from in-memory Rust collections; nothing here needs root access, real file I/O, or hardware the sandbox lacks.

## Reel steps (storyboard)

1. **"A key's value gets written, then its memtable is flushed to an SSTable. The same key is then overwritten, but that new write never gets flushed. Which value does a read actually return: the old, flushed one, or the new, unflushed one?"** (predict, hook) — `fig`: one key, two writes, one flushed, one not. Options: the old, flushed value, since it's the one safely on disk / the new, unflushed value, since the read checks the newest structure first (correct) / whichever one happens to be read first, unpredictably.
2. **"Measured: the fresh overwrite genuinely won over the stale, flushed value"** — `fig`: the real read, returning the fresh value. Takeaway: "A read checks the newest structure first, so a fresh, unflushed write always beats a stale, flushed one."
3. **"Three keys land in three different places: one in the very first flushed SSTable, one in a later SSTable, one still sitting only in the active memtable. Does looking up the oldest key cost the same as looking up the newest one?"** (predict) — `fig`: three keys, three ages, one lookup each. Options: yes, every lookup costs the same, regardless of where the key ended up / no, the oldest key costs genuinely more, since more structures have to be checked first (correct) / it depends only on how many keys exist in total, not on their age.
4. **"Measured: the oldest key genuinely took checking more than one structure, the newest key took checking only the active memtable, and a lookup for a key that doesn't exist at all had to check every single structure that exists"** — `fig`: the real, measured structures-checked count, one per lookup. Takeaway: "A read falls through structures newest to oldest; the older a key is, the more it costs to find, and a genuine miss costs checking everything."
5. **"A memtable gets flushed to an SSTable, and then that SSTable gets read from many times, by many different lookups. Does any one of those reads ever change a single byte of the SSTable itself?"** (predict) — `fig`: one SSTable, many reads against it. Options: yes, a read can update internal bookkeeping bytes even without changing any value / no, genuinely; the SSTable's own bytes never change after it's flushed (correct) / only if the same key gets read more than once.
6. **"Measured: a flushed SSTable's own bytes genuinely never changed across many later reads against it, hits and misses alike"** — `fig`: the real, measured byte content, identical before and after. Takeaway: "Once an SSTable is flushed, it's never modified in place; only read, merged, or deleted."
7. **"RocksDB's own wiki names the exact moment a memtable stops accepting writes directly: what happens to the active memtable, and to the write-ahead log, at that moment?"** (predict) — `fig`: the real system's own description of a memtable switch. Options: the active memtable keeps accepting writes until the SSTable flush actually finishes / the active memtable is closed and turned into an immutable memtable, and a new write-ahead log file starts at the same moment (correct) / the write-ahead log keeps growing forever, regardless of memtable switches.
8. **"Measured, in RocksDB's own words: the active memtable is closed and turned into an immutable memtable, and the write-ahead log switches to a new file at that same moment"** — `fig`: RocksDB's own words on a memtable switch, shown directly. Takeaway: "A memtable switch closes the active memtable and starts a fresh write-ahead log file at the exact same moment."
9. **"RocksDB's own wiki also names what an immutable memtable actually is, directly: what's it waiting for?"** — `fig`: the real system's own words on an immutable memtable, shown directly. NO new predict (continues directly from step seven's own memtable-switch question, to the real system's own definition of the structure that switch produces). NO takeaway (a connecting step restating the real system's own words, not a new kind of claim).
10. **Recap** — a read checks the newest structure first, so a fresh, unflushed write always beats a stale, flushed one; the older a key is, the more structures a read has to fall through to find it, and a genuine miss costs checking everything that exists. Once flushed, an SSTable's own bytes are never modified in place, exactly the closed, waiting-to-be-flushed memtable RocksDB's own wiki names a memtable switch as producing.

## Engagement arc

- Hook / early prediction: step 1 (predict, within the first four).
- Second prediction: step 3.
- Third prediction: step 5.
- Fourth prediction: step 7 (about the memtable switch; step 9 continues from it directly, with no new predict, to RocksDB's own wiki words on what an immutable memtable is waiting for).
- Surprising fact: step 9 (the real system's own documentation naming exactly this topic's own measured structure).
- Takeaways: steps 2, 4, 6, 8 (four — step 9 deliberately has none, a connecting step).
- Recap: step 10.

## Claims list

| Claim | Source |
|---|---|
| new writes always insert data to the memtable, and reads have to query the memtable before reading from SST files, because data in the memtable is newer | RocksDB Wiki: MemTable (quoted) |
| once a memtable is full, it becomes immutable and is replaced by a new memtable | RocksDB Wiki: MemTable (quoted) |
| an immutable memtable is a closed memtable that is waiting to be flushed | RocksDB Wiki: Terminology (quoted) |
| during a memtable switch, the current active memtable is closed and turned into an immutable memtable, and the current write-ahead log file is closed and a new one started | RocksDB Wiki: Terminology (quoted) |
| an overwrite landing only in the fresh active memtable genuinely wins over the same key's stale, already-flushed SSTable value | `examples/runtime-demo/src/lsm_write_read_paths_newest_first.rs` (executed, measured) |
| the oldest key genuinely takes checking more than one structure, the newest key takes checking only the active memtable, and a genuine miss checks every structure that exists | `examples/runtime-demo/src/lsm_write_read_paths_newest_first.rs` (executed, measured) |
| a flushed SSTable's own bytes genuinely never change across many later reads against it | `examples/runtime-demo/src/lsm_write_read_paths_newest_first.rs` (executed, measured) |

## Concept ledger

- `introduces`: `lsm-write-read-amplification-paths` (per `CHAPTER.md` §A.7's concept table)
- `uses`: `write-ahead-lsn-redo-idempotence` (topic 52), `btree-fanout-split-tradeoff` (topic 55)
- `declared`: []

## Bridge and handoff

- Bridge: `CHAPTER.md` §A.1's own line for this topic, reused: "Chapter 21 closed on a real trade-off, stated directly: a B+-tree pays its own write cost immediately, at insert time, as a split."
- Handoff: `CHAPTER.md` §A.8's own line for this topic, reused verbatim: "Flushed SSTables accumulate forever unless something merges them back together; what that background process costs is this chapter's next question."
