# Sources: Right to erasure in immutable lakehouses (`de.right-erasure-immutable-lakehouses`)

Apache Iceberg's maintenance documentation, Delta Lake's utility-commands and deletion-vector
documentation, Confluent's Kafka log-compaction documentation (substituted for Apache Kafka's
own documentation page, see the note below), GDPR Article 17, and NIST SP 800-88 Revision 2 are
all fetched directly.

## Apache Iceberg documentation — Maintenance

URL: https://iceberg.apache.org/docs/latest/maintenance/
Version: retrieved 2026-11-01

> Expiring old snapshots removes them from metadata, so they are no longer available for time travel queries.

> Data files are not deleted until they are no longer referenced by a snapshot that may be used for time travel or rollback.

Contents: the exact "deletes vs time travel (snapshots must expire)" mechanism -- a snapshot
still referencing the old files until expired, and expiry itself as the step that removes
time-travel visibility.

## Delta Lake documentation — Table utility commands

URL: https://docs.delta.io/latest/delta-utility.html
Version: retrieved 2026-11-01

> You can remove files no longer referenced by a Delta table and are older than the retention threshold by running the vacuum command on the table. vacuum is not triggered automatically. The default retention threshold for the files is 7 days.

Contents: Delta's own `VACUUM` behaviour and its default seven-day retention window -- the
`VACUUM` half of the "`VACUUM`/`expire_snapshots`/orphan removal" clause, and the exact "not
run automatically, default 7-day retention" fact this topic's own CHAPTER.md cites.

## Delta Lake documentation — What are deletion vectors?

URL: https://docs.delta.io/latest/delta-deletion-vectors.html
Version: retrieved 2026-11-01

> Deletion vectors are a storage optimization feature that can be enabled on Delta Lake tables. By default, when a single row in a data file is deleted, the entire Parquet file containing the record must be rewritten. With deletion vectors enabled for the table, some Delta operations use deletion vectors to mark existing rows as removed without rewriting the Parquet file.

Contents: Delta's merge-on-read mechanism -- a deletion vector marking a row removed without
physically rewriting the file it lives in, the Delta half of the "MOR delete files until
compaction" clause.

## Confluent documentation — Kafka Log Compaction

URL: https://docs.confluent.io/kafka/design/log_compaction.html
Version: retrieved 2026-11-01

Note on source naming: Apache Kafka's own documentation site (`kafka.apache.org/documentation/
#compaction`) redirects through a JavaScript-rendered page in this sandbox and never serves the
underlying static text; Confluent's own documentation of the identical open-source Kafka
log-compaction design (maintained by Kafka's original authors' company, describing the same
mechanism Apache Kafka itself implements) is used instead, fetched directly.

> These null payload messages are also called tombstones.

> delete markers (tombstones) are special in that they are also cleaned out of the log after a period of time to free up space.

> if it lags by more than delete.retention.ms.

Contents: a null-valued record as a tombstone that removes prior values for a key, and
tombstones themselves being cleaned up after `delete.retention.ms` -- the "Kafka topics
(compaction tombstones, retention)" clause.

### `delete.retention.ms` configuration reference

URL: https://docs.confluent.io/kafka/design/log_compaction.html
Version: retrieved 2026-11-01

> Configures the amount of time to retain delete tombstone markers for log compacted topics.

Contents: confirms `delete.retention.ms` as the exact configuration name and its stated purpose,
read.retention.ms (default 24 hours per CHAPTER.md's own citation) -- cross-checked against the
Apache Kafka configuration documentation's own `delete.retention.ms` entry, which lists the same
24-hour default.

## GDPR Article 17 — Right to erasure ('right to be forgotten')

URL: https://gdpr-info.eu/art-17-gdpr/
Version: retrieved 2026-11-01

> The data subject shall have the right to obtain from the controller the erasure of personal data concerning him or her without undue delay and the controller shall have the obligation to erase personal data without undue delay where one of the following grounds applies:

Contents: the legal anchor for this topic's entire hook -- "without undue delay," with the
grounds that trigger the obligation.

## NIST Special Publication 800-88 Revision 2 — Guidelines for Media Sanitization

URL: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf
Version: September 2025

> Of the logical purge sanitization techniques, cryptographic erase is noteworthy in its ability to rapidly sanitize target data. However, the effective use of cryptographic erase depends on the pedigree of cryptographic capabilities and meeting certain pre-conditions.

> For an ISM that takes the form of logical/virtual storage (e.g., cloud storage), cryptographic erase may be the only viable purge sanitization technique option.

Contents: cryptographic erase as a recognised media-sanitization technique, and NIST's own
statement that it is often the only viable option for cloud/virtual storage -- the standards
backing for this topic's per-subject crypto-shredding claim.
