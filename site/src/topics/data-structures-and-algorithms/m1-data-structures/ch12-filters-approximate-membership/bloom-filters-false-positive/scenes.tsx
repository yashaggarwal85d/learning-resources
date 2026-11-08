import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a bit or stored key; latte = labels; caramel = the thing to look at (the bits a
// key sets or checks, the optimum); cinnamon = the alternative being compared (measured beside formula, derived beside
// independent); cherryText = the bad outcome (a wrong maybe, a false no).
// The 24-bit, three-probe filter is examples.py's own small filter (seed 9): small-0 sets bits 12, 19, 7; small-1 sets
// 22, 16, 9; small-2 sets 11, 19, 3 (sharing bit 19 with small-0). small-3 checks 12, 14, 2 (14 is off: no); small-313
// checks 9, 7, 22 (all on: maybe, never inserted). Bit positions are drawn, never printed. Every printed number is
// examples.py's: the rate table (formula and measured at 8 to 20 bits per key), the flat optimum at 10 bits per key,
// fill 0.503, the bound table (6.64 and 9.59, 19.93 and 28.76 bits per key), the 1.44 ratio, independent 0.817% against
// derived 0.836%, and 9.9 bits per key giving 0.86% beside RocksDB's published "1%" row (SOURCES.md).

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

type Pt = [number, number];
const M = 24;
const BX = (i: number) => 32 + i * 22.5;
const K0 = [12, 19, 7];
const K1 = [22, 16, 9];
const K2 = [11, 19, 3];
const Q_NO = [12, 14, 2];
const Q_FP = [9, 7, 22];

/** The bit row: `on[i]` lit, `hl[i]` an outline colour. */
function Bits({ y, on, hl = {}, o = 1 }: { y: number; on: boolean[]; hl?: Record<number, string>; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: M }, (_, i) => (
        <rect key={i} x={BX(i)} y={y} width={18} height={24} rx={2} fill={on[i] ? C.crema : C.roast} stroke={hl[i] ?? (on[i] ? C.crema : C.mocha)} strokeWidth={hl[i] ? 2.2 : 1} />
      ))}
    </g>
  );
}

/** Probe arrows from a key label down to its bits, drawn over [from, to]. */
function Probes({ x, y, bits, by, t, from, to, c = C.caramel }: { x: number; y: number; bits: number[]; by: number; t: number; from: number; to: number; c?: string }) {
  return (
    <g>
      {bits.map((b, j) => (
        <Draw key={j} pts={[[x, y], [BX(b) + 9, by - 4]]} t={t} from={from + j * 0.08} to={to + j * 0.08} stroke={c} w={1.4} />
      ))}
    </g>
  );
}

function setOf(...lists: number[][]) {
  const on = Array(M).fill(false) as boolean[];
  lists.forEach((l) => l.forEach((b) => (on[b] = true)));
  return on;
}

