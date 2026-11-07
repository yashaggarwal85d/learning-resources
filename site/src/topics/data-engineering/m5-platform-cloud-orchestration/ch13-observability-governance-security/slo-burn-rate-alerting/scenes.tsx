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
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own: the 30-day window, burn rate 1.0, the 90% target whose full hour down spends 1.4% of
// budget against the 2% page line, the 90-minute fixed threshold, the 110-minute expected gap plus its 30-minute tolerance,
// and night 17's stale 620. The thirty nightly ages are random draws, drawn as heights only; illustrative counts are pips.

const NIGHTS = [84, 68, 63, 75, 75, 99, 110, 80, 74, 89, 96, 88, 90, 76, 66, 73, 83, 620, 71, 103, 106, 70, 68, 109, 105, 84, 107, 101, 67, 95];

// 0 · Hook. Thirty day cells sweep in under a freshness target. Day 17 lights and opens into a full day below, where a red
// stretch a quarter of its length grows: six real hours stale.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const z = easeInOut(seg(t, 1.8, 2.4));
  const red = easeInOut(seg(t, 2.6, 3.6));
  const dx = 25 + 17 * 18;
  return (
    <Svg label="99% over 30 days. Stale for 6 hours." h={250}>
      <T x={25} y={28} s={11} f={C.latte} o={k(0)}>
        freshness target, over a rolling 30 days
      </T>
      {NIGHTS.map((_, i) => (
        <rect key={i} x={25 + i * 18} y={42} width={14} height={20} rx={2} fill={i === 17 && t > 1.6 ? C.cherryText : C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={k(0.3 + i * 0.03)} />
      ))}
      <path d={`M${dx} 62 L25 ${lerp(62, 120, z)} M${dx + 14} 62 L575 ${lerp(62, 120, z)}`} stroke={C.mocha} strokeWidth={1} strokeDasharray="3 3" opacity={z} />
      <rect x={25} y={120} width={550} height={26} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={z} />
      <rect x={25 + 550 * 0.5} y={124} width={Math.max(0, 550 * 0.25 * red)} height={18} rx={2} fill={C.cherryText} />
      {t > 3.4 && (
        <T x={25 + 550 * 0.5} y={172} s={12} f={C.cherryText} o={k(3.4)}>
          six hours stale
        </T>
      )}
      {t > 3.8 && (
        <T x={25 + 550 * 0.5} y={194} s={11} f={C.taupe} o={k(3.8)}>
          a real incident, not a blip
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Two lanes: the outage, a long red block, and every night, a row of ordinary grey gaps. Once answered, the
// outage gets its tick at the start and the gaps go quiet; the fixed threshold is crossed and the two-window rule ticked.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const b = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  return (
    <Svg label="5 minutes, budget gone, or never?" h={250}>
      <T x={25} y={46} s={11} f={C.latte} o={k(0)}>
        the outage
      </T>
      <line x1={140} y1={42} x2={575} y2={42} stroke={C.mocha} strokeWidth={1.2} opacity={k(0)} />
      <rect x={220} y={34} width={Math.max(0, 200 * k(0.2))} height={16} rx={2} fill={C.cherryText} />
      <MiniTick x={222} y={20} k={a} />
      <T x={25} y={96} s={11} f={C.latte} o={k(0.6)}>
        every night
      </T>
      <line x1={140} y1={92} x2={575} y2={92} stroke={C.mocha} strokeWidth={1.2} opacity={k(0.6)} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={160 + i * 70} y={85} width={22} height={14} rx={2} fill={b > 0.5 ? C.mocha : C.latte} opacity={k(0.7 + i * 0.08)} />
      ))}
      {answer === null && t > 1.2 && (
        <T x={560} y={70} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Cell x={25} y={124} w={250} label="a fixed threshold" o={k(0.9)} stroke={a > 0.5 ? C.cherryText : C.mocha} f={a > 0.5 ? C.taupe : C.crema} />
      <Cross x={295} y={138} k={a} />
      <Cell x={25} y={166} w={250} label="multi-window burn rate" o={k(1.1)} stroke={a > 0.5 ? C.focus : C.mocha} />
      <MiniTick x={290} y={180} k={a} />
      <Verdict answer={answer} text="two windows, plus the schedule" y={228} />
    </Svg>
  );
}

const CHAIN = ['source', 'job', 'table', 'reader'];

// 2 · Symptom, not cause. A chain from source to reader. Little cause alarms pop all along the inside of the pipeline and
// are dimmed, noise; then the one symptom the reader feels lights at the end: the page worth sending.
export function RevealSymptomBased({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const dim = k(2.4);
  return (
    <Svg label="the symptom, not the cause." h={250}>
      {CHAIN.map((n, i) => (
        <g key={n}>
          <Cell x={25 + i * 150} y={50} w={100} label={n} o={k(i * 0.15)} stroke={i === 3 && t > 2.8 ? C.focus : C.mocha} />
          {i < 3 && <Req x1={125 + i * 150} x2={175 + i * 150} y={64} k={k(0.3 + i * 0.15)} />}
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Pip key={i} x={40 + i * 50} y={110 + (i % 2) * 16} f={C.latte} o={k(1.0 + i * 0.12) * (1 - 0.7 * dim)} s={9} />
      ))}
      {t > 1.6 && (
        <T x={25} y={164} s={11} f={C.taupe} o={k(1.6)}>
          every internal cause, alarmed: noise
        </T>
      )}
      <Pip x={525} y={110} f={C.focus} o={k(2.8)} s={12} />
      {t > 3.0 && (
        <T x={575} y={140} s={11} f={C.focus} a="end" o={k(3.0)}>
          what the reader feels
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={214} s={12} f={C.crema} o={k(3.6)}>
          every page has to earn the interruption
        </T>
      )}
    </Svg>
  );
}

// 3 · Burn rate. Time elapsed grows along one bar while the budget left shrinks along another, at the same pace: burn rate
// 1.0, the two meeting exactly at day 30.
export function RevealBurnRate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const p = easeInOut(seg(t, 1.0, 3.4));
  return (
    <Svg label="burn rate 1. Gone at day 30." h={250}>
      <T x={25} y={34} s={11} f={C.latte} o={k(0)}>
        burn rate = observed error rate ÷ the allowed rate
      </T>
      <T x={25} y={84} s={11} f={C.crema} o={k(0.4)}>
        time spent
      </T>
      <rect x={140} y={70} width={420} height={20} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.4)} />
      <rect x={140} y={72} width={Math.max(0, 420 * p)} height={16} rx={2} fill={C.latte} />
      <T x={25} y={134} s={11} f={C.crema} o={k(0.6)}>
        budget left
      </T>
      <rect x={140} y={120} width={420} height={20} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.6)} />
      <rect x={140} y={122} width={Math.max(0, 420 * (1 - p))} height={16} rx={2} fill={C.second} opacity={k(0.6)} />
      <line x1={140 + 420 * p} y1={62} x2={140 + 420 * p} y2={148} stroke={C.focus} strokeWidth={1.2} strokeDasharray="3 3" opacity={k(1.0)} />
      {t > 3.4 && (
        <T x={25} y={190} s={12} f={C.focus} o={k(3.4)}>
          burn rate 1.0: gone exactly at day 30
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={212} s={11} f={C.taupe} o={k(3.8)}>
          not a minute sooner
        </T>
      )}
    </Svg>
  );
}

