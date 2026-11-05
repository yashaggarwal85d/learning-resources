import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's space-time diagram (CHAPTER.md): one lane per service, events as dots, messages as arrows. Clock
// tags are the Lamport numbers from examples.py's three-lane run: order 1, payment 2, shipment 3, and the unrelated
// customer's order 1; the tie case is A 1 and B 1, broken A first. Two events with no chain between them are marked
// with a pale blue ∥. Red only for a claim the numbers can't back.

type Pt = readonly [number, number];

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

const X0 = 130;
const LANES = { order: 40, payment: 105, shipment: 170, other: 235 } as const;
type LaneName = keyof typeof LANES;
/** Where each event of the three-lane example sits. */
const EV: Record<LaneName, Pt> = { order: [180, LANES.order], payment: [300, LANES.payment], shipment: [420, LANES.shipment], other: [250, LANES.other] };

function Lane({ y, name, t, from = 0, f = C.secondary, o = 1 }: { y: number; name: string; t: number; from?: number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={X0 - 12} y={y + 5} s={13} a="end" f={f} o={easeOut(seg(t, from, from + 0.4))}>
        {name}
      </T>
      <Draw pts={[[X0, y], [580, y]]} t={t} from={from} to={from + 0.6} stroke={C.line} w={1.5} pen={false} />
    </g>
  );
}

/** A message arrow from a to b over [from, to], with a pellet (and optional number riding it) at its tip. */
function Msg({ a, b, t, from, to, color = C.crema, carry }: { a: Pt; b: Pt; t: number; from: number; to: number; color?: string; carry?: string }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => `${(b[0] - 11 * Math.cos(ang + s)).toFixed(1)} ${(b[1] - 11 * Math.sin(ang + s)).toFixed(1)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={1.8} />
      {k < 1 ? (
        <g>
          <circle cx={tip[0]} cy={tip[1]} r={carry ? 11 : 4.5} fill={C.focus} />
          {carry && (
            <T x={tip[0]} y={tip[1] + 5} s={13} a="middle" f={C.ink} w={700}>
              {carry}
            </T>
          )}
        </g>
      ) : (
        <path d={`M${head(0.45)} L${b[0]} ${b[1]} L${head(-0.45)}`} fill="none" stroke={color} strokeWidth={1.8} />
      )}
    </g>
  );
}

const Dot = ({ at: [x, y], k, f = C.focus }: { at: Pt; k: number; f?: string }) => (k > 0 ? <circle cx={x} cy={y} r={6 * easeOutBack(k)} fill={f} /> : null);

/** A Lamport clock tag above an event: its number decodes in at `when`. */
function Tag({ at: [x, y], n, t, when, f = C.focus }: { at: Pt; n: string; t: number; when: number; f?: string }) {
  const k = easeOut(seg(t, when - 0.15, when + 0.15));
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 6).toFixed(2)})`}>
      <rect x={x - 16} y={y - 36} width={32} height={22} rx={3} fill={C.panel} stroke={f} strokeWidth={1.3} />
      <Decode text={n} t={t} at={when} dur={0.3} x={x} y={y - 20} s={14} a="middle" f={f} w={700} />
    </g>
  );
}

/** A small clock face with its hand at `ang` radians. */
const Face = ({ at: [x, y], ang, o = 1 }: { at: Pt; ang: number; o?: number }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={11} fill="none" stroke={C.secondary} strokeWidth={1.4} />
    <line x1={x} y1={y} x2={x + 8 * Math.sin(ang)} y2={y - 8 * Math.cos(ang)} stroke={C.focus} strokeWidth={1.6} />
  </g>
);

/** The "no chain either way" mark between two events: a dashed pale-blue link with ∥ at its middle. */
function Par({ a, b, k, label = true }: { a: Pt; b: Pt; k: number; label?: boolean }) {
  if (k <= 0) return null;
  const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return (
    <g opacity={k}>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.second} strokeWidth={1.6} strokeDasharray="4 5" />
      {label && (
        <g>
          <circle cx={m[0]} cy={m[1]} r={13} fill={C.ink} stroke={C.second} strokeWidth={1.4} />
          <T x={m[0]} y={m[1] + 6} s={17} a="middle" f={C.second} w={700} serif>
            ∥
          </T>
        </g>
      )}
    </g>
  );
}

