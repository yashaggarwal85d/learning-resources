import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels (M, k, a count); taupe = data on disk (spilled), not
// yet read back; caramel = the thing to look at; cinnamon (rare) = the system's modification set
// against the textbook; cherry/cherryText = the bad outcome (budget exceeded, a false positive).

// 1 · Hook: the shop join at a budget of one twentieth of the build side
export function JoinHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="A hash join whose build side is twenty times the memory budget" h={240}>
      <g opacity={a}>
        <T x={300} y={80} s={13} a="middle" f={C.crema}>orders joins customers on customer id</T>
        <T x={300} y={108} s={12} a="middle" f={C.latte}>budget M holds one twentieth of customers</T>
      </g>
      <T x={300} y={160} s={13} a="middle" f={C.caramel} o={b}>how many batches, how much spills, how many bits per customer?</T>
    </Svg>
  );
}

// 2 · Two-column strip: textbook hash table vs the join's memory-bounded version
export function TwoColumnStrip({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  const b = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="The chapter 3 hash table, and the join's memory-bounded version of it" h={280}>
      <g opacity={a}>
        <T x={300} y={60} s={13} a="middle" f={C.crema}>chapter 3: chained buckets</T>
        <T x={300} y={85} s={12} a="middle" f={C.latte}>one load factor, no budget</T>
      </g>
      <T x={300} y={140} s={12} a="middle" f={C.caramel}>constraint: a fixed memory budget</T>
      <g opacity={b}>
        <T x={300} y={195} s={13} a="middle" f={C.cinnamon}>the join: same buckets</T>
        <T x={300} y={220} s={12} a="middle" f={C.latte}>boxed by the budget, split into batches</T>
      </g>
    </Svg>
  );
}

// 3 · One hash value, two independent views: bucket bits and batch bits
export function BucketBatchSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  const b = easeOut(seg(t, 1.1, 2.0));
  return (
    <Svg label="The low bits of a hash value give the bucket; a rotate and mask give the batch" h={260}>
      <T x={300} y={70} s={12} a="middle" f={C.latte}>one 32-bit hash value</T>
      <g opacity={a}>
        <T x={300} y={115} s={13} a="middle" f={C.crema}>low bits → bucket</T>
      </g>
      <g opacity={b}>
        <T x={300} y={150} s={13} a="middle" f={C.caramel}>rotate right by log2(buckets), then mask → batch</T>
      </g>
      <T x={300} y={200} s={11} a="middle" f={C.latte}>bucket and batch come from non-overlapping bits</T>
    </Svg>
  );
}

// 4 · Growth: the executor doubles the batch count until each batch fits M
export function BatchGrowth({ t }: StepCtx) {
  const steps = [1, 2, 4, 8, 16, 32];
  const shown = Math.min(steps.length, Math.floor(seg(t, 0.2, 2.6) * steps.length) + 1);
  return (
    <Svg label="The batch count doubles until every batch fits the memory budget" h={250}>
      <T x={300} y={60} s={12} a="middle" f={C.latte}>batch count, doubling</T>
      {steps.slice(0, shown).map((n, i) => (
        <T key={n} x={120 + i * 72} y={130} s={15} a="middle" f={n === 32 ? C.caramel : C.crema}>{n}</T>
      ))}
      <T x={300} y={190} s={12} a="middle" f={C.caramel} o={shown >= steps.length ? 1 : 0}>32 batches fit the budget</T>
    </Svg>
  );
}

// 5 · Predict: the stop condition
export function PredictStopCondition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="What happens when one customer is too frequent to split by hashing further" h={230}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.crema}>one customer's rows keep landing in the same half</T>
        <T x={300} y={120} s={12} a="middle" f={C.latte}>splitting the batch again sends them nowhere new</T>
      </g>
      <T x={300} y={170} s={13} a="middle" f={C.caramel}>does the executor keep doubling anyway?</T>
    </Svg>
  );
}

// 6 · The one-key exception
export function SplitStopsGrowing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="PostgreSQL disables further batch growth once a split keeps all or none of a batch's tuples" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={12} a="middle" f={C.crema}>a batch splits and keeps all, or none, of its tuples</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.cherryText} o={b}>growth stops globally, not just for that batch</T>
    </Svg>
  );
}

