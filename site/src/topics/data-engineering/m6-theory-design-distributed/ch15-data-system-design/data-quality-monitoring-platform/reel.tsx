import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The check-cost comparison, the lineage-grouped routing, the
// week-of-alerts simulation (grouped versus ungrouped, with suppression),
// and the alert-precision calculation are asserted in examples.py's own
// check_cost(), route_by_lineage(), simulate_week() and alert_precision().
// The dbt and Google SRE book claims trace to their own docs, quoted in
// SOURCES.md and checked step by step in FACT-CHECK.md. No literal digits
// appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: the checks were right, the team stopped listening",
      body: (
        <>
          Thousands of checks run every day, and in their first week they send a flood of alerts.
          The data team mutes the channel by midweek. Days later a real failure — a stale source
          table feeding the finance close — sits in that muted channel, unseen, for a full day.
        </>
      ),
      duration: 5.0,
      fig: "an alert counter climbing to a flood, a muted channel icon, a red flag sitting ignored",
      Visual: S.Hook,
    },
    {
      title: "Predict: what did the design fail to treat as its own requirement?",
      body: (
        <>
          The checks were right every time. What did the platform's design fail to treat as its
          own requirement, and what measurable thing about the alerts would have told the team,
          in week one, that it was failing?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "run fewer checks, since fewer checks means fewer alerts" },
          {
            label: "alert precision and the share of alerts actually acted on, measured as the platform's own requirement",
            correct: true,
          },
        ],
        explain: (
          <>
            Fewer checks trades detection for quiet and still gives no number distinguishing a
            precise alert from a noisy one. The platform's real missing requirement is a measured
            precision — the share of alerts that corresponded to something real.
          </>
        ),
      },
      fig: "fewer checks just trades away detection; the missing number is precision itself",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: two layers of checks, each costed and placed",
      body: (
        <>
          A declarative rule layer (not-null, accepted values) checks exactly what it's told, as
          cheap as the query it compiles to. A statistical layer (freshness, volume, distribution)
          compares against a learned baseline instead — each check priced and placed as a
          pipeline gate or a post-hoc scan.
        </>
      ),
      duration: 5.0,
      fig: "a declarative layer and a statistical layer, each with a cost bar and a placement tag",
      Visual: S.RevealTwoLayers,
    },
    {
      title: "Reveal: lineage-aware routing collapses the blast radius",
      body: (
        <>
          One root-cause table goes stale. Forty downstream tables inherit that staleness along
          the lineage graph. Routing by lineage collapses all forty into one alert, sent to the
          root table's own owner, not paged to everyone it reached.
        </>
      ),
      duration: 4.8,
      takeaway: "A failure's blast radius is who it reaches downstream; the alert belongs to the table that caused it.",
      fig: "one red table, forty dependents inheriting its color, collapsing into one alert at the root",
      Visual: S.RevealLineageRouting,
    },
    {
      title: "Reveal: the suppression controls",
      body: (
        <>
          A planned backfill window gets shaded and silenced. A schedule-aware threshold widens
          overnight, when normal volume dips. A rate limit per owner caps how many alerts one
          person can be sent. Each rule silences a specific, expected kind of noise.
        </>
      ),
      duration: 5.0,
      fig: "a shaded backfill window, an overnight threshold widening, a per-owner rate limit",
      Visual: S.RevealSuppression,
    },
    {
      title: "Reveal: the feedback loop that tunes the checks",
      body: (
        <>
          An operator marks one alert "this was noise," and that check's threshold widens on its
          own. A check that caught a real failure too late spawns a new, earlier check instead of
          staying as it was.
        </>
      ),
      duration: 4.8,
      takeaway: "A mute button fights alert fatigue for a week; a feedback loop that tunes the check survives later failures too.",
      fig: "a marked-noise alert widening its own threshold; a late catch spawning an earlier check",
      Visual: S.RevealFeedbackLoop,
    },
    {
      title: "Reveal: the incident workflow as a state machine",
      body: (
        <>
          An alert becomes an incident: detected, triaged, contained, repaired, reviewed — each
          stage with an owner and a timestamp. The review stage writes a recorded cause back into
          the check layer itself.
        </>
      ),
      duration: 4.8,
      fig: "five stages in sequence, a human decision marked at triage and at review",
      Visual: S.RevealIncidentWorkflow,
    },
    {
      title: "Reveal: alert precision as the platform's own SLO",
      body: (
        <>
          A precision gauge — the share of alerts that corresponded to a real, acted-on failure —
          sits beside the usual data SLOs, with its own error budget and its own burn-rate alert.
        </>
      ),
      duration: 5.0,
      takeaway: "Alert precision is the platform's own SLO; a monitor with no number for its own usefulness is flying blind.",
      fig: "a precision gauge with an error budget, drawn beside the data SLOs it sits next to",
      Visual: S.RevealPrecisionSLO,
    },
    {
      title: "Recap",
      body: (
        <>
          Two check layers, each costed and placed. Routing grouped by lineage, down to one owner.
          Suppression rules that are named and scoped, feeding a loop that tunes the checks. And
          precision, measured as the platform's own requirement.
        </>
      ),
      duration: 4.8,
      fig: "the two layers, the grouped routing, the suppression-and-feedback loop, and the precision gauge",
      Visual: S.Recap,
    },
    {
      title: "Prove it: ten times the tables",
      body: (
        <>
          A new domain gets onboarded overnight, and the table count grows tenfold. The same
          root-cause failure now reaches many more downstream tables than before. What's the next
          bottleneck?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "page every owner of every downstream table, since more tables means more people need to know" },
          {
            label: "the grouping already collapses it to one alert; the next bottleneck is whether lineage computation itself scales",
            correct: true,
          },
        ],
        explain: (
          <>
            Paging every downstream owner is exactly the ungrouped flood the lineage-based
            routing was built to prevent, now at a larger scale. The routing already collapses the
            alert; the real next question is whether computing blast radius over a much bigger
            lineage graph still runs fast enough to matter.
          </>
        ),
      },
      fig: "the same collapse to one alert, with the real question moved to the lineage graph's own compute cost",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
