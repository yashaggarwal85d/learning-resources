import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real measurements on this sandbox's own client against a real local flaky HTTP server
// (examples.py): a client-side timeout against a real slow vs. fast endpoint; a shared
// deadline propagated through a three-hop call chain, with the last hop skipping work once
// the deadline has already passed; capped exponential backoff with full jitter against a
// server that fails a fixed number of times; a disclosed simulation (matching the source
// article's own simulated method) contrasting a hundred synchronized clients' retry times
// with and without jitter; a real token-bucket retry budget against an always-failing
// server; a real circuit breaker (closed/open/half-open) measurably failing in microseconds
// once open; and an idempotency key deduplicated against a real server-side effect counter.
// No literal digits anywhere.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: a pool decides how many connections exist — what happens when one fails?',
      body: (
        <>
          The last topic pooled the connection and decided how many of them a service is
          allowed to hold open at once. It said nothing about what happens when one of those
          connections' calls actually fails. What does?
        </>
      ),
      duration: 4.8,
      fig: 'a pool decides how many connections exist — what happens when one of its calls fails?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: connection timeout, measured',
      body: (
        <>
          The same client, calling two endpoints on the same timeout: one that takes far
          longer than the timeout to respond, and one that answers quickly. Measured directly,
          the slow call gives up right around the configured timeout, and the fast call
          returns well under it — the one thing standing between a stuck call and a client
          that holds its resources forever.
        </>
      ),
      duration: 4.8,
      fig: 'a slow endpoint vs. a fast one, called through the same client timeout — measured directly',
      Visual: S.RevealTimeout,
    },
    {
      title: 'Reveal: deadline propagation through a call chain',
      body: (
        <>
          One shared deadline, handed down three hops. The first two hops run and use up most
          of the time budget. The third hop checks how much time is actually left before it
          starts, sees the deadline has already passed, and skips the work entirely.
        </>
      ),
      duration: 4.8,
      fig: 'one shared deadline, handed down three hops — does the last hop still do the work?',
      takeaway: 'A shared deadline lets the last hop in a chain refuse work nobody will ever collect.',
      Visual: S.RevealDeadlinePropagation,
    },
    {
      title: 'Predict: does adding randomness to a backoff actually help, or just add noise?',
      body: (
        <>
          Capped exponential backoff already slows every client down after a failure, and the
          wait grows with each attempt. Does adding randomness on top of that actually help
          any more, or is it just noise on a problem backoff already solved?
        </>
      ),
      duration: 2.8,
      fig: 'capped exponential backoff already spreads retries out — does adding randomness actually help more?',
      predict: {
        options: [
          { label: 'No — capped exponential backoff on its own already prevents clients bunching up' },
          { label: 'Yes — capped backoff alone still produces clusters of correlated retries', correct: true },
        ],
        explain: (
          <>
            Yes. Capped exponential backoff slows every client down by the same schedule, so
            they still end up retrying in lockstep. Measured directly, adding randomness is
            what actually breaks that cluster apart.
          </>
        ),
      },
      Visual: S.PredictJitter,
    },
    {
      title: 'Reveal: backoff with jitter, measured and simulated side by side',
      body: (
        <>
          A real client, retrying against a real server that fails a fixed number of times,
          backing off with randomness bounded by a cap. Separately, a hundred clients that all
          fail at the same instant: without randomness they retry at the same moment every
          time; with it, those same hundred retries spread out measurably.
        </>
      ),
      duration: 4.8,
      fig: 'a real client backing off with jitter, and a hundred synchronized clients with and without it',
      takeaway: "Jitter isn't cosmetic randomness — it's the one change that actually spreads retries out, measured directly.",
      Visual: S.RevealJitter,
    },
    {
      title: 'Reveal: a retry budget, enforced directly',
      body: (
        <>
          A fixed number of retry tokens, spent one per attempt against a server that never
          recovers. Once the tokens run out, the client stops calling entirely and fails fast
          instead — and the server's own call count matches that budget exactly, not the
          number of times the client would otherwise have tried.
        </>
      ),
      duration: 4.8,
      fig: 'a fixed number of retry tokens against a server that never recovers — what happens once they run out?',
      takeaway: "A retry budget caps how selfish a client is allowed to be, confirmed by the server's own call count.",
      Visual: S.RevealRetryBudget,
    },
    {
      title: 'Reveal: a circuit breaker fails fast',
      body: (
        <>
          The same failing call, wrapped by the same breaker, before and after it trips. While
          closed, every failing call still pays its full timeout. Once open, the very next
          call fails in microseconds — the breaker never touches the network at all.
        </>
      ),
      duration: 4.8,
      fig: 'the same failing call, before and after the breaker trips open — measured elapsed time',
      takeaway: "An open circuit breaker doesn't fail faster by luck — it stops calling the dependency at all.",
      Visual: S.RevealCircuitBreaker,
    },
    {
      title: 'Reveal: an idempotency key, deduplicated for real',
      body: (
        <>
          The identical write, sent three times with the same idempotency key, as if a client
          retried after never seeing the first response. The server's own effect counter — not
          just the responses — shows exactly one real effect. A different key, or no key at
          all, produces a new effect every time.
        </>
      ),
      duration: 4.8,
      fig: 'the identical write, sent three times with one key — one server-side effect, or three?',
      takeaway: "An idempotency key isn't a promise — it's a real, measured dedup check against the server's own effect count.",
      Visual: S.RevealIdempotency,
    },
    {
      title: 'Recap',
      body: (
        <>
          A timeout bounds how long a call can hold a client's resources; a shared deadline
          lets a later hop skip work the caller has already given up on. Capped backoff alone
          still clusters; jitter is what measurably spreads it out. A retry budget caps a
          client's total retries, and a circuit breaker stops calling a struggling dependency
          at all once it trips — two different fixes for two different problems. And an
          idempotency key turns a retried write into exactly one real effect, confirmed against
          the server's own count.
        </>
      ),
      duration: 4.8,
      fig: 'a measured timeout, a shared deadline, jitter that actually spreads retries, a budget, a breaker, and one real effect',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A client retries a payment call after a dropped response. It sets no idempotency
          key, and each hop in its call chain resets its own fresh deadline instead of sharing
          one. The payment is charged twice, and a slow dependency keeps consuming resources
          long after the original caller gave up. What's actually wrong, and what's the fix?
        </>
      ),
      duration: 2.8,
      fig: 'a retried payment with no idempotency key and a reset deadline at every hop — what breaks, and why?',
      predict: {
        options: [
          { label: 'Nothing is really wrong — retries are always safe for a payment call' },
          { label: 'The missing idempotency key lets the retry double-charge, and the reset deadlines let later hops keep working past the point the caller already gave up; fix both: a shared key and a propagated deadline', correct: true },
        ],
        explain: (
          <>
            Both failures are real and separate. Without an idempotency key, a retried write
            isn't deduplicated, so it charges twice. Without a shared, propagated deadline,
            each hop invents its own timeout and keeps working even after the original caller
            has already given up — exactly the two mechanisms this topic measured directly.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
