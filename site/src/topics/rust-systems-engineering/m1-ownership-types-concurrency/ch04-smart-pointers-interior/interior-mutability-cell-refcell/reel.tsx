import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// UnsafeCell is the one legal way to mutate through &T; Cell copies values in and out needing no
// tracking; RefCell tracks borrows at run time and panics on conflict, !Sync, never a mutex
// substitute; OnceCell/OnceLock and LazyLock handle one-time initialization. Every snippet and
// every claim is executed by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'The one legal way to mutate through &T',
      body: (
        <>
          A counter mutates its stored value through <code>&amp;self</code>, via <code>UnsafeCell::get</code>'s raw pointer. Every safe interior-mutability type is built on exactly this.
        </>
      ),
      duration: 3.4,
      takeaway: 'UnsafeCell is the one legal way to get a mutable pointer from a shared reference; everything else builds on it.',
      Visual: S.UnsafeCellFig,
    },
    {
      title: 'Mutate through &self, with no cell type at all',
      body: (
        <>
          The identical shape, but <code>value: u32</code> with no <code>UnsafeCell</code> at all. Does <code>self.value += 1</code> inside a <code>&amp;self</code> method compile?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, but it is undefined behavior' },
          { label: 'No: rejected outright, before UB ever enters it', correct: true },
          { label: 'Yes, only in release builds' },
          { label: 'No, but only because u32 is Copy' },
        ],
        explain: (
          <>
            It fails with <code>error[E0594]</code>: cannot assign to <code>self.value</code>, which is behind a <code>&amp;</code> reference. This is the plain borrow checker, not a safety
            invariant — no cell type means no legal way to mutate through <code>&amp;self</code> at all.
          </>
        ),
      },
      Visual: S.NoCellFail,
    },
    {
      title: 'Cell copies the whole value, in and out',
      body: (
        <>
          <code>Cell::set</code>, <code>get</code>, and <code>replace</code> all copy a whole value in or out; a reference to the inside is never handed out, so no runtime check is needed at all.
        </>
      ),
      duration: 3.0,
      Visual: S.CellCopy,
    },
    {
      title: 'RefCell tracks borrows while the program runs',
      body: (
        <>
          <code>borrow_mut</code> and <code>borrow</code> hand out tracked guards, checked against Rust's own borrow rules — but at run time, not compile time.
        </>
      ),
      duration: 3.2,
      takeaway: 'RefCell checks borrows at run time, not compile time, and a conflicting borrow panics instead of refusing to compile.',
      Visual: S.RefCellTracked,
    },
    {
      title: 'A shared borrow is still alive — then borrow_mut',
      body: (
        <>
          Hold a <code>borrow()</code> alive, then call <code>borrow_mut()</code> while it's still in scope. What happens?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'Compiles, and silently returns stale data' },
          { label: 'Panics at run time, naming the conflict', correct: true },
          { label: "Blocks until the first borrow ends" },
          { label: 'Fails to compile' },
        ],
        explain: (
          <>
            It compiles cleanly and panics the instant it runs, exit code one-oh-one, naming the conflict directly. <code>RefCell</code> catches this at run time; nothing here is checked ahead of
            time the way an ordinary borrow is.
          </>
        ),
      },
      Visual: S.DoubleBorrowFail,
    },
    {
      title: 'Written once, computed once',
      body: (
        <>
          <code>OnceLock::get_or_init</code> writes its value on the first call only; every later call reads the same value back. A <code>LazyLock</code> computes its own value once, the first
          time it's touched.
        </>
      ),
      duration: 3.2,
      takeaway: 'OnceCell/OnceLock write once then read freely; LazyLock computes its value once, the first time it is touched.',
      Visual: S.OnceLazy,
    },
    {
      title: 'Recap: one way in, three ways to mutate safely',
      body: (
        <>
          <code>UnsafeCell</code> is the one legal way to mutate through <code>&amp;T</code>. <code>Cell</code> copies values whole, needing no tracking. <code>RefCell</code> tracks borrows at run
          time and panics on conflict, <code>!Sync</code>. <code>OnceCell</code>/<code>OnceLock</code> write once then read freely; <code>LazyLock</code> computes once, on first touch. Next: a{' '}
          <code>RefCell</code> pointing back at its own parent is exactly the shape that can leak forever.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
