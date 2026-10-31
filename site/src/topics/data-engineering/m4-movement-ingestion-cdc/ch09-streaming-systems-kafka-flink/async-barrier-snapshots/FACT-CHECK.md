# Fact-check — Async barrier snapshots

| Claim | Source | Status |
|---|---|---|
| The state snapshotting mechanism is coordinated and pipelined, similarly to the classical Chandy-Lamport's protocol | Carbone et al., 2017 VLDB | Confirmed, quoted verbatim |
| Special markers are injected in each data stream partition at the dataflow sources, disseminated throughout the dataflow graph | Carbone et al., 2017 VLDB | Confirmed, quoted verbatim |
| A task receiving a snapshot marker on one input blocks that channel until the current epoch finishes; once markers arrive on all inputs it notifies downstream and proceeds with snapshotting | Carbone et al., 2017 VLDB | Confirmed, quoted verbatim |
| In situations where relaxed guarantees are acceptable (at-least-once), a totally asynchronous version of the protocol can be selected on-demand | Carbone et al., 2017 VLDB | Confirmed, quoted verbatim |
| exactly-once is preferable for most applications; at-least-once may be relevant for super-low-latency applications | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Unaligned checkpoints greatly reduce checkpointing times under backpressure; this only works for exactly-once checkpoints and one concurrent checkpoint | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Incremental checkpoints store only a diff from the previous checkpoint rather than the complete state | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Under heavy backpressure the dominant factor in checkpoint time can be the time to propagate checkpoint barriers | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Unaligned checkpoints contain in-flight buffered data as part of the checkpoint state, making checkpoint duration independent of backpressure | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A checkpoint's lifecycle is managed by Flink, created/owned/released by Flink without user interaction; checkpoints are automatically deleted on termination | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Savepoints are created internally with the same mechanisms as checkpoints but are conceptually different, focused on portability; created, owned and deleted solely by the user | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Aligned-checkpoint duration grows directly with the backlog ahead of the barrier on a backed-up channel; unaligned duration stays fixed | Modeled and measured directly in `examples.py` (`aligned_checkpoint_duration`, `unaligned_checkpoint_duration`) | Confirmed by the toy model's own real run |
| An unaligned checkpoint's recorded snapshot grows with the backlog it absorbs | Modeled and measured directly in `examples.py` (`unaligned_snapshot_size`) | Confirmed by the toy model's own real run |
| A full checkpoint's cost keeps growing round over round as state accumulates; an incremental checkpoint's cost stays flat, bounded by the round's own delta | Modeled and measured directly in `examples.py` (`run_incremental_checkpoints`) | Confirmed by the toy model's own real run |

## Red-team

- **Does the paper actually use the word "barrier"?** No — the Carbone et al. paper calls the
  mechanism a "marker"; current Flink documentation and this topic's own narration and visuals use
  "barrier", the later, now-standard term for the same mechanism. SOURCES.md discloses this
  terminology shift explicitly rather than silently harmonizing the two sources' vocabulary.
- **Is the toy barrier-sweep model a real Flink benchmark?** No — it's a simplified standalone
  simulation of one channel's backlog delaying a barrier's arrival under aligned mode, and the
  same backlog being absorbed under unaligned mode. It reproduces the qualitative effect (aligned
  stalls under backpressure, unaligned doesn't, at the cost of snapshot size) both primary sources
  describe, not a port of Flink's actual network-stack or state-backend internals. Disclosed in
  references.md and above.
- **Does the "checkpoints vs savepoints" page actually describe Flink 1.20, given the "out of date
  version" banner?** Yes — that banner is Apache Flink's standard notice on every versioned docs
  page that isn't the latest stable release; the fetched page's own URL and version string
  (`v1.20.3`) confirm it's the 1.20-series content, not a stale or mismatched version.
- **Is the incremental-checkpoint cost model (a constant per-round delta) realistic?** It's a
  deliberately simplified stand-in chosen to make the qualitative claim visible (bounded by the
  delta, not the accumulated total) — the 1.20 docs' own quoted language ("only a diff from the
  previous checkpoint is stored") is the sourced claim; the specific numbers are this run's own,
  not a cited Flink benchmark.

## Corrections

None. All claims trace to this topic's own two primary sources (the Carbone et al. paper and three
Apache Flink 1.20 docs pages) or to this topic's own toy model, measured directly.
