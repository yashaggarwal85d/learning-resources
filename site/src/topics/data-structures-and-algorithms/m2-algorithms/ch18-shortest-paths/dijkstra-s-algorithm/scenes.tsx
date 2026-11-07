import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = a vertex with a tentative distance; latte = secondary labels (an
// edge weight, a heap entry); taupe = a settled vertex; caramel = the thing to look at this beat (the vertex just
// popped, the edge just relaxed); cherryText = the bad outcome (a negative edge, a wrong distance, a stale entry).
// Every printed number is examples.py's: WEIGHTED_ADJ 0→1 (4), 0→2 (1), 2→1 (2), 1→3 (1), 2→3 (5), 3→4 (3) with
// distances [0, 3, 1, 4, 7]; the counterexample s→a (2), s→b (5), b→a (−10): a settled at 2, the true cost −5; lazy
// deletion's 6 pushes and 2 stale pops against decrease-key's 6 decreases. The trace runs here by the same loop.

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
function Arrow({ from, to, stroke = C.line, w = 1.5, p = 1, o = 1 }: { from: P; to: P; stroke?: string; w?: number; p?: number; o?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const sx = x1 + ux * 17, sy = y1 + uy * 17;
  const ex = x2 - ux * 19, ey = y2 - uy * 19;
  const q = clamp(p, 0, 1);
  if (q <= 0) return null;
  const bx = lerp(sx, ex, q), by = lerp(sy, ey, q);
  return (
    <g opacity={o}>
      <line x1={sx} y1={sy} x2={bx} y2={by} stroke={stroke} strokeWidth={w} />
      <path d={`M${bx} ${by} L${bx - ux * 9 - uy * 5} ${by - uy * 9 + ux * 5} L${bx - ux * 9 + uy * 5} ${by - uy * 9 - ux * 5} Z`} fill={stroke} />
    </g>
  );
}

/** An edge weight, set off the edge's midpoint to one side. */
function Weight({ from, to, w, f = C.latte, side = 1, o = 1 }: { from: P; to: P; w: string; f?: string; side?: number; o?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / len) * side, ny = ((x2 - x1) / len) * side;
  return <T x={(x1 + x2) / 2 + nx * 14} y={(y1 + y2) / 2 + ny * 14 + 4} s={12} f={f} a="middle" o={o}>{w}</T>;
}

function Vertex({ at, label, stroke = C.latte, text = C.crema, w = 2, o = 1 }: { at: P; label: string; stroke?: string; text?: string; w?: number; o?: number }) {
  return (
    <g opacity={o}>
      <circle cx={at[0]} cy={at[1]} r={16} fill={C.band} stroke={stroke} strokeWidth={w} />
      <T x={at[0]} y={at[1] + 5} s={13} f={text} a="middle">{label}</T>
    </g>
  );
}

// examples.py's WEIGHTED_ADJ.
const ADJ: Record<number, [number, number][]> = { 0: [[1, 4], [2, 1]], 1: [[3, 1]], 2: [[1, 2], [3, 5]], 3: [[4, 3]], 4: [] };
const POS: Record<number, P> = { 0: [70, 105], 1: [200, 45], 2: [200, 165], 3: [340, 105], 4: [480, 105] };
const EDGES: [number, number, number][] = [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5], [3, 4, 3]];
const SIDE: Record<string, number> = { '0-1': -1, '0-2': 1, '2-1': -1, '1-3': -1, '2-3': 1, '3-4': -1 };
/** Where a vertex's distance label sits: above for the top row, below for the bottom, above-right otherwise. */
const DPOS = (v: number): P => {
  const [x, y] = POS[v];
  return v === 2 ? [x, y + 38] : [x, y - 26];
};

type Ev = { u: number; d: number; stale: boolean; relax: { v: number; nd: number }[]; heapAfter: [number, number][] };
/** examples.py's dijkstra on WEIGHTED_ADJ: every pop (settle or stale skip), the improvements it pushes, the heap after. */
function trace() {
  const dist = [0, Infinity, Infinity, Infinity, Infinity];
  const visited = [false, false, false, false, false];
  let heap: [number, number][] = [[0, 0]];
  const ev: Ev[] = [];
  const sort = (h: [number, number][]) => [...h].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  while (heap.length) {
    heap = sort(heap);
    const [d, u] = heap.shift()!;
    if (visited[u]) {
      ev.push({ u, d, stale: true, relax: [], heapAfter: sort(heap) });
      continue;
    }
    visited[u] = true;
    const relax: { v: number; nd: number }[] = [];
    for (const [v, w] of ADJ[u]) {
      if (visited[v]) continue;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        heap.push([dist[v], v]);
        relax.push({ v, nd: dist[v] });
      }
    }
    ev.push({ u, d, stale: false, relax, heapAfter: sort(heap) });
  }
  return { ev, dist };
}
const DIJ = trace();
const SETTLE_ORDER = DIJ.ev.filter((e) => !e.stale).map((e) => e.u); // [0, 2, 1, 3, 4]

