import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: burn rate one exhausting in exactly
// thirty days; burn rate fourteen point four exhausting in fifty hours; a fixed-window rule's own
// reset time of roughly seven hundred nineteen hours against a multi-window rule's five minutes;
// a ninety percent SLO's one-hour outage consuming only one point four percent of budget; and ten
// false alarms a fixed freshness threshold raises against zero for the schedule-aware version.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A nightly table has a freshness SLO of ninety-nine percent over thirty days. Its source
          goes stale for six hours.
        </>
      ),
      duration: 4.8,
      fig: 'ninety-nine percent over thirty days. Stale for six hours.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does your alert fire in time, and does it also fire every night?',
      body: (
        <>
          Does your alert fire in the first five minutes, after the budget's already gone, or
          never — and does it also fire at four in the morning, every single night, when the table
          is simply waiting for its own scheduled run?
        </>
      ),
      duration: 3.6,
      fig: 'five minutes, budget gone, or never? And every night too?',
      predict: {
        options: [
          { label: 'A simple fixed threshold handles both cases fine' },
          { label: 'A multi-window burn-rate rule catches the outage fast and ignores the expected gap', correct: true },
        ],
        explain: (
          <>
            A fixed threshold can't tell a six-hour stall from a table that's simply waiting for
            its own nightly run — both just look like "too old." A multi-window burn-rate rule
            catches the real outage within minutes, and a separate, schedule-aware check is what
            stops it paging every night for an expected gap.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: symptom-based, not cause-based',
      body: (
        <>
          Alert on what the reader actually experiences, not on every internal cause. Every page
          must be actionable, or the next one gets ignored too.
        </>
      ),
      duration: 4.4,
      fig: 'the symptom, not the cause. Every page, actionable.',
      Visual: S.RevealSymptomBased,
    },
    {
      title: 'Reveal: burn rate',
      body: (
        <>
          How fast, relative to the SLO, the error budget is actually being spent. A burn rate of
          one spends it exactly by the window's own end, thirty days out.
        </>
      ),
      duration: 4.4,
      fig: 'burn rate one. Exactly gone, thirty days from now.',
      Visual: S.RevealBurnRate,
    },
    {
      title: "Reveal: a fixed threshold's two failures",
      body: (
        <>
          A full outage and a tiny one both alert after the same hour — no sense of severity — and
          once it fires, it can keep firing for most of the window that follows.
        </>
      ),
      duration: 4.8,
      fig: 'same detection time either way. Then it won’t stop firing.',
      Visual: S.RevealFixedThresholdFailures,
    },
    {
      title: 'Reveal: the multi-window fix',
      body: (
        <>
          A short window next to the long one, sized at roughly a twelfth of it. The same real
          outage now clears in minutes instead of most of a month.
        </>
      ),
      duration: 4.8,
      fig: 'a short window, a twelfth the length. Minutes, not weeks.',
      Visual: S.RevealMultiWindowFix,
    },
    {
      title: 'Reveal: the recommended thresholds — and their limit',
      body: (
        <>
          Two percent of budget in one hour, five percent in six hours, to page. Ten percent in
          three days, for a ticket. At a low enough target, though, even a complete outage can't
          cross the page threshold at all.
        </>
      ),
      duration: 5.2,
      fig: 'a full outage. Still under the page threshold, by design.',
      takeaway: 'The documented page thresholds aren’t universal — check them against your own SLO before trusting them to ever fire.',
      Visual: S.RevealThresholdsAndLimit,
    },
    {
      title: 'Reveal: schedule-aware freshness',
      body: (
        <>
          A daily table is supposed to look nearly a full day old right before its own run. A
          fixed age threshold pages for that every single night; measuring against the expected
          schedule instead doesn't.
        </>
      ),
      duration: 4.8,
      fig: 'old before its run is normal. A fixed threshold can’t tell.',
      takeaway: 'Freshness has to be measured against the schedule a table actually runs on, not a single fixed age.',
      Visual: S.RevealScheduleAwareFreshness,
    },
    {
      title: 'Reveal: dedup and owner routing',
      body: (
        <>
          One upstream failure can trip signals on everything downstream of it at once. Grouping
          those into a single page, routed to the one team that owns the failure, is what keeps one
          problem from becoming ten pages.
        </>
      ),
      duration: 4.8,
      fig: 'one failure. Ten downstream signals. One page, one owner.',
      Visual: S.RevealDedupOwnerRouting,
    },
    {
      title: 'Reveal: the actionable-page test, applied',
      body: (
        <>
          A short list of candidate alerts, each checked against one question: can a human act on
          this right now? What fails becomes a ticket, or nothing at all.
        </>
      ),
      duration: 4.4,
      fig: 'one question per candidate. Act now, or it isn’t a page.',
      takeaway: 'An alert that nobody can act on right now belongs in a ticket, not a page.',
      Visual: S.RevealActionableTest,
    },
    {
      title: 'Recap',
      body: (
        <>
          Alert on the symptom; a short window next to a long one; a schedule, not a fixed age; one
          page per real incident; and nothing pages unless someone can actually act on it.
        </>
      ),
      duration: 4.8,
      fig: 'the symptom, two windows, a schedule, one page, one action.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A nightly freshness alert correctly fires for a real six-hour outage. The next morning it
          fires again, at the table's own ordinary overnight gap.
        </>
      ),
      duration: 3.4,
      fig: 'fires on the real outage. Fires again on an ordinary night.',
      predict: {
        options: [
          { label: 'Widen the long window so the rule is less sensitive overall' },
          { label: "Make the freshness check schedule-aware, measured against the table's expected run time", correct: true },
        ],
        explain: (
          <>
            Widening the long window would also slow down real detection — the exact failure mode
            this topic opened with. The actual problem is that the alert compares freshness to a
            single fixed age instead of the table's own expected schedule; fixing that is what
            lets it catch the real outage and stay quiet on an ordinary night, both at once.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
