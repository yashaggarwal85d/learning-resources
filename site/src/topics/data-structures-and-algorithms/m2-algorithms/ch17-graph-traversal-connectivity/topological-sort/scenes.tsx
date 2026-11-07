import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = a vertex waiting; latte = secondary labels (an in-degree, a row's
// name); taupe = a vertex already placed; caramel = the thing to look at this beat (the vertex just taken, the count
// that just hit zero); cinnamon (rare) = the second order beside the first (reverse DFS, the heap); cherryText = the bad
// outcome (a cycle, counts stuck above zero). Every printed number is examples.py's: DAG_ADJ 0→2, 0→3, 1→3, 2→4, 3→4;
// Kahn's order [0, 1, 2, 3, 4]; reverse DFS finish order [1, 0, 3, 2, 4]; CYCLIC_ADJ 0→1→2→0 with 2→3; MULTI_ORDER_ADJ
// 0→1 with 2 alone, plain queue [0, 2, 1], heap [0, 1, 2], all 3 valid orders. Traces run here by the same loops.

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
function Arrow({ from, to, stroke = C.line, w = 1.5, p = 1, bend = 0, o = 1 }: { from: P; to: P; stroke?: string; w?: number; p?: number; bend?: number; o?: number }) {
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
      <path d={`M${sx} ${sy} Q${lerp(sx, cx, q)} ${lerp(sy, cy, q)} ${bx} ${by}`} fill="none" stroke={stroke} strokeWidth={w} />
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

// examples.py's DAG_ADJ.
const DAG: Record<number, number[]> = { 0: [2, 3], 1: [3], 2: [4], 3: [4], 4: [] };
const DPOS: Record<number, P> = { 0: [90, 50], 1: [90, 150], 2: [230, 50], 3: [230, 150], 4: [370, 100] };
const DEDGES: [number, number][] = [[0, 2], [0, 3], [1, 3], [2, 4], [3, 4]];
const indeg = (adj: Record<number, number[]>, n: number) => {
  const d = Array(n).fill(0);
  Object.values(adj).forEach((vs) => vs.forEach((v) => d[v]++));
  return d as number[];
};

/** examples.py's kahn_toposort on DAG_ADJ: for each pop, the vertex, the in-degrees after it, and who joined the queue. */
function kahnTrace() {
  const deg = indeg(DAG, 5);
  const q = [0, 1, 2, 3, 4].filter((v) => deg[v] === 0);
  const steps: { u: number; deg: number[]; joined: number[]; queue: number[] }[] = [];
  const init = { deg: [...deg], queue: [...q] };
  while (q.length) {
    const u = q.shift()!;
    const joined: number[] = [];
    for (const v of DAG[u]) {
      deg[v]--;
      if (deg[v] === 0) {
        q.push(v);
        joined.push(v);
      }
    }
    steps.push({ u, deg: [...deg], joined, queue: [...q] });
  }
  return { init, steps };
}
const KAHN = kahnTrace();
const KAHN_ORDER = KAHN.steps.map((s) => s.u); // [0, 1, 2, 3, 4]

/** examples.py's dfs_finish_order on DAG_ADJ: grey/finish events in order. */
function dfsTrace() {
  const color = [0, 0, 0, 0, 0];
  const ev: { kind: 'grey' | 'fin'; u: number }[] = [];
  const visit = (u: number) => {
    color[u] = 1;
    ev.push({ kind: 'grey', u });
    for (const v of DAG[u]) if (color[v] === 0) visit(v);
    color[u] = 2;
    ev.push({ kind: 'fin', u });
  };
  for (let s = 0; s < 5; s++) if (color[s] === 0) visit(s);
  return ev;
}
const DFS_EV = dfsTrace();
const FINISH = DFS_EV.filter((e) => e.kind === 'fin').map((e) => e.u); // [4, 2, 3, 0, 1]
const RDFS = [...FINISH].reverse(); // [1, 0, 3, 2, 4]

/** A row of vertex chips with every DAG edge drawn as an arc above, all pointing right when the order is valid. */
function OrderRow({ order, y, x0, gap, col, o = 1, arcs = 0, below = false }: { order: number[]; y: number; x0: number; gap: number; col: string; o?: number; arcs?: number; below?: boolean }) {
  const X = (v: number) => x0 + order.indexOf(v) * gap;
  return (
    <g opacity={o}>
      {arcs > 0 &&
        DEDGES.map(([a, b]) => {
          const xa = X(a), xb = X(b);
          const h = 8 + Math.abs(xb - xa) / 6;
          const sg = below ? 1 : -1;
          return <path key={`${a}${b}`} d={`M${xa} ${y + sg * 16} Q${(xa + xb) / 2} ${y + sg * (16 + h * 2)} ${xb - 3} ${y + sg * 17}`} fill="none" stroke={col} strokeWidth={1.2} opacity={arcs} />;
        })}
      {order.map((v, i) => <Vertex key={v} at={[x0 + i * gap, y]} label={String(v)} stroke={col} />)}
    </g>
  );
}

// 1 · Opening. Five targets with their dependencies; then they slide into one line in Kahn's order, and every
// dependency arrow lies along the line pointing forward.
export function Opening({ t }: StepCtx) {
  const show = easeOut(seg(t, 0.2, 0.9));
  const line = easeInOut(seg(t, 1.4, 2.4));
  const arcs = easeOut(seg(t, 2.4, 2.9));
  const a = easeOut(seg(t, 0.4, 1.0));
  const b = easeOut(seg(t, 2.6, 3.1));
  const RX = (v: number) => 140 + KAHN_ORDER.indexOf(v) * 80;
  const pos = (v: number): P => [lerp(DPOS[v][0] + 70, RX(v), line), lerp(DPOS[v][1] + 20, 150, line)];
  return (
    <Svg label="Five build targets with their dependency arrows; they slide into one line, and every dependency arrow then points forward along it" h={270}>
      <g opacity={show * (1 - line)}>
        {DEDGES.map(([u, v]) => <Arrow key={`${u}${v}`} from={pos(u)} to={pos(v)} />)}
      </g>
      {line < 1 && [0, 1, 2, 3, 4].map((v) => <Vertex key={v} at={pos(v)} label={String(v)} o={show} stroke={C.latte} />)}
      {line >= 1 && <OrderRow order={KAHN_ORDER} y={150} x0={140} gap={80} col={C.caramel} arcs={arcs} o={1} />}
      {line < 0.5 ? (
        <T x={300} y={236} s={13} f={C.latte} a="middle" o={a}>each target needs a few others first</T>
      ) : (
        <T x={300} y={236} s={13} f={C.caramel} a="middle" o={b}>one line: every target after what it needs</T>
      )}
    </Svg>
  );
}

// examples.py's CYCLIC_ADJ.
const CPOS: Record<number, P> = { 0: [220, 50], 1: [330, 120], 2: [190, 160], 3: [380, 200] };
const CEDGES: [number, number][] = [[0, 1], [1, 2], [2, 0], [2, 3]];

// 2 · PredictCycle. A dot circles 0 → 1 → 2 → 0 without end. After answering: the attempt to line them up writes
// 0 before 1 before 2 before 0, and the last arrow points backwards, red.
export function PredictCycle({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const loop = (((Math.max(0, t) * 0.7) % 1) + 1) % 1;
  const k = clamp(Math.floor(loop * 3), 0, 2);
  const f = loop * 3 - k;
  const cyc = [0, 1, 2, 0];
  const dot: P = [lerp(CPOS[cyc[k]][0], CPOS[cyc[k + 1]][0], f), lerp(CPOS[cyc[k]][1], CPOS[cyc[k + 1]][1], f)];
  const row = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const bad = answered ? easeOut(seg(s, 0.9, 1.4)) : 0;
  const RX = (i: number) => 150 + i * 90;
  return (
    <Svg label="A cycle: a dot circles 0, 1, 2 and back to 0 without end, with 3 hanging off 2. After answering: lining them up gives 0 before 1 before 2, and the arrow from 2 back to 0 points backwards, in red" h={290}>
      <g opacity={1 - row * 0.7}>
        {CEDGES.map(([u, v]) => <Arrow key={`${u}${v}`} from={CPOS[u]} to={CPOS[v]} stroke={u !== 2 || v !== 3 ? C.crema : C.line} />)}
        {[0, 1, 2, 3].map((v) => <Vertex key={v} at={CPOS[v]} label={String(v)} />)}
        {!answered && <circle cx={dot[0]} cy={dot[1]} r={5} fill={C.caramel} />}
      </g>
      {answered && (
        <g opacity={row}>
          {[0, 1, 2].map((v, i) => <Vertex key={v} at={[RX(i), 236]} label={String(v)} stroke={C.crema} />)}
          <Arrow from={[RX(0), 236]} to={[RX(1), 236]} stroke={C.crema} />
          <Arrow from={[RX(1), 236]} to={[RX(2), 236]} stroke={C.crema} />
          <Arrow from={[RX(2), 236]} to={[RX(0), 236]} stroke={C.cherryText} w={2.5} bend={-40} p={bad} />
          <T x={RX(2) + 30} y={241} s={13} f={C.cherryText} o={bad}>0 before itself</T>
        </g>
      )}
      {!answered && <T x={300} y={262} s={13} f={C.crema} a="middle">a cycle: is any order possible?</T>}
    </Svg>
  );
}

// 3 · KahnMechanism. examples.py's kahn_toposort on DAG_ADJ. Every vertex carries its in-degree; the queue starts with
// 0 and 1. Each pop crosses off the out-edges, the counts tick down, and a count hitting zero joins the queue. The
// order comes out 0, 1, 2, 3, 4.
const KB = 0.6;
export function KahnMechanism({ t }: StepCtx) {
  const k = clamp(Math.floor((t - 0.4) / KB), -1, KAHN.steps.length - 1);
  const p = k < 0 ? 0 : clamp((t - 0.4 - k * KB) / KB, 0, 1);
  const cut = easeOut(seg(p, 0.15, 0.5));
  const cur = k >= 0 ? KAHN.steps[k] : null;
  const degNow = cur && cut > 0.5 ? cur.deg : k > 0 ? KAHN.steps[k - 1].deg : KAHN.init.deg;
  const placed = KAHN_ORDER.slice(0, Math.max(0, k) + (cur && p > 0.1 ? 1 : 0));
  const queue = cur ? (cut > 0.5 ? cur.queue : (k > 0 ? KAHN.steps[k - 1].queue : KAHN.init.queue).slice(1)) : KAHN.init.queue;
  const gone = new Set(KAHN_ORDER.slice(0, k));
  const OX = (i: number) => 180 + i * 50;
  return (
    <Svg label="Kahn's algorithm on the five-vertex graph. Each vertex shows its in-degree; the queue starts with 0 and 1. Each pop crosses off its out-edges, the counts tick down, and a count reaching zero joins the queue; the order comes out 0, 1, 2, 3, 4" h={300}>
      {DEDGES.map(([u, v]) => {
        const used = gone.has(u) || (cur?.u === u && cut > 0);
        return <Arrow key={`${u}${v}`} from={DPOS[u]} to={DPOS[v]} stroke={cur?.u === u && cut < 1 ? C.caramel : C.line} o={used ? 1 - (gone.has(u) ? 0.8 : 0.8 * cut) : 1} />;
      })}
      {[0, 1, 2, 3, 4].map((v) => {
        const isCur = cur?.u === v;
        const done = gone.has(v);
        const [x, y] = DPOS[v];
        const zeroNow = cur?.joined.includes(v) && cut > 0.5;
        return (
          <g key={v}>
            <Vertex at={DPOS[v]} label={String(v)} stroke={isCur ? C.caramel : done ? C.taupe : C.latte} text={done ? C.taupe : C.crema} w={isCur ? 3 : 2} />
            {!done && !isCur && <T x={x + 22} y={y - 14} s={12} f={zeroNow ? C.caramel : C.latte}>{String(degNow[v])}</T>}
          </g>
        );
      })}
      <T x={440} y={40} s={12} f={C.latte}>queue</T>
      {queue.map((v, i) => (
        <g key={v}>
          <rect x={440 + i * 44} y={50} width={36} height={28} rx={4} fill={C.band} stroke={C.crema} />
          <T x={458 + i * 44} y={69} s={13} f={C.crema} a="middle">{String(v)}</T>
        </g>
      ))}
      <T x={40} y={240} s={12} f={C.latte}>order</T>
      {placed.map((v, i) => {
        const fresh = cur?.u === v;
        const m = fresh ? easeOut(seg(p, 0.1, 0.6)) : 1;
        const [vx, vy] = DPOS[v];
        return <Vertex key={v} at={[lerp(vx, OX(i), m), lerp(vy, 236, m)]} label={String(v)} stroke={fresh ? C.caramel : C.crema} />;
      })}
      <T x={300} y={288} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.7))}>take a zero, tick its targets down</T>
    </Svg>
  );
}

