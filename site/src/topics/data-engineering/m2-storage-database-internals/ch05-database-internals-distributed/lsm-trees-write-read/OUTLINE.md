# Outline — de.lsm-trees-write-read

## Outcomes

1. Trace a real write through RocksDB's own WAL → memtable → immutable memtable → flushed SSTable path.
2. Explain why a point read checks newest structures first, and how a per-file Bloom filter and block index make that check cheap.
3. Explain how a range read merges many sorted runs instead of stopping at the first match.
4. Explain a tombstone and why a delete in an LSM tree is not free, measured directly against a real RocksDB instance.

## Storyboard

### 1. Hook

- **fig:** none (title card).
- **Visual idea:** the previous topic's own handoff, restated as the open question.
- **On screen:** "MVCC never updates in place. Vacuum is the bill it pays later." → "what if a structure never updated in place on purpose?" → "the LSM tree".
- **Moves:** `Draw` the handoff sentence in, `lock-on` the question.
- **Final frame:** the question held on screen, unanswered.
- **Caption point:** this topic is the other family's own write and read path, traced through a real engine.

### 2. Reveal: a write, through the memtable and out to a file

- **fig:** `MemtableFlushLifecycle`.
- **Visual idea:** a real write landing in an in-memory structure, counted directly via RocksDB's own properties, then flushed to a brand-new file on disk.
- **On screen:** "a write lands in the memtable" → "SST files on disk: 0" → "the memtable is flushed" → "SST files on disk: 1".
- **Moves:** `Draw` the memtable as a box filling, `count` the SST file total before and after.
- **Real values:** 0 SST files before any flush, 1 SST file (level 0, 1 entry) right after (examples.py: `memtable_flush_lifecycle`).
- **Final frame:** the one new file's own metadata — level 0, 1 entry.
- **Caption point:** the memtable is RocksDB's own default skiplist, a sorted in-memory structure; flushing writes it out whole, as one new, immutable, sorted file — never edited again once written.
- **Takeaway:** "A memtable never gets edited after it's flushed. Every flush is a brand-new, immutable file."

### 3. Predict: which value answers the read

- **fig:** none (predict card).
- **On screen:** the question: "Key `k1` was written, flushed to disk, then overwritten again — but that new write hasn't been flushed yet. A read for `k1` comes in. Which value comes back, and does it have to touch the file on disk at all?"
- **Options:** (a) "It has to check the file and the memtable, then pick the newer one" (tempting: sounds like the careful, correct-looking answer); (b) "The memtable answers it alone — the file on disk is never even touched" (correct).
- **Moves:** `lock-on` the question, hold both options on screen.
- **Final frame:** both options visible, unresolved.
- **Caption point:** sets up the reveal that follows, measured directly rather than argued.

### 4. Reveal: a point read checks the newest structure first

- **fig:** `PointReadNewestFirst`.
- **Visual idea:** the same two structures from step 2 — an older file on disk, a newer memtable in front of it — with the read stopping at the first one it checks.
- **On screen:** "file on disk: k1 = A" → "memtable: k1 = B (never flushed)" → "read k1" → "memtable hits: 1, file hits: 0" → "answer: B".
- **Moves:** `Reticle` lock onto the memtable first, `decode` why the file is never reached.
- **Real values:** reading `k1` after this sequence returns `"B"`; RocksDB's own counters show 1 memtable hit and 0 L0 (file) hits (examples.py: `point_read_checks_newest_first`).
- **Final frame:** "memtable hits: 1, file hits: 0" held next to the returned value, `B`.
- **Caption point:** a point read checks the newest structure first and stops the moment it finds the key — the active memtable, then older immutable memtables, then files from newest to oldest — so an older file holding a stale value is never even opened.
- **Takeaway:** "A point read stops at the first structure that has the key. An older file holding a stale value is never opened."

### 5. Reveal: a range read can't stop early

- **fig:** `RangeReadMerge`.
- **Visual idea:** a file's own sorted run and the memtable's own sorted run, drawn side by side, merged into one output line.
- **On screen:** "file: k1..k5, all old" → "memtable: k3 = new, k6 = new" → "merged scan: k1, k2, k3 (new), k4, k5, k6 (new)".
- **Moves:** `Plot` the two sorted runs as parallel tracks, `Draw` them folding into one merged output.
- **Real values:** scanning the whole keyspace returns exactly `[k1=old, k2=old, k3=new, k4=old, k5=old, k6=new]` — six keys, the shared key `k3` appearing once, at its newest value (examples.py: `range_read_merges_sorted_runs`).
- **Final frame:** the six merged rows, `k3` and `k6` marked as where the memtable's newer value won.
- **Caption point:** a range read has no single newest structure to stop at — every structure's overlap with the range must be scanned and merged, keeping only the newest version of any key more than one of them holds.
- **Takeaway:** "A point read stops at the first match. A range read can't — it has to merge every structure's overlap with the range."

