import { useEffect, useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Every number shown here is computed or asserted by examples.py.
// The model: the chapter's vector of 64-bit keys. Empty has capacity 0; the first push allocates 1; a push to a full
// vector doubles the capacity, copies the n keys, then writes. A pop that leaves n below a * cap (a = 1/4 or 1/2)
// halves the capacity and copies the n keys. One unit of cost = one element write.

type V = { n: number; cap: number };
const pushOp = (v: V) => {
  let c = 1;
  if (v.n === v.cap) {
    c += v.n;
    v.cap = v.cap === 0 ? 1 : 2 * v.cap;
  }
  v.n += 1;
  return c;
};
/** a = num / den. */
const popOp = (v: V, num: number, den: number) => {
  v.n -= 1;
  let c = 1;
  if (v.n * den < num * v.cap) {
    c += v.n;
    v.cap = Math.floor(v.cap / 2);
  }
  return c;
};
const phi2 = (n: number, cap: number) => Math.max(2 * n - cap, cap / 2 - n);
const ROUND = ['pop', 'pop', 'push', 'push'] as const;

/** The 49 operations of the opening sequence (16 fills, 1 push, 8 rounds) under shrink-at-1/2 (num/den = 1/2) or 1/4. */
function opening(num: number, den: number) {
  const v: V = { n: 0, cap: 0 };
  const costs: number[] = [];
  const phis: number[] = [];
  const ops: string[] = [];
  const step = (op: string) => {
    costs.push(op === 'push' ? pushOp(v) : popOp(v, num, den));
    phis.push(phi2(v.n, v.cap));
    ops.push(op);
  };
  for (let i = 0; i < 17; i++) step('push');
  for (let r = 0; r < 8; r++) ROUND.forEach(step);
  return { costs, phis, ops };
}
const HALF49 = opening(1, 2);
const QUARTER49 = opening(1, 4);
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const at = (t: number, s: number, e: number) => easeOut(seg(t, s, e));

/** Seconds since the learner answered a predict step (the player's clock is already finished by then), so reveals can animate. */
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

/** One square cell of the vector: filled crema with its key, or an empty taupe slot. */
const Cell = ({ x, y, w, h = w, label, fill = 1, o = 1, fs = 13, stroke = C.taupe }: { x: number; y: number; w: number; h?: number; label?: ReactNode; fill?: number; o?: number; fs?: number; stroke?: string }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={stroke} strokeWidth={1.5} />
    {fill > 0 && <rect x={x} y={y} width={w} height={h} rx={3} fill={C.crema} opacity={fill} />}
    {fill > 0.5 && label !== undefined && (
      <T x={x + w / 2} y={y + h / 2 + 5} s={fs} f={C.espresso} a="middle" w={700}>
        {label}
      </T>
    )}
  </g>
);

/** A row of `cap` cells starting at x0; `fillOf(j)` is 0..1 for cell j (1-based). */
function Row({ x0, y, cap, pitch, w, h = w, fillOf, o = 1, labels = false, fs = 13 }: { x0: number; y: number; cap: number; pitch: number; w: number; h?: number; fillOf: (j: number) => number; o?: number; labels?: boolean; fs?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: cap }, (_, k) => (
        <Cell key={k} x={x0 + pitch * k} y={y} w={w} h={h} label={labels ? k + 1 : undefined} fill={fillOf(k + 1)} fs={fs} />
      ))}
    </g>
  );
}

