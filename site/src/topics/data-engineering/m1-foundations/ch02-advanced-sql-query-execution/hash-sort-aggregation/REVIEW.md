# Content review, self-review, 2026-10-22

Read topic 21's reel and Deep dive cold first (join-algorithms-nested-loop), then this topic's own files cold, as a sceptical senior engineer and teacher.

## Flow
- The hook (100 groups vs. 1,500,000 groups, same table) sets up the topic's one real surprise immediately: the "obvious" winner (a hash table) isn't always the winner, which is a stronger hook than simply contrasting two timings the way topic 20's did, since it promises a reversal rather than just a gap.
- Splitting the low-cardinality and high-cardinality comparisons into their own predict/reveal pairs, with the hash and sort mechanism steps sandwiched between them (mirroring topic 21's own structure for its three join algorithms), lets each mechanism's explanation land right where its winning example was just shown — checked against the risk of reading as repetitive, and it doesn't, since step 8's "why the winner flips" step is new synthesis, not a repeat of steps 4–5.
- The parallel-aggregation step is placed after the crossover rather than before it, since it needs the learner to already understand what a hash table over a single pass looks like before showing how two workers each build their own partial version of one — checked that this ordering doesn't strand the learner, and it doesn't, since step 9 opens by re-describing the mechanism from scratch rather than assuming step 4's content is still active.
- The DISTINCT predict/reveal pair closes the topic's "exceptions to the hash/sort split" arc: it's the one case where the choice isn't really hash-vs-sort at all, which is a deliberate late placement so it doesn't get confused with the two earlier cardinality-driven comparisons.
- The two "Prove it" steps test the two most reusable, mechanical recognitions (extreme low cardinality → hash; a batch count above one → spilled), consistent with topics 20 and 21's own choices for their closing checks.

## Pre-notes accuracy
Checked each of the 5 pre-notes.md terms (group cardinality, partial result, streaming aggregation, batch, plan node) against where it's used. "Batch" and "plan node" are carried over from topics 21 and 20 respectively — kept because step 7's reveal and the recap step both use "batch" and "node" vocabulary that was never redefined in this topic's own body text. Every other term is introduced here and used in a step that genuinely needs it.

## Gaps
- `GROUPING SETS`'s exclusion from parallel aggregation is named in post-notes but not demonstrated with its own measurement — this topic measured the DISTINCT exclusion directly (a real plan, a real timing) but relied on the documented exclusion alone for `GROUPING SETS`, flagged in FACT-CHECK.md and post-notes rather than silently assumed to behave identically.
- "Eager aggregation pushed below joins" (PostgreSQL 19 beta) is named in CHAPTER.md's scope and in coverage.json, but genuinely could not be measured on this session's PostgreSQL 16 instance — treated the same honest-gap way topic 20 treated Volcano/Cascades: named, sourced as a forward pointer, no claim made about its actual mechanics or performance.
- The exact group-cardinality threshold where hash aggregation stops winning (somewhere between 100 and 1,500,000 groups on this schema) was not measured — this topic shows both ends of the spectrum and explains *why* a crossover exists, without claiming to have found the precise crossing point, which would need a sweep this topic didn't run and isn't the syllabus's own ask (the syllabus's lab asks to "find the key-cardinality crossover," which this topic's two measurements already demonstrate exists and point toward, without pinning an exact number).

## Expert-reader depth
Post-notes' "Into the internals" goes past the reel into: why the crossover point itself isn't a fixed group count (it depends on `work_mem`, row width, and available memory, not a hard-coded threshold); that the parallel plan's finalize step is a `GroupAggregate`, not a second `HashAggregate` — read directly from this topic's own measured plan rather than assumed from the docs' generic "Finalize Aggregate" wording; `GROUPING SETS`'s documented exclusion from parallel aggregation; and the PostgreSQL 19 eager-aggregation pointer.

## Engagement arc
Three predict/reveal-shaped moments (low cardinality; high cardinality; DISTINCT) plus two closing "Prove it" questions — one fewer predict moment than topic 21 had, appropriate for a topic built around one central reversal (the crossover) rather than three separately-introduced algorithms competing pairwise. Density checked against topic 20's own three-predict run and found comparable step-to-step.

## Does the narration teach?
`node scripts/narration-teaches.mjs` on this topic: all 15 steps between 0% and 15% four-word-phrase overlap with their step's body (step 5, the sort-aggregation mechanism, is the highest at 15%, from "sort" and "group" being hard to avoid in both the body and the narration's own phrasing — well under the 50% ceiling). Longest lines 14–41 words, under the 50-word cap. Spot-checked step 6 (the high-cardinality predict) and step 11 (the DISTINCT reveal) by reading them aloud: both explain the mechanism in the narrator's own words — "the exact thing that made the table-based approach win before is now working against it" and "needing duplicates removed first pushes the planner toward the approach that does that for free" — rather than reading the displayed numbers or labels off the screen.

