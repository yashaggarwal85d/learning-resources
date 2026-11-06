import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeInOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = an unvisited vertex; latte = secondary
// labels (a distance, a colour); taupe = a vertex already fully processed; caramel = the
// thing to look at this beat (the vertex just dequeued, the edge just classified);
// cherry/cherryText = the bad outcome (an odd cycle, a bipartiteness failure). This
// topic's own graph (examples.py, MULTI_PATH_ADJ): an 8-vertex ring 0-1-2-3-4-5-6-7-0
// with one chord 2-6, giving a shortest path 0->7->6 of length 2 against the long way
// round of length 6.

const RING_N = 8;
const CX = 300, CY = 155, R = 105;
function ringPos(i: number): readonly [number, number] {
  const a = -Math.PI / 2 + (i / RING_N) * Math.PI * 2;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)];
}
const RING_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0], [2, 6]];
// BFS layers from vertex 0 on this graph (examples.py): L0={0} L1={1,7} L2={2,6} L3={3,5} L4={4}.
const LAYER: Record<number, number> = { 0: 0, 1: 1, 7: 1, 2: 2, 6: 2, 3: 3, 5: 3, 4: 4 };

function Node({ i, fill, label, o = 1 }: { i: number; fill: string; label?: string; o?: number }) {
  const [x, y] = ringPos(i);
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={14} fill={C.band} stroke={fill} strokeWidth={2.5} />
      <T x={x} y={y + 5} s={13} f={fill} a="middle">{String(i)}</T>
      {label && <T x={x} y={y - 20} s={13} f={C.latte} a="middle">{label}</T>}
    </g>
  );
}

function Edges({ o = 1, highlight }: { o?: number; highlight?: Set<string> }) {
  return (
    <g opacity={o}>
      {RING_EDGES.map(([a, b]) => {
        const [x1, y1] = ringPos(a);
        const [x2, y2] = ringPos(b);
        const hi = highlight?.has(`${a}-${b}`) || highlight?.has(`${b}-${a}`);
        return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={hi ? C.focus : C.line} strokeWidth={hi ? 2.5 : 1.5} />;
      })}
    </g>
  );
}

// 1 · Opening: a widening ring that never takes a wrong turn.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const reveal = easeOut(seg(t, 0.6, 2.2));
  const maxLayer = Math.floor(reveal * 4.3);
  return (
    <Svg label="A graph with a widening ring of visited vertices spreading outward from a source" h={320}>
      <Edges o={0.9} />
      {Array.from({ length: RING_N }, (_, i) => (
        <Node key={i} i={i} fill={LAYER[i] <= maxLayer ? C.focus : C.crema} />
      ))}
      <T x={300} y={290} s={13} f={C.latte} a="middle" o={a}>never more than one step past</T>
      <T x={300} y={308} s={13} f={C.latte} a="middle" o={a}>what's already checked</T>
    </Svg>
  );
}

// 2 · PredictShortestPath.
export function PredictShortestPath({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A source vertex with the question of whether the first time a vertex is reached is always its shortest distance" h={360}>
      <Edges o={0.5} />
      <Node i={0} fill={C.focus} label="source" />
      {Array.from({ length: RING_N }, (_, i) => i !== 0 && <Node key={i} i={i} fill={C.crema} />)}
      <T x={300} y={290} s={14} f={C.latte} a="middle" o={a}>first reached — always shortest, or</T>
      <T x={300} y={308} s={14} f={C.latte} a="middle" o={a}>can a shorter path arrive later?</T>
      {answer !== null && <T x={300} y={332} s={15} f={C.caramel} a="middle">always shortest, the first time</T>}
    </Svg>
  );
}

// 3 · BFSMechanism: the frontier widening layer by layer, distances locking in.
export function BFSMechanism({ t }: StepCtx) {
  const layerTime = (L: number) => 0.3 + L * 0.6;
  const curLayer = Math.max(0, Math.floor((t - 0.2) / 0.6));
  return (
    <Svg label="The BFS frontier widening one layer at a time, each vertex's distance locking in the moment it is first reached" h={340}>
      <Edges o={0.8} highlight={curLayer >= 1 ? new Set(['0-1', '0-7']) : undefined} />
      {Array.from({ length: RING_N }, (_, i) => {
        const L = LAYER[i];
        const reached = L <= curLayer;
        const justNow = L === curLayer;
        return <Node key={i} i={i} fill={reached ? (justNow ? C.focus : C.crema) : C.band} label={reached ? `d=${L}` : undefined} o={1} />;
      })}
      <T x={300} y={295} s={13} f={C.latte} a="middle">a FIFO queue: every vertex at distance d is</T>
      <T x={300} y={313} s={13} f={C.latte} a="middle">dequeued before any vertex at d+1 is enqueued</T>
    </Svg>
  );
}

