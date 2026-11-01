# Review — de.initial-snapshot-stream-handoff

## Content review, self-review, 2026-11-01

Read cold: `CHAPTER.md`'s entry for this topic, topic 12's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (incremental
snapshots with watermark windows).

1. **Flow.** The bridge answers topic 12's own handoff verbatim-in-spirit ("A slot protects a
   position in the log, but a new consumer has no position yet...") and this topic's own
   handoff matches `CHAPTER.md`'s own handoff into topic 14 (the snapshot's weakness, Netflix's
   DBLog fix). Checked all four named `uses` ids via the registry-parsing script:
   `logical-decoding-slot`, `consistent-snapshot-export`, `snapshot-isolation` and
   `slot-wal-retention-incident` all resolve live.
2. **Pre-notes.** 7 bullets (snapshot, consistent read, exported snapshot, cutover position,
   gap, overlap, snapshot mode — `CHAPTER.md`'s own syllabus terms for this topic), each under
   the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.2, line 513) splits at
   its own semicolon into two clauses: the exported-snapshot/no-gap-no-overlap clause, and the
   snapshot-modes clause. `coverage.json`'s `syllabus` array matches this two-clause breakdown
   exactly, copied word for word from the raw syllabus file (the build's own coverage checker
   initially rejected a three-clause split and a backtick-containing clause, since its parser
   strips backticks from the raw markdown before matching — both fixed before this review).
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`, run against
   this sandbox's own real PostgreSQL 16 cluster, including a genuine replication-protocol
   `CREATE_REPLICATION_SLOT ... EXPORT_SNAPSHOT` call confirmed working by direct experiment
   before any topic content was written.
5. **Engagement.** Hook (step 1, a connector killed most of the way through a huge snapshot
   restarts from zero while WAL keeps pinning); predict within the first four steps (step 2,
   whether the restart resumes or begins again); three takeaways across the reveal steps (steps
   4, 6, 8); recap (step 9) names the single design choice behind every measurement; "Prove it"
   (step 10) names the mode that fits a connector needing only fresh rows, directly setting up
   the handoff into topic 14.
6. **Narration teaches.** The build's own narration-teaches check caught step 9's and step 10's
   first drafts echoing the reel's own description sentences almost verbatim ("the exported
   snapshot and the stream share one seam by construction"; the full predict question restated
   near word for word); both rewritten to explain the underlying design choice and to ask the
   question in the narrator's own words rather than the figure's caption, confirmed passing on
   rebuild. Checked the remaining narration lines against description/body text by hand
   afterward: every step explains *why* a measurement comes out the way it does (why nothing is
   recorded until the very last step; why the snapshot and the stream's start position are one
   seam, not two) rather than reading the figure's own on-screen labels back. No digits and no
   underscored identifiers appear in `reel.tsx`, `scenes.tsx` or `narration.json`, checked with
   `grep`.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-11-01

1. Every `scenes.tsx` `Row` label/value pair was checked and fixed with a Python script before
   the build ran: nine pairs exceeded three words across two drafting passes and were trimmed;
   `grep` for digits in visible text returns no matches in the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: two of four takeaways (21 and 24 words on the
   first draft) needed trimming down to 18 and 19; the other two (16 and 19) needed no change.
3. `examples.py` was run to completion twice (`python3 examples.py` → "all checks passed" both
   times) against this sandbox's own real PostgreSQL 16 cluster before writing the reel. Every
   scratch table and replication slot this topic creates is confirmed dropped after each run,
   the shared `orders` table is confirmed unchanged at 50001 rows both times, and no stray
   replication slot was left behind — including the diagnostic `topic13_probe` slot from this
   topic's own early investigation, dropped explicitly before any of this topic's real
   functions were written.
4. One genuine mechanism confirmed by direct experiment before writing any topic content: a
   plain SQL `pg_create_logical_replication_slot()` call does not export a snapshot usable the
   way CHAPTER.md's scope line describes; only the replication protocol's own
   `CREATE_REPLICATION_SLOT ... EXPORT_SNAPSHOT`, issued over a connection opened with
   `replication=database`, does — confirmed with `psql` first, then reproduced directly in
   `psycopg` (v3) for `examples.py`, since psycopg has no higher-level wrapper for the
   replication protocol.
5. One genuine environment constraint, disclosed rather than worked around: this sandbox has no
   MySQL, Oracle or SQL Server server (confirmed absent in topic 11) and no JVM/Kafka to run
   Debezium itself, so the MySQL global-read-lock sequence and the behaviour of each named
   snapshot mode under a real connector are quoted in `SOURCES.md` rather than reproduced.

Final build: `cd site && npm run build` completed clean (238 pages). `node
scripts/check-all.mjs --changed --skip reels` passed every check (locked, docs, sources, build,
narration, links); the `reels` check was run separately per the sandbox-level Playwright
flakiness noted in topic 7's own review (`check-all.mjs`'s own combined-device invocation hangs
when both devices run in one process), using `PREVIEW_HELD=1 REEL_DEVICES=desktop` and
`REEL_DEVICES=phone` as two separate invocations of `tests/reels.mjs` — both passed. The
unrelated `npm run test:editor` check and five pre-existing link title-mismatches (topics shipped
in earlier sessions) are known, pre-existing sandbox limitations unrelated to anything this
topic touches.
