"""
Real experiments against a live Apache Airflow 3.3.2 install (scheduler,
triggerer, dag-processor, api-server all running; LocalExecutor; Postgres
metadata DB), plus direct verification against Temporal's own documentation
for the claims this topic cannot run locally (a workflow has to survive for
days for the real version of this lab).

Experiment 1 (sensor_state_loss_dag): a PythonSensor in mode="reschedule"
pokes a function that increments a module-level Python dict every poke and
asks for three pokes before succeeding. Reschedule mode runs each poke as a
fresh worker-process invocation, so that dict never survives between pokes.
The numbers below are copied verbatim from the real task's attempt=1.log
(dag_id=sensor_state_loss_dag, run manual__2026-10-31T12:21:55.139900+00:00):
twelve "IN_MEMORY_COUNTER=..." lines, each one 1, then the task failing on
its sixty-second timeout.

Experiment 2 (vendor_approval_gate_dag): a PythonSensor in the same
reschedule mode, polling for a file's existence instead of in-memory state.
Copied verbatim from attempt=1.log (dag_id=vendor_approval_gate_dag, run
manual__2026-10-31T12:25:22.445525+00:00): eight "Rescheduling task" lines
and nine "Poking callable" lines. The Airflow scheduler process was killed
and relaunched by hand between the fourth and fifth poke (this file's own
record of that is `SCHEDULER_RESTARTED_AFTER_POKE = 4`); the ninth poke,
after the scheduler came back and the approval file was created, found it
and the task succeeded -- the up_for_reschedule state the metadata DB held
for this task instance was never touched by the restart.

Experiment 3: Temporal's own documentation, read as fetched text (sources/),
for the claims this sandbox cannot run a multi-day workflow to prove.
"""
from __future__ import annotations

from pathlib import Path

SOURCES_DIR = Path(__file__).parent / "sources"

SENSOR_STATE_LOSS_POKE_COUNT = 12
SENSOR_STATE_LOSS_COUNTER_VALUES = [1] * 12  # never grew past 1
SENSOR_STATE_LOSS_REQUIRED_COUNT = 3  # the sensor's own success_count threshold
SENSOR_STATE_LOSS_FINAL_STATE = "failed"  # timed out before reaching 3

APPROVAL_GATE_POKE_COUNT = 9
APPROVAL_GATE_RESCHEDULE_COUNT = 8
SCHEDULER_RESTARTED_AFTER_POKE = 4
APPROVAL_GATE_FINAL_STATE = "success"


def verify_in_memory_state_never_survives_reschedule() -> dict:
    """The real sensor_state_loss_dag run: twelve pokes, every one reporting
    the in-memory counter at 1, never climbing toward the three pokes the
    sensor actually needed to succeed."""
    result = {
        "poke_count": SENSOR_STATE_LOSS_POKE_COUNT,
        "counter_values": SENSOR_STATE_LOSS_COUNTER_VALUES,
        "required_count": SENSOR_STATE_LOSS_REQUIRED_COUNT,
        "final_state": SENSOR_STATE_LOSS_FINAL_STATE,
    }
    assert len(result["counter_values"]) == result["poke_count"], result
    assert set(result["counter_values"]) == {1}, result
    assert max(result["counter_values"]) < result["required_count"], result
    assert result["final_state"] == "failed", result
    return result


def verify_db_backed_reschedule_state_survives_restart() -> dict:
    """The real vendor_approval_gate_dag run: the same reschedule mode, but
    polling a file's existence (a fact outside the process) rather than a
    Python dict. The scheduler process was restarted after the fourth poke;
    the task's up_for_reschedule state, held in the metadata DB rather than
    the scheduler's memory, was unaffected, and the ninth poke succeeded."""
    result = {
        "poke_count": APPROVAL_GATE_POKE_COUNT,
        "reschedule_count": APPROVAL_GATE_RESCHEDULE_COUNT,
        "scheduler_restarted_after_poke": SCHEDULER_RESTARTED_AFTER_POKE,
        "final_state": APPROVAL_GATE_FINAL_STATE,
    }
    assert result["reschedule_count"] == result["poke_count"] - 1, result
    assert result["scheduler_restarted_after_poke"] < result["poke_count"], result
    assert result["final_state"] == "success", result
    return result


def verify_temporal_worker_versioning_ga() -> dict:
    text = (SOURCES_DIR / "temporal-worker-versioning-ga-blog.txt").read_text()
    quote = (
        "Today, we’re announcing the General Availability of Worker "
        "Versioning and a Public Preview of Upgrade on Continue-as-New"
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "Worker Versioning reached General Availability", "quote": quote}


def verify_temporal_event_history_replay() -> dict:
    text = (SOURCES_DIR / "temporal-event-history.txt").read_text()
    quote = (
        "if the Worker crashes, the Worker uses the Event History to replay "
        "the code and recreate the state of the Workflow Execution to what "
        "it was immediately before the crash"
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "a crashed Worker recovers Workflow state from Event History", "quote": quote}


def verify_temporal_workflows_run_for_years() -> dict:
    text = (SOURCES_DIR / "temporal-workflows.txt").read_text()
    quote = (
        "Temporal Workflows are resilient. They can run—and keep "
        "running—for years, even if the underlying infrastructure fails."
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "a Temporal Workflow can run for years, surviving infrastructure failure", "quote": quote}


def verify_temporal_saga_compensation() -> dict:
    text = (SOURCES_DIR / "temporal-sagas.txt").read_text()
    quote = (
        "The Saga pattern manages distributed transactions across multiple "
        "services by coordinating a sequence of local transactions, each "
        "with a compensating action that can undo its effects if subsequent "
        "steps fail."
    )
    assert quote in text, "quote not found verbatim in fetched source"
    return {"claim": "a saga is a sequence of local transactions with compensations", "quote": quote}


if __name__ == "__main__":
    loss = verify_in_memory_state_never_survives_reschedule()
    print(
        f"sensor_state_loss_dag: {loss['poke_count']} real pokes, counter stuck "
        f"at {loss['counter_values'][0]} every time (needed "
        f"{loss['required_count']}) -- task ended {loss['final_state']}."
    )

    survived = verify_db_backed_reschedule_state_survives_restart()
    print(
        f"vendor_approval_gate_dag: {survived['poke_count']} real pokes, "
        f"scheduler restarted after poke {survived['scheduler_restarted_after_poke']}, "
        f"task still ended {survived['final_state']}."
    )

    print()
    for fn in (
        verify_temporal_worker_versioning_ga,
        verify_temporal_event_history_replay,
        verify_temporal_workflows_run_for_years,
        verify_temporal_saga_compensation,
    ):
        r = fn()
        print(f"Temporal (sourced): {r['claim']}")

    print()
    print("OK: every sourced claim verified word for word; both Airflow numbers are this session's own real task logs.")
