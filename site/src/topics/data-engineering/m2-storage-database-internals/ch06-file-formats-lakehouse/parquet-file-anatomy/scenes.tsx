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

/** The chapter's file shape: magic, two row groups of five column chunks, the footer, the tail. `k[i]` fades region i
 * in (0 magic, 1 rg0, 2 rg1, 3 footer, 4 tail); `hi[i]` strokes it; `lit(g, c)` lights one column chunk. */
function File({ k, hi = [], lit, footerLabel = 'footer' }: { k: number[]; hi?: (string | undefined)[]; lit?: (g: number, c: number) => number; footerLabel?: string }) {
  const R: [number, number][] = [
    [40, 18],
    [62, 46],
    [112, 46],
    [162, 28],
    [194, 18],
  ];
  return (
    <g>
      {R.map(([y, h], i) => (
        <g key={i} opacity={k[i] ?? 0}>
          <rect x={25} y={y} width={330} height={h} rx={3} fill={C.cocoa} stroke={hi[i] ?? C.mocha} strokeWidth={hi[i] ? 2.5 : 1.5} />
          {(i === 1 || i === 2) &&
            [0, 1, 2, 3, 4].map((c) => (
              <rect
                key={c}
                x={33 + c * 64}
                y={y + 8}
                width={58}
                height={h - 16}
                rx={2}
                fill={C.cocoa}
                stroke={lit && lit(i - 1, c) > 0 ? C.focus : C.mocha}
                strokeWidth={1 + 1.5 * (lit ? clamp(lit(i - 1, c)) : 0)}
              />
            ))}
          {i === 0 && (
            <T x={190} y={y + 13} s={11} f={C.latte} a="middle">
              PAR1
            </T>
          )}
          {i === 3 && (
            <T x={190} y={y + 18} s={12} f={hi[3] ? C.focus : C.crema} a="middle">
              {footerLabel}
            </T>
          )}
          {i === 4 && (
            <T x={190} y={y + 13} s={11} f={C.latte} a="middle">
              length · PAR1
            </T>
          )}
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. The file assembles region by region, top to bottom, while its byte count runs up to 941.
export function Hook({ t }: StepCtx) {
  const k = [0, 1, 2, 3, 4].map((i) => easeOut(seg(t, 0.2 + i * 0.45, 0.5 + i * 0.45)));
  const n = easeInOut(seg(t, 0.2, 2.5));
  return (
    <Svg label="a 941-byte file, written one struct at a time, in this sandbox: PAR1 ... data ... PAR1." h={250}>
      <File k={k} />
      <T x={380} y={75} s={22} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        {num(941 * n)} bytes
      </T>
      <T x={380} y={105} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        one struct at a time
      </T>
      <T x={380} y={130} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        no library
      </T>
      <T x={300} y={240} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        every number here is read back from these bytes
      </T>
    </Svg>
  );
}

// 2 · Predict. The file as a strip, start to end; two dashed candidate slots for the schema pulse at either end; after
// the answer the end slot fills and the start slot is crossed.
export function PredictFooterOrder({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const g = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <Svg label="a reader needs the schema before any row makes sense. Where did this file put it?" h={200}>
      <T x={25} y={45} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        start
      </T>
      <T x={575} y={45} s={12} f={C.latte} a="end" o={easeOut(seg(t, 0.1, 0.4))}>
        end
      </T>
      {[0, 1].map((i) => (
        <rect
          key={i}
          x={i === 0 ? 25 : 485}
          y={58}
          width={90}
          height={32}
          rx={4}
          fill={C.cocoa}
          stroke={i === 1 && v > 0 ? C.focus : C.cherryText}
          strokeWidth={1 + 1.5 * (answer === null ? g : i === 1 ? 1 : 0)}
          strokeDasharray={i === 1 && v > 0 ? undefined : '5 3'}
          opacity={easeOut(seg(t, 0.4, 0.7))}
        />
      ))}
      <rect x={125} y={58} width={350} height={32} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={300} y={79} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        row groups, written as they come
      </T>
      <T x={530} y={79} s={12} f={C.focus} a="middle" o={v}>
        schema
      </T>
      <Cross x={70} y={74} k={v} />
      <AnswerRow y={145} label="the schema sits" answer={answer} value="at the end" k={easeOut(seg(t, 1.0, 1.5))} />
      <Verdict answer={answer} y={188} text="one forward pass is all it takes" />
    </Svg>
  );
}

// 3 · Footer last. A write cursor runs down the data regions in one forward pass; only then does the footer append,
// carrying the schema, the offsets and the row counts.
export function RevealFooterLast({ t }: StepCtx) {
  const cur = easeInOut(seg(t, 0.3, 2.0));
  const ft = easeOut(seg(t, 2.3, 2.8));
  const k = [easeOut(seg(t, 0.2, 0.5)), cur > 0.2 ? 1 : 0, cur > 0.7 ? 1 : 0, ft, easeOut(seg(t, 2.8, 3.1))];
  return (
    <Svg label="the footer comes after every byte of data — so a single streaming pass can write it." h={250}>
      <File k={k} hi={[undefined, undefined, undefined, ft > 0 ? C.focus : undefined]} footerLabel="schema · offsets · row counts" />
      <path d={`M14 ${lerp(42, 190, cur)} l-6 -10 h12 z`} fill={C.focus} opacity={cur > 0 && cur < 1 ? 1 : 0} />
      <T x={375} y={90} s={13} f={C.crema} o={easeOut(seg(t, 0.6, 1.0))}>
        data first, one pass
      </T>
      <T x={375} y={181} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        the footer, last
      </T>
      <T x={300} y={240} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        a table of contents, at the end
      </T>
    </Svg>
  );
}

// 4 · Hierarchy. The footer lights as the source; row group 0 outlines and its five column chunks light one by one; row
// group 1 outlines; the counts land beside each.
export function RevealHierarchy({ t }: StepCtx) {
  const ft = easeOut(seg(t, 0.2, 0.6));
  const g0 = easeOut(seg(t, 0.8, 1.2));
  const g1 = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="read straight from this file's own footer: 2 row groups, 5 columns, one page per chunk." h={250}>
      <File
        k={[1, 1, 1, 1, 1]}
        hi={[undefined, g0 > 0 ? C.focus : undefined, g1 > 0 ? C.focus : undefined, ft > 0 ? C.second : undefined]}
        lit={(g, c) => (g === 0 ? easeOut(seg(t, 1.3 + c * 0.18, 1.5 + c * 0.18)) : g === 1 ? g1 : 0)}
      />
      <T x={375} y={90} s={13} f={C.crema} o={g0}>
        row group 0: 2 rows
      </T>
      <T x={375} y={140} s={13} f={C.crema} o={g1}>
        row group 1: 2 rows
      </T>
      <T x={375} y={115} s={12} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        5 column chunks each
      </T>
      <T x={375} y={181} s={12} f={C.second} o={ft}>
        read from the footer
      </T>
      <T x={300} y={240} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        4 rows in all
      </T>
    </Svg>
  );
}

const STATUS = ['created', 'shipped', 'created', 'shipped'];

// 5 · Predict. The status column's four values; after the answer the repeats dim, leaving each word once.
export function PredictRepeatedString({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="status only ever holds 'created' or 'shipped', four times over. Stored as four full copies?" h={200}>
      <T x={25} y={45} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the status column, 4 rows
      </T>
      {STATUS.map((w, i) => (
        <Cell key={i} x={25 + i * 140} y={58} w={128} label={w} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15)) * (i >= 2 ? 1 - 0.65 * v : 1)} stroke={i < 2 && v > 0 ? C.focus : C.mocha} />
      ))}
      <AnswerRow y={145} label="four full copies?" answer={answer} value="no, each once" k={easeOut(seg(t, 1.0, 1.5))} />
      <Verdict answer={answer} y={188} text="a dictionary, then pointers" />
    </Svg>
  );
}

// 6 · Dictionary page. The dictionary page lists the two words once; the data page's four indexes appear, and an arrow
// runs from each back to its word.
export function RevealDictionaryPage({ t }: StepCtx) {
  return (
    <Svg label="a dictionary page holds the 2 unique strings once; the data page holds 1-bit indexes." h={230}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        dictionary page
      </T>
      <rect x={25} y={52} width={230} height={72} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {['0  created', '1  shipped'].map((l, i) => (
        <T key={l} x={45} y={80 + i * 28} s={14} f={C.crema} o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))}>
          {l}
        </T>
      ))}
      <T x={325} y={42} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        data page
      </T>
      <rect x={325} y={52} width={250} height={72} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.3))} />
      {[0, 1, 0, 1].map((d, i) => {
        const k = easeInOut(seg(t, 1.6 + i * 0.35, 2.0 + i * 0.35));
        const x = 362 + i * 55;
        const ty = d === 0 ? 75 : 103;
        return (
          <g key={i}>
            <Cell x={x - 20} y={74} w={40} label={String(d)} o={easeOut(seg(t, 1.2 + i * 0.1, 1.5 + i * 0.1))} />
            <path d={`M${x} 102 C ${x} 150 ${lerp(x, 300, 0.6)} 150 ${lerp(x, 255, k)} ${lerp(102, ty, k)}`} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k > 0 ? 0.8 : 0} />
          </g>
        );
      })}
      <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        4 rows, each word stored once
      </T>
      <T x={25} y={208} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        a little indirection, no repeats
      </T>
    </Svg>
  );
}

