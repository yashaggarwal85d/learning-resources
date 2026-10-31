# Before you watch

- **RPO (Recovery Point Objective)** — how much data you can afford to lose, measured as a span of time since the last durable copy.
- **RTO (Recovery Time Objective)** — how long you can afford to be down before a restore actually finishes.
- **Catalog database** — the separate system (Hive Metastore, Unity Catalog, Glue) that maps a table name to its current manifest location.
- **Offset translation** — resolving a consumer's resume point by timestamp in a replicated Kafka cluster, since a mirrored topic does not preserve the original offsets.
- **KMS key** — a managed encryption key; a multi-region key is the same key material made available in more than one region at once.
- **Immutable backup** — a copy that cannot be deleted or overwritten by anyone, including an account with full admin access, until its retention period expires.
- **WORM (write once, read many)** — the storage model an immutable backup uses to enforce that guarantee.
- **Restore drill** — actually running and timing a recovery, rather than trusting an RPO or RTO target left unverified.
- **DORA** — the EU Digital Operational Resilience Act, which makes resilience testing a standing regulatory obligation for financial-sector entities.