/** An operation chip: push or pop. */
const Chip = ({ x, y, label, o = 1, hot = 0, w = 56, h = 26, fs = 14 }: { x: number; y: number; label: string; o?: number; hot?: number; w?: number; h?: number; fs?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={6} fill={C.roast} stroke={hot > 0.5 ? C.caramel : C.crema} strokeWidth={hot > 0.5 ? 2.5 : 1} />
    <T x={x + w / 2} y={y + h / 2 + 5} s={fs} f={hot > 0.5 ? C.caramel : C.crema} a="middle" w={600}>
      {label}
    </T>
  </g>
);

/** The potential gauge: a vertical tube, filled caramel from the bottom (cherry below a zero tick when negative). */
function Gauge({ x, top, bottom, zero = bottom, unit, value, neg = false }: { x: number; top: number; bottom: number; zero?: number; unit: number; value: number; neg?: boolean }) {
  const h = Math.abs(value) * unit;
  return (
    <g>
      <rect x={x} y={top} width={24} height={bottom - top} rx={7} fill="none" stroke={C.taupe} strokeWidth={1} />
      {value > 0 && <rect x={x + 1} y={zero - h} width={22} height={h} rx={5} fill={C.caramel} />}
      {value < 0 && <rect x={x + 1} y={zero} width={22} height={h} rx={5} fill={neg ? C.cherry : C.caramel} />}
      {zero !== bottom && <line x1={x - 6} y1={zero} x2={x + 30} y2={zero} stroke={C.taupe} strokeWidth={1.5} />}
    </g>
  );
}

/** A coin: the savings that move into the gauge. */
const Coin = ({ x, y, r = 8, o = 1 }: { x: number; y: number; r?: number; o?: number }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={C.caramel} stroke={C.roast} strokeWidth={1.5} />
    <circle cx={x} cy={y} r={r * 0.45} fill="none" stroke={C.cinnamon} strokeWidth={1.2} />
  </g>
);

/** The cost strip: one bar per operation, cost-1 bars crema, resizes cherry. */
function Strip({ costs, x0, pitch, w, base, unit, p = 1, lab = true, labMin = 5 }: { costs: number[]; x0: number; pitch: number; w: number; base: number; unit: number; p?: number; lab?: boolean; labMin?: number }) {
  return (
    <g>
      {costs.map((c, i) => {
        const g = easeOut(seg(p * costs.length, i, i + 1));
        const h = c * unit * g;
        if (h < 0.5) return null;
        return (
          <g key={i}>
            <rect x={x0 + pitch * i} y={base - h} width={w} height={h} rx={1.5} fill={c > 1 ? C.cherry : C.crema} />
            {lab && c >= labMin && g > 0.9 && (
              <T x={x0 + pitch * i + w / 2} y={base - h - 5} s={13} f={C.cherryText} a="middle" w={700}>
                {c}
              </T>
            )}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Halve when half empty: the vector with two rules hung under it, and the workload as a ribbon of chips.
export function Opening({ t }: StepCtx) {
  const fillP = seg(t, 0.2, 0.8);
  const grow = at(t, 1.0, 1.4);
  const sh1 = at(t, 1.6, 1.9);
  const sh2 = at(t, 1.9, 2.2);
  const chips = ['push', 'pop', 'pop', 'push', 'push', 'pop', 'pop', 'push'];
  const q = at(t, 3.3, 3.6);
  return (
    <Svg label="A vector of 64-bit keys, 16 keys in capacity 16, with a grow rule and a shrink rule, and the workload: push once, then repeat pop, pop, push, push; every cost is a question mark" h={360}>
      <T x={40} y={26} s={13} f={C.taupe}>a vector of 64-bit keys</T>
      <T x={40} y={48} s={13} f={C.taupe}>n = 16, capacity 16</T>
      <Row x0={40} y={70} cap={16} pitch={30} w={26} h={26} labels fillOf={(j) => easeOut(seg(fillP * 16, j - 1, j))} />
      <T x={40} y={136} s={13} f={C.latte} o={grow}>grow: an append to a full vector doubles it</T>
      <T x={40} y={168} s={15} f={C.cinnamon} w={600} o={sh1}>shrink-at-½: a pop that leaves it</T>
      <T x={40} y={188} s={15} f={C.cinnamon} w={600} o={sh2}>less than half full halves it</T>
      {chips.map((c, i) => {
        const o = at(t, 2.2 + 0.11 * i, 2.5 + 0.11 * i);
        const x = 40 + 60 * i;
        return (
          <g key={i}>
            <Chip x={x} y={236} label={c} o={o} />
            <T x={x + 28} y={282} s={13} f={C.taupe} a="middle" o={q}>?</T>
          </g>
        );
      })}
      <T x={516} y={302} s={15} f={C.taupe} a="end" o={q}>…</T>
      <T x={40} y={326} s={13} f={C.taupe} o={q}>unit: one element write</T>
      <T x={40} y={350} s={13} f={C.taupe} o={q}>a resize also copies every key</T>
    </Svg>
  );
}

// 2 · Predict: one round played on the vector itself.
export function Round({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const q = at(t, 0.1, 0.6);
  const X0 = 40, Y = 56, XB = 182;
  // phases of the reveal (local clock): pop, pop (shrink), push, push (grow)
  const P = [0.1, 0.7, 1.4, 2.0];
  const ph = (k: number, d = 0.5) => (shown ? seg(s, P[k], P[k] + d) : 0);
  const gone17 = 1 - at(s, P[0], P[0] + 0.3); // cell 17 empties
  const shrinkSlide = easeInOut(ph(1, 0.6)); // 32-row fades out, 16-row slides up (from y 96 to y 56)
  const growSlide = easeInOut(ph(3, 0.6));
  const cell16Fill = ph(2, 0.3);
  const key17 = at(s, P[3] + 0.3, P[3] + 0.5);
  let row: ReactNode;
  if (!shown) {
    row = <Row x0={X0} y={Y} cap={32} pitch={15} w={12} h={14} fillOf={(j) => (j <= 17 ? 1 : 0)} o={q} />;
  } else if (s < P[1]) {
    row = <Row x0={X0} y={Y} cap={32} pitch={15} w={12} h={14} fillOf={(j) => (j <= 16 ? 1 : j === 17 ? gone17 : 0)} />;
  } else if (s < P[3]) {
    // the 32-row (16 keys, then 15) hands over to the 16-row
    row = (
      <g>
        <Row x0={X0} y={Y} cap={32} pitch={15} w={12} h={14} o={1 - shrinkSlide} fillOf={(j) => (j <= 15 ? 1 : 0)} />
        <Row x0={X0} y={lerp(96, Y, shrinkSlide)} cap={16} pitch={30} w={26} h={14} fillOf={(j) => (j <= 15 ? easeOut(seg(s, P[1] + 0.2 + 0.015 * j, P[1] + 0.4 + 0.015 * j)) : j === 16 ? cell16Fill : 0)} />
        <g opacity={(1 - seg(s, P[1] + 0.4, P[1] + 0.6)) * seg(s, P[1] + 0.1, P[1] + 0.2)}>
          {Array.from({ length: 15 }, (_, k) => (
            <line key={k} x1={X0 + 15 * k + 6} y1={Y + 14} x2={X0 + 30 * k + 13} y2={92} stroke={C.caramel} strokeWidth={1.5} />
          ))}
        </g>
      </g>
    );
  } else {
    row = (
      <g>
        <Row x0={X0} y={lerp(Y, 20, growSlide)} cap={16} pitch={30} w={26} h={14} o={1 - growSlide} fillOf={() => 1} />
        <Row x0={X0} y={lerp(96, Y, growSlide)} cap={32} pitch={15} w={12} h={14} fillOf={(j) => (j <= 16 ? easeOut(seg(s, P[3] + 0.1 + 0.012 * j, P[3] + 0.3 + 0.012 * j)) : j === 17 ? key17 : 0)} />
        <g opacity={(1 - seg(s, P[3] + 0.3, P[3] + 0.5)) * seg(s, P[3] + 0.05, P[3] + 0.1)}>
          {Array.from({ length: 16 }, (_, k) => (
            <line key={k} x1={X0 + 30 * k + 13} y1={Y + 14} x2={X0 + 15 * k + 6} y2={92} stroke={C.caramel} strokeWidth={1.5} />
          ))}
        </g>
      </g>
    );
  }
  const labels = ['pop', 'pop', 'push', 'push'];
  const costs = [1, 16, 1, 17];
  return (
    <Svg label="One round of pop, pop, push, push from 17 keys in capacity 32: the second pop halves the vector and copies 15 keys, the second push doubles it again and copies 16; the costs are 1, 16, 1, 17, so the round costs 35 writes" h={380}>
      <T x={40} y={30} s={13} f={C.taupe}>after the push: n = 17, capacity 32</T>
      {row}
      {labels.map((l, k) => (
        <g key={k}>
          <Chip x={XB + 60 * k} y={128} fs={16} label={l} o={q} hot={shown ? seg(s, P[k], P[k] + 0.1) * (1 - seg(s, P[k] + 0.55, P[k] + 0.6)) : 0} />
          {!shown && <T x={XB + 60 * k + 28} y={120} s={13} f={C.taupe} a="middle" o={q}>?</T>}
        </g>
      ))}
      <line x1={XB} y1={330} x2={XB + 236} y2={330} stroke={C.mocha} />
      {shown &&
        costs.map((c, k) => {
          const h = c * 6 * at(s, P[k] + 0.15, P[k] + 0.55);
          return (
            <g key={k}>
              <rect x={XB + 60 * k} y={330 - h} width={56} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
              {c > 1 && <T x={XB + 60 * k + 28} y={330 - h - 6} s={15} f={C.cherryText} a="middle" w={700} o={at(s, P[k] + 0.4, P[k] + 0.6)}>{c}</T>}
            </g>
          );
        })}
      {!shown && <T x={520} y={362} s={17} f={C.crema} a="end" w={700} o={q}>round = ?</T>}
      {shown && (
        <g>
          <T x={520} y={354} s={24} f={C.crema} a="end" serif w={700} o={at(s, 2.5, 2.9)}>round = 35</T>
          <T x={520} y={374} s={13} f={C.latte} a="end" o={at(s, 2.6, 3.0)}>capacity 32 → 16 → 32</T>
        </g>
      )}
    </Svg>
  );
}

// 3 · The thrash: all 49 operations as one cost strip, and the cost per operation as C grows.
export function Thrash({ t }: StepCtx) {
  const p = seg(t, 0.2, 2.4);
  const tot = at(t, 2.6, 3.0);
  const rows = [
    ['C = 16', '8.75'],
    ['C = 1,024', '512.75'],
    ['C = 1,048,576', '524,288.75'],
  ];
  return (
    <Svg label="The 49 operations of the opening sequence under shrink-at-half: after the fill, a comb of resizing spikes 16 and 17 that never stops, far above the dashed line of 3 per operation; 328 writes against 147. The cost per operation in the rounds, (2C + 3)/4, grows with C" h={380}>
      <T x={40} y={30} s={13} f={C.latte}>16 fills · 1 push · 8 rounds = 49 operations</T>
      <T x={40} y={52} s={13} f={C.caramel}>dashed line: 3 per op</T>
      <T x={530} y={54} s={17} f={C.cherryText} a="end" w={700} o={tot}>328 writes</T>
      <Strip costs={HALF49.costs} x0={40} pitch={9.8} w={7} base={216} unit={7} p={p} lab={false} />
      <line x1={40} y1={216 - 21} x2={520} y2={216 - 21} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
      <line x1={40} y1={216} x2={520} y2={216} stroke={C.mocha} />
      <T x={530} y={236} s={13} f={C.taupe} a="end" o={tot}>dashed total: 3 × 49 = 147</T>
      <T x={40} y={266} s={13} f={C.taupe} o={at(t, 2.8, 3.1)}>writes per operation in the rounds, (2C + 3)/4</T>
      {rows.map(([c, v], k) => {
        const o = at(t, 3.0 + 0.4 * k, 3.4 + 0.4 * k);
        return (
          <g key={c} opacity={o}>
            <T x={40} y={298 + 30 * k} s={15} f={C.crema}>{c}</T>
            <T x={520} y={298 + 30 * k} s={17} f={C.cherryText} a="end" w={700}>{v}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · One number for the whole structure: the counter's coins pour into a gauge; one increment priced both ways.
export function Potential({ t }: StepCtx) {
  const fillG = easeOut(seg(t, 0.9, 1.5));
  const incr = at(t, 1.8, 2.2);
  const flash = (seg(t, 1.8, 2.0) * (1 - seg(t, 2.1, 2.5)));
  const drain = easeInOut(seg(t, 2.4, 3.0));
  const bits0 = [0, 0, 1, 1, 1];
  const bits1 = [0, 1, 0, 0, 0];
  const changed = [false, true, true, true, true];
  const gaugeV = lerp(lerp(0, 3, fillG), 1, drain);
  const barC = at(t, 2.4, 3.0);
  const bar2 = at(t, 3.0, 3.4);
  const bar3 = at(t, 3.4, 3.8);
  return (
    <Svg label="The counter's three coins pour into one gauge, Phi equals 3; incrementing 00111 to 01000 costs 4 flips, lowers Phi from 3 to 1, so the amortized cost is 2" h={400}>
      <T x={40} y={30} s={15} f={C.crema}>ĉᵢ = cᵢ + Φ(Dᵢ) − Φ(Dᵢ₋₁)</T>
      <T x={40} y={50} s={13} f={C.taupe}>Dᵢ: the state after operation i</T>
      {bits0.map((b0, k) => {
        const flip = changed[k] && incr > 0.5;
        const v = flip ? bits1[k] : b0;
        return (
          <g key={k}>
            <rect x={100 + 64 * k} y={100} width={60} height={50} rx={8} fill={C.roast} stroke={changed[k] && flash > 0 ? C.cherry : C.mocha} strokeWidth={changed[k] && flash > 0 ? 2 + 2 * flash : 1} />
            <T x={130 + 64 * k} y={133} s={22} f={v ? C.crema : C.taupe} a="middle" w={700}>{v}</T>
          </g>
        );
      })}
      {[2, 3, 4].map((k, j) => {
        const e = easeInOut(seg(t, 0.4 + 0.1 * j, 1.2 + 0.1 * j));
        return <Coin key={k} x={lerp(130 + 64 * k, 500, e)} y={lerp(84, 232 - 12 * j, e)} o={1 - seg(t, 1.3, 1.6)} />;
      })}
      <Coin x={130 + 64} y={84} o={at(t, 2.8, 3.2)} />
      <T x={536} y={70} s={15} f={C.caramel} a="end" w={600}>{t < 0.9 ? 'Φ = ?' : `Φ = ${Math.round(gaugeV)}`}</T>
      <Gauge x={488} top={80} bottom={240} unit={40} value={gaugeV} />
      <line x1={100} y1={340} x2={420} y2={340} stroke={C.mocha} />
      <rect x={100} y={340 - 64 * barC} width={36} height={64 * barC} rx={2} fill={C.cherry} />
      <T x={118} y={356} s={13} f={C.cherryText} a="middle" o={barC}>c = 4</T>
      <rect x={150} y={276} width={36} height={32 * bar2} rx={2} fill={C.caramel} />
      <T x={196} y={296} s={13} f={C.latte} o={bar2}>ΔΦ = 1 − 3 = −2</T>
      <rect x={330} y={340 - 32 * bar3} width={36} height={32 * bar3} rx={2} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={376} y={332} s={17} f={C.caramel} w={700} o={bar3}>ĉ = 2</T>
      <T x={40} y={384} s={13} f={C.taupe} o={at(t, 3.8, 4.2)}>one coin left, on the new 1 bit</T>
    </Svg>
  );
}

// 5 · The middle terms cancel.
export function Telescope({ t }: StepCtx) {
  const eq = [
    { y: 50, i: '₁', p: '₀', cc: 'ĉ₁', c: 'c₁', a: '+ Φ₁', b: '− Φ₀' },
    { y: 80, i: '₂', p: '₁', cc: 'ĉ₂', c: 'c₂', a: '+ Φ₂', b: '− Φ₁' },
    { y: 110, i: '₃', p: '₂', cc: 'ĉ₃', c: 'c₃', a: '+ Φ₃', b: '− Φ₂' },
    { y: 165, i: '₁₆', p: '₁₅', cc: 'ĉ₁₆', c: 'c₁₆', a: '+ Φ₁₆', b: '− Φ₁₅' },
  ];
  const col = { cc: 40, eq: 112, c: 140, a: 220, b: 320 };
  const rows = eq.map((e, k) => at(t, 0.2 + 0.2 * k, 0.5 + 0.2 * k));
  const strike = (k: number) => at(t, 0.9 + 0.5 * k, 1.3 + 0.5 * k);
  const fade = (k: number) => 1 - 0.7 * strike(k);
  const sum = at(t, 2.2, 2.6);
  return (
    <Svg label="Adding the amortized costs, every Phi in the middle cancels: the sum of c-hat equals the sum of c plus Phi sixteen minus Phi zero; for the counter 32 equals 31 plus 1 minus 0" h={380}>
      {eq.map((e, k) => (
        <g key={k} opacity={rows[k]}>
          <T x={col.cc} y={e.y} s={15} f={C.crema}>{e.cc}</T>
          <T x={col.eq} y={e.y} s={15} f={C.crema}>=</T>
          <T x={col.c} y={e.y} s={15} f={C.crema}>{e.c}</T>
          <T x={col.a} y={e.y} s={15} f={C.crema} o={k < 2 ? fade(k) : 1}>{e.a}</T>
          <T x={col.b} y={e.y} s={15} f={C.crema} o={k >= 1 && k <= 2 ? fade(k - 1) : 1}>{e.b}</T>
        </g>
      ))}
      <T x={col.cc} y={140} s={15} f={C.taupe}>⋮</T>
      {[0, 1].map((k) => {
        const p = strike(k);
        const x1 = col.a + 4, y1 = eq[k].y + 4, x2 = col.b + 4, y2 = eq[k + 1].y - 14;
        return <line key={k} x1={x1} y1={y1} x2={lerp(x1, x2, p)} y2={lerp(y1, y2, p)} stroke={C.caramel} strokeWidth={2.5} opacity={rows[k + 1]} />;
      })}
      <line x1={40} y1={190} x2={420} y2={190} stroke={C.mocha} />
      <T x={40} y={218} s={17} f={C.crema} w={600} o={sum}>Σĉ = Σc + Φ₁₆ − Φ₀</T>
      <T x={40} y={246} s={15} f={C.latte} o={sum}>32 = 31 + 1 − 0</T>
      <T x={40} y={268} s={13} f={C.taupe} o={sum}>16 increments: charged 32, flipped 31, 1 bit left</T>
      <T x={40} y={304} s={15} f={C.caramel} o={at(t, 2.8, 3.2)}>Φ₀ = 0 and Φ ≥ 0</T>
      <T x={40} y={330} s={15} f={C.caramel} o={at(t, 3.0, 3.4)}>⇒ Σc ≤ Σĉ after every operation</T>
      <T x={40} y={362} s={13} f={C.taupe} o={at(t, 3.6, 4.0)}>Tarjan 1985: the physicist’s view</T>
    </Svg>
  );
}

// 6 · The stack: Phi is the number of keys.
type SOp = { kind: 'push' | 'mp'; k: number; start: number; dur: number; cost: number; hat: number };
const SOPS: SOp[] = (() => {
  const o: SOp[] = [];
  for (let i = 0; i < 6; i++) o.push({ kind: 'push', k: 0, start: 0.3 + 0.3 * i, dur: 0.3, cost: 1, hat: 2 });
  o.push({ kind: 'mp', k: 4, start: 2.2, dur: 0.6, cost: 4, hat: 0 });
  o.push({ kind: 'push', k: 0, start: 2.9, dur: 0.3, cost: 1, hat: 2 });
  o.push({ kind: 'push', k: 0, start: 3.2, dur: 0.3, cost: 1, hat: 2 });
  o.push({ kind: 'mp', k: 10, start: 3.6, dur: 0.6, cost: 4, hat: 0 });
  return o;
})();
function stackSize(t: number) {
  let size = 0;
  for (const op of SOPS) {
    if (t <= op.start) return size;
    const p = seg(t, op.start, op.start + op.dur);
    const delta = op.kind === 'push' ? 1 : -Math.min(op.k, size);
    if (p < 1) return size + delta * p;
    size += delta;
  }
  return size;
}
export function StackPhi({ t }: StepCtx) {
  const BASE = 330, K = 24;
  const size = stackSize(t);
  const whole = Math.floor(size + 1e-6);
  const frac = size - whole;
  const tally = at(t, 4.4, 4.8);
  return (
    <Svg label="The multipop stack with Phi equal to the number of keys: pushes cost 1 and have amortized cost 2, a multipop of k keys costs k and has amortized cost 0; ten operations cost 16 in all, equal to the amortized total" h={408}>
      <T x={40} y={30} s={13} f={C.taupe}>multipop stack, as in the last reel</T>
      <path d={`M 56 ${BASE - 150} L 56 ${BASE + 2} L 164 ${BASE + 2} L 164 ${BASE - 150}`} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      {Array.from({ length: 7 }, (_, l) => {
        const f = l < whole ? 1 : l === whole ? frac : 0;
        return f > 0.02 ? <rect key={l} x={60} y={BASE - K * (l + 1)} width={100} height={K - 2} rx={3} fill={C.crema} opacity={f} /> : null;
      })}
      <Gauge x={180} top={BASE - 150} bottom={BASE} unit={K} value={size} />
      <T x={192} y={BASE - 160} s={13} f={C.caramel} a="middle">Φ = size</T>
      <line x1={240} y1={BASE} x2={520} y2={BASE} stroke={C.mocha} />
      {SOPS.map((op, i) => {
        const g = at(t, op.start + op.dur * 0.5, op.start + op.dur);
        const x = 240 + 28 * i;
        const h = op.cost * K * g;
        const hh = op.hat * K * g;
        return (
          <g key={i}>
            <rect x={x} y={BASE - h} width={20} height={h} rx={2} fill={op.kind === 'mp' ? C.cherry : C.crema} />
            {hh > 0.5 && <rect x={x - 3} y={BASE - hh} width={26} height={hh} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />}
            {op.hat === 0 && g > 0.5 && <T x={x + 10} y={BASE + 16} s={13} f={C.caramel} a="middle">0</T>}
          </g>
        );
      })}
      <T x={240} y={BASE - 112} s={13} f={C.taupe}>bars: c · outlines: ĉ</T>
      <T x={40} y={372} s={15} f={C.crema} w={600} o={tally}>Σc = 16 = Σĉ</T>
      <T x={40} y={398} s={15} f={C.caramel} o={tally}>push 2 · pop and multipop 0</T>
    </Svg>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The doubling vector's 16 appends: costs, capacities and Phi = 2n - cap after each.
const COSTS16 = [1, 2, 3, 1, 5, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1];
const CAPS16 = [1, 2, 4, 4, 8, 8, 8, 8, 16, 16, 16, 16, 16, 16, 16, 16];
const PHI16 = CAPS16.map((cap, k) => 2 * (k + 1) - cap); // 1, 2, 2, 4, 2, 4, 6, 8, 2, 4, 6, 8, 10, 12, 14, 16
const CX = (j: number) => 40 + 30 * (j - 1);

// 7 · Predict: four candidate gauges on the same 16 appends.
export function WhichPhi({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  const cands = [
    { title: 'Φ = n', vals: PHI16.map((_, k) => k + 1), hat: 'ĉ₉ = 10' },
    { title: 'Φ = cap − n', vals: CAPS16.map((c, k) => c - (k + 1)), hat: 'ĉ₉ = 16' },
    { title: 'Φ = 2n − cap', vals: PHI16, hat: 'ĉ₉ = 3' },
    { title: 'Φ = cap', vals: CAPS16, hat: 'ĉ₉ = 17' },
  ];
  const BASE = 200;
  return (
    <Svg label="Sixteen appends to the doubling vector and four candidate potentials: with Phi equal to n the ninth append has amortized cost 10, with the empty slots 16, with 2n minus cap 3, with cap 17; only 2n minus cap drops on the expensive append" h={380}>
      <T x={40} y={30} s={13} f={C.taupe} o={a0}>16 appends, doubling from empty</T>
      <line x1={40} y1={BASE} x2={520} y2={BASE} stroke={C.mocha} />
      {COSTS16.map((c, k) => {
        const h = c * 15 * easeOut(seg(t, 0.2 + 0.04 * k, 0.6 + 0.04 * k));
        return (
          <g key={k}>
            <rect x={CX(k + 1)} y={BASE - h} width={26} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
            {c > 1 && <T x={CX(k + 1) + 13} y={BASE - h - 5} s={13} f={C.cherryText} a="middle" w={700} o={a0}>{c}</T>}
          </g>
        );
      })}
      <rect x={CX(9) - 3} y={BASE - 135 - 3} width={32} height={138} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={at(t, 1.2, 1.6)} />
      <T x={318} y={78} s={15} f={C.cherryText} o={at(t, 1.2, 1.6)}>append 9:</T>
      <T x={318} y={98} s={15} f={C.cherryText} o={at(t, 1.2, 1.6)}>copies 8, costs 9</T>
      {cands.map((c, k) => {
        const px = 40 + 250 * (k % 2), py = 236 + 66 * Math.floor(k / 2);
        const right = k === 2;
        const f = shown ? at(s, 0.1 + 0.3 * k, 0.5 + 0.3 * k) : 0;
        const hl = right && shown ? at(s, 1.4, 1.7) : 0;
        const mx = Math.max(...c.vals);
        const pts = c.vals.map((v, i) => `${i ? 'L' : 'M'}${(px + 10 + (i * 100) / 15).toFixed(1)} ${(py + 48 - (v / mx) * 22).toFixed(1)}`).join(' ');
        return (
          <g key={k}>
            <rect x={px} y={py} width={230} height={56} rx={8} fill="none" stroke={C.taupe} strokeWidth={1} />
            {hl > 0 && <rect x={px} y={py} width={230} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={hl} />}
            {!shown && <T x={px + 115} y={py + 36} s={22} f={C.taupe} a="middle" w={700} o={a0}>?</T>}
            {shown && (
              <g opacity={f}>
                <T x={px + 10} y={py + 18} s={13} f={C.crema}>{c.title}</T>
                <path d={pts} fill="none" stroke={right ? C.caramel : C.latte} strokeWidth={right ? 2.5 : 1.5} />
                <T x={px + 222} y={py + 40} s={right ? 17 : 15} f={right ? C.caramel : C.cherryText} a="end" w={700}>{c.hat}</T>
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · The gauge on the vector: it rises 2 on every cheap append and drains on each grow.
const EV8 = (() => {
  let tt = 0.3;
  return COSTS16.map((c, k) => {
    const dur = c > 1 ? 0.42 : 0.26;
    const e = { i: k + 1, c, start: tt, dur, from: k ? PHI16[k - 1] : 0, to: PHI16[k], cap: CAPS16[k], capBefore: k ? CAPS16[k - 1] : 0 };
    tt += dur;
    return e;
  });
})();
export function VectorGauge({ t }: StepCtx) {
  const cur = [...EV8].reverse().find((e) => e.start <= t) ?? null;
  const p = cur ? seg(t, cur.start, cur.start + cur.dur) : 0;
  const n = cur ? cur.i - 1 + (p > 0.5 ? 1 : 0) : 0;
  const cap = cur ? (cur.c > 1 && p < 0.4 ? cur.capBefore : cur.cap) : 0;
  const val = cur ? lerp(cur.from, cur.to, easeOut(p)) : 0;
  const GB = 250, GU = 8;
  const colX = (i: number) => 40 + 26.9 * (i - 1);
  return (
    <Svg label="The doubling vector with the potential gauge Phi equal to 2n minus cap: the gauge rises by 2 on every cheap append and drains on each grow; the actual costs spike while the amortized cost stays at 3 (2 for the first append); total actual 31, total amortized 47, which is 31 plus the final Phi of 16" h={380}>
      <T x={536} y={22} s={15} f={C.crema} a="end" w={600} o={at(t, 4.2, 4.6)}>Σc = 31</T>
      <T x={536} y={48} s={15} f={C.caramel} a="end" w={600} o={at(t, 4.2, 4.6)}>Σĉ = 47 = 31 + Φ₁₆</T>
      {cur && <Row x0={40} y={64} cap={Math.max(cap, 1)} pitch={30} w={26} labels fillOf={(j) => (j <= n ? 1 : 0)} />}
      {cur && cur.c > 1 && cur.i > 1 && (
        <rect x={40} y={94} width={30 * (cur.i - 1) - 4} height={4} rx={2} fill={C.caramel} opacity={seg(p, 0, 0.2) * (1 - seg(p, 0.6, 0.9))} />
      )}
      <T x={40} y={126} s={15} f={C.caramel} w={600}>gauge: Φ = 2n − cap</T>
      <T x={40} y={146} s={13} f={C.taupe}>n = {n}, capacity {cap}</T>
      <T x={494} y={112} s={15} f={C.caramel} a="end" w={600}>Φ = {Math.round(val)}</T>
      <Gauge x={500} top={GB - 16 * GU - 4} bottom={GB} unit={GU} value={val} />
      <line x1={40} y1={360} x2={470} y2={360} stroke={C.mocha} />
      <line x1={40} y1={333} x2={470} y2={333} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 5" />
      <T x={470} y={325} s={13} f={C.caramel} a="end">ĉ = 3</T>
      {EV8.map((e) => {
        const g = at(t, e.start + e.dur * 0.4, e.start + e.dur);
        const h = e.c * 9 * g;
        const hh = (e.i === 1 ? 2 : 3) * 9 * g;
        return (
          <g key={e.i}>
            <rect x={colX(e.i)} y={360 - h} width={22} height={h} rx={2} fill={e.c > 1 ? C.cherry : C.crema} />
            {e.c > 1 && g > 0.8 && <T x={colX(e.i) + 11} y={360 - h - 5} s={13} f={C.cherryText} a="middle" w={700}>{e.c}</T>}
            <rect x={colX(e.i) - 2} y={360 - hh} width={26} height={hh} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={g > 0.6 ? 1 : 0} />
          </g>
        );
      })}
      <T x={470} y={378} s={13} f={C.taupe} a="end">bars: c · outlines: ĉ</T>
    </Svg>
  );
}

// 9 · Pops drive 2n - cap negative.
export function Negative({ t }: StepCtx) {
  const pops = Math.min(9, Math.max(0, (t - 0.4) / 0.3));
  const k = Math.floor(pops + 1e-9);
  const n = 17 - k;
  const val = 2 - 2 * pops;
  const Z = 210, U = 6;
  const pin = at(t, 1.1, 1.5);
  const end = at(t, 3.3, 3.7);
  return (
    <Svg label="Keeping Phi equal to 2n minus cap and popping: from 17 keys in capacity 32 the gauge falls to 0 at 16 keys, then below zero; after two pops Phi is minus 2 and the amortized total 48 is less than the actual total 50; at 8 keys Phi is minus 16" h={380}>
      <T x={40} y={26} s={13} f={C.taupe}>17 pushes, then pops (shrink-at-¼ from here)</T>
      <Row x0={40} y={50} cap={32} pitch={15} w={12} h={14} fillOf={(j) => (j <= n ? 1 : 0)} />
      <T x={40} y={90} s={13} f={C.taupe}>n = {n} of 32</T>
      <T x={40} y={130} s={15} f={C.crema} w={600} o={pin}>after pop 2: Φ = −2</T>
      <T x={40} y={158} s={15} f={C.cherryText} w={600} o={pin}>Σĉ = 48 &lt; Σc = 50</T>
      <T x={40} y={192} s={13} f={C.taupe} o={pin}>each pop below half: ĉ = −1</T>
      <Gauge x={500} top={130} bottom={320} zero={Z} unit={U} value={val} neg />
      <T x={492} y={Z + 4} s={13} f={C.taupe} a="end">0</T>
      <T x={492} y={Math.min(Z - val * U + (val < 0 ? 18 : -6), 316)} s={val <= -15 ? 17 : 13} f={val < 0 ? C.cherryText : C.caramel} a="end" w={val <= -15 ? 700 : 500} o={val < 0 ? 1 : 0}>
        Φ = {Math.round(val)}
      </T>
      <T x={40} y={340} s={13} f={C.latte} o={end}>a potential below zero proves nothing</T>
    </Svg>
  );
}

// 10 and 11 share the V: Phi against n for one capacity.
const VX = (n: number, x0 = 60, per = 460 / 32) => x0 + n * per;
export function TwoPiece({ t }: StepCtx) {
  const Y = (f: number) => 330 - f * 8.125;
  const left = easeInOut(seg(t, 0.4, 1.4));
  const right = easeInOut(seg(t, 1.6, 2.6));
  const lab = at(t, 2.7, 3.1);
  return (
    <Svg label="The two-piece potential against the load factor for capacity 32: the left arm cap over 2 minus n falls to 0 at half full, the right arm 2n minus cap rises to 32 at full; at a quarter full Phi is 8, enough for the shrink's 7 copies" h={380}>
      <T x={40} y={26} s={15} f={C.crema}>Φ = 2n − cap if α ≥ ½</T>
      <T x={40} y={52} s={15} f={C.crema}>Φ = cap/2 − n if α &lt; ½</T>
      <T x={40} y={78} s={13} f={C.latte}>α = n / cap, the load factor</T>
      <line x1={60} y1={330} x2={520} y2={330} stroke={C.taupe} />
      {([[8, '¼', 'n = 8'], [16, '½', '16 · Φ = 0'], [32, '1', '32']] as const).map(([n, a, l]) => (
        <g key={n}>
          <line x1={VX(n)} y1={330} x2={VX(n)} y2={336} stroke={C.taupe} />
          <T x={VX(n)} y={352} s={13} f={C.taupe} a="middle">{a}</T>
          <T x={VX(n)} y={370} s={13} f={C.latte} a="middle">{l}</T>
        </g>
      ))}
      <path d={`M ${VX(0)} ${Y(16)} L ${lerp(VX(0), VX(16), left)} ${lerp(Y(16), Y(0), left)}`} fill="none" stroke={C.caramel} strokeWidth={2} />
      <path d={`M ${VX(16)} ${Y(0)} L ${lerp(VX(16), VX(32), right)} ${lerp(Y(0), Y(32), right)}`} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g opacity={lab}>
        <T x={440} y={112} s={15} f={C.crema} a="end" w={600}>full: Φ = 32</T>
        <T x={440} y={134} s={13} f={C.taupe} a="end">pays the grow’s 32 copies</T>
        <line x1={VX(8)} y1={206} x2={VX(8)} y2={Y(8) - 8} stroke={C.taupe} strokeDasharray="2 4" />
        <circle cx={VX(8)} cy={Y(8)} r={5} fill={C.caramel} />
        <T x={80} y={176} s={15} f={C.crema} w={600}>a quarter: Φ = 8</T>
        <T x={80} y={198} s={13} f={C.taupe}>pays the shrink’s 7 copies</T>
      </g>
    </Svg>
  );
}

// 11 · Predict: price the shrinking pop from the gauge.
export function ShrinkPop({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  const X = (n: number) => 60 + 12 * n;
  const Y = (f: number) => 300 - f * 6.5;
  const half = easeInOut(seg(s, 0, 0.6));
  const slide = easeInOut(seg(s, 0.5, 1.2));
  const bars = at(s, 1.0, 1.5);
  const dotN = lerp(8, 7, slide);
  const dotY = lerp(Y(8), Y(1), slide);
  return (
    <Svg label="Pricing the pop that shrinks: eight keys in capacity 32 is a quarter full with Phi 8; the pop leaves 7 keys, the vector halves to 16 and copies 7, actual cost 8; Phi falls to 1, so the amortized cost is 8 plus 1 minus 8, which is 1" h={380}>
      {!shown && <Row x0={40} y={40} cap={32} pitch={15} w={12} h={14} fillOf={(j) => (j <= 8 ? 1 : 0)} o={a0} />}
      {shown && <Row x0={40} y={40} cap={32} pitch={15} w={12} h={14} fillOf={(j) => (j <= 8 ? 1 : 0)} o={1 - half} />}
      {shown && <Row x0={40} y={40} cap={16} pitch={30} w={26} h={14} fillOf={(j) => (j <= 7 ? 1 : 0)} o={half} />}
      <line x1={60} y1={300} x2={444} y2={300} stroke={C.taupe} />
      <path d={`M ${X(0)} ${Y(16)} L ${X(16)} ${Y(0)} L ${X(32)} ${Y(32)}`} fill="none" stroke={C.caramel} strokeWidth={2} opacity={a0} />
      {shown && <path d={`M ${X(0)} ${Y(8)} L ${X(8)} ${Y(0)} L ${X(16)} ${Y(16)}`} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="5 4" opacity={half} />}
      <circle cx={X(dotN)} cy={dotY} r={6} fill={C.caramel} />
      <T x={X(dotN) + 14} y={dotY + 4} s={15} f={C.caramel} w={600} o={a0}>{shown && slide > 0.5 ? 'Φ = 1' : 'Φ = 8'}</T>
      {shown && (
        <g opacity={bars}>
          <line x1={100} y1={180} x2={330} y2={180} stroke={C.mocha} />
          <rect x={110} y={180 - 64 * bars} width={36} height={64 * bars} rx={2} fill={C.cherry} />
          <T x={128} y={196} s={13} f={C.cherryText} a="middle">c = 8</T>
          <rect x={190} y={180 - 56 * bars} width={36} height={56 * bars} rx={2} fill={C.caramel} />
          <T x={208} y={196} s={13} f={C.latte} a="middle">ΔΦ = −7</T>
          <rect x={270} y={180 - 8 * bars} width={36} height={8 * bars} rx={2} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={288} y={196} s={15} f={C.caramel} a="middle" w={700}>ĉ = 1</T>
        </g>
      )}
      <T x={40} y={338} s={15} f={C.crema}>pop: 8 → 7 keys, under a quarter</T>
      <T x={40} y={356} s={13} f={C.taupe}>halve to 16 and copy 7: cost 8</T>
      <T x={520} y={350} s={22} f={C.crema} a="end" serif w={700}>{shown ? 'ĉ = 1' : 'ĉ = ?'}</T>
    </Svg>
  );
}

// 12 · Every case, at most 3.
export function Cases({ t }: StepCtx) {
  const rows: [string, string, string, string][] = [
    ['push, α ≥ ½', '1', '+2', '3'],
    ['push that grows', 'n + 1', '2 − n', '3'],
    ['push, α < ½', '1', '−1', '0'],
    ['pop, stays ≥ ½', '1', '−2', '−1'],
    ['pop, ends below ½', '1', '+1', '2'],
    ['pop that shrinks', 'cap/4', '1 − cap/4', '1'],
  ];
  return (
    <Svg label="The six cases of the proof for a table that grows and shrinks at a quarter: a push costs at most 3 amortized, a pop at most 2; any m operations from empty cost at most 3 times m" h={396}>
      <T x={40} y={34} s={13} f={C.latte}>case</T>
      <T x={262} y={34} s={13} f={C.latte}>c</T>
      <T x={352} y={34} s={13} f={C.latte}>ΔΦ</T>
      <T x={492} y={34} s={13} f={C.latte}>ĉ</T>
      <line x1={40} y1={44} x2={520} y2={44} stroke={C.mocha} />
      {rows.map(([c, a, b, d], k) => {
        const o = at(t, 0.3 + 0.45 * k, 0.65 + 0.45 * k);
        const y = 74 + 40 * k;
        return (
          <g key={k} opacity={o}>
            <T x={40} y={y} s={13} f={C.crema}>{c}</T>
            <T x={262} y={y} s={15} f={C.crema}>{a}</T>
            <T x={352} y={y} s={15} f={C.crema}>{b}</T>
            <T x={492} y={y} s={17} f={C.caramel} w={700}>{d}</T>
          </g>
        );
      })}
      <T x={40} y={324} s={15} f={C.caramel} w={600} o={at(t, 3.1, 3.5)}>any m operations from empty:</T>
      <T x={40} y={350} s={15} f={C.caramel} w={600} o={at(t, 3.3, 3.7)}>Σc ≤ 3·pushes + 2·pops ≤ 3m</T>
      <T x={40} y={380} s={13} f={C.taupe} o={at(t, 3.5, 3.9)}>edge cases at capacities 0–2: ĉ ≤ 2 (Deep dive)</T>
    </Svg>
  );
}

// 13 · Shrink-at-1/2 climbs the V: a resize must slide down the V.
type Pt = [number, number];
function along(pts: Pt[], p: number): Pt {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let d = p * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const f = lens[i] ? Math.min(1, d / lens[i]) : 1;
      return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
}
const trail = (pts: Pt[], p: number) => {
  const end = along(pts, p);
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = p * total;
  const out: Pt[] = [pts[0]];
  for (let i = 0; i < lens.length && d > 0; i++) {
    if (d >= lens[i]) out.push(pts[i + 1]);
    else out.push(end);
    d -= lens[i];
  }
  return out.map((q, i) => `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ');
};
export function Climb({ t }: StepCtx) {
  const AX = (al: number) => 60 + 460 * al;
  const AY = (f: number) => 316 - 240 * f;
  const A: Pt[] = [[AX(17 / 32), AY(1 / 16)], [AX(0.5), AY(0)], [AX(0.25), AY(0.25)], [AX(7 / 16), AY(1 / 16)]];
  const B: Pt[] = [[AX(17 / 32), AY(1 / 16)], [AX(0.5), AY(0)], [AX(15 / 16), AY(14 / 16)], [AX(1), AY(1)], [AX(17 / 32), AY(1 / 16)]];
  const pa = easeInOut(seg(t, 0.4, 2.0));
  const pb = easeInOut(seg(t, 2.2, 3.8));
  const da = along(A, pa);
  const db = along(B, pb);
  return (
    <Svg label="Both shrink rules as the path of a dot on the potential V, with the load factor across and Phi over cap up: under shrink-at-a-quarter the shrink slides the dot from Phi 8 down to 1, amortized cost 1; under shrink-at-half the shrink fires at the bottom where Phi is 0 and jumps up to 14, amortized cost 30" h={380}>
      <line x1={60} y1={320} x2={520} y2={320} stroke={C.taupe} />
      <path d={`M ${AX(0)} ${AY(0.5)} L ${AX(0.5)} ${AY(0)} L ${AX(1)} ${AY(1)}`} fill="none" stroke={C.caramel} strokeWidth={2} />
      {([[0.25, '¼'], [0.5, '½'], [1, '1']] as const).map(([al, l]) => (
        <T key={l} x={AX(al)} y={340} s={13} f={C.taupe} a="middle">{l}</T>
      ))}
      <path d={trail(A, pa)} fill="none" stroke={C.caramel} strokeWidth={3} opacity={pa > 0 ? 1 : 0} />
      <circle cx={da[0]} cy={da[1]} r={7} fill={C.caramel} opacity={pa > 0 ? 1 : 0} />
      <path d={trail(B, pb)} fill="none" stroke={C.cinnamon} strokeWidth={3} strokeDasharray={pb > 0.75 ? '6 5' : undefined} opacity={pb > 0 ? 1 : 0} />
      <circle cx={db[0]} cy={db[1]} r={7} fill={C.cinnamon} opacity={pb > 0 ? 1 : 0} />
      <g opacity={at(t, 1.8, 2.2)}>
        <T x={70} y={292} s={15} f={C.caramel} w={600}>shrink-at-¼</T>
        <T x={70} y={314} s={13} f={C.caramel}>Φ 8 → 1, ĉ = 1</T>
      </g>
      <circle cx={AX(15 / 16)} cy={AY(14 / 16)} r={9} fill="none" stroke={C.cinnamon} strokeWidth={2.5} opacity={at(t, 2.9, 3.2)} />
      <g opacity={at(t, 3.2, 3.6)}>
        <T x={462} y={84} s={15} f={C.cinnamon} a="end" w={600}>shrink-at-½</T>
        <T x={462} y={110} s={15} f={C.cinnamon} a="end">Φ 0 → 14, ĉ = 30</T>
      </g>
      <T x={300} y={370} s={13} f={C.taupe} a="middle" o={at(t, 3.9, 4.3)}>a resize must slide down the V</T>
    </Svg>
  );
}

// 14 · Resize hysteresis: where the vector lands after each resize, and how far that is from the next one.
export function Hysteresis({ t }: StepCtx) {
  const X = (al: number) => 60 + 460 * al;
  const line = (y0: number, name: string, col: string, shrinkAt: number, growLand: number, shrinkLand: number, t0: number, l1: string, l2: string, tcol: string, sz: number) => {
    const o = at(t, t0, t0 + 0.4);
    const d1 = at(t, t0 + 0.4, t0 + 0.9);
    const d2 = at(t, t0 + 0.9, t0 + 1.4);
    return (
      <g>
        <T x={40} y={y0 - 34} s={15} f={col} w={600} o={o}>{name}</T>
        <g opacity={o}>
          <line x1={60} y1={y0} x2={520} y2={y0} stroke={C.taupe} />
          {([[0.25, '¼'], [0.5, '½'], [1, '1']] as const).map(([al, l]) => (
            <T key={l} x={X(al)} y={y0 - 10} s={13} f={C.taupe} a="middle">{l}</T>
          ))}
          <line x1={X(shrinkAt)} y1={y0 - 6} x2={X(shrinkAt)} y2={y0 + 6} stroke={col} strokeWidth={3} />
          <line x1={X(1)} y1={y0 - 6} x2={X(1)} y2={y0 + 6} stroke={C.latte} strokeWidth={3} />
        </g>
        <g opacity={d1}>
          <circle cx={X(growLand)} cy={y0} r={5} fill={C.crema} />
          <path d={`M ${X(shrinkAt)} ${y0 + 12} L ${X(growLand)} ${y0 + 12} M ${X(growLand)} ${y0 + 12} L ${X(1)} ${y0 + 12}`} stroke={C.crema} strokeWidth={1.5} fill="none" />
          <circle cx={46} cy={y0 + 36} r={4} fill={C.crema} />
          <T x={60} y={y0 + 40} s={sz} f={tcol}>{l1}</T>
        </g>
        <g opacity={d2}>
          <circle cx={X(shrinkLand)} cy={y0} r={5} fill={col} />
          <path d={`M ${X(shrinkAt)} ${y0 + 20} L ${X(shrinkLand)} ${y0 + 20} M ${X(shrinkLand)} ${y0 + 20} L ${X(1)} ${y0 + 20}`} stroke={col} strokeWidth={1.5} fill="none" />
          <circle cx={46} cy={y0 + 58} r={4} fill={col} />
          <T x={60} y={y0 + 62} s={sz} f={tcol}>{l2}</T>
        </g>
      </g>
    );
  };
  return (
    <Svg label="Resize hysteresis on a load-factor line: under shrink-at-a-quarter a vector landing after a grow is 10 pops or 16 pushes from the next resize, after a shrink 4 pops or 10 pushes; under shrink-at-half it is 2 pops after a grow and 2 pushes after a shrink; the gap must be proportional to the capacity" h={380}>
      {line(106, 'shrink-at-¼', C.caramel, 0.25, 17 / 32, 7 / 16, 0.3, 'after grow: 10th pop or 16th push', 'after shrink: 4th pop or 10th push', C.latte, 13)}
      {line(250, 'shrink-at-½', C.cinnamon, 0.5, 17 / 32, 15 / 16, 2.0, 'after grow: 2nd pop', 'after shrink: 2nd push', C.cinnamon, 15)}
      <T x={300} y={356} s={15} f={C.crema} a="middle" w={600} o={at(t, 3.6, 4.0)}>gap ∝ capacity, both sides</T>
    </Svg>
  );
}

// 15 · The tool behind three later structures: each potential, the bound it buys, and a sketch.
const Node = ({ x, y, r = 10, label, ring = false }: { x: number; y: number; r?: number; label?: string; ring?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={C.roast} stroke={ring ? C.caramel : C.taupe} strokeWidth={ring ? 2.5 : 1.5} />
    {label !== undefined && <T x={x} y={y + 5} s={13} f={C.crema} a="middle">{label}</T>}
  </g>
);
export function Later({ t }: StepCtx) {
  const cards = [
    { y: 20, name: 'splay trees · Ch.4', phi: 'Φ = Σ log₂ (subtree size)', bound: ['access: O(log n) amortized'] },
    { y: 140, name: 'Fibonacci heaps · Ch.6', phi: 'Φ = trees + 2 · marks', bound: ['decrease-key O(1)', 'delete-min O(log n)'] },
    { y: 260, name: 'union–find · Ch.11', phi: 'Φ: ranks, summed over Ackermann levels', bound: ['rank = ⌊log₂ Sizemax⌋ → O(α(n))', 'Σ √size alone → O(log log n)'] },
  ];
  const sketch = (k: number, y: number) => {
    if (k === 0)
      return (
        <g>
          <line x1={462} y1={y + 34} x2={440} y2={y + 60} stroke={C.taupe} />
          <line x1={462} y1={y + 34} x2={490} y2={y + 60} stroke={C.taupe} />
          <line x1={440} y1={y + 60} x2={424} y2={y + 86} stroke={C.taupe} />
          <line x1={440} y1={y + 60} x2={456} y2={y + 86} stroke={C.taupe} />
          <Node x={462} y={y + 30} label="5" />
          <Node x={440} y={y + 60} label="3" />
          <Node x={490} y={y + 60} label="1" />
          <Node x={424} y={y + 90} label="1" />
          <Node x={456} y={y + 90} label="1" />
        </g>
      );
    if (k === 1)
      return (
        <g>
          <line x1={424} y1={y + 32} x2={506} y2={y + 32} stroke={C.taupe} strokeDasharray="3 3" />
          {[424, 465, 506].map((x) => (
            <g key={x}>
              <line x1={x} y1={y + 32} x2={x} y2={y + 62} stroke={C.taupe} />
              <Node x={x} y={y + 32} r={8} />
              <Node x={x} y={y + 62} r={8} ring={x === 465} />
            </g>
          ))}
          <line x1={424} y1={y + 62} x2={424} y2={y + 90} stroke={C.taupe} />
          <Node x={424} y={y + 90} r={8} />
        </g>
      );
    return (
      <g>
        {[[440, y + 34, [425, 455]], [495, y + 34, [495]]].map(([rx, ry, kids], j) => (
          <g key={j}>
            {(kids as number[]).map((kx) => (
              <g key={kx}>
                <line x1={rx as number} y1={ry as number} x2={kx} y2={y + 70} stroke={C.taupe} />
                <Node x={kx} y={y + 70} r={8} />
              </g>
            ))}
            <Node x={rx as number} y={ry as number} r={9} />
          </g>
        ))}
      </g>
    );
  };
  return (
    <Svg label="Three structures that use the same move: splay trees with the sum of log base 2 of subtree sizes, Fibonacci heaps with trees in the root list plus twice the marked nodes, union-find with a potential on node ranks, the floor of log base 2 of the largest size, summed over Ackermann levels, giving the O of alpha of n bound (Lambert and colleagues), where alpha of n is the inverse Ackermann function; the sum of square roots of sizes alone proves only O of log log n" h={380}>
      {cards.map((c, k) => {
        const o = at(t, 0.2 + 0.8 * k, 0.7 + 0.8 * k);
        return (
          <g key={c.name} opacity={o} transform={`translate(${(1 - o) * 20} 0)`}>
            <rect x={40} y={c.y} width={480} height={110} rx={14} fill={C.roast} stroke={C.mocha} />
            <T x={58} y={c.y + 28} s={15} f={C.crema} w={700}>{c.name}</T>
            <T x={58} y={c.y + 52} s={15} f={C.caramel}>{c.phi}</T>
            {c.bound.map((b, j) => (
              <T key={b} x={58} y={c.y + 76 + 22 * j} s={13} f={C.latte}>{b}</T>
            ))}
            {sketch(k, c.y)}
          </g>
        );
      })}
    </Svg>
  );
}

// 16 · Back to the problem: the opening sequence under both rules.
export function Back({ t }: StepCtx) {
  const pTop = seg(t, 0.2, 1.6);
  const pBot = seg(t, 1.8, 3.2);
  const idx = Math.min(48, Math.floor(pBot * 49));
  const g = pBot > 0 ? QUARTER49.phis[Math.max(0, idx)] : 0;
  const GB = 330, GU = 7;
  const sums = at(t, 3.6, 4.0);
  const note = at(t, 4.0, 4.4);
  return (
    <Svg label="The same 49 operations under both rules: shrink-at-half costs 328 writes with 279 copies; shrink-at-a-quarter costs 80 writes with 31 copies after the one grow; the sum of the amortized costs is 82, which is 80 plus the final Phi of 2, under the bound of 131; the single push that copied 16 keys is still one push of 17" h={396}>
      <T x={40} y={30} s={15} f={C.latte} w={600}>shrink-at-½</T>
      <T x={530} y={34} s={15} f={C.cherryText} a="end" w={700} o={at(t, 1.2, 1.6)}>328 writes</T>
      <T x={530} y={52} s={13} f={C.taupe} a="end" o={at(t, 1.2, 1.6)}>279 copies</T>
      <line x1={40} y1={150} x2={480} y2={150} stroke={C.mocha} />
      <Strip costs={HALF49.costs} x0={40} pitch={9} w={6} base={150} unit={5} p={pTop} lab={false} />
      <T x={40} y={206} s={15} f={C.caramel} w={600}>shrink-at-¼</T>
      <T x={490} y={212} s={17} f={C.crema} a="end" w={700} o={at(t, 3.0, 3.4)}>80 writes</T>
      <T x={490} y={240} s={13} f={C.taupe} a="end" o={at(t, 3.0, 3.4)}>31 copies</T>
      <line x1={40} y1={330} x2={480} y2={330} stroke={C.mocha} />
      <Strip costs={QUARTER49.costs} x0={40} pitch={9} w={6} base={330} unit={5} p={pBot} lab={false} />
      <T x={218} y={270} s={13} f={C.taupe} o={note}>still one push</T>
      <T x={218} y={294} s={13} f={C.taupe} o={note}>of 17</T>
      <T x={512} y={216} s={13} f={C.caramel} a="middle" o={at(t, 1.8, 2.2)}>Φ</T>
      <Gauge x={500} top={GB - 16 * GU - 6} bottom={GB} unit={GU} value={g} />
      <T x={40} y={368} s={15} f={C.caramel} w={600} o={sums}>Σĉ = 82 = 80 + Φ (2)</T>
      <T x={40} y={386} s={13} f={C.caramel} o={sums}>bound: 3 × 33 pushes + 2 × 16 pops = 131</T>
    </Svg>
  );
}

// 17 · Prove it 1: Phi = 2n - cap reused for g = 1.5.
export function Q1({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  const grow = at(s, 0, 0.6);
  const bars = at(s, 0.8, 1.4);
  const gv = shown ? lerp(12, 8, grow) : 12;
  return (
    <Svg label="A growth factor of 1.5 with the potential 2n minus cap reused: append 13 finds 12 keys in capacity 12, grows to 18 and copies 12, actual cost 13; the gauge drops only from 12 to 8, so the amortized cost is 9; the fix is Phi equal to 3n minus 2 cap, amortized cost at most 4" h={372}>
      <T x={40} y={30} s={15} f={C.cinnamon} w={600}>g = 1.5 · Φ = 2n − cap (reused)</T>
      {!shown && <Row x0={40} y={64} cap={12} pitch={36} w={32} labels fillOf={() => 1} o={a0} />}
      {shown && <Row x0={40} y={64} cap={12} pitch={36} w={32} labels fillOf={() => 1} o={1 - grow} />}
      {shown && <Row x0={40} y={64} cap={18} pitch={26.7} w={24} fillOf={(j) => (j <= 13 ? 1 : 0)} o={grow} fs={13} />}
      <T x={536} y={122} s={15} f={C.caramel} a="end" w={600}>Φ = {Math.round(gv)}</T>
      <Gauge x={496} top={132} bottom={252} unit={8} value={gv} />
      <T x={40} y={146} s={15} f={C.crema} o={a0}>append 13: grow to 18, copy 12, cost 13</T>
      {!shown && <T x={40} y={196} s={22} f={C.crema} serif w={700} o={a0}>ĉ = ?</T>}
      {shown && (
        <g opacity={bars}>
          <line x1={80} y1={324} x2={400} y2={324} stroke={C.mocha} />
          <rect x={100} y={324 - 78 * bars} width={50} height={78 * bars} rx={2} fill={C.cherry} />
          <T x={125} y={340} s={13} f={C.cherryText} a="middle">c = 13</T>
          <rect x={200} y={246} width={50} height={24 * bars} rx={2} fill={C.caramel} />
          <T x={225} y={340} s={13} f={C.latte} a="middle">ΔΦ = −4</T>
          <rect x={300} y={324 - 54 * bars} width={50} height={54 * bars} rx={2} fill="none" stroke={C.cherryText} strokeWidth={2} />
          <T x={325} y={340} s={17} f={C.cherryText} a="middle" w={700}>ĉ = 9</T>
        </g>
      )}
      {shown && <T x={40} y={364} s={13} f={C.caramel} o={at(s, 1.6, 2.0)}>fix: Φ = 3n − 2cap, ĉ ≤ 4</T>}
    </Svg>
  );
}

// 18 · Prove it 2: the lab's scale, on a log axis.
export function Q2({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  const LX = (v: number) => 60 + ((Math.log10(v) - 3) / 9) * 460;
  const w1 = (LX(2_097_155_000) - 60) * at(s, 0.1, 0.9);
  const w2 = (LX(4_000) - 60) * at(s, 0.5, 1.1);
  return (
    <Svg label="One thousand rounds on a vector of 1,048,576 keys: shrink-at-half costs 2,097,155,000 writes, shrink-at-a-quarter 4,000, on a log axis from one thousand to one trillion; per round, 2C plus 3 against 4" h={340}>
      <T x={40} y={30} s={15} f={C.crema} o={a0}>C = 1,048,576 · then 1,000 rounds</T>
      <T x={40} y={50} s={13} f={C.taupe} o={a0}>count writes in the rounds only</T>
      <T x={40} y={100} s={15} f={C.latte} o={a0}>shrink-at-½</T>
      <rect x={60} y={110} width={Math.max(4, w1)} height={26} rx={6} fill={C.cherry} opacity={shown ? 1 : 0.25} />
      {!shown && <T x={74} y={129} s={15} f={C.taupe}>?</T>}
      {shown && <T x={60 + w1 + 12} y={129} s={15} f={C.cherryText} w={700} o={at(s, 0.8, 1.2)}>{fmt(2_097_155_000)}</T>}
      <T x={40} y={180} s={15} f={C.caramel} o={a0}>shrink-at-¼</T>
      <rect x={60} y={190} width={Math.max(4, w2)} height={26} rx={6} fill={C.caramel} opacity={shown ? 1 : 0.25} />
      {!shown && <T x={74} y={209} s={15} f={C.taupe}>?</T>}
      {shown && <T x={60 + w2 + 12} y={209} s={15} f={C.caramel} w={700} o={at(s, 1.2, 1.6)}>{fmt(4_000)}</T>}
      {shown && (
        <g opacity={at(s, 1.4, 1.8)}>
          <line x1={60} y1={250} x2={520} y2={250} stroke={C.taupe} />
          {([[3, '1 thousand', 'start'], [6, '1 million', 'middle'], [9, '1 billion', 'middle'], [12, '1 trillion', 'end']] as const).map(([e, l, a]) => (
            <g key={e}>
              <line x1={LX(10 ** e)} y1={246} x2={LX(10 ** e)} y2={254} stroke={C.taupe} />
              <T x={LX(10 ** e)} y={272} s={13} f={C.taupe} a={a}>{l}</T>
            </g>
          ))}
          <T x={60} y={308} s={13} f={C.latte}>per round: 2C + 3 against 4</T>
        </g>
      )}
    </Svg>
  );
}

// 19 · Prove it 3: strict alternation under two rules one character apart.
export function Q3({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  const A = [17, 1, 1, 1, 1, 1, 1, 1];
  const B = [17, 17, 17, 17, 17, 17, 17, 17];
  const strip = (vals: number[], base: number, t0: number) =>
    vals.map((c, k) => {
      const h = c * 4 * at(s, t0 + 0.08 * k, t0 + 0.4 + 0.08 * k);
      return (
        <g key={k}>
          <rect x={60 + 52 * k} y={base - h} width={40} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
          {c > 1 && h > 60 && <T x={80 + 52 * k} y={base - h + 16} s={13} f={C.crema} a="middle" w={700}>{c}</T>}
        </g>
      );
    });
  return (
    <Svg label="Strict alternation from a full vector of 16 keys: shrinking when a pop leaves it less than half full costs 17 for the first push and then 1 per operation, 24 in all; shrinking when a pop leaves it at most half full resizes every operation, 17 each, 136 in all" h={340}>
      <T x={40} y={30} s={15} f={C.crema} o={a0}>full at 16, then push, pop, push, pop, …</T>
      <T x={40} y={78} s={15} f={C.latte} o={a0}>shrink if n &lt; cap/2</T>
      <line x1={40} y1={176} x2={520} y2={176} stroke={C.mocha} opacity={a0} />
      {!shown && <rect x={60} y={98} width={452} height={74} rx={8} fill="none" stroke={C.taupe} strokeDasharray="4 4" opacity={a0} />}
      {shown && strip(A, 176, 0.1)}
      {shown && <T x={520} y={96} s={15} f={C.crema} a="end" w={700} o={at(s, 0.9, 1.3)}>24</T>}
      {shown && <T x={40} y={196} s={13} f={C.taupe} o={at(s, 1.0, 1.4)}>pop leaves 16 of 32: half, not less</T>}
      <T x={40} y={226} s={15} f={C.latte} o={a0}>shrink if n ≤ cap/2</T>
      <line x1={40} y1={316} x2={520} y2={316} stroke={C.mocha} opacity={a0} />
      {!shown && <rect x={60} y={238} width={452} height={74} rx={8} fill="none" stroke={C.taupe} strokeDasharray="4 4" opacity={a0} />}
      {shown && strip(B, 316, 0.5)}
      {shown && <T x={520} y={244} s={15} f={C.cherryText} a="end" w={700} o={at(s, 1.3, 1.7)}>136</T>}
    </Svg>
  );
}
