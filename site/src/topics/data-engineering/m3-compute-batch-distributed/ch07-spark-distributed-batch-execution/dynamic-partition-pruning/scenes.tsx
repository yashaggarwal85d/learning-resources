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

const GOLD = [17, 52, 88];

/** The fact table's partitions: 20 columns by 5 rows of small squares. `lit(i)` is how read each one is (0..1);
 * the gold regions carry a pale-blue outline once `mark` is on. `merge` closes the gaps into one undivided block. */
function Grid({ x, y, lit, mark = 0, merge = 0, k = 1 }: { x: number; y: number; lit: (i: number) => number; mark?: number; merge?: number; k?: number }) {
  const g = 4 * (1 - merge);
  const c = 16 - g;
  return (
    <g opacity={k}>
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 20;
        const row = Math.floor(i / 20);
        const on = lit(i);
        const gold = GOLD.includes(i) && mark > 0.5;
        return (
          <rect
            key={i}
            x={x + col * 16}
            y={y + row * 16}
            width={c}
            height={c}
            fill={on > 0.5 ? C.latte : C.cocoa}
            stroke={gold ? C.second : C.mocha}
            strokeWidth={gold ? 2 : 1}
            opacity={0.45 + 0.55 * Math.max(on, gold ? 1 : 0)}
          />
        );
      })}
    </g>
  );
}

