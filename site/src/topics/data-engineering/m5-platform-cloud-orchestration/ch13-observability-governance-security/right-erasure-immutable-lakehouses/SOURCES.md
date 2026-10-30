# Sources — de.right-erasure-immutable-lakehouses

## Apache Iceberg — Maintenance

URL: https://iceberg.apache.org/docs/latest/maintenance/

> Each write to an Iceberg table creates a new snapshot, or version, of a table.

> Expiring old snapshots removes them from metadata, so they are no longer available for time travel queries.

> Regularly expiring snapshots is recommended to delete data files that are no longer needed

> task or job failures can leave files that are not referenced by table metadata

## Apache Iceberg — Table specification (manifest file fields)

URL: https://iceberg.apache.org/spec/

> Field ids used to determine row equality in equality delete files.

> Path of a file, used in position-based delete files

## Delta Lake — Table utility commands (VACUUM)

URL: https://docs.delta.io/latest/delta-utility.html

> remove files no longer referenced by a Delta table and are older than the retention threshold

> The default retention threshold for the files is 7 days.

## Delta Lake — What are deletion vectors?

URL: https://docs.delta.io/delta-deletion-vectors/

> Deletion vectors are a storage optimization feature that can be enabled on Delta Lake tables.

> some Delta operations use deletion vectors to mark existing rows as removed without rewriting the Parquet file

> These changes are applied physically when data files are rewritten, as triggered by one of the following events:

## Apache Kafka — Design (Log Compaction)

URL: https://kafka.apache.org/44/design/design/

> Log compaction ensures that Kafka will always retain at least the last known value for each message key

> A message with a key and a null payload will be treated as a delete from the log.

> the topic's delete.retention.ms setting (the default is 24 hours)

## EU GDPR — Article 17, Right to erasure ('right to be forgotten')

URL: https://gdpr-info.eu/art-17-gdpr/

> The data subject shall have the right to obtain from the controller the erasure of personal data

## NIST SP 800-88 Revision 2 — Guidelines for Media Sanitization

URL: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf

> CE is based on the sanitization of keys used to encrypt data or to prevent access to the keys that encrypt data.
