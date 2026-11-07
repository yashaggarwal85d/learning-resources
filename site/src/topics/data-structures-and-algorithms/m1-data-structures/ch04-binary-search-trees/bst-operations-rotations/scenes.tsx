import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the thing to look at (the walk, the node rotating, the
// successor); cinnamon = the alternative being compared (the random-order height, a subtree's range);
// cherryText = the bad outcome (the degenerate chain, the deleted key). Every key drawn is one of
// examples.py's seven small_keys (20..80); every printed number is printed by examples.py.

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
const KEYS = [20, 30, 40, 50, 60, 70, 80];
/** Every tree here is laid out by in-order rank: a key's x never depends on the tree's shape. */
const X = (k: number) => 90 + KEYS.indexOf(k) * 70;
/** Depths of examples.py's small tree, keys inserted as 50, 30, 70, 20, 40, 60, 80. */
const D0: Record<number, number> = { 50: 0, 30: 1, 70: 1, 20: 2, 40: 2, 60: 2, 80: 2 };
/** Parent of each key in that tree. */
const P0: Record<number, number> = { 30: 50, 70: 50, 20: 30, 40: 30, 60: 70, 80: 70 };
const R = 15;

function Nd({ p, k, f = C.crema, o = 1, sc = 1 }: { p: Pt; k: number | string; f?: string; o?: number; sc?: number }) {
  if (o <= 0) return null;
  return (
    <g opacity={o} transform={`translate(${p[0]} ${p[1]}) scale(${Math.max(0, sc)})`}>
      <circle cx={0} cy={0} r={R} fill={C.cocoa} stroke={f} strokeWidth={1.8} />
      <T x={0} y={5} s={13} f={f} a="middle">{k}</T>
    </g>
  );
}

/** A tree edge between two node centres, trimmed to the circles. */
function Ed({ a, b, f = C.mocha, o = 1, w = 1.4 }: { a: Pt; b: Pt; f?: string; o?: number; w?: number }) {
  if (o <= 0) return null;
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / d, uy = (b[1] - a[1]) / d;
  return <line x1={a[0] + ux * R} y1={a[1] + uy * R} x2={b[0] - ux * R} y2={b[1] - uy * R} stroke={f} strokeWidth={w} opacity={o} />;
}

/** A point partway along a polyline of node centres (u in 0..1). */
function along(pts: Pt[], u: number): Pt {
  const n = pts.length - 1;
  const v = clamp(u) * n;
  const i = Math.min(n - 1, Math.floor(v));
  return [lerp(pts[i][0], pts[i + 1][0], v - i), lerp(pts[i][1], pts[i + 1][1], v - i)];
}

function Check({ x, y, t, at, f = C.caramel }: { x: number; y: number; t: number; at: number; f?: string }) {
  return <Draw pts={[[x - 6, y], [x - 2, y + 5], [x + 7, y - 6]]} t={t} from={at} to={at + 0.25} stroke={f} w={2} pen={false} />;
}

// 1 · Opening. The seven keys sit scattered in a hash table's slots; they fly out and land in a binary search
// tree, each at its in-order rank. Then the root's two subtrees are outlined: everything left is smaller,
// everything right is bigger.
export function Opening({ t }: StepCtx) {
  const SL: (number | null)[] = [60, null, 20, 80, 50, null, 30, 70, 40];
  const yOf = (d: number) => 140 + d * 60;
  const regions = easeOut(seg(t, 2.3, 2.8));
  return (
    <Svg label="Seven keys scattered across a hash table's slots fly into a binary search tree; the root's left subtree holds only smaller keys and its right subtree only bigger ones" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>hash table: where, never order</T>
      {SL.map((_, i) => <rect key={i} x={30 + i * 60} y={36} width={52} height={30} rx={3} fill={C.cocoa} stroke={C.taupe} strokeWidth={1.2} opacity={lerp(1, 0.35, easeOut(seg(t, 1.6, 2.2)))} />)}
      <T x={30} y={104} s={13} f={C.caramel} o={easeOut(seg(t, 1.9, 2.3))}>now: every node sits between its subtrees</T>
      {Object.entries(P0).map(([c, p]) => <Ed key={c} a={[X(+p), yOf(D0[+p])]} b={[X(+c), yOf(D0[+c])]} o={easeOut(seg(t, 1.8, 2.2))} />)}
      <rect x={X(20) - 26} y={yOf(1) - 26} width={X(40) - X(20) + 52} height={yOf(2) - yOf(1) + 52} rx={10} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="5 4" opacity={regions} />
      <rect x={X(60) - 26} y={yOf(1) - 26} width={X(80) - X(60) + 52} height={yOf(2) - yOf(1) + 52} rx={10} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="5 4" opacity={regions} />
      {SL.map((k, i) => {
        if (k === null) return null;
        const j = KEYS.indexOf(k);
        const u = easeInOut(seg(t, 0.6 + j * 0.1, 1.5 + j * 0.1));
        const p: Pt = [lerp(30 + i * 60 + 26, X(k), u), lerp(51, yOf(D0[k]), u)];
        return <Nd key={k} p={p} k={k} f={k === 50 && regions > 0 ? C.caramel : C.crema} />;
      })}
      <T x={X(30)} y={306} s={13} f={C.cinnamon} a="middle" o={regions}>all &lt; 50</T>
      <T x={X(70)} y={306} s={13} f={C.cinnamon} a="middle" o={regions}>all &gt; 50</T>
    </Svg>
  );
}

// 2 · Search and insert, one walk. A caramel ring searches for 40: left at 50, right at 30, found. Then it
// inserts 80 (examples.py's last insert): right at 50, right at 70, nothing there, so 80 lands in that gap.
export function SearchInsert({ t }: StepCtx) {
  const yOf = (d: number) => 100 + d * 60;
  const pos = (k: number): Pt => [X(k), yOf(D0[k])];
  const search: Pt[] = [pos(50), pos(30), pos(40)];
  const insert: Pt[] = [pos(50), pos(70), pos(80)];
  const us = easeInOut(seg(t, 0.3, 1.3));
  const ui = easeInOut(seg(t, 1.8, 2.7));
  const phase2 = t >= 1.7;
  const hop = phase2 ? Math.min(2, Math.floor(ui * 2 + 1e-9)) : Math.min(2, Math.floor(us * 2 + 1e-9));
  const caps = phase2 ? ['80 > 50: go right', '80 > 70: go right', 'empty: 80 goes here'] : ['40 < 50: go left', '40 > 30: go right', '40 = 40: found'];
  const ring = phase2 ? along(insert, ui) : along(search, us);
  const pop = easeOutBack(seg(t, 2.75, 3.1));
  const lit = (a: number, b: number) => (!phase2 ? (a === 50 && b === 30 && us > 0.05) || (a === 30 && b === 40 && us > 0.55) : (a === 50 && b === 70 && ui > 0.05));
  return (
    <Svg label="One comparison walk: searching for 40 goes left then right and finds it; inserting 80 goes right, right, finds an empty spot and puts 80 there" h={320}>
      {!phase2 && <T x={30} y={24} s={14} f={C.caramel}>search 40</T>}
      {phase2 && <T x={30} y={24} s={14} f={C.caramel}>insert 80</T>}
      <T x={30} y={48} s={13} f={C.latte} o={t > 0.3 ? 1 : 0}>{caps[hop]}</T>
      {Object.entries(P0).map(([c, p]) => +c === 80 ? null : <Ed key={c} a={pos(+p)} b={pos(+c)} f={lit(+p, +c) ? C.caramel : C.mocha} w={lit(+p, +c) ? 2.2 : 1.4} />)}
      {phase2 && <Ed a={pos(70)} b={pos(80)} f={C.caramel} w={2.2} o={easeOut(seg(t, 2.2, 2.5))} />}
      {KEYS.filter((k) => k !== 80).map((k) => <Nd key={k} p={pos(k)} k={k} f={!phase2 && k === 40 && us >= 1 ? C.caramel : C.crema} />)}
      {phase2 && pop <= 0 && <circle cx={pos(80)[0]} cy={pos(80)[1]} r={R} fill="none" stroke={C.taupe} strokeWidth={1.4} strokeDasharray="3 3" />}
      <Nd p={pos(80)} k={80} f={C.caramel} sc={pop} o={pop > 0 ? 1 : 0} />
      <circle cx={ring[0]} cy={ring[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} opacity={t > 0.25 && t < 3.0 ? 1 : 0} />
      <T x={30} y={300} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>the same walk; insert just keeps going to empty space</T>
    </Svg>
  );
}

// 3 · Predict: sorted insertion. Seven keys wait in sorted order above an empty root. After the answer they
// drop in one at a time, each the right child of the one before, building a single diagonal chain.
export function DegeneratePredict({ answer, t }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const chain = (i: number): Pt => [70 + i * 72, 104 + i * 30];
  const pop = (i: number) => (answered ? easeOutBack(seg(s, 0.1 + i * 0.22, 0.35 + i * 0.22)) : 0);
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="Seven keys in sorted order about to be inserted into an empty tree; each becomes the right child of the one before, a single chain" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>inserted in sorted order</T>
      {KEYS.map((k, i) => (
        <g key={k} opacity={1 - clamp(pop(i))}>
          <rect x={30 + i * 50} y={36} width={42} height={26} rx={3} fill={C.cocoa} stroke={C.crema} strokeWidth={1.2} />
          <T x={51 + i * 50} y={54} s={13} f={C.crema} a="middle">{k}</T>
        </g>
      ))}
      {!answered && <circle cx={chain(0)[0]} cy={chain(0)[1]} r={R} fill="none" stroke={C.taupe} strokeWidth={1.4} strokeDasharray="3 3" opacity={pulse} />}
      {KEYS.map((k, i) => (i > 0 ? <Ed key={`e${k}`} a={chain(i - 1)} b={chain(i)} f={C.cherryText} o={clamp(pop(i))} /> : null))}
      {KEYS.map((k, i) => <Nd key={k} p={chain(i)} k={k} f={C.cherryText} sc={pop(i)} o={pop(i) > 0 ? 1 : 0} />)}
      {!answered && <T x={30} y={306} s={15} f={C.caramel} o={pulse}>what shape?</T>}
      {answered && <T x={30} y={284} s={13} f={C.latte} o={easeOut(seg(s, 1.7, 2.1))}>every node: only a right child</T>}
      {answered && <T x={30} y={306} s={13} f={C.cherryText} o={easeOut(seg(s, 1.9, 2.3))}>one long chain: height = key count</T>}
    </Svg>
  );
}

// 4 · Nothing broke. The same seven keys: the random-order tree on the left, the chain on the right. Down the
// chain, a check lights after every insert (the property held); then height rulers: the tree's 3 levels
// against the chain's full length, and nothing ever raised a warning.
export function DegenerateReveal({ t }: StepCtx) {
  const lx = (k: number) => 40 + KEYS.indexOf(k) * 36;
  const ly = (d: number) => 100 + d * 52;
  const ch = (i: number): Pt => [330 + i * 36, 74 + i * 30];
  const rul = easeOut(seg(t, 2.1, 2.6));
  return (
    <Svg label="The same seven keys as a balanced tree and as a chain; the binary-search-tree property is checked true after every insert into the chain, yet its height grows to the key count" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>random order</T>
      <T x={330} y={24} s={13} f={C.cherryText}>sorted order</T>
      {Object.entries(P0).map(([c, p]) => <Ed key={c} a={[lx(+p), ly(D0[+p])]} b={[lx(+c), ly(D0[+c])]} />)}
      {KEYS.map((k) => <Nd key={k} p={[lx(k), ly(D0[k])]} k={k} f={C.cinnamon} />)}
      {KEYS.map((k, i) => (i > 0 ? <Ed key={`e${k}`} a={ch(i - 1)} b={ch(i)} f={C.cherryText} /> : null))}
      {KEYS.map((k, i) => <Nd key={k} p={ch(i)} k={k} f={C.cherryText} />)}
      {KEYS.map((k, i) => <Check key={k} x={ch(i)[0] - 28} y={ch(i)[1]} t={t} at={0.3 + i * 0.22} />)}
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 0.4, 0.8))}>property checked after every insert: holds</T>
      <g opacity={rul}>
        <line x1={20} y1={ly(0) - R} x2={20} y2={lerp(ly(0) - R, ly(2) + R, rul)} stroke={C.cinnamon} strokeWidth={2} />
        <T x={30} y={240} s={13} f={C.cinnamon}>height 3</T>
        <line x1={586} y1={ch(0)[1] - R} x2={586} y2={lerp(ch(0)[1] - R, ch(6)[1] + R, rul)} stroke={C.cherryText} strokeWidth={2} />
      </g>
      <T x={30} y={300} s={13} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>and nothing in the property ever warned you</T>
    </Svg>
  );
}

