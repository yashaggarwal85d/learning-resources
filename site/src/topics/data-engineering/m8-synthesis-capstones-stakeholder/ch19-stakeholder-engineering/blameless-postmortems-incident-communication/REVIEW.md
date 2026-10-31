# Review — de.blameless-postmortems-incident-communication

## Content review

- All 4 scope clauses mapped in coverage.json; 2 sources (InfoQ's account of Etsy's postmortem
  process, the SRE book's "Postmortem Culture" chapter) with 3 items; 10 expert items; no open
  gaps.
- `examples.py` builds a timestamped timeline, a computed impact-in-data-terms figure, and
  mechanically checks a blameless post-mortem against a person-blaming one that fails the
  identical check on multiple independent grounds.
- FACT-CHECK.md: 5 claims verified, 4 red-team questions answered, one problem-solving note (the
  originating Etsy blog post's own HTTP 403 in this sandbox, substituted with an InfoQ account by
  an Etsy engineer describing the same practice).

## Looks review

- Reel smoke test: 1 live reel at desktop and phone sizes, passed on the first run — no
  scenes.tsx layout issues this time.
- Build check caught two genuine issues on the first run, both fixed: a reel.tsx title using a
  curly apostrophe that didn't byte-match coverage.json's `at.step` (fixed to a straight
  apostrophe, consistent with the project's own gotcha about exact title/step matching), and two
  takeaways over the 20-word limit (trimmed to 17 and 18 words).
- `narration-teaches.mjs`: 0% READS THE SCREEN flags across all 9 steps.
- `test:editor`'s own failure is the known, topic-independent cloud-sandbox Playwright
  limitation; not a shipping blocker.

## Checks run

`sources.mjs check` (3/3 quotes), `examples.py` (deterministic, ran twice, identical output),
`narration-teaches.mjs` (all 9 steps pass), `check-all.mjs --skip reels,links,narration` (pass
after two fixes), `check-all.mjs --only links,narration` (pass), `check-all.mjs --only reels`
(reel smoke test passed on the first run; overall FAIL only from the known editor-test sandbox
limitation).

This is the fourth and closing topic of Chapter 19, completing the chapter and, per CHAPTER.md's
own handoff, the course's own technical arc.
