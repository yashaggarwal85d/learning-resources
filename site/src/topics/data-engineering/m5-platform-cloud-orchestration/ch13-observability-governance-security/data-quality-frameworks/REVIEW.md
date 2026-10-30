# Review — de.data-quality-frameworks

## Content review, self-review, 2026-10-30

1. **Declared cross-chapter gap, checked and logged.** `CHAPTER.md`'s plan names two Chapter 5
   sampling-and-sketch ids and three Chapter 11 §11.4 ids as `uses` candidates. Checked directly
   against `registry.ts`: neither `hyperloglog-distinct-counting` nor `probabilistic-membership-filters`
   exists anywhere, and no `section: '11.4'` entry exists in the registry at all — Chapter 11
   §11.4 has not been built yet (the same gap topic 11 logged for its own Chapter 11
   dependencies). All five moved to `declared` with the gap logged in `OUTLINE.md`. `uses` instead
   carries seven ids confirmed live: `dbt-tests-data-unit`, `dbt-models-ref-dag`,
   `data-contract-specification`, `open-data-contract-standard` (Chapter 3), `data-code-testing-layers`,
   `runtime-schema-validation` (Chapter 4), and `openlineage-facets` (topic 11, shipped this
   session).
2. **Gap hunt against the syllabus line:** all seven clauses (where checks run and cost; dbt
   tests and unit tests; GX Core suites with the full Fivetran/FICO parenthetical; Soda; Deequ;
   DQX; incremental metrics and sampling) mapped in `coverage.json`; no clause left unmapped —
   caught once by the build's own coverage check when the GX clause was first entered without its
   parenthetical and several of that parenthetical's own words (Fivetran, FICO, steward, 2026)
   were reported unmapped; fixed by quoting the clause's full text.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage (10 expert items)
   and topic-file checks both pass on the clean build.
4. **Lab honesty, checked explicitly, and matching `CHAPTER.md`'s own lab table.** dbt and GX run
   for real: a genuine `dbt-core` 1.12.6 / `dbt-duckdb` 1.11.1 project (seed, model, all four
   built-in generic tests, one unit test) through the actual `dbt build` command, and a genuine
   `great_expectations` 1.24.1 `ExpectationSuite` (version confirmed to match `CHAPTER.md`'s own
   planning-time citation via `pip index versions`) validated against the same synthetic rows.
   Deequ, Soda and DQX are named and sourced only, never run — confirmed directly that
   `import pyspark` fails in this sandbox (Deequ and DQX both need Spark) and that this sandbox
   has no connected data platform for Soda's checks to verify against, exactly matching
   `CHAPTER.md`'s own disclosed lab scope ("Soda and DQX sourced from their documentation and
   disclosed").
