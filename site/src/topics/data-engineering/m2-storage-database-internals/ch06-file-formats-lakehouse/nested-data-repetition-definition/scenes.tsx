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

const SKU = ['A1', 'A2', 'A3', 'null', 'B1'];
const NOTE = ['gift', 'null', 'fragile', 'null', 'urgent'];
const REP = [0, 1, 1, 0, 0];
const SDEF = [1, 1, 1, 0, 1];
const NDEF = [2, 1, 2, 0, 2];
const REC_OF = [0, 0, 0, 1, 2];

// 1 · Hook. Three order cards; their values shred into the sku and note columns row by row, the empty order leaving a
// null marker; then a tick: rebuilt exactly.
export function Hook({ t }: StepCtx) {
  const row = (i: number) => easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3));
  return (
    <Svg label="3 orders, 1 with 3 items, 1 with none, 1 with 1 — shredded into 2 columns, reassembled exactly." h={235}>
      {['100: A1, A2, A3', '200: no items', '300: B1'].map((l, i) => (
        <Cell
          key={l}
          x={25}
          y={55 + i * 40}
          w={180}
          label={l}
          o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))}
          stroke={[0, 1, 2, 3, 4].some((r) => REC_OF[r] === i && row(r) > 0 && row(r) < 1) ? C.focus : C.mocha}
        />
      ))}
      <T x={260} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        sku
      </T>
      <T x={360} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        note
      </T>
      {SKU.map((s, i) => (
        <g key={i} opacity={row(i)}>
          <Cell x={260} y={52 + i * 30} w={80} h={24} label={s} f={s === 'null' ? C.latte : C.crema} />
          <Cell x={360} y={52 + i * 30} w={110} h={24} label={NOTE[i]} f={NOTE[i] === 'null' ? C.latte : C.crema} />
        </g>
      ))}
      <MiniTick x={490} y={200} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={25} y={220} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        flattened, then rebuilt exactly
      </T>
    </Svg>
  );
}

// 2 · Predict. The flattened sku values in a line; after the answer the last one slides right and a null marker for
// order 200 drops into the gap.
export function PredictSkuOrder({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="order 200 has no items at all. Does its row just vanish from the sku column?" h={200}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the sku column, flattened
      </T>
      {['A1', 'A2', 'A3', 'B1'].map((l, i) => (
        <Cell key={l} x={25 + (i === 3 ? lerp(3, 4, v) : i) * 80} y={55} w={68} label={l} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} />
      ))}
      <Cell x={265} y={lerp(40, 55, v)} w={68} label="null" stroke={C.focus} f={C.focus} o={v} />
      <AnswerRow y={145} label="order 200 vanishes?" answer={answer} value="no, one marker" k={easeOut(seg(t, 1.1, 1.6))} />
      <Verdict answer={answer} y={188} text="an empty list still writes once" />
    </Svg>
  );
}

/** A level cell: a small boxed digit with its own stroke. */
function Lv({ x, y, v, o, stroke = C.mocha }: { x: number; y: number; v: number; o: number; stroke?: string }) {
  return <Cell x={x} y={y} w={34} h={24} label={String(v)} o={o} stroke={stroke} />;
}

// 3 · Repetition level. The sku values, then each one's repetition level in turn; every 0 draws a record boundary above
// its row; the two meanings are labelled.
export function RevealRepetitionLevel({ t }: StepCtx) {
  const r = (i: number) => easeOut(seg(t, 1.1 + i * 0.3, 1.4 + i * 0.3));
  return (
    <Svg label="a repetition level per value: 0 starts a new record, 1 means the item repeated." h={225}>
      <T x={25} y={42} s={12} f={C.latte}>
        sku
      </T>
      <T x={120} y={42} s={12} f={C.latte}>
        rep
      </T>
      {SKU.map((s, i) => (
        <g key={i}>
          <Cell x={25} y={52 + i * 30} w={80} h={24} label={s} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))} f={s === 'null' ? C.latte : C.crema} />
          <Lv x={115} y={52 + i * 30} v={REP[i]} o={r(i)} stroke={REP[i] === 0 ? C.focus : C.mocha} />
          {REP[i] === 0 && <rect x={20} y={48 + i * 30} width={140 * r(i)} height={2} fill={C.focus} />}
        </g>
      ))}
      <T x={200} y={69} s={12} f={C.focus} o={r(0)}>
        0: a new record starts
      </T>
      <T x={200} y={99} s={12} f={C.crema} o={r(1)}>
        1: the same list, again
      </T>
      <T x={200} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        a 0 is the only boundary signal
      </T>
    </Svg>
  );
}

