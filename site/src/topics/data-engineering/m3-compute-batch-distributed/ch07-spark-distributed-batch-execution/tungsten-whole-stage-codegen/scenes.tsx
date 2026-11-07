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

/** Three plan operators as a column of nodes; `mark` (0..1) draws the shared "*(1)" marker in front of each, `fuse` draws one box
 * around all three. */
function Ops({ t, mark, fuse, x = 60, y = 20, names = ['Project', 'Filter', 'Range'] }: { t: number; mark: number; fuse: number; x?: number; y?: number; names?: string[] }) {
  return (
    <g>
      {names.map((n, i) => (
        <g key={n}>
          <Cell x={x + 50} y={y + i * 40} w={150} h={28} label={n} o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))} />
          <T x={x + 40} y={y + 19 + i * 40} s={12} f={C.focus} a="end" o={mark}>
            *(1)
          </T>
        </g>
      ))}
      <rect x={x - 8} y={y - 8} width={226} height={names.length * 40 + 4} rx={6} fill="none" stroke={C.focus} strokeWidth={1.8} strokeDasharray={`${700 * fuse} 700`} />
    </g>
  );
}

// 1 · Hook. Three operators; a row ball bounces between them one virtual call at a time; or does something else take over?
export function Hook({ t }: StepCtx) {
  const b = seg(t, 1.0, 3.4);
  const ph = (b * 6) % 2;
  const yy = 34 + (ph < 1 ? ph : 2 - ph) * 80;
  return (
    <Svg label="Catalyst chose three operators. Does each one run as its own virtual call per row, or something else entirely?" h={200}>
      <Ops t={t} mark={0} fuse={0} />
      <circle cx={320} cy={yy} r={6} fill={C.second} opacity={b > 0 && b < 1 ? 1 : 0} />
      <T x={340} y={60} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        a call per row, per operator?
      </T>
      <T x={340} y={110} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        or something else?
      </T>
    </Svg>
  );
}

// 2 · Fusion, measured. The same marker, *(1), lands in front of all three; one box closes around them; the report says one subtree.
export function RevealFusion({ t }: StepCtx) {
  return (
    <Svg label="measured: Range, Filter, and Project all carry the same stage marker, star one. One generated method covers all three." h={200}>
      <Ops t={t + 1} mark={easeOut(seg(t, 0.6, 1.2))} fuse={easeInOut(seg(t, 1.4, 2.4))} />
      <T x={340} y={60} s={12} f={C.focus} o={easeOut(seg(t, 2.4, 2.8))}>
        one generated method
      </T>
      <T x={340} y={100} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        codegen report:
      </T>
      <T x={340} y={124} s={11} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        1 WholeStageCodegen subtree
      </T>
    </Svg>
  );
}

// 3 · Predict. A row inside the fused method: an object with fields, or something else?
export function PredictRowShape({ t, answer }: StepCtx) {
  return (
    <Svg label="that generated method still has to hold a row somehow. Does it build an ordinary JVM object per row, or something else?" h={200}>
      <rect x={25} y={20} width={226} height={70} rx={6} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={40} y={44} s={11} f={C.focus} o={easeOut(seg(t, 0.1, 0.4))}>
        the fused method
      </T>
      <rect x={40} y={56} width={90} height={22} rx={3} fill="none" stroke={C.second} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 1.0))} />
      <T x={150} y={72} s={11} f={C.second} o={easeOut(seg(t, 0.8, 1.2))}>
        a row: as what?
      </T>
      <AnswerRow y={130} label="per row, an object?" answer={answer} value="no: raw bytes" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="skipping the object is the point" />
    </Svg>
  );
}

// 4 · UnsafeRow. The generated source line "UnsafeRowWriter" writes fields straight into a strip of byte cells: no object box.
export function RevealUnsafeRow({ t }: StepCtx) {
  const w = Math.floor(seg(t, 1.2, 3.0) * 16);
  return (
    <Svg label="measured: the generated source writes every row through UnsafeRowWriter, into UnsafeRow — raw bytes, not a JVM object." h={200}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        generated source: UnsafeRowWriter
      </T>
      <T x={25} y={70} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        UnsafeRow
      </T>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={110 + i * 28} y={54} width={24} height={24} rx={1} fill={C.cocoa} stroke={i < w ? C.focus : C.mocha} strokeWidth={i < w ? 1.8 : 1} opacity={easeOut(seg(t, 0.8, 1.2))} />
      ))}
      <path d={`M${110 + Math.min(w, 15) * 28 + 12} 48 l-5 -8 h10 z`} fill={C.focus} opacity={w > 0 && w < 16 ? 1 : 0} />
      <T x={25} y={130} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        raw bytes, laid out by hand
      </T>
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        never an object with getters and setters
      </T>
    </Svg>
  );
}

