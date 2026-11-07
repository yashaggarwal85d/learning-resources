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

/** A small square token at (x, y). */
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

const EVENTS: [string, string][] = [
  ['insert', 'order-1 100'],
  ['insert', 'order-2 50'],
  ['update', 'order-1 120'],
  ['insert', 'order-3 75'],
  ['delete', 'order-2'],
];

// 0 · Hook. Five events arrive one after another down a flow on the left. On the right the same events build a table:
// rows appear, order-1's value changes from 100 to 120, order-2 disappears. One thing, seen two ways.
export function Hook({ t }: StepCtx) {
  const at = (i: number) => 0.3 + i * 0.6;
  const seen = (i: number) => t >= at(i) + 0.4;
  return (
    <Svg label="a stream is secretly a table the whole time — what if sql saw it that way?" h={200}>
      <T x={25} y={20} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        a flow
      </T>
      {EVENTS.map(([k, v], i) => (
        <Cell key={i} x={25} y={28 + i * 32} w={200} h={26} label={`${k} ${v}`} o={easeOut(seg(t, at(i), at(i) + 0.3))} stroke={k === 'delete' ? C.cherryText : C.mocha} />
      ))}
      <T x={330} y={20} s={11} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        the same thing, as a table
      </T>
      <rect x={330} y={28} width={225} height={110} rx={6} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {seen(0) && <Cell x={340} y={38} w={205} h={26} label={seen(2) ? 'order-1  120' : 'order-1  100'} stroke={seen(2) && !seen(3) ? C.focus : C.mocha} />}
      {seen(1) && !seen(4) && <Cell x={340} y={70} w={205} h={26} label="order-2  50" />}
      {seen(3) && <Cell x={340} y={seen(4) ? 70 : 102} w={205} h={26} label="order-3  75" />}
      <T x={25} y={196} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.1))}>
        one changing thing, seen two ways
      </T>
    </Svg>
  );
}

// 1 · Setup. The layer built so far, operators and state, draws as a wide block along the bottom. Then a new layer
// drops on top: describe what should happen, over data that keeps changing.
export function Setup({ t }: StepCtx) {
  const top = easeOut(seg(t, 1.4, 2.0));
  return (
    <Svg label="operators and state so far, underneath any particular api" h={200}>
      <Cell x={25} y={130} w={530} h={40} label="operators, state, checkpoints: so far" o={easeOut(seg(t, 0, 0.4))} />
      <Cell x={25} y={lerp(40, 70, top)} w={530} h={40} label="SQL: say what, over a changing table" o={top} stroke={C.focus} f={C.focus} />
      <T x={25} y={36} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        where most people actually work
      </T>
    </Svg>
  );
}

// 2 · Predict. The changing table on the left; an arrow back out to a flow on the right, its slots dashed. On answer
// the verdict lands: three ways, each a trade.
export function PredictChangelogModes({ t, answer }: StepCtx) {
  return (
    <Svg label="a stream of inserts and updates is read as a table — encoded how?" h={200}>
      <rect x={25} y={30} width={200} height={90} rx={6} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0, 0.3))} />
      <Cell x={35} y={40} w={180} h={26} label="order-1  120" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={35} y={78} w={180} h={26} label="order-3  75" o={easeOut(seg(t, 0.2, 0.5))} />
      <Req x1={235} x2={320} y={75} k={easeOut(seg(t, 0.6, 1.1))} />
      {[0, 1, 2].map((i) => (
        <Hole key={i} x={330} y={30 + i * 32} w={225} h={26} o={easeOut(seg(t, 1.0 + i * 0.15, 1.3 + i * 0.15))} />
      ))}
      <AnswerRow y={172} label="ways to write a change" answer={answer} value="three, each a trade" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Three modes. Append: a new row is only ever added. Upsert: order-1's row is replaced by key, 100 swapped for 120.
