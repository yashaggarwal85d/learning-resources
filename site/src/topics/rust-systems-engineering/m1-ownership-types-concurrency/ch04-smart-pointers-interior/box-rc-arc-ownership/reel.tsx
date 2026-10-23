import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Opens Chapter 4: Box is single ownership on the heap; Rc shares that ownership on one thread via
// a plain, non-atomic count; Arc shares it safely across threads via an atomic count, whose cost
// only shows up once more than one thread actually contends for it — measured directly, never
// asserted. Every snippet and every claim is executed by examples.py (rustc 1.97.0, edition 2024,
// x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'One owner, many owners, many owners safely',
      body: (
        <>
          A <code>Node</code> moved through one <code>Box</code> has exactly one owner, on the heap. <code>Rc</code> lets several places share that same owner on one thread; <code>Arc</code> shares it
          safely across threads too.
        </>
      ),
      duration: 3.4,
      takeaway: 'Box is one owner on the heap; Rc shares that owner on one thread; Arc shares it safely across threads.',
      Visual: S.OwnershipShapes,
    },
    {
      title: 'Moving Rc into a new thread',
      body: (
        <>
          An <code>Rc&lt;i32&gt;</code> moved into <code>thread::spawn</code>. Does this compile?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, the count is just a number' },
          { label: "No: Rc's count isn't safe to touch from two threads", correct: true },
          { label: "Yes, but only with move" },
          { label: 'No, but only because i32 is Copy' },
        ],
        explain: (
          <>
            It fails with <code>error[E0277]</code>: <code>Rc&lt;i32&gt;</code> cannot be sent between threads safely. Its reference count is a plain, non-atomic counter, unsafe to touch from two
            threads at once.
          </>
        ),
      },
      Visual: S.RcNotSend,
    },
    {
      title: 'A shared count, cheap to touch',
      body: (
        <>
          <code>Rc::clone</code> never copies the <code>Node</code>; it bumps a plain count and hands back a pointer to the same allocation. <code>Rc::strong_count</code> rises on clone, falls on
          drop.
        </>
      ),
      duration: 3.2,
      Visual: S.RcShared,
    },
    {
      title: 'The same shape, safe across threads',
      body: (
        <>
          Four real threads each clone the identical <code>Arc&lt;Node&gt;</code>, read it, and exit. <code>Arc</code>'s count is atomic, so touching it from several threads at once is safe — unlike
          <code>Rc</code>'s.
        </>
      ),
      duration: 3.4,
      takeaway: "Arc's count is atomic, so cloning and dropping it from several threads at once is safe, unlike Rc's.",
      Visual: S.ArcShared,
    },
    {
      title: 'Does splitting the work across threads speed it up?',
      body: (
        <>
          The same total number of clone-and-drop pairs on one shared <code>Arc</code>: once run by a single thread alone, once split across four threads released together by a barrier. Does
          splitting it finish sooner?
        </>
      ),
      duration: 2.2,
      predict: {
        options: [
          { label: 'Yes, close to four times faster' },
          { label: 'No: the four threads together take longer than one thread alone', correct: true },
          { label: 'About the same either way' },
          { label: 'Only slower on a machine with few cores' },
        ],
        explain: (
          <>
            The measured, contended run took noticeably longer than the single uncontended thread doing the entire thing alone. Every clone and drop is a real atomic read-modify-write on the same
            shared cache line, and four threads racing for it cost far more than the split work gave back.
          </>
        ),
      },
      Visual: S.ContentionPredict,
    },
    {
      title: 'Measuring what contention really costs',
      body: (
        <>
          The same run's own numbers: the contended time measured well above the single uncontended thread's own total, not just above the naive quarter-time guess.
        </>
      ),
      duration: 3.0,
      takeaway: 'Arc::clone is cheap uncontended, but every clone and drop costs real time once threads actually contend.',
      Visual: S.ContentionBar,
    },
    {
      title: 'Recap: one owner, shared, and shared safely',
      body: (
        <>
          <code>Box</code> is one owner on the heap. <code>Rc</code> shares that owner on one thread with a plain count, <code>!Send</code>. <code>Arc</code> shares it safely across threads with an
          atomic count — cheap uncontended, measurably not cheap once several threads actually race for it. Next: none of the three let you mutate through a shared owner on their own. What actually
          makes that legal?
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
