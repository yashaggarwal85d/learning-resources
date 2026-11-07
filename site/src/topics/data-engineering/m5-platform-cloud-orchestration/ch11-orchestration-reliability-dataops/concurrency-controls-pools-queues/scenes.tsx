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

// Every value here is examples.py's own: the 2-slot pool fragile_source_pool, the extract_high tasks at weight 10 and the
// extract_low tasks at weight 1, and their start and end times read back from the real run. Those times are drawn as bar
// positions, never printed. The forty tasks of the hook are drawn as pips.

const RUNS: [number, number][] = [
  [0.97, 5.14],
  [1.0, 5.18],
  [5.95, 10.08],
  [5.99, 10.13],
  [10.31, 14.44],
  [10.33, 14.47],
  [14.64, 18.79],
  [14.73, 18.98],
  [19.13, 23.29],
  [19.16, 23.36],
];

// 0 · A backfill and a fan-out each send a swarm of tasks at one unprotected database. Its load bar runs red and it falls
// over, though no single task was wrong.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const load = clamp(seg(t, 1.0, 2.6));
  return (
    <Svg label="forty tasks, one unprotected source. it falls over." h={250}>
      <Cell x={25} y={40} w={140} label="backfill" o={k(0)} />
      <Cell x={25} y={130} w={140} label="fan-out" o={k(0.1)} />
      {Array.from({ length: 40 }, (_, j) => {
        const d = 0.8 + j * 0.04;
        const m = easeIn2(seg(t, d, d + 0.5));
        const y0 = j % 2 === 0 ? 54 : 144;
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(172, 418, m)} y={lerp(y0, 99, m) + ((j % 5) - 2) * 3 * (1 - m)} s={7} f={C.caramel} /> : null;
      })}
      <Cell x={425} y={85} w={150} label="the database" o={k(0.2)} stroke={load >= 1 ? C.cherryText : C.mocha} />
      <rect x={425} y={130} width={150} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.3)} />
      <rect x={425} y={130} width={150 * load} height={10} rx={3} fill={load >= 1 ? C.cherryText : C.caramel} />
      {t > 2.8 && (
        <T x={425} y={160} s={11} f={C.cherryText} o={k(2.8)}>
          falls over
        </T>
      )}
      {t > 3.5 && (
        <T x={25} y={220} s={12} f={C.crema} o={k(3.5)}>
          no single task was wrong
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={242} s={11} f={C.taupe} o={k(4.0)}>
          all forty touched the source at once
        </T>
      )}
    </Svg>
  );
}

