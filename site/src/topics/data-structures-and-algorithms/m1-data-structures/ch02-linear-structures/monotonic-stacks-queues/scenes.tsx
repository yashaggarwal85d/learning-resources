import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the surviving/current element; cinnamon = an eliminated
// or compared element; cherryText = wasted work; taupe/latte = axes, quiet labels; crema = records.
// Every printed number is asserted or printed by examples.py (or traced in the narration's own example).

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

const BARS = [5, 3, 4, 2, 6];
const SRC = [1, 3, -1, -3, 5, 3, 6, 7];

type Ev = { k: 'push' | 'pop'; i: number; by?: number };

/** The next-greater-element run as a list of push/pop events (the same loop as examples.py). */
function monoEvents(a: number[]): Ev[] {
  const st: number[] = [];
  const ev: Ev[] = [];
  a.forEach((x, i) => {
    while (st.length && a[st[st.length - 1]] < x) ev.push({ k: 'pop', i: st.pop()!, by: i });
    st.push(i);
    ev.push({ k: 'push', i });
  });
  return ev;
}

/** The stack and the answered pairs after the first `n` events. */
function monoState(ev: Ev[], n: number) {
  const st: number[] = [];
  const answered: [number, number][] = [];
  ev.slice(0, n).forEach((e) => {
    if (e.k === 'push') st.push(e.i);
    else {
      st.pop();
      answered.push([e.i, e.by!]);
    }
  });
  return { st, answered };
}

/** A bar, optionally labelled under its base. */
function Bar({ x, base, h, w = 28, f = C.crema, o = 1, label, fill = C.cocoa, sw = 1.4 }: { x: number; base: number; h: number; w?: number; f?: string; o?: number; label?: string; fill?: string; sw?: number }) {
  const y = h >= 0 ? base - h : base;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={Math.abs(h)} rx={2} fill={fill} stroke={f} strokeWidth={sw} />
      {label !== undefined && <T x={x + w / 2} y={h >= 0 ? base + 20 : base - 8} s={13} f={f} a="middle">{label}</T>}
    </g>
  );
}

/** An arc from bar a's top to bar b's top, drawn over [from, to]. */
function Arc({ x1, x2, y, t, from, to, f = C.cinnamon, lift = 30 }: { x1: number; x2: number; y: number; t: number; from: number; to: number; f?: string; lift?: number }) {
  const m = (x1 + x2) / 2;
  return <Draw pts={[[x1, y], [lerp(x1, m, 0.5), y - lift * 0.85], [m, y - lift], [lerp(m, x2, 0.5), y - lift * 0.85], [x2, y]]} t={t} from={from} to={to} stroke={f} w={1.5} pen={false} />;
}

/**
 * A monotonic-stack run drawn as bars (left) and the stack as slabs (right, bottom to top), `e` events in
 * (fractional: the current event animates). Popped bars gain a cinnamon arc from the bar that answered them.
 */
