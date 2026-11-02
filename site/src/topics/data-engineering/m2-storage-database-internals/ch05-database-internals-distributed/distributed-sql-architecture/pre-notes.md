- **Consensus inside data systems**: topic 23's own content. *Where you meet it:* directly — the
  "consensus group per range" half of the Spanner pattern is exactly topic 23's own per-range
  consensus mechanism, reused here rather than re-derived.
- **Partitioning schemes: range, hash, consistent hashing**: topic 21's own content. *Where you
  meet it:* directly — the "range-sharded keyspace" half of the pattern is topic 21's own range
  partitioning, named by its actual purpose this time.
- **Two-phase commit in production databases**: §5.2's own content. *Where you meet it:* directly
  — "2PC across ranges" is the identical two-phase-commit mechanism, applied across consensus
  groups instead of plain database engines.
- **MVCC: append, versions vs. in-place**: §5.1's own content. *Where you meet it:* background —
  the hybrid-logical-clock timestamps this topic measures are exactly the version timestamps an
  MVCC system already uses to decide which row version a read sees.
