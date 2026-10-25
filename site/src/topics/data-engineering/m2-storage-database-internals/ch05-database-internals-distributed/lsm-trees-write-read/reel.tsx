import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results against a real RocksDB instance in this sandbox (examples.py, rocksdict): flushing one
// write produces exactly one new SST file; a key overwritten in the active memtable after an earlier
// flush is answered by the memtable alone, with zero hits on the older file; a full scan across a
// flushed file and an overlapping memtable merges into one sorted run, newest value winning; flushing
// 500 keys then deleting and flushing half of them produces a second, separate file made almost
// entirely of tombstones, growing total bytes on disk rather than shrinking them; and 500 lookups for
// keys that don't exist, chosen inside an existing file's own key range, are rejected by its Bloom
// filter in the large majority of cases, with the rest only ever a wasted read, never a wrong answer.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          MVCC never updates a row in place. Vacuum is the bill it pays later for that. What if a
          structure never updated in place on purpose, from the start?
        </>
      ),
      duration: 4.8,
      fig: 'never update in place, on purpose. The LSM tree.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a write, through the memtable and out to a file',
      body: (
        <>
          A write goes to the WAL first, for crash durability, then lands in an in-memory,
          sorted structure, RocksDB's own memtable. Flush that memtable, measured directly on a
          real instance, and it becomes exactly one new file on disk — never edited again.
        </>
      ),
      duration: 4.8,
      fig: 'the WAL, then the memtable. Flush it: one new file appears on disk.',
      Visual: S.RevealMemtableFlush,
    },
    {
      title: 'Predict: which value answers the read',
      body: (
        <>
          A key was flushed to a file, then overwritten again — but that new write hasn't been
          flushed yet. A read comes in. Does it have to check the file at all?
        </>
      ),
      duration: 2.8,
      fig: "a key, flushed, then overwritten again unflushed. Does the read have to check the file?",
      predict: {
        options: [
          { label: 'It checks the file and the memtable, then picks the newer one' },
          { label: "The memtable alone answers it — the file is never touched", correct: true },
        ],
        explain: (
          <>
            "Check both, then pick the newer one" sounds careful and correct — it's actually the
            range-read answer, not this one. A point read stops the moment it finds the key.
          </>
        ),
      },
      Visual: S.PredictNewestFirst,
    },
    {
      title: 'Reveal: a point read checks the newest structure first',
      body: (
        <>
          Measured directly: that read is answered by the memtable alone. RocksDB's own counters
          show it — one memtable hit, zero hits on the older file. The file is never even opened.
        </>
      ),
      duration: 4.8,
      fig: 'memtable hits: one. File hits: zero. The older file is never opened.',
      Visual: S.RevealPointReadNewestFirst,
    },
    {
      title: "Reveal: a range read can't stop early",
      body: (
        <>
          A range read has no single newest structure to stop at. It has to scan the file's own
          sorted run and the memtable's sorted run together, merging them into one, keeping only
          the newest version of any key both of them hold.
        </>
      ),
      duration: 4.8,
      fig: "a file's sorted run and the memtable's sorted run, merged into one.",
      takeaway: "A point read stops at the first match. A range read can't — it has to merge every overlapping structure.",
      Visual: S.RevealRangeReadMerge,
    },
    {
      title: 'Reveal: the Bloom filter, a fast no',
      body: (
        <>
          Five hundred lookups for keys that flatly don't exist, measured directly against a
          real file's own Bloom filter: the large majority are rejected in one shot. The rest are
          never wrong — only ever a wasted read.
        </>
      ),
      duration: 4.8,
      fig: 'five hundred lookups for keys that do not exist. Most rejected in one shot.',
      takeaway: "A Bloom filter can prove absence in one shot. It can never prove presence — only 'maybe'.",
      Visual: S.RevealBloomFilterGate,
    },
    {
      title: 'Reveal: the block index, after the filter says maybe',
      body: (
        <>
          When the filter can't rule a key out, the file's own index takes over: a binary search
          built when the file was written, pointing straight at the one data block that could
          hold it, never the whole file.
        </>
      ),
      duration: 4.8,
      fig: "the filter says maybe. The file's own index: one block, not the whole file.",
      Visual: S.RevealBlockIndex,
    },
    {
      title: 'Reveal: a delete is not free',
      body: (
        <>
          Delete a batch of keys and flush, measured directly: a second file appears, made
          almost entirely of tombstones. The original file is untouched. Total bytes on disk
          went up, not down.
        </>
      ),
      duration: 4.8,
      fig: 'delete a batch of keys, flush. A new file appears — of tombstones. Disk usage grows.',
      takeaway: "A delete doesn't erase anything. It writes a tombstone — a new record that, for now, only adds bytes.",
      Visual: S.RevealTombstoneGrowth,
    },
    {
      title: 'Recap',
      body: (
        <>
          One rule, five consequences: never update a file in place, so every read has to decide
          how many of the files that rule has left behind it actually needs to check.
        </>
      ),
      duration: 4.8,
      fig: 'never update in place. The write path, the read path, and the cost of a delete.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A key has three shadowed copies: a tombstone, and two older stale values in two files.
          Why doesn't the disk shrink to just the tombstone right now?
        </>
      ),
      duration: 2.8,
      fig: 'a tombstone, and two stale copies behind it. Why does the disk not shrink right now?',
      predict: {
        options: [
          { label: 'The delete removes the other copies as it writes the tombstone' },
          { label: "Nothing removes them yet — only a later merge of those files discards them together", correct: true },
        ],
        explain: (
          <>
            "The delete removes it" is the everyday, in-place intuition — and it's exactly
            backwards here. A flush and a read both just work around a tombstone's shadowed
            copies. Only a later merge of the files actually throws them away.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
