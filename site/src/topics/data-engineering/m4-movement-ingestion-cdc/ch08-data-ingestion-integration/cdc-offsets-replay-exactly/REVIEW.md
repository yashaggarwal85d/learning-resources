# Review — de.cdc-offsets-replay-exactly

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 17's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (Debezium
architecture and event model).

1. **Flow.** The bridge answers topic 17's own handoff verbatim-in-spirit ("Every record in this
   chapter has carried a position...") and this topic's own handoff matches `CHAPTER.md`'s own
   handoff into topic 19 (the pieces are all here — a slot, a snapshot, events, offsets). Checked
   all five named `uses` ids via `grep -n "introduces: \[.*'<id>'"` against `registry.ts`:
   `exactly-once-effect-recipe`, `logical-decoding-slot`, `snapshot-modes`, `slot-safety-valves`
   and `mysql-binlog-gtid-schema-history` all resolve live.
2. **Pre-notes.** 7 bullets (source offset, Kafka offset, offset commit, at-least-once,
   exactly-once, fencing, Jepsen — `CHAPTER.md`'s own syllabus terms for this topic), each under
   the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` line 518) splits at its
   own semicolons into four clauses: two positions and how Kafka Connect stores source offsets;
   Kafka Connect's own exactly-once source support (KIP-618); Debezium's own lack of a dedup
   layer; and recovery when the source position has been purged. `coverage.json`'s `syllabus`
   array matches this four-clause breakdown exactly, copied word for word from the raw syllabus
   file; verified by a direct substring check that leaves zero characters uncovered.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`: the
   crash-and-replay proof and its committed-in-time contrast against this sandbox's own real
   PostgreSQL, the naive-versus-dedup read of one identical duplicated batch, and the
   purged-slot failure and its only recovery.
5. **Engagement.** Hook (step 1, a killed connector pod replays five thousand events and
   doubles a downstream counter); predict within the first four steps (step 2, whether the
   restart skips or repeats the batch); three takeaways across the reveal steps (steps 4, 6, 8)
   plus a fourth on the recap (step 9); "Prove it" (step 10) generalizes to whether exactly-once
   source support alone protects a downstream consumer, directly setting up the Debezium
   no-dedup-layer claim one more time from the opposite direction.
6. **Narration teaches.** Checked every narration line against the reel's own description/body
   text by hand before the build ran: every step explains *why* a measurement comes out the way
   it does (why a peek-only read has nothing to consult in order to skip a batch; why a
   transaction closes the exact gap the hook's own crash fell into) rather than reading the
   figure's own on-screen labels or restating the predict question verbatim. Code-style tokens
   such as `pg_logical_slot_peek_changes`, `pg_replication_slot_advance` and
   `exactly.once.source.support` are spoken in narration as "a read," "telling the source to
   move past it" or "that guarantee" rather than read literally. The build's own
   narration-teaches check passed on the first attempt. No digits and no underscored
   identifiers appear in `reel.tsx`, `scenes.tsx` or `narration.json`, checked with `grep` and a
   Python script; every narration line is confirmed at or under the 50-word-per-line ceiling by
   the same script (longest line: 44 words).

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was written to stay within the house style's
   usual one-to-three-word guideline per side; `grep` for digits in visible text returns no
   matches in the final file (only `duration:` lines and comment text, excluded by the build's
   own check).
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before the build ran: all four takeaways (17, 14, 16, 18 words)
   passed on the first draft, none needed trimming.
3. `examples.py` was run to completion three times (`python3 examples.py` → "all checks passed"
   every time) against this sandbox's own real PostgreSQL 16 cluster before writing the reel.
   Every scratch table and replication slot this topic creates is confirmed dropped after each
   run (`slots []`, `tables []` via a direct Python check), and the shared `orders` table is
   confirmed unchanged at 50001 rows throughout — this topic never touches `orders` itself,
   using its own scratch tables and slots for every measurement instead.
4. One genuine source substitution, disclosed rather than hidden: CHAPTER.md names Kafka's own
   Connect user guide for the offset-storage-topic and configuration-property claims, but, as
   with earlier topics in this chapter, that page serves only a client-rendered redirect shell
   to a plain fetch — confirmed directly before substituting Confluent's own Kafka Connect
   configuration reference, which documents the identical worker properties in plain HTML and
   is disclosed as a substitute in `SOURCES.md`, `references.md` and `prerequisites.mdx` rather
   than passed off as the Apache page itself.
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   JVM, broker or Kafka Connect cluster, so KIP-618's own transactional exactly-once source
   support is quoted and sourced only in `SOURCES.md`, never reproduced; every other claim in
   this topic — the crash-and-replay, the committed-in-time contrast, the naive-versus-dedup
   measurement and the purged-position failure and recovery — is measured directly against this
   sandbox's own real PostgreSQL 16 cluster's logical-decoding primitives, with no simplified
   stand-in substituted for any of them.

Final build: `cd site && npm run build` completed clean (238 pages). `node scripts/sources.mjs
check <folder>` passed (12/12 quotes word for word). `PREVIEW_HELD=1 npm run build` completed
clean; the held-topic reel smoke test was run with `REEL_DEVICES=desktop` and passed, reporting
both desktop and phone sizes.
