# Review — de.optimistic-vs-pessimistic-concurrency

## Content review, self-review, 2026-10-24

Read in order: `locking-deadlocks-lock-escalation/reel.tsx` + its `post-notes.md` (previous
topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`,
`post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line (`CHAPTER.md`, topic 16, "2PC
in production databases").

1. **[Build, coverage] The third syllabus clause failed the coverage check on the first pass.**
   `coverage.json`'s own clause text had an extra leading "and" not present in the syllabus
   line's actual wording, so the coverage check couldn't match it word for word. **Fix applied:**
   corrected the clause text to the exact syllabus substring. `npm run build` passed afterward.

2. **[Build] Two takeaways exceeded the 20-word limit** on the first pass (23 words each, steps
   7 and 9). **Fix applied:** both trimmed to 18 words apiece, verified by rebuilding after each
   edit. `npm run build` passed.

3. **[Reel smoke test] Six phone/desktop label-value row overlaps on the first run** — the
   highest count this chapter (topics 12 and 13 each needed 1-3; topic 14 needed zero): steps 2,
   6, 7, 8, 9, and 11 each had at least one row whose label-plus-value text ran long enough to
   collide at phone width, several only fully visible after a second or third rebuild once an
   earlier row's fix revealed the next one. **Fix applied:** shortened the offending label or
   value text in `scenes.tsx` for all six steps (e.g. step 6's "version-column compare-and-set" /
   "over 5,000 wasted retries" pair shortened to "the compare-and-set" / "5,000+ retries wasted";
   step 9's "an object-store table commit" / "compare-and-swap, one pointer" pair shortened to
   "an object-store commit" / "swap one pointer"), confirmed clean on `tests/reels.mjs` only
   after three successive rebuild-and-recheck rounds — this topic's own longer, more technical
   row vocabulary (full SQL clauses, hyphenated mechanism names) made the standard two-line row
   width noticeably tighter than earlier topics in this chapter.

4. **[Build, numbers] Checked every digit this topic's own reel.tsx shows on screen against
   `examples.py`.** 400 (rows), 8 (workers), 300 (increments), 2 (rows), and the references to
   "topic 14" and "topic 13" are all backed directly by `examples.py`'s own literal constants
   (`WORKERS = 8`, `OPS_PER_WORKER = 300`, `LOW_CONFLICT_ROWS = 400`, `HIGH_CONFLICT_ROWS = 2`)
   and its own module docstring, which names both prior topics by number specifically to back
   those on-screen references (the same technique topic 13 used for "topic 12"). `npm run
   build`'s own number check passed without further fixes.

5. **[Expert reader] Checked that the version-column compare-and-set is a fair, representative
   implementation of Kung & Robinson's own three phases, not a simplified stand-in.** Confirmed
   directly against the quoted source text: the lock-free `SELECT` is the read phase, the
   in-process version comparison is validation, and the conditional `UPDATE ... WHERE version =
   ...` is the write phase, succeeding only if validation passed. `FACT-CHECK.md`'s red-team item
   1 checks this directly.

6. **[Expert reader] Checked that the measured reversal is real and not a coincidence of one
   run.** Both `examples.py` functions were run 7 times total across research and tuning;
   optimistic won every single low-conflict run (8-15% faster) and pessimistic won every single
   high-conflict run (78-105% faster, 5,301-5,743 retries) — the build-enforced assertions use a
   conservative 5%/50% margin, well inside the real observed range, documented in `FACT-CHECK.md`
   claims 9-10.

7. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's pre-notes name topic 14's `FOR UPDATE` and topic 13's SSI as assumed
   background rather than re-explaining either. This topic's own handoff in `registry.ts` is the
   verbatim bridge `CHAPTER.md` gives for topic 16 (two-phase commit), confirmed by reading topic
   16's own syllabus line before finalizing this topic's own scope — "every mechanism in this
   section so far assumed one engine making one decision" is true precisely because this topic's
   own content (like every topic before it) never spans more than one engine.

8. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (`FOR UPDATE`/row-level locking, deadlocks/detection/escalation, snapshot isolation/SSI,
   transaction/commit/rollback, conflict rate) are terms the reel assumes as background,
   cross-referenced to the specific earlier topics that taught them. Within the 4-14 bullet
   range. No fix needed.

9. **[Engagement] Arc checked end to end for a full topic.** Step 1 hooks on an unresolved,
   mechanism-free collision (two checkouts, one row); one predict (step 4, within the first four
   steps, "is paying for a lock still worth it?"); the mechanism built up through contrast across
   steps 2, 3, 5, 6, 7, 8 (pessimistic, optimistic, low-conflict measured, high-conflict measured,
   why the crossover happens, a third flavor); a surprising measured number (step 6, the same
   workload and the same two strategies reversing outright, with a five-thousand-plus-retry cost
   named); three takeaways (steps 6, 7, 9, all at or after the reel's own midpoint of step 6); a
   recap (step 10); a "Prove it" predict (step 11) that applies the measured reversal to a fresh,
   time-varying scenario. No fix needed.

10. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly.** No output for
    this topic — zero flags on any of the eleven steps, including both predict-step answers. No
    fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic optimistic-vs-pessimistic-concurrency` from
the repo root (`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`) four times total,
across finding 3's six successive row-text fixes; `tests/reels.mjs` passed at both desktop and
phone sizes on the final run; `tests/editor.mjs` passed throughout. Also ran `node
scripts/check-links.mjs` (0 broken links; this topic's three new source links all resolved,
including the Kung & Robinson PDF) and `node scripts/check-locked.mjs` (184 live reels locked,
none touched). Opened every screenshot in `site/test-results/` for both
`desktop-optimistic-vs-pessimistic-concurrency-*` and `phone-optimistic-vs-pessimistic-concurrency-*`
(steps 01-11, including the `-q` predict-card variants for steps 4 and 11) after the final fix
round and judged each against `DESIGN.md`.

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

4. **Phone layout, read directly off the final screenshots after finding 3's six fixes.** No
   sideways scroll, no clipped or overlapping text at phone width in any of the eleven steps; the
   three takeaways (steps 6, 7, 9) sit at or after the reel's own midpoint, so no caption-height
   risk from the step-dot navigation bug (QUALITY.md #59). No fix needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; both predict cards (steps
   4, 11) render both options side by side without truncation; the step index (left column)
   stays legible across all eleven entries at both desktop widths. No fix needed.

The findings that required a fix (1, 2, 3 above) were all resolved before this looks review's own
final screenshots were taken; no further issue surfaced in either review pass. Finding 3 is this
topic's own notable deviation from the chapter's established pattern — six row-text fixes against
zero to three for every prior topic — attributable to this topic's own longer technical
vocabulary (full SQL clauses like `SELECT ... FOR UPDATE`, hyphenated terms like
"version-column compare-and-set" and "validate-at-commit OCC") pushing standard two-line rows
past the safe phone width more often than shorter mechanism names have in earlier topics.