function MonoRun({ a, e, x0, dx, base, unit, sx, labels }: { a: number[]; e: number; x0: number; dx: number; base: number; unit: number; sx: number; labels: boolean }) {
  const ev = monoEvents(a);
  const n = Math.floor(clamp(e, 0, ev.length));
  const f = easeInOut(clamp(e - n));
  const { st, answered } = monoState(ev, n);
  const cur = ev[n];
  const seen = n < ev.length ? (cur.k === 'push' ? cur.i : cur.by!) : a.length - 1;
  const bx = (i: number) => x0 + i * dx;
  const slabY = (k: number) => base - 4 - (k + 1) * 22;
  const slabW = (i: number) => a[i] * unit * 0.9;
  return (
    <g>
      <line x1={x0 - 10} y1={base} x2={bx(a.length - 1) + 38} y2={base} stroke={C.mocha} strokeWidth={1.4} />
      {a.map((v, i) => {
        const vis = i <= seen || e >= ev.length;
        const done = answered.some(([p]) => p === i);
        return <Bar key={i} x={bx(i)} base={base} h={v * unit} o={vis ? 1 : 0.18} f={i === seen && e < ev.length ? C.caramel : done ? C.taupe : C.crema} label={labels ? String(v) : undefined} />;
      })}
      {answered.map(([p, by], k) => <Arc key={k} x1={bx(p) + 14} x2={bx(by) + 14} y={base - a[p] * unit - 6} t={1} from={0} to={0.01} />)}
      {cur && cur.k === 'pop' && <Arc x1={bx(cur.i) + 14} x2={bx(cur.by!) + 14} y={base - a[cur.i] * unit - 6} t={f} from={0} to={1} />}
      <line x1={sx - 6} y1={base - 4} x2={sx + 150} y2={base - 4} stroke={C.mocha} strokeWidth={1.4} />
      {st.map((i, k) => {
        const popping = cur && cur.k === 'pop' && k === st.length - 1;
        return <rect key={i} x={sx + (popping ? 40 * f : 0)} y={slabY(k) - (popping ? 26 * f : 0)} width={slabW(i)} height={18} rx={2} fill={C.cocoa} stroke={popping ? C.cinnamon : C.crema} strokeWidth={1.4} opacity={popping ? 1 - f : 1} />;
      })}
      {cur && cur.k === 'push' && f > 0 && (
        <rect x={lerp(bx(cur.i), sx, f)} y={lerp(base - a[cur.i] * unit, slabY(st.length), f)} width={lerp(28, slabW(cur.i), f)} height={lerp(a[cur.i] * unit, 18, f)} rx={2} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.6} />
      )}
      {labels && st.map((i, k) => <T key={`l${i}`} x={sx + slabW(i) + 10} y={slabY(k) + 14} s={13} f={C.latte} o={cur && cur.k === 'pop' && k === st.length - 1 ? 1 - f : 1}>{a[i]}</T>)}
    </g>
  );
}

// 1 · Opening. Bars rise; the shorter ones carry a "waiting" pulse; then a taller bar arrives and every
// shorter bar behind it is answered (arcs) and greyed out: forgotten.
export function Opening({ t }: StepCtx) {
  const base = 190, unit = 22, bx = (i: number) => 150 + i * 62;
  const tall = easeOutBack(seg(t, 1.2, 1.6));
  return (
    <Svg label="Bars rise and wait; a taller bar arrives and every shorter bar before it is answered and forgotten" h={260}>
      <line x1={130} y1={base} x2={460} y2={base} stroke={C.mocha} strokeWidth={1.4} />
      {BARS.slice(0, 4).map((v, i) => {
        const k = easeOutBack(seg(t, 0.1 + i * 0.18, 0.45 + i * 0.18));
        const gone = easeOut(seg(t, 1.6 + (3 - i) * 0.14, 1.9 + (3 - i) * 0.14));
        const pulse = gone > 0 ? 0 : 0.5 + 0.5 * Math.sin(t * 6 + i);
        return (
          <g key={i}>
            <Bar x={bx(i)} base={base} h={v * unit * clamp(k)} f={gone > 0.5 ? C.taupe : C.crema} o={1 - 0.6 * gone} />
            <circle cx={bx(i) + 14} cy={base - v * unit - 12} r={3} fill={C.latte} opacity={k > 0.9 ? pulse * (1 - gone) : 0} />
          </g>
        );
      })}
      <Bar x={bx(4)} base={base} h={BARS[4] * unit * clamp(tall)} f={C.caramel} sw={2} o={tall > 0 ? 1 : 0} />
      {[3, 2, 1, 0].map((i, k) => <Arc key={i} x1={bx(i) + 14} x2={bx(4) + 14} y={base - BARS[i] * unit - 6} t={t} from={1.6 + k * 0.14} to={1.9 + k * 0.14} lift={18 + k * 8} />)}
      <Decode text="forget them" t={t} at={2.2} dur={0.5} x={300} y={236} s={16} f={C.caramel} a="middle" />
    </Svg>
  );
}

