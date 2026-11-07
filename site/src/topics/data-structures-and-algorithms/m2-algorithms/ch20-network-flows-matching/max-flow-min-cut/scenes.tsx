import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's own addition to the shared one): crema = a pipe's flow, filling its pipe;
// caramel = the thing to look at (the route being pushed, the residual arrow just used, the cut curve); cinnamon (rare)
// = the alternative being compared (the second, independently sourced network); cherryText = the stuck state (a full
// pipe with no route left); taupe = an empty pipe's outline. A pipe's filled length is its flow against its capacity;
// a thin dashed arrow beside a pipe, pointed the other way, is its backward residual; a closed curve around a set of
// vertices is a cut.
//
// Every printed number is examples.py's: capacities AB 11, AC 2, BC 3, BD 5, CD 1, CE 6, DE 2, DF 8, EF 3; the stuck
// run's four routes A-B-D-E-F 2, A-C-E-F 1, A-C-D-F 1, A-B-D-F 3 (totals 2, 3, 4, 7); the rescue path A-B-C-E-D-F with
// residuals 6, 3, 5, 2, 4 and bottleneck 2 (total 9); the good run's five routes (totals 2, 3, 4, 8, 9, the last
// crossing D-E backward); the cut {A, B, C, E} against {D, F} crossing B-D 5, C-D 1, E-F 3 = 9; the CLRS/SciPy network's
// 23; and the Edmonds-Karp network's two pushes by breadth-first search. CHAPTER.md's table gives its X = one million,
// 2,000,000 pushes. The flows below are replayed by the same push loop examples.py runs.

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
type K = 'AB' | 'AC' | 'BC' | 'BD' | 'CD' | 'CE' | 'DE' | 'DF' | 'EF';
type Flow = Partial<Record<K, number>>;
const POS: Record<string, P> = { A: [70, 140], B: [220, 50], C: [220, 230], D: [380, 50], E: [380, 230], F: [530, 140] };
const KEYS: K[] = ['AB', 'AC', 'BC', 'BD', 'CD', 'CE', 'DE', 'DF', 'EF'];
const CAP: Record<K, number> = { AB: 11, AC: 2, BC: 3, BD: 5, CD: 1, CE: 6, DE: 2, DF: 8, EF: 3 };
const ends = (k: K) => [k[0], k[1]] as const;

