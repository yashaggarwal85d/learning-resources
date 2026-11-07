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

// Every value here is examples.py's own: the 30-day window with its refresh failing on days 8 to 13, the tier-one 99%
// target, and the SRE Workbook's own quoted thresholds, 2% of the budget in one hour to page and 10% in three days for a
// ticket. Days are drawn as cells.

const STALE = (i: number) => i >= 7 && i <= 12;

/** A row of thirty day cells; `on(i)` fades each in, `bad(i)` paints it red. */
function Days({ x, y, step, w, on, bad }: { x: number; y: number; step: number; w: number; on: (i: number) => number; bad: (i: number) => boolean }) {
  return (
    <g>
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={x + i * step} y={y} width={w} height={16} rx={2} fill="none" stroke={bad(i) ? C.cherryText : C.focus} strokeWidth={bad(i) ? 2 : 1.3} opacity={on(i)} />
      ))}
    </g>
  );
}

// 0 · The pipeline's thirty runs all land on time. Under them, the report's thirty days, six of them stale. The cause: a
// downstream view that silently stopped refreshing.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="the pipeline finished. the report was still stale." h={250}>
      <T x={25} y={41} s={12} f={C.crema} o={k(0)}>
        pipeline runs
      </T>
      <Days x={160} y={28} step={13.8} w={10} on={(i) => easeOut(seg(t, 0.2 + i * 0.03, 0.4 + i * 0.03))} bad={() => false} />
      {t > 1.2 && (
        <T x={160} y={64} s={11} f={C.focus} o={k(1.2)}>
          every run on time
        </T>
      )}
      <T x={25} y={91} s={12} f={C.crema} o={k(1.4)}>
        the report
      </T>
      <Days x={160} y={78} step={13.8} w={10} on={(i) => easeOut(seg(t, 1.5 + i * 0.02, 1.7 + i * 0.02))} bad={(i) => STALE(i) && t > 2.1} />
      {t > 2.4 && (
        <T x={257} y={116} s={11} f={C.cherryText} o={k(2.4)}>
          stale for days
        </T>
      )}
      <Cell x={160} y={140} w={200} label="a downstream view" o={k(2.7)} stroke={t > 3.0 ? C.cherryText : C.mocha} />
      <Cross x={377} y={154} k={k(3.0)} />
      {t > 3.0 && (
        <T x={394} y={158} s={11} f={C.cherryText} o={k(3.0)}>
          stopped refreshing
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={224} s={12} f={C.crema} o={k(3.8)}>
          the right number, measured at the wrong point
        </T>
      )}
    </Svg>
  );
}

// 1 · The six dimensions as recap chips. Then one becomes a measured bar with a target line and the slack past it marked as
// the budget.
export function RevealDimensions({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const dims = ['freshness', 'completeness', 'validity', 'uniqueness', 'consistency', 'accuracy'];
  const fill = easeOut(seg(t, 2.0, 2.7));
  return (
    <Svg label="six dimensions. now: numbers, not vibes." h={250}>
      {dims.map((d, i) => (
        <Cell key={d} x={25 + (i % 3) * 190} y={36 + Math.floor(i / 3) * 44} w={170} label={d} o={k(0.2 + i * 0.15) * (t > 1.8 && i > 0 ? 0.45 : 1)} stroke={i === 0 && t > 1.8 ? C.focus : C.mocha} />
      ))}
      <T x={25} y={150} s={11} f={C.crema} o={k(1.9)}>
        freshness, measured
      </T>
      <rect x={25} y={160} width={550} height={14} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(1.9)} />
      <rect x={25} y={160} width={510 * fill} height={14} rx={3} fill={C.second} />
      <line x1={465} y1={154} x2={465} y2={180} stroke={C.caramel} strokeWidth={1.8} strokeDasharray="3 2" opacity={k(2.6)} />
      <T x={465} y={196} s={11} f={C.caramel} a="middle" o={k(2.6)}>
        target
      </T>
      <line x1={465} y1={154} x2={lerp(465, 575, k(3.0))} y2={154} stroke={C.focus} strokeWidth={2} opacity={k(3.0)} />
      <T x={520} y={146} s={11} f={C.focus} a="middle" o={k(3.0)}>
        budget
      </T>
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.8)}>
          a feeling becomes something you can page on
        </T>
      )}
    </Svg>
  );
}

