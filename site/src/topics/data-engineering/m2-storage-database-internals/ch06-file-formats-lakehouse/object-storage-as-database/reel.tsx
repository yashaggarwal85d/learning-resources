import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every claim here is verified against a real local S3-compatible HTTP server (moto's
// ThreadedMotoServer) and real boto3 requests over real HTTP, not simulated Python calls. A
// conditional create (If-None-Match: *) commits once and rejects a conflicting second attempt
// with a real 412 Precondition Failed; If-Match does the same compare-and-swap for updates
// against a stale ETag. A "rename" stopped after CopyObject but before DeleteObject leaves both
// the original and the copy existing at once -- no atomicity between the two calls. A paginated
// LIST of 250 objects at 50 objects per page takes exactly 5 real round trips. The December 2020
// strong-consistency change and the August/November 2024 conditional-write primitives are AWS's
// own dated announcements.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A single immutable file, Parquet or ORC, still can't answer what "a table" means once
          the storage underneath is an object store with no file you can edit in place.
        </>
      ),
      duration: 4.4,
      fig: "object storage underneath Parquet and ORC: no file you can edit in place, ever.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does a read right after a write ever see stale data?',
      body: (
        <>
          Write an object to S3, then immediately read it back. Does that read see the new
          object, or can it still see stale data for a while?
        </>
      ),
      duration: 3.6,
      fig: 'a write, then an immediate read of the same object — does it see the new data right away?',
      predict: {
        options: [
          { label: 'It always sees the new object — no wait, no stale read', correct: true },
          { label: 'It can still see stale data for a short window' },
        ],
        explain: (
          <>
            S3 has delivered strong read-after-write consistency for every request since December
            2020 — before that, it was only eventually consistent.
          </>
        ),
      },
      Visual: S.PredictConsistency,
    },
    {
      title: 'Reveal: strong consistency, since December 2020',
      body: (
        <>
          Before that change, S3 was eventually consistent — a read right after a write could
          still see stale data. Since then, any read after a successful write response sees it
          immediately, every time.
        </>
      ),
      duration: 4.4,
      fig: 'eventually consistent before December 2020 against strongly consistent since.',
      Visual: S.RevealConsistency,
    },
    {
      title: 'Reveal: no atomic rename, demonstrated for real',
      body: (
        <>
          A "rename" on object storage is really two separate requests: copy, then delete.
          Stopped right after the copy against a real local server, both the original and the
          copy exist at once.
        </>
      ),
      duration: 4.6,
      fig: "a real copy_object call, stopped before the matching delete_object — both objects really exist.",
      takeaway: "A rename that's copy-then-delete has no atomicity — a crash in between leaves both objects behind.",
      Visual: S.RevealNoAtomicRename,
    },
    {
      title: 'Predict: can two writers racing for the same key both win?',
      body: (
        <>
          Writer A and writer B both try to create the same key at nearly the same instant, with
          no external lock service. Can they both succeed?
        </>
      ),
      duration: 3.6,
      fig: 'two writers racing to create the same object key, with no coordinator between them.',
      predict: {
        options: [
          { label: 'No — a conditional header makes object storage itself pick exactly one winner', correct: true },
          { label: 'Yes — whichever write lands last on disk just overwrites the other' },
        ],
        explain: (
          <>
            Without a conditional header, that's exactly what happens — the last write silently
            wins. A conditional header changes that by making the server check first.
          </>
        ),
      },
      Visual: S.PredictRace,
    },
    {
      title: 'Reveal: a real conditional write actually rejects the loser',
      body: (
        <>
          Writer A's create, with If-None-Match set to the wildcard, succeeds. Writer B's
          conflicting create, same header, against the same real server, is rejected with a real
          412 Precondition Failed.
        </>
      ),
      duration: 4.6,
      fig: 'two real PUT requests with If-None-Match against the same key: one commits, one gets a real 412.',
      Visual: S.RevealConditionalCreate,
    },
    {
      title: 'Reveal: If-Match is the same primitive for updates',
      body: (
        <>
          A write with If-Match set to the object's current ETag is a real compare-and-swap. The
          same write, using the now-stale ETag from before an update landed, is rejected the same
          way.
        </>
      ),
      duration: 4.6,
      fig: 'a real update against the current ETag succeeds; the same write against a stale ETag gets rejected.',
      takeaway: 'If-Match turns an update into a real compare-and-swap — a stale ETag is rejected exactly like a conflicting create.',
      Visual: S.RevealConditionalUpdate,
    },
    {
      title: "Reveal: LIST isn't free",
      body: (
        <>
          A real paginated listing of 250 objects at 50 objects per page takes 5 separate round
          trips, not one — and per-prefix request-rate limits cap how many of those a second any
          single prefix can sustain.
        </>
      ),
      duration: 4.4,
      fig: 'a real paginated LIST call: 250 objects, 50 per page, 5 real HTTP round trips.',
      Visual: S.RevealListCost,
    },
    {
      title: 'Reveal: what conditional writes actually buy',
      body: (
        <>
          Without a conditional header, two writers racing for the same key end with whichever
          write landed last — silently. With If-None-Match or If-Match, exactly one commit
          survives, with no external coordination service at all.
        </>
      ),
      duration: 4.6,
      fig: "last-write-wins without a conditional header, against exactly-one-commit-survives with one.",
      takeaway: 'Conditional writes are an atomic compare-and-swap built into object storage itself — no external lock service required.',
      Visual: S.RevealWhatThisBuys,
    },
    {
      title: 'Recap',
      body: (
        <>
          Strongly consistent reads since 2020 — no atomic rename ever, and conditional writes as
          the one real commit primitive object storage actually offers.
        </>
      ),
      duration: 4.8,
      fig: "object storage isn't a database — conditional writes are its one commit primitive.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
