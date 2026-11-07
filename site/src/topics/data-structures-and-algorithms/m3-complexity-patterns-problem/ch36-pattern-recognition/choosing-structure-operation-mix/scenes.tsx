import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a structure as it is; latte = secondary labels (an
// operation, a count, a cost); caramel = the thing to look at (the chosen structure, the
// condition being tested); cinnamon (rare) = the alternative being compared (the runner-up
// structure); cherry/cherryText = the bad outcome (a structure at its breaking condition).

// 1 · Hook: the same data, three mixes, three winners
export function MixHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="One table of ten million keys, with the winning structure changing as the operation mix shifts" h={260}>
      <g opacity={a}>
        <T x={300} y={80} s={12} a="middle" f={C.crema}>ten million keys, one table</T>
        <T x={300} y={115} s={11} a="middle" f={C.latte}>ninety-five lookups in a hundred</T>
      </g>
      <g opacity={b}>
        <T x={300} y={175} s={12} a="middle" f={C.caramel}>a hash table wins by a wide margin</T>
        <T x={300} y={220} s={11} a="middle" f={C.cherryText}>shift the mix, and it loses to the tree it just beat</T>
      </g>
    </Svg>
  );
}

// 2 · lookup -> hash, and its breaking condition
export function HashBreakingCondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A hash table answering a lookup instantly, then failing a next-larger-key question because it has no order" h={260}>
      <g opacity={a}>
        <rect x={160} y={70} width={280} height={50} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={300} y={100} s={11} a="middle" f={C.crema}>equality lookup: answered at once</T>
      </g>
      <g opacity={b}>
        <rect x={160} y={150} width={280} height={50} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={300} y={180} s={11} a="middle" f={C.cherryText}>"the next key larger than this one": no order to ask</T>
      </g>
    </Svg>
  );
}

// 3 · Predict: how large a range-query share flips the winner?
export function PredictRangeShare({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A sliver of range queries mixed into a stream of lookups, with a question mark over how large that sliver must be" h={250}>
      <g opacity={a}>
        <rect x={120} y={90} width={360} height={24} fill="none" stroke={C.mocha} strokeWidth={1.2} />
        <rect x={120} y={90} width={5} height={24} fill={C.cherry} />
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>how large a share of range queries flips the winner?</T>
    </Svg>
  );
}

// 4 · ordered/range -> a balanced tree, measured
export function TreeRangeMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A hash table's range query costing a full scan, against a tree's range query costing only the width of the range" h={260}>
      <g opacity={a}>
        <rect x={340} y={80} width={220} height={22} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={450} y={115} s={10} a="middle" f={C.cherryText}>hash: scans every key</T>
      </g>
      <g opacity={b}>
        <rect x={150} y={80} width={70} height={22} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={185} y={115} s={10} a="middle" f={C.latte}>tree: only the range's width</T>
      </g>
      <T x={300} y={210} s={12} a="middle" f={C.caramel}>well under one percent of range queries is enough to flip it</T>
    </Svg>
  );
}

// 5 · top-k -> heap or quickselect, the measured crossover
export function TopKCrossover({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A heap winning top-k at a small k, then sorting the whole array winning past a larger k" h={250}>
      <g opacity={a}>
        <T x={300} y={95} s={12} a="middle" f={C.crema}>ten percent of n: the heap wins</T>
      </g>
      <g opacity={b}>
        <T x={300} y={120} s={12} a="middle" f={C.cinnamon}>twenty percent of n: sorting wins</T>
      </g>
      <T x={300} y={200} s={11} a="middle" f={C.caramel}>the heap's own bookkeeping grows with k</T>
    </Svg>
  );
}

// 6 · membership at scale -> a Bloom filter, priced
export function BloomFilterPriced({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A Bloom filter's bits against an exact set's bytes for the same key count, the filter far smaller" h={260}>
      <g opacity={a}>
        <rect x={150} y={90} width={60} height={60} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={180} y={170} s={10} a="middle" f={C.latte}>Bloom filter</T>
      </g>
      <g opacity={b}>
        <rect x={340} y={70} width={160} height={100} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={420} y={190} s={10} a="middle" f={C.latte}>an exact set</T>
      </g>
      <T x={300} y={225} s={11} a="middle" f={C.caramel}>a wrong "yes" is cheap; a wrong "no" is impossible</T>
    </Svg>
  );
}

