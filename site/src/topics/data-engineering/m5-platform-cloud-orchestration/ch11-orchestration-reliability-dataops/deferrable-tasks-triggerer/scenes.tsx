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

// Every value here is examples.py's own: the first four poke-mode and deferrable task timings from the real run's logs
// (drawn as bar lengths, never printed, since they are machine timings), the threading.Lock that BaseSerialization handed
// back as a str, and the over-ninety-percent drop in worker time. The hundred sensors and the triggerer's documented
// thousand are counted in words and drawn as pips.

const POKE = [15.24, 15.24, 15.11, 15.13];
const DEF_ELAPSED = [16.42, 16.33, 16.35, 16.14];
const DEF_WORKER = [0.23, 0.34, 0.22, 0.22];

/** A grid of a hundred worker slots, each claimed (filled outline) by `claim`, released by `free`. */
function Sensors({ t, claim, free = 0 }: { t: number; claim: (j: number) => number; free?: number }) {
  return (
    <g>
      {Array.from({ length: 100 }, (_, j) => {
        const x = 25 + (j % 10) * 22;
        const y = 34 + Math.floor(j / 10) * 16;
        const c = claim(j);
        const blink = (t * 1.5 + j * 0.37) % 1 < 0.12 && free < 0.5;
        return (
          <g key={j} opacity={c}>
            <rect x={x} y={y} width={16} height={11} rx={2} fill="none" stroke={free > 0.5 ? C.mocha : C.caramel} strokeWidth={1.2} />
            {blink && <rect x={x + 6} y={y + 3} width={4} height={5} fill={C.caramel} />}
          </g>
        );
      })}
    </g>
  );
}

// 0 · A hundred worker slots fill with claimed sensors, each blinking a check now and then. Beside them the CPU bar barely
// moves: the cluster could be asleep.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a hundred sensors, a hundred slots, almost all idle." h={250}>
      <Sensors t={t} claim={(j) => easeOut(seg(t, 0.2 + j * 0.017, 0.4 + j * 0.017))} />
      {t > 2.2 && (
        <T x={300} y={50} s={12} f={C.caramel} o={k(2.2)}>
          a hundred workers, claimed
        </T>
      )}
      <T x={300} y={100} s={11} f={C.taupe} o={k(2.5)}>
        CPU
      </T>
      <rect x={340} y={91} width={235} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(2.5)} />
      <rect x={340} y={91} width={8 * k(2.6)} height={10} rx={3} fill={C.focus} />
      {t > 3.0 && (
        <T x={300} y={130} s={11} f={C.taupe} o={k(3.0)}>
          looks asleep
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.8)}>
          almost all of them doing nothing but waiting
        </T>
      )}
    </Svg>
  );
}

