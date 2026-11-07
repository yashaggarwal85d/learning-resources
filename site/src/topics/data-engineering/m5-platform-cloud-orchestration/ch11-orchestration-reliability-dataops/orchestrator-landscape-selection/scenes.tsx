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

// Every value here is the sources' own, verified word for word in examples.py: Standard's one year and exactly-once,
// Express's five minutes and at-least-once, Distributed Map's 10,000 parallel children each with its own history, Prefect 3,
// and Lakeflow Jobs as the renamed Databricks Workflows. Engineer time in the hook is drawn as bar lengths.

const AXES = ['data-awareness', 'operational burden', 'ecosystem', 'how hard to leave'];

// 0 · A team picks Airflow because everyone uses it. A year on, the bar for keeping it healthy outgrows the bar for
// writing the pipelines; a managed option's bar stays a stub.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g1 = easeOut(seg(t, 1.0, 1.6));
  const g2 = easeInOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="picked because everyone uses it. wrong quadrant for the job." h={250}>
      <Cell x={25} y={30} w={140} label="Airflow" o={k(0)} />
      <T x={180} y={49} s={11} f={C.taupe} o={k(0.4)}>
        everyone else uses it
      </T>
      <T x={575} y={74} s={11} f={C.taupe} a="end" o={k(1.0)}>
        a year later
      </T>
      <T x={25} y={98} s={11} f={C.crema} o={k(1.0)}>
        writing the pipelines
      </T>
      <rect x={210} y={88} width={120 * g1} height={14} rx={2} fill={C.second} opacity={g1 > 0 ? 1 : 0} />
      <T x={25} y={128} s={11} f={C.crema} o={k(1.6)}>
        keeping it healthy
      </T>
      <rect x={210} y={118} width={340 * g2} height={14} rx={2} fill={g2 >= 1 ? C.cherryText : C.caramel} opacity={g2 > 0 ? 1 : 0} />
      <T x={25} y={168} s={11} f={C.focus} o={k(3.0)}>
        a managed option
      </T>
      <rect x={210} y={158} width={40 * k(3.1)} height={14} rx={2} fill={C.focus} />
      {t > 3.8 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.8)}>
          not wrong in general, wrong for this job
        </T>
      )}
    </Svg>
  );
}

