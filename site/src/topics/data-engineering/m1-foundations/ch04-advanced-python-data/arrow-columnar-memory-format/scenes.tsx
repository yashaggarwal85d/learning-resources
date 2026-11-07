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

/** A row of small value cells starting at `x`, each fading in on its own beat after `t0`. */
function Cells({
  x,
  y,
  w = 34,
  gap = 6,
  vals,
  t,
  t0,
  dt = 0.12,
  stroke = C.mocha,
  f = C.crema,
  dim = [] as number[],
}: {
  x: number;
  y: number;
  w?: number;
  gap?: number;
  vals: string[];
  t: number;
  t0: number;
  dt?: number;
  stroke?: string;
  f?: string;
  dim?: number[];
}) {
  return (
    <g>
      {vals.map((v, i) => (
        <Cell key={i} x={x + i * (w + gap)} y={y} w={w} label={v} o={easeOut(seg(t, t0 + i * dt, t0 + i * dt + 0.3)) * (dim.includes(i) ? 0.4 : 1)} stroke={stroke} f={f} />
      ))}
    </g>
  );
}

// 1 · Hook. A strip of raw bytes in the middle; two different engines on either side reach for it, and the question between
// them stays open.
export function Hook({ t }: StepCtx) {
  const l = easeOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="a native engine win and a handoff win, neither one asking how the bytes agree at all" h={220}>
      <Row y={40} label="two engines, one set of bytes" value="agree how?" k={easeOut(seg(t, 0.3, 0.8))} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={175 + i * 25} y={90} width={20} height={20} rx={2} fill={C.mocha} opacity={easeOut(seg(t, 0.4 + i * 0.06, 0.7 + i * 0.06))} />
      ))}
      <Cell x={25} y={150} w={120} label="engine A" o={easeOut(seg(t, 0.9, 1.2))} />
      <Cell x={455} y={150} w={120} label="engine B" o={easeOut(seg(t, 1.1, 1.4))} />
      <path d={`M85 150 L${lerp(85, 175, l)} ${lerp(150, 112, l)}`} stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" fill="none" opacity={l > 0 ? 1 : 0} />
      <path d={`M515 150 L${lerp(515, 425, l)} ${lerp(150, 112, l)}`} stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" fill="none" opacity={l > 0 ? 1 : 0} />
      <T x={300} y={170} s={22} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.1))}>
        ?
      </T>
    </Svg>
  );
}

// 2 · An array is buffers. The real array [1, 2, null, 4] splits into its two regions: a validity bitmap with one bit per
// value, and a data buffer whose null slot holds nothing meaningful.
export function RevealArrayIsBuffers({ t }: StepCtx) {
  return (
    <Svg label="a real array, shown as its own separate buffers — a bitmap and a data buffer, not one blob" h={220}>
      <Row y={40} label="[1, 2, null, 4]" value="two buffers" k={easeOut(seg(t, 0.3, 0.8))} />
      <T x={25} y={100} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        validity bitmap
      </T>
      <Cells x={200} y={82} vals={['1', '1', '0', '1']} t={t} t0={1.2} f={C.second} stroke={C.second} />
      <T x={25} y={160} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        data buffer
      </T>
      <Cells x={200} y={142} vals={['1', '2', '–', '4']} t={t} t0={2.2} dim={[2]} />
      <T x={575} y={100} s={11} f={C.second} a="end" o={easeOut(seg(t, 1.8, 2.1))}>
        0 = missing
      </T>
      <Row y={205} label="each region" value="addressed on its own" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 3 · Predict: a bitmap for no nulls? The array [1, 2, 3, 4] with its data buffer, and an empty dashed slot where a bitmap
// would go; then the question.
export function PredictZeroNullBitmap({ t, answer }: StepCtx) {
  return (
    <Svg label="zero nulls — is a bitmap buffer still allocated anyway, or skipped entirely?" h={210}>
      <Row y={40} label="[1, 2, 3, 4], no nulls" value="bitmap?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={62} width={154} height={28} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.3, 0.6))} />
      <Cells x={330} y={62} vals={['1', '2', '3', '4']} t={t} t0={0.3} dt={0.08} />
      <AnswerRow y={140} label="allocated anyway" answer={answer} value="no, skipped" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="no nulls, so no bitmap buffer at all" />
    </Svg>
  );
}

// 4 · Chunked arrays. Three record batches land where they are written; then one column draws a pointer down to each one in
// place, and nothing moves.
export function RevealChunkedArray({ t }: StepCtx) {
  const p = (i: number) => easeOut(seg(t, 2.0 + i * 0.3, 2.5 + i * 0.3));
  const xs = [25, 225, 425];
  return (
    <Svg label="several batches, one logical column — no copy, just a list of where each one already lives" h={240}>
      <Row y={40} label="3 batches, 8 rows" value="one column, 3 chunks" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={150} y={68} w={300} label="column x: chunk list" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))} />
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8'],
      ].map((b, i) => (
        <g key={i}>
          <Cells x={xs[i]} y={150} w={40} vals={b} t={t} t0={0.5 + i * 0.4} dt={0.06} />
          <path d={`M${200 + i * 100} 96 L${xs[i] + 20} 146`} stroke={C.focus} strokeWidth={1.5} strokeDasharray="80" strokeDashoffset={80 * (1 - p(i))} fill="none" />
        </g>
      ))}
      <Row y={220} label="rows copied" value="none" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 5 · Dictionary encoding. The repeating strings turn into small indices, one per row, pointing into a dictionary of the
