"""Synthetic examples for de.opentelemetry-across-batch-streaming. No Kafka broker or OTel
Collector is required on this build machine (CHAPTER.md's own disclosure): the record carrier is
a local in-memory queue with a header dict, and the W3C traceparent format and OpenTelemetry's
link-limit/semantic-convention behaviour are reproduced structurally in pure Python, matching the
documented spec exactly (SOURCES.md), not invented."""

import random
import re

TRACEPARENT_RE = re.compile(r"^([0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$")


def traceparent_injected_and_extracted():
    """Build a traceparent in the W3C format, inject it into a Kafka record's header dict at
    produce time, extract and parse it at consume time, across a hop that carries no HTTP
    request of its own."""
    version, trace_id, parent_id, flags = "00", "0af7651916cd43dd8448eb211c80319c", "b7ad6b7169203331", "01"
    traceparent = f"{version}-{trace_id}-{parent_id}-{flags}"
    assert TRACEPARENT_RE.match(traceparent), "traceparent must match the W3C fixed format"

    kafka_record = {"key": "order-4821", "value": b"...", "headers": {}}
    kafka_record["headers"]["traceparent"] = traceparent  # producer injects

    consumed_headers = dict(kafka_record["headers"])  # the hop: no HTTP request carries this
    m = TRACEPARENT_RE.match(consumed_headers["traceparent"])
    extracted_trace_id = m.group(2)
    print(f"injected trace_id: {trace_id}")
    print(f"extracted trace_id after the Kafka hop: {extracted_trace_id}")
    assert extracted_trace_id == trace_id, "the trace_id must survive the hop unchanged"
    return traceparent, extracted_trace_id


def batch_receive_needs_links_not_parent():
    """A single-parent span field cannot represent more than one producer context; a links list
    can hold all of them."""
    producer_contexts = [f"trace-{i:04d}" for i in range(5)]

    class Span:
        def __init__(self):
            self.parent = None
            self.links = []

        def set_parent(self, ctx):
            self.parent = ctx  # overwrites: only one parent field exists

        def add_link(self, ctx):
            self.links.append(ctx)

    span_as_parent_chain = Span()
    for ctx in producer_contexts:
        span_as_parent_chain.set_parent(ctx)
    print(f"forcing {len(producer_contexts)} producer contexts through a single parent field: only '{span_as_parent_chain.parent}' survives")
    assert span_as_parent_chain.parent == producer_contexts[-1], "a parent field can only ever hold the last one assigned"

    span_as_links = Span()
    for ctx in producer_contexts:
        span_as_links.add_link(ctx)
    print(f"the same {len(producer_contexts)} producer contexts as links: all {len(span_as_links.links)} survive")
    assert len(span_as_links.links) == len(producer_contexts), "a links list holds every producer context"
    return span_as_parent_chain.parent, span_as_links.links


def link_count_limit_drops_excess(n_messages, link_count_limit=128):
    """A batch receive accounting for n_messages against the documented default LinkCountLimit:
    exactly link_count_limit links are kept, and max(0, n - limit) are dropped."""
    kept = min(n_messages, link_count_limit)
    dropped = max(0, n_messages - link_count_limit)
    print(f"batch of {n_messages:,} messages, LinkCountLimit {link_count_limit}: kept {kept}, dropped {dropped:,}")
    assert kept == link_count_limit if n_messages >= link_count_limit else kept == n_messages
    assert kept + dropped == n_messages
    return kept, dropped


def cdc_to_warehouse_trace_with_one_break():
    """A four-hop trace (CDC write, Kafka produce, Spark aggregate, warehouse write): the same
    trace_id carries automatically through three hops in this simulation, but the CDC write
    itself (the database write Debezium's own docs name as the demarcation point) only carries
    the trace_id if the application explicitly passes it; a run that doesn't pass it loses the
    trace_id at that one hop."""
    trace_id = "9f1c2b3a4d5e6f708192a3b4c5d6e7f8"

    def cdc_write(app_passes_trace_metadata):
        return trace_id if app_passes_trace_metadata else None  # the one real break

    def kafka_produce(incoming_trace_id):
        return incoming_trace_id  # automatic: header copy

    def spark_aggregate(incoming_trace_id):
        return incoming_trace_id  # automatic: link to creation context

    def warehouse_write(incoming_trace_id):
        return incoming_trace_id  # automatic: link preserved

    # Run A: the application explicitly passes trace metadata into the CDC write.
    t1 = cdc_write(app_passes_trace_metadata=True)
    t2 = kafka_produce(t1)
    t3 = spark_aggregate(t2)
    t4 = warehouse_write(t3)
    print(f"run A (trace metadata passed to the CDC write): trace_id survives all 4 hops = {t4 == trace_id}")
    assert t4 == trace_id

    # Run B: the application does not pass trace metadata into the CDC write.
    t1b = cdc_write(app_passes_trace_metadata=False)
    t2b = kafka_produce(t1b)
    t3b = spark_aggregate(t2b)
    t4b = warehouse_write(t3b)
    print(f"run B (trace metadata not passed to the CDC write): trace_id survives = {t4b == trace_id} (lost at the first hop)")
    assert t4b is None, "without explicit passing, the trace_id is lost exactly at the CDC write, not later"
    return t4, t4b


def otel_vs_openlineage_overlap():
    """Two synthetic event records for the same job run: an OTel span and an OpenLineage
    RunEvent. Their field sets should intersect only on a run identifier."""
    run_id = "run-4821"
    otel_span = {
        "run_id": run_id,
        "trace_id": "9f1c2b3a4d5e6f708192a3b4c5d6e7f8",
        "span_id": "b7ad6b7169203331",
        "duration_ms": 842,
        "status": "OK",
    }
    openlineage_run_event = {
        "run_id": run_id,
        "eventType": "COMPLETE",
        "job": {"namespace": "shop", "name": "orders-rollup"},
        "inputs": ["kafka://order-events"],
        "outputs": ["warehouse://analytics.daily_revenue"],
    }

    shared_keys = set(otel_span) & set(openlineage_run_event)
    print(f"OTel span keys: {sorted(otel_span)}")
    print(f"OpenLineage RunEvent keys: {sorted(openlineage_run_event)}")
    print(f"shared keys: {shared_keys}")
    assert shared_keys == {"run_id"}, "the two event shapes should share only a run identifier"
    return shared_keys


def main():
    traceparent_injected_and_extracted()
    batch_receive_needs_links_not_parent()
    link_count_limit_drops_excess(1_000_000)
    link_count_limit_drops_excess(50)
    cdc_to_warehouse_trace_with_one_break()
    otel_vs_openlineage_overlap()
    print("de.opentelemetry-across-batch-streaming examples: all checks pass")


if __name__ == "__main__":
    main()
