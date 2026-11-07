# FACT-CHECK — Search trees inside storage engines

| # | Claim | Checked against |
|---|---|---|
| 1 | A B+-tree's unique-key requirement is met by treating heap TID as a tiebreaker; logical duplicates sort in heap TID order | PostgreSQL `nbtree/README`, quoted word for word |
| 2 | A leaf full of duplicates splits assuming ascending-TID insertion, leaving the left page mostly full and the right mostly empty | PostgreSQL `nbtree/README`, quoted word for word; reproduced in `examples.py` (left=4/4, right=1/4) |
| 3 | Five duplicate-key entries with distinct TIDs are all unique and sort correctly | `examples.py`, `len(set(leaf.entries)) == 5`, asserted |
| 4 | RocksDB's internal key orders by user key ascending, then sequence number descending | RocksDB `db/dbformat.h`, quoted word for word; reproduced and simulated in `examples.py` |
| 5 | A snapshot read at sequence 25 over writes at 10/20/30 plus a tombstone at 40 returns the value at sequence 20 ("shipped") | `examples.py`, `snapshot_value == "shipped"`, computed from the simulated comparator order, not asserted directly |
| 6 | A live (unconstrained) read sees the tombstone ahead of every earlier version | `examples.py`, `live_value is None`, computed from the same order |
| 7 | One SST's index/filter block is commonly 0.5-5 MB against a typical 4-32 KB data block | RocksDB wiki, "Partitioned Index/Filters", quoted word for word |
| 8 | A 5 MB filter occupies space that could cache thousands of 4 KB data blocks | RocksDB wiki, "Partitioned Index/Filters", quoted word for word; `examples.py` computes the ratio directly (1,280x), confirming "thousands" is the right order of magnitude |
| 9 | A partitioned filter adds a top-level index, 0.1-1% of the filter's own size, loaded on demand | RocksDB wiki, "Partitioned Index/Filters", quoted word for word; `examples.py` computes 0.05 MB at the stated 1% upper bound on a 5 MB filter |
| 10 | The four block-read counts (hit=2, miss-no-filter=2, miss-whole-filter-cached=1, miss-partitioned-filter-uncached=2) | `examples.py`, this topic's own model built directly from claims 7-9's stated mechanics — **not a number stated by any source**, flagged below |
| 11 | RocksDB's current default filter construction (Bloom vs. Ribbon) | **left unresolved** — see red-team pass |
| 12 | Topics 119 ("Heaps inside compaction, shuffle and top-N") and 121 ("Union-find inside entity resolution") are not yet live | `registry.ts`, grepped directly, confirmed absent at build time (2026-11-07) |

## Red-team pass

- **Is claim 10's block-read model actually derived from the sources, or invented?** It is a
  synthesis, not a quoted number — no source states these four counts together. Re-derived
  here from first principles against claims 7-9: a hit always needs the data block (no filter
  saves anything on a true positive); a miss with no filter wastes exactly one data read (the
  only way to know a key is absent is to look); a miss with a whole filter already resident in
  the cache costs nothing extra because the filter check is a pure in-memory operation; a miss
  whose needed partition is *not* cached costs one read to load that partition, which the wiki
  page's own words ("one extra I/O when the top-level index is not cached") describe for the
  top-level index specifically — generalized here, explicitly as a generalization, to any
  uncached partition (leaf or top-level), since the mechanism (load one more small block, then
  answer in memory) is the same either way. The model is conservative: a real system may have
  additional costs (e.g., the top-level index itself not cached, compounding to two extra
  reads) that this topic's four-case model deliberately simplifies to one variable at a time,
  stated as a simplification in OUTLINE.md and post-notes.md, not hidden.
- **Does the model ever claim a partitioned, cached filter beats a whole, cached filter?** No —
  both cost 1 (filter check free, no data read); the topic's point is only about the *uncached*
  case, where partitioning trades "always pay 5 MB to load" for "sometimes pay one small
  partition's worth," at the cost of occasionally paying anyway when that partition itself
  isn't resident.
- **Is the shop's exact sizing (180 keys, fanout 8, 5 duplicate rows, a 4 MB base LSM level)
  taken from any source?** No — CHAPTER.md's running-example table leaves exact sizes to the
  builder ("sized to give a B+-tree height 3 and an LSM tree four levels, as in Chapter 5"); the
  values are chosen to hit those two shapes exactly, not read from any system.
- **Does the topic claim a specific current RocksDB default filter type (Bloom vs. Ribbon,
  `format_version`)?** No. The RocksDB Bloom Filter wiki page was fetched and read in full; it
  describes both filter families and their trade-offs but does not state, clearly enough to
  quote without risk of quoting a stale sentence, which one is the current default for a newly
  created table at the current `format_version`. CHAPTER.md itself flagged this as "to read at
  research time," and the honest result of that research is: **unresolved**, recorded as an
  open question in post-notes.md "Frontier" rather than guessed.
- **Is the "newest version first" claim (step 8/9) actually what the snapshot-read example
  shows, or could the comparator order and the read-time filtering be two different things
  conflated?** Checked separately: `sort_internal_keys` only orders entries (claim 4);
  `snapshot_read` is a distinct function that walks that order and applies the sequence-number
  bound (claims 5-6). The two are kept as separate, separately-asserted functions in
  `examples.py` specifically so the fact-check pass could verify the ordering claim and the
  snapshot-semantics claim independently, rather than one assertion standing in for both.
- **Does `examples.py`'s B+-tree height-3 claim depend on an unrealistic fanout?** Fanout 8 is
  low for a real B+-tree page (real pages hold far more entries), but CHAPTER.md asks only for
  "a B+-tree height 3... as in Chapter 5," i.e., a shape, not a page-size claim; the topic does
  not claim 8 is a realistic production fanout, and post-notes.md's "Internals" section notes
  real fanouts are page-size-bound and far larger.

## Corrections applied

None to the quoted claims (1, 2, 4, 7, 8, 9 passed verbatim against the fetched source text via
`node scripts/sources.mjs check`). Claim 10 was reframed from an implicit "the source says this"
to an explicit "this topic derives this" in both OUTLINE.md and post-notes.md, to avoid
over-attributing a synthesized model to a source that never stated it. Claim 11 was downgraded
from a planned claim to an explicitly unresolved question, per CHAPTER.md's own "not read yet"
flag for this item.
