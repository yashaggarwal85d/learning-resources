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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SCATTERED = [7, 2, 11, 4, 9, 1, 12, 5, 3, 10, 6, 8];

/** Rows drawn as value bars in physical order, grouped into block ranges of four; each range's min-to-max span
 * shows as a band behind it. `kb` grows the bars, `kr` draws the range bands. */
function Column({ x, w, base, unit, vals, kb, kr, band }: { x: number; w: number; base: number; unit: number; vals: number[]; kb: number; kr: number; band: string }) {
  const step = w / vals.length;
  return (
    <g>
      {[0, 1, 2].map((r) => {
        const g = vals.slice(r * 4, r * 4 + 4);
        const lo = Math.min(...g);
        const hi = Math.max(...g);
        return <rect key={r} x={x + r * 4 * step} y={base - hi * unit} width={4 * step - 3} height={(hi - lo + 1) * unit} rx={3} fill={band} opacity={0.22 * kr} stroke={band} strokeOpacity={kr} />;
      })}
      {vals.map((v, i) => (
        <rect key={i} x={x + i * step + step * 0.2} y={base - v * unit * kb} width={step * 0.6} height={v * unit * kb} rx={1.5} fill={C.latte} />
      ))}
    </g>
  );
}

/** The tag a block range carries: its smallest and largest value. */
function MinMax({ x, y, o, f = C.focus }: { x: number; y: number; o: number; f?: string }) {
  return (
    <T x={x} y={y} s={12} f={f} a="middle" o={o}>
      min · max
    </T>
  );
}

// 1 · Hook. No index: 10,811 buffers grows across; then the summary index: 15 buffers, a sliver.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="same filter, same table — summary index vs. no index" h={370}>
      {timeBar(30, 90, 15 / 10811, '15 buffers', 'summary index', C.focus, easeOut(seg(t, 2.8, 3.6)))}
      {timeBar(30, 210, 10811 / 10811, '10,811 buffers', 'no index', C.cherryText, easeOut(seg(t, 0.8, 2.4)))}
    </Svg>
  );
}

// 2 · Predict: nothing per row. A row of table rows, each getting its own B-tree entry dot; then the question.
export function PredictNothingPerRow({ t, answer }: StepCtx) {
  return (
    <Svg label="a B-tree: one entry per row — something smaller?" h={210}>
      <Row y={40} label="B-tree entries" value="one per row" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 16 }, (_, i) => {
        const k = easeOutBack(seg(t, 0.3 + i * 0.05, 0.6 + i * 0.05));
        return (
          <g key={i}>
            <rect x={25 + i * 34.5} y={62} width={30} height={18} rx={2} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.2, 0.5))} />
            <circle cx={40 + i * 34.5} cy={94} r={4 * k} fill={C.latte} />
          </g>
        );
      })}
      <AnswerRow y={140} label="an index with none of that" answer={answer} value="yes, still useful" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="a coarse summary rules out most of the table" />
    </Svg>
  );
}

