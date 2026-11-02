# References

- AWS KMS Developer Guide, "Multi-Region keys in AWS KMS": https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-overview.html
- Amazon S3 User Guide, "Locking objects with Object Lock": https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock-overview.html
- Apache Iceberg 1.7.1 Javadoc, `ManifestFile`: https://iceberg.apache.org/javadoc/1.7.1/org/apache/iceberg/ManifestFile.html
- Delta Lake, `PROTOCOL.md` (add/remove actions): https://raw.githubusercontent.com/delta-io/delta/master/PROTOCOL.md
- ESMA, "Digital Operational Resilience Act (DORA)": https://www.esma.europa.eu/esmas-activities/digital-finance-and-innovation/digital-operational-resilience-act-dora

Last verified: 2026-10-31. Expert sign-off: pending.

Software run in this sandbox: Python 3 standard library (`json`, `shutil`, `tempfile`, `time`) for the manifest, catalog and timed-restore experiments; the `cryptography` package (Fernet) for the real region-scoped-vs-multi-region key demonstration. Every AWS KMS, S3 Object Lock, Iceberg, Delta Lake and DORA quote is verified word for word against the fetched source text.
