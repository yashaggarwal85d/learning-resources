import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Measured on this sandbox: a real order joined through a real promo-tag bridge, with and
// without weights, and a real ragged category hierarchy flattened into a bridge versus walked
// with a recursive query (SOURCES.md, examples.py). Every number on screen traces to a literal
// constant in examples.py; everything else is spelled in words.
const reel: Reel = {
  steps: [
    {
      title: 'One order, three promo tags, one question',
      body: (
        <>
          One order carries three promo tags at once. Join it through a bridge table to all three
          and sum the amount — does that sum come out to the order's real total?
        </>
      ),
      duration: 4.8,
      fig: 'one order, three tags, one bridge join — what total comes out?',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: multivalued dimension, quoted directly',
      body: (
        <>
          Most dimensions carry exactly one value at the fact table's own grain — but some are
          legitimately multivalued, attaching through a group key to a bridge with one row per
          simultaneous value.
        </>
      ),
      duration: 4.8,
      fig: 'one group key, one bridge row per simultaneous value',
      Visual: S.RevealMultivaluedQuote,
    },
    {
      title: "Predict: does joining through the bridge and summing give the order's real total?",
      body: (
        <>
          The bridge table genuinely holds all three of the order's promo tags. Does joining
          through it and summing the amount return the order's actual total?
        </>
      ),
      duration: 2.8,
      fig: 'join through the bridge, sum the amount — the real total?',
      predict: {
        options: [
          { label: "Yes — the amount is still the order's own amount" },
          { label: 'No — the join multiplies the amount once per bridge row', correct: true },
        ],
        explain: (
          <>
            No. The bridge adds one row per tag, and a plain join duplicates the order's amount
            across every one of them — the sum comes out inflated, not correct.
          </>
        ),
      },
      Visual: S.PredictBridgeSum,
    },
    {
      title: 'Reveal: the double-count, measured',
      body: (
        <>
          Joined through the bridge to three tags and summed with no weighting at all, the order's
          seventy comes back three times over — once for every tag it carries.
        </>
      ),
      duration: 4.8,
      fig: 'one order, three tags, summed unweighted: three times the real total',
      takeaway: 'A bridge join multiplies a measure once per linked row unless something stops it.',
      Visual: S.RevealDoubleCount,
    },
    {
      title: 'Reveal: the weighting fix, quoted directly',
      body: (
        <>
          Grouping by the multivalued dimension over-counts the fact row's own metric across its
          linked rows — unless each bridge row carries its own allocation, or weighting, factor.
        </>
      ),
      duration: 4.8,
      fig: 'an allocation factor, assigned to each bridge row',
      Visual: S.RevealWeightingQuote,
    },
    {
      title: 'Reveal: the weighting fix, measured',
      body: (
        <>
          The same three bridge rows, each carrying its own weight that sums to exactly one across
          the group — multiply the amount by that weight before summing, and the order's true total
          comes back exactly.
        </>
      ),
      duration: 4.8,
      fig: 'weights summing to one, multiplied in: the true total, exactly',
      takeaway: 'Weighting factors that sum to one turn a bridge join back into an honest total.',
      Visual: S.RevealWeightingMeasured,
    },
    {
      title: 'Reveal: ragged hierarchy, quoted directly',
      body: (
        <>
          A hierarchy of indeterminate depth is genuinely hard to model and query directly in a
          relational database — one branch three levels deep, another just a single leaf.
        </>
      ),
      duration: 4.8,
      fig: 'indeterminate depth, hard to model and query directly',
      Visual: S.RevealRaggedQuote,
    },
    {
      title: 'Predict: does a flattened bridge table need recursion at query time?',
      body: (
        <>
          A ragged hierarchy's bridge table is built once, with a row for every possible ancestor-
          descendant path. Does reading from it still need a recursive query?
        </>
      ),
      duration: 2.8,
      fig: 'built once, with every path — still needs recursion to read?',
      predict: {
        options: [
          { label: 'Yes — hierarchy traversal always needs recursion somewhere' },
          { label: 'No — a flat WHERE clause is enough once the bridge exists', correct: true },
        ],
        explain: (
          <>
            No. The recursion already happened once, when the bridge itself was built; reading
            "everything under this node" afterward is a plain, non-recursive filter.
          </>
        ),
      },
      Visual: S.PredictFlattenedRecursion,
    },
    {
      title: 'Reveal: the flattened bridge, measured',
      body: (
        <>
          Built once from the ragged category tree, the bridge answers "everything under the top
          category" with a single flat filter — no recursive query anywhere in sight.
        </>
      ),
      duration: 4.8,
      fig: 'every path pre-computed once; read with a flat filter, no recursion',
      takeaway: 'The recursion happens once, when the bridge is built — never again at read time.',
      Visual: S.RevealFlattenedBridge,
    },
    {
      title: 'Reveal: the recursive check, measured',
      body: (
        <>
          Run completely independently, walking the raw category tree with its own recursive query
          finds exactly the same three categories the flattened bridge already had.
        </>
      ),
      duration: 4.8,
      fig: 'walked directly, independently — the identical categories come back',
      Visual: S.RevealRecursiveCheck,
    },
    {
      title: 'Recap',
      body: (
        <>
          A multivalued dimension attaches through a bridge, one row per value. Weighting factors
          that sum to one turn a bridge join back into an honest total. A ragged hierarchy's bridge
          pays the recursion once, up front, and never again at query time.
        </>
      ),
      duration: 4.8,
      fig: 'bridge, weighted, flattened — each mechanism, measured',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A product carries two overlapping category tags, and a report sums its revenue across
          both without any weighting at all. Trust that number, or fix it first?
        </>
      ),
      duration: 2.8,
      fig: 'two overlapping tags, an unweighted sum — trust it, or fix it?',
      predict: {
        options: [
          { label: "Trust it — two tags isn't enough to matter" },
          { label: 'Fix it — assign weights that sum to one before summing', correct: true },
        ],
        explain: (
          <>
            Fix it. Any number of overlapping bridge rows duplicates the measure the same way three
            did; the count never changes whether the fix is needed, only how large the error is.
          </>
        ),
      },
      Visual: S.ProveProductTags,
    },
  ],
};

export default reel;
