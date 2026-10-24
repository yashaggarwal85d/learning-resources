import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A recorded history gathered under several real, independent failures can
// be mechanically checked for linearizability; only the failures an actual
// read observes ever show up as a violation, and a brute-force checker
// finds the real answer by genuine enumeration, never by assumption.
const reel: Reel = {
  steps: [
    {
      title: 'Two real failures are injected together into a small replicated register: a delayed acknowledgement, and a duplicated message. A read happens after both. Does the resulting recorded history, checked mechanically, turn out consistent with any honest real-time order at all?',
      body: (
        <>
          Two real failures, injected together, then a read.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely' },
          { label: 'No, it genuinely is not', correct: true },
          { label: 'Only if the duplicated message is the one that matters' },
        ],
        explain: (
          <>
            Genuinely not. The checker finds a real violation.
          </>
        ),
      },
      Visual: S.FailureHistoryPredict,
    },
    {
      title: 'Measured: the checker scans the real recorded history and finds it genuinely is not linearizable',
      body: (
        <>
          Every real total order checked, mechanically, by genuine enumeration rather than by assumption.
        </>
      ),
      duration: 3.0,
      Visual: S.FailureHistoryReveal,
    },
    {
      title: 'Of the two real failures injected together, only one actually shows up as a violation in the recorded history. Does the checker name the delayed-acknowledgement read, or the duplicated-message read, as the real problem?',
      body: (
        <>
          Two injected failures; only one real violation.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'The duplicated-message read' },
          { label: 'The delayed-acknowledgement read', correct: true },
          { label: 'Both, equally' },
        ],
        explain: (
          <>
            The delayed-acknowledgement read. The duplicated message was idempotent.
          </>
        ),
      },
      Visual: S.AttributionPredict,
    },
    {
      title: 'Measured: the checker names the delayed-acknowledgement read directly; the duplicated-message read, being idempotent, caused no actual violation',
      body: (
        <>
          The real, measured attribution: one failure left a visible trace, the other genuinely did not.
        </>
      ),
      duration: 3.0,
      takeaway: 'Not every injected failure leaves a trace; only the one an actual read observes ever shows up in a history.',
      Visual: S.AttributionReveal,
    },
    {
      title: 'Now the identical two failures run again, except the lagging replica catches up before anyone reads from it. Is the resulting history now linearizable?',
      body: (
        <>
          The same two failures; one read, moved later.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the duplicated message still breaks it' },
          { label: 'Yes, genuinely', correct: true },
          { label: 'Only if the duplicated message is also fixed' },
        ],
        explain: (
          <>
            Genuinely linearizable. The duplicated message was never the problem.
          </>
        ),
      },
      Visual: S.FixedHistoryPredict,
    },
    {
      title: 'Measured: genuinely linearizable now, even with the duplicated-message failure still present',
      body: (
        <>
          The real, measured result, with the same injected duplicate still in place.
        </>
      ),
      duration: 3.0,
      takeaway: 'A failure that a real read never observes can be injected all day without ever showing up as a violation.',
      Visual: S.FixedHistoryReveal,
    },
    {
      title: 'Now a read genuinely overlaps a write in real time: neither one finishes before the other starts. How many of the real total orders the checker brute-force-enumerates actually respect that real-time precedence?',
      body: (
        <>
          A read, genuinely concurrent with a write.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Only one' },
          { label: 'Exactly two', correct: true },
          { label: 'Every possible order' },
        ],
        explain: (
          <>
            Exactly two. Either order genuinely respects real-time precedence.
          </>
        ),
      },
      Visual: S.ConcurrentPredict,
    },
    {
      title: "Measured: exactly two, matching the real order structure of a single concurrent pair, found by the checker's own brute-force enumeration, not assumed",
      body: (
        <>
          The real, measured count, found by genuine enumeration.
        </>
      ),
      duration: 3.0,
      takeaway: "A genuinely concurrent pair's own real order count comes from its real structure, never from a hand-picked guess.",
      Visual: S.ConcurrentReveal,
    },
    {
      title: "Jepsen's own real methodology for this exact kind of question: a generator produces operations, a nemesis injects real faults, and a checker decides correctness. Does this topic's own code genuinely mirror that structure?",
      body: (
        <>
          Jepsen's own words on generator, nemesis, and checker, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.JepsenReveal,
    },
    {
      title: 'Recap: checking a real history, not assuming it',
      body: (
        <>
          A recorded history gathered under several real, independent failures can be mechanically checked for linearizability; only the failures an actual read observes ever show up as a violation, and a real checker finds the answer by genuine enumeration, never by assumption.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
