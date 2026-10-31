# Review — de.database-extraction-without-hurting

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 1's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 3's syllabus line (incremental
extraction with high-watermark cursors).

1. **Flow.** The bridge answers topic 1's handoff verbatim ("the most common thing it pulls from
   is a production database... the next question is how to read it without becoming the outage"),
   and the handoff to topic 3 matches `CHAPTER.md`'s own bridge text for topic 3 ("a full extract
   is safe but does the same work every night"). Checked all five named `uses` ids via a Node.js
   script parsing `registry.ts`'s `introduces` arrays: `connection-pool-sizing`,
   `vacuum-xid-wraparound`, `snapshot-isolation`, `physical-vs-logical-replication` and
   `ingestion-modes-ownership` all resolve live. No id needed to move to `declared` beyond
   `sql-select`, which `CHAPTER.md` itself names.
2. **Pre-notes.** 6 bullets (JDBC, partition column/bounds/fetch size, `COPY`, read replica,
   repeatable-read snapshot, dead tuple — `CHAPTER.md`'s own "Pre-notes terms" list), each under
   the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into the five clauses `CHAPTER.md` itself breaks it
   into (parallel range reads; bulk export/`COPY`; read-replica offloading; consistent multi-
   table snapshots; long-running extracts block vacuum and inflate replica lag). Copied each
   clause from the raw syllabus line and confirmed the five clauses union-cover the whole line;
   `coverage.json`'s `syllabus` array matches this breakdown one clause to one step each.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the topic's own cited mechanism (Spark's stride-not-filter language) and its own
   measured data (the sixty-four-partition run), not invented reasoning. The `hot_standby_feedback`
   claim in step 7 is checked against the exact PostgreSQL quote and does not overclaim that this
   topic ran a two-node replica — it is named and sourced, while the vacuum-pinning mechanism it
   shares with a long extract is measured directly on one machine in step 8.
5. **Engagement.** Hook (step 1, sixteen partitions configured, one still running at hour three
   while dead tuples climb); predict within the first four steps (step 2, which partition does
   the real work); three takeaways across the reveal steps (steps 4, 6, 8); recap (step 9);
   "Prove it" (step 10) extends the same skewed key to sixty-four partitions, a case not in the
   hook's own sixteen-partition scenario.
6. **Narration teaches.** Checked narration lines against description/body text by hand: every
   step's narration explains *why* the measurement comes out the way it does (the stride-not-
   filter mechanism, the snapshot-export guarantee, the vacuum-pinning mechanism) rather than
   reading the figure's on-screen numbers back. No digits appear in `reel.tsx`, `scenes.tsx` or
   `narration.json` — every number is spelled as a word, following the chapter's own "spoken
   numbers" rule in `CHAPTER.md`'s shared notation section.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was counted by hand against the 1-3-word guideline
   before running the smoke test. The first draft had several over-length values written with
   literal digits ("16, equal width", "2,000 rows", "partition 16", "50,001 rows", "10,000 dead
   tuples") — caught in the same pre-check sweep (this chapter's narration rule bans digits
   entirely, which forced spelling every number out, incidentally also keeping every value inside
   the word-count guideline once spelled out: "sixteen, equal width" is 3 words, "forty-eight
   thousand rows" is 3 words).
2. Takeaway word counts (em dash counted as its own word) checked by hand: all four takeaways
   (steps 4, 6, 8, 9) came in under the twenty-word limit without needing a trim.
3. `examples.py` was run to completion against this sandbox's real PostgreSQL 16 cluster
   (`python3 examples.py` → "all checks passed") immediately before writing the reel, so every
   figure on screen matches a number that was actually measured, not estimated.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches.
