import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): node colour is the subject here, so red nodes are cherry-filled with a
// cherryText ring and black nodes are near-black with a crema ring. caramel = the thing to look at (the
// climb, the rotation, a rule being checked); cinnamon = the compared alternative (last topic's chain
// height, the bound); cherryText text = the broken rule. Every tree drawn is the exact state examples.py's
// own RedBlackTree reaches inserting keys in sorted order (its worst case), laid out by in-order rank so a
// node's x never changes; every printed number is printed by examples.py or is the sourced bound.

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
type Col = 'R' | 'B' | 'G';
const R = 13;

function Nd({ p, c, o = 1, sc = 1, ring }: { p: Pt; c: Col; o?: number; sc?: number; ring?: string }) {
  if (o <= 0) return null;
  const fill = c === 'R' ? C.cherry : c === 'B' ? C.espresso : C.cocoa;
  const stroke = c === 'R' ? C.cherryText : c === 'B' ? C.crema : C.taupe;
  return (
    <g opacity={o} transform={`translate(${p[0]} ${p[1]}) scale(${Math.max(0, sc)})`}>
      <circle cx={0} cy={0} r={R} fill={fill} stroke={stroke} strokeWidth={2} />
      {ring && <circle cx={0} cy={0} r={R + 5} fill="none" stroke={ring} strokeWidth={2} />}
    </g>
  );
}

function Ed({ a, b, f = C.mocha, o = 1, w = 1.4 }: { a: Pt; b: Pt; f?: string; o?: number; w?: number }) {
  if (o <= 0) return null;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
  return <line x1={a[0] + ux * R} y1={a[1] + uy * R} x2={b[0] - ux * R} y2={b[1] - uy * R} stroke={f} strokeWidth={w} opacity={o} />;
}

function Check({ x, y, t, at, f = C.caramel }: { x: number; y: number; t: number; at: number; f?: string }) {
  return <Draw pts={[[x - 6, y], [x - 2, y + 5], [x + 7, y - 6]]} t={t} from={at} to={at + 0.25} stroke={f} w={2} pen={false} />;
}

/** examples.py's tree after sorted inserts 1..7: [colour, depth, parent]. */
const T7: Record<number, [Col, number, number]> = { 1: ['B', 1, 2], 2: ['B', 0, 0], 3: ['B', 2, 4], 4: ['R', 1, 2], 5: ['R', 3, 6], 6: ['B', 2, 4], 7: ['R', 3, 6] };
/** ...after inserting 8, before any fix: 8 lands red under red 7. */
const T8pre: Record<number, [Col, number, number]> = { ...T7, 8: ['R', 4, 7] };
/** ...after the fix: recolour at 7, climb to 6, one left rotation at 2. */
const T8: Record<number, [Col, number, number]> = { 1: ['B', 2, 2], 2: ['R', 1, 4], 3: ['B', 2, 2], 4: ['B', 0, 0], 5: ['B', 2, 6], 6: ['R', 1, 4], 7: ['B', 2, 6], 8: ['R', 3, 7] };
const X8 = (k: number) => 60 + (k - 1) * 68;

// 1 · From chain to colour. Last topic's seven sorted keys stand as one long red chain; each node slides up
// (x is in-order rank, so only y moves) into the short tree examples.py's red-black tree builds from the same
// sorted order, and the colours ring in.
export function Opening({ t }: StepCtx) {
  const X = (k: number) => 90 + (k - 1) * 70;
  const u = easeInOut(seg(t, 1.0, 2.2));
  const col = easeOut(seg(t, 2.2, 2.7));
  const pos = (k: number): Pt => [X(k), lerp(70 + (k - 1) * 34, 80 + T7[k][1] * 54, u)];
  return (
    <Svg label="Last topic's seven sorted keys stand as one long chain, then settle into a short red-black tree built from the same order, each node keeping its left-to-right place" h={320}>
      {u < 0.5 && <T x={30} y={30} s={13} f={C.cherryText} o={1 - u * 2}>before: one long chain</T>}
      {u >= 0.5 && <T x={30} y={30} s={13} f={C.caramel} o={u * 2 - 1}>now: short, colour-ringed</T>}
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (k > 1 ? <Ed key={`c${k}`} a={pos(k - 1)} b={pos(k)} f={C.cherryText} o={1 - u} /> : null))}
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (T7[k][2] ? <Ed key={`e${k}`} a={pos(T7[k][2])} b={pos(k)} o={u} /> : null))}
      {[1, 2, 3, 4, 5, 6, 7].map((k) => <Nd key={k} p={pos(k)} c={col > 0 ? T7[k][0] : 'G'} />)}
      <T x={30} y={300} s={13} f={C.crema} o={easeOut(seg(t, 2.7, 3.1))}>one rule, about colour, stops the chain forming</T>
    </Svg>
  );
}

