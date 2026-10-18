---
id: de.graph-algorithms-pipeline-dags
title: Graph algorithms for pipeline DAGs
---

<section data-section="outcomes">

## After this topic you can

- Draw the shop's order pipeline as a directed acyclic graph and read a dependency off its edges.
- Order a pipeline's tasks with Kahn's algorithm, and release them in parallel waves the way a scheduler does.
- Find what must rerun **downstream** of a changed task, and what a **backfill** depends on **upstream**, with one traversal each.
- Detect a cycle, and say which task closed the loop and why an orchestrator refuses to run it.
- Find the **critical path** by task duration, name the one task worth speeding up, and say which tasks are slack and give nothing back.
- Split a set of jobs into independent sub-pipelines (connected components) that can be scheduled apart.

</section>

<section data-section="internals">

## A little deeper

### The pipeline is a graph

Every orchestrator, from `cron` with hand-written ordering to Airflow, Dagster or Spark's stage planner, is running the same three graph algorithms underneath: a topological sort to pick an order, a cycle check so the order exists, and a longest-path walk to know when the run will finish. This refresher is those algorithms on one small graph: the shop's order pipeline.

Model each **task** as a vertex and each dependency "A must finish before B starts" as a directed edge **A → B**. The graph is **directed** (dependencies have a direction) and must be **acyclic** (no task may, transitively, wait on itself) — a **directed acyclic graph**, or **DAG**. Write **V** for the number of vertices (tasks) and **E** for the number of edges (dependencies). All the costs below are in those two numbers.

The shop pipeline from the chapter's running example, with the side branches this topic adds (a customers-dimension load that `daily_revenue` joins against, and an `order_events` metrics branch that `publish` also waits on):

```
ingest_events ─▶ clean ─┬─▶ load_orders ───▶ daily_revenue ─▶ publish
                        │                         ▲              ▲
load_customers ─────────┼─────────────────────────┘              │
                        └─▶ events_metrics ───────────────────────┘
```

| Task | Depends on (predecessors) | In-degree | Duration (min) |
|---|---|---|---|
| `ingest_events` | — | 0 | 20 |
| `load_customers` | — | 0 | 5 |
| `clean` (`clean.py`) | `ingest_events` | 1 | 15 |
| `load_orders` | `clean` | 1 | 10 |
| `events_metrics` | `clean` | 1 | 25 |
| `daily_revenue` | `load_orders`, `load_customers` | 2 | 8 |
| `publish` | `daily_revenue`, `events_metrics` | 2 | 2 |

Here V = 7 and E = 7. The durations are illustrative values chosen for this example — the point is the method, not the minutes; your own numbers come from the task history. Two ways to store the graph: an **adjacency list** (each vertex keeps a list of its out-neighbours), which costs Θ(V + E) space and lets a traversal visit each edge once; or an **adjacency matrix**, Θ(V²), which is wasteful for the sparse graphs pipelines are (E is close to V, not V²). Pipelines use adjacency lists, and so does every algorithm below.

### Traversal: what is reachable, downstream and upstream

Two traversals visit every vertex reachable from a start, each edge once, in **O(V + E)** time: **breadth-first search** (BFS), which fans out level by level from a queue, and **depth-first search** (DFS), which plunges down one path from a stack (or the call stack) and backtracks. Both answer reachability; they differ in the order vertices come out and in what else they expose (BFS gives shortest edge-count distance in an unweighted graph; DFS classifies edges, which the cycle check uses below).

Two reachability questions dominate pipeline operations, and each is one traversal:

- **The downstream set** of a task — its **descendants** — is everything reachable by following edges forward. After `clean.py` changes, the downstream set of `clean` is `{load_orders, events_metrics, daily_revenue, publish}`: exactly the tasks that must rerun. `ingest_events` and `load_customers` are *not* in it, so a code change in `clean` never forces a re-ingest.
- **The upstream set** of a task — its **ancestors** — is everything that reaches it, found by the same traversal on the graph with every edge reversed. A **backfill** of `daily_revenue` depends on its upstream set `{ingest_events, clean, load_orders, load_customers}`: those must be present and correct before the backfill is meaningful. `events_metrics` and `publish` are downstream of `daily_revenue`, not upstream, so they play no part in its backfill.

