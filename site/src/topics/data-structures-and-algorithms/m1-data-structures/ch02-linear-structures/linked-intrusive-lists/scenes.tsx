import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the operation being shown and its result; cinnamon = the alternative
// (the array, the shuffled layout); cherry/cherryText = the cost or the failure; crema = nodes and records;
// taupe/latte = labels. Every printed number is asserted or cited in examples.py.

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

type Pt = [number, number];

/** A list node: a circle with its label. */
function Node({ x, y, label, f = C.crema, o = 1, r = 15, fill = C.cocoa }: { x: number; y: number; label: string; f?: string; o?: number; r?: number; fill?: string }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={fill} stroke={f} strokeWidth={1.6} />
      <T x={x} y={y + 5} s={13} f={f} a="middle">{label}</T>
    </g>
  );
}

/** An arrow from a to b that draws itself over [from, to] (stops short of the target node's rim). */
function Link({ a, b, t, from, to, f = C.latte, r = 17, w = 1.6 }: { a: Pt; b: Pt; t: number; from: number; to: number; f?: string; r?: number; w?: number }) {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
  const s: Pt = [a[0] + ux * r, a[1] + uy * r];
  const e: Pt = [b[0] - ux * r, b[1] - uy * r];
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip: Pt = [lerp(s[0], e[0], k), lerp(s[1], e[1], k)];
  const ang = Math.atan2(uy, ux);
  const h = (da: number) => `${tip[0] - 7 * Math.cos(ang + da)} ${tip[1] - 7 * Math.sin(ang + da)}`;
  return (
    <g>
      <line x1={s[0]} y1={s[1]} x2={tip[0]} y2={tip[1]} stroke={f} strokeWidth={w} />
      <path d={`M${tip[0]} ${tip[1]} L${h(0.45)} M${tip[0]} ${tip[1]} L${h(-0.45)}`} stroke={f} strokeWidth={w} fill="none" />
    </g>
  );
}

/** A tally of `n` small marks from x, one per event. */
const Tally = ({ x, y, n, f }: { x: number; y: number; n: number; f: string }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <rect key={i} x={x + i * 12} y={y} width={8} height={12} rx={2} fill={f} />
    ))}
  </g>
);

// 1 · What do you get back? Six contiguous cells; they burst apart to scattered addresses and arrows thread them back
// into order. What did giving up contiguity buy?
const SCATTER: Pt[] = [
  [70, 170], [250, 230], [140, 250], [420, 160], [330, 190], [510, 240],
];
export function Opening({ t }: StepCtx) {
  const burst = easeInOut(seg(t, 0.6, 1.5));
  return (
    <Svg label="A dynamic array's six contiguous cells scatter into six separate allocations, threaded back together by pointers" h={320}>
      <T x={30} y={36} s={13} f={C.taupe}>a dynamic array: contiguous, one allocation</T>
      {SCATTER.map(([x, y], i) => {
        const x0 = 60 + i * 34, y0 = 70;
        return <rect key={i} x={lerp(x0, x - 15, burst)} y={lerp(y0, y - 11, burst)} width={30} height={22} rx={4} fill={C.cocoa} stroke={C.crema} strokeWidth={1.4} />;
      })}
      {SCATTER.slice(1).map((p, i) => (
        <Link key={i} a={SCATTER[i]} b={p} t={t} from={1.5 + i * 0.15} to={1.75 + i * 0.15} r={18} />
      ))}
      <T x={30} y={128} s={13} f={C.taupe} o={easeOut(seg(t, 1.2, 1.6))}>a linked list: one allocation per element</T>
      <T x={300} y={300} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 2.5, 3.0))}>what does giving that up buy back?</T>
    </Svg>
  );
}