// 3 · What a block-range summary stores. Four ranges of pages appear; each gets one min · max tag; then the pages
// dim behind it: one fact stands in for every row.
export function RevealWhatBrinStores({ t }: StepCtx) {
  const pages = 1 - 0.6 * easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="one summary per block range" h={210}>
      <Row y={40} label="stores per range" value="minimum, maximum" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.7))} />
      <Row y={85} label="stores per row" value="nothing at all" k={easeOut(seg(t, 3.1, 3.6))} />
      {[0, 1, 2, 3].map((r) => {
        const kb = easeOut(seg(t, 0.2 + r * 0.15, 0.6 + r * 0.15));
        const kt = easeOut(seg(t, 1.6 + r * 0.25, 2.1 + r * 0.25));
        const x = 25 + r * 140;
        return (
          <g key={r}>
            <rect x={x} y={148} width={130} height={44} rx={5} fill="none" stroke={kt > 0 ? C.focus : C.mocha} strokeOpacity={kb} />
            {[0, 1, 2, 3].map((p) => (
              <rect key={p} x={x + 8 + p * 30} y={156} width={24} height={28} rx={2} fill={C.cocoa} stroke={C.latte} opacity={kb * pages} />
            ))}
            <MinMax x={x + 65} y={lerp(140, 134, kt)} o={kt} />
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Size. The summary index grows to 24 KB, a sliver; the B-tree on the same column grows to 14 MB; then the ratio.
export function RevealSizeContrast({ t }: StepCtx) {
  const r = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="same column, same data, two index types" h={370}>
      {timeBar(30, 90, 24 / 14000, '24 KB', 'block-range summary', C.focus, easeOut(seg(t, 0.6, 1.4)))}
      {timeBar(30, 210, 14000 / 14000, '14 MB', 'B-tree', C.cherryText, easeOut(seg(t, 1.8, 3.0)))}
      <T x={300} y={lerp(318, 310, r)} s={16} f={C.crema} a="middle" o={r}>
        about 596 times larger
      </T>
    </Svg>
  );
}

// 5 · Predict: any column? A strip of ranges, one tag each; then the question.
export function PredictAnyColumn({ t, answer }: StepCtx) {
  return (
    <Svg label="a coarse summary — does it need anything true first?" h={210}>
      <Row y={40} label="summary covers" value="a whole block range" k={easeOut(seg(t, 0.1, 0.6))} />
      {[0, 1, 2, 3].map((r) => (
        <rect key={r} x={25 + r * 140} y={66} width={130} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.3 + r * 0.1, 0.7 + r * 0.1))} />
      ))}
      <AnswerRow y={140} label="works for any column" answer={answer} value="only if values cluster" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a range's rows must hold close-together values" />
    </Svg>
  );
}

// 6 · The requirement. A column matched to row order: each range's band is narrow. A scattered column: every band
// spans nearly everything, nothing left to summarize.
export function RevealCorrelationRequirement({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.4, 1.0));
  const r = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="the summary only helps if this holds" h={230}>
      <Row y={40} label="required" value="matched to row order" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Column x={25} w={265} base={185} unit={9} vals={MATCHED} kb={l} kr={easeOut(seg(t, 1.5, 2.1))} band={C.focus} />
      <Column x={310} w={265} base={185} unit={9} vals={SCATTERED} kb={r} kr={easeOut(seg(t, 3.3, 3.9))} band={C.cherryText} />
      <T x={157} y={215} s={13} f={C.latte} a="middle" o={l}>
        matched
      </T>
      <T x={442} y={215} s={13} f={C.latte} a="middle" o={r}>
        scattered
      </T>
    </Svg>
  );
}

// 7 · Correlated result. No index: 10,811 buffers, 116.638 ms; the summary index: 15 buffers, 0.140 ms; then the ratio.
export function RevealCorrelatedResult({ t }: StepCtx) {
  const r = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="well-correlated column, same equality filter" h={370}>
      {timeBar(30, 90, 15 / 10811, '15 buffers, 0.140 ms', 'summary index', C.focus, easeOut(seg(t, 1.6, 2.4)))}
      {timeBar(30, 210, 10811 / 10811, '10,811 buffers, 116.638 ms', 'no index', C.cherryText, easeOut(seg(t, 0.3, 1.3)))}
      <T x={300} y={lerp(318, 310, r)} s={16} f={C.crema} a="middle" o={r}>
        about 833 times faster
      </T>
    </Svg>
  );
}

// 8 · Predict: a scattered column. The scattered values rise in physical order; then the question.
export function PredictScatteredColumn({ t, answer }: StepCtx) {
  return (
    <Svg label="values scattered randomly across the table" h={210}>
      <Row y={40} label="column values" value="scattered, not clustered" k={easeOut(seg(t, 0.1, 0.6))} />
      {SCATTERED.map((v, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.04, 0.8 + i * 0.04));
        return <rect key={i} x={30 + i * 45.5} y={108 - v * 3.5 * k} width={32} height={v * 3.5 * k} rx={2} fill={C.latte} />;
      })}
      <AnswerRow y={140} label="summary still helps" answer={answer} value="no" k={easeOut(seg(t, 1.4, 1.9))} f={C.cherryText} />
      <Verdict answer={answer} text="every range already holds almost every value" f={C.cherryText} />
    </Svg>
  );
}

