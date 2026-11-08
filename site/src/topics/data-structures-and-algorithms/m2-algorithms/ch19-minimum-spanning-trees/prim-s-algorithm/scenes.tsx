import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, shared with topic 67): crema = a vertex/edge as given; latte = secondary labels;
// taupe = not-yet-considered or a stale entry (thin, dashed); caramel = the thing to look at (the edge being
// considered, the cut, the tree edge just added); cinnamon (rare) = the alternative being compared (array Prim against
// heap Prim); cherryText = the bad outcome (heap work piling up). Every printed number is examples.py's: the ten links
// (AB 4, AC 2, AB 7, BC 3, BD 5, CD 1, CE 6, DE 2, DF 8, EF 3); the order A, C, D, E, B, F and weight 11 from all three
// versions; lazy 10 pushes and 5 pops; eager 9 pushes and 8 decreases; the array's 21 comparisons (6 + 5 + 4 + 3 + 2
// + 1); at 200 vertices the array's fixed 20,100 and the predicted crossover 5,233 edges. The measured crossover
// comes from a seeded random graph, so it is drawn as a position only. The runs replay here by examples.py's loops.

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

type P = readonly [number, number];
const POS: Record<string, P> = { A: [80, 135], B: [220, 45], C: [220, 225], D: [380, 45], E: [380, 225], F: [520, 135] };
type E = { k: string; u: string; v: string; w: number };
// examples.py's EDGES.
const EDGES: E[] = [
  { k: 'AB4', u: 'A', v: 'B', w: 4 }, { k: 'AC2', u: 'A', v: 'C', w: 2 }, { k: 'AB7', u: 'A', v: 'B', w: 7 },
  { k: 'BC3', u: 'B', v: 'C', w: 3 }, { k: 'BD5', u: 'B', v: 'D', w: 5 }, { k: 'CD1', u: 'C', v: 'D', w: 1 },
  { k: 'CE6', u: 'C', v: 'E', w: 6 }, { k: 'DE2', u: 'D', v: 'E', w: 2 }, { k: 'DF8', u: 'D', v: 'F', w: 8 },
  { k: 'EF3', u: 'E', v: 'F', w: 3 },
];
const WPOS: Record<string, P> = {
  AB4: [158, 102], AC2: [140, 194], AB7: [118, 62], BC3: [208, 140], BD5: [300, 36], CD1: [324, 152],
  CE6: [300, 244], DE2: [392, 140], DF8: [462, 82], EF3: [462, 196],
};
const VERTS = ['A', 'B', 'C', 'D', 'E', 'F'];
const ADJ: Record<string, { v: string; w: number; k: string }[]> = Object.fromEntries(VERTS.map((v) => [v, [] as { v: string; w: number; k: string }[]]));
EDGES.forEach((e) => {
  ADJ[e.u].push({ v: e.v, w: e.w, k: e.k });
  ADJ[e.v].push({ v: e.u, w: e.w, k: e.k });
});

function Edge({ e, stroke = C.taupe, w = 1.4, dash, p = 1, label = true, lf }: { e: E; stroke?: string; w?: number; dash?: string; p?: number; label?: boolean; lf?: string }) {
  const [x1, y1] = POS[e.u];
  const [x2, y2] = POS[e.v];
  const q = clamp(p, 0, 1);
  const cx = 105, cy = 40;
  const d = e.k === 'AB7'
    ? `M${x1} ${y1} Q${lerp(x1, cx, q)} ${lerp(y1, cy, q)} ${(1 - q) * (1 - q) * x1 + 2 * (1 - q) * q * cx + q * q * x2} ${(1 - q) * (1 - q) * y1 + 2 * (1 - q) * q * cy + q * q * y2}`
    : `M${x1} ${y1} L${lerp(x1, x2, q)} ${lerp(y1, y2, q)}`;
  return (
    <g>
      {q > 0 && <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} />}
      {label && <T x={WPOS[e.k][0]} y={WPOS[e.k][1]} s={12} f={lf ?? C.latte} a="middle">{String(e.w)}</T>}
    </g>
  );
}
function Vertex({ id, stroke = C.crema, at }: { id: string; stroke?: string; at?: P }) {
  const [x, y] = at ?? POS[id];
  return (
    <g>
      <circle cx={x} cy={y} r={14} fill={C.band} stroke={stroke} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} f={stroke} a="middle">{id}</T>
    </g>
  );
}
function Graph({ style, vs, labels = true }: { style?: (e: E) => { stroke?: string; w?: number; dash?: string; p?: number; lf?: string } | undefined; vs?: (v: string) => string; labels?: boolean }) {
  return (
    <g>
      {EDGES.map((e) => <Edge key={e.k} e={e} {...(style?.(e) ?? { dash: '5 4' })} label={labels} />)}
      {VERTS.map((v) => <Vertex key={v} id={v} stroke={vs?.(v) ?? C.crema} />)}
    </g>
  );
}