// 4 · MultiSource: several seeds at once vs. one source at a time.
export function MultiSource({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const GRID = 6;
  const cell = 46;
  const ox = 300 - (GRID * cell) / 2, oy = 40;
  const sources: [number, number][] = [[0, 0], [5, 5], [5, 0]];
  const reveal = easeOut(seg(t, 0.6, 2.4));
  const maxRing = Math.floor(reveal * 6);
  function dist(r: number, c: number) {
    return Math.min(...sources.map(([sr, sc]) => Math.abs(r - sr) + Math.abs(c - sc)));
  }
  return (
    <Svg label="A grid with three fire sources spreading simultaneously, each cell lit the moment the nearest fire reaches it" h={390}>
      {Array.from({ length: GRID }, (_, r) =>
        Array.from({ length: GRID }, (_, c) => {
          const d = dist(r, c);
          const lit = d <= maxRing;
          return (
            <rect key={`${r}-${c}`} x={ox + c * cell + 2} y={oy + r * cell + 2} width={cell - 4} height={cell - 4}
              fill={lit ? (d === maxRing ? C.focus : C.band) : C.ink} stroke={C.line} />
          );
        })
      )}
      <T x={300} y={oy + GRID * cell + 28} s={13} f={C.latte} a="middle" o={a}>one pass, three seeds — the distance</T>
      <T x={300} y={oy + GRID * cell + 46} s={13} f={C.latte} a="middle" o={a}>to the nearest source, everywhere at once</T>
    </Svg>
  );
}

// 5 · ZeroOneBFS: a deque, 0-weight edges to the front, 1-weight edges to the back.
export function ZeroOneBFS({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const items: { label: string; w: 0 | 1 }[] = [{ label: 'v3', w: 1 }, { label: 'v1', w: 0 }, { label: 'u', w: 0 }, { label: 'v2', w: 1 }];
  const slotW = 70;
  const startX = 300 - (items.length * slotW) / 2;
  return (
    <Svg label="A deque holding the current frontier, zero-weight edges pushed to the front, one-weight edges pushed to the back" h={260}>
      <T x={300} y={40} s={14} f={C.latte} a="middle" o={a}>deque — front</T>
      <line x1={50} y1={120} x2={550} y2={120} stroke={C.line} strokeWidth={2} />
      {items.map((it, i) => (
        <g key={i}>
          <rect x={startX + i * slotW} y={90} width={slotW - 8} height={60} fill={C.band} stroke={it.w === 0 ? C.focus : C.cherryText} strokeWidth={2} />
          <T x={startX + i * slotW + (slotW - 8) / 2} y={125} s={14} f={C.crema} a="middle">{it.label}</T>
          <T x={startX + i * slotW + (slotW - 8) / 2} y={145} s={11} f={C.latte} a="middle">w={it.w}</T>
        </g>
      ))}
      <T x={300} y={185} s={13} f={C.latte} a="middle" o={a}>the deque's own order already shows</T>
      <T x={300} y={203} s={13} f={C.latte} a="middle" o={a}>non-decreasing distance — no heap needed</T>
    </Svg>
  );
}

// 6 · PredictBipartite.
export function PredictBipartite({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A five-cycle, an odd length, with the question of whether it can be two-coloured without a clash" h={330}>
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        const x = 300 + 90 * Math.cos(ang), y = 130 + 90 * Math.sin(ang);
        const nx = 300 + 90 * Math.cos(ang + (2 * Math.PI) / 5), ny = 130 + 90 * Math.sin(ang + (2 * Math.PI) / 5);
        return <line key={i} x1={x} y1={y} x2={nx} y2={ny} stroke={C.line} strokeWidth={1.5} />;
      })}
      {[0, 1, 2, 3, 4].map((i) => {
        const ang = -Math.PI / 2 + (i / 5) * Math.PI * 2;
        const x = 300 + 90 * Math.cos(ang), y = 130 + 90 * Math.sin(ang);
        return <circle key={i} cx={x} cy={y} r={13} fill={C.band} stroke={C.crema} strokeWidth={2} />;
      })}
      <T x={300} y={265} s={13} f={C.latte} a="middle" o={a}>a 5-cycle — two colours, alternating,</T>
      <T x={300} y={283} s={13} f={C.latte} a="middle" o={a}>with no two neighbours the same?</T>
      {answer !== null && <T x={300} y={305} s={14} f={C.caramel} a="middle">no — an odd cycle always clashes</T>}
    </Svg>
  );
}

