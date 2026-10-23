# Outline: LSM-tree write and read paths (`dsa.lsm-tree-write-read`)

## Learning outcomes

1. Trace a write through the WAL, the memtable, and a flush to an immutable sorted run.
2. Trace a read that must check several runs newest-first, and show how a Bloom filter and a fence
   pointer each let it skip work.
3. Explain why a delete is recorded as a tombstone rather than an in-place removal, and what that
   implies until compaction runs.

## Engagement arc

- **Hook (step 1):** everything in topics 26-27 still updates a page in place, paying its I/O cost
  immediately on every write. This structure refuses that trade entirely: never update in place,
  write sequentially, and pay the cost back later.
- **Predict 1 (step 4, within the first four):** a full memtable has to go somewhere — what
  actually happens to it?
- **Predict 2 (step 6):** the same key lives in the memtable and two old runs at once — which
  value does a read actually return?
- **Surprising number:** a single point read with no filters at all must check every run on disk
  from newest to oldest; a Bloom filter at a measured bits-per-key setting turns almost all of
  those checks into one in-memory lookup instead of a disk read.
- **Takeaways (≥3):** step 5 (a flushed run is never modified again — the only two things that can
  happen to it are being read or being compacted away); step 8 (a Bloom filter only ever answers
  "definitely not here" or "maybe here," and a fence pointer only narrows where to look, so neither
  can ever cause a wrong answer, only wasted work); step 9 (a tombstone is a write, not an
  erasure — it has to survive every read until a compaction physically drops both it and what it
  shadows).
- **Recap:** step 10, "Prove it" — the Bloom filter's measured false-positive rate against its own
  bits-per-key setting, the run-count a read has to check with and without filters and fence
  pointers on an identical key set, and a tombstone correctly shadowing an older value with no
  compaction run at all.

## Reel steps and storyboard

1. **Opening.** Every technique so far still updates a page in place. This structure refuses that
   trade: never update in place, write sequentially, pay the cost back later. Visual: topic 27's
   page redrawn, then struck through, replaced by a single append-only line growing rightward.
   Duration ~4s.
2. **WAL.** Every write is appended to a write-ahead log before anything else happens, so a crash
   before the data reaches its real home can still recover it by replaying the log. Visual: a
   thin append-only log file, writes landing at its growing end. Duration ~4s.
3. **Memtable.** The write also lands in an in-memory sorted structure, the memtable, which serves
   both new writes and reads directly — the memtable is consulted on every read so nothing logged
   is ever invisible to a query. Visual: a small in-memory sorted structure sitting beside the WAL.
   Duration ~4s.
4. **FlushPredict.** Predict: the memtable fills up. What actually happens to it? Options: it's
   merged into an existing run on disk; it's written out whole as a brand-new, never-modified
   sorted run (correct); its oldest half is discarded to make room; it's converted directly into
   an index. Duration ~2s.
5. **FlushReveal.** The full memtable is flushed out as one new, immutable sorted run (an
   SSTable); a fresh, empty memtable takes over new writes immediately, and the WAL behind the
   flushed memtable can be discarded, since its data now lives safely on disk. Takeaway: "A
   flushed run is never modified again — reading it or compacting it away are the only two things
   that can ever happen to it next." Duration ~4.3s.
6. **ReadPredict.** Predict: the same key has a value in the memtable and in two older runs on
   disk. Which value does a read actually return? Options: the oldest one, because it was written
   first; the newest one (correct); some merge of all three; whichever is fastest to find.
   Duration ~2s.
7. **ReadReveal.** A read checks the memtable first, then every on-disk run from newest to
   oldest, stopping at the first match — a later write or delete always shadows an earlier one for
   the same key, so the first one found newest-first is always the right answer. Duration ~4s.
