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

/** A segment box holding `n` record pips; `o` its opacity, `stroke` its outline. */
function Segment({ x, y, w, n, o = 1, stroke = C.mocha, f = C.latte }: { x: number; y: number; w: number; n: number; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={34} rx={5} fill="none" stroke={stroke} strokeWidth={1.5} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + 10 + i * ((w - 20) / n)} y={y + 10} width={14} height={14} rx={2} fill={f} />
      ))}
    </g>
  );
}

// 0 · Hook. The old value for key k sits in the log; the new value lands after it; a day bar fills, and the old value
// is still there, outlined.
export function Hook({ t }: StepCtx) {
  const day = easeInOut(seg(t, 1.4, 3.2));
  return (
    <Svg label="a compacted topic's old value, still readable a full day after the new one landed" h={200}>
      <Cell x={25} y={40} w={150} label="k: old value" o={easeOut(seg(t, 0, 0.3))} stroke={day >= 1 ? C.cherryText : C.mocha} />
      <Cell x={lerp(165, 185, easeOut(seg(t, 0.5, 0.9)))} y={40} w={150} label="k: new value" o={easeOut(seg(t, 0.5, 0.9))} stroke={C.focus} />
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        a full day passes
      </T>
      <rect x={25} y={120} width={525} height={8} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.2, 1.5))} />
      <rect x={25} y={120} width={525 * day} height={8} rx={3} fill={C.latte} />
      <T x={25} y={170} s={12} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.7))}>
        the old value: still readable
      </T>
      <T x={25} y={192} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        exactly what the settings promise
      </T>
    </Svg>
  );
}

const KEYS = ['a', 'b', 'c', 'a', 'b', 'a', 'd', 'b'];
const LATEST = [2, 5, 6, 7];

// 1 · Setup. One strip of keyed records; below it two copies under two rules: by age, the oldest three fade; by key,
// every superseded record fades and the newest per key stays.
export function Setup({ t }: StepCtx) {
  const age = easeOut(seg(t, 1.6, 2.2));
  const key = easeOut(seg(t, 3.0, 3.6));
  const row = (y: number, gone: (i: number) => number, k: number) => KEYS.map((c, i) => <Cell key={i} x={150 + i * 50} y={y} w={44} label={c} o={k * (1 - 0.8 * gone(i))} />);
  return (
    <Svg label="the same partition strip, now governed by two different retention rules" h={200}>
      <T x={25} y={58} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        the strip
      </T>
      {row(40, () => 0, easeOut(seg(t, 0, 0.4)))}
      <T x={25} y={118} s={12} f={C.crema} o={easeOut(seg(t, 1.2, 1.5))}>
        delete by age
      </T>
      {row(100, (i) => (i < 3 ? age : 0), easeOut(seg(t, 1.2, 1.5)))}
      <T x={25} y={178} s={12} f={C.crema} o={easeOut(seg(t, 2.6, 2.9))}>
        compact by key
      </T>
      {row(160, (i) => (LATEST.includes(i) ? 0 : key), easeOut(seg(t, 2.6, 2.9)))}
    </Svg>
  );
}

// 2 · Predict. Three segments under a retention line; the oldest record in the first ages out. On answer the whole
// first segment fades together, not the one record.
export function PredictSegment({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="retention kicks in — does it remove one record, or a whole segment at once?" h={200}>
      {[0, 1, 2].map((i) => (
        <Segment
          key={i}
          x={25 + i * 180}
          y={lerp(50, 50 + (i === 0 ? 20 : 0), v)}
          w={165}
          n={4}
          o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15)) * (i === 0 ? 1 - 0.75 * v : 1)}
          stroke={i === 0 && v > 0 ? C.cherryText : C.mocha}
          f={i === 0 && v > 0 ? C.cherryText : C.latte}
        />
      ))}
      <rect x={35} y={60} width={14} height={14} rx={2} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={answer === null ? easeOut(seg(t, 0.7, 1.0)) : 0} />
      <T x={25} y={120} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        one record has aged out
      </T>
      <AnswerRow y={178} label="retention removes" answer={answer} value="a whole segment" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Segment retention, measured. seg-1, seg-2 and seg-3 under a dashed retention window; seg-1's newest record is
