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

/** A horizontal time line at y from x1 to x2 with an arrowhead, drawn by `k`. */
function Timeline({ y, x1 = 25, x2 = 565, k = 1 }: { y: number; x1?: number; x2?: number; k?: number }) {
  const x = lerp(x1, x2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={C.latte} strokeWidth={1.4} />
      <path d={`M${x} ${y} l-8 -5 v10 z`} fill={C.latte} />
    </g>
  );
}

/** A trigger tick at x on the time line at y, drawn by `k`. */
function Trig({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <line x1={x} y1={y - 10} x2={x} y2={y - 10 + 20 * k} stroke={f} strokeWidth={2} opacity={k > 0 ? 1 : 0} />;
}

/** A checkpoint log folder at x: a name and the entries 0..n-1 as small cells, entry j shown by `ks[j]`. */
function Log({ x, y, name, ks, f = C.latte }: { x: number; y: number; name: string; ks: number[]; f?: string }) {
  return (
    <g>
      <T x={x} y={y} s={11} f={f}>
        {name}
      </T>
      <rect x={x} y={y + 10} width={150} height={4 + ks.length * 30} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.3} />
      {ks.map((k, j) => (
        <g key={j} opacity={k}>
          <rect x={x + 10} y={y + 18 + j * 30} width={130} height={22} rx={3} fill={C.cocoa} stroke={f} strokeWidth={1.3} />
          <T x={x + 20} y={y + 33 + j * 30} s={11} f={C.crema}>
            {`${j}`}
          </T>
        </g>
      ))}
    </g>
  );
}

// 0 · Hook. Above: a plan runs once and the job ends. Below: the same plan on a time line, woken again at every trigger
// tick while data keeps arriving.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="every topic so far ran one plan once. This one runs it over and over." h={220}>
      <T x={25} y={24} s={11} f={C.latte}>
        until now
      </T>
      <Cell x={25} y={34} w={90} h={28} label="plan" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={115} x2={210} y={48} k={a} f={C.latte} />
      <T x={225} y={53} s={12} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        job ends
      </T>
      <T x={25} y={104} s={11} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))}>
        here
      </T>
      <Timeline y={180} k={easeOut(seg(t, 1.2, 1.8))} />
      {[0, 1, 2, 3, 4].map((i) => {
        const k = easeOut(seg(t, 1.8 + i * 0.4, 2.1 + i * 0.4));
        return (
          <g key={i}>
            <Trig x={60 + i * 110} y={180} k={k} />
            <Cell x={30 + i * 110} y={124} w={60} h={26} label="plan" o={k} stroke={C.focus} />
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <circle key={i} cx={95 + i * 62} cy={200} r={3.5} fill={C.second} opacity={easeOut(seg(t, 1.9 + i * 0.25, 2.1 + i * 0.25))} />
      ))}
    </Svg>
  );
}

// 1 · Measured. Three trigger ticks; with each, the offsets folder gains an entry and, just after, the commits folder its pair.
export function RevealOneTriggerOneBatch({ t }: StepCtx) {
  const o = [0, 1, 2].map((j) => easeOut(seg(t, 0.6 + j * 1.0, 0.9 + j * 1.0)));
  const c = [0, 1, 2].map((j) => easeOut(seg(t, 1.0 + j * 1.0, 1.3 + j * 1.0)));
  return (
    <Svg label="measured: one offset-log entry, one commit-log entry, per batch." h={230}>
      <Timeline y={36} />
      {[0, 1, 2].map((j) => (
        <Trig key={j} x={110 + j * 150} y={36} k={easeOut(seg(t, 0.4 + j * 1.0, 0.6 + j * 1.0))} />
      ))}
      <Log x={110} y={84} name="offsets/" ks={o} />
      <Log x={330} y={84} name="commits/" ks={c} f={C.second} />
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        one pair per trigger, every trigger
      </T>
    </Svg>
  );
}

// 2 · Predict. Interval zero: trigger ticks crowd together, each batch carrying a single data pip. How short can a batch get?
export function PredictLatencyFloor({ t, answer }: StepCtx) {
  return (
    <Svg label="trigger interval forced to zero, almost no data. How fast can a batch run?" h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        interval: zero, about a row per batch
      </T>
      <Timeline y={90} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <g key={i}>
          <Trig x={40 + i * 50} y={90} k={easeOut(seg(t, 0.2 + i * 0.08, 0.4 + i * 0.08))} />
          <circle cx={55 + i * 50} cy={72} r={3.5} fill={C.second} opacity={easeOut(seg(t, 0.4 + i * 0.08, 0.6 + i * 0.08))} />
        </g>
      ))}
      <T x={300} y={150} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.2, 1.6)) : 0}>
        how short can one batch get?
      </T>
      <Verdict answer={answer} y={205} text="still a real floor" />
    </Svg>
  );
}