/** Unit direction and left normal of a pipe, and its midpoint. */
function geo(k: K) {
  const [u, v] = ends(k);
  const [x1, y1] = POS[u];
  const [x2, y2] = POS[v];
  const L = Math.hypot(x2 - x1, y2 - y1);
  const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
  return { x1, y1, x2, y2, ux, uy, nx: -uy, ny: ux, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

/** examples.py's residual capacity and push, on a flow keyed by pipe. */
function rescap(f: Flow, u: string, v: string) {
  const fwd = (u + v) as K, back = (v + u) as K;
  return (CAP[fwd] !== undefined ? CAP[fwd] - (f[fwd] ?? 0) : 0) + (CAP[back] !== undefined ? f[back] ?? 0 : 0);
}
function push(f: Flow, path: string, amt: number): Flow {
  const g = { ...f };
  for (let i = 0; i + 1 < path.length; i++) {
    const fwd = (path[i] + path[i + 1]) as K, back = (path[i + 1] + path[i]) as K;
    if (CAP[fwd] !== undefined) g[fwd] = (g[fwd] ?? 0) + amt;
    else g[back] = (g[back] ?? 0) - amt;
  }
  return g;
}
/** Run routes in order, each pushing its own bottleneck: the states after each push, the amounts and totals. */
function run(paths: string[], start: Flow = {}) {
  const states: Flow[] = [start];
  const amts: number[] = [];
  const totals: number[] = [];
  let f = start;
  for (const p of paths) {
    let b = Infinity;
    for (let i = 0; i + 1 < p.length; i++) b = Math.min(b, rescap(f, p[i], p[i + 1]));
    f = push(f, p, b);
    states.push(f);
    amts.push(b);
    totals.push((f.AB ?? 0) + (f.AC ?? 0));
  }
  return { states, amts, totals };
}
const STUCK_PATHS = ['ABDEF', 'ACEF', 'ACDF', 'ABDF'];
const STUCK = run(STUCK_PATHS); // amounts 2, 1, 1, 3; totals 2, 3, 4, 7
const STUCK_FLOW = STUCK.states[4];
const RESCUE_PATH = 'ABCEDF';
const RESCUE_RES = Array.from({ length: 5 }, (_, i) => rescap(STUCK_FLOW, RESCUE_PATH[i], RESCUE_PATH[i + 1])); // 6, 3, 5, 2, 4
const RESCUE = run([RESCUE_PATH], STUCK_FLOW); // bottleneck 2, total 9
const GOOD_PATHS = ['ACEF', 'ABDEF', 'ABCDF', 'ABDF', 'ABCEDF'];
const GOOD = run(GOOD_PATHS); // totals 2, 3, 4, 8, 9
const FINAL = GOOD.states[5];
const CUT_S = ['A', 'B', 'C', 'E'];
const CUT_OUT: K[] = ['BD', 'CD', 'EF']; // 5 + 1 + 3 = 9
const GOOD_EK = 2; // examples.py: the shortest-augmenting-path rule takes 2 pushes
const CUT_SUMS = CUT_OUT.map((_, i) => CUT_OUT.slice(0, i + 1).reduce((s, k) => s + CAP[k], 0)); // 5, 6, 9

/** Flow on each pipe partway from one state to the next: a shape, its label switches only once the push lands. */
const mix = (a: Flow, b: Flow, p: number): Flow => Object.fromEntries(KEYS.map((k) => [k, lerp(a[k] ?? 0, b[k] ?? 0, clamp(p, 0, 1))]));

function Head({ x, y, ang, c }: { x: number; y: number; ang: number; c: string }) {
  const s = 7;
  return <path d={`M${x + s * Math.cos(ang + 2.6)} ${y + s * Math.sin(ang + 2.6)} L${x} ${y} L${x + s * Math.cos(ang - 2.6)} ${y + s * Math.sin(ang - 2.6)}`} fill="none" stroke={c} strokeWidth={1.6} />;
}

/** One pipe: an outline, its flow filled in from the tail, an arrowhead, and its label (flow/capacity, or capacity). */
function Pipe({ k, f, shown, c = C.crema, hi = false, stuck = false, o = 1, draw = 1, capOnly = false }: { k: K; f: number; shown?: number; c?: string; hi?: boolean; stuck?: boolean; o?: number; draw?: number; capOnly?: boolean }) {
  const g = geo(k);
  const r = 17;
  const sx = g.x1 + g.ux * r, sy = g.y1 + g.uy * r, ex = g.x2 - g.ux * r, ey = g.y2 - g.uy * r;
  const q = clamp(draw, 0, 1);
  const full = stuck && (shown ?? f) >= CAP[k];
  const col = hi ? C.caramel : full ? C.cherryText : c;
  const fr = clamp(f / CAP[k], 0, 1) * q;
  const lab = capOnly ? String(CAP[k]) : `${Math.round(shown ?? f)}/${CAP[k]}`;
  return (
    <g opacity={o}>
      {q > 0 && <line x1={sx} y1={sy} x2={lerp(sx, ex, q)} y2={lerp(sy, ey, q)} stroke={hi ? C.caramel : C.taupe} strokeWidth={hi ? 1.8 : 1.2} />}
      {fr > 0 && <line x1={sx} y1={sy} x2={lerp(sx, ex, fr)} y2={lerp(sy, ey, fr)} stroke={col} strokeWidth={4} strokeLinecap="round" />}
      {q >= 1 && <Head x={ex} y={ey} ang={Math.atan2(g.uy, g.ux)} c={hi ? C.caramel : full ? C.cherryText : C.latte} />}
      <T x={g.mx - g.nx * 15} y={g.my - g.ny * 15 + 4} s={12} f={full ? C.cherryText : hi ? C.caramel : C.latte} a="middle" o={q >= 1 ? 1 : 0}>{lab}</T>
    </g>
  );
}

/** A pipe's backward residual: a dashed arrow beside it pointing from its head to its tail, with its amount. */
function Back({ k, n, p = 1, c = C.caramel, w = 1.3 }: { k: K; n: number; p?: number; c?: string; w?: number }) {
  const g = geo(k);
  const r = 22, off = 10;
  const sx = g.x2 - g.ux * r + g.nx * off, sy = g.y2 - g.uy * r + g.ny * off;
  const ex = g.x1 + g.ux * r + g.nx * off, ey = g.y1 + g.uy * r + g.ny * off;
  const q = clamp(p, 0, 1);
  if (q <= 0) return null;
  return (
    <g>
      <line x1={sx} y1={sy} x2={lerp(sx, ex, q)} y2={lerp(sy, ey, q)} stroke={c} strokeWidth={w} strokeDasharray="4 3" />
      {q >= 1 && <Head x={ex} y={ey} ang={Math.atan2(-g.uy, -g.ux)} c={c} />}
      {q >= 1 && <T x={g.mx + g.nx * 27} y={g.my + g.ny * 27 + 4} s={12} f={c} a="middle">{String(n)}</T>}
    </g>
  );
}

function Vertex({ id, c = C.crema, o = 1, ring = 0 }: { id: string; c?: string; o?: number; ring?: number }) {
  const [x, y] = POS[id];
  return (
    <g opacity={o}>
      {ring > 0 && <circle cx={x} cy={y} r={14 + 6 * ring} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={ring} />}
      <circle cx={x} cy={y} r={14} fill={C.band} stroke={c} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} f={c} a="middle">{id}</T>
    </g>
  );
}

/** The whole network at one flow. `hi` lights a route's pipes; `stuck` reddens the full ones. */
function Net({ f, shown, hi = [], stuck = false, vc }: { f: Flow; shown?: Flow; hi?: K[]; stuck?: boolean; vc?: (v: string) => { c?: string; ring?: number } }) {
  return (
    <g>
      {KEYS.map((k) => <Pipe key={k} k={k} f={f[k] ?? 0} shown={(shown ?? f)[k] ?? 0} hi={hi.includes(k)} stuck={stuck} />)}
      {Object.keys(POS).map((v) => <Vertex key={v} id={v} {...(vc?.(v) ?? {})} />)}
    </g>
  );
}

/** The pipes a route uses, forward ones only (a backward crossing is drawn by Back). */
const routeKeys = (p: string) => Array.from({ length: p.length - 1 }, (_, i) => (p[i] + p[i + 1]) as K).filter((k) => CAP[k] !== undefined);

/** A dot travelling a route, vertex to vertex. */
function Dot({ path, p, c = C.caramel }: { path: string; p: number; c?: string }) {
  const n = path.length - 1;
  const x = clamp(p, 0, 1) * n;
  const i = Math.min(n - 1, Math.floor(x));
  const [x1, y1] = POS[path[i]];
  const [x2, y2] = POS[path[i + 1]];
  const fr = x - i;
  return <circle cx={lerp(x1, x2, fr)} cy={lerp(y1, y2, fr)} r={5} fill={c} />;
}

/** Plays a run of routes: route i lights from start + i*per, its flow fills over the back half. */
function runAt(t: number, start: number, per: number, R: { states: Flow[] }, paths: string[]) {
  const n = paths.length;
  const x = (t - start) / per;
  const i = clamp(Math.floor(x), -1, n);
  const local = x - i;
  if (i < 0) return { i: -1, f: R.states[0], shown: R.states[0], hi: [] as K[], dot: -1 };
  if (i >= n) return { i: n, f: R.states[n], shown: R.states[n], hi: [] as K[], dot: -1 };
  const p = easeInOut(seg(local, 0.45, 0.9));
  return { i, f: mix(R.states[i], R.states[i + 1], p), shown: local >= 0.9 ? R.states[i + 1] : R.states[i], hi: routeKeys(paths[i]), dot: seg(local, 0, 0.45) };
}

// 1 · Opening. The six depots draw in; the dispatcher's four routes fill their pipes one after another and stop at 7,
// the full pipes reddening; then the caption: two more could still ship, only by taking some back.
export function Opening({ t }: StepCtx) {
  const net = easeOut(seg(t, 0.1, 0.7));
  const r = runAt(t, 0.8, 0.6, STUCK, STUCK_PATHS);
  const done = r.i >= 4;
  const cap1 = easeOut(seg(t, 3.4, 3.8));
  const cap2 = easeOut(seg(t, 4.1, 4.5));
  return (
    <Svg label="Six depots joined by pipes. A dispatcher sends four shipments down routes with room and stops at seven units, every remaining route meeting a full pipe, drawn red. Two more units could still ship, but only by taking back some of what already went" h={300}>
      <g opacity={net}>
        <Net f={r.f} shown={r.shown} hi={done ? [] : r.hi} stuck={done} />
        {r.dot >= 0 && r.dot < 1 && <Dot path={STUCK_PATHS[r.i]} p={r.dot} />}
      </g>
      {cap2 <= 0 && <T x={300} y={284} s={13} f={C.cherryText} a="middle" o={cap1}>{`stuck at ${STUCK.totals[3]}: no route left`}</T>}
      {cap2 > 0 && <T x={300} y={284} s={13} f={C.crema} a="middle" o={cap2}>{`${RESCUE.totals[0]} fit, by taking some flow back`}</T>}
    </Svg>
  );
}

// 2 · FlowNetwork. The pipes draw in one by one, each with its capacity; A is marked source and F sink. Then at C, the
// flow in (A-C, B-C) and the flow out (C-D, C-E) light in turn: whatever comes in must go back out.
export function FlowNetwork({ t }: StepCtx) {
  const tag = easeOut(seg(t, 1.9, 2.3));
  const inn = easeOut(seg(t, 2.5, 2.9));
  const out = easeOut(seg(t, 3.1, 3.5));
  const cap = easeOut(seg(t, 3.6, 3.95));
  return (
    <Svg label="The directed network: nine pipes, each with a capacity, A the source and F the sink. At C the pipes in, from A and from B, and the pipes out, to D and to E, light in turn: at every other vertex, flow in equals flow out" h={300}>
      {KEYS.map((k, i) => {
        const lit = (inn > 0 && (k === 'AC' || k === 'BC')) || (out > 0 && (k === 'CD' || k === 'CE'));
        return <Pipe key={k} k={k} f={0} capOnly draw={easeOut(seg(t, 0.2 + i * 0.17, 0.5 + i * 0.17))} hi={lit} />;
      })}
      {Object.keys(POS).map((v) => <Vertex key={v} id={v} c={v === 'C' && inn > 0 ? C.caramel : C.crema} />)}
      <T x={70} y={176} s={12} f={C.caramel} a="middle" o={tag}>source</T>
      <T x={530} y={176} s={12} f={C.caramel} a="middle" o={tag}>sink</T>
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={cap}>every other vertex: in = out</T>
    </Svg>
  );
}

// 3 · PredictRescue. The stuck network. A forward-only search spreads from A along pipes with room: A, B, C, E, and
// stops; E-F is full. After answering: the dashed arrow from E back to D lights, 2 units that can be pulled back, and
// the search gets through D to F.
export function PredictRescue({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const REACH = ['A', 'B', 'C', 'E'];
  const k = clamp(Math.floor(seg(t, 0.4, 2.0) * 4), 0, 3);
  const block = easeOut(seg(t, 2.2, 2.6));
  const back = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const through = answered ? easeOut(seg(s, 0.9, 1.4)) : 0;
  return (
    <Svg label="The stuck network. A search that only goes forward along pipes with room reaches A, B, C and E, then stops at the full pipe from E to F. After answering: the dashed arrow from E back to D, two units that could be pulled back, lights, and the search gets through D to F" h={300}>
      <Net f={STUCK_FLOW} stuck hi={through > 0 ? ['DF'] : []} vc={(v) => {
        const j = REACH.indexOf(v);
        if (j >= 0 && j <= k && t > 0.4) return { c: C.caramel };
        if (v === 'D' && back > 0) return { c: C.caramel };
        if (v === 'F' && through >= 1) return { c: C.caramel };
        return {};
      }} />
      <Back k="DE" n={STUCK_FLOW.DE ?? 0} p={back} />
      {!answered && <T x={300} y={284} s={13} f={C.cherryText} a="middle" o={block}>forward only: stuck at A, B, C, E</T>}
      {answered && <T x={300} y={284} s={13} f={C.caramel} a="middle" o={through}>backward from E to D, then on to F</T>}
    </Svg>
  );
}

// 4 · StuckRun. The four routes in order, each lit with a dot running along it and its pipes filling by its bottleneck:
// 2, then 1, then 1, then 3. The running total steps 2, 3, 4, 7; at the end the full pipes turn red.
export function StuckRun({ t }: StepCtx) {
  const r = runAt(t, 0.3, 0.9, STUCK, STUCK_PATHS);
  const done = r.i >= 4;
  const shownTotal = r.i < 0 ? null : done ? STUCK.totals[3] : r.shown === STUCK.states[r.i + 1] ? STUCK.totals[r.i] : r.i > 0 ? STUCK.totals[r.i - 1] : null;
  return (
    <Svg label="The dispatcher's four routes in order, each lit with its pipes filling: A B D E F by two, A C E F by one, A C D F by one, A B D F by three. The total steps two, three, four, seven, and the full pipes turn red: every remaining route meets one" h={300}>
      <Net f={r.f} shown={r.shown} hi={done ? [] : r.hi} stuck={done} />
      {r.dot >= 0 && r.dot < 1 && <Dot path={STUCK_PATHS[r.i]} p={r.dot} />}
      {r.i >= 0 && !done && <T x={40} y={284} s={13} f={C.caramel}>{`route ${r.i + 1}: +${STUCK.amts[r.i]}`}</T>}
      {shownTotal !== null && <T x={560} y={284} s={13} f={done ? C.cherryText : C.crema} a="end">{`total ${shownTotal}`}</T>}
      {done && <T x={40} y={284} s={13} f={C.cherryText}>every route hits a full pipe</T>}
    </Svg>
  );
}

// 5 · ResidualGraph. The stuck network; beside three loaded pipes, B-D, D-E and D-F, a dashed arrow grows the other
// way with its undo number: 5, 2, 4.
const SHOW_BACK: K[] = ['BD', 'DE', 'DF'];
export function ResidualGraph({ t }: StepCtx) {
  const cap = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="The stuck network. Beside three loaded pipes, a dashed arrow grows the opposite way with the amount that could be pulled back: five on B to D, two on D to E, four on D to F" h={300}>
      <Net f={STUCK_FLOW} stuck />
      {SHOW_BACK.map((k, i) => <Back key={k} k={k} n={STUCK_FLOW[k] ?? 0} p={easeOut(seg(t, 0.6 + i * 0.9, 1.3 + i * 0.9))} />)}
      <T x={300} y={284} s={13} f={C.caramel} a="middle" o={cap}>dashed: flow that could be undone</T>
    </Svg>
  );
}

// 6 · Rescue. The path A-B-C-E-D-F lights segment by segment, its room printed as it goes: 6, 3, 5, then 2 backward on
// E to D, then 4. The smallest, 2, is pushed: D-E drains to 0 while the rest fills, and the total reads 9.
export function Rescue({ t }: StepCtx) {
  const seg5 = stepIdx(t, 0.3, 2.3, 5);
  const walking = t > 0.3 && t < 2.3;
  const pick = easeOut(seg(t, 2.4, 2.8));
  const p = easeInOut(seg(t, 2.9, 3.7));
  const f = mix(STUCK_FLOW, RESCUE.states[1], p);
  const shown = p >= 1 ? RESCUE.states[1] : STUCK_FLOW;
  const lit = routeKeys(RESCUE_PATH).filter((_, i) => i <= seg5 || p > 0);
  const cap = easeOut(seg(t, 3.8, 4.2));
  const bott = Math.min(...RESCUE_RES);
  return (
    <Svg label="The path A, B, C, E, D, F lights step by step with the room on each: six, three, five, then two crossing backward from E to D, then four. The smallest, two, is pushed: D to E drains to zero while the rest fills, and the total reaches nine" h={300}>
      <Net f={f} shown={shown} hi={p >= 1 ? [] : lit} stuck={false} />
      <Back k="DE" n={STUCK_FLOW.DE ?? 0} p={seg5 >= 3 && p < 1 ? 1 : 0} w={2} />
      {walking && <Dot path={RESCUE_PATH} p={seg(t, 0.3, 2.3)} />}
      {seg5 >= 0 && p < 1 && (
        <g>
          <T x={40} y={284} s={13} f={C.latte}>room</T>
          {RESCUE_RES.map((n, i) => (
            <T key={i} x={100 + i * 34} y={284} s={13} a="middle" f={pick > 0 && n === bott ? C.caramel : i === 3 ? C.caramel : C.crema} o={i <= seg5 ? 1 : 0}>{String(n)}</T>
          ))}
          <T x={290} y={284} s={13} f={C.caramel} o={pick}>{`push ${bott}`}</T>
        </g>
      )}
      {p >= 1 && <T x={300} y={284} s={13} f={C.caramel} a="middle" o={cap}>{`D to E undone: total ${RESCUE.totals[0]}`}</T>}
    </Svg>
  );
}

// 7 · FordFulkersonLoop. Find, push, repeat: the five routes of the good order run one after another from an empty
// network, the running total lighting 2, 3, 4, 8, 9. The fifth crosses D-E backward, its dashed arrow lit.
export function FordFulkersonLoop({ t }: StepCtx) {
  const r = runAt(t, 0.3, 0.85, GOOD, GOOD_PATHS);
  const lastBack = r.i === 4;
  return (
    <Svg label="Find a route with room, push its limit, repeat: five routes from an empty network, the total reading two, three, four, eight, nine. The fifth route, A B C E D F, crosses the pipe from D to E backward" h={300}>
      <Net f={r.f} shown={r.shown} hi={r.i >= 5 ? [] : r.hi} />
      <Back k="DE" n={GOOD.states[4].DE ?? 0} p={lastBack ? 1 : 0} w={2} />
      {r.dot >= 0 && r.dot < 1 && <Dot path={GOOD_PATHS[r.i]} p={r.dot} />}
      <T x={40} y={284} s={13} f={C.latte}>find, push, repeat:</T>
      {GOOD.totals.map((n, i) => {
        const on = r.i > i || (r.i === i && r.shown === GOOD.states[i + 1]);
        return <T key={i} x={250 + i * 44} y={284} s={14} a="middle" f={i === 4 ? C.caramel : C.crema} o={on ? 1 : 0.15}>{String(n)}</T>;
      })}
    </Svg>
  );
}

// 8 · CutCertificate. The final flow. A search from A along pipes with room lights A, B, C, E; a dashed curve closes
// round them. The pipes leaving it light one by one, each full: B-D 5, C-D 1, E-F 3, the cut's tally 5, 6, 9; D-E,
// crossing back in, carries 0. Flow 9, cut 9.
const CUT_CURVE = 'M30 148 L200 8 L262 30 L346 166 L404 182 L430 246 L382 266 L214 266 Z';
export function CutCertificate({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 1.5, 4);
  const curve = easeOut(seg(t, 1.6, 2.1));
  const j = stepIdx(t, 2.2, 3.4, 3);
  const backIn = easeOut(seg(t, 3.5, 3.8));
  const eq = easeOut(seg(t, 3.9, 4.3));
  return (
    <Svg label="The final flow. A search along pipes with room reaches A, B, C and E, and a dashed curve closes round them. The pipes leaving the curve light one at a time, each full: B to D five, C to D one, E to F three, totalling nine; the pipe from D back into the curve carries nothing. Flow nine equals cut nine" h={300}>
      <Net f={FINAL} hi={CUT_OUT.filter((_, i) => i <= j)} vc={(v) => (CUT_S.indexOf(v) >= 0 && CUT_S.indexOf(v) <= k ? { c: C.caramel } : {})} />
      <path d={CUT_CURVE} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 4" strokeLinejoin="round" opacity={curve} />
      <T x={389} y={166} s={12} f={C.cherryText} o={backIn}>empty</T>
      {j >= 0 && <T x={40} y={290} s={13} f={C.caramel}>{`cut ${CUT_SUMS[j]}`}</T>}
      <T x={560} y={290} s={13} f={C.crema} a="end" o={eq}>{`flow ${GOOD.totals[4]} = cut ${CUT_SUMS[2]}`}</T>
    </Svg>
  );
}

// 9 · MaxFlowMinCutTheorem. Two pairs of bars on one scale: this network's max flow and min cut rise and lock level at
// 9; then the CLRS network's pair, in blue, rise and lock at 23.
export function MaxFlowMinCutTheorem({ t }: StepCtx) {
  const base = 230, unit = 7;
  const pairs = [
    { x: 150, n: GOOD.totals[4], c: C.crema, name: 'this network', t0: 0.3 },
    { x: 430, n: 23, c: C.cinnamon, name: 'CLRS network', t0: 1.9 },
  ];
  const cap = easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="Two pairs of bars on one scale. This network's maximum flow and minimum cut rise and lock level at nine; then a second, independently sourced network's pair, in blue, rise and lock level at twenty-three" h={300}>
      <line x1={40} y1={base} x2={560} y2={base} stroke={C.line} />
      {pairs.map((pr) => {
        const a = easeOut(seg(t, pr.t0, pr.t0 + 0.9));
        const b = easeOut(seg(t, pr.t0 + 0.3, pr.t0 + 1.2));
        const lock = t >= pr.t0 + 1.3;
        return (
          <g key={pr.name}>
            <rect x={pr.x - 52} y={base - pr.n * unit * a} width={44} height={pr.n * unit * a} fill={pr.c} opacity={0.85} />
            <rect x={pr.x + 8} y={base - pr.n * unit * b} width={44} height={pr.n * unit * b} fill="none" stroke={pr.c} strokeWidth={2} />
            <T x={pr.x - 30} y={base + 18} s={12} f={C.latte} a="middle" o={a > 0 ? 1 : 0}>flow</T>
            <T x={pr.x + 30} y={base + 18} s={12} f={C.latte} a="middle" o={b > 0 ? 1 : 0}>cut</T>
            {lock && <line x1={pr.x - 62} y1={base - pr.n * unit} x2={pr.x + 62} y2={base - pr.n * unit} stroke={C.caramel} strokeDasharray="4 3" />}
            {lock && <T x={pr.x} y={base - pr.n * unit - 10} s={14} f={pr.c === C.cinnamon ? C.cinnamon : C.caramel} a="middle">{String(pr.n)}</T>}
            <T x={pr.x} y={base + 40} s={12} f={pr.c === C.cinnamon ? C.cinnamon : C.crema} a="middle" o={a}>{pr.name}</T>
          </g>
        );
      })}
      <T x={300} y={30} s={13} f={C.crema} a="middle" o={cap}>max flow = min cut</T>
    </Svg>
  );
}

