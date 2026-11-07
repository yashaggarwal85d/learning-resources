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

/** The real Morton code examples.py uses: a's bit first at each position, most-significant pair first. */
function morton(a: number, b: number) {
  let z = 0;
  for (let i = 3; i >= 0; i--) {
    z = (z << 1) | ((a >> i) & 1);
    z = (z << 1) | ((b >> i) & 1);
  }
  return z;
}

type Layout = 'arrival' | 'linear' | 'z';
/** The physical position of row (a, b) in each layout, exactly as examples.py orders them. */
function pos(l: Layout, a: number, b: number) {
  const idx = a * 16 + b;
  return l === 'arrival' ? (idx * 131) % 256 : l === 'linear' ? idx : morton(a, b);
}

/** Each layout's sixteen row groups' min and max of a and b. */
function bounds(l: Layout) {
  const g = Array.from({ length: 16 }, () => ({ a0: 15, a1: 0, b0: 15, b1: 0 }));
  for (let a = 0; a < 16; a++)
    for (let b = 0; b < 16; b++) {
      const k = pos(l, a, b) >> 4;
      g[k] = { a0: Math.min(g[k].a0, a), a1: Math.max(g[k].a1, a), b0: Math.min(g[k].b0, b), b1: Math.max(g[k].b1, b) };
    }
  return g;
}
/** Whether group k of layout l must be scanned for the predicate a in 4..7 and b in 4..7. */
function scanned(l: Layout, k: number) {
  const g = bounds(l)[k];
  return !(g.a1 < 4 || g.a0 > 7 || g.b1 < 4 || g.b0 > 7);
}

/** A 16 by 16 grid of (a, b) cells at (x, y): a down, b across. `lit(a, b)` picks each cell's fill and opacity. */
function Grid({ x, y, c = 8, o = 1, lit }: { x: number; y: number; c?: number; o?: number; lit: (a: number, b: number) => [string, number] }) {
  const cells = [];
  for (let a = 0; a < 16; a++)
    for (let b = 0; b < 16; b++) {
      const [f, op] = lit(a, b);
      cells.push(<rect key={a * 16 + b} x={x + b * c} y={y + a * c} width={c - 1} height={c - 1} fill={f} opacity={op * o} />);
    }
  return (
    <g>
      <rect x={x - 2} y={y - 2} width={16 * c + 3} height={16 * c + 3} fill="none" stroke={C.mocha} strokeWidth={1} opacity={o} />
      {cells}
    </g>
  );
}

const GX = [25, 222, 419];
const LAYOUTS: Layout[] = ['arrival', 'linear', 'z'];
const NAMES = ['arrival order', 'sorted by (A, B)', 'Z-order'];

/** The predicate's square, a in 4..7 and b in 4..7, over a grid at (x, y). */
function PredBox({ x, y, c = 8, o }: { x: number; y: number; c?: number; o: number }) {
  return <rect x={x + 4 * c - 1.5} y={y + 4 * c - 1.5} width={4 * c + 2} height={4 * c + 2} fill="none" stroke={C.focus} strokeWidth={2.5} opacity={o} />;
}

// 1 · Hook. Files of a sensible size from last time; one is opened to show its rows; a min and max tag lands on it;
// the question is whether those rows are arranged so the tag can prune.
export function Hook({ t }: StepCtx) {
  const z = easeInOut(seg(t, 1.0, 1.8));
  return (
    <Svg label="file size is only half of what makes a statistic useful -- this topic is the other half: layout." h={200}>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={25 + i * 60}
          y={40}
          width={45}
          height={60}
          rx={3}
          fill={C.cocoa}
          stroke={C.latte}
          strokeWidth={1.4}
          opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1)) * (i === 0 ? 1 : 1 - z * 0.6)}
        />
      ))}
      <rect x={lerp(25, 260, z)} y={lerp(40, 25, z)} width={lerp(45, 200, z)} height={lerp(60, 140, z)} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} opacity={z} />
      {Array.from({ length: 7 }, (_, i) => (
        <rect key={i} x={272} y={36 + i * 18} width={176} height={10} rx={1} fill={C.latte} opacity={0.5 * easeOut(seg(t, 1.8 + i * 0.08, 2.0 + i * 0.08))} />
      ))}
      <T x={480} y={60} s={12} f={C.second} o={easeOut(seg(t, 2.6, 2.9))}>
        min, max
      </T>
      <T x={25} y={190} s={14} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        are these rows arranged so a statistic can prune?
      </T>
    </Svg>
  );
}

