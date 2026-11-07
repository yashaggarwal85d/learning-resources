import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a structure as the textbook draws it; latte = labels;
// caramel = the thing to look at (the bits being read, the batch being split); cinnamon (rare) =
// the second reading of the same value, or the side that receives the filter; cherry/cherryText =
// what the memory budget costs (rows written to disk, a split that cannot help).
//
// Every printed number is examples.py's: 4,000 customers against a budget of 200 rows; 80,000
// orders; 4,096 buckets (log₂ 12); the hash of customer 42, 1825008443, its bucket 2875 and batch
// 22; the largest batch at 1, 2, 4, 8, 16, 32 batches, 4,000, 2,028, 1,025, 530, 285, 155; about
// 92% of orders spilled; the skew table's 2% of 200 = 4 rows; Spark's 8,388,608 bits for
// 1,000,000 items, 8.4 bits each, k = 6, a formula rate of about 1.8%. Which customers are hot and
// the measured false-positive rate come from seeded runs, so they are drawn as shape only.

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

// 1 · Hook and predict: twenty times the budget
export function JoinHook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.9, 1.5));
  const q = stepIdx(t, 2.0, 3.5, 3);
  const rev = answered ? stepIdx(s, 0.2, 1.4, 3) : -1;
  const asks: [string, string][] = [
    ['batches', '32'],
    ['order rows to disk', 'about 92%'],
    ['filter bits per customer', '8.4'],
  ];
  return (
    <Svg label="Customers, 4,000 rows, as the build side; a memory box of 200 rows, one twentieth of it; 80,000 orders as the probe side. Three questions: how many batches, how much of the orders goes to disk, how many filter bits per customer. After answering: 32, about 92%, 8.4" h={290}>
      <g opacity={a}>
        <T x={30} y={30} s={12} f={C.latte}>customers, the build side: 4,000 rows</T>
        <rect x={30} y={42} width={400} height={20} fill={C.crema} opacity={0.35} />
        <rect x={30} y={42} width={20} height={20} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={30} y={84} s={12} f={C.caramel}>memory: 200 rows, one twentieth</T>
      </g>
      <g opacity={b}>
        <T x={30} y={120} s={12} f={C.latte}>orders, the probe side: 80,000 rows</T>
        <rect x={30} y={130} width={540} height={14} fill={C.latte} opacity={0.25} />
      </g>
      {asks.map(([lab, v], i) => (
        <g key={lab} opacity={i <= q ? 1 : 0}>
          <T x={30} y={186 + i * 32} s={12} f={C.crema}>{lab}</T>
          <T x={330} y={186 + i * 32} s={14} f={i <= rev ? C.caramel : C.taupe}>{i <= rev ? v : '?'}</T>
        </g>
      ))}
    </Svg>
  );
}

