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

/** A knob: a circle with a pointer at angle `a` (0..1 of a turn), a name above and a value beside it. */
function Knob({ x, y, a, name, value, f = C.focus, k = 1 }: { x: number; y: number; a: number; name: string; value: string; f?: string; k?: number }) {
  const ang = (-0.75 + a) * Math.PI * 2;
  return (
    <g opacity={k}>
      <circle cx={x} cy={y} r={20} fill={C.cocoa} stroke={f} strokeWidth={2} />
      <line x1={x} y1={y} x2={x + 15 * Math.cos(ang)} y2={y + 15 * Math.sin(ang)} stroke={f} strokeWidth={3} />
      <T x={x + 32} y={y - 6} s={11} f={C.latte}>
        {name}
      </T>
      <T x={x + 32} y={y + 14} s={13} f={f}>
        {value}
      </T>
    </g>
  );
}

/** `n` partition cells in a row starting at x, `w` wide in total. */
function Parts({ x, y, n, w, k = 1, f = C.focus, h = 26 }: { x: number; y: number; n: number; w: number; k?: number; f?: string; h?: number }) {
  const cw = w / n;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={x + i * cw}
          y={y}
          width={Math.max(1, cw - (n > 50 ? 0.6 : 4))}
          height={h}
          rx={n > 50 ? 0 : 2}
          fill={n > 50 ? f : C.cocoa}
          stroke={n > 50 ? 'none' : f}
          strokeWidth={1.3}
          opacity={n > 50 ? 0.8 : 1}
        />
      ))}
    </g>
  );
}

// 1 · Hook. A task whose data sits on one machine; its slot there is busy; a wait timer ticks: run elsewhere now, or wait?
export function Hook({ t }: StepCtx) {
  const w = seg(t, 1.6, 3.6);
  return (
    <Svg label="a real cluster could run a task right where its data sits, or wait for a better slot. Which does it choose?" h={200}>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))}>
          <rect x={25 + i * 190} y={30} width={170} height={70} rx={5} fill="none" stroke={i === 0 ? C.focus : C.mocha} strokeWidth={1.5} />
          <T x={37 + i * 190} y={50} s={11} f={C.latte}>
            {i === 0 ? 'data lives here' : 'a free slot'}
          </T>
          <rect x={37 + i * 190} y={62} width={60} height={26} rx={3} fill={C.cocoa} stroke={i === 0 ? C.cherryText : C.focus} strokeWidth={1.3} />
        </g>
      ))}
      <Cell x={25} y={130} w={120} h={28} label="a task" stroke={C.second} o={easeOut(seg(t, 0.8, 1.1))} />
      <circle cx={180} cy={144} r={12} fill="none" stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 1.4, 1.7))} />
      <line
        x1={180}
        y1={144}
        x2={180 + 9 * Math.cos((w * 2 - 0.25) * Math.PI * 2)}
        y2={144 + 9 * Math.sin((w * 2 - 0.25) * Math.PI * 2)}
        stroke={C.second}
        strokeWidth={2}
        opacity={easeOut(seg(t, 1.4, 1.7))}
      />
      <T x={205} y={149} s={12} f={C.second} o={easeOut(seg(t, 2.0, 2.4))}>
        run now elsewhere, or wait?
      </T>
    </Svg>
  );
}

// 2 · Locality, trivially. One JVM box, driver and the only executor in one; every task chip reads PROCESS_LOCAL.
export function RevealLocalityTrivial({ t }: StepCtx) {
  return (
    <Svg label="measured: every task here reports PROCESS_LOCAL. One JVM is both driver and only executor, so there's never a worse slot to wait for." h={200}>
      <rect x={25} y={20} width={550} height={110} rx={6} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={37} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        one JVM: the driver and the only executor
      </T>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={37 + i * 134} y={64} w={124} h={30} label="PROCESS_LOCAL" stroke={C.focus} o={easeOut(seg(t, 0.8 + i * 0.3, 1.1 + i * 0.3))} />
      ))}
      <T x={25} y={170} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        no worse slot to wait for
      </T>
    </Svg>
  );
}

// 3 · Predict. parallelize() with no hints, no parent: how many partitions?
export function PredictBareRDD({ t, answer }: StepCtx) {
  return (
    <Svg label="a bare RDD, no partition count given, no parent RDD. How many partitions does it get?" h={200}>
      <Cell x={25} y={20} w={200} h={30} label="parallelize(data)" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={330} y={20} w={150} h={30} label="? partitions" stroke={C.second} o={easeOut(seg(t, 0.8, 1.2))} />
      <Req x1={227} x2={325} y={35} k={easeOut(seg(t, 0.4, 0.8))} f={C.latte} />
      <T x={25} y={84} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        no count given, no parent to copy
      </T>
      <AnswerRow y={130} label="the partition count" answer={answer} value="the core count" k={easeOut(seg(t, 1.8, 2.3))} />
      <Verdict answer={answer} y={178} text="default parallelism, from the cores" />
    </Svg>
  );
}

