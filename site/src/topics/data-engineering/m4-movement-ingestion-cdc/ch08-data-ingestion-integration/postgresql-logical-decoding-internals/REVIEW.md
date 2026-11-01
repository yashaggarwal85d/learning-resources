# Review — de.postgresql-logical-decoding-internals

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 9's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (MySQL
binlog and other change logs).

1. **Flow.** The bridge answers topic 9's own handoff verbatim-in-spirit ("Reading the database's
   own log is complete and cheap... This topic opens PostgreSQL's") and this topic's own handoff
   matches `CHAPTER.md`'s own handoff into topic 11 (PostgreSQL remembers a consumer's place with
   a slot; MySQL keeps its own position in a file-based log). Checked all four named `uses` ids
   via the registry-parsing script: `wal-lsn-fsync`, `checkpoint-recovery-redo-undo`,
   `physical-vs-logical-replication` and `query-vs-log-cdc` all resolve live.
2. **Pre-notes.** 8 bullets (WAL, LSN, logical decoding, replication slot, output plugin,
   publication, `REPLICA IDENTITY`, hot standby, failover — `CHAPTER.md`'s own syllabus terms for
   this topic), each under the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.2, line 510) splits at
   its own semicolon into two clauses: WAL/slots/plugins/publications/`REPLICA
   IDENTITY`/the two LSN positions, versus standby decoding and failover-synchronised slots.
   `coverage.json`'s `syllabus` array matches this two-clause breakdown exactly, copied verbatim
   from the raw syllabus file.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against this topic's own measured facts and the PostgreSQL documentation's own wording, not
   invented reasoning. Every measured claim traces to a specific function in `examples.py`, run
   against this sandbox's own real PostgreSQL 16 cluster — not a mock of logical decoding.
5. **Engagement.** Hook (step 1, the same update decoded three times under three `REPLICA
   IDENTITY` settings); predict within the first four steps (step 2, whether an unconfirmed peek
   repeats); three takeaways across the reveal steps (steps 4, 6, 8); recap (step 9) names the
   trade the rest of the topic's measurements feed; "Prove it" (step 10) names what a single
   server's own bookkeeping doesn't cover, setting up topic 11's own engine comparison directly.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* a measurement comes out the way it does (why `REPLICA
   IDENTITY` decides the before-image, not the plugin; why a slot's position only moves on
   confirmation, not on a mere read; why `restart_lsn` and `confirmed_flush_lsn` protect two
   different things) rather than reading the figure's own on-screen labels back. No digits appear
   in `reel.tsx`, `scenes.tsx` or `narration.json`, checked with `grep` after one comment-wording
   fix in `reel.tsx` caught and corrected before the build ran.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was written at 1-3 words from the first draft,
   checked and fixed twice before the build ran (one 4-word value, one 4-word label); `grep` for
   digits returns no matches in the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: three of four takeaways (21, 23 and 23 words)
   needed trimming down to 19, 19 and 20; the fourth (20) needed no change.
3. `examples.py` was run to completion twice (`python3 examples.py` → "all checks passed" both
   times) against this sandbox's own real PostgreSQL 16 cluster before writing the reel, so every
   figure on screen matches a number actually measured against a live server. Every scratch table
   and replication slot this topic creates is confirmed dropped after each run (`pg_lsclusters`,
   `pg_replication_slots`, `information_schema.tables` all checked clean), and the shared `orders`
   table this topic does not touch was confirmed unchanged.
4. One genuine environment constraint, disclosed rather than worked around: this sandbox runs
   PostgreSQL 16, which has neither the PG17 `failover` slot argument nor the
   `failover`/`synced` columns on `pg_replication_slots`. `examples.py`'s own
   `failover_slot_is_not_available_on_this_server` confirms this directly, and the failover-slot
   leg of the lab is sourced from the PG17 release notes and Debezium's documentation instead of
   a live measurement, exactly as `CHAPTER.md`'s own "Leaves out" line allows.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches. The held-topic
reel smoke test was run with `REEL_DEVICES=desktop` and `REEL_DEVICES=phone` as two separate
invocations, per the sandbox-level Playwright flakiness noted in topic 7's own review.
