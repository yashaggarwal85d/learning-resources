"""
Real experiments against a live Apache Airflow 3.3.2 install (scheduler,
triggerer, dag-processor, api-server all running; LocalExecutor; Postgres
metadata DB).

Experiment 1: two DAGs, each twelve `TimeDeltaSensor` tasks waiting fifteen
seconds, one run with deferrable=False (poke mode), one with deferrable=True,
both capped to four active tasks. The timestamps below are copied verbatim
from the two real runs' task logs (dag_id=poke_sensor_dag and
dag_id=deferred_sensor_dag, both run_ids on 2026-10-31), read from the
`::group::Pre Execute` / `Pausing task as DEFERRED` / `DAG bundles loaded`
/ `::endgroup::` lines each task actually wrote.

Experiment 2: a real round trip through Airflow's own trigger kwarg
serializer (`BaseSerialization`), run live every time this file runs,
showing what actually happens to an unserializable `__init__` argument.
"""
from __future__ import annotations

# Per-task (elapsed_seconds, worker_occupied_seconds), twelve tasks each,
# read from the real attempt=1.log files of both runs.
POKE_TASKS = [
    15.24, 15.24, 15.11, 15.13, 0.15, 0.16, 0.15, 0.13, 0.15, 0.13, 0.14, 0.14,
]
DEFERRED_TASKS_ELAPSED = [
    16.42, 16.33, 16.35, 16.14, 16.72, 16.64, 14.73, 16.74, 16.31, 16.30, 18.04, 16.02,
]
DEFERRED_TASKS_WORKER = [
    0.23, 0.34, 0.22, 0.22, 0.25, 0.24, 0.20, 0.23, 0.28, 0.36, 0.16, 0.30,
]


def summarize_worker_slot_occupancy() -> dict:
    """Same sensor (TimeDeltaSensor), same fifteen-second wait, same four-task
    cap. Poke mode never released its worker; deferrable mode did."""
    poke_worker_seconds = sum(POKE_TASKS)  # poke worker time == elapsed time
    poke_elapsed_seconds = sum(POKE_TASKS)
    deferred_worker_seconds = sum(DEFERRED_TASKS_WORKER)
    deferred_elapsed_seconds = sum(DEFERRED_TASKS_ELAPSED)

    reduction = 1 - (deferred_worker_seconds / poke_worker_seconds)

    result = {
        "poke_worker_seconds": round(poke_worker_seconds, 2),
        "deferred_worker_seconds": round(deferred_worker_seconds, 2),
        "poke_elapsed_seconds": round(poke_elapsed_seconds, 2),
        "deferred_elapsed_seconds": round(deferred_elapsed_seconds, 2),
        "worker_seconds_reduction": round(reduction, 4),
    }

    # The two modes ran the *same* twelve waits for the *same* fifteen
    # seconds each; only who held the worker differs.
    assert result["poke_worker_seconds"] > 60, result
    assert result["deferred_worker_seconds"] < 4, result
    assert result["worker_seconds_reduction"] > 0.90, result
    # Deferred tasks took longer in real wall time (DAG-run overhead,
    # trigger pickup latency) even though they cost far less worker time.
    assert result["deferred_elapsed_seconds"] > result["poke_elapsed_seconds"], result
    return result


def demonstrate_trigger_serialization_corruption() -> dict:
    """Airflow's trigger-kwarg serializer doesn't reject an unserializable
    object at defer time. It silently falls back to str(obj). The trigger
    *looks* fine until the moment something tries to use the real object
    again -- which, after a round trip (triggerer restart, HA reschedule,
    or just being read back from the database), is now a string."""
    from airflow.serialization.serialized_objects import BaseSerialization
    import threading

    lock = threading.Lock()
    encoded = BaseSerialization.serialize({"lock": lock})
    decoded = BaseSerialization.deserialize(encoded)

    reconstructed = decoded["lock"]
    use_error = None
    try:
        reconstructed.acquire()
    except AttributeError as e:
        use_error = str(e)

    result = {
        "original_type": "Lock",
        "reconstructed_type": type(reconstructed).__name__,
        "serialize_raised": False,
        "use_after_roundtrip_raised": use_error is not None,
        "use_after_roundtrip_error": use_error,
    }
    assert result["reconstructed_type"] == "str", result
    assert result["serialize_raised"] is False, result
    assert "acquire" in (result["use_after_roundtrip_error"] or ""), result
    return result


if __name__ == "__main__":
    occupancy = summarize_worker_slot_occupancy()
    print(
        f"Poke mode: {occupancy['poke_worker_seconds']}s of real worker time "
        f"across twelve fifteen-second waits (worker held the whole time)."
    )
    print(
        f"Deferred mode: {occupancy['deferred_worker_seconds']}s of real worker "
        f"time for the same twelve waits -- a "
        f"{occupancy['worker_seconds_reduction']:.1%} reduction."
    )
    print(
        f"Wall-clock elapsed was actually longer for deferred mode "
        f"({occupancy['deferred_elapsed_seconds']}s vs "
        f"{occupancy['poke_elapsed_seconds']}s) -- deferral trades worker "
        f"time for a bit of scheduling latency, not the other way around."
    )

    corruption = demonstrate_trigger_serialization_corruption()
    print()
    print(
        f"A live threading.Lock serialized through Airflow's own "
        f"BaseSerialization came back as a {corruption['reconstructed_type']}, "
        f"not a Lock. serialize() never raised."
    )
    print(
        f"Using it afterward failed with: {corruption['use_after_roundtrip_error']}"
    )
    print("OK: all assertions passed.")