// 2 · Predict: append without a tail pointer. After the answer a walker starts at head and hops node to node until it
// finds the last one; only then is the new node linked on.
export function SinglyAppendPredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const xs = [70, 160, 250, 340, 430];
  const y = 100;
  const hop = seg(s, 0.2, 1.8) * 3;
  const k = Math.min(3, Math.floor(hop));
  const wx = lerp(xs[k], xs[Math.min(3, k + 1)], easeInOut(hop - k));
  return (
    <Svg label="A singly linked list with only a head pointer: appending means walking every node to find the last one, linear time" h={260}>
      <T x={xs[0]} y={56} s={13} f={C.latte} a="middle">head</T>
      {xs.slice(0, 4).map((x, i) => <Node key={i} x={x} y={y} label={String(i)} />)}
      {xs.slice(0, 3).map((x, i) => <Link key={i} a={[x, y]} b={[xs[i + 1], y]} t={1} from={0} to={0.01} />)}
      <Node x={xs[4] + 40} y={y + (answer !== null ? 0 : 0)} label="+" f={C.caramel} o={0.8 + 0.2 * Math.sin(t * 3)} />
      {answer !== null && <circle cx={wx} cy={y - 26} r={6} fill={C.cherryText} opacity={s < 2.0 ? 1 : 0} />}
      {answer !== null && <Link a={[xs[3], y]} b={[xs[4] + 40, y]} t={s} from={1.8} to={2.1} f={C.caramel} />}
      {answer !== null && <Tally x={xs[0] - 6} y={140} n={answer !== null ? Math.min(4, Math.floor(hop + 1e-9) + 1) : 0} f={C.cherryText} />}
      {answer === null ? (
        <T x={300} y={210} s={18} f={C.crema} a="middle" w={600} o={0.75 + 0.25 * Math.sin(t * 3)}>append here: cost?</T>
      ) : (
        <T x={300} y={210} s={15} f={C.cherryText} a="middle" o={easeOut(seg(s, 1.8, 2.2))}>walk every node first: O(n)</T>
      )}
    </Svg>
  );
}

// 3 · Doubly: O(1) remove given a node. Four nodes, links both ways; a held pointer marks node 2. Its neighbours re-point
// around it (two bypass arrows draw), and node 2 drops out. No walk.
export function DoublyRemove({ t }: StepCtx) {
  const xs = [80, 220, 360, 500];
  const y = 110;
  const drop = easeInOut(seg(t, 1.9, 2.5));
  const gone = drop > 0.05;
  return (
    <Svg label="A doubly linked list: removing node 2, given a pointer to it, just re-points its two neighbours around it in constant time" h={300}>
      {xs.map((x, i) => <Node key={i} x={x} y={i === 2 ? y + 70 * drop : y} label={String(i)} o={i === 2 ? 1 - 0.7 * drop : 1} f={i === 2 ? C.caramel : C.crema} />)}
      {xs.slice(0, 3).map((x, i) => {
        if (gone && (i === 1 || i === 2)) return null;
        return (
          <g key={i}>
            <Link a={[x, y - 5]} b={[xs[i + 1], y - 5]} t={1} from={0} to={0.01} />
            <Link a={[xs[i + 1], y + 5]} b={[x, y + 5]} t={1} from={0} to={0.01} />
          </g>
        );
      })}
      <path d={`M${xs[2]} 50 L${xs[2]} 84 M${xs[2] - 5} 78 L${xs[2]} 84 L${xs[2] + 5} 78`} stroke={C.caramel} strokeWidth={2} fill="none" opacity={easeOut(seg(t, 0.3, 0.6)) * (1 - drop)} />
      <T x={xs[2]} y={42} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 0.3, 0.6)) * (1 - drop)}>held pointer</T>
      <Draw pts={[[xs[1] + 12, y - 12], [xs[1] + 70, y - 46], [xs[3] - 70, y - 46], [xs[3] - 12, y - 12]]} t={t} from={0.9} to={1.4} stroke={C.caramel} w={2} />
      <Draw pts={[[xs[3] - 12, y + 12], [xs[3] - 70, y + 46], [xs[1] + 70, y + 46], [xs[1] + 12, y + 12]]} t={t} from={1.3} to={1.8} stroke={C.caramel} w={2} />
      <T x={30} y={262} s={13} f={C.crema} o={easeOut(seg(t, 2.2, 2.6))}>neighbours re-point around it: O(1)</T>
      <T x={30} y={288} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.3))}>finding the node is unchanged</T>
    </Svg>
  );
}

