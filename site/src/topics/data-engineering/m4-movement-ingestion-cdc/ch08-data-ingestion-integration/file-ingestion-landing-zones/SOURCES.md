# Sources — de.file-ingestion-landing-zones

`CHAPTER.md` names the Apache Hadoop `hadoop-aws` committers documentation, AWS S3 documentation
on conditional writes and on event notifications, Spark's generic file source options
(`ignoreCorruptFiles`), and the Delta protocol's atomic-version design (named as the
generalisation, left to Chapter 6, not quoted here). This topic quotes four independent primary
sources.

## Apache Hadoop: hadoop-aws Committers

URL: https://hadoop.apache.org/docs/stable/hadoop-aws/tools/hadoop-aws/committers.html
Fetched: 2026-10-31.

Quotes:
> the rename problem exists: committing work by renaming directories is unsafe as well as horribly slow.

Items: the exact reason this topic's own manifest and success-marker protocols exist — a
rename-based commit, the natural instinct from a filesystem, is not a safe operation on an
object store at all.

## AWS S3 documentation: Conditional writes

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html
Fetched: 2026-10-31.

Quotes:
> The If-None-Match header prevents overwrites of existing data by validating that there's not an object with the same key name already in your bucket.

Items: the exact mechanism `examples.py`'s `conditional_write_race` reproduces directly — a
conditional `PUT` rejects the second of two racing producers instead of silently overwriting the
first.

## AWS S3 documentation: Event notifications

URL: https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html
Fetched: 2026-10-31.

Quotes:
> Amazon S3 event notifications are designed to be delivered at least once. Typically, event notifications are delivered in seconds but can sometimes take a minute or longer.

Items: the exact delivery guarantee `examples.py`'s `event_notification_dedup` reproduces
directly — a discovery process built on notifications must dedup by key, because the identical
event can and does arrive more than once.

## Apache Spark docs: Generic File Source Options

URL: https://spark.apache.org/docs/latest/sql-data-sources-generic-options.html
Fetched: 2026-10-31.

Quotes:
> the configuration spark.sql.files.ignoreCorruptFiles or the data source option ignoreCorruptFiles to ignore corrupt files while reading data from files. When set to true, the Spark jobs will continue to run when encountering corrupted files and the contents that have been read will still be returned.

Items: the named silent-skip anti-pattern this topic's own quarantine protocol is built to avoid
— a corrupt file ignored this way disappears with no record of why, which `examples.py`'s
`poison_file_quarantine` deliberately does not do.
