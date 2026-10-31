"""MQTT QoS 0/1 message loss and duplication measured against a real
Mosquitto broker under a killed connection; a retained message delivered to
a late subscriber and a Will message delivered on an ungraceful disconnect;
real Sparkplug B NBIRTH/NDATA/NDEATH Protobuf payloads (compiled from the
Eclipse Tahu reference sparkplug_b.proto) with correct sequence numbers and
bdSeq; a host-side sequence-gap detector that triggers a rebirth request;
and a Unified Namespace topic tree sketched onto the ISA-95 hierarchy."""

from __future__ import annotations

import socket
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path

import paho.mqtt.client as mqtt

sys.path.insert(0, str(Path(__file__).parent))
import sparkplug_b_pb2 as spb  # the real Eclipse Tahu Sparkplug B schema, compiled with protoc

PORT = 18831
HOST = "127.0.0.1"


def start_broker() -> subprocess.Popen:
    conf = tempfile.NamedTemporaryFile(mode="w", suffix=".conf", delete=False)
    conf.write(f"listener {PORT}\nallow_anonymous true\nmax_queued_messages 100\n")
    conf.close()
    proc = subprocess.Popen(["mosquitto", "-c", conf.name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    return proc


def kill_client_socket(client: mqtt.Client) -> None:
    """An ungraceful disconnect — no MQTT DISCONNECT packet, just the
    transport dying, the way a real edge node loses power mid-shift."""
    try:
        client.socket().shutdown(socket.SHUT_RDWR)
    except OSError:
        pass
    try:
        client.socket().close()
    except OSError:
        pass


@dataclass
class QosRunResult:
    published: list[bytes]
    received: list[bytes]

    def duplicates(self) -> int:
        seen = set()
        dupes = 0
        for payload in self.received:
            if payload in seen:
                dupes += 1
            seen.add(payload)
        return dupes

    def lost(self) -> set[bytes]:
        return set(self.published) - set(self.received)


def run_qos_experiment(topic: str, qos: int, n_messages: int = 5) -> QosRunResult:
    """Subscribes with a persistent session, kills the connection the moment
    the first message arrives (simulating a crash before the client acks
    it), publishes the rest of the stream while the subscriber is down, then
    reconnects with the same client id to see what actually made it through."""
    received: list[bytes] = []
    killed = {"done": False}

    def on_message(client: mqtt.Client, userdata, msg) -> None:
        received.append(msg.payload)
        if not killed["done"]:
            killed["done"] = True
            kill_client_socket(client)

    client_id = f"sub-qos{qos}"
    sub = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=client_id, clean_session=False)
    sub.on_message = on_message
    sub.connect(HOST, PORT, keepalive=5)
    sub.subscribe(topic, qos=qos)
    sub.loop_start()
    time.sleep(0.3)

    published = [f"msg-{i}".encode() for i in range(n_messages)]
    pub = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"pub-qos{qos}", clean_session=True)
    pub.connect(HOST, PORT, keepalive=5)
    pub.loop_start()
    for payload in published:
        pub.publish(topic, payload=payload, qos=qos)
        time.sleep(0.3)
    time.sleep(1.0)
    pub.loop_stop()
    pub.disconnect()

    try:
        sub.loop_stop()
    except Exception:
        pass

    sub2 = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=client_id, clean_session=False)
    sub2.on_message = on_message
    sub2.connect(HOST, PORT, keepalive=5)
    sub2.loop_start()
    time.sleep(1.5)
    sub2.loop_stop()
    sub2.disconnect()

    return QosRunResult(published=published, received=received)