// 10 · Integrality. The good run's five pushes, 2, 1, 1, 4, 1, drop in as whole unit blocks and stack to 9; then three
// pipes of capacity one fill to all or nothing: 1, 0, 1.
export function Integrality({ t }: StepCtx) {
  const unit = 20;
  let acc = 0;
  const blocks: { y: number; i: number; j: number }[] = [];
  GOOD.amts.forEach((a, i) => {
    for (let j = 0; j < a; j++) blocks.push({ y: acc++, i, j });
  });
  const ones = [1, 0, 1];
  const capOne = easeOut(seg(t, 2.6, 3.0));
  const cap = easeOut(seg(t, 3.9, 4.3));
  return (
    <Svg label="The five pushes of the good run, two, one, one, four and one, drop in as whole unit blocks and stack to nine. Then three pipes of capacity one fill all the way or not at all: one, nothing, one" h={300}>
      <T x={60} y={30} s={12} f={C.latte}>each push: whole units</T>
      <line x1={60} y1={232} x2={200} y2={232} stroke={C.line} />
      {blocks.map((b) => {
        const d = easeOut(seg(t, 0.3 + b.i * 0.4, 0.6 + b.i * 0.4));
        const y = 232 - (b.y + 1) * unit;
        return <rect key={b.y} x={110} y={lerp(y - 40, y, d)} width={40} height={unit - 3} fill={b.i % 2 ? C.crema : C.caramel} opacity={d} />;
      })}
      {GOOD.amts.map((a, i) => (
        <T key={i} x={60} y={232 - (GOOD.totals[i] - a / 2) * unit + 4} s={12} f={C.latte} o={easeOut(seg(t, 0.4 + i * 0.4, 0.7 + i * 0.4))}>{`+${a}`}</T>
      ))}
      <T x={130} y={256} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 2.3, 2.6))}>{String(GOOD.totals[4])}</T>
      <g opacity={capOne}>
        <T x={330} y={30} s={12} f={C.latte}>capacity 1: all or nothing</T>
        {ones.map((v, i) => {
          const y = 90 + i * 60;
          const fill = easeInOut(seg(t, 3.0 + i * 0.25, 3.5 + i * 0.25)) * v;
          return (
            <g key={i}>
              <line x1={340} y1={y} x2={520} y2={y} stroke={C.taupe} strokeWidth={1.2} />
              {fill > 0 && <line x1={340} y1={y} x2={lerp(340, 520, fill)} y2={y} stroke={C.crema} strokeWidth={5} strokeLinecap="round" />}
              <T x={548} y={y + 5} s={13} f={v ? C.caramel : C.latte} a="middle" o={t > 3.5 + i * 0.25 ? 1 : 0}>{String(v)}</T>
            </g>
          );
        })}
      </g>
      <T x={430} y={284} s={13} f={C.crema} a="middle" o={cap}>never a fraction</T>
    </Svg>
  );
}

