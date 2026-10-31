import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Scan-resistant policies: LFU with decay, 2Q, ARC and LIRS, each remembering one thing plain
// recency discards, all measured against the same scan that flushed exact LRU and CLOCK in the
// previous topic. Every number shown is computed or asserted in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Can a cache remember something besides recency?',
      body: (
        <>
          The previous topic measured it directly: one scan larger than the cache flushed every
          hot entry out, under exact recency and under its cheaper approximation alike. Recency
          alone can't tell a page touched once from a page reused constantly. What else could a
          cache keep track of?
        </>
      ),
      duration: 4.4,
      fig: 'measured before: a scan flushes recency-only caches',
      Visual: S.Hook,
    },
    {
      title: 'Evict the least frequently used',
      body: (
        <>
          Count hits instead of timestamps. A scan's pages, each touched once, can never outrank
          a page that's been touched hundreds of times — the hot set survives the scan untouched.
        </>
      ),
      duration: 4,
      fig: 'a hit count per entry, not a timestamp',
      Visual: S.LFU,
    },
    {
      title: 'A rule that never forgets',
      body: (
        <>
          A count only ever goes up when something is touched, and this rule never resets it on
          its own. What goes wrong with a cache that counts hits and never, by itself, forgets?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Nothing — more information is always better' },
          { label: 'A page that was hot once stays privileged by the count forever', correct: true },
          { label: 'The count eventually overflows and crashes the cache' },
          { label: 'Only pages touched during a scan are affected' },
        ],
        explain: (
          <>
            It stays privileged forever: a page genuinely popular last week still outranks, by raw
            count, a page that's actually hot today, if nothing ever shrinks the old count back
            down.
          </>
        ),
      },
      fig: 'a count that never resets, even once popularity fades',
      Visual: S.NeverForgets,
    },
    {
      title: "Decay, and Redis's real counter",
      body: (
        <>
          Periodically shrink every count, so an old count loses its privilege once nothing
          refreshes it. Redis's own implementation makes this cheap: a tiny probabilistic counter,
          a handful of bits per key, that grows more slowly as it climbs and decays on a timer —
          measured on this topic's own trace, decay keeps the scan survival with no permanent
          favourites.
        </>
      ),
      duration: 5,
      fig: 'a shrinking count, and a real probabilistic counter',
      takeaway: 'Counting hits survives a scan; decaying those counts is what keeps an old favourite from staying privileged forever.',
      Visual: S.Decay,
    },
    {
      title: 'The ghost list idea',
      body: (
        <>
          Give a first-time entry a short holding queue instead of the real cache. If it's never
          asked for again, it simply falls out — but its identifier moves to a second, smaller
          queue that remembers it was here. Ask for it again while it's still remembered, and only
          then does it earn a seat in the real cache.
        </>
      ),
      duration: 4.6,
      fig: 'a holding queue, then a queue that only remembers names',
      Visual: S.GhostIdea,
    },
    {
      title: 'What does a ghost entry cost?',
      body: (
        <>
          That second queue remembers that an entry was recently here. Does remembering that cost
          as much as keeping the entry itself, or far less?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'The same — remembering anything about an entry needs its full data' },
          { label: 'Far less — only the identifier, never the data itself', correct: true },
          { label: 'Nothing — the queue is free to maintain' },
          { label: 'It depends on how large the original entry was' },
        ],
        explain: (
          <>
            Far less: the ghost queue never holds a value, only a name. "Have I seen this key
            before" is a question a few bytes can answer, regardless of how large the entry
            itself is.
          </>
        ),
      },
      fig: 'an identifier, a few bytes, never the data',
      Visual: S.GhostCost,
    },
    {
      title: '2Q, measured against the same scan',
      body: (
        <>
          A scan's pages pass straight through the first-time queue and into the ghost queue
          without ever earning a seat in the protected list — one touch each is never enough.
          Measured on the same scan that flushed exact recency: the hot set's hit rate afterward
          barely moves.
        </>
      ),
      duration: 5,
      fig: 'measured: the hot set holds, right through the scan',
      takeaway: "A scan's pages are each touched exactly once, which a ghost-promotion rule treats as never earning a real seat.",
      Visual: S.TwoQReveal,
    },
    {
      title: 'What does a ghost hit say?',
      body: (
        <>
          Suppose an entry's identifier is sitting in a ghost queue, and it gets asked for again.
          That's a real signal about the cache's own setup. What does it say?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Nothing — a ghost hit is just bad luck' },
          { label: "The queue that entry left was too small to keep it", correct: true },
          { label: 'The cache needs to be made larger overall' },
          { label: 'The entry should never have been evicted in the first place' },
        ],
        explain: (
          <>
            It says that queue was too small: the entry would have still been there, resident,
            had that list been given a little more room — which is exactly the signal a
            self-tuning cache can act on.
          </>
        ),
      },
      fig: 'a ghost hit names which list was too small',
      Visual: S.ArcPredict,
    },
    {
      title: 'ARC adapts, by hand',
      body: (
        <>
          Watch a short trace: an entry leaves the recency list, its identifier lands in that
          list's own ghost queue, and the very next time it's asked for, the recency list's
          target size grows by one — no person tuned that number, and nothing here counts
          frequency at all.
        </>
      ),
      duration: 5,
      fig: 'measured: one ghost hit, one grown target size',
      takeaway: 'A ghost hit is all a self-tuning cache needs: it grows the exact list that just proved too small.',
      Visual: S.ArcReveal,
    },
    {
      title: 'Reuse distance',
      body: (
        <>
          Instead of asking how long ago an entry was touched, ask how many other distinct
          entries were touched in between its last two uses. A loop that revisits the same set of
          entries, slightly larger than the cache, gives every entry inside it a small, bounded
          distance — no matter how much time the loop itself takes.
        </>
      ),
      duration: 4.6,
      fig: 'distinct entries between two uses, not elapsed time',
      Visual: S.ReuseDistance,
    },
    {
      title: 'The measured comparison',
      body: (
        <>
          Side by side, right after the same scan: the two policies that only knew recency, and
          the four that each remembered one thing more.
        </>
      ),
      duration: 4.2,
      fig: 'measured: recency-only drops, the rest hold',
      Visual: S.Comparison,
    },
    {
      title: 'Recap',
      body: (
        <>
          Each policy remembers one more thing than plain recency, and pays something extra for
          it — a count and a decay tick, a ghost identifier, an adapted split, a distance. The
          cheapest thing any of them remembers is a ghost holding nothing but a name.
        </>
      ),
      duration: 4,
      fig: 'one extra signal each, at one extra cost each',
      Visual: S.Recap,
    },
  ],
};

export default reel;