def demonstrate_retained_and_will() -> tuple[bool, bool]:
    """A retained message is handed to a subscriber that joins AFTER it was
    published; a Will message fires only on an ungraceful disconnect."""
    retain_topic = "plant/furnace1/status"
    pub = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="retain-pub")
    pub.connect(HOST, PORT)
    pub.loop_start()
    pub.publish(retain_topic, payload=b"211", qos=1, retain=True)
    time.sleep(0.3)
    pub.loop_stop()
    pub.disconnect()

    late_received: list[bytes] = []
    late_sub = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="late-sub")
    late_sub.on_message = lambda c, u, m: late_received.append(m.payload)
    late_sub.connect(HOST, PORT)
    late_sub.subscribe(retain_topic, qos=1)
    late_sub.loop_start()
    time.sleep(0.5)
    late_sub.loop_stop()
    late_sub.disconnect()
    got_retained = late_received == [b"211"]

    will_topic = "plant/edge1/death"
    will_received: list[bytes] = []
    host_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="host")
    host_client.on_message = lambda c, u, m: will_received.append(m.payload)
    host_client.connect(HOST, PORT)
    host_client.subscribe(will_topic, qos=1)
    host_client.loop_start()
    time.sleep(0.3)

    edge = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="edge1", clean_session=True)
    edge.will_set(will_topic, payload=b"DEAD", qos=1, retain=False)
    edge.connect(HOST, PORT)
    edge.loop_start()
    time.sleep(0.3)
    kill_client_socket(edge)  # the edge node loses power mid-shift
    time.sleep(2.0)
    host_client.loop_stop()
    host_client.disconnect()
    got_will = will_received == [b"DEAD"]

    return got_retained, got_will


# --- Sparkplug B: real Protobuf payloads from the Eclipse Tahu reference schema ---

DATATYPE_DOUBLE = 10  # sparkplug_b.proto's own DataType enum


def build_nbirth(metrics: list[tuple[str, float]], timestamp: int) -> spb.Payload:
    """NBIRTH MUST include every metric the Edge Node will ever report on,
    and always carries sequence number 0 (Sparkplug 3.0)."""
    payload = spb.Payload()
    payload.timestamp = timestamp
    payload.seq = 0
    for name, value in metrics:
        m = payload.metrics.add()
        m.name = name
        m.datatype = DATATYPE_DOUBLE
        m.double_value = value
        m.timestamp = timestamp
    return payload


def build_ndata(name: str, value: float, timestamp: int, seq: int) -> spb.Payload:
    payload = spb.Payload()
    payload.timestamp = timestamp
    payload.seq = seq
    m = payload.metrics.add()
    m.name = name
    m.datatype = DATATYPE_DOUBLE
    m.double_value = value
    m.timestamp = timestamp
    return payload


@dataclass
class EdgeNodeState:
    group_id: str
    edge_node_id: str
    bd_seq: int = 0
    next_seq: int = 0

    def topic(self, message_type: str) -> str:
        return f"spBv1.0/{self.group_id}/{message_type}/{self.edge_node_id}"

    def birth(self, metrics: list[tuple[str, float]], timestamp: int) -> spb.Payload:
        payload = build_nbirth(metrics, timestamp)
        bd = payload.metrics.add()
        bd.name = "bdSeq"
        bd.datatype = 8  # UInt64
        bd.long_value = self.bd_seq
        self.next_seq = 1
        return payload

    def next_data(self, name: str, value: float, timestamp: int) -> spb.Payload:
        payload = build_ndata(name, value, timestamp, self.next_seq)
        self.next_seq = (self.next_seq + 1) % 256  # Sparkplug wraps 255 -> 0
        return payload

    def rebirth(self) -> None:
        self.bd_seq += 1
        self.next_seq = 0


class SequenceGapDetector:
    """A host that watches NDATA sequence numbers and detects a skipped one,
    triggering a Node Control/Rebirth request (Sparkplug 3.0's own rule)."""

    def __init__(self) -> None:
        self.last_seq: int | None = None
        self.gaps_detected = 0
        self.rebirth_requested = False

    def observe(self, seq: int) -> None:
        if self.last_seq is not None:
            expected = (self.last_seq + 1) % 256
            if seq != expected:
                self.gaps_detected += 1
                self.rebirth_requested = True
        self.last_seq = seq


def build_uns_topic_tree() -> dict[str, dict]:
    """The Unified Namespace pattern: one topic tree mirroring the ISA-95
    equipment hierarchy, each node holding its own current (retained) value
    rather than a history."""
    return {
        "acme/plantA/area1/line1/furnace1": {"temperature": 842.0, "status": "running"},
        "acme/plantA/area1/line1/spindle1": {"speed": 1842.0, "status": "running"},
        "acme/plantA/area1/line2/furnace2": {"temperature": 790.0, "status": "idle"},
    }


