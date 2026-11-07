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

// Every value here is examples.py's own: the 40 downstream dashboards, the ones on fct_orders (every seventh, drawn as lit
// boxes and never counted on screen), the assets raw_orders through fct_inventory, and the 30 partitions with
// 2026-10-08 to 2026-10-10 loaded twice, 2 rows instead of 1. Rows and dashboards are drawn as pips and boxes.

const HIT = (j: number) => j % 7 === 0;

/** The forty downstream dashboards as a grid of boxes; `hit` lights the truly affected ones, `dim` fades the rest. */
function Dashboards({ x, y, cols, k, hit = 0, dim = 0, f = C.mocha }: { x: number; y: number; cols: number; k: number; hit?: number; dim?: number; f?: string }) {
  return (
    <g>
      {Array.from({ length: 40 }, (_, j) => (
        <rect
          key={j}
          x={x + (j % cols) * 31}
          y={y + Math.floor(j / cols) * 30}
          width={24}
          height={20}
          rx={2}
          fill="none"
          stroke={HIT(j) && hit > 0.5 ? C.cherryText : f}
          strokeWidth={HIT(j) && hit > 0.5 ? 2.2 : 1.3}
          opacity={k * (HIT(j) ? 1 : 1 - 0.7 * dim)}
        />
      ))}
    </g>
  );
}

// 0 · Duplicate rows pile into the revenue table. Beside it, forty downstream dashboards flicker with the one question no
// one could answer: which are affected?
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="duplicate rows landed. nobody knew what else was touched." h={250}>
      <Cell x={25} y={40} w={170} label="revenue table" o={k(0)} stroke={t > 2.0 ? C.cherryText : C.mocha} />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <Pip x={35 + i * 26} y={92} s={11} f={C.crema} o={k(0.2 + i * 0.05)} />
          <Pip x={35 + i * 26} y={110} s={11} f={C.cherryText} o={easeOut(seg(t, 1.0 + i * 0.15, 1.2 + i * 0.15))} />
        </g>
      ))}
      {t > 2.0 && (
        <T x={25} y={146} s={11} f={C.cherryText} o={k(2.0)}>
          duplicates, for days
        </T>
      )}
      {Array.from({ length: 40 }, (_, j) => (
        <rect
          key={j}
          x={300 + (j % 8) * 34}
          y={30 + Math.floor(j / 8) * 30}
          width={26}
          height={20}
          rx={2}
          fill="none"
          stroke={t > 2.4 && (Math.floor(t * 5) + j) % 6 === 0 ? C.caramel : C.mocha}
          strokeWidth={1.3}
          opacity={k(0.3 + j * 0.01)}
        />
      ))}
      {t > 2.8 && (
        <T x={300} y={200} s={12} f={C.crema} o={k(2.8)}>
          which ones are affected?
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(3.6)}>
          nobody had ever run that query
        </T>
      )}
    </Svg>
  );
}