// 4 · Circular: no null at the ends. A ring of five nodes and a sentinel S; a walker goes round and round, never hitting
// an end. A new node slides into the ring next to S with the same two re-points as anywhere else.
export function Circular({ t }: StepCtx) {
  const cx = 300, cy = 140, R = 95;
  const ins = easeOutBack(seg(t, 1.4, 2.1));
  const at = (i: number, m: number): Pt => [cx + R * Math.sin((i / m) * Math.PI * 2), cy - R * Math.cos((i / m) * Math.PI * 2)];
  // Positions slide from a 6-ring to a 7-ring as the new node arrives at index 1 (right after S).
  const pos = (i: number): Pt => {
    const a = at(i, 6), b = at(i >= 1 ? i + 1 : i, 7);
    return [lerp(a[0], b[0], clamp(ins)), lerp(a[1], b[1], clamp(ins))];
  };
  const pts: Pt[] = Array.from({ length: 6 }, (_, i) => pos(i));
  const newP = at(1, 7);
  const ring = ins > 0 ? [pts[0], newP, ...pts.slice(1)] : pts;
  const w = ((((Math.max(0, t) * 0.5) % 1) + 1) % 1) * ring.length;
  const wi = Math.min(ring.length - 1, Math.floor(w));
  const wp: Pt = [lerp(ring[wi][0], ring[(wi + 1) % ring.length][0], w - wi), lerp(ring[wi][1], ring[(wi + 1) % ring.length][1], w - wi)];
  return (
    <Svg label="A circular list with a sentinel node S: every pointer is set, and inserting next to the sentinel uses the same code as the middle" h={300}>
      {ring.map((p, i) => <Link key={i} a={p} b={ring[(i + 1) % ring.length]} t={1} from={0} to={0.01} r={17} />)}
      {pts.map((p, i) => <Node key={i} x={p[0]} y={p[1]} label={i === 0 ? 'S' : String(i)} f={i === 0 ? C.caramel : C.crema} />)}
      {ins > 0 && <Node x={newP[0]} y={newP[1] - 30 * (1 - clamp(ins))} label="+" f={C.caramel} o={clamp(ins)} />}
      <circle cx={cx + (wp[0] - cx) * 1.28} cy={cy + (wp[1] - cy) * 1.28} r={5} fill={C.focus} opacity={0.9} />
      <T x={300} y={278} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.3, 2.8))}>S: sentinel, no end, no null check</T>
    </Svg>
  );
}

// 5 · Same records, scattered in memory. Top: six nodes allocated in walk order, short arrows. Bottom: the same six at
// shuffled addresses on the same memory line; the walk's arrows leap back and forth.
const SHUF = [3, 0, 5, 1, 4, 2]; // the address slot of record i in the shuffled layout
export function Scatter({ t }: StepCtx) {
  const slot = (j: number) => 60 + j * 90;
  const top = 80, bot = 210;
  return (
    <Svg label="Six records allocated in walk order give short forward pointers; the same six at shuffled addresses make the walk leap around memory" h={300}>
      <T x={30} y={34} s={13} f={C.taupe}>allocation order matches traversal order</T>
      <line x1={30} y1={top + 24} x2={570} y2={top + 24} stroke={C.mocha} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Node key={i} x={slot(i)} y={top} label={String(i)} o={easeOut(seg(t, i * 0.12, i * 0.12 + 0.3))} />)}
      {[0, 1, 2, 3, 4].map((i) => <Link key={i} a={[slot(i), top]} b={[slot(i + 1), top]} t={t} from={0.8 + i * 0.1} to={0.95 + i * 0.1} f={C.caramel} />)}
      <T x={30} y={164} s={13} f={C.taupe} o={easeOut(seg(t, 1.2, 1.5))}>allocation order defeats traversal order</T>
      <line x1={30} y1={bot + 24} x2={570} y2={bot + 24} stroke={C.mocha} opacity={easeOut(seg(t, 1.2, 1.5))} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Node key={i} x={slot(SHUF[i])} y={bot} label={String(i)} f={C.cinnamon} o={easeOut(seg(t, 1.3 + i * 0.08, 1.6 + i * 0.08))} />)}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = slot(SHUF[i]), b = slot(SHUF[i + 1]);
        const up = i % 2 === 0 ? -1 : 1;
        const mid = (a + b) / 2;
        return <Draw key={i} pts={[[a, bot + up * 16], [mid, bot + up * 44], [b, bot + up * 16]]} t={t} from={1.9 + i * 0.18} to={2.15 + i * 0.18} stroke={C.cinnamon} w={1.5} />;
      })}
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>same six nodes, same next-pointers, different addresses</T>
    </Svg>
  );
}

