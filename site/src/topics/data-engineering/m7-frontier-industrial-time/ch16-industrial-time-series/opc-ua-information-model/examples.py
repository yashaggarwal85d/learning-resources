"""A small OPC UA address space (nodes joined by typed references, browsed
from an Object down to a Variable), a DataValue carrying a status code and
two timestamps, an absolute-deadband monitored item measured against plain
polling, a client/server-vs-PubSub fan-out comparison, and the
MessageSecurityMode enumeration with a check that flags None as a finding."""

from __future__ import annotations

import math
from dataclasses import dataclass, field


@dataclass
class Node:
    node_id: str
    name: str
    node_class: str  # "Object" or "Variable"
    references: list[tuple[str, str]] = field(default_factory=list)  # (reference_type, target_node_id)
    value: float | None = None
    data_type: str | None = None
    engineering_unit: str | None = None


def build_address_space() -> dict[str, Node]:
    """The hook's own example: MachineTool/Monitoring/Spindle/Speed, a graph
    of Objects joined by HasComponent/Organizes references down to one
    Variable node."""
    nodes: dict[str, Node] = {
        "MachineTool": Node("MachineTool", "MachineTool", "Object", references=[("HasComponent", "Monitoring")]),
        "Monitoring": Node("Monitoring", "Monitoring", "Object", references=[("Organizes", "Spindle")]),
        "Spindle": Node("Spindle", "Spindle", "Object", references=[("HasComponent", "Speed")]),
        "Speed": Node(
            "Speed", "Speed", "Variable",
            value=0.0, data_type="Double", engineering_unit="rpm",
        ),
    }
    return nodes


def browse(nodes: dict[str, Node], node_id: str) -> list[tuple[str, str]]:
    """Returns (reference_type, target_name) pairs — what a client sees when
    it browses this node, never the raw address a tag list would give it."""
    return [(ref_type, nodes[target_id].name) for ref_type, target_id in nodes[node_id].references]


def browse_path(nodes: dict[str, Node], start_id: str, names: list[str]) -> Node:
    """Follows a dotted path like the hook's MachineTool/Monitoring/Spindle/Speed."""
    current = nodes[start_id]
    for name in names:
        match = next((nodes[t] for _, t in current.references if nodes[t].name == name), None)
        assert match is not None, f"no reference from {current.name} to a node named {name}"
        current = match
    return current


@dataclass
class DataValue:
    value: float
    status_code: str  # "Good", "Uncertain", "Bad" (Part 4 StatusCode's own severities)
    source_timestamp: float
    server_timestamp: float


def read_data_value(node: Node, source_timestamp: float, server_timestamp: float) -> DataValue:
    status = "Good" if node.value is not None else "Bad"
    return DataValue(value=node.value or 0.0, status_code=status, source_timestamp=source_timestamp, server_timestamp=server_timestamp)


def absolute_deadband_fires(last_cached_value: float, current_value: float, deadband_value: float) -> bool:
    """Part 4's own exact rule (7.22.2): generate a Notification if the
    absolute value of (last cached value - current value) exceeds the
    AbsoluteDeadband."""
    return abs(last_cached_value - current_value) > deadband_value


def simulate_subscription(samples: list[float], deadband_value: float) -> tuple[int, int]:
    """Counts DataChangeNotifications with an absolute deadband vs. counting
    every sample the way plain polling would see every one of them."""
    notifications = 0
    last_cached = samples[0]
    for value in samples[1:]:
        if absolute_deadband_fires(last_cached, value, deadband_value):
            notifications += 1
            last_cached = value
    polling_count = len(samples) - 1  # polling reads every sample, deadband or not
    return notifications, polling_count


def client_server_session_cost(n_subscribers: int, notifications_per_subscriber: int) -> int:
    """Each client/server subscriber needs its own session and its own
    monitored item, so the total notification traffic scales with the
    number of subscribers."""
    return n_subscribers * notifications_per_subscriber


def pubsub_message_cost(n_subscribers: int, messages_published: int) -> int:
    """A PubSub publisher sends one NetworkMessage regardless of how many
    Subscribers are listening — Publishers and Subscribers are loosely
    coupled (Part 14, 5.1) and don't hold a per-consumer session."""
    return messages_published  # independent of n_subscribers


MESSAGE_SECURITY_MODE = {0: "Invalid", 1: "None", 2: "Sign", 3: "SignAndEncrypt"}


def is_security_finding(mode_value: int) -> bool:
    """Part 4's own default (INVALID = 0) exists specifically to avoid an
    accidental choice of no security; an explicit choice of None (1) is a
    finding to flag, not a default a pipeline should treat as acceptable."""
    return MESSAGE_SECURITY_MODE[mode_value] == "None"


TIMESTAMPS_TO_RETURN = {0: "Source", 1: "Server", 2: "Both", 3: "Neither"}


def main() -> None:
    nodes = build_address_space()

    # --- browsing gives semantics a raw tag doesn't ---
    speed_node = browse_path(nodes, "MachineTool", ["Monitoring", "Spindle", "Speed"])
    assert speed_node.node_id == "Speed"
    assert speed_node.engineering_unit == "rpm"
    assert speed_node.data_type == "Double"

    speed_node.value = 1842.0
    dv = read_data_value(speed_node, source_timestamp=1000.0, server_timestamp=1000.05)
    assert dv.status_code == "Good"
    assert dv.source_timestamp != dv.server_timestamp, "the source and server timestamps come from two different clocks"

    children = browse(nodes, "MachineTool")
    assert children == [("HasComponent", "Monitoring")]

    # --- absolute deadband vs. plain polling ---
    samples = [1800.0 + 8.0 * math.sin(i / 5.0) for i in range(200)]
    notifications, polling_count = simulate_subscription(samples, deadband_value=5.0)
    assert notifications < polling_count, "a deadband must report fewer notifications than polling every sample"
    assert notifications > 0, "the signal must still move enough to cross the deadband at least once"

    big_jump_samples = samples + [samples[-1] + 50.0]
    notifications_with_jump, _ = simulate_subscription(big_jump_samples, deadband_value=5.0)
    assert notifications_with_jump > notifications, "a jump larger than the deadband must still generate a notification"

    # --- client/server session cost vs. PubSub fan-out ---
    for n_subscribers in (1, 10, 1000):
        cs_cost = client_server_session_cost(n_subscribers, notifications)
        ps_cost = pubsub_message_cost(n_subscribers, notifications)
        assert ps_cost == notifications, "PubSub's own published message count must not depend on subscriber count"
        if n_subscribers > 1:
            assert cs_cost > ps_cost, "client/server's per-subscriber notification cost must exceed PubSub's fan-out cost once there's more than one subscriber"

    # --- security modes: None is a finding, not a default ---
    assert is_security_finding(1) is True
    assert is_security_finding(0) is False
    assert is_security_finding(2) is False
    assert is_security_finding(3) is False
    assert MESSAGE_SECURITY_MODE[0] == "Invalid", "the spec's own default exists to force an explicit security choice"

    print("all address-space/deadband/fan-out/security-mode assertions passed")
    print(f"  deadband notifications: {notifications} of {polling_count} samples polling would have reported")
    print(f"  client/server cost at 1000 subscribers: {client_server_session_cost(1000, notifications)}")
    print(f"  PubSub cost at 1000 subscribers: {pubsub_message_cost(1000, notifications)}")
    print(f"  security mode table: {MESSAGE_SECURITY_MODE}")


if __name__ == "__main__":
    main()
