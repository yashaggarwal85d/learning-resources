# Review — de.deletes-tombstones

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 16's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (CDC
offsets, replay and exactly-once).

1. **Flow.** The bridge answers topic 16's own handoff verbatim-in-spirit ("A column added is
   only the most polite change...") and this topic's own handoff matches `CHAPTER.md`'s own
   handoff into topic 18 (every record has carried a position; a Kafka offset is a second one).
   Checked all four named `uses` ids via the registry-parsing script: `replica-identity-before-image`,
   `cdc-schema-evolution-resnapshot`, `cursor-miss-modes` and `merge-statement` all resolve live.
2. **Pre-notes.** 7 bullets (tombstone, log compaction, soft delete, hard delete, delete file,
   retention window, MERGE — `CHAPTER.md`'s own syllabus terms for this topic), each under the
   per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 517) splits at its
   own semicolons into four clauses: delete events with before-images versus tombstones that let
   compaction drop the key; soft versus hard deletes; carrying deletes into table formats via
   MERGE/delete files; and the delete-retention window race. `coverage.json`'s `syllabus` array
   matches this four-clause breakdown exactly, copied word for word from the raw syllabus file
   (backticks around MERGE stripped, matching `syllabus.ts`'s own `clean()` normalization;
   verified by a direct substring check that leaves zero characters uncovered).
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`: the
   before-image proof against this sandbox's own real PostgreSQL, the soft/hard cursor contrast
   using one identical query, a real `MERGE` against a real landing table, and a hand-built
   compaction model that implements Kafka's own documented rule exactly rather than a simplified
   stand-in for it.
5. **Engagement.** Hook (step 1, a resurrected customer from a compacted-topic bootstrap);
   predict within the first four steps (step 2, whether compaction keeps both of a delete's
   records); four takeaways across the reveal steps (steps 4, 6, 7, 8) plus a fifth on the recap
   (step 9); "Prove it" (step 10) generalizes to sizing a sink's own maximum lag, directly
   setting up the handoff.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran, having learned from topic 13's own two caught violations
   this session: every step explains *why* a measurement comes out the way it does (why
   compaction's own rule structurally excludes the earlier delete record; why a consumer only
   has to be late, not wrong, to resurrect a row) rather than reading the figure's own on-screen
   labels or restating the predict question verbatim. Code-style tokens such as
   `delete.retention.ms` and `MERGE` are spoken in narration as "that setting," "that window" or
   "one single statement" rather than read literally. The build's own narration-teaches check
   passed on the first attempt. No digits and no underscored identifiers appear in `reel.tsx`,
   `scenes.tsx` or `narration.json`, checked with `grep` and a Python script.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was checked and fixed with a Python script before
   the build ran: five pairs exceeded three words on the first draft; `grep` for digits in
   visible text returns no matches in the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: three of five takeaways (21, 23 and 21 words on
   the first draft) needed trimming down to 17, 19 and 19; the other two (20, 20) needed no
   change.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster before writing the reel.
   Every scratch table, slot and temp table this topic creates is confirmed dropped after each
   run, and the shared `orders` table is confirmed unchanged at 50001 rows throughout — this
   topic never touches `orders` itself, using its own scratch tables for every measurement
   instead.
4. One genuine source substitution, disclosed rather than hidden: CHAPTER.md names the Apache
   Kafka 4.4 "Design" page for the tombstone and retention-window claims, but, as with an
   earlier topic in this chapter, that page serves only a client-rendered redirect shell to a
   plain fetch — confirmed directly before substituting Confluent's own log-compaction
   documentation, which covers the identical mechanism in plain HTML and is disclosed as a
   substitute in `SOURCES.md`, `references.md` and `prerequisites.mdx` rather than passed off as
   the Apache page itself.
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM or Kafka, so the retention-window race is measured against a hand-built model that
   implements Kafka's own documented compaction rule exactly (keep only the latest offset per
   key, drop a tombstone once it is older than the retention window), confirmed by inspection to
   contain no simplification of that rule, rather than against a real broker; Debezium's own
   event-flattening SMT and JDBC sink's `delete.enabled` are quoted in `SOURCES.md` for the same
   reason.

Final build: `cd site && npm run build` completed clean (238 pages). `node scripts/sources.mjs
check <folder>` passed (9/9 quotes word for word). `PREVIEW_HELD=1 npm run build` completed
clean; the held-topic reel smoke test was run with `REEL_DEVICES=desktop` and
`REEL_DEVICES=phone`, per the sandbox-level Playwright flakiness noted in earlier topics' own
reviews — both passed.
