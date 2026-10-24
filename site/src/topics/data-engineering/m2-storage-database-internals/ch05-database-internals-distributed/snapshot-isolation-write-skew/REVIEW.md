# Review — de.snapshot-isolation-write-skew

## Content review, self-review, 2026-10-24

Read in order: `isolation-anomalies-beyond-ansi/reel.tsx` + its `post-notes.md` (previous topic's
reel and Deep dive), then this topic's `reel.tsx`, `scenes.tsx`, `narration.json`, `post-notes.md`,
`pre-notes.md`, `prerequisites.mdx`, `registry.ts` entry, `coverage.json`, `SOURCES.md`,
`FACT-CHECK.md`, and the next topic's syllabus line (`CHAPTER.md`, topic 13, "Serializability:
strict 2PL versus SSI").

1. **[Build, coverage] A `{deep}` reference pointed at a post-notes.md heading that didn't
   exist.** `coverage.json`'s own `mytab/class/SUM` source item pointed at a Deep dive section
   named "Internals" that `post-notes.md` had titled differently on the first pass. **Fix
   applied:** renamed the post-notes.md heading to match (`## Internals`). `npm run build` passed
   afterward.

2. **[Build, narration-teaches] One narration line flagged on the first pass.** Step 6's own
   narration spoke the scene's own description sentence almost verbatim ("neither write ever
   touches the other's row, so nothing ever conflicts"). **Fix applied:** rewritten to explain
   the mechanism's own reasoning (what the commit check actually looks at, and why it has
   nothing to object to here) instead of restating the description. `node
   scripts/narration-teaches.mjs` showed zero flags afterward.

3. **[Build] Three takeaways exceeded the 20-word limit** on the first pass (22–24 words each).
   **Fix applied:** all three (steps 6, 7, 9) trimmed to 18–19 words apiece, verified by
   rebuilding after each edit rather than counting by eye. `npm run build` passed.

4. **[Reel smoke test] One phone label/value row overlapped on the first pass**: step 11's
   "shared read, separate writes" / "no error from either". **Fix applied:** shortened the value
   to "no error". Reel smoke test passed afterward at both desktop and phone sizes.

5. **[Expert reader] Checked the on-call doctors scenario's own honesty.** `FACT-CHECK.md`'s
   red-team item 2 checks directly that the scenario isn't framed as "careless application code"
   — the reel's own caption and `post-notes.md` both state that the check each doctor runs
   ("count how many are on call, go if more than one remains") is an entirely ordinary way to
   write this logic, which is exactly the point. No fix needed.

6. **[Expert reader] Checked that this topic's own three experiments are structurally distinct
   from topic 11's, not a relabeled repeat.** Topic 11's `dirty_write_blocked_by_real_locking`
   blocks a statement before it runs; this topic's own write-write-conflict experiment lets the
   statement run and fails only at commit, with a different real exception
   (`SerializationFailure`) — confirmed by rereading both `examples.py` files side by side and
   stated directly in `FACT-CHECK.md`'s red-team item 1. No fix needed.

7. **[Flow] Continuity with the previous topic and the next topic's syllabus line, both
   checked.** This topic's Hook reuses the exact doctors scenario topic 11's own "Prove it" step
   introduced as a predict, now shown as a real contradiction with its own mechanism not yet
   named — continuing directly from where topic 11 left off rather than duplicating it. The
   bridge text itself (in `registry.ts`) is the verbatim answer to topic 11's own handoff. This
   topic's own handoff is the verbatim bridge `CHAPTER.md` gives for topic 13, confirmed by
   reading topic 13's own syllabus line before finalizing this topic's own scope (strict 2PL and
   SSI are named only as a destination here, never explained, matching topic 13's own ownership
   of that content).

8. **[Pre-notes] Checked against the reel's own vocabulary assumptions.** All five bullets
   (isolation anomalies, Read Committed, a snapshot, transaction/commit/rollback,
   constraint/invariant) are terms the reel assumes as background, cross-referenced to the
   specific earlier topics that taught them. Within the 4–14 bullet range. No fix needed.

9. **[Engagement] Arc checked end to end for a full topic.** Step 1 hooks on a real contradiction
   with no mechanism named yet; two predicts (step 3, within the first four steps; step 8); the
   mechanism built up through contrast across steps 2, 4, 5, 6, 7, 9; a qualitative surprise
   (step 6, that every single check along the way passes and the invariant still breaks — this
   topic's own version of topic 11's "real engine stricter than ANSI" surprise, carried forward
   as a different kind of surprise rather than repeated); three takeaways (steps 6, 7, 9, all at
   or after the reel's own midpoint of step 6, applying the step-dot placement guard); a recap
   (step 10); a "Prove it" predict (step 11) that asks the learner to classify a fresh scenario
   using the exact distinction (caught conflict vs. write skew) this topic built. No fix needed.

10. **[Narration teaches] Checked `node scripts/narration-teaches.mjs` directly, after finding
    2's fix.** No output for this topic — zero flags on any of the eleven steps. No fix needed.

## Looks review, self-review, 2026-10-24

Ran `node scripts/check-all.mjs --only reels --topic snapshot-isolation-write-skew` from the
repo root (`PREVIEW_HELD=1` build, since this topic ships `status: 'held'`). `tests/reels.mjs`
passed at both desktop and phone sizes after finding 4's fix ("Reel smoke test passed: 1 live
reel(s)"); `tests/editor.mjs` passed. Opened every screenshot in `site/test-results/` for both
`desktop-snapshot-isolation-write-skew-*` and `phone-snapshot-isolation-write-skew-*` (steps
01–11, including the `-q` predict-card variants for steps 3, 8 and 11) and judged each against
`DESIGN.md`.

1. **Colour discipline.** Black and white carry every step; the pale focus colour is used only
   for the correct half of each label/value row and each predict step's correct framing, never
   decorative. No red appears outside the predict cards' own "not quite" state, which is the
   kit's own standard pattern, not a custom use. Matches the house rule. No fix needed.

2. **Typography and kit usage.** Source Serif 4 for the headline and body, IBM Plex Sans for
   labels/chrome, JetBrains Mono for the fig caption and the `label`/`value` rows — all from the
   kit's own `Row`/`Svg`/`T` components, no raw styling. No fix needed.

3. **Every step moves.** Each `Row` fades in on its own `seg(t, ...)` window (confirmed in
   `scenes.tsx`); no step is a static frame. The hook and both predict steps use the same
   label/value pattern as every reveal step. No fix needed.

4. **Phone layout, read directly off the screenshots after finding 4's fix.** No sideways
   scroll, no clipped or overlapping text at phone width in any of the eleven steps; no takeaway
   sits before the reel's own midpoint, so no caption-height risk from the step-dot bug. No fix
   needed.

5. **Desktop layout.** The fig caption line (top) and the label/value rows (right column) never
   collide with the left-column title/body/takeaway block at any step; all three predict cards
   (steps 3, 8, 11) render both options side by side without truncation; the step index (left
   column) stays legible across all eleven entries at both desktop widths. No fix needed.

No findings required a further fix beyond what the build and test runs already forced (findings
1 through 4 above, all fixed before the reel smoke test and this looks review's own screenshots
were taken).
