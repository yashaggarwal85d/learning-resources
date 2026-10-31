import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The two layouts' file counts, pruned fractions, and erasure-touch counts are all asserted in
// examples.py's own customer_partitioned_layout(), date_partitioned_layout() and
// erasure_cost_in_partitions_touched(). The storage-limitation and design-by-default claims trace
// to the GDPR's storage-limitation and design-by-default articles, quoted verbatim in SOURCES.md
// and checked step by step in FACT-CHECK.md. No literal digits appear below; the duration numbers
// are exempt.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: one partition choice, two failures a year later',
      body: (
        <>
          The shop partitions its events table by customer id, "for fast lookups." A year later,
          the nightly revenue job is crawling, and legal's request to delete one customer's data
          within thirty days turns into a full rewrite. Both trace back to the same decision.
        </>
      ),
      duration: 4.8,
      fig: 'one partition key, two symptoms a year later — a crawling job, and an expensive deletion request',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which decision would have prevented both symptoms?',
      body: (
        <>
          A bigger cluster could absorb the slow job, and the deletion request looks like a
          separate problem. Or is there one single design-time decision that actually explains
          both?
        </>
      ),
      duration: 2.8,
      fig: 'a bigger cluster, or one earlier decision — which one actually explains both symptoms?',
      predict: {
        options: [
          { label: 'A bigger cluster would absorb the slow job, and the deletion request is a separate, unrelated problem' },
          { label: 'The partition key itself — picked from the dominant access path, not from "lookups" in general', correct: true },
        ],
        explain: (
          <>
            More compute doesn't fix a layout that forces a full-table scan, and the deletion
            difficulty comes from that same layout choice, not from a separate cause. The
            partition key was picked because "lookups" sounded fast, without asking which query
            actually costs the most.
          </>
        ),
      },
      Visual: S.Predict1,
    },
    {
      title: 'Reveal: system of record versus derived stores',
      body: (
        <>
          Every dataset is either the one authoritative copy, the system of record, or it's
          derived from that copy and fully rebuildable. The orders table is the shop's source of
          truth; a daily revenue rollup, computed from it, is derived and disposable.
        </>
      ),
      duration: 4.8,
      fig: 'one authoritative copy, one rebuildable rollup — which one actually needs the careful backup?',
      Visual: S.RevealSystemOfRecord,
    },
    {
      title: 'Reveal: the dominant access path picks the partition key',
      body: (
        <>
          The dominant access path is the one query shape that accounts for most of the cost. The
          shop's nightly revenue job scans by date, not by customer, so the partition key that
          actually matches the workload is date, not the id that merely sounded intuitive.
        </>
      ),
      duration: 4.8,
      fig: 'the nightly job scans by date — does the partition key actually match that path?',
      takeaway: 'The dominant access path picks the partition key — not whatever felt intuitive.',
      Visual: S.RevealAccessPath,
    },
    {
      title: 'Reveal: a table format, picked by its one decisive cost',
      body: (
        <>
          Choosing a table format isn't reinvented per dataset — it follows the same access-path
          reasoning, with the format's interoperability and catalog consequences as the one cost
          that actually decides between otherwise similar options. The file layout follows from
          whichever format that reasoning picks.
        </>
      ),
      duration: 4.8,
      fig: "several formats, one decisive cost each — which one actually decides this shop's choice?",
      Visual: S.RevealTableFormat,
    },
    {
      title: "Reveal: the same query, drawn as a band across two layouts",
      body: (
        <>
          Draw one day's query as a band crossing each layout. Partitioned by customer, the band
          touches nearly every single file. Partitioned by date, the band covers a few files and
          the rest is pruned away entirely, untouched.
        </>
      ),
      duration: 4.8,
      fig: 'the same band, two layouts — how much of the table does each one actually have to touch?',
      Visual: S.RevealBandAcrossLayouts,
    },
    {
      title: 'Reveal: hot, warm and cold tiers, each with its own clock',
      body: (
        <>
          Recent data sits on fast, expensive storage. Older data moves to cheaper storage.
          Oldest data is archived. Each shelf carries its own retention clock — a tier isn't a
          storage label, it's a promise about how long that class of data sticks around.
        </>
      ),
      duration: 4.8,
      fig: 'three shelves, three clocks — what does each one actually promise?',
      takeaway: 'A tier is a retention period attached to a class of data — not a cheaper place for old files.',
      Visual: S.RevealTiers,
    },
    {
      title: 'Reveal: the law names the clock',
      body: (
        <>
          This isn't just an engineering nicety. Data protection law's own "storage limitation"
          principle says personal data can't be kept, in identifiable form, longer than its
          purpose actually requires. The retention clock on each shelf answers a real requirement.
        </>
      ),
      duration: 4.8,
      fig: 'a legal principle, not a convention — why does the retention clock actually have to exist?',
      Visual: S.RevealStorageLimitation,
    },
    {
      title: "Predict: does a customer's layout position change with the partition key?",
      body: (
        <>
          A customer asks to be deleted. On the date-partitioned layout, do their rows sit
          together in one place, or are they scattered across every date partition they ever
          touched?
        </>
      ),
      duration: 2.8,
      fig: 'one customer, many dates — where do their rows actually live under this layout?',
      predict: {
        options: [
          { label: "Scattered across every date partition they ever appeared in — deleting them touches every shelf the layout has", correct: true },
          { label: "Still together in one place, since partitioning by date doesn't change which customer a row belongs to" },
        ],
        explain: (
          <>
            A date partition key groups rows by date, not by customer, so one customer's history
            is scattered across however many days they were ever active. Erasure designed in from
            the start costs choosing a key strategy up front; retrofitted onto this layout, it
            costs rewriting every shelf the data ever touched.
          </>
        ),
      },
      takeaway: 'Erasure designed in costs a key strategy chosen up front — retrofitted, it costs a rewrite.',
      Visual: S.Predict2,
    },
    {
      title: 'Recap',
      body: (
        <>
          Name the system of record before anything else. Let the dominant access path pick the
          partition key, not instinct. Give every tier its own retention clock, backed by a real
          legal requirement. And design erasure in from the start, or pay for it later in a
          rewrite.
        </>
      ),
      duration: 4.8,
      fig: 'one source of truth, a layout that matches the real query, tiers with clocks, and erasure designed in',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A second dataset, session logs, has a dominant access path that's a point lookup by
          session id, not a date range. What does that change about the partition key, and does
          the same erasure problem still show up?
        </>
      ),
      duration: 2.8,
      fig: 'a point lookup by session id, not a date range — what partition key actually fits now?',
      predict: {
        options: [
          {
            label: "Partition by session id instead, and the same erasure cost appears if a user's sessions are scattered across many session-id partitions rather than keyed together",
            correct: true,
          },
          { label: "A point-lookup access path means partitioning doesn't matter at all, since an index handles it" },
        ],
        explain: (
          <>
            An index helps a point lookup find the right row quickly, but it doesn't change
            whether the partition layout itself groups a user's rows together or scatters them.
            The same access-path reasoning applies: match the key to what the query actually
            touches, and ask separately whether that same key groups one person's data together.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
