# Review — de.metadata-platforms-active-catalogs

## Content review, self-review, 2026-11-02

1. **GitHub's repository page for Amundsen returns HTTP 403 to this sandbox's fetcher.**
   Substituted the identical README text served from `raw.githubusercontent.com`, and
   cross-checked with a separate direct fetch of the GitHub page itself (via a different fetch
   path) that confirmed the same archive notice and September 2026 date. Disclosed in
   `SOURCES.md`'s own "Note on source naming."
2. **This chapter has no lab of its own for this topic** (its catalog entry is used by topic
   13's later registration flow instead). Per the project's own measurement bar, `examples.py`
   builds a toy `CrawlCatalog`/`PushCatalog` pair reproducing the exact staleness and
   visibility behaviour DataHub's own push/pull architecture documentation describes, rather
   than skipping measurement because this topic has no hands-on lab.
3. **Build check caught a number-on-screen violation:** `reel.tsx`'s final reveal originally
   showed "19 February 2026" and "Sept 2026," (with a trailing comma right after the year,
   which defeats the checker's own year-exemption regex). Fixed by dropping the unmeasured day
   number and removing the comma that immediately followed a bare year, consistently across
   `reel.tsx`'s title, body and `coverage.json`'s matching step reference.
4. **Build check caught a narration-reads-the-description violation on step 6:** the first
   draft paraphrased the predict question too closely to `reel.tsx`'s own body sentence.
   Rewrote it as the professor's own framing of the same question rather than restating the
   scenario's wording.
5. **Gap hunt against the syllabus line:** the single clause (metadata-graph architecture,
   crawl vs push ingestion, the three daily uses, the open-source-vs-enterprise landscape,
   technical vs business catalog, Amundsen's status) is mapped across 7 of the reel's 11 steps
   in `coverage.json`; no part of the clause left unmapped.
6. **`declared: []`** -- CHAPTER.md's own "Declared: none" for this topic.
7. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic.
8. **Engagement:** hook at step 1; predicts at steps 3 and 6; three takeaways at steps 5, 8 and
   11 (Recap), each at or under the 20-word limit on the first draft.
9. **Narration teaches, not reads:** every line is the professor's own framing rather than
   `reel.tsx`'s body sentences, with the one exception caught and fixed per item 4. No raw
   digits anywhere -- the Polaris and Amundsen dates are spoken as "February" and "September of
   this year" rather than as numerals, matching the reel's own prose style.
10. **Numbers checked against `examples.py`:** the push-catalog-shows-it-immediately,
    crawl-catalog-stays-stale-until-its-next-run, and crawl-never-sees-the-dropped-table claims
    all trace to asserted values from the toy crawl/push model, not an unverified or
    hypothetical claim. The Polaris/Amundsen dates are sourced facts (quoted in `SOURCES.md`),
    not measured claims, and are kept off the reel's own on-screen numerals per item 3.

### Checks run

- `node scripts/sources.mjs check`: 13 quotes found word for word, 0 problems (after two quote
  corrections during drafting -- the Polaris quote split across two sentences, and the
  OpenMetadata quote corrected to the entity-store/search-engine sentences actually in the
  source).
- `python3 examples.py`: "all claims verified" against the toy `CrawlCatalog`/`PushCatalog`
  model.
- `node scripts/check-all.mjs --topic .../metadata-platforms-active-catalogs --only build`: 2
  fixes during the build (the unmeasured "19" plus a trailing-comma-after-year number, and the
  step 6 narration reading the description); clean on rebuild, 238 pages built.
- `node scripts/check-all.mjs --topic .../metadata-platforms-active-catalogs --skip reels,links`:
  locked, docs, sources, build, narration all pass.
- `PREVIEW_HELD=1 npx astro build` (514 pages, all held topics included) and `PREVIEW_HELD=1 node
  tests/reels.mjs http://localhost:4321/learning-resources/ metadata-platforms-active-catalogs`:
  reel smoke test passed at desktop and phone sizes.

## Looks review, self-review, 2026-11-02

Kept every `scenes.tsx` Row label/value to short words throughout, following the accumulated
phone-overflow lesson from this chapter's earlier topics. Reel smoke test covered both desktop
and phone sizes across all 11 steps, including both predict panels (steps 3 and 6) and the
three-row Recap scene, with no overflow or swipe-caption failures.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**
