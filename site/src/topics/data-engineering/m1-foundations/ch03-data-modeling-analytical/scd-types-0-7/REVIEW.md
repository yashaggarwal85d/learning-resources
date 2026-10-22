# Review — de.scd-types-0-7

## Content summary

14 steps covering the full SCD type menu beyond Type 2: Types 0 (retain original), 1 (overwrite)
and 3 (add new attribute, the "alternate reality"), each stating what they discard compared to
Type 2; a counted gallery running the same change through Types 0, 1, 2 and 3 side by side; Type
4 (mini-dimension for a rapidly changing, shared attribute group) and Type 5 (Type 4 plus a
current Type 1 pointer); Types 6 and 7, named by Kimball's own arithmetic (6 = 2+3+1, 7 delivers
6's functionality via dual keys), with a counted update-cost contrast; a decision rule applied to
three concrete scenarios spanning the churn spectrum; a recap; and a closing "Prove it" that
routes a new scenario back to the previous topic's Type 2, not to anything new here. Three
predicts (first at step 4, within the first four), four takeaways.

This topic has no lab of its own (`CHAPTER.md`). All combinatorial and row-count numbers (nine
possible attribute combinations, five observed; a hundred-sixty wide rows against forty-five with
a mini-dimension; six rows rewritten for Type 6 against zero for Type 7) are a disclosed,
self-consistent worked scenario computed and asserted in `examples.py`, not a claim about a real
running system — stated plainly in `SOURCES.md`, `FACT-CHECK.md`, and `coverage.json`.

## Sources

Eight Kimball Group technique pages (Types 0, 1, 3, 4, 5, 6, 7) plus Design Tip #152 (Margy Ross,
2013, four quotes — the governance framing and the "4+1=5" / "2+3+1=6" / Type 7's dual-key
arithmetic). 11 quotes total, all verified word for word (`node scripts/sources.mjs check`, 0
problems).

## Build and engagement rules

- First predict is step 4 (within the first-four-steps rule).
- 4 takeaways present (above the minimum of 3).
- No narration line reads the on-screen description verbatim (`narration-teaches.mjs`: all 14
  steps under 10% overlap, well under the flag threshold).
- Every numeral on screen (0 through 7 as type numbers, plus nine, five, six, zero as the worked
  scenario's counts) traces to a literal constant in `examples.py`.

## Fixes made during this build

- **Found and fixed a real bug in `scripts/sources.mjs` (shared tooling, not a reel or registry
  file).** Its source-check cache keyed each fetched page by a URL-derived filename truncated to
  120 characters; all seven Kimball `type-N` pages share a prefix longer than that, so every one
  of them collided onto the identical cache filename — the checker was silently verifying six of
  the seven quotes against the wrong page's text. Fixed by appending an 8-character hash of the
  full URL to the cache filename, which guarantees uniqueness regardless of how long a shared
  prefix two source URLs have. Re-ran the check after the fix: 11/11 quotes verified word for
  word, each against its own correct source. This is a tooling correctness fix, not a loosened
  check — every topic's source verification is now strictly more reliable than before, including
  every topic shipped earlier in this chapter (their own checks happened to pass because they
  didn't share this long a URL prefix across sources).
- Several phone/desktop text-overflow fixes in `scenes.tsx` (steps 1, 5, 6, 7, 8, 10, 11, 12, 13,
  14 — nearly every Row label/value pair was initially too long): shortened every Row's label and
  value to 1–3 words each, re-verified with the Playwright reel test until both viewport sizes
  passed clean.
- Two takeaway strings in `reel.tsx` initially ran to 21 and 24 words against the 20-word limit;
  shortened both.

## Checks run

- `node scripts/sources.mjs check` (after the tooling fix) — 11/11 quotes verified word for word.
- `python3 examples.py` — pass, "scd-types-0-7 examples: all numbers check out".
- `node scripts/check-all.mjs --skip reels,links --topic scd-types-0-7` — pass (locked, docs,
  sources, build, narration).
- `node scripts/narration-teaches.mjs .../scd-types-0-7` — pass, all 14 steps under the
  description-overlap ceiling (max 9%).
- `node scripts/check-links.mjs` — pass, 0 broken links (pre-existing title-mismatch/blocked
  warnings on other topics, none from this one).
- `node scripts/check-all.mjs --only reels --topic scd-types-0-7` — pass, Playwright desktop and
  phone, after the label/value shortening above.

## Self-review note

All reviews in this file are self-review by the same session that wrote the content; no
independent reviewer ran. Expert sign-off: pending.
