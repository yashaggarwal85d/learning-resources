import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// An idempotency key's own scope, TTL, stored response, and conflict check
// are four genuinely separate real rules, and together they are what lets
// a client safely retry a request it cannot otherwise prove ever arrived.
const reel: Reel = {
  steps: [
    {
      title: "Two different resources each get a request carrying the identical idempotency key string. Does a real key's own scope keep them from colliding?",
      body: (
        <>
          Two resources, one identical key string.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: "Yes, genuinely; scope is part of the key's own real identity", correct: true },
          { label: "No, the second resource's request is genuinely rejected" },
          { label: 'Only if an operator configures it that way' },
        ],
        explain: (
          <>
            Yes. Scope is genuinely part of the key.
          </>
        ),
      },
      Visual: S.ScopePredict,
    },
    {
      title: "Measured: both resources genuinely ran their own real side effect, and each one's own stored response is genuinely distinct",
      body: (
        <>
          The real, measured, distinct results, one per resource.
        </>
      ),
      duration: 3.0,
      Visual: S.ScopeReveal,
    },
    {
      title: 'Now a duplicate request arrives, carrying the identical key, well within its own real TTL. Does it genuinely replay the stored response, or does it run the side effect again?',
      body: (
        <>
          The same key, a duplicate, still inside the TTL.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It genuinely runs the side effect again, just to be safe' },
          { label: 'It genuinely replays the exact stored response', correct: true },
          { label: 'It depends on how much time has passed' },
        ],
        explain: (
          <>
            It replays. The side effect never runs again.
          </>
        ),
      },
      Visual: S.ReplayPredict,
    },
    {
      title: 'Measured: the duplicate genuinely replayed the exact stored response, and the real side effect genuinely never ran a second time',
      body: (
        <>
          The real, measured replay, from the stored response.
        </>
      ),
      duration: 3.0,
      takeaway: 'An idempotency key buys a client exactly one thing: a safe retry that never runs the real side effect twice.',
      Visual: S.ReplayReveal,
    },
    {
      title: 'Now a second request, carrying the identical key, arrives while the first one is still genuinely running. Is that genuinely caught, or does it race the first one into running the side effect twice?',
      body: (
        <>
          Two requests, the identical key, close together.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'It genuinely races, and the side effect genuinely runs twice' },
          { label: 'It is genuinely caught as a conflict, before either one runs it twice', correct: true },
          { label: 'The second request genuinely waits forever' },
        ],
        explain: (
          <>
            It's genuinely caught. Only one request ever wins.
          </>
        ),
      },
      Visual: S.RacePredict,
    },
    {
      title: 'Measured: the genuine race was genuinely caught; the real side effect ran exactly once, not twice',
      body: (
        <>
          The real, measured conflict, from a genuine race.
        </>
      ),
      duration: 3.0,
      takeaway: 'Two requests racing for the identical key never both get to run the side effect; one of them always loses.',
      Visual: S.RaceReveal,
    },
    {
      title: "Once the key's own real TTL genuinely expires, is the identical key genuinely treated as brand new?",
      body: (
        <>
          The same key, now past its own TTL.
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'No, an expired key is genuinely rejected outright' },
          { label: 'Yes, genuinely; the real side effect genuinely runs again', correct: true },
          { label: 'Only if the client asks for a new key' },
        ],
        explain: (
          <>
            Yes, genuinely. An expired key is genuinely free again.
          </>
        ),
      },
      Visual: S.TtlPredict,
    },
    {
      title: 'Measured: the genuinely expired key was genuinely treated as new, and the real side effect genuinely ran again',
      body: (
        <>
          The real, measured rerun, once the TTL genuinely passed.
        </>
      ),
      duration: 3.0,
      takeaway: 'A TTL exists so a key is never held forever; it genuinely frees the key, not just the stored response.',
      Visual: S.TtlReveal,
    },
    {
      title: "Stripe's own API reference and the IETF's own Idempotency-Key header draft both state this exact mechanism directly: a completed retry replays the stored response, and a genuinely concurrent one gets a real conflict instead. Does this topic's own code measure exactly that rule?",
      body: (
        <>
          Both sources' own words on this exact rule, shown directly.
        </>
      ),
      duration: 2.8,
      Visual: S.DocsReveal,
    },
    {
      title: 'Recap: a real idempotency-key store, measured end to end',
      body: (
        <>
          An idempotency key's own scope, TTL, stored response, and conflict check are four genuinely separate real rules, and together they are what lets a client safely retry a request it cannot otherwise prove ever arrived.
        </>
      ),
      duration: 3.0,
      Visual: S.Recap,
    },
  ],
};

export default reel;
