import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The three-baseline comparison (EWMA catching a step but adapting into a
// slow drift, a seasonal profile staying quiet on a learned normal ramp,
// a fixed control limit catching the step), the per-series state sizing,
// and the backtest precision are asserted in examples.py's own
// ewma_flags(), seasonal_flags(), spc_flags(), per_series_state_bytes()
// and backtest_precision(). The NIST claims trace to its own handbook,
// quoted in SOURCES.md and checked step by step in FACT-CHECK.md. No
// literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a false alarm ignored, a real fault missed",
      body: (
        <>
          A detector flags a coating-thickness reading far from its baseline; the supervisor
          stops the line. It was the normal ramp after a changeover. Over the next week it fires
          the same way repeatedly and supervisors stop acting on it. Then a slow drift, the one
          fault that mattered, adapts into the baseline and never fires.
        </>
      ),
      duration: 5.0,
      fig: "a false-alarm badge on a normal ramp, repeated until ignored, then a slow drift sliding unflagged under its own baseline",
      Visual: S.Hook,
    },
    {
      title: "Predict: what did the design get wrong, in both directions?",
      body: (
        <>
          What did the design get wrong in both directions, and what would a backtest have shown
          before go-live?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "the detector's threshold was simply set too tight, so loosening it fixes both problems" },
          {
            label: "the baseline adapted into the drift it should have flagged, and the ramp needed suppression, not a looser number",
            correct: true,
          },
        ],
        explain: (
          <>
            A looser threshold on the same rule still fires on the ramp or still misses the
            drift. The real problem is which baseline suits which failure shape, and whether the
            ramp needed suppression rather than a detector at all.
          </>
        ),
      },
      fig: "a looser threshold fixes neither; suppressing the ramp and fixing the baseline does",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: a dashboard and a detector, two different consumers",
      body: (
        <>
          A line-quality dashboard aggregates over a window, tolerant of seconds to a minute. A
          detector flags a measurement drifting out of spec as it arrives, where the latency and
          the cost of a false alarm versus a missed one are set by what the operator actually
          does on a flag.
        </>
      ),
      duration: 4.8,
      fig: "the same event stream splitting into a windowed aggregate path and a low-latency per-event path",
      Visual: S.RevealDashboardDetector,
    },
    {
      title: "Reveal: three baseline families, three failure modes",
      body: (
        <>
          An exponentially weighted average discounts old data incrementally; seasonal
          decomposition accounts for shift, day and week patterns; control-chart rules apply
          fixed limits and run rules. Each is cheap enough to update per event, and each fails
          its own way.
        </>
      ),
      duration: 5.0,
      takeaway: "Each baseline family is cheap to update per event, and each fails exactly where its own assumption breaks.",
      fig: "three baseline bands over the same series, one adapting into the drift, one needing history it doesn't have, one assuming a steady process",
      Visual: S.RevealBaselineFamilies,
    },
    {
      title: "Reveal: sizing state at high cardinality",
      body: (
        <>
          Every series needs its own baseline state, kept in the stream engine's own keyed state.
          Churn is handled by state TTL, with a cold-start policy of no alarms until a series has
          enough history, or a borrowed baseline from a similar machine.
        </>
      ),
      duration: 4.8,
      takeaway: "A series with no history can't be trusted to alarm; a cold-start policy keeps it quiet until it earns one.",
      fig: "a per-series state block for every series, a new one starting empty and quiet until it has enough history",
      Visual: S.RevealStateSizing,
    },
    {
      title: "Reveal: deduplication, grouping and suppression",
      body: (
        <>
          Repeated firings of one condition collapse into one alert with a duration. Alerts from
          series that share a cause group under the asset hierarchy's own grouping key. Planned
          changeovers and maintenance suppress what would otherwise fire as a false alarm.
        </>
      ),
      duration: 4.8,
      takeaway: "Grouping by shared cause turns a flood of per-series alerts into one alert an operator can actually act on.",
      fig: "a flood of per-series alerts collapsing into one grouped alert, a changeover window shaded out entirely",
      Visual: S.RevealDedupGrouping,
    },
    {
      title: "Reveal: alert precision as the detector's own metric",
      body: (
        <>
          The detector is measured by its own precision and by the share of its alerts that
          operators actually act on, because a detector nobody trusts anymore is worse than no
          detector at all.
        </>
      ),
      duration: 4.6,
      fig: "a precision gauge tracked against a target, alongside the share of alerts operators actually acted on",
      Visual: S.RevealPrecisionMetric,
    },
    {
      title: "Reveal: backtesting on history, with a time-split",
      body: (
        <>
          Before a detector goes live, replay it over history and score it against labelled past
          incidents — what it would have flagged, how early, how many false alarms — tuning
          thresholds on one period and testing on a later one.
        </>
      ),
      duration: 4.8,
      takeaway: "A backtest with a clean time-split shows a detector's own failure before go-live, not after a week of ignored alarms.",
      fig: "thresholds tuned on an early period, then scored against labelled incidents on a later, untouched period",
      Visual: S.RevealBacktest,
    },
    {
      title: "Recap",
      body: (
        <>
          A dashboard and a detector, each with its own need. Three baselines, each with its own
          failure mode. Per-series state, sized and cold-started. Alerts deduplicated, grouped
          and suppressed. Precision as the detector's own metric. A backtest before go-live.
        </>
      ),
      duration: 4.8,
      fig: "the dashboard-and-detector split, the three baselines, the sized state, the grouping design, precision, and the backtest, side by side",
      Visual: S.Recap,
    },
    {
      title: "Prove it: ten times the series",
      body: (
        <>
          The series count grows tenfold. What's the next bottleneck?
        </>
      ),
      duration: 4.0,
      predict: {
        options: [
          { label: "the baselines themselves get less accurate, since more series means less history per series" },
          {
            label: "the per-series state's own memory footprint and churn-driven cold-start rate both grow with the series count",
            correct: true,
          },
        ],
        explain: (
          <>
            Each series keeps its own independent state, computed only from that series' own
            history, so a higher series count doesn't thin out any one series's own data. The
            memory footprint and the cold-start rate are what actually grow.
          </>
        ),
      },
      fig: "each baseline staying just as accurate while the per-series state's own memory and churn climb with the series count",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
