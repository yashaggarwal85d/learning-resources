import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's own, shared with topic 69): crema = a vertex, and a matched pair; latte =
// secondary labels; taupe = an edge not in the matching; caramel = the thing to look at (the chain being flipped, the
// search's frontier, the cover); cinnamon (rare) = the alternative being compared (one search at a time against
// Hopcroft-Karp's phases); cherryText = the bad outcome (a task no matching reaches, the competing pair). A matched edge
// is drawn thick, an unmatched one thin.
//
// Every printed number and pair is examples.py's: the task-machine graph t1: m1, m2; t2: m1; t3: m2, m3; t4: m3, m4
// (7 edges); the greedy scan's t1-m1, t3-m2, t4-m3 with t2 free; the chain t2 m1 t1 m2 t3 m3 t4 m4 and the 4-matching
// it flips to; one-at-a-time's four searches; Hopcroft-Karp's phases on this graph, 3 chains then 1 (the same loop as
// examples.py, run here); the cover of every task; the Hall graph t1: m1; t2: m1; t3: m2, m3 with matching 2 and cover
// m1, t3. The 1,000 + 1,000 random graph's counts depend on its seed, so they are drawn as lengths, not printed.

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

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

type P = readonly [number, number];
type G = Record<string, string[]>;
type M = Record<string, string>; // task -> machine
const TM: G = { t1: ['m1', 'm2'], t2: ['m1'], t3: ['m2', 'm3'], t4: ['m3', 'm4'] };
const HALL: G = { t1: ['m1'], t2: ['m1'], t3: ['m2', 'm3'] };
const LX = 170, RX = 430;
const ROW = (i: number) => 45 + i * 62;
const at = (id: string): P => [id[0] === 't' ? LX : RX, ROW(Number(id.slice(1)) - 1)];
const edgesOf = (g: G) => Object.entries(g).flatMap(([u, vs]) => vs.map((v) => [u, v] as const));
const lefts = (g: G) => Object.keys(g);
const rights = (g: G) => Array.from(new Set(Object.values(g).flat())).sort();

/** examples.py's greedy scan: each task in order takes its first free machine. */
function greedy(g: G) {
  const m: M = {};
  const taken = new Set<string>();
  for (const u of lefts(g))
    for (const v of g[u])
      if (!taken.has(v)) {
        m[u] = v;
        taken.add(v);
        break;
      }
  return m;
}
/** examples.py's find_alternating_path: breadth-first from one free task, returns the alternating vertex chain. */
function chainFrom(g: G, start: string, m: M) {
  const byR: Record<string, string> = Object.fromEntries(Object.entries(m).map(([u, v]) => [v, u]));
  const parent: Record<string, string | null> = { [start]: null };
  const q = [start];
  while (q.length) {
    const u = q.shift()!;
    if (u[0] === 't') {
      for (const v of g[u])
        if (!(v in parent)) {
          parent[v] = u;
          if (!(v in byR)) {
            const path = [v];
            while (parent[path[path.length - 1]] !== null) path.push(parent[path[path.length - 1]]!);
            return path.reverse();
          }
          q.push(v);
        }
    } else {
      const w = byR[u];
      if (!(w in parent)) {
        parent[w] = u;
        q.push(w);
      }
    }
  }
  return null;
}
function flip(m: M, path: string[]): M {
  const n = { ...m };
  for (let i = 0; i + 1 < path.length; i += 2) n[path[i]] = path[i + 1];
  return n;
}
/** examples.py's one_at_a_time: try each free task in order, flipping each chain found. */
function oneAtATime(g: G) {
  let m: M = {};
  const states: M[] = [m];
  const paths: string[][] = [];
  for (const u of lefts(g)) {
    if (u in m) continue;
    const p = chainFrom(g, u, m);
    if (p) {
      m = flip(m, p);
      paths.push(p);
      states.push(m);
    }
  }
  return { m, states, paths };
}
/** examples.py's hopcroft_karp: layers from every free task, then disjoint shortest chains flipped together. */
function hopcroftKarp(g: G) {
  const ml: M = {};
  const mr: Record<string, string> = {};
  const phases: { chains: string[][]; layers: Record<string, number> }[] = [];
  for (;;) {
    const dist: Record<string, number> = {};
    const q: string[] = [];
    for (const u of lefts(g)) if (!(u in ml)) (dist[u] = 0), q.push(u);
    let found = false;
    while (q.length) {
      const u = q.shift()!;
      for (const v of g[u]) {
        const w = mr[v];
        if (w === undefined) found = true;
        else if (!(w in dist)) (dist[w] = dist[u] + 1), q.push(w);
      }
    }
    if (!found) break;
    const layers = { ...dist };
    const chains: string[][] = [];
    const dfs = (u: string): string[] | null => {
      for (const v of g[u]) {
        const w = mr[v];
        if (w === undefined) {
          ml[u] = v;
          mr[v] = u;
          return [u, v];
        }
        if (w in dist && dist[w] === dist[u] + 1) {
          const rest = dfs(w);
          if (rest) {
            ml[u] = v;
            mr[v] = u;
            return [u, v, ...rest];
          }
        }
      }
      dist[u] = -1;
      return null;
    };
    for (const u of lefts(g))
      if (!(u in ml)) {
        const c = dfs(u);
        if (c) chains.push(c);
      }
    phases.push({ chains, layers });
  }
  return { m: { ...ml }, phases };
}
/** examples.py's konig_vertex_cover: Z = reachable from free tasks by alternating paths; cover = tasks not in Z, machines in Z. */
function konig(g: G, m: M) {
  const byR: Record<string, string> = Object.fromEntries(Object.entries(m).map(([u, v]) => [v, u]));
  const free = lefts(g).filter((u) => !(u in m));
  const zl = new Set(free), zr = new Set<string>();
  const order: string[] = [...free];
  const q = [...free];
  while (q.length) {
    const u = q.shift()!;
    for (const v of g[u])
      if (!zr.has(v)) {
        zr.add(v);
        order.push(v);
        const w = byR[v];
        if (w !== undefined && !zl.has(w)) {
          zl.add(w);
          order.push(w);
          q.push(w);
        }
      }
  }
  const cover = [...lefts(g).filter((u) => !zl.has(u)), ...rights(g).filter((v) => zr.has(v))];
  return { reached: order, cover };
}