// 4 · A fixed threshold's two failures. A complete outage and a barely-there one, same moment: the alert fires on both at the
// same hour, one dashed line. Then the firing bar runs on under both, long after the outage has ended.
export function RevealFixedThresholdFailures({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = easeInOut(seg(t, 2.8, 4.2));
  return (
    <Svg label="same detection either way. Won't stop firing." h={250}>
      <T x={25} y={52} s={11} f={C.latte} o={k(0)}>
        complete outage
      </T>
      <rect x={200} y={38} width={20} height={24} rx={2} fill={C.cherryText} opacity={k(0.3)} />
      <T x={25} y={122} s={11} f={C.latte} o={k(0.2)}>
        barely noticeable
      </T>
      <rect x={200} y={116} width={20} height={4} rx={1} fill={C.cherryText} opacity={k(0.5)} />
      <line x1={220} y1={30} x2={220} y2={160} stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(1.4)} />
      {t > 1.6 && (
        <T x={228} y={180} s={11} f={C.focus} o={k(1.6)}>
          both fire after the same hour
        </T>
      )}
      <rect x={220} y={72} width={Math.max(0, 340 * run)} height={6} rx={2} fill={C.cherryText} opacity={0.8} />
      <rect x={220} y={132} width={Math.max(0, 340 * run)} height={6} rx={2} fill={C.cherryText} opacity={0.8} />
      <MiniTick x={196} y={88} k={k(2.6)} />
      {t > 3.4 && (
        <T x={228} y={212} s={11} f={C.cherryText} o={k(3.4)}>
          still firing, long after the fix
        </T>
      )}
    </Svg>
  );
}

