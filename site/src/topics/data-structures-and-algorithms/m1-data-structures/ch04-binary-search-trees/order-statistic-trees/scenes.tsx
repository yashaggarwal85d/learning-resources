import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the thing to look at (the walk, the sizes being changed, the
// answer); cinnamon = the compared baseline (tree height, the left side being counted); crema = settled
// sizes; taupe = untouched. Nodes are laid out by in-order rank, so the row of ranks underneath lines up
// with them; the number inside a node is its subtree size, counted from the tree drawn. The measured
// numbers in the last step are printed by examples.py.

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
type Par = Record<number, number>;
const R = 16;
const KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
/** The ten-key tree every step uses: parent of each key (the root, 4, has none). */
const BASE: Par = { 2: 4, 8: 4, 1: 2, 3: 2, 6: 8, 9: 8, 5: 6, 7: 6, 10: 9 };
/** The same tree after a right rotation at 8: 6 takes 8's place, 8 becomes 6's right child, 7 moves under 8. */
const ROT: Par = { 2: 4, 6: 4, 1: 2, 3: 2, 5: 6, 8: 6, 7: 8, 9: 8, 10: 9 };
const X = (k: number) => 50 + (k - 1) * 55;
const Y = (d: number) => 60 + d * 50;
const depth = (p: Par, k: number): number => (p[k] ? 1 + depth(p, p[k]) : 0);
const kids = (p: Par, k: number) => KEYS.filter((c) => p[c] === k);
const size = (p: Par, k: number): number => 1 + kids(p, k).reduce((a, c) => a + size(p, c), 0);
const pos = (p: Par, k: number): Pt => [X(k), Y(depth(p, k))];

function Nd({ p, n, f = C.crema, o = 1, ring, sc = 1 }: { p: Pt; n: number | string; f?: string; o?: number; ring?: string; sc?: number }) {
  if (o <= 0) return null;
  return (
    <g opacity={o} transform={`translate(${p[0]} ${p[1]}) scale(${Math.max(0, sc)})`}>
      <circle cx={0} cy={0} r={R} fill={C.cocoa} stroke={f} strokeWidth={1.8} />
      <T x={0} y={5} s={13} f={f} a="middle">{n}</T>
      {ring && <circle cx={0} cy={0} r={R + 5} fill="none" stroke={ring} strokeWidth={2.2} />}
    </g>
  );
}

function Ed({ a, b, f = C.mocha, o = 1, w = 1.4 }: { a: Pt; b: Pt; f?: string; o?: number; w?: number }) {
  if (o <= 0) return null;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
  return <line x1={a[0] + ux * R} y1={a[1] + uy * R} x2={b[0] - ux * R} y2={b[1] - uy * R} stroke={f} strokeWidth={w} opacity={o} />;
}

function Edges({ p, f, o = 1, hot }: { p: Par; f?: (k: number) => string | undefined; o?: number; hot?: (k: number) => boolean }) {
  return (
    <g opacity={o}>
      {KEYS.filter((k) => p[k]).map((k) => <Ed key={k} a={pos(p, p[k])} b={pos(p, k)} f={f?.(k) ?? C.mocha} w={hot?.(k) ? 2.4 : 1.4} />)}
    </g>
  );
}

/** The in-order rank row, aligned under the nodes. */
function Ranks({ y, lit, o = 1 }: { y: number; lit?: number; o?: number }) {
  return (
    <g opacity={o}>
      {KEYS.map((k) => (
        <g key={k}>
          <rect x={X(k) - 22} y={y} width={44} height={24} rx={3} fill={C.cocoa} stroke={lit === k ? C.caramel : C.mocha} strokeWidth={lit === k ? 2 : 1} />
          <T x={X(k)} y={y + 17} s={12} f={lit === k ? C.caramel : C.taupe} a="middle">{k}</T>
        </g>
      ))}
    </g>
  );
}

function along(pts: Pt[], u: number): Pt {
  const n = pts.length - 1;
  const v = clamp(u) * n;
  const i = Math.min(n - 1, Math.floor(v));
  return [lerp(pts[i][0], pts[i + 1][0], v - i), lerp(pts[i][1], pts[i + 1][1], v - i)];
}

function Check({ x, y, t, at, f = C.caramel }: { x: number; y: number; t: number; at: number; f?: string }) {
  return <Draw pts={[[x - 6, y], [x - 2, y + 5], [x + 7, y - 6]]} t={t} from={at} to={at + 0.25} stroke={f} w={2} pen={false} />;
}

// 1 · A new question. A ring searches down to key 5 and a check lights: membership, answered. Then the rank
// row slides in beneath the tree and a dashed guide drops from 5 to its place in sorted order: where does it
// rank? The tree as drawn cannot say.
export function Opening({ t }: StepCtx) {
  const path = [pos(BASE, 4), pos(BASE, 8), pos(BASE, 6), pos(BASE, 5)];
  const w = easeInOut(seg(t, 0.3, 1.4));
  const found = t >= 1.4;
  const row = easeOut(seg(t, 1.9, 2.4));
  const guide = easeInOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="A search finds key 5 in the tree, answering whether it is present; where it ranks among all keys is a different question" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>is it here?</T>
      <Check x={150} y={19} t={t} at={1.4} />
      <T x={330} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 1.9, 2.2))}>where does it rank?</T>
      <Edges p={BASE} f={(k) => ((k === 8 && w > 0.1) || (k === 6 && w > 0.4) || (k === 5 && w > 0.75) ? C.caramel : undefined)} />
      {KEYS.map((k) => <Nd key={k} p={pos(BASE, k)} n="" f={k === 5 && found ? C.caramel : C.crema} />)}
      {t > 0.3 && !found && (() => {
        const r = along(path, w);
        return <circle cx={r[0]} cy={r[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />;
      })()}
      <Ranks y={262} o={row} lit={guide >= 1 ? 5 : undefined} />
      <line x1={X(5)} y1={pos(BASE, 5)[1] + R + 2} x2={X(5)} y2={lerp(pos(BASE, 5)[1] + R + 2, 260, guide)} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="3 3" opacity={guide > 0 ? 1 : 0} />
      <T x={30} y={310} s={13} f={C.latte} o={easeOut(seg(t, 3.1, 3.5))}>membership was free; rank needs one more number</T>
    </Svg>
  );
}

