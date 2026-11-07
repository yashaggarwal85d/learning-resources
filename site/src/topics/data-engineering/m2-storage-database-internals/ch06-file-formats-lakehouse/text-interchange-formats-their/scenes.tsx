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

/** A string typed on over `k` (0 → 1), one character at a time. */
function typed(s: string, k: number) {
  return s.slice(0, Math.round(s.length * clamp(k)));
}

const NAIVE: [string, number, number][] = [
  ['"Smith', 25, 120],
  [' John"', 155, 120],
  ['42', 285, 80],
  ['Mumbai', 375, 110],
];
const REAL: [string, number, number][] = [
  ['Smith, John', 25, 180],
  ['42', 215, 80],
  ['Mumbai', 305, 110],
];

// 1 · Hook. The raw row types on; a naive comma split breaks it into four fields that slide apart; a real parser lays it
// out as three.
export function Hook({ t }: StepCtx) {
  const sp = easeOutBack(seg(t, 1.0, 1.6));
  const rp = easeOutBack(seg(t, 2.3, 2.9));
  return (
    <Svg label="one row, one comma inside a name — a naive reader sees 4 fields, not 3." h={240}>
      <T x={25} y={40} s={16} f={C.focus}>
        {typed('"Smith, John",42,Mumbai', seg(t, 0.1, 0.8))}
      </T>
      <T x={25} y={75} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        split on every comma
      </T>
      {NAIVE.map(([l, x, w], i) => (
        <Cell key={i} x={lerp(25 + i * 30, x, sp)} y={85} w={w} label={l} stroke={C.cherryText} o={clamp(sp * 2)} />
      ))}
      <T x={575} y={103} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        4 fields
      </T>
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        a real CSV parser
      </T>
      {REAL.map(([l, x, w], i) => (
        <Cell key={i} x={lerp(25 + i * 30, x, rp)} y={160} w={w} label={l} stroke={C.focus} o={clamp(rp * 2)} />
      ))}
      <T x={575} y={178} s={13} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        3 fields
      </T>
      <T x={300} y={225} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        the reader did exactly what it was told
      </T>
    </Svg>
  );
}

// 2 · Predict. The quoted row, ticked; a second field with a quote inside it, the quote glowing; the answer: it needs a rule
// of its own.
export function PredictQuoting({ t, answer }: StepCtx) {
  const g = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <Svg label="quoting fixes the comma. What about a quote inside the field?" h={200}>
      <T x={25} y={50} s={15} f={C.quiet} o={easeOut(seg(t, 0.1, 0.4))}>
        "Smith, John",42,Mumbai
      </T>
      <MiniTick x={300} y={45} k={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={95} s={16} f={C.crema} o={easeOut(seg(t, 0.5, 0.8))}>
        "O
        <tspan fill={C.focus} opacity={0.5 + 0.5 * g}>
          "
        </tspan>
        Brien",7
      </T>
      <AnswerRow y={145} label="quoting alone?" answer={answer} value="no, its own rule" k={easeOut(seg(t, 0.9, 1.4))} />
      <Verdict answer={answer} y={188} text="quotes only mark where a field ends" />
    </Svg>
  );
}

// 3 · Embedded quote. The backslash form types on, reads back wrong and is crossed; the doubled form types on, reads back
// right and is ticked.
export function RevealEmbeddedQuote({ t }: StepCtx) {
  return (
    <Svg label="naive line-split sees 3 records; a real CSV parser sees 2." h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        a backslash, as in code
      </T>
      <T x={25} y={68} s={16} f={C.crema}>
        {typed('"O\\"Brien",7', seg(t, 0.2, 0.8))}
      </T>
      <T x={300} y={68} s={16} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.4))}>
        {'reads O\\Brien"'}
      </T>
      <Cross x={555} y={63} k={easeOut(seg(t, 1.4, 1.7))} />
      <T x={25} y={130} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        the format's one rule: write it twice
      </T>
      <T x={25} y={158} s={16} f={C.crema}>
        {typed('"O""Brien",7', seg(t, 2.2, 2.8))}
      </T>
      <T x={300} y={158} s={16} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        reads O"Brien
      </T>
      <MiniTick x={545} y={152} k={easeOut(seg(t, 3.4, 3.7))} />
      <T x={300} y={220} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        no backslash escape at all
      </T>
    </Svg>
  );
}

const LINES = ['"123 Main St', 'Apt 4",Chicago', '"1 Elm St",Boston'];

// 4 · Embedded newline. Three physical lines; a naive split marks each as a record; a real parser brackets the first two
// as one record and the third as another.
export function RevealEmbeddedNewline({ t }: StepCtx) {
  const n = (i: number) => easeOut(seg(t, 0.6 + i * 0.25, 0.9 + i * 0.25));
  const r = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="x" h={250}>
      {LINES.map((l, i) => (
        <T key={l} x={60} y={45 + i * 28} s={14} f={C.crema} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))}>
          {l}
        </T>
      ))}
      {LINES.map((l, i) => (
        <rect key={l} x={330} y={33 + i * 28} width={6} height={18} rx={2} fill={C.cherryText} opacity={n(i)} />
      ))}
      <path d={`M48 ${33} h-10 v${46 * r} h10`} fill="none" stroke={C.focus} strokeWidth={2} opacity={r > 0 ? 1 : 0} />
      <path d={`M48 ${89} h-10 v${18 * r} h10`} fill="none" stroke={C.focus} strokeWidth={2} opacity={r > 0 ? 1 : 0} />
      <Row y={150} label="split on newline" value="3 records" valueColor={C.cherryText} k={easeOut(seg(t, 1.5, 1.9))} />
      <Row y={195} label="a real CSV parser" value="2 records" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
      <T x={300} y={238} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        no error, just a wrong count
      </T>
    </Svg>
  );
}

