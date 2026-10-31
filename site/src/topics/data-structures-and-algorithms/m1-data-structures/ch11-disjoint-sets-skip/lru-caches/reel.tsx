import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// LRU caches: an O(1) hash-map-plus-doubly-linked-list cache, the CLOCK approximation that trades
// exact recency for a cheap hit, and Redis's sampled approximation, all replayed against the same
// trace and measured against each other's miss ratio. Every number shown is computed or asserted
// in examples.py.
const reel: Reel = {
  steps: [
    {
      title: "A cache that's full",
      body: (
        <>
          A cache holds a handful of entries, and all of them are in use. A new entry needs room,
          and something has to go. With a timestamp on every entry, finding the oldest one means
          scanning all of them — the opposite of what a cache is for. What pair of structures
          finds the oldest entry without ever scanning?
        </>
      ),
      duration: 4.4,
      fig: 'a full cache, a new entry waiting',
      Visual: S.Hook,
    },
    {
      title: 'Two structures, one answer',
      body: (
        <>
          A hash map finds any entry's node without a scan. A doubly linked list keeps every node
          in recency order, most recent at one end. Paired, the map hands the list a node directly
          — and a node that already knows its own neighbours can be unlinked and moved without
          touching anything else, the same splice a plain linked list offers.
        </>
      ),
      duration: 4.6,
      fig: 'a map pointing into a recency-ordered list',
      Visual: S.TwoStructures,
    },
    {
      title: 'What does a hit do, besides read?',
      body: (
        <>
          A lookup on an entry that's already in the cache finds its value right away. Does
          anything else have to happen, or is that lookup finished the moment the value is read?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: "Nothing else — reading a value shouldn't change anything" },
          { label: 'The entry has to move to the front of the recency order', correct: true },
          { label: 'Only the hash map changes, never the list' },
          { label: 'Only entries about to be evicted need to move' },
        ],
        explain: (
          <>
            It moves: the whole point of recency order is that it reflects every touch, not only
            writes. So a read also has to reorder the list — a lookup is a write to shared state,
            which matters the moment more than one thread is doing it.
          </>
        ),
      },
      fig: 'a hit slides its entry to the front',
      Visual: S.HitDoes,
    },
    {
      title: 'O(1), measured directly',
      body: (
        <>
          Every get and put touches a small, fixed number of pointers — measured directly at a
          capacity of one hundred, and again at a capacity five hundred times larger. Same bound,
          both times: the cost of an operation never grows with how much the cache holds.
        </>
      ),
      duration: 4.2,
      fig: 'measured: the same small bound at both sizes',
      takeaway: "A node that knows its own neighbours turns a cache's busiest operation into a fixed, tiny amount of pointer work.",
      Visual: S.O1Measured,
    },
    {
      title: 'The replay',
      body: (
        <>
          A dozen requests, a cache that holds three. Watch which entries survive and which get
          pushed out as the same few keys come back again and again, and which one is still there
          the second time it's asked for.
        </>
      ),
      duration: 4.2,
      fig: 'twelve accesses, three slots, replayed by hand',
      Visual: S.Replay,
    },
    {
      title: 'What would make a hit cheaper?',
      body: (
        <>
          A hit under exact recency order costs a reorder — real pointer work, on a structure
          every thread shares. What would make a hit cost less, if giving up some precision about
          exactly which entry was used most recently was an acceptable trade?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Nothing can make a hit cheaper than a reorder' },
          { label: 'Approximate the order instead of keeping it exact', correct: true },
          { label: 'Keep the exact order but skip it on every other hit' },
          { label: 'Move the reorder to the eviction step instead' },
        ],
        explain: (
          <>
            Approximate it: give up knowing precisely which of several recently touched entries is
            the most recent, in exchange for a hit that costs almost nothing.
          </>
        ),
      },
      fig: 'trade exact order for a cheaper hit',
      Visual: S.HitCheaper,
    },
    {
      title: 'CLOCK, the lock-friendly approximation',
      body: (
        <>
          A reference bit per entry and a hand sweeping a circle: a hit costs one bit set, nothing
          else. On eviction, the hand clears bits as it sweeps and stops at the first one already
          clear. Measured on the same replay: CLOCK's miss ratio lands within a hair of exact
          LRU's, for a hit that never touches a pointer.
        </>
      ),
      duration: 5,
      fig: 'measured: CLOCK nearly matches exact LRU',
      takeaway: 'A reference bit and a sweeping hand buy almost the same accuracy as an exact order, far cheaper per hit.',
      Visual: S.ClockReveal,
    },
    {
      title: 'What happens when one giant scan runs through?',
      body: (
        <>
          A cache is full of entries used constantly. One enormous one-time scan — a report, a
          backup — touches a run of pages larger than the whole cache, each exactly once. What
          happens to the hot entries that were there before the scan started?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: "Nothing — recency protects entries used constantly" },
          { label: 'The scan evicts them, because recency alone looks the same either way', correct: true },
          { label: 'Only CLOCK loses them; exact LRU is unaffected' },
          { label: 'Only entries smaller than the scan are at risk' },
        ],
        explain: (
          <>
            The scan evicts them: to a rule that only looks at "was this touched recently," a page
            used once during the scan looks identical to a page used constantly — both were just
            touched. Recency alone can't tell the two apart.
          </>
        ),
      },
      fig: 'one scan, larger than the cache',
      Visual: S.ScanPredict,
    },
    {
      title: 'A scan really does flush it',
      body: (
        <>
          Measured directly: the hit rate right after a scan is substantially lower than the same
          measurement with no scan in between, under exact LRU and under CLOCK alike. Redis's own
          sampled approximation — no ordered structure at all, just a few random candidates per
          eviction — does a little worse still on the same replay, the price of zero bookkeeping.
        </>
      ),
      duration: 5,
      fig: 'measured: a scan drops the hit rate, either policy',
      takeaway: "Recency alone has no way to protect a working set from a single pass through something bigger than the cache.",
      Visual: S.ScanReveal,
    },
    {
      title: 'Recap',
      body: (
        <>
          A hash map plus a doubly linked list gives O(1), at the cost of a reorder on every hit.
          CLOCK trades exact order for a cheap hit, at almost no cost in accuracy, on this replay.
          Neither one survives a single scan larger than the cache — which is exactly what's next.
        </>
      ),
      duration: 4,
      fig: 'three answers, one shared failure mode',
      Visual: S.Recap,
    },
  ],
};

export default reel;
