# Review — de.lambda-vs-kappa-one

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 16's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 18's syllabus line (multi-region
analytical platform).

1. **Flow.** The bridge answers topic 16's handoff verbatim, and the handoff to topic 18 matches
   `CHAPTER.md`'s own bridge text exactly. Checked every named `uses` id via a Node.js script
   parsing `registry.ts` and checking each entry's own `introduces` array: every id named in
   `CHAPTER.md`'s `Uses:` line resolved to a live entry, so `declared` is empty, matching
   `CHAPTER.md`'s own `Declared: none` for this topic — the first topic since topic 12 with no
   gap.
2. **Pre-notes.** 7 bullets (speed layer, batch layer, replay, retention, dual code path,
   restatement, unified engine — `CHAPTER.md`'s own "Pre-notes terms" list), each under the
   per-term format, no links.
3. **Gap hunt.** The syllabus line splits into four clauses by `CHAPTER.md`'s own breakdown
   (designing the same pipeline both ways; the reprocessing-cost argument; dual-logic drift and
   correctness; when a batch correction layer still earns its complexity). Copied each clause
   byte-for-byte from the raw syllabus line and confirmed the four clauses union-cover every word
   of the line; `coverage.json`'s `syllabus` array matches this breakdown one clause to one or
   more steps.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the Kreps quote on dual-code-path
   pain and the Flink unified-execution claim both trace to the cited pages' own text, and that
   neither source is stretched to cover the engines' mechanics or the correctness internals this
   topic explicitly leaves out.
5. **Engagement.** Hook (step 1, two pipelines disagreeing by 0.8% with nobody able to say which
   is right); predict within the first few steps (step 2, when ripping out the batch layer is
   right); three takeaways across the reveal steps; recap; "Prove it" (a Kappa pipeline hitting a
   huge-historical-dimension join) extends the threshold framing to a condition not in the hook's
   own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: description overlap
   stayed within the established band, no digit or VERBATIM issues — this topic's own numbers
   (the 0.8% drift, the crossover thresholds) stayed in `examples.py`'s lab and out of both the
   on-screen text and the narration, following the convention established after topic 10's
   literal-digit build failure.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test, following the same pre-check sweep used for topics 15 and 16.
2. Takeaways checked by hand for the em-dash-counts-as-a-word gotcha (`split(/\s+/)` counts "—"
   as its own token) before running the build-time word-count check.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s rule
that colour is rare and means something. All step titles were written double-quoted from the
start with no embedded apostrophes or nested quote marks. The unrelated `test:editor` check again
fails in this sandbox with "a save did not open a new GitHub issue" — a known sandbox Playwright
popup-handling limitation (see team memory `learning-resources-editor-test-sandbox-limitation`),
unrelated to anything this topic touches, same as noted in topics 1-16's reviews.