// 5 · The multi-window fix. The long window's bracket, then a short bracket shrinks out of it to a twelfth its length at the
// recent edge. The outage slides back in time: it leaves the short window first, and that rule clears while the long one alone
// would still fire.
export function RevealMultiWindowFix({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sh = easeInOut(seg(t, 1.0, 2.0));
  const sw = lerp(480, 40, sh);
  const mv = easeInOut(seg(t, 2.4, 3.8));
  const bx = lerp(505, 330, mv);
  const cleared = bx + 30 < 500;
  return (
    <Svg label="a short window, a twelfth the length." h={250}>
      <path d="M60 64 v-8 H540 v8" fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(0)} />
      <T x={60} y={44} s={11} f={C.latte} o={k(0)}>
        long window
      </T>
      <path d={`M${540 - sw} 104 v-8 H540 v8`} fill="none" stroke={cleared ? C.focus : C.second} strokeWidth={1.6} opacity={k(1.0)} />
      {t > 2.0 && (
        <T x={540} y={86} s={11} f={C.second} a="end" o={k(2.0)}>
          short window: a twelfth
        </T>
      )}
      <rect x={bx} y={116} width={30} height={20} rx={2} fill={C.cherryText} opacity={k(2.2)} />
      <T x={25} y={186} s={11} f={C.latte} o={k(2.4)}>
        long window alone
      </T>
      <T x={575} y={186} s={11} f={C.cherryText} a="end" o={k(2.4)}>
        still firing
      </T>
      <T x={25} y={216} s={11} f={C.latte} o={k(2.6)}>
        long and short together
      </T>
      <T x={575} y={216} s={11} f={cleared ? C.focus : C.cherryText} a="end" o={k(2.6)}>
        {cleared ? 'cleared in minutes' : 'firing'}
      </T>
    </Svg>
  );
}

const THRESH: [string, number, string][] = [
  ['two percent in one hour', 2, 'page'],
  ['five percent in six hours', 5, 'page'],
  ['ten percent in three days', 10, 'ticket'],
];

