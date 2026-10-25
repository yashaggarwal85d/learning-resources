# Review — de.serializability-strict-2pl-versus

## Content review, self-review, 2026-10-24

Read in order: `snapshot-isolation-write-skew/reel.tsx` + its `post-notes.md` (previous topic's
reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `post-notes.md`,
`pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, and the next topic's syllabus line (`CHAPTER.md`, topic 14, "Locking, deadlocks
and lock escalation").

1. **[Build, coverage] A `{deep}` reference pointed at a heading that didn't exist by that
   exact name.** `coverage.json`'s own last expert item pointed at a Deep dive section named
   "Production" while `post-notes.md`'s actual heading reads "Production failures this topic
   warns about." **Fix applied:** corrected the `{deep}` reference to the heading's exact text.
   `npm run build` passed afterward.

2. **[Build] Two takeaways exceeded the 20-word limit** on the first pass (22–23 words each).
   **Fix applied:** steps 6 and 9 both trimmed to 17–19 words apiece, verified by rebuilding
   after each edit rather than counting by eye. `npm run build` passed.

3. **[Reel smoke test] Three phone label/value rows overlapped on the first pass**: step 3's
   "read-write conflicts" / "watched, between transactions", and step 9's two contention rows
   ("two/six transactions sharing one rule" / "about half aborted" / "most of them aborted").
   **Fix applied:** shortened all three rows' label or value text. Reel smoke test passed
   afterward at both desktop and phone sizes.

4. **[Build, numbers] Checked the one number this topic's own reel.tsx shows on screen** (the
   "topic 12" reference in the file's own header comment) **against `examples.py`.** It's backed
   by `examples.py`'s own docstring, which also names "topic 12" directly, so `npm run build`'s
   own number check passed without needing a separate literal pinned purely for this purpose. No
   further fix needed.

5. **[Expert reader] Checked that reusing topic 12's exact doctors scenario is a fair, not
   repetitive, choice.** The syllabus's own outcome line for this topic (`CHAPTER.md`) asks
   directly to "rerun topic 12's write-skew scenario under `SERIALIZABLE` and observe the real
   serialization failure it now produces" — holding every variable fixed except the isolation
   level is what makes this topic's own contrast a controlled experiment, not a different
   anecdote. `FACT-CHECK.md`'s red-team item 1 checks this directly.

6. **[Expert reader] Checked that `abort_rate_rises_with_contention` actually measures SSI's own
   dangerous-structure detection, not an ordinary row-level write-write conflict already covered
   in topic 12.** Confirmed by rereading the function directly: every transaction in it only ever
   writes its own row, never a row another transaction writes, so every abort comes from SSI's own
   rw-conflict tracking, not a write-write race. `FACT-CHECK.md`'s red-team item 2 checks this
   directly.

7. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook reruns topic 12's own doctors scenario directly rather than
   restating its handoff in prose. The bridge text itself (in `registry.ts`) is the verbatim
   answer to topic 12's own handoff. This topic's own handoff is the verbatim bridge
   `CHAPTER.md` gives for topic 14, confirmed by reading topic 14's own syllabus line before
   finalizing this topic's own scope (locking and deadlocks are named here only as a destination,
   never explained, matching topic 14's own ownership of that content).

8. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (snapshot isolation and write skew, isolation anomalies, a row-level lock,
   transaction/commit/rollback, a snapshot) are terms the reel assumes as background,
   cross-referenced to the specific earlier topics that taught them. Within the 4–14 bullet
   range. No fix needed.

9. **[Engagement] Arc checked end to end for a full topic.** Step 1 hooks on the direct rerun of
   topic 12's own contradiction, now resolved differently, with no mechanism named yet; one
   predict (step 4, within the first four steps); the mechanism built up through contrast across
   steps 2, 3, 5, 6, 7, 8; a surprising number (step 9, contention rising from fifty percent
   aborted to about eighty-three percent aborted, measured and stable across seven repeated
   runs); three takeaways (steps 6, 8, 9, all at or after the reel's own midpoint of step 6,
   applying the step-dot placement guard); a recap (step 10); a "Prove it" predict (step 11) that
   asks the learner to apply both routes' own real cost profile to a fresh scenario. No fix
   needed.

10. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly.** No output for
    this topic — zero flags on any of the eleven steps. No fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic serializability-strict-2pl-versus` from the
repo root (`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`). `tests/reels.mjs`
passed at both desktop and phone sizes after finding 3's fix ("Reel smoke test passed: 1 live
reel(s)"); `tests/editor.mjs` passed. Opened every screenshot in `site/test-results/` for both
`desktop-serializability-strict-2pl-versus-*` and `phone-serializability-strict-2pl-versus-*`
(steps 01–11, including the `-q` predict-card variants for steps 4 and 11) and judged each
against `DESIGN.md`.

1. **Colour discipline.** Black and white carry every step; the pale focus colour marks only the
   correct half of each label/value row and each predict step's correct framing, never
   decorative. No red appears outside the predict cards' own standard "not quite" state. Matches
   the house rule. No fix needed.

2. **Typography and kit usage.** Source Serif 4 for the headline and body, IBM Plex Sans for
   labels/chrome, JetBrains Mono for the fig caption and the `label`/`value` rows — all from the
   kit's own `Row`/`Svg`/`T` components, no raw styling. No fix needed.

3. **Every step moves.** Each `Row` fades in on its own `seg(t, ...)` window (confirmed in
   `scenes.tsx`); no step is a static frame. The hook and the predict steps use the same
   label/value pattern as every reveal step. No fix needed.

4. **Phone layout, read directly off the screenshots after finding 3's fix.** No sideways
   scroll, no clipped or overlapping text at phone width in any of the eleven steps; no takeaway
   sits before the reel's own midpoint, so no caption-height risk from the step-dot bug. No fix
   needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; both predict cards (steps
   4, 11) render both options side by side without truncation; the step index (left column)
   stays legible across all eleven entries at both desktop widths. No fix needed.

No findings required a further fix beyond what the build and test runs already forced (findings
1 through 3 above, all fixed before the reel smoke test and this looks review's own screenshots
were taken).
