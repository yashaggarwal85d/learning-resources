import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = a vertex at rest; latte = secondary labels (an index, a low-link);
// taupe = a vertex already assigned to its group; caramel = the thing to look at this beat (the vertex being visited,
// the group just found); cinnamon (rare) = the reversed graph of Kosaraju's second pass; cherryText = the bad outcome
// (an unsatisfiable formula). Every printed number is examples.py's: SCC_ADJ 0→1→2→0, 2→3, 3→4→3, 4→5; the groups
// {0, 1, 2}, {3, 4}, {5} from both algorithms; the condensation {0,1,2} → {3,4} → {5}, acyclic; UNSAT_CLAUSES
// (x0 ∨ x0) ∧ (¬x0 ∨ ¬x0). Tarjan's indices and low-links, and Kosaraju's finish order, are traced here by the same
// loops examples.py runs.

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

/** A directed edge between two vertex centres, trimmed to the circles, with its own arrowhead; drawn in up to fraction p. */
function Arrow({ from, to, stroke = C.line, w = 1.5, p = 1, bend = 0, o = 1, dash }: { from: P; to: P; stroke?: string; w?: number; p?: number; bend?: number; o?: number; dash?: string }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const cx = (x1 + x2) / 2 + nx * bend, cy = (y1 + y2) / 2 + ny * bend;
  const t1x = cx - x1, t1y = cy - y1, l1 = Math.hypot(t1x, t1y) || 1;
  const t2x = x2 - cx, t2y = y2 - cy, l2 = Math.hypot(t2x, t2y) || 1;
  const sx = x1 + (t1x / l1) * 16, sy = y1 + (t1y / l1) * 16;
  const ex = x2 - (t2x / l2) * 18, ey = y2 - (t2y / l2) * 18;
  const q = clamp(p, 0, 1);
  if (q <= 0) return null;
  const bx = (1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * ex;
  const by = (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * ey;
  const tx = 2 * (1 - q) * (cx - sx) + 2 * q * (ex - cx), ty = 2 * (1 - q) * (cy - sy) + 2 * q * (ey - cy);
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl, uy = ty / tl;
  return (
    <g opacity={o}>
      <path d={`M${sx} ${sy} Q${lerp(sx, cx, q)} ${lerp(sy, cy, q)} ${bx} ${by}`} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} />
      <path d={`M${bx} ${by} L${bx - ux * 9 - uy * 5} ${by - uy * 9 + ux * 5} L${bx - ux * 9 + uy * 5} ${by - uy * 9 - ux * 5} Z`} fill={stroke} />
    </g>
  );
}

function Vertex({ at, label, stroke = C.latte, text = C.crema, w = 2, o = 1 }: { at: P; label: string; stroke?: string; text?: string; w?: number; o?: number }) {
  return (
    <g opacity={o}>
      <circle cx={at[0]} cy={at[1]} r={15} fill={C.band} stroke={stroke} strokeWidth={w} />
      <T x={at[0]} y={at[1] + 5} s={13} f={text} a="middle">{label}</T>
    </g>
  );
}

// examples.py's SCC_ADJ.
const ADJ: Record<number, number[]> = { 0: [1], 1: [2], 2: [0, 3], 3: [4], 4: [3, 5], 5: [] };
const POS: Record<number, P> = { 0: [70, 50], 1: [180, 50], 2: [125, 135], 3: [250, 135], 4: [370, 135], 5: [490, 135] };
const EDGES: [number, number][] = [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 3], [4, 5]];
const bendOf = (u: number, v: number) => ((u === 3 && v === 4) || (u === 4 && v === 3) ? -16 : 0);
const GROUPS = [[0, 1, 2], [3, 4], [5]];
/** Each group's ring: centre and radii around its members. */
const RING: { cx: number; cy: number; rx: number; ry: number }[] = [
  { cx: 125, cy: 82, rx: 92, ry: 78 },
  { cx: 310, cy: 135, rx: 98, ry: 34 },
  { cx: 490, cy: 135, rx: 30, ry: 30 },
];
const groupOf = (v: number) => GROUPS.findIndex((g) => g.includes(v));

