import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A conceptual, organizational topic (CHAPTER.md: "Lab: none"). The two-dashboard disagreement
// the hook describes is reproduced for real in examples.py as a small SQLite demonstration, so
// the claim is executed evidence, not just narrated.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two dashboards, built from the same mart, report different totals for "active users
          this month." Both engineers insist their own query is correct.
        </>
      ),
      duration: 2.8,
      fig: 'same mart. Same question. Two different numbers.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what was never written down',
      body: (
        <>
          What was never written down that would have prevented this, and whose job should it
          have been to write it down?
        </>
      ),
      duration: 2.6,
      fig: 'neither engineer is wrong about their own SQL.',
      predict: {
        options: [
          { label: "The dashboards disagree because one engineer's SQL has a bug somewhere" },
          { label: "The mart's grain was never documented, so one dashboard counted at a finer grain than the other", correct: true },
        ],
        explain: (
          <>
            Both queries can be entirely correct SQL and still disagree, if nobody wrote down what
            one row of the mart actually stands for. Documenting that was data engineering's job;
            owning the metric built on top of it was analytics engineering's.
          </>
        ),
      },
      Visual: S.PredictWhatWasMissing,
    },
    {
      title: 'Reveal: what gets handed off',
      body: (
        <>
          A conformed mart sitting behind a semantic layer that compiles one metric definition to
          SQL for every tool that asks — not a raw table, and not a finished dashboard.
        </>
      ),
      duration: 4.2,
      fig: 'a mart and a compiled metric. Nothing else crosses this line.',
      Visual: S.RevealWhatGetsHandedOff,
    },
    {
      title: 'Reveal: grain and freshness, documented',
      body: (
        <>
          The mart's grain, what one row actually equals, and its freshness SLA are facts a
          consumer has to be told explicitly, in writing, not discovered by trial and error.
        </>
      ),
      duration: 4.2,
      fig: 'unspoken becomes assumed. Assumed breaks the first time it matters.',
      takeaway: "An undocumented grain isn't a missing nice-to-have; it's the exact gap a double-counted dashboard falls into.",
      Visual: S.RevealGrainAndFreshness,
    },
    {
      title: 'Reveal: ownership moves to analytics engineers',
      body: (
        <>
          Past this handoff, the people maintaining a metric's definition are typically analytics
          engineers, not the data engineers who built the mart underneath it.
        </>
      ),
      duration: 4.2,
      fig: 'moving data at scale and defining a metric correctly are two different skills.',
      takeaway: 'A deliberate division of labor, not a gap nobody owns, is what makes this handoff work at all.',
      Visual: S.RevealAnalyticsEngineerOwnership,
    },
    {
      title: 'Reveal: the negotiation that keeps a metric from being computed twice',
      body: (
        <>
          Who may change a shared metric's definition, and how a conflicting request actually gets
          resolved, is an ongoing process, not a document written once and forgotten.
        </>
      ),
      duration: 4.2,
      fig: 'the mechanism that keeps one metric one metric is never finished.',
      takeaway: "A metric staying defined once is a maintained agreement, not a property the system just holds on its own.",
      Visual: S.RevealNegotiation,
    },
    {
      title: 'Reveal: Minerva, the production-scale example',
      body: (
        <>
          Airbnb's own metric platform, built to standardize how metrics are created, computed,
          served and consumed, with every metric defined in exactly one place.
        </>
      ),
      duration: 4.2,
      fig: 'one definition. Every tool at the company reads the same one.',
      takeaway: 'A single metric definition is not a small-team convenience; it scales to an entire company on purpose.',
      Visual: S.RevealMinerva,
    },
    {
      title: 'Reveal: what this topic leaves out',
      body: (
        <>
          The semantic layer's own compilation mechanism, which specific BI tool consumes the
          mart, the engine serving many tools at once, and the full negotiation process in
          detail, are each named forward to where this course actually teaches them.
        </>
      ),
      duration: 4.5,
      fig: 'left out on purpose, and named exactly where each one actually lives.',
      takeaway: 'A boundary this topic draws honestly is more useful than one topic quietly trying to cover everything.',
      Visual: S.RevealWhatThisLeavesOut,
    },
    {
      title: 'Recap',
      body: (
        <>
          A conformed mart and a compiled metric cross the boundary. Grain and freshness get
          written down. Ownership moves to analytics engineers. A negotiation, not a document,
          keeps the metric computed once.
        </>
      ),
      duration: 4.5,
      fig: 'a mart, a metric, a grain, an owner, a negotiation.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A third dashboard, built against the same mart, reports yet another number for the same
          metric. The analyst who built it says they just wrote the SQL themselves.
        </>
      ),
      duration: 2.8,
      fig: 'the mart never changed. Neither did the metric layer.',
      predict: {
        options: [
          { label: "The mart or the metric layer must have a bug, since the number changed again" },
          { label: "Nothing in the mart or the metric layer broke — the analyst bypassed the compiled metric and recomputed it by hand", correct: true },
        ],
        explain: (
          <>
            Writing the SQL by hand instead of calling the compiled metric is, by definition, a
            second independent computation of the same thing — exactly the "computed two ways"
            failure the negotiation and the single definition exist to prevent.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