// 6 · Predict: is walking a list always slower? Two layouts. After the answer two walkers run: the in-order one has a
// prefetch window gliding just ahead of it; the shuffled one jumps, and every landing is a red miss.
export function ChasePredictViz({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const slot = (j: number) => 60 + j * 90;
  const u = seg(s, 0.2, 2.2) * 5;
  const k = Math.min(4, Math.floor(u));
  const f = easeInOut(u - k);
  const inX = lerp(slot(k), slot(k + 1), f);
  const shX = lerp(slot(SHUF[k]), slot(SHUF[k + 1]), f);
  return (
    <Svg label="Walking a list in memory order lets the hardware prefetch ahead; walking it out of order makes every step a miss" h={280}>
      <T x={30} y={34} s={13} f={C.crema}>in order</T>
      {[0, 1, 2, 3, 4, 5].map((i) => <Node key={i} x={slot(i)} y={70} label={String(i)} />)}
      <T x={30} y={144} s={13} f={C.cinnamon}>shuffled</T>
      {[0, 1, 2, 3, 4, 5].map((i) => <Node key={i} x={slot(SHUF[i])} y={180} label={String(i)} f={answer !== null && i <= k && u > 0 ? C.cherryText : C.cinnamon} />)}
      {answer !== null && u < 5 && (
        <g>
          <rect x={inX + 20} y={52} width={160} height={36} rx={8} fill="none" stroke={C.caramel} strokeDasharray="4 3" />
          <circle cx={inX} cy={44} r={5} fill={C.focus} />
          <circle cx={shX} cy={154} r={5} fill={C.cherryText} />
        </g>
      )}
      {answer === null ? (
        <T x={300} y={250} s={20} f={C.crema} a="middle" w={600} o={0.75 + 0.25 * Math.sin(t * 3)}>always slower?</T>
      ) : (
        <T x={300} y={250} s={14} f={C.crema} a="middle" o={easeOut(seg(s, 2.0, 2.4))}>only when order disagrees with memory</T>
      )}
    </Svg>
  );
}

// 7 · Nine cycles versus four hundred fifty: two bars grow to the cited per-element costs (to scale), the counts run up,
// and the fiftyfold gap locks on.
export function ChaseMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 0.9));
  const b = easeInOut(seg(t, 1.2, 2.6));
  return (
    <Svg label="Walked in memory order a list costs about 9 cycles per element; walked out of order about 450 or more: roughly fiftyfold" h={300}>
      <T x={30} y={50} s={14} f={C.crema} w={600}>in memory order</T>
      <rect x={30} y={62} width={540} height={22} rx={4} fill={C.cocoa} />
      <rect x={30} y={62} width={(540 * 9 * a) / 450} height={22} rx={4} fill={C.caramel} />
      <T x={30} y={108} s={13} f={C.crema}>about {Math.round(9 * a)} cycles / element</T>
      <T x={30} y={160} s={14} f={C.cinnamon} w={600}>shuffled</T>
      <rect x={30} y={172} width={540} height={22} rx={4} fill={C.cocoa} />
      <rect x={30} y={172} width={540 * b} height={22} rx={4} fill={C.cinnamon} />
      <T x={30} y={218} s={13} f={C.crema}>about {Math.round(450 * b)}{b >= 1 ? '+' : ''} cycles / element</T>
      <T x={570} y={250} s={26} f={C.cherryText} a="end" serif w={700} o={easeOut(seg(t, 2.8, 3.2))}>×50</T>
      <Reticle x={300} y={136} w={556} h={170} t={t} at={3.0} color={C.latte} />
      <T x={30} y={282} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.7))}>roughly a fiftyfold gap, from allocation order alone</T>
    </Svg>
  );
}

