# Review — de.design-docs-rfcs-adrs

## Content review

- All 4 scope clauses mapped in coverage.json; 3 sources (Nygard's ADR post, Ubl's Design Docs
  at Google, the Rust RFC README) with 6 items; 10 expert items; no open gaps.
- `examples.py` builds a structurally checked design doc and a Nygard-style ADR, then
  mechanically verifies the superseded convention (old ADR's status string, not just its
  continued presence) rather than merely asserting it.
- FACT-CHECK.md: 6 claims verified, 4 red-team questions answered, one problem-solving note
  (a quotation-mark-style mismatch in the non-goal quote, fixed by matching the source exactly).

## Looks review

- Reel smoke test: 1 live reel at desktop and phone sizes, passed on the second run.
- First run found a genuine text-overlap failure in `RevealSuperseded` (step 7): two side-by-side
  cards collided on text bounds. Fixed by stacking the two ADR cards vertically with a clear gap,
  matching the label-below-fill convention used elsewhere in this chapter.
- Takeaways (4 total, steps 4/5/6/7) manually word-counted, all within the voice's own
  `max_words_per_line` limit; `narration-teaches.mjs` reports 0% READS THE SCREEN flags across
  all 9 steps.
- `test:editor`'s own failure is the known, topic-independent cloud-sandbox Playwright
  limitation; not a shipping blocker.

## Checks run

`sources.mjs check` (8/8 quotes), `examples.py` (deterministic, ran twice, identical output),
`narration-teaches.mjs` (all 9 steps pass), `check-all.mjs --skip reels,links,narration` (pass),
`check-all.mjs --only links,narration` (pass), `check-all.mjs --only reels` (reel smoke test
passed on the second run after the text-overlap fix; overall FAIL only from the known editor-test
sandbox limitation).
