# Outline — de.snapshot-isolation-write-skew

**Kind:** full, §5.2. About 15 minutes. Hosts part of the §5.2 chapter lab.

## Scope (full syllabus line, three clauses)

"How SI works (read from a snapshot, first-committer-wins on write–write conflicts), which
anomalies it prevents and why write skew and the read-only anomaly survive; vendor naming traps:
Postgres `REPEATABLE READ` is SI, Oracle `SERIALIZABLE` is SI, MySQL InnoDB `REPEATABLE READ`
mixes snapshot reads with locking reads."

- Clause 1: "how SI works (read from a snapshot, first-committer-wins on write–write conflicts)" — the mechanism itself, read from the vendors' own docs and measured directly.
- Clause 2: "which anomalies it prevents and why write skew and the read-only anomaly survive" — the real contrast: read skew and lost update prevented, write skew reproduced for real.
- Clause 3: "vendor naming traps" — three real, documented vendor-naming traps, quoted from each vendor's own current docs.

## Outcomes

Explain snapshot isolation's own mechanism (read from a fixed snapshot, first-committer-wins on
write–write conflicts). State which of topic 11's anomalies SI prevents by construction and why
write skew and the read-only anomaly survive it. Name the real vendor-naming traps (Postgres
`REPEATABLE READ` is SI; Oracle `SERIALIZABLE` is SI; MySQL InnoDB's `REPEATABLE READ` mixes
snapshot and locking reads) and reproduce a real write-skew anomaly (the "on-call doctors"
pattern) against this sandbox's own Postgres cluster under `REPEATABLE READ`.

## Concept ledger

- **Introduces:** `snapshot-isolation`.
- **Uses:** `isolation-anomalies` (topic 11), `mvcc-versioning` (topic 6).
- **Declared:** none beyond topic 11.

## Storyboard (11 steps)

1. **Hook.** Two on-call doctors. The hospital's own rule: at least one must stay on call.
   Both doctors check the schedule, both go home, both transactions commit cleanly. Zero doctors
   on call. No error anywhere.
2. **Reveal: snapshot isolation's own mechanism.** Read from one fixed snapshot taken at the
   transaction's own start; on commit, if anything you touched was changed by someone else since
   that snapshot, you lose — first committer wins, stated directly by three vendors' own docs.
3. **Predict** (within the first four steps): snapshot isolation catches a real write-write
   conflict on the same row. Does it also catch two doctors updating two different rows?
4. **Reveal: SI prevents topic 11's own read skew.** The exact scenario from topic 11, rerun
   under `REPEATABLE READ` instead of Read Committed: both of T1's reads now land on the same
   snapshot, and the inconsistent pair can't appear — measured directly.
5. **Reveal: SI does catch a write-write conflict.** Two transactions both try to update the
   same row from the same snapshot; the first to commit wins, the second gets a real
   serialization failure — measured directly, not read from docs alone.
6. **Reveal: write skew survives anyway.** The hook's own doctors, reproduced for real: both
   read a count of 2 from their own snapshot, both update their own disjoint row, neither write
   ever conflicts with the other. Both commit. Zero doctors on call — the predict's answer.
   Takeaway.
7. **Reveal: the vendor-naming traps.** Postgres's own `REPEATABLE READ` is snapshot isolation,
   by its own docs' own words. Oracle's own `SERIALIZABLE` is snapshot isolation too — and Oracle
   itself sometimes calls it "serializable" anyway. MySQL InnoDB's `REPEATABLE READ` mixes a
   snapshot read with a locking read in the same transaction, which its own docs recommend against.
   Takeaway.
8. **Predict #2.** Without changing the isolation level at all, is there any way to make the
   doctors scenario safe?
9. **Reveal: materializing the conflict, and the real gap it leaves.** Forcing a real row lock
   (`SELECT ... FOR UPDATE`) on a shared row closes this one case — but it is a per-scenario
   patch, not a guarantee. The real guarantee needs full serializability, and there are two
   genuinely different routes to it. Takeaway.
10. **Recap.** One mechanism (snapshot, first-committer-wins), two real preventions, one real
    survivor, three vendor-naming traps.