// 7 · Spill measured: the fraction of order rows written to temporary files
export function SpillMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 2.2));
  return (
    <Svg label="92 percent of order rows spill to a temporary file; only batch zero stays resident" h={260}>
      <T x={300} y={55} s={12} a="middle" f={C.latte}>order rows, by destination</T>
      <Bar x={160} y={90} w={280} h={26} full={1} fill={C.taupe} o={a} />
      <Bar x={160} y={90} w={280 * 0.0813} h={26} full={1} fill={C.crema} o={a} />
      <T x={300} y={150} s={13} a="middle" f={C.caramel}>about 92% of order rows go to disk</T>
      <T x={300} y={178} s={11} a="middle" f={C.latte}>only batch zero's rows are probed in memory</T>
    </Svg>
  );
}

// 8 · Skew table: hottest customers stay resident
export function SkewTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.6));
  const b = easeOut(seg(t, 1.7, 2.6));
  return (
    <Svg label="A skew table capped at two percent of the budget keeps the busiest customers off disk" h={260}>
      <g opacity={a}>
        <T x={300} y={70} s={12} a="middle" f={C.latte}>skew table: 2% of the budget, four resident slots</T>
        <T x={300} y={100} s={13} a="middle" f={C.cinnamon}>the four busiest customers, always in memory</T>
      </g>
      <T x={300} y={160} s={13} a="middle" f={C.caramel} o={b}>about a sixth of all orders never touch disk</T>
    </Svg>
  );
}

// 9 · Spark's probe-side table: open addressing with quadratic probing
export function OpenAddressedProbeSide({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Spark's long-key map uses open addressing with quadratic probing, PostgreSQL chains" h={240}>
      <g opacity={a}>
        <T x={300} y={80} s={13} a="middle" f={C.crema}>PostgreSQL: chained buckets, tuples of any size</T>
      </g>
      <g opacity={b}>
        <T x={300} y={130} s={13} a="middle" f={C.cinnamon}>Spark's long-key map: open addressing, quadratic probing</T>
        <T x={300} y={158} s={11} a="middle" f={C.latte}>compact and cache-friendly for one fixed-size key</T>
      </g>
    </Svg>
  );
}

// 10 · Bloom-filter pushdown: application side and creation side
export function BloomPushdown({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A Bloom filter built from the creation side prunes rows at the application side's scan" h={250}>
      <g opacity={a}>
        <T x={300} y={80} s={12} a="middle" f={C.crema}>creation side: customers, the side with a selective filter</T>
      </g>
      <T x={300} y={130} s={13} a="middle" f={C.caramel} o={b}>a Bloom filter travels to the application side's scan</T>
      <T x={300} y={160} s={11} a="middle" f={C.latte} o={b}>orders are dropped before the join ever sees them</T>
    </Svg>
  );
}

// 11 · The filter's arithmetic: bits per item, hash count, measured rate
export function FilterArithmetic({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  const c = easeOut(seg(t, 2.3, 3.2));
  return (
    <Svg label="8.4 bits per item, six hash functions, and a measured rate matching the formula" h={260}>
      <g opacity={a}>
        <T x={300} y={70} s={13} a="middle" f={C.crema}>8,388,608 bits for 1,000,000 expected items</T>
        <T x={300} y={98} s={12} a="middle" f={C.latte}>8.4 bits per item</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>six hash functions, from the same ratio</T>
      <g opacity={c}>
        <T x={300} y={180} s={12} a="middle" f={C.crema}>a built filter measures the same rate</T>
        <T x={300} y={203} s={11} a="middle" f={C.latte}>the formula predicts</T>
      </g>
    </Svg>
  );
}

// 12 · Contrast: Trino's dynamic filter degrades to min/max
export function TrinoContrast({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Trino's dynamic filter starts exact and falls back to a column's min and max" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>small build side: the exact set of distinct keys</T>
      </g>
      <T x={300} y={135} s={13} a="middle" f={C.cherryText} o={b}>large build side: only a min and a max per column</T>
      <T x={300} y={165} s={11} a="middle" f={C.latte} o={b}>a coarser, lossier filter than a fixed-size Bloom filter</T>
    </Svg>
  );
}

// 13 · Recap and handoff
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A hash join's answer to a memory budget: batching by hash, a skew table, a pruning filter" h={240}>
      <g opacity={a}>
        <T x={300} y={85} s={13} a="middle" f={C.crema}>batch by hash, keep the hottest keys resident, prune early</T>
      </g>
      <T x={300} y={140} s={13} a="middle" f={C.caramel} o={b}>next: the other path out of memory is a sort</T>
    </Svg>
  );
}
