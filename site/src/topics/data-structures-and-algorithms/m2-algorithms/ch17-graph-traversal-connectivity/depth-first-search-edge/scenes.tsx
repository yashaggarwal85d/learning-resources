import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 17): crema = an unvisited vertex; latte = secondary labels (discovery and finish
// times); taupe = a vertex already finished; caramel = the thing to look at this beat (the current path, the edge being
// classified); cinnamon (rare) = the forward edge, a second kind beside the tree; cherryText = the bad outcome (a back
// edge closing a cycle, a stack overflow). Every printed number is examples.py's: DIRECTED_ADJ 0→1, 0→3, 1→2, 2→0, 4→1
// with disc = [0, 1, 2, 5, 8] and fin = [7, 4, 3, 6, 9]; FORWARD_ADJ's chain 0→1→2→3 with the shortcut 0→3; the
// undirected triangle 0-1-2 with 1-3; the 50,000-long chain against a 1,000 recursion limit. Traces run here by the
// same loop examples.py uses.

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
const easeIn = (x: number) => x * x;

/** A directed edge between two vertex centres, trimmed to the circles, with its own arrowhead; drawn in up to fraction p. */
function Arrow({ from, to, stroke = C.line, w = 1.5, p = 1, dash, bend = 0, o = 1 }: { from: P; to: P; stroke?: string; w?: number; p?: number; dash?: string; bend?: number; o?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  const cx = (x1 + x2) / 2 + nx * bend, cy = (y1 + y2) / 2 + ny * bend;
  // Trim both ends by the vertex radius along the curve's end tangents.
  const t1x = cx - x1, t1y = cy - y1, l1 = Math.hypot(t1x, t1y) || 1;
  const t2x = x2 - cx, t2y = y2 - cy, l2 = Math.hypot(t2x, t2y) || 1;
  const sx = x1 + (t1x / l1) * 16, sy = y1 + (t1y / l1) * 16;
  const ex = x2 - (t2x / l2) * 18, ey = y2 - (t2y / l2) * 18;
  const q = clamp(p, 0, 1);
  // Point on the quadratic at q, and the tangent there, for a partly drawn edge.
  const bx = (1 - q) * (1 - q) * sx + 2 * (1 - q) * q * cx + q * q * ex;
  const by = (1 - q) * (1 - q) * sy + 2 * (1 - q) * q * cy + q * q * ey;
  const tx = 2 * (1 - q) * (cx - sx) + 2 * q * (ex - cx), ty = 2 * (1 - q) * (cy - sy) + 2 * q * (ey - cy);
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl, uy = ty / tl;
  const mx = lerp(sx, cx, q), my = lerp(sy, cy, q);
  if (q <= 0) return null;
  return (
    <g opacity={o}>
      <path d={`M${sx} ${sy} Q${mx} ${my} ${bx} ${by}`} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} />
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

// examples.py's DIRECTED_ADJ.
const ADJ: Record<number, number[]> = { 0: [1, 3], 1: [2], 2: [0], 3: [], 4: [1] };
const POS: Record<number, P> = { 0: [140, 60], 1: [260, 60], 2: [200, 140], 3: [60, 140], 4: [380, 60] };
const EDGES: [number, number][] = [[0, 1], [0, 3], [1, 2], [2, 0], [4, 1]];

type Ev = { kind: 'disc' | 'fin'; u: number; clock: number } | { kind: 'edge'; u: number; v: number; type: string; clock: number };
/** examples.py's dfs_classify on DIRECTED_ADJ: every discovery, finish and classified edge, in order. */
function dfsEvents() {
  const color: number[] = [0, 0, 0, 0, 0];
  const disc: number[] = [-1, -1, -1, -1, -1];
  const fin: number[] = [-1, -1, -1, -1, -1];
  const ev: Ev[] = [];
  let clock = 0;
  const visit = (u: number) => {
    color[u] = 1;
    disc[u] = clock;
    ev.push({ kind: 'disc', u, clock });
    clock++;
    for (const v of ADJ[u]) {
      if (color[v] === 0) {
        ev.push({ kind: 'edge', u, v, type: 'tree', clock });
        visit(v);
      } else if (color[v] === 1) ev.push({ kind: 'edge', u, v, type: 'back', clock });
      else ev.push({ kind: 'edge', u, v, type: disc[u] < disc[v] ? 'forward' : 'cross', clock });
    }
    color[u] = 2;
    fin[u] = clock;
    ev.push({ kind: 'fin', u, clock });
    clock++;
  };
  for (let s = 0; s < 5; s++) if (color[s] === 0) visit(s);
  return { ev, disc, fin };
}
const DFS = dfsEvents();

// 1 · Opening. A small tree: first the widening frontier lights it level by level, then fades; then one path drives
// straight down to the bottom before anything beside it is touched.
const TREE: P[] = [[300, 34], [200, 88], [400, 88], [150, 142], [250, 142], [350, 142], [450, 142], [125, 196], [175, 196]];
const TPAR = [-1, 0, 0, 1, 1, 2, 2, 3, 3];
const TLEVEL = [0, 1, 1, 2, 2, 2, 2, 3, 3];
const DEEP = [0, 1, 3, 7];
export function Opening({ t }: StepCtx) {
  const wide = easeInOut(seg(t, 0.2, 1.3)) * 4;
  const wideFade = 1 - easeOut(seg(t, 1.4, 1.8));
  const deep = easeInOut(seg(t, 1.9, 3.1));
  const a = easeOut(seg(t, 0.2, 0.7));
  const b = easeOut(seg(t, 1.9, 2.4));
  const deepIdx = deep * (DEEP.length - 1);
  return (
    <Svg label="A small tree. First a widening frontier lights it level by level and fades; then one path drives straight down to the bottom before anything beside it is touched" h={290}>
      {TREE.map((p, i) => (TPAR[i] < 0 ? null : <line key={i} x1={TREE[TPAR[i]][0]} y1={TREE[TPAR[i]][1]} x2={p[0]} y2={p[1]} stroke={C.line} strokeWidth={1.5} />))}
      {DEEP.slice(1).map((v, k) => {
        const f = clamp(deepIdx - k, 0, 1);
        const [x1, y1] = TREE[DEEP[k]];
        return f > 0 ? <line key={v} x1={x1} y1={y1} x2={lerp(x1, TREE[v][0], f)} y2={lerp(y1, TREE[v][1], f)} stroke={C.caramel} strokeWidth={3} /> : null;
      })}
      {TREE.map((p, i) => {
        const lit = TLEVEL[i] < wide ? wideFade : 0;
        const onDeep = deep > 0 && DEEP.indexOf(i) >= 0 && DEEP.indexOf(i) <= deepIdx + 0.01;
        return <circle key={i} cx={p[0]} cy={p[1]} r={11} fill={onDeep ? C.caramel : C.band} stroke={onDeep ? C.caramel : lit > 0 ? C.crema : C.latte} strokeWidth={2} opacity={1} />;
      })}
      {TREE.map((p, i) => {
        const lit = TLEVEL[i] < wide ? wideFade : 0;
        return lit > 0 ? <circle key={`w${i}`} cx={p[0]} cy={p[1]} r={11} fill={C.crema} opacity={lit} /> : null;
      })}
      {deep === 0 ? (
        <T x={300} y={248} s={13} f={C.latte} a="middle" o={a * wideFade}>wide: the fewest steps, level by level</T>
      ) : (
        <T x={300} y={248} s={13} f={C.caramel} a="middle" o={b}>deep: one path as far as it goes, first</T>
      )}
    </Svg>
  );
}

// 2 · PredictBackEdge. The current path 0 → 1 → 2 glows, 2 is the vertex being explored, and its edge back to 0 pulses.
// After answering: the edge turns red, a back edge, and the loop 0 → 1 → 2 → 0 is the cycle it closes.
export function PredictBackEdge({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const path = easeInOut(seg(t, 0.2, 1.2));
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const red = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const loop = answered ? easeOut(seg(s, 0.8, 1.4)) : 0;
  return (
    <Svg label="The current path 0 to 1 to 2 glows, with 2 being explored and its edge back up to 0 pulsing. After answering: the edge turns red, a back edge, closing the cycle 0, 1, 2, 0" h={250}>
      <Arrow from={POS[0]} to={POS[3]} />
      <Arrow from={POS[4]} to={POS[1]} />
      <Arrow from={POS[0]} to={POS[1]} stroke={C.line} />
      <Arrow from={POS[1]} to={POS[2]} stroke={C.line} />
      <Arrow from={POS[0]} to={POS[1]} stroke={answered && loop > 0 ? C.cherryText : C.caramel} w={2.5} p={clamp(path * 2, 0, 1)} />
      <Arrow from={POS[1]} to={POS[2]} stroke={answered && loop > 0 ? C.cherryText : C.caramel} w={2.5} p={clamp(path * 2 - 1, 0, 1)} />
      <Arrow from={POS[2]} to={POS[0]} stroke={answered ? C.cherryText : C.caramel} w={answered ? 3 : 2} dash={answered ? undefined : '5 4'} o={answered ? 1 : path >= 1 ? pulse : 0} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Vertex key={i} at={POS[i]} label={String(i)} stroke={i === 2 && path >= 1 ? C.caramel : i <= 1 ? C.caramel : C.latte} w={i === 2 && path >= 1 ? 3.5 : 2} />
      ))}
      <T x={200} y={30} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.9))}>the current path</T>
      {!answered && <T x={300} y={214} s={13} f={C.crema} a="middle">2 → 0, up to an ancestor: which kind?</T>}
      {answered && <T x={300} y={214} s={14} f={C.cherryText} a="middle" o={red}>a back edge: 0 → 1 → 2 → 0 is a cycle</T>}
    </Svg>
  );
}

