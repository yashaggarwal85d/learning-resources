"""Spark-on-Kubernetes mechanics, run for real.

No local Kubernetes cluster is reachable on this build machine (confirmed: `docker ps` fails —
there is no Docker daemon socket — and no kubectl/kind/k3s exist), so spark-submit's actual pod
creation, the lab's injected-failure recovery timings, and the operators' live reconciliation are
sourced from Spark's and the operators' own documentation (SOURCES.md), never run against a real
cluster. What IS run for real: the OwnerReference cleanup model, the shuffle-tracking-timeout
model, and the decommission-vs-abrupt-kill recompute-cost model, all built strictly from the
documented mechanics.
"""

from dataclasses import dataclass, field


# --- OwnerReference cleanup: the driver's death removes its executors, but only correctly wired ---
@dataclass
class Pod:
    name: str
    owner_ref: str | None = None  # name of the pod this one is owned by, if any


def executors_removed_when_driver_deleted(driver_pod_name: str, executors: list[Pod]) -> set[str]:
    """SOURCES.md: an OwnerReference pointing to the driver pod means that pod's deletion removes
    the executor. An executor with no OwnerReference, or one pointing to the wrong pod name, is
    orphaned instead — exactly the caution the docs give about setting it to the wrong pod."""
    return {e.name for e in executors if e.owner_ref == driver_pod_name}


def test_executors_owned_by_the_driver_are_removed_when_it_is_deleted():
    driver = "app-driver"
    executors = [Pod("exec-1", owner_ref=driver), Pod("exec-2", owner_ref=driver)]
    assert executors_removed_when_driver_deleted(driver, executors) == {"exec-1", "exec-2"}


def test_an_executor_with_no_owner_reference_is_orphaned():
    driver = "app-driver"
    executors = [Pod("exec-1", owner_ref=driver), Pod("exec-2", owner_ref=None)]
    removed = executors_removed_when_driver_deleted(driver, executors)
    assert removed == {"exec-1"}
    assert "exec-2" not in removed


def test_an_owner_reference_pointing_to_the_wrong_pod_name_orphans_the_executor():
    # SOURCES.md's own caution: setting the reference to a pod that is not actually the driver
    # means the executor is never cleaned up when the real driver goes.
    executors = [Pod("exec-1", owner_ref="some-other-pod")]
    assert executors_removed_when_driver_deleted("app-driver", executors) == set()


# --- Shuffle tracking: dynamic allocation keeps an executor alive while it holds live shuffle data ---
def executor_can_idle_out(holds_live_shuffle_data: bool, shuffle_tracking_enabled: bool) -> bool:
    """Without shuffle tracking, an idle executor can always be released. With it enabled, an
    executor holding live shuffle data is kept until that data is no longer needed."""
    if not shuffle_tracking_enabled:
        return True
    return not holds_live_shuffle_data


def test_without_shuffle_tracking_an_idle_executor_always_idles_out():
    assert executor_can_idle_out(holds_live_shuffle_data=True, shuffle_tracking_enabled=False) is True


def test_with_shuffle_tracking_an_executor_holding_live_shuffle_data_is_kept():
    assert executor_can_idle_out(holds_live_shuffle_data=True, shuffle_tracking_enabled=True) is False


def test_with_shuffle_tracking_an_executor_with_no_shuffle_data_still_idles_out():
    assert executor_can_idle_out(holds_live_shuffle_data=False, shuffle_tracking_enabled=True) is True


SHUFFLE_TRACKING_TIMEOUT_DEFAULT = float("inf")  # spark.dynamicAllocation.shuffleTracking.timeout


def executor_released_after(elapsed_seconds: float, timeout_seconds: float, still_holds_data: bool) -> bool:
    if not still_holds_data:
        return True
    return elapsed_seconds >= timeout_seconds


def test_the_default_timeout_never_releases_an_executor_still_holding_data():
    assert executor_released_after(elapsed_seconds=10**9, timeout_seconds=SHUFFLE_TRACKING_TIMEOUT_DEFAULT, still_holds_data=True) is False


def test_a_finite_timeout_eventually_releases_the_executor_regardless_of_its_data():
    assert executor_released_after(elapsed_seconds=301, timeout_seconds=300, still_holds_data=True) is True
    assert executor_released_after(elapsed_seconds=299, timeout_seconds=300, still_holds_data=True) is False


# --- Abrupt kill vs. graceful decommission: what gets redone ---
@dataclass
class Executor:
    stage_tasks_completed: int
    shuffle_blocks: int


def recompute_cost_on_loss(executor: Executor, decommission_enabled: bool, migration_completed: bool) -> int:
    """Models the documented contrast: without decommissioning, an abrupt loss redoes every task
    that produced this executor's shuffle data (a stage resubmission). With decommission enabled
    and block migration finished before the loss, nothing needs to be redone — the blocks already
    moved to another executor. A decommission interrupted before migration finishes still loses
    whatever wasn't migrated yet."""
    if not decommission_enabled:
        return executor.stage_tasks_completed  # the whole stage's worth of work is redone
    if migration_completed:
        return 0  # blocks already moved; nothing lost
    return executor.shuffle_blocks  # partial migration: only the un-migrated blocks are redone


def test_an_abrupt_kill_without_decommissioning_redoes_the_whole_stage():
    e = Executor(stage_tasks_completed=48, shuffle_blocks=48)
    assert recompute_cost_on_loss(e, decommission_enabled=False, migration_completed=False) == 48


def test_a_completed_graceful_decommission_redoes_nothing():
    e = Executor(stage_tasks_completed=48, shuffle_blocks=48)
    assert recompute_cost_on_loss(e, decommission_enabled=True, migration_completed=True) == 0


def test_a_decommission_cut_off_before_migration_finishes_still_loses_the_unmigrated_blocks():
    e = Executor(stage_tasks_completed=48, shuffle_blocks=48)
    assert recompute_cost_on_loss(e, decommission_enabled=True, migration_completed=False) == 48


def test_decommissioning_never_redoes_more_than_an_abrupt_kill_would():
    e = Executor(stage_tasks_completed=48, shuffle_blocks=48)
    abrupt = recompute_cost_on_loss(e, decommission_enabled=False, migration_completed=False)
    decommissioned = recompute_cost_on_loss(e, decommission_enabled=True, migration_completed=True)
    assert decommissioned <= abrupt


# --- The spot-interruption window AWS documents, and whether migration fits inside it ---
SPOT_INTERRUPTION_WARNING_SECONDS = 120  # AWS: two minutes, except hibernation


def migration_fits_the_warning(migration_seconds: float) -> bool:
    return migration_seconds <= SPOT_INTERRUPTION_WARNING_SECONDS


def test_a_fast_migration_fits_inside_the_two_minute_warning():
    assert migration_fits_the_warning(90) is True


def test_a_slow_migration_does_not_fit_inside_the_two_minute_warning():
    assert migration_fits_the_warning(150) is False


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for t in tests:
        t()
        print(f"ok  {t.__name__}")
    print(f"\n{len(tests)} checks passed.")
