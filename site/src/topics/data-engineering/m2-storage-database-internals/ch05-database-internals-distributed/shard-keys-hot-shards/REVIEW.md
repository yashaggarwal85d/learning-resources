# Review — de.shard-keys-hot-shards

Role: sceptical senior engineer and teacher, no prior involvement with this topic's authorship.
No independent reviewer ran this session; both passes below are self-review.

## Content review, self-review, 2026-10-30

1. **Where:** reel steps 2/6 (the two predicts). **What:** checked the two predicts are genuinely
   independent questions. **Evidence:** step 2 asks whether cardinality alone guarantees even
   load; step 6 asks what happens to in-flight writes if a split skips its pause window — one is
   about key placement, the other about correctness during a membership change, different
   mechanisms within the same topic. **Fix:** none needed. **Severity:** n/a.
2. **Where:** `examples.py`'s celebrity-key traffic model. **What:** as the fact-checker, caught
   that the first Zipf-based traffic model left a second-ranked user heavy enough (over 11% of
   total traffic) to confound the salting fix's measurement, since that user wasn't salted and
   could land on the same shard as the celebrity's remaining traffic by chance. **Evidence:**
   rerun with the corrected isolated-weight model (one fixed 40% celebrity share, the rest split
   evenly) shows the hottest shard dropping cleanly from ~46% to ~12% after salting. **Fix:**
   redesigned the traffic model before this review; re-verified via `python3 examples.py`.
   **Severity:** would have made the salting claim's own measurement unreliable if shipped
   unfixed — caught before shipping.
3. **Where:** `pre-notes.md`'s term-bullet count vs. the build's own topic-file check. **What:**
   the first draft had only three prerequisite bullets; the build requires four to fourteen.
   **Fix:** added a fourth bullet (replication lag and session guarantees, topic 19) with a
   genuine "where you meet it" connection — a resharded shard's new replica catching up the same
   way topic 19 measured — rather than padding with an unrelated one. **Severity:** low, caught
   before shipping.
4. **Where:** the relationship to `de.partitioning-schemes-range-hash` (topic 21). **What:**
   confirmed this topic genuinely builds on topic 21's own partitioning mechanism rather than
   re-deriving it — `uses: ['partitioning-schemes']`, confirmed `introduces`d at that topic's own
   `registry.ts` entry — and that this topic's own celebrity-key failure is explicitly framed as
   happening *on top of* an otherwise-correct partitioning scheme, not a flaw in partitioning
   itself. **Fix:** none needed. **Severity:** n/a.
5. **Where:** the handoff to topic 23 (`de.consensus-inside-data-systems`). **What:** confirmed
   the exact sentence in `registry.ts`'s new entry matches `CHAPTER.md`'s own stated handoff
   verbatim, and that it's an honest bridge (this topic genuinely never addressed how replicas or
   shards agree on membership changes, which topic 23 picks up). **Fix:** none needed — verified
   exact match. **Severity:** n/a.

## Looks review, self-review, 2026-10-30

Reviewed every step's desktop and phone screenshot in `site/test-results/` after the reel smoke
test passed clean on the first run: `Reel smoke test passed: 1 live reel(s) at desktop and phone
sizes.` The separate `Editor test failed` block in the same run is the known, unrelated sandbox
limitation (popup/new-tab handling in this container's Playwright, confirmed pre-existing on an
unmodified `main`), not a regression from this topic.

- The point is visible at a glance on every step (Hook's "almost half the work" row; step 3's
  measured celebrity-shard share; step 7's zero-vs-over-half misroute contrast).
- Every step moves and lands on a final frame that teaches; none crowded, clipped, or overlapping
  at either desktop or phone width — this topic's `Row` text was written with the last chapter's
  own phone-overlap lesson in mind (shorter label/value pairs from the start), and no overlap
  failure appeared on the first reel-check run.
- Colour is used only where it means something: the focus colour marks the resolving row in each
  reveal step (the celebrity shard's own load, the post-salting result, the global index's narrow
  reach, the zero-misroute pause result, DynamoDB's own hot-item isolation).
- The caption (`fig`) matches the picture on every step.
- Three takeaways present (steps 4, 5, 7), all within the 20-word limit after the build's own
  word-count check (counting the em dash as a word) caught all three over-length on the first
  draft and required trimming each one.

Everything here is green. Shipping.
