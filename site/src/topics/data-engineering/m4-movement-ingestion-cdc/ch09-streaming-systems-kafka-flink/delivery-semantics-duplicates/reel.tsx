import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy producer-retry duplication model, a toy
// consumer-crash reprocessing model, and a toy effect-count table across a crash. No literal
// digits anywhere below (duration numbers are exempt); the real values are shown in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: two engineers, one argument, two unnamed crash windows',
      body: (
        <>
          Two engineers argue whether their pipeline is "exactly-once." Neither can say which of
          two crash windows they've actually closed. A live toy run shows both producing real
          duplicates.
        </>
      ),
      duration: 4.8,
      fig: 'two parallel mini-timelines, one per crash window, each marked by a lightning-bolt crash icon',
      Visual: S.Hook,
    },
    {
      title: 'Setup: a promise about the effect, not the attempt',
      body: (
        <>
          Three semantics, stated precisely: how many times the delivered effect actually lands,
          not how many times the system merely tries to deliver it.
        </>
      ),
      duration: 4.8,
      fig: 'three semantics, stated as promises about the effect, not the delivery attempt',
      Visual: S.Setup,
    },
    {
      title: 'Predict: ack lost, what happens on the producer side?',
      body: (
        <>
          A batch is sent, the broker commits it, but the ack never makes it back. What does the
          producer do next, without idempotence turned on?
        </>
      ),
      duration: 2.8,
      fig: 'a batch is sent, the broker commits it, the ack is lost on the way back',
      predict: {
        options: [
          { label: 'It waits for a second attempt from the broker itself' },
          { label: 'It retries, and without idempotence the retry can duplicate the write', correct: true },
          { label: 'It drops the batch rather than risk a duplicate' },
        ],
        explain: (
          <>
            It retries, having no way to know the first attempt actually succeeded. Without
            idempotence, that retry writes a second copy of an already-committed message.
          </>
        ),
      },
      Visual: S.PredictProducerRetry,
    },
    {
      title: 'Reveal: a retry, blind to what already happened',
      body: (
        <>
          Seeing no ack, the producer retries exactly as if the first attempt failed. Without
          idempotence, the broker has no way to recognize the retry as a repeat.
        </>
      ),
      duration: 4.8,
      fig: 'seeing no ack, the producer retries — without idempotence, the retry duplicates the write',
      Visual: S.RevealProducerRetry,
    },
    {
      title: 'Predict: crash before commit, what happens on restart?',
      body: (
        <>
          A consumer processes a record, writes its effect downstream, then crashes before
          committing its offset. What does the next process see when it takes over?
        </>
      ),
      duration: 2.8,
      fig: 'a consumer processes a record, writes its effect, and crashes before committing its offset',
      predict: {
        options: [
          { label: "It resumes past the processed record, since its effect already landed" },
          { label: 'It resumes from the old offset and reprocesses the same record', correct: true },
          { label: 'It replays the entire topic from the beginning' },
        ],
        explain: (
          <>
            It resumes from the last saved offset, which is still the old one. The record gets
            processed a second time, duplicating its downstream effect unless that effect is
            itself idempotent.
          </>
        ),
      },
      Visual: S.PredictConsumerCrash,
    },
    {
      title: 'Reveal: the same record, twice',
      body: (
        <>
          On restart, the consumer starts from the offset it last actually saved. The record it
          already processed gets processed again, and its effect lands downstream a second time.
        </>
      ),
      duration: 4.8,
      fig: 'on restart, the consumer starts from the old offset and reprocesses the same record',
      takeaway: 'Both crash windows share one shape: a gap between doing the work and recording it, with a crash landing inside.',
      Visual: S.RevealConsumerCrash,
    },
    {
      title: "Reveal: the broker's claim stops at the sink's door",
      body: (
        <>
          "My broker is exactly-once" names no boundary. A sink that isn't idempotent or
          transactional turns the broker's own at-least-once delivery straight back into duplicate
          effects.
        </>
      ),
      duration: 4.8,
      fig: "the broker's own guarantee stops at the sink's own door",
      takeaway: "Exactly-once is a claim about one specific boundary, not a broker alone — a non-idempotent sink breaks it regardless.",
      Visual: S.RevealIncompleteClaim,
    },
    {
      title: 'Reveal: the same crash, three different counts',
      body: (
        <>
          Run the identical crash through each semantics: at-most-once can drop the effect to
          zero, at-least-once can double it, and exactly-once holds it at exactly one either way.
        </>
      ),
      duration: 4.8,
      fig: 'the same crash, counted three different ways depending on which semantics applied',
      takeaway: 'The same crash produces zero, two, or exactly one copy of an effect, purely depending on which semantics applied.',
      Visual: S.RevealEffectCount,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy delivery-
          semantics model, just now — both crash windows, and the effect-count comparison.
        </>
      ),
      duration: 4.8,
      fig: "this topic's own real run, every number read straight off it",
      Visual: S.ProveIt,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three semantics, each a promise about the effect's count. Two crash windows, producer
          and consumer, sharing one shape. And "exactly-once" names a boundary — never a broker
          alone.
        </>
      ),
      duration: 4.8,
      fig: 'three semantics, two crash windows, and why exactly-once names a boundary, not a broker feature',
      Visual: S.Recap,
    },
  ],
};

export default reel;