Reversing edges is the whole trick: *descendants on G = ancestors on the reversed graph*. NetworkX exposes both directly as `descendants(G, v)` and `ancestors(G, v)`.

### Topological order, and Kahn's algorithm

A **topological order** is a linear ordering of the vertices such that for every edge u → v, u comes before v. It is a valid execution order for a single worker. It exists **if and only if** the graph is acyclic, which is why the sort and the cycle check are the same algorithm run two ways.

**Kahn's algorithm** (1962) builds the order from in-degrees:

1. Compute the **in-degree** (number of unmet dependencies) of every vertex. Put every vertex with in-degree 0 into a **ready queue**.
2. Pop a ready vertex, append it to the output, and decrement the in-degree of each of its out-neighbours. Any neighbour whose in-degree hits 0 joins the ready queue.
3. Repeat until the queue is empty.

Each vertex enters and leaves the queue once and each edge is relaxed once, so Kahn's algorithm is **O(V + E)**. If the output holds fewer than V vertices when the queue empties, the leftovers form at least one cycle (see below).

The ready queue is where scheduling lives. If you treat each `get_ready` batch as a **wave** rather than popping one at a time, you get the maximum parallel schedule: every task whose dependencies are all done may start at once. On the shop DAG, with enough workers:

| Wave | Ready (all dependencies met) |
|---|---|
| 1 | `ingest_events`, `load_customers` |
| 2 | `clean` |
| 3 | `load_orders`, `events_metrics` |
| 4 | `daily_revenue` |
| 5 | `publish` |

These waves are *dependency* levels, not clock time — wave 1's two tasks have different durations and finish at different moments. Python's standard library ships exactly this as `graphlib.TopologicalSorter`. You give it a dict mapping each node to its **predecessors**, call `prepare()` (which checks for cycles), then loop: `get_ready()` returns the tuple of currently-runnable nodes, you dispatch them, and you call `done(node)` as each finishes, which unblocks its successors. `static_order()` is the single-worker convenience form. The predecessor-dict for the shop DAG:

```python
import graphlib

deps = {
    "clean":          {"ingest_events"},
    "load_orders":    {"clean"},
    "events_metrics": {"clean"},
    "daily_revenue":  {"load_orders", "load_customers"},
    "publish":        {"daily_revenue", "events_metrics"},
}
ts = graphlib.TopologicalSorter(deps)
print(tuple(ts.static_order()))
# e.g. ('ingest_events', 'load_customers', 'clean',
#       'load_orders', 'events_metrics', 'daily_revenue', 'publish')
```

Nodes named only as predecessors (`ingest_events`, `load_customers`) are added automatically with no dependencies of their own. The exact order within a wave is unspecified — any topological order is valid, and a graph usually has many.

### Cycle detection

A cycle makes a topological order impossible: if A → B → C → A, none of the three can be first. Two detectors, both **O(V + E)**:

- **Kahn's leftovers.** Run the algorithm; if it outputs fewer than V vertices, every vertex still carrying a positive in-degree sits on, or downstream of, a cycle. This is what `graphlib.TopologicalSorter.prepare()` reports: it raises `CycleError`, and the exception carries a list of nodes forming one cycle.
- **DFS back edges.** Colour each vertex white (unvisited), grey (on the current recursion stack) or black (finished). A DFS that follows an edge into a **grey** vertex has found a **back edge**, which closes a cycle; an edge into a black vertex is fine. This also gives you the offending edge, not just the node set.

An orchestrator runs one of these at parse time and refuses to schedule a cyclic graph — Airflow, for instance, treats "DAG" literally and rejects a graph with a loop rather than deadlocking at run time. Catching the cycle statically turns a 3 a.m. hang into an import error.

### The critical path

Give each task a duration. With unlimited workers, when does the whole pipeline finish? Not at the sum of all durations, and not at the longest *chain of tasks* — it is the **longest path weighted by duration**, the **critical path**. Compute the earliest finish of each vertex in topological order:

```
finish[v] = duration[v] + max( finish[u] for every predecessor u of v,  0 )
```

