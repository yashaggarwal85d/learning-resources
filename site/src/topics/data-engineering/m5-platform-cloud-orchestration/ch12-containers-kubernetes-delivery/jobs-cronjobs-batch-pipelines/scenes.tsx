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

// Every value here is examples.py's own: the 200 partitions with partition 137 bad and the other 199 fine, the shared
// backoff limit of 6, ten indexes failing at 0, 2, 4, 6 and 8 under a maxFailedIndexes of 2, exit code 42 and DisruptionTarget,
// the success policy's indexes 0, 2 and 3 with a count of 1, Allow, Forbid and Replace, and the CronJob doc's outage from
// 8:29 to 10:21 at one schedule a minute, past 100 misses, against a 200-second deadline's 3. These steps are short, so each
// scene runs its own clock a little faster (t = t0 times a factor).

/** A grid of the Job's 200 partitions, 20 by 10; `col(i)` colours each cell. */
function Grid({ x0, y0, col, o = 1 }: { x0: number; y0: number; col: (i: number) => string; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 200 }, (_, i) => (
        <rect key={i} x={x0 + (i % 20) * 14} y={y0 + Math.floor(i / 20) * 11} width={11} height={8} rx={1} fill="none" stroke={col(i)} strokeWidth={i === 137 ? 2 : 1.1} />
      ))}
    </g>
  );
}

/** One worker lane: a filled run from x1 to x2 at y. */
function Run({ x1, x2, y, k = 1, f = C.latte, dash = false }: { x1: number; x2: number; y: number; k?: number; f?: string; dash?: boolean }) {
  if (k <= 0) return null;
  return dash ? (
    <rect x={x1} y={y} width={(x2 - x1) * k} height={14} rx={2} fill="none" stroke={f} strokeWidth={1.4} strokeDasharray="4 3" />
  ) : (
    <rect x={x1} y={y} width={(x2 - x1) * k} height={14} rx={2} fill={f} />
  );
}

// 0 · Hook. The 200 partitions fill in as they finish. Partition 137 flashes red each time it fails, and each failure takes
// one of six pips from a shared budget; when the last pip goes, every unfinished partition greys out: the whole Job is dead.
export function Hook({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fails = Math.floor(clamp((t - 0.5) / 0.35, 0, 6));
  const dead = t > 2.6;
  const doneTo = Math.floor(clamp(t / 2.6) * 120);
  return (
    <Svg label="A 200-partition Job: partition 137 is malformed and crashes every time" h={250}>
      <Grid x0={25} y0={40} col={(i) => (i === 137 ? (t > 0.5 ? C.cherryText : C.mocha) : i < doneTo ? C.focus : dead ? C.taupe : C.mocha)} o={k(0)} />
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        200 partitions
      </T>
      <T x={340} y={50} s={11} f={C.latte} o={k(0.2)}>
        shared budget: 6
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <Pip key={i} x={348 + i * 22} y={70} s={14} f={i < 6 - fails ? C.latte : C.cherryText} o={k(0.2) * (i < 6 - fails ? 1 : 0.25)} />
      ))}
      {t > 0.6 && (
        <T x={340} y={106} s={11} f={C.cherryText} o={k(0.6)}>
          partition 137 fails again
        </T>
      )}
      {dead && (
        <T x={25} y={176} s={12} f={C.cherryText} o={k(2.6)}>
          the whole Job dies
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={204} s={11} f={C.taupe} o={k(3.4)}>
          the other 199, possibly unfinished
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The grid again, 137 red: what isolates it, and how does the Job end? Once answered, the other 199 turn
// focus, finished, 137 is ringed on its own, and the Job's status lands: Failed.
export function PredictIsolate({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.8)) : 0;
  const w = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="Which setting makes partition 137 fail alone, and what is the Job's final status?" h={250}>
      <Grid x0={25} y0={40} col={(i) => (i === 137 ? C.cherryText : v > 0 && i / 200 < v ? C.focus : C.mocha)} o={k(0)} />
      <circle cx={25 + 17 * 14 + 5} cy={40 + 6 * 11 + 4} r={10} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={w} />
      {answer === null && t > 0.8 && (
        <T x={440} y={100} s={15} f={C.taupe} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      <Cell x={340} y={90} w={140} label="Job: Failed" o={w} stroke={C.cherryText} f={C.cherryText} />
      <Verdict answer={answer} text="per-index backoff, and still Failed" y={204} />
    </Svg>
  );
}

// 2 · Indexed, no queue. Four pods, each told its index, each fan straight across to its own partition. Below, a shared pile
// of work is crossed out, and the four ways a pod is told its index fade in.
export function IndexedNoQueue({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="Each pod's completion index tells it which partition to process — no external queue" h={250}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Cell x={25} y={30 + i * 38} w={110} label={`index ${i}`} o={k(i * 0.1)} />
          <Fan x1={135} y1={44 + i * 38} x2={438} y2={44 + i * 38} k={k(0.6 + i * 0.25)} f={C.focus} />
          <Cell x={440} y={30 + i * 38} w={135} label={`partition ${i}`} o={k(0.5 + i * 0.1)} />
        </g>
      ))}
      <Cross x={35} y={196} k={k(2.2)} />
      {t > 2.2 && (
        <T x={52} y={200} s={11} f={C.cherryText} o={k(2.2)}>
          no shared pile of work
        </T>
      )}
      {t > 2.9 && (
        <T x={25} y={232} s={11} f={C.latte} o={k(2.9)}>
          told by annotation, label, hostname and env var
        </T>
      )}
    </Svg>
  );
}

