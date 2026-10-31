import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The chain-p99-versus-sum-of-p99s simulation, the feature-state-size
// estimate, and the fallback cost comparison are asserted in examples.py's
// own chain_p99_from_samples(), sum_of_hop_p99s(), feature_state_size_bytes()
// and fallback_cost(). The Flink and Redis claims trace to their own docs,
// quoted in SOURCES.md and checked step by step in FACT-CHECK.md. No
// literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the average looked fine, the p99 ate the budget",
      body: (
        <>
          The fraud model's average score time sits comfortably inside the checkout's budget. The
          checkout's actual p99 blows right past the timeout. The fallback on timeout is
          "approve" — and the fraud loss the model was bought to prevent concentrates in exactly
          those payments.
        </>
      ),
      duration: 5.0,
      fig: "an average bar safely inside budget, a p99 bar overflowing it, fraud caught by the fallback",
      Visual: S.Hook,
    },
    {
      title: "Predict: where did the p99 actually go?",
      body: (
        <>
          The average was never the number that mattered. Where did the p99 actually go, and what
          should the fallback have been?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "the model itself is too slow on average, so a faster model fixes it" },
          {
            label: "one hop's own tail dominates the chain, and the fallback needs to be a recorded decision weighing its error costs",
            correct: true,
          },
        ],
        explain: (
          <>
            The average was already comfortable, so a faster model attacks the wrong number. The
            real problem lives in one hop's own tail, and the fallback deserves a recorded
            decision, not a default.
          </>
        ),
      },
      fig: "a slower model fixes nothing; the tail and the fallback decision are the real levers",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the pipeline strip and its correctness boundary",
      body: (
        <>
          An event arrives, streaming features update incrementally, the request path looks
          those features up, a model scores them, a decision returns. A boundary separates the
          stream job's eventually-consistent features from the request path's read of whatever
          the store holds right now.
        </>
      ),
      duration: 4.8,
      fig: "event to decision, left to right, with a boundary line between updated-soon and read-now",
      Visual: S.RevealPipelineStrip,
    },
    {
      title: "Reveal: the latency budget, built at p99, hop by hop",
      body: (
        <>
          A hundred-millisecond budget splits across hops — network in, feature lookup, model
          inference, rules, network out — each measured at its own p99, not its average. One
          hop's own tail overflows its share.
        </>
      ),
      duration: 5.0,
      takeaway: "A budget built from averages hides exactly the hop that blows the deadline; it has to be built at p99.",
      fig: "a budget bar split by hop, each with a measured p99 against its share, one overflowing in red",
      Visual: S.RevealLatencyBudget,
    },
    {
      title: "Reveal: why the chain's p99 isn't the sum of the hops' p99s",
      body: (
        <>
          Adding up every hop's own p99 gives a ceiling the design can plan against. The chain's
          own measured p99 sits below that ceiling, because the hops' latencies aren't
          independent of each other.
        </>
      ),
      duration: 4.8,
      fig: "the summed ceiling drawn above the chain's own measured p99, with the gap between them named",
      Visual: S.RevealChainP99,
    },
    {
      title: "Reveal: sizing the streaming-feature state",
      body: (
        <>
          Per-card windowed aggregates get sized by card count and window length, kept in the
          stream engine's own keyed state and mirrored into the online store the request path
          reads. Past a point, that state stops fitting in memory alone.
        </>
      ),
      duration: 4.8,
      fig: "a state-size bar growing with window length, crossing the line where memory alone no longer holds it",
      Visual: S.RevealStateSize,
    },
    {
      title: "Reveal: the fallback as a recorded business decision",
      body: (
        <>
          Three fallback options on timeout — approve, decline, route to a slower path — each
          carries its own error cost: a false approve against a false decline. The choice gets
          decided and recorded as an ADR, not defaulted to whichever is easiest to code.
        </>
      ),
      duration: 5.0,
      takeaway: "A timeout fallback is a business decision with a recorded cost, not whichever branch happens to be easiest to implement.",
      fig: "three fallback cards, each priced by its own error cost, one chosen and recorded",
      Visual: S.RevealFallbackADR,
    },
    {
      title: "Reveal: score-time logging and replay for retraining",
      body: (
        <>
          The exact features and decision live at scoring time get written to a log. Weeks later,
          when a chargeback label finally arrives, that logged record — not today's feature
          values — is what trains the next model.
        </>
      ),
      duration: 4.8,
      takeaway: "Logging the features and decision live at scoring time lets a late label train on what the model actually saw.",
      fig: "a scoring-time log entry, untouched for weeks, then joined to a late-arriving label for training",
      Visual: S.RevealScoreTimeLog,
    },
    {
      title: "Recap",
      body: (
        <>
          A latency budget built at p99, hop by hop. A chain p99 that sits below the summed
          ceiling. Streaming-feature state sized against memory's own limit. A fallback recorded
          as a business decision. And a scoring-time log that makes later training honest.
        </>
      ),
      duration: 4.8,
      fig: "the budget table, the chain-versus-sum comparison, the sized state, the fallback ADR, and the log",
      Visual: S.Recap,
    },
    {
      title: "Prove it: ten times the payments",
      body: (
        <>
          The payment rate grows tenfold. The per-hop p99s barely move, but the feature-state size
          and the online store's own load both grow with it. What's the next bottleneck?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "raise the timeout, since more payments means more time is needed" },
          {
            label: "the next bottleneck is the state size and the online store's own load, not the timeout itself",
            correct: true,
          },
        ],
        explain: (
          <>
            Raising the timeout doesn't fix a hop that's genuinely slow — it just makes checkout
            wait longer before reaching the same fallback. The real next bottleneck is the
            feature-state size and the load on the store that holds it.
          </>
        ),
      },
      fig: "per-hop p99s barely moving while the state size and store load climb with the payment rate",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
