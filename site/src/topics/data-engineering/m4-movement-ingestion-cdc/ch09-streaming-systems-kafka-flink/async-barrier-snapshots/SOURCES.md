Sources fetched and quoted for `de.async-barrier-snapshots`.

## State Management in Apache Flink (Carbone et al., 2017 VLDB)

URL: https://www.vldb.org/pvldb/vol10/p1718-carbone.pdf

> The state snapshotting mechanism is coordinated and pipelined, similarly to the classical Chandy-Lamport's protocol [27].

> Special markers are injected in each data stream partition at the dataflow sources, coordinated by the runtime and get disseminated throughout the dataflow graph

> When a task receives a snapshot marker on one of its inputs, it blocks that channel since all computation associated with the current epoch has to finish before continuing further

> Once markers have been received in all inputs (Figure 4(b)) the task can further notify downstream tasks while also proceeding with snapshotting.

> In situations where relaxed processing guarantees are acceptable (i.e. at-least once processing guarantees) a totally asynchronous version of the protocol can be selected on-demand.

## Checkpointing (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/dev/datastream/fault-tolerance/checkpointing/

> exactly-once vs. at-least-once: You can optionally pass a mode to the enableCheckpointing(n) method to choose between the two guarantee levels.
> Exactly-once is preferable for most applications. At-least-once may be relevant for certain super-low-latency (consistently few milliseconds) applications.

> unaligned checkpoints: You can enable unaligned checkpoints to greatly reduce checkpointing times under backpressure. This only works for exactly-once checkpoints and with one concurrent checkpoint.

> Option whether to create incremental checkpoints, if possible. For an incremental checkpoint, only a diff from the previous checkpoint is stored, rather than the complete checkpoint state. Once enabled, the state size shown in web UI or fetched from rest API only represents the delta checkpoint size instead of full checkpoint size. Some state backends may not support incremental checkpoints and ignore this option.

## Checkpointing under backpressure (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/ops/state/checkpointing_under_backpressure/

> Normally aligned checkpointing time is dominated by the synchronous and asynchronous parts of the checkpointing process. However, when a Flink job is running under heavy backpressure, the dominant factor in the end-to-end time of a checkpoint can be the time to propagate checkpoint barriers to

> Starting with Flink 1.11, checkpoints can be unaligned. Unaligned checkpoints contain in-flight data (i.e., data stored in buffers) as part of the checkpoint state, allowing checkpoint barriers to overtake these buffers. Thus, the checkpoint duration becomes independent of

> You should use unaligned checkpoints if your checkpointing durations are very high due to backpressure. Then, checkpointing time becomes mostly independent of the end-to-end latency. Be aware unaligned checkpointing adds to I/O to the state storage, so you shouldn't use it when the I/O to the state storage is actually the bottleneck during checkpointing.

## Checkpoints vs. Savepoints (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/ops/state/checkpoints_vs_savepoints/

> The primary purpose of checkpoints is to provide a recovery mechanism in case of unexpected job failures. A checkpoint's lifecycle is managed by Flink, i.e. a checkpoint is created, owned, and released by Flink - without user interaction.

> Checkpoints are automatically deleted if the application is terminated by the user (except if checkpoints are explicitly configured to be retained).

> Although savepoints are created internally with the same mechanisms as checkpoints, they are conceptually different and can be a bit more expensive to produce and restore from. Their design focuses more on portability and operational flexibility, especially with respect to changes to the job.

> Savepoints are created, owned and deleted solely by the user. That means, Flink does not delete savepoints neither after job termination nor after restore.

Notes on this topic's research: the Carbone et al. paper uses the term "marker" for what current Flink
docs call a "checkpoint barrier" — the same mechanism, renamed in later documentation and in this
topic's own narration/visuals (which follow CHAPTER.md's "barrier" vocabulary); this terminology shift
is disclosed explicitly in FACT-CHECK.md rather than silently harmonized. All four documents (one paper,
three 1.20 docs pages) fetched clean on the first attempt; the `checkpoints_vs_savepoints` page displays
Flink's standard "out-of-date version" banner, which appears on every non-latest versioned docs page
and is not specific to this content being stale or wrong.