// Retract: an explicit undo of order-1 100, then a redo of order-1 120.
export function RevealThreeModes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const u = easeOut(seg(t, 1.4, 1.8));
  const sw = easeInOut(seg(t, 1.9, 2.4));
  const r = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="append, upsert, retract — three ways to encode the same changing table" h={200}>
      <T x={25} y={36} s={12} f={C.crema} o={a}>
        append
      </T>
      <Cell x={130} y={20} w={190} h={26} label="+ order-3 75" o={a} stroke={C.focus} />
      <T x={335} y={38} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        only ever adds
      </T>
      <T x={25} y={96} s={12} f={C.crema} o={u}>
        upsert
      </T>
      <Cell x={130} y={80} w={190} h={26} label={sw < 0.5 ? 'order-1 100' : 'order-1 120'} o={u} stroke={sw >= 1 ? C.focus : C.mocha} />
      <T x={335} y={98} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        replaced, by key
      </T>
      <T x={25} y={156} s={12} f={C.crema} o={r}>
        retract
      </T>
      <Cell x={130} y={140} w={190} h={26} label="- order-1 100" o={r} stroke={C.cherryText} f={C.cherryText} />
      <Cell x={330} y={140} w={190} h={26} label="+ order-1 120" o={easeOut(seg(t, 3.4, 3.8))} stroke={C.focus} />
      <T x={130} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        an undo, paired with a redo
      </T>
    </Svg>
  );
}

// 4 · Upsert vs retract. Upsert's messages count out: 4 upserts and 1 delete, leaning on a unique key, drawn as a lock.
// Retract's count out: 2 retracts and 4 adds, no key needed, but its update pair is outlined: two messages for one
// change. Both end on the same final table, ticked.
export function RevealUpsertVsRetract({ t }: StepCtx) {
  const up = Math.floor(easeInOut(seg(t, 0.3, 1.3)) * 5);
  const re = Math.floor(easeInOut(seg(t, 1.8, 3.0)) * 6);
  const upK = ['up', 'up', 'up', 'up', 'del'];
  const reK = ['add', 'add', 'ret', 'add', 'add', 'ret'];
  return (
    <Svg label="the same final table, but retract pays double the messages for an update" h={200}>
      <T x={25} y={34} s={12} f={C.crema}>
        upsert
      </T>
      {upK.slice(0, up).map((k, i) => (
        <Pip key={i} x={130 + i * 22} y={30} s={14} f={k === 'del' ? C.cherryText : C.second} />
      ))}
      <Lock x={250} y={26} k={easeOut(seg(t, 1.2, 1.5))} f={C.focus} />
      <T x={276} y={36} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        4 upserts, 1 delete; a unique key
      </T>
      <T x={25} y={94} s={12} f={C.crema}>
        retract
      </T>
      {reK.slice(0, re).map((k, i) => (
        <Pip key={i} x={130 + i * 22} y={90} s={14} f={k === 'ret' ? C.cherryText : C.focus} />
      ))}
      <rect x={163} y={78} width={44} height={24} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={easeOut(seg(t, 3.0, 3.3))} />
      <T x={276} y={96} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        2 retracts, 4 adds; no key needed
      </T>
      <T x={163} y={124} s={11} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.5))}>
        one update, two messages
      </T>
      <Cell x={25} y={150} w={250} label="final: order-1 120, order-3 75" o={easeOut(seg(t, 3.6, 3.9))} stroke={C.focus} />
      <MiniTick x={286} y={164} k={easeOut(seg(t, 3.9, 4.2))} />
      <T x={310} y={169} s={11} f={C.focus} o={easeOut(seg(t, 4.0, 4.3))}>
        identical, both ways
      </T>
    </Svg>
  );
}

/** Join state over 30 ticks: regular grows by two rows a tick; interval stays under its window of 5. */
const px = (tick: number) => 80 + tick * 15;
function stateLine(kind: 'regular' | 'interval', upto: number) {
  const pts: string[] = [];
  for (let i = 0; i <= upto; i++) {
    const v = kind === 'regular' ? (i + 1) * 2 : Math.min(i + 1, 6) * 2;
    pts.push(`${px(i)},${150 - v * 2}`);
  }
  return pts.join(' ');
}

