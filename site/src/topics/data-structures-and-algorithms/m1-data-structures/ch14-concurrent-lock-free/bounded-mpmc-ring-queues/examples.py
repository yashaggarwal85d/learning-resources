"""dsa.bounded-mpmc-ring-queues: every schedule here is replayed deterministically, in a single
thread, never raced on real threads (CHAPTER.md: a pure-Python thread benchmark would be
dominated by the interpreter's own global lock and would show nothing about this queue's own
CAS-retry behaviour). The real compiled benchmarks (false sharing, queue throughput against a
mutex baseline) live in examples.c, run via examples.sh; their numbers are quoted only in
post-notes.md with the machine, compiler and flags recorded in OUTLINE.md.
"""

import itertools


# ---------- Vyukov's bounded MPMC queue, modeled single-threaded ----------

class VyukovQueue:
    """A direct model of the algorithm (CHAPTER.md's own description): a power-of-two ring of
    cells, each with a sequence number starting at its own index, and two shared counters.
    Calls are made explicitly, one at a time, in whatever order the caller chooses — there is no
    real concurrency here, only the data structure's own state transitions."""

    def __init__(self, capacity):
        assert capacity > 0 and (capacity & (capacity - 1)) == 0, "capacity must be a power of two"
        self.capacity = capacity
        self.mask = capacity - 1
        self.sequence = list(range(capacity))
        self.data = [None] * capacity
        self.enqueue_pos = 0
        self.dequeue_pos = 0

    def enqueue(self, value):
        pos = self.enqueue_pos
        cell = pos & self.mask
        seq = self.sequence[cell]
        dif = seq - pos
        if dif != 0:
            return False  # dif < 0: full; dif > 0: another producer already took this turn
        self.enqueue_pos = pos + 1
        self.data[cell] = value
        self.sequence[cell] = pos + 1  # the release that publishes it
        return True

    def claim_without_publishing(self):
        """A producer that wins the CAS on enqueue_pos, then stalls before writing data or
        storing the new sequence number — the slot is claimed but never published."""
        pos = self.enqueue_pos
        cell = pos & self.mask
        assert self.sequence[cell] == pos, "this cell is not free for this turn"
        self.enqueue_pos = pos + 1
        return cell  # no self.sequence[cell] update: the publish never happens

    def dequeue(self):
        pos = self.dequeue_pos
        cell = pos & self.mask
        seq = self.sequence[cell]
        dif = seq - (pos + 1)
        if dif != 0:
            return (False, None)  # dif < 0: empty (nothing published yet); dif > 0: taken already
        self.dequeue_pos = pos + 1
        value = self.data[cell]
        self.sequence[cell] = pos + self.mask + 1  # the next lap's free marker
        return (True, value)


# ---------- The capacity-four trace, by hand (CHAPTER.md's own "asserted numbers") ----------

def hand_trace():
    q = VyukovQueue(capacity=4)
    log = []

    def step(label, fn):
        fn()
        log.append((label, list(q.sequence)))

    step("enqueue(a)", lambda: q.enqueue("a"))
    step("enqueue(b)", lambda: q.enqueue("b"))
    step("dequeue() -> a", lambda: q.dequeue())
    step("enqueue(c)", lambda: q.enqueue("c"))
    step("enqueue(d)", lambda: q.enqueue("d"))
    step("enqueue(e)", lambda: q.enqueue("e"))  # wraps into cell 0, now free (lap 2)
    step("dequeue() -> b", lambda: q.dequeue())
    return log


EXPECTED_TRACE = [
    ("enqueue(a)", [1, 1, 2, 3]),
    ("enqueue(b)", [1, 2, 2, 3]),
    ("dequeue() -> a", [4, 2, 2, 3]),
    ("enqueue(c)", [4, 2, 3, 3]),
    ("enqueue(d)", [4, 2, 3, 4]),
    ("enqueue(e)", [5, 2, 3, 4]),
    ("dequeue() -> b", [5, 5, 3, 4]),
]