Because you process vertices in topological order, every predecessor's `finish` is already known, so this dynamic program is one pass: **O(V + E)**. The pipeline's finish time is the maximum `finish` over all vertices, and the path that realises it is the critical path.

> **Longest path is normally hard — a DAG is the exception.** In a general graph the longest simple path is NP-hard (it is at least as hard as the Hamiltonian path problem). The acyclicity of a DAG is what collapses it to a single linear-time sweep, because a topological order lets you solve subproblems in dependency order with no cycles to trap the recursion. This is the same observation behind the Critical Path Method (Kelley and Walker, 1959), still the backbone of project scheduling.

On the shop DAG, two paths reach `publish`:

- revenue: `ingest_events`(20) → `clean`(15) → `load_orders`(10) → `daily_revenue`(8) → `publish`(2) = **55 min**
- metrics: `ingest_events`(20) → `clean`(15) → `events_metrics`(25) → `publish`(2) = **62 min**

The critical path is the metrics branch, and the pipeline finishes in **62 minutes**. The lesson a scheduler teaches: `load_orders` and `daily_revenue` have **slack** — the revenue branch can slip up to 7 minutes before it becomes critical — so making them faster shortens nothing. The only task worth optimising is one *on* the critical path (`events_metrics`, or the shared prefix `ingest_events`/`clean`). Shave 10 minutes off `events_metrics` and the critical path moves to the revenue branch at 55 minutes; shaving further off `events_metrics` then does nothing. Critical paths shift as you cut them, so you re-find the path after each change.

NetworkX offers `dag_longest_path(G, weight=...)`, but note it weights **edges**, not nodes. To price task durations you either put each task's duration on its *outgoing* edges (with a virtual sink to catch the last task), or run the node-weighted DP above directly — the lab does the latter, which is clearer.

### Connected components

Two jobs that share no dependency, direct or transitive, belong to different **connected components** and can be scheduled, retried and backfilled independently. For a directed graph, the relevant notion for scheduling is **weak** connectivity: treat every edge as undirected and ask what clumps together. The shop DAG is one weakly connected component — `load_customers` has no edge to the ingest spine, but it joins the rest through `daily_revenue`. Add an unrelated `inventory_sync` job with no edge into the shop graph and you now have **two** components; a scheduler can place them on separate workers, and a failure in one cannot block the other. Finding all components is one more O(V + E) traversal (BFS/DFS from each unvisited vertex, or a union-find over the edges). Strongly connected components — the directed notion — matter for cyclic graphs; a correct DAG has none larger than a single vertex, which is itself a cheap cycle test.

### The costs, in one table

| Task on the graph | Algorithm | Time | Space |
|---|---|---|---|
| Reach / downstream set / upstream set | BFS or DFS (on G or reversed G) | O(V + E) | O(V) |
| Execution order | Kahn's algorithm (topological sort) | O(V + E) | O(V) |
| Parallel schedule (waves) | Kahn with batched ready set | O(V + E) | O(V) |
| Reject a cyclic graph | Kahn leftovers, or DFS back edge | O(V + E) | O(V) |
| Finish time / critical path | Longest-path DP in topological order | O(V + E) | O(V) |
| Independent sub-pipelines | Weakly-connected components | O(V + E) | O(V) |

Every pipeline question on this list is linear in the size of the graph. The graph is tiny next to the data flowing through it, so these algorithms are never the bottleneck — but getting the *order* wrong, or missing a cycle, costs a whole run.

</section>

<section data-section="lab">

## Try it

