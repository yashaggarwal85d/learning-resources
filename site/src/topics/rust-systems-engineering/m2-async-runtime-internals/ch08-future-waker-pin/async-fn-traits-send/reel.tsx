import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A trait's async fn is neither dyn compatible nor Send-constrainable by callers — two separate
// gaps in the stable 2026 language, each proven by a real compiler error. trait-variant and
// async-trait are real crate dependencies, each fixing exactly one of the two gaps.
const reel: Reel = {
  steps: [
    {
      title: "Can a trait's async method be called through a dyn Trait object?",
      body: (
        <>
          A trait with one ordinary async method. Can one of its implementors be boxed up behind the trait itself, the usual way?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — exactly like any other trait method' },
          { label: 'No — the trait cannot build a vtable for it', correct: true },
          { label: 'Only if the trait has no other methods' },
        ],
        explain: (
          <>
            No. A vtable needs one uniform return type per method; an async method's generated future type is a different shape for every implementor.
          </>
        ),
      },
      Visual: S.DynBoxPredict,
    },
    {
      title: "No — the compiler's own diagnostic says exactly why",
      body: (
        <>
          A real compile error, naming the exact async method responsible.
        </>
      ),
      duration: 2.6,
      Visual: S.DynFailReveal,
    },
    {
      title: 'Even with a Send implementor, can a generic caller require the returned future be Send?',
      body: (
        <>
          A generic implementor already known to be Send, a generic function that spawns across threads — does that make its async method's future Send too?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes — Send implementors always produce Send futures' },
          { label: "No — the trait itself has no way to say so", correct: true },
          { label: 'Only if the method takes &self' },
        ],
        explain: (
          <>
            No. The trait's own signature never wrote down a Send bound on the returned future, so nothing forces it, no matter how Send the implementor is.
          </>
        ),
      },
      Visual: S.SendGenericPredict,
    },
    {
      title: "rustc's own diagnostic: the trait's future cannot be sent between threads",
      body: (
        <>
          A real compile error, naming the exact future that cannot be proven Send.
        </>
      ),
      duration: 2.8,
      takeaway: "A trait's async method can't promise a Send future — not even a Send caller can require it.",
      Visual: S.SendFailReveal,
    },
    {
      title: 'trait_variant::make fixes this by generating a second, Send-bounded trait',
      body: (
        <>
          The crate's own example: one attribute generates a second trait, with the Send bound written directly into its signature.
        </>
      ),
      duration: 3.0,
      takeaway: 'trait-variant generates a Send-bounded sibling trait — the fix is a second trait, not a change to the first.',
      Visual: S.TraitVariantReveal,
    },
    {
      title: 'Proven: spawned on a real thread, through the generated Send trait',
      body: (
        <>
          The identical method, now called through the generated trait, spawned on a real operating-system thread.
        </>
      ),
      duration: 2.8,
      takeaway: "Through the generated trait, the identical method's future really is Send — proven by actually spawning it on another thread.",
      Visual: S.TraitVariantProvenReveal,
    },
    {
      title: 'Does fixing Send also fix dyn dispatch?',
      body: (
        <>
          The same boxed-trait-object attempt from the first step, tried again now that the Send gap is fixed.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: 'Yes — Send and dyn compatibility are the same gap' },
          { label: "No — they're two separate gaps, fixing one does nothing for the other", correct: true },
          { label: 'Only for traits with one method' },
        ],
        explain: (
          <>
            No. These are two independent limitations — vtable construction and bound expressiveness — and fixing one leaves the other exactly as broken.
          </>
        ),
      },
      Visual: S.StillNotDynPredict,
    },
    {
      title: 'async-trait fixes dyn dispatch instead — by boxing every call',
      body: (
        <>
          The crate's own documented expansion: every async method becomes one that returns a boxed, type-erased future.
        </>
      ),
      duration: 3.0,
      takeaway: 'async-trait makes a trait dyn-safe by rewriting every async method into one returning a boxed, type-erased future.',
      Visual: S.AsyncTraitReveal,
    },
    {
      title: 'Measured, not assumed: one real heap allocation, every call',
      body: (
        <>
          A counting allocator around the real dyn-dispatched call, measuring exactly how many allocations that one call costs.
        </>
      ),
      duration: 2.8,
      takeaway: 'Dyn dispatch through async-trait costs one real, measured heap allocation per call — a deliberate tradeoff, not a hidden one.',
      Visual: S.AllocationCountReveal,
    },
    {
      title: 'Recap: two gaps, two separate fixes, proven both ways',
      body: (
        <>
          Neither dyn-safe nor Send-constrainable by default, both proven with real compiler errors. trait-variant fixes Send; async-trait fixes dyn, at one measured allocation.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
