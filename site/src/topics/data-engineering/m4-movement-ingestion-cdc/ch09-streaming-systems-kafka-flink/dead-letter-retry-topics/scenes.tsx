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

/** A retry loop mark: a small circular arrow at (x, y), turned by `r`. */
function Spin({ x, y, r, o = 1 }: { x: number; y: number; r: number; o?: number }) {
  return (
    <g opacity={o} transform={`rotate(${r * 360} ${x} ${y})`}>
      <path d={`M${x + 9} ${y} a9 9 0 1 1 -3 -6.7`} fill="none" stroke={C.cherryText} strokeWidth={2} />
      <path d={`M${x + 7} ${y - 11} l0 6 l-6 0`} fill="none" stroke={C.cherryText} strokeWidth={2} />
    </g>
  );
}

/** A record cell for one order, `poison` drawn in cherry. */
function Rec({ x, y, n, o = 1, poison = false, w = 86 }: { x: number; y: number; n: string; o?: number; poison?: boolean; w?: number }) {
  return <Cell x={x} y={y} w={w} label={n} o={o} stroke={poison ? C.cherryText : C.mocha} f={poison ? C.cherryText : C.crema} />;
}

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

const ORD = ['order-1', 'order-2', 'order-3', 'order-4', 'order-5'];

// 0 · Hook. Orders file toward the consumer; order-1 and order-2 go through; order-3 sticks at the door and spins,
// retried in place, while order-4, order-5 and a growing backlog stop behind it.
export function Hook({ t }: StepCtx) {
  const flow = easeInOut(seg(t, 0.2, 1.4));
  const back = Math.floor(easeInOut(seg(t, 2.0, 4.4)) * 8);
  return (
    <Svg label="one malformed record blocks every record behind it, retried in place, forever" h={200}>
      <rect x={474} y={50} width={86} height={48} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={517} y={42} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        consumer
      </T>
      {ORD.map((n, i) => {
        const x0 = 384 - i * 86;
        const x = i < 2 ? lerp(x0, x0 + 260, flow) : lerp(x0, x0 + 172, flow);
        const o = i < 2 ? 1 - easeOut(seg(flow, 0.1, 0.4)) : easeOut(seg(t, 0, 0.3));
        if (o <= 0) return null;
        return <Rec key={n} x={x} y={60} n={n} poison={i === 2} o={o} w={80} />;
      })}
      <Spin x={517} y={74} r={t * 1.2} o={easeOut(seg(t, 1.4, 1.7))} />
      {Array.from({ length: back }, (_, i) => (
        <rect key={i} x={190 - i * 22} y={118} width={16} height={16} rx={3} fill={C.mocha} />
      ))}
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        the backlog behind it, growing
      </T>
      <T x={25} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>
        waiting on a retry that never succeeds
      </T>
    </Svg>
  );
}

// 1 · Setup. The earlier fix, ticked: a repeat gets caught eventually. Then a record that fails forever, crossed. Below,
// one lane shared by many keys: the order promise holds only inside it, so the cherry record stalls every key behind.
export function Setup({ t }: StepCtx) {
  const keys = [C.second, C.crema, C.latte, C.second, C.crema, C.latte, C.second];
  return (
    <Svg label="some records never can be processed; retrying one in place blocks everything ordered behind it" h={200}>
      <Cell x={25} y={20} w={260} label="a repeat: caught, given patience" o={easeOut(seg(t, 0, 0.4))} />
      <MiniTick x={296} y={34} k={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={25} y={60} w={260} label="a record that fails forever" o={easeOut(seg(t, 1.0, 1.4))} stroke={C.cherryText} f={C.cherryText} />
      <T x={300} y={79} s={11} f={C.cherryText} o={easeOut(seg(t, 1.3, 1.6))}>
        never assumed
      </T>
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        one lane, many keys: order promised only inside it
      </T>
      <rect x={25} y={134} width={530} height={30} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <rect x={525} y={141} width={16} height={16} rx={3} fill={C.cherryText} opacity={easeOut(seg(t, 2.4, 2.7))} />
      {keys.map((f, i) => {
        const k = easeOut(seg(t, 2.6 + i * 0.15, 2.9 + i * 0.15));
        return <rect key={i} x={lerp(40, 495 - i * 34, k)} y={141} width={16} height={16} rx={3} fill={f} opacity={k} />;
      })}
      <T x={25} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 3.9, 4.3))}>
        stall the lane, stall everyone in it
      </T>
    </Svg>
  );
}

