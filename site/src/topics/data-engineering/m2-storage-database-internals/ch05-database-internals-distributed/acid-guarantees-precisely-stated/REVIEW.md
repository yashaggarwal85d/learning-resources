# Review — de.acid-guarantees-precisely-stated

## Content review, self-review, 2026-10-24

Read in order: `lsm-compaction-rum-trade/reel.tsx` + `lsm-compaction-rum-trade/post-notes.md`
(previous topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`,
`narration.json`, `post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line
(`CHAPTER.md`, topic 11, "Isolation anomalies beyond ANSI").

1. **[Build] Two takeaways exceeded the 20-word build limit on the first pass** (step 5's
   isolation takeaway at 22 words, step 6's durability takeaway at 21 words). **Fix applied:**
   trimmed both to fit (removing "a transaction is allowed to see" → "a transaction sees"; "even
   the next one" dropped from the durability line). `npm run build` passed afterward.

2. **[Build] `SOURCES.md`'s two PostgreSQL doc URLs were on one `URL:` line on the first
   draft**, which `scripts/sources.mjs`'s own parser reads as a single whitespace-delimited
   token, silently dropping the second URL. **Fix applied:** split into two separate `##` source
   sections, one URL each. `node scripts/sources.mjs check` passed afterward (10 quotes, 0
   problems).

3. **[Links] The "Consistency (database systems)" Wikipedia link 404'd in `check-links.mjs`**
   because the unescaped closing parenthesis in the URL closed the Markdown link early
   (`...Consistency_(database_systems))` — the link parser read the first `)` as the link's own
   closing bracket). **Fix applied:** percent-encoded the parentheses (`%28`/`%29`) in
   `references.md`'s own link. `node scripts/check-links.mjs` showed no issue for this topic
   afterward (`prerequisites.mdx`'s JSX `href` attribute was never affected, only the Markdown
   link in `references.md`).

4. **[Reel smoke test] Four phone/desktop label/value rows overlapped on the first pass**:
   step 2's "after the failed transfer" / "(40, 60) — unchanged", step 4's "undeclared: reserved
   <= on_hand" / "53 > 10 — committed anyway" (both desktop and phone), and step 8's "isolation,
   durability" / "as if alone, survives a crash". **Fix applied:** shortened step 2's label to
   "after", step 4's labels to "declared rule" / "undeclared rule", and split the Recap step's
   combined isolation+durability row into two separate rows (now four rows total, matching the
   4-row `h={260}` pattern already used elsewhere in this chapter). Reel smoke test passed
   afterward at both desktop and phone sizes.

5. **[Expert reader] Checked the consistency split's own precision against what `examples.py`
   actually proves.** The reveal step and narration both say the engine enforces only "declared"
   rules and the application owns the rest — not that the engine is somehow deficient. Re-read
   `examples.py`'s own `consistency_engine_vs_application`: the declared `CHECK (on_hand >= 0)`
   is genuinely blocked (an `IntegrityError` is caught and asserted), and the undeclared rule
   genuinely has no schema object referencing it at all, so the engine has no way to know it
   exists. The claim is accurate to what was measured, not overstated. No fix needed.

6. **[Expert reader] Checked the durability step's own honesty about its limits.** Neither the
   reel's own caption, the narration, nor the takeaway claims a real crash was tested — they say
   "the WAL position advances" and "a fresh connection reads the committed value," which is
   exactly what `examples.py`'s `durability_committed_is_logged_and_visible` measures, and
   `FACT-CHECK.md` claim 13 records the scope caveat directly (no safe way to kill the real
   server in this sandbox). No fix needed.

7. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook opens on a concrete crash scenario rather than restating the
   previous topic's own handoff verbatim (a refresher's hook is its own hard problem, per
   `DESIGN.md`), but the bridge text itself (in `reel.tsx`'s own comment and `registry.ts`) is
   the verbatim answer to `de.lsm-compaction-rum-trade`'s handoff. This topic's own handoff is
   the verbatim bridge `CHAPTER.md` gives for topic 11 ("Isolation is the one letter with the
   most room to be violated quietly...").

8. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (transaction, CHECK constraint, WAL, MVCC, commit/rollback) are terms the reel assumes as
   background — WAL and MVCC explicitly cross-referenced to their own §5.1 topics rather than
   re-taught — while the reel itself teaches the four letters' precise definitions and the
   consistency split. Within the 4–14 bullet range. No fix needed.

9. **[Engagement] Arc checked end to end for a refresher.** Step 1 hooks on a concrete crash
   scenario, not a definition; one predict (step 3, within the first four steps, satisfying the
   refresher's own minimum); the mechanism built up one letter at a time (steps 2, 4, 5, 6); a
   surprising number (step 7, the ten-year gap between 1973's IBM IMS and 1983's acronym); three
   takeaways (steps 5, 6, 7, all after the reel's own midpoint of step 4, applying the step-dot
   placement guard learned in §5.1's own two topics); a recap (step 8) that pulls all four
   letters together with the split named explicitly. No fix needed.

10. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly.** No output for
    this topic — zero flags on any of the eight steps. No fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic acid-guarantees-precisely-stated` from the
repo root (`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`). `tests/reels.mjs`
passed at both desktop and phone sizes after finding 4's fix ("Reel smoke test passed: 1 live
reel(s)"); `tests/editor.mjs` passed. Opened every screenshot in `site/test-results/` for both
`desktop-acid-guarantees-precisely-stated-*` and `phone-acid-guarantees-precisely-stated-*` (steps
01–08, including the `-q` predict-card variant for step 3) and judged each against `DESIGN.md`.

1. **Colour discipline.** Black and white carry every step; the pale focus colour is used only
   for the correct half of each label/value row and the predict step's correct framing, never
   decorative. No red appears anywhere. Matches the house rule. No fix needed.

2. **Typography and kit usage.** Source Serif 4 for the headline and body, IBM Plex Sans for
   labels/chrome, JetBrains Mono for the fig caption and the `label`/`value` rows — all from the
   kit's own `Row`/`Svg`/`T` components, no raw styling. No fix needed.

3. **Every step moves.** Each `Row` fades in on its own `seg(t, ...)` window (confirmed in
   `scenes.tsx`); no step is a static frame. The hook and predict step use the same label/value
   pattern as every reveal step. No fix needed.

4. **Phone layout, read directly off the screenshots after finding 4's fix.** No sideways
   scroll, no clipped or overlapping text at phone width in any of the eight steps; the Recap
   step's four rows (atomicity, isolation, durability, consistency) sit clear of each other with
   the fix applied; no takeaway sits before the reel's own midpoint, so no caption-height risk.
   No fix needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; the predict card (step 3)
   renders both options side by side without truncation. No fix needed.

No findings required a further fix beyond what the build and test runs already forced (findings
1 through 4 above, all fixed before the reel smoke test and this looks review's own screenshots
were taken).