// 8 · O(1) splice versus an array's shift. A run of three nodes lifts out of list A and drops into list B; four pointer
// rewrites flash and tally. Below, the array version: every cell after the cut slides over, one move each.
export function Splice({ t }: StepCtx) {
  const xs = [50, 110, 170, 230, 290, 350, 410, 470, 530];
  const y = 70;
  const lift = easeInOut(seg(t, 0.4, 1.2));
  const rew = Math.floor(seg(t, 1.2, 2.0) * 4 + 1e-9) + (t >= 2.0 ? 0 : 0);
  const close = easeInOut(seg(t, 1.2, 1.6));
  const shift = easeInOut(seg(t, 2.1, 3.3));
  const run = [3, 4, 5];
  return (
    <Svg label="Splicing a run of nodes from one list to another rewrites four pointers whatever the run's length; the array version shifts every element after the cut" h={330}>
      <T x={30} y={28} s={13} f={C.taupe}>list: splice a run, 4 pointer rewrites, any length</T>
      {xs.map((x, i) => {
        const inRun = run.includes(i);
        const after = i > 5;
        const xx = inRun ? x : after ? x - 180 * close : x;
        const yy = inRun ? y + 76 * lift : y;
        return <Node key={i} x={xx} y={yy} label={String(i)} r={12} f={inRun ? C.caramel : C.crema} />;
      })}
      <T x={30} y={y + 82} s={13} f={C.latte} o={lift}>into list B</T>
      <T x={30} y={186} s={13} f={C.latte}>pointer rewrites</T>
      <Tally x={232} y={176} n={Math.min(4, rew)} f={C.caramel} />
      <T x={30} y={226} s={13} f={C.taupe}>array: the same move shifts every element after it</T>
      {Array.from({ length: 16 }, (_, i) => {
        const moved = i >= 6 && shift * 10 > i - 6;
        return <rect key={i} x={30 + i * 34 - (i >= 6 ? 102 * clamp(shift * 10 - (i - 6)) : 0)} y={240} width={28} height={22} rx={3} fill={moved ? C.cinnamon : C.cocoa} stroke={C.latte} opacity={i >= 3 && i < 6 ? 1 - clamp(shift * 4) : 1} />;
      })}
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.7))}>cost scales with how much lies after the cut</T>
    </Svg>
  );
}

// 9 · An address that never moves. A pointer pins node X; nodes come and go on both sides and X never moves. Below, a
// vector's pointer dies the moment an append reallocates the buffer.
export function StableAddress({ t }: StepCtx) {
  const xs = [60, 150, 240, 330, 420, 510];
  const y = 90;
  const churn = (i: number) => (i === 2 ? 1 : 0.35 + 0.65 * Math.abs(Math.cos(t * 2.4 + i)));
  const realloc = easeOut(seg(t, 2.2, 2.6));
  return (
    <Svg label="A pointer to a list node stays valid while other nodes are inserted and removed; a pointer into a vector dies when push_back reallocates" h={300}>
      <T x={30} y={34} s={13} f={C.taupe}>list node: address fixed for its lifetime</T>
      {xs.map((x, i) => <Node key={i} x={x} y={y} label={i === 2 ? 'X' : '·'} f={i === 2 ? C.caramel : C.crema} o={i === 2 ? 1 : t > 0.6 && t < 2.0 ? churn(i) : 1} />)}
      <path d={`M${xs[2]} 136 L${xs[2]} 110 M${xs[2] - 5} 116 L${xs[2]} 110 L${xs[2] + 5} 116`} stroke={C.caramel} strokeWidth={2} fill="none" />
      <T x={xs[2] + 14} y={140} s={13} f={C.caramel} o={easeOut(seg(t, 1.6, 2.0))}>still valid</T>
      <T x={30} y={196} s={13} f={C.taupe}>vector: one push_back reallocates</T>
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={30 + i * 32} y={210} width={28} height={22} rx={3} fill={realloc > 0 ? C.cherry : C.cocoa} stroke={realloc > 0 ? C.cherryText : C.latte} opacity={1 - 0.5 * realloc} />)}
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={240 + i * 28} y={210} width={24} height={22} rx={3} fill={i < 7 ? C.crema : 'none'} stroke={C.latte} opacity={realloc} />)}
      <path d="M78 262 L78 238 M73 244 L78 238 L83 244" stroke={realloc > 0.5 ? C.cherryText : C.crema} strokeWidth={2} fill="none" />
      <T x={92} y={270} s={13} f={C.cherryText} o={easeOut(seg(t, 2.5, 3.0))}>dead the instant it reallocates</T>
    </Svg>
  );
}

