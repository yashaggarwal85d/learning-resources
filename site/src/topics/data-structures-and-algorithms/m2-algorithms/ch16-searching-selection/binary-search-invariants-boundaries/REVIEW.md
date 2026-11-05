# REVIEW: Binary search invariants and boundaries

## Pass 1 — content, self-review

Read cold against the previous topic's reel (`dsa.external-merge-sort`), its Deep dive, and the next topic's syllabus line (binary search on the answer), then every file of this topic in order.

- **Flow:** the bridge is topic 54's handoff word for word; the hook follows directly from it (a sorted sequence's own payoff is a cheap search). No concept is used before it is taught within this topic: `lower_bound`/`upper_bound` (step 4) are built only after the half-open invariant (step 3) is established; the overflow bug (steps 6–7) only after the midpoint is first introduced informally through the invariant discussion. Nothing here anticipates topic 56's monotone-predicate generalisation beyond the one-line handoff.
- **Pre-notes:** six terms, all vocabulary the reel assumes and none it teaches (array/index, sorted order, comparison, integer overflow, loop, invariant); no links, under the word limit.
- **Gap hunt against the syllabus line:** all four clauses covered (`coverage.json`) — half-open intervals (step 3), lower/upper bound and first/last occurrence (step 4), the overflow-safe midpoint and the 2006 bug (steps 6–7), termination by invariant (step 8). Against the expert list: the one item correctly marked `out` (random-access precondition) belongs to Chapter 2's lists, already live — not a gap, a deliberate scope boundary, same as `CHAPTER.md`'s own instruction.
- **Expert reader:** the termination argument is stated precisely (strict shrinkage of `hi - lo`, not "it gets smaller eventually"), and the overflow is reproduced on real (if small) two's-complement arithmetic rather than merely described. One thing flagged and fixed: the first draft of the iteration-count check in `examples.py` used the wrong worst-case path (see `FACT-CHECK.md` Red team #1) — caught before it reached the reel, so no incorrect claim shipped, but recorded as a genuine near-miss.
- **Engagement:** step 1 hooks on the search-cost trade from the previous topic's own handoff; a predict within the first four steps (step 2); a second predict (step 5); three takeaways (steps 4, 7, 8); the recap (step 9) pulls the three habits together and names the next topic.
- **Narration teaches:** `narration-teaches.mjs` reports 0–4% description overlap on every step, well under the flag threshold; each step's narration explains *why* (why half-open simplifies termination, why the naive line fails, why strict shrinkage alone proves termination) rather than restating the caption.

All claims in `FACT-CHECK.md`'s table are confirmed, either by word-for-word source quote (`SOURCES.md`, `sources.mjs check`: 10/10 quotes pass) or by direct computation in `examples.py` (`python3 examples.py`: all assertions pass).

## Pass 2 — looks and mechanics, self-review

- `reel.tsx`: nine steps; every literal digit traced to `examples.py` (fixed during build: `96`/`48` were computed but not asserted as literals, and a spurious `1,000,001` was reworded away); two takeaways initially needed shortening (23 and 21 words) to fit the twenty-word limit — both fixed, final lengths 18 and 17 words.
- `narration.json`: nine steps matching the reel exactly; `answer` present on both predict steps (2 and 5) and nowhere else; no unspeakable character or code-style name flagged; longest line comfortably under the fifty-word cap.
- `coverage.json`: all four syllabus clauses map to real step titles (copied verbatim from `reel.tsx` after the reel was finalised, catching two stale `deep` references to a heading named "Internals" instead of the post-notes' actual "Into the internals" — fixed before this review); two sources mapped with items; a sixteen-item independent expert list; no open gap-review items.
- `prerequisites.mdx`: both linked titles ("Merge sort", "Asymptotic notation and case analysis") verified against `registry.ts` by exact grep before use.
- `scenes.tsx`: every label at eleven units or above, comfortably clear of the project's nine-pixel floor; the eight-bit overflow panel (`ReproducedOverflow`) and the width-shrinking panel (`ProvingItEnds`) are the two busiest frames and are checked below for text collisions at the phone viewport width.