// 1 · How wrong is nearly free allowed to be? Five sorted runs on disk; a lookup for a missing key. Without a filter it
// opens every run. With a few bits per key beside each run, four say "no" at once and one says "maybe", and only that one
// is opened, and the key is not there either: wrong, on purpose.
export function Hook({ t }: StepCtx) {
  const RY = (i: number) => 50 + i * 40;
  const open1 = (i: number) => easeOut(seg(t, 0.4 + i * 0.15, 0.6 + i * 0.15));
  const filt = easeOut(seg(t, 1.6, 1.9));
  const MAYBE = 3;
  // Without a filter the lookup's probes run out to every run (red, the cost). Then a few bits slide in beside each
  // run: four say no on the spot, one says maybe, the one probe that is sent goes there, and that run is crossed out.
  const gone = 1 - easeOut(seg(t, 1.5, 1.8));
  return (
    <Svg label="Five sorted runs on disk and a lookup for a missing key: without a filter every run is opened; with a few bits per key beside each, four answer no at once and one says maybe, which is opened and is wrong" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>get(key that isn&apos;t there)</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={300} y={RY(i) - 14} width={150} height={28} rx={3} fill={C.roast} stroke={C.mocha} strokeWidth={1.2} />
          <T x={316} y={RY(i) + 5} s={12} f={C.latte}>sorted run {i + 1}</T>
          {gone > 0 && <Draw pts={[[150, 140], [298, RY(i)]]} t={t} from={0.4 + i * 0.15} to={0.75 + i * 0.15} stroke={C.cherryText} w={1.2} o={gone} />}
          <g opacity={filt} transform={`translate(${((1 - filt) * 40).toFixed(2)} 0)`}>
            <rect x={460} y={RY(i) - 8} width={36} height={16} rx={2} fill="none" stroke={C.cinnamon} strokeWidth={1.2} />
            {[0, 1, 2, 3].map((b) => <rect key={b} x={463 + b * 8} y={RY(i) - 5} width={6} height={10} fill={(i * 3 + b) % 3 ? C.cinnamon : C.roast} />)}
            <Decode text={i === MAYBE ? 'maybe' : 'no'} t={t} at={2.1 + i * 0.15} dur={0.35} x={506} y={RY(i) + 5} s={12} f={i === MAYBE ? C.caramel : C.latte} />
          </g>
          {i === MAYBE && <Draw pts={[[150, 140], [298, RY(i)]]} t={t} from={2.9} to={3.3} stroke={C.caramel} w={1.6} />}
          {i === MAYBE && (
            <>
              <Draw pts={[[360, RY(i) - 9], [390, RY(i) + 9]]} t={t} from={3.4} to={3.6} stroke={C.cherryText} w={2} pen={false} />
              <Draw pts={[[390, RY(i) - 9], [360, RY(i) + 9]]} t={t} from={3.55} to={3.75} stroke={C.cherryText} w={2} pen={false} />
            </>
          )}
        </g>
      ))}
      <rect x={30} y={124} width={120} height={32} rx={4} fill={C.roast} stroke={C.crema} strokeWidth={1.3} />
      <T x={90} y={145} s={13} f={C.crema} a="middle">lookup</T>
      <T x={30} y={190} s={12} f={C.cherryText} o={t < 1.6 ? open1(4) : 0}>no filter: open all 5</T>
      <T x={30} y={190} s={12} f={C.caramel} o={easeOut(seg(t, 2.9, 3.2))}>with bits: open 1</T>
      <T x={30} y={264} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.7))}>and the key is not there either</T>
      <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 3.9, 4.3))}>how wrong, and what does less wrong cost?</T>
    </Svg>
  );
}

// 2 · The structure. Twenty-four bits, three probes per key. small-0, small-1, small-2 each light their three bits
// (small-2's second probe lands on 19, already lit). small-3 checks its three: one is off, a certain no. small-313
// checks its three: all on, a maybe, though it was never stored. Bits only ever turn on.
export function Structure({ t }: StepCtx) {
  const BY = 120;
  const add = [0.3, 1.0, 1.7];
  const lists = [K0, K1, K2];
  const names = ['small-0', 'small-1', 'small-2'];
  const lit = lists.filter((_, i) => t >= add[i] + 0.4);
  const on = setOf(...lit);
  const cur = [2, 1, 0].find((i) => t >= add[i] && t < add[i] + 0.6);
  const q1 = t >= 2.5 && t < 3.3;
  const q2 = t >= 3.3;
  const hl: Record<number, string> = {};
  if (cur !== undefined) lists[cur].forEach((b) => (hl[b] = C.caramel));
  if (q1) Q_NO.forEach((b) => (hl[b] = on[b] ? C.caramel : C.cherryText));
  if (q2) Q_FP.forEach((b) => (hl[b] = C.cherryText));
  return (
    <Svg label="Twenty-four bits; small-0, small-1 and small-2 each light three; small-3 finds one of its bits off, a certain no; small-313, never stored, finds all three on, a maybe" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>24 bits, 3 probes per key</T>
      {cur !== undefined && <T x={30} y={60} s={13} f={C.caramel}>add {names[cur]}</T>}
      {cur !== undefined && <Probes x={140} y={64} bits={lists[cur]} by={BY} t={t} from={add[cur]} to={add[cur] + 0.25} />}
      {q1 && <T x={30} y={60} s={13} f={C.crema}>small-3?</T>}
      {q1 && <Probes x={120} y={64} bits={Q_NO} by={BY} t={t} from={2.5} to={2.75} c={C.crema} />}
      {q2 && <T x={30} y={60} s={13} f={C.crema}>small-313?</T>}
      {q2 && <Probes x={140} y={64} bits={Q_FP} by={BY} t={t} from={3.3} to={3.55} c={C.crema} />}
      <Bits y={BY} on={on} hl={hl} />
      <T x={30} y={186} s={13} f={C.crema} o={t >= 2.8 ? 1 : 0}>small-3: one bit off → certainly not</T>
      <T x={30} y={212} s={13} f={C.cherryText} o={t >= 3.6 ? 1 : 0}>small-313: all on → maybe (never stored)</T>
      <T x={30} y={270} s={12} f={C.latte} o={easeOut(seg(t, 4.1, 4.4))}>a bit, once on, is never switched off</T>
    </Svg>
  );
}

