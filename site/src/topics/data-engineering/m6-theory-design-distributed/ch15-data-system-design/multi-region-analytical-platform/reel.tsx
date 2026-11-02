import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The egress calculation, the replicate-vs-federate decision, the
// failover completeness check, and the stalest-region freshness rule
// are asserted in examples.py's own daily_egress_cost(),
// replicate_vs_federate(), failover_plan_is_complete() and
// global_metric_freshness(). The GDPR and AWS claims trace to GDPR's
// own articles and AWS's own docs, quoted in SOURCES.md and checked
// step by step in FACT-CHECK.md. No literal digits appear below.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a weekend replication crosses a border",
      body: (
        <>
          The US team replicates the shop's whole events lake to the EU "for performance" over a
          weekend. Monday, the privacy officer asks which EU customers' data is now in the US.
          Separately, the EU region's catalog database fails, and the replicated buckets have no
          usable table metadata.
        </>
      ),
      duration: 5.0,
      fig: "a bucket crossing a border with no gate, a second bucket missing its catalog",
      Visual: S.Hook,
    },
    {
      title: "Predict: which two decisions would have prevented both?",
      body: (
        <>
          One decision, made at design time, for the privacy question. A different one for the
          catalog. Which two, and what does each cost?
        </>
      ),
      duration: 4.6,
      predict: {
        options: [
          { label: "a faster replication tool, since the problem was really about speed" },
          {
            label: "a per-dataset residency rule for the first, and a catalog backup-and-restore plan as part of failover for the second",
            correct: true,
          },
        ],
        explain: (
          <>
            The privacy problem is which rows crossed the border at all, not how fast they did —
            a faster tool makes an impermissible transfer happen faster. Bucket replication never
            copies the catalog database, so failover needs its own plan for it.
          </>
        ),
      },
      fig: "a faster tool fixes nothing; the real fixes are a placement rule and a catalog plan",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the placement decision",
      body: (
        <>
          Every dataset gets tagged by classification. EU personal data stops at the border — a
          closed gate. A de-identified aggregate crosses freely. Global reference data starts on
          both sides.
        </>
      ),
      duration: 5.0,
      fig: "datasets as chips sliding to their allowed side; one chip stops at a gate",
      Visual: S.RevealPlacement,
    },
    {
      title: "Reveal: replicate vs federate, priced",
      body: (
        <>
          Replicating a dataset costs its size, times the egress rate, every day. Federating a
          query costs nothing standing, but every query still crosses the border on its own.
          Priced against the shop's own volumes, the cheaper path depends on the query.
        </>
      ),
      duration: 5.0,
      takeaway: "Replication and federation are each a cost computed from the query, not a default choice.",
      fig: "a thick recurring egress arrow against thin per-query arrows, both priced",
      Visual: S.RevealPriced,
    },
    {
      title: "Reveal: the aggregates-only compromise",
      body: (
        <>
          Replicate the de-identified aggregate, never the rows. A paid, SLA-backed service
          bounds the lag to minutes — a real, known cost in exchange for a real, known promise,
          not an unbounded best-effort copy.
        </>
      ),
      duration: 4.8,
      fig: "an aggregate chip replicating freely, with a bounded, paid lag drawn alongside it",
      Visual: S.RevealAggregateCompromise,
    },
    {
      title: "Reveal: failover beyond bucket replication",
      body: (
        <>
          A region goes down. The bucket survives — it was replicated. The catalog database, the
          encryption keys, and the pipelines' checkpoints do not, because bucket replication never
          touched any of them.
        </>
      ),
      duration: 5.0,
      takeaway: "Bucket replication alone is not failover; the catalog, the keys and the pipeline state each need their own plan.",
      fig: "a failure strip: the bucket survives, the catalog and keys are missing, in red",
      Visual: S.RevealFailoverGaps,
    },
    {
      title: "Reveal: RPO and RTO per data class",
      body: (
        <>
          Orders, events, and aggregates each get a named recovery point and recovery time —
          stated up front, as part of the design, not bolted on after the failover plan is
          already built.
        </>
      ),
      duration: 4.6,
      fig: "two clocks per data class, tied to the shop's own failure-table method",
      Visual: S.RevealRpoRto,
    },
    {
      title: "Reveal: one consistent global number",
      body: (
        <>
          Regional partials for "global revenue" combine into one figure. That figure is only as
          fresh as its slowest region's last update — stated plainly, not hidden behind a single
          clean-looking number.
        </>
      ),
      duration: 4.8,
      takeaway: "A global figure carries the freshness of its stalest region; a cross-region counter costs a round trip.",
      fig: "one global number, its own clock pinned to the slowest region's clock",
      Visual: S.RevealStalestRegion,
    },
    {
      title: "Recap",
      body: (
        <>
          A placement gate by dataset tag. A priced replicate-versus-federate decision. A
          failover plan that covers the catalog and the keys, not just the bucket. And one global
          number, honest about which region it's waiting on.
        </>
      ),
      duration: 4.8,
      fig: "the gate, the price card, the failover plan, and the stalest-region number",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a third region, mid-backfill",
      body: (
        <>
          The shop opens a third region. A query needs "global revenue including the new region"
          the same minute that region's pipeline is still backfilling its first week of history.
          What does the number say?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          {
            label: "exclude the new region from the figure until its backfill finishes, and say so plainly",
            correct: true,
          },
          { label: "include it immediately, blending its partial, catching-up numbers in unmarked" },
        ],
        explain: (
          <>
            Blending an unmarked partial number breaks the stalest-region promise by hiding which
            part of the figure is still catching up. Excluding it and saying so keeps the figure
            honest about what it does and doesn't yet cover.
          </>
        ),
      },
      fig: "a new region mid-backfill; the honest figure excludes it and says why",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
