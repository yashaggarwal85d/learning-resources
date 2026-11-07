import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = a value at rest; latte = secondary labels (an edge weight, a row or
// column index); taupe = a cell the current waypoint can't improve; caramel = the thing to look at this beat (the
// waypoint, the cell just improved, the route just found); cinnamon (rare) = the second table beside the first
// (predecessors, reachability); cherryText = the costlier route. Every printed number is examples.py's: the
// five-vertex WEIGHTED_EDGES (0→1 3, 0→2 8, 0→4 −4, 1→3 1, 1→4 7, 2→1 4, 3→0 2, 3→2 −5, 4→3 6); its distance table,
// whose row 0 is [0, 1, −3, 2, −4]; the path 0 → 4 → 3 → 2 of weight −3 against the direct 8. The table fills here by
// the same triple loop examples.py runs; Johnson's reweighting is drawn as h(u) − h(v), not printed.

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

/** A directed edge between two vertex centres, trimmed to the circles, with its own arrowhead. */
function Arrow({ from, to, stroke = C.line, w = 1.5, p = 1, o = 1, dash, r = 14 }: { from: P; to: P; stroke?: string; w?: number; p?: number; o?: number; dash?: string; r?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const sx = x1 + ux * (r + 1), sy = y1 + uy * (r + 1);
  const ex = x2 - ux * (r + 3), ey = y2 - uy * (r + 3);
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
      <circle cx={at[0]} cy={at[1]} r={14} fill={C.band} stroke={stroke} strokeWidth={w} />
      <T x={at[0]} y={at[1] + 5} s={13} f={text} a="middle">{label}</T>
    </g>
  );
}

const N = 5;
// examples.py's WEIGHTED_EDGES.
const EDGES: [number, number, number][] = [[0, 1, 3], [0, 2, 8], [0, 4, -4], [1, 3, 1], [1, 4, 7], [2, 1, 4], [3, 0, 2], [3, 2, -5], [4, 3, 6]];
const POS: Record<number, P> = { 0: [50, 105], 1: [150, 35], 2: [262, 105], 3: [210, 190], 4: [92, 190] };
/** Where each edge's weight sits: a fraction along the edge and a side offset, picked so no two labels collide. */
const WL: Record<string, [number, number]> = {
  '0-1': [0.45, -12], '0-2': [0.8, 10], '0-4': [0.5, -12], '1-3': [0.55, 11], '1-4': [0.55, -11],
  '2-1': [0.5, -12], '3-0': [0.3, -11], '3-2': [0.5, 12], '4-3': [0.5, 13],
};
const fmt = (d: number) => (d === Infinity ? '∞' : d < 0 ? `−${-d}` : String(d));

function Graph({ edgeStroke, vstroke, wo = 1 }: { edgeStroke?: (u: number, v: number) => string | undefined; vstroke?: (v: number) => string; wo?: number }) {
  return (
    <g>
      {EDGES.map(([u, v, w]) => {
        const st = edgeStroke?.(u, v);
        const [x1, y1] = POS[u];
        const [x2, y2] = POS[v];
        const [f, off] = WL[`${u}-${v}`];
        const len = Math.hypot(x2 - x1, y2 - y1);
        const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
        return (
          <g key={`${u}${v}`}>
            <Arrow from={POS[u]} to={POS[v]} stroke={st ?? C.line} w={st ? 2.5 : 1.3} />
            <T x={lerp(x1, x2, f) + nx * off} y={lerp(y1, y2, f) + ny * off + 4} s={12} f={st ?? C.latte} a="middle" o={wo}>{fmt(w)}</T>
          </g>
        );
      })}
      {[0, 1, 2, 3, 4].map((v) => <Vertex key={v} at={POS[v]} label={String(v)} stroke={vstroke?.(v) ?? C.latte} />)}
    </g>
  );
}

type Upd = { k: number; i: number; j: number; d: number; pred: number };
/** examples.py's floyd_warshall: the initial tables and every improvement, in loop order. */
function fw() {
  const dist = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 0 : Infinity)));
  const pred: (number | null)[][] = Array.from({ length: N }, () => Array(N).fill(null));
  EDGES.forEach(([u, v, w]) => {
    if (w < dist[u][v]) {
      dist[u][v] = w;
      pred[u][v] = u;
    }
  });
  const init = dist.map((r) => [...r]);
  const ups: Upd[] = [];
  for (let k = 0; k < N; k++)
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
          pred[i][j] = pred[k][j];
          ups.push({ k, i, j, d: dist[i][j], pred: pred[i][j] as number });
        }
  return { init, ups, dist, pred };
}
const FW = fw();