function Graph({ edgeStroke, vstroke, wo = 1 }: { edgeStroke?: (u: number, v: number) => string; vstroke?: (v: number) => string; wo?: number }) {
  return (
    <g>
      {EDGES.map(([u, v, w]) => (
        <g key={`${u}${v}`}>
          <Arrow from={POS[u]} to={POS[v]} stroke={edgeStroke?.(u, v) ?? C.line} w={edgeStroke && edgeStroke(u, v) !== C.line ? 2.5 : 1.5} />
          <Weight from={POS[u]} to={POS[v]} w={String(w)} side={SIDE[`${u}-${v}`]} o={wo} />
        </g>
      ))}
      {[0, 1, 2, 3, 4].map((v) => <Vertex key={v} at={POS[v]} label={String(v)} stroke={vstroke?.(v) ?? C.latte} />)}
    </g>
  );
}

// 1 · Opening. The road graph with its drive times; the cities lock in one at a time, closest first, each distance
// final the moment it appears: 0, then 1 at city 2, 3 at city 1, 4 at city 3, 7 at city 4.
export function Opening({ t }: StepCtx) {
  const locks = SETTLE_ORDER.map((_, i) => easeOut(seg(t, 0.5 + i * 0.4, 0.8 + i * 0.4)));
  const cap = easeOut(seg(t, 2.7, 3.2));
  return (
    <Svg label="A road graph with drive times on each road. The cities lock in one at a time, closest first: 0 at the start, 1, 3, 4, then 7, each final the moment it appears" h={270}>
      <Graph vstroke={(v) => (locks[SETTLE_ORDER.indexOf(v)] > 0.5 ? C.caramel : C.latte)} />
      {SETTLE_ORDER.map((v, i) => {
        const [x, y] = DPOS(v);
        return <T key={v} x={x} y={y} s={13} f={C.caramel} a="middle" o={locks[i]}>{String(DIJ.dist[v])}</T>;
      })}
      <T x={300} y={236} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.3, 0.8)) * (1 - cap)}>closest first, never reconsidered</T>
      <T x={300} y={236} s={13} f={C.caramel} a="middle" o={cap}>as long as no road shortens a trip</T>
    </Svg>
  );
}

// examples.py's NEGATIVE_COUNTEREXAMPLE_ADJ: s(0) → a(1) 2, s → b(2) 5, b → a −10.
const NPOS: Record<string, P> = { s: [110, 110], a: [330, 50], b: [330, 175] };

function NegGraph({ neg = C.cherryText, negW = 2, aStroke = C.latte, bStroke = C.latte, sStroke = C.latte }: { neg?: string; negW?: number; aStroke?: string; bStroke?: string; sStroke?: string }) {
  return (
    <g>
      <Arrow from={NPOS.s} to={NPOS.a} />
      <Weight from={NPOS.s} to={NPOS.a} w="2" side={-1} />
      <Arrow from={NPOS.s} to={NPOS.b} />
      <Weight from={NPOS.s} to={NPOS.b} w="5" side={1} />
      <Arrow from={NPOS.b} to={NPOS.a} stroke={neg} w={negW} />
      <Weight from={NPOS.b} to={NPOS.a} w="−10" f={C.cherryText} side={1} />
      <Vertex at={NPOS.s} label="s" stroke={sStroke} />
      <Vertex at={NPOS.a} label="a" stroke={aStroke} />
      <Vertex at={NPOS.b} label="b" stroke={bStroke} />
    </g>
  );
}