const GREEDY = greedy(TM); // t1-m1, t3-m2, t4-m3
const CHAIN = chainFrom(TM, 't2', GREEDY)!; // t2 m1 t1 m2 t3 m3 t4 m4
const FULL = flip(GREEDY, CHAIN); // 4 pairs
const KUHN = oneAtATime(TM);
const HK = hopcroftKarp(TM); // phases of 3 chains, then 1
const TM_COVER = konig(TM, FULL);
const HALL_RUN = oneAtATime(HALL);
const HALL_COVER = konig(HALL, HALL_RUN.m);
const nPairs = (m: M) => Object.keys(m).length;

function Vtx({ id, c = C.crema, ring = 0, ringC = C.caramel }: { id: string; c?: string; ring?: number; ringC?: string }) {
  const [x, y] = at(id);
  return (
    <g>
      {ring > 0 && <circle cx={x} cy={y} r={14 + 6 * ring} fill="none" stroke={ringC} strokeWidth={1.6} opacity={ring} />}
      <circle cx={x} cy={y} r={14} fill={C.band} stroke={c} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} f={c} a="middle">{id}</T>
    </g>
  );
}
/** One task-machine edge, drawn partway if p < 1. */
function Ed({ u, v, c = C.taupe, w = 1.2, dash, p = 1, arrow = false }: { u: string; v: string; c?: string; w?: number; dash?: string; p?: number; arrow?: boolean }) {
  const [x1, y1] = at(u), [x2, y2] = at(v);
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
  const sx = x1 + ux * 16, sy = y1 + uy * 16, ex = x2 - ux * 16, ey = y2 - uy * 16;
  const q = clamp(p, 0, 1);
  if (q <= 0) return null;
  const a = Math.atan2(uy, ux);
  return (
    <g>
      <line x1={sx} y1={sy} x2={lerp(sx, ex, q)} y2={lerp(sy, ey, q)} stroke={c} strokeWidth={w} strokeDasharray={dash} />
      {arrow && q >= 1 && <path d={`M${ex + 7 * Math.cos(a + 2.6)} ${ey + 7 * Math.sin(a + 2.6)} L${ex} ${ey} L${ex + 7 * Math.cos(a - 2.6)} ${ey + 7 * Math.sin(a - 2.6)}`} fill="none" stroke={c} strokeWidth={1.4} />}
    </g>
  );
}
/** A graph with a matching: matched edges thick crema, the rest thin taupe; `style` overrides per edge or vertex. */
function Graph({ g, m, edge, vtx }: { g: G; m: M; edge?: (u: string, v: string) => Partial<{ c: string; w: number; dash: string; p: number; arrow: boolean }> | undefined; vtx?: (id: string) => Partial<{ c: string; ring: number; ringC: string }> | undefined }) {
  return (
    <g>
      {edgesOf(g).map(([u, v]) => {
        const matched = m[u] === v;
        return <Ed key={u + v} u={u} v={v} c={matched ? C.crema : C.taupe} w={matched ? 3.2 : 1.2} {...(edge?.(u, v) ?? {})} />;
      })}
      {[...lefts(g), ...rights(g)].map((id) => <Vtx key={id} id={id} {...(vtx?.(id) ?? {})} />)}
    </g>
  );
}
/** Edges of a chain, as task-machine pairs, with whether each is currently matched. */
const chainEdges = (path: string[]) => Array.from({ length: path.length - 1 }, (_, i) => (path[i][0] === 't' ? [path[i], path[i + 1]] : [path[i + 1], path[i]]) as [string, string]);

