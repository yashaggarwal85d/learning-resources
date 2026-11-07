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

/** A set of register bars from x0 at `dx` spacing, base at `base`; heights in units of `u` px. */
function Regs({ x0, base, h, dx = 30, u = 10, o = 1, f = C.crema, hi = -1 }: { x0: number; base: number; h: number[]; dx?: number; u?: number; o?: number; f?: string; hi?: number }) {
  return (
    <g opacity={o}>
      {h.map((v, i) => (
        <g key={i}>
          <rect x={x0 + i * dx} y={base - v * u} width={dx - 8} height={v * u} rx={2} fill={i === hi ? C.focus : f} opacity={i === hi ? 0.9 : 0.6} />
          <line x1={x0 + i * dx - 2} y1={base} x2={x0 + i * dx + dx - 6} y2={base} stroke={C.mocha} strokeWidth={1.5} />
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. Values stream in from the left; each lands in one of eight registers and vanishes; now and then a register
// grows; the estimate is named, and nothing stored.
export function Hook({ t }: StepCtx) {
  const N = 18;
  const grow = [0, 1, 2, 3, 4, 5, 6, 7].map((r) => Array.from({ length: N }, (_, i) => i).filter((i) => i % 8 === r && i % 3 === 0 && t > 0.9 + i * 0.18).length);
  return (
    <Svg label="a handful of small registers estimates how many distinct values passed by, without storing one of them" h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        values streaming past
      </T>
      {Array.from({ length: N }, (_, i) => {
        const p = seg(t, 0.4 + i * 0.18, 0.9 + i * 0.18);
        if (p <= 0 || p >= 1) return null;
        const tx = 341 + (i % 8) * 30;
        return <circle key={i} cx={lerp(25, tx, p)} cy={lerp(70, 140, p)} r={4} fill={C.latte} opacity={1 - clamp((p - 0.7) * 3.3)} />;
      })}
      <Regs x0={330} base={150} h={[2, 1, 3, 1, 2, 2, 1, 2].map((v, i) => v + grow[i])} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={300} y={195} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        an estimate of how many distinct
      </T>
      <T x={300} y={222} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 4.6, 5.0))}>
        and not one of them stored
      </T>
    </Svg>
  );
}

const PA = [2, 4, 1, 3];
const PB = [3, 1, 2, 3];

// 2 · Predict. Two partitions' sketches; after the answer the merged sketch builds, each register the taller of the pair.
export function PredictMergeMatches({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="does merging two sketches from separate partitions match one sketch built over all the combined data?" h={200}>
      <T x={25} y={45} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        partition A
      </T>
      <Regs x0={25} base={110} h={PA} u={12} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={175} y={45} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        partition B
      </T>
      <Regs x0={175} base={110} h={PB} u={12} o={easeOut(seg(t, 0.4, 0.7))} f={C.second} />
      <T x={400} y={45} s={11} f={C.focus} o={v}>
        merged
      </T>
      <Regs x0={400} base={110} h={PA.map((a, i) => Math.max(a, PB[i]) * v)} u={12} o={v} f={C.focus} />
      <AnswerRow y={150} label="merged = one pass?" answer={answer} value="yes, exactly" k={easeOut(seg(t, 1.0, 1.5))} />
      <Verdict answer={answer} y={190} text="the larger value, register by register" />
    </Svg>
  );
}

// 3 · Register run length. One value's hash as hollow (zero) and filled (one) squares; its first squares pick a register;
// the run of hollow squares after them is bracketed; the chosen register grows to that run.
export function RevealRegisterRunLength({ t }: StepCtx) {
  const bits = [1, 0, 0, 0, 0, 1, 0, 1, 1, 0];
  const pick = easeOut(seg(t, 0.9, 1.3));
  const run = easeOut(seg(t, 2.0, 2.4));
  const g = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="each register tracks the longest run of leading zeros it has seen" h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        one value, hashed
      </T>
      {bits.map((b, i) => (
        <rect
          key={i}
          x={25 + i * 26}
          y={52}
          width={20}
          height={20}
          rx={3}
          fill={b && i > 1 ? C.crema : C.cocoa}
          stroke={i < 2 && pick > 0 ? C.second : i >= 2 && i < 5 && run > 0 ? C.focus : C.mocha}
          strokeWidth={i < 2 ? 1.5 + pick : 1.5 + run}
          opacity={easeOut(seg(t, 0.3 + i * 0.05, 0.6 + i * 0.05))}
        />
      ))}
      <rect x={25} y={52} width={46} height={20} rx={3} fill={C.second} opacity={0.5 * pick} />
      <T x={25} y={95} s={11} f={C.second} o={pick}>
        picks a register
      </T>
      <rect x={77} y={78} width={72 * run} height={3} fill={C.focus} />
      <T x={77} y={118} s={11} f={C.focus} o={run}>
        leading zeros
      </T>
      <path
        d={`M48 72 C 150 160 280 170 ${lerp(48, 414, easeInOut(seg(t, 1.3, 1.8)))} ${lerp(72, 155, easeInOut(seg(t, 1.3, 1.8)))}`}
        fill="none"
        stroke={C.second}
        strokeWidth={1.5}
        opacity={easeOut(seg(t, 1.3, 1.5))}
        strokeDasharray="4 3"
      />
      <Regs x0={330} base={150} h={[2, 1, lerp(1, 3, g), 2, 1, 2, 1, 2]} hi={g > 0 ? 2 : -1} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={300} y={205} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        each register keeps its longest run
      </T>
    </Svg>
  );
}

// 4 · Harmonic mean. Eight register bars, one an unlucky outlier; a plain average line rises high toward it; the harmonic
// mean line settles low, among the ordinary bars.
export function RevealHarmonicMean({ t }: StepCtx) {
  const H = [3, 4, 3, 4, 3, 12, 4, 3];
  const a = easeOut(seg(t, 1.6, 2.4));
  const hm = easeOut(seg(t, 3.0, 3.8));
  return (
    <Svg label="averaging registers with a harmonic mean, not an arithmetic one, is what tames one unlucky outlier" h={230}>
      {H.map((v, i) => (
        <rect
          key={i}
          x={25 + i * 40}
          y={180 - v * 12 * easeOut(seg(t, 0.3 + i * 0.08, 0.8 + i * 0.08))}
          width={30}
          height={v * 12 * easeOut(seg(t, 0.3 + i * 0.08, 0.8 + i * 0.08))}
          rx={2}
          fill={i === 5 ? C.cherryText : C.crema}
          opacity={0.6}
        />
      ))}
      <line x1={20} y1={180} x2={340} y2={180} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={20} y1={lerp(180, 72, a)} x2={340} y2={lerp(180, 72, a)} stroke={C.cherryText} strokeWidth={2} strokeDasharray="6 4" opacity={a > 0 ? 1 : 0} />
      <T x={350} y={76} s={12} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
        plain average: dragged up
      </T>
      <line x1={20} y1={lerp(180, 138, hm)} x2={340} y2={lerp(180, 138, hm)} stroke={C.focus} strokeWidth={2.5} opacity={hm > 0 ? 1 : 0} />
      <T x={350} y={142} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        harmonic mean: steady
      </T>
      <T x={300} y={215} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 4.6, 5.0))}>
        one unlucky register barely moves it
      </T>
    </Svg>
  );
}

