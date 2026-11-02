# Sources: Distributed SQL architecture (`de.distributed-sql-architecture`)

## Spanner: Google's Globally-Distributed Database (Corbett et al., OSDI 2012)

URL: https://www.usenix.org/system/files/conference/osdi12/osdi12-final-16.pdf
Version: USENIX OSDI 2012 proceedings, retrieved 2026-10-30

> The set of replicas is collectively a Paxos group.

> The key enabler of these properties is a new TrueTime API and its implementation.

> Spanner is the first system to provide such guarantees at global scale.

> Running two-phase commit over Paxos mitigates the availability problems.

## Architecture Overview (CockroachDB documentation)

URL: https://docs.cockroachlabs.com/docs/stable/architecture/overview
Version: CockroachDB docs, retrieved 2026-10-30

> CockroachDB stores all user data (tables, indexes, etc.) and almost all system data in a sorted map of key-value pairs. This keyspace is divided into contiguous chunks called ranges, such that every key is found in one range.

> CockroachDB uses the Raft consensus protocol. In CockroachDB, when a range receives a write, a quorum of nodes containing replicas of the range acknowledge the write.

## Transaction Layer (CockroachDB documentation)

URL: https://docs.cockroachlabs.com/docs/stable/architecture/transaction-layer
Version: CockroachDB docs, retrieved 2026-10-30

> To optimize performance of reads, CockroachDB implements hybrid-logical clocks (HLC) which are composed of a physical component (always close to local wall time) and a logical component (used to distinguish between events with the same physical component).

> In terms of transactions, the gateway node picks a timestamp for the transaction using HLC time.

## Concurrency control in Aurora DSQL (AWS documentation)

URL: https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-concurrency-control.html
Version: AWS documentation, retrieved 2026-10-30

> Aurora DSQL uses optimistic concurrency control (OCC), which works differently from traditional lock-based systems. Instead of using locks, OCC evaluates conflicts at commit time.

> Two transactions attempted to modify the same row. The transaction with the earliest commit time succeeds, and the conflicting transaction receives the OC000 response

Internal cross-reference: this topic composes `de.partitioning-schemes-range-hash` (topic 21,
range-sharded keyspace), `de.consensus-inside-data-systems` (topic 23, consensus group per range),
and `de.2pc-production-databases` (§5.2, two-phase commit across ranges) into one real pattern,
rather than introducing any of those three mechanisms from scratch.
