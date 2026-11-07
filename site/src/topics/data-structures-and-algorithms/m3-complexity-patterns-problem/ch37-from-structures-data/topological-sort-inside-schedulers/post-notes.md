<section data-section="outcomes">

## What this topic leaves you able to do

Run Kahn's algorithm as a scheduler — in-degree counters, a ready priority queue, a fixed
worker count — and report its makespan against the DAG's critical path; compute Airflow's
`downstream` priority weight for a task and say precisely what it measures (how much depends
on it, not how long the chain below it runs); explain why a scheduler rejects a cycle at load
time, and which of Kahn or DFS can name the one edge responsible.

</section>

<section data-section="internals">

## Into the internals

### A weight computed once, not recomputed per step

`_DownstreamPriorityWeightStrategy.get_weight` reads `ti.task.priority_weight` and
`get_flat_relative_ids(upstream=False)` — both static facts about the DAG's shape, not about
what has run so far. The scheduler's own candidate query orders by this column directly
(`.order_by(-TI.priority_weight, ...)`); nothing about a task finishing early or late changes
another task's weight. A ready queue keyed by a weight computed once is the same shape as
Chapter 6's heap keyed by a fixed distance, just reused over a different kind of "smaller."

### A set, not a sum over paths

`get_flat_relative_ids` returns a `set[str]`. A descendant reachable by two different routes —
common once a DAG has any fan-in below a fan-out — is counted once in the `downstream` rule's
sum, never once per route. Without that one design choice, adding a redundant edge to a DAG
would silently inflate a task's priority with no change to the actual work depending on it.

### Kahn's leftover set versus one DFS edge

Both algorithms detect the same cycle; they answer different questions. Kahn's algorithm, run
to exhaustion, leaves every task on or downstream of a cycle stuck at a nonzero in-degree — the
whole affected set, with no way to tell which edge is the actual problem. The iterative
three-colour DFS in `detect_cycle` tracks the current path explicitly (`_IN_PROGRESS`), so the
instant it revisits a node already on that path, it has found the one edge that closes the
loop — and returns that node directly, not the set.

</section>

<section data-section="lab">

## The lab

`examples.py` builds one fourteen-task DAG: a four-task chain, a five-task fan-out, and a
second, longer three-task chain, and schedules it on two workers under both weighting rules.
The two rules order the fan-out and the chain's head differently, exactly as the chapter plan
asks — but with only that pair competing for workers, the chain's own last task finishes at
the same step under either rule (measured, not assumed). Adding the second chain as a third
competitor is what actually produces a measured divergence: the duration-weighted rule
finishes the watched chain one step later than the plain count-based rule does. Both measured
makespans are checked against Graham's `(2 − 1/m) · optimal` bound, and a planted cycle is
checked against both Kahn's leftover set and `detect_cycle`'s one named task.

</section>

<section data-section="production">

## In production

Airflow's actual ready-queue selection adds two more columns this topic leaves out: it is
additionally bounded by *slots* (pool capacity, so a ready task with no open slot still waits),
and ties on priority weight are broken by DAG run logical date, then by region index — a stable
order this topic's own tie-break (task id) only approximates. A real `priority_weight` is also
rarely left at its default of 1 on every task; this topic's "critical" rule is exactly what a
user has to set up by hand, since Airflow has no built-in critical-path weighting method.

</section>

<section data-section="frontier">

## At the frontier

Graham's bound, `(2 − 1/m) · optimal`, holds for *any* list-scheduling order, including the
worst one a greedy rule could pick — it is a guarantee, not a claim that either weighting rule
in this topic is close to optimal on every DAG. This topic's own measured DAG shows the gap
between "some bound holds" and "this rule is good": the duration-weighted rule, built
specifically to approximate the critical path, measured *worse* than the plain count-based
default on the one DAG built to test it.

</section>

<section data-section="questions">

## Questions worth sitting with

The chapter's DAG was small enough to schedule by hand-checkable simulation. Airflow's own
production ready-queue query also filters by DAG-run concurrency and per-DAG task limits before
it ever reaches the priority-weight ordering this topic reads. If a DAG run's own concurrency
limit meant only half the "ready" tasks in this topic's queue could actually be considered at
once, would the measured divergence between the two weighting rules get larger, smaller, or
stay the same?

</section>

<section data-section="next">

## Next

A scheduler consumes a graph that is acyclic by construction, because a cycle was rejected
before the first task started. The next structure works on a graph that is built the other way
round: edges arrive one at a time from a matching step, nobody knows the components in advance,
and the question is which records have ended up in the same group. Union-find inside entity
resolution, next.

</section>
