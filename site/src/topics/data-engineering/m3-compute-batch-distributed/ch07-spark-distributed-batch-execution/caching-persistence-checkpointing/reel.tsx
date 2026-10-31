import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured against real PySpark 4.0.1 (local[2]) sessions (examples.py): caching a reused
// computation avoids redoing it (confirmed via an accumulator counting real UDF invocations,
// not timing alone); a MEMORY_ONLY cache that's evicted under real memory pressure is fully
// recomputed the next time it's touched, while a MEMORY_AND_DISK cache spills the evicted data
// to disk and reads it back without recomputation; and caching a non-deterministic computation
// freezes its output -- uncached, two actions disagree on every row, cached, every later
// action agrees with the first, exactly.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The same piece of work runs twice, back to back. Does Spark remember the first
          answer, or pay the full price all over again?
        </>
      ),
      duration: 4.5,
      fig: 'the same computation, run twice. Remembered, or redone?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the baseline -- uncached, both runs genuinely redo the work',
      body: (
        <>
          Measured: without asking Spark to remember anything, both runs genuinely redo the
          entire computation from scratch — the second run is no cheaper than the first.
        </>
      ),
      duration: 4.8,
      fig: 'uncached: both runs pay the full cost, with nothing carried over.',
      Visual: S.RevealBaselineBothRedo,
    },
    {
      title: 'Predict: cache the same computation. Does run two reuse it?',
      body: (
        <>
          Now cache that same computation before running it twice. Does the second run get to
          reuse the first run's answer, or does it still redo the whole thing?
        </>
      ),
      duration: 2.8,
      fig: 'the same computation, cached this time. Does run two reuse it?',
      predict: {
        options: [
          { label: 'It still redoes the work — caching only matters for I/O, not computation' },
          { label: "It reuses the first run's answer", correct: true },
        ],
        explain: (
          <>
            Caching materializes the result the first time it's needed, then hands that same
            result back on every later action instead of recomputing it.
          </>
        ),
      },
      Visual: S.PredictCacheReuse,
    },
    {
      title: "Reveal: cached -- run one pays once, run two reuses it",
      body: (
        <>
          Measured: the first run pays the full cost and materializes the result. The second
          run reuses it immediately — confirmed directly, not just by timing: the underlying
          computation genuinely does not run a second time.
        </>
      ),
      duration: 4.8,
      fig: 'cached: run one pays once; run two reuses the result, no recomputation.',
      Visual: S.RevealCachedReuses,
    },
    {
      title: 'Elaborate: why -- the cached data sits ready, unused computation behind it',
      body: (
        <>
          Once materialized, the cached data sits ready to hand back as-is. The computation
          that produced it — however expensive — simply goes unused on every later reuse.
        </>
      ),
      duration: 4.8,
      fig: 'the data sits ready; the computation behind it goes unused on reuse.',
      takeaway: 'Caching trades a computation for its materialized data; reuse skips the computation entirely, not just the cost of reading it.',
      Visual: S.ElaborateCacheSitsReady,
    },
    {
      title: 'Predict: memory pressure forces eviction. Does a memory-only cache survive?',
      body: (
        <>
          That cached data is now competing for room with something else, and some of it gets
          pushed out. Does a plain memory-only cache survive that, or does Spark quietly redo
          the lost work later?
        </>
      ),
      duration: 2.8,
      fig: 'memory pressure evicts part of the cache. Does memory-only survive it?',
      predict: {
        options: [
          { label: "It's gone — Spark has to redo that part of the work later", correct: true },
          { label: 'Caching always protects against eviction, whatever the storage level' },
        ],
        explain: (
          <>
            A memory-only cache has nowhere else to put an evicted partition — the only way
            back is recomputing it from the original computation.
          </>
        ),
      },
      Visual: S.PredictEvictionChoice,
    },
    {
      title: 'Reveal: memory-only recomputes, memory-and-disk reads back',
      body: (
        <>
          Measured: a memory-only cache that's evicted is fully recomputed the next time it's
          touched. A cache allowed to spill to disk instead is simply read back — no
          recomputation at all.
        </>
      ),
      duration: 4.8,
      fig: 'memory-only: recomputed in full. memory-and-disk: read back, no recompute.',
      Visual: S.RevealRecomputeVsDisk,
    },
    {
      title: 'Elaborate: why -- the storage level decides what eviction costs you',
      body: (
        <>
          The storage level you choose is exactly the decision for what happens when room runs
          out: forgotten and recomputed later, or written to disk once and read back cheaply.
        </>
      ),
      duration: 5,
      fig: 'the storage level decides: redo the work, or read it back from disk.',
      takeaway: 'A storage level is the choice of what eviction costs: memory-only recomputes a lost piece; disk-backed reads it back instead.',
      Visual: S.ElaborateStorageLevelDecides,
    },
    {
      title: 'Reveal: a non-deterministic answer, frozen once cached',
      body: (
        <>
          Measured: a computation whose own answer is allowed to change every time it runs
          disagrees on every row across two uncached actions. Cache it once, and every later
          action agrees with that first answer, exactly, on every row.
        </>
      ),
      duration: 5,
      fig: "uncached: every row disagrees across runs. cached: every row matches, every time.",
      Visual: S.RevealNondeterministicFrozen,
    },
    {
      title: 'Recap',
      body: (
        <>
          Caching trades a computation for its data, and the chosen storage level decides what
          losing part of that data later actually costs you — while locking in one answer from
          a computation that was never promised to give the same one twice.
        </>
      ),
      duration: 5,
      fig: 'caching trades work for data; the level decides the cost; it also freezes the answer.',
      takeaway: 'Caching a non-deterministic computation freezes one answer; without it, the same rows can disagree with themselves across runs.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
