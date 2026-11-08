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

// Every value drawn here is examples.py's own: the timetable's 2026-01-01 and 2026-01-02, the ten backfilled days from
// 2026-01-01 to 2026-01-10, the cap of 2 active runs, and the six runs already done before the kill. Years, days and
// requests that the narration counts in words are drawn as blocks and pips.

// 0 · Monday's extract sends a trickle of requests to the source. Then five year blocks pour the same requests into it all
// at once; its load bar runs red and it starts timing out.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const load = clamp(seg(t, 1.8, 3.2));
  return (
    <Svg label="a five year backfill. the same source, five years over." h={250}>
      <Cell x={25} y={40} w={170} label="Monday's extract" o={k(0)} />
      {[0, 1, 2].map((j) => {
        const m = seg(t, 0.4 + j * 0.3, 0.9 + j * 0.3);
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(200, 420, m)} y={lerp(54, 100, m)} s={8} f={C.focus} /> : null;
      })}
      <Cell x={425} y={90} w={150} label="the source" o={k(0.1)} stroke={load >= 1 ? C.cherryText : C.mocha} />
      {[0, 1, 2, 3, 4].map((j) => (
        <rect key={j} x={25 + j * 34} y={130} width={28} height={22} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={k(1.3 + j * 0.08)} />
      ))}
      {t > 1.5 && (
        <T x={25} y={176} s={11} f={C.caramel} o={k(1.5)}>
          five years of the same extract
        </T>
      )}
      {Array.from({ length: 24 }, (_, j) => {
        const d = 1.6 + j * 0.07;
        const m = seg(t, d, d + 0.45);
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(200, 420, m)} y={lerp(141, 108, m)} s={8} f={C.caramel} /> : null;
      })}
      <rect x={425} y={130} width={150} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
      <rect x={425} y={130} width={20 + 130 * load} height={10} rx={3} fill={load >= 1 ? C.cherryText : C.caramel} opacity={k(0.2)} />
      {t > 3.2 && (
        <T x={425} y={160} s={11} f={C.cherryText} o={k(3.2)}>
          timing out
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={230} s={12} f={C.crema} o={k(3.9)}>
          same query, five years of times over, all at once
        </T>
      )}
    </Svg>
  );
}

// 1 · An interval strip. The run is tagged with its logical date at the strip's start; the bracket it owns grows to the
// next day; a clock dot walks to the end, and only there does the run execute.
export function RevealLogicalDate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const own = easeInOut(seg(t, 1.6, 2.4));
  const clock = easeInOut(seg(t, 2.4, 3.3));
  return (
    <Svg label="logical date is the interval start, not the run time." h={250}>
      <Cell x={50} y={40} w={230} label="logical date: 2026-01-01" o={k(1.0)} stroke={C.second} />
      {t > 1.6 && (
        <T x={270} y={88} s={11} f={C.second} a="middle" o={k(1.6)}>
          owns the data
        </T>
      )}
      <rect x={120} y={96} width={300 * own} height={14} rx={2} fill={C.second} opacity={own > 0 ? 0.7 : 0} />
      <line x1={60} y1={120} x2={540} y2={120} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      {[120, 420].map((x) => (
        <line key={x} x1={x} y1={112} x2={x} y2={128} stroke={C.crema} strokeWidth={1.5} opacity={k(0.4)} />
      ))}
      <T x={120} y={146} s={11} f={C.taupe} a="middle" o={k(0.6)}>
        2026-01-01
      </T>
      <T x={420} y={146} s={11} f={C.taupe} a="middle" o={k(0.7)}>
        2026-01-02
      </T>
      {clock > 0 && <circle cx={lerp(120, 420, clock)} cy={120} r={5} fill={clock >= 1 ? C.focus : C.crema} />}
      {t > 3.4 && (
        <T x={420} y={174} s={12} f={C.focus} a="middle" o={k(3.4)}>
          runs once the day closes
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={230} s={11} f={C.taupe} o={k(4.0)}>
          read from Airflow's own timetable
        </T>
      )}
    </Svg>
  );
}

// 2 · Two rows of missed days. Catchup on: the scheduler starts at the first missed day and walks forward. Catchup off:
// it jumps to the latest finished day, and every day before it goes dashed, never scheduled.
export function RevealCatchup({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const skip = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="catchup on: first missed day. catchup off: latest day." h={250}>
      <T x={25} y={50} s={12} f={C.crema} o={k(0)}>
        catchup on
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const lit = t > 0.8 + i * 0.25;
        return <rect key={i} x={25 + i * 55} y={62} width={45} height={24} rx={3} fill="none" stroke={lit ? C.focus : C.mocha} strokeWidth={lit ? 2 : 1.5} opacity={k(0.1)} />;
      })}
      <T x={25} y={106} s={11} f={C.taupe} o={k(0.6)}>
        2026-01-01
      </T>
      <T x={25} y={130} s={12} f={C.crema} o={k(1.2)}>
        catchup off, the default
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const last = i === 7;
        const lit = last && t > 2.6;
        if (!last && skip > 0) return <Hole key={i} x={25 + i * 55} y={142} w={45} h={24} stroke={C.cherryText} o={skip} />;
        return <rect key={i} x={25 + i * 55} y={142} width={45} height={24} rx={3} fill="none" stroke={lit ? C.caramel : C.mocha} strokeWidth={lit ? 2 : 1.5} opacity={k(1.3)} />;
      })}
      {t > 3.0 && (
        <T x={25} y={190} s={11} f={C.cherryText} o={k(3.0)}>
          never scheduled
        </T>
      )}
      {t > 2.6 && (
        <T x={432} y={190} s={11} f={C.caramel} a="middle" o={k(2.6)}>
          latest finished
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={230} s={12} f={C.focus} o={k(3.8)}>
          one setting decides whether history exists
        </T>
      )}
    </Svg>
  );
}

