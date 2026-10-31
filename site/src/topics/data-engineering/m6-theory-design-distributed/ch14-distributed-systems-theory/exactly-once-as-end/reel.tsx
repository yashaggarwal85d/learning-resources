import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// examples.py: a retry-after-lost-acknowledgement scenario run twice, with and without an
// idempotency key, showing the charge count the difference actually produces; an atomic
// offset-plus-output commit contrasted with the same commit split into two steps; duplicate
// delivery run an arbitrary extra number of times against an idempotent write; and an
// idempotency-key fix shown not to protect a second, non-idempotent side effect in the same
// pipeline. No literal digits anywhere (duration numbers exempt).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a timeout, a retry, and a card charged twice',
      body: (
        <>
          The shop's payment service times out waiting for the card processor and retries. The
          first request had, in fact, already succeeded. The customer is charged twice. The
          platform team calls their pipeline "exactly-once."
        </>
      ),
      duration: 4.8,
      fig: "a payment request succeeds but its acknowledgement is lost, the client retries believing it failed, and the customer is charged twice by a pipeline the platform calls exactly-once",
      Visual: S.Hook,
    },
    {
      title: "Predict: does the broker cover this, does it need a key, or only a lock?",
      body: (
        <>
          Is the platform's "exactly-once" pipeline actually wrong here, or does its guarantee
          simply not reach this failure? Which single value, sent along with the retry, would have
          made the retry harmless?
        </>
      ),
      duration: 2.8,
      fig: "is the pipeline's exactly-once guarantee broken here, or does it simply not cover this failure — and what single value, sent with the retry, would make the retry harmless?",
      predict: {
        options: [
          { label: "The broker's exactly-once already covers this; the real bug is the retry logic itself" },
          { label: 'The retry needs an idempotency key sent alongside it, so the processor can recognize the second attempt as the same charge', correct: true },
        ],
        explain: (
          <>
            An idempotency key is what makes the retry harmless. The pipeline's internal
            exactly-once, whatever it covers, has no say over a request the client sends to an
            external card processor — that boundary needs its own fix.
          </>
        ),
      },
      Visual: S.PredictFix,
    },
    {
      title: 'Reveal: the end-to-end argument',
      body: (
        <>
          A function that must be correct for the application can be completely and correctly
          implemented only with the knowledge and help of the application at the endpoints. A
          lower layer's reliability feature can only ever be a performance optimisation on top of
          that — never a replacement for it.
        </>
      ),
      duration: 4.8,
      fig: "a function correct only with the application's own knowledge can be completely implemented only at the endpoints; a lower layer's reliability feature is at best a performance optimisation, never a substitute",
      Visual: S.RevealE2E,
    },
    {
      title: 'Reveal: at-least-once is the best a lossy link offers',
      body: (
        <>
          On a link that can drop messages, the only way to make sure one arrives is to retry —
          and a retry sent after a lost acknowledgement delivers the message twice. At-most-once is
          the other choice: never retry, and risk losing it instead. There is no third option.
        </>
      ),
      duration: 4.8,
      fig: "on a lossy link, the only way to be sure a message arrives is to retry, which risks a duplicate; at-most-once is the choice not to retry, which risks losing it instead — there is no third option",
      Visual: S.RevealAtLeastOnce,
    },
    {
      title: "Reveal: the shop's charge, twice without a key, once with one",
      body: (
        <>
          Run the hook's exact retry again. Without a key, the processor has no way to tell the
          retry from a second, legitimate charge, and applies both. With the same key sent on both
          attempts, the processor recognizes the second as a repeat and quietly does nothing.
        </>
      ),
      duration: 4.8,
      fig: "the identical retry run twice: without an idempotency key the processor applies both requests; with the same key on both, the processor recognizes the second as a repeat and does nothing",
      Visual: S.RevealShopCharge,
    },
    {
      title: 'Reveal: exactly-once as an effect, not a delivery guarantee',
      body: (
        <>
          Delivery stays at-least-once the whole time — nothing about the link changed. What
          changed is that applying the message twice now has the same effect as applying it once.
          That combination is what "exactly-once" actually names.
        </>
      ),
      duration: 4.8,
      fig: "delivery is still at-least-once throughout; what changes is that applying the message twice now has the same effect as applying it once, which is what exactly-once actually names",
      takeaway: "Exactly-once is at-least-once delivery plus an idempotent write, not a stronger kind of delivery.",
      Visual: S.RevealEffect,
    },
    {
      title: 'Reveal: making consume, produce and record-the-offset one atomic unit',
      body: (
        <>
          Kafka's transactions commit a producer's output records and the consumer's offsets
          together, as one atomic unit, so a crash between them is impossible by construction.
          Flink's two-phase-commit sink pre-commits an external write at each checkpoint and only
          commits it once the checkpoint itself succeeds — the same shape, for a different system.
        </>
      ),
      duration: 5.2,
      fig: "Kafka transactions commit output records and consumer offsets together as one atomic unit; Flink's two-phase-commit sink pre-commits an external write at each checkpoint and commits it only once the checkpoint succeeds",
      takeaway: "An atomic offset-plus-output commit removes the crash window a separate record-then-recover step would otherwise leave open.",
      Visual: S.RevealAtomicCommit,
    },
    {
      title: 'Reveal: where the pipeline stops being able to help',
      body: (
        <>
          A table-format commit, an atomic swap of one pointer, is the third version of the same
          idea — placed here, already taught as this chapter's compare-and-swap. But none of these
          three reach an email already sent or a card already charged outside the pipeline's own
          transaction; an effect that leaves the system cannot be rolled back from inside it.
        </>
      ),
      duration: 4.8,
      fig: "a table-format commit is the third atomic-commit route; but none of the three reach an effect that has already left the system, such as a sent email or a charge made outside the pipeline's own transaction",
      Visual: S.RevealBoundary,
    },
    {
      title: 'Recap',
      body: (
        <>
          Delivery is at-least-once at best. Exactly-once is that delivery plus an idempotent
          write, not a different kind of delivery. An atomic offset-plus-output commit closes the
          crash window inside the pipeline. Outside it, at an external side effect, the pipeline's
          own guarantee simply does not reach.
        </>
      ),
      duration: 4.8,
      fig: "delivery is at-least-once at best; exactly-once is that delivery plus an idempotent write; an atomic offset-plus-output commit closes the crash window inside the pipeline, but not at an external side effect outside it",
      takeaway: "Exactly-once is assembled, not delivered: at-least-once, an idempotent write, and an atomic commit, each doing one job.",
      Visual: S.Recap,
    },
    {
      title: "Prove it: an idempotency key is added everywhere — is retrying now always safe?",
      body: (
        <>
          A team adds an idempotency key to every write in their pipeline and declares every retry
          now safe, everywhere, without exception. Is that true, or is there still a side effect an
          idempotency key alone cannot protect?
        </>
      ),
      duration: 3,
      fig: "a team adds an idempotency key to every write and declares every retry safe everywhere — is that true, or is there still a side effect an idempotency key alone can't protect?",
      predict: {
        options: [
          { label: "Not quite — an idempotency key only helps where the receiving system itself checks it, and an effect like a sent email, checked by nothing, still fires on every retry", correct: true },
          { label: 'Yes — once every write carries an idempotency key, retrying any step of the pipeline is safe by construction' },
        ],
        explain: (
          <>
            An idempotency key protects a write only where something on the receiving end actually
            deduplicates by it. A confirmation email sent by the same retried request, with no
            deduplication on the email side, still goes out twice — the key never touched that
            effect at all.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