// 3 · Two pods, one index. Pod A runs, then its terminating tail draws dashed. Pod B, the replacement, starts before A's tail
// ends. A bracket marks the window where both hold the same index.
export function TwoPodsOneIndex({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A replacement pod can start before the old one is confirmed terminal — briefly, two pods share an index" h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        index 3
      </T>
      <T x={25} y={81} s={11} f={C.latte} o={k(0)}>
        pod A
      </T>
      <Run x1={120} x2={320} y={70} k={easeInOut(seg(t, 0.2, 1.0))} />
      <Run x1={320} x2={450} y={70} k={easeInOut(seg(t, 1.0, 1.8))} dash f={C.taupe} />
      {t > 1.0 && (
        <T x={325} y={60} s={11} f={C.taupe} o={k(1.0)}>
          terminating
        </T>
      )}
      <T x={25} y={131} s={11} f={C.latte} o={k(1.2)}>
        pod B
      </T>
      <Run x1={360} x2={575} y={120} k={easeInOut(seg(t, 1.3, 2.3))} f={C.second} />
      <path d={`M360 156 v6 H${lerp(360, 450, k(2.4))} v-6`} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={k(2.4)} />
      {t > 2.5 && (
        <T x={405} y={182} s={11} f={C.cherryText} a="middle" o={k(2.5)}>
          both running index 3
        </T>
      )}
      {t > 3.3 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.3)}>
          an index's work has to tolerate running twice
        </T>
      )}
    </Svg>
  );
}

