Last verified: 1 November 2026. Expert sign-off: pending. Four claims run in `examples.py`
against a toy model of Iceberg/Delta's own documented snapshot and delete-file mechanics and
Kafka's own documented tombstone/retention behaviour (disclosed in `SOURCES.md` and `REVIEW.md`
as a toy storage layer over real documented mechanisms, since this sandbox has no Spark/Iceberg
cluster or Kafka broker) — all asserts pass.

- Apache Iceberg, "Maintenance": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/maintenance/). Snapshot expiry and data-file retention until unreferenced.
- Delta Lake, "Table utility commands": [docs.delta.io](https://docs.delta.io/latest/delta-utility.html). `VACUUM`'s own seven-day default retention.
- Delta Lake, "What are deletion vectors?": [docs.delta.io](https://docs.delta.io/latest/delta-deletion-vectors.html). Marking rows removed without rewriting the file.
- Confluent, "Kafka Log Compaction": [docs.confluent.io](https://docs.confluent.io/kafka/design/log_compaction.html). Tombstones and `delete.retention.ms` — substituted for Apache Kafka's own documentation site, which this sandbox cannot fetch (see `SOURCES.md`).
- GDPR, "Art. 17 -- Right to erasure ('right to be forgotten')": [gdpr-info.eu](https://gdpr-info.eu/art-17-gdpr/). The "without undue delay" obligation.
- NIST, "Guidelines for Media Sanitization" (SP 800-88 Rev. 2): [nvlpubs.nist.gov](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf). Cryptographic erase as a recognised purge technique.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=right-erasure-immutable-lakehouses:%20).