8. **SkipWork.** Checking every run for every read doesn't scale. A Bloom filter per run answers
   "definitely not here" or "maybe here" from memory, skipping the run's disk read entirely on a
   definite no; a fence pointer (a stored key range or boundary-key index per run) narrows a maybe
   down to the one block worth reading. Takeaway: "A Bloom filter and a fence pointer only ever
   skip or narrow work — neither one can cause a wrong answer, only waste some." Duration ~4.5s.
9. **Tombstone.** A delete can't remove anything in place, because the run holding the old value
   is immutable. Instead it's recorded as its own kind of entry, a tombstone, which has to outrank
   and hide that older value on every read until a compaction physically drops both of them
   together. Takeaway: "A tombstone is a write, not an erasure — it has to survive every read on
   its own until compaction removes it and what it shadows together." Duration ~4.2s.
10. **ProveIt.** Measured, not assumed: the Bloom filter's observed false-positive rate at a
    chosen bits-per-key setting against the formula's prediction, the number of runs a point read
    has to touch with and without filters and fence pointers on an identical key set, and a
    tombstone correctly shadowing an older value with zero compactions run. Duration ~4s.

## Narrator's line of thought (beyond the description)

- Step 1: topics 26-27 spent an entire topic making an in-place page's bytes count for more; this
  structure sidesteps the whole problem by never updating a page in place at all.
- Step 2: a WAL exists for exactly one failure mode — losing power or crashing between a write
  landing in memory and it reaching durable storage — and recovery is just replaying it in order.
- Step 3: the memtable is not a staging area a read can ignore; skipping it would silently return
  stale data for anything written since the last flush.
- Step 4/6: predict from the mechanism already shown (what a flush actually produces; what
  "newest wins" has to mean once the same key can exist in more than one place), not from
  guessing.