/** The three-lane chain (order → payment → shipment) with optional unrelated lane, drawn up to time t. */
function Chain({ t, at = 0, other = true, tags = false, tagAt = 0 }: { t: number; at?: number; other?: boolean; tags?: boolean; tagAt?: number }) {
  return (
    <g>
      <Lane y={LANES.order} name="order" t={t} from={at} />
      <Lane y={LANES.payment} name="payment" t={t} from={at + 0.1} />
      <Lane y={LANES.shipment} name="shipment" t={t} from={at + 0.2} />
      {other && <Lane y={LANES.other} name="other" t={t} from={at + 0.3} />}
      <Dot at={EV.order} k={seg(t, at + 0.6, at + 0.9)} />
      <Msg a={EV.order} b={EV.payment} t={t} from={at + 0.8} to={at + 1.4} />
      <Dot at={EV.payment} k={seg(t, at + 1.4, at + 1.6)} />
      <Msg a={EV.payment} b={EV.shipment} t={t} from={at + 1.5} to={at + 2.1} />
      <Dot at={EV.shipment} k={seg(t, at + 2.1, at + 2.3)} />
      {other && <Dot at={EV.other} k={seg(t, at + 1.0, at + 1.3)} />}
      {tags && (
        <g>
          <Tag at={EV.order} n="1" t={t} when={tagAt} />
          <Tag at={EV.payment} n="2" t={t} when={tagAt + 0.2} />
          <Tag at={EV.shipment} n="3" t={t} when={tagAt + 0.4} />
          {other && <Tag at={EV.other} n="1" t={t} when={tagAt + 0.6} />}
        </g>
      )}
    </g>
  );
}

// 1 · Three services with three disagreeing clock faces; the order, its payment and its shipment play out as messages.
// The clock faces fade out — what's left to order the log by is the chain of messages, which the lock-on closes on.
export function Hook({ t }: StepCtx) {
  const faces = 1 - 0.75 * easeOut(seg(t, 3.0, 3.6));
  const angs = [0.4 + t * 0.9, 2.2 + t * 0.6, 4.4 + t * 1.3];
  const slots = ['order', 'payment', 'shipment'];
  return (
    <Svg label="three services with disagreeing physical clocks must produce one global log that never shows a shipment before the payment that caused it" h={300}>
      <Chain t={t} at={0} other={false} />
      {(['order', 'payment', 'shipment'] as LaneName[]).map((l, i) => (
        <Face key={l} at={[560, LANES[l] - 22]} ang={angs[i]} o={easeOut(seg(t, 0.4 + i * 0.1, 0.8 + i * 0.1)) * faces} />
      ))}
      <T x={20} y={236} s={13} f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
        one global log
      </T>
      {slots.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, 2.5 + i * 0.15, 2.9 + i * 0.15))}>
          <rect x={150 + i * 140} y={252} width={120} height={32} rx={3} fill={C.panel} stroke={C.line} strokeDasharray="4 4" />
          <T x={210 + i * 140} y={274} s={18} a="middle" f={C.quiet} serif>
            ?
          </T>
        </g>
      ))}
      <T x={540} y={208} s={13} a="end" f={C.quiet} o={easeOut(seg(t, 3.3, 3.7))}>
        clocks disagree
      </T>
      <Reticle x={300} y={105} w={280} h={150} t={t} at={4.1} />
    </Svg>
  );
}

