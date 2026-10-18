import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the B+-tree (in-place), cinnamon = the LSM-tree (out-of-place),
// cherry/cherryText = a cost that bites, taupe = quiet/waiting, latte = labels, crema = data.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · What an index decides.
export function Problem({ t }: StepCtx) {
  const tiers = [
    { k: 'cache', v: 'µs' },
    { k: 'drive', v: 'tens of µs' },
    { k: 'object store', v: 'tens of ms' },
  ];
  const a = easeOut(seg(t, 0.2, 1.4));
  const split = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Each tier of the machine has its own cost; an index decides how many of those costs a query pays, split between two opposite families" h={320}>
      {tiers.map((tier, i) => (
        <g key={tier.k} opacity={a}>
          <T x={25 + i * 190} y={44} s={14} f={C.latte}>{tier.k}</T>
          <T x={25 + i * 190} y={70} s={16} f={C.crema} w={600}>{tier.v}</T>
        </g>
      ))}
      <g opacity={split}>
        <rect x={60} y={140} width={200} height={60} rx={12} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        <T x={160} y={176} s={16} f={C.crema} a="middle" w={600}>in-place</T>
        <rect x={340} y={140} width={200} height={60} rx={12} fill={C.roast} stroke={C.cinnamon} strokeWidth={2} />
        <T x={440} y={176} s={16} f={C.crema} a="middle" w={600}>out-of-place</T>
      </g>
      <T x={300} y={250} s={14} f={C.taupe} a="middle" o={split}>two families, paying in opposite places</T>
    </Svg>
  );
}

// 2 · A B+-tree node is one page wide.
export function FanoutNode({ t }: StepCtx) {
  const N = 10;
  const grow = easeOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="One eight-kibibyte page holds a node; the fan-out is the page size divided by one entry, a few hundred children per node" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>one node = one 8 KB page</T>
      <rect x={25} y={48} width={300} height={60} rx={10} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
      <T x={175} y={84} s={14} f={C.crema} a="middle">separators + downlinks</T>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOutBack(seg(t, 0.5 + i * 0.08, 1.0 + i * 0.08));
        return <rect key={i} x={25 + i * 46} y={lerp(140, 150, a)} width={38} height={28} rx={5} fill={C.cocoa} opacity={clamp(a)} />;
      })}
      <T x={300} y={230} s={16} f={C.caramel} a="middle" w={600} o={grow}>fan-out: a few hundred children</T>
    </Svg>
  );
}

// 3 · Predict: how many levels deep?
export function HeightPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A hundred million keys, climbing a tree whose fan-out is a few hundred; the height settles at three or four levels" h={320}>
      {!answered && <T x={300} y={140} s={50} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={160} y={70} s={14} f={C.latte} a="middle">fan-out 256</T>
          <T x={160} y={110} s={30} f={C.caramel} a="middle" w={700}>4 levels</T>
          <T x={440} y={70} s={14} f={C.latte} a="middle">fan-out 1,000</T>
          <T x={440} y={110} s={30} f={C.caramel} a="middle" w={700}>3 levels</T>
          <T x={300} y={200} s={15} f={C.crema} a="middle">100,000,000 keys, either way</T>
          <T x={300} y={228} s={13} f={C.taupe} a="middle">short because it is wide: a large base shrinks the logarithm</T>
        </>
      )}
    </Svg>
  );
}

// 4 · The top of the tree is free after the first query.
export function PointLookup({ t }: StepCtx) {
  const descend = easeOut(seg(t, 0.3, 1.6));
  const cached = easeOut(seg(t, 2.0, 3.0));
  const levels = 4;
  return (
    <Svg label="A point lookup descends root to leaf, then fetches the row; after a handful of queries the upper levels stay cached" h={340}>
      {Array.from({ length: levels }, (_, i) => {
        const w = 60 + i * 110;
        const y = 40 + i * 60;
        const hit = descend > i / levels;
        return <rect key={i} x={300 - w / 2} y={y} width={w} height={36} rx={8} fill={hit ? C.caramel : C.cocoa} opacity={hit ? (i < levels - 1 ? 0.5 + 0.5 * cached : 1) : 0.6} />;
      })}
      <T x={300} y={290} s={15} f={C.crema} a="middle" o={cached}>upper levels: cached for good</T>
      <T x={300} y={316} s={16} f={C.caramel} a="middle" w={600} o={cached}>about one real read, at the leaf</T>
    </Svg>
  );
}

