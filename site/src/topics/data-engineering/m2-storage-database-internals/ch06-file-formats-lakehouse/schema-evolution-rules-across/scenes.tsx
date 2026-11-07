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

// 1 · Hook. The old record's two fields and the reader's three; lines join the matching names and their values flow
// across; currency has no partner, and its default drops in.
export function Hook({ t }: StepCtx) {
  const j = easeOut(seg(t, 1.0, 1.6));
  const d = easeOutBack(seg(t, 2.4, 3.0));
  return (
    <Svg label="currency is missing from the written record; the reader's schema gives it a default." h={220}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        written before currency
      </T>
      <Cell x={25} y={52} w={210} label="order_id 9001" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={25} y={88} w={210} label="amount_cents 4599" o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={300} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        the reader's schema
      </T>
      {['order_id', 'amount_cents', 'currency'].map((l, i) => (
        <Cell key={l} x={300} y={52 + i * 36} w={170} label={l} o={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))} stroke={i === 2 && d > 0 ? C.focus : C.mocha} />
      ))}
      {[0, 1].map((i) => (
        <line key={i} x1={235} y1={66 + i * 36} x2={lerp(235, 300, j)} y2={66 + i * 36} stroke={C.crema} strokeWidth={1.5} opacity={j > 0 ? 1 : 0} />
      ))}
      <T x={575} y={70} s={13} f={C.crema} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        9001
      </T>
      <T x={575} y={106} s={13} f={C.crema} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        4599
      </T>
      <T x={575} y={lerp(122, 142, d)} s={13} f={C.focus} a="end" o={clamp(d * 2)}>
        USD
      </T>
      <T x={300} y={200} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        missing, so the default fills it
      </T>
    </Svg>
  );
}

// 2 · Predict. The same old record; the reader now wants a field with no default, its cell pulsing; the answer: an error.
export function PredictDefault({ t, answer }: StepCtx) {
  const g = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <Svg label="a default saved the last field. Does a required field with no default get the same pass?" h={200}>
      <Cell x={25} y={52} w={210} label="order_id 9001" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={88} w={210} label="amount_cents 4599" o={easeOut(seg(t, 0.2, 0.5))} />
      <g opacity={easeOut(seg(t, 0.5, 0.8))}>
        <rect x={325} y={70} width={250} height={28} rx={4} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1 + 1.5 * g} strokeDasharray="5 3" />
        <T x={450} y={88.5} s={12} f={C.crema} a="middle">
          discount_cents, no default
        </T>
      </g>
      <AnswerRow y={150} label="still gets a value?" answer={answer} value="no: an error" k={easeOut(seg(t, 1.0, 1.5))} />
      <Verdict answer={answer} y={190} text="no default, nothing to land on" />
    </Svg>
  );
}

// 3 · No default. A probe from the wanted field sweeps the old record and finds no match; it drops to the default slot,
// finds it empty and is crossed; the specification's error lands.
export function RevealNoDefault({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.5, 1.5));
  const dn = easeOut(seg(t, 1.8, 2.2));
  return (
    <Svg label="no default, no matching writer field: the spec calls this an error, not a guess." h={220}>
      <Cell x={25} y={50} w={210} label="order_id 9001" stroke={sw > 0.1 && sw < 0.5 ? C.latte : C.mocha} />
      <Cell x={25} y={86} w={210} label="amount_cents 4599" stroke={sw > 0.5 && sw < 0.95 ? C.latte : C.mocha} />
      <Cell x={350} y={68} w={225} label="discount_cents" stroke={C.cherryText} />
      <line x1={350} y1={82} x2={235} y2={lerp(64, 100, sw)} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" opacity={sw > 0 && sw < 1 ? 1 : 0} />
      <g opacity={dn}>
        <rect x={350} y={110} width={225} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" />
        <T x={462} y={127} s={12} f={C.latte} a="middle">
          default: none
        </T>
      </g>
      <Cross x={335} y={123} k={easeOut(seg(t, 2.2, 2.5))} />
      <T x={350} y={168} s={15} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        an error, by the spec
      </T>
      <T x={300} y={208} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        adding a field safely means adding its default
      </T>
    </Svg>
  );
}