11. **Prove it.** A two-transaction timeline is described, with each transaction touching only
    its own row; is it a safe outcome, a caught write-write conflict, or write skew?

Engagement arc: hook (step 1, a concrete contradiction with no definition yet — mirrors topic
11's own hook shape); two predicts (step 3, within the first four steps; step 8); the mechanism
built up through contrast (steps 2, 4, 5, 6, 7, 9); a surprising number (none new — topic 11
already banked the "real engine stricter than ANSI" surprise; this topic's own surprise is
qualitative, that a passing check at every single row still breaks the invariant); three
takeaways (steps 6, 7, 9, all at or after the reel's own midpoint, per the step-dot/takeaway
placement guard); recap (step 10); Prove it (step 11).

## Examples to execute

`examples.py`, three real experiments against this sandbox's real Postgres cluster under
`REPEATABLE READ`, each forced into its exact interleaving with `threading.Barrier`/
`threading.Event` and asserted:

1. `repeatable_read_prevents_read_skew`: topic 11's own read-skew scenario, rerun under
   `REPEATABLE READ`. Both of T1's reads land on x=50, y=50 — the same snapshot both times.
2. `repeatable_read_write_write_conflict_first_committer_wins`: two transactions both update the
   same row from the same snapshot; T1 commits balance 110, T2's own conflicting write gets a
   real `psycopg2.errors.SerializationFailure` and rolls back; final balance 110.
3. `write_skew_on_call_doctors`: two doctors, both read `on_call_count = 2` from their own
   snapshot, both commit "go off call" on their own disjoint row; final on-call count: 0, the
   invariant broken with no conflict ever detected.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 11's handoff verbatim): "Snapshot isolation
  prevents most of the anomalies topic 11 named, by construction — but not all of them. This
  topic is exactly which it prevents, which survives, and a real write-skew reproduction against
  this sandbox's own Postgres cluster."
- **Handoff** (to topic 13, verbatim): "Write skew survives snapshot isolation. The next topic
  is the two real ways to close that gap entirely and reach full serializability — one of which
  is SI itself, made serializable."

## Claims list

1. Snapshot isolation's own mechanism (snapshot-at-start, first-committer-wins). — Wikipedia, "Snapshot isolation."
2. Postgres `REPEATABLE READ` is implemented as snapshot isolation. — PostgreSQL docs.
3. Postgres's own first-updater-wins rollback behavior under `REPEATABLE READ`. — PostgreSQL docs.
4. Postgres's own documented `SERIALIZABLE`-vs-`REPEATABLE READ` example (the `mytab`/`class`/`SUM` case). — PostgreSQL docs.
5. Oracle `SERIALIZABLE` is snapshot isolation (first-committer-wins, `ORA-08177`). — Oracle Database 19c Concepts.
6. MySQL InnoDB `REPEATABLE READ` mixes snapshot reads and locking reads; MySQL's own docs recommend `SERIALIZABLE` instead of mixing them. — MySQL 8.0 Reference Manual.
7. Write skew: disjoint concurrent updates from an overlapping read, neither transaction seeing the other's update, both committing. — Wikipedia, "Snapshot isolation."
8. Oracle itself sometimes calls its own snapshot-isolation `SERIALIZABLE` level "serializable." — Wikipedia, "Snapshot isolation."
9–11. The three `examples.py` reproductions, each confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

Sources substituted per the skill's own rule: Fekete et al.'s own paper ("Making Snapshot
Isolation Serializable") is unreachable (a genuine TLS failure on its primary mirror, a login
wall on a second), replaced by Wikipedia's "Snapshot isolation" article, which states the
identical mechanism and canonical write-skew example and names Fekete et al.'s own paper among
its citations. MySQL's own InnoDB docs page returned an HTTP 403 to this sandbox's direct fetch
tooling (a bot-protection response, confirmed with a browser user-agent still blocked); its
quotes are the real text of that live page, retrieved through this session's own browsing tool
rather than substituted with a different source — documented in full in `SOURCES.md`'s own
header note and `FACT-CHECK.md`'s Problem Solving section.
