import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Arc and Mutex are two tools doing two unrelated jobs: Arc shares ownership and adds no
// synchronization of its own; Mutex/RwLock (futex-based in std, with poisoning on a panicking
// thread) or parking_lot (no poisoning, a different trade-off) are what actually synchronize
// access. tokio::sync::Mutex exists for exactly one reason: surviving a lock held across an
// await; a std guard held across await inside a spawned task is a real, distinct compile
// failure this topic names precisely. Every snippet and every claim is executed by examples.py
// (rustc 1.97.0 stable, edition 2024, x86_64 Linux; parking_lot and tokio are driven through cargo).
const reel: Reel = {
  steps: [
    {
      title: "A bare Arc shares the counter — and that's all",
      body: (
        <>
          Wrap the counter in a shared pointer and clone it to a second thread. Both threads can see it now — but can either one change it?
        </>
      ),
      duration: 3.0,
      takeaway: 'A shared pointer shares ownership only; it adds no way to mutate the value inside it.',
      Visual: S.BareArcShares,
    },
    {
      title: 'Does assigning through a bare Arc<u64> compile?',
      body: (
        <>
          Try writing straight through the shared pointer, no lock anywhere. Does that build?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: "Yes — the pointer's own atomic count makes the whole thing safe to write to" },
          { label: 'No — it fails to compile; nothing offers a mutable path in', correct: true },
          { label: 'Yes, but it silently clones the value first' },
        ],
        explain: (
          <>
            No. A shared pointer never implements the trait that would allow writing through it — the same rule an ordinary shared reference already follows.
          </>
        ),
      },
      Visual: S.BareArcPredict,
    },
    {
      title: 'The real compiler verdict',
      body: (
        <>
          The compiler's own words, naming the exact missing piece.
        </>
      ),
      duration: 2.8,
      Visual: S.BareArcReveal,
    },
    {
      title: 'Wrap it in a lock, and both jobs get done',
      body: (
        <>
          Put a lock inside the same shared pointer. Four real worker threads reach it at once, and the total lands exactly where it should.
        </>
      ),
      duration: 3.4,
      takeaway: 'A shared pointer shares; a lock synchronizes — two separate jobs, never one substituting for the other.',
      Visual: S.ArcMutexWorks,
    },
    {
      title: 'A panic while the lock is held really poisons it',
      body: (
        <>
          One thread panics while holding the lock. A second thread's attempt to take it comes back visibly different — and the value is still reachable, on purpose.
        </>
      ),
      duration: 3.4,
      takeaway: "A lock poisons itself if a thread panics while holding it; the data stays reachable, deliberately, through recovery.",
      Visual: S.StdMutexPoisons,
    },
    {
      title: "The identical panic, and a different library's opposite choice",
      body: (
        <>
          The same panic, the same held lock — but this lock never cracks. A second attempt proceeds as if nothing happened.
        </>
      ),
      duration: 3.4,
      takeaway: "One lock's library poisons on panic; another's never does, by design — a real, opposite trade-off.",
      Visual: S.ParkingLotNoPoison,
    },
    {
      title: 'Does holding a lock across an await compile?',
      body: (
        <>
          A spawned task holds a lock, pauses once, then uses the locked value again. Does the whole thing still build?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: "Yes — the guard is just a value like any other inside the task" },
          { label: 'No — the whole task stops qualifying to be spawned, the moment the guard is still alive at that pause', correct: true },
          { label: 'Yes, but the lock silently releases for the duration of the pause' },
        ],
        explain: (
          <>
            No. The guard is exactly the kind of value that can't cross threads, so holding it alive across the one pause makes the whole spawned task fail to qualify.
          </>
        ),
      },
      Visual: S.GuardAwaitPredict,
    },
    {
      title: 'The real failure, and the one lock built to survive it',
      body: (
        <>
          The ordinary lock's guard fails, naming itself directly. The identical shape, built with the lock meant for exactly this, compiles and runs for real.
        </>
      ),
      duration: 3.4,
      Visual: S.GuardAwaitReveal,
    },
    {
      title: 'Recap: two jobs, two choices each',
      body: (
        <>
          A shared pointer shares ownership and nothing more. A lock adds the synchronization. One library's lock poisons on panic; another's doesn't, on purpose. One lock exists for exactly one reason: surviving a pause while held.
        </>
      ),
      duration: 3.0,
      takeaway: "Sharing and synchronizing are separate jobs; which lock to reach for depends on what each one actually buys.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
