import { useEffect, useState } from 'react';
import { Bar, C, Draw, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
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

/** An index strip: `n` equal segments from x0 to x1; segment `hit` lights once `h` > 0; drawn in by `k`. */
function Strip({ x0, x1, y, n, hit, h, k, dashed = false }: { x0: number; x1: number; y: number; n: number; hit: number; h: number; k: number; dashed?: boolean }) {
  const w = (x1 - x0) / n;
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={x0 + i * w + 1}
          y={y}
          width={w - 2}
          height={18}
          rx={2}
          fill={C.cocoa}
          stroke={i === hit && h > 0 ? C.focus : C.mocha}
          strokeWidth={i === hit && h > 0 ? 1.5 + 1.5 * h : 1}
          strokeDasharray={dashed ? '3 2' : undefined}
          opacity={h > 0 && i !== hit ? 1 - 0.55 * h : 1}
        />
      ))}
    </g>
  );
}

// 1 · Hook. Two files build side by side: Parquet's row groups and footer; ORC's stripes, each led by its index streams,
// and its own footer. Every block drops into place; the index streams open at each stripe's head and are locked onto;
// dashed pairs link each Parquet block to its ORC counterpart.
export function Hook({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35));
  // each block is written into its file: it drops into place from above
  const drop = (i: number) => (1 - k(i)) * -18;
  // ORC's index streams open up at the head of each stripe: the decision Parquet makes differently
  const idx = (i: number) => easeOutBack(seg(t, 1.6 + i * 0.25, 2.0 + i * 0.25));
  return (
    <Svg label="one immutable Parquet file, and the one rival that made nearly every choice differently." h={215}>
      <T x={25} y={42} s={13} f={C.crema} o={k(0)}>
        Parquet
      </T>
      {[0, 1].map((i) => (
        <g key={i} opacity={k(i + 1)} transform={`translate(0 ${drop(i + 1).toFixed(1)})`}>
          <rect x={25} y={52 + i * 44} width={250} height={40} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <T x={150} y={76 + i * 44} s={13} f={C.latte} a="middle">
            row group
          </T>
        </g>
      ))}
      <g opacity={k(3)} transform={`translate(0 ${drop(3).toFixed(1)})`}>
        <rect x={25} y={140} width={250} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={150} y={155} s={13} f={C.latte} a="middle">
          footer
        </T>
      </g>
      <T x={325} y={42} s={13} f={C.crema} o={k(0)}>
        ORC
      </T>
      {[0, 1].map((i) => {
        const w = 50 * clamp(idx(i), 0, 1.15);
        return (
          <g key={i} opacity={k(i + 1)} transform={`translate(0 ${drop(i + 1).toFixed(1)})`}>
            <rect x={325} y={52 + i * 44} width={250} height={40} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
            {w > 0 && <rect x={330} y={57 + i * 44} width={w} height={30} rx={2} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} />}
            <T x={355} y={76 + i * 44} s={13} f={C.second} a="middle" o={clamp(idx(i))}>
              index
            </T>
            <T x={480} y={76 + i * 44} s={13} f={C.latte} a="middle">
              stripe: streams
            </T>
          </g>
        );
      })}
      <g opacity={k(3)} transform={`translate(0 ${drop(3).toFixed(1)})`}>
        <rect x={325} y={140} width={250} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={450} y={155} s={13} f={C.latte} a="middle">
          footer
        </T>
      </g>
      {/* same data, two shapes: each Parquet block is paired with its ORC counterpart */}
      {[74, 118, 151].map((y, i) => (
        <Draw key={y} pts={[[277, y], [323, y]]} t={t} from={2.3 + i * 0.12} to={2.55 + i * 0.12} stroke={C.line} w={1.2} dash="3 3" pen={false} />
      ))}
      <g opacity={easeOut(seg(t, 2.6, 3.0))} transform={`translate(0 ${((1 - easeOut(seg(t, 2.6, 3.0))) * 10).toFixed(1)})`}>
        <T x={300} y={200} s={13} f={C.focus} a="middle">
          one rival, nearly every decision different
        </T>
      </g>
      <Reticle x={355} y={94} w={62} h={80} t={t} at={3.3} color={C.second} />
    </Svg>
  );
}