// 5 · An LSM-tree never writes in place.
export function MemtableFlush({ t }: StepCtx) {
  const fill = easeOut(seg(t, 0.3, 1.6));
  const flush = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="Writes append to a small sorted memtable; once full it freezes and flushes to storage in one sequential sweep, a sorted run" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>memtable, in memory</T>
      <rect x={25} y={48} width={200} height={100} rx={10} fill={C.roast} stroke={C.cinnamon} strokeWidth={2} />
      <rect x={25} y={48 + 100 * (1 - fill)} width={200} height={100 * fill} rx={10} fill={C.cinnamon} opacity={0.6} />
      <path d={`M250 ${98 - 60 * flush} h80`} stroke={C.taupe} strokeWidth={2} opacity={flush} />
      <rect x={340} y={48} width={200} height={100 * flush} rx={10} fill={C.cinnamon} opacity={flush} />
      <T x={440} y={200} s={14} f={C.crema} a="middle" o={flush}>sorted run, written sequentially</T>
      <T x={300} y={250} s={13} f={C.taupe} a="middle" o={flush}>no seek, no read before the write</T>
    </Svg>
  );
}

// 6 · Runs pile up, so compaction merges them.
export function Compaction({ t }: StepCtx) {
  const N = 6;
  const merge = easeOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="Sorted runs accumulate across levels, each about ten times larger than the one above, until a background job merges them" h={320}>
      {Array.from({ length: N }, (_, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.15, 0.6 + i * 0.15));
        const w = 30 + i * 24;
        return <rect key={i} x={30} y={30 + i * 36} width={w * (1 - 0.4 * merge)} height={26} rx={6} fill={C.cinnamon} opacity={clamp(a)} />;
      })}
      <T x={300} y={280} s={15} f={C.crema} a="middle" o={merge}>each level about 10× larger than the one above</T>
      <T x={300} y={306} s={13} f={C.cherryText} a="middle" o={merge}>every byte rewritten again on the way down</T>
    </Svg>
  );
}

// 7 · Three costs, opposite corners.
export function CostTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const b = easeOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="A sixteen-byte update dirties a whole eight-kibibyte page in the B+-tree; the LSM-tree's leveled compaction rewrites bytes near thirty three times" h={320}>
      <T x={25} y={40} s={14} f={C.latte} o={a}>in-place: 16-byte update</T>
      <rect x={25} y={54} width={10} height={30} rx={3} fill={C.caramel} opacity={a} />
      <rect x={60} y={54} width={300} height={30} rx={6} fill={C.cherry} opacity={a} />
      <T x={60} y={106} s={13} f={C.cherryText} o={a}>dirties the whole 8 KB page</T>

      <T x={25} y={150} s={14} f={C.latte} o={b}>out-of-place: compaction (leveled)</T>
      <rect x={25} y={164} width={330 * clamp(b)} height={30} rx={6} fill={C.cinnamon} opacity={b} />
      <T x={25} y={214} s={22} f={C.cinnamon} w={700} o={b}>write amplification ≈ 33×</T>
      <T x={25} y={246} s={16} f={C.taupe} o={b}>space amplification ≈ 1.14×</T>
    </Svg>
  );
}