// 3 · Predict. Today's load and a backfill both send requests to one source. Is there a separate budget for the backfill?
// Once answered, the dashed "own budget" fades and both streams fill the one budget bar.
export function PredictBudget({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="same requests, five years of them. whose budget?" h={250}>
      <Cell x={25} y={40} w={160} label="today's load" o={k(0)} />
      <Cell x={25} y={120} w={160} label="backfill" o={k(0.1)} stroke={C.caramel} />
      <Cell x={400} y={76} w={175} label="the source" o={k(0.2)} />
      <Fan x1={190} y1={54} x2={394} y2={86} k={k(0.4)} f={C.focus} />
      <Fan x1={190} y1={134} x2={394} y2={96} k={k(0.5)} f={C.caramel} />
      <rect x={400} y={118} width={175} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.3)} />
      <rect x={400} y={118} width={175 * (0.35 + 0.65 * v)} height={10} rx={3} fill={v > 0.5 ? C.cherryText : C.focus} opacity={k(0.3)} />
      <Hole x={230} y={160} w={150} o={k(0.8) * (1 - v)} />
      {v < 1 && (
        <T x={305} y={178} s={11} f={C.taupe} a="middle" o={k(0.8) * (1 - v)}>
          its own budget?
        </T>
      )}
      {answer === null && t > 1.2 && (
        <T x={300} y={222} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the same budget, the source's own" y={222} />
    </Svg>
  );
}

const STATE = { wait: C.mocha, run: C.caramel, done: C.focus };

/** One day's box in the task-state grid, outlined by its state, with a progress sliver while it runs. */
function Day({ x, y, state, p = 0, o = 1 }: { x: number; y: number; state: keyof typeof STATE; p?: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={45} height={28} rx={3} fill={C.cocoa} stroke={STATE[state]} strokeWidth={state === 'wait' ? 1.5 : 2.2} />
      {state === 'run' && <rect x={x + 4} y={y + 20} width={37 * p} height={4} rx={1} fill={C.caramel} />}
    </g>
  );
}

// 4 · Ten days in a row, waiting. Two at a time turn running, fill, and finish, then the next two start: never three.
export function RevealBoundedConcurrency({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="ten days backfilled. never more than two running." h={250}>
      <T x={25} y={40} s={12} f={C.crema} o={k(0)}>
        max active runs: 2
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const d = 0.5 + Math.floor(i / 2) * 0.6;
        const p = seg(t, d, d + 0.55);
        const state = p <= 0 ? 'wait' : p < 1 ? 'run' : 'done';
        return <Day key={i} x={25 + i * 55} y={70} state={state} p={p} o={k(0.2)} />;
      })}
      <T x={25} y={122} s={11} f={C.taupe} o={k(0.3)}>
        2026-01-01
      </T>
      <T x={565} y={122} s={11} f={C.taupe} a="end" o={k(0.3)}>
        2026-01-10
      </T>
      <T x={25} y={160} s={11} f={C.caramel} o={k(0.6)}>
        running
      </T>
      <T x={120} y={160} s={11} f={C.focus} o={k(0.6)}>
        success
      </T>
      <T x={215} y={160} s={11} f={C.taupe} o={k(0.6)}>
        waiting
      </T>
      {t > 3.6 && (
        <T x={25} y={204} s={12} f={C.focus} o={k(3.6)}>
          two running at most, never three
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={232} s={11} f={C.taupe} o={k(4.1)}>
          read back from the real metadata database
        </T>
      )}
    </Svg>
  );
}