function Chained({ x0, y0, chains }: { x0: number; y0: number; chains: number[] }) {
  return (
    <g>
      {chains.map((n, i) => (
        <g key={i}>
          <rect x={x0} y={y0 + i * 30} width={30} height={22} fill="none" stroke={C.crema} strokeWidth={1.2} />
          {Array.from({ length: n }).map((_, j) => (
            <g key={j}>
              <line x1={x0 + 30 + j * 40} y1={y0 + i * 30 + 11} x2={x0 + 40 + j * 40} y2={y0 + i * 30 + 11} stroke={C.latte} strokeWidth={1} />
              <rect x={x0 + 40 + j * 40} y={y0 + i * 30 + 3} width={26} height={16} fill={C.crema} opacity={0.4} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
}

// 2 · The textbook table, then the same table inside a box
export function TwoColumnStrip({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 1.2, 1.8));
  const box = easeInOut(seg(t, 2.2, 3.4));
  const end = easeOut(seg(t, 3.7, 4.3));
  const chains = [2, 1, 3, 0, 2, 1];
  return (
    <Svg label="Left: the textbook chained hash table, buckets with chains, unboxed. Right: the identical buckets and chains, with a memory budget's box closing in around them" h={270}>
      <g opacity={a}>
        <T x={30} y={28} s={12} f={C.latte}>textbook: no box</T>
        <Chained x0={30} y0={44} chains={chains} />
      </g>
      <g opacity={b}>
        <T x={330} y={28} s={12} f={C.latte}>the join's table</T>
        <Chained x0={330} y0={44} chains={chains} />
        <rect x={lerp(300, 318, box)} y={lerp(20, 36, box)} width={lerp(280, 250, box)} height={lerp(240, 196, box)} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="6 4" opacity={box} />
      </g>
      <T x={300} y={260} s={12} a="middle" f={C.caramel} o={end}>same buckets, inside a box someone else sized</T>
    </Svg>
  );
}

const H42 = 1825008443;

// 3 · One hash, two readings: bucket from the low bits, batch from the next
export function BucketBatchSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const low = easeOut(seg(t, 0.8, 1.4));
  const rot = easeInOut(seg(t, 2.0, 3.2));
  const bat = easeOut(seg(t, 3.4, 4.0));
  const bits = H42.toString(2).padStart(32, '0');
  const bw = 16.5;
  const x0 = 36;
  return (
    <Svg label="The 32-bit hash of customer 42, 1825008443. Its low 12 bits, masked by 4,096 buckets, give bucket 2875. Rotated right by 12, its next five bits come to the bottom, masked by 32 batches: batch 22" h={270}>
      <T x={30} y={28} s={12} f={C.latte} o={a}>hash of customer 42 = 1825008443</T>
      {[...bits].map((b, i) => {
        const fromRight = 31 - i;
        const isBucket = fromRight < 12;
        const isBatch = fromRight >= 12 && fromRight < 17;
        const col = isBucket && low > 0.5 ? C.caramel : isBatch && bat > 0.5 ? C.cinnamon : C.latte;
        // rotate right by 12: bit at position p moves to (p − 12) mod 32
        const p = fromRight;
        const p2 = (p - 12 + 32) % 32;
        const xNow = x0 + (31 - p) * bw;
        const xRot = x0 + (31 - p2) * bw;
        const x = lerp(xNow, xRot, rot);
        const y = 60 + (rot > 0 && rot < 1 ? Math.sin(rot * Math.PI) * (isBucket ? -14 : 0) : 0);
        return (
          <g key={i} opacity={a}>
            <rect x={x} y={y} width={bw - 2} height={22} fill="none" stroke={col} strokeWidth={col === C.latte ? 1 : 2} />
            <T x={x + (bw - 2) / 2} y={y + 16} s={12} a="middle" f={col}>{b}</T>
          </g>
        );
      })}
      <g opacity={low * (1 - rot)}>
        <T x={x0 + 20 * bw} y={110} s={12} f={C.caramel}>low 12 bits → bucket 2875</T>
        <T x={x0 + 20 * bw} y={130} s={11} f={C.latte}>of 4,096</T>
      </g>
      <T x={30} y={170} s={12} f={C.latte} o={rot}>rotate right by 12</T>
      <g opacity={bat}>
        <T x={x0 + 27 * bw} y={110} s={12} a="end" f={C.cinnamon}>low 5 bits now → batch 22 of 32</T>
      </g>
      <T x={300} y={236} s={12} a="middle" f={C.crema} o={bat}>one well-mixed number, two separate answers</T>
    </Svg>
  );
}

// 4 · The batch count doubles until every batch fits
export function BatchGrowth({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const k = stepIdx(t, 0.6, 3.6, 6);
  const end = easeOut(seg(t, 3.9, 4.4));
  const rows: [number, number][] = [
    [1, 4000],
    [2, 2028],
    [4, 1025],
    [8, 530],
    [16, 285],
    [32, 155],
  ];
  const X = (v: number) => 180 + v * 0.09;
  return (
    <Svg label="Largest batch against a budget of 200 rows as the batch count doubles: 1 batch, 4,000; 2, 2,028; 4, 1,025; 8, 530; 16, 285; 32, 155, the first that fits" h={270}>
      <g opacity={a}>
        <line x1={X(200)} y1={30} x2={X(200)} y2={218} stroke={C.cinnamon} strokeWidth={2} />
        <T x={X(200)} y={234} s={11} a="middle" f={C.cinnamon}>budget 200</T>
        <T x={30} y={22} s={11} f={C.latte}>batches: largest one</T>
      </g>
      {rows.map(([n, m], i) => {
        const y = 36 + i * 30;
        const fits = m <= 200;
        return (
          <g key={n} opacity={i <= k ? 1 : 0}>
            <T x={30} y={y + 13} s={12} f={C.crema}>{`${n}`}</T>
            <T x={90} y={y + 13} s={12} f={fits ? C.caramel : C.latte}>{m.toLocaleString('en-US')}</T>
            <rect x={180} y={y} width={m * 0.09} height={16} fill={fits ? C.caramel : C.cherry} opacity={0.7} />
          </g>
        );
      })}
      <T x={300} y={262} s={12} a="middle" f={C.caramel} o={end}>each old batch becomes exactly two</T>
    </Svg>
  );
}

// 5 · Predict: does splitting spread one hot key?
export function PredictStopCondition({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const ask = easeOut(seg(t, 1.5, 2.0));
  const sp = answered ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const rev = answered ? easeOut(seg(s, 1.4, 2.0)) : 0;
  const rows = Array.from({ length: 24 }, (_, i) => ({ hot: i % 4 !== 3, side: i % 8 === 3 ? 1 : 0 }));
  return (
    <Svg label="One batch, most of it rows of one hot customer. After answering, the batch splits in two: the other keys divide, but every row of the hot customer shares one hash, so all of them land in the same half" h={260}>
      <T x={30} y={28} s={12} f={C.latte} o={a}>one batch, mostly one customer's rows</T>
      {rows.map((r, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x0 = 150 + col * 34;
        const y0 = 50 + row * 26;
        const goRight = !r.hot && r.side === 1;
        const x = x0 + (goRight ? 220 : -60) * sp;
        return <rect key={i} x={x} y={y0} width={28} height={20} fill={r.hot ? C.caramel : C.latte} opacity={a * (r.hot ? 0.8 : 0.5)} />;
      })}
      <T x={300} y={200} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>split again: does that customer spread out?</T>
      <g opacity={rev}>
        <T x={30} y={200} s={12} f={C.cherryText}>one key, one hash: always the same half</T>
        <T x={30} y={224} s={12} f={C.latte}>splitting forever would never fix it</T>
      </g>
    </Svg>
  );
}

// 6 · The executor stops growing, everywhere
export function SplitStopsGrowing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const sp = easeInOut(seg(t, 0.8, 1.8));
  const flag = easeOut(seg(t, 2.0, 2.5));
  const lock = stepIdx(t, 2.9, 4.0, 8);
  const end = easeOut(seg(t, 4.3, 4.9));
  return (
    <Svg label="A batch splits and one half keeps every tuple, the other none. The executor flags it, and the batch count stops growing for every batch in the table, not only the stuck one" h={270}>
      <g opacity={a}>
        <rect x={60} y={50} width={160} height={40} fill={C.caramel} opacity={0.5} />
        <T x={140} y={36} s={11} a="middle" f={C.latte}>a batch</T>
      </g>
      <g opacity={sp}>
        <rect x={300} y={40} width={160} height={30} fill={C.caramel} opacity={0.5} />
        <rect x={300} y={80} width={160} height={30} fill="none" stroke={C.latte} strokeWidth={1} strokeDasharray="4 3" />
        <T x={470} y={60} s={12} f={C.crema}>all</T>
        <T x={470} y={100} s={12} f={C.latte}>none</T>
        <path d="M222 70 L296 56 M222 70 L296 94" stroke={C.latte} strokeWidth={1.2} fill="none" />
      </g>
      <T x={30} y={146} s={12} f={C.cherryText} o={flag}>a split that kept all, or none: it cannot help</T>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i} opacity={flag}>
          <rect x={30 + i * 68} y={172} width={56} height={26} fill="none" stroke={i <= lock ? C.cherry : C.latte} strokeWidth={i <= lock ? 2 : 1} />
          <T x={58 + i * 68} y={190} s={11} a="middle" f={i <= lock ? C.cherryText : C.latte}>{i <= lock ? 'frozen' : 'batch'}</T>
        </g>
      ))}
      <T x={300} y={244} s={12} a="middle" f={C.caramel} o={end}>growth stops for the whole table, not one batch</T>
    </Svg>
  );
}

// 7 · Spill, measured
export function SpillMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const k = stepIdx(t, 0.6, 3.0, 100);
  const end = easeOut(seg(t, 3.3, 3.9));
  return (
    <Svg label="A hundred squares for the 80,000 orders: about 92 go to a temporary file because their customer's batch is not the one resident batch; about 8 are probed straight away" h={270}>
      <T x={30} y={28} s={12} f={C.latte} o={a}>80,000 orders, each square about 1%</T>
      {Array.from({ length: 100 }).map((_, i) => {
        const disk = i >= 8;
        return <rect key={i} x={40 + (i % 20) * 26} y={44 + Math.floor(i / 20) * 26} width={20} height={20} fill={i <= k ? (disk ? C.cherry : C.crema) : 'none'} fillOpacity={disk ? 0.7 : 0.5} stroke={C.mocha} strokeWidth={1} />;
      })}
      <g opacity={end}>
        <rect x={40} y={190} width={14} height={14} fill={C.crema} opacity={0.5} />
        <T x={62} y={202} s={12} f={C.latte}>batch 0, in memory: probed now</T>
        <rect x={40} y={216} width={14} height={14} fill={C.cherry} opacity={0.7} />
        <T x={62} y={228} s={12} f={C.cherryText}>about 92%: to disk and back first</T>
      </g>
    </Svg>
  );
}

// 8 · The skew table: 2% of the budget, the hottest keys
export function SkewTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const cap = easeOut(seg(t, 0.9, 1.5));
  const k = stepIdx(t, 1.8, 3.2, 4);
  const end = easeOut(seg(t, 3.5, 4.1));
  return (
    <Svg label="The memory budget of 200 rows, with a separate skew table capped at 2% of it, 4 rows. The four busiest customers each take one, and their orders never spill, whatever the batching does" h={260}>
      <g opacity={a}>
        <rect x={30} y={40} width={400} height={50} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={40} y={70} s={12} f={C.latte}>memory budget: 200 rows</T>
      </g>
      <g opacity={cap}>
        <rect x={446} y={40} width={110} height={50} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={501} y={30} s={11} a="middle" f={C.caramel}>skew: 2% = 4</T>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={452 + i * 26} y={52} width={20} height={26} fill={i <= k ? C.caramel : 'none'} stroke={C.caramel} strokeWidth={1} opacity={i <= k ? 0.8 : 0.5} />
        ))}
      </g>
      <T x={30} y={140} s={12} f={C.crema} o={k >= 0 ? 1 : 0}>the four busiest customers, one row each</T>
      <T x={30} y={170} s={12} f={C.caramel} o={end}>always resident: their orders never spill</T>
      <T x={30} y={200} s={12} f={C.latte} o={end}>capped on purpose: the extreme few only</T>
    </Svg>
  );
}

