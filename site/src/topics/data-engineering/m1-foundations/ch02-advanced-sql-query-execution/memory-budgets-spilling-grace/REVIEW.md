# Content review, self-review, 2026-10-22

Read topic 22's reel (hash-sort-aggregation) and this topic's own files cold, as a sceptical senior engineer and teacher.

## Flow
- The hook states the surprise immediately (the same ~35 MB spill costs very different amounts of time depending on budget) rather than building up to it, matching topics 21/22's own hook pattern of leading with the reversal, not the mechanism.
- The two predict/reveal pairs that matter most for the syllabus's real claim (does spilling cost time; what happens as the budget shrinks) are placed back to back (steps 2–5) so the "spilling isn't inherently slow" finding and the "but starving it is" finding read as one argument, not two separate facts.
- The hash-side material (hash_mem_multiplier, batch doubling, how a batch spills) comes after the sort-side material is fully settled, mirroring how topic 22 sequenced hash after sort — the learner already has "budget → spill → cost" from the sort case before the hash case adds "and hash gets a bigger budget."
- Concurrency and skew are placed last, after both mechanisms are established, since both are modifiers on the same budget idea rather than new primitives.
- The two "Prove it" steps test the two most reusable, mechanical recognitions (reading Batches off EXPLAIN; multiplying a per-session budget across sessions), consistent with topics 20–22's own closing checks.

## Pre-notes accuracy
Checked each of the 5 pre-notes.md terms (`work_mem`, `hash_mem_multiplier`, temp file, batch, skew) against where it's used in the reel — all five are used by step 4 at the latest, none left orphaned.

## Gaps
- The skew-bucket mechanism (one frequent key kept permanently in memory) is sourced directly from `nodeHash.c` but could not be measured independently: this PostgreSQL version's `EXPLAIN` gives no separate signal for it, and a direct A/B (skewed vs. uniform key at the same `work_mem`) didn't isolate the effect cleanly from batch-count noise. Flagged honestly in FACT-CHECK.md, step 12's narration, and post-notes, rather than claimed as measured.
- The apparent "spill measured faster than in-memory" result is real and reproducible on this instance, but the reel is explicit that the likely explanation (filesystem cache absorbing the sequential write/read of the spill file) is not independently verified — named as a plausible mechanism in post-notes, not asserted as fact.
- The exact `work_mem` threshold where a starved sort starts costing real time (somewhere below 128 kB on this schema) isn't pinned down with a sweep — this topic shows two starved points and the trend, without claiming to have found the precise knee.

## Expert-reader depth
Post-notes' "Into the internals" goes past the reel into: `ExecHashIncreaseNumBatches`/`ExecHashIncreaseBatchSize`'s actual doubling mechanism and the `growEnabled` cutoff that stops it from growing forever; the skew-bucket mechanism and its honest measurement gap; and the cache-behavior explanation for the surprising spill-not-slower result, clearly flagged as unverified.

## Engagement arc
Five predict/reveal-shaped moments (spill-vs-memory speed; hash-join shrink; concurrency; plus the two closing "Prove it" questions), comparable in density to topics 21–22.

## Does the narration teach?
`node scripts/narration-teaches.mjs` on this topic: all 15 steps between 0% and 21% description-overlap, well under the 50% ceiling (step 2's 21% comes from "spilling" and "work_mem" being hard to avoid on both sides). Longest lines 17–40 words, under the 50-word narration cap (checked separately by the build's per-line word-count check, which passed). Spot-checked step 5 (the starved-budget reveal) and step 9 (the concurrency reveal) by reading them aloud: both explain *why* (merge-pass count, not disk volume; a per-operation budget with no shared ceiling) rather than reading the displayed numbers off the screen.

---

# Looks review, self-review, 2026-10-22

Examined the rendered output from the Playwright reel test (desktop and phone, all 15 steps) against `DESIGN.md`'s checklist.

## Findings and fixes
The first Playwright run on this topic failed with five layout problems, all in `scenes.tsx`, none in the shared player code:

1. **`RevealWhatGetsSlow` (step 5), desktop**: its three stacked `timeBar` rows were spaced too tightly (`h={370}`, 120px between bar anchors) — the second row's display-value text and the third row's label text landed only 2px apart, overlapping on desktop and, at a smaller scaled font, nearly disappearing on phone (one run measured the first row's display text at exactly the 9px minimum). Fixed by widening the row spacing to 110px between anchors and reducing the overall height to `h={410}` (a smaller height scales the SVG's font up on phone rather than down, which fixed both problems at once — tightening vertical space and shrinking fonts pull in opposite directions here).
2. **`RevealWhatGetsSlow`'s closing note (step 5), phone**: at the original wording ("almost the same disk written — the merge passes are what cost time") the single `<T>` line ran past the drawing's right edge on the narrower phone viewport. Shortened to "almost the same disk — the merge passes cost time."
3. **`HowHashGetsMoreRoom` (step 6), phone**: the `Row` labels ("work_mem = 4 MB, hash_mem_multiplier = 1.0" / "= 4.0") were long enough that on phone's narrower layout the label text ran into the value text on the same row. Shortened both to "work_mem 4 MB, multiplier ×1.0" / "×4.0."
4. **`Recap` (step 13), phone**: one of the five recap lines ("spilling itself measured fine — too few merge passes is the real cost") was noticeably longer than its four siblings and overflowed on phone. Shortened to "spilling itself measured fine here, not slower," now in line with the other four lines' length.
5. **`ProveBatches`' `Memory Usage` figure**: carried over a stray `403kB` from an earlier draft that didn't match the `256kB` used in the matching `reel.tsx` body text (the number itself wasn't wrong — it just wasn't the one examples.py and reel.tsx agree on) — corrected to `256kB` for consistency, since the figure is illustrative (a plausible memory usage for a `Buckets: 16384 Batches: 64` hash join near its budget) rather than itself a directly measured number.

All five were caught by the Playwright test itself (overlap/overflow/min-size checks) or by the build's number-consistency check, then confirmed fixed by a clean re-run: `node scripts/check-all.mjs --only reels --topic memory-budgets-spilling-grace` passes at desktop and phone sizes, and `node scripts/check-all.mjs --skip reels,links --topic memory-budgets-spilling-grace` passes locked/docs/sources/build/narration.

No change was made to `ReelPlayer.tsx` or any other shared reel code — every fix here is local to this topic's own `reel.tsx`/`scenes.tsx`.