// 7 · v1 vs v2. Each row group's status page header; the type field reads 0, then 3; the v2 page keeps its counts in a
// band of their own, which a reader reads straight from the header; the v1 page must be decompressed first.
export function RevealV1VsV2({ t }: StepCtx) {
  const r = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="the same column, one row group apart: the page header's own type field tells them apart." h={230}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        row group 0, status
      </T>
      <Cell x={25} y={52} w={250} label="page type 0 · v1" o={easeOut(seg(t, 0.3, 0.6))} />
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        <rect x={25} y={88} width={250} height={50} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={150} y={118} s={11} f={C.latte} a="middle">
          counts and values, together
        </T>
      </g>
      <T x={325} y={42} s={12} f={C.latte} o={easeOut(seg(t, 1.1, 1.4))}>
        row group 1, status
      </T>
      <Cell x={325} y={52} w={250} label="page type 3 · v2" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.3, 1.6))} />
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        <rect x={325} y={88} width={250} height={20} rx={3} fill={C.cocoa} stroke={r > 0 ? C.focus : C.mocha} strokeWidth={1.5 + r} />
        <T x={450} y={102} s={11} f={C.crema} a="middle">
          counts, on their own
        </T>
        <rect x={325} y={112} width={250} height={26} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={450} y={129} s={11} f={C.latte} a="middle">
          values, compressed
        </T>
      </g>
      <T x={25} y={175} s={12} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>
        v1: decompress to count
      </T>
      <T x={325} y={175} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        v2: count from the header
      </T>
    </Svg>
  );
}

