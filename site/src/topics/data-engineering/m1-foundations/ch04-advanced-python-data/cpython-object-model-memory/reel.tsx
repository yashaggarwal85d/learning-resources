import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own CPython (examples.py): the boxed-vs-packed int ratio,
// the __slots__ ratio, the specializing interpreter's own real disassembly before/after warm-up,
// a real loop-vs-vectorized speedup, and a direct check that this build has neither the
// experimental JIT nor free-threading enabled. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: 'A per-row loop looks innocent — what is each number actually carrying?',
      body: (
        <>
          The same arithmetic, the same loop, runs tens of times faster as a single vectorized
          call right next to it. What is every number in that loop actually paying for that a
          packed buffer never does?
        </>
      ),
      duration: 4.8,
      fig: 'the same math, a loop and a vectorized call — what is the loop actually paying for?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the PyObject header, quoted directly',
      body: (
        <>
          Every Python object carries a reference count and a type pointer before a single byte
          of its own value — overhead that exists whether the value is a tiny integer or a whole
          dataframe.
        </>
      ),
      duration: 4.8,
      fig: 'a reference count and a type pointer, before a single byte of the value itself',
      Visual: S.RevealPyObjectHeader,
    },
    {
      title: 'Predict: does a list of plain integers cost about the same as a packed buffer?',
      body: (
        <>
          A list of a million plain Python integers, versus the identical values packed into a
          native buffer. About the same memory, or dramatically more?
        </>
      ),
      duration: 2.8,
      fig: 'a list of plain integers vs. a packed buffer — about the same, or dramatically more?',
      predict: {
        options: [
          { label: 'About the same — they are just numbers either way' },
          { label: 'Dramatically more — every one carries its own header', correct: true },
        ],
        explain: (
          <>
            Dramatically more. Every integer in the list is its own full object with its own
            header and refcount; the list itself only holds pointers to them, and none of that
            per-object overhead exists in a packed native buffer.
          </>
        ),
      },
      Visual: S.PredictBoxedVsPacked,
    },
    {
      title: 'Reveal: the lab — boxed vs. packed, measured for real',
      body: (
        <>
          The same values, boxed in a Python list versus packed into a native buffer, measured
          directly on this sandbox's own interpreter — not estimated, counted byte for byte.
        </>
      ),
      duration: 4.8,
      fig: 'the same values, boxed and packed, measured byte for byte on this sandbox',
      Visual: S.RevealBoxedVsPackedMeasured,
    },
    {
      title: "Reveal: the lab — __slots__, measured for real",
      body: (
        <>
          The identical three-field object, with and without its own per-instance dictionary.
          Dropping that dictionary doesn't just shrink the instance — it removes the dictionary
          entirely.
        </>
      ),
      duration: 4.8,
      fig: "the same object, with and without its own dictionary — measured, not estimated",
      takeaway: 'A plain instance pays for a whole per-instance dictionary it rarely needs; __slots__ removes it outright, not just shrinks it.',
      Visual: S.RevealSlotsMeasured,
    },
    {
      title: 'Predict: does the interpreter run identical bytecode no matter the type?',
      body: (
        <>
          Python is dynamically typed throughout execution. Does the interpreter run the exact
          same bytecode for a line of code no matter what type flows through it, or does it
          rewrite itself once it sees what actually showed up?
        </>
      ),
      duration: 2.8,
      fig: 'does the bytecode stay fixed regardless of type, or does the interpreter rewrite it?',
      predict: {
        options: [
          { label: 'The same bytecode always — Python stays dynamically typed at every step' },
          { label: 'It adapts — the bytecode itself changes once a type shows up repeatedly', correct: true },
        ],
        explain: (
          <>
            It adapts. The interpreter speculatively specializes each instruction to the types it
            actually sees, and rewrites itself again if that pattern changes later.
          </>
        ),
      },
      Visual: S.PredictSpecialization,
    },
    {
      title: 'Reveal: the lab — the interpreter disassembled, cold and then warm',
      body: (
        <>
          The identical function's own bytecode: generic before a single call, then rewritten to
          a type-specific instruction once it has actually run enough times to specialize.
        </>
      ),
      duration: 4.8,
      fig: "the same function's bytecode, generic before any call and type-specific after warm-up",
      Visual: S.RevealSpecializationDisassembled,
    },
    {
      title: 'Reveal: what specialization buys, quoted directly',
      body: (
        <>
          A speculative, adaptive interpreter — specializing to the types it sees, and adapting
          again the moment that pattern changes, so a wrong guess costs as little as possible.
        </>
      ),
      duration: 4.8,
      fig: 'speculative and adaptive — specializes to what it sees, adapts when that changes',
      Visual: S.RevealSpecializationQuote,
    },
    {
      title: "Reveal: the experimental JIT, quoted directly — this sandbox doesn't have it",
      body: (
        <>
          A real just-in-time compiler sits past the specializing interpreter, turning hot
          specialized bytecode into machine code — but only in a build configured for it, which
          this sandbox's own interpreter genuinely is not.
        </>
      ),
      duration: 4.8,
      fig: "hot bytecode compiled to machine code — but only in a build configured for it, which this sandbox is not",
      takeaway: "A feature gated behind a build flag isn't automatic; check the build directly, never assume it from a version.",
      Visual: S.RevealJitDisclosure,
    },
    {
      title: 'Reveal: the lab — the vectorized call is still far ahead',
      body: (
        <>
          Specialization and the JIT both speed up the interpreter's own loop. Neither removes
          the boxed representation measured earlier — and that gap is most of what a vectorized
          call skips entirely.
        </>
      ),
      duration: 4.8,
      fig: "the interpreter sped up, but a vectorized call is still measured far ahead of it",
      takeaway: "Specializing and JIT-compiling the interpreter make the loop itself faster; neither undoes the boxing cost a vectorized call skips altogether.",
      Visual: S.RevealLoopVsVectorized,
    },
    {
      title: 'Recap',
      body: (
        <>
          A boxed value always carries its header's own cost; __slots__ removes a dictionary most
          instances never needed. The interpreter adapts to the types it actually sees, at a real
          cost when they change. Neither trick closes the gap a native, columnar kernel skips
          from the start.
        </>
      ),
      duration: 4.8,
      fig: 'boxed values carry real overhead; the interpreter adapts, at a cost; neither closes the vectorized gap',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A function is called millions of times, but with a genuine mix of integer and
          floating-point arguments instead of one consistent type throughout. Does specialization
          still help here, or does the mix undo it?
        </>
      ),
      duration: 2.8,
      fig: 'millions of calls, but a genuine mix of int and float arguments — does specialization still help?',
      predict: {
        options: [
          { label: 'Yes, just as much — the interpreter adapts either way, at no extra cost' },
          { label: 'It still helps, but measurably less — re-adapting to the mix has a real cost', correct: true },
        ],
        explain: (
          <>
            It still helps, but measurably less. The interpreter keeps re-specializing as the
            type changes back and forth, and that repeated re-adaptation is exactly the
            "additional work caused by mis-specialization" the interpreter's own design tries to
            keep as cheap as possible — cheap, not free.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