// 2 · PredictNegative. The three-vertex graph with its one negative edge pulsing. After answering: a settles at 2 and
// locks; the route s → b → a lights in red and costs −5.
export function PredictNegative({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const lock = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const route = answered ? easeInOut(seg(s, 0.7, 1.4)) : 0;
  const cap = answered ? easeOut(seg(s, 1.4, 1.8)) : 0;
  const [sx, sy] = NPOS.s;
  const [bx, by] = NPOS.b;
  const [ax, ay] = NPOS.a;
  const r1 = clamp(route * 2, 0, 1), r2 = clamp(route * 2 - 1, 0, 1);
  return (
    <Svg label="Three vertices: s to a costs 2, s to b costs 5, and b to a costs minus 10, the one negative edge, pulsing. After answering: a settles at 2; the route s, b, a lights in red and costs minus 5" h={260}>
      <NegGraph negW={answered ? 2 : 1.5 + 1.5 * pulse} aStroke={lock > 0.5 ? C.caramel : C.latte} />
      {answered && <T x={ax + 30} y={ay + 5} s={13} f={C.caramel} o={lock}>settled: 2</T>}
      {answered && route > 0 && (
        <g>
          <line x1={sx} y1={sy} x2={lerp(sx, bx, r1)} y2={lerp(sy, by, r1)} stroke={C.cherryText} strokeWidth={3} opacity={0.7} />
          {r2 > 0 && <line x1={bx} y1={by} x2={lerp(bx, ax, r2)} y2={lerp(by, ay, r2)} stroke={C.cherryText} strokeWidth={3} opacity={0.7} />}
        </g>
      )}
      {answered && <T x={ax + 30} y={ay + 26} s={13} f={C.cherryText} o={cap}>true cost: −5</T>}
      {!answered && <T x={300} y={232} s={13} f={C.crema} a="middle">one negative edge: still correct?</T>}
      {answered && <T x={300} y={232} s={13} f={C.cherryText} a="middle" o={cap}>a settled vertex, and it's wrong</T>}
    </Svg>
  );
}

// 3 · DijkstraMechanism. examples.py's dijkstra on WEIGHTED_ADJ, one pop per beat: the closest entry leaves the heap,
// its vertex settles, each improving edge flashes and a new entry joins. Two pops find vertices already settled and
// are skipped. Distances end at 0, 3, 1, 4, 7.
const PB = 0.55;
export function DijkstraMechanism({ t }: StepCtx) {
  const k = clamp(Math.floor((t - 0.3) / PB), -1, DIJ.ev.length - 1);
  const p = k < 0 ? 0 : clamp((t - 0.3 - k * PB) / PB, 0, 1);
  const done = t > 0.3 + DIJ.ev.length * PB + 0.05;
  const cur = k >= 0 && !done ? DIJ.ev[k] : null;
  const relaxed = cur && easeOut(seg(p, 0.35, 0.7)) > 0.5;
  // Distances and settled set as of this beat.
  const dist: (number | null)[] = [0, null, null, null, null];
  const settled = new Set<number>();
  const upto = done ? DIJ.ev.length : k + (cur ? 1 : 0);
  DIJ.ev.slice(0, upto).forEach((e, i) => {
    if (!e.stale) settled.add(e.u);
    if (i < k || relaxed || done) e.relax.forEach((r) => (dist[r.v] = r.nd));
  });
  const heap = cur ? (relaxed ? cur.heapAfter : k > 0 ? DIJ.ev[k - 1].heapAfter.slice(1) : []) : done ? [] : [[0, 0] as [number, number]];
  const freshRelax = cur && relaxed ? cur.relax.map((r) => r.v) : [];
  return (
    <Svg label="Dijkstra's algorithm on the five-vertex graph, one pop per beat: the closest heap entry leaves, its vertex settles, each improving edge flashes and a new entry joins the heap. Two pops find vertices already settled and are skipped. Distances end at 0, 3, 1, 4 and 7" h={300}>
      <Graph
        edgeStroke={(u, v) => (cur && !cur.stale && cur.u === u && freshRelax.includes(v) ? C.caramel : C.line)}
        vstroke={(v) => (cur?.u === v ? (cur.stale ? C.cherryText : C.caramel) : settled.has(v) ? C.taupe : dist[v] !== null ? C.crema : C.mocha)}
      />
      {[0, 1, 2, 3, 4].map((v) => {
        const [x, y] = DPOS(v);
        const fresh = freshRelax.includes(v);
        return (
          <T key={v} x={x} y={y} s={13} f={fresh ? C.caramel : settled.has(v) ? C.crema : C.latte} a="middle">
            {dist[v] === null ? '∞' : String(dist[v])}
          </T>
        );
      })}
      <T x={30} y={248} s={12} f={C.latte}>heap</T>
      {heap.map(([d, v], i) => (
        <g key={`${d}-${v}`}>
          <rect x={90 + i * 74} y={230} width={64} height={26} rx={4} fill={C.band} stroke={i === 0 ? C.crema : C.latte} />
          <T x={122 + i * 74} y={248} s={12} f={C.crema} a="middle">{`${v}: ${d}`}</T>
        </g>
      ))}
      {cur && (
        <T x={540} y={212} s={12} f={cur.stale ? C.cherryText : C.caramel} a="end" o={easeOut(seg(p, 0, 0.25))}>
          {cur.stale ? `pop ${cur.u}: ${cur.d}, stale, skip` : `pop ${cur.u}: ${cur.d}, settle`}
        </T>
      )}
      <T x={300} y={290} s={13} f={C.caramel} a="middle" o={done ? 1 : 0}>each vertex final the moment it's popped</T>
    </Svg>
  );
}

// 4 · NegativeFailure. The counterexample, run: s settles at 0 and offers a 2 and b 5. a pops first and settles at 2.
// b settles at 5; its edge to a offers 5 − 10 = −5, but a is already settled and the offer is thrown away.
export function NegativeFailure({ t }: StepCtx) {
  const s0 = easeOut(seg(t, 0.3, 0.7));
  const offer = easeOut(seg(t, 0.7, 1.1));
  const aSet = easeOut(seg(t, 1.3, 1.7));
  const bSet = easeOut(seg(t, 1.9, 2.3));
  const try_ = easeInOut(seg(t, 2.4, 3.0));
  const reject = easeOut(seg(t, 3.0, 3.4));
  const [ax, ay] = NPOS.a;
  const [bx, by] = NPOS.b;
  const [sx, sy] = NPOS.s;
  const dx = lerp(bx, ax, try_), dy = lerp(by, ay, try_);
  return (
    <Svg label="The counterexample run step by step: s settles at 0 and offers a 2 and b 5; a settles at 2; b settles at 5, and its edge offers a minus 5, but a is already settled and the offer is thrown away" h={260}>
      <NegGraph aStroke={aSet > 0.5 ? C.caramel : C.latte} bStroke={bSet > 0.5 ? C.caramel : C.latte} sStroke={s0 > 0.5 ? C.taupe : C.latte} />
      <T x={sx} y={sy - 26} s={13} f={C.crema} a="middle" o={s0}>0</T>
      <T x={ax + 30} y={ay + 5} s={13} f={aSet > 0.5 ? C.caramel : C.crema} o={offer}>{aSet > 0.5 ? '2, settled' : '2'}</T>
      <T x={bx + 30} y={by + 5} s={13} f={bSet > 0.5 ? C.caramel : C.crema} o={offer}>{bSet > 0.5 ? '5, settled' : '5'}</T>
      {try_ > 0 && reject < 1 && (
        <g opacity={1 - reject}>
          <rect x={dx - 18} y={dy - 12} width={36} height={22} rx={4} fill={C.band} stroke={C.cherryText} />
          <T x={dx} y={dy + 4} s={12} f={C.cherryText} a="middle">−5</T>
        </g>
      )}
      <g opacity={reject}>
        <line x1={ax + 22} y1={ay - 18} x2={ax + 50} y2={ay - 40} stroke={C.cherryText} strokeWidth={2} />
        <T x={ax + 56} y={ay - 38} s={12} f={C.cherryText}>−5 offered, ignored</T>
      </g>
      <T x={300} y={232} s={13} f={C.cherryText} a="middle" o={reject}>a keeps 2; the true shortest is −5</T>
    </Svg>
  );
}

// 5 · LazyVsDecreaseKey. examples.py's two runs on WEIGHTED_ADJ. Left, lazy deletion pushes every improvement as a new
// entry: 1:4, 2:1, 1:3, 3:6, 3:4, 4:7. Right, decrease-key keeps one slot per vertex and rewrites it in place. After
// answering: 1:4 and 3:6 turn red, stale, each one more pop: 6 pushes and 2 stale pops against 6 decreases.
const PUSHES: [number, number][] = DIJ.ev.flatMap((e) => e.relax.map((r) => [r.v, r.nd] as [number, number]));
const STALE = new Set(DIJ.ev.filter((e) => e.stale).map((e) => `${e.u}:${e.d}`));
export function LazyVsDecreaseKey({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const shown = PUSHES.map((_, i) => easeOut(seg(t, 0.3 + i * 0.25, 0.5 + i * 0.25)));
  const red = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const cap = answered ? easeOut(seg(s, 0.8, 1.2)) : 0;
  // Decrease-key's slots, as of each push: the latest value for each vertex.
  const slots: (number | null)[] = [0, null, null, null, null];
  PUSHES.forEach(([v, d], i) => {
    if (shown[i] > 0.5) slots[v] = d;
  });
  const lastWritten = PUSHES.reduce((m, [v], i) => (shown[i] > 0.5 ? v : m), -1);
  return (
    <Svg label="Left: lazy deletion pushes every improvement as a new heap entry, six in all. Right: decrease-key keeps one slot per vertex and rewrites it in place. After answering: two of the lazy entries turn red as stale, six pushes and two stale pops against six decreases" h={280}>
      <T x={40} y={28} s={12} f={C.latte}>lazy: every improvement pushed</T>
      {PUSHES.map(([v, d], i) => {
        const stale = STALE.has(`${v}:${d}`);
        const x = 40 + (i % 3) * 80;
        const y = 44 + Math.floor(i / 3) * 40;
        return (
          <g key={i} opacity={shown[i]}>
            <rect x={x} y={y} width={66} height={28} rx={4} fill={C.band} stroke={stale && red > 0 ? C.cherryText : C.crema} />
            <T x={x + 33} y={y + 19} s={13} f={stale && red > 0 ? C.cherryText : C.crema} a="middle">{`${v}:${d}`}</T>
            {stale && red > 0 && <line x1={x + 8} y1={y + 14} x2={x + 8 + 50 * red} y2={y + 14} stroke={C.cherryText} strokeWidth={1.5} />}
          </g>
        );
      })}
      <T x={330} y={28} s={12} f={C.latte}>decrease-key: one slot each</T>
      {[0, 1, 2, 3, 4].map((v) => (
        <g key={v}>
          <rect x={330 + v * 48} y={44} width={40} height={28} rx={4} fill={C.band} stroke={v === lastWritten && !answered ? C.caramel : C.latte} />
          <T x={350 + v * 48} y={63} s={13} f={slots[v] === null ? C.taupe : C.crema} a="middle">{slots[v] === null ? '∞' : String(slots[v])}</T>
          <T x={350 + v * 48} y={92} s={12} f={C.taupe} a="middle">{String(v)}</T>
        </g>
      ))}
      {!answered && <T x={300} y={180} s={13} f={C.crema} a="middle">same distances: the same queue work?</T>}
      {answered && (
        <g opacity={cap}>
          <T x={40} y={160} s={13} f={C.cherryText}>6 pushes + 2 stale pops</T>
          <T x={330} y={160} s={13} f={C.crema}>6 decreases</T>
          <T x={300} y={210} s={13} f={C.caramel} a="middle">lazy does strictly more</T>
        </g>
      )}
    </Svg>
  );
}

// 6 · Recap. The road graph settles closest first, every distance final. Then the counterexample's −10 edge appears
// beside it, and the settled 2 cracks red against the true −5: negative weights, next.
export function Recap({ t }: StepCtx) {
  const locks = SETTLE_ORDER.map((_, i) => easeOut(seg(t, 0.2 + i * 0.2, 0.4 + i * 0.2)));
  const swap = easeInOut(seg(t, 1.6, 2.1));
  const neg = easeOut(seg(t, 2.2, 2.7));
  const crack = easeOut(seg(t, 2.8, 3.3));
  const [ax, ay] = NPOS.a;
  return (
    <Svg label="The road graph settles closest first, every distance final. Then the three-vertex graph with its minus 10 edge replaces it, and the settled 2 at a turns red against the true minus 5: negative weights, next" h={260}>
      <g opacity={1 - swap}>
        <Graph vstroke={(v) => (locks[SETTLE_ORDER.indexOf(v)] > 0.5 ? C.caramel : C.latte)} />
        {SETTLE_ORDER.map((v, i) => {
          const [x, y] = DPOS(v);
          return <T key={v} x={x} y={y} s={13} f={C.caramel} a="middle" o={locks[i]}>{String(DIJ.dist[v])}</T>;
        })}
        <T x={300} y={236} s={13} f={C.crema} a="middle" o={locks[4]}>closest first: safe with no negative edge</T>
      </g>
      <g opacity={neg}>
        <NegGraph aStroke={crack > 0 ? C.cherryText : C.caramel} />
        <T x={ax + 30} y={ay + 5} s={13} f={crack > 0 ? C.cherryText : C.caramel}>{crack > 0.5 ? '2, true −5' : '2'}</T>
        <T x={300} y={236} s={13} f={C.cherryText} a="middle" o={crack}>one negative edge breaks it: next</T>
      </g>
    </Svg>
  );
}
