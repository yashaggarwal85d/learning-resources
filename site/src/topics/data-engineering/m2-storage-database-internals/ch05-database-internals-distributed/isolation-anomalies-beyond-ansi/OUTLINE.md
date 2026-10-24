# Outline — de.isolation-anomalies-beyond-ansi

**Kind:** full, §5.2. About 15 minutes.

## Scope (full syllabus line, four clauses)

"Dirty write, dirty read, non-repeatable read, read skew, lost update, write skew, phantoms and
the read-only transaction anomaly; why the ANSI SQL-92 definitions are ambiguous (Berenson et al.
1995, Adya's dependency-graph formalisation) and what each anomaly looks like as a two-transaction
timeline."

- Clause 1: "dirty write, dirty read, non-repeatable read, read skew, lost update, write skew, phantoms" — the seven ANSI/Berenson-named anomalies, each defined precisely.
- Clause 2: "and the read-only transaction anomaly" — the eighth, the one a read-only transaction can still suffer.
- Clause 3: "why the ANSI SQL-92 definitions are ambiguous (Berenson et al. 1995, Adya's dependency-graph formalisation)" — the ambiguity itself, demonstrated, and Adya's own formal fix.
- Clause 4: "and what each anomaly looks like as a two-transaction timeline" — real, reproduced two-transaction timelines against this sandbox's own Postgres cluster.

## Outcomes

Name and distinguish dirty write, dirty read, non-repeatable read, read skew, lost update, write
skew, phantoms and the read-only transaction anomaly. Explain why the ANSI SQL-92 definitions are
ambiguous, per Berenson et al.'s critique and Adya's dependency-graph formalisation. Reproduce at
least one real anomaly as an actual two-transaction timeline against this sandbox's own Postgres
cluster.

## Concept ledger

- **Introduces:** `isolation-anomalies`.
- **Uses:** `acid-guarantees` (topic 10).
- **Declared:** none beyond topic 10.

## Storyboard (12 steps)

1. **Hook.** Two transactions, two separate commits, neither one erroring. Ten dollars is gone
   anyway. How?
2. **Reveal: the ANSI vocabulary.** Dirty write, dirty read, non-repeatable read and phantom —
   ANSI SQL-92's own four named phenomena, stated precisely and quickly.
3. **Predict** (within the first four steps): two engineers each read ANSI's own English
   definition of Dirty Read and write code to detect it. Do they end up enforcing the same rule?
4. **Reveal: the ambiguity, exposed.** The same sentence (P1) really does support two different,
   defensible readings — a narrow one and a broad one — that prohibit different sets of
   histories. This is Berenson et al.'s own demonstration, not an invented example.
5. **Reveal: Lost Update, a real timeline.** T1 reads 100, writes and commits 110. T2 reads the
   same stale 100, writes and commits 120 after T1's own commit. Final balance: 120. T1's own
   +10, gone, with no error anywhere.
6. **Reveal: Read Skew and Write Skew.** A real timeline: T1 reads x=50, T2 updates x and y to 80
   and commits, T1 rereads y and sees 80 — an inconsistent pair inside one transaction. Write
   skew is the two-writer cousin of the same shape, defined here and reproduced for real in the
   next topic. Takeaway.
7. **Reveal: Dirty Write, blocked anyway.** ANSI SQL-92 only excludes this at its strictest
   level — but a real engine's row-level locking excludes it everywhere, measured: a second
   writer to the same row genuinely blocks for as long as the first transaction holds it.
8. **Predict #2.** A transaction that performs no writes at all, only reads — can it still see a
   state that could never have occurred in any real order of execution?
9. **Reveal: the read-only transaction anomaly.** Yes — a reader can see a state no serial
   execution leading to the actual final state could have produced, even though it wrote
   nothing. Takeaway.
10. **Reveal: Adya's formalization, the real fix.** Instead of English sentences, a Direct
    Serialization Graph over real dependencies; an anomaly becomes a precise, checkable cycle,
    not a sentence two engineers can read two different ways. Takeaway.
11. **Recap.** Eight named anomalies, one real reason the ANSI definitions kept slipping past
    engineers, and the formal fix that closed the gap.
12. **Prove it.** A two-transaction timeline is described; which anomaly is it?

Engagement arc: hook (step 1, a concrete contradiction, no definition); two predicts (step 3,
within the first four steps; step 8); the mechanism built up through named anomalies (steps 2, 4,
5, 6, 7, 9, 10); a surprising number (step 7, the real measured block time proving a real engine
is stricter than ANSI's own minimum requires); three takeaways (steps 6, 9, 10, all at or after
the reel's own midpoint of step 6, per the step-dot/takeaway placement guard learned in §5.1's own
topics); recap (step 11); Prove it (step 12).

## Examples to execute

`examples.py`, three real two-transaction timelines against this sandbox's real Postgres cluster,
each forced into its exact interleaving with `threading.Barrier`/`threading.Event` and asserted:

1. `lost_update_under_read_committed`: T1 reads 100, writes and commits 110; T2 reads the same
   stale 100, writes and commits 120 after T1's commit. Final balance: 120 (T1's +10 lost).