// three distinct values.
export function RevealDictionaryEncoding({ t }: StepCtx) {
  const v = ['foo', 'bar', 'baz', 'foo', 'bar', 'baz'];
  const k = easeOut(seg(t, 1.4, 2.0));
  return (
    <Svg label="repeated values become small integer indices — a real measured size reduction" h={230}>
      <Row y={40} label="3,000 strings" value="3 distinct" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cells x={25} y={62} w={50} vals={v} t={t} t0={0.5} dt={0.08} />
      <Cells x={25} y={112} w={50} vals={['0', '1', '2', '0', '1', '2']} t={t} t0={1.4} dt={0.08} f={C.focus} stroke={C.focus} />
      <T x={25} y={162} s={11} f={C.latte} o={k}>
        indices
      </T>
      <T x={425} y={78} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        dictionary
      </T>
      <Cells x={425} y={88} w={42} gap={4} vals={['foo', 'bar', 'baz']} t={t} t0={2.1} />
      <Row y={210} label="dictionary bytes" value="fewer than plain" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 6 · Run-end encoding. Top: 1,000 ones, then twos, then threes; run-end keeps only three ends. Bottom: values that alternate;
// every value becomes its own run, and run-end comes out bigger than the plain array.
export function RevealRunEndEncoding({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 1.2));
  const b = easeInOut(seg(t, 2.2, 2.9));
  return (
    <Svg label="real runs compress far harder than dictionary encoding — but values that only alternate defeat it" h={260}>
      {[C.crema, C.second, C.focus].map((c, i) => (
        <rect key={i} x={25 + i * 180} y={30} width={180 * clamp(a * 3 - i)} height={12} fill={c} opacity={0.7} />
      ))}
      {['1,000', '2,000', '3,000'].map((e, i) => (
        <T key={e} x={200 + i * 180} y={62} s={12} f={C.focus} a="end" o={easeOut(seg(t, 1.2 + i * 0.15, 1.5 + i * 0.15))}>
          {e}
        </T>
      ))}
      <Row y={100} label="sorted runs, run-end" value="beats dictionary" valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.1))} />
      {Array.from({ length: 36 }, (_, i) => (
        <rect key={i} x={25 + i * 15} y={140} width={15} height={12} fill={i % 2 ? C.second : C.crema} opacity={0.7 * clamp(b * 36 - i)} />
      ))}
      {Array.from({ length: 36 }, (_, i) => (
        <line key={i} x1={40 + i * 15} y1={156} x2={40 + i * 15} y2={166} stroke={C.cherryText} strokeWidth={1.5} opacity={easeOut(seg(t, 2.9 + i * 0.01, 3.1 + i * 0.01))} />
      ))}
      <T x={25} y={186} s={11} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>
        a run ends at every value
      </T>
      <Row y={235} label="alternating, run-end" value="bigger than plain" valueColor={C.cherryText} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 7 · The string view. "short" sits whole inside its own view slot. The long string's slot holds its first four bytes and a
// pointer, and the rest lives in a separate buffer.
export function RevealStringView({ t }: StepCtx) {
  const p = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="short strings inlined directly; long strings keep only a prefix plus where the rest lives" h={230}>
      <Row y={40} label="up to 12 bytes" value="inlined in the view" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={25} y={62} w={200} label='"short"' stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.6, 1.0))} />
      <Cell x={25} y={112} w={90} label='"a so"' stroke={C.second} f={C.second} o={easeOut(seg(t, 1.4, 1.8))} />
      <Cell x={125} y={112} w={100} label="→ buffer" o={easeOut(seg(t, 1.6, 2.0))} />
      <path d={`M225 126 H${225 + 70 * p}`} stroke={C.latte} strokeWidth={1.5} />
      <Cell x={300} y={112} w={275} label="a somewhat longer string…" o={p} />
      <T x={25} y={162} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        prefix
      </T>
      <Row y={205} label="longer strings" value="prefix + pointer" valueColor={C.second} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 8 · Nested types. The real list array [[1,2,3],[4,5],null,[6]]: its validity bits, its offsets 0 3 5 5 6, and brackets from
