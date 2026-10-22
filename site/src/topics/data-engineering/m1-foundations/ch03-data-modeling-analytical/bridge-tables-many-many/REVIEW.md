# Review — de.bridge-tables-many-many

## Content

- Sourced to Kimball Group's own material across three pages (Multivalued Dimensions and Bridge
  Tables, Design Tip #166 "Potential Bridge (Table) Detours", Ragged/Variable Depth Hierarchies):
  10 quotes, verified word for word by `node scripts/sources.mjs check`.
- Both halves of the topic — multivalued/weighting and ragged-hierarchy — are demonstrated on real,
  disclosed throwaway tables built for this topic on the shared sandbox, not described
  hypotheticals:
  - A real order (true total 70.00) bridged to 3 promo tags. Joined and summed unweighted, the
    amount comes back 3x over (210.00); with weights that independently sum to 1 multiplied in,
    the true total is recovered exactly.
  - A real 4-category hierarchy of genuinely uneven depth (one branch 3 levels deep, one branch a
    single leaf), flattened once via a recursive query into a 7-row bridge of ancestor-descendant
    pairs. Reading "everything under the top category" from the flattened bridge (a flat filter)
    matches exactly what an independent, fresh recursive query against the raw table finds.
- All throwaway tables were dropped immediately after the measurements were captured.
- Two predict steps (bridge-sum correctness, flattened-bridge recursion), each red-teamed against
  the plausible wrong answer, per `coverage.json`'s expert list (10 items).

## Build/engagement rules

- First predict step is step 3 (within the first four steps).
- Three `takeaway:` fields (bridge join multiplies unless stopped; weights fix it; recursion paid
  once at build time).
- Zero stray digits in `reel.tsx` — every on-screen number traces to `examples.py`; everything
  else is spelled in words.

## Note on topic id

CHAPTER.md's plan prose names this topic `de.bridge-tables-many-to-many` / folder
`bridge-tables-many-to-many`, but the syllabus-title slugifier used by `next-topic.mjs` and the
registry build drops "to", producing `de.bridge-tables-many-many` / folder
`bridge-tables-many-many` instead. Built and shipped under the generator's actual id/folder, which
is what the build system checks against.

## Checks run

`check-all.mjs --skip reels,links --topic bridge-tables-many-many` (locked, docs, sources, build,
narration) — pass, first attempt. `narration-teaches.mjs` — pass, all steps under the
description-overlap ceiling. `check-links.mjs` — pass, no broken links introduced (several Kimball
pages returned transient rate-limit blocks from this session's own repeated fetches; harmless,
check-by-hand category). `check-all.mjs --only reels --topic bridge-tables-many-many` — pass,
desktop and phone, after one round of Row-label shortening.