// 4 · Null definition level. The definition levels land; order 200's null row lights with its 0: empty, not absent.
export function RevealNullDefLevel({ t }: StepCtx) {
  const hi = easeOut(seg(t, 1.8, 2.2));
  return (
    <Svg label="order 200's empty item list gets one marker row: definition level 0." h={225}>
      <T x={25} y={42} s={12} f={C.latte}>
        sku
      </T>
      <T x={120} y={42} s={12} f={C.latte}>
        def
      </T>
      {SKU.map((s, i) => (
        <g key={i}>
          <Cell x={25} y={52 + i * 30} w={80} h={24} label={s} f={s === 'null' ? C.latte : C.crema} stroke={i === 3 && hi > 0 ? C.focus : C.mocha} />
          <Lv x={115} y={52 + i * 30} v={SDEF[i]} o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))} stroke={i === 3 && hi > 0 ? C.focus : C.mocha} />
        </g>
      ))}
      <T x={200} y={159} s={13} f={C.focus} o={hi}>
        order 200: def 0
      </T>
      <T x={200} y={190} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        the list was there, just empty
      </T>
    </Svg>
  );
}

// 5 · Predict. A list box holds an item box holding a note box; both outer boxes can be missing; the answer: three settings.
export function PredictNoteLevels({ t, answer }: StepCtx) {
  const g = 0.5 + 0.5 * Math.sin(t * 5);
  return (
    <Svg label="note can be missing on its own, and so can the whole item. How many definition levels?" h={200}>
      <rect x={25} y={40} width={550} height={80} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={35} y={58} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        items list
      </T>
      <rect x={140} y={50} width={420} height={60} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={150} y={68} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        one item
      </T>
      <rect x={260} y={62} width={280} height={36} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1 + g} strokeDasharray="5 3" opacity={easeOut(seg(t, 0.7, 1.0))} />
      <T x={400} y={85} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        note, may be missing
      </T>
      <AnswerRow y={150} label="settings needed" answer={answer} value="three: 0, 1, 2" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={190} text="one per situation" />
    </Svg>
  );
}

const DEFC = [C.cherryText, C.second, C.focus];

// 6 · Note definition levels. The note column's levels land one by one, each stroked by what it says; the three meanings
// label in as each first appears.
export function RevealNoteDefLevels({ t }: StepCtx) {
  const d = (i: number) => easeOut(seg(t, 0.5 + i * 0.4, 0.8 + i * 0.4));
  return (
    <Svg label="2 means item and note both present, 1 means item present but note missing, 0 means no item." h={235}>
      <T x={25} y={42} s={12} f={C.latte}>
        note
      </T>
      <T x={130} y={42} s={12} f={C.latte}>
        def
      </T>
      {NOTE.map((n, i) => (
        <g key={i}>
          <Cell x={25} y={52 + i * 30} w={95} h={24} label={n} f={n === 'null' ? C.latte : C.crema} />
          <Lv x={130} y={52 + i * 30} v={NDEF[i]} o={d(i)} stroke={d(i) > 0 ? DEFC[NDEF[i]] : C.mocha} />
        </g>
      ))}
      <T x={200} y={69} s={12} f={C.focus} o={d(0)}>
        2: item and note present
      </T>
      <T x={200} y={99} s={12} f={C.second} o={d(1)}>
        1: item there, note missing
      </T>
      <T x={200} y={159} s={12} f={C.cherryText} o={d(3)}>
        0: no item at all
      </T>
      <T x={200} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        one number, two ancestors
      </T>
    </Svg>
  );
}

// 7 · Reassembly. A cursor walks the two columns in lock-step; each 0 opens a new record card on the right, and each
// value drops into the card being built.
export function RevealReassembly({ t }: StepCtx) {
  const cur = easeInOut(seg(t, 0.4, 2.8)) * 4.99;
  const at = (i: number) => (cur >= i ? 1 : 0);
  return (
    <Svg label="reassembly walks both streams in lock-step; a repetition level of 0 is the only record boundary." h={235}>
      {SKU.map((s, i) => (
        <g key={i}>
          <Cell x={25} y={52 + i * 30} w={60} h={24} label={s} f={s === 'null' ? C.latte : C.crema} stroke={Math.floor(cur) === i ? C.focus : C.mocha} />
          <Cell x={95} y={52 + i * 30} w={90} h={24} label={NOTE[i]} f={NOTE[i] === 'null' ? C.latte : C.crema} stroke={Math.floor(cur) === i ? C.focus : C.mocha} />
          <Lv x={195} y={52 + i * 30} v={REP[i]} o={1} stroke={REP[i] === 0 && Math.floor(cur) === i ? C.focus : C.mocha} />
        </g>
      ))}
      {['100', '200', '300'].map((r, j) => (
        <Cell key={r} x={290} y={52 + j * 40} w={56} h={26} label={r} o={at([0, 3, 4][j])} stroke={C.second} />
      ))}
      {['A1', 'A2', 'A3'].map((s, i) => (
        <Cell key={s} x={356 + i * 46} y={52} w={40} h={26} label={s} o={at(i)} />
      ))}
      <g opacity={at(3)}>
        <rect x={356} y={92} width={86} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" />
        <T x={399} y={109.5} s={12} f={C.latte} a="middle">
          empty
        </T>
      </g>
      <Cell x={356} y={132} w={40} h={26} label="B1" o={at(4)} />
      <T x={300} y={225} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        no tree: a 0 starts the next record
      </T>
    </Svg>
  );
}

