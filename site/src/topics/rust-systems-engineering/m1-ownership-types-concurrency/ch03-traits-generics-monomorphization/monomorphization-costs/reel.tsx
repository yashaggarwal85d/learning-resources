import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A full topic: a generic function bound by a trait is compiled once per concrete type (monomorphization), free
// at run time but not at compile time or in binary size; the outlining trick keeps the duplicate thin; impl Trait
// in argument position lets parameters differ, in return position it commits to one hidden, unboxed type. Every
// snippet and every claim is executed by examples.py (rustc 1.97.0, edition 2024, x86_64 Linux).
const reel: Reel = {
  steps: [
    {
      title: 'One generic function, compiled once per concrete type',
      body: (
        <>
          A generic function bound by a trait isn't compiled once. The compiler writes it out again, in full, for every concrete type it is actually called with — one body per codec, not one body shared
          between them.
        </>
      ),
      duration: 3.4,
      takeaway: 'Monomorphization: the compiler writes the generic function out again for every concrete type it is actually called with.',
      Visual: S.MonoFanOutStep,
    },
    {
      title: 'How many compiled bodies does rustc actually emit?',
      body: (
        <>
          <code>encode_generic&lt;C: Codec&gt;</code> is called once through a codec <code>A</code> and once through a codec <code>B</code>. Looking at the compiled output before any optimizer touches it,
          how many distinct bodies show up for <code>encode_generic</code>?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'One, shared by both calls' },
          { label: 'Two, one per concrete codec', correct: true },
          { label: 'None — the compiler inlines both away' },
          { label: 'It depends which call runs first' },
        ],
        explain: (
          <>
            <code>--emit=llvm-ir</code> shows exactly two <code>encode_generic</code> symbols, each with the concrete codec's own name folded into it. The optimizer isn't involved yet — this is what the
            compiler produces before it ever tries to make anything faster.
          </>
        ),
      },
      Visual: S.MonomorphizationCode,
    },
    {
      title: 'Zero run-time overhead is not zero cost',
      body: (
        <>
          Both compiled copies run exactly as fast as a hand-written, non-generic function would — that's the whole promise. But producing two full copies instead of one isn't free, and the number of copies
          grows with every new concrete type the function gets called with.
        </>
      ),
      duration: 3.2,
      Visual: S.MonoProof,
    },
    {
      title: 'Pulling the loop out of the generic shrinks the duplicate',
      body: (
        <>
          Move the actual byte-formatting loop into its own ordinary, non-generic function, and the generic wrapper left behind shrinks to a thin shim that just calls it. The public, generic signature
          doesn't change at all — only what gets duplicated per type does.
        </>
      ),
      duration: 3.4,
      takeaway: "Pulling the shared work into a plain function keeps monomorphization's duplicate down to a thin shim.",
      Visual: S.OutliningSplitStep,
    },
    {
      title: 'Skip the outlining: what happens to the duplicate?',
      body: (
        <>
          Write that same loop directly inside the generic function instead of pulling it out, and compile for the same two codecs. What happens to the two compiled copies, compared with the version that
          outlined the loop?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'They stay exactly the same size' },
          { label: 'Each one now duplicates the whole loop, not just a shim', correct: true },
          { label: 'The compiler outlines it automatically anyway' },
          { label: 'Only one of the two copies gets the loop' },
        ],
        explain: (
          <>
            Without outlining, the loop lives inside the generic boundary, so monomorphization duplicates all of it, once per type. Each compiled copy ends up clearly larger than either the outlined
            version's thin shim or its one shared body.
          </>
        ),
      },
      Visual: S.NaiveVsOutlining,
    },
    {
      title: 'impl Trait in argument position: sugar for a hidden generic',
      body: (
        <>
          <code>fn two_impl_trait(a: impl Greet, b: impl Greet)</code> desugars to two separate, anonymous generic parameters — one per position. Called with a <code>Dog</code> and a <code>Cat</code>, the two
          parameters simply hold different concrete types, the same as any other generic.
        </>
      ),
      duration: 3.0,
      Visual: S.ImplTraitArg,
    },
    {
      title: 'One shared bound instead of two impl Trait parameters',
      body: (
        <>
          Write the same function with one shared <code>&lt;T: Greet&gt;</code> on both parameters instead of two separate <code>impl Trait</code> positions, and call it with that same <code>Dog</code> and{' '}
          <code>Cat</code>. Does it still compile?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, exactly the same as impl Trait' },
          { label: 'No: one shared T forces the same concrete type', correct: true },
          { label: 'Compiles only by turning Greet into a trait object' },
          { label: "No: Greet isn't dyn-compatible" },
        ],
        explain: (
          <>
            A single named parameter appears in both positions, so both arguments must be the same concrete type — the compiler reports it plainly: <code>error[E0308]</code>, "expected <code>Dog</code>,
            found <code>Cat</code>."
          </>
        ),
      },
      Visual: S.SharedBoundFail,
    },
    {
      title: 'impl Trait in return position: one hidden, committed type',
      body: (
        <>
          <code>-&gt; impl Fn(i32) -&gt; i32</code> means the function itself picks one real, concrete closure type and every return path commits to it. The caller never learns what that type actually is —
          only that it implements <code>Fn</code>.
        </>
      ),
      duration: 3.2,
      takeaway: 'Return-position impl Trait commits to one real, unboxed type; the caller never learns which one.',
      Visual: S.ImplTraitReturn,
    },
    {
      title: 'Returning it unboxed costs nothing extra; boxing it allocates',
      body: (
        <>
          A counting allocator shows it directly: returning that closure as <code>impl Fn</code> makes no new allocation at all. Returning the same closure boxed, as <code>Box&lt;dyn Fn&gt;</code> — the way
          to return "some closure" before <code>impl Trait</code> existed — allocates on the heap every single call.
        </>
      ),
      duration: 3.4,
      takeaway: 'An unboxed impl Trait return allocates nothing new; a boxed trait object allocates once, every time.',
      Visual: S.AllocCount,
    },
    {
      title: 'Recap: written once per type, not once total',
      body: (
        <>
          One generic body becomes one compiled body per concrete type: free at run time, not free at compile time or in binary size. Outlining keeps the duplicate thin. <code>impl Trait</code> in argument
          position lets parameters differ; one shared bound forces them to match. In return position it commits to one hidden, unboxed type, cheaper than boxing it. Next: a generic function pays its cost
          once, at compile time, for every type it will ever be called with — what if the set of types isn't known until the program is running?
        </>
      ),
      duration: 2.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
