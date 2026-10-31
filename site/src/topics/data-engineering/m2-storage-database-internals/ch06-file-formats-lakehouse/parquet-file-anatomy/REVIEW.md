# Review — de.parquet-file-anatomy

## Content review, self-review

- Claims table in FACT-CHECK.md cross-checked against the three quoted sources (parquet-format README, `parquet.thrift`, `LogicalTypes.md`); all 10 claims traced to a quote or to an independent verification step.
- `python3 examples.py` — all asserts pass: the hand-written file parses back to the expected schema, row groups, page-header types, and both INT96 decodes (correct UTC and the wrong America/Los_Angeles reading, 7 hours off).
- Independently verified the hand-rolled file against a real Parquet implementation: `pip install pyarrow`, read the file back with `pyarrow.parquet.read_table` and `ParquetFile`, confirmed the schema and all 4 rows across both row groups matched exactly (including both timestamp columns), then `pip uninstall pyarrow` — it is not a runtime dependency of `examples.py`, consistent with this sandbox having neither pyarrow nor fastparquet installed.
- Found and fixed one real correctness bug while building this topic's own worked example: `ColumnMetaData.total_compressed_size`/`total_uncompressed_size` must include page headers, not just page bodies (per the spec's own comment, "including the headers") — missing this made pyarrow fail with "No more data to read" while parsing page headers, since it trusted the declared chunk size to know how many bytes to buffer. Documented in FACT-CHECK.md's red-team section.
- `node scripts/check-all.mjs --skip reels,links --topic parquet-file-anatomy` — all green (locked, docs, sources, build, narration).
- `node scripts/check-links.mjs .../prerequisites.mdx` — 3/3 links ok.
- Coverage: 4 syllabus clauses, 3 sources with quoted items, 10 expert items, no open gaps.

## Looks review, self-review

- `node scripts/check-all.mjs --only reels --topic parquet-file-anatomy` passed on the second attempt ("Reel smoke test passed: 1 live reel(s) at desktop and phone sizes") after fixing issues found by the first run:
  - Four scenes (`RevealFooterLast`, `PredictRepeatedString`, `RevealV1VsV2`, `RevealIsAdjusted`) had `Row` pairs whose label+value combination was too long for the drawing width on desktop or phone; converted each to the stacked `TallRow` layout.
  - `Strip`'s dictionary-vs-index visualization had unreadable text on its own fill (white text on a white-ish fill, contrast ~1:1); gave each segment its own contrasting text color.
  - Phone "swipe from the caption" failure on step 3, caused by a takeaway on the step immediately after an early predict step (the chapter's known gotcha); moved that takeaway from step 3 to step 4, keeping 3 takeaways total.
- Manually viewed all 24 screenshots in `site/test-results/` (10 desktop steps + 2 predict-question frames, 10 phone steps): no text overflow, no overlapping elements, predict-question cards render cleanly, the `Strip` dictionary/index visualization reads clearly on both fills, and the Recap's four stacked rows read clearly at both sizes.
