# Review, 2026-10-22

## Content review

- All three local measurements (BRIN vs. B-tree storage size, correlated-column equality filter, uncorrelated-column equality filter) reproduced directly on the existing PostgreSQL 16.15 sandbox, on the same two-million-row table with two columns differing only in physical correlation; the Snowflake micro-partition claim is sourced but disclosed as not independently measured — no Snowflake account available on this sandbox, consistent with this chapter's honest-gap pattern.
- Four predict/reveal pairs (steps 2/3-4, 5/6-7, 8/9, 10/11) each set up a genuine prediction with a plausible wrong answer, red-teamed in `FACT-CHECK.md`.
- Recap (step 14) keeps the size advantage, the correlation requirement, and the lossy recheck cost as three separate ideas rather than one vague "BRIN is small and fast" takeaway.
- Closing check (step 15) requires reasoning about what strict correlation implies for block-range pruning, rather than re-testing the exact measured numbers from the reveals.

## Looks review and fixes

- **Coverage check:** the first syllabus clause was copied with a trailing comma instead of the syllabus's own semicolon ("...vs B-trees," vs. "...vs B-trees;"). Fixed to match the syllabus line word for word.
- **Numbers-on-screen check:** `reel.tsx`'s fig text displays "24 KB" and "14 MB," which weren't present as literal text in `examples.py` (only the underlying byte counts were). Added `BRIN_SIZE_KB_DISPLAY = 24` and `BTREE_SIZE_MB_DISPLAY = 14`, with assertions tying them to the byte constants.
- **Playwright phone-overflow (four instances):** step 9 (`RevealUncorrelatedResult`), step 11 (`RevealLossyRecheck`), step 13 (`RevealSnowflakeMicropartitions`), and step 15 (`ProveBlockRangesScanned`) all overflowed on the phone viewport. Shortened the long Row labels and values in each ("versus no index at all" → "vs. no index", "a matching range returns" / "every row as a candidate" shortened, "per micro-partition" → "per partition", "containing the matching date" → "matching the date").
- No apostrophe-syntax bugs this time: all predict-option and takeaway single-quoted strings were checked for contractions before running any check, and the one title containing an apostrophe ("this topic's own measured...") was written with double quotes from the start.
- First takeaway lands on step 4, not step 3, so the swipe-from-caption Playwright sub-test (QUALITY.md #64) was never at risk — confirmed once Playwright actually ran.

## Checks run

- `node scripts/check-all.mjs --skip reels,links --topic zone-maps-brin-indexes` — pass (locked, docs, sources, build, narration), after the coverage and numbers-on-screen fixes above.
- `node scripts/narration-teaches.mjs .../zone-maps-brin-indexes` — all 15 steps well under the description-overlap threshold.
- `node scripts/check-links.mjs` — no new broken or blocked links from this topic.
- `node scripts/check-all.mjs --only reels --topic zone-maps-brin-indexes` — pass (desktop and phone, after the four phone-overflow fixes above); editor test pass.