// 4 · ReverseDFS. examples.py's dfs_finish_order on the same graph: 0 → 2 → 4, back up, 3, back up, then 1. Each
// vertex drops into a row as it finishes, 4, 2, 3, 0, 1; the row reverses to 1, 0, 3, 2, 4. Beside Kahn's 0, 1, 2, 3,
// 4 it differs, and every edge in both rows points forward.
const DB = 0.18;
export function ReverseDFS({ t }: StepCtx) {
  const n = clamp((t - 0.3) / DB, 0, DFS_EV.length);
  const flip = easeInOut(seg(t, 2.3, 2.9));
  const cmp = easeOut(seg(t, 3.0, 3.4));
  const arcs = easeOut(seg(t, 3.4, 3.9));
  const grey = new Set<number>();
  const fin = new Set<number>();
  DFS_EV.slice(0, Math.floor(n)).forEach((e) => (e.kind === 'grey' ? grey.add(e.u) : fin.add(e.u)));
  const SX = (i: number) => 160 + i * 64;
  return (
    <Svg label="Depth-first search on the same graph: each vertex drops into a row as it finishes, 4, 2, 3, 0, 1; the row reverses to 1, 0, 3, 2, 4. Under Kahn's 0, 1, 2, 3, 4 it differs, and every edge in both rows points forward" h={300}>
      <g opacity={1 - cmp}>
        {DEDGES.map(([u, v]) => <Arrow key={`${u}${v}`} from={DPOS[u]} to={DPOS[v]} stroke={grey.has(v) && grey.has(u) ? C.crema : C.line} />)}
        {[0, 1, 2, 3, 4].map((v) => (
          <Vertex key={v} at={DPOS[v]} label={String(v)} stroke={fin.has(v) ? C.taupe : grey.has(v) ? C.caramel : C.latte} text={fin.has(v) ? C.taupe : C.crema} w={grey.has(v) && !fin.has(v) ? 3 : 2} />
        ))}
      </g>
      <T x={30} y={lerp(214, 179, cmp)} s={12} f={flip > 0.5 ? C.cinnamon : C.latte}>{flip > 0.5 ? 'reverse DFS' : 'finished'}</T>
      {FINISH.map((v, k) => {
        if (!fin.has(v)) return null;
        const x = lerp(SX(k), SX(4 - k), flip);
        const y = lerp(210, 175, cmp) + Math.sin(flip * Math.PI) * (k % 2 === 0 ? -16 : 16);
        return <Vertex key={v} at={[x, y]} label={String(v)} stroke={flip > 0.5 ? C.cinnamon : C.crema} />;
      })}
      {cmp > 0 && (
        <g opacity={cmp}>
          <T x={30} y={226} s={12} f={C.caramel}>Kahn's</T>
        </g>
      )}
      {cmp > 0 && <OrderRow order={KAHN_ORDER} y={222} x0={160} gap={64} col={C.caramel} o={cmp} arcs={arcs} below />}
      {arcs > 0 &&
        DEDGES.map(([a, b]) => {
          const xa = 160 + RDFS.indexOf(a) * 64, xb = 160 + RDFS.indexOf(b) * 64;
          const h = 8 + Math.abs(xb - xa) / 6;
          return <path key={`r${a}${b}`} d={`M${xa} 159 Q${(xa + xb) / 2} ${159 - h * 2} ${xb - 3} 158`} fill="none" stroke={C.cinnamon} strokeWidth={1.2} opacity={arcs} />;
        })}
      <T x={300} y={295} s={12} f={C.latte} a="middle" o={arcs}>different orders, every edge forward in both</T>
    </Svg>
  );
}

