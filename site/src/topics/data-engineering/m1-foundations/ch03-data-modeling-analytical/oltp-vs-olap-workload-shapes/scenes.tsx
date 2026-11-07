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

// 1 · Opening. One table as a grid of rows; the lookup lights one row, the sum lights one column.
export function Opening({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.2, 0.7));
  const r = easeOut(seg(t, 1.1, 1.5));
  const c = easeOut(seg(t, 1.5, 1.9));
  return (
    <Svg label="one table, two different questions" h={230}>
      <Row y={40} label="orders table" value="2.4 million rows" k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={85} label="this refresher" value="one lookup, one sum" k={easeOut(seg(t, 0.9, 1.4))} />
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => {
          const hitR = row === 2;
          const hitC = col === 3;
          const fill = hitR && r > 0 ? C.focus : hitC && c > 0 ? C.second : C.cocoa;
          return (
            <rect
              key={`${row}-${col}`}
              x={25 + col * 92}
              y={115 + row * 17}
              width={88}
              height={13}
              rx={2}
              fill={fill}
              stroke={C.mocha}
              opacity={g * (hitR ? 0.5 + 0.5 * r : hitC ? 0.5 + 0.5 * c : 0.6)}
            />
          );
        }),
      )}
    </Svg>
  );
}

// 2 · OLTP. The point lookup lands as a sliver at ~7 buffers; the full table's ~46,484 grows in beside it for scale.
export function RevealOltp({ t }: StepCtx) {
  return (
    <Svg label="a point lookup, through the existing index" h={370}>
      {timeBar(30, 90, 7 / 46484, '~7 buffers', 'point lookup by id', C.focus, easeOut(seg(t, 0.6, 1.3)))}
      {timeBar(30, 210, 46484 / 46484, '~46,484 buffers', 'full table scan', C.cocoa, easeOut(seg(t, 2.0, 3.2)))}
    </Svg>
  );
}

// 3 · OLAP. The same table summed: the index can't help, so the scan walks the whole table, bar crawling across.
export function RevealOlap({ t }: StepCtx) {
  return (
    <Svg label="the same table, summed across every row" h={370}>
      {timeBar(30, 90, 7 / 46484, '~7 buffers', 'point lookup by id', C.cocoa, easeOut(seg(t, 0.1, 0.5)))}
      {timeBar(30, 210, 46484 / 46484, '~46,484 buffers', 'sum across all rows', C.cherryText, seg(t, 1.0, 3.4))}
    </Svg>
  );
}

/** One row's six columns, sized by their average width in bytes: order_id, status, event_time, amount, tags, channel. */
const WIDTHS = [8, 8, 4, 6, 18, 4];
const AMOUNT = 3;
function RowBytes({ y, h, read, k }: { y: number; h: number; read: number; k: number }) {
  let x = 25;
  return (
    <g opacity={k}>
      {WIDTHS.map((w, i) => {
        const ww = (550 * w) / 48;
        const x0 = x;
        x += ww;
        const on = read * 6 > i;
        return (
          <rect
            key={i}
            x={x0}
            y={y}
            width={ww - 2}
            height={h}
            rx={2}
            fill={on ? (i === AMOUNT ? C.focus : C.cherryText) : C.cocoa}
            opacity={on ? (i === AMOUNT ? 1 : 0.7) : 1}
            stroke={i === AMOUNT ? C.focus : C.mocha}
          />
        );
      })}
    </g>
  );
}

// 4 · Predict: skip the other five? One row's six columns, the one the sum needs outlined; then the question.
export function PredictColumnSkip({ t, answer }: StepCtx) {
  return (
    <Svg label="one column needed out of six" h={210}>
      <Row y={40} label="columns the sum needs" value="one of six" k={easeOut(seg(t, 0.1, 0.6))} />
      <RowBytes y={66} h={28} read={0} k={easeOut(seg(t, 0.4, 0.9))} />
      <AnswerRow y={140} label="bytes actually read" answer={answer} value="every byte" f={C.cherryText} k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="a row's columns sit together in one block" f={C.cherryText} />
    </Svg>
  );
}