# ---------- The stalled producer: claimed, never published ----------

def stalled_producer_blocks_dequeue():
    """Producer A claims slot 0 and stalls before publishing. Producer B then claims and
    publishes into slot 1. A consumer calling dequeue repeatedly, for as long as it likes, never
    sees anything: the dequeue side is strictly FIFO on dequeue_pos, so a published, later slot
    does not help the dequeue stuck on the earlier, unpublished one."""
    q = VyukovQueue(capacity=4)
    q.claim_without_publishing()  # producer A: slot 0 claimed, never published
    assert q.enqueue("x")  # producer B: slot 1, claimed and published
    attempts = 10_000
    results = [q.dequeue() for _ in range(attempts)]
    all_empty = all(ok is False for ok, _ in results)
    return attempts, all_empty


# ---------- A general brute-force linearizability checker (as in dsa.progress-guarantees-linearizability) ----------

class Op:
    def __init__(self, name, call_at, return_at, result):
        self.name, self.call_at, self.return_at, self.result = name, call_at, return_at, result

    def __repr__(self):
        return f"{self.name}@[{self.call_at},{self.return_at}]->{self.result}"


def precedes(a, b):
    return a.return_at < b.call_at


def consistent_orders(ops):
    for perm in itertools.permutations(ops):
        if all(precedes(perm[i], perm[j]) or not precedes(perm[j], perm[i]) for i in range(len(perm)) for j in range(i + 1, len(perm))):
            ok = True
            for i in range(len(perm)):
                for j in range(i + 1, len(perm)):
                    if precedes(perm[j], perm[i]):
                        ok = False
            if ok:
                yield perm


def simulate_fifo_queue(order):
    """The sequential specification a bounded FIFO queue is checked against."""
    queue = []
    for op in order:
        if op.name.startswith("enqueue"):
            value = op.name.split("(")[1].rstrip(")")
            queue.append(value)
            if op.result != "ok":
                return False
        elif op.name == "dequeue":
            if queue:
                expected = queue.pop(0)
                if op.result != expected:
                    return False
            else:
                if op.result != "empty":
                    return False
    return True


def is_linearizable(ops):
    return any(simulate_fifo_queue(order) for order in consistent_orders(ops))


def empty_after_completed_enqueue_history():
    """Exactly the history CHAPTER.md derives: an enqueue of x into slot 1 (by producer B)
    completes entirely before a dequeue call begins; that dequeue, stuck on the still-unpublished
    slot 0, returns "empty". Real time alone already decided enqueue(x) happened first."""
    enqueue_x = Op("enqueue(x)", call_at=0, return_at=1, result="ok")
    dequeue_empty = Op("dequeue", call_at=2, return_at=3, result="empty")
    return [enqueue_x, dequeue_empty]


if __name__ == "__main__":
    trace = hand_trace()
    assert trace == EXPECTED_TRACE, f"trace mismatch: {trace}"
    for label, seq in trace:
        print(f"{label:>18}: sequence = {seq}")

    attempts, all_empty = stalled_producer_blocks_dequeue()
    assert all_empty
    print(f"\nstalled producer: {attempts} straight dequeue attempts on the claimed slot, every one empty")

    history = empty_after_completed_enqueue_history()
    linearizable = is_linearizable(history)
    assert linearizable is False
    print(f"history (enqueue(x) completed, then dequeue -> empty): linearizable = {linearizable}")

    # Contrast: a dequeue that overlaps the enqueue and sees nothing yet is a different, legal history.
    overlapping = [Op("enqueue(x)", call_at=0, return_at=3, result="ok"), Op("dequeue", call_at=1, return_at=2, result="empty")]
    overlapping_linearizable = is_linearizable(overlapping)
    assert overlapping_linearizable is True
    print(f"history (dequeue -> empty while enqueue(x) is still in progress): linearizable = {overlapping_linearizable}")

    print("\nall assertions passed.")
