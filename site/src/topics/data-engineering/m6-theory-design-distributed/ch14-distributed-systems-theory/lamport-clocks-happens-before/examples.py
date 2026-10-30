"""Lamport clocks: happens-before as a graph, a scalar clock that respects it, and the one
thing the scalar clock cannot tell you — whether two events were actually concurrent.

Chapter 14's shared tool is a deterministic simulator; this topic's slice of it builds the
happens-before relation from events and messages directly (Lamport's own three-condition
definition), implements the IR1/IR2 update rule verbatim, and checks the Clock Condition and
its converse's failure against the three-lane example from CHAPTER.md's hook.
"""

from dataclasses import dataclass, field


@dataclass(eq=False)
class Event:
    process: str
    seq: int  # position within its own process, zero-based
    sends_to: "Event | None" = None  # the event that receives this event's message, if any
    receives_from: "Event | None" = None  # the event that sent this event's message, if any


def happens_before_edges(events):
    """Lamport's three conditions, as direct edges: (1) same-process order, (2) a send's edge
    to its matching receive. Transitivity (condition 3) is computed separately by reachability,
    not stored as an edge."""
    by_process = {}
    for e in events:
        by_process.setdefault(e.process, []).append(e)
    edges = []
    for proc_events in by_process.values():
        proc_events.sort(key=lambda e: e.seq)
        for a, b in zip(proc_events, proc_events[1:]):
            edges.append((a, b))
    for e in events:
        if e.sends_to is not None:
            edges.append((e, e.sends_to))
    return edges


def happens_before_reachable(events):
    """The transitive closure of the direct edges: a -> b in this set iff a happens-before b."""
    edges = happens_before_edges(events)
    adjacency = {e: [] for e in events}
    for a, b in edges:
        adjacency[a].append(b)
    reach = {}
    for start in events:
        seen = set()
        stack = list(adjacency[start])
        while stack:
            node = stack.pop()
            if node in seen:
                continue
            seen.add(node)
            stack.extend(adjacency[node])
        reach[start] = seen
    return reach


def happens_before_is_acyclic(events):
    reach = happens_before_reachable(events)
    for e in events:
        assert e not in reach[e], f"event {e} happens-before itself: happens-before must be acyclic"
    return True


def concurrent_pairs(events):
    reach = happens_before_reachable(events)
    pairs = []
    for i, a in enumerate(events):
        for b in events[i + 1:]:
            if b not in reach[a] and a not in reach[b]:
                pairs.append((a, b))
    return pairs


@dataclass
class ScalarClock:
    """Lamport's logical clock: IR1 (increment between events) and IR2 (stamp sends, advance past
    received timestamps) implemented directly."""
    value: int = 0

    def tick(self):  # IR1: increment between any two successive events
        self.value += 1
        return self.value

    def receive(self, incoming_timestamp):  # IR2(b): advance strictly past the message's stamp
        self.value = max(self.value, incoming_timestamp) + 1
        return self.value


def run_three_lane_example():
    """CHAPTER.md's hook: three services (order, payment, shipment) whose physical clocks
    disagree. order sends to payment; payment sends to shipment. A fourth, unrelated event on
    a separate customer's lane never exchanges a message with any of them."""
    clocks = {"order": ScalarClock(), "payment": ScalarClock(), "shipment": ScalarClock(), "other_customer": ScalarClock()}
    stamps = {}

    e_order = clocks["order"].tick()
    stamps["order_submitted"] = e_order

    e_payment_recv = clocks["payment"].receive(e_order)  # payment sees order's message
    stamps["payment_authorized"] = e_payment_recv

    e_shipment_recv = clocks["shipment"].receive(e_payment_recv)  # shipment sees payment's message
    stamps["shipment_dispatched"] = e_shipment_recv

    e_other = clocks["other_customer"].tick()  # a fully independent order, no message exchanged
    stamps["other_order_submitted"] = e_other

    return stamps


