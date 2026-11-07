import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the heap's own live state; latte = secondary labels; taupe = an
// empty slot; caramel = the thing to look at (the value moving, the measured bar); cinnamon = the
// alternative being compared (one-at-a-time insertion); cherryText = an out-of-order pair, before it's fixed.
// The small heaps hold the values 7 down to 1: examples.py's own adversarial input (decreasing order), at a
// size a picture can hold. They illustrate the moves; every measured number is printed by examples.py.

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

/** Where array index i sits in the implicit tree: depth from the index, then its place within that level. */
function pos(i: number, cx = 300, W = 440, y0 = 70, dy = 62): Pt {
  const d = Math.floor(Math.log2(i + 1));
  const k = i - (2 ** d - 1);
  return [cx + ((k + 0.5) / 2 ** d - 0.5) * W, y0 + d * dy];
}

function Nd({ p, v, c = C.crema, o = 1, r = 15, ring = false }: { p: Pt; v: string | number; c?: string; o?: number; r?: number; ring?: boolean }) {
  return (
    <g opacity={o}>
      <circle cx={p[0]} cy={p[1]} r={r} fill={C.roast} stroke={c} strokeWidth={ring ? 2.4 : 1.4} />
      <T x={p[0]} y={p[1] + 5} s={14} f={c} a="middle">{v}</T>
    </g>
  );
}

function Edge({ a, b, c = C.mocha, w = 1.3, o = 1, dash }: { a: Pt; b: Pt; c?: string; w?: number; o?: number; dash?: string }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} opacity={o} strokeDasharray={dash} />;
}

/** One array slot (box, value, index underneath). */
function Slot({ x, y, v, c = C.crema, idx, o = 1, w = 44 }: { x: number; y: number; v?: string | number; c?: string; idx?: number; o?: number; w?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w - 4} height={26} rx={3} fill={C.roast} stroke={v === undefined ? C.mocha : c} strokeWidth={1.3} />
      {v !== undefined && <T x={x + (w - 4) / 2} y={y + 18} s={13} f={c} a="middle">{v}</T>}
      {idx !== undefined && <T x={x + (w - 4) / 2} y={y + 44} s={12} f={C.taupe} a="middle">{idx}</T>}
    </g>
  );
}

/**
 * Values in flight through a list of swaps (index a with index b over [t0, t1]). Returns, for each value
 * (by its starting index), where it is: from index, to index, and progress k. Two values trading places
 * bow out to opposite sides of their shared line, so their labels never cross.
 */
function flight(n: number, swaps: [number, number, number, number][], t: number) {
  const at = Array.from({ length: n }, (_, i) => i); // at[value] = index
  const out = Array.from({ length: n }, (_, i) => ({ from: i, to: i, k: 0 }));
  for (const [a, b, t0, t1] of swaps) {
    const va = at.indexOf(a);
    const vb = at.indexOf(b);
    if (t >= t1) {
      at[va] = b;
      at[vb] = a;
      continue;
    }
    if (t > t0) {
      const k = easeInOut(seg(t, t0, t1));
      out[va] = { from: a, to: b, k };
      out[vb] = { from: b, to: a, k };
    }
    break;
  }
  return at.map((i, v) => (out[v].k > 0 ? out[v] : { from: i, to: i, k: 0 }));
}

/** A point between two places, bowed sideways by `bow` at the midpoint. */
function bowed(p: Pt, q: Pt, k: number, bow: number): Pt {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const L = Math.hypot(dx, dy) || 1;
  const s = Math.sin(Math.PI * k) * bow;
  return [lerp(p[0], q[0], k) - (dy / L) * s, lerp(p[1], q[1], k) + (dx / L) * s];
}