2. `read_skew_under_read_committed`: T1 reads x=50, then T2 updates x and y to 80 and commits,
   then T1 rereads y and sees 80 — an inconsistent (50, 80) pair inside T1's own transaction.
3. `dirty_write_blocked_by_real_locking`: a second writer to the same row blocks for
   approximately T1's own hold time (measured ~0.3s), then applies only after T1 commits —
   real row-level locking excluding P0 structurally, where ANSI's own weakest level would not.

Write skew (A5B) is defined precisely in this topic but not reproduced here; topic 12 hosts its
own real reproduction (the "on-call doctors" pattern) as its own chapter-lab leg, per `CHAPTER.md`.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 10's handoff verbatim): "Isolation is the one
  letter of ACID with the most room to be violated quietly. This topic names exactly how: every
  real anomaly ANSI's own ambiguous definitions leave out, each shown as a real two-transaction
  timeline."
- **Handoff** (to topic 12, verbatim): "Snapshot isolation prevents most of these anomalies by
  construction — but not all of them. The next topic is exactly which it prevents, which one
  survives, and the vendor-naming traps around calling it 'serializable.'"

## Claims list

1. Dirty Write (P0). — Berenson et al. (1995).
2. Dirty Read (P1). — Berenson et al. (1995).
3. Non-repeatable Read (P2). — Berenson et al. (1995).
4. Phantom (P3). — Berenson et al. (1995).
5. Lost Update (P4). — Berenson et al. (1995).
6. Read Skew (A5A), and its relation to Non-repeatable Read as a degenerate case. — Berenson et al. (1995).
7. Write Skew (A5B). — Berenson et al. (1995).
8. The ANSI definitions' genuine ambiguity (the 2.1 vs. 2.2 readings of P1). — Berenson et al. (1995).
9. Adya, Liskov & O'Neil's dependency-graph formalism (DSG, G0 as write-only cycles). — Kingsbury & Alvaro (2020), restating Adya et al. (2000).
10. The read-only transaction anomaly. — Jorwekar et al. (2007), restating Fekete et al.'s own discovery.
11–13. The three `examples.py` reproductions, each confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

Sources substituted per the skill's own rule: Adya et al.'s own paper and dissertation are
unreachable (MIT's `pmg.csail.mit.edu` genuinely TLS-fails from this sandbox), replaced by
Kingsbury & Alvaro's "Elle" paper, which restates Adya's own formalism directly and by name. A
third source (Jorwekar et al. 2007) was added beyond the chapter plan's own two named sources,
because the read-only transaction anomaly the syllabus line names is not covered by either
Berenson et al. (1995, four years before its 2004 discovery) or Adya et al. (2000, which doesn't
name it either) — documented in full in `FACT-CHECK.md` → Problem Solving.
