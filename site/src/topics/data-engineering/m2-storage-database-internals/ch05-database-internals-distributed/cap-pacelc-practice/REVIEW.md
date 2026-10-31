# Review — de.cap-pacelc-practice

Role: sceptical senior engineer and teacher, no prior involvement with this topic's authorship.
No independent reviewer ran this session; both passes below are self-review.

## Content review, self-review, 2026-10-30

1. **Where:** reel step 2/6 (the two predicts). **What:** checked the two predicts are genuinely
   independent questions, not the same question twice. **Evidence:** step 2 asks what happens to a
   claimed-CA system during a real partition; step 6 asks whether a system's partition-time choice
   carries over to its normal-case behavior — different axes of the same theorem (CAP vs. PACELC).
   **Fix:** none needed. **Severity:** n/a.
2. **Where:** `examples.py` vs. a real lab. **What:** as the fact-checker, confirmed this topic
   genuinely has no lab per `CHAPTER.md` ("Lab: none of its own") and that the executable checks
   (failure-domain containment, PACELC classification-from-quote) are a reasonable substitute for
   "executed truth" rather than a decorative script with nothing really checked. **Evidence:** every
   function in `examples.py` has a real `assert`, not just a `print`. **Fix:** none needed.
   **Severity:** n/a.
3. **Where:** `coverage.json`'s third clause vs. the raw syllabus line. **What:** the clause
   originally used single quotes around "partition" where the syllabus uses straight double quotes
   — caught by the build's own coverage checker on the first build attempt. **Fix:** corrected to
   match the syllabus's exact characters (verified via `sed -n '258p' | cat -A`). **Severity:** low,
   caught before shipping.
4. **Where:** the relationship to `de.cap-stated-precisely-pacelc` (Chapter 14 §14.4, built earlier
   in this project's history). **What:** checked this topic doesn't duplicate that topic's own
   formal CAP proof — that topic proves the theorem with a toy three-replica simulation; this topic
   classifies real systems from their own documentation instead. **Fix:** `pre-notes.md` and
   `post-notes.md` both state this distinction explicitly rather than leaving the overlap
   unaddressed. **Severity:** n/a.
5. **Where:** the handoff to topic 21 (`de.partitioning-schemes-range-hash`). **What:** confirmed
   the exact sentence in `registry.ts`'s new entry matches `CHAPTER.md`'s own stated handoff
   verbatim. **Fix:** none needed — verified exact match. **Severity:** n/a.

## Looks review, self-review, 2026-10-30

Reviewed every step's desktop and phone screenshot in `site/test-results/` after the reel smoke
test passed clean on the first run (`Reel smoke test passed: 1 live reel(s) at desktop and phone
sizes.` — no overlap failures this time, unlike the previous topic).

- The point is visible at a glance on every step (Hook's two contradictory-looking claims; step 7's
  Dynamo/Spanner opposite-quadrant rows; step 8's failure-domain nesting) and shown by more than
  brightness — the focus colour marks the resolving row in every reveal.
- Every step moves and lands on a final frame that teaches; none crowded, clipped, or small at
  either desktop or phone width.
- Colour is used only where it means something: the focus colour on the row answering each step's
  question, red/white on the Prove It predict's wrong/right answer blocks.
- The caption (`fig`) matches the picture on every step.
- Three takeaways present (steps 5, 7, 8), all phrased within the 20-word limit after the build's
  own word-count check caught two over-length ones on the first pass.

Everything here is green. Committing.
