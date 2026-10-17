import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A five-minute refresher: the two index families almost every indexed read and write runs through.
// Running example: the shop's orders table (point lookups) and order_events stream (append-only ingest).
// Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'What an index decides',
      body: (
        <>
          Each tier of the machine has its own cost: microseconds from cache, tens from a drive, tens of milliseconds from object storage. An
          index&rsquo;s whole job is deciding how many of those costs a query pays. Two families do almost all of this work, and they pay in
          opposite places.
        </>
      ),
      duration: 3.6,
      Visual: S.Problem,
    },
    {
      title: 'A B+-tree node is one page wide',
      body: (
        <>
          Every node is exactly one <b>8 KB</b> page. Leaves hold the data; the nodes above hold only separator keys and downlinks. How many
          children fit in one node, its <b>fan-out</b>, is the page size divided by one entry&rsquo;s size — a few hundred for a small key.
        </>
      ),
      duration: 3.8,
      Visual: S.FanoutNode,
    },
    {
      title: 'Predict: how many levels deep?',
      body: <>100,000,000 keys, a fan-out of a few hundred. How many levels, root to leaf?</>,
      duration: 1.6,
      predict: {
        options: [{ label: 'About 20' }, { label: 'About 10' }, { label: 'Three or four', correct: true }, { label: 'It depends only on key size' }],
        explain: (
          <>
            Three or four: the height is a logarithm of the key count in the base of the fan-out, and a large base makes it tiny. Fan-out 256 needs
            4 levels; fan-out 1,000 needs only 3. The tree is short because it is wide.
          </>
        ),
      },
      Visual: S.HeightPredict,
    },
    {
      title: 'The top of the tree is free after the first query',
      body: (
        <>
          A point lookup walks one path, root to leaf, then one more read for the row. But the root is one page and the next level is only a few
          megabytes: after a handful of queries those upper levels live in cache for good, so a lookup really pays about one real read, at the leaf.
        </>
      ),
      duration: 4,
      Visual: S.PointLookup,
    },
    {
      title: 'An LSM-tree never writes in place',
      body: (
        <>
          Every write just appends: first to a small sorted structure in memory, the <b>memtable</b>. When it fills, it freezes and flushes to
          storage in one long sequential sweep, a <b>sorted run</b>. No page to find, no seek, no read before the write.
        </>
      ),
      duration: 3.6,
      Visual: S.MemtableFlush,
    },
    {
      title: 'Runs pile up, so compaction merges them',
      body: (
        <>
          Runs are never modified, so they accumulate, and a reader must check more of them over time. A background job, <b>compaction</b>, merges
          several sorted runs into fewer, larger ones; in RocksDB&rsquo;s leveled design each level is about <b>10×</b> larger than the one above
          it, and every byte is rewritten again on the way down.
        </>
      ),
      duration: 4.2,
      Visual: S.Compaction,
    },
    {
      title: 'Three costs, opposite corners',
      body: (
        <>
          A tiny update to the in-place tree rewrites a whole page: a <b>16</b>-byte change dirties an <b>8 KB</b> page, and the log writes it
          again. The append-only tree&rsquo;s compaction rewrites each byte several times over: RocksDB&rsquo;s own worked example puts leveled
          write amplification near <b>33×</b>, with space amplification near <b>1.14×</b>.
        </>
      ),
      duration: 4.4,
      Visual: S.CostTable,
    },
    {
      title: 'Pick two of three: the RUM conjecture',
      body: (
        <>
          Three corners: how much a read costs, how much an update costs, how much space costs. Athanassoulis et al.&rsquo;s conjecture says any
          design can only push two of them down, never all three at once, and our two families sit at opposite corners of that triangle.
        </>
      ),
      duration: 3.6,
      Visual: S.RumTriangle,
    },
    {
      title: 'A Bloom filter answers "maybe" cheaply',
      body: (
        <>
          Before touching a run, the engine asks a per-file membership sketch, a <b>Bloom filter</b>, whether the key could be inside.
          RocksDB&rsquo;s default spends <b>10</b> bits per key for about a <b>1%</b> false-positive rate, so most point reads touch a single run.
          A range scan gets none of this help: it still merges every overlapping run.
        </>
      ),
      duration: 4,
      Visual: S.BloomFilter,
    },
    {
      title: 'Predict: orders lookups want which family?',
      body: <>Looking up one order by its id, over and over, reads dominate. Which family fits?</>,
      duration: 1.4,
      predict: {
        options: [{ label: 'The in-place B+-tree', correct: true }, { label: 'The append-only LSM-tree' }, { label: 'Neither helps' }, { label: 'Both equally' }],
        explain: <>The B+-tree: a short, cached descent and a tidy walk along the leaves, which is why operational databases default to it.</>,
      },
      Visual: S.OrdersPredict,
    },
    {
      title: 'Predict: order_events ingest wants which family?',
      body: <>A terabyte of events pouring in as a high-rate append stream. Which family fits?</>,
      duration: 1.4,
      predict: {
        options: [{ label: 'The in-place B+-tree' }, { label: 'The append-only LSM-tree', correct: true }, { label: 'Neither helps' }, { label: 'Both equally' }],
        explain: <>The LSM-tree: it swallows the stream at memory speed and defers sorting to background compaction, so the write path never seeks.</>,
      },
      Visual: S.EventsPredict,
    },
    {
      title: 'Back to the shop: one sentence',
      body: (
        <>
          A B+-tree trades write cost for read cost; an LSM-tree trades read and space cost for write cost. Pick the structure whose cheap side
          matches the workload&rsquo;s hot path.
        </>
      ),
      duration: 3.2,
      Visual: S.Verdict,
    },
  ],
};

export default reel;