// each pair of offsets down to the child values they span.
export function RevealNestedTypes({ t }: StepCtx) {
  const spans: [number, number][] = [
    [0, 3],
    [3, 5],
    [5, 6],
  ];
  return (
    <Svg label="a list's own buffers are exactly a bitmap and offsets — nesting needs no new buffer kind" h={230}>
      <T x={25} y={46} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        validity
      </T>
      <Cells x={140} y={28} vals={['1', '1', '0', '1']} t={t} t0={0.4} f={C.second} stroke={C.second} />
      <T x={25} y={96} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        offsets
      </T>
      <Cells x={140} y={78} vals={['0', '3', '5', '5', '6']} t={t} t0={1.1} f={C.focus} stroke={C.focus} />
      <T x={25} y={176} s={12} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        child values
      </T>
      <Cells x={140} y={158} vals={['1', '2', '3', '4', '5', '6']} t={t} t0={2.0} dt={0.08} />
      {spans.map(([a, b], i) => {
        const k = easeOut(seg(t, 2.7 + i * 0.25, 3.1 + i * 0.25));
        return <path key={i} d={`M${142 + a * 40} 148 v-6 H${138 + b * 40} v6`} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={k} />;
      })}
      <Row y={215} label="nesting" value="nothing new" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 9 · Compute kernels. The same sum of 2,000,000 values: the kernel's single pass finishes in a short bar; the loop's bar
// keeps going, building one boxed object per value as it crawls.
export function RevealComputeKernel({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 1.4));
  const b = easeInOut(seg(t, 0.8, 3.0));
  return (
    <Svg label="the identical sum, vectorized kernel versus a python loop — a real measured gap" h={230}>
      <Row y={40} label="sum of 2,000,000" value="same answer both ways" k={easeOut(seg(t, 0.3, 0.8))} />
      <T x={25} y={90} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        kernel
      </T>
      <rect x={140} y={80} width={70 * a} height={14} rx={2} fill={C.focus} opacity={0.85} />
      <T x={25} y={130} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        Python loop
      </T>
      <rect x={140} y={120} width={420 * b} height={14} rx={2} fill={C.cherryText} opacity={0.7} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={142 + i * 30} y={142} width={22} height={10} rx={2} fill="none" stroke={C.latte} strokeWidth={1} opacity={clamp(b * 14 - i)} />
      ))}
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        an object each
      </T>
      <Row y={205} label="kernel vs loop" value="at least 5× faster" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 10 · The interchange layer. One in-memory table; the same bytes go to Polars and to DuckDB untouched, and each one's sum of x
// comes back as the identical number.
export function RevealInterchangeLayer({ t }: StepCtx) {
  const l = easeOut(seg(t, 1.0, 1.7));
  const r = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="one table, handed to two different engines directly — no conversion step, same answer from both" h={240}>
      <Row y={40} label="one table, 100,000 rows" value="no conversion" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={225} y={64} w={150} label="Arrow table" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.6, 1.0))} />
      <path d={`M260 92 L${lerp(260, 110, l)} ${lerp(92, 126, l)}`} stroke={C.focus} strokeWidth={1.5} fill="none" opacity={l > 0 ? 1 : 0} />
      <path d={`M340 92 L${lerp(340, 490, l)} ${lerp(92, 126, l)}`} stroke={C.focus} strokeWidth={1.5} fill="none" opacity={l > 0 ? 1 : 0} />
      <Cell x={25} y={126} w={170} label="Polars" o={l} />
      <Cell x={405} y={126} w={170} label="DuckDB" o={l} />
      <T x={110} y={180} s={13} f={C.crema} a="middle" o={r}>
        4,999,950,000
      </T>
      <T x={490} y={180} s={13} f={C.crema} a="middle" o={r}>
        4,999,950,000
      </T>
      <Row y={220} label="sum of x, both engines" value="identical" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 11 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="buffers not a blob, chunks not copies, two specialists, one view layout, one shared table" h={250}>
      <Row y={35} label="an array" value="buffers, not a blob" k={easeOut(seg(t, 0.5, 1.0))} />
      <Row y={80} label="batches" value="chunked, not copied" k={easeOut(seg(t, 1.2, 1.7))} />
      <Row y={125} label="repeats or runs" value="dictionary or run-end" valueColor={C.focus} k={easeOut(seg(t, 1.9, 2.4))} />
      <Row y={170} label="a string" value="inline or prefix" k={easeOut(seg(t, 2.6, 3.1))} />
      <Row y={215} label="the same bytes" value="kernel and two engines" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 12 · Prove: which layout fits which column? Three columns in three cells; after the answer each takes its own layout beneath
// it, and run-end on the codes is crossed out.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (i: number) => (answer !== null ? easeOut(seg(s, 0.1 + i * 0.25, 0.5 + i * 0.25)) : 0);
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="country codes, sorted timestamps, free text — which layout fits each, and what breaks if you guess wrong?" h={240}>
      <Row y={40} label="codes, runs, free text" value="which layout?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="run-end for all three" answer={answer} value="no, one each" k={easeOut(seg(t, 0.4, 0.9))} />
      {['country codes', 'sorted times', 'free text'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={110} w={170} label={l} o={easeOut(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15))} />
      ))}
      {['dictionary', 'run-end', 'string view'].map((l, i) => (
        <T key={l} x={110 + i * 190} y={lerp(168, 160, k(i))} s={12} f={C.focus} a="middle" o={k(i)}>
          {l}
        </T>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(208, 200, v)} s={15} f={C.focus} a="middle" o={v}>
            each layout earns its own column
          </T>
          <rect x={150} y={212} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
