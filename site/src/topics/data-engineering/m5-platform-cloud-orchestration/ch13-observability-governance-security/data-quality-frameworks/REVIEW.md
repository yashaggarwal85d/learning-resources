# Review — de.data-quality-frameworks

## Content review, self-review, 2026-11-02

1. **No lab of its own; frameworks' examples run on the course's own synthetic data.** Per
   CHAPTER.md's own disclosed scope ("Lab: none of its own... frameworks' examples run on the
   shop's synthetic data... Soda and DQX sourced from their documentation and disclosed"),
   `examples.py` builds a toy dbt-style data test, unit test, incremental metric, and sample,
   rather than installing five separate real frameworks.
2. **Soda's planning-time docs path 404s now.** The `soda-v4` path read at planning time no
   longer resolves; the current docs tree lives at `/soda-documentation/`, confirmed via its
   own v3-to-v4 migration page, and used instead.
3. **Soda's version verified directly at build**, per CHAPTER.md's own instruction that the
   version wasn't confirmed at planning time: the live `soda-core` PyPI package reports
   `4.29.0`, confirming "Soda 4."
4. **GitHub 403s this sandbox's fetcher for Deequ and DQX**, as with earlier topics;
   substituted `raw.githubusercontent.com`'s identical README content, cross-confirmed against
   the rendered GitHub page.
5. **New build-check gotcha found this topic:** quoting a GitHub README's own relative-link
   Markdown syntax (`[text](path)`) in `SOURCES.md` trips the docs link-checker, which treats
   every `](...)` as a real link to check for existence. Fixed by quoting only the prose
   around the link syntax, not the bracket-paren construct itself, and moving the link targets'
   content into a plain "Contents:" description instead of a blockquote.
6. **Build check caught two unmeasured numbers on screen:** "Soda 4" (the digit wasn't
   asserted anywhere) and a comma directly after "May 2026" (the year-exemption regex). Fixed
   by adding a `SODA_CORE_VERSION` constant and an assertion in `examples.py`, and rephrasing
   the comma away from directly after the year.
7. **Phone-layout overflow on two scenes:** `RevealGateAnswer`'s freshness/drift rows and
   `Recap`'s incremental/sample row packed too much value text onto one row. Fixed by
   shortening each value to one or two words, per the established phone-overflow pattern.
8. **Gap hunt against the syllabus line:** every named framework (dbt, GX Core, Soda 4,
   Deequ/PyDeequ, DQX) and every named mechanism (gate vs. post-hoc, incremental metrics,
   sampling) is mapped across 7 of the reel's 11 steps in `coverage.json`; no part of the
   clause left unmapped.
9. **`declared: []`** matches CHAPTER.md's own "Declared: none" for this topic.
10. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
11. **Engagement:** hook at step 1; predicts at steps 3 and 8; three takeaways at steps 4, 10
    and 11 (Recap), each under the 20-word limit.

## Checks run

- `node scripts/sources.mjs check .`: 25 quotes found word for word, 0 problems (after fixing
  the markdown-link quoting issue described in item 5).
- `python3 -I examples.py`: "all claims verified" — the data-test-vs-unit-test distinction, the
  incremental-equals-full-rescan claim, the sample-misses-a-rare-row claim, and the Soda-4
  version assertion.
- `node scripts/check-all.mjs --topic .../data-quality-frameworks --only build`: 2 fixes during
  the build (the unmeasured "Soda 4" and "May 2026," numbers); clean on rebuild, 238 pages
  built.
- `node scripts/check-all.mjs --topic .../data-quality-frameworks --skip reels,links`: locked,
  docs, sources, build, narration all pass.
- `node scripts/check-docs.mjs`: all relative links and anchors resolve across 3354 Markdown
  files (after the SOURCES.md markdown-link fix in item 5).
- `PREVIEW_HELD=1 npx astro build` (518 pages, all held topics included) and `PREVIEW_HELD=1
  node tests/reels.mjs http://localhost:4321/learning-resources/ data-quality-frameworks`: reel
  smoke test failed once (phone overflow on two scenes), fixed per item 7, then passed at
  desktop and phone sizes.

## Looks review, self-review, 2026-11-02

Hit a phone-overflow failure on two scenes packing a longer value onto a label/value row --
fixed by shortening each value to one or two words rather than a full phrase. Reel smoke test
covered both desktop and phone sizes across all 11 steps, including both predict panels (steps
3 and 8) and the three-row framework-landscape and Recap scenes, with no overflow or
swipe-caption failures after the fix.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
