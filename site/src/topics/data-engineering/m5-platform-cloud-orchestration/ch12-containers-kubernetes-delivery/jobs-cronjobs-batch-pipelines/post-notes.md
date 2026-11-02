<section data-section="outcomes">

## After this topic you can

- Write an Indexed Job that processes N partitions with per-index retries, and predict a poison partition failing alone.
- Choose pod-failure-policy rules so a node drain doesn't consume retries but a bad-input exit code stops the Job immediately.
- Predict what a CronJob does when the previous run is still going, under each concurrency policy, and after a controller outage.
- State precisely what a CronJob does not give you that an orchestrator does.

</section>

<section data-section="internals">

## A little deeper

### Two different caps, one easy mix-up

`backoffLimitPerIndex` and `maxFailedIndexes` sound like the same knob and aren't. The per-index limit decides how many times *one* index retries before Kubernetes gives up on it and adds it to `failedIndexes` — the other indexes are untouched either way. `maxFailedIndexes` decides how many indexes may be in that failed set before the Job controller gives up on the *whole Job early*, terminating every pod still running. Leave `maxFailedIndexes` unset, and a Job with 190 failed indexes out of 200 will still run every index to completion; it just ends Failed instead of Complete. The two numbers answer different questions: "how hard does one partition retry?" and "how much total damage is tolerable before cutting losses?"

### A policy rule is not automatic

It's tempting to assume Kubernetes already knows an eviction isn't the workload's fault. It doesn't, on its own. The pod failure policy's own worked example is explicit: the rule `action: Ignore` with `onPodConditions: [{type: DisruptionTarget}]` is what "excludes Pod disruptions from being counted toward the `.spec.backoffLimit` limit of retries" — without writing that rule, a disruption-caused pod failure falls through to the default handling, which counts it like any other failure. The same discipline applies to `FailJob` on a specific exit code: Kubernetes doesn't know exit code 42 means "don't bother retrying" unless the policy says so.

### "Approximately once" is a promise with teeth

The CronJob doc states plainly that "a CronJob creates a Job object approximately once per execution time of its schedule," because "there are certain circumstances where two Jobs might be created, or no Job might be created." That's not a rare edge case to shrug off — it's the reason every CronJob's Jobs need the same idempotency property Chapter 11's named topic builds on. A CronJob that assumes "once" will eventually double-run something.

</section>

<section data-section="lab">

## Try it

This topic hosts no lab of its own (per CHAPTER.md's lab table). What *is* run for real here: `examples.py`'s per-index backoff model (a poison index failing alone, `maxFailedIndexes` cutting a Job short), the pod-failure-policy rule evaluator (first-match-wins, exit codes and conditions), the success-policy evaluator, the CronJob concurrency-policy resolver, and the missed-schedule counter — reproducing both of the CronJob doc's own worked examples (a 112-minute outage with no deadline, and the same outage with a 200-second deadline).

```
$ python3 examples.py
ok  test_a_node_drain_is_ignored_only_because_the_policy_names_it
ok  test_allow_runs_concurrently_when_the_previous_run_is_still_going
ok  test_any_policy_just_starts_normally_when_nothing_is_running
ok  test_docs_worked_example_one_no_deadline_112_minute_outage_does_not_start
ok  test_docs_worked_example_two_200s_deadline_the_same_outage_does_start
ok  test_exit_code_42_fails_the_whole_job_immediately
ok  test_failed_indexes_never_block_the_others_when_under_the_cap
ok  test_forbid_skips_the_new_run_when_the_previous_run_is_still_going
ok  test_max_failed_indexes_terminates_the_job_early
ok  test_one_bad_index_fails_alone_the_other_199_complete
ok  test_replace_kills_the_old_run_and_starts_the_new_one
ok  test_rules_are_evaluated_in_order_first_match_wins
ok  test_success_policy_met_by_any_one_of_the_named_indexes
ok  test_success_policy_not_met_until_enough_named_indexes_succeed
ok  test_success_policy_with_indexes_only_needs_every_named_index
ok  test_without_a_matching_rule_the_default_counts_toward_backoff_limit
ok  test_without_per_index_backoff_one_bad_partition_would_share_the_budget

17 checks passed.
```

</section>

<section data-section="production">

## In code review

- **A Job without `completionMode: Indexed` that assumes per-index retries anyway.** `backoffLimitPerIndex`, `successPolicy`, and the completion index itself only exist on an Indexed Job; a `NonIndexed` Job's pods are homologous and share one retry budget.
- **A pod failure policy without `restartPolicy: Never`.** The API requires it; without it, the field is rejected outright.
- **A CronJob with no `ttlSecondsAfterFinished` and no history limits tuned down, left running for months.** Unmanaged Jobs default to `orphanDependents`, so old pods can outlive the Jobs that made them and quietly accumulate.

</section>

<section data-section="next">

## Where this goes next

A Job runs a fixed set of pods you wrote down ahead of time. Spark does something stranger: you start one pod, the driver, and it asks the API server to create the rest, while it's running. The next topic opens that design, and what happens to a stage's shuffle data when one of those executor pods disappears.

</section>
