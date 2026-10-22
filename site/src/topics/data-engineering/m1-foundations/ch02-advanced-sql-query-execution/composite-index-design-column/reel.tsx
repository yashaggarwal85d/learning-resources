import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Running example: PostgreSQL 16.15 (the existing "shop" database, topics 23-27) and PostgreSQL
// 18.6 (installed fresh in topic 27), side by side on this sandbox. Every number below is in
// examples.py and SOURCES.md ("Measured directly").

const reel: Reel = {
  steps: [
    {
      title: 'Two indexes, same two columns, a 364x gap',
      body: (
        <>
          Same table, same query, two indexes covering the exact same two columns. One answers it in 6 buffer reads. The other reads 2,184 buffers
          for the identical result.
        </>
      ),
      duration: 4.8,
      fig: '6 buffers vs. 2,184 buffers — same columns, same query',
      Visual: S.Hook,
    },
    {
      title: 'Predict: why would the same two columns cost so differently?',
      body: (
        <>
          Both indexes index columns <code>a</code> and <code>b</code>. Neither one is missing anything the query needs. Why would reading the same
          data through them cost so differently?
        </>
      ),
      duration: 2.4,
      fig: 'same two columns — different order',
      predict: {
        options: [
          { label: 'One index is simply corrupted' },
          { label: 'The column order inside each index differs', correct: true },
          { label: 'PostgreSQL picked a worse query plan for one of them' },
        ],
        explain: (
          <>
            The column order differs — one index is built <code>(a, b)</code>, the other <code>(b, a)</code>. Both runs forced sequential scanning
            off, so this is genuinely index order against index order, not a planner mistake.
          </>
        ),
      },
      Visual: S.PredictWhyDiffer,
    },
    {
      title: 'Reveal: equality constraints on leading columns narrow the scan',
      body: (
        <>
          An equality constraint on a leading column limits the scanned range tightly. A range constraint on that same column, if it's leading
          instead, limits it far less. Lead with the equality column, and the scan narrows to almost nothing.
        </>
      ),
      duration: 4.8,
      fig: '(a, b) leads with equality: 6 buffers. (b, a) leads with the range: 2,184 buffers.',
      Visual: S.RevealEqualityLeads,
    },
    {
      title: 'Reveal: selectivity is why',
      body: (
        <>
          Column <code>a</code> has 1,000 distinct values; an equality match on it rules out 999 of every 1,000 rows before the scan even starts.
          Column <code>b</code> has 100,000 distinct values; as a range, the same kind of filter rules out far less per leading position.
        </>
      ),
      duration: 4.4,
      fig: '1,000 distinct values vs. 100,000 — selectivity decides the narrowing',
      takeaway: 'An equality constraint on a leading column narrows a B-tree scan far more than a range constraint there.',
      Visual: S.RevealSelectivity,
    },
    {
      title: 'Predict: does column order matter for ORDER BY too?',
      body: (
        <>
          The same <code>(a, b)</code> index exists. Does <code>ORDER BY a, b</code> and <code>ORDER BY b, a</code> cost the same to satisfy against
          it?
        </>
      ),
      duration: 2.4,
      fig: 'ORDER BY a, b vs. ORDER BY b, a — same index',
      predict: {
        options: [
          { label: 'Yes — it is still one index either way' },
          { label: 'No — only one of those orders matches what the index stores', correct: true },
        ],
        explain: (
          <>
            No — a B-tree index stores one physical order. <code>ORDER BY a, b</code> matches it directly; <code>ORDER BY b, a</code> doesn't, no
            matter which index exists.
          </>
        ),
      },
      Visual: S.PredictOrderBy,
    },
    {
      title: 'Reveal: a matched order skips sorting; a mismatch forces one',
      body: (
        <>
          <code>ORDER BY a, b LIMIT 10</code> against the <code>(a, b)</code> index: a plain scan, no sort step, 0.095 milliseconds.{' '}
          <code>ORDER BY b, a LIMIT 10</code>, same index: a full parallel scan feeding an explicit sort, 177.6 milliseconds.
        </>
      ),
      duration: 4.8,
      fig: 'matched order: 0.095 ms, no sort. mismatched order: 177.6 ms, full sort.',
      takeaway: 'An index satisfies ORDER BY only in the order it stores; any other order falls back to a sort.',
      Visual: S.RevealSortMatch,
    },
    {
      title: 'Reveal: LIMIT makes getting this wrong worse',
      body: (
        <>
          With a matched order, the first 10 rows come straight off the index — nothing else is ever read. With a mismatched order, every row has
          to be sorted before the first 10 can be identified at all, regardless of how small that <code>LIMIT</code> is.
        </>
      ),
      duration: 4.4,
      fig: 'LIMIT 10: read 10 rows, or sort all 2,000,000 first',
      Visual: S.RevealLimitAmplifies,
    },
    {
      title: 'Predict: can an index help with no predicate on its leading column?',
      body: (
        <>
          A query filters only on a composite index's second column — nothing at all on the first. Before PostgreSQL 18, can that index help this
          query?
        </>
      ),
      duration: 2.4,
      fig: 'WHERE y = 770000, index on (x, y), nothing on x',
      predict: {
        options: [
          { label: 'No — the index cannot be used at all before PostgreSQL 18' },
          { label: 'Yes, but inefficiently — the whole index still gets scanned', correct: true },
        ],
        explain: (
          <>
            Yes, inefficiently — pre-18 PostgreSQL still uses the index here, as an <code>Index Only Scan</code>, but has to walk the entire thing,
            since nothing narrows where in it to start.
          </>
        ),
      },
      Visual: S.PredictLeadingMissing,
    },
    {
      title: 'Reveal: PostgreSQL 16 scans the whole index regardless',
      body: (
        <>
          Run that exact query on PostgreSQL 16.15: 5,468 buffers, 40.896 milliseconds — reading essentially the whole index to find matches for a
          predicate that only constrains the second column.
        </>
      ),
      duration: 4.4,
      fig: '5,468 buffers, 40.896 ms — the whole index, one column constrained',
      Visual: S.RevealPg16FullScan,
    },
    {
      title: 'Reveal: PostgreSQL 18’s B-tree skip scan',
      body: (
        <>
          The identical query, identical index, identical data, on PostgreSQL 18.6: 40 buffers, 0.198 milliseconds — and the plan itself reports{' '}
          <code>Index Searches: 12</code>, roughly one re-search per distinct value the leading column actually has.
        </>
      ),
      duration: 4.8,
      fig: '40 buffers, 0.198 ms, Index Searches: 12 — same query, same index, new version',
      Visual: S.RevealSkipScan,
    },
    {
      title: 'Reveal: skip scan only pays off with few leading values',
      body: (
        <>
          This measurement's leading column had 10 distinct values — few enough that repeating the search 12 times beats reading the whole index.
          With many distinct leading values, that trade flips, and scanning the whole index wins instead.
        </>
      ),
      duration: 4.4,
      fig: '10 distinct values made 12 re-searches worth it',
      Visual: S.RevealSkipScanLimit,
    },
    {
      title: 'Predict: is adding an index ever free?',
      body: (
        <>
          Every index measured so far has sped up some query. Does adding one ever come at no cost at all?
        </>
      ),
      duration: 2,
      fig: 'does an index ever cost nothing?',
      predict: {
        options: [
          { label: 'Yes, once it is built, it is free' },
          { label: 'No — every index adds real, ongoing overhead', correct: true },
        ],
        explain: (
          <>
            No — PostgreSQL's own documentation states it plainly: the system keeps every index synchronized with the table on every change, which
            is work a table with fewer indexes never pays.
          </>
        ),
      },
      Visual: S.ProveIndexFree,
    },
    {
      title: 'Reveal: the measured write and storage cost',
      body: (
        <>
          Loading 500,000 identical rows: 1,084 milliseconds with no indexes, 5,190 milliseconds with three single-column indexes — about 4.8 times
          slower. Those three indexes add 13 megabytes on disk, on top of the table's own 37.
        </>
      ),
      duration: 4.8,
      fig: '0 indexes: 1,084 ms. 3 indexes: 5,190 ms, +13 MB — for writes that read none of them yet',
      takeaway: 'Every index is synchronized on every write; three extra indexes here cost 4.8 times the insert time.',
      Visual: S.RevealWriteCost,
    },
    {
      title: 'Recap',
      body: (
        <>
          Lead a composite index with its most selective, equality-matched column. Match its column order to the query's own ORDER BY, or pay for
          a sort. Before PostgreSQL 18, a missing leading predicate meant scanning the whole index; skip scan narrows that, but only when the
          leading column has few distinct values. And PostgreSQL's own guidance stands: used sparingly, and rarely past three columns.
        </>
      ),
      duration: 4.8,
      fig: 'lead with selectivity → match ORDER BY → skip scan helps, selectively → every index costs writes',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A composite index is built as <code>(region, order_date)</code>. A report runs <code>WHERE order_date BETWEEN '2026-01-01' AND
          '2026-01-31' AND region = 'west'</code>. Is this index's column order well matched to that query?
        </>
      ),
      duration: 2.8,
      fig: '(region, order_date): equality on region, range on order_date',
      predict: {
        options: [
          { label: 'Yes — the columns match what the query needs' },
          { label: 'No — the equality column, region, should lead instead', correct: true },
        ],
        explain: (
          <>
            No — <code>region</code> is the equality constraint here; leading with it narrows the scan the way this topic's own 364x measurement
            showed. As built, the range constraint on <code>order_date</code> leads, which narrows far less.
          </>
        ),
      },
      Visual: S.ProveOrderMatch,
    },
  ],
};

export default reel;
