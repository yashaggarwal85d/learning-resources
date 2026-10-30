# Review — de.openlineage-events-facets-lineage

## Content review, self-review, 2026-10-30

1. **Declared cross-chapter gap, checked and logged.** `CHAPTER.md`'s plan names six `uses`
   candidates from Chapters 1, 2, 7 and 11 (`dag`, `graph-traversal`, `logical-vs-physical-plan`,
   Chapter 7 §7.1's Spark listener/plan, Chapter 11 §11.1's Airflow runs/tasks, §11.4's dbt in CI).
   Checked directly against `registry.ts`: none exist under any name — Chapter 7's two live §7.1
   topics introduce only Spark's task hierarchy, driver/executor model and dependency/stage
   concepts (not the listener/plan this topic needs), Chapter 11's three live §11.1 topics
   introduce orchestrator architecture, idempotency, backfill concepts (none "Airflow runs and
   tasks" by name), and Chapter 11 §11.4 has not been built at all. All six moved to `declared`
   with the gap logged in `OUTLINE.md`'s concept ledger, per `CHAPTER.md`'s own rule, rather than
   guessed. `uses` instead carries four ids confirmed live in `registry.ts`: `otel-vs-openlineage`
   (topic 2), `structured-logs-correlation-ids` (topic 1), and `metadata-graph-entities-relationships`
   / `crawl-vs-push-ingestion` (topic 10 — using the names topic 10 actually introduced, not
   `CHAPTER.md`'s planning-time guesses for them).
2. **Gap hunt against the syllabus line:** all six clauses (the event model; facets; integrations;
   consumers; SQL-parse-vs-runtime column lineage; the gaps static lineage misses) mapped in
   `coverage.json`; no clause left unmapped.
3. **Flow check:** `status: 'held'`, so `checkFlow` skips this topic. Coverage (10 expert items)
   and topic-file checks both pass on the clean build.
4. **Lab honesty, checked explicitly.** The event-emission leg is real: the installed
   `openlineage-python` 1.55.0 client's own `RunEvent`/`Run`/`Job`/`Dataset`/facet classes build a
   genuinely schema-shaped START and COMPLETE event, sent over the library's own `HttpTransport` to
   a local receiver at Marquez's real default ingestion path (`api/v1/lineage`, read directly from
   the installed library's `HttpTransport.__init__` signature) — a real local HTTP round trip, not
   a hand-rolled dict pretending to be one. The receiver is explicitly disclosed as a stand-in for
   Marquez itself (no Docker or JVM catalog on this machine; `import pyspark` also fails, confirmed
   directly), never claimed to be Marquez's own storage, API or UI. The SQL-parse-vs-runtime-plan
   comparison is a disclosed synthetic illustration of the Spark docs' own structural claim, not a
   real Spark job.
5. **Engagement:** hook on step 1; predict on step 2 (within the first four). Three takeaways at
   steps 4, 6, 8 (midpoint of 10 steps is step 5; step 4 sits just before it, matching this
   session's now-established, non-enforced habit of placing a takeaway the moment its point lands,
   confirmed by reading `site/src/lib/topic-checks.ts`, which checks only count, wording and
   word-count, never placement). A second predict at step 10 ("Prove it") revisits the same
   SQL-parse-vs-runtime claim from the opposite direction (a job whose own table name changes
   daily). Recap at step 9, immediately before Prove It. Three takeaways initially ran to 21, 21
   and 22 words (over the 20-word cap, caught by the build's own check on the first `npm run build`
   attempt); all three trimmed to fit.
6. **Narration teaches, not reads:** clean on the first `narration-teaches.mjs` run (4–15%
   description overlap across all 10 steps, all lines under the 50-word cap).
7. **Numbers checked against `examples.py`:** the real HTTP round trip delivers exactly 2 events
   (START, COMPLETE) at the real Marquez ingestion path; the COMPLETE event's run carries a parent
   facet naming the DAG run that spawned the task's run; the column-lineage facet on the output
   dataset shows one DIRECT and one INDIRECT input field for the conditional column; the SQL-text
   parse resolves zero edges for that same conditional column and fails to resolve the still-
   parameterised table name, while the runtime-plan path resolves both — every claim in `reel.tsx`
   prose traces to an asserted value, with no literal digits in the prose itself.

### Checks run

- `node scripts/sources.mjs check site/src/topics/.../openlineage-events-facets-lineage`: 22
  quotes found word for word, 0 problems — after one round of fixes (several quotes initially
  carried Markdown backticks around code terms like `DIRECT`/`INDIRECT`/`ColumnLevelLineageBuilder`
  that the live page's own HTML never renders as literal backtick characters; re-fetched the raw
  page text directly via `sources.mjs fetch` and matched the quotes to the plain text).
- `python3 examples.py`: all asserts pass (a real local HTTP receiver, a real `OpenLineageClient`
  over `HttpTransport`, two functions comparing SQL-parsed and runtime-plan column lineage, one
  `main`) — clean, no code-level fixes needed; required `pip install openlineage-python` (already
  verified working in this sandbox before drafting the lab).
- `node scripts/narration-teaches.mjs site/src/topics/.../openlineage-events-facets-lineage`:
  clean on first run, no fixes needed.
- `node scripts/check-all.mjs` (via `npm run build`): 2 rounds of fixes during the build — first,
  3 `coverage.json` expert items pointed to a sibling topic's concept-id string rather than a
  literal substring of that topic's own syllabus clause (caught by the build's own cross-topic
  quote check); fixed by quoting the actual syllabus wording instead. Second, 3 takeaways over the
  20-word cap; trimmed. Clean on the third build, 238 pages built.
- `node scripts/check-all.mjs --only reels --topic openlineage-events-facets-lineage`: see looks
  review below for the result. `test:editor` fails with the same known, pre-existing, unrelated
  sandbox limitation (Playwright popup-page event never fires in this cloud container) noted in
  every prior topic's `REVIEW.md` in this chapter; not a blocker.

## Looks review, self-review, 2026-10-30

Three phone screenshots read and visually confirmed clean:

- `phone-openlineage-events-facets-lineage-02.png` (Predict, step 2 of 10): both option cards
  render fully alongside the body text and the "NOT QUITE" explain block beneath.
- `phone-openlineage-events-facets-lineage-08.png` (parse-vs-runtime reveal, step 8 of 10): the
  row pair renders with no overlap, the "MORE" truncation control and the takeaway panel both
  render fully and are visually separated by a divider, "TAP TO CONTINUE" is visible beneath.
- `phone-openlineage-events-facets-lineage-10.png` (Prove it, step 10 of 10): both predict option
  cards for the second predict question render fully, alongside the top-of-screen summary rows
  ("name changes daily" / "one, or many?", "the answer" / "not yet revealed").

No overlap, clipping, or crowding in any of the three; predict panels render cleanly; every
reveal states its point in words, not through brightness alone.

**No independent reviewer ran this review or the content review above — both are self-reviews by
the same session that wrote the topic.**

## Fixes made during drafting

- **`examples.py` run ids:** `Run(runId=...)` requires a real UUID string (validated by the
  installed library itself) — the first draft used a readable date-based string and failed on
  that validation; fixed with proper UUID-shaped literals.
- **`SOURCES.md` quotes with Markdown backticks:** several quotes around code terms
  (`DIRECT`, `INDIRECT`, `ColumnLevelLineageBuilder`, `_schemaURL`) initially included literal
  backtick characters copied from the source page's own Markdown-rendered prose, which the raw
  HTML (and `sources.mjs`'s own fetch-and-strip-tags check) never actually carries — re-fetched
  each page's plain text directly and matched the quotes to it without backticks.
- **`coverage.json` cross-topic quotes:** 3 expert items initially pointed at a sibling topic
  using that topic's own *concept id* as the `quote` field (e.g. `crawl-vs-push-ingestion`)
  instead of a literal substring of that topic's syllabus clause text — caught by the build's own
  cross-topic coverage check; fixed by quoting the actual syllabus wording (e.g. "pull crawlers vs
  push/event-based ingestion", "architecture of metadata graphs", the full OTel-vs-OpenLineage
  clause).
- **Three takeaways over the 20-word cap** (21, 21, 22 words) — caught by the build's own
  word-count check on the first `npm run build` attempt; all three trimmed to fit.