/** Rows 0..100,000 onto x from x0 to x1. */
const rx = (v: number, x0 = 150, x1 = 575) => x0 + (v / 100000) * (x1 - x0);

// 2 · Predict. ORC's ten-entry index strip above Parquet's four row groups; a query marker drops at row 50,000; after the
// answer each strip's hit segment lights, ORC's narrower.
export function PredictRowIndex({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="no configuration on either side — does ORC's own row index prune finer than Parquet's bare row-group stats?" h={200}>
      <T x={25} y={64} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        ORC index
      </T>
      <Strip x0={150} x1={575} y={50} n={10} hit={5} h={v} k={easeOut(seg(t, 0.2, 0.5))} />
      <T x={25} y={99} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        row groups
      </T>
      <Strip x0={150} x1={575} y={85} n={4} hit={2} h={v} k={easeOut(seg(t, 0.5, 0.8))} />
      <path d={`M${rx(51000)} ${lerp(30, 44, easeOut(seg(t, 0.9, 1.3)))} l-6 -9 h12 z`} fill={C.second} opacity={easeOut(seg(t, 0.9, 1.1))} />
      <AnswerRow y={150} label="ORC prunes finer?" answer={answer} value="yes, by default" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={190} text="every 10,000 rows, always on" />
    </Svg>
  );
}

const STREAMS: [string, string][] = [
  ['col 1 PRESENT', C.mocha],
  ['col 1 DATA', C.mocha],
  ['col 2 PRESENT', C.mocha],
  ['col 2 DATA', C.mocha],
];

// 3 · Stripe layout. One stripe opens: index streams at the front, then each column's PRESENT and DATA streams side by
// side; a plain scan starts after the index and sweeps only the data.
export function RevealStripeLayout({ t }: StepCtx) {
  const sc = easeInOut(seg(t, 2.4, 3.6));
  return (
    <Svg label="each ORC column is several named streams, index streams first, data streams after." h={215}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        one stripe, front to back
      </T>
      <rect x={25} y={55} width={550} height={70} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <rect x={32} y={62} width={96} height={56} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} />
        <T x={80} y={94} s={11} f={C.second} a="middle">
          index
        </T>
      </g>
      {STREAMS.map(([l], i) => (
        <g key={l} opacity={easeOut(seg(t, 0.9 + i * 0.3, 1.2 + i * 0.3))}>
          <rect x={136 + i * 108} y={62} width={102} height={56} rx={3} fill={C.cocoa} stroke={sc * 4 > i ? C.focus : C.mocha} strokeWidth={1.5} />
          <T x={187 + i * 108} y={86} s={11} f={C.crema} a="middle">
            {l.split(' ').slice(0, 2).join(' ')}
          </T>
          <T x={187 + i * 108} y={104} s={11} f={C.latte} a="middle">
            {l.split(' ')[2]}
          </T>
        </g>
      ))}
      <path d={`M${lerp(136, 568, sc)} 140 l-6 10 h12 z`} fill={C.focus} opacity={sc > 0 ? 1 : 0} />
      <T x={300} y={195} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        a plain scan never reads the index
      </T>
    </Svg>
  );
}

// 4 · ORC index measured. The ORC strip's hit entry lights and its rows-read count lands; Parquet's row-group strip's
// hit group lights, two and a half times wider, and its count lands.
export function RevealOrcIndex({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 1.2));
  const b = easeOut(seg(t, 2.2, 2.6));
  return (
    <Svg label="100,000 rows, a selective query: ORC's fixed row index reads 10,000, Parquet's bare row-group stats read 25,000." h={235}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        same 100,000 rows, same query
      </T>
      <Strip x0={25} x1={575} y={52} n={10} hit={5} h={a} k={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={100} label="ORC row index" value="10,000 rows read" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Strip x0={25} x1={575} y={122} n={4} hit={2} h={b} k={easeOut(seg(t, 1.8, 2.1))} />
      <Row y={170} label="Parquet row groups" value="25,000 rows read" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.0))} />
      <T x={300} y={215} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        ORC wins with nothing configured
      </T>
    </Svg>
  );
}

