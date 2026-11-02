# REVIEW: de.pyspark-execution-python-udf-cost

## Content review, self-review, 2026-10-31

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on the previous topic's codegen vocabulary (fusion, the `*(N)`
   marker, `CodegenSupport`), used but not re-taught; cross-references the earlier §2.1 UDF
   opacity topic by name only. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines whole-stage code generation, UDF, serialization, process boundary —
   all assumed, none taught by the reel itself (the reel teaches the three-way gap and its
   structural cause, not these supporting terms). Severity: none found.
3. **Gap hunt.** All three syllabus clauses mapped in `coverage.json`; `mapInArrow`, `@arrow_udf`,
   the §2.1 cross-reference, and Python UDTFs are all named in the syllabus or source list but not
   independently measured — each disclosed explicitly in the expert list rather than silently
   assumed covered. Severity: none found.
4. **Expert reader.** The reason Arrow beats pickling (batch vs. row crossing) is a structural
   inference from two separately-sourced facts, not one directly quoted claim — could read as
   overreach if left unflagged; fixed by disclosing this explicitly in `FACT-CHECK.md`'s red team
   rather than presenting it as a single sourced fact. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity about where fusion stops; two predicts (full topic
   requires ≥2), the first at step index 1 (within the first four, required); each predict's
   wrong answer is a real, tempting intuition ("codegen can generate a call into anything,"
   "Arrow just uses a faster format for the same per-row crossing"), not a strawman; three
   takeaways plus the recap's three-fact-plus-rule restatement.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: ran
   `node scripts/check-all.mjs --only build` after drafting, which passed clean on the first
   check. Code identifiers spoken aloud rather than written literally (`pandas_udf` → "Arrow
   UDF" / "Arrow-based UDF" throughout, never the literal decorator name), per QUALITY.md
   #35/#50/#54/#59.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-31

Same `Row`/`Svg` kit primitives as topics 1-6 (consistent sizing, consistent two-column layout).
Every step's final frame states its point in words in the value column, colour (`C.focus`)
marking the contrasting fact. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity.
At most three rows per step except the four-row recap. Both predict steps (2, 5) use their own
dedicated visual rather than reusing a reveal's numbers ahead of the matching prediction. The
Playwright reel test found one phone text-overlap case on the first run (the recap's "rule of
thumb" row running into its own value, "built-in, then Arrow, never pickled"); fixed by shortening
the value to "never pickled" alone, re-run clean at both desktop and phone sizes.