// 7 · Bipartiteness: 2-colouring, and the witnessed odd cycle when it fails.
export function Bipartiteness({ t }: StepCtx) {
  const n = 5;
  const colourAt = easeOut(seg(t, 0.2, 2));
  const coloured = Math.floor(colourAt * (n + 1));
  const clashAt = easeInOut(seg(t, 2.1, 2.7));
  return (
    <Svg label="A five-cycle coloured alternately until the last edge clashes two same-coloured neighbours, the witness of an odd cycle" h={320}>
      {Array.from({ length: n }, (_, i) => {
        const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = 300 + 90 * Math.cos(ang), y = 140 + 90 * Math.sin(ang);
        const nAng = ang + (2 * Math.PI) / n;
        const nx = 300 + 90 * Math.cos(nAng), ny = 140 + 90 * Math.sin(nAng);
        const isLast = i === n - 1;
        return <line key={i} x1={x} y1={y} x2={nx} y2={ny} stroke={isLast && clashAt > 0 ? C.cherryText : C.line} strokeWidth={isLast && clashAt > 0 ? 3 : 1.5} />;
      })}
      {Array.from({ length: n }, (_, i) => {
        const ang = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x = 300 + 90 * Math.cos(ang), y = 140 + 90 * Math.sin(ang);
        const col = i < coloured ? (i % 2 === 0 ? C.focus : C.second) : C.crema;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={14} fill={C.band} stroke={col} strokeWidth={2.5} />
            <T x={x} y={y + 5} s={13} f={col} a="middle">{String(i)}</T>
          </g>
        );
      })}
      {clashAt > 0.3 ? (
        <>
          <T x={300} y={273} s={13} f={C.cherryText} a="middle">vertices 0 and 4 land the same colour —</T>
          <T x={300} y={298} s={13} f={C.cherryText} a="middle">the path between them is the odd cycle</T>
        </>
      ) : (
        <T x={300} y={275} s={13} f={C.latte} a="middle">alternating colour at each frontier step</T>
      )}
    </Svg>
  );
}

// 8 · DirectionOptimizing: top-down scanning a huge frontier vs. bottom-up scanning the rest.
export function DirectionOptimizing({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const topDownBar = easeOut(seg(t, 0.4, 1.6));
  const bottomUpBar = easeOut(seg(t, 1.0, 2.2));
  return (
    <Svg label="A bar chart contrasting the edges examined by top-down and bottom-up BFS once the frontier is a large fraction of a low-diameter graph" h={280}>
      <T x={300} y={40} s={13} f={C.latte} a="middle" o={a}>edges examined, same step, same large frontier</T>
      <T x={60} y={100} s={13} f={C.crema}>top-down</T>
      <rect x={160} y={85} width={320 * topDownBar} height={22} fill={C.cherryText} />
      <T x={60} y={150} s={13} f={C.crema}>bottom-up</T>
      <rect x={160} y={135} width={320 * 0.14 * bottomUpBar} height={22} fill={C.focus} />
      <T x={300} y={210} s={13} f={C.latte} a="middle" o={a}>the frontier scanning its own many edges</T>
      <T x={300} y={228} s={13} f={C.latte} a="middle" o={a}>vs. the rest scanning for one neighbour each</T>
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The chapter's closing frame: a frontier widening ring, handed off to a single deep path for the next topic" h={320}>
      <Edges o={0.6} />
      {Array.from({ length: RING_N }, (_, i) => <Node key={i} i={i} fill={C.crema} />)}
      <T x={300} y={290} s={13} f={C.latte} a="middle" o={a}>one frontier, every vertex once —</T>
      <T x={300} y={308} s={13} f={C.latte} a="middle" o={a}>depth-first search goes the other way next</T>
    </Svg>
  );
}
