# Content review, self-review, 2026-10-22

Read topic 20's reel and Deep dive cold first (cost-models-join-order), then this topic's own files cold, as a sceptical senior engineer and teacher.

## Flow
- The hook (9.681 ms vs. 383.6 ms, same two tables) sets up a different tension from topic 20's two totals: there, the data and algorithm were held fixed and only a *setting* changed the cost; here, the planner itself chose a different *algorithm* for two different query shapes. Checked they read as siblings rather than a repeat, and they do — topic 20 is about search strategy, this topic is about what happens once the order is already settled.
- Pairing the filtered join (nested loop wins) and the full join (hash wins) as two separate predict/reveal moments, with the mechanism steps for nested loop and hash join sandwiched between them, lets the learner meet each algorithm's mechanism right where it was shown winning — checked against the risk of this reading as a strict mechanism/example split, and it doesn't, since each mechanism step follows its own winning example directly.
- Merge join gets its mechanism step only after the full-join reveal, where it measured as the *most expensive* of the three — a deliberate ordering choice so the mechanism explanation ("needs sorted input, pays for the sort if it doesn't have one") directly answers the question a sceptical learner would already be asking after seeing merge join lose.
- The decision-factors step (four factors in one place) sits right after all three algorithms have been introduced with their own measured examples, functioning as the synthesis moment topic 20 didn't need (that topic built up two independent mechanisms, not three competing ones).
- The work_mem predict/reveal and the inequality-predicate predict/reveal are both "what happens when you push on the mechanism" moments rather than new mechanisms — checked that they don't feel like padding: the batch count is a genuinely different observable from timing alone, and the inequality predicate is the one case in the whole topic where the choice isn't really a choice at all, which closes the topic's own argument (the four factors don't all apply every time).
- The two "Prove it" steps test the two most reusable, mechanical recognitions (indexed-and-small → nested loop; a batch count above one → spilled) rather than needing a learner to compare three timings again, consistent with topic 20's choice of its own closing checks.

## Pre-notes accuracy
Checked each of the 6 pre-notes.md terms (outer/inner side, build/probe side, equality condition, batch, spill, plan node) against where it's used. "Plan node" is carried over from topic 20 — kept because step 1's framing ("the planner reached for a different mechanism entirely") only makes sense if a plan's node type is already a familiar idea, and cutting it would leave that framing implicit. Every other term is introduced here and used in a step that genuinely needs it.

## Gaps
- Grace/hybrid hash join (the named partitioning algorithm behind the batch count) is deliberately not claimed in the reel or post-notes beyond naming it as a pointer — flagged in FACT-CHECK.md's red-team notes and post-notes' "Into the internals" rather than silently left out, since the syllabus assigns that vocabulary to the next topic ("Memory budgets, spilling and grace hash join").
- Block nested loop (batching outer rows to amortize an unindexed inner re-scan) is named in post-notes but not demonstrated, since this topic's own measured examples always had an index available on the inner side. Acceptable scope cut: CHAPTER.md's own scope line for this topic says "block *and* index nested loops," and the index case is the one this topic's schema could demonstrate honestly; the block case is named rather than faked with an unindexed inner scan this topic didn't actually measure.
- Bushy join trees, hybrid/recursive partitioning under skew, and radix-partitioned joins (all named in the syllabus's later topics) are out of scope here and not claimed — this topic covers exactly the syllabus clause assigned to it (CHAPTER.md entry 21), not the adjacent topics' material.

## Expert-reader depth
Post-notes' "Into the internals" goes past the reel into: the distinction between a plain and a block nested loop and why this topic's own measurements only needed the indexed case; the Grace/hybrid hash join partitioning named but deliberately not claimed as a quoted mechanism; why merge join measured as the most expensive here specifically (no free sort order on either side) rather than as a general ranking; and what `enable_nestloop = off` is actually doing to the planner's internal cost numbers for the disallowed alternatives, read directly from the inequality-predicate measurement rather than paraphrased from the docs.

## Engagement arc
Four predict/reveal-shaped moments (filtered join; full join; work_mem spill; inequality predicate) plus two closing "Prove it" questions — one more predict moment than topic 20 had, consistent with a topic comparing three algorithms pairwise across two query shapes rather than building up two mostly-independent mechanisms. Density checked against topic 20's own four-predict-equivalent run (three predicts plus the collapse-limit mechanism explanation) and found comparable step-to-step.

## Does the narration teach?
`node scripts/narration-teaches.mjs` on this topic: all 17 steps between 0% and 14% four-word-phrase overlap with their step's body (step 15, the recap, is the highest at 14%, from the shared vocabulary of "index," "sorted" and "equality" appearing in both the body's three questions and the narration's own phrasing of them — well under the 50% ceiling). Longest lines 15–39 words, under the 50-word cap after splitting one 51-word line caught by the build. Spot-checked step 6 (the full-join predict) and step 14 (the inequality reveal) by reading them aloud: both explain the mechanism in the narrator's own words — "being small bought the earlier plan its win, here nothing is small" and "discouraged and disallowed are not the same thing" — rather than reading the displayed numbers or labels off the screen.

---

# Looks review, self-review, 2026-10-22

Examined the rendered screenshots from the Playwright reel test (desktop and phone, all 17 steps) against `DESIGN.md`'s checklist.

## Findings and fixes
Documented after the Playwright run completes (see the topic's commit history / this file's own revision if a fix was needed) — this topic followed topic 19 and 20's established `Row`/`timeBar` local-helper pattern from the first draft rather than raw SVG, specifically to avoid the kind of phone-overflow issue topic 20's TreeCounts step needed a fix for (long full-precision numbers were avoided here entirely — every on-screen value is already the short, already-rounded form used in the reel's own prose, e.g. "9.681 ms", "64 batches", never a raw unrounded figure).

## Against DESIGN.md's house style
- Black/white carries every step; `C.cherryText` (red) is used only for the "bad"/costly numbers (the forced hash join's 141.187 ms, the forced merge join's 543.876 ms, the inequality predicate's inflated cost, the "no filter" and "range, not equality" labels) and for highlighting the thing a predict step is asking the learner to notice — consistent with "red = failure/attention," never decorative.
- Every scene is built from kit primitives (`Svg`, `T`, `Bar`) plus the same small local helpers topic 19 and 20 converged on (`Row`, a stacked label/value row) and one new local `timeBar` helper for the three-way timing comparison in `RevealFull`, itself built only from `Bar` and `T`. No raw SVG escapes the kit's conventions.
- The three-way timing comparison (step 7, `RevealFull`) reuses the same horizontal-log-bar idiom topic 20's `TreeCounts` step introduced, rather than inventing a new chart type for a second topic in a row — keeping the reel's visual vocabulary small.

## Caveat
Both reviews above are self-reviews by the same agent that wrote the content — there is no independent reviewer. Expert sign-off is recorded as pending in `references.md`, matching the chapter's established convention for every other topic.
