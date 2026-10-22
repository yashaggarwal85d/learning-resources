# Review — de.medallion-architecture-limits

## Content summary

13 steps covering medallion architecture's own layer contracts (Bronze: raw and as-is for
audit/lineage; Silver: conformed, "just-enough" cleansed, an enterprise view; Gold:
consumption-ready and project-specific) and its real, named failure modes: layer sprawl (forcing
data through stages it doesn't need, paying for latency and duplicated storage with no matching
benefit), fragmented accountability (different teams transforming data at different stages, so
no one clearly owns correctness), and the Silver layer specifically becoming a bottleneck from
serving consumers it was never built with. Three predicts (first at step 3, within the first
four), three takeaways, closing with a "Prove it" that asks whether a minimal one-source,
one-consumer pipeline genuinely needs all three layers.

This topic has no lab of its own (`CHAPTER.md`). Every claim traces to a direct quote: the
term's own originating vendor (Databricks) for each layer's contract, and an independently
authored critique (Modern Data 101, found via a targeted web search for independent critiques of
the pattern, confirmed not affiliated with Databricks) for the failure modes — matching
CHAPTER.md's explicit instruction to cite both.

## Sources

Databricks' own "What is Medallion Architecture?" glossary page plus Modern Data 101's "Data
Products: A Case Against Medallion Architecture." 9 quotes total, verified word for word
(`node scripts/sources.mjs check`, 0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 8, 10, 11).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, max 18%).
- No literal digits appear in `reel.tsx`'s rendered content. One build fix was needed here: the
  build's own number-check flagged "101" (from a comment mentioning "Modern Data 101," the
  critique source's name) and "2" (from a step title originally written as "Predict (index 2):
  ...", a planning convention from `OUTLINE.md` that should never have made it into the actual
  reel text) — both removed, since `examples.py` has no lab numbers to match them against.

## Fixes made during this build

- The digit-check fix above: dropped the critique source's name from the reel's own comment
  (it stays in `SOURCES.md`/`references.md`/`prerequisites.mdx` where a name is expected) and
  removed the literal "(index 2)" from the predict step's title, updating `coverage.json`'s
  matching `at.step` reference to the corrected title in the same pass.
- No coverage, takeaway-count, or step-title-mismatch fixes beyond the one above were needed —
  `coverage.json` was written with 10 expert items and `at.step` values copied from the final
  `reel.tsx` titles from the start.
- No Playwright phone/desktop text-overflow fixes were needed — `scenes.tsx` was written with the
  short 1–3-word Row label/value pattern from the start and passed clean on the first run.

## Checks run

- `node scripts/sources.mjs check` — 9/9 quotes verified word for word.
- `python3 examples.py` — pass, "medallion-architecture-limits examples: all numbers check out"
  (this topic has no lab; the two constants are this topic's own structural count of the
  convention's named layers, asserted as a fact about the convention's own definition).
- `node scripts/check-all.mjs --skip reels,links --topic medallion-architecture-limits` — pass
  (locked, docs, sources, build, narration) after the digit-check fix above.
- `node scripts/narration-teaches.mjs .../medallion-architecture-limits` — pass, all 13 steps
  under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic medallion-architecture-limits` — pass,
  Playwright desktop and phone, clean on the first run.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