// 2 · The size field, bottom-up. Leaves show 1; then each parent's two children flash and their sum plus one
// appears inside it, level by level, until the root holds 10, the whole tree.
export function SizeAugmentation({ t }: StepCtx) {
  const h = (k: number): number => (kids(BASE, k).length ? 1 + Math.max(...kids(BASE, k).map(h)) : 0);
  const at = (k: number) => 0.3 + h(k) * 0.7;
  return (
    <Svg label="Every node stores the size of its own subtree: leaves hold 1, and each parent holds its children's sizes added together plus one, up to the root holding the whole tree's count" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>each node: how many keys sit under it, itself included</T>
      <Edges p={BASE} f={(k) => (t >= at(BASE[k]) - 0.35 && t < at(BASE[k]) ? C.caramel : undefined)} hot={(k) => t >= at(BASE[k]) - 0.35 && t < at(BASE[k])} />
      {KEYS.map((k) => {
        const on = t >= at(k);
        const pop = easeOutBack(seg(t, at(k), at(k) + 0.3));
        return (
          <g key={k}>
            <Nd p={pos(BASE, k)} n="" f={C.taupe} o={on ? 0 : 1} />
            {on && <Nd p={pos(BASE, k)} n={size(BASE, k)} f={k === 4 ? C.caramel : C.crema} sc={0.6 + 0.4 * pop} />}
          </g>
        );
      })}
      <T x={30} y={290} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>left size + right size + 1, at every node</T>
    </Svg>
  );
}

// 3 · Predict: one insert. A new key, between 6 and 7 in order, lands as 7's left child. After the answer the
// nodes on its path (4, 8, 6, 7) each tick up by one, top to bottom; every other size stays as it was.
const NEWP: Pt = [(X(6) + X(7)) / 2, Y(4)];
const PATH = [4, 8, 6, 7];
export function InsertPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const tick = (i: number) => answered && s >= 0.2 + i * 0.3;
  return (
    <Svg label="A new key lands as a leaf; which subtree sizes must change? After answering, every size on the path from the root to the new leaf goes up by one" h={320}>
      <Edges p={BASE} f={(k) => (answered && PATH.includes(k) && PATH.includes(BASE[k]) ? C.caramel : undefined)} />
      <Ed a={pos(BASE, 7)} b={NEWP} f={C.caramel} />
      {KEYS.map((k) => {
        const i = PATH.indexOf(k);
        const up = i >= 0 && tick(i);
        return <Nd key={k} p={pos(BASE, k)} n={size(BASE, k) + (up ? 1 : 0)} f={up ? C.caramel : C.crema} ring={up && s < 0.5 + i * 0.3 ? C.caramel : undefined} />;
      })}
      <Nd p={NEWP} n={1} f={C.caramel} ring={answered ? undefined : C.caramel} o={answered ? 1 : 0.7 + 0.3 * Math.sin(t * 4)} />
      <T x={NEWP[0] + 26} y={NEWP[1] + 5} s={13} f={C.caramel}>new</T>
      {!answered && <T x={30} y={310} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>which sizes change?</T>}
      {answered && <T x={30} y={310} s={13} f={C.caramel} o={easeOut(seg(s, 1.4, 1.8))}>every node on the root-to-leaf path: +1</T>}
    </Svg>
  );
}

