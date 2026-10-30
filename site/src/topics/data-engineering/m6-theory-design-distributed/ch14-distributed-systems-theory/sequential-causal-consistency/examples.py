"""
A sequential-consistency checker that drops linearizability's real-time rule and keeps
only "one total order, consistent with each process's own program order"; a causal-consistency
checker that only forces causally related operations into the same order everywhere, leaving
concurrent ones free to vary; and small histories violating each of the four session guarantees
(read-your-writes, monotonic reads, monotonic writes, writes-follow-reads).
"""

from dataclasses import dataclass
from itertools import permutations


@dataclass(frozen=True)
class Op:
    process: str
    kind: str  # "read" or "write"
    value: int | None


def register_value_after(sequence: list[Op], initial: int) -> int:
    value = initial
    for op in sequence:
        if op.kind == "write":
            value = op.value
    return value


def is_legal_sequential_history(sequence: list[Op], initial: int) -> bool:
    value = initial
    for op in sequence:
        if op.kind == "read" and op.value != value:
            return False
        if op.kind == "write":
            value = op.value
    return True


def respects_program_order(sequence: list[Op], history: list[Op]) -> bool:
    for process in {op.process for op in history}:
        own_in_history = [op for op in history if op.process == process]
        own_in_sequence = [op for op in sequence if op.process == process]
        if own_in_sequence != own_in_history:
            return False
    return True


def find_sequential_order(history: list[Op], initial: int) -> list[Op] | None:
    for candidate in permutations(history):
        candidate = list(candidate)
        if respects_program_order(candidate, history) and is_legal_sequential_history(candidate, initial):
            return candidate
    return None


def sequential_consistency_drops_the_real_time_rule():
    # P1 writes, completing before P2's read begins -- but P2 is free to read the OLD value
    # anyway, because sequential consistency makes no promise about real time, only about each
    # process's own program order and some single total order.
    history = [
        Op("p1", "write", 1),
        Op("p2", "read", 0),  # stale -- and still legal under sequential consistency
    ]
    order = find_sequential_order(history, initial=0)
    assert order is not None, "a stale read, alone, does not break sequential consistency"
    # The order that makes it legal puts P2's read BEFORE P1's write in the total order --
    # exactly the real-time violation linearizability would have forbidden.
    assert order.index(history[1]) < order.index(history[0])
    print("sequential order for a real-time-violating but legal history:",
          [(o.process, o.kind, o.value) for o in order])


def two_concurrent_writes_have_no_single_legal_order():
    # Two different processes both write, with no program-order or read constraint tying them
    # together, and a third process reads the result -- forcing SOME order to be chosen, but any
    # single order works, which is the point: sequential consistency still needs one, shared,
    # arbitrary order, even among operations nothing else orders.
    history = [
        Op("p1", "write", 1),
        Op("p2", "write", 2),
        Op("p3", "read", 2),
    ]
    order = find_sequential_order(history, initial=0)
    assert order is not None
    print("one of the legal total orders:", [(o.process, o.kind, o.value) for o in order])


# --- Causal consistency: only causally related operations need agree, everywhere. ---

@dataclass(frozen=True)
class CausalOp:
    id: str
    process: str
    kind: str
    value: str | None


def causally_related_pairs(ops: list[CausalOp], extra_edges: set[tuple[str, str]]) -> set[tuple[str, str]]:
    # Same-process program order is always causal; extra_edges adds read-depends-on-write edges
    # (the causal link the chat example relies on: seeing a question before answering it).
    edges = set(extra_edges)
    by_process: dict[str, list[CausalOp]] = {}
    for op in ops:
        by_process.setdefault(op.process, []).append(op)
    for ops_on_one_process in by_process.values():
        for i in range(len(ops_on_one_process)):
            for j in range(i + 1, len(ops_on_one_process)):
                edges.add((ops_on_one_process[i].id, ops_on_one_process[j].id))
    # transitive closure
    changed = True
    while changed:
        changed = False
        for a, b in list(edges):
            for c, d in list(edges):
                if b == c and (a, d) not in edges:
                    edges.add((a, d))
                    changed = True
    return edges


