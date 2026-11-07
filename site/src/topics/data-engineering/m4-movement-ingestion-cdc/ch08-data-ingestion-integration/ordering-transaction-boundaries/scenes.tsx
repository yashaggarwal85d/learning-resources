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

/** A small unlabelled event square at (x, y). */
function Ev({ x, y, o = 1, f = C.latte, s = 20 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x} y={y} width={s} height={s} rx={3} fill={f} opacity={o} />;
}

// 0 · Hook. One commit holds an order and its three items. Split onto two topics, the items lane drains to the join
// first and turns cherry as orphans; the order arrives after.
export function Hook({ t }: StepCtx) {
  const c = easeOut(seg(t, 0.1, 0.5));
  const split = easeOut(seg(t, 0.8, 1.1));
  const it = (i: number) => easeInOut(seg(t, 1.2 + i * 0.2, 1.9 + i * 0.2));
  const orphan = t >= 2.3;
  const ord = easeInOut(seg(t, 3.0, 3.7));
  return (
    <Svg label="one commit inserts an order and its items; the consumer reads the items topic first, and a join drops all three items as orphans." h={220}>
      <rect x={25} y={22} width={260} height={40} rx={5} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 3" opacity={c} />
      <Cell x={33} y={28} w={76} label="order" o={c} />
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={117 + i * 56} y={28} w={48} label="item" o={c} />
      ))}
      <T x={300} y={47} s={11} f={C.focus} o={c}>
        one commit
      </T>
      <T x={25} y={100} s={11} f={C.latte} o={split}>
        orders topic
      </T>
      <T x={25} y={145} s={11} f={C.latte} o={split}>
        items topic
      </T>
      <line x1={140} y1={95} x2={420} y2={95} stroke={C.mocha} strokeWidth={1} opacity={split} />
      <line x1={140} y1={140} x2={420} y2={140} stroke={C.mocha} strokeWidth={1} opacity={split} />
      <Ev x={lerp(140, 380, ord)} y={84} o={split} f={C.focus} s={22} />
      {[0, 1, 2].map((i) => (
        <Ev key={i} x={lerp(140 + i * 28, 320 + i * 28, it(i))} y={130} o={split} f={orphan ? C.cherryText : C.latte} />
      ))}
      <Cell x={430} y={104} w={120} label="join" o={split} stroke={orphan ? C.cherryText : C.mocha} />
      {orphan && (
        <T x={25} y={195} s={13} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.7))}>
          three items, no order yet: orphans
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Left, one row's three events, each carrying the same key. Right, one commit cut into two lanes with
// nothing shared between them. Once answered, the key ties the left together; the right gets a cross.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="does order break the same way for one row's own changes as it does for a transaction spanning two tables, or differently?" h={200}>
      <T x={25} y={24} s={11} f={C.latte}>
        one row's events
      </T>
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={25 + i * 80} y={32} w={70} label="key 1" o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))} stroke={v > 0 ? C.focus : C.mocha} />
      ))}
      {v > 0 && <line x1={60} y1={72} x2={60 + 160 * v} y2={72} stroke={C.focus} strokeWidth={2.5} />}
      <T x={320} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        a split commit
      </T>
      <Cell x={320} y={32} w={110} label="orders" o={easeOut(seg(t, 0.7, 1.0))} />
      <Cell x={320} y={84} w={110} label="items" o={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={375} y1={62} x2={375} y2={84} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.0, 1.3))} />
      <Cross x={460} y={73} k={v} />
      <AnswerRow y={178} label="they break" answer={answer} value="differently" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Per-key mechanism. One event card with its key stamped on; then a mixed stream of two keys' events and, beneath
