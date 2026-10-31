import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is measured against a real local Apache Spark 4.0.1 session (examples.py),
// AQE's coalescePartitions disabled so the measured partition counts reflect the setting this
// topic is actually about, not a later runtime optimisation: a bare RDD (no parent, no explicit
// count) gets exactly local[4]'s 4 partitions; a groupBy shuffle with no override writes 200
// (spark.sql.shuffle.partitions's own default); setting that config to 8 moves only the shuffle's
// own output, never a fresh bare RDD's 4. Locality levels, delay scheduling, and FIFO/FAIR pools
// are named from Spark's own source and docs rather than measured, disclosed in FACT-CHECK.md:
// local mode's one JVM is both driver and only executor, so no real locality wait or multi-job
// resource contention is ever observable here.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          On a real cluster, a task could run exactly where its data already sits, or wait a
          moment for a better slot elsewhere. Which does Spark's scheduler actually choose?
        </>
      ),
      duration: 4.5,
      fig: 'a task, and its data. Run right where it sits, or wait for better?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: locality has nowhere to go here',
      body: (
        <>
          Measured: every task in this local run reports PROCESS_LOCAL. One JVM plays driver and
          executor both, so there's never a worse slot to wait out — the real wait needs a cluster.
        </>
      ),
      duration: 4.8,
      fig: 'one JVM, one executor: every task is already PROCESS_LOCAL, nothing to wait for.',
      Visual: S.RevealLocalityTrivial,
    },
    {
      title: 'Predict: a bare RDD, no hints given',
      body: (
        <>
          Create an RDD with no explicit partition count and no parent RDD at all. How many
          partitions does Spark actually hand it?
        </>
      ),
      duration: 2.8,
      fig: 'a bare RDD, zero hints. How many partitions does it get?',
      predict: {
        options: [
          { label: 'A fixed small number, like 1 or 2, regardless of the machine' },
          { label: 'The session\'s own core count — local[4] means 4', correct: true },
        ],
        explain: (
          <>
            With no parent RDD and no override, Spark falls back to `spark.default.parallelism`,
            and in local mode that setting is defined as exactly the number of cores available —
            not a fixed constant, not a guess from the data size.
          </>
        ),
      },
      Visual: S.PredictBareRDD,
    },
    {
      title: 'Reveal: default parallelism is the core count',
      body: (
        <>
          Measured: the bare RDD gets exactly 4 partitions in this local[4] session. Change the
          core count, and that number moves with it — nothing else decides it.
        </>
      ),
      duration: 4.8,
      fig: 'local[4]: 4 cores. Bare RDD: 4 partitions. One tracks the other exactly.',
      takeaway: 'Default parallelism is the core count itself in local mode, not a fixed number or a guess from data size.',
      Visual: S.RevealDefaultParallelism,
    },
    {
      title: 'Predict: the same data, now grouped',
      body: (
        <>
          Same four-partition data. Run a groupBy shuffle on it, with no override at all. Does the
          output land on the same 4 partitions, or does a different number take over?
        </>
      ),
      duration: 2.8,
      fig: 'same data, now a shuffle. Still 4 output partitions, or a different number?',
      predict: {
        options: [
          { label: 'Still 4 — the shuffle just redistributes the same data it already has' },
          { label: "200 — a separate SQL-layer setting decides shuffle output, not the core count", correct: true },
        ],
        explain: (
          <>
            `spark.sql.shuffle.partitions` is its own config, with its own default of 200, living
            entirely in the SQL/DataFrame layer. It has no idea how many cores the session has, and
            the core count has no say over it either.
          </>
        ),
      },
      Visual: S.PredictGroupByPartitions,
    },
    {
      title: 'Reveal: 200, not 4',
      body: (
        <>
          Measured: the groupBy writes out exactly 200 partitions, `spark.sql.shuffle.partitions`'s
          own default — not the 4 cores the bare RDD measurement just confirmed a moment ago.
        </>
      ),
      duration: 4.8,
      fig: 'bare RDD: 4 partitions (cores). groupBy output: 200 partitions (its own config).',
      takeaway: 'Shuffle output partition count comes from spark.sql.shuffle.partitions alone, never from the core count.',
      Visual: S.RevealShufflePartitions,
    },
    {
      title: 'Predict: change the shuffle setting by hand',
      body: (
        <>
          Set `spark.sql.shuffle.partitions` to 8 explicitly, then create a brand new bare RDD.
          Does that fresh RDD's partition count move too, or hold steady at 4?
        </>
      ),
      duration: 2.8,
      fig: 'set shuffle partitions to 8, then make a fresh RDD. Does 4 move too?',
      predict: {
        options: [
          { label: "It moves to 8 too — they're really governed by one shared parallelism knob" },
          { label: "It stays at 4 — the two settings never touch each other, in either direction", correct: true },
        ],
        explain: (
          <>
            Nothing about `spark.sql.shuffle.partitions` reaches into how a bare `parallelize` call
            decides its partition count. That path only ever consults the core count, regardless of
            what the SQL shuffle setting happens to be set to right now.
          </>
        ),
      },
      Visual: S.PredictSetEight,
    },
    {
      title: 'Reveal: independent, confirmed both ways',
      body: (
        <>
          Measured: after setting the config to 8, the groupBy's output moves to 8 — but a fresh
          bare RDD, made right after, still gets exactly 4. Neither setting ever touches the other.
        </>
      ),
      duration: 4.8,
      fig: 'groupBy after the change: 8 partitions. Fresh bare RDD, same session: still 4.',
      takeaway: 'The two parallelism settings are fully independent axes, confirmed by changing one and checking the other both stayed put.',
      Visual: S.RevealIndependentBothWays,
    },
    {
      title: 'Recap',
      body: (
        <>
          Default parallelism comes from the core count; shuffle partitions come from their own SQL
          setting — two independent knobs. Locality waits place the tasks they size, and FIFO or
          FAIR scheduling decides how several jobs share them, neither demonstrable on one JVM.
        </>
      ),
      duration: 4.8,
      fig: 'two independent sizing knobs; locality waits place tasks; FIFO or FAIR shares them.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