// 9 · Chained and open-addressed: two engines, two instincts
export function OpenAddressedProbeSide({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 1.2, 1.8));
  const p = stepIdx(t, 2.0, 3.8, 4);
  const end = easeOut(seg(t, 4.1, 4.7));
  const offs = [0, 1, 3, 6];
  const taken = new Set([2, 3, 5]);
  return (
    <Svg label="Left: PostgreSQL's chained bucket, tuples of different sizes hanging in a chain. Right: Spark's open-addressed array for one long key: a new key tries slot h, then h plus 1, h plus 3, h plus 6, the triangular numbers, until a free slot" h={270}>
      <g opacity={a}>
        <T x={30} y={28} s={12} f={C.latte}>PostgreSQL: chained</T>
        <rect x={30} y={50} width={30} height={24} fill="none" stroke={C.crema} strokeWidth={1.2} />
        {[50, 80, 36].map((w, i, arr) => {
          const x = 70 + arr.slice(0, i).reduce((s0, v) => s0 + v + 14, 0);
          return <rect key={i} x={x} y={54} width={w} height={16} fill={C.crema} opacity={0.45} />;
        })}
        <T x={30} y={104} s={11} f={C.latte}>any tuple size, a pointer to chase</T>
      </g>
      <g opacity={b}>
        <T x={30} y={150} s={12} f={C.latte}>Spark, one long key: open addressing</T>
        {Array.from({ length: 12 }).map((_, i) => {
          const tried = offs.findIndex((o) => o + 2 === i);
          const isTried = tried >= 0 && tried <= p;
          const occupied = taken.has(i);
          return (
            <g key={i}>
              <rect x={30 + i * 44} y={166} width={38} height={28} fill={occupied ? C.latte : i === 8 && p >= 3 ? C.caramel : 'none'} fillOpacity={occupied ? 0.35 : 0.7} stroke={isTried ? C.caramel : C.mocha} strokeWidth={isTried ? 2 : 1} />
              {isTried && <T x={49 + i * 44} y={214} s={11} a="middle" f={C.caramel}>{offs[tried] === 0 ? 'h' : `+${offs[tried]}`}</T>}
            </g>
          );
        })}
      </g>
      <T x={30} y={252} s={12} f={C.crema} o={end}>one fixed-size number: nothing extra to chase</T>
    </Svg>
  );
}

