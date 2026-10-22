# Content review, self-review, 2026-10-22

Read topic 19's reel and Deep dive cold first (cardinality-estimation-statistics), then this topic's own files cold, as a sceptical senior engineer and teacher.

## Flow
- The hook (two totals, 23,837.70 vs. 1,697.40) sets up the same "something should agree and doesn't" tension topic 19 used, but for a different reason — here it's the planner's own options changing, not an estimate being wrong. The two hooks read as siblings, not repeats.
- The Seq Scan formula predict/reveal pair reuses topic 19's own measured `orders` table (46,484 pages, 2,400,000 rows) rather than a fresh fixture, which both saves the learner from a new mental model and makes the handoff from topic 19 feel continuous.
- Placing "choosing a join order is also a search" (the exponential-growth step) right after the cost-formula steps, before either predict/reveal pair about collapse limits or GEQO, gives the learner the actual reason those two settings exist before showing what they do — checked against the risk of this reading as padding, and it doesn't: the measured tree counts are new content, not restated setup.
- The collapse-limit and GEQO pairs mirror each other in shape (predict a binary outcome, reveal a real measured number, then a mechanism step), consistent with the chapter's established density.
- Adding "interesting orders" as a thirteenth step, after GEQO and before the recap, was a late addition (the first coverage check caught the syllabus clause being skipped). On a cold re-read it doesn't feel bolted on: it's a genuinely different kind of planner smart — one about reusing output order, not search strategy — and the recap's three questions were written to include it rather than being left from before the addition.
- The two "Prove it" steps test the two most mechanical, reusable skills (the formula; recognizing a FROM count against a limit) rather than the more conceptual GEQO or interesting-orders material, which is the right choice for a closing check — those two are closer to "always applicable" than "today I learned."

## Pre-notes accuracy
Checked each of the 7 pre-notes.md terms (Plan node, Arbitrary cost units, FROM item, Search space, Planning time vs. execution time, Heuristic search, Selectivity) against where it's used. "Selectivity" is the one carried over from topic 19 rather than introduced here — kept because the collapse-limit demo's filtered table only makes sense with it, and cutting it would leave an undefined term in step 6's body. Every other term is used in a step that genuinely needs it; none are defined and then unused.

## Gaps
- Bushy vs. left-deep join trees (part of what the brute-force-verified tree count actually counts) is named only in post-notes, not in the reel. Checked whether this leaves a gap: the reel's own claim ("28.2 trillion possible orders") doesn't depend on the distinction, and forcing it into a 15-step reel would cost a step for a detail that doesn't change any of this topic's measured numbers. Acceptable scope cut, flagged rather than silently dropped.
- Volcano/Cascades is named in the syllabus and in CHAPTER.md's scope but could not be backed by a quotable primary source in this session (see FACT-CHECK.md's red-team notes). The reel makes no claim about it; post-notes names it only as further reading. This is a real gap in this topic's coverage of its own syllabus line, left open rather than filled with an unverified claim.
- The System R dynamic-programming mechanism (subset reuse, not full-order enumeration) is explained in post-notes but the reel's own tree-count step could be read as implying the planner searches the full raw count — it doesn't, it searches a smaller DP table. Post-notes directly addresses this ("Bushy vs. left-deep... and why this topic didn't need the distinction", "What 'near-exhaustive' actually enumerates"), so an attentive reader isn't misled, but the reel step itself doesn't carry that caveat. Judged acceptable: the reel's own claim (the raw count, verified) is true and clearly scoped to "possible join orders," not "what the DP table holds."

## Expert-reader depth
Post-notes' "Into the internals" goes past the reel into: how System R's DP table reuses subsets rather than enumerating every order, the bushy-vs-left-deep distinction, the structural (not just time-based) effect of from/join_collapse_limit, and GEQO's own documented doubt about fitting a TSP-style genetic algorithm to query optimization — a detail this topic found in the fetched source but chose not to put in the reel itself, since it's a caveat about GEQO's design philosophy rather than something with its own measured number.

## Engagement arc
Three predict/reveal-shaped moments (Seq Scan formula, collapse limit, GEQO) plus two closing "Prove it" questions — one more predict moment than topic 19 had, which fits a topic that introduces three somewhat independent mechanisms (cost formula, collapse limit, GEQO) rather than one extended idea. Density checked against topic 19's steps 4-8 (its densest run) and found comparable step-to-step.

## Does the narration teach?
`node scripts/narration-teaches.mjs` on this topic: all 15 steps between 0% and 11% four-word-phrase overlap with their step's body, well under the 50% ceiling; longest lines 16-38 words, under the 50-word cap. Spot-checked step 10 (the planning-time reveal) and step 12 (interesting orders) by reading them aloud: both explain the mechanism in the narrator's own words rather than reading the displayed numbers off the screen.

---

# Looks review, self-review, 2026-10-22

Examined the rendered screenshots from the Playwright reel test (`site/test-results/`, both desktop and phone, all 15 steps) against `DESIGN.md`'s checklist.

## Findings and fixes
1. Step 5 (TreeCounts, join-order counts): the full-precision count for 14 tables (`64,764,752,532,480,000`, 23 characters) ran outside the drawing on phone, where `--svg-text-scale` renders it larger than desktop. **Fixed**: switched the on-screen labels to the same rounded form the reel's own narration and body text already use ("17.3 million", "28.2 trillion", "64.8 quadrillion"), and widened the gap between the bar track and its label. Re-ran the full desktop+phone check after the fix: **pass** — "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes," 263.5s. No other contrast, overlap or overflow findings at either size, on the first run.

## Against DESIGN.md's house style
- Black/white carries every step; `C.cherryText` (red) is used only for the "bad"/costly numbers (the forced bad join order, the no-index Sort cost) and for the filtered table's highlight in the collapse-limit diagram — consistent with "red = failure," never decorative.
- Every scene is built from kit primitives (`Svg`, `T`, `Bar`, `Plot`) plus one small local helper (`Row`, a stacked label/value row — the same pattern topic 19's looks-review fixes converged on) and one local `logBar` helper that itself only composes `Bar` and `T`. No raw SVG escapes the kit's conventions.
- The planning-time curve (step 10) uses the kit's `Plot` component with its own point-reveal motion rather than a custom animation, keeping the reel's one new visual idiom (a log-scaled bar chart, step 5) to the single step that actually needs it.

## Caveat
Both reviews above are self-reviews by the same agent that wrote the content — there is no independent reviewer. Expert sign-off is recorded as pending in `references.md`, matching the chapter's established convention for every other topic.