// 1 · Opening. The graph draws in; a cursor runs down the tasks: t1 takes m1, t2 reaches for m1 and finds it taken
// (red), t3 takes m2, t4 takes m3. t2 is left with nothing; m4 sits idle.
export function Opening({ t }: StepCtx) {
  const draw = easeOut(seg(t, 0.1, 0.7));
  const step = clamp(Math.floor((t - 0.9) / 0.6), -1, 4);
  const tasks = lefts(TM);
  const cap = easeOut(seg(t, 3.6, 4.0));
  const m: M = {};
  tasks.forEach((u, i) => {
    if (i <= step && GREEDY[u]) m[u] = GREEDY[u];
  });
  return (
    <Svg label="Four tasks on the left, four machines on the right, an edge where a task may run. A scan takes the tasks in order: t1 takes m1, t2 finds its only machine, m1, already taken, t3 takes m2, t4 takes m3. Task t2 is left with no machine and m4 sits idle, though all four could be placed" h={300}>
      <g opacity={draw}>
        <Graph g={TM} m={m} edge={(u, v) => (u === 't2' && step === 1 ? { c: C.cherryText, w: 2 } : undefined)} vtx={(id) => {
          if (id === 't2' && step >= 1) return { c: C.cherryText };
          if (id === 'm4' && step >= 4) return { c: C.latte, ring: 1, ringC: C.taupe };
          const i = tasks.indexOf(id);
          if (i >= 0 && i === step) return { c: C.caramel };
          return undefined;
        }} />
      </g>
      <T x={300} y={286} s={13} f={C.cherryText} a="middle" o={cap}>{`t2 has no machine; ${lefts(TM).length} could fit`}</T>
    </Svg>
  );
}

// 2 · MatchingAsFlow. The edges turn into arrows from tasks to machines; a source s appears feeding every task and a
// sink drains every machine, every edge capacity 1. Then the scan's three pairs run as three units of flow, s to sink.
export function MatchingAsFlow({ t }: StepCtx) {
  const arrows = easeOut(seg(t, 0.3, 0.8));
  const ends = easeOut(seg(t, 1.0, 1.6));
  const one = easeOut(seg(t, 1.8, 2.2));
  const flow = easeInOut(seg(t, 2.5, 3.7));
  const cap = easeOut(seg(t, 3.9, 4.3));
  const S: P = [50, 138], K: P = [550, 138];
  const pairs = Object.entries(GREEDY);
  return (
    <Svg label="Every edge becomes an arrow from task to machine; a source s feeds every task and a sink drains every machine, every edge of capacity one. The scan's three pairs then run as three units of flow from source to sink: a matching is a flow of the same value" h={300}>
      <g opacity={ends}>
        {lefts(TM).map((u) => <line key={u} x1={S[0] + 14} y1={S[1]} x2={at(u)[0] - 16} y2={at(u)[1]} stroke={C.taupe} strokeWidth={1.2} />)}
        {rights(TM).map((v) => <line key={v} x1={at(v)[0] + 16} y1={at(v)[1]} x2={K[0] - 14} y2={K[1]} stroke={C.taupe} strokeWidth={1.2} />)}
        <circle cx={S[0]} cy={S[1]} r={14} fill={C.band} stroke={C.crema} strokeWidth={1.8} />
        <T x={S[0]} y={S[1] + 5} s={13} f={C.crema} a="middle">s</T>
        <circle cx={K[0]} cy={K[1]} r={14} fill={C.band} stroke={flow >= 1 ? C.caramel : C.crema} strokeWidth={flow >= 1 ? 2.6 : 1.8} />
        <T x={K[0]} y={K[1] + 5} s={13} f={C.crema} a="middle">t</T>
      </g>
      <Graph g={TM} m={{}} edge={() => ({ arrow: arrows >= 1, c: arrows > 0 ? C.latte : C.taupe })} />
      {flow > 0 && flow < 1 && pairs.map(([u, v]) => {
        const route: P[] = [S, at(u), at(v), K];
        const x = flow * 3;
        const i = Math.min(2, Math.floor(x));
        const f = x - i;
        return <circle key={u} cx={lerp(route[i][0], route[i + 1][0], f)} cy={lerp(route[i][1], route[i + 1][1], f)} r={5} fill={C.caramel} />;
      })}
      <T x={300} y={18} s={12} f={C.latte} a="middle" o={one}>every edge: capacity 1</T>
      <T x={300} y={286} s={13} f={C.crema} a="middle" o={cap}>{`${pairs.length} pairs = a flow of ${pairs.length}`}</T>
    </Svg>
  );
}

