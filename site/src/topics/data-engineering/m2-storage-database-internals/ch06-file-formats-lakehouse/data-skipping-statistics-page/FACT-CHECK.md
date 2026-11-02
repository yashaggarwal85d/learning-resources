# Fact-check — de.data-skipping-statistics-page

## Claims table

| # | Claim | Source |
|---|---|---|
| 1 | Parquet's `Statistics` struct exists per row group and per page, and all of its fields are optional. | parquet.thrift, Statistics struct doc comment |
| 2 | A writer should always write `null_count` even when zero; a reader must not assume `null_count == 0` when the field is absent. | parquet.thrift, null_count doc comment |
| 3 | A writer may store a more compact, truncated bound instead of the real min/max (e.g. "B"/"C" for "Blart Versenwald III"), as long as the truncated value is still a valid value of the column's logical type. | parquet.thrift, min_value/max_value doc comment |
| 4 | The page index is optional per-ColumnChunk metadata containing per-page statistics, usable for page skipping on both ordered and unordered columns. | PageIndex.md, problem statement |
| 5 | ColumnIndex lets a reader navigate to the pages that match a scan predicate, based on column values. | PageIndex.md, Technical Approach |
| 6 | For an ordered (sorted) column, a reader can binary-search `min_values`/`max_values` to find matching pages; for an unordered column, it must scan them sequentially. | PageIndex.md, "For ordered columns, this allows..." |
| 7 | High-cardinality columns with widely separated min/max get no benefit from statistics-based pushdown, and writers often skip dictionaries for them too, leaving no pushdown support at all. | BloomFilter.md, problem statement |
| 8 | A Bloom filter responds to membership queries with "definitely no" or "probably yes" and has no false negatives, only a configurable false-positive rate. | BloomFilter.md, Bloom filter definition |
| 9 | A split-block Bloom filter with 1024 blocks (262,144 bits) that has had 26,214 values inserted has a false-positive probability of around 1.26%. | BloomFilter.md, sizing example |
| 10 | The split-block Bloom filter's `block_insert`/`block_check`/`filter_insert`/`filter_check` algorithm — an 8-word 256-bit block, a fixed 8-constant salt, and block selection from a hash's top 32 bits — is defined exactly as this topic's own `SBBF` class implements it. | BloomFilter.md, Technical Approach pseudocode |

## Currency check

Fetched 2026-10-31 from `apache/parquet-format`'s `master` branch (`parquet.thrift`,
`PageIndex.md`, `BloomFilter.md`) — the canonical, actively maintained specification repository.
Row-group/page statistics, the page index, and the split-block Bloom filter design have all been
stable, foundational parts of the format for years (the page index and bloom filter additions
themselves are long-since-merged, non-experimental features). No currency risk.

## Red-team

1. **Is the SBBF implementation actually following the spec, or just producing a plausible-looking
   bloom filter?** Every structural constant (8 words per block, 256 bits per block, the 8-value
   salt array, the `>> 27` bit-selection, the `(h_top * z) >> 32` block-index formula) is copied
   directly from BloomFilter.md's own pseudocode, not reinvented; the empirical false-positive
   rate (1.25%) lands within 0.01 percentage points of the spec's own stated example (1.26% for
   the identical 1024-block, 26,214-insert configuration) — a strong independent check that the
   algorithm, not just the code, is correct.
2. **Is substituting SHA-256 for XXH64 a meaningful deviation?** Yes, and it's disclosed directly
   in `examples.py`'s own comments: a first attempt using a hand-rolled FNV-1a hash measured a
   false-positive rate over 10x the spec's stated figure, traced to FNV-1a's correlated upper bits
   across sequential keys — exactly the bits `filter_insert`/`filter_check` use to pick a block.
   SHA-256 was substituted specifically because it does not have that weakness, and the topic's own
   outcome is about the SBBF block/mask structure, not about reproducing XXH64 bit-for-bit.
3. **Is the "250-270 query skips 9 of 10 row groups" result cherry-picked, or does the mechanism
   generalize?** The query range (250-270) was chosen only to land entirely inside one row group's
   bounds (200-299) for a clean page-level demonstration afterward; the underlying mechanism
   (compare `[lo, hi]` against each row group's `[min, max]`) is applied identically and without
   exception to every row group, and the shuffled-column comparison on the exact same query and
   data proves the result depends on sort order, not on the specific range chosen.
4. **Is the truncated-statistics bug a realistic failure or an invented worst case?** The example
   is lifted directly from the spec's own illustration of valid truncation ("Blart Versenwald III"
   -> "B"/"C"); the bug this topic reproduces is the one-line difference between truncating
   correctly (rounding the last kept byte up, so the bound stays valid) and truncating naively
   (just cutting the string), which is a documented real-world defect class in Parquet writers,
   not a hypothetical edge case invented for this topic.

Problem Solving: One real bug found and fixed while building this topic's own code — the first
Bloom filter implementation used a hand-rolled FNV-1a hash and measured a 15.94% false-positive
rate against the spec's own stated ~1.26% for the identical configuration, a 10x-plus discrepancy
traced to FNV-1a's poor upper-bit distribution on sequential keys (the exact bits the SBBF uses to
select a block). Fixed by substituting a SHA-256-derived 64-bit hash, which measured 1.25% —
matching the spec's own number almost exactly. The row-group/page statistics and truncation
demonstrations ran correctly on the first attempt.
