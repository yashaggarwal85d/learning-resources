import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = the textbook structure as drawn earlier, and
// data in memory; latte = secondary labels (M, k, a count); taupe = data on disk (spilled), not
// yet read back; caramel = the thing to look at; cinnamon (rare) = the system's modification set
// against the textbook; cherry/cherryText = the bad outcome (a dropped version, a discarded row).
//
// Every printed number is examples.py's or the sources': the four sstables' twelve versions and
// the five live keys a compaction keeps; Velox's twelve streams, eight on the last level and four
// inner nodes; Chapter 6's 4.35 and 3.00 comparisons per output (1.45x); 132,877 against 33,219
// at n = 10,000, N = 10; the predicted 52.49 replacements at n = 2,000; about 175 for the top
// ten of 400,000,000. The simulated mean replacement count comes from a seeded run, so it is
// drawn as shape only, and so are the rows arriving at the bounded heaps.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

/** examples.py's four sstables, each already sorted by user key, then newest sequence number first. */
const SST: [string, number, boolean][][] = [
  [['a', 50, true], ['c', 48, true], ['e', 30, true]],
  [['a', 40, true], ['b', 45, true], ['d', 25, false]],
  [['b', 35, true], ['d', 20, true], ['f', 10, true]],
  [['c', 15, true], ['e', 28, true], ['f', 5, true]],
];
/** examples.py's MERGED, with which stream each entry came from and whether the compaction keeps it. */
const MERGED: { k: string; seq: number; live: boolean; tomb: boolean }[] = [
  { k: 'a', seq: 50, live: true, tomb: false },
  { k: 'a', seq: 40, live: false, tomb: false },
  { k: 'b', seq: 45, live: true, tomb: false },
  { k: 'b', seq: 35, live: false, tomb: false },
  { k: 'c', seq: 48, live: true, tomb: false },
  { k: 'c', seq: 15, live: false, tomb: false },
  { k: 'd', seq: 25, live: false, tomb: true },
  { k: 'd', seq: 20, live: false, tomb: false },
  { k: 'e', seq: 30, live: true, tomb: false },
  { k: 'e', seq: 28, live: false, tomb: false },
  { k: 'f', seq: 10, live: true, tomb: false },
  { k: 'f', seq: 5, live: false, tomb: false },
];

/** A small heap drawn as a seven-node tree (shape only), centred on cx with its root at y. */
const HEAP7 = (cx: number, y: number, dx = 52, dy = 34) => [
  [cx, y],
  [cx - dx, y + dy],
  [cx + dx, y + dy],
  [cx - dx * 1.5, y + dy * 2],
  [cx - dx * 0.5, y + dy * 2],
  [cx + dx * 0.5, y + dy * 2],
  [cx + dx * 1.5, y + dy * 2],
];
const HEAP_EDGES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [1, 4],
  [2, 5],
  [2, 6],
];

function HeapShape({ cx, y, o = 1, rootFill = C.crema, dx = 52, dy = 34, r = 9 }: { cx: number; y: number; o?: number; rootFill?: string; dx?: number; dy?: number; r?: number }) {
  const p = HEAP7(cx, y, dx, dy);
  return (
    <g opacity={o}>
      {HEAP_EDGES.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={p[a][0]} y1={p[a][1]} x2={p[b][0]} y2={p[b][1]} stroke={C.mocha} strokeWidth={1.5} />
      ))}
      {p.map(([x, yy], i) => (
        <circle key={i} cx={x} cy={yy} r={r} fill={i === 0 ? rootFill : C.roast} stroke={C.crema} strokeWidth={1.5} />
      ))}
    </g>
  );
}

