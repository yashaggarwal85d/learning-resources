# Review — de.incremental-extraction-high-watermark

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 2's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 4's syllabus line (API ingestion).

1. **Flow.** The bridge answers topic 2's handoff verbatim ("A full extract is safe but redoes
   all the work every night. The obvious saving is to read only what changed since last time"),
   and the handoff to topic 4 matches `CHAPTER.md`'s own handoff text ("A cursor works only when
   the source is a database you can query... a vendor's REST API... is the next shape of the same
   problem"). Checked all five named `uses` ids via the registry-parsing script: `merge-statement`,
   `upsert-atomicity`, `idempotent-merge-load`, `parallel-range-extraction` and
   `isolation-anomalies` all resolve live against `registry.ts`'s own `introduces` arrays.
2. **Pre-notes.** 8 bullets (high watermark, `updated_at`, sequence, transaction timestamp,
   commit order, hard delete, upsert, lookback — `CHAPTER.md`'s own "Pre-notes terms" list),
   each under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into the four clauses `CHAPTER.md` itself breaks it
   into (full vs incremental; cursor columns and why they miss rows; lookback plus idempotent
   merge; when the answer is log-based CDC). The first draft's reel and narration left two named
   sub-causes thin: application clock skew (one of the four named miss causes) had no on-screen
   moment, and the handoff to log-based CDC (8.2) was only implicit in the recap's takeaway. Both
   were added directly: a clock-skew line in step 3's body and narration, and an explicit
   log-based-capture decision rule in the recap's body, narration and takeaway. `coverage.json`'s
   `syllabus` array now matches `CHAPTER.md`'s own four-clause breakdown, each clause an exact
   substring of the raw syllabus line, and the four clauses concatenated with "; " reconstruct it
   exactly.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against this topic's own measured facts (the idempotent-merge repeat-count measurement, the
   hard-delete row-count measurement), not invented reasoning. The sequence-gap claim in step 5 is
   checked as a direct logical consequence of the quoted `nextval()` behaviour, disclosed in
   `FACT-CHECK.md` as not independently measured (this chapter's own lab builds the `updated_at`
   cursor family, not a sequence-cursor one).
5. **Engagement.** Hook (step 1, a quiet row-count gap with no error in the log); predict within
   the first four steps (step 2, which kind of change a cursor can never see); four takeaways
   across the reveal steps (steps 4, 6, 8, 9); recap (step 9); "Prove it" (step 10) extends the
   hard-delete mechanism to a bulk `UPDATE` that skips `updated_at`, a case not in the hook's own
   scenario.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* the measurement comes out the way it does (the fixed-start-
   time mechanism, the non-reclaiming sequence behaviour, the hard-delete blind spot) rather than
   reading the figure's own on-screen labels back. No digits appear in `reel.tsx`, `scenes.tsx` or
   `narration.json` — every number is spelled as a word, per the chapter's own "Spoken numbers"
   rule.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was written at 1-3 words from the first draft this
   time, learning from topic 2's post-hoc digit sweep — confirmed by `grep` for digits returning
   no matches on the first pass.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text: all four takeaways (steps 4, 6, 8, 9) came in at 19, 17, 19 and
   18 words, each under the twenty-word limit, including after the recap takeaway was rewritten
   to name log-based capture explicitly.
3. `examples.py` was run to completion against this sandbox's real PostgreSQL 16 cluster
   (`python3 examples.py` → "all checks passed") before writing the reel, so every figure on
   screen matches a number that was actually measured, not estimated.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches.
