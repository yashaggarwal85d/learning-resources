# Review — de.debezium-architecture-event-model

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 18's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line
(Transactional outbox pattern).

1. **Flow.** The bridge answers topic 18's own handoff verbatim-in-spirit ("The pieces are all
   here...") and this topic's own handoff matches `CHAPTER.md`'s own handoff into topic 20
   (Debezium turns database changes into events; a second thing teams want is the outbox
   pattern). Checked all six named `uses` ids via `grep -n "introduces: \[.*'<id>'"` against
   `registry.ts`: `logical-decoding-slot`, `cdc-delete-tombstone`,
   `cdc-source-offset-vs-kafka-offset`, `snapshot-modes`, `cdc-ordering-transaction-metadata` and
   `cdc-schema-evolution-resnapshot` all resolve live.
2. **Pre-notes.** 8 bullets (Kafka Connect, connector, SMT, envelope, op, source block, sink
   connector, upsert — `CHAPTER.md`'s own syllabus terms for this topic), each under the
   per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 519) splits at its
   own semicolons into four clauses: Debezium 3.x and its three deployment shapes; the
   change-event envelope; single-message transforms; and the JDBC sink connector.
   `coverage.json`'s `syllabus` array matches this four-clause breakdown exactly, copied word
   for word from the raw syllabus file (backticks around `before`/`after`/`source`/`op`/`ts_ms`
   stripped, matching `syllabus.ts`'s own `clean()` normalization, caught and fixed on the first
   build attempt); verified by a direct substring check that leaves zero characters uncovered.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`: the envelope
   rebuild from a real insert and update, the unwrap transform applied to both a real update
   and a real delete, and a real upsert applied twice to a real sink table.
5. **Engagement.** Hook (step 1, an unwrapped topic that can no longer tell a read from an
   insert); predict within the first four steps (step 2, whether column values alone are
   enough); three takeaways across the reveal steps (steps 4, 6, 8) plus a fourth on the recap
   (step 9); "Prove it" (step 10) generalizes the idempotent-upsert claim to a sink that never
   configures it, directly reusing the hook's own stakes from the opposite direction.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran: every step explains *why* a measurement comes out the way
   it does (why the unwrapped record carries no trace of which op produced it; why idempotence
   is tied to one specific setting rather than automatic) rather than reading the figure's own
   on-screen labels or restating the predict question verbatim. Code-style tokens such as
   `before`, `after`, `op` and `insert.mode=upsert` are spoken in narration as "the slot meant
   for what the row looked like beforehand," "what kind of change it was," or "that
   update-or-insert setting" rather than read literally. The build's own narration-teaches check
   passed on the first attempt. No digits and no underscored identifiers appear in `reel.tsx`,
   `scenes.tsx` or `narration.json`, checked with `grep` and a Python script; every narration
   line is confirmed at or under the 50-word-per-line ceiling by the same script (longest line:
   31 words).

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was written to stay within the house style's usual
   one-to-three-word guideline per side; `grep` for digits in visible text returns no matches in
   the final file (only `duration:` lines and comment text, excluded by the build's own check).
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before the build ran: all four takeaways (14, 13, 13, 12 words)
   passed on the first draft, none needed trimming.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster before writing the reel,
   including a fix caught on the first run: the delete-handling function needed `REPLICA
   IDENTITY FULL` set on its own scratch table before the delete's own before-image would carry
   column values rather than only the key, matching topic 17's own identity-dependent behavior.
   Every scratch table and replication slot this topic creates is confirmed dropped after each
   run (`slots []`, `tables []` via a direct Python check), and the shared `orders` table is
   confirmed unchanged at 50001 rows throughout.
4. One genuine source substitution, disclosed rather than hidden: CHAPTER.md names Kafka's own
   Connect user guide for one supporting detail, but, as with earlier topics in this chapter,
   that page serves only a client-rendered redirect shell to a plain fetch — confirmed directly
   before substituting Confluent's own Kafka Connect configuration reference, disclosed as a
   substitute in `SOURCES.md`, `references.md` and `prerequisites.mdx` rather than passed off as
   the Apache page itself.
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM or Kafka, so no real Debezium deployment, Kafka Connect cluster or JDBC sink connector
   can be run directly. The three deployment shapes, their sink targets, and the JDBC sink's own
   `schema.evolution` and `delete.enabled` settings are named and quoted only in `SOURCES.md`;
   every other claim in this topic — the envelope rebuild, the unwrap transform, and the
   idempotent-upsert proof — is measured directly against this sandbox's own real PostgreSQL 16
   cluster's own logical-decoding primitives, with a hand-built envelope and unwrap function
   standing in for Debezium's own implementation, confirmed by inspection to contain no
   simplification of the documented mechanism.

Final build: `cd site && npm run build` completed clean (238 pages), after one fix to
`coverage.json`'s first clause (stripping backticks to match `syllabus.ts`'s own `clean()`
normalization). `node scripts/sources.mjs check <folder>` passed (12/12 quotes word for word).
`PREVIEW_HELD=1 npm run build` completed clean; the held-topic reel smoke test was run with
`REEL_DEVICES=desktop` and passed, reporting both desktop and phone sizes.