// 4 · Per-index backoff. Five lanes run side by side. Index 137's lane fails, retries, fails again, crossed out each time,
// and its pip drops into failedIndexes; the other four finish and drop into completedIndexes, never paused.
export function PerIndexBackoff({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="backoffLimitPerIndex: a failing index joins failedIndexes without stopping the rest" h={250}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 40 + i * 30;
        const bad = i === 2;
        return (
          <g key={i}>
            {bad && (
              <T x={25} y={y + 11} s={11} f={C.cherryText} o={k(0)}>
                index 137
              </T>
            )}
            {bad ? (
              <g>
                <Run x1={110} x2={200} y={y} k={easeInOut(seg(t, 0.2, 0.8))} f={C.cherryText} />
                <Cross x={210} y={y + 7} k={k(0.8)} />
                <Run x1={225} x2={315} y={y} k={easeInOut(seg(t, 1.1, 1.7))} f={C.cherryText} />
                <Cross x={325} y={y + 7} k={k(1.7)} />
              </g>
            ) : (
              <Run x1={110} x2={400} y={y} k={easeInOut(seg(t, 0.2 + i * 0.1, 2.0 + i * 0.1))} />
            )}
            {!bad && <Pip x={lerp(410, 470 + i * 18, k(2.4 + i * 0.1))} y={lerp(y + 7, 70, k(2.4 + i * 0.1))} s={10} f={C.focus} o={k(2.2 + i * 0.1)} />}
          </g>
        );
      })}
      <Pip x={lerp(340, 470, k(2.2))} y={lerp(107, 170, k(2.2))} s={10} f={C.cherryText} o={k(2.0)} />
      <rect x={455} y={48} width={120} height={44} rx={4} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={k(1.9)} />
      <T x={455} y={40} s={11} f={C.focus} o={k(1.9)}>
        completed
      </T>
      <rect x={455} y={148} width={120} height={44} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={k(1.9)} />
      <T x={455} y={140} s={11} f={C.cherryText} o={k(1.9)}>
        failed
      </T>
      {t > 3.3 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.3)}>
          the others were never paused
        </T>
      )}
    </Svg>
  );
}

// 5 · A cap on failures. Ten indexes run in order, twice. With no cap, all ten run: 0, 2, 4, 6 and 8 fail. With
// maxFailedIndexes of 2, the third failure, at index 4, stops the run, and 5 through 9 are crossed out, terminated early.
export function MaxFailedIndexes({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const row = (y: number, d0: number, cap: boolean) =>
    Array.from({ length: 10 }, (_, i) => {
      const on = t > d0 + i * 0.12;
      const bad = i % 2 === 0;
      const killed = cap && i >= 5;
      const st = !on ? C.mocha : killed ? C.taupe : bad ? C.cherryText : C.focus;
      return (
        <g key={i}>
          <Cell x={25 + i * 50} y={y} w={40} label={`${i}`} stroke={killed && on ? C.mocha : st} f={killed && on ? C.taupe : C.crema} o={k(d0 - 0.3)} />
          {killed && <Cross x={45 + i * 50} y={y + 14} k={k(d0 + 0.7)} />}
        </g>
      );
    });
  return (
    <Svg label="maxFailedIndexes caps how many indexes may fail before the rest are terminated early" h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        no cap
      </T>
      {row(44, 0.4, false)}
      <T x={25} y={124} s={11} f={C.taupe} o={k(1.6)}>
        maxFailedIndexes: 2
      </T>
      {row(134, 1.9, true)}
      {t > 3.0 && (
        <T x={25} y={202} s={11} f={C.cherryText} o={k(3.0)}>
          the third failure stops the rest early
        </T>
      )}
    </Svg>
  );
}

// 6 · The pod failure policy. Top: exit code 42 matches FailJob, and a red line cuts across four running lanes at once. Bottom:
// DisruptionTarget matches Ignore, and the budget's pips stay full, ticked.
export function FailurePolicy({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="onExitCodes and onPodConditions classify a failure into Ignore, FailJob, FailIndex, or Count" h={250}>
      <Cell x={25} y={40} w={155} label="exit code 42" o={k(0)} stroke={C.cherryText} />
      <Req x1={185} x2={245} y={54} k={k(0.3)} />
      <Cell x={250} y={40} w={110} label="FailJob" o={k(0.5)} stroke={C.cherryText} />
      {[0, 1, 2, 3].map((i) => (
        <Run key={i} x1={390} x2={575} y={28 + i * 18} k={1} f={t > 1.0 ? C.taupe : C.latte} />
      ))}
      <line x1={470} y1={24} x2={470} y2={lerp(24, 100, k(1.0))} stroke={C.cherryText} strokeWidth={2.4} />
      {t > 1.3 && (
        <T x={390} y={120} s={11} f={C.cherryText} o={k(1.3)}>
          the whole Job, now
        </T>
      )}
      <Cell x={25} y={150} w={155} label="DisruptionTarget" o={k(1.8)} />
      <Req x1={185} x2={245} y={164} k={k(2.1)} />
      <Cell x={250} y={150} w={110} label="Ignore" o={k(2.3)} stroke={C.focus} />
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={400 + i * 22} y={164} s={14} f={C.latte} o={k(2.5)} />
      ))}
      <MiniTick x={470} y={160} k={k(3.0)} />
      {t > 3.0 && (
        <T x={390} y={200} s={11} f={C.focus} o={k(3.0)}>
          budget untouched
        </T>
      )}
    </Svg>
  );
}

