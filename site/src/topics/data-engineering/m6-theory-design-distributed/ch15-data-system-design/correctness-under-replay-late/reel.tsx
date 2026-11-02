import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The replay-determinism and correction-window simulations are asserted in examples.py's own
// replay_is_trustworthy(), size_correction_window() and late_event_with_correction_window(). The
// four-questions framing and the versioned-outputs mechanism trace to the Dataflow Model paper
// and Apache Iceberg's own branching documentation, quoted verbatim in SOURCES.md and checked
// step by step in FACT-CHECK.md. No literal digits appear below; the duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the same re-run disagrees with itself",
      body: (
        <>
          The shop's nightly job is re-run to fix a bug. Last Tuesday's revenue figure changes by
          a small fraction. Nobody touched the data, and the bug fix itself is correct. So what
          else made two runs over the same input disagree?
        </>
      ),
      duration: 4.8,
      fig: 'two runs, same input, same fix — what still made the two answers come out different?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which hidden non-determinism caused the disagreement?',
      body: (
        <>
          The input is confirmed identical across both runs. Something in the pipeline's own
          logic depended on more than just that input. What was it?
        </>
      ),
      duration: 2.8,
      fig: 'the input never changed — so what, hidden inside the pipeline itself, did?',
      predict: {
        options: [
          { label: 'The bug fix itself must have silently changed some upstream data too' },
          { label: "One of wall-clock time, input ordering, or an unseeded random sample was baked into the pipeline's own logic", correct: true },
        ],
        explain: (
          <>
            The two runs are confirmed to share identical input, so a silent data change isn't
            consistent with what's actually known here. Something inside the transform itself —
            reading the current time, depending on the order rows happened to arrive in, or
            sampling without a fixed seed — is what made two runs over the same input disagree.
          </>
        ),
      },
      Visual: S.Predict1,
    },
    {
      title: 'Reveal: deterministic transforms and idempotent writes',
      body: (
        <>
          A deterministic transform produces its output from its input alone — nothing else. An
          idempotent write is keyed so that writing it twice has no further effect beyond writing
          it once. Together, these two properties are what make a re-run actually trustworthy.
        </>
      ),
      duration: 4.8,
      fig: 'same input every time, and a write that can safely repeat — what do these two properties actually buy?',
      Visual: S.RevealDeterministicIdempotent,
    },
    {
      title: 'Reveal: the same pipeline, replayed twice',
      body: (
        <>
          Replay a deterministic, idempotent pipeline twice, and the two output bars land
          identical. Replay a pipeline with a hidden clock read buried in its logic, and the
          second bar lands somewhere different — the gap between them is the bug, made visible.
        </>
      ),
      duration: 4.8,
      fig: 'two replays, side by side — does the fixed pipeline actually land the same bar twice?',
      takeaway: "Deterministic and idempotent together make a re-run trustworthy — either one alone isn't enough.",
      Visual: S.RevealReplayedTwice,
    },
    {
      title: 'Reveal: the watermark and late events',
      body: (
        <>
          A watermark is a moving line asserting that input is complete up to this point in time.
          It's a heuristic, not a guarantee — events that show up behind that line are, by
          definition, late, and the pipeline has to decide what happens to them.
        </>
      ),
      duration: 4.8,
      fig: 'a line asserting completeness — what happens to the events that still arrive behind it?',
      Visual: S.RevealWatermarkLateEvents,
    },
    {
      title: 'Reveal: the correction window amends, instead of dropping or corrupting',
      body: (
        <>
          A late event with no correction window simply vanishes — dropped, lost for good. The
          same late event, inside a correction window, instead amends the already-published
          result, carrying a new version tag rather than silently overwriting the old one.
        </>
      ),
      duration: 4.8,
      fig: 'the same late event, two outcomes — does it vanish, or does it amend what was already published?',
      takeaway: 'A correction window amends a published result instead of dropping it or silently corrupting it.',
      Visual: S.RevealCorrectionWindow,
    },
    {
      title: 'Reveal: sizing the window from the late-data rate',
      body: (
        <>
          A stated, measured late-data rate decides how wide the correction window actually needs
          to be. That width isn't a free safety margin — it's a real cost, paid in state held
          longer and in how often a consumer sees a published number move under them.
        </>
      ),
      duration: 4.8,
      fig: 'a measured late-data rate, feeding into a window width — what does a wider window actually cost?',
      Visual: S.RevealWindowSizing,
    },
    {
      title: 'Reveal: versioned outputs',
      body: (
        <>
          Every published result carries the version of the logic and the data cut-off that
          produced it. A correction appends a new version rather than overwriting the last one, so
          a consumer can pin a version, and an auditor can reconstruct exactly what was reported.
        </>
      ),
      duration: 4.8,
      fig: 'each correction appends a new version — what does that actually let a consumer, or an auditor, do?',
      takeaway: 'A versioned output lets a consumer pin a version and an auditor reconstruct what was reported, and when.',
      Visual: S.RevealVersionedOutputs,
    },
    {
      title: 'Recap',
      body: (
        <>
          Deterministic transforms and idempotent writes make a replay actually trustworthy. The
          watermark names what's late; a correction window amends rather than drops it. And
          versioned outputs tie it together, letting anyone pin or reconstruct what was reported.
        </>
      ),
      duration: 4.8,
      fig: 'trustworthy replay, a correction path for late data, and versioned outputs tying both together',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The same pipeline also sends an email receipt as a side effect. Does making the
          pipeline itself deterministic and idempotent also make that email safe to send again on
          a replay?
        </>
      ),
      duration: 2.8,
      fig: 'the pipeline is now safe to replay — does that safety reach all the way out to the email it sends?',
      predict: {
        options: [
          {
            label: "No — idempotence at the pipeline's own write layer doesn't make an external side effect idempotent on its own; it needs its own dedup key",
            correct: true,
          },
          { label: "Yes — if the pipeline's own output is deterministic and idempotent, anything downstream inherits that safety automatically" },
        ],
        explain: (
          <>
            The pipeline did real work making its own write path safe to repeat, but an email
            system living outside that write path was never protected by it. Without its own
            deduplication key, a replay simply sends the same receipt again — the fix has to live
            at the side effect itself, not be assumed from the pipeline's own correctness.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
