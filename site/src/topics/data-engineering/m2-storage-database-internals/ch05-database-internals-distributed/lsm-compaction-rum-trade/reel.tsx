import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results against a real Postgres cluster and a real RocksDB instance in this sandbox
// (examples.py): the identical 2000-key, shuffled write pattern settles to 3 live files under
// RocksDB's leveled compaction style and 4 under its tiered (universal) style; a FIFO-style store
// with a 100-kilobyte cap drops its oldest round's own key once written well past that cap, while
// the newest round's own key stays; with level0_slowdown_writes_trigger set to 2, the same write
// pattern leaves RocksDB's own L0 file count at 6, past the trigger; and the chapter's own lab — an
// identical insert-then-half-updated-then-200-random-reads workload — measures roughly 2.61x write
// amplification and 1.89x space amplification on Postgres, against roughly 1.85x and 1.11x on
// RocksDB, with RocksDB's own in-process point-read p99 measured lower in every run (a comparison
// that mixes embedded vs. client-server latency, not pure read amplification, noted on screen).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Sorted runs pile up forever unless something merges them back down. That something is
          compaction. What does it actually cost?
        </>
      ),
      duration: 4.8,
      fig: 'sorted runs pile up forever. Something has to merge them back down. What does it cost?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the same writes, two different shapes',
      body: (
        <>
          The identical shuffled write pattern, run through RocksDB's own two real compaction
          styles, measured directly: leveled compaction settles to a few files. Tiered settles
          to a few more.
        </>
      ),
      duration: 4.8,
      fig: 'one write pattern, two compaction styles. How many files does each settle to?',
      Visual: S.RevealCompactionStyles,
    },
    {
      title: 'Reveal: FIFO, the style that never merges',
      body: (
        <>
          A real FIFO-style store, written well past a 100-kilobyte cap: the oldest round's own
          key is gone. The newest round's own key is still there.
        </>
      ),
      duration: 4.8,
      fig: 'a 100-kilobyte cap, crossed. The oldest key: gone. The newest key: still there.',
      Visual: S.RevealFifoDrops,
    },
    {
      title: 'Predict: the trade-off none of them escape',
      body: (
        <>
          Leveled costs more to write. Tiered costs more to read later. FIFO just throws old
          data away. Is there a compaction style that avoids all three costs?
        </>
      ),
      duration: 2.8,
      fig: 'leveled costs more to write. Tiered costs more to read. Is there a style with neither cost?',
      predict: {
        options: [
          { label: 'Not yet invented, but a cleverer algorithm could find one' },
          { label: 'No — minimizing any two of read, write and space cost makes the third worse, provably', correct: true },
        ],
        explain: (
          <>
            "A cleverer algorithm could fix this" sounds like an engineering-maturity problem.
            It isn't — this has a name and a proof sketch, not just an unsolved gap.
          </>
        ),
      },
      Visual: S.PredictRumTradeoff,
    },
    {
      title: 'Reveal: the RUM conjecture, precisely',
      body: (
        <>
          Read overhead is read amplification. Update overhead is write amplification. Memory
          overhead is space amplification. Each is a precise ratio. Optimize any two, and the
          third gets worse.
        </>
      ),
      duration: 4.8,
      fig: 'read, write and space amplification, each a ratio. Optimize any two: the third worsens.',
      takeaway: "Read, write and space amplification aren't independent knobs. Fixing any two makes the third worse.",
      Visual: S.RevealRumConjecture,
    },
    {
      title: 'Reveal: write stalls, a real trigger crossed',
      body: (
        <>
          A configured trigger, measured directly against a real file count: once too many L0
          files pile up, RocksDB slows writes down on purpose, rather than let the backlog grow
          without limit.
        </>
      ),
      duration: 4.8,
      fig: 'a configured trigger. The real file count, measured. Past it.',
      takeaway: "A write stall isn't RocksDB breaking. It's RocksDB refusing to let space and read amplification grow without limit.",
      Visual: S.RevealWriteStall,
    },
    {
      title: 'Reveal: compaction debt, the same shape as a tombstone',
      body: (
        <>
          A tombstone is uncollected merge work on one key. A write stall is the identical debt,
          system-wide, finally forcing a slowdown. One shape, two scales.
        </>
      ),
      duration: 4.8,
      fig: 'a tombstone: one key. A write stall: a whole column family. The same debt.',
      takeaway: 'A tombstone and a write stall are the same debt, at two different scales: uncollected compaction work.',
      Visual: S.RevealCompactionDebt,
    },
    {
      title: "Reveal: the chapter's own lab — Postgres vs. RocksDB, measured",
      body: (
        <>
          The identical insert-then-update workload, run against a real Postgres cluster and a
          real RocksDB instance: Postgres pays more in write and space amplification. RocksDB's
          own read is faster, but that comparison isn't clean — it's embedded against a network
          round trip, not read amplification alone.
        </>
      ),
      duration: 4.8,
      fig: 'the same workload, two real engines. Write cost, space cost, read latency — measured.',
      Visual: S.RevealRumLab,
    },
    {
      title: 'Recap',
      body: (
        <>
          Leveled, tiered and FIFO are three points on one triangle. The RUM conjecture names
          what none of them escape. This chapter's own lab shows exactly what two real engines
          pay for where they sit on it.
        </>
      ),
      duration: 4.8,
      fig: 'three compaction styles, one triangle, one conjecture, two real engines measured.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A workload is almost all writes, rarely reads anything back, and disk space is cheap.
          Which engine from this lab actually fits — the B-tree or the LSM tree?
        </>
      ),
      duration: 2.8,
      fig: 'almost all writes, rarely read, space is cheap. Which engine actually fits?',
      predict: {
        options: [
          { label: "The B-tree — it's the more mature, general-purpose choice" },
          { label: 'The LSM tree — it measured paying less for exactly what this workload cares about: writes', correct: true },
        ],
        explain: (
          <>
            "The mature default" is a reasonable prior most of the time. Here it's wrong — this
            chapter's own lab measured the LSM tree paying less for precisely this workload's
            own priority.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
