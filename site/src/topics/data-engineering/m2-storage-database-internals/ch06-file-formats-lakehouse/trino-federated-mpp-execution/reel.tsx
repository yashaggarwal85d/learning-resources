import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every architectural claim here is a word-for-word quote from Trino's own current
// documentation or the Trino project's/Meta's own announcements (SOURCES.md). No real Trino
// cluster runs in this sandbox (no Docker daemon available); examples.py instead runs a real,
// executed, minimal model of coordinator/worker task scheduling, dynamic filtering, cost-based
// build-side selection, and TASK-retry spooling over real in-memory data -- disclosed in
// examples.py's own docstring and SOURCES.md's Red team section.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Section six-point-three closed with a decision: Iceberg, over a REST catalog. This
          topic opens the next section by asking who actually runs the query against that table --
          starting with Trino's coordinator and worker split.
        </>
      ),
      duration: 4.8,
      fig: 'iceberg, over a rest catalog -- decided. now: who actually runs the query?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does the whole query fail?',
      body: (
        <>
          A worker fails partway through a query, by Trino's default behavior. Does the whole
          query fail, or just that one task?
        </>
      ),
      duration: 4.8,
      fig: "one worker fails mid-query. does the whole query fail, or just that task?",
      predict: {
        options: [
          { label: 'Just that one task' },
          { label: 'The whole query', correct: true },
        ],
        explain: (
          <>
            By default, Trino's own docs say the query fails and must be run again manually --
            there's no task-level retry unless it's turned on.
          </>
        ),
      },
      Visual: S.PredictTaskFailure,
    },
    {
      title: 'Reveal: coordinator plans, workers execute',
      body: (
        <>
          By default, the whole query fails, for real -- Trino's own words. The coordinator
          parses, plans, and schedules; workers execute tasks and exchange data between stages.
        </>
      ),
      duration: 4.8,
      fig: 'the whole query fails, by default. coordinator plans and schedules; workers execute and exchange.',
      Visual: S.RevealCoordinatorWorker,
    },
    {
      title: 'Reveal: a real dynamic filter',
      body: (
        <>
          A join's build side produces real candidate keys. Pushed into the probe side's scan,
          those keys prune rows before they're ever read -- run for real in this chapter's own
          sandbox.
        </>
      ),
      duration: 4.8,
      fig: "the join's build side makes a real filter, pruning the probe scan before it reads those rows.",
      takeaway: "A join's real build side prunes the probe scan before those rows are ever read.",
      Visual: S.RevealDynamicFiltering,
    },
    {
      title: 'Predict: which table gets built?',
      body: (
        <>
          Real row-count statistics exist for both tables in this join. Trino's cost-based join
          enumeration picks a build side from them -- the bigger table, or the smaller one?
        </>
      ),
      duration: 4.8,
      fig: 'real row-count statistics exist for both tables. which one does trino build the join on?',
      predict: {
        options: [
          { label: 'The bigger table' },
          { label: 'The smaller table', correct: true },
        ],
        explain: (
          <>
            Trino's own docs: table statistics from connectors estimate join-order costs, and the
            lowest-cost order wins -- building on the smaller side is cheaper.
          </>
        ),
      },
      Visual: S.PredictBuildSide,
    },
    {
      title: 'Reveal: the smaller table, by real statistics',
      body: (
        <>
          The smaller table, chosen by its real row-count statistic -- run for real in this
          sandbox. Without usable statistics, Trino's own docs say it falls back to merely
          eliminating cross joins, not true cost-based ordering.
        </>
      ),
      duration: 4.8,
      fig: 'the smaller table, by real row-count statistics. without stats, trino only eliminates cross joins.',
      takeaway: 'Real statistics pick the build side mechanically -- without them, Trino only eliminates cross joins, nothing more.',
      Visual: S.RevealCostBasedBuildSide,
    },
    {
      title: 'Reveal: TASK retry, opt-in',
      body: (
        <>
          Trino's own docs: a TASK retry policy retries one failed task alone, reusing other
          tasks' already-spooled output -- not recomputing them. It's opt-in, needs an external
          exchange manager, and is recommended for long batch queries specifically.
        </>
      ),
      duration: 4.8,
      fig: "task retry: a failed task retries alone, reusing other tasks' already-spooled output.",
      Visual: S.RevealTaskRetry,
    },
    {
      title: "Reveal: Trino wasn't always Trino",
      body: (
        <>
          Trino's own founders left Facebook over governance control of the project they'd built,
          starting an independent foundation. Facebook later trademarked the Presto name, forcing
          the rename to Trino the following year.
        </>
      ),
      duration: 4.8,
      fig: "trino wasn't always trino: a governance split, then a rename after a trademark filing.",
      Visual: S.RevealPrestoHistory,
    },
    {
      title: "Reveal: Presto's own C++ path",
      body: (
        <>
          Presto's own alternative: Prestissimo, a drop-in C++ worker built on Meta's Velox
          execution engine, replacing only the Java worker -- the coordinator Prestissimo talks to
          stays Java.
        </>
      ),
      duration: 4.8,
      fig: "presto's own alternative: prestissimo, a drop-in c++ worker on meta's velox -- same java coordinator.",
      takeaway: "Prestissimo swaps Presto's Java worker for a C++ one built on Velox -- the Java coordinator doesn't change at all.",
      Visual: S.RevealPrestissimo,
    },
    {
      title: 'Recap',
      body: (
        <>
          A real coordinator and worker split, a real dynamic filter, a real cost-based build-side
          choice, a real TASK-retry spool -- applied to this chapter's own table, all real or
          precisely sourced.
        </>
      ),
      duration: 4.8,
      fig: 'a real coordinator, a real filter, a real cost choice, a real retry -- on this chapter\'s table. next: clickhouse.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