// 7 · Predict. A lane is cut partway by a drain arrow; the budget's three pips sit beside it, "?". Once answered, two branches
// draw: with a rule naming DisruptionTarget as Ignore the pips stay; with no rule, one turns red and drops.
export function PredictDrain({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A node drain evicts a running pod. Does it count against backoffLimitPerIndex?" h={250}>
      <Run x1={25} x2={260} y={50} k={k(0)} />
      <path d={`M300 20 V${lerp(20, 58, k(0.4))}`} stroke={C.second} strokeWidth={2} />
      <T x={310} y={34} s={11} f={C.second} o={k(0.4)}>
        a drain
      </T>
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={420 + i * 22} y={57} s={14} f={C.latte} o={k(0.6)} />
      ))}
      {answer === null && t > 0.9 && (
        <T x={300} y={130} s={15} f={C.taupe} a="middle" o={k(0.9)}>
          ?
        </T>
      )}
      <T x={25} y={112} s={11} f={C.focus} o={v}>
        rule: DisruptionTarget, Ignore
      </T>
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={420 + i * 22} y={108} s={14} f={C.focus} o={v} />
      ))}
      <T x={25} y={152} s={11} f={C.cherryText} o={v}>
        no rule written
      </T>
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={420 + i * 22} y={148 + (i === 2 ? 12 * v : 0)} s={14} f={i === 2 ? C.cherryText : C.latte} o={v * (i === 2 ? 0.6 : 1)} />
      ))}
      <Verdict answer={answer} text="only if the policy names it" y={214} />
    </Svg>
  );
}

// 8 · The success policy. Five lanes run; indexes 0, 2 and 3 carry a mark, named. Index 2 finishes first and ticks; a red line
// cuts the rest at that moment, and the Job's status lands: succeeded.
export function SuccessPolicy({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const named = [0, 2, 3];
  const stop = t > 1.6;
  return (
    <Svg label="successPolicy ends the Job the moment the chosen indexes succeed and kills the rest" h={250}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 36 + i * 30;
        const end = i === 2 ? 290 : 560;
        const run = easeInOut(seg(t, 0.2, i === 2 ? 1.2 : 3.4));
        const x2 = stop && i !== 2 ? Math.min(lerp(110, end, run), 300) : lerp(110, end, run);
        return (
          <g key={i}>
            <T x={25} y={y + 11} s={11} f={named.includes(i) ? C.second : C.latte} o={k(0)}>
              {`index ${i}`}
            </T>
            {named.includes(i) && <circle cx={98} cy={y + 7} r={3.5} fill={C.second} opacity={k(0.1)} />}
            <rect x={110} y={y} width={Math.max(0, x2 - 110)} height={14} rx={2} fill={i === 2 ? C.focus : stop ? C.taupe : C.latte} />
          </g>
        );
      })}
      <MiniTick x={296} y={98} k={k(1.2)} />
      <line x1={318} y1={30} x2={318} y2={lerp(30, 184, k(1.6))} stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" />
      {t > 1.9 && (
        <T x={330} y={210} s={11} f={C.cherryText} o={k(1.9)}>
          the lingering pods stopped
        </T>
      )}
      <Cell x={25} y={196} w={180} label="Job: succeeded" o={k(2.4)} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 9 · TTL cleanup. A finished Job, its three pods and their log lines. The TTL bar runs down; then the Job, pods and logs all
