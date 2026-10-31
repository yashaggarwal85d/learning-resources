# Review — de.hyperloglog-distinct-counting

## Content review, self-review, 2026-10-31

Read cold, in order: the previous topic's (`de.bloom-cuckoo-xor-filters`) own handoff, then this
topic's own files in order (reel and scenes, narration, post-notes, pre-notes, prerequisites,
registry entry, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus
line (Quantile sketches: t-digest, DDSketch, KLL), which closes the chapter.

1. **Flow.** Clean. The bridge directly answers topic 30's own handoff ("the next topic is a
   completely different question answered the same way: how many distinct values are there").
   `uses: ['probabilistic-membership-filters']` matches `CHAPTER.md`'s own plan (the sibling
   sketch-family contrast).
2. **Pre-notes.** 6 bullets, no links. The hash function (Chapter 1) and the membership-filter
   family (topic 30) are genuinely carried forward, not retaught; register, harmonic mean,
   partition and one-sided error are primers for what this reel and this topic's own lab actually
   build.
3. **Gap hunt.** Checked the syllabus line (`syllabus/data-engineering.md:283`) clause by clause.
   Four semicolon-delimited clauses, all mapped to real steps; no gap against the syllabus line,
   the five source groups, or the expert list (eleven items). One build-time failure caught on the
   first `check-all.mjs` run: a syllabus clause copied with backticks around
   `APPROX_COUNT_DISTINCT`/`COUNT(DISTINCT)` (matching the Markdown syllabus source's own styling)
   didn't byte-match the checker's own plain-text syllabus line — fixed by copying the clause
   without the backticks; passed clean on the second run (238 pages built).
4. **Expert reader.** The predict step (step 2) was checked for the trap of assuming merging two
   approximations must compound their error — the wrong answer is tempting by analogy with other
   approximate structures, and the explain text names the real mechanism (register-wise maximum
   is exact, not approximate) instead of just asserting the result matches. The "Prove it" step
   was checked against the trap of assuming the existing rolling sketch "already has everything
   needed" — the explain text names the structural reason (a cardinality estimator retains no
   per-value or set information) rather than a vague "it's not accurate enough" claim.
5. **Engagement.** Hook (step 1) poses a real, concrete claim about estimating without storing.
   Predict at step 2, within the first two. No takeaway on step 3 (the register reveal, this
   reel's own "from" reference step, deliberately left without one). Four takeaways (steps 4, 5,
   6, 7). Recap (step 8) pulls every layer into one line each. "Prove it" (step 9) is a genuine
   synthesis task (recognizing a cardinality estimator cannot answer a set-difference question)
   rather than a restatement.
6. **Narration teaches.** `narration-teaches.mjs` passed clean on the first run: 0 flags, highest
   overlap 26% (step 4), every line under the 50-word limit. No digits, symbols or code names
   appear in any narration line: register counts and measured error percentages are described
   structurally ("a handful", "a great many more", "shrinks substantially") rather than with the
   specific numbers `examples.py` actually measures.

No findings beyond the `APPROX_COUNT_DISTINCT` backtick fix recorded above. `coverage.json` →
`gapReview` recorded below.

## Checks run

- `node scripts/sources.mjs check site/src/topics/.../hyperloglog-distinct-counting` — 10/10
  quotes verified word for word on the first attempt, including both PDF-extracted sources whose
  small-caps font inserts letter-spacing ("H YPER L OG L OG") and whose hyphen drops across a line
  break ("knearest"), both confirmed to pass `sources.mjs check`'s own normalizer rather than
  assumed.
- `python3 examples.py` — pass. A real HyperLogLog sketch's error against an exact count (11,121
  distinct values on a Zipf-skewed stream of 200,000 events) shrinks monotonically from 4.24% at
  256 registers to 0.47% at 16,384 registers. Two partitioned sketches merged by register-wise
  maximum produce an estimate (11,409.9) bit-for-bit identical to a single sketch built over the
  same combined stream. A real Count-Min Sketch's estimate for the stream's five heaviest keys
  never falls below each key's true count. Deterministic: re-running produced byte-identical
  output (confirmed via checksum).
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  data-engineering/.../hyperloglog-distinct-counting` — failed once on the first run (the
  `APPROX_COUNT_DISTINCT` backtick mismatch, described above), fixed by removing the backticks
  from the `coverage.json` clause; passed clean on the second run (locked, docs, sources, build —
  238 pages built).
- `node scripts/check-all.mjs --only links,narration --topic
  data-engineering/.../hyperloglog-distinct-counting` — pass, 0 broken links out of 1910 checked;
  the 82 reported title mismatches are all pre-existing, unrelated to this topic.
- `node scripts/check-all.mjs --only reels --topic
  data-engineering/.../hyperloglog-distinct-counting` — "Reel smoke test passed: 1 live reel(s) at
  desktop and phone sizes" on the first run (every `scenes.tsx` `Row` label/value checked and
  trimmed to 1-3 words before running the real Playwright check; three initial drafts, caught
  during drafting rather than as a test failure). The combined check reports `FAIL` only because
  of the known, topic-independent `test:editor` sandbox limitation.

## Fixes made during this build

- **A `coverage.json` syllabus clause copied with backticks** (matching the Markdown syllabus
  file's own styling around `APPROX_COUNT_DISTINCT` and `COUNT(DISTINCT)`) didn't byte-match the
  checker's own plain-text comparison against the syllabus line — fixed by copying the clause
  without the backtick characters, confirmed by re-running the build check rather than assumed.
- **Three `scenes.tsx` `Row` values were initially over the 1-3-word limit** ("lands in one
  slot", and two instances of "need a different sketch" / "needs a new sketch") — caught and
  shortened during drafting, before running the real Playwright reel test, applying the lesson
  from this chapter's earlier topics.
- Both PDF-extracted sources' own extraction artifacts (small-caps letter-spacing, a dropped
  hyphen in "k-nearest", a dropped "√" glyph in the original paper's abstract) are documented in
  `FACT-CHECK.md`'s Problem Solving section rather than "corrected" in `SOURCES.md`, since
  `sources.mjs check` compares against the literal extracted text.

## Looks review, self-review

`check-all.mjs --only reels --topic data-engineering/.../hyperloglog-distinct-counting` passed on
the first run at both sizes, with no text-overlap fix needed.

Checked against the full checklist:

- The point lands at a glance and is shown by more than colour: each reveal's own row text (e.g.
  "one long run" / "would wreck average", "many registers" / "error shrinks") makes the claim
  explicit, not just `C.focus`.
- Every step moves (opacity-staged rows via `easeOut(seg(...))`) and lands on a final frame that
  teaches on its own.
- Nothing crowded, clipped or small at either size.
- Colour is used only where it means something: `C.focus` consistently marks the surprising or
  measured value (the "how many distinct" answer, the single-pass merge result, the harmonic
  mean's own tamed outlier, the shrinking error, the sparse-mode contrast, the set-sketch
  conclusion, every "Prove it" answer) — never decorative.
- Captions (`fig`) match each scene's own `Svg label` exactly, and match the picture at every
  checked step.

No findings beyond the fixes already made above. `coverage.json` → `gapReview`: date 2026-10-31,
by "Claude (single session)", open: [] (recorded in the committed file). All reviews in this file
are self-review by the same session that wrote the content; no independent reviewer ran. Expert
sign-off: pending.
