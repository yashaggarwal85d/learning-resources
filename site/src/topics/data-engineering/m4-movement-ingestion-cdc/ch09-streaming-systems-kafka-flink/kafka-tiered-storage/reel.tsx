import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Real results from this topic's own examples.py: a toy segment-placement simulation, a toy
// local-vs-remote read-cost comparison, and a toy compacted-topic rejection check. No literal
// digits anywhere below (duration numbers are exempt); the real values are shown in scenes.tsx.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: two years of history, at a fraction of the bill',
      body: (
        <>
          A compliance team wants years of retained events, and the broker-disk bill for keeping
          them is absurd. Moving closed segments to object storage keeps the same history
          readable, for far less.
        </>
      ),
      duration: 4.8,
      fig: 'a cost bar collapsing once the tiered region replaces most of the local-disk region',
      Visual: S.Hook,
    },
    {
      title: 'Setup: a boundary drawn across the strip',
      body: (
        <>
          The same partition strip, with a boundary partway along it. Segments past the boundary
          sit in object storage. Segments before it still sit on the broker's own disk.
        </>
      ),
      duration: 4.8,
      fig: 'the partition strip with a boundary: older segments remote, newer segments local',
      Visual: S.Setup,
    },
    {
      title: 'Predict: does the copy wait for local retention?',
      body: (
        <>
          A segment just rolled closed. Does copying it to object storage wait until local
          retention is about to expire, or does the copy start right away?
        </>
      ),
      duration: 2.8,
      fig: 'a segment just rolled — does the copy wait for local retention, or start now?',
      predict: {
        options: [
          { label: 'It waits until local retention is about to expire' },
          { label: 'It starts the moment the segment rolls closed', correct: true },
          { label: "It only copies once a consumer actually requests that segment" },
        ],
        explain: (
          <>
            It starts immediately. A dedicated component checks for freshly closed segments and
            copies them without waiting on any retention clock at all.
          </>
        ),
      },
      Visual: S.PredictCopyTiming,
    },
    {
      title: 'Reveal: the copy starts the moment the segment rolls',
      body: (
        <>
          Copying and local deletion are two separate events on two separate clocks. The copy
          starts as soon as a segment closes; the local copy is deleted only afterward, once local
          retention expires.
        </>
      ),
      duration: 4.8,
      fig: 'the copy starts the moment the segment rolls, not when local retention expires',
      Visual: S.RevealCopyTiming,
    },
    {
      title: 'Predict: can a read tell local from remote?',
      body: (
        <>
          A consumer asks for an old offset the usual way. Can it tell, from the API alone,
          whether that data is still on local disk or already living in object storage?
        </>
      ),
      duration: 2.8,
      fig: "a consumer asks for an old offset — can it tell local from remote by the API alone?",
      predict: {
        options: [
          { label: 'No — the fetch call is identical either way', correct: true },
          { label: 'Yes — a remote read needs a separate, explicit call' },
          { label: 'Only if the consumer asks for the segment by name' },
        ],
        explain: (
          <>
            No, the fetch request looks exactly the same. The broker decides where the bytes live
            and serves them either way; only the time the read takes gives it away.
          </>
        ),
      },
      Visual: S.PredictColdRead,
    },
    {
      title: 'Reveal: transparent, but not free',
      body: (
        <>
          A real toy comparison: fetching a still-local offset is fast. Fetching an offset that's
          already remote-only takes far longer, measured directly, for the exact same kind of
          request.
        </>
      ),
      duration: 4.8,
      fig: 'the same fetch call either way — only the measured latency gives away which tier answered',
      takeaway: 'A cold read uses the same API as any other read — it just costs far more time, measured directly.',
      Visual: S.RevealColdRead,
    },
    {
      title: 'Reveal: two retention knobs, not one',
      body: (
        <>
          Local retention bounds how long a segment's copy stays on the broker's own disk after
          tiering. Total retention bounds how long the data exists anywhere at all. They're set
          independently.
        </>
      ),
      duration: 4.8,
      fig: 'local retention and total retention, two independent knobs where there used to be one',
      takeaway: "Local retention and total retention are two separate settings — shrinking one doesn't shrink how long the data survives.",
      Visual: S.RevealTwoRetentions,
    },
    {
      title: "Reveal: why a compacted topic can't be tiered",
      body: (
        <>
          A tiered segment's remote copy is written once and assumed fixed from then on.
          Compaction rewrites a log's segments in place by key — directly breaking that
          assumption, which is why the two features don't mix.
        </>
      ),
      duration: 4.8,
      fig: "a compacted topic can't be tiered — compaction rewrites segments the remote copy assumes are fixed",
      takeaway: "Tiering assumes a segment never changes once copied; compaction's whole job is rewriting segments, so the two can't coexist.",
      Visual: S.RevealNoCompaction,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Every figure in this reel so far came from a real run of this topic's own toy tiered-
          storage model, just now — segment placement, a read-cost comparison, and the
          compacted-topic rejection.
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
          Closed segments move to object storage the moment they roll, on their own clock. Local
          and total retention are independent. Reads stay transparent, but a cold one costs real
          time. Compaction and tiering don't mix.
        </>
      ),
      duration: 4.8,
      fig: 'closed segments tier automatically, two independent retention knobs, reads stay transparent but not free',
      Visual: S.Recap,
    },
  ],
};

export default reel;
