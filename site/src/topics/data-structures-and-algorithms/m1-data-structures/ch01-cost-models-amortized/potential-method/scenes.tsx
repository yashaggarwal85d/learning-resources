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

/** Text with real subscripts: `c_{i}` draws a small lowered i (the Unicode subscript glyphs are too small on phones). */
const fx = (s: string) =>
  s.split(/_\{([^}]*)\}/).map((p, i) =>
    i % 2 ? (
      <tspan key={i} dy={5} style={{ fontSize: '0.72em' }}>
        {p}
      </tspan>
    ) : p === '' ? null : i > 0 ? (
      <tspan key={i} dy={-5}>
        {p}
      </tspan>
    ) : (
      p
    ),
  );

/** A number in a big size inside a smaller line of text (use as a child of T). */
const Big = ({ s, f, children }: { s: number; f: string; children: ReactNode }) => (
  <tspan fill={f} fontWeight={700} style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))` }}>
    {children}
  </tspan>
);

/** A straight arrow with a small head. */
const Arrow = ({ x1, y1, x2, y2, f, o = 1, w = 2 }: { x1: number; y1: number; x2: number; y2: number; f: string; o?: number; w?: number }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = (d: number) => x2 - 9 * Math.cos(a + d);
  const hy = (d: number) => y2 - 9 * Math.sin(a + d);
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={f} strokeWidth={w} />
      <polygon points={`${x2},${y2} ${hx(0.45)},${hy(0.45)} ${hx(-0.45)},${hy(-0.45)}`} fill={f} />
    </g>
  );
};

/** Phone layout of a question step: a narrow 360-unit canvas that stays short, so the drawing is not shrunk when the explanation grows under it. */
const PSvg = ({ label, h, children }: { label: string; h: number; children: ReactNode }) => (
  <svg viewBox={`0 0 360 ${h}`} className="h-full w-full" role="img" aria-label={label}>
    {children}
  </svg>
);

/** `cap` cells in rows of 16 (phone), `n` of them filled; always reserves two rows so the picture does not jump. */
const PCells = ({ y, cap, n, o = 1 }: { y: number; cap: number; n: number; o?: number }) => (
  <g opacity={o}>
    {Array.from({ length: cap }, (_, k) => (
      <rect key={k} x={12 + 21 * (k % 16)} y={y + 22 * Math.floor(k / 16)} width={18} height={18} rx={3} fill={k < n ? C.crema : 'none'} stroke={k < n ? C.crema : C.taupe} strokeWidth={1.5} />
    ))}
  </g>
);

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
    <Svg label="A vector of 64-bit keys, 16 keys in capacity 16, with a grow rule and a shrink rule, and the workload: push once, then repeat pop, pop, push, push; every cost is a question mark" h={350}>
      <T x={40} y={26} s={13} f={C.taupe}>a vector of 64-bit keys</T>
      <T x={40} y={48} s={13} f={C.taupe}>n = 16, capacity 16</T>
      <Row x0={40} y={70} cap={16} pitch={30} w={26} h={26} labels fillOf={(j) => easeOut(seg(fillP * 16, j - 1, j))} />
      <T x={40} y={134} s={15} f={C.latte} o={grow}>grow: an append to a full vector doubles it</T>
      <T x={40} y={162} s={15} f={C.cinnamon} w={600} o={sh1}>shrink-at-½: a pop that leaves it</T>
      <T x={40} y={182} s={15} f={C.cinnamon} w={600} o={sh2}>less than half full halves it</T>
      {chips.map((c, i) => {
        const o = at(t, 2.2 + 0.11 * i, 2.5 + 0.11 * i);
        const x = 40 + 60 * i;
        return (
          <g key={i}>
            <Chip x={x} y={214} label={c} o={o} />
            <T x={x + 28} y={260} s={13} f={C.taupe} a="middle" o={q}>?</T>
          </g>
        );
      })}
      <T x={516} y={280} s={15} f={C.taupe} a="end" o={q}>…</T>
      <T x={40} y={308} s={15} f={C.latte} o={q}>unit: one element write</T>
      <T x={40} y={332} s={15} f={C.latte} o={q}>a resize also copies every key</T>
    </Svg>
  );
}

// 2 · Predict: one round played on the vector itself.
/** Phone: the vector as two rows of 16 cells and four chips, with the live state in words; stays short so it is not shrunk. */
function RoundP({ t, shown, s }: { t: number; shown: boolean; s: number }) {
  const q = at(t, 0.1, 0.6);
  const P = [0.1, 0.7, 1.4, 2.0];
  let n = 17;
  let cap = 32;
  if (shown) {
    if (s >= P[0] + 0.3) n = 16;
    if (s >= P[1] + 0.3) {
      n = 15;
      cap = 16;
    }
    if (s >= P[2] + 0.3) n = 16;
    if (s >= P[3] + 0.3) {
      n = 17;
      cap = 32;
    }
  }
  const costs = [1, 16, 1, 17];
  return (
    <PSvg label="One round of pop, pop, push, push from 17 keys in capacity 32: the second pop halves the vector and copies 15 keys, the second push doubles it again and copies 16; the costs are 1, 16, 1, 17, so the round costs 35 writes" h={240}>
      <T x={12} y={20} s={15} f={C.latte}>n = {n}, capacity {cap}</T>
      <PCells y={32} cap={cap} n={n} o={q} />
      {['pop', 'pop', 'push', 'push'].map((l, k) => (
        <Chip key={l + k} x={12 + 86 * k} y={90} w={78} h={28} fs={15} label={l} o={q} hot={shown ? seg(s, P[k], P[k] + 0.1) * (1 - seg(s, P[k] + 0.55, P[k] + 0.6)) : 0} />
      ))}
      <line x1={12} y1={196} x2={348} y2={196} stroke={C.mocha} />
      {shown &&
        costs.map((c, k) => {
          const h = c * 2.8 * at(s, P[k] + 0.15, P[k] + 0.55);
          return (
            <g key={k}>
              <rect x={12 + 86 * k} y={196 - h} width={78} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
              {c > 1 && (
                <T x={12 + 86 * k + 39} y={196 - h - 5} s={15} f={C.cherryText} a="middle" w={700} o={at(s, P[k] + 0.4, P[k] + 0.6)}>
                  {c}
                </T>
              )}
            </g>
          );
        })}
      {!shown && (
        <T x={348} y={228} s={22} f={C.crema} a="end" w={700} serif o={q}>
          round = ?
        </T>
      )}
      {shown && (
        <g>
          <T x={348} y={228} s={22} f={C.crema} a="end" serif w={700} o={at(s, 2.5, 2.9)}>
            round = 35
          </T>
        </g>
      )}
    </PSvg>
  );
}
export function Round({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  if (portrait) return <RoundP t={t} shown={shown} s={s} />;
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
  const SPX = 40 + 9.8 * 34; // one spike of the rounds (cost 16, about 2C / 2)
  const SPY = 216 - 16 * 7;
  const rows = [
    ['C = 16', '8.75'],
    ['C = 1,024', '512.75'],
    ['C = 1,048,576', '524,288.75'],
  ];
  return (
    <Svg label="The 49 operations of the opening sequence under shrink-at-half: after the fill, a comb of resizing spikes 16 and 17 that never stops, far above the dashed line of 3 per operation; 328 writes against 147. The cost per operation in the rounds, (2C + 3)/4, grows with C" h={380}>
      <T x={40} y={30} s={13} f={C.latte}>16 fills · 1 push · 8 rounds = 49 operations</T>
      <T x={530} y={54} s={17} f={C.cherryText} a="end" w={700} o={tot}>328 writes</T>
      <Strip costs={HALF49.costs} x0={40} pitch={9.8} w={7} base={216} unit={7} p={p} lab={false} />
      <line x1={40} y1={216 - 21} x2={520} y2={216 - 21} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
      <line x1={40} y1={216} x2={520} y2={216} stroke={C.mocha} />
      <T x={40} y={236} s={13} f={C.caramel} o={at(t, 0.4, 0.8)}>dashed: 3 per op, 3 × 49 = 147 in all</T>
      <T x={SPX + 4} y={SPY - 6} s={13} f={C.cherryText} a="middle" o={tot}>≈ 2C</T>
      <line x1={SPX + 4} y1={222} x2={SPX + 4} y2={254} stroke={C.taupe} strokeDasharray="2 4" opacity={at(t, 2.8, 3.1)} />
      <T x={40} y={270} s={13} f={C.latte} o={at(t, 2.8, 3.1)}>writes per operation in the rounds, (2C + 3)/4</T>
      {rows.map(([c, v], k) => {
        const o = at(t, 3.0 + 0.4 * k, 3.4 + 0.4 * k);
        return (
          <g key={c} opacity={o}>
            <T x={40} y={302 + 30 * k} s={15} f={C.crema}>{c}</T>
            <T x={520} y={302 + 30 * k} s={17} f={C.cherryText} a="end" w={700}>{v}</T>
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
  const flash = seg(t, 1.8, 2.0) * (1 - seg(t, 2.1, 2.5));
  const drain = easeInOut(seg(t, 2.4, 3.0));
  const bits0 = [0, 0, 1, 1, 1];
  const bits1 = [0, 1, 0, 0, 0];
  const changed = [false, true, true, true, true];
  const gaugeV = lerp(lerp(0, 3, fillG), 1, drain);
  const barC = at(t, 2.4, 3.0);
  const bar2 = at(t, 3.0, 3.4);
  const bar3 = at(t, 3.4, 3.8);
  const BX = (k: number) => 100 + 58 * k;
  return (
    <Svg label="The counter's three coins pour into one gauge, Phi equals 3; incrementing 00111 (seven) to 01000 costs 4 flips, lowers Phi from 3 to 1, so the amortized cost is 2" h={384}>
      <T x={40} y={32} s={20} f={C.crema}>{fx('ĉ_{i} = c_{i} + Φ(D_{i}) − Φ(D_{i−1})')}</T>
      <T x={40} y={56} s={13} f={C.latte}>{fx('D_{i} is the state after operation i')}</T>
      <g opacity={0.5 * incr}>
        {bits0.map((b0, k) => (
          <g key={k}>
            <rect x={BX(k)} y={72} width={52} height={40} rx={8} fill={C.roast} stroke={C.mocha} />
            <T x={BX(k) + 26} y={99} s={20} f={b0 ? C.crema : C.taupe} a="middle" w={700}>{b0}</T>
          </g>
        ))}
        <T x={BX(0) - 14} y={99} s={15} f={C.latte} a="end">7</T>
      </g>
      <Arrow x1={BX(0) + 26} y1={116} x2={BX(0) + 26} y2={134} f={C.taupe} o={incr} w={1.5} />
      <T x={BX(0) + 38} y={130} s={13} f={C.latte} o={incr}>add 1</T>
      {bits0.map((b0, k) => {
        const flip = changed[k] && incr > 0.5;
        const v = flip ? bits1[k] : b0;
        const ring = changed[k] && incr > 0.5;
        return (
          <g key={k}>
            <rect x={BX(k)} y={138} width={52} height={44} rx={8} fill={C.roast} stroke={ring ? C.cherry : C.mocha} strokeWidth={ring ? 2.5 + 1.5 * flash : 1} />
            <T x={BX(k) + 26} y={168} s={22} f={v ? C.crema : C.taupe} a="middle" w={700}>{v}</T>
          </g>
        );
      })}
      <T x={BX(0) - 14} y={166} s={15} f={C.latte} a="end" o={incr}>8</T>
      {[2, 3, 4].map((k, j) => {
        const e = easeInOut(seg(t, 0.4 + 0.1 * j, 1.2 + 0.1 * j));
        return <Coin key={k} x={lerp(BX(k) + 26, 500, e)} y={lerp(160, 232 - 12 * j, e)} o={1 - seg(t, 1.3, 1.6)} />;
      })}
      <Coin x={BX(1) + 43} y={150} r={6} o={at(t, 2.8, 3.2)} />
      <T x={536} y={70} s={15} f={C.caramel} a="end" w={600}>{t < 0.9 ? 'Φ = ?' : `Φ = ${Math.round(gaugeV)}`}</T>
      <Gauge x={488} top={80} bottom={240} unit={40} value={gaugeV} />
      <g opacity={0.7 * drain}>
        <line x1={478} y1={120} x2={520} y2={120} stroke={C.taupe} strokeWidth={1.5} strokeDasharray="3 3" />
        <T x={474} y={125} s={13} f={C.latte} a="end">was 3</T>
      </g>
      <line x1={100} y1={322} x2={500} y2={322} stroke={C.mocha} />
      <rect x={100} y={322 - 40 * barC} width={36} height={40 * barC} rx={2} fill={C.cherry} />
      <T x={118} y={342} s={13} f={C.cherryText} a="middle" o={barC}>c = 4</T>
      <rect x={160} y={282} width={36} height={20 * bar2} rx={2} fill={C.caramel} />
      <T x={206} y={298} s={13} f={C.latte} o={bar2}>ΔΦ = 1 − 3 = −2</T>
      <rect x={400} y={322 - 20 * bar3} width={36} height={20 * bar3} rx={2} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={446} y={316} s={17} f={C.caramel} w={700} o={bar3}>ĉ = 2</T>
      <T x={40} y={372} s={13} f={C.taupe} o={at(t, 3.8, 4.2)}>one coin left, on the new 1 bit</T>
    </Svg>
  );
}

// 5 · The middle terms cancel.
export function Telescope({ t }: StepCtx) {
  const eq = [
    { y: 50, cc: 'ĉ_{1}', c: 'c_{1}', a: '+ Φ_{1}', b: '− Φ_{0}' },
    { y: 80, cc: 'ĉ_{2}', c: 'c_{2}', a: '+ Φ_{2}', b: '− Φ_{1}' },
    { y: 110, cc: 'ĉ_{3}', c: 'c_{3}', a: '+ Φ_{3}', b: '− Φ_{2}' },
    { y: 165, cc: 'ĉ_{16}', c: 'c_{16}', a: '+ Φ_{16}', b: '− Φ_{15}' },
  ];
  const col = { cc: 40, eq: 112, c: 140, a: 220, b: 320 };
  const rows = eq.map((e, k) => at(t, 0.2 + 0.2 * k, 0.5 + 0.2 * k));
  const strike = (k: number) => at(t, 0.9 + 0.5 * k, 1.3 + 0.5 * k);
  const fade = (k: number) => 1 - 0.7 * strike(k);
  const sum = at(t, 2.2, 2.6);
  return (
    <Svg label="Adding the amortized costs, every Phi in the middle cancels: the sum of c-hat equals the sum of c plus Phi sixteen minus Phi zero; for the counter 32 equals 31 plus 1 minus 0" h={350}>
      {eq.map((e, k) => (
        <g key={k} opacity={rows[k]}>
          <T x={col.cc} y={e.y} s={15} f={C.crema}>{fx(e.cc)}</T>
          <T x={col.eq} y={e.y} s={15} f={C.crema}>=</T>
          <T x={col.c} y={e.y} s={15} f={C.crema}>{fx(e.c)}</T>
          <T x={col.a} y={e.y} s={15} f={C.crema} o={k < 2 ? fade(k) : 1}>{fx(e.a)}</T>
          <T x={col.b} y={e.y} s={15} f={C.crema} o={k >= 1 && k <= 2 ? fade(k - 1) : 1}>{fx(e.b)}</T>
        </g>
      ))}
      <T x={col.cc} y={140} s={15} f={C.taupe}>⋮</T>
      {[0, 1].map((k) => {
        // each cancelling pair is struck out where it stands: the + term on row k and the matching − term on row k + 1
        const p = strike(k);
        return (
          <g key={k} opacity={rows[k + 1]}>
            <line x1={col.a - 3} y1={eq[k].y - 5} x2={lerp(col.a - 3, col.a + 44, p)} y2={eq[k].y - 5} stroke={C.caramel} strokeWidth={2.5} />
            <line x1={col.b - 3} y1={eq[k + 1].y - 5} x2={lerp(col.b - 3, col.b + 44, p)} y2={eq[k + 1].y - 5} stroke={C.caramel} strokeWidth={2.5} />
          </g>
        );
      })}
      <line x1={40} y1={190} x2={420} y2={190} stroke={C.mocha} />
      <T x={40} y={218} s={17} f={C.crema} w={600} o={sum}>{fx('Σĉ = Σc + Φ_{16} − Φ_{0}')}</T>
      <T x={40} y={246} s={15} f={C.latte} o={sum}>32 = 31 + 1 − 0</T>
      <T x={40} y={268} s={13} f={C.taupe} o={sum}>16 increments: charged 32, flipped 31, 1 bit left</T>
      <T x={40} y={304} s={15} f={C.caramel} o={at(t, 2.8, 3.2)}>{fx('Φ_{0} = 0 and Φ ≥ 0')}</T>
      <T x={40} y={330} s={15} f={C.caramel} o={at(t, 3.0, 3.4)}>⇒ Σc ≤ Σĉ after every operation</T>
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
  const BASE = 250, K = 24;
  const peak = at(t, 2.0, 2.3); // the stack's highest point, kept on screen after the multipops drain it
  const size = stackSize(t);
  const whole = Math.floor(size + 1e-6);
  const frac = size - whole;
  const tally = at(t, 4.4, 4.8);
  return (
    <Svg label="The multipop stack with Phi equal to the number of keys: pushes cost 1 and have amortized cost 2, a multipop of k keys costs k and has amortized cost 0; ten operations cost 16 in all, equal to the amortized total" h={340}>
      <path d={`M 56 ${BASE - 150} L 56 ${BASE + 2} L 164 ${BASE + 2} L 164 ${BASE - 150}`} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      {Array.from({ length: 7 }, (_, l) => {
        const f = l < whole ? 1 : l === whole ? frac : 0;
        return f > 0.02 ? <rect key={l} x={60} y={BASE - K * (l + 1)} width={100} height={K - 2} rx={3} fill={C.crema} opacity={f} /> : null;
      })}
      <rect x={60} y={BASE - 6 * K} width={100} height={6 * K - 2} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.7 * peak} />
      <Gauge x={180} top={BASE - 150} bottom={BASE} unit={K} value={size} />
      <line x1={174} y1={BASE - 6 * K} x2={210} y2={BASE - 6 * K} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="3 3" opacity={0.8 * peak} />
      <T x={216} y={BASE - 6 * K + 5} s={13} f={C.caramel} o={peak}>peak Φ = 6</T>
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
      <T x={40} y={298} s={15} f={C.crema} w={600} o={tally}>Σc = 16 = Σĉ</T>
      <T x={40} y={324} s={15} f={C.caramel} o={tally}>push 2 · pop and multipop 0</T>
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
export function WhichPhi({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  const cands = [
    { title: 'Φ = n', vals: PHI16.map((_, k) => k + 1), hat: 'ĉ_{9} = 10' },
    { title: 'Φ = cap − n', vals: CAPS16.map((c, k) => c - (k + 1)), hat: 'ĉ_{9} = 16' },
    { title: 'Φ = 2n − cap', vals: PHI16, hat: 'ĉ_{9} = 3' },
    { title: 'Φ = cap', vals: CAPS16, hat: 'ĉ_{9} = 17' },
  ];
  if (portrait) {
    // Phone: the cost strip on top, then the four candidates one per row at 15 units, so the answer stays readable.
    return (
      <PSvg label="Sixteen appends to the doubling vector and four candidate potentials: with Phi equal to n the ninth append has amortized cost 10, with the empty slots 16, with 2n minus cap 3, with cap 17; only 2n minus cap drops on the expensive append" h={240}>
        <T x={12} y={16} s={13} f={C.taupe} o={a0}>16 appends, doubling from empty</T>
        <line x1={12} y1={86} x2={348} y2={86} stroke={C.mocha} />
        {COSTS16.map((c, k) => {
          const h = c * 5 * easeOut(seg(t, 0.2 + 0.04 * k, 0.6 + 0.04 * k));
          return (
            <g key={k}>
              <rect x={12 + 21 * k} y={86 - h} width={17} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />
              {c === 9 && <T x={12 + 21 * k + 8} y={86 - h - 5} s={13} f={C.cherryText} a="middle" w={700} o={a0}>9</T>}
            </g>
          );
        })}
        <T x={204} y={44} s={13} f={C.cherryText} o={at(t, 1.2, 1.6)}>append 9:</T>
        <T x={204} y={66} s={13} f={C.cherryText} o={at(t, 1.2, 1.6)}>copies 8, costs 9</T>
        {cands.map((c, k) => {
          const y = 98 + 35 * k;
          const right = k === 2;
          const f = shown ? at(s, 0.1 + 0.3 * k, 0.5 + 0.3 * k) : 0;
          const hl = right && shown ? at(s, 1.4, 1.7) : 0;
          return (
            <g key={k}>
              <rect x={12} y={y} width={336} height={30} rx={8} fill="none" stroke={C.taupe} strokeWidth={1} />
              {hl > 0 && <rect x={12} y={y} width={336} height={30} rx={8} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={hl} />}
              {!shown && <T x={180} y={y + 21} s={15} f={C.taupe} a="middle" w={700} o={a0}>?</T>}
              {shown && (
                <g opacity={f}>
                  <T x={22} y={y + 21} s={15} f={right ? C.caramel : C.crema} w={right ? 700 : 500}>{c.title}</T>
                  <T x={338} y={y + 21} s={15} f={right ? C.caramel : C.cherryText} a="end" w={700}>{fx(c.hat)}</T>
                </g>
              )}
            </g>
          );
        })}
      </PSvg>
    );
  }
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
                <T x={px + 222} y={py + 40} s={right ? 17 : 15} f={right ? C.caramel : C.cherryText} a="end" w={700}>{fx(c.hat)}</T>
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
      <T x={536} y={48} s={15} f={C.caramel} a="end" w={600} o={at(t, 4.2, 4.6)}>{fx('Σĉ = 47 = 31 + Φ_{16}')}</T>
      {cur && <Row x0={40} y={64} cap={Math.max(cap, 1)} pitch={30} w={26} labels fillOf={(j) => (j <= n ? 1 : 0)} />}
      {cur && cur.c > 1 && cur.i > 1 && (
        <rect x={40} y={94} width={30 * (cur.i - 1) - 4} height={4} rx={2} fill={C.caramel} opacity={seg(p, 0, 0.2) * (1 - seg(p, 0.6, 0.9))} />
      )}
      <T x={40} y={126} s={15} f={C.caramel} w={600}>gauge: Φ = 2n − cap</T>
      <T x={40} y={146} s={13} f={C.taupe}>n = {n}, capacity {cap}</T>
      <T x={536} y={GB + 22} s={15} f={C.caramel} a="end" w={600}>Φ = {Math.round(val)}</T>
      <line x1={40} y1={360} x2={470} y2={360} stroke={C.mocha} />
      <Gauge x={500} top={GB - 16 * GU - 4} bottom={GB} unit={GU} value={val} />
      {[8, 16].map((v) => (
        <g key={v} opacity={0.9}>
          <line x1={494} y1={GB - v * GU} x2={530} y2={GB - v * GU} stroke={C.taupe} strokeWidth={1.2} />
          <T x={490} y={GB - v * GU + 4} s={13} f={C.taupe} a="end">{v}</T>
        </g>
      ))}
      {EV8.map((e) => {
        const g = at(t, e.start + e.dur * 0.4, e.start + e.dur);
        const h = e.c * 9 * g;
        const hh = (e.i === 1 ? 2 : 3) * 9 * g;
        return (
          <g key={e.i}>
            <rect x={colX(e.i)} y={360 - h} width={22} height={h} rx={2} fill={e.c > 1 ? C.cherry : C.crema} />
            {e.c > 3 && g > 0.8 && <T x={colX(e.i) + 11} y={360 - h - 5} s={13} f={C.cherryText} a="middle" w={700}>{e.c}</T>}
            <rect x={colX(e.i) - 2} y={360 - hh} width={26} height={hh} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={g > 0.6 ? 1 : 0} />
          </g>
        );
      })}
      <line x1={40} y1={328} x2={470} y2={328} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
      <T x={470} y={318} s={13} f={C.caramel} a="end">ĉ = 3</T>
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
      <T x={40} y={126} s={13} f={C.taupe} o={pin}>snapshot at pop 2:</T>
      <T x={40} y={150} s={15} f={C.crema} w={600} o={pin}>Φ = −2 (tick on the gauge)</T>
      <T x={40} y={176} s={15} f={C.cherryText} w={600} o={pin}>Σĉ = 48 &lt; Σc = 50</T>
      <T x={40} y={204} s={13} f={C.taupe} o={pin}>each pop below half: ĉ = −1</T>
      <T x={40} y={258} s={17} f={C.crema} w={600} o={end}>9 pops later:</T>
      <T x={40} y={296} s={20} f={C.cherryText} w={700} o={end}>Φ = −16</T>
      <g opacity={pin}>
        <line x1={494} y1={Z + 2 * U} x2={530} y2={Z + 2 * U} stroke={C.latte} strokeWidth={2} />
      </g>
      <Gauge x={500} top={130} bottom={320} zero={Z} unit={U} value={val} neg />
      <T x={492} y={Z + 4} s={13} f={C.taupe} a="end">0</T>
      <T x={492} y={Math.min(Z - val * U + (val < 0 ? 18 : -6), 316)} s={13} f={val < 0 ? C.cherryText : C.caramel} a="end" w={500} o={val < 0 ? 1 : 0}>
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
      <T x={40} y={26} s={15} f={C.latte}>Φ = 2n − cap if n/cap ≥ ½</T>
      <T x={40} y={52} s={15} f={C.crema} w={700}>Φ = cap/2 − n if n/cap &lt; ½</T>
      <T x={360} y={52} s={13} f={C.caramel} w={700}>← new</T>
      <T x={40} y={78} s={13} f={C.latte}>n/cap is the load factor</T>
      <line x1={60} y1={330} x2={520} y2={330} stroke={C.taupe} />
      {([[8, '¼', 'n = 8'], [16, '½', '16 · Φ = 0'], [32, '1', '32']] as const).map(([n, a, l]) => (
        <g key={n}>
          <line x1={VX(n)} y1={330} x2={VX(n)} y2={336} stroke={C.taupe} />
          <T x={VX(n)} y={352} s={13} f={C.taupe} a="middle">{a}</T>
          <T x={VX(n)} y={370} s={13} f={C.latte} a="middle">{l}</T>
        </g>
      ))}
      <path d={`M ${VX(0)} ${Y(16)} L ${lerp(VX(0), VX(16), left)} ${lerp(Y(16), Y(0), left)}`} fill="none" stroke={C.crema} strokeWidth={3.5} />
      <circle cx={VX(0)} cy={Y(16)} r={5} fill={C.crema} opacity={at(t, 0.3, 0.6)} />
      <T x={VX(0) + 8} y={Y(16) - 10} s={13} f={C.latte} o={at(t, 0.4, 0.8)}>Φ = 16</T>
      <path d={`M ${VX(16)} ${Y(0)} L ${lerp(VX(16), VX(32), right)} ${lerp(Y(0), Y(32), right)}`} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g opacity={lab}>
        <T x={440} y={112} s={15} f={C.crema} a="end" w={600}>full: Φ = 32</T>
        <T x={440} y={134} s={13} f={C.taupe} a="end">pays the grow’s 32 copies</T>
        <line x1={VX(8)} y1={206} x2={VX(8)} y2={Y(8) - 8} stroke={C.taupe} strokeDasharray="2 4" />
        <circle cx={VX(8)} cy={Y(8)} r={5} fill={C.caramel} />
        <T x={140} y={168} s={15} f={C.crema} w={600}>a quarter: Φ = 8</T>
        <T x={140} y={190} s={13} f={C.taupe}>pays the shrink’s 7 copies</T>
      </g>
    </Svg>
  );
}

// 11 · Predict: price the shrinking pop from the gauge.
export function ShrinkPop({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  if (portrait) {
    // Phone: before and after as two lines, the arithmetic, and the answer, all at 15 units or more.
    const r1 = at(s, 0.2, 0.7);
    const r2 = at(s, 0.8, 1.3);
    return (
      <PSvg label="Pricing the pop that shrinks: eight keys in capacity 32 is a quarter full with Phi 8; the pop leaves 7 keys, the vector halves to 16 and copies 7, actual cost 8; Phi falls to 1, so the amortized cost is 8 plus 1 minus 8, which is 1" h={236}>
        <T x={12} y={22} s={15} f={C.crema} o={a0}>pop: 8 → 7 keys, under a quarter</T>
        <T x={12} y={42} s={13} f={C.latte} o={a0}>halve to 16 and copy 7: cost 8</T>
        <line x1={12} y1={56} x2={348} y2={56} stroke={C.mocha} />
        <T x={12} y={82} s={15} f={C.crema} o={a0}>before: n = 8, cap 32</T>
        <T x={348} y={82} s={15} f={C.caramel} a="end" w={700} o={a0}>Φ = 8</T>
        <T x={12} y={110} s={15} f={C.crema} o={a0}>after: n = 7, cap 16</T>
        <T x={348} y={110} s={15} f={C.caramel} a="end" w={700} o={shown ? r1 : a0}>{shown ? 'Φ = 1' : 'Φ = ?'}</T>
        <T x={12} y={138} s={13} f={C.taupe} o={a0}>Φ = cap/2 − n below half</T>
        {!shown && (
          <T x={12} y={170} s={15} f={C.cherryText} o={a0}>c = 8</T>
        )}
        {shown && (
          <g opacity={r2}>
            <T x={12} y={172} s={15} f={C.cherryText}>c = 8</T>
            <T x={112} y={172} s={15} f={C.latte}>ΔΦ = 1 − 8 = −7</T>
            <T x={12} y={198} s={17} f={C.caramel} w={700}>ĉ = 8 + 1 − 8</T>
          </g>
        )}
        <T x={348} y={226} s={24} f={C.crema} a="end" serif w={700}>{shown ? 'ĉ = 1' : 'ĉ = ?'}</T>
      </PSvg>
    );
  }
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
      {shown && <circle cx={X(8)} cy={Y(8)} r={5} fill={C.caramel} opacity={0.45 * half} />}
      <circle cx={X(dotN)} cy={dotY} r={6} fill={C.caramel} />
      <T x={X(8) - 4} y={Y(8) - 16} s={15} f={C.caramel} w={600} o={a0}>Φ = 8</T>
      {shown && <Arrow x1={X(8)} y1={Y(8) + 8} x2={X(7)} y2={Y(1) - 8} f={C.caramel} o={slide} w={1.5} />}
      {shown && (
        <T x={X(7)} y={318} s={15} f={C.caramel} w={600} a="middle" o={slide}>
          Φ = 1
        </T>
      )}
      <T x={190} y={76} s={13} f={C.latte} o={a0}>Φ = cap/2 − n below half</T>
      <T x={190} y={94} s={13} f={C.latte} o={a0}>Φ = 2n − cap at or above</T>
      <T x={190} y={112} s={13} f={C.taupe} o={a0}>after: n = 7, cap = 16</T>
      {shown && (
        <g opacity={bars}>
          <line x1={70} y1={150} x2={290} y2={150} stroke={C.mocha} />
          <rect x={70} y={150 - 64 * bars} width={36} height={64 * bars} rx={2} fill={C.cherry} />
          <T x={88} y={168} s={13} f={C.cherryText} a="middle">c = 8</T>
          <rect x={140} y={150 - 56 * bars} width={36} height={56 * bars} rx={2} fill={C.caramel} />
          <T x={158} y={168} s={13} f={C.latte} a="middle">ΔΦ = −7</T>
          <rect x={210} y={150 - 8 * bars} width={36} height={8 * bars} rx={2} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={228} y={168} s={15} f={C.caramel} a="middle" w={700}>ĉ = 1</T>
          <T x={70} y={192} s={15} f={C.caramel}>8 + 1 − 8 = 1</T>
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
    ['push, n/cap ≥ ½', '1', '+2', '3'],
    ['push that grows', 'n + 1', '2 − n', '3'],
    ['push, n/cap < ½', '1', '−1', '0'],
    ['pop, stays ≥ ½', '1', '−2', '−1'],
    ['pop, ends below ½', '1', '+1', '2'],
    ['pop that shrinks', 'cap/4', '1 − cap/4', '1'],
  ];
  const top = [true, true, false, false, true, false]; // the largest amortized cost of pushes (3) and of pops (2)
  return (
    <Svg label="The six cases of the proof for a table that grows and shrinks at a quarter: a push costs at most 3 amortized, a pop at most 2; any m operations from empty cost at most 3 times m" h={380}>
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
            {top[k] && <rect x={478} y={y - 20} width={32} height={28} rx={8} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
            <T x={492} y={y} s={top[k] ? 20 : 15} f={top[k] ? C.caramel : C.latte} w={top[k] ? 700 : 500}>{d}</T>
          </g>
        );
      })}
      <T x={40} y={326} s={15} f={C.latte} o={at(t, 3.1, 3.5)}>any m operations from empty:</T>
      <T x={40} y={356} s={17} f={C.crema} w={700} o={at(t, 3.3, 3.7)}>Σc ≤ 3·pushes + 2·pops ≤ 3m</T>
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
      {/* the final frame keeps both moves: caramel slides down the V (8 to 1), cinnamon jumps up it (0 to 14) */}
      <g opacity={at(t, 3.9, 4.3)}>
        <circle cx={AX(0.25)} cy={AY(0.25)} r={5} fill={C.caramel} />
        <Arrow x1={AX(0.25) + 5} y1={AY(0.25) + 9} x2={AX(7 / 16) - 3} y2={AY(1 / 16) - 8} f={C.caramel} w={2.5} />
        <circle cx={AX(0.5)} cy={AY(0)} r={6} fill={C.espresso} stroke={C.cinnamon} strokeWidth={2.5} />
        <Arrow x1={AX(0.5) + 8} y1={AY(0) - 4} x2={AX(15 / 16) - 12} y2={AY(14 / 16) + 8} f={C.cinnamon} w={2.5} />
      </g>
      <T x={300} y={370} s={15} f={C.crema} a="middle" o={at(t, 3.9, 4.3)}>a resize must slide down the V</T>
    </Svg>
  );
}

// 14 · Resize hysteresis: where the vector lands after each resize, and how many operations pass before the next one.
export function Hysteresis({ t }: StepCtx) {
  const X = (al: number) => 60 + 460 * al;
  /** One bracket from a landing dot to its nearest threshold, with the count of operations on it. */
  const bracket = (y: number, from: number, to: number, col: string, numCol: string, n: number, unit: string, ring: boolean, o: number) => {
    const a = X(from);
    const b = X(to);
    const mid = (a + b) / 2;
    return (
      <g opacity={o}>
        {ring ? <circle cx={a} cy={y - 16} r={5} fill="none" stroke={col} strokeWidth={2} /> : <circle cx={a} cy={y - 16} r={5} fill={col} />}
        <path d={`M ${a} ${y - 8} L ${a} ${y} L ${b} ${y} L ${b} ${y - 8}`} fill="none" stroke={col} strokeWidth={2} />
        <T x={mid > 440 ? 520 : mid} y={y + 30} s={13} f={col} a={mid > 440 ? 'end' : 'middle'}>
          <Big s={20} f={numCol}>{n}</Big> {unit}
        </T>
      </g>
    );
  };
  const panel = (y0: number, name: string, sub: string, col: string, numCol: string, shrinkAt: number, gA: [number, number, string, number], gB: [number, number, string, number], t0: number) => {
    const o = at(t, t0, t0 + 0.4);
    const d1 = at(t, t0 + 0.4, t0 + 0.9);
    const d2 = at(t, t0 + 0.9, t0 + 1.4);
    return (
      <g>
        <T x={40} y={y0 - 56} s={15} f={col} w={600} o={o}>{name}</T>
        <T x={40} y={y0 - 38} s={13} f={C.latte} o={o}>{sub}</T>
        <g opacity={o}>
          <line x1={60} y1={y0} x2={520} y2={y0} stroke={C.taupe} />
          {([[0.25, '¼'], [0.5, '½'], [1, '1']] as const).map(([al, l]) => (
            <T key={l} x={X(al)} y={y0 - 10} s={13} f={C.taupe} a="middle">{l}</T>
          ))}
          <line x1={X(shrinkAt)} y1={y0 - 6} x2={X(shrinkAt)} y2={y0 + 6} stroke={col} strokeWidth={3} />
          <line x1={X(1)} y1={y0 - 6} x2={X(1)} y2={y0 + 6} stroke={C.latte} strokeWidth={3} />
        </g>
        {bracket(y0 + 22, gA[0], gA[3], C.latte, numCol, gA[1], gA[2], false, d1)}
        {bracket(y0 + 90, gB[0], gB[3], col, numCol, gB[1], gB[2], true, d2)}
      </g>
    );
  };
  return (
    <Svg label="Resize hysteresis on a load-factor line, counting the operations until the next resize: under shrink-at-a-quarter a vector landing after a grow (17 keys in 32) is 10 pops from the next shrink, after a shrink (7 in 16) it is 4 pops; under shrink-at-half it is 2 pops after a grow and 2 pushes after a shrink; the gap must be proportional to the capacity" h={496}>
      <T x={40} y={26} s={15} f={C.crema} w={600}>operations until the next resize</T>
      <circle cx={46} cy={44} r={4} fill={C.crema} />
      <T x={58} y={48} s={13} f={C.latte}>after a grow</T>
      <circle cx={190} cy={44} r={4} fill="none" stroke={C.latte} strokeWidth={2} />
      <T x={202} y={48} s={13} f={C.latte}>after a shrink</T>
      {panel(130, 'shrink-at-¼', 'grow lands at 17 of 32, shrink at 7 of 16', C.caramel, C.crema, 0.25, [17 / 32, 10, 'pops', 0.25], [7 / 16, 4, 'pops', 0.25], 0.3)}
      {panel(332, 'shrink-at-½', 'grow lands at 17 of 32, shrink at 15 of 16', C.cinnamon, C.cinnamon, 0.5, [17 / 32, 2, 'pops', 0.5], [15 / 16, 2, 'pushes', 1], 2.0)}
      <T x={300} y={484} s={15} f={C.crema} a="middle" w={600} o={at(t, 3.6, 4.0)}>gap ∝ capacity, both sides</T>
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
    { y: 20, name: 'splay trees', ch: 'Ch.4', phi: 'Φ = Σ log_{2} (subtree size)' },
    { y: 130, name: 'Fibonacci heaps', ch: 'Ch.6', phi: 'Φ = trees + 2 · marks' },
    { y: 240, name: 'union–find', ch: 'Ch.11', phi: 'Φ: ranks, summed over levels' },
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
            <Node x={rx as number} y={ry as number} r={11} label={String(j === 0 ? 2 : 1)} />
          </g>
        ))}
      </g>
    );
  };
  return (
    <Svg label="Three structures that use the same move: splay trees with the sum of log base 2 of subtree sizes, Fibonacci heaps with trees in the root list plus twice the marked nodes, union-find with a potential on node ranks, the floor of log base 2 of the largest size, summed over Ackermann levels, giving the O of alpha of n bound (Lambert and colleagues), where alpha of n is the inverse Ackermann function; the sum of square roots of sizes alone proves only O of log log n" h={350}>
      {cards.map((c, k) => {
        const o = at(t, 0.2 + 0.8 * k, 0.7 + 0.8 * k);
        return (
          <g key={c.name} opacity={o} transform={`translate(${(1 - o) * 20} 0)`}>
            <rect x={40} y={c.y} width={480} height={100} rx={14} fill={C.roast} stroke={C.mocha} />
            <T x={58} y={c.y + 36} s={15} f={C.crema} w={700}>
              {c.name}
              <tspan fill={C.latte} fontWeight={500}> · {c.ch}</tspan>
            </T>
            <T x={58} y={c.y + 66} s={15} f={C.caramel}>{fx(c.phi)}</T>
            {sketch(k, c.y - 6)}
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
      <line x1={40} y1={135} x2={480} y2={135} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" opacity={at(t, 1.2, 1.6)} />
      <T x={40} y={176} s={13} f={C.caramel} o={at(t, 1.2, 1.6)}>dashed line: 3 per op</T>
      <T x={40} y={206} s={15} f={C.caramel} w={600}>shrink-at-¼</T>
      <T x={460} y={214} s={20} f={C.crema} a="end" w={700} o={at(t, 3.0, 3.4)}>80 writes</T>
      <T x={490} y={240} s={13} f={C.taupe} a="end" o={at(t, 3.0, 3.4)}>31 copies</T>
      <line x1={40} y1={330} x2={480} y2={330} stroke={C.mocha} />
      <Strip costs={QUARTER49.costs} x0={40} pitch={9} w={6} base={330} unit={5} p={pBot} lab={false} />
      <line x1={40} y1={315} x2={480} y2={315} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" opacity={at(t, 1.8, 2.2)} />
      <T x={218} y={270} s={13} f={C.taupe} o={note}>still one push</T>
      <T x={218} y={294} s={13} f={C.taupe} o={note}>of 17</T>
      <T x={512} y={200} s={13} f={C.caramel} a="middle" w={600} o={at(t, 1.8, 2.2)}>Φ = {g}</T>
      <Gauge x={500} top={GB - 16 * GU - 6} bottom={GB} unit={GU} value={g} />
      <T x={40} y={368} s={15} f={C.caramel} w={600} o={sums}>Σĉ = 82 = 80 + Φ (2)</T>
      <T x={40} y={386} s={13} f={C.caramel} o={sums}>bound: 3 × 33 pushes + 2 × 16 pops = 131</T>
    </Svg>
  );
}

// 17 · Prove it 1: Phi = 2n - cap reused for g = 1.5.
export function Q1({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  const grow = at(s, 0, 0.6);
  const bars = at(s, 0.8, 1.4);
  const gv = shown ? lerp(12, 8, grow) : 12;
  if (portrait) {
    // Phone: the vector, the one line of the problem, and the gauge as numbers; no gauge drawing to squeeze.
    const r = at(s, 0.6, 1.2);
    return (
      <PSvg label="A growth factor of 1.5 with the potential 2n minus cap reused: append 13 finds 12 keys in capacity 12, grows to 18 and copies 12, actual cost 13; the gauge drops only from 12 to 8, so the amortized cost is 9; the fix is Phi equal to 3n minus 2 cap, amortized cost at most 4" h={236}>
        <T x={12} y={20} s={15} f={C.cinnamon} w={600}>g = 1.5 · Φ = 2n − cap (reused)</T>
        {!shown && <Row x0={12} y={34} cap={12} pitch={28} w={24} h={24} labels fillOf={() => 1} o={a0} />}
        {shown && <Row x0={12} y={34} cap={12} pitch={28} w={24} h={24} labels fillOf={() => 1} o={1 - grow} />}
        {shown && <Row x0={12} y={34} cap={18} pitch={18.6} w={16} h={24} fillOf={(j) => (j <= 13 ? 1 : 0)} o={grow} />}
        <T x={12} y={92} s={15} f={C.crema} o={a0}>append 13: grow to 18, copy 12</T>
        <T x={12} y={120} s={15} f={C.latte} o={a0}>Φ before = 24 − 12 = 12</T>
        {!shown && <T x={12} y={170} s={22} f={C.crema} serif w={700} o={a0}>ĉ = ?</T>}
        {shown && (
          <g opacity={r}>
            <T x={12} y={146} s={15} f={C.latte}>Φ after = 26 − 18 = 8</T>
            <T x={12} y={174} s={17} f={C.cherryText} w={700}>ĉ = 13 + 8 − 12 = 9</T>
            <T x={12} y={202} s={13} f={C.latte}>the gauge drops only 4</T>
          </g>
        )}
        {shown && (
          <T x={12} y={226} s={15} f={C.caramel} o={at(s, 1.6, 2.0)}>
            fix: Φ = 3n − 2cap, ĉ ≤ 4
          </T>
        )}
      </PSvg>
    );
  }
  return (
    <Svg label="A growth factor of 1.5 with the potential 2n minus cap reused: append 13 finds 12 keys in capacity 12, grows to 18 and copies 12, actual cost 13; the gauge drops only from 12 to 8, so the amortized cost is 9; the fix is Phi equal to 3n minus 2 cap, amortized cost at most 4" h={372}>
      <T x={40} y={30} s={15} f={C.cinnamon} w={600}>g = 1.5 · Φ = 2n − cap (reused)</T>
      {!shown && <Row x0={40} y={64} cap={12} pitch={36} w={32} labels fillOf={() => 1} o={a0} />}
      {shown && <Row x0={40} y={64} cap={12} pitch={36} w={32} labels fillOf={() => 1} o={1 - grow} />}
      {shown && <Row x0={40} y={64} cap={18} pitch={26.7} w={24} fillOf={(j) => (j <= 13 ? 1 : 0)} o={grow} fs={13} />}
      <T x={536} y={122} s={15} f={C.caramel} a="end" w={600}>Φ = {Math.round(gv)}</T>
      <Gauge x={496} top={132} bottom={252} unit={8} value={gv} />
      <line x1={490} y1={252} x2={526} y2={252} stroke={C.taupe} strokeWidth={1.5} />
      <T x={486} y={256} s={13} f={C.taupe} a="end">0</T>
      <T x={40} y={146} s={15} f={C.crema} o={a0}>append 13: grow to 18, copy 12</T>
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
export function Q2({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  if (portrait) {
    // Phone: the log axis is there from the start so the estimate is a position on a scale; values sit beside each label.
    const PX = (v: number) => 20 + ((Math.log10(v) - 3) / 9) * 320;
    const b1 = (PX(2_097_155_000) - 20) * at(s, 0.1, 0.9);
    const b2 = (PX(4_000) - 20) * at(s, 0.5, 1.1);
    return (
      <PSvg label="One thousand rounds on a vector of 1,048,576 keys: shrink-at-half costs 2,097,155,000 writes, shrink-at-a-quarter 4,000, on a log axis from one thousand to one trillion; per round, 2C plus 3 against 4" h={246}>
        <T x={12} y={20} s={15} f={C.crema} o={a0}>C = 1,048,576, 1,000 rounds</T>
        <T x={12} y={44} s={13} f={C.taupe} o={a0}>count writes in the rounds only</T>
        <T x={12} y={72} s={15} f={C.latte} o={a0}>shrink-at-½</T>
        {shown && <T x={348} y={72} s={15} f={C.cherryText} a="end" w={700} o={at(s, 0.8, 1.2)}>{fmt(2_097_155_000)}</T>}
        <rect x={20} y={80} width={Math.max(4, b1)} height={22} rx={6} fill={C.cherry} opacity={shown ? 1 : 0.25} />
        {!shown && <T x={348} y={72} s={15} f={C.taupe} a="end">?</T>}
        <T x={12} y={132} s={15} f={C.caramel} o={a0}>shrink-at-¼</T>
        {shown && <T x={348} y={132} s={15} f={C.caramel} a="end" w={700} o={at(s, 1.2, 1.6)}>{fmt(4_000)}</T>}
        <rect x={20} y={140} width={Math.max(4, b2)} height={22} rx={6} fill={C.caramel} opacity={shown ? 1 : 0.25} />
        {!shown && <T x={348} y={132} s={15} f={C.taupe} a="end">?</T>}
        <line x1={20} y1={190} x2={340} y2={190} stroke={C.taupe} opacity={a0} />
        {([[3, '1 thousand', 'start'], [6, '1 million', 'middle'], [9, '1 billion', 'middle'], [12, '1 trillion', 'end']] as const).map(([e, l, a]) => (
          <g key={e} opacity={a0}>
            <line x1={PX(10 ** e)} y1={186} x2={PX(10 ** e)} y2={e % 2 ? 194 : 214} stroke={C.taupe} />
            <T x={PX(10 ** e) + (a === 'start' ? -12 : a === 'end' ? 12 : 0)} y={e % 2 ? 212 : 234} s={13} f={C.taupe} a={a}>{l}</T>
          </g>
        ))}
      </PSvg>
    );
  }
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
      <g opacity={a0}>
        <line x1={60} y1={250} x2={520} y2={250} stroke={C.taupe} />
        {([[3, '1 thousand', 'start'], [6, '1 million', 'middle'], [9, '1 billion', 'middle'], [12, '1 trillion', 'end']] as const).map(([e, l, a]) => (
          <g key={e}>
            <line x1={LX(10 ** e)} y1={246} x2={LX(10 ** e)} y2={254} stroke={C.taupe} />
            <T x={LX(10 ** e)} y={272} s={13} f={C.taupe} a={a}>{l}</T>
          </g>
        ))}
      </g>
      {shown && (
        <T x={60} y={308} s={13} f={C.latte} o={at(s, 1.4, 1.8)}>per round: 2C + 3 against 4</T>
      )}
    </Svg>
  );
}

// 19 · Prove it 3: strict alternation under two rules one character apart.
export function Q3({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a0 = at(t, 0.1, 0.6);
  if (portrait) {
    // Phone: two labelled strips, each with its total at the top right; the rule names match the question's A and B.
    const A8 = [17, 1, 1, 1, 1, 1, 1, 1];
    const B8 = [17, 17, 17, 17, 17, 17, 17, 17];
    const pstrip = (vals: number[], base: number, t0: number) =>
      vals.map((c, k) => {
        const h = c * 3 * at(s, t0 + 0.08 * k, t0 + 0.4 + 0.08 * k);
        return <rect key={k} x={12 + 42 * k} y={base - h} width={36} height={h} rx={2} fill={c > 1 ? C.cherry : C.crema} />;
      });
    return (
      <PSvg label="Strict alternation from a full vector of 16 keys: rule A, shrinking when a pop leaves it less than half full, costs 17 for the first push and then 1 per operation, 24 in all; rule B, at most half full, resizes every operation, 17 each, 136 in all" h={236}>
        <T x={12} y={20} s={13} f={C.taupe} o={a0}>full at 16, then push, pop, push, pop, …</T>
        <T x={12} y={46} s={15} f={C.latte} o={a0}>A: shrink if n &lt; cap/2</T>
        {shown && <T x={348} y={46} s={17} f={C.crema} a="end" w={700} o={at(s, 0.9, 1.3)}>24</T>}
        <line x1={12} y1={106} x2={348} y2={106} stroke={C.mocha} opacity={a0} />
        {!shown && <rect x={12} y={54} width={336} height={48} rx={8} fill="none" stroke={C.taupe} strokeDasharray="4 4" opacity={a0} />}
        {shown && pstrip(A8, 106, 0.1)}
        <T x={12} y={146} s={15} f={C.latte} o={a0}>B: shrink if n ≤ cap/2</T>
        {shown && <T x={348} y={146} s={17} f={C.cherryText} a="end" w={700} o={at(s, 1.3, 1.7)}>136</T>}
        <line x1={12} y1={206} x2={348} y2={206} stroke={C.mocha} opacity={a0} />
        {!shown && <rect x={12} y={154} width={336} height={48} rx={8} fill="none" stroke={C.taupe} strokeDasharray="4 4" opacity={a0} />}
        {shown && pstrip(B8, 206, 0.5)}
        {shown && <T x={12} y={228} s={13} f={C.taupe} o={at(s, 1.0, 1.4)}>A: a pop leaves 16 of 32, half, not less</T>}
      </PSvg>
    );
  }
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
      <T x={40} y={78} s={15} f={C.latte} o={a0}>A: shrink if n &lt; cap/2</T>
      <line x1={40} y1={176} x2={520} y2={176} stroke={C.mocha} opacity={a0} />
      {!shown && <rect x={60} y={98} width={452} height={74} rx={8} fill="none" stroke={C.taupe} strokeDasharray="4 4" opacity={a0} />}
      {shown && strip(A, 176, 0.1)}
      {shown && <T x={520} y={96} s={15} f={C.crema} a="end" w={700} o={at(s, 0.9, 1.3)}>24</T>}
      {shown && <T x={40} y={196} s={13} f={C.taupe} o={at(s, 1.0, 1.4)}>A: a pop leaves 16 of 32, half, not less</T>}
      <T x={40} y={226} s={15} f={C.latte} o={a0}>B: shrink if n ≤ cap/2</T>
      <line x1={40} y1={316} x2={520} y2={316} stroke={C.mocha} opacity={a0} />
      {!shown && <rect x={60} y={238} width={452} height={74} rx={8} fill="none" stroke={C.taupe} strokeDasharray="4 4" opacity={a0} />}
      {shown && strip(B, 316, 0.5)}
      {shown && <T x={520} y={244} s={15} f={C.cherryText} a="end" w={700} o={at(s, 1.3, 1.7)}>136</T>}
    </Svg>
  );
}
