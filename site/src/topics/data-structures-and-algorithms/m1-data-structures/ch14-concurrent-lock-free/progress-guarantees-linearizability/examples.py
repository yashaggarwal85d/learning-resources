"""
dsa.progress-guarantees-linearizability -- worked schedules and a brute-force linearizability
checker.

Per CHAPTER.md, every example here replays a numbered, deterministic schedule in a single
Python thread (the way a model checker would), rather than racing real threads: a pure-Python
thread benchmark is dominated by the interpreter's own global lock and would show nothing about
lock-free scaling. Nothing here claims a wall-clock speed.
"""

import itertools

# ---------------------------------------------------------------------------
# The lost update: all twenty interleavings of two three-step threads.
# ---------------------------------------------------------------------------

STEPS = ["read", "add", "write"]


def run_counter_schedule(order: tuple[str, ...]) -> int:
    """Replay one interleaving of threads A and B, each doing read; add one; write, on a
    counter that starts at 0. `order` is a 6-token sequence of 'A'/'B', each thread's own three
    steps occurring in order within its own token stream."""
    counter = 0
    register = {"A": None, "B": None}
    next_step = {"A": 0, "B": 0}
    for who in order:
        step = STEPS[next_step[who]]
        next_step[who] += 1
        if step == "read":
            register[who] = counter
        elif step == "add":
            register[who] = register[who] + 1
        elif step == "write":
            counter = register[who]
    return counter


def is_correct_schedule(order: tuple[str, ...]) -> bool:
    """A schedule is correct only if neither thread's read falls strictly between the other
    thread's own read and write -- i.e. the two three-step runs don't interleave at all."""
    pos = {who: [] for who in ("A", "B")}
    for i, who in enumerate(order):
        pos[who].append(i)
    a_read, a_write = pos["A"][0], pos["A"][2]
    b_read, b_write = pos["B"][0], pos["B"][2]
    b_interleaves_a = a_read < b_read < a_write
    a_interleaves_b = b_read < a_read < b_write
    return not (b_interleaves_a or a_interleaves_b)


all_orders = sorted(set(itertools.permutations("AAABBB")))
assert len(all_orders) == 20, len(all_orders)

results = [run_counter_schedule(o) for o in all_orders]
ends_at_1 = sum(1 for r in results if r == 1)
ends_at_2 = sum(1 for r in results if r == 2)
print(f"lost-update counter: {len(all_orders)} interleavings, {ends_at_1} end at one, {ends_at_2} end at two")
assert ends_at_1 == 18 and ends_at_2 == 2

correct_count = sum(1 for o in all_orders if is_correct_schedule(o))
assert correct_count == ends_at_2 == 2, correct_count
# Every schedule the "neither read falls inside the other's read-write span" rule calls correct
# really does end at two, and every schedule it calls incorrect really does end at one.
for o, r in zip(all_orders, results):
    assert is_correct_schedule(o) == (r == 2), (o, r)


# ---------------------------------------------------------------------------
# A lock: a suspended holder blocks the other thread outright (blocking progress).
# ---------------------------------------------------------------------------

class Lock:
    def __init__(self):
        self.held_by = None

    def try_acquire(self, who: str) -> bool:
        if self.held_by is None:
            self.held_by = who
            return True
        return False

    def release(self, who: str):
        assert self.held_by == who
        self.held_by = None


def lock_based_schedule_blocks() -> bool:
    """A acquires the lock, then is suspended indefinitely before releasing it. B repeatedly
    tries to acquire and never succeeds, no matter how many steps B is given -- this is exactly
    what "blocking" means: a single stalled thread can prevent another from ever finishing."""
    lock = Lock()
    assert lock.try_acquire("A")
    # A is suspended here -- it never calls release(). Give B a generous number of steps.
    b_attempts = 0
    for _ in range(10_000):
        b_attempts += 1
        if lock.try_acquire("B"):
            return False  # B made progress despite A's suspension: not blocking after all.
    return True  # B never got the lock in ten thousand tries while A sat suspended.


assert lock_based_schedule_blocks()
print("lock-based counter: a suspended holder blocks the other thread for every one of 10,000 of its own steps")


# ---------------------------------------------------------------------------
# Compare-and-swap retry loop: lock-free (someone always finishes), not wait-free (one thread
# can be starved by an adversarial schedule that always lets the other thread's CAS land first).
# ---------------------------------------------------------------------------

def cas(cell: list[int], expected: int, new: int) -> bool:
    if cell[0] == expected:
        cell[0] = new
        return True
    return False


