# Review — de.isolation-anomalies-beyond-ansi

## Content review, self-review, 2026-10-24

Read in order: `acid-guarantees-precisely-stated/reel.tsx` + its `post-notes.md` (previous topic's
reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `post-notes.md`,
`pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, and the next topic's syllabus line (`CHAPTER.md`, topic 12, "Snapshot isolation
and write skew").

1. **[Build] A stray, unasserted number on screen on the first pass.** Step 5's own takeaway
   draft included "...turned out to have two," with a prior version naming "written in 1992" —
   the build's own number-verification check flagged `1992` as not computed or asserted anywhere
   in `examples.py`. **Fix applied:** removed the year reference entirely from the takeaway; the
   claim doesn't need a date to land. `npm run build` passed afterward.

2. **[Build, narration-teaches] Two narration lines flagged on the first pass.** Step 3's
   question echoed its own on-screen body almost verbatim ("Do they end up enforcing the exact
   same rule?"); step 9's narration was 59% identical to its own description. **Fix applied:**
   step 3's narration rephrased to frame the same question from a different angle ("hand it to
   two separate engineers... what are the odds they agree"); step 9 rewritten to explain the
   anomaly's own mechanism (lining up every possible serial ordering and checking which final
   states are reachable) instead of restating the description's own sentence. `node
   scripts/narration-teaches.mjs` showed zero flags afterward.

3. **[Build] Two takeaways exceeded the 20-word limit**, one of them twice after a first attempted
   fix undercounted (a stray "its" and a colon-attached word both still counted toward the limit).
   **Fix applied:** step 6's and step 10's takeaways both trimmed to exactly 20 words apiece,
   verified by rebuilding after each edit rather than counting by eye. `npm run build` passed.

4. **[Reel smoke test] Three phone label/value rows overlapped on the first pass**: step 4's
   "narrow reading" / "blocks reads of aborted writes" and "broad reading" / "blocks reads before
   any decision," and step 9's "the state it saw" / "no serial order could reach it". **Fix
   applied:** shortened all three rows ("narrow" / "blocks aborted-write reads"; "broad" /
   "blocks any read before a decision"; "what it saw" / "no serial order could reach"). Reel
   smoke test passed afterward at both desktop and phone sizes.

5. **[Expert reader] Checked the dirty-write reproduction's own honesty.** Step 7's caption and
   narration both frame the real block as "a real engine being stricter than ANSI requires," not
   as "ANSI SQL is broken" — matching `FACT-CHECK.md`'s own red-team item 2, which checks this
   framing directly against Berenson et al.'s own point about locking implementations exceeding
   their own named ANSI level. No fix needed.

6. **[Expert reader] Checked that write skew's own real reproduction isn't duplicated or
   skipped.** `OUTLINE.md` and `FACT-CHECK.md` both state directly that write skew is defined
   here (step 6, A5B) but reproduced for real only in topic 12, which `CHAPTER.md` builds
   specifically around the "on-call doctors" pattern — confirmed by reading topic 12's own
   syllabus line before finalizing this topic's own scope, so the two topics' lab content doesn't
   overlap. No fix needed.

7. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook opens on a concrete, unresolved contradiction (two clean commits,
   money missing) rather than quoting the previous topic's handoff verbatim, consistent with
   `DESIGN.md`'s own hook guidance; the bridge text itself (in `registry.ts`) is the verbatim
   answer to `de.acid-guarantees-precisely-stated`'s own handoff. This topic's own handoff is the
   verbatim bridge `CHAPTER.md` gives for topic 12.

8. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (isolation, Read Committed/Repeatable Read, transaction/commit/rollback, row-level locking,
   constraint/invariant) are terms the reel assumes as background, cross-referenced to the
   specific earlier topics that taught them rather than re-taught here. Within the 4–14 bullet
   range. No fix needed.

9. **[Engagement] Arc checked end to end for a full topic.** Step 1 hooks on a real contradiction
   with no definition; two predicts (step 3, within the first four steps; step 8); the mechanism
   built up through named anomalies across steps 2, 4, 5, 6, 7, 9, 10; a surprising number (step
   7, the real measured block time showing a real engine stricter than ANSI's own minimum); three
   takeaways (steps 6, 9, 10, all at or after the reel's own midpoint of step 6, applying the
   step-dot placement guard learned in §5.1's own topics); a recap (step 11); a "Prove it" predict
   (step 12) that asks the learner to name write skew from a fresh scenario, setting up topic 12
   directly. No fix needed.

10. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly, after findings
    2 and 3.** No output for this topic — zero flags on any of the twelve steps. No fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic isolation-anomalies-beyond-ansi` from the
repo root (`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`). `tests/reels.mjs`
passed at both desktop and phone sizes after finding 4's fix ("Reel smoke test passed: 1 live
reel(s)"); `tests/editor.mjs` passed. Opened every screenshot in `site/test-results/` for both
`desktop-isolation-anomalies-beyond-ansi-*` and `phone-isolation-anomalies-beyond-ansi-*` (steps
01–12, including the `-q` predict-card variants for steps 3, 8 and 12) and judged each against
`DESIGN.md`.

1. **Colour discipline.** Black and white carry every step; the pale focus colour is used only
   for the correct half of each label/value row and each predict step's correct framing, never
   decorative. No red appears anywhere. Matches the house rule. No fix needed.

2. **Typography and kit usage.** Source Serif 4 for the headline and body, IBM Plex Sans for
   labels/chrome, JetBrains Mono for the fig caption and the `label`/`value` rows — all from the
   kit's own `Row`/`Svg`/`T` components, no raw styling. No fix needed.

3. **Every step moves.** Each `Row` fades in on its own `seg(t, ...)` window (confirmed in
   `scenes.tsx`); no step is a static frame. The hook and both predict steps use the same
   label/value pattern as every reveal step. No fix needed.

4. **Phone layout, read directly off the screenshots after finding 4's fix.** No sideways
   scroll, no clipped or overlapping text at phone width in any of the twelve steps; no takeaway
   sits before the reel's own midpoint, so no caption-height risk from the step-dot bug. No fix
   needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; all three predict cards
   (steps 3, 8, 12) render both options side by side without truncation; the step index (left
   column) stays legible across all twelve entries at both desktop widths. No fix needed.

No findings required a further fix beyond what the build and test runs already forced (findings
1 through 4 above, all fixed before the reel smoke test and this looks review's own screenshots
were taken).