// 2 · The problem. A strictly decreasing run of ten bars: from every start, a scan walks right to the end
// and never finds a taller bar. The comparison counter runs to 45 = 10·9/2.
export function Problem({ t }: StepCtx) {
  const n = 10, base = 200, bx = (i: number) => 60 + i * 44;
  const total = (n * (n - 1)) / 2;
  const c = Math.min(total, Math.floor(seg(t, 0.4, 2.8) * total + 1e-9));
  // comparison c belongs to start s, probe j
  let s = 0, left = c;
  while (s < n - 1 && left >= n - 1 - s) {
    left -= n - 1 - s;
    s++;
  }
  const j = s + 1 + left;
  const doneAll = c >= total;
  return (
    <Svg label="A strictly decreasing run of bars: from every start the scan walks to the end without finding a taller bar, and the comparisons pile up" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>next taller bar to the right?</T>
      <line x1={40} y1={base} x2={500} y2={base} stroke={C.mocha} strokeWidth={1.4} />
      {Array.from({ length: n }, (_, i) => (
        <Bar key={i} x={bx(i)} base={base} h={(n - i) * 13} f={!doneAll && i === s ? C.caramel : C.crema} o={easeOut(seg(t, i * 0.03, 0.2 + i * 0.03))} />
      ))}
      {!doneAll && c > 0 && j < n && (
        <g>
          <line x1={bx(s) + 14} y1={base + 14} x2={bx(j) + 14} y2={base + 14} stroke={C.cinnamon} strokeWidth={2} />
          <circle cx={bx(j) + 14} cy={base + 14} r={5} fill={C.cinnamon} />
        </g>
      )}
      <T x={30} y={250} s={13} f={C.latte}>comparisons</T>
      <T x={150} y={251} s={16} f={doneAll ? C.cherryText : C.crema}>{c}</T>
      <T x={200} y={250} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>= n(n&minus;1)/2 at n = 10</T>
    </Svg>
  );
}

// 3 · The invariant. One left-to-right pass: each bar is pushed onto the stack (slabs, widest at the bottom);
// a taller arrival pops the shorter tops first, and each pop draws the arc to the bar that answered it.
export function Invariant({ t }: StepCtx) {
  const a = [3, 1, 2, 5, 4, 6];
  const ev = monoEvents(a);
  const e = seg(t, 0.3, 3.3) * ev.length;
  return (
    <Svg label="One pass left to right: each bar pushed onto a stack kept taller at the bottom; a taller arrival pops the shorter tops, which get their answer" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>one pass; the stack stays taller at the bottom</T>
      <MonoRun a={a} e={e} x0={40} dx={50} base={220} unit={22} sx={380} labels={false} />
      <T x={380} y={244} s={13} f={C.latte}>stack</T>
      <T x={30} y={268} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.0, 1.4))}>popped = answered by the bar that pushed it off</T>
    </Svg>
  );
}

// 4 · Predict: the stack right before 6 is pushed. Before answering, 5, 3, 4, 2 arrive and 6 hovers with a
// question over an empty stack. After answering, the run replays: 3 is popped by 4, and 5, 4, 2 remain.
export function StackPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const ev = monoEvents(BARS);
  const before6 = ev.findIndex((x) => x.by === 4);
  const e = answered ? seg(s, 0.2, 2.2) * before6 : 0;
  const base = 200, unit = 24;
  return (
    <Svg label="Bars five, three, four, two arrive with six about to come; the stack's contents right before six is pushed" h={290}>
      {!answered && (
        <g>
          <line x1={30} y1={base} x2={300} y2={base} stroke={C.mocha} strokeWidth={1.4} />
          {BARS.slice(0, 4).map((v, i) => <Bar key={i} x={40 + i * 50} base={base} h={v * unit * clamp(easeOutBack(seg(t, i * 0.2, 0.35 + i * 0.2)))} label={String(v)} />)}
          <Bar x={40 + 4 * 50} base={base - 8 + 6 * Math.sin(t * 4)} h={BARS[4] * unit} f={C.caramel} label="6" o={easeOut(seg(t, 0.9, 1.2))} />
          <line x1={374} y1={base - 4} x2={530} y2={base - 4} stroke={C.mocha} strokeWidth={1.4} />
          <T x={450} y={base - 40} s={22} f={C.caramel} a="middle" o={0.6 + 0.4 * Math.sin(t * 3)}>?</T>
          <T x={30} y={270} s={16} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>stack, right before 6 is pushed?</T>
        </g>
      )}
      {answered && (
        <g>
          <MonoRun a={BARS.slice(0, 4)} e={e} x0={40} dx={50} base={base} unit={unit} sx={380} labels />
          <Bar x={40 + 4 * 50} base={base} h={BARS[4] * unit} f={C.caramel} label="6" o={0.5} />
          <Decode text="3 popped by 4" t={s} at={1.0} dur={0.5} x={30} y={252} s={13} f={C.cinnamon} />
          <Decode text="5, 4, 2 still waiting" t={s} at={2.2} dur={0.6} x={30} y={276} s={14} f={C.caramel} />
          <Reticle x={455} y={base - 40} w={190} h={88} t={s} at={2.4} />
        </g>
      )}
    </Svg>
  );
}

