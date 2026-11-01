# Review — de.transactional-outbox-pattern

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 19's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (Flink CDC
pipelines).

1. **Flow.** The bridge answers topic 19's own handoff verbatim-in-spirit ("Debezium turns
   database changes into events...") and this topic's own handoff matches `CHAPTER.md`'s own
   handoff into topic 21 (everything so far assumed a Kafka cluster in the middle). Checked all
   five named `uses` ids via `grep -n "introduces: \[.*'<id>'"` against `registry.ts`:
   `debezium-architecture-envelope`, `cdc-ordering-transaction-metadata`,
   `cdc-schema-evolution-resnapshot`, `slot-wal-retention-incident` and
   `exactly-once-effect-recipe` all resolve live.
2. **Pre-notes.** 6 bullets (dual write, outbox table, aggregate, domain event, event router,
   idempotent consumer — `CHAPTER.md`'s own syllabus terms for this topic), each under the
   per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 520) splits at its
   own single semicolon into two clauses: avoiding dual writes via an outbox table and the
   outbox event router; and ordering, payload design, outbox cleanup, and why it beats
   application-level publish-after-commit. `coverage.json`'s `syllabus` array matches this
   two-clause breakdown exactly, copied word for word from the raw syllabus file; verified by a
   direct substring check that leaves zero characters uncovered. The expert list needed two
   extra items on the first build attempt to reach the required minimum of ten, added without
   weakening any existing item.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`: the
   dual-write crash and its outbox fix, the router's own routing and dedup behavior against two
   real decoded inserts, the ordering proof across four interleaved events, and the cleanup
   proof that captures a row before deleting it.
5. **Engagement.** Hook (step 1, an order service that crashes before publishing and loses the
   event entirely); predict within the first four steps (step 2, whether the lost publish is
   recoverable); four takeaways across the reveal steps (steps 4, 6, 7, 8) plus a fifth on the
   recap (step 9); "Prove it" (step 10) generalizes the cleanup-safety claim to immediate
   deletion, directly reusing the measured mechanism from step 8 to rule out the wrong answer.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran: every step explains *why* a measurement comes out the way
   it does (why nothing was ever written down for the crash to leave a trace of; why a delete
   filtered by the router is a separate concern from capture timing) rather than reading the
   figure's own on-screen labels or restating the predict question verbatim. Code-style tokens
   such as `aggregatetype`, `aggregateid` and `outbox.event.${routedByValue}` are spoken in
   narration as "what kind of aggregate the row is about," "which aggregate each row actually
   belonged to," or "a destination for each row" rather than read literally. The build's own
   narration-teaches check passed on the first attempt. No digits and no underscored
   identifiers appear in `reel.tsx`, `scenes.tsx` or `narration.json`, checked with `grep` and a
   Python script; every narration line is confirmed at or under the 50-word-per-line ceiling by
   the same script (longest line: 36 words).

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was written to stay within the house style's usual
   one-to-three-word guideline per side; `grep` for digits in visible text returns no matches in
   the final file (only `duration:` lines and comment text, excluded by the build's own check).
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before the build ran: all five takeaways (17, 16, 17, 15, 14
   words) passed on the first draft, none needed trimming.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster before writing the reel,
   including three fixes caught during development: the row-parsing helper needed to skip
   `BEGIN`/`COMMIT` lines rather than attempt to parse them as column data, the cleanup
   function's own captured-row count needed to filter for INSERT lines specifically, and the
   delete-kind check needed to filter out `None` kinds from `BEGIN`/`COMMIT` lines before
   comparing. Every scratch table and replication slot this topic creates is confirmed dropped
   after each run (`slots []`, `tables []` via a direct Python check), and the shared `orders`
   table is confirmed unchanged at 50001 rows throughout.
4. No source substitution was needed for this topic: every source CHAPTER.md names (Debezium's
   Outbox Event Router page, Debezium's PostgreSQL page, PostgreSQL 18's own function
   reference, and Debezium's Outbox Quarkus Extension page) was reachable directly as plain
   HTML, unlike the Apache Kafka pages substituted in earlier topics this chapter.
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM or Kafka, so Debezium's own Outbox Event Router SMT, the Quarkus outbox extension, and
   the `pg_logical_emit_message` table-free variant are named and quoted only in `SOURCES.md`;
   every other claim in this topic — the dual-write loss, the outbox fix, the routing and dedup
   behavior, the ordering guarantee, and the cleanup safety — is measured directly against this
   sandbox's own real PostgreSQL 16 cluster's logical-decoding primitives, with a hand-built
   outbox table and router function standing in for Debezium's own implementation, confirmed by
   inspection to contain no simplification of the documented mechanism.

Final build: `cd site && npm run build` completed clean (238 pages), after one fix to
`coverage.json`'s `expert.items` (adding two items to reach the required minimum of ten).
`node scripts/sources.mjs check <folder>` passed (7/7 quotes word for word, after one fix to
the Quarkus extension quote's own wording). `PREVIEW_HELD=1 npm run build` completed clean; the
held-topic reel smoke test was run with `REEL_DEVICES=desktop` and passed, reporting both
desktop and phone sizes.
