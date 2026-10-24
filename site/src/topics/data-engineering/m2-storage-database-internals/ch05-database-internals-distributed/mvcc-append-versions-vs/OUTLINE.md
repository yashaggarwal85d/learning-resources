# Outline — de.mvcc-append-versions-vs

## Learning outcomes

1. Explain Postgres's append-only MVCC (`xmin`/`xmax`, a snapshot, a commit-log lookup) directly against a real updated row inspected in this sandbox's cluster.
2. Contrast InnoDB/Oracle's in-place-update-plus-undo-log approach, and state precisely how each family's choice affects update cost, index maintenance and long-read behaviour.
3. Explain an Oracle-style "snapshot too old" failure as the direct consequence of the undo-log approach's own bounded, circular history — and why Postgres's own design has no failure by that same mechanism.

## Reel steps

### 1. Hook
- **fig:** `hook`
- **Visual idea:** the handoff question from the previous topic, made concrete: two transactions reach for the same row at once.
- **On screen:** `many pages` / `which one?` style two-row reveal: "two writers" / "same row" then "a reader, mid-query" / "sees what?"
- **Moves:** rows fade in on a beat, nothing resolved yet.
- **Final frame:** the open question, unresolved — sets up step 2's real answer.
- **Caption point:** a B-tree finds the row; nothing yet says what happens when two transactions want to change it at once.

### 2. Reveal: a real update, inspected directly
- **fig:** `reveal-heap-tuples`
- **Visual idea:** CHAPTER.md's own visual idea — a real row updated in this sandbox's Postgres cluster, old and new heap tuple drawn side by side, `xmin`/`xmax` labelled, read straight from `pageinspect`.
- **On screen:** `old tuple` / `xmax: the updater` and `new tuple` / `xmin: the updater` — the same transaction ID closes one tuple and opens the other.
- **Real values:** the real `t_xmin`/`t_xmax` pair measured by `examples.py`'s `update_creates_a_new_heap_tuple`.
- **Final frame:** both tuples sitting on the same real page at once.
- **Caption point:** Postgres never overwrites; an update inserts.

### 3. Reveal: what decides visibility
- **fig:** `reveal-visibility`
- **Visual idea:** the snapshot + commit-log mechanism, not a diagram of it — Postgres's own doc language made concrete.
- **On screen:** `a snapshot` / `which XIDs were in-progress` and `a commit-log lookup` / `did xmin really commit?`
- **Final frame:** the two checks a reader actually makes before a tuple counts as visible.
- **Caption point:** the row's header alone isn't enough — visibility needs the snapshot and a second lookup.

### 4. Predict: the other family
- **fig:** `predict-other-family`
- **Visual idea:** before revealing InnoDB/Oracle, ask what a reader expects from a database that updates in place.
- **Question:** "InnoDB and Oracle update a row's one physical copy in place. When a concurrent reader needs the value from before the update, where does it come from?"
- **Options:** (a) "there isn't one — the reader just waits" (tempting: locking intuition); (b) "a separate log holds the old value, rebuilt on demand" (correct).
- **Answer:** explains why (a) is the locking-era intuition MVCC was built to avoid, and states the undo-log mechanism plainly before step 5 proves it from the source.

### 5. Reveal: the undo-log family's own answer
- **fig:** `reveal-undo-log`
- **Visual idea:** CHAPTER.md's second drawing — the same update under the undo-log model: one in-place row, a separate undo record pointing back to the old value. Sourced, not measured (no InnoDB/Oracle cluster in this sandbox).
- **On screen:** `the row` / `updated in place` and `the undo log` / `the old value, pushed out`
- **Final frame:** one physical row plus a separate log entry, next to step 2's two full tuples — the structural contrast CHAPTER.md asks for.
- **Caption point:** two families, two physically different answers to the same problem.

