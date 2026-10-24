import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// At-least-once delivery genuinely redelivers a message whose own effect
// may have already run; a real idempotency key removes that duplicate's
// own effect without ever stopping the redelivery itself.
const reel: Reel = {
  steps: [
    {
      title: "A consumer applies a real side effect, then commits its own offset, as two separate steps. The process genuinely crashes between them. Does the next real poll genuinely redeliver that same message?",
      body: (
        <>
          A side effect, a crash, an offset commit that never ran.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely, from the same uncommitted offset', correct: true },
          { label: 'No, the broker itself remembers it was already handled' },
          { label: 'Only if the consumer explicitly asks for it' },
        ],
        explain: (
          <>
            Yes. The offset never committed, so it redelivers.
          </>
        ),
      },
      Visual: S.CrashPredict,
    },
    {
      title: 'Measured: the crash genuinely left the offset uncommitted, and the next real poll genuinely redelivered the identical message',
      body: (
        <>
          The real, measured redelivery, from the same offset.
        </>
      ),
      duration: 3.0,
      Visual: S.CrashReveal,
    },
    {
      title: 'That redelivered message now hits the side effect a second time. Does a naive consumer genuinely apply it twice?',
      body: (
        <>
          The same side effect, hit a second real time.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, the broker genuinely dedupes it for the consumer' },
          { label: 'Yes, genuinely; the side effect itself has no memory of its own', correct: true },
          { label: 'Only if the amount happens to be the same' },
        ],
        explain: (
          <>
            Yes, genuinely. Nothing stops it on its own.
          </>
        ),
      },
      Visual: S.DupPredict,
    },
    {
      title: 'Measured: a naive consumer genuinely applied the real side effect twice, and the real ledger balance is genuinely wrong because of it',
      body: (
        <>
          The real, measured overcount, from one real redelivery.
        </>
      ),
      duration: 3.0,
      takeaway: 'A naive consumer, with no memory of its own, can double-apply a real side effect.',
      Visual: S.DupReveal,
    },
    {
      title: "Now the consumer checks a real idempotency key, the producer's own id plus its sequence number, before applying anything. Does that genuinely remove the duplicate effect?",
      body: (
        <>
          The same crash, the same redelivery, a real key this time.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes, genuinely; the duplicate effect is genuinely gone', correct: true },
          { label: 'No, the key only helps the producer, never the consumer' },
          { label: 'Only if the consumer also uses transactions' },
        ],
        explain: (
          <>
            Yes, genuinely. The key is what the consumer was missing.
          </>
        ),
      },
      Visual: S.FixPredict,
    },
    {
      title: "Measured: the real idempotency key genuinely removed the duplicate's own visible effect; the real ledger balance is genuinely exact",
      body: (
        <>
          The real, measured, exact balance, after the same crash.
        </>
      ),
      duration: 3.0,
      takeaway: 'A real idempotency key removes a duplicate effect; it never removes the redelivery that carries it.',
      Visual: S.FixReveal,
    },
    {
      title: 'The redelivery itself is still genuinely happening, every time. Does only the effect disappear, or does the redelivery disappear too?',
      body: (
        <>
          The redelivery count, next to the applied-effect count.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Both genuinely disappear together' },
          { label: 'Only the effect disappears; the redelivery itself genuinely still happens', correct: true },
          { label: 'The broker genuinely stops redelivering once a key repeats' },
        ],
        explain: (
          <>
            Only the effect. The redelivery itself keeps happening.
          </>
        ),
      },
      Visual: S.StillRedeliversPredict,
    },
    {
      title: "Measured: the redelivery itself genuinely still happened; only the duplicate's own effect was genuinely removed",
      body: (
        <>
          The real, measured redelivery, next to the real effect count.
        </>
      ),
      duration: 3.0,
      takeaway: 'An idempotency key is a filter on effects, never a filter on whether a message arrives again.',
      Visual: S.StillRedeliversReveal,
    },
    {
      title: "Confluent's own documentation and the Kafka project's own design document both state this exact mechanism directly: the broker assigns each producer a real id, and deduplicates by a real sequence number sent with every message. Does this topic's own code measure exactly that rule?",
      body: (
        <>
          Both sources' own words on this exact rule, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a real crash, a real idempotency key',
      body: (
        <>
          At-least-once delivery genuinely redelivers a message whose own effect may have already run; a real idempotency key removes that duplicate's own effect without ever stopping the redelivery itself.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
