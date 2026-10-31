"""Linearizability: a small checker over recorded histories, the stale-leader-read anomaly it
must find, and the Attiya-Welch bound that says why a linearizable read costs at least a round
trip when clocks are not perfectly synchronized.

Chapter 14's shared tool is a deterministic simulator; this topic's slice of it is a minimal
history checker (Herlihy and Wing's own Ll/L2 conditions, checked by brute-force search over
candidate linearizations) and a planted stale-leader read it must reject.
"""

from dataclasses import dataclass
from itertools import permutations


@dataclass(frozen=True)
class Op:
    client: str
    kind: str  # "read" or "write"
    value: int | None  # the value written, or the value a read returned
    start: float  # invocation time
    end: float  # response time


def real_time_order_allows(a: Op, b: Op) -> bool:
    """a must be allowed to precede b in a linearization: either they overlap (either order is
    fine), or a's response strictly precedes b's invocation, in which case a must come first."""
    if a.end <= b.start:
        return True  # a fully precedes b: a before b is required, not forbidden
    if b.end <= a.start:
        return False  # b fully precedes a: a cannot come before b
    return True  # overlapping: no real-time constraint between them


def register_value_after(sequence: list[Op], initial: int) -> dict:
    """Replays a candidate total order against a single read/write register, returning the
    value each read must have seen for this order to be legal."""
    value = initial
    required_reads = {}
    for op in sequence:
        if op.kind == "write":
            value = op.value
        else:
            required_reads[op] = value
    return required_reads


def is_legal_sequential_history(sequence: list[Op], initial: int) -> bool:
    required = register_value_after(sequence, initial)
    return all(op.value == required[op] for op in required)


def respects_real_time_order(sequence: list[Op], history: list[Op]) -> bool:
    """Herlihy and Wing's L2: the linearization's order must respect <H, the real-time
    precedence ordering of the original history."""
    index = {op: i for i, op in enumerate(sequence)}
    for a in history:
        for b in history:
            if a is b:
                continue
            if a.end <= b.start and index[a] > index[b]:
                return False  # a precedes b in real time, but b was placed first
    return True


def find_a_linearization(history: list[Op], initial: int) -> list[Op] | None:
    """Brute-force search over every ordering (fine for the chapter's small, illustrative
    histories): Ll (a legal sequential history) and L2 (respects real-time order) together."""
    for candidate in permutations(history):
        candidate = list(candidate)
        if respects_real_time_order(candidate, history) and is_legal_sequential_history(candidate, initial):
            return candidate
    return None


def a_legal_history_is_linearizable():
    """Three clients, non-overlapping operations in a sensible order: a write, then a read that
    sees it, then a second write."""
    w1 = Op("A", "write", 7, start=0.0, end=1.0)
    r1 = Op("B", "read", 7, start=1.1, end=2.0)
    w2 = Op("C", "write", 9, start=2.1, end=3.0)
    history = [w1, r1, w2]
    linearization = find_a_linearization(history, initial=0)
    assert linearization is not None, "a correctly ordered history must have a linearization"
    return linearization


def stale_leader_read_is_not_linearizable():
    """CHAPTER.md's hook, planted directly: a leader is partitioned, a new leader accepts
    write(stock, 7) and the operation completes, and a client still talking to the deposed
    leader later reads the old value, 9, from a read that starts after the write finished."""
    write_new_value = Op("new-leader", "write", 7, start=1.0, end=2.0)
    stale_read = Op("client", "read", 9, start=2.5, end=3.0)  # starts after the write's response
    history = [write_new_value, stale_read]
    linearization = find_a_linearization(history, initial=9)
    assert linearization is None, "a read that starts after a completed write but returns the old value must have no linearization"
    return history


def quorum_confirmed_read_is_linearizable():
    """The fix CHAPTER.md names: the same scenario, but the deposed leader's read is blocked
    until it would have to confirm a quorum, so the stale read never completes before the new
    leader's write does -- the read that finally answers sees the new value."""
    write_new_value = Op("new-leader", "write", 7, start=1.0, end=2.0)
    quorum_confirmed_read = Op("client", "read", 7, start=2.5, end=3.0)  # now sees the fresh value
    history = [write_new_value, quorum_confirmed_read]
    linearization = find_a_linearization(history, initial=9)
    assert linearization is not None, "a read of the correct, current value after the write completed must be linearizable"
    return linearization


def attiya_welch_response_time_floor(network_delay_d: float, overlapping_clock_uncertainty_u: float):
    """The paper's own two regimes, computed directly: with perfectly synchronized clocks
    (u = 0), the paper's matching algorithm lets one operation answer instantly while the other
    takes exactly d; once clocks carry real uncertainty (u > 0), no linearizable implementation
    can do better than roughly u for every operation."""
    assert 0 <= overlapping_clock_uncertainty_u < network_delay_d, "the paper's own model requires 0 <= u < d"
    perfectly_synchronized_round_trip_floor = network_delay_d  # one op free, the other costs d
    skewed_clocks_per_operation_floor = overlapping_clock_uncertainty_u  # every op costs roughly u
    return perfectly_synchronized_round_trip_floor, skewed_clocks_per_operation_floor


def main():
    legal = a_legal_history_is_linearizable()
    stale_history = stale_leader_read_is_not_linearizable()
    fixed = quorum_confirmed_read_is_linearizable()
    sync_floor, skew_floor = attiya_welch_response_time_floor(network_delay_d=1.0, overlapping_clock_uncertainty_u=0.3)

    print(f"a legal history's linearization: {[op.kind for op in legal]}")
    print(f"stale-leader read over {len(stale_history)} operations: no linearization exists")
    print(f"quorum-confirmed read: a linearization exists, {[op.kind for op in fixed]}")
    print(f"Attiya-Welch floors: synchronized-clock round trip = {sync_floor}, skewed-clock per-operation floor = {skew_floor}")
    print("linearizability examples: all checks pass")


if __name__ == "__main__":
    main()
