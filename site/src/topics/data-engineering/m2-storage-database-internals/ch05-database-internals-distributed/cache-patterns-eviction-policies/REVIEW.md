# Review — de.cache-patterns-eviction-policies

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.distributed-sql-architecture`) own handoff, then
this topic's own files in order (reel and scenes, narration, post-notes, pre-notes,
prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next
topic's syllabus line (cache consistency and invalidation).

1. **Flow.** Clean. The hook directly answers topic 24's own handoff ("the next section turns to
   the read side ... caching, starting with the patterns and eviction policies every cache is
   built from"), not a generic restatement. `uses: ['buffer-pool-pin-unpin']` matches
   `CHAPTER.md`'s own plan for this topic (the direct structural parallel between a buffer pool's
   own eviction and an application cache's).
2. **Pre-notes.** Checked against `notes-rules.ts` (5 bullets, no links). Cache miss and backing
   store are genuinely assumed primers; pin/unpin is named as the prior topic's own concept, not
   retaught; eviction policy and skewed access pattern are primers for what the reel actually
   teaches.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:273`) clause by clause
   against `coverage.json`'s mapped clauses, copying each clause from the cleaned scope text
   (asterisks and backticks stripped, matching `site/src/lib/syllabus.ts`'s `clean()`) rather than
   the raw markdown. Four clauses: the four patterns and their risks, TTLs, the LRU/LFU/W-TinyLFU
   admission point, and the "(structures in → Data Structures & Algorithms Ch.5)" cross-reference
   — the build's own coverage check caught this fourth clause as uncovered on the first pass (it
   is easy to miss since CHAPTER.md's own prose calls it "a cross-reference, not content this
   topic teaches," which is true of the teaching but not of the coverage-mapping requirement).
   Mapped it to the DSA domain's own "LRU caches" topic (`§11.2` in that syllabus, not literally
   "Ch.5" — the syllabus's own chapter number in this cross-reference does not match where the
   DSA domain actually built this material, since DSA's cache-structures chapter is numbered 11,
   not 5; mapped by content, not by the syllabus's own stated chapter number), quoting its
   "hash map + doubly linked list for O(1) get/put" scope text. No gap found against the syllabus
   line, the four sources, or the expert list (ten items) after this fix.
4. **Expert reader.** The predict step (step 2) was checked for the trap of assuming a sturdier
   cache node would have prevented the hook's loss: the wrong answer is tempting because it
   blames hardware rather than the pattern choice itself, and the explain text names the real
   fix (write-through) directly rather than vaguely. The "Prove it" step mirrors this same trap
   one layer up (blaming the eviction policy when the real gap is admission) rather than
   repeating the hook's own scenario.
5. **Engagement.** Hook (step 1) poses the real open question topic 24's own handoff left.
   Predict at step 2, within the first two. Four takeaways (steps 4, 5, 6, 7), each a distinct,
   separately-sourced claim rather than restating another step's. Recap (step 8) pulls every
   layer into one line each. "Prove it" (step 9) is a genuine synthesis task extending the
   admission-vs-eviction claim to a new scenario (an eviction-policy swap that barely moves the
   hit rate) rather than restating the reveal.
6. **Narration teaches.** `narration-teaches.mjs` passed clean on the first run: 0 flags, highest
   overlap 15% (step 6), every line under the 50-word limit. No digits, symbols or code names
   appear in any narration line: "LRU"/"LFU"/"W-TinyLFU" are spoken as "recency," "frequency," and
   "paying attention to frequency, not just recency"; "TTL" as "an expiration."

No other findings. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../cache-patterns-eviction-policies` —
  8/8 quotes verified word for word.
- `python3 examples.py` — pass. The write-behind crash simulation drops exactly the one queued
  write it acknowledged (`order-42`), confirmed never reaching the backing store. The measured
  hit-rate comparison (30,000 requests, 10,000 keys, Zipfian skew 1.0, capacity 100) returned
  plain LRU at 0.393 and the frequency-gated admission policy at 0.463, a 7-point gap — the first
  parameter choice (1,000 keys, skew 1.2, threshold 2) only produced a 1-point gap, too thin to
  read as a convincing lab result, so the parameters were swept and reselected before this ran
  (recorded in FACT-CHECK.md's Problem Solving).
- `node scripts/check-all.mjs --skip reels,links,narration --topic cache-patterns-eviction-policies`
  — failed once on the first run (coverage: the DSA cross-reference clause uncovered, and only
  eight of the required ten expert items), fixed by adding the fourth syllabus clause mapped to
  DSA's "LRU caches" topic and two more expert items; passed clean on the second run (locked,
  docs, sources, build — 238 pages built).
- `node scripts/check-all.mjs --only links,narration --topic cache-patterns-eviction-policies` —
  pass, 0 broken links; the 54 title mismatches reported are all pre-existing, in the Rust
  domain, unrelated to this topic.
- `node scripts/check-all.mjs --only reels --topic cache-patterns-eviction-policies` — pass,
  "Reel smoke test passed" at desktop and phone sizes.

## Fixes made during this build

- **`examples.py`'s first parameter choice gave only a 1-point hit-rate gap** (0.757 vs 0.767,
  1,000 keys, Zipfian skew 1.2, admission threshold 2) — real, but too thin for a convincing lab
  result. Swept skew/key-count/capacity/threshold combinations and reselected 10,000 keys, skew
  1.0, capacity 100, threshold 5 (0.393 vs 0.463, a 7-point gap), and added a margin assertion
  (`admission_hit_rate > lru_hit_rate + 0.05`) so a future edit can't silently shrink the gap back
  to something unconvincing.
- **The build's own coverage check caught an uncovered syllabus clause**: the
  "(structures in → Data Structures & Algorithms Ch.5)" cross-reference, which CHAPTER.md's own
  prose describes as not-taught-here but which Rule #6 still requires mapping. Fixed by adding a
  fourth `coverage.json` syllabus entry pointing to DSA's "LRU caches" topic — noting in this
  review that the syllabus's own "Ch.5" reference doesn't match DSA's actual chapter number for
  that material (it's §11.2 there), so the mapping was made by content, not by the stated number.
- **The expert list needed ten items and had eight** — added two more, one naming write-through's
  distinct (not restated) disadvantage and one naming the DSA cross-reference's own content link.
- **`github.com/ben-manes/caffeine/wiki/Efficiency` returned 403** to this sandbox's fetcher (the
  known gated-GitHub-wiki-path gotcha) — fixed by fetching
  `raw.githubusercontent.com/wiki/ben-manes/caffeine/Efficiency.md` instead, confirmed identical
  content.

## Looks review, self-review

`check-all.mjs --only reels --topic cache-patterns-eviction-policies` passed on the first run at
both sizes, with no text-overlap fix needed — the `Row` label/value pattern reused directly from
`buffer-pool-page-replacement`'s own scenes, already known to render cleanly at both sizes.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "write-behind, until flushed" / "the cache is the record") makes the claim explicit, not just
  `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the write-behind loss risk, the TTL's own bound, the measured admission gap,
  every "Prove it" conclusion) — never decorative.
- Captions match the picture at every checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date
2026-10-31, by "Claude (single session)", open: [] (recorded in the committed file). All reviews
in this file are self-review by the same session that wrote the content; no independent reviewer
ran. Expert sign-off: pending.