// 5 · Predict. A vectorised Parquet scan under the fused box: inside it, with a marker, or apart?
export function PredictParquetReader({ t, answer }: StepCtx) {
  return (
    <Svg label="the vectorised Parquet reader feeds the same fused pipeline. Does it carry the same codegen marker too?" h={200}>
      <Ops t={t + 1} mark={1} fuse={1} names={['Project', 'Filter']} y={16} />
      <Cell x={110} y={110} w={150} h={28} label="Parquet scan" stroke={C.second} o={easeOut(seg(t, 0.4, 0.8))} />
      <T x={100} y={129} s={12} f={C.second} a="end" o={easeOut(seg(t, 1.0, 1.4))}>
        ?
      </T>
      <AnswerRow y={176} label="the scan's marker" answer={answer} value="none: it sits apart" k={easeOut(seg(t, 1.6, 2.1))} />
    </Svg>
  );
}

// 6 · The columnar exception. The scan reads whole column batches (Batched: true, no marker); a ColumnarToRow node bridges into the
// fused box and carries its own *(1).
export function RevealColumnarException({ t }: StepCtx) {
  const b = seg(t, 1.0, 3.0);
  return (
    <Svg label="measured: the Parquet scan reports batched true and carries no marker at all. A separate ColumnarToRow node bridges it in." h={200}>
      <rect x={52} y={8} width={226} height={124} rx={6} fill="none" stroke={C.focus} strokeWidth={1.8} />
      {['Project', 'Filter', 'ColumnarToRow'].map((n, i) => (
        <g key={n}>
          <Cell x={110} y={16 + i * 38} w={150} h={28} label={n} stroke={i === 2 ? C.focus : C.mocha} o={i === 2 ? easeOut(seg(t, 0.6, 1.0)) : 1} />
          <T x={100} y={35 + i * 38} s={12} f={C.focus} a="end" o={i === 2 ? easeOut(seg(t, 0.8, 1.2)) : 1}>
            *(1)
          </T>
        </g>
      ))}
      <Cell x={110} y={156} w={150} h={28} label="Parquet scan" stroke={C.second} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={300 + i * 30} y={lerp(176, 108, (b * 2 + i * 0.3) % 1)} width={22} height={12} fill={C.second} opacity={b > 0 && b < 1 ? 0.9 : 0} />
      ))}
      <T x={400} y={130} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        Batched: true
      </T>
      <T x={400} y={154} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        no marker
      </T>
      <T x={300} y={40} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        the bridge into rows
      </T>
    </Svg>
  );
}

// 7 · Predict. The field-limit knob drops to zero; every stage is over it. Fewer markers, or none?
export function PredictForceFallback({ t, answer }: StepCtx) {
  const lim = easeInOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="shrink the field limit to zero, forcing every stage over the cap. Does the plan show fewer stage markers, or none at all?" h={200}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        codegen field limit
      </T>
      <rect x={200} y={18} width={300} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      <rect x={200} y={20} width={296 * (1 - lim)} height={10} fill={C.second} />
      <T x={510} y={30} s={12} f={C.second} o={lim > 0.95 ? 1 : 0}>
        0
      </T>
      <T x={25} y={80} s={11} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.6))}>
        every stage now over the cap
      </T>
      <AnswerRow y={130} label="markers left" answer={answer} value="none at all" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="a whole subtree falls back at once" />
    </Svg>
  );
}

// 8 · The fallback. Every *(1) fades out, the fusion box unwinds, and the report reads 0 subtrees.
export function RevealFallback({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.6, 1.8));
  return (
    <Svg label="measured: with the limit at zero, every marker disappears. debug.codegen() itself reports zero subtrees, not a smaller number." h={200}>
      <Ops t={t + 1} mark={1 - g} fuse={1 - g} />
      <T x={340} y={60} s={12} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>
        every marker gone
      </T>
      <T x={340} y={100} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        debug.codegen():
      </T>
      <T x={340} y={124} s={11} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        0 WholeStageCodegen subtrees
      </T>
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const r: [string, string, string][] = [
    ['fusion', 'one method, one marker', C.focus],
    ['a row', 'UnsafeRow bytes', C.crema],
    ['columnar scan', 'outside, bridged in', C.second],
    ['a failure', 'a whole stage, visibly', C.cherryText],
  ];
  return (
    <Svg label="fusion into one generated method, UnsafeRow instead of objects, a columnar exception, and a silent fallback you can see directly." h={250}>
      {r.map(([a, b, f], i) => (
        <Row key={a} y={35 + i * 55} label={a} value={b} valueColor={f} k={easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7))} />
      ))}
    </Svg>
  );
}
