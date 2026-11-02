import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The failure-table and poison-record simulations are asserted in examples.py's own
// rows_with_empty_recovery(), price_data_class() and the two degraded-mode functions. The
// cascading-failure and retry/backoff mechanics trace to the Google SRE book and the AWS
// Architecture Blog, quoted verbatim in SOURCES.md and checked step by step in FACT-CHECK.md.
// No literal digits appear below; the duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the dashboard says fine, the partition says otherwise',
      body: (
        <>
          One partition of an order pipeline crash-loops on a single malformed record, over and
          over, in the middle of the night. Every other partition keeps going. The dashboard,
          averaged across all of them, still reads "100% of orders processing fine."
        </>
      ),
      duration: 4.8,
      fig: 'a five-partition strip, one stuck and restarting, the averaged dashboard unmoved',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what actually ends the crash loop?',
      body: (
        <>
          The bad record keeps failing the same way on every retry. Nothing about the pipeline's
          own logic changes between attempts. So what stops it?
        </>
      ),
      duration: 4.2,
      predict: {
        options: [
          { label: 'the pipeline eventually catches the bad record itself and skips past it' },
          {
            label: "a human notices the one partition's own metric and manually quarantines the record",
            correct: true,
          },
        ],
        explain: (
          <>
            A deterministic parse failure repeats identically on every retry when there's no
            separate path for it. Without a dead-letter queue, nothing inside the pipeline's own
            logic changes between attempts — only someone watching a narrower signal than the
            averaged dashboard, and acting on it, ends the loop.
          </>
        ),
      },
      fig: 'which of these actually breaks the loop, given no dead-letter path exists yet?',
      Visual: S.Predict1,
    },
    {
      title: 'Reveal: a failure, named, radius, detection, recovery, loss, time',
      body: (
        <>
          A failure table has six columns: the failure, its blast radius, how it's detected, how
          it recovers, what data is lost, and how long recovery takes. Filling in the stuck
          partition's row starts with what actually happened.
        </>
      ),
      duration: 5.2,
      fig: 'the five-partition strip turns into a table, filled in row by row for this failure',
      Visual: S.RevealFailureTable,
    },
    {
      title: 'Reveal: blast radius is a failure domain, not a dashboard',
      body: (
        <>
          The dashboard's own blast radius buries one partition's crash inside a system-wide
          average. The real blast radius is scoped to what actually shares the failure: one
          partition's worth of orders, delayed for as long as the loop runs.
        </>
      ),
      duration: 4.6,
      takeaway: 'Blast radius is scoped to what shares a failure domain, not to what shares a dashboard.',
      fig: "the dashboard's buried radius next to the real, narrower one",
      Visual: S.RevealBlastRadius,
    },
    {
      title: 'Reveal: an empty recovery cell is the finding',
      body: (
        <>
          With no dead-letter path, the recovery column for this row stays empty — the only
          recovery is a human who happens to notice. Add a dead-letter queue, and the same row's
          recovery cell fills in.
        </>
      ),
      duration: 4.8,
      fig: "the poison-record row's empty recovery cell next to the same row with a dead-letter queue",
      Visual: S.RevealRecoveryGap,
    },
    {
      title: 'Reveal: RPO and RTO are two different numbers',
      body: (
        <>
          RPO asks how much data a class can afford to lose. RTO asks how long it can afford to
          stay down. They sound like one dial, but each is priced separately, and tightening one
          doesn't tighten the other for free.
        </>
      ),
      duration: 4.8,
      takeaway: "RPO and RTO are two different numbers, each priced on its own — tightening one doesn't tighten the other.",
      fig: 'two bars, data loss and downtime, each tightened on its own cost curve',
      Visual: S.RevealRpoRto,
    },
    {
      title: 'Reveal: RPO and RTO are set per data class',
      body: (
        <>
          The order table, the clickstream, and the audit log on the same pipeline don't need the
          same bar. The audit log's RPO sits near zero; the clickstream's can afford to be loose,
          for a fraction of the cost.
        </>
      ),
      duration: 5.0,
      fig: 'three data classes, each with its own RPO and RTO bar, priced separately',
      Visual: S.RevealRpoRtoPerClass,
    },
    {
      title: 'Reveal: two degraded modes, two different trades',
      body: (
        <>
          Under overload, a dead-letter mode keeps every record but delays the poisoned ones. A
          freshness-flag mode keeps serving but goes stale. Neither is free; each one names, up
          front, exactly what it gives up.
        </>
      ),
      duration: 4.8,
      takeaway: 'A degraded mode is a designed trade, not an accident of what happened to keep working.',
      fig: 'two degraded modes side by side, each labeled with what it gives up',
      Visual: S.RevealDegradedModes,
    },
    {
      title: 'Recap',
      body: (
        <>
          A failure table finds the gap between a failure and its recovery. RPO and RTO price
          that recovery, per data class. Degraded modes are the designed fallback. Disaster
          recovery mechanics and game days are the next chapter's own subject, not this one's.
        </>
      ),
      duration: 4.6,
      fig: 'the failure table, the priced RPO/RTO bars, and the two degraded modes, side by side',
      Visual: S.Recap,
    },
    {
      title: 'Prove it: a different failure, the same table',
      body: (
        <>
          A second pipeline loses its entire message broker, not one partition. Does the same
          five-column failure table still find the gap, or does a new kind of failure need its
          own analysis from scratch?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: 'no — a broker loss is a different kind of failure and needs its own analysis from scratch' },
          {
            label: 'yes — the same five columns apply to any failure; filling them in for this one finds the gap the same way',
            correct: true,
          },
        ],
        explain: (
          <>
            The failure table's five columns don't depend on what kind of failure it is. Filling
            them in for a broker loss surfaces whatever gap exists — an empty recovery cell, a
            blast radius wider than assumed — the same way it did for the poison record.
          </>
        ),
      },
      fig: 'a broker-loss row, the same five columns, filled in the same way',
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