// 10 · The intrusive idea. Left: the generic way, a node allocation pointing at a payload allocation. Right: the payload
// struct with two embedded list_heads; two independent lists thread through the same structs.
export function Intrusive({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const b = easeOut(seg(t, 1.0, 1.5));
  const structs = [60, 230, 400];
  return (
    <Svg label="A generic list allocates a node per element pointing at the payload; an intrusive list embeds list_head fields in the payload struct, so one struct can sit on two lists" h={330}>
      <g opacity={a}>
        <T x={30} y={30} s={13} f={C.taupe}>generic: a separate node allocation per element</T>
        <rect x={40} y={44} width={70} height={30} rx={5} fill="none" stroke={C.latte} />
        <T x={75} y={64} s={13} f={C.latte} a="middle">node</T>
        <rect x={170} y={44} width={90} height={30} rx={5} fill="none" stroke={C.latte} />
        <T x={215} y={64} s={13} f={C.latte} a="middle">payload</T>
        <Link a={[110, 59]} b={[170, 59]} t={t} from={0.5} to={0.8} r={2} />
      </g>
      <T x={30} y={118} s={13} f={C.taupe} o={b}>intrusive: list_head lives inside the payload struct</T>
      {structs.map((x, i) => (
        <g key={i} opacity={easeOut(seg(t, 1.1 + i * 0.2, 1.5 + i * 0.2))}>
          <rect x={x} y={132} width={140} height={96} rx={8} fill={C.roast} stroke={C.crema} />
          <T x={x + 12} y={152} s={13} f={C.crema}>payload</T>
          <rect x={x + 12} y={164} width={116} height={22} rx={4} fill={C.cocoa} stroke={C.caramel} />
          <T x={x + 70} y={180} s={13} f={C.caramel} a="middle">list_head a</T>
          <rect x={x + 12} y={194} width={116} height={22} rx={4} fill={C.cocoa} stroke={C.cinnamon} />
          <T x={x + 70} y={210} s={13} f={C.cinnamon} a="middle">list_head b</T>
        </g>
      ))}
      <Draw pts={[[structs[0] + 128, 175], [structs[1] + 12, 175]]} t={t} from={2.0} to={2.3} stroke={C.caramel} w={2} />
      <Draw pts={[[structs[1] + 128, 175], [structs[2] + 12, 175]]} t={t} from={2.3} to={2.6} stroke={C.caramel} w={2} />
      <Draw pts={[[structs[2] + 70, 216], [structs[2] + 70, 248], [structs[0] + 70, 248], [structs[0] + 70, 216]]} t={t} from={2.6} to={3.2} stroke={C.cinnamon} w={2} />
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.7))}>no second allocation; two embedded fields, two lists</T>
    </Svg>
  );
}

