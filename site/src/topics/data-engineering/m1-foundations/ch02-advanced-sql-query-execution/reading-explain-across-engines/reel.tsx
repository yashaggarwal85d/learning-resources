import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running examples: PostgreSQL 16.15 (the existing "shop" database, topics 23-26) and a freshly
// installed PostgreSQL 18.6, side by side on this sandbox; Spark 3.5.9 in local mode (Python 3.11
// venv, topic 26) queried through its own UI REST API. Every number below is in examples.py and
// SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'The same command, two versions apart',
      body: (
        <>
          Run the exact same <code>EXPLAIN (ANALYZE)</code> on PostgreSQL 16: no <code>Buffers</code> line anywhere. Run it on PostgreSQL 18, same
          sandbox, same command: a <code>Buffers</code> line appears, unasked for.
        </>
      ),
      duration: 4.8,
      fig: 'PostgreSQL 16: no Buffers line. PostgreSQL 18: one anyway.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: why would the same command show more in a newer version?',
      body: (
        <>
          Nothing about the query changed, and nothing extra was asked for. Why would the exact same <code>EXPLAIN (ANALYZE)</code> command print
          more information on a newer version of the same engine?
        </>
      ),
      duration: 2,
      fig: 'same command, same query, different output',
      predict: {
        options: [
          { label: 'A bug in the newer version' },
          { label: 'The engine’s own default for what ANALYZE shows changed', correct: true },
          { label: 'The query planner got smarter and added it automatically' },
        ],
        explain: (
          <>
            The engine's own default changed — a real, version-dated decision about what <code>ANALYZE</code> shows without being asked, not a bug
            and not the planner reasoning about this particular query.
          </>
        ),
      },
      Visual: S.PredictWhyMore,
    },
    {
      title: 'Reveal: PostgreSQL 18 turns on Buffers by default',
      body: (
        <>
          PostgreSQL's own documentation states it plainly: the <code>ANALYZE</code> option implicitly enables the <code>BUFFERS</code> option, as of
          PostgreSQL 18. Before that version, you had to ask for <code>BUFFERS</code> explicitly — exactly what this topic's own PostgreSQL 16
          instance still requires.
        </>
      ),
      duration: 4.8,
      fig: 'ANALYZE now implies BUFFERS — a version-dated default, not a trick of the query',
      Visual: S.RevealBuffersDefault,
    },
    {
      title: 'Reveal: estimated vs. actual rows, and loops',
      body: (
        <>
          Every engine's plan carries two numbers for the same node: what the planner guessed beforehand, and what actually came out once the query
          ran. Here, the planner guessed 1012 rows; 2000 actually matched — a real, naturally occurring underestimate, not a constructed worst case.
        </>
      ),
      duration: 4.8,
      fig: 'estimated 1012, actual 2000 — the planner guessed low',
      takeaway: 'Comparing estimated to actual rows is the one check every engine supports, whatever else its vocabulary differs on.',
      Visual: S.RevealEstVsActual,
    },
    {
      title: 'Reveal: spill and memory indicators',
      body: (
        <>
          This chapter already measured this exact question for PostgreSQL: whether an operator's own memory budget held, or it had to spill to
          disk, read straight off <code>EXPLAIN (ANALYZE, BUFFERS)</code>'s own batch and buffer numbers. Every engine answers the same question
          somewhere in its own output — only the name and the location change.
        </>
      ),
      duration: 4.4,
      fig: 'did this operator run out of its memory budget?',
      Visual: S.RevealSpillRecap,
    },
    {
      title: 'Predict: across five totally different outputs, what’s worth checking first?',
      body: (
        <>
          PostgreSQL, Spark, Trino, Snowflake and BigQuery format this information in five different ways, with five different names for similar
          things. Given a plan from any one of them, what's actually worth checking first?
        </>
      ),
      duration: 2.4,
      fig: 'five formats, one question to start with',
      predict: {
        options: [
          { label: 'Whichever field has the biggest raw number' },
          { label: 'Where the real number diverges furthest from what was expected', correct: true },
          { label: 'The very first line of the plan, top to bottom' },
        ],
        explain: (
          <>
            Where the real number diverges furthest from expected — a huge but expected row count isn't a problem, and a small node run a thousand
            times over can matter more than a big one run once.
          </>
        ),
      },
      Visual: S.PredictWhatFirst,
    },
    {
      title: 'Reveal: Spark’s estimate lives in its plan text',
      body: (
        <>
          Ask Spark for its cost-mode plan, and its own estimate is right there in the text: a range of 1,000,000 rows, printed as{' '}
          <code>Statistics(rowCount=1.00E+6)</code> on the exact node that produces them.
        </>
      ),
      duration: 4.4,
      fig: 'Statistics(rowCount=1.00E+6), printed in the plan itself',
      Visual: S.RevealSparkPlanEstimate,
    },
    {
      title: 'Reveal: Spark’s actual stats live in its UI and API',
      body: (
        <>
          That same plan text never says what actually happened. A comfortable run reports 0 megabytes spilled to memory or disk, read straight
          from Spark's own UI API. A memory-constrained run of a similar job reports 388 megabytes spilled to memory and 198 to disk — a real,
          measured spill, not a hypothetical one.
        </>
      ),
      duration: 4.8,
      fig: '0 MB spilled, comfortable — 388 MB / 198 MB spilled, constrained',
      takeaway: 'Spark splits this question in two: the plan text holds the estimate, the UI and API hold what actually happened.',
      Visual: S.RevealSparkUiActual,
    },
    {
      title: 'Predict: which field actually tells you a stage spilled?',
      body: (
        <>
          A stage's own reported numbers include how many bytes it shuffled, and separately, how many bytes it spilled to memory or disk. Which of
          those actually means it ran out of its memory budget?
        </>
      ),
      duration: 2.4,
      fig: 'shuffle bytes vs. spilled bytes',
      predict: {
        options: [
          { label: 'A large shuffle-bytes number' },
          { label: 'A nonzero memory- or disk-spilled number', correct: true },
          { label: 'Both mean the same thing' },
        ],
        explain: (
          <>
            A nonzero spilled number — moving data between stages (shuffle) is normal and expected in every healthy run; spilling is specifically
            what happens only once an operator runs out of the memory it was given.
          </>
        ),
      },
      Visual: S.ProveShuffleVsSpill,
    },
    {
      title: 'Reveal: Trino’s EXPLAIN ANALYZE',
      body: (
        <>
          Trino's own documentation: its plan shows the CPU time spent in each stage, and the relative cost of each plan node within it, inline in
          the same text — no separate UI needed to see where the time actually went.
        </>
      ),
      duration: 4.4,
      fig: 'CPU time per stage, relative cost per node, in the plan text itself',
      Visual: S.RevealTrino,
    },
    {
      title: 'Reveal: Snowflake’s Query Profile',
      body: (
        <>
          Snowflake names this information with its own dedicated panes. A Pruning pane reports partitions scanned against partitions total. A
          Spilling pane separately reports bytes spilled to local storage and to remote storage.
        </>
      ),
      duration: 4.4,
      fig: 'Pruning: partitions scanned / total. Spilling: local / remote bytes.',
      Visual: S.RevealSnowflake,
    },
    {
      title: 'Reveal: BigQuery’s execution graph',
      body: (
        <>
          BigQuery draws its plan as a graph: stages as boxes, and the connecting edges carry the estimated number of rows exchanged between
          them — the estimate lives on the edges here, not inside a node. Shuffle memory spilling to disk is named explicitly as a cause of
          dramatic slowdown.
        </>
      ),
      duration: 4.8,
      fig: 'estimated rows on the edges, not inside the boxes',
      takeaway: 'The same five ideas show up everywhere; only the names, and sometimes even where the number is drawn, actually change.',
      Visual: S.RevealBigQuery,
    },
    {
      title: 'Recap',
      body: (
        <>
          Five engines, five vocabularies, one fixed order worth checking regardless: the biggest estimate-vs-actual gap first, then a high loop
          count multiplying a small cost, then spill or memory pressure, then whichever single operator is actually slowest or widest. The names
          change. The order of questions doesn't have to.
        </>
      ),
      duration: 4.8,
      fig: 'estimate gap → loops → spill → the slowest operator',
      Visual: S.Recap,
    },
    {
      title: 'Prove it · 1 of 2',
      body: (
        <>
          A plan node reports an estimated 500 rows. The run actually produces 50,000. Is this node's estimate close, or badly off?
        </>
      ),
      duration: 2.4,
      fig: '500 estimated, 50,000 actual',
      predict: {
        options: [{ label: 'Close enough to trust' }, { label: 'Badly off — worth investigating first', correct: true }],
        explain: (
          <>
            Badly off — a hundred-times gap between estimated and actual is exactly the kind of divergence this topic's own triage order puts
            first, on any engine.
          </>
        ),
      },
      Visual: S.ProveBadEstimate,
    },
    {
      title: 'Prove it · 2 of 2',
      body: (
        <>
          A stage reports a large number of bytes shuffled, and a spilled-bytes field sitting at exactly zero. Did this stage run out of memory?
        </>
      ),
      duration: 2.4,
      fig: 'large shuffle, zero spill',
      predict: {
        options: [{ label: 'Yes — the large shuffle number proves it' }, { label: 'No — zero spilled bytes means it stayed within budget', correct: true }],
        explain: (
          <>
            No — moving data between stages is ordinary, expected work. Spilling is a separate, specific signal, and this stage's own spilled-bytes
            field says it never happened here.
          </>
        ),
      },
      Visual: S.ProveZeroSpill,
    },
  ],
};

export default reel;
