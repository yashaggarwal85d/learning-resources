Last verified: 30 October 2026. No live lab (per `CHAPTER.md`); the composition, HLC monotonicity,
commit-wait, optimistic-concurrency, and round-trip-cost claims are checked executable claims
(`examples.py`), run and confirmed clean.

- Corbett et al., "Spanner: Google's Globally-Distributed Database" (OSDI 2012): [usenix.org](https://www.usenix.org/system/files/conference/osdi12/osdi12-final-16.pdf). The Spanner pattern's own defining paper: range-sharded keyspace, Paxos groups, TrueTime, two-phase commit.
- CockroachDB, "Architecture Overview": [docs.cockroachlabs.com](https://docs.cockroachlabs.com/docs/stable/architecture/overview). The range-sharded keyspace and per-range Raft consensus, as CockroachDB documents its own implementation of the pattern.
- CockroachDB, "Transaction Layer": [docs.cockroachlabs.com](https://docs.cockroachlabs.com/docs/stable/architecture/transaction-layer). Hybrid logical clocks and HLC-based transaction timestamps.
- AWS, "Concurrency control in Aurora DSQL": [docs.aws.amazon.com](https://docs.aws.amazon.com/aurora-dsql/latest/userguide/working-with-concurrency-control.html). Aurora DSQL's own documented optimistic-concurrency alternative to the Spanner pattern's pessimistic locking.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=distributed-sql-architecture:%20).