// 2 · The four rules, one at a time, on examples.py's 8-key tree. Colours fill in; the root gets a ring; each
// red node's children light with a check; then every empty spot shows its count of black nodes on the way
// down as a stack of dots, all stacks the same height.
export function FiveInvariants({ t }: StepCtx) {
  const pos = (k: number): Pt => [X8(k), 56 + T8[k][1] * 42];
  const keys = [1, 2, 3, 4, 5, 6, 7, 8];
  const r1 = t >= 0.4, r2 = t >= 1.1;
  // empty children: [parent key, side]
  const nil: [number, number][] = [[1, -1], [1, 1], [3, -1], [3, 1], [5, -1], [5, 1], [7, -1], [8, -1], [8, 1]];
  const blackAbove = (k: number) => {
    let n = 0;
    for (let c = k; c; c = T8[c][2]) if (T8[c][0] === 'B') n++;
    return n;
  };
  return (
    <Svg label="The four colour rules checked on a red-black tree: every node is red or black, the root is black, no red node has a red child, and every path down to an empty spot passes the same number of black nodes" h={320}>
      {keys.map((k) => (T8[k][2] ? <Ed key={`e${k}`} a={pos(T8[k][2])} b={pos(k)} f={t >= 1.5 && T8[T8[k][2]][0] === 'R' ? C.caramel : C.mocha} w={t >= 1.5 && T8[T8[k][2]][0] === 'R' ? 2 : 1.4} /> : null))}
      {nil.map(([p, sd], i) => {
        const [px, py] = pos(p);
        const o = easeOut(seg(t, 2.4 + i * 0.08, 2.6 + i * 0.08));
        const x = px + sd * 20, y = py + 34;
        return (
          <g key={i} opacity={o}>
            <line x1={px + sd * 9} y1={py + 9} x2={x} y2={y - 5} stroke={C.mocha} strokeWidth={1} />
            <rect x={x - 5} y={y - 5} width={10} height={10} fill={C.espresso} stroke={C.taupe} strokeWidth={1} />
            {Array.from({ length: blackAbove(p) }, (_, j) => <circle key={j} cx={x} cy={y + 12 + j * 8} r={2.6} fill={C.caramel} />)}
          </g>
        );
      })}
      {keys.map((k) => <Nd key={k} p={pos(k)} c={r1 ? T8[k][0] : 'G'} ring={k === 4 && r2 ? C.caramel : undefined} />)}
      {[2, 6, 8].map((k, i) => <Check key={k} x={pos(k)[0] + 24} y={pos(k)[1] - 10} t={t} at={1.5 + i * 0.25} />)}
      <T x={30} y={250} s={13} f={C.crema} o={r1 ? 1 : 0}>every node: red or black</T>
      <T x={30} y={268} s={13} f={C.crema} o={easeOut(seg(t, 1.1, 1.4))}>the root: black</T>
      <T x={30} y={286} s={13} f={C.crema} o={easeOut(seg(t, 1.5, 1.8))}>a red node: never a red child</T>
      <T x={30} y={304} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 3.0))}>every path down: the same count of black nodes</T>
    </Svg>
  );
}