// 4 · Protobuf. The schema line pairs a name with a number; the name is struck out; the number travels down onto the wire,
// where it alone tags the bytes.
export function RevealProtobufIntro({ t }: StepCtx) {
  const st = easeOut(seg(t, 1.2, 1.6));
  const mv = easeInOut(seg(t, 1.9, 2.6));
  return (
    <Svg label="Protobuf doesn't match fields by name at all — only by number, on the wire." h={220}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        in the schema
      </T>
      <T x={25} y={72} s={16} f={C.crema} o={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.6 * st)}>
        customer_name
      </T>
      <rect x={22} y={66} width={150 * st} height={2.5} fill={C.cherryText} />
      <T x={200} y={72} s={16} f={C.focus} o={easeOut(seg(t, 0.3, 0.6))}>
        = 2
      </T>
      <T x={25} y={120} s={12} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        on the wire
      </T>
      <line x1={215} y1={80} x2={lerp(215, 53, mv)} y2={lerp(80, 132, mv)} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={mv > 0 ? 1 : 0} />
      <Cell x={25} y={132} w={56} label="2" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))} />
      <Cell x={91} y={132} w={200} label="bytes of the value" o={easeOut(seg(t, 2.5, 2.8))} />
      <T x={300} y={205} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.1, 3.5))}>
        a number on the wire, never a name
      </T>
    </Svg>
  );
}

// 5 · Predict reuse. Number 2's string field is struck out as deleted; a new int field takes number 2, nothing reserved;
// the answer: decoding succeeds, wrongly.
export function PredictFieldReuse({ t, answer }: StepCtx) {
  const st = easeOut(seg(t, 0.4, 0.8));
  return (
    <Svg label="field 2 (a string) is deleted; a new int field takes number 2 without reserving it." h={220}>
      <Cell x={25} y={52} w={56} label="2" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={100} y={71} s={14} f={C.crema} o={easeOut(seg(t, 0.1, 0.4)) * (1 - 0.6 * st)}>
        string customer_name
      </T>
      <rect x={97} y={66} width={210 * st} height={2.5} fill={C.cherryText} />
      <T x={330} y={71} s={12} f={C.cherryText} o={st}>
        deleted
      </T>
      <Cell x={25} y={90} w={56} label="2" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.9, 1.2))} />
      <T x={100} y={109} s={14} f={C.focus} o={easeOut(seg(t, 0.9, 1.2))}>
        int32 total_cents
      </T>
      <AnswerRow y={160} label="old bytes decode?" answer={answer} value="yes, wrongly" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} y={200} text="nothing tells the two apart" />
    </Svg>
  );
}

// 6 · The surprising number. The bytes of "Alice"; the first four are bracketed as an int32; an arrow drops to the value
// they decode to; no error; reserving the number would have cost nothing.
export function RevealSurprisingNumber({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.0, 1.6));
  const a = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="the old string's bytes decode as a specific, valid-looking int — no parse error at all." h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the old bytes: "Alice"
      </T>
      {['A', 'l', 'i', 'c', 'e'].map((c, i) => (
        <Cell key={c} x={25 + i * 44} y={52} w={38} label={c} stroke={i < 4 && b > 0 ? C.second : C.mocha} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))} />
      ))}
      <rect x={25} y={88} width={170 * b} height={3} fill={C.second} />
      <T x={250} y={71} s={12} f={C.second} o={b}>
        first four, read as int32
      </T>
      <line x1={110} y1={95} x2={110} y2={95 + 25 * a} stroke={C.second} strokeWidth={2} opacity={a > 0 ? 1 : 0} />
      <T x={25} y={145} s={20} f={C.crema} o={easeOut(seg(t, 2.4, 2.8))}>
        1667853377
      </T>
      <T x={575} y={145} s={13} f={C.latte} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        no crash, no error
      </T>
      <T x={25} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        reserving number 2 would have cost nothing
      </T>
    </Svg>
  );
}

const FILE: [string, number][] = [
  ['#1 cust_id · 4017', 1],
  ['#2 amount_cents · 4599', 2],
  ['#3 currency · USD', 3],
];
const SCHEMA: [string, number][] = [
  ['#1 customer_id', 1],
  ['#4 region', 4],
  ['#2 amount_cents', 2],
  ['#3 currency', 3],
];

/** The old file's three columns on the left and the new schema's four on the right; `hi(i)` strokes a schema row. */
function Layout({ o, hi }: { o: (side: number, i: number) => number; hi?: (i: number) => string | undefined }) {
  return (
    <g>
      <T x={25} y={40} s={12} f={C.latte} o={o(0, 0)}>
        the file as written
      </T>
      {FILE.map(([l], i) => (
        <Cell key={l} x={25} y={52 + i * 34} w={235} label={l} o={o(0, i)} />
      ))}
      <T x={320} y={40} s={12} f={C.latte} o={o(1, 0)}>
        the new schema
      </T>
      {SCHEMA.map(([l], i) => (
        <Cell key={l} x={320} y={52 + i * 34} w={170} label={l} o={o(1, i)} stroke={hi?.(i) ?? C.mocha} />
      ))}
    </g>
  );
}

