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

/** 48 small objects scattered over a 240 x 110 panel, each with a target slot in one of six compact rows. */
const OBJS = Array.from({ length: 48 }, (_, i) => ({
  x: 8 + ((i * 53) % 224),
  y: 8 + ((i * 37 + (i % 5) * 11) % 94),
  tx: 10 + (i % 8) * 28,
  ty: 12 + Math.floor(i / 8) * 17,
}));

/** The object-heavy heap at (x, y): scattered dots; `m` gathers them into six compact rows; `sw` (0..1) is a GC
 * sweep line passing left to right, and dots behind it dim for a moment. */
function Objects({ x, y, m = 0, sw = -1, k = 1 }: { x: number; y: number; m?: number; sw?: number; k?: number }) {
  const sx = x + 240 * sw;
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={240} height={110} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.4} />
      {OBJS.map((o, i) => {
        const ox = x + lerp(o.x, o.tx, m);
        const hit = sw >= 0 && ox < sx && ox > sx - 40;
        return <rect key={i} x={ox} y={y + lerp(o.y, o.ty, m)} width={lerp(8, 28, m)} height={8} rx={lerp(4, 1, m)} fill={hit ? C.focus : C.latte} />;
      })}
      {sw >= 0 && sw <= 1 && <line x1={sx} y1={y - 6} x2={sx} y2={y + 116} stroke={C.focus} strokeWidth={2} />}
    </g>
  );
}

/** The binary-row heap at (x, y): six contiguous strips; `sw` is the same GC sweep line, with nothing to sort through. */
function Rows({ x, y, sw = -1, k = 1 }: { x: number; y: number; sw?: number; k?: number }) {
  const sx = x + 240 * sw;
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={240} height={110} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.4} />
      {[0, 1, 2, 3, 4, 5].map((j) => (
        <rect key={j} x={x + 10} y={y + 12 + j * 17} width={220} height={8} rx={1} fill={C.second} />
      ))}
      {sw >= 0 && sw <= 1 && <line x1={sx} y1={y - 6} x2={sx} y2={y + 116} stroke={C.focus} strokeWidth={2} />}
    </g>
  );
}

// 0 · Hook. Two heaps for the same aggregation: scattered everyday objects on the left, six compact binary rows on the right.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="same work, built two ways. Which one makes the JVM clean up more?" h={220}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        everyday objects
      </T>
      <Objects x={25} y={34} k={easeOut(seg(t, 0.3, 1.0))} />
      <T x={315} y={22} s={11} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        compact binary rows
      </T>
      <Rows x={315} y={34} k={easeOut(seg(t, 1.2, 1.9))} />
      <T x={300} y={196} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        does the cleanup notice?
      </T>
    </Svg>
  );
}

// 1 · Measured. A GC sweep passes over the scattered objects, each one lighting as it is checked; a GC-time bar grows
// beneath, short but clearly not zero.
export function RevealBaselineRealCost({ t }: StepCtx) {
  const sw = seg(t, 0.4, 2.4);
  const g = easeOut(seg(t, 0.6, 2.6));
  return (
    <Svg label="measured: the everyday-objects run genuinely pays a real cleanup cost." h={230}>
      <Objects x={25} y={34} sw={t > 0.4 && t < 2.4 ? sw : -1} />
      <T x={300} y={70} s={11} f={C.latte}>
        a GC sweep checks
      </T>
      <T x={300} y={88} s={11} f={C.latte}>
        every object
      </T>
      <T x={25} y={180} s={12} f={C.latte}>
        GC time
      </T>
      <rect x={110} y={170} width={90 * g} height={14} fill={C.focus} />
      <T x={25} y={214} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        not nothing: a real, measured cost
      </T>
    </Svg>
  );
}

// 2 · Predict. The binary rows' heap, the same GC-time bar empty beside a question.
export function PredictBinaryRows({ t, answer }: StepCtx) {
  return (
    <Svg label="the same work, built from compact binary rows. Same cleanup cost?" h={230}>
      <Rows x={25} y={34} k={easeOut(seg(t, 0.1, 0.5))} />
      <T x={25} y={180} s={12} f={C.latte}>
        GC time
      </T>
      <rect x={110} y={170} width={90} height={14} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 3" />
      <T x={420} y={100} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 0.6, 1.0)) : 0}>
        same cost?
      </T>
      <Verdict answer={answer} y={215} text="it drops to almost nothing" />
    </Svg>
  );
}

// 3 · Measured. The sweep crosses the six strips in one quick pass; nothing lights; the GC-time value lands at 0.
export function RevealZeroCost({ t }: StepCtx) {
  const sw = seg(t, 0.4, 1.2);
  return (
    <Svg label="measured: zero. The binary-row run pays no measured cleanup cost at all." h={230}>
      <Rows x={25} y={34} sw={t > 0.4 && t < 1.2 ? sw : -1} />
      <T x={300} y={70} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        nothing to sort through
      </T>
      <Row y={185} label="GC time" value={t > 1.6 ? '0' : '…'} valueColor={C.second} k={easeOut(seg(t, 1.4, 1.8))} />
      <MiniTick x={500} y={178} k={easeOut(seg(t, 2.0, 2.4))} f={C.second} />
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        not smaller: nothing worth measuring
      </T>
    </Svg>
  );
}

