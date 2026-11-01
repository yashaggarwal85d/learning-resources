# Review — de.quantile-sketches-t-digest

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.hyperloglog-distinct-counting`) own handoff, then
this topic's own files in order (reel and scenes, narration, post-notes, pre-notes,
prerequisites, registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then Chapter 6's
own opening syllabus line.

1. **Flow.** Clean. The bridge directly answers topic 31's own handoff (mergeability across
   partitions and time) and extends it from a single count to an entire distribution.
   `uses: ['hyperloglog-distinct-counting']` matches `CHAPTER.md`'s own plan; the handoff closes
   Chapter 5 and names Chapter 6's own opening topic (CSV/JSON interchange formats) as what comes
   next.
2. **Pre-notes.** 5 bullets, no links. Percentile/quantile, partition, and the register/harmonic
   mean idea (carried forward from topic 31, not retaught) are primers; centroid and tail latency
   are new terms this topic's own reel actually needs.
3. **Gap hunt.** Checked the syllabus line
   (`syllabus/data-engineering.md`, Chapter 5's closing clause) phrase by phrase. The line uses
   commas rather than semicolons to separate its four areas, so `coverage.json` splits it into 4
   comma-delimited clauses (rank-error vs relative-error guarantees; why averaging per-partition
   percentiles is wrong; mergeability; which engines and observability tools use which), each an
   exact substring of the syllabus line rather than a semicolon sub-clause. All four mapped to
   real steps; no gap against the syllabus line, the five source groups, or the ten-item expert
   list. One cross-reference caught and fixed before any check ran: an expert item's quote
   initially pulled from `CHAPTER.md`'s own "Outcomes" prose (not from topic 31's real syllabus
   line) — replaced with "mergeability across partitions and time," an exact substring of that
   topic's actual syllabus clause.
4. **Expert reader.** The predict step (step 2, "is averaging several partitions' own tail
   percentile a valid estimate of the whole dataset's real one") was checked for the trap of
   assuming averaging is "close enough" by analogy with a mean or a total — the explain text
   names the real reason it fails (a percentile is not an additive quantity; the true combined
   value depends on the whole shape of the combined data) rather than just asserting the numbers
   differ. The "Prove it" step was checked against the trap of assuming a bigger sample fixes the
   gap — the explain text names the structural reason (no amount of additional sampling repairs
   an averaging mistake that is wrong by construction) rather than a vague "not enough data"
   claim.
5. **Engagement.** Hook (step 1) poses the same partitioned dataset producing two different
   answers. Predict at step 2, within the first two. No takeaway on step 3 (the counterexample
   reveal, this reel's own "from" reference step, deliberately left without one, matching
   `coverage.json`'s own `at` mapping). Four takeaways (steps 4, 5, 6, 7). Recap (step 8) pulls
   every layer into one line each. "Prove it" (step 9) is a genuine synthesis task (recognizing
   why more samples cannot fix an averaging mistake) rather than a restatement.
6. **Narration teaches.** `narration-teaches.mjs` failed once on the first run: step 1's
   narration lines too closely echoed the `reel.tsx` hook's own description text (flagged
   `VERBATIM`, exit code 1) — fixed by rewriting step 1's three lines with substantially different
   phrasing ("One single pile of data, already split up into several separate chunks ahead of
   time...") while keeping the same meaning; passed clean on the second run (0 flags, overlaps
   0%-33%, every line under the 50-word limit). No digits, symbols, or code names appear in any
   narration line: the measured error percentages (5.6%, 0.6%) are described structurally
   ("noticeably off," "barely off") rather than with the specific numbers `examples.py` actually
   measures.

No findings beyond the fixes recorded above. `coverage.json` → `gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../quantile-sketches-t-digest` — 7/7 quotes
  verified word for word on the first attempt, including the Karnin/Lang/Liberty abstract's own
  Greek ε/δ characters, confirmed (not assumed) to need no special handling against the checker's
  normalizer.
- `python3 examples.py` — failed its own internal assertion on the first version (a per-partition
  `Digest(max_centroids=100)`, sequentially merged, produced a global p99 estimate *worse*
  (10.8%+ off) than the naive average (5.6% off) it was supposed to beat) — root-caused to the
  compression target (`total / max_centroids`) growing unboundedly as merge count increases while
  `max_centroids` stayed fixed, coarsening resolution with every merge. Fixed by raising
  `max_centroids` to 2000 for the per-partition digests; re-ran and got a merged estimate 0.6% off
  the true value, comfortably beating the naive average's 5.6%. Deterministic: re-running produced
  byte-identical output (confirmed by direct comparison of two runs).
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  data-engineering/.../quantile-sketches-t-digest` — passed clean on the first run (locked, docs,
  sources, build — 238 pages built, exit code 0).
