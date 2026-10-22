import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic has no lab of its own (CHAPTER.md). Every claim traces to a direct quote from
// Snowflake's own documentation (SOURCES.md), disclosed as sourced-only since this sandbox has
// no way to run a real multi-cluster warehouse. No literal digits appear anywhere in this reel.
const reel: Reel = {
  steps: [
    {
      title: "One compute cluster, two teams' workloads",
      body: (
        <>
          Two teams share one compute cluster against one shared storage layer. One team's heavy
          batch job starts running. What happens to the other team's quick dashboard queries?
        </>
      ),
      duration: 4.8,
      fig: 'one cluster, two workloads, one shared storage layer underneath',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the separated architecture, quoted directly',
      body: (
        <>
          Storage and compute are kept architecturally separate, which simplifies infrastructure
          management and performance tuning on their own.
        </>
      ),
      duration: 4.8,
      fig: 'storage and compute, separated — infrastructure and tuning get simpler',
      Visual: S.RevealSeparationQuote,
    },
    {
      title: "Predict: does separating storage from compute, by itself, stop one workload's load from affecting another's?",
      body: (
        <>
          The architecture already keeps storage and compute apart. Does that alone stop one
          team's heavy job from slowing the other team's queries down?
        </>
      ),
      duration: 2.8,
      fig: 'storage already separated — does that alone stop the slowdown?',
      predict: {
        options: [
          { label: 'Yes — separating storage from compute isolates every workload' },
          { label: 'No — compute itself still has to be split, separately', correct: true },
        ],
        explain: (
          <>
            No. Separating storage from compute only removes storage as the shared bottleneck —
            compute still has to be deliberately split per workload to actually stop contention.
          </>
        ),
      },
      Visual: S.PredictSeparationEnough,
    },
    {
      title: 'Reveal: independent compute clusters, quoted directly',
      body: (
        <>
          Each compute cluster is independent and shares no compute resources with any other
          cluster — one cluster's load has no effect on another cluster's performance.
        </>
      ),
      duration: 4.8,
      fig: 'each cluster independent — no shared compute, no shared effect',
      Visual: S.RevealIndependentClustersQuote,
    },
    {
      title: 'Reveal: elastic scaling, quoted directly',
      body: (
        <>
          More compute clusters can be allocated, on the fly or ahead of time, onto that exact
          same shared storage underneath — as the number of simultaneous queries rises.
        </>
      ),
      duration: 4.8,
      fig: 'more clusters, same shared storage — added as simultaneous load rises',
      Visual: S.RevealElasticScalingQuote,
    },
    {
      title: 'Predict: does adding more compute clusters make a single slow query run faster?',
      body: (
        <>
          More compute resources are now available on demand. Does throwing more clusters at a
          single slow, heavy query make that one query itself run faster?
        </>
      ),
      duration: 2.8,
      fig: 'more clusters available — does one slow query speed up?',
      predict: {
        options: [
          { label: 'Yes — more compute resources always speed up any query' },
          { label: "No — it's scoped to concurrency, not to one query's own speed", correct: true },
        ],
        explain: (
          <>
            No. More clusters help many queries run side by side without queuing — they don't
            make any single query's own execution faster.
          </>
        ),
      },
      Visual: S.PredictMoreClustersFasterQuery,
    },
    {
      title: "Reveal: the vendor's own disclosed limit, quoted directly",
      body: (
        <>
          Multi-cluster scaling is explicitly for improving concurrency across users and
          queries. It is not, by the vendor's own account, beneficial for speeding up one slow
          query or a data-loading job.
        </>
      ),
      duration: 4.8,
      fig: 'scaling helps concurrency; it does not speed up one slow query by itself',
      takeaway: 'More compute clusters solve queuing from concurrent load, never the runtime of any single query.',
      Visual: S.RevealScalingLimitQuote,
    },
    {
      title: 'Reveal: the noisy-neighbor fix, assembled',
      body: (
        <>
          Give each workload — the batch job, the dashboard, the ad hoc queries — its own
          compute cluster against that same shared storage, and the step-one scenario simply
          can't happen: nothing is shared between them except the data itself.
        </>
      ),
      duration: 4.8,
      fig: 'one cluster per workload, one shared storage layer — nothing left to contend over',
      takeaway: "Isolating workloads onto separate clusters removes contention entirely, without duplicating the data they're reading.",
      Visual: S.RevealNoisyNeighborFix,
    },
    {
      title: 'Predict: is a cache just an optimization with no real cost, since it only ever makes things faster?',
      body: (
        <>
          A compute cluster keeps a cache of the data it has touched. Since a cache only ever
          seems to speed things up, is there any real cost to naming here?
        </>
      ),
      duration: 2.8,
      fig: 'a cache, seemingly all upside — any real cost worth naming?',
      predict: {
        options: [
          { label: "No — a cache has no real downside worth naming" },
          { label: 'Yes — a cache is a deliberate re-coupling, and it can go stale', correct: true },
        ],
        explain: (
          <>
            Yes. A cache quietly re-couples storage and compute, on purpose, for speed — and
            anything re-coupled that way can be lost, which is exactly what happens next.
          </>
        ),
      },
      Visual: S.PredictCacheFreeLunch,
    },
    {
      title: 'Reveal: the cache, quoted directly',
      body: (
        <>
          A running compute cluster maintains a cache of the table data its own queries have
          touched, so later queries can skip rereading that data from storage altogether.
        </>
      ),
      duration: 4.8,
      fig: 'running cluster, caching touched data — later queries skip rereading storage',
      Visual: S.RevealCacheQuote,
    },
    {
      title: "Reveal: the cache's real cost, quoted directly",
      body: (
        <>
          Suspend that same compute cluster, and its cache is dropped entirely. The next
          queries, right after it resumes, run slower again — until the cache rebuilds itself
          from scratch.
        </>
      ),
      duration: 4.8,
      fig: 'suspend the cluster, lose the cache — the next queries pay for it, until it rebuilds',
      takeaway: 'A cache is speed borrowed against staleness risk, and suspending its compute is exactly what collects on that risk.',
      Visual: S.RevealCacheCostQuote,
    },
    {
      title: 'Recap',
      body: (
        <>
          Separation alone removes storage as a shared bottleneck; isolating compute per
          workload is the separate step that actually removes contention. A cache re-couples
          storage and compute on purpose, for speed, and pays for it the moment that compute is
          suspended.
        </>
      ),
      duration: 4.8,
      fig: 'separation, then isolation; a cache re-coupled on purpose, paid for on suspend',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A team wants to save money by aggressively suspending its compute cluster the instant
          it goes idle. What does that decision actually trade away?
        </>
      ),
      duration: 2.8,
      fig: 'suspend the moment it goes idle — what gets traded away?',
      predict: {
        options: [
          { label: 'Nothing — suspending idle compute is purely a cost saving' },
          { label: "Its cache, and the slower queries that follow each resume", correct: true },
        ],
        explain: (
          <>
            Its cache. Every time that cluster suspends, it drops the cache it had built up, so
            the very next queries after each resume pay the rebuild cost the earlier reveal
            named directly — the savings are real, but so is this trade.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
