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

// Every value here is examples.py's own: the six consumer runs created under 100 microseconds apart (their exact offsets
// drawn as tick positions, never printed), and StartOfHourMapper's four real keys with the two downstream keys they map
// to. The hook's eleven Dags are counted in words and drawn as boxes.

/** Eleven watcher Dags stacked on the right, fanned from the asset by `fire`. */
function Eleven({ fire, o }: { fire: number; o: number }) {
  return (
    <g>
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <Fan x1={170} y1={114} x2={374} y2={26 + i * 16} k={fire} f={C.second} />
          <rect x={380} y={20 + i * 16} width={120} height={11} rx={2} fill="none" stroke={fire >= 1 ? C.second : C.mocha} strokeWidth={1.3} opacity={o} />
        </g>
      ))}
    </g>
  );
}

// 0 · The hourly orders asset lands. All eleven watching Dags light in the same instant, and each grabs a compute slot.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const drop = easeIn2(seg(t, 0.9, 1.4));
  return (
    <Svg label="one asset updates. eleven downstream dags fire at once." h={250}>
      {drop > 0 && drop < 1 && <Pip x={95} y={lerp(30, 100, drop)} s={12} f={C.second} />}
      <Cell x={25} y={100} w={140} label="hourly orders" o={k(0)} stroke={t > 1.4 ? C.second : C.mocha} />
      <Eleven fire={easeOut(seg(t, 1.6, 1.9))} o={k(0.2)} />
      {Array.from({ length: 11 }, (_, i) => (
        <Pip key={i} x={525} y={26 + i * 16} s={9} f={C.caramel} o={easeOut(seg(t, 2.2, 2.5))} />
      ))}
      {t > 2.6 && (
        <T x={25} y={200} s={12} f={C.crema} o={k(2.6)}>
          all eleven, the same second
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={228} s={11} f={C.caramel} o={k(3.4)}>
          each needs its own compute
        </T>
      )}
    </Svg>
  );
}

// 1 · A producer updates one asset; six consumer Dags fan from it and each gets a run at once. Below, a ruler zoomed to
// microseconds shows the six creation times as ticks bunched almost on top of each other.
export function RevealFanoutMeasured({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const micros = [861, 860, 853, 870, 860, 869];
  return (
    <Svg label="one update, six dags scheduled on it. measured for real." h={250}>
      <Cell x={25} y={40} w={130} label="producer" o={k(0)} />
      <Fan x1={160} y1={54} x2={204} y2={54} k={k(0.3)} />
      <Cell x={210} y={40} w={130} label="the asset" o={k(0.4)} stroke={C.second} />
      {micros.map((_, i) => (
        <g key={i}>
          <Fan x1={345} y1={54} x2={394} y2={30 + i * 22} k={easeOut(seg(t, 1.2, 1.5))} f={C.second} />
          <rect x={400} y={22 + i * 22} width={120} height={16} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={k(0.6)} />
          <Pip x={540} y={30 + i * 22} s={9} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
        </g>
      ))}
      <line x1={25} y1={186} x2={400} y2={186} stroke={C.mocha} strokeWidth={1.5} opacity={k(2.4)} />
      {micros.map((m, i) => (
        <line key={i} x1={200 + (m - 853) * 3} y1={176} x2={200 + (m - 853) * 3} y2={196} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 2.6 + i * 0.05, 2.8 + i * 0.05))} />
      ))}
      {t > 3.2 && (
        <T x={25} y={216} s={12} f={C.focus} o={k(3.2)}>
          six runs, under 100 microseconds apart
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(3.9)}>
          read back from the real metadata database
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. One update, six ghost ticks spread out along a timeline. Spaced, or together? Once answered, the six ticks
// slide into one bunch.
export function PredictStaggering({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="does airflow space the six runs out, or fire them together?" h={250}>
      <Cell x={25} y={86} w={140} label="one update" o={k(0)} stroke={C.second} />
      <line x1={200} y1={100} x2={575} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = lerp(225 + i * 66, 380 + (i - 2.5) * 2, v);
        return <line key={i} x1={x} y1={88} x2={x} y2={112} stroke={v > 0.5 ? C.focus : C.taupe} strokeWidth={1.8} strokeDasharray={v > 0.5 ? undefined : '3 2'} opacity={k(0.3 + i * 0.08)} />;
      })}
      {v < 0.5 && (
        <T x={388} y={140} s={11} f={C.taupe} a="middle" o={k(0.8) * (1 - v * 2)}>
          spaced out?
        </T>
      )}
      {answer === null && t > 1.2 && (
        <T x={300} y={192} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="all six at once, nothing spaced out" y={222} />
    </Svg>
  );
}

