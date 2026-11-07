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

// Every value here is examples.py's own: the 300 log lines and run-4821's fields (task-7, orders_rollup, 2026-10-29), the
// queue at 100 drained by 30 to 70 and the counter's reset to 0, thirty nights with night 17 at 620 minutes against a 90-minute
// threshold, a 15-second scrape against a 4-second job, the pushed 42, and 10 to 10,000 customers. Counts that are computed
// (the matched lines, each night's freshness) are drawn as marks and lengths, never printed.

// 0 · Hook. Five task boxes tick green one by one; "no alert" is crossed. Below, the revenue table they feed turns red:
// stale. Everything reported success, and the one question that mattered was never asked.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="every task green. No alert. Found at nine." h={250}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Cell x={25 + i * 112} y={40} w={96} label="task" o={k(i * 0.15)} stroke={t > 0.4 + i * 0.2 ? C.focus : C.mocha} />
          <MiniTick x={64 + i * 112} y={84} k={k(0.4 + i * 0.2)} />
          <line x1={73 + i * 112} y1={100} x2={300} y2={140} stroke={C.mocha} strokeWidth={1.2} opacity={k(1.4)} />
        </g>
      ))}
      <Cell x={190} y={140} w={220} label="nightly revenue table" o={k(1.5)} stroke={t > 2.4 ? C.cherryText : C.mocha} />
      {t > 2.4 && (
        <T x={420} y={159} s={11} f={C.cherryText} o={k(2.4)}>
          stale
        </T>
      )}
      <Cross x={35} y={154} k={k(1.8)} />
      {t > 1.8 && (
        <T x={50} y={159} s={11} f={C.taupe} o={k(1.8)}>
          no alert
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.4)}>
          never asked the one question that mattered
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Three numbers the pipeline already had: every task succeeded, rows written, the newest partition's age. Once
// answered, the first two are crossed out and the third lights.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const opts = ['every task succeeded', 'rows written', "the newest partition's age"];
  return (
    <Svg label="one number already existed. Which one?" h={250}>
      {opts.map((o, i) => {
        const a = answer !== null ? easeOut(seg(s, 0.1 + i * 0.25, 0.4 + i * 0.25)) : 0;
        return (
          <g key={o}>
            <Cell x={25} y={40 + i * 46} w={300} label={o} o={k(i * 0.2)} stroke={a > 0.5 ? (i === 2 ? C.focus : C.cherryText) : C.mocha} f={a > 0.5 && i < 2 ? C.taupe : C.crema} />
            {i < 2 && <Cross x={345} y={54 + i * 46} k={a} />}
            {i === 2 && <MiniTick x={340} y={146} k={a} />}
          </g>
        );
      })}
      {answer === null && t > 1.0 && (
        <T x={460} y={110} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the age of the newest partition" y={214} />
    </Svg>
  );
}

const FIELDS: [string, string][] = [
  ['run_id', 'run-4821'],
  ['task_id', 'task-7'],
  ['asset', 'orders_rollup'],
  ['partition', '2026-10-29'],
];

// 2 · Structured fields. A sentence log line sits on top, a highlighter crawling along it. Below, the structured record's four
// named fields drop in, and two more records stack behind it with the same four names: every time.
export function RevealStructuredFields({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hl = easeInOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="fields every time, not a sentence." h={250}>
      <rect x={25} y={30} width={550} height={30} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      <rect x={30} y={34} width={540 * hl} height={22} rx={3} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="3 3" />
      <T x={38} y={50} s={11} f={C.latte} o={k(0)}>
        [INFO] worker picked up a job and started processing at some point
      </T>
      {[2, 1].map((j) => (
        <rect key={j} x={25 + j * 10} y={86 - j * 8} width={300} height={124} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(2.8 + (2 - j) * 0.3)} />
      ))}
      <rect x={25} y={86} width={300} height={124} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} opacity={k(1.0)} />
      {FIELDS.map(([f, v], i) => (
        <g key={f} opacity={k(1.2 + i * 0.35)} transform={`translate(${((1 - k(1.2 + i * 0.35)) * 12).toFixed(1)} 0)`}>
          <T x={40} y={112 + i * 26} s={11} f={C.second}>
            {f}
          </T>
          <T x={140} y={112 + i * 26} s={11} f={C.crema}>
            {v}
          </T>
        </g>
      ))}
      {t > 3.4 && (
        <T x={360} y={150} s={11} f={C.focus} o={k(3.4)}>
          the same names, every time
        </T>
      )}
    </Svg>
  );
}

