import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** Four executor boxes down the left (the big side's tasks), each a slot a small-side copy can land in. */
function Execs({ k = 1, f = C.latte }: { k?: number; f?: string }) {
  return (
    <g opacity={k}>
      <T x={25} y={18} s={11} f={C.latte}>
        big · 200,000 rows, across executors
      </T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25} y={28 + i * 36} width={220} height={28} rx={3} fill={C.cocoa} stroke={f} strokeWidth={1.3} />
      ))}
    </g>
  );
}
/** The small side, a short box on the right. */
function Small({ k = 1, w = 40, f = C.second }: { k?: number; w?: number; f?: string }) {
  return (
    <g opacity={k}>
      <T x={400} y={18} s={11} f={C.latte}>
        small · 500 rows
      </T>
      <rect x={400} y={28} width={w} height={28} rx={3} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
    </g>
  );
}
/** Copies of the small side flying into each executor slot, by `q(i)`. */
function Copies({ q }: { q: (i: number) => number }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const p = q(i);
        return <rect key={i} x={lerp(400, 195, p)} y={lerp(28, 28 + i * 36, p)} width={40} height={28} rx={3} fill="none" stroke={C.second} strokeWidth={1.5} opacity={p > 0 ? 1 : 0} />;
      })}
    </g>
  );
}

// 1 · Hook. A huge side and a tiny side: two options drawn faintly, copy the small one everywhere, or shuffle both.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a small table, joined to a huge one. Copy the small one everywhere, or shuffle both?" h={200}>
      <Execs k={easeOut(seg(t, 0.1, 0.5))} />
      <Small k={easeOut(seg(t, 0.6, 1.0))} />
      <T x={300} y={110} s={12} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        copy the small one everywhere?
      </T>
      <T x={300} y={140} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        or shuffle both sides?
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        not a smaller shuffle: maybe none at all
      </T>
    </Svg>
  );
}

// 2 · Under the threshold. The small side is copied into every executor; the big side stays put; Exchange count 0.
export function RevealUnderThreshold({ t }: StepCtx) {
  return (
    <Svg label="measured: zero shuffle Exchanges. The small side is copied whole to every executor." h={200}>
      <Execs />
      <Small />
      <Copies q={(i) => easeInOut(seg(t, 0.4 + i * 0.3, 1.1 + i * 0.3))} />
      <T x={300} y={110} s={12} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        BroadcastHashJoin
      </T>
      <T x={300} y={140} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        shuffle Exchanges: 0
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        the big side never moves
      </T>
    </Svg>
  );
}

// 3 · Predict. The small side's size bar grows past the threshold line.
export function PredictOverThreshold({ t, answer }: StepCtx) {
  const g = easeInOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="the same query, but the small table now grows past the threshold. Still copied everywhere?" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the small side's estimated size
      </T>
      <rect x={25} y={36} width={lerp(60, 420, g)} height={16} fill={g > 0.75 ? C.cherryText : C.second} />
      <line x1={330} y1={28} x2={330} y2={62} stroke={C.focus} strokeWidth={2} />
      <T x={330} y={80} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        threshold: 10 MB
      </T>
      <AnswerRow y={130} label="still broadcast?" answer={answer} value="no: full fallback" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="the limit is a wall, not a guideline" />
    </Svg>
  );
}

// 4 · Full fallback. No copies; Exchange bars on both sides; SortMergeJoin.
export function RevealFullFallback({ t }: StepCtx) {
  const e = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="measured: no broadcast at all. A real shuffle join, on both sides, instead." h={200}>
      <Execs />
      <Small w={110} f={C.cherryText} />
      <rect x={258} y={28} width={12} height={136 * e} rx={2} fill={C.second} />
      <rect x={520} y={28} width={12} height={36 * e} rx={2} fill={C.second} />
      <T x={300} y={110} s={12} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        SortMergeJoin
      </T>
      <T x={300} y={140} s={11} f={C.second} o={easeOut(seg(t, 2.0, 2.4))}>
        Exchange × 2, both sides pay
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        one number changed the whole plan's shape
      </T>
    </Svg>
  );
}

// 5 · Predict. Under the threshold again, but the condition is big.k < small.k: no equality to hash.
export function PredictNonEqui({ t, answer }: StepCtx) {
  return (
    <Svg label="same small table, under threshold, but the join condition is non-equi now. Same mechanism?" h={200}>
      <Cell x={25} y={24} w={140} h={30} label="big.k = small.k" o={easeOut(seg(t, 0.1, 0.4)) * (1 - 0.6 * easeOut(seg(t, 0.8, 1.2)))} />
      <Cell x={200} y={24} w={140} h={30} label="big.k < small.k" stroke={C.second} o={easeOut(seg(t, 0.8, 1.2))} />
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        nothing equal to hash on
      </T>
      <AnswerRow y={140} label="the matching" answer={answer} value="changes entirely" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={184} text="a hash only finds equal keys" />
    </Svg>
  );
}

// 6 · Nested loop. Copies still land; inside one executor, each big row checks every small row: a scan line sweeps pairwise.
export function RevealNestedLoop({ t }: StepCtx) {
  const sw = seg(t, 1.8, 4.2);
  return (
    <Svg label="measured: still no shuffle. But rows are matched pairwise now, not by a hash." h={200}>
      <Execs />
      <Small />
      <Copies q={(i) => easeInOut(seg(t, 0.2 + i * 0.2, 0.8 + i * 0.2))} />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={lerp(30, 190, (sw * 4 + i * 0.25) % 1)}
          y1={30 + i * 36}
          x2={lerp(30, 190, (sw * 4 + i * 0.25) % 1)}
          y2={54 + i * 36}
          stroke={C.focus}
          strokeWidth={2}
          opacity={sw > 0 && sw < 1 ? 1 : 0}
        />
      ))}
      <T x={300} y={110} s={12} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        BroadcastNestedLoopJoin
      </T>
      <T x={300} y={140} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>
        every pair checked, no lookup
      </T>
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="under the threshold, broadcast and no shuffle; over it, a full fallback; non-equi changes the matching itself." h={250}>
      <Row y={40} label="under the limit" value="copied, no shuffle" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="over it" value="a full fallback" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="a comparison" value="pairwise matching" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
