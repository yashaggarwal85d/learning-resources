<section data-section="outcomes">

## Outcomes

Show on a real snapshot model that time travel still returns a "deleted" row until snapshots
are expired and the file is compacted; show on a compacted log that a tombstone hides a value
immediately but is itself retained for a separate window; show crypto-shredding making every
copy of one subject's data unreadable at once while an untouched subject's data in the same
copies stays readable; name what each of a table, a replica, a backup and a Kafka topic
actually needs to be truly erased, and what evidence proves it to an auditor.

</section>

<section data-section="measuring-the-compaction-boundary">

## Measuring the compaction boundary

`examples.py` keeps the exact snapshot and delete-marker shape Iceberg's own documentation
describes: a `DELETE` writes a new snapshot whose visible-row set excludes the subject, while
the data file itself is untouched. `time_travel_read` against the pre-delete snapshot id
confirms the subject is still physically present. Only after `expire_snapshots()` removes the
old snapshot from metadata and `compact()` rewrites the data file does the subject actually
disappear from `table.data_file` — the same two-step boundary Delta's own `VACUUM` command
sits behind, defaulting to a seven-day retention window before it will even consider a file
safe to remove.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a `DELETE` as finished.** The Hook's own scenario — a row gone from every query, yet
still readable a month later by time travel — is what a `DELETE` alone actually buys: hidden
from new reads, not erased. Only expiring old snapshots and compacting removes the physical
copy, and neither step runs on its own schedule.

**Trusting a Kafka tombstone to also erase the evidence of deletion.** `examples.py`'s own
measurement shows a tombstone hiding the value immediately while the tombstone record itself
survives until `delete.retention.ms` elapses — a lagging consumer that catches up after that
window sees no value and no sign a deletion ever happened, which is exactly how an
already-taken backup or a slow reader can keep quietly holding what was supposedly erased.

</section>

<section data-section="frontier">

## Frontier

Per-subject crypto-shredding closes every copy at once in this topic's own two-subject
measurement, but a real deployment multiplies that by every subject who has ever exercised
erasure: a key per subject multiplies key-storage volume, requires a key lookup on every single
read rather than only at write time, and drives up the call rate against whatever key-management
service holds the keys — a cost this topic is too small to demonstrate but that any real
key-per-subject scheme has to budget for.

</section>