/** examples.py's prim_lazy from A: each pop, the vertex it adds, the edges it pushes, and the heap afterwards. */
function lazy() {
  const inTree = new Set(['A']);
  let heap: { w: number; v: string; u: string; k: string }[] = ADJ.A.map((a) => ({ w: a.w, v: a.v, u: 'A', k: a.k }));
  let pushes = heap.length;
  let pops = 0;
  const steps: { add: string; via: string; pushed: string[]; heap: string[] }[] = [];
  const sort = () => (heap = [...heap].sort((a, b) => a.w - b.w || (a.v < b.v ? -1 : a.v > b.v ? 1 : a.u < b.u ? -1 : 1)));
  while (heap.length && inTree.size < 6) {
    sort();
    const top = heap.shift()!;
    pops++;
    if (inTree.has(top.v)) continue;
    inTree.add(top.v);
    const pushed: string[] = [];
    for (const a of ADJ[top.v])
      if (!inTree.has(a.v)) {
        heap.push({ w: a.w, v: a.v, u: top.v, k: a.k });
        pushes++;
        pushed.push(a.k);
      }
    sort();
    steps.push({ add: top.v, via: top.k, pushed, heap: heap.map((h) => `${h.u}${h.v}${h.w}`) });
  }
  return { steps, pushes, pops, leftover: heap.map((h) => ({ ...h, stale: inTree.has(h.v) })) };
}
const LAZY = lazy();
const ORDER = ['A', ...LAZY.steps.map((s) => s.add)]; // A, C, D, E, B, F
const TREE = LAZY.steps.map((s) => s.via); // AC2, CD1, DE2, BC3, EF3

/** examples.py's prim_eager from A: each vertex added, and the key changes (decreases) that follow it. */
function eager() {
  const key: Record<string, number> = Object.fromEntries(VERTS.map((v) => [v, Infinity]));
  key.A = 0;
  const inTree = new Set<string>();
  const rounds: { add: string; dec: { v: string; w: number }[] }[] = [];
  let pushes = 1;
  let decreases = 0;
  for (const u of ORDER) {
    inTree.add(u);
    const dec: { v: string; w: number }[] = [];
    for (const a of ADJ[u])
      if (!inTree.has(a.v) && a.w < key[a.v]) {
        key[a.v] = a.w;
        dec.push({ v: a.v, w: a.w });
        pushes++;
        decreases++;
      }
    rounds.push({ add: u, dec });
  }
  return { rounds, pushes, decreases };
}
const EAGER = eager();

// 1 · Opening. A complete graph draws itself, every pair of points joined. Three ways to pay for it fill in as bars:
// sorting every edge first, a heap operation per useful edge, and a plain array scan, the last staying flat.
const RING = Array.from({ length: 16 }, (_, i): P => [170 + 120 * Math.cos((i / 16) * Math.PI * 2 - Math.PI / 2), 130 + 105 * Math.sin((i / 16) * Math.PI * 2 - Math.PI / 2)]);
export function Opening({ t }: StepCtx) {
  const pairs: [number, number][] = [];
  for (let i = 0; i < 16; i++) for (let j = i + 1; j < 16; j++) pairs.push([i, j]);
  const draw = easeInOut(seg(t, 0.2, 1.8));
  const bars = [0, 1, 2].map((i) => easeOut(seg(t, 2.0 + i * 0.5, 2.6 + i * 0.5)));
  const cap = easeOut(seg(t, 3.8, 4.3));
  const W = [230, 170, 70];
  const L = ['sort every edge', 'a heap op per edge', 'array scan'];
  return (
    <Svg label="A complete graph draws itself, every pair of points joined. Three ways to pay for it fill in as bars: sorting every edge first, a heap operation per useful edge, and a plain array scan, the last one short" h={270}>
      {pairs.slice(0, Math.floor(draw * pairs.length)).map(([i, j], n) => (
        <line key={n} x1={RING[i][0]} y1={RING[i][1]} x2={RING[j][0]} y2={RING[j][1]} stroke={C.line} strokeWidth={0.8} />
      ))}
      {RING.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={4} fill={C.crema} />)}
      {L.map((l, i) => (
        <g key={l} opacity={bars[i] > 0 ? 1 : 0}>
          <T x={330} y={56 + i * 54} s={12} f={i === 2 ? C.cinnamon : C.latte}>{l}</T>
          <rect x={330} y={64 + i * 54} width={W[i] * bars[i]} height={16} fill={i === 2 ? C.cinnamon : i === 1 ? C.cherryText : C.crema} />
        </g>
      ))}
      <T x={300} y={258} s={13} f={C.cinnamon} a="middle" o={cap}>the plain array might still win</T>
    </Svg>
  );
}