// 3 · Predict. small-0 has lit 12, 19 and 7. small-2 arrives, and one of its probes lands on 19, already on. What happens
// to that bit? After answering: the probe lands, the bit flashes and stays exactly as it was; who set it is not kept.
export function AlreadyOne({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const BY = 120;
  const on = setOf(K0);
  const land = answered ? seg(s, 0.2, 0.6) : 0;
  return (
    <Svg label="small-0 has lit bits 12, 19 and 7; small-2's probe lands on bit 19, already on; after answering, the bit simply stays on and nothing records who set it" h={290}>
      <T x={30} y={30} s={13} f={C.crema}>small-0 lit three bits</T>
      <T x={30} y={60} s={13} f={C.caramel}>small-2 arrives</T>
      <Probes x={160} y={64} bits={[11, 3]} by={BY} t={t} from={0.2} to={0.5} c={C.latte} />
      <Bits y={BY} on={answered && s >= 0.6 ? setOf(K0, [11, 3]) : on} hl={{ 19: answered ? C.caramel : C.cherryText }} />
      {!answered && <rect x={BX(19) - 3} y={BY - 3} width={24} height={30} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={pulse} />}
      {answered && <Draw pts={[[160, 64], [BX(19) + 9, BY - 4]]} t={s} from={0.2} to={0.6} stroke={C.caramel} w={1.6} />}
      {answered && land >= 1 && <circle cx={BX(19) + 9} cy={BY + 12} r={18} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={1 - clamp((s - 0.6) / 0.6)} />}
      {!answered && <T x={30} y={220} s={15} f={C.cherryText} o={pulse}>bit 19 is already on: then what?</T>}
      {answered && <T x={30} y={200} s={13} f={C.caramel} o={easeOut(seg(s, 0.8, 1.1))}>nothing: on stays on</T>}
      {answered && <T x={30} y={226} s={12} f={C.latte} o={easeOut(seg(s, 1.2, 1.5))}>no count, no owner: just on or off</T>}
    </Svg>
  );
}

const RATES = [
  { b: 8, f: 2.158, m: 2.177 },
  { b: 10, f: 0.819, m: 0.876 },
  { b: 12, f: 0.314, m: 0.317 },
  { b: 16, f: 0.046, m: 0.042 },
  { b: 20, f: 0.007, m: 0.006 },
];

// 4 · The rate, derived. One bit stays off with probability e^(-kn/m), a curve shrinking as keys arrive; a wrong maybe
// needs all k probes on: (1 - e^(-kn/m))^k. On a log axis against bits per key, the formula's line, then the measured
// rate dropping onto it at 8, 10, 12, 16 and 20 bits per key.
export function RateDerived({ t }: StepCtx) {
  const X = (b: number) => 90 + (b - 8) * 36;
  const Y = (pct: number) => 120 + (0.5 - Math.log10(pct)) * 52;
  const off: Pt[] = Array.from({ length: 25 }, (_, i) => [370 + i * 7.5, 24 + 56 * (1 - Math.exp(-i / 8))]);
  const line: Pt[] = Array.from({ length: 25 }, (_, i) => {
    const b = 8 + i * 0.5;
    const k = Math.round(b * Math.LN2);
    return [X(b), Y(100 * (1 - Math.exp(-k / b)) ** k)];
  });
  return (
    <Svg label="The chance one bit stays off shrinks as keys arrive; the wrong-maybe rate is that complement raised to k; on a log axis the formula's line and the measured rates at 8 to 20 bits per key coincide, from 2.177% down to 0.006%" h={330}>
      <T x={30} y={34} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>one bit off: e^(−kn/m)</T>
      <T x={30} y={60} s={13} f={C.caramel} o={easeOut(seg(t, 1.0, 1.3))}>wrong maybe: (1 − e^(−kn/m))^k</T>
      <Draw pts={off} t={t} from={0.4} to={1.0} stroke={C.latte} w={1.6} pen={false} />
      <T x={430} y={100} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.0))}>keys stored →</T>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <line x1={70} y1={290} x2={540} y2={290} stroke={C.mocha} strokeWidth={1.2} />
        {RATES.map((r) => <T key={r.b} x={X(r.b)} y={308} s={12} f={C.latte} a="middle">{r.b}</T>)}
        <T x={540} y={326} s={12} f={C.latte} a="end">bits per key</T>
      </g>
      <Draw pts={line} t={t} from={1.8} to={2.8} stroke={C.caramel} w={2} pen={false} />
      {RATES.map((r, i) => {
        const k = easeOut(seg(t, 3.0 + i * 0.2, 3.3 + i * 0.2));
        return <circle key={r.b} cx={X(r.b)} cy={lerp(Y(r.m) - 30, Y(r.m), k)} r={5} fill={C.cinnamon} opacity={k} />;
      })}
      <T x={X(8) + 10} y={Y(2.177) - 10} s={12} f={C.cinnamon} o={easeOut(seg(t, 3.2, 3.5))}>2.177% measured</T>
      <T x={X(20) - 10} y={Y(0.006) - 14} s={12} f={C.cinnamon} a="end" o={easeOut(seg(t, 4.0, 4.3))}>0.006%</T>
    </Svg>
  );
}