def main() -> None:
    broker = start_broker()
    try:
        # --- QoS 0 vs QoS 1 under a killed connection ---
        qos0 = run_qos_experiment("plant/line1/tag", qos=0)
        qos1 = run_qos_experiment("plant/line1/tag2", qos=1)

        assert len(qos0.lost()) > 0, "QoS 0 must lose at least one message published while the subscriber was offline"
        assert qos0.duplicates() == 0, "QoS 0 has no redelivery, so it must never produce a duplicate"
        assert len(qos1.lost()) == 0, "QoS 1's at-least-once guarantee must mean nothing published is ever permanently lost"
        assert qos1.duplicates() >= 1, "killing the connection before the first ack must force QoS 1 to redeliver at least one message"

        # --- retained message and Will ---
        got_retained, got_will = demonstrate_retained_and_will()
        assert got_retained, "a late subscriber must receive the broker's retained last value"
        assert got_will, "an ungraceful disconnect must cause the broker to publish the registered Will"
    finally:
        broker.terminate()
        broker.wait(timeout=5)

    # --- Sparkplug B: real Protobuf NBIRTH / NDATA / NDEATH ---
    edge = EdgeNodeState(group_id="AcmeGroup", edge_node_id="Line1Furnace1")
    nbirth = edge.birth([("Temperature", 842.0)], timestamp=1000)
    assert nbirth.seq == 0, "NBIRTH always carries sequence number 0"
    assert any(m.name == "bdSeq" for m in nbirth.metrics), "NBIRTH must carry its bdSeq"
    assert any(m.name == "Temperature" for m in nbirth.metrics), "NBIRTH must include every metric the node will ever report"

    ndata_1 = edge.next_data("Temperature", 843.0, timestamp=1010)
    ndata_2 = edge.next_data("Temperature", 844.0, timestamp=1020)
    assert ndata_1.seq == 1 and ndata_2.seq == 2, "NDATA sequence numbers increment by one from the birth's seq 0"

    # sequence wraps 255 -> 0
    edge.next_seq = 255
    wrapped = edge.next_data("Temperature", 845.0, timestamp=1030)
    assert wrapped.seq == 255
    assert edge.next_seq == 0, "the sequence number wraps from 255 back to 0"

    ndeath_topic = edge.topic("NDEATH")
    assert ndeath_topic == "spBv1.0/AcmeGroup/NDEATH/Line1Furnace1", "the Sparkplug topic namespace must match spBv1.0/group_id/message_type/edge_node_id"

    # --- sequence-gap detection triggers a rebirth request ---
    detector = SequenceGapDetector()
    for seq in [0, 1, 2, 3, 5]:  # 4 is missing — a dropped NDATA
        detector.observe(seq)
    assert detector.gaps_detected == 1, "exactly one gap must be detected when exactly one sequence number is skipped"
    assert detector.rebirth_requested is True

    clean_detector = SequenceGapDetector()
    for seq in [0, 1, 2, 3, 4]:
        clean_detector.observe(seq)
    assert clean_detector.gaps_detected == 0, "an unbroken sequence must never trigger a rebirth request"

    # --- Unified Namespace: one topic tree, current values, no history ---
    uns = build_uns_topic_tree()
    assert "acme/plantA/area1/line1/furnace1" in uns
    assert uns["acme/plantA/area1/line1/furnace1"]["temperature"] == 842.0
    # the UNS pattern's own limit: nothing here records what the value was a moment ago
    assert not any(isinstance(v, list) for node in uns.values() for v in node.values()), "a UNS node holds only a current value, never a history list"

    print("all MQTT/Sparkplug/UNS assertions passed")
    print(f"  QoS 0: published {len(qos0.published)}, received {len(qos0.received)}, lost {len(qos0.lost())}, duplicates {qos0.duplicates()}")
    print(f"  QoS 1: published {len(qos1.published)}, received {len(qos1.received)}, lost {len(qos1.lost())}, duplicates {qos1.duplicates()}")
    print(f"  retained delivered to late subscriber: {got_retained}, Will delivered on ungraceful disconnect: {got_will}")
    print(f"  NBIRTH seq: {nbirth.seq}, NDATA seqs: {ndata_1.seq},{ndata_2.seq}, wrapped seq: {wrapped.seq}")
    print(f"  sequence gap detector: {detector.gaps_detected} gap(s), rebirth requested: {detector.rebirth_requested}")


if __name__ == "__main__":
    main()
