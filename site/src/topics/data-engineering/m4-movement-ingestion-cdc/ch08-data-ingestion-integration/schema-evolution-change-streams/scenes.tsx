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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

// 0 · Hook. On a Friday the source column's type tag flips to numeric while the sink's stays integer; 19.99 flows down
// the stream and lands at the sink as 20, in cherry, with no error anywhere.
export function Hook({ t }: StepCtx) {
  const re = t >= 0.9;
  const flow = easeInOut(seg(t, 1.4, 2.2));
  const land = t >= 2.2;
  return (
    <Svg
      label="a column is retyped to carry a fraction on a Friday; the sink's own column keeps its old shape, and every fractional amount since arrives rounded away, with nothing raising an error."
      h={220}
    >
      <T x={25} y={22} s={11} f={C.latte}>
        Friday
      </T>
      <Cell x={25} y={30} w={220} label={re ? 'source amount: numeric' : 'source amount: integer'} stroke={re ? C.second : C.mocha} />
      <Cell x={330} y={30} w={220} label="sink amount: integer" />
      <Cell x={25} y={96} w={100} label="19.99" o={easeOut(seg(t, 1.1, 1.4))} stroke={C.second} />
      <Req x1={130} x2={325} y={110} k={flow} />
      {land && <Cell x={330} y={96} w={100} label="20" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.5))} />}
      {t >= 2.8 && (
        <T x={25} y={165} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
          no error, no warning
        </T>
      )}
      {t >= 3.4 && (
        <T x={25} y={200} s={13} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>
          every fraction since: rounded away
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. One row event with id, amount and note; after the drop, the next event has an empty slot where note
// was, and a consumer still expecting it. Once answered, the slot just stays empty.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a dropped column stops appearing in the stream entirely. Does a consumer that expects it get an error, or does nothing happen at all?" h={200}>
      {['id', 'amount', 'note'].map((c, i) => (
        <Cell key={i} x={25 + i * 90} y={30} w={80} label={c} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      {['id', 'amount'].map((c, i) => (
        <Cell key={i} x={25 + i * 90} y={80} w={80} label={c} o={easeOut(seg(t, 0.8 + i * 0.1, 1.1 + i * 0.1))} />
      ))}
      <Hole x={205} y={80} w={80} o={easeOut(seg(t, 1.0, 1.3))} stroke={v > 0 ? C.cherryText : C.mocha} />
      <Cell x={380} y={55} w={170} label="expects note" o={easeOut(seg(t, 1.2, 1.5))} />
      {v > 0 && (
        <T x={380} y={110} s={11} f={C.cherryText} o={v}>
          hears nothing at all
        </T>
      )}
      <AnswerRow y={178} label="it gets" answer={answer} value="nothing at all" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · No DDL event. An ALTER TABLE card; below, what decoding produced for it: BEGIN, an empty cherry gap, COMMIT.
export function RevealNoDDLEvent({ t }: StepCtx) {
  const sql = 'ALTER TABLE: add a column';
  const typed = Math.round(sql.length * seg(t, 0.2, 1.1));
  return (
    <Svg label="an ALTER TABLE statement decodes to an empty transaction: a begin and a commit, with nothing between them. Logical decoding carries no event for the DDL itself." h={200}>
      <rect x={25} y={30} width={300} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      {typed > 0 && (
        <T x={37} y={50} s={12} f={C.crema}>
          {sql.slice(0, typed)}
        </T>
      )}
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        what the decoded stream holds
      </T>
      <Cell x={25} y={108} w={100} label="BEGIN" o={easeOut(seg(t, 1.5, 1.8))} stroke={C.focus} f={C.focus} />
      <Hole x={135} y={108} w={290} o={easeOut(seg(t, 2.0, 2.4))} stroke={C.cherryText} />
      <Cell x={435} y={108} w={110} label="COMMIT" o={easeOut(seg(t, 2.4, 2.7))} stroke={C.focus} f={C.focus} />
      {t >= 3.0 && (
        <T x={280} y={170} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          nothing between them
        </T>
      )}
    </Svg>
  );
}

// 3 · Add and drop, measured. Top: event one has id and amount; event two first carries note 'late add'. Bottom: the
// update carries amount 3000 and no note; the sink's note stays frozen under a lock.
export function RevealAddDropMeasured({ t }: StepCtx) {
  const e2 = easeOut(seg(t, 0.9, 1.3));
  const d = easeOut(seg(t, 2.2, 2.6));
  const sk = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="the real run: a new column appears only on the row event that actually carries it, and a dropped column disappears the same way, with no announcement either time." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        add a column
      </T>
      <Cell x={25} y={30} w={50} label="id" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={80} y={30} w={90} label="amount" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={200} y={30} w={50} label="id" o={e2} />
      <Cell x={255} y={30} w={90} label="amount" o={e2} />
      <Cell x={350} y={30} w={140} label="note: late add" o={easeOut(seg(t, 1.2, 1.6))} stroke={C.second} />
      {t >= 1.6 && (
        <T x={200} y={80} s={11} f={C.second} o={easeOut(seg(t, 1.6, 1.9))}>
          first seen on the next row
        </T>
      )}
      <T x={25} y={112} s={11} f={C.latte} o={d}>
        drop a column
      </T>
      <Cell x={25} y={120} w={50} label="id" o={d} />
      <Cell x={80} y={120} w={130} label="amount: 3000" o={d} />
      <Req x1={215} x2={255} y={134} k={easeOut(seg(t, 2.5, 2.8))} />
      <Cell x={260} y={120} w={130} label="amount: 3000" o={sk} stroke={C.focus} />
      <Cell x={400} y={120} w={140} label="original note" o={sk} />
      <Lock x={548} y={134} k={easeOut(seg(t, 3.2, 3.6))} f={C.latte} />
      {t >= 3.5 && (
        <T x={260} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.5, 3.8))}>
          dropped field: frozen, unreachable
        </T>
      )}
    </Svg>
  );
}

// 4 · Retype mechanism. One row event card: the column name stays; its type tag swaps from integer to bigint with a
// small pulse. Still one ordinary row event.
export function RevealRetypeMechanism({ t }: StepCtx) {
  const sw = t >= 1.6;
  const pulse = seg(t, 1.6, 2.0);
  const sc = 1 + 0.08 * Math.sin(pulse * Math.PI);
  return (
    <Svg label="a retyped column is nothing special to the stream: still one row event, now carrying a different type tag beside the same column name." h={200}>
      <rect x={100} y={40} width={400} height={70} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.4))} />
      <T x={130} y={82} s={15} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        amount
      </T>
      <g transform={`translate(370 75) scale(${sc}) translate(-370 -75)`}>
        <Cell x={300} y={61} w={140} label={sw ? 'bigint' : 'integer'} o={easeOut(seg(t, 0.4, 0.8))} stroke={sw ? C.second : C.mocha} />
      </g>
      <T x={160} y={140} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        same column name
      </T>
      <T x={370} y={140} s={11} f={C.second} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        new type tag
      </T>
      {t >= 3.0 && (
        <T x={300} y={185} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          still one ordinary row event
        </T>
      )}
    </Svg>
  );
}

