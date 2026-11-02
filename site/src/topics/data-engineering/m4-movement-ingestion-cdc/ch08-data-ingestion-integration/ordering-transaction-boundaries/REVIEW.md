# Review — de.ordering-transaction-boundaries

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 14's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (schema
evolution in change streams).

1. **Flow.** The bridge answers topic 14's own handoff verbatim-in-spirit ("Snapshot rows and
   streamed changes now share one stream...") and this topic's own handoff matches
   `CHAPTER.md`'s own handoff into topic 16 (order and atomicity cover the rows; the columns
   change too). Checked all four named `uses` ids via the registry-parsing script:
   `logical-decoding-slot`, `snapshot-stream-handoff`, `query-vs-log-cdc` and
   `isolation-anomalies` all resolve live.
2. **Pre-notes.** 7 bullets (partition, change-event key, transaction, commit order, transaction
   id, event count, orphan row — `CHAPTER.md`'s own syllabus terms for this topic), each under
   the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 515) splits at its
   own semicolons into four clauses: per-key order via primary-key partitioning, loss of
   cross-table and cross-partition order, transaction metadata to reassemble transactions
   downstream, and what "exactly-once" means across many topics. `coverage.json`'s `syllabus`
   array matches this four-clause breakdown exactly, copied word for word from the raw syllabus
   file (verified by a direct substring check that leaves zero characters uncovered).
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`, reading a
   real logical-decoding slot's own `lsn`, `xid` and `data` columns directly against this
   sandbox's own real PostgreSQL 16 cluster, including the uncommitted-insert proof, the
   deliberately interleaved per-key proof, and the cross-table break-then-reassemble pair built
   from the identical one-commit transaction.
5. **Engagement.** Hook (step 1, one commit's own items arriving before its order and dropping a
   join); predict within the first four steps (step 2, whether a cross-table commit breaks the
   same way a single row's changes would); three takeaways across the reveal steps (steps 4, 6,
   8); recap (step 9) names the two different guarantees side by side (per-key order needs
   nothing extra, cross-table order needs a consumer's own bookkeeping); "Prove it" (step 10)
   generalizes the exact same question to several topics at once, directly setting up the
   handoff.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran, having learned from topic 13's own two caught violations
   this session: every step explains *why* a measurement comes out the way it does (why a
   row's own key survives a split the way a transaction's own identity doesn't; why the closing
   marker's own count is what lets a consumer know when to stop waiting) rather than reading the
   figure's own on-screen labels or restating the predict question verbatim. The build's own
   narration-teaches check passed on the first attempt. No digits and no underscored identifiers
   appear in `reel.tsx`, `scenes.tsx` or `narration.json`, checked with `grep` and a Python
   script.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was checked and fixed with a Python script before
   the build ran; `grep` for digits in visible text returns no matches in the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: three of four takeaways (23, 26 and 21 words
   on earlier drafts) needed trimming down to 20, 18 and 18; the fourth (17) needed no change.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster before writing the reel.
   Every scratch table and replication slot this topic creates is confirmed dropped after each
   run, and the shared `orders` table is confirmed unchanged at 50001 rows throughout — this
   topic never touches `orders` itself, using its own scratch tables for every measurement
   instead, since the lab's hand-written reassembly logic needed controlled, repeatable
   transaction boundaries rather than the shared table's own fixed shape.
4. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM or Kafka, so Debezium's own transaction-metadata implementation (its dedicated topic, the
   `provide.transaction.metadata` setting, and the deploy-time limitation) is quoted in
   `SOURCES.md` rather than reproduced; this topic's own reassembly logic reproduces the
   identical `txID:LSN`/`event_count`/`data_collections` design by hand against real slot
   output, not Debezium's own implementation. Enabling PostgreSQL's own `stream_*` output-plugin
   callbacks was likewise disclosed as named-only, since this sandbox's `test_decoding` plugin
   does not use them by default.
5. One sourcing limitation, disclosed rather than fabricated: the Kafka 4.4 "Design" page is a
   JavaScript-rendered single-page app that returns only a redirect shell to a plain fetch; no
   independent quote from it appears in `SOURCES.md`, since `CHAPTER.md`'s own "Leaves out" line
   already defers Kafka's partition-ordering guarantee to Chapter 9 topic 7 as used, not
   re-taught, so this topic needed no quote from that page to stay in scope.

Final build: `cd site && npm run build` completed clean. `node scripts/sources.mjs check
<folder>` passed (7/7 quotes word for word). `PREVIEW_HELD=1 npm run build` completed clean; the
held-topic reel smoke test was run with `REEL_DEVICES=desktop` and `REEL_DEVICES=phone` as two
separate invocations of `tests/reels.mjs`, per the sandbox-level Playwright flakiness noted in
earlier topics' own reviews (`check-all.mjs`'s own combined-device invocation hangs when both
devices run in one process) — both passed.
