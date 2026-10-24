## Content review, self-review, 2026-10-23

- Claims traced to sources: the WAL+memtable+flush write path and the delete-as-own-log-entry
  mechanic are quoted directly from CMU 15-445/645 (Fall 2024) Lecture 4, "Database Storage II".
  The index-vs-filter distinction behind the fence-pointer/Bloom-filter split is quoted directly
  from the same course's Lecture 8, "Indexes & Filters I". The memtable's always-consulted-on-read
  property, the immutable-memtable concept, and the per-key value-or-tombstone storage are quoted
  directly from leveldb's own Implementation Notes (`main` branch). The literal on-disk form of a
  fence pointer (an index block, one boundary key per data block) and a Bloom filter (a filter
  block) are quoted directly from leveldb's own File Format doc. A second production engine's own
  WAL, immutable-memtable, SST-file, and sequence-number definitions are quoted directly from the
  RocksDB Terminology wiki; WAL recovery and obsolescence are quoted directly from the RocksDB
  Write-Ahead-Log File Format wiki; the real bits-per-key-to-false-positive-rate table and the
  per-SST-file embedding are quoted directly from the RocksDB Bloom Filter wiki. All 29
  quote-check passes (`sources.mjs check`) pass.
- `examples.py` builds a from-scratch WAL, memtable, and immutable SSTable with newest-first reads.
  A WAL replay exactly reconstructs an unflushed memtable of fifty records, including a tombstone.
  Across two flushed runs, the newest write to a repeated key always wins. A Bloom filter at
  RocksDB's own roughly-one-percent bits-per-key setting, measured over five thousand inserted keys
  and twenty thousand absent probe keys, shows an observed false-positive rate of zero point nine
  zero zero percent with zero false negatives. With five on-disk runs from a thousand keys, a
  batch of one hundred lookups touches fifty-five run-reads against five hundred for an unfiltered
  baseline on the identical key set — an eighty-nine percent reduction, with both fence pointers
  and the Bloom filter contributing skips. A key deleted after being flushed returns not-found
  immediately, with zero compactions run, and the old run's stored bytes are asserted unchanged.
- Gap hunt (`coverage.json` → `gapReview`): no open items. The original 1996 log-structured-merge
  paper (O'Neil, Cheng, Gawlick, O'Neil) is named only in passing, not re-derived; compaction and
  amplification are explicitly deferred to the next topic; the measured numbers are scoped to this
  topic's own key set and settings, not claimed to generalize; RocksDB's Ribbon filter is named
  only in the frontier section, not taught as its own mechanism.
- The syllabus clause plus the cross-domain arrow reference (`→ Data Engineering §5.1, Rust
  Systems Engineering Ch.22`) are both mapped in `coverage.json`, the arrow clause pointing to the
  "In production" post-notes section, following the same pattern topics 26-27 established for a
  cross-domain reference to a topic that doesn't exist yet. Ten expert items were written blind,
  from the syllabus line and the seven fetched sources alone.
- `FACT-CHECK.md`'s red team confirmed a Bloom filter's one-directional guarantee (false positives
  possible, false negatives structurally impossible), a fence pointer's role as narrowing-only
  (never itself a membership confirmation), and that sequence numbers rather than wall-clock time
  are what make newest-wins well-defined across a crash; both predict steps' distractor options
  were checked against the mechanism already shown earlier in the reel, and the immutability claim
  was checked directly against `examples.py`'s own assertion that a flushed run's bytes never
  change.
- Narration (all ten steps) was written as the professor's own reasoning, distinct from each step's
  on-screen caption/body, drawing from `OUTLINE.md`'s own "Narrator's line of thought" section
  written during planning. Verified clean with `scripts/narration-teaches.mjs` (the real build
  check, not an approximation): one over-length line (step 10, fifty-eight words against the
  fifty-word limit) was caught and split into two lines before the first `check-all` run, rather
  than discovered by it.
- Two predict steps (step 4: what a full memtable actually does; step 6: which of three copies of
  a key a read returns) satisfy the full topic's two-predict requirement; both have matching
  `answer` arrays in `narration.json`.
- Three takeaways (steps 5, 8, 9) satisfy the three-minimum rule.
- Two build failures caught and fixed on the first `npm run build`: a code comment in `reel.tsx`
  referencing "Topics 26-27" by digit was flagged by the numbers-on-screen checker (which scans the
  whole file, comments included) and reworded without digits; three takeaway strings (steps 5, 8,
  9) exceeded the twenty-word takeaway limit (twenty-six, twenty-four, and twenty-seven words) and
  were each shortened to under twenty.
- Every number in `reel.tsx`/`scenes.tsx` prose is spelled as a word (no digit characters outside
  `duration` values and deliberately-wrong predict-option labels, which the checker exempts), and
  no on-screen visual renders a literal numeral — the log strip and run visuals are drawn
  proportionally, following the same convention topics 24-27 established.

## Looks review, self-review, 2026-10-23

`npm run build` is clean after the two fixes above. `node scripts/sources.mjs check` and
`node scripts/check-all.mjs --only reels --topic dsa.lsm-tree-write-read` both pass, with the reel
smoke test confirming zero live-reel regressions (the topic ships `held`, as every new topic does).

- Step 1 (Opening): the in-place-vs-sequential framing renders without overlap at both sizes.
- Step 2 (WAL): the append-only log strip grows left-to-right and stays inside the frame.
- Step 3 (Memtable): the in-memory sorted structure, drawn full and pulsing, stays legible.
- Step 4 (FlushPredict) and its answer state: the predict/answer text and the memtable sketch fit
  the frame at both sizes.
- Step 5 (FlushReveal): the flush to a new immutable run and the fresh memtable/WAL reset render
  without crowding.
- Step 6 (ReadPredict) and its answer state: the three-copies-of-a-key sketch and the predict/
  answer text are legible at both sizes.
- Step 7 (ReadReveal): the newest-first run-by-run check renders clearly.
- Step 8 (SkipWork): the Bloom-filter-skip and fence-pointer-narrow comparison fits inside the
  frame without overlap.
- Step 9 (Tombstone): the tombstone shadowing an older value in a flushed run, with no compaction
  run, renders cleanly at both sizes.
- Step 10 (ProveIt): all measured comparisons (false-positive rate, run-touch reduction, tombstone
  zero-compaction result) and their captions fit cleanly at both sizes.

Final reel check (`npm run build`, `sources.mjs check`, `check-all.mjs --only reels`): all pass.
This is the third topic of Chapter 5 (B-Trees and Write-Optimized Trees).
