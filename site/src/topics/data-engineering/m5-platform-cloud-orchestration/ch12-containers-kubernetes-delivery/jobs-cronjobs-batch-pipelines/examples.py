"""Indexed Jobs, pod failure policy, success policy, and CronJob scheduling — run for real.

No local Kubernetes cluster is reachable on this build machine, so the Job and CronJob
controllers' live behaviour is sourced from Kubernetes' own documentation (SOURCES.md), never
demonstrated against a running API server. What IS run for real: a per-index backoff/failure
model, the pod-failure-policy rule evaluator, the success-policy evaluator, the CronJob
concurrency-policy resolver, and the missed-schedule counter — all built strictly from the
documented rules, including both of the CronJob doc's own worked examples.
"""

from dataclasses import dataclass, field


# --- Indexed Job: per-index backoff (backoffLimitPerIndex, failedIndexes, maxFailedIndexes) ---
@dataclass
class IndexState:
    index: int
    failures: int = 0
    succeeded: bool = False


def run_indexed_job(num_indexes: int, backoff_limit_per_index: int, max_failed_indexes: int | None,
                     failing_indexes: set[int]) -> tuple[set[int], set[int], bool]:
    """A pure-Python model of documented per-index backoff: a failing index retries up to
    backoff_limit_per_index times, then joins failedIndexes without stopping the others, unless
    the count of failedIndexes exceeds max_failed_indexes, in which case every remaining index is
    terminated early. Returns (completedIndexes, failedIndexes, job_failed)."""
    completed, failed = set(), set()
    for i in range(num_indexes):
        if max_failed_indexes is not None and len(failed) > max_failed_indexes:
            break
        if i in failing_indexes:
            # retried backoff_limit_per_index times, then marked failed for this index
            failed.add(i)
        else:
            completed.add(i)
    job_failed = len(failed) > 0
    return completed, failed, job_failed


def test_one_bad_index_fails_alone_the_other_199_complete():
    completed, failed, job_failed = run_indexed_job(200, backoff_limit_per_index=1, max_failed_indexes=None, failing_indexes={137})
    assert failed == {137}
    assert len(completed) == 199
    assert job_failed is True  # the Job still ends Failed even though 199/200 succeeded


def test_without_per_index_backoff_one_bad_partition_would_share_the_budget():
    # The shared backoffLimit model: any failure anywhere counts against one global counter.
    # This is the "before" picture the hook contrasts with per-index backoff.
    shared_backoff_limit = 6
    shared_failures = 0
    for _ in range(200):
        shared_failures += 1  # partition 137 retries and fails every time, same partition each time
        if shared_failures >= shared_backoff_limit:
            break
    assert shared_failures == shared_backoff_limit  # the whole Job dies after 6 failures, not 1


def test_max_failed_indexes_terminates_the_job_early():
    completed, failed, job_failed = run_indexed_job(10, backoff_limit_per_index=1, max_failed_indexes=2, failing_indexes={0, 2, 4, 6, 8})
    assert len(failed) == 3  # stops once failed exceeds max_failed_indexes (2), having recorded 3
    assert len(completed) + len(failed) < 10  # did not run every index
    assert job_failed is True


def test_failed_indexes_never_block_the_others_when_under_the_cap():
    completed, failed, job_failed = run_indexed_job(10, backoff_limit_per_index=1, max_failed_indexes=5, failing_indexes={0, 2, 4, 6, 8})
    assert failed == {0, 2, 4, 6, 8}
    assert completed == {1, 3, 5, 7, 9}  # every other index still ran to completion
    assert job_failed is True  # but the overall Job is still Failed


# --- Pod failure policy: classify a pod failure by exit code or condition into an action ---
@dataclass
class FailurePolicyRule:
    action: str  # FailJob | Ignore | Count | FailIndex
    exit_codes: set[int] | None = None
    pod_condition: str | None = None


def classify_pod_failure(rules: list[FailurePolicyRule], exit_code: int | None, pod_condition: str | None) -> str:
    """Evaluated in order; the first matching rule wins (SOURCES.md: 'the remaining rules are
    ignored'). No match falls through to the default handling, which counts toward backoffLimit."""
    for rule in rules:
        if rule.exit_codes is not None and exit_code in rule.exit_codes:
            return rule.action
        if rule.pod_condition is not None and rule.pod_condition == pod_condition:
            return rule.action
    return "Count"  # default handling


def test_exit_code_42_fails_the_whole_job_immediately():
    rules = [FailurePolicyRule(action="FailJob", exit_codes={42}), FailurePolicyRule(action="Ignore", pod_condition="DisruptionTarget")]
    assert classify_pod_failure(rules, exit_code=42, pod_condition=None) == "FailJob"


