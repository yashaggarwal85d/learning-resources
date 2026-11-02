import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Databricks' own compute menu (all-purpose, job, serverless, SQL warehouse), each with real
// documented start-time and idle-billing behaviour; Photon's C++ vectorized engine; DBU
// accounting by SKU — all sourced from Databricks' own current documentation, since no real
// workspace can run in this sandbox (disclosed in OUTLINE.md).
const reel: Reel = {
  steps: [
    {
      title: 'Same query, same cluster size, one runs noticeably faster',
      body: (
        <>
          The same aggregation query runs on two equally-sized clusters. One finishes noticeably
          faster than the other. Nothing about the data, the query, or the cluster's CPU count
          changed.
        </>
      ),
      duration: 4.2,
      Visual: S.SameQueryFasterRun,
    },
    {
      title: "What's actually different about the faster run?",
      body: (
        <>
          Before the name: the faster cluster isn't running more hardware. It's running the same
          rows through execution one engine processes row-at-a-time and the other processes in
          vectorized batches. Which one is faster, and why?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'The faster one has more memory bandwidth, unrelated to execution style' },
          { label: 'The faster one processes data in vectorized batches instead of row-at-a-time', correct: true },
          { label: 'The faster one is caching the whole query result from a prior run' },
          { label: 'The query planner chose a different join order on the faster cluster' },
        ],
        explain: (
          <>
            Vectorized batches. This is the same row-at-a-time-versus-batched lesson the course has
            already taught in the abstract — Photon is Databricks' own named, C++ implementation
            of exactly that idea, substituted in for parts of Spark's JVM execution.
          </>
        ),
      },
      Visual: S.WhatsDifferent,
    },
    {
      title: 'Four compute types, four different start-and-billing shapes',
      body: (
        <>
          All-purpose compute autostarts after it terminates — it's built to sit through idle
          gaps. A new job compute terminates the moment its one job ends and can't be restarted.
          Serverless runs in Databricks' own managed plane, not your cloud account. A SQL
          warehouse is its own compute type, built for querying.
        </>
      ),
      duration: 5.4,
      Visual: S.FourComputeTypes,
    },
    {
      title: 'Idle time an all-purpose cluster quietly bills for',
      body: (
        <>
          Four ten-minute jobs, spread across a day with gaps shorter than the auto-termination
          window. Job compute bills exactly forty minutes. All-purpose compute, sitting through
          every gap, bills eighty-five.
        </>
      ),
      duration: 4.8,
      Visual: S.IdleMinutesBilled,
      takeaway: "All-purpose compute bills the idle gaps between jobs too; job compute doesn't.",
    },
    {
      title: "Photon is Spark's own lesson, written in C++",
      body: (
        <>
          Databricks' own benchmark: Photon delivers an additional two-times speedup on the
          TPC-DS one-terabyte benchmark over the latest Databricks Runtime, with customers
          reporting three-to-eight-times gains on their own workloads.
        </>
      ),
      duration: 4.6,
      Visual: S.PhotonBenchmark,
      takeaway: 'Photon is a C++ vectorized engine, not a hardware upgrade — the same gain the course already taught, now shipped.',
    },
    {
      title: 'A pool holds idle instances so the next cluster starts faster',
      body: (
        <>
          A pool keeps a set of instances idle and ready. A new cluster drawing from the pool
          starts faster, and Databricks doesn't bill a DBU for an instance sitting idle in the
          pool — only the instance provider's own charge still applies.
        </>
      ),
      duration: 4.4,
      Visual: S.PoolIdleInstances,
    },
    {
      title: 'One knob an admin sets, every user inherits',
      body: (
        <>
          A compute policy is how an admin limits what any user can spin up — capped instance
          types, capped cluster count, a hard ceiling on per-cluster cost. Spot instances cut the
          price further, but the driver node is always on-demand; only the workers are spot.
        </>
      ),
      duration: 4.6,
      Visual: S.PolicyAndSpot,
    },
    {
      title: "The DBU isn't one number — it's a price list",
      body: (
        <>
          A Databricks Unit is a normalized unit of processing power, not a fixed vCPU-to-dollar
          ratio. Databricks publishes a distinct price list per SKU and per cloud — all-purpose,
          jobs, SQL warehouse and serverless each priced on their own.
        </>
      ),
      duration: 4.4,
      Visual: S.DbuBySku,
      takeaway: 'The DBU has no single rate — Databricks publishes a distinct price list per SKU and per cloud.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          Four compute types, four different start-and-billing shapes. Photon is the course's own
          vectorization lesson, written in C++, not new hardware. And the DBU is a price list
          by SKU, never one flat number.
        </>
      ),
      duration: 3.8,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team runs one ten-minute ETL job, once a week, at an unpredictable time. All-purpose,
          job compute, or serverless — which keeps the bill smallest without anyone babysitting a
          schedule?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'All-purpose, kept running so the job always has somewhere to land' },
          { label: 'Job compute, created fresh for each run and torn down the moment it finishes', correct: true },
          { label: 'Serverless, because it is always the cheapest option regardless of shape' },
        ],
        explain: (
          <>
            Job compute. A ten-minute job, once a week, at an unpredictable time, is exactly the
            shape that punishes all-purpose compute's idle-gap billing the hardest and gets
            nothing from staying warm — a fresh job compute bills only the ten minutes it actually
            runs, with no schedule to babysit.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