// 1 · The five stages as a ladder of cards, lighting in turn while a pip walks beneath them, each with its short job.
export function RevealLoop({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const stages = ['detect', 'triage', 'contain', 'repair', 'postmortem'];
  const jobs = ['spot it', 'how bad', 'halt it', 'only bad', 'no blame'];
  const walk = clamp(seg(t, 0.4, 3.6)) * 4;
  return (
    <Svg label="detect. triage. contain. repair. postmortem." h={250}>
      {stages.map((s, i) => (
        <g key={s}>
          <Cell x={25 + i * 112} y={80} w={100} label={s} o={k(0.1 + i * 0.1)} stroke={walk >= i - 0.05 ? C.focus : C.mocha} />
          <T x={75 + i * 112} y={150} s={11} f={C.taupe} a="middle" o={walk >= i - 0.05 ? 1 : 0.25}>
            {jobs[i]}
          </T>
        </g>
      ))}
      <Pip x={75 + walk * 112} y={126} s={10} f={C.focus} o={k(0.4)} />
      {t > 4.0 && (
        <T x={300} y={220} s={12} f={C.crema} a="middle" o={k(4.0)}>
          one incident, start to finish
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. The bad table and forty dashboards, all outlined as if every one must be told. Once answered, only the
// exact dependents light and the rest dim.
export function PredictBlastRadius({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="is notifying everyone downstream the safe default?" h={250}>
      <Cell x={25} y={80} w={150} label="bad table" o={k(0)} stroke={C.cherryText} />
      <Dashboards x={260} y={40} cols={10} k={k(0.2)} hit={v} dim={v} f={v > 0.5 ? C.mocha : C.caramel} />
      {v < 0.5 && (
        <T x={260} y={178} s={11} f={C.caramel} o={k(0.6) * (1 - 2 * v)}>
          notify every one?
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={100} y={170} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: compute who depends on it" y={222} />
    </Svg>
  );
}

// 3 · The declared graph: raw_orders splits to the orders and inventory chains. The walk starts at stg_orders and lights
// only its descendants: fct_orders and the dashboards on it. The inventory side's dashboards stay untouched.
export function RevealBlastRadius({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const w = (d: number) => t > d;
  return (
    <Svg label="computed from declared edges, not guessed." h={250}>
      <Cell x={25} y={100} w={120} label="raw_orders" o={k(0)} />
      <line x1={145} y1={110} x2={165} y2={64} stroke={C.mocha} strokeWidth={1.4} opacity={k(0.1)} />
      <line x1={145} y1={118} x2={165} y2={164} stroke={C.mocha} strokeWidth={1.4} opacity={k(0.1)} />
      <Cell x={165} y={50} w={125} label="stg_orders" o={k(0.1)} stroke={w(1.0) ? C.cherryText : C.mocha} />
      <Cell x={165} y={150} w={125} label="stg_inventory" o={k(0.2)} />
      <line x1={290} y1={64} x2={310} y2={64} stroke={w(1.6) ? C.cherryText : C.mocha} strokeWidth={1.6} opacity={k(0.2)} />
      <line x1={290} y1={164} x2={310} y2={164} stroke={C.mocha} strokeWidth={1.4} opacity={k(0.2)} />
      <Cell x={310} y={50} w={125} label="fct_orders" o={k(0.3)} stroke={w(2.0) ? C.cherryText : C.mocha} />
      <Cell x={310} y={150} w={125} label="fct_inventory" o={k(0.4)} />
      <line x1={435} y1={64} x2={455} y2={74} stroke={w(2.4) ? C.cherryText : C.mocha} strokeWidth={1.6} opacity={k(0.5)} />
      <line x1={435} y1={164} x2={455} y2={172} stroke={C.mocha} strokeWidth={1.4} opacity={k(0.5)} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={455} y={40 + i * 13} width={120} height={9} rx={2} fill="none" stroke={w(2.6 + i * 0.08) ? C.cherryText : C.mocha} strokeWidth={1.4} opacity={k(0.5)} />
      ))}
      {Array.from({ length: 34 }, (_, j) => (
        <rect key={j} x={455 + (j % 6) * 20} y={140 + Math.floor(j / 6) * 14} width={14} height={9} rx={2} fill="none" stroke={w(3.2) ? C.focus : C.mocha} strokeWidth={1.2} opacity={k(0.6)} />
      ))}
      {t > 3.2 && (
        <T x={310} y={204} s={11} f={C.focus} o={k(3.2)}>
          never at risk
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(3.8)}>
          computed from declared edges, not from memory
        </T>
      )}
    </Svg>
  );
}

/** Thirty partitions in a strip; the three stale ones in red, each with `rows(i)` pips inside. */
function Partitions({ y, k, fixed = 0 }: { y: number; k: number; fixed?: number }) {
  return (
    <g>
      {Array.from({ length: 30 }, (_, i) => {
        const bad = i >= 7 && i <= 9;
        return (
          <g key={i} opacity={k}>
            <rect x={25 + i * 18} y={y} width={14} height={30} rx={2} fill="none" stroke={bad ? (fixed > 0.5 ? C.focus : C.cherryText) : C.mocha} strokeWidth={bad ? 2 : 1.2} />
            <rect x={29 + i * 18} y={y + 6} width={6} height={6} rx={1} fill={C.crema} />
            {bad && <rect x={29 + i * 18} y={y + 17} width={6} height={6} rx={1} fill={C.cherryText} opacity={1 - fixed} />}
          </g>
        );
      })}
    </g>
  );
}

// 4 · Predict. Thirty partitions, three of them holding doubled rows. Delete them? Once answered, a dashed quarantine box
// and a lock close around the three, and they stay.
export function PredictContain({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="does containing mean deleting the bad data?" h={250}>
      <T x={25} y={60} s={11} f={C.taupe} o={k(0)}>
        stg_orders, by partition
      </T>
      <Partitions y={76} k={k(0.1)} />
      <rect x={147} y={70} width={58} height={42} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.8} strokeDasharray="4 3" opacity={v} />
      <Lock x={168} y={136} k={v} f={C.caramel} />
      {v > 0.5 && (
        <T x={176} y={168} s={11} f={C.caramel} a="middle" o={v}>
          quarantined, kept
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={360} y={170} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: mark them, keep them for now" y={222} />
    </Svg>
  );
}

// 5 · Contain: the three partitions are boxed and the downstream read is crossed off. Repair: only those three reload, the
// doubled pip in each fades, and the rest of the table is never touched.
export function RevealContainRepair({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fixed = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="quarantine the few. backfill only those." h={250}>
      {t < 2.4 && (
        <T x={25} y={40} s={11} f={C.caramel} o={k(0.8)}>
          contain: mark them, halt the reads
        </T>
      )}
      {t >= 2.4 && (
        <T x={25} y={40} s={11} f={C.focus} o={k(2.4)}>
          repair: reload only those three
        </T>
      )}
      <Partitions y={56} k={k(0)} fixed={fixed} />
      <rect x={147} y={50} width={58} height={42} rx={4} fill="none" stroke={fixed > 0.5 ? C.focus : C.caramel} strokeWidth={1.8} strokeDasharray="4 3" opacity={k(1.0)} />
      <T x={25} y={116} s={11} f={C.cherryText} o={k(0.5)}>
        2026-10-08 to 2026-10-10
      </T>
      <Fan x1={250} y1={92} x2={394} y2={152} k={k(1.2)} f={C.taupe} />
      <Cross x={322} y={122} k={k(1.6) * (1 - fixed)} />
      <Cell x={400} y={140} w={175} label="downstream reads" o={k(1.2)} stroke={fixed > 0.5 ? C.focus : C.mocha} />
      {t > 3.9 && (
        <T x={25} y={230} s={12} f={C.crema} o={k(3.9)}>
          touch exactly what is wrong, nothing more
        </T>
      )}
    </Svg>
  );
}

// 6 · Three roles. The commander holds the state; only the ops lead's line reaches the system; the communication lead fans
// one voice out to everyone else.
export function RevealRoles({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="commander. ops. communication. nobody drives twice." h={250}>
      <Cell x={200} y={30} w={200} label="incident commander" o={k(0)} stroke={C.focus} />
      <T x={410} y={49} s={11} f={C.taupe} o={k(0.5)}>
        holds the state
      </T>
      <Fan x1={300} y1={60} x2={110} y2={116} k={k(0.9)} />
      <Fan x1={300} y1={60} x2={490} y2={116} k={k(1.0)} />
      <Cell x={25} y={120} w={170} label="ops lead" o={k(1.1)} />
      <Cell x={405} y={120} w={170} label="communication lead" o={k(1.2)} />
      <line x1={110} y1={150} x2={110} y2={lerp(150, 188, k(1.8))} stroke={C.focus} strokeWidth={2} opacity={k(1.8)} />
      <Cell x={25} y={190} w={170} label="the system" o={k(1.9)} />
      {t > 2.2 && (
        <T x={205} y={209} s={11} f={C.focus} o={k(2.2)}>
          only one touches it
        </T>
      )}
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <line x1={490} y1={150} x2={lerp(490, 434 + i * 28, k(2.8))} y2={lerp(150, 194, k(2.8))} stroke={C.caramel} strokeWidth={1.2} opacity={k(2.8)} />
          <Pip x={434 + i * 28} y={200} s={10} f={C.caramel} o={k(3.0)} />
        </g>
      ))}
      {t > 3.3 && (
        <T x={405} y={230} s={11} f={C.caramel} o={k(3.3)}>
          one voice to everyone
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={244} s={11} f={C.taupe} o={k(3.9)}>
          per the Google SRE Book
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. The five-stage ladder lights, then the two rules beneath it and the hook's real cost.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const stages = ['detect', 'triage', 'contain', 'repair', 'postmortem'];
  return (
    <Svg label="five stages. computed blast radius. a system, not a person, gets fixed." h={250}>
      {stages.map((s, i) => (
        <Cell key={s} x={25 + i * 112} y={40} w={100} label={s} o={k(0.2 + i * 0.25)} stroke={C.focus} />
      ))}
      {t > 1.8 && (
        <T x={25} y={110} s={12} f={C.crema} o={k(1.8)}>
          contain by marking, repair only the marked
        </T>
      )}
      {t > 2.6 && (
        <T x={25} y={140} s={12} f={C.crema} o={k(2.6)}>
          a postmortem that fixes the system
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={210} s={12} f={C.cherryText} o={k(3.6)}>
          the real cost: hours guessing who was touched
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The forty dashboards below the pipeline. Once answered, the real lineage query lights its exact handful and
// the rest dim, never at risk.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="forty downstream dashboards. how many actually affected?" h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        40 dashboards below the pipeline
      </T>
      <Dashboards x={25} y={50} cols={10} k={k(0.1)} hit={v} dim={v} />
      {v > 0.8 && (
        <T x={350} y={90} s={11} f={C.cherryText} o={v}>
          an exact handful
        </T>
      )}
      {v > 0.8 && (
        <T x={350} y={114} s={11} f={C.focus} o={v}>
          the rest: never at risk
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={450} y={100} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="a small, exact handful" y={222} />
    </Svg>
  );
}