// 7 · grouping -> union-find, and its breaking condition
export function UnionFindBreakingCondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Three circles merging into one group, with no operation drawn that could split them back apart" h={250}>
      <g opacity={a}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={220 + i * 60} cy={100} r={20} fill="none" stroke={C.crema} strokeWidth={1.6} />
        ))}
        <T x={300} y={150} s={11} a="middle" f={C.crema}>merge: near-constant amortised time</T>
      </g>
      <T x={300} y={215} s={11} a="middle" f={C.cherryText}>no operation ever splits a group back apart</T>
    </Svg>
  );
}

// 8 · prefixes -> a trie, and its breaking condition
export function TrieBreakingCondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A trie answering a prefix query at once, then failing to find a substring buried in the middle of a word" h={250}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>prefix "ca": found at once</T>
      </g>
      <g opacity={b}>
        <T x={300} y={110} s={12} a="middle" f={C.cherryText}>substring "art": not a prefix, not found</T>
      </g>
      <T x={300} y={200} s={11} a="middle" f={C.caramel}>bounded by key length, not by the number of keys</T>
    </Svg>
  );
}

// 9 · Predict: does the Fenwick-style trick work for maximum?
export function PredictFenwickMax({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A prefix-sum trick that works for a range sum, with a question mark over whether the same trick works for a range maximum" h={250}>
      <g opacity={a}>
        <T x={300} y={100} s={12} a="middle" f={C.crema}>range sum = prefix(r) minus prefix(l minus one)</T>
      </g>
      <T x={300} y={215} s={13} a="middle" f={C.caramel}>does the identical trick work for a range maximum?</T>
    </Svg>
  );
}

// 10 · Fenwick fails for max; segment tree gets it right
export function SegmentTreeCorrect({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="The Fenwick-style trick giving the wrong range maximum, with a segment tree giving the correct one on the identical case" h={260}>
      <g opacity={a}>
        <rect x={150} y={80} width={220} height={40} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={260} y={135} s={10} a="middle" f={C.cherryText}>Fenwick-style trick: wrong answer</T>
      </g>
      <g opacity={b}>
        <rect x={400} y={80} width={150} height={40} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={475} y={135} s={10} a="middle" f={C.crema}>segment tree: correct</T>
      </g>
      <T x={300} y={215} s={11} a="middle" f={C.caramel}>maximum has no inverse; sum does</T>
    </Svg>
  );
}

// 11 · The thesis: a weighted sum, winner changes with the mix
export function WeightedMixThesis({ t }: StepCtx) {
  const structures = ['hash', 'tree', 'heap'];
  const winners = ['lookup-heavy', 'range-heavy', 'a streaming leaderboard'];
  return (
    <Svg label="Three mixes over the identical data and the identical three structures, each mix choosing a different winner" h={280}>
      {winners.map((w, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        return (
          <g key={w} opacity={a}>
            <T x={150} y={70 + i * 50} s={12} a="start" f={C.latte}>{w}</T>
            <T x={450} y={70 + i * 50} s={13} a="end" f={C.caramel}>{structures[i]}</T>
          </g>
        );
      })}
      <T x={300} y={250} s={11} a="middle" f={C.crema}>the same data, three mixes, three different winners</T>
    </Svg>
  );
}

// 12 · Recap and handoff
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A structure chosen by the mix, not the biggest single operation, with a situation rather than data waiting next" h={250}>
      <g opacity={a}>
        <T x={300} y={80} s={13} a="middle" f={C.crema}>chosen by the mix</T>
        <T x={300} y={105} s={12} a="middle" f={C.caramel}>not the biggest single operation</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>next: when the input isn't data, but a situation</T>
    </Svg>
  );
}
