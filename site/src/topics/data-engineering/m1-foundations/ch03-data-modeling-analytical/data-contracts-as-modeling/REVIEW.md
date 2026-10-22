# Review — de.data-contracts-as-modeling

## Content summary

13 steps covering a data contract's own specified dimensions under the Open Data Contract
Standard — schema (tying business meaning and physical layout into one artifact), quality rules
(tied to that schema, not disconnected), SLAs (named, enumerated, structured values), and
ownership (an explicit named role, not an assumption). States and reasons through this topic's
own argument for enforcement at the producer boundary (CHAPTER.md's own required clause, not
directly stated by any fetched ODCS page), and honestly discloses that the specification's own
current default version has moved past the v3.1 named in this chapter's syllabus line. Three
predicts (first at step 3, within the first four), three takeaways, a genuinely new "Prove it"
scenario combining the producer-boundary and named-ownership reveals rather than restating
either alone. Versioning/breaking-change policy explicitly deferred to §11.4 per CHAPTER.md.

This topic has no lab of its own (`CHAPTER.md`). Every sourced claim traces to a direct quote
from the Open Data Contract Standard's own specification pages, fetched and quoted word for
word; the one unsourced claim (producer-boundary enforcement) is flagged clearly in
`FACT-CHECK.md` and `coverage.json` as this topic's own reasoning.

## Sources

The Open Data Contract Standard's own specification (Bitol, Linux Foundation) — the definition
page, Fundamentals, Schema, Data Quality, Service-Level Agreement, and Team pages. 11 quotes
total, verified word for word (`node scripts/sources.mjs check`, 0 problems).

## Build and engagement rules

- First predict is step 3 (within the first-four-steps rule).
- 3 takeaways present (steps 5, 7, 10).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 13
  steps well under the flag threshold, max 13%, longest line 42 words).
- No literal digits appear in `reel.tsx`'s rendered content; `examples.py` has no lab numbers to
  match against, and none were written.

## Fixes made during this build

- `sources.mjs check` initially flagged nothing — all 11 quotes passed on the first check — but
  CHAPTER.md's named version (v3.1) turned out to be stale against the actually fetched
  specification (default `apiVersion: v3.2.0`). Disclosed explicitly in `SOURCES.md`,
  `FACT-CHECK.md`, and given its own reel step (step 11) rather than silently taught as current.
- `scenes.tsx`'s `RevealOwnershipRoleQuote` scene hit a build failure: a JSX string attribute
  mixing single quotes, a literal double-quoted word ("Owner"), and an escaped apostrophe
  (`standard\'s`) is not valid JSX attribute syntax. Fixed by wrapping the string in a `{}`
  expression (`label={'...'}`) instead of a bare JSX attribute string, which does support the
  backslash escape.
- No narration, coverage, or takeaway-count fixes were needed — `coverage.json` was written with
  10 expert items and `at.step` values copied from the final `reel.tsx` titles from the start.
- No Playwright phone/desktop text-overflow fixes were needed — `scenes.tsx` was written with the
  short label/value row pattern from the start and passed clean on the first run (after the JSX
  attribute fix above).

## Checks run

- `node scripts/sources.mjs check` — 11/11 quotes verified word for word.
- `python3 examples.py` — pass, "data-contracts-as-modeling examples: all numbers check out"
  (this topic has no lab; the one constant is this topic's own structural count of the
  specification dimensions CHAPTER.md's own scope line names).
- `node scripts/check-all.mjs --skip reels,links --topic data-contracts-as-modeling` — pass
  (locked, docs, sources, build, narration) after the JSX attribute fix above.
- `node scripts/narration-teaches.mjs .../data-contracts-as-modeling` — pass, all 13 steps
  under the description-overlap ceiling.
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics only; none from this one).
- `node scripts/check-all.mjs --only reels --topic data-contracts-as-modeling` — pass,
  Playwright desktop and phone, clean after the JSX attribute fix.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
