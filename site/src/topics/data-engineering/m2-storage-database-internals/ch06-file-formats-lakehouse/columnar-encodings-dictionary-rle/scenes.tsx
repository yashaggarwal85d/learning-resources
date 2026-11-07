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

const ZONES = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const PX = 500 / 1600;

// 1 · Hook. Two columns' bars grow to their plain size, then shrink to their encoded size, each by a different trick.
export function Hook({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.3, 1.0));
  const z = easeInOut(seg(t, 1.3, 2.0));
  const s = easeInOut(seg(t, 2.2, 2.9));
  return (
    <Svg label="five encodings, five columns, 200 rows each." h={220}>
      <T x={25} y={45} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        zone codes, 200 rows
      </T>
      <rect x={25} y={55} width={lerp(400, 113, z) * PX * g} height={16} rx={2} fill={C.focus} opacity={0.85} />
      <T x={575} y={68} s={13} f={C.focus} a="end" o={easeOut(seg(t, 2.0, 2.3))}>
        400 → 113 bytes
      </T>
      <T x={25} y={110} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        shipment ids, 200 rows
      </T>
      <rect x={25} y={120} width={lerp(1600, 60, s) * PX * g} height={16} rx={2} fill={C.second} opacity={0.85} />
      <T x={575} y={133} s={13} f={C.second} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        1,600 → 60 bytes
      </T>
      <T x={300} y={195} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        two shrinks, two different tricks
      </T>
    </Svg>
  );
}

// 2 · Predict. The zone column's codes repeating down the rows; after the answer the first six light and the repeats dim.
export function PredictZoneColumn({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="zone only ever holds one of 6 warehouse codes, across 200 rows. Stored 200 times over?" h={200}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        200 rows, 6 codes repeating
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <Cell
          key={i}
          x={25 + (i % 6) * 92}
          y={52 + Math.floor(i / 6) * 34}
          w={80}
          label={ZONES[i % 6]}
          o={easeOut(seg(t, 0.2 + i * 0.06, 0.5 + i * 0.06)) * (i >= 6 ? 1 - 0.65 * v : 1)}
          stroke={i < 6 && v > 0 ? C.focus : C.mocha}
        />
      ))}
      <AnswerRow y={150} label="200 full copies?" answer={answer} value="no, 6 once" k={easeOut(seg(t, 1.1, 1.6))} />
      <Verdict answer={answer} y={190} text="a dictionary, then small indexes" />
    </Svg>
  );
}

// 3 · Dictionary + RLE. The six codes land once in the dictionary page; the index page's indexes pack together from
// loose to dense; the byte count lands.
export function RevealDictionaryRLE({ t }: StepCtx) {
  const pk = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="a dictionary page of 6 strings, then a data page of RLE/bit-packed indexes: 400 becomes 113." h={235}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        dictionary page
      </T>
      {ZONES.map((z, i) => (
        <Cell key={z} x={25 + (i % 3) * 85} y={52 + Math.floor(i / 3) * 34} w={75} label={z} stroke={C.second} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))} />
      ))}
      <T x={325} y={42} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        data page: packed indexes
      </T>
      <rect x={325} y={52} width={250} height={62} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.3))} />
      {Array.from({ length: 30 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 1.2 + i * 0.01, 1.5 + i * 0.01))}>
          {[0, 1, 2].map((b) => (
            <rect key={b} x={333 + i * lerp(16, 7.8, pk)} y={62 + b * 14} width={lerp(10, 6, pk)} height={11} rx={1} fill={(i * 5 + b) % 3 === 0 ? C.focus : C.latte} opacity={0.65} />
          ))}
        </g>
      ))}
      <Row y={170} label="the zone column" value="400 → 113 bytes" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
      <T x={300} y={220} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        the repeated text is mostly gone
      </T>
    </Svg>
  );
}

// 4 · Fallback. Distinct values pour into a dictionary meter; it passes the limit line and turns red; the dictionary is
// crossed and the column lands as PLAIN.
export function RevealFallback({ t }: StepCtx) {
  const f = easeInOut(seg(t, 0.4, 1.8));
  const w = 125 * f * 1.08;
  const over = w > 100;
  return (
    <Svg label="the real fallback: 200 distinct values past a 40-entry limit falls back to PLAIN." h={235}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        200 values, every one distinct
      </T>
      <rect x={25} y={55} width={500} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={27} y={57} width={w} height={18} rx={2} fill={over ? C.cherryText : C.latte} opacity={0.7} />
      <line x1={125} y1={48} x2={125} y2={84} stroke={C.crema} strokeWidth={2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={125} y={102} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        limit: 40 entries
      </T>
      <T x={25} y={135} s={13} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>
        a dictionary as big as the column
      </T>
      <Cross x={545} y={66} k={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={25} y={150} w={160} label="PLAIN" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))} />
      <T x={200} y={169} s={12} f={C.focus} o={easeOut(seg(t, 2.9, 3.3))}>
        falls straight back
      </T>
      <T x={300} y={220} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        as many entries as rows was never going to help
      </T>
    </Svg>
  );
}

