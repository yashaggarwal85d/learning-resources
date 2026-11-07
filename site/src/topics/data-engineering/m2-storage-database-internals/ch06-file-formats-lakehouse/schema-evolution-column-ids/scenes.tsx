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

const V2 = ['customer_id', 'region', 'amount_cents', 'currency'];
const IDS = [1, 4, 2, 3];
const FILE = ['4017', '4599', 'USD'];
const colX = (i: number) => 25 + i * 138;

/** The v2 schema's four column cells along the top, with field-ID badges when `ids` is on. */
function SchemaRow({ y, o, ids = 0, bad = [] as number[], good = [] as number[] }: { y: number; o: number; ids?: number; bad?: number[]; good?: number[] }) {
  return (
    <g>
      {V2.map((n, i) => (
        <Cell key={n} x={colX(i)} y={y} w={128} h={30} label={n} stroke={bad.includes(i) ? C.cherryText : good.includes(i) ? C.focus : C.mocha} o={o} />
      ))}
      {ids > 0 &&
        V2.map((n, i) => (
          <T key={'id' + n} x={colX(i) + 64} y={y - 8} s={11} f={C.second} a="middle" o={ids}>
            {`id ${IDS[i]}`}
          </T>
        ))}
    </g>
  );
}

/** The data file's three stored slots along the bottom, with their field IDs above when `ids` is on. */
function FileRow({ y, o, ids = 0 }: { y: number; o: number; ids?: number }) {
  return (
    <g>
      <T x={25} y={y - 10} s={11} f={C.latte} o={o}>
        the file, as written
      </T>
      {FILE.map((v, i) => (
        <Cell key={v} x={200 + i * 125} y={y} w={110} h={28} label={ids > 0 ? `${i + 1}: ${v}` : v} o={o} />
      ))}
    </g>
  );
}

// 1 · Hook. One file with its rows, a row held steady inside it; then the frame widens to a table of several files with
// one column running through all of them, and the questions rename and reorder land on that column.
export function Hook({ t }: StepCtx) {
  const w = easeInOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="a row's identity survives inside one file -- what about a whole column, at the table level?" h={200}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25 + i * 115} y={40} width={95} height={100} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={i === 0 ? easeOut(seg(t, 0.1, 0.4)) : w} />
      ))}
      <rect x={29} y={80} width={87} height={12} fill={C.cherryText} opacity={easeOut(seg(t, 0.5, 0.8)) * (1 - w)} />
      <T x={25} y={165} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        a row, inside one file
      </T>
      <rect x={25} y={52} width={lerp(95, 440, w)} height={14} fill={C.second} opacity={0.35 * w} />
      <T x={25} y={30} s={12} f={C.second} o={easeOut(seg(t, 2.3, 2.6))}>
        a column, across the whole table
      </T>
      <T x={480} y={80} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.3))}>
        rename?
      </T>
      <T x={480} y={115} s={13} f={C.crema} o={easeOut(seg(t, 3.5, 3.8))}>
        reorder?
      </T>
    </Svg>
  );
}

// 2 · Predict. The old header, then the new one with a rename and an inserted column; the answer: columns shift wrong.
export function PredictPositionCorrupts({ t, answer }: StepCtx) {
  const old = ['cust_id', 'amount_cents', 'currency'];
  return (
    <Svg label="a column gets renamed and a new one inserted -- what happens if a reader still matches by position?" h={200}>
      {old.map((n, i) => (
        <Cell key={n} x={colX(i)} y={20} w={128} h={28} label={n} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      {V2.map((n, i) => (
        <Cell key={n} x={colX(i)} y={70} w={128} h={28} label={n} stroke={i === 0 ? C.second : i === 1 ? C.focus : C.mocha} o={easeOut(seg(t, 0.9 + i * 0.15, 1.2 + i * 0.15))} />
      ))}
      <T x={25} y={118} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        renamed, and one inserted before amount_cents
      </T>
      <AnswerRow y={145} label="read by position" answer={answer} value="columns shift" k={easeOut(seg(t, 2.2, 2.7))} f={C.cherryText} />
      <Verdict answer={answer} y={188} text="every later column takes the wrong value" f={C.cherryText} />
    </Svg>
  );
}

// 3 · By position, for real. The new schema on top, the file's three slots below; lines join slot one to column one, slot
// two to column two and so on; region gets 4599, amount_cents gets USD, currency gets nothing.
export function RevealPositionCorruptsForReal({ t }: StepCtx) {
  const got = ['4017', '4599', 'USD', 'nothing'];
  return (
    <Svg label="reproduced for real: the inserted column silently takes the next column's real value." h={230}>
      <SchemaRow y={30} o={easeOut(seg(t, 0.1, 0.4))} bad={t > 2.6 ? [1, 2, 3] : []} />
      <FileRow y={140} o={easeOut(seg(t, 0.3, 0.6))} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.9 + i * 0.4, 1.3 + i * 0.4));
        return (
          <line
            key={i}
            x1={255 + i * 125}
            y1={138}
            x2={lerp(255 + i * 125, colX(i) + 64, k)}
            y2={lerp(138, 94, k)}
            stroke={i === 0 ? C.latte : C.cherryText}
            strokeWidth={1.6}
            opacity={k > 0 ? 1 : 0}
          />
        );
      })}
      {got.map((g, i) => (
        <T key={g} x={colX(i) + 64} y={84} s={12} f={i === 0 ? C.crema : C.cherryText} a="middle" o={easeOut(seg(t, 1.3 + i * 0.4, 1.6 + i * 0.4))}>
          {g}
        </T>
      ))}
      <T x={300} y={212} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        every column after the insert, one slot off
      </T>
    </Svg>
  );
}

