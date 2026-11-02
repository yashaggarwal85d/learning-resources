import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The amplification factors for all three serving options are asserted in examples.py's own
// real_time_olap_option(), clustering_key_option() and pre_aggregated_table_option(). The
// single-node design-lineage and derived-views claims trace to DuckDB's own documentation and
// Kleppmann's talk abstract, quoted verbatim in SOURCES.md and checked step by step in
// FACT-CHECK.md. No literal digits appear below; the duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: one slow query, three proposed fixes",
      body: (
        <>
          The shop's dashboard query takes eight seconds on the warehouse. One proposal moves it
          to a real-time OLAP store. Another builds a nightly pre-aggregated table. A third,
          from an engineer who read the capacity estimate, just adds a two-line clustering key.
        </>
      ),
      duration: 4.8,
      fig: 'one slow query, three fixes on the table — which one is cheapest, and which one is fastest?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which fix is cheapest, fastest, and which breaks tomorrow?',
      body: (
        <>
          The real-time OLAP store sounds like the obviously right tool for this exact job. Is it
          actually the cheapest option, or is there a fix that costs less and still holds up when
          the question itself changes?
        </>
      ),
      duration: 2.8,
      fig: "the purpose-built store, or a two-line fix — which one actually survives tomorrow's question?",
      predict: {
        options: [
          { label: 'The real-time OLAP store always wins, since it was built for exactly this kind of query' },
          { label: "The clustering-key fix is cheapest and often fast enough, but the pre-aggregated table is the one that breaks when the breakdown changes", correct: true },
        ],
        explain: (
          <>
            The real-time OLAP store is also the most expensive and operationally heaviest of the
            three options — reaching for the newest tool isn't the same as reaching for the
            cheapest one. The pre-aggregated table answers fastest today, but it's fixed in shape:
            the moment the question itself changes, it has to be rebuilt from scratch.
          </>
        ),
      },
      Visual: S.Predict1,
    },
    {
      title: 'Reveal: three real drivers for an engine choice',
      body: (
        <>
          Does the computation's own state fit in memory, or does it need a real state backend?
          What's the latency floor the chosen data-flow shape already set? And can the team
          actually operate and debug this engine when it breaks at two in the morning?
        </>
      ),
      duration: 4.8,
      fig: 'state size, latency floor, team skill — which of the three actually decides this choice?',
      Visual: S.RevealEngineDrivers,
    },
    {
      title: 'Reveal: team skill as a real, counted cost',
      body: (
        <>
          An engine nobody on call can actually debug isn't a footnote to worry about later —
          it's a real cost, measured in the same units as latency and compute cost. A system that
          nobody can safely operate costs more, not less, however fast it looks on a benchmark.
        </>
      ),
      duration: 4.8,
      fig: 'latency and compute already get counted — does team skill actually deserve the same treatment?',
      takeaway: 'An engine nobody on call can debug is a real cost — not an afterthought.',
      Visual: S.RevealTeamSkillCost,
    },
    {
      title: 'Reveal: a serving store follows the shape of the question',
      body: (
        <>
          A point lookup wants a key-value store. A slice-and-aggregate question wants a columnar
          store. A full-text question wants a search index. A similarity question wants a vector
          index. The store follows what's actually being asked, not what the data looks like.
        </>
      ),
      duration: 4.8,
      fig: 'four different questions — does each one actually get its own matching store, or one store for all?',
      Visual: S.RevealQuestionShapeToStore,
    },
    {
      title: 'Reveal: one dataset, three serving stores at once',
      body: (
        <>
          The shop's own order data gets served three separate ways at once, each one tagged
          clearly as derived. None of the three is the system of record itself — that's still the
          one orders table everything else is computed from.
        </>
      ),
      duration: 4.8,
      fig: 'three serving stores for one dataset — which one of the three is actually the source of truth?',
      takeaway: 'A serving store follows the shape of the question, not the shape of the data.',
      Visual: S.RevealOneDatasetThreeStores,
    },
    {
      title: 'Reveal: pre-aggregation trades compute at write for compute at read',
      body: (
        <>
          Answer the same query two ways. A pre-aggregated table answers instantly, but it's
          stale-bounded and fixed in shape. On-query compute is flexible and always fresh, but it
          costs something at every single read, not once up front.
        </>
      ),
      duration: 4.8,
      fig: "instant but stale, or fresh but costly every time — which one actually fits this query's own habits?",
      Visual: S.RevealPreaggVsOnQuery,
    },
    {
      title: 'Reveal: the amplification ledger',
      body: (
        <>
          Start from the logical bytes a design actually needs. Multiply by replication. Multiply
          again by whatever rewriting or compaction the design requires. What's left, summed up,
          is the physical bytes a design really moves — not its logical volume.
        </>
      ),
      duration: 4.8,
      fig: 'logical bytes, replication, rewrite and compaction — what does the stack actually sum to?',
      Visual: S.RevealAmplificationLedger,
    },
    {
      title: 'Reveal: the surprising multiplier',
      body: (
        <>
          The pre-aggregated table looks tiny on its own — it's a small table. But rebuilding it
          from scratch means scanning the entire base table every single night. Counted honestly,
          its physical cost dwarfs its own apparent size.
        </>
      ),
      duration: 4.8,
      fig: 'the smallest-looking table on paper — does its real, counted cost actually match that size?',
      takeaway: 'Compare designs by their amplified I/O — logical volume alone hides the real cost.',
      Visual: S.RevealSurprisingMultiplier,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three real drivers pick the engine: state size, latency, and whether the team can
          operate it. The question's own shape picks the serving store. Repetition and freshness
          pick pre-aggregation versus on-query compute. And the amplification ledger prices every
          option honestly, in physical bytes, not logical ones.
        </>
      ),
      duration: 4.8,
      fig: 'three engine drivers, a question-to-store map, a pre-agg trade-off, and one honest ledger',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          The executives ask for a new breakdown tomorrow. Which of the three original fixes
          actually survives that change untouched, and what does the amplification ledger say
          about the one that does?
        </>
      ),
      duration: 2.8,
      fig: 'a new breakdown, asked tomorrow — which fix survives it, and which one has to start over?',
      predict: {
        options: [
          {
            label: 'The clustering-key fix survives untouched, since it computes the new breakdown on demand at the cost the ledger already counted',
            correct: true,
          },
          { label: 'The pre-aggregated table survives fine too, since adding a breakdown is just adding a column' },
        ],
        explain: (
          <>
            The clustering-key fix computes any breakdown on demand, at the same cost already sitting
            in the ledger — nothing about the question changing breaks it. The pre-aggregated table
            usually needs a new grouping key for a genuinely new breakdown, which means rebuilding the
            whole aggregate from scratch, not just adding a column to an existing one.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