// 10 · The runtime filter travels to the other scan
export function BloomPushdown({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const build = easeOut(seg(t, 0.8, 1.6));
  const ship = easeInOut(seg(t, 1.8, 2.8));
  const flow = seg(t, 2.9, 4.8);
  const drop = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1];
  return (
    <Svg label="The customers scan, the side with a selective predicate, builds a Bloom filter: the creation side. The filter travels to the orders scan, the application side, where orders whose customer cannot match are dropped before the join reads them" h={280}>
      <g opacity={a}>
        <rect x={30} y={40} width={150} height={36} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={105} y={63} s={12} a="middle" f={C.crema}>customers scan</T>
        <T x={105} y={96} s={11} a="middle" f={C.latte}>creation side</T>
        <rect x={30} y={180} width={150} height={36} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
        <T x={105} y={203} s={12} a="middle" f={C.cinnamon}>orders scan</T>
        <T x={105} y={236} s={11} a="middle" f={C.latte}>application side</T>
        <rect x={430} y={110} width={120} height={40} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={490} y={135} s={12} a="middle" f={C.latte}>hash join</T>
      </g>
      <g opacity={build}>
        <rect x={lerp(200, 40, ship)} y={lerp(48, 160, ship)} width={50} height={18} fill={C.caramel} opacity={0.8} />
        <T x={lerp(260, 100, ship)} y={lerp(62, 174, ship)} s={11} f={C.caramel}>filter</T>
      </g>
      {drop.map((d, i) => {
        const u = Math.max(0, Math.min(1, flow * 2 - i * 0.08));
        const x = lerp(190, 420, u);
        const stop = d === 0 && u > 0.1;
        return <rect key={i} x={stop ? 200 : x} y={190 + (i % 3) * 8} width={12} height={6} fill={stop ? C.cherry : C.crema} opacity={u > 0 && u < 1 ? (stop ? 0.9 : 0.8) : 0} />;
      })}
      <T x={200} y={270} s={12} f={C.cherryText} o={flow > 0.2 ? 1 : 0}>impossible matches dropped at the scan</T>
    </Svg>
  );
}

