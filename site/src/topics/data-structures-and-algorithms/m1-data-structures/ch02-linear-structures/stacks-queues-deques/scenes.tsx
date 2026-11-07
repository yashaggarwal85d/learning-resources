import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the structure/end this step is about; cinnamon = the
// compared alternative (the other implementation, or the other end); cherryText = the cost or what
// breaks; taupe/latte = quiet labels; crema = records. Every printed number is asserted in examples.py.

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

/** One record slot. */
function Cell({ x, y, w = 30, f = C.crema, o = 1, fill = C.cocoa, sw = 1.4 }: { x: number; y: number; w?: number; f?: string; o?: number; fill?: string; sw?: number }) {
  return <rect x={x} y={y} width={w} height={w} rx={3} fill={fill} stroke={f} strokeWidth={sw} opacity={o} />;
}

/** A short arrow from a to b that draws itself over [from, to]. */
function Arrow({ a, b, t, from, to, f = C.caramel, w = 1.8 }: { a: Pt; b: Pt; t: number; from: number; to: number; f?: string; w?: number }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const h = (da: number) => `${tip[0] - 7 * Math.cos(ang + da)} ${tip[1] - 7 * Math.sin(ang + da)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={f} strokeWidth={w} />
      <path d={`M${tip[0]} ${tip[1]} L${h(0.45)} M${tip[0]} ${tip[1]} L${h(-0.45)}`} stroke={f} strokeWidth={w} fill="none" />
    </g>
  );
}

/** A cross that draws itself (two strokes). */
function Cross({ x, y, t, at, r = 9, f = C.cherryText }: { x: number; y: number; t: number; at: number; r?: number; f?: string }) {
  return (
    <g>
      <Draw pts={[[x - r, y - r], [x + r, y + r]]} t={t} from={at} to={at + 0.2} stroke={f} w={2.4} pen={false} />
      <Draw pts={[[x + r, y - r], [x - r, y + r]]} t={t} from={at + 0.15} to={at + 0.35} stroke={f} w={2.4} pen={false} />
    </g>
  );
}

// 1 · Which end may you touch? A sequence appears; probes test the front, the middle and the back,
// each with a question mark, because the sequence itself carries no rule. The rule is today's topic.
export function Opening({ t }: StepCtx) {
  const xs = Array.from({ length: 6 }, (_, i) => 165 + i * 46);
  const probes: [number, number][] = [[xs[0] + 18, 0.9], [xs[2] + 41, 1.1], [xs[5] + 18, 1.3]];
  return (
    <Svg label="A row of records with probes at the front, the middle and the back, each asking whether that end may be touched" h={260}>
      <T x={300} y={40} s={13} f={C.taupe} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>an array or a list: a sequence, no rule</T>
      {xs.map((x, i) => {
        const k = easeOutBack(seg(t, 0.1 + i * 0.08, 0.45 + i * 0.08));
        return <Cell key={i} x={x} y={100 - 20 * (1 - clamp(k))} w={36} o={clamp(k)} />;
      })}
      {probes.map(([x, at], i) => {
        const k = easeOut(seg(t, at, at + 0.35));
        const pulse = 0.65 + 0.35 * Math.sin((t - at) * 6);
        const px = x;
        return (
          <g key={i} opacity={k}>
            <line x1={px} y1={150 + 18 * (1 - k)} x2={px} y2={142} stroke={C.caramel} strokeWidth={1.6} />
            <path d={`M${px - 5} ${148} L${px} ${142} L${px + 5} ${148}`} stroke={C.caramel} strokeWidth={1.6} fill="none" />
            <T x={px} y={176} s={16} f={C.caramel} a="middle" o={k * pulse}>?</T>
          </g>
        );
      })}
      <Decode text="which end may you touch?" t={t} at={1.9} dur={0.6} x={300} y={226} s={16} f={C.caramel} a="middle" />
    </Svg>
  );
}

// 2 · LIFO. Undo-history entries drop onto the pile one by one (push, top only); then the most recent
// one lifts straight back off the same end (undo = pop).
export function Stack({ t }: StepCtx) {
  const ops = ['type text', 'bold', 'paste', 'delete line'];
  const top = 236;
  const pop = easeInOut(seg(t, 2.0, 2.6));
  const landed = ops.filter((_, i) => t >= 0.2 + i * 0.38 + 0.2).length;
  return (
    <Svg label="Undo-history entries pushed onto the top of a pile one by one, then the most recent popped back off the same top" h={300}>
      <T x={30} y={28} s={13} f={C.taupe}>undo history: push and pop at the top only</T>
      <line x1={180} y1={top + 30} x2={380} y2={top + 30} stroke={C.mocha} strokeWidth={2} />
      {ops.map((op, i) => {
        const at = 0.2 + i * 0.38;
        const k = easeOutBack(seg(t, at, at + 0.35));
        if (k <= 0) return null;
        const last = i === ops.length - 1;
        const y = top - i * 36 - 90 * (1 - clamp(k)) - (last ? 80 * pop : 0);
        const o = clamp(k) * (last ? 1 - pop : 1);
        return (
          <g key={op} opacity={o}>
            <rect x={200} y={y} width={160} height={28} rx={3} fill={C.cocoa} stroke={last ? C.caramel : C.crema} strokeWidth={last ? 2 : 1.4} />
            <T x={280} y={y + 19} s={13} f={last ? C.caramel : C.crema} a="middle">{op}</T>
          </g>
        );
      })}
      <T x={376} y={top - (landed - 1 - (pop > 0.5 ? 1 : 0)) * 36 + 19} s={13} f={C.latte} o={landed > 0 ? 1 : 0}>&larr; top</T>
      <Arrow a={[280, 98]} b={[280, 52]} t={t} from={2.0} to={2.4} f={C.caramel} />
      <T x={296} y={80} s={13} f={C.caramel} o={easeOut(seg(t, 2.1, 2.5))}>undo</T>
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 2.3, 2.8))}>last in, first out</T>
    </Svg>
  );
}

// 3 · FIFO. A new task joins at the back while the one that has waited longest leaves from the front.
export function Queue({ t }: StepCtx) {
  const enter = easeOut(seg(t, 0.4, 1.1));
  const leave = easeInOut(seg(t, 1.3, 2.1));
  const slide = easeInOut(seg(t, 2.1, 2.6));
  const slot = (i: number) => 120 + i * 62;
  const tasks = ['T5', 'T4', 'T3', 'T2', 'T1'];
  return (
    <Svg label="A task queue: a new task joins at the back while the task that has waited longest leaves from the front" h={260}>
      <T x={30} y={34} s={13} f={C.taupe} o={easeOut(seg(t, 0.1, 0.5))}>task queue</T>
      <T x={slot(0) - 20} y={74} s={13} f={C.cinnamon} a="middle" o={easeOut(seg(t, 0.3, 0.7))}>in</T>
      <T x={slot(4) + 70} y={74} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>out</T>
      {tasks.map((name, i) => {
        const first = i === 4;
        const x = slot(i) + (first ? 110 * leave : 62 * slide);
        const o = first ? 1 - leave : 1;
        return (
          <g key={name} opacity={o}>
            <rect x={x} y={92} width={50} height={40} rx={4} fill={C.cocoa} stroke={first ? C.caramel : C.crema} strokeWidth={first ? 2 : 1.4} />
            <T x={x + 25} y={118} s={13} f={first ? C.caramel : C.crema} a="middle">{name}</T>
          </g>
        );
      })}
      {enter > 0 && (
        <g opacity={enter}>
          <rect x={slot(-1) + 62 * slide - 70 * (1 - enter)} y={92} width={50} height={40} rx={4} fill={C.cocoa} stroke={C.cinnamon} strokeWidth={1.8} />
          <T x={slot(-1) + 62 * slide - 70 * (1 - enter) + 25} y={118} s={13} f={C.cinnamon} a="middle">T6</T>
        </g>
      )}
      <T x={slot(4) + 25} y={168} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 1.5, 1.9))}>waited longest</T>
      <T x={30} y={230} s={13} f={C.latte} o={easeOut(seg(t, 2.2, 2.7))}>first in, first out</T>
    </Svg>
  );
}

// 4 · Predict: one structure or two? Before the answer, both ends pulse with push and pop and a dashed
// seam hints at "two stacks glued". After it, the seam vanishes and both ends get their O(1) operations.
export function DequePredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const xs = Array.from({ length: 6 }, (_, i) => 165 + i * 46);
  const seam = answered ? 1 - easeOut(seg(s, 0.2, 0.8)) : easeOut(seg(t, 0.6, 1.1));
  const join = answered ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  const bob = (ph: number) => 6 * Math.sin(t * 4 + ph);
  return (
    <Svg label="A row with both ends active, asking whether supporting push and pop at both ends takes one structure or two" h={260}>
      {xs.map((x, i) => {
        const gap = (1 - join) * seam * (i < 3 ? -8 : 8);
        return <Cell key={i} x={x + gap} y={80} w={36} f={i === 0 || i === 5 ? C.caramel : C.crema} o={easeOut(seg(t, i * 0.06, 0.3 + i * 0.06))} />;
      })}
      <line x1={300} y1={70} x2={300} y2={126} stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 4" opacity={seam} />
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <Arrow a={[90 + bob(0), 92]} b={[150 + bob(0), 92]} t={1} from={0} to={0.01} />
        <Arrow a={[150 - bob(1), 108]} b={[90 - bob(1), 108]} t={1} from={0} to={0.01} />
        <Arrow a={[510 - bob(2), 92]} b={[450 - bob(2), 92]} t={1} from={0} to={0.01} />
        <Arrow a={[450 + bob(3), 108]} b={[510 + bob(3), 108]} t={1} from={0} to={0.01} />
      </g>
      {!answered && <T x={300} y={200} s={18} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>one structure, or two?</T>}
      {answered && (
        <>
          <Decode text="push, pop, peek: O(1)" t={s} at={0.7} dur={0.5} x={120} y={160} s={13} f={C.caramel} a="middle" />
          <Decode text="push, pop, peek: O(1)" t={s} at={0.9} dur={0.5} x={480} y={160} s={13} f={C.caramel} a="middle" />
          <Decode text="one structure" t={s} at={1.4} dur={0.5} x={300} y={214} s={18} f={C.caramel} a="middle" />
          <Reticle x={298} y={98} w={290} h={56} t={s} at={1.6} />
        </>
      )}
    </Svg>
  );
}

// 5 · The deque: both ends lit at once. A record slides in at the front and another at the back together,
// then both leave together. Below, the stack and the queue are the same row with ends disabled.
export function Deque({ t }: StepCtx) {
  const xs = Array.from({ length: 6 }, (_, i) => 185 + i * 40);
  const lit = easeOut(seg(t, 0.1, 0.5));
  const inn = easeOutBack(seg(t, 0.4, 0.9));
  const out = easeInOut(seg(t, 1.1, 1.6));
  const both = inn > 0 && out < 1;
  const mini = (y: number, front: 'off' | 'out' | 'both', back: 'in' | 'both', at: number, label: string) => {
    const k = easeOut(seg(t, at, at + 0.4));
    return (
      <g opacity={k}>
        <T x={30} y={y + 18} s={13} f={C.cinnamon}>{label}</T>
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={240 + i * 26} y={y} width={22} height={22} rx={2} fill={C.cocoa} stroke={C.crema} strokeWidth={1.2} />)}
        {front === 'off' ? <Cross x={222} y={y + 11} t={t} at={at + 0.3} r={6} /> : <Arrow a={[234, y + 11]} b={[200, y + 11]} t={t} from={at + 0.2} to={at + 0.5} f={C.cinnamon} />}
        <Arrow a={[412, y + 6]} b={[376, y + 6]} t={t} from={at + 0.2} to={at + 0.5} f={C.cinnamon} />
        {back === 'both' && <Arrow a={[376, y + 17]} b={[412, y + 17]} t={t} from={at + 0.3} to={at + 0.6} f={C.cinnamon} />}
      </g>
    );
  };
  return (
    <Svg label="A deque with both ends lit: records pushed and popped at the front and the back at the same time; a stack and a queue shown as the same row with ends tied" h={300}>
      {xs.map((x, i) => <Cell key={i} x={x} y={60} w={34} f={i === 0 || i === 5 ? C.caramel : C.crema} sw={i === 0 || i === 5 ? 1.4 + lit : 1.4} />)}
      {both && (
        <>
          <Cell x={xs[0] - 44 - 50 * (1 - clamp(inn)) - 60 * out} y={60} w={34} f={C.caramel} o={clamp(inn) * (1 - out)} />
          <Cell x={xs[5] + 44 + 50 * (1 - clamp(inn)) + 60 * out} y={60} w={34} f={C.caramel} o={clamp(inn) * (1 - out)} />
        </>
      )}
      <T x={xs[0] - 27} y={124} s={13} f={C.caramel} a="middle" o={lit}>front</T>
      <T x={xs[5] + 61} y={124} s={13} f={C.caramel} a="middle" o={lit}>back</T>
      <T x={300} y={150} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>push or pop either end: O(1)</T>
      {mini(190, 'off', 'both', 1.8, 'stack')}
      {mini(236, 'out', 'in', 2.2, 'queue')}
    </Svg>
  );
}

// 6 · Two real designs. Top: a ring buffer fills, wraps around its end, then on full a new array twice the
// size appears and every record is copied across. Bottom: chunked blocks; growing allocates one more block
// and nothing already stored moves.
export function TwoDesigns({ t }: StepCtx) {
  const N = 8;
  const rx = (i: number) => 60 + i * 34;
  // Ring: the back starts at slot 5 and wraps; slot fill order 5,6,7,0,1,2,3,4.
  const order = [5, 6, 7, 0, 1, 2, 3, 4];
  const filled = Math.floor(clamp(seg(t, 0.2, 1.5)) * N + 1e-9);
  const copy = easeInOut(seg(t, 1.7, 2.4));
  const wrapArc = easeOut(seg(t, 0.6, 0.9));
  const bx = (b: number, j: number) => 60 + b * 120 + j * 26;
  const newBlock = easeOutBack(seg(t, 2.5, 3.0));
  const lab = (at: number) => easeOut(seg(t, at, at + 0.4));
  return (
    <Svg label="A ring buffer filling and wrapping, then copied into a new array twice its size; beside it a chunked deque that grows by adding one block while nothing moves" h={310}>
      <T x={30} y={24} s={14} f={C.caramel} serif o={lab(0)}>ring buffer</T>
      <T x={570} y={24} s={13} f={C.caramel} a="end" o={lab(3.0)}>Rust: growable ring buffer</T>
      {Array.from({ length: N }, (_, i) => {
        const k = order.indexOf(i);
        const on = k < filled;
        return <Cell key={i} x={rx(i)} y={38} w={28} f={C.caramel} fill={on ? C.mocha : C.cocoa} o={1 - 0.6 * copy} />;
      })}
      <path d={`M${rx(7) + 28} 52 C ${rx(7) + 56} 52, ${rx(7) + 56} 90, ${rx(4)} 90 L ${rx(0) - 10} 90 C ${rx(0) - 30} 90, ${rx(0) - 30} 52, ${rx(0)} 52`} fill="none" stroke={C.latte} strokeWidth={1.3} strokeDasharray="4 4" opacity={wrapArc * (1 - copy)} />
      <T x={rx(4)} y={108} s={13} f={C.latte} a="middle" o={wrapArc * (1 - copy)}>wraps around</T>
      {copy > 0 && (
        <>
          {Array.from({ length: 16 }, (_, i) => <Cell key={i} x={60 + i * 30} y={88} w={24} f={C.caramel} o={copy} />)}
          {order.map((src, k) => {
            const f = easeInOut(seg(t, 1.8 + k * 0.05, 2.3 + k * 0.05));
            return <rect key={k} x={lerp(rx(src) + 2, 62 + k * 30, f)} y={lerp(40, 90, f)} width={lerp(24, 20, f)} height={lerp(24, 20, f)} rx={2} fill={C.mocha} opacity={f > 0 ? 1 : 0} />;
          })}
          <T x={300} y={132} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>full: new array, copy everything</T>
        </>
      )}
      <T x={30} y={174} s={14} f={C.cinnamon} serif o={lab(0.4)}>chunked blocks</T>
      <Decode text="C++: chunked" t={t} at={3.2} dur={0.5} x={570} y={174} s={13} f={C.cinnamon} a="end" />
      {[0, 1, 2].map((b) => (
        <g key={b} opacity={lab(0.4 + b * 0.15)}>
          <rect x={bx(b, 0) - 6} y={190} width={110} height={36} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
          {[0, 1, 2, 3].map((j) => <rect key={j} x={bx(b, j)} y={196} width={22} height={24} rx={2} fill={C.mocha} />)}
        </g>
      ))}
      {newBlock > 0 && (
        <g opacity={clamp(newBlock)} transform={`translate(0 ${-24 * (1 - clamp(newBlock))})`}>
          <rect x={bx(3, 0) - 6} y={190} width={110} height={36} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />
          <rect x={bx(3, 0)} y={196} width={22} height={24} rx={2} fill={C.mocha} />
        </g>
      )}
      <T x={30} y={254} s={13} f={C.latte} o={lab(2.6)}>grow: one more block</T>
      <T x={30} y={278} s={13} f={C.cinnamon} o={lab(2.9)}>nothing already stored moves</T>
    </Svg>
  );
}

// 7 · Predict: push onto the front of a chunked deque. An iterator points in from above and a reference
// from below. After the answer: a new block lands in front, the iterator turns red and is crossed out, the
// reference keeps its tick; a reallocating vector underneath loses both.
export function InvalidatePredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const bx = (b: number, j: number) => 150 + b * 110 + j * 24;
  const land = answered ? easeOutBack(seg(s, 0.1, 0.6)) : 0;
  const it = answered ? easeOut(seg(s, 0.6, 0.9)) : 0;
  const itX = bx(1, 1) + 10;
  const refX = bx(2, 2) + 10;
  const vec = answered ? easeOut(seg(s, 1.6, 2.0)) : 0;
  return (
    <Svg label="A chunked deque with an iterator and a reference into it; after a push to the front, the iterator is invalid and the reference still works" h={300}>
      {[0, 1, 2].map((b) => (
        <g key={b} opacity={easeOut(seg(t, b * 0.1, 0.4 + b * 0.1))}>
          <rect x={bx(b, 0) - 5} y={80} width={100} height={34} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
          {[0, 1, 2, 3].map((j) => <rect key={j} x={bx(b, j)} y={86} width={20} height={22} rx={2} fill={C.mocha} />)}
        </g>
      ))}
      <g opacity={answered ? clamp(land) : 0.35 + 0.25 * Math.sin(t * 4)} transform={`translate(${answered ? -30 * (1 - clamp(land)) : -30} 0)`}>
        <rect x={bx(-1, 0) - 5} y={80} width={100} height={34} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.8} strokeDasharray={answered ? undefined : '4 4'} />
        <rect x={bx(-1, 3)} y={86} width={20} height={22} rx={2} fill={answered ? C.mocha : 'none'} stroke={C.caramel} />
      </g>
      <T x={bx(-1, 2)} y={70} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 0.3, 0.7))}>push_front</T>
      <line x1={itX} y1={30} x2={itX} y2={78} stroke={it > 0 ? C.cherryText : C.caramel} strokeWidth={1.8} />
      <path d={`M${itX - 5} 72 L${itX} 78 L${itX + 5} 72`} stroke={it > 0 ? C.cherryText : C.caramel} strokeWidth={1.8} fill="none" />
      <T x={itX + 10} y={36} s={13} f={it > 0 ? C.cherryText : C.caramel}>iterator</T>
      {answered && <Cross x={itX} y={52} t={s} at={0.6} r={8} />}
      <line x1={refX} y1={164} x2={refX} y2={116} stroke={C.cinnamon} strokeWidth={1.8} />
      <path d={`M${refX - 5} 122 L${refX} 116 L${refX + 5} 122`} stroke={C.cinnamon} strokeWidth={1.8} fill="none" />
      <T x={refX - 10} y={180} s={13} f={C.cinnamon} a="end">reference</T>
      {answered && <Draw pts={[[refX + 12, 146], [refX + 18, 154], [refX + 30, 136]]} t={s} from={1.0} to={1.3} stroke={C.caramel} w={2.4} pen={false} />}
      {!answered && <T x={300} y={230} s={18} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>push_front(): what survives?</T>}
      {answered && (
        <>
          <Decode text="iterator invalid, reference still good" t={s} at={1.1} dur={0.6} x={300} y={216} s={13} f={C.caramel} a="middle" />
          <g opacity={vec}>
            <T x={30} y={262} s={13} f={C.latte}>vector reallocates:</T>
            {[0, 1, 2, 3, 4, 5].map((j) => <rect key={j} x={240 + j * 22} y={248} width={18} height={18} rx={2} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.2} />)}
            <T x={384} y={262} s={13} f={C.cherryText}>both die</T>
          </g>
        </>
      )}
    </Svg>
  );
}

// 8 · Back to the problem. Stack, queue, deque as more and more access at the ends (arrows draw in), then
// the two designs' opposite trade: one copies on growth, the other never moves but loses iterators.
export function Verdict({ t }: StepCtx) {
  const row = (y: number, name: string, at: number, arrows: [Pt, Pt][]) => {
    const k = easeOut(seg(t, at, at + 0.35));
    return (
      <g opacity={k}>
        <T x={30} y={y + 16} s={15} f={C.caramel} serif>{name}</T>
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={200 + i * 26} y={y} width={22} height={22} rx={2} fill={C.cocoa} stroke={C.crema} strokeWidth={1.2} />)}
        {arrows.map(([a, b], i) => <Arrow key={i} a={[a[0], y + a[1]]} b={[b[0], y + b[1]]} t={t} from={at + 0.2 + i * 0.1} to={at + 0.45 + i * 0.1} />)}
      </g>
    );
  };
  const trade = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="Stack, queue and deque as more and more access at the ends, then the two deque designs' opposite trade-off" h={300}>
      {row(30, 'Stack', 0.1, [[[372, 6], [336, 6]], [[336, 17], [372, 17]]])}
      {row(72, 'Queue', 0.5, [[[372, 11], [336, 11]], [[194, 11], [158, 11]]])}
      {row(114, 'Deque', 0.9, [[[372, 6], [336, 6]], [[336, 17], [372, 17]], [[158, 6], [194, 6]], [[194, 17], [158, 17]]])}
      <line x1={30} y1={160} x2={570} y2={160} stroke={C.mocha} strokeWidth={1} opacity={trade} />
      <g opacity={trade}>
        <T x={30} y={192} s={13} f={C.caramel}>ring buffer</T>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={200 + i * 20} y={180} width={16} height={16} rx={2} fill={C.mocha} />)}
        {[0, 1, 2, 3].map((i) => {
          const f = easeInOut(seg(t, 2.0 + i * 0.06, 2.5 + i * 0.06));
          return <rect key={i} x={lerp(200 + i * 20, 320 + i * 20, f)} y={180} width={16} height={16} rx={2} fill={C.caramel} opacity={f > 0 ? 0.8 : 0} />;
        })}
        <T x={420} y={192} s={13} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>copies to grow</T>
      </g>
      <g opacity={easeOut(seg(t, 2.3, 2.7))}>
        <T x={30} y={238} s={13} f={C.cinnamon}>chunked</T>
        {[0, 1, 2].map((b) => <rect key={b} x={200 + b * 44} y={226} width={38} height={16} rx={2} fill="none" stroke={C.cinnamon} strokeWidth={1.3} />)}
        <T x={344} y={238} s={13} f={C.latte}>never moves,</T>
        <T x={344} y={262} s={13} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>but iterators die</T>
      </g>
    </Svg>
  );
}

// 9 · Prove it. Top: the deque's cost per operation at n = 10 and n = 10,000 rises to the same height
// (shape only; the timings are machine-dependent). Bottom: a list's pop(0) shifts every element after the
// removed one; the shift counters run to 9 and to 9,999.
export function ProveIt({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.3, 1.0));
  const c1 = Math.round(9 * clamp(seg(t, 1.4, 2.0)));
  const c2 = Math.round(9999 * easeInOut(seg(t, 1.6, 2.8)));
  const w2 = 330 * easeInOut(seg(t, 1.6, 2.8));
  const shift = easeInOut(seg(t, 1.4, 2.0));
  return (
    <Svg label="A real deque's cost per operation flat from ten to ten thousand elements, against a list's pop from the front whose shifts scale with size" h={310}>
      <T x={30} y={28} s={14} f={C.caramel} serif>deque: cost per push/pop</T>
      <T x={120} y={120} s={13} f={C.latte} a="middle">n = 10</T>
      <T x={240} y={120} s={13} f={C.latte} a="middle">n = 10,000</T>
      <rect x={100} y={100 - 46 * g} width={40} height={46 * g} fill={C.caramel} opacity={0.85} />
      <rect x={220} y={100 - 46 * g} width={40} height={46 * g} fill={C.caramel} opacity={0.85} />
      <Draw pts={[[90, 50], [270, 50]]} t={t} from={1.0} to={1.3} stroke={C.latte} w={1.2} dash="4 4" pen={false} />
      <T x={290} y={62} s={13} f={C.caramel} o={easeOut(seg(t, 1.1, 1.4))}>flat</T>
      <T x={30} y={160} s={14} f={C.cinnamon} serif>list, pop(0): elements shifted</T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={170 + i * 20 - (i > 0 ? 20 * shift : 0)} y={176} width={16} height={16} rx={2} fill={i === 0 ? C.cocoa : C.mocha} stroke={i === 0 ? C.cherryText : 'none'} opacity={i === 0 ? 1 - shift : 1} />
      ))}
      <T x={30} y={190} s={13} f={C.latte}>n = 10</T>
      <T x={390} y={190} s={14} f={C.cinnamon}>{c1}</T>
      <T x={30} y={238} s={13} f={C.latte}>n = 10,000</T>
      <rect x={170} y={226} width={w2} height={16} rx={2} fill={C.cinnamon} opacity={0.85} />
      <T x={170 + w2 + 10} y={240} s={14} f={C.cinnamon} o={easeOut(seg(t, 1.6, 1.8))}>{c2.toLocaleString('en-US')}</T>
      <T x={30} y={286} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.5))}>O(1) at both ends: measured, not a label</T>
    </Svg>
  );
}
