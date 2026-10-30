# Outline — de.right-erasure-immutable-lakehouses

## Syllabus line (full, seven clauses)

"deletes vs time travel (snapshots must expire), MOR delete files until compaction,
`VACUUM`/`expire_snapshots`/orphan removal, replicas, backups and Kafka topics (compaction
tombstones, retention), per-subject key crypto-shredding and its key-management cost, proving
deletion to an auditor, retention policies as code."

Clauses used verbatim in `coverage.json` (backticks stripped, matching `clean()`):
1. "deletes vs time travel (snapshots must expire)"
2. "MOR delete files until compaction"
3. "VACUUM/expire_snapshots/orphan removal"
4. "replicas, backups and Kafka topics (compaction tombstones, retention)"
5. "per-subject key crypto-shredding and its key-management cost"
6. "proving deletion to an auditor"
7. "retention policies as code"

## Concept ledger

- `introduces`: `delete-vs-snapshot-expiry` (a `DELETE` writes a new snapshot; the old one, and
  the files it references, survive until it's expired), `mor-delete-files-until-compaction`
  (merge-on-read hides a deleted row from queries before the row is physically rewritten away),
  `erasure-maintenance-ops` (`expire_snapshots`/`VACUUM`/orphan-file removal as the operations
  that actually free bytes, each with its own retention window and safety trade-off),
  `erasure-survival-points` (replica, backup, Kafka topic — three places a subject's data
  persists outside any table operation), `crypto-shredding-key-deletion` (topic 5's own
  mechanism, reused here as the one operation that reaches every copy at once),
  `proving-erasure-to-an-auditor`, `retention-policy-as-code`.
- `uses`: `dek-kek-envelope-hierarchy` (topic 5); this topic is the first full application of
  `crypto-shredding-key-deletion`, which topic 5 only introduced in passing as a consequence of
  key deletion — it's listed here as `introduces` since topic 5's own `introduces` list doesn't
  carry it (confirmed by reading topic 5's `registry.ts` entry: it introduces
  `pseudonymised-vs-anonymised-data` etc., not crypto-shredding by name).
- No declared cross-chapter gap: Chapter 6's table-format topics and Chapter 9's Kafka-retention
  topic, named in `CHAPTER.md`'s prerequisites panel, are referenced only as prerequisite
  *reading*, not as resolved `uses` ids this topic's own concepts depend on structurally — the
  mechanisms this topic needs (snapshots, delete files, compaction, log retention) are explained
  from primary sources directly in this topic's own reveals, consistent with how a reader who
  skipped Chapter 6/9 can still follow this topic standalone.

## Storyboard (12 steps)

1. **Hook** — a customer exercises the right to erasure; `DELETE FROM customers WHERE id = 42`
   runs, and the row is gone from every normal query. A month later an auditor time-travels to
   last week's snapshot and reads the customer's name — in the lakehouse, in a Kafka topic, and
   in last night's backup.
2. **Predict** — for each of the table, the topic, and the backup: does a SQL statement finish
   the job, or does closing it take something else entirely?
3. **Reveal: a delete writes a new snapshot, not an erasure** — the old snapshot, and every file
   it references, is still on disk; a time-travel query at that old snapshot still reads the
   erased row. (clause 1)
4. **Reveal: merge-on-read hides it before it's gone** — a position or equality delete file (or
   a Delta deletion vector) marks the row as removed for every *query*, but the row's bytes stay
   in the original data file until a compaction or purge actually rewrites it. (clause 2)
5. **Reveal: the operations that actually free the bytes** — expiring snapshots, vacuuming,
   removing orphan files: each has its own retention window, and shortening it risks breaking a
   concurrent reader's own time-travel query. (clause 3)
6. **Reveal: three more places the subject can survive** — a replica, a nightly backup, and a
   Kafka topic (cleared only once a tombstone's own retention window elapses) sit completely
   outside any operation run against the table. (clause 4)
7. **Reveal: crypto-shredding reaches all three at once** — encrypt each subject's rows under a
   key unique to that subject; delete the key, and the table, the topic and the backup all
   become unreadable in the same instant, without touching any of them. (clause 5a)
8. **Reveal: what that costs at scale** — a key per subject means a key to store, a key to look
   up on every read, and a KMS call rate that grows with the subject count; it also erases only
   what was actually encrypted under that key. (clause 5b, takeaway)
9. **Reveal: proving it to an auditor** — the evidence isn't "we ran a command," it's the table's
   own metadata showing no active snapshot references the subject's files, and the key store's
   own deletion record showing exactly when the key was destroyed. (clause 6, takeaway)
10. **Reveal: retention policies as code** — the expiry and vacuum windows, and which artefacts
    get crypto-shredded versus left to retention, are written down and version-controlled, not a
    judgment call made fresh each time a request arrives. (clause 7, takeaway)
11. **Recap** — a delete is a new snapshot, not an erasure; merge-on-read hides before it frees;
    expiry and vacuum are what actually frees bytes; replicas, backups and topics sit outside all
    of it; one key, deleted once, reaches every copy; and proof is metadata, not a memory of
    having run a command.
12. **Prove it** — a new scenario: a subject's key gets crypto-shredded today. A table-level
    `DELETE` was never run for that subject at all — their row is still live in every ordinary
    query. Does the query still return readable data, or not?

## Lab

Hosts the whole §13.2 chapter lab, run directly in `examples.py`:
- **Table leg (real):** a genuine Delta Lake table (`deltalake` + `pyarrow`, pip-installed this
  session) — `DELETE`, a time-travel read at the pre-delete version, then `VACUUM` with zero
  retention, after which the same time-travel read fails because the files are gone.
- **Kafka-topic leg (documented stand-in):** no broker is available in this environment, so a
  local compacted-log class reproduces Kafka's own documented behaviour exactly — a tombstone
  (`None` value) that's still a present key until `delete.retention.ms` (24 hours, Kafka's own
  default) elapses, disclosed here rather than run against a real broker.
- **Backup leg (documented stand-in):** no backup tool is available, so a plain directory copy
  taken before the erasure request stands in for a nightly backup, exactly as `CHAPTER.md` itself
  specifies ("the backup leg is a copy of the table directory").
- **Crypto-shredding leg (real, synthetic KMS):** the same toy-KMS XOR pattern topic 5 used,
  applied across all three artefacts to show one key deletion reaching all of them.

## Changes from the chapter plan

None beyond the concept-ledger note above (crypto-shredding is `introduces` here, not `uses`,
since topic 5 names the mechanism but does not list it as a concept it introduces by id).

## Engagement placement

- Hook + first predict: steps 1–2 (within the first four).
- Takeaways: steps 8, 9, 10 — all after the reel's own midpoint (step 6 of 12).
- Recap: step 11, immediately before Prove It.
- Second predict: step 12 ("Prove it"), applying the crypto-shredding claim to a scenario where
  the table-level `DELETE` was never run at all, testing whether the reader has generalised that
  crypto-shredding is independent of, not a replacement for needing, any table-level delete.
