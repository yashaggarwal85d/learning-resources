import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A reference cycle of strong Rc/RefCell values leaks forever, safe Rust compiles it without
// complaint; Weak carries no ownership and breaks that cycle; upgrade returns None once the last
// strong owner is gone; Rc::new_cyclic hands a self-referencing structure a Weak to its own
// not-yet-finished allocation. Every snippet and every claim is executed by examples.py (rustc
// 1.97.0, edition 2024, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'A cycle that never closes',
      body: (
        <>
          A parent holds a strong <code>Rc</code> to its child; the child holds a strong <code>Rc</code> straight back to its parent. Both go out of scope — and neither one's count ever reaches
          zero.
        </>
      ),
      duration: 3.4,
      takeaway: "A cycle of Rc and RefCell values pointing at each other leaks for the program's whole life.",
      Visual: S.CycleLeak,
    },
    {
      title: 'Does this reject at compile time?',
      body: (
        <>
          Nothing about this cycle violates the borrow checker, the type system, or coherence. Does it compile?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'No, the borrow checker refuses a cycle' },
          { label: 'Yes: it compiles fine, and leaks forever', correct: true },
          { label: 'It panics the first time it runs' },
          { label: 'It only leaks in debug builds' },
        ],
        explain: (
          <>
            It compiles cleanly. A counting allocator shows real allocations that are never freed once both nodes go out of scope — a measured leak, not a guessed one.
          </>
        ),
      },
      Visual: S.CompilePredict,
    },
    {
      title: 'Weak: a reference that owns nothing',
      body: (
        <>
          <code>Weak&lt;T&gt;</code> points at the same value an <code>Rc</code> manages, but carries no ownership at all — its count never keeps anything alive.
        </>
      ),
      duration: 2.8,
      Visual: S.WeakConcept,
    },
    {
      title: 'The same shape, with one link made Weak',
      body: (
        <>
          The identical parent and child, but the child's pointer back to its parent is now a <code>Weak</code>, from <code>Rc::downgrade</code>. The same counting allocator now shows nothing
          leaked.
        </>
      ),
      duration: 3.4,
      takeaway: 'A Weak reference carries no ownership, so a cycle built with one breaks cleanly once every strong reference is gone.',
      Visual: S.WeakFixesCycle,
    },
    {
      title: 'The last strong owner is dropped — then upgrade',
      body: (
        <>
          <code>Rc::downgrade</code> a value, then drop its only strong owner. Call <code>upgrade</code> on the <code>Weak</code> afterward. What comes back?
        </>
      ),
      duration: 2.0,
      predict: {
        options: [
          { label: 'The value, still: Weak keeps it alive' },
          { label: 'None: the value is already gone', correct: true },
          { label: 'A panic' },
          { label: 'It blocks until a new owner exists' },
        ],
        explain: (
          <>
            <code>upgrade</code> returns <code>None</code>. A <code>Weak</code> never prevents the value it points at from being dropped; it only prevents the backing allocation itself from going
            away before every reference to it is gone.
          </>
        ),
      },
      Visual: S.UpgradeAfterDrop,
    },
    {
      title: 'Built with a Weak to itself',
      body: (
        <>
          <code>Rc::new_cyclic</code> hands its constructor a <code>Weak</code> to the value's own allocation before that value even finishes being built, so it can store a weak pointer to itself
          from the start.
        </>
      ),
      duration: 3.2,
      takeaway: "Rc::new_cyclic hands the constructor a Weak to the value's own allocation, for structures that must reference themselves from the start.",
      Visual: S.NewCyclic,
    },
    {
      title: 'Recap: a cycle leaks, Weak breaks it, new_cyclic builds it in',
      body: (
        <>
          A cycle of strong <code>Rc</code>/<code>RefCell</code> references leaks forever, and safe Rust compiles it without complaint. <code>Weak</code> carries no ownership and breaks that
          cycle. <code>upgrade</code> returns <code>None</code> once the last strong owner is gone. <code>Rc::new_cyclic</code> gives a structure a weak pointer to itself, from the start. Next:
          what happens once more than one thread touches the same mutable, shared state at once?
        </>
      ),
      duration: 3.2,
      Visual: S.Recap,
    },
  ],
};

export default reel;