// 3 · DFSMechanism. examples.py's dfs_classify on DIRECTED_ADJ, one clock tick at a time: each vertex's bar opens at
// its discovery time and closes at its finish. 2 nests in 1, 1 in 0, 3 in 0 beside 1; 4 stands apart.
const TICK = 0.38;
const TX = (k: number) => 110 + k * 48;
export function DFSMechanism({ t }: StepCtx) {
  const clock = (t - 0.3) / TICK; // continuous clock position
  const end = easeOut(seg(t, 4.3, 4.8));
  const state = (u: number) => (DFS.fin[u] <= clock ? 'done' : DFS.disc[u] <= clock ? 'open' : 'white');
  const edgeShown = (u: number, v: number) => {
    const e = DFS.ev.find((x) => x.kind === 'edge' && x.u === u && x.v === v);
    return e ? clamp(clock - e.clock + 1, 0, 1) : 0;
  };
  const edgeType = (u: number, v: number) => (DFS.ev.find((x) => x.kind === 'edge' && x.u === u && x.v === v) as { type: string } | undefined)?.type;
  const ROWY = (u: number) => 198 + u * 17;
  return (
    <Svg label="Depth-first search on the five-vertex graph, one clock tick at a time: each vertex's bar opens at its discovery time and closes at its finish time. Vertex 2's bar nests inside 1's, 1's inside 0's, 3's inside 0's beside 1's, and 4's stands apart" h={300}>
      {EDGES.map(([u, v]) => {
        const ty = edgeType(u, v);
        const p = edgeShown(u, v);
        return (
          <g key={`${u}${v}`}>
            <Arrow from={POS[u]} to={POS[v]} />
            {ty === 'tree' && <Arrow from={POS[u]} to={POS[v]} stroke={C.crema} w={2.5} p={p} />}
          </g>
        );
      })}
      {[0, 1, 2, 3, 4].map((u) => {
        const st = state(u);
        return <Vertex key={u} at={POS[u]} label={String(u)} stroke={st === 'open' ? C.caramel : st === 'done' ? C.taupe : C.mocha} text={st === 'white' ? C.taupe : st === 'open' ? C.caramel : C.latte} w={st === 'open' ? 3 : 2} />;
      })}
      <line x1={TX(0) - 10} y1={186} x2={TX(9) + 10} y2={186} stroke={C.line} />
      {Array.from({ length: 10 }, (_, k) => (
        <T key={k} x={TX(k)} y={180} s={12} f={k <= clock ? C.crema : C.taupe} a="middle">{String(k)}</T>
      ))}
      {[0, 1, 2, 3, 4].map((u) => {
        const d = DFS.disc[u], f = DFS.fin[u];
        if (clock < d) return null;
        const right = Math.min(clock, f);
        const closed = clock >= f;
        const nested = end > 0 && (u === 0 || u === 1 || u === 2);
        const col = nested ? C.caramel : closed ? C.latte : C.caramel;
        return (
          <g key={u}>
            <T x={40} y={ROWY(u) + 5} s={12} f={C.latte}>{String(u)}</T>
            <rect x={TX(d)} y={ROWY(u) - 4} width={Math.max(2, (right - d) * 48)} height={8} fill={col} opacity={closed && !nested ? 0.7 : 1} />
          </g>
        );
      })}
      <T x={300} y={293} s={13} f={C.caramel} a="middle" o={end}>nested or apart, never partly overlapping</T>
    </Svg>
  );
}