// 3 · GreedyMatching. The scan again, pair by pair, ending at three; then a probe for one more pair: t2's only edge
// runs to a taken machine and m4 has no free task: nothing to add.
export function GreedyMatching({ t }: StepCtx) {
  const step = clamp(Math.floor((t - 0.3) / 0.55), -1, 3);
  const m: M = {};
  lefts(TM).forEach((u, i) => {
    if (i <= step && GREEDY[u]) m[u] = GREEDY[u];
  });
  const probe = easeOut(seg(t, 2.7, 3.1));
  const cap = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="The scan pairs t1 with m1, t3 with m2, t4 with m3: three pairs. A probe for a fourth: t2's only edge goes to m1, already taken, and the idle m4 has no free task: no single pair can be added, though four is possible" h={300}>
      <Graph g={TM} m={m} edge={(u) => (u === 't2' && probe > 0 ? { c: C.cherryText, w: 2, dash: '5 4' } : undefined)} vtx={(id) => (probe > 0 && (id === 't2' || id === 'm4') ? { c: C.cherryText } : undefined)} />
      {step >= 0 && <T x={40} y={286} s={13} f={C.crema}>{`matched ${nPairs(m)}`}</T>}
      <T x={560} y={286} s={13} f={C.cherryText} a="end" o={cap}>no pair to add</T>
    </Svg>
  );
}