def adversarial_cas_schedule(max_retries: int = 1000) -> tuple[int, bool]:
    """B's single CAS lands immediately. A retries up to max_retries times, but right before
    each of A's own CAS calls, the adversary lets B sneak in another increment first -- so every
    one of A's reads is stale by the time A's CAS runs, and every one of A's CAS calls fails.
    Returns (how many attempts A made, whether A ran out of retries without ever succeeding)."""
    cell = [0]
    assert cas(cell, 0, 1)  # B's own single, immediate success.
    a_starved = True
    attempts = 0
    for attempt in range(1, max_retries + 1):
        attempts = attempt
        seen_by_a = cell[0]
        cell[0] += 1  # B (winning every tie) increments again before A's CAS can land.
        if cas(cell, seen_by_a, seen_by_a + 1):
            a_starved = False
            break
    return attempts, a_starved


a_attempts_tried, a_starved = adversarial_cas_schedule(max_retries=1000)
print(f"CAS retry loop: B succeeds on its first attempt; A fails every one of its own {a_attempts_tried} attempts under this adversarial schedule")
assert a_starved  # lock-free: some thread (B) always makes progress; not wait-free: A can starve.


# ---------------------------------------------------------------------------
# An atomic hardware add: completes in one step, independent of any other thread's speed.
# ---------------------------------------------------------------------------

def atomic_add_completes_in_one_step(cell: list[int]) -> int:
    cell[0] += 1  # modeled as indivisible: no other thread's steps can appear inside this one.
    return cell[0]


cell = [0]
before = cell[0]
after = atomic_add_completes_in_one_step(cell)
assert after == before + 1
print("atomic add: completes in exactly one step, regardless of what any other thread is doing")


# ---------------------------------------------------------------------------
# A brute-force linearizability checker over a small history.
# ---------------------------------------------------------------------------

class Op:
    __slots__ = ("thread", "kind", "arg", "result", "start", "end")

    def __init__(self, thread, kind, arg, result, start, end):
        self.thread, self.kind, self.arg, self.result = thread, kind, arg, result
        self.start, self.end = start, end

    def __repr__(self):
        return f"{self.thread}:{self.kind}({self.arg})->{self.result}@[{self.start},{self.end}]"


def precedes(a: Op, b: Op) -> bool:
    return a.end < b.start


def consistent_orders(ops: list[Op]):
    """Every permutation of ops that respects the real-time precedence order: if a precedes b
    (a's response is before b's invocation), a must come first."""
    for perm in itertools.permutations(ops):
        if all(
            not (precedes(perm[j], perm[i]))
            for i in range(len(perm))
            for j in range(i + 1, len(perm))
        ):
            yield perm


def simulate_queue(order: tuple[Op, ...]) -> bool:
    """Run a FIFO queue's sequential specification over this order; return whether every
    operation's recorded result matches what the sequential queue would actually produce."""
    queue: list = []
    for op in order:
        if op.kind == "enqueue":
            queue.append(op.arg)
            if op.result is not None:
                return False  # an enqueue has no return value in this model
        elif op.kind == "dequeue":
            expected = queue.pop(0) if queue else "empty"
            if expected != op.result:
                return False
    return True


def is_linearizable(ops: list[Op]) -> tuple[bool, tuple[Op, ...] | None]:
    for order in consistent_orders(ops):
        if simulate_queue(order):
            return True, order
    return False, None


# History 1: enqueue(x) by thread A overlaps dequeue()->x by thread B (concurrent), followed by
# a second, non-overlapping pair. Linearizable: there is a legal sequential order (enqueue(x),
# dequeue()->x, enqueue(y), dequeue()->y) consistent with real time, even though the first pair
# overlaps in real time.
history_linearizable = [
    Op("A", "enqueue", "x", None, start=0, end=4),
    Op("B", "dequeue", None, "x", start=1, end=2),
    Op("A", "enqueue", "y", None, start=5, end=6),
    Op("B", "dequeue", None, "y", start=7, end=8),
]
ok, order = is_linearizable(history_linearizable)
print(f"history 1 (enqueue(x) overlapping dequeue->x): linearizable = {ok}")
assert ok

# History 2: enqueue(x) completes entirely (real time) before dequeue() begins, yet dequeue
# returns "empty". No legal sequential order can produce this: real-time precedence forces
# enqueue(x) before dequeue in every consistent order, and a queue with x in it cannot return
# empty. Exactly the stalled-producer failure the next topic (bounded MPMC ring queues) shows on
# a real implementation.
history_not_linearizable = [
    Op("A", "enqueue", "x", None, start=0, end=2),
    Op("B", "dequeue", None, "empty", start=3, end=5),
]
ok2, order2 = is_linearizable(history_not_linearizable)
print(f"history 2 (dequeue->empty after enqueue(x) completed): linearizable = {ok2}")
assert not ok2

print()
print("all assertions passed.")
