import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A read checks the newest structure first, so a fresh, unflushed write
// always beats a stale, flushed one. The older a key is, the more
// structures a read has to fall through to find it, and a genuine miss
// costs checking everything that exists. Once flushed, an SSTable's own
// bytes are never modified in place.
const reel: Reel = {
  steps: [
    {
      title: "A key's value gets written, then its memtable is flushed to an SSTable. The same key is then overwritten, but that new write never gets flushed. Which value does a read actually return: the old, flushed one, or the new, unflushed one?",
      body: (
        <>
          One key, two writes, one flushed, one not.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "The old, flushed value, since it's the one safely on disk" },
          { label: 'The new, unflushed value, since the read checks the newest structure first', correct: true },
          { label: 'Whichever one happens to be read first, unpredictably' },
        ],
        explain: (
          <>
            The newest value wins. The read checks the newest structure first.
          </>
        ),
      },
      Visual: S.OverwritePredict,
    },
    {
      title: 'Measured: the fresh overwrite genuinely won over the stale, flushed value',
      body: (
        <>
          The real read, returning the fresh value.
        </>
      ),
      duration: 3.0,
      takeaway: 'A read checks the newest structure first, so a fresh, unflushed write always beats a stale, flushed one.',
      Visual: S.OverwriteReveal,
    },
    {
      title: 'Three keys land in three different places: one in the very first flushed SSTable, one in a later SSTable, one still sitting only in the active memtable. Does looking up the oldest key cost the same as looking up the newest one?',
      body: (
        <>
          Three keys, three ages, one lookup each.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, every lookup costs the same, regardless of where the key ended up' },
          { label: 'No, the oldest key costs genuinely more, since more structures have to be checked first', correct: true },
          { label: 'It depends only on how many keys exist in total, not on their age' },
        ],
        explain: (
          <>
            The oldest costs more. More structures get checked first.
          </>
        ),
      },
      Visual: S.FallThroughPredict,
    },
    {
      title: "Measured: the oldest key genuinely took checking more than one structure, the newest key took checking only the active memtable, and a lookup for a key that doesn't exist at all had to check every single structure that exists",
      body: (
        <>
          The real, measured structures-checked count, per lookup.
        </>
      ),
      duration: 3.0,
      takeaway: 'A read falls through structures newest to oldest, and a genuine miss costs checking everything.',
      Visual: S.FallThroughReveal,
    },
    {
      title: 'A memtable gets flushed to an SSTable, and then that SSTable gets read from many times, by many different lookups. Does any one of those reads ever change a single byte of the SSTable itself?',
      body: (
        <>
          One SSTable, many reads against it.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, a read can update internal bookkeeping bytes even without changing any value' },
          { label: "No, genuinely; the SSTable's own bytes never change after it's flushed", correct: true },
          { label: 'Only if the same key gets read more than once' },
        ],
        explain: (
          <>
            No, genuinely. A flushed SSTable's own bytes never change.
          </>
        ),
      },
      Visual: S.ImmutablePredict,
    },
    {
      title: "Measured: a flushed SSTable's own bytes genuinely never changed across many later reads against it, hits and misses alike",
      body: (
        <>
          The real, measured byte content, identical before and after.
        </>
      ),
      duration: 3.0,
      takeaway: "Once an SSTable is flushed, it's never modified in place; only read, merged, or deleted.",
      Visual: S.ImmutableReveal,
    },
    {
      title: "RocksDB's own wiki names the exact moment a memtable stops accepting writes directly: what happens to the active memtable, and to the write-ahead log, at that moment?",
      body: (
        <>
          The real system's own description of a memtable switch.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The active memtable keeps accepting writes until the SSTable flush actually finishes' },
          { label: 'The active memtable is closed and turned into an immutable memtable, and a new write-ahead log file starts at the same moment', correct: true },
          { label: 'The write-ahead log keeps growing forever, regardless of memtable switches' },
        ],
        explain: (
          <>
            It's closed on the spot, and a new log file starts with it.
          </>
        ),
      },
      Visual: S.SwitchPredict,
    },
    {
      title: "Measured, in RocksDB's own words: the active memtable is closed and turned into an immutable memtable, and the write-ahead log switches to a new file at that same moment",
      body: (
        <>
          RocksDB's own words on a memtable switch, shown directly.
        </>
      ),
      duration: 3.0,
      takeaway: 'A memtable switch closes the active memtable and starts a fresh write-ahead log file at the exact same moment.',
      Visual: S.SwitchReveal,
    },
    {
      title: "RocksDB's own wiki also names what an immutable memtable actually is, directly: what's it waiting for?",
      body: (
        <>
          The real system's own words on an immutable memtable, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.ImmutableMemtableReveal,
    },
    {
      title: 'Recap: what a read actually checks, and what never changes once flushed',
      body: (
        <>
          A read checks the newest structure first, so a fresh, unflushed write always beats a stale, flushed one. The older a key is, the more structures a read has to fall through to find it, and a genuine miss costs checking everything that exists. Once flushed, an SSTable's own bytes are never modified in place — exactly the closed, waiting-to-be-flushed memtable RocksDB's own wiki names a memtable switch as producing.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