const FLAT = [
  { k: 1, f: 9.52 },
  { k: 2, f: 3.29 },
  { k: 4, f: 1.18 },
  { k: 6, f: 0.84 },
  { k: 7, f: 0.82 },
  { k: 8, f: 0.85 },
  { k: 10, f: 1.02 },
  { k: 14, f: 1.9 },
];

// 5 · The optimum. At 10 bits per key, the rate against k: high at k = 1 (9.52%), falling to its floor at k = 7 (0.82%),
// rising again slowly. Around the floor the curve is flat: 0.84, 0.82, 0.85. At k = 7, 0.503 of all bits are on.
export function Optimum({ t }: StepCtx) {
  const X = (k: number) => 70 + (k - 1) * 36;
  const Y = (v: number) => 50 + (1 - Math.log10(v)) * 120;
  const pts: Pt[] = FLAT.map((r) => [X(r.k), Y(r.f)]);
  const band = easeOut(seg(t, 2.2, 2.6));
  const half = easeOut(seg(t, 3.2, 3.6));
  const lit = (i: number) => [0, 2, 3, 6, 7, 9, 12, 13, 15, 18, 20, 22].includes(i);
  return (
    <Svg label="At ten bits per key the rate against k falls from 9.52% at one probe to its floor of 0.82% at seven and rises slowly after, flat around the floor; at seven probes half the bits, 0.503, are on" h={324}>
      <T x={30} y={24} s={12} f={C.latte}>10 bits per key: rate against k</T>
      <rect x={X(6) - 10} y={40} width={X(8) - X(6) + 20} height={170} rx={4} fill={C.cocoa} opacity={band} />
      <Draw pts={pts} t={t} from={0.3} to={1.8} stroke={C.crema} w={1.8} pen={false} />
      {FLAT.map((r, i) => <circle key={r.k} cx={X(r.k)} cy={Y(r.f)} r={r.k === 7 ? 6 : 4} fill={r.k === 7 ? C.caramel : C.crema} opacity={easeOut(seg(t, 0.3 + i * 0.18, 0.5 + i * 0.18))} />)}
      {FLAT.map((r) => <T key={`k${r.k}`} x={X(r.k)} y={226} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>{r.k}</T>)}
      <T x={X(1) + 12} y={Y(9.52) + 4} s={12} f={C.crema} o={easeOut(seg(t, 0.4, 0.7))}>9.52%</T>
      <T x={X(7)} y={Y(0.82) + 26} s={12} f={C.caramel} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>0.82%</T>
      <T x={30} y={248} s={12} f={C.latte} o={band}>k 6, 7, 8: 0.84, 0.82, 0.85 (%)</T>
      <g opacity={half}>
        <Bits y={262} on={Array.from({ length: M }, (_, i) => lit(i))} />
        <T x={30} y={310} s={13} f={C.caramel}>at k = 7: 0.503 of the bits are on</T>
      </g>
    </Svg>
  );
}