// 8 · INT96. Twelve bytes; the first eight bracketed as nanoseconds of the day, the last four as the day; read as UTC they
// land on noon, correct; read as a Los Angeles wall clock, seven hours off.
export function RevealInt96Pitfall({ t }: StepCtx) {
  const b1 = easeOut(seg(t, 0.9, 1.4));
  const b2 = easeOut(seg(t, 1.4, 1.9));
  return (
    <Svg label="the same 12 written bytes, decoded two ways: a UTC instant, or an America/Los Angeles clock reading." h={240}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        12 bytes of INT96
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 45}
          y={52}
          width={39}
          height={24}
          rx={3}
          fill={C.cocoa}
          stroke={i < 8 ? (b1 > 0 ? C.second : C.mocha) : b2 > 0 ? C.crema : C.mocha}
          strokeWidth={1.5}
          opacity={easeOut(seg(t, 0.2 + i * 0.04, 0.5 + i * 0.04))}
        />
      ))}
      <rect x={25} y={82} width={354 * b1} height={3} fill={C.second} />
      <T x={25} y={100} s={11} f={C.second} o={b1}>
        nanoseconds of the day
      </T>
      <rect x={385} y={82} width={174 * b2} height={3} fill={C.crema} />
      <T x={385} y={100} s={11} f={C.crema} o={b2}>
        which day
      </T>
      <Row y={145} label="assume UTC" value="12:00 UTC, correct" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={185} label="assume LA local" value="7 hours off" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.4))} />
      <T x={300} y={228} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
        the same 12 bytes, two assumptions
      </T>
    </Svg>
  );
}