// 4 · Fewer pieces. The scattered objects gather into six compact rows: the same data in far fewer pieces; then two
// bars for "pieces to sort through", long against short.
export function ElaborateFewerObjects({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.4, 1.8));
  const a = easeOut(seg(t, 2.2, 2.9));
  const b = easeOut(seg(t, 2.9, 3.5));
  return (
    <Svg label="cleanup cost tracks object count; binary rows need far fewer of them." h={240}>
      <Objects x={25} y={30} m={m} />
      <T x={300} y={70} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        same data,
      </T>
      <T x={300} y={88} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
        far fewer pieces
      </T>
      <T x={25} y={168} s={11} f={C.latte} o={a}>
        pieces, objects
      </T>
      <rect x={180} y={158} width={360 * a} height={12} fill={C.latte} />
      <T x={25} y={208} s={11} f={C.second} o={b}>
        pieces, binary rows
      </T>
      <rect x={180} y={198} width={30 * b} height={12} fill={C.second} />
    </Svg>
  );
}

// 5 · Predict. The real GC-time bar, and a question mark over whether it is what slows the job.
export function PredictIsItBottleneck({ t, answer }: StepCtx) {
  return (
    <Svg label="that run did pay a real cleanup cost. Is cleanup the bottleneck?" h={220}>
      <T x={25} y={60} s={12} f={C.latte}>
        GC time
      </T>
      <rect x={110} y={50} width={90 * easeOut(seg(t, 0.2, 0.8))} height={14} fill={C.focus} />
      <T x={300} y={120} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 0.9, 1.3)) : 0}>
        the bottleneck?
      </T>
      <Verdict answer={answer} y={190} text="no: tiny next to the job" />
    </Svg>
  );
}

// 6 · Measured. The job's total time bar draws across the whole width; the GC slice is a thin sliver at its start.
export function RevealTinySliver({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 2.0));
  return (
    <Svg label="measured: no. That cost is a tiny sliver of the job's own total time." h={220}>
      <T x={25} y={40} s={11} f={C.latte}>
        the job's total run time
      </T>
      <rect x={25} y={52} width={540 * a} height={30} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <rect x={25} y={52} width={20} height={30} fill={C.focus} opacity={easeOut(seg(t, 2.1, 2.4))} />
      <path d="M35 90 v18" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 2.4, 2.7))} />
      <T x={25} y={126} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        GC: under 5% of it
      </T>
      <T x={25} y={190} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        real, and nowhere near the bottleneck
      </T>
    </Svg>
  );
}

// 7 · Context. A lone GC bar with no scale beside it reads as a question; the total bar draws in under it and the
// same bar becomes a sliver.
export function ElaborateCompareToTotal({ t }: StepCtx) {
  const s = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="a nonzero cleanup cost only matters next to the job's own total time." h={230}>
      <T x={25} y={40} s={12} f={C.latte}>
        GC time, alone
      </T>
      <rect x={lerp(200, 25, s)} y={lerp(28, 100, s)} width={lerp(90, 20, s)} height={lerp(14, 30, s)} fill={C.focus} />
      {s < 0.05 && (
        <T x={310} y={40} s={13} f={C.focus} o={easeOut(seg(t, 0.6, 1.0))}>
          trouble?
        </T>
      )}
      <rect x={45} y={100} width={520 * easeOut(seg(t, 2.6, 3.4))} height={30} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        next to the job's total
      </T>
      <T x={25} y={210} s={13} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        a number only means something in context
      </T>
    </Svg>
  );
}

// 8 · Side by side. Two rows, same work and same data: the objects heap with its GC sliver on a total bar, the
// binary-row heap with a GC value of zero.
export function RevealSideBySide({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="measured: both runs' own numbers, side by side." h={250}>
      <T x={25} y={30} s={12} f={C.latte}>
        everyday objects
      </T>
      <rect x={25} y={42} width={540 * a} height={26} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <rect x={25} y={42} width={20} height={26} fill={C.focus} opacity={easeOut(seg(t, 1.4, 1.7))} />
      <T x={60} y={92} s={11} f={C.focus} o={easeOut(seg(t, 1.6, 1.9))}>
        a real GC cost
      </T>
      <T x={25} y={140} s={12} f={C.second}>
        compact binary rows
      </T>
      <rect x={25} y={152} width={540 * b} height={26} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <T x={60} y={202} s={11} f={C.second} o={easeOut(seg(t, 3.0, 3.3))}>
        GC: 0
      </T>
      <T x={25} y={240} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        same work, same data, one cost, one none
      </T>
    </Svg>
  );
}

// 9 · Recap. Left: objects gathering into compact rows. Right: a GC sliver against the job's total bar.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="how work is built decides its cleanup cost; a nonzero number needs context." h={250}>
      <T x={25} y={26} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        the build decides the cleanup
      </T>
      <Objects x={25} y={40} m={easeInOut(seg(t, 0.6, 2.0))} />
      <T x={315} y={26} s={12} f={C.crema} o={easeOut(seg(t, 2.2, 2.5))}>
        read it against the total
      </T>
      <rect x={315} y={60} width={250 * easeOut(seg(t, 2.5, 3.3))} height={26} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <rect x={315} y={60} width={12} height={26} fill={C.focus} opacity={easeOut(seg(t, 3.3, 3.6))} />
      <T x={300} y={210} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        a nonzero number needs context
      </T>
    </Svg>
  );
}