// 1 · Hook: a compaction's 20-file merge and a top-10-of-400M query, both a heap
export function MergeHook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 1.0));
  const flow = seg(t, 0.6, 2.6);
  const b = easeOut(seg(t, 2.2, 3.0));
  const ask = easeOut(seg(t, 3.4, 4.2));
  const rev = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const bounce = answered ? seg(s, 0.6, 3.4) : 0;
  return (
    <Svg label="Twenty sorted files funnel through one heap into one output; four hundred million rows reach a heap of ten. After answering: about 175 rows ever replace something, the rest bounce off the root" h={280}>
      <g opacity={a}>
        <T x={30} y={28} s={12} f={C.latte}>20 sorted files, 4 billion keys</T>
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={i}>
            <rect x={30 + i * 13} y={40} width={8} height={46} fill={C.taupe} opacity={0.6} />
            <line x1={34 + i * 13} y1={88} x2={lerp(34 + i * 13, 160, flow)} y2={lerp(88, 112, flow)} stroke={C.latte} strokeWidth={1} opacity={flow} />
          </g>
        ))}
        <circle cx={160} cy={118} r={8} fill={C.caramel} opacity={flow} />
        <rect x={60} y={134} width={200 * flow} height={10} fill={C.crema} opacity={0.8} />
        <T x={60} y={162} s={12} f={C.latte} o={flow}>one merged output</T>
      </g>
      <g opacity={b}>
        <T x={330} y={28} s={12} f={C.latte}>top 10 of 400,000,000</T>
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x={340 + i * 22} y={62} width={16} height={16} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => {
          const p = (bounce * 6 + i / 9) % 1;
          return answered ? <circle key={i} cx={350 + i * 24} cy={lerp(160, 92, Math.min(1, p * 2)) + (p > 0.5 ? (p - 0.5) * 120 : 0)} r={3} fill={p > 0.5 ? C.cherryText : C.latte} opacity={rev} /> : null;
        })}
      </g>
      <T x={300} y={215} s={13} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>rows that replace something in the heap: ?</T>
      <g opacity={rev}>
        <T x={300} y={215} s={14} a="middle" f={C.caramel}>about 175 replace something</T>
        <T x={300} y={243} s={12} a="middle" f={C.cherryText}>the rest lose to the root and are thrown away</T>
      </g>
    </Svg>
  );
}

// 2 · Chapter 6's picture recapped in one frame: twenty streams, a heap of cursors, pop and sift
export function Chapter6Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const h = easeOut(seg(t, 0.9, 1.7));
  const cycle = t < 1.9 ? -1 : ((t - 1.9) / 1.0) % 1;
  const pops = t < 1.9 ? 0 : Math.floor((t - 1.9) / 1.0) + 1;
  const popY = cycle < 0 ? 150 : cycle < 0.4 ? lerp(150, 120, easeOut(cycle / 0.4)) : 120;
  const sift = cycle >= 0.4 ? easeInOut(seg(cycle, 0.4, 0.9)) : 0;
  const pts = HEAP7(300, 150);
  return (
    <Svg label="Twenty file streams feed one heap of cursors; the smallest cursor pops to the output, its stream advances, and the heap re-sifts, once per output row" h={280}>
      <g opacity={a}>
        <T x={300} y={26} s={12} a="middle" f={C.latte}>20 streams, one cursor each</T>
        {Array.from({ length: 20 }).map((_, i) => (
          <g key={i}>
            <line x1={72 + i * 24} y1={40} x2={72 + i * 24} y2={80} stroke={C.taupe} strokeWidth={2} />
            <circle cx={72 + i * 24} cy={84} r={3.5} fill={C.crema} />
          </g>
        ))}
      </g>
      <HeapShape cx={300} y={150} o={h} />
      {cycle >= 0 && <circle cx={300} cy={popY} r={9} fill={C.caramel} opacity={1 - sift} />}
      {cycle >= 0.4 && <circle cx={lerp(300, pts[1][0], sift)} cy={lerp(150, pts[1][1], sift)} r={9} fill={C.latte} />}
      <g opacity={h}>
        <T x={300} y={242} s={12} a="middle" f={C.latte}>heap of cursors</T>
        <rect x={460} y={140} width={Math.min(6, pops) * 14} height={14} fill={C.caramel} opacity={0.8} />
        <T x={460} y={130} s={12} f={C.latte}>output</T>
      </g>
      <T x={300} y={268} s={12} a="middle" f={C.caramel} o={pops > 0 ? 1 : 0}>
        {cycle < 0.4 ? 'pop the smallest' : 'advance, sift down'}
      </T>
    </Svg>
  );
}