// past it, so seg-1 drops away whole in cherry; the other two keep a tick.
export function RevealSegment({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="three segments, measured against a retention window: one deleted whole, two kept whole" h={260}>
      {['seg-1', 'seg-2', 'seg-3'].map((n, i) => {
        const x = 25 + i * 180;
        const k = easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25));
        return (
          <g key={n}>
            <T x={x} y={44} s={12} f={i === 0 ? C.cherryText : C.crema} o={k}>
              {n}
            </T>
            {i === 0 ? (
              drop < 1 && <Segment x={x} y={lerp(54, 110, drop)} w={165} n={4} o={k * (1 - drop)} stroke={drop > 0 ? C.cherryText : C.mocha} f={drop > 0 ? C.cherryText : C.latte} />
            ) : (
              <Segment x={x} y={54} w={165} n={4} o={k} />
            )}
            {i > 0 && <MiniTick x={x + 75} y={110} k={easeOut(seg(t, 3.0 + i * 0.2, 3.3 + i * 0.2))} />}
          </g>
        );
      })}
      <line x1={195} y1={30} x2={195} y2={150} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.6))} />
      <T x={195} y={170} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
        retention window
      </T>
      <T x={25} y={210} s={12} f={C.crema} o={easeOut(seg(t, 3.5, 3.9))}>
        deleted: seg-1, whole
      </T>
      <T x={25} y={236} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>
        kept: seg-2 and seg-3, whole
      </T>
    </Svg>
  );
}

