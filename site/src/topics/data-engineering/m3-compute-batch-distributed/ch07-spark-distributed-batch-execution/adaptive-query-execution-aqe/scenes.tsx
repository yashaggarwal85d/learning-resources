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

/** The demo query's shape: customers on the left, orders → groupBy on the right, a join box on top. `jl` is the join label. */
function Query({ t, jl, js = C.mocha, small = '? rows', smallF = C.second, sorts = 0 }: { t: number; jl: string; js?: string; small?: string; smallF?: string; sorts?: number }) {
  return (
    <g>
      <Cell x={25} y={150} w={200} h={28} label="customers · 5,000,000" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={350} y={150} w={200} h={28} label="orders · 2,000,000" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={350} y={100} w={200} h={28} label={`groupBy → ${small}`} stroke={smallF} o={easeOut(seg(t, 0.4, 0.7))} />
      {sorts > 0.02 && (
        <g opacity={sorts}>
          <Cell x={25} y={100} w={200} h={28} label="Sort" stroke={C.focus} />
          <Cell x={350} y={58} w={200} h={28} label="Sort" stroke={C.focus} />
        </g>
      )}
      <Cell x={200} y={10} w={200} h={30} label={jl} stroke={js} o={easeOut(seg(t, 0.6, 0.9))} />
    </g>
  );
}

// 1 · Hook. The query assembles bottom-up; the grouped side's size is a "?", and the join box waits for a strategy.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a big table joins a 30-row result of grouping another big table. What strategy, before anything runs?" h={200}>
      <Query t={t} jl="join: strategy?" js={C.second} />
      <T x={300} y={80} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        before a single task runs
      </T>
    </Svg>
  );
}

// 2 · The Initial Plan. Sorts on both sides, SortMergeJoin; the grouped side's size stays a dashed unknown.
export function RevealInitialPlan({ t }: StepCtx) {
  return (
    <Svg label="measured: the Initial Plan is a sort-merge join. The grouped side's real size doesn't exist yet." h={200}>
      <Query t={t + 1} jl="SortMergeJoin" js={C.focus} small="size unknown" sorts={easeOut(seg(t, 0.6, 1.2))} />
      <T x={25} y={70} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        Initial Plan
      </T>
    </Svg>
  );
}

// 3 · Predict. The grouping's shuffle completes and its counter lands on 30; does the join above get a second look?
export function PredictDemotion({ t, answer }: StepCtx) {
  const n = Math.round(lerp(0, 30, easeOut(seg(t, 0.4, 1.2))));
  return (
    <Svg label="the grouping's own shuffle finishes: only 30 rows came out. Does the join plan change?" h={200}>
      <Cell x={25} y={20} w={250} h={30} label="groupBy's shuffle: done" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={300} y={41} s={14} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        {`${n} rows out`}
      </T>
      <AnswerRow y={130} label="the join above" answer={answer} value="re-planned" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="a shuffle boundary is when to re-plan" />
    </Svg>
  );
}

// 4 · The Final Plan. The Sorts fade, the join box flips to BroadcastHashJoin, and the 30-row side is broadcast.
export function RevealBroadcastDemotion({ t }: StepCtx) {
  const s = easeInOut(seg(t, 0.6, 1.6));
  const b = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="measured: the Final Plan is a broadcast hash join instead. Zero sort steps anywhere." h={200}>
      <Query t={t + 1} jl={s > 0.5 ? 'BroadcastHashJoin' : 'SortMergeJoin'} js={s > 0.5 ? C.second : C.focus} small="30 rows" smallF={C.focus} sorts={1 - s} />
      <rect x={lerp(350, 235, b)} y={lerp(100, 100, b)} width={80} height={28} rx={3} fill="none" stroke={C.second} strokeWidth={1.6} opacity={b > 0 && b < 1 ? 1 : 0} />
      <T x={300} y={70} s={11} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        Final Plan: Sort × 0
      </T>
    </Svg>
  );
}

// 5 · Why. A threshold line; the planner's estimate bar (the 2,000,000-row input) towers past it; the real 30-row bar sits under it.
export function ElaborateDemotion({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="the conversion only became possible once the grouped side's real size existed to check against the threshold." h={200}>
      <line x1={260} y1={20} x2={260} y2={130} stroke={C.focus} strokeWidth={2} />
      <T x={260} y={150} s={11} f={C.focus} a="middle">
        broadcast threshold
      </T>
      <T x={25} y={34} s={11} f={C.latte} o={a}>
        before: all it had
      </T>
      <rect x={25} y={44} width={520 * a} height={16} fill="none" stroke={C.latte} strokeDasharray="5 4" strokeWidth={1.4} />
      <T x={25} y={90} s={11} f={C.focus} o={b}>
        after the shuffle: 30 rows
      </T>
      <rect x={25} y={100} width={12 * b} height={16} fill={C.focus} />
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>
        the same operator, a number that now exists
      </T>
    </Svg>
  );
}

