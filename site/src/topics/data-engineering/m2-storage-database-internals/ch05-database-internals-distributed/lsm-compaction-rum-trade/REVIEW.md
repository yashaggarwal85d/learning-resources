# Review — de.lsm-compaction-rum-trade

## Content review, self-review, 2026-10-24

Read in order: `lsm-trees-write-read/reel.tsx` + `lsm-trees-write-read/post-notes.md` (previous
topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`,
`post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry, `coverage.json`,
`SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line (`CHAPTER.md`, topic 10,
"ACID guarantees, precisely stated").

1. **[Build] `coverage.json`'s `expert` field used the wrong shape on the first draft.** It was
   written as a plain array of items (each carrying its own `by`/`date`/`source`), rather than the
   `{by, date, items}` object the build's own coverage checker (`src/lib/coverage.ts`) requires,
   and most items had no `at` mapping. **Fix applied:** restructured to `{by: "self-review", date:
   "2026-10-24", items: [...]}`, with every item mapped to the reel step it's taught at (or an
   `out` for the one item deliberately left unmeasured). `npm run build` passed afterward.
   Severity: build-blocking, fixed before shipping.

2. **[Build, narration-teaches] Two narration lines flagged on the first pass.** Step 9's
   ("Recap") first two lines echoed the on-screen description almost verbatim ("leveled, tiered
   and FIFO are three points on one triangle... the RUM conjecture names exactly what none of them
   can escape"). Step 6 wrote "L0" with a literal digit rather than saying it ("I configured the
   L0 file trigger to two"). **Fix applied:** step 9 rewritten to explain *why* the three styles
   sit on one trade-off rather than restate the description's own wording; step 6 rewritten to "I
   configured the trigger on the newest level, L zero, to two files." `node
   scripts/narration-teaches.mjs` ran clean afterward (no output — zero flags). Severity: build-
   blocking, fixed before shipping.

3. **[Reel smoke test] Two phone-width label/value rows overlapped on the first pass.**
   `tests/reels.mjs` (via `check-all.mjs --only reels`) flagged `RevealRumLab`'s step 8 row
   ("but that comparison" / "embedded vs. a network round trip") and `Recap`'s step 9 rows
   ("leveled, tiered, FIFO" / "three points on one triangle" and "the chapter's own lab" / "two
   real engines, measured") as overlapping text at phone width. **Fix applied:** shortened all
   three rows ("but that read" / "not a clean comparison"; "three styles" / "one triangle"; "the
   lab" / "two engines, measured"). Reel smoke test passed afterward at both desktop and phone
   sizes. Severity: build-blocking (test failure), fixed before shipping.

4. **[Expert reader] Checked the lab's own p99 caveat against what `examples.py` actually proves
   and what step 8 and claim 14 actually say on screen.** The reveal step's body and fig both say
   "but that's not the whole story" / "not a clean comparison" rather than presenting RocksDB's
   faster read as a clean LSM-vs-B-tree result; `FACT-CHECK.md` claim 14 and red-team item 4 both
   record the same caveat directly, not just in `post-notes.md`. No fix needed.

5. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook body opens directly from `lsm-trees-write-read`'s own handoff
   ("An LSM tree accumulates sorted runs forever unless something merges them back down..."),
   matched near-verbatim. This topic's own handoff is the verbatim bridge `CHAPTER.md` gives for
   topic 10 ("Every mechanism in this section so far lived inside one engine, on one machine...").

6. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (sorted run, L0, tombstone, amplification ratio, B-tree) are terms the reel assumes as
   background rather than teaches from scratch; the reel itself teaches compaction styles, FIFO,
   the RUM conjecture, write stalls, compaction debt, and the Postgres-vs-RocksDB lab. Within the
   4–14 bullet range. No fix needed.

7. **[Engagement] Arc checked end to end.** Step 1 hooks with the previous topic's own handoff as
   an open question; two predicts (step 4, within the first four steps, and step 10 "Prove it");
   a surprising number (step 2 — the real 3-vs-4 file-count split for the identical workload);
   three takeaways (steps 5, 6, 7, all at or after the reel's own midpoint, applying the lesson
   from `de.lsm-trees-write-read`'s own takeaway-placement fix from the start); a recap (step 9)
   that pulls the three styles, the conjecture and the lab together. No fix needed.

8. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly, after both
   fixes above.** No output for this topic — zero flags on any of the ten steps. No fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic lsm-compaction-rum-trade` from the repo root
(`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`). `tests/reels.mjs` passed at
both desktop and phone sizes after finding 3's fix ("Reel smoke test passed: 1 live reel(s)");
`tests/editor.mjs` passed. Opened every screenshot in `site/test-results/` for both
`desktop-lsm-compaction-rum-trade-*` and `phone-lsm-compaction-rum-trade-*` (steps 01–10,
including the `-q` predict-card variants for steps 4 and 10) and judged each against
`DESIGN.md`.

1. **Colour discipline.** Black and white carry every step; the pale focus colour is used only
   for the correct half of each label/value row and the predict steps' correct framing, never
   decorative. No red appears anywhere (no failure state is being shown). Matches the house rule.
   No fix needed.

2. **Typography and kit usage.** Source Serif 4 for the headline and body, IBM Plex Sans for
   labels/chrome, JetBrains Mono for the fig caption and the `label`/`value` rows — all from the
   kit's own `Row`/`Svg`/`T` components, no raw styling. No fix needed.

3. **Every step moves.** Each `Row` fades in on its own `seg(t, ...)` window (confirmed in
   `scenes.tsx`); no step is a static frame. The hook and both predict steps use the same
   label/value pattern as every reveal step rather than a bespoke layout, consistent with the
   previous topic. No fix needed.

4. **Phone layout, read directly off the screenshots after finding 3's fix.** No sideways
   scroll, no clipped or overlapping text at phone width in any of the ten steps; the longest
   headline ("Reveal: the chapter's own lab — Postgres vs. RocksDB, measured") wraps cleanly;
   takeaway text (steps 5, 6, 7) sits well clear of the step-dot row at the bottom, with no height
   difference risk since none of them sit on an early step. No fix needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; the predict cards (steps
   4 and 10) render both options side by side without truncation. No fix needed.

No findings required a further fix beyond what the build and test runs already forced (findings
1, 2 and 3 above, all fixed before the reel smoke test and this looks review's own screenshots
were taken).
