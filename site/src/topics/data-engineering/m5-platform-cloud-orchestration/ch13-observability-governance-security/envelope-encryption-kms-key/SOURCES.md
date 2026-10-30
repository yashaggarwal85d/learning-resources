## Google Cloud KMS — Envelope encryption

URL: https://cloud.google.com/kms/docs/envelope-encryption
Version: Google Cloud Key Management Service documentation (fetched 2026-10-30)

> The DEK is encrypted (also known as wrapped) by a key encryption key (KEK).

> The KEK never leaves Cloud KMS.

Contents:
1. The DEK/KEK terminology and what "wrapped" means, in the vendor's own words.
2. The KMS never sees the DEK's own plaintext content, only wraps and unwraps it.

## AWS KMS — AWS KMS keys (concepts)

URL: https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html
Version: AWS Key Management Service Developer Guide (fetched 2026-10-30)

> You can make requests through AWS KMS to use your KMS keys to directly protect information or request additional HSM-generated keys that are protected under your KMS key. These keys are called customer data keys, or CDKs.

Contents:
1. AWS's own name for a data key returned encrypted under a KMS key.

## AWS KMS — Rotate AWS KMS keys

URL: https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html
Version: AWS Key Management Service Developer Guide (fetched 2026-10-30)

> Key rotation has no effect on the data that the KMS key protects. It does not rotate the data keys that the KMS key generated or re-encrypt any data protected by the KMS key.

> Key rotation will not mitigate the effect of a compromised data key.

Contents:
1. What KEK rotation changes and what it leaves untouched, in AWS's own words.
2. AWS's own caveat that rotation does not help once a data key itself has leaked.

## AWS KMS — Delete an AWS KMS key

URL: https://docs.aws.amazon.com/kms/latest/developerguide/deleting-keys.html
Version: AWS Key Management Service Developer Guide (fetched 2026-10-30)

> Because it is destructive and potentially dangerous to delete a KMS key, AWS KMS requires you to set a waiting period of 7 – 30 days. The default waiting period is 30 days.

> After the waiting period ends you cannot cancel key deletion, and AWS KMS deletes the KMS key.

Contents:
1. The waiting period, in days, before an AWS KMS key is irreversibly deleted.
2. The point past which deletion cannot be undone.

## AWS KMS — External key stores

URL: https://docs.aws.amazon.com/kms/latest/developerguide/keystore-external.html
Version: AWS Key Management Service Developer Guide (fetched 2026-10-30)

> An external key store is a custom key store backed by an external key manager that you own and manage outside of AWS.

Contents:
1. AWS's own definition of an external key store, the control-outside-the-provider end of the key-control scale.

## Google Cloud — Cloud External Key Manager

URL: https://cloud.google.com/kms/docs/ekm
Version: Google Cloud Key Management Service documentation (fetched 2026-10-30)

> Cloud External Key Manager (Cloud EKM)

> A Google Cloud service for using your external keys that are managed within a supported EKM.

Contents:
1. Google's own definition of its external key manager, the second vendor's version of the same control-versus-availability trade.

## RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3

URL: https://www.rfc-editor.org/rfc/rfc8446
Version: RFC 8446 (fetched 2026-10-30)

> The primary goal of TLS is to provide a secure channel between two communicating peers; the only requirement from the underlying transport is a reliable, in-order data stream.

Contents:
1. TLS's own stated goal: a secure channel for data in motion between two peers, not a protection for data at rest.

## Apache Iceberg — Encryption

URL: https://iceberg.apache.org/docs/latest/encryption/
Version: Apache Iceberg documentation (fetched 2026-10-30)

> Iceberg table encryption protects confidentiality and integrity of table data in an untrusted storage. The data, delete, manifest and manifest list files are encrypted and tamper-proofed before being sent to the storage backend.

Contents:
1. Iceberg's own statement of which file types its table encryption covers and protects.

## Apache Parquet — Encryption

URL: https://parquet.apache.org/docs/file-format/data-pages/encryption/
Version: Apache Parquet documentation (fetched 2026-10-30)

> The Data key is generated randomly and encrypted with a Master key either remotely in a KMS, or locally after retrieving the Master key from a KMS.

Contents:
1. Parquet's own master-key/data-key split, the same envelope shape named at the file-format level.

## NIST SP 800-57 Part 1 Revision 5 — Recommendation for Key Management: Part 1 – General

URL: https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final
Version: NIST Special Publication 800-57 Part 1 Revision 5 (fetched 2026-10-30)

> This Recommendation provides cryptographic key-management guidance. It consists of three parts. Part 1 provides general guidance and best practices for the management of cryptographic keying material, including definitions of the security services that may be provided when using cryptography and the algorithms and key types that may be employed, specifications of the protection that each type of key and other cryptographic information requires and methods for providing this protection, discussions about the functions involved in key management, and discussions about a variety of key-management issues to be addressed when using cryptography.

Contents:
1. NIST's own scope statement for its key-management recommendation, the standards-body backing for this topic's key-hierarchy vocabulary.

## GDPR, Article 32 — Security of processing

URL: https://gdpr-info.eu/art-32-gdpr/
Version: General Data Protection Regulation, Article 32 (fetched 2026-10-30)

> the pseudonymisation and encryption of personal data;

Contents:
1. GDPR's own text naming encryption, alongside pseudonymisation, as an appropriate security
   measure — the legal hook for this chapter's bridge from classification to encryption.

---

Last verified 2026-10-30. All eleven sources checked clean (0 problems) with
`node scripts/sources.mjs check`.
