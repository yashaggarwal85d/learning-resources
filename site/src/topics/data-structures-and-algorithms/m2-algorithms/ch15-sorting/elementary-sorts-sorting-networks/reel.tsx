import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Elementary sorts and sorting networks. A refresher: the previous chapter's own handoff's
// exact next question, opening the second milestone. Every count is exact and asserted in
// examples.py; no compiled benchmark is needed, since nothing here is a timing claim.
const reel: Reel = {
  steps: [
    {
      title: 'The slowest algorithm gets the last word',
      body: (
        <>
          Open the standard library of any mainstream language and read its sort. Before it does
          anything clever, it checks whether the range is short — and if it is, hands it to
          insertion sort, the algorithm from week one that is quadratic.
        </>
      ),
      duration: 4.4,
      fig: 'a fast sort, with a short-range branch to the slowest algorithm',
      Visual: S.Hook,
    },
    {
      title: 'How many comparisons, how many wasted?',
      body: (
        <>
          Insertion sort on the keys five, two, four, six, one, three: how many comparisons does
          it make, and how many of them are spent on keys already in the right order?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [
          { label: 'Six comparisons, none wasted' },
          { label: 'Twelve comparisons, nine of them on keys already in order', correct: true },
          { label: 'Fifteen comparisons, all of them necessary' },
          { label: 'Nine comparisons, three wasted' },
        ],
        explain: (
          <>
            Twelve comparisons, and the count of moves — nine — equals the number of pairs that
            started out of order. That equality is not a coincidence: it is exactly what
            insertion sort's cost measures.
          </>
        ),
      },
      fig: 'six keys, a question over comparisons and waste',
      Visual: S.InsertionPredict,
    },
    {
      title: 'Insertion sort',
      body: (
        <>
          Lift the next key out, shift every larger key one step right, drop the lifted key into
          the gap. Its cost is the number of keys minus one, plus however many pairs started out
          of order — and its moves equal that count exactly.
        </>
      ),
      duration: 4.6,
      fig: 'a key lifted out, larger keys sliding right, the key dropping in',
      Visual: S.InsertionSort,
    },
    {
      title: 'Selection sort',
      body: (
        <>
          Scan the entire unsorted part for the smallest remaining key, and swap it to the
          front. That scan happens every single round, so the comparison count never changes no
          matter how close to sorted the input already is.
        </>
      ),
      duration: 4.4,
      fig: 'a full scan of the unsorted part, every round',
      Visual: S.SelectionSort,
    },
    {
      title: 'Bubble sort, and an unstable swap',
      body: (
        <>
          Bubble sort swaps adjacent out-of-order pairs — more moves than insertion sort for the
          same result, which is why nobody reaches for it. And selection sort's single swap per
          round can carry one equal key past another, reordering them.
        </>
      ),
      duration: 4.8,
      fig: 'two equal keys, swapped past each other',
      takeaway: 'Selection sort can swap two equal keys past each other; insertion sort never does.',
      Visual: S.BubbleInstability,
    },
    {
      title: 'Stable, in place, or both',
      body: (
        <>
          A stable sort keeps equal keys in their original order. An in-place sort uses no more
          than a constant amount of extra memory. A sort can have either property without the
          other, and not every combination is equally easy to achieve.
        </>
      ),
      duration: 4.2,
      fig: 'four combinations of stable and in place, previewed',
      Visual: S.StableInPlaceTable,
    },
    {
      title: 'Why does a fast sort still need the slow one?',
      body: (
        <>
          A recursive sort keeps splitting its input into smaller and smaller ranges. Once a
          range gets short enough, does switching to a different algorithm actually help, or is
          that just tradition?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [
          { label: 'It makes no real difference either way' },
          { label: "Yes — insertion sort's low overhead wins below a small size", correct: true },
          { label: 'No — the recursive algorithm is always at least as fast' },
          { label: 'It only matters for already-sorted input' },
        ],
        explain: (
          <>
            Yes. Below a small size, the constant-factor cost of recursion and function calls
            outweighs any asymptotic advantage — insertion sort's simple, sequential loop wins.
          </>
        ),
      },
      fig: 'a short range — which algorithm actually wins here?',
      Visual: S.CutoffPredict,
    },
    {
      title: 'Three real libraries, one small cutoff',
      body: (
        <>
          Real standard libraries bear this out exactly. One switches to insertion sort below a
          range of sixteen elements. Another uses small fixed sorting-network helpers above nine
          and thirteen elements, and insertion sort below that — no recursion, no function call,
          memory read in order.
        </>
      ),
      duration: 5,
      fig: 'two real libraries, each with its own small-range cutoff',
      takeaway: "Below a small size, insertion sort's constant factors beat any asymptotically faster algorithm's overhead.",
      Visual: S.SmallSortCutoff,
    },
    {
      title: 'A fixed sequence, no branch to mispredict',
      body: (
        <>
          A sorting network is a fixed sequence of compare-and-exchange operations that never
          looks at the data to decide what happens next. No data-dependent branch means nothing
          to mispredict, and the operations can even run on parallel lanes.
        </>
      ),
      duration: 4.6,
      fig: 'four wires, five compare-and-exchanges, fixed in advance',
      Visual: S.SortingNetworkWires,
    },
    {
      title: 'Checked against every input it can see',
      body: (
        <>
          Run this four-input network on every one of the twenty-four orderings of four distinct
          keys, and separately on all sixteen patterns of just two values. Every single one
          comes out sorted — checked directly, not assumed from one example.
        </>
      ),
      duration: 4.8,
      fig: 'every zero-one pattern run through, every one sorted',
      takeaway: "A sorting network's correctness is checked on every input it can see, not argued from one example.",
      Visual: S.NetworkChecked,
    },
    {
      title: 'The bound, briefly',
      body: (
        <>
          A sorting network is still a comparison algorithm — just an oblivious one, since its
          comparisons are fixed before any data arrives. So the same floor from last chapter
          still applies, and at four inputs, the smallest known network lands exactly on it.
        </>
      ),
      duration: 4.4,
      fig: 'the floor from last chapter, met exactly at four inputs',
      Visual: S.BoundBriefly,
    },
    {
      title: 'Recap',
      body: (
        <>
          Insertion, selection and bubble sort, and a branch-free network built from the same
          comparisons: none of them escape the floor, and the smallest of them is what every
          fast, recursive sort still falls back on. The next topic asks how close a sort built
          from recursion gets to that same floor. Merge sort, next.
        </>
      ),
      duration: 4.8,
      fig: 'four small sorts, one shared floor beneath them',
      Visual: S.Recap,
    },
  ],
};

export default reel;
