import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Draw, Plot, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing counted (blocks, transfers), cinnamon = the comparison-model
// alternative, cherry/cherryText = the expensive case (random access), taupe/latte = labels, crema = data.
// Every number printed is asserted in examples.py; tallies and drawn blocks stand for counts without printing them.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

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

/** A block in flight from (x1, y1) to (x2, y2) over [a, b] seconds, visible only while it travels. */
function Flight({ t, a, b, x1, y1, x2, y2, w = 34, f = C.caramel }: { t: number; a: number; b: number; x1: number; y1: number; x2: number; y2: number; w?: number; f?: string }) {
  const k = easeInOut(seg(t, a, b));
  if (t < a || t > b + 0.15) return null;
  return <rect x={lerp(x1, x2, k)} y={lerp(y1, y2, k)} width={w} height={20} rx={4} fill={f} />;
}

// 1 · What the word-RAM hid. The memory the program is given is drawn first; the vector grows inside it and then far past
// it; then blocks travel up from the part that spilled to disk, one trip per touch.
export function Problem({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 0.4, 1.8));
  const W = lerp(40, 520, grow);
  const spill = Math.max(0, W - 150);
  const trips = [0, 1, 2].map((i) => 2.0 + i * 0.35);
  return (
    <Svg label="A one gibibyte vector of sixty four bit keys grows past the memory the program is given; every touch may mean a block travelling in from disk" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>memory the program is given</T>
      <rect x={25} y={46} width={150} height={44} rx={8} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={25} y={200} s={14} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>vector of 64-bit keys</T>
      <rect x={25} y={144} width={Math.min(W, 150)} height={30} rx={6} fill={C.caramel} />
      {spill > 0 && <rect x={175} y={144} width={spill} height={30} rx={6} fill={C.cocoa} stroke={C.cherry} strokeWidth={1.5} />}
      <T x={575} y={224} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 1.5, 1.9))}>does not fit: lives on disk</T>
      {trips.map((a, i) => (
        <Flight key={i} t={t} a={a} b={a + 0.5} x1={300 + i * 90} y1={150} x2={40 + i * 44} y2={58} />
      ))}
      {trips.map((a, i) => (
        <rect key={`in-${i}`} x={40 + i * 44} y={58} width={34} height={20} rx={4} fill={C.caramel} opacity={t > a + 0.5 ? 1 : 0} />
      ))}
      <T x={300} y={268} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>one unit per access was always a fiction</T>
    </Svg>
  );
}

// 2 · Predict: sorted sweep vs random visit. Twenty blocks of keys. After the answer the sweep reads each block once (a
// short tally of transfers) while the random visit pays a transfer for nearly every key (a long red tally).
export function SweepVsRandomPredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const NB = 20, KPB = 8;
  const sweep = easeInOut(seg(s, 0.2, 1.4)) * NB;
  const rand = easeInOut(seg(s, 0.2, 2.2)) * NB * KPB;
  const order = (() => {
    const r = rng(5);
    return Array.from({ length: NB * KPB }, () => Math.floor(r() * NB * KPB));
  })();
  const blocks = (y: number, lit: (b: number) => boolean, f: string) =>
    Array.from({ length: NB }, (_, b) => (
      <g key={b}>
        <rect x={25 + b * 27} y={y} width={23} height={22} rx={4} fill={lit(b) ? f : C.cocoa} stroke={C.mocha} />
        {Array.from({ length: 4 }, (_, k) => <rect key={k} x={29 + b * 27 + k * 5} y={y + 9} width={3} height={4} fill={C.taupe} />)}
      </g>
    ));
  const hit = new Set(order.slice(0, Math.floor(rand)).map((k) => Math.floor(k / KPB)));
  return (
    <Svg label="A sorted sweep moves each block once; a random visit lands each key in its own block, about 512 times the transfers" h={320}>
      <T x={25} y={34} s={13} f={C.latte}>sorted sweep</T>
      {blocks(44, (b) => b < sweep, C.caramel)}
      <rect x={25} y={76} width={(540 * sweep) / (NB * KPB)} height={6} rx={2} fill={C.caramel} />
      <T x={25} y={130} s={13} f={C.latte}>random visit</T>
      {blocks(140, (b) => hit.has(b) && answer !== null, C.cherry)}
      <rect x={25} y={172} width={(540 * rand) / (NB * KPB)} height={6} rx={2} fill={C.cherryText} />
      {answer !== null && <T x={25} y={200} s={13} f={C.taupe} o={easeOut(seg(s, 0.2, 0.5))}>bars: transfers paid</T>}
      {answer === null && <T x={300} y={250} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && <T x={300} y={260} s={17} f={C.crema} a="middle" o={easeOut(seg(s, 2.1, 2.5))}>about 512 times fewer transfers, swept</T>}
    </Svg>
  );
}

