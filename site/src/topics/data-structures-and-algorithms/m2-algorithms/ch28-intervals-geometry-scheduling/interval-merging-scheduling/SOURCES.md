## Interval Scheduling (Kleinberg & Tardos, *Algorithm Design*, Kevin Wayne's lecture slides)

URL: https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/04GreedyAlgorithmsI.pdf
Version: revised lecture slides for *Algorithm Design* (Kleinberg & Tardos), Kevin Wayne, "Greedy Algorithms I"

> Job j starts at sj and finishes at fj.

> Two jobs are compatible if they don't overlap.

> Goal: find maximum subset of mutually compatible jobs.

> Consider jobs in some order, taking each job provided it's compatible
> with the ones already taken. Which rule is optimal?

> [Earliest start time] Consider jobs in ascending order of sj.

> [Earliest finish time] Consider jobs in ascending order of fj.

> [Shortest interval] Consider jobs in ascending order of fj – sj.

> SORT jobs by finish times and renumber so that f1 ≤ f2 ≤ … ≤ fn.

> Proposition. Can implement earliest-finish-time first in O(n log n) time.

> Theorem. The earliest-finish-time-first algorithm is optimal.

> Assume greedy is not optimal, and let's see what happens.

> Let i1, i2, ... ik denote set of jobs selected by greedy.

> Let j1, j2, ... jm denote set of jobs in an optimal solution with
i1 = j1, i2 = j2, ..., ir = jr for the largest possible value of r.

> Lecture j starts at sj and finishes at fj.

> Goal: find minimum number of classrooms to schedule all lectures
so that no two lectures occur at the same time in the same room.

> Def. The depth of a set of open intervals is the maximum number of
> intervals that contain any given point.
> Key observation. Number of classrooms needed ≥ depth.
> Q. Does minimum number of classrooms needed always equal depth?
> A. Yes! Moreover, earliest-start-time-first algorithm finds a schedule
> whose number of classrooms equals the depth.

> SORT lectures by start times and renumber so that s1 ≤ s2 ≤ … ≤ sn.

> Store classrooms in a priority queue (key = finish time of its last lecture).
> - to allocate a new classroom, INSERT classroom onto priority queue.
> - to schedule lecture j in classroom k, INCREASE-KEY of classroom k to fj.
> - to determine whether lecture j is compatible with any classroom,
> compare sj to FIND-MIN

> Total # of priority queue operations is O(n); each takes O(log n) time.

Contents: Greedy Algorithms I — coin changing; interval scheduling (problem statement, three
candidate greedy rules by quiz, earliest-finish-time-first algorithm and its O(n log n)
implementation, optimality proof by exchange/contradiction); interval partitioning (problem
statement, depth as a lower bound, earliest-start-time-first algorithm, its O(n log n)
priority-queue implementation, optimality proof); scheduling to minimize lateness; optimal
caching.

## Weighted Interval Scheduling (Kleinberg & Tardos, *Algorithm Design*, Kevin Wayne's lecture slides)

URL: https://www.cs.princeton.edu/~wayne/kleinberg-tardos/pdf/06DynamicProgrammingI.pdf
Version: revised lecture slides for *Algorithm Design* (Kleinberg & Tardos), Kevin Wayne, "Dynamic Programming I"

> Job j starts at sj, finishes at fj, and has weight wj > 0.

> Two jobs are compatible if they don't overlap.

> Goal: find max-weight subset of mutually compatible jobs.

> Recall. Greedy algorithm is correct if all weights are 1.
> Observation. Greedy algorithm fails spectacularly for weighted version.

> Convention. Jobs are in ascending order of finish time: f1 ≤ f2 ≤ . . . ≤ fn .
> Def. p( j) = largest index i < j such that job i is compatible with j.

> Def. OPT( j) = max weight of any subset of mutually compatible jobs for
> subproblem consisting only of jobs 1, 2, ..., j.
> Goal. OPT(n) = max weight of any subset of mutually compatible jobs.
> Case 1. OPT( j) does not select job j.

> Must be an optimal solution to problem consisting of remaining
> jobs 1, 2, ..., j – 1.

> Case 2. OPT( j) selects job j.

> Collect profit wj.

> Can't use incompatible jobs { p( j) + 1, p( j) + 2, ..., j – 1 }.

> Must include optimal solution to problem consisting of remaining
compatible jobs 1, 2, ..., p( j).

Contents: weighted interval scheduling problem statement; the counter-example on which
earliest-finish-time-first fails for weights; the convention sorting jobs by finish time;
the predecessor function p(j); the OPT(j) recurrence as a binary choice (skip job j vs. take
it and add w_j + OPT(p(j))); brute-force recursion; memoization; running time; reconstructing
the chosen set; bottom-up tabulation.

## Erickson, *Algorithms*, Chapter 4 "Greedy Algorithms"

URL: https://jeffe.cs.illinois.edu/teaching/algorithms/book/04-greedy.pdf
Version: free textbook PDF, Chapter 4 "Greedy Algorithms" (class scheduling / interval scheduling section)

> The greedy schedule is an optimal schedule.

Contents: the "greedy stays ahead" proof template for interval scheduling (the theorem and its
two proofs, one by induction on the class that finishes first, one by an exchange argument that
swaps each non-greedy choice for the greedy one without shrinking the schedule), read as a
second, independent source confirming the Kleinberg–Tardos exchange/contradiction argument
reaches the same conclusion (earliest-finish-time-first is optimal); used only to cross-check
the proof shape, no claim on screen is sourced to this file alone.

## PostgreSQL Documentation, "8.17. Range Types"

URL: https://www.postgresql.org/docs/current/rangetypes.html
Version: PostgreSQL 18 documentation (current stable docs as served, section 8.17)

> The two-argument form constructs a range in standard form (lower bound inclusive, upper bound exclusive), while the three-argument form constructs a range with bounds of the form specified by the third argument.

> The built-in range types int4range, int8range, and daterange all use a canonical form that includes the lower bound and excludes the upper bound; that is, [).

Contents: range type constructors, bound inclusivity, the canonical/standard form `[)` for the
built-in numeric and date range types, used to show that the half-open convention this topic
picks is the same one a real production database defaults to, not an arbitrary classroom choice.

## Apache Flink Documentation, "Windows" (DataStream API operators)

URL: https://nightlies.apache.org/flink/flink-docs-release-2.3/docs/dev/datastream/operators/windows/
Version: Flink 2.3.0 stable docs (page header confirms "v2.3.0")

> The session windows assigner groups elements by sessions of activity. Session windows do not overlap and do not have a fixed start and end time, in contrast to tumbling windows and sliding windows. Instead a session window closes when it does not receive elements for a certain period of time, i.e., when a gap of inactivity occurred.

> Since session windows do not have a fixed start and end, they are evaluated differently than tumbling and sliding windows. Internally, a session window operator creates a new window for each arriving record and merges windows together if they are closer to each other than the defined gap.

Contents: the session-window assigner's definition (gap of inactivity), the dynamic/static gap
configuration API, and the internal mechanics quoted above: every element starts in its own
window and windows merge when closer than the gap — exactly the merge-intervals pass this topic
teaches, used as the real-instance example (sessionization) in the topic's post-notes.
