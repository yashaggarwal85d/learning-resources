# Fact-check — Flink runtime architecture

| Claim | Source | Status |
|---|---|---|
| The JobManager coordinates distributed execution: schedules tasks, reacts to failures, coordinates checkpoints and recovery | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| TaskManagers execute a dataflow's tasks and buffer and exchange the data streams | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| The smallest unit of resource scheduling in a TaskManager is a task slot | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| Flink chains operator subtasks together into tasks, reducing thread-to-thread handover and buffering overhead, increasing throughput and decreasing latency | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A Flink Application Cluster (application mode) is a dedicated cluster for one application, where the job's main method runs on the cluster rather than the client | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| The Per-job deployment mode has been removed in Flink 2.0; use Application mode instead | Flink 2.0 release notes | Confirmed, quoted verbatim |
| Credit-based flow control ensures whatever is on the wire has capacity at the receiver to handle | Apache Flink blog (2019) | Confirmed, quoted verbatim |
| If a receiver can't keep up, its credits hit zero and stop the sender, producing backpressure on that logical channel only, with no TCP-level blocking of other channels | Apache Flink blog (2019) | Confirmed, quoted verbatim |
| The Adaptive Batch Scheduler automatically decides operator parallelism for batch jobs based on the size of consumed datasets | Apache Flink 1.20 docs | Confirmed, quoted verbatim |
| A job's maximum parallelism equals TaskManager count times slots per TaskManager, with no slack above that | Modeled and measured directly in `examples.py` (`max_parallelism`) | Confirmed by the toy model's own real run |
| Chained operators cost measurably less than the same operators left unchained on the same stream | Modeled and measured directly in `examples.py` (`run_chained`, `run_unchained`) | Confirmed by the toy model's own real run |
| A stalled consumer's channel starves first, and the stall drains backward through a chain of channels one hop at a time | Modeled and measured directly in `examples.py` (`run_backpressure_chain`) | Confirmed by the toy model's own real run |
| Adaptive scheduling assigns different parallelisms to different upstream data volumes, capped at a configured maximum | Modeled and measured directly in `examples.py` (`adaptive_batch_parallelism`) | Confirmed by the toy model's own real run |

## Red-team

- **Is the "Per-job deployment mode has been removed" claim sourced from a stable, published
  page, or a draft?** The `apache.googlesource.com` URL fetched is the Flink project's own docs
  repository's markdown source for the release notes (the published `nightlies.apache.org` page
  for this exact note returns a 404 at the time of fetch, likely a site-structure change); the
  quoted sentence itself is the final, merged wording in that file, not draft PR commentary, and
  SOURCES.md discloses the URL substitution explicitly.
- **Does the toy credit-counter model match the real network stack's exact credit-exchange
  protocol?** It reproduces the same observable propagation (a stalled receiver's credits hit
  zero, and the stall then drains backward one hop at a time) the blog post describes and
  quotes, at the conceptual level CHAPTER.md scopes this topic to, without modeling Flink's actual
  buffer-pool, floating-buffer, or backlog-size mechanics.
- **Is the chaining cost multiplier (roughly seven times) a claim about real Flink performance?**
  No — it's an arbitrary toy cost model (a fixed handoff cost times a fixed number of hops) chosen
  to make the qualitative effect (chaining is cheaper, by a real, nontrivial margin) visible and
  measurable; the reel and SOURCES.md both frame it as this run's own number, not a cited Flink
  benchmark.

## Corrections

None. All claims trace to this topic's own four primary sources (Flink's architecture docs, its
2.0 release notes, its network-stack blog post, its elastic-scaling docs) or to this topic's own
toy model, measured directly.
