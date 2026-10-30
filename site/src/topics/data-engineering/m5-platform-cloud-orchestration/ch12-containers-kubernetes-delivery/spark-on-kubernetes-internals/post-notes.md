<section data-section="outcomes">

## After this topic you can

- Trace what happens, API call by API call, from `spark-submit` to running executors.
- Explain why dynamic allocation on Kubernetes needs shuffle tracking and what it costs.
- Predict recovery time for an executor killed abruptly versus decommissioned gracefully.
- Set up pod templates knowing which values Spark's own properties will overwrite.
- Choose among self-run Spark with an operator, EMR on EKS, and Google's managed Spark from stated operations and lock-in costs.

</section>

<section data-section="internals">

## A little deeper

### The driver is the cluster manager, briefly

Most of what Spark calls a "cluster manager" — YARN, standalone, Mesos — exists before the application does and outlives it. On Kubernetes, there's no such standing thing: `spark-submit` starts one pod, the driver, and the driver itself is the thing that asks the API server to create the executors. The cluster, for the lifetime of that one application, is something the driver built. That's also why the `OwnerReference` detail matters so much — nothing else is watching to clean up the executors when the driver goes except that one reference.

### Garbage collection as a cleanup mechanism, on purpose

`spark.dynamicAllocation.shuffleTracking.timeout`'s infinity default isn't an oversight — the documentation is explicit that Spark relies on the shuffle itself eventually being garbage collected rather than on a timer. That's a real trade: it means an executor holding shuffle data for a long-running job can sit there indefinitely, consuming resources a shrinking cluster might need back, and the only lever is either lowering the timeout (risking recomputation if the data turns out to still be needed) or shipping the data somewhere that doesn't depend on any one executor's lifetime at all — which is exactly Celeborn's pitch.

### Two operators, two APIs, same idea

The Apache Spark Kubernetes Operator (a subproject of Spark itself, `SparkApplication`/`SparkCluster` under the `spark.apache.org` API group) and the Kubeflow Spark Operator (a separate, older project, `SparkApplication` under `sparkoperator.k8s.io`) are easy to mix up by name alone. Both do the same conceptual thing — turn a Spark application into a declared Kubernetes resource a controller reconciles — but they're not interchangeable: their custom resources, Helm charts, and APIs are each their own.

</section>

<section data-section="lab">

## Try it

This topic hosts the chapter's §12.2 lab: running Spark on a local cluster and injecting an executor-pod eviction, an `OOMKilled` executor, a PVC failure, and a spot-style node loss with decommissioning off and on, recording restart, task-rescheduling, and recovery time for each.

**This build machine has no local Kubernetes cluster to run that lab against** — no reachable Docker daemon (confirmed: `docker ps` fails on the missing socket) and no `kubectl`, `kind`, or `k3s`. The lab's actual pod-level timings are therefore sourced from Spark's and AWS's own documentation rather than measured live, and disclosed as such. What *is* run for real: the `OwnerReference` cleanup model, the shuffle-tracking-timeout model, and the decommission-vs-abrupt-kill recompute-cost model, all built strictly from the documented mechanics, including the two-minute Spot-interruption window AWS documents.

```
$ python3 examples.py
ok  test_a_completed_graceful_decommission_redoes_nothing
ok  test_a_decommission_cut_off_before_migration_finishes_still_loses_the_unmigrated_blocks
ok  test_a_fast_migration_fits_inside_the_two_minute_warning
ok  test_a_finite_timeout_eventually_releases_the_executor_regardless_of_its_data
ok  test_a_slow_migration_does_not_fit_inside_the_two_minute_warning
ok  test_an_abrupt_kill_without_decommissioning_redoes_the_whole_stage
ok  test_an_executor_with_no_owner_reference_is_orphaned
ok  test_an_owner_reference_pointing_to_the_wrong_pod_name_orphans_the_executor
ok  test_decommissioning_never_redoes_more_than_an_abrupt_kill_would
ok  test_executors_owned_by_the_driver_are_removed_when_it_is_deleted
ok  test_the_default_timeout_never_releases_an_executor_still_holding_data
ok  test_with_shuffle_tracking_an_executor_holding_live_shuffle_data_is_kept
ok  test_with_shuffle_tracking_an_executor_with_no_shuffle_data_still_idles_out
ok  test_without_shuffle_tracking_an_idle_executor_always_idles_out

14 checks passed.
```

The gang-scheduling deadlock this chapter's *(skipped)* syllabus topic names (drivers running, executors pending, two jobs deadlocked waiting on each other's capacity) and the Kueue/Dynamic Resource Allocation fix for it is a sourced extension, not exercised here: Kueue is "a kubernetes-native system that manages quotas and how jobs consume them," deciding when a job may be admitted or must be preempted — exactly the capacity-aware layer plain pod-at-a-time scheduling lacks.

</section>

<section data-section="production">

## In code review

- **A client-mode driver pod without `spark.kubernetes.driver.pod.name` set.** Without it, executors get no `OwnerReference` at all, and a deleted driver leaves them orphaned — running, billed, and doing nothing.
- **Dynamic allocation enabled without shuffle tracking.** Executors holding shuffle data other stages still need can be torn down early, forcing exactly the recomputation dynamic allocation was supposed to avoid.
- **A spot-node strategy that assumes decommissioning alone is enough.** It only helps if block migration actually finishes inside whatever interruption warning the cloud gives — a migration that's still running when the node is reclaimed loses the unmigrated blocks just like an abrupt kill would.

</section>

<section data-section="next">

## Where this goes next

A Spark executor is disposable: lose one and the stage is redone. Not everything on a cluster can be treated that way. A Kafka broker owns data on a disk and a Flink job owns state that took hours to build. The next topic is how Kubernetes runs processes that must keep their identity.

</section>
