# FACT-CHECK — Topological sort inside schedulers

| # | Claim | Checked against |
|---|---|---|
| 1 | `priority_weight` defaults to 1 and can be bumped to any integer; Airflow's default weighting method is `downstream` | Airflow "Priority Weights" docs, quoted word for word |
| 2 | The `downstream` rule's own documentation describes it as the aggregate sum of all downstream descendants | Airflow "Priority Weights" docs, quoted word for word |
| 3 | `_DownstreamPriorityWeightStrategy.get_weight` is exactly `own priority_weight + sum(descendant priority_weight for id in get_flat_relative_ids(upstream=False))` | `priority_strategy.py`, quoted word for word |
| 4 | `get_flat_relative_ids` returns a `set[str]`, so a descendant reached by two paths is counted once | `node.py`, quoted word for word (signature and docstring) |
| 5 | `detect_cycle` is an iterative three-colour DFS (`_NEW`/`_IN_PROGRESS`/`_DONE`), chosen over a recursive one because Python's stack-depth limit is easily reached on long chains, and it returns the one node whose edge closes the cycle | `cycle.py`, quoted word for word |
| 6 | `dag.check_cycle()` raises `AirflowDagCycleException(f"Cycle detected in Dag: {self.dag_id}. Faulty task: {faulty_task_id}")` before any task runs | `task-sdk dag.py`, quoted word for word |
| 7 | `check_cycle`'s real location on the `main` branch is `task-sdk/src/airflow/sdk/definitions/dag.py`, not `airflow-core/src/airflow/models/dag.py` | a first fetch of `airflow-core/.../models/dag.py` contained no match for `check_cycle` at all; a GitHub code search for `check_cycle` across the repo (`gh api search/code`) confirmed `task-sdk/.../definitions/dag.py` as the actual home, then verified directly by fetching that path and finding the method |
| 8 | `airflow.utils.dag_cycle_tester` is deprecated, since Airflow 3.1.0, in favour of `dag.check_cycle()` | `dag_cycle_tester.py`, quoted word for word (the module-level `warnings.warn` and the `.. deprecated:: 3.1.0` docstring directive) |
| 9 | The scheduler's own candidate-task-instance query orders by `-TI.priority_weight` first, then `DR.logical_date`, then `TI.region_index` | a direct `curl` of `scheduler_job_runner.py`'s raw file on `main` (4698 lines), line 1099; this project's `sources.mjs` fetch tool strips the line from its own cached copy (known bug, documented in SOURCES.md's entry for this source and in project memory `sources-mjs-html-strip-bug`) |
| 10 | Graham's list-scheduling bound: any list-scheduling algorithm is within `(2 − 1/m)` times the optimal makespan | Wikipedia "Multiprocessor scheduling", quoted word for word (the bound's exact value renders as stripped MathML on the fetched page, so the value is taken from the same Wikipedia page Chapter 34's `dsa.bin-packing-makespan-scheduling` already cited for the identical bound, not re-derived from a primary paper) |
| 11 | On the chapter's own 14-task DAG, the default (count-based) rule gives task `A` weight 4 and task `W` weight 6; the duration-weighted rule gives `A` weight 10 and `W` weight 6 | `examples.py`, `DEFAULT_WEIGHT`/`CRITICAL_WEIGHT`, asserted directly |
| 12 | With only `A`'s chain and `W`'s fan-out competing for 2 workers, the default rule starts `W` first and the duration-weighted rule starts `A` first, but task `D` (the chain's last task) finishes at step 10 under either rule | `examples.py`, `pair_order_default`/`pair_order_critical`/`pair_finish_default`/`pair_finish_critical`, asserted directly |
| 13 | Adding the second distractor chain `N` makes the two rules diverge: the default rule finishes `D` at step 10, the duration-weighted rule finishes `D` at step 11 | `examples.py`, `finish_default`/`finish_critical`, asserted directly |
| 14 | With unlimited workers, the makespan equals the critical path (the longest chain by summed duration), which on this DAG is 13, through the distractor chain `N`, not through the chain the topic tracks | `examples.py`, `critical_path_makespan`, asserted directly |
| 15 | Both measured 2-worker makespans (15 each) are within Graham's `(2 − 1/m)·optimal` bound (19.5, using the critical path 13 as a lower bound on the true optimum) | `examples.py`, `GRAHAM_BOUND`, asserted directly |
| 16 | On the chapter's DAG with a planted edge `C → B`, Kahn's algorithm leaves `{B, C, D}` stuck, while `detect_cycle` names `C` as the one faulty task | `examples.py`, `kahn_leftover`/`detect_cycle`, asserted directly |
| 17 | Concept ids `kahns-algorithm`, `depth-first-search`, `three-colour-cycle-detection`, `critical-path` and `topological-sort` are already real and live in `registry.ts` | `registry.ts`, grepped directly, `status: 'live'` confirmed at build time (2026-11-07); moved from CHAPTER.md's provisional `declared` list into this topic's `uses` |
| 18 | Topic 119's (`dsa.heaps-inside-compaction-shuffle`) handoff text matches this topic's bridge word for word | `registry.ts`, both read directly after this topic's own build merged `origin/main` |

## Red-team pass

- **Does the three-way DAG's divergence (step 13) depend on a fragile tie-break, or is it
  robust?** Checked: at the moment the two rules diverge, the weight gap between the top two
  ready tasks is never a tie (6 vs. 4 vs. 4 for the default rule; 13 vs. 10 vs. 6 for the
  duration rule at the same point) — the divergence comes from the ranking itself, not from how
  ties are broken.
- **Could the "the critical rule is worse here" claim actually just be an artifact of the
  specific tie-break rule (alphabetical task id) rather than the weighting rule itself?**
  Checked directly: re-running `schedule()` with the two candidates in each rule's queue never
  tied in priority weight at any contested point in this DAG (see above), so the tie-break
  never actually fires on the decisive comparisons; the divergence is from the weight values.
- **Is the two-entity case (step 12, no divergence) cherry-picked, or does it generalize?**
  Not claimed to generalize — `OUTLINE.md`'s "Changes from the chapter plan" documents the
  parameter sweep (chain duration, fan-out size and duration, worker count 1–2) that found no
  divergent configuration for the two-entity case, and the reel and post-notes both state this
  as a measured finding on one shape of DAG, not a general property of list scheduling.
- **Does citing `scheduler_job_runner.py`'s `order_by` line by direct `curl` rather than through
  `sources.mjs check` weaken the sourcing?** The line is verified against the raw GitHub file at
  a stated commit-equivalent (`main` branch HEAD at fetch time) and by exact line number; the
  alternative — quoting it through `SOURCES.md` — would fail the project's own automated check
  (confirmed: it does, since the fetch tool's own re-fetch drops the line), so stating it as
  read-but-not-quotable is the accurate representation, not a shortcut around verification.

## Corrections applied

1. `check_cycle`'s source file was initially assumed to be
   `airflow-core/src/airflow/models/dag.py` (a reasonable guess from the class name); a fetch of
   that path contained no match for `check_cycle` at all. A GitHub code search located the real
   file, `task-sdk/src/airflow/sdk/definitions/dag.py` — matching CHAPTER.md's own citation
   ("task-sdk `dag.py`"), which the first guess had missed. No quote was built on the wrong path
   before the correction.
2. CHAPTER.md's hook, read literally as a two-entity comparison (one chain against one
   fan-out), was found by direct simulation to never produce a different finish time for the
   watched chain across a swept range of parameters. Rather than force a divergence into that
   exact pair, the topic reports the non-divergence as a measured step (6, 12) and introduces a
   second distractor branch to meet CHAPTER.md's explicit requirement for a genuine, measured
   counterexample (claim #13, OUTLINE.md's "Changes from the chapter plan").