// 6 · Predict. 200 configured partitions, almost all nearly empty: do 200 tasks run?
export function PredictCoalescing({ t, answer }: StepCtx) {
  return (
    <Svg label="a second query: 200 shuffle partitions configured, but the real data is tiny. Does AQE touch that count?" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        spark.sql.shuffle.partitions = 200
      </T>
      {Array.from({ length: 200 }, (_, i) => (
        <rect key={i} x={25 + i * 2.75} y={40 + (i % 17 === 0 ? 0 : 30)} width={2} height={i % 17 === 0 ? 40 : 10} fill={C.latte} opacity={easeOut(seg(t, 0.3 + i * 0.003, 0.6 + i * 0.003))} />
      ))}
      <AnswerRow y={130} label="200 separate tasks?" answer={answer} value="no: merged" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="small partitions combined, once sizes are known" />
    </Svg>
  );
}

// 7 · Coalesced. The Initial Plan row keeps 200 slivers; in the Final Plan the slivers slide together into a few full pieces.
export function RevealCoalescing({ t }: StepCtx) {
  const s = easeInOut(seg(t, 1.2, 2.6));
  return (
    <Svg label="measured: the Final Plan merges the small partitions. The Initial Plan never does this at all." h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Initial Plan: 200, as configured
      </T>
      {Array.from({ length: 200 }, (_, i) => (
        <rect key={i} x={25 + i * 2.75} y={32} width={2} height={20} fill={C.latte} />
      ))}
      <T x={25} y={92} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.2))}>
        Final Plan: AQEShuffleRead coalesced
      </T>
      {Array.from({ length: 200 }, (_, i) => {
        const g = Math.floor(i / 50);
        const x0 = 25 + i * 2.75;
        const x1 = 25 + g * 140 + (i % 50) * 2.6;
        return <rect key={i} x={lerp(x0, x1, s)} y={102} width={2} height={20} fill={C.focus} opacity={easeOut(seg(t, 0.8, 1.2))} />;
      })}
      {[0, 1, 2, 3].map((g) => (
        <rect key={g} x={22 + g * 140} y={99} width={136} height={26} rx={3} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 2.6, 3.0))} />
      ))}
      <T x={25} y={170} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        small pieces combined before the next read
      </T>
    </Svg>
  );
}

// 8 · Why. The configured knob reads 200, dimmed; the running count is drawn from the shuffle's own output bars instead.
export function ElaborateCoalescing({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="the configured count was never sized to the data; AQE picked the real count only once the shuffle's own output existed." h={200}>
      <Cell x={25} y={20} w={240} h={30} label="configured: 200" o={1 - 0.6 * a} />
      <T x={25} y={74} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>
        never sized to this data
      </T>
      <Cell x={335} y={20} w={240} h={30} label="the shuffle's real output" stroke={C.focus} o={a} />
      <path d={`M455 52 V${lerp(52, 100, easeOut(seg(t, 2.2, 2.8)))}`} stroke={C.focus} strokeWidth={1.8} />
      <T x={335} y={124} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        decides the count that runs
      </T>
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        no need to guess it right up front
      </T>
    </Svg>
  );
}

// 9 · Recap. A timeline: the scan and filter before the first shuffle (done, locked); the boundary; the re-plannable zone after it.
export function Recap({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.0, 1.4));
  return (
    <Svg label="AQE reoptimizes at a shuffle boundary using real stats: it can demote a join and coalesce partitions, but nothing before the first shuffle." h={250}>
      <rect x={25} y={30} width={230} height={50} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.4} opacity={easeOut(seg(t, 0.2, 0.6))} />
      <T x={40} y={60} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.6))}>
        scan, filter: already done
      </T>
      <Lock x={228} y={44} k={easeOut(seg(t, 0.6, 0.9))} f={C.latte} />
      <rect x={268} y={22} width={12} height={66 * b} rx={2} fill={C.second} />
      <rect x={295} y={30} width={280} height={50} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 1.4, 1.8))} />
      <T x={310} y={60} s={12} f={C.crema} o={easeOut(seg(t, 1.4, 1.8))}>
        re-planned with real sizes
      </T>
      <Row y={140} label="a join" value="can be demoted" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={195} label="partitions" value="can be coalesced" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}