// 11 · The filter's arithmetic, checked against a built filter
export function FilterArithmetic({ t }: StepCtx) {
  const lines = stepIdx(t, 0.2, 3.4, 4);
  const bars = easeInOut(seg(t, 3.7, 4.6));
  const end = easeOut(seg(t, 4.8, 5.4));
  const rows: [string, string][] = [
    ['8,388,608 bits ÷ 1,000,000 items', '= 8.4 bits each'],
    ['k = round(8.4 × ln 2)', '= 6 hashes'],
    ['(1 − e^(−6 / 8.4))^6', '≈ 1.8% wrong yes'],
    ['a built filter, at the same ratio,', 'probed with keys never inserted'],
  ];
  return (
    <Svg label="8,388,608 bits for 1,000,000 items is 8.4 bits each; k is round of 8.4 times ln 2, 6 hashes; the formula's false-positive rate is about 1.8%. A filter built at the same ratio and probed with keys it never saw measures a rate that matches" h={290}>
      {rows.map(([l, r], i) => (
        <g key={i} opacity={i <= lines ? 1 : 0}>
          <T x={30} y={36 + i * 44} s={12} f={i === 3 ? C.latte : C.crema}>{l}</T>
          <T x={30} y={56 + i * 44} s={12} f={i === 3 ? C.latte : C.caramel}>{r}</T>
        </g>
      ))}
      <g opacity={bars > 0 ? 1 : 0}>
        <T x={30} y={230} s={12} f={C.latte}>formula</T>
        <rect x={130} y={218} width={300 * bars} height={16} fill={C.caramel} opacity={0.7} />
        <T x={30} y={258} s={12} f={C.latte}>measured</T>
        <rect x={130} y={246} width={308 * bars} height={16} fill={C.cinnamon} opacity={0.7} />
      </g>
      <T x={570} y={286} s={12} a="end" f={C.caramel} o={end}>they agree</T>
    </Svg>
  );
}