// 2 · Predict. order-3 lifts out of the lane into a retry topic below; order-4 and order-5 wait with a question mark.
// On answer they slide on to the consumer.
export function PredictDivert({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const lift = easeInOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="the poison record is diverted to a separate retry topic instead of retried in place" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        main partition
      </T>
      <Rec x={lerp(384, 470, v)} y={34} n="order-4" o={1 - 0.6 * v} />
      <Rec x={lerp(298, 384, v)} y={34} n="order-5" />
      <Rec x={lerp(470, 470, lift)} y={lerp(34, 104, lift)} n="order-3" poison w={86} />
      <T x={450} y={122} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        retry topic
      </T>
      <Hole x={464} y={98} w={98} h={40} stroke={C.cherryText} o={easeOut(seg(t, 0.4, 0.7))} />
      <AnswerRow y={176} label="order-4, order-5" answer={answer} value="move right away" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Divert. order-3 drops into the retry topic; order-4 and order-5 run on into the consumer at once, and the processed
// list fills: order-1, order-2, order-4, order-5. order-3 waits below: moved, not fixed.
export function RevealDivert({ t }: StepCtx) {
  const lift = easeInOut(seg(t, 0.3, 1.0));
  const g4 = easeInOut(seg(t, 1.1, 1.9));
  const g5 = easeInOut(seg(t, 1.3, 2.5));
  const n = 2 + (t >= 1.9 ? 1 : 0) + (t >= 2.5 ? 1 : 0);
  const done = ['order-1', 'order-2', 'order-4', 'order-5'].slice(0, n).join(', ');
  return (
    <Svg label="the main flow processes everything behind the poison record immediately" h={200}>
      <T x={25} y={22} s={11} f={C.latte}>
        main partition
      </T>
      <rect x={400} y={30} width={80} height={48} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={440} y={22} s={11} f={C.latte} a="middle">
        consumer
      </T>
      {g4 < 1 && <Rec x={lerp(212, 400, g4)} y={40} n="order-4" w={80} o={1 - easeOut(seg(g4, 0.7, 1))} />}
      {g5 < 1 && <Rec x={lerp(126, 400, g5)} y={40} n="order-5" w={80} o={1 - easeOut(seg(g5, 0.8, 1))} />}
      <Rec x={298} y={lerp(40, 110, lift)} n="order-3" poison w={80} />
      <T x={290} y={128} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 0.8, 1.1))}>
        retry topic
      </T>
      <T x={25} y={170} s={12} f={C.focus}>
        {`processed: ${done}`}
      </T>
      <T x={25} y={194} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        the jam is gone; order-3 isn't fixed yet
      </T>
    </Svg>
  );
}

// 4 · Ordering. Five records leave in order. order-1, 2, 4 and 5 take the straight main road and arrive at once;
// order-3 takes the long detour below and arrives last. The arrival column ends out of order.
export function RevealOrdering({ t }: StepCtx) {
  const yOf = (i: number) => 20 + i * 32;
  const arrived = [0, 1, 3, 4, 2];
  const leave = [0.3, 0.6, 0.9, 0.9, 1.2];
  const main = [0, 1, 3, 4];
  const u3 = easeInOut(seg(t, 0.9, 3.4));
  const bx = (1 - u3) * (1 - u3) * 115 + 2 * (1 - u3) * u3 * 290 + u3 * u3 * 465;
  const by = (1 - u3) * (1 - u3) * (yOf(2) + 12) + 2 * (1 - u3) * u3 * 250 + u3 * u3 * (yOf(4) + 12);
  return (
    <Svg label="not guaranteed to be processed in the same sequence — the named, accepted cost" h={200}>
      {ORD.map((n, i) => (
        <Cell key={n} x={25} y={yOf(i)} w={86} h={24} label={n} o={easeOut(seg(t, 0, 0.3))} stroke={i === 2 ? C.cherryText : C.mocha} />
      ))}
      {main.map((i) => {
        const u = easeInOut(seg(t, leave[i], leave[i] + 0.8));
        const slot = arrived.indexOf(i);
        if (u <= 0 || u >= 1) return null;
        return <rect key={i} x={lerp(115, 453, u)} y={lerp(yOf(i) + 6, yOf(slot) + 6, u)} width={12} height={12} rx={2} fill={C.second} />;
      })}
      {u3 > 0 && u3 < 1 && <rect x={bx - 6} y={by - 6} width={12} height={12} rx={2} fill={C.cherryText} />}
      {arrived.map((i, slot) => {
        const at = i === 2 ? 3.4 : leave[i] + 0.8;
        return <Cell key={i} x={470} y={yOf(slot)} w={86} h={24} label={ORD[i]} o={easeOut(seg(t, at, at + 0.2))} stroke={i === 2 ? C.cherryText : C.focus} />;
      })}
      <T x={290} y={196} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
        order is the price of not getting stuck
      </T>
    </Svg>
  );
}

