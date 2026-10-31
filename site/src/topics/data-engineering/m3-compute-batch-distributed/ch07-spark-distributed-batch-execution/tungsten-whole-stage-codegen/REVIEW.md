# REVIEW: de.tungsten-whole-stage-codegen

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous topic's physical plan vocabulary (chosen operators,
   plan text, `Exchange`), used but not re-taught. Nothing here is used before it's taught.
   Severity: n/a.
2. **Pre-notes.** Defines physical plan, JVM object overhead, virtual function call, and
   columnar storage, cross-referencing where each is actually taught — all assumed, none taught
   by the reel itself (the reel teaches fusion, UnsafeRow, the columnar exception, and the
   fallback, not these supporting terms). Severity: none found.
3. **Gap hunt.** All three syllabus clauses mapped in `coverage.json`; Janino's own compile step
   and ORC's own vectorised reader are named in the syllabus clauses but not independently
   measured — disclosed explicitly in the expert list rather than silently assumed covered.
   Severity: none found.
4. **Expert reader.** The 64KB method-size fallback trigger, sibling to the field-count trigger
   this topic forces, could read as an omission if left unstated; fixed by naming it directly in
   `coverage.json`'s expert list as the trigger this topic names but doesn't force. Severity:
   addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about what replaces per-row operator calls; three
   predicts (full topic requires ≥2), the first at step index 2 (within the first four, required);
   each predict's wrong answer is a real, tempting intuition ("generated code still needs an
   object," "it feeds the same pipeline, so it shares the marker," "some smaller stages survive a
   lower limit"), not a strawman; three takeaways plus the recap's four-fact restatement.
   Severity: none found.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: ran
   `node scripts/check-all.mjs --only build` after drafting, which passed clean on the first
   check — no verbatim-echo rewrite was needed this time, unlike topics 4 and 5. Code identifiers
   spoken aloud rather than written literally (`UnsafeRowWriter` → "unsafe row writer";
   `UnsafeRow` → "unsafe row"; `ColumnarToRow` → "columnar to row"; `*(1)` → "star one"), per
   QUALITY.md #35/#50/#54/#59, written correctly from the start based on topics 4 and 5's own
   established gotcha.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-5 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`) marking
the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity. At most two
rows per step except the four-row recap. Every predict step (3, 5, 7) uses its own dedicated visual
rather than reusing a reveal's numbers ahead of the matching prediction. The Playwright reel test
found one phone text-overlap case on the first run (step 5, "vectorised Parquet scan" running into
"same marker as the rest?"); fixed by shortening both the label and value to one or two words each
("Parquet scan" / "marker too?"), re-run clean at both desktop and phone sizes.