// 1 · Opening. Left: pages on disk, "where it sits", the question every earlier structure asked; it dims.
// Right: values keep arriving, and a ring sits on whichever is smallest right now; every arrival here is a
// new minimum, so the ring jumps each time.
export function Opening({ t }: StepCtx) {
  const old = 1 - 0.75 * easeInOut(seg(t, 1.0, 1.5));
  const arrivals = [7, 6, 5, 4, 3, 2];
  const at = (i: number) => 1.5 + i * 0.38;
  const landed = arrivals.filter((_, i) => t >= at(i) + 0.3).length;
  const ringI = Math.max(0, landed - 1);
  const ringK = landed > 0 ? easeOutBack(seg(t, at(ringI) + 0.3, at(ringI) + 0.55)) : 0;
  const rx = (i: number) => 310 + i * 44;
  return (
    <Svg label="Earlier structures asked where each piece of data sits on disk; this one asks only which of the arriving values is smallest right now, and the answer moves with every arrival" h={260}>
      <g opacity={old}>
        <T x={30} y={24} s={13} f={C.latte}>so far: where it sits</T>
        {Array.from({ length: 6 }, (_, p) => (
          <rect key={p} x={30 + (p % 3) * 72} y={48 + Math.floor(p / 3) * 46} width={62} height={36} rx={3} fill={C.roast} stroke={C.latte} strokeWidth={1.2} />
        ))}
        {Array.from({ length: 6 }, (_, p) => (
          <rect key={`f${p}`} x={36 + (p % 3) * 72} y={56 + Math.floor(p / 3) * 46} width={50 * ((p * 7) % 5 + 3) / 7} height={6} rx={2} fill={C.mocha} />
        ))}
      </g>
      <T x={310} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 1.2, 1.5))}>now: smallest, right now</T>
      {arrivals.map((v, i) => {
        const k = easeOut(seg(t, at(i), at(i) + 0.3));
        return k > 0 ? <Nd key={v} p={[rx(i), lerp(40, 120, k)]} v={v} o={k} c={i === ringI && landed > 0 ? C.caramel : C.crema} /> : null;
      })}
      {landed > 0 && <circle cx={rx(ringI)} cy={120} r={15 + 6 * ringK} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ringK} />}
      <T x={310} y={190} s={13} f={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>the answer keeps moving</T>
    </Svg>
  );
}

// 2 · The array is the tree. Six slots in a row; each value drops from its slot to its place in the tree, and
// the edges appear. Then index 1 is traced: children at 3 and 4, parent at 0, each by arithmetic alone.
const HEAP6 = [2, 3, 5, 4, 6, 7];
const TP = (i: number) => pos(i, 230, 340, 136, 58);
export function ArrayTree({ t }: StepCtx) {
  const SX = (i: number) => 98 + i * 50;
  const edgesIn = easeOut(seg(t, 1.3, 1.7));
  const pick = easeOut(seg(t, 1.8, 2.1));
  const kids = easeOut(seg(t, 2.2, 2.5));
  const par = easeOut(seg(t, 2.7, 3.0));
  const hl = (i: number) => (i === 1 && pick > 0 ? C.caramel : (i === 3 || i === 4) && kids > 0 ? C.cinnamon : i === 0 && par > 0 ? C.cinnamon : C.crema);
  return (
    <Svg label="One flat array of six values; each drops to its place in a tree computed from its index; index 1 has children at 3 and 4 and parent at 0, all by arithmetic" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>one flat array, no pointers</T>
      {HEAP6.map((v, i) => <Slot key={i} x={SX(i)} y={40} v={v} idx={i} c={hl(i)} w={50} />)}
      {[1, 2, 3, 4, 5].map((i) => <Edge key={i} a={TP(Math.floor((i - 1) / 2))} b={TP(i)} o={edgesIn} />)}
      {[3, 4].map((i) => <Edge key={`k${i}`} a={TP(1)} b={TP(i)} c={C.cinnamon} w={2.2} o={kids} />)}
      <Edge a={TP(1)} b={TP(0)} c={C.cinnamon} w={2.2} o={par} />
      {HEAP6.map((v, i) => {
        const k = easeInOut(seg(t, 0.4 + i * 0.12, 0.9 + i * 0.12));
        const p: Pt = [lerp(SX(i) + 23, TP(i)[0], k), lerp(53, TP(i)[1], k)];
        return k > 0 ? <Nd key={i} p={p} v={v} c={hl(i)} ring={i === 1 && pick > 0} /> : null;
      })}
      <T x={420} y={150} s={14} f={C.caramel} o={pick}>i = 1</T>
      <T x={420} y={182} s={13} f={C.cinnamon} o={kids}>2i+1 = 3</T>
      <T x={420} y={204} s={13} f={C.cinnamon} o={kids}>2i+2 = 4</T>
      <T x={420} y={236} s={13} f={C.cinnamon} o={par}>&lfloor;(i&minus;1)/2&rfloor; = 0</T>
      <T x={30} y={306} s={13} f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>the tree is arithmetic on a position</T>
    </Svg>
  );
}