// 1 · Two Gantt groups swept by one clock. Poke: four bars of worker-held time, the whole wait. Deferrable: four outline
// bars of waiting, each with only a sliver of worker time at its start.
export function RevealWorkerOccupancy({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const now = seg(t, 0.3, 3.0) * 16.5;
  const X = (s: number) => 140 + s * 20;
  return (
    <Svg label="same wait, same cap. poke holds the worker the whole time." h={250}>
      <T x={25} y={64} s={12} f={C.crema} o={k(0)}>
        poke
      </T>
      <T x={25} y={154} s={12} f={C.crema} o={k(0)}>
        deferrable
      </T>
      {POKE.map((p, i) => {
        const e = Math.min(p, now);
        return e > 0 ? <rect key={`p${i}`} x={X(0)} y={42 + i * 16} width={X(e) - X(0)} height={11} rx={2} fill={C.caramel} /> : null;
      })}
      {DEF_ELAPSED.map((p, i) => {
        const e = Math.min(p, now);
        const w = Math.min(DEF_WORKER[i], now);
        return e > 0 ? (
          <g key={`d${i}`}>
            <rect x={X(0)} y={132 + i * 16} width={X(e) - X(0)} height={11} rx={2} fill="none" stroke={C.taupe} strokeWidth={1.2} />
            <rect x={X(0)} y={132 + i * 16} width={Math.max(2, X(w) - X(0))} height={11} rx={2} fill={C.caramel} />
          </g>
        ) : null;
      })}
      <T x={480} y={64} s={11} f={C.caramel} o={k(3.0)}>
        worker held
      </T>
      <T x={480} y={154} s={11} f={C.taupe} o={k(3.0)}>
        waiting
      </T>
      {t > 3.6 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.6)}>
          poke held its worker the whole wait
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={244} s={11} f={C.taupe} o={k(4.1)}>
          read from the real task logs of both runs
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. Two rows across the fifteen-second wait, a cursor ten seconds in. Once answered, poke's row fills with held
// worker time through the cursor; deferrable's holds only a sliver at the start.
export function PredictMidWait({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const X = (sec: number) => 140 + sec * 24;
  return (
    <Svg label="ten seconds into the wait, who still holds a worker?" h={250}>
      <T x={25} y={73} s={12} f={C.crema} o={k(0)}>
        poke
      </T>
      <T x={25} y={133} s={12} f={C.crema} o={k(0.1)}>
        deferrable
      </T>
      {[60, 120].map((y) => (
        <rect key={y} x={X(0)} y={y} width={X(15) - X(0)} height={18} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      ))}
      <rect x={X(0)} y={60} width={(X(15) - X(0)) * v} height={18} rx={3} fill={C.caramel} />
      <rect x={X(0)} y={120} width={8 * v} height={18} rx={3} fill={C.caramel} />
      <line x1={X(10)} y1={44} x2={X(10)} y2={146} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(0.5)} />
      <T x={X(10)} y={36} s={11} f={C.focus} a="middle" o={k(0.5)}>
        ten seconds in
      </T>
      {v > 0.8 && (
        <T x={X(10) + 10} y={98} s={11} f={C.caramel} o={v}>
          still holding
        </T>
      )}
      {v > 0.8 && (
        <T x={X(10) + 10} y={160} s={11} f={C.focus} o={v}>
          already let go
        </T>
      )}
      {answer === null && t > 1.1 && (
        <T x={300} y={200} s={15} f={C.taupe} a="middle" o={k(1.1)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="poke still holds it; deferred let go" y={222} />
    </Svg>
  );
}

// 3 · Four held worker slots hand their waits over to the triggerer, where they sit as many small dots in one process.
// The slots go free; a second triggerer is added while workers and scheduler stay as they were.
export function RevealTriggererScaling({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const freed = t > 1.4;
  return (
    <Svg label="the triggerer: one process, many coroutines, scaled on its own." h={250}>
      <Cell x={25} y={40} w={140} label="workers" o={k(0)} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25 + i * 36} y={80} width={28} height={20} rx={3} fill="none" stroke={freed ? C.focus : C.caramel} strokeWidth={1.5} opacity={k(0.1)} />
      ))}
      {[0, 1, 2, 3].map((i) => {
        const m = easeInOut(seg(t, 0.6 + i * 0.12, 1.2 + i * 0.12));
        return m > 0 && m < 1 ? <Pip key={i} x={lerp(39 + i * 36, 330 + i * 40, m)} y={lerp(90, 72, m)} s={8} f={C.caramel} /> : null;
      })}
      {freed && (
        <T x={25} y={124} s={11} f={C.focus} o={k(1.4)}>
          workers free
        </T>
      )}
      <T x={300} y={32} s={11} f={C.crema} o={k(0.3)}>
        triggerer: one process
      </T>
      <rect x={300} y={40} width={275} height={80} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(0.3)} />
      {Array.from({ length: 24 }, (_, j) => (
        <circle key={j} cx={318 + (j % 12) * 21} cy={62 + Math.floor(j / 12) * 28} r={4} fill="none" stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0 + j * 0.05, 1.2 + j * 0.05))} />
      ))}
      <Cell x={25} y={150} w={140} label="scheduler" o={k(0.2)} />
      {t > 2.8 && (
        <T x={25} y={200} s={11} f={C.taupe} o={k(2.8)}>
          untouched
        </T>
      )}
      <rect x={300} y={140} width={275} height={50} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" opacity={k(2.8)} />
      {t > 3.1 && (
        <T x={300} y={210} s={11} f={C.second} o={k(3.1)}>
          scaled on its own
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(3.8)}>
          many small waits, side by side, none doing real work
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. A lock is written down and read back. Refused loudly, or something quieter? Once answered, it comes back as
// plain text, with no error raised.
export function PredictSerialization({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="a trigger holds something unpicklable. what happens?" h={250}>
      <Lock x={40} y={100} k={k(0)} f={C.crema} />
      <Fan x1={66} y1={100} x2={124} y2={100} k={k(0.3)} />
      <Cell x={130} y={86} w={140} label="written down" o={k(0.4)} />
      <Fan x1={275} y1={100} x2={324} y2={100} k={k(0.6)} />
      <Cell x={330} y={86} w={140} label="read back" o={k(0.7)} />
      <Fan x1={475} y1={100} x2={505} y2={100} k={v} f={C.cherryText} />
      {v > 0.5 && (
        <T x={512} y={105} s={15} f={C.cherryText} o={v}>
          str
        </T>
      )}
      {v > 0.5 && <MiniTick x={330} y={140} k={v} />}
      {v > 0.5 && (
        <T x={350} y={150} s={11} f={C.focus} o={v}>
          no error, yet
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={200} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="it defers fine, and breaks later" y={222} />
    </Svg>
  );
}

// 5 · A real threading.Lock goes through BaseSerialization to the database and back. The lock icon fades and the plain
// text str takes its place; serialize never raised. Then acquire() is called on it, and only there does it break.
export function RevealSerializationCorruption({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const morph = easeInOut(seg(t, 1.8, 2.3));
  return (
    <Svg label="serialize never raised. the lock came back as a string." h={250}>
      <Lock x={40} y={78} k={k(0) * (1 - morph)} f={C.crema} />
      {morph > 0 && (
        <T x={30} y={124} s={15} f={C.cherryText} o={morph}>
          str
        </T>
      )}
      <T x={70} y={86} s={12} f={C.crema} o={k(0.1)}>
        threading.Lock
      </T>
      <Fan x1={200} y1={80} x2={254} y2={80} k={k(0.4)} />
      <Cell x={260} y={66} w={170} label="BaseSerialization" o={k(0.5)} />
      <Fan x1={435} y1={80} x2={469} y2={80} k={k(0.8)} />
      <Cell x={475} y={66} w={100} label="database" o={k(0.9)} />
      <Fan x1={525} y1={98} x2={436} y2={136} k={k(1.2)} />
      <Cell x={260} y={124} w={170} label="read back" o={k(1.3)} />
      <Fan x1={255} y1={138} x2={70} y2={120} k={k(1.5)} f={C.cherryText} />
      {t > 2.6 && <MiniTick x={25} y={186} k={k(2.6)} />}
      {t > 2.6 && (
        <T x={45} y={194} s={11} f={C.focus} o={k(2.6)}>
          serialize() never raised
        </T>
      )}
      <Cross x={32} y={222} k={k(3.4)} />
      {t > 3.4 && (
        <T x={48} y={226} s={11} f={C.cherryText} o={k(3.4)}>
          then acquire() on a str: it breaks only when used
        </T>
      )}
    </Svg>
  );
}

// 6 · One triggerer's box fills square by square to its ceiling. The extras arrive and line up outside, waiting, not
// failing.
export function RevealSaturation({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="default capacity: a thousand triggers per triggerer host." h={250}>
      <T x={25} y={32} s={11} f={C.crema} o={k(0)}>
        one triggerer
      </T>
      <rect x={25} y={40} width={330} height={110} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(0)} />
      {Array.from({ length: 60 }, (_, j) => (
        <rect
          key={j}
          x={35 + (j % 15) * 21}
          y={52 + Math.floor(j / 15) * 24}
          width={14}
          height={14}
          rx={2}
          fill="none"
          stroke={C.second}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 0.3 + j * 0.033, 0.45 + j * 0.033))}
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Pip key={i} x={385 + i * 22} y={95} s={11} f={C.caramel} o={easeOut(seg(t, 2.4 + i * 0.12, 2.6 + i * 0.12))} />
      ))}
      {t > 2.8 && (
        <T x={380} y={130} s={11} f={C.caramel} o={k(2.8)}>
          the extras queue
        </T>
      )}
      {t > 3.2 && (
        <T x={380} y={154} s={11} f={C.focus} o={k(3.2)}>
          they don't fail
        </T>
      )}
      <T x={25} y={180} s={12} f={C.crema} o={k(1.6)}>
        default capacity: a thousand
      </T>
      {t > 3.9 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(3.9)}>
          Airflow's documented default, not measured here
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in, one per idea.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['a pool bounds the slots', 'deferral frees the worker', 'the triggerer waits', 'bad state breaks later'];
  return (
    <Svg label="a pool bounds how many run. the triggerer gives the worker back." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          human pauses and deadlines reuse it
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The hundred claimed sensors from the hook. Once answered, every slot is released and the worker-time bar
// shrinks to a sliver, while the wait itself stays the same.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="switch the hundred sensors to deferrable. what happens to worker-hours?" h={250}>
      <Sensors t={t} claim={() => k(0)} free={v} />
      <T x={300} y={80} s={11} f={C.taupe} o={k(0.3)}>
        worker time, all hundred
      </T>
      <rect x={300} y={92} width={275} height={14} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.3)} />
      <rect x={300} y={92} width={275 * (1 - 0.93 * v)} height={14} rx={3} fill={C.caramel} opacity={k(0.3)} />
      {v > 0.8 && (
        <T x={300} y={140} s={11} f={C.taupe} o={v}>
          the wait itself: unchanged
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={420} y={180} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="it drops by over ninety percent" y={222} />
    </Svg>
  );
}
