import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results on this sandbox's own PyO3 extension (examples.py, examples/hot_transform/): a
// real maturin build, installed into this interpreter, whose function matches an independently
// computed pure-Python and Polars result on the same two million generated prices; a real,
// clearly faster speed advantage over pure Python measured directly across repeated runs; a real
// counter-incrementing Python thread making far more progress while the extension's busy loop
// releases the GIL than while it holds it; two real, differently named wheel files (per-version
// vs. abi3) built from the identical source with one feature flag; a real, directly checked
// confirmation that this sandbox's own CPython is not a free-threaded build.
// No literal digits anywhere (the duration numbers below are exempt).
const reel: Reel = {
  steps: [
    {
      title: "Hook: every library this chapter leaned on for speed — what's actually running underneath?",
      body: (
        <>
          This chapter called a dataframe library fast, a validation library fast, a bulk-load
          driver fast — and never once opened what any of them actually run on. What's really
          underneath?
        </>
      ),
      duration: 4.8,
      fig: "Polars, Pydantic's validation core, the ADBC driver — this chapter called all three fast. What are they actually written in?",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the libraries this chapter leaned on, named directly',
      body: (
        <>
          Two of this chapter's own libraries, checked against their own documentation rather
          than assumed from outside. One names its core as Rust directly. The other names its
          validation logic as Rust directly too, and calls that out as the reason it's fast.
        </>
      ),
      duration: 4.8,
      fig: "Polars' own documentation, Pydantic's own documentation — what do they say they're written in?",
      Visual: S.RevealNamedDirectly,
    },
    {
      title: 'Reveal: a real PyO3 extension, built and imported',
      body: (
        <>
          A small function, written in Rust, compiled with one real build tool into something
          Python can load directly. A plain import pulls it in, and calling it returns a real,
          correct result — not a packaging exercise, an actual working extension.
        </>
      ),
      duration: 4.8,
      fig: 'a Rust function, compiled into Python with one build tool — does the import actually work?',
      Visual: S.RevealExtensionBuilds,
    },
    {
      title: 'Predict: does releasing the GIL inside a Rust extension actually let Python keep working?',
      body: (
        <>
          A Rust extension can explicitly release the one lock that normally stops several
          Python threads from running bytecode at once. Does a separate Python thread actually
          get real work done while that's released, or is the release mostly a formality?
        </>
      ),
      duration: 2.8,
      fig: 'a Rust extension explicitly releases the GIL mid-call — does a separate Python thread actually get to run, or is that just a formality?',
      predict: {
        options: [
          { label: 'No — releasing the GIL from Rust is mostly a formality; Python still waits' },
          { label: 'Yes — a separate Python thread makes real, measurable progress', correct: true },
        ],
        explain: (
          <>
            Yes. Releasing the GIL from inside a Rust extension genuinely drops CPython's own
            lock for that call's duration — a separate Python thread's own measured progress
            during that window is the direct evidence, not a documented formality.
          </>
        ),
      },
      Visual: S.PredictGilRelease,
    },
    {
      title: 'Reveal: the same computation, three ways, measured',
      body: (
        <>
          The identical transformation, computed as pure Python, as the compiled extension, and
          as a Polars expression — and all three checked to agree on the exact same answer
          before any time is compared. Measured directly, the extension lands well ahead of
          pure Python.
        </>
      ),
      duration: 4.8,
      fig: 'the identical transformation, run as pure Python, as a compiled extension, and as a Polars expression — how do the real times compare?',
      takeaway: 'The same computation measured three ways confirms the extension does real work faster, not just moves overhead around.',
      Visual: S.RevealThreeWays,
    },
    {
      title: 'Reveal: the GIL released, measured directly',
      body: (
        <>
          The identical busy work inside the extension, run once while holding the lock the
          whole time, and once releasing it. A separate Python thread counting in the
          background gets a small number of increments done while it's held, and a far larger
          number done, in the same span, while it's released.
        </>
      ),
      duration: 4.8,
      fig: 'the identical busy work, once holding the GIL and once releasing it — how much does a separate Python thread actually get done?',
      takeaway: "Releasing the GIL isn't a formality — a separate thread measurably does far more real work while it's released.",
      Visual: S.RevealGilMeasured,
    },
    {
      title: 'Reveal: one feature flag, two real wheels',
      body: (
        <>
          The identical extension, built twice from the same source — once the ordinary way,
          once with one feature flag enabled. The two resulting files really do carry different
          names: one tied to this exact Python version, the other tagged for a whole range of
          versions from here up.
        </>
      ),
      duration: 4.8,
      fig: 'the identical extension, built once per-version and once as abi3 — do the two wheel files actually differ, or is abi3 just a label?',
      takeaway: "One feature flag produces a genuinely different, differently named wheel — not a label applied after the fact.",
      Visual: S.RevealAbi3,
    },
    {
      title: "Reveal: what this sandbox's own interpreter actually is, checked rather than assumed",
      body: (
        <>
          A real, checkable fact about this exact interpreter rather than a guess from its
          version number: asking it directly for its own build configuration shows this one
          wasn't built with the lock removable at all.
        </>
      ),
      duration: 4.8,
      fig: "this sandbox's own interpreter, checked directly — is it actually a free-threaded build, or not?",
      Visual: S.RevealFreeThreadingChecked,
    },
    {
      title: 'Recap',
      body: (
        <>
          Two of this chapter's own fast libraries name Rust as their own core directly. A real
          PyO3 extension, built with one tool, imports and runs like any other module, measurably
          faster than pure Python on the identical work. Releasing the GIL from inside it
          genuinely frees a separate Python thread to make real progress. One feature flag
          produces a genuinely different wheel, tagged for a whole range of future versions. And
          whether an interpreter can remove the lock at all is a checkable fact, not a guess —
          this sandbox's own build can't.
        </>
      ),
      duration: 4.8,
      fig: 'two libraries naming Rust directly, a real extension built and measured, a measured GIL release, two real wheels, one checked build fact',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team builds a PyO3 extension and ships it as a single wheel tied to their one
          deployment's exact Python version. Later, they need the identical extension running
          unmodified on three more Python versions, without multiplying how many wheels they
          build and test. What should they have chosen upfront, and why does that choice matter
          now rather than later?
        </>
      ),
      duration: 2.8,
      fig: "a team shipped a per-version wheel and now needs three more versions covered — what should they have chosen upfront, and why does it matter now?",
      predict: {
        options: [
          { label: 'Nothing to change — building a new per-version wheel for each new Python version is the normal cost' },
          { label: 'They should have built with the abi3 feature from the start; the same single wheel would already cover every version from its minimum up', correct: true },
        ],
        explain: (
          <>
            They should have built with abi3 from the start. A per-version wheel locks the
            build to exactly the Python version it was compiled against; an abi3 wheel, built
            with the identical source and one extra feature flag, already covers every version
            from its declared minimum up — exactly the real, differently named wheel this topic
            built and measured directly.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
