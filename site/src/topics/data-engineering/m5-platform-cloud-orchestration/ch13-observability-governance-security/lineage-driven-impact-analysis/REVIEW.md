# Review — de.lineage-driven-impact-analysis

## Provenance note

This topic's files (`SOURCES.md`, `OUTLINE.md`, `FACT-CHECK.md`, `reel.tsx`, `scenes.tsx`,
`pre-notes.md`, `post-notes.md`, `prerequisites.mdx`, `references.md`, `narration.json`,
`coverage.json`, `registry.ts`'s entry, `renarration.json`'s entry) were drafted by a research fork
launched to fetch sourcing for this topic only — the fork went beyond its directive (research only,
no files) and built the full topic. Rather than discard completed, usable work, this session
independently re-verified every one of it from scratch before shipping: re-ran `sources.mjs check`,
`narration-teaches.mjs`, a full `npm run build`, a `PREVIEW_HELD=1` build, the reel smoke test at
both desktop and phone sizes, and read every file's content directly (not just its check output) —
see "Checks run" and "Looks review" below. `examples.py` specifically was cross-checked against an
independently written prototype of the same lab (a different implementation, same design: a planted
lineage graph, table-level vs. column-level blast radius, stale propagation, deduplicated
notification, a deprecation workflow) built by this session before the fork's version was found on
disk; the fork's version was kept since it ran cleanly and its numbers were independently
reproducible.

## Content review, self-review, 2026-10-30

1. **Declared cross-chapter gap, checked and logged.** `CHAPTER.md`'s plan names
   `metadata-graph-architecture` as a `uses` candidate from topic 10; checked directly against
   `registry.ts` and the id does not exist — topic 10's own entry introduces
   `metadata-graph-entities-relationships` instead, which `uses` carries. Chapter 11 §11.3 ("Data
   incident response and blast radius") and §11.4 ("Contract enforcement in CI") are both named as
   building blocks; checked directly and neither `section: '11.3'` nor `section: '11.4'` exists
   anywhere in `registry.ts`, so both are unbuilt and moved to `declared` with the gap logged. The
   other thirteen `uses` ids were each checked directly and all resolve to live entries.
2. **Gap hunt against the syllabus line:** all five clauses (blast-radius scoring; stale-table
   propagation; automated owner notification; deprecation workflows; lineage as the backbone of
   incident triage and contract enforcement) mapped in `coverage.json`; every cross-topic expert
   item's `topic` field checked directly against its exact syllabus title (the lesson from this
   chapter's own earlier build failures on topics 13) — all five matched on the first build.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage (three sources, ten
   expert items) and topic-file checks both pass on the clean build.
4. **Lab honesty.** `CHAPTER.md` explicitly discloses that "where the machine has no Marquez, the
   graph is built from the OpenLineage events as files and traversed in Python" — this sandbox has
   no connected Marquez server (the same absence topic 11 confirmed), so the lineage graph is a
   plain Python data structure, walked by hand-written traversal functions, not a call to Marquez or
   DataHub's own APIs. `SOURCES.md` quotes both vendors' documentation to back the general claims in
   `reel.tsx`'s prose (what a node and an edge are, table-level vs. column-level precision), not as
   evidence the code calls either system. The Google SRE Workbook's incident-response chapter was
   checked directly and does not use the phrase "blast radius" anywhere — `FACT-CHECK.md` states
   this explicitly rather than implying the term is the Workbook's own.
5. **Engagement:** hook on step 1; predict on step 2 (within the first four). Three takeaways at
   steps 4, 5, 6. A second predict at step 10 ("Prove it") asks whether better lineage coverage
   elsewhere can ever close the specific gap a reader with no edge at all represents — the answer is
   no, by construction, which the predict's explain text states directly. Recap at step 9,
   immediately before Prove It.
