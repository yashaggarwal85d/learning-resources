import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The source-interview simulation is asserted in examples.py's own
// run_interview(), unanswerable(), estimate_inputs(), shape_decision() and
// correctness_plan(). The ODCS and Stripe webhook claims trace to SOURCES.md's
// six quotes across three sources, checked step by step in FACT-CHECK.md. No
// literal digits appear below; the duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a partner says real time; three weeks later, three cracks",
      body: (
        <>
          A payments partner says its events "arrive in real time." Three weeks after launch,
          the pipeline double-counts revenue on every partner retry, silently drops events during
          the partner's hourly maintenance window, and breaks when the partner renames a field
          with a day's notice.
        </>
      ),
      duration: 5.0,
      fig: "'real time' next to three cracks, each dated",
      Visual: S.Hook,
    },
    {
      title: "Predict: which five questions would have caught each crack?",
      body: (
        <>
          Each crack traces back to something nobody asked in the first meeting. A better
          diagram of the partner's system wouldn't have surfaced any of the three. What would?
        </>
      ),
      duration: 4.4,
      predict: {
        options: [
          { label: "ask for a more detailed architecture diagram of the partner's system" },
          {
            label: "ask whether they resend, what happens when they're down, and who owns the schema and gives notice",
            correct: true,
          },
        ],
        explain: (
          <>
            A diagram describes what the partner built, not how it behaves under retry, outage,
            or change. The three cracks are exactly the three questions a diagram can't answer:
            does a retry carry a fresh id, what happens during their maintenance window, and who
            tells you before a field changes.
          </>
        ),
      },
      fig: "which of these questions would have caught each crack?",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: a source box and its question cards",
      body: (
        <>
          A source sits on the left; a stack of question cards sits on the right. Each card
          flips to show the design decision its answer changes — "do you ever resend?" lands on
          the dedup box, "what happens when you're down?" lands on the buffer.
        </>
      ),
      duration: 4.8,
      fig: "question cards flipping, each landing on the box it feeds",
      Visual: S.RevealQuestionCards,
    },
    {
      title: "Reveal: a measurement beats an adjective",
      body: (
        <>
          "Real time" is an adjective — it says nothing about how fast, measured how, or how
          often it slips. A stated delay, measured at a stated percentile over a stated window,
          is a number the design can actually plan around.
        </>
      ),
      duration: 4.4,
      takeaway: "A measurement beats an adjective, every time one is available.",
      fig: "'real time' crossed out, replaced by a measured number",
      Visual: S.RevealMeasurementVsAdjective,
    },
    {
      title: "Reveal: origin, format, schema ownership and evolution",
      body: (
        <>
          Who owns this data and the right to change it? What format does it arrive in? A
          contract that states its own status and version fields turns "how much notice do I
          get" into a checkable answer instead of a promise.
        </>
      ),
      duration: 5.0,
      fig: "the schema's owner named; status and version shown as checkable fields",
      Visual: S.RevealSchemaOwnership,
    },
    {
      title: "Reveal: an event id beats a timestamp for dedup",
      body: (
        <>
          Late, duplicate, lost, resent — the four facts a design plans for. A resend doesn't
          always carry a fresh id, and two distinct events can share the same timestamp, so the
          dedup key has to be the id, never the clock.
        </>
      ),
      duration: 4.8,
      takeaway: "A resend without an event id to key on is a duplicate waiting to happen.",
      fig: "a resend landing on the dedup box, keyed by id, not timestamp",
      Visual: S.RevealDeliveryReliability,
    },
    {
      title: "Reveal: rate, growth, protocol, and quota",
      body: (
        <>
          Average rate, peak rate, and how fast volume has grown feed the estimate directly.
          Protocol, auth, and rate limit feed the connection — and a quota is a hard ceiling the
          design has to respect, not a number to discover in production.
        </>
      ),
      duration: 4.8,
      fig: "rate and growth feeding the estimate; protocol and quota feeding the client",
      Visual: S.RevealVolumeProtocol,
    },
    {
      title: "Reveal: the question that exposes a hidden constraint",
      body: (
        <>
          Two cards flip red: "what's your daily quota" and "where must this data stay." The
          partner can't answer either — and an unanswerable question is itself the answer: plan
          for the constraint, don't assume it away.
        </>
      ),
      duration: 4.6,
      takeaway: "A quota is a hidden ceiling until someone asks for the number.",
      fig: "a quota card and a residency card both flipping red",
      Visual: S.RevealHiddenConstraint,
    },
    {
      title: "Recap",
      body: (
        <>
          Resend and downtime questions feed the dedup box and the buffer. Ownership and notice
          feed the contract. Rate and growth feed the estimate. And a quota or residency
          question that comes back unanswered is itself a red flag worth designing around.
        </>
      ),
      duration: 4.6,
      fig: "every question card landing on the box its answer feeds",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a second partner, two unanswered questions",
      body: (
        <>
          A different partner answers thirteen of the fifteen questions with real numbers. Two
          come back red — unanswerable. Does the design skip those two, or plan for them anyway?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "proceed as if the two unanswered questions don't apply, since the partner didn't raise them" },
          {
            label: "record both as explicit unknowns and design for the worst case each question was asking about",
            correct: true,
          },
        ],
        explain: (
          <>
            An unanswered question is an unknown, not a guarantee that nothing bad happens there.
            The design has to carry both as explicit risks — the same way the payments partner's
            own unasked questions became three cracks three weeks after launch.
          </>
        ),
      },
      fig: "thirteen answers measured; two flipped red as explicit unknowns",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