// The cost picture used by three steps: edges on x, cost on y; the heap's cost rises with edges, the array's is flat.
const PX = (f: number) => 70 + f * 460;
const PY = (f: number) => 210 - f * 160;
function Axes({ o = 1 }: { o?: number }) {
  return (
    <g opacity={o}>
      <line x1={PX(0)} y1={PY(0)} x2={PX(1)} y2={PY(0)} stroke={C.line} />
      <line x1={PX(0)} y1={PY(0)} x2={PX(0)} y2={PY(1)} stroke={C.line} />
      <T x={PX(1)} y={PY(0) + 22} s={12} f={C.latte} a="end">edges →</T>
      <T x={PX(0) - 8} y={PY(1) + 4} s={12} f={C.latte} a="end">cost</T>
    </g>
  );
}
const ARRAY_LEVEL = 0.55;
const heapCost = (f: number) => 0.08 + f * 0.9;

// 2 · PredictArrayOrHeap. The axes; the heap's cost climbs as edges are added, the array's stays a flat dashed line.
// After answering: the crossing is marked, and right of it the array is the cheaper one.
export function PredictArrayOrHeap({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const heap = easeInOut(seg(t, 0.3, 1.8));
  const arr = easeOut(seg(t, 1.0, 1.6));
  const cross = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const xf = (ARRAY_LEVEL - 0.08) / 0.9;
  const pts = Array.from({ length: 21 }, (_, i) => i / 20).filter((f) => f <= heap);
  return (
    <Svg label="Cost against edge count: the heap's cost climbs as edges are added, the array's stays a flat dashed line. After answering: the crossing is marked, and to the right of it the array is cheaper" h={260}>
      <Axes />
      <polyline points={pts.map((f) => `${PX(f)},${PY(heapCost(f))}`).join(' ')} fill="none" stroke={C.cherryText} strokeWidth={2.5} />
      <line x1={PX(0)} y1={PY(ARRAY_LEVEL)} x2={PX(arr)} y2={PY(ARRAY_LEVEL)} stroke={C.cinnamon} strokeWidth={2.5} strokeDasharray="6 4" />
      <T x={PX(0.98)} y={PY(heapCost(0.98)) + 4} s={12} f={C.cherryText} a="end" o={heap >= 1 ? 1 : 0}>heap</T>
      <T x={PX(0.02)} y={PY(ARRAY_LEVEL) - 10} s={12} f={C.cinnamon} o={arr}>array</T>
      {answered && (
        <g opacity={cross}>
          <line x1={PX(xf)} y1={PY(0)} x2={PX(xf)} y2={PY(1)} stroke={C.caramel} strokeDasharray="4 4" />
          <rect x={PX(xf)} y={PY(1)} width={PX(1) - PX(xf)} height={PY(0) - PY(1)} fill={C.cinnamon} opacity={0.08} />
          <T x={300} y={248} s={13} f={C.caramel} a="middle">dense enough: the array wins</T>
        </g>
      )}
      {!answered && <T x={300} y={248} s={13} f={C.crema} a="middle" o={arr}>a dense graph: does the heap win?</T>}
    </Svg>
  );
}

// 3 · PrimMechanism. The tree grows from A: a ring holds the tree; the lightest edge leaving the ring lights and joins,
// A–C 2, then C–D 1, D–E 2, B–C 3, E–F 3; the ring takes each new vertex in.
const PB = 0.7;
export function PrimMechanism({ t }: StepCtx) {
  const k = clamp((t - 0.4) / PB, 0, 5);
  const n = Math.floor(k);
  const p = k - n;
  const inTree = new Set(ORDER.slice(0, n + 1));
  const next = n < 5 ? TREE[n] : null;
  const crossing = (e: E) => inTree.has(e.u) !== inTree.has(e.v);
  return (
    <Svg label="Prim's tree grows from A: a ring holds the tree, the lightest edge leaving it lights and joins, A to C at 2, then C to D at 1, D to E at 2, B to C at 3, E to F at 3, and the ring takes each new vertex in" h={300}>
      <Graph
        style={(e) => {
          const ti = TREE.indexOf(e.k);
          if (ti >= 0 && ti < n) return { stroke: C.crema, w: 3 };
          if (e.k === next) return { stroke: C.caramel, w: 3, p: easeInOut(clamp(p * 2 - 0.4, 0, 1)) || 0.001, lf: C.caramel };
          if (crossing(e) && n < 5) return { stroke: C.latte, w: 1.6 };
          return { dash: '5 4' };
        }}
        vs={(v) => (inTree.has(v) ? C.caramel : C.crema)}
      />
      {[...inTree].map((v) => <circle key={v} cx={POS[v][0]} cy={POS[v][1]} r={24} fill="none" stroke={C.caramel} strokeDasharray="4 4" opacity={0.7} />)}
      <T x={300} y={282} s={13} f={C.crema} a="middle">{n < 5 ? 'the cut: the tree against the rest; take the lightest' : `the tree: ${ORDER.join(', ')}`}</T>
    </Svg>
  );
}

// 4 · LazyPrim. examples.py's prim_lazy from A: every edge leaving each new vertex is pushed; the minimum pops and its
// vertex joins. The tree comes out identical; 10 pushes, 5 pops, and the entries left behind are stale: both ends in.
export function LazyPrim({ t }: StepCtx) {
  const k = clamp((t - 0.4) / 0.7, 0, 5);
  const n = Math.floor(k);
  const inTree = new Set(ORDER.slice(0, n + 1));
  const heapNow = n === 0 ? ['AC2', 'AB4', 'AB7'] : LAZY.steps[n - 1].heap;
  const done = n >= 5;
  const cap = easeOut(seg(t, 4.2, 4.6));
  return (
    <Svg label="Lazy Prim from A: every edge leaving each new vertex is pushed onto the heap; the minimum pops and its vertex joins. The tree comes out identical, with 10 pushes and 5 pops, and the entries left behind are stale, both ends already in the tree" h={300}>
      <Graph style={(e) => {
        const ti = TREE.indexOf(e.k);
        if (ti >= 0 && ti < n) return { stroke: C.crema, w: 3 };
        return { dash: '5 4' };
      }} vs={(v) => (inTree.has(v) ? C.caramel : C.crema)} />
      <T x={30} y={274} s={12} f={C.latte}>heap</T>
      {heapNow.map((h, i) => {
        const u = h.slice(0, 1), v = h.slice(1, 2);
        const stale = done && inTree.has(u) && inTree.has(v);
        return (
          <g key={h + i}>
            <rect x={80 + i * 58} y={256} width={52} height={26} rx={4} fill="none" stroke={i === 0 && !done ? C.caramel : stale ? C.mocha : C.latte} strokeDasharray={stale ? '3 3' : undefined} />
            <T x={106 + i * 58} y={274} s={12} f={stale ? C.taupe : C.crema} a="middle">{h}</T>
          </g>
        );
      })}
      <T x={570} y={22} s={13} f={C.caramel} a="end" o={cap}>{`${LAZY.pushes} pushes, ${LAZY.pops} pops`}</T>
      <T x={30} y={22} s={12} f={C.taupe} o={cap}>left behind: stale</T>
    </Svg>
  );
}

// 5 · EagerPrim. examples.py's prim_eager: one key per vertex outside the tree. Each new vertex lowers its neighbours'
// keys in place (a sift-up), flashing as they drop; the same order, A, C, D, E, B, F; 9 pushes, 8 decreases.
export function EagerPrim({ t }: StepCtx) {
  const k = clamp((t - 0.4) / 0.65, 0, 6);
  const n = Math.floor(k);
  const p = k - n;
  const key: Record<string, number> = Object.fromEntries(VERTS.map((v) => [v, Infinity]));
  key.A = 0;
  const inTree = new Set<string>();
  const fresh = new Set<string>();
  EAGER.rounds.forEach((r, i) => {
    if (i < n || (i === n && p > 0.3)) {
      inTree.add(r.add);
      r.dec.forEach((d) => {
        key[d.v] = d.w;
        if (i === n) fresh.add(d.v);
      });
    }
  });
  const cap = easeOut(seg(t, 4.4, 4.8));
  return (
    <Svg label="Eager Prim: one key per vertex outside the tree. Each new vertex lowers its neighbours' keys in place, a sift-up, and they flash as they drop; the same order A, C, D, E, B, F, with 9 pushes and 8 decreases" h={300}>
      <Graph style={(e) => {
        const ti = TREE.indexOf(e.k);
        if (ti >= 0 && inTree.has(ORDER[ti + 1])) return { stroke: C.crema, w: 3 };
        return { dash: '5 4' };
      }} vs={(v) => (inTree.has(v) ? C.caramel : C.crema)} />
      <T x={30} y={274} s={12} f={C.latte}>key</T>
      {VERTS.map((v, i) => (
        <g key={v}>
          <rect x={80 + i * 58} y={256} width={50} height={26} rx={4} fill={fresh.has(v) ? C.cocoa : 'none'} stroke={inTree.has(v) ? C.mocha : fresh.has(v) ? C.caramel : C.latte} />
          <T x={105 + i * 58} y={274} s={12} f={inTree.has(v) ? C.taupe : fresh.has(v) ? C.caramel : C.crema} a="middle">{`${v} ${key[v] === Infinity ? '∞' : key[v]}`}</T>
        </g>
      ))}
      <T x={570} y={22} s={13} f={C.caramel} a="end" o={cap}>{`${EAGER.pushes} pushes, ${EAGER.decreases} decreases`}</T>
    </Svg>
  );
}

// 6 · PrimAndDijkstra. The loop drawn as three boxes in a ring: pop the minimum key, add it, update the neighbours'
// keys. The update line reads Prim's key, w(u, v), then swaps to Dijkstra's, d(u) + w(u, v); nothing else moves.
export function PrimAndDijkstra({ t }: StepCtx) {
  const boxes = easeOut(seg(t, 0.2, 0.8));
  const spin = clamp((t - 0.4) / 1.2, 0, 3);
  const swap = t > 2.2;
  const cap = easeOut(seg(t, 2.8, 3.2));
  const B: P[] = [[300, 50], [460, 150], [140, 150]];
  const labels = ['pop the minimum key', 'add it to the tree', ''];
  const dk = Math.floor(spin) % 3, df = spin - Math.floor(spin);
  const dot: P = [lerp(B[dk][0], B[(dk + 1) % 3][0], df), lerp(B[dk][1], B[(dk + 1) % 3][1], df)];
  return (
    <Svg label="The loop as three boxes in a ring: pop the minimum key, add it to the tree, update the neighbours' keys. The update line reads Prim's key, the edge weight, then swaps to Dijkstra's, the distance so far plus the edge weight; nothing else changes" h={250}>
      {B.map((b, i) => (
        <g key={i} opacity={boxes}>
          <line x1={b[0]} y1={b[1]} x2={B[(i + 1) % 3][0]} y2={B[(i + 1) % 3][1]} stroke={C.line} />
        </g>
      ))}
      {B.map((b, i) => (
        <g key={`b${i}`} opacity={boxes}>
          <rect x={b[0] - 95} y={b[1] - 17} width={190} height={34} rx={6} fill={C.band} stroke={i === 2 ? (swap ? C.cinnamon : C.caramel) : C.latte} strokeWidth={i === 2 ? 2 : 1} />
          {i < 2 && <T x={b[0]} y={b[1] + 5} s={12} f={C.crema} a="middle">{labels[i]}</T>}
        </g>
      ))}
      {!swap ? (
        <T x={B[2][0]} y={B[2][1] + 5} s={12} f={C.caramel} a="middle" o={boxes}>key = w(u, v)</T>
      ) : (
        <T x={B[2][0]} y={B[2][1] + 5} s={12} f={C.cinnamon} a="middle">key = d(u) + w(u, v)</T>
      )}
      {spin > 0 && spin < 3 && <circle cx={dot[0]} cy={dot[1]} r={5} fill={C.caramel} />}
      <T x={300} y={226} s={13} f={swap ? C.cinnamon : C.caramel} a="middle" o={cap}>one line changed: Prim's loop is Dijkstra's</T>
    </Svg>
  );
}

// 7 · ArrayVersion. A row of six keys; each round a cursor sweeps every cell still outside the tree, a dot per
// comparison dropping into a staircase below: 6, 5, 4, 3, 2, 1 — 21 in all.
export function ArrayVersion({ t }: StepCtx) {
  const total = 21;
  const k = clamp((t - 0.3) / 0.17, 0, total);
  let left = k;
  const rows: number[] = [];
  for (let r = 0; r < 6; r++) {
    const n = 6 - r;
    rows.push(clamp(left, 0, n));
    left -= n;
  }
  const round = rows.findIndex((c, r) => c < 6 - r);
  const inTree = new Set(ORDER.slice(0, round < 0 ? 6 : round));
  const outside = ORDER.filter((v) => !inTree.has(v));
  const cur = round >= 0 ? outside[Math.min(outside.length - 1, Math.floor(rows[round]))] : null;
  const cap = easeOut(seg(t, 4.0, 4.4));
  // The scan cursor glides from cell to cell along the keys still outside the tree; every comparison it makes
  // drops a dot out of the cell it is reading into that round's row of the staircase.
  const CXk = (v: string) => 147 + ORDER.indexOf(v) * 64;
  let cursorX = CXk(ORDER[ORDER.length - 1]);
  if (round >= 0 && outside.length) {
    const f = rows[round];
    const a = Math.min(outside.length - 1, Math.floor(f));
    const b = Math.min(outside.length - 1, a + 1);
    cursorX = lerp(CXk(outside[a]), CXk(outside[b]), easeInOut(f - Math.floor(f)));
  }
  const scanned = (r: number, j: number) => {
    let before = 0;
    for (let q = 0; q < r; q++) before += 6 - q;
    return clamp((k - before - j) / 0.9);
  };
  const treeAt = (r: number) => new Set(ORDER.slice(0, r));
  return (
    <Svg label="A row of six keys; each round a cursor sweeps every cell still outside the tree, one dot per comparison dropping into a staircase below: 6, 5, 4, 3, 2, 1, 21 in all" h={280}>
      {ORDER.map((v, i) => (
        <g key={v}>
          <rect x={120 + i * 64} y={40} width={54} height={30} rx={4} fill={inTree.has(v) ? C.cocoa : 'none'} stroke={v === cur ? C.caramel : inTree.has(v) ? C.mocha : C.latte} strokeWidth={v === cur ? 2 : 1} />
          <T x={147 + i * 64} y={60} s={13} f={inTree.has(v) ? C.taupe : C.crema} a="middle">{v}</T>
        </g>
      ))}
      {round >= 0 && k > 0 && <path d={`M${(cursorX - 31).toFixed(1)} 34 H${(cursorX + 31).toFixed(1)} M${(cursorX - 31).toFixed(1)} 76 H${(cursorX + 31).toFixed(1)}`} stroke={C.caramel} strokeWidth={2} />}
      <T x={30} y={60} s={12} f={C.latte}>keys</T>
      <T x={570} y={24} s={13} f={C.cinnamon} a="end" o={easeOut(seg(t, 0.3, 0.6))}>{`comparisons ${Math.floor(k)}`}</T>
      {rows.map((c, r) => {
        const out = ORDER.filter((v) => !treeAt(r).has(v));
        return (
          <g key={r}>
            {Array.from({ length: Math.ceil(c) }, (_, j) => {
              const d = easeOut(scanned(r, j));
              const fx = CXk(out[Math.min(out.length - 1, j)]);
              return <circle key={j} cx={lerp(fx, 147 + j * 64 + r * 32, d)} cy={lerp(70, 100 + r * 22, d)} r={5} fill={C.cinnamon} />;
            })}
            {c >= 6 - r && <T x={147 + (6 - r) * 64 + r * 32 - 20} y={105 + r * 22} s={12} f={C.latte}>{String(6 - r)}</T>}
          </g>
        );
      })}
      <T x={300} y={262} s={13} f={C.cinnamon} a="middle" o={cap}>21 comparisons, fixed by the vertex count</T>
    </Svg>
  );
}

// 8 · PredictArrayCost. The same six vertices; more and more edges join them, up to every pair. The staircase of 21
// comparisons sits beside it, waiting. After answering: it doesn't move: still 21.
export function PredictArrayCost({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const add = easeInOut(seg(t, 0.3, 2.0));
  const pairs: [number, number][] = [];
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) pairs.push([i, j]);
  const hex = (i: number): P => [150 + 90 * Math.cos((i / 6) * Math.PI * 2 - Math.PI / 2), 125 + 90 * Math.sin((i / 6) * Math.PI * 2 - Math.PI / 2)];
  const shown = Math.max(5, Math.floor(add * pairs.length));
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const ok = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="The same six vertices with more and more edges joining them, up to every pair. Beside it the staircase of 21 comparisons waits. After answering: it doesn't move, still 21" h={270}>
      {pairs.slice(0, shown).map(([i, j], n) => (
        <line key={n} x1={hex(i)[0]} y1={hex(i)[1]} x2={hex(j)[0]} y2={hex(j)[1]} stroke={n >= 5 ? C.latte : C.crema} strokeWidth={1.3} />
      ))}
      {VERTS.map((v, i) => <Vertex key={v} id={v} at={hex(i)} />)}
      {Array.from({ length: 6 }, (_, r) => Array.from({ length: 6 - r }, (_, j) => <circle key={`${r}${j}`} cx={340 + j * 20 + r * 10} cy={60 + r * 20} r={4.5} fill={C.cinnamon} opacity={answered ? 1 : 0.4 + 0.6 * pulse} />))}
      <T x={460} y={200} s={13} f={answered ? C.cinnamon : C.latte} a="middle">{answered ? 'still 21' : 'comparisons: ?'}</T>
      {!answered && <T x={300} y={254} s={13} f={C.crema} a="middle" o={add}>more edges, same six vertices</T>}
      {answered && <T x={300} y={254} s={13} f={C.cinnamon} a="middle" o={ok}>every scan walks the same vertices</T>}
    </Svg>
  );
}

