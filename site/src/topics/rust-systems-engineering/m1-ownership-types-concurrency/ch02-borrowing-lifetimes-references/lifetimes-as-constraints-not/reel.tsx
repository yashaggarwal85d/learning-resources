import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: a lifetime as a constraint between existing borrows, never a duration; elision's three rules
// and its one failure; covariance vs. invariance; higher-ranked bounds; T: 'static against &'static T. Every
// snippet and every claim is executed by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: "A lifetime never extends a value's life",
      body: (
        <>
          Chapter 1 fixed when a value dies: its owner's scope ends, drop runs. A lifetime is something else entirely: a span over the <em>borrows</em> of a value, describing how they relate to each other.
          It never pushes that drop a moment later.
        </>
      ),
      duration: 3.4,
      takeaway: 'A lifetime describes a relation between borrows, never a duration.',
      Visual: S.NotADuration,
    },
    {
      title: 'Three rules fill in what is left out',
      body: (
        <>
          <code>fn substr1(s: &amp;str, until: usize) -&gt; &amp;str</code> names no lifetime at all. There is exactly one input lifetime, so the compiler assigns it to the elided output — the second of three
          elision rules.
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: "The output gets s's lifetime", correct: true },
          { label: 'The compiler rejects this' },
          { label: "It needs an explicit 'a" },
          { label: 'The output is always &\'static' },
        ],
        explain: (
          <>
            With exactly one lifetime among the parameters, every elided output takes it. Only when there are two or more input lifetimes, and no <code>&amp;self</code>, does elision have nothing to go on — next
            step.
          </>
        ),
      },
      Visual: S.Elision,
    },
    {
      title: 'Elision gives up: two inputs, no receiver',
      body: (
        <>
          <code>frob(s: &amp;str, t: &amp;str) -&gt; &amp;str</code> has two candidates, no receiver to prefer. The compiler won't guess which one the output borrows from: <code>E0106</code>.
        </>
      ),
      duration: 3.2,
      Visual: S.ElisionAmbiguous,
    },
    {
      title: 'Can a longer borrow stand in for a shorter one?',
      body: (
        <>
          Pass a <code>&amp;'static str</code> and a shorter-lived <code>&amp;str</code> by value to one function generic over <code>T</code>: it compiles. <code>&amp;'a T</code> is covariant over{' '}
          <code>'a</code> — a longer-lived reference can always stand in where a shorter one is expected.
        </>
      ),
      duration: 3.4,
      takeaway: "&'a T is covariant: a longer-lived borrow can always stand in for a shorter one.",
      Visual: S.Covariance,
    },
    {
      title: 'The same two references, now through a mutable reference',
      body: (
        <>
          Swap that same pair into a <code>&amp;mut T</code> instead, the generic <code>assign</code> function from the Nomicon. Same two references, same lifetimes. Does it still compile?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'Yes, by the same covariance' },
          { label: "No: E0597, &mut T is invariant", correct: true },
          { label: 'Yes, but only with a clone' },
          { label: 'No: E0502, aliasing' },
        ],
        explain: (
          <>
            <code>&amp;'a mut T</code> is invariant over <code>T</code>: no subtyping applies at all, so the two references must share exactly one lifetime. The shorter one doesn't live long enough for that,
            and the compiler says so: <code>E0597</code>.
          </>
        ),
      },
      Visual: S.InvarianceMut,
    },
    {
      title: 'Cell<T> inherits the same invariance',
      body: (
        <>
          The identical shape of failure shows up through <code>Cell&lt;&amp;'a str&gt;</code>, for the same reason: interior mutability lets you write through what looks like a shared reference, so{' '}
          <code>Cell&lt;T&gt;</code> (and <code>UnsafeCell&lt;T&gt;</code>) get <code>&amp;mut T</code>'s variance, not <code>&amp;T</code>'s.
        </>
      ),
      duration: 3.4,
      takeaway: 'Anything that lets you write through a shared reference is invariant in what it holds.',
      Visual: S.CellInvariance,
    },
    {
      title: 'A lifetime that cannot be named until the call happens',
      body: (
        <>
          A closure field's <code>&amp;self</code> has whatever lifetime the caller gives it at each call — a lifetime that doesn't exist yet when the bound is written. The elided{' '}
          <code>F: Fn(&amp;(u8, u16)) -&gt; &amp;u8</code> really means <code>for&lt;'a&gt; F: Fn(&amp;'a (u8, u16)) -&gt; &amp;'a u8</code>: a bound that must hold for every choice of <code>'a</code>, not
          one the caller picks in advance.
        </>
      ),
      duration: 3.6,
      takeaway: 'A higher-ranked bound holds for every lifetime, not one fixed in advance.',
      Visual: S.Hrtb,
    },
    {
      title: "T: 'static is not a promise a value lives forever",
      body: (
        <>
          <code>print_it(input: impl Debug + 'static)</code> means <code>input</code>'s type holds no borrow shorter than <code>'static</code> — nothing about how long the call itself runs. Which call fails:
          the owned <code>i</code>, or the borrowed <code>&amp;i</code>?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'print_it(i): owned data fails' },
          { label: 'print_it(&i): borrowed data fails', correct: true },
          { label: 'Both compile' },
          { label: 'Neither compiles' },
        ],
        explain: (
          <>
            <code>print_it(&amp;i)</code> fails: <code>i</code> only lives to the end of <code>main</code>, so <code>&amp;i</code> isn't <code>'static</code>. <code>print_it(i)</code> moves the owned{' '}
            <code>i</code> in — nothing inside it borrows anything, so it trivially satisfies the bound.
          </>
        ),
      },
      Visual: S.StaticBound,
    },
    {
      title: 'The one case the bound really is the fix',
      body: (
        <>
          <code>Box::leak</code> mints a genuine <code>&amp;'static</code> reference at run time, by deliberately skipping its destructor — Chapter 1's leak-safety, used on purpose. That's rare and explicit;
          reaching for <code>'static</code> to silence an error almost never is the fix it looks like.
        </>
      ),
      duration: 3.2,
      takeaway: 'Minting real \'static data is deliberate and rare; patching an error with it almost never is.',
      Visual: S.BoxLeak,
    },
    {
      title: 'Recap: constraint, not duration',
      body: (
        <>
          A lifetime constrains how borrows relate, never how long a value lives. Elision resolves one input lifetime; two is ambiguous. <code>&amp;'a T</code> is covariant; <code>&amp;'a mut T</code> and{' '}
          <code>Cell&lt;T&gt;</code> are invariant. A higher-ranked bound holds for every lifetime. <code>T: 'static</code> is about content, not immortality. Next: a parser that returns many borrowed views,
          all tied to one buffer — what shape does that take?
        </>
      ),
      duration: 2.6,
      Visual: S.Recap,
    },
  ],
};

export default reel;
