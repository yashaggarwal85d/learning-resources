# Outline — Topological sort inside schedulers

## Outcomes (from CHAPTER.md)

1. Run Kahn's algorithm as a scheduler: in-degree counters, a ready priority queue, a worker
   limit, and report the makespan and the critical path of a given DAG.
2. Compute Airflow's `downstream` priority weight for each task of a DAG and show a case where
   it orders ready tasks differently from the critical path, and what that costs.
3. Explain why a scheduler rejects cycles at load time and which of Kahn or DFS names the
   faulty task.

## Storyboard (12 steps)

1. **Hook.** An orchestrator holds 4,000 tasks, 200 ready, 32 free slots — which 32 run first
   decides how long the pipeline takes. Predict: for a task with a three-task chain below it
   and a task with a five-task fan-out below it, which does the default rule run first, and
   which finishes the pipeline sooner?
2. **Kahn's algorithm recap.** In-degree counters, a ready set, pop the ready task, decrement
   its children's in-degree, repeat — the textbook algorithm the whole topic sits on top of.
3. **The chapter's DAG.** Fourteen tasks drawn left to right by duration: the critical chain
   A→B→C→D, the fan-out W (five short children), and a second distractor N (a narrower,
   longer chain of three).
4. **Airflow's weight rule, read from source.** `priority_weight` default 1, bumped per task;
   `weight_rule` default `downstream`; the docs' own description, "the aggregate sum of all
   downstream descendants."
5. **The exact formula.** `_DownstreamPriorityWeightStrategy.get_weight`: own weight plus the
   weight of every id in `get_flat_relative_ids(upstream=False)` — a `set[str]`, so a
   descendant on two paths counts once, not twice.
6. **Predict's answer, measured.** Default weight: A=4, W=6 — the fan-out outranks the chain,
   as predicted. Scheduled on 2 workers, W runs first — but the chain's own task D finishes at
   the same time (10) either way. Order changed; the pipeline's finish time didn't.
7. **Weight set to duration ("critical").** Same rule, `priority_weight` set to each task's own
   duration instead of 1. A=10, W=6 now — the ranking between this one pair flips.
8. **Add the second distractor N, and the two rules genuinely diverge.** With N in the mix,
   default-weight finishes D at 10; critical-weight finishes D at 11 — *worse*, not better, on
   this one measured DAG. Not a general claim.
9. **Unlimited workers and the critical path.** With no worker limit, the makespan is the
   longest chain by duration (13, via N — not the chain the topic has been watching, 10).
10. **Graham's bound.** Any ready-queue order under m workers is within (2 − 1/m)·optimal of
    the true optimum; measured makespan (15) checked against the bound (19.5) at m=2.
11. **Cycle rejection: Kahn vs DFS.** A planted edge C→B closes a cycle. Kahn's leftover
    in-degree names the whole stuck set {B,C,D}; the iterative three-colour DFS
    (`detect_cycle`) names the one faulty task, C, whose edge closes it. `dag.check_cycle()`
    raises before anything runs; the older `dag_cycle_tester` module is deprecated since 3.1.0.
12. **Recap / handoff.** A scheduler consumes a graph that is acyclic by construction. The next
    structure's graph is built the other way: edges arrive one at a time with no components
    known in advance. Union-find inside entity resolution, next.

## Concept ledger

- **Introduces:** `scheduler-ready-queue`, `priority-weight-rule`, `list-scheduling-bound`,
  `load-time-cycle-rejection`.
- **Uses:** `binary-heap`, `edge-list`, `directed-acyclic-graph`, `merging-iterator` (topic 119,
  contrast only), `queue`, `fifo`.
- **Declared, not yet built** (moved to `uses` once those chapters exist):
  `topological-sort`, `kahn-in-degree-queue`, `depth-first-search`, `back-edge-cycle-detection`,
  `critical-path`.

## Changes from the chapter plan

- CHAPTER.md's hook names a "task with one long chain of three tasks below it" (A) against "a
  fan-out of five short tasks below it" (W). A direct two-entity sweep of chain-length,
  fan-out-size, fan-out-duration and worker count (1–2) found **no configuration where the two
  weighting rules change the chain's own finish time** — with only this one pair contending for
  workers, there is enough slack that reordering them never changes when D finishes. Step 6
  reports this directly as a measured (non-)finding, rather than asserting a divergence the
  simple case doesn't have.
- To meet CHAPTER.md's requirement that "the builder constructs a DAG where the two rules order
  two ready tasks differently... and reports the finish time... sometimes worse," a second
  distractor branch (N, a narrower but longer chain) was added on top of the hook's pair. With
  all three competing for 2 workers, the two rules do diverge, and — measured, not assumed —
  the duration-weighted ("critical") rule finishes the topic's own tracked chain D *later*
  (11) than the plain count-based default rule (10). This is the concrete counterexample
  CHAPTER.md asks for; it is reported as one measured DAG, not a general property of either
  rule.
- `task-sdk/src/airflow/sdk/definitions/dag.py` (not `airflow-core/src/airflow/models/dag.py`)
  turned out to be `check_cycle`'s real home on the `main` branch read at research time; a
  first, incorrect guess at the path was corrected before any quote was built on it (confirmed
  by a GitHub code search once the wrong path's fetch contained no match at all).
- `scheduler_job_runner.py`'s `.order_by(-TI.priority_weight, DR.logical_date, TI.region_index)`
  line (CHAPTER.md's own citation) is real and verified by a direct `curl` of the raw file, but
  the project's `scripts/sources.mjs` fetch tool strips it from its own cached copy (a known
  bug: its HTML-tag-stripping regex treats any `<...>` span, including ones inside Python/C++
  source, as a tag to delete, and can span many lines). The fact is cited by exact line number
  against the directly-read raw file rather than quoted through `sources.mjs check`, which
  would re-fetch and fail against the same corrupted copy. See SOURCES.md's own note on this
  entry.
