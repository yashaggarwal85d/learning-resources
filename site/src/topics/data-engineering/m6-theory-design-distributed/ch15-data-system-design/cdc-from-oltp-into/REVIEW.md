# Review — de.cdc-from-oltp-into

## Content review, self-review, 2026-10-30

Read cold: `CHAPTER.md`'s entry for this topic, topic 13's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then topic 15's syllabus line (concurrent
writers and time travel).

1. **Flow.** The bridge answers topic 13's handoff verbatim, and the handoff to topic 15 matches
   `CHAPTER.md`'s own bridge text exactly. Checked each explicitly named `uses`/`declared` id via
   a Node.js script parsing `registry.ts` and checking each entry's own `introduces` array:
   Chapter 5's and Chapter 2's named ids, plus `data-contract-specification`, are confirmed live;
   Chapter 13 and Chapter 14 (data-engineering) are both confirmed entirely unplanned in
   `registry.ts` (zero topics under either chapter number), so their six named ids move to
   `declared`, reusing `CHAPTER.md`'s own literal names as the placeholder convention already
   established in topics 10, 12 and 13 for `cdc-log-based-capture` and
   `iceberg-delta-table-format-tradeoffs` — both reused here as-is for the same two gaps
   (Chapter 8 §8.2 and Chapter 6 §6.3).
2. **Pre-notes.** 9 bullets (CDC, write-ahead log, replication slot, snapshot, Kafka topic,
   merge, merge-on-read, compaction, schema evolution — `CHAPTER.md`'s own "Pre-notes terms"
   list), each under the per-term format, no links.
3. **Gap hunt.** The syllabus line splits into six clauses by `CHAPTER.md`'s own breakdown
   (the CDC-to-merge pipeline with its exactly-once effect; snapshot-plus-stream handover;
   deletes; schema change; replication-slot safety; compaction of MOR tables). Copied each
   clause byte-for-byte from the raw syllabus line (confirmed via Python's `repr()` on the raw
   line, including the exact Unicode `→` arrows and `§` section marks) and confirmed the six
   clauses union-cover every word of the line.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms the `max_slot_wal_keep_size` cap
   claim and both Debezium claims (the outage-retention guarantee, the heartbeat fix) trace to
   SOURCES.md's own quoted PostgreSQL and Debezium documentation, and that neither source is
   stretched to cover logical-decoding internals, the Debezium/Kafka Connect mechanics, or
   table-format MOR internals, each of which `CHAPTER.md` explicitly leaves to its own home
   chapter.
5. **Engagement.** Hook (step 1, a CDC connector stopped over a weekend, the source disk nearly
   full by midweek after nine healthy months); predict within the first four steps (step 2,
   which single setting bounds the slot and what the bound costs); three takeaways (steps 4, 6,
   8); recap (step 9); "Prove it" (step 10) extends the slot-growth-rate-versus-cap reasoning to
   a second, already-most-of-the-way-there slot rather than restating the hook's own scenario.
6. **Narration teaches.** `node scripts/narration-teaches.mjs` flags nothing: 2-12% description
   overlap on every step, longest line 39 words. No digit or VERBATIM issues this time — this
   topic's heavy technical terminology (WAL, LSN, slot, MOR) was written out descriptively in
   both the narration and the reel/scenes text from the start, having learned from topic 13's
   "SCD Type 2" digit flag not to introduce numbered or symbol-bearing names in on-screen or
   spoken text.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-30

Opened the reel smoke test result after the `PREVIEW_HELD=1` run.

1. Astro's build-time check (QUALITY.md #35, #50, #54, #59) initially flagged three takeaways
   for exceeding the twenty-word limit (steps 4, 6, 8) — each trimmed to fit, with the third
   needing a second pass after the word-count tool's own em-dash-as-token counting caught a
   miscount on the first trim.
2. Every `scenes.tsx` row was counted by hand against the 1-3-word guideline before running the
   smoke test (several rows across the session's other topics ran to four or five words), and
   two rows in `ProveIt` and one in `Recap` were caught and fixed in this same pre-check sweep.

Final run: "Reel smoke test passed: 1 live reel(s) at desktop and phone sizes" (`PREVIEW_HELD=1`,
since this topic ships as `status: 'held'`). Every step's final frame teaches on its own; colour
is used only for the correct-claim or flagged-gap highlight per step, matching `DESIGN.md`'s
rule that colour is rare and means something. All ten step titles were written double-quoted
from the start with no embedded apostrophes or nested quote marks. The unrelated `test:editor`
check again fails in this sandbox with "a save did not open a new GitHub issue" — a known
sandbox Playwright popup-handling limitation (see team memory
`learning-resources-editor-test-sandbox-limitation`), unrelated to anything this topic touches,
same as noted in topics 1-13's reviews.
