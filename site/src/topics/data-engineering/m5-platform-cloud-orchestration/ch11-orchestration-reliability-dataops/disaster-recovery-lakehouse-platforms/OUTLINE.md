# Outline: Disaster recovery for lakehouse platforms

## Engagement arc

1. **Hook** — a company replicates its lakehouse bucket to a second region every night and believes that is disaster recovery, until a real regional outage reveals the catalog database was never backed up at all: every table's bytes survived, perfectly, pointing at nothing usable.
2. **Predict: if the bytes all replicated cleanly, is the table safe?** — before the reveal, ask what else a table actually needs besides its data files.
3. **Reveal: table metadata holds absolute paths** — an Iceberg or Delta manifest answers a file lookup with a fully qualified path, so a bucket copied into a new region leaves the manifest pointing at paths that no longer exist, demonstrated on a real local manifest before and after rewriting it.
4. **Reveal: the catalog is a separate system** — a lost catalog database makes a perfectly intact table unfindable, demonstrated by the same files existing in both cases, only the catalog lookup differing.
5. **Predict: does a multi-region KMS key matter if the bytes already replicated?** — before the reveal, ask what happens to encrypted bytes when only the key stayed single-region.
6. **Reveal: encryption keys must be multi-region** — a region-scoped key makes replicated ciphertext permanently unreadable; a real multi-region key, by definition the same key material in both places, decrypts it.
7. **Reveal: immutable backups survive a compromised admin** — a regular backup is deleted by the same stolen admin credentials that could destroy production; a compliance-mode WORM backup is not, demonstrated on both.
8. **Reveal: restore drills are the only proof** — an RPO/RTO target is a number on a page until a real restore is timed against it; DORA's resilience-testing regime is the regulatory discipline that makes that routine instead of theoretical.
9. **Recap** — RPO and RTO per tier, the four reasons bucket replication alone is not DR, immutable backups against ransomware, and a timed restore drill as the only real proof.
10. **Prove it** — this topic's own real local-filesystem and real-crypto experiments: a manifest's absolute paths break and get fixed, a catalog lookup is lost and restored, a region-scoped key fails to decrypt where a multi-region key succeeds, a WORM backup survives a stolen admin credential, and a timed restore meets its RTO target.

## Deep dives

- **Internals**: why each of the four reasons is a genuinely separate failure mode rather than one problem repeated — table metadata, the catalog, the encryption key, and (sourced, not demonstrated live here) Kafka's own offsets are four different systems with four different backup requirements, and "the bucket replicated" answers none of them by itself.
- **Frontier**: DORA's operational resilience testing programme as the regulatory version of the restore drill this topic runs by hand — a standing obligation rather than a one-off exercise, now binding on financial-sector entities across the EU.
