import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Concurrent hash maps. The previous topic's own handoff's exact next question: a structure
// that must grow while many threads read and write it. Every mechanism shown is replayed
// deterministically in examples.py; this topic needs no compiled benchmark, since its outcomes
// are about tracing a mechanism, not measuring a throughput curve.
const reel: Reel = {
  steps: [
    {
      title: 'A map that sixteen threads update',
      body: (
        <>
          A service keeps a map from request id to a running count, and sixteen threads update
          it. One mutex around the whole map is correct, and at sixteen threads the map is the
          bottleneck. Sixteen locks, one per stripe, are better — until the map has to grow.
        </>
      ),
      duration: 4.8,
      fig: 'one map, sixteen threads, and a resize waiting to happen',
      Visual: S.Hook,
    },
    {
      title: 'Does a reader wait, look twice, or get a note?',
      body: (
        <>
          Resizing needs every stripe's lock, so one slow resize stops everything, and growing is
          exactly what the map does when traffic is highest. During a resize, what does a reader
          do?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'It waits for the whole resize to finish' },
          { label: 'It checks both the old and the new table itself' },
          { label: 'It follows a note left behind that says where to look', correct: true },
          { label: 'It fails and must retry from the start' },
        ],
        explain: (
          <>
            A note. A migrated bin's own head is replaced with a marker, so a reader that lands
            there follows it straight to the new table instead of waiting or guessing.
          </>
        ),
      },
      fig: 'a reader, mid-resize — what does it find?',
      Visual: S.ReaderDuringResizePredict,
    },
    {
      title: 'One lock, then many stripes',
      body: (
        <>
          A single lock around the whole table serializes every thread, whatever keys they touch.
          Splitting the table into several independently locked stripes buys that back — threads
          on different stripes never meet — at the cost of a fixed stripe count and a whole-table
          operation, like a resize, needing every one of them. Java's own map carried this design
          before its current one, and still keeps the old constructor argument for compatibility.
        </>
      ),
      duration: 5,
      fig: 'one lock around everything, then several independent stripes',
      Visual: S.LockStripingStripes,
    },
    {
      title: 'One compare and swap, no lock',
      body: (
        <>
          Inserting the first node into an empty bin is a single compare and swap — no lock
          object at all, and by far the most common case under an even key distribution.
        </>
      ),
      duration: 4.4,
      fig: 'an empty bin, landed with one compare and swap',
      Visual: S.CasEmptyBin,
    },
    {
      title: 'The first node is the lock',
      body: (
        <>
          A bin that already has a node locks on that first node itself, rather than paying for a
          separate lock object per bin. Every other bin stays completely free while this one is
          held.
        </>
      ),
      duration: 4.6,
      fig: "a bin's own first node, framed as the lock",
      takeaway: "The bin's own first node is the lock, so an empty bin costs nothing to guard.",
      Visual: S.LockFirstNode,
    },
    {
      title: 'A reader never takes it',
      body: (
        <>
          A lookup never takes that lock. It is a plain read of whatever is already there, so it
          can run at the same time as an update working through the very same bin.
        </>
      ),
      duration: 4.2,
      fig: 'a reader passing straight through a locked bin',
      Visual: S.ReaderNeverLocks,
    },
    {
      title: 'How long does a chain get, by chance?',
      body: (
        <>
          Keys land on bins through a hash. Under a uniform, honest hash, how long does one bin's
          chain plausibly grow — long enough to matter, or is a long chain something else
          entirely?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: "It's common — expect chains of eight or more routinely" },
          { label: 'It falls off sharply — a chain that long is vanishingly rare by chance', correct: true },
          { label: 'It depends only on the number of threads, not the hash' },
          { label: "There's no pattern at all" },
        ],
        explain: (
          <>
            It falls off sharply. Under a random hash the chance of a long chain drops by roughly
            a factor of four with every extra node — so a chain that long almost always means a
            bad or hostile key distribution, not luck.
          </>
        ),
      },
      fig: 'plausible, or astronomically rare?',
      Visual: S.ChainLengthPredict,
    },
    {
      title: 'Nine probabilities, computed',
      body: (
        <>
          The map's own source states the shape this takes: a small average parameter, with the
          chance of each bin length computed and checked here against its own nine stated
          figures. A chain of eight nodes, by chance alone, is a one-in-many-million event.
        </>
      ),
      duration: 5,
      fig: 'nine computed probabilities, falling off sharply after the first two',
      Visual: S.PoissonBars,
    },
    {
      title: 'Eight nodes, a tree instead of a chain',
      body: (
        <>
          A chain that reaches the treeify threshold, in a table already large enough, becomes a
          balanced tree bounding its own search instead of a straight-line walk. A table that
          isn't yet large enough resizes instead of treeifying. Either way, the defence against a
          hostile key distribution shows up inside the structure itself.
        </>
      ),
      duration: 5,
      fig: 'a chain reaching the threshold, a tree where the table is large enough',
      takeaway: 'A bin that long almost never happens by chance — it signals a hostile key distribution.',
      Visual: S.TreeifiedBin,
    },
    {
      title: "A note at the old bin's head",
      body: (
        <>
          Growing the table moves bins one range at a time. Each migrated bin's head becomes a
          forwarding marker; a thread that finds one follows it to the new table, and a second
          thread can take the next range rather than wait for the first to finish alone.
        </>
      ),
      duration: 4.8,
      fig: 'a migrated bin marked, a reader following it, a second thread on the next range',
      Visual: S.ForwardingNode,
    },
    {
      title: 'One list, in bit-reversed order',
      body: (
        <>
          The lock-free alternative keeps every item in one list, ordered by the bit-reversal of
          its hash, with dummy nodes marking where each bucket begins. Doubling the bucket array
          only threads in new dummy nodes — it moves not one single real item.
        </>
      ),
      duration: 5,
      fig: 'one sorted list, dummy markers at bucket starts, doubled with nothing moved',
      takeaway: 'Doubling the bucket array adds dummy nodes only — it moves not one real item.',
      Visual: S.SplitOrderedList,
    },
    {
      title: 'Eight shards, two locks',
      body: (
        <>
          The Rust shape of the same idea: an array of shards, each its own read-write-locked
          table, the shard picked from the hash's own bits. Two threads on different shards never
          block each other; two on the same shard take turns, exactly as a stripe would.
        </>
      ),
      duration: 4.6,
      fig: 'eight shards; different shards run in parallel, one shard in turn',
      Visual: S.Shards,
    },
    {
      title: 'Recap: three structures, three rungs',
      body: (
        <>
          Lock striping blocks a resize behind every lock it holds. A map built from compare and
          swap on bins is lock-free on its fast path and blocking only where it locks. A
          split-ordered list is lock-free throughout, at the cost of a list walk inside every
          bucket. Three structures, three answers to the same question this chapter opened with:
          what a stalled thread costs everyone else.
        </>
      ),
      duration: 5,
      fig: 'three structures, three rungs of the same ladder',
      Visual: S.Recap,
    },
  ],
};

export default reel;
