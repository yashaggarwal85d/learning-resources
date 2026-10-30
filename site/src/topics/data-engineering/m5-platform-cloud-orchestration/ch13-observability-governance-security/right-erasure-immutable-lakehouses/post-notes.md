<section data-section="outcomes">

## Outcomes

Erase one subject from a Delta table with `DELETE` and show a time-travel query still returning
them; then vacuum and show the files physically gone; erase the same subject by deleting a
per-subject key and show every copy unreadable; state exactly where the subject can still
survive (replica, backup, Kafka topic, an untouched plaintext copy) and what closes each; produce
the evidence an auditor would ask for.

</section>

<section data-section="internals">

## Internals

`examples.py`'s table leg runs against a real Delta Lake table (`deltalake` + `pyarrow`), not a
simulation: `erase_from_table_with_sql` genuinely calls `DeltaTable.delete`, reads an older
version by `DeltaTable(table_dir, version=...)`, then calls `.vacuum(retention_hours=0, ...)` and
shows the same version read now raising. The Kafka-topic and backup legs are documented
stand-ins — `CompactedLog` reproduces Kafka's own tombstone-and-`delete.retention.ms` behaviour
without a broker, and the backup leg is a plain `shutil.copytree`, taken before the erasure runs,
exactly as `CHAPTER.md` specifies for a machine with no backup tool available.
`crypto_shred_across_all_three_copies` reuses topic 5's toy-KMS XOR pattern, applied here across
three separate "copies" of one ciphertext to show a single key deletion reaching all of them at
once, with zero bytes in any of the three artefacts actually touched.

</section>

<section data-section="lab">

## Lab: the whole §13.2 lab

This topic hosts the full chapter lab, run directly in `examples.py` (see Internals): the table
leg is real and runnable; the Kafka-topic and backup legs are disclosed, documented stand-ins
for a broker and a backup tool this environment doesn't have; the crypto-shredding leg reuses
topic 5's own mechanism across all three. Running it needs `pip install deltalake pyarrow`.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating `DELETE` as the end of the job.** A `DELETE` that's never followed by snapshot expiry
and vacuuming leaves the erased subject fully readable by anyone with a time-travel query — which
is exactly the auditor's own discovery in the Hook.

**Shortening a retention window without checking who's still reading.** `expire_snapshots`,
`VACUUM` and orphan-file removal all trade a shorter window for less storage and faster
compliance, but a reader mid-query against a snapshot that window just expired breaks outright —
the safety trade-off this topic's own maintenance reveal names directly.

</section>

<section data-section="frontier">

## Frontier

Format-level deletion-vector adoption (Delta's own default since 3.1.0; Iceberg's v3 spec
deprecating position delete files in favour of deletion vectors for new tables) changes exactly
how a merge-on-read delete is represented on disk, not whether a compaction or purge is still
needed to free the bytes — the claim this topic makes holds under either representation. No
declared cross-chapter gap: the concepts this topic needs (snapshots, delete files, compaction,
log retention) are explained here from primary sources directly, and topic 5's
`dek-kek-envelope-hierarchy` and its own crypto-shredding framing are both built and live.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Erasure, masking and access all depended on knowing where a column lives and where it flows. That
knowledge has to live somewhere other than people's heads. The next topic opens the governance
tooling, starting with the place metadata is kept: the catalog.

</section>
