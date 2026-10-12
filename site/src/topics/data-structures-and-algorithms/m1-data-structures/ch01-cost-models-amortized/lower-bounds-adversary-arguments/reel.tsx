import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// What every algorithm in a model must pay: the decision tree, counting answers, adversaries, and what a lower bound does not rule out.
// Every number shown is computed or asserted in examples.py. The unit of cost is one comparison of two keys, in the comparison model.
const reel: Reel = {
  steps: [
    {
      title: 'Three claims about a million keys',
      body: (
        <>
          The last reel bounded what <em>one</em> algorithm costs. Now three colleagues, who only compare keys, promise something about <em>every</em> input of the vector: sort any
          input in at most 15,000,000 comparisons; find the minimum and the maximum in at most 1,200,000; say whether all keys are distinct in at most 5,000,000. No test can refute
          “any input”, because you would need the bad input in hand. By the end you will refute all three without running anything.
        </>
      ),
      duration: 3.2,
      Visual: S.Opening,
    },
    {
      title: 'A comparison sort is a tree of questions',
      body: (
        <>
          Only comparisons tell the algorithm anything about the keys (the comparison model of the word-RAM topic), so its whole run on an input is the path of answers it gets. Draw
          every path for three keys and you get a tree: a node per comparison, a leaf per finished run, holding the order it reports. An input’s cost is the depth of its leaf; the
          worst case is the tree’s height. From here one unit of cost is one comparison (not the word operations of the last reel); everything else is free, so a bound on
          comparisons is a bound on time, never more.
        </>
      ),
      duration: 4.4,
      Visual: S.SortTree,
    },
    {
      title: 'Predict: two comparisons for three keys?',
      body: <>Three keys, six possible orders. Can any comparison sort finish every input within two comparisons?</>,
      duration: 1.8,
      predict: {
        options: [
          { label: 'Yes, best pair' },
          { label: 'Yes, if distinct' },
          { label: 'No: needs 3', correct: true },
          { label: 'No: needs 4' },
        ],
        explain: (
          <>
            Two yes/no answers have four outcomes, so a tree of height 2 has at most 4 leaves, and six orders need six. However the algorithm picks its pairs, an adversary that answers
            each comparison with the side where more orders survive keeps 6, then at least 3, then at least 2 orders alive, so it can still name an order the algorithm did not
            output. Three comparisons do suffice: insertion sort’s tree. Distinct keys are already assumed, and four is never needed for three keys.
          </>
        ),
      },
      Visual: S.TwoLevels,
    },
    {
      title: 'n! leaves force log₂ n! levels',
      body: (
        <>
          A sort must be able to output any of the n! orders, so its tree has at least n! leaves. A tree of height h has at most 2ʰ, so h ≥ log₂ n!, and log₂ n! lies between
          n·log₂ n − 1.443n and n·log₂ n: it is Θ(n log n). Five keys: 120 orders sit between 64 and 128, so the height is at least 7. At a million keys every comparison sort has an
          input that costs at least 18,488,885 comparisons. Merge sort’s worst case, 18,951,425, is 2.5 % above that floor: the upper bound solved last reel meets the lower bound, so
          sorting is settled at Θ(n log n) comparisons. A search over every tree confirms that 3, 5 and 7 comparisons are exact for three, four and five keys.
        </>
      ),
      duration: 4.4,
      Visual: S.LeafBudget,
    },
    {
      title: 'The average order pays it too',
      body: (
        <>
          The bound holds on average as well. With all n! orders equally likely, any comparison sort’s average leaf depth is at least ⌊log₂ n!⌋. The proof is the move you just watched:
          hang the two deepest sibling leaves under the shallowest leaf, and the average drops whenever the depths differ by 2 or more, so the cheapest tree is balanced. This is an
          average over inputs (the first topic’s average case); a randomized sort, an average over its coins, obeys the same bound (Deep dive).
        </>
      ),
      duration: 4.4,
      Visual: S.AverageDepth,
    },
    {
      title: 'Count the answers',
      body: (
        <>
          The argument used nothing about sorting except the number of possible answers. A problem with K answers needs at least ⌈log₂ K⌉ yes/no questions in the worst case, whatever the
          questions are: the <b>information-theoretic bound</b>. Searching the sorted vector has a million and one answers and binary search uses 20 probes (each probe has three answers,
          but “equal” ends the search, so the count still holds; Deep dive). Merging two runs of four: 70 interleavings, 7, met by the standard merge. Sorting five keys: 7, met.
          Here counting is tight.
        </>
      ),
      duration: 4.0,
      Visual: S.CountAnswers,
    },
    {
      title: 'Predict: the price of the maximum',
      body: (
        <>
          The largest of a million keys has a million possible answers, so counting gives 20 yes/no questions. How many comparisons must every comparison algorithm make in its worst
          case?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '20' }, { label: '500,000' }, { label: '999,999', correct: true }, { label: '1,000,000' }],
        explain: (
          <>
            Until a key has lost a comparison, it might be the largest, so every key but the winner must lose at least once, and one comparison makes at most one key a loser: n − 1 =
            999,999, and a scan uses exactly that many. Counting is a true bound here, just a weak one: 20 <em>unrestricted</em> questions (“is the largest key’s index odd?”) would find
            the maximum, but a comparison cannot ask that.
          </>
        ),
      },
      Visual: S.MaxPredict,
    },
    {
      title: 'An adversary decides the input last',
      body: (
        <>
          That was an <b>adversary argument</b>. The adversary answers each comparison as it likes, with one rule: the answers so far must always fit some real input. It assumes nothing
          about the algorithm, so the argument covers every algorithm at once. If the algorithm stops while two inputs fit every answer and have different correct outputs, the adversary
          reveals the one it got wrong. Here a tournament stops after six comparisons: k₄ and k₈ were never beaten, and raising k₄ to 9 keeps every answer.
        </>
      ),
      duration: 4.6,
      Visual: S.TwoInputs,
    },
    {
      title: 'Predict: min and max of eight keys',
      body: (
        <>
          Two scans find the max and then the min of the rest in 7 + 6 = 13 comparisons. What is the fewest any algorithm can guarantee for eight keys?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '13' }, { label: '12' }, { label: '10', correct: true }, { label: '7' }],
        explain: (
          <>
            Pair the keys first: 4 comparisons. The maximum can only be a pair’s winner and the minimum only a pair’s loser, so the max costs 3 more among the four winners and the min 3
            more among the four losers: 10 for 8 keys, ⌈3n/2⌉ − 2 in general. That is an upper bound; the next step proves that no algorithm can guarantee 9. Seven is the bound for the max
            alone, so it cannot be enough for both.
          </>
        ),
      },
      Visual: S.MinMaxPredict,
    },
    {
      title: 'The scoreboard: 14 units, 10 comparisons',
      body: (
        <>
          The referee keeps four columns. Until a key has lost it could be the max; until it has won it could be the min. A correct answer needs every key’s first win or first loss
          except two: 2n − 2 = 14 units. The referee answers so that only a comparison of two untested keys gives 2 units, and there are at most ⌊n/2⌋ = 4 of those. So every algorithm
          needs at least ⌈3n/2⌉ − 2 comparisons: 10 for 8 keys, 1,499,998 for a million, where two scans would take 1,999,997. Pairing meets it, so the bound is tight. (The syllabus’s 3n/2 − 2
          is the even case.)
        </>
      ),
      duration: 5.2,
      Visual: S.Scoreboard,
    },
    {
      title: 'Predict: two answers, how many comparisons?',
      body: (
        <>
          Are all the keys distinct? Two possible answers, so counting gives 1 question. What must a comparison algorithm pay on a million keys in its worst case?
        </>
      ),
      duration: 1.8,
      predict: {
        options: [{ label: '1 comparison' }, { label: '999,999 comparisons' }, { label: '1,499,998 comparisons' }, { label: 'about 18.5 million', correct: true }],
        explain: (
          <>
            The answer has two values but the work behind it does not: to say “distinct” safely, an algorithm must have learned the keys’ whole sorted order, so it pays at least the
            sorting bound, ⌈log₂ n!⌉ = 18,488,885. A hash set decides it faster, but that leaves the comparison model (see “What a lower bound rules out”). 999,999 would be enough if the keys were already sorted;
            1,499,998 is the min-and-max bound; 1 is the counting bound, true and useless here. The next step shows why the order must be known.
          </>
        ),
      },
      Visual: S.DistinctPredict,
    },
    {
      title: 'Distinctness: every neighbour must be compared',
      body: (
        <>
          Suppose an algorithm answers “distinct” without ever comparing two keys that are neighbours in sorted order. Nothing lies between them, so the adversary makes them equal: every
          comparison made gives the same answer, the algorithm still says “distinct”, and now it is wrong. So every “distinct” answer comes after all n − 1 neighbour comparisons, which
          spell out the whole sorted order: the tree has at least n! “distinct” leaves, and its height is at least ⌈log₂ n!⌉ (three-way comparisons, comparisons between two keys; Deep
          dive). The bound survives a stronger model: Ben-Or (1983) proved Ω(n log n) for algebraic computation trees.
        </>
      ),
      duration: 5.0,
      Visual: S.Neighbours,
    },
    {
      title: 'What a lower bound rules out',
      body: (
        <>
          The sorting bound is about one <b>model</b> (only comparisons tell you about the keys) and one <b>problem</b> (output the sorted order of any input), in the worst case or on
          average. It does not rule out radix sort, which reads keys as digits; a hash set, which decides distinctness in expected O(n) and gives up the worst-case guarantee; a sort that
          is fast on an easy input; a different problem such as putting the smallest half first; or a better constant. And a problem’s lower bound is not one algorithm’s cost: insertion
          sort’s n(n − 1)/2 is its own worst case. Every correct algorithm must at least read every key: Ω(n).
        </>
      ),
      duration: 5.0,
      Visual: S.Scope,
    },
    {
      title: 'Back to the problem',
      body: (
        <>
          All three promises are impossible for every comparison algorithm, and you proved it without running anything: a decision tree with n! leaves for the sort, a referee with 2n − 2
          units for min and max, and the neighbour argument for distinctness. Two become possible once the keys are used as numbers; the third is already met by pairing. Every bound so far
          priced one run on its worst input, which is the thread the next reel pulls.
        </>
      ),
      duration: 3.8,
      Visual: S.Closing,
    },
    {
      title: 'Prove it · 1 of 3',
      body: <>Merge two sorted runs of 8 keys. Counting their C(16, 8) = 12,870 interleavings gives 14 comparisons. What must every merge pay in its worst case?</>,
      duration: 1.4,
      predict: {
        options: [{ label: '13' }, { label: '14' }, { label: '15', correct: true }, { label: '16' }],
        explain: (
          <>
            Take the runs 1, 3, …, 15 and 2, 4, …, 16. In the merged order each adjacent pair comes from different runs, and nothing but a direct comparison tells the two apart: swap their
            values and both runs stay sorted while the output must change. So all 15 adjacent pairs must be compared: 2n − 1. The textbook merge never uses more, so 15 is exact.
            Counting gives 14; two runs of 5 need 9 against a count of 8 (checked by exhaustive search). An adversary can beat the count.
          </>
        ),
      },
      Visual: S.Q1Merge,
    },
    {
      title: 'Prove it · 2 of 3',
      body: <>A student’s adversary for the maximum answers every comparison “the first key named is larger”. Does it prove that every algorithm needs n − 1 comparisons?</>,
      duration: 1.4,
      predict: {
        options: [
          { label: 'Yes: each answer makes one loser' },
          { label: 'No: its answers can fit no input', correct: true },
          { label: 'No: it must fix the input first' },
          { label: 'Yes, but only when n is even' },
        ],
        explain: (
          <>
            Ask a : b, b : c, then c : a, and it says a &gt; b &gt; c &gt; a: no input fits, so the “run” it forces is not a run on any input and proves nothing. An adversary may decide late,
            never inconsistently: it need not fix the input first, it must only keep some input fitting every answer. The referee of the max pretended xᵢ = i and stayed consistent; the
            scoreboard assigned values at each key’s first comparison.
          </>
        ),
      },
      Visual: S.Q2Cycle,
    },
    {
      title: 'Prove it · 3 of 3',
      body: <>Which of these claims about a million 64-bit keys does the comparison-sorting lower bound refute?</>,
      duration: 1.4,
      predict: {
        options: [
          { label: 'Radix sort orders them in 4 passes' },
          { label: 'A comparison sort checks sorted input in 999,999' },
          { label: 'A comparison sort averages 17 million on random orders', correct: true },
          { label: 'A selection finds the 10 largest in O(n)' },
        ],
        explain: (
          <>
            The average-case bound says any comparison sort averages at least ⌊log₂ 10⁶!⌋ = 18,488,884 comparisons over random orders, so 17 million on average is impossible. Radix sort is
            outside the model; 999,999 on a sorted input is one easy input, not the worst case or the average; finding the top 10 is a different problem with far fewer answers.
          </>
        ),
      },
      Visual: S.Q3Refute,
    },
  ],
};

export default reel;