// 9 · CrossoverDerived. The two costs written out, then set equal: the array's V² against the heap's E log V. Solving
// for E gives V² / log V, and at 200 vertices that's 5,233 edges, a marker on the edge axis.
export function CrossoverDerived({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.8));
  const b = easeOut(seg(t, 1.0, 1.5));
  const eq = easeOut(seg(t, 1.9, 2.4));
  const num = easeOut(seg(t, 2.9, 3.4));
  const mark = easeInOut(seg(t, 3.5, 4.3));
  const xf = 5233 / 19900;
  return (
    <Svg label="The two costs written out: the array's vertex count squared, the heap's edge count times the log of the vertex count. Set equal and solved, the edge count is V squared over log V, which at 200 vertices is 5,233 edges, marked on the edge axis" h={270}>
      <T x={150} y={40} s={14} f={C.cinnamon} a="middle" o={a}>array: V²</T>
      <T x={450} y={40} s={14} f={C.cherryText} a="middle" o={b}>heap: E · log V</T>
      <T x={300} y={86} s={14} f={C.caramel} a="middle" o={eq}>equal when E = V² / log V</T>
      <T x={300} y={124} s={13} f={C.crema} a="middle" o={num}>200 vertices: 5,233 edges</T>
      <g opacity={num}>
        <line x1={70} y1={200} x2={530} y2={200} stroke={C.line} />
        <T x={70} y={222} s={12} f={C.latte} a="middle">199</T>
        <T x={530} y={222} s={12} f={C.latte} a="middle">19,900</T>
        <T x={300} y={248} s={12} f={C.latte} a="middle">edges at 200 vertices</T>
      </g>
      <g opacity={mark}>
        <line x1={70 + 460 * xf} y1={lerp(200, 166, mark)} x2={70 + 460 * xf} y2={200} stroke={C.caramel} strokeWidth={2} />
        <T x={70 + 460 * xf} y={160} s={12} f={C.caramel} a="middle">5,233</T>
      </g>
    </Svg>
  );
}

