# REVIEW: Binary search on the answer

## Pass 1 — content, self-review

Read cold against the previous topic's reel (`dsa.binary-search-invariants-boundaries`), its own handoff line, and the next topic's syllabus line (search in rotated/sorted matrices), then every file of this topic in order.

- **Flow:** the bridge is topic 55's handoff word for word — the same half-open loop, invariant, and overflow-safe midpoint carried over unchanged, only the predicate's meaning changing. No concept is used before it is taught: the capacity predicate (step 3) only after the opening hook poses the packing question (step 1); the non-monotone counter-example (step 4) only after monotonicity itself is named as the search's unstated precondition (step 2); real-valued bisection (step 5) introduced as "the same idea" applied to a continuous range, not a new technique; parametric search (step 8) named only after every worked example in the topic has already been an instance of it.
- **Pre-notes:** four terms, all vocabulary the reel assumes (monotone predicate, feasibility check, bisection, precision/epsilon) and none it teaches; under the word limit.
- **Gap hunt against the syllabus line:** all three clauses covered (`coverage.json`) — monotone predicate over the answer space (steps 2–4), real-valued bisection and its iteration count (steps 5–7), parametric search (step 8). Against the expert list: the two items correctly marked `out` (the PRAM/parallel refinement, Megiddo's own running-time bound) are named once as pointers, not built — a deliberate scope boundary stated in `coverage.json` and `FACT-CHECK.md` Red team #3, not a gap.
- **Expert reader:** the non-monotone counter-example is a genuine constructed case (true, false, true, true, false), not a slow or degenerate one — the reel is explicit that the loop is wrong, not slow. The real-valued iteration-count claim is stated as exactly indifferent to what the predicate computes, matching the source's own framing. One thing flagged and fixed: the first draft assumed the non-monotone search would return index 0 by analogy with "finds the front" — tracing the actual loop showed it returns index 2 instead (`FACT-CHECK.md`, Corrections applied) — caught before it reached `OUTLINE.md`, so no incorrect claim shipped.
- **Engagement:** step 1 hooks on a concrete packing question; a predict within the first four steps (step 2); a second predict (step 6); three takeaways (steps 4, 7, 8); the recap (step 9) names the three ideas carried forward and the next topic.
- **Narration teaches:** `narration-teaches.mjs` reports low description overlap on every step; each step's narration explains *why* (why the half-open loop transfers unchanged, why a non-monotone predicate still returns something confidently, why the iteration count never mentions the predicate's cost) rather than restating the caption.

All claims in `FACT-CHECK.md`'s table are confirmed, either by word-for-word source quote (`SOURCES.md`, `sources.mjs check`: 6/6 quotes pass across both sources) or by direct computation in `examples.py` (`python3 examples.py`: all assertions pass).

## Pass 2 — looks and mechanics, self-review

- `reel.tsx`: nine steps; every literal digit (the five package weights, two trips, the answer 18, five-element non-monotone array, indices 0/2/3, √2's digits, the 20-iteration count) traced to `examples.py`. Three takeaways present on steps 4, 7, and 8; the step 8 takeaway was shortened from 21 to 19 words (colon instead of a second em-dash) to fit the twenty-word limit.
- `narration.json`: nine steps matching the reel exactly; `answer` present on both predict steps (2 and 6) and nowhere else; no unspeakable character flagged.
- `coverage.json`: all three syllabus clauses map to real step titles copied verbatim from the finalised `reel.tsx`; two sources mapped with items (Wikipedia's "Parametric search," added after the build check flagged only one source, and cp-algorithms.com's "Binary Search," fetched and verified second); a ten-item independent expert list; no open gap-review items.
- `prerequisites.mdx`: the one linked title ("Binary search invariants and boundaries") verified against `registry.ts` by exact grep before use; both reading links point to the two verified sources.
- `scenes.tsx`: the capacity-line visual (`CapacityLine`) and the non-monotone sequence panel (`BrokenPrecondition`) are the busiest frames; labels kept short (1-3 words) per the project's known phone-viewport text-overlap failure class, and `npm run build` (which includes the phone smoke test) passed clean.

`npm run build` passes with no errors (525 pages built).