// 1 · Ten queued pips. The pool's two slots take them two at a time; each pair sits in the slots, then drops into done,
// and the next pair moves in. Never three.
export function RevealPoolCap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="ten tasks, two slots. never more than two running." h={250}>
      <T x={25} y={80} s={11} f={C.taupe} o={k(0)}>
        ten tasks
      </T>
      <T x={290} y={60} s={11} f={C.crema} o={k(0.1)}>
        fragile_source_pool
      </T>
      <rect x={290} y={70} width={150} height={60} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={k(0.1)} />
      <Hole x={300} y={86} w={60} o={k(0.2)} />
      <Hole x={370} y={86} w={60} o={k(0.2)} />
      <Cell x={470} y={86} w={105} label="source" o={k(0.2)} />
      <Fan x1={440} y1={100} x2={464} y2={100} k={k(0.3)} />
      {Array.from({ length: 10 }, (_, i) => {
        const d = 0.4 + Math.floor(i / 2) * 0.62;
        const into = easeInOut(seg(t, d, d + 0.22));
        const out = easeInOut(seg(t, d + 0.5, d + 0.62));
        const slot = i % 2 === 0 ? 330 : 400;
        const x = out > 0 ? lerp(slot, 298 + i * 14, out) : lerp(30 + i * 22, slot, into);
        const y = out > 0 ? lerp(100, 170, out) : 100;
        return <Pip key={i} x={x} y={y} s={11} f={out >= 1 ? C.focus : into > 0 ? C.caramel : C.crema} o={k(0.05)} />;
      })}
      <T x={290} y={196} s={11} f={C.taupe} o={k(0.6)}>
        done
      </T>
      {t > 3.9 && (
        <T x={25} y={232} s={12} f={C.focus} o={k(3.9)}>
          never more than 2 running, read from the real database
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. Eight weight-1 tasks queued ahead of two weight-10 tasks; one slot opens. Once answered, the weight-10 pips
// arc over the queue, the first into the slot, the second to the front.
export function PredictPriorityOrder({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="two high priority, eight low. who goes first?" h={250}>
      <Hole x={25} y={76} w={60} o={k(0.6)} stroke={C.focus} />
      <T x={25} y={124} s={11} f={C.focus} o={k(0.6)}>
        free slot
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const high = i >= 8;
        const m = answer !== null && high ? easeInOut(seg(s, 0.1 + (i - 8) * 0.3, 0.7 + (i - 8) * 0.3)) : 0;
        const x0 = 120 + i * 30;
        const x1 = i === 8 ? 55 : 100;
        return <Pip key={i} x={lerp(x0, x1, m)} y={90 - 44 * Math.sin(Math.PI * m)} s={high ? 14 : 10} f={high ? C.caramel : C.taupe} o={k(0.1 + i * 0.03)} />;
      })}
      <T x={225} y={124} s={11} f={C.taupe} a="middle" o={k(0.5)}>
        weight 1
      </T>
      <T x={375} y={124} s={11} f={C.caramel} a="middle" o={k(0.5)}>
        weight 10
      </T>
      <T x={120} y={150} s={11} f={C.taupe} o={k(0.8)}>
        waiting, in arrival order
      </T>
      {answer === null && t > 1.2 && (
        <T x={300} y={206} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the higher weight, every time" y={222} />
    </Svg>
  );
}

// 3 · The real run as a Gantt chart, drawn as its clock sweeps: the two extract_high bars first, then the eight
// extract_low bars, two at a time. A dashed line marks where the high pair ends; no low bar starts before it.
export function RevealPriorityMeasured({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const now = seg(t, 0.3, 3.3) * 23.4;
  const X = (s: number) => 140 + s * 18;
  return (
    <Svg label="both high-priority tasks finish before any low one starts." h={250}>
      <T x={25} y={50} s={11} f={C.caramel} o={k(0)}>
        extract_high
      </T>
      <T x={25} y={82} s={11} f={C.second} o={k(0)}>
        extract_low
      </T>
      {RUNS.map(([a, b], i) => {
        const y = 40 + i * 16;
        const e = Math.min(b, now);
        return e > a ? <rect key={i} x={X(a)} y={y} width={X(e) - X(a)} height={11} rx={2} fill={i < 2 ? C.caramel : C.second} /> : null;
      })}
      <line x1={X(5.18) + 3} y1={34} x2={X(5.18) + 3} y2={lerp(34, 200, k(3.4))} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(3.4)} />
      {t > 3.6 && (
        <T x={25} y={222} s={12} f={C.focus} o={k(3.6)}>
          both done before any low one starts
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={244} s={11} f={C.taupe} o={k(4.1)}>
          exact timestamps, the same real run
        </T>
      )}
    </Svg>
  );
}

// 4 · Tasks carry a queue name, drawn as their colour. Each flies to the worker group listening for its name.
export function RevealQueueRouting({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="tasks routed by queue name to specific workers." h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        each task carries a queue name
      </T>
      <Cell x={380} y={50} w={195} label="listens for one name" o={k(0.3)} stroke={C.caramel} />
      <Cell x={380} y={140} w={195} label="listens for another" o={k(0.4)} stroke={C.focus} />
      {Array.from({ length: 6 }, (_, i) => {
        const top = i % 2 === 0;
        const d = 1.0 + i * 0.3;
        const m = easeInOut(seg(t, d, d + 0.6));
        return <Pip key={i} x={lerp(40 + i * 30, 372, m)} y={lerp(100, top ? 64 : 154, m)} s={12} f={top ? C.caramel : C.focus} o={m >= 1 ? 0 : k(0.2)} />;
      })}
      {t > 3.2 && (
        <T x={25} y={204} s={12} f={C.crema} o={k(3.2)}>
          a worker takes only the names it listens to
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={230} s={11} f={C.taupe} o={k(3.9)}>
          needs more than one kind of worker, so not run here
        </T>
      )}
    </Svg>
  );
}

/** Weight-10 pips dropping into two slots, one after another, for as long as `on` holds. */
function Arrivals({ clock, x, on }: { clock: number; x: number[]; on: boolean }) {
  if (!on) return null;
  const m = (clock % 0.6) / 0.6;
  return (
    <g>
      {x.map((cx) => (
        <Pip key={cx} x={cx} y={lerp(24, 74, easeIn2(m))} s={12} f={C.caramel} o={1 - seg(m, 0.85, 1)} />
      ))}
    </g>
  );
}

// 5 · Predict. Weight-10 pips keep dropping into the two slots; a weight-1 pip waits beside them, its wait bar growing.
// Once answered, the arrivals keep coming and the wait bar runs on, red.
export function PredictStarvation({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? clamp(seg(s, 0, 2.5)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="high priority keeps arriving. what about the ones waiting?" h={250}>
      <Hole x={260} y={74} w={60} o={k(0.1)} />
      <Hole x={330} y={74} w={60} o={k(0.1)} />
      <Arrivals clock={t + s} x={[290, 360]} on={t > 0.3} />
      <Pip x={120} y={88} s={12} f={C.taupe} o={k(0.2)} />
      <T x={120} y={124} s={11} f={C.taupe} a="middle" o={k(0.2)}>
        weight 1, waiting
      </T>
      <rect x={60} y={142} width={30 + 50 * clamp(seg(t, 0.4, 2.8)) + 300 * v} height={8} rx={3} fill={v > 0.3 ? C.cherryText : C.caramel} opacity={k(0.4)} />
      {answer === null && t > 1.2 && (
        <T x={300} y={206} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="it can wait indefinitely" y={222} />
    </Svg>
  );
}

// 6 · The same arrivals, unbounded: the weight-1 pip's wait bar runs red into starvation. Then a bound drops in, a
// reservation or a round robin, and the waiting pip finally moves into a slot.
export function RevealStarvation({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const go = easeInOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="the fair mechanism, left unbounded, becomes unfair." h={250}>
      <Hole x={300} y={60} w={60} o={k(0.1)} />
      <Hole x={370} y={60} w={60} o={k(0.1)} />
      <Arrivals clock={t} x={t < 2.9 ? [330, 400] : [400]} on={t > 0.2} />
      <T x={120} y={50} s={11} f={C.taupe} a="middle" o={k(0.2)}>
        weight 1
      </T>
      <Pip x={lerp(120, 330, go)} y={74} s={12} f={go >= 1 ? C.focus : C.taupe} o={k(0.2)} />
      <rect x={60} y={100} width={(30 + 200 * clamp(seg(t, 0.4, 2.6))) * (1 - go)} height={8} rx={3} fill={t > 1.5 ? C.cherryText : C.caramel} opacity={k(0.3)} />
      {t > 1.8 && t < 3.2 && (
        <T x={60} y={128} s={11} f={C.cherryText} o={k(1.8)}>
          starvation, by the same rule
        </T>
      )}
      <Cell x={25} y={150} w={350} label="a bound: a reservation, or round robin" o={k(2.8)} stroke={C.focus} />
      {t > 3.9 && (
        <T x={25} y={222} s={12} f={C.focus} o={k(3.9)}>
          everyone eventually gets a turn
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in, one per idea.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['a pool caps the source', 'priority picks who gets in', 'a queue picks the worker', 'multi-team: still new'];
  return (
    <Svg label="pool caps concurrency. priority decides order. multi-team is new." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          a slot, a weight, a queue name
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The same forty pips, now in front of the two-slot pool. Once answered, two move into the slots, the rest
// wait, and the source stays up.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="same collision, pool in place. does it fall over this time?" h={250}>
      {Array.from({ length: 40 }, (_, j) => {
        const slot = j === 0 ? 275 : 335;
        const x0 = 30 + (j % 10) * 18;
        const y0 = 60 + Math.floor(j / 10) * 18;
        return <Pip key={j} x={j < 2 ? lerp(x0, slot, v) : x0} y={j < 2 ? lerp(y0, 84, v) : y0} s={9} f={j < 2 && v > 0.5 ? C.focus : C.caramel} o={k(0.1 + j * 0.01)} />;
      })}
      <T x={250} y={60} s={11} f={C.taupe} o={k(0.4)}>
        the pool
      </T>
      <Hole x={250} y={70} w={50} o={k(0.4)} />
      <Hole x={310} y={70} w={50} o={k(0.4)} />
      <Cell x={420} y={70} w={155} label="the source" o={k(0.5)} stroke={v > 0.5 ? C.focus : C.mocha} />
      {v > 0.8 && (
        <T x={420} y={124} s={11} f={C.focus} o={v}>
          stays up
        </T>
      )}
      {answer === null && t > 1.2 && (
        <T x={300} y={206} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: two at a time, the rest wait" y={222} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}
