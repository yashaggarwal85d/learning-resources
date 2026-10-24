import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A per-update fsync makes one real syscall per write; batching into WAL-style flush
// points makes a dramatically smaller number for the identical writes, and is also
// dramatically faster — and none of it is durable until a volatile write cache is
// actually forced to tell the truth.
const reel: Reel = {
  steps: [
    {
      title: 'A thousand small writes to a real log file, each followed immediately by a real fsync. How many real fsync syscalls does that actually make?',
      body: (
        <>
          A real loop, a real fsync after every write, traced to see the actual count.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Fewer than 1000, since the kernel can coalesce some' },
          { label: 'Exactly 1000', correct: true },
          { label: 'More than 1000, since fsync can issue multiple real syscalls' },
        ],
        explain: (
          <>
            Exactly 1000. One real fsync syscall for every single write.
          </>
        ),
      },
      Visual: S.PerUpdatePredict,
    },
    {
      title: 'Measured: a thousand writes, each followed by its own fsync, made exactly one thousand real fsync syscalls, confirmed directly by strace',
      body: (
        <>
          A real, traced count of the real fsync syscalls this loop actually made.
        </>
      ),
      duration: 3.0,
      Visual: S.PerUpdateReveal,
    },
    {
      title: 'Write those same thousand records, but fsync only once every fifty records, plus one final flush at the end. How many real fsync syscalls does that make now?',
      body: (
        <>
          The identical thousand writes, flushed in batches instead of one at a time.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'About 1000 still, since every write eventually needs flushing' },
          { label: 'A small, fixed number, close to one flush per batch', correct: true },
          { label: 'Zero, since the final flush covers everything' },
        ],
        explain: (
          <>
            A small, fixed number. Close to one flush per batch, not zero and not 1000.
          </>
        ),
      },
      Visual: S.BatchedPredict,
    },
    {
      title: 'Measured: the exact same thousand writes, flushed every fifty records plus a final flush, made twenty-one real fsync syscalls, not a thousand',
      body: (
        <>
          A real, traced count: 21 real fsync syscalls for the identical writes.
        </>
      ),
      duration: 3.0,
      takeaway: 'Batching writes into deliberate flush points cuts the real fsync count close to the batch size.',
      Visual: S.BatchedReveal,
    },
    {
      title: 'Same comparison, but timed instead of counted. Does cutting the fsync count also cut the real wall-clock time, by roughly the same large factor?',
      body: (
        <>
          The same two binaries, this time measured with a real wall-clock timer.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, since each individual write still costs the same either way' },
          { label: 'Yes, by roughly the same large factor the fsync count dropped by', correct: true },
          { label: 'Only on a fast disk; it would reverse on a slow one' },
        ],
        explain: (
          <>
            Yes. The time drops by roughly the same large factor as the syscall count.
          </>
        ),
      },
      Visual: S.TimingPredict,
    },
    {
      title: 'Measured: the per-update version took far longer, in real wall-clock time, than the batched version, for the identical thousand writes',
      body: (
        <>
          Two real, measured totals, side by side, for the exact same writes.
        </>
      ),
      duration: 3.0,
      takeaway: 'Most of the time in fsync-per-write is waiting on a syscall batching would have skipped.',
      Visual: S.TimingReveal,
    },
    {
      title: "PostgreSQL's own documentation makes a specific claim about why a WAL helps at all. What does it actually say the WAL avoids flushing?",
      body: (
        <>
          The documentation's own account of what a transaction commit actually needs.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It avoids flushing the WAL file itself, only the data files' },
          { label: 'It avoids flushing every data file the transaction changed', correct: true },
          { label: 'It avoids flushing anything, relying entirely on the write cache' },
        ],
        explain: (
          <>
            The data files. Only the WAL file needs flushing to guarantee the commit.
          </>
        ),
      },
      Visual: S.WalDocPredict,
    },
    {
      title: "The documentation's own words: using WAL means only the WAL file needs to be flushed, rather than every data file the transaction changed, and under load one flush can cover many transactions at once",
      body: (
        <>
          The WAL documentation's own two sentences, quoted directly.
        </>
      ),
      duration: 2.8,
      Visual: S.WalDocReveal,
    },
    {
      title: "None of this flushing means anything if the disk itself lies about it. What does a volatile write cache actually do, and what forces it to tell the truth?",
      body: (
        <>
          The kernel's own documentation on volatile write caches and forced flushes.
        </>
      ),
      duration: 2.8,
      takeaway: 'A flush is not durable until something forces a volatile write cache to tell the truth.',
      Visual: S.FuaReveal,
    },
    {
      title: 'Recap: fewer real flushes, far less real waiting, and a disk that still has to be forced to tell the truth',
      body: (
        <>
          Fsyncing every update and batching into WAL-style flush points both make the same writes durable, but the batched approach made 21 real fsync syscalls instead of 1000, and was dramatically faster for it. PostgreSQL's own documentation explains why: one flush can cover many transactions. And none of it is real durability until a forced-flush mechanism makes a volatile write cache tell the truth.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