// 4 · Predict. A new value supersedes an old one; the log's dirty part grows a little under a threshold mark. On answer
// the cleaner waits.
export function PredictDirty({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="the cleaner and a superseded record — does it rewrite immediately, or wait for something?" h={200}>
      <rect x={25} y={50} width={500} height={20} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={25} y={50} width={500 * 0.2 * easeOut(seg(t, 0.3, 1.0))} height={20} rx={3} fill={C.cherryText} opacity={0.55} />
      <line x1={275} y1={40} x2={275} y2={80} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={275} y={98} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        threshold
      </T>
      <T x={25} y={36} s={11} f={C.cherryText} o={easeOut(seg(t, 0.4, 0.7))}>
        superseded records
      </T>
      {v > 0 && (
        <T x={25} y={130} s={11} f={C.focus} o={v}>
          the cleaner waits for the threshold
        </T>
      )}
      <AnswerRow y={178} label="the cleaner" answer={answer} value="waits" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 5 · Dirty ratio, measured. The dirty fill grows to just under the threshold: the cleaner stays idle. It grows past:
// a cleaning pass fires and the dirty fill shrinks back.
export function RevealDirty({ t }: StepCtx) {
  const g1 = easeInOut(seg(t, 0.3, 1.4)) * 0.4;
  const g2 = easeInOut(seg(t, 2.0, 2.8)) * 0.25;
  const clean = easeInOut(seg(t, 3.2, 4.0));
  const dirty = (g1 + g2) * (1 - clean * 0.85);
  const fired = t >= 3.0;
  return (
    <Svg label="the dirty ratio, measured below and above its configured threshold" h={200}>
      <T x={25} y={36} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        dirty ratio
      </T>
      <rect x={25} y={46} width={500} height={20} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={25} y={46} width={500 * dirty} height={20} rx={3} fill={C.cherryText} opacity={0.55} />
      <line x1={275} y1={36} x2={275} y2={76} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={275} y={94} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        threshold
      </T>
      <Cell x={25} y={120} w={200} label={fired ? 'cleaning pass fires' : 'cleaner idle'} o={easeOut(seg(t, 0.6, 0.9))} stroke={fired ? C.focus : C.mocha} f={fired ? C.focus : C.latte} />
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        below: nothing, on purpose
      </T>
      <T x={300} y={180} s={11} f={C.focus} o={easeOut(seg(t, 3.1, 3.4))}>
        above: a pass runs
      </T>
    </Svg>
  );
}

// 6 · Lag window. An age axis with a floor and a ceiling. One record slides in left of the floor: never eligible. One
// slides past the ceiling: forced eligible. Two sit in between, where the ratio decides.
export function RevealLagWindow({ t }: StepCtx) {
  const pips: [number, number, string, string][] = [
    [80, 0.3, 'too fresh: never', C.latte],
    [520, 1.3, 'past ceiling: forced', C.focus],
    [300, 2.3, 'in between: the ratio', C.second],
  ];
  return (
    <Svg label="a record measured at three ages: too fresh, forced eligible, and in between" h={260}>
      <line x1={25} y1={80} x2={550} y2={80} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={25} y={104} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        record age
      </T>
      <line x1={160} y1={50} x2={160} y2={110} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={440} y1={50} x2={440} y2={110} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={160} y={42} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        floor
      </T>
      <T x={440} y={42} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        ceiling
      </T>
      {pips.map(([x, k0, label, f], i) => {
        const k = easeInOut(seg(t, k0, k0 + 0.7));
        return (
          <g key={i}>
            <circle cx={lerp(25, x, k)} cy={80} r={8} fill={f} opacity={easeOut(seg(t, k0, k0 + 0.2))} />
            <T x={25} y={150 + i * 30} s={12} f={f} o={easeOut(seg(t, k0 + 0.6, k0 + 0.9))}>
              {label}
            </T>
          </g>
        );
      })}
      <T x={25} y={245} s={11} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>
        only the middle stretch depends on the dirty ratio
      </T>
    </Svg>
  );
}

// 7 · Tombstone. A delete marker for k sits in the log with its own expiry bar. Consumer A reaches it in time: seen.
// The marker expires and fades; consumer B arrives after: missed, in cherry.
export function RevealTombstone({ t }: StepCtx) {
  const expire = easeInOut(seg(t, 0.4, 2.6));
  const gone = easeOut(seg(t, 2.6, 3.0));
  const a = easeInOut(seg(t, 0.8, 1.8));
  const b = easeInOut(seg(t, 2.2, 3.6));
  return (
    <Svg label="a tombstone, measured against a consumer that catches up in time and one that lags too far" h={200}>
      <rect x={25} y={40} width={525} height={30} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      {gone < 1 && <Cell x={400} y={41} w={140} label="k: delete" o={1 - gone} stroke={C.cherryText} />}
      <rect x={400} y={78} width={140 * (1 - expire)} height={5} rx={2} fill={C.second} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <path d={`M${lerp(30, 380, a)} 104 l6 -10 l6 10 z`} fill={C.focus} opacity={easeOut(seg(t, 0.6, 0.8))} />
      <T x={25} y={124} s={11} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
        consumer A, in time: tombstone seen
      </T>
      <path d={`M${lerp(30, 380, b)} 154 l6 -10 l6 10 z`} fill={C.cherryText} opacity={easeOut(seg(t, 2.0, 2.2))} />
      <T x={25} y={176} s={11} f={C.cherryText} o={easeOut(seg(t, 3.6, 3.9))}>
        consumer B, too late: the delete is missed
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="segment check" value="deleted whole" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="dirty ratio" value="gate crossed" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="lag window" value="floor and ceiling" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={185} label="tombstone" value="seen, then missed" k={easeOut(seg(t, 2.6, 3.1))} />
      <Tick y={222} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the tombstone's own clock outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['deletion by age: whole segments', 'compaction: a dirty-ratio gate, floor and ceiling', 'a tombstone runs on its own clock'];
  return (
    <Svg label="segment-granularity deletion, a dirty-ratio gate, a lag window, and a tombstone that expires on its own schedule" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