// 3 · Measured. Batch blocks land back to back, every one the same width with a single pip inside; a dashed floor line
// under their right edges: none shorter.
export function RevealNotMilliseconds({ t }: StepCtx) {
  return (
    <Svg label="measured: not single-digit milliseconds. A real floor, a few hundred." h={220}>
      <Timeline y={110} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35));
        return (
          <g key={i}>
            <rect x={30 + i * 86} y={60} width={80 * k} height={36} rx={3} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} />
            <circle cx={42 + i * 86} cy={78} r={3.5} fill={C.second} opacity={k} />
          </g>
        );
      })}
      <path d={`M30 130 v8 h${80 * easeOut(seg(t, 2.6, 3.0))} v-8`} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={t > 2.6 ? 1 : 0} />
      <T x={30} y={160} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        the floor: hundreds of milliseconds, not single digits
      </T>
    </Svg>
  );
}

// 4 · The floor is planning. One batch's block splits into planning, a thin data slice and committing; under it, an
// empty batch: no data slice at all, and nearly the same length.
export function ElaborateFloorIsPlanning({ t }: StepCtx) {
  const s = easeOut(seg(t, 0.6, 1.4));
  const e = easeOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="the floor is planning and committing, not data volume." h={230}>
      <T x={25} y={26} s={11} f={C.latte}>
        a batch with one row
      </T>
      <rect x={25} y={38} width={280} height={30} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <rect x={305} y={38} width={14 * s} height={30} fill={C.second} />
      <rect x={319 - 14 * (1 - s)} y={38} width={200} height={30} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <T x={25} y={92} s={11} f={C.latte} o={s}>
        planning
      </T>
      <T x={300} y={92} s={11} f={C.second} o={s}>
        data
      </T>
      <T x={400} y={92} s={11} f={C.latte} o={s}>
        committing
      </T>
      <T x={25} y={136} s={11} f={C.latte} o={e}>
        an empty batch
      </T>
      <rect x={25} y={148} width={480 * e} height={30} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <T x={25} y={216} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        no data, nearly the whole price
      </T>
    </Svg>
  );
}

const INT = 165;

// 5 · Predict. Trigger ticks every three seconds; batch 1 is short. Two dashed ghosts for batch 2: right after batch 1,
// or at the next tick?
export function PredictBackToBack({ t, answer }: StepCtx) {
  return (
    <Svg label="a three-second trigger, batches finish in under a second. Back-to-back, or spaced apart?" h={230}>
      <Timeline y={110} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Trig x={40 + i * INT} y={110} k={easeOut(seg(t, 0.1 + i * 0.15, 0.3 + i * 0.15))} />
        </g>
      ))}
      <T x={122} y={140} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        3 s
      </T>
      <rect x={40} y={66} width={40 * easeOut(seg(t, 0.5, 0.9))} height={30} rx={3} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} />
      <rect x={84} y={66} width={40} height={30} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.0, 1.3))} />
      <rect x={205} y={66} width={40} height={30} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={300} y={176} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.5, 1.9)) : 0}>
        batch 2 starts when?
      </T>
      <Verdict answer={answer} y={212} text="it waits out the full three" />
    </Svg>
  );
}

// 6 · Measured. A short batch block at every tick, three seconds apart; the idle stretches between them drawn dashed.
export function RevealSpacedApart({ t }: StepCtx) {
  return (
    <Svg label="measured: three seconds apart, every time -- the engine waits for the boundary." h={220}>
      <Timeline y={110} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.9, 0.8 + i * 0.9));
        return (
          <g key={i}>
            <Trig x={40 + i * INT} y={110} k={k} />
            <rect x={40 + i * INT} y={66} width={40 * k} height={30} rx={3} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} />
            {i < 2 && <line x1={84 + i * INT} y1={81} x2={84 + i * INT + 117 * easeOut(seg(t, 0.8 + i * 0.9, 1.3 + i * 0.9))} y2={81} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="3 4" />}
            {i < 2 && (
              <T x={122 + i * INT} y={140} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.0 + i * 0.9, 1.3 + i * 0.9))}>
                3 s
              </T>
            )}
          </g>
        );
      })}
      <T x={25} y={190} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        the clock decides, not how fast the work ran
      </T>
    </Svg>
  );
}

