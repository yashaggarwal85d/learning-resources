import type { Reel, StepCtx } from '../../../../../reels/types';
import * as S from './scenes';

const Q1 = (c: StepCtx) => (
  <S.Quiz
    {...c}
    chips={['N = 50,000,000 rows', 'B = 50 rows per page', '400,000 rows match', 'Unclustered index']}
    work={['Scan: 1,000,000 sequential reads', 'Index: 400,000 random reads', '× r = 4 → 1,600,000']}
  />
);
const Q2 = (c: StepCtx) => (
  <S.Quiz {...c} chips={['4 TiB to sort', 'M = 8 GiB of memory', 'B = 8 MiB blocks']} work={['Pass 1: 512 runs', 'Fan-in up to 1,023 ≥ 512', '→ 2 passes']} />
);
const Q3 = (c: StepCtx) => (
  <S.Quiz {...c} chips={['1 TiB · 64 runs', 'Fan-in up to 16,383', 'Memory cut by 4×']} work={['256 runs', 'Fan-in up to 4,095 ≥ 256', '→ still 2 passes']} />
);

const reel: Reel = {
  steps: [
    {
      title: '2% of the rows. Is the index worth it?',
      body: (
        <>
          <code>orders</code> has 100 million rows on a million pages, and an index on <code>status</code>. You want the 2% that were refunded. 2% sounds
          small, so most engineers reach for the index. Count the page reads and the answer flips.
        </>
      ),
      duration: 3.6,
      Visual: S.Problem,
    },
    {
      title: 'Predict the crossover',
      body: (
        <>
          Say every page read costs the same, and each page holds 100 rows. Up to what share of matching rows does going through the index read fewer
          pages than scanning the whole table?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'About 50%' }, { label: 'About 10%' }, { label: 'About 1%', correct: true }, { label: 'About 0.1%' }],
        explain: <>About 1%: one over the number of rows per page. The next four steps derive it, then show why real storage moves it even lower.</>,
      },
      Visual: S.Seesaw,
    },
    {
      title: 'Only block transfers count',
      body: (
        <>
          The <em>external-memory model</em> (Aggarwal and Vitter, 1988) has a fast memory that holds <b>M</b> items and a slow disk that moves data in
          blocks of <b>B</b> items. Work inside memory is free. The cost of an algorithm is the number of block transfers: its <b>I/Os</b>.
        </>
      ),
      duration: 5,
      Visual: S.Model,
    },
    {
      title: 'Three numbers describe the job',
      body: (
        <>
          <b>N</b> items in the problem, <b>M</b> that fit in memory, <b>B</b> per block. Our table: N = 100,000,000 rows and B = 100 rows per 8 KB page,
          so it spans <b>N/B = 1,000,000 pages</b>.
        </>
      ),
      duration: 3.6,
      Visual: S.Numbers,
    },
    {
      title: 'A full scan costs N/B',
      body: (
        <>
          Reading everything once touches each block once: <b>N/B</b> I/Os, here a million page reads, all sequential. It is the floor for any job that
          must look at all the data, and the yardstick for everything else.
        </>
      ),
      duration: 5,
      Visual: S.Scan,
    },
    {
      title: 'An index pays about one read per row',
      body: (
        <>
          The index finds the matches quickly; its upper levels are almost always cached. But each matching row sits on its own page somewhere in the
          table. Unless the table is stored in index order, every match costs about one random page read: <b>k matches ≈ k I/Os</b> (before caching).
        </>
      ),
      duration: 5.4,
      Visual: S.IndexLookups,
    },
    {
      title: 'They cross at 1/B',
      body: (
        <>
          The scan is flat at N/B. The index climbs one read per matching row. They meet where k = N/B, at a share of <b>1/B</b>: 1% here. At our 2%,
          the index reads twice as many pages. Drag to explore.
        </>
      ),
      duration: 2.2,
      Visual: S.Crossover,
    },
    {
      title: 'Sorted lookups still touch most pages',
      body: (
        <>
          Engines can sort the matches by page and read each page at most once (PostgreSQL's <em>bitmap heap scan</em>). That beats going row by row,
          but with 100 rows per page, 2% of rows land on <b>1 − 0.98¹⁰⁰ ≈ 87%</b> of pages: nearly a full scan's worth of reads, with gaps.
        </>
      ),
      duration: 4,
      Visual: S.PagesTouched,
    },
    {
      title: 'Random reads cost more',
      body: (
        <>
          The model counts every I/O the same; real storage doesn't. A random read waits for a seek, or a new request, while sequential reads stream. If a
          random read costs <b>r</b> sequential ones, the crossover drops to <b>1/(r·B)</b>. PostgreSQL assumes r = 4 by default: 0.25%.
        </>
      ),
      duration: 4,
      Visual: S.RandomCost,
    },
    {
      title: 'Unless the table is in index order',
      body: (
        <>
          If rows are stored in the order of the indexed column, the matches sit next to each other and k matches cost about <b>k/B</b> reads. Then the
          index wins at almost any share. Planners estimate this from a correlation statistic (<code>pg_stats.correlation</code>, from −1 to +1).
        </>
      ),
      duration: 3.8,
      Visual: S.Clustered,
    },
    {
      title: 'Sorting: count passes, not comparisons',
      body: (
        <>
          In memory, sorting costs N log N comparisons. On disk the cost is how many times all the data is read and written. External merge sort writes
          memory-sized sorted runs, then merges up to M/B − 1 runs at once: <b>(N/B) · log<sub>M/B</sub>(N/B)</b> I/Os, which is optimal in the model.
        </>
      ),
      duration: 8.4,
      Visual: S.MergeSort,
    },
    {
      title: 'A terabyte in two passes',
      body: (
        <>
          Sort 1 TiB with 16 GiB of memory and 1 MiB blocks. Pass one writes 64 runs. The merge can take up to 16,383 runs at once, so a single pass
          finishes: <b>2 passes, 4 TiB of I/O</b>. Merging two at a time would take 7 passes. Memory barely matters until runs outnumber the fan-in.
        </>
      ),
      duration: 4.8,
      Visual: S.Terabyte,
    },
    {
      title: 'Every tier has its own B',
      body: (
        <>
          The model works at every level of the hierarchy; only B and the price of a transfer change. CPUs move 64-byte lines, databases 8 KB pages,
          object stores want multi-megabyte ranges because every request waits before its first byte. Count transfers at the tier that dominates.
        </>
      ),
      duration: 3.4,
      Visual: S.Tiers,
    },
    {
      title: 'Back to the query',
      body: (
        <>
          Row by row through the index: 2 million random reads, eight times the scan once r = 4. Sorted lookups touch 87% of the pages out of order. The
          scan reads a million pages in one sweep. The real contest is the bottom two, and that is the call a planner's cost model makes. (PostgreSQL
          picks the sorted lookups here; the Deep dive shows why.)
        </>
      ),
      duration: 3.2,
      Visual: S.Verdict,
    },
    {
      title: 'Prove it · 1 of 3',
      body: (
        <>
          A 50-million-row table, 50 rows per page, an unclustered index. Your query matches 400,000 rows. Index or full scan?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: 'Index' }, { label: 'Full scan' }, { label: 'Depends on the random-read cost', correct: true }],
        explain: (
          <>
            The table is 1,000,000 pages. The index costs about 400,000 random reads: fewer pages, so it wins if random and sequential reads cost the
            same. At r = 4 that's 1,600,000 sequential-read equivalents, and the scan wins.
          </>
        ),
      },
      Visual: Q1,
    },
    {
      title: 'Prove it · 2 of 3',
      body: <>Sort 4 TiB with 8 GiB of memory and 8 MiB blocks. How many passes over the data?</>,
      duration: 1.2,
      predict: {
        options: [{ label: '2', correct: true }, { label: '3' }, { label: '4' }, { label: '12' }],
        explain: <>Pass one writes 4 TiB / 8 GiB = 512 runs. The merge can take up to 8 GiB / 8 MiB − 1 = 1,023 runs at once, so one merge pass finishes: 2 passes.</>,
      },
      Visual: Q2,
    },
    {
      title: 'Prove it · 3 of 3',
      body: <>The 1 TiB sort from before (64 runs, fan-in up to 16,383). Memory is cut to a quarter, 4 GiB. What happens?</>,
      duration: 1.2,
      predict: {
        options: [{ label: 'Still 2 passes', correct: true }, { label: '3 passes' }, { label: 'About 4× slower' }, { label: 'It no longer sorts' }],
        explain: <>256 runs, and the merge can still take up to 4,095 at once: one merge pass, 2 passes. Memory only starts to matter once runs outnumber the fan-in.</>,
      },
      Visual: Q3,
    },
  ],
};

export default reel;