// 5 · Six days done, two running, two waiting. The scheduler is killed; on restart the six keep their ticks untouched and
// only the four unfinished days run.
export function RevealKillAndResume({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const killed = t > 1.2 && t < 2.0;
  return (
    <Svg label="six done, killed, restarted. the six stay done." h={250}>
      <Cell x={25} y={30} w={140} label="scheduler" o={k(0)} stroke={killed ? C.cherryText : t >= 2.0 ? C.focus : C.mocha} />
      <Cross x={182} y={44} k={killed ? k(1.2) : 0} />
      {killed && (
        <T x={198} y={48} s={11} f={C.cherryText} o={k(1.2)}>
          killed
        </T>
      )}
      {t >= 2.0 && (
        <T x={180} y={48} s={11} f={C.focus} o={k(2.0)}>
          restarted
        </T>
      )}
      {Array.from({ length: 10 }, (_, i) => {
        if (i < 6) return <Day key={i} x={25 + i * 55} y={90} state="done" o={k(0.2)} />;
        const d = 2.4 + Math.floor((i - 6) / 2) * 0.6;
        const p = seg(t, d, d + 0.55);
        const state = t < 1.2 ? (i < 8 ? 'run' : 'wait') : p <= 0 ? 'wait' : p < 1 ? 'run' : 'done';
        const pre = clamp(seg(t, 0.2, 1.2)) * 0.6;
        return <Day key={i} x={25 + i * 55} y={90} state={state} p={t < 1.2 ? pre : p} o={k(0.2)} />;
      })}
      {Array.from({ length: 6 }, (_, i) => (
        <MiniTick key={i} x={41 + i * 55} y={104} k={easeOut(seg(t, 0.3 + i * 0.08, 0.5 + i * 0.08))} />
      ))}
      <line x1={25} y1={130} x2={lerp(25, 340, k(2.6))} y2={130} stroke={C.focus} strokeWidth={1.5} opacity={k(2.6)} />
      {t > 2.6 && (
        <T x={25} y={150} s={11} f={C.focus} o={k(2.6)}>
          six done, untouched
        </T>
      )}
      <line x1={355} y1={130} x2={lerp(355, 565, k(2.4))} y2={130} stroke={C.caramel} strokeWidth={1.5} opacity={k(2.4)} />
      {t > 2.4 && (
        <T x={355} y={150} s={11} f={C.caramel} o={k(2.4)}>
          only these four run
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={214} s={12} f={C.focus} o={k(4.0)}>
          resumed, not restarted
        </T>
      )}
    </Svg>
  );
}

// 6 · Dagster's two shapes. Default: every partition box spawns its own run. Opt in: one bar covers the whole range in a
// single run.
export function RevealDagsterShape({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const one = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="one run per partition, or one run for the range." h={250}>
      <T x={25} y={36} s={12} f={C.crema} o={k(0)}>
        default: one run per partition
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const r = easeOut(seg(t, 0.4 + i * 0.12, 0.6 + i * 0.12));
        const x = 25 + i * 55;
        return (
          <g key={i}>
            <rect x={x} y={50} width={45} height={24} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.1)} />
            <line x1={x + 22} y1={74} x2={x + 22} y2={lerp(74, 90, r)} stroke={C.caramel} strokeWidth={1.5} opacity={r} />
            <Pip x={x + 22} y={96} s={10} f={C.caramel} o={r} />
          </g>
        );
      })}
      {t > 1.8 && (
        <T x={25} y={126} s={11} f={C.caramel} o={k(1.8)}>
          a run, and a query, each
        </T>
      )}
      <T x={25} y={162} s={12} f={C.crema} o={k(2.2)}>
        opt in: one run, the whole range
      </T>
      <rect x={25} y={174} width={540 * one} height={24} rx={3} fill={C.second} opacity={one > 0 ? 1 : 0} />
      {t > 3.5 && (
        <T x={25} y={220} s={11} f={C.second} o={k(3.5)}>
          one query covers the range
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={242} s={11} f={C.taupe} o={k(4.0)}>
          the same two options, drawn at a different point
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in, one per idea.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['logical date: interval start', 'catchup decides history', 'bounded and resumable', 'same source budget'];
  return (
    <Svg label="interval start. bounded. resumable. same budget." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.cherryText} a="middle" o={k(3.6)}>
          spent on history, not on today
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. Two existing runs inside a backfill range, one succeeded and one failed. Once answered, the backfill sweeps
// across and leaves each one alone.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 1.2)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sweep = lerp(25, 565, v);
  return (
    <Svg label="already succeeded. backfilled again. redone?" h={250}>
      <T x={25} y={44} s={11} f={C.taupe} o={k(0)}>
        backfill range, default setting
      </T>
      <line x1={25} y1={60} x2={565} y2={60} stroke={C.caramel} strokeWidth={1.5} opacity={k(0.1)} />
      <Cell x={120} y={80} w={150} label="success" o={k(0.3)} stroke={C.focus} f={C.focus} />
      <Cell x={330} y={80} w={150} label="failed" o={k(0.5)} stroke={C.cherryText} f={C.cherryText} />
      {v > 0 && v < 1 && <line x1={sweep} y1={66} x2={sweep} y2={120} stroke={C.caramel} strokeWidth={2} />}
      {sweep > 270 && (
        <T x={195} y={136} s={11} f={C.crema} a="middle" o={clamp((sweep - 270) / 40)}>
          left alone
        </T>
      )}
      {sweep > 480 && (
        <T x={405} y={136} s={11} f={C.crema} a="middle" o={clamp((sweep - 480) / 40)}>
          left alone
        </T>
      )}
      {answer === null && t > 1.2 && (
        <T x={300} y={196} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: an existing run is left alone" y={222} />
    </Svg>
  );
}
