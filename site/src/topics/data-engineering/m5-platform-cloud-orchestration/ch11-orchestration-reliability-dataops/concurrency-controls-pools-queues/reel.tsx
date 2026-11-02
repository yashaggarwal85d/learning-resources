import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// One real experiment against a live Apache Airflow install: a 2-slot pool protecting a
// "fragile source," with ten mapped tasks — two at a high priority weight, eight at a low one —
// all competing for it in a single run, read back from the real metadata database (examples.py,
// FACT-CHECK.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The shop's JDBC extractor has no pool at all. A backfill and a fan-out land on the same
          hour, forty extraction tasks hit the database at once, and it falls over.
        </>
      ),
      duration: 4.8,
      fig: "forty tasks, one unprotected source. it falls over.",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a pool, run for real',
      body: (
        <>
          A two-slot pool guarding that same source. Ten mapped tasks compete for it in one run —
          never more than two running at once, for the whole run, read from the real database.
        </>
      ),
      duration: 4.8,
      fig: 'ten tasks, two slots. never more than two running.',
      Visual: S.RevealPoolCap,
    },
    {
      title: 'Predict: who gets the scarce slot first?',
      body: (
        <>
          Two of those ten tasks carry a higher priority weight. Does the scheduler hand them a
          slot first, or does whichever task happened to queue first just win?
        </>
      ),
      duration: 2.8,
      fig: 'two high priority, eight low. who goes first?',
      predict: {
        options: [
          { label: 'Whichever task queued first, priority or not' },
          { label: 'The higher-priority tasks, every time a slot frees up', correct: true },
        ],
        explain: (
          <>
            A pool slot freeing up doesn't go to whoever arrived first. It goes to whichever
            waiting task's priority weight is highest, by design.
          </>
        ),
      },
      Visual: S.PredictPriorityOrder,
    },
    {
      title: 'Reveal: priority weight, measured',
      body: (
        <>
          Both high-priority instances start, and finish, before any of the eight low-priority
          ones even begin — the exact timestamps, from the same real run.
        </>
      ),
      duration: 4.8,
      fig: 'both high-priority tasks finish before any low one starts.',
      Visual: S.RevealPriorityMeasured,
    },
    {
      title: 'Reveal: queue-to-worker routing, sourced',
      body: (
        <>
          A different mechanism for a different problem: routing specific tasks to specific
          worker pools entirely, by queue name — not demonstrated here, but precisely sourced.
        </>
      ),
      duration: 4.8,
      fig: 'tasks routed by queue name to specific workers.',
      takeaway: "A freed slot doesn't go to whoever waited longest. It goes to whoever matters more.",
      Visual: S.RevealQueueRouting,
    },
    {
      title: 'Predict: what if high priority never stops arriving?',
      body: (
        <>
          Suppose new high-priority tasks keep landing in that pool faster than slots free up.
          What happens to the low-priority tasks already waiting?
        </>
      ),
      duration: 2.8,
      fig: 'high priority keeps arriving. what about the ones waiting?',
      predict: {
        options: [
          { label: "They eventually run — priority only delays, never blocks" },
          { label: 'They can wait indefinitely, if nothing ever bounds it', correct: true },
        ],
        explain: (
          <>
            Priority weight has no built-in ceiling. A steady stream of higher-priority arrivals
            can keep a low-priority task waiting forever — the exact mechanism that just measured
            fairly becomes starvation the moment it's unbounded.
          </>
        ),
      },
      Visual: S.PredictStarvation,
    },
    {
      title: 'Reveal: starvation is the same mechanism, unbounded',
      body: (
        <>
          The reveal that just measured priority order working correctly is the same mechanism
          that causes starvation — a reservation or round-robin policy is what bounds it.
        </>
      ),
      duration: 4.8,
      fig: 'the fair mechanism, left unbounded, becomes unfair.',
      takeaway: "The same rule that picks a winner fairly becomes starvation the moment nothing bounds it.",
      Visual: S.RevealStarvation,
    },
    {
      title: 'Recap',
      body: (
        <>
          A pool caps concurrency independent of worker capacity. Priority weight decides who
          gets a freed slot. Multi-team deployments extend isolation to pools, still experimental.
        </>
      ),
      duration: 4.8,
      fig: 'pool caps concurrency. priority decides order. multi-team is new.',
      takeaway: 'A pool bounds how many run at once. A queue decides which worker even can.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The fragile source now has its two-slot pool. The same backfill and the same fan-out
          land on the same hour again.
        </>
      ),
      duration: 2.8,
      fig: 'same collision, pool in place. does it fall over this time?',
      predict: {
        options: [
          { label: 'Yes — forty tasks still overwhelm it' },
          { label: 'No — the extra tasks queue instead of hitting the source', correct: true },
        ],
        explain: (
          <>
            The forty tasks still get created. They just can't all run at once anymore — the pool
            lets exactly two through, and the rest wait their turn, harmlessly.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