// 5 · Widening, measured. The value nine billion against an integer's range bar, which it outruns; the stream's tag
// reads bigint, and the widened sink stores the exact value.
export function RevealWideningMeasured({ t }: StepCtx) {
  const v = easeInOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="the real run: a column widened to hold a value no smaller type ever could; a sink that widened to match stored that exact value, nothing lost." h={220}>
      <T x={25} y={34} s={17} f={C.focus}>
        9,000,000,000
      </T>
      <rect x={25} y={52} width={120 * easeOut(seg(t, 0.3, 0.7))} height={10} fill={C.latte} />
      <T x={155} y={62} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        an integer's whole range
      </T>
      <rect x={25} y={72} width={520 * v} height={10} fill={C.second} />
      <Row y={130} label="stream's type tag" value="bigint" valueColor={C.second} k={easeOut(seg(t, 1.9, 2.3))} />
      <Row y={180} label="widened sink stores" value="9,000,000,000" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
      <MiniTick x={25} y={198} k={easeOut(seg(t, 3.4, 3.8))} />
    </Svg>
  );
}

// 6 · Narrowing, measured. numeric 19.99 travels to a sink column left at integer; the write ticks through, the stored
// value reads 20, and the error column reads none.
export function RevealNarrowingMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: a column retyped to carry a fraction; the sink, left at its old narrower type, accepted the write anyway and rounded the fraction away with no error." h={220}>
      <Cell x={25} y={30} w={200} label="numeric: 19.99" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.second} />
      <Req x1={230} x2={325} y={44} k={easeOut(seg(t, 0.7, 1.2))} />
      <Cell x={330} y={30} w={220} label="sink column: integer" o={easeOut(seg(t, 0.4, 0.7))} />
      <MiniTick x={330} y={80} k={easeOut(seg(t, 1.3, 1.6))} />
      <T x={350} y={86} s={11} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        write accepted
      </T>
      <Row y={130} label="stored" value="20" valueColor={C.cherryText} k={easeOut(seg(t, 1.9, 2.3))} />
      <Row y={170} label="error raised" value="none" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.0))} />
      {t >= 3.4 && (
        <T x={25} y={208} s={11} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>
          the fraction, rounded away on the spot
        </T>
      )}
    </Svg>
  );
}