// 9 · isAdjustedToUTC. The INT96 column's card carries no logical type, and a reader's question mark pulses beside it; the
// modern column's card lands with its required flag stamped in.
export function RevealIsAdjusted({ t }: StepCtx) {
  const g = 0.5 + 0.5 * Math.sin(t * 5);
  const f = easeOutBack(seg(t, 2.6, 3.1));
  return (
    <Svg label="isAdjustedToUTC turns that guess into a required flag the writer must set." h={230}>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <rect x={25} y={50} width={260} height={84} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={45} y={80} s={14} f={C.crema}>
          INT96
        </T>
        <T x={45} y={112} s={13} f={C.cherryText}>
          no logical type
        </T>
      </g>
      <T x={250} y={82} s={22} f={C.cherryText} a="middle" o={t > 0.9 && t < 2.4 ? g : easeOut(seg(t, 0.9, 1.2))}>
        ?
      </T>
      <g opacity={easeOut(seg(t, 2.0, 2.3))}>
        <rect x={315} y={50} width={260} height={84} rx={5} fill={C.cocoa} stroke={f > 0 ? C.focus : C.mocha} strokeWidth={1.5 + f} />
        <T x={335} y={80} s={14} f={C.crema}>
          INT64 · TIMESTAMP
        </T>
      </g>
      <T x={335} y={lerp(122, 112, clamp(f))} s={13} f={C.focus} o={clamp(f)}>
        isAdjustedToUTC = true
      </T>
      <T x={300} y={185} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))} a="middle">
        the old type: the reader guesses
      </T>
      <T x={300} y={215} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        the new type: a fact in the file
      </T>
    </Svg>
  );
}

// 10 · Recap. File, row group, column chunk and page nest one inside another; at the leaf, a physical and a logical type
// tag land side by side.
export function Recap({ t }: StepCtx) {
  const N: [string, number][] = [
    ['file', 0],
    ['row group', 1],
    ['column chunk', 2],
    ['page', 3],
  ];
  return (
    <Svg label="file, row groups, column chunks, pages — a physical type and its logical type ride together." h={250}>
      {N.map(([l, i]) => (
        <g key={l} opacity={easeOut(seg(t, 0.3 + i * 0.4, 0.6 + i * 0.4))}>
          <rect x={25 + i * 20} y={36 + i * 26} width={550 - i * 40} height={180 - i * 40} rx={5} fill={C.cocoa} stroke={i === 3 ? C.focus : C.mocha} strokeWidth={1.5} />
          <T x={35 + i * 20} y={53 + i * 26} s={11} f={C.latte}>
            {l}
          </T>
        </g>
      ))}
      <Cell x={105} y={140} w={180} label="physical: the bytes" o={easeOut(seg(t, 2.4, 2.8))} stroke={C.second} />
      <Cell x={305} y={140} w={190} label="logical: the meaning" o={easeOut(seg(t, 2.9, 3.3))} stroke={C.focus} />
      <T x={300} y={240} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        the timestamp needed both
      </T>
    </Svg>
  );
}