// 3 · Predict: red under red. examples.py's 7-key tree takes its next sorted key, 8, as a red leaf under red
// 7; the red-red edge flashes. After the answer: the in-order check still passes, the colour rule does not.
export function ViolationPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pos = (k: number): Pt => [X8(k), 60 + T8pre[k][1] * 46];
  const keys = [1, 2, 3, 4, 5, 6, 7, 8];
  const flash = 0.55 + 0.45 * Math.sin(t * 6);
  return (
    <Svg label="A new red node lands directly under a red parent: the search-tree order is still fine, but the colour rule is broken" h={320}>
      {keys.map((k) => (T8pre[k][2] ? <Ed key={`e${k}`} a={pos(T8pre[k][2])} b={pos(k)} f={k === 8 ? C.cherryText : C.mocha} w={k === 8 ? 3 : 1.4} o={k === 8 ? flash : 1} /> : null))}
      {keys.map((k) => <Nd key={k} p={pos(k)} c={T8pre[k][0]} ring={k === 8 ? C.caramel : undefined} />)}
      <T x={X8(8) - 20} y={pos(8)[1] + 36} s={13} f={C.caramel} a="middle">new</T>
      {!answered && <T x={30} y={300} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>red under red: now what?</T>}
      {answered && (
        <>
          <T x={30} y={262} s={13} f={C.crema} o={easeOut(seg(s, 0.2, 0.5))}>search-tree order: still fine</T>
          <Check x={350} y={257} t={s} at={0.4} />
          <T x={30} y={286} s={13} f={C.cherryText} o={easeOut(seg(s, 0.7, 1.0))}>colour rule: broken, needs repair</T>
        </>
      )}
    </Svg>
  );
}