/** Pipeline, view and reader in a row. */
function Chain({ k, viewBad = false }: { k: number; viewBad?: boolean }) {
  return (
    <g>
      <Cell x={25} y={70} w={150} label="pipeline" o={k} />
      <Fan x1={180} y1={84} x2={219} y2={84} k={k} />
      <Cell x={225} y={70} w={150} label="a view" o={k} stroke={viewBad ? C.cherryText : C.mocha} />
      <Fan x1={380} y1={84} x2={419} y2={84} k={k} />
      <Cell x={425} y={70} w={150} label="the reader" o={k} />
    </g>
  );
}

// 2 · Predict. Pipeline, view, reader, with two dashed rings where a freshness gauge could go. Once answered, the gauge pin
// slides from the pipeline's end to the reader.
export function PredictReadPoint({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="where should freshness actually be measured?" h={250}>
      <Chain k={k(0)} />
      {[100, 500].map((x) => (
        <circle key={x} cx={x} cy={46} r={9} fill="none" stroke={C.taupe} strokeWidth={1.4} strokeDasharray="3 2" opacity={k(0.5)} />
      ))}
      {answer !== null && <circle cx={lerp(100, 500, v)} cy={46} r={6} fill={C.focus} />}
      {v > 0.9 && (
        <T x={500} y={132} s={11} f={C.focus} a="middle" o={v}>
          measure here
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={176} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="where a consumer reads it" y={222} />
    </Svg>
  );
}

// 3 · Two gauges on the chain: finish-time at the pipeline, read point at the reader. Both read fresh; then the view fails
// and only the read-point gauge turns red.
export function RevealReadPoint({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const broke = t > 2.4;
  return (
    <Svg label="measured at the read, not the write." h={250}>
      <Chain k={k(0)} viewBad={broke} />
      <Cross x={355} y={84} k={k(2.4)} />
      <T x={100} y={130} s={11} f={C.taupe} a="middle" o={k(0.4)}>
        finish-time
      </T>
      <circle cx={100} cy={150} r={8} fill={C.focus} opacity={k(0.5)} />
      <T x={500} y={130} s={11} f={C.taupe} a="middle" o={k(0.7)}>
        read point
      </T>
      <circle cx={500} cy={150} r={8} fill={broke ? C.cherryText : C.focus} opacity={k(0.8)} />
      {t > 1.2 && t < 2.6 && (
        <T x={300} y={196} s={11} f={C.taupe} a="middle" o={k(1.2)}>
          they agree almost all the time
        </T>
      )}
      {t >= 2.6 && (
        <T x={300} y={196} s={11} f={C.cherryText} a="middle" o={k(2.6)}>
          until a view quietly stops
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={234} s={12} f={C.crema} o={k(3.6)}>
          fresh to the pipeline is not fresh to a reader
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. A customer-facing table and an internal one share one dashed target line. Once answered, the customer
// table's target slides tighter.
export function PredictTiers({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="does every table deserve the same target?" h={250}>
      <Cell x={25} y={50} w={200} label="customer-facing" o={k(0)} />
      <Cell x={25} y={120} w={200} label="internal digging" o={k(0.1)} />
      {[56, 126].map((y) => (
        <rect key={y} x={250} y={y} width={300} height={14} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.3)} />
      ))}
      <line x1={lerp(430, 530, v)} y1={46} x2={lerp(430, 530, v)} y2={80} stroke={v > 0.5 ? C.focus : C.caramel} strokeWidth={2} strokeDasharray="3 2" opacity={k(0.5)} />
      <line x1={430} y1={116} x2={430} y2={150} stroke={C.caramel} strokeWidth={2} strokeDasharray="3 2" opacity={k(0.5)} />
      {answer === null && t > 1.0 && (
        <T x={300} y={190} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: tighter for what customers see" y={222} />
    </Svg>
  );
}

// 5 · Tier one's target sits near the right edge, 99%, leaving a thin budget; tier three's looser target leaves a wide one.
// Two pips, a backfill and a schema change, are spent into a budget on purpose.
export function RevealTiersBudget({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="tighter target for tier one. the slack is a budget." h={250}>
      <T x={25} y={43} s={12} f={C.crema} o={k(0)}>
        tier one
      </T>
      <rect x={140} y={30} width={430} height={18} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.1)} />
      <rect x={530} y={30} width={40} height={18} rx={3} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={k(1.2)} />
      <line x1={530} y1={24} x2={530} y2={54} stroke={C.caramel} strokeWidth={1.8} strokeDasharray="3 2" opacity={k(0.6)} />
      <T x={530} y={72} s={11} f={C.caramel} a="middle" o={k(0.6)}>
        99%
      </T>
      <T x={25} y={113} s={12} f={C.crema} o={k(0.8)}>
        tier three
      </T>
      <rect x={140} y={100} width={430} height={18} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.9)} />
      <rect x={430} y={100} width={140} height={18} rx={3} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={k(1.6)} />
      <line x1={430} y1={94} x2={430} y2={124} stroke={C.caramel} strokeWidth={1.8} strokeDasharray="3 2" opacity={k(1.2)} />
      <T x={430} y={142} s={11} f={C.caramel} a="middle" o={k(1.2)}>
        looser target
      </T>
      {t > 1.8 && (
        <T x={140} y={142} s={11} f={C.focus} o={k(1.8)}>
          the slack: error budget
        </T>
      )}
      {[0, 1].map((i) => {
        const m = easeInOut(seg(t, 2.6 + i * 0.4, 3.2 + i * 0.4));
        return <Pip key={i} x={lerp(300 + i * 30, 470 + i * 50, m)} y={lerp(170, 109, m)} s={11} f={C.caramel} o={k(2.4)} />;
      })}
      <T x={25} y={196} s={11} f={C.caramel} o={k(2.4)}>
        spent on purpose: a backfill, a schema change
      </T>
      {t > 4.0 && (
        <T x={25} y={234} s={12} f={C.crema} o={k(4.0)}>
          not a failure allowance
        </T>
      )}
    </Svg>
  );
}

// 6 · Remaining budget over time. A steep red drop in a short window pages; a slow decline over a long window opens a
// ticket. The thresholds are the SRE Workbook's own.
export function RevealBurnRate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fast = easeIn2(seg(t, 0.4, 1.4));
  const slow = clamp(seg(t, 2.0, 3.2));
  return (
    <Svg label="short window, high burn rate: page. longer window: ticket." h={250}>
      <line x1={60} y1={170} x2={560} y2={170} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <line x1={60} y1={40} x2={60} y2={170} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        budget left
      </T>
      {fast > 0 && <line x1={70} y1={50} x2={lerp(70, 160, fast)} y2={lerp(50, 140, fast)} stroke={C.cherryText} strokeWidth={2.4} />}
      <line x1={70} y1={186} x2={160} y2={186} stroke={C.cherryText} strokeWidth={1.5} opacity={k(1.0)} />
      <T x={70} y={204} s={11} f={C.cherryText} o={k(1.0)}>
        short window
      </T>
      {t > 1.5 && (
        <T x={172} y={100} s={12} f={C.cherryText} o={k(1.5)}>
          page: 2% in one hour
        </T>
      )}
      {slow > 0 && <line x1={300} y1={50} x2={lerp(300, 560, slow)} y2={lerp(50, 110, slow)} stroke={C.caramel} strokeWidth={2.4} />}
      <line x1={300} y1={186} x2={560} y2={186} stroke={C.caramel} strokeWidth={1.5} opacity={k(2.0)} />
      <T x={300} y={204} s={11} f={C.caramel} o={k(2.0)}>
        long window
      </T>
      {t > 3.2 && (
        <T x={300} y={146} s={12} f={C.caramel} o={k(3.2)}>
          ticket: 10% in three days
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(3.8)}>
          the Google SRE Workbook's own recommended table
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in, one per idea.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['measure at the read point', 'size the target by tier', 'spend the budget on purpose', 'alert on burn rate'];
  return (
    <Svg label="read point. tiered target. spend on purpose. alert on burn rate." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          the wrong point, not a wrong number
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The month's finish-time row, all on time. Once answered, the read-point row fills beneath it with days 8 to
// 13 red, and the ticket marker lands on the third stale day.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? clamp(seg(s, 0.1, 1.2)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="same outage. does the finish-time sli ever notice?" h={250}>
      <T x={25} y={53} s={11} f={C.crema} o={k(0)}>
        finish-time
      </T>
      <Days x={120} y={40} step={15} w={11} on={() => k(0.1)} bad={() => false} />
      {v > 0.3 && (
        <T x={120} y={78} s={11} f={C.focus} o={v}>
          30 of 30 on time
        </T>
      )}
      <T x={25} y={103} s={11} f={C.crema} o={k(0.3)}>
        read point
      </T>
      <Days x={120} y={90} step={15} w={11} on={(i) => clamp(v * 30 - i)} bad={STALE} />
      <line x1={260} y1={112} x2={260} y2={lerp(112, 130, clamp(v * 3 - 2))} stroke={C.caramel} strokeWidth={1.8} opacity={v >= 1 ? 1 : 0} />
      {v >= 1 && (
        <T x={260} y={146} s={11} f={C.caramel} a="middle" o={easeOut(seg(s, 1.2, 1.5))}>
          ticket fires
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={190} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="it stays perfect all month" y={222} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}