// 11 · Recovering the struct from the link field. Memory as a strip; the struct starts at its address, the link field
// sits at a fixed offset. From a pointer to the field, an arrow walks back by exactly the offset and lands on the struct.
export function ContainerOf({ t }: StepCtx) {
  const X0 = 80, LINK = 320;
  const back = easeInOut(seg(t, 1.4, 2.4));
  const px = lerp(LINK, X0, back);
  return (
    <Svg label="A pointer to an embedded link field walks backward by the field's fixed offset to the struct's own address" h={300}>
      <rect x={X0} y={100} width={420} height={40} rx={6} fill={C.roast} stroke={C.crema} />
      <T x={X0} y={88} s={13} f={C.crema}>struct address</T>
      <rect x={LINK} y={104} width={150} height={32} rx={4} fill={C.cocoa} stroke={C.caramel} />
      <T x={LINK + 75} y={125} s={13} f={C.caramel} a="middle">link field</T>
      <path d={`M${px} 186 L${px} 146 M${px - 6} 154 L${px} 146 L${px + 6} 154`} stroke={back >= 1 ? C.caramel : C.crema} strokeWidth={2.2} fill="none" />
      <T x={px} y={206} s={13} f={C.crema} a="middle">{back >= 1 ? 'the struct' : 'pointer here'}</T>
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <path d={`M${X0} 64 v-8 h${LINK - X0} v8`} stroke={C.latte} fill="none" />
        <T x={(X0 + LINK) / 2} y={48} s={13} f={C.latte} a="middle">offset, fixed at compile time</T>
      </g>
      <Reticle x={X0 + 210} y={120} w={432} h={54} t={t} at={2.4} />
      <T x={30} y={262} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.3))}>subtract the field's fixed, compile-time offset</T>
    </Svg>
  );
}

