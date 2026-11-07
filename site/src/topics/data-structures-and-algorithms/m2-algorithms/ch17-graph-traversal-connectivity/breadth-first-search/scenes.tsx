import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = a vertex in the queue; latte = secondary labels (a distance);
// taupe = a vertex already fully processed; caramel = the thing to look at this beat (the vertex just dequeued, the
// path just found); cinnamon (rare) = the second colour of a 2-colouring; cherryText = the bad outcome (the clash).
// Every printed number is examples.py's: MULTI_PATH_ADJ, the path [0, 7, 6] of length 2; the 20x20 grid with three
// sources, 1,520 edges examined against 4,560 for three single passes (ratio 3.00); 0-1 BFS equal to Dijkstra on all
// 60 vertices; the 5-cycle's witness edge (2, 3); n = 2,000 for the low-diameter graph. That graph's edge counts come
// from a seeded random graph, so they are drawn as bar lengths only, never printed.

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

// examples.py's MULTI_PATH_ADJ, laid out by BFS distance from 0: one column per layer.
const ADJ: Record<number, number[]> = { 0: [1, 7], 1: [0, 2], 2: [1, 3, 6], 3: [2, 4], 4: [3, 5], 5: [4, 6], 6: [2, 5, 7], 7: [0, 6] };
const POS: Record<number, readonly [number, number]> = {
  0: [70, 110], 1: [180, 60], 7: [180, 160], 2: [290, 60], 6: [290, 160], 3: [400, 60], 5: [400, 160], 4: [510, 110],
};
const EDGES: [number, number][] = [[0, 1], [0, 7], [1, 2], [7, 6], [2, 6], [2, 3], [6, 5], [3, 4], [5, 4]];
const ekey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

/** examples.py's bfs from 0: each dequeue with the neighbours it discovers, and every vertex's distance and parent. */
function bfsTrace() {
  const dist: Record<number, number> = { 0: 0 };
  const parent: Record<number, number> = {};
  const q = [0];
  const events: { u: number; found: number[] }[] = [];
  for (let h = 0; h < q.length; h++) {
    const u = q[h];
    const found: number[] = [];
    for (const v of ADJ[u]) {
      if (dist[v] === undefined) {
        dist[v] = dist[u] + 1;
        parent[v] = u;
        q.push(v);
        found.push(v);
      }
    }
    events.push({ u, found });
  }
  return { dist, parent, order: q, events };
}
const TRACE = bfsTrace();

function Edge({ a, b, stroke = C.line, w = 1.5, dash, o = 1 }: { a: number; b: number; stroke?: string; w?: number; dash?: string; o?: number }) {
  const [x1, y1] = POS[a];
  const [x2, y2] = POS[b];
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={w} strokeDasharray={dash} opacity={o} />;
}

function Vertex({ i, stroke = C.latte, text = C.crema, w = 2, fill = C.band, o = 1 }: { i: number; stroke?: string; text?: string; w?: number; fill?: string; o?: number }) {
  const [x, y] = POS[i];
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={15} fill={fill} stroke={stroke} strokeWidth={w} />
      <T x={x} y={y + 5} s={13} f={text} a="middle">{String(i)}</T>
    </g>
  );
}

/** A distance label above a top-row vertex, below a bottom-row one, beside the two middle ones. */
function DistLabel({ i, o = 1, f = C.latte }: { i: number; o?: number; f?: string }) {
  const [x, y] = POS[i];
  const dy = y < 100 ? -24 : y > 120 ? 36 : 36;
  return <T x={x} y={y + dy} s={12} f={f} a="middle" o={o}>{`d=${TRACE.dist[i]}`}</T>;
}

/** A point a fraction p of the way along a path of vertices, for a travelling dot. */
function along(path: number[], p: number): readonly [number, number] {
  const n = path.length - 1;
  const k = Math.min(n - 1, Math.floor(p * n));
  const f = clamp(p * n - k, 0, 1);
  const [x1, y1] = POS[path[k]];
  const [x2, y2] = POS[path[k + 1]];
  return [lerp(x1, x2, f), lerp(y1, y2, f)];
}

