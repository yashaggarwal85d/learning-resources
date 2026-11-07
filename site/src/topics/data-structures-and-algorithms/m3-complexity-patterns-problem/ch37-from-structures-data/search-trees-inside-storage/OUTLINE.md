# OUTLINE — Search trees inside storage engines

Chapter 37's sixth topic: the B+-tree and the LSM tree read as the index layer of a real
storage engine, from PostgreSQL's `nbtree/README` and RocksDB's internal key format and
partitioned-filter design. One shared keyed store (a sorted integer key set sized for a
B+-tree of height 3 and an LSM tree of four levels, per CHAPTER.md's running-example table).

## Storyboard (14 steps)

1. **Hook, predict.** A RocksDB lookup for a key that is not there should touch no data
   block. Yet one filter block can be 5 MB against a 4 KB data block — 1,280 times larger.
   Predict: what does the engine do with a filter bigger than the thing it protects, and what
   does that remind you of?
2. Two-column strip: the Chapter 5 B+-tree exactly as drawn there (key only) on the left, a
   storage engine's leaf entry (key, heap TID) on the right, the constraint named between them:
   "logical duplicates still have to sort somewhere."
3. The tiebreaker: PostgreSQL's requirement that all btree keys be unique is met by treating
   the heap tuple id as a tiebreaker attribute, duplicates sorted in heap-TID order (quoted).
4. **Measured:** five order rows for one customer, inserted as five duplicate-key entries;
   their TIDs make every entry unique even though the key repeats.
5. **Predict.** A leaf page fills up with duplicates of one key and must split. Does the
   split put half the duplicates on each side, or something else?
6. The ascending-TID split: PostgreSQL's fallback assumes duplicates arrive in ascending
   heap-TID order and leaves the left page mostly full, the right mostly empty (quoted);
   measured on the shop's five rows: left page 4 of 4 slots full, right page 1 of 4.
7. Two-column strip, second structure: the Chapter 5 LSM tree on the left, RocksDB's stored
   key on the right — a sequence number appended to the user key.
8. The comparator: user key ascending, then sequence number **descending** (quoted); drawn as
   a descending stack under one user key, the newest write on top — the same comparator
   topic 119's merging iterator uses.
9. **Measured:** one key written three times and deleted once (sequence 10, 20, 30, tombstone
   at 40); a snapshot read at sequence 25 sees "shipped" (the newest write at or before the
   snapshot), a live read sees the tombstone.
10. Why this matters: a snapshot read becomes one seek to the first entry at or below the
    snapshot sequence, not a scan of every version, because the order itself encodes recency.
11. The filter problem, in full: a 5 MB filter block is "occupying the space that could
    otherwise be used to cache 1000s of data blocks" (quoted) — it competes with the data it
    is supposed to protect.
12. The fix: the filter is partitioned into small blocks under a top-level index, 0.1–1% of
    the filter's own size, loaded on demand (quoted) — a B-tree applied to a Bloom filter.
13. **Predict, then measured:** four point-lookup cases, block reads counted — a hit (2:
    index + data), a miss with no filter (2: index + a wasted data read), a miss with a whole
    filter already cached (1: no data read at all), a miss with a partitioned filter whose one
    needed partition is *not* cached (2) — exactly as costly as having no filter.
14. Recap and handoff: three adaptations, one shape — a one-machine search tree had an
    assumption (unique keys, one version, a filter that fits memory) that a storage engine
    cannot keep, and added exactly the structure needed to keep it true anyway. Every one of
    them assumed the data lives on one machine; handoff to placement across several.

## Outcomes (from CHAPTER.md, unchanged)

- Say what a PostgreSQL index entry stores and why the heap tuple identifier is the
  tiebreaker, and what an index-only lookup therefore can and cannot skip.
- Explain the LSM internal key (user key, decreasing sequence) and show how it makes
  snapshot reads and shadowing work with an ordinary sorted structure.
- Explain why a filter is partitioned and indexed like a tree once it is larger than a data
  block, and what the top-level index costs.

## Takeaways (>= 3, <= 20 words each)

- A B+-tree's keys are never really unique without the heap TID riding along as part of them.
- Newest-version-first order turns a snapshot read into one seek, never a scan of every version.
- A filter can outgrow the block it protects, so the filter needs its own index too.

## Predict steps and answers

1. **Step 1 (hook).** What does the engine do with a filter bigger than the thing it
   protects? *Answer:* it pages the filter itself — a top-level index over small filter
   partitions, loaded on demand, the same idea as a B-tree over data. *Tempting wrong
   answer:* "it just accepts the cost, since filters still beat reading every data block" —
   true on average, but ignores that an uncached partition can cost exactly what no filter
   costs at all (revealed at step 13).
2. **Step 5.** Does a lopsided duplicate-key leaf split put half the duplicates on each
   side? *Answer:* no — PostgreSQL's fallback assumes ascending-TID insertion and leaves the
   left page mostly full, the right mostly empty, so later inserts of the same key keep
   landing in the already-near-full left neighbor's successor, not splitting evenly forever.
   *Tempting wrong answer:* "an even split," the textbook default for a non-duplicate-heavy
   page, which does not fit a page of logical duplicates.
3. **Step 13.** Which of the four lookup cases costs as much as having no filter at all?
   *Answer:* the partitioned-filter miss whose one needed partition is not cached: one extra
   read to load it, same total as skipping the filter entirely. *Tempting wrong answer:* "any
   filter beats no filter," true for a whole cached filter but not for an uncached partition.

## Concept ledger

Introduces: `heap-tid-tiebreaker`, `internal-key-sequence-order`, `partitioned-index-filter`,
`index-layer-modifications`.
Uses (confirmed live in the registry at build time, 2026-11-07): `b-tree`, `b-plus-tree`,
`node-split-merge`, `sibling-link-range-scan`, `slotted-page-layout`, `bulk-loading`,
`key-deduplication` (Chapter 5's B+-tree and LSM topics), `write-ahead-log`, `memtable`,
`sstable`, `bloom-filter-pruning`, `fence-pointer`, `tombstone`, `compaction-policy`,
`per-level-filter-sizing` (Chapter 5's LSM topics), `bloom-filter`, `bloom-false-positive-rate`
(Chapter 12's Bloom-filter topic). `merging-iterator`, `compaction-input-iterator` are named
as **declared**, not `uses`: topic 119 ("Heaps inside compaction, shuffle and top-N") is not
yet live in the registry at build time (grepped directly, confirmed absent) — the sibling
thread owning chapter 37 topics 118-121 has not shipped it yet. Named once, in step 8, as "the
same comparator a later topic's merging iterator uses," without depending on its registry id.
Declared: none new beyond the topic's own four.

## Bridge and handoff

Bridge (CHAPTER.md's plan, word for word — topic 121 "Union–find inside entity resolution" is
also not yet live; its handoff is taken verbatim from CHAPTER.md's own topic-121 entry, which
the chapter plan instructs is usable even before 121 ships, since CHAPTER.md is itself the
source of truth for the bridge text): "Union–find groups records that were never in any
particular order. The next structures are about keeping order itself, on disk, at the scale
of a database: the index layer of a storage engine, where the search trees of the early
chapters are the same B+-tree and LSM tree, with their keys, pages and filters changed to suit
what a database must remember. Search trees inside storage engines, next."

Handoff (CHAPTER.md, unchanged): "A storage engine's index is a search tree that someone
adapted: a tiebreaker added, a sequence number added, a filter cut into pages. Every one of
those adaptations assumed the data lives on one machine. Once it spans several, a different
question comes first: which machine holds this key at all, and how little has to move when a
machine joins. Consistent hashing inside sharded stores, next."

## Post-notes headings (layers 5-8)

- **Internals:** the slotted-page mechanics that hold a (key, TID) entry; why PostgreSQL
  calls TID-sorted duplicates "logical duplicates" rather than literal exact copies; the
  exact RocksDB `InternalKeyComparator` byte layout (user key, then an 8-byte packed
  sequence+type field, the type bit letting a tombstone sort correctly against a put at the
  same sequence).
- **Lab:** the four-case block-read count from `examples.py`, with the reader invited to
  change the budget/cache assumptions and recompute.
- **Production failures:** a leaf split pathology when duplicate inserts are *not* ascending
  by TID (e.g. after a bulk reload with reordered TIDs) — PostgreSQL's own README caveats this
  is the common case, not the only one; an LSM snapshot held open too long pins old versions
  that compaction cannot yet drop, a real operational cost named once.
- **Frontier:** RocksDB's current default filter construction (Bloom vs. Ribbon,
  `format_version`-gated) — named as "to verify at research time" per CHAPTER.md, and recorded
  here as **not resolved**: the RocksDB Bloom Filter wiki page was read in full and gives no
  single current default without reading the C++ source's `BlockBasedTableOptions` default
  directly, which this topic's scope does not require; left as an open question for a reader
  who wants the exact current default.
- **Where this goes next:** Data Engineering's live "B-tree indexes in production", "LSM
  trees: write and read paths" and "LSM compaction and the RUM trade-off"; Rust Systems
  Engineering's from-scratch B-tree and LSM chapters (21-22, another track).

## Examples to execute

`examples.py`: builds a height-3 B+-tree sizing check (180 keys, fanout 8); a duplicate-key
leaf split (5 entries, capacity 4, assert left=4/right=1); an LSM internal-key sort and
snapshot read (3 writes + a tombstone, assert snapshot@25 == "shipped", live == tombstone);
four level sizes by a constant growth factor (4, 40, 400, 4000 MB); the filter-to-data-block
ratio (1280x) and top-level index size (0.05 MB at 1% of a 5 MB filter); and the four-case
block-read counter (hit=2, miss_no_filter=2, miss_whole_filter_cached=1,
miss_partitioned_filter_not_cached=2). Every number on screen is asserted here. Run:
`python3 -I examples.py` — all assertions pass.

## Claims list (claim -> source)

1. A B+-tree's unique-key requirement is met by treating heap TID as a tiebreaker, duplicates
   sorted in heap TID order -> PostgreSQL `nbtree/README`.
2. A leaf full of duplicates splits assuming ascending-TID insertion, leaving the left page
   mostly full and the right mostly empty -> PostgreSQL `nbtree/README`.
3. RocksDB's internal key orders by user key ascending, then sequence number descending ->
   RocksDB `db/dbformat.h`.
4. One SST's index/filter block is commonly 0.5-5 MB against a typical 4-32 KB data block ->
   RocksDB wiki, "Partitioned Index/Filters".
5. A 5 MB filter occupies space that could cache thousands of 4 KB data blocks -> RocksDB
   wiki, "Partitioned Index/Filters".
6. A partitioned filter adds a top-level index, 0.1-1% of the filter's own size, loaded on
   demand -> RocksDB wiki, "Partitioned Index/Filters".
7. The four block-read counts (hit, miss without filter, miss with a cached whole filter,
   miss with an uncached filter partition) -> `examples.py`, this topic's own model, built
   directly from claims 4-6's stated mechanics, not from any source's own measured numbers
   (no source states these four counts; the model is this topic's synthesis, flagged as such
   in FACT-CHECK.md).

## Changes from the chapter plan

1. **Topics 119 and 121 are not yet live** in the registry at build time (confirmed by
   grepping `registry.ts` directly, 2026-11-07): the sibling thread building chapters 34/36/37
   shipped only topic 117 so far. Per CHAPTER.md's own instruction for such cases (section
   10's note 2, "Chapter 36 topic 116's actual handoff, word for word, if that plan exists by
   then"), this topic uses CHAPTER.md's own verbatim bridge and handoff text rather than a
   registry lookup, and declares (does not `use`) `merging-iterator` and
   `compaction-input-iterator` from topic 119, naming the connection in prose only (step 8).
   `declared` on topic 122's own CHAPTER.md entry already listed "none new beyond its own" for
   these two ids, since they were meant to already be `uses` by the time 122 builds; recorded
   here as a genuine gap, not silently patched.
2. **The exact shop sizes are the builder's own choice**, as CHAPTER.md specifies for the
   whole chapter's running example: 180 keys at fanout 8 for a height-3 B+-tree, four LSM
   levels at a constant tenfold per-level growth from a 4 MB base, and a 5 MB filter against a
   4 KB data block (the wiki page's own stated typical sizes, reused directly rather than
   invented).
3. **The current RocksDB default filter type is left unresolved**, as CHAPTER.md's own "not
   read yet" flagged it; the Bloom Filter wiki page was read in full at research time and does
   not itself state a single current default clearly enough to quote, so no default is
   asserted (see post-notes "Frontier").
4. **The four-case block-read model (claim 7 above) is this topic's own synthesis**, not a
   number read from any source; FACT-CHECK.md records this explicitly and the red-team pass
   checked it against the wiki page's own stated costs ("one extra I/O when the top-level
   index is not cached") before accepting it.
5. **`npm run test:editor` fails in this cloud sandbox on this topic's build, as it does on a
   clean, unmodified `main`** (a pre-existing environment issue, confirmed by other threads'
   independent runs, not a regression this topic introduced): "a save did not open a new
   GitHub issue." `node tests/reels.mjs` itself (the actual phone/desktop smoke test) passed:
   "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes."
