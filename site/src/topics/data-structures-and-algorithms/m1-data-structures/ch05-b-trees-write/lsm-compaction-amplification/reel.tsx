import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The previous topic built the runs a write path leaves behind. This topic pays for them: what
// compaction actually does once they pile up, and what it costs to do it. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: 'Flushing a full memtable to its own run solves the write problem, but only by deferring it: every run flushed is one more run every read has to check, and one more copy of every key compaction will eventually have to rewrite.',
      body: (
        <>
          The previous topic built the runs. This one pays for them: what compaction actually does
          once they pile up, and what that costs.
        </>
      ),
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "A read already has to check every one of these runs, oldest to newest. What should a real system do about the runs piling up?",
      body: <>A read already checks every run, oldest to newest. What should happen to the pile?</>,
      duration: 2,
      fig: 'CompactionPredict',
      predict: {
        options: [
          { label: 'Nothing — more runs just means more disk, which is cheap' },
          { label: 'Merge every run into one single run on every flush' },
          { label: 'Merge some runs together sometimes, trading I/O now for less I/O per read later', correct: true },
          { label: 'Delete the oldest runs once there are too many' },
        ],
        explain: (
          <>
            Merging everything on every flush pays the rewrite cost constantly; deleting old runs
            would silently lose live data. Compaction is a schedule, not an instant fix.
          </>
        ),
      },
      Visual: S.CompactionPredict,
    },
    {
      title: 'One answer: leveled compaction. Each level holds one non-overlapping sorted run with its own size target; once a level grows past its target, the run merges down into the next level, rewriting every key it touches.',
      body: (
        <>
          A read checks at most one run per level. A key that lands near the top can still be
          rewritten again at every level it passes through on the way down.
        </>
      ),
      duration: 4.3,
      fig: 'LeveledReveal',
      Visual: S.LeveledReveal,
    },
    {
      title: 'A different answer: tiered compaction. Several runs of similar size accumulate at a level; only once enough of them pile up are they all merged together into one wider run one level down.',
      body: (
        <>
          A key gets rewritten far less often this way. The price is a read that now has to check
          every accumulated run at a level, not just one.
        </>
      ),
      duration: 4.3,
      fig: 'TieredReveal',
      takeaway: "Leveled rewrites a key more often to keep a read's run count low. Tiered does the reverse.",
      Visual: S.TieredReveal,
    },
    {
      title: 'Three numbers measure what either policy actually costs: write amplification, extra bytes written beyond the one logical write; read amplification, extra runs a read checks beyond the one it needs; space amplification, extra on-disk bytes beyond the live data itself.',
      body: (
        <>
          Every compaction policy is a choice about which of these three to pay down, and which
          to let grow instead.
        </>
      ),
      duration: 4,
      fig: 'AmplificationDefine',
      Visual: S.AmplificationDefine,
    },
    {
      title: 'Leveled keeps read amplification and space amplification low. Tiered keeps write amplification low. Can one policy win on all three at once?',
      body: <>Can one compaction policy win on write, read, and space amplification all at once?</>,
      duration: 2,
      fig: 'TradeoffPredict',
      predict: {
        options: [
          { label: 'Yes — a well-tuned hybrid wins on all three' },
          { label: 'No — minimizing any two forces the third up', correct: true },
          { label: 'Yes, but only once the data is small enough' },
          { label: 'No policy has ever actually tried' },
        ],
        explain: (
          <>
            A hybrid is still built from the same two moves, merge-now or merge-later, just applied
            selectively — it inherits both costs in proportion, it doesn't cancel either one.
          </>
        ),
      },
      Visual: S.TradeoffPredict,
    },
    {
      title: 'Leveled minimizes space amplification at the cost of read and write amplification. Tiered minimizes write amplification at the cost of read and space amplification. A hybrid lands between both on the axes it mixes — it relocates the trade, not escapes it.',
      body: (
        <>
          No arrangement of the same mechanism, merge now or merge later, makes all three numbers
          small together.
        </>
      ),
      duration: 4.5,
      fig: 'TradeoffReveal',
      takeaway: 'A hybrid compaction policy is a different point on the same trade-off, not an escape from it.',
      Visual: S.TradeoffReveal,
    },
    {
      title: "One piece of this cost is tunable on its own: the Bloom filter at every level. Most systems give every level's filter the same false-positive rate. Monkey's result: a tighter filter on a smaller level and a looser one on a bigger level lowers the total read cost for the same total memory.",
      body: (
        <>
          A lookup's worst-case cost is the sum of every level's false-positive rate, so memory is
          best spent where tightening a filter buys back the most.
        </>
      ),
      duration: 4.5,
      fig: 'MonkeyReveal',
      Visual: S.MonkeyReveal,
    },
    {
      title: 'Dostoevsky goes further: it treats leveled and tiered as two ends of one spectrum and picks a point on it per workload, merging only at the largest level by default and merging more only where a workload actually demands it.',
      body: (
        <>
          There is still no setting that minimizes read, write, and space amplification together —
          Dostoevsky just finds the best available point for a given workload.
        </>
      ),
      duration: 4.5,
      fig: 'DostoevskyReveal',
      takeaway: 'Every write-optimized design trades read, write and space amplification against each other — no policy minimizes all three.',
      Visual: S.DostoevskyReveal,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: write, read, and space amplification for leveled and tiered
          compaction on the identical workload, and a per-level Bloom-filter memory split that beats
          a uniform one at the same total memory.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