function Graph({ stroke = (_u: number, _v: number) => C.line as string, vstroke = (_v: number) => C.latte as string, reversed = 0 }: { stroke?: (u: number, v: number) => string; vstroke?: (v: number) => string; reversed?: number }) {
  return (
    <g>
      {EDGES.map(([u, v]) => {
        const st = stroke(u, v);
        if (reversed <= 0) return <Arrow key={`${u}${v}`} from={POS[u]} to={POS[v]} stroke={st} bend={bendOf(u, v)} />;
        // Flip: the forward arrow retracts, then the reversed one grows.
        const out = 1 - clamp(reversed * 2, 0, 1);
        const back = clamp(reversed * 2 - 1, 0, 1);
        return (
          <g key={`${u}${v}`}>
            <Arrow from={POS[u]} to={POS[v]} stroke={st} bend={bendOf(u, v)} p={out} />
            <Arrow from={POS[v]} to={POS[u]} stroke={C.cinnamon} bend={-bendOf(u, v)} p={back} />
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5].map((v) => <Vertex key={v} at={POS[v]} label={String(v)} stroke={vstroke(v)} />)}
    </g>
  );
}

function Ring({ g, o = 1, scale = 1, stroke = C.caramel }: { g: number; o?: number; scale?: number; stroke?: string }) {
  const r = RING[g];
  return <ellipse cx={r.cx} cy={r.cy} rx={r.rx * scale} ry={r.ry * scale} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="6 4" opacity={o} />;
}

// The condensation: each group a pill at its ring's centre.
const PILL: P[] = [[125, 90], [310, 135], [490, 135]];
const PILL_LABEL = ['{0,1,2}', '{3,4}', '{5}'];
function Pill({ g, o = 1, stroke = C.caramel }: { g: number; o?: number; stroke?: string }) {
  const [x, y] = PILL[g];
  const w = 18 + PILL_LABEL[g].length * 9;
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 15} width={w} height={30} rx={15} fill={C.band} stroke={stroke} strokeWidth={2} />
      <T x={x} y={y + 5} s={13} f={C.crema} a="middle">{PILL_LABEL[g]}</T>
    </g>
  );
}
function PillArrow({ a, b, p = 1, stroke = C.crema }: { a: number; b: number; p?: number; stroke?: string }) {
  const wa = (18 + PILL_LABEL[a].length * 9) / 2, wb = (18 + PILL_LABEL[b].length * 9) / 2;
  const [x1, y1] = PILL[a];
  const [x2, y2] = PILL[b];
  const sx = x1 + wa + 2, ex = x2 - wb - 4;
  const ex2 = lerp(sx, ex, clamp(p, 0, 1));
  const ey2 = lerp(y1, y2, clamp(p, 0, 1));
  return p > 0 ? (
    <g>
      <line x1={sx} y1={y1} x2={ex2} y2={ey2} stroke={stroke} strokeWidth={1.8} />
      <path d={`M${ex2} ${ey2} l-9 -5 l0 10 z`} fill={stroke} transform={`rotate(${(Math.atan2(y2 - y1, ex - sx) * 180) / Math.PI} ${ex2} ${ey2})`} />
    </g>
  ) : null;
}

