# Review, 2026-10-22

## Content review

- No runnable system backs this topic: it is a notation and structure refresher. Every claim traces to
  Wikipedia's "Entity–relationship model" or "Associative entity" articles, except the foreign-key-placement
  claim, which FACT-CHECK.md explicitly marks as reasoned (from "a column holds one value") rather than quoted.
- One predict/reveal pair (steps 4/5) sets up the plausible wrong answer that the foreign key belongs on the
  "one" side, since that side is named first in plain English; red-teamed against the actual mechanical
  constraint in FACT-CHECK.md.
- One running example (a customer, an order, a product) carries a different cardinality at each relationship —
  one-to-one, one-to-many, many-to-many — so the diagram contrast is the cardinality, not the entities.
- Recap ("In one breath") keeps three distinct claims and hands off to the next refresher (functional
  dependencies and normal forms) by the exact words CHAPTER.md's own bridge for that topic expects.

## Looks review and fixes

- **No `examples.py`:** this topic has nothing to measure. Followed the pattern established for topic 1 of this
  chapter: every step title and body spells cardinality out in words (one-to-one, one-to-many, many-to-many)
  instead of using the 1:1/1:N/M:N shorthand, so `reel.tsx` carries no digit the build's numbers-on-screen check
  would need `examples.py` to assert.
- **Coverage check:** the first draft's `coverage.json` referenced two step titles ("Reveal: the answer — the
  foreign key lives on the many side", twice) that didn't match the actual `reel.tsx` title ("Reveal: the foreign
  key lives on the many side"). Fixed by correcting the step names to match exactly.
- An early post-notes.md draft speculated that crow's-foot notation's 1976 originator, Gordon Everest, was the
  same G. Everest cited as a source in this chapter's first topic — removed, since the fetched source didn't
  confirm the identity and the claim would have gone unverified into a published page.
- **Playwright phone overflow (one scene):** the opening scene's second row overflowed on phone. Fixed by
  shortening its value text.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic er-modeling-relationship-cardinality` — pass (locked,
  docs, sources, build — coverage and numbers-on-screen included, narration), after the coverage-reference fix
  above.
- `node scripts/narration-teaches.mjs .../er-modeling-relationship-cardinality` — all 9 steps well under the
  description-overlap threshold (0%–22%).
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic.
- `node scripts/check-all.mjs --only reels --topic er-modeling-relationship-cardinality` — pass (desktop and
  phone) after the Playwright fix above; editor test pass.

## Chapter note

Third topic of Chapter 3, and the last refresher of §3.1. `node scripts/next-topic.mjs de` names the next topic
once this one is live: `de.functional-dependencies-normal-forms`, the chapter's first full (non-refresher) topic.