// 5 · Why O(n). Each bar earns one placement token when pushed and can spend it once when thrown away;
// the two tallies grow side by side and the throwaway row can never pass the placement row.
export function WhyLinear({ t }: StepCtx) {
  const ev = monoEvents(BARS);
  const e = Math.floor(seg(t, 0.3, 2.6) * ev.length + 1e-9);
  const done = ev.slice(0, e);
  const pushes = done.filter((x) => x.k === 'push');
  const pops = done.filter((x) => x.k === 'pop');
  const n = BARS.length;
  const cellX = (i: number) => 200 + i * 40;
  const cap = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="Placements and throwaways tallied side by side: every throwaway uses up one earlier placement, so the total is at most twice the number of bars" h={270}>
      <T x={30} y={28} s={13} f={C.taupe}>five bars: 5, 3, 4, 2, 6</T>
      <T x={30} y={84} s={14} f={C.caramel} serif>placed</T>
      <T x={30} y={144} s={14} f={C.cinnamon} serif>thrown away</T>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={cellX(i)} y={64} width={30} height={30} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" />
          <rect x={cellX(i)} y={124} width={30} height={30} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" />
        </g>
      ))}
      {pushes.map((p, k) => <rect key={`p${k}`} x={cellX(p.i) + 4} y={68} width={22} height={22} rx={2} fill={C.caramel} opacity={0.9} />)}
      {pops.map((p, k) => (
        <g key={`q${k}`}>
          <rect x={cellX(p.i) + 4} y={128} width={22} height={22} rx={2} fill={C.cinnamon} opacity={0.9} />
          <line x1={cellX(p.i) + 15} y1={96} x2={cellX(p.i) + 15} y2={122} stroke={C.cinnamon} strokeWidth={1.4} />
        </g>
      ))}
      {Array.from({ length: n }, (_, i) => <T key={i} x={cellX(i) + 15} y={184} s={13} f={C.latte} a="middle">{BARS[i]}</T>)}
      <g opacity={cap}>
        <path d={`M ${cellX(n - 1) + 44} 64 h 10 V 154 h -10`} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={cellX(n - 1) + 62} y={114} s={15} f={C.caramel}>&le; 2n</T>
      </g>
      <Decode text="no bar is charged twice" t={t} at={3.1} dur={0.6} x={30} y={236} s={14} f={C.latte} />
    </Svg>
  );
}