// 4 · PredictReroute. The three pairs, t2 pulsing alone. After answering: the chain from t2 lights edge by edge across
// the existing pairs to the idle m4.
export function PredictReroute({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.5 + 0.5 * Math.sin(Math.max(0, t) * 4);
  const lit = answered ? stepIdx(s, 0.2, 1.6, 7) : -1;
  const E = chainEdges(CHAIN);
  return (
    <Svg label="The three pairs, with t2 pulsing alone. After answering: a chain lights from t2 through the existing pairs to the idle m4, one small adjustment" h={300}>
      <Graph g={TM} m={GREEDY} edge={(u, v) => {
        const i = E.findIndex(([a, b]) => a === u && b === v);
        if (i >= 0 && i <= lit) return { c: C.caramel, w: GREEDY[u] === v ? 3.2 : 2 };
        return undefined;
      }} vtx={(id) => (id === 't2' ? { c: C.cherryText, ring: answered ? 0 : pulse, ringC: C.cherryText } : undefined)} />
      {!answered && <T x={300} y={286} s={13} f={C.crema} a="middle">adjust three pairs, or start over?</T>}
      {answered && <T x={300} y={286} s={13} f={C.caramel} a="middle" o={lit >= 6 ? 1 : 0}>one chain, from t2 to m4</T>}
    </Svg>
  );
}

// 5 · ZigZagReroute. The chain t2 m1 t1 m2 t3 m3 t4 m4 lights one hop at a time, unmatched hops dashed, matched hops
// thick; then every hop flips together: the dashed become pairs, the pairs let go, and all four tasks are matched.
export function ZigZagReroute({ t }: StepCtx) {
  const E = chainEdges(CHAIN);
  const lit = stepIdx(t, 0.3, 2.4, 7);
  const fl = easeInOut(seg(t, 2.7, 3.4));
  const cap = easeOut(seg(t, 3.6, 4.0));
  const m = fl >= 1 ? FULL : GREEDY;
  return (
    <Svg label="The chain from t2 lights hop by hop: t2 to m1, held by t1; t1 to m2, held by t3; t3 to m3, held by t4; t4 to the idle m4. Then every hop flips at once: t2 takes m1, t1 takes m2, t3 takes m3, t4 takes m4, all four matched" h={300}>
      <Graph g={TM} m={m} edge={(u, v) => {
        const i = E.findIndex(([a, b]) => a === u && b === v);
        if (i < 0 || i > lit) return undefined;
        const was = GREEDY[u] === v;
        if (fl > 0 && fl < 1) return { c: C.caramel, w: was ? lerp(3.2, 1.2, fl) : lerp(1.6, 3.2, fl) };
        if (fl >= 1) return { c: C.caramel, w: was ? 1.2 : 3.2, dash: was ? '5 4' : undefined };
        return { c: C.caramel, w: was ? 3.2 : 1.6, dash: was ? undefined : '5 4' };
      }} vtx={(id) => (id === 't2' && fl < 1 ? { c: C.cherryText } : undefined)} />
      <T x={300} y={286} s={13} f={C.caramel} a="middle" o={cap}>{`flip the chain: ${nPairs(FULL)} matched`}</T>
    </Svg>
  );
}

// 6 · BergeLemma. Left half of the beat: the three-pair matching with its chain lit, so not yet maximum. Then the
// four-pair matching: a search for a free task finds none, no chain anywhere, so it is maximum, by the flow theorem.
export function BergeLemma({ t }: StepCtx) {
  const E = chainEdges(CHAIN);
  const phase2 = t >= 2.2;
  const chain = easeOut(seg(t, 0.4, 1.0));
  const look = easeOut(seg(t, 2.5, 3.0));
  const cap = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="First, the three-pair matching with its chain from t2 to m4 lit: a chain exists, so it is not yet maximum. Then the four-pair matching: a search for a free task finds none, no chain exists anywhere, so the matching is maximum, which follows from the flow theorem" h={300}>
      <Graph g={TM} m={phase2 ? FULL : GREEDY} edge={(u, v) => (!phase2 && chain > 0 && E.some(([a, b]) => a === u && b === v) ? { c: C.caramel, w: GREEDY[u] === v ? 3.2 : 1.6 } : undefined)}
        vtx={(id) => (phase2 && look > 0 && id[0] === 't' ? { ring: look, ringC: C.taupe } : undefined)} />
      {!phase2 && <T x={300} y={286} s={13} f={C.cherryText} a="middle" o={chain}>a chain exists: not maximum</T>}
      {phase2 && <T x={300} y={286} s={13} f={C.caramel} a="middle" o={cap}>no free task, no chain: maximum</T>}
    </Svg>
  );
}

// 7 · OneAtATime. Starting empty, one search per task: each search sweeps every edge (they flash), then its chain
// flips. Four searches, the count ticking 1 to 4; each costs the edge count, 7.
export function OneAtATime({ t }: StepCtx) {
  const per = 0.85;
  const i = clamp(Math.floor((t - 0.3) / per), -1, KUHN.paths.length);
  const local = (t - 0.3) / per - i;
  const sweep = i >= 0 && i < KUHN.paths.length ? seg(local, 0, 0.55) : 0;
  const m = i < 0 ? {} : KUHN.states[Math.min(i + (local >= 0.7 ? 1 : 0), KUHN.states.length - 1)];
  const nE = edgesOf(TM).length;
  const cap = easeOut(seg(t, 3.7, 4.0));
  return (
    <Svg label="Starting from no pairs, one search per task. Each search sweeps every edge, then flips the chain it finds: t1 takes m1; t2 takes m1 as t1 moves to m2; t3 takes m3; t4 takes m4. Four searches, each as costly as the seven edges: tasks times edges" h={300}>
      <Graph g={TM} m={m} edge={(u, v) => {
        if (sweep > 0 && sweep < 1) {
          const k = edgesOf(TM).findIndex(([a, b]) => a === u && b === v);
          if (Math.floor(sweep * nE) === k) return { c: C.cinnamon, w: 2.2 };
        }
        return undefined;
      }} vtx={(id) => (i >= 0 && i < KUHN.paths.length && id === KUHN.paths[i][0] ? { c: C.caramel } : undefined)} />
      {i >= 0 && <T x={40} y={286} s={13} f={C.cinnamon}>{`search ${Math.min(i + 1, KUHN.paths.length)} of ${lefts(TM).length}, ${nE} edges each`}</T>}
      <T x={560} y={286} s={13} f={C.crema} a="end" o={cap}>tasks × edges</T>
    </Svg>
  );
}