// 10 · CrossoverMeasured. The axis at 200 vertices with the array's fixed cost, 20,100, as a flat line; the heap's
// measured cost climbs across it on random graphs. Its crossing (drawn, not printed: a seeded graph) lands in the same
// range as the predicted 5,233.
export function CrossoverMeasured({ t }: StepCtx) {
  const flat = easeOut(seg(t, 0.3, 0.8));
  const climb = easeInOut(seg(t, 0.9, 2.6));
  const pred = easeOut(seg(t, 2.8, 3.2));
  const cap = easeOut(seg(t, 3.5, 3.9));
  const xm = 1563 / 19900, xp = 5233 / 19900;
  // E log V is linear in E at fixed V: a straight climb, drawn until it leaves the top of the plot.
  const top = xm / ARRAY_LEVEL;
  const H = (f: number) => (ARRAY_LEVEL * f) / xm;
  const end = Math.min(climb, 1) * top;
  const pts = Array.from({ length: 21 }, (_, i) => (i / 20) * end).map((f) => `${PX(f)},${PY(H(f))}`);
  return (
    <Svg label="At 200 vertices, the array's fixed cost of 20,100 is a flat line; the heap's measured cost climbs across it on random graphs. Its crossing, drawn rather than printed because the graphs are seeded at random, lands in the same range as the predicted 5,233" h={270}>
      <Axes />
      <line x1={PX(0)} y1={PY(ARRAY_LEVEL)} x2={PX(flat)} y2={PY(ARRAY_LEVEL)} stroke={C.cinnamon} strokeWidth={2.5} strokeDasharray="6 4" />
      <T x={PX(1)} y={PY(ARRAY_LEVEL) - 10} s={12} f={C.cinnamon} a="end" o={flat}>array: 20,100</T>
      <polyline points={pts.join(' ')} fill="none" stroke={C.cherryText} strokeWidth={2.5} />
      {climb >= 1 && <circle cx={PX(xm)} cy={PY(ARRAY_LEVEL)} r={6} fill="none" stroke={C.caramel} strokeWidth={2} />}
      {climb >= 1 && <T x={PX(xm) + 4} y={PY(ARRAY_LEVEL) + 26} s={12} f={C.caramel}>measured</T>}
      <g opacity={pred}>
        <line x1={PX(xp)} y1={PY(0)} x2={PX(xp)} y2={PY(0.9)} stroke={C.latte} strokeDasharray="4 4" />
        <T x={PX(xp) + 6} y={PY(0.9)} s={12} f={C.latte}>predicted 5,233</T>
      </g>
      <T x={300} y={258} s={13} f={C.crema} a="middle" o={cap}>the same order of magnitude, not an exact match</T>
    </Svg>
  );
}