/** The part of a path drawn so far, as a polyline, for paths that draw themselves in. */
function partial(path: number[], p: number) {
  const n = path.length - 1;
  const k = Math.min(n, Math.floor(p * n));
  const pts = path.slice(0, k + 1).map((v) => POS[v]);
  if (p < 1) pts.push(along(path, p));
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}

const LONG = [0, 1, 2, 3, 4, 5, 6];
const SHORT = [0, 7, 6];

// 1 · Opening: the frontier sweeping outward one layer at a time; behind it everything is checked, ahead of it
// nothing has been touched, and it never moves more than one layer at once.
export function Opening({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 0.3, 2.9));
  const fx = lerp(40, 540, sweep);
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="A graph laid out by distance from a source; a frontier line sweeps outward one layer at a time, every vertex behind it checked, every vertex ahead of it untouched" h={290}>
      {EDGES.map(([u, v]) => (
        <Edge key={ekey(u, v)} a={u} b={v} stroke={POS[u][0] < fx - 40 && POS[v][0] < fx - 40 ? C.taupe : C.line} />
      ))}
      <rect x={fx - 40} y={28} width={80} height={164} fill={C.cocoa} opacity={0.8 * clamp(sweep * 8, 0, 1) * clamp((1 - sweep) * 8, 0, 1)} />
      <line x1={fx} y1={24} x2={fx} y2={196} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="4 4" opacity={clamp((1 - sweep) * 8, 0, 1)} />
      {Object.keys(POS).map(Number).map((i) => {
        const x = POS[i][0];
        const near = Math.abs(x - fx) < 45;
        const behind = x < fx - 45;
        return <Vertex key={i} i={i} stroke={near ? C.caramel : behind ? C.taupe : C.mocha} text={near ? C.caramel : behind ? C.latte : C.taupe} w={near ? 3 : 2} />;
      })}
      <T x={300} y={236} s={13} f={C.crema} a="middle" o={a}>how many steps from one person to another?</T>
      <T x={300} y={262} s={13} f={C.caramel} a="middle" o={b}>never more than one step past what's checked</T>
    </Svg>
  );
}

// 2 · PredictShortestPath. Before answering, a dot crawls the long way round towards vertex 6. After answering: the
// short path 0 → 7 → 6 draws in, and 6's first arrival is the shortest one: length 2.
export function PredictShortestPath({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 5);
  const crawl = easeInOut(seg(t, 0.3, 2.3));
  const fade = answered ? 1 - easeOut(seg(s, 0, 0.4)) : 1;
  const draw = answered ? easeInOut(seg(s, 0.3, 1.2)) : 0;
  const lab = answered ? easeOut(seg(s, 1.0, 1.5)) : 0;
  const [dx, dy] = along(LONG, crawl);
  return (
    <Svg label="Source 0 and target 6. A dot crawls the long way round, 0 1 2 3 4 5 6, asking whether a vertex's first arrival is its shortest. After answering: the short path 0, 7, 6 draws in, length 2" h={290}>
      {EDGES.map(([u, v]) => <Edge key={ekey(u, v)} a={u} b={v} />)}
      <g opacity={fade}>
        <polyline points={partial(LONG, crawl)} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" />
        <circle cx={dx} cy={dy} r={5} fill={C.cherryText} />
      </g>
      {answered && <polyline points={partial(SHORT, Math.max(0.001, draw))} fill="none" stroke={C.caramel} strokeWidth={3.5} />}
      {Object.keys(POS).map(Number).map((i) => (
        <Vertex key={i} i={i} stroke={i === 0 || (answered && SHORT.includes(i) && draw > 0.5) ? C.caramel : i === 6 ? C.caramel : C.latte} w={i === 0 || i === 6 ? 3 : 2} o={i === 6 && !answered ? pulse : 1} />
      ))}
      <T x={70} y={146} s={12} f={C.latte} a="middle">source</T>
      {!answered && <T x={300} y={236} s={13} f={C.crema} a="middle">first arrival at 6: shortest, or can a shorter one come later?</T>}
      {answered && (
        <g opacity={lab}>
          <T x={300} y={236} s={14} f={C.caramel} a="middle">0 → 7 → 6, length 2: reached first, never beaten</T>
        </g>
      )}
    </Svg>
  );
}

