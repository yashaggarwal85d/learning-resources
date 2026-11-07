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

// Every value drawn here is examples.py's own: the rows order_1, order_2 and order_3, the interval 2026-10-30 and its
// file name, the real trigger_rule_demo states read back from Airflow 3.3.2's metadata database. Row counts are drawn as
// rows, and the stuck task's time is named in words.

// 0 · Three rows go in. The first attempt writes all three, then is killed. The retry writes them again, and the output
// holds twice as many rows as went in, while the log says only that the retry succeeded.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const p1 = easeInOut(seg(t, 0.3, 1.1));
  const p2 = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="a worker dies mid-task. the retry doubles the row count." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        rows in
      </T>
      {[0, 1, 2].map((j) => (
        <Pip key={j} x={35 + j * 22} y={60} s={12} f={C.crema} o={k(0.05)} />
      ))}
      <Cell x={120} y={46} w={140} label="attempt one" o={k(0.1)} stroke={t > 1.3 ? C.cherryText : C.mocha} />
      <rect x={120} y={80} width={140 * p1} height={5} rx={2} fill={C.second} />
      <Cross x={278} y={60} k={k(1.3)} />
      {t > 1.4 && (
        <T x={120} y={104} s={11} f={C.cherryText} o={k(1.4)}>
          killed
        </T>
      )}
      <T x={400} y={30} s={11} f={C.taupe} o={k(0.2)}>
        output
      </T>
      <rect x={400} y={40} width={175} height={90} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      {[0, 1, 2].map((j) => {
        const m = easeInOut(seg(t, 0.5 + j * 0.2, 0.9 + j * 0.2));
        return m > 0 ? <Pip key={j} x={lerp(270, 430 + j * 24, m)} y={lerp(60, 66, m)} s={12} f={C.second} /> : null;
      })}
      {t > 1.8 && (
        <T x={25} y={148} s={11} f={C.caramel} o={k(1.8)}>
          retry
        </T>
      )}
      <Cell x={120} y={130} w={140} label="attempt two" o={k(1.8)} />
      <rect x={120} y={164} width={140 * p2} height={5} rx={2} fill={C.second} />
      {[0, 1, 2].map((j) => {
        const m = easeInOut(seg(t, 2.2 + j * 0.2, 2.6 + j * 0.2));
        return m > 0 ? <Pip key={j} x={lerp(270, 430 + j * 24, m)} y={lerp(144, 102, m)} s={12} f={C.cherryText} /> : null;
      })}
      {t > 3.3 && (
        <T x={487} y={164} s={12} f={C.cherryText} a="middle" o={k(3.3)}>
          twice as many
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={230} s={11} f={C.taupe} o={k(3.9)}>
          the log: retried, succeeded. nothing about the duplicates
        </T>
      )}
    </Svg>
  );
}

// 1 · A timeline. Attempt one runs and drops its output before the scheduler loses track of it. The retry runs the same
// work and drops its output too: at least once, never exactly once.
export function RevealAtLeastOnce({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const a1 = easeInOut(seg(t, 0.2, 1.4));
  const a2 = easeInOut(seg(t, 2.4, 3.4));
  const drop1 = easeIn2(seg(t, 0.9, 1.3));
  const drop2 = easeIn2(seg(t, 3.0, 3.4));
  return (
    <Svg label="retried does not mean ran once. it may have already written." h={250}>
      {t > 1.7 && (
        <T x={262} y={54} s={11} f={C.cherryText} a="middle" o={k(1.7)}>
          scheduler loses track
        </T>
      )}
      <line x1={262} y1={64} x2={262} y2={lerp(64, 140, k(1.7))} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(1.7)} />
      <T x={40} y={80} s={11} f={C.crema} o={k(0.1)}>
        attempt one
      </T>
      <rect x={40} y={90} width={200 * a1} height={24} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={a1 > 0 ? 1 : 0} />
      {t > 2.3 && (
        <T x={300} y={80} s={11} f={C.caramel} o={k(2.3)}>
          retry
        </T>
      )}
      <rect x={300} y={90} width={200 * a2} height={24} rx={4} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} opacity={a2 > 0 ? 1 : 0} />
      <T x={40} y={160} s={11} f={C.taupe} o={k(0.3)}>
        output
      </T>
      <rect x={40} y={168} width={520} height={24} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.3)} />
      {drop1 > 0 && <Pip x={210} y={lerp(114, 180, drop1)} s={12} f={C.second} />}
      {drop2 > 0 && <Pip x={470} y={lerp(114, 180, drop2)} s={12} f={C.caramel} />}
      {t > 3.6 && (
        <T x={25} y={216} s={12} f={C.crema} o={k(3.6)}>
          ran at least once, never exactly once
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={240} s={12} f={C.focus} o={k(4.1)}>
          a retry is safe only if twice does no harm
        </T>
      )}
    </Svg>
  );
}