// 3 · Predict. The heap of step 2 with one value, 1, just appended at index 6, under its parent 5: the pair is
// out of order (red, pulsing). After answering, the one root-ward path from the new leaf lights up.
const HP = (i: number) => pos(i, 300, 400, 62, 62);
export function SiftUpPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const vals = [...HEAP6, 1];
  return (
    <Svg label="A heap with the value 1 appended at the end under its parent 5, out of order; after answering, the single path from it up to the root lights up" h={300}>
      {[1, 2, 3, 4, 5].map((i) => <Edge key={i} a={HP(Math.floor((i - 1) / 2))} b={HP(i)} />)}
      <Edge a={HP(2)} b={HP(6)} c={C.cherryText} w={2} dash="4 3" o={answered ? 1 - easeOut(seg(s, 0.2, 0.6)) : pulse} />
      {answered && <Draw pts={[HP(6), HP(2), HP(0)]} t={s} from={0.2} to={0.9} stroke={C.caramel} w={2.6} pen={false} />}
      {vals.map((v, i) => <Nd key={i} p={HP(i)} v={v} c={i === 6 ? (answered ? C.caramel : C.cherryText) : C.crema} ring={i === 6} />)}
      {vals.map((v, i) => <Slot key={`s${i}`} x={146 + i * 44} y={226} v={v} c={i === 6 ? (answered ? C.caramel : C.cherryText) : C.crema} />)}
      {!answered && <T x={30} y={290} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>1 sits below 5: what now?</T>}
      {answered && <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(s, 0.9, 1.3))}>only this one path to the root needs fixing</T>}
    </Svg>
  );
}

// 4 · Sift-up. Compare 1 with its parent 5 (red), swap; compare with 2 (red), swap; at the root, stop. The array
// below trades the same slots in step. Then every node off the path gets a quiet check: it never moved.
const UP: [number, number, number, number][] = [[6, 2, 0.6, 1.2], [2, 0, 1.6, 2.2]];
export function SiftUpReveal({ t }: StepCtx) {
  const vals = [...HEAP6, 1];
  const fl = flight(7, UP, t);
  const cmp1 = seg(t, 0.25, 0.6) > 0 && t < 1.2;
  const cmp2 = seg(t, 1.3, 1.6) > 0 && t < 2.2;
  const still = easeOut(seg(t, 2.6, 3.0));
  const path = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="The value 1 is compared with its parent and swapped twice, up to the root; the array swaps the same slots; every node off that one path never moves" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>compare with parent; swap if out of order</T>
      {[1, 2, 3, 4, 5, 6].map((i) => <Edge key={i} a={HP(Math.floor((i - 1) / 2))} b={HP(i)} />)}
      <Edge a={HP(2)} b={HP(6)} c={C.cherryText} w={2.2} o={cmp1 ? 1 : 0} />
      <Edge a={HP(0)} b={HP(2)} c={C.cherryText} w={2.2} o={cmp2 ? 1 : 0} />
      <Edge a={HP(0)} b={HP(2)} c={C.caramel} w={2.6} o={path} />
      <Edge a={HP(2)} b={HP(6)} c={C.caramel} w={2.6} o={path} />
      {vals.map((v, n) => {
        const f = fl[n];
        const p = bowed(HP(f.from), HP(f.to), f.k, 20);
        return <Nd key={n} p={p} v={v} c={v === 1 ? C.caramel : C.crema} ring={v === 1} />;
      })}
      {[1, 3, 4, 5].map((i) => (
        <Draw key={i} pts={[[HP(i)[0] + 16, HP(i)[1] - 14], [HP(i)[0] + 20, HP(i)[1] - 9], [HP(i)[0] + 28, HP(i)[1] - 20]]} t={t} from={2.6 + i * 0.05} to={2.85 + i * 0.05} stroke={C.latte} w={1.8} pen={false} />
      ))}
      {vals.map((_, n) => <Slot key={`b${n}`} x={146 + n * 44} y={248} c={C.mocha} />)}
      {vals.map((v, n) => {
        const f = fl[n];
        const x = lerp(146 + f.from * 44, 146 + f.to * 44, f.k);
        const y = 248 + (f.to < f.from ? -1 : 1) * Math.sin(Math.PI * f.k) * 16;
        return (
          <g key={`a${n}`}>
            <rect x={x} y={y} width={40} height={26} rx={3} fill={C.roast} stroke={v === 1 ? C.caramel : C.crema} strokeWidth={1.3} />
            <T x={x + 20} y={y + 18} s={13} f={v === 1 ? C.caramel : C.crema} a="middle">{v}</T>
          </g>
        );
      })}
      <T x={30} y={306} s={13} f={C.crema} o={still}>off the path, nothing moved</T>
    </Svg>
  );
}