// 6 · The thresholds and their limit. Three budget-spend bars, page, page, ticket. Below, a 90% target's full hour down grows
// a bar that stops at 1.4%, short of the dashed 2% page line: it never fires.
export function RevealThresholdsAndLimit({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g = easeOut(seg(t, 2.8, 3.8));
  return (
    <Svg label="a full outage. Still under threshold." h={250}>
      {THRESH.map(([l, v, tag], i) => (
        <g key={l}>
          <T x={25} y={44 + i * 30} s={11} f={C.latte} o={k(i * 0.4)}>
            {l}
          </T>
          <rect x={260} y={33 + i * 30} width={Math.max(0, v * 20 * k(0.2 + i * 0.4))} height={14} rx={2} fill={tag === 'page' ? C.focus : C.latte} />
          <T x={575} y={44 + i * 30} s={11} f={tag === 'page' ? C.focus : C.taupe} a="end" o={k(0.4 + i * 0.4)}>
            {tag}
          </T>
        </g>
      ))}
      {t > 2.4 && (
        <T x={25} y={150} s={11} f={C.crema} o={k(2.4)}>
          a 90% target, a full hour down
        </T>
      )}
      <rect x={25} y={164} width={Math.max(0, 1.4 * 200 * g)} height={18} rx={2} fill={C.cherryText} />
      <line x1={425} y1={158} x2={425} y2={190} stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(2.6)} />
      {t > 2.6 && (
        <T x={435} y={178} s={11} f={C.focus} o={k(2.6)}>
          page at 2%
        </T>
      )}
      {t > 3.8 && (
        <T x={315} y={178} s={11} f={C.cherryText} o={k(3.8)}>
          1.4%
        </T>
      )}
      {t > 4.2 && (
        <T x={25} y={222} s={12} f={C.cherryText} o={k(4.2)}>
          the page never fires
        </T>
      )}
    </Svg>
  );
}

const BASE = 200;

// 7 · Schedule-aware freshness. Thirty nightly ages rise as bars, night 17 off the top. The fixed 90-minute line paints every
// healthy bar above it red. Then the line lifts to the expected gap plus tolerance: the healthy reds go quiet, night 17 stays red.
export function RevealScheduleAwareFreshness({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const lift = easeInOut(seg(t, 2.8, 3.6));
  const th = lerp(90, 140, lift);
  return (
    <Svg label="old before its run is normal." h={250}>
      {NIGHTS.map((v, i) => {
        const h = Math.min(v, 150) * easeOut(seg(t, 0.2 + i * 0.03, 0.8 + i * 0.03));
        const red = v > th && t > 1.6;
        return <rect key={i} x={25 + i * 18} y={BASE - h} width={12} height={Math.max(0, h)} rx={1} fill={red ? C.cherryText : C.latte} opacity={0.85} />;
      })}
      <line x1={25} y1={BASE - th} x2={565} y2={BASE - th} stroke={lift > 0 ? C.focus : C.taupe} strokeWidth={1.4} strokeDasharray="5 3" opacity={k(1.2)} />
      <T x={25} y={24} s={11} f={lift > 0.5 ? C.focus : C.taupe} o={k(1.2)}>
        {lift > 0.5 ? 'expected gap 110 + tolerance 30 minutes' : 'fixed threshold: 90 minutes'}
      </T>
      {t > 1.0 && (
        <T x={25 + 17 * 18 + 6} y={42} s={11} f={C.cherryText} a="middle" o={k(1.0)}>
          620
        </T>
      )}
      <T x={25} y={228} s={11} f={lift > 0.5 ? C.focus : C.cherryText} o={k(1.8)}>
        {lift > 0.5 ? 'healthy nights quiet; night 17 still caught' : 'pages on ordinary healthy nights'}
      </T>
    </Svg>
  );
}

// 8 · Dedup and owner routing. One upstream failure fans out to a column of downstream signals, each lighting red. Then they
// slide together into one page, which is routed to the one owner.
export function RevealDedupOwnerRouting({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="one failure. Ten signals. One page." h={250}>
      <Cell x={25} y={106} w={150} label="upstream failure" o={k(0)} stroke={C.cherryText} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const y = 30 + i * 20;
        return (
          <g key={i}>
            <Fan x1={175} y1={120} x2={258} y2={y} k={k(0.5 + i * 0.06) * (1 - g)} f={C.mocha} />
            <Pip x={lerp(264, 395, g)} y={lerp(y, 120, g)} f={t > 1.2 + i * 0.08 ? C.cherryText : C.latte} o={k(0.5 + i * 0.06) * (1 - k(3.2))} s={9} />
          </g>
        );
      })}
      <Cell x={360} y={106} w={90} label="one page" o={k(3.3)} stroke={C.focus} />
      <Req x1={450} x2={490} y={120} k={k(3.6)} />
      <Cell x={490} y={106} w={85} label="owner" o={k(3.7)} stroke={C.focus} />
      <T x={25} y={234} s={11} f={g > 0.5 ? C.focus : C.cherryText} o={k(1.4)}>
        {g > 0.5 ? 'grouped: one page, to the team that owns it' : 'one failure, a page for every signal'}
      </T>
    </Svg>
  );
}

