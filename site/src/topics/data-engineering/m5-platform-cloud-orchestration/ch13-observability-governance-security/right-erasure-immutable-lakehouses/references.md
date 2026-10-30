Last verified: 30 October 2026. Expert sign-off: pending. Four experiments run in `examples.py`:
one against a real, locally-created Delta Lake table (`DELETE`, time travel, `VACUUM` — genuine
library calls, `pip install deltalake pyarrow`); a documented stand-in for a Kafka compacted
topic's tombstone-and-retention behaviour (no broker available in this environment, disclosed);
a plain directory copy standing in for a nightly backup (no backup tool available, disclosed,
per `CHAPTER.md`'s own allowance); and a synthetic crypto-shredding run reusing topic 5's toy-KMS
pattern across all three artefacts at once — all asserts pass.

- Apache Iceberg, "Maintenance": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/maintenance/). Expiring snapshots and removing orphan files.
- Apache Iceberg, "Table specification": [iceberg.apache.org](https://iceberg.apache.org/spec/). Position and equality delete files.
- Delta Lake, "Table utility commands": [docs.delta.io](https://docs.delta.io/latest/delta-utility.html). `VACUUM` and its default seven-day retention threshold.
- Delta Lake, "What are deletion vectors?": [docs.delta.io](https://docs.delta.io/delta-deletion-vectors/). Merge-on-read deletes and when they're physically applied.
- Apache Kafka, "Design" (Log Compaction): [kafka.apache.org](https://kafka.apache.org/44/design/design/). Tombstones and `delete.retention.ms`.
- EU GDPR, "Article 17: Right to erasure ('right to be forgotten')": [gdpr-info.eu](https://gdpr-info.eu/art-17-gdpr/). The data subject's right to obtain erasure.
- NIST, "SP 800-88 Revision 2: Guidelines for Media Sanitization": [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf). Cryptographic erase as a purge sanitization technique.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=right-erasure-immutable-lakehouses:%20).