// 12 · Predict: does container_of check the type? After the answer the wrong type lights red and the verdict decodes.
export function ContainerOfPredictViz({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  return (
    <Svg label="container_of called with the wrong type: today's macro turns the mismatch into a compile-time error" h={240}>
      <T x={30} y={60} s={14} f={C.crema}>
        container_of(ptr, <tspan fill={answer !== null ? C.cherryText : C.crema} fontWeight={answer !== null ? 700 : 400}>WrongType</tspan>, member)
      </T>
      {answer === null ? (
        <T x={300} y={150} s={20} f={C.crema} a="middle" w={600} o={0.75 + 0.25 * Math.sin(t * 3)}>caught?</T>
      ) : (
        <>
          <Decode x={300} y={150} s={16} f={C.caramel} a="middle" w={700} text="yes: a build error" t={s} at={0.4} dur={0.5} />
          <T x={300} y={180} s={13} f={C.latte} a="middle" o={easeOut(seg(s, 0.8, 1.2))}>a compile-time type check</T>
          <Reticle x={300} y={155} w={280} h={64} t={s} at={0.9} />
        </>
      )}
    </Svg>
  );
}

// 13 · Back to the problem. Three gains, each replaying its motion in miniature, against the one measured cost.
export function Verdict({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['Splice', '4 pointer rewrites, any run length', C.caramel],
    ['Stable addresses', 'a node never moves while it lives', C.caramel],
    ['Intrusive linking', 'no second allocation, several lists', C.caramel],
    ['The cost', 'about a fiftyfold gap when order disagrees', C.cherryText],
  ];
  return (
    <Svg label="Three gains of a linked list, splice, stable addresses, intrusive linking, against a fiftyfold cost when walk order disagrees with memory" h={330}>
      {rows.map(([k, v, f], i) => {
        const at = 0.3 + i * 0.7;
        const a = easeOut(seg(t, at, at + 0.4));
        const m = seg(t, at + 0.2, at + 0.9);
        const y = 40 + i * 72;
        return (
          <g key={k} opacity={a} transform={`translate(${((1 - a) * 20).toFixed(1)} 0)`}>
            <T x={30} y={y} s={15} f={f} w={700}>{k}</T>
            <T x={30} y={y + 22} s={13} f={C.latte}>{v}</T>
            {i === 0 && <Tally x={470} y={y - 12} n={Math.floor(m * 4 + 1e-9)} f={C.caramel} />}
            {i === 1 && <circle cx={500} cy={y - 6} r={9} fill="none" stroke={C.caramel} strokeWidth={2} />}
            {i === 1 && <circle cx={470 + 60 * Math.abs(Math.sin(m * 6))} cy={y - 6} r={4} fill={C.latte} opacity={m < 1 ? 1 : 0} />}
            {i === 2 && <Draw pts={[[440, y - 6], [480, y - 16], [520, y - 6], [560, y - 16]]} t={m} from={0} to={1} stroke={C.caramel} w={2} />}
            {i === 3 && <rect x={420} y={y - 16} width={150 * easeOut(m)} height={12} rx={3} fill={C.cherry} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 14 · Prove it, 1 of 2. Three splices of a ten-thousand-node list, runs of 1, 37 and 5,000 nodes: each one's rewrite
// tally stops at 4, while the array's moved-elements bar runs into the thousands every time.
export function ProveIt1({ t }: StepCtx) {
  const runs = ['1', '37', '5,000'];
  const moves = [0.98, 0.97, 0.5]; // share of the bar: >9,000, >9,000 and >4,000 elements moved (examples.py)
  return (
    <Svg label="Splicing runs of 1, 37 and 5,000 nodes out of a 10,000-node list always rewrites 4 pointers; the array equivalent moves thousands of elements each time" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>run length</T>
      <T x={150} y={28} s={13} f={C.caramel}>list rewrites</T>
      <T x={300} y={28} s={13} f={C.cinnamon}>array elements moved</T>
      {runs.map((r, i) => {
        const at = 0.3 + i * 0.9;
        const k = easeInOut(seg(t, at, at + 0.8));
        const y = 70 + i * 70;
        return (
          <g key={r} opacity={easeOut(seg(t, at - 0.1, at + 0.2))}>
            <T x={30} y={y + 10} s={16} f={C.crema} w={600}>{r}</T>
            <Tally x={150} y={y} n={Math.floor(k * 4 + 1e-9)} f={C.caramel} />
            <rect x={300} y={y} width={270 * moves[i] * k} height={14} rx={3} fill={C.cinnamon} />
            <T x={300} y={y + 36} s={13} f={C.latte} o={k}>{i < 2 ? '9,000+' : '4,000+'}</T>
          </g>
        );
      })}
      <T x={30} y={284} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.5))}>the list's cost never changes;</T>
      <T x={30} y={306} s={13} f={C.latte} o={easeOut(seg(t, 3.1, 3.6))}>the array's always dwarfs it</T>
    </Svg>
  );
}

// 15 · Prove it, 2 of 2. The ctypes struct: its address, the link field at its real offset; subtracting the offset from
// the link's address lands exactly on the struct, and the two addresses lock together.
export function ProveIt2({ t }: StepCtx) {
  const back = easeInOut(seg(t, 1.0, 2.0));
  const X0 = 80, LINK = 260;
  return (
    <Svg label="A real C struct built with ctypes: the recovered address from subtracting the link field's real offset matches the struct's own address exactly" h={300}>
      <T x={30} y={34} s={13} f={C.taupe}>a ctypes struct, an embedded link field</T>
      <rect x={X0} y={70} width={440} height={40} rx={6} fill={C.roast} stroke={C.crema} />
      <rect x={X0 + 6} y={76} width={LINK - X0 - 12} height={28} rx={4} fill={C.cocoa} />
      <T x={(X0 + LINK) / 2} y={95} s={13} f={C.latte} a="middle">int field</T>
      <rect x={LINK} y={74} width={170} height={32} rx={4} fill={C.cocoa} stroke={C.caramel} />
      <T x={LINK + 85} y={95} s={13} f={C.caramel} a="middle">link field</T>
      <Draw pts={[[LINK, 140], [lerp(LINK, X0, back), 140]]} t={t} from={1.0} to={2.0} stroke={C.caramel} w={2.5} />
      <T x={(X0 + LINK) / 2} y={164} s={13} f={C.caramel} a="middle" o={back}>− its real offset</T>
      <Reticle x={X0} y={90} w={30} h={56} t={t} at={2.1} />
      <Decode x={30} y={220} s={15} f={C.crema} w={700} text="= the struct's own address" t={t} at={2.3} dur={0.6} />
      <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.5))}>a real, working container_of</T>
    </Svg>
  );
}
