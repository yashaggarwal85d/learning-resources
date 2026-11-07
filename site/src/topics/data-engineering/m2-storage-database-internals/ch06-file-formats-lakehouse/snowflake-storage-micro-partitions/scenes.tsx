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

/** A micro-partition block at (x, y) with a small value-range bar under it from lo to hi (0..1 of the column's range). */
function Block({ x, y, lo, hi, k = 1, on = 1, w = 44 }: { x: number; y: number; lo: number; hi: number; k?: number; on?: number; w?: number }) {
  return (
    <g opacity={k * (0.25 + 0.75 * on)}>
      <rect x={x} y={y} width={w} height={26} rx={2} fill={C.cocoa} stroke={on > 0.5 ? C.focus : C.mocha} strokeWidth={1.4} />
      <line x1={x + 4 + lo * (w - 8)} y1={y + 34} x2={x + 4 + hi * (w - 8)} y2={y + 34} stroke={C.second} strokeWidth={3} />
    </g>
  );
}

const RANGES: [number, number][] = [
  [0, 0.15],
  [0.12, 0.3],
  [0.28, 0.45],
  [0.4, 0.55],
  [0.52, 0.7],
  [0.66, 0.8],
  [0.78, 0.92],
  [0.88, 1],
];
const MESSY: [number, number][] = [
  [0, 0.9],
  [0.1, 0.7],
  [0.3, 1],
  [0.05, 0.6],
  [0.2, 0.95],
  [0.4, 1],
  [0, 0.8],
  [0.15, 0.85],
];

// 1 · Hook. The local engines so far, each on this machine; past a dashed boundary, a platform this sandbox can't reach: its own docs only.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="every engine so far reads a table this chapter owns. the first one this sandbox can't run at all: snowflake." h={200}>
      {['Trino', 'ClickHouse', 'DuckDB'].map((e, i) => (
        <g key={e}>
          <Cell x={25} y={20 + i * 44} w={130} h={28} label={e} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} />
          <MiniTick x={165} y={34 + i * 44} k={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))} />
        </g>
      ))}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        on this machine
      </T>
      <line x1={270} y1={10} x2={270} y2={lerp(10, 190, easeOut(seg(t, 1.4, 2.0)))} stroke={C.mocha} strokeWidth={1.6} strokeDasharray="6 5" />
      <Cell x={330} y={64} w={200} h={34} label="Snowflake" stroke={C.second} o={easeOut(seg(t, 2.0, 2.4))} />
      <T x={330} y={130} s={11} f={C.second} o={easeOut(seg(t, 2.6, 3.0))}>
        its own docs only
      </T>
    </Svg>
  );
}

// 2 · Predict. A long strip of rows with dashed, undecided boundaries: who draws them?
export function PredictPartitionDefinition({ t, answer }: StepCtx) {
  const g = easeOut(seg(t, 0.2, 1.0));
  return (
    <Svg label="a table's rows: split into partitions a person defines, or something else entirely?" h={200}>
      <rect x={25} y={30} width={550 * g} height={30} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
      {[1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={25 + i * 91} y1={24} x2={25 + i * 91} y2={66} stroke={C.second} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.0 + i * 0.15, 1.3 + i * 0.15))} />
      ))}
      <T x={25} y={92} s={12} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
        who draws these lines?
      </T>
      <AnswerRow y={140} label="the boundaries" answer={answer} value="the system draws them" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="nobody draws them by hand" />
    </Svg>
  );
}

// 3 · Micro-partitions. Rows land and blocks appear on their own, filling a grid underneath one ordinary-looking table name.
export function RevealMicroPartitions({ t }: StepCtx) {
  const n = Math.floor(seg(t, 0.8, 3.2) * 40);
  return (
    <Svg label="immutable micro-partitions, fifty to five hundred megabytes uncompressed, derived automatically, never defined by hand." h={230}>
      <Cell x={25} y={16} w={180} h={30} label="one ordinary table" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={230} y={36} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        each block: fifty to five hundred MB
      </T>
      {Array.from({ length: 40 }, (_, i) => (
        <rect
          key={i}
          x={25 + (i % 20) * 27.5}
          y={66 + Math.floor(i / 20) * 34}
          width={23}
          height={26}
          rx={2}
          fill={C.cocoa}
          stroke={i === n - 1 ? C.focus : C.latte}
          strokeWidth={1.2}
          opacity={i < n ? 1 : 0}
        />
      ))}
      <T x={25} y={166} s={12} f={C.second} o={easeOut(seg(t, 1.4, 1.8))}>
        carved as data lands, never by hand
      </T>
      <T x={25} y={204} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        thousands, even millions, per table
      </T>
    </Svg>
  );
}

