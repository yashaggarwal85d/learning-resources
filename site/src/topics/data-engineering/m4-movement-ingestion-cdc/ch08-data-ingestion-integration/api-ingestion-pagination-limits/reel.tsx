import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py: a mock, in-process paginated
// API with a page size of five over a list of thirty rows, mutated by one insert or one delete
// between every page fetch. Offset pagination, run this way, both re-reads and skips real rows; a
// keyset cursor eliminates the re-reads but still misses a row deleted before it is ever read. A
// token-bucket limiter with five tokens and a refill of two per second, driven to exhaustion by
// forty calls, wastes close to the minimum number of calls when the client obeys its own
// retry-after and far more when it guesses with a short fixed delay. A twelve-client contention
// simulation, run with both fixed exponential backoff and full jitter across five random seeds,
// finishes with roughly half the total requests and a third of the time under jitter. A payment
// capture retried three times with the same idempotency key records exactly one charge. Two
// workers racing to refresh the identical, now-stale OAuth token: one succeeds, one is locked
// out, until a shared lock serializes the two attempts.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          An offset-paged nightly pull over a list that keeps growing underneath it. Real rows
          get duplicated. Other real rows never show up at all, counted directly against the
          source.
        </>
      ),
      duration: 4.8,
      fig: 'an offset-paged pull over a growing list: rows duplicated, rows missing, counted directly.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what a keyset cursor fixes',
      body: (
        <>
          A keyset cursor pages the identical list under the identical writes, naming the last
          row seen instead of a position. Which of the two problems does switching to it actually
          fix?
        </>
      ),
      duration: 2.8,
      fig: 'the identical writes, read by a cursor instead of an offset. Which problem does it fix?',
      predict: {
        options: [
          { label: 'Both — a keyset cursor eliminates every duplicate and every missing row' },
          { label: 'Only the duplicates — a row deleted before the cursor reaches it is still gone', correct: true },
        ],
        explain: (
          <>
            A cursor named on identity is never shifted by an insert, which is exactly what
            eliminates the duplicate re-reads. But a row deleted before the cursor ever reaches
            it leaves nothing behind to find — the identical blind spot a hard delete leaves for
            any cursor at all.
          </>
        ),
      },
      Visual: S.PredictKeysetFix,
    },
    {
      title: 'Reveal: offset pagination, measured',
      body: (
        <>
          Run directly against the mock: an insert at the head shifts every later row down one
          place, so the next fetch re-reads a row already seen. A delete inside the already-read
          region shifts rows up one place, so the next fetch skips a row it never gets to.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: an insert re-reads a row; a delete skips a row that never gets read.',
      Visual: S.RevealOffsetMeasured,
    },
    {
      title: 'Reveal: keyset cursor, measured',
      body: (
        <>
          The identical mutation pattern, read by a cursor instead: the insert no longer shifts
          anything the cursor has already consumed, and the duplicate re-reads disappear
          completely. The one row deleted before the cursor gets to it is still missed.
        </>
      ),
      duration: 4.8,
      fig: 'the identical writes, read by a cursor: no duplicates, one unread row still missed.',
      takeaway: "A cursor on identity isn't shifted by an insert — a row deleted before it's read is still gone.",
      Visual: S.RevealKeysetMeasured,
    },
    {
      title: 'Reveal: the token bucket',
      body: (
        <>
          A limiter with a bucket per client: one token removed per request, refilled at a fixed
          rate. An empty bucket doesn't just fail — it answers with exactly when a token will
          exist again.
        </>
      ),
      duration: 4.8,
      fig: 'a token-bucket limiter: tokens refill at a fixed rate; empty means a numbered status and a wait time.',
      Visual: S.RevealTokenBucket,
    },
    {
      title: 'Reveal: obeying the wait time, measured',
      body: (
        <>
          A client that waits exactly as long as it's told makes close to the fewest calls
          mathematically possible. A client that guesses with a short fixed delay instead wastes
          many more calls, asking again and again before any token exists.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: obeying the wait time wastes close to the minimum; guessing wastes far more.',
      takeaway: 'The wait time names exactly when a token exists again — a short fixed guess wastes calls asking too soon.',
      Visual: S.RevealRetryAfterMeasured,
    },
    {
      title: 'Reveal: many clients, one resource',
      body: (
        <>
          Many clients competing for one resource that admits one winner per round. Every round's
          losers back off before trying again — the real question is whether they all back off to
          the same rhythm.
        </>
      ),
      duration: 4.8,
      fig: 'many clients competing for one resource, every round; losers back off before the next try.',
      Visual: S.RevealContention,
    },
    {
      title: 'Reveal: jitter, measured',
      body: (
        <>
          Fixed backoff with no randomness keeps every client in lockstep, clustering their
          retries at the same instants round after round. Adding randomness to that same backoff
          spreads the retries apart and finishes with roughly half the total requests.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: fixed backoff clusters every retry together; randomized backoff spreads them out.',
      takeaway: "Fixed backoff keeps every client in lockstep — randomizing it spreads retries out and costs measurably less.",
      Visual: S.RevealJitterMeasured,
    },
    {
      title: 'Reveal: idempotency keys',
      body: (
        <>
          A client-generated key, attached to a write, lets a retry return the exact first result
          instead of doing the write again. The documented limit is generous — long enough for a
          UUID and then some.
        </>
      ),
      duration: 4.8,
      fig: "a client-generated key attached to a write; a retry with the same key replays the first response.",
      Visual: S.RevealIdempotencyKey,
    },
    {
      title: 'Reveal: idempotency key, measured',
      body: (
        <>
          The identical write, retried three separate times with the same key: exactly one
          charge is ever recorded, and every one of the three responses comes back identical.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: three retried attempts, one key, one charge recorded, every response identical.',
      takeaway: 'An idempotency key makes a retried write as safe as a retried read — one charge, no matter the retries.',
      Visual: S.RevealIdempotencyMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Four fixes, each measured for real: a keyset cursor for pagination, honoring the wait
          time for rate limits, randomized backoff for contention, an idempotency key for a
          retried write. None of them touches what happens when the access token itself runs out
          mid-pull, or when the client's own secret gets rotated — which is why a secret rotation
          needs two valid secrets accepted at once, never a hard cutover.
        </>
      ),
      duration: 5.6,
      fig: 'four fixes, each measured. A secret rotation needs an overlap, never a hard cutover.',
      takeaway: 'Four separate fixes for four separate failures — a long pull outliving its access token is a fifth, still open.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Two workers, splitting one long pull, both hold the same refresh token and both try to
          refresh it at the exact same moment. What happens to the second one?
        </>
      ),
      duration: 2.8,
      fig: 'two workers hold the same refresh token and race to refresh it at once. What happens?',
      predict: {
        options: [
          { label: "Both succeed — they're asking the authorization server for the identical thing" },
          { label: 'One succeeds; the other is locked out with an invalid-grant error, unless a shared lock serializes them', correct: true },
        ],
        explain: (
          <>
            The authorization server is free to rotate the refresh token on a successful refresh,
            which invalidates the one the client was just holding. The second worker's identical
            token is now stale the instant the first worker's request succeeds — a shared lock,
            not a retry, is what actually fixes it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