// 5 · Regular join. Rows from both sides pour into the join's state, and none ever leaves: its line climbs tick after
// tick, never turning down.
export function RevealRegularJoinState({ t }: StepCtx) {
  const upto = Math.floor(easeInOut(seg(t, 0.6, 3.8)) * 29);
  return (
    <Svg label="any future row on either side could still match — state never shrinks" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        both sides kept: any row could still match later
      </T>
      <line x1={80} y1={150} x2={px(29)} y2={150} stroke={C.mocha} strokeWidth={1.2} />
      <T x={25} y={154} s={11} f={C.latte}>
        state
      </T>
      <polyline points={stateLine('regular', upto)} fill="none" stroke={C.cherryText} strokeWidth={2} />
      <T x={px(29)} y={172} s={11} f={C.latte} a="end" o={easeOut(seg(t, 3.6, 3.9))}>
        30 ticks
      </T>
      <T x={25} y={194} s={12} f={C.cherryText} o={easeOut(seg(t, 3.9, 4.3))}>
        nothing ever safe to throw away
      </T>
    </Svg>
  );
}

// 6 · Predict. Two flows meet, but only rows close together in time can match; a window of 5 is drawn. On answer the
// state line flattens.
export function PredictBoundedJoinState({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? Math.floor(easeInOut(seg(s, 0.1, 1.2)) * 29) : 0;
  return (
    <Svg label="a join only matches rows close in time — what happens to its state?" h={200}>
      <rect x={px(0)} y={30} width={px(5) - px(0)} height={20} rx={4} fill={C.focus} opacity={0.2 * easeOut(seg(t, 0.2, 0.6))} />
      <T x={px(5) + 10} y={45} s={11} f={C.focus} o={easeOut(seg(t, 0.3, 0.6))}>
        window 5: only rows this close match
      </T>
      <line x1={80} y1={150} x2={px(29)} y2={150} stroke={C.mocha} strokeWidth={1.2} />
      {v > 0 && <polyline points={stateLine('interval', v)} fill="none" stroke={C.focus} strokeWidth={2} />}
      <AnswerRow y={182} label="its state" answer={answer} value="levels off" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Interval and temporal. The regular line climbs as before; the interval line rises for 5 ticks and goes flat.
// Then a versioned table: three versions of a rate stacked, only the current one kept, and a row matched against it.
export function RevealIntervalTemporal({ t }: StepCtx) {
  const upto = Math.floor(easeInOut(seg(t, 0.3, 2.2)) * 29);
  const ver = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="a window bounds one; a versioned match needs no window at all" h={200}>
      <line x1={80} y1={150} x2={px(29)} y2={150} stroke={C.mocha} strokeWidth={1.2} opacity={1 - ver} />
      <polyline points={stateLine('regular', upto)} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={1 - ver} />
      <polyline points={stateLine('interval', upto)} fill="none" stroke={C.focus} strokeWidth={2} opacity={1 - ver} />
      {ver < 1 && (
        <T x={px(29)} y={142} s={11} f={C.focus} a="end" o={easeOut(seg(t, 2.0, 2.3)) * (1 - ver)}>
          interval: flat
        </T>
      )}
      {ver > 0 && (
        <g opacity={ver}>
          <T x={25} y={30} s={11} f={C.latte}>
            versioned: only the current version kept
          </T>
          <Cell x={25} y={44} w={170} h={26} label="older version" o={0.35} />
          <Cell x={25} y={76} w={170} h={26} label="older version" o={0.35} />
          <Cell x={25} y={108} w={170} h={26} label="current version" stroke={C.focus} />
          <Cell x={360} y={108} w={170} h={26} label="a row, matched" />
        </g>
      )}
      {ver > 0 && <line x1={355} y1={121} x2={lerp(355, 200, easeInOut(seg(t, 3.2, 3.8)))} y2={121} stroke={C.focus} strokeWidth={1.8} />}
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>
        a window bounds one; a version needs none
      </T>
    </Svg>
  );
}

// 8 · Lookup and delta. A lookup join keeps no side of its own: each record reaches out to an outside store and back.
// A delta join goes further, reading the source's own data in place; the separate side copy is crossed out.
export function RevealLookupDelta({ t }: StepCtx) {
  const trip = (t * 0.8) % 1;
  return (
    <Svg label="a lookup reaches out; a delta join reuses the source instead of state" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        lookup: reaches out every time
      </T>
      <Cell x={25} y={34} w={130} label="join" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={400} y={34} w={155} label="outside store" o={easeOut(seg(t, 0.2, 0.5))} />
      {t < 2.2 && <Pip x={trip < 0.5 ? lerp(165, 390, trip * 2) : lerp(390, 165, (trip - 0.5) * 2)} y={48} f={C.second} />}
      <T x={25} y={112} s={11} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        delta join: reuse what the source already holds
      </T>
      <Cell x={25} y={124} w={130} label="join" o={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={400} y={124} w={155} label="the source itself" o={easeOut(seg(t, 2.4, 2.7))} stroke={C.focus} />
      <line x1={160} y1={138} x2={160 + 230 * easeInOut(seg(t, 2.7, 3.2))} y2={138} stroke={C.focus} strokeWidth={1.8} />
      <Cell x={200} y={160} w={150} h={24} label="a copy on the side" o={easeOut(seg(t, 3.3, 3.6))} stroke={C.cherryText} f={C.cherryText} />
      <Cross x={366} y={172} k={easeOut(seg(t, 3.7, 4.0))} />
    </Svg>
  );
}

// 9 · Materialized tables. A freshness dial: asked for 2 minutes, under the threshold of 10, a continuous process keeps
// the table fresh, its arrow looping without stop; asked for 60, a full refresh fires now and then instead.
export function RevealMaterializedPtf({ t }: StepCtx) {
  const spin = (t * 1.2) % 1;
  const tick = Math.floor(t / 1.2) % 2 === 0;
  return (
    <Svg label="freshness drives the refresh mode; a process table function is the escape hatch" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the refresh follows how fresh it was asked to stay; threshold 10
      </T>
      <Cell x={25} y={40} w={170} label="fresh within 2 min" o={easeOut(seg(t, 0.4, 0.7))} stroke={C.focus} />
      <Req x1={200} x2={300} y={54} k={easeOut(seg(t, 0.8, 1.2))} />
      <Cell x={310} y={40} w={160} label="continuous" o={easeOut(seg(t, 1.1, 1.4))} stroke={C.focus} f={C.focus} />
      <circle cx={510} cy={54} r={12} fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="56 20" transform={`rotate(${spin * 360} 510 54)`} opacity={easeOut(seg(t, 1.3, 1.6))} />
      <Cell x={25} y={110} w={170} label="fresh within 60 min" o={easeOut(seg(t, 2.0, 2.3))} />
      <Req x1={200} x2={300} y={124} k={easeOut(seg(t, 2.4, 2.8))} />
      <Cell x={310} y={110} w={160} label="full, now and then" o={easeOut(seg(t, 2.7, 3.0))} />
      <rect x={500} y={114} width={20} height={20} rx={3} fill={C.second} opacity={t > 3.0 && tick ? 0.8 : 0.15} />
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        close to fresh, always running; loose, run occasionally
      </T>
    </Svg>
  );
}

// 10 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="upsert" value="4 upserts, 1 delete" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="retract" value="2 retracts, 4 adds" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={110} label="final tables" value="identical" valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.8))} />
      <Row y={150} label="regular join, 30 ticks" value="never shrank" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={190} label="interval join, window 5" value="levelled off" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <Row y={230} label="freshness 2 vs 60 min" value="continuous, full" k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}

// 11 · Recap. Three lines, one by one; the how-much-state line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['one changing table, several ways to write it', 'every join answers: how much to hold?', 'everything above sits on top, never under'];
  return (
    <Svg label="same table, different encodings; every join answers one question: how much state?" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 1 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
