import { useEffect, useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Every number shown here is computed or asserted by examples.py.
// The model: the chapter's vector. Empty has capacity 0; the first append allocates 1; an append to a full vector
// allocates ceil(g * cap) (at least cap + 1), copies the keys, then writes. One unit of cost = one element write.

const grow = (cap: number, g: number) => (cap === 0 ? 1 : Math.max(Math.ceil(g * cap), cap + 1));
type Rz = { at: number; copies: number };
function resizes(n: number, g: number): Rz[] {
  const out: Rz[] = [];
  let cap = 0;
  while (cap + 1 <= n) {
    out.push({ at: cap + 1, copies: cap });
    cap = grow(cap, g);
  }
  return out;
}
const N = 1_000_000;
const R2 = resizes(N, 2);
const R15 = resizes(N, 1.5);
const copiesAt = (R: Rz[], n: number) => R.reduce((s, r) => (r.at <= n ? s + r.copies : s), 0);
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const COSTS16 = (() => {
  const c: number[] = Array(16).fill(1);
  resizes(16, 2).forEach((r) => (c[r.at - 1] = 1 + r.copies));
  return c; // 1, 2, 3, 1, 5, 1, 1, 1, 9, then seven 1s
})();
const POW = (n: number) => {
  let c = 1;
  while (c < n) c *= 2;
  return c;
};
const BIGGEST = 524_289; // the dearest append of the first million

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

/** A coin: the credit left on a cell, a bit or a key. */
const Coin = ({ x, y, r = 8, o = 1 }: { x: number; y: number; r?: number; o?: number }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={C.caramel} stroke={C.roast} strokeWidth={1.5} />
    <circle cx={x} cy={y} r={r * 0.45} fill="none" stroke={C.cinnamon} strokeWidth={1.2} />
  </g>
);

/** One square cell of the vector: filled crema with its key, or an empty taupe slot. */
const Cell = ({ x, y, w, h = w, label, fill = 1, o = 1, fs = 13 }: { x: number; y: number; w: number; h?: number; label?: ReactNode; fill?: number; o?: number; fs?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.5} />
    {fill > 0 && <rect x={x} y={y} width={w} height={h} rx={4} fill={C.crema} opacity={fill} />}
    {fill > 0.5 && label !== undefined && (
      <T x={x + w / 2} y={y + h / 2 + 5} s={fs} f={C.espresso} a="middle" w={700}>
        {label}
      </T>
    )}
  </g>
);

/** The cost strip of a million appends on a linear scale: a hairline of cheap appends and 20 resizing spikes. */
function Strip1M({ x0, w, base, tall, p = 1, o = 1, paid = false }: { x0: number; w: number; base: number; tall: number; p?: number; o?: number; paid?: boolean }) {
  const sweepX = x0 + p * w;
  return (
    <g opacity={o}>
      <rect x={x0} y={base - 2} width={w * p} height={2} fill={C.crema} />
      {R2.filter((r) => r.copies > 0).map((r) => {
        const xx = x0 + (r.at / N) * w;
        const h = (((1 + r.copies) / BIGGEST) * tall) * easeOutBack(seg(sweepX, xx, xx + 30));
        const top = r.at === BIGGEST;
        return h > 1 ? <rect key={r.at} x={xx - 1.5} y={base - h} width={3} height={h} fill={top && paid ? C.caramel : C.cherry} stroke={top && paid ? C.cherry : 'none'} strokeWidth={1.5} /> : null;
      })}
    </g>
  );
}

// 1 · The paradox: a million appends as one cost strip.
export function Opening({ t }: StepCtx) {
  const claim = easeOut(seg(t, 0.1, 0.5));
  const sub = easeOut(seg(t, 0.5, 0.9));
  const sweep = seg(t, 0.8, 2.6);
  const lab = easeOut(seg(t, 2.8, 3.2));
  const both = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="A million appends as one cost strip: 999,980 appends cost one write each, and one append, number 524,289, copies 524,288 keys" h={360}>
      <T x={300} y={42} s={24} f={C.caramel} a="middle" serif w={700} o={claim}>“append is O(1)”</T>
      <T x={300} y={66} s={13} f={C.taupe} a="middle" o={sub}>a vector of 64-bit keys</T>
      <T x={300} y={90} s={13} f={C.taupe} a="middle" o={sub}>1,000,000 appends from empty</T>
      <Strip1M x0={40} w={480} base={318} tall={180} p={sweep} />
      <T x={284} y={140} s={15} f={C.cherryText} a="end" o={lab}>append 524,289</T>
      <T x={284} y={164} s={15} f={C.cherryText} a="end" o={lab}>copies 524,288 keys</T>
      <T x={300} y={118} s={17} f={C.crema} a="middle" w={700} o={both}>both true?</T>
      <T x={300} y={344} s={13} f={C.taupe} a="middle" o={easeOut(seg(t, 1.8, 2.4))}>999,980 appends cost 1 write</T>
    </Svg>
  );
}

// 2 · Predict: the total of a million appends, against the 3n mark.
export function MillionTotal({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a = easeOut(seg(t, 0.1, 0.6));
  const wCrema = shown ? 160 * easeOut(seg(s, 0, 0.5)) : 0;
  const wCherry = shown ? 167.8 * easeOut(seg(s, 0.4, 1.0)) : 0;
  const lab = shown ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="Total element writes for a million appends: 1,000,000 new keys plus 1,048,575 copies is 2,048,575, under 3n which is 3,000,000" h={340}>
      <Strip1M x0={40} w={480} base={112} tall={80} o={0.5 * a} />
      <T x={40} y={152} s={13} f={C.taupe}>total element writes, 1,000,000 appends</T>
      <rect x={40} y={192} width={480} height={32} rx={7} fill={C.cocoa} />
      {shown && <rect x={40} y={192} width={Math.max(3, wCrema)} height={32} rx={7} fill={C.crema} />}
      {shown && wCherry > 1 && <rect x={200} y={192} width={wCherry} height={32} fill={C.cherry} />}
      {!shown && <T x={280} y={217} s={26} f={C.crema} a="middle" w={700}>?</T>}
      {shown && (
        <g>
          <T x={120} y={246} s={15} f={C.crema} a="middle" w={600} o={lab}>1,000,000</T>
          <T x={120} y={264} s={13} f={C.taupe} a="middle" o={lab}>new keys</T>
          <T x={284} y={246} s={15} f={C.cherryText} a="middle" w={600} o={lab}>1,048,575</T>
          <T x={284} y={264} s={13} f={C.taupe} a="middle" o={lab}>copies</T>
          <T x={368} y={184} s={24} f={C.caramel} a="end" serif w={700} o={easeOut(seg(s, 1.0, 1.4))}>2,048,575</T>
          <line x1={520} y1={180} x2={520} y2={232} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" opacity={lab} />
          <T x={532} y={252} s={13} f={C.caramel} a="end" o={lab}>3n =</T>
          <T x={532} y={270} s={13} f={C.caramel} a="end" o={lab}>3,000,000</T>
        </g>
      )}
    </Svg>
  );
}

// 3 · Sixteen appends: the vector and its cost strip, drawn together.
const TRACE = (() => {
  let tt = 0.3;
  const ev = COSTS16.map((cost, k) => {
    const dur = cost > 1 ? 0.45 : 0.22;
    const e = { i: k + 1, cost, start: tt, dur };
    tt += dur;
    return e;
  });
  return { ev, end: tt };
})();
const cx = (j: number) => 40 + 30 * (j - 1); // cell j's left edge in the 16-cell rows and strips

