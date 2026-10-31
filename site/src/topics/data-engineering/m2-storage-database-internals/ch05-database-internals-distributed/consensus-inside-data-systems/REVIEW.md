# Review — de.consensus-inside-data-systems

Role: sceptical senior engineer and teacher, no prior involvement with this topic's authorship.
No independent reviewer ran this session; both passes below are self-review.

## Content review, self-review, 2026-10-30

1. **Where:** reel steps 2/6 (the two predicts). **What:** checked the two predicts are
   genuinely independent questions. **Evidence:** step 2 asks whether a write needs every node or
   just a majority (a single-group question); step 6 asks whether a cross-range transaction costs
   the same as a normal write (a question about crossing group boundaries) — different mechanisms.
   **Fix:** none needed. **Severity:** n/a.
2. **Where:** `examples.py`'s round-trip cost model. **What:** as the fact-checker, confirmed the
   model states explicitly in its own docstring that it counts the minimum round trips a correct
   two-phase commit requires, not a complete real-world latency model with retries or variance —
   avoiding an overclaim the syllabus clause ("what a commit costs in round trips") doesn't ask
   for. **Evidence:** the function's own comments and the claim it asserts match exactly what's
   measured. **Fix:** none needed. **Severity:** n/a.
3. **Where:** a candidate CockroachDB source quote. **What:** caught that one otherwise-ideal
   sentence ("Raft organizes all nodes that contain a [replica] of a [range] into a group...") had
   a dynamically-rendered term dropped in the fetched static text, leaving a garbled "a of a"
   fragment that would have failed exact-match verification or, worse, been quoted incorrectly.
   **Fix:** selected a different, complete sentence from the same source instead. **Severity:**
   would have been a sourcing error if shipped — caught before drafting `SOURCES.md`.
4. **Where:** the relationship to `de.shard-keys-hot-shards` (topic 22) and
   `de.partitioning-schemes-range-hash` (topic 21). **What:** confirmed this topic's own
   "per-range consensus" framing genuinely reuses topic 21's partitioning scheme and topic 22's
   own ranges, rather than introducing a new, unrelated way of dividing the keyspace. **Evidence:**
   `pre-notes.md` states this explicitly, and `uses: ['two-phase-commit', 'cap-pacelc']` doesn't
   list `partitioning-schemes` as a formal `uses` dependency since `CHAPTER.md` doesn't list it,
   but the bridge and pre-notes still name the real connection honestly. **Fix:** none needed.
   **Severity:** n/a.
5. **Where:** the handoff to topic 24 (`de.distributed-sql-architecture`). **What:** confirmed
   the exact sentence in `registry.ts`'s new entry matches `CHAPTER.md`'s own stated handoff
   verbatim, and that it's an honest bridge — this topic genuinely never shows a real system
   composing replication, partitioning, and consensus together, which topic 24 picks up with the
   Spanner pattern. **Fix:** none needed — verified exact match. **Severity:** n/a.

## Looks review, self-review, 2026-10-30

Reviewed every step's desktop and phone screenshot in `site/test-results/` after the reel smoke
test passed clean on the first run: `Reel smoke test passed: 1 live reel(s) at desktop and phone
sizes.` The separate `Editor test failed` block in the same run is the known, unrelated sandbox
limitation (popup/new-tab handling in this container's Playwright, confirmed pre-existing on an
unmodified `main`), not a regression from this topic.

- The point is visible at a glance on every step (Hook's "keep accepting writes" row; step 4's
  "refused" result; step 5's global-vs-per-range contrast; step 7's round-trip count).
- Every step moves and lands on a final frame that teaches; none crowded, clipped, or overlapping
  at either desktop or phone width — `Row` text was kept short from the first draft, following
  the last two topics' own phone-overlap lessons, and no overlap failure appeared on the first
  reel-check run.
- Colour is used only where it means something: the focus colour marks the resolving row in each
  reveal step (the unanimous rule's refusal, the refused write, the per-range groups staying
  writable, the total round-trip cost, CockroachDB/TiKV's own per-range design).
- The caption (`fig`) matches the picture on every step.
- Three takeaways present (steps 4, 5, 7), all within the 20-word limit after the build's own
  word-count check (counting the em dash as a word) caught two over-length on the first draft and
  required trimming.

Everything here is green. Shipping.
