# Before you watch

- **Data contract** — a versioned, machine-readable file stating a table's schema, quality rules, SLAs and ownership together.
- **ODCS** — the Open Data Contract Standard, governed by Bitol under LF AI & Data.
- **Breaking-change classification** — automatically sorting a proposed schema change into non-breaking, breaking-with-migration-path, or breaking-with-no-path.
- **Producer-side gate** — a CI check, run in the producer's own pipeline, that blocks a breaking merge before it ships.
- **Runtime enforcement** — checking the same contract again at write time, catching a violation CI never had the chance to see.
- **Owner notification** — automatically finding every downstream consumer of a table via its lineage graph, rather than relying on the producer to remember.