// 5 · Sift-down. The root, 1, is lifted out. The last element, 5, flies from the end of the array into the
// empty root. Its two children are compared, the smaller (2) is marked, and they swap. Below it now sits only
// 7, larger: stop.
export function SiftDownReveal({ t }: StepCtx) {
  const lift = easeInOut(seg(t, 0.2, 0.7));
  const fly = easeInOut(seg(t, 0.8, 1.4));
  const cmp = easeOut(seg(t, 1.5, 1.8));
  const sw = easeInOut(seg(t, 1.9, 2.5));
  const stop = easeOut(seg(t, 2.7, 3.0));
  const start = [1, 3, 2, 4, 6, 7, 5];
  const root: Pt = HP(0);
  const fiveFrom: Pt = HP(6);
  const fiveP: Pt = sw > 0 ? bowed(root, HP(2), sw, 20) : bowed(fiveFrom, root, fly, 60);
  const twoP: Pt = bowed(HP(2), root, sw, 20);
  const outP: Pt = [lerp(root[0], 470, lift), lerp(root[1], 40, lift)];
  const SX = (i: number) => 146 + i * 44;
  // the array, in step: [1,3,2,4,6,7,5] -> 1 leaves -> 5 moves to slot 0 -> 5 and 2 trade slots 0 and 2
  const arr = (i: number): { v: number; x: number; y: number } | null => {
    const v = start[i];
    if (v === 1) return lift >= 1 ? null : { v, x: SX(0), y: 248 - 30 * lift };
    if (v === 5) {
      if (sw > 0) return { v, x: lerp(SX(0), SX(2), sw), y: 248 + Math.sin(Math.PI * sw) * 16 };
      return { v, x: lerp(SX(6), SX(0), fly), y: 248 + Math.sin(Math.PI * fly) * 30 };
    }
    if (v === 2) return { v, x: lerp(SX(2), SX(0), sw), y: 248 - Math.sin(Math.PI * sw) * 16 };
    return { v, x: SX(i), y: 248 };
  };
  return (
    <Svg label="The minimum, 1, leaves the root; the last element, 5, moves into the root, is compared with its children, swaps with the smaller one, 2, and stops above 7" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>last element in, then down</T>
      {[1, 2, 3, 4, 5].map((i) => <Edge key={i} a={HP(Math.floor((i - 1) / 2))} b={HP(i)} />)}
      <Edge a={HP(2)} b={HP(6)} o={1 - fly} />
      <Edge a={root} b={HP(1)} c={C.cinnamon} w={2.2} o={cmp * (1 - sw)} />
      <Edge a={root} b={HP(2)} c={C.caramel} w={2.4} o={cmp} />
      <Edge a={HP(2)} b={HP(5)} c={C.crema} w={2.2} o={stop} />
      {[1, 3, 4, 5].map((i) => <Nd key={i} p={HP(i)} v={start[i]} />)}
      <Nd p={twoP} v={2} c={cmp > 0 ? C.caramel : C.crema} ring={cmp > 0 && sw < 1} />
      <Nd p={outP} v={1} c={C.latte} o={1 - 0.5 * lift} />
      <T x={490} y={45} s={13} f={C.latte} o={lift}>min, out</T>
      <Nd p={fiveP} v={5} c={C.caramel} ring />
      <T x={HP(2)[0] + 24} y={HP(2)[1] + 34} s={13} f={C.crema} o={stop}>5 &lt; 7: stop</T>
      {start.map((_, i) => <Slot key={`b${i}`} x={SX(i)} y={248} c={C.mocha} o={i === 6 ? 1 - fly : 1} />)}
      {start.map((_, i) => {
        const a = arr(i);
        if (!a) return null;
        const c = a.v === 5 ? C.caramel : C.crema;
        return (
          <g key={`a${i}`} opacity={a.v === 1 ? 1 - lift : 1}>
            <rect x={a.x} y={a.y} width={40} height={26} rx={3} fill={C.roast} stroke={c} strokeWidth={1.3} />
            <T x={a.x + 20} y={a.y + 18} s={13} f={c} a="middle">{a.v}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Same heap, two orders of work. One fifteen-node tree. Left bars (cinnamon): one-at-a-time insertion,
// where a value landing at depth d may walk d steps up; the bottom level is the widest, so it pays the most.
// Right bars (caramel): bottom-up, where a node of height h may walk h steps down; the bottom level pays
// nothing. Totals below: drawn as lengths only (34 against 11 worst-case steps, by counting the tree).
export function BuildReveal({ t }: StepCtx) {
  const BP = (i: number) => pos(i, 300, 360, 76, 50);
  const U = 3.4; // px per step of walking, per level
  const lv = [0, 1, 2, 3];
  const left = lv.map((d) => 2 ** d * d);
  const right = lv.map((d) => 2 ** d * (3 - d));
  const L = (d: number) => easeOut(seg(t, 0.4 + d * 0.3, 0.7 + d * 0.3));
  const R = (d: number) => easeOut(seg(t, 1.8 + d * 0.3, 2.1 + d * 0.3));
  const tot = easeInOut(seg(t, 3.1, 3.8));
  return (
    <Svg label="One fifteen-node tree. One-at-a-time insertion pays the most on the bottom level, the widest; the bottom-up build pays nothing there; the bottom-up total is far shorter" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>one at a time: walk up</T>
      <T x={570} y={24} s={13} f={C.caramel} a="end" o={easeOut(seg(t, 1.6, 1.9))}>bottom-up: walk down</T>
      {Array.from({ length: 14 }, (_, j) => j + 1).map((i) => <Edge key={i} a={BP(Math.floor((i - 1) / 2))} b={BP(i)} />)}
      {Array.from({ length: 15 }, (_, i) => {
        const d = Math.floor(Math.log2(i + 1));
        const hot = t < 1.8 ? L(d) * (d / 3) : R(d) * ((3 - d) / 3);
        const c = t < 1.8 ? C.cinnamon : C.caramel;
        return (
          <g key={i}>
            <circle cx={BP(i)[0]} cy={BP(i)[1]} r={8} fill={C.roast} stroke={C.crema} strokeWidth={1.3} />
            <circle cx={BP(i)[0]} cy={BP(i)[1]} r={8} fill={c} opacity={hot} />
          </g>
        );
      })}
      {lv.map((d) => (
        <g key={d}>
          <rect x={110 - left[d] * U * L(d)} y={76 + d * 50 - 7} width={left[d] * U * L(d)} height={14} rx={2} fill={C.cinnamon} />
          <rect x={490} y={76 + d * 50 - 7} width={right[d] * U * R(d)} height={14} rx={2} fill={C.caramel} />
        </g>
      ))}
      <g opacity={tot > 0 ? 1 : 0}>
        <rect x={30} y={262} width={34 * 8 * tot} height={14} rx={2} fill={C.cinnamon} />
        <rect x={30} y={290} width={11 * 8 * tot} height={14} rx={2} fill={C.caramel} />
        <T x={318} y={274} s={13} f={C.cinnamon} o={tot}>total, one at a time</T>
        <T x={134} y={302} s={13} f={C.caramel} o={tot}>total, bottom-up</T>
      </g>
    </Svg>
  );
}

// 7 · Prove it. examples.py on 4000 elements in decreasing order: 39,917 swaps one at a time against 3,990
// bottom-up, a 10.00x ratio; both heaps then checked valid at every node.
export function ProveIt({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 1.4));
  const b = easeInOut(seg(t, 1.5, 2.1));
  const r = easeOut(seg(t, 2.3, 2.7));
  const v = easeOut(seg(t, 2.9, 3.3));
  const W = 400;
  return (
    <Svg label="Measured on 4000 elements in decreasing order: 39,917 swaps one at a time against 3,990 bottom-up, a 10.00x ratio; both heaps valid at every node" h={280}>
      <T x={30} y={24} s={13} f={C.crema}>4000 elements, decreasing order</T>
      <T x={30} y={60} s={13} f={C.cinnamon}>one at a time</T>
      <rect x={30} y={70} width={W * a} height={20} rx={2} fill={C.cinnamon} />
      <T x={30 + W + 10} y={85} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.3, 1.6))}>39,917 swaps</T>
      <T x={30} y={124} s={13} f={C.caramel}>bottom-up</T>
      <rect x={30} y={134} width={W * (3990 / 39917) * b} height={20} rx={2} fill={C.caramel} />
      <T x={30 + W * (3990 / 39917) + 10} y={149} s={13} f={C.caramel} o={easeOut(seg(t, 2.0, 2.3))}>3,990 swaps</T>
      <T x={30} y={196} s={15} f={C.caramel} o={r}>10.00x fewer swaps</T>
      <T x={30} y={240} s={13} f={C.crema} o={v}>both valid, checked at every node</T>
      <Draw pts={[[384, 234], [390, 240], [402, 226]]} t={t} from={3.1} to={3.35} stroke={C.caramel} w={2} pen={false} />
      <Draw pts={[[412, 234], [418, 240], [430, 226]]} t={t} from={3.25} to={3.5} stroke={C.caramel} w={2} pen={false} />
    </Svg>
  );
}
