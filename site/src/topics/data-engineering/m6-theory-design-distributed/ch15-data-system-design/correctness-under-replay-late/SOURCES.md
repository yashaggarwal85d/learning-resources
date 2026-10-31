## Akidau, Bradshaw, Chambers, et al. — "The Dataflow Model" (VLDB 2015)

URL: https://vldb.org/pvldb/vol8/p1792-Akidau.pdf
Version: Proceedings of the VLDB Endowment, Vol. 8, No. 12, 2015 (accessed 2026-10-30)

> Decomposes pipeline implementation across four related dimensions, providing clarity, composability, and flexibility:

> What results are being computed.

> Where in event time they are being computed.

> When in processing time they are materialized.

> How earlier results relate to later refinements.

Contents (for the coverage map):
1. The Dataflow Model's own four questions, which this topic uses as the framing for what a pipeline must decide about duplicates, lateness and refinements — not re-teaching watermark or trigger mechanics (Chapter 9's own subject), only the four-question structure itself.

## Apache Iceberg — "Branching and Tagging"

URL: https://iceberg.apache.org/docs/latest/branching/
Version: Apache Iceberg documentation, latest (accessed 2026-10-30)

> Iceberg table metadata maintains a snapshot log, which represents the changes applied to a table. Snapshots are fundamental in Iceberg as they are the basis for reader isolation and time travel queries.

> Branching and tagging can be used for handling GDPR requirements and retaining important historical snapshots for auditing.

Contents (for the coverage map):
1. Iceberg's own stated basis for snapshots: a maintained log of changes that underlies both reader isolation and time-travel queries — the concrete mechanism this topic points to (without re-teaching) for "a consumer can pin a version."
2. Iceberg's own stated use case for tagging: retaining historical snapshots specifically for auditing — the direct textual support for "an auditor can reconstruct what was reported when."