// 5 · Predict. ORC's fixed strip above a faint, dashed, switched-off page-index strip; the answer: yes, once it's on.
export function PredictPageIndex({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="can Parquet still beat ORC's fixed 10,000-row granularity?" h={200}>
      <T x={25} y={64} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        ORC, fixed
      </T>
      <Strip x0={150} x1={575} y={50} n={10} hit={-1} h={0} k={easeOut(seg(t, 0.2, 0.5))} />
      <T x={25} y={99} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        page index
      </T>
      <Strip x0={150} x1={575} y={85} n={40} hit={20} h={v} k={easeOut(seg(t, 0.5, 0.8)) * (0.45 + 0.55 * v)} dashed={v === 0} />
      <AnswerRow y={150} label="Parquet finer?" answer={answer} value="yes, page index on" k={easeOut(seg(t, 1.1, 1.6))} />
      <Verdict answer={answer} y={190} text="opt-in, at a metadata cost" />
    </Svg>
  );
}

// 6 · Page index finer. The surviving row group opens into its ten pages; one lights; its rows-read count lands; then the
// two metadata bars grow, the page index's four times longer.
export function RevealPageIndexFiner({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.9, 1.3));
  return (
    <Svg label="Parquet's page index, once turned on, prunes to 2,500 rows — finer than ORC's fixed default." h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the surviving row group: 10 pages
      </T>
      <Strip x0={25} x1={575} y={52} n={10} hit={0} h={a} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="rows read" value="2,500" valueColor={C.focus} k={easeOut(seg(t, 1.3, 1.7))} />
      <T x={25} y={138} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        ORC row index: 200 bytes
      </T>
      <rect x={25} y={146} width={110 * easeOut(seg(t, 2.1, 2.6))} height={12} rx={2} fill={C.crema} opacity={0.6} />
      <T x={25} y={180} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        page index: 800 bytes
      </T>
      <rect x={25} y={188} width={440 * easeOut(seg(t, 2.5, 3.2))} height={12} rx={2} fill={C.cherryText} opacity={0.8} />
      <T x={575} y={228} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        4× the metadata for the precision
      </T>
    </Svg>
  );
}

const ALL3: [string, string, number, string, number, string][] = [
  ['ORC', '10,000', 10000, '200 B', 200, C.crema],
  ['row groups', '25,000', 25000, '80 B', 80, C.cherryText],
  ['page index', '2,500', 2500, '800 B', 800, C.focus],
];

