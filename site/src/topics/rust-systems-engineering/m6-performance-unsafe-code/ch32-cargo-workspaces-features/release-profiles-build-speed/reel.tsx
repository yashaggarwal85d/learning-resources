import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// codegen-units and lto trade build time for runtime optimization;
// strip trades debuggability for a smaller shipped binary; panic
// strategy trades a real safety capability for a smaller one still;
// a release profile is a set of real, deliberate trades, not a
// single "faster" switch.
const reel: Reel = {
  steps: [
    {
      title: 'The identical crate is built once under the default release profile, then again with codegen-units = 1 and lto = "fat" added. Does the second real build genuinely take longer?',
      body: (
        <>
          One real crate, one profile dial added.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, fewer codegen units always builds faster' },
          { label: 'Yes, genuinely; whole-program optimization costs time', correct: true },
          { label: 'Only if the crate is large enough to need it' },
        ],
        explain: (
          <>
            Yes. Whole-program optimization costs real time.
          </>
        ),
      },
      Visual: S.LtoPredict,
    },
    {
      title: "Measured: the real, default release build and the real codegen-units = 1, lto = fat build are timed directly on this container's own toolchain; the second genuinely takes measurably longer, every time",
      body: (
        <>
          The real build, timed both ways.
        </>
      ),
      duration: 3.0,
      Visual: S.LtoReveal,
    },
    {
      title: 'The identical crate is built once with the default profile, then again with strip = true added. Does the real binary on disk genuinely shrink?',
      body: (
        <>
          One real binary, one dial added instead.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "No, stripping only changes a debugger's view of it" },
          { label: 'Yes, genuinely; the real file on disk gets smaller', correct: true },
          { label: 'Only on a non-Linux target' },
        ],
        explain: (
          <>
            Yes. The real file on disk shrinks.
          </>
        ),
      },
      Visual: S.StripPredict,
    },
    {
      title: "Measured: the real, unstripped binary and the real, stripped binary are both measured directly by their own real file size on disk; the stripped one is genuinely smaller every time",
      body: (
        <>
          The real binary, measured both ways.
        </>
      ),
      duration: 3.0,
      takeaway: "A profile dial can shrink what actually ships without changing one line of the program's own behavior.",
      Visual: S.StripReveal,
    },
    {
      title: 'The identical crate is built once more with the default, unwinding panic strategy, then again with panic = "abort" added. Does the real binary genuinely shrink this time too?',
      body: (
        <>
          The same crate, a different dial again.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the panic strategy only matters if it panics' },
          { label: 'Yes, genuinely; the unwinding machinery costs real space', correct: true },
          { label: 'Only if the crate uses catch_unwind' },
        ],
        explain: (
          <>
            Yes. Unwinding machinery costs real space, unused or not.
          </>
        ),
      },
      Visual: S.AbortPredict,
    },
    {
      title: 'Measured: the real, unwinding binary and the real, panic = "abort" binary are both measured directly by their own real file size on disk; the abort one is genuinely smaller every time, since no stack-unwinding tables need to be generated for it',
      body: (
        <>
          The real binary, measured once more.
        </>
      ),
      duration: 3.0,
      takeaway: "A release profile's own dials trade away a real capability for a real, measured cost in return.",
      Visual: S.AbortReveal,
    },
    {
      title: "The Cargo Book states these rules directly: LTO produces better optimized code at the cost of longer linking time; more codegen units lets more of a crate build in parallel, possibly reducing compile time but producing slower code. Do this topic's own three measured trade-offs model exactly the trade the Cargo Book names?",
      body: (
        <>
          The Cargo Book's own words on these trades.
        </>
      ),
      duration: 2.8,
      takeaway: "Every one of a release profile's own dials is a real trade made on purpose, never a free win.",
      Visual: S.DocsReveal,
    },
    {
      title: "Recap: a release profile's own real, deliberate trades",
      body: (
        <>
          codegen-units and lto trade build time for runtime optimization; strip trades debuggability for a smaller shipped binary; panic strategy trades a real capability for a smaller one still; a release profile is a set of real, deliberate trades, never a single "faster" switch.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