// 4 · The fix, as examples.py runs it. Recolour: the parent 7 and uncle 5 turn black, grandparent 6 turns red; the ring climbs to 6, which now sits red under red 4. Recolouring cannot
// settle that (6's uncle, 1, is black), so one left rotation at 2 finishes: 4 rises to the root.
export function FixReveal({ t }: StepCtx) {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8];
  const flip = t >= 0.8;
  const climb = easeInOut(seg(t, 1.2, 1.6));
  const u = easeInOut(seg(t, 2.2, 3.1));
  const colour = (k: number): Col => {
    if (u >= 1) return T8[k][0];
    if (flip && (k === 5 || k === 7)) return 'B';
    if (flip && k === 6) return 'R';
    return T8pre[k][0];
  };
  const dep = (k: number) => lerp(T8pre[k][1], T8[k][1], u);
  const pos = (k: number): Pt => [X8(k), 70 + dep(k) * 44];
  const ring: Pt = [lerp(X8(8), X8(6), climb), lerp(70 + 4 * 44, 70 + 2 * 44, climb)];
  const pairOld = (k: number) => T8pre[k][2];
  const pairNew = (k: number) => T8[k][2];
  return (
    <Svg label="Recolouring flips the parent and uncle to black and the grandparent to red, pushing the problem two levels up; there recolouring cannot help, so one rotation finishes the repair" h={320}>
      <T x={30} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 0.3, 0.6))}>1 &middot; recolour, then climb</T>
      <T x={330} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 1.9, 2.2))}>2 &middot; one rotation</T>
      {keys.map((k) => (k !== 6 && pairOld(k) && pairOld(k) === pairNew(k) ? <Ed key={`e${k}`} a={pos(pairOld(k))} b={pos(k)} /> : null))}
      <Ed a={pos(2)} b={pos(4)} f={t >= 1.6 && u < 1 ? C.caramel : C.mocha} w={1.8} />
      <Ed a={pos(4)} b={pos(3)} o={1 - u} />
      <Ed a={pos(2)} b={pos(3)} o={u} f={C.caramel} w={1.8} />
      <Ed a={pos(4)} b={pos(6)} f={t >= 1.6 && u <= 0 ? C.cherryText : C.mocha} w={t >= 1.6 && u <= 0 ? 3 : 1.4} />
      {keys.map((k) => <Nd key={k} p={pos(k)} c={colour(k)} />)}
      {t >= 1.2 && u <= 0 && <circle cx={ring[0]} cy={ring[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
      <T x={30} y={286} s={13} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>red under red again, two levels up</T>
      <T x={30} y={308} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>recolouring first; a rotation only when it can&apos;t</T>
    </Svg>
  );
}

// 5 · The disguise. On the fixed 8-key tree, each black node and its red children get one dashed outline;
// then the red children rise to their black parent's level and every outline becomes one wide node of a
// 2-3-4 tree: a 4-node, a 3-node and 2-nodes, with every leaf at the same depth.
export function TwoThreeFourEncoding({ t }: StepCtx) {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8];
  const hull = easeOut(seg(t, 0.3, 1.0));
  const u = easeInOut(seg(t, 1.3, 2.4));
  const groups: { ks: number[]; top: number; label: string }[] = [
    { ks: [2, 4, 6], top: 4, label: '4-node' },
    { ks: [1], top: 1, label: '2-node' },
    { ks: [3], top: 3, label: '2-node' },
    { ks: [5], top: 5, label: '2-node' },
    { ks: [7, 8], top: 7, label: '3-node' },
  ];
  const gOf = (k: number) => groups.find((g) => g.ks.includes(k))!;
  const y234 = (k: number) => (gOf(k).top === 4 ? 90 : 200);
  const pos = (k: number): Pt => [X8(k), lerp(70 + T8[k][1] * 52, y234(k), u)];
  const lab = easeOut(seg(t, 2.5, 2.9));
  return (
    <Svg label="Each black node with its red children is outlined; the red children rise to their parent's level and every outline becomes one wide node of a 2-3-4 tree" h={320}>
      {keys.map((k) => (T8[k][2] && gOf(k) !== gOf(T8[k][2]) ? <Ed key={`e${k}`} a={pos(T8[k][2])} b={pos(k)} /> : null))}
      {keys.map((k) => (T8[k][2] && gOf(k) === gOf(T8[k][2]) ? <Ed key={`i${k}`} a={pos(T8[k][2])} b={pos(k)} f={C.cherryText} o={1 - u} /> : null))}
      {groups.map((g) => {
        const ps = g.ks.map(pos);
        const x0 = Math.min(...ps.map((p) => p[0])) - 22, x1 = Math.max(...ps.map((p) => p[0])) + 22;
        const y0 = Math.min(...ps.map((p) => p[1])) - 22, y1 = Math.max(...ps.map((p) => p[1])) + 22;
        return (
          <g key={g.top} opacity={hull}>
            <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx={14} fill="none" stroke={C.caramel} strokeWidth={u >= 1 ? 2 : 1.3} strokeDasharray={u >= 1 ? undefined : '5 4'} />
            <T x={g.top === 4 ? x1 + 10 : (x0 + x1) / 2} y={g.top === 4 ? (y0 + y1) / 2 + 5 : y1 + 18} s={13} f={C.latte} a={g.top === 4 ? 'start' : 'middle'} o={lab}>{g.label}</T>
          </g>
        );
      })}
      {keys.map((k) => <Nd key={k} p={pos(k)} c={T8[k][0]} />)}
      <line x1={30} y1={250} x2={570} y2={250} stroke={C.cinnamon} strokeWidth={1.2} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.9, 3.2))} />
      <T x={30} y={284} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.9, 3.2))}>every leaf at the same depth</T>
      <T x={30} y={308} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>a binary tree, pretending to be a wider one</T>
    </Svg>
  );
}

/** A tall zigzag path, bottom (i = 0) to top: the recolouring climb. */
const climbPt = (i: number): Pt => [170 + (i % 2 === 0 ? -28 : 28), 270 - i * 28];

function RotGlyph({ x, y, t, at }: { x: number; y: number; t: number; at: number }) {
  const k = easeOutBack(seg(t, at, at + 0.3));
  if (k <= 0) return null;
  const pts: Pt[] = Array.from({ length: 13 }, (_, j) => {
    const a = -Math.PI * 0.9 + (j / 12) * Math.PI * 1.5;
    return [x + Math.cos(a) * 10, y + Math.sin(a) * 10];
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.caramel} strokeWidth={2} />
      <path d={`M ${pts[12][0] - 5} ${pts[12][1] - 3} L ${pts[12][0]} ${pts[12][1]} L ${pts[12][0] - 1} ${pts[12][1] - 6}`} fill="none" stroke={C.caramel} strokeWidth={2} />
    </g>
  );
}

