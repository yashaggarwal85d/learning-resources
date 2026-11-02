# Outline — Trino: federated MPP execution (topic 34, §6.4)

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** §6.3 closed with a decision: Iceberg, over a REST catalog. This topic
   opens §6.4 by asking who actually executes a query against that table — starting
   with Trino's coordinator/worker split.
2. **Predict.** A query fails on one worker, mid-execution, by default. Does the whole
   query fail, or just that one task?
3. **Reveal.** The whole query fails — "the query fails and must be run again
   manually" is Trino's own default. Coordinator parses/plans/schedules; workers
   execute tasks and exchange data between stages.
4. **Reveal + takeaway.** Dynamic filtering: the join's build side produces real
   candidate keys, pushed to prune the probe side's scan before it ever reads those
   rows — run for real in `examples.py`, cutting 20,000 scanned rows to 2,850.
5. **Predict.** With real row-count statistics available, which table does Trino's
   cost-based join enumeration pick to build the join's hash side — the bigger table or
   the smaller one?
6. **Reveal + takeaway.** The smaller one, by its real row-count statistic — the same
   mechanism Iceberg's connector feeds via `ANALYZE`-collected column statistics.
   Without statistics, Trino falls back to merely eliminating cross joins, not true
   cost-based ordering.
7. **Reveal.** TASK retry policy: a failed task is retried alone, reusing other tasks'
   already-spooled output — not Trino's default. It's opt-in, and needs an external
   exchange manager, specifically recommended for long batch queries.
8. **Reveal.** Trino wasn't always Trino: PrestoSQL split from Facebook's Presto in
   2019 over governance control, then renamed in December 2020 after Facebook
   trademarked the Presto name.
9. **Reveal + takeaway.** Presto's own alternative path: Prestissimo, a drop-in C++
   worker built on Meta's Velox execution library, replacing only the Java worker —
   the coordinator stays Java.
10. **Recap.** A real coordinator/worker split, a real dynamic filter, a real
    cost-based build-side choice, a real TASK-retry spool — applied to this chapter's
    own table. Handoff: the next engine asks what happens when storage and execution
    are the same system — ClickHouse.