// 2 · The four lanes and the log's line, with the stranger's order placed before the shipment. After the pick, every
// path out of the stranger's event is tried and none reaches the shipment: ∥, and the placement is only a tie-break.
export function PredictLogOrderMeaning({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const line = ['order', 'other', 'payment', 'shipment'];
  const par = on ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="the global log places an unrelated customer's order before the shipment — does that placement mean it genuinely happened first?" h={300}>
      <Chain t={99} other />
      {line.map((n, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.3, 0.7 + i * 0.3));
        const red = on && n === 'other';
        return (
          <g key={n} opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(1)})`}>
            <rect x={60 + i * 130} y={262} width={112} height={30} rx={3} fill={C.panel} stroke={n === 'other' ? (red ? C.second : C.focus) : C.line} strokeWidth={1.4} />
            <T x={116 + i * 130} y={282} s={13} a="middle" f={n === 'other' ? (red ? C.second : C.focus) : C.secondary}>
              {n}
            </T>
          </g>
        );
      })}
      {on && [EV.order, EV.payment].map((p, i) => (
        <Draw key={i} pts={[EV.other, p]} t={s} from={0.1 + i * 0.25} to={0.5 + i * 0.25} stroke={C.quiet} w={1.2} pen dash="2 5" />
      ))}
      <Par a={EV.other} b={EV.shipment} k={par} />
      {on && (
        <Decode text="a tie-break, not a fact" t={s} at={1.3} x={580} y={214} s={13} a="end" f={C.second} />
      )}
      {on && <Reticle x={(EV.other[0] + EV.shipment[0]) / 2} y={(EV.other[1] + EV.shipment[1]) / 2} w={44} h={44} t={s} at={1.6} color={C.second} />}
    </Svg>
  );
}

// 3 · The definition, one condition per beat: two events in order on one service, a send linked to its receipt,
// and a chain of such steps lighting from the order to the shipment. The unrelated event has no chain either way: ∥.
export function RevealHappensBefore({ t }: StepCtx) {
  const ORDER2: Pt = [250, LANES.order];
  const chain = easeInOut(seg(t, 2.3, 3.2));
  const path: Pt[] = [EV.order, EV.payment, EV.shipment];
  return (
    <Svg label="one event happens before another if they're on the same service in order, or one is the send of a message and the other its receipt, or a chain of such steps links them; with no chain either way, two events are concurrent" h={300}>
      <Chain t={99} other />
      <Dot at={ORDER2} k={seg(t, 0.2, 0.5)} f={C.secondary} />
      <Draw pts={[[EV.order[0] + 8, LANES.order - 12], [ORDER2[0] - 8, LANES.order - 12]]} t={t} from={0.4} to={1.0} stroke={C.focus} w={2.5} />
      <T x={ORDER2[0] + 14} y={LANES.order - 8} s={13} f={C.primary} o={easeOut(seg(t, 0.8, 1.2))}>
        same service
      </T>
      <Draw pts={[EV.order, EV.payment]} t={t} from={1.2} to={1.8} stroke={C.focus} w={3.5} pen={false} />
      <T x={250} y={88} s={13} a="end" f={C.primary} o={easeOut(seg(t, 1.5, 1.9))}>
        message
      </T>
      <Draw pts={path} t={t} from={2.3} to={3.2} stroke={C.focus} w={3.5} />
      <T x={430} y={140} s={13} f={C.primary} o={easeOut(seg(t, 3.0, 3.4))}>
        a chain
      </T>
      {chain >= 1 && <circle cx={EV.shipment[0]} cy={EV.shipment[1]} r={10} fill="none" stroke={C.focus} strokeWidth={1.5} />}
      <Par a={EV.other} b={EV.shipment} k={easeOut(seg(t, 3.5, 3.9))} />
      <T x={580} y={262} s={13} a="end" f={C.second} o={easeOut(seg(t, 3.7, 4.1))}>
        concurrent
      </T>
      <Reticle x={(EV.other[0] + EV.shipment[0]) / 2} y={(EV.other[1] + EV.shipment[1]) / 2} w={44} h={44} t={t} at={4.2} color={C.second} />
    </Svg>
  );
}

// 4 · The two rules, run live. The order's counter bumps to 1; its message carries the 1; payment jumps past it to 2,
// and its message carries 2 to shipment, which jumps to 3. The unrelated order bumps its own counter to 1.
export function RevealScalarClock({ t }: StepCtx) {
  return (
    <Svg label="each service bumps a counter before every event, every message carries the counter's value, and a receiver jumps to one past the larger of its own value and the message's — every caused event gets a strictly larger number" h={300}>
      <Lane y={LANES.order} name="order" t={99} />
      <Lane y={LANES.payment} name="payment" t={99} />
      <Lane y={LANES.shipment} name="shipment" t={99} />
      <Lane y={LANES.other} name="other" t={99} />
      <Dot at={EV.order} k={seg(t, 0.2, 0.5)} />
      <Tag at={EV.order} n="1" t={t} when={0.5} />
      <T x={EV.order[0] - 28} y={LANES.order + 26} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 0.4, 0.8))}>
        bump
      </T>
      <Msg a={EV.order} b={EV.payment} t={t} from={0.9} to={1.7} carry="1" />
      <Dot at={EV.payment} k={seg(t, 1.7, 1.9)} />
      <Tag at={EV.payment} n="2" t={t} when={2.0} />
      <T x={EV.payment[0] - 26} y={LANES.payment + 26} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 1.9, 2.3))}>
        jump past
      </T>
      <Msg a={EV.payment} b={EV.shipment} t={t} from={2.4} to={3.2} carry="2" />
      <Dot at={EV.shipment} k={seg(t, 3.2, 3.4)} />
      <Tag at={EV.shipment} n="3" t={t} when={3.5} />
      <Dot at={EV.other} k={seg(t, 1.2, 1.5)} f={C.secondary} />
      <Tag at={EV.other} n="1" t={t} when={1.5} f={C.secondary} />
      <Reticle x={EV.shipment[0]} y={EV.shipment[1] - 16} w={52} h={58} t={t} at={4.0} />
    </Svg>
  );
}

// 5 · The same chain with its tags, while each service's physical clock spins at its own wrong speed and the lanes
// slide against each other in wall time — the payment arrow even appears to run backwards — and the tags never move.
export function RevealSkewDoesNotMatter({ t }: StepCtx) {
  const sk = easeInOut(seg(t, 0.6, 2.6));
  const shift = { order: 0, payment: -150 * sk, shipment: 60 * Math.sin(t * 1.4) * sk } as const;
  const P = (l: 'order' | 'payment' | 'shipment'): Pt => [EV[l][0] + shift[l], EV[l][1]];
  return (
    <Svg label="the same causal chain run through a simulator that injects clock skew: the scalar counters never read a physical clock, so the order stays smaller than the payment and the payment smaller than the shipment" h={300}>
      <Lane y={LANES.order} name="order" t={99} />
      <Lane y={LANES.payment} name="payment" t={99} />
      <Lane y={LANES.shipment} name="shipment" t={99} />
      {(['order', 'payment', 'shipment'] as const).map((l, i) => (
        <Face key={l} at={[565, LANES[l] - 22]} ang={1 + t * (0.6 + i * 1.7)} />
      ))}
      <line x1={P('order')[0]} y1={P('order')[1]} x2={P('payment')[0]} y2={P('payment')[1]} stroke={C.crema} strokeWidth={1.8} />
      <line x1={P('payment')[0]} y1={P('payment')[1]} x2={P('shipment')[0]} y2={P('shipment')[1]} stroke={C.crema} strokeWidth={1.8} />
      {(['order', 'payment', 'shipment'] as const).map((l, i) => (
        <g key={l}>
          <circle cx={P(l)[0]} cy={P(l)[1]} r={6} fill={C.focus} />
          <Tag at={P(l)} n={String(i + 1)} t={99} when={0} />
        </g>
      ))}
      <T x={20} y={226} s={13} f={C.badText} o={easeOut(seg(t, 1.2, 1.6))}>
        skew injected
      </T>
      <Decode text="1 < 2 < 3, still" t={t} at={3.0} x={20} y={270} s={16} f={C.focus} w={600} />
      <Reticle x={130} y={262} w={240} h={34} t={t} at={4.0} />
    </Svg>
  );
}

// 6 · Two services land on the same number with no message between them. The tie flashes, the services' fixed order
// breaks it, and both requests drop into one line — which then hands a shared resource out, A first, then B.
export function RevealTieBreak({ t }: StepCtx) {
  const A: Pt = [260, 60], B: Pt = [260, 140];
  const tie = Math.max(0, Math.sin(t * Math.PI * 3)) * (1 - seg(t, 1.6, 1.9)) * easeOut(seg(t, 0.8, 1.0));
  const dropA = easeInOut(seg(t, 1.9, 2.6));
  const dropB = easeInOut(seg(t, 2.2, 2.9));
  const key = easeInOut(seg(t, 3.2, 4.2));
  const slotA: Pt = [230, 252], slotB: Pt = [370, 252];
  const tok = (from: Pt, to: Pt, k: number, label: string) => {
    const x = lerp(from[0], to[0], k), y = lerp(from[1] - 25, to[1], k);
    return (
      <g>
        <rect x={x - 56} y={y - 16} width={112} height={30} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={x} y={y + 4} s={14} a="middle" f={C.focus} w={600}>
          {label}
        </T>
      </g>
    );
  };
  return (
    <Svg label="two counters land on the same number with no message between them; a fixed ordering of the services breaks the tie, putting every event in one line that can grant a shared resource fairly" h={300}>
      <Lane y={A[1]} name="A" t={99} />
      <Lane y={B[1]} name="B" t={99} />
      <Dot at={A} k={seg(t, 0.1, 0.4)} />
      <Dot at={B} k={seg(t, 0.2, 0.5)} />
      <Tag at={A} n="1" t={t} when={0.5} f={tie > 0.5 ? C.badText : C.focus} />
      <Tag at={B} n="1" t={t} when={0.6} f={tie > 0.5 ? C.badText : C.focus} />
      <T x={330} y={106} s={13} f={C.secondary} o={easeOut(seg(t, 0.9, 1.3))}>
        a real tie
      </T>
      <T x={330} y={196} s={13} f={C.secondary} o={easeOut(seg(t, 1.6, 2.0))}>
        tie-break on name
      </T>
      <line x1={140} y1={252} x2={460} y2={252} stroke={C.line} strokeWidth={1.5} opacity={easeOut(seg(t, 1.6, 1.9))} />
      {dropA > 0 && tok(A, slotA, dropA, '1 · A')}
      {dropB > 0 && tok(B, slotB, dropB, '1 · B')}
      {key > 0 && <circle cx={key < 0.5 ? lerp(140, slotA[0], key * 2) : lerp(slotA[0], slotB[0], (key - 0.5) * 2)} cy={286} r={6} fill={C.second} />}
      <T x={470} y={292} s={13} f={C.second} o={easeOut(seg(t, 3.2, 3.6))}>
        the resource
      </T>
      <Reticle x={300} y={252} w={300} h={44} t={t} at={4.2} />
    </Svg>
  );
}

// 7 · The single line puts the stranger's order (1) ahead of the shipment (3). A red arc tries to read that as a
// cause, and is struck: no chain links them, only ∥.
export function RevealConverseFails({ t }: StepCtx) {
  const arc = easeInOut(seg(t, 1.6, 2.6));
  const strike = easeOut(seg(t, 2.8, 3.2));
  const a = EV.other, b = EV.shipment;
  const ctrl: Pt = [470, 260];
  const pts: Pt[] = Array.from({ length: 31 }, (_, i) => {
    const u = i / 30;
    return [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * ctrl[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * ctrl[1] + u * u * b[1]];
  });
  return (
    <Svg label="the single line puts an unrelated order before the shipment, but nothing in that placement says it happened first: a smaller number never proves a cause" h={300}>
      <Chain t={99} other tags tagAt={0} />
      <Draw pts={pts} t={t} from={1.6} to={2.6} stroke={C.badText} w={2} dash="6 5" />
      <T x={500} y={226} s={13} f={C.badText} o={easeOut(seg(t, 2.2, 2.6))}>
        caused?
      </T>
      {strike > 0 && <path d={`M${pts[15][0] - 10} ${pts[15][1] - 10} l20 20 M${pts[15][0] + 10} ${pts[15][1] - 10} l-20 20`} stroke={C.badText} strokeWidth={2.4} opacity={strike} />}
      <Par a={a} b={b} k={easeOut(seg(t, 3.2, 3.6))} />
      <T x={20} y={284} s={14} f={C.focus} o={easeOut(seg(t, 0.4, 0.8))}>
        1 before 3
      </T>
      <Decode text="never proves a cause" t={t} at={3.4} x={580} y={284} s={14} a="end" f={C.badText} w={600} />
      {arc >= 1 && <Reticle x={pts[15][0]} y={pts[15][1]} w={40} h={40} t={t} at={3.9} color={C.badText} />}
    </Svg>
  );
}

// 8 · The four pieces, each replaying its move: only the chain counts, the counters climb 1, 2, 3, ties land in one
// line, and ∥ stays invisible to the numbers.
export function Recap({ t }: StepCtx) {
  const at = (i: number) => 0.2 + i * 0.9;
  const labels = ['only the chain', 'bump, carry, jump', 'one line', 'blind to ∥'];
  const cells: Pt[] = [[0, 0], [300, 0], [0, 150], [300, 150]];
  return (
    <Svg label="happens-before is only same-service order and linked sends and receipts; a counter respects it under any skew; ties broken on identity give one usable line; and that line still can't tell which pairs were concurrent" h={300}>
      {labels.map((l, i) => (
        <T key={l} x={cells[i][0] + 150} y={cells[i][1] + 136} s={13} a="middle" f={i === 3 ? C.second : C.primary} o={easeOut(seg(t, at(i), at(i) + 0.4))}>
          {l}
        </T>
      ))}
      <Draw pts={[[60, 30], [150, 70], [240, 105]]} t={t} from={at(0)} to={at(0) + 0.6} stroke={C.focus} w={2.5} />
      {[[60, 30], [150, 70], [240, 105]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={C.focus} opacity={easeOut(seg(t, at(0) + i * 0.2, at(0) + i * 0.2 + 0.2))} />
      ))}
      {['1', '2', '3'].map((n, i) => (
        <Tag key={n} at={[360 + i * 90, 100 - i * 18]} n={n} t={t} when={at(1) + i * 0.25} />
      ))}
      <line x1={50} y1={210} x2={250} y2={210} stroke={C.line} strokeWidth={1.5} opacity={easeOut(seg(t, at(2), at(2) + 0.3))} />
      {['1·A', '1·B', '2'].map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, at(2) + 0.2 + i * 0.15, at(2) + 0.4 + i * 0.15))}>
          <rect x={56 + i * 66} y={196} width={56} height={26} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.2} />
          <T x={84 + i * 66} y={214} s={13} a="middle" f={C.focus}>
            {n}
          </T>
        </g>
      ))}
      <circle cx={360} cy={180} r={5} fill={C.focus} opacity={easeOut(seg(t, at(3), at(3) + 0.3))} />
      <circle cx={540} cy={240} r={5} fill={C.focus} opacity={easeOut(seg(t, at(3), at(3) + 0.3))} />
      <Par a={[360, 180]} b={[540, 240]} k={easeOut(seg(t, at(3) + 0.3, at(3) + 0.6))} />
      <line x1={300} y1={14} x2={300} y2={290} stroke={C.band} />
      <line x1={14} y1={150} x2={586} y2={150} stroke={C.band} />
    </Svg>
  );
}

// 9 · Request A carries 1, request B carries 3, on lanes that never exchanged a message. After the pick, probes go
// looking for a chain between them, find none, and the pair is marked ∥ — the larger number proved nothing.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const A: Pt = [200, 80], B: Pt = [420, 190];
  return (
    <Svg label="a system sees request B's counter is larger than request A's and concludes B depends on A — is that always safe to act on?" h={300}>
      <Lane y={A[1]} name="request A" t={t} />
      <Lane y={B[1]} name="request B" t={t} from={0.15} />
      <Dot at={A} k={seg(t, 0.5, 0.8)} />
      <Dot at={B} k={seg(t, 0.7, 1.0)} />
      <Tag at={A} n="1" t={t} when={0.9} />
      <Tag at={B} n="3" t={t} when={1.2} />
      <T x={300} y={270} s={15} a="middle" f={on ? C.second : C.secondary} o={on ? easeOut(seg(s, 1.4, 1.7)) : easeOut(seg(t, 1.5, 2.2))}>
        {on ? 'no chain either way' : 'B depends on A?'}
      </T>
      {on &&
        ([[300, 80], [560, 80], [300, 190]] as Pt[]).map((p, i) => (
          <Draw key={i} pts={[A, p]} t={s} from={0.1 + i * 0.25} to={0.45 + i * 0.25} stroke={C.quiet} w={1.2} dash="2 5" />
        ))}
      <Par a={A} b={B} k={on ? easeOut(seg(s, 1.0, 1.4)) : 0} />
      {on && <Reticle x={(A[0] + B[0]) / 2} y={(A[1] + B[1]) / 2} w={44} h={44} t={s} at={1.7} color={C.second} />}
    </Svg>
  );
}