// 6 · Predict. One in a hundred needs 9.59 bits per key. One in a million is 10,000 times rarer: does it need anything
// like 10,000 times the bits? Before: a ghost bar runs off the edge. After: the real bar is 28.76 bits per key.
export function NotTenThousand({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const U = 9; // units per bit
  const a = easeOut(seg(t, 0.1, 0.6));
  const g = answered ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="One in a hundred needs 9.59 bits per key; one in a million, ten thousand times rarer, needs 28.76, not ten thousand times as many" h={280}>
      <T x={30} y={30} s={12} f={C.latte}>bits per key</T>
      <T x={30} y={66} s={13} f={C.crema} o={a}>1 in 100</T>
      <rect x={170} y={54} width={9.59 * U * a} height={16} rx={2} fill={C.crema} />
      <T x={170 + 9.59 * U + 8} y={67} s={12} f={C.crema} o={a}>9.59</T>
      <T x={30} y={116} s={13} f={C.crema} o={a}>1 in 1,000,000</T>
      {!answered && (
        <g opacity={pulse}>
          <rect x={170} y={104} width={400} height={16} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="5 4" />
          <T x={170} y={146} s={12} f={C.cherryText}>10,000× the bits? runs off the page</T>
        </g>
      )}
      {answered && (
        <>
          <rect x={170} y={104} width={28.76 * U * g} height={16} rx={2} fill={C.caramel} />
          <T x={170 + 28.76 * U + 8} y={117} s={12} f={C.caramel} o={g}>28.76</T>
        </>
      )}
      {!answered && <T x={30} y={220} s={15} f={C.cherryText} o={pulse}>10,000× rarer: 10,000× the memory?</T>}
      {answered && <T x={30} y={200} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.3))}>no: bits are added, not multiplied</T>}
      {answered && <T x={30} y={226} s={12} f={C.latte} o={easeOut(seg(s, 1.4, 1.7))}>each extra bit cuts the rate by the same factor</T>}
    </Svg>
  );
}