5. **Engagement:** hook on step 1; predict on step 2 (within the first four). Three takeaways at
   steps 4, 6, 8 (midpoint of 10 steps is step 5; step 4 sits just before it, matching this
   session's established, non-enforced habit). A second predict at step 10 ("Prove it") tests
   whether "it's a gate" implies "it's cheap" — the opposite direction from step 2's own gate-vs-
   scan question. Recap at step 9, immediately before Prove It. One takeaway initially ran to 21
   words (an apostrophe-counting miscount, the same recurring error noted from earlier topics in
   this chapter), caught by the build's own check and trimmed.
6. **Narration teaches, not reads:** one fix needed — step 1's first line was initially a close
   paraphrase of the description's own opening clause, caught by `narration-teaches.mjs`'s
   verbatim-overlap check (43% overlap, flagged "VERBATIM"); rewritten to open from a different
   angle ("A team bolts twelve new quality checks onto their orders pipeline" instead of restating
   "the shop adds twelve checks"). Clean on recheck, 0–26% overlap across all 10 steps.
7. **Numbers checked against `examples.py`:** the real `dbt build` run produces exactly 6 passes
   and 1 failure (the planted null customer id), with the unit test among the passes; the real GX
   suite produces 1 pass and 2 failures, one of which (the amount range) none of dbt's four
   built-in generic tests cover; a full rescan and an incrementally-merged metric agree exactly at
   1; a deterministic 1-in-10 sample over a 100-row repeated pattern reports 0 against an actual
   count of 20; a post-hoc full scan costs exactly 10x a gate check at the same row count — every
   claim in `reel.tsx` prose traces to an asserted value, with no literal digits in the prose
   itself.

### Checks run

- `node scripts/sources.mjs check site/src/topics/.../data-quality-frameworks`: 14 quotes found
  word for word, 0 problems on the first run (quotes pre-verified against each source's own cached
  plain text before writing `SOURCES.md`, including the Deequ README fetched via
  `raw.githubusercontent.com` after `github.com/awslabs/deequ` 403'd to this session's scoped
  GitHub access — the same access limitation topic 10 hit on Amundsen, resolved differently here
  since the raw-content mirror let the automated checker verify the quote directly).
- `python3 examples.py`: all asserts pass (a real `dbt build` subprocess run, a real GX Core suite
  validation, incremental-vs-full-rescan equality, a sampling-miss demonstration, a cost-ratio
  calculation, one `main`) — clean, no code-level fixes needed; required
  `pip install dbt-core dbt-duckdb great_expectations` (all verified working in this sandbox
  before drafting the lab).
- `node scripts/narration-teaches.mjs site/src/topics/.../data-quality-frameworks`: 1 fix (step
  1's verbatim-overlap line, described above); clean on recheck.
- `node scripts/check-all.mjs` (via `npm run build`): 2 rounds of fixes — first, the GX syllabus
  clause in `coverage.json` was entered without its Fivetran/FICO parenthetical, so several of the
  parenthetical's own words were reported unmapped by the coverage check; fixed by quoting the
  clause's full text (and correcting `OUTLINE.md` to match). Second, one takeaway at 21 words;
  trimmed. Clean on the third build, 238 pages built.
- `node scripts/check-all.mjs --only reels --topic data-quality-frameworks`: see looks review
  below. `test:editor` fails with the same known, pre-existing, unrelated sandbox limitation
  (Playwright popup-page event never fires in this cloud container) noted in every prior topic's
  `REVIEW.md` in this chapter; not a blocker.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-data-quality-frameworks-02.png` (Predict, step 2 of 10): both option cards render fully
  alongside the body text and the "NOT QUITE" explain block beneath.
- `phone-data-quality-frameworks-08.png` (sampling reveal, step 8 of 10): the row pair renders
  with no overlap, the "MORE" truncation control and the takeaway panel both render fully and are
  visually separated by a divider, "TAP TO CONTINUE" is visible beneath.
- `phone-data-quality-frameworks-10.png` (Prove it, step 10 of 10): both predict option cards for
  the second predict question render fully, alongside the top-of-screen summary rows ("table keeps
  growing" / "flat, or climbing?", "the answer" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every
reveal states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**

## Fixes made during drafting

- **`coverage.json` / `OUTLINE.md` GX clause truncated:** the GX Core syllabus clause was first
  entered as just "GX Core expectation suites," dropping its own Fivetran/FICO parenthetical —
  caught by the build's own cross-topic coverage check reporting the parenthetical's words as
  unmapped; fixed by quoting the clause's full text in both files.
- **`narration.json` step 1, verbatim overlap with the description:** the opening narration line
  closely paraphrased the step's own description text (43% overlap, flagged "VERBATIM" by
  `narration-teaches.mjs`); rewritten from a different angle.
- **One takeaway at 21 words** (apostrophe-counting miscount, caught by the build's own check):
  trimmed to fit the 20-word cap.
- **5 `scenes.tsx` row-length violations** (4+ word values, e.g. "after, a full read," "caught a
  real gap," "a real gap found," and the three Recap rows each running long) — all caught while
  writing the file and shortened to 1–3 words per the house rule before the build ran.
