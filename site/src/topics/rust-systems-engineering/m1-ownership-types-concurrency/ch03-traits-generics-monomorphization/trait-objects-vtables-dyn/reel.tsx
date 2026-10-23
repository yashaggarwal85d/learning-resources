import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: a dyn Trait reference or Box is a fat pointer (data pointer + vtable pointer); calling
// through it is late binding, resolved at run time; most of its cost is lost inlining, not the indirect
// call itself; dyn-compatibility excludes generic and by-value-Self methods, fixable per-method with
// where Self: Sized; trait upcasting widens directly; enum dispatch trades a vtable for a closed set.
// Every snippet and every claim is executed by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'Two words, not one',
      body: (
        <>
          A reference or <code>Box</code> to a concrete type is one word: just a pointer to the data. A reference or <code>Box</code> to a <code>dyn Trait</code> is two words — the same data pointer, plus
          a pointer to a vtable.
        </>
      ),
      duration: 3.2,
      takeaway: 'A dyn Trait reference or Box is a fat pointer: a data pointer plus a vtable pointer.',
      Visual: S.FatPointer,
    },
    {
      title: "What's actually inside the second word?",
      body: (
        <>
          That second pointer doesn't point at more data. It points at something built once per concrete type. What does it actually point to?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: "The trait's own source code" },
          { label: 'A table of function pointers, one per method', correct: true },
          { label: "A copy of the concrete type's data" },
          { label: "Nothing, it's padding" },
        ],
        explain: (
          <>
            The vtable holds one function pointer per method of the trait — and its supertraits — that the concrete type actually implements. Every value of that same concrete type shares one vtable; only
            the data pointer differs between them.
          </>
        ),
      },
      Visual: S.VtableContents,
    },
    {
      title: 'Calling through it is late binding',
      body: (
        <>
          Call a method on a <code>&amp;dyn Codec</code>, and the compiler can't know in advance which implementation it will reach. The right function pointer is loaded out of the vtable and invoked only
          at the moment of the call itself.
        </>
      ),
      duration: 3.0,
      Visual: S.LateBinding,
    },
    {
      title: "The cost isn't the indirect call",
      body: (
        <>
          The same loop, calling the same trivial method, once through a known type and once through <code>&amp;dyn Codec</code>. Optimized, the known-type version's call disappears entirely. The{' '}
          <code>dyn</code> version keeps a real call through the vtable no matter how much optimization runs — because the callee genuinely isn't known until then.
        </>
      ),
      duration: 3.6,
      takeaway: "Most of dyn Trait's cost is lost inlining, not the indirect call itself.",
      Visual: S.LostInlining,
    },
    {
      title: "A method that takes Self by value can't go in the vtable",
      body: (
        <>
          <code>fn loud(self) -&gt; Self</code>, used through <code>Box&lt;dyn Greet&gt;</code>. The callee would need to know <code>Self</code>'s concrete size to receive it by value — information a fat
          pointer deliberately erases. Does this compile?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, it compiles fine' },
          { label: "No: Self by value can't go through a fat pointer", correct: true },
          { label: 'No: Greet needs to require Send' },
          { label: 'Yes, but loud panics at run time' },
        ],
        explain: (
          <>
            It fails outright, with the compiler naming the exact reason: <code>error[E0038]</code>, "the trait <code>Greet</code> is not dyn compatible," because <code>loud</code> references{' '}
            <code>Self</code> outside its own receiver.
          </>
        ),
      },
      Visual: S.DynIncompatible,
    },
    {
      title: 'One bound excludes just that method',
      body: (
        <>
          Add <code>where Self: Sized</code> to <code>loud</code> alone, and nothing else about <code>Greet</code> changes. The vtable is built without a slot for <code>loud</code>; every other method,
          like <code>hi</code>, still works through <code>Box&lt;dyn Greet&gt;</code> exactly as before.
        </>
      ),
      duration: 3.2,
      takeaway: 'where Self: Sized excludes one method from the vtable instead of disqualifying the whole trait.',
      Visual: S.SizedEscape,
    },
    {
      title: 'Widening to the parent trait, directly',
      body: (
        <>
          <code>Sub: Super</code>, and a value only known as <code>&amp;dyn Sub</code>. Converting it to <code>&amp;dyn Super</code> used to mean going back through the concrete type. Does it still, on
          a current toolchain?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, the concrete type is needed again' },
          { label: 'No: it coerces directly, stable since a recent release', correct: true },
          { label: 'Only through Box, never through a plain reference' },
          { label: 'Only if Super declares no methods of its own' },
        ],
        explain: (
          <>
            It coerces directly — trait upcasting, stabilized in Rust's own one-point-eighty-six release. The subtrait's vtable is laid out so the supertrait's slots can be read straight out of it, with no
            new vtable built.
          </>
        ),
      },
      Visual: S.Upcasting,
    },
    {
      title: 'A closed list, matched by hand',
      body: (
        <>
          Wrap the same two codecs in one <code>enum</code> instead, and dispatch by matching on it explicitly. No vtable, no fat pointer — at the cost of every implementor needing to be known and listed
          in advance.
        </>
      ),
      duration: 3.2,
      takeaway: 'Enum dispatch trades needing every type in advance for no vtable and no fat pointer at all.',
      Visual: S.EnumDispatch,
    },
    {
      title: 'Recap: a fat pointer, called late',
      body: (
        <>
          A <code>dyn Trait</code> reference or <code>Box</code> is a fat pointer: data plus vtable, called through at run time. The real cost is lost inlining, not the indirect call. A by-value{' '}
          <code>Self</code> or generic method blocks the vtable; <code>where Self: Sized</code> excludes just that method. Trait upcasting widens directly; enum dispatch trades flexibility for no vtable at
          all. Next: both of this chapter's answers assume the trait itself can be used this way — what decides whether it can?
        </>
      ),
      duration: 2.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