// 3 · Pebble's mergingIter: the same heap, min-heap forward, max-heap backward
export function PebbleHeap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const fwd = easeOut(seg(t, 0.9, 1.8));
  const flip = easeInOut(seg(t, 2.6, 3.6));
  const kids = ['memtable', 'L0', 'L1', 'L2'];
  return (
    <Svg label="Pebble's mergingIter: four child iterators feed one heap. Forward, Next pops the smallest key a at the root; backward, the same heap judged the opposite way puts the largest key f at the root and Prev pops it" h={280}>
      <g opacity={a}>
        <T x={300} y={26} s={12} a="middle" f={C.latte}>mergingIter: one heap of child iterators</T>
        {kids.map((k, i) => (
          <g key={k}>
            <rect x={60 + i * 130} y={40} width={90} height={26} fill={C.roast} stroke={C.mocha} />
            <T x={105 + i * 130} y={58} s={12} a="middle" f={C.crema}>{k}</T>
            <line x1={105 + i * 130} y1={66} x2={300} y2={112} stroke={C.mocha} strokeWidth={1} />
          </g>
        ))}
      </g>
      <HeapShape cx={300} y={124} o={a} rootFill={C.roast} dx={46} dy={30} r={12} />
      <g opacity={fwd * (1 - flip)}>
        <T x={300} y={129} s={12} a="middle" f={C.caramel}>a</T>
        <T x={300} y={236} s={13} a="middle" f={C.crema}>min-heap: Next pops a</T>
        <T x={300} y={264} s={12} a="middle" f={C.latte}>smallest key at the root →</T>
      </g>
      <g opacity={flip}>
        <T x={300} y={129} s={12} a="middle" f={C.cinnamon}>f</T>
        <T x={300} y={236} s={13} a="middle" f={C.cinnamon}>max-heap: Prev pops f</T>
        <T x={300} y={264} s={12} a="middle" f={C.latte}>← largest key at the root</T>
      </g>
    </Svg>
  );
}