// 6 · Sliding-window maximum, the naive way. A width-3 window slides over the source's row; every stop
// rescans all three bars, and each bar collects a look mark per scan, red when it was already looked at.
export function WindowProblem({ t }: StepCtx) {
  const k = 3, base = 130, unit = 11, bx = (i: number) => 60 + i * 60;
  const stops = SRC.length - k + 1;
  const p = seg(t, 0.3, 3.0) * stops;
  const w = Math.min(stops - 1, Math.floor(p));
  const scan = clamp(p - w);
  const looks = (i: number) => {
    let c = 0;
    for (let s = 0; s <= w; s++) {
      if (i < s || i >= s + k) continue;
      if (s < w || (s === w && (i - s) / k < scan)) c++;
    }
    return c;
  };
  return (
    <Svg label="A width-three window slides across the row; every stop rescans all three bars, and the repeat looks pile up above them" h={270}>
      <T x={30} y={24} s={13} f={C.taupe}>width-3 window, rescanned at every stop</T>
      <line x1={40} y1={base} x2={540} y2={base} stroke={C.mocha} strokeWidth={1.2} />
      <rect x={bx(w) - 10} y={40} width={k * 60 - 12} height={176} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.8} />
      {SRC.map((v, i) => (
        <g key={i}>
          <Bar x={bx(i)} base={base} h={v * unit} label={String(v)} f={i >= w && i < w + k ? C.crema : C.taupe} />
          {Array.from({ length: looks(i) }, (_, m) => (
            <rect key={m} x={bx(i) + 4 + m * 8} y={226} width={6} height={12} rx={1} fill={m === 0 ? C.latte : C.cherryText} />
          ))}
        </g>
      ))}
      <T x={30} y={262} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>red: looked at again</T>
    </Svg>
  );
}

type Dv = { k: 'back' | 'push' | 'front' | 'out'; i: number };

/** The sliding-window-maximum run (examples.py's loop) as events. */
function dequeEvents(a: number[], k: number): Dv[] {
  const dq: number[] = [];
  const ev: Dv[] = [];
  a.forEach((x, i) => {
    while (dq.length && a[dq[dq.length - 1]] < x) ev.push({ k: 'back', i: dq.pop()! });
    dq.push(i);
    ev.push({ k: 'push', i });
    while (dq[0] <= i - k) ev.push({ k: 'front', i: dq.shift()! });
    if (i >= k - 1) ev.push({ k: 'out', i });
  });
  return ev;
}

/** The deque run drawn as bars, a window bracket, the deque as a row of slots, and the outputs so far. */
function DequeRun({ e, k, base, top, dqY, outs }: { e: number; k: number; base: number; top: number; dqY: number; outs: boolean }) {
  const a = SRC;
  const ev = dequeEvents(a, k);
  const n = Math.floor(clamp(e, 0, ev.length));
  const f = easeInOut(clamp(e - n));
  const dq: number[] = [];
  const out: number[] = [];
  let i = -1;
  ev.slice(0, n).forEach((x) => {
    if (x.k === 'back') dq.pop();
    else if (x.k === 'push') {
      dq.push(x.i);
      i = x.i;
    } else if (x.k === 'front') dq.shift();
    else out.push(x.i);
  });
  const cur = ev[n];
  const bx = (j: number) => 60 + j * 60;
  const unit = 10;
  const wi = Math.max(0, i - k + 1);
  return (
    <g>
      <line x1={40} y1={base} x2={540} y2={base} stroke={C.mocha} strokeWidth={1.2} />
      {i >= 0 && <rect x={bx(wi) - 10} y={top} width={(i - wi + 1) * 60 - 12} height={base - top + 50} rx={6} fill="none" stroke={C.latte} strokeWidth={1.4} strokeDasharray="5 4" />}
      {a.map((v, j) => <Bar key={j} x={bx(j)} base={base} h={v * unit} label={String(v)} o={j <= i || (cur?.k === 'push' && cur.i === j) ? 1 : 0.2} f={dq[0] === j ? C.caramel : C.crema} />)}
      <T x={30} y={dqY - 10} s={13} f={C.taupe}>deque: front</T>
      {dq.map((j, m) => {
        const leavingBack = cur?.k === 'back' && m === dq.length - 1;
        const leavingFront = cur?.k === 'front' && m === 0;
        const leave = leavingBack || leavingFront ? f : 0;
        return (
          <g key={j} opacity={1 - leave} transform={`translate(${leavingFront ? -40 * leave : leavingBack ? 40 * leave : 0} ${-14 * leave})`}>
            <rect x={150 + m * 54} y={dqY} width={46} height={30} rx={3} fill={C.cocoa} stroke={m === 0 ? C.caramel : leavingBack ? C.cinnamon : C.crema} strokeWidth={m === 0 ? 2 : 1.4} />
            <T x={173 + m * 54} y={dqY + 20} s={13} f={m === 0 ? C.caramel : C.crema} a="middle">{a[j]}</T>
          </g>
        );
      })}
      {cur?.k === 'push' && f > 0 && (
        <g opacity={f}>
          <rect x={lerp(bx(cur.i) - 9, 150 + dq.length * 54, f)} y={lerp(base + 10, dqY, f)} width={46} height={30} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.6} />
        </g>
      )}
      {outs && <T x={30} y={dqY + 62} s={13} f={C.latte}>window max</T>}
      {outs && out.map((j, m) => <T key={j} x={150 + m * 46} y={dqY + 62} s={14} f={m === out.length - 1 ? C.caramel : C.crema}>{maxAt(j)}</T>)}
    </g>
  );
}