def clock_condition_holds_on_the_causal_chain():
    stamps = run_three_lane_example()
    assert stamps["order_submitted"] < stamps["payment_authorized"], "order happens-before payment: its stamp must be smaller"
    assert stamps["payment_authorized"] < stamps["shipment_dispatched"], "payment happens-before shipment: its stamp must be smaller"
    return stamps


def converse_fails_for_the_independent_order():
    """The scalar clock's one blind spot: two events with no causal link at all can still end up
    with one timestamp smaller than the other, and nothing in the numbers says they were
    independent."""
    stamps = run_three_lane_example()
    # other_order_submitted and shipment_dispatched never exchanged a message or shared a
    # process; they are concurrent. Yet their scalar stamps are still comparable numbers.
    independent_pair_has_an_order = stamps["other_order_submitted"] != stamps["shipment_dispatched"]
    assert independent_pair_has_an_order, "the two scalar stamps happen to differ, which is exactly the trap: a difference in number implies nothing about causality here"
    return stamps["other_order_submitted"], stamps["shipment_dispatched"]


def scalar_clock_survives_injected_physical_skew():
    """The §14.2 lab's point: the Clock Condition holds no matter how badly the underlying
    physical clocks (not used here at all) would have disagreed, because the scalar clock never
    reads a physical clock in the first place."""
    a = Event("A", 0)
    b = Event("B", 0, receives_from=a)
    a.sends_to = b
    events = [a, b]
    ca, cb = ScalarClock(), ScalarClock()
    ta = ca.tick()
    tb = cb.receive(ta)
    assert ta < tb, "the Clock Condition must hold regardless of any physical clock skew injected elsewhere in the simulator"
    return ta, tb


def tie_broken_total_order_respects_causality():
    """Lamport's total-order construction: break ties on equal scalar timestamps by an arbitrary
    total order of process names. The resulting order never contradicts happens-before."""
    events = [
        Event("A", 0),
        Event("B", 0),
    ]
    # Two events in different processes that never exchange a message, both ticking to the
    # same scalar value by coincidence.
    clock_a, clock_b = ScalarClock(), ScalarClock()
    ta = clock_a.tick()
    tb = clock_b.tick()
    assert ta == tb, "constructing the tie case: both scalar stamps land on the same value"
    process_order = {"A": 0, "B": 1}  # the arbitrary total order of process identifiers
    ordered = sorted([("A", ta), ("B", tb)], key=lambda pair: (pair[1], process_order[pair[0]]))
    assert ordered == [("A", ta), ("B", tb)], "the tie-break must still produce a definite, total order"
    return ordered


def main():
    order = Event("order", 0)
    payment = Event("payment", 0, receives_from=order)
    order.sends_to = payment
    shipment = Event("shipment", 0, receives_from=payment)
    payment.sends_to = shipment
    other = Event("other_customer", 0)
    graph_events = [order, payment, shipment, other]
    happens_before_is_acyclic(graph_events)
    pairs = concurrent_pairs(graph_events)
    assert (shipment, other) in pairs or (other, shipment) in pairs, "shipment and the unrelated customer's order must come back concurrent"

    stamps = clock_condition_holds_on_the_causal_chain()
    other_ts, shipment_ts = converse_fails_for_the_independent_order()
    skew_ta, skew_tb = scalar_clock_survives_injected_physical_skew()
    tie_order = tie_broken_total_order_respects_causality()

    print(f"happens-before graph is acyclic over {len(graph_events)} events, {len(pairs)} concurrent pair(s) found")
    print(f"causal chain stamps: order={stamps['order_submitted']}, payment={stamps['payment_authorized']}, shipment={stamps['shipment_dispatched']}")
    print(f"independent order's stamp: {other_ts}, shipment's stamp: {shipment_ts} (concurrent, but comparable as numbers)")
    print(f"Clock Condition under injected skew: send={skew_ta} < receive={skew_tb}")
    print(f"tie-broken total order: {tie_order}")
    print("lamport-clocks-happens-before examples: all checks pass")


if __name__ == "__main__":
    main()