// 7 · The bound. For any structure that never says a false no: at least n·log2(1/ε) bits. At ε = 0.01, the floor is 6.64
// bits per key and the filter needs 9.59; at one in a million, 19.93 against 28.76. The same ratio both times: 1.44.
export function Bound({ t }: StepCtx) {
  const U = 12;
  const ROWS = [
    { y: 70, lab: 'ε = 1 in 100', lb: 6.64, bl: 9.59 },
    { y: 170, lab: 'ε = 1 in 1,000,000', lb: 19.93, bl: 28.76 },
  ];
  const g1 = (i: number) => easeOut(seg(t, 0.4 + i * 1.0, 0.9 + i * 1.0));
  const g2 = (i: number) => easeOut(seg(t, 0.9 + i * 1.0, 1.4 + i * 1.0));
  return (
    <Svg label="The floor for any structure with no false no against the filter's need: 6.64 against 9.59 bits per key at one in a hundred, 19.93 against 28.76 at one in a million, the same ratio of 1.44 both times" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>bits per key: the floor, and the filter</T>
      {ROWS.map((r, i) => (
        <g key={r.lab}>
          <T x={30} y={r.y - 12} s={13} f={C.crema} o={g1(i)}>{r.lab}</T>
          <rect x={30} y={r.y} width={r.lb * U * g1(i)} height={14} rx={2} fill={C.cinnamon} />
          <T x={30 + r.lb * U + 8} y={r.y + 12} s={12} f={C.cinnamon} o={g1(i)}>floor {r.lb}</T>
          <rect x={30} y={r.y + 22} width={r.bl * U * g2(i)} height={14} rx={2} fill={C.crema} />
          <T x={30 + r.bl * U + 8} y={r.y + 34} s={12} f={C.crema} o={g2(i)}>{r.bl}</T>
        </g>
      ))}
      <T x={30} y={262} s={14} f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>× 1.44 above the floor, at any rate</T>
      <T x={30} y={288} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>a fixed multiple that never grows</T>
    </Svg>
  );
}

// 8 · Predict. Seven probes per key: seven separate hash functions, each wired to a bit? After answering: the seven
// collapse into two, h1 and h2, and g_i = h1 + i·h2 fans out to seven bits.
export function TwoHashesPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const k = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const TGT = [2, 5, 9, 12, 16, 19, 23];
  const BY = 200;
  return (
    <Svg label="Seven probes from seven separate hash functions; after answering they collapse into two, h1 and h2, combined as h1 plus i times h2 to reach the same seven bits" h={300}>
      {TGT.map((b, i) => {
        const x = lerp(50 + i * 72, i === 0 ? 220 : 340, k);
        const show = i < 2 || k < 1;
        return (
          <g key={i}>
            {show && <rect x={x - 22} y={50} width={44} height={28} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.3} opacity={i < 2 ? 1 : 1 - k} />}
            {/* h3 to h7 fold into h2: their labels are gone before the boxes close up, so no two labels ever touch. */}
            {show && <T x={x} y={69} s={12} f={C.crema} a="middle" o={i < 2 ? 1 : Math.max(0, 1 - k / 0.6)}>{`h${i + 1}`}</T>}
            <line x1={lerp(50 + i * 72, 280, k)} y1={78} x2={BX(b) + 9} y2={BY - 2} stroke={C.caramel} strokeWidth={1.2} opacity={0.8} />
          </g>
        );
      })}
      <Bits y={BY} on={Array.from({ length: M }, (_, i) => TGT.includes(i))} />
      {!answered && <T x={30} y={270} s={15} f={C.cherryText} o={pulse}>seven separate hashes?</T>}
      {answered && <T x={384} y={70} s={13} f={C.caramel} o={easeOut(seg(s, 0.9, 1.2))}>g_i = h1 + i·h2</T>}
      {answered && <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.5))}>two, combined, stand in for seven</T>}
    </Svg>
  );
}