/** The reachability version, examples.py's transitive_closure: initial flags and every cell turned on, per waypoint. */
function closure() {
  const reach = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => i === j));
  EDGES.forEach(([u, v]) => (reach[u][v] = true));
  const init = reach.map((r) => [...r]);
  const ups: { k: number; i: number; j: number }[] = [];
  for (let k = 0; k < N; k++)
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        if (reach[i][k] && reach[k][j] && !reach[i][j]) {
          reach[i][j] = true;
          ups.push({ k, i, j });
        }
  return { init, ups };
}
const TC = closure();

const TX = (j: number) => 352 + j * 46;
const TY = (i: number) => 52 + i * 30;
function TableFrame({ o = 1 }: { o?: number }) {
  return (
    <g opacity={o}>
      {[0, 1, 2, 3, 4].map((j) => <T key={`c${j}`} x={TX(j)} y={26} s={12} f={C.latte} a="middle">{String(j)}</T>)}
      {[0, 1, 2, 3, 4].map((i) => <T key={`r${i}`} x={318} y={TY(i) + 5} s={12} f={C.latte} a="end">{String(i)}</T>)}
    </g>
  );
}

// 1 · Opening. Five cities and the table of every pair's fastest route. First the table lights by waypoint, every pair
// at once; then it refills one source row at a time, the single-source run from each city in turn.
export function Opening({ t }: StepCtx) {
  const show = easeOut(seg(t, 0.2, 0.7));
  const wave = clamp((t - 0.9) / 0.3, 0, 5);
  const rows = clamp((t - 2.6) / 0.25, 0, 5);
  const a = easeOut(seg(t, 0.9, 1.3));
  const b = easeOut(seg(t, 2.5, 2.9));
  const k = Math.floor(wave);
  return (
    <Svg label="Five cities and a five by five table of every pair's fastest route. First the table lights waypoint by waypoint, every pair at once; then it refills one source row at a time, a single-source run from each city" h={290}>
      <g opacity={show}>
        <Graph vstroke={(v) => (wave > 0 && wave < 5 && v === k ? C.caramel : rows > 0 && Math.floor(rows) === v && rows < 5 ? C.cinnamon : C.latte)} />
        <TableFrame />
        {[0, 1, 2, 3, 4].map((i) =>
          [0, 1, 2, 3, 4].map((j) => {
            const phase1 = rows === 0 && wave > 0 && wave < 5 && (i === k || j === k);
            const lit = rows > 0 ? (i < rows ? 1 : 0.15) : wave >= 5 ? 1 : wave > 0 ? 0.35 : 0.15;
            return <rect key={`${i}${j}`} x={TX(j) - 20} y={TY(i) - 12} width={40} height={24} rx={3} fill={phase1 ? C.caramel : rows > 0 && Math.floor(rows) === i ? C.cinnamon : C.mocha} opacity={phase1 ? 0.8 : lit} />;
          }),
        )}
      </g>
      {rows === 0 ? (
        <T x={300} y={258} s={13} f={C.caramel} a="middle" o={a}>one table, every waypoint, every pair at once</T>
      ) : (
        <T x={300} y={258} s={13} f={C.cinnamon} a="middle" o={b}>or one single-source run per city</T>
      )}
    </Svg>
  );
}