// 4 · RocksDB's comparator: a tie on the user key is broken by decreasing sequence number
export function RocksDBComparator({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const tie = easeOut(seg(t, 1.0, 1.8));
  const rule = easeOut(seg(t, 2.0, 2.8));
  const rise = easeInOut(seg(t, 3.0, 4.0));
  return (
    <Svg label="Two streams both hold key a, at sequence numbers 50 and 40. The keys tie, so the comparator orders them by decreasing sequence number and a at 50, the newest version, comes out of the heap first" h={280}>
      <g opacity={a}>
        <T x={300} y={26} s={12} a="middle" f={C.latte}>two sstables, same user key</T>
        <rect x={110} y={48} width={140} height={34} fill={C.roast} stroke={C.mocha} />
        <T x={180} y={70} s={14} a="middle" f={C.crema}>a @ 50</T>
        <rect x={350} y={48} width={140} height={34} fill={C.roast} stroke={C.mocha} />
        <T x={420} y={70} s={14} a="middle" f={C.crema}>a @ 40</T>
      </g>
      <g opacity={tie}>
        <T x={300} y={110} s={13} a="middle" f={C.crema}>key: a = a, a tie</T>
      </g>
      <g opacity={rule}>
        <T x={300} y={140} s={13} a="middle" f={C.cinnamon}>tie broken by decreasing sequence number</T>
      </g>
      <circle cx={300} cy={lerp(230, 180, rise)} r={20} fill={C.caramel} opacity={rise} />
      <T x={300} y={lerp(235, 185, rise)} s={12} a="middle" f={C.ink} o={rise}>a@50</T>
      <T x={300} y={225} s={12} a="middle" f={C.taupe} o={rise}>a@40 waits behind it</T>
      <T x={300} y={260} s={12} a="middle" f={C.caramel} o={rise}>newest version first, no special case</T>
    </Svg>
  );
}

// 5 · A compaction: one merging iterator over every input file, then shadowed versions dropped
export function CompactionDrop({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const shown = stepIdx(t, 1.0, 2.8, 12);
  const drop = easeOut(seg(t, 3.2, 4.0));
  const keep = easeInOut(seg(t, 4.3, 5.2));
  const LIVE = MERGED.filter((m) => m.live);
  return (
    <Svg label="Four sstables hold twelve versions. The merging iterator emits them in order, newest first per key; the compaction then drops every shadowed older version and the tombstoned d, and five live keys survive" h={290}>
      <g opacity={a}>
        {SST.map((st, i) => (
          <g key={i}>
            <T x={18} y={30 + i * 22} s={12} f={C.taupe}>{`sst ${i + 1}`}</T>
            {st.map(([k, seq, v], j) => (
              <T key={j} x={92 + j * 60} y={30 + i * 22} s={12} f={v ? C.crema : C.cherryText}>{v ? `${k}@${seq}` : `${k}@${seq}✝`}</T>
            ))}
          </g>
        ))}
        <T x={300} y={52} s={12} f={C.latte}>one merging iterator</T>
        <T x={300} y={74} s={12} f={C.latte}>over all of them</T>
      </g>
      {MERGED.map((m, i) => {
        const x = 40 + (i % 6) * 92;
        const y = 136 + Math.floor(i / 6) * 28;
        const on = i <= shown ? 1 : 0;
        const dead = !m.live;
        return (
          <g key={i} opacity={on * (dead ? 1 - 0.75 * drop : 1 - keep)}>
            <T x={x} y={y} s={12} f={dead && drop > 0 ? C.cherryText : C.crema}>{m.tomb ? `${m.k}@${m.seq}✝` : `${m.k}@${m.seq}`}</T>
          </g>
        );
      })}
      <T x={300} y={200} s={12} a="middle" f={C.cherryText} o={drop * (1 - keep)}>shadowed versions and the tombstone: dropped</T>
      {LIVE.map((m, i) => (
        <T key={m.k} x={lerp(40 + (MERGED.indexOf(m) % 6) * 92, 70 + i * 100, keep)} y={lerp(136 + Math.floor(MERGED.indexOf(m) / 6) * 28, 230, keep)} s={13} f={C.caramel} o={keep}>{`${m.k}@${m.seq}`}</T>
      ))}
      <T x={300} y={270} s={12} a="middle" f={C.latte} o={keep}>12 versions in, 5 live keys out</T>
    </Svg>
  );
}

/** Velox's worked example: twelve streams, the second-last level's eight places, four of them inner nodes. */
const SL_X = Array.from({ length: 8 }, (_, i) => 60 + i * 68);
const LEAF_X = Array.from({ length: 8 }, (_, i) => SL_X[Math.floor(i / 2)] + (i % 2 === 0 ? -17 : 17));

// 6 · Predict: the tree-of-losers shape for 12 streams
export function PredictTreeShape({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.9));
  const ask = easeOut(seg(t, 1.2, 2.0));
  const tree = answered ? easeOut(seg(s, 0.1, 0.9)) : 0;
  const fly = answered ? easeInOut(seg(s, 0.9, 2.0)) : 0;
  const lab = answered ? easeOut(seg(s, 2.0, 2.6)) : 0;
  // Final spots: streams 0-7 on the last level under the four left inner nodes; 8-11 on the right half of the second-last level.
  const target = (i: number): [number, number] => (i < 8 ? [LEAF_X[i], 228] : [SL_X[i - 4], 188]);
  const L2 = [0, 1, 2, 3].map((i) => (SL_X[i * 2] + SL_X[i * 2 + 1]) / 2);
  const L1 = [0, 1].map((i) => (L2[i * 2] + L2[i * 2 + 1]) / 2);
  return (
    <Svg label="Twelve streams to merge. After answering: the second-last level has eight places; its left four become inner nodes whose eight streams move down to the last level, and the right four hold the other four streams" h={290}>
      <T x={300} y={22} s={12} a="middle" f={C.latte} o={a}>twelve streams to merge</T>
      <T x={300} y={44} s={13} a="middle" f={C.caramel} o={rev(ask, tree)}>every level above the leaves full?</T>
      <g opacity={tree}>
        <circle cx={300} cy={68} r={8} fill={C.roast} stroke={C.mocha} strokeWidth={1.5} />
        {L1.map((x) => (
          <g key={x}>
            <line x1={300} y1={68} x2={x} y2={108} stroke={C.mocha} />
            <circle cx={x} cy={108} r={8} fill={C.roast} stroke={C.mocha} strokeWidth={1.5} />
          </g>
        ))}
        {L2.map((x, i) => (
          <g key={x}>
            <line x1={L1[Math.floor(i / 2)]} y1={108} x2={x} y2={148} stroke={C.mocha} />
            <circle cx={x} cy={148} r={8} fill={C.roast} stroke={C.mocha} strokeWidth={1.5} />
            <line x1={x} y1={148} x2={SL_X[i * 2]} y2={188} stroke={C.mocha} />
            <line x1={x} y1={148} x2={SL_X[i * 2 + 1]} y2={188} stroke={C.mocha} />
          </g>
        ))}
        {SL_X.slice(0, 4).map((x, i) => (
          <g key={x}>
            <line x1={x} y1={188} x2={LEAF_X[i * 2]} y2={228} stroke={C.mocha} opacity={fly} />
            <line x1={x} y1={188} x2={LEAF_X[i * 2 + 1]} y2={228} stroke={C.mocha} opacity={fly} />
            <circle cx={x} cy={188} r={9} fill={C.roast} stroke={C.caramel} strokeWidth={2} opacity={fly} />
          </g>
        ))}
      </g>
      {Array.from({ length: 12 }).map((_, i) => {
        const [tx, ty] = target(i);
        const sx = 50 + i * 45;
        return <circle key={i} cx={lerp(sx, tx, fly)} cy={lerp(110, ty, fly)} r={7} fill={C.crema} opacity={a} />;
      })}
      <g opacity={lab}>
        <T x={300} y={266} s={12} a="middle" f={C.caramel}>4 inner nodes, 8 on the last level</T>
        <T x={434} y={216} s={12} a="middle" f={C.crema}>4 streams stay up</T>
      </g>
    </Svg>
  );
}

/** Question opacity: shown until the reveal starts, then gone at once. */
const rev = (ask: number, r: number) => (r > 0 ? 0 : ask);

// 7 · Spark's two heaps: an empty reader is never enqueued; a reversed comparator gives a min-heap
export function SparkTwoHeaps({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const enter = easeInOut(seg(t, 0.9, 2.0));
  const no = easeOut(seg(t, 1.6, 2.3));
  const b = easeOut(seg(t, 2.8, 3.6));
  const flip = easeInOut(seg(t, 4.0, 5.0));
  const keys = ['a', 'b', 'c'];
  return (
    <Svg label="Left: three spill readers, one empty; the two with records enter the priority queue and the empty one is never enqueued. Right: a max-heap with its comparator reversed puts the smallest key, a, on top" h={280}>
      <g opacity={a}>
        <T x={150} y={24} s={12} a="middle" f={C.crema}>UnsafeSorterSpillMerger</T>
        {[0, 1, 2].map((i) => {
          const empty = i === 1;
          const y = 50 + i * 40;
          return (
            <g key={i}>
              <rect x={30} y={y} width={70} height={24} fill={empty ? 'none' : C.taupe} stroke={C.crema} strokeWidth={1} opacity={0.8} />
              {!empty && <circle cx={lerp(110, 210, enter)} cy={lerp(y + 12, 108, enter)} r={6} fill={C.crema} />}
            </g>
          );
        })}
        <T x={65} y={186} s={12} a="middle" f={C.latte}>readers</T>
        <rect x={190} y={84} width={80} height={48} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
        <T x={230} y={152} s={12} a="middle" f={C.latte}>queue</T>
      </g>
      <g opacity={no}>
        <line x1={110} y1={102} x2={160} y2={102} stroke={C.cherryText} strokeWidth={2} />
        <T x={135} y={222} s={12} a="middle" f={C.cherryText}>empty: never enqueued</T>
      </g>
      <g opacity={b}>
        <line x1={300} y1={20} x2={300} y2={240} stroke={C.mocha} />
        <T x={450} y={24} s={12} a="middle" f={C.crema}>ExternalSorter.mergeSort</T>
        <T x={450} y={50} s={12} a="middle" f={flip > 0.5 ? C.cinnamon : C.latte}>{flip > 0.5 ? 'comparator reversed' : 'max-heap only'}</T>
        {keys.map((k, i) => {
          const top = lerp(2 - i, i, flip);
          return (
            <g key={k}>
              <rect x={410} y={70 + top * 40} width={80} height={32} fill={top < 0.5 ? C.caramel : C.roast} stroke={C.crema} strokeWidth={1} />
              <T x={450} y={91 + top * 40} s={13} a="middle" f={top < 0.5 ? C.ink : C.crema}>{k}</T>
            </g>
          );
        })}
        <T x={450} y={222} s={12} a="middle" f={C.caramel} o={flip}>its "maximum" is the smallest key</T>
      </g>
    </Svg>
  );
}

// 8 · Measured in Chapter 6: heap against loser tree, comparisons per output at fan-in eight
export function HeapVsLoserMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const g1 = easeOut(seg(t, 0.8, 2.0));
  const g2 = easeOut(seg(t, 1.6, 2.8));
  const r = easeOut(seg(t, 3.0, 3.8));
  const why = easeOut(seg(t, 4.2, 5.0));
  const full = 300;
  return (
    <Svg label="At a fan-in of eight, a heap spends 4.35 comparisons per output and a loser tree 3.00, 1.45 times fewer; three of the four engines read still choose the heap" h={270}>
      <T x={300} y={30} s={12} a="middle" f={C.latte} o={a}>comparisons per output, fan-in 8 (Chapter 6's lab)</T>
      <g opacity={a}>
        <T x={140} y={84} s={12} a="end" f={C.crema}>heap</T>
        <rect x={150} y={70} width={full} height={20} fill={C.cocoa} />
        <rect x={150} y={70} width={full * (4.35 / 5) * g1} height={20} fill={C.crema} />
        <T x={150 + full * (4.35 / 5) + 8} y={85} s={12} f={C.crema} o={g1 > 0.98 ? 1 : 0}>4.35</T>
        <T x={140} y={124} s={12} a="end" f={C.cinnamon}>loser tree</T>
        <rect x={150} y={110} width={full} height={20} fill={C.cocoa} />
        <rect x={150} y={110} width={full * (3.0 / 5) * g2} height={20} fill={C.cinnamon} />
        <T x={150 + full * (3.0 / 5) + 8} y={125} s={12} f={C.cinnamon} o={g2 > 0.98 ? 1 : 0}>3.00 = log₂ 8</T>
      </g>
      <T x={300} y={172} s={14} a="middle" f={C.caramel} o={r}>the heap: 1.45x more comparisons</T>
      <g opacity={why}>
        <T x={300} y={208} s={12} a="middle" f={C.crema}>three of four engines read still choose the heap</T>
        <T x={300} y={234} s={12} a="middle" f={C.latte}>it adapts to an uneven fan-in, no rebuild step</T>
      </g>
    </Svg>
  );
}

// 9 · The bounded heap, upside down: the worst kept row at the root
export function BoundedHeapRoot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const r1 = seg(t, 1.0, 2.2);
  const r2 = seg(t, 2.4, 3.8);
  const sw = easeOut(seg(t, 4.0, 4.8));
  const fillBar = easeInOut(seg(t, 4.2, 5.6));
  const pts = HEAP7(200, 90);
  const root = pts[0];
  // Row one loses at the root and falls away; row two beats the root, takes its place and sifts down.
  const p1y = r1 < 0.5 ? lerp(40, root[1] - 14, r1 * 2) : lerp(root[1] - 14, 60, (r1 - 0.5) * 2);
  const p1x = r1 < 0.5 ? 60 : lerp(root[0] - 20, 40, (r1 - 0.5) * 2);
  const sift = easeInOut(seg(r2, 0.5, 1));
  return (
    <Svg label="A bounded top-N heap keeps its worst kept row at the root. A row that cannot beat the root is discarded after one comparison; one that beats it replaces the root and sifts down. The switch to this heap fires once the input passes twice the bound" h={280}>
      <HeapShape cx={200} y={90} o={a} rootFill={C.cherry} />
      <T x={200} y={66} s={12} a="middle" f={C.latte} o={a}>root: the worst row kept</T>
      {r1 > 0 && r1 < 1 && <circle cx={r1 < 0.5 ? lerp(60, root[0] - 20, r1 * 2) : p1x} cy={p1y + 20} r={6} fill={r1 < 0.5 ? C.crema : C.cherryText} />}
      <T x={430} y={110} s={12} a="middle" f={C.cherryText} o={easeOut(seg(t, 1.6, 2.0)) * (1 - easeOut(seg(t, 2.4, 2.6)))}>loses: one comparison, gone</T>
      {r2 > 0 && r2 < 1 && <circle cx={lerp(root[0], pts[1][0], sift)} cy={r2 < 0.5 ? lerp(30, root[1], r2 * 2) : lerp(root[1], pts[1][1], sift)} r={8} fill={C.caramel} />}
      <T x={430} y={110} s={12} a="middle" f={C.caramel} o={easeOut(seg(t, 2.8, 3.2)) * (1 - sw)}>beats it: replaces root, sifts</T>
      <g opacity={sw}>
        <T x={300} y={222} s={12} a="middle" f={C.latte}>switch to the bounded heap when input passes 2N</T>
        <rect x={100} y={236} width={400} height={10} fill={C.cocoa} />
        <rect x={100} y={236} width={400 * fillBar} height={10} fill={fillBar > 0.5 ? C.caramel : C.crema} />
        <line x1={300} y1={230} x2={300} y2={252} stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={270} s={12} a="middle" f={C.caramel}>2N</T>
      </g>
    </Svg>
  );
}

// 10 · Spark's bounded top-K for ORDER BY ... LIMIT: per partition, shuffled, then once more
export function SparkBoundedTopN({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const local = easeOut(seg(t, 0.9, 2.0));
  const shuffle = easeInOut(seg(t, 2.4, 3.6));
  const last = easeOut(seg(t, 3.8, 4.8));
  const parts = [0, 1, 2, 3];
  return (
    <Svg label="Four partitions each keep their own bounded top K, only those small local winners are shuffled to one partition, and the same bounded heap runs once more over them" h={280}>
      <g opacity={a}>
        {parts.map((p) => (
          <g key={p}>
            <rect x={40 + p * 140} y={30} width={100} height={50} fill={C.taupe} opacity={0.35} />
            <T x={90 + p * 140} y={22} s={12} a="middle" f={C.latte}>{`partition ${p + 1}`}</T>
          </g>
        ))}
      </g>
      {parts.map((p) =>
        [0, 1, 2].map((j) => (
          <rect
            key={`${p}-${j}`}
            x={lerp(58 + p * 140 + j * 24, 252 + p * 8 + j * 2, shuffle)}
            y={lerp(96, 168, shuffle)}
            width={18}
            height={14}
            fill={C.crema}
            opacity={local * (1 - 0.6 * last)}
          />
        )),
      )}
      <T x={300} y={130} s={12} a="middle" f={C.crema} o={local * (1 - shuffle)}>each partition: its own bounded top K</T>
      <rect x={240} y={160} width={120} height={30} fill="none" stroke={C.cinnamon} strokeWidth={1.5} opacity={shuffle} />
      <T x={300} y={210} s={12} a="middle" f={C.cinnamon} o={shuffle * (1 - last)}>only the local winners shuffle</T>
      <g opacity={last}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={264 + j * 26} y={168} width={18} height={14} fill={C.caramel} />
        ))}
        <T x={300} y={222} s={13} a="middle" f={C.caramel}>the same bounded heap, once more</T>
        <T x={300} y={250} s={12} a="middle" f={C.latte}>takeOrdered: the opposite of top</T>
      </g>
    </Svg>
  );
}

