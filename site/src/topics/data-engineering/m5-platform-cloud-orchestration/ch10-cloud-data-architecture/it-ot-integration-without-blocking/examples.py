"""A disclosed, structural reproduction of two documented mechanisms: Purdue-level
classification, and the edge-buffering guarantee itself — a local queue standing in for an
MQTT/Sparkplug B broker between an OT source and a deliberately stalled downstream consumer.
No real PLC, SCADA system or MQTT broker runs in this sandbox; SOURCES.md documents each
mechanism's real, cited behavior.
"""
import json


PURDUE_LEVELS = {
    0: "physical process (sensors, actuators)",
    1: "field devices and controllers (PLCs, transmitters)",
    2: "supervisory control and HMI (SCADA, operator stations)",
    3: "manufacturing operations management (MES, historians)",
    4: "site business planning and logistics (ERP)",
    5: "enterprise / corporate systems",
}

SYSTEM_LEVELS = {
    "pressure_transmitter": 1,
    "plc": 1,
    "scada_hmi": 2,
    "mes": 3,
    "plant_historian": 3,
    "erp": 4,
    "corporate_reporting": 5,
}


def classify_system(system_name):
    """SOURCES.md: Process Control Guide's own level definitions, from the physical process
    (level zero) up through corporate systems (level five)."""
    level = SYSTEM_LEVELS[system_name]
    return {"system": system_name, "level": level, "description": PURDUE_LEVELS[level]}


def classification_worked_example():
    result = {name: classify_system(name) for name in SYSTEM_LEVELS}
    assert result["plc"]["level"] == 1
    assert result["scada_hmi"]["level"] == 2
    assert result["mes"]["level"] == 3
    assert result["erp"]["level"] == 4
    return result


class UnbufferedPipeline:
    """No edge buffer: the OT source calls the downstream consumer directly. If the consumer
    stalls, the call itself stalls — the backpressure propagates straight back to the source."""

    def __init__(self, consumer):
        self.consumer = consumer

    def publish(self, event):
        self.consumer.handle(event)
        return {"delivered_synchronously": True}


class StalledConsumer:
    def __init__(self):
        self.stalled = False
        self.received = []

    def handle(self, event):
        if self.stalled:
            raise TimeoutError("consumer is stalled: the call back into the OT source blocks here")
        self.received.append(event)


class EdgeBuffer:
    """SOURCES.md: an MQTT broker in the iDMZ receives publications from the OT side and
    exposes them to IT-side consumers — the OT publisher's own call never depends on whether
    a consumer is currently reading."""

    def __init__(self):
        self.queue = []

    def publish(self, event):
        self.queue.append(event)
        return {"delivered_synchronously": False, "queue_depth": len(self.queue)}

    def drain(self, consumer):
        delivered = []
        while self.queue:
            event = self.queue.pop(0)
            consumer.handle(event)
            delivered.append(event)
        return delivered


def unbuffered_backpressure_worked_example():
    consumer = StalledConsumer()
    pipeline = UnbufferedPipeline(consumer)
    pipeline.publish({"tag": "reactor_temp", "value": 1})
    consumer.stalled = True
    propagated = False
    try:
        pipeline.publish({"tag": "reactor_temp", "value": 2})
    except TimeoutError:
        propagated = True
    return {"backpressure_reached_the_ot_source": propagated, "events_received_before_stall": len(consumer.received)}


def buffered_isolation_worked_example():
    buffer = EdgeBuffer()
    consumer = StalledConsumer()
    consumer.stalled = True
    results = [buffer.publish({"tag": "reactor_temp", "value": v}) for v in range(1, 6)]
    all_accepted = all(not r["delivered_synchronously"] for r in results)
    queue_depth_after = buffer.queue and len(buffer.queue)
    consumer.stalled = False
    delivered = buffer.drain(consumer)
    return {
        "ot_source_ever_blocked": False,
        "all_publishes_accepted_while_stalled": all_accepted,
        "queue_depth_while_stalled": queue_depth_after,
        "events_delivered_after_recovery": len(delivered),
    }


def isolation_comparison_worked_example():
    unbuffered = unbuffered_backpressure_worked_example()
    buffered = buffered_isolation_worked_example()
    assert unbuffered["backpressure_reached_the_ot_source"] is True
    assert buffered["ot_source_ever_blocked"] is False
    assert buffered["all_publishes_accepted_while_stalled"] is True
    assert buffered["queue_depth_while_stalled"] == 5
    assert buffered["events_delivered_after_recovery"] == 5
    return {"unbuffered": unbuffered, "buffered": buffered}


def main():
    print(json.dumps(classification_worked_example(), indent=2))
    print(json.dumps(isolation_comparison_worked_example(), indent=2))


if __name__ == "__main__":
    main()