// 9 · Derived probes. Start at h1; each next probe adds h2 and wraps around the bits: seven distinct bits, one step at a
// time. Measured at 10 bits per key with k = 7: independent hashes 0.817%, derived probes 0.836%.
export function DerivedProbes({ t }: StepCtx) {
  const BY = 90;
  const H1 = 5;
  const H2 = 7;
  const probes = Array.from({ length: 7 }, (_, i) => (H1 + i * H2) % M);
  const n = probes.filter((_, i) => t >= 0.4 + i * 0.35).length;
  const bars = easeOut(seg(t, 3.2, 3.8));
  const U = 380;
  return (
    <Svg label="Starting at h1, each next probe adds h2 and wraps around, reaching seven distinct bits; measured at ten bits per key and seven probes, independent hashes give 0.817% and derived probes 0.836%" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>probe i = h1 + i·h2, wrapping around</T>
      <Bits y={BY} on={Array.from({ length: M }, (_, i) => probes.slice(0, n).includes(i))} hl={n > 0 ? { [probes[n - 1]]: C.caramel } : {}} />
      {probes.slice(0, n).map((b, i) => {
        if (i === 0) return <T key={i} x={BX(b) + 9} y={BY - 10} s={12} f={C.caramel} a="middle">h1</T>;
        const a = probes[i - 1];
        const wrap = b < a;
        const pts: Pt[] = wrap ? [[BX(a) + 9, BY + 30], [BX(a) + 9, BY + 44], [BX(b) + 9, BY + 44], [BX(b) + 9, BY + 30]] : [[BX(a) + 9, BY - 4], [(BX(a) + BX(b)) / 2 + 9, BY - 22], [BX(b) + 9, BY - 4]];
        return <Draw key={i} pts={pts} t={t} from={0.4 + i * 0.35 - 0.25} to={0.4 + i * 0.35} stroke={wrap ? C.latte : C.caramel} w={1.4} pen={false} />;
      })}
      <T x={30} y={170} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>seven distinct bits from two hashes</T>
      <g opacity={bars}>
        <T x={30} y={214} s={12} f={C.latte}>10 bits/key, k = 7, measured</T>
        <T x={30} y={242} s={12} f={C.cinnamon}>independent</T>
        <rect x={140} y={231} width={0.817 * U * bars} height={14} rx={2} fill={C.cinnamon} />
        <T x={140 + 0.817 * U + 8} y={243} s={12} f={C.cinnamon}>0.817%</T>
        <T x={30} y={272} s={12} f={C.caramel}>derived</T>
        <rect x={140} y={261} width={0.836 * U * bars} height={14} rx={2} fill={C.caramel} />
        <T x={140 + 0.836 * U + 8} y={273} s={12} f={C.caramel}>0.836%</T>
      </g>
    </Svg>
  );
}

// 10 · No deletes. The small filter holds small-0, small-1 and small-2. "Delete" small-0 by clearing its three bits: 19
// goes dark too, and small-2, still stored, now checks 11, 19, 3, finds 19 off, and gets a certain, wrong no. Found by
// search on this very filter. A filter built once and never edited never meets this.
export function NoDeletes({ t }: StepCtx) {
  const BY = 110;
  const clr = t >= 1.2;
  const on = setOf(K0, K1, K2);
  if (clr) K0.forEach((b) => (on[b] = false));
  const hl: Record<number, string> = {};
  if (t >= 0.6 && t < 1.4) K0.forEach((b) => (hl[b] = C.cherryText));
  const q = t >= 1.9;
  if (q) K2.forEach((b) => (hl[b] = b === 19 ? C.cherryText : C.caramel));
  return (
    <Svg label="The filter holds small-0, small-1 and small-2; clearing small-0's three bits also clears bit 19, which small-2 shares, so small-2, still stored, now gets a certain and wrong no" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>holds small-0, small-1, small-2</T>
      <T x={30} y={60} s={13} f={C.cherryText} o={t >= 0.6 && t < 1.9 ? 1 : 0}>delete small-0: clear its bits</T>
      {t >= 0.6 && t < 1.9 && <Probes x={140} y={66} bits={K0} by={BY} t={t} from={0.6} to={0.9} c={C.cherryText} />}
      {q && <T x={30} y={60} s={13} f={C.crema}>small-2? (still stored)</T>}
      {q && <Probes x={140} y={66} bits={K2} by={BY} t={t} from={1.9} to={2.2} c={C.crema} />}
      <Bits y={BY} on={on} hl={hl} />
      {clr && <T x={BX(19) + 9} y={BY + 44} s={12} f={C.cherryText} a="middle">shared</T>}
      <T x={30} y={196} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 2.9))}>small-2: certainly not. Wrong.</T>
      <T x={30} y={222} s={12} f={C.latte} o={easeOut(seg(t, 3.2, 3.5))}>found by search on this filter, not picked</T>
      <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(t, 4.0, 4.4))}>built once, never edited: never hit</T>
    </Svg>
  );
}