### 6. Reveal: the real cost of never overwriting
- **fig:** `reveal-append-cost`
- **Visual idea:** real measurement — repeated updates on one row grow the table before anything reclaims the old tuples.
- **Real values:** `examples.py`'s `repeated_updates_grow_the_table_before_reclaim` — real page-count growth across N updates on a single row.
- **Takeaway:** every Postgres update that leaves a tuple nobody has cleaned up yet is real, measured disk growth, not a theoretical concern.
- **Caption point:** append-only versioning has to pay for itself somewhere; here is where.

### 7. Reveal: a reader that never blocks
- **fig:** `reveal-no-block`
- **Visual idea:** real measurement — an open repeatable-read transaction keeps reading the pre-update value, un-blocked, while a concurrent writer commits an update to the same row.
- **Real values:** `examples.py`'s `concurrent_reader_is_never_blocked_by_a_committed_write` — the same real value read twice inside one open transaction, before and after a concurrent commit.
- **Takeaway:** this is MVCC's own headline guarantee, measured directly rather than asserted: reading never blocks writing, and writing never blocks reading.
- **Caption point:** the reader's own snapshot, not a lock, is what keeps it consistent.

### 8. Reveal: snapshot too old
- **fig:** `reveal-snapshot-too-old`
- **Visual idea:** the undo-log family's own failure mode, sourced from Oracle's documentation, drawn as the direct structural consequence of step 5's bounded log.
- **On screen:** `the undo log` / `circular, bounded space` and `a long reader's own undo` / `overwritten, gone`
- **Takeaway:** `ORA-01555` isn't a bug; it's what a bounded, circular history does to a reader that outlives its own undo.
- **Caption point:** Postgres has no equivalent failure by this mechanism — its cost is bloat, not a failed read.

### 9. Recap
- **fig:** `recap`
- **On screen:** four rows — `the two families` / `append vs. in-place + undo`; `update cost` / `a new tuple vs. an in-place write`; `long reads` / `never blocked vs. reconstructed`; `the undo family's own limit` / `snapshot too old`.
- **Final frame:** all four threads side by side.

### 10. Prove it
- **fig:** `prove-it`
- **Visual idea:** second predict — transfer the mechanism to a real operational decision.
- **Question:** "A team on Oracle sees frequent `ORA-01555` errors on a nightly report and raises `undo_retention` to fix it. Does this remove the structural risk, or only delay it?"
- **Options:** (a) "removes it — the report will never fail again" (tempting: treats retention as a cap, not a target); (b) "only delays it — a long enough report, or heavy enough writes, still outruns any retention setting" (correct).
- **Answer:** ties back to step 8 — the bounded log is still bounded; a bigger bound just moves the failure point.

## Engagement arc

- **Hook (step 1):** the handoff's own open question, made concrete.
- **Predict within the first four (step 4):** the other family's own mechanism, predicted before it's revealed. Second predict at step 10 (Prove it), satisfying the full-topic requirement of two.
- **Surprising number:** step 2's real `pageinspect` proof that two full tuples exist on the same page after a single update — not a diagram, a real row inspected directly.
- **Takeaways (≥3):** steps 6, 7, 8.
- **Recap:** step 9, pulling all four threads together.

## Narrator's line of thought (beyond the description)