// 3 · The model: Aggarwal and Vitter, 1988. A block crosses from disk to memory and the meter ticks; inside memory the
// items shuffle freely and the meter does not move; a block goes back out and the meter ticks again.
export function ModelIntro({ t }: StepCtx) {
  const appear = easeOut(seg(t, 0.1, 0.6));
  const ticks = (t >= 1.3 ? 1 : 0) + (t >= 3.0 ? 1 : 0);
  const shuffle = seg(t, 1.5, 2.4);
  const slots = [0, 1, 2, 3];
  const perm = shuffle < 0.33 ? [0, 1, 2, 3] : shuffle < 0.66 ? [2, 0, 3, 1] : [3, 2, 1, 0];
  return (
    <Svg label="A fast memory holding M items and a slow disk moving blocks of B items; work inside memory is free, only block transfers are counted" h={320}>
      <g opacity={appear}>
        <rect x={30} y={50} width={200} height={130} rx={14} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        <T x={130} y={42} s={14} f={C.crema} a="middle">memory: M items</T>
        <rect x={370} y={50} width={200} height={130} rx={14} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={470} y={42} s={14} f={C.crema} a="middle">disk, B per block</T>
        {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={386 + c * 44} y={66 + r * 36} width={36} height={22} rx={4} fill={C.mocha} />))}
      </g>
      <Flight t={t} a={0.7} b={1.3} x1={386} y1={66} x2={60} y2={70} w={36} />
      {t > 1.3 && slots.map((i) => <rect key={i} x={lerp(60, 60 + perm[i] * 40, 1)} y={110} width={30} height={22} rx={4} fill={C.crema} opacity={0.9} />)}
      {t > 1.3 && <rect x={60} y={70} width={36} height={22} rx={4} fill={C.caramel} opacity={t < 2.5 ? 1 : 0} />}
      <T x={130} y={162} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>work here: free</T>
      <Flight t={t} a={2.5} b={3.0} x1={60} y1={70} x2={474} y2={138} w={36} />
      <T x={30} y={232} s={14} f={C.latte}>transfers counted</T>
      {[0, 1].map((i) => (
        <rect key={i} x={260 + i * 22} y={218} width={14} height={18} rx={3} fill={i < ticks ? C.caramel : 'none'} stroke={C.mocha} />
      ))}
      <T x={300} y={290} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.9, 3.3))}>only a block crossing the line costs</T>
    </Svg>
  );
}

// 4 · Three numbers describe the job. N draws as a bar; it splits into 16 memory loads, one per beat; one load is M;
// zoom into M and it is 16,384 blocks of B = 512 keys.
export function ThreeNumbers({ t }: StepCtx) {
  const X0 = 25, W = 550;
  const bar = easeInOut(seg(t, 0.2, 0.8));
  const cuts = Math.floor(seg(t, 0.9, 1.9) * 16 + 1e-9);
  const m = easeOut(seg(t, 2.0, 2.4));
  const zoom = easeInOut(seg(t, 2.5, 3.2));
  const loadW = W / 16;
  return (
    <Svg label="N is 134,217,728 keys, sixteen memory loads long; M is 8,388,608 keys; inside M are 16,384 blocks of B equals 512 keys" h={330}>
      <T x={X0} y={34} s={15} f={C.crema} w={600}>N = 134,217,728 keys</T>
      <rect x={X0} y={46} width={W * bar} height={30} rx={5} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
      {Array.from({ length: 15 }, (_, i) => <line key={i} x1={X0 + (i + 1) * loadW} y1={46} x2={X0 + (i + 1) * loadW} y2={76} stroke={C.caramel} strokeWidth={1.5} opacity={i < cuts ? 1 : 0} />)}
      <T x={575} y={100} s={14} f={C.caramel} a="end" w={700} o={cuts >= 16 ? 1 : 0}>16 memory loads long</T>
      <rect x={X0} y={46} width={loadW} height={30} rx={5} fill={C.caramel} opacity={m} />
      <g opacity={m}>
        <path d={`M${X0} 80 L${X0} ${lerp(80, 150, zoom)} M${X0 + loadW} 80 L${lerp(X0 + loadW, 575, zoom)} ${lerp(80, 150, zoom)}`} stroke={C.latte} strokeDasharray="3 4" fill="none" />
        <T x={X0} y={132} s={15} f={C.crema} w={600}>M = 8,388,608 keys</T>
      </g>
      <g opacity={zoom}>
        <rect x={X0} y={154} width={W} height={30} rx={5} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
        {Array.from({ length: 64 }, (_, i) => <line key={i} x1={X0 + ((i + 1) * W) / 65} y1={154} x2={X0 + ((i + 1) * W) / 65} y2={184} stroke={C.mocha} />)}
        <rect x={X0} y={154} width={W / 65} height={30} fill={C.caramel} />
        <T x={X0} y={214} s={15} f={C.crema} w={600}>16,384 blocks of B = 512 keys</T>
      </g>
      <T x={X0} y={280} s={13} f={C.latte} o={easeOut(seg(t, 3.1, 3.5))}>hold onto the 16: it decides how the sort ends</T>
    </Svg>
  );
}