// 3 · Correlation. 300 lines from four runs as a grid. A cursor reads them all, row by row. Then one query by run_id:
// everything else fades, and only this run's own lines remain lit.
export function RevealCorrelationCost({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const read = easeInOut(seg(t, 0.3, 2.2));
  const q = easeOut(seg(t, 2.6, 3.2));
  const mine = (i: number) => (i * 7 + 3) % 3 === 0;
  return (
    <Svg label="three hundred lines. One key, ninety-three back." h={250}>
      {Array.from({ length: 300 }, (_, i) => {
        const r = Math.floor(i / 20);
        const seen = i / 300 < read;
        const on = mine(i);
        return <rect key={i} x={25 + (i % 20) * 15} y={36 + r * 10} width={12} height={5} rx={1} fill={on && q > 0.5 ? C.focus : seen ? C.latte : C.mocha} opacity={q > 0 && !on ? 1 - 0.85 * q : 1} />;
      })}
      {read > 0 && read < 1 && <rect x={22} y={33 + Math.floor(read * 15) * 10} width={306} height={11} rx={2} fill="none" stroke={C.second} strokeWidth={1.4} />}
      <T x={350} y={70} s={11} f={C.latte} o={k(0.3)}>
        300 lines, four runs
      </T>
      {t > 2.2 && (
        <T x={350} y={94} s={11} f={C.taupe} o={k(2.2)}>
          a human reads them all
        </T>
      )}
      <Cell x={350} y={120} w={225} label="run_id = run-4821" o={k(2.6)} stroke={C.focus} />
      {t > 3.3 && (
        <T x={350} y={176} s={11} f={C.focus} o={k(3.3)}>
          only this run's records
        </T>
      )}
    </Svg>
  );
}

// 4 · The counter. rows_processed_total climbs in steps, a red dashed line marks the process restarting, the line drops to
// zero, and it climbs again: up, or back to the start.
export function RevealCounter({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const d = easeInOut(seg(t, 0.3, 3.0));
  const pts: [number, number][] = [];
  for (let i = 0; i <= 20; i++) {
    const x = 60 + i * 25;
    const v = i <= 11 ? i * 11 : (i - 12) * 11;
    pts.push([x, 190 - v]);
  }
  const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  return (
    <Svg label="only up, until a restart." h={250}>
      <T x={25} y={32} s={11} f={C.crema} o={k(0)}>
        rows_processed_total
      </T>
      <line x1={60} y1={190} x2={575} y2={190} stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      <path d={path} fill="none" stroke={C.latte} strokeWidth={2.2} strokeDasharray="900" strokeDashoffset={900 * (1 - d)} />
      <line x1={347} y1={60} x2={347} y2={196} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="5 4" opacity={k(1.7)} />
      {t > 1.7 && (
        <T x={355} y={76} s={11} f={C.cherryText} o={k(1.7)}>
          restart
        </T>
      )}
      {t > 3.1 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.1)}>
          a counter: up, or back to the start
        </T>
      )}
    </Svg>
  );
}

