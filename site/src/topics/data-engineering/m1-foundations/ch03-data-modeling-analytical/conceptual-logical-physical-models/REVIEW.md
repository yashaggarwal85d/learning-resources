# Review, 2026-10-22

## Content review

- No runnable system backs this topic (FACT-CHECK.md): it is the first refresher of Chapter 3, and every claim
  traces to one of two fetched sources (Wikipedia's "Data modeling"; G. Everest's "Conceptual vs. Logical vs.
  Physical Data Models") or is a hand-traced worked example, never a measurement. This breaks the pattern of every
  prior topic in this session, which measured a real PostgreSQL system directly.
- One predict/reveal pair (steps 3/4) sets up the plausible wrong answer that naming a relationship at the
  conceptual level already fixes its cardinality, red-teamed in FACT-CHECK.md against the source's own placement
  of cardinality at the logical level.
- The same running example (a customer who can have more than one address) carries through all three reveals
  unchanged, matching the chapter's own shared running example and isolating the level as the only variable.
- Recap ("In one breath") keeps three distinct jobs — what exists, how it is shaped, how it runs — rather than one
  vague takeaway, and hands off to the next refresher (OLTP vs. OLAP) by the exact words CHAPTER.md's own bridge
  for that topic expects.

## Looks review and fixes

- **Numbers-on-screen check:** `reel.tsx`'s fig text for the logical-level reveal read "Customer 1 — many
  Address," and no `examples.py` exists for this topic (there is nothing to execute-check — no runnable system).
  Fixed by spelling the cardinality out in words ("Customer one — many Address") instead, so the reel carries no
  digit that examples.py would need to assert. This is the first topic in this session with no `examples.py` at
  all; every other number and label in `reel.tsx` was written in words from the start for the same reason.
- **Coverage check:** the first draft mapped only one primary source and listed four expert items; the checker
  requires at least two sources and at least ten expert items. Fetched a second, independent source (G. Everest,
  University of Minnesota) and added six more expert items, each naming a specific storyboard decision rather than
  restating the syllabus clause.
- **Playwright phone/desktop overflow (three scenes):** `PredictConceptualFixesShape` (step 3, phone), the decision
  -flow reveal (step 6, phone — insufficient row spacing for three stacked rows) and the boundary-blurs reveal
  (step 7, desktop and phone) all overflowed. Fixed by shortening the specific Row label/value text in each and,
  for the three-row decision-flow scene, widening the vertical gap between rows.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic conceptual-logical-physical-models` — pass (locked, docs,
  sources, build — coverage and numbers-on-screen included, narration), after the coverage and numbers-on-screen
  fixes above.
- `node scripts/narration-teaches.mjs .../conceptual-logical-physical-models` — all 8 steps well under the
  description-overlap threshold (0%–29%).
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic.
- `node scripts/check-all.mjs --only reels --topic conceptual-logical-physical-models` — pass (desktop and phone)
  after the three Playwright fixes above; editor test pass.

## Chapter note

This is the first topic of Chapter 3 (Data Modeling and Analytical Architecture), built from the `CHAPTER.md`
published earlier this session. `node scripts/next-topic.mjs de` names the next topic once this one is live:
`de.oltp-vs-olap-workload-shapes`, the chapter's second refresher.
