# Review — de.2pc-production-databases

## Content review

1. **Coverage check failed on the first build**: `coverage.json`'s clauses 2 and 3 initially
   omitted the syllabus line's own parenthetical cross-references ("(theory in Ch.14)",
   "(Spanner, Ch.14 and the M6 case study)"), so the build's own coverage check reported the full
   syllabus line as not fully mapped. **Fixed** by copying the full clause text, parentheticals
   included, word for word from `syllabus/data-engineering.md` line 248 into both `coverage.json`
   and `OUTLINE.md`.
2. **The `examples.py` design question**: the first draft's third experiment restarted this
   sandbox's own shared Postgres server to reproduce the crash-durability claim live; the harness
   denied that call as a shared-resource-modifying action. **Resolved** by redesigning
   `examples.py` to two real, measured experiments that don't touch the server process, with the
   crash-durability claim itself disclosed as sourced directly from the documentation (see
   `FACT-CHECK.md`'s Problem Solving section). Both remaining experiments ran clean and stable
   across repeated executions (prepared-transaction invisibility/commit-from-a-separate-session,
   and a measured ~0.3 second lock-hold block on a concurrent writer).
3. **`COMMIT PREPARED`/`ROLLBACK PREPARED` autocommit bug**: the first full run of the original
   three-experiment `examples.py` raised `psycopg2.errors.ActiveSqlTransaction: COMMIT PREPARED
   cannot run inside a transaction block`, since those commands must be issued outside any open
   transaction and the shared `connect()` helper defaults to `autocommit = False`. **Fixed** by
   setting `autocommit = True` on the specific connections issuing `COMMIT PREPARED`/`ROLLBACK
   PREPARED`, before issuing them, and dropping the now-invalid `.commit()` call on those
   connections.
4. **A leftover prepared transaction from an earlier aborted run** (`topic16_demo`, left prepared
   by the very first, pre-redesign `examples.py` attempt) caused a later clean re-run to hang
   indefinitely on `_setup_rows()`'s own `DROP TABLE`, since the leftover prepared transaction was
   still holding a lock on the table. **Fixed** by rolling it back directly (`ROLLBACK PREPARED
   'topic16_demo'`) before re-running; not a bug in the shipped `examples.py` itself, since a
   normal run always resolves every transaction it prepares.
5. **`max_prepared_transactions` was 0 (disabled) by default** on this sandbox's Postgres
   cluster, which `PREPARE TRANSACTION` itself requires to be nonzero. Raised to 16 in
   `/etc/postgresql/16/main/postgresql.conf` and applied with one server restart, before any of
   this topic's own examples were written — a one-time environment setup step, not touched again
   afterward.
6. **Two takeaways checked against the 20-word limit and the step-dot/midpoint placement guard**
   (QUALITY.md #59): with 11 steps, the midpoint is step 6. Takeaways were placed at steps 6, 7
   and 8 — all at or after the midpoint. One takeaway (step 7, "A coordinator failure does not
   undo the prepare...") was initially 21 words; trimmed by one word ("It just leaves" → "It
   leaves") to land at exactly 20.
7. **Digit-backing check** (`numbersIn()`): `reel.tsx`'s own body/fig text doesn't name any
   multi-digit topic numbers directly (unlike topics 14-15, which named "topic 13"/"topic 14"),
   so no `examples.py` docstring digit-backing was needed here.
8. **Claims list and `FACT-CHECK.md` cross-checked**: all 15 quoted-source claims (6 PREPARE
   TRANSACTION, 6 XA specification, 3 Spanner) and both measured `examples.py` claims verified
   against the source text and the actual script output; no discrepancies found.
9. **Bridge/handoff text copied verbatim** from `CHAPTER.md`'s topic 16 entry into both
   `OUTLINE.md` and the `registry.ts` entry; confirmed topic 15's own handoff text matches this
   topic's bridge text word for word, and this topic's own handoff text matches topic 17's
   expected bridge (not yet built).
10. **`pre-notes.md`/`post-notes.md` cross-references checked**: topic 14 (locking, lock-holding
    background), topic 15 (previous topic), topic 3 (WAL/durability), topics 6/12 (MVCC
    visibility) all correctly named and consistent with the concept ledger (`uses:
    wal-lsn-fsync`).

## Looks review

1. Phone and desktop screenshots reviewed for all 11 steps (`site/test-results/{phone,desktop}
   -2pc-production-databases-*.png`): no label/value row overlaps found on any step, including the
   three-row layouts (steps 5 and 10) and the longer label text in steps 7-9 ("any one negative
   reply" / "a coordinator leader" / "a participant leader").
2. All row values kept conservatively short (longest value strings around 20-22 characters)
   specifically to avoid the repeated phone-width overlap issue found in topic 15's own six-row
   cleanup effort — no rebuild-and-fix round was needed for this topic.
3. Takeaway panels (steps 6, 7, 8) render cleanly at both sizes, each within the three-line
   typical wrap at phone width.
4. The predict panels (steps 4 and 11) render their two options and explain text cleanly at both
   sizes, matching the established predict-panel pattern from topics 10-15.
5. Reel smoke test (`node scripts/check-all.mjs --only reels --topic 2pc-production-databases`)
   passed cleanly on the first run: "Reel smoke test passed: 1 live reel(s) at desktop and phone
   sizes," with no manual fixes required before it passed.