// 6 · Predict: the rotation ceiling. A tall path up from a new red leaf with a question mark beside it.
// After the answer, the sourced ceilings appear as rotation glyphs: two for an insert, three for a delete.
export function RotationBoundPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  return (
    <Svg label="A tall path from a new red leaf up to the root; how many rotations can one insert or delete need?" h={320}>
      {Array.from({ length: 8 }, (_, i) => (i > 0 ? <Ed key={`e${i}`} a={climbPt(i)} b={climbPt(i - 1)} /> : null))}
      {Array.from({ length: 8 }, (_, i) => <Nd key={i} p={climbPt(i)} c={i === 0 ? 'R' : i % 2 ? 'B' : 'R'} ring={i === 0 ? C.caramel : undefined} />)}
      <T x={30} y={24} s={13} f={C.latte}>the climb can reach the root</T>
      {!answered && <T x={330} y={160} s={40} f={C.caramel} o={0.6 + 0.4 * Math.sin(t * 3)}>?</T>}
      {!answered && <T x={30} y={310} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>rotations, at most?</T>}
      {answered && (
        <>
          <T x={300} y={110} s={13} f={C.crema} o={easeOut(seg(s, 0.1, 0.4))}>insert: at most 2</T>
          {[0, 1].map((i) => <RotGlyph key={i} x={320 + i * 34} y={140} t={s} at={0.3 + i * 0.2} />)}
          <T x={300} y={200} s={13} f={C.crema} o={easeOut(seg(s, 0.8, 1.1))}>delete: at most 3</T>
          {[0, 1, 2].map((i) => <RotGlyph key={i} x={320 + i * 34} y={230} t={s} at={1.0 + i * 0.2} />)}
          <T x={30} y={310} s={13} f={C.cinnamon} o={easeOut(seg(s, 1.8, 2.2))}>never more, however tall the climb</T>
        </>
      )}
    </Svg>
  );
}

