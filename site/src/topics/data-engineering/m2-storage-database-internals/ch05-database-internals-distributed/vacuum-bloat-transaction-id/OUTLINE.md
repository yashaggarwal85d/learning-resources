# Outline — de.vacuum-bloat-transaction-id

## Outcomes

1. Explain a dead tuple and a HOT update as MVCC's own by-products, measured directly on this sandbox's cluster.
2. Explain the visibility map and what autovacuum tunes.
3. State precisely why a long-running transaction, an abandoned replication slot, or a stale prepared transaction pins the xmin horizon and grows every table, demonstrated by holding a real transaction open and measuring real bloat.
4. Explain 32-bit XID freezing and why a wraparound shutdown is a real, self-inflicted production outage.

## Storyboard

### 1. Hook

- **fig:** none (title card).
- **Visual idea:** the previous topic's own handoff, restated as the open question.
- **On screen:** "Postgres's own append-only MVCC never overwrites a row in place" → "every update leaves an old version behind" → "who cleans that up?"
- **Moves:** `Draw` the handoff sentence in, `lock-on` the question.
- **Final frame:** the question held on screen, unanswered.
- **Caption point:** this topic is the maintenance job MVCC's own design makes necessary, and the outage that happens when it stops.

### 2. Reveal: a dead tuple, counted directly

- **fig:** `DeadTupleCount`.
- **Visual idea:** a real row count climbing as rows are deleted, counted via `pg_stat_user_tables.n_dead_tup`, then dropping to zero after `VACUUM`.
- **On screen:** "half a table's rows, deleted" → "dead tuples: real count" → "VACUUM runs" → "dead tuples: zero".
- **Moves:** `Plot` the dead-tuple count rising then dropping, `count` the before/after values.
- **Real values:** 150 dead tuples after deleting half of 300 rows; 0 after `VACUUM` (examples.py: `dead_tuples_reclaimed_by_vacuum`).
- **Final frame:** "150 → 0", VACUUM named as what did it.
- **Caption point:** a dead tuple is the old row version MVCC's append-only design leaves behind; VACUUM is the only thing that reclaims it.
- **Takeaway:** "A dead tuple is MVCC's own leftover. Nothing but VACUUM gets that space back for reuse."

### 3. Reveal: HOT updates, the free optimization

- **fig:** `IndexGrowthCompare`.
- **Visual idea:** the same index's own size, measured in bytes, after 300 updates to an unindexed column vs. 300 updates to the indexed column.
- **On screen:** "update an unindexed column" → "index size: unchanged" → "update the indexed column" → "index size: doubled".
- **Moves:** `Plot` two bars (index size before/after each kind of update), `decode` why one grows and one doesn't.
- **Real values:** index size 16384 bytes before any update and after 300 HOT-eligible updates; 32768 bytes after 300 non-HOT updates (examples.py: `hot_updates_skip_the_index`).
- **Final frame:** the two bars side by side, same table, same row count, very different index cost.
- **Caption point:** a heap-only tuple (HOT) update needs no new index entry at all, but only when it touches no indexed column and the page has room; the visibility map is what lets vacuum (and an index-only scan) skip a page it already knows is all-visible, for the same underlying reason — nothing on it needs revisiting.
- **Takeaway:** "HOT updates skip the index entirely. Touch an indexed column, and that saving disappears."

### 4. Predict: what actually pins the cleanup

- **fig:** none (predict card).
- **On screen:** the question: "A table keeps growing even though nothing is wrong with its queries. What's holding VACUUM back?"
- **Options:** (a) "Autovacuum is just falling behind under load" (tempting: the common, wrong first guess — "it's a tuning/load problem"); (b) "Something is still holding an old snapshot open" (correct).
- **Moves:** `lock-on` the question, hold both options on screen.
- **Final frame:** both options visible, unresolved.
- **Caption point:** sets up the reveal that follows.

### 5. Reveal: the xmin horizon, held open

- **fig:** `XminHorizonDiagram`.
- **Visual idea:** one transaction's open snapshot drawn as a line that doesn't move while updates pile up behind it; three real ways that line gets left in place.
- **On screen:** "a transaction left open" → "a stale prepared transaction" → "an abandoned replication slot" → "same horizon, three doors".
- **Moves:** `Draw` the three sources converging on one horizon, `surface` each one's own system view (`pg_stat_activity.backend_xmin`, `pg_prepared_xacts`, `pg_replication_slots`).
- **Final frame:** all three doors open onto the same held-back horizon.
- **Caption point:** VACUUM can't tell these three apart; whatever is holding the horizon, it can't reclaim a row that horizon's own snapshot might still need.
- **Takeaway:** "A long transaction, a stale prepared transaction and an abandoned replication slot pin the same horizon, the same way."