// 7 · All three. For each layout, its rows-read bar and its index-bytes bar grow in turn, figures above each.
export function RevealMeasuredSynthesis({ t }: StepCtx) {
  return (
    <Svg label="rows read and index bytes, measured, all three ways." h={225}>
      <T x={170} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        rows read
      </T>
      <T x={390} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        index bytes
      </T>
      {ALL3.map(([l, r, rv, b, bv, f], i) => {
        const k = easeOut(seg(t, 0.4 + i * 1.0, 1.0 + i * 1.0));
        const y = 72 + i * 52;
        return (
          <g key={l} opacity={easeOut(seg(t, 0.3 + i * 1.0, 0.6 + i * 1.0))}>
            <T x={25} y={y + 12} s={13} f={C.crema}>
              {l}
            </T>
            <T x={170} y={y} s={12} f={f}>
              {r}
            </T>
            <rect x={170} y={y + 6} width={(rv / 25000) * 180 * k} height={12} rx={2} fill={f} opacity={0.75} />
            <T x={390} y={y} s={12} f={f}>
              {b}
            </T>
            <rect x={390} y={y + 6} width={(bv / 800) * 180 * k} height={12} rx={2} fill={f} opacity={0.75} />
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · ACID history. A timeline: before Hive 0.13, atomic per partition; at 0.13, row-level ACID for any format with a
// row id; the integration lands for ORC alone, and ORC becomes the default.
export function RevealAcidHistory({ t }: StepCtx) {
  const ln = easeInOut(seg(t, 0.3, 1.6));
  const o = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="Hive's own zero-point-thirteen release added row-level ACID transactions — but only ORC got the integration work." h={235}>
      <line x1={25} y1={70} x2={lerp(25, 575, ln)} y2={70} stroke={C.mocha} strokeWidth={2} />
      <circle cx={110} cy={70} r={6} fill={C.latte} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={50} s={12} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        before Hive 0.13
      </T>
      <T x={25} y={98} s={12} f={C.latte} o={easeOut(seg(t, 0.7, 1.0))}>
        atomic per partition
      </T>
      <circle cx={360} cy={70} r={7} fill={C.focus} opacity={easeOut(seg(t, 1.3, 1.6))} />
      <T x={320} y={50} s={12} f={C.focus} o={easeOut(seg(t, 1.3, 1.6))}>
        Hive 0.13
      </T>
      <T x={320} y={98} s={12} f={C.crema} o={easeOut(seg(t, 1.5, 1.8))}>
        row-level ACID, any row id
      </T>
      <path d={`M360 108 L${lerp(360, 200, o)} ${lerp(108, 140, o)}`} stroke={C.focus} strokeWidth={1.5} fill="none" opacity={o > 0 ? 1 : 0} />
      <path d={`M360 108 L${lerp(360, 470, o)} ${lerp(108, 140, o)}`} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" fill="none" opacity={o > 0 ? 1 : 0} />
      <Cell x={120} y={140} w={160} label="ORC" stroke={C.focus} f={C.focus} o={o} />
      <MiniTick x={290} y={154} k={easeOut(seg(t, 2.8, 3.1))} />
      <g opacity={o}>
        <rect x={380} y={140} width={180} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" />
        <T x={470} y={158.5} s={12} f={C.latte} a="middle">
          other formats
        </T>
      </g>
      <T x={470} y={192} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>
        never integrated
      </T>
      <T x={300} y={225} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        so ORC became Hive's default
      </T>
    </Svg>
  );
}

// 9 · Why Parquet won. Parquet's card links out to any framework and to the table formats ahead; ORC's card links to the
// places it still lives.
export function RevealWhyParquetWon({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.0));
  const b = easeOut(seg(t, 1.6, 2.0));
  const c = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="Parquet was built to be used by any framework — and the lakehouse table formats chose it first." h={235}>
      <Cell x={25} y={66} w={180} label="Parquet" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={205} y1={80} x2={lerp(205, 290, a)} y2={lerp(80, 59, a)} stroke={C.focus} strokeWidth={1.5} opacity={a > 0 ? 1 : 0} />
      <Cell x={290} y={45} w={285} label="any framework, none favored" o={a} />
      <line x1={205} y1={80} x2={lerp(205, 290, b)} y2={lerp(80, 101, b)} stroke={C.focus} strokeWidth={1.5} opacity={b > 0 ? 1 : 0} />
      <Cell x={290} y={87} w={285} label="the table formats ahead" o={b} stroke={C.focus} />
      <Cell x={25} y={160} w={180} label="ORC" o={easeOut(seg(t, 2.5, 2.8))} />
      <line x1={205} y1={174} x2={lerp(205, 290, c)} y2={lerp(174, 153, c)} stroke={C.mocha} strokeWidth={1.5} opacity={c > 0 ? 1 : 0} />
      <Cell x={290} y={139} w={285} label="legacy Hive tables" o={c} />
      <Cell x={290} y={181} w={285} label="some Trino estates" o={easeOut(seg(t, 3.1, 3.5))} />
      <T x={300} y={228} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
        built to belong to everyone
      </T>
    </Svg>
  );
}

// 10 · Recap. Three rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ORC's fixed index beats a bare row-group default; Parquet's own opt-in index beats ORC's fixed one; the ecosystem picked Parquet anyway." h={210}>
      <Row y={45} label="ORC's fixed index" value="beats bare row groups" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={100} label="Parquet page index" value="beats ORC, opt-in" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={155} label="the ecosystem" value="picked Parquet" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