// 7 · Tall climb, short rotation. Up the zigzag, each recolour flips a pair and the caramel ring climbs one
// grandparent at a time, all the way up; the bracket beside it grows to the tree's height. At the top, the
// single rotation: three nodes, a chain becoming a triangle, inside a bracket that never grows.
export function RotationBoundReveal({ t }: StepCtx) {
  const climb = clamp(seg(t, 0.3, 2.2)) * 7;
  const lvl = Math.floor(climb + 1e-9);
  const ring = (() => {
    const i = Math.min(6, lvl);
    const f = climb - i;
    const a = climbPt(i), b = climbPt(Math.min(7, i + 1));
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)] as Pt;
  })();
  const col = (i: number): Col => {
    const base: Col = i === 0 ? 'R' : i % 2 ? 'B' : 'R';
    if (i < lvl) return base === 'R' && i > 0 ? 'B' : base === 'B' ? 'R' : base;
    return base;
  };
  const u = easeInOut(seg(t, 2.6, 3.3));
  // the rotation: a right-leaning chain of three becomes a balanced triangle
  const before: Pt[] = [[410, 80], [460, 120], [510, 160]];
  const after: Pt[] = [[410, 120], [460, 80], [510, 120]];
  const tri = (j: number): Pt => [before[j][0], lerp(before[j][1], after[j][1], u)];
  return (
    <Svg label="The recolouring climb can rise through every level of the tree; the rotation at the end is always one small, fixed-size move" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>the climb: as tall as the tree</T>
      {Array.from({ length: 8 }, (_, i) => (i > 0 ? <Ed key={`e${i}`} a={climbPt(i)} b={climbPt(i - 1)} /> : null))}
      {Array.from({ length: 8 }, (_, i) => <Nd key={i} p={climbPt(i)} c={col(i)} />)}
      {t > 0.3 && t < 2.4 && <circle cx={ring[0]} cy={ring[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
      <line x1={100} y1={climbPt(0)[1] + R} x2={100} y2={lerp(climbPt(0)[1] + R, climbPt(7)[1] - R, clamp(seg(t, 0.3, 2.2)))} stroke={C.cinnamon} strokeWidth={2} />
      <g opacity={easeOut(seg(t, 2.3, 2.6))}>
        <Ed a={tri(0)} b={tri(1)} f={C.caramel} w={2} />
        <Ed a={tri(1)} b={tri(2)} f={C.caramel} w={2} />
        {[0, 1, 2].map((j) => <Nd key={j} p={tri(j)} c={j === 1 && u >= 1 ? 'B' : j === 0 && u < 1 ? 'B' : 'R'} />)}
        <path d="M 380 186 v 8 H 540 v -8" fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={460} y={214} s={13} f={C.caramel} a="middle">one rotation</T>
      </g>
      <T x={330} y={260} s={13} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>never taller than this</T>
    </Svg>
  );
}

// 8 · Why height stays small. One root-to-leaf path of a 2-3-4 tree: three wide nodes (all leaves sit at this
// depth). Each wide node unfolds into a black node with a red child under it: at most two levels each, so the
// red-black path is at most twice as long. Beside it, last topic's chain on the same keys runs off the canvas.
export function HeightBound({ t }: StepCtx) {
  const u = easeInOut(seg(t, 1.0, 2.2));
  const ghost = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="Each node of a 2-3-4 tree path unfolds into at most two red-black levels, so the red-black height is at most twice the 2-3-4 height, while last topic's chain grows with every key" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>2-3-4 path</T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={40} y={50 + i * 80} width={100} height={30} rx={14} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.6} />
          {i < 2 && <line x1={90} y1={80 + i * 80} x2={90} y2={130 + i * 80} stroke={C.mocha} strokeWidth={1.4} />}
        </g>
      ))}
      <line x1={24} y1={50} x2={24} y2={210} stroke={C.cinnamon} strokeWidth={2} />
      <T x={30} y={264} s={13} f={C.cinnamon}>h levels</T>
      <T x={210} y={24} s={13} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>red-black path</T>
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const g = Math.floor(j / 2);
        const from: Pt = [90, 65 + g * 80];
        const to: Pt = [250 + (j % 2) * 30, 52 + j * 36];
        const p: Pt = [lerp(from[0], to[0], u), lerp(from[1], to[1], u)];
        const next: Pt = [lerp(90, 250 + ((j + 1) % 2) * 30, u), lerp(65 + Math.floor((j + 1) / 2) * 80, 52 + (j + 1) * 36, u)];
        return (
          <g key={j} opacity={easeOut(seg(t, 0.9, 1.2))}>
            {j < 5 && <Ed a={p} b={next} o={u} />}
            <Nd p={p} c={j % 2 ? 'R' : 'B'} />
          </g>
        );
      })}
      <line x1={316} y1={52 - R} x2={316} y2={lerp(52 - R, 232 + R, u)} stroke={C.caramel} strokeWidth={2} opacity={u} />
      <T x={330} y={150} s={13} f={C.caramel} o={easeOut(seg(t, 2.1, 2.4))}>&le; 2h levels</T>
      <g opacity={ghost}>
        <T x={440} y={24} s={13} f={C.cherryText}>last topic</T>
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={470 + (i % 2) * 22} cy={lerp(46, 46 + i * 26, ghost)} r={6} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={1 - i * 0.05} />)}
      </g>
      <T x={30} y={300} s={13} f={C.crema} o={easeOut(seg(t, 3.3, 3.7))}>the chain can&apos;t happen here</T>
    </Svg>
  );
}