// 11 · PredictAcyclic. Flow from S to T, and beside it a loop of three depots with a unit circling round it. After
// answering: the loop is stripped away, and the total out of S stays where it was.
export function PredictAcyclic({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const strip = answered ? easeInOut(seg(s, 0.3, 1.2)) : 0;
  const same = answered ? easeOut(seg(s, 1.3, 1.7)) : 0;
  const appear = easeOut(seg(t, 0.2, 0.8));
  const L: P[] = [[300, 70], [380, 180], [220, 180]];
  const ph = (((t - 0.8) % 1.5) + 1.5) % 1.5 / 1.5;
  const k = clamp(Math.floor(ph * 3), 0, 2);
  const a = L[k], b = L[(k + 1) % 3];
  const fr = ph * 3 - k;
  return (
    <Svg label="Flow runs from a source S to a sink T along a straight line; beside it, three depots pass a unit round a closed loop. After answering: the loop is stripped away and the total from S to T stays the same" h={300}>
      <g opacity={appear}>
        <line x1={70} y1={250} x2={530} y2={250} stroke={C.crema} strokeWidth={4} />
        <T x={56} y={254} s={13} f={C.crema} a="end">S</T>
        <T x={544} y={254} s={13} f={C.crema}>T</T>
        <g opacity={1 - strip}>
          {L.map((p, i) => {
            const q = L[(i + 1) % 3];
            return <line key={i} x1={lerp(p[0], q[0], 0.15)} y1={lerp(p[1], q[1], 0.15)} x2={lerp(p[0], q[0], 0.85)} y2={lerp(p[1], q[1], 0.85)} stroke={C.cinnamon} strokeWidth={2.5} />;
          })}
          {L.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={10} fill={C.band} stroke={C.cinnamon} strokeWidth={1.6} />)}
          {t > 0.8 && <circle cx={lerp(a[0], b[0], fr)} cy={lerp(a[1], b[1], fr)} r={5} fill={C.cinnamon} />}
        </g>
      </g>
      {!answered && <T x={300} y={30} s={13} f={C.crema} a="middle" o={appear}>a closed loop of flow: needed?</T>}
      {answered && <T x={300} y={30} s={13} f={C.caramel} a="middle" o={same}>loop removed: same total</T>}
    </Svg>
  );
}