// 5 · Measured error. A few registers: the estimate lands well off the exact count, the gap marked. Many more registers,
// same stream: the estimate lands close.
export function RevealMeasuredError({ t }: StepCtx) {
  const e1 = easeOutBack(seg(t, 1.0, 1.8));
  const e2 = easeOutBack(seg(t, 3.0, 3.8));
  return (
    <Svg label="a real sketch's error against an exact count shrinks as more registers get used" h={230}>
      <T x={25} y={45} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        a few registers
      </T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25 + i * 12} y={56} width={8} height={14} rx={1} fill={C.crema} opacity={0.6 * easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <line x1={400} y1={40} x2={400} y2={150} stroke={C.crema} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={400} y={172} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        exact count
      </T>
      <line x1={260} y1={70} x2={560} y2={70} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <circle cx={lerp(260, 480, e1)} cy={70} r={6} fill={C.cherryText} opacity={easeOut(seg(t, 1.0, 1.2))} />
      <rect x={400} y={78} width={80 * easeOut(seg(t, 1.9, 2.3))} height={3} fill={C.cherryText} />
      <T x={25} y={115} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        many more registers
      </T>
      {Array.from({ length: 32 }, (_, i) => (
        <rect key={i} x={25 + (i % 16) * 12} y={126 + Math.floor(i / 16) * 10} width={8} height={7} rx={1} fill={C.crema} opacity={0.6 * easeOut(seg(t, 2.4, 2.7))} />
      ))}
      <line x1={260} y1={135} x2={560} y2={135} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.4, 2.7))} />
      <circle cx={lerp(260, 410, e2)} cy={135} r={6} fill={C.focus} opacity={easeOut(seg(t, 3.0, 3.2))} />
      <T x={300} y={215} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        more registers, the error shrinks
      </T>
    </Svg>
  );
}