// 4 · Field IDs. One column before and after a rename: its name changes, its field ID badge stays put and is joined to
// both by one line.
export function RevealFieldIdsAreTheFix({ t }: StepCtx) {
  return (
    <Svg label="Iceberg's fix: columns are selected by field ID, never by name or position." h={230}>
      <T x={25} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        before
      </T>
      <Cell x={100} y={22} w={150} h={30} label="cust_id" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={420} y={60} w={100} h={40} label="field id 1" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.8, 1.2))} />
      <line x1={252} y1={37} x2={418} y2={74} stroke={C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={25} y={128} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        after
      </T>
      <Cell x={100} y={110} w={150} h={30} label="customer_id" stroke={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
      <line x1={252} y1={125} x2={418} y2={88} stroke={C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 2.3, 2.6))} />
      <T x={270} y={170} s={12} f={C.crema} o={easeOut(seg(t, 2.8, 3.1))}>
        the name may change; the ID never
      </T>
      <T x={25} y={212} s={14} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        read by field ID, never by name or slot
      </T>
    </Svg>
  );
}

// 5 · By field ID, for real. The same schema and file, now with IDs on both; lines join matching IDs; region reads back
// nothing, correctly, and every other column gets its real value.
export function RevealFieldIdProjectionSurvives({ t }: StepCtx) {
  const got = ['4017', 'missing', '4599', 'USD'];
  const target = [0, 2, 3];
  return (
    <Svg label="reproduced for real: the identical rename and insert, this time read by field ID." h={230}>
      <SchemaRow y={40} o={easeOut(seg(t, 0.1, 0.4))} ids={easeOut(seg(t, 0.4, 0.7))} good={t > 2.8 ? [0, 1, 2, 3] : []} />
      <FileRow y={140} o={easeOut(seg(t, 0.3, 0.6))} ids={1} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.4, 1.4 + i * 0.4));
        return <line key={i} x1={255 + i * 125} y1={138} x2={lerp(255 + i * 125, colX(target[i]) + 64, k)} y2={lerp(138, 104, k)} stroke={C.focus} strokeWidth={1.6} opacity={k > 0 ? 1 : 0} />;
      })}
      {got.map((g, i) => (
        <T key={g} x={colX(i) + 64} y={94} s={12} f={i === 1 ? C.latte : C.focus} a="middle" o={easeOut(seg(t, 1.4 + i * 0.35, 1.7 + i * 0.35))}>
          {g}
        </T>
      ))}
      <T x={300} y={212} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        renamed column intact; new one reads missing
      </T>
    </Svg>
  );
}

// 6 · Predict. Delta's file header carries real names; a rename arrives; the answer: a metadata map.
export function PredictDeltaRenameMechanism({ t, answer }: StepCtx) {
  return (
    <Svg label="Delta's files use real column names -- how does it rename without rewriting the file?" h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Delta data file header
      </T>
      <Cell x={25} y={40} w={120} h={28} label="cust_id" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={155} y={40} w={140} h={28} label="amount_cents" o={easeOut(seg(t, 0.3, 0.6))} />
      <Req x1={300} x2={400} y={54} k={easeOut(seg(t, 0.9, 1.3))} label="rename" />
      <Cell x={405} y={40} w={150} h={28} label="customer_id" o={easeOut(seg(t, 1.2, 1.5))} />
      <T x={300} y={105} s={16} f={C.second} a="middle" o={easeOut(seg(t, 1.7, 2.1))}>
        rewrite the file?
      </T>
      <AnswerRow y={145} label="Delta renames by" answer={answer} value="a metadata map" k={easeOut(seg(t, 2.3, 2.8))} />
      <Verdict answer={answer} y={188} text="the file itself never changes" />
    </Svg>
  );
}