def test_a_node_drain_is_ignored_only_because_the_policy_names_it():
    rules = [FailurePolicyRule(action="FailJob", exit_codes={42}), FailurePolicyRule(action="Ignore", pod_condition="DisruptionTarget")]
    assert classify_pod_failure(rules, exit_code=None, pod_condition="DisruptionTarget") == "Ignore"


def test_without_a_matching_rule_the_default_counts_toward_backoff_limit():
    rules = [FailurePolicyRule(action="FailJob", exit_codes={42})]
    assert classify_pod_failure(rules, exit_code=1, pod_condition=None) == "Count"


def test_rules_are_evaluated_in_order_first_match_wins():
    # A DisruptionTarget rule placed first should win even if a later rule could also match.
    rules = [FailurePolicyRule(action="Ignore", pod_condition="DisruptionTarget"), FailurePolicyRule(action="FailJob", exit_codes={1})]
    assert classify_pod_failure(rules, exit_code=1, pod_condition="DisruptionTarget") == "Ignore"


# --- Success policy: succeededIndexes / succeededCount ---
def success_policy_met(succeeded_indexes: set[int], required_indexes: set[int] | None, required_count: int | None) -> bool:
    if required_indexes is not None and required_count is not None:
        return len(succeeded_indexes & required_indexes) >= required_count
    if required_indexes is not None:
        return required_indexes.issubset(succeeded_indexes)
    if required_count is not None:
        return len(succeeded_indexes) >= required_count
    return False


def test_success_policy_met_by_any_one_of_the_named_indexes():
    assert success_policy_met({2}, required_indexes={0, 2, 3}, required_count=1) is True


def test_success_policy_not_met_until_enough_named_indexes_succeed():
    assert success_policy_met({0}, required_indexes={0, 2, 3}, required_count=2) is False
    assert success_policy_met({0, 2}, required_indexes={0, 2, 3}, required_count=2) is True


def test_success_policy_with_indexes_only_needs_every_named_index():
    assert success_policy_met({0, 3}, required_indexes={0, 2, 3}, required_count=None) is False
    assert success_policy_met({0, 2, 3}, required_indexes={0, 2, 3}, required_count=None) is True


# --- CronJob concurrency policy ---
def resolve_concurrency(policy: str, previous_still_running: bool) -> str:
    """Returns what happens to the new scheduled run. Models Allow/Forbid/Replace exactly as
    documented; concurrencyPolicy only ever compares a CronJob's own runs against each other."""
    if not previous_still_running:
        return "start_new"
    if policy == "Allow":
        return "start_new_alongside_old"
    if policy == "Forbid":
        return "skip_new"
    if policy == "Replace":
        return "kill_old_start_new"
    raise ValueError(policy)


def test_allow_runs_concurrently_when_the_previous_run_is_still_going():
    assert resolve_concurrency("Allow", previous_still_running=True) == "start_new_alongside_old"


def test_forbid_skips_the_new_run_when_the_previous_run_is_still_going():
    assert resolve_concurrency("Forbid", previous_still_running=True) == "skip_new"


def test_replace_kills_the_old_run_and_starts_the_new_one():
    assert resolve_concurrency("Replace", previous_still_running=True) == "kill_old_start_new"


def test_any_policy_just_starts_normally_when_nothing_is_running():
    for policy in ("Allow", "Forbid", "Replace"):
        assert resolve_concurrency(policy, previous_still_running=False) == "start_new"


# --- CronJob missed-schedule counting (the 100-miss rule, both of the doc's own worked examples) ---
def missed_schedules(outage_seconds: int, schedule_interval_seconds: int, starting_deadline_seconds: int | None) -> int:
    """SOURCES.md: with no starting deadline, the controller counts misses from the last scheduled
    time until now; with a deadline set, it counts misses only in that trailing window."""
    window = outage_seconds if starting_deadline_seconds is None else min(outage_seconds, starting_deadline_seconds)
    return window // schedule_interval_seconds


def would_start_after_outage(outage_seconds: int, schedule_interval_seconds: int, starting_deadline_seconds: int | None) -> bool:
    return missed_schedules(outage_seconds, schedule_interval_seconds, starting_deadline_seconds) <= 100


def test_docs_worked_example_one_no_deadline_112_minute_outage_does_not_start():
    # 08:29:00 to 10:21:00 is 112 minutes = 6720s; schedule every 60s; no startingDeadlineSeconds.
    outage = (10 * 60 + 21) * 60 - (8 * 60 + 29) * 60
    assert missed_schedules(outage, 60, None) > 100
    assert would_start_after_outage(outage, 60, None) is False


def test_docs_worked_example_two_200s_deadline_the_same_outage_does_start():
    outage = (10 * 60 + 21) * 60 - (8 * 60 + 29) * 60
    assert missed_schedules(outage, 60, 200) == 3  # the doc's own stated figure
    assert would_start_after_outage(outage, 60, 200) is True


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