// 8 · HopcroftKarpPhase. Phase 1 from an empty matching: all four tasks light as layer 0 at once, their machines as
// layer 1, and three disjoint chains of length one flip together. Phase 2: from the one free task, t2, the layers grow
// outward through the pairs to m4, and that one chain flips.
export function HopcroftKarpPhase({ t }: StepCtx) {
  const p1 = HK.phases[0], p2 = HK.phases[1];
  const flip1 = t >= 1.6;
  const m1: M = flip1 ? Object.fromEntries(p1.chains.map((c) => [c[0], c[1]])) : {};
  const ph2 = t >= 2.2;
  const depth = stepIdx(t, 2.3, 3.8, 8);
  const flip2 = t >= 4.0;
  const ch2 = p2.chains[0];
  const m = flip2 ? HK.m : m1;
  const layer0 = easeOut(seg(t, 0.3, 0.6));
  const layer1 = easeOut(seg(t, 0.8, 1.2));
  return (
    <Svg label="Phase one, from no pairs: all four free tasks start a search at once, their machines are the next layer, and three disjoint chains of length one flip together. Phase two: from the one free task, t2, the layers grow outward through the existing pairs until m4, and that one chain flips: all four matched" h={300}>
      <Graph g={TM} m={m} edge={(u, v) => {
        if (!ph2 && !flip1 && layer1 > 0) return { c: C.latte, w: 1.6 };
        if (!ph2 && flip1 && m1[u] === v) return { c: C.caramel, w: 3.2 };
        if (ph2 && !flip2) {
          const E = chainEdges(ch2);
          const k = E.findIndex(([a, b]) => a === u && b === v);
          if (k >= 0 && k < depth) return { c: C.caramel, w: m1[u] === v ? 3.2 : 1.6, dash: m1[u] === v ? undefined : '5 4' };
        }
        if (flip2 && ch2.includes(u) && HK.m[u] === v) return { c: C.caramel, w: 3.2 };
        return undefined;
      }} vtx={(id) => {
        if (!ph2 && id[0] === 't') return { ring: layer0 * (flip1 ? 0 : 1) };
        if (ph2 && !flip2) {
          const k = ch2.indexOf(id);
          if (k >= 0 && k <= depth) return { c: C.caramel };
        }
        return undefined;
      }} />
      {!ph2 && <T x={40} y={286} s={13} f={C.caramel} o={flip1 ? 1 : layer0}>{flip1 ? `phase 1: ${p1.chains.length} chains at once` : 'phase 1: every free task at once'}</T>}
      {ph2 && <T x={40} y={286} s={13} f={C.caramel}>{flip2 ? `phase 2: ${p2.chains.length} longer chain` : 'phase 2: layer by layer from t2'}</T>}
    </Svg>
  );
}