// 1 · Opening. Two graphs that look alike from a distance: on the left every vertex reaches every other (one ring
// closes around all of it); on the right only pockets do (three rings).
export function Opening({ t }: StepCtx) {
  const show = easeOut(seg(t, 0.2, 0.8));
  const left = easeOut(seg(t, 1.0, 1.6));
  const right = [0, 1, 2].map((g) => easeOut(seg(t, 1.6 + g * 0.3, 2.0 + g * 0.3)));
  const cap = easeOut(seg(t, 2.7, 3.2));
  // A strongly connected copy: the same six vertices with 5 → 0 added (drawn at 0.42 scale on the left).
  const sc = 0.42;
  const L = (v: number): P => [10 + POS[v][0] * sc, 70 + POS[v][1] * sc];
  const R = (v: number): P => [300 + POS[v][0] * sc, 70 + POS[v][1] * sc];
  const small = (pos: (v: number) => P, extra: [number, number][]) => (
    <g opacity={show}>
      {[...EDGES, ...extra].map(([u, v]) => {
        const [x1, y1] = pos(u);
        const [x2, y2] = pos(v);
        return <line key={`${u}${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.line} strokeWidth={1.3} />;
      })}
      {[0, 1, 2, 3, 4, 5].map((v) => {
        const [x, y] = pos(v);
        return <circle key={v} cx={x} cy={y} r={6} fill={C.crema} />;
      })}
    </g>
  );
  return (
    <Svg label="Two graphs that look alike from a distance. On the left every vertex reaches every other, and one ring closes around all of it; on the right only pockets do, and three rings close" h={260}>
      {small(L, [[5, 0]])}
      {small(R, [])}
      <ellipse cx={10 + 280 * sc} cy={70 + 92 * sc} rx={112} ry={36} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 4" opacity={left} />
      {RING.map((r, g) => (
        <ellipse key={g} cx={300 + r.cx * sc} cy={70 + r.cy * sc} rx={r.rx * sc + 6} ry={r.ry * sc + 6} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="5 3" opacity={right[g]} />
      ))}
      <T x={140} y={160} s={12} f={C.latte} a="middle" o={left}>all reach all</T>
      <T x={420} y={160} s={12} f={C.latte} a="middle" o={right[2]}>three pockets</T>
      <T x={300} y={222} s={13} f={C.caramel} a="middle" o={cap}>one more depth-first search tells them apart</T>
    </Svg>
  );
}

// 2 · PredictCondensation. The graph with its three groups ringed and breathing. After answering: each group shrinks
// to one pill, and what's left is {0,1,2} → {3,4} → {5}: no cycle.
export function PredictCondensation({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const breathe = 1 + 0.04 * Math.sin(t * 4);
  const rings = easeOut(seg(t, 0.2, 0.9));
  const shrink = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const arrows = answered ? easeOut(seg(s, 0.9, 1.4)) : 0;
  return (
    <Svg label="The six-vertex graph with its three mutually reachable groups ringed. After answering: each group shrinks to one point, leaving 0 1 2, then 3 4, then 5 in a line, with no cycle" h={250}>
      <g opacity={1 - shrink}>
        <Graph />
        {[0, 1, 2].map((g) => <Ring key={g} g={g} o={rings} scale={breathe} />)}
      </g>
      {answered && [0, 1, 2].map((g) => <Pill key={g} g={g} o={shrink} />)}
      {answered && (
        <>
          <PillArrow a={0} b={1} p={arrows} />
          <PillArrow a={1} b={2} p={arrows} />
        </>
      )}
      {!answered && <T x={300} y={222} s={13} f={C.crema} a="middle">shrink each ring to a point: any cycle left?</T>}
      {answered && <T x={300} y={222} s={14} f={C.caramel} a="middle" o={arrows}>always a DAG: a cycle would merge them</T>}
    </Svg>
  );
}

type TEv = { kind: 'visit'; v: number; idx: number } | { kind: 'low'; v: number; low: number } | { kind: 'pop'; comp: number[] };
/** examples.py's tarjan_scc on SCC_ADJ, recording each visit, each low-link change and each pop. */
function tarjanTrace() {
  const index: (number | null)[] = Array(6).fill(null);
  const low: number[] = Array(6).fill(0);
  const onStack = Array(6).fill(false);
  const stack: number[] = [];
  const ev: TEv[] = [];
  let counter = 0;
  const strong = (v: number) => {
    index[v] = counter;
    low[v] = counter;
    ev.push({ kind: 'visit', v, idx: counter });
    counter++;
    stack.push(v);
    onStack[v] = true;
    for (const w of ADJ[v]) {
      if (index[w] === null) {
        strong(w);
        if (low[w] < low[v]) {
          low[v] = low[w];
          ev.push({ kind: 'low', v, low: low[v] });
        }
      } else if (onStack[w] && (index[w] as number) < low[v]) {
        low[v] = index[w] as number;
        ev.push({ kind: 'low', v, low: low[v] });
      }
    }
    if (low[v] === index[v]) {
      const comp: number[] = [];
      for (;;) {
        const w = stack.pop()!;
        onStack[w] = false;
        comp.push(w);
        if (w === v) break;
      }
      ev.push({ kind: 'pop', comp });
    }
  };
  for (let v = 0; v < 6; v++) if (index[v] === null) strong(v);
  return ev;
}
const TARJAN = tarjanTrace();

// 3 · TarjanMechanism. One depth-first search; each vertex carries index/low-link. 2 sees 0 still on the stack and its
// low drops to 0; 4 sees 3 and drops to 3. 5 pops alone, then 3 and 4 together, then 0, 1, 2: each group the moment a
// vertex's low equals its own index.
const TB = 0.3;
export function TarjanMechanism({ t }: StepCtx) {
  const n = clamp((t - 0.3) / TB, 0, TARJAN.length);
  const k = Math.floor(n);
  const p = n - k;
  const idx: Record<number, number> = {};
  const low: Record<number, number> = {};
  const stack: number[] = [];
  const found: number[][] = [];
  let lastLow = -1;
  TARJAN.slice(0, k).forEach((e, i) => {
    if (e.kind === 'visit') {
      idx[e.v] = e.idx;
      low[e.v] = e.idx;
      stack.push(e.v);
    } else if (e.kind === 'low') {
      low[e.v] = e.low;
      if (i === k - 1) lastLow = e.v;
    } else {
      e.comp.forEach(() => stack.pop());
      found.push(e.comp);
    }
  });
  const cur = k > 0 && TARJAN[k - 1].kind === 'visit' ? (TARJAN[k - 1] as { v: number }).v : -1;
  const justPopped = k > 0 && TARJAN[k - 1].kind === 'pop' ? (TARJAN[k - 1] as { comp: number[] }).comp : null;
  const cap = easeOut(seg(t, 4.0, 4.4));
  return (
    <Svg label="Tarjan's single depth-first search. Each vertex shows its index and low-link; 2 sees 0 still on the stack and its low drops to 0, 4 sees 3 and drops to 3. 5 pops alone, then 3 and 4 together, then 0, 1 and 2" h={300}>
      <Graph
        stroke={(u, v) => (idx[u] !== undefined && idx[v] !== undefined ? C.crema : C.line)}
        vstroke={(v) => (found.some((c) => c.includes(v)) ? C.taupe : v === cur || v === lastLow ? C.caramel : idx[v] !== undefined ? C.crema : C.mocha)}
      />
      {found.map((c) => {
        const g = groupOf(c[0]);
        const fresh = justPopped === c;
        return <Ring key={g} g={g} o={fresh ? easeOut(clamp(p * 2, 0, 1)) : 1} />;
      })}
      {Object.keys(idx).map(Number).map((v) => {
        const [x, y] = POS[v];
        const ly = y < 100 ? y - 24 : y + 34;
        return (
          <T key={v} x={x} y={ly} s={12} f={v === lastLow ? C.caramel : C.latte} a="middle">{`${idx[v]}/${low[v]}`}</T>
        );
      })}
      <T x={30} y={222} s={12} f={C.latte}>stack</T>
      {stack.map((v, i) => (
        <g key={v}>
          <rect x={90 + i * 42} y={204} width={34} height={26} rx={4} fill={C.band} stroke={C.crema} />
          <T x={107 + i * 42} y={222} s={13} f={C.crema} a="middle">{String(v)}</T>
        </g>
      ))}
      <T x={430} y={222} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.6))}>index/low-link</T>
      <T x={300} y={280} s={13} f={C.caramel} a="middle" o={cap}>low catches its own index: pop a group</T>
    </Svg>
  );
}

/** examples.py's kosaraju_scc first pass on SCC_ADJ: the finish order. */
function finishOrder() {
  const seen = Array(6).fill(false);
  const out: number[] = [];
  const visit = (u: number) => {
    seen[u] = true;
    for (const v of ADJ[u]) if (!seen[v]) visit(v);
    out.push(u);
  };
  for (let s = 0; s < 6; s++) if (!seen[s]) visit(s);
  return out;
}
const FINISH = finishOrder(); // [5, 4, 3, 2, 1, 0]

// 4 · KosarajuMechanism. Pass one records the finish order 5, 4, 3, 2, 1, 0. Every edge flips. Pass two starts from
// the last to finish, 0, and on the reversed graph reaches exactly {0, 1, 2}; then 3 reaches {3, 4}; then 5 alone.
export function KosarajuMechanism({ t }: StepCtx) {
  const fin = FINISH.map((_, i) => easeOut(seg(t, 0.3 + i * 0.15, 0.5 + i * 0.15)));
  const flip = easeInOut(seg(t, 1.5, 2.2));
  const trees = [0, 1, 2].map((g) => easeOut(seg(t, 2.3 + g * 0.4, 2.7 + g * 0.4)));
  const cap = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="Kosaraju's algorithm. Pass one records the finish order 5, 4, 3, 2, 1, 0. Every edge flips. Pass two, from the last to finish, reaches exactly 0, 1 and 2 on the reversed graph, then 3 and 4, then 5 alone" h={300}>
      <Graph reversed={flip} vstroke={(v) => (trees[groupOf(v)] > 0.5 ? C.caramel : C.latte)} />
      {[0, 1, 2].map((g) => <Ring key={g} g={g} o={trees[g]} />)}
      <T x={30} y={222} s={12} f={C.latte}>finished</T>
      {FINISH.map((v, i) => (
        <Vertex key={v} at={[150 + i * 46, lerp(196, 217, fin[i])]} label={String(v)} o={fin[i]} stroke={i === FINISH.length - 1 && flip > 0 ? C.caramel : C.crema} />
      ))}
      <T x={430} y={30} s={12} f={C.cinnamon} o={flip}>every edge reversed</T>
      <T x={300} y={280} s={13} f={C.latte} a="middle" o={cap}>two passes and a reversed copy, against one</T>
    </Svg>
  );
}

// 5 · CondensationGraph. The three groups ring, then each collapses into a single pill; arrows {0,1,2} → {3,4} → {5}.
// A dot runs the earlier cycle test over it and finds no back edge: acyclic.
export function CondensationGraph({ t }: StepCtx) {
  const rings = easeOut(seg(t, 0.2, 0.8));
  const shrink = easeInOut(seg(t, 0.9, 1.8));
  const arrows = easeOut(seg(t, 1.8, 2.3));
  const scan = easeInOut(seg(t, 2.4, 3.3));
  const cap = easeOut(seg(t, 3.3, 3.7));
  const sx = scan < 0.5 ? lerp(PILL[0][0], PILL[1][0], scan * 2) : lerp(PILL[1][0], PILL[2][0], scan * 2 - 1);
  const sy = scan < 0.5 ? lerp(PILL[0][1], PILL[1][1], scan * 2) : PILL[1][1];
  return (
    <Svg label="The three groups ring, then each collapses into one point; arrows run 0 1 2 to 3 4 to 5. A dot runs the earlier cycle test along them and finds no back edge: acyclic" h={260}>
      <g opacity={1 - shrink}>
        <Graph />
        {[0, 1, 2].map((g) => <Ring key={g} g={g} o={rings} />)}
      </g>
      {[0, 1, 2].map((g) => <Pill key={g} g={g} o={shrink} stroke={scan > (g === 0 ? 0 : g === 1 ? 0.5 : 0.99) ? C.caramel : C.latte} />)}
      <PillArrow a={0} b={1} p={arrows} />
      <PillArrow a={1} b={2} p={arrows} />
      {scan > 0 && scan < 1 && <circle cx={sx} cy={sy - 24} r={5} fill={C.caramel} />}
      <T x={300} y={222} s={13} f={C.caramel} a="middle" o={cap}>the cycle test, run on it: no back edge</T>
    </Svg>
  );
}

// 6 · TwoSAT. examples.py's UNSAT_CLAUSES: (x0 ∨ x0) and (¬x0 ∨ ¬x0). Each clause becomes its implication: ¬x0 → x0,
// and x0 → ¬x0. A ring closes around both literals and pulses. After answering: the ring turns red, unsatisfiable.
export function TwoSAT({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const c1 = easeOut(seg(t, 0.2, 0.6));
  const i1 = easeInOut(seg(t, 0.6, 1.1));
  const i2 = easeInOut(seg(t, 1.1, 1.6));
  const ring = easeOut(seg(t, 1.6, 2.0));
  const pulse = 1 + 0.05 * Math.sin(t * 5);
  const red = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const A: P = [220, 120];
  const B: P = [380, 120];
  return (
    <Svg label="Two clauses, x0 or x0, and not x0 or not x0. Each becomes an implication: not x0 implies x0, and x0 implies not x0. A ring closes around both literals. After answering: it turns red, unsatisfiable" h={250}>
      <T x={300} y={30} s={13} f={C.crema} a="middle" o={c1}>(x0 ∨ x0) ∧ (¬x0 ∨ ¬x0)</T>
      <Arrow from={B} to={A} stroke={C.crema} w={2} bend={-30} p={i1} />
      <Arrow from={A} to={B} stroke={C.crema} w={2} bend={-30} p={i2} />
      <g>
        <circle cx={A[0]} cy={A[1]} r={22} fill={C.band} stroke={C.latte} strokeWidth={2} />
        <T x={A[0]} y={A[1] + 5} s={13} f={C.crema} a="middle">x0</T>
        <circle cx={B[0]} cy={B[1]} r={22} fill={C.band} stroke={C.latte} strokeWidth={2} />
        <T x={B[0]} y={B[1] + 5} s={13} f={C.crema} a="middle">¬x0</T>
      </g>
      <T x={300} y={58} s={12} f={C.latte} a="middle" o={i1}>¬x0 → x0</T>
      <T x={300} y={192} s={12} f={C.latte} a="middle" o={i2}>x0 → ¬x0</T>
      <ellipse cx={300} cy={120} rx={130 * (answered ? 1 : pulse)} ry={44 * (answered ? 1 : pulse)} fill="none" stroke={red > 0 ? C.cherryText : C.caramel} strokeWidth={1.8} strokeDasharray="6 4" opacity={ring} />
      {!answered && <T x={300} y={224} s={13} f={C.crema} a="middle" o={ring}>a literal and its opposite, one group</T>}
      {answered && <T x={300} y={224} s={14} f={C.cherryText} a="middle" o={red}>unsatisfiable, whatever else is there</T>}
    </Svg>
  );
}

// 7 · Recap. The last chapter's three chips (a key, a boundary, a rank) give way to this chapter's graph with its
// groups ringed: what reaches what, one pass each. Then every edge gains a cost tag and a route lights from 0 to 5:
// the cheapest way through, next.
const ROUTE = [0, 1, 2, 3, 4, 5];
export function Recap({ t }: StepCtx) {
  const chips = easeOut(seg(t, 0.2, 0.7));
  const swap = easeInOut(seg(t, 1.0, 1.5));
  const rings = easeOut(seg(t, 1.5, 2.0));
  const costs = easeOut(seg(t, 2.3, 2.8));
  const route = easeInOut(seg(t, 2.8, 3.6));
  const ringFade = 1 - easeOut(seg(t, 2.2, 2.6));
  const rk = route * (ROUTE.length - 1);
  return (
    <Svg label="The last chapter's three questions, a key, a boundary, a rank, give way to this graph with its groups ringed. Then every edge gets a cost tag and a route lights from 0 to 5, the cheapest way through, next" h={270}>
      <g opacity={chips * (1 - swap)}>
        {['a key', 'a boundary', 'a rank'].map((c, i) => (
          <g key={c}>
            <rect x={70 + i * 160} y={90} width={140} height={32} rx={16} fill="none" stroke={C.latte} />
            <T x={140 + i * 160} y={111} s={13} f={C.crema} a="middle">{c}</T>
          </g>
        ))}
      </g>
      <g opacity={swap}>
        <Graph stroke={() => C.line} vstroke={(v) => (route > 0 && ROUTE.indexOf(v) <= rk + 0.01 ? C.caramel : C.latte)} />
        {[0, 1, 2].map((g) => <Ring key={g} g={g} o={rings * ringFade} />)}
        {EDGES.map(([u, v]) => {
          const [x1, y1] = POS[u];
          const [x2, y2] = POS[v];
          const off = bendOf(u, v) !== 0 ? (u === 3 ? -12 : 12) : 0;
          return <rect key={`c${u}${v}`} x={(x1 + x2) / 2 - 5} y={(y1 + y2) / 2 - 5 + off} width={10} height={10} fill={C.band} stroke={C.cinnamon} opacity={costs} />;
        })}
        {ROUTE.slice(1).map((v, i) => {
          const f = clamp(rk - i, 0, 1);
          const [x1, y1] = POS[ROUTE[i]];
          const [x2, y2] = POS[v];
          return f > 0 ? <line key={v} x1={x1} y1={y1} x2={lerp(x1, x2, f)} y2={lerp(y1, y2, f)} stroke={C.caramel} strokeWidth={3} opacity={0.8} /> : null;
        })}
      </g>
      {costs === 0 ? (
        <T x={300} y={232} s={13} f={C.latte} a="middle" o={rings}>what reaches what: one pass each</T>
      ) : (
        <T x={300} y={232} s={13} f={C.caramel} a="middle" o={costs}>a cost on every edge: the cheapest way, next</T>
      )}
    </Svg>
  );
}