/** The window maximum ending at index j (k = 3), recomputed for the output row. */
function maxAt(j: number) {
  return Math.max(...SRC.slice(Math.max(0, j - 2), j + 1));
}

// 7 · The monotonic deque on the source's own example (k = 3): the back drops shorter bars as each new bar
// arrives, the front drops whatever slid out of the window, and the front slot is always the window's max.
export function MonotonicDeque({ t }: StepCtx) {
  const ev = dequeEvents(SRC, 3);
  const e = seg(t, 0.2, 3.7) * ev.length;
  return (
    <Svg label="The monotonic deque over one, three, minus one, minus three, five, three, six, seven with a window of three: back drops shorter bars, front drops expired ones, front is the max" h={300}>
      <DequeRun e={e} k={3} base={100} top={16} dqY={200} outs />
    </Svg>
  );
}

// 8 · Predict: the deque once the window first covers [-1, -3, 5]. Before answering, the run goes up to
// -3 and 5 hovers. After answering, 5 arrives and clears -3, -1 and 3 off the back; only 5 remains.
export function DequePredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const ev = dequeEvents(SRC, 3);
  const push5 = ev.findIndex((x) => x.k === 'push' && x.i === 4);
  const before = ev.findIndex((x) => x.k === 'back' && x.i === 3);
  const e = answered ? lerp(before, push5 + 1, clamp(seg(s, 0.3, 2.0))) : before * clamp(seg(t, 0, 1.5));
  return (
    <Svg label="The deque as the window reaches minus one, minus three, five: five arrives and clears every shorter entry off the back" h={300}>
      <DequeRun e={e} k={3} base={100} top={16} dqY={200} outs={false} />
      {!answered && <T x={30} y={288} s={16} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>deque, once the window covers [-1, -3, 5]?</T>}
      {answered && (
        <>
          <Decode text="just 5" t={s} at={2.0} dur={0.4} x={30} y={288} s={16} f={C.caramel} />
          <Reticle x={173} y={215} w={66} h={46} t={s} at={2.2} />
        </>
      )}
    </Svg>
  );
}

