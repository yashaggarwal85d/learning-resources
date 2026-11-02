Sources fetched and quoted for `de.flink-runtime-architecture`.

## Flink Architecture (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/concepts/flink-architecture/

> The JobManager has a number of responsibilities related to coordinating the distributed execution of Flink Applications:
> it decides when to schedule the next task (or set of tasks), reacts to finished
> tasks or execution failures, coordinates checkpoints, and coordinates recovery on
> failures

> The TaskManagers (also called workers) execute the tasks of a dataflow, and buffer and exchange the data
> streams.

> The smallest unit of resource scheduling in a
> TaskManager is a task slot.

> For distributed execution, Flink chains operator subtasks together into
> tasks. Each task is executed by one thread. Chaining operators together into
> tasks is a useful optimization: it reduces the overhead of thread-to-thread
> handover and buffering, and increases overall throughput while decreasing
> latency.

> a Flink Application Cluster is a dedicated Flink
> cluster that only executes jobs from one Flink Application and where the
> main() method runs on the cluster rather than the client.

## Flink 2.0 release notes (Apache Flink, docs repository)

URL: https://apache.googlesource.com/flink/+show/master/docs/content/release-notes/flink-2.0.md

> The Per-job deployment mode has been removed. Please use the Application mode instead.

## A Deep-Dive into Flink's Network Stack (Apache Flink blog, 2019)

URL: https://flink.apache.org/2019/06/05/a-deep-dive-into-flinks-network-stack/

> Credit-based flow control makes sure that whatever is "on the wire" will have capacity at the receiver to handle.

> If a receiver cannot keep up, its available credits will eventually hit 0 and stop the sender from forwarding buffers to the lower network stack. There is backpressure on this logical channel only and there is no need to block reading from a multiplexed TCP channel.

## Elastic Scaling (Apache Flink, 1.20 docs)

URL: https://nightlies.apache.org/flink/flink-docs-release-1.20/docs/deployment/elastic_scaling/

> The Adaptive Batch Scheduler is a batch job scheduler that can automatically adjust the execution plan. It currently supports automatically deciding parallelisms of operators for batch jobs. If an operator is not set with a parallelism, the scheduler will decide parallelism for it according to the size of its consumed datasets.

Notes on this topic's research: all four documents fetched clean on the first attempt. The
canonical Flink 1.20 docs page for credit-based flow control internals is no longer a standalone
page in current nightlies; the 2019 Apache Flink blog deep-dive (still linked from current docs
as the canonical explanation of the mechanism) was fetched instead and is Flink's own official
engineering blog, not a third party. The per-job-mode-removal claim was verified against the
Flink 2.0 release notes directly (a `nightlies.apache.org` URL for this exact page 404s; the
`apache.googlesource.com` mirror of the same markdown source file was fetched instead) rather
than relying on the 1.20 docs' own forward-looking "will be dropped" language, since CHAPTER.md
asks for the removal to be stated as a currency fact, not glossed.
