import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is measured against a real local Apache Spark 4.0.1 session (examples.py):
// a groupBy shuffle over four map tasks writes four shuffle data files and four index files, one
// pair per map task; the same row count split across eight map tasks writes eight new pairs
// instead, diffed against the first run's files rather than resetting the local directory (which
// crashes Spark's BlockManager mid-session). Index-file bytes stay far smaller than data-file
// bytes at every scale measured.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Four map tasks run a shuffle, each one sorting and spilling its rows for a groupBy.
          Before we look, how many files actually land on disk when they're done?
        </>
      ),
      duration: 4.5,
      fig: 'four map tasks write a shuffle. How many files land on disk?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: one pair per map task',
      body: (
        <>
          Measured directly: four map tasks write exactly four shuffle data files and four
          separate index files. One pair, per map task, no more and no fewer.
        </>
      ),
      duration: 4.8,
      fig: '4 map tasks: 4 shuffle data files, 4 index files, one pair each.',
      Visual: S.RevealFourAndFour,
    },
    {
      title: 'Predict: the same rows, more map tasks',
      body: (
        <>
          Same million rows, same groupBy, but now split across eight map tasks instead of four.
          Does the file count grow with the task count, or stay put since the data is unchanged?
        </>
      ),
      duration: 2.8,
      fig: 'same data, eight map tasks instead of four. Same four files, or eight?',
      predict: {
        options: [
          { label: 'Still four of each — the data volume never changed' },
          { label: 'Eight of each — file count tracks map tasks, not data volume', correct: true },
        ],
        explain: (
          <>
            A map task writes its own data file and its own index file, full stop, regardless of
            how many rows pass through it or how many other tasks exist. Eight map tasks always
            means eight pairs, even over the exact same underlying rows.
          </>
        ),
      },
      Visual: S.PredictEightPartitions,
    },
    {
      title: 'Reveal: eight map tasks, eight pairs',
      body: (
        <>
          Measured: the identical million rows, now split across eight map tasks, write eight new
          data files and eight new index files. Nothing about the data volume moved the count.
        </>
      ),
      duration: 4.8,
      fig: '4 map tasks: 4 pairs. 8 map tasks, same data: 8 new pairs.',
      takeaway: 'File count tracks map-task count, never data volume — one data file and one index file per map task, always.',
      Visual: S.RevealEightAndEight,
    },
    {
      title: 'Reveal: how a reducer finds its blocks',
      body: (
        <>
          Every map task reports its block locations back to the driver the moment it finishes. A
          reducer about to fetch its share asks the MapOutputTracker where those blocks actually live.
        </>
      ),
      duration: 4.8,
      fig: "map task finishes: reports locations. Reducer: asks the MapOutputTracker first.",
      takeaway: 'The MapOutputTracker is the map from map-task output to executor location, consulted before any network fetch.',
      Visual: S.RevealMapOutputTracker,
    },
    {
      title: 'Predict: grow the reduce side instead',
      body: (
        <>
          This time, hold the four map tasks fixed and grow the number of reduce buckets instead.
          Does the number of logical blocks fetched grow the same way growing map tasks did?
        </>
      ),
      duration: 2.8,
      fig: 'same 4 map tasks, more reduce buckets. Does the block count grow too?',
      predict: {
        options: [
          { label: "No — blocks only depend on map tasks, reduce buckets don't add any" },
          { label: 'Yes — every map task\'s one file already covers every bucket, so blocks scale with both', correct: true },
        ],
        explain: (
          <>
            Each map task's single sorted file holds a contiguous span for every reduce bucket, not
            just one. Add a bucket, and every map task's file now has one more span inside it — the
            block count is the product of the two counts, not the sum.
          </>
        ),
      },
      Visual: S.PredictReducePartitions,
    },
    {
      title: 'Reveal: blocks scale as M times R',
      body: (
        <>
          With four map tasks and ninety-seven buckets, the shuffle already carries three hundred
          eighty-eight logical blocks. Grow either count, and the product grows with it — never flat.
        </>
      ),
      duration: 4.8,
      fig: '4 map tasks x 97 buckets = 388 logical blocks. Grow either side, blocks grow too.',
      takeaway: "Logical block count is the product of map tasks and reduce partitions, so both counts drive it up.",
      Visual: S.RevealMxR,
    },
    {
      title: 'Recap',
      body: (
        <>
          Each map task writes one sorted data file and one index file. Reducers find those files
          through the MapOutputTracker, then fetch M times R small blocks over the network — disk,
          network, serialisation and that small-block count are most of a shuffle's real cost.
        </>
      ),
      duration: 4.8,
      fig: 'one file pair per map task; M times R blocks fetched; that is most of the cost.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