No chapter lab is hosted here (§1.3's lab lives in the hash-tables and external-sort topics). This is a short self-contained exercise: build the shop DAG, run all six algorithms over it, then break it.

```python
import graphlib
from collections import deque

# Edges A -> B mean "A must finish before B".
EDGES = [
    ("ingest_events", "clean"),
    ("clean", "load_orders"),
    ("clean", "events_metrics"),
    ("load_orders", "daily_revenue"),
    ("load_customers", "daily_revenue"),
    ("daily_revenue", "publish"),
    ("events_metrics", "publish"),
]
DURATION = {  # minutes, illustrative
    "ingest_events": 20, "load_customers": 5, "clean": 15,
    "load_orders": 10, "events_metrics": 25, "daily_revenue": 8, "publish": 2,
}

succ = {v: [] for v in DURATION}
pred = {v: [] for v in DURATION}
for a, b in EDGES:
    succ[a].append(b)
    pred[b].append(a)

def reachable(start, graph):
    seen, q = set(), deque([start])
    while q:
        v = q.popleft()
        for w in graph[v]:
            if w not in seen:
                seen.add(w); q.append(w)
    return seen

print("downstream of clean:", reachable("clean", succ))
print("upstream of daily_revenue:", reachable("daily_revenue", pred))

# Parallel waves (Kahn, batched) via the standard library.
ts = graphlib.TopologicalSorter({v: set(pred[v]) for v in DURATION})
ts.prepare()
wave = 0
while ts.is_active():
    wave += 1
    ready = ts.get_ready()
    print(f"wave {wave}: {sorted(ready)}")
    ts.done(*ready)

# Critical path by duration (node-weighted longest path).
order = list(graphlib.TopologicalSorter({v: set(pred[v]) for v in DURATION}).static_order())
finish, came_from = {}, {}
for v in order:
    best = max(((finish[u], u) for u in pred[v]), default=(0, None))
    finish[v] = DURATION[v] + best[0]
    came_from[v] = best[1]
end = max(finish, key=finish.get)
path = []
cur = end
while cur is not None:
    path.append(cur); cur = came_from[cur]
print("finish time:", finish[end], "min; critical path:", list(reversed(path)))
```

Expected: the downstream set of `clean` is the four tasks below it; the upstream set of `daily_revenue` is the four above it; five waves; and a critical path of `ingest_events → clean → events_metrics → publish` at **62 minutes**.

**Break it.** Add the edge `("publish", "ingest_events")` and rebuild. `TopologicalSorter.prepare()` now raises `graphlib.CycleError`, and the exception's second argument lists one cycle — this is exactly the error an orchestrator shows you at import time instead of hanging at run time. Then **profile the schedule**: cut `events_metrics` from 25 to 10 minutes and recompute — the critical path jumps to the revenue branch at 55 minutes, proving that past a point, speeding up the metrics branch buys nothing. Finally, drop every edge touching `load_customers` and `daily_revenue` into a second disconnected job and confirm it forms its own component.

</section>

<section data-section="production">

## In production

A review checklist for pipeline graphs — the questions these six algorithms let you answer before a run, not after a page:

- **Is it acyclic?** A cycle is a design error, not a runtime one. Catch it at parse/CI time (every orchestrator does; `graphlib.prepare()` does). A cycle usually means a task consumes something it also produces — split it or break the false dependency.
- **What is my blast radius?** Before shipping a change to a task, compute its downstream set. That is the set of tables that go stale and the jobs that must rerun. Tools like dbt build this graph from `ref()` calls and expose exactly `descendants` and `ancestors` as "downstream" and "upstream" selectors.
- **What does a backfill touch?** Before backfilling a table, compute its upstream set and confirm every ancestor is present for the window you are backfilling. Backfilling a node whose ancestors are missing or stale silently produces wrong numbers.
- **Where is the critical path, and is it where I think?** The slowest *task* is not always on the critical path, and a task on the critical path may be fast. Re-derive the path from recent durations, optimise only tasks on it, and re-derive again — the path moves as you cut it. Everything off the path has slack and is wasted engineering effort to speed up.
- **Can this be split?** Independent components can run on separate workers, fail independently and be owned by different teams. If two logically unrelated pipelines share a component, find the accidental edge.
- **Does the schedule respect the waves, or serialise needlessly?** The maximum parallelism is the width of the Kahn waves. A scheduler that runs a valid *linear* topological order leaves parallelism on the table; one that releases whole ready-sets uses it. Real schedulers add worker limits and priorities on top, but the dependency waves are the ceiling.

A caution the graph does not capture: these costs assume durations are independent and workers unlimited. With a fixed worker pool, the finish time is a scheduling problem (list scheduling against the critical path), and with resource contention — two tasks hammering the same database — real durations stretch. The critical path is the *floor*; it tells you the best case and which task sets it.

</section>

<section data-section="next">

## Where this goes next

The tasks of a DAG run on many machines. Next: what the network between them costs, in bandwidth, latency and where the data lives.

</section>
