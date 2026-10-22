import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: the rule behind every borrow Chapter 1 took on faith (many &T or exactly one &mut T, never both),
// what it buys, and the two places it looks more permissive than it is (reborrowing, two-phase borrows). Every
// snippet and every number is executed by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'Two readers or one writer, never both',
      body: (
        <>
          Chapter 1 let you lend a buffer out: <code>&amp;Buf</code> to <code>inspect</code>, <code>&amp;mut Buf</code> to <code>fill</code>. The rule behind every one of those loans: a place may have many live
          shared borrows, or exactly one live exclusive borrow, never both at once. Not "one mutable xor many immutable" alone — the banned thing is <em>overlap</em>, between a write and anything else.
        </>
      ),
      duration: 2.6,
      takeaway: 'Many can read at once, but a writer always has the place alone.',
      Visual: S.TheRule,
    },
    {
      title: 'What the rule buys: no two threads both holding the pen',
      body: (
        <>
          Two threads both reaching for an exclusive borrow of the same place is exactly the shape of a data race, and the checker rejects it before the program runs. A <code>Mutex</code> (Chapter 1, topic 4)
          gives the same exclusivity, but checked at run time: a second caller waits instead of being rejected at compile time.
        </>
      ),
      duration: 3.4,
      takeaway: 'Data-race freedom is the aliasing rule, enforced across threads.',
      Visual: S.DataRaceFreedom,
    },
    {
      title: 'A function the compiler wants to shrink',
      body: (
        <>
          <code>compute</code> writes <code>*output</code> up to twice. A compiler that could assume <code>input</code> and <code>output</code> never overlap could cache <code>*input</code> once and write{' '}
          <code>*output</code> once. If <code>input</code> and <code>output</code> really were the same place, would that shrunk version ever disagree with the original?
        </>
      ),
      duration: 1.7,
      predict: {
        options: [
          { label: 'No — the two versions always agree' },
          { label: 'Yes, whenever input is over 10', correct: true },
          { label: 'Yes, but only for inputs under 5' },
          { label: "The question doesn't apply to references" },
        ],
        explain: (
          <>
            When <code>input &gt; 10</code>, the original sets <code>*output = 1</code> and then, since that also changed <code>*input</code> to 1, the second check (<code>*input &gt; 5</code>) is now false
            — it stops at 1. The shrunk version always lands on 2. They disagree exactly when the two places overlap. Rust doesn't let that input happen: next step.
          </>
        ),
      },
      Visual: S.Compute,
    },
    {
      title: 'compute(&x, &mut x) does not compile',
      body: (
        <>
          Calling <code>compute</code> with the same place as both arguments is rejected outright: <code>E0502</code>, "cannot borrow <code>x</code> as mutable because it is also borrowed as immutable." The
          compiler didn't optimize around that case — it made the case impossible to write.
        </>
      ),
      duration: 3.6,
      takeaway: 'The compiler ruled out the exact input that would break the optimization.',
      Visual: S.AliasFail,
    },
    {
      title: 'The optimizer is told, not just lucky',
      body: (
        <>
          Compiled with optimizations on, the reference version of <code>compute</code> carries <code>noalias</code> on both pointer parameters in its LLVM IR; a version taking raw pointers to the same logic
          carries none. <code>noalias</code> is the compiler's permission slip to treat the two parameters' memory as provably separate — handed to it by the type system, not inferred by luck.
        </>
      ),
      duration: 2.2,
      takeaway: 'noalias is a fact the aliasing rule hands the optimizer, not a guess it makes.',
      Visual: S.Noalias,
    },
    {
      title: 'Lending from a mutable reference without losing it',
      body: (
        <>
          <code>bump(r)</code> twice through the same <code>r: &amp;mut i32</code> compiles, because each call takes a shorter, implicit <code>&amp;mut *r</code> — a <em>reborrow</em> — rather than moving{' '}
          <code>r</code> itself. <code>r</code> is usable again the moment the reborrow's own scope ends.
        </>
      ),
      duration: 3.0,
      takeaway: 'A reborrow lends from a &mut; it never moves the &mut.',
      Visual: S.Reborrow,
    },
    {
      title: 'Does v.push(v.len()) compile?',
      body: (
        <>
          <code>push</code> takes <code>&amp;mut self</code>; its argument <code>v.len()</code> reads <code>v</code> while that exclusive borrow is being set up. Does this compile?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Compiles cleanly', correct: true },
          { label: "E0502: can't borrow v twice" },
          { label: 'Only under older editions' },
          { label: 'Only with v.len().clone()' },
        ],
        explain: (
          <>
            It compiles, on every edition since 2018: the next step shows why the read and the exclusive borrow don't actually overlap in the way the rule forbids.
          </>
        ),
      },
      Visual: S.TwoPhaseQuestion,
    },
    {
      title: 'Reserved, then activated',
      body: (
        <>
          <code>push</code>'s <code>&amp;mut v</code> starts <em>reserved</em>: during the reservation it behaves exactly like a shared borrow, so <code>v.len()</code>'s read is allowed alongside it. Only at
          the call itself does the reservation <em>activate</em> into a true exclusive borrow — a two-phase borrow, used by the compiler only for desugared method calls like this one.
        </>
      ),
      duration: 3.4,
      takeaway: 'A reserved borrow is a shared borrow until it is first used.',
      Visual: S.TwoPhase,
    },
    {
      title: 'A reservation still is not a free pass',
      body: (
        <>
          Take a shared borrow of <code>v[0]</code> during the reservation, then use it <em>after</em> the call: still <code>E0502</code>. The borrow spans the activation point, where the reservation becomes
          exclusive, and the aliasing rule is checked there too — reservation relaxes nothing past that point.
        </>
      ),
      duration: 3.2,
      takeaway: 'The rule still applies across activation; reservation is not an exemption.',
      Visual: S.Sneaky,
    },
    {
      title: 'Recap: the rule, and what it buys',
      body: (
        <>
          Many shared borrows or one exclusive borrow, never both. That gives data-race freedom across threads and the <code>noalias</code> facts the optimizer measurably relies on. Reborrowing lends from a{' '}
          <code>&amp;mut</code> without moving it; a two-phase borrow is reserved, then activated, and the rule still holds past that point. Next: the rule says <em>how many</em> borrows, of what kind, at
          once. It says nothing yet about <em>how long</em> — that's a lifetime.
        </>
      ),
      duration: 2.5,
      Visual: S.Recap,
    },
  ],
};

export default reel;