// 8 · Pick two of three: the RUM conjecture.
export function RumTriangle({ t }: StepCtx) {
  const pts: [number, number][] = [[300, 50], [160, 260], [440, 260]];
  const labels = ['Read', 'Update', 'Memory'];
  const grow = easeOut(seg(t, 0.3, 1.6));
  const pick = easeOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="A triangle of read, update and memory overhead; a design minimizes at most two corners, and the B+-tree and LSM-tree sit at opposite ones" h={320}>
      <polygon points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.taupe} strokeWidth={2} opacity={grow} />
      {pts.map((p, i) => (
        <g key={labels[i]} opacity={grow}>
          <circle cx={p[0]} cy={p[1]} r={8} fill={C.crema} />
          <T x={p[0]} y={p[1] + (i === 0 ? -18 : 24)} s={15} f={C.crema} a="middle">{labels[i]}</T>
        </g>
      ))}
      <circle cx={lerp(300, 160, pick)} cy={lerp(50, 260, pick)} r={10} fill={C.caramel} opacity={pick} />
      <circle cx={lerp(300, 440, pick)} cy={lerp(50, 260, pick)} r={10} fill={C.cinnamon} opacity={pick} />
      <T x={300} y={300} s={14} f={C.taupe} a="middle" o={pick}>two cheap, one pays</T>
    </Svg>
  );
}

// 9 · A Bloom filter answers "maybe" cheaply.
export function BloomFilter({ t }: StepCtx) {
  const N = 20;
  const ask = easeOut(seg(t, 0.3, 1.4));
  const skip = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="A per-file Bloom filter, ten bits per key, answers whether a key could be in a run; most of the time it says no, so point reads touch one file" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>runs on disk</T>
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={25 + i * 60} y={48} width={48} height={34} rx={6} fill={i === 1 ? C.caramel : C.cocoa} opacity={i === 1 ? 1 : 0.6 + 0.2 * skip} />
      ))}
      <T x={300} y={130} s={15} f={C.crema} a="middle" o={ask}>Bloom filter: could the key be here?</T>
      <T x={300} y={160} s={14} f={C.cherryText} a="middle" o={skip}>no, no, no, no — skip, skip, skip, skip</T>
      <T x={300} y={200} s={16} f={C.caramel} a="middle" w={600} o={skip}>10 bits per key, about a 1% false-positive rate</T>
      <T x={300} y={240} s={13} f={C.taupe} a="middle" o={skip}>a range scan gets none of this: every overlapping run is read</T>
    </Svg>
  );
}

// 10 · Predict: orders lookups want which family?
export function OrdersPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Looking up one order by its id, over and over: reads dominate" h={280}>
      <T x={300} y={60} s={16} f={C.latte} a="middle">lookup order_id, over and over</T>
      {!answered && <T x={300} y={160} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <rect x={160} y={120} width={280} height={60} rx={12} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <T x={300} y={156} s={18} f={C.crema} a="middle" w={600}>in-place B+-tree</T>
        </>
      )}
    </Svg>
  );
}

// 11 · Predict: order_events ingest wants which family?
export function EventsPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A terabyte of events pouring in as a high-rate append stream" h={280}>
      <T x={300} y={60} s={16} f={C.latte} a="middle">a terabyte, appending at high rate</T>
      {!answered && <T x={300} y={160} s={48} f={C.cinnamon} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <rect x={160} y={120} width={280} height={60} rx={12} fill={C.roast} stroke={C.cinnamon} strokeWidth={2} />
          <T x={300} y={156} s={18} f={C.crema} a="middle" w={600}>out-of-place LSM-tree</T>
        </>
      )}
    </Svg>
  );
}

// 12 · Back to the shop: one sentence.
export function Verdict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const b = easeOut(seg(t, 1.1, 1.9));
  return (
    <Svg label="A B+-tree trades write cost for read cost; an LSM-tree trades read and space cost for write cost" h={260}>
      <g opacity={a}>
        <T x={25} y={80} s={16} f={C.caramel} w={600}>B+-tree: write cost for read cost</T>
      </g>
      <g opacity={b}>
        <T x={25} y={140} s={16} f={C.cinnamon} w={600}>LSM-tree: read and space cost for write cost</T>
      </g>
      <T x={25} y={200} s={14} f={C.taupe} o={easeOut(seg(t, 2.0, 2.8))}>pick the structure whose cheap side</T>
      <T x={25} y={222} s={14} f={C.taupe} o={easeOut(seg(t, 2.0, 2.8))}>matches your hot path</T>
    </Svg>
  );
}
