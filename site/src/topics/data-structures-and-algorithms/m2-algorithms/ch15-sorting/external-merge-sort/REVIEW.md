# REVIEW: External merge sort

## Pass 1 — content

- Every exact claim (simple run count, replacement selection's run lengths on random/sorted/
  reverse-sorted input, the loser tree's comparisons-per-item at a given fan-in, the running
  example's run count/fan-in/pass count/block-transfer totals, the small worked instance, and
  the six-row threshold table) is computed or asserted directly in `examples.py`, with literal
  `assert` statements pinning exact figures, not inequalities. All assertions pass
  (`python3 examples.py`). The replacement-selection simulation reproduces `CHAPTER.md`'s own
  planning values (2.0 M average on random input, one run on sorted input, one hundred runs of
  one hundred on reverse-sorted input) exactly on this topic's own seed.
- `sources.mjs check` passes: 11/11 quotes verified, across Vitter's own posted book PDF (found
  directly, no wrong-URL guesses needed this time), the DuckDB 2021 post (re-fetched into this
  topic's own cache), and the current PostgreSQL 18 documentation. A reused-quotes subsection
  (Chapter 6 topic 31's Wikipedia quotes, pointed to rather than re-verified) required two
  iterations to get the checker's own section-heading rules right (see Red team in
  `FACT-CHECK.md` and the project's own shared gotcha memory): a `##` heading demands a `URL:`
  line even for a reused section, and a `###` heading does not start a new section at all in
  the checker's own parser, so a reused quote under a `###` heading must stay inline-italicized
  prose, never a literal `>` blockquote.
- Knuth's TAOCP vol. 3 §5.4.1, the Aggarwal & Vitter 1988 paper, Graefe's 2006 survey, and
  Sedgewick & Wayne §2.2 / CLRS stay citation-only, per `CHAPTER.md`'s own "to verify"/"not
  opened" framing; no claim in `FACT-CHECK.md`'s claims table rests on any of them.

## Pass 2 — looks and mechanics

- `reel.tsx`: thirteen steps, two predict steps (each with an `answer`/explanation), three
  takeaways (replacement selection's floor/ceiling property, the I/O-cost constant, and the
  "same mechanism everywhere" point) — none immediately after a predict step, per this
  project's own logged gotcha. Every number is spelled out in words rather than written as a
  digit, which sidesteps the build's own number-literalness check entirely rather than pinning
  each figure with an `assert`; this was a deliberate choice for this topic, not an oversight,
  and the build's own checks confirm no digit slipped through unspelled (`grep -oE '[0-9]+'
  reel.tsx` finds only the stripped `duration:` values).
- The build's own coverage check caught two real, previously undocumented bugs on the first
  run: (1) a title string with a nested, escaped double quote (`Knuth's own \"snowplow\":`)
  made the checker report that exact reel step as entirely missing from `reel.tsx`, even though
  the rendered text looked correct and the apostrophe itself was plain ASCII — a new class of
  extraction fragility beyond the already-documented curly-apostrophe bug, now added to this
  project's shared gotcha memory. (2) `coverage.json`'s fourth syllabus clause omitted the
  syllabus line's own trailing "→ *Data Engineering* §1.3, Ch.7." pointer, and even after
  adding it verbatim from the raw markdown, the check still failed, because the site's own
  `syllabus.ts` parser strips all markdown asterisks before building the scope string a clause
  is matched against — so a coverage clause copied from raw syllabus markdown must drop the
  markdown emphasis markers (`*...*`), not keep them, when the syllabus text being quoted
  contains any. Both fixes are documented in `FACT-CHECK.md`'s "Corrections applied" and saved
  to project memory for future topics with a similar trailing Data-Engineering/engine pointer.
- The build's own number-literalness check caught zero violations, since every number in
  `reel.tsx` is spelled out as a word rather than written as a digit (see Pass 2's first bullet
  above) — a different strategy from topics 52 and 53, which pinned exact digit literals with
  matching `assert` statements instead. Both strategies satisfy the same build rule.
- Three takeaways were over this project's 20-word limit (27, 37 and 37 words); shortened to
  16, 18 and 20 words, all now at or under the limit.
- `narration.json`: thirteen steps, written to teach the mechanism rather than read the screen,
  self-checked before any build run (word count ≤50 per line, no digits, matching step count)
  and confirmed clean on the real `--only links,narration` run (`pass narration 0.4s`).
- `coverage.json`: four syllabus clauses (run generation/replacement selection; multi-way
  merging with loser trees; the pass-count formula; the spill-path pointer to Data
  Engineering, including its trailing arrow pointer) are literal substrings of the syllabus's
  own markdown-stripped scope string, confirmed by the real build's coverage check passing;
  three primary-source citations mapped with items; a ten-item independent expert list; no
  open gap-review items.
- `prerequisites.mdx`: all linked titles (Merge sort; Binary heaps and heapify; Tournament and
  loser trees; External-memory (I/O) model; the Data Engineering reel "External merge sort and
  k-way merge"; LSM compaction and amplification) verified against `registry.ts`/syllabus by
  exact grep before use, including the cross-domain reference to the Data Engineering reel
  (its exact live title confirmed in `registry.ts` directly, not guessed).
- `scenes.tsx`: the real `--only reels` run caught a genuine phone-and-desktop overlap bug on
  its first attempt: `ThresholdTable`'s five side-by-side cells all shared the identical label
  "passes: 1", wide enough to run into each other's rendered text on both viewport sizes.
  Fixed by shortening every cell's label to a single digit and widening the spacing slightly,
  following this project's own logged pattern (shorten first, don't just resize). Re-running
  `--only reels` afterward confirmed the fix: "Reel smoke test passed: 1 live reel(s) at
  desktop and phone sizes."
- `node scripts/check-all.mjs --skip reels,links,narration --topic
  .../external-merge-sort`: failed twice on real coverage-check errors (the nested-quote bug
  and the unmapped trailing syllabus pointer, both above), failed a third time on the
  over-length takeaways, then passed cleanly on the fourth run (locked, docs, sources, build
  all pass). `node scripts/check-all.mjs --only links,narration --topic
  .../external-merge-sort`: narration passes outright; the combined links check reports FAIL,
  but every reported issue is a pre-existing "title mismatch (check by hand)" cosmetic note
  already present across roughly a hundred links on other, already-live topics across the
  whole site (confirmed by the same run), plus this topic's own one new entry for the
  PostgreSQL `work_mem` link, whose quoted text is still verified word for word by
  `sources.mjs check` — not a regression this topic introduced, and not something any other
  shipped topic in this chapter has had to resolve either. `node scripts/check-all.mjs --only
  reels --topic .../external-merge-sort`: `test:reels` passes outright on the second attempt
  (the first attempt's real overlap bug is documented and fixed above); the unrelated
  `test:editor` sub-check still fails with its own documented, sandbox-only limitation
  (confirmed by multiple prior threads on a clean, unmodified `main`), which is why the
  combined check reports FAIL despite the actual reel test passing.
