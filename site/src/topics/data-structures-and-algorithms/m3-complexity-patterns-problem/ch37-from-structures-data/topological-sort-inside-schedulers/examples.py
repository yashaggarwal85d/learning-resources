"""Topological sort inside schedulers: Kahn's algorithm as a ready-priority-queue scheduler,
Airflow's `downstream` priority-weight rule, and load-time cycle rejection.

Mirrors the structural facts read from Apache Airflow (`priority_strategy.py`,
`scheduler_job_runner.py`, `airflow_shared/dagnode/cycle.py`, `airflow_shared/dagnode/node.py`,
`dag.py`, `utils/dag_cycle_tester.py`) and the Wikipedia "Multiprocessor scheduling" page for
Graham's list-scheduling bound, quoted in SOURCES.md.

The DAG below is built, not copied from a source: CHAPTER.md asks for one where the
`downstream` rule (own weight + count of descendants, each counted once because
`get_flat_relative_ids` returns a `set[str]`) and a critical-path rule (own weight + sum of
descendant DURATIONS) order two ready tasks differently, scheduled both ways, with the measured
finish times reported rather than a general claim.
"""
import heapq
from collections import deque


# ---------------------------------------------------------------------------
# 1. The DAG: a critical chain A->B->C->D, a wide fan-out W (five short children,
#    matching the hook), and a second distractor N, a narrow chain of three long tasks.
# ---------------------------------------------------------------------------

DURATION = {
    "A": 1, "B": 3, "C": 3, "D": 3,
    "W": 1, "W1": 1, "W2": 1, "W3": 1, "W4": 1, "W5": 1,
    "N": 1, "N1": 4, "N2": 4, "N3": 4,
}
EDGES = [
    ("A", "B"), ("B", "C"), ("C", "D"),
    ("W", "W1"), ("W", "W2"), ("W", "W3"), ("W", "W4"), ("W", "W5"),
    ("N", "N1"), ("N1", "N2"), ("N2", "N3"),
]


def children_of(edges):
    children = {}
    for u, v in edges:
        children.setdefault(u, []).append(v)
    return children


def in_degrees(nodes, edges):
    indeg = {t: 0 for t in nodes}
    for _u, v in edges:
        indeg[v] += 1
    return indeg


# ---------------------------------------------------------------------------
# 2. `get_flat_relative_ids(upstream=False)` (airflow_shared/dagnode/node.py): a flat SET of
#    every downstream id, so a descendant reached by two routes is counted once, not once per
#    path. `_DownstreamPriorityWeightStrategy.get_weight` (priority_strategy.py) is
#    `own_weight + sum(priority_weight for each id in that set)`.
# ---------------------------------------------------------------------------


def get_flat_relative_ids(task, children):
    """All downstream ids, deduplicated — same contract as Airflow's `set[str]` return."""
    seen = set()
    stack = list(children.get(task, []))
    while stack:
        nxt = stack.pop()
        if nxt not in seen:
            seen.add(nxt)
            stack.extend(children.get(nxt, []))
    return seen


def downstream_priority_weight(nodes, edges, own_weight):
    """`_DownstreamPriorityWeightStrategy.get_weight`: own weight plus the weight of every
    downstream descendant, each counted once (not once per path to it)."""
    children = children_of(edges)
    weight = {}
    for t in nodes:
        descendants = get_flat_relative_ids(t, children)
        weight[t] = own_weight[t] + sum(own_weight[d] for d in descendants)
    return weight


NODES = list(DURATION.keys())
# Airflow's own task default: priority_weight = 1 per task (the "downstream" rule, Airflow's
# default weight_rule). This is the count-based rule the topic's hook asks about.
DEFAULT_WEIGHT = {t: downstream_priority_weight(NODES, EDGES, {n: 1 for n in NODES})[t] for t in NODES}
# Setting each task's own priority_weight to its duration turns the same rule into a sum over
# descendant DURATIONS — still not the critical path (the max over chains), a total of work.
CRITICAL_WEIGHT = downstream_priority_weight(NODES, EDGES, DURATION)

assert DEFAULT_WEIGHT["A"] == 4  # 1 (own) + B,C,D = 1+1+1+1
assert DEFAULT_WEIGHT["W"] == 6  # 1 (own) + 5 fan-out children
assert DEFAULT_WEIGHT["N"] == 4  # 1 (own) + N1,N2,N3
assert CRITICAL_WEIGHT["A"] == 10  # 1 + 3+3+3
assert CRITICAL_WEIGHT["W"] == 6  # 1 + 1*5
assert CRITICAL_WEIGHT["N"] == 13  # 1 + 4+4+4
# The hook's prediction: by the default rule, W (the fan-out) outranks A (the chain head),
# because the rule counts descendants, not chain length.
assert DEFAULT_WEIGHT["W"] > DEFAULT_WEIGHT["A"]
# Setting weight to duration reverses that ranking for this pair.
assert CRITICAL_WEIGHT["A"] > CRITICAL_WEIGHT["W"]