// 9 · Uncorrelated result. Both read almost the whole table: 10,826 vs 10,811 buffers; then the times count up,
// and the summary index is the slower one.
export function RevealUncorrelatedResult({ t }: StepCtx) {
  const a = easeOut(seg(t, 2.8, 3.6));
  const b = easeOut(seg(t, 3.2, 4.0));
  return (
    <Svg label="scattered column, same kind of filter" h={350}>
      {timeBar(30, 70, 10826 / 10826, '10,826 buffers', 'summary index', C.cherryText, easeOut(seg(t, 0.4, 1.6)))}
      {timeBar(30, 180, 10811 / 10826, '10,811 buffers', 'no index', C.taupe, easeOut(seg(t, 0.8, 2.0)))}
      <Row y={275} label="summary index" value={`${num(200.129 * a, 3)} ms`} valueColor={C.cherryText} k={a} />
      <Row y={320} label="no index" value={`${num(100.469 * b, 3)} ms`} k={b} />
    </Svg>
  );
}

// 10 · Predict: trust the range? One range's tag matches the filter; its rows sit inside, undecided.
export function PredictTrustRange({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  const m = easeOut(seg(t, 0.8, 1.3));
  return (
    <Svg label="the summary matches — are the rows trusted outright?" h={210}>
      <Row y={40} label="range summary matches" value="the filter" k={easeOut(seg(t, 0.1, 0.6))} />
      <rect x={25} y={64} width={550} height={40} rx={5} fill="none" stroke={m > 0 ? C.focus : C.mocha} strokeOpacity={k} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={33 + i * 67.5} y={72} width={60} height={24} rx={2} fill={C.cocoa} stroke={C.latte} opacity={k} />
      ))}
      <AnswerRow y={140} label="every row inside trusted" answer={answer} value="no, each rechecked" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="a match means maybe, never certainly" />
    </Svg>
  );
}

// 11 · Lossy, by design. The matching range hands out its rows as candidates; the executor checks them one at a time;
// the ones that don't match are thrown away.
const KEEP = [2, 5];
export function RevealLossyRecheck({ t }: StepCtx) {
  const out = easeOut(seg(t, 0.5, 1.2));
  const drop = easeInOut(seg(t, 3.5, 4.1));
  return (
    <Svg label="lossy, by design" h={210}>
      <Row y={40} label="a matching range returns" value="rows as candidates" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="the executor" value="rechecks each one" valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.9))} />
      {Array.from({ length: 8 }, (_, i) => {
        const c = seg(t, 1.8 + i * 0.2, 2.0 + i * 0.2);
        const keep = KEEP.includes(i);
        const fill = c >= 1 ? (keep ? C.focus : C.cherryText) : C.cocoa;
        const gone = keep ? 0 : drop;
        return <rect key={i} x={33 + i * 67.5} y={lerp(112, 140, out) + gone * 20} width={60} height={26} rx={3} fill={fill} stroke={C.latte} strokeOpacity={0.6} opacity={out * (1 - 0.85 * gone)} />;
      })}
      <rect
        x={33 + Math.min(7, Math.max(0, Math.floor((t - 1.8) / 0.2))) * 67.5 - 4}
        y={134}
        width={68}
        height={38}
        rx={5}
        fill="none"
        stroke={C.crema}
        strokeWidth={2}
        opacity={seg(t, 1.7, 1.8) * (1 - seg(t, 3.4, 3.5))}
      />
    </Svg>
  );
}

// 12 · Parquet row groups. A file of four row groups, each with a min · max footer; the reader checks the footers
// first, skips three groups, and decodes only the one that could match.
export function RevealParquetStats({ t }: StepCtx) {
  const kf = easeOut(seg(t, 0.4, 1.0));
  const skip = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="Parquet row groups: the same idea, one layer up" h={230}>
      <Row y={40} label="per row group" value="minimum, maximum" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="read before" value="any row is decoded" k={easeOut(seg(t, 1.6, 2.1))} />
      {[0, 1, 2, 3].map((g) => {
        const x = 25 + g * 140;
        const tag = easeOut(seg(t, 1.0 + g * 0.2, 1.4 + g * 0.2));
        const read = seg(t, 1.9 + g * 0.25, 2.2 + g * 0.25);
        const hit = g === 2;
        return (
          <g key={g} opacity={kf * (hit ? 1 : 1 - 0.7 * skip)}>
            <rect x={x} y={112} width={130} height={60} rx={4} fill={hit ? C.cocoa : 'none'} stroke={C.mocha} />
            {[0, 1, 2].map((l) => (
              <rect key={l} x={x + 10} y={120 + l * 14} width={110} height={8} rx={2} fill={hit && skip > 0 ? C.focus : C.mocha} opacity={hit ? 0.4 + 0.6 * skip : 0.5} />
            ))}
            <rect x={x} y={178} width={130} height={26} rx={4} fill="none" stroke={read > 0 ? C.focus : C.latte} strokeOpacity={tag} />
            <MinMax x={x + 65} y={196} o={tag} f={read > 0 ? C.focus : C.latte} />
          </g>
        );
      })}
    </Svg>
  );
}

