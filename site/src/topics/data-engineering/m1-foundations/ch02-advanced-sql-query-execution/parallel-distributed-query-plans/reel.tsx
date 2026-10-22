import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: pw_orders (8,000,000 rows) and pw_customers (2,000,000 rows), both partitioned
// into 4 matching partitions on `region`, joined on `region AND customer_id` -- constructed so every
// matching pair already lives in the same partition on both sides. Every number below is in
// examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'A join that never crosses a partition boundary',
      body: (
        <>
          Same join, same answer, same memory setting. Let the planner combine everything first: 4619.117 ms. Let it join matching partitions
          separately instead: 3684.680 ms.
        </>
      ),
      duration: 4.4,
      fig: '4619.117 ms vs. 3684.680 ms, same answer',
      Visual: S.PartitionwiseHook,
    },
    {
      title: 'Predict: why would joining matching partitions separately ever win?',
      body: (
        <>
          Both plans join the exact same two tables on the exact same condition. Why would splitting the work into four smaller joins ever beat one
          combined one?
        </>
      ),
      duration: 1.8,
      fig: 'one big join vs. four small ones',
      predict: {
        options: [
          { label: 'It never does — it’s just a different plan shape' },
          { label: 'Each smaller join’s hash table can fit where the combined one can’t', correct: true },
          { label: 'Fewer rows get scanned overall' },
        ],
        explain: (
          <>
            Each smaller join's hash table can fit where the combined one can't — the total amount of work is the same, but how it's divided up changes
            whether it fits in memory at all.
          </>
        ),
      },
      Visual: S.PredictWhyPartitionsHelp,
    },
    {
      title: 'Reveal: the plan shape changes',
      body: (
        <>
          Turn it off: one <code>Hash Join</code> over an <code>Append</code> of every partition on both sides. Turn it on: an <code>Append</code> of 4
          independent <code>Hash Join</code>s, each over just its own matching partition pair.
        </>
      ),
      duration: 4.8,
      fig: '1 combined Hash Join → 4 independent ones',
      Visual: S.RevealPlanShape,
    },
    {
      title: 'How a partition-wise (co-located) join actually works',
      body: (
        <>
          It only applies when the join condition covers every partition key, and both tables share the same partition boundaries. When that's true, a
          row can only ever match another row in the exact same partition — there's nothing left to reconcile across partitions.
        </>
      ),
      duration: 4.4,
      fig: 'same partition keys, same boundaries, on both sides',
      Visual: S.HowPartitionwiseWorks,
    },
    {
      title: 'Reveal: the memory win',
      body: (
        <>
          At the same constrained budget, the one combined hash table (2,000,000 rows) spills to disk. Each of the four separate hash tables (500,000
          rows each) doesn't. Same hardware, same setting, same answer — one plan shape needs a spill the other doesn't.
        </>
      ),
      duration: 4.8,
      fig: '2,000,000-row table spills; four 500,000-row tables don’t',
      takeaway: 'Splitting one big hash table into several smaller ones can be the difference between fitting memory and spilling.',
      Visual: S.RevealMemoryWin,
    },
    {
      title: 'Predict: take this to a cluster — what has to happen first?',
      body: (
        <>
          Same idea, a level up: two tables live across several different machines instead of partitions on one. If they aren't already split the same
          way, what has to happen before they can be joined?
        </>
      ),
      duration: 2,
      fig: 'two tables, several machines, not aligned',
      predict: {
        options: [
          { label: 'Nothing — joins always just work' },
          { label: 'Data has to move across the network first', correct: true },
          { label: 'The smaller table gets dropped' },
        ],
        explain: (
          <>
            Data has to move across the network first — the alignment that a single machine's partitions can already guarantee has to be manufactured
            across machines instead.
          </>
        ),
      },
      Visual: S.PredictAcrossMachines,
    },
    {
      title: 'Reveal: exchange operators',
      body: (
        <>
          A distributed engine's own plan names this step explicitly. Trino's <code>EXPLAIN</code> labels a fragment <code>HASH</code> when its input is
          redistributed by a hash function, or <code>BROADCAST</code> when it's sent to every node — with a <code>RemoteExchange</code> node showing
          exactly where data crosses between machines.
        </>
      ),
      duration: 4.8,
      fig: 'RemoteExchange: HASH or BROADCAST',
      Visual: S.RevealExchangeOperators,
    },
    {
      title: 'How a shuffle (repartition) exchange works',
      body: (
        <>
          Hash-redistribute both sides of the join by the join key, so every node ends up holding exactly the rows that could possibly match locally.
          That's the network manufacturing, across machines, the same alignment a single machine's matching partitions already had for free.
        </>
      ),
      duration: 4.8,
      fig: 'both sides redistributed by the join key',
      Visual: S.HowShuffleWorks,
    },
    {
      title: 'How a broadcast exchange works',
      body: (
        <>
          Instead of reshuffling both sides, copy the smaller one whole to every node. Nothing about the larger side has to move at all — cheap, as long
          as the side being copied is genuinely small.
        </>
      ),
      duration: 4.4,
      fig: 'copy the small side everywhere, move nothing else',
      Visual: S.HowBroadcastWorks,
    },
    {
      title: 'Predict: a broadcast side grows past the threshold — then what?',
      body: (
        <>
          A query has been broadcasting one side of a join. That side keeps growing, and crosses the engine's own broadcast size limit. What should the
          engine do?
        </>
      ),
      duration: 2,
      fig: 'a broadcast side outgrowing its limit',
      predict: {
        options: [{ label: 'Broadcast it anyway, just slower' }, { label: 'Switch to a shuffle join instead', correct: true }, { label: 'Fail the query' }],
        explain: (
          <>
            Switch to a shuffle join instead — past a certain size, copying a side to every node costs more than redistributing both sides once.
          </>
        ),
      },
      Visual: S.PredictBroadcastThreshold,
    },
    {
      title: 'Reveal: the broadcast threshold is a real switch',
      body: (
        <>
          Spark's own default: broadcast a join side under 10 megabytes, shuffle-join above it — a configurable, disable-able number, not a vague
          heuristic. Its adaptive execution can even flip a planned shuffle join into a broadcast one mid-query, once it sees the side's real size.
        </>
      ),
      duration: 4.8,
      fig: '10 MB default threshold, switchable at run time',
      takeaway: 'The broadcast-vs-shuffle choice is a real, numeric switch, and a modern engine can flip it at run time.',
      Visual: S.RevealBroadcastThreshold,
    },
    {
      title: 'Co-located joins are partition-wise joins at cluster scale',
      body: (
        <>
          When both tables are already partitioned the same way across the same nodes, the exchange step disappears entirely — the exact condition
          PostgreSQL's own partition-wise join checks for, one level up from a single machine's partitions to a cluster's nodes.
        </>
      ),
      duration: 4.8,
      fig: 'same alignment, one machine or many',
      takeaway: 'A co-located join is a partition-wise join at cluster scale — the same alignment, skipping the same work.',
      Visual: S.CoLocatedJoins,
    },
    {
      title: 'Recap',
      body: (
        <>
          Matching partitions avoid redundant work on one machine. Across machines, a join needs an exchange unless the data's already aligned. A
          shuffle redistributes both sides; a broadcast copies the small one. And the broadcast threshold is a real, sometimes run-time, switch between
          them.
        </>
      ),
      duration: 4.8,
      fig: 'four ideas, one running example',
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: (
        <>
          A plan fragment's exchange type reads <code>HASH</code>. Is the engine copying one side of a join to every node, or redistributing both sides
          by the join key?
        </>
      ),
      duration: 2.4,
      fig: 'read the exchange type',
      predict: {
        options: [{ label: 'Copying one side to every node' }, { label: 'Redistributing both sides by the join key', correct: true }],
        explain: (
          <>
            Redistributing both sides by the join key — <code>HASH</code> is the repartition/shuffle strategy; copying one side everywhere is what
            <code>BROADCAST</code> names instead.
          </>
        ),
      },
      Visual: S.ProveExchangeType,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          One side of a join is 6 megabytes; the engine's broadcast threshold is 10 megabytes. Should the planner broadcast that side, or shuffle both?
        </>
      ),
      duration: 2.4,
      fig: '6 MB side, 10 MB threshold',
      predict: {
        options: [{ label: 'Broadcast it', correct: true }, { label: 'Shuffle both sides' }],
        explain: (
          <>
            Broadcast it — 6 megabytes sits under the 10 megabyte threshold, so copying that side to every node costs less than redistributing both of
            them.
          </>
        ),
      },
      Visual: S.ProveBroadcastDecision,
    },
  ],
};

export default reel;