### 6. Reveal: the Bloom filter, a fast no

- **fig:** `BloomFilterGate`.
- **Visual idea:** 500 lookups for keys that don't exist, each one hitting a gate in front of the file; most rejected instantly, a few slipping through to an actual (wasted) read.
- **On screen:** "500 lookups, for keys that don't exist" → "rejected by the filter: 494" → "slipped through anyway: 6" → "none of the 6 were real — every slip is wasted work, not a wrong answer".
- **Moves:** `Reticle` the gate rejecting most of the stream, `count` the real split.
- **Real values:** 494 of 500 lookups for absent keys rejected by the Bloom filter without touching the file; 6 false positives that still forced a wasted read, 0 of which turned out to actually exist (examples.py: `bloom_filter_rejects_absent_keys`).
- **Final frame:** "494 rejected, 6 wasted reads, 0 wrong answers" held on screen.
- **Caption point:** a Bloom filter hashes the key and probes a handful of bits per file; a single zero bit proves the key is absent, which is most of what it ever has to say, but it can never prove a key is present — a positive only means "maybe", and checking "maybe" costs a real, if occasional, wasted read.
- **Takeaway:** "A Bloom filter can prove a key is absent in one shot. It can never prove a key is present — only 'maybe'."

### 7. Reveal: the block index, after the filter says maybe

- **fig:** `BlockIndexLookup`.
- **Visual idea:** the file from step 6 broken into its own sorted data blocks, with the index pointing straight at the one block that could hold the key.
- **On screen:** "the filter says maybe" → "the file's own index: a binary search over its data blocks" → "one block loaded, not the whole file".
- **Moves:** `Decode` the index narrowing from "the whole file" to "one data block", `Reticle` lock onto that block.
- **Final frame:** the one data block highlighted, the rest of the file dimmed.
- **Caption point:** every file keeps its own block index, a binary-search structure built when the file was written; once the Bloom filter can't rule a key out, the index is what keeps the actual read down to one block instead of the whole file.
- **Takeaway:** "The filter decides whether to look at all. The index decides where to look."

### 8. Reveal: a delete is not free

- **fig:** `TombstoneGrowth`.
- **Visual idea:** one file on disk, then a second file appearing after a batch of deletes — made almost entirely of tombstones — with the total bytes on disk going up, not down.
- **On screen:** "500 keys, flushed: 5187 bytes" → "delete 250 of them, flush again" → "7926 bytes — it grew" → "the new file: 250 entries, all 250 tombstones".
- **Moves:** `Plot` the total byte count rising after the delete, `count` the tombstone file's own entries.
- **Real values:** 5187 bytes after the first flush of 500 keys; 7926 bytes after deleting 250 of them and flushing again; the new file holds exactly 250 entries, all 250 marked as deletions (examples.py: `tombstones_are_not_free`).
- **Final frame:** "5187 → 7926 bytes, from a delete" held on screen, the original file untouched beside the new tombstone-only one.
- **Caption point:** a delete in an LSM tree writes a new record, a tombstone, instead of erasing anything in place — the original file is never touched, and disk usage grows until something later discards the tombstone and the row it shadows together.
- **Takeaway:** "A delete doesn't erase anything. It writes a tombstone — a new record that, for now, only adds bytes."

### 9. Recap

- **fig:** none.
- **On screen:** WAL → memtable → immutable memtable → flushed file → newest-first point read → merged range read → Bloom filter → block index → tombstone.
- **Moves:** `Draw` each piece folding into the next, in order.
- **Final frame:** the full chain, start to finish.
- **Caption point:** every piece follows from the same one decision: never update a file in place, only ever add a new one.

### 10. Prove it (predict)

- **fig:** none (predict card).
- **On screen:** "A key has three shadowed copies: a tombstone in the memtable, a stale value in one file, and an older stale value in another file. Why doesn't the disk shrink to just the tombstone right now?"
- **Options:** (a) "It does — the delete removes the other copies as it's written" (tempting: sounds like what "delete" should mean); (b) "Nothing removes them yet — only a later merge of those files discards the shadowed copies and the tombstone together" (correct).
- **Moves:** `lock-on` the question, then reveal the answer against the measured tombstone file from step 8.
- **Final frame:** the correct answer, naming compaction as the mechanism that hasn't run yet.
- **Caption point:** a flush and a read both work around a tombstone's shadowed copies; only compaction, the next topic's own mechanism, actually merges files and throws the superseded copies away.

## Engagement arc

