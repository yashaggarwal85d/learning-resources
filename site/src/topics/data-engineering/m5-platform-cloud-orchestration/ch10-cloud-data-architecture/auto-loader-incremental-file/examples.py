"""A local analogue of two real, documented Auto Loader mechanisms (SOURCES.md): the
checkpointed seen-file set that gives exactly-once file ingestion across restarts and replays,
and the schema-evolution modes' different behaviour on an unexpected new column, including the
rescued-data column. No real Databricks workspace or RocksDB instance runs in this sandbox, so
this reproduces the documented *rules themselves* in plain Python against a synthetic file feed.
"""
import json


class Checkpoint:
    """A durable set of seen file keys, standing in for Auto Loader's RocksDB-backed checkpoint."""

    def __init__(self):
        self.seen = set()

    def is_new(self, file_key):
        return file_key not in self.seen

    def mark_seen(self, file_key):
        self.seen.add(file_key)


def ingest_once(checkpoint, files):
    """Processes only files the checkpoint hasn't already seen — the exactly-once guarantee."""
    ingested = []
    for f in files:
        if checkpoint.is_new(f):
            ingested.append(f)
            checkpoint.mark_seen(f)
    return ingested


def restart_and_replay_do_not_duplicate():
    """A stream restart followed by a replayed duplicate file ingests each real file exactly
    once, even though the file list is processed twice."""
    checkpoint = Checkpoint()
    batch_1 = ["orders_2026-10-30.json", "orders_2026-10-31.json"]
    first_run = ingest_once(checkpoint, batch_1)

    # the stream restarts; the same batch, plus one genuinely new file and one replayed duplicate, arrives
    batch_2 = ["orders_2026-10-31.json", "orders_2026-11-01.json"]
    second_run = ingest_once(checkpoint, batch_2)

    assert first_run == batch_1
    assert second_run == ["orders_2026-11-01.json"]
    assert checkpoint.seen == {"orders_2026-10-30.json", "orders_2026-10-31.json", "orders_2026-11-01.json"}
    return {"first_run_ingested": first_run, "second_run_ingested": second_run, "total_seen": sorted(checkpoint.seen)}


EXPECTED_SCHEMA = {"order_id", "customer_id", "amount"}


def apply_schema_evolution(record, mode):
    """Models the documented behaviour of each schema-evolution mode on an unexpected column,
    per SOURCES.md's quoted mode table."""
    extra = set(record) - EXPECTED_SCHEMA
    if not extra:
        return {"accepted": record, "rescued": None, "stream_failed": False}

    if mode == "addNewColumns":
        # fails once, then the new column is added and the stream resumes with the wider schema
        return {"accepted": record, "rescued": None, "stream_failed": True}
    if mode == "rescue":
        accepted = {k: v for k, v in record.items() if k in EXPECTED_SCHEMA}
        rescued = {k: v for k, v in record.items() if k not in EXPECTED_SCHEMA}
        return {"accepted": accepted, "rescued": json.dumps(rescued), "stream_failed": False}
    if mode == "failOnNewColumns":
        return {"accepted": None, "rescued": None, "stream_failed": True}
    raise ValueError(f"unmodeled schema evolution mode: {mode}")


def a_new_column_arrives_overnight():
    """The hook: a partner's feed adds a column overnight. 'rescue' mode keeps the stream
    running and recovers the new field in the rescued-data column instead of losing it."""
    record = {"order_id": "o-1", "customer_id": "c-1", "amount": 42.5, "loyalty_tier": "gold"}

    rescue_result = apply_schema_evolution(record, "rescue")
    assert rescue_result["stream_failed"] is False
    assert rescue_result["accepted"] == {"order_id": "o-1", "customer_id": "c-1", "amount": 42.5}
    assert json.loads(rescue_result["rescued"]) == {"loyalty_tier": "gold"}

    fail_on_new_result = apply_schema_evolution(record, "failOnNewColumns")
    assert fail_on_new_result["stream_failed"] is True
    assert fail_on_new_result["accepted"] is None

    add_new_columns_result = apply_schema_evolution(record, "addNewColumns")
    assert add_new_columns_result["stream_failed"] is True
    assert add_new_columns_result["accepted"] == record

    return {
        "rescue_mode": rescue_result,
        "failOnNewColumns_mode": fail_on_new_result,
        "addNewColumns_mode": add_new_columns_result,
    }


def main():
    print(json.dumps(restart_and_replay_do_not_duplicate(), indent=2))
    print(json.dumps(a_new_column_arrives_overnight(), indent=2))


if __name__ == "__main__":
    main()