### 6. Reveal: bloat, charted live

- **fig:** `BloatOverTime`.
- **Visual idea:** this chapter's own lab measurement — a real transaction held open against this sandbox's cluster while a concurrent workload updates the same table, charted, then released.
- **On screen:** "baseline: 0 dead tuples" → "transaction held open, 600 updates run" → "VACUUM runs anyway: 600 dead tuples, unreclaimed" → "transaction released, VACUUM again: 0".
- **Moves:** `Plot` the dead-tuple count and table size across the three checkpoints, `count` each real value.
- **Real values:** baseline 0 dead tuples / 57344 bytes; pinned 600 dead tuples / 98304 bytes (VACUUM run while the transaction is still open); released 0 dead tuples / 98304 bytes (examples.py: `xmin_horizon_pins_the_cleanup`).
- **Final frame:** the three-checkpoint chart, VACUUM failing to reclaim anything in the middle column despite running.
- **Caption point:** VACUUM isn't broken in the middle column — it ran, and correctly left everything alone, because the open transaction's own snapshot might still need those rows.
- **Takeaway:** "VACUUM can run and still reclaim nothing. An open snapshot, not a broken job, is usually why."

### 7. Reveal: autovacuum's own knobs

- **fig:** `AutovacuumThreshold`.
- **Visual idea:** the real vacuum-threshold formula, computed against this table's own row count and default settings.
- **On screen:** "autovacuum isn't on a clock" → "vacuum threshold = base + scale factor × row count" → "cross that, and a worker starts".
- **Moves:** `Eq` the threshold formula, `decode` what each term tunes.
- **Final frame:** the formula with this table's own numbers substituted in.
- **Caption point:** autovacuum reacts to how much a table has changed, not to a schedule; and once a worker is running specifically to prevent wraparound, nothing interrupts it, unlike an ordinary vacuum.
- **Takeaway:** "Autovacuum watches how much changed, not the clock. Tune the threshold, not a schedule."

### 8. Reveal: freezing and the wraparound shutdown

- **fig:** `FreezeAndWraparound`.
- **Visual idea:** a real table's `age(relfrozenxid)` before and after `VACUUM FREEZE`, next to the real Sentry outage as what happens when nothing ever does this at scale.
- **On screen:** "transaction IDs: 32 bits, compared in a circle" → "age(relfrozenxid): real, before and after freeze" → "ignore it for billions of transactions" → "writes stop" → "a real outage: Sentry, July 2015".
- **Moves:** `count` the real freeze ages, `draw` the circular XID space, `surface` the Sentry postmortem as a real citation.
- **Real values:** `age(relfrozenxid)` 2 before `VACUUM FREEZE`, 0 right after (examples.py: `freezing_advances_relfrozenxid`).
- **Final frame:** the Sentry outage named directly: a write-heavy production system, down for most of a working day, from exactly this.
- **Caption point:** freezing is what lets a row survive the counter wrapping around without ever looking like it's from the future; skip it long enough, and Postgres stops taking writes on purpose, to avoid silent data loss.
- **Takeaway:** "Freezing is what makes a 32-bit counter safe to wrap. Skip it long enough, and Postgres stops writes on purpose."

### 9. Recap

- **fig:** none.
- **On screen:** dead tuple → HOT update → the xmin horizon's three doors → freezing → wraparound.
- **Moves:** `Draw` each piece folding into the next, in order.
- **Final frame:** the full chain, start to finish.
- **Caption point:** every piece is the same mechanism (a pinned or expired horizon) seen at a different scale — one table, one transaction, one counter.

### 10. Prove it (predict)

