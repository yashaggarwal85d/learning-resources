import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Topics 26-27 spent two topics making an in-place page's bytes count for more. This topic
// refuses the whole premise: never update a page in place at all. Every number is in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Every technique so far still updates a page in place, paying its I/O cost immediately on every write. The next structure refuses that trade entirely: never update in place, write sequentially, and pay the cost back later, on its own schedule.",
      body: (
        <>
          Topics twenty-six and twenty-seven spent a whole chapter making an in-place page's
          bytes count for more. This structure sidesteps the problem instead of solving it.
        </>
      ),
      duration: 4,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: 'Every write is appended to a write-ahead log before anything else happens, so a crash between landing in memory and reaching its real home can still be recovered by replaying the log in order.',
      body: (
        <>
          The log exists for exactly one failure mode: power lost or a crash before the write
          reaches durable storage anywhere else.
        </>
      ),
      duration: 4,
      fig: 'WAL',
      Visual: S.WAL,
    },
    {
      title: "The write also lands in an in-memory sorted structure, the memtable, which serves new writes and reads directly — it's consulted on every read, so nothing logged is ever invisible to a query.",
      body: (
        <>
          Skipping the memtable on a read would silently return stale data for anything written
          since the last flush.
        </>
      ),
      duration: 4,
      fig: 'Memtable',
      Visual: S.Memtable,
    },
    {
      title: 'The memtable fills up. What actually happens to it?',
      body: <>The memtable fills up. What actually happens to it?</>,
      duration: 2,
      fig: 'FlushPredict',
      predict: {
        options: [
          { label: "It's merged into an existing run on disk" },
          { label: "It's written out whole as a brand-new, never-modified sorted run", correct: true },
          { label: 'Its oldest half is discarded to make room' },
          { label: "It's converted directly into an index" },
        ],
        explain: (
          <>
            Merging into an existing run is a later concern entirely — the structure this topic
            builds just needs somewhere new to put what it already has.
          </>
        ),
      },
      Visual: S.FlushPredict,
    },
    {
      title: "The full memtable is flushed out as one new, immutable sorted run. A fresh, empty memtable takes over immediately, and the write-ahead log behind the flushed memtable can be discarded, since its data now lives safely on disk.",
      body: (
        <>
          Nothing about this run ever changes again. Reading it or compacting it away are the
          only two things that can still happen to it.
        </>
      ),
      duration: 4.3,
      fig: 'FlushReveal',
      takeaway: 'A flushed run is never modified again — reading it or compacting it away are the only two things that can ever happen to it next.',
      Visual: S.FlushReveal,
    },
    {
      title: 'The same key has a value in the memtable and in two older runs on disk. Which value does a read actually return?',
      body: <>Which of the three copies of this key does a read actually return?</>,
      duration: 2,
      fig: 'ReadPredict',
      predict: {
        options: [
          { label: 'The oldest one, because it was written first' },
          { label: 'The newest one', correct: true },
          { label: 'Some merge of all three' },
          { label: 'Whichever is fastest to find' },
        ],
        explain: (
          <>
            A later write or delete always shadows an earlier one for the same key — that's the
            entire rule, and it has nothing to do with which copy happens to be quickest to reach.
          </>
        ),
      },
      Visual: S.ReadPredict,
    },
    {
      title: 'A read checks the memtable first, then every on-disk run from newest to oldest, stopping at the first match it finds.',
      body: (
        <>
          Newest-first isn't an optimization here. It's the only way the structure can know which
          of several copies of a key is the real current value.
        </>
      ),
      duration: 4,
      fig: 'ReadReveal',
      Visual: S.ReadReveal,
    },
    {
      title: "Checking every run for every read doesn't scale. A Bloom filter per run answers definitely-not-here or maybe-here from memory, skipping a run's disk read entirely on a definite no; a fence pointer narrows a maybe down to the one range worth reading.",
      body: (
        <>
          A filter decides whether to open a run at all. A fence pointer decides where inside it
          to look once it's open. Neither one answers the actual question by itself.
        </>
      ),
      duration: 4.5,
      fig: 'SkipWork',
      takeaway: 'A Bloom filter and a fence pointer only ever skip or narrow work — neither one can cause a wrong answer, only waste some.',
      Visual: S.SkipWork,
    },
    {
      title: "A delete can't remove anything in place, because the run holding the old value is immutable. It's recorded instead as its own kind of entry, a tombstone, which has to outrank and hide that older value on every read until a compaction physically drops both of them together.",
      body: (
        <>
          A tombstone is stored and found exactly like a normal write. It has no special shortcut
          that lets it skip being read in its turn.
        </>
      ),
      duration: 4.2,
      fig: 'Tombstone',
      takeaway: 'A tombstone is a write, not an erasure — it has to survive every read on its own until compaction removes it and what it shadows together.',
      Visual: S.Tombstone,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Measured, not assumed: a Bloom filter's observed false-positive rate against its own
          bits-per-key setting, the number of runs a point read actually has to open with and
          without filters and fence pointers on the identical key set, and a tombstone correctly
          shadowing an older value with zero compactions run.
        </>
      ),
      duration: 4,
      fig: 'ProveIt',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