// 3 · BFSMechanism. examples.py's bfs from 0, one dequeue at a time: the front of the queue is taken off, its unseen
// neighbours slide in at the back with their distance written beside them. 6 is seen from 7 before 2 can offer it.
const BEAT = 0.45;
export function BFSMechanism({ t }: StepCtx) {
  const k = clamp(Math.floor((t - 0.3) / BEAT), -1, TRACE.events.length - 1);
  const p = k < 0 ? 0 : clamp((t - 0.3 - k * BEAT) / BEAT, 0, 1);
  const done = t > 0.3 + TRACE.events.length * BEAT + 0.1;
  const shift = easeOut(seg(p, 0, 0.35));
  const slide = easeInOut(seg(p, 0.3, 0.85));
  // Discovered before this beat's enqueues land.
  const seenBefore = new Set<number>([0]);
  for (let e = 0; e < k; e++) TRACE.events[e].found.forEach((v) => seenBefore.add(v));
  const cur = k >= 0 ? TRACE.events[k] : null;
  const seen = new Set(seenBefore);
  if (cur && slide > 0) cur.found.forEach((v) => seen.add(v));
  const dequeued = new Set(TRACE.order.slice(0, Math.max(0, k)));
  const queueBefore = done ? [] : TRACE.order.slice(Math.max(0, k), seenBefore.size);
  const QX = (i: number) => 130 + i * 46;
  const QY = 226;
  return (
    <Svg label="The graph beside a first-in, first-out queue. Each beat takes the front vertex off and slides its unseen neighbours onto the back with their distance; every distance-1 vertex leaves before any distance-2 vertex, and so on" h={300}>
      {EDGES.map(([u, v]) => {
        const tree = (TRACE.parent[v] === u && seen.has(v)) || (TRACE.parent[u] === v && seen.has(u));
        return <Edge key={ekey(u, v)} a={u} b={v} stroke={tree ? C.crema : C.line} w={tree ? 2.5 : 1.5} />;
      })}
      {Object.keys(POS).map(Number).map((i) => {
        const isCur = cur?.u === i && !done;
        const st = isCur ? C.caramel : dequeued.has(i) || (done && seen.has(i)) ? C.taupe : seen.has(i) ? C.crema : C.mocha;
        return <Vertex key={i} i={i} stroke={st} text={isCur ? C.caramel : seen.has(i) ? C.crema : C.taupe} w={isCur ? 3.5 : 2} />;
      })}
      {Object.keys(POS).map(Number).filter((i) => seen.has(i)).map((i) => (
        <DistLabel key={i} i={i} o={cur?.found.includes(i) ? slide : 1} f={cur?.found.includes(i) ? C.caramel : C.latte} />
      ))}
      <T x={30} y={QY + 20} s={12} f={C.latte}>queue</T>
      <T x={QX(0) + 18} y={QY - 8} s={12} f={C.taupe} a="middle">front</T>
      {queueBefore.map((v, idx) => {
        const leaving = idx === 0 && k >= 0 && !done;
        const x = leaving ? QX(0) : QX(idx) - (k >= 0 ? 46 * shift : 0);
        const y = leaving ? QY - 30 * shift : QY;
        return (
          <g key={v} opacity={leaving ? 1 - shift : 1}>
            <rect x={x} y={y} width={36} height={30} rx={4} fill={C.band} stroke={leaving ? C.caramel : C.latte} />
            <T x={x + 18} y={y + 20} s={13} f={C.crema} a="middle">{String(v)}</T>
          </g>
        );
      })}
      {cur && !done && cur.found.map((v, j) => {
        const slot = queueBefore.length - 1 + j;
        const [vx, vy] = POS[v];
        const x = lerp(vx - 18, QX(slot), slide);
        const y = lerp(vy - 15, QY, slide);
        return (
          <g key={`n${v}`} opacity={clamp(slide * 3, 0, 1)}>
            <rect x={x} y={y} width={36} height={30} rx={4} fill={C.band} stroke={C.caramel} />
            <T x={x + 18} y={y + 20} s={13} f={C.caramel} a="middle">{String(v)}</T>
          </g>
        );
      })}
      {!done ? (
        <T x={300} y={288} s={13} f={C.latte} a="middle">take the front, add every unseen neighbour to the back</T>
      ) : (
        <T x={300} y={288} s={13} f={C.caramel} a="middle">first time reached: the distance is already final</T>
      )}
    </Svg>
  );
}