// 6 · Refinements. A raw small-count estimate sits off the true mark and is nudged onto it. Below, a row of mostly empty
// registers: the empty ones fade, and the few in use slide together, stored alone.
export function RevealHLLPlusPlus({ t }: StepCtx) {
  const fix = easeInOut(seg(t, 1.4, 2.0));
  const pack = easeInOut(seg(t, 3.2, 4.0));
  const used = [3, 9, 13];
  return (
    <Svg label="a measured bias correction and a sparse mode for small counts, named from the engine's own paper" h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        small counts: the bias, measured
      </T>
      <line x1={25} y1={70} x2={280} y2={70} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={150} y1={58} x2={150} y2={82} stroke={C.crema} strokeWidth={2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <circle cx={lerp(215, 150, fix)} cy={70} r={6} fill={fix >= 1 ? C.focus : C.cherryText} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={310} y={75} s={13} f={C.focus} o={easeOut(seg(t, 2.0, 2.4))}>
        corrected directly
      </T>
      <T x={25} y={120} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        mostly empty registers
      </T>
      {Array.from({ length: 16 }, (_, i) => {
        const u = used.indexOf(i);
        const x = u >= 0 ? lerp(25 + i * 34, 25 + u * 34, pack) : 25 + i * 34;
        return (
          <rect
            key={i}
            x={x}
            y={132}
            width={28}
            height={22}
            rx={3}
            fill={u >= 0 ? C.crema : C.cocoa}
            fillOpacity={u >= 0 ? 0.7 : 1}
            stroke={C.mocha}
            strokeWidth={1.5}
            strokeDasharray={u >= 0 ? undefined : '4 3'}
            opacity={easeOut(seg(t, 2.6, 2.9)) * (u >= 0 ? 1 : 1 - pack)}
          />
        );
      })}
      <T x={25} y={190} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        only the ones in use are stored
      </T>
      <T x={25} y={218} s={12} f={C.latte} o={easeOut(seg(t, 4.7, 5.1))}>
        until storing them all is cheaper
      </T>
    </Svg>
  );
}

// 7 · Approximate count. BigQuery's exact count bar grows long and slow; its approximate count finishes short and fast;
// then two overlapping sets: what they share needs a different sketch.
export function RevealApproxCountDistinct({ t }: StepCtx) {
  const v = easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="a warehouse's own approximate count trades exactness for speed, on purpose, at huge scale" h={240}>
      <T x={25} y={40} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        BigQuery, at huge scale
      </T>
      <T x={25} y={75} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        exact count
      </T>
      <rect x={180} y={64} width={360 * easeInOut(seg(t, 0.5, 2.8))} height={14} rx={2} fill={C.crema} opacity={0.6} />
      <T x={25} y={108} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        approximate count
      </T>
      <rect x={180} y={97} width={70 * easeOut(seg(t, 0.5, 0.9))} height={14} rx={2} fill={C.focus} />
      <T x={270} y={108} s={12} f={C.focus} o={easeOut(seg(t, 1.0, 1.4))}>
        an estimate, on purpose
      </T>
      <circle cx={70} cy={180} r={28} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={easeOut(seg(t, 3.2, 3.6))} />
      <circle cx={110} cy={180} r={28} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={easeOut(seg(t, 3.2, 3.6))} />
      <path d="M90 160.4 A28 28 0 0 1 90 199.6 A28 28 0 0 1 90 160.4 Z" fill={C.second} opacity={0.6 * v} />
      <T x={160} y={176} s={13} f={C.second} o={v}>
        what two sets share
      </T>
      <T x={160} y={198} s={13} f={C.latte} o={easeOut(seg(t, 4.2, 4.6))}>
        needs a different sketch
      </T>
    </Svg>
  );
}

// 8 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="leading zeros per register, a harmonic mean, real error shrinking with memory, bias correction and sparse mode, and set sketches for a different question" h={250}>
      <Row y={40} label="each register" value="longest run" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={85} label="harmonic mean" value="tames outliers" k={easeOut(seg(t, 1.6, 2.0))} />
      <Row y={130} label="more registers" value="less error" k={easeOut(seg(t, 2.8, 3.2))} />
      <Row y={175} label="refinements" value="bias, sparse mode" k={easeOut(seg(t, 3.8, 4.2))} />
      <Row y={220} label="set questions" value="a different sketch" valueColor={C.focus} k={easeOut(seg(t, 4.8, 5.2))} />
    </Svg>
  );
}

// 9 · Prove. Daily sketches merge into one rolling count; the question is a set difference; after the answer the rolling
// sketch is crossed and the difference lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="a team merges daily sketches into a rolling estimate; a teammate now needs an exact set difference — does the same sketch answer that?" h={200}>
      {[0, 1, 2].map((d) => (
        <Regs key={d} x0={25 + d * 60} base={100} h={[2, 3, 1].map((x) => ((x + d) % 3) + 1)} dx={16} u={10} o={easeOut(seg(t, 0.2 + d * 0.15, 0.5 + d * 0.15))} />
      ))}
      <Cell x={210} y={66} w={150} label="rolling count" o={easeOut(seg(t, 0.7, 1.0))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <Cross x={285} y={112} k={v} />
      <circle cx={450} cy={80} r={26} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <circle cx={490} cy={80} r={26} fill="none" stroke={C.crema} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <path d="M470 63.4 A26 26 0 1 0 470 96.6 A26 26 0 0 1 470 63.4 Z" fill={C.second} opacity={0.3 + 0.5 * v} />
      <AnswerRow y={150} label="the same sketch?" answer={answer} value="no, a set sketch" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={190} text="it only answers how many" />
    </Svg>
  );
}