// 2 · PredictSparse. Two cost bars beside a map whose roads thin out: the table's cost stays fixed (it depends on the
// cities alone), the per-city runs' cost tracks the roads. After answering: the roads thin and that bar falls below.
const DOTS: P[] = Array.from({ length: 12 }, (_, i) => [50 + (i % 4) * 60 + ((i * 7) % 3) * 8, 50 + Math.floor(i / 4) * 60 + ((i * 5) % 4) * 6]);
const ROADS: [number, number][] = Array.from({ length: 12 }, (_, i) => [i, (i + 1) % 12] as [number, number])
  .concat(Array.from({ length: 12 }, (_, i) => [i, (i + 5) % 12] as [number, number]))
  .concat(Array.from({ length: 12 }, (_, i) => [i, (i + 3) % 12] as [number, number]));
export function PredictSparse({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const bars = easeOut(seg(t, 0.4, 1.1));
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const thin = answered ? easeInOut(seg(s, 0.2, 1.2)) : 0;
  const roads = Math.round(lerp(ROADS.length, 12, thin));
  const runBar = lerp(220, 70, thin);
  const cap = answered ? easeOut(seg(s, 1.2, 1.6)) : 0;
  return (
    <Svg label="A map of twelve cities with many roads, and two cost bars: the waypoint table's, fixed by the city count, and the per-city runs', which tracks the roads. After answering: the roads thin out and that bar falls well below the fixed one" h={280}>
      {ROADS.slice(0, roads).map(([a, b], i) => (
        <line key={i} x1={DOTS[a][0]} y1={DOTS[a][1]} x2={DOTS[b][0]} y2={DOTS[b][1]} stroke={C.line} strokeWidth={1.2} />
      ))}
      {DOTS.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={5} fill={C.crema} />)}
      <T x={320} y={60} s={12} f={C.latte}>waypoint table: cities only</T>
      <rect x={320} y={70} width={200 * bars} height={18} fill={C.crema} />
      <T x={320} y={130} s={12} f={C.latte}>one run per city: tracks roads</T>
      <rect x={320} y={140} width={runBar * bars} height={18} fill={answered ? C.caramel : C.latte} />
      {!answered && <T x={320 + 220 + 8} y={154} s={14} f={C.latte} o={pulse * bars}>?</T>}
      {!answered && <T x={300} y={252} s={13} f={C.crema} a="middle" o={bars}>few roads between many cities: which is less?</T>}
      {answered && <T x={300} y={252} s={13} f={C.caramel} a="middle" o={cap}>fewer roads: the per-city runs win</T>}
    </Svg>
  );
}