const CANDS: [string, number][] = [
  ['readers see stale data', 0],
  ['a retry, then success', 1],
  ['a brief CPU spike', 2],
];
const OUTS = ['page', 'ticket', 'nothing'];

// 9 · The actionable-page test. Each candidate in turn runs into the one gate, "act now?", and comes out where it belongs:
// a page, a ticket for tomorrow, or nothing.
export function RevealActionableTest({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="one question per candidate." h={250}>
      <Cell x={240} y={100} w={110} label="act now?" o={k(0)} stroke={C.focus} />
      {CANDS.map(([n, o], i) => {
        const d = 0.6 + i * 1.1;
        return (
          <g key={n}>
            <Cell x={25} y={40 + i * 60} w={190} label={n} o={k(0.2 + i * 0.1)} />
            <Fan x1={215} y1={54 + i * 60} x2={238} y2={114} k={k(d)} f={C.latte} />
            <Fan x1={350} y1={114} x2={428} y2={54 + o * 60} k={k(d + 0.4)} f={o === 0 ? C.focus : C.latte} />
            <Cell x={430} y={40 + o * 60} w={145} label={OUTS[o]} o={k(d + 0.5)} stroke={o === 0 ? C.focus : C.mocha} f={o === 2 ? C.taupe : C.crema} />
          </g>
        );
      })}
    </Svg>
  );
}

const RECAP = ['the symptom, not the cause', 'a short window beside the long', 'the schedule, not a fixed age', 'one incident, one page', 'only what someone can act on'];

// 10 · Recap. The five parts of a good alert land in order, each ticked as it arrives.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="the symptom, two windows, a schedule, one page." h={250}>
      {RECAP.map((n, i) => (
        <g key={n}>
          <MiniTick x={25} y={40 + i * 42} k={k(0.3 + i * 0.75)} />
          <T x={50} y={46 + i * 42} s={12} f={C.crema} o={k(0.2 + i * 0.75)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 11 · Prove it. A small strip of nightly ages under the fixed line, the real outage night red and ordinary nights red too.
// Once answered, the line lifts to the schedule: ordinary nights go quiet, the outage night stays red. Widening is crossed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const th = lerp(90, 140, a);
  return (
    <Svg label="fires on the outage. Fires on an ordinary night." h={250}>
      {NIGHTS.map((v, i) => {
        const h = Math.min(v, 150) * 0.5 * k(i * 0.02);
        return <rect key={i} x={25 + i * 12} y={100 - h} width={8} height={Math.max(0, h)} rx={1} fill={v > th ? C.cherryText : C.latte} opacity={0.85} />;
      })}
      <line x1={25} y1={100 - th * 0.5} x2={385} y2={100 - th * 0.5} stroke={a > 0 ? C.focus : C.taupe} strokeWidth={1.2} strokeDasharray="4 3" opacity={k(0.6)} />
      <Cell x={25} y={124} w={300} label="widen the long window" o={k(0.8)} stroke={a > 0.5 ? C.cherryText : C.mocha} f={a > 0.5 ? C.taupe : C.crema} />
      <Cross x={345} y={138} k={a} />
      <Cell x={25} y={166} w={300} label="schedule-aware freshness" o={k(1.0)} stroke={a > 0.5 ? C.focus : C.mocha} />
      <MiniTick x={340} y={180} k={a} />
      <Verdict answer={answer} text="measure age against the schedule" y={228} />
    </Svg>
  );
}