// 11 · KruskalAgainstPrim. Two bars on a sparse graph, Kruskal's sort short and Prim's array long; the graph fills in
// toward dense and Kruskal's bar stretches past the array's fixed one.
export function KruskalAgainstPrim({ t }: StepCtx) {
  const show = easeOut(seg(t, 0.2, 0.7));
  const dense = easeInOut(seg(t, 1.2, 2.8));
  const cap = easeOut(seg(t, 3.0, 3.4));
  const kr = lerp(60, 380, dense);
  return (
    <Svg label="Two cost bars on a sparse graph, Kruskal's sort short and Prim's array longer; as the graph fills in toward dense, Kruskal's bar stretches past the array's fixed one" h={230}>
      <T x={30} y={30} s={12} f={C.latte}>{dense < 0.5 ? 'sparse graph' : 'dense graph'}</T>
      <g opacity={show}>
        <T x={30} y={78} s={12} f={C.crema}>Kruskal: sort</T>
        <rect x={180} y={64} width={kr} height={20} fill={C.crema} />
        <T x={30} y={128} s={12} f={C.cinnamon}>Prim: array</T>
        <rect x={180} y={114} width={200} height={20} fill={C.cinnamon} />
      </g>
      <T x={300} y={190} s={13} f={dense < 0.5 ? C.crema : C.cinnamon} a="middle" o={dense < 0.3 ? show : cap}>{dense < 0.3 ? 'sparse: Kruskal stays competitive' : 'dense: the array wins'}</T>
    </Svg>
  );
}

