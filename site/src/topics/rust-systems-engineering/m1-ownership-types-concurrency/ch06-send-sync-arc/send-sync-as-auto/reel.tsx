import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Opens the Send, Sync, Arc, Mutex, and Ownership Across Threads chapter: two auto-traits, derived
// structurally from a type's own fields, decide whether a value can move to another thread (Send)
// or be touched through a shared reference from more than one thread at once (Sync). Cell/RefCell
// are Send but never Sync; a MutexGuard is Sync but never Send; Rc is neither. PhantomData and
// unsafe impl Send are the compiler's only two deliberate overrides. A spawned future is Send only
// if everything still alive across its await points is. Every snippet and every claim is executed
// by examples.py (rustc 1.97.0 stable, edition 2024, x86_64 Linux; the tokio examples are driven
// through cargo).
const reel: Reel = {
  steps: [
    {
      title: 'A job counter that counts correctly, alone',
      body: (
        <>
          A plain cell holding a counter, touched by one thread. It works exactly as expected — the real question is what happens the moment a second thread wants it too.
        </>
      ),
      duration: 3.0,
      takeaway: 'A type being safe to use on one thread says nothing yet about sharing it with another.',
      Visual: S.CellAloneWorks,
    },
    {
      title: 'Does Arc<Cell<u64>>, cloned into a second thread, compile?',
      body: (
        <>
          Wrap that same cell in a shared, reference-counted pointer, clone it, and hand the clone to a second thread. Does it build?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: "Yes — the shared pointer's own atomic count makes anything inside it safe to share" },
          { label: 'No — it fails to compile, before either thread ever runs', correct: true },
          { label: 'Yes, but a data race can corrupt the count at run time' },
        ],
        explain: (
          <>
            No. The shared pointer's atomic count only ever protects its own bookkeeping; it adds no synchronization to the value living inside it at all.
          </>
        ),
      },
      Visual: S.CellSyncPredict,
    },
    {
      title: 'Cell and RefCell fail identically, before main even runs',
      body: (
        <>
          The compiler's own words, for both attempts. Neither error talks about moving the cell to another thread — both talk about sharing it.
        </>
      ),
      duration: 3.2,
      Visual: S.CellRefCellFailReveal,
    },
    {
      title: 'Arc<Mutex<u64>> compiles — and really synchronizes four workers',
      body: (
        <>
          Put a lock around the same counter instead. Four real worker threads increment it, through the identical shared pointer, and the final count lands exactly where it should.
        </>
      ),
      duration: 3.4,
      takeaway: 'A lock makes a value safe to share by adding real synchronization; a bare cell never does.',
      Visual: S.MutexSynchronizesFig,
    },
    {
      title: 'MutexGuard is Sync but never Send',
      body: (
        <>
          The counter crossed threads just fine, locked. Try handing the lock itself — the thing taking it returns — to another thread instead.
        </>
      ),
      duration: 3.2,
      takeaway: "A lock's own guard is tied to the thread that took it; only the value it protects can cross threads.",
      Visual: S.GuardNotSendFig,
    },
    {
      title: "Two deliberate overrides of the compiler's own rule",
      body: (
        <>
          A generic wrapper with an ordinary marker field inherits whatever its payload allows. Swap in a raw-pointer marker instead, and it loses that no matter what the payload is. A separate, hand-built box grants back what the compiler could never prove on its own.
        </>
      ),
      duration: 3.4,
      takeaway: 'A marker field can opt a type out of an auto-trait; a separate unsafe line can opt one back in.',
      Visual: S.OverridesFig,
    },
    {
      title: 'Can an Rc be held across an await and still compile?',
      body: (
        <>
          A spawned task creates a non-atomic shared pointer, suspends at an await point, then uses the pointer again afterward. Does the whole task still build?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: "Yes — only the task's own closure has to cross threads, not what it creates inside" },
          { label: 'No — the whole task stops qualifying the moment anything unshareable is still alive at that pause', correct: true },
          { label: 'Yes, as long as the runtime only ever uses one worker thread' },
        ],
        explain: (
          <>
            No. A spawned task must itself qualify to cross threads, and it only does when everything still alive at each of its pause points does too.
          </>
        ),
      },
      Visual: S.RcAwaitPredict,
    },
    {
      title: 'The same Rc, dropped before the await, and held across it',
      body: (
        <>
          Confine that same non-atomic pointer to a scope with no pause inside it, and the task builds and runs cleanly. Let it live across the pause instead, and the identical task fails, naming the task itself as the problem.
        </>
      ),
      duration: 3.4,
      Visual: S.RcAwaitReveal,
    },
    {
      title: 'Recap: the compiler derives it, you can only ever override it',
      body: (
        <>
          Safe-to-move and safe-to-share are two separate, structural facts, worked out from a type's own fields. A lock's guard stays tied to the thread that took it. Only two deliberate overrides exist, in opposite directions.
        </>
      ),
      duration: 3.0,
      takeaway: 'Send and Sync are derived from a type’s fields; only an unsafe override or a raw-pointer marker changes the answer.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