export function SmallTrace({ t }: StepCtx) {
  const cur = [...TRACE.ev].reverse().find((e) => e.start <= t);
  const row = (cap: number, y: number, o: number, fillOf: (j: number) => number) => (
    <g opacity={o}>
      {Array.from({ length: cap }, (_, k) => (
        <Cell key={k} x={cx(k + 1)} y={y} w={26} label={k + 1} fill={fillOf(k + 1)} fs={13} />
      ))}
    </g>
  );
  let rows: ReactNode = null;
  let arrows: ReactNode = null;
  if (cur) {
    const p = clamp((t - cur.start) / cur.dur);
    const i = cur.i;
    const capAfter = POW(i);
    const capBefore = i === 1 ? 0 : POW(i - 1);
    if (cur.cost > 1 && p < 0.85) {
      const slide = easeInOut(seg(p, 0.5, 0.85));
      const yNew = lerp(100, 56, slide);
      rows = (
        <g>
          {row(capBefore, 56, 1 - slide, (j) => (j < i ? 1 : 0))}
          {row(capAfter, yNew, 1, (j) => (j < i ? easeOut(seg(p, 0.05 + (j / i) * 0.4, 0.2 + (j / i) * 0.4)) : 0))}
        </g>
      );
      arrows = (
        <g opacity={1 - seg(p, 0.4, 0.55)}>
          {Array.from({ length: i - 1 }, (_, k) => (
            <line key={k} x1={cx(k + 1) + 13} y1={84} x2={cx(k + 1) + 13} y2={yNew - 2} stroke={C.caramel} strokeWidth={2} />
          ))}
        </g>
      );
    } else {
      const last = cur.cost > 1 ? easeOutBack(seg(p, 0.85, 1)) : easeOut(p);
      rows = row(capAfter, 56, 1, (j) => (j < i ? 1 : j === i ? clamp(last) : 0));
    }
  }
  const prog = (e: (typeof TRACE.ev)[number]) => easeOut(seg(t, e.start + e.dur * 0.5, e.start + e.dur));
  const cost = Math.round(TRACE.ev.reduce((s, e) => s + e.cost * seg(t, e.start + e.dur * 0.5, e.start + e.dur), 0));
  const charged = Math.round(TRACE.ev.reduce((s, e) => s + 3 * seg(t, e.start, e.start + e.dur), 0));
  return (
    <Svg label="Sixteen appends to the doubling vector: costs 1, 2, 3, 1, 5, 1, 1, 1, 9, then seven 1s, total 31 against 3 per append, 48" h={380}>
      <T x={40} y={34} s={17} f={C.crema} w={700}>cost so far: {cost}</T>
      <T x={520} y={34} s={15} f={C.caramel} a="end" w={600}>3 per append: {charged}</T>
      {rows}
      {arrows}
      <line x1={40} y1={350} x2={520} y2={350} stroke={C.mocha} />
      <line x1={40} y1={296} x2={520} y2={296} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
      <T x={32} y={300} s={13} f={C.caramel} a="end">3</T>
      {TRACE.ev.map((e) => {
        const h = e.cost * 18 * prog(e);
        return (
          <g key={e.i}>
            <rect x={cx(e.i)} y={350 - h} width={26} height={h} rx={3} fill={e.cost > 1 ? C.cherry : C.crema} />
            {e.cost > 1 && (
              <T x={cx(e.i) + 13} y={e.cost === 2 ? Math.min(350 - h - 6, 288) : 350 - h - 6} s={15} f={C.cherryText} a="middle" w={700} o={prog(e)}>
                {e.cost}
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · The aggregate method as a regrouping: spikes split into their write and their copies, which stack into a shorter column.
export function Aggregate({ t }: StepCtx) {
  const BASE = 322, U = 12;
  const lift = easeOut(seg(t, 0.3, 0.9));
  const spikes = COSTS16.map((c, k) => ({ i: k + 1, cost: c })).filter((e) => e.cost > 1);
  // copy blocks stack in the order 8 (bottom), 4, 2, 1
  const order = [...spikes].sort((a, b) => b.cost - a.cost);
  const offs = new Map<number, number>();
  let acc = 0;
  order.forEach((e) => {
    offs.set(e.i, acc);
    acc += e.cost - 1;
  });
  const mv = (stag: number) => easeInOut(seg(t, 1.2 + stag, 2.4));
  const fade = (a: number, b: number) => easeOut(seg(t, a, b));
  return (
    <Svg label="The aggregate method: the 16 writes stack into a column of 16, the copies 1 plus 2 plus 4 plus 8 stack into a column of 15, so the total 31 is under 3 times 16, which is 48" h={380}>
      <line x1={40} y1={BASE} x2={520} y2={BASE} stroke={C.mocha} opacity={1 - mv(0.3)} />
      {COSTS16.map((c, k) => {
        const i = k + 1;
        const e = mv(i * 0.02);
        const xs = cx(i), ys = BASE - U;
        return <rect key={`w${i}`} x={lerp(xs, 340, e)} y={lerp(ys, BASE - U * i, e)} width={lerp(26, 56, e)} height={U} rx={2} fill={C.crema} stroke={C.espresso} strokeWidth={1} />;
      })}
      {spikes.map((e) => {
        const m = mv(0.1 + e.i * 0.01);
        const copies = e.cost - 1;
        const ys = BASE - U * e.cost - 14 * lift;
        const yd = BASE - U * ((offs.get(e.i) ?? 0) + copies);
        return <rect key={`c${e.i}`} x={lerp(cx(e.i), 430, m)} y={lerp(ys, yd, m)} width={lerp(26, 56, m)} height={U * copies} rx={2} fill={C.cherry} stroke={C.espresso} strokeWidth={1} />;
      })}
      <T x={368} y={344} s={13} f={C.taupe} a="middle" o={fade(2.4, 2.8)}>writes</T>
      <T x={368} y={370} s={17} f={C.crema} a="middle" w={700} o={fade(2.4, 2.8)}>16</T>
      <T x={458} y={344} s={13} f={C.taupe} a="middle" o={fade(2.4, 2.8)}>copies</T>
      <T x={458} y={370} s={15} f={C.cherryText} a="middle" w={700} o={fade(2.4, 2.8)}>1+2+4+8 = 15</T>
      <line x1={340} y1={BASE - U * 16} x2={490} y2={BASE - U * 16} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" opacity={fade(2.6, 3)} />
      <T x={458} y={BASE - U * 16 - 10} s={15} f={C.caramel} a="middle" w={700} o={fade(2.6, 3)}>15 &lt; 16</T>
      <T x={40} y={78} s={17} f={C.crema} w={700} o={fade(3.2, 3.6)}>31 &lt; 3 · 16 = 48</T>
      <T x={40} y={108} s={15} f={C.caramel} o={fade(3.2, 3.6)}>any n: copies &lt; 2n</T>
      <T x={40} y={136} s={15} f={C.caramel} o={fade(3.2, 3.6)}>total &lt; 3n</T>
      <T x={40} y={190} s={22} f={C.caramel} serif w={700} o={fade(3.8, 4.2)}>O(1) amortized</T>
    </Svg>
  );
}

// 5 · Three kinds of promise, each drawn as what it averages over.
export function Promise_({ t }: StepCtx) {
  const cards = [
    { name: 'average case', over: 'over random inputs', note: ['an unusual input can cost more'] },
    { name: 'expected', over: "over the algorithm's own coins", note: ['an unlucky run can cost more'] },
    { name: 'amortized', over: 'over one sequence, nothing random', note: ['no n appends from empty', 'cost 3n or more'] },
  ];
  const pic = (k: number, y0: number) => {
    if (k === 0) {
      const hs = [26, 34, 22, 30, 64, 28, 36];
      return hs.map((h, j) => <rect key={j} x={350 + j * 24} y={y0 + 86 - h} width={14} height={h} rx={2} fill={j === 4 ? C.cherry : C.crema} />);
    }
    if (k === 1) {
      const xs = [352, 368, 380, 392, 402, 414, 498];
      return (
        <g>
          <line x1={344} y1={y0 + 60} x2={520} y2={y0 + 60} stroke={C.mocha} />
          {xs.map((x, j) => <circle key={j} cx={x} cy={y0 + 60} r={6} fill={j === 6 ? C.cherry : C.crema} />)}
        </g>
      );
    }
    return (
      <g>
        <line x1={340} y1={y0 + 86} x2={520} y2={y0 + 86} stroke={C.mocha} />
        {COSTS16.map((c, j) => <rect key={j} x={345 + j * 11} y={y0 + 86 - c * 6} width={8} height={c * 6} rx={1} fill={c > 1 ? C.cherry : C.crema} />)}
        <line x1={340} y1={y0 + 86 - 18} x2={520} y2={y0 + 86 - 18} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" />
      </g>
    );
  };
  return (
    <Svg label="Three promises: average case over random inputs, expected over the algorithm's coins, amortized over one sequence with nothing random: no n appends from empty cost 3n or more" h={380}>
      {cards.map((c, k) => {
        const a = easeOut(seg(t, 0.2 + k * 0.7, 0.8 + k * 0.7));
        const y0 = 20 + 120 * k;
        const hl = k === 2 ? easeOut(seg(t, 2.4, 2.9)) : 0;
        return (
          <g key={c.name} opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
            <rect x={40} y={y0} width={500} height={100} rx={14} fill={C.roast} stroke={C.mocha} />
            {k === 2 && <rect x={40} y={y0} width={500} height={100} rx={14} fill="none" stroke={C.caramel} strokeWidth={2} opacity={hl} />}
            <T x={60} y={y0 + 26} s={16} f={C.crema} w={700}>{c.name}</T>
            <T x={60} y={y0 + 46} s={13} f={C.taupe}>{c.over}</T>
            {c.note.map((n, j) => <T key={n} x={60} y={y0 + 70 + j * 18} s={13} f={k === 2 ? C.caramel : C.latte}>{n}</T>)}
            {pic(k, y0)}
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Coins on cells: each append leaves one coin on itself and one on its partner in the old half.
export function Coins({ t }: StepCtx) {
  const TA = [0.4, 1.0, 1.6, 2.2]; // appends 5..8
  const ox = (c: number) => 40 + 60 * (c - 1); // old row cell c (capacity 8)
  const nx = (c: number) => 40 + 30 * (c - 1); // new row cell c (capacity 16)
  const OY = 110, NY = 250;
  const ghost = lerp(1, 0.25, easeOut(seg(t, 3.2, 3.6)));
  const fill = (c: number) => (c <= 4 ? 1 : easeOut(seg(t, TA[c - 5], TA[c - 5] + 0.2)));
  const drop = (t0: number) => {
    const p = seg(t, t0, t0 + 0.35);
    return { dy: -46 * (1 - easeOutBack(p)), o: seg(t, t0, t0 + 0.1) };
  };
  const spent = (c: number) => easeOut(seg(t, 3.4 + 0.08 * c, 3.6 + 0.08 * c));
  const cell = (c: number) => {
    const own = c >= 5 ? drop(TA[c - 5]) : null; // the coin an append left on itself
    const part = c <= 4 ? drop(TA[c - 1]) : null; // the coin left by its partner's append
    const d = own ?? part!;
    return (
      <g key={c}>
        <Cell x={ox(c)} y={OY} w={56} h={64} label={c} fill={fill(c)} fs={17} />
        <g transform={`translate(0 ${-10 * spent(c)})`}>
          <Coin x={ox(c) + 28} y={OY + 52 + d.dy} r={8 * (1 - 0.25 * spent(c))} o={d.o} />
        </g>
      </g>
    );
  };
  const arcs = TA.map((t0, k) => {
    const i = 5 + k, p = i - 4;
    const a = seg(t, t0, t0 + 0.3) * (1 - seg(t, t0 + 0.3, t0 + 0.7));
    return <path key={i} d={`M ${ox(i) + 28} ${OY} Q ${(ox(i) + ox(p)) / 2 + 28} ${OY - 44} ${ox(p) + 28} ${OY}`} fill="none" stroke={C.caramel} strokeWidth={2} opacity={a} />;
  });
  const nwa = easeOut(seg(t, 3.2, 3.5));
  const k9 = easeOutBack(seg(t, 4.2, 4.5));
  const ownDrop = drop(4.4);
  return (
    <Svg label="Charge 3 per append: one write, one coin on the new key, one coin on a key in the old half. When the row fills, every key holds one coin, exactly what its copy will cost" h={380}>
      <T x={40} y={30} s={15} f={C.crema} w={600}>charge 3 per append</T>
      <T x={40} y={50} s={13} f={C.taupe}>1 write · 1 coin on the new key · 1 coin on an old key</T>
      <g opacity={ghost}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(cell)}
      </g>
      {arcs}
      <T x={300} y={200} s={15} f={C.caramel} a="middle" w={600} o={easeOut(seg(t, 2.8, 3.1))}>8 keys · 8 coins</T>
      <g opacity={nwa}>
        {Array.from({ length: 16 }, (_, k) => {
          const c = k + 1;
          const f = c <= 8 ? easeOut(seg(t, 3.5 + 0.08 * c, 3.8 + 0.08 * c)) : c === 9 ? k9 : 0;
          return <Cell key={c} x={nx(c)} y={NY} w={26} label={c} fill={clamp(f)} fs={13} />;
        })}
      </g>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => {
        const a = seg(t, 3.4 + 0.08 * c, 3.6 + 0.08 * c) * (1 - seg(t, 3.6 + 0.08 * c, 3.8 + 0.08 * c));
        return <line key={c} x1={ox(c) + 28} y1={OY + 64} x2={nx(c) + 13} y2={NY - 2} stroke={C.caramel} strokeWidth={2} opacity={a} />;
      })}
      <Coin x={nx(9) + 13} y={NY + 36 + ownDrop.dy * 0.5} r={7} o={ownDrop.o} />
      <Coin x={nx(1) + 13} y={NY + 36 + ownDrop.dy * 0.5} r={7} o={ownDrop.o} />
      <T x={40} y={316} s={15} f={C.caramel} w={600} o={easeOut(seg(t, 3.8, 4.2))}>copy 8 keys = 8 coins</T>
      <T x={40} y={336} s={13} f={C.taupe} o={easeOut(seg(t, 4.2, 4.6))}>append 9's own 3:</T>
      <T x={40} y={354} s={13} f={C.taupe} o={easeOut(seg(t, 4.2, 4.6))}>write · coin on 9 · coin on 1</T>
    </Svg>
  );
}

// 7 · The bank never goes negative: charges against actual cost, append by append.
const CUM16 = COSTS16.reduce<number[]>((a, c) => [...a, (a[a.length - 1] ?? 0) + c], []);
export function Bank({ t }: StepCtx) {
  const X0 = 60, XW = 460, Y0 = 316, K = 5.6;
  const x = (i: number) => X0 + (XW / 16) * i;
  const Y = (w: number) => Y0 - K * w;
  const sweep = seg(t, 0.3, 3.3);
  const sx = X0 + XW * sweep;
  const stair = ['M', x(0), Y(0)];
  CUM16.forEach((s, k) => stair.push('L', x(k), Y(s), 'L', x(k + 1), Y(s)));
  const shade = CUM16.map((s, k) => {
    const i = k + 1;
    return `M ${x(i - 1)} ${Y(3 * (i - 1))} L ${x(i)} ${Y(3 * i)} L ${x(i)} ${Y(s)} L ${x(i - 1)} ${Y(s)} Z`;
  }).join(' ');
  const lab = easeOut(seg(t, 3.3, 3.8));
  return (
    <Svg label="Running total of charges, 3 per append, against the running total of actual costs for 16 appends: the bank between them is never below zero after any append" h={420}>
      <defs>
        <clipPath id="aam-bank-clip">
          <rect x={X0} y={0} width={Math.max(0.01, sx - X0)} height={420} />
        </clipPath>
      </defs>
      <line x1={X0} y1={Y0} x2={X0 + XW} y2={Y0} stroke={C.mocha} />
      <line x1={X0} y1={Y0} x2={X0} y2={30} stroke={C.mocha} />
      <T x={X0 + 6} y={30} s={13} f={C.taupe}>writes</T>
      <T x={X0 + XW} y={338} s={13} f={C.taupe} a="end">append i</T>
      <g clipPath="url(#aam-bank-clip)">
        <path d={shade} fill={C.caramel} opacity={0.35} />
        <line x1={x(0)} y1={Y(0)} x2={x(16)} y2={Y(48)} stroke={C.caramel} strokeWidth={2.5} strokeDasharray="7 5" />
        <path d={stair.join(' ')} fill="none" stroke={C.crema} strokeWidth={3} />
      </g>
      <T x={x(16)} y={Y(48) - 12} s={13} f={C.caramel} a="end" o={lab}>Σ charges = 3i</T>
      <T x={x(16) - 8} y={Y(26) + 36} s={13} f={C.crema} a="end" o={lab}>Σ actual cost</T>
      <T x={x(14)} y={Y(36)} s={13} f={C.caramel} a="middle" o={lab}>bank</T>
      {[2, 3, 5, 9].map((i) => (
        <g key={i} opacity={sx >= x(i) ? 1 : 0}>
          <line x1={x(i)} y1={Y(CUM16[i - 1])} x2={x(i)} y2={Y(3 * i)} stroke={C.taupe} strokeWidth={1.5} />
          <T x={x(i)} y={Y(3 * i) - 8} s={13} f={C.taupe} a="middle">3</T>
        </g>
      ))}
      <T x={40} y={364} s={15} f={C.crema} w={600} o={lab}>bank = Σĉᵢ − Σcᵢ</T>
      <T x={40} y={390} s={15} f={C.crema} w={600} o={lab}>≥ 0 after every append</T>
      <T x={40} y={414} s={13} f={C.taupe} o={lab}>lowest: 2, after append 1</T>
    </Svg>
  );
}

// 8 · Three growth rules, one million appends, on a log scale.
export function Additive({ t }: StepCtx) {
  const lx = (v: number) => 40 + ((Math.log10(v) - 6) / 6) * 480;
  const rows = [
    { lab: 'grow by 1 slot', v: 500_000_500_000, f: C.cherry, o: 1 },
    { lab: 'grow by 1,000 slots', v: 500_500_000, f: C.cherry, o: 0.7 },
    { lab: 'double (g = 2)', v: 2_048_575, f: C.caramel, o: 1 },
  ];
  return (
    <Svg label="Total writes for a million appends: growing by one slot costs 500,000,500,000, by 1,000 slots 500,500,000, doubling 2,048,575, on a log scale" h={340}>
      <T x={40} y={30} s={13} f={C.taupe}>total writes, 1,000,000 appends (log scale)</T>
      {rows.map((r, k) => {
        const y = 80 + 90 * k;
        const a = easeOut(seg(t, 0.3 + 0.8 * k, 0.9 + 0.8 * k));
        const w = (lx(r.v) - 40) * a;
        return (
          <g key={r.lab} opacity={Math.min(1, a * 3)}>
            <T x={40} y={y} s={15} f={C.crema} w={600}>{r.lab}</T>
            <rect x={40} y={y + 10} width={Math.max(3, w)} height={22} rx={6} fill={r.f} opacity={r.o} />
            {k === 0 && <T x={520} y={y + 52} s={15} f={C.cherryText} a="end" w={700}>500,000,500,000</T>}
            {k === 1 && <T x={lx(r.v) + 12} y={y + 27} s={15} f={C.cherryText} w={700} o={a}>500,500,000</T>}
            {k === 2 && <T x={lx(r.v) + 12} y={y + 28} s={17} f={C.caramel} w={700} o={a}>2,048,575</T>}
          </g>
        );
      })}
      <line x1={40} y1={308} x2={520} y2={308} stroke={C.mocha} />
      {[6, 9, 12].map((e) => (
        <T key={e} x={40 + ((e - 6) / 6) * 480} y={328} s={13} f={C.taupe} a="middle">
          {`10${e === 6 ? '⁶' : e === 9 ? '⁹' : '¹²'}`}
        </T>
      ))}
    </Svg>
  );
}

// 9 · Predict: tiles of copies for g = 2 and g = 1.5, at one per-key scale.
function tiles(R: Rz[], until: number) {
  return R.filter((r) => r.copies > 0 && r.at <= until).map((r) => r.copies).reverse();
}
const TILES2 = tiles(R2, 524_289);
const TILES15 = tiles(R15, 699_913);
function TileRow({ list, x0, y, fill, scale, reveal, slide }: { list: number[]; x0: number; y: number; fill: string; scale: number; reveal: (j: number) => number; slide: number }) {
  let x = x0;
  return (
    <g>
      {list.map((c, j) => {
        const w = c * scale;
        const e = reveal(j);
        const el = <rect key={j} x={x + slide * (1 - e)} y={y} width={Math.max(0.6, w)} height={26} fill={fill} stroke={C.espresso} strokeWidth={1} opacity={e} />;
        x += w;
        return el;
      })}
    </g>
  );
}
export function Factor({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const SC = 160 / 524_288;
  const SC15 = 160 / 699_912;
  const r1 = (j: number) => easeOut(seg(t, 0.2 + 0.05 * Math.min(j, 12), 0.7 + 0.05 * Math.min(j, 12)));
  const r2 = (j: number) => (j === 0 ? easeOut(seg(t, 0.4, 0.8)) : shown ? easeOut(seg(s, 0.05 * Math.min(j, 14), 0.45 + 0.05 * Math.min(j, 14))) : 0);
  return (
    <Svg label="Copies made up to just after a resize, latest first: for doubling they tile to twice the last copy, for a growth factor of 1.5 to three times" h={360}>
      <T x={40} y={86} s={15} f={C.caramel} w={600}>g = 2</T>
      <TileRow list={TILES2} x0={40} y={96} fill={C.caramel} scale={SC} reveal={r1} slide={0} />
      <rect x={40} y={132} width={160} height={10} rx={3} fill={C.crema} opacity={r1(0)} />
      <T x={40} y={160} s={13} f={C.taupe} o={r1(0)}>n ≈ last copy</T>
      <T x={372} y={116} s={15} f={C.caramel} w={700} o={easeOut(seg(t, 1.0, 1.4))}>≈ 2 × n</T>
      <T x={40} y={206} s={15} f={C.cinnamon} w={600}>g = 1.5</T>
      <TileRow list={TILES15} x0={40} y={216} fill={C.cinnamon} scale={SC15} reveal={r2} slide={260} />
      <rect x={40} y={252} width={160} height={10} rx={3} fill={C.crema} opacity={r1(0)} />
      <T x={40} y={280} s={13} f={C.taupe} o={r1(0)}>n ≈ last copy</T>
      {!shown && <T x={236} y={238} s={22} f={C.crema} w={700} o={easeOut(seg(t, 0.8, 1.2))}>?</T>}
      {shown && <T x={530} y={286} s={17} f={C.cinnamon} a="end" w={700} o={easeOut(seg(s, 0.9, 1.3))}>≈ 3 × n</T>}
    </Svg>
  );
}

// 10 · The sawtooth: copies per append against n, for both growth factors.
function curve(R: Rz[]) {
  const set = new Set<number>();
  for (let k = 0; k <= 320; k++) set.add(Math.round(1024 * Math.pow(N / 1024, k / 320)));
  R.forEach((r) => {
    if (r.at > 1024 && r.at <= N) {
      set.add(r.at - 1);
      set.add(r.at);
    }
  });
  return [...set].sort((a, b) => a - b).map((n) => ({ n, v: copiesAt(R, n) / n }));
}
const CURVE2 = curve(R2);
const CURVE15 = curve(R15);
export function Sawtooth({ t }: StepCtx) {
  const X0 = 50, Y0 = 340;
  const px = (n: number) => X0 + (Math.log2(n) - 10) * 40;
  const py = (v: number) => Y0 - v * 87.5;
  const sx = X0 + 400 * seg(t, 0.5, 3.0);
  const path = (pts: { n: number; v: number }[]) => pts.filter((p) => px(p.n) <= sx).map((p, k) => `${k ? 'L' : 'M'}${px(p.n).toFixed(1)} ${py(p.v).toFixed(1)}`).join(' ');
  const ax = easeOut(seg(t, 0.1, 0.5));
  const dots = easeOut(seg(t, 3.3, 3.6));
  const vals = easeOut(seg(t, 3.7, 4.0));
  const xm = px(N);
  return (
    <Svg label="Copies per append against n on a log scale: a sawtooth that jumps to about g over g minus 1 at each resize and falls to about 1 over g minus 1 before the next; at n equals 1,000,000 doubling is at 1.05 and 1.5 at 2.10" h={400}>
      <T x={56} y={24} s={13} f={C.caramel} w={600}>g = 2</T>
      <T x={56} y={42} s={13} f={C.cinnamon} w={600}>g = 1.5</T>
      <g opacity={ax}>
        <line x1={X0} y1={Y0} x2={X0 + 400} y2={Y0} stroke={C.mocha} />
        <line x1={X0} y1={Y0} x2={X0} y2={py(3.2)} stroke={C.mocha} />
        {[1, 2, 3].map((v) => <T key={v} x={40} y={py(v) + 5} s={13} f={C.taupe} a="end">{v}</T>)}
        {[['2¹⁰', 10], ['2¹⁵', 15], ['2²⁰', 20]].map(([l, e]) => <T key={l as string} x={X0 + ((e as number) - 10) * 40} y={Y0 + 22} s={13} f={C.taupe} a="middle">{l}</T>)}
        <line x1={X0} y1={py(2)} x2={X0 + 400} y2={py(2)} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 5" />
        <line x1={X0} y1={py(3)} x2={X0 + 400} y2={py(3)} stroke={C.cinnamon} strokeWidth={1.5} strokeDasharray="6 5" />
        <T x={56} y={py(3) - 8} s={13} f={C.latte}>g/(g − 1)</T>
      </g>
      <path d={path(CURVE2)} fill="none" stroke={C.caramel} strokeWidth={2.5} />
      <path d={path(CURVE15)} fill="none" stroke={C.cinnamon} strokeWidth={2.5} />
      <g opacity={dots}>
        <line x1={xm} y1={Y0} x2={xm} y2={py(3.1)} stroke={C.taupe} strokeWidth={1.5} strokeDasharray="2 4" />
        <circle cx={xm} cy={py(2.0997)} r={5} fill={C.cinnamon} />
        <circle cx={xm} cy={py(1.0486)} r={5} fill={C.caramel} />
      </g>
      <T x={xm + 12} y={py(2.0997) + 6} s={17} f={C.cinnamon} w={700} o={vals}>2.10</T>
      <T x={xm + 12} y={py(1.0486) + 6} s={17} f={C.caramel} w={700} o={vals}>1.05</T>
      <T x={X0} y={392} s={13} f={C.taupe}>n (log scale) · copies per append</T>
    </Svg>
  );
}

// 11 · Predict: a binary counter's history as a grid, one row per increment, one column per bit.
const FLIPS16 = Array.from({ length: 16 }, (_, r) => {
  let tr = 0;
  while ((r >> tr) & 1) tr++;
  return tr + 1; // trailing ones reset, one zero set
});
export function Counter({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const gx = (c: number) => 120 + 64 * c;
  const gy = (r: number) => 112 + 12 * r;
  const a = easeOut(seg(t, 0.1, 0.6));
  const bits = [1, 0, 0, 0, 0];
  const tot = [1, 2, 4, 8, 16]; // bit 4 .. bit 0
  const vis = (r: number) => (shown ? easeOut(seg(s, 0.07 * r, 0.07 * r + 0.15)) : 0);
  return (
    <Svg label="A binary counter's first 16 increments as a grid: bit 0 flips 16 times, bit 1 eight, bit 2 four, bit 3 twice, bit 4 once, 31 flips in all" h={350}>
      <T x={280} y={22} s={15} f={C.cherryText} a="middle" w={600} o={a}>01111 → 10000 flips 5 bits</T>
      {bits.map((b, c) => (
        <g key={c} opacity={a}>
          <rect x={gx(c) + 2} y={32} width={60} height={46} rx={8} fill={C.cherry} />
          <T x={gx(c) + 32} y={64} s={24} f={C.crema} a="middle" w={700}>{b}</T>
        </g>
      ))}
      <T x={120} y={100} s={14} f={C.taupe}>unit: one bit flip</T>
      {Array.from({ length: 16 }, (_, r) => (
        <g key={r}>
          {Array.from({ length: 5 }, (_, c) => {
            const flipped = 4 - c < FLIPS16[r];
            return (
              <g key={c}>
                <rect x={gx(c) + 2} y={gy(r)} width={60} height={10} rx={3} fill="none" stroke={C.taupe} strokeWidth={0.8} opacity={0.45} />
                {flipped && <rect x={gx(c) + 2} y={gy(r)} width={60} height={10} rx={3} fill={C.caramel} opacity={vis(r)} />}
              </g>
            );
          })}
        </g>
      ))}
      {shown && <rect x={gx(0)} y={gy(15) - 1} width={320} height={12} rx={4} fill="none" stroke={C.cherry} strokeWidth={2} opacity={easeOut(seg(s, 1.0, 1.3))} />}
      {tot.map((v, c) => <T key={c} x={gx(c) + 32} y={gy(15) + 34} s={15} f={C.caramel} a="middle" w={700} o={shown ? easeOut(seg(s, 1.1, 1.4)) : 0}>{v}</T>)}
      <T x={452} y={gy(15) + 36} s={22} f={C.caramel} serif w={700} o={shown ? easeOut(seg(s, 1.1, 1.4)) : 0}>= 31</T>
    </Svg>
  );
}

// 12 · One coin on every 1 bit.
const CC_EVENTS = (() => {
  const ev: { time: number; bit: number; val: number }[] = [
    { time: 0.4, bit: 0, val: 0 },
    { time: 0.6, bit: 1, val: 0 },
    { time: 0.8, bit: 2, val: 0 },
    { time: 1.0, bit: 3, val: 1 },
  ];
  let v = 8;
  for (let k = 0; k < 8; k++) {
    const nv = v + 1;
    for (let b = 0; b < 5; b++) if (((v ^ nv) >> b) & 1) ev.push({ time: 1.8 + 0.2 * k, bit: b, val: (nv >> b) & 1 });
    v = nv;
  }
  return ev;
})();
function bitState(b: number, t: number) {
  let val = b <= 2 ? 1 : 0, lc = -1;
  for (const e of CC_EVENTS) if (e.bit === b && e.time <= t) {
    val = e.val;
    lc = e.time;
  }
  return { val, lc };
}
export function CounterCoins({ t }: StepCtx) {
  const bx = (c: number) => 120 + 72 * c;
  const tally = easeOut(seg(t, 3.5, 4.0));
  const resets = easeOut(seg(t, 1.0, 1.3)) * (1 - easeOut(seg(t, 1.7, 2.0)));
  return (
    <Svg label="Charge 2 per increment: one pays to set a bit, one stays on it as a coin. Resets are paid by the coins on the bits they reset. 16 increments are charged 32 and flip 31 bits" h={340}>
      <T x={40} y={34} s={15} f={C.crema} w={600}>charge 2 per increment</T>
      <T x={40} y={54} s={13} f={C.taupe}>1 sets a bit · 1 stays on it as a coin</T>
      {[0, 1, 2, 3, 4].map((c) => {
        const b = 4 - c;
        const { val, lc } = bitState(b, t);
        const coinIn = val === 1 ? (lc < 0 ? 1 : easeOutBack(seg(t, lc, lc + 0.25))) : 0;
        const ghost = val === 0 && lc >= 0 ? seg(t, lc, lc + 0.25) : 1;
        return (
          <g key={c}>
            <rect x={bx(c)} y={110} width={68} height={66} rx={10} fill={C.roast} stroke={C.mocha} />
            <T x={bx(c) + 34} y={153} s={26} f={val ? C.crema : C.taupe} a="middle" w={700}>{val}</T>
            <T x={bx(c) + 34} y={198} s={13} f={C.taupe} a="middle">bit {b}</T>
            {coinIn > 0 && <Coin x={bx(c) + 34} y={90} r={9 * coinIn} />}
            {val === 0 && lc >= 0 && ghost < 1 && <Coin x={bx(c) + 34} y={90 - 22 * ghost} r={9} o={1 - ghost} />}
          </g>
        );
      })}
      <T x={300} y={236} s={15} f={C.caramel} a="middle" w={600} o={resets}>3 resets paid by 3 coins</T>
      <T x={40} y={284} s={15} f={C.crema} w={600} o={tally}>16 × 2 = 32 charged · 31 flips</T>
      <T x={40} y={306} s={15} f={C.caramel} w={600} o={tally}>coins = number of 1 bits ≥ 0</T>
    </Svg>
  );
}

// 13 · Multipop: each key carries the coin for its own removal.
type Op = { kind: 'push' | 'mp'; k: number; start: number; dur: number; cost: number };
const MP_OPS: Op[] = (() => {
  const ops: Op[] = [];
  const push = (start: number) => ops.push({ kind: 'push', k: 0, start, dur: 0.35, cost: 1 });
  for (let i = 0; i < 6; i++) push(0.3 + 0.35 * i);
  ops.push({ kind: 'mp', k: 4, start: 2.4, dur: 0.6, cost: 4 });
  push(3.0);
  push(3.35);
  ops.push({ kind: 'mp', k: 10, start: 3.7, dur: 0.6, cost: 4 });
  return ops;
})();
// key id, stack level, the op that pushes it, the op that pops it
const MP_KEYS = [
  { id: 1, lvl: 0, push: 0, pop: 9 }, { id: 2, lvl: 1, push: 1, pop: 9 }, { id: 3, lvl: 2, push: 2, pop: 6 }, { id: 4, lvl: 3, push: 3, pop: 6 },
  { id: 5, lvl: 4, push: 4, pop: 6 }, { id: 6, lvl: 5, push: 5, pop: 6 }, { id: 7, lvl: 2, push: 7, pop: 9 }, { id: 8, lvl: 3, push: 8, pop: 9 },
];
export function Multipop({ t }: StepCtx) {
  const BASE = 340, KY = (l: number) => BASE - 24 * (l + 1);
  const bx = (o: number) => 220 + 30 * o;
  const tally = easeOut(seg(t, 4.3, 4.8));
  return (
    <Svg label="A stack with push and multipop: each key carries a coin for its own removal; ten operations cost 16, at most twice the 8 pushes" h={402}>
      <T x={40} y={26} s={15} f={C.crema} w={600}>push · pop · multipop(k)</T>
      <T x={40} y={46} s={13} f={C.taupe}>multipop(k) pops min(k, size) keys</T>
      <T x={40} y={68} s={13} f={C.taupe}>unit: one key in or out</T>
      <path d={`M 56 190 L 56 ${BASE + 2} L 164 ${BASE + 2} L 164 190`} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      {MP_KEYS.map((k) => {
        const op = MP_OPS[k.push], pop = MP_OPS[k.pop];
        const born = easeOutBack(seg(t, op.start, op.start + 0.25));
        const order = MP_KEYS.filter((q) => q.pop === k.pop && q.lvl > k.lvl).length; // the top key leaves first
        const rise = easeOut(seg(t, pop.start + 0.08 * order, pop.start + 0.08 * order + 0.35));
        const o = clamp(born) * (1 - rise);
        const flight = easeInOut(seg(t, pop.start + 0.08 * order + 0.05, pop.start + 0.5));
        const cxk = 166, cyk = KY(k.lvl) + 12;
        const tx = bx(k.pop) + 11, ty = BASE - 30 * 2;
        return (
          <g key={k.id}>
            <g opacity={o} transform={`translate(0 ${-30 * rise})`}>
              <Cell x={60} y={KY(k.lvl)} w={100} h={22} label={k.id} fill={1} fs={13} />
            </g>
            {born > 0.1 && flight < 1 && <Coin x={lerp(cxk, tx, flight)} y={lerp(cyk, ty, flight)} r={7} o={clamp(born) * (1 - seg(flight, 0.8, 1))} />}
          </g>
        );
      })}
      <line x1={220} y1={BASE} x2={520} y2={BASE} stroke={C.mocha} />
      <line x1={220} y1={BASE - 60} x2={520} y2={BASE - 60} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
      <T x={224} y={BASE - 68} s={13} f={C.caramel}>2 per operation</T>
      {MP_OPS.map((op, o) => {
        const h = 30 * op.cost * easeOut(seg(t, op.start + (op.kind === 'mp' ? 0.2 : 0.05), op.start + (op.kind === 'mp' ? 0.6 : 0.3)));
        return <rect key={o} x={bx(o)} y={BASE - h} width={22} height={h} rx={3} fill={op.cost > 1 ? C.cherry : C.crema} />;
      })}
      <T x={40} y={368} s={15} f={C.crema} w={600} o={tally}>10 operations · cost 16</T>
      <T x={40} y={394} s={15} f={C.caramel} w={600} o={tally}>≤ 2 × 8 pushes ≤ 2n</T>
    </Svg>
  );
}

// 14 · Cheap operations pay for expensive ones, three times.
export function Setup({ t }: StepCtx) {
  const rows = [
    { chips: 4, left: 'appends 5–8 · 2 each', right: 'append 9: 8 copies', per: 2 },
    { chips: 3, left: '3 bits set', right: 'increment 8: 3 resets', per: 1 },
    { chips: 4, left: '4 pushes', right: 'multipop(4): 4 pops', per: 1 },
  ];
  return (
    <Svg label="The same move three times: cheap operations leave coins that pay for the expensive operation that follows: appends 5 to 8 pay append 9, three set bits pay increment 8, four pushes pay multipop of 4" h={380}>
      {rows.map((r, k) => {
        const t0 = 0.2 + k * 1.0;
        const y0 = 30 + 120 * k;
        const paid = easeOut(seg(t, t0 + 1.0, t0 + 1.3));
        return (
          <g key={r.left}>
            {Array.from({ length: r.chips }, (_, i) => (
              <rect key={i} x={40 + 40 * i} y={y0 + 10} width={34} height={28} rx={6} fill={C.crema} opacity={easeOut(seg(t, t0 + 0.05 * i, t0 + 0.3))} />
            ))}
            <line x1={50 + 40 * r.chips} y1={y0 + 24} x2={408} y2={y0 + 24} stroke={C.caramel} strokeWidth={2} opacity={easeOut(seg(t, t0 + 0.3, t0 + 0.5))} />
            <rect x={414} y={y0 + 4} width={106} height={40} rx={8} fill={C.cherry} stroke={C.caramel} strokeWidth={3} strokeOpacity={paid} />
            {Array.from({ length: r.chips * r.per }, (_, c) => {
              const i = Math.floor(c / r.per);
              const p = seg(t, t0 + 0.4 + 0.06 * c, t0 + 0.9 + 0.06 * c);
              return p > 0 && p < 1 ? <Coin key={c} x={lerp(57 + 40 * i, 450 + (c % 3) * 12, easeInOut(p))} y={y0 + 24} r={6} /> : null;
            })}
            <T x={40} y={y0 + 70} s={13} f={C.crema}>{r.left}</T>
            <T x={520} y={y0 + 70} s={13} f={C.cherryText} a="end">{r.right}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 15 · When the bound breaks: two strips that are all spikes.
export function Breaks({ t }: StepCtx) {
  const bar = (k: number, n: number, t0: number, t1: number) => easeOut(seg(t, t0 + ((t1 - t0) * k) / n, t0 + ((t1 - t0) * (k + 1)) / n + 0.2));
  const tot = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="With decrement added, a 5-bit counter at 01111 flips 5 bits on every operation: 40 flips against a bound of 16. Appending again and again to one old full vector copies all 16 keys each time: 170 writes against 30" h={380}>
      <T x={40} y={30} s={15} f={C.crema} w={600}>add decrement: 01111 ↔ 10000</T>
      <line x1={50} y1={150} x2={400} y2={150} stroke={C.mocha} />
      {Array.from({ length: 8 }, (_, k) => {
        const h = 70 * bar(k, 8, 0.2, 1.6);
        return <rect key={k} x={60 + 40 * k} y={150 - h} width={28} height={h} rx={3} fill={C.cherry} />;
      })}
      <line x1={50} y1={122} x2={400} y2={122} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
            <T x={536} y={96} s={15} f={C.cherryText} a="end" w={700} o={tot}>40 flips</T>
      <T x={536} y={118} s={13} f={C.caramel} a="end" o={tot}>bound said 16</T>
      <T x={40} y={218} s={15} f={C.crema} w={600}>append to the same full vector</T>
      <line x1={50} y1={340} x2={400} y2={340} stroke={C.mocha} />
      {Array.from({ length: 10 }, (_, k) => {
        const h = 68 * bar(k, 10, 1.8, 3.2);
        return <rect key={k} x={60 + 32 * k} y={340 - h} width={22} height={h} rx={3} fill={C.cherry} />;
      })}
      <line x1={50} y1={328} x2={400} y2={328} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 5" />
            <T x={536} y={282} s={15} f={C.cherryText} a="end" w={700} o={tot}>170 writes</T>
      <T x={536} y={304} s={13} f={C.caramel} a="end" o={tot}>bound said 30</T>
    </Svg>
  );
}

// 16 · Back to the problem: the running total stays under 3n; the biggest spike is met by the bank.
const totalAt = (n: number) => n + copiesAt(R2, n);
export function Back({ t }: StepCtx) {
  const x = (n: number) => 60 + (n / N) * 460;
  const y = (w: number) => 190 - (w / 3_000_000) * 150;
  const sw = seg(t, 0.2, 1.8);
  const stair: (string | number)[] = ['M', x(0), y(0)];
  R2.filter((r) => r.copies > 0).forEach((r) => stair.push('L', x(r.at - 1), y(totalAt(r.at - 1)), 'L', x(r.at), y(totalAt(r.at))));
  stair.push('L', x(N), y(totalAt(N)));
  const strip = easeOut(seg(t, 2.0, 2.5));
  const flow = (k: number) => seg(t, 2.6 + 0.1 * k, 3.0 + 0.1 * k);
  const paid = t >= 3.4;
  return (
    <Svg label="A million appends write 2,048,575 elements in total, under 3n which is 3,000,000; when append 524,289 arrives the bank holds 524,289 coins for its 524,288 copies" h={380}>
      <defs>
        <clipPath id="aam-back-clip">
          <rect x={60} y={0} width={Math.max(0.01, 460 * sw)} height={220} />
        </clipPath>
      </defs>
      <line x1={60} y1={190} x2={520} y2={190} stroke={C.mocha} />
      <g clipPath="url(#aam-back-clip)">
        <line x1={x(0)} y1={y(0)} x2={x(N)} y2={y(3_000_000)} stroke={C.caramel} strokeWidth={2.5} strokeDasharray="7 5" />
        <path d={stair.join(' ')} fill="none" stroke={C.crema} strokeWidth={3} />
      </g>
      <T x={70} y={58} s={17} f={C.crema} w={700} o={easeOut(seg(t, 1.6, 2.0))}>2,048,575</T>
      <T x={70} y={80} s={15} f={C.caramel} w={600} o={easeOut(seg(t, 1.6, 2.0))}>≤ 3n = 3,000,000</T>
      <T x={520} y={208} s={13} f={C.taupe} a="end">1,000,000 appends</T>
      <Strip1M x0={40} w={480} base={330} tall={100} o={strip} paid={paid} />
      {Array.from({ length: 21 }, (_, i) => {
        const row = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2);
        const col = i - (row * (row + 1)) / 2;
        const gone = i < 6 ? flow(i) : 0;
        return gone < 1 ? <Coin key={i} x={250 - row * 5.5 + col * 11} y={324 - (5 - row) * 10} r={5} o={strip * (1 - gone)} /> : null;
      })}
      {Array.from({ length: 6 }, (_, k) => {
        const p = flow(k);
        return p > 0 && p < 1 ? <Coin key={k} x={lerp(240, 291, easeInOut(p))} y={lerp(300, 270, easeInOut(p))} r={5} /> : null;
      })}
      <T x={282} y={238} s={15} f={C.caramel} a="end" w={600} o={strip}>bank: 524,289 coins</T>
      <T x={282} y={256} s={13} f={C.taupe} a="end" o={strip}>for 524,288 copies</T>
      <T x={300} y={372} s={13} f={C.taupe} a="middle" o={easeOut(seg(t, 3.8, 4.1))}>still one append of 524,289 writes</T>
    </Svg>
  );
}

// 17 · Prove it 1: the bank under a charge of 2.
const BANK2 = [1, 1, 0, 1, -2, -1, 0, 1, -6, -5, -4, -3, -2, -1, 0, 1];
export function Q1({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a = easeOut(seg(t, 0.1, 0.7));
  return (
    <Svg label="A charge of 2 per append: the bank after each of 16 appends dips below zero at append 5 and again by append 9, and is back at plus 1 at each power of two" h={360}>
      <T x={40} y={18} s={13} f={C.taupe}>charge 2: 1 write + 1 coin on the new key</T>
      <line x1={40} y1={240} x2={520} y2={240} stroke={C.mocha} />
      {COSTS16.map((c, k) => {
        const h = c * 20 * easeOut(seg(t, 0.1 + 0.03 * k, 0.5 + 0.03 * k));
        return (
          <g key={k}>
            <rect x={cx(k + 1)} y={240 - h} width={26} height={h} rx={3} fill={c > 1 ? C.cherry : C.crema} />
            <g opacity={a}>
              <rect x={cx(k + 1) + 2} y={30} width={22} height={18} rx={5} fill={C.caramel} />
              <T x={cx(k + 1) + 13} y={43} s={13} f={C.espresso} a="middle" w={700}>2</T>
            </g>
          </g>
        );
      })}
      {shown && (
        <g>
          <T x={40} y={266} s={13} f={C.taupe} o={easeOut(seg(s, 0, 0.4))}>bank after each append</T>
          <line x1={40} y1={300} x2={520} y2={300} stroke={C.taupe} />
          {BANK2.map((b, k) => {
            const e = easeOut(seg(s, 0.04 * k, 0.04 * k + 0.4));
            const h = Math.abs(b) * 6 * e;
            return b >= 0 ? <rect key={k} x={cx(k + 1) + 6} y={300 - h} width={14} height={h} fill={C.caramel} /> : <rect key={k} x={cx(k + 1) + 6} y={300} width={14} height={h} fill={C.cherry} />;
          })}
          <rect x={cx(5) + 3} y={296} width={20} height={20} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={easeOut(seg(s, 0.7, 1.0))} />
          <T x={cx(5)} y={284} s={15} f={C.cherryText} w={700} o={easeOut(seg(s, 0.7, 1.0))}>append 5: −2</T>
          <T x={520} y={284} s={13} f={C.taupe} a="end" o={easeOut(seg(s, 0.9, 1.2))}>ends at +1</T>
        </g>
      )}
    </Svg>
  );
}

// 18 · Prove it 2: estimate the copies for g = 1.5 from the last resize.
export function Q2({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const SC15 = 160 / 699_912;
  const a = easeOut(seg(t, 0.1, 0.6));
  const r2 = (j: number) => (j === 0 ? a : shown ? easeOut(seg(s, 0.05 * Math.min(j, 14), 0.45 + 0.05 * Math.min(j, 14))) : 0);
  return (
    <Svg label="For growth factor 1.5, the last resize before the millionth append copies 699,912 keys at append 699,913; all the copies tile to about three times that, 2,099,719, which is 2.10 per append" h={340}>
      <T x={40} y={30} s={15} f={C.cinnamon} w={600} o={a}>last resize: append 699,913</T>
      <T x={40} y={54} s={15} f={C.cinnamon} w={600} o={a}>copies 699,912</T>
      <TileRow list={TILES15} x0={40} y={72} fill={C.cinnamon} scale={SC15} reveal={r2} slide={260} />
      <rect x={40} y={112} width={228.6} height={10} rx={3} fill={C.crema} opacity={a} />
      <T x={40} y={142} s={15} f={C.crema} w={600} o={a}>n = 1,000,000</T>
      {!shown && <T x={40} y={200} s={17} f={C.crema} w={600} o={a}>total copies = ?</T>}
      {shown && (
        <g>
          <T x={40} y={186} s={13} f={C.taupe} o={easeOut(seg(s, 0.9, 1.2))}>total copies</T>
          <T x={40} y={218} s={22} f={C.cinnamon} serif w={700} o={easeOut(seg(s, 0.9, 1.3))}>2,099,719</T>
          <T x={40} y={248} s={15} f={C.cinnamon} o={easeOut(seg(s, 1.1, 1.5))}>÷ 1,000,000</T>
          <T x={40} y={268} s={15} f={C.cinnamon} o={easeOut(seg(s, 1.1, 1.5))}>= 2.10 per append</T>
        </g>
      )}
    </Svg>
  );
}

// 19 · Prove it 3: multipush(k) makes every operation a spike.
export function Q3({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const a = easeOut(seg(t, 0.1, 0.6));
  const op = Math.min(9, Math.floor(s / 0.14));
  const q = clamp((s - op * 0.14) / 0.14);
  const level = shown ? (s >= 1.4 ? 0 : op % 2 === 0 ? q : 1 - q) : 0;
  const BASE = 260;
  return (
    <Svg label="With multipush of k keys added, alternating multipush of 1,000 and multipop of 1,000 makes every one of 1,000 operations cost 1,000: 1,000,000 in all" h={360}>
      <T x={40} y={24} s={15} f={C.crema} w={600} o={a}>new: multipush(k) pushes k keys in one operation</T>
      <path d={`M 56 100 L 56 ${BASE + 2} L 164 ${BASE + 2} L 164 100`} fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={a} />
      <rect x={60} y={BASE - 150 * level} width={100} height={150 * level} rx={3} fill={C.crema} opacity={0.9} />
      <line x1={220} y1={BASE} x2={520} y2={BASE} stroke={C.mocha} />
      {Array.from({ length: 10 }, (_, k) => {
        const h = shown ? 150 * easeOut(seg(s, 0.14 * k, 0.14 * k + 0.2)) : 0;
        return <rect key={k} x={220 + 30 * k} y={BASE - h} width={22} height={h} rx={3} fill={C.cherry} />;
      })}
      {shown && (
        <g>
          <T x={40} y={300} s={15} f={C.crema} w={600} o={easeOut(seg(s, 1.5, 1.9))}>1,000 operations, k = 1,000</T>
          <T x={40} y={322} s={15} f={C.cherryText} w={600} o={easeOut(seg(s, 1.5, 1.9))}>cost 1,000,000: 1,000 each</T>
        </g>
      )}
    </Svg>
  );
}