// 3 · The watched unit's name: Dataset, struck through, then Asset. Below, an external queue feeds a watcher that updates
// the asset from outside the system.
export function RevealAssetModel({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="renamed from dataset to asset. watchers pull from queues." h={250}>
      <T x={25} y={40} s={11} f={C.taupe} o={k(0)}>
        the unit being watched
      </T>
      <Cell x={25} y={52} w={160} label="Dataset" o={k(0.3) * (1 - 0.5 * k(1.2))} />
      <line x1={70} y1={66} x2={lerp(70, 140, k(1.2))} y2={66} stroke={C.cherryText} strokeWidth={2} opacity={k(1.2)} />
      <T x={25} y={102} s={11} f={C.taupe} o={k(0.6)}>
        through Airflow two
      </T>
      <Fan x1={190} y1={66} x2={209} y2={66} k={k(1.5)} />
      <Cell x={215} y={52} w={160} label="Asset" o={k(1.6)} stroke={C.focus} f={C.focus} />
      {t > 1.8 && (
        <T x={215} y={102} s={11} f={C.focus} o={k(1.8)}>
          the cleaner name
        </T>
      )}
      <Cell x={25} y={140} w={160} label="external queue" o={k(2.4)} />
      <Fan x1={190} y1={154} x2={239} y2={154} k={k(2.7)} />
      <Cell x={245} y={140} w={130} label="watcher" o={k(2.8)} stroke={C.caramel} />
      <Fan x1={380} y1={144} x2={420} y2={74} k={k(3.1)} f={C.caramel} />
      <Pip x={430} y={66} s={12} f={C.focus} o={easeOutBack(seg(t, 3.3, 3.6))} />
      {t > 3.4 && (
        <T x={445} y={70} s={11} f={C.focus} o={k(3.4)}>
          fresh
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.8)}>
          a named unit, tied to the outside world
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. An hourly strip above, one daily slice below, and a key landing mid-hour. Once answered, a mapper appears and
// the key slides down into the day it belongs to.
export function PredictGranularityMismatch({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.3, 1.0)) : 0;
  const m = answer !== null ? easeOut(seg(s, 0.05, 0.35)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="upstream hourly, downstream daily. what happens to the key?" h={250}>
      <T x={25} y={40} s={11} f={C.taupe} o={k(0)}>
        upstream: by the hour
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={25 + i * 45} y={50} width={40} height={20} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={k(0.1 + i * 0.03)} />
      ))}
      <Pip x={lerp(225, 290, v)} y={lerp(60, 172, v)} s={11} f={C.caramel} o={k(0.6)} />
      <T x={25} y={150} s={11} f={C.taupe} o={k(0.3)}>
        downstream: by the day
      </T>
      <Cell x={25} y={160} w={530} h={24} label="" o={k(0.4)} stroke={v >= 1 ? C.focus : C.mocha} />
      <Cell x={380} y={100} w={120} h={24} label="mapper" o={m} stroke={C.focus} f={C.focus} />
      {answer === null && t > 1.0 && (
        <T x={300} y={124} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="a mapper translates it" y={222} />
    </Svg>
  );
}

// 5 · StartOfHourMapper on four real keys. The first three fan into one downstream key; the fourth, a second into the next
// hour, fans to a different one.
export function RevealPartitionMapper({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const keys = ['2026-10-31T09:00:00', '2026-10-31T09:14:59', '2026-10-31T09:45:00', '2026-10-31T10:00:01'];
  return (
    <Svg label="a real partition mapper, run live on four real timestamps." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        StartOfHourMapper, called live
      </T>
      {keys.map((key, i) => {
        const d = 0.6 + i * 0.5;
        return (
          <g key={key}>
            <T x={25} y={60 + i * 36} s={12} f={i === 3 ? C.second : C.crema} o={k(0.2 + i * 0.1)}>
              {key}
            </T>
            <Fan x1={200} y1={56 + i * 36} x2={374} y2={i < 3 ? 98 : 170} k={easeOut(seg(t, d, d + 0.4))} f={i === 3 ? C.second : C.focus} />
          </g>
        );
      })}
      <Cell x={380} y={84} w={175} label="2026-10-31T09" o={k(0.9)} stroke={C.focus} f={C.focus} />
      <Cell x={380} y={156} w={175} label="2026-10-31T10" o={k(2.4)} stroke={C.second} f={C.second} />
      {t > 3.4 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.4)}>
          four keys, two downstream slices
        </T>
      )}
    </Svg>
  );
}

