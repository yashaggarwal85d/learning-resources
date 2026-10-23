import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Release/Acquire closes the publication race from the previous topic; SeqCst is needed only for
// store-load (Dekker / store-buffer) patterns Release/Acquire can't rule out. Every outcome is
// executed by examples.py (rustc 1.97.0, edition 2024; the loom examples run via cargo) except the
// SeqCst litmus test itself, where loom's own test suite documents a known modeling gap for this
// exact shape — that one is verified by compiling, not by model-checking.
const reel: Reel = {
  steps: [
    {
      title: "Last topic's race, fixed with two words",
      body: (
        <>
          A relaxed publication raced: the reader could see the ready flag before the value it was supposed to announce. Two words fix it.
        </>
      ),
      duration: 2.8,
      Visual: S.RaceRecapHook,
    },
    {
      title: 'Release-store the flag, acquire-load it back — does that fix it?',
      body: (
        <>
          Only the flag's ordering changes: a release store on the write side, an acquire load on the read side. The data store itself stays relaxed.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: "No — atomics can't be fixed this way" },
          { label: 'Yes — that pairing is exactly the fix', correct: true },
          { label: 'Only if the data itself is also made atomic' },
        ],
        explain: (
          <>
            Yes. A release store and a matching acquire load create the happens-before edge that was missing — and nothing else in the program needed to change.
          </>
        ),
      },
      Visual: S.ReleaseAcquirePredict,
    },
    {
      title: 'Fixed: loom finds no violation',
      body: (
        <>
          loom explored every interleaving the memory model actually permits for this pair, and none of them let the reader see the flag before the value.
        </>
      ),
      duration: 2.8,
      Visual: S.FixedReveal,
    },
    {
      title: 'Release orders everything before it; acquire orders everything after it',
      body: (
        <>
          A release store carries every earlier write on its thread along with it, to any acquire load (or stronger) that later observes it.
        </>
      ),
      duration: 3.0,
      takeaway: 'A release store orders earlier writes before a matching acquire load; that load orders later operations after that store.',
      Visual: S.WhyPairingWorks,
    },
    {
      title: "Fixing only the write side doesn't work either",
      body: (
        <>
          The store stays release, but the load is left relaxed. loom still finds the exact same violation as before.
        </>
      ),
      duration: 3.0,
      takeaway: 'Both sides have to opt in — a release store only promises visibility to an acquire-or-stronger load.',
      Visual: S.HalfFixedReveal,
    },
    {
      title: 'Two threads, two flags, no shared leader — does release/acquire still hold?',
      body: (
        <>
          Thread one stores its own flag, then loads the other's. Thread two does the mirror image. Every access is release on the store, acquire on the load.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: "No — release/acquire rules that out" },
          { label: "Yes — release/acquire only orders a pair, not every thread at once", correct: true },
          { label: 'Only if the threads run on different cores' },
        ],
        explain: (
          <>
            Yes. Release/acquire is a pairwise guarantee. It never promised a single order that every thread agrees on — and this shape needs exactly that.
          </>
        ),
      },
      Visual: S.StoreBufferingPredict,
    },
    {
      title: 'loom finds it: both loads see nothing, release/acquire everywhere',
      body: (
        <>
          Every store is release, every load is acquire — and loom still finds the interleaving where both threads see the other's flag as unset.
        </>
      ),
      duration: 3.0,
      Visual: S.StoreBufferingAcqRelReveal,
    },
    {
      title: 'SeqCst adds the one thing missing: one order, every thread agrees',
      body: (
        <>
          Release/acquire only ordered the one pair that actually synchronized. The standard library's own definition of SeqCst: every sequentially consistent operation, on every thread, falls into a single agreed order.
        </>
      ),
      duration: 3.0,
      takeaway: 'SeqCst keeps every release/acquire guarantee and adds one more — a single order every thread agrees on.',
      Visual: S.SeqCstReveal,
    },
    {
      title: 'A fence carries the same handoff without touching the atomic op',
      body: (
        <>
          The compare-exchange loop stays relaxed; a separate acquire fence does the acquire half of the handoff once the lock is won.
        </>
      ),
      duration: 3.0,
      takeaway: 'A fence pairs with a matching atomic operation the same way release pairs with acquire, with no one access attached.',
      Visual: S.FenceSpinlockReveal,
    },
    {
      title: 'Relaxed is still right when nothing is being handed off',
      body: (
        <>
          Independent counters, no publication between threads: each one's final value only depends on operations on that same counter.
        </>
      ),
      duration: 3.0,
      takeaway: 'Relaxed is the correct choice, not a shortcut, whenever nothing is actually being published between threads.',
      Visual: S.RelaxedCountersReveal,
    },
    {
      title: 'Recap: publication proven both ways, and the one case needing more',
      body: (
        <>
          Release paired with acquire, both sides, closes a publication race. SeqCst is for the one shape where a pairwise edge genuinely is not the requirement.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