// 4 · MultiSource. examples.py's 20x20 grid with three seeds, (0,0), (19,19) and (0,19): one wave spreads from all three
// at once and every cell lights at its distance to the nearest. Then the bill: one pass examines 1,520 edges, three
// single-source passes 4,560.
const GRID = 20;
const SEEDS: [number, number][] = [[0, 0], [GRID - 1, GRID - 1], [0, GRID - 1]];
const near = (r: number, c: number) => Math.min(...SEEDS.map(([sr, sc]) => Math.abs(r - sr) + Math.abs(c - sc)));
const MAXD = Math.max(...Array.from({ length: GRID * GRID }, (_, i) => near(Math.floor(i / GRID), i % GRID)));
export function MultiSource({ t }: StepCtx) {
  const wave = easeInOut(seg(t, 0.4, 2.4)) * (MAXD + 1);
  const cell = 11;
  const ox = 30, oy = 34;
  const b1 = easeOut(seg(t, 2.4, 2.9));
  const b3 = [0, 1, 2].map((j) => easeOut(seg(t, 2.9 + j * 0.25, 3.3 + j * 0.25)));
  const cap = easeOut(seg(t, 3.6, 3.95));
  const BW = 80;
  return (
    <Svg label="A 20 by 20 grid with three seeds. One wave spreads from all three at once, each cell lighting at its distance to the nearest seed. Then the bill: one pass examines 1,520 edges, three single-source passes 4,560" h={300}>
      {Array.from({ length: GRID }, (_, r) =>
        Array.from({ length: GRID }, (_, c) => {
          const d = near(r, c);
          const lit = d < wave;
          const front = lit && d > wave - 1.6 && wave < MAXD + 1;
          return <rect key={`${r}-${c}`} x={ox + c * cell} y={oy + r * cell} width={cell - 1.5} height={cell - 1.5} fill={front ? C.caramel : lit ? C.taupe : C.band} />;
        }),
      )}
      {SEEDS.map(([r, c]) => (
        <circle key={`${r}-${c}`} cx={ox + c * cell + 4.75} cy={oy + r * cell + 4.75} r={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      ))}
      <T x={ox} y={22} s={12} f={C.latte}>three seeds, one queue</T>
      <T x={300} y={52} s={12} f={C.latte} o={b1}>edges examined</T>
      <T x={300} y={86} s={12} f={C.crema} o={b1}>one pass, three seeds</T>
      <rect x={300} y={94} width={BW * b1} height={18} fill={C.caramel} />
      <T x={300 + BW + 10} y={108} s={13} f={C.caramel} o={b1}>1,520</T>
      <T x={300} y={150} s={12} f={C.crema} o={b3[0]}>three single-source passes</T>
      {b3.map((v, j) => <rect key={j} x={300 + j * (BW + 2)} y={158} width={BW * v} height={18} fill={C.latte} />)}
      <T x={300} y={198} s={13} f={C.crema} o={b3[2]}>4,560</T>
      <T x={300} y={240} s={13} f={C.caramel} o={cap}>same distances, 3× the work</T>
    </Svg>
  );
}

// 5 · ZeroOneBFS. A two-ended queue whose distances read d, d, d+1. The front vertex u comes off; a neighbour across a
// free edge joins at the front with the same d, a neighbour across a costly edge joins at the back with d+1. The order
// stays non-decreasing. Then examples.py's check: the same distances as Dijkstra on all 60 vertices.
export function ZeroOneBFS({ t }: StepCtx) {
  const SX = (i: number) => 190 + i * 64;
  const Y = 70;
  const pop = easeInOut(seg(t, 0.3, 0.9));
  const zero = easeInOut(seg(t, 1.0, 1.7));
  const one = easeInOut(seg(t, 1.8, 2.5));
  const order = easeOut(seg(t, 2.6, 3.0));
  const match = easeOut(seg(t, 3.1, 3.6));
  const UX = 60, UY = Y;
  const Tok = ({ x, y, label, stroke, o = 1 }: { x: number; y: number; label: string; stroke: string; o?: number }) => (
    <g opacity={o}>
      <rect x={x} y={y} width={54} height={30} rx={4} fill={C.band} stroke={stroke} strokeWidth={1.5} />
      <T x={x + 27} y={y + 20} s={13} f={C.crema} a="middle">{label}</T>
    </g>
  );
  return (
    <Svg label="A two-ended queue holding distances d, d, d plus 1. The front vertex comes off; a free edge's neighbour joins at the front with d, a costly edge's neighbour joins at the back with d plus 1; the order stays non-decreasing. Then the same distances as Dijkstra on all 60 vertices" h={290}>
      <T x={SX(0)} y={Y - 12} s={12} f={C.taupe}>front</T>
      <T x={SX(3) + 54} y={Y - 12} s={12} f={C.taupe} a="end">back</T>
      <Tok x={lerp(SX(0), UX, pop)} y={UY} label={pop > 0.5 ? 'u: d' : 'd'} stroke={pop > 0 ? C.caramel : C.latte} />
      <Tok x={SX(1)} y={Y} label="d" stroke={C.latte} />
      <Tok x={SX(2)} y={Y} label="d+1" stroke={C.latte} />
      {zero > 0 && <path d={`M${UX + 27} ${UY + 30} Q ${(UX + SX(0)) / 2 + 27} ${UY + 80} ${lerp(UX, SX(0), zero) + 27} ${UY + 34}`} fill="none" stroke={C.caramel} strokeWidth={1.3} opacity={1 - order} />}
      {zero > 0 && <T x={(UX + SX(0)) / 2 + 27} y={UY + 74} s={12} f={C.caramel} a="middle" o={1 - order}>w = 0</T>}
      {zero > 0 && <Tok x={lerp(UX, SX(0), zero)} y={lerp(UY + 60, Y, zero)} label="d" stroke={C.caramel} o={clamp(zero * 3, 0, 1)} />}
      {one > 0 && <T x={SX(3) + 27} y={Y + 74} s={12} f={C.latte} a="middle" o={1 - order}>w = 1</T>}
      {one > 0 && <Tok x={lerp(UX, SX(3), one)} y={lerp(UY + 60, Y, one)} label="d+1" stroke={C.latte} o={clamp(one * 3, 0, 1)} />}
      <g opacity={order}>
        <path d={`M${SX(0)} ${Y + 40} L${SX(3) + 54} ${Y + 40}`} stroke={C.caramel} strokeWidth={1.5} />
        <path d={`M${SX(3) + 46} ${Y + 35} L${SX(3) + 54} ${Y + 40} L${SX(3) + 46} ${Y + 45}`} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={SX(0)} y={Y + 62} s={12} f={C.caramel}>never decreasing: no heap needed</T>
      </g>
      <g opacity={match}>
        <T x={30} y={188} s={12} f={C.latte}>0-1 BFS</T>
        <T x={30} y={218} s={12} f={C.latte}>Dijkstra</T>
        {Array.from({ length: 60 }, (_, i) => (
          <g key={i}>
            <circle cx={130 + i * 7.3} cy={184} r={2.4} fill={C.crema} opacity={clamp(match * 60 - i * 0.5, 0, 1)} />
            <circle cx={130 + i * 7.3} cy={214} r={2.4} fill={C.crema} opacity={clamp(match * 60 - i * 0.5, 0, 1)} />
          </g>
        ))}
        <T x={300} y={258} s={13} f={C.caramel} a="middle">the same distance at all 60 vertices</T>
      </g>
    </Svg>
  );
}

// The 5-cycle, examples.py's ODD_CYCLE_ADJ: 0 at the top, then clockwise.
const PENT = (i: number): readonly [number, number] => {
  const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
  return [300 + 78 * Math.cos(a), 116 + 78 * Math.sin(a)];
};
function Pent({ cols, edgeStroke }: { cols: (string | null)[]; edgeStroke?: (i: number) => string | undefined }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const [x1, y1] = PENT(i);
        const [x2, y2] = PENT((i + 1) % 5);
        const st = edgeStroke?.(i);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={st ?? C.line} strokeWidth={st ? 3 : 1.5} />;
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        const [x, y] = PENT(i);
        const c = cols[i];
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={15} fill={c ?? C.band} stroke={c ?? C.latte} strokeWidth={2} />
            <T x={x} y={y + 5} s={13} f={c ? C.espresso : C.crema} a="middle">{String(i)}</T>
          </g>
        );
      })}
    </g>
  );
}