// 4 · Default parallelism. The core knob at local[4]: four core cells, and four partition cells drawn right under them.
export function RevealDefaultParallelism({ t }: StepCtx) {
  return (
    <Svg label="measured: the bare RDD gets exactly 4 partitions — this session's own core count, nothing else." h={200}>
      <Knob x={50} y={50} a={easeOut(seg(t, 0.2, 0.8)) * 0.25} name="cores" value="local[4]" k={easeOut(seg(t, 0.1, 0.4))} />
      <Parts x={200} y={30} n={4} w={360} k={easeOut(seg(t, 0.8, 1.2))} f={C.latte} />
      <T x={200} y={76} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        four cores
      </T>
      <Parts x={200} y={96} n={4} w={360} k={easeOut(seg(t, 1.6, 2.0))} />
      <T x={200} y={142} s={11} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        four partitions
      </T>
      <Row y={186} label="bare RDD partitions" value="4" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
    </Svg>
  );
}

// 5 · Predict. Four partitions into a groupBy shuffle; the output side is a "?".
export function PredictGroupByPartitions({ t, answer }: StepCtx) {
  return (
    <Svg label="same 4-partition data, now a groupBy shuffle, no override. Same 4 output partitions, or something else?" h={200}>
      <Parts x={25} y={24} n={4} w={200} k={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={260} y={14} width={12} height={46} rx={2} fill={C.second} opacity={easeOut(seg(t, 0.6, 1.0))} />
      <T x={266} y={80} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.6, 1.0))}>
        groupBy
      </T>
      <T x={420} y={44} s={16} f={C.second} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
        ?
      </T>
      <AnswerRow y={130} label="output partitions" answer={answer} value="200" k={easeOut(seg(t, 1.8, 2.3))} />
      <Verdict answer={answer} y={178} text="a separate SQL setting decides" />
    </Svg>
  );
}

// 6 · Shuffle partitions. The output side fills with 200 thin cells; a second knob, spark.sql.shuffle.partitions, reads 200 beside
// the core knob's 4.
export function RevealShufflePartitions({ t }: StepCtx) {
  const n = Math.max(1, Math.round(200 * easeOut(seg(t, 0.6, 2.0))));
  return (
    <Svg label="measured: the groupBy writes out 200 partitions — spark.sql.shuffle.partitions's own default, not the 4 cores." h={200}>
      <Parts x={25} y={24} n={4} w={160} />
      <rect x={200} y={14} width={12} height={46} rx={2} fill={C.second} />
      <Parts x={230} y={24} n={200} w={340} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={570} y={76} s={12} f={C.focus} a="end" o={easeOut(seg(t, 0.6, 1.0))}>
        {String(n)}
      </T>
      <Knob x={50} y={140} a={0.25} name="cores" value="4" f={C.latte} k={easeOut(seg(t, 2.2, 2.6))} />
      <Knob x={300} y={140} a={0.8} name="spark.sql.shuffle.partitions" value="200" k={easeOut(seg(t, 2.6, 3.0))} />
    </Svg>
  );
}

// 7 · Predict. The shuffle knob turns to 8; a fresh bare RDD waits with a "?".
export function PredictSetEight({ t, answer }: StepCtx) {
  const a = lerp(0.8, 0.1, easeInOut(seg(t, 0.4, 1.2)));
  return (
    <Svg label="set spark.sql.shuffle.partitions to 8 by hand. Does a later bare RDD's partition count move too, or stay at 4?" h={200}>
      <Knob x={50} y={40} a={a} name="spark.sql.shuffle.partitions" value={t > 1.2 ? '8' : '200'} k={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={360} y={25} w={190} h={30} label="fresh bare RDD: ?" stroke={C.second} o={easeOut(seg(t, 1.2, 1.6))} />
      <AnswerRow y={130} label="the fresh RDD" answer={answer} value="stays at 4" k={easeOut(seg(t, 1.8, 2.3))} />
      <Verdict answer={answer} y={178} text="parallelize only asks the cores" />
    </Svg>
  );
}

// 8 · Independent both ways. The groupBy row shows 8 cells; the fresh RDD row shows 4; the link between the knobs is crossed out.
export function RevealIndependentBothWays({ t }: StepCtx) {
  return (
    <Svg label="measured: the groupBy now writes 8 partitions. A fresh bare RDD, made right after, still gets 4 — untouched." h={200}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        groupBy output
      </T>
      <Parts x={200} y={14} n={8} w={360} k={easeOut(seg(t, 0.4, 0.9))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        fresh bare RDD
      </T>
      <Parts x={200} y={70} n={4} w={360} k={easeOut(seg(t, 1.4, 1.9))} f={C.second} />
      <line x1={120} y1={150} x2={lerp(120, 480, easeOut(seg(t, 2.4, 3.0)))} y2={150} stroke={C.mocha} strokeWidth={2} strokeDasharray="6 4" />
      <Cross x={300} y={150} k={easeOut(seg(t, 3.0, 3.4))} />
      <T x={300} y={186} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        neither setting touches the other
      </T>
    </Svg>
  );
}

// 9 · Recap. Two knobs, two jobs; then the cluster-only pieces named under them.
export function Recap({ t }: StepCtx) {
  return (
    <Svg
      label="two independent knobs: default parallelism from the cores, shuffle partitions from spark.sql.shuffle.partitions. Locality waits and FIFO/FAIR pools place and share the tasks these knobs size."
      h={250}
    >
      <Row y={40} label="default parallelism" value="the core count" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="shuffle partitions" value="its own SQL setting" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="placing, sharing" value="locality, FIFO or FAIR" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
      <T x={25} y={220} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        invisible on one JVM, real on a cluster
      </T>
    </Svg>
  );
}