// 4 · EdgeTypes. The same graph, the four kinds lit one by one: tree edges (0 → 1, 1 → 2, 0 → 3); the back edge
// 2 → 0; a forward edge, shown on examples.py's FORWARD_ADJ chain as the shortcut 0 → 3; the cross edge 4 → 1. Then
// each vertex's discovery/finish pair, the only thing the test reads.
const FPOS: Record<number, P> = { 0: [480, 36], 1: [480, 88], 2: [480, 140], 3: [480, 192] };
export function EdgeTypes({ t }: StepCtx) {
  const tree = easeOut(seg(t, 0.3, 1.0));
  const back = easeOut(seg(t, 1.1, 1.8));
  const fwd = easeOut(seg(t, 1.9, 2.7));
  const cross = easeOut(seg(t, 2.8, 3.5));
  const nums = easeOut(seg(t, 3.6, 4.2));
  const chips: [string, string, number][] = [['tree', C.crema, tree], ['back', C.cherryText, back], ['forward', C.cinnamon, fwd], ['cross', C.latte, cross]];
  return (
    <Svg label="The five-vertex graph with its edges lit kind by kind: tree edges, the back edge 2 to 0, a forward edge shown on a separate chain as the shortcut 0 to 3, and the cross edge 4 to 1. Then each vertex's discovery and finish times appear beside it" h={290}>
      <Arrow from={POS[0]} to={POS[1]} stroke={tree > 0 ? C.crema : C.line} w={tree > 0 ? 2.5 : 1.5} />
      <Arrow from={POS[1]} to={POS[2]} stroke={tree > 0 ? C.crema : C.line} w={tree > 0 ? 2.5 : 1.5} />
      <Arrow from={POS[0]} to={POS[3]} stroke={tree > 0 ? C.crema : C.line} w={tree > 0 ? 2.5 : 1.5} />
      <Arrow from={POS[2]} to={POS[0]} stroke={back > 0 ? C.cherryText : C.line} w={back > 0 ? 2.5 : 1.5} />
      <Arrow from={POS[4]} to={POS[1]} stroke={cross > 0 ? C.latte : C.line} w={cross > 0 ? 2.5 : 1.5} dash={cross > 0 ? '6 4' : undefined} />
      {[0, 1, 2, 3, 4].map((u) => (
        <Vertex key={u} at={POS[u]} label={String(u)} />
      ))}
      <g opacity={nums}>
        {[0, 1, 2, 3, 4].map((u) => {
          const [x, y] = POS[u];
          const below = y > 100;
          return <T key={u} x={x} y={below ? y + 34 : y - 24} s={12} f={C.caramel} a="middle">{`${DFS.disc[u]}/${DFS.fin[u]}`}</T>;
        })}
      </g>
      <g opacity={0.35 + 0.65 * fwd}>
        <Arrow from={FPOS[0]} to={FPOS[1]} stroke={C.crema} />
        <Arrow from={FPOS[1]} to={FPOS[2]} stroke={C.crema} />
        <Arrow from={FPOS[2]} to={FPOS[3]} stroke={C.crema} />
        <Arrow from={FPOS[0]} to={FPOS[3]} stroke={fwd > 0 ? C.cinnamon : C.line} w={fwd > 0 ? 2.5 : 1.5} bend={-50} p={fwd > 0 ? fwd : 1} />
        {[0, 1, 2, 3].map((u) => (
          <Vertex key={u} at={FPOS[u]} label={String(u)} />
        ))}
      </g>
      {chips.map(([name, col, v], i) => (
        <g key={name} opacity={0.3 + 0.7 * v}>
          <rect x={60 + i * 125} y={228} width={105} height={26} rx={13} fill="none" stroke={v > 0 ? col : C.line} strokeWidth={1.5} />
          <T x={112 + i * 125} y={246} s={12} f={v > 0 ? col : C.taupe} a="middle">{name}</T>
        </g>
      ))}
      <T x={300} y={282} s={12} f={C.latte} a="middle" o={nums}>two numbers per vertex decide all four</T>
    </Svg>
  );
}

