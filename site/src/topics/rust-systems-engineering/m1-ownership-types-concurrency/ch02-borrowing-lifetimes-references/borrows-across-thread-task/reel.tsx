import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: why thread::spawn demands Send + 'static (a thread can outlive its caller's frame), how
// thread::scope makes the identical borrow sound by actually joining before it returns, why a moved, owned
// Arc satisfies 'static for free, and why there is no sound scoped spawn in async (mem::forget can always
// defeat a Drop-based join guarantee). Every snippet and claim is executed by examples.py (rustc 1.97.0,
// edition 2024, x86_64 Linux) except tokio::task::spawn's own signature, which is quoted, not compiled.
const reel: Reel = {
  steps: [
    {
      title: 'A thread can outlive the frame that made it',
      body: (
        <>
          <code>thread::spawn</code>'s own signature demands <code>F: Send + 'static</code>. Not a style preference: a spawned thread runs on its own, and the caller's stack frame can pop long before the
          thread finishes.
        </>
      ),
      duration: 3.4,
      takeaway: "'static on a spawned closure is enforced because the new thread's lifetime is not bounded by the caller's stack frame.",
      Visual: S.ThreadOutlivesFrame,
    },
    {
      title: 'Borrow a local, then spawn',
      body: (
        <>
          <code>count</code> is a plain local <code>i32</code>. The spawned closure only reads it by reference — it never takes ownership.
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'Compiles and prints count' },
          { label: "Rejected: won't compile", correct: true },
          { label: 'Compiles, but may print garbage' },
          { label: 'Compiles only in debug builds' },
        ],
        explain: (
          <>
            The closure only captured a reference to <code>count</code>, and nothing stops the spawned thread from still running after <code>main</code> moves on. The compiler refuses before any of that can
            happen.
          </>
        ),
      },
      Visual: S.SpawnBorrow,
    },
    {
      title: "The compiler's own reason",
      body: (
        <>
          <code>examples/spawn_borrow_fail.rs</code>, compiled for real: <code>E0373</code>, closure may outlive the current function, but it borrows <code>count</code>, which is owned by the current
          function.
        </>
      ),
      duration: 3.2,
      Visual: S.SpawnBorrowError,
    },
    {
      title: '`thread::scope` makes the same borrow sound',
      body: (
        <>
          The identical closure, now spawned inside <code>thread::scope(|s| ...)</code>, compiles. Scoped threads may borrow non-<code>'static</code> data, because the scope guarantees every one of them is
          joined before it returns.
        </>
      ),
      duration: 3.6,
      takeaway: "thread::scope stays sound because the call itself won't return until every scoped thread has joined.",
      Visual: S.ScopeBorrow,
    },
    {
      title: 'Needs to outlive the function? Clone an `Arc` instead',
      body: (
        <>
          A <code>Mutex&lt;i32&gt;</code> wrapped in an <code>Arc</code>, cloned, then moved into a plain <code>thread::spawn</code> — no scope this time — from a function that returns before the thread
          could plausibly finish.
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Rejected: the thread outlives the function' },
          { label: 'Compiles: the Arc is owned, not borrowed', correct: true },
          { label: 'Compiles only with unsafe' },
          { label: 'Rejected: Mutex is not Send' },
        ],
        explain: (
          <>
            The closure captures the <code>Arc</code> by value. An owned value has no borrow inside it, so <code>'static</code> costs nothing: the <code>Arc</code>'s reference count, not a borrow checker, is
            what keeps the data alive for as long as any clone of it survives.
          </>
        ),
      },
      Visual: S.ArcMove,
    },
    {
      title: "An owned `Arc` already satisfies `'static`",
      body: (
        <>
          <code>'static</code> is a statement about what a value owns, never about when a function returns. A moved <code>Arc&lt;Mutex&lt;i32&gt;&gt;</code> contains no reference at all, so the bound was
          already true before anyone wrote <code>thread::spawn</code>.
        </>
      ),
      duration: 3.2,
      takeaway: "'static asks what a value owns, not when a function returns; an owned Arc has no borrow inside it.",
      Visual: S.ArcSatisfiesStatic,
    },
    {
      title: '`tokio::spawn` asks for the identical bound',
      body: (
        <>
          <code>tokio::task::spawn&lt;F&gt;</code> requires <code>F: Future + Send + 'static</code>, the same shape of bound as <code>thread::spawn</code>. But async has nothing shaped like{' '}
          <code>thread::scope</code>.
        </>
      ),
      duration: 3.0,
      Visual: S.TokioSpawn,
    },
    {
      title: 'Could a scoped async spawn ever be sound?',
      body: (
        <>
          Imagine an <code>async_scope</code> that hands out a guard: while the guard is alive, the spawned task is still running; when the guard drops, the task is guaranteed finished. Could ordinary safe
          code ever break that guarantee?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'No — Drop always runs eventually' },
          { label: 'Yes — with std::mem::forget', correct: true },
          { label: 'Only with unsafe code' },
          { label: 'Only if the task panics' },
        ],
        explain: (
          <>
            <code>std::mem::forget</code> is completely safe and skips a value's destructor outright. Hand it the guard, and the "task is finished" promise it was supposed to enforce simply never fires — no{' '}
            <code>unsafe</code> required.
          </>
        ),
      },
      Visual: S.AsyncScopeGuard,
    },
    {
      title: '`mem::forget` is exactly the hole',
      body: (
        <>
          <code>examples/forget_defeats_guard.rs</code>: a guard whose <code>Drop</code> prints <code>joined</code>, then <code>mem::forget(guard)</code>, run for real. No <code>joined</code> line ever
          appears.
        </>
      ),
      duration: 3.4,
      takeaway: 'mem::forget is safe and skips any destructor, so no Drop-based join guarantee can ever be sound.',
      Visual: S.ForgetDefeatsGuard,
    },
    {
      title: 'Recap: what crosses a spawn boundary',
      body: (
        <>
          <code>thread::spawn</code> needs <code>'static</code> because the thread outlives the frame that made it. <code>thread::scope</code> makes borrowing sound by actually joining before it returns. An
          owned <code>Arc</code> satisfies <code>'static</code> for free. <code>tokio::spawn</code> needs the same bound but has no sound scoped equivalent — <code>mem::forget</code> can always defeat a{' '}
          <code>Drop</code>-based join guarantee. Next: a world where the borrow checker has nothing left to say.
        </>
      ),
      duration: 2.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