// 5 · StuckGraph. examples.py's CYCLIC_ADJ: every vertex starts at in-degree 1, the queue starts empty, and nothing
// ever reaches zero. Then the depth-first search on the same graph: 0 → 1 → 2 on the path, and 2 → 0 hits a grey
// vertex, the back edge it already tests for.
export function StuckGraph({ t }: StepCtx) {
  const counts = easeOut(seg(t, 0.3, 0.8));
  const empty = easeOut(seg(t, 0.9, 1.4));
  const stuck = easeOut(seg(t, 1.5, 2.0));
  const path = easeInOut(seg(t, 2.3, 3.1));
  const back = easeOut(seg(t, 3.1, 3.6));
  const deg = indeg(CEDGES.reduce((m, [u, v]) => ((m[u] = [...(m[u] ?? []), v]), m), {} as Record<number, number[]>), 4);
  const pulse = 0.6 + 0.4 * Math.sin(t * 6);
  return (
    <Svg label="The cyclic graph: every vertex starts at in-degree 1, the queue starts empty, and no count ever reaches zero. Then depth-first search walks 0, 1, 2 and the edge from 2 back to 0 hits a vertex still on the path, the back edge" h={290}>
      <Arrow from={CPOS[2]} to={CPOS[3]} />
      <Arrow from={CPOS[0]} to={CPOS[1]} stroke={path > 0 ? C.caramel : C.line} w={path > 0 ? 2.5 : 1.5} p={path > 0 ? clamp(path * 2, 0, 1) : 1} />
      {path === 0 && <Arrow from={CPOS[0]} to={CPOS[1]} />}
      <Arrow from={CPOS[1]} to={CPOS[2]} />
      <Arrow from={CPOS[1]} to={CPOS[2]} stroke={C.caramel} w={2.5} p={clamp(path * 2 - 1, 0, 1)} />
      <Arrow from={CPOS[2]} to={CPOS[0]} stroke={back > 0 ? C.cherryText : C.line} w={back > 0 ? 3 : 1.5} />
      {[0, 1, 2, 3].map((v) => {
        const [x, y] = CPOS[v];
        const onPath = (v === 0 && path > 0) || (v === 1 && path > 0.5) || (v === 2 && path >= 1);
        return (
          <g key={v}>
            <Vertex at={CPOS[v]} label={String(v)} stroke={onPath ? C.caramel : C.latte} />
            <T x={x + 22} y={y - 14} s={12} f={stuck > 0 ? C.cherryText : C.latte} o={counts * (1 - 0.8 * easeOut(seg(t, 2.2, 2.5)))}>{String(deg[v])}</T>
          </g>
        );
      })}
      <T x={460} y={40} s={12} f={C.latte} o={empty}>queue</T>
      <rect x={460} y={50} width={90} height={28} rx={4} fill="none" stroke={C.cherryText} strokeDasharray="4 3" opacity={empty * (path > 0 ? 0.3 : pulse)} />
      <T x={505} y={69} s={12} f={C.cherryText} a="middle" o={empty * (path > 0 ? 0.3 : 1)}>empty</T>
      {path === 0 ? (
        <T x={300} y={262} s={13} f={C.cherryText} a="middle" o={stuck}>every count stuck at 1: the queue never fills</T>
      ) : (
        <T x={300} y={262} s={13} f={C.cherryText} a="middle" o={back}>2 → 0 reaches a vertex on the path: back edge</T>
      )}
    </Svg>
  );
}

