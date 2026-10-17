import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every orchestrator runs the same three graph algorithms underneath: a topological sort, a cycle
// check and a longest-path walk. Running example: the shop pipeline, 7 tasks, 7 dependencies.
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'The pipeline is a graph',
      body: (
        <>
          Model each task as a vertex and each &ldquo;must finish before&rdquo; dependency as a directed edge. The shop pipeline has <b>7</b>{' '}
          tasks and <b>7</b> dependencies: ingest, clean, two branches, then publish.
        </>
      ),
      duration: 3.4,
      Visual: S.Problem,
    },
    {
      title: 'Directed and acyclic: a DAG',
      body: (
        <>
          Edges have a direction, and no path may loop back on itself: a <b>directed acyclic graph</b>. That single shape is what every
          orchestrator, from <code>cron</code> to Airflow, assumes before it schedules anything.
        </>
      ),
      duration: 3.4,
      Visual: S.DagDefinition,
    },
    {
      title: 'Predict: what reruns after clean changes?',
      body: <>The cleaning task changes. Which other tasks must rerun?</>,
      duration: 1.4,
      predict: {
        options: [
          { label: 'Only clean itself' },
          { label: 'Everything clean feeds, directly or transitively', correct: true },
          { label: 'Every task in the pipeline' },
          { label: 'Only its immediate successor' },
        ],
        explain: (
          <>
            Everything reachable by walking the edges forward from clean: load_orders, events_metrics, daily_revenue and publish. Ingest and
            load_customers sit above the change, untouched.
          </>
        ),
      },
      Visual: S.DownstreamPredict,
    },
    {
      title: 'Forward or backward, one traversal each',
      body: (
        <>
          Walking edges forward from a task finds its <b>descendants</b>, what must rerun. Walking the same edges backward finds its{' '}
          <b>ancestors</b>, what a backfill depends on. Each is one breadth-first or depth-first traversal, visiting every vertex and edge once.
        </>
      ),
      duration: 4,
      Visual: S.ReachabilityTraversal,
    },
    {
      title: 'Kahn’s algorithm: zero in-degree runs first',
      body: (
        <>
          Count each task&rsquo;s unmet dependencies, its <b>in-degree</b>. Tasks with in-degree <b>0</b> start first; as each finishes, its
          successors&rsquo; counts drop, and whichever hits zero joins the ready queue next. Batch a whole ready queue at once and you get a{' '}
          <b>wave</b> of parallel work.
        </>
      ),
      duration: 4.2,
      Visual: S.KahnAlgorithm,
    },
    {
      title: 'Predict: how many waves to run them all?',
      body: <>Ingest and load_customers start wave one, with nothing to wait on. How many waves does the whole shop pipeline take?</>,
      duration: 1.6,
      predict: {
        options: [{ label: 'Three waves' }, { label: 'Five waves', correct: true }, { label: 'Seven waves' }, { label: 'One wave' }],
        explain: (
          <>
            Five: the two roots, then clean, then load_orders and events_metrics together, then daily_revenue, then publish. The width of each
            wave is the pipeline&rsquo;s available parallelism at that moment.
          </>
        ),
      },
      Visual: S.WavesPredict,
    },
    {
      title: 'A cycle means no order exists',
      body: (
        <>
          If a loop sneaks in, no task in the loop can be first: Kahn&rsquo;s queue stalls with vertices stuck above zero, and a depth-first walk
          notices the instant it steps back onto a task already on its own path. An orchestrator checks this before anything runs, turning a
          pipeline that would have hung overnight into an import-time error instead.
        </>
      ),
      duration: 4.2,
      Visual: S.CycleDetection,
    },
    {
      title: 'The critical path, not the task sum',
      body: (
        <>
          With unlimited workers, the pipeline&rsquo;s finish time is not the sum of every task, nor the longest chain of tasks: it is the longest
          path weighted by duration, the <b>critical path</b>. Finding the longest path is normally hard, but a DAG&rsquo;s topological order turns
          it into one linear sweep.
        </>
      ),
      duration: 4,
      Visual: S.CriticalPathIntro,
    },
    {
      title: 'Predict: speed up a task off the path',
      body: (
        <>
          The revenue branch finishes at <b>55</b> minutes; the metrics branch, the critical one, finishes at <b>62</b>. You make load_orders
          twice as fast. How much sooner does the whole pipeline finish?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'A few minutes sooner' },
          { label: 'Not one minute sooner', correct: true },
          { label: 'Exactly as much as you saved' },
          { label: 'It depends on the workers available' },
        ],
        explain: (
          <>
            Not one minute: load_orders sits on the revenue branch, which has slack and was never setting the finish time. Only speeding up a task
            on the critical path moves the finish, and the path can shift once you cut it enough.
          </>
        ),
      },
      Visual: S.SlackPredict,
    },
    {
      title: 'Back to the shop: order, cycle, clock, split',
      body: (
        <>
          Order the tasks, catch the cycle, trace what reruns and what a backfill needs, find what sets the clock, and split independent work
          apart. Every one of these questions is linear in the size of the graph.
        </>
      ),
      duration: 3.6,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