// 1 · Four axes, one by one, each with its two ends; a marker slides along each to show a tool gets placed on all four.
export function RevealGrid({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ends = [
    ['on a clock', 'reacts to data'],
    ['someone else runs it', 'you run it'],
    ['thin', 'rich'],
    ['easy', 'hard'],
  ];
  const at = [0.75, 0.6, 0.85, 0.4];
  return (
    <Svg label="four axes, not one best tool." h={250}>
      {AXES.map((a, i) => {
        const y = 46 + i * 45;
        const d = 0.3 + i * 0.7;
        const m = easeInOut(seg(t, d + 0.3, d + 0.9));
        return (
          <g key={a}>
            <T x={25} y={y} s={12} f={C.crema} o={k(d)}>
              {a}
            </T>
            <line x1={230} y1={y - 4} x2={560} y2={y - 4} stroke={C.mocha} strokeWidth={1.5} opacity={k(d)} />
            <T x={230} y={y + 16} s={11} f={C.taupe} o={k(d)}>
              {ends[i][0]}
            </T>
            <T x={560} y={y + 16} s={11} f={C.taupe} a="end" o={k(d)}>
              {ends[i][1]}
            </T>
            {m > 0 && <circle cx={lerp(230, 230 + 330 * at[i], m)} cy={y - 4} r={6} fill={C.focus} />}
          </g>
        );
      })}
      {t > 3.9 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(3.9)}>
          every tool gets placed on all four
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. The four axes as cards. Which one explains the team's pick? Once answered, all four dim and a fifth card,
// familiarity, lights.
export function PredictWhichAxis({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="which axis did the hook's team actually get wrong?" h={250}>
      {AXES.map((a, i) => (
        <Cell key={a} x={25 + (i % 2) * 285} y={40 + Math.floor(i / 2) * 50} w={265} label={a} o={k(0.1 + i * 0.1) * (1 - 0.65 * v)} />
      ))}
      <Cell x={160} y={150} w={280} label="familiarity" o={v} stroke={C.caramel} f={C.caramel} />
      {answer === null && t > 1.0 && (
        <T x={300} y={170} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="none of the four: familiarity" y={222} />
    </Svg>
  );
}

// 3 · Two lanes. Standard: a long bar, up to one year, each step once. Express: a short bar, up to five minutes, and a
// step that may run twice.
export function RevealStandardExpress({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g1 = easeInOut(seg(t, 0.3, 1.3));
  const g2 = easeInOut(seg(t, 1.9, 2.3));
  return (
    <Svg label="standard vs express, sourced from aws's own docs." h={250}>
      <T x={25} y={42} s={12} f={C.crema} o={k(0)}>
        Standard
      </T>
      <rect x={140} y={30} width={420 * g1} height={14} rx={2} fill={C.second} opacity={g1 > 0 ? 1 : 0} />
      <T x={140} y={66} s={11} f={C.taupe} o={k(1.2)}>
        up to one year
      </T>
      <T x={560} y={66} s={11} f={C.focus} a="end" o={k(1.4)}>
        exactly-once
      </T>
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={150 + i * 30} y={88} s={10} f={C.focus} o={k(1.5 + i * 0.1)} />
      ))}
      <T x={25} y={132} s={12} f={C.crema} o={k(1.7)}>
        Express
      </T>
      <rect x={140} y={120} width={40 * g2} height={14} rx={2} fill={C.second} opacity={g2 > 0 ? 1 : 0} />
      <T x={140} y={156} s={11} f={C.taupe} o={k(2.3)}>
        up to five minutes
      </T>
      <T x={560} y={156} s={11} f={C.caramel} a="end" o={k(2.5)}>
        at-least-once
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Pip x={150 + i * 30} y={178} s={10} f={C.focus} o={k(2.6 + i * 0.1)} />
          {i === 1 && <Pip x={lerp(150 + i * 30, 166 + i * 30, k(3.1))} y={lerp(178, 170, k(3.1))} s={10} f={C.caramel} o={k(3.1)} />}
        </g>
      ))}
      {t > 3.9 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.9)}>
          same name, two promises, two prices
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. A parent workflow faces a pile of discovered items. A hand-rolled loop? Once answered, the loop fades and
// lines fan out to a column of managed child runs.
export function PredictFanoutPrimitive({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="does a serverless state machine have its own fan-out primitive?" h={250}>
      <Cell x={25} y={80} w={150} label="the parent" o={k(0)} />
      <circle cx={232} cy={94} r={22} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(0.4) * (1 - v)} />
      {v < 1 && (
        <T x={266} y={99} s={11} f={C.taupe} o={k(0.5) * (1 - v)}>
          a hand-rolled loop?
        </T>
      )}
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <Fan x1={180} y1={94} x2={394} y2={35 + i * 14} k={v} f={C.second} />
          <rect x={400} y={30 + i * 14} width={60} height={10} rx={2} fill="none" stroke={C.second} strokeWidth={1.2} opacity={v} />
        </g>
      ))}
      {answer === null && t > 1.0 && (
        <T x={300} y={190} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="yes: a managed primitive" y={226} />
    </Svg>
  );
}

