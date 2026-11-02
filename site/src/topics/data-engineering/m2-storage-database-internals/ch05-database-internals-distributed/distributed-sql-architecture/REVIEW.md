# Review — de.distributed-sql-architecture

Role: sceptical senior engineer and teacher, no prior involvement with this topic's authorship.
No independent reviewer ran this session; both passes below are self-review.

## Content review, self-review, 2026-10-30

1. **Where:** reel steps 2/6 (the two predicts). **What:** checked the two predicts are
   genuinely independent questions. **Evidence:** step 2 asks whether the overall pattern is a
   new mechanism or a composition; step 6 asks when an optimistic scheme detects a conflict —
   one is architectural, the other is about concurrency control timing, different mechanisms.
   **Fix:** none needed. **Severity:** n/a.
2. **Where:** the "composition, not a new mechanism" framing vs. TrueTime/HLC. **What:** as the
   fact-checker, checked this framing doesn't overclaim — TrueTime and the external-consistency
   guarantee it enables are treated as a genuinely separate, additional mechanism layered on top
   of the range-sharding/consensus/2PC composition, not folded into "nothing new here."
   **Evidence:** the reel's own step ordering separates "Reveal: the composition, measured" from
   the two clock-focused reveals that follow it. **Fix:** none needed. **Severity:** n/a.
3. **Where:** two candidate CockroachDB source sentences. **What:** caught the same
   dynamically-rendered-term artifact found in the previous topic's CockroachDB source (a tooltip
   term silently dropped from the static-fetched text), this time in two different sentences.
   **Fix:** selected adjacent, complete sentences from the same pages instead. **Severity:**
   would have been a sourcing error (a garbled quote) if shipped unfixed — caught before drafting
   `SOURCES.md`.
4. **Where:** the round-trip cost comparison in `examples.py`. **What:** verified the comparison
   is specifically about network round trips (what the syllabus clause asks for), not total
   latency including local disk fsync cost, so excluding the single-node side's WAL fsync from
   the count isn't an unfair thumb on the scale. **Evidence:** both functions' own docstrings
   state the scope explicitly. **Fix:** none needed. **Severity:** n/a.
5. **Where:** the handoff to the next section (cache patterns and eviction policies). **What:**
   confirmed the exact sentence in `registry.ts`'s new entry matches `CHAPTER.md`'s own stated
   handoff verbatim, and that it's an honest bridge — this chapter's entire tail (topics 17-24)
   genuinely focused on write-path protection, which the handoff correctly frames as the reason
   the next section turns to the read side. **Fix:** none needed — verified exact match.
   **Severity:** n/a.

## Looks review, self-review, 2026-10-30

Reviewed every step's desktop and phone screenshot in `site/test-results/` after the reel smoke
test passed clean on the first run: `Reel smoke test passed: 1 live reel(s) at desktop and phone
sizes.` The separate `Editor test failed` block in the same run is the known, unrelated sandbox
limitation (popup/new-tab handling in this container's Playwright, confirmed pre-existing on an
unmodified `main`), not a regression from this topic.

- The point is visible at a glance on every step (Hook's "runs all three" row; step 4's
  strictly-increasing HLC timestamps; step 7's "rejected, only now" result).
- Every step moves and lands on a final frame that teaches; none crowded, clipped, or overlapping
  at either desktop or phone width — `Row` text was kept short from the first draft, following
  this chapter's own repeated phone-overlap lesson, and no overlap failure appeared on the first
  reel-check run.
- Colour is used only where it means something: the focus colour marks the resolving row in each
  reveal step (the 2PC coordination, the monotonic HLC result, the later timestamp, the rejected
  transaction, the total round-trip cost, "none of it is free").
- The caption (`fig`) matches the picture on every step.
- Three takeaways present (steps 4, 5, 7), all within the 20-word limit after the build's own
  word-count check (counting the em dash as a word) caught one over-length on the first draft and
  required trimming.

Everything here is green. Shipping.
