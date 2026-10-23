import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// async fn lowers to an enum of suspension states, one per await point, each holding its own
// live locals; both the size cost and the Send propagation rule are executed by examples.py
// (current stable rustc, edition 2024; std::future::ready only, no external crate needed).
const reel: Reel = {
  steps: [
    {
      title: 'Call an async function — what comes back?',
      body: (
        <>
          An async function is called, but never awaited yet. Before anything else happens, what does calling it actually produce?
        </>
      ),
      duration: 2.4,
      predict: {
        options: [
          { label: "The function's body starts running immediately" },
          { label: 'A value comes back, and nothing has run yet', correct: true },
          { label: 'It blocks until the body finishes' },
        ],
        explain: (
          <>
            A value comes back. Calling an async function is just like calling any other function that returns a future — the laziness from last topic, under a different name.
          </>
        ),
      },
      Visual: S.CallReturnsValuePredict,
    },
    {
      title: 'A value. The same laziness as last topic, by a different name',
      body: (
        <>
          Nothing about async fn changes the rule: constructing a future, however it was written, does no work at all.
        </>
      ),
      duration: 2.8,
      Visual: S.SameLazinessReveal,
    },
    {
      title: 'So what is that value, exactly?',
      body: (
        <>
          The language reference's own description of what the compiler actually builds for this.
        </>
      ),
      duration: 3.0,
      takeaway: 'async fn lowers to an enum with one variant per await point, each variant holding the locals still live there.',
      Visual: S.AnonymousEnumReveal,
    },
    {
      title: "Does holding a bigger local across the same await point change the future's size?",
      body: (
        <>
          Two functions, the identical single await point — one holds nothing extra, the other holds a sizeable local across it.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'No — the await point is the same either way' },
          { label: 'Yes — the enum variant now has to hold that local too', correct: true },
          { label: 'Only if the local is boxed first' },
        ],
        explain: (
          <>
            Yes. The generated enum's variant for that suspension point has to hold every local still alive there, whatever its size.
          </>
        ),
      },
      Visual: S.BiggerLocalPredict,
    },
    {
      title: 'Measured, not assumed: two bytes versus over four thousand',
      body: (
        <>
          The same await point, two different futures — one tiny, one carrying a real, sizeable local across it.
        </>
      ),
      duration: 3.0,
      takeaway: "A future's size is fixed by what its enum holds across its await points — measured, not a style concern.",
      Visual: S.MeasuredSizesReveal,
    },
    {
      title: 'That size difference is a real memcpy every time the future moves',
      body: (
        <>
          Moving a future — into a Box, into a spawned task — copies every byte its suspension-state enum holds.
        </>
      ),
      duration: 3.0,
      takeaway: 'Moving a large future copies every byte its enum holds — the size measured here is the memcpy paid.',
      Visual: S.RealMemcpyReveal,
    },
    {
      title: 'Hold something not safe to move between threads across an await — still fine?',
      body: (
        <>
          The identical await point, now with a value that is not itself safe to send across threads held across it.
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: 'Yes — Send only applies to the function, not what it holds' },
          { label: 'No — the generated future inherits it from whatever it holds', correct: true },
          { label: 'Only if that value is cloned before the await' },
        ],
        explain: (
          <>
            No, it is not fine. The generated enum is a real type holding a real field — if that field is not Send, the whole enum is not Send either.
          </>
        ),
      },
      Visual: S.NotSendPredict,
    },
    {
      title: "rustc's own diagnostic: this future cannot be sent between threads",
      body: (
        <>
          A real compiler error, naming the exact value and the exact await point responsible.
        </>
      ),
      duration: 3.0,
      takeaway: 'Holding a non-Send value across an await point makes the whole future not Send — inherited like any other field.',
      Visual: S.CompilerDiagnosticReveal,
    },
    {
      title: 'Recap: lowering and size, proven both ways',
      body: (
        <>
          async fn is a real enum. Its size is what each await point holds. Moving it copies that. Send propagates in the same way.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