// sink and fade together. A dashed log store appears last: only what was shipped out first survives.
export function TtlCleanup({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ttl = easeInOut(seg(t, 0.4, 1.6));
  const gone = easeIn2(seg(t, 1.6, 2.2));
  return (
    <Svg label="ttlSecondsAfterFinished deletes a finished Job and its pods together" h={250}>
      <T x={330} y={34} s={11} f={C.second} o={k(0)}>
        ttlSecondsAfterFinished
      </T>
      <rect x={330} y={42} width={200 * (1 - ttl)} height={6} rx={3} fill={C.second} opacity={k(0)} />
      <g opacity={1 - gone} transform={`translate(0 ${(gone * 24).toFixed(1)})`}>
        <Cell x={25} y={40} w={180} label="Job: finished" stroke={C.focus} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <Cell x={25 + i * 100} y={90} w={90} label="pod" />
            {[0, 1, 2].map((j) => (
              <line key={j} x1={30 + i * 100} y1={130 + j * 9} x2={lerp(30, 108, (j + 2) / 4) + i * 100} y2={130 + j * 9} stroke={C.latte} strokeWidth={2} />
            ))}
          </g>
        ))}
      </g>
      {t > 2.3 && (
        <T x={25} y={190} s={11} f={C.cherryText} o={k(2.3)}>
          the logs are gone too
        </T>
      )}
      <rect x={400} y={110} width={175} height={40} rx={4} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="5 4" opacity={k(3.0)} />
      <T x={487} y={134} s={11} f={C.focus} a="middle" o={k(3.0)}>
        unless shipped out
      </T>
    </Svg>
  );
}

// 10 · Concurrency policies. Three lanes, one overrun each: the previous run passes the next schedule tick. Allow starts the
// new run alongside; Forbid's new run is a crossed-out ghost; Replace cuts the old run at the tick and starts the new one.
export function ConcurrencyPolicies({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const old = easeInOut(seg(t, 0.2, 1.3));
  const nw = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="The previous run is still going. Allow, Forbid and Replace resolve the overrun three ways" h={250}>
      {['Allow', 'Forbid', 'Replace'].map((p, i) => {
        const y = 36 + i * 62;
        const cut = p === 'Replace' && t > 1.6;
        return (
          <g key={p}>
            <T x={25} y={y + 18} s={12} f={C.crema} o={k(0)}>
              {p}
            </T>
            <rect x={130} y={y + 6} width={(cut ? 170 : 250) * old} height={14} rx={2} fill={cut ? C.taupe : C.latte} />
            <line x1={300} y1={y} x2={300} y2={y + 44} stroke={C.second} strokeWidth={1.8} opacity={k(0.1)} />
            {p === 'Allow' && <Run x1={300} x2={540} y={y + 26} k={nw} f={C.second} />}
            {p === 'Forbid' && <Run x1={300} x2={540} y={y + 26} k={nw} f={C.taupe} dash />}
            {p === 'Forbid' && <Cross x={420} y={y + 33} k={k(2.6)} />}
            {p === 'Replace' && <Cross x={300} y={y + 13} k={k(1.6)} />}
            {p === 'Replace' && <Run x1={310} x2={540} y={y + 26} k={nw} f={C.second} />}
          </g>
        );
      })}
      <T x={300} y={226} s={11} f={C.second} a="middle" o={k(0.1)}>
        the next schedule
      </T>
    </Svg>
  );
}

