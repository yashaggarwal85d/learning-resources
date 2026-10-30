# Fact-check — de.right-erasure-immutable-lakehouses

| # | Claim in the reel | Source | Verdict |
|---|---|---|---|
| 1 | Each write to an Iceberg table creates a new snapshot. | Iceberg maintenance docs | Verbatim. |
| 2 | Expiring old snapshots removes them from metadata, so they're no longer available for time travel. | Iceberg maintenance docs | Verbatim. |
| 3 | Regularly expiring snapshots is recommended to delete data files no longer needed. | Iceberg maintenance docs | Verbatim. |
| 4 | Task or job failures can leave orphan files not referenced by table metadata. | Iceberg maintenance docs | Verbatim. |
| 5 | Iceberg's equality delete files use field ids to determine row equality; position delete files identify rows by file path. | Iceberg table specification | Verbatim (two separate field-definition quotes). |
| 6 | Delta's `VACUUM` removes files no longer referenced by the table and older than the retention threshold; the default threshold is 7 days. | Delta Lake utility-commands docs | Verbatim. |
| 7 | Delta deletion vectors mark existing rows as removed without rewriting the Parquet file; the change is applied physically only when files are rewritten (e.g. `OPTIMIZE`, `REORG TABLE ... APPLY (PURGE)`). | Delta Lake deletion-vectors docs | Verbatim. |
| 8 | Kafka log compaction retains at least the last known value per key; a null-valued record is a tombstone; the default `delete.retention.ms` is 24 hours. | Apache Kafka design docs | Verbatim. |
| 9 | The data subject has the right to obtain erasure of personal data from the controller. | GDPR Article 17 | Verbatim (opening clause). |
| 10 | Cryptographic erase is based on sanitizing the keys used to encrypt data, or preventing access to them. | NIST SP 800-88 Rev. 2 | Verbatim. |
| 11 | A `DELETE` in Iceberg or Delta is a new snapshot; the row remains reachable by time travel until the old snapshot expires. | Topic's own synthesis of claims 1–2, 6–7 | Reasoned, directly supported by the sourced definitions; also demonstrated live in `examples.py` against a real Delta table. |
| 12 | A key per subject costs storage, a lookup on every read, and a KMS call rate that grows with subject count; it erases only what was encrypted under that key. | Topic's own framing, consistent with topic 5's own crypto-shredding framing | Reasoned, not independently re-sourced here (topic 5 already carries this claim's own sourcing). |
| 13 | Proof of erasure is the table's own metadata (no active snapshot references the subject's files) plus the key store's own deletion record. | Topic's own framing, following `CHAPTER.md`'s "proving deletion to an auditor" clause | Reasoned; demonstrated in `examples.py` by the vacuum'd table's time-travel failure and the KMS's own `has_key` check. |

## Red-team analysis

- **Predict question (step 2):** the trap is assuming a SQL `DELETE` finishes the job everywhere.
  The sourced mechanics say otherwise for each artefact separately: the table needs expiry *and*
  vacuum (clauses 1–3), the Kafka topic needs its own tombstone retention window to elapse
  (clause 4, sourced to Kafka's own default), and the backup needs either a new backup cycle or
  crypto-shredding — none of which is "run one more SQL statement."
- **Crypto-shredding claim (step 7):** red-teamed against the limit `CHAPTER.md` itself states —
  "it erases only what was encrypted under that key (a copy made in plaintext before encryption
  is untouched)." `examples.py`'s `crypto_shred_across_all_three_copies` demonstrates the
  positive case (all three copies go unreadable) but does not demonstrate the limit case (a
  plaintext copy outside the scheme); the limit is stated in prose (step 8) rather than executed,
  consistent with how topic 5 itself treated the same limit.
- **Lab honesty:** the Kafka-topic and backup legs are explicitly documented stand-ins, not a
  real broker or backup tool, per `CHAPTER.md`'s own allowance ("Where the machine has no Kafka
  broker or backup tool, the topic leg uses the documented tombstone-and-retention behaviour on a
  local log and discloses it; the backup leg is a copy of the table directory"). The table leg
  and the crypto-shredding leg are real, runnable code (a genuine Delta Lake table; a toy but
  actually-irreversible key deletion), not simulations of a simulation.
- **Predict question (step 12):** tests whether the reader has separated crypto-shredding from
  table-level deletion as two independent operations — crypto-shredding a key makes the
  ciphertext unreadable regardless of whether a `DELETE` was ever issued against the table, since
  nothing about key deletion depends on the table's own delete path.