// 5 · The gauge. queue_depth's level falls from 100 to 70 as 30 drain. Beside it the same fall is forced through a counter:
// the decrease is crossed out and the only fall it knows, a reset, drops it to 0, red, against the real 70.
export function RevealGauge({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const drain = easeInOut(seg(t, 0.6, 1.6));
  const reset = easeIn2(seg(t, 2.8, 3.3));
  const sc = 1.4;
  return (
    <Svg label="a real depth of seventy. A counter answers zero." h={250}>
      <T x={25} y={32} s={11} f={C.crema} o={k(0)}>
        queue_depth: a gauge
      </T>
      <rect x={60} y={200 - lerp(100, 70, drain) * sc} width={80} height={lerp(100, 70, drain) * sc} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={2} />
      <T x={150} y={204 - lerp(100, 70, drain) * sc} s={12} f={C.crema} o={k(0.2)}>
        {drain > 0.5 ? '70' : '100'}
      </T>
      <T x={330} y={32} s={11} f={C.crema} o={k(1.8)}>
        forced through a counter
      </T>
      <rect
        x={360}
        y={200 - lerp(100, 0, reset) * sc}
        width={80}
        height={lerp(100, 0, reset) * sc}
        rx={2}
        fill={C.cocoa}
        stroke={reset > 0.5 ? C.cherryText : C.latte}
        strokeWidth={2}
        opacity={k(1.8)}
      />
      <T x={450} y={70} s={12} f={C.crema} o={k(2.0)}>
        minus 30
      </T>
      <Cross x={530} y={66} k={k(2.4)} />
      {t > 3.3 && (
        <T x={450} y={196} s={12} f={C.cherryText} o={k(3.3)}>
          0, not 70
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={234} s={12} f={C.crema} o={k(3.8)}>
          a reset is the only fall a counter has
        </T>
      )}
    </Svg>
  );
}

// 6 · The histogram. Observations drop into six buckets and the bars rise, a running sum filling beside them. A dashed
// percentile mark slides to a spot between two bucket edges: an estimate. Two machines' marks, averaged, are crossed out.
export function RevealHistogram({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hs = [30, 70, 100, 60, 30, 14];
  const fill = easeOut(seg(t, 0.3, 2.0));
  const est = easeInOut(seg(t, 2.3, 3.0));
  return (
    <Svg label="buckets and a sum. A quantile is an estimate." h={250}>
      <T x={25} y={32} s={11} f={C.crema} o={k(0)}>
        task_duration_seconds
      </T>
      {hs.map((h, i) => (
        <rect key={i} x={60 + i * 62} y={180 - h * fill} width={54} height={h * fill} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.8} />
      ))}
      <line x1={60} y1={180} x2={430} y2={180} stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      <T x={470} y={60} s={11} f={C.latte} o={k(0.6)}>
        running sum
      </T>
      <rect x={470} y={70} width={100 * fill} height={10} rx={2} fill={C.latte} />
      <line x1={lerp(60, 340, est)} y1={60} x2={lerp(60, 340, est)} y2={186} stroke={C.second} strokeWidth={1.8} strokeDasharray="4 3" opacity={k(2.3)} />
      {t > 3.0 && (
        <T x={330} y={204} s={11} f={C.second} o={k(3.0)}>
          interpolated: an estimate
        </T>
      )}
      <Cross x={480} y={130} k={k(3.6)} />
      {t > 3.6 && (
        <T x={498} y={135} s={11} f={C.cherryText} o={k(3.6)}>
          averaged
        </T>
      )}
    </Svg>
  );
}

// 7 · Six signals. Three that carry over from any service, three a pipeline's own. Then freshness as a sawtooth over thirty
// nights against a 90-minute line; night 17 climbs off the top, red, to 620, while thirty task bars below stay green.
export function RevealGoldenSignals({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sig = ['latency', 'errors', 'throughput', 'lag', 'backlog', 'freshness'];
  const draw = easeInOut(seg(t, 1.8, 3.6));
  const fx = (i: number) => 60 + i * 16.5;
  const f = (i: number) => (i === 17 ? 200 : 20 + ((i * 37) % 51));
  const pts: string[] = [];
  for (let i = 0; i < 30; i++) {
    if (i / 30 > draw) break;
    const h = Math.min(f(i), 112);
    pts.push(`${i ? 'L' : 'M'}${fx(i)} 190 L${fx(i) + 14} ${190 - h} L${fx(i) + 14} 190`);
  }
  return (
    <Svg label="six hundred twenty minutes old. Still green." h={250}>
      {sig.map((s, i) => (
        <Cell key={s} x={25 + i * 92} y={24} w={84} h={24} label={s} o={k(0.2 + i * 0.2)} stroke={i === 5 ? C.focus : i > 2 ? C.second : C.mocha} />
      ))}
      <line x1={60} y1={100} x2={560} y2={100} stroke={C.second} strokeWidth={1.4} strokeDasharray="5 4" opacity={k(1.6)} />
      <T x={565} y={96} s={11} f={C.second} a="end" o={k(1.6)}>
        90 min
      </T>
      <path d={pts.join(' ')} fill="none" stroke={draw > 17 / 30 ? C.latte : C.latte} strokeWidth={1.6} />
      {draw > 18 / 30 && <line x1={fx(17) + 14} y1={190} x2={fx(17) + 14} y2={78} stroke={C.cherryText} strokeWidth={2.4} />}
      {draw > 18 / 30 && (
        <T x={fx(17) + 22} y={86} s={11} f={C.cherryText} o={k(3.0)}>
          night 17: 620 min
        </T>
      )}
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={fx(i)} y={204} width={12} height={6} rx={1} fill={C.focus} opacity={k(3.8)} />
      ))}
      {t > 4.2 && (
        <T x={25} y={232} s={11} f={C.focus} o={k(4.2)}>
          every task bar green, the whole time
        </T>
      )}
    </Svg>
  );
}

