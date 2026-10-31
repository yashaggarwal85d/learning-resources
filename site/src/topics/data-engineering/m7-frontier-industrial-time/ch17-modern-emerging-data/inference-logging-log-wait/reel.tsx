import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows (the join's zero mismatches, the storage estimate, the
// re-identification rate) is measured for real in examples.py against this sandbox's own
// Postgres cluster.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A fraud model's offline evaluation and its logged, served vectors for the same
          requests disagree on about one feature in twenty. Nobody can find the bug by reading
          either code path.
        </>
      ),
      duration: 2.6,
      fig: 'one feature in twenty disagrees. Both code paths look correct.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what logging buys you',
      body: (
        <>
          What does logging the served vector let you do that reading the code can't?
        </>
      ),
      duration: 2.4,
      fig: 'reading the code again, or diffing two logged numbers?',
      predict: {
        options: [
          { label: 'Reading the code more carefully — the disagreement must be a subtle logic error' },
          { label: 'Logging the served vector — now two concrete numbers to diff, not two implementations to audit', correct: true },
        ],
        explain: (
          <>
            Logging turns "which code path is right" from a code-reading problem into a
            data-diffing problem. Once both numbers are recorded, finding where they disagree
            needs no theory about why.
          </>
        ),
      },
      Visual: S.PredictWhatLoggingBuys,
    },
    {
      title: 'Reveal: the logging mechanism',
      body: (
        <>
          A log point sits after the transformation, not before it: it records the exact
          feature vector, the model version, a request id and the serving timestamp.
        </>
      ),
      duration: 4.2,
      fig: 'a log point after the transformation, not before it.',
      Visual: S.RevealLoggingMechanism,
    },
    {
      title: 'Reveal: log-and-wait, the join',
      body: (
        <>
          Weeks later, a label arrives. Join it to the logged vector by request id — no
          recomputation, no second code path.
        </>
      ),
      duration: 4.2,
      fig: 'a label arrives later. Join by request id.',
      takeaway: "This training set can't have a different-code-path skew. There's no second code path — there's one logged number, reused.",
      Visual: S.RevealLogAndWaitJoin,
    },
    {
      title: 'Reveal: shadow vs. canary, placed',
      body: (
        <>
          A shadow lane logs the same way as the live lane but never reaches the decision. A
          canary lane logs the same way and does reach it, for a share of traffic.
        </>
      ),
      duration: 4.2,
      fig: 'both log the same way. One reaches the decision.',
      takeaway: 'Shadow and canary log exactly the same way. The difference is only whether the decision box gets to act.',
      Visual: S.RevealShadowVsCanary,
    },
    {
      title: 'Predict: storage cost',
      body: (
        <>
          One million requests a day. Each logged vector is two kilobytes. How much storage
          does a year of logging actually cost?
        </>
      ),
      duration: 2.4,
      fig: 'a million requests a day. A year of logs costs what?',
      predict: {
        options: [
          { label: 'A few megabytes — logs compress well' },
          { label: 'On the order of a terabyte a year — small vectors, a lot of requests', correct: true },
        ],
        explain: (
          <>
            A feature vector is small, but production request volume isn't. The real cost is a
            multiplication, not any one vector's size.
          </>
        ),
      },
      Visual: S.PredictStorageCost,
    },
    {
      title: 'Reveal: storage cost, measured',
      body: (
        <>
          Rate, times width, times retention — measured from the stated numbers, not guessed.
        </>
      ),
      duration: 4.2,
      fig: 'rate times width times retention, measured.',
      takeaway: "Nobody budgets logging by one vector's size. They budget it by rate times width times retention.",
      Visual: S.RevealStorageMeasured,
    },
    {
      title: 'Reveal: PII and retention',
      body: (
        <>
          The customer id is redacted. Is the vector safe to log now? Measured directly: the
          remaining fields still combine to identify almost every row.
        </>
      ),
      duration: 4.2,
      fig: 'id redacted. The rest still describes one person.',
      takeaway: "Redacting the obvious field isn't the same as making the payload safe. The vector still describes one person.",
      Visual: S.RevealPiiRetention,
    },
    {
      title: 'Recap',
      body: (
        <>
          Log the exact vector. Join it to the label once it arrives. Know what the log costs
          and what it exposes.
        </>
      ),
      duration: 4.5,
      fig: 'log the vector. Join the label. Know the cost and the exposure.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team logs every served vector in full, at full sample rate, forever, with no
          retention policy.
        </>
      ),
      duration: 2.6,
      fig: 'everything, forever, no retention policy. Safe?',
      predict: {
        options: [
          { label: 'The safest possible setup — more data is always better for training' },
          { label: 'A liability waiting to surface — unlimited retention of a possibly re-identifying payload', correct: true },
        ],
        explain: (
          <>
            "Log everything, forever" treats the log as exempt from the rules the rest of the
            platform follows. It isn't, and the exposure compounds the longer nobody revisits
            it.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