// 2 · Predict. The grid sorted by A: each row group is one stripe across all of B; the two-column predicate's square sits
// over four stripes; the answer: only partly.
export function PredictSortOneColumnHelpsTwo({ t, answer }: StepCtx) {
  return (
    <Svg label="a table is sorted by column A only -- does that help a predicate filtering on both A and B?" h={200}>
      <Grid x={25} y={20} c={6} o={easeOut(seg(t, 0.1, 0.4))} lit={(a) => [a % 2 ? C.taupe : C.mocha, t > 0.6 + a * 0.06 ? 1 : 0]} />
      <PredBox x={25} y={20} c={6} o={easeOut(seg(t, 1.8, 2.1))} />
      <T x={140} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        one stripe per A value
      </T>
      <T x={140} y={70} s={11} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
        filter: A and B both 4 to 7
      </T>
      <AnswerRow y={145} label="the sort on A prunes" answer={answer} value="only partly" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={188} text="one A value still spans all of B" />
    </Svg>
  );
}

// 3 · Three layouts, for real. The same 256 cells in three grids; in each, cells light up in their real physical order on
// disk: scattered for arrival, row by row for the sort, in Z-shaped blocks for the Z-order.
export function RevealThreeLayoutsSameRows({ t }: StepCtx) {
  const n = 256 * easeInOut(seg(t, 0.8, 3.6));
  return (
    <Svg label="reproduced for real: the same 256 rows, three different physical orders." h={230}>
      {LAYOUTS.map((l, i) => (
        <g key={l}>
          <T x={GX[i]} y={22} s={12} f={C.crema} o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))}>
            {NAMES[i]}
          </T>
          <Grid x={GX[i]} y={34} o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))} lit={(a, b) => (pos(l, a, b) < n ? [C.second, 1] : [C.mocha, 0.6])} />
        </g>
      ))}
      <T x={25} y={196} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        blue: written so far, in disk order
      </T>
      <T x={25} y={221} s={13} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        same 256 rows, three orders
      </T>
    </Svg>
  );
}

// 4 · Row-group bounds. The sorted layout's sixteen groups outline one by one, each a single A row; one is picked out and
// its bounds read A from 5 to 5, B from 0 to 15; the Z-order's groups outline as square blocks beside it.
export function RevealRowGroupBoundsComputed({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: row-group bounds computed directly from the real row data." h={230}>
      <T x={25} y={22} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        sorted by (A, B)
      </T>
      <Grid x={25} y={34} o={easeOut(seg(t, 0.1, 0.4))} lit={(a) => [a === 5 && t > 2.4 ? C.second : C.mocha, 0.8]} />
      {Array.from({ length: 16 }, (_, k) => (
        <rect key={k} x={23} y={32 + k * 8} width={131} height={8} fill="none" stroke={C.latte} strokeWidth={0.8} opacity={easeOut(seg(t, 0.5 + k * 0.08, 0.7 + k * 0.08))} />
      ))}
      <T x={170} y={80} s={12} f={C.second} o={easeOut(seg(t, 2.5, 2.8))}>
        A 5 to 5, B 0 to 15
      </T>
      <T x={170} y={108} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        every group: one A, all of B
      </T>
      <T x={419} y={22} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.5))}>
        Z-order
      </T>
      <Grid x={419} y={34} o={easeOut(seg(t, 3.2, 3.5))} lit={(a, b) => [(morton(a, b) >> 4) % 2 ? C.taupe : C.mocha, 1]} />
      <T x={170} y={200} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 3.9))}>
        Z groups: square blocks of A and B
      </T>
    </Svg>
  );
}

// 5 · Pruning, measured. The predicate's square lands on all three grids; the groups whose bounds touch it light up:
// all 16 for arrival, 4 stripes for the sort, 1 block for the Z-order; each count lands under its grid.
export function RevealPredicatePruningMeasured({ t }: StepCtx) {
  const counts = ['16 of 16 groups', '4 of 16', '1 of 16'];
  return (
    <Svg label="reproduced for real: the identical two-column predicate, measured against each layout." h={230}>
      {LAYOUTS.map((l, i) => {
        const on = t > 1.2 + i * 0.8;
        return (
          <g key={l}>
            <T x={GX[i]} y={22} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
              {NAMES[i]}
            </T>
            <Grid x={GX[i]} y={34} o={easeOut(seg(t, 0.1, 0.4))} lit={(a, b) => (on && scanned(l, pos(l, a, b) >> 4) ? [C.cherryText, 0.75] : [C.mocha, 0.6])} />
            <PredBox x={GX[i]} y={34} o={easeOut(seg(t, 0.6, 0.9))} />
            <T x={GX[i]} y={192} s={13} f={i === 2 ? C.focus : C.cherryText} o={easeOut(seg(t, 1.3 + i * 0.8, 1.6 + i * 0.8))}>
              {counts[i]}
            </T>
          </g>
        );
      })}
      <T x={25} y={222} s={12} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        red: groups that must be read
      </T>
    </Svg>
  );
}

