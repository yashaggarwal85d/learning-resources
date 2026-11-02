import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The late-event simulation and estimate sheet are asserted in examples.py's
// own sessionize(), streaming_count(), batch_reconciled_count(),
// idempotent_upsert() and estimate_sheet(). The session-window and
// allowed-lateness claims trace to Flink's own docs, the dual-logic-drift
// cost to Kreps's post, both quoted in SOURCES.md and checked step by step
// in FACT-CHECK.md. No literal digits appear below; the duration numbers
// are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: two correct pipelines, one billing gap",
      body: (
        <>
          An ad partner is paid per click. The streaming dashboard says one count for
          yesterday's clicks. Finance's reconciled batch says a larger count, and the invoice
          goes out on the larger one. Neither pipeline has a bug.
        </>
      ),
      duration: 5.0,
      fig: "two correct click counts, a small gap, one number billed",
      Visual: S.Hook,
    },
    {
      title: "Predict: which cause explains the gap, and which side is right?",
      body: (
        <>
          Late events, duplicates, and bot filtering are all real failure modes this design has
          to handle. Only one of them points toward a streaming count that comes out *smaller*
          than the batch recount. Which one?
        </>
      ),
      duration: 4.4,
      predict: {
        options: [
          { label: "duplicates inflate the streaming count, so the smaller batch number is right" },
          {
            label: "events arriving after the stream's correction window closes land in the log but miss the stream's result, so the larger batch recount is right",
            correct: true,
          },
        ],
        explain: (
          <>
            A duplicate would push the streaming count *up*, not down — so it can't explain a
            streaming number that's smaller. A late event, by contrast, lands in the log but
            never reaches a window that already fired, which is exactly the direction of this
            gap.
          </>
        ),
      },
      fig: "which cause points the right direction for this specific gap?",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the pipeline strip and its alternatives",
      body: (
        <>
          A client SDK batches and retries events, each carrying an id. A stateless collector,
          scaled by Little's law, hands off to a durable log. A lake landing zone and a
          warehouse sit behind it, with dashboards on top. Each hop carries its own decision
          card.
        </>
      ),
      duration: 4.8,
      fig: "sdk, collector, log, lake, warehouse, dashboards, each with a decision card",
      Visual: S.RevealPipelineStrip,
    },
    {
      title: "Reveal: a session is a gap, not a clock",
      body: (
        <>
          A session closes when activity stops for a stated gap, not at a fixed clock boundary.
          Bot traffic gets flagged by a classifier with a real false-positive cost either way —
          wrongly calling a person a bot, or wrongly letting a bot through.
        </>
      ),
      duration: 4.4,
      takeaway: "A session is defined by a gap in activity, not by a fixed clock window.",
      fig: "a run of events grouped by an inactivity gap; a bot run flagged",
      Visual: S.RevealSessionGap,
    },
    {
      title: "Reveal: the correction window and the late-event sliver",
      body: (
        <>
          The correctness boundary sits right after the log. A late event lands there — but if
          it arrives after the stream's window has already fired its result, it's dropped from
          that result by default, unless the design explicitly allows for lateness.
        </>
      ),
      duration: 5.0,
      fig: "a dashed boundary after the log; a late dot landing after the window fires",
      Visual: S.RevealLateEventSliver,
    },
    {
      title: "Reveal: the stream is for speed, the batch is for record",
      body: (
        <>
          The streaming path does idempotent upserts, keyed by a deterministic id, for a fast,
          approximately right count. A scheduled batch job recomputes the same count from the
          immutable log and overrides the streaming figure for anything billed.
        </>
      ),
      duration: 4.8,
      takeaway: "The stream is for speed; the reconciled batch is the number of record.",
      fig: "idempotent upserts on one side, a scheduled batch recount overriding the billed column",
      Visual: S.RevealStreamVsBatch,
    },
    {
      title: "Reveal: two paths cost something — dual-logic drift",
      body: (
        <>
          The same transformation now exists twice: once in the stream engine, once in the
          batch engine. The moment only one copy gets updated, a drift gap opens between them —
          a real, ongoing cost, not a bug waiting to be fixed for good.
        </>
      ),
      duration: 4.6,
      takeaway: "Running two logic paths costs something: drift, budgeted for, not eliminated.",
      fig: "the same logic duplicated; a drift gap opening after only one copy updates",
      Visual: S.RevealDualLogicDrift,
    },
    {
      title: "Reveal: the estimate, the cost lever, and the failure table",
      body: (
        <>
          The estimate sheet runs peak rate, daily bytes, and replicated storage through the
          shop's own constants. The dominant cost lever is almost certainly the lake scan volume
          or the log's cross-region replication traffic. The failure table names what breaks and
          how far the blast radius reaches.
        </>
      ),
      duration: 4.8,
      fig: "the estimate sheet, the dominant cost lever, and the failure table side by side",
      Visual: S.RevealEstimateFailure,
    },
    {
      title: "Recap",
      body: (
        <>
          Six hops, three alternatives apiece. A session is a gap, not a clock; bot filtering
          costs either way. A late event misses a window that already fired. The stream is for
          speed, the batch is the number of record. And two logic paths cost drift, budgeted
          for, never fully eliminated.
        </>
      ),
      duration: 4.6,
      fig: "the strip, the session-gap and late-event reveals, the stream-batch override, and drift",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a second dispute, a different cause",
      body: (
        <>
          A different ad partner's count disagrees again. This time, a client retry storm
          produced a duplicate burst. The stream's idempotent keying absorbed it cleanly, but a
          batch recount run before the dedup window closed briefly double-counted it. Same
          symptom, different cause.
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "assume the cause is the same as last time — late events — since that's the design's known failure mode" },
          {
            label: "diagnose this specific gap on its own terms, since the same symptom can have a different cause",
            correct: true,
          },
        ],
        explain: (
          <>
            A count disagreeing is a symptom, not a diagnosis. Last time it was a late-event
            sliver; this time it's a timing collision between a retry storm and the batch
            recount's own dedup window. Assuming the prior cause would have pointed the fix at
            the wrong hop entirely.
          </>
        ),
      },
      fig: "a new dispute; a duplicate burst this time, not a late event",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