// 12 · WhySlowAndFixable. Two copies of the four-depot network, outer pipes X, middle pipe 1. Left: routes alternate
// through the middle pipe, one unit each, its direction flipping: 2,000,000 pushes at X = one million. Right: breadth-
// first takes s-u-t and s-v-t, X each: 2 pushes.
function Diamond({ cx, cy, mid, lit, c }: { cx: number; cy: number; mid: number; lit: string; c: string }) {
  const V: Record<string, P> = { s: [cx - 95, cy], u: [cx, cy - 62], v: [cx, cy + 62], t: [cx + 95, cy] };
  const E: [string, string, string][] = [['s', 'u', 'X'], ['s', 'v', 'X'], ['u', 't', 'X'], ['v', 't', 'X']];
  return (
    <g>
      {E.map(([a, b, w]) => {
        const on = lit.includes(a + b);
        const [x1, y1] = V[a], [x2, y2] = V[b];
        return (
          <g key={a + b}>
            <line x1={lerp(x1, x2, 0.14)} y1={lerp(y1, y2, 0.14)} x2={lerp(x1, x2, 0.86)} y2={lerp(y1, y2, 0.86)} stroke={on ? c : C.taupe} strokeWidth={on ? 2.5 : 1.3} />
            <T x={(x1 + x2) / 2 + (x2 > x1 && y2 < y1 ? -12 : x2 > x1 && y2 > y1 ? -12 : 12)} y={(y1 + y2) / 2 + (y2 < y1 ? -6 : 14)} s={12} f={C.latte} a="middle">{w}</T>
          </g>
        );
      })}
      <line x1={cx} y1={cy - 44} x2={cx} y2={cy + 44} stroke={mid !== 0 ? c : C.taupe} strokeWidth={mid !== 0 ? 2.5 : 1.3} />
      {mid !== 0 && <Head x={cx} y={mid > 0 ? cy + 44 : cy - 44} ang={mid > 0 ? Math.PI / 2 : -Math.PI / 2} c={c} />}
      <T x={cx + 10} y={cy + 4} s={12} f={C.latte}>1</T>
      {Object.entries(V).map(([id, [x, y]]) => (
        <g key={id}>
          <circle cx={x} cy={y} r={12} fill={C.band} stroke={C.crema} strokeWidth={1.6} />
          <T x={x} y={y + 4} s={12} f={C.crema} a="middle">{id}</T>
        </g>
      ))}
    </g>
  );
}
export function WhySlowAndFixable({ t }: StepCtx) {
  const top = easeOut(seg(t, 0.1, 0.5));
  const alt = t > 0.6 ? Math.floor(((t - 0.6) / 0.3) % 2) : -1;
  const left = easeOut(seg(t, 1.6, 2.0));
  const bfs = stepIdx(t, 2.2, 3.2, 2);
  const right = easeOut(seg(t, 3.3, 3.7));
  const named = easeOut(seg(t, 4.0, 4.4));
  return (
    <Svg label="Two copies of a four-depot network, outer pipes of capacity X and a middle pipe of capacity one. Left: routes alternate through the middle pipe, its direction flipping each time, one unit per push: at X of one million, two million pushes. Right: breadth-first search takes s u t and s v t, two pushes. Fractional capacities still finish; irrational ones can loop forever" h={300}>
      <T x={300} y={22} s={13} f={C.crema} a="middle" o={top}>time grows with pipes × final flow</T>
      <Diamond cx={150} cy={125} mid={alt < 0 ? 0 : alt === 0 ? 1 : -1} lit={alt === 0 ? 'su vt' : alt === 1 ? 'sv ut' : ''} c={C.cherryText} />
      <Diamond cx={450} cy={125} mid={0} lit={bfs === 0 ? 'su ut' : bfs === 1 ? 'su ut sv vt' : ''} c={C.caramel} />
      <T x={150} y={222} s={12} f={C.cherryText} a="middle" o={left}>X = 10⁶: 2,000,000 pushes</T>
      <T x={450} y={222} s={12} f={C.caramel} a="middle" o={right}>{`breadth-first: ${GOOD_EK} pushes`}</T>
      <T x={300} y={278} s={12} f={C.latte} a="middle" o={named}>fractions finish; irrational may never end</T>
    </Svg>
  );
}

