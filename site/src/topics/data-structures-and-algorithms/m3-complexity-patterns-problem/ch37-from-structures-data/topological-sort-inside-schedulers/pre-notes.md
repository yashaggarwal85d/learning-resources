# Pre-notes — Topological sort inside schedulers

- **Task and dependency:** a unit of work and the edge that says one task must finish before
  another may start; the chapter's DAG is tasks and these edges.
- **In-degree:** the count of a task's unfinished upstream dependencies; a task is ready to run
  the moment this count reaches zero.
- **Ready task:** a task whose in-degree has reached zero and that is waiting for a free
  worker, held in the scheduler's ready queue.
- **Worker slot:** one unit of execution capacity; a fixed number of workers means only that
  many ready tasks can run at once, however many more are ready.
- **Makespan:** the time the whole DAG finishes — the last task's finish time under a given
  schedule and worker count.
- **Descendant:** any task reachable by following downstream edges from a given task, however
  many edges away.
- **Priority weight:** a number attached to a task that orders the ready queue; Airflow's
  default rule sums a task's own weight and every descendant's weight.
- **Cycle:** a path of dependency edges that returns to its own starting task, making the
  tasks on it mutually impossible to schedule; a scheduler rejects a DAG that has one.
