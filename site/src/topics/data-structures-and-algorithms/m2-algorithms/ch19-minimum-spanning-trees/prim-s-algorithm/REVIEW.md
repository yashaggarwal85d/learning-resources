# REVIEW: Prim's algorithm

## Pass 1 — content review

- Checked every claim in `reel.tsx` against `examples.py`'s computed output and `SOURCES.md`'s word-for-word quotes: the three Prim implementations' shared tree, order, and weight; the array version's fixed comparison count; the lazy-against-eager push counts; and the derived-against-measured crossover.
- Confirmed the eager implementation's own correctness condition (push a new entry only when a strictly cheaper edge into the tree is found) matches Sedgewick & Wayne's own description exactly, and that `examples.py`'s `prim_eager` function implements that condition literally (`w2 < key[v2]`), not an approximation of it.
- Confirmed step 6 (Prim and Dijkstra, one line apart) states the comparison correctly and narrowly: only the key differs, never claiming the two algorithms are identical in every other respect beyond this topic's own scope.
- Confirmed the crossover claim (step 10) is phrased as "the same broad range," never as an exact match, matching what `examples.py` actually found (a measured crossover of roughly fifteen hundred edges against a derived prediction of roughly five thousand, a factor-of-three gap that is expected from Big-O's own hidden constants, not an error).

## Pass 2 — build and looks review

- `check-all.mjs --skip reels,links,narration --topic ...` passed on the first attempt: no takeaway over the twenty-word limit, no digit-literalness failure (every number in `reel.tsx` is spelled out as a word), no coverage mismatch.
- While adding this topic's own `registry.ts` entry, `npx tsc --noEmit -p .` on the site surfaced a pre-existing, unrelated TypeScript error: a sibling thread's `dsa.binary-search-invariants-boundaries` entry was missing the required `section` field on its `chapter` object, which blocked the whole site's TypeScript compilation. Fixed by adding `section: '16.1'` (matching the syllabus's own §16.1 "Binary search" heading), confirmed by a clean `tsc --noEmit` pass on `registry.ts` afterward.
- `check-all.mjs --only links,narration --topic ...` passed for this topic specifically: no broken links or title mismatches traced to this topic's own files (only the expected "check by hand" rate-limit note on the templated GitHub "open an issue" link, present on every topic's `references.md`, and the pre-existing, unrelated site-wide noise already documented from prior topics). Narration reports "not generated" as expected for a newly-shipped topic awaiting the GPU narration pass.
- `check-all.mjs --only reels --topic ...` reported a passing reel smoke test at zero live reels, correct since this topic ships `held` (chapters 16-18 are still being built by other threads, so the sequential-live gate holds chapter 19 back regardless of this topic's own content).
- `npx tsc --noEmit` on `scenes.tsx` initially failed with two "argument not assignable" errors from the `cell()` helper's own default-parameter type inference (the same pattern already fixed on topic 67's `edgeLine`/`vertex` helpers). Fixed by adding explicit `string` type annotations to `cell()`'s `colour` and `labelColour` parameters.
- `scenes.tsx`'s `EagerPrim` component originally computed its "outside the tree" vertex list with a convoluted one-line expression mixing `.find()` and `.flatMap()` in a way that was hard to verify correct by inspection. Simplified to build an explicit `Set` of in-tree vertices first, then filter against it — same result, legible.

## Corrections applied (summary)

See `FACT-CHECK.md`'s own account of the two unrelated pre-existing bugs found and fixed while shipping (a duplicate `declared` key on topic 67, a missing `chapter.section` field here). No correction was needed to this topic's own content, numbers, or claims.
