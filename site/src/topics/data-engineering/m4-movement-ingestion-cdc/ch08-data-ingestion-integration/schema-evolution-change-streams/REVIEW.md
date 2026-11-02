# Review — de.schema-evolution-change-streams

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 15's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (deletes
and tombstones).

1. **Flow.** The bridge answers topic 15's own handoff verbatim-in-spirit ("Order and atomicity
   cover the rows...") and this topic's own handoff matches `CHAPTER.md`'s own handoff into
   topic 17 (a column added is the most polite change; a row that stops existing is the rudest).
   Checked all four named `uses` ids via the registry-parsing script: `mysql-binlog-gtid-schema-history`,
   `watermark-window-incremental-snapshot`, `logical-decoding-slot` and `data-contract-specification`
   all resolve live.
2. **Pre-notes.** 7 bullets (DDL, schema version, schema registry, nullable column, widening,
   backward-compatible, re-snapshot — `CHAPTER.md`'s own syllabus terms for this topic), each
   under the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 516) has exactly one
   semicolon, splitting into two clauses: capturing DDL/schema history/propagation through a
   registry into sinks, and incompatible changes that require re-snapshot. `coverage.json`'s
   `syllabus` array matches this two-clause breakdown exactly, copied word for word from the raw
   syllabus file (verified by a direct substring check that leaves zero characters uncovered).
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`, run against
   this sandbox's own real PostgreSQL 16 cluster and a real DuckDB sink reached from the same
   process: the no-DDL-event proof, the add/drop pair sharing one table and slot, and the
   widen/narrow pair that isolates the sink's own reaction as the only variable that changes.
5. **Engagement.** Hook (step 1, a Friday retype whose sink silently rounds away every fraction
   from then on); predict within the first four steps (step 2, loud error or silence for a
   dropped column); three takeaways across the reveal steps (steps 4, 6, 7) plus a fourth on the
   recap (step 9); "Prove it" (step 10) generalizes to a schema registry's own gating role,
   directly setting up the handoff.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran, having learned from topic 13's own two caught violations
   this session: every step explains *why* a measurement comes out the way it does (why neither
   an add nor a drop gets announced; why the identical retype mechanism produces such different
   outcomes depending on whether the sink keeps up) rather than reading the figure's own
   on-screen labels or restating the predict question verbatim. The build's own narration-teaches
   check passed on the first attempt. No digits and no underscored identifiers appear in
   `reel.tsx`, `scenes.tsx` or `narration.json`, checked with `grep` and a Python script.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was checked and fixed with a Python script before
   the build ran: eighteen pairs exceeded three words on the first draft across several trimming
   passes; `grep` for digits in visible text returns no matches in the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: two of four takeaways (23 and 21 words on the
   first draft) needed trimming down to 20 each; the other two (15, 20) needed no change.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster and a real, in-memory
   DuckDB sink before writing the reel. Every scratch table, replication slot and DuckDB
   connection this topic creates is confirmed dropped or closed after each run, and the shared
   `orders` table is confirmed unchanged at 50001 rows throughout — this topic never touches
   `orders` itself, using its own scratch tables for every measurement instead.
4. One genuine measured surprise, disclosed and verified rather than assumed: DuckDB's own
   behavior writing a fractional value into a column still typed as an integer is a silent
   round to the nearest whole number, not a truncation toward zero and not an error — confirmed
   directly with a small standalone experiment before writing the lab's own assertions, and
   phrased in the reel and narration as "rounded away," matching the measured behavior exactly
   rather than the more common but less accurate word "truncated."
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM or Kafka, so Debezium's own MySQL connector, JDBC sink connector and Flink CDC itself
   cannot be run directly, and their own documented behavior is quoted in `SOURCES.md` rather
   than reproduced; this sandbox also has no MySQL server (confirmed absent in topic 11), so
   MySQL's own binlog-carried DDL is named only, for contrast with PostgreSQL's measured silence.

Final build: `cd site && npm run build` completed clean (238 pages). `node scripts/sources.mjs
check <folder>` passed (10/10 quotes word for word). `PREVIEW_HELD=1 npm run build` completed
clean; the held-topic reel smoke test was run with `REEL_DEVICES=desktop` and
`REEL_DEVICES=phone`, per the sandbox-level Playwright flakiness noted in earlier topics' own
reviews — both passed.
