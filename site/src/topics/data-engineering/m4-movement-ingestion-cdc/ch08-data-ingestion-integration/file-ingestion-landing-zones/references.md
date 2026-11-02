Last verified: 31 October 2026. Every measurement (`examples.py`) is a direct run against this
topic's own in-process mock object store: a producer crash reproduced with and without a
manifest gate, a two-producer conditional-write race, a poison-file quarantine over three
landed files, a schema-on-write-versus-schema-on-read detection-timing comparison, and an
event-notification dedup against a growing-prefix listing cost.

- Apache Hadoop docs, "hadoop-aws: Committing work to S3": [hadoop.apache.org](https://hadoop.apache.org/docs/stable/hadoop-aws/tools/hadoop-aws/committers.html). Why renaming directories to commit is unsafe on an object store.
- AWS S3 docs, "Conditional writes": [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/conditional-writes.html). The If-None-Match header this topic's own race measures.
- AWS S3 docs, "Event notifications": [docs.aws.amazon.com](https://docs.aws.amazon.com/AmazonS3/latest/userguide/EventNotifications.html). At-least-once delivery, the reason discovery needs its own dedup.
- Apache Spark docs, "Generic File Source Options": [spark.apache.org](https://spark.apache.org/docs/latest/sql-data-sources-generic-options.html). The ignoreCorruptFiles silent-skip anti-pattern.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=file-ingestion-landing-zones:%20).
