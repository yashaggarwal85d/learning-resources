import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py: a MAR-style bill computed
// for a small, fully reprocessed table against a much larger, rarely touched one under the
// identical billing rule; the identical set of keys billed once whether updated once or twenty
// times in the same month; a drifted record met by dlt's own four schema-contract modes in
// turn; a direct count of the named failure modes this chapter's own topics each solved by
// hand; and a build-versus-buy rule applied to three concrete scenarios.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A managed pipeline's monthly bill triples after what looked like a routine backfill.
          The table's own row count barely moved — every re-touched row simply counted as
          active again.
        </>
      ),
      duration: 4.8,
      fig: "a routine backfill triples a managed pipeline's bill; the row count barely moved.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: which table costs more',
      body: (
        <>
          Two tables get an identical backfill this month: a small table with every row
          rewritten once, and a much larger table that almost never changes. Under a
          per-active-row pricing model, which one costs more?
        </>
      ),
      duration: 2.8,
      fig: 'an identical backfill hits a small table and a much larger one. Which costs more under MAR pricing?',
      predict: {
        options: [
          { label: 'The larger table, because it simply has more rows in total' },
          { label: 'The smaller table, because the backfill touches every one of its rows while the larger table stays mostly untouched', correct: true },
        ],
        explain: (
          <>
            Monthly active row pricing bills only the rows actually touched in the billing
            period, never the table's total size. A backfill that rewrites every row of a small
            table touches far more of it, proportionally, than an ordinary month's trickle of
            changes touches a much larger one.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: how a key gets billed at all',
      body: (
        <>
          A key is counted the moment it's touched this month, and never again for the rest of
          the month, no matter how many more times it changes before the month ends.
        </>
      ),
      duration: 4.8,
      fig: "a key is counted once it's touched this month, no matter how many more times it changes.",
      Visual: S.RevealKeyBilling,
    },
    {
      title: 'Reveal: the two tables, measured',
      body: (
        <>
          Run directly against the mock billing model: a small table's full-reprocess backfill
          against a much larger table's ordinary trickle of changes, both billed by the
          identical rule.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a small, fully reprocessed table against a huge, rarely touched one, billed by the identical rule.',
      takeaway: 'A key bills once a month — a small, fully reprocessed table can cost more than a huge, quiet one.',
      Visual: S.RevealMarMeasured,
    },
    {
      title: 'Reveal: four ways to meet a new column',
      body: (
        <>
          The identical drifted record can be met four different ways: let it through, reject
          the whole batch, drop just the bad row, or drop just the bad field.
        </>
      ),
      duration: 4.8,
      fig: 'the identical new column, met four different ways: let it through, reject it, drop the row, drop the value.',
      Visual: S.RevealDriftModes,
    },
    {
      title: 'Reveal: all four modes, measured',
      body: (
        <>
          Run directly against the mock: the identical row with its new field, met in turn by
          evolve, freeze, discard-row and discard-value.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: the identical drifted record met by all four modes in turn.',
      takeaway: 'Evolve accepts everything, freeze rejects everything — discarding a row or a value trades one loss for a smaller one.',
      Visual: S.RevealDriftMeasured,
    },
    {
      title: 'Reveal: what a hand-built connector actually owns',
      body: (
        <>
          This chapter's own topics each solved one named failure mode by hand: cursor misses,
          pagination under concurrent writes, rate limits, token rotation, commit protocols,
          checkpoint atomicity, raw-layer metadata.
        </>
      ),
      duration: 4.8,
      fig: "a dozen named problems this chapter's own topics each solved by hand — a managed tool's real price.",
      Visual: S.RevealFailureModeList,
    },
    {
      title: 'Reveal: the failure-mode count, measured',
      body: (
        <>
          Counted directly: a dozen distinct problems, from a skewed parallel read all the way
          to a raw layer's own replay metadata, each one a separate thing a hand-built connector
          has to get right on its own.
        </>
      ),
      duration: 4.8,
      fig: 'the real count: twelve distinct problems, from parallel reads to raw-layer metadata.',
      takeaway: "A managed tool's price is a dozen solved problems — is your source common enough that someone already solved them?",
      Visual: S.RevealFailureModeMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          The MAR pricing rule, the four schema-contract modes, and the dozen failure modes,
          side by side with the one decision they all feed into.
        </>
      ),
      duration: 4.8,
      fig: 'MAR pricing, the four drift modes, and the dozen failure modes — all feeding one decision.',
      takeaway: 'What a tool bills, how it handles drift, and what it already solved are the three inputs to build-versus-buy.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new source shows up: a proprietary, regulated feed from a core banking system, low
          volume, with a strict data-sovereignty requirement. Build, or buy?
        </>
      ),
      duration: 2.8,
      fig: 'a regulated, low-volume, sovereignty-constrained source shows up. Build or buy?',
      predict: {
        options: [
          { label: "Buy — the volume is low enough that a managed tool's price would be small" },
          { label: 'Build — the sovereignty requirement overrides every other factor in the decision', correct: true },
        ],
        explain: (
          <>
            Low volume makes a managed tool cheap, but it never addresses where the data is
            allowed to travel. A sovereignty requirement rules out a managed, often
            cross-border, tool regardless of price or volume, so it overrides every other factor
            before they're even weighed.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