// it, the two per-key queues, each in its own order.
export function RevealPerKeyMechanism({ t }: StepCtx) {
  const card = easeOut(seg(t, 0.2, 0.6));
  const stamp = easeOutBack(seg(t, 0.8, 1.2));
  const mix = ['a1', 'b1', 'b2', 'a2', 'b3', 'a3'];
  return (
    <Svg label="every change event is keyed by its row's own primary key, and a stream ordered within a key keeps every change to that one row in order." h={200}>
      <rect x={25} y={20} width={200} height={70} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={card} />
      <T x={40} y={44} s={12} f={C.crema} o={card}>
        UPDATE, value a2
      </T>
      <T x={40} y={72} s={12} f={C.focus} o={clamp(stamp, 0, 1)}>
        key: 1
      </T>
      <T x={260} y={24} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        arrival order
      </T>
      {mix.map((m, i) => (
        <Cell key={i} x={260 + i * 48} y={32} w={42} label={m} o={easeOut(seg(t, 1.5 + i * 0.1, 1.8 + i * 0.1))} />
      ))}
      {['a', 'b'].map((k, r) => (
        <g key={r}>
          <T x={25} y={134 + r * 40} s={11} f={C.latte} o={easeOut(seg(t, 2.4 + r * 0.3, 2.7 + r * 0.3))}>
            {`key ${r + 1}`}
          </T>
          {[1, 2, 3].map((n, j) => (
            <Cell key={j} x={90 + j * 56} y={116 + r * 40} w={48} label={`${k}${n}`} o={easeOut(seg(t, 2.5 + r * 0.3 + j * 0.15, 2.8 + r * 0.3 + j * 0.15))} stroke={C.focus} />
          ))}
        </g>
      ))}
      {t >= 3.6 && (
        <T x={290} y={160} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
          each key: in the order it happened
        </T>
      )}
    </Svg>
  );
}

// 3 · Per-key, measured. Nine real updates arrive scrambled across three keys; split by key, each queue reads a1-a3,
// b1-b3, c1-c3, each ticked in commit order.
export function RevealPerKeyMeasured({ t }: StepCtx) {
  const mix = ['b1', 'a1', 'c1', 'c2', 'a2', 'b2', 'a3', 'c3', 'b3'];
  return (
    <Svg label="the real run: three keys updated three times each, deliberately interleaved; each key's own queue lists its values in exactly commit order." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        arrival, scrambled
      </T>
      {mix.map((m, i) => (
        <Cell key={i} x={25 + i * 58} y={30} w={50} label={m} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      {['a', 'b', 'c'].map((k, r) => (
        <g key={r}>
          <T x={25} y={104 + r * 40} s={11} f={C.latte} o={easeOut(seg(t, 1.4 + r * 0.4, 1.7 + r * 0.4))}>
            {`key ${r + 1}`}
          </T>
          {[1, 2, 3].map((n, j) => (
            <Cell key={j} x={90 + j * 64} y={86 + r * 40} w={54} label={`${k}${n}`} o={easeOut(seg(t, 1.5 + r * 0.4 + j * 0.12, 1.8 + r * 0.4 + j * 0.12))} stroke={C.focus} />
          ))}
          <MiniTick x={290} y={96 + r * 40} k={easeOut(seg(t, 2.0 + r * 0.4, 2.4 + r * 0.4))} />
        </g>
      ))}
      {t >= 3.4 && (
        <T x={330} y={144} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.7))}>
          every key: commit order
        </T>
      )}
    </Svg>
  );
}