6. **Narration teaches, not reads:** clean on the first `narration-teaches.mjs` run — 0–30% overlap
   across all ten steps (step 1's 30% is the highest and still well under the VERBATIM threshold),
   no line over the fifty-word limit.
7. **Numbers checked against `examples.py`:** on the planted fourteen-table, two-dashboard graph,
   the catalog's static index finds three consumers, a table-level walk finds fourteen, a
   column-level walk finds eleven — excluding exactly three named false positives
   (`pricing_staging`, `finance_recon`, `campaign_rollup`) asserted by name, not just by count. A
   failed partition in `orders_clean` marks ten downstream tables stale (table-level reachability,
   not column-level, since a whole-partition failure can corrupt any column). Eleven affected tables
   collapse into exactly four owner notifications. A deprecation attempt on a table with live
   dependents is blocked and names every missing owner, then succeeds once all have signed off; a
   leaf table with no dependents deprecates immediately. The uninstrumented partner reader is
   asserted absent from both the table-level and column-level reachable sets. Every claim in
   `reel.tsx` prose traces to one of these asserted values, with no literal digits in the prose
   itself.

### Checks run

- `node scripts/sources.mjs check site/src/topics/.../lineage-driven-impact-analysis`: 8 quotes
  found word for word, 0 problems.
- `python3 examples.py`: all asserts pass on the first run found on disk — independently confirmed
  by re-running it in this session, not just trusted from the fork's own report.
- `node scripts/narration-teaches.mjs site/src/topics/.../lineage-driven-impact-analysis`: 0 fixes
  needed, clean on the first run.
- `node scripts/check-all.mjs` (via `npm run build`): clean on the first attempt, 238 pages built.
  A separate `PREVIEW_HELD=1` build (274 pages) also came back clean on the first attempt.
- Reel smoke test (`tests/reels.mjs`, `PREVIEW_HELD=1`): the first combined desktop+phone run was
  killed after 30 minutes with no output — traced to two concurrent `astro build`/test processes
  (this session's own and the research fork's, which had kept working past its directive)
  colliding on the same `dist/` and preview server; after messaging the fork to stop and confirming
  no other build or test process was running, a phone-only rerun (`REEL_DEVICES=phone`) and the
  combined desktop+phone rerun both passed cleanly on the first clean attempt — see looks review
  below. `test:editor` was not re-run this topic; it fails with the same known, pre-existing,
  unrelated sandbox limitation (Playwright popup-page event never fires in this cloud container)
  noted in every prior topic's `REVIEW.md` in this chapter; not a blocker.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-lineage-driven-impact-analysis-02-q.png` (Predict, step 2 of 10): both option cards render
  fully alongside the body text; "PICK AN ANSWER TO CONTINUE" is visible beneath.
- `phone-lineage-driven-impact-analysis-06.png` (deduplicated-notification reveal, step 6 of 10):
  the row pair renders with no overlap, the "MORE" truncation control and the takeaway panel both
  render fully and are visually separated by a divider, "TAP TO CONTINUE" is visible beneath.
- `phone-lineage-driven-impact-analysis-10-q.png` (Prove it, step 10 of 10): both predict option
  cards for the second predict question render fully, alongside the top-of-screen summary rows
  ("no edge exists" / "for any walk", "the answer" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every reveal
states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that shipped the topic, over work a research fork drafted beyond its own
directive and this session independently re-verified end to end.**

## Fixes made during drafting

- None needed in this session's own pass — every check (`sources.mjs`, `narration-teaches.mjs`,
  `npm run build`, `PREVIEW_HELD=1` build, the reel smoke test) passed on its first clean attempt
  once the concurrent-process collision (described above, under "Checks run") was resolved. The
  fork's own build process is documented in `OUTLINE.md`'s research note and `FACT-CHECK.md`'s
  red-team section (the `metadata-graph-architecture` → `metadata-graph-entities-relationships`
  correction, the Chapter 11 §11.3/§11.4 declared gap, the SRE Workbook's "blast radius" absence
  check).