// 12 · Trino: exact set, then only a min and a max
export function TrinoContrast({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const grow = stepIdx(t, 0.6, 2.2, 8);
  const cut = easeInOut(seg(t, 2.6, 3.6));
  const end = easeOut(seg(t, 3.9, 4.5));
  const keys = [12, 30, 41, 47, 63, 70, 88, 95];
  const X = (v: number) => 40 + v * 5.2;
  return (
    <Svg label="Trino's dynamic filter collects the build side's exact distinct keys, one tick each on a line. Past a size threshold the ticks collapse into a single span from the minimum to the maximum: coarser, but cheap to build and ship" h={250}>
      <g opacity={a}>
        <line x1={X(0)} y1={110} x2={X(100)} y2={110} stroke={C.mocha} strokeWidth={1} />
        <T x={30} y={30} s={12} f={C.latte}>exact set of distinct build keys</T>
      </g>
      {keys.map((k, i) => (
        <line key={k} x1={X(k)} y1={90} x2={X(k)} y2={130} stroke={C.crema} strokeWidth={2} opacity={i <= grow ? 1 - cut : 0} />
      ))}
      <line x1={X(68)} y1={60} x2={X(68)} y2={156} stroke={C.cherry} strokeWidth={1.4} strokeDasharray="4 3" opacity={grow >= 5 ? 1 - cut : 0} />
      <T x={X(68)} y={52} s={11} a="middle" f={C.cherryText} o={grow >= 5 ? 1 - cut : 0}>size threshold</T>
      <rect x={X(12)} y={96} width={X(95) - X(12)} height={28} fill={C.caramel} opacity={0.35 * cut} />
      <T x={X(12)} y={150} s={12} a="middle" f={C.caramel} o={cut}>min</T>
      <T x={X(95)} y={150} s={12} a="middle" f={C.caramel} o={cut}>max</T>
      <T x={30} y={200} s={12} f={C.crema} o={end}>coarser on purpose: a bound on the filter's own cost</T>
    </Svg>
  );
}

// 13 · Recap
export function Recap({ t }: StepCtx) {
  const k = stepIdx(t, 0.2, 2.2, 3);
  const end = easeOut(seg(t, 2.8, 3.4));
  const items = ['batches, split by hash', 'a tiny resident skew table', 'a filter before the join'];
  return (
    <Svg label="Three answers to one missing resource, memory: batches split by hash, a tiny resident skew table, a filter before the join. Next, a sort that spills sorted runs to disk" h={240}>
      <T x={30} y={30} s={12} f={C.latte}>one shortage, memory; three structures</T>
      {items.map((s, i) => (
        <g key={s} opacity={i <= k ? 1 : 0}>
          <rect x={30} y={50 + i * 44} width={300} height={32} fill="none" stroke={C.crema} strokeWidth={1.2} />
          <T x={44} y={71 + i * 44} s={12} f={C.crema}>{s}</T>
        </g>
      ))}
      <T x={30} y={200} s={13} f={C.caramel} o={end}>next: a sort that spills sorted runs to disk</T>
    </Svg>
  );
}