// 6 · Predict. A clustered table of blocks; a batch of new rows drops into one of them; the answer: only what changed.
export function PredictLiquidClusteringRewritesEverything({ t, answer }: StepCtx) {
  const d = easeOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="does liquid clustering rewrite the whole table every time new data arrives?" h={200}>
      {Array.from({ length: 16 }, (_, k) => (
        <rect
          key={k}
          x={25 + (k % 8) * 34}
          y={40 + Math.floor(k / 8) * 34}
          width={28}
          height={28}
          rx={3}
          fill={C.cocoa}
          stroke={k === 5 && d > 0.9 ? C.second : C.latte}
          strokeWidth={1.4}
          opacity={easeOut(seg(t, 0.1 + k * 0.03, 0.3 + k * 0.03))}
        />
      ))}
      <rect x={202} y={lerp(0, 44, d)} width={20} height={20} rx={2} fill={C.second} opacity={d > 0 ? 1 - seg(t, 1.6, 1.8) : 0} />
      <T x={320} y={60} s={12} f={C.second} o={easeOut(seg(t, 0.8, 1.1))}>
        new rows arrive
      </T>
      <T x={320} y={90} s={16} f={C.crema} o={easeOut(seg(t, 1.8, 2.2))}>
        rewrite it all?
      </T>
      <AnswerRow y={145} label="reclustering rewrites" answer={answer} value="only what changed" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={188} text="rows already in place stay put" />
    </Svg>
  );
}

// 7 · Three names. Delta, Iceberg and Hudi each name their feature; three lines run from the names into one idea.
export function RevealThreeFormatsSameIdea({ t }: StepCtx) {
  const names = ['Delta: liquid clustering', 'Iceberg: sort order', 'Hudi: clustering'];
  return (
    <Svg label="Delta's, Iceberg's, and Hudi's own words: three formats, the same one idea." h={230}>
      {names.map((n, i) => {
        const y = 25 + i * 55;
        const b = 0.2 + i * 0.6;
        return (
          <g key={n}>
            <Cell x={25} y={y} w={230} h={32} label={n} o={easeOut(seg(t, b, b + 0.3))} />
            <line x1={257} y1={y + 16} x2={lerp(257, 328, easeOut(seg(t, 2.2, 2.7)))} y2={lerp(y + 16, 96, easeOut(seg(t, 2.2, 2.7)))} stroke={C.focus} strokeWidth={1.6} />
          </g>
        );
      })}
      <rect x={330} y={70} width={245} height={52} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 2.6, 3.0))} />
      <T x={452} y={92} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        lay rows out to match
      </T>
      <T x={452} y={112} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.7, 3.1))}>
        the filtered columns
      </T>
      <T x={25} y={215} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        three names, one idea
      </T>
    </Svg>
  );
}

// 8 · Incremental vs full, for real. Sixteen Z blocks; 16 new rows land in one; incremental lights that block and the new
// rows, 32 rewritten; full lights every block, 272 rewritten; two bars to scale.
export function RevealIncrementalVsFullReclustering({ t }: StepCtx) {
  const inc = t > 1.4 && t < 2.6;
  const full = t >= 2.6;
  return (
    <Svg label="reproduced for real: incremental vs. full reclustering, measured by rows actually rewritten." h={230}>
      {Array.from({ length: 16 }, (_, k) => (
        <rect
          key={k}
          x={25 + (k % 8) * 34}
          y={25 + Math.floor(k / 8) * 34}
          width={28}
          height={28}
          rx={3}
          fill={C.cocoa}
          stroke={(inc && k === 3) || full ? C.cherryText : C.latte}
          strokeWidth={(inc && k === 3) || full ? 2.4 : 1.4}
          opacity={easeOut(seg(t, 0.1 + k * 0.03, 0.3 + k * 0.03))}
        />
      ))}
      <T x={25} y={110} s={11} f={C.second} o={easeOut(seg(t, 0.7, 1.0))}>
        16 new rows, all into one group
      </T>
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        incremental
      </T>
      <rect x={150} y={138} width={400 * (32 / 272) * easeOut(seg(t, 1.5, 2.0))} height={16} rx={2} fill={C.focus} />
      <T x={210} y={150} s={12} f={C.focus} o={easeOut(seg(t, 1.9, 2.2))}>
        32 rows
      </T>
      <T x={25} y={185} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        full
      </T>
      <rect x={150} y={173} width={400 * easeInOut(seg(t, 2.7, 3.6))} height={16} rx={2} fill={C.cherryText} />
      <T x={150} y={215} s={12} f={C.cherryText} o={easeOut(seg(t, 3.6, 3.9))}>
        272 rows: every row, plus the new
      </T>
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a linear sort prunes on its leading column; a real Z-order prunes on every column at once." h={250}>
      <Row y={40} label="linear sort" value="prunes on its lead" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="Z-order" value="prunes on every column" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="reclustering" value="only what changed" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