// 13 · Snowflake micro-partitions. A grid of small partitions, each carrying a range for every column (three ticks);
// the filter's range check skips all but two before anything is scanned.
const MP_KEEP = [5, 12];
const MP_SPAN = [3, 7, 5, 9, 4, 8, 6, 2, 7, 5, 3, 9, 6, 4, 8, 5];
export function RevealSnowflakeMicropartitions({ t }: StepCtx) {
  const prune = seg(t, 2.0, 3.4);
  return (
    <Svg label="Snowflake micro-partitions: the same principle" h={230}>
      <Row y={40} label="per partition" value="each column's value range" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="pruned" value="before scanning it" k={easeOut(seg(t, 1.8, 2.3))} />
      {MP_SPAN.map((sp, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const x = 25 + col * 69;
        const y = 112 + row * 50;
        const k = easeOut(seg(t, 0.4 + i * 0.04, 0.8 + i * 0.04));
        const keep = MP_KEEP.includes(i);
        const off = keep ? 0 : easeInOut(seg(prune, i / 16, i / 16 + 0.2));
        return (
          <g key={i} opacity={k * (1 - 0.7 * off)}>
            <rect x={x} y={y} width={62} height={42} rx={4} fill={keep && prune > 0.9 ? C.cocoa : 'none'} stroke={keep && prune > 0.9 ? C.focus : C.mocha} />
            {[0, 1, 2].map((c) => {
              const len = ((sp + c * 3) % 9) + 3;
              return <line key={c} x1={x + 16 + c * 15} y1={y + 36} x2={x + 16 + c * 15} y2={y + 36 - len * 2.6 * easeOut(seg(t, 0.9, 1.5))} stroke={C.latte} strokeWidth={3} strokeLinecap="round" />;
            })}
          </g>
        );
      })}
    </Svg>
  );
}

// 14 · Recap. Three lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = ['a block-range summary is tiny next to a B-tree', 'it only helps on a genuinely correlated column', 'a matching range still gets every row rechecked'];
  return (
    <Svg label="recap: a small summary, a real requirement" h={200}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.3, 0.7 + i * 1.3));
        return (
          <T key={l} x={300} y={60 + i * 42 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 15 · Prove: how many ranges checked. Five hundred ranges in date order; after the answer all but one dim, and
// the verdict lands with a tick.
export function ProveBlockRangesScanned({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const pr = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const strip = easeOut(seg(t, 0.6, 1.2));
  const hx = 25 + 550 * (311 / 500);
  return (
    <Svg label="500 ranges, one date, strictly correlated — how many rechecked?" h={230}>
      <Row y={40} label="total block ranges" value="500" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={90} label="ranges to check" answer={answer} value="just 1" k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={120} width={550 * strip} height={24} rx={2} fill={C.mocha} opacity={1 - 0.7 * pr} />
      {Array.from({ length: 49 }, (_, i) => (
        <line key={i} x1={25 + (i + 1) * 11.22} y1={120} x2={25 + (i + 1) * 11.22} y2={144} stroke={C.cocoa} strokeWidth={0.6} opacity={strip} />
      ))}
      {pr > 0 && <rect x={hx - 2} y={116} width={5} height={32} rx={1} fill={C.focus} opacity={pr} />}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={16} f={C.focus} a="middle" o={k}>
            1 checked, 499 ruled out
          </T>
          <rect x={160} y={202} width={280 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
