import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Work stealing (local queue, global queue, lifo slot, stealing half a queue) and cooperative
// budgeting (a bounded per-poll allowance of resource operations, and task::unconstrained's
// documented starvation risk), each measured directly on a real tokio runtime.
const reel: Reel = {
  steps: [
    {
      title: '200 tasks are all spawned from inside the one task that’s running block_on. Do they all run on that same one worker thread?',
      body: (
        <>
          Two hundred lightweight units of work, every one of them spawned by code running inside the single worker driving block_on.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes — that worker queued all of them itself' },
          { label: 'No — some get redistributed to other workers', correct: true },
          { label: 'Only if block_on itself yields' },
        ],
        explain: (
          <>
            No. Nothing scheduled them anywhere else directly — the only way they land on another thread is by being moved there after the fact.
          </>
        ),
      },
      Visual: S.StealPredict,
    },
    {
      title: 'No — idle workers steal from a busy one’s queue',
      body: (
        <>
          One worker’s queue, now short by half; that missing half sliding straight into an idle sibling’s queue.
        </>
      ),
      duration: 2.6,
      Visual: S.StealReveal,
    },
    {
      title: 'Measured: 200 tasks, all spawned from one worker, land on three or four real threads',
      body: (
        <>
          The real, executed count of distinct threads those two hundred tasks actually ran on.
        </>
      ),
      duration: 2.8,
      takeaway: "Stealing moves half of a busy worker's queue to an idle sibling, never just one task.",
      Visual: S.StealMeasuredReveal,
    },
    {
      title: 'A task that wakes a sibling task: does it go to the back of the queue like everything else?',
      body: (
        <>
          One unit of work, waking a second one that was waiting right behind it on a channel.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — same queue, same order' },
          { label: 'No — it gets a fast-path slot ahead of the queue', correct: true },
          { label: 'Only on the current-thread runtime' },
        ],
        explain: (
          <>
            No. A dedicated fast-path slot exists for exactly this pattern: a handoff while the data is still warm.
          </>
        ),
      },
      Visual: S.LifoPredict,
    },
    {
      title: 'The LIFO slot: a fast lane for the task that was just woken, for message-passing locality',
      body: (
        <>
          The docs’ own words: a dedicated slot, checked first, disabled after three uses in a row.
        </>
      ),
      duration: 2.8,
      Visual: S.LifoReveal,
    },
    {
      title: 'A hot loop that’s always ready to run, never once blocked on anything real — does it ever let a trivial sibling task run?',
      body: (
        <>
          A channel that resupplies itself the instant it’s drained, looped forever, always immediately ready.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, never — it monopolizes the worker' },
          { label: "Yes — it's still forced to yield periodically", correct: true },
          { label: "Only if it calls .await on something slow" },
        ],
        explain: (
          <>
            Yes. A bounded per-poll allowance of resource checks forces it to hand control back, whether it would offer to or not.
          </>
        ),
      },
      Visual: S.BudgetPredict,
    },
    {
      title: 'Measured: the sibling ran long before the hot loop itself finished',
      body: (
        <>
          A trivial sibling’s own completion time, against the hot loop’s real, measured total.
        </>
      ),
      duration: 3.0,
      takeaway: 'A bounded per-poll budget still forces an always-ready loop to yield, letting a sibling run.',
      Visual: S.BudgetMeasuredReveal,
    },
    {
      title: 'Wrap that exact same hot loop in task::unconstrained. Does the sibling still get in early?',
      body: (
        <>
          The identical loop, unchanged, now wrapped in a call built to turn that budget off entirely.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — unconstrained only affects I/O' },
          { label: 'No — it now has to wait for the whole loop to finish', correct: true },
          { label: 'It crashes instead' },
        ],
        explain: (
          <>
            No. With the budget off, nothing ever forces the loop to hand control back early.
          </>
        ),
      },
      Visual: S.UnconstrainedPredict,
    },
    {
      title: 'Measured: the sibling only ran the moment the unconstrained loop itself finished',
      body: (
        <>
          The same two measurements, run again on the unconstrained version — landing within milliseconds of each other.
        </>
      ),
      duration: 3.0,
      takeaway: 'task::unconstrained opts a future out of the budget entirely — exactly the starvation risk the docs name directly.',
      Visual: S.UnconstrainedMeasuredReveal,
    },
    {
      title: 'Recap: work stealing, the LIFO slot, and cooperative budgeting, proven by yield and by starvation',
      body: (
        <>
          Stealing moves half a busy queue. The LIFO slot fast-paths a just-woken task. A budget forces a hot loop to yield. Unconstrained removes that protection.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