// 4 · Pruning. Each block shows its value range; a filter range drops in, and every block whose range misses it dims unopened.
export function RevealPruning({ t }: StepCtx) {
  const f = easeOut(seg(t, 1.6, 2.0));
  const pr = easeOut(seg(t, 2.2, 2.8));
  const flo = 0.42;
  const fhi = 0.5;
  return (
    <Svg label="per-column metadata on every micro-partition lets a query skip the ones it doesn't need at all." h={230}>
      {RANGES.map(([lo, hi], i) => {
        const hit = hi >= flo && lo <= fhi;
        return <Block key={i} x={25 + i * 68} y={30} w={60} lo={lo} hi={hi} k={easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08))} on={hit ? 1 : 1 - pr} />;
      })}
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        each block notes its value range, per column
      </T>
      <rect x={25 + flo * 544} y={120} width={(fhi - flo) * 544} height={8} fill={C.focus} opacity={f} />
      <T x={25} y={150} s={12} f={C.focus} o={f}>
        the filter's range
      </T>
      <Row y={200} label="blocks opened" value={pr > 0.9 ? 'two of eight' : '…'} valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}

// 5 · Automatic clustering. Overlapping ranges stack up deep; a background sweep rewrites them into tidy, non-overlapping ranges.
export function RevealClusteringAutomatic({ t }: StepCtx) {
  const r = easeInOut(seg(t, 2.2, 3.6));
  return (
    <Svg label="clustering depth measures the overlap; automatic clustering reclusters in the background, on its own." h={230}>
      {MESSY.map(([lo, hi], i) => {
        const [tl, th] = RANGES[i];
        const a = lerp(lo, tl, r);
        const b = lerp(hi, th, r);
        const k = easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08));
        return <line key={i} x1={25 + a * 540} y1={30 + i * 12} x2={25 + b * 540} y2={30 + i * 12} stroke={r > 0.95 ? C.focus : C.second} strokeWidth={4} opacity={k} />;
      })}
      <T x={25} y={150} s={12} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.4)) * (1 - r)}>
        ranges overlap: a filter skips little
      </T>
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        a background process rewrites, unasked
      </T>
      <T x={25} y={212} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        tidy ranges again
      </T>
    </Svg>
  );
}

// 6 · Predict. One needle value; every block's range spans nearly everything, so range-skipping can't single any out.
export function PredictPointLookup({ t, answer }: StepCtx) {
  return (
    <Svg label="a point lookup on a high-cardinality column. does pruning and clustering alone make it fast?" h={200}>
      {RANGES.map((_, i) => (
        <Block key={i} x={25 + i * 68} y={20} w={60} lo={0.05} hi={0.95} k={easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08))} />
      ))}
      <circle cx={300} cy={84} r={5} fill={C.focus} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={315} y={89} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        one exact value
      </T>
      <AnswerRow y={140} label="a pinpoint lookup" answer={answer} value="a separate service" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="ranges can't single out one value" />
    </Svg>
  );
}

// 7 · Search optimization. A lookup structure sits beside the block metadata; the needle's entry points straight at one block.
export function RevealSearchOptimization({ t }: StepCtx) {
  const p = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="a separate service: search optimization, built for point lookups, not range scans." h={230}>
      {RANGES.map((_, i) => (
        <Block key={i} x={25 + i * 68} y={20} w={60} lo={0.05} hi={0.95} on={i === 5 ? p : 0} />
      ))}
      <rect x={25} y={110} width={260} height={64} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={38} y={134} s={12} f={C.second} o={easeOut(seg(t, 0.4, 0.8))}>
        lookup structure
      </T>
      <T x={38} y={160} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.3))}>
        value or text fragment → block
      </T>
      <path d={`M287 142 L${lerp(287, 395, p)} ${lerp(142, 62, p)}`} stroke={C.focus} strokeWidth={1.8} fill="none" />
      <T x={330} y={200} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        beside the metadata, not instead
      </T>
    </Svg>
  );
}