// 13 · Handoff. A source, three tasks, three machines and a sink, every pipe capacity one. Each pipe either carries
// one unit or none: the chosen pairs light, the rest stay empty. Then: bipartite matching, next.
export function Handoff({ t }: StepCtx) {
  const S: P = [60, 140], Tt: P = [540, 140];
  const Lp: P[] = [[200, 60], [200, 140], [200, 220]];
  const Rp: P[] = [[400, 60], [400, 140], [400, 220]];
  const pairs: [number, number][] = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1]];
  const chosen: [number, number][] = [[0, 0], [1, 2], [2, 1]];
  const draw = easeOut(seg(t, 0.2, 1.0));
  const pick = (i: number) => easeInOut(seg(t, 1.3 + i * 0.6, 1.8 + i * 0.6));
  const cap = easeOut(seg(t, 3.4, 3.8));
  const next = easeOut(seg(t, 4.2, 4.6));
  const isChosen = (a: number, b: number) => chosen.findIndex(([x, y]) => x === a && y === b);
  return (
    <Svg label="A source, three on the left, three on the right and a sink, every pipe of capacity one. The chosen pairs fill, one unit each, through source and sink; the rest stay empty. A pair is chosen or not, never half. Bipartite matching and Hopcroft-Karp, next" h={300}>
      <g opacity={draw}>
        {pairs.map(([a, b]) => {
          const ci = isChosen(a, b);
          const f = ci >= 0 ? pick(ci) : 0;
          return (
            <g key={`${a}${b}`}>
              <line x1={Lp[a][0] + 12} y1={Lp[a][1]} x2={Rp[b][0] - 12} y2={Rp[b][1]} stroke={C.taupe} strokeWidth={1.2} />
              {f > 0 && <line x1={Lp[a][0] + 12} y1={Lp[a][1]} x2={lerp(Lp[a][0] + 12, Rp[b][0] - 12, f)} y2={lerp(Lp[a][1], Rp[b][1], f)} stroke={C.caramel} strokeWidth={4} strokeLinecap="round" />}
            </g>
          );
        })}
        {Lp.map((p, i) => {
          const ci = chosen.findIndex(([x]) => x === i);
          return <line key={`s${i}`} x1={S[0] + 12} y1={S[1]} x2={p[0] - 12} y2={p[1]} stroke={pick(ci) >= 1 ? C.crema : C.taupe} strokeWidth={pick(ci) >= 1 ? 3 : 1.2} />;
        })}
        {Rp.map((p, i) => {
          const ci = chosen.findIndex(([, y]) => y === i);
          return <line key={`t${i}`} x1={p[0] + 12} y1={p[1]} x2={Tt[0] - 12} y2={Tt[1]} stroke={ci >= 0 && pick(ci) >= 1 ? C.crema : C.taupe} strokeWidth={ci >= 0 && pick(ci) >= 1 ? 3 : 1.2} />;
        })}
        {[S, Tt, ...Lp, ...Rp].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={11} fill={C.band} stroke={C.crema} strokeWidth={1.6} />)}
        <T x={S[0]} y={S[1] + 30} s={12} f={C.latte} a="middle">source</T>
        <T x={Tt[0]} y={Tt[1] + 30} s={12} f={C.latte} a="middle">sink</T>
      </g>
      {next <= 0 && <T x={300} y={278} s={13} f={C.crema} a="middle" o={cap}>every pipe 1: a pair is in or out</T>}
      {next > 0 && <T x={300} y={278} s={13} f={C.caramel} a="middle" o={next}>bipartite matching, next</T>}
    </Svg>
  );
}