- **Step 1:** connects back to the b-tree topic's own handoff in her own words, then poses the real question before any answer is hinted at.
- **Step 2:** directs attention to the one shared value between the two tuples — xmax on the old one, xmin on the new one, the same transaction ID — and says what that proves: nothing was overwritten, something was added.
- **Step 3:** names the wrong intuition directly (that a tuple's own header alone decides visibility) and explains why a second, separate commit-log lookup is unavoidable: a header value by itself can't say whether that transaction actually committed.
- **Step 4 (predict):** sets up the reasoning — if nothing is overwritten in Postgres, what would "update in place" even mean for a concurrent reader — without giving away the undo-log answer.
- **Step 4 (answer):** says why "the reader waits" is the locking-era intuition this whole topic exists to contrast against.
- **Step 5:** draws the structural line between the two drawings explicitly — same update, physically different data on disk — and connects forward to why that difference will matter for cost.
- **Step 6:** says what the real page-count growth means operationally: this is disk someone eventually has to reclaim, previewing (without naming HOT or vacuum's own mechanism, which belong to the next topic) that this cost doesn't resolve itself.
- **Step 7:** names the payoff plainly and ties it back to step 3: the snapshot from step 3 is exactly what makes this possible, not a coincidence.
- **Step 8:** connects to step 5's undo log directly — it's the same bounded structure, now shown failing under its own limit — and states precisely why Postgres's design doesn't share this specific failure mode (not because it's better, but because it's differently shaped).
- **Step 9 (recap):** says what to carry forward, not a repeated list: the next topic is the bill Postgres's own choice leaves unpaid.
- **Step 10 (prove it):** before the answer, asks the learner to apply step 8's own reasoning to a concrete fix a team actually tried.

## Post-notes headings (layers 5–8)

Following this chapter's own established heading set (`Outcomes`, `Lab`, `Production failures this topic warns about`, `Frontier`, `Where this goes next`), not an invented "Internals" heading:

- **Outcomes:** states the three learning outcomes, and carries the internals depth the reel's steps don't have room for — `t_ctid` chains across repeated updates (the "current TID of this or newer row version" field), `pg_current_snapshot`/`pg_xact_status` as the two real functions behind visibility, InnoDB's rollback segments and purge threads, Oracle's CR-clone reconstruction and SCN-based consistency.
- **Lab:** none of its own (feeds the §5.1 chapter lab, per `CHAPTER.md`); points at `examples.py` as the reproducible local setup.
- **Production failures this topic warns about:** ORA-01555 in long-running batch/report jobs; the operational fix (`undo_retention`, larger rollback segments) and why it's a delay, not a cure; Postgres's own very different production failure mode (bloat, previewed but not taught here — the next topic's subject).
- **Frontier:** brief, sourced-only pointer — distributed SQL systems (covered later in this chapter's own syllabus, §5.3) combine MVCC with timestamps across machines, not just within one.
- **Where this goes next:** verbatim handoff to `de.vacuum-bloat-transaction-id`.

## Examples to execute (`examples.py`)

Connects to the same sandbox Postgres cluster (`learnshop`) as `b-tree-indexes-production`, with `pageinspect` enabled.

1. **`update_creates_a_new_heap_tuple`**: create a one-row table, record its `ctid`/`xmin`, `UPDATE` the row, then read `heap_page_items(get_raw_page(...))` directly to find both the old (now-dead) tuple and the new (live) tuple on the same page. Asserts: two tuples present; old tuple's `t_xmax` equals the new tuple's `t_xmin`; old tuple's `t_ctid` points at the new tuple's own location (the forwarding pointer).
2. **`repeated_updates_grow_the_table_before_reclaim`**: update one row N times in a row with no `VACUUM`, measuring `pg_relation_size` in pages before and after. Asserts: real page growth greater than zero.
3. **`concurrent_reader_is_never_blocked_by_a_committed_write`**: two real connections. Connection A opens a `REPEATABLE READ` transaction and reads a value. Connection B updates and commits a new value to the same row. Connection A reads again, still inside its own open transaction. Asserts: A's two reads are identical (unblocked, unchanged); a fresh connection's read after A commits sees the new value.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers the b-tree topic's handoff): "A B-tree index answers 'where is this row' fast, but says nothing about what happens when two transactions want to change the same row at once. This topic is Postgres's own answer: MVCC, and the entirely different undo-log family InnoDB and Oracle use instead."
- **Handoff** (verbatim, to `de.vacuum-bloat-transaction-id`): "Postgres's own append-only MVCC never overwrites a row in place — which means every update leaves an old version behind. The next topic is the maintenance job that has to clean that up: vacuum."

## Concept ledger

- **Introduces:** `mvcc-versioning`.
- **Uses:** `slotted-page-layout` (the heap tuple header and `ctid` live inside the page layout taught in topic 1), `wal-lsn-fsync` (an update's new tuple is itself logged through the WAL path taught in topic 3 — referenced only in passing, not retaught).
- **Declared:** none beyond topics 1–5 (per `CHAPTER.md`).

## Changes from the chapter plan

- `CHAPTER.md`'s visual idea (old/new heap tuple side by side, plus a second drawing of the undo-log model) is followed exactly, split across steps 2 and 5 rather than one step, so each half gets its own real/sourced grounding and its own final frame.
- InnoDB and Oracle's own behaviour is sourced-only throughout (no InnoDB/Oracle cluster in this sandbox), matching the established pattern from `b-tree-indexes-production`'s own InnoDB half (`FACT-CHECK.md` claim 12). Every Postgres claim is measured directly against the real sandbox cluster.
- HOT updates and the visibility map are deliberately **not** taught here even though they would explain *why* some updates cost less: `CHAPTER.md` scopes HOT explicitly to the next topic ("dead tuples, HOT updates, the visibility map"), so step 6 shows the growth cost without naming the mechanism that later reduces it, and the post-notes "Production" section says so directly rather than silently.

## Claims list

1. Postgres uses a multiversion model where each SQL statement sees a snapshot of data; MVCC lets reading never block writing and writing never block reading. — `pg-mvcc-model`.
2. A heap tuple's fixed header carries `t_xmin` (insert XID) and `t_xmax` (delete XID) directly. — `pg-heap-tuple-header`.
3. `t_ctid` on a tuple points at "this or newer row version" — the forwarding pointer an old tuple leaves toward its replacement. — `pg-heap-tuple-header`.
4. `pg_current_snapshot()` returns which transaction IDs were in-progress at a point in time; `pg_xact_status()` reports whether a given transaction actually committed. — `pg-snapshot-functions`.
5. InnoDB creates no private copies when a transaction writes; the old version is pushed to the undo log instead, from which it can be restored or read by a consistent read. — `innodb-undo-log`.
6. InnoDB's read view is an instantaneous snapshot that ignores uncommitted changes and changes from transactions started after the view was created. — `innodb-read-view`.
7. InnoDB uses the primary key itself as a clustered index, storing table rows in primary-key order. — `innodb-clustered-pk`.
8. Oracle achieves read consistency through undo data: undo entries written to undo segments hold old values, letting multiple versions of the same data exist at once. — `oracle-undo-read-consistency`.
9. Oracle reconstructs an older block by copying the current block and applying undo data, producing a "consistent read (CR) clone." — `oracle-undo-read-consistency`.
10. Oracle's undo segments are reused circularly; a long-running reader whose needed undo has been overwritten by other writers raises "snapshot too old," mitigated (not solved) by a longer `undo_retention` or larger rollback segments. — `oracle-snapshot-too-old`.
11. ORA-01555's documented cause is "rollback records needed by a reader for consistent read are overwritten by other writers"; the documented action is to raise `undo_retention` or use larger rollback segments. — `ora-01555-reference`.
12. (Measured, not sourced) A real update on this sandbox's Postgres cluster leaves both the old and new heap tuple present on the same page immediately afterward, with the old tuple's `t_xmax` equal to the new tuple's `t_xmin`. — `examples.py`.
13. (Measured, not sourced) Repeated updates to one row grow the table's real page count before anything reclaims the dead tuples. — `examples.py`.
14. (Measured, not sourced) An open `REPEATABLE READ` transaction's reads are unaffected by a concurrent transaction's committed update to the same row, until it starts a new snapshot. — `examples.py`.

## Progress

Research done (`SOURCES.md`, `coverage.json → expert`). This file (content plan) complete. Next: section 5, fact-check and red team.