// 8 · Time travel, then fail-safe. A change lands; the old block is kept; a focus band (time travel) runs out, a second band (fail-safe,
// support only) follows.
export function RevealTimeTravelFailSafe({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.2, 2.4));
  const b = easeInOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="because micro-partitions are never overwritten, old versions survive -- time travel, then a last-resort fail-safe window." h={230}>
      <Cell x={25} y={20} w={110} h={28} label="old block" stroke={C.latte} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={160} y={20} w={110} h={28} label="new block" stroke={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <T x={295} y={39} s={11} f={C.latte} o={easeOut(seg(t, 0.7, 1.1))}>
        a change: the old one stays
      </T>
      <line x1={25} y1={90} x2={25} y2={120} stroke={C.mocha} strokeWidth={2} opacity={easeOut(seg(t, 1.0, 1.2))} />
      <rect x={25} y={98} width={280 * a} height={14} fill={C.focus} />
      <T x={25} y={145} s={12} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        time travel: ask how it looked
      </T>
      <rect x={305} y={98} width={180 * b} height={14} fill={C.second} />
      <T x={305} y={180} s={12} f={C.second} o={easeOut(seg(t, 3.0, 3.4))}>
        fail-safe
      </T>
      <T x={305} y={206} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        platform support only
      </T>
    </Svg>
  );
}

// 9 · Clone and share. The original table points at three blocks; a clone and a share each draw their own arrows to the very same blocks.
export function RevealCloneAndShare({ t }: StepCtx) {
  const c = easeInOut(seg(t, 1.0, 1.8));
  const s = easeInOut(seg(t, 2.6, 3.4));
  const bx = [380, 440, 500];
  return (
    <Svg label="a clone and a share both point at the same immutable files -- no bytes copied, nothing moved." h={230}>
      {bx.map((x) => (
        <rect key={x} x={x} y={90} width={50} height={30} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} />
      ))}
      <Cell x={25} y={20} w={150} h={28} label="the table" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={91} w={150} h={28} label="a clone" stroke={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <Cell x={25} y={162} w={150} h={28} label="a share" stroke={C.second} o={easeOut(seg(t, 2.4, 2.7))} />
      {bx.map((x) => (
        <g key={x}>
          <line x1={177} y1={34} x2={x + 25} y2={88} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
          <line x1={177} y1={105} x2={lerp(177, x + 25, c)} y2={105} stroke={C.focus} strokeWidth={1.2} opacity={c > 0 ? 1 : 0} />
          <line x1={177} y1={176} x2={lerp(177, x + 25, s)} y2={lerp(176, 122, s)} stroke={C.second} strokeWidth={1.2} opacity={s > 0 ? 1 : 0} />
        </g>
      ))}
      <T x={380} y={210} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        no bytes copied
      </T>
    </Svg>
  );
}

// 10 · Recap. One rule at the top; its consequences tick in under it.
export function Recap({ t }: StepCtx) {
  const rows = ['skipping by range', 'cleaning up overlap', 'old versions kept', 'free copies and shares'];
  return (
    <Svg label="one immutable design: pruning, clustering, time travel, cloning and sharing, all consequences of it. next: bigquery." h={250}>
      <T x={25} y={32} s={15} f={C.focus} o={easeOut(seg(t, 0.1, 0.5))}>
        a block is never rewritten
      </T>
      {rows.map((r, i) => (
        <g key={r}>
          <T x={45} y={80 + i * 44} s={13} f={C.crema} o={easeOut(seg(t, 0.8 + i * 0.6, 1.2 + i * 0.6))}>
            {r}
          </T>
          <MiniTick x={540} y={74 + i * 44} k={easeOut(seg(t, 1.1 + i * 0.6, 1.5 + i * 0.6))} />
        </g>
      ))}
    </Svg>
  );
}
