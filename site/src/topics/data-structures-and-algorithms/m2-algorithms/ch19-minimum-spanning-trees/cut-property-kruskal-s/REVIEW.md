# REVIEW: Cut property and Kruskal's algorithm

## Pass 1 — content review

- Checked every claim in `reel.tsx` against `examples.py`'s computed output and `SOURCES.md`'s word-for-word quotes: the cut property, the cycle property, the five accepted/five rejected Kruskal split, the eighty-nine/fifty-five spanning-tree counts, the unique minimum at eleven against a next-best of twelve, the four-way tie-trap, the MST-against-shortest-path gap of one, and the negative-weight invariance all match the computed numbers exactly.
- Found a real bug during this pass: `examples.py`'s cut-property demonstration asserted the lightest crossing edge for the cut `S = {"A", "C"}` was `("A", "C", 2)`, but A–C is internal to S, not a crossing edge. Running the script raised an `AssertionError`. Fixed by identifying the actual lightest crossing edge, `("C", "D", 1)`, and updating the assertion and `reel.tsx`'s own step text to match (the step already described the correct general mechanism; only the specific edge named in `examples.py` was wrong).
- Confirmed the tie corollary (step 6's predict) is stated correctly: the proof only needs *a* lightest crossing edge, not the unique one, which is why the tie-trap (step 9) can show four distinct minimum trees without contradicting the cut property.
- Confirmed the negative-weights claim (step 12) is scoped correctly against Dijkstra's own requirement for non-negative weights, named explicitly as the contrast, not left implicit.

## Pass 2 — build and looks review

- `check-all.mjs --skip reels,links,narration --topic ...` first failed at the build stage: three takeaways (26, 22, 24 words) exceeded the project's 20-word limit. Shortened all three; the stage then passed clean.
- `check-all.mjs --only links,narration --topic ...` passed for this topic specifically: no broken links, no title mismatches, and no coverage issues traced to this topic's own files. The three site-wide broken links and ninety-nine title mismatches reported are pre-existing, confirmed unrelated to this topic (they span Rust, Data Engineering and other DSA topics' own `prerequisites.mdx` files, untouched by this build). Narration reports "not generated" as expected for a newly-shipped, not-yet-narrated topic.
- `check-all.mjs --only reels --topic ...` reported "Reel smoke test passed: 0 live reel(s)", correct since this topic ships `held` (Chapters 16–18 are not yet live, so the sequential-live gate holds Chapter 19 back regardless of this topic's own content). The accompanying `test:editor` failure is the documented, sandbox-only popup-handling limitation, unrelated to any topic's content.
- `npx tsc --noEmit` on `scenes.tsx` initially failed with five "argument not assignable" errors, caused by TypeScript inferring a too-narrow literal type for `colour`/`vertexColour`/`edgeColour` default parameters from their default values. Fixed by adding explicit `string` (and function-returning-`string`) type annotations to each.
- `coverage.json` step strings and `reel.tsx` title strings were copied character-for-character (not retyped) to avoid the apostrophe/escaped-quote mismatch bug class documented from prior topics; confirmed no nested escaped quotes anywhere in any title.

## Corrections applied (summary)

See `FACT-CHECK.md`'s own "Corrections applied" section for the full account of both fixes (the cut-property edge bug, the three over-length takeaways).

## Unrelated issue found and fixed while shipping

While running the build stage, `npx tsc --noEmit` (and the `check-all.mjs` build step) surfaced a pre-existing duplicate-key TypeScript error in `registry.ts` at the unrelated `de.orchestrator-architecture-scheduler` entry (two `declared:` properties on the same object, left behind by a sibling thread's merge-conflict resolution on `main`). This blocked the whole site's TypeScript compilation, not just this topic. Fixed by merging the two arrays into one `declared: ['partitioned-log-model', 'cron-and-dags-familiarity']`, confirmed by a clean `tsc --noEmit` pass (modulo this project's own pre-existing, unrelated type-definition warnings across other domains, already present on `main` before this session and out of this topic's scope).
