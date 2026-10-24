# Review — de.checkpoints-crash-recovery

## Content review, self-review, 2026-10-24

Read in order: `write-ahead-logging-fsync/reel.tsx` + `write-ahead-logging-fsync/post-notes.md`
(previous topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`,
`narration.json`, `post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line
(`CHAPTER.md`, "5. B-tree indexes in production").

1. **[Expert reader] Missing the syllabus's own term "write amplification."** The syllabus
   clause names "write amplification and full-page-write volume" directly, but step 3's original
   body described the cost only as "logging a full copy of a page more often," never using the
   term itself. **Fix applied:** reworded step 3's body in `reel.tsx` to name "write
   amplification" directly, tying the syllabus's own vocabulary to the real mechanism. Severity:
   minor (the concept was present, just not the expert's own term for it).

2. **[Gap hunt / consistency] OUTLINE.md's own takeaway placement didn't match the actual
   `reel.tsx` built from it.** The outline originally planned a takeaway on step 7 (redo vs.
   undo) and none on step 6 (the infrequent-checkpoint measurement), but the built `reel.tsx`
   ended up with a takeaway on step 6 instead, to keep all three numeric/trade-off takeaways
   together before the sourced-only steps. **Fix applied:** updated `OUTLINE.md`'s storyboard
   headings and takeaway lines to match what was actually built, so the documentation doesn't
   silently diverge from the shipped reel. Severity: minor (a documentation-only mismatch, no
   user-facing effect).

3. **[Narration teaches] Step 2's narration paraphrases the body closely rather than adding a
   distinct teaching layer.** Checked against the previous topic's own step 2 (the LSN reveal),
   which paraphrases its body in the same close way — this matches established precedent for a
   short, factual reveal step rather than being a new problem. No fix applied; flagged and
   accepted as consistent with the sibling topic's own pattern.

4. **[Predict answers] The two predict steps' answer clips didn't explicitly address why each
   wrong, tempting option fails**, as `PROJECT_PLAN.md`'s narration-persona rule requires ("the
   answer clip says why the right option is right and why each tempting option fails"). Step 4
   (torn page, three options) and step 10 ("Prove it," three options) both only explained the
   correct answer. **Fix applied:** reworded both answer clips in `narration.json` to open by
   ruling out the specific wrong options (the format-limitation and compression traps on step 4;
   the "it's about undo vs. redo" trap on step 10) before giving the real reason. Severity:
   moderate (a real narration-persona rule, not just polish).

5. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook body opens directly from `write-ahead-logging-fsync`'s own
   handoff ("a WAL that's never allowed to grow forever needs a bound...") with no abrupt jump.
   This topic's own handoff is the verbatim bridge text `CHAPTER.md` gives for the next topic
   (B-tree indexes), confirmed by reading that topic's own entry. No fix needed.

6. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (checkpoint, redo record, WAL, full-page write, transaction) are terms the reel actually uses
   without re-teaching; none carry a link, satisfying the "no links" rule. No fix needed.

7. **[Gap hunt] Syllabus clause coverage confirmed against `coverage.json`.** All three clauses
   of the full syllabus line (ARIES vs. redo-only; checkpoint-frequency trade-off; WAL as
   substrate for PITR/replication/logical decoding) map to real reel steps, and every
   `coverage.json → expert` item maps to a real step. No fix needed beyond the step-name mapping
   already corrected during the build stage (`"Predict: Prove it"` → `"Prove it"`, to match the
   actual step title in `reel.tsx`).

8. **[Engagement] Arc checked end to end.** Step 1 hooks with a real, concrete problem (why
   recovery doesn't replay forever); two predicts (steps 4 and 10, satisfying the ≥2 requirement
   for a full topic); a surprising number (close to a twenty-times/seven-times split in opposite
   directions on the same knob); three takeaways (steps 3, 5, 6); a recap that pulls all four
   threads (redo record, trade-off, redo-only design, WAL reuse) together. No fix needed.

`coverage.json → gapReview` recorded below.

## Looks review, self-review, 2026-10-24

`node scripts/check-all.mjs --only reels --topic checkpoints-crash-recovery` caught a real phone
text-overlap bug on first run (`tests/reels.mjs`'s own automated check): steps 2, 4, 9, and 10
had label/value pairs long enough to wrap to a second line on phone width and collide with the
row below. **Fix applied:** shortened the colliding label/value text in `scenes.tsx` (step 2's
`current_wal_lsn minus redo_lsn` → `the gap behind it`; step 4's `why log the whole page` →
`log the whole page?`; step 9's three Recap rows shortened; step 10's `the real answer` /
`a hidden checkpoint-like bound` → `really` / `a hidden checkpoint`), then re-ran the check until
it passed clean ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes").

Opened every screenshot in `site/test-results/` for this topic (all ten phone steps, plus
desktop step 4 as a cross-check for the three-column briefing layout) and judged each against
`DESIGN.md`'s looks-review checklist:

- **Point visible at a glance, more than colour.** Every reveal's `C.focus`-coloured row is also
  the row with the new information (the second row on a two-row reveal, the corrected answer on
  a predict step) — colour reinforces the point, it isn't the only signal. Confirmed on
  `phone-checkpoints-crash-recovery-02.png` (redo-record reveal), `-07.png` (redo vs. undo), and
  `-10.png`/`-10-q.png` (Prove it, correct option highlighted white against the wrong option's
  dark red).
- **Every step moves and lands on a teaching final frame.** Confirmed across all ten phone
  screenshots: each step's rows are mid-animation or settled at their final, legible position,
  never mid-transition or clipped.
- **Nothing crowded, clipped, or too small.** No text overlap anywhere after the fix (the
  automated check now passes); the predict steps' three-option layout (`-04.png`, `-10.png`)
  keeps each option in its own bordered box with room to breathe, matching the sibling topic's
  own two-option layout pattern scaled up to three.
- **Colour used only for meaning.** `C.focus` (the warm highlight) appears only on the row/option
  carrying the new or correct information; no decorative colour use anywhere in `scenes.tsx`.
- **Captions match.** Every screenshot's `fig` caption (top right, desktop; collapsed above the
  rows, phone) states the same question the step's `Row`s answer, confirmed step by step.
- **Desktop three-column briefing layout** (`desktop-checkpoints-crash-recovery-04.png`): step
  index on the left with the current step marked, caption and predict options in the middle,
  figure frame on the right with its own step clock — matches `PROJECT_PLAN.md`'s own desktop
  layout description exactly, no clipping or crowding.

No further findings. `coverage.json → gapReview` stands as recorded.