def process_view_respects_causality(view: list[str], causal_edges: set[tuple[str, str]]) -> bool:
    position = {op_id: i for i, op_id in enumerate(view)}
    for a, b in causal_edges:
        if a in position and b in position and position[a] > position[b]:
            return False
    return True


def chat_example_two_replies_may_swap_but_never_precede_the_question():
    question = CausalOp("q", "attiya", "write", "lunch?")
    yes = CausalOp("y", "barbarella", "write", "yes")
    no = CausalOp("n", "cyrus", "write", "no")
    # Barbarella and Cyrus each read the question before replying -- that read-depends-on-write
    # edge is what makes their reply causally AFTER the question.
    causal_edges = causally_related_pairs(
        [question, yes, no],
        extra_edges={("q", "y"), ("q", "n")},
    )
    assert ("q", "y") in causal_edges and ("q", "n") in causal_edges
    assert ("y", "n") not in causal_edges and ("n", "y") not in causal_edges  # concurrent

    attiyas_view = ["q", "y", "n"]
    barbarellas_view = ["q", "n", "y"]  # replies swapped -- still causally legal
    broken_view = ["y", "q", "n"]  # a reply observed before the question -- not legal

    assert process_view_respects_causality(attiyas_view, causal_edges)
    assert process_view_respects_causality(barbarellas_view, causal_edges)
    assert not process_view_respects_causality(broken_view, causal_edges)
    print("two causally legal views, one broken view: checked")


# --- The four session guarantees, each shown violated by a small two-step history. ---

def read_your_writes_violated():
    # The hook's own anomaly: a client writes a comment, then its very next read of the same
    # object comes back without it.
    write_the_comment = ("alice", "write", "comment-text")
    read_after_own_write = ("alice", "read", None)  # returns nothing -- the write vanished
    assert write_the_comment[0] == read_after_own_write[0]  # same process
    violates = read_after_own_write[2] != "comment-text"
    assert violates
    print("read-your-writes violated: a client's own next read misses its own write")


def monotonic_reads_violated():
    # The same client reads an up-to-date state, then a later read on the SAME client regresses
    # to an older state -- reads going backwards.
    first_read_sees = {"comment"}
    second_read_sees = set()  # fewer writes reflected than before -- a regression
    assert not second_read_sees.issuperset(first_read_sees)
    print("monotonic reads violated: a later read by the same client sees strictly less")


def monotonic_writes_violated():
    # The same client issues w1 then w2, but some other process observes w2 without ever having
    # observed w1 -- the client's own writes arrive out of order elsewhere.
    w1, w2 = "set-title", "set-body"
    observed_elsewhere = [w2]  # w1 missing even though w2, issued after it, is visible
    assert w1 not in observed_elsewhere and w2 in observed_elsewhere
    print("monotonic writes violated: w2 visible on another replica while w1 is still missing")


def writes_follow_reads_violated():
    # This is the hook's second anomaly: a client reads the comment (w1), then writes a reply
    # (w2) that depends on it -- but some other screen observes the reply before the comment.
    w1_comment = "comment"
    w2_reply = "reply"
    observed_order_elsewhere = [w2_reply, w1_comment]  # reply shown before the comment it answers
    assert observed_order_elsewhere.index(w2_reply) < observed_order_elsewhere.index(w1_comment)
    print("writes-follow-reads violated: a reply is shown before the comment it depends on")


if __name__ == "__main__":
    sequential_consistency_drops_the_real_time_rule()
    two_concurrent_writes_have_no_single_legal_order()
    chat_example_two_replies_may_swap_but_never_precede_the_question()
    read_your_writes_violated()
    monotonic_reads_violated()
    monotonic_writes_violated()
    writes_follow_reads_violated()
