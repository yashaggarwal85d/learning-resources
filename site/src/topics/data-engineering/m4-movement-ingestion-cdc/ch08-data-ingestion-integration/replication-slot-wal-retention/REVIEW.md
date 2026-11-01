# Review — de.replication-slot-wal-retention

## Content review, self-review, 2026-10-31

Read cold: `CHAPTER.md`'s entry for this topic, topic 11's handoff, this topic's own files in
order (reel and scenes, narration, post-notes, pre-notes, prerequisites, registry entry,
`coverage.json`, `SOURCES.md`, `FACT-CHECK.md`), then the next topic's syllabus line (initial
snapshot to stream handoff).

1. **Flow.** The bridge answers topic 11's own handoff verbatim-in-spirit ("PostgreSQL's slot is
   a convenience with a sharp edge... when a consumer stalls, that edge is the production
   disk") and this topic's own handoff matches `CHAPTER.md`'s own handoff into topic 13 (a slot
   protects a position; a new consumer needs the table as it stands now plus every change
   after, with no gap and no overlap). Checked all three named `uses` ids via the
   registry-parsing script: `logical-decoding-slot`, `wal-lsn-fsync` and `vacuum-xid-wraparound`
   all resolve live.
2. **Pre-notes.** 7 bullets (replication slot, `restart_lsn`, retained WAL, heartbeat,
   `max_slot_wal_keep_size`, invalidated slot, disk-full — `CHAPTER.md`'s own syllabus terms for
   this topic), each under the per-term format, no links.
3. **Gap hunt.** The raw syllabus line (`syllabus/data-engineering.md` §8.2, line 512) splits at
   its own semicolons into four clauses: pinning WAL, the idle/multi-database variants,
   heartbeats and the safety valve, and monitoring lag. `coverage.json`'s `syllabus` array
   matches this four-clause breakdown exactly, copied verbatim from the raw syllabus file.
4. **Expert reader.** `FACT-CHECK.md`'s red-team pass confirms both predicts are ruled out
   against the documentation's own wording and this topic's own measured facts, not invented
   reasoning. Every measured claim traces to a specific function in `examples.py`, run against
   this sandbox's own real PostgreSQL 16 cluster, including a real `max_slot_wal_keep_size`
   change made via `ALTER SYSTEM` and confirmed reset afterward so no later topic inherits an
   altered cluster.
5. **Engagement.** Hook (step 1, a healthy-looking connector whose disk fills over a weekend);
   predict within the first four steps (step 2, whether a healthy connector can still be the
   cause); three takeaways across the reveal steps (steps 4, 6, 8); recap (step 9) names the
   trade the topic's three measurements feed; "Prove it" (step 10) names the one number that
   would have actually caught the hook's own incident, directly setting up the handoff.
6. **Narration teaches.** The build's own narration-teaches check caught step 1's first draft
   echoing the reel's description sentence almost verbatim; rewritten to explain the gap between
   what a dashboard shows and what a slot is actually doing, confirmed passing on rebuild.
   Checked narration lines against description/body text by hand afterward: every step's
   narration explains *why* a measurement comes out the way it does (why a connected connector
   can still fail to advance a slot; why confirming, not uptime, is the real fix; why a lost
   slot is refused outright, not merely flagged) rather than reading the figure's own on-screen
   labels back. No digits and no underscored identifiers appear in `reel.tsx`, `scenes.tsx` or
   `narration.json`, checked with `grep`.

No open findings; `coverage.json` → `gapReview.open` is `[]`.

## Looks review, self-review, 2026-10-31

1. Every `scenes.tsx` `Row` label/value pair was checked and fixed with a Python script before
   the build ran: seven pairs exceeded three words on the first draft and were trimmed; `grep`
   for digits in visible text returns no matches in the final file.
2. Takeaway word counts (em dash counted as its own word) checked with a Python script against
   `reel.tsx`'s own source text before narration: one of four takeaways (22 words after a first
   trim, 23 before it) needed a second trim down to 14; the other three (20, 18, 18) needed no
   further change.
3. `examples.py` was run to completion twice (`python3 examples.py` → "all checks passed" both
   times) against this sandbox's own real PostgreSQL 16 cluster before writing the reel. Every
   scratch table and replication slot this topic creates is confirmed dropped after each run,
   `max_slot_wal_keep_size` is confirmed reset to `-1`, the shared `orders` table is confirmed
   unchanged, and `pg_wal`'s own on-disk size is confirmed back to its normal range after the
   deliberate WAL-growth measurements — the production incident this topic teaches about was
   reproduced in miniature, on purpose, and then fully cleaned up.
4. One genuine environment constraint, disclosed rather than worked around: this sandbox has
   one PostgreSQL database and no AWS RDS instance, so the idle-captured-table,
   multi-database and RDS variants Debezium names are quoted in `SOURCES.md` rather than
   reproduced, and `inactive_since` (a PostgreSQL 17 column) is confirmed absent and left out of
   the lag-monitoring measurement rather than assumed present.

Final build: `cd site && npm run build` completed clean. The unrelated `npm run test:editor`
check is a known pre-existing sandbox limitation (see team memory
`learning-resources-recurring-bugs`), unrelated to anything this topic touches. The held-topic
reel smoke test was run with `REEL_DEVICES=desktop` and `REEL_DEVICES=phone` as two separate
invocations, per the sandbox-level Playwright flakiness noted in topic 7's own review.