// 5 · Surprising number. The id in the file; two readers branch off it: the exact parser hands it back untouched, the
// double-precision parser hands back one smaller, the changed digit marked.
export function RevealSurprisingNumber({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.4, 1.9));
  const b = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="order_id 9,007,199,254,740,993 — a double-precision parser returns 9,007,199,254,740,992." h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        order_id in the file, bytes untouched
      </T>
      <T x={25} y={68} s={20} f={C.crema} o={easeOut(seg(t, 0.3, 0.7))}>
        9,007,199,254,740,993
      </T>
      <T x={25} y={115} s={12} f={C.latte} o={a}>
        a parser that keeps every digit
      </T>
      <T x={25} y={142} s={18} f={C.focus} o={a}>
        9,007,199,254,740,993
      </T>
      <MiniTick x={330} y={136} k={easeOut(seg(t, 1.9, 2.2))} />
      <T x={25} y={180} s={12} f={C.latte} o={b}>
        a parser that holds a double
      </T>
      <T x={25} y={207} s={18} f={C.crema} o={b}>
        9,007,199,254,740,99<tspan fill={C.cherryText}>2</tspan>
      </T>
      <T x={575} y={207} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        one smaller, no warning
      </T>
    </Svg>
  );
}

// 6 · BOM. In an editor the object looks fine and is ticked; the bytes a parser sees carry three extra in front; the
// parser's cursor lands on the first and is wrong; the three are stripped and the cursor lands on the brace.
export function RevealBom({ t }: StepCtx) {
  const strip = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="a byte order mark at the front of the file: a parser that doesn't tolerate it raises before it reads a single field." h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        in an editor
      </T>
      <T x={25} y={66} s={15} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        {'{ "status": "ok" }'}
      </T>
      <MiniTick x={250} y={60} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={110} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        what a parser reads
      </T>
      {['EF', 'BB', 'BF'].map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, 1.1 + i * 0.15, 1.4 + i * 0.15)) * (1 - strip)} transform={`translate(0 ${(-14 * strip).toFixed(1)})`}>
          <Cell x={25 + i * 40} y={122} w={34} h={26} label={l} stroke={C.cherryText} />
        </g>
      ))}
      <T x={lerp(150, 25, strip)} y={140} s={15} f={C.crema} o={easeOut(seg(t, 1.0, 1.3))}>
        {'{ "status": "ok" }'}
      </T>
      <path d={`M${lerp(42, 30, strip)} 156 l-7 10 h14 z`} fill={strip > 0.5 ? C.focus : C.cherryText} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <T x={25} y={190} s={13} f={C.cherryText} o={easeOut(seg(t, 1.9, 2.3))}>
        its first character is already wrong
      </T>
      <T x={25} y={220} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        skip the mark: it parses
      </T>
    </Svg>
  );
}

const FMT = ['CSV', 'JSON', 'XML'];
const MISSING = ['types', 'schema', 'pushdown'];

// 7 · No types. Three format cards; for each, three empty slots pop in, row by row: no types, no schema, no pushdown;
// question marks rise over the cards; the doorway rule lands.
export function RevealNoTypes({ t }: StepCtx) {
  return (
    <Svg label="CSV, JSON, XML: three formats, zero of them typed." h={240}>
      {FMT.map((f, j) => (
        <g key={f}>
          <T x={210 + j * 140} y={42} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.4 + j * 0.15, 2.7 + j * 0.15))}>
            ?
          </T>
          <Cell x={155 + j * 140} y={52} w={110} label={f} o={easeOut(seg(t, 0.2 + j * 0.15, 0.5 + j * 0.15))} />
        </g>
      ))}
      {MISSING.map((m, r) => (
        <g key={m}>
          <T x={25} y={113 + r * 30} s={12} f={C.latte} o={easeOut(seg(t, 0.8 + r * 0.4, 1.1 + r * 0.4))}>
            {m}
          </T>
          {FMT.map((f, j) => (
            <circle
              key={f}
              cx={210 + j * 140}
              cy={109 + r * 30}
              r={lerp(2, 8, easeOutBack(seg(t, 0.9 + r * 0.4 + j * 0.08, 1.3 + r * 0.4 + j * 0.08)))}
              fill="none"
              stroke={C.cherryText}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              opacity={easeOut(seg(t, 0.9 + r * 0.4, 1.2 + r * 0.4))}
            />
          ))}
        </g>
      ))}
      <T x={300} y={225} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        a doorway: accept, then convert
      </T>
    </Svg>
  );
}

// 8 · Recap. Five traps, one row per beat, then the next question.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five traps, one rule: accept them at the edge, convert immediately." h={250}>
      <Row y={35} label="a comma" value="4 fields → 3" k={easeOut(seg(t, 0.3, 0.6))} />
      <Row y={75} label="a quote" value="doubled" k={easeOut(seg(t, 0.8, 1.1))} />
      <Row y={115} label="a line break" value="3 records → 2" k={easeOut(seg(t, 1.3, 1.6))} />
      <Row y={155} label="a number" value="…993 → …992" k={easeOut(seg(t, 1.8, 2.1))} />
      <Row y={195} label="a byte order mark" value="skipped" k={easeOut(seg(t, 2.3, 2.6))} />
      <T x={300} y={240} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        parse, don't guess · next: rows or columns
      </T>
    </Svg>
  );
}