// 6 · PredictBipartite. Before answering, the colouring walks around the five-cycle alternating white and blue and stops
// at the last vertex, which pulses between both. After answering: it takes the colour the walk gives it, and the edge
// back to 0 joins two whites.
export function PredictBipartite({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = Math.sin(t * 5) > 0;
  const walk = Math.floor(easeInOut(seg(t, 0.3, 1.9)) * 4.01);
  const COL = [C.caramel, C.cinnamon];
  const clash = answered ? easeOut(seg(s, 0.4, 0.9)) : 0;
  const cols = [0, 1, 2, 3, 4].map((i) => (i <= walk && i < 4 ? COL[i % 2] : null));
  if (walk >= 4) cols[4] = answered ? COL[0] : pulse ? COL[0] : COL[1];
  return (
    <Svg label="A five-cycle coloured by walking around it, alternating white and blue; the last vertex flickers between both. After answering: it must be white, and the edge back to vertex 0 joins two whites" h={270}>
      <Pent cols={cols} edgeStroke={(i) => (i === 4 && clash > 0 ? C.cherryText : undefined)} />
      {!answered && <T x={300} y={236} s={13} f={C.crema} a="middle">two colours, alternating: does the last one fit?</T>}
      {answered && (
        <g opacity={clash}>
          <T x={300} y={236} s={14} f={C.cherryText} a="middle">4 and 0: neighbours, the same colour</T>
        </g>
      )}
    </Svg>
  );
}

// 7 · Bipartiteness. examples.py's bipartite_check from 0, layer by layer: 0 white; 1 and 4 blue; 2 and 3 white. When 2
// is dequeued, its neighbour 3 already carries 2's colour: the witness edge (2, 3). The tree paths 2 → 1 → 0 and
// 3 → 4 → 0 meet at 0, and with the edge they close the odd cycle.
export function Bipartiteness({ t }: StepCtx) {
  const l0 = t > 0.3;
  const l1 = easeOut(seg(t, 0.8, 1.2));
  const l2 = easeOut(seg(t, 1.5, 1.9));
  const clash = easeOut(seg(t, 2.3, 2.7));
  const back = easeInOut(seg(t, 3.0, 3.8));
  const COLOUR: Record<number, string> = { 0: C.caramel, 1: C.cinnamon, 4: C.cinnamon, 2: C.caramel, 3: C.caramel };
  const cols = [0, 1, 2, 3, 4].map((i) => {
    const on = i === 0 ? l0 : i === 1 || i === 4 ? l1 > 0.5 : l2 > 0.5;
    return on ? COLOUR[i] : null;
  });
  // Edges of the pentagon by index i: (i, i+1). Tree edges 0-1, 1-2, 0-4, 4-3; edge 2 is (2, 3), the clash.
  const edgeStroke = (i: number) => {
    if (i === 2) return clash > 0 ? C.cherryText : undefined;
    if (back > 0) {
      const k = [0, 1, 3, 4].indexOf(i);
      if (k >= 0 && back > (i === 1 || i === 3 ? 0 : 0.5)) return C.cherryText;
    }
    if ((i === 0 || i === 4) && l1 > 0.5) return C.crema;
    if ((i === 1 || i === 3) && l2 > 0.5) return C.crema;
    return undefined;
  };
  const [x2, y2] = PENT(2);
  const [x3, y3] = PENT(3);
  return (
    <Svg label="The five-cycle coloured breadth-first from 0: 0 white, 1 and 4 blue, 2 and 3 white. Edge 2 to 3 joins two whites and turns red; the tree paths from 2 and 3 back to 0 turn red with it, the odd cycle as a witness" h={270}>
      <Pent cols={cols} edgeStroke={edgeStroke} />
      {clash > 0 && <circle cx={(x2 + x3) / 2} cy={(y2 + y3) / 2} r={lerp(4, 16, clash)} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={1 - back} />}
      {clash === 0 ? (
        <T x={300} y={236} s={13} f={C.latte} a="middle">each layer the opposite colour of its parent</T>
      ) : back < 0.6 ? (
        <T x={300} y={236} s={13} f={C.cherryText} a="middle" o={clash}>witness edge (2, 3): both white</T>
      ) : (
        <T x={300} y={236} s={13} f={C.cherryText} a="middle">edge plus paths back to 0: the odd cycle</T>
      )}
    </Svg>
  );
}

// 8 · DirectionOptimizing. A dense little cloud where one step out is already most of it: the frontier (white) scans
// all of its own edges, a thicket of lines. Then the flip: the few unreached vertices each look for one frontier
// neighbour and stop. The bars are examples.py's edge counts on its n = 2,000 graph, drawn to scale and not printed:
// that graph is seeded random.
const CLOUD = Array.from({ length: 24 }, (_, i) => ({
  x: 50 + (i % 8) * 70 + ((i * 13) % 3) * 10,
  y: 40 + Math.floor(i / 8) * 48 + ((i * 7) % 4) * 7,
}));
const UNREACHED = [5, 11, 18, 22];
const SOURCE = 0;
const nearestFrontier = (u: number) => {
  let best = -1;
  let bd = Infinity;
  CLOUD.forEach((p, j) => {
    if (j === SOURCE || UNREACHED.includes(j)) return;
    const d = Math.hypot(p.x - CLOUD[u].x, p.y - CLOUD[u].y);
    if (d < bd) {
      bd = d;
      best = j;
    }
  });
  return best;
};
export function DirectionOptimizing({ t }: StepCtx) {
  const out = seg(t, 0.4, 1.9);
  const fade = 1 - easeOut(seg(t, 2.0, 2.4));
  const inn = easeInOut(seg(t, 2.4, 3.2));
  const bars = easeOut(seg(t, 3.3, 4.2));
  const frontier = CLOUD.map((_, j) => j !== SOURCE && !UNREACHED.includes(j));
  const TOP = 400;
  const HYB = (400 * 3337) / 79954;
  return (
    <Svg label="A dense cloud of vertices where one step out is most of the graph. The frontier scans all its own edges, a thicket of lines; then the few unreached vertices each find one frontier neighbour and stop. Bars: edges examined, top-down far longer than switching" h={300}>
      {fade > 0 &&
        CLOUD.map((p, j) =>
          frontier[j]
            ? [3, 7, 11].map((k, m) => {
                const q = CLOUD[(j + k) % 24];
                const r = clamp(out * 24 - (j + m * 0.3) * 0.9, 0, 1);
                return r > 0 ? <line key={`${j}-${k}`} x1={p.x} y1={p.y} x2={lerp(p.x, q.x, r)} y2={lerp(p.y, q.y, r)} stroke={C.cherryText} strokeWidth={1.4} opacity={0.75 * fade} /> : null;
              })
            : null,
        )}
      {UNREACHED.map((u) => {
        const f = CLOUD[nearestFrontier(u)];
        return inn > 0 ? <line key={u} x1={CLOUD[u].x} y1={CLOUD[u].y} x2={lerp(CLOUD[u].x, f.x, inn)} y2={lerp(CLOUD[u].y, f.y, inn)} stroke={C.caramel} strokeWidth={2} /> : null;
      })}
      {CLOUD.map((p, j) => {
        const un = UNREACHED.includes(j);
        return <circle key={j} cx={p.x} cy={p.y} r={un ? 8 : 6} fill={j === SOURCE ? C.taupe : un ? (inn >= 1 ? C.caramel : C.band) : C.crema} stroke={un ? C.caramel : 'none'} strokeWidth={2} />;
      })}
      {inn === 0 ? (
        <T x={300} y={186} s={13} f={C.cherryText} a="middle" o={out > 0 ? 1 : 0}>the frontier scans every one of its edges</T>
      ) : (
        <T x={300} y={186} s={13} f={C.caramel} a="middle">the unreached look in: one hit, stop</T>
      )}
      <g opacity={bars}>
        <T x={30} y={228} s={12} f={C.crema}>top-down</T>
        <rect x={150} y={215} width={TOP * bars} height={16} fill={C.cherryText} />
        <T x={30} y={258} s={12} f={C.crema}>switching</T>
        <rect x={150} y={245} width={HYB * bars} height={16} fill={C.caramel} />
        <T x={300} y={290} s={12} f={C.latte} a="middle">edges examined, same graph, n = 2,000</T>
      </g>
    </Svg>
  );
}

// 9 · Recap. The layered graph with its distances: what breadth-first answers. Two questions it can't: which comes
// first, which group reaches each other. Then one path goes as deep as it can, 0 to 7 without backing up: next topic.
const DEEP = [0, 1, 2, 3, 4, 5, 6, 7];
export function Recap({ t }: StepCtx) {
  const d = easeOut(seg(t, 0.2, 0.9));
  const q = easeOut(seg(t, 1.1, 1.7));
  const deep = easeInOut(seg(t, 2.1, 3.5));
  const dimD = 1 - 0.7 * easeOut(seg(t, 2.0, 2.4));
  const last = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="The graph with every distance written: what breadth-first search answers. Two questions it can't: which comes first, and which group reaches each other. Then one path runs as deep as it can, 0 through 7, the next topic" h={300}>
      {EDGES.map(([u, v]) => <Edge key={ekey(u, v)} a={u} b={v} />)}
      {deep > 0 && <polyline points={partial(DEEP, Math.max(0.001, deep))} fill="none" stroke={C.caramel} strokeWidth={3} />}
      {Object.keys(POS).map(Number).map((i) => {
        const on = deep > 0 && DEEP.indexOf(i) <= deep * (DEEP.length - 1);
        return <Vertex key={i} i={i} stroke={on ? C.caramel : C.latte} w={on ? 3 : 2} />;
      })}
      {Object.keys(POS).map(Number).map((i) => <DistLabel key={i} i={i} o={d * dimD} />)}
      <g opacity={q * (1 - last)}>
        <rect x={110} y={222} width={170} height={28} rx={14} fill="none" stroke={C.latte} />
        <T x={195} y={241} s={12} f={C.crema} a="middle">which must come first?</T>
        <rect x={320} y={222} width={170} height={28} rx={14} fill="none" stroke={C.latte} />
        <T x={405} y={241} s={12} f={C.crema} a="middle">who reaches whom?</T>
      </g>
      <T x={300} y={241} s={13} f={C.caramel} a="middle" o={last}>as deep as it goes, then back up: next</T>
      <T x={300} y={282} s={12} f={C.latte} a="middle" o={d * (1 - last)}>breadth-first answers: the fewest steps</T>
    </Svg>
  );
}

