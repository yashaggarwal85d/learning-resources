# Outline — `de.spark-on-kubernetes-internals` (full, §12.2, hosts the §12.2 chapter lab)

Bridge (from topic 5): "A Job runs a fixed set of pods you wrote down. Spark does something
stranger: you start one pod, the driver, and it asks the API server to create the rest."

## Steps

1. **Hook.** The shop's nightly job runs on spot nodes. At 02:10 a node is reclaimed with a
   two-minute warning.
2. **Predict.** With decommissioning off, how much work does the job redo when that node goes —
   the whole stage, one task, or nothing? With it on, what moves in those two minutes?
3. **`spark-submit` to running executors, API call by API call.** A `k8s://` master starts a
   driver pod; the driver asks the API server for executor pods and connects to them — no cluster
   manager pre-exists the application.
4. **The driver persists; the executors don't.** When the application ends, executor pods
   terminate and are cleaned up, but the driver pod remains in "completed" state (using no
   resources) so its logs survive. — takeaway
5. **The owner reference, the cleanup switch.** Executors carry an `OwnerReference` to the driver
   pod; the driver's death removes them — but only if `spark.kubernetes.driver.pod.name` is set to
   the right pod, or the reference points nowhere useful.
6. **Dynamic allocation needs shuffle tracking.** Kubernetes has no external shuffle service;
   `spark.dynamicAllocation.shuffleTracking.enabled` keeps an executor alive while it holds live
   shuffle data others still need. — takeaway
7. **The cost of shuffle tracking: an infinite default.** `shuffleTracking.timeout` defaults to
   infinity — an executor holding shuffle data may never idle out on its own, holding resources a
   shrinking cluster needs back.
8. **An abrupt kill vs. a graceful decommission.** Without decommissioning, losing an executor
   means redoing the stage that held its shuffle data. With `spark.decommission.enabled` plus
   block migration, the exiting executor's blocks move to others first.
9. **Predict 2 (resolves the hook).** With decommissioning on, what happens inside a two-minute
   spot warning — does the stage still redo?
10. **Remote shuffle, a different trade.** Apache Celeborn moves shuffle data off the executors
    entirely, named at the level of its own documentation — another service to run, for the
    ability to lose an executor without losing its data at all.
11. **Pod templates: the escape hatch, and who wins.** `podTemplateFile` carries what Spark's own
    properties can't express; Spark's own values always overwrite the template's where both set
    one. — takeaway
12. **Operators: "run this application" as a declared resource.** The Apache Spark Kubernetes
    Operator (`SparkApplication`/`SparkCluster`) and the Kubeflow Spark Operator both turn a
    `spark-submit` invocation into a reconciled custom resource (topic 3's loop again).
13. **Managed vs. self-run, honestly.** EMR on EKS and Google's Managed Service for Apache Spark on
    GKE run Spark pods on a cluster you don't operate yourself — named at the level of their own
    documentation, disclosed as sourced-only.
14. **Handoff.** A Spark executor is disposable: lose one and the stage is redone. The next topic
    is for processes that can't be treated that way.

## Lab (hosts the §12.2 chapter lab)

Per CHAPTER.md: run Spark on the local cluster and inject executor-pod eviction, an `OOMKilled`
executor, a PVC failure, and a spot-style node loss with decommissioning off and on; record
restart, task rescheduling, and recovery time for each.

**Sandbox reality check:** this build machine has the `docker` CLI but no reachable Docker daemon
(confirmed: `docker ps` fails with "no such file or directory" on the socket) and no `kubectl`,
`kind`, or `k3s` — there is no local Kubernetes cluster and no way to run `spark-submit` against
one. The lab's actual pod-level timings (restart latency, task rescheduling time, the measured
difference between an abrupt kill and a graceful decommission) are therefore sourced from Spark's
and AWS's own documentation, never run live, and disclosed as such in REVIEW.md. What *is* run for
real in `examples.py`: the OwnerReference cleanup logic (does a given reference actually clean up
executors), a shuffle-tracking-timeout model (does an executor idle out, and when), and a
decommission-vs-abrupt-kill recompute-cost model built strictly from the documented mechanics,
including the two-minute spot-interruption window AWS documents.

## Notes

- CHAPTER.md's planning brief names Chapter 7 §7.1 (driver, executors, cluster managers) **and**
  §7.3 (executor memory model, retry, fetch failure, remote shuffle) as `uses` dependencies.
  Checking `registry.ts` directly at build time: Chapter 7 currently has only two held topics, both
  §7.1 (`de.driver-executors-task-hierarchy`, introducing `spark-task-hierarchy` and
  `spark-driver-executor-model`; `de.dag-scheduling-stage-boundaries`, introducing
  `spark-narrow-wide-dependency` and `spark-stage-boundary`) — no §7.3 topic exists yet. Per
  CHAPTER.md's own cross-chapter-id rule, the §7.3 ids are a declared, logged gap (not guessed),
  the same situation topics 2 and 3 already hit for chapters 7 and 5 respectively. `uses` draws
  only on the four §7.1 ids that actually exist; `coverage.json`'s `gapReview.open` stays empty
  (the build's coverage check requires it) — the §7.3 dependency is named here and in REVIEW.md
  only.
- The gang-scheduling deadlock and Kueue/Dynamic Resource Allocation extension (the *(skipped)*
  syllabus topic) is named only in post-notes's Deep dive, per CHAPTER.md, not dramatized in the
  reel.