// 11 · Missed schedules. An outage from 8:29 to 10:21 with one schedule a minute: tick after tick turns red as it is missed,
// past 100, and the CronJob drops them, starting only the latest. Then a 200-second deadline narrows the window to the last few ticks: 3 missed, and it starts.
export function MissedSchedules({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const n = 112;
  const sweep = easeInOut(seg(t, 0.4, 2.0));
  const w = 550 / n;
  return (
    <Svg label="A controller outage longer than 100 missed intervals: Kubernetes drops the backlog and starts only the latest run" h={250}>
      <T x={25} y={50} s={11} f={C.taupe} o={k(0)}>
        8:29
      </T>
      <T x={575} y={50} s={11} f={C.taupe} a="end" o={k(0)}>
        10:21
      </T>
      {Array.from({ length: n }, (_, i) => (
        <line
          key={i}
          x1={25 + (i + 0.5) * w}
          y1={62}
          x2={25 + (i + 0.5) * w}
          y2={96}
          stroke={i === n - 1 && t > 2.0 ? C.focus : i / n < sweep ? C.cherryText : C.mocha}
          strokeWidth={1.2}
          opacity={k(0.1)}
        />
      ))}
      {t > 2.0 && (
        <T x={25} y={122} s={11} f={C.cherryText} o={k(2.0)}>
          past 100 missed: a warning, and only the latest starts
        </T>
      )}
      <path d={`M${575 - (200 / 6720) * 550} 102 v8 H575 v-8`} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={k(2.6)} />
      {t > 2.7 && (
        <T x={575} y={146} s={11} f={C.focus} a="end" o={k(2.7)}>
          a 200-second deadline: 3 missed, it starts
        </T>
      )}
    </Svg>
  );
}

// 12 · Where a CronJob stops. A clock's hand turns and throws out a Job roughly once per turn. Below, four things it does
// not have slide in, each crossed out, and an arrow hands them to an orchestrator.
export function CronJobBoundary({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ang = t * 3 - Math.PI / 2;
  const lacks = ['a dependency graph', 'data intervals', 'backfill', 'cross-job alerts'];
  return (
    <Svg label="A CronJob creates a Job approximately once per schedule — nothing more" h={250}>
      <circle cx={60} cy={60} r={28} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={k(0)} />
      <line x1={60} y1={60} x2={60 + 22 * Math.cos(ang)} y2={60 + 22 * Math.sin(ang)} stroke={C.latte} strokeWidth={2} opacity={k(0)} />
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={lerp(100, 120 + i * 100, k(0.3 + i * 0.5))} y={46} w={80} label="Job" o={k(0.3 + i * 0.5)} />
      ))}
      <T x={430} y={64} s={11} f={C.taupe} o={k(1.6)}>
        roughly once each
      </T>
      {lacks.map((l, i) => {
        const x = 25 + (i % 2) * 200;
        const y = 116 + Math.floor(i / 2) * 44;
        return (
          <g key={l}>
            <Cell x={x} y={y} w={180} label={l} o={k(1.8 + i * 0.25)} f={C.taupe} />
            <Cross x={x + 190} y={y + 14} k={k(2.0 + i * 0.25)} />
          </g>
        );
      })}
      <Req x1={425} x2={455} y={152} k={k(3.1)} />
      <Cell x={460} y={138} w={115} label="orchestrator" o={k(3.3)} stroke={C.focus} />
    </Svg>
  );
}

// 13 · Recap, and a bridge. The right numbers, ticked. A service's lane runs on past the edge; a nightly run's lane finishes
// with a tick, and a retry loop draws beside it: what the next piece builds on.
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const svc = easeInOut(seg(t, 0.8, 2.2));
  const job = easeInOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="Per-index retries isolate one bad partition; the CronJob is cron with a controller, not an orchestrator" h={250}>
      <Cell x={25} y={30} w={200} label="the right numbers" o={k(0)} stroke={C.focus} />
      <MiniTick x={235} y={44} k={k(0.3)} />
      <T x={25} y={100} s={11} f={C.latte} o={k(0.7)}>
        a service
      </T>
      <rect x={140} y={88} width={435 * svc} height={18} rx={2} fill={C.latte} />
      <T x={25} y={150} s={11} f={C.latte} o={k(1.3)}>
        a nightly run
      </T>
      <rect x={140} y={138} width={220 * job} height={18} rx={2} fill={C.latte} />
      <MiniTick x={370} y={144} k={k(2.5)} />
      <path d={`M400 147 a14 14 0 1 1 0.1 0`} fill="none" stroke={C.second} strokeWidth={1.8} strokeDasharray="90" strokeDashoffset={90 * (1 - k(2.8))} />
      {t > 3.0 && (
        <T x={432} y={152} s={11} f={C.second} o={k(3.0)}>
          retried with care
        </T>
      )}
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
