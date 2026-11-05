# Sources — DAG shortest and longest paths

## Wikipedia — "Shortest path problem"

URL: https://en.wikipedia.org/wiki/Shortest_path_problem
Version: fetched 2026-11-05 (oldid=1381885415)

> An algorithm using topological sorting can solve the single-source shortest path problem in time Θ(E + V) in arbitrarily-weighted directed acyclic graphs.

Contents:
- The linear-time bound on relaxing in topological order, this topic's "relaxation in topological order in O(n + m)" clause.

## Wikipedia — "Topological sorting"

URL: https://en.wikipedia.org/wiki/Topological_sorting
Version: fetched 2026-11-05 (oldid=1380558942)

> The topological ordering can also be used to quickly compute shortest paths through a weighted directed acyclic graph.

> On a graph of n vertices and m edges, this algorithm takes Θ(n + m), i.e., linear, time.

> Topological sorting forms the basis of linear-time algorithms for finding the critical path of the project, a sequence of milestones and tasks that controls the length of the overall project schedule.

Contents:
- The single-pass mechanism's own statement and its linear-time bound restated independently of the first source — this topic's "relaxation in topological order in O(n + m)" clause.
- The handoff from topological order directly to critical-path scheduling — this topic's "longest path and critical path in schedules" clause.

## Wikipedia — "Longest path problem"

URL: https://en.wikipedia.org/wiki/Longest_path_problem
Version: fetched 2026-11-05 (oldid=1369805460)

> In contrast to the shortest path problem, which can be solved in polynomial time in graphs without negative-weight cycles, the longest path problem is NP-hard and the decision version of the problem, which asks whether a path exists of at least some given length, is NP-complete.

> However, it has a linear time solution for directed acyclic graphs, which has important applications in finding the critical path in scheduling problems.

> A longest path between two given vertices s and t in a weighted graph G is the same thing as a shortest path in a graph −G derived from G by changing every weight to its negation.

> But if G is a directed acyclic graph (DAG), then no negative cycles can be created, and a longest path in G can be found in linear time by applying a linear time algorithm for shortest paths in −G, which is also a directed acyclic graph.

> Find a topological ordering of the given DAG.

> For each vertex v of the DAG, in the topological ordering, compute the length of the longest path ending at v by looking at its incoming neighbors and adding one to the maximum length recorded for those neighbors. If v has no incoming neighbors, set the length of the longest path ending at v to zero.

> In such a graph, the longest path from the first milestone to the last one is the critical path, which describes the total time for completing the project.

Contents:
- The general-graph NP-hardness fact (stated, not proven, per this topic's own scope) and the DAG special case's linear-time solvability — this topic's "longest path and critical path in schedules" clause.
- The negation argument for why the trick (negate every weight, run the shortest-path pass) is only valid on an acyclic graph, and the topological-order procedure for computing the longest path directly without negation — this topic's own worked example and its correctness argument.
- The direct statement that a project's critical path is the longest path through its milestone graph — this topic's critical-path worked example.

## Wikipedia — "Critical path method"

URL: https://en.wikipedia.org/wiki/Critical_path_method
Version: fetched 2026-11-05 (oldid=1378074402)

> The critical path method (CPM), or critical path analysis (CPA), is an algorithm for scheduling a set of project activities.

> A critical path is determined by identifying the longest stretch of dependent activities and measuring the time

> Using these values, CPM calculates the longest path of planned activities to logical end points or to the end of the project, and the earliest and latest that each activity can start and finish without making the project longer.

> In project management, a critical path is the sequence of project network activities that adds up to the longest overall duration, regardless of whether that longest duration has float or not.

> The CPM is a project-modeling technique developed in the late 1950s by Morgan R. Walker of DuPont and James E. Kelley Jr. of Remington Rand.

Contents:
- The critical-path method's own definition and its restatement of "critical path = longest path" — this topic's critical-path worked example.
- The historical attribution (Walker, DuPont; Kelley, Remington Rand; late 1950s — the exact year 1959 appears only in the cited conference paper, not this lead-section attribution sentence, so this topic says "the late nineteen-fifties" rather than a specific year it cannot verify from the lead text itself).