// 11 · The arithmetic: n log N against n log n, and why so few rows reach the root
export function ReplacementArithmetic({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.7));
  const g = easeOut(seg(t, 0.5, 1.6));
  const curve = seg(t, 1.9, 3.3);
  const f = easeOut(seg(t, 3.4, 4.1));
  const sim = easeOut(seg(t, 4.2, 5.0));
  const big = easeOut(seg(t, 5.2, 6.0));
  const W = 230;
  const pts = Array.from({ length: 40 }, (_, i) => {
    const x = i / 39;
    const n = 10 + x * 1990;
    return [340 + x * 230, 130 - 85 * (10 / n)] as [number, number];
  });
  const shown = Math.max(1, Math.floor(curve * pts.length));
  return (
    <Svg label="At n of ten thousand and N of ten, a full sort costs about 132,877 comparisons and a bounded heap about 33,219. A row arriving at position i beats the kept ten with chance ten over i, a curve that keeps falling; summed, that is k times the gap between two harmonic numbers, 52.49 predicted at n of two thousand and confirmed by simulation, and about 175 for four hundred million rows" h={290}>
      <g opacity={a}>
        <T x={20} y={26} s={12} f={C.latte}>n = 10,000, N = 10</T>
        <T x={20} y={52} s={12} f={C.crema}>n log n</T>
        <rect x={20} y={58} width={W * g} height={14} fill={C.crema} />
        <T x={20} y={90} s={12} f={C.cinnamon}>n log N</T>
        <rect x={20} y={96} width={W * (33219 / 132877) * g} height={14} fill={C.cinnamon} />
        <T x={20} y={130} s={12} f={C.crema} o={g > 0.98 ? 1 : 0}>132,877 vs 33,219</T>
      </g>
      <g opacity={curve > 0 ? 1 : 0}>
        <T x={458} y={26} s={12} a="middle" f={C.latte}>chance row i gets in: k/i</T>
        <line x1={340} y1={130} x2={575} y2={130} stroke={C.mocha} />
        <line x1={340} y1={40} x2={340} y2={130} stroke={C.mocha} />
        <polyline
          points={pts
            .slice(0, shown)
            .map(([x, y]) => `${x},${y}`)
            .join(' ')}
          fill="none"
          stroke={C.caramel}
          strokeWidth={2}
        />
        <T x={575} y={148} s={12} a="end" f={C.taupe}>later rows →</T>
      </g>
      <T x={300} y={186} s={14} a="middle" f={C.crema} o={f}>k · (Hₙ − H_k) replacements</T>
      <g opacity={sim * (1 - big)}>
        <T x={300} y={222} s={12} a="middle" f={C.latte}>n = 2,000: predicted 52.49</T>
        <rect x={200} y={234} width={200} height={10} fill={C.crema} />
        <rect x={200} y={250} width={200 * sim} height={10} fill={C.taupe} />
        <T x={410} y={259} s={12} f={C.taupe}>simulated: agrees</T>
      </g>
      <g opacity={big}>
        <T x={300} y={232} s={15} a="middle" f={C.caramel}>top 10 of 400,000,000: about 175</T>
        <T x={300} y={262} s={12} a="middle" f={C.latte}>everything else: one comparison, discarded</T>
      </g>
    </Svg>
  );
}

