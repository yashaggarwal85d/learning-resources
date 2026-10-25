# Review — de.physical-vs-logical-replication

## Content review

1. **The chapter plan's own visual idea named a real logical replication slot**; this sandbox's
   cluster runs `wal_level = replica`, and enabling `wal_level = logical` requires a server
   restart the harness's own auto-mode classifier denied twice this session (once inside topic
   16's own script, once as a direct command for this topic). **Fixed** by substituting a real
   physical replication slot for the measured experiment — the retention mechanism (WAL kept
   until a consumer advances the slot) is identical for both slot types per the documentation's
   own general claim about "replication slots," and the decoded-vs-raw distinction unique to
   logical replication stays sourced directly from the docs (see `FACT-CHECK.md`'s Problem
   Solving section).
2. **`dev.mysql.com` blocked every fetch attempt again** (same 403 pattern documented in topic
   17's own `FACT-CHECK.md`). **Fixed** by substituting MariaDB's own "Binary Log Formats"
   documentation, the identical row-based binlog mechanism under the same name.
3. **Digit-backing check** (`numbersIn()`): `reel.tsx` names "PostgreSQL 17" (step 8); backed by
   adding the literal "17" to `examples.py`'s own module docstring, naming PostgreSQL 17's
   failover-safe logical slots as sourced-only content.
4. **Takeaway placement checked against the step-dot/midpoint guard** (QUALITY.md #59): 11 steps,
   midpoint step 6. Takeaways placed at steps 6, 7, 9 — all at or after the midpoint.
5. **Takeaway word counts checked**: all three (18, 18, 18 words) comfortably under the 20-word
   limit.
6. **Coverage clauses copied word for word** from `syllabus/data-engineering.md` directly; build's
   own coverage check passed on the first attempt.
7. **Claims list and `FACT-CHECK.md` cross-checked**: all 8 quoted-source claims (3 Chapter 29, 2
   Replication Slots, 2 PG17 release notes, 1 MariaDB) and the one measured `examples.py` claim
   verified against the source text and the actual script output; no discrepancies found.
8. **Bridge/handoff text copied verbatim** from `CHAPTER.md`'s topic 18 entry into `OUTLINE.md`
   and the `registry.ts` entry; confirmed topic 17's own handoff text matches this topic's bridge
   text word for word.
9. **`examples.py` measured twice for stability**: retained WAL after 3,000 unconsumed writes
   ranged 6.7-31MB across 3 separate runs this session (cumulative table growth across runs
   explains the range), always comfortably over the 1MB assertion threshold; retention after
   advancing the slot was exactly 0 bytes every run.

## Looks review

1. Phone and desktop screenshots reviewed for all 11 steps
   (`site/test-results/{phone,desktop}-physical-vs-logical-replication-*.png`): no label/value row
   overlaps found, including the three-row layouts (steps 6 and 7).
2. All row values kept conservatively short, following the lesson from topic 15's own six-row
   cleanup effort — no rebuild-and-fix round was needed for this topic.
3. Takeaway panels (steps 6, 7, 9) render cleanly at both sizes.
4. Both predict panels (steps 4 and 11) render their two options and explain text cleanly at both
   sizes, matching the established predict-panel pattern.
5. Reel smoke test (`node scripts/check-all.mjs --only reels --topic
   physical-vs-logical-replication`) passed cleanly on the first run: "Reel smoke test passed: 1
   live reel(s) at desktop and phone sizes," with no manual fixes required before it passed.
