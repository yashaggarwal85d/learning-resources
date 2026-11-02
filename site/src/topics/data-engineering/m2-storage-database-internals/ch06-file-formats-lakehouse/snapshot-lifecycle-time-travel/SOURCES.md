# Sources — de.snapshot-lifecycle-time-travel

## Apache Iceberg, "Maintenance"
URL: https://iceberg.apache.org/docs/latest/maintenance/
Version: latest (1.12.0) docs, fetched 2026-10-31

> Each write to an Iceberg table creates a new snapshot, or version, of a table. Snapshots can be used for time-travel queries, or the table can be rolled back to any valid snapshot.

> Expiring old snapshots removes them from metadata, so they are no longer available for time travel queries.

> Data files are not deleted until they are no longer referenced by a snapshot that may be used for time travel or rollback. Regularly expiring snapshots deletes unused data files.

> It is dangerous to remove orphan files with a retention interval shorter than the time expected for any write to complete because it might corrupt the table if in-progress files are considered orphaned and are deleted. The default interval is 3 days.

## Delta Lake, "Table utility commands"
URL: https://docs.delta.io/latest/delta-utility.html
Version: latest docs, fetched 2026-10-31

> You can remove files no longer referenced by a Delta table and are older than the retention threshold by running the vacuum command on the table. vacuum is not triggered automatically. The default retention threshold for the files is 7 days.

> The ability to time travel back to a version older than the retention period is lost after running vacuum.

> It is recommended that you set a retention interval to be at least 7 days, because old snapshots and uncommitted files can still be in use by concurrent readers or writers to the table. If VACUUM cleans up active files, concurrent readers can fail or, worse, tables can be corrupted when VACUUM deletes files that have not yet been committed. You must choose an interval that is longer than the longest running concurrent transaction and the longest period that any stream can lag behind the most recent update to the table.

> You can restore a Delta table to its earlier state by using the RESTORE command. A Delta table internally maintains historic versions of the table that enable it to be restored to an earlier state. A version corresponding to the earlier state or a timestamp of when the earlier state was created are supported as options by the RESTORE command.

## Databricks, "Prepare your data for GDPR compliance"
URL: https://docs.databricks.com/aws/en/security/privacy/gdpr-delta
Version: fetched 2026-10-31 ("Last updated on Oct 9, 2026")

> The General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA) are privacy and data security regulations that require companies to permanently and completely delete all personally identifiable information (PII) collected about a customer upon their explicit request.

> Delta Lake retains table history and makes it available for point-in-time queries and rollbacks. The VACUUM function removes data files that are no longer referenced by a Delta table and are older than a specified retention threshold, permanently deleting the data.

> By default, Delta Lake retains table history, including deleted records, for 30 days, and makes it available for time travel and rollbacks. But even if previous versions of the data are removed, the data is still retained in cloud storage.