// 4 · Same walk, counted. The insert's own walk runs again: the ring steps down 4, 8, 6, 7 to the empty spot,
// and each size ticks up as the ring passes, with a +1 rising off it. Then everything off the path dims:
// none of it was looked at.
export function InsertReveal({ t }: StepCtx) {
  const pts = [...PATH.map((k) => pos(BASE, k)), NEWP];
  const w = easeInOut(seg(t, 0.3, 1.9));
  const passed = (i: number) => w * (pts.length - 1) >= i - 1e-6;
  const dim = easeOut(seg(t, 2.1, 2.5));
  const ring = along(pts, w);
  return (
    <Svg label="The insert's walk from root to leaf increments each size it passes; nodes off the path are never touched" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>the walk insert already does</T>
      <Edges p={BASE} f={(k) => (PATH.includes(k) && PATH.includes(BASE[k]) && passed(PATH.indexOf(k)) ? C.caramel : undefined)} o={1} />
      {passed(4) && <Ed a={pos(BASE, 7)} b={NEWP} f={C.caramel} />}
      {KEYS.map((k) => {
        const i = PATH.indexOf(k);
        const up = i >= 0 && passed(i) && t > 0.3;
        return <Nd key={k} p={pos(BASE, k)} n={size(BASE, k) + (up ? 1 : 0)} f={up ? C.caramel : C.crema} o={i < 0 ? lerp(1, 0.3, dim) : 1} />;
      })}
      {PATH.map((k, i) => {
        const at = 0.3 + (i / 4) * 1.6;
        const r = easeOut(seg(t, at, at + 0.6));
        return r > 0 && r < 1 ? <T key={k} x={X(k) + 22} y={pos(BASE, k)[1] - 10 - 16 * r} s={13} f={C.caramel} o={1 - r}>+1</T> : null;
      })}
      <Nd p={NEWP} n={1} f={C.caramel} sc={easeOutBack(seg(t, 1.9, 2.2))} o={t >= 1.9 ? 1 : 0} />
      {t > 0.3 && t < 1.95 && <circle cx={ring[0]} cy={ring[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
      <T x={30} y={294} s={13} f={C.caramel} o={easeOut(seg(t, 2.4, 2.8))}>one path, one increment at every stop</T>
      <T x={30} y={314} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>nothing off the path is even read</T>
    </Svg>
  );
}

// 5 · Select the 5th smallest. A counter k = 5 walks down. At 4 the left side holds 3, so 4 is 4th: too
// small, subtract 4 and go right with k = 1. At 8 the left side holds 3: go left. At 6 the left side holds 1:
// go left. At 5 nothing is to the left: k = 1 means this node. The rank row lights 5.
export function SelectWalk({ t }: StepCtx) {
  const steps: { at: number; k: number; left: number; cap: string }[] = [
    { at: 4, k: 5, left: 2, cap: '5 > 3 + 1: subtract 4, go right' },
    { at: 8, k: 1, left: 6, cap: '1 < 3 + 1: go left' },
    { at: 6, k: 1, left: 5, cap: '1 < 1 + 1: go left' },
    { at: 5, k: 1, left: 0, cap: '1 = 0 + 1: stop, found' },
  ];
  const hop = Math.min(3, Math.floor(clamp(seg(t, 0.4, 3.1)) * 4 + 1e-9));
  const w = clamp(seg(t, 0.4, 3.1)) * 4;
  const pts = steps.map((st) => pos(BASE, st.at));
  const ringU = clamp((w - 0.6) / 3);
  const cur = steps[hop];
  const done = t >= 3.1;
  return (
    <Svg label="Selecting the fifth-smallest key: at each node compare against the left subtree's size; too big, subtract and go right; too small, go left; equal, stop" h={320}>
      <T x={30} y={24} s={14} f={C.caramel}>k = {t >= 0.4 + 0.675 ? 1 : 5}</T>
      <T x={130} y={24} s={13} f={C.latte} o={t > 0.4 ? 1 : 0}>{cur.cap}</T>
      <Edges p={BASE} f={(k) => ((k === 8 && w > 1) || (k === 6 && w > 2) || (k === 5 && w > 3) ? C.caramel : undefined)} />
      {KEYS.map((k) => <Nd key={k} p={pos(BASE, k)} n={size(BASE, k)} f={done && k === 5 ? C.caramel : cur.left === k && t > 0.4 && !done ? C.cinnamon : C.crema} />)}
      {t > 0.4 && !done && (() => {
        const r = along(pts, ringU);
        return <circle cx={r[0]} cy={r[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />;
      })()}
      <Ranks y={262} lit={done ? 5 : undefined} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={30} y={310} s={13} f={C.caramel} o={easeOut(seg(t, 3.3, 3.7))}>fifth smallest, one path, never a scan</T>
    </Svg>
  );
}

// 6 · Predict: one rotation's damage. The edge between 8 and 6 pulses: a right rotation is about to turn it.
// After the answer, 8 and 6 get caramel rings and every other node a quiet check: untouched.
export function RotationPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.55 + 0.45 * Math.sin(t * 5);
  return (
    <Svg label="A rotation is about to turn the edge between two nodes; how many subtree sizes must be recomputed? After answering, only the two nodes on that edge" h={320}>
      <Edges p={BASE} />
      <Ed a={pos(BASE, 8)} b={pos(BASE, 6)} f={C.caramel} w={3} o={answered ? 1 : pulse} />
      {KEYS.map((k) => <Nd key={k} p={pos(BASE, k)} n={size(BASE, k)} f={answered && (k === 8 || k === 6) ? C.caramel : answered ? C.taupe : C.crema} ring={answered && (k === 8 || k === 6) && s > 0.2 ? C.caramel : undefined} />)}
      {answered && KEYS.filter((k) => k !== 8 && k !== 6).map((k, i) => <Check key={k} x={X(k) + 22} y={pos(BASE, k)[1] - 16} t={s} at={0.5 + i * 0.08} f={C.taupe} />)}
      {!answered && <T x={30} y={290} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>rotate this edge: how many sizes change?</T>}
      {answered && <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.6))}>only the two nodes on the rotated edge</T>}
      {answered && <T x={30} y={312} s={13} f={C.latte} o={easeOut(seg(s, 1.5, 1.9))}>every other node keeps its own descendants</T>}
    </Svg>
  );
}

// 7 · The rotation, run. Right rotation at 8: 6 rises into 8's place and 8 drops beneath it, taking 7 as its
// new left child; with x fixed by rank, every node only moves up or down. Then the two sizes recompute from
// their new children: 8 = 1 + 2 + 1 = 4, then 6 = 1 + 4 + 1 = 6. No other number changes.
export function RotationReveal({ t }: StepCtx) {
  const u = easeInOut(seg(t, 0.8, 2.0));
  const p = (k: number): Pt => [X(k), lerp(pos(BASE, k)[1], pos(ROT, k)[1], u)];
  const fix8 = t >= 2.3, fix6 = t >= 2.9;
  const n = (k: number) => (k === 8 ? (fix8 ? 4 : 6) : k === 6 ? (fix6 ? 6 : 3) : size(BASE, k));
  const keep = KEYS.filter((k) => k !== 6 && k !== 7 && k !== 8 && BASE[k]);
  return (
    <Svg label="A right rotation: 6 moves up into 8's place, 8 moves down, and only those two nodes' sizes are recomputed from their new children" h={320}>
      <T x={30} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 0.2, 0.5))}>rotate right at 8</T>
      {keep.map((k) => <Ed key={k} a={p(BASE[k])} b={p(k)} />)}
      <Ed a={p(4)} b={p(8)} o={1 - u} />
      <Ed a={p(4)} b={p(6)} o={u} f={C.caramel} w={2} />
      <Ed a={p(8)} b={p(6)} f={C.caramel} w={2} />
      <Ed a={p(6)} b={p(7)} o={1 - u} />
      <Ed a={p(8)} b={p(7)} o={u} f={C.caramel} w={2} />
      {KEYS.map((k) => <Nd key={k} p={p(k)} n={n(k)} f={k === 6 || k === 8 ? C.caramel : C.crema} ring={(k === 8 && t >= 2.3 && t < 2.8) || (k === 6 && t >= 2.9 && t < 3.4) ? C.caramel : undefined} />)}
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 2.3, 2.5))}>8: 1 + 2 + 1 = 4</T>
      <T x={30} y={284} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.1))}>6: 1 + 4 + 1 = 6</T>
      <T x={30} y={308} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.6))}>two parents change, two sizes recompute</T>
    </Svg>
  );
}

