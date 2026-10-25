# Outline — de.physical-vs-logical-replication

**Kind:** full, §5.3. About 15 minutes.

## Scope (full syllabus line, four clauses)

"shipping WAL bytes (exact block copy, same major version) vs decoded row changes (cross-version,
selective, the basis of CDC); Postgres replication slots and the WAL-retention outage when a
consumer stalls; failover-safe logical slots (PG17+); MySQL row-based binlog as the equivalent."

- Clause 1: "shipping WAL bytes (exact block copy, same major version) vs decoded row changes
  (cross-version, selective, the basis of CDC)" — physical replication's own exact-block-address,
  byte-for-byte mechanism, contrasted directly with logical replication's own decoded, selective,
  cross-version mechanism, both named from the documentation itself.
- Clause 2: "Postgres replication slots and the WAL-retention outage when a consumer stalls" — a
  real replication slot, created and measured directly against this sandbox's own cluster: WAL
  retained while nothing consumes it, and retention dropping back to nothing once a consumer
  catches up.
- Clause 3: "failover-safe logical slots (PG17+)" — named and sourced from the PostgreSQL 17
  release notes; this sandbox's own cluster runs PostgreSQL 16, so the feature itself is disclosed
  honestly as sourced-only, not reproduced live.
- Clause 4: "MySQL row-based binlog as the equivalent" — named from MariaDB's own documentation
  (MySQL's direct fork, the identical row-based binary log mechanism under the same name), after
  `dev.mysql.com` itself blocked this project's own fetch pipeline.

## Outcomes

Contrast physical replication (exact WAL-byte shipping, same major version only) with logical
replication (decoded row changes, cross-version, selective, the basis of CDC); set up and inspect
a real Postgres replication slot against this sandbox's own cluster, and explain the real
WAL-retention outage that occurs when its consumer stalls; name failover-safe logical slots (PG17+)
and MySQL's row-based binlog as the same idea elsewhere.

## Concept ledger

- **Introduces:** `physical-vs-logical-replication`.
- **Uses:** `replication-ack-modes` (topic 17), `wal-lsn-fsync` (topic 3).
- **Declared:** none beyond topic 17.

## Storyboard (11 steps)

1. **Hook.** A replica needs everything the primary has. What exactly does "everything" mean to
   actually ship across the wire?
2. **Reveal: physical, exact bytes.** The exact block addresses, byte for byte. Fast, cheap to
   decode, and tied to one exact major version on both ends.
3. **Reveal: logical, decoded changes.** Not bytes — the actual row changes, decoded, selective,
   and readable across different major versions. The same mechanism change-data-capture is built
   on.
4. **Predict** (within the first four steps): a replica's own consumer stops reading. What happens
   to the data it hasn't consumed yet?
5. **Reveal: replication slots, named.** A slot is the primary's own promise: don't remove the WAL
   a consumer still needs, however long that consumer takes.
6. **Reveal: a stalled slot, measured.** A real slot, real writes, nothing ever consuming it. The
   WAL retained on its behalf, measured directly against this sandbox's own cluster. Takeaway.
7. **Reveal: the outage, and the fix, measured.** Left too long, that promise fills the disk. The
   same slot, caught up by a real consumer: retention drops back to nothing. Takeaway.
8. **Reveal: failover-safe logical slots.** PostgreSQL 17 lets a logical slot survive its own
   primary's failover — named directly from the release notes; this sandbox runs 16.
9. **Reveal: the same idea elsewhere.** MySQL's own row-based binary log: not the statement that
   ran, but every row it actually changed, logged separately. Takeaway.
10. **Recap.** Bytes or changes; a slot's promise, and what it costs when nobody collects on it.
11. **Prove it.** A consumer reading a logical replication slot crashes and stays down for six
    hours, during a sale that doubles the write rate. What is this slot doing to the primary's own
    disk the entire time it's down, and does fixing the consumer alone fix it?

Engagement arc: hook (step 1, a concrete unresolved question, no mechanism named yet); one predict
(step 4, within the first four steps); the mechanism built up through contrast (steps 2, 3, 5, 8,
9); a real measured number (steps 6-7, a real replication slot's own retained WAL growing, then
dropping to nothing once consumed); three takeaways (steps 6, 7, 9, all at or after the reel's own
midpoint of step 6, per the step-dot/takeaway placement guard); recap (step 10); Prove it (step 11).

## Examples to execute

`examples.py`, one real experiment against this sandbox's own Postgres cluster:

1. `stalled_slot_retains_wal_until_consumed`: a real physical replication slot (this sandbox's
   server runs `wal_level = replica`; a logical slot needs `wal_level = logical`, which requires a
   server restart this sandbox's own harness denies as a shared-resource-modifying action — see
   `FACT-CHECK.md`), 3,000 real writes with nothing consuming the slot, real WAL retained measured
   directly (over 1MB every run — confirmed stable across 3 repeated runs, 17-30MB observed). Then
   the slot is advanced as a real consumer would, and retention measured dropping to exactly zero.
   The retention mechanism measured here is the one the documentation describes for replication
   slots in general, identical for a physical or a logical slot; what a logical slot's own
   consumer would see instead (decoded row changes, not raw bytes) stays sourced from the
   documentation rather than reproduced live.

## Bridge and handoff

- **Bridge** (from `CHAPTER.md`, answers topic 17's handoff verbatim): "This section's refresher
  treated replication as one undifferentiated thing. This topic is the two genuinely different
  mechanisms hiding behind that word: physical WAL-byte shipping, and logical, decoded row changes
  — reproduced directly, including the real WAL-retention outage a stalled logical slot causes."
- **Handoff** (to topic 19, verbatim): "A replica that's falling behind isn't just a retention risk
  — it's a real, measurable lag with real consequences for anything reading from it. The next topic
  is exactly that lag, and what an application can do about it."

## Claims list

1. Logical replication is named in contrast to physical replication, which uses exact block
   addresses and byte-by-byte replication. — PostgreSQL documentation.
2. Logical replication is used for replicating between different major versions of PostgreSQL. —
   PostgreSQL documentation.
3. Logical replication is used for replicating between PostgreSQL instances on different
   platforms. — PostgreSQL documentation.
4. Replication slots ensure the primary doesn't remove WAL segments until they've been received by
   all standbys, and doesn't remove rows that could cause a recovery conflict even while a standby
   is disconnected. — PostgreSQL documentation.
5. Replication slots can cause the server to retain so many WAL segments that they fill up the
   space allocated for `pg_wal`. — PostgreSQL documentation.
6. PostgreSQL 17 enables the failover of logical slots. — PostgreSQL 17.0 release notes.
7. PostgreSQL 17 adds a server variable, `sync_replication_slots`, to enable failover logical slot
   synchronization. — PostgreSQL 17.0 release notes.
8. When row-based logging is enabled, DML statements aren't logged to the binary log; instead each
   row a statement inserts, updates, or deletes is logged to the binary log separately. — MariaDB
   documentation.
9. The `examples.py` measured experiment, confirmed and executed (see `FACT-CHECK.md`).

## Changes from the chapter plan

Two substitutions, both forced by this sandbox's own constraints, neither changing what the topic
actually teaches:

1. The chapter plan's own visual idea named a real **logical** replication slot. This sandbox's
   server runs `wal_level = replica`; creating a logical slot needs `wal_level = logical`, a
   postmaster-context setting that requires a server restart. The harness's own auto-mode
   permission classifier denied that restart (reason: "Modify Shared Resources"), both as a direct
   command and once already this session inside a different topic's own script (see topic 16's
   `FACT-CHECK.md`). Substituted a real **physical** replication slot for the measured experiment:
   the retention mechanism measured (WAL kept until a consumer advances the slot) is identical for
   both slot types, per the documentation's own general claim about "replication slots" (claim 4);
   only the decoded-vs-raw distinction stays sourced rather than reproduced.
2. `dev.mysql.com` returned HTTP 403 to every fetch attempt (as it did for topic 17's own MySQL
   source). Substituted MariaDB's own "Binary Log Formats" documentation, the identical row-based
   binlog mechanism under the same name (see `FACT-CHECK.md`'s Problem Solving section).