// 3 · DPMechanism. examples.py's floyd_warshall on WEIGHTED_EDGES. The table starts as the edges; then for waypoint 0,
// 1, 2, 3, 4 in turn its row and column light, and every cell that routing through it improves flashes and takes the
// new value. Row 0 ends at 0, 1, −3, 2, −4.
const KB = 0.62;
export function DPMechanism({ t }: StepCtx) {
  const kk = (t - 0.4) / KB;
  const k = clamp(Math.floor(kk), -1, N - 1);
  const p = k < 0 ? 0 : clamp(kk - k, 0, 1);
  const done = t > 0.4 + N * KB;
  const table = FW.init.map((r) => [...r]);
  const fresh = new Set<string>();
  FW.ups.forEach((u) => {
    if (u.k < k || done || (u.k === k && p > 0.45)) table[u.i][u.j] = u.d;
    if (u.k === k && !done && p > 0.45) fresh.add(`${u.i}${u.j}`);
  });
  const cap = easeOut(seg(t, 3.6, 3.95));
  return (
    <Svg label="The distance table filled by the dynamic program. It starts as the edge weights; then waypoint 0, 1, 2, 3, 4 in turn lights its row and column, and every cell that routing through it improves flashes and takes the new value. Row 0 ends 0, 1, minus 3, 2, minus 4" h={290}>
      <Graph vstroke={(v) => (v === k && !done ? C.caramel : C.latte)} />
      <TableFrame />
      {[0, 1, 2, 3, 4].map((i) =>
        [0, 1, 2, 3, 4].map((j) => {
          const via = !done && k >= 0 && (i === k || j === k);
          const isFresh = fresh.has(`${i}${j}`);
          return (
            <g key={`${i}${j}`}>
              <rect x={TX(j) - 20} y={TY(i) - 12} width={40} height={24} rx={3} fill={isFresh ? C.cocoa : 'none'} stroke={isFresh ? C.caramel : via ? C.latte : C.line} strokeWidth={isFresh ? 2 : 1} />
              <T x={TX(j)} y={TY(i) + 5} s={12} f={isFresh ? C.caramel : table[i][j] === Infinity ? C.taupe : C.crema} a="middle">{fmt(table[i][j])}</T>
            </g>
          );
        }),
      )}
      <T x={300} y={226} s={13} f={C.crema} a="middle">{k >= 0 && !done ? `waypoint ${k}: does going through ${k} beat it?` : done ? '' : 'the table starts as the edges'}</T>
      <T x={300} y={262} s={13} f={C.caramel} a="middle" o={cap}>every waypoint asked: the table is correct</T>
    </Svg>
  );
}

// 4 · PathReconstruction. The distance 0 → 2 is −3, and the direct edge says 8; the number alone can't show the route.
// The predecessor row for source 0 sits beside it: from 2, step back to 3, then 4, then 0. The route 0 → 4 → 3 → 2
// lights in that order.
export function PathReconstruction({ t }: StepCtx) {
  const row = easeOut(seg(t, 0.3, 0.8));
  const steps = clamp((t - 1.0) / 0.45, 0, 3);
  const cap = easeOut(seg(t, 2.6, 3.0));
  const back = [2, 3, 4, 0];
  const lit = new Set<string>();
  for (let i = 0; i < Math.floor(steps); i++) lit.add(`${back[i + 1]}-${back[i]}`);
  const at = back[Math.floor(steps)];
  return (
    <Svg label="The distance from 0 to 2 is minus 3 while the direct edge costs 8. Beside the graph sits the predecessor row for source 0: from 2 step back to 3, then to 4, then to 0, and the route 0, 4, 3, 2 lights" h={270}>
      <Graph edgeStroke={(u, v) => (lit.has(`${u}-${v}`) ? C.caramel : u === 0 && v === 2 ? C.cherryText : undefined)} vstroke={(v) => (v === at && steps > 0 ? C.caramel : back.slice(0, Math.floor(steps) + 1).includes(v) && steps > 0 ? C.crema : C.latte)} />
      <g opacity={row}>
        <T x={330} y={44} s={12} f={C.latte}>from 0: distance</T>
        {FW.dist[0].map((d, j) => (
          <g key={`d${j}`}>
            <T x={TX(j)} y={72} s={12} f={C.latte} a="middle">{String(j)}</T>
            <T x={TX(j)} y={94} s={13} f={j === 2 ? C.caramel : C.crema} a="middle">{fmt(d)}</T>
          </g>
        ))}
        <T x={330} y={134} s={12} f={C.cinnamon}>from 0: came from</T>
        {FW.pred[0].map((p, j) => {
          const on = steps > 0 && back.slice(0, Math.floor(steps)).includes(j);
          return (
            <g key={`p${j}`}>
              <rect x={TX(j) - 18} y={146} width={36} height={24} rx={3} fill="none" stroke={on ? C.caramel : C.line} strokeWidth={on ? 2 : 1} />
              <T x={TX(j)} y={163} s={13} f={on ? C.caramel : C.cinnamon} a="middle">{p === null ? '·' : String(p)}</T>
            </g>
          );
        })}
      </g>
      <T x={300} y={234} s={13} f={C.caramel} a="middle" o={cap}>0 → 4 → 3 → 2: −3, the direct edge costs 8</T>
    </Svg>
  );
}