// 5 · RLE scope. Its three allowed uses light; a general column is crossed; a page of equal-width values fills, one width
// for all.
export function RevealRLEScope({ t }: StepCtx) {
  return (
    <Svg label="RLE/bit-packing is scoped to levels, dictionary indices, and booleans — one bit width per page." h={230}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        RLE / bit-packing is only for
      </T>
      {['levels', 'dictionary indices', 'booleans'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={52} w={175} label={l} stroke={C.focus} o={easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35))} />
      ))}
      <g opacity={easeOut(seg(t, 1.5, 1.8))}>
        <rect x={25} y={96} width={250} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" />
        <T x={150} y={114.5} s={12} f={C.latte} a="middle">
          any other column
        </T>
      </g>
      <Cross x={295} y={110} k={easeOut(seg(t, 1.8, 2.1))} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={25 + i * 34} y={148} width={28} height={20} rx={2} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 2.3 + i * 0.05, 2.5 + i * 0.05))} />
      ))}
      <T x={25} y={200} s={13} f={C.second} o={easeOut(seg(t, 3.1, 3.5))}>
        one fixed bit width for the whole page
      </T>
    </Svg>
  );
}

// 6 · Predict. A slowly climbing staircase of id bars; after the answer only each bar's small step above the last glows.
export function PredictShipmentIds({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="200 near-sorted shipment ids, consecutive differences of 1 or 2. Which encoding wins?" h={200}>
      {Array.from({ length: 12 }, (_, i) => {
        const h = 36 + i * 2.5;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.07, 0.5 + i * 0.07))}>
            <rect x={25 + i * 46} y={114 - h} width={34} height={h - 6} rx={2} fill={C.latte} opacity={0.6 - 0.4 * v} />
            <rect x={25 + i * 46} y={114 - h - 6 + 6} width={34} height={6} rx={1} fill={v > 0 ? C.focus : C.latte} opacity={v > 0 ? 0.9 : 0.6} />
          </g>
        );
      })}
      <AnswerRow y={150} label="wider or narrower?" answer={answer} value="narrower: the gaps" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={190} text="store how little each value changed" />
    </Svg>
  );
}

const DELTAS = ['-2', '-2', '-2', '1', '1', '1', '1'];
const REL = ['0', '0', '0', '3', '3', '3', '3'];