// 6 · LexicographicHeap. examples.py's MULTI_ORDER_ADJ: 0 → 1, and 2 alone. The plain queue starts [0, 2], pops 0,
// and 1 joins behind 2: 0, 2, 1. After answering: the heap pops the smallest available each time: 0, 1, 2. The 3 valid
// orders sit beside them.
export function LexicographicHeap({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const PLAIN = [0, 2, 1];
  const LEX = [0, 1, 2];
  const q = [0, 1, 2].map((i) => easeOut(seg(t, 0.4 + i * 0.5, 0.8 + i * 0.5)));
  const h = [0, 1, 2].map((i) => (answered ? easeOut(seg(s, 0.2 + i * 0.35, 0.5 + i * 0.35)) : 0));
  const cap = answered ? easeOut(seg(s, 1.3, 1.8)) : 0;
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const MP: Record<number, P> = { 0: [90, 60], 1: [190, 60], 2: [140, 140] };
  const RX = (i: number) => 330 + i * 60;
  return (
    <Svg label="A graph with 0 pointing to 1 and 2 alone. The plain queue's order fills in as 0, 2, 1; the heap's row waits. After answering: the heap's order fills in as 0, 1, 2, the smaller one, beside the 3 valid orders" h={270}>
      <Arrow from={MP[0]} to={MP[1]} />
      {[0, 1, 2].map((v) => <Vertex key={v} at={MP[v]} label={String(v)} />)}
      <T x={330} y={36} s={12} f={C.latte}>plain queue</T>
      {PLAIN.map((v, i) => <Vertex key={v} at={[RX(i), lerp(52, 70, q[i])]} label={String(v)} stroke={C.crema} o={q[i]} />)}
      <T x={330} y={116} s={12} f={answered ? C.cinnamon : C.latte}>min-heap</T>
      {!answered && <T x={390} y={156} s={14} f={C.latte} a="middle" o={pulse}>?</T>}
      {LEX.map((v, i) => <Vertex key={v} at={[RX(i), lerp(132, 150, h[i])]} label={String(v)} stroke={C.cinnamon} o={h[i]} />)}
      <T x={60} y={200} s={12} f={C.latte} o={cap}>all 3 valid orders: 0 1 2 · 0 2 1 · 2 0 1</T>
      {!answered && <T x={300} y={240} s={13} f={C.crema} a="middle">the same order, a different one, or either?</T>}
      {answered && <T x={300} y={240} s={13} f={C.cinnamon} a="middle" o={cap}>either; when they differ, the heap's is smaller</T>}
    </Svg>
  );
}

// 7 · Recap. Kahn's line for the DAG: what can come before what. Then the cycle comes back: 0, 1, 2 each reach the
// other two, and a ring closes around them as one group, with 3 outside it. Finding those groups is next.
export function Recap({ t }: StepCtx) {
  const row = easeOut(seg(t, 0.2, 0.8));
  const arcs = easeOut(seg(t, 0.6, 1.1));
  const swap = easeInOut(seg(t, 1.4, 1.9));
  const cyc = easeOut(seg(t, 1.9, 2.5));
  const hull = easeOut(seg(t, 2.5, 3.1));
  const last = easeOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="Kahn's line for the acyclic graph, every arrow forward. Then the cyclic graph returns: 0, 1 and 2 each reach the other two, and a ring closes around them as one group, with 3 outside. Finding those groups is next" h={280}>
      <g opacity={row * (1 - swap)}>
        <OrderRow order={KAHN_ORDER} y={140} x0={140} gap={80} col={C.crema} arcs={arcs} />
        <T x={300} y={230} s={13} f={C.latte} a="middle">which can come before which</T>
      </g>
      <g opacity={cyc}>
        {CEDGES.map(([u, v]) => <Arrow key={`${u}${v}`} from={CPOS[u]} to={CPOS[v]} stroke={u === 2 && v === 3 ? C.line : C.crema} />)}
        {[0, 1, 2, 3].map((v) => <Vertex key={v} at={CPOS[v]} label={String(v)} stroke={v < 3 && hull > 0 ? C.caramel : C.latte} />)}
        <ellipse cx={248} cy={110} rx={lerp(60, 115, hull)} ry={lerp(40, 82, hull)} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 4" opacity={hull} />
      </g>
      <T x={300} y={252} s={13} f={C.caramel} a="middle" o={last}>a group that reaches itself: finding those, next</T>
    </Svg>
  );
}
