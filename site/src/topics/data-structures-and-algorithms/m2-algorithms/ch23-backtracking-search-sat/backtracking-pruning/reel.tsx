import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Backtracking with pruning. A full topic: the choose-explore-undo template on enumeration
// trees, N-queens as the first pruned search (and an unsound prune that loses every solution),
// Sudoku solved by constraint propagation plus search, minimum remaining values against first-
// empty-square ordering, and the heavy tail even a good order still has on a bad day. Every
// count is exact and asserted in examples.py.

const reel: Reel = {
  steps: [
    {
      title: "Eight queens, four billion four hundred twenty-six million one hundred sixty-five thousand three hundred sixty-eight placements, ninety-two right. A program that tests them all makes four billion checks. The program this topic builds makes two thousand fifty-seven calls and finds every one.",
      body: <>Four billion placements, ninety-two right. This search makes two thousand fifty-seven calls.</>,
      duration: 5,
      fig: 'Opening',
      Visual: S.Opening,
    },
    {
      title: "One recursive function, choose, explore, undo, drawn as a tree for the same four-element set three ways: every subset, in or out at each element, sixteen leaves; every permutation, any unused element next, twenty-four leaves; every combination of two, increasing indices only, six leaves. Nothing is pruned yet.",
      body: <>Choose, explore, undo: the same template, three trees, three leaf counts.</>,
      duration: 5,
      fig: 'EnumerationTrees',
      Visual: S.EnumerationTrees,
    },
    {
      title: "Eight queens without any rule: four billion four hundred twenty-six million one hundred sixty-five thousand three hundred sixty-eight placements. One queen per row: sixteen million seven hundred seventy-seven thousand two hundred sixteen. No two sharing a column: forty thousand three hundred twenty. Then the first real prune, refusing a placement that shares a diagonal with an earlier queen.",
      body: <>Four billion, then sixteen million, then forty thousand three hundred twenty — before any diagonal check.</>,
      duration: 5,
      fig: 'UnprunedProgression',
      Visual: S.UnprunedProgression,
    },
    {
      title: "Before the tree is drawn: how many nodes does the pruned search visit for four queens?",
      body: <>How many nodes does the pruned four-queens search actually visit?</>,
      duration: 3,
      fig: 'PredictNodeCount',
      predict: {
        options: [
          { label: 'Seventeen', correct: true },
          { label: 'Twenty-four' },
          { label: 'Two hundred fifty-six' },
          { label: 'Four thousand four hundred twenty-six' },
        ],
        explain: (
          <>
            Seventeen, root included. Twenty-four is the unpruned permutation tree's own leaf
            count; two hundred fifty-six is four to the fourth. Both ignore that a prune removes
            whole subtrees, not just bad leaves.
          </>
        ),
      },
      Visual: S.PredictNodeCount,
    },
    {
      title: "Four queens: seventeen nodes, two solutions, drawn in full. Eight queens: two thousand fifty-seven calls, ninety-two solutions, the first one found after one hundred fourteen calls — against the four-billion-placement baseline on a shared log axis.",
      body: <>Seventeen nodes at four queens; two thousand fifty-seven calls at eight, against four billion.</>,
      duration: 5,
      fig: 'PrunedTree',
      Visual: S.PrunedTree,
    },
    {
      title: "The node count is not smooth as n grows: the first solution comes after one hundred fourteen calls at eight queens, but after only two hundred sixty-two calls at twelve. A prune that is not sound — refusing a queen too near the board's edge — loses every one of the ninety-two solutions at eight queens.",
      body: <>Node counts jump unevenly as n grows; an unsound prune loses every solution.</>,
      duration: 4.5,
      fig: 'UnsoundPrune',
      takeaway: "A prune must be sound: one that isn't can silently lose every real solution.",
      Visual: S.UnsoundPrune,
    },
    {
      title: "Sudoku's eighty-one-square grid, twenty-seven units, twenty peers per square. A placed digit can rule out digits for many other squares at once; a bare legality check against one square's own peers never looks at what else follows from it.",
      body: <>Eighty-one squares, twenty peers each. A placement check alone never propagates.</>,
      duration: 4.5,
      fig: 'SudokuGrid',
      Visual: S.SudokuGrid,
    },
    {
      title: "Two rules run to a fixed point: a decided square empties that digit from its peers; a unit with one place left for a digit gets it there. On the chapter's hard grid, propagation alone leaves sixty-one of the sixty-four empty squares uncertain, with over four times ten to the thirty-eighth power candidate combinations remaining between them.",
      body: <>Two propagation rules still leave sixty-one squares and an astronomical candidate count.</>,
      duration: 5,
      fig: 'ConstraintPropagation',
      takeaway: "Propagation is powerful and still nowhere near a complete solver on its own.",
      Visual: S.ConstraintPropagation,
    },
    {
      title: "Branching on a copy of the grid, trying each candidate, propagating, recursing: the same hard grid is solved after looking at only twenty-five possibilities, branching explicitly on just nine of the sixty-one uncertain squares.",
      body: <>Search on top of propagation: twenty-five possibilities, nine squares branched.</>,
      duration: 4.5,
      fig: 'SearchPlusPropagation',
      Visual: S.SearchPlusPropagation,
    },
    {
      title: "Before the measurement: once propagation is already running, does the order the search branches in matter at all — first empty square, or fewest candidates first?",
      body: <>Does branching order matter at all, once propagation is already running?</>,
      duration: 3,
      fig: 'PredictOrdering',
      predict: {
        options: [
          { label: "It doesn't matter; propagation already decides it" },
          { label: 'Fewest candidates first wins, by a wide margin', correct: true },
          { label: 'First empty square wins, by a wide margin' },
          { label: 'Both take about the same number of placements' },
        ],
        explain: (
          <>
            Fewest candidates first wins by a very wide margin. Propagation shrinks candidate
            sets; it does not choose which square to try next, and that choice is most of the
            remaining cost.
          </>
        ),
      },
      Visual: S.PredictOrdering,
    },
    {
      title: "The same grid, checked only against peers, no propagation: first-empty-square order is still unsolved after three million placements. Fewest-candidates-first is solved after four hundred eighty-one. The order decides everything once propagation is held fixed.",
      body: <>First-empty: unsolved after three million placements. Fewest-candidates: solved after four hundred eighty-one.</>,
      duration: 5,
      fig: 'OrderingMeasured',
      takeaway: "Minimum remaining values can be the entire difference between unsolved and solved.",
      Visual: S.OrderingMeasured,
    },
    {
      title: "Even a good order has bad days. Norvig's own randomized-value-order runs on one hard puzzle split twenty-seven fast and three near one hundred ninety seconds apiece, and his own run across a million puzzles shows the identical shape at scale. This topic's own thirty-seeded run on the chapter's grid shows the same shape, smaller: a real spread between a typical run and its worst, not a smooth one.",
      body: <>Norvig's own runs: a heavy tail at one puzzle and at a million. This topic's own run shows the same shape, smaller.</>,
      duration: 5,
      fig: 'HeavyTail',
      Visual: S.HeavyTail,
    },
    {
      title: "The tree is the algorithm, and what decides its size is where you prune and which variable you branch on, not the code that walks it. Backtracking never made the search polynomial; it only kept the tree as small as refusing doomed branches early, choosing the branch that fails fastest, and deducing before guessing can make it. Two pointers, next.",
      body: <>The tree is the algorithm. Pruning and branching decide its size. Two pointers, next.</>,
      duration: 5,
      fig: 'Handoff',
      Visual: S.Handoff,
    },
  ],
};

export default reel;
