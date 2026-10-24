# Review — de.lsm-trees-write-read

## Content review, self-review, 2026-10-24

Read in order: `vacuum-bloat-transaction-id/reel.tsx` + `vacuum-bloat-transaction-id/post-notes.md`
(previous topic's reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`,
`narration.json`, `post-notes.md`, `pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, and the next topic's syllabus line
(`CHAPTER.md`, "9. LSM compaction and the RUM trade-off").

1. **[Gap hunt] The WAL half of the syllabus's first clause was missing from the reel.** The
   syllabus line opens "WAL → memtable...", and `coverage.json` mapped it to step 2, but the
   first draft of step 2's body only described the memtable and the flush — the WAL was present
   only in `pre-notes.md` as assumed background, never actually shown as part of this topic's own
   write path. **Fix applied:** step 2's body, fig and `scenes.tsx` now open with "a write goes
   to the WAL first, for crash durability," before the memtable; narration step 2 updated the
   same way. Checked `node scripts/narration-teaches.mjs` again after the change — still clean
   (0% overlap on step 2). Severity: real gap, fixed before shipping.

2. **[Engagement, QUALITY.md #59] Takeaway placement checked against the step-dot bug guard.**
   The first draft put takeaways on steps 2 and 4 (both before the reel's own midpoint), the
   exact pattern that caused `de.vacuum-bloat-transaction-id`'s step-dot/caption-height test
   failure. **Fix applied, before any build or test ran:** moved to steps 5 (range read), 6
   (Bloom filter) and 8 (tombstone) — all at or after the midpoint — and trimmed step 5's and
   step 6's takeaway text to fit the 20-word build limit. `tests/reels.mjs` ran clean afterward
   ("Reel smoke test passed"), with no caption-swipe failure of any kind.

3. **[Gap hunt] Checked the "block indexes" half of the syllabus's second clause.** No source
   had been fetched for it after the first two RocksDB wiki pages (Overview, Bloom Filter) — a
   real gap, caught during research rather than content review (see `FACT-CHECK.md` → Problem
   Solving). A third source (`Rocksdb-BlockBasedTable-Format`) was fetched before `OUTLINE.md`
   was written, so by content-review time step 7 already taught it directly, quoted and mapped
   in `coverage.json`. No further fix needed here; logged as already resolved.

4. **[Expert reader] Checked step 6's "large majority" and step 8's "almost entirely" against
   what `examples.py` actually proves**, since the reel deliberately never puts the exact 494/6/
   250/5187/7926 figures on screen (not literals in `examples.py`'s source text, so showing them
   would fail the build's number-verification check the same way "150" did for the previous
   topic). Re-read `examples.py`'s own asserts: `useful > n * 0.9` backs "large majority";
   `tombstone_file["num_deletions"] == n // 2` and the original file's `num_entries` staying at
   its original count back "almost entirely of tombstones" and "the original file is untouched."
   Both captions are accurate to what is actually measured, not rounded up for effect. No fix
   needed.

5. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook body opens directly from `vacuum-bloat-transaction-id`'s own
   handoff ("MVCC is one family's answer to concurrent writes, and vacuum is the bill it pays
   later..."), matched close to verbatim. This topic's own handoff is the verbatim bridge
   `CHAPTER.md` gives for the next topic (LSM compaction and the RUM trade-off), confirmed by
   reading that topic's own entry, which explicitly answers this topic's handoff ("An LSM tree
   accumulates sorted runs forever unless something merges them back down...").

6. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All six bullets (WAL,
   skip list, sorted data structure, point lookup vs. range query, hash function/probabilistic
   structure, binary search) are terms the reel assumes as background rather than teaches from
   scratch; the reel itself teaches memtable pipelining, flush, newest-first point reads, merged
   range reads, the Bloom filter's own mechanism, the block index's own job, and tombstones
   (outcomes 1–4). No links present, within the 4–14 bullet range. No fix needed.

7. **[Engagement] Arc checked end to end.** Step 1 hooks with the previous topic's own handoff as
   an open question; two predicts (step 3 and step 10 "Prove it", satisfying the full-topic
   requirement, step 3 within the first four steps); a surprising number (step 6 — the large
   majority of five hundred lookups for nonexistent keys rejected in one cheap check); three
   takeaways (steps 5, 6, 8, all at or after the midpoint per finding 2); a recap (step 9) that
   pulls the write path, the read path, the filter/index pair and the tombstone together as one
   rule's five consequences. No fix needed.

8. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly, after the WAL
   fix.** All ten steps passed: description-overlap between zero and six percent, longest line
   thirty-five words (under the fifty-word limit), no verbatim flags. No fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic lsm-trees-write-read` from the repo root
(`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`). `tests/reels.mjs` passed at
both desktop and phone sizes ("Reel smoke test passed: 1 live reel(s)"); `tests/editor.mjs`
passed. Opened every screenshot in `site/test-results/` for both `desktop-lsm-trees-write-read-*`
and `phone-lsm-trees-write-read-*` (steps 01–10, including the `-q` predict-card variants for
steps 3 and 10) and judged each against `DESIGN.md`.

1. **Colour discipline.** Black and white carry every step; the pale focus colour is used only
   for the "answer" half of each label/value row and for the predict steps' correct framing,
   never decorative. No red appears anywhere (no failure state is being shown). Matches the
   house rule. No fix needed.

2. **Typography and kit usage.** Source Serif 4 for the headline and body, IBM Plex Sans for
   labels/chrome, JetBrains Mono for the fig caption and the `label`/`value` rows — all from the
   kit's own `Row`/`Svg`/`T` components, no raw styling. No fix needed.

3. **Every step moves.** Each `Row` fades in on its own `seg(t, ...)` window (confirmed in
   `scenes.tsx`); no step is a static frame. The hook and both predict steps use the same
   label/value pattern as every reveal step rather than a bespoke layout, consistent with every
   sibling topic. No fix needed.

4. **Phone layout, read directly off the screenshots.** No sideways scroll, no clipped or
   overlapping text at phone width in any of the ten steps; the longest headline ("Reveal: the
   Bloom filter, a fast no") wraps cleanly to two lines; takeaway text (steps 5, 6, 8) sits well
   clear of the step-dot row at the bottom, with no height difference risk since none of them sit
   on an early step (finding 2 above). No fix needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; the predict cards (steps
   3 and 10) render both options side by side without truncation. No fix needed.

No findings required a further fix beyond what content review already applied (findings 1 and 2
above, both fixed before the build and test ran that this looks review is based on).