// 4 · Cross-table mechanism. One commit forks to two topics; the consumer's two read arrows have no required order.
export function RevealCrossTableMechanism({ t }: StepCtx) {
  const f = easeOut(seg(t, 0.6, 1.2));
  const r = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="each table goes to its own topic, so one commit across two tables becomes two separate deliveries a consumer can read in either order." h={200}>
      <Cell x={25} y={76} w={140} label="one commit" o={easeOut(seg(t, 0.1, 0.4))} stroke={C.focus} />
      {f > 0 && <line x1={170} y1={90} x2={lerp(170, 225, f)} y2={lerp(90, 54, f)} stroke={C.latte} strokeWidth={1.6} />}
      {f > 0 && <line x1={170} y1={90} x2={lerp(170, 225, f)} y2={lerp(90, 134, f)} stroke={C.latte} strokeWidth={1.6} />}
      <Cell x={230} y={40} w={150} label="orders topic" o={f} />
      <Cell x={230} y={120} w={150} label="items topic" o={f} />
      {r > 0 && <line x1={385} y1={54} x2={lerp(385, 435, r)} y2={lerp(54, 88, r)} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" />}
      {r > 0 && <line x1={385} y1={134} x2={lerp(385, 435, r)} y2={lerp(134, 100, r)} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 3" />}
      <Cell x={440} y={80} w={110} label="consumer" o={easeOut(seg(t, 1.4, 1.7))} />
      {t >= 3.0 && (
        <T x={25} y={185} s={13} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>
          two deliveries, no required order
        </T>
      )}
    </Svg>
  );
}

// 5 · Cross-table, measured. The items queue drains first: each of its three items lands at the consumer looking for
// order 9001 and turns orphan; the orders queue's one event still waits, untouched.
export function RevealCrossTableMeasured({ t }: StepCtx) {
  const d = (i: number) => easeOut(seg(t, 0.8 + i * 0.6, 1.2 + i * 0.6));
  return (
    <Svg label="the real run: the identical commit, split into two queues; draining the items queue before the orders queue finds every item an orphan." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        items queue
      </T>
      {[0, 1, 2].map((i) => (d(i) < 1 ? <Cell key={i} x={25 + i * 70} y={30} w={60} label="item" o={1 - d(i)} /> : <Hole key={i} x={25 + i * 70} y={30} w={60} />))}
      <T x={25} y={102} s={11} f={C.latte}>
        orders queue, untouched
      </T>
      <Cell x={25} y={110} w={150} label="order 9001" />
      <T x={330} y={22} s={11} f={C.latte}>
        the consumer sees
      </T>
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={330} y={30 + i * 40} w={220} label="item → 9001: unknown" o={d(i)} stroke={C.cherryText} />
      ))}
      {t >= 2.9 && (
        <T x={25} y={195} s={13} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.3))}>
          3 of 3 items orphaned
        </T>
      )}
    </Svg>
  );
}

// 6 · Transaction metadata. A BEGIN marker, the order, three items, an END marker; the END card opens beneath with
// its id, its total count, and its count per table.
export function RevealTransactionMetadata({ t }: StepCtx) {
  const seq: [string, number][] = [
    ['BEGIN', 80],
    ['order', 64],
    ['item', 52],
    ['item', 52],
    ['item', 52],
    ['END', 70],
  ];
  let x = 25;
  const end = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="a begin and end event frame every commit; the end carries a total count and a count per table, built from the slot's own real position." h={200}>
      {seq.map(([n, w], i) => {
        const cx = x;
        x += w + 8;
        const marker = n === 'BEGIN' || n === 'END';
        return <Cell key={i} x={cx} y={30} w={w} label={n} o={easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25))} stroke={marker ? C.focus : C.mocha} f={marker ? C.focus : C.crema} />;
      })}
      {end > 0 && <line x1={x - 43} y1={60} x2={x - 43} y2={84} stroke={C.focus} strokeWidth={1.5} opacity={end} />}
      <rect x={300} y={86} width={250} height={96} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={end} />
      {['id: txID:LSN', 'event_count: 4', 'orders: 1', 'items: 3'].map((l, i) => (
        <T key={i} x={316} y={108 + i * 21} s={12} f={i === 1 ? C.focus : C.crema} o={easeOut(seg(t, 2.5 + i * 0.3, 2.8 + i * 0.3))}>
          {l}
        </T>
      ))}
    </Svg>
  );
}