// 5 · A scan touches every block once.
export function ScanBound({ t }: StepCtx) {
  const n = 24 * 12;
  const lit = easeOut(seg(t, 0.3, 2.4)) * n;
  const cols = 24;
  return (
    <Svg label="A scan reads every block once; for the vector, two hundred sixty two thousand one hundred forty four sequential transfers" h={320}>
      {Array.from({ length: n }, (_, i) => {
        const x = 60 + (i % cols) * 20;
        const y = 44 + Math.floor(i / cols) * 20;
        const on = clamp(lit - i);
        return <rect key={i} x={x} y={y} width={16} height={16} rx={3} fill={on > 0 ? C.caramel : C.cocoa} opacity={on > 0 ? 0.4 + 0.6 * on : 1} />;
      })}
      <T x={300} y={300} s={16} f={C.crema} a="middle" o={easeOut(seg(t, 2.2, 3.0))}>N / B = {fmt(Math.min(262144, 262144 * easeOut(seg(t, 0.3, 2.4))))} transfers, all sequential</T>
    </Svg>
  );
}

// 6 · Search costs log base B. Top: binary search halves the live range probe after probe, the count running to 27.
// Bottom: each transfer brings a whole block and keeps one of its slices; three rows, three transfers.
export function SearchBound({ t }: StepCtx) {
  const X0 = 40, W = 520;
  const probes = Math.floor(easeInOut(seg(t, 0.3, 1.9)) * 27 + 1e-9);
  const width = Math.max(2, W / 2 ** probes);
  const target = 0.637; // where the key sits, as a fraction of the range
  const left = X0 + Math.min(W - width, Math.max(0, target * W - width / 2));
  const rows = [0, 1, 2];
  const S = 16; // slices drawn per block (each standing for B)
  return (
    <Svg label="Binary search over sorted keys needs twenty seven probes; one transfer per block keeps one of B slices, so three transfers" h={320}>
      <T x={25} y={30} s={13} f={C.latte}>binary search, one key at a time</T>
      <rect x={X0} y={44} width={W} height={24} rx={4} fill={C.cocoa} />
      <rect x={left} y={44} width={width} height={24} rx={2} fill={C.cinnamon} />
      <T x={560} y={100} s={30} f={C.cinnamon} a="end" w={700}>{String(probes)}</T>
      <T x={25} y={150} s={13} f={C.latte}>block search, B keys at a time</T>
      {rows.map((r) => {
        const a = easeOut(seg(t, 2.0 + r * 0.5, 2.4 + r * 0.5));
        const pick = [10, 3, 7][r];
        const y = 164 + r * 40;
        return (
          <g key={r} opacity={a} transform={`translate(0 ${((1 - a) * 8).toFixed(1)})`}>
            {Array.from({ length: S }, (_, i) => <rect key={i} x={X0 + (i * W) / S + 1} y={y} width={W / S - 2} height={24} rx={3} fill={i === pick ? C.caramel : C.cocoa} />)}
            {r < 2 && <path d={`M${X0 + ((pick + 0.5) * W) / S} ${y + 26} L${X0} ${y + 38} M${X0 + ((pick + 0.5) * W) / S} ${y + 26} L${X0 + W} ${y + 38}`} stroke={C.mocha} fill="none" opacity={easeOut(seg(t, 2.4 + r * 0.5, 2.6 + r * 0.5))} />}
          </g>
        );
      })}
      <T x={560} y={310} s={30} f={C.caramel} a="end" w={700} o={easeOut(seg(t, 3.0, 3.3))}>3</T>
      <T x={25} y={306} s={13} f={C.latte} o={easeOut(seg(t, 3.1, 3.5))}>log base B, not base 2</T>
    </Svg>
  );
}

