# Content review, self-review, 2026-10-22

Read topic 24's reel (execution-models-iterator-vectorized) and this topic's own files cold, as a sceptical senior engineer and teacher.

## Flow
- The hook leads with a plan-shape fact (one combined join vs. four independent ones, same tables, same answer), not a definition, matching the hook pattern of every topic in this chapter.
- Partition-wise joins are established first, on a single machine, where every claim could be independently measured (`EXPLAIN`, a real spill-vs-no-spill comparison). The jump to a cluster (step 6) is framed explicitly as "take that same idea up a level," so the reader is asked to extend a mechanism they've already seen work, not absorb a new one cold.
- Exchange operators (shuffle, broadcast) are introduced only after the "what has to happen before two unaligned tables can be joined" predict (step 6), so the plan-tree vocabulary (HASH, BROADCAST) answers a question the reader has just been made to ask, rather than being handed first.
- The broadcast-threshold predict/reveal (steps 9–10) and the "co-located is partition-wise at scale" step (11) are placed after both exchange types are understood, so the reader has both options in hand before being asked to weigh them against each other.
- The two "Prove it" steps test reading a real plan's exchange-type name and reasoning about a threshold decision — the two most transferable, mechanical skills from this topic, consistent with the rest of this chapter's closing checks.

## Pre-notes accuracy
Checked each of the 5 pre-notes.md terms (partition-wise join, exchange operator, shuffle/repartition, broadcast, co-located join) against where they're used — all five appear by step 9 at the latest, none left orphaned.

## Gaps
- No real multi-machine cluster (Spark, Trino) is installed on this sandbox, so the shuffle/broadcast network-cost claims are sourced to Spark's and Trino's own documentation, not independently measured. A local single-process Spark install was attempted and deliberately abandoned — installing `pyspark` failed on this Python version, and more fundamentally a single machine has no real network boundary between "workers," so even a successful local run couldn't have honestly demonstrated the thing being taught. This is disclosed explicitly in FACT-CHECK.md, in the reel's own wording (never claiming "we measured" for the exchange-cost claims), and in post-notes.
- The partition-wise join claims (plan shape, the spill-driven speedup) are measured directly on this sandbox's PostgreSQL 16.15, and reported honestly including the case where the two plans converge under PostgreSQL's own default settings — not cherry-picked to only show the favorable case.
- Spark's AQE run-time broadcast conversion (step 10's third narration line) is sourced to Spark's documentation and not independently reproduced, since that also needs a real cluster to see the conversion actually happen rather than just being configured.

## Expert-reader depth
Post-notes' "Into the internals" goes past the reel into: the exact `enable_partitionwise_join` requirement (every partition key covered, matching types and bounds on both sides) rather than the reel's looser "same way" phrasing; why the setting defaults to off despite its measured benefit here (the same memory/planning-cost trade-off PostgreSQL's own documentation warns about); and the full reasoning for not attempting a local Spark cluster, so a reader who wonders "why didn't they just measure this" gets the actual argument rather than a silent gap.

## Engagement arc
Three main predict/reveal pairs (why partition matching ever wins; what has to happen before a cross-machine join; what happens once a broadcast side grows past the threshold) plus two closing "Prove it" checks — comparable density to topics 22–24's own predict runs.

## Does the narration teach?
`node scripts/narration-teaches.mjs` on this topic: all 15 steps between 0% and 20% description-overlap, under the 50% ceiling (step 8, the shuffle-mechanism step, is the highest, from "redistribut-" and "hash" being hard to avoid on both sides when describing the same operator twice). Longest lines 15–29 words, under the 50-word narration cap (checked separately by the build's per-line word-count check, which passed). Spot-checked step 5 (the memory-win reveal) and step 10 (the broadcast-threshold reveal) by reading them aloud: both explain the mechanism and its consequence in the narrator's own words ("the total amount of work doesn't change — how it gets divided up is what decides whether it fits in memory at all"; "past a certain size, copying something out to every machine costs more than just moving everything once, properly aligned") rather than reading displayed numbers or labels off the screen.

---

# Looks review, self-review, 2026-10-22

Examined the rendered output from the Playwright reel test (desktop and phone, all 15 steps) against `DESIGN.md`'s checklist.

## Findings and fixes
The first Playwright run on this topic failed with seven layout problems, all in `scenes.tsx`, all in content local to this topic, none in the shared player code:

1. **`RevealMemoryWin` (step 5), phone**: the row label "per-partition, 500,000 rows each" ran into its value text ("fits in memory") on the narrower phone layout. Shortened to "per-partition, 500,000 rows."
2. **`PredictAcrossMachines` (step 6), phone**: the row label "one machine, matching partitions" ran into its value text ("nothing to move"). Shortened to "one machine," moving the detail the label was carrying into the row's own value/contrast instead of a longer label.
3. **`HowShuffleWorks`'s third line (step 8), desktop and phone**: "manufacturing, over a network, the same alignment partitions already had" (74 characters) ran outside the drawing on both sizes — a hard width overflow, not just a phone-scaling issue, since it failed on desktop too. Shortened to "rebuilding what partitions already had, for free."
4. **`Recap`'s second, third, and fourth lines (step 13), phone**: three of the four recap lines were long enough to overflow the drawing's width on the narrower phone viewport, even though they fit on desktop. Shortened "across machines, a join needs an exchange unless already aligned" to "across machines, an exchange moves data first"; "a shuffle redistributes both sides; a broadcast copies the small one" to "shuffle moves both sides; broadcast copies one side"; and "the broadcast threshold is a real, sometimes run-time, switch" to "the broadcast threshold is a real, switchable line."

All seven were caught by the Playwright test's overlap/overflow checks in a single run, fixed together, then confirmed by a clean re-run: `node scripts/check-all.mjs --only reels --topic parallel-distributed-query-plans` passes at desktop and phone sizes, and `node scripts/check-all.mjs --skip reels,links --topic parallel-distributed-query-plans` passes locked/docs/sources/build/narration.

No change was made to `ReelPlayer.tsx`, `kit.tsx`, or any other shared reel code — every fix here is local to this topic's own `scenes.tsx`.
