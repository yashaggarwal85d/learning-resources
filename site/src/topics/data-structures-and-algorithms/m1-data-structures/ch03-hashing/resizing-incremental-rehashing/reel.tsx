import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every scheme so far has worked inside a table of fixed size. None of them has yet said what
// happens when that table fills up. Here is resizing, and the two real ways to pay for it. Every
// number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Every scheme in this chapter has worked inside a table of fixed size. None of them has said what happens when that table fills up.',
      body: (
        <>
          Chaining, open addressing, Swiss Tables &mdash; every one of them assumed the table already had room. This topic
          asks the one question all three quietly deferred.
        </>
      ),
      duration: 3.4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "Doubling pays for the whole rehash in one insert, proportional to the table's current size.",
      body: (
        <>
          The simplest answer: when the table&rsquo;s full, allocate one twice the size, and rehash every existing entry into
          it, right then, all at once.
        </>
      ),
      duration: 3.4,
      fig: 'DoublingCost',
      takeaway: "Doubling pays for the whole rehash in one insert, proportional to the table's current size.",
      Visual: S.DoublingCost,
    },
    {
      title: 'That one insert — how does its cost compare to an ordinary insert right next to it?',
      body: <>One of these inserts triggers the rehash. How does its cost compare to its neighbors?</>,
      duration: 2,
      fig: 'LatencyPredict',
      predict: {
        options: [
          { label: 'About the same as any other insert' },
          { label: 'A bit slower, but still roughly constant' },
          { label: "Proportional to the whole table's current size — far slower than its neighbors", correct: true },
          { label: 'It depends only on how many collisions that one key has' },
        ],
        explain: (
          <>
            That insert has to rehash every existing entry before it can finish, so its cost scales with the table&rsquo;s own
            size. Averaged over many inserts this is still cheap — but someone has to feel that one slow insert.
          </>
        ),
      },
      Visual: S.LatencyPredictViz,
    },
    {
      title: "Redis's own dict keeps both the old and new table live, and migrates entries a few at a time instead of all at once.",
      body: (
        <>
          A real production answer, built differently: keep the old table and a new one both live, and move entries from one
          to the other gradually, instead of pausing to move them all.
        </>
      ),
      duration: 3.6,
      fig: 'IncrementalIdea',
      Visual: S.IncrementalIdea,
    },
    {
      title: "Who actually moves those keys from the old table to the new one?",
      body: <>The migration pointer sits between two tables. What actually makes it move forward?</>,
      duration: 2,
      fig: 'MigrationPredict',
      predict: {
        options: [
          { label: 'A dedicated background thread, migrating continuously' },
          { label: 'Piggybacked on every ordinary lookup or insert that touches the table', correct: true },
          { label: 'All at once, just delayed until the server is idle' },
          { label: 'Only when the table detects memory pressure' },
        ],
        explain: (
          <>
            Redis&rsquo;s own source calls a bounded migration step from inside its ordinary lookup and insert code &mdash; no
            separate thread, no idle-time trigger. It rides along on work the table was already doing.
          </>
        ),
      },
      Visual: S.MigrationPredictViz,
    },
    {
      title: "Incremental migration's bound caps every single operation's cost, no matter how large the table.",
      body: (
        <>
          Each step moves a bounded number of entries. The table that triggered the resize keeps growing, but no single
          operation ever pays for the whole migration &mdash; just its own small, fixed share.
        </>
      ),
      duration: 3.6,
      fig: 'BoundedStep',
      takeaway: "Incremental migration's bound caps every single operation's cost, no matter how large the table.",
      Visual: S.BoundedStep,
    },
    {
      title: 'Incremental migration keeps both tables live for many operations, not one — a real, sustained memory cost for a smoother latency.',
      body: (
        <>
          No strategy here is free. Incremental migration&rsquo;s smoother latency costs real, sustained memory &mdash; both
          tables stay live for as long as the migration takes, not just for one insert.
        </>
      ),
      duration: 3.8,
      fig: 'MemoryTradeoff',
      takeaway: 'Incremental migration keeps both tables live for many operations — a real, sustained cost for smoother latency.',
      Visual: S.MemoryTradeoff,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Same key sequence, same final table, same total work &mdash; measured, not assumed. One strategy pays it in a
          single tall spike; the other spreads it into many small, bounded steps.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
