import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Pin exists because the compiler's generated async state machines can hold a reference into
// their own fields; moving such a value after that reference forms leaves it stale. Every claim
// is executed by examples.py (current stable rustc, edition 2024; pin-project-lite is the one
// real crate dependency, used only for the structural-projection example).
const reel: Reel = {
  steps: [
    {
      title: 'Can a local inside a function end up holding a pointer into another local of that same function?',
      body: (
        <>
          Two ordinary locals, sitting side by side in the same function. Could one of them end up pointing straight at the other's own address?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'No — locals are always independent of each other' },
          { label: "Yes — one local can hold a pointer straight into another's address", correct: true },
          { label: 'Only across separate function calls' },
        ],
        explain: (
          <>
            Yes. Both locals sit in the same place in memory; nothing in the ordinary rules stops one from pointing straight into the other.
          </>
        ),
      },
      Visual: S.SelfPointingLocalsPredict,
    },
    {
      title: 'Yes — and the standard library names the exact place this happens by default',
      body: (
        <>
          The standard library's own words: the compiler's generated async state machines are the key example of a self-referential type.
        </>
      ),
      duration: 2.8,
      Visual: S.NamedByStdlibReveal,
    },
    {
      title: "A self-referential value's own pointer breaks the instant it moves",
      body: (
        <>
          Build the struct, check its own pointer right after construction, then move the whole value and check again.
        </>
      ),
      duration: 3.0,
      takeaway: 'A value pointing into itself is sound only until it moves — the pointer still targets the old address.',
      Visual: S.BreaksOnMoveReveal,
    },
    {
      title: 'Does wrapping it in a Box<T> fix this?',
      body: (
        <>
          The identical self-referential struct, now behind a heap allocation instead of sitting directly on the stack.
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: 'Yes — Box pins its contents in place' },
          { label: 'No — the T can still be moved out of the Box', correct: true },
          { label: "Only if the struct derives Clone" },
        ],
        explain: (
          <>
            No. A Box only promises its own allocation stays put — the value inside it can still be moved out, stale pointer and all.
          </>
        ),
      },
      Visual: S.BoxFixPredict,
    },
    {
      title: 'Pin<Ptr> is a promise about the pointee, enforced by the type',
      body: (
        <>
          The standard library's own definition: Pin wraps a pointer and promises its pointee will not be moved or invalidated.
        </>
      ),
      duration: 3.0,
      takeaway: "Pin<Ptr> promises a pointer's pointee will never move again — a guarantee the type carries, not a convention to remember.",
      Visual: S.PinPromiseReveal,
    },
    {
      title: 'Pinned — on the heap or the stack — the identical self-reference stays valid',
      body: (
        <>
          The same self-referential struct, pinned two different ways: once with Box::pin on the heap, once with the pin! macro on the stack.
        </>
      ),
      duration: 3.0,
      takeaway: 'PhantomPinned plus Box::pin or the pin! macro keeps a self-reference valid — two ways to make the identical promise.',
      Visual: S.PinnedBothWaysReveal,
    },
    {
      title: 'With a Pin<Box<T>> where T is not Unpin, can T still be moved out?',
      body: (
        <>
          The identical pinned value, now handed to a function that takes it by value instead of by reference.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: "Yes — Box always allows moving its contents out" },
          { label: 'No — the compiler refuses outright', correct: true },
          { label: 'Only with an explicit unsafe block' },
        ],
        explain: (
          <>
            No, and the compiler enforces it directly — there is nothing in the safe API that hands back an ownable copy to move out.
          </>
        ),
      },
      Visual: S.MoveOutPredict,
    },
    {
      title: "rustc's own diagnostic: this move is rejected outright",
      body: (
        <>
          A real compiler error, naming the exact pinned value and refusing to move it.
        </>
      ),
      duration: 3.0,
      takeaway: 'Moving a !Unpin value out of Pin<Box<T>> fails to compile — Pin’s guarantee enforced at compile time, not just documented.',
      Visual: S.CompileFailReveal,
    },
    {
      title: "A pinned field projects by the type's own choice, not automatically",
      body: (
        <>
          A real struct built with pin-project-lite: one field marked as sharing the pin, one left as an ordinary field.
        </>
      ),
      duration: 3.0,
      takeaway: 'A pinned field stays pinned only when declared structural — every other field is just an ordinary reference.',
      Visual: S.StructuralProjectionReveal,
    },
    {
      title: "Recap: self-reference, Pin's promise, and projection, proven both ways",
      body: (
        <>
          A self-referential value breaks on move. Pin is a type-level promise, not a convention. The compiler enforces it directly. Projection is a per-field, declared choice.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