// 7 · Replay, never guess. Offsets reach entry 3, commits only 2; a cherry crash line; on restart batch 3 is replayed
// from its offset entry and only then does its commit land.
export function ElaborateLogsNotGuess({ t }: StepCtx) {
  const cr = easeOut(seg(t, 1.4, 1.7));
  const rp = easeInOut(seg(t, 2.4, 3.4));
  const o = [1, 1, 1, easeOut(seg(t, 0.6, 0.9))];
  const c = [1, 1, 1, easeOut(seg(t, 3.4, 3.8))];
  return (
    <Svg label="the commit log never runs ahead of the offset log." h={250}>
      <Log x={60} y={24} name="offsets/" ks={o} />
      <Log x={360} y={24} name="commits/" ks={c} f={C.second} />
      <line x1={25} y1={lerp(30, 170, cr)} x2={575} y2={lerp(30, 170, cr)} stroke={C.cherryText} strokeWidth={2} opacity={cr > 0 && rp < 0.2 ? 1 : 0} />
      <T x={250} y={140} s={11} f={C.cherryText} o={cr * (1 - rp)}>
        crash
      </T>
      {rp > 0 && rp < 1 && <rect x={lerp(215, 335, rp)} y={132} width={16} height={16} rx={2} fill={C.second} />}
      <T x={25} y={232} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        batch 3 replayed exactly, never guessed
      </T>
    </Svg>
  );
}

// 8 · Two trigger types. Above, a fixed wait: batches at evenly spaced ticks, the line running on. Below, run until
// empty: back-to-back batches drain a backlog bar, then a stop mark.
export function RevealTriggerTypes({ t }: StepCtx) {
  const b = easeInOut(seg(t, 2.0, 3.6));
  return (
    <Svg label="two trigger types, side by side: a fixed wait, and run-until-empty." h={250}>
      <T x={25} y={24} s={12} f={C.crema}>
        a fixed wait
      </T>
      <Timeline y={86} k={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.4, 0.7 + i * 0.4));
        return <rect key={i} x={40 + i * INT} y={46} width={40} height={26} rx={3} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} opacity={k} />;
      })}
      <T x={25} y={134} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        run until empty
      </T>
      <rect x={340} y={148} width={220 * (1 - b)} height={14} fill={C.second} opacity={easeOut(seg(t, 1.7, 2.0))} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={25 + i * 48} y={150} width={44} height={26} rx={3} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} opacity={clamp(b * 5 - i, 0, 1)} />
      ))}
      <rect x={270} y={150} width={4} height={26} fill={C.cherryText} opacity={easeOut(seg(t, 3.6, 3.9))} />
      <T x={285} y={196} s={11} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>
        then stops on its own
      </T>
    </Svg>
  );
}

// 9 · Recap. Three lines and their pictures: a planning floor, a clock's wait, a log replayed.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one plan, run per trigger: a real floor, a real wait, a real log." h={250}>
      <T x={25} y={40} s={12} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        a real floor: the planning
      </T>
      <rect x={340} y={24} width={200 * easeOut(seg(t, 0.5, 1.1))} height={22} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <T x={25} y={112} s={12} f={C.crema} o={easeOut(seg(t, 1.5, 1.8))}>
        a real wait: the clock
      </T>
      {[0, 1, 2].map((i) => (
        <line key={i} x1={350 + i * 90} y1={96} x2={350 + i * 90} y2={120} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.8 + i * 0.2, 2.0 + i * 0.2))} />
      ))}
      <T x={25} y={184} s={12} f={C.crema} o={easeOut(seg(t, 2.8, 3.1))}>
        a real log: replayed, not guessed
      </T>
      {[0, 1].map((c) => (
        <g key={c}>
          {[0, 1, 2].map((j) => (
            <rect
              key={j}
              x={350 + c * 100}
              y={160 + j * 16}
              width={80}
              height={11}
              rx={2}
              fill={C.cocoa}
              stroke={c ? C.second : C.latte}
              strokeWidth={1.2}
              opacity={easeOut(seg(t, 3.1 + j * 0.2, 3.4 + j * 0.2))}
            />
          ))}
        </g>
      ))}
    </Svg>
  );
}
