Last verified: 30 October 2026. Expert sign-off: pending. Five synthetic experiments run in
`examples.py` (a toy key store, XOR-based, never real cryptography — the shape of the mechanism,
not production crypto): wrapping and unwrapping a DEK, KEK rotation leaving data untouched, a DEK
compromise forcing re-encryption, the control-versus-availability scale, and crypto-shredding one
customer's key — all asserts pass.

- Google Cloud KMS, "Envelope encryption": [cloud.google.com](https://cloud.google.com/kms/docs/envelope-encryption). The DEK/KEK terminology.
- AWS KMS, "AWS KMS keys" (concepts): [docs.aws.amazon.com](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html). Customer data keys, returned encrypted.
- AWS KMS, "Rotate AWS KMS keys": [docs.aws.amazon.com](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html). What rotation changes, and its own compromised-key caveat.
- AWS KMS, "Delete an AWS KMS key": [docs.aws.amazon.com](https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html). The waiting period before irreversible deletion.
- AWS KMS, "External key stores": [docs.aws.amazon.com](https://docs.aws.amazon.com/kms/latest/developerguide/keystore-external.html). Keys held outside the provider entirely.
- Google Cloud, "Cloud External Key Manager": [cloud.google.com](https://cloud.google.com/kms/docs/ekm). The second vendor's external-key offering.
- RFC 8446, "The Transport Layer Security (TLS) Protocol Version 1.3": [rfc-editor.org](https://www.rfc-editor.org/rfc/rfc8446). TLS's own stated goal.
- Apache Iceberg, "Encryption": [iceberg.apache.org](https://iceberg.apache.org/docs/latest/encryption/). Which file types table encryption covers.
- Apache Parquet, "Encryption": [parquet.apache.org](https://parquet.apache.org/docs/file-format/data-pages/encryption/). A data key wrapped under a master key.
- NIST SP 800-57 Part 1 Rev. 5, "Recommendation for Key Management: Part 1 – General": [csrc.nist.gov](https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final). The standards backing for this topic's vocabulary.
- GDPR, Article 32 — "Security of processing": [gdpr-info.eu](https://gdpr-info.eu/art-32-gdpr/). Encryption named as an appropriate security measure.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=envelope-encryption-kms-key:%20).