// 5 · Predict. order-3 runs through three retry lanes, each with a longer wait, and fails each one; after the last a
// dashed slot waits. On answer it fills: the dead-letter topic.
export function PredictTiers({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tiers = ['retry: short wait', 'retry: longer wait', 'retry: longest wait'];
  return (
    <Svg label="a record keeps failing through every tiered retry lane — what happens to it?" h={200}>
      {tiers.map((n, i) => {
        const k0 = 0.2 + i * 0.6;
        const w = easeInOut(seg(t, k0, k0 + 0.45));
        return (
          <g key={n}>
            <Cell x={25} y={20 + i * 40} w={170} label={n} o={easeOut(seg(t, k0 - 0.2, k0))} />
            <rect x={205} y={28 + i * 40} width={(60 + i * 60) * w} height={12} rx={3} fill={C.latte} opacity={0.5} />
            <Cross x={395} y={34 + i * 40} k={easeOut(seg(t, k0 + 0.45, k0 + 0.6))} />
          </g>
        );
      })}
      {v > 0 ? <Cell x={420} y={60} w={140} label="dead-letter topic" o={v} stroke={C.focus} /> : <Hole x={420} y={60} w={140} o={easeOut(seg(t, 1.9, 2.2))} />}
      <AnswerRow y={176} label="after the last tier" answer={answer} value="dead-letter topic" k={easeOut(seg(t, 2.0, 2.5))} />
    </Svg>
  );
}

// 6 · Dead-letter record. order-3 slides into the record; then the three things it carries arrive, group by group: where
// it came from, what went wrong, how many tries.
export function RevealDLQ({ t }: StepCtx) {
  const lines: [string, string][] = [
    ['came from', 'orders, partition 0, offset 2'],
    ['what went wrong', 'ValueError: missing customer_id'],
    ['tries so far', 'retry_count 3'],
  ];
  const card = easeOut(seg(t, 0, 0.4));
  return (
    <Svg label="a separate topic, carrying the original payload plus metadata, for diagnosis and replay" h={200}>
      <rect x={20} y={14} width={540} height={150} rx={8} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={card} />
      <T x={34} y={36} s={11} f={C.focus} o={card}>
        dead-letter topic
      </T>
      <Rec x={lerp(500, 466, easeOut(seg(t, 0.3, 0.9)))} y={20} n="order-3" poison w={86} o={easeOut(seg(t, 0.3, 0.6))} />
      {lines.map(([l, v], i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.8, 1.5 + i * 0.8));
        return (
          <g key={l} opacity={k}>
            <T x={lerp(24, 34, k)} y={78 + i * 32} s={11} f={C.latte}>
              {l}
            </T>
            <T x={170} y={78 + i * 32} s={12} f={C.crema}>
              {v}
            </T>
          </g>
        );
      })}
      <T x={25} y={192} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.1))}>
        all three, or nobody can fix it later
      </T>
    </Svg>
  );
}

// 7 · Tooling. Kafka Connect, its error-tolerance setting switching on; Kafka Streams, its newer DLQ handler. A bad record
// leaves each and lands in a dead-letter topic.
export function RevealTooling({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.0, 1.8));
  const b = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="two current, named mechanisms: Connect's error tolerance, and Streams' own DLQ handler" h={200}>
      <Cell x={25} y={30} w={170} label="Kafka Connect" o={easeOut(seg(t, 0, 0.3))} />
      <T x={25} y={78} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        errors.tolerance, a setting
      </T>
      <Cell x={25} y={110} w={170} label="Kafka Streams" o={easeOut(seg(t, 1.6, 1.9))} />
      <T x={25} y={158} s={11} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        DLQ handler, a newer release
      </T>
      <path d="M205 44 C 300 44, 300 94, 380 94" fill="none" stroke={C.cherryText} strokeWidth={1.3} strokeDasharray="4 3" opacity={a > 0 ? 0.7 : 0} />
      <path d="M205 124 C 300 124, 300 94, 380 94" fill="none" stroke={C.cherryText} strokeWidth={1.3} strokeDasharray="4 3" opacity={b > 0 ? 0.7 : 0} />
      {a > 0 && a < 1 && <rect x={lerp(205, 368, a)} y={lerp(38, 88, a)} width={12} height={12} rx={2} fill={C.cherryText} />}
      {b > 0 && b < 1 && <rect x={lerp(205, 368, b)} y={lerp(118, 88, b)} width={12} height={12} rx={2} fill={C.cherryText} />}
      <Cell x={390} y={80} w={165} label="dead-letter topic" o={easeOut(seg(t, 0.8, 1.1))} stroke={C.focus} />
      <T x={25} y={194} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.1))}>
        built in, not bolted on
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={40} label="in-place retry" value="stuck at order-3" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={82} label="ran before it" value="order-1, order-2" k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={124} label="diverted, then ran" value="order-4, order-5" valueColor={C.focus} k={easeOut(seg(t, 1.5, 1.9))} />
      <Row y={166} label="retry topic" value="order-3" k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={208} label="DLQ exception" value="missing customer_id" valueColor={C.focus} k={easeOut(seg(t, 2.9, 3.3))} />
      <Tick y={240} k={easeOut(seg(t, 3.7, 4.2))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the ordering-cost line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['never retry a stuck record where it jams the lane', 'move it aside, and name the ordering cost', 'dead-letter it with enough to bring it back'];
  return (
    <Svg label="poison records, non-blocking tiers, the ordering cost, and DLQ metadata and tooling" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 1 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
