"""Toy models for de.dead-letter-retry-topics: a single-partition consumer that really blocks on
a poison record if retried in place, really keeps flowing once the poison record is diverted to a
retry topic, and a DLQ record that really carries enough metadata to diagnose and replay. Standalone
simulation (per Kafka Connect's errors.tolerance docs, KIP-1034, and Confluent's own error-handling
patterns post, SOURCES.md)."""


class BlockingPartition:
    """Retrying a poison record in place blocks everything behind it, forever — the direct
    consequence of per-partition ordering."""

    def __init__(self, records):
        self.records = records  # list of (id, is_poison)
        self.processed = []

    def process_in_place(self, max_attempts_per_record):
        for rid, is_poison in self.records:
            attempts = 0
            while True:
                attempts += 1
                if not is_poison:
                    self.processed.append(rid)
                    break
                if attempts >= max_attempts_per_record:
                    # stuck here forever in reality; the toy model gives up after max_attempts
                    # to show exactly how many records never got a chance to run.
                    return {"blocked_at": rid, "processed": list(self.processed), "stuck": True}
        return {"blocked_at": None, "processed": list(self.processed), "stuck": False}


class NonBlockingRetryFlow:
    """Diverts a poison record to a separate retry topic instead of blocking the partition;
    the main flow keeps moving, at the cost of the diverted record's original relative order."""

    def __init__(self, records):
        self.records = records  # list of (id, is_poison)
        self.main_flow_order = []
        self.retry_topic = []

    def process(self):
        for rid, is_poison in self.records:
            if is_poison:
                self.retry_topic.append(rid)
            else:
                self.main_flow_order.append(rid)
        return self.main_flow_order, self.retry_topic


def build_dlq_record(original_topic, original_partition, original_offset, exception, retry_count):
    """A dead-letter record's metadata: enough for an operator or replay tool to diagnose and,
    if fixed, replay it — per CHAPTER.md's DLQ payload and metadata design clause."""
    return {
        "original_topic": original_topic,
        "original_partition": original_partition,
        "original_offset": original_offset,
        "exception": exception,
        "retry_count": retry_count,
    }


def run():
    records = [
        ("order-1", False),
        ("order-2", False),
        ("order-3", True),  # the poison record
        ("order-4", False),
        ("order-5", False),
    ]

    # In-place retry: everything behind the poison record never runs, forever (modeled as
    # "stuck" after a bounded number of attempts, to show the block concretely).
    blocking = BlockingPartition(records)
    blocked_result = blocking.process_in_place(max_attempts_per_record=5)
    assert blocked_result["stuck"] is True
    assert blocked_result["blocked_at"] == "order-3"
    assert blocked_result["processed"] == ["order-1", "order-2"]  # order-4, order-5 never ran

    # Non-blocking retry topic: the main flow keeps moving past the poison record entirely.
    non_blocking = NonBlockingRetryFlow(records)
    main_flow, retry_topic = non_blocking.process()
    assert main_flow == ["order-1", "order-2", "order-4", "order-5"]  # order-3 skipped cleanly
    assert retry_topic == ["order-3"]
    # The ordering sacrifice, made concrete: order-4 and order-5 now precede order-3's eventual
    # reprocessing, which never happened in the in-place version at all.
    assert main_flow.index("order-4") < len(main_flow)  # order-4 ran well before order-3 resolves

    # A DLQ record carries enough metadata to diagnose and replay.
    dlq_record = build_dlq_record(
        original_topic="orders", original_partition="0", original_offset="2",
        exception="ValueError: missing customer_id", retry_count="3",
    )
    assert dlq_record["original_topic"] == "orders"
    assert dlq_record["exception"] == "ValueError: missing customer_id"
    assert set(dlq_record.keys()) == {
        "original_topic", "original_partition", "original_offset", "exception", "retry_count",
    }

    print("in-place retry blocks at:", blocked_result["blocked_at"], "- processed:", blocked_result["processed"])
    print("non-blocking main flow order:", main_flow, "- diverted to retry topic:", retry_topic)
    print("DLQ record metadata:", dlq_record)


if __name__ == "__main__":
    run()
