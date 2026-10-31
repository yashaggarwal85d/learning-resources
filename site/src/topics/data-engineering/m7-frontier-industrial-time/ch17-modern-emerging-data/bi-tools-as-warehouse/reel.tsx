import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher (CHAPTER.md: "Lab: none"). No digits/symbols beyond the five tool names in prose;
// no executable lab, consistent with a refresher's own scope.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A BI admin moves a dashboard from "extract" mode to "live" mode for fresher data, and the
          warehouse's query cost triples overnight with no change to the dashboard itself.
        </>
      ),
      duration: 2.8,
      fig: 'same dashboard. Same query. A different mode underneath it.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which mode would have given fresh data without that cost',
      body: (
        <>
          Which of the query modes, used deliberately instead, would have given fresher data
          without tripling the warehouse's cost?
        </>
      ),
      duration: 2.6,
      fig: 'live mode is not the only way to get fresh.',
      predict: {
        options: [
          { label: 'Live mode was the only option; the cost increase is just the price of freshness' },
          { label: "A Direct Lake-style on-demand load, or a deliberately chosen extract refresh interval, where available", correct: true },
        ],
        explain: (
          <>
            Live mode re-queries the warehouse on every interaction, so its cost scales with usage
            by design. Where it's available, an on-demand, per-column load gives import-like speed
            without an import's staleness; otherwise, a deliberately chosen refresh interval on
            extract is the lever, not switching to live by default.
          </>
        ),
      },
      Visual: S.PredictWhichModeWouldHaveWorked,
    },
    {
      title: 'Reveal: the tools, by category',
      body: (
        <>
          Looker with LookML as a modeling layer with its own metric-definition language; Power BI
          and Tableau as the two dominant commercial dashboarding tools; Superset and Metabase as
          the open-source alternatives.
        </>
      ),
      duration: 4.0,
      fig: 'five tools. Two axes: who sells it, and what it actually does.',
      Visual: S.RevealToolsByCategory,
    },
    {
      title: 'Reveal: import/extract',
      body: (
        <>
          A copy of the data lives inside the BI tool, so dashboards are fast and the warehouse is
          hit only on refresh.
        </>
      ),
      duration: 3.6,
      fig: 'the warehouse pays once, on a schedule, not on every click.',
      takeaway: 'Extract mode trades freshness for a warehouse bill that arrives on a schedule instead of on every click.',
      Visual: S.RevealImportExtract,
    },
    {
      title: 'Reveal: live-query',
      body: (
        <>
          Every dashboard interaction re-queries the warehouse directly, so freshness is perfect
          and warehouse load scales with usage.
        </>
      ),
      duration: 3.6,
      fig: 'perfect freshness, paid for on every single click.',
      takeaway: 'Live mode is not slower in general; it just moves the same cost from a schedule to every interaction.',
      Visual: S.RevealLiveQuery,
    },
    {
      title: "Reveal: Direct Lake's transcoding",
      body: (
        <>
          Power BI's Direct Lake loads OneLake's Delta tables directly, on demand, per column, the
          first time it's queried, without a separate import step — import-like speed without an
          import's staleness, falling back to DirectQuery when it can't load directly.
        </>
      ),
      duration: 4.5,
      fig: 'no import step, and no live re-query either — a third point on the same trade-off.',
      takeaway: "Direct Lake is a third point on the same freshness-versus-load axis, not an exception to it.",
      Visual: S.RevealDirectLake,
    },
    {
      title: 'Reveal: headless BI',
      body: (
        <>
          Once a compiled metric exists, any of these five tools can consume the same definition
          instead of each one re-encoding its own version of "active users."
        </>
      ),
      duration: 4.0,
      fig: 'one compiled metric. Five tools reading the same one.',
      takeaway: "Headless BI is the handoff's promise, shown from the tool side, not something any tool here built.",
      Visual: S.RevealHeadlessBI,
    },
    {
      title: 'Recap',
      body: (
        <>
          Import/extract trades freshness for a scheduled warehouse cost. Live-query trades a
          scheduled cost for perfect freshness paid on every click. Direct Lake sits between the
          two. Headless BI lets any tool read the same compiled metric regardless of mode.
        </>
      ),
      duration: 4.5,
      fig: 'three modes, one trade-off. One metric, many tools.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A week later, a Metabase dashboard's "active users" number starts sliding out of sync
          with the same metric on a Looker dashboard, built from the same warehouse.
        </>
      ),
      duration: 2.8,
      fig: 'same warehouse. Same metric name. Different numbers.',
      predict: {
        options: [
          { label: 'One of the two tools has a rendering bug and should be restarted' },
          { label: "Check whether both tools are reading the same compiled metric, or whether one quietly recomputed its own version", correct: true },
        ],
        explain: (
          <>
            Two tools reading from the same warehouse can still drift apart if one of them stops
            calling the compiled metric and recomputes it independently — exactly the handoff
            failure this chapter already named, now showing up on the tool side instead of in the
            mart.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