// 12 · ImplementationFacts. Above, the array scan: a cursor runs along one straight row of memory. Below, the heap: the
// cursor hops between scattered tree positions. Then a complete graph's matrix fills in: the array's home.
export function ImplementationFacts({ t }: StepCtx) {
  const run = (t * 0.9) % 1;
  const hops: P[] = [[300, 140], [220, 170], [380, 170], [180, 200], [260, 200], [340, 200], [420, 200]];
  const hk = Math.floor(clamp((t - 0.3) / 0.35, 0, 6.99));
  const mat = easeOut(seg(t, 2.7, 3.4));
  return (
    <Svg label="Above, the array version's scan: a cursor runs along one straight row of memory. Below, the heap version: the cursor hops between scattered positions in a tree. Then a complete graph's matrix fills in, the array's natural home" h={270}>
      <T x={30} y={30} s={12} f={C.cinnamon}>array: one straight line</T>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={40 + i * 44} y={42} width={40} height={22} fill="none" stroke={C.line} />)}
      <rect x={40 + Math.floor(run * 12) * 44} y={42} width={40} height={22} fill={C.cinnamon} opacity={0.6} />
      <T x={30} y={118} s={12} f={C.cherryText} o={1 - mat}>heap: a hop per operation</T>
      <g opacity={1 - mat}>
        {hops.map((h, i) => <circle key={i} cx={h[0]} cy={h[1]} r={8} fill="none" stroke={C.line} />)}
        {[[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].map(([a, b]) => <line key={`${a}${b}`} x1={hops[a][0]} y1={hops[a][1]} x2={hops[b][0]} y2={hops[b][1]} stroke={C.line} />)}
        <circle cx={hops[[0, 3, 2, 4, 6, 1, 5][hk]][0]} cy={hops[[0, 3, 2, 4, 6, 1, 5][hk]][1]} r={8} fill={C.cherryText} />
      </g>
      <g opacity={mat}>
        {Array.from({ length: 36 }, (_, i) => <rect key={i} x={230 + (i % 6) * 24} y={110 + Math.floor(i / 6) * 20} width={20} height={16} fill={i % 7 === 0 ? C.band : C.cinnamon} opacity={clamp(mat * 36 - i * 0.6, 0, 1) * 0.7} />)}
        <T x={300} y={252} s={13} f={C.cinnamon} a="middle">a dense graph: the array's natural home</T>
      </g>
    </Svg>
  );
}