# ---------------------------------------------------------------------------
# 3. The scheduler: Kahn's algorithm (in-degree counters, a ready set) with a ready set that is
#    a priority queue keyed by a weight computed once (not recomputed per step, matching the
#    topic's reading of Airflow: the weight is a column read at selection time, not a live
#    recomputation), and a fixed worker count (list scheduling).
# ---------------------------------------------------------------------------


def schedule(nodes, edges, weight, workers):
    """Event-driven list scheduling: at every step, start the highest-weight ready tasks on
    free workers (ties broken by task id, Airflow's own secondary order_by columns playing the
    same role), run to completion, free the worker, and release newly-ready children."""
    children = children_of(edges)
    indeg = in_degrees(nodes, edges)
    ready = []
    for t in nodes:
        if indeg[t] == 0:
            heapq.heappush(ready, (-weight[t], t))
    running = []  # (finish_time, task_id)
    free_workers = workers
    time = 0
    finish = {}
    started_order = []
    while ready or running:
        while ready and free_workers > 0:
            _negw, t = heapq.heappop(ready)
            started_order.append(t)
            free_workers -= 1
            heapq.heappush(running, (time + DURATION[t], t))
        finish_time, t = heapq.heappop(running)
        time = finish_time
        finish[t] = finish_time
        free_workers += 1
        just_finished = [t]
        while running and running[0][0] == time:
            _ft, t2 = heapq.heappop(running)
            finish[t2] = _ft
            free_workers += 1
            just_finished.append(t2)
        for done_task in just_finished:
            for c in children.get(done_task, []):
                indeg[c] -= 1
                if indeg[c] == 0:
                    heapq.heappush(ready, (-weight[c], c))
    return finish, started_order


# ---------------------------------------------------------------------------
# 4. The hook's literal comparison first: A (chain head) against W (fan-out head) alone,
#    two workers. The default rule runs W first, as predicted — but the chain's own finish
#    time (D) comes out IDENTICAL either way: with enough worker slack for this pair alone,
#    running order changes, the pipeline's finish time does not.
# ---------------------------------------------------------------------------

PAIR_NODES = ["A", "B", "C", "D", "W", "W1", "W2", "W3", "W4", "W5"]
PAIR_EDGES = [("A", "B"), ("B", "C"), ("C", "D"),
              ("W", "W1"), ("W", "W2"), ("W", "W3"), ("W", "W4"), ("W", "W5")]
PAIR_DEFAULT = {t: DEFAULT_WEIGHT[t] for t in PAIR_NODES}
PAIR_CRITICAL = {t: CRITICAL_WEIGHT[t] for t in PAIR_NODES}

pair_finish_default, pair_order_default = schedule(PAIR_NODES, PAIR_EDGES, PAIR_DEFAULT, 2)
pair_finish_critical, pair_order_critical = schedule(PAIR_NODES, PAIR_EDGES, PAIR_CRITICAL, 2)

assert pair_order_default[0] == "W"  # default rule runs the fan-out head first, as predicted
assert pair_order_critical[0] == "A"  # critical rule reverses that
assert pair_finish_default["D"] == pair_finish_critical["D"] == 10  # but D finishes the same
assert max(pair_finish_default.values()) == max(pair_finish_critical.values()) == 10

# ---------------------------------------------------------------------------
# 5. Add the second distractor N (a narrow, longer chain) and the two rules genuinely diverge:
#    the critical-weighted rule finishes the main pipeline D LATER than the plain count rule
#    does, in this one measured DAG. Not a general claim — a measured counterexample to "weight
#    by duration and the critical path always wins."
# ---------------------------------------------------------------------------

finish_default, order_default = schedule(NODES, EDGES, DEFAULT_WEIGHT, 2)
finish_critical, order_critical = schedule(NODES, EDGES, CRITICAL_WEIGHT, 2)

assert order_default[:3] == ["W", "A", "N"]
assert order_critical[:3] == ["N", "A", "N1"]
assert finish_default["D"] == 10
assert finish_critical["D"] == 11
assert finish_default["D"] < finish_critical["D"]  # the "critical" rule is WORSE here
MAKESPAN_DEFAULT = max(finish_default.values())
MAKESPAN_CRITICAL = max(finish_critical.values())
assert MAKESPAN_DEFAULT == MAKESPAN_CRITICAL == 15  # the two rules tie on the whole DAG's span


# ---------------------------------------------------------------------------
# 6. Unlimited workers: the makespan is the critical path, the longest chain of summed
#    durations (Chapter 18's longest-path-in-a-DAG, reused here as the textbook floor).
# ---------------------------------------------------------------------------


def critical_path_makespan(nodes, edges):
    children = children_of(edges)
    preds = {t: [] for t in nodes}
    for u, v in edges:
        preds[v].append(u)
    indeg = in_degrees(nodes, edges)
    order = []
    q = deque(t for t in nodes if indeg[t] == 0)
    indeg_work = dict(indeg)
    while q:
        u = q.popleft()
        order.append(u)
        for c in children.get(u, []):
            indeg_work[c] -= 1
            if indeg_work[c] == 0:
                q.append(c)
    finish = {}
    for t in order:
        start = max((finish[p] for p in preds[t]), default=0)
        finish[t] = start + DURATION[t]
    return max(finish.values()), finish


