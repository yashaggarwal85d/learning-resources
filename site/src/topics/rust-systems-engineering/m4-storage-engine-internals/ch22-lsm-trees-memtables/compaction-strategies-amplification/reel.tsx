import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Without compaction, every flush is one more file a lookup might have
// to check, forever; real compaction, of either kind, genuinely beats
// that. But leveled and tiered trade real, different costs: tiered
// costs less rewritten data to run, at the price of leaving more files
// and more stale data behind than leveled does. And that rewriting
// work itself has to be budgeted against the writes it serves.
const reel: Reel = {
  steps: [
    {
      title: "Flush memtables to SSTables over and over, with no compaction at all. As more and more flushes pile up, does a lookup's own cost ever stop growing?",
      body: (
        <>
          Many flushes, no compaction, ever.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, it levels off once there is enough data' },
          { label: 'No, genuinely; every new flush is one more SSTable a lookup might have to check', correct: true },
          { label: 'It depends only on how many distinct keys exist, not on flush count' },
        ],
        explain: (
          <>
            No, genuinely. Every flush adds one more file to check.
          </>
        ),
      },
      Visual: S.NoCompactionPredict,
    },
    {
      title: 'Measured: the run count genuinely kept growing',
      body: (
        <>
          The real, measured run count, growing with each flush.
        </>
      ),
      duration: 3.0,
      takeaway: 'Without compaction, every flush is one more file a lookup might have to check, forever.',
      Visual: S.NoCompactionReveal,
    },
    {
      title: 'Run a real leveled compactor and a real tiered compactor against that same pile of flushes instead. Do both of them at least beat doing no compaction at all, on how many files a lookup has to check and how much stale data sits on disk?',
      body: (
        <>
          The same flushes, through two real compactors.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Only one of the two strategies actually beats no compaction' },
          { label: 'Both genuinely beat no compaction, on both measures', correct: true },
          { label: 'Neither beats no compaction; compacting costs more than it saves' },
        ],
        explain: (
          <>
            Both beat it. Real compaction always helps over none at all.
          </>
        ),
      },
      Visual: S.BothBeatPredict,
    },
    {
      title: 'Measured: both leveled and tiered compaction genuinely beat no compaction at all, on both read and space amplification',
      body: (
        <>
          The real, measured comparison, both strategies ahead.
        </>
      ),
      duration: 3.0,
      takeaway: 'Real compaction, of either kind, genuinely beats never compacting at all.',
      Visual: S.BothBeatReveal,
    },
    {
      title: 'Leveled and tiered compaction get fed the exact same sequence of flushes. Do they cost the same amount of extra, rewritten data to actually run?',
      body: (
        <>
          The same flushes, two different compactors.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the total bytes rewritten end up the same either way' },
          { label: 'No, genuinely; the two strategies cost different amounts of rewritten data', correct: true },
          { label: 'It depends only on how many distinct keys exist, not on the strategy' },
        ],
        explain: (
          <>
            No, genuinely. The two strategies cost different amounts.
          </>
        ),
      },
      Visual: S.WriteAmpPredict,
    },
    {
      title: 'Measured: leveled and tiered compaction genuinely cost different amounts of rewritten data on the identical workload, with tiered costing less',
      body: (
        <>
          The real, measured write cost, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: "Tiered compaction merges less often, which genuinely costs less rewritten data than leveled's own repeated merges.",
      Visual: S.WriteAmpReveal,
    },
    {
      title: 'That same tiered compactor costs less rewritten data. Does it also leave fewer files for a lookup to check, and less stale data sitting on disk, than leveled does?',
      body: (
        <>
          The same two compactors, a different measure.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, costing less to run also means it leaves less behind' },
          { label: 'No, genuinely; it leaves more files and more stale data behind than leveled does', correct: true },
          { label: 'It leaves exactly the same amount either way' },
        ],
        explain: (
          <>
            No, genuinely. It leaves more files and more stale data behind.
          </>
        ),
      },
      Visual: S.ReadAmpPredict,
    },
    {
      title: 'Measured: the tiered compactor that cost less rewritten data genuinely left more files to check and more stale data on disk than leveled did',
      body: (
        <>
          The real, measured read and space cost, side by side.
        </>
      ),
      duration: 3.0,
      takeaway: "Costing less to run and costing less to read aren't the same thing; a strategy trades one against the other.",
      Visual: S.ReadAmpReveal,
    },
    {
      title: "RocksDB's own wiki names directly why compaction itself can't just run flat out: what happens if writes keep coming in faster than flush and compaction can keep up?",
      body: (
        <>
          The real system's own words on write stalls, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.WriteStallsReveal,
    },
    {
      title: 'Recap: what compacting at all buys, and what leveled trades against tiered',
      body: (
        <>
          Without compaction, every flush is one more file a lookup might have to check, forever; real compaction, of either kind, genuinely beats that. But leveled and tiered trade real, different costs: tiered costs less rewritten data to run, at the price of leaving more files and more stale data behind than leveled does. And that rewriting work itself has to be budgeted against the writes it serves, exactly as RocksDB's own documentation names directly.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