// 9 · PredictPhaseCount. Three bars for this small graph: tasks 4, edges 7, and phases, a question mark. After
// answering: the phases bar fills to 2, below both.
export function PredictPhaseCount({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const grow = easeOut(seg(t, 0.3, 1.2));
  const ph = answered ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const unit = 22, base = 230;
  const bars = [
    { name: 'tasks', n: lefts(TM).length, c: C.cinnamon },
    { name: 'edges', n: edgesOf(TM).length, c: C.cinnamon },
  ];
  return (
    <Svg label="Three bars for the small graph: four tasks, seven edges, and the phase count, a question mark. After answering: the phase bar fills to two, smaller than either" h={300}>
      <line x1={80} y1={base} x2={520} y2={base} stroke={C.line} />
      {bars.map((b, i) => (
        <g key={b.name}>
          <rect x={130 + i * 130} y={base - b.n * unit * grow} width={60} height={b.n * unit * grow} fill={b.c} opacity={0.8} />
          <T x={160 + i * 130} y={base + 20} s={12} f={C.latte} a="middle">{b.name}</T>
          <T x={160 + i * 130} y={base - b.n * unit - 8} s={13} f={C.crema} a="middle" o={grow >= 1 ? 1 : 0}>{String(b.n)}</T>
        </g>
      ))}
      <rect x={390} y={base - HK.phases.length * unit * ph} width={60} height={HK.phases.length * unit * ph} fill={C.caramel} />
      <T x={420} y={base + 20} s={12} f={C.caramel} a="middle">phases</T>
      {!answered && <T x={420} y={base - 20} s={16} f={C.caramel} a="middle" o={grow}>?</T>}
      {answered && <T x={420} y={base - HK.phases.length * unit - 8} s={13} f={C.caramel} a="middle" o={ph >= 1 ? 1 : 0}>{String(HK.phases.length)}</T>}
    </Svg>
  );
}

// 10 · MeasuredGap. A thousand tasks, a thousand machines; matched pairs up, rounds along. One search at a time climbs
// one pair per round, a long diagonal into the hundreds of rounds. Hopcroft-Karp's phases jump almost to the top in
// its first round and finish in a handful, hugging the axis. Drawn from the measured run (seeded, so not printed):
// 883 searches; phases of 780, 92, 11 chains, the same 883 pairs.
const MEASURED = { searches: 883, phases: [780, 92, 11] };
export function MeasuredGap({ t }: StepCtx) {
  const X0 = 70, X1 = 540, Y0 = 230, Y1 = 50;
  const N = MEASURED.searches;
  const px = (r: number) => X0 + (r / N) * (X1 - X0);
  const py = (m: number) => Y0 - (m / N) * (Y0 - Y1);
  const run = easeInOut(seg(t, 0.4, 2.2));
  const hk = stepIdx(t, 2.5, 3.3, MEASURED.phases.length);
  const pts: string[] = [`${px(0)},${py(0)}`];
  let acc = 0;
  MEASURED.phases.forEach((n, i) => {
    if (i > hk) return;
    acc += n;
    pts.push(`${px(i)},${py(acc)}`, `${px(i + 1)},${py(acc)}`);
  });
  const cap = easeOut(seg(t, 3.7, 4.1));
  return (
    <Svg label="A thousand tasks and a thousand machines; pairs matched rise upward, rounds run along. One search at a time climbs one pair per round, a long diagonal running into the hundreds of rounds. Hopcroft-Karp jumps almost to the top in its first phase and finishes in a handful, hugging the axis, at the same matching" h={300}>
      <T x={300} y={18} s={13} f={C.crema} a="middle">1,000 tasks, 1,000 machines</T>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 6} stroke={C.line} />
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">rounds →</T>
      <T x={X0 - 8} y={Y1 + 4} s={12} f={C.latte} a="end">pairs</T>
      <line x1={px(0)} y1={py(0)} x2={px(N * run)} y2={py(N * run)} stroke={C.cinnamon} strokeWidth={2} />
      <T x={px(N * 0.62)} y={py(N * 0.62) + 26} s={12} f={C.cinnamon} o={run >= 0.7 ? 1 : 0}>one search at a time</T>
      {hk >= 0 && <polyline points={pts.join(' ')} fill="none" stroke={C.caramel} strokeWidth={3} />}
      <T x={X0 + 14} y={Y1 - 8} s={12} f={C.caramel} o={hk >= 2 ? 1 : 0}>Hopcroft-Karp: a handful of phases</T>
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={cap}>same matching: hundreds against a handful</T>
    </Svg>
  );
}

// 11 · KonigTheorem. The four-pair matching. The last search starts from the free tasks: there are none, so it reaches
// nothing. The cover is every task it could not reach, t1 to t4, ringed one by one, and every edge lights as a ringed
// vertex touches it. Cover 4, matching 4.
export function KonigTheorem({ t }: StepCtx) {
  const cover = TM_COVER.cover;
  const k = stepIdx(t, 0.9, 2.9, cover.length);
  const ringed = new Set(cover.filter((_, i) => i <= k));
  const none = easeOut(seg(t, 0.2, 0.6));
  const cap = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="The four-pair matching. The last search starts from the free tasks, of which there are none, so it reaches nothing. The cover is every task it could not reach: t1, t2, t3, t4, ringed one by one, every edge lighting as a ringed vertex touches it. Cover of four, matching of four" h={300}>
      <Graph g={TM} m={FULL} edge={(u, v) => (ringed.has(u) || ringed.has(v) ? { c: C.caramel, w: FULL[u] === v ? 3.2 : 1.6 } : undefined)}
        vtx={(id) => (ringed.has(id) ? { c: C.caramel, ring: 1 } : undefined)} />
      {k < 0 && <T x={300} y={286} s={13} f={C.latte} a="middle" o={none}>last search: no free task, reaches nothing</T>}
      {k >= 0 && <T x={40} y={286} s={13} f={C.caramel}>{`cover ${ringed.size}`}</T>}
      <T x={560} y={286} s={13} f={C.crema} a="end" o={cap}>{`matching ${nPairs(FULL)} = cover ${cover.length}`}</T>
    </Svg>
  );
}