UNLIMITED_MAKESPAN, unlimited_finish = critical_path_makespan(NODES, EDGES)
assert UNLIMITED_MAKESPAN == 13  # the narrow chain N->N1->N2->N3 is the longest: 1+4+4+4
assert unlimited_finish["D"] == 10  # D's own chain alone is only 1+3+3+3 = 10

# ---------------------------------------------------------------------------
# 7. Graham's list-scheduling bound: makespan <= (2 - 1/m) * optimal, for ANY ready-queue
#    order (Wikipedia "Multiprocessor scheduling", quoting Graham). With m=2 workers and an
#    optimal makespan of 13 (the critical path, a lower bound on any schedule), the bound is:
# ---------------------------------------------------------------------------

WORKERS = 2
OPTIMAL_LOWER_BOUND = UNLIMITED_MAKESPAN  # the critical path is a lower bound on any schedule
GRAHAM_BOUND = (2 - 1 / WORKERS) * OPTIMAL_LOWER_BOUND
assert MAKESPAN_DEFAULT <= GRAHAM_BOUND
assert MAKESPAN_CRITICAL <= GRAHAM_BOUND
assert round(GRAHAM_BOUND, 1) == 19.5


# ---------------------------------------------------------------------------
# 8. Cycle rejection: Kahn's algorithm (leftover in-degree) versus the iterative three-colour
#    DFS `detect_cycle` (airflow_shared/dagnode/cycle.py) on the chapter's DAG with a planted
#    cycle C->B.
# ---------------------------------------------------------------------------

CYCLE_EDGES = EDGES + [("C", "B")]


def kahn_leftover(nodes, edges):
    """Kahn's algorithm: the nodes still stuck (in-degree never reaches zero) when the ready
    queue drains are exactly the nodes on or downstream of every cycle."""
    children = children_of(edges)
    indeg = in_degrees(nodes, edges)
    q = deque(t for t in nodes if indeg[t] == 0)
    processed = set(q)
    while q:
        u = q.popleft()
        for c in children.get(u, []):
            indeg[c] -= 1
            if indeg[c] == 0 and c not in processed:
                processed.add(c)
                q.append(c)
    return sorted(set(nodes) - processed)


_NEW, _IN_PROGRESS, _DONE = 0, 1, 2


def detect_cycle(node_ids, downstream_of):
    """Iterative three-colour DFS, same shape as `airflow_shared/dagnode/cycle.py`'s
    `detect_cycle`: returns the id of the node whose downstream edge closes a cycle, or None."""
    visited = {n: _NEW for n in node_ids}
    for start in node_ids:
        if visited[start] == _DONE:
            continue
        path_stack = [start]
        while path_stack:
            current = path_stack[-1]
            if visited[current] == _NEW:
                visited[current] = _IN_PROGRESS
            child_to_check = None
            for d in downstream_of(current):
                if visited[d] == _IN_PROGRESS:
                    return current
                if visited[d] == _NEW:
                    child_to_check = d
                    break
            if child_to_check is None:
                visited[current] = _DONE
                path_stack.pop()
            else:
                path_stack.append(child_to_check)
    return None


CYCLE_CHILDREN = children_of(CYCLE_EDGES)
STUCK = kahn_leftover(NODES, CYCLE_EDGES)
FAULTY_TASK = detect_cycle(NODES, lambda t: CYCLE_CHILDREN.get(t, []))

assert STUCK == ["B", "C", "D"]  # Kahn: the whole cycle, not which edge closes it
assert FAULTY_TASK == "C"  # DFS: the one node whose edge (C->B) closes the cycle


if __name__ == "__main__":
    print("default weights (A,W,N):", DEFAULT_WEIGHT["A"], DEFAULT_WEIGHT["W"], DEFAULT_WEIGHT["N"])
    print("critical weights (A,W,N):", CRITICAL_WEIGHT["A"], CRITICAL_WEIGHT["W"], CRITICAL_WEIGHT["N"])
    print("A vs W alone: default order starts", pair_order_default[:2],
          "critical order starts", pair_order_critical[:2],
          "-- both finish D at", pair_finish_default["D"])
    print("A, W and N together: default order", order_default[:3], "-> D finishes at", finish_default["D"])
    print("A, W and N together: critical order", order_critical[:3], "-> D finishes at", finish_critical["D"])
    print("whole-DAG makespan, both rules:", MAKESPAN_DEFAULT, "=", MAKESPAN_CRITICAL)
    print("unlimited-worker critical path:", UNLIMITED_MAKESPAN)
    print("Graham bound at m=2:", GRAHAM_BOUND)
    print("Kahn's stuck set on the planted cycle:", STUCK)
    print("DFS names the faulty task:", FAULTY_TASK)
    print("ALL ASSERTS PASSED")
