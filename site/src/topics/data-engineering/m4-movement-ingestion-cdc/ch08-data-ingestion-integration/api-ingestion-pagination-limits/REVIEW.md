# Review — de.api-ingestion-pagination-limits

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 3's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 5's syllabus line (file ingestion).

1. **Flow.** The bridge answers topic 3's handoff verbatim ("A cursor works only when the source
   is a database you can query... a vendor's REST API... is the next shape of the same
   problem"), and the handoff to topic 5 matches `CHAPTER.md`'s own handoff ("A third kind of
   source simply drops files and walks away, onto an object store that has no atomic rename").
   Checked both named `uses` ids via the registry-parsing script: `resilient-client-patterns` and
   `high-watermark-cursor` both resolve live.
2. **Pre-notes.** 9 bullets (REST, pagination, offset, cursor, HTTP 429, token bucket, jitter,
   idempotency key, OAuth access and refresh token — `CHAPTER.md`'s own "Pre-notes terms" list),
   each under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into the five clauses the raw syllabus line itself
   names. The first draft's reel left the secret-rotation half of the fifth clause ("OAuth token
   refresh **and secret rotation**") uncovered — the reel only reproduced the refresh-token race.
   Added directly: a line in the recap's body, narration and `coverage.json` naming the
   documented fix (two valid secrets accepted during a transition window, never a hard cutover).
   `coverage.json`'s `syllabus` array now matches the five-clause breakdown exactly, each clause
   an exact substring of the raw syllabus line.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against this topic's own measured facts (the keyset-cursor-still-misses-a-delete measurement,
   the refresh-token-rotation rule from RFC 6749 itself), not invented reasoning. The jitter
   claim in step 8 reproduces the AWS Architecture Blog's own described experiment rather than an
   invented contention model, disclosed as a reproduction, not a citation of the blog's own
   numbers.
5. **Engagement.** Hook (step 1, a clean-looking pull quietly duplicating and dropping real
   rows); predict within the first four steps (step 2, what a keyset cursor actually fixes); five
   takeaways across the reveal steps (steps 4, 6, 8, 10, 11); recap (step 11); "Prove it" (step
   12) extends the refresh-token mechanism to the concurrent-worker race, a case not in the
   hook's own single-pull scenario.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* the measurement comes out the way it does (why a position
   drifts, why a cursor on identity doesn't, why jitter breaks the lockstep, why a rotated
   refresh token locks a racing worker out) rather than reading the figure's own on-screen labels
   back. No digits appear in `reel.tsx`, `scenes.tsx` or `narration.json` — HTTP 429 is spoken as
   "four twenty-nine" and the idempotency-key character limit as "two hundred fifty-five," per
   the chapter's own "Spoken numbers" rule.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was written at 1-3 words from the first draft,
   confirmed by `grep` for digits returning no matches on the first pass.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text: all five takeaways (steps 4, 6, 8, 10, 11) needed trimming from
   their first draft (22, 23 and 21 words) down to 20, 20 and 20; the other two (19 and 17 words)
   needed no change.
3. `examples.py` was run to completion (`python3 examples.py` → "all checks passed") against a
   fully in-process mock API before writing the reel, so every figure on screen matches a number
   that was actually measured, not estimated. One quote (RFC 6749 §6) initially failed
   `node scripts/sources.mjs check` against `rfc-editor.org`'s plain-text RFC rendering — its
   ASCII-art sequence diagrams contain bare `<` arrows that the checker's HTML-tag stripper
   mistakes for open tags, deleting the real text between an arrow and the next `>` character
   anywhere later in the document. Fixed by quoting the datatracker.ietf.org HTML rendering of
   the same RFC instead, where the arrows are HTML-escaped and the checker fetches the real text.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches.
