"""Executed truth for the graph algorithms for pipeline DAGs reel.

Checks the numbers the reel shows, by computing them over the shop pipeline rather than
restating them from memory.
"""

import graphlib
from collections import deque

EDGES = [
    ("ingest_events", "clean"),
    ("clean", "load_orders"),
    ("clean", "events_metrics"),
    ("load_orders", "daily_revenue"),
    ("load_customers", "daily_revenue"),
    ("daily_revenue", "publish"),
    ("events_metrics", "publish"),
]
DURATION = {
    "ingest_events": 20, "load_customers": 5, "clean": 15,
    "load_orders": 10, "events_metrics": 25, "daily_revenue": 8, "publish": 2,
}

V = len(DURATION)
E = len(EDGES)
assert V == 7 and E == 7

succ = {v: [] for v in DURATION}
pred = {v: [] for v in DURATION}
for a, b in EDGES:
    succ[a].append(b)
    pred[b].append(a)

# -- In-degree 0: the roots that start first ----------------------------------------------------
roots = [v for v in DURATION if len(pred[v]) == 0]
assert sorted(roots) == ["ingest_events", "load_customers"]
assert len(pred["ingest_events"]) == 0


def reachable(start, graph):
    seen, q = set(), deque([start])
    while q:
        v = q.popleft()
        for w in graph[v]:
            if w not in seen:
                seen.add(w)
                q.append(w)
    return seen


downstream_of_clean = reachable("clean", succ)
assert downstream_of_clean == {"load_orders", "events_metrics", "daily_revenue", "publish"}
upstream_of_daily_revenue = reachable("daily_revenue", pred)
assert upstream_of_daily_revenue == {"ingest_events", "clean", "load_orders", "load_customers"}

# -- Kahn's algorithm, batched into waves --------------------------------------------------------
ts = graphlib.TopologicalSorter({v: set(pred[v]) for v in DURATION})
ts.prepare()
waves = []
while ts.is_active():
    ready = ts.get_ready()
    waves.append(sorted(ready))
    ts.done(*ready)
assert len(waves) == 5

# -- Critical path: node-weighted longest path in topological order -----------------------------
order = list(graphlib.TopologicalSorter({v: set(pred[v]) for v in DURATION}).static_order())
finish, came_from = {}, {}
for v in order:
    best = max(((finish[u], u) for u in pred[v]), default=(0, None))
    finish[v] = DURATION[v] + best[0]
    came_from[v] = best[1]
end = max(finish, key=finish.get)
assert end == "publish"
assert finish["publish"] == 62  # the metrics branch is critical

revenue_path_total = DURATION["ingest_events"] + DURATION["clean"] + DURATION["load_orders"] + DURATION["daily_revenue"] + DURATION["publish"]
assert revenue_path_total == 55

metrics_path_total = DURATION["ingest_events"] + DURATION["clean"] + DURATION["events_metrics"] + DURATION["publish"]
assert metrics_path_total == 62
assert metrics_path_total > revenue_path_total  # metrics is the critical path

# -- Slack: speeding up a task off the critical path doesn't move the finish time ---------------
halved = DURATION.copy()
halved["load_orders"] = DURATION["load_orders"] // 2  # "twice as fast"
order2 = list(graphlib.TopologicalSorter({v: set(pred[v]) for v in DURATION}).static_order())
finish2 = {}
for v in order2:
    best = max((finish2[u] for u in pred[v]), default=0)
    finish2[v] = halved[v] + best
assert finish2["publish"] == finish["publish"]  # the pipeline finish time doesn't change

# -- A cycle makes Kahn's queue stall and graphlib raise -----------------------------------------
cyclic_pred = {v: set(pred[v]) for v in DURATION}
cyclic_pred["ingest_events"] = cyclic_pred["ingest_events"] | {"publish"}
try:
    graphlib.TopologicalSorter(cyclic_pred).prepare()
    raise AssertionError("expected a CycleError")
except graphlib.CycleError:
    pass

print("graph-algorithms-pipeline-dags examples: all numbers check out")
