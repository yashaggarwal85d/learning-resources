import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every value shown is computed and asserted in examples.py on a 1000-row dataset, 10 row groups
// of 100 rows, 4 pages of 25 rows per row group. A query for 250 to 270 reads 1 of 10 row groups
// sorted (9 skipped) vs 10 of 10 shuffled (0 skipped), and 1 of 4 pages within the surviving row
// group. A real split-block Bloom filter (1024 blocks, 26,214 keys, built from the spec's own
// block/mask pseudocode) measures a 1.25% false-positive rate over 50,000 checks, against the
// spec's own stated example of "around 1.26%" for the identical configuration. A truncated-max
// bug ('B' instead of the correct 'C') is reproduced causing a real matching row to be skipped.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          The same 1000 rows, written sorted and shuffled, 10 row groups of 100 rows each — one
          selective query, two very different amounts of data read.
        </>
      ),
      duration: 4.4,
      fig: '1000 rows, 10 row groups, sorted vs shuffled — the same query against both.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: how many of 10 row groups get skipped?',
      body: (
        <>
          Every row group carries its own min and max. For a query asking for 250 to 270, how many
          of the 10 row groups can be skipped entirely?
        </>
      ),
      duration: 3.4,
      fig: 'a query for 250 to 270, against 10 row groups each with their own min-max.',
      predict: {
        options: [
          { label: 'Most of them — only one can possibly match', correct: true },
          { label: 'None — every row group has to be opened to check' },
        ],
        explain: (
          <>
            If a row group's own max is below 250, or its own min is above 270, no row inside it
            can possibly match — no need to open it.
          </>
        ),
      },
      Visual: S.PredictRowGroups,
    },
    {
      title: 'Reveal: 9 of 10 row groups skipped, sorted',
      body: (
        <>
          Only row group 2 — values 200 to 299 — can hold 250 to 270. The other 9 are provably out
          of range from their own min and max alone.
        </>
      ),
      duration: 4.4,
      fig: "row group 2's own min-max, 200 to 299 — the only row group that can match.",
      Visual: S.RevealSortedSkip,
    },
    {
      title: 'Reveal: the same query, shuffled, skips nothing',
      body: (
        <>
          Shuffle the same column first, and every row group's min and max spans nearly the whole
          range — statistics prune nothing at all.
        </>
      ),
      duration: 4.2,
      fig: 'the identical query, run against a shuffled version of the same 1000 values.',
      takeaway: "A shuffled column's own min-max spans the whole range — sort order is what makes pruning possible.",
      Visual: S.RevealShuffledNoSkip,
    },
    {
      title: 'Reveal: the page index goes one level deeper',
      body: (
        <>
          Inside the one surviving row group, 4 pages of 25 rows each carry their own min and max
          too — only one page overlaps the query.
        </>
      ),
      duration: 4.6,
      fig: "row group 2's own 4 pages, each with its own min-max — only one overlaps 250-270.",
      Visual: S.RevealPageIndex,
    },
    {
      title: 'Predict: can min-max help a high-cardinality column?',
      body: (
        <>
          A column of unique session IDs has a min and a max spanning everything, in every row
          group. Can statistics-based skipping help at all here?
        </>
      ),
      duration: 3.4,
      fig: 'a high-cardinality session-id column. Can min-max statistics prune anything?',
      predict: {
        options: [
          { label: "No — but a bloom filter can take min-max's place", correct: true },
          { label: 'Yes — min-max still narrows it down a little' },
        ],
        explain: (
          <>
            A column with no real clustering gives min-max nothing to work with — a different
            structure entirely, built for exactly this case, is what actually helps.
          </>
        ),
      },
      Visual: S.PredictHighCardinality,
    },
    {
      title: 'Reveal: a real split-block bloom filter',
      body: (
        <>
          1024 blocks, 26,214 real keys inserted, built from the specification's own block and
          mask algorithm — a present key checks true, every time.
        </>
      ),
      duration: 4.4,
      fig: "this topic's own bloom filter: 1024 blocks, 26,214 keys inserted, no false negatives.",
      takeaway: 'A bloom filter never produces a false negative — only a small, tunable rate of false positives.',
      Visual: S.RevealBloomFilter,
    },
    {
      title: "Reveal: the measured rate matches the spec's own number",
      body: (
        <>
          The specification states "around 1.26%" false positives for this exact size. This
          sandbox's own filter measures 1.25% over 50,000 real checks.
        </>
      ),
      duration: 4.4,
      fig: "the spec's own stated false-positive rate vs this topic's own measured rate.",
      Visual: S.RevealMeasuredFpr,
    },
    {
      title: 'Reveal: a truncated max that silently loses data',
      body: (
        <>
          A writer that shortens a long string to "B" instead of the correct "C" makes a real
          matching row invisible to a reader's own statistics.
        </>
      ),
      duration: 4.4,
      fig: "a correctly truncated max keeps the row group; a buggy one wrongly skips a real match.",
      takeaway: 'A truncated bound rounded down instead of up is no longer a true upper bound — real rows silently vanish.',
      Visual: S.RevealTruncationBug,
    },
    {
      title: 'Recap',
      body: (
        <>
          Row-group statistics, the page index, and bloom filters all prune by proof, not
          guesswork — and none of it works unless the writer's bounds are sorted, complete, and
          genuinely true.
        </>
      ),
      duration: 4.8,
      fig: 'a reader can only skip what a writer proved it never needs to read.',
      Visual: S.Recap,
    },
  ],
};

export default reel;