// 7 · No mapping, for real. Physical name equals logical name; the rename sweeps a rewrite through the file; the bytes
// before and after differ.
export function RevealNoMappingRewrites({ t }: StepCtx) {
  const rw = easeInOut(seg(t, 1.4, 2.6));
  return (
    <Svg label="reproduced for real: without column mapping, a rename really does rewrite the file." h={230}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        physical name = logical name
      </T>
      <rect x={25} y={50} width={260} height={110} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={40} y={75} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        part-0000: header
      </T>
      <rect x={lerp(29, 278, rw)} y={54} width={3} height={102} fill={C.cherryText} opacity={t > 1.4 && t < 2.7 ? 1 : 0} />
      <T x={40} y={105} s={12} f={C.crema} o={easeOut(seg(t, 0.5, 0.8))}>
        cust_id, amount_cents
      </T>
      <T x={40} y={135} s={12} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.5))}>
        rewritten
      </T>
      <Req x1={290} x2={340} y={105} k={easeOut(seg(t, 2.6, 3.0))} f={C.cherryText} />
      <T x={350} y={100} s={13} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>
        bytes before and
      </T>
      <T x={350} y={126} s={13} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.3))}>
        after: different
      </T>
      <T x={25} y={210} s={13} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        no other name exists, so the file must change
      </T>
    </Svg>
  );
}

// 8 · Column mapping, for real. The metadata map: cust_id points at col-1; the data file's header holds col-1 and col-2,
// padlocked; the rename adds customer_id pointing at col-1 and strikes the old entry; the file's bytes are ticked identical.
export function RevealMappingAvoidsRewrite({ t }: StepCtx) {
  const r = easeOut(seg(t, 1.8, 2.3));
  return (
    <Svg label="reproduced for real: with column mapping, the data file's bytes never change." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        table metadata
      </T>
      <Cell x={25} y={35} w={150} h={28} label="cust_id" o={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.6 * r)} />
      <Cell x={25} y={75} w={150} h={28} label="amount_cents" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={25} y={115} w={150} h={28} label="customer_id" stroke={C.focus} f={C.focus} o={r} />
      <line x1={30} y1={49} x2={170} y2={49} stroke={C.cherryText} strokeWidth={2} opacity={r} />
      <Cell x={360} y={45} w={110} h={28} label="col-1" stroke={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={360} y={85} w={110} h={28} label="col-2" stroke={C.second} o={easeOut(seg(t, 0.7, 1.0))} />
      <line x1={177} y1={49} x2={358} y2={59} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.9, 1.2)) * (1 - r)} />
      <line x1={177} y1={89} x2={358} y2={99} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <line x1={177} y1={129} x2={lerp(177, 358, easeOut(seg(t, 2.2, 2.7)))} y2={lerp(129, 62, easeOut(seg(t, 2.2, 2.7)))} stroke={C.focus} strokeWidth={1.8} />
      <T x={360} y={140} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        data file header
      </T>
      <Lock x={485} y={62} k={easeOut(seg(t, 1.2, 1.5))} />
      <MiniTick x={360} y={175} k={easeOut(seg(t, 3.2, 3.5))} />
      <T x={380} y={182} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))}>
        bytes identical
      </T>
      <T x={25} y={215} s={13} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        only the map moved
      </T>
    </Svg>
  );
}

// 9 · Three more moves. A stable ID in the middle; three moves arrive around it, each joined to it by a line.
export function RevealThreeMoreMovesSafe({ t }: StepCtx) {
  const moves = ['add a column', 'widen a type', 'evolve a nested struct'];
  return (
    <Svg label="the same stable-ID idea also covers adding, widening, and nested-struct evolution." h={230}>
      <Cell x={25} y={85} w={150} h={40} label="a stable ID" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      {moves.map((m, i) => {
        const y = 30 + i * 55;
        const b = 0.8 + i * 0.8;
        return (
          <g key={m}>
            <line x1={177} y1={105} x2={lerp(177, 298, easeOut(seg(t, b, b + 0.4)))} y2={lerp(105, y + 15, easeOut(seg(t, b, b + 0.4)))} stroke={C.focus} strokeWidth={1.6} />
            <Cell x={300} y={y} w={250} h={30} label={m} stroke={C.focus} o={easeOut(seg(t, b + 0.3, b + 0.6))} />
          </g>
        );
      })}
      <T x={25} y={210} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        a new field's initial-default: set once, never changes
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a stable ID, not a name or a position, is what makes every one of these moves safe." h={250}>
      <Row y={40} label="by position" value="corrupts on insert" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="Iceberg" value="field IDs" valueColor={C.second} k={easeOut(seg(t, 1.0, 1.4))} />
      <Row y={160} label="Delta" value="column mapping" valueColor={C.second} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={220} label="what survives" value="a stable ID" valueColor={C.focus} big k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}