- **Hook (step 1):** the previous topic's own handoff, posed as an open question — what does a structure built to never update in place actually do instead?
- **Early prediction (step 3, within the first four):** which value answers a read when the newest write hasn't been flushed yet — the tempting wrong answer is "check both and merge", the real answer is "the memtable alone, nothing else touched".
- **Surprising number:** step 6 — 494 of 500 lookups for keys that flatly don't exist are rejected by a single bit check, with only 6 needing an actual (wasted, but still correct) read.
- **Second prediction (step 10, Prove it):** why the disk doesn't shrink the instant a tombstone is written — the tempting wrong answer is "the delete removes the shadowed copies immediately".
- **Three takeaways:** steps 2, 4, 8 (6 and 7's points are carried by the chart and recap; 2, 4 and 8 are the three chosen as reel takeaway rows).
- **Recap (step 9):** the whole write-then-read chain, one decision (never update in place) seen at every step.

## Narrator's line of thought

- **Step 1:** Open on the handoff itself — this is the question the whole topic answers, not a restatement of the picture.
- **Step 2:** Don't just name "memtable" and "flush" — say why the flushed file can never be edited again, and that this immutability is the one rule everything else in the topic follows from.
- **Step 3:** Ask the predict question the way a trick question is asked — "check both and merge" sounds careful and correct; it's the range-read answer, not the point-read answer, and that's exactly the confusion worth setting up.
- **Step 4:** Land on the counters themselves — "memtable hits: 1, file hits: 0" is the proof, not an assertion. The file was never opened, not just "not needed."
- **Step 5:** Make the contrast with step 4 explicit — a point read gets to stop early because it only needs one answer; a range read can't, because it needs every key in the range, and some of them only exist in the file.
- **Step 6:** Land hard on "zero wrong answers" before explaining the mechanism — a false positive from a Bloom filter is never a wrong result, only wasted work, and that distinction is the one beginners get backwards.
- **Step 7:** Keep the distinction crisp: the filter answers "look at all, or not" and the index answers "where" — conflating the two is the most common confusion about SST internals.
- **Step 8:** Resist explaining the growth before showing it — "5187 to 7926, from a delete" should land as genuinely counterintuitive before the tombstone mechanism resolves it.
- **Step 9:** Pull the thread taut: one rule (never update in place), five consequences.
- **Step 10:** Treat "the delete removes it" with real weight — it's the everyday, B-tree-trained intuition, and naming exactly why it's wrong here is the handoff to compaction.

## Post-notes plan (headings match the sibling set)

- **Outcomes:** restate the four learning outcomes plainly.
- **Lab:** none of this topic's own — note that it feeds the §5.1 chapter lab's Postgres-vs-RocksDB comparison, completed in the next topic, and name which of this topic's own measurements (flush lifecycle, Bloom filter rejection rate, tombstone growth) that comparison will reuse.
- **Production failures this topic warns about:** tombstone build-up as a real operational cost (disk usage climbing from deletes, not shrinking, until compaction catches up) and a point read's cost depending on how many structures it must check before the first match — both named here as what the next topic's compaction strategies actually trade off against.
- **Frontier:** partitioned and block-based (legacy) Bloom filter variants, Ribbon filters as a newer space/CPU trade-off, and the exact false-positive-rate math — named from the RocksDB Bloom Filter source but not taught here, since one measured full-filter rejection rate is enough for this topic's outcomes.
- **Where this goes next:** the handoff, verbatim.

## Examples to execute

`examples.py`, five real experiments against a real RocksDB instance (`rocksdict`) in this sandbox, all asserted, stable across repeated runs:

1. `memtable_flush_lifecycle`: 0 SST files before any flush; exactly 1 file (level 0, 1 entry) right after flushing a single write.
2. `point_read_checks_newest_first`: key `k1` flushed as `"A"`, then overwritten to `"B"` in the active memtable without flushing; reading it returns `"B"` with 1 memtable hit and 0 L0 hits.
3. `range_read_merges_sorted_runs`: a flushed file holding `k1..k5 = old`, then `k3` overwritten to `new` and `k6 = new` added in the memtable; a full scan returns all six keys merged in sorted order, `k3` at its newest value.
4. `tombstones_are_not_free`: 500 keys flushed to one 5187-byte file; deleting 250 of them and flushing again produces a second, separate 7926-byte total (the original file untouched), the new file holding exactly 250 entries, all 250 tombstones.
5. `bloom_filter_rejects_absent_keys`: 500 lookups for keys that don't exist, chosen to fall lexically inside the file's own key range; 494 rejected by the Bloom filter, 6 false positives, 0 true positives.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 7's handoff verbatim): "MVCC is one family's answer to concurrent writes, and vacuum is the bill it pays later. This topic is the other family entirely — a structure built from the start around never updating in place: the LSM tree, its own write path through a memtable and its own read path through Bloom filters and sorted runs."
- **Handoff** (to topic 9, verbatim): "An LSM tree accumulates sorted runs forever unless something merges them back down. That something is compaction, and how it merges them decides the trade-off the whole structure is built around."

## Concept ledger

- **Introduces:** `lsm-write-read-path`.
- **Uses:** `wal-lsn-fsync` (the direct contrast: a different engine's own write-ahead log and flush path).
- **Declared:** a skip list's own structure, from the Data Structures & Algorithms track, assumed rather than re-taught (`coverage.json → expert`, placement named).

## Claims list

1. The three on-disk constructs of RocksDB are the memtable, the SST file and the logfile (WAL); new writes go to the memtable and optionally the WAL, and a full memtable is flushed to a new SST file. — RocksDB Overview wiki.
2. RocksDB's default memtable implementation is a skiplist, a sorted set. — RocksDB Overview wiki.
3. When a memtable is full it becomes an immutable memtable and a background thread flushes it, while new writes accumulate in a freshly allocated memtable (memtable pipelining). — RocksDB Overview wiki.
4. A memtable flush performs an inline compaction: duplicate updates to the same key are collapsed, and a put already hidden by a later delete is not written to the new file at all. — RocksDB Overview wiki.
5. A Log-structured merge-tree buffers writes in an in-memory component and flushes it, once full, to disk as an immutable sorted component, sequentially, optionally behind a write-ahead log for crash durability. — Log-structured merge-tree (Wikipedia).
6. A point lookup searches the in-memory component first, then disk components from newest to oldest, stopping at the first match. — Log-structured merge-tree (Wikipedia).
7. A Bloom filter is checked before each disk component is opened for a point lookup; if the filter says the key is absent, that component is skipped entirely. — Log-structured merge-tree (Wikipedia); RocksDB Bloom Filter wiki.
8. A range query must search every relevant component (in-memory and on disk) and merge the results via a priority queue, so only the newest version of each key is kept. — Log-structured merge-tree (Wikipedia).
9. Updates are treated as new writes; deletes are marked with a tombstone entry rather than removed in place, and tombstones are discarded only later, during merging (compaction). — Log-structured merge-tree (Wikipedia); RocksDB Overview wiki.
10. A Bloom filter is a per-file bit array; the same hash functions are applied at write time (setting bits) and read time (probing them), and a key definitely does not exist in the file if any probed bit is 0. — RocksDB Bloom Filter wiki.
11. RocksDB's real statistics counters for a Bloom filter check are `rocksdb.bloom.filter.useful` (true negatives — correctly rejected), `rocksdb.bloom.filter.full.positive` (all positives, true and false) and `rocksdb.bloom.filter.full.true.positive` (actual hits). — RocksDB Bloom Filter wiki.
12. RocksDB's default SST format (BlockBasedTable) stores sorted key/value pairs in a sequence of data blocks, plus meta blocks (including the filter); a per-file index block is a binary-search structure used to find the one data block that might hold a given key. — RocksDB BlockBasedTable Format wiki.
13. In this sandbox: flushing a single write produces exactly one new SST file, at level 0, holding exactly one entry; before that flush, no SST file exists at all. — `examples.py`.
14. In this sandbox: a key overwritten in the active memtable after an earlier flush is answered by the memtable alone (1 memtable hit, 0 L0 hits), returning the newer value without the older file ever being touched. — `examples.py`.
15. In this sandbox: a full keyspace scan across one flushed file and an overlapping memtable returns every key exactly once, in sorted order, with the memtable's value winning for any key both hold. — `examples.py`.
16. In this sandbox: flushing 500 keys produces one 5187-byte file; deleting 250 of them and flushing again produces a second, 2739-byte file holding exactly 250 entries, all 250 tombstones, with the original file unchanged and total bytes on disk rising to 7926. — `examples.py`.
17. In this sandbox: with a 10-bits-per-key Bloom filter, 500 lookups for keys absent from but lexically inside an existing file's key range are rejected by the filter 494 times, with 6 false positives and 0 true positives. — `examples.py`.

## Changes from the chapter plan

None. The topic keeps `CHAPTER.md`'s scope, bridge, handoff and visual idea, with the original O'Neil et al. LSM-tree paper replaced as a source by the Wikipedia article on the structure (the paper's only free copies are unreachable: a broken TLS certificate chain on the UMass Boston mirror, a 404 on the Berkeley course mirror), per the research rule that an unfetchable source is replaced rather than cited from memory.

## Progress

- Research done: `SOURCES.md` (20 quotes verified word for word across 4 sources), `coverage.json → expert` (14 items).
- Content plan done: this file.
- Next: fact-check (section 5).