- **fig:** none (predict card).
- **On screen:** "Sentry's database just hit wraparound protection. The internet's advice is to disable autovacuum so it stops interfering. What's the real fix?"
- **Options:** (a) "Disable autovacuum so nothing fights it" (tempting: the common advice Sentry's own postmortem calls out by name; wrong — it's the opposite of the fix, and what caused the exposure); (b) "Resolve what's pinning the horizon, then let vacuum finish, then tune the thresholds that let this happen" (correct: Postgres's own documented recovery steps, and what Sentry actually did).
- **Moves:** `lock-on` the question, then reveal the answer against the real postmortem.
- **Final frame:** the correct answer, with Sentry's own fixed settings named as what changed.
- **Caption point:** the fix is never "turn off the thing that reclaims space"; it's finding what's holding the horizon and giving vacuum room to work.

## Engagement arc

- **Hook (step 1):** the previous topic's own handoff, posed as an open question — who cleans up the versions MVCC leaves behind?
- **Early prediction (step 4, within the first four):** "what's holding VACUUM back" — the tempting wrong answer is "load/tuning", the real answer is "an open snapshot".
- **Surprising number:** step 6's middle checkpoint — VACUUM runs, and reclaims exactly zero, despite 600 real updates having piled up dead tuples. Running isn't the same as working.
- **Second prediction (step 10, Prove it):** Sentry's own real outage, with the common wrong advice ("disable autovacuum") as the tempting option.
- **Three takeaways:** steps 2, 3, 6 (and 8 implicitly through its caption — four strong candidates, three chosen as takeaway rows: 2, 3, 8, since 6's point is carried by the chart itself and restated in the recap).
- **Recap (step 9):** the whole chain, one mechanism at three scales.

## Narrator's line of thought

- **Step 1:** Open on the handoff itself, almost verbatim — this is the question the whole topic answers, not a restatement of the picture.
- **Step 2:** Don't just name "dead tuple" — say why MVCC's own design makes one inevitable on every delete, and that "removes" in casual speech is wrong: the space is marked reusable, not returned to the OS.
- **Step 3:** The surprising part isn't that updates are cheaper sometimes — it's that the exact same update, on the exact same table, costs a completely different amount depending on one thing: which column changed.
- **Step 4:** Ask the predict question the way a trick question is asked — "load" sounds right because it's usually the answer to "why is X slow"; here it's the wrong frame entirely.
- **Step 5:** Name all three doors before resolving any of them — the point is that VACUUM, from the inside, cannot tell a forgotten transaction from a load-bearing one.
- **Step 6:** Land hard on "VACUUM ran. It reclaimed zero. That's not a bug" — resist the urge to explain it before showing it.
- **Step 7:** Say plainly that "it'll run eventually" isn't how autovacuum thinks — it's a threshold crossed, not a clock ticking.
- **Step 8:** Treat the circular-arithmetic idea concretely — a clock with only so many hours, and freezing is what stops an old hour from suddenly becoming a future one. Then pivot hard into "this actually happened" — Sentry, named, dated, real.
- **Step 9:** Pull the thread taut: one horizon, three doors, one counter, one outage.
- **Step 10:** Treat "disable autovacuum" with real weight — explain why it's tempting (it looks like the thing causing load) before explaining why it's backwards.

## Post-notes plan (headings match the sibling set)

- **Outcomes:** restate the four learning outcomes plainly.
- **Lab:** the full xmin-horizon-held-open measurement from `examples.py`, written up as the chapter's own lab leg — the exact numbers, what each checkpoint shows, and how to reproduce it (`VACUUM VERBOSE`, `pg_stat_user_tables`, `pg_stat_activity`).
- **Production failures this topic warns about:** the exact Postgres-documented warning/error thresholds (forty million transactions from wraparound → warning; three million remaining → writes refused), the three real sources of a pinned horizon with their exact system views (`pg_stat_activity.backend_xmin`/`backend_xid`, `pg_prepared_xacts`, `pg_replication_slots`), and the documented recovery order (resolve prepared transactions, end long transactions, drop stale slots, VACUUM — never VACUUM FULL in that state).
- **Frontier:** multixact IDs as the same shape of problem for row-level locks, out of scope here but worth naming as the thing that looks identical and isn't; PostgreSQL 18's wording changes (eager freezing, `vacuum_max_eager_freeze_failure_rate`) as the current tuning surface.
- **Where this goes next:** the handoff, verbatim.

## Examples to execute

`examples.py`, four real experiments against this sandbox's own Postgres cluster (all asserted, all executed, stable across 3 runs):

1. `hot_updates_skip_the_index`: 300 rows, one index on `indexed_val`. 300 updates to the unindexed `plain_val` leave the index at 16384 bytes (unchanged); 300 updates to `indexed_val` grow it to 32768 bytes.
2. `dead_tuples_reclaimed_by_vacuum`: deleting 150 of 300 rows leaves 150 dead tuples (`pg_stat_user_tables.n_dead_tup`); `VACUUM` brings it to 0.
3. `freezing_advances_relfrozenxid`: a fresh table's `age(relfrozenxid)` is 2; `VACUUM FREEZE` brings it to 0.
4. `xmin_horizon_pins_the_cleanup`: baseline 0 dead tuples / 57344 bytes; with a `REPEATABLE READ` transaction held open through 600 concurrent updates, a `VACUUM` run anyway still leaves 600 dead tuples / 98304 bytes unreclaimed; after releasing that transaction and vacuuming again, 0 dead tuples (98304 bytes retained — standard VACUUM doesn't return space to the OS, per the routine-vacuuming source).

Exact wraparound thresholds (two billion transaction limit, forty-million-transaction warning, three-million-transaction refusal) are documented facts, not something this sandbox can execute at scale (reaching real wraparound needs billions of transactions); they appear only in `post-notes.md` and narration prose, never as digits in `reel.tsx`, per `QUALITY.md`'s rule that every on-screen number is backed by `examples.py`.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 6's handoff verbatim): "Postgres's own append-only MVCC never overwrites a row in place, which means every update leaves an old version behind. This topic is the maintenance job that cleans that up — and the real outage that happens when something stops it from running: vacuum, bloat, and transaction-ID wraparound."
- **Handoff** (to topic 8, verbatim): "MVCC is one family's answer to concurrent writes, and vacuum is the bill it pays later. The next topic is the other family entirely — a structure built from the start around never updating in place: the LSM tree."

## Concept ledger

- **Introduces:** `vacuum-xid-wraparound`.
- **Uses:** `mvcc-versioning` (topic 6 — the xmin/xmax/snapshot machinery this topic's cleanup job acts on).
- **Declared:** multixact IDs (named, out of scope — `coverage.json → expert`, `out`).

## Claims list

1. An UPDATE/DELETE's old row version is not immediately removed; VACUUM reclaims its space for reuse but does not return it to the OS except at the end of the file. — `pg-routine-vacuuming.txt` §24.1.2.
2. The visibility map tracks all-visible pages so VACUUM can skip them, and so an index-only scan can skip the heap fetch entirely. — `pg-routine-vacuuming.txt` §24.1.4.
3. A HOT update needs no new index entry when it touches no indexed column and the page has free space, and can prune now-dead intermediate versions outside VACUUM entirely. — `pg-storage-hot.txt`.
4. Autovacuum vacuums a table once its obsolete-tuple count crosses a threshold computed from a base value plus a scale factor times row count, not on a fixed schedule; an anti-wraparound autovacuum is not interrupted by a conflicting lock the way an ordinary one is. — `pg-routine-vacuuming.txt` §24.1.6.
5. Transaction IDs are 32 bits and compared with circular (modulo-2^32) arithmetic; freezing marks a row as permanently "in the past" via `FrozenTransactionId` so it survives the counter wrapping. — `pg-routine-vacuuming.txt` §24.1.5.
6. Postgres warns once a database's oldest XIDs are forty million transactions from wraparound, and refuses to assign new write-transaction XIDs once fewer than three million remain (read-only transactions still work). — `pg-routine-vacuuming.txt` §24.1.5.
7. Recovery order once tripped: resolve prepared transactions (`pg_prepared_xacts`), end long-running transactions (`pg_stat_activity`), drop stale replication slots (`pg_replication_slots`), then VACUUM — never VACUUM FULL in that state, since it itself needs a fresh XID. — `pg-routine-vacuuming.txt` §24.1.5.
8. A replication slot holds back WAL recycling and the specific rows VACUUM would otherwise remove, even while its standby is disconnected or gone. — `pg-replication-slots.txt` §26.2.6.
9. Sentry's production Postgres cluster hit XID wraparound protection in July 2015 and was down for most of a US working day; disabling autovacuum (the internet's common advice) is the opposite of the fix. — `sentry-wraparound-postmortem.txt`.
10. Sentry's actual recovery, once stuck, was improvised: wait for the running autovacuums to finish, then truncate the one large, non-critical table whose autovacuum had stalled, restoring writes in five minutes. — `sentry-wraparound-postmortem.txt`.
11. Sentry's post-incident fix tuned `autovacuum_freeze_max_age` down from too-high a value, raised `autovacuum_max_workers`, and removed excess vacuum cost delay. — `sentry-wraparound-postmortem.txt`.
12. In this sandbox: 300 updates to an unindexed column leave a table's own index size unchanged (16384 bytes); 300 updates to the indexed column double it (32768 bytes). — `examples.py`.
13. In this sandbox: deleting 150 of 300 rows leaves 150 dead tuples; VACUUM reclaims them to 0; a fresh table's `age(relfrozenxid)` is 2, and `VACUUM FREEZE` brings it to 0. — `examples.py`.
14. In this sandbox: holding one REPEATABLE READ transaction open through 600 concurrent updates leaves VACUUM able to reclaim 0 of 600 dead tuples while that transaction is open, and all 600 once it is released. — `examples.py`.

## Changes from the chapter plan

None. The topic keeps `CHAPTER.md`'s scope, bridge, handoff and visual idea exactly.

## Progress

- Research done: `SOURCES.md` (24 quotes verified word for word across 4 sources), `coverage.json → expert` (13 items).
- Content plan done: this file.
- Next: fact-check (section 5).
