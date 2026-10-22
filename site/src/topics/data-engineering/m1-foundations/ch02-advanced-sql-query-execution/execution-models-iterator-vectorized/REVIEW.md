# Content review, self-review, 2026-10-22

Read topic 23's reel (memory-budgets-spilling-grace) and this topic's own files cold, as a sceptical senior engineer and teacher.

## Flow
- The hook leads with the result, not the mechanism (the same SQL, same answer, 16.4× apart), matching every prior topic's hook pattern — it promises an explanation rather than announcing a definition.
- The three mechanisms (iterator, vectorized, compiled) are introduced in the order a reader would naturally ask "what's next, more?" — iterator first since it's what the previous 23 topics' `EXPLAIN` output has implicitly assumed all along, vectorized second as the direct fix for the diagnosed problem, compiled third as "how far can this idea go."
- The batch-size predict/reveal (steps 7–8) is placed right after vectorization is introduced, before compiling is, so the "bigger isn't always better" lesson lands on the mechanism it's actually about, not retroactively.
- Morsel-driven parallelism is placed after the three single-core models are settled, since it's an orthogonal axis (how many cores, not how each core runs the plan) — placing it earlier risked conflating "faster because vectorized" with "faster because parallel," which the topic's own measurements keep carefully separate (single-threaded numbers for the model comparison, a dedicated 1→4 thread comparison for parallelism).
- The two "Prove it" steps test the two most transferable, mechanical recognitions (row-count-per-stage as a batching signal; a scaling curve's shape as an elasticity signal), consistent with topics 20–23's own closing checks.

## Pre-notes accuracy
Checked each of the 5 pre-notes.md terms (iterator/Volcano model, vector/batch, interpretation overhead, pipeline breaker, morsel) against where it's used — all five are used by step 9 at the latest, none left orphaned. "Pipeline breaker" is introduced here rather than carried over, since no earlier topic in this chapter needed the term explicitly (though the mechanism — a sort or hash build consuming its whole input before producing output — is the same one topics 21–23 measured without naming it).

## Gaps
- No compiled query engine (HyPer, Umbra) is installed on this sandbox, so the "compiled is fastest, with a compile-latency/debuggability cost" claim is the HyPer paper's own reported result, not independently measured. Flagged explicitly in FACT-CHECK.md, in the reel's own wording ("the research system that pioneered this found," never "we measured"), and in post-notes.
- The X100 paper's vector-size sweet spot (steps 7–8) is reported from the paper directly; this sandbox has no CPU-cache-level profiler to re-derive the cache-overflow mechanism independently.
- DuckDB's own thread-scheduling internals aren't verified against the morsel-driven paper's source or DuckDB's own source code — the measured 1→4 thread scaling is real, but the topic doesn't claim DuckDB is a literal implementation of the 2014 paper's dispatcher, only that it's the same lineage (sourced from third-party write-ups, not claimed as independently confirmed).
- Velox and ClickHouse, named in the syllabus line as further vectorized engines, are named once in post-notes without being installed or measured.

## Expert-reader depth
Post-notes' "Into the internals" goes past the reel into: the X100 paper's own vector-size experiment in more technical detail (why cache residency specifically, not just "bigger is better to a point"); HyPer's specific claim that compiling blurs operator boundaries into shared code fragments (a stronger, more falsifiable claim than "compiling is also fast"); and PostgreSQL's own narrower JIT (expression-level, not whole-pipeline) as a real nuance to the "PostgreSQL = pure iterator" framing used throughout the reel.

## Engagement arc
Three main predict/reveal pairs (why the 16.4× gap; whether bigger batches always win; which of three models wins on one core) plus two closing "Prove it" checks — comparable density to topics 20–23's own three-to-five-predict runs.

## Does the narration teach?
`node scripts/narration-teaches.mjs` on this topic: all 15 steps between 0% and 37% description-overlap, under the 50% ceiling (steps 4 and 6, the iterator/vectorized mechanism steps, are the highest, from "function call," "row" and "batch" being hard to avoid on both sides when describing the same mechanism twice). Longest lines 12–39 words, under the 50-word narration cap (checked separately by the build's per-line word-count check, which passed). Spot-checked step 8 (the vector-size sweet spot reveal) and step 11 (the compile-latency trade-off reveal) by reading them aloud: both explain the mechanism and its implication in the narrator's own words ("a batch only helps as long as it still fits inside the cache it's actually processed in"; "winning on raw speed isn't the same as winning for free") rather than reading the displayed numbers or labels off the screen.

---

# Looks review, self-review, 2026-10-22

Examined the rendered output from the Playwright reel test (desktop and phone, all 15 steps) against `DESIGN.md`'s checklist.

## Findings and fixes
The first Playwright run on this topic failed with six layout problems, all in `scenes.tsx`, all on phone, none in the shared player code:

1. **`TwoCosts` (step 1), phone**: the two-bar `timeBar` layout at `h={410}` (the spacing this topic's `RevealWhatGetsSlow`-style helper needs for *three* bars, copied over without adjusting for only two) scaled its labels down to exactly 8px on phone, under the 9px minimum. Fixed by reducing to `h={370}` — the same height topic 23's two-bar `RevealNotNecessarily` scene used successfully — which scales the font up rather than down.
2. **`MorselDriven`, phone**: the same two-bar-at-h=410 problem, found and fixed the same way before the Playwright run even flagged it, by applying the step-1 fix proactively to the other two-bar scene in this topic.
3. **`HowIteratorRuns`'s closing note (step 4), phone**: "interpretation overhead — and no room left for the compiler" ran past the drawing's right edge on the narrower phone viewport. Shortened to "interpretation overhead, no room for the compiler."
4. **`Recap`'s second line (step 13), phone**: "a vectorized batch amortizes that call, if it fits the cache" was noticeably longer than its three siblings and overflowed on phone. Shortened to "a batch amortizes that call, if it fits the cache," now in line with the other three lines' length.

All four were caught by the Playwright test's overlap/overflow/min-size checks (two more were fixed proactively from the same pattern before a second run was needed), then confirmed fixed by a clean re-run: `node scripts/check-all.mjs --only reels --topic execution-models-iterator-vectorized` passes at desktop and phone sizes, and `node scripts/check-all.mjs --skip reels,links --topic execution-models-iterator-vectorized` passes locked/docs/sources/build/narration.

No change was made to `ReelPlayer.tsx` or any other shared reel code — every fix here is local to this topic's own `reel.tsx`/`scenes.tsx`.
