<section data-section="outcomes">

## After this topic you can

- Explain what makes a broker different from a Spark executor and which Kubernetes feature supplies each missing property.
- Predict whether a given rolling restart is safe from the topic's replication factor and `min.insync.replicas`.
- State the three Flink upgrade modes and pick one for a stateful job.
- Say what the current Strimzi KRaft-only change means for an old cluster.
- Decide managed vs. self-run from a stated operations bill.

</section>

<section data-section="internals">

## A little deeper

### Two retention mechanisms, not one

Kubernetes' own `persistentVolumeClaimRetentionPolicy` (`whenDeleted`/`whenScaled`, each `Delete` or `Retain`) is a native StatefulSet field. Strimzi's brokers, though, run under its own `StrimziPodSet`, not a plain StatefulSet — so that native field doesn't govern them. Strimzi exposes its own, separate `deleteClaim` setting per volume instead: the *principle* (a claim-retention choice exists, and decides whether scaling or deleting the set destroys data) is the one this topic draws from the Kubernetes docs; the actual mechanism a Strimzi user configures is Strimzi's own field, named honestly rather than assumed to be the same thing.

### A disruption budget doesn't know what ISR means

It's tempting to think a `PodDisruptionBudget` is what keeps a Kafka roll safe. It isn't, not by itself — a PDB only counts how many Pods matching its selector may be unavailable at once; it has no idea what an in-sync replica set is. The actual ISR-awareness lives in `KafkaAvailability`, inside the operator, refusing its own restart. What the PDB and Strimzi Drain Cleaner do together is redirect an *external* eviction (a node drain run by someone else) into that same operator-owned check, instead of letting Kubernetes evict the broker directly and bypass it.

### "Latest checkpoint" is only as good as how recent it is

Last-state upgrade mode's appeal is that it works on any job, healthy or not, because it always falls back to the latest checkpoint information. But a checkpoint taken long ago, under a job that's been unhealthy for a while, could mean losing more processing time than expected on restart. The operator's own max-allowed-checkpoint-age setting exists specifically to catch this: past that age, it takes a fresh savepoint instead, for a healthy job, rather than trusting a stale one.

</section>

<section data-section="lab">

## Try it

This topic hosts no lab of its own: the savepoint-preserving upgrade it builds toward is exercised end to end in the next topic's lab instead.

**This build machine has no local Kubernetes cluster** — no reachable Docker daemon and no `kubectl`, `kind`, or `k3s`, the same sandbox limitation confirmed across every topic in this chapter. A live multi-broker Kafka roll and a live Flink Kubernetes Operator upgrade can't be run here, so both are sourced from Strimzi's and Flink's own documentation and source files rather than measured. What *is* run for real: the ISR-safe rolling-restart decision, modeled directly on `KafkaAvailability`'s own logic; the StatefulSet PVC-retention-policy resolution; and the Flink upgrade-mode and savepoint-fallback decisions, modeled directly on the operator's documented upgrade-mode table.

```
$ python3 examples.py
ok  test_a_broker_hosting_several_topics_is_blocked_if_any_one_topic_would_be_hurt
ok  test_a_broker_not_in_the_isr_at_all_never_blocks_its_own_roll
ok  test_a_broker_with_no_min_insync_replicas_configured_can_always_roll
ok  test_a_checkpoint_configured_to_be_retained_survives_termination
ok  test_a_default_checkpoint_is_deleted_when_the_job_terminates
ok  test_a_healthy_job_in_savepoint_mode_takes_a_savepoint
ok  test_a_savepoint_is_never_auto_deleted_regardless_of_retention_config
ok  test_an_unhealthy_job_in_savepoint_mode_falls_back_to_the_last_checkpoint
ok  test_an_unhealthy_job_with_no_checkpoint_fails_the_savepoint_upgrade
ok  test_default_policy_retains_the_pvc_on_statefulset_deletion
ok  test_hook_evicting_two_of_three_brokers_at_once_would_stall_acks_all_producers
ok  test_rolling_a_broker_that_leaves_min_insync_replicas_satisfied_is_allowed
ok  test_rolling_a_broker_that_would_drop_isr_below_min_insync_replicas_is_refused
ok  test_savepoint_mode_is_the_only_mode_requiring_a_healthy_job
ok  test_whendeleted_and_whenscaled_are_independent
ok  test_whenscaled_delete_removes_only_the_scaled_down_pod_pvc_not_on_node_failure

16 checks passed.
```

</section>

<section data-section="production">

## In code review

- **A rolling restart script that restarts brokers by ordinal, ignoring the current ISR.** It can take a topic below `min.insync.replicas` even when the replication factor on paper looks fine — the roller checks the *actual* in-sync set, not the nominal replica count, for exactly this reason.
- **A node drain with no PodDisruptionBudget for the Kafka StrimziPodSet's Pods.** Nothing stops Kubernetes from evicting two brokers of the same topic at once; the PDB is what forces the drain to wait.
- **A Flink job upgraded in last-state mode on a job that's been unhealthy for a long time, with no checkpoint-age limit configured.** It can restart from a checkpoint far staler than expected instead of failing loudly or falling back to a fresh savepoint.

</section>

<section data-section="next">

## Where this goes next

Everything in this chapter so far is a document: a Dockerfile, a manifest, an operator resource. The last question is who is allowed to change those documents on a running cluster, and what happens when someone changes the cluster by hand. That's GitOps.

</section>