- `node scripts/check-all.mjs --only links,narration --topic
  data-engineering/.../quantile-sketches-t-digest` — passed clean on the first run after the
  step-1 VERBATIM fix above (0.4s narration pass, 77.9s links pass, 1924 links checked, 0 broken;
  remaining reported title mismatches are all pre-existing, unrelated to this topic).
- `node scripts/check-all.mjs --only reels --topic
  data-engineering/.../quantile-sketches-t-digest` — "Reel smoke test passed: 1 live reel(s) at
  desktop and phone sizes" (every `scenes.tsx` `Row` label/value checked and kept to 1-3 words
  from the first draft, unlike topics 30/31 where this was caught reactively). The combined check
  reports `FAIL` only because of the known, topic-independent `test:editor` sandbox limitation.

## Fixes made during this build

- **`Digest` merge-accuracy bug**: a per-partition digest sized for its own partition's total
  weight lost resolution once merged across many partitions, because its compression target grew
  with accumulated weight while its centroid budget stayed fixed — fixed by raising
  `max_centroids` so the per-partition digest's resolution stays fine enough after merging;
  confirmed by direct re-measurement (10.8% → 0.6% merged error) rather than assumed.
- **`narration-teaches.mjs` VERBATIM failure** on step 1, fixed by rewording the narration to
  paraphrase the hook's claim instead of echoing the `reel.tsx` description's own phrasing;
  confirmed by re-running the checker to exit 0.
- **A `coverage.json` cross-reference quote** initially drawn from `CHAPTER.md`'s own prose
  rather than from topic 31's real syllabus line — caught and fixed before any check ran, by
  substituting an exact substring of that topic's actual syllabus clause.
- The Datadog engineering blog (a planned secondary source) returned only JS-rendered navigation
  boilerplate when fetched by `sources.mjs`'s static fetcher (no article text) — resolved not by
  substituting a different secondary source but by using the DDSketch paper's own primary-source
  statement ("currently being used by Datadog at a wide-scale") to cover the same fact.
- PDF extraction artifacts (small-caps letter-spacing, line-wrap whitespace) in the Dunning &
  Ertl and Karnin/Lang/Liberty papers are documented in `FACT-CHECK.md`'s Problem Solving section
  rather than "corrected" in `SOURCES.md`, since `sources.mjs check` compares against the literal
  extracted text.

## Looks review, self-review

`check-all.mjs --only reels --topic data-engineering/.../quantile-sketches-t-digest` passed on
the first run at both sizes, with no text-overlap fix needed.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "two different answers," "averaging is wrong," "merge stays valid") makes the claim explicit,
  not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the two conflicting percentile answers, the counterexample's own burst
  partition, the merged-vs-naive error contrast, each engine's own sketch choice, every "Prove it"
  answer) — never decorative.
- Captions (`fig`) match each scene's own `Svg label` exactly, and match the picture at every
  checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date 2026-10-31,
by "Claude (single session)", open: [] (recorded in the committed file). All reviews in this file
are self-review by the same session that wrote the content; no independent reviewer ran. Expert
sign-off: pending.

This topic closes Chapter 5 (Database Internals and Distributed Storage). The handoff hands off
to Chapter 6's opening topic.