// 11 · Chapter 5 reconciliation. The earlier lesson's row: about 10 bits per key, about 1%, seven probes. Plug 9.9 bits
// per key into today's formula: k = 7, and the rate falls out at 0.86%, right beside the published "1%" row.
export function Reconciliation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const plug = easeInOut(seg(t, 1.2, 2.2));
  const out = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="RocksDB's published row says 9.9 bits per key gives about 1%; plugging 9.9 bits per key and seven probes into the formula gives 0.86%" h={280}>
      <g opacity={a}>
        <rect x={30} y={36} width={250} height={64} rx={5} fill={C.roast} stroke={C.latte} strokeWidth={1.2} />
        <T x={44} y={60} s={12} f={C.latte}>published (chapter 5)</T>
        <T x={44} y={86} s={13} f={C.crema}>9.9 bits/key → about 1%</T>
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <rect x={310} y={36} width={250} height={64} rx={5} fill={C.roast} stroke={C.caramel} strokeWidth={1.4} />
        <T x={324} y={60} s={12} f={C.caramel}>today&apos;s formula</T>
        <T x={324} y={86} s={13} f={C.crema}>(1 − e^(−k/9.9))^k</T>
      </g>
      <Draw pts={[[155, 102], [155, 150], [435, 150], [435, 102]]} t={t} from={1.2} to={2.0} stroke={C.latte} w={1.4} pen={false} />
      <T x={300} y={140} s={12} f={C.latte} a="middle" o={plug}>k = 7</T>
      <rect x={180} y={176} width={240} height={44} rx={6} fill={C.roast} stroke={C.caramel} strokeWidth={1.8} opacity={out} />
      <T x={300} y={205} s={18} f={C.caramel} a="middle" o={out}>0.86%</T>
      <T x={30} y={260} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>the same number, not a separate fact</T>
    </Svg>
  );
}

// 12 · Recap. Three rows: the space (a bar a little past the floor, ×1.44); every yes a maybe (a lit row answering
// "maybe"); and what it cannot do (delete, list), each struck through.
export function Recap({ t }: StepCtx) {
  const r = (i: number) => easeOut(seg(t, 0.2 + i * 0.8, 0.5 + i * 0.8));
  return (
    <Svg label="Recap: a little more than the fewest possible bits, 1.44 times the floor; every yes is only a maybe; no delete and no listing" h={260}>
      <g opacity={r(0)}>
        <rect x={30} y={36} width={66 * r(0)} height={12} rx={2} fill={C.cinnamon} />
        <rect x={30} y={52} width={96 * r(0)} height={12} rx={2} fill={C.crema} />
        <T x={170} y={58} s={13} f={C.crema}>× 1.44 the fewest bits possible</T>
      </g>
      <g opacity={r(1)}>
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={30 + i * 20} y={110} width={16} height={20} rx={2} fill={i % 2 === 0 || i === 3 ? C.crema : C.roast} stroke={C.crema} strokeWidth={1} />)}
        <T x={170} y={126} s={13} f={C.caramel}>every yes is only a maybe</T>
      </g>
      <g opacity={r(2)}>
        <T x={30} y={196} s={13} f={C.latte}>delete · list</T>
        <line x1={26} y1={191} x2={lerp(26, 150, easeOut(seg(t, 2.0, 2.5)))} y2={191} stroke={C.cherryText} strokeWidth={2} />
        <T x={170} y={196} s={13} f={C.cherryText}>never: no delete, no listing</T>
      </g>
    </Svg>
  );
}
