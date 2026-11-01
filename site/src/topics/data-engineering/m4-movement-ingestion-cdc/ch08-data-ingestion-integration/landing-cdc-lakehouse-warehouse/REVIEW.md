# Review — de.landing-cdc-lakehouse-warehouse

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 21's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (Master
data management styles).

1. **Flow.** The bridge answers topic 21's own handoff verbatim ("Whichever way the changes get
   here, they arrive as inserts, updates and deletes, and an analytical table has to apply
   them") and this topic's own handoff matches `CHAPTER.md`'s own handoff into topic 23 (whether
   two systems' rows describe the same customer is not a transport problem). Checked all eight
   named `uses` ids via `grep -n "introduces: \[.*'<id>'"` and a direct block search against
   `registry.ts`: `cdc-delete-tombstone`, `cdc-source-offset-vs-kafka-offset`,
   `debezium-architecture-envelope`, `raw-layer-replay-metadata`, `lakehouse-merge-rewrite`,
   `merge-statement`, `scd-type-2` and `flink-cdc-kafkaless-pipeline` all resolve live (the
   table-format pair is introduced together by `de.merge-upsert-concurrent-writers`).
2. **Pre-notes.** 8 bullets (MERGE, merge-on-read, copy-on-write, delete file, compaction,
   upsert, LSN, freshness — `CHAPTER.md`'s own syllabus terms for this topic), each under the
   per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 522) splits at its
   own four semicolons into five clauses: the two landing strategies; LSN ordering; compaction
   cost; warehouse-native CDC; topic-to-table materialisation. `coverage.json`'s `syllabus`
   array matches this five-clause breakdown exactly, copied word for word from the raw syllabus
   file, confirmed by a direct substring check that leaves zero characters uncovered. The expert
   list has 10 items on the first draft, meeting the required minimum without needing a second
   pass.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the measured mechanism directly, not invented reasoning: the first against the naive
   merge function itself failing under reversed arrival despite being a periodic-style merge,
   the second against the measured compaction function's own twenty-versus-one-hundred result.
   Every measured claim traces to a specific function in `examples.py`: the real change stream's
   decoding and LSN parsing, the append-then-MERGE landing, the streaming-upsert read-time
   merge and compaction, the convergence proof under reversed replay, and the update-rate
   comparison.
5. **Engagement.** Hook (step 1, a replayed batch and a live event for the same order, in
   opposite order, with the lakehouse keeping the older value); predict within the first four
   steps (step 2, whether append-then-MERGE is naturally protected from this); three takeaways
   (steps 5, 6, 9 — meeting the build's own minimum-of-three rule); "Prove it" (step 10)
   generalizes the compaction-cost claim to an uncompacted high-update table, directly reusing
   the measured mechanism from step 6 to rule out the wrong answer.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran: every step explains *why* a measurement or documented
   behavior comes out the way it does (why waiting to merge does nothing without an LSN
   comparison; why the superseded-row pile, not the key count, is the quantity that grows
   without bound) rather than reading the figure's own on-screen labels or restating the predict
   question verbatim. Code-style tokens such as `_CHANGE_TYPE`, `max_staleness` and `MERGE INTO`
   are spoken in narration as "declare itself as an update or a deletion," "reduce cost and
   latency," and "one single step... merges" rather than read literally. The build's own
   narration-teaches check passed on the first attempt. No digits and no underscored
   identifiers appear in `reel.tsx`'s or `scenes.tsx`'s visible text or in `narration.json`;
   every narration line is confirmed at or under the 50-word-per-line ceiling by a Python script
   (longest line: 38 words).

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was written to stay within the house style's usual
   one-to-three-word guideline per side; `grep` for digits in visible text returns no matches in
   the final file. Figures that could have used digits (a latency figure, an update count) were
   written as words instead ("as low as five seconds," "fifty times a day") to keep the whole
   file clear of the build's own file-wide digit scan.
2. Takeaway word counts (em dash and semicolon-joined clauses counted word by word) checked with
   a Python script against `reel.tsx`'s own source text before the build ran: all three
   takeaways (17, 17, 18 words) passed on the first draft after one length fix each — the first
   drafts ran to 23 and 21 words and were trimmed without losing their own claim.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster and a real DuckDB database
   before writing the reel, including one parsing fix caught during development: the
   `test_decoding` plugin's own UPDATE format under `REPLICA IDENTITY FULL` prints an
   `old-key:`/`new-tuple:` pair rather than a single value, so the row's own new state had to be
   parsed from the text after `new-tuple: `, not from the first `v[text]:` occurrence. Every
   scratch table and replication slot this topic creates is confirmed dropped after each run
   (`slots []`, `tables []` via a direct Python check), and the shared `orders` table is
   confirmed unchanged at 50001 rows throughout.
4. No source substitution was needed for the warehouse and vendor sources this topic names
   (BigQuery's, Snowflake's, Flink CDC's and Debezium's own documentation, and Airbyte's docs):
   every one was reachable directly as plain HTML. `node scripts/sources.mjs check <folder>`
   passed (8/8 quotes word for word, after two fixes: the BigQuery `_CHANGE_TYPE` quote
   originally carried markdown backticks around the code-styled terms that the real page's
   own text does not contain, and an early disclosure note with no fetched URL was moved out of
   `SOURCES.md` into this file, since the checker requires exactly one URL line per heading
   block).
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM and no real Iceberg or Paimon table format (`pyiceberg` is not installed, confirmed by a
   direct import check). Chapter 6's own table-format ids (`merge-statement`,
   `lakehouse-merge-rewrite`) are introduced by a live topic that itself runs on SQLite, not a
   real lakehouse table format, so this topic's own lab runs on a real DuckDB database instead,
   exactly as CHAPTER.md's own "Lab" line discloses ("on Chapter 6's table-format library if
   live, else on DuckDB, disclosed"): a real `MERGE INTO` statement stands in for a lakehouse's
   periodic MERGE, and a hand-built data-file/delete-marker table pair stands in for a
   merge-on-read table's own file layout. Neither BigQuery nor Snowflake is reachable from this
   sandbox, so their own native CDC paths are named and quoted from documentation rather than
   measured.

Final build: `cd site && npm run build` completed clean (238 pages), after two fixes during
development — the `test_decoding` UPDATE-parsing bug above, and two takeaways over the 20-word
ceiling, trimmed without losing either claim. `node scripts/sources.mjs check <folder>` passed
(8/8 quotes word for word, after the two fixes above). `PREVIEW_HELD=1 npm run build` completed
clean; the held-topic reel smoke test was run with `REEL_DEVICES=desktop` and passed (after one
transient timeout on the first attempt, which passed cleanly on retry with no code change),
reporting both desktop and phone sizes.
