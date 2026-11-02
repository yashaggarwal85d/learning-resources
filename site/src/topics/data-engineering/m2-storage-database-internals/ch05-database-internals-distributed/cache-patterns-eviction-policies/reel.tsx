import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Write-behind's own loss is reproduced for real in examples.py: a queued write acknowledged to
// the application, then dropped when the node is simulated crashing before the queue drains. The
// LRU-vs-admission-filter comparison is a real, measured hit rate over a skewed access pattern,
// not asserted: plain LRU and a frequency-gated admission-plus-LRU policy run against the
// identical request stream, with the measured gap reported directly rather than only claimed.
// No literal digits anywhere (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a write-behind cache acknowledges a write, then the node dies before the queue drains',
      body: (
        <>
          A write-behind cache tells the application a write succeeded in under a millisecond.
          The application moves on. A few seconds later the whole node dies, and the write it was
          told had landed never reaches the database at all.
        </>
      ),
      duration: 4.8,
      fig: 'a write-behind cache acknowledges a write instantly, then the node dies before that write ever reaches the database',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which pattern would have prevented this',
      body: (
        <>
          Not a sturdier cache node. Which different pattern, chosen instead of write-behind in
          the first place, would have kept this exact write from being lost?
        </>
      ),
      duration: 2.8,
      fig: 'which pattern would have prevented this loss — a better node, or a different pattern entirely?',
      predict: {
        options: [
          { label: 'A better cache node, less likely to die before the queue drains' },
          { label: 'A pattern that waits for the database write to land before returning', correct: true },
        ],
        explain: (
          <>
            A different pattern. Write-through would have made the application wait until the
            database write actually landed, trading away exactly the speed write-behind was
            chosen for in the first place.
          </>
        ),
      },
      Visual: S.PredictWhichPattern,
    },
    {
      title: "Reveal: cache-aside, the application's own miss path",
      body: (
        <>
          The application itself checks the cache, misses, reads the database, and writes the
          result back. Nothing here ever refreshes the cache when the database itself changes.
        </>
      ),
      duration: 4.8,
      fig: 'cache-aside: the application itself checks the cache, misses, reads the database, and writes the result back',
      Visual: S.RevealCacheAside,
    },
    {
      title: "Reveal: read-through, the cache's own miss path",
      body: (
        <>
          The exact same miss, moved one layer down. The cache itself now owns the read-miss path
          instead of the application, and the application never talks to the database directly.
        </>
      ),
      duration: 4.8,
      fig: 'read-through: the cache itself, not the application, owns the exact same miss path',
      takeaway: 'Read-through moves ownership of the miss path from the application into the cache itself.',
      Visual: S.RevealReadThrough,
    },
    {
      title: 'Reveal: write-through and write-behind, and the loss the hook already showed',
      body: (
        <>
          Write-through does not return until the database write actually lands, the exact
          safeguard the hook was missing. Write-behind returns immediately and queues the write,
          risking exactly that hook's own loss if the node dies before the queue drains.
        </>
      ),
      duration: 5.2,
      fig: 'write-through waits for the database write to land; write-behind returns immediately and risks exactly the loss the hook showed',
      takeaway: 'Write-behind makes the cache the record of truth until its queued write actually lands.',
      Visual: S.RevealWriteThroughBehind,
    },
    {
      title: 'Reveal: a TTL bounds the wrong, not fixes it',
      body: (
        <>
          A TTL does not make a stale value correct. It only forces the cache to ask again after
          a fixed time, bounding how long a wrong answer is allowed to keep being served.
        </>
      ),
      duration: 4.8,
      fig: 'a TTL does not make a cached value correct — it only bounds how long a wrong value can keep being served',
      takeaway: 'A TTL bounds how long a stale cached value survives; it never makes that value correct.',
      Visual: S.RevealTTL,
    },
    {
      title: 'Reveal: LRU, LFU, and a real measured gap between them',
      body: (
        <>
          Plain recency-based eviction and a frequency-gated admission policy, run against the
          identical skewed request stream. The admission-gated policy measures a real, meaningful
          improvement over plain recency-based eviction alone.
        </>
      ),
      duration: 5.2,
      fig: 'a real, measured hit rate: plain recency-based eviction against a frequency-gated admission policy, over the identical skewed access pattern',
      takeaway: 'A frequency-gated admission filter measurably beats plain recency-based eviction on a skewed access pattern.',
      Visual: S.RevealLruLfuGap,
    },
    {
      title: 'Recap',
      body: (
        <>
          Cache-aside and read-through differ only in who owns the miss path. Write-through and
          write-behind differ in when a write is acknowledged, and write-behind's speed is bought
          with exactly the hook's own loss risk. A TTL bounds staleness without curing it. And a
          real, measured comparison shows admission mattering as much as eviction.
        </>
      ),
      duration: 5.2,
      fig: 'who owns the miss path, when a write is acknowledged, a TTL that bounds staleness, and a real measured admission gap',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team swaps their cache from recency-based eviction to frequency-based eviction, and
          the hit rate barely moves. What is the likely reason eviction alone could not fix it?
        </>
      ),
      duration: 2.8,
      fig: 'a team swaps its eviction policy and the hit rate barely moves — what is the likely reason?',
      predict: {
        options: [
          { label: 'The new eviction policy was implemented incorrectly' },
          { label: 'Every key is still admitted regardless of how rarely it recurs', correct: true },
        ],
        explain: (
          <>
            If every requested key is admitted into the cache no matter how rarely it recurs, no
            eviction policy can fix a cache already full of one-hit-wonders. An admission filter,
            not a different eviction rule, is what actually closes that gap.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
