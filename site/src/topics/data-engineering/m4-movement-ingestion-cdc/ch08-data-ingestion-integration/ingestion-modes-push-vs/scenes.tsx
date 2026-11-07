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

const MODES = ['hourly', 'every 30 s', 'continuous'];

/** One mode's lane at y: a time line with its poll ticks (`n` evenly spaced), the example order's dot arriving at
 * x 250 and waiting, a bright segment, until the next tick picks it up. `k` drives the wait. */
function PollLane({ y, n, wait, k, label, value }: { y: number; n: number; wait: number; k: number; label: string; value: string }) {
  const ticks = Array.from({ length: n }, (_, i) => 160 + ((i + 1) * 400) / n);
  return (
    <g>
      <T x={25} y={y + 4} s={11} f={C.latte}>
        {label}
      </T>
      <line x1={160} y1={y} x2={560} y2={y} stroke={C.mocha} strokeWidth={1.4} />
      {ticks.map((x) => (
        <line key={x} x1={x} y1={y - 8} x2={x} y2={y + 8} stroke={C.latte} strokeWidth={n > 40 ? 0.8 : 1.6} />
      ))}
      <circle cx={250} cy={y} r={5} fill={C.second} />
      {k > 0 && <rect x={250} y={y - 3} width={wait * k} height={6} fill={C.focus} />}
      <T x={575} y={y - 14} s={11} f={C.focus} a="end" o={k > 0.98 ? 1 : 0}>
        {value}
      </T>
    </g>
  );
}

// 0 · Hook. The same stream on three lanes, hourly, every thirty seconds, continuous; one order lands at the same
// moment in each and its own wait grows until that lane's next poll picks it up.
export function Hook({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.8, 3.0));
  return (
    <Svg label="the same orders stream, cut three ways. One row's own delay, counting up in each." h={220}>
      <g opacity={easeOut(seg(t, 0.1, 0.5))}>
        <PollLane y={50} n={1} wait={310} k={k} label={MODES[0]} value="3,559.7 s" />
        <PollLane y={110} n={20} wait={12} k={k} label={MODES[1]} value="19.7 s" />
        <PollLane y={170} n={100} wait={3} k={k} label={MODES[2]} value="0.7 s" />
      </g>
      <T x={250} y={208} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        one order arrives
      </T>
    </Svg>
  );
}

/** A pipeline slot: a labelled cell; `hatch` fills it with diagonal hatching (the buffer belongs to the source). */
function Slot({ x, y, w, label, hatch = 0, stroke = C.mocha, o = 1, id }: { x: number; y: number; w: number; label: string; hatch?: number; stroke?: string; o?: number; id: string }) {
  return (
    <g opacity={o}>
      <clipPath id={id}>
        <rect x={x} y={y} width={w} height={34} rx={4} />
      </clipPath>
      <rect x={x} y={y} width={w} height={34} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      {hatch > 0 && (
        <g clipPath={`url(#${id})`} opacity={hatch * 0.6}>
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={x - 34 + i * 12} y1={y + 34} x2={x + i * 12} y2={y} stroke={C.mocha} strokeWidth={3} />
          ))}
        </g>
      )}
      <rect x={x + w / 2 - 34} y={y + 9} width={68} height={17} rx={2} fill={C.cocoa} opacity={hatch > 0 ? 1 : 0} />
      <T x={x + w / 2} y={y + 22} s={12} f={C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}

// 1 · Four positions. Source, sink and cursor draw in; the buffer sits hatched under the source (pull: the consumer
// asks, the source holds the wait); it slides across under the sink and turns plain (push: the consumer holds it).
export function RevealFourPositions({ t }: StepCtx) {
  const m = easeInOut(seg(t, 2.4, 3.4));
  const c = easeOut(seg(t, 1.2, 1.8));
  return (
    <Svg label="source, buffer, sink, cursor. Who owns the buffer flips between pull and push." h={240}>
      <Slot id="imp-src" x={25} y={30} w={130} label="source" o={easeOut(seg(t, 0.1, 0.4))} />
      <Slot id="imp-sink" x={300} y={30} w={130} label="sink" o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={155} y1={47} x2={298} y2={47} stroke={C.mocha} strokeWidth={1.4} />
      <Slot id="imp-cur" x={455} y={30} w={115} label="cursor" o={easeOut(seg(t, 0.5, 0.8))} stroke={C.focus} />
      <rect x={463} y={55} width={99 * c} height={4} fill={C.focus} />
      <Slot id="imp-buf" x={lerp(25, 300, m)} y={110} w={130} label="buffer" hatch={1 - m} stroke={C.latte} o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 1.0, 1.4)) * (1 - m)}>
        {m < 0.5 ? 'pull: the consumer asks; the source holds the wait' : ''}
      </T>
      {m > 0.5 && (
        <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
          push: the source sends; the consumer holds it
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. Batch drops one big block on each scheduled tick; streaming drops small blocks whenever the producer
// sends. Which brings the most unplanned load?
export function PredictSurprise({ t, answer }: StepCtx) {
  const sends = [0.12, 0.2, 0.24, 0.5, 0.53, 0.56, 0.6, 0.83, 0.9];
  return (
    <Svg label="batch does the most work per run. Which mode drops the most unplanned load?" h={200}>
      <T x={25} y={44} s={11} f={C.latte}>
        batch
      </T>
      <line x1={120} y1={60} x2={560} y2={60} stroke={C.mocha} strokeWidth={1.4} />
      {[0.33, 0.66, 1].map((u, i) => (
        <rect key={u} x={120 + u * 420 - 30} y={30} width={30} height={30} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.4 + i * 0.3))} />
      ))}
      <T x={25} y={114} s={11} f={C.latte}>
        streaming
      </T>
      <line x1={120} y1={130} x2={560} y2={130} stroke={C.mocha} strokeWidth={1.4} />
      {sends.map((u, i) => (
        <rect
          key={u}
          x={120 + u * 420}
          y={lerp(100, 116, easeOut(seg(t, 0.3 + i * 0.12, 0.6 + i * 0.12)))}
          width={8}
          height={14}
          fill={C.second}
          opacity={easeOut(seg(t, 0.3 + i * 0.12, 0.6 + i * 0.12))}
        />
      ))}
      <Verdict answer={answer} y={180} text="streaming: no schedule, no shield" />
    </Svg>
  );
}