// 5 · TransitiveClosure. The same loops with yes/no in place of numbers: the grid starts with the diagonal and the
// edges filled; each waypoint turns on every cell whose two halves are already on. By the last waypoint every cell
// is on: every city reaches every other.
export function TransitiveClosure({ t }: StepCtx) {
  const kk = (t - 0.6) / 0.55;
  const k = clamp(Math.floor(kk), -1, N - 1);
  const p = k < 0 ? 0 : clamp(kk - k, 0, 1);
  const done = t > 0.6 + N * 0.55;
  const on = TC.init.map((r) => [...r]);
  const fresh = new Set<string>();
  TC.ups.forEach((u) => {
    if (u.k < k || done || (u.k === k && p > 0.4)) on[u.i][u.j] = true;
    if (u.k === k && !done && p > 0.4) fresh.add(`${u.i}${u.j}`);
  });
  const intro = easeOut(seg(t, 0.2, 0.5));
  const cap = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="The same loops with yes or no in place of numbers. The grid starts with the diagonal and the edges filled; each waypoint turns on every cell whose two halves are already on, until every cell is on: every city reaches every other" h={290}>
      <Graph vstroke={(v) => (v === k && !done ? C.caramel : C.latte)} wo={0.4} />
      <TableFrame />
      {[0, 1, 2, 3, 4].map((i) =>
        [0, 1, 2, 3, 4].map((j) => {
          const isFresh = fresh.has(`${i}${j}`);
          return (
            <g key={`${i}${j}`} opacity={intro}>
              <rect x={TX(j) - 20} y={TY(i) - 12} width={40} height={24} rx={3} fill="none" stroke={C.line} />
              {on[i][j] && <circle cx={TX(j)} cy={TY(i)} r={isFresh ? 8 : 6} fill={isFresh ? C.caramel : C.cinnamon} />}
            </g>
          );
        }),
      )}
      <T x={300} y={226} s={13} f={C.crema} a="middle">{k >= 0 && !done ? `waypoint ${k}: both halves reachable?` : done ? '' : 'start: each city and its own roads'}</T>
      <T x={300} y={262} s={13} f={C.caramel} a="middle" o={cap}>which city reaches which: all of them</T>
    </Svg>
  );
}