// 8 · Why it's cheap, for any such field. The textbook picture: nodes x and y with subtrees A, B, C hanging
// below. The rotation swaps x and y and hands B across; the three subtrees ride along unchanged (checked),
// and only x and y, whose children changed, recompute, each from its own two children.
export function GeneralRule({ t }: StepCtx) {
  const u = easeInOut(seg(t, 0.6, 1.8));
  // in-order: A, y, B, x, C; every piece keeps its x and only moves up or down
  const yP: Pt = [210, lerp(140, 70, u)];
  const xP: Pt = [350, lerp(70, 140, u)];
  const A: Pt = [140, lerp(210, 140, u)];
  const B: Pt = [280, 210];
  const Cc: Pt = [420, lerp(140, 210, u)];
  const tri = (p: Pt, l: string) => (
    <g>
      <path d={`M ${p[0]} ${p[1] - 26} L ${p[0] - 30} ${p[1] + 26} L ${p[0] + 30} ${p[1] + 26} Z`} fill={C.roast} stroke={C.taupe} strokeWidth={1.3} />
      <T x={p[0]} y={p[1] + 18} s={13} f={C.latte} a="middle">{l}</T>
    </g>
  );
  const recompute = easeOut(seg(t, 2.0, 2.4));
  const bOwner = u < 0.5 ? yP : xP;
  return (
    <Svg label="A rotation swaps two nodes and hands one subtree across; the three subtrees are unchanged, so a field computed from a node and its two children only needs recomputing at the two rotated nodes" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>a field built from a node and its two children</T>
      <Ed a={xP} b={yP} f={C.caramel} w={2} />
      <line x1={yP[0]} y1={yP[1] + R} x2={A[0]} y2={A[1] - 26} stroke={C.mocha} strokeWidth={1.4} />
      <line x1={bOwner[0]} y1={bOwner[1] + R} x2={B[0]} y2={B[1] - 26} stroke={C.caramel} strokeWidth={1.6} />
      <line x1={xP[0]} y1={xP[1] + R} x2={Cc[0]} y2={Cc[1] - 26} stroke={C.mocha} strokeWidth={1.4} />
      {tri(A, 'A')}
      {tri(B, 'B')}
      {tri(Cc, 'C')}
      <Nd p={xP} n="x" f={C.caramel} ring={recompute > 0 && t < 3.0 ? C.caramel : undefined} />
      <Nd p={yP} n="y" f={C.caramel} ring={recompute > 0 && t < 3.0 ? C.caramel : undefined} />
      {[A, B, Cc].map((p, i) => <Check key={i} x={p[0] + 40} y={p[1] - 10} t={t} at={2.0 + i * 0.15} f={C.latte} />)}
      <T x={440} y={80} s={13} f={C.caramel} o={recompute}>recompute x, y</T>
      <T x={30} y={276} s={13} f={C.latte} o={easeOut(seg(t, 2.3, 2.6))}>A, B, C: carried across as-is</T>
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.3))}>survives a rotation, at the same small cost</T>
    </Svg>
  );
}