// examples.py's UNDIRECTED_ADJ: the triangle 0-1-2 and the pendant 1-3.
const UPOS: Record<number, P> = { 0: [200, 50], 1: [300, 140], 2: [100, 140], 3: [440, 140] };
const UEDGES: [number, number][] = [[0, 1], [1, 2], [2, 0], [1, 3]];
function ULine({ a, b, stroke = C.line, w = 1.5, p = 1, dash }: { a: number; b: number; stroke?: string; w?: number; p?: number; dash?: string }) {
  const [x1, y1] = UPOS[a];
  const [x2, y2] = UPOS[b];
  return <line x1={x1} y1={y1} x2={lerp(x1, x2, clamp(p, 0, 1))} y2={lerp(y1, y2, clamp(p, 0, 1))} stroke={stroke} strokeWidth={w} strokeDasharray={dash} />;
}

// 5 · PredictUndirectedEdges. The undirected DFS from 0 walks 0-1, then 1-2, as tree edges; at 2 the edge to 0 pulses.
// After answering: 2-0 is a back edge, 1-3 a tree edge, and nothing else ever appears.
export function PredictUndirectedEdges({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const e1 = easeInOut(seg(t, 0.2, 0.8));
  const e2 = easeInOut(seg(t, 0.8, 1.4));
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const back = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const pend = answered ? easeInOut(seg(s, 0.7, 1.3)) : 0;
  const cap = answered ? easeOut(seg(s, 1.2, 1.7)) : 0;
  return (
    <Svg label="An undirected triangle 0, 1, 2 with 3 hanging off 1. The search from 0 walks 0 to 1 and 1 to 2 as tree edges; at 2, the edge to 0 pulses. After answering: 2 to 0 is a back edge, 1 to 3 a tree edge, and nothing else appears" h={250}>
      {UEDGES.map(([a, b]) => <ULine key={`${a}${b}`} a={a} b={b} />)}
      <ULine a={0} b={1} stroke={C.crema} w={2.5} p={e1} />
      <ULine a={1} b={2} stroke={C.crema} w={2.5} p={e2} />
      <ULine a={2} b={0} stroke={answered ? C.cherryText : C.caramel} w={answered ? 3 : 2} dash={answered ? undefined : '5 4'} p={1} />
      {answered && <ULine a={1} b={3} stroke={C.crema} w={2.5} p={pend} />}
      {[0, 1, 2, 3].map((u) => (
        <Vertex key={u} at={UPOS[u]} label={String(u)} stroke={u === 2 && e2 >= 1 && !answered ? C.caramel : C.latte} w={u === 2 && e2 >= 1 ? 3 : 2} o={u === 2 && e2 >= 1 && !answered ? 0.6 + 0.4 * pulse : 1} />
      ))}
      {answered && <T x={150} y={88} s={12} f={C.cherryText} a="end" o={back}>back</T>}
      {!answered && <T x={300} y={214} s={13} f={C.crema} a="middle">every edge, seen from both ends: forward or cross?</T>}
      {answered && <T x={300} y={214} s={14} f={C.caramel} a="middle" o={cap}>only tree and back, ever</T>}
    </Svg>
  );
}

// 6 · CycleDetection. Left, directed: the path 0 → 1 → 2 is grey (on the stack), and 2's edge reaches 0 while 0 is
// still grey: a cycle. Right, undirected: the search reaches 2 from 1, sees 0 already visited and not its parent:
// a cycle, with no colours needed.
const LPOS: Record<number, P> = { 0: [70, 60], 1: [210, 60], 2: [140, 150] };
const RPOS: Record<number, P> = { 0: [390, 60], 1: [530, 60], 2: [460, 150] };
export function CycleDetection({ t }: StepCtx) {
  const lp = easeInOut(seg(t, 0.3, 1.2));
  const lhit = easeOut(seg(t, 1.3, 1.8));
  const rp = easeInOut(seg(t, 2.0, 2.8));
  const rhit = easeOut(seg(t, 2.9, 3.4));
  const cap = easeOut(seg(t, 3.6, 4.1));
  return (
    <Svg label="Left, a directed triangle: the path 0 to 1 to 2 is on the stack, and 2's edge reaches 0 while 0 is still on it, a cycle. Right, an undirected triangle: the search reaches 2 from 1, finds 0 already visited and not its parent, a cycle" h={290}>
      <T x={140} y={22} s={12} f={C.latte} a="middle">directed</T>
      <T x={460} y={22} s={12} f={C.latte} a="middle">undirected</T>
      <line x1={300} y1={30} x2={300} y2={200} stroke={C.line} />
      <Arrow from={LPOS[0]} to={LPOS[1]} />
      <Arrow from={LPOS[1]} to={LPOS[2]} />
      <Arrow from={LPOS[0]} to={LPOS[1]} stroke={C.caramel} w={2.5} p={clamp(lp * 2, 0, 1)} />
      <Arrow from={LPOS[1]} to={LPOS[2]} stroke={C.caramel} w={2.5} p={clamp(lp * 2 - 1, 0, 1)} />
      <Arrow from={LPOS[2]} to={LPOS[0]} stroke={lhit > 0 ? C.cherryText : C.line} w={lhit > 0 ? 3 : 1.5} p={lhit > 0 ? lhit : 1} />
      {[0, 1, 2].map((u) => (
        <Vertex key={u} at={LPOS[u]} label={String(u)} stroke={lp * 2 >= u ? C.caramel : C.latte} />
      ))}
      <T x={140} y={194} s={12} f={C.cherryText} a="middle" o={lhit}>0 still on the path</T>
      {[[0, 1], [1, 2], [2, 0]].map(([a, b]) => (
        <line key={`${a}${b}`} x1={RPOS[a][0]} y1={RPOS[a][1]} x2={RPOS[b][0]} y2={RPOS[b][1]} stroke={a === 2 && rhit > 0 ? C.cherryText : C.line} strokeWidth={a === 2 && rhit > 0 ? 3 : 1.5} />
      ))}
      <line x1={RPOS[0][0]} y1={RPOS[0][1]} x2={lerp(RPOS[0][0], RPOS[1][0], clamp(rp * 2, 0, 1))} y2={RPOS[0][1]} stroke={C.crema} strokeWidth={2.5} />
      <line x1={RPOS[1][0]} y1={RPOS[1][1]} x2={lerp(RPOS[1][0], RPOS[2][0], clamp(rp * 2 - 1, 0, 1))} y2={lerp(RPOS[1][1], RPOS[2][1], clamp(rp * 2 - 1, 0, 1))} stroke={C.crema} strokeWidth={2.5} opacity={rp > 0.5 ? 1 : 0} />
      {[0, 1, 2].map((u) => (
        <Vertex key={u} at={RPOS[u]} label={String(u)} stroke={rp * 2 >= u ? C.crema : C.latte} />
      ))}
      <T x={460} y={194} s={12} f={C.cherryText} a="middle" o={rhit}>0 seen, not the parent</T>
      <T x={300} y={252} s={13} f={C.caramel} a="middle" o={cap}>no cross edges, so no colours needed</T>
    </Svg>
  );
}

// 7 · IterativeDFS. Left: the recursive search down examples.py's 50,000-long chain; call frames stack up to the
// 1,000 recursion limit and the stack breaks: RecursionError. Right: the explicit stack of (vertex, iterator) pairs
// walks the identical chain to its end: all 50,000 visited.
export function IterativeDFS({ t }: StepCtx) {
  const grow = easeIn(seg(t, 0.3, 1.6));
  const crash = easeOut(seg(t, 1.6, 2.0));
  const walk = easeInOut(seg(t, 2.2, 3.8));
  const done = easeOut(seg(t, 3.8, 4.2));
  const FR = 14; // frames drawn
  const shown = Math.floor(grow * FR);
  const LIMY = 50;
  return (
    <Svg label="Left: the recursive search on a 50,000-long chain; call frames stack up to the 1,000 recursion limit and break, RecursionError. Right: an explicit stack of vertex and iterator pairs walks the same chain to its end, all 50,000 visited" h={290}>
      <T x={150} y={24} s={12} f={C.latte} a="middle">recursive: the call stack</T>
      <line x1={60} y1={LIMY} x2={240} y2={LIMY} stroke={C.cherryText} strokeDasharray="5 4" />
      <T x={150} y={LIMY - 6} s={12} f={C.cherryText} a="middle">limit 1,000</T>
      {Array.from({ length: shown }, (_, i) => {
        const y = 210 - i * 11.5;
        const jitter = crash > 0 ? Math.sin(i * 2.3) * 8 * crash : 0;
        return <rect key={i} x={90 + jitter} y={y} width={120} height={9} fill={crash > 0 ? C.cherryText : C.crema} opacity={crash > 0 ? 1 - 0.5 * crash : 1} />;
      })}
      <T x={150} y={242} s={13} f={C.cherryText} a="middle" o={crash}>RecursionError</T>
      <line x1={300} y1={30} x2={300} y2={250} stroke={C.line} />
      <T x={450} y={24} s={12} f={C.latte} a="middle">explicit stack: (vertex, iterator)</T>
      {[0, 1, 2].map((k) => (
        <g key={k} opacity={walk > 0 && walk < 1 ? 1 : 0.4}>
          <rect x={390} y={150 - k * 28} width={120} height={22} rx={3} fill={C.band} stroke={k === 2 ? C.caramel : C.latte} />
          <T x={450} y={166 - k * 28} s={12} f={C.crema} a="middle">(v, iter)</T>
        </g>
      ))}
      <rect x={340} y={196} width={220} height={10} fill={C.band} />
      <rect x={340} y={196} width={220 * walk} height={10} fill={C.caramel} />
      <T x={340} y={224} s={12} f={C.latte}>the 50,000-long chain</T>
      <T x={450} y={248} s={13} f={C.caramel} a="middle" o={done}>all 50,000 visited</T>
    </Svg>
  );
}

// 8 · Recap. examples.py's ACYCLIC_ADJ: 0 → 1 → 2 and 0 → 3. The search finishes 2, 1, 3, 0 — each drops into a row as
// it finishes — and the row read backwards, 0 3 1 2, has every edge pointing forward.
const APOS: Record<number, P> = { 0: [200, 60], 1: [320, 60], 2: [440, 60], 3: [260, 140] };
const FIN_ORDER = [2, 1, 3, 0];
export function Recap({ t }: StepCtx) {
  const drops = FIN_ORDER.map((_, k) => easeOut(seg(t, 0.4 + k * 0.4, 0.75 + k * 0.4)));
  const flip = easeInOut(seg(t, 2.2, 3.0));
  const arrows = easeOut(seg(t, 3.0, 3.5));
  const SLOT = (k: number) => 210 + k * 60;
  return (
    <Svg label="A graph with no cycle: 0 to 1 to 2, and 0 to 3. The search finishes 2, then 1, then 3, then 0, each dropping into a row; the row reversed, 0, 3, 1, 2, has every dependency before what needs it" h={290}>
      <Arrow from={APOS[0]} to={APOS[1]} />
      <Arrow from={APOS[1]} to={APOS[2]} />
      <Arrow from={APOS[0]} to={APOS[3]} />
      {[0, 1, 2, 3].map((u) => {
        const k = FIN_ORDER.indexOf(u);
        return <Vertex key={u} at={APOS[u]} label={String(u)} stroke={drops[k] > 0.5 ? C.taupe : C.latte} text={drops[k] > 0.5 ? C.latte : C.crema} />;
      })}
      <T x={60} y={213} s={12} f={C.latte} o={1 - flip}>finished</T>
      <T x={60} y={213} s={12} f={C.caramel} o={flip}>reversed</T>
      {FIN_ORDER.map((u, k) => {
        const [vx, vy] = APOS[u];
        const target = lerp(SLOT(k), SLOT(3 - k), flip);
        const x = lerp(vx, target, drops[k]);
        const y = lerp(vy, 208, drops[k]) + Math.sin(flip * Math.PI) * (k % 2 === 0 ? -18 : 18);
        return drops[k] > 0 ? <Vertex key={u} at={[x, y]} label={String(u)} stroke={flip > 0.5 ? C.caramel : C.crema} /> : null;
      })}
      <g opacity={arrows}>
        {[[0, 3], [0, 1], [1, 2]].map(([a, b]) => {
          const pos = [0, 3, 1, 2];
          const xa = SLOT(pos.indexOf(a)), xb = SLOT(pos.indexOf(b));
          return <path key={`${a}${b}`} d={`M${xa} 226 Q${(xa + xb) / 2} ${246 + (xb - xa) / 6} ${xb - 4} 226`} fill="none" stroke={C.caramel} strokeWidth={1.3} />;
        })}
      </g>
      <T x={300} y={282} s={13} f={C.caramel} a="middle" o={arrows}>every edge points forward: nothing early</T>
    </Svg>
  );
}