// 12 · HallObstruction. t1 and t2 can each reach only m1; t3 reaches m2 and m3. The matching: t1-m1, t3-m2, two pairs,
// t2 free. The search from t2 reaches m1, then t1. Cover: m1, which the search reached, and t3, which it did not:
// the competing pair is pointed straight at m1.
export function HallObstruction({ t }: StepCtx) {
  const draw = easeOut(seg(t, 0.1, 0.6));
  const pairs = easeOut(seg(t, 0.6, 1.1));
  const reach = stepIdx(t, 1.3, 2.3, HALL_COVER.reached.length);
  const reached = new Set(HALL_COVER.reached.filter((_, i) => i <= reach));
  const cv = easeOut(seg(t, 2.6, 3.1));
  const cap = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="Three tasks: t1 and t2 can each reach only m1; t3 reaches m2 and m3. The matching pairs t1 with m1 and t3 with m2, two pairs, t2 left free. The search from t2 reaches m1, then t1. The cover is m1, which it reached, and t3, which it did not: two vertices, and m1 is where t1 and t2 compete" h={300}>
      <g opacity={draw}>
        <Graph g={HALL} m={pairs > 0 ? HALL_RUN.m : {}} edge={(u, v) => (reached.has(u) && reached.has(v) && reach >= 1 && cv <= 0 ? { c: C.caramel, w: HALL_RUN.m[u] === v ? 3.2 : 1.6 } : undefined)}
          vtx={(id) => {
            const inCover = HALL_COVER.cover.includes(id);
            if (cv > 0 && inCover) return { c: id === 'm1' ? C.cherryText : C.caramel, ring: cv, ringC: id === 'm1' ? C.cherryText : C.caramel };
            if (reached.has(id)) return { c: C.caramel };
            if (id === 't2' && pairs >= 1) return { c: C.cherryText };
            return undefined;
          }} />
      </g>
      <T x={40} y={286} s={13} f={C.crema} o={pairs}>{`matching ${nPairs(HALL_RUN.m)}`}</T>
      <T x={560} y={286} s={13} f={C.cherryText} a="end" o={cap}>{`cover: ${[...HALL_COVER.cover].sort().join(', ')}`}</T>
    </Svg>
  );
}

// 13 · Handoff. Phase 1 replayed: the three equal-length chains flip in one beat, then the second phase's single chain;
// a tally reads phases, not chains. Then: divide-and-conquer, next.
export function Handoff({ t }: StepCtx) {
  const p1 = HK.phases[0];
  const one = easeInOut(seg(t, 0.4, 1.0));
  const two = easeInOut(seg(t, 1.6, 2.2));
  const m1: M = Object.fromEntries(p1.chains.map((c) => [c[0], c[1]]));
  const m = two >= 1 ? HK.m : one >= 1 ? m1 : {};
  const cap = easeOut(seg(t, 2.6, 3.0));
  const next = easeOut(seg(t, 3.8, 4.2));
  return (
    <Svg label="The first phase's three equal-length chains flip together in one beat, then the second phase's single chain: two phases, not four separate searches. Then: divide-and-conquer design, next" h={300}>
      <Graph g={TM} m={m} edge={(u, v) => {
        if (one > 0 && one < 1 && m1[u] === v) return { c: C.caramel, w: lerp(1.2, 3.2, one) };
        if (two > 0 && two < 1 && HK.phases[1].chains[0].includes(u)) return { c: C.caramel, w: HK.m[u] === v ? lerp(1.2, 3.2, two) : m1[u] === v ? lerp(3.2, 1.2, two) : 1.2 };
        return undefined;
      }} />
      {next <= 0 && <T x={300} y={286} s={13} f={C.crema} a="middle" o={cap}>{`${HK.phases.length} phases, not ${KUHN.paths.length} searches`}</T>}
      {next > 0 && <T x={300} y={286} s={13} f={C.caramel} a="middle" o={next}>divide-and-conquer, next</T>}
    </Svg>
  );
}