// 2 · The same three rows written twice into the interval's own file. Overwrite: run two replaces run one, three rows
// stay. Append: run two stacks three more under them, six rows.
export function RevealOverwriteVsAppend({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const names = ['order_1', 'order_2', 'order_3'];
  const gone = easeInOut(seg(t, 2.1, 2.4));
  const back = easeOut(seg(t, 2.5, 2.9));
  return (
    <Svg label="the same task, run twice. one stays correct, one doubles." h={250}>
      <T x={25} y={30} s={12} f={C.focus} o={k(0)}>
        overwrite
      </T>
      <T x={310} y={30} s={12} f={C.cherryText} o={k(0)}>
        append
      </T>
      <T x={25} y={50} s={11} f={C.taupe} o={k(0.1)}>
        orders_2026-10-30.jsonl
      </T>
      <T x={310} y={50} s={11} f={C.taupe} o={k(0.1)}>
        orders_2026-10-30.jsonl
      </T>
      {names.map((n, j) => {
        const first = easeOut(seg(t, 0.4 + j * 0.25, 0.7 + j * 0.25));
        const o = t < 2.1 ? first : t < 2.5 ? 1 - gone : back;
        return <Cell key={`o${n}`} x={25} y={62 + j * 22} w={120} h={20} label={n} o={o} stroke={t > 2.5 ? C.focus : C.mocha} />;
      })}
      {t > 0.5 && t < 2.2 && (
        <T x={160} y={99} s={11} f={C.taupe} o={k(0.5) * (1 - gone)}>
          run one
        </T>
      )}
      {t > 2.4 && (
        <T x={160} y={99} s={11} f={C.focus} o={k(2.4)}>
          run two, replaced
        </T>
      )}
      {names.map((n, j) => (
        <Cell key={`a${n}`} x={310} y={62 + j * 22} w={120} h={20} label={n} o={easeOut(seg(t, 0.4 + j * 0.25, 0.7 + j * 0.25))} />
      ))}
      {names.map((n, j) => (
        <Cell key={`b${n}`} x={310} y={128 + j * 22} w={120} h={20} label={n} o={easeOut(seg(t, 2.2 + j * 0.25, 2.5 + j * 0.25))} stroke={C.cherryText} />
      ))}
      {t > 0.5 && (
        <T x={445} y={99} s={11} f={C.taupe} o={k(0.5)}>
          run one
        </T>
      )}
      {t > 2.2 && (
        <T x={445} y={165} s={11} f={C.cherryText} o={k(2.2)}>
          run two
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={218} s={12} f={C.focus} o={k(3.4)}>
          still three rows
        </T>
      )}
      {t > 3.4 && (
        <T x={310} y={218} s={12} f={C.cherryText} o={k(3.4)}>
          six rows
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={242} s={11} f={C.crema} o={k(4.0)}>
          same task, same retry: only the write mode differs
        </T>
      )}
    </Svg>
  );
}

// 3 · Predict. A timeout and a malformed row both head for the retry box. Once answered, the bad row's line swings away
// to fail fast instead.
export function PredictTimeoutVsDataError({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a timeout, and a bad row. retried the same way?" h={250}>
      <Cell x={25} y={40} w={200} label="task one: timeout" o={k(0)} />
      <Cell x={25} y={120} w={200} label="task two: bad row" o={k(0.15)} stroke={v > 0.5 ? C.cherryText : C.mocha} />
      <Cell x={380} y={76} w={160} label="retry" o={k(0.4)} stroke={C.focus} />
      <Fan x1={230} y1={54} x2={374} y2={86} k={k(0.6)} f={C.focus} />
      <Fan x1={230} y1={134} x2={374} y2={lerp(96, 164, v)} k={k(0.75)} f={v > 0.5 ? C.cherryText : C.caramel} />
      <Cell x={380} y={150} w={160} label="fail fast" o={v} stroke={C.cherryText} f={C.cherryText} />
      {answer === null && t > 1.0 && (
        <T x={300} y={206} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: a bad row should fail fast" y={222} />
    </Svg>
  );
}

// 4 · The real trigger_rule_demo run. a_fails runs and fails. b_default_rule never starts and is recorded upstream_failed.
// c_one_failed_rule starts because something upstream failed, and succeeds.
export function RevealTriggerRulesReal({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ra = easeInOut(seg(t, 0.3, 1.0));
  const rc = easeInOut(seg(t, 2.6, 3.4));
  const failed = t > 1.0;
  return (
    <Svg label="one fails. one default-rule task never runs. one runs anyway." h={250}>
      <Cell x={25} y={100} w={150} label="a_fails" o={k(0)} stroke={failed ? C.cherryText : C.mocha} />
      <rect x={25} y={132} width={150 * ra} height={4} rx={2} fill={C.second} />
      {failed && (
        <T x={100} y={156} s={12} f={C.cherryText} a="middle" o={k(1.0)}>
          failed
        </T>
      )}
      <Fan x1={180} y1={114} x2={224} y2={64} k={k(0.2)} />
      <Fan x1={180} y1={114} x2={224} y2={164} k={k(0.3)} />
      <Cell x={230} y={50} w={170} label="b_default_rule" o={k(0.1)} stroke={t > 1.8 ? C.cherryText : C.mocha} />
      <T x={230} y={98} s={11} f={C.taupe} o={k(0.5)}>
        default rule
      </T>
      <Cell x={230} y={150} w={170} label="c_one_failed_rule" o={k(0.2)} stroke={t > 3.4 ? C.focus : C.mocha} />
      <rect x={230} y={182} width={170 * rc} height={4} rx={2} fill={C.second} />
      <T x={230} y={202} s={11} f={C.taupe} o={k(0.6)}>
        one_failed rule
      </T>
      {t > 1.8 && (
        <T x={420} y={69} s={12} f={C.cherryText} o={k(1.8)}>
          upstream_failed
        </T>
      )}
      {t > 2.2 && (
        <T x={420} y={89} s={11} f={C.taupe} o={k(2.2)}>
          never ran
        </T>
      )}
      {t > 2.6 && t < 3.4 && (
        <T x={420} y={169} s={12} f={C.crema} o={k(2.6)}>
          running
        </T>
      )}
      {t > 3.4 && (
        <T x={420} y={169} s={12} f={C.focus} o={k(3.4)}>
          success
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(4.0)}>
          Airflow 3.3.2, read back from the metadata database
        </T>
      )}
    </Svg>
  );
}

// 5 · Heartbeats travel from the worker to the scheduler. The worker dies; the pulses stop. The scheduler's quiet timer
// fills until it marks the task failed, an assumption, not a certainty.
export function RevealZombiesByTheBook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const dead = t > 1.8;
  const quiet = clamp(seg(t, 2.0, 3.0));
  return (
    <Svg label="a worker dies silently. a missed heartbeat is the only sign." h={250}>
      <Cell x={25} y={60} w={150} label="worker" o={k(0)} stroke={dead ? C.cherryText : C.mocha} />
      <Cell x={425} y={60} w={150} label="scheduler" o={k(0.1)} />
      <T x={300} y={50} s={11} f={C.taupe} a="middle" o={k(0.2)}>
        heartbeat
      </T>
      {[0.3, 0.9, 1.5].map((d) => {
        const m = seg(t, d, d + 0.5);
        return m > 0 && m < 1 ? <Pip key={d} x={lerp(185, 415, m)} y={74} s={8} f={C.focus} /> : null;
      })}
      <Cross x={160} y={74} k={k(1.8)} />
      <rect x={425} y={110} width={150} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(2.0)} />
      <rect x={425} y={110} width={150 * quiet} height={10} rx={3} fill={quiet >= 1 ? C.cherryText : C.caramel} />
      {t > 2.1 && (
        <T x={425} y={140} s={11} f={C.taupe} o={k(2.1)}>
          quiet too long
        </T>
      )}
      <Cell x={425} y={156} w={150} label="marked failed" o={k(3.1)} stroke={C.cherryText} f={C.cherryText} />
      {t > 3.8 && (
        <T x={25} y={220} s={12} f={C.cherryText} o={k(3.8)}>
          it assumes the worker is gone
        </T>
      )}
      {t > 4.2 && (
        <T x={25} y={242} s={11} f={C.taupe} o={k(4.2)}>
          it cannot know the task did not just finish
        </T>
      )}
    </Svg>
  );
}

// 6 · Attempt after attempt runs into the timeout wall and is cut off. Each one drains a pip from the retry budget, and
// the moment someone notices arrives only after the budget is gone.
export function RevealTimeoutsRetryBudget({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const starts = [0.3, 1.0, 1.7, 2.4];
  return (
    <Svg label="a timeout caps the run. retrying a doomed task spends the budget." h={250}>
      <line x1={400} y1={36} x2={400} y2={160} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="5 4" opacity={k(0)} />
      <T x={400} y={28} s={11} f={C.caramel} a="middle" o={k(0)}>
        timeout
      </T>
      {starts.map((d, i) => {
        const g = easeIn2(seg(t, d, d + 0.5));
        return (
          <g key={d}>
            <rect x={60} y={44 + i * 30} width={340 * g} height={16} rx={2} fill={C.second} opacity={g > 0 ? 1 : 0} />
            <Cross x={414} y={52 + i * 30} k={k(d + 0.5)} />
          </g>
        );
      })}
      <T x={25} y={194} s={11} f={C.taupe} o={k(0.2)}>
        retry budget
      </T>
      {starts.map((d, j) => (
        <Pip key={j} x={150 + j * 24} y={190} s={12} f={C.focus} o={k(0.2) * (1 - 0.8 * easeOut(seg(t, d + 0.6, d + 0.8)))} />
      ))}
      <Cell x={400} y={176} w={175} label="someone notices" o={k(3.4)} stroke={C.cherryText} />
      {t > 3.9 && (
        <T x={25} y={238} s={12} f={C.crema} o={k(3.9)}>
          spent on nothing, and the problem found later
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in, one per idea.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['at least once, never exactly', 'overwrite survives a retry', 'trigger rules, measured', 'retries are a budget'];
  return (
    <Svg label="at least once. overwrite survives. trigger rules measured. a budget." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          a budget, not a blanket fix
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. A task shows running for six hours, its log empty. Once answered, its heartbeat line draws in: a few
// beats, then flat.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const beat = 'M25 160 h40 l8 -14 l8 26 l8 -12 h50 l8 -14 l8 26 l8 -12 h411';
  return (
    <Svg label="running for hours. no log, no progress. what now?" h={250}>
      <Cell x={25} y={40} w={200} label="state: running" o={k(0)} />
      <Cell x={330} y={40} w={245} label="log: no errors, no output" o={k(0.2)} />
      <rect x={25} y={90} width={400 * easeInOut(seg(t, 0.3, 1.2))} height={10} rx={3} fill={C.caramel} />
      {t > 1.2 && (
        <T x={25} y={122} s={11} f={C.taupe} o={k(1.2)}>
          six hours
        </T>
      )}
      <path d={beat} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="640" strokeDashoffset={640 * (1 - v)} />
      {v > 0.8 && (
        <T x={575} y={148} s={11} f={C.cherryText} a="end" o={v}>
          quiet
        </T>
      )}
      {answer === null && t > 1.4 && (
        <T x={300} y={196} s={15} f={C.taupe} a="middle" o={k(1.4)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="check its heartbeat" y={222} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}