// 8 · Arrow offsets. The offsets buffer and the validity bitmap land; each pair of neighbouring offsets is subtracted and
// its item count drops out; the child sku values bracket by record.
export function RevealArrowOffsets({ t }: StepCtx) {
  const OFF = [0, 3, 3, 4];
  const CNT = [3, 0, 1];
  return (
    <Svg label="the same 3 records as one offsets buffer plus a validity bitmap, not one shared level stream." h={240}>
      <T x={25} y={68} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        offsets
      </T>
      {OFF.map((o, i) => (
        <Cell key={i} x={150 + i * 70} y={52} w={50} h={24} label={String(o)} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))} stroke={C.second} />
      ))}
      {CNT.map((c, i) => (
        <T key={i} x={210 + i * 70} y={100} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.8 + i * 0.4, 2.1 + i * 0.4))}>
          {String(c)}
        </T>
      ))}
      <T x={25} y={100} s={12} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
        next minus this
      </T>
      <T x={25} y={138} s={12} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        list valid
      </T>
      {[1, 1, 1].map((v, i) => (
        <Cell key={i} x={150 + i * 70} y={122} w={50} h={24} label={String(v)} o={easeOut(seg(t, 0.9 + i * 0.1, 1.2 + i * 0.1))} />
      ))}
      <T x={25} y={188} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        skus
      </T>
      {['A1', 'A2', 'A3', 'B1'].map((s, i) => (
        <Cell key={s} x={150 + i * 70} y={172} w={50} h={24} label={s} o={easeOut(seg(t, 1.3 + i * 0.1, 1.6 + i * 0.1))} />
      ))}
      <rect x={150} y={202} width={190 * easeOut(seg(t, 3.0, 3.4))} height={3} fill={C.focus} />
      <rect x={360} y={202} width={50 * easeOut(seg(t, 3.2, 3.6))} height={3} fill={C.focus} />
      <T x={300} y={230} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        a buffer pair for this one nesting level
      </T>
    </Svg>
  );
}

// 9 · ORC. The present and length streams land; Arrow's derived counts land beneath; each length is joined to its count
// and ticked.
export function RevealOrcPresent({ t }: StepCtx) {
  const ROWS: [string, number[], string][] = [
    ['ORC present', [1, 1, 1], C.mocha],
    ['ORC length', [3, 0, 1], C.focus],
    ["Arrow's counts", [3, 0, 1], C.second],
  ];
  return (
    <Svg label="the same structure again: a present stream and a length stream, the same counts as offsets." h={230}>
      {ROWS.map(([l, vs, st], r) => (
        <g key={l} opacity={easeOut(seg(t, 0.2 + r * 0.8, 0.5 + r * 0.8))}>
          <T x={25} y={68 + r * 48} s={12} f={C.latte}>
            {l}
          </T>
          {vs.map((v, i) => (
            <Cell key={i} x={200 + i * 80} y={52 + r * 48} w={50} h={24} label={String(v)} stroke={st} />
          ))}
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={225 + i * 80} y1={124} x2={225 + i * 80} y2={124 + 24 * easeOut(seg(t, 2.4 + i * 0.3, 2.7 + i * 0.3))} stroke={C.focus} strokeWidth={2} />
          <MiniTick x={258 + i * 80} y={138} k={easeOut(seg(t, 2.7 + i * 0.3, 3.0 + i * 0.3))} />
        </g>
      ))}
      <T x={300} y={210} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        the same counts, stored directly
      </T>
    </Svg>
  );
}

// 10 · Recap. One row per format, then the cost every empty list still pays.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="levels, offsets, and present/length streams all encode the identical structural fact." h={240}>
      <Row y={45} label="Dremel" value="levels on every value" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={95} label="Arrow" value="offsets per level" k={easeOut(seg(t, 1.6, 2.0))} />
      <Row y={145} label="ORC" value="present and length" k={easeOut(seg(t, 2.6, 3.0))} />
      <T x={300} y={210} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        nesting isn't free: 179 entries for 159 items
      </T>
    </Svg>
  );
}