// 9 · Where it runs. Three cards, one per real implementation named in the sources; in each a small red-black
// tree (examples.py's 7-key one) grows in, one card after another.
export function ProductionUses({ t }: StepCtx) {
  const cards = ['C++ std::map', 'Java TreeMap', 'Linux kernel'];
  return (
    <Svg label="C++ std::map, Java TreeMap and the Linux kernel's rbtree: the same red-black scheme running under each" h={300}>
      {cards.map((name, i) => {
        const x0 = 30 + i * 186;
        const o = easeOut(seg(t, 0.2 + i * 0.5, 0.5 + i * 0.5));
        const grow = easeOut(seg(t, 0.5 + i * 0.5, 1.1 + i * 0.5));
        const pos = (k: number): Pt => [x0 + 19 + (k - 1) * 22, 90 + T7[k][1] * 30 * grow];
        return (
          <g key={name} opacity={o}>
            <rect x={x0} y={30} width={170} height={190} rx={8} fill={C.roast} stroke={C.mocha} strokeWidth={1.2} />
            <T x={x0 + 14} y={56} s={13} f={C.crema}>{name}</T>
            {[1, 2, 3, 4, 5, 6, 7].map((k) => (T7[k][2] ? <Ed key={`e${k}`} a={pos(T7[k][2])} b={pos(k)} o={grow} /> : null))}
            {[1, 2, 3, 4, 5, 6, 7].map((k) => <Nd key={k} p={pos(k)} c={T7[k][0]} sc={0.7} />)}
          </g>
        );
      })}
      <T x={30} y={264} s={13} f={C.caramel} o={easeOut(seg(t, 2.2, 2.6))}>the scheme actually running underneath each one</T>
    </Svg>
  );
}

// 10 · Prove it. Left: examples.py's 200 sorted keys, plain tree height 200 against red-black height 13, to
// scale. Right: the largest rotation count any one operation needed, filled into the sourced bound's slots:
// insert 2 of at most 2, delete 2 of at most 3.
export function ProveIt({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.3, 1.5));
  const num = easeOut(seg(t, 1.4, 1.7));
  const slots = (n: number, fill: number, y: number, at: number) =>
    Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <rect x={330 + i * 40} y={y} width={30} height={30} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, at - 0.3, at))} />
        {i < fill && <rect x={334 + i * 40} y={y + 4} width={22} height={22} rx={3} fill={C.caramel} opacity={easeOutBack(seg(t, at + i * 0.25, at + 0.25 + i * 0.25)) > 0 ? 1 : 0} transform={`translate(${345 + i * 40} ${y + 15}) scale(${clamp(easeOutBack(seg(t, at + i * 0.25, at + 0.25 + i * 0.25)))}) translate(${-(345 + i * 40)} ${-(y + 15)})`} />}
      </g>
    ));
  return (
    <Svg label="Measured: 200 sorted keys give a plain tree height 200 but a red-black tree height 13; the most rotations any insert needed was 2 of a bound of 2, any delete 2 of a bound of 3" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>200 sorted keys</T>
      <line x1={40} y1={250} x2={270} y2={250} stroke={C.mocha} strokeWidth={1.2} />
      <rect x={70} y={250 - 180 * g} width={60} height={180 * g} fill={C.cherryText} />
      <rect x={180} y={250 - (13 / 200) * 180 * g} width={60} height={(13 / 200) * 180 * g} fill={C.caramel} />
      <T x={100} y={62} s={14} f={C.cherryText} a="middle" o={num}>200</T>
      <T x={210} y={250 - (13 / 200) * 180 - 8} s={14} f={C.caramel} a="middle" o={num}>13</T>
      <T x={100} y={272} s={13} f={C.cherryText} a="middle">plain</T>
      <T x={210} y={272} s={13} f={C.caramel} a="middle">red-black</T>
      <T x={330} y={24} s={13} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>most rotations, one op</T>
      <T x={330} y={70} s={13} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>insert: 2, bound 2</T>
      {slots(2, 2, 80, 2.1)}
      <T x={330} y={160} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>delete: 2, bound 3</T>
      {slots(3, 2, 170, 2.9)}
      <T x={30} y={306} s={13} f={C.cinnamon} o={easeOut(seg(t, 3.5, 3.9))}>inside the sourced bound, every run</T>
    </Svg>
  );
}