// 6 · JohnsonsMechanism. A new vertex q joins above the graph with a free edge to every city; the general algorithm
// runs from it and every city gets a height h. Two routes from 0 to 2 glow, the direct 8 and the −3 detour. After
// answering: both pick up the same + h(0) − h(2), and their order can't change.
export function JohnsonsMechanism({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const q = easeOut(seg(t, 0.2, 0.6));
  const free = easeOut(seg(t, 0.6, 1.2));
  const hs = easeOut(seg(t, 1.3, 1.8));
  const routes = easeOut(seg(t, 2.0, 2.5));
  const shift = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const cap = answered ? easeOut(seg(s, 0.9, 1.3)) : 0;
  const Q: P = [160, 250];
  const SH = 12;
  const pos = (v: number): P => [POS[v][0], POS[v][1] - SH];
  return (
    <Svg label="A new vertex q joins with a free edge to every city; the general algorithm runs from it and every city gets a height h. Two routes from 0 to 2 glow, the direct 8 and the minus 3 detour. After answering: both pick up the same plus h of 0 minus h of 2, so their order can't change" h={290}>
      <g transform={`translate(0 ${-SH})`}>
        <Graph edgeStroke={(u, v) => (routes > 0 ? (u === 0 && v === 2 ? C.cherryText : (u === 0 && v === 4) || (u === 4 && v === 3) || (u === 3 && v === 2) ? C.caramel : undefined) : undefined)} />
      </g>
      <g opacity={q}>
        {[0, 1, 2, 3, 4].map((v) => <Arrow key={v} from={Q} to={pos(v)} stroke={C.line} dash="3 4" p={free} />)}
        <Vertex at={Q} label="q" stroke={C.caramel} />
        <T x={Q[0] + 22} y={Q[1] + 5} s={12} f={C.latte} o={free}>free roads</T>
      </g>
      {[0, 1, 2, 3, 4].map((v) => {
        const [x, y] = pos(v);
        return <T key={v} x={x + (v === 2 ? 26 : v === 0 ? -26 : 0)} y={v === 2 || v === 0 ? y + 4 : y - 20} s={12} f={C.cinnamon} a="middle" o={hs * (1 - routes * 0.6)}>h</T>;
      })}
      <g opacity={routes}>
        <T x={330} y={70} s={13} f={C.cherryText}>direct: 8</T>
        <T x={330} y={110} s={13} f={C.caramel}>0 → 4 → 3 → 2: −3</T>
      </g>
      {answered && (
        <g opacity={shift}>
          <T x={330} y={90} s={12} f={C.cinnamon}>+ h(0) − h(2)</T>
          <T x={330} y={130} s={12} f={C.cinnamon}>+ h(0) − h(2)</T>
        </g>
      )}
      {!answered && <T x={330} y={170} s={13} f={C.crema} o={routes}>could the cheaper one flip?</T>}
      {answered && <T x={330} y={170} s={13} f={C.caramel} o={cap}>same shift: the order holds</T>}
    </Svg>
  );
}

// 7 · Recap. Three chips light in turn: one pair, one to all, every pair. Under the last, the two answers it took: the
// waypoint table, and one run per city. Then a chain with every arrow pointing one way slides in: no loops, next.
export function Recap({ t }: StepCtx) {
  const chips = [0, 1, 2].map((i) => easeOut(seg(t, 0.2 + i * 0.35, 0.5 + i * 0.35)));
  const parts = easeOut(seg(t, 1.5, 2.0));
  const fade = 1 - easeOut(seg(t, 2.3, 2.6));
  const dag = easeInOut(seg(t, 2.6, 3.3));
  const cap = easeOut(seg(t, 3.3, 3.7));
  const labels = ['one pair', 'one to all', 'every pair'];
  return (
    <Svg label="Three labels light in turn: one pair, one to all, every pair; under the last, the two answers it took, the waypoint table and one run per city. Then a chain with every arrow pointing one way slides in: graphs without loops, next" h={260}>
      <g opacity={fade}>
        {labels.map((l, i) => (
          <g key={l} opacity={chips[i]}>
            <rect x={50 + i * 175} y={50} width={150} height={30} rx={15} fill="none" stroke={i === 2 ? C.caramel : C.latte} />
            <T x={125 + i * 175} y={70} s={13} f={i === 2 ? C.caramel : C.crema} a="middle">{l}</T>
          </g>
        ))}
        <g opacity={parts}>
          <line x1={400} y1={84} x2={360} y2={118} stroke={C.line} />
          <line x1={400} y1={84} x2={470} y2={118} stroke={C.line} />
          <T x={330} y={138} s={12} f={C.latte} a="middle">waypoint table</T>
          <T x={490} y={138} s={12} f={C.latte} a="middle">a run per city</T>
          <T x={300} y={190} s={13} f={C.crema} a="middle">old parts, put together anew</T>
        </g>
      </g>
      <g opacity={dag} transform={`translate(${lerp(80, 0, dag)} 0)`}>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            {i < 3 && <Arrow from={[120 + i * 120, 110]} to={[240 + i * 120, 110]} stroke={C.crema} />}
            <Vertex at={[120 + i * 120, 110]} label={String(i)} stroke={C.crema} />
          </g>
        ))}
      </g>
      <T x={300} y={226} s={13} f={C.caramel} a="middle" o={cap}>no loops at all: far cheaper, next</T>
    </Svg>
  );
}