// 9 · The two idioms compared. Top: the array's resize schedule (1, 2, 4, 8, 16) is drawn as dashed spikes
// before any element arrives, then filled in. Bottom: the stack's throwaways appear only where the data puts
// them, as bars arrive.
export function Compared({ t }: StepCtx) {
  const n = 20, x0 = 60, dx = 24;
  const plan = easeOut(seg(t, 0.3, 0.8));
  const fill = seg(t, 1.0, 2.2) * n;
  const sched = [1, 2, 4, 8, 16];
  const pops = (() => {
    // throwaway counts per arrival for a fixed row of heights (shape only)
    const h = [4, 2, 6, 3, 1, 5, 2, 7, 4, 3, 2, 8, 1, 3, 6, 2, 4, 9, 3, 5];
    const ev = monoEvents(h);
    const c = Array(n).fill(0);
    ev.forEach((x) => x.k === 'pop' && c[x.by!]++);
    return c;
  })();
  const live = seg(t, 2.4, 3.6) * n;
  return (
    <Svg label="An array's resize spikes drawn ahead of time as a fixed schedule, against a monotonic stack's throwaways that appear only where the data puts them" h={300}>
      <T x={30} y={26} s={14} f={C.cinnamon} serif>Chapter 1: a schedule, fixed in advance</T>
      <line x1={x0 - 10} y1={120} x2={x0 + n * dx} y2={120} stroke={C.mocha} strokeWidth={1.2} />
      {Array.from({ length: n }, (_, i) => {
        const spike = sched.includes(i);
        const h = spike ? 20 + i * 3 : 6;
        const on = i < fill;
        return (
          <g key={i}>
            {spike && <rect x={x0 + i * dx} y={120 - h} width={14} height={h} fill="none" stroke={C.cinnamon} strokeWidth={1.2} strokeDasharray="3 3" opacity={plan} />}
            <rect x={x0 + i * dx} y={120 - h} width={14} height={h} fill={C.cinnamon} opacity={on ? 0.85 : 0} />
          </g>
        );
      })}
      <T x={30} y={166} s={14} f={C.caramel} serif o={easeOut(seg(t, 2.2, 2.5))}>This chapter: a rule, every step</T>
      <line x1={x0 - 10} y1={260} x2={x0 + n * dx} y2={260} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 2.2, 2.5))} />
      {pops.map((c, i) => {
        const on = i < live;
        const h = 6 + c * 14;
        return <rect key={i} x={x0 + i * dx} y={260 - h * easeOutBack(clamp(live - i))} width={14} height={h * easeOutBack(clamp(live - i))} fill={C.caramel} opacity={on ? 0.85 : 0} />;
      })}
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>the data decides when something is thrown out</T>
    </Svg>
  );
}

// 10 · Prove it. Ten checks against brute force tick in; then the push+pop totals count up beside 2n for
// n = 100 to 100,000 (examples.py's printed table), each bar pair almost exactly level.
export function ProveIt({ t }: StepCtx) {
  const rows: [string, number, number][] = [
    ['100', 193, 200],
    ['1,000', 1993, 2000],
    ['10,000', 19995, 20000],
    ['100,000', 199993, 200000],
  ];
  const checks = Math.floor(seg(t, 0.2, 1.2) * 10 + 1e-9);
  return (
    <Svg label="Every answer matches brute force; push plus pop work counted beside two n from one hundred to one hundred thousand bars, almost level each time" h={300}>
      <T x={30} y={28} s={13} f={C.latte}>same answers as brute force</T>
      {Array.from({ length: 10 }, (_, i) => (
        <Draw key={i} pts={[[330 + i * 22, 22], [336 + i * 22, 28], [346 + i * 22, 14]]} t={t} from={0.2 + i * 0.1} to={0.3 + i * 0.1} stroke={C.caramel} w={2} pen={false} o={i < checks || i === checks ? 1 : 0} />
      ))}
      <T x={30} y={70} s={13} f={C.taupe}>n</T>
      <T x={130} y={70} s={13} f={C.caramel}>pushes + pops</T>
      <T x={430} y={70} s={13} f={C.taupe}>2n</T>
      {rows.map(([label, v, cap], r) => {
        const k = easeInOut(seg(t, 1.3 + r * 0.45, 2.0 + r * 0.45));
        const y = 100 + r * 46;
        const val = Math.round(v * k);
        return (
          <g key={label} opacity={easeOut(seg(t, 1.3 + r * 0.45, 1.5 + r * 0.45))}>
            <T x={30} y={y + 4} s={13} f={C.latte}>{label}</T>
            <rect x={130} y={y + 10} width={290} height={6} fill={C.cocoa} />
            <rect x={130} y={y + 10} width={290 * (v / cap) * k} height={6} fill={C.caramel} />
            <line x1={420} y1={y + 6} x2={420} y2={y + 20} stroke={C.latte} strokeWidth={1.4} />
            <T x={130} y={y + 4} s={13} f={C.caramel}>{val.toLocaleString('en-US')}</T>
            <T x={430} y={y + 4} s={13} f={C.taupe}>{cap.toLocaleString('en-US')}</T>
          </g>
        );
      })}
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>never past 2n: measured, not just claimed</T>
    </Svg>
  );
}