// 7 · Predict: how many passes to sort it? Pass 1 lays down sixteen sorted runs; after the answer they all stream into
// one merge whose memory has room for 16,384 runs, and come out as one sorted run: pass 2.
export function SortPassesPredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const N = 16;
  const lay = easeOut(seg(t, 0.2, 1.4));
  const merge = easeInOut(seg(s, 0.2, 1.2));
  const out = easeOut(seg(s, 1.1, 1.7));
  return (
    <Svg label="Sixteen sorted runs and a merge fan-in of 16,384; one merge pass swallows them all: two passes in total" h={320}>
      <T x={25} y={34} s={13} f={C.latte}>pass 1: 16 sorted runs</T>
      {Array.from({ length: N }, (_, i) => {
        const x = lerp(25 + i * 34, 288, merge);
        const y = lerp(50, 150, merge);
        return <rect key={i} x={x} y={y} width={26} height={20} rx={4} fill={C.caramel} opacity={clamp(lay * N - i) * (1 - out)} />;
      })}
      <rect x={200} y={136} width={200} height={48} rx={10} fill="none" stroke={C.latte} strokeDasharray="4 4" opacity={answer !== null ? 1 : 0.5} />
      <T x={300} y={204} s={13} f={C.latte} a="middle">merge, fan-in 16,384</T>
      <rect x={300 - 270 * out} y={150} width={540 * out} height={20} rx={4} fill={C.caramel} />
      {answer === null && <T x={300} y={268} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && <T x={300} y={268} s={26} f={C.caramel} a="middle" w={700} o={out}>2 passes</T>}
    </Svg>
  );
}

// 8 · The sort bound is a pass count. Top: sixteen runs fall into one multiway merge in a single hop. Bottom: a two-way
// merge halves them level by level, 16 → 8 → 4 → 2 → 1, four passes over all the data.
export function PassCountExplain({ t }: StepCtx) {
  const hop = easeInOut(seg(t, 0.4, 1.2));
  const lv = [16, 8, 4, 2, 1];
  return (
    <Svg label="A multiway merge with a fan-in in the thousands merges sixteen runs in one pass; a two-way merge of the same runs needs four passes" h={330}>
      <T x={25} y={28} s={14} f={C.latte}>multiway merge, fan-in M / B</T>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={lerp(25 + i * 34, 25 + i * (540 / 16), hop)} y={lerp(40, 72, hop)} width={lerp(26, 540 / 16, hop)} height={14} rx={hop > 0.95 ? 0 : 3} fill={C.caramel} />
      ))}
      <T x={575} y={108} s={14} f={C.crema} a="end" w={700} o={easeOut(seg(t, 1.1, 1.4))}>1 merge pass</T>
      <T x={25} y={146} s={14} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>two-way merge, same 16 runs</T>
      {lv.map((n, k) => {
        const a = easeOut(seg(t, 1.5 + k * 0.45, 1.85 + k * 0.45));
        const y = 160 + k * 30;
        const w = 540 / n;
        return (
          <g key={n} opacity={a}>
            {Array.from({ length: n }, (_, i) => <rect key={i} x={25 + i * w + 1} y={y} width={(w - 2) * a + 0.5} height={14} rx={3} fill={C.cinnamon} />)}
          </g>
        );
      })}
      <T x={575} y={322} s={14} f={C.crema} a="end" w={700} o={easeOut(seg(t, 3.4, 3.8))}>4 merge passes</T>
    </Svg>
  );
}