// 3 · Measured. Across the three hundred orders: average delay and rows handed over per poll, mode by mode, counting in.
export function RevealMeasured({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['hourly', '1,981.3 s', '100.0'],
    ['every 30 s', '14.4 s', '1.19'],
    ['continuous', '0.5 s', '0.040'],
  ];
  return (
    <Svg label="average delay and rows per tick, measured across three hundred orders, three ways." h={250}>
      <T x={360} y={30} s={11} f={C.latte} a="end">
        average delay
      </T>
      <T x={575} y={30} s={11} f={C.latte} a="end">
        rows per poll
      </T>
      {rows.map(([m, d, r], i) => {
        const k = easeOut(seg(t, 0.4 + i * 1.0, 0.8 + i * 1.0));
        return (
          <g key={m} opacity={k} transform={`translate(0 ${((1 - k) * 8).toFixed(1)})`}>
            <T x={25} y={80 + i * 60} s={13} f={C.crema}>
              {m}
            </T>
            <T x={360} y={80 + i * 60} s={15} f={i === 2 ? C.focus : C.crema} a="end">
              {d}
            </T>
            <T x={575} y={80 + i * 60} s={15} f={i === 0 ? C.focus : C.crema} a="end">
              {r}
            </T>
          </g>
        );
      })}
      <T x={25} y={238} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        three hundred orders, one seeded trace
      </T>
    </Svg>
  );
}

// 4 · Moving parts. One, two, three part cells stack up per mode; under each, its own way to fail.
export function RevealMovingParts({ t }: StepCtx) {
  const cols: [string, string[], string][] = [
    ['hourly', ['the cron'], 'a silent late run'],
    ['every 30 s', ['scheduler', 'checkpoint'], 'small runs pile up'],
    ['continuous', ['broker', 'consumer', 'its offset'], 'an open backlog'],
  ];
  return (
    <Svg label="moving parts: one, two, three. Each buys lower latency, and its own new way to fail." h={250}>
      {cols.map(([m, parts, fail], c) => {
        const x = 25 + c * 190;
        const k0 = 0.3 + c * 1.1;
        return (
          <g key={m}>
            <T x={x} y={28} s={12} f={C.crema} o={easeOut(seg(t, k0 - 0.2, k0))}>
              {m}
            </T>
            {parts.map((p, i) => (
              <Cell key={p} x={x} y={150 - i * 40} w={160} h={30} label={p} o={easeOut(seg(t, k0 + i * 0.25, k0 + 0.3 + i * 0.25))} />
            ))}
            <T x={x} y={214} s={11} f={C.cherryText} o={easeOut(seg(t, k0 + 0.8, k0 + 1.1))}>
              {fail}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · Recap. The four slots in a row; under them the three modes, each with a delay bar shrinking left to right and
// its one failure.
export function Recap({ t }: StepCtx) {
  const rows: [string, number, string][] = [
    ['hourly', 300, 'a late run'],
    ['every 30 s', 60, 'small runs'],
    ['continuous', 8, 'a backlog'],
  ];
  return (
    <Svg label="four positions. Three cuts, measured. One failure mode each." h={250}>
      {['source', 'buffer', 'sink', 'cursor'].map((s, i) => (
        <Cell key={s} x={25 + i * 140} y={24} w={124} h={30} label={s} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} />
      ))}
      {rows.map(([m, w, f], i) => {
        const k = easeOut(seg(t, 1.2 + i * 0.8, 1.8 + i * 0.8));
        return (
          <g key={m}>
            <T x={25} y={104 + i * 50} s={12} f={C.crema} o={k}>
              {m}
            </T>
            <rect x={140} y={93 + i * 50} width={w * k} height={12} fill={C.latte} />
            <T x={575} y={104 + i * 50} s={11} f={C.cherryText} a="end" o={k}>
              {f}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}