// 9 · Rank, climbing. Start at 7: r = 1 (nothing to its left). Climb from a right child to 6: add 6's left
// side plus 6 itself, r = 3. Climb from a left child to 8: add nothing. Climb from a right child to 4: add
// 4's left side plus 4, r = 7. The rank row lights 7.
export function RankQuery({ t }: StepCtx) {
  const climb = [7, 6, 8, 4];
  const rs = [1, 3, 3, 7];
  const caps = ['start: nothing left of 7', 'up from a right child: + 1 + 1', 'up from a left child: + 0', 'up from a right child: + 3 + 1'];
  const v = clamp(seg(t, 0.3, 2.7)) * 3;
  const hop = Math.min(3, Math.round(v - 0.4 < 0 ? 0 : Math.floor(v + 0.6 - 1e-9)));
  const ring = along(climb.map((k) => pos(BASE, k)), v / 3);
  const done = t >= 2.9;
  const added = hop === 1 ? [5] : hop === 3 ? [1, 2, 3] : [];
  return (
    <Svg label="Rank by climbing: from key 7 up to the root, each step up from a right child adds that parent's left subtree size plus one; the total is 7" h={320}>
      <T x={30} y={24} s={14} f={C.caramel}>r = {rs[hop]}</T>
      <T x={130} y={24} s={13} f={C.latte}>{caps[hop]}</T>
      <Edges p={BASE} f={(k) => ((k === 7 && v > 0.2) || (k === 6 && v > 1.2) || (k === 8 && v > 2.2) ? C.caramel : undefined)} />
      {KEYS.map((k) => <Nd key={k} p={pos(BASE, k)} n={size(BASE, k)} f={done && k === 7 ? C.caramel : added.includes(k) || (hop === 1 && k === 6) || (hop === 3 && k === 4) ? C.cinnamon : C.crema} />)}
      {t > 0.25 && !done && <circle cx={ring[0]} cy={ring[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
      <Ranks y={262} lit={done ? 7 : undefined} />
      <T x={30} y={310} s={13} f={C.caramel} o={easeOut(seg(t, 3.1, 3.5))}>at the root, the total is the rank</T>
    </Svg>
  );
}

// 10 · Prove it, from examples.py. Left: on the 200-key tree of height 13, the worst select and the worst rank
// climb across five queries each, bars to the same scale as the height: all 13. Right: one insert into a
// 50-node tree changes 9 sizes (lit among 50 dots); one rotation recomputes 2.
export function ProveIt({ t }: StepCtx) {
  const bars: [string, string][] = [
    ['tree height', C.cinnamon],
    ['worst select, 5 queries', C.caramel],
    ['worst rank climb, 5 queries', C.caramel],
  ];
  const lit = Math.floor(clamp(seg(t, 2.2, 2.9)) * 9 + 1e-9);
  const litSet = [3, 8, 14, 19, 22, 27, 31, 36, 44];
  return (
    <Svg label="Measured on a 200-key tree of height 13: the worst select and rank queries take 13 steps; one insert into a 50-node tree changes 9 sizes, one rotation recomputes 2" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>200 keys, height 13</T>
      {bars.map(([l, f], i) => {
        const g = easeInOut(seg(t, 0.3 + i * 0.4, 1.0 + i * 0.4));
        return (
          <g key={l}>
            <T x={30} y={62 + i * 54} s={13} f={C.latte}>{l}</T>
            <rect x={30} y={70 + i * 54} width={200 * g} height={14} rx={2} fill={f} />
            <T x={240} y={82 + i * 54} s={14} f={f} o={easeOut(seg(t, 1.0 + i * 0.4, 1.2 + i * 0.4))}>13</T>
          </g>
        );
      })}
      <line x1={230} y1={64} x2={230} y2={190} stroke={C.cinnamon} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.6, 1.9))} />
      <T x={330} y={24} s={13} f={C.crema} o={easeOut(seg(t, 1.9, 2.2))}>insert into 50 nodes</T>
      {Array.from({ length: 50 }, (_, i) => {
        const on = litSet.slice(0, lit).includes(i);
        return <circle key={i} cx={340 + (i % 10) * 22} cy={50 + Math.floor(i / 10) * 20} r={6} fill={on ? C.caramel : 'none'} stroke={on ? C.caramel : C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.9, 2.2))} />;
      })}
      <T x={330} y={166} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.1))}>9 sizes changed</T>
      <T x={330} y={214} s={13} f={C.crema} o={easeOut(seg(t, 3.1, 3.4))}>one rotation</T>
      {[0, 1].map((i) => <circle key={i} cx={346 + i * 22} cy={236} r={7} fill={C.caramel} transform={`translate(${346 + i * 22} 236) scale(${clamp(easeOutBack(seg(t, 3.3 + i * 0.15, 3.55 + i * 0.15)))}) translate(${-(346 + i * 22)} -236)`} />)}
      <T x={400} y={241} s={13} f={C.caramel} o={easeOut(seg(t, 3.5, 3.7))}>2 recomputed</T>
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 3.9))}>queries tied to height; updates tied to a path</T>
    </Svg>
  );
}