// 9 · Count the same sort twice. Two counters race: comparisons into the billions, transfers stopping at 524,288.
export function CountTwice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.8));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="Comparisons spin into the billions; block transfers tick a few hundred thousand times for the same sort" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>comparisons</T>
      <rect x={25} y={54} width={420 * a} height={30} rx={7} fill={C.cinnamon} />
      <T x={455} y={74} s={15} f={C.crema}>{a >= 1 ? '3.6 billion' : `${(3.6 * a).toFixed(1)} billion`}</T>
      <T x={25} y={140} s={14} f={C.latte}>block transfers</T>
      <rect x={25} y={154} width={Math.max(4, 420 * a * 0.0002)} height={30} rx={7} fill={C.caramel} />
      <T x={60} y={176} s={15} f={C.crema} o={b > 0 ? 1 : 0}>{fmt(524288 * b)}</T>
      <T x={300} y={260} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>the clock follows the transfers, not the comparisons</T>
    </Svg>
  );
}

// 10 · Repricing the doubling vector: each resize is a scan, the copies double, and their sum stays under 2N.
export function DoublingVectorRepriced({ t }: StepCtx) {
  const resizes = 6;
  const total = easeOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="Each resize copies the contents as a scan; summed over all resizes, fewer than two N items move, so at most two N over B transfers" h={320}>
      {Array.from({ length: resizes }, (_, i) => {
        const w = Math.min(500, 15.6 * Math.pow(2, i));
        const g = easeInOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3));
        return <rect key={i} x={25} y={36 + i * 30} width={w * g} height={22} rx={5} fill={C.caramel} opacity={0.5 + 0.5 * g} />;
      })}
      <rect x={25} y={226} width={1000 * total * 0.5} height={10} rx={3} fill={C.caramel} />
      <line x1={525} y1={218} x2={525} y2={244} stroke={C.latte} strokeDasharray="3 3" opacity={total} />
      <T x={520} y={262} s={13} f={C.latte} a="end" o={total}>all copies, end to end: under 2N</T>
      <T x={300} y={298} s={16} f={C.crema} a="middle" o={easeOut(seg(t, 2.8, 3.5))}>≤ 2N / B transfers → O(1 / B) per append</T>
    </Svg>
  );
}

// 11 · The same model at every boundary. The same two-box picture twice: at the disk a block of 512 keys crosses, at the
// cache a line of 8 keys crosses. Only the sizes change.
export function EveryLevel({ t }: StepCtx) {
  const tier = (y: number, name: string, fast: string, b: string, keys: number, a: number) => {
    const o = easeOut(seg(t, a, a + 0.4));
    return (
      <g opacity={o}>
        <T x={25} y={y} s={15} f={C.crema} w={600}>{name}</T>
        <rect x={25} y={y + 12} width={150} height={56} rx={10} fill={C.roast} stroke={C.caramel} />
        <T x={100} y={y + 46} s={13} f={C.latte} a="middle">{fast}</T>
        <rect x={415} y={y + 12} width={160} height={56} rx={10} fill={C.cocoa} stroke={C.mocha} />
        <T x={575} y={y + 92} s={14} f={C.caramel} a="end">{b}</T>
        {(() => {
          const k = easeInOut(seg(t, a + 0.5, a + 1.2));
          const x = lerp(430, 190, k);
          const w = keys > 8 ? 120 : 40;
          return (
            <g>
              <rect x={x} y={y + 28} width={w} height={22} rx={4} fill={C.caramel} />
              {Array.from({ length: keys > 8 ? 24 : 8 }, (_, i) => <rect key={i} x={x + 3 + i * (w - 6) / (keys > 8 ? 24 : 8)} y={y + 36} width={2} height={6} fill={C.espresso} />)}
            </g>
          );
        })()}
      </g>
    );
  };
  return (
    <Svg label="At the disk boundary a block is five hundred twelve keys; at the cache boundary a block is eight keys, a cache line" h={320}>
      {tier(30, 'disk', 'memory: M', 'B = 512 keys', 512, 0.2)}
      {tier(160, 'CPU cache', 'cache: M', 'B = 8 keys (64-byte line)', 8, 1.5)}
      <T x={300} y={306} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>only M and B change; the counting is identical</T>
    </Svg>
  );
}

