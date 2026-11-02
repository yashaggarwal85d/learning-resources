# Fact-check — de.right-erasure-immutable-lakehouses

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Expiring old snapshots removes them from metadata, so they are no longer available for time travel queries. | Apache Iceberg documentation | Confirmed, quoted verbatim. |
| 2 | Data files are not deleted until they are no longer referenced by a snapshot that may be used for time travel or rollback. | Apache Iceberg documentation | Confirmed, quoted verbatim. |
| 3 | VACUUM removes files no longer referenced and older than the retention threshold; it is not triggered automatically, and the default retention threshold is 7 days. | Delta Lake documentation | Confirmed, quoted verbatim. |
| 4 | With deletion vectors enabled, some Delta operations mark existing rows as removed without rewriting the Parquet file that holds them. | Delta Lake documentation | Confirmed, quoted verbatim. |
| 5 | A null-payload message in a Kafka compacted log is a tombstone; tombstones are themselves cleaned out of the log after a period of time to free up space. | Confluent documentation (substituted for Apache Kafka's own documentation, unfetchable in this sandbox) | Confirmed, quoted verbatim. |
| 6 | `delete.retention.ms` configures the amount of time to retain delete tombstone markers for log-compacted topics. | Confluent documentation | Confirmed, quoted verbatim. |
| 7 | The data subject has the right to obtain erasure of personal data without undue delay where one of the stated grounds applies. | GDPR Article 17 | Confirmed, quoted verbatim. |
| 8 | Cryptographic erase is a recognised logical purge sanitization technique, and for logical/virtual storage such as cloud storage it may be the only viable purge option. | NIST SP 800-88 Rev. 2 | Confirmed, quoted verbatim. |
| 9 | A time-travel query against the snapshot from before a DELETE still returns the subject; the current read hides them. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 10 | After expiring old snapshots and compacting, the subject is physically removed from the data file. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 11 | Right after a tombstone is written, the value is gone but the tombstone record itself is still present; after `delete.retention.ms` elapses, the tombstone record itself is gone too. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |
| 12 | Deleting one subject's encryption key makes every copy of their data (table, log, backup) unreadable at once; an untouched subject's data in the same copies stays readable. | This course's own measurement (`examples.py`) | Confirmed, assert passes. |

## Red-team: the predict questions (steps 3 and 6)

**Question 1 (step 3):** time-travel to the snapshot from before the `DELETE` -- does it still
show the subject?

**Attack -- "deleting the row should remove it from every snapshot, old and new, since the row
is gone."** This conflates a logical delete with a physical one. `examples.py`'s own measurement
confirms the old snapshot's own `visible_ids` set was captured before the delete and is never
rewritten afterward; the data file it points to is literally the same file object. Nothing about
writing a new snapshot touches an older one's own record of what it could see.

**Question 2 (step 6):** a Kafka tombstone removes the value -- does it also remove the record
that a deletion happened?

**Attack -- "a tombstone is, definitionally, the deletion -- once it's written, nothing more
needs tracking."** This mistakes the tombstone's effect (hiding the value) for its own
lifecycle. `examples.py` shows the tombstone record persisting, visible on `read_value`, for the
full length of `delete.retention.ms` after it's written -- the deletion event itself has its own
separate expiry, independent of the value it deleted.

## Abandoned approaches

Measuring a real replica's lag against a real backup tool (pg_basebackup, a WAL replica) was
considered for the "replicas, backups and Kafka topics" clause, but this sandbox has neither a
second PostgreSQL replica nor a backup/restore tool available for this topic's own time budget;
the replica case is instead named once in `coverage.json`'s expert items as the same lagging-copy
mechanism the backup and Kafka-consumer-lag measurements already demonstrate, rather than
building a third near-duplicate measurement of an identical "a copy that hasn't caught up yet
still holds what was deleted" result. A real Spark-on-Iceberg cluster and a real Kafka broker
were considered for Claims 1-3 directly; neither is available in this sandbox, so a toy model
reproducing each system's own documented snapshot/delete-file and tombstone/retention mechanics
is used instead and disclosed in `SOURCES.md`, `examples.py`'s own docstring, and `REVIEW.md`.
