import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Holding a span's own guard across an await lets it leak onto
// whatever runs next on the same thread; .instrument(span) and
// #[instrument] both fix it the identical, correct way, by exiting
// and re-entering the span around every real await instead.
const reel: Reel = {
  steps: [
    {
      title: "task_a holds a real Span::enter() guard across a real await; while it is suspended, a genuinely different task, task_b, runs on the identical thread and records one real event. Does that event get recorded as happening inside task_a's own span?",
      body: (
        <>
          One real guard, held across one real await.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, a span only ever covers the task that entered it' },
          { label: 'Yes, genuinely; the span is never exited across the await', correct: true },
          { label: 'Only if both tasks share the identical span' },
        ],
        explain: (
          <>
            Yes. The span leaks onto whatever runs next.
          </>
        ),
      },
      Visual: S.BadPredict,
    },
    {
      title: "Measured: the real, captured event fires with its own current span genuinely recorded as task_a, even though it happened entirely inside task_b's own code, on a different task that never touched task_a's span at all",
      body: (
        <>
          The real, captured event, checked directly.
        </>
      ),
      duration: 3.0,
      Visual: S.BadReveal,
    },
    {
      title: "The identical two tasks are run again, but task_a now wraps its own future with .instrument(span) instead of holding a guard. Does task_b's own event still get misattributed to task_a's span?",
      body: (
        <>
          The same two tasks, one real fix tried.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, the span still has to be entered somehow' },
          { label: 'No, genuinely; it is exited and re-entered around the await', correct: true },
          { label: 'Only on a multi-threaded runtime' },
        ],
        explain: (
          <>
            No. The span is correctly exited and re-entered.
          </>
        ),
      },
      Visual: S.InstrumentPredict,
    },
    {
      title: "Measured: the identical captured event now genuinely has no current span at all, since .instrument(span) exits task_a's span the instant it yields and only re-enters it once task_a itself resumes",
      body: (
        <>
          The real, captured event, fixed.
        </>
      ),
      duration: 3.0,
      takeaway: 'A span attached to a future is exited and re-entered around every real await inside it.',
      Visual: S.InstrumentReveal,
    },
    {
      title: "The identical comparison once more, this time with task_a written as a plain async function carrying #[instrument] instead. Does it behave the same, correct way .instrument(span) did?",
      body: (
        <>
          The same fix, written as an attribute instead.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the macro only adds fields, it does not fix the leak' },
          { label: 'Yes, genuinely; it generates the identical correct wrapping', correct: true },
          { label: 'Only if the function takes no arguments' },
        ],
        explain: (
          <>
            Yes. It generates the identical, correct code.
          </>
        ),
      },
      Visual: S.MacroPredict,
    },
    {
      title: "Measured: the identical captured event again has no current span at all, exactly matching .instrument(span)'s own real result, confirming #[instrument] genuinely generates the same correct code by hand would otherwise have to write",
      body: (
        <>
          The real, captured event, matched exactly.
        </>
      ),
      duration: 3.0,
      takeaway: 'The attribute macro is not a different mechanism; it is the identical, correct code, generated for you.',
      Visual: S.MacroReveal,
    },
    {
      title: "The tracing crate's own documentation states this directly: holding the guard across an await results in incorrect traces, since another task will begin executing while remaining in the entered span; the attached span is instead entered every time the instrumented future is polled. Does this topic's own three measured runs model exactly the mistake and the fix the docs describe?",
      body: (
        <>
          The tracing docs' own words on this mistake.
        </>
      ),
      duration: 2.8,
      takeaway: "A span's lifetime has to be tied to a future being polled, never to a guard someone remembers to hold.",
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a span tied to being polled, not held by hand',
      body: (
        <>
          Holding a span's own guard across an await lets it leak onto whatever runs next on the same thread; .instrument(span) and #[instrument] both fix it the identical, correct way, by exiting and re-entering the span around every real await instead.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
