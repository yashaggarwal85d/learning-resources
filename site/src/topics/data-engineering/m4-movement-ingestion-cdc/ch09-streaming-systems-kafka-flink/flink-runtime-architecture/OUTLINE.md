# Outline — Flink runtime architecture

1. **Hook: throughput collapses, and nothing in the logs says why.** A job's throughput
   collapses the instant one downstream operator slows down, with no explicit error or signal
   anywhere — exactly what credit-based flow control is supposed to do, visibly, as a toy
   credit-counter simulation shows credits draining backward through the chain one hop at a time.
2. **Setup: a job needs a machine that runs it, continuously, at scale.** Everything so far has
   been about correctness inside a single step. This topic is the machine that actually runs it:
   Flink's own runtime.
3. **Predict: can a job's parallelism simply exceed its slots?** A job asks for more parallelism
   than the cluster has slots for. Does it run anyway, just slower, or does something stop it?
   (predict)
4. **Reveal: a coordinator, a set of workers, and a hard ceiling.** The JobManager schedules
   tasks and coordinates checkpoints; TaskManagers run the work, each offering a fixed number of
   slots; a job's parallelism is bounded by the total slots available across every TaskManager —
   not a soft limit, a hard one.
5. **Reveal: fusing operators together removes a hop entirely.** Consecutive operators with
   compatible parallelism and no shuffle between them are fused into one task — no network hop,
   no serialization between them — measured directly as a real cost comparison on the same
   stream.
6. **Reveal: backpressure with no explicit signal, by design.** Credit-based flow control means a
   receiver grants the sender credits rather than the sender pushing unboundedly; a slow consumer
   simply grants fewer credits, and the slowdown ripples backward through the whole chain.
7. **Predict: when per-job mode was finally removed, what replaced it?** Flink 2.0 removed the
   older per-job mode entirely. What runs a job's own code on the cluster in its place? (predict)
8. **Reveal: application mode is what Flink standardized on.** Application mode runs the job's
   own code on the cluster itself, one JobManager per application, not shared — the model Flink
   2.0's release notes state the older per-job mode was replaced by, not glossed over.
9. **Reveal: the same runtime, two different kinds of job.** The same runtime and APIs execute
   both bounded (batch) and unbounded (stream) jobs; adaptive batch scheduling adjusts a batch
   job's parallelism between stages from the actual data volume the previous stage produced,
   instead of fixing parallelism up front.
10. **Prove it.** Every number comes from this topic's own real run: the slot-bounded max
    parallelism, the chained-versus-unchained cost gap, the backpressure stall draining backward
    hop by hop, and adaptive scheduling picking a different parallelism for a different data
    volume.
11. **Recap.** A coordinator and a hard ceiling on parallelism, fused operators that skip a hop,
    backpressure with no explicit signal, one standardized deployment mode, and one runtime for
    both batch and stream.

Predict steps: 3 and 7 (first one within the first four steps). Takeaways planned on steps 5, 6,
and 9 (≥3).
