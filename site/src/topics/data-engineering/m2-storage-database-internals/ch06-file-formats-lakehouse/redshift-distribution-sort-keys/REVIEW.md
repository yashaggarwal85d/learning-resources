# Review — de.redshift-distribution-sort-keys

## Design: entirely sourced-only

This sandbox has no Redshift or AWS account, so nothing in this topic is a real execution or
measurement — the same pattern used for topics 37 (Snowflake) and 38 (BigQuery). Every
architectural claim (leader/compute nodes and slices, distribution styles, sort keys and block
skipping, RA3, Serverless RPUs, automatic WLM and concurrency scaling, Spectrum, automatic table
optimization) is a word-for-word quote from Amazon's own current Redshift documentation. No
`examples.py` — there is nothing to run. Disclosed throughout in SOURCES.md, FACT-CHECK.md,
references.md and reel.tsx's header comment.

One terminology note, disclosed in SOURCES.md's and FACT-CHECK.md's Red team sections: the
literal phrase "zone maps" does not appear in Redshift's current sort-key documentation, even
though CHAPTER.md's syllabus line names it. The underlying mechanism — per-block min/max value
tracking used to skip blocks — is documented and quoted from "Choose the best sort key," so the
reveal describes the mechanism without presenting "zone map" as a quoted phrase.

## Coverage

`coverage.json`'s syllabus clause is copied byte-exact from `syllabus/data-engineering.md` line
381, with no backticks (lesson from topic 38's clause-matching failure, applied here from the
start — passed the build's coverage check on the first attempt). 9 source groups across the 10
fetched sources, 10 expert items, empty `gapReview`.

## Checks run

- Stage 1 (`--skip reels,links,narration`): passed clean on the **first attempt** — locked
  75.7s, docs 0.3s, sources 23/23 quotes verified, build 46.7s. No coverage errors.
- Stage 2 (`--only links,narration`): passed clean — narration 0.3s (0-7% description overlap,
  longest line 29 words), links 2236 checked / 1934 ok / 0 broken (207 blocked, 95 title
  mismatch, all pre-existing on unrelated topics).
- Stage 3 (`--only reels`): passed clean on the **first attempt** — "Reel smoke test passed: 1
  live reel(s) at desktop and phone sizes." No phone text-overflow fix needed, unlike topics 37
  and 38 — `scenes.tsx` row values were written short (1-5 words) from the start.
- `npm run test:editor`: failed with the known pre-existing sandbox issue (a save does not open
  a new GitHub issue) — confirmed non-regression, multiple other topics have hit the same
  environment limitation.

All three check-all stages passed on their first run with zero fix-and-retry cycles, a
measurable improvement over topics 37 and 38 from applying their lessons (no backticks in
coverage clauses, ≥10 expert items from the start, short scenes.tsx row text from the start).

## Screenshot review

All 24 screenshots in `site/test-results/` reviewed individually: desktop 01-10, 02-q, 06-q (12)
and phone 01-10, 02-q, 06-q (12). All confirmed clean — readable text, no overlap, correct
predict/reveal/takeaway/recap layouts at both desktop and phone widths.

## Scope boundary

Covers §6.5's Redshift architecture: leader/compute nodes and slices, distribution styles and
redistribution cost, compound vs interleaved sort keys and block skipping, RA3, Serverless RPUs,
automatic WLM and concurrency scaling, Spectrum, and automatic table optimization. Does not cover
query tuning, vacuum/analyze mechanics, or federated query beyond Spectrum — out of scope per
CHAPTER.md's entry. Closes with the handoff to topic 40, the chapter's final synthesis topic.
