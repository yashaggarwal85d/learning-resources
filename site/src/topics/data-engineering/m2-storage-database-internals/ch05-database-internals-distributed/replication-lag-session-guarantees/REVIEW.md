# Review — de.replication-lag-session-guarantees

Role: sceptical senior engineer and teacher, no prior involvement with this topic's authorship.
No independent reviewer ran this session; both passes below are self-review.

## Content review, self-review, 2026-10-30

1. **Where:** reel step 7/8 (the second predict and its reveal). **What:** checked that the
   predict genuinely asks the reader to commit before the reveal answers it, and that the reveal's
   answer doesn't just restate the predict's correct option without adding anything. **Evidence:**
   step 7 asks what a monotonic-reads violation would actually require; step 8 adds the
   consistent-prefix guarantee alongside it and generalizes the reasoning (one ordered WAL stream)
   rather than only confirming the predict's answer. **Fix:** none needed. **Severity:** n/a.
2. **Where:** `OUTLINE.md` claim 12 vs. `FACT-CHECK.md` claims 12-15. **What:** `OUTLINE.md`'s
   claims list originally bundled four separate executed experiments under one claim line.
   **Fix:** `FACT-CHECK.md` lists all four separately with their own evidence and actual measured
   output (lag numbers), which is the more rigorous version; `OUTLINE.md` is left as a summary
   pointer to `FACT-CHECK.md` rather than duplicated, matching sibling topics' own convention.
   **Severity:** low, cosmetic.
3. **Where:** `coverage.json`'s `syllabus[]` clauses vs. the raw syllabus line. **What:** verified
   each of the three clauses is an exact word-for-word substring of the syllabus bullet after
   `clean()`'s stripping (backticks, `**`/`*`, trailing em-dash) — re-copied directly from
   `sed -n '255p' syllabus/data-engineering.md`, not retyped from memory. **Evidence:** build's own
   coverage checker passed with zero unmatched-word complaints. **Fix:** none needed. **Severity:**
   n/a.
4. **Where:** the handoff to topic 20 (`de.cap-pacelc-practice`). **What:** confirmed the exact
   sentence in `registry.ts`'s new entry matches `CHAPTER.md`'s own stated handoff verbatim,
   character for character, since topic 20's own bridge (already written in `CHAPTER.md`) quotes it
   back. **Fix:** none needed — verified exact match. **Severity:** n/a.
5. **Where:** `post-notes.md`'s Internals section, sticky routing/primary fallback paragraph.
   **What:** as the fact-checker, challenged whether naming these without building them was a cop-
   out. **Fix:** none — the syllabus clause itself names all three alternatives at the naming
   level, the chapter's own single-pair cluster genuinely cannot distinguish them experimentally
   from the LSN-token fix (all three produce the identical read-your-writes outcome; they differ
   only in cost and operational complexity, not in anything this sandbox can measure), and this is
   disclosed explicitly rather than silently glossed over. **Severity:** n/a.

## Looks review, self-review, 2026-10-30

Reviewed every step's desktop and phone screenshot in `site/test-results/` after the reel smoke
test passed clean (`Reel smoke test passed: 1 live reel(s) at desktop and phone sizes.`).

- The point is visible at a glance on every step (Hook's "write an order, then read it back" vs.
  "read on another node: not yet revealed"; step 8's three-row contrast of the three guarantees;
  step 10's recap row trio) and shown by more than brightness — the focus color marks the answer
  row distinctly in every reveal.
- Every step moves (opacity/position easing via `seg`/`easeOut`) and lands on a final frame that
  teaches; none crowded, clipped, or small at either desktop or phone width.
- Colour is used only where it means something: the focus colour on the row that resolves each
  step's own question, red/white on the Prove It predict's wrong/right answer blocks.
- The caption (`fig`) matches the picture on every step, including the corrected step 11 (no
  longer claiming a specific "30 seconds" the picture doesn't show).
- The two phone-overlap failures the first `tests/reels.mjs` run found (step 8's three rows, step
  10's second row) were both fixed by shortening the colliding label/value text, re-run and
  confirmed clean — no overlap, clipping, or crowding remains on any phone screenshot.

Everything here is green. Committing.