/** A downward arrow from (x, y1) to (x, y2), drawn by `k`. */
function Down({ x, y1, y2, k, f = C.latte }: { x: number; y1: number; y2: number; k: number; f?: string }) {
  const y = lerp(y1, y2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l-5 -8 h10 z`} fill={f} />
    </g>
  );
}

// 0 · Hook. The fact table's hundred partitions draw in row by row; the dimension table's gold filter lights three
// pips, and three of the hundred squares pick up an outline. How much does the join touch?
export function Hook({ t }: StepCtx) {
  const g = seg(t, 0.2, 1.4);
  return (
    <Svg label="a fact table, partitioned by region. A dimension filter wants just a few regions. How much gets read?" h={220}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.5))}>
        fact: 1,000,000 rows
      </T>
      <Grid x={25} y={40} lit={() => 0} mark={seg(t, 2.8, 3.0)} k={1} />
      {Array.from({ length: 5 }, (_, r) => (
        <rect key={r} x={25} y={40 + r * 16} width={320} height={16} fill={C.espresso} opacity={1 - easeOut(seg(g, r * 0.15, r * 0.15 + 0.4))} />
      ))}
      <T x={25} y={146} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        100 partitions, by region
      </T>
      <Cell x={400} y={40} w={150} label="dimension" o={easeOut(seg(t, 1.5, 1.8))} />
      <T x={400} y={95} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.1))}>
        tier = 'gold'
      </T>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={420 + i * 20} cy={115} r={5} fill={C.second} opacity={easeOut(seg(t, 2.1 + i * 0.15, 2.4 + i * 0.15))} />
      ))}
      <T x={25} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        how much of the big table gets read?
      </T>
    </Svg>
  );
}

// 1 · DPP forced off. A scan sweeps every column of the grid, gold or not; files and partitions read count up to the full table.
export function RevealBaseline({ t }: StepCtx) {
  const sw = seg(t, 0.4, 2.4);
  const c = easeOut(seg(t, 0.4, 2.4));
  return (
    <Svg label="measured: forced off, the join reads every partition regardless of the filter." h={240}>
      <T x={25} y={28} s={11} f={C.cherryText} o={easeOut(seg(t, 0.1, 0.4))}>
        dynamic pruning: off
      </T>
      <Grid x={140} y={40} lit={(i) => (i % 20 < sw * 20 ? 1 : 0)} mark={1} />
      <Row y={170} label="files read" value={num(400 * c)} k={easeOut(seg(t, 0.3, 0.6))} />
      <Row y={220} label="partitions read" value={num(100 * c)} k={easeOut(seg(t, 0.5, 0.8))} />
    </Svg>
  );
}

// 2 · Predict. The grid's partition column and the dimension's join key line up; an equals link draws between them. Enough alone?
export function PredictPartitionAlone({ t, answer }: StepCtx) {
  return (
    <Svg label="the fact table is partitioned by the exact join column. Is that enough on its own?" h={230}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        partitioned by region_id
      </T>
      <Grid x={25} y={40} lit={() => 0} mark={1} />
      <Cell x={420} y={66} w={140} label="dimension" />
      <T x={420} y={54} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        join key: region_id
      </T>
      <line x1={350} y1={80} x2={lerp(350, 416, easeOut(seg(t, 0.6, 1.1)))} y2={80} stroke={C.focus} strokeWidth={1.8} strokeDasharray="5 3" />
      <T x={383} y={110} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        =
      </T>
      <T x={300} y={160} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.4, 1.8)) : 0}>
        enough on its own?
      </T>
      <Verdict answer={answer} y={205} text="no: the join must broadcast too" />
    </Svg>
  );
}

// 3 · Two conditions. Partitioned: ticked, yet the whole grid is still read. Broadcast join: crossed, then ticked;
// only with both does the grid dim to three squares.
export function RevealNeedsBroadcast({ t }: StepCtx) {
  const fix = easeInOut(seg(t, 2.6, 3.1));
  const prune = easeOut(seg(t, 3.3, 3.9));
  return (
    <Svg label="measured: no. The plan has to choose a broadcast join first; partitioning alone changes nothing." h={240}>
      <Cell x={25} y={20} w={260} label="partitioned by join key" o={easeOut(seg(t, 0.2, 0.5))} />
      <MiniTick x={148} y={64} k={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={315} y={20} w={260} label="broadcast join chosen" stroke={fix > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 1.2, 1.5))} />
      {fix < 0.99 && <Cross x={445} y={68} k={easeOut(seg(t, 1.6, 1.9)) * (1 - fix)} />}
      <MiniTick x={438} y={64} k={easeOut(seg(t, 2.9, 3.2))} f={C.second} />
      <Grid x={140} y={95} lit={(i) => (GOLD.includes(i) ? 1 : 1 - prune)} mark={1} k={easeOut(seg(t, 0.4, 0.8))} />
      <T x={300} y={222} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.9, 4.3))}>
        both together, or nothing skipped
      </T>
    </Svg>
  );
}

// 4 · One copy, two jobs. The dimension is scanned once into a broadcast; a pale-blue copy runs right into the join
// and, the same copy, down into the pruning filter on the fact scan.
export function ElaborateReuse({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.2));
  const b = easeOut(seg(t, 1.6, 2.4));
  const c = easeOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="the dimension side is never scanned twice for the join itself; its own broadcast gets reused." h={230}>
      <Cell x={25} y={40} w={160} label="dimension scan" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={96} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        read once
      </T>
      <Req x1={185} x2={245} y={54} k={a} f={C.latte} />
      <Cell x={250} y={40} w={130} label="broadcast" stroke={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <Req x1={380} x2={435} y={54} k={b} f={C.second} />
      <Cell x={440} y={40} w={120} label="join" o={easeOut(seg(t, 1.3, 1.6))} />
      <Down x={315} y1={68} y2={128} k={b} f={C.second} />
      <Cell x={240} y={130} w={150} label="pruning filter" stroke={C.second} o={easeOut(seg(t, 2.2, 2.5))} />
      <Req x1={390} x2={435} y={144} k={c} f={C.second} />
      <Cell x={440} y={130} w={120} label="fact scan" o={easeOut(seg(t, 2.4, 2.7))} />
      <T x={25} y={210} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        one copy, two jobs, nothing extra fetched
      </T>
    </Svg>
  );
}

// 5 · Predict. The grid's gaps close into one undivided block; the same gold filter waits beside it. Does it still help?
export function PredictUnpartitioned({ t, answer }: StepCtx) {
  const m = easeInOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="now the fact table was never partitioned at all. Does the same filter still cut down what's scanned?" h={230}>
      <T x={25} y={28} s={11} f={C.latte}>
        {m < 0.5 ? 'partitioned by region_id' : 'never partitioned'}
      </T>
      <Grid x={25} y={40} lit={() => 0} merge={m} mark={1 - m} />
      <Cell x={420} y={40} w={140} label="dimension" />
      <T x={420} y={95} s={11} f={C.second}>
        tier = 'gold'
      </T>
      <T x={300} y={160} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.4, 1.8)) : 0}>
        filter still helps?
      </T>
      <Verdict answer={answer} y={205} text="no: no boundary to skip at" />
    </Svg>
  );
}

// 6 · Measured. One scan sweeps the undivided block start to finish; the pruning expression's name is struck out of the plan.
export function RevealNoPartitionsToPrune({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.3, 2.0));
  const st = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="measured: no dynamic pruning expression anywhere in the plan. Nothing to prune." h={230}>
      <rect x={140} y={30} width={320} height={80} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
      <rect x={140} y={30} width={320 * sw} height={80} fill={C.latte} opacity={0.8} />
      <T x={140} y={150} s={12} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        dynamicpruningexpression
      </T>
      <line x1={136} y1={146} x2={lerp(136, 360, st)} y2={146} stroke={C.cherryText} strokeWidth={2} opacity={st > 0 ? 1 : 0} />
      <T x={380} y={150} s={11} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))}>
        not in plan
      </T>
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        no pieces, nothing for a filter to remove
      </T>
    </Svg>
  );
}

// 7 · Where to look. EXPLAIN FORMATTED's lines type in; the filter on the fact scan, the join's reused broadcast,
// then the Subqueries section, bracketed, with the dimension's own second scan.
export function ElaborateSubqueryDuplicate({ t }: StepCtx) {
  const lines: [string, number, string][] = [
    ['Scan parquet fact', 30, C.crema],
    ['  dynamicpruningexpression', 54, C.focus],
    ['BroadcastHashJoin', 78, C.crema],
    ['  ReusedExchange', 102, C.latte],
    ['===== Subqueries =====', 140, C.second],
    ['Hosting Expression', 164, C.crema],
    ['Scan parquet dim', 188, C.crema],
  ];
  return (
    <Svg label="EXPLAIN FORMATTED names it directly: a Subqueries section, its own scan, separate from the join." h={230}>
      {lines.map(([s, y, f], i) => (
        <T key={s} x={25} y={y} s={11} f={f} o={easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3))}>
          {s}
        </T>
      ))}
      <T x={330} y={54} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        the filter on the scan
      </T>
      <T x={330} y={102} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        the join's broadcast
      </T>
      <path d={`M300 124 h10 v${70 * easeOut(seg(t, 3.2, 3.7))} h-10`} fill="none" stroke={C.second} strokeWidth={1.8} opacity={t > 3.2 ? 1 : 0} />
      <T x={330} y={164} s={11} f={C.second} o={easeOut(seg(t, 3.6, 3.9))}>
        names the filter
      </T>
      <T x={330} y={188} s={11} f={C.second} o={easeOut(seg(t, 3.9, 4.2))}>
        dim's values, read again
      </T>
    </Svg>
  );
}

// 8 · Both conditions. The full grid dims down to its three gold squares while files read count 400 down to 12 and
// partitions 100 down to 3; the answer row ticks: identical.
export function RevealBothConditions({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.5, 1.8));
  return (
    <Svg label="measured: both conditions together, side by side. Files read drops by over thirty times." h={250}>
      <Grid x={140} y={20} lit={(i) => (GOLD.includes(i) ? 1 : 1 - p)} mark={1} />
      <Row y={140} label="files read" value={num(lerp(400, 12, p))} valueColor={p > 0.99 ? C.second : C.crema} k={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={185} label="partitions read" value={num(lerp(100, 3, p))} valueColor={p > 0.99 ? C.second : C.crema} k={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={230} label="the answer" value="identical" k={easeOut(seg(t, 2.6, 3.0))} />
      <MiniTick x={430} y={222} k={easeOut(seg(t, 3.1, 3.5))} />
    </Svg>
  );
}

// 9 · Recap. The two condition cards tick in turn; arrows from both converge on the one mechanism, the plan's
// pruning expression, and the place to check it.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="two conditions, one mechanism: a partitioned fact table and a broadcastable filter, visible in the plan itself." h={250}>
      <Cell x={25} y={30} w={260} label="partitioned by join key" o={easeOut(seg(t, 0.2, 0.5))} />
      <MiniTick x={270} y={18} k={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={315} y={30} w={260} label="broadcast join chosen" stroke={C.second} o={easeOut(seg(t, 0.8, 1.1))} />
      <MiniTick x={560} y={18} k={easeOut(seg(t, 1.1, 1.4))} f={C.second} />
      <line x1={155} y1={58} x2={lerp(155, 260, a)} y2={lerp(58, 118, a)} stroke={C.latte} strokeWidth={1.6} opacity={a > 0 ? 1 : 0} />
      <line x1={445} y1={58} x2={lerp(445, 340, a)} y2={lerp(58, 118, a)} stroke={C.second} strokeWidth={1.6} opacity={a > 0 ? 1 : 0} />
      <Cell x={150} y={120} w={300} label="dynamicpruningexpression" stroke={C.focus} o={easeOut(seg(t, 2.2, 2.6))} />
      <T x={300} y={200} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        check it: EXPLAIN FORMATTED
      </T>
    </Svg>
  );
}
