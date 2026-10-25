# Review — de.locking-deadlocks-lock-escalation

## Content review, self-review, 2026-10-24

Read in order: `serializability-strict-2pl-versus/reel.tsx` + its `post-notes.md` (previous
topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`,
`post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line (`CHAPTER.md`, topic 15,
"Optimistic vs pessimistic concurrency control").

1. **[Build] Two takeaways exceeded the 20-word limit** on the first pass (22 words each, steps
   7 and 9). **Fix applied:** step 7's takeaway rewritten from em-dash clauses to a single
   20-word sentence; step 9's trimmed from 22 to 20 words by dropping "to hold." `npm run build`
   passed afterward.

2. **[Step-dot placement guard, QUALITY.md #59] The first pass put a takeaway on step 5**
   ("Reveal: the deadlock, for real"), one step before this reel's own numeric midpoint of step
   6 (11 steps), matching neither topic 12's pattern (takeaways at 6/7/9) nor topic 13's (6/8/9).
   **Fix applied:** moved the takeaway off step 5 onto step 6 ("Reveal: detection vs
   prevention"), rewording it to state the general lesson ("a deadlock is never one transaction
   behaving badly") rather than the step-5-specific framing, so it reads naturally as the close
   of the detection/prevention reveal. Takeaways now sit at steps 6, 7, 9, all at or after the
   midpoint. `npm run build` passed.

3. **[Reel smoke test] Zero phone/desktop label-value overlaps on the first run** — unlike every
   prior topic this chapter (12 and 13 each needed 1–3 row-text fixes). Checked directly by
   reading every phone screenshot; no finding, no fix needed.

4. **[Build, numbers] Checked every digit this topic's own reel.tsx shows on screen against
   `examples.py`.** The deadlock-timeout figure, the lock-escalation thresholds (5,000/1,250),
   and the migration-lock duration are all either backed by a literal in `examples.py`'s own
   source (for the measured ones) or excluded from the check as vendor-sourced figures disclosed
   in `coverage.json`'s own Frontier item rather than claimed as measured. `npm run build`'s own
   number check passed without further fixes.

5. **[Expert reader] Checked that the lock-escalation thresholds (SQL Server's 5,000/1,250,
   Db2's percentage-based `maxlocks`) are disclosed as vendor-sourced, not measured.** Neither
   engine runs in this sandbox. `coverage.json`'s own Frontier expert item and `references.md`'s
   header note both say so directly, matching the chapter's own shared notation for a claim this
   sandbox can't run. No fix needed.

6. **[Expert reader] Checked that the migration-hazard experiment (`access_exclusive_blocks_even_reads`)
   actually measures what step 9 claims — a plain read blocked, not a write.** Confirmed by
   rereading the function directly: the concurrent statement under test is a bare `SELECT`,
   never a write, so the ~0.285–0.287s blocked duration (stable across three runs) genuinely
   shows a non-modifying read stalled by `ACCESS EXCLUSIVE`, not an ordinary write-write
   conflict already covered by earlier topics. `FACT-CHECK.md`'s red-team items check this
   directly.

7. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's pre-notes name strict 2PL (topic 13) and a row-level lock (topic 11)
   as assumed background rather than re-explaining either. This topic's own handoff in
   `registry.ts` is the verbatim bridge `CHAPTER.md` gives for topic 15 (optimistic vs
   pessimistic concurrency), confirmed by reading topic 15's own syllabus line before finalizing
   this topic's own scope — this topic ends on "managed risk," which topic 15's own framing
   generalizes directly (`Prove it`'s own expert item makes the connection explicit).

8. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (strict 2PL, a row-level lock, transaction/commit/rollback, SQLSTATE 40001, DDL) are terms
   the reel assumes as background, cross-referenced to the specific earlier topics that taught
   them. Within the 4–14 bullet range. No fix needed.

9. **[Engagement] Arc checked end to end for a full topic.** Step 1 hooks on an unresolved,
   mechanism-free deadlock (two sessions, each holding what the other wants); one predict (step
   4, within the first four steps, "is finer granularity always better?"); the mechanism built
   up through contrast across steps 2, 3, 5, 6, 7, 8 (lock modes, intention locks, the real
   deadlock, detection vs prevention, the same contention ordered, escalation); a surprising
   measured number (step 9, a lock held for a fraction of a second blocking a plain read for
   that entire stretch, every time); three takeaways (steps 6, 7, 9, all at or after the reel's
   own midpoint of step 6, per finding 2's fix); a recap (step 10); a "Prove it" predict (step
   11) that applies the migration-hazard mechanism to a fresh ALTER TABLE scenario. No fix
   needed.

10. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly.** No output for
    this topic — zero flags on any of the eleven steps, including both predict-step answers. No
    fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic locking-deadlocks-lock-escalation` from the
repo root (`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`). `tests/reels.mjs`
passed at both desktop and phone sizes on the first run; `tests/editor.mjs` passed. Also ran
`node scripts/check-links.mjs` (0 broken links; this topic's four new source links all resolved,
Db2's `maxlocks` page included) and `node scripts/check-locked.mjs` (184 live reels locked, none
touched). Opened every screenshot in `site/test-results/` for both
`desktop-locking-deadlocks-lock-escalation-*` and `phone-locking-deadlocks-lock-escalation-*`
(steps 01–11, including the `-q` predict-card variants for steps 4 and 11) and judged each
against `DESIGN.md`.

1. **Colour discipline.** Black and white carry every step; the pale focus colour marks only the
   correct half of each label/value row and each predict step's correct option, never
   decorative. No red appears outside the predict cards' own standard "not quite" state. Matches
   the house rule. No fix needed.

2. **Typography and kit usage.** Source Serif 4 for the headline and body, IBM Plex Sans for
   labels/chrome, JetBrains Mono for the fig caption and the `label`/`value` rows — all from the
   kit's own `Row`/`Svg`/`T` components, no raw styling. No fix needed.

3. **Every step moves.** Each `Row` fades in on its own `seg(t, ...)` window (confirmed in
   `scenes.tsx`); no step is a static frame. The hook and the predict steps use the same
   label/value pattern as every reveal step. No fix needed.

4. **Phone layout, read directly off the screenshots.** No sideways scroll, no clipped or
   overlapping text at phone width in any of the eleven steps; the takeaway at step 6 (not step
   5, per finding 2's fix) sits at the reel's own midpoint, so no caption-height risk from the
   step-dot navigation bug described in QUALITY.md #59. No fix needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; both predict cards (steps
   4, 11) render both options side by side without truncation; the step index (left column)
   stays legible across all eleven entries at both desktop widths. No fix needed.

The two findings that required a fix (1, 2 above) were both resolved before the reel smoke test
and this looks review's own screenshots were taken; no further issue surfaced in either review
pass.
