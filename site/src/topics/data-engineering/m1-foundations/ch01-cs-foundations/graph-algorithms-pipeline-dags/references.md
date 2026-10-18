Last verified: 2026-10-13.

- A. B. Kahn, "Topological sorting of large networks", *Communications of the ACM* 5(11), 1962, pp. 558–562. [doi:10.1145/368996.369025](https://doi.org/10.1145/368996.369025) — the in-degree / ready-queue algorithm.
- J. E. Kelley and M. R. Walker, "Critical-Path Planning and Scheduling", Proceedings of the Eastern Joint Computer Conference, 1959. [doi:10.1145/1460299.1460318](https://doi.org/10.1145/1460299.1460318) — the critical path as a longest-path problem.
- Python documentation, [`graphlib` — Functionality to operate with graph-like structures](https://docs.python.org/3/library/graphlib.html) (`TopologicalSorter`, `prepare`, `get_ready`, `done`, `static_order`, `CycleError`). Checked against the Python 3.15 docs.
- NetworkX documentation, [Directed Acyclic Graphs](https://networkx.org/documentation/stable/reference/algorithms/dag.html) (`topological_sort`, `topological_generations`, `descendants`, `ancestors`, `dag_longest_path`, `is_directed_acyclic_graph`). NetworkX 3.7.
- Apache Airflow documentation, [DAGs](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/dags.html) — "The term 'DAG' comes from the mathematical concept 'directed acyclic graph'", and the task-dependency model.
- T. H. Cormen, C. E. Leiserson, R. L. Rivest and C. Stein, *Introduction to Algorithms*, 4th ed., 2022, ch. 20 (elementary graph algorithms: BFS, DFS, topological sort via DFS finishing times, and strongly connected components) — framing (a book). The O(V + E) bounds for traversal, topological sort and longest-path-in-a-DAG, and the NP-hardness of longest path in a general graph, are standard results stated there.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=graph-algorithms-pipeline-dags:%20).
