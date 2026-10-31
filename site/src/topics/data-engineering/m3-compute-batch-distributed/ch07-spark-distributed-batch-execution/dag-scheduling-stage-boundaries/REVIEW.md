# REVIEW: de.dag-scheduling-stage-boundaries

## Content review, self-review, 2026-10-30

No independent reviewer ran; self-review against `.claude/skills/make-topic/SKILL.md` section 8.

1. **Flow.** Builds directly on topic 1's task-hierarchy vocabulary (job/stage/task), used but not
   re-taught. Nothing here is used before it's taught. Severity: n/a.
2. **Pre-notes.** Defines lineage graph, shuffle, pipelining, query plan — all assumed, none
   taught by the reel itself (the reel teaches the narrow/wide distinction and the cut rule, not
   these supporting terms). Severity: none found.
3. **Gap hunt.** All five syllabus clauses mapped in `coverage.json`; the "orders shuffle-map
   stages before the result stage" clause is covered only in the Deep dive (not the reel itself) —
   acceptable per the coverage rules (a post-notes heading is a valid mapping target), but flagged
   here for visibility: a future topic revisit could consider dramatizing stage *ordering*
   (shuffle-map before result) visually, not just stage *counting*. Left as `out` is not correct
   here since it's mapped, not excluded — no fix needed, noting only that it's a thinner mapping
   than the others. Severity: minor, no fix required (coverage rule satisfied).
4. **Expert reader.** The join-dependency exception (co-partitioned joins are narrow) could read as
   an omission if unstated; fixed by naming it explicitly in `coverage.json`'s expert list and
   `post-notes.md`'s internals section as a forward pointer to §7.2, rather than leaving it
   implied. Severity: addressed during drafting.
5. **Engagement.** Hook poses genuine ambiguity; two predicts (full topic requires ≥2), the first
   at step index 2 (within the first four, required); each predict's wrong answer is a real,
   tempting intuition, not a strawman; two takeaways plus the recap's restated rule. Severity: none
   found.
6. **Narration teaches.** Checked narration.json line by line against reel.tsx body text: no line
   reads the description; `node scripts/narration-teaches.mjs` initially flagged step 7 as
   near-verbatim (44%, one phrase flagged VERBATIM) — fixed by rewording that line's phrasing
   rather than just re-ordering words, re-checked, now 14% with no verbatim flag.

`coverage.json` → `gapReview` recorded with `open: []`.

## Looks review, self-review, 2026-10-30

Same `Row`/`Svg` kit primitives as the already-shipped topic 1 and the live `acid-guarantees`
refresher (consistent sizing, consistent two-column layout). Every step's final frame states its
point in words in the value column, colour (`C.focus`) marking the contrasting fact, never used
alone to carry meaning. Every `Row` fades in on a staggered `seg`/`easeOut` timed opacity — nothing
static. Caption (`fig`) matches each step's two rows. At most two rows per step except the
four-row recap (same density as topic 1's recap). The predict steps (3 and 6) reuse
`PredictGroupBy`/`RevealWideTwoStages` visuals appropriately scoped to what's on screen at that
point in the narrative. `tests/reels.mjs` (section 9, below) is the authoritative automated check
for clipping/overlap at both sizes; this review is a structural read of the SVG coordinates ahead
of that run.