// 7 · Parquet intro. The old file and the new schema build in; the rename and the inserted column light; three matching
// strategies are named.
export function RevealParquetIntro({ t }: StepCtx) {
  const rn = easeOut(seg(t, 1.4, 1.8));
  const ins = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="one schema change, read back three ways: by name, by position, by field ID." h={230}>
      <Layout o={(s, i) => easeOut(seg(t, 0.2 + s * 0.5 + i * 0.1, 0.5 + s * 0.5 + i * 0.1))} hi={(i) => (i === 0 && rn > 0 ? C.second : i === 1 && ins > 0 ? C.focus : undefined)} />
      <T x={575} y={70} s={12} f={C.second} a="end" o={rn}>
        renamed
      </T>
      <T x={575} y={104} s={12} f={C.focus} a="end" o={ins}>
        inserted
      </T>
      {['by name', 'by position', 'by field ID'].map((l, i) => (
        <T key={l} x={25 + i * 190} y={215} s={13} f={C.crema} o={easeOut(seg(t, 2.8 + i * 0.3, 3.1 + i * 0.3))}>
          {l}
        </T>
      ))}
    </Svg>
  );
}

const POS: [string, string][] = [
  ['4017', C.crema],
  ['4599', C.cherryText],
  ['USD', C.cherryText],
  ['none', C.latte],
];

// 8 · By position. Lines join slot to slot, straight across; each schema row's value lands beside it: the inserted column
// takes amount_cents's number, amount_cents takes the currency, and currency gets nothing.
export function RevealByPosition({ t }: StepCtx) {
  return (
    <Svg label="inserting one column shifts every later slot — by-position reads each one's wrong data." h={230}>
      <Layout o={() => 1} />
      {POS.map(([v, f], i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.6, 1.0 + i * 0.6));
        return (
          <g key={i}>
            {i < 3 && <line x1={260} y1={66 + i * 34} x2={lerp(260, 320, k)} y2={66 + i * 34} stroke={f} strokeWidth={2} opacity={k > 0 ? 1 : 0} />}
            <T x={575} y={70 + i * 34} s={13} f={f} a="end" o={easeOut(seg(t, 1.0 + i * 0.6, 1.3 + i * 0.6))}>
              {v}
            </T>
          </g>
        );
      })}
      <T x={300} y={215} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        every later slot holds someone else's data
      </T>
    </Svg>
  );
}

// 9 · By field ID. Lines join matching IDs, crossing the inserted row; each real column's value lands right; the new
// column alone comes back empty, correctly.
export function RevealByFieldId({ t }: StepCtx) {
  const ROWS: [number, number, string][] = [
    [0, 0, '4017'],
    [1, 2, '4599'],
    [2, 3, 'USD'],
  ];
  return (
    <Svg label="matched by field ID, every real column resolves correctly, renamed or not." h={230}>
      <Layout o={() => 1} hi={(i) => (i === 1 ? undefined : easeOut(seg(t, 2.6, 2.9)) > 0 ? C.focus : undefined)} />
      {ROWS.map(([from, to, v], i) => {
        const k = easeInOut(seg(t, 0.5 + i * 0.5, 1.0 + i * 0.5));
        return (
          <g key={i}>
            <line x1={260} y1={66 + from * 34} x2={lerp(260, 320, k)} y2={lerp(66 + from * 34, 66 + to * 34, k)} stroke={C.focus} strokeWidth={2} opacity={k > 0 ? 1 : 0} />
            <T x={575} y={70 + to * 34} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.0 + i * 0.5, 1.3 + i * 0.5))}>
              {v}
            </T>
          </g>
        );
      })}
      <T x={575} y={104} s={13} f={C.latte} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        empty
      </T>
      <T x={300} y={215} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        renamed or moved, each lands right
      </T>
    </Svg>
  );
}

// 10 · Recap. One row per format, then the question underneath all three.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one shared shape: every safe evolution move still needs a stable identity to match against." h={240}>
      <Row y={45} label="Avro" value="trusts a name, needs a default" k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={95} label="Protobuf" value="trusts a number: reserve it" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={145} label="Parquet" value="can trust a field ID" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
      <T x={300} y={210} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        what is the reader trusting?
      </T>
    </Svg>
  );
}