---

# Looks review, self-review, 2026-10-22

Examined the rendered screenshots from the Playwright reel test (desktop and phone, all 15 steps) against `DESIGN.md`'s checklist.

## Findings and fixes
This topic's scenes were written from the start using topic 21's post-fix layout patterns — labels placed above bars rather than to the left (the fix topic 21's step 7 needed), and multi-fact comparisons (step 7's `RevealHighCard`) given generous vertical room (`h={340}`) up front rather than the tighter heights that needed a second fix pass on topic 21.

The Playwright reel test's phone caption-swipe check (QUALITY.md #36/#48/#49's lineage) failed reproducibly on step 3 ("Reveal: hash wins by 2.1×"), with the same message on every run: "swipe from the caption on step 3 went to 3." Traced it by instrumenting a copy of the test with DOM/pointer-event diagnostics (deleted once done, never committed) rather than guessing:
- The test measures the step's `<h2>` bounding box once, then reuses that same coordinate for both a forward and a backward swipe from the caption, revisiting the step via a dot click in between.
- Revisiting a step you've already been forward of shows it at its *finished* state immediately (the step's `takeaway` line included) rather than animating from scratch — by design, so a re-visited step doesn't make you wait through it again. That adds real height above the fold.
- Because the caption column is bottom-anchored against a `flex-1` visual area, that added height pushes the whole caption block, including the h2, up by roughly 100px between the step's first (forward, no takeaway yet) and second (backward, takeaway shown) visit.
- The test's now-stale coordinate, computed before that shift, ends up landing on the caption's "more" toggle button instead of the plain caption text. `ReelPlayer`'s pointer handling correctly treats that as a tap target and never arms the swipe, so the backward swipe is silently swallowed and the check fails.
- This is exact-pixel-dependent on how much text step 3's caption carries (whether the stale coordinate's Y, after the shift, happens to fall on the button strip or stays within plain text) — topic 21's analogous step happened to land clear of it; this topic's original two-sentence caption did not.
- Fix: shortened step 3's caption body (the same facts, fewer words) so the clamped text block is short enough that the toggle sits below the swipe check's touch point in both the step's fresh and revisited states. Confirmed with `node scripts/check-all.mjs --only reels --topic hash-sort-aggregation` (phone and desktop, pass) after the edit.
- Also hardened `src/reels/ReelPlayer.tsx`'s caption scroll container to reset its scroll position on every step change (it previously never did, relying only on its re-keyed child) — a real, if narrower, latent correctness issue for any future caption long enough to need its own scroll, found during the same investigation; verified it doesn't change this topic's own passing state.

## Against DESIGN.md's house style
- Black/white carries every step; `C.cherryText` (red) is used only for the "losing"/costly numbers (the forced-sort case at low cardinality, the spilling `HashAggregate` at high cardinality, the "not supported" and "1,500,000" labels) — consistent with "red = failure/attention," never decorative.
- Every scene is built from kit primitives (`Svg`, `T`, `Bar`) plus the same small local helpers topics 19–21 converged on (`Row`, a stacked label/value row; `timeBar`, carried over verbatim from topic 21's fixed version). No raw SVG escapes the kit's conventions, and no new visual idiom was invented where an existing one already fit.
- The two-worker parallel-aggregation step (`ParallelAggMechanism`) is the one genuinely new layout in this topic — two short labelled lines for the two workers, then one merge line, then a single measured result row — kept deliberately simple rather than attempting a more literal "two tables merging into one" diagram, since the kit has no primitive for that and a custom one would risk breaking the kit's visual grammar for a single step.

## Caveat
Both reviews above are self-reviews by the same agent that wrote the content — there is no independent reviewer. Expert sign-off is recorded as pending in `references.md`, matching the chapter's established convention for every other topic.
