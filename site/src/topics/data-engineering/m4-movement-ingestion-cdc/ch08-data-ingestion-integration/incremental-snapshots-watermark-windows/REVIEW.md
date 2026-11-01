# Review — de.incremental-snapshots-watermark-windows

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 13's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (ordering
and transaction boundaries).

1. **Flow.** The bridge answers topic 13's own handoff verbatim-in-spirit ("The snapshot has a
   weakness... The fix was published by Netflix...") and this topic's own handoff matches
   `CHAPTER.md`'s own handoff into topic 15 (snapshot rows and streamed changes now share one
   stream; what order it preserves is the next topic). Checked all four named `uses` ids via the
   registry-parsing script: `snapshot-stream-handoff`, `snapshot-modes`, `logical-decoding-slot`
   and `parallel-range-extraction` all resolve live.
2. **Pre-notes.** 7 bullets (primary key, chunk, watermark, signal table, READ event, supersede,
   buffer — `CHAPTER.md`'s own syllabus terms for this topic), each under the per-term format,
   no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.2, line 514) splits at
   its own semicolons into three clauses: the chunked-watermark mechanism, the signal/Kafka/
   read-only variants, and re-snapshotting one table without stopping CDC. `coverage.json`'s
   `syllabus` array matches this three-clause breakdown exactly, copied word for word from the
   raw syllabus file.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`, implementing
   DBLog's own Algorithm 1 by hand and run against this sandbox's own real PostgreSQL 16
   cluster, including a full chunked run under genuinely concurrent writes and an independent
   pause-and-resume comparison between two separate runs.
5. **Engagement.** Hook (step 1, a chunk's own row resurrected by a concurrent delete without a
   marker); predict within the first four steps (step 2, whether the deleted order comes back);
   three takeaways across the reveal steps (steps 4, 6, 8); recap (step 9) names the single
   two-marker mechanism behind all three claims (supersede, no lock, pause/resume); "Prove it"
   (step 10) names the signal mechanism for a late-added table, directly setting up the handoff.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran, having learned from topic 13's own two caught violations
   this session: every step explains *why* a measurement comes out the way it does (why a
   chunk's own read is provisional, not final; why the algorithm's only writes are the two
   watermark updates; why a stopped run costs nothing extra to resume) rather than reading the
   figure's own on-screen labels or restating the predict question verbatim. The build's own
   narration-teaches check passed on the first attempt. No digits and no underscored identifiers
   appear in `reel.tsx`, `scenes.tsx` or `narration.json`, checked with `grep`.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was checked and fixed with a Python script before
   the build ran: six pairs exceeded three words across several trimming passes; `grep` for
   digits in visible text returns no matches in the final file (one digit, `arXiv:2010.12597`,
   was found in `reel.tsx`'s own leading comment on the first draft and removed, since the
   build's own check treats the whole file, not only JSX text).
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: three of four takeaways (23, 22 and 22 words on
   the first draft) needed trimming down to 20, 19 and 19; the fourth (19) needed no change.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster before writing the reel.
   Every scratch table and replication slot this topic creates is confirmed dropped after each
   run, and the shared `orders` table is confirmed unchanged at 50001 rows throughout — this
   topic never touches `orders` itself, using its own scratch tables for every measurement
   instead, since the lab's 60-line hand-written algorithm needed controlled, repeatable chunk
   boundaries rather than the shared table's own fixed shape.
4. One genuine design choice, disclosed rather than hidden: this topic's own chunk sizes (20-40
   rows) are smaller than Debezium's documented default of 1,024 rows, chosen deliberately to
   keep each measured run fast; `FACT-CHECK.md` and `OUTLINE.md` both record this as a disclosed
   choice, not a claim about Debezium's own default behaviour.
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM or Kafka, so Debezium's own buffered-window implementation, its signal table, its Kafka
   signalling topic, and its read-only watermark variants are quoted in `SOURCES.md` rather than
   reproduced; this sandbox also has no MySQL server (confirmed absent in topic 11), so the
   GTID-based read-only variant is named only.

Final build: `cd site && npm run build` completed clean (238 pages). `node scripts/sources.mjs
check <folder>` passed (14/14 quotes word for word). `PREVIEW_HELD=1 npm run build` completed
clean; the held-topic reel smoke test was run with `REEL_DEVICES=desktop` and
`REEL_DEVICES=phone` as two separate invocations of `tests/reels.mjs`, per the sandbox-level
Playwright flakiness noted in topic 7's own review (`check-all.mjs`'s own combined-device
invocation hangs when both devices run in one process) — both passed.