// 7 · Delta binary packed. A block splits into miniblocks, each its own width; the spec's worked gaps land; the smallest
// gap is subtracted from each, leaving small non-negative values two bits wide; the real column's result lands.
export function RevealDeltaBinaryPacked({ t }: StepCtx) {
  const mw = [0.6, 0.35, 0.8, 0.5];
  const sub = easeInOut(seg(t, 2.3, 2.9));
  return (
    <Svg label="block size 128, 4 miniblocks, a frame-of-reference minimum subtracted per miniblock." h={250}>
      {mw.map((w, i) => (
        <rect
          key={i}
          x={25 + i * 138}
          y={lerp(70, 70 - 22 * w, easeOut(seg(t, 0.6 + i * 0.15, 1.0 + i * 0.15)))}
          width={130}
          height={lerp(0, 22 * w, easeOut(seg(t, 0.6 + i * 0.15, 1.0 + i * 0.15)))}
          rx={2}
          fill={C.second}
          opacity={0.6}
        />
      ))}
      <rect x={21} y={44} width={558} height={30} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={92} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        a block of miniblocks, each its own width
      </T>
      {DELTAS.map((d, i) => (
        <Cell key={i} x={25 + i * 50} y={106} w={44} h={24} label={d} o={easeOut(seg(t, 1.5 + i * 0.05, 1.8 + i * 0.05))} />
      ))}
      <T x={390} y={123} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        the spec's gaps
      </T>
      {REL.map((d, i) => (
        <Cell key={i} x={25 + i * 50} y={lerp(134, 144, sub)} w={44} h={24} label={d} stroke={C.focus} o={sub} />
      ))}
      <T x={390} y={161} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        minus the smallest, -2
      </T>
      <T x={390} y={185} s={12} f={C.focus} o={easeOut(seg(t, 3.1, 3.4))}>
        2 bits each
      </T>
      <Row y={232} label="shipment ids" value="1,600 → 60 bytes, 96%" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

const SPLIT = [
  ['AA', 'BB', 'CC', 'DD'],
  ['00', '11', '22', '33'],
  ['A3', 'B4', 'C5', 'D6'],
];

// 8 · Two bets. Left: the spec's four strings, each one's shared prefix with the one before lit. Right: three four-byte
// values, then their bytes regroup by position, the same twelve bytes rearranged.
export function RevealTwoBets({ t }: StepCtx) {
  const STR: [string, string, string][] = [
    ['0', '', 'axis'],
    ['2', 'ax', 'le'],
    ['0', '', 'babble'],
    ['3', 'bab', 'yhood'],
  ];
  return (
    <Svg label="DELTA_BYTE_ARRAY bets on shared prefixes; BYTE_STREAM_SPLIT bets on the compressor after it." h={235}>
      <T x={25} y={42} s={12} f={C.second} o={easeOut(seg(t, 0.1, 0.4))}>
        DELTA_BYTE_ARRAY
      </T>
      {STR.map(([n, p, sfx], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3 + i * 0.25, 0.6 + i * 0.25))}>
          <T x={25} y={70 + i * 26} s={12} f={C.latte}>
            {n}
          </T>
          <T x={60} y={70 + i * 26} s={14} f={C.crema}>
            <tspan fill={C.second}>{p}</tspan>
            {sfx}
          </T>
        </g>
      ))}
      <T x={200} y={42} s={12} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
        BYTE_STREAM_SPLIT
      </T>
      {SPLIT.map((row, v) =>
        row.map((b, j) => {
          const lit = t > 2.0 + j * 0.3 && t < 2.5 + j * 0.3;
          return <Cell key={`${v}-${j}`} x={200 + j * 42} y={52 + v * 26} w={38} h={22} label={b} stroke={lit ? C.focus : C.mocha} o={easeOut(seg(t, 1.5 + v * 0.15, 1.8 + v * 0.15))} />;
        }),
      )}
      {[0, 1, 2, 3].map((j) =>
        SPLIT.map((row, v) => {
          const k = easeOut(seg(t, 2.1 + j * 0.3, 2.4 + j * 0.3));
          return <Cell key={`t${v}-${j}`} x={200 + j * 89 + v * 27} y={lerp(140, 150, k)} w={24} h={22} label={row[j]} stroke={C.focus} o={k} />;
        }),
      )}
      <T x={25} y={195} s={12} f={C.second} o={easeOut(seg(t, 1.2, 1.5))}>
        bets on shared prefixes
      </T>
      <T x={320} y={195} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        bets on the compressor
      </T>
      <T x={320} y={220} s={12} f={C.latte} o={easeOut(seg(t, 3.3, 3.6))}>
        same bytes, regrouped
      </T>
    </Svg>
  );
}

// 9 · Encode, then compress. Two equal raw bars of 800 bytes; zlib shrinks each, the split one further; the gain lands.
export function RevealEncodeCompress({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.3, 1.0));
  const z = easeInOut(seg(t, 1.8, 2.8));
  const B: [string, number, string][] = [
    ['PLAIN', 307, C.crema],
    ['BYTE_STREAM_SPLIT', 234, C.focus],
  ];
  return (
    <Svg label="PLAIN and BYTE_STREAM_SPLIT are both 800 bytes raw; zlib shrinks the split version further." h={230}>
      {B.map(([l, c, f], i) => (
        <g key={l}>
          <T x={25} y={50 + i * 55} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
            {l}
          </T>
          <rect x={25} y={58 + i * 55} width={lerp(800, c, z) * 0.6 * g} height={16} rx={2} fill={f} opacity={0.75} />
          <T x={575} y={50 + i * 55} s={13} f={f} a="end" o={easeOut(seg(t, 2.8, 3.1))}>
            {`800 → ${c} bytes`}
          </T>
        </g>
      ))}
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        800 bytes each, raw; then zlib
      </T>
      <Row y={200} label="after zlib" value="24% smaller" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.7))} />
    </Svg>
  );
}

// 10 · Recap. One row per bet, then the fallback every format keeps.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="dictionary trades repetition for indirection; delta bets on nearby values; split bets on what's next." h={250}>
      <Row y={40} label="dictionary" value="repeats → indexes" k={easeOut(seg(t, 0.5, 0.9))} />
      <Row y={85} label="RLE / bit-packing" value="narrow, one width" k={easeOut(seg(t, 1.4, 1.8))} />
      <Row y={130} label="delta encodings" value="nearby values" k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={175} label="byte-stream-split" value="the compressor" k={easeOut(seg(t, 3.2, 3.6))} />
      <T x={300} y={228} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.9, 4.3))}>
        and PLAIN, when no bet pays off
      </T>
    </Svg>
  );
}