// 7 · Re-snapshot. A block of old rows that cannot be reread under the new shape; widen and reapply are tried and
// crossed out; an incremental snapshot then sweeps the block chunk by chunk.
export function RevealReSnapshot({ t }: StepCtx) {
  const sweep = 10 * easeInOut(seg(t, 2.6, 3.9));
  return (
    <Svg
      label="when a retyped column's own old rows can't be reinterpreted under the new shape at all, widening or reapplying a type isn't enough; only a fresh incremental snapshot of that table repairs it."
      h={220}
    >
      <T x={25} y={22} s={11} f={C.latte}>
        old rows, unreadable under the new shape
      </T>
      {Array.from({ length: 50 }, (_, i) => {
        const c = i % 10;
        const r = Math.floor(i / 10);
        const done = c < sweep;
        return (
          <rect
            key={i}
            x={25 + c * 30}
            y={32 + r * 24}
            width={24}
            height={18}
            rx={2}
            fill={done ? C.focus : C.cocoa}
            stroke={done ? C.focus : C.cherryText}
            strokeWidth={1}
            opacity={easeOut(seg(t, 0, 0.5))}
          />
        );
      })}
      <Cell x={380} y={32} w={170} label="widen it" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cross x={365} y={46} k={easeOut(seg(t, 1.0, 1.3))} />
      <Cell x={380} y={76} w={170} label="reapply the type" o={easeOut(seg(t, 1.3, 1.6))} />
      <Cross x={365} y={90} k={easeOut(seg(t, 1.7, 2.0))} />
      <Cell x={380} y={124} w={170} label="fresh snapshot" o={easeOut(seg(t, 2.2, 2.5))} stroke={C.focus} f={C.focus} />
      {t >= 4.0 && (
        <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.3))}>
          that one table, chunk by chunk
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Three changes with arrows to what they do to a reader; the narrowing row in cherry.
export function Recap({ t }: StepCtx) {
  const qs = ['add or drop', 'widen a type', 'narrow a type'];
  const as = ['shows up on a row event', 'a reader keeping up survives', 'a stale reader is punished'];
  return (
    <Svg
      label="an added or dropped column shows up or vanishes only on its own row event, never announced; a widened type survives a reader that keeps up, a narrowed one punishes a reader that doesn't."
      h={260}
    >
      {qs.map((q, i) => (
        <g key={i}>
          <Cell x={25} y={30 + i * 56} w={180} label={q} o={easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8))} />
          <Req x1={210} x2={288} y={44 + i * 56} k={easeOut(seg(t, 0.4 + i * 0.8, 0.8 + i * 0.8))} />
          <Cell x={295} y={30 + i * 56} w={260} label={as[i]} o={easeOut(seg(t, 0.6 + i * 0.8, 0.9 + i * 0.8))} stroke={i === 2 ? C.cherryText : C.focus} />
        </g>
      ))}
      {t >= 3.0 && (
        <T x={300} y={225} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          nothing is ever announced
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. A new schema version heads for the sink; a check gate sits between them. Once answered, the gate lights
// and ticks before any row is written.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a new column shows up in a stream your sink has never seen before. Something has to decide if this is even allowed before anyone writes a row. Whose job is that?" h={200}>
      <Cell x={25} y={50} w={150} label="new schema" o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      <Req x1={180} x2={245} y={64} k={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={250} y={50} w={160} label="registry check" o={easeOut(seg(t, 0.6, 0.9))} stroke={v > 0 ? C.focus : C.mocha} />
      <Req x1={415} x2={445} y={64} k={easeOut(seg(t, 0.9, 1.2))} />
      <Cell x={450} y={50} w={100} label="sink" o={easeOut(seg(t, 0.8, 1.1))} />
      <MiniTick x={324} y={96} k={v} />
      {v > 0 && (
        <T x={250} y={128} s={11} f={C.focus} o={v}>
          before any row is written
        </T>
      )}
      <AnswerRow y={178} label="it decides" answer={answer} value="a schema registry" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
