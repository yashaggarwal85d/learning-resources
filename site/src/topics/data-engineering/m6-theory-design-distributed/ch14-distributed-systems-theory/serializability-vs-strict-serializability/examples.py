"""
A serializability checker that, like topic 6's sequential-consistency checker, drops the
real-time rule entirely and only asks for ONE total order over whole transactions; a strict-
serializability checker that adds the real-time rule back, exactly as linearizability (topic 5)
adds it to a single object; and the two-axis consistency-model map as a plain data structure.
"""

from dataclasses import dataclass
from itertools import permutations


@dataclass(frozen=True)
class Txn:
    name: str
    reads: tuple[str, ...]
    writes: tuple[tuple[str, int], ...]
    start: float
    end: float


def apply_write(state: dict, txn: Txn) -> dict:
    new_state = dict(state)
    for key, value in txn.writes:
        new_state[key] = value
    return new_state


def is_legal_serial_history(order: list[Txn], initial: dict, observed: dict[str, dict]) -> bool:
    state = dict(initial)
    for txn in order:
        for key in txn.reads:
            if observed[txn.name].get(key) != state.get(key):
                return False
        state = apply_write(state, txn)
    return True


def respects_real_time(order: list[Txn], history: list[Txn]) -> bool:
    position = {txn.name: i for i, txn in enumerate(order)}
    for a in history:
        for b in history:
            if a.end <= b.start and position[a.name] > position[b.name]:
                return False
    return True


def find_serializable_order(history: list[Txn], initial: dict, observed: dict[str, dict]) -> list[Txn] | None:
    for candidate in permutations(history):
        if is_legal_serial_history(list(candidate), initial, observed):
            return list(candidate)
    return None


def find_strictly_serializable_order(history: list[Txn], initial: dict, observed: dict[str, dict]) -> list[Txn] | None:
    for candidate in permutations(history):
        candidate = list(candidate)
        if is_legal_serial_history(candidate, initial, observed) and respects_real_time(candidate, history):
            return candidate
    return None


def the_hook_is_serializable_but_not_strictly_so():
    # T1 commits a new order. T2 is the SAME client's very next read, starting strictly after
    # T1's commit -- and observes the state from BEFORE T1's write. This is the hook: confirmed,
    # then refreshed, and gone.
    t1 = Txn("place-order", reads=(), writes=(("orders", 1),), start=0.0, end=1.0)
    t2 = Txn("refresh-order-list", reads=("orders",), writes=(), start=1.0, end=1.0)

    observed = {"place-order": {}, "refresh-order-list": {"orders": None}}  # T2 reads the OLD value
    history = [t1, t2]

    serial = find_serializable_order(history, initial={"orders": None}, observed=observed)
    assert serial is not None, "ordering T2 before T1 in the serial order makes this legal"
    assert serial.index(t2) < serial.index(t1)
    print("legal serial order for the hook (T2 before T1):", [t.name for t in serial])

    strict = find_strictly_serializable_order(history, initial={"orders": None}, observed=observed)
    assert strict is None, "no order can be both legal AND respect real time here"
    print("no strictly serializable order exists for the hook's history")


def fixing_the_hook_makes_it_strictly_serializable_too():
    # Same shape, but T2 now observes the FRESH value -- the only change.
    t1 = Txn("place-order", reads=(), writes=(("orders", 1),), start=0.0, end=1.0)
    t2 = Txn("refresh-order-list", reads=("orders",), writes=(), start=1.0, end=1.0)
    observed = {"place-order": {}, "refresh-order-list": {"orders": 1}}
    history = [t1, t2]

    strict = find_strictly_serializable_order(history, initial={"orders": None}, observed=observed)
    assert strict is not None
    assert strict.index(t1) < strict.index(t2)
    print("strictly serializable order once the refresh sees the fresh value:", [t.name for t in strict])


def two_causally_ordered_transactions_may_serialize_in_reverse():
    # T2 starts after T1 ends in real time, and T2's read does NOT depend on T1's write -- so a
    # serializable database is free to place T2 BEFORE T1 in the serial order, even though real
    # time ran the other way, as long as nothing T2 read contradicts that placement.
    t1 = Txn("unrelated-write", reads=(), writes=(("other_key", 99),), start=0.0, end=1.0)
    t2 = Txn("independent-read", reads=("other_key",), writes=(), start=1.0, end=2.0)
    observed = {"unrelated-write": {}, "independent-read": {"other_key": None}}  # pre-T1 value
    history = [t1, t2]

    serial = find_serializable_order(history, initial={"other_key": None}, observed=observed)
    assert serial is not None and serial.index(t2) < serial.index(t1)
    print("a serializable database may place a later-starting transaction earlier in the serial order")


# --- The two-axis consistency-model map, as a plain data structure the reel renders. ---

CONSISTENCY_MODEL_MAP = {
    "single-object": {
        "none": "eventual",
        "per-process": "monotonic reads / writes",
        "causal": "causal",
        "real-time": "linearizable",
    },
    "multi-object": {
        "none": "read committed",
        "per-process": "snapshot isolation",
        "causal": "sequential",
        "real-time": "serializable / strict serializable",
    },
}

SYSTEM_CLAIMS = {
    "etcd": {"axis": "multi-object", "strength": "real-time", "label": "strict serializability", "quoted": "etcd ensures durability and strict serializability for all KV api calls."},
    "Spanner": {"axis": "multi-object", "strength": "real-time", "label": "external consistency", "quoted": "the serialization order satisfies external consistency (or equivalently, linearizability)"},
    "PostgreSQL SERIALIZABLE": {"axis": "multi-object", "strength": "none-promised-by-definition", "label": "serializable, not strict", "quoted": "it does not impose any real-time, or even per-process constraints"},
}


def the_map_places_three_named_systems_on_documented_cells():
    for system, claim in SYSTEM_CLAIMS.items():
        assert claim["quoted"], f"{system} must be placed from its own quoted documentation"
    print("systems placed on the map:", list(SYSTEM_CLAIMS.keys()))


if __name__ == "__main__":
    the_hook_is_serializable_but_not_strictly_so()
    fixing_the_hook_makes_it_strictly_serializable_too()
    two_causally_ordered_transactions_may_serialize_in_reverse()
    the_map_places_three_named_systems_on_documented_cells()