// 6 · Dagster's two ideas. Left: no trigger wire, only a stated condition. Right: an asset's age bar grows past its
// freshness promise and turns red, complaining.
export function RevealDagsterComparison({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const age = clamp(seg(t, 1.6, 3.0));
  const late = age * 265 > 180;
  return (
    <Svg label="dagster's version: state the condition, not the trigger." h={250}>
      <T x={25} y={36} s={12} f={C.crema} o={k(0)}>
        state the condition
      </T>
      <Hole x={25} y={50} w={250} o={k(0.4)} />
      <T x={150} y={69} s={11} f={C.taupe} a="middle" o={k(0.6)}>
        no explicit trigger
      </T>
      <Cell x={25} y={96} w={250} label="refresh when: condition" o={k(1.0)} stroke={C.focus} />
      <T x={310} y={36} s={12} f={C.crema} o={k(1.2)}>
        freshness policy
      </T>
      <Cell x={310} y={50} w={265} label="an asset" o={k(1.3)} stroke={late ? C.cherryText : C.mocha} />
      <rect x={310} y={96} width={265} height={12} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(1.4)} />
      <rect x={310} y={96} width={265 * age} height={12} rx={3} fill={late ? C.cherryText : C.caramel} />
      <line x1={490} y1={88} x2={490} y2={116} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="3 2" opacity={k(1.4)} />
      <T x={490} y={132} s={11} f={C.caramel} a="middle" o={k(1.5)}>
        promise
      </T>
      {t > 3.0 && (
        <T x={310} y={156} s={11} f={C.cherryText} o={k(3.0)}>
          it complains, loudly
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={200} s={12} f={C.crema} o={k(3.6)}>
          one decides when to run
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={224} s={12} f={C.crema} o={k(4.0)}>
          one watches whether it is still fresh
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Data-driven: an event pip arrives and the run starts at once, but a lost event means no run. Time-based: clock
// ticks run regardless, and one of them runs on data that was never ready.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ev = easeInOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="data-driven reacts fast. time-based is predictable. both have a cost." h={250}>
      <T x={25} y={40} s={12} f={C.focus} o={k(0)}>
        data-driven
      </T>
      {ev > 0 && ev < 1 && <Pip x={lerp(150, 294, ev)} y={36} s={10} f={C.second} />}
      <Cell x={300} y={22} w={140} h={26} label="runs at once" o={k(0.9)} stroke={C.focus} />
      <Pip x={190} y={72} s={10} f={C.second} o={k(1.4) * (1 - 0.6 * k(1.8))} />
      <Cross x={190} y={72} k={k(1.8)} />
      {t > 1.8 && (
        <T x={300} y={78} s={11} f={C.cherryText} o={k(1.8)}>
          a lost event: no run
        </T>
      )}
      <T x={25} y={130} s={12} f={C.caramel} o={k(2.2)}>
        time-based
      </T>
      {Array.from({ length: 5 }, (_, i) => {
        const d = 2.4 + i * 0.2;
        return (
          <g key={i}>
            <line x1={160 + i * 60} y1={118} x2={160 + i * 60} y2={134} stroke={C.caramel} strokeWidth={1.8} opacity={k(d)} />
            <Pip x={160 + i * 60} y={150} s={9} f={i === 3 ? C.cherryText : C.focus} o={k(d + 0.1)} />
          </g>
        );
      })}
      {t > 3.2 && (
        <T x={300} y={180} s={11} f={C.cherryText} o={k(3.2)}>
          ran on data never ready
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.8)}>
          speed, or never missing a run
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The hook's eleven Dags wait on the asset. Once answered, all eleven fire in the same instant, as six did.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.4)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="back to the eleven dags. does a fairness fix change the herd?" h={250}>
      <Cell x={25} y={100} w={140} label="hourly orders" o={k(0)} stroke={C.second} />
      <Eleven fire={v} o={k(0.2)} />
      {answer === null && t > 1.0 && (
        <T x={270} y={196} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="all eleven still fire together" y={226} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}