// 7 · Reassembly, measured. Events arrive items-first and are held in a transaction buffer while the held count climbs;
// at four of four, matching the END count, the join releases with zero orphans.
export function RevealReassemblyMeasured({ t }: StepCtx) {
  const ins = (i: number) => easeOut(seg(t, 0.4 + i * 0.5, 0.7 + i * 0.5));
  const held = [0, 1, 2, 3].filter((i) => ins(i) >= 1).length;
  const rel = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="the real run: a consumer buffers by transaction and waits for the end's own count before joining; the same split commit now joins with zero orphans." h={220}>
      <T x={25} y={32} s={11} f={C.latte}>
        held by transaction
      </T>
      <rect x={25} y={40} width={330} height={44} rx={5} fill="none" stroke={held === 4 ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray="5 3" />
      {['item', 'item', 'item', 'order 9002'].map((n, i) => (
        <Cell key={i} x={35 + i * 62} y={48} w={i === 3 ? 120 : 54} label={n} o={ins(i)} stroke={i === 3 ? C.focus : C.mocha} />
      ))}
      <Row y={130} label="held" value={`${held} of 4`} valueColor={held === 4 ? C.focus : C.crema} k={easeOut(seg(t, 0.3, 0.6))} />
      <Req x1={360} x2={425} y={62} k={rel} f={C.focus} />
      <Cell x={430} y={48} w={120} label="join" o={rel} stroke={C.focus} />
      {t >= 3.3 && (
        <T x={25} y={195} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
          joined: 0 orphans
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Two rows: one row's key keeps its order with nothing extra; a commit across tables needs a consumer that
// waits for the END count.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a key's own order survives on its own; a commit across tables does not, until a consumer buffers by transaction and waits for its own end count." h={260}>
      <Cell x={25} y={40} w={210} label="one row" o={easeOut(seg(t, 0.2, 0.6))} />
      <Req x1={240} x2={318} y={54} k={easeOut(seg(t, 0.5, 0.9))} />
      <Cell x={325} y={40} w={230} label="its key: nothing extra" o={easeOut(seg(t, 0.8, 1.1))} stroke={C.focus} />
      <Cell x={25} y={120} w={210} label="a commit across tables" o={easeOut(seg(t, 1.4, 1.8))} stroke={C.cherryText} />
      <Req x1={240} x2={318} y={134} k={easeOut(seg(t, 1.7, 2.1))} />
      <Cell x={325} y={120} w={230} label="wait for the END count" o={easeOut(seg(t, 2.0, 2.3))} stroke={C.focus} />
      {t >= 3.0 && (
        <T x={300} y={215} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
          nothing settled until the count matches
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. Three topics, each in order inside itself, with no link between them. Once answered, the consumer at the
// right lights and a bracket gathers all three lanes into it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const names = ['orders', 'items', 'payments'];
  return (
    <Svg label="a transaction spans several topics, and Kafka itself gives no guarantee across them. Whose job is it to make that transaction atomic again?" h={200}>
      {names.map((n, r) => (
        <g key={r} opacity={easeOut(seg(t, 0.1 + r * 0.2, 0.4 + r * 0.2))}>
          <T x={25} y={34 + r * 34} s={11} f={C.latte}>
            {n}
          </T>
          {[0, 1, 2].map((j) => (
            <Ev key={j} x={110 + j * 30} y={20 + r * 34} />
          ))}
          <MiniTick x={210} y={26 + r * 34} k={easeOut(seg(t, 0.6 + r * 0.2, 0.9 + r * 0.2))} />
        </g>
      ))}
      {v > 0 && <path d={`M240 26 h${40 * v} v68 h-${40 * v}`} fill="none" stroke={C.focus} strokeWidth={2} />}
      {v > 0 && <Req x1={282} x2={395} y={60} k={v} f={C.focus} />}
      <Cell x={400} y={46} w={150} label="the consumer" o={easeOut(seg(t, 0.9, 1.2))} stroke={v > 0 ? C.focus : C.mocha} />
      <AnswerRow y={178} label="whose job" answer={answer} value="the consumer's" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
