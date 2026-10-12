import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Deamortization and global rebuilding: the spike of an amortized O(1) append, paid in installments, and a tree that rebuilds only the part that went bad.
// One unit of cost is one element write (one node written, for trees). Time model: a tick is one write, a request arrives every 4 ticks.
// Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'One request behind half a million copies',
      body: (
        <>
          The last reel proved append O(1) amortized. Now put the vector behind a model service: each request appends one key, one tick per element write, a request every 4 ticks. Append 524,289 copies 524,288 keys, and
          131,072 requests arrive while it runs. Is this service fast?
        </>
      ),
      duration: 9.4,
      Visual: S.Opening,
    },
    {
      title: 'What is the p99 of an append?',
      body: (
        <>
          Percentiles describe a tail. p50 is the median; p99 is the cost that 99 of every 100 appends stay at or under; p99.9, 999 of every 1,000. Of a million appends to the doubling vector, 20 resize, the largest copying 524,288 keys. What is the p99 cost of an append?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: '1 write', correct: true }, { label: 'About 2 (the mean)' }, { label: 'About 20' }, { label: '524,289 writes' }],
        explain: (
          <>
            1. Only 20 of 1,000,000 appends resize, 0.002%, so p50, p99, p99.9 and even p99.99 are all 1 write; the mean is 2.05 and the maximum 524,289. Doubling does not hurt the p99 of appends. The harm is in what waits behind the rare one.
          </>
        ),
      },
      Visual: S.AppendP99,
    },
    {
      title: 'Percentiles of requests, not of appends',
      body: (
        <>
          Per append, the tail is 1 write. Per request, wait included, p99 is 494,289 ticks: 349,515 requests, 35%, queue behind a resize. A service is judged on its requests, so their tail is the one that counts.
        </>
      ),
      duration: 6.8,
      Visual: S.Requests,
    },
    {
      title: 'A rare stall becomes common at scale',
      body: (
        <>
          Fan-out multiplies the tail. Dean and Barroso’s example: a server answers in 10 ms but takes 1 s at its p99. A request served by one such server is slow 1 time in 100; a request that waits for 100 of them is slow 63% of the
          time. A tail you can ignore per server is the common case per request.
        </>
      ),
      duration: 8.4,
      Visual: S.FanOut,
    },
    {
      title: 'Spend the coins as you earn them',
      body: (
        <>
          Accounting charged 3 per append: 1 to write, 2 saved. Deamortization spends the 2 right away: when the vector of 8 fills, append 9 allocates 16 slots and moves 2 old keys; appends 10 to 12 move 2 each. Over 16 appends both vectors
          write 31 elements, but no append costs more than 3.
        </>
      ),
      duration: 11.2,
      Visual: S.Installments,
    },
    {
      title: 'Two buffers and a frontier',
      body: (
        <>
          The state: the old buffer, the new one, n, and the frontier k, how many old keys have moved. An append writes its key at slot n of the new buffer, then moves the next 2 old keys. A read at index i uses the old buffer only if k ≤ i &lt; m,
          the old key count; everything else is in the new one.
        </>
      ),
      duration: 7.0,
      Visual: S.TwoBuffers,
    },
    {
      title: 'Does the copy finish in time?',
      body: (
        <>
          The vector of 8 filled, so append 9 allocated 16 slots and moved 2 old keys: 6 are left, 7 slots are free. Every later append writes 1 new key and moves 2 old ones. How many of the 16 slots are in use when the last old key moves?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '10' }, { label: '12', correct: true }, { label: '16: it ends just as the buffer fills' }, { label: 'It overflows first' }],
        explain: (
          <>
            12. Appends 9 to 12 move 2 keys each, 8 in all, while n goes from 8 to 12: the copy ends at 1.5 times the old size with a quarter of the new buffer free. Moving 1 key per append would also finish, but exactly as the buffer fills, with no slack.
            For growth factor g, move at least 1/(g − 1) keys per append.
          </>
        ),
      },
      Visual: S.Race,
    },
    {
      title: 'What the installments cost',
      body: (
        <>
          Same total writes, a different bill. Both buffers stay alive while the copy runs: the same 12 MiB peak as plain doubling, but held for 262,144 appends instead of 1. Every read pays a comparison with the frontier. More than half the appends
          now cost 3, so the median got worse. And the O(1) worst case assumes allocation is O(1).
        </>
      ),
      duration: 7.4,
      Visual: S.Costs,
    },
    {
      title: 'Global rebuilding: let it go stale, then rebuild',
      body: (
        <>
          A second structure, apart from growing arrays. Global rebuilding: let it go stale, then rebuild all of it. A sorted vector deletes by leaving a tombstone, which a lookup reports as absent. Once half its slots are tombstones, copy the live keys
          into a compact vector: Θ(n) after Θ(n) deletes, O(1) amortized. The doubling vector does the same for growth. At 1,048,576 keys, one delete still copies 524,288.
        </>
      ),
      duration: 7.8,
      Visual: S.Stale,
    },
    {
      title: 'Rebuild in the background',
      body: (
        <>
          Overmars’s global rebuilding starts early and rebuilds while serving. At 4 tombstones of 16, begin a new copy; each delete also scans 8 slots of the old one, which keeps answering queries. Deletes behind the scan go into a log, replayed
          before the swap. No delete writes more than 10.
        </>
      ),
      duration: 10.0,
      Visual: S.Background,
    },
    {
      title: 'A tree that stores no balance',
      body: (
        <>
          A scapegoat tree is a plain binary search tree, a key and two pointers per node; the root keeps only the size and the largest size since the last full rebuild. With α = 2/3 (a balance parameter, not a load factor), a node deeper than h(n) =
          ⌊log<sub>1/α</sub> n⌋ is too deep: inserting 69 lands at depth 6, below h(9) = 5.
        </>
      ),
      duration: 9.2,
      Visual: S.Scapegoat,
    },
    {
      title: 'Which ancestor is the scapegoat?',
      body: (
        <>
          Climb from 69, the deep node. At each ancestor, compare its heavier child’s subtree with the ancestor’s own subtree. The scapegoat is the first ancestor where that child holds more than α = 2/3. Which node is it?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '63, the parent' }, { label: '54: one node on its left, three on its right' }, { label: '87', correct: true }, { label: '22, the root' }],
        explain: (
          <>
            87. Going up from 69: 63’s heavier child holds 1 of its 2 nodes, 80’s holds 2 of 3 (exactly 2/3 is still allowed), 54’s holds 3 of 5, under 2/3 though it looks lopsided. 87’s left child holds 5 of its 6 nodes: over 2/3, so 87 is the scapegoat. The
            sizes are counted on the way up; no node stores one.
          </>
        ),
      },
      Visual: S.WhichScapegoat,
    },
    {
      title: 'Rebuild the subtree, perfectly balanced',
      body: (
        <>
          Rebuild the scapegoat’s subtree perfectly balanced: walk its 6 nodes in order, make the lower middle one, 63, the root, and recurse. Time is proportional to the subtree, paid by the potential an unbalanced node holds, so inserts cost O(log n) amortized.
        </>
      ),
      duration: 7.2,
      Visual: S.Rebuild,
    },
    {
      title: 'Deletes rebuild the whole tree',
      body: (
        <>
          Deletes never push a node deeper, but they shrink n, so the tree grows tall for its size. The root’s second count triggers global rebuilding: when the size drops below α times the largest size since the last full rebuild, rebuild the whole
          tree. That takes Θ(n) deletes first: at a million keys, delete 333,334 rebuilds 666,666 nodes.
        </>
      ),
      duration: 6.2,
      Visual: S.DeleteRebuild,
    },
    {
      title: 'Partial rebuilds are still amortized',
      body: (
        <>
          Scapegoat trees are amortized, not deamortized: O(log n) per insert over any sequence, but one insert can rebuild most of the tree. A million increasing keys cost 28 writes per insert on average, p99 246, and insert 900,961 rebuilds
          751,332 nodes. Searches never restructure: their worst case stays O(log n), depth at most 34 here.
        </>
      ),
      duration: 8.4,
      Visual: S.StillAmortized,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          Back to the service. With 2 moves per append no append takes more than 3 ticks, and requests arrive 4 apart, so no queue ever forms: request p99 and max are 3 ticks, against 494,289 and 524,289. Same total writes; the median rose from 1 to 3.
          And every tick charged a write the same, wherever in memory it landed.
        </>
      ),
      duration: 6.4,
      Visual: S.Back,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          The vector holds 1,048,576 keys and is full. With incremental copying at 2 keys per append, for how many appends are both buffers alive, and what does the costliest append write?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '1 append; 1,048,577 writes' }, { label: '524,288 appends; 3 writes', correct: true }, { label: '1,048,576 appends; 2 writes' }, { label: '262,144 appends; 5 writes' }],
        explain: (
          <>
            524,288 appends, 3 writes. Append 1,048,577 allocates 2,097,152 slots; moving 1,048,576 keys at 2 per append takes 524,288 appends, until n = 1,572,864. Meanwhile both buffers, 3,145,728 slots or 24 MiB, stay alive. Each of those appends writes
            its key and moves 2.
          </>
        ),
      },
      Visual: S.Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: (
        <>
          A teammate’s get(i) reads the new buffer for every index while a copy runs. Right after append 9 (old size 8, frontier k = 2), what does get(5) return?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: 'Key 6: both buffers hold it' }, { label: 'An empty slot of the new buffer', correct: true }, { label: 'Key 6, because moves go oldest first' }, { label: 'An index error' }],
        explain: (
          <>
            An empty slot. Only indices below k = 2 have moved; new slots 2 to 7 are still empty, and slot 8 holds key 9. Reads must check the frontier: old buffer if k ≤ i &lt; m, else the new one. Writes need the same rule, or a later move overwrites the
            new value with the old one.
          </>
        ),
      },
      Visual: S.Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: (
        <>
          A nightly batch job appends a billion keys to a vector, and only its total running time matters. A reviewer asks you to switch to incremental copying. Do you agree?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes: a worst-case bound always beats an amortized one' },
          { label: 'No: same total writes, and nothing waits on the tail', correct: true },
          { label: 'Yes: it halves the copies' },
          { label: 'No: incremental copying makes appends O(log n)' },
        ],
        explain: (
          <>
            No. Both vectors write 2,073,741,823 elements; the incremental one also pays a comparison on every read and holds two buffers longer. Its gain is the tail, and in a batch no request queues behind the 536,870,913-write append. Deamortize when
            something waits on single operations: requests, frames, a fan-out.
          </>
        ),
      },
      Visual: S.Q3,
    },
  ],
};

export default reel;
