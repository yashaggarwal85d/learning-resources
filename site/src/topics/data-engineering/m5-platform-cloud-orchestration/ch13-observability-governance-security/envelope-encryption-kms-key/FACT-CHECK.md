# Fact-check — de.envelope-encryption-kms-key

| # | Claim | Source | Status |
|---|---|---|---|
| 1 | Google Cloud KMS: the DEK is encrypted ("wrapped") by a KEK, and the KEK never leaves Cloud KMS. | Google Cloud KMS envelope encryption docs | Confirmed, quoted verbatim. |
| 2 | AWS KMS returns data keys ("customer data keys") encrypted under a KMS key. | AWS KMS concepts docs | Confirmed, quoted verbatim. |
| 3 | AWS: KEK rotation has no effect on the data a KMS key protects; it does not re-encrypt data. | AWS KMS rotation docs | Confirmed, quoted verbatim. |
| 4 | AWS: key rotation will not mitigate the effect of a compromised data key. | AWS KMS rotation docs | Confirmed, quoted verbatim. |
| 5 | AWS KMS enforces a 7-30 day waiting period (default 30) before irreversibly deleting a key. | AWS KMS deletion docs | Confirmed, quoted verbatim. |
| 6 | An AWS external key store is backed by an external key manager the customer owns and manages outside AWS. | AWS KMS external key stores docs | Confirmed, quoted verbatim. |
| 7 | Google Cloud EKM is a service for using external keys managed within a supported external key manager. | Google Cloud EKM docs | Confirmed, quoted verbatim. |
| 8 | TLS's primary goal is a secure channel between two communicating peers. | RFC 8446, Introduction | Confirmed, quoted verbatim. |
| 9 | Iceberg table encryption encrypts and tamper-proofs data, delete, manifest and manifest-list files before they reach storage. | Apache Iceberg encryption docs | Confirmed, quoted verbatim. |
| 10 | Parquet: a data key is generated randomly and encrypted with a master key, remotely in a KMS or locally. | Apache Parquet encryption docs | Confirmed, quoted verbatim. |
| 11 | NIST SP 800-57 Part 1 Rev. 5 provides general key-management guidance and best practices. | NIST SP 800-57 Part 1 Rev. 5 abstract | Confirmed, quoted verbatim. |
| 12 | GDPR Article 32 names "the pseudonymisation and encryption of personal data" as an appropriate security measure. | GDPR Art. 32 | Confirmed, quoted verbatim. |

## Red-team: the predict question (step 2)

**Question:** given a leaked data key and an annual KEK rotation policy, is the data exposed? And
separately, what single operation makes one customer's data unrecoverable everywhere?

**Attack 1 — "rotation is rotation, surely it covers a leaked key too."** AWS's own documentation
directly contradicts this: rotation "will not mitigate the effect of a compromised data key." The
topic's reveal step (4) and `examples.py`'s own `dek_compromise_forces_reencryption` make this
concrete by counting blocks: rotation re-wraps zero data blocks' content; a DEK compromise forces
re-encryption of every block under that DEK, a genuinely different and more expensive operation.

**Attack 2 — "deleting the KEK must erase everything under it, so just delete the top key."**
True, but it is also the most blunt instrument available — it erases everything under that KEK,
not just one subject. The topic's own crypto-shredding claim is explicitly about granularity: "the
granularity of the key is the granularity of erasure," which is why topic 9 (erasure in immutable
lakehouses) needs a key scoped to one subject, not one scoped to an entire table or tier.

**Attack 3 — "TLS already encrypts this, why do we need encryption at rest too?"** RFC 8446's own
stated goal is a channel between two peers; it says nothing about data once written to disk, and
this topic's reveal step (6) states that distinction directly, with Iceberg and Parquet's own
file-level encryption as the at-rest answer TLS does not provide.
