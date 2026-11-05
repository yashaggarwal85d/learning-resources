import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the work-span model (work, span, parallelism, the two laws, Brent's bound)
// built on one sum DAG, then the randomized work-stealing scheduler that meets a bound of the
// same shape with no central queue, as Blumofe and Leiserson analysed it. Every number is in
// examples.py: a greedy-scheduled DAG against Brent's bound at five worker counts, a merge
// sort's span and work read off their recurrences, and a discrete-event simulation of work
// stealing reporting real steal fractions.

const reel: Reel = {
  steps: [
    {
      title: 'The same program, run on one core and on sixteen cores, finishes about fourteen times faster. The same-sized sum, written as a loop, gets no faster at all, on any number of cores.',
      body: <>One program speeds up almost linearly; another, the same size, does not move at all.</>,
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Sixteen numbers summed as a balanced tree of additions, run with unlimited workers: how many steps does it take, and what is the most any machine could ever speed it up by?',
      body: <>Fifteen steps and unlimited speed-up, four steps and unlimited speed-up, four steps and a small fixed ceiling, or fifteen steps and a small fixed ceiling.</>,
      duration: 2.5,
      fig: 'PredictSumSpeedup',
      predict: {
        options: [
          { label: 'Fifteen steps, unlimited speed-up' },
          { label: 'Four steps, unlimited speed-up' },
          { label: 'Four steps, and a small fixed ceiling on speed-up', correct: true },
          { label: 'Fifteen steps, and a small fixed ceiling on speed-up' },
        ],
        explain: (
          <>
            The tree's longest chain is four additions deep, so unlimited workers finish in four steps — but that
            same chain caps how much speed-up is ever possible, however many workers join in.
          </>
        ),
      },
      Visual: S.PredictSumSpeedup,
    },
    {
      title: 'Work is the total number of additions — what one worker alone would take. Span is the longest chain of additions that must happen in order. Parallelism is work divided by span: the most speed-up any worker count can ever buy.',
      body: <>Work, span, and their ratio, read directly off the same tree.</>,
      duration: 4.5,
      fig: 'WorkSpanParallelism',
      Visual: S.WorkSpanParallelism,
    },
    {
      title: 'The identical additions, redrawn as one chain instead of a tree, have a span equal to their own work. Nothing about the operations changed — only the order they are allowed to run in.',
      body: <>Same additions, same count, but now every one depends on the last.</>,
      duration: 4,
      fig: 'ChainRedraw',
      Visual: S.ChainRedraw,
    },
    {
      title: 'A divide-and-conquer algorithm whose two halves run side by side has a span that adds the combine step to the span of one half, not both — they finish together. A merge sort with a sequential merge inherits its span from that one sequential step.',
      body: <>The span recurrence takes the larger half and adds the combine.</>,
      duration: 4.5,
      fig: 'SortSpanRecurrence',
      Visual: S.SortSpanRecurrence,
    },
    {
      title: 'Doubling the input almost exactly doubles that sort’s span, the signature of a cost that grows in a straight line — while the total work grows faster still, so the parallelism between them keeps climbing as the input grows, not stuck at some small ceiling.',
      body: <>Span grows in a straight line; work outgrows it, so parallelism keeps climbing.</>,
      duration: 4.5,
      fig: 'SortSpanMeasured',
      takeaway: 'A bigger input does not just cost more work here — it buys more parallelism too.',
      Visual: S.SortSpanMeasured,
    },
    {
      title: 'Two floors no schedule beats: workers finish no faster than the work shared evenly among them, and no schedule — not even with unlimited workers — beats the span itself, because that chain happens in order regardless.',
      body: <>The work law and the span law, both unconditional.</>,
      duration: 4.5,
      fig: 'TwoLaws',
      Visual: S.TwoLaws,
    },
    {
      title: 'A greedy schedule — one that never leaves a worker idle while a ready task waits — finishes within the work divided by the workers, plus the span. That guarantee holds for every greedy schedule, and lands within a factor of two of the best any schedule could possibly do.',
      body: <>Never idle while work is ready, and you are within a factor of two of optimal.</>,
      duration: 5,
      fig: 'BrentBoundReveal',
      Visual: S.BrentBoundReveal,
    },
    {
      title: 'The same sum DAG, greedily scheduled on one, a few, and many workers: the real step count always sits between the two laws’ floor and this bound — and once the worker count passes the span, more workers buy nothing further at all.',
      body: <>Measured step counts track the bound, then flatten at the span.</>,
      duration: 5,
      fig: 'BrentBoundMeasured',
      takeaway: 'Past a certain worker count, adding more workers stops helping — the span has already won.',
      Visual: S.BrentBoundMeasured,
    },
    {
      title: 'A scheduler with no central queue — every worker keeps only its own list of ready tasks. When a worker’s own list runs empty, what should it do?',
      body: <>Wait to be handed work, shut down, take from a random other worker, or always take from the one that started everything.</>,
      duration: 2.5,
      fig: 'PredictIdleWorker',
      predict: {
        options: [
          { label: 'Wait until it is handed the next task' },
          { label: 'Shut down until the whole computation restarts' },
          { label: 'Pick another worker at random and take a task from it', correct: true },
          { label: 'Always take from the worker that started the computation' },
        ],
        explain: (
          <>
            Picking a random worker to take work from — work stealing — needs no central coordinator and no
            designated source: any busy worker is a fair target.
          </>
        ),
      },
      Visual: S.PredictIdleWorker,
    },
    {
      title: 'Each worker owns a deque: it pushes and pops its own end, running depth-first exactly as a lone worker would. An idle worker becomes a thief, picking another worker at random and taking from the far end of that worker’s deque — the oldest task there, the one most likely to still carry work beneath it.',
      body: <>Owner works one end; a thief steals from the other, at random.</>,
      duration: 5,
      fig: 'WorkStealingReveal',
      Visual: S.WorkStealingReveal,
    },
    {
      title: 'For a fully strict computation — every dependency returning straight to its parent, the shape a plain recursive fork-and-join program already has — the expected running time on many workers is the work divided by the workers, plus a constant times the span: Brent’s bound again, reached with no coordinator at all.',
      body: <>The same bound shape, met without any central scheduling.</>,
      duration: 5,
      fig: 'WorkStealingBound',
      Visual: S.WorkStealingBound,
    },
    {
      title: 'A bigger version of the same tree, run through a simulation of this exact protocol: with one worker, nobody to steal from, so zero steals. As workers are added, the stolen share of the work rises — but stays a small fraction of the total, even with many workers running.',
      body: <>Steals rise with the worker count, but never dominate the work.</>,
      duration: 5,
      fig: 'StealsSimulated',
      Visual: S.StealsSimulated,
    },
    {
      title: 'Cilk is the language this scheduler was designed for. Rayon’s join runs this exact protocol in Rust, warning that blocking one half on the other inside it can deadlock. Tokio also steals from per-worker queues, but for tasks that wait on the network, not a fork-and-join chain of pure computation — a different point on the same design.',
      body: <>One algorithm, three real systems, each scoped to what it actually covers.</>,
      duration: 5.5,
      fig: 'RealSystems',
      Visual: S.RealSystems,
    },
    {
      title: 'The race between a deque’s owner and a thief for the very last task is a real synchronization problem with its own solution — not built here, and not needed to state the bound this topic already proved.',
      body: <>The owner-thief race is named, not built, in this topic.</>,
      duration: 4,
      fig: 'WhatWasNotBuilt',
      takeaway: 'A bound can be proved without yet building the low-level mechanism that makes it safe.',
      Visual: S.WhatWasNotBuilt,
    },
    {
      title: 'Work, span, and parallelism say how fast any number of cores on one machine can possibly go; work stealing is the scheduler that gets there with no central queue at all. Next: what happens once the data no longer fits on one machine.',
      body: <>One machine, fully analysed — next, many machines, and a new kind of cost.</>,
      duration: 4.5,
      fig: 'Recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
