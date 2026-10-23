import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Closes Chapter 4: Arc<Mutex<T>> is correct by construction, but serializes every access through
// one lock, measured directly to cost real time under real contention. Sharding removes the
// shared lock; an owner task trades a lock for a queue; arc-swap gives read-mostly data a
// lock-free read path. Every snippet and every claim is executed by examples.py (rustc 1.97.0,
// edition 2024, x86_64 Linux); the arc-swap example is driven through cargo.
const reel: Reel = {
  steps: [
    {
      title: 'The reflex: wrap it in Arc<Mutex<T>>',
      body: (
        <>
          Four real threads increment a shared counter through one <code>Arc&lt;Mutex&lt;u64&gt;&gt;</code>. The final count is exact, every time.
        </>
      ),
      duration: 3.2,
      takeaway: 'Arc<Mutex<T>> is correct by construction, but it serializes every single access through the same lock.',
      Visual: S.MutexReflex,
    },
    {
      title: 'Does splitting the work across threads help?',
      body: (
        <>
          The same total increments, run once by one thread alone, once split across four threads on the same <code>Mutex</code>. Does splitting it finish sooner?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'Yes, close to four times faster' },
          { label: 'No: about as slow, or slower, than one thread alone', correct: true },
          { label: 'About the same either way' },
          { label: 'Only slower on a machine with few cores' },
        ],
        explain: (
          <>
            Measured for real, the four-thread run took several times longer than the single thread doing the entire thing alone. Every thread's increment waits its turn for the exact same lock,
            and the contention itself adds real cost on top of the serialized work.
          </>
        ),
      },
      Visual: S.ContentionPredict,
    },
    {
      title: 'Sharding: no two threads share a lock',
      body: (
        <>
          The identical total, split so each thread gets its own independent <code>Mutex</code>. No two threads ever contend for the same lock at all.
        </>
      ),
      duration: 3.0,
      Visual: S.Sharding,
    },
    {
      title: 'An owner task, reached only by channel',
      body: (
        <>
          One thread owns the counter outright and never shares it. Every other thread only ever sends a message asking for it to be incremented.
        </>
      ),
      duration: 3.2,
      takeaway: 'An owner task trades a lock for a queue: one thread owns the data, everyone else only sends messages.',
      Visual: S.OwnerTask,
    },
    {
      title: 'Can a reader see a half-updated config?',
      body: (
        <>
          Many readers call <code>load()</code> on a shared config while one writer repeatedly <code>store()</code>s a whole new version. Can a reader ever see a half-updated struct?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'Yes, under heavy load' },
          { label: 'No: every read sees one complete, consistent snapshot', correct: true },
          { label: 'Only if the writer panics mid-update' },
          { label: 'Yes, but only the first read after a swap' },
        ],
        explain: (
          <>
            Never, by construction. Each <code>load()</code> hands back a whole <code>Arc</code> snapshot, swapped in atomically; there is no moment where only part of it has changed.
          </>
        ),
      },
      Visual: S.ArcSwapPredict,
    },
    {
      title: 'arc-swap: a lock-free swap for read-mostly data',
      body: (
        <>
          Readers <code>load()</code> with no lock at all; a writer <code>store()</code>s a whole new <code>Arc</code>. Built specifically for data that is read often and updated rarely.
        </>
      ),
      duration: 3.4,
      takeaway: 'arc-swap lets read-mostly data be read with no lock at all, by atomically swapping in a new value on write.',
      Visual: S.ArcSwapFig,
    },
    {
      title: 'Recap: one lock, three ways around it',
      body: (
        <>
          <code>Arc&lt;Mutex&lt;T&gt;&gt;</code> is correct but serializes every access through one lock, measured to cost real time under real contention. Sharding removes the shared lock. An
          owner task trades a lock for a queue. <code>arc-swap</code> gives read-mostly data a lock-free read path. Next: the other concurrency primitives, with this chapter's{' '}
          <code>Arc&lt;Mutex&lt;T&gt;&gt;</code> as the baseline.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
