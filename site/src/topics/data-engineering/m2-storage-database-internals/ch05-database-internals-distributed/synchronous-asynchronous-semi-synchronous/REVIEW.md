# Review — de.synchronous-asynchronous-semi-synchronous

## Content review

1. **MySQL's own documentation host blocked every fetch attempt** (`dev.mysql.com`, HTTP 403
   across three documentation versions, and via a direct `curl` with a browser user agent).
   **Fixed** by substituting MariaDB's own semisynchronous replication documentation — the same
   mechanism, the same names (`rpl_semi_sync_master`/`rpl_semi_sync_slave`,
   AFTER_SYNC/AFTER_COMMIT), MariaDB being MySQL's own direct fork (see `FACT-CHECK.md`'s Problem
   Solving section).
2. **`pre-notes.md` initially had only 3 term bullets**; the build's own topic-file check (QUALITY.md
   #35/#50/#54/#59) requires 4 to 14. **Fixed** by adding a fourth bullet (the row-level lock
   background from topics 14-15, cross-referenced to the "Reveal: what synchronous risks" step).
3. **No real multi-host experiment was built**: this sandbox has no second machine to run a real
   primary/replica pair. Following the chapter's own engine-of-record note on claims needing a
   second host, the real measured experiment (`synchronous_commit` on/off) isolates the genuine
   local analogue of the same acknowledgement-wait mechanism, while the multi-host
   failover/lost-commit claims stay sourced directly from the documentation rather than
   approximated with a risk of misrepresenting true multi-host behavior.
4. **Takeaway placement checked against the step-dot/midpoint guard** (QUALITY.md #59): 8 steps,
   midpoint step 4. Takeaways placed at steps 5, 6, 7 — all after the midpoint, mirroring topic
   10's own established refresher pattern exactly.
5. **Takeaway word counts checked**: all three (20, 20, 19 words) at or under the 20-word limit.
6. **Coverage clauses copied word for word** from `syllabus/data-engineering.md` line directly;
   build's own coverage check passed on the first attempt (no cross-reference parenthetical
   omissions this time, unlike topic 16's first build).
7. **Claims list and `FACT-CHECK.md` cross-checked**: all 11 quoted-source claims (6 PostgreSQL, 5
   MariaDB) and the one measured `examples.py` claim verified against the source text and the
   actual script output; no discrepancies found.
8. **Bridge/handoff text copied verbatim** from `CHAPTER.md`'s topic 17 entry into `OUTLINE.md`
   and the `registry.ts` entry; confirmed topic 16's own handoff text matches this topic's bridge
   text word for word.
9. **No "Prove it" step**: this is a refresher, following topic 10's own established shape per
   `CHAPTER.md`'s own visual-language note ("this chapter's only refreshers are topics 10 and
   17").

## Looks review

1. Phone and desktop screenshots reviewed for all 8 steps
   (`site/test-results/{phone,desktop}-synchronous-asynchronous-semi-synchronous-*.png`): no
   label/value row overlaps found, including the three-row layouts (steps 4 and 8).
2. All row values kept conservatively short, following the lesson from topic 15's own six-row
   cleanup effort — no rebuild-and-fix round was needed for this topic.
3. Takeaway panels (steps 5, 6, 7) render cleanly at both sizes.
4. The single predict panel (step 3) renders its two options and explain text cleanly at both
   sizes, matching the established predict-panel pattern.
5. Reel smoke test (`node scripts/check-all.mjs --only reels --topic
   synchronous-asynchronous-semi-synchronous`) passed cleanly on the first run: "Reel smoke test
   passed: 1 live reel(s) at desktop and phone sizes," with no manual fixes required before it
   passed.