// 8 · Push or pull. Scrape ticks every 15 seconds; a 4-second job lands between two of them, unseen, crossed out. Pushed
// instead, its 42 reaches a Pushgateway; the job fades, and the gateway keeps answering 42, days later.
export function RevealPushPull({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const s = 500 / 60;
  const job = easeInOut(seg(t, 0.8, 1.2));
  const jx = 60 + 17 * s;
  return (
    <Svg label="a four second job. A fifteen second scrape." h={250}>
      <line x1={60} y1={96} x2={560} y2={96} stroke={C.mocha} strokeWidth={1.4} opacity={k(0)} />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1={60 + i * 15 * s} y1={84} x2={60 + i * 15 * s} y2={108} stroke={C.second} strokeWidth={2} opacity={k(0.2 + i * 0.1)} />
      ))}
      <T x={60 + 7.5 * s} y={124} s={11} f={C.second} a="middle" o={k(0.4)}>
        every 15 s
      </T>
      <rect x={jx} y={62} width={4 * s * job} height={14} rx={2} fill={C.latte} opacity={1 - 0.7 * k(3.0)} />
      {t > 1.2 && (
        <T x={jx + 40} y={60} s={11} f={C.latte} o={k(1.2) * (1 - 0.7 * k(3.0))}>
          a 4 s job
        </T>
      )}
      <Cross x={jx + 16} y={96} k={k(1.6)} />
      <Fan x1={jx + 33} y1={70} x2={328} y2={165} k={k(2.2)} f={C.focus} />
      <Cell x={330} y={150} w={245} label="Pushgateway: 42" o={k(2.3)} stroke={C.focus} />
      {t > 3.4 && (
        <T x={330} y={204} s={11} f={C.cherryText} o={k(3.4)}>
          still 42 days later
        </T>
      )}
    </Svg>
  );
}

// 9 · Cardinality. One counter line splits as a customer label is added: 10 lines, then 100, then many more, too dense to
// count; on the right each customer count's series bar grows on a log scale, 10 to 10,000.
export function RevealCardinality({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ns: [string, number][] = [
    ['10', 1],
    ['100', 2],
    ['1,000', 3],
    ['10,000', 4],
  ];
  const lines = Math.round(lerp(1, 60, easeInOut(seg(t, 0.8, 3.0))));
  return (
    <Svg label="one series. Ten thousand customers later." h={250}>
      <Cell x={25} y={100} w={110} label="a counter" o={k(0)} />
      {Array.from({ length: lines }, (_, i) => (
        <line key={i} x1={135} y1={114} x2={280} y2={36 + (i / Math.max(lines - 1, 1)) * 160} stroke={C.latte} strokeWidth={1} opacity={0.7} />
      ))}
      {ns.map(([n, l], i) => {
        const g = easeOut(seg(t, 0.8 + i * 0.6, 1.3 + i * 0.6));
        return (
          <g key={n}>
            <T x={310} y={56 + i * 40} s={11} f={C.latte} o={k(0.8 + i * 0.6)}>
              {n}
            </T>
            <rect x={370} y={46 + i * 40} width={50 * l * g} height={12} rx={2} fill={i === 3 ? C.cherryText : C.latte} />
          </g>
        );
      })}
      <T x={310} y={30} s={11} f={C.taupe} o={k(0.6)}>
        customers, and series
      </T>
      {t > 3.4 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.4)}>
          each customer, its own series
        </T>
      )}
    </Svg>
  );
}

// 10 · Recap. Four cards slide in: a record's fields and key, the right metric shape, six signals with one a pipeline's own,
// push or pull chosen on purpose.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ["a record's own fields and key", 'the shape a number behaves like', 'six signals, one a pipeline only', 'pushed or pulled, on purpose'];
  return (
    <Svg label="fields and a key. Six signals. Push or pull." h={250}>
      {pts.map((p, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.7, 0.75 + i * 0.7));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          asked the question that matters
        </T>
      )}
    </Svg>
  );
}

// 11 · Prove it. A new stage with throughput and error rate attached writes a table three jobs read. Is that enough? Once
// answered, a third chip, freshness, drops in, with a push arrow from the stage's end.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOutBack(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="no instrumentation yet. Which signal first?" h={250}>
      <Cell x={25} y={70} w={140} label="new stage" o={k(0)} />
      <Cell x={25} y={20} w={140} h={24} label="throughput" o={k(0.2)} />
      <Cell x={175} y={20} w={140} h={24} label="error rate" o={k(0.3)} />
      <Req x1={170} x2={265} y={84} k={k(0.5)} />
      <Cell x={270} y={70} w={110} label="a table" o={k(0.5)} />
      {[0, 1, 2].map((i) => (
        <Fan key={i} x1={380} y1={84} x2={470} y2={50 + i * 34} k={k(0.7 + i * 0.1)} f={C.latte} />
      ))}
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={475} y={38 + i * 34} w={100} h={24} label="a job" o={k(0.8 + i * 0.1)} />
      ))}
      {answer === null && t > 1.2 && (
        <T x={95} y={150} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      {answer !== null && <Cell x={25} y={lerp(110, 130, clamp(v))} w={210} label="freshness, pushed" o={clamp(v)} stroke={C.focus} />}
      <Verdict answer={answer} text="a pushed freshness gauge too" y={214} />
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
