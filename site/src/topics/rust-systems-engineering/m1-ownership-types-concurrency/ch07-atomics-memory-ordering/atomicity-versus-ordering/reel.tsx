import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Atomicity (no torn updates) and ordering (visibility between threads) are distinct concerns.
// The exact count and the loom-found ordering violation are both executed for real by
// examples.py (rustc 1.97.0, edition 2024, x86_64 Linux; the loom example is built via cargo).
const reel: Reel = {
  steps: [
    {
      title: 'Two separate questions about the same shared memory',
      body: (
        <>
          Whether an update ever shows up half-written, and what order other threads are guaranteed to see it in, are not the same question.
        </>
      ),
      duration: 2.8,
      Visual: S.TwoQuestionsHook,
    },
    {
      title: 'Eight threads, one counter, fifty thousand increments each — any lost?',
      body: (
        <>
          Every thread increments the same counter with the weakest ordering available, no lock anywhere.
        </>
      ),
      duration: 2.2,
      predict: {
        options: [
          { label: 'No — some increments get lost under contention' },
          { label: 'Yes — exactly four hundred thousand, every run', correct: true },
          { label: 'Only if the strongest ordering is used' },
        ],
        explain: (
          <>
            Yes. Atomicity doesn't care which ordering you asked for — every single increment lands, none torn, none lost.
          </>
        ),
      },
      Visual: S.EightThreadsPredict,
    },
    {
      title: 'Exact: four hundred thousand, every time',
      body: (
        <>
          Eight threads, fifty thousand relaxed increments each, land exactly — not approximately.
        </>
      ),
      duration: 2.8,
      Visual: S.ExactCountReveal,
    },
    {
      title: "Atomicity bought that — but it bought nothing about order",
      body: (
        <>
          Nothing in that result claimed anything about when another thread would see each increment, or in what order.
        </>
      ),
      duration: 3.0,
      takeaway: 'Atomicity means no torn updates on one location; it says nothing about when another thread sees them.',
      Visual: S.AtomicityOnlyReveal,
    },
    {
      title: 'One thread publishes a value, then a flag — does the reader ever see a stale value?',
      body: (
        <>
          Thread A stores a value, then a ready flag — both with the weakest ordering. Thread B checks the flag, then reads the value.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: 'No — atomics are always safe to use this way' },
          { label: 'Yes — relaxed gives no guarantee here at all', correct: true },
          { label: 'Only on unusual, exotic hardware' },
        ],
        explain: (
          <>
            Yes. Relaxed carries no happens-before edge between the two threads — the reader is allowed to see the flag before the value it was supposed to announce.
          </>
        ),
      },
      Visual: S.PublicationPredict,
    },
    {
      title: 'loom found it: the reader saw the flag before the value',
      body: (
        <>
          Not a one-off hardware fluke — loom explored every interleaving the memory model actually permits, and this one is among them.
        </>
      ),
      duration: 3.0,
      takeaway: 'Relaxed is atomic, but gives no happens-before edge — a reader can see the flag before the data it announces.',
      Visual: S.LoomViolationReveal,
    },
    {
      title: 'The missing piece has a name: happens-before',
      body: (
        <>
          Rust's atomics follow the same memory model modern C++ does, minus one ordering it never finished (consume).
        </>
      ),
      duration: 3.0,
      takeaway: "Rust's atomics follow the C++ memory model, minus consume: happens-before is the one relation every ordering is built from.",
      Visual: S.HappensBeforeReveal,
    },
    {
      title: 'Unsynchronized conflicting access is undefined behavior, full stop',
      body: (
        <>
          The standard library's own definition of a data race — and its own statement of what it costs.
        </>
      ),
      duration: 3.0,
      takeaway: 'A data race — conflicting, unsynchronized access where at least one side writes — is undefined behavior in Rust.',
      Visual: S.DataRaceUbReveal,
    },
    {
      title: "The kernel has its own, stricter model — and it only matters in the kernel",
      body: (
        <>
          Named here deliberately, and set aside just as deliberately: this chapter isn't about kernel Rust.
        </>
      ),
      duration: 2.8,
      takeaway: "The Linux kernel's own memory model is distinct and stricter than this chapter's; it matters only for kernel Rust.",
      Visual: S.LkmmReveal,
    },
    {
      title: 'Recap: atomicity and ordering, each proven separately',
      body: (
        <>
          No torn updates, proven exact. A real ordering violation, found by loom, not assumed. Rust follows the C++ model minus consume. A data race is real undefined behavior.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
