import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: an associated type is chosen once per impl, a generic parameter on the trait lets
// the same type implement it many times; a generic associated type ties an associated type to each
// call's own lifetime, for a lending iterator; the orphan rule guarantees one impl of a trait per
// type, the newtype pattern satisfies it anyway, and a blanket impl covers every qualifying type in
// one declaration. Every snippet and every claim is executed by examples.py (rustc 1.97.0, edition
// 2024, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'Chosen once, or chosen many times',
      body: (
        <>
          <code>Codec::Output</code> is an associated type: chosen once, inside the one impl a type gets. <code>Meters</code> implements <code>From&lt;i32&gt;</code> and <code>From&lt;f64&gt;</code>{' '}
          separately — a generic parameter on the trait, implemented many times, once per source type.
        </>
      ),
      duration: 3.4,
      takeaway: 'An associated type is chosen once per impl; a generic parameter lets the same type implement it many times.',
      Visual: S.AssocVsGeneric,
    },
    {
      title: 'Can the same type pick Output twice?',
      body: (
        <>
          Write a second <code>impl Codec for A</code>, choosing a different <code>Output</code> this time. Does the compiler let the second choice stand, or override the first?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, Rust uses the most recent one' },
          { label: "No: it's a duplicate impl, rejected outright", correct: true },
          { label: 'Yes, but only across different modules' },
          { label: "No, but only because Output differs" },
        ],
        explain: (
          <>
            It fails with <code>error[E0119]</code>, "conflicting implementations." A type can implement a given trait exactly once, full stop — with or without an associated type involved.
          </>
        ),
      },
      Visual: S.DuplicateImpl,
    },
    {
      title: 'A generic parameter dodges that limit',
      body: (
        <>
          <code>CodecGeneric&lt;u8&gt;</code> and <code>CodecGeneric&lt;u16&gt;</code>, both implemented for the same type, compile together without complaint — the same shape <code>From&lt;i32&gt;</code>{' '}
          and <code>From&lt;f64&gt;</code> use.
        </>
      ),
      duration: 3.0,
      Visual: S.GenericMultiple,
    },
    {
      title: 'An item that borrows from the call itself',
      body: (
        <>
          <code>type Item&lt;'a&gt; where Self: 'a;</code> is an associated type that is itself generic over a lifetime. Each call to <code>next</code> hands back a value tied to that one call's own{' '}
          <code>&amp;mut self</code> borrow — something <code>Iterator::Item</code> alone can't express.
        </>
      ),
      duration: 3.6,
      takeaway: 'A GAT is an associated type generic over a lifetime, needed when the returned item borrows from the call itself.',
      Visual: S.GatLending,
    },
    {
      title: 'Implementing a foreign trait for a foreign type',
      body: (
        <>
          <code>impl Display for Vec&lt;u8&gt;</code>: neither <code>Display</code> nor <code>Vec</code> is defined in this crate. Does this compile?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, with a warning' },
          { label: "No: neither Display nor Vec is defined here", correct: true },
          { label: "No, but only because Vec is generic" },
          { label: 'Yes, inside an unsafe block' },
        ],
        explain: (
          <>
            It fails with <code>error[E0117]</code>, naming the exact rule: only a trait or a type defined in the current crate may be implemented together. This is the orphan rule, and it's what
            guarantees exactly one impl of any trait for any type exists, program-wide.
          </>
        ),
      },
      Visual: S.OrphanFail,
    },
    {
      title: 'A local wrapper satisfies the rule',
      body: (
        <>
          Wrap the same <code>Vec&lt;u8&gt;</code> in a local <code>struct Bytes(Vec&lt;u8&gt;);</code>, and the identical <code>Display</code> logic compiles — because <code>Bytes</code>, unlike{' '}
          <code>Vec</code>, is defined right here.
        </>
      ),
      duration: 3.2,
      takeaway: 'The newtype pattern wraps a foreign type in a local one, specifically to satisfy the orphan rule.',
      Visual: S.NewtypeFix,
    },
    {
      title: 'One impl, every type that qualifies',
      body: (
        <>
          <code>impl&lt;T: Debug&gt; Describe for T</code> — the same shape as the standard library's own <code>impl&lt;T: Display&gt; ToString for T</code> — covers a plain integer and a custom struct
          from one single declaration.
        </>
      ),
      duration: 3.0,
      Visual: S.BlanketImpl,
    },
    {
      title: 'Recap: chosen once, chosen many, chosen locally',
      body: (
        <>
          An associated type is chosen once per impl; a generic parameter on the trait allows many. A GAT ties an associated type to each call's own lifetime, for a lending iterator. The orphan rule
          needs the trait or the type to be local; the newtype pattern satisfies it anyway. A blanket impl covers every qualifying type at once. Next: every <code>dyn Trait</code> value this chapter
          built was borrowed or already behind a <code>Box</code> — what shape of ownership is that, and what do <code>Rc</code>/<code>Arc</code> add when one owner stops being enough?
        </>
      ),
      duration: 2.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
