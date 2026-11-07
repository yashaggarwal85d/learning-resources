import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This chapter's fourth topic: the same ready-priority-queue shape the heaps topic just left
// behind, run over tasks and dependencies instead of sorted streams, with a worker limit and a
// priority rule read straight from a real orchestrator's source. Every number is computed in
// examples.py; every system claim is a word-for-word quote in SOURCES.md, or stated as
// read-but-not-quotable where that file notes it.

const reel: Reel = {
  steps: [
    {
      title: 'An orchestrator holds four thousand tasks, two hundred of them ready to run, and thirty-two free worker slots. Which thirty-two run first decides how long the whole pipeline takes. By default, Airflow gives each task a weight equal to its own weight plus the weight of everything below it, so the task with the most things below it goes first. Predict: for a task with a three-task chain below it and a task with a five-task fan-out below it, which does the default rule run first, and which one finishes the pipeline sooner?',
      body: <>Two tasks, two shapes below them. Which runs first, and which finishes sooner?</>,
      duration: 6.5,
      fig: 'OrchestratorHook',
      predict: {
        options: [
          { label: 'The fan-out runs first by default, and that also finishes the chain sooner' },
          { label: 'The fan-out runs first by default, but the chain finishes at the same time either way', correct: true },
          { label: 'The chain runs first by default, because it is the longer pipeline' },
        ],
        explain: (
          <>
            The default rule counts tasks below, not chain length, so the five-task fan-out
            outranks the three-task chain and runs first. But with only these two competing for
            workers, there is enough slack that the chain finishes at the same time regardless of
            which one goes first — order changed, the pipeline's finish time did not.
          </>
        ),
      },
      Visual: S.OrchestratorHook,
    },
    {
      title: "Kahn's algorithm, the textbook underneath every scheduler: each task starts with an in-degree, the count of unfinished upstream tasks. A task is ready the moment its in-degree reaches zero. Pop a ready task, decrement its children's in-degree, and push any child that just reached zero. Nothing here is new; a real scheduler's graph is simply live, not static.",
      body: <>In-degree counters, a ready set, pop and decrement. The textbook algorithm.</>,
      duration: 5.5,
      fig: 'KahnRecap',
      Visual: S.KahnRecap,
    },
    {
      title: "The chapter's own DAG, drawn left to right by duration: a critical chain of four tasks, a wide fan-out off a separate head task, and a second, narrower chain that runs longer than either. Fourteen tasks in all, two workers, exactly the shape the rest of this topic measures.",
      body: <>Fourteen tasks: one chain to watch, one fan-out, one longer distractor chain.</>,
      duration: 6,
      fig: 'ChapterDag',
      Visual: S.ChapterDag,
    },
    {
      title: "Airflow's own documentation, read at research time: priority_weight defines priorities in the executor queue, defaults to one, and can be bumped to any integer. By default, the weighting method is downstream, described in the same page as the aggregate sum of all downstream descendants.",
      body: <>priority_weight defaults to one per task; the default rule sums descendants.</>,
      duration: 5.5,
      fig: 'AirflowWeightDocs',
      Visual: S.AirflowWeightDocs,
    },
    {
      title: "The exact formula, read from priority_strategy.py: a task's own weight plus the weight of every id returned by get_flat_relative_ids with upstream set to false. That method returns a set of strings, read from node.py, so a descendant reachable by two different routes is counted once, never once per route.",
      body: <>own weight plus every downstream id in a set — each descendant counted once.</>,
      duration: 6,
      fig: 'DownstreamFormula',
      takeaway: 'The default rule counts how much depends on a task, not how long the chain below it runs.',
      Visual: S.DownstreamFormula,
    },
    {
      title: "The prediction, measured: the chain's own head task carries a default weight of four; the fan-out's head carries six. Scheduled on two workers, the fan-out starts first, exactly as the rule predicts. Yet the chain's own last task finishes at the same step either way: ten.",
      body: <>Fan-out starts first by default weight. The chain's own finish time: identical.</>,
      duration: 6,
      fig: 'PredictionMeasured',
      Visual: S.PredictionMeasured,
    },
    {
      title: "Set each task's priority_weight to its own duration instead of one, and the same formula becomes a sum over descendant durations, not descendant counts. The chain's head now carries ten, ahead of the fan-out's six: this is what a user reaching for a critical-path order actually has to do, since Airflow has no separate critical-path rule.",
      body: <>Weight set to duration flips this one ranking: chain now outranks fan-out.</>,
      duration: 6,
      fig: 'DurationWeighted',
      Visual: S.DurationWeighted,
    },
    {
      title: "Add the second, narrower chain competing for the same two workers, and the two rules genuinely diverge. The plain count-based rule still finishes the watched chain's last task at ten. The duration-weighted rule, measured on this exact DAG, finishes it at eleven: worse, not better. One measured DAG, not a general claim about either rule.",
      body: <>With a third branch added, duration-weighting finishes the chain later: eleven, not ten.</>,
      duration: 6.5,
      fig: 'ThreeWayDivergence',
      takeaway: "Weighting by duration is not always closer to the critical path than counting descendants; on this DAG it measured worse.",
      Visual: S.ThreeWayDivergence,
    },
    {
      title: 'With no worker limit at all, the makespan is exactly the critical path: the longest chain of summed durations through the whole graph. On this DAG that longest chain runs through the narrower distractor, not the chain the rest of this topic has been watching, and it finishes later than that watched chain ever does alone.',
      body: <>Unlimited workers: the makespan is the longest chain by duration, not the watched one.</>,
      duration: 5.5,
      fig: 'UnlimitedCriticalPath',
      Visual: S.UnlimitedCriticalPath,
    },
    {
      title: "Graham's bound, proved for any list-scheduling order under a fixed worker count: the makespan is at most two minus one over the worker count, times the true optimum. Both measured schedules on this DAG, default and duration-weighted alike, land well inside that bound: a guarantee that holds regardless of which ready task a rule picks first.",
      body: <>Both measured schedules land inside Graham's two-minus-one-over-m guarantee.</>,
      duration: 5.5,
      fig: 'GrahamBound',
      Visual: S.GrahamBound,
    },
    {
      title: "A planted edge closes a cycle in the chapter's own DAG. Kahn's algorithm, run to the end, leaves a set of tasks whose in-degree never reaches zero. Airflow's own detect_cycle, an iterative three-colour depth-first search, instead tracks the exact path it is currently following. Predict: when the cycle is found, which of the two names the single edge that closes the loop, and which only shows the whole stuck group?",
      body: <>Two ways to detect the same cycle. Only one of them can point at the closing edge.</>,
      duration: 6.5,
      fig: 'CycleRejection',
      predict: {
        options: [
          { label: "Kahn's algorithm names the one faulty edge; the depth-first search shows the stuck group" },
          { label: "The depth-first search names the one faulty edge; Kahn's algorithm shows the whole stuck group", correct: true },
          { label: 'Neither names an edge; both only report that a cycle exists somewhere' },
        ],
        explain: (
          <>
            Kahn's algorithm never tracks a path, only counts; when it runs out of ready tasks, it
            can only report the whole set stuck behind the cycle, not which edge closed it. The
            depth-first search is tracking its current path explicitly, so the instant it revisits
            a node already on that path, it has found the exact edge — and returns that one node.
            Airflow's check_cycle calls this method before any task runs, and the older, now-deprecated
            module just calls the same method.
          </>
        ),
      },
      takeaway: "Kahn's leftover nodes show which tasks are stuck; a depth-first search names the single edge that closes the cycle.",
      Visual: S.CycleRejection,
    },
    {
      title: 'A scheduler consumes a graph that is acyclic by construction, because a cycle was rejected before the first task started. The next structure works on a graph built the other way round: edges arrive one at a time from a matching step, nobody knows the components in advance, and the question is which records have ended up in the same group. Union-find inside entity resolution, next.',
      body: <>Next: a graph built edge by edge, with no components known in advance.</>,
      duration: 5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
