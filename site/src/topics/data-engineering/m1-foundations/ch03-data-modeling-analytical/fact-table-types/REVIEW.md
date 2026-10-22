# Review — de.fact-table-types

## Content

- Sourced entirely to Kimball Group's own four pages on fact-table types (transaction, periodic
  snapshot, accumulating snapshot, factless): 15 quotes, verified word for word by
  `node scripts/sources.mjs check`, including the ligature characters ("workﬂow", "fulﬁllment",
  "deﬁned") copied exactly from the fetched HTML.
- All four demonstrations run on real, disclosed throwaway tables built for this topic on the
  shared sandbox, not described hypotheticals:
  - A transaction fact table (2 orders, 3 lines) summing to a real line-amount total.
  - A periodic snapshot (2 accounts, 3 days, zero activity) showing every account present every
    day, measured by `GROUP BY`.
  - An accumulating snapshot: a single row inserted once, then revisited with two real `UPDATE`
    statements as it passes shipped/delivered milestones — row count checked at exactly one
    throughout, with two real lag measures computed from the milestone dates.
  - A factless coverage table (3 students) minus a real activity table (2 students), via an actual
    `EXCEPT` query, finding the one student who did not attend.
- All throwaway tables (and the scratch schema) were dropped immediately after the measurements
  were captured.
- Four predict steps, each red-teamed against the plausible wrong answer per `coverage.json`'s
  expert list (10 items).
- The additivity verdict (how each fact type absorbs a late update) is this topic's own synthesis
  built on topic 8's additivity classes, explicitly marked as reasoning rather than a further
  Kimball quote, since no single fetched source states it in those terms.

## Build/engagement rules

- First predict step is step 3 (within the first four steps).
- Three `takeaway:` fields (periodic snapshot measured; accumulating snapshot measured; factless
  needs no measure).
- Zero stray digits in `reel.tsx` — all lag counts are spelled in words; the only digits are
  `duration` values, which the check does not scan.

## Fixes made this build

- `prerequisites.mdx` initially cited the prior topic's title as "Key design: natural, surrogate,
  durable hash" (missing a comma); the build's `Resource` check requires an exact syllabus-title
  match, so it was corrected to "Key design: natural, surrogate, durable, hash".
- The Recap narration step initially spoke the on-screen description verbatim; rewritten to a
  genuine teaching explanation of why the four shapes differ.
- One `takeaway:` was initially 21 words (over the 20-word ceiling); shortened.
- One Playwright phone overlap in `Recap`'s third row ("accumulating, factless" / "updated row; no
  measure") fixed by shortening the row to "accumulating" / "updated row".

## Checks run

`check-all.mjs --skip reels,links --topic fact-table-types` (locked, docs, sources, build,
narration) — pass. `narration-teaches.mjs` — pass, all steps well under the description-overlap
ceiling. `check-links.mjs` — pass, no broken links introduced. `check-all.mjs --only reels --topic
fact-table-types` — pass, desktop and phone.