- Step 5: "never modified again" is the single property every later mechanic in this topic (and
  topic 29's compaction) depends on — a run's immutability is what makes a Bloom filter or a fence
  pointer built for it stay valid for its whole life.
- Step 7: newest-first isn't an optimization, it's correctness — the structure has no other way to
  know which of several copies of a key is the real current value.
- Step 8: a filter and a fence pointer solve different questions that compound — one decides
  whether to open a run at all, the other decides where inside it to look once it's open.
- Step 9: a tombstone has to be at least as findable as the value it shadows, which is why it's
  stored and indexed exactly like a normal write, not as metadata off to the side.
- Step 10: state exactly what was measured vs. assumed, the same discipline every topic in this
  chapter has followed.

## Post-notes headings

- **Internals:** the original 1996 LSM-tree paper (O'Neil, Cheng, Gawlick, O'Neil) that this
  structure is named after, named only in passing per PostgreSQL/production-doc conventions
  already used in topics 26-27; the sequence-number mechanism (RocksDB's own term) that makes
  "newest wins" well-defined even across a crash and restart.
- **Lab:** this topic's slice of the chapter's shared Lab bullet — build a small LSM structure
  (WAL + memtable + flush) and measure a point read's run-count with and without a Bloom filter
  and a fence pointer, on the identical key set (topic 29's own Lab slice covers the compaction
  side).
- **Production:** LevelDB's and RocksDB's own log file / memtable / SSTable mechanics, and
  RocksDB's own embedded-per-SST-file Bloom filter with its published bits-per-key table.
- **Frontier:** brief mention of why RocksDB ships multiple Bloom filter implementations (classic
  vs. Ribbon) trading construction cost against memory, named only in passing.
- **Where this goes next:** LSM compaction and amplification (topic 29) — what it costs to clean
  up the runs this topic lets accumulate, and why every compaction policy trades the same three
  costs against each other.

## Examples to execute and assert

- Build a minimal LSM structure: a WAL (append-only record log), a memtable (sorted in-memory
  structure), and flush-to-SSTable; assert a crash-and-replay of the WAL reconstructs an
  unflushed memtable's exact contents.
- Insert a key, flush it, then overwrite the same key in a new memtable; assert a read returns the
  newest value by checking the memtable before any on-disk run, and each run newest-to-oldest.
- Build a Bloom filter at a chosen bits-per-key setting over a real key set; measure its observed
  false-positive rate against the published bits-per-key-to-false-positive-rate relationship, and
  assert no false negative ever occurs for a key actually in the set.
- Simulate a point read against a key set spread across several runs, with and without a Bloom
  filter and a fence pointer (a stored min/max key range per run); assert the filtered/fenced read
  touches meaningfully fewer runs' actual data than the unfiltered read on the identical input.
- Delete a key by inserting a tombstone into the current memtable while an older run still holds
  its value; assert a read returns "not found" with zero compactions run, by finding the tombstone
  before the older value.

## Bridge and handoff

- **Bridge:** word for word, topic 27's own final handoff (see `CHAPTER.md`): "Every technique so
  far still updates a page in place, paying its I/O cost immediately on every write. The next
  structure refuses that trade entirely: never update in place, write sequentially, and pay the
  cost back later, on its own schedule. LSM-trees, next."
- **Handoff:** word for word, this topic's entry in `CHAPTER.md`: "Flushing a full memtable to its
  own run solves the write problem, but only by deferring it: every run flushed is one more run
  every read has to check, and one more copy of every key compaction will eventually have to
  rewrite. Compaction and amplification, next: what it costs to clean this up, and why no policy
  makes that cost disappear."

## Concept ledger

- **Introduces:** `write-ahead-log`, `memtable`, `sstable`, `bloom-filter-pruning`, `fence-pointer`,
  `tombstone`.
- **Uses:** `b-tree`, `node-split-merge` (topic 26, as the in-place alternative this structure
  explicitly avoids).
- **Declared:** none new beyond its own.

## Claims list (claim → source)

1. The LSM write path: a log of PUT/DELETE operations, applied to an in-memory MemTable, flushed
   sequentially to an on-disk SSTable — CMU 15-445 Lecture 4.
2. A delete is its own kind of log entry (a marker), not an in-place removal — CMU 15-445 Lecture 4
   and LevelDB Implementation Notes (deletion markers).
3. The distinction between an index (locates a record) and a filter (only answers set membership)
   — CMU 15-445 Lecture 8, mapped onto the fence-pointer/Bloom-filter split this topic teaches.
4. A real production engine's WAL + memtable + flush-to-sorted-table mechanics, including the
   size threshold that triggers a flush — LevelDB Implementation Notes.
5. The memtable is consulted on every read so reads reflect every logged update not yet flushed —
   LevelDB Implementation Notes.
6. The literal on-disk form of a fence pointer (an index block, one boundary-key entry per data
   block) and a Bloom filter (a filter block) in a real SSTable file format — LevelDB File Format.
7. A second production engine's own WAL definition and its recovery role, its "immutable memtable"
   terminology, its SST file and index-block naming, and its sequence-number mechanism for
   resolving which of several copies of a key is newest — RocksDB Terminology wiki.
8. The exact crash-recovery mechanism a WAL provides (reconstructing the memtable from the log),
   and why a WAL becomes obsolete once its memtable is safely flushed — RocksDB WAL File Format
   wiki.
9. A real, current bits-per-key-to-false-positive-rate table for a Bloom filter, and confirmation
   that the filter is embedded per-SST-file — RocksDB Bloom Filter wiki.

## Claims not made

- Doesn't cover compaction (leveled, tiered, or otherwise) or the read/write/space amplification
  trade-off — both belong entirely to topic 29, which this topic's own handoff names explicitly.
- Doesn't claim this topic's own illustrative bits-per-key setting or run-count numbers generalize
  beyond the specific key set and sizes `examples.py` states.
- Doesn't re-derive the original 1996 LSM-tree paper's own algorithm; names it as the structure's
  origin in post-notes only, per the same convention topics 26-27 used for Bayer and Unterauer.
- Doesn't cover RocksDB's Ribbon filter or other non-Bloom filter implementations as their own
  mechanism; named only in passing in the frontier section.