// 12 · Recap and handoff: streams become tasks, sorted order becomes dependency order
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const pick = easeOut(seg(t, 0.9, 1.8));
  const morph = easeInOut(seg(t, 2.2, 3.4));
  const next = easeOut(seg(t, 3.6, 4.4));
  return (
    <Svg label="Several streams wait and a heap picks the next ready one. Turn the streams into tasks with dependency edges and the same shape picks the next task whose dependencies are done: topological sort, next" h={260}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={a}>
          <rect x={30 + i * 76} y={lerp(50, 50 + (i % 2) * 50, morph)} width={64} height={26} fill={C.roast} stroke={morph > 0.5 ? C.cinnamon : C.crema} strokeWidth={1.5} />
          <T x={62 + i * 76} y={lerp(68, 68 + (i % 2) * 50, morph)} s={12} a="middle" f={C.crema}>{morph > 0.5 ? `task ${i + 1}` : `s${i + 1}`}</T>
        </g>
      ))}
      <g opacity={morph}>
        <line x1={94} y1={63} x2={106} y2={113} stroke={C.cinnamon} strokeWidth={1.5} />
        <line x1={170} y1={113} x2={182} y2={63} stroke={C.cinnamon} strokeWidth={1.5} />
        <line x1={246} y1={63} x2={258} y2={113} stroke={C.cinnamon} strokeWidth={1.5} />
      </g>
      <g opacity={a}>
        <line x1={340} y1={80} x2={400} y2={80} stroke={C.latte} strokeWidth={1.5} />
        <circle cx={440} cy={80} r={22} fill={pick > 0.5 ? C.caramel : C.roast} stroke={C.crema} strokeWidth={1.5} />
        <T x={440} y={124} s={12} a="middle" f={C.latte}>next ready</T>
      </g>
      <T x={300} y={180} s={13} a="middle" f={C.crema} o={morph > 0 ? 0 : pick}>a heap picks the next-ready stream</T>
      <T x={300} y={180} s={13} a="middle" f={C.cinnamon} o={morph}>ready = nothing it depends on is undone</T>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={next}>next: topological sort inside schedulers</T>
    </Svg>
  );
}
