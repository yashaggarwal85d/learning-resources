import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No live lab of its own (CHAPTER.md): six real simulations over real key distributions in
// examples.py -- the hot tail range partitioning produces, the even spread hash partitioning
// produces on the identical workload, and the real remap cost naive, consistent and rendezvous
// hashing each pay on an identical membership change.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The same ten thousand events, split across the same ten nodes, two different ways. One
          way makes a single node do almost all the work. The other doesn't.
        </>
      ),
      duration: 4.8,
      fig: "same events, same nodes. One way overloads one node; one doesn't.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: where does the newest write land under range partitioning?',
      body: (
        <>
          Events arrive in timestamp order. Under range partitioning, where does the newest write
          always land?
        </>
      ),
      duration: 2.8,
      fig: 'events arrive in order. Where does the newest one land?',
      predict: {
        options: [
          { label: "Spread across whichever partition has the most room" },
          { label: "Always on the one partition that currently owns the growing tail", correct: true },
        ],
        explain: (
          <>
            Range partitioning keeps keys in order, which means the highest key always belongs to
            one specific partition — and the newest write always has the highest key.
          </>
        ),
      },
      Visual: S.PredictNewestWriteUnderRange,
    },
    {
      title: 'Reveal: range partitioning',
      body: (
        <>
          Ordered by key, so a scan across a range is one sweep. But every new write lands on
          whichever partition currently owns the tail.
        </>
      ),
      duration: 4.8,
      fig: 'ordered scans in one sweep. Every new write hits the tail.',
      Visual: S.RevealRangePartitioning,
    },
    {
      title: 'Reveal: the hot tail, measured',
      body: (
        <>
          The same ten thousand writes, the most recent five hundred of them — every single one on
          the one partition holding the growing tail.
        </>
      ),
      duration: 4.8,
      fig: 'the last five hundred writes: every one on a single partition.',
      takeaway: "A hot tail isn't rare — it's the default outcome of any workload with an ordered, increasing key.",
      Visual: S.RevealHotTailMeasured,
    },
    {
      title: 'Reveal: hash partitioning',
      body: (
        <>
          No order left at all, but the identical recent writes spread across every partition.
        </>
      ),
      duration: 4.8,
      fig: 'no order left, but the same recent writes spread everywhere.',
      takeaway: "Hashing trades the ordered scan away on purpose — the price for destroying the exact pattern behind the hot tail.",
      Visual: S.RevealHashPartitioning,
    },
    {
      title: 'Predict: how much data moves when a node joins under naive hashing?',
      body: (
        <>
          Add one more node to a ten-node hash-partitioned cluster using plain modulo hashing.
          About what fraction of all keys have to move?
        </>
      ),
      duration: 2.8,
      fig: 'one node joins a ten-node cluster. How much data has to move?',
      predict: {
        options: [
          { label: "A small fraction — only the keys that would go to the new node" },
          { label: "Nearly all of them — modulo hashing remaps almost everything", correct: true },
        ],
        explain: (
          <>
            Plain modulo hashing depends on the total node count in every single key's placement —
            change that count, and nearly every key's remainder changes with it.
          </>
        ),
      },
      Visual: S.PredictNaiveResizeCost,
    },
    {
      title: 'Reveal: consistent hashing and rendezvous hashing',
      body: (
        <>
          Naive modulo hashing remaps nearly everything. Consistent hashing's ring and rendezvous
          hashing's independent computation both move close to the new node's own fair share, and
          nothing more.
        </>
      ),
      duration: 5.2,
      fig: 'naive: remaps almost all keys. Ring and HRW: move a fair share.',
      takeaway: "Minimal movement on membership change isn't a side effect — it's the specific problem both algorithms were built to solve.",
      Visual: S.RevealConsistentAndRendezvous,
    },
    {
      title: 'Reveal: routing, and the independent axis',
      body: (
        <>
          A request still has to find its partition's own node — client, proxy, or coordinator —
          and that choice has nothing to do with how many replicas that node's data has.
        </>
      ),
      duration: 4.8,
      fig: 'client, proxy, or coordinator routes it. Replica count is a separate question.',
      Visual: S.RevealRoutingAndIndependentAxis,
    },
    {
      title: 'Recap',
      body: (
        <>
          Range orders, hash spreads; naive hashing breaks on resize, consistent and rendezvous
          hashing don't; partitioning and replication are two separate questions.
        </>
      ),
      duration: 4.8,
      fig: "range orders, hash spreads. Naive breaks on resize; the others don't.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A table is range-partitioned by an auto-incrementing order ID, and traffic has a hundred
          times the usual write rate during a flash sale.
        </>
      ),
      duration: 2.8,
      fig: 'range-partitioned order IDs, a hundred times the usual traffic. Then what?',
      predict: {
        options: [
          { label: "Adding more nodes to the cluster fixes it — more capacity, spread the load" },
          { label: "Adding nodes doesn't help — the same single tail partition still takes every write", correct: true },
        ],
        explain: (
          <>
            Every new node gets its own share of the key space, but the newest order ID still only
            belongs to one partition. More nodes means more partitions sitting idle, not less load
            on the one partition actually getting hit.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
