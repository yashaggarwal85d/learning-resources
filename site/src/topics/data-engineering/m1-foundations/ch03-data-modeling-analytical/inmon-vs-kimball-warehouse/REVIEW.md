# Review, 2026-10-22

## Content review

- Sixth topic of Chapter 3, the first methodology comparison rather than a measured technical
  demonstration — no runnable system exists for "which warehouse philosophy," so every claim traces
  to Inmon's, Kimball's, or Wikipedia's own text, and the three-axis synthesis plus the
  ELT-narrows-the-gap claim are explicitly marked in FACT-CHECK.md as this topic's own reasoning,
  not external citations.
- Four predict/reveal pairs (steps 4, 6, 8, 14) each set up a genuine prediction; the
  tolerance-to-change predict (step 8) is deliberately built with the honest "it genuinely depends"
  answer, following this chapter's own established pattern (topic 4's join-cost predict) rather than
  forcing a false clean verdict.
- Research could not find a live, quotable definition of Inmon's own "Corporate Information Factory"
  concept on his own sites; rather than fabricate one, this topic stays within what Wikipedia's own
  text supports (the accepted data-warehouse definition and the top-down characterization), noted
  explicitly in coverage.json's expert items.
- The ELT-on-columnar-engines claim is sourced to a general ETL-vs-ELT economics post (Fivetran) that
  does not itself name Inmon or Kimball; this topic's own synthesis connects that economics shift to
  the two methodologies' documented tradeoffs, marked as reasoning rather than citation.

## Looks review and fixes

- **Coverage check:** passed on the first draft (four sources, ten expert items, three syllabus
  clauses matching CHAPTER.md's own multi-bullet scope) — no fix needed.
- **Numbers-on-screen check:** passed on the first draft — this topic has no runnable system, so
  every quantity in `reel.tsx` is spelled in words (a dozen source systems, three axes), and
  `examples.py` was skipped entirely, per this chapter's established pattern.
- **Playwright phone overflow (two scenes, one row each):** the Inmon-definition reveal (step 2) and
  the ELT-shift reveal (step 11) each had one row overflow on phone. Fixed by shortening the specific
  Row labels and values in each.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic inmon-vs-kimball-warehouse` — pass (locked,
  docs, sources, build — coverage and numbers-on-screen included, narration) on the first run.
- `node scripts/narration-teaches.mjs .../inmon-vs-kimball-warehouse` — all 14 steps well under the
  description-overlap threshold (0%–16%).
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic's own sources.
- `node scripts/check-all.mjs --only reels --topic inmon-vs-kimball-warehouse` — pass (desktop and
  phone) after the Playwright fixes above; editor test pass.

## Chapter note

Sixth topic of Chapter 3. `node scripts/next-topic.mjs de` names the next topic once this one is
live: `de.data-vault-2-modeling` (hosts the §3.1 chapter lab).