// 5 · Delete a two-child node. 50 is marked for deletion. A caramel ring walks to its successor: one step
// right, then left as far as it goes, to 60. The in-order row below shows 50 and 60 side by side, nothing
// between; then 60 slides up into 50's place.
export function DeleteSuccessor({ t }: StepCtx) {
  const yOf = (d: number) => 100 + d * 56;
  const pos = (k: number): Pt => [X(k), yOf(D0[k])];
  const mark = easeOut(seg(t, 0.2, 0.6));
  const walk = easeInOut(seg(t, 0.8, 1.6));
  const ring = along([pos(50), pos(70), pos(60)], walk);
  const adj = easeOut(seg(t, 1.8, 2.3));
  const up = easeInOut(seg(t, 2.5, 3.3));
  const p60: Pt = [lerp(pos(60)[0], pos(50)[0], up), lerp(pos(60)[1], pos(50)[1], up)];
  return (
    <Svg label="Deleting 50, which has two children: its successor 60 is the smallest key in its right subtree, adjacent to it in sorted order, and moves up into its place" h={320}>
      <T x={30} y={24} s={13} f={C.cherryText} o={mark}>delete 50: two children</T>
      <T x={30} y={48} s={13} f={C.caramel} o={easeOut(seg(t, 0.8, 1.1))}>successor: smallest key in the right subtree</T>
      {Object.entries(P0).map(([c, p]) => (
        <Ed key={c} a={pos(+p)} b={pos(+c)} o={+c === 60 ? 1 - up : 1} f={(+p === 50 && +c === 70 && walk > 0.1) || (+p === 70 && +c === 60 && walk > 0.6) ? C.caramel : C.mocha} w={1.6} />
      ))}
      {KEYS.filter((k) => k !== 60 && k !== 50).map((k) => <Nd key={k} p={pos(k)} k={k} />)}
      <Nd p={pos(50)} k={50} f={C.cherryText} o={1 - up} />
      {mark > 0 && up < 0.5 && <line x1={pos(50)[0] - 11} y1={pos(50)[1] - 11} x2={pos(50)[0] + 11} y2={pos(50)[1] + 11} stroke={C.cherryText} strokeWidth={2} opacity={mark * (1 - up * 2)} />}
      <Nd p={p60} k={60} f={walk >= 1 ? C.caramel : C.crema} />
      {walk > 0 && walk < 1 && <circle cx={ring[0]} cy={ring[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
      {KEYS.map((k) => {
        const hot = k === 50 || k === 60;
        return (
          <g key={k} opacity={k === 50 ? lerp(1, 0.3, up) : 1}>
            <rect x={X(k) - 22} y={240} width={44} height={26} rx={3} fill={C.cocoa} stroke={hot && adj > 0 ? (k === 50 ? C.cherryText : C.caramel) : C.taupe} strokeWidth={hot && adj > 0 ? 2 : 1.1} />
            <T x={X(k)} y={258} s={13} f={hot && adj > 0 ? (k === 50 ? C.cherryText : C.caramel) : C.latte} a="middle">{k}</T>
          </g>
        );
      })}
      <path d={`M ${X(50) - 20} 274 v 6 H ${X(60) + 20} v -6`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={adj} />
      <T x={(X(50) + X(60)) / 2} y={302} s={13} f={C.caramel} a="middle" o={adj}>nothing in between</T>
    </Svg>
  );
}

// 6 · In-order traversal. A caramel ring visits the nodes left, node, right; because x is in-order rank, the
// ring sweeps left to right, and each visited key drops straight down into the next output slot: sorted.
export function InOrderTraversal({ t }: StepCtx) {
  const yOf = (d: number) => 90 + d * 56;
  const pos = (k: number): Pt => [X(k), yOf(D0[k])];
  const at = (i: number) => 0.3 + i * 0.36;
  const v = clamp(seg(t, at(0), at(6))) * 6;
  const i0 = Math.min(5, Math.floor(v));
  const ring: Pt = [lerp(pos(KEYS[i0])[0], pos(KEYS[i0 + 1])[0], v - i0), lerp(pos(KEYS[i0])[1], pos(KEYS[i0 + 1])[1], v - i0)];
  return (
    <Svg label="An in-order traversal visits left subtree, node, right subtree at every level; the keys come out in sorted order" h={320}>
      <T x={30} y={24} s={13} f={C.caramel}>left, visit, right: at every node</T>
      {Object.entries(P0).map(([c, p]) => <Ed key={c} a={pos(+p)} b={pos(+c)} />)}
      {KEYS.map((k, i) => <Nd key={k} p={pos(k)} k={k} f={t >= at(i) ? C.caramel : C.crema} />)}
      {t > 0.2 && t < at(6) + 0.3 && <circle cx={ring[0]} cy={ring[1]} r={R + 5} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
      <T x={30} y={226} s={13} f={C.latte}>out</T>
      {KEYS.map((k, i) => {
        const u = easeInOut(seg(t, at(i), at(i) + 0.3));
        return (
          <g key={k}>
            <rect x={X(k) - 22} y={236} width={44} height={26} rx={3} fill={C.cocoa} stroke={C.taupe} strokeWidth={1.1} />
            {u > 0 && <T x={X(k)} y={lerp(pos(k)[1] + 5, 254, u)} s={13} f={C.caramel} a="middle">{k}</T>}
          </g>
        );
      })}
      <T x={30} y={300} s={13} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>sorted, because the shape forced it</T>
    </Svg>
  );
}

// 7 · A rotation. examples.py's rotate_left(30): 40 is promoted, 30 demoted under it, and 50's left pointer
// now points at 40. Because x is in-order rank, every node moves only up or down; the dashed guides to the
// sorted row below stay perfectly vertical the whole time.
export function Rotation({ t }: StepCtx) {
  const yOf = (d: number) => 86 + d * 48;
  const D1: Record<number, number> = { 50: 0, 40: 1, 70: 1, 30: 2, 60: 2, 80: 2, 20: 3 };
  const u = easeInOut(seg(t, 1.0, 2.4));
  const pos = (k: number): Pt => [X(k), lerp(yOf(D0[k]), yOf(D1[k]), u)];
  const relink = t >= 1.0;
  const ok = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="Rotating left at 30: 40 moves up and 30 moves down, a few pointers change, and every key keeps its left-to-right position, so the in-order sequence is unchanged" h={320}>
      <T x={30} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 0.2, 0.5))}>rotate left at 30</T>
      <T x={570} y={24} s={13} f={C.cinnamon} a="end" o={ok}>height 3 &rarr; 4</T>
      <T x={30} y={48} s={13} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>a constant number of pointers relinked</T>
      {KEYS.map((k) => <line key={`g${k}`} x1={X(k)} y1={pos(k)[1] + R + 2} x2={X(k)} y2={258} stroke={C.mocha} strokeWidth={1} strokeDasharray="2 4" opacity={easeOut(seg(t, 0.3, 0.7))} />)}
      <Ed a={pos(50)} b={pos(30)} o={1 - u} f={relink ? C.cherryText : C.mocha} w={1.8} />
      <Ed a={pos(50)} b={pos(40)} o={u} f={C.caramel} w={2.2} />
      <Ed a={pos(30)} b={pos(40)} f={relink ? C.caramel : C.mocha} w={relink ? 2.2 : 1.4} />
      <Ed a={pos(30)} b={pos(20)} />
      <Ed a={pos(50)} b={pos(70)} />
      <Ed a={pos(70)} b={pos(60)} />
      <Ed a={pos(70)} b={pos(80)} />
      {KEYS.map((k) => <Nd key={k} p={pos(k)} k={k} f={k === 30 || k === 40 ? (easeOut(seg(t, 0.4, 0.8)) > 0 ? C.caramel : C.crema) : C.crema} />)}
      {KEYS.map((k, i) => (
        <g key={`r${k}`}>
          <rect x={X(k) - 22} y={260} width={44} height={26} rx={3} fill={C.cocoa} stroke={ok > 0 ? C.caramel : C.taupe} strokeWidth={ok > 0 ? 1.6 : 1.1} />
          <T x={X(k)} y={278} s={13} f={C.crema} a="middle">{k}</T>
          <Check x={X(k) + 26} y={250} t={t} at={2.6 + i * 0.05} />
        </g>
      ))}
      <T x={30} y={312} s={13} f={C.caramel} o={ok}>in-order sequence: unchanged</T>
    </Svg>
  );
}

// 8 · Prove it. Left: examples.py's 200 keys, inserted in random order (height 17) and in sorted order (height
// 200), bars to scale. Right: the rotation's in-order sequence before and after, cell by cell, identical.
export function ProveIt({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.3, 1.5));
  const num = easeOut(seg(t, 1.4, 1.7));
  const cellsA = clamp(seg(t, 1.8, 2.4)) * 7;
  const cellsB = clamp(seg(t, 2.4, 3.0)) * 7;
  const eq = easeOut(seg(t, 3.0, 3.3));
  return (
    <Svg label="Measured: 200 keys reach height 17 in random order but height 200 in sorted order; a rotation's in-order sequence is identical before and after" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>200 keys, same set</T>
      <line x1={40} y1={250} x2={270} y2={250} stroke={C.mocha} strokeWidth={1.2} />
      <rect x={70} y={250 - (17 / 200) * 180 * g} width={60} height={(17 / 200) * 180 * g} fill={C.cinnamon} />
      <rect x={180} y={250 - 180 * g} width={60} height={180 * g} fill={C.cherryText} />
      <T x={100} y={250 - (17 / 200) * 180 - 8} s={14} f={C.cinnamon} a="middle" o={num}>17</T>
      <T x={210} y={62} s={14} f={C.cherryText} a="middle" o={num}>200</T>
      <T x={100} y={272} s={13} f={C.cinnamon} a="middle">random</T>
      <T x={210} y={272} s={13} f={C.cherryText} a="middle">sorted</T>
      <T x={330} y={24} s={13} f={C.crema} o={easeOut(seg(t, 1.7, 2.0))}>rotate_left(30)</T>
      <T x={330} y={62} s={13} f={C.latte} o={easeOut(seg(t, 1.7, 2.0))}>before</T>
      <T x={330} y={142} s={13} f={C.latte} o={easeOut(seg(t, 2.3, 2.6))}>after</T>
      {KEYS.map((k, i) => (
        <g key={k}>
          <g opacity={clamp(cellsA - i)}>
            <rect x={330 + i * 34} y={72} width={30} height={24} rx={3} fill={C.cocoa} stroke={C.crema} strokeWidth={1.1} />
            <T x={345 + i * 34} y={89} s={11} f={C.crema} a="middle">{k}</T>
          </g>
          <g opacity={clamp(cellsB - i)}>
            <rect x={330 + i * 34} y={152} width={30} height={24} rx={3} fill={C.cocoa} stroke={eq > 0 ? C.caramel : C.crema} strokeWidth={1.1} />
            <T x={345 + i * 34} y={169} s={11} f={eq > 0 ? C.caramel : C.crema} a="middle">{k}</T>
          </g>
          <line x1={345 + i * 34} y1={100} x2={345 + i * 34} y2={148} stroke={C.caramel} strokeWidth={1.2} strokeDasharray="2 3" opacity={eq} />
        </g>
      ))}
      <T x={330} y={206} s={13} f={C.caramel} o={eq}>identical, key for key</T>
      <T x={330} y={230} s={13} f={C.cinnamon} o={easeOut(seg(t, 3.2, 3.5))}>height 3 &rarr; 4</T>
      <T x={30} y={306} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>all measured in one run, not assumed</T>
    </Svg>
  );
}