// 5 · Distributed Map fans out into a field of child pips, up to 10,000 by default. Then two history strips: the parent's,
// and a child's own, kept apart.
export function RevealDistributedMap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="distributed map: 10,000 parallel child executions, sourced." h={250}>
      <Cell x={25} y={40} w={150} label="Distributed Map" o={k(0)} stroke={C.second} />
      {Array.from({ length: 100 }, (_, j) => (
        <Pip key={j} x={226 + (j % 20) * 16} y={44 + Math.floor(j / 20) * 16} s={8} f={C.second} o={easeOut(seg(t, 0.4 + j * 0.014, 0.55 + j * 0.014))} />
      ))}
      {t > 2.0 && (
        <T x={220} y={134} s={12} f={C.focus} o={k(2.0)}>
          up to 10,000 children in parallel
        </T>
      )}
      <rect x={25} y={160} width={150} height={10} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={k(2.6)} />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={40 + i * 36} y1={160} x2={40 + i * 36} y2={170} stroke={C.crema} strokeWidth={1.2} opacity={k(2.7 + i * 0.08)} />
      ))}
      <T x={25} y={190} s={11} f={C.taupe} o={k(2.6)}>
        the parent's history
      </T>
      <rect x={300} y={160} width={150} height={10} rx={2} fill="none" stroke={C.second} strokeWidth={1.2} opacity={k(3.0)} />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={320 + i * 44} y1={160} x2={320 + i * 44} y2={170} stroke={C.second} strokeWidth={1.2} opacity={k(3.1 + i * 0.08)} />
      ))}
      <T x={300} y={190} s={11} f={C.second} o={k(3.0)}>
        a child's own history
      </T>
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.8)}>
          kept separate, by design
        </T>
      )}
    </Svg>
  );
}

// 6 · The rest of the field slides in, one row per tool, each with the one trait that places it.
export function RevealTheField({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    ['Dagster', 'Python-native, dynamic'],
    ['Prefect 3', 'Python-native, dynamic'],
    ['Kestra', 'declarative YAML'],
    ['Netflix Maestro', 'sourced, not runnable here'],
    ['Lakeflow Jobs', 'was Databricks Workflows'],
    ['Data Factory', 'Azure and Fabric'],
    ['Google Workflows', 'serverless, managed'],
  ];
  return (
    <Svg label="the rest of the field, placed on the same grid." h={250}>
      {rows.map(([n, d], i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.45, 0.7 + i * 0.45));
        return (
          <g key={n} opacity={a} transform={`translate(${((1 - a) * -12).toFixed(2)} 0)`}>
            <T x={25} y={36 + i * 28} s={12} f={C.crema}>
              {n}
            </T>
            <T x={270} y={36 + i * 28} s={11} f={C.taupe}>
              {d}
            </T>
          </g>
        );
      })}
      {t > 3.9 && (
        <T x={25} y={240} s={11} f={C.focus} o={k(3.9)}>
          each placed on the same four axes
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. The four axes as cards, then the team's real reason struck through beneath them.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="four axes, not one best tool." h={250}>
      {AXES.map((p, i) => {
        const d = 0.3 + i * 0.7;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 40 + Math.floor(i / 2) * 60;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      <Cell x={200} y={164} w={200} label="what you already know" o={k(3.2)} stroke={C.cherryText} />
      <line x1={215} y1={178} x2={lerp(215, 385, k(3.6))} y2={178} stroke={C.cherryText} strokeWidth={2} opacity={k(3.6)} />
      {t > 3.9 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.9)}>
          the team optimized for none of the four
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. A short, frequent workload with two candidate lines, Airflow and an Express workflow. Once answered, the
// Express line lights and the Airflow one fades.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a different workload. same grid, same tool?" h={250}>
      <Cell x={25} y={80} w={170} label="the workload" o={k(0)} />
      <T x={25} y={132} s={11} f={C.taupe} o={k(0.3)}>
        short, very frequent, no custom code
      </T>
      <Cell x={380} y={40} w={195} label="Airflow" o={k(0.5) * (1 - 0.6 * v)} />
      <Cell x={380} y={120} w={195} label="Express workflow" o={k(0.6)} stroke={v > 0.5 ? C.focus : C.mocha} />
      <Fan x1={200} y1={90} x2={374} y2={54} k={k(0.8)} f={C.taupe} />
      <line x1={200} y1={98} x2={lerp(200, 374, k(0.8))} y2={lerp(98, 134, k(0.8))} stroke={v > 0.5 ? C.focus : C.taupe} strokeWidth={v > 0.5 ? 2.4 : 1.6} />
      {answer === null && t > 1.0 && (
        <T x={300} y={190} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="somewhere else: an Express workflow" y={222} />
    </Svg>
  );
}