// 12 · Predict: lookups vs sort-then-scan. After the answer both bars grow: the lookups to about N, the sort-then-scan to a
// sliver of it.
export function LookupPredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const g = easeInOut(seg(s, 0.2, 1.4));
  return (
    <Svg label="N random lookups cost about N transfers; sorting first and scanning costs only a couple of passes of N over B" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>N one-at-a-time lookups</T>
      <rect x={25} y={54} width={420} height={30} rx={7} fill="none" stroke={C.mocha} />
      <rect x={25} y={54} width={420 * g} height={30} rx={7} fill={C.cherry} />
      <T x={25} y={140} s={14} f={C.latte}>sort, then scan</T>
      <rect x={25} y={154} width={420} height={30} rx={7} fill="none" stroke={C.mocha} />
      <rect x={25} y={154} width={Math.max(answer !== null ? 4 : 0, 420 * 0.02 * g)} height={30} rx={7} fill={C.caramel} />
      {answer === null && <T x={300} y={240} s={34} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && <T x={300} y={240} s={16} f={C.crema} a="middle" o={easeOut(seg(s, 1.2, 1.6))}>sorting first wins by a factor close to B</T>}
    </Svg>
  );
}

// 13 · Predict: does it stay two passes forever? After the answer, passes are plotted as the data doubles: flat at two
// for a long way, then one step up once the runs outnumber the fan-in.
export function GrowthPredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  // Runs = N / M from 16 (now) doubling 13 times; passes = 2 while runs ≤ 16,384, then 3.
  const pts: [number, number][] = Array.from({ length: 14 }, (_, i) => [50 + i * 38, 2 ** (4 + i) <= 16384 ? 180 : 110]);
  return (
    <Svg label="The pass count stays at two while the data doubles many times, and only ticks up to three once the run count exceeds the fan-in of 16,384" h={300}>
      <line x1={40} y1={230} x2={570} y2={230} stroke={C.mocha} />
      <T x={570} y={256} s={13} f={C.taupe} a="end">data doubling →</T>
      <T x={30} y={184} s={13} f={C.latte} a="end">2</T>
      <T x={30} y={114} s={13} f={C.latte} a="end">3</T>
      <T x={40} y={40} s={13} f={C.taupe}>passes</T>
      {answer === null && <T x={300} y={160} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && (
        <>
          <Plot pts={pts} t={s} start={0.1} beat={0.1} r={4} fill={C.caramel} />
          <line x1={x13(pts)} y1={90} x2={x13(pts)} y2={230} stroke={C.cinnamon} strokeDasharray="4 4" opacity={easeOut(seg(s, 1.4, 1.7))} />
          <T x={x13(pts) - 8} y={84} s={13} f={C.cinnamon} a="end" o={easeOut(seg(s, 1.5, 1.9))}>runs pass the fan-in, 16,384</T>
        </>
      )}
    </Svg>
  );
}
/** The x between the last two-pass point and the first three-pass one. */
const x13 = (pts: [number, number][]) => {
  const i = pts.findIndex((p) => p[1] === 110);
  return (pts[i - 1][0] + pts[i][0]) / 2;
};

// 14 · The honest caveat: measure the constant. The model draws the shape (a dashed line of transfers); the measured
// times land on a line of the same shape but a different slope, and the gap between them is the constant to measure.
export function Verdict({ t }: StepCtx) {
  const meas: [number, number][] = [0, 1, 2, 3, 4, 5].map((i) => [110 + i * 80, Math.round(220 - (i + 1) * 26)]);
  const k = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="The model predicts the shape of the cost; device latency, bandwidth and prefetching set the constant that measurement must find" h={320}>
      <line x1={60} y1={236} x2={560} y2={236} stroke={C.mocha} />
      <line x1={60} y1={236} x2={60} y2={30} stroke={C.mocha} />
      <T x={560} y={258} s={13} f={C.taupe} a="end">N →</T>
      <Draw pts={[[60, 236], [560, 160]]} t={t} from={0.2} to={1.0} stroke={C.caramel} w={2.5} dash="6 5" />
      <T x={555} y={222} s={13} f={C.caramel} a="end" o={easeOut(seg(t, 0.8, 1.1))}>the model: the shape</T>
      <Plot pts={meas} t={t} start={1.0} beat={0.15} r={5} fill={C.cinnamon} />
      <g opacity={k}>
        <line x1={540} y1={72} x2={540} y2={160} stroke={C.crema} strokeWidth={1.5} />
        <path d="M534 80 l6 -8 l6 8 M534 152 l6 8 l6 -8" stroke={C.crema} strokeWidth={1.5} fill="none" />
        <T x={575} y={40} s={13} f={C.cinnamon} a="end">measured: the constant</T>
      </g>
      <T x={25} y={300} s={14} f={C.taupe} o={easeOut(seg(t, 2.6, 3.2))}>every level of the hierarchy has its own M and B</T>
    </Svg>
  );
}
