import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A synthetic fleet of twenty sensors with four planted fault types, caught
// by a windowed-variance flatline check, a range check, a MAD-based spike
// detector and a change-point detector, scored for precision and recall; a
// gateway-replay dedup and a backfill-vs-clock-fault classifier; a quality
// flag and quarantine table that never shrinks the original series; and the
// measured per-point check cost at the plant's own write rate (examples.py).
const reel: Reel = {
  steps: [
    {
      title: 'Hook: one exact reading for hours, and every chart calls it stable',
      body: (
        <>
          A furnace's temperature reads the exact same value for hours. The
          controller, the dashboard, and the SPC chart all agree: nothing
          here looks wrong.
        </>
      ),
      duration: 5.6,
      fig: "a furnace's temperature reads the exact same value for hours, and the controller, the dashboard, and the SPC chart all agree nothing here looks wrong",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: a windowed variance check catches what a spike rule can’t',
      body: (
        <>
          A spike rule looks for a sudden jump. A range rule looks for an
          impossible value. Neither fires here — only a check on how much a
          reading moves over a window catches a signal that's stopped moving.
        </>
      ),
      duration: 5.8,
      fig: "a spike rule looks for a sudden jump and a range rule looks for an impossible value, but only a check on how much a reading moves over a window catches a signal that's stopped moving",
      Visual: S.RevealFlatline,
    },
    {
      title: 'Reveal: a range check and a spike detector catch two more fault shapes',
      body: (
        <>
          On the same fleet, a different sensor dips below what's physically
          possible, and a third throws a handful of isolated spikes a
          median-based detector catches without being thrown by its own outlier.
        </>
      ),
      duration: 5.8,
      fig: "a different sensor dips below what's physically possible, and a third throws isolated spikes a median-based detector catches without being thrown by its own outlier",
      Visual: S.RevealRangeSpike,
    },
    {
      title: 'Predict: does deleting a flagged point ever cost a post-mortem evidence?',
      body: (
        <>
          A rule flags the furnace's frozen reading as bad. Delete it outright,
          or keep it, labeled, in a separate quarantine table — does the
          choice matter to whoever investigates later?
        </>
      ),
      duration: 4.8,
      fig: "a rule flags the furnace's frozen reading as bad — delete it outright, or keep it labeled in a quarantine table, does the choice matter to whoever investigates later?",
      predict: {
        options: [
          { label: "No — a flagged point is wrong, so deleting it loses nothing real" },
          {
            label: 'Yes — a flagged point might be the one real event a post-mortem needs',
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. A rule can be wrong, and the exact point a rule calls "bad" is
            sometimes the one piece of evidence that explains what actually
            happened — deleting it destroys the only record of it.
          </>
        ),
      },
      Visual: S.PredictDelete,
    },
    {
      title: 'Reveal: a firmware update shifts the whole level, not one point',
      body: (
        <>
          A firmware update re-scales a sensor's output. Every reading after
          that moment stays individually plausible, but the median shifts —
          caught as a change point, not as a spike.
        </>
      ),
      duration: 5.6,
      fig: "a firmware update re-scales a sensor's output so every reading after stays individually plausible, but the median shifts, caught as a change point rather than a spike",
      Visual: S.RevealChangePoint,
    },
    {
      title: 'Reveal: a replay dedupes by its key; a backfill and a clock fault don’t look alike',
      body: (
        <>
          A gateway resends a chunk of readings after an outage. An
          idempotent key collapses the exact replay back to one copy, and
          comparing two timestamps tells a late backfill from a broken clock.
        </>
      ),
      duration: 5.8,
      fig: "a gateway resends readings after an outage, an idempotent key collapses the replay back to one copy, and comparing two timestamps tells a late backfill from a broken clock",
      takeaway: 'A replayed batch and a backfilled one look alike until you check which timestamp could not have happened yet.',
      Visual: S.RevealDedupBackfill,
    },
    {
      title: 'Reveal: every flagged point gets a flag and a seat in quarantine',
      body: (
        <>
          Nothing is deleted. Every flagged point keeps its place in the
          original series and also lands in a quarantine table with the rule
          that fired and a severity.
        </>
      ),
      duration: 5.6,
      fig: "nothing is deleted — every flagged point keeps its place in the original series and also lands in a quarantine table with the rule that fired and a severity",
      takeaway: "Flagging a point and deleting it are two different decisions — only one of them survives a wrong rule.",
      Visual: S.RevealQuarantine,
    },
    {
      title: 'Reveal: measured precision, recall, and cost at the plant’s own rate',
      body: (
        <>
          Across the fleet, the rules catch almost every planted fault with
          few false alarms, and running every check costs a small fraction
          of the time each reading represents.
        </>
      ),
      duration: 5.8,
      fig: "across the fleet the rules catch almost every planted fault with few false alarms, and running every check costs a small fraction of the time each reading represents",
      takeaway: "A check costing more compute time than the data it covers is a check that can't keep up.",
      Visual: S.RevealPrecisionCost,
    },
    {
      title: 'Recap',
      body: (
        <>
          A windowed variance check, a range check, a spike-robust detector,
          and a change-point check, each catching a fault shape no other
          rule would; a dedup key; a quarantine that never deletes; and a
          measured cost that keeps up with the plant.
        </>
      ),
      duration: 5.8,
      fig: "a windowed variance check, a range check, a spike-robust detector, and a change-point check each catching a fault shape no other rule would, a dedup key, a quarantine that never deletes, and a measured cost that keeps up",
      takeaway: "Four fault shapes, four different rules — no single check would have caught all of them.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Back to the hook's furnace. Given only that its reading never
          moves, which named rule actually catches it — the spike rule, the
          range rule, or the windowed variance check?
        </>
      ),
      duration: 4.8,
      fig: "given only that the furnace's reading never moves, which named rule actually catches it — the spike rule, the range rule, or the windowed variance check?",
      predict: {
        options: [
          { label: 'The spike rule or the range rule — the value is still plausible' },
          {
            label: 'The windowed variance check — nothing else looks at how a value moves',
            correct: true,
          },
        ],
        explain: (
          <>
            The windowed variance check. The furnace's value is plausible and
            never jumps, so neither a range rule nor a spike rule has
            anything to flag — only a check on movement over a window does.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
