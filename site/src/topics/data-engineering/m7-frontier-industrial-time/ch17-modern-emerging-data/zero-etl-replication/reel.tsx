import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Reproduces the shape of a managed zero-ETL integration's documented cadence and prerequisites
// against this sandbox's own Postgres (CHAPTER.md): a real logical replication slot stands in
// for DynamoDB's incremental exports, executed in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A vendor's slide says their new integration moves data from a production database into
          the warehouse with "zero ETL." A team with a sub-minute fraud-detection freshness
          requirement adopts it and starts missing fraud for up to half an hour at a time.
        </>
      ),
      duration: 3.0,
      fig: 'the slide promised zero. The team got a number it never asked for.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what "zero" actually meant',
      body: (
        <>
          What did "zero" actually mean here, and what number was always going to be the real
          limit?
        </>
      ),
      duration: 2.6,
      fig: "zero ETL doesn't mean zero latency.",
      predict: {
        options: [
          { label: 'Zero meant zero latency, so something about the integration must be broken' },
          { label: "Zero meant zero pipeline code, not zero latency; the real limit was the vendor's own documented incremental-replication window", correct: true },
        ],
        explain: (
          <>
            Nothing broke. "Zero" described the pipeline code a team no longer had to write, not
            the time data takes to arrive. The team's real limit was always the vendor's own
            documented incremental-replication window, which nobody had read as a freshness SLA
            until it cost them something.
          </>
        ),
      },
      Visual: S.PredictWhatZeroMeant,
    },
    {
      title: 'Reveal: managed CDC into an analytics engine',
      body: (
        <>
          Aurora, DynamoDB, and several RDS engines, named as supported sources straight into
          Redshift; Microsoft Fabric mirroring is the comparable pattern on Microsoft's platform.
        </>
      ),
      duration: 4.0,
      fig: 'named sources. One mechanism underneath all of them.',
      Visual: S.RevealManagedCDC,
    },
    {
      title: "Reveal: DynamoDB's own documented cadence",
      body: (
        <>
          On activation, the integration exports the full table once, then incrementally
          replicates updates every fifteen to thirty minutes, requiring point-in-time recovery as
          a prerequisite.
        </>
      ),
      duration: 4.2,
      fig: 'one full copy, then a recurring, documented window.',
      takeaway: "That window is a freshness SLA a team didn't choose, stated plainly in the vendor's own documentation.",
      Visual: S.RevealDynamoDBCadence,
    },
    {
      title: 'Reveal: what "zero" actually hides',
      body: (
        <>
          Every "zero-ETL" integration is log-based CDC running inside a vendor's managed
          infrastructure. Nothing about the underlying mechanism is new.
        </>
      ),
      duration: 3.8,
      fig: 'the mechanism this course already built. Just inside someone else’s boundary.',
      takeaway: 'What actually disappears is the pipeline code a team used to operate, not the pipeline itself.',
      Visual: S.RevealWhatZeroHides,
    },
    {
      title: "Reveal: reproducing the shape on this sandbox's own Postgres",
      body: (
        <>
          A prerequisite check, an initial full export, and a replication slot drained on a fixed
          cycle, reproducing the documented cadence for real, not against the managed service
          itself.
        </>
      ),
      duration: 4.2,
      fig: 'the same shape, built here, with a real replication slot.',
      takeaway: "A write landing inside the window stays invisible until the next pulse, by construction, not by accident.",
      Visual: S.RevealReproducingTheShape,
    },
    {
      title: 'Reveal: the three costs of giving up pipeline control',
      body: (
        <>
          Schema changes propagate on the vendor's schedule, not a team's own migration plan;
          filtering is limited to whatever the integration exposes; and the cost model shifts to a
          vendor's billing unit instead of a tunable pipeline.
        </>
      ),
      duration: 4.5,
      fig: 'three things that come with giving up the code.',
      takeaway: "Giving up the pipeline's code means giving up control over more than just the mechanism.",
      Visual: S.RevealThreeCosts,
    },
    {
      title: 'Recap',
      body: (
        <>
          "Zero" meant zero pipeline code, not zero latency. The mechanism is the same log-based
          CDC this course already built, now managed. The real limit is the vendor's documented
          window. What's given up is schema timing, filtering, and vendor billing control.
        </>
      ),
      duration: 4.5,
      fig: 'zero code. The same mechanism. A real limit. A real cost.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A different team has a freshness requirement of exactly twenty minutes, and is deciding
          whether DynamoDB's documented zero-ETL window can meet it.
        </>
      ),
      duration: 2.8,
      fig: 'twenty minutes, against a window that says fifteen to thirty.',
      predict: {
        options: [
          { label: "Yes, since twenty falls comfortably inside the window's own range" },
          { label: "Not reliably — the documented worst case is thirty minutes, which misses a twenty-minute requirement by up to ten", correct: true },
        ],
        explain: (
          <>
            A requirement inside a documented range isn't automatically met by it. The window's
            own worst case, thirty minutes, is what has to be checked against the requirement, and
            thirty minutes misses a twenty-minute bar by up to ten minutes on any cycle that runs
            long.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