// 5 · Row storage reads it all. Row after row, all six columns are read; the one that was needed is 6 of 48 bytes.
export function RevealRowReadsWhole({ t }: StepCtx) {
  const n = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="every column of every row gets read anyway" h={270}>
      <Row y={40} label="columns needed" value="one of six" k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={85} label="columns actually read" value="all six, every row" valueColor={C.cherryText} k={easeOut(seg(t, 1.0, 1.5))} />
      {[0, 1, 2].map((r) => (
        <RowBytes key={r} y={115 + r * 34} h={24} read={seg(t, 0.5 + r * 0.5, 1.1 + r * 0.5)} k={easeOut(seg(t, 0.2 + r * 0.1, 0.5 + r * 0.1))} />
      ))}
      <T x={300} y={lerp(250, 242, n)} s={15} f={C.focus} a="middle" o={n}>
        amount: 6 of 48 bytes, about an eighth
      </T>
    </Svg>
  );
}

// 6 · Columnar flips it. A hundred columns stored apart; five light up, the rest fade: about five percent read.
const NEEDED = [7, 23, 41, 66, 88];
export function RevealColumnarFlips({ t }: StepCtx) {
  const pick = easeOut(seg(t, 1.4, 2.2));
  const fade = easeInOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="columnar storage reads only what a query needs" h={210}>
      <Row y={40} label="columns needed" value="five of a hundred" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={85} label="table data read" value="about five percent" valueColor={C.second} k={easeOut(seg(t, 2.4, 2.9))} />
      {Array.from({ length: 100 }, (_, i) => {
        const on = NEEDED.includes(i);
        const k = easeOut(seg(t, 0.3 + i * 0.008, 0.6 + i * 0.008));
        return <rect key={i} x={25 + i * 5.5} y={lerp(200, 112, k)} width={4} height={88 * k} rx={1} fill={on && pick > 0 ? C.second : C.mocha} opacity={on ? 1 : 1 - 0.75 * fade} />;
      })}
    </Svg>
  );
}

// 7 · The normalization pull. Writes land in four small tables independently; then one aggregate has to join all four.
const SMALL: [number, number][] = [
  [25, 115],
  [135, 115],
  [25, 170],
  [135, 170],
];
export function RevealNormalizationPressure({ t }: StepCtx) {
  const j = easeOut(seg(t, 2.6, 3.0));
  const lines = easeInOut(seg(t, 2.9, 3.8));
  return (
    <Svg label="normalization helps one workload, costs the other" h={230}>
      <Row y={40} label="many small tables" value="cheap, independent writes" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="same shape, aggregated" value="needs joins, costly" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      {SMALL.map(([x, y], i) => {
        const w = seg(t, 0.8 + i * 0.35, 1.2 + i * 0.35);
        return (
          <g key={i}>
            <rect x={x} y={y} width={95} height={40} rx={4} fill={C.cocoa} stroke={w >= 1 ? C.focus : C.mocha} opacity={easeOut(seg(t, 0.3, 0.7))} />
            {w > 0 && w < 1 && <circle cx={x + 47} cy={lerp(y - 14, y + 20, w * w)} r={5} fill={C.focus} />}
            <path d={`M${x + 95} ${y + 20} C 300 ${y + 20} 320 165 370 165`} fill="none" stroke={C.cherryText} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - lines} />
          </g>
        );
      })}
      <g opacity={j}>
        <rect x={370} y={145} width={205} height={40} rx={6} fill={C.cocoa} stroke={C.cherryText} strokeWidth={2} />
        <T x={472} y={170} s={14} f={C.cherryText} a="middle">
          3 JOINs, then SUM
        </T>
      </g>
    </Svg>
  );
}

// 8 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="point reads want rows, scans want columns" h={200}>
      <Row y={60} label="point reads" value="few, whole rows" k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={110} label="large scans" value="few, whole columns" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={160} label="one schema" value="rarely serves both" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
    </Svg>
  );
}