// 13 · Handoff. A ring cuts the graph and its lightest crossing edge lights: the lemma behind every tree here. Then
// the edges thicken into pipes, the ring's crossing pipes glow as a bottleneck: max flow, min cut, next.
export function Handoff({ t }: StepCtx) {
  const ring = easeOut(seg(t, 0.2, 0.8));
  const light = easeOut(seg(t, 0.9, 1.4));
  const pipes = easeInOut(seg(t, 1.8, 2.7));
  const cap = easeOut(seg(t, 3.0, 3.5));
  const S = new Set(['A', 'C']);
  return (
    <Svg label="A ring cuts the graph and its lightest crossing edge lights, the lemma behind every tree here. Then the edges thicken into pipes, and the pipes crossing the ring glow as a bottleneck: max flow, min cut, next" h={300}>
      <Graph labels={pipes < 0.5} style={(e) => {
        const crossing = S.has(e.u) !== S.has(e.v);
        if (pipes > 0) return { stroke: crossing ? C.caramel : C.latte, w: lerp(1.6, crossing ? 9 : 7, pipes) };
        if (e.k === 'CD1' && light > 0) return { stroke: C.caramel, w: 3.5, lf: C.caramel };
        return { stroke: crossing ? C.latte : C.taupe, w: crossing ? 1.8 : 1.4 };
      }} />
      <ellipse cx={150} cy={180} rx={105} ry={42} transform="rotate(35 150 180)" fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 4" opacity={ring} />
      {cap === 0 ? (
        <T x={300} y={282} s={13} f={C.caramel} a="middle" o={light}>any cut: its lightest crossing edge is safe</T>
      ) : (
        <T x={300} y={282} s={13} f={C.caramel} a="middle" o={cap}>edges as pipes, a cut as a bottleneck: next</T>
      )}
    </Svg>
  );
}
