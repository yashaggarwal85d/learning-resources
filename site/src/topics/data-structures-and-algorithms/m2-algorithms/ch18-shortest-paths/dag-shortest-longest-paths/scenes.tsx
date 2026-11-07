import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = a value at rest; latte = secondary labels (an edge weight, an order
// position); taupe = a vertex already passed; caramel = the thing to look at this beat (the vertex being relaxed, the
// path just found); cinnamon (rare) = the negated weights of the longest-path pass; cherryText = the bad outcome (a
// wrong order, a cycle). Every printed number is examples.py's: ADJ 0→1 3, 0→2 2, 1→3 4, 2→3 1, 2→4 5, 3→5 2, 4→5 6;
// shortest [0, 3, 2, 3, 7, 5] with path [0, 2, 3, 5]; the bad order [0, 1, 3, 5, 2, 4]; longest [0, 3, 2, 7, 7, 13]
// with path [0, 2, 4, 5]; the task graph's durations and its critical path start, design, build-frame, paint, ship,
// total 11. The passes run here by the same loops examples.py uses.

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

/** A directed edge from one point to another, trimmed by r0 at the start and r1 at the end, with its own arrowhead. */
function Arrow({ from, to, stroke = C.line, w = 1.5, p = 1, o = 1, dash, r0 = 15, r1 = 17 }: { from: P; to: P; stroke?: string; w?: number; p?: number; o?: number; dash?: string; r0?: number; r1?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const sx = x1 + ux * r0, sy = y1 + uy * r0;
  const ex = x2 - ux * r1, ey = y2 - uy * r1;
  const q = clamp(p, 0, 1);
  if (q <= 0) return null;
  const bx = lerp(sx, ex, q), by = lerp(sy, ey, q);
  return (
    <g opacity={o}>
      <line x1={sx} y1={sy} x2={bx} y2={by} stroke={stroke} strokeWidth={w} strokeDasharray={dash} />
      <path d={`M${bx} ${by} L${bx - ux * 8 - uy * 4.5} ${by - uy * 8 + ux * 4.5} L${bx - ux * 8 + uy * 4.5} ${by - uy * 8 - ux * 4.5} Z`} fill={stroke} />
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

const fmt = (d: number) => (d === Infinity ? '∞' : d === -Infinity ? '−∞' : d < 0 ? `−${-d}` : String(d));

// examples.py's ADJ.
const ADJ: [number, number][][] = [[[1, 3], [2, 2]], [[3, 4]], [[3, 1], [4, 5]], [[5, 2]], [[5, 6]], []];
const EDGES: [number, number, number][] = ADJ.flatMap((vs, u) => vs.map(([v, w]) => [u, v, w] as [number, number, number]));
const POS: P[] = [[60, 115], [180, 45], [180, 185], [320, 115], [340, 205], [500, 115]];
const DLAB = (v: number): P => (v === 2 || v === 4 ? [POS[v][0], POS[v][1] + 34] : [POS[v][0], POS[v][1] - 26]);
const WSIDE: Record<string, number> = { '0-1': -1, '0-2': 1, '1-3': -1, '2-3': -1, '2-4': 1, '3-5': -1, '4-5': 1 };

function Graph({ edgeStroke, vstroke, wlabel, extra }: { edgeStroke?: (u: number, v: number) => string | undefined; vstroke?: (v: number) => string; wlabel?: (w: number) => string; extra?: ReactNode }) {
  return (
    <g>
      {EDGES.map(([u, v, w]) => {
        const st = edgeStroke?.(u, v);
        const [x1, y1] = POS[u];
        const [x2, y2] = POS[v];
        const len = Math.hypot(x2 - x1, y2 - y1);
        const side = WSIDE[`${u}-${v}`];
        const nx = (-(y2 - y1) / len) * side, ny = ((x2 - x1) / len) * side;
        return (
          <g key={`${u}${v}`}>
            <Arrow from={POS[u]} to={POS[v]} stroke={st ?? C.line} w={st ? 2.5 : 1.4} />
            <T x={(x1 + x2) / 2 + nx * 12} y={(y1 + y2) / 2 + ny * 12 + 4} s={12} f={st ?? C.latte} a="middle">{wlabel ? wlabel(w) : String(w)}</T>
          </g>
        );
      })}
      {extra}
      {POS.map((p, v) => <Vertex key={v} at={p} label={String(v)} stroke={vstroke?.(v) ?? C.latte} />)}
    </g>
  );
}

type Visit = { u: number; dist: number[]; improved: number[] };
/** examples.py's dag_shortest_paths (or its wrong-order twin): each visit with the distances after it. */
function pass(order: number[], sign = 1) {
  const dist = Array(6).fill(Infinity) as number[];
  const pred: (number | null)[] = Array(6).fill(null);
  dist[0] = 0;
  const visits: Visit[] = [];
  for (const u of order) {
    const improved: number[] = [];
    if (dist[u] !== Infinity)
      for (const [v, w] of ADJ[u]) {
        if (dist[u] + sign * w < dist[v]) {
          dist[v] = dist[u] + sign * w;
          pred[v] = u;
          improved.push(v);
        }
      }
    visits.push({ u, dist: [...dist], improved });
  }
  return { visits, dist, pred };
}
const ORDER = [0, 1, 2, 3, 4, 5];
const BAD = [0, 1, 3, 5, 2, 4];
const SHORT = pass(ORDER);
const WRONG = pass(BAD);
const LONG = pass(ORDER, -1);
const pathTo = (pred: (number | null)[], v: number) => {
  const p = [v];
  while (p[p.length - 1] !== 0) p.push(pred[p[p.length - 1]] as number);
  return p.reverse();
};
const SHORT_PATH = pathTo(SHORT.pred, 5); // [0, 2, 3, 5]
const LONG_PATH = pathTo(LONG.pred, 5); // [0, 2, 4, 5]
const onPath = (path: number[], u: number, v: number) => path.some((x, i) => x === u && path[i + 1] === v);

// examples.py's task graph.
const TASKS = ['start', 'design', 'build-frame', 'wiring', 'paint', 'inspect', 'ship'];
const TADJ: [number, number][][] = [[[1, 0]], [[2, 4], [3, 3]], [[4, 6], [5, 2]], [[4, 2], [5, 5]], [[6, 1]], [[6, 3]], []];
const TEDGES: [number, number, number][] = TADJ.flatMap((vs, u) => vs.map(([v, w]) => [u, v, w] as [number, number, number]));
const TPOS: P[] = [[48, 120], [138, 120], [256, 52], [256, 188], [392, 52], [392, 188], [520, 120]];
const TW = (i: number) => 22 + TASKS[i].length * 8.6;
/** examples.py's dag_longest_paths on the task graph, in its topological order: finish times and predecessors. */
function taskPass() {
  const fin = Array(7).fill(-Infinity) as number[];
  const pred: (number | null)[] = Array(7).fill(null);
  fin[0] = 0;
  for (let u = 0; u < 7; u++)
    for (const [v, w] of TADJ[u])
      if (-(fin[u] + w) < -fin[v]) {
        fin[v] = fin[u] + w;
        pred[v] = u;
      }
  return { fin, pred };
}
const TASK = taskPass();
const CRIT: number[] = (() => {
  const p = [6];
  while (p[p.length - 1] !== 0) p.push(TASK.pred[p[p.length - 1]] as number);
  return p.reverse();
})(); // [0, 1, 2, 4, 6]

function TaskEdge({ u, v, w, stroke = C.line, wo = 1 }: { u: number; v: number; w: number; stroke?: string; wo?: number }) {
  const [x1, y1] = TPOS[u];
  const [x2, y2] = TPOS[v];
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  // Trim to the pill edges: horizontal half-width along x, 14 along y.
  const tr = (i: number) => Math.min(TW(i) / 2 / Math.max(Math.abs(dx / len), 0.01), 14 / Math.max(Math.abs(dy / len), 0.01)) + 2;
  const nx = -dy / len, ny = dx / len;
  // The two crossing edges keep their weights near their own start, clear of the crossing.
  const f = (u === 2 && v === 5) || (u === 3 && v === 4) ? 0.28 : 0.5;
  return (
    <g>
      <Arrow from={TPOS[u]} to={TPOS[v]} stroke={stroke} w={stroke === C.line ? 1.4 : 2.5} r0={tr(u)} r1={tr(v) + 2} />
      <T x={lerp(x1, x2, f) + nx * 11} y={lerp(y1, y2, f) + ny * 11 + 4} s={12} f={stroke === C.line ? C.latte : stroke} a="middle" o={wo}>{String(w)}</T>
    </g>
  );
}
function TaskPill({ i, stroke = C.latte, o = 1 }: { i: number; stroke?: string; o?: number }) {
  const [x, y] = TPOS[i];
  const w = TW(i);
  return (
    <g opacity={o}>
      <rect x={x - w / 2} y={y - 14} width={w} height={28} rx={14} fill={C.band} stroke={stroke} strokeWidth={stroke === C.latte ? 1.5 : 2.5} />
      <T x={x} y={y + 5} s={12} f={C.crema} a="middle">{TASKS[i]}</T>
    </g>
  );
}

// 1 · Opening. The project's tasks appear with how long each hand-off takes; then the one chain that can't be hurried
// lights from start to ship, and the project's best possible time appears: 11.
export function Opening({ t }: StepCtx) {
  const show = TASKS.map((_, i) => easeOut(seg(t, 0.2 + i * 0.12, 0.5 + i * 0.12)));
  const crit = clamp((t - 1.6) / 0.35, 0, CRIT.length - 1);
  const total = easeOut(seg(t, 3.1, 3.5));
  return (
    <Svg label="A project's seven tasks with the time each hand-off takes; then the one chain that can't be hurried lights from start through design, build-frame and paint to ship, and the project's best possible time appears: 11" h={270}>
      {TEDGES.map(([u, v, w]) => {
        const k = CRIT.indexOf(u);
        const on = k >= 0 && CRIT[k + 1] === v && crit >= k + 1;
        return <TaskEdge key={`${u}${v}`} u={u} v={v} w={w} stroke={on ? C.caramel : C.line} wo={Math.min(show[u], show[v])} />;
      })}
      {TASKS.map((_, i) => <TaskPill key={i} i={i} o={show[i]} stroke={CRIT.indexOf(i) >= 0 && CRIT.indexOf(i) <= crit && t > 1.6 ? C.caramel : C.latte} />)}
      {total === 0 ? (
        <T x={300} y={248} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.8, 1.3))}>some tasks wait on several others</T>
      ) : (
        <T x={300} y={248} s={14} f={C.caramel} a="middle" o={total}>{`fastest the whole project can finish: ${TASK.fin[6]}`}</T>
      )}
    </Svg>
  );
}

// 2 · PredictCycleRequired. The pass runs down the topological order 0 … 5, each vertex once. Then a single edge 5 → 1
// appears, dashed red: the order row now has an arrow pointing backwards. After answering: 1 was settled before 5,
// its own predecessor, was ever visited.
export function PredictCycleRequired({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const cur = clamp((t - 0.3) / 0.25, 0, 6);
  const back = easeOut(seg(t, 2.0, 2.5));
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const red = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const RX = (i: number) => 120 + i * 72;
  return (
    <Svg label="The pass runs down the topological order 0 to 5, each vertex once. Then one edge from 5 back to 1 appears, dashed red, and the order row gets an arrow pointing backwards. After answering: 1 was settled before 5, its own predecessor, was ever visited" h={300}>
      <Graph
        vstroke={(v) => (v === 1 && red > 0 ? C.cherryText : v < cur ? C.taupe : C.latte)}
        extra={<path d={`M${POS[5][0] - 4} ${POS[5][1] - 15} Q 380 -10 ${POS[1][0] + 16} ${POS[1][1] - 6}`} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={back * (answered ? 1 : pulse)} />}
      />
      {ORDER.map((v, i) => (
        <g key={v}>
          <rect x={RX(i) - 16} y={242} width={32} height={26} rx={4} fill={C.band} stroke={i < cur ? C.crema : C.line} />
          <T x={RX(i)} y={260} s={13} f={i < cur ? C.crema : C.taupe} a="middle">{String(v)}</T>
        </g>
      ))}
      <path d={`M${RX(5)} 270 Q ${(RX(5) + RX(1)) / 2} 300 ${RX(1) + 4} 271`} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={back} />
      {!answered && <T x={300} y={232} s={13} f={C.crema} a="middle" o={back}>one cycle: does the pass survive?</T>}
      {answered && <T x={300} y={232} s={13} f={C.cherryText} a="middle" o={red}>1 settled before 5, its predecessor, was seen</T>}
    </Svg>
  );
}

// 3 · TopoRelaxation. examples.py's pass in topological order 0, 1, 2, 3, 4, 5: each vertex, when reached, already has
// every incoming edge relaxed; its own out-edges flash and update. The distances end at 0, 3, 2, 3, 7, 5.
const VB = 0.5;
export function TopoRelaxation({ t }: StepCtx) {
  const k = clamp(Math.floor((t - 0.3) / VB), -1, 5);
  const p = k < 0 ? 0 : clamp((t - 0.3 - k * VB) / VB, 0, 1);
  const done = t > 0.3 + 6 * VB + 0.05;
  const cur = k >= 0 && !done ? SHORT.visits[k] : null;
  const dist = k < 0 ? [0, Infinity, Infinity, Infinity, Infinity, Infinity] : p > 0.4 || done ? SHORT.visits[k].dist : k > 0 ? SHORT.visits[k - 1].dist : [0, Infinity, Infinity, Infinity, Infinity, Infinity];
  const fresh = cur && p > 0.4 ? cur.improved : [];
  const cap = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="The pass in topological order 0 through 5: each vertex, when reached, already has every incoming edge relaxed, and its own out-edges flash and update. Distances end at 0, 3, 2, 3, 7, 5" h={280}>
      <Graph
        edgeStroke={(u, v) => (cur && cur.u === u ? (fresh.includes(v) ? C.caramel : C.crema) : k >= 0 && u < (cur ? cur.u : 6) ? C.mocha : undefined)}
        vstroke={(v) => (cur?.u === v ? C.caramel : k >= 0 && v < (cur ? cur.u : 6) ? C.taupe : C.latte)}
      />
      {POS.map((_, v) => {
        const [x, y] = DLAB(v);
        return <T key={v} x={x} y={y} s={13} f={fresh.includes(v) ? C.caramel : dist[v] === Infinity ? C.taupe : C.crema} a="middle">{fmt(dist[v])}</T>;
      })}
      <T x={300} y={262} s={13} f={C.caramel} a="middle" o={cap}>every incoming edge relaxed before it's reached</T>
    </Svg>
  );
}

// 4 · WhyOrderMatters. The same edges in the order 0, 1, 3, 5, 2, 4. 3 takes 7 through 1; 5 is visited next and
// locks 9; only then does 2 offer 3 the better 3, too late for 5. The pass ends with 9 at 5, against the right 5.
export function WhyOrderMatters({ t }: StepCtx) {
  const k = clamp(Math.floor((t - 0.3) / 0.45), -1, 5);
  const done = t > 0.3 + 6 * 0.45 + 0.05;
  const dist = k < 0 ? [0, Infinity, Infinity, Infinity, Infinity, Infinity] : WRONG.visits[k].dist;
  const cur = k >= 0 && !done ? WRONG.visits[k] : null;
  const cap = easeOut(seg(t, 3.1, 3.4));
  const RX = (i: number) => 120 + i * 72;
  return (
    <Svg label="The same edges relaxed in the order 0, 1, 3, 5, 2, 4. Vertex 3 takes 7 through 1; 5 is visited next and locks 9; only then does 2 offer 3 a better 3, too late for 5. The pass ends with 9 at 5, against the right answer 5" h={300}>
      <Graph
        edgeStroke={(u, v) => (cur && cur.u === u ? (cur.improved.includes(v) ? C.caramel : C.crema) : undefined)}
        vstroke={(v) => (v === 5 && done ? C.cherryText : cur?.u === v ? C.caramel : C.latte)}
      />
      {POS.map((_, v) => {
        const [x, y] = DLAB(v);
        const wrong = v === 5 && done;
        return <T key={v} x={x} y={y} s={13} f={wrong ? C.cherryText : cur?.improved.includes(v) ? C.caramel : dist[v] === Infinity ? C.taupe : C.crema} a="middle">{fmt(dist[v])}</T>;
      })}
      {BAD.map((v, i) => (
        <g key={v}>
          <rect x={RX(i) - 16} y={242} width={32} height={26} rx={4} fill={C.band} stroke={k === i && !done ? C.caramel : i <= k ? C.crema : C.line} />
          <T x={RX(i)} y={260} s={13} f={i <= k ? C.crema : C.taupe} a="middle">{String(v)}</T>
        </g>
      ))}
      <T x={300} y={290} s={13} f={C.cherryText} a="middle" o={cap}>{`5 ends at ${WRONG.dist[5]}: the right answer is ${SHORT.dist[5]}`}</T>
    </Svg>
  );
}

// 5 · PredictLongestPathGeneral. Every weight flips sign and the identical pass runs; the shortest of the negated
// weights is the longest of the originals: 0 → 2 → 4 → 5, 13. After answering: a small loop of positive weights
// flips to a negative cycle, and a dot circles it with no bottom to reach.
export function PredictLongestPathGeneral({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const flip = t > 0.8;
  const path = easeInOut(seg(t, 1.2, 2.2));
  const lab = easeOut(seg(t, 2.2, 2.6));
  const loop = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const neg = answered && s > 0.9;
  const spin = answered ? (s * 1.2) % 1 : 0;
  const L: P[] = [[460, 210], [530, 250], [400, 250]];
  const kk = Math.floor(spin * 3) % 3, ff = spin * 3 - Math.floor(spin * 3);
  const dot: P = [lerp(L[kk][0], L[(kk + 1) % 3][0], ff), lerp(L[kk][1], L[(kk + 1) % 3][1], ff)];
  const lit = Math.floor(path * (LONG_PATH.length - 1) + 0.001);
  return (
    <Svg label="Every weight flips sign and the same pass runs; the shortest of the negated weights is the longest of the originals, 0, 2, 4, 5, total 13. After answering: a small loop of positive weights flips to a negative cycle, and a dot circles it with no bottom" h={290}>
      <g opacity={answered ? 1 - loop : 1}>
        <Graph wlabel={(w) => (flip ? `−${w}` : String(w))} edgeStroke={(u, v) => (onPath(LONG_PATH, u, v) && LONG_PATH.indexOf(v) <= lit ? C.caramel : flip ? C.cinnamon : undefined)} />
        <T x={POS[5][0]} y={POS[5][1] - 26} s={13} f={C.caramel} a="middle" o={lab}>{String(-LONG.dist[5])}</T>
        <T x={30} y={30} s={12} f={C.cinnamon} o={flip ? 1 : 0}>every weight negated</T>
      </g>
      {!answered && <T x={300} y={262} s={13} f={C.crema} a="middle" o={lab}>longest: 0 → 2 → 4 → 5. On any graph?</T>}
      {answered && (
        <g opacity={loop}>
          {L.map((p, i) => <Arrow key={i} from={p} to={L[(i + 1) % 3]} stroke={neg ? C.cherryText : C.crema} r0={8} r1={10} />)}
          {L.map((p, i) => <circle key={`v${i}`} cx={p[0]} cy={p[1]} r={8} fill={C.band} stroke={neg ? C.cherryText : C.crema} strokeWidth={2} />)}
          {neg && <circle cx={dot[0]} cy={dot[1]} r={4} fill={C.caramel} />}
          <T x={380} y={200} s={13} f={neg ? C.cherryText : C.crema} a="end">{neg ? 'negated: a negative cycle' : 'a positive loop'}</T>
          <T x={300} y={282} s={13} f={C.cherryText} a="middle" o={neg ? 1 : 0}>only safe with no cycle at all</T>
        </g>
      )}
    </Svg>
  );
}

// 6 · CriticalPath. examples.py's longest-path pass over the task graph in its topological order: each task's
// earliest finish appears as it's reached (paint takes the larger 10 of its two inputs, ship 11). Then the critical
// path traces back from ship: paint, build-frame, design, start.
export function CriticalPath({ t }: StepCtx) {
  const fin = TASKS.map((_, i) => easeOut(seg(t, 0.3 + i * 0.32, 0.55 + i * 0.32)));
  const backK = clamp((t - 2.7) / 0.25, 0, CRIT.length - 1);
  const cap = easeOut(seg(t, 3.6, 3.95));
  const onCrit = (i: number) => {
    const k = CRIT.indexOf(i);
    return k >= 0 && CRIT.length - 1 - k <= backK && t > 2.7;
  };
  return (
    <Svg label="The longest-path pass over the task graph in order: each task's earliest finish appears as it is reached, paint taking the larger 10 of its two inputs and ship 11. Then the critical path traces back from ship through paint, build-frame and design to start" h={280}>
      {TEDGES.map(([u, v, w]) => <TaskEdge key={`${u}${v}`} u={u} v={v} w={w} stroke={onCrit(u) && onCrit(v) && CRIT[CRIT.indexOf(u) + 1] === v ? C.caramel : C.line} />)}
      {TASKS.map((_, i) => <TaskPill key={i} i={i} stroke={onCrit(i) ? C.caramel : fin[i] > 0.5 ? C.crema : C.latte} />)}
      {TASKS.map((_, i) => {
        const [x, y] = TPOS[i];
        const above = y < 120 || i === 0 || i === 1 || i === 6;
        return <T key={`f${i}`} x={x} y={above ? y - 22 : y + 32} s={13} f={onCrit(i) ? C.caramel : C.crema} a="middle" o={fin[i]}>{String(TASK.fin[i])}</T>;
      })}
      <T x={300} y={258} s={13} f={C.caramel} a="middle" o={cap}>{`${CRIT.map((i) => TASKS[i]).join(' → ')}: ${TASK.fin[6]}`}</T>
    </Svg>
  );
}

// 7 · Recap. The chapter's three costs, a priority queue, round after round, a reweighting step, each crossed out in
// turn; then the one pass in topological order stands alone, under the one demand it made: no cycles.
export function Recap({ t }: StepCtx) {
  const chips = ['a priority queue', 'round after round', 'a reweighting step'];
  const show = chips.map((_, i) => easeOut(seg(t, 0.2 + i * 0.3, 0.45 + i * 0.3)));
  const cross = chips.map((_, i) => easeOut(seg(t, 1.4 + i * 0.25, 1.65 + i * 0.25)));
  const one = easeOut(seg(t, 2.4, 2.9));
  const cap = easeOut(seg(t, 3.1, 3.5));
  return (
    <Svg label="The chapter's three costs, a priority queue, round after round, a reweighting step, each crossed out in turn; then one pass in topological order stands alone, under the one demand it made: no cycles" h={260}>
      {chips.map((c, i) => (
        <g key={c} opacity={show[i] * (1 - 0.6 * cross[i])}>
          <rect x={40 + i * 180} y={50} width={160} height={30} rx={15} fill="none" stroke={C.latte} />
          <T x={120 + i * 180} y={70} s={12} f={C.crema} a="middle">{c}</T>
          <line x1={50 + i * 180} y1={65} x2={50 + i * 180 + 140 * cross[i]} y2={65} stroke={C.cherryText} strokeWidth={2} />
        </g>
      ))}
      <g opacity={one}>
        <rect x={150} y={120} width={300} height={36} rx={18} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={143} s={13} f={C.caramel} a="middle">one pass, in topological order</T>
      </g>
      <T x={300} y={206} s={13} f={C.crema} a="middle" o={cap}>the cheapest, because it asked for no cycles</T>
    </Svg>
  );
}
