# Fact-check: de.checkpoints-exactly-once-boundaries

## Claims table

| Claim | Basis | Check |
|---|---|---|
| A simulated crash (removing a batch's commit-log entry) followed by a restart from the same checkpoint reprocesses exactly that batch | Measured (`examples.py`) | `python3 examples.py` assertions, passing |
| A plain, non-idempotent `foreachBatch` sink writes a real duplicate for the batch whose commit was lost | Measured | same |
| The identical sink, deduplicating by `batchId`, produces zero duplicates across the same simulated crash and restart | Measured | same |
| Restarting a streaming aggregation with changed grouping keys from the same checkpoint fails before any row of the restart is processed | Measured | same |
| By default, `foreachBatch` provides only at-least-once write guarantees, but `batchId` can be used to deduplicate and get exactly-once | Sourced, Spark streaming docs | `sources.mjs check`, word for word |
| Changes to the stateful operations of a streaming query (additions, deletions, schema modifications) are not allowed between restarts | Sourced, Spark streaming docs | same |
| Spark 4.2 adds named streaming sources and sinks specifically so they can be added, removed, or reordered without breaking checkpoints | Sourced, Spark 4.2.0 release notes | same |

## Red team

- **Is removing a commit-log entry by hand actually equivalent to a real driver crash, or just a
  different failure mode?** The mechanism Spark itself uses to decide whether to redo a batch is
  precisely the presence of an offset-log entry without a matching commit-log entry -- a real
  crash between those two writes produces exactly this state on disk. Manipulating the file
  directly reproduces the identical condition Spark's own recovery logic checks for, without
  needing to kill a JVM process mid-write to get there.
- **Could the naive sink's duplicate just be a bug in the probe's own bookkeeping, rather than a
  real re-execution of foreachBatch?** The duplicate row carries the *same* batchId as the
  original -- not a new one -- which is only possible if Spark genuinely re-ran the same batch
  through the same foreachBatch call a second time; a probe-side counting bug wouldn't produce
  a row tagged with a batchId that was already written once.
- **Does the dedup sink's zero-duplicate result just mean the replay never actually happened for
  that probe?** No -- the dedup sink's own marker-check logic runs unconditionally on every
  batchId it sees; the marker for the replayed batchId already existed from the first pass
  specifically because that batch's work (though not its commit) completed before the simulated
  crash, which is the realistic case this topic measures (a sink re-run, not skipped).
- **Is the claim about Spark 4.2's named sources/sinks measured, or only sourced?** Only sourced.
  This topic's own `examples.py` runs against Spark 4.0.1 and measures the checkpoint-breaking
  behavior that predates named sources; the 4.2 relaxation is named and quoted from the release
  notes rather than independently reproduced, since doing so would require a different Spark
  version than the one pinned for every other topic's measured claims in this chapter.

## Abandoned approaches

An early version of the crash simulation deleted only the commit-log entry itself, leaving its
`.crc` sidecar checksum file in place -- restarting then failed with a `FileAlreadyExistsException`
when Spark tried to rewrite that commit entry, an artifact of the simulation rather than the real
behavior being measured. Fixed by removing both the commit file and its `.crc` sidecar together.
Separately, the checkpoint-incompatibility probe (claim 3) initially restarted the changed-schema
query with no new input data available -- since Structured Streaming only re-validates a stateful
operator's schema when it actually has a new batch to run, an empty restart succeeded silently
and gave a false negative. Fixed by writing one new input file before the second, schema-changed
query starts, so a real batch actually attempts to run against the incompatible checkpoint.
