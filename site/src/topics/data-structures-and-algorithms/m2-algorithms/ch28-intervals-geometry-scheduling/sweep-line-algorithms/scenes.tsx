import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, shared with the previous topic): crema = something that exists; latte = secondary
// labels; taupe = not yet reached or discarded; caramel = the thing to look at right now (the sweep line, the pair being
// tested); cinnamon (rare) = the alternative compared; cherryText = the bad outcome or a crossing.
//
// Every number is examples.py's: the eight seeded segments (asserted: 28 pairs, 2 crossings, pairs 1-6 and 4-6); the
// buildings and their seven key points; the three rectangles, areas summing to 34, union 29; sparse segments at n = 50,
// 200, 1,000 with 3, 5 and 48 crossings against 1,225, 19,900 and 499,500 pairs. The pairs a sweep tests, the union's
// strips and the skyline's heap are replayed here by the loops examples.py runs and drawn without counts of their own.

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
const log10 = (x: number) => Math.log(x) / Math.LN10;

// ---------------------------------------------------------------------------------------------------------------------
// The eight segments (examples.py, random.seed(6)), the cross-product test, and the sweep's ordering.
type Pt = readonly [number, number];
type Sg = readonly [Pt, Pt];
const SEGS: Sg[] = [
  [[18, 2], [15, 8]], [[1, 0], [4, 18]], [[15, 11], [10, 0]], [[8, 15], [6, 13]],
  [[17, 17], [3, 6]], [[18, 17], [8, 19]], [[2, 13], [10, 2]], [[11, 13], [8, 14]],
];
const cross = (o: Pt, p: Pt, q: Pt) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
function intersects(a: Sg, b: Sg) {
  const d1 = cross(b[0], b[1], a[0]), d2 = cross(b[0], b[1], a[1]);
  const d3 = cross(a[0], a[1], b[0]), d4 = cross(a[0], a[1], b[1]);
  return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0;
}
const PAIRS: [number, number][] = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) PAIRS.push([i, j]);
const CROSSING = PAIRS.filter(([i, j]) => intersects(SEGS[i], SEGS[j])); // (1,6), (4,6)
function crossAt(a: Sg, b: Sg): Pt {
  const [p, q] = a, [r, s] = b;
  const d = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
  const u = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / d;
  return [p[0] + u * (q[0] - p[0]), p[1] + u * (q[1] - p[1])];
}
const XPTS = CROSSING.map(([i, j]) => crossAt(SEGS[i], SEGS[j]));
const lo = (s: Sg) => Math.min(s[0][0], s[1][0]);
const hi = (s: Sg) => Math.max(s[0][0], s[1][0]);
const yAt = (s: Sg, x: number) => lerp(s[0][1], s[1][1], (x - s[0][0]) / (s[1][0] - s[0][0]));
/** The segments the sweep line crosses at x, top to bottom. */
const activeAt = (x: number) => SEGS.map((s, i) => i).filter((i) => lo(SEGS[i]) <= x && x <= hi(SEGS[i])).sort((a, b) => yAt(SEGS[a], x) - yAt(SEGS[b], x));
const EVENT_X = Array.from(new Set([...SEGS.flatMap((s) => [s[0][0], s[1][0]]), ...XPTS.map((p) => p[0])])).sort((a, b) => a - b);
/** Every pair that is ever adjacent in the sweep's order: the only pairs a sweep tests. */
const NEIGHBOURS = (() => {
  const set = new Set<string>();
  for (let k = 0; k + 1 < EVENT_X.length; k++) {
    const a = activeAt((EVENT_X[k] + EVENT_X[k + 1]) / 2);
    for (let i = 0; i + 1 < a.length; i++) set.add([a[i], a[i + 1]].sort((x, y) => x - y).join('-'));
  }
  return set;
})();
const gx = (v: number) => 40 + v * 11;
const gy = (v: number) => 20 + v * 11;
function Field({ o = 1, hl, sweep }: { o?: number; hl?: (i: number) => string | undefined; sweep?: number }) {
  return (
    <g opacity={o}>
      {SEGS.map(([p, q], i) => <line key={i} x1={gx(p[0])} y1={gy(p[1])} x2={gx(q[0])} y2={gy(q[1])} stroke={hl?.(i) ?? C.crema} strokeWidth={1.6} />)}
      {sweep !== undefined && <line x1={gx(sweep)} y1={10} x2={gx(sweep)} y2={250} stroke={C.caramel} strokeWidth={2} />}
    </g>
  );
}
/** The 28 pairs as a triangle of cells, i down and j across. */
function PairGrid({ x, y, cell = 24, state }: { x: number; y: number; cell?: number; state: (i: number, j: number) => { fill?: string; stroke?: string } | null }) {
  return (
    <g>
      {PAIRS.map(([i, j]) => {
        const st = state(i, j);
        return <rect key={`${i}-${j}`} x={x + (j - 1) * cell} y={y + i * cell} width={cell - 3} height={cell - 3} rx={2} fill={st?.fill ?? 'none'} stroke={st?.stroke ?? C.mocha} strokeWidth={1.2} />;
      })}
    </g>
  );
}
const isCross = (i: number, j: number) => CROSSING.some(([a, b]) => a === i && b === j);

// 1 · Opening. The eight segments draw in; then a scan tests all 28 pairs, a triangle of cells filling one by one; two
// cells turn red, and the two crossings mark on the field.
export function Opening({ t }: StepCtx) {
  const k = stepIdx(t, 0.8, 3.0, PAIRS.length);
  const marks = t >= 3.0;
  return (
    <Svg label="Eight segments draw in. A scan tests every pair, twenty-eight cells filling one by one; two of them turn red, and the two crossings are marked on the segments" h={300}>
      {SEGS.map(([p, q], i) => {
        const d = easeOut(seg(t, 0.1 + i * 0.07, 0.5 + i * 0.07));
        return <line key={i} x1={gx(p[0])} y1={gy(p[1])} x2={lerp(gx(p[0]), gx(q[0]), d)} y2={lerp(gy(p[1]), gy(q[1]), d)} stroke={k >= 0 && PAIRS[k].includes(i) && !marks ? C.caramel : C.crema} strokeWidth={1.6} />;
      })}
      {marks && XPTS.map((p, i) => <circle key={i} cx={gx(p[0])} cy={gy(p[1])} r={6} fill="none" stroke={C.cherryText} strokeWidth={2} />)}
      <PairGrid x={330} y={30} state={(i, j) => {
        const n = PAIRS.findIndex(([a, b]) => a === i && b === j);
        if (n > k) return null;
        return isCross(i, j) ? { fill: C.cherryText, stroke: C.cherryText } : { fill: C.cocoa, stroke: n === k ? C.caramel : C.latte };
      }} />
      <T x={330} y={250} s={13} f={C.crema} o={k >= 0 ? 1 : 0}>{`${PAIRS.length} pairs tested`}</T>
      <T x={330} y={276} s={13} f={C.cherryText} o={marks ? 1 : 0}>{`${CROSSING.length} cross`}</T>
    </Svg>
  );
}

// 2 · PredictNeighborTests. The segments with a sweep line roaming across. After answering: the line sweeps once and
// only the pairs that become neighbours on it light in the grid; the two crossing pairs are among them.
export function PredictNeighborTests({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const roam = t < 0.3 ? 0 : ((((t - 0.3) / 2) % 1) + 1) % 1;
  const sw = answered ? seg(s, 0.2, 1.6) : roam;
  const x = lerp(0, 20, sw);
  const seen = new Set<string>();
  if (answered)
    for (let k = 0; k + 1 < EVENT_X.length && EVENT_X[k] < x; k++) {
      const a = activeAt((EVENT_X[k] + Math.min(EVENT_X[k + 1], x)) / 2);
      for (let i = 0; i + 1 < a.length; i++) seen.add([a[i], a[i + 1]].sort((p, q) => p - q).join('-'));
    }
  return (
    <Svg label="The eight segments with a sweep line roaming across them. After answering: the line sweeps once and only the pairs that become neighbours along it light in the grid of twenty-eight; both crossing pairs are among them" h={300}>
      <Field sweep={x} />
      <PairGrid x={330} y={30} state={(i, j) => (seen.has(`${i}-${j}`) ? { fill: isCross(i, j) ? C.cherryText : C.cocoa, stroke: isCross(i, j) ? C.cherryText : C.caramel } : null)} />
      {!answered && <T x={330} y={250} s={13} f={C.crema}>which pairs to test?</T>}
      {answered && <T x={330} y={250} s={13} f={C.caramel} o={sw >= 1 ? 1 : 0}>only new neighbours</T>}
    </Svg>
  );
}

// 3 · SweepSkeleton. Every endpoint drops to the x axis as an event; the sweep line jumps from event to event and the
// active set beside it, the segments it crosses top to bottom, updates only at those jumps.
export function SweepSkeleton({ t }: StepCtx) {
  const drop = easeOut(seg(t, 0.2, 0.7));
  const k = stepIdx(t, 0.9, 3.9, EVENT_X.length);
  const x = k >= 0 ? EVENT_X[k] + 0.01 : -1;
  const act = k >= 0 ? activeAt(x) : [];
  return (
    <Svg label="Every endpoint and crossing drops onto the axis as an event. The sweep line jumps from event to event; the active set beside it, the segments it crosses from top to bottom, changes only at those jumps" h={300}>
      <Field o={0.6} sweep={k >= 0 ? x : undefined} />
      <line x1={gx(0)} y1={262} x2={gx(20)} y2={262} stroke={C.line} />
      {EVENT_X.map((e, i) => <circle key={i} cx={gx(e)} cy={lerp(240, 262, drop)} r={3.5} fill={i <= k ? C.caramel : C.latte} opacity={drop} />)}
      <T x={gx(0)} y={286} s={12} f={C.latte} o={drop}>events</T>
      <T x={380} y={30} s={12} f={C.latte}>active set</T>
      {act.map((i, r) => (
        <g key={i}>
          <rect x={380} y={42 + r * 30} width={90} height={24} rx={3} fill={C.band} stroke={C.crema} />
          <T x={425} y={59 + r * 30} s={12} f={C.crema} a="middle">{`segment ${i + 1}`}</T>
        </g>
      ))}
    </Svg>
  );
}

// 4 · TieBreakingBug. Two half-open intervals that only touch. Top: end before start at the shared coordinate, the count
// goes 1, 0, 1. Bottom: start before end, the count briefly reads 2, a false overlap, in red.
export function TieBreakingBug({ t }: StepCtx) {
  const ix = (v: number) => 100 + v * 40;
  const at = 5;
  // Sweep to the shared coordinate, hold there while its two events are handled in turn, then sweep on.
  const x = t < 1.4 ? lerp(0, at, easeInOut(seg(t, 0.4, 1.4))) : t < 3.0 ? at : lerp(at, 10, easeInOut(seg(t, 3.0, 3.6)));
  const phase = t < 1.4 ? 0 : t < 2.2 ? 1 : t < 3.0 ? 2 : 3; // 1: first event handled, 2: both
  const good = x < 2 ? 0 : phase === 0 ? 1 : phase === 1 ? 0 : x < 8 ? 1 : 0;
  const bad = x < 2 ? 0 : phase === 0 ? 1 : phase === 1 ? 2 : x < 8 ? 1 : 0;
  const rows = [
    { y: 70, name: 'end first', n: good, c: C.caramel },
    { y: 180, name: 'start first', n: bad, c: bad > 1 ? C.cherryText : C.crema },
  ];
  return (
    <Svg label="Two half-open intervals that only touch at one coordinate. Top, the end is handled before the start there: the count goes one, zero, one. Bottom, the start comes first: the count briefly reads two, a false overlap, in red" h={300}>
      {rows.map((r) => (
        <g key={r.name}>
          <T x={30} y={r.y - 24} s={12} f={C.latte}>{r.name}</T>
          <rect x={ix(2)} y={r.y} width={ix(at) - ix(2)} height={16} rx={2} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <rect x={ix(at)} y={r.y + 22} width={ix(8) - ix(at)} height={16} rx={2} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={530} y={r.y + 24} s={16} f={r.c} a="end">{String(r.n)}</T>
        </g>
      ))}
      <line x1={ix(x)} y1={30} x2={ix(x)} y2={240} stroke={C.caramel} strokeWidth={2} />
      <line x1={ix(at)} y1={40} x2={ix(at)} y2={236} stroke={C.mocha} strokeDasharray="3 4" />
      <T x={300} y={284} s={13} f={C.cherryText} a="middle" o={phase >= 1 ? 1 : 0}>wrong order: touching counts as overlap</T>
    </Svg>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The skyline: examples.py's buildings, events and lazily-cleaned max-heap.
type Bd = readonly [number, number, number];
const BUILD: Bd[] = [[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]];
function skylineTrace() {
  const ev = BUILD.flatMap(([l, r, h]) => [[l, -h, r], [r, 0, 0]] as [number, number, number][]).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  let live: [number, number][] = [];
  const steps: { x: number; heap: [number, number][]; max: number; key: boolean }[] = [];
  let prev = 0;
  for (const [x, nh, end] of ev) {
    if (nh !== 0) live.push([-nh, end]);
    live.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    while (live.length && live[0][1] <= x) live = live.slice(1);
    const cur = live.length ? live[0][0] : 0;
    steps.push({ x, heap: live.map((e) => [...e] as [number, number]), max: cur, key: cur !== prev });
    prev = cur;
  }
  return steps;
}
const SKY = skylineTrace();
const KEYS = SKY.filter((s) => s.key).map((s) => [s.x, s.max] as const); // seven key points
const bx = (v: number) => 40 + v * 14;
const by = (h: number) => 230 - h * 12;
function Buildings({ o = 1 }: { o?: number }) {
  return <g opacity={o}>{BUILD.map(([l, r, h], i) => <rect key={i} x={bx(l)} y={by(h)} width={(r - l) * 14} height={h * 12} fill={C.crema} fillOpacity={0.06} stroke={C.taupe} strokeWidth={1.2} />)}</g>;
}
function Outline({ upto }: { upto: number }) {
  const pts: string[] = [`${bx(0)},${by(0)}`];
  let h = 0;
  KEYS.slice(0, upto + 1).forEach(([x, m]) => {
    pts.push(`${bx(x)},${by(h)}`, `${bx(x)},${by(m)}`);
    h = m;
  });
  return upto >= 0 ? <polyline points={pts.join(' ')} fill="none" stroke={C.caramel} strokeWidth={2.4} /> : null;
}

// 5 · SkylineSetup. The five buildings; the sweep visits each left and right edge. A left edge pushes its height onto the
// heap beside it; a right edge leaves its entry in place until it reaches the top, where it is popped, stale. The
// outline draws as the maximum changes.
export function SkylineSetup({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 3.6, SKY.length);
  const st = k >= 0 ? SKY[k] : null;
  const keysSoFar = k >= 0 ? SKY.slice(0, k + 1).filter((s) => s.key).length - 1 : -1;
  return (
    <Svg label="The five buildings; a sweep visits every left and right edge. A left edge pushes its height onto the max-heap beside it; an ended building's entry stays until it reaches the top and is popped, lazily. The outline draws itself as the maximum changes" h={300}>
      <Buildings />
      <line x1={bx(0)} y1={by(0)} x2={bx(25)} y2={by(0)} stroke={C.line} />
      <Outline upto={keysSoFar} />
      {st && <line x1={bx(st.x)} y1={20} x2={bx(st.x)} y2={by(0) + 6} stroke={C.caramel} strokeWidth={1.6} opacity={0.7} />}
      <T x={440} y={30} s={12} f={C.latte}>max-heap</T>
      {st && st.heap.map(([h, end], i) => (
        <g key={`${h}-${end}`}>
          <rect x={440} y={42 + i * 30} width={90} height={24} rx={3} fill={C.band} stroke={i === 0 ? C.caramel : end <= st.x ? C.mocha : C.latte} strokeWidth={i === 0 ? 2 : 1} />
          <T x={485} y={59 + i * 30} s={13} f={i === 0 ? C.caramel : end <= st.x ? C.taupe : C.crema} a="middle">{end <= st.x ? `${h} stale` : String(h)}</T>
        </g>
      ))}
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={k >= SKY.length - 1 ? 1 : 0}>stale tops are popped only when read</T>
    </Svg>
  );
}

// 6 · SkylineWalk. The outline alone; its seven key points light one by one, each where the maximum changed. Then
// a fixed window sliding along a row (a deque's job) set against the buildings' own uneven expiry (the heap's).
export function SkylineWalk({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 2.4, KEYS.length);
  const cap = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="The outline alone; its seven key points light one by one, each a moment the tallest building in view changed. A fixed sliding window would use a deque; here membership ends when a building ends, so a heap" h={300}>
      <Buildings o={0.5} />
      <line x1={bx(0)} y1={by(0)} x2={bx(25)} y2={by(0)} stroke={C.line} />
      <Outline upto={KEYS.length - 1} />
      {KEYS.map(([x, h], i) => (i <= k ? <circle key={i} cx={bx(x)} cy={by(h)} r={5} fill={i === k ? C.caramel : C.band} stroke={C.caramel} strokeWidth={2} /> : null))}
      <T x={440} y={70} s={13} f={C.caramel} o={k >= 0 ? 1 : 0}>{`${k + 1} key point${k ? 's' : ''}`}</T>
      <T x={440} y={130} s={12} f={C.latte} o={cap}>fixed window: deque</T>
      <T x={440} y={156} s={12} f={C.caramel} o={cap}>ends anywhere: heap</T>
    </Svg>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// The rectangle union: examples.py's three rectangles and its sweep over x with the covered length of y.
type Rc = readonly [number, number, number, number];
const RECTS: Rc[] = [[0, 0, 4, 3], [2, 1, 6, 5], [5, 0, 8, 2]];
const SUM_AREAS = RECTS.reduce((s, [a, b, c, d]) => s + (c - a) * (d - b), 0); // 34
function coveredLength(iv: [number, number][]) {
  if (!iv.length) return { len: 0, parts: [] as [number, number][] };
  const s = [...iv].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const parts: [number, number][] = [];
  let [cl, ch] = s[0];
  for (const [l, h] of s.slice(1)) {
    if (l > ch) {
      parts.push([cl, ch]);
      [cl, ch] = [l, h];
    } else ch = Math.max(ch, h);
  }
  parts.push([cl, ch]);
  return { len: parts.reduce((a, [l, h]) => a + h - l, 0), parts };
}
const STRIPS = (() => {
  const xs = Array.from(new Set(RECTS.flatMap((r) => [r[0], r[2]]))).sort((a, b) => a - b);
  const out: { x0: number; x1: number; parts: [number, number][]; total: number }[] = [];
  let total = 0;
  for (let i = 0; i + 1 < xs.length; i++) {
    const act = RECTS.filter((r) => r[0] <= xs[i] && xs[i] < r[2]).map((r) => [r[1], r[3]] as [number, number]);
    const c = coveredLength(act);
    total += c.len * (xs[i + 1] - xs[i]);
    out.push({ x0: xs[i], x1: xs[i + 1], parts: c.parts, total });
  }
  return out;
})();
const UNION = STRIPS[STRIPS.length - 1].total; // 29
const rx = (v: number) => 60 + v * 40;
const ry = (v: number) => 230 - v * 36;
function Rects({ o = 1 }: { o?: number }) {
  return <g opacity={o}>{RECTS.map(([a, b, c, d], i) => <rect key={i} x={rx(a)} y={ry(d)} width={(c - a) * 40} height={(d - b) * 36} fill="none" stroke={C.crema} strokeWidth={1.4} />)}</g>;
}
// The y coordinates, compressed: four elementary intervals as a segment tree's leaves.
const YS = Array.from(new Set(RECTS.flatMap((r) => [r[1], r[3]]))).sort((a, b) => a - b); // 0 1 2 3 5

// 7 · PredictUnionAreaStructure. The three rectangles; a sweep line roams, the y-extent it covers marked on a bar at the
// right. After answering: a small tree over the compressed y coordinates appears, its nodes lit where they are fully
// covered at the line.
export function PredictUnionAreaStructure({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const roam = t < 0.3 ? 0.5 : ((((t - 0.3) / 2.2) % 1) + 1) % 1;
  const x = answered ? 3 : roam * 8;
  const act = RECTS.filter((r) => r[0] <= x && x < r[2]).map((r) => [r[1], r[3]] as [number, number]);
  const cov = coveredLength(act).parts;
  const tree = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const leafCovered = (k: number) => act.some(([a, b]) => a <= YS[k] && YS[k + 1] <= b);
  const LX = (k: number) => 440 + k * 36;
  return (
    <Svg label="The three rectangles; a sweep line roams across them, the stretch of y it covers marked on a bar at the right. After answering: a small tree over the compressed y coordinates appears, its nodes lit where the line covers them fully" h={300}>
      <Rects />
      <line x1={rx(x)} y1={30} x2={rx(x)} y2={240} stroke={C.caramel} strokeWidth={2} />
      <line x1={410} y1={ry(0)} x2={410} y2={ry(5)} stroke={C.line} strokeWidth={4} />
      {cov.map(([a, b], i) => <line key={i} x1={410} y1={ry(a)} x2={410} y2={ry(b)} stroke={C.caramel} strokeWidth={4} />)}
      {!answered && <T x={440} y={130} s={16} f={C.caramel}>?</T>}
      {answered && (
        <g opacity={tree}>
          {[0, 1, 2, 3].map((k) => <rect key={k} x={LX(k)} y={200} width={30} height={20} rx={3} fill={leafCovered(k) ? C.caramel : C.band} stroke={C.latte} />)}
          {[0, 1].map((k) => <rect key={k} x={LX(2 * k) + 18} y={150} width={30} height={20} rx={3} fill={leafCovered(2 * k) && leafCovered(2 * k + 1) ? C.caramel : C.band} stroke={C.latte} />)}
          <rect x={LX(1) + 18} y={100} width={30} height={20} rx={3} fill={[0, 1, 2, 3].every(leafCovered) ? C.caramel : C.band} stroke={C.latte} />
          <T x={440} y={256} s={12} f={C.latte}>cover counts</T>
        </g>
      )}
    </Svg>
  );
}

// 8 · UnionAreaReveal. Each rectangle fills on its own and the overlaps darken: the separate areas sum to 34. Then a sweep
// fills the union strip by strip, the running area stepping up at each edge to 29.
export function UnionAreaReveal({ t }: StepCtx) {
  const each = (i: number) => easeOut(seg(t, 0.3 + i * 0.4, 0.6 + i * 0.4));
  const sumOn = t >= 1.6;
  const k = stepIdx(t, 2.0, 4.0, STRIPS.length);
  return (
    <Svg label="Each rectangle fills on its own and the overlaps darken: the separate areas sum to 34. Then a sweep fills the union strip by strip, the running area stepping up at each edge until it reaches 29" h={300}>
      {RECTS.map(([a, b, c, d], i) => <rect key={i} x={rx(a)} y={ry(d)} width={(c - a) * 40} height={(d - b) * 36} fill={C.cinnamon} opacity={0.22 * each(i) * (k >= 0 ? 0.4 : 1)} />)}
      {STRIPS.map((s, i) => (i <= k ? s.parts.map(([a, b], j) => <rect key={`${i}-${j}`} x={rx(s.x0)} y={ry(b)} width={(s.x1 - s.x0) * 40} height={(b - a) * 36} fill={C.crema} opacity={0.55} />) : null))}
      <Rects />
      {k >= 0 && <line x1={rx(STRIPS[k].x1)} y1={30} x2={rx(STRIPS[k].x1)} y2={240} stroke={C.caramel} strokeWidth={2} />}
      <T x={430} y={80} s={12} f={C.cinnamon} o={sumOn ? 1 : 0}>sum of areas</T>
      <T x={430} y={102} s={14} f={C.cinnamon} o={sumOn ? 1 : 0}>{String(SUM_AREAS)}</T>
      <T x={430} y={160} s={12} f={C.caramel} o={k >= 0 ? 1 : 0}>swept so far</T>
      {k >= 0 && <T x={430} y={182} s={14} f={C.caramel}>{String(STRIPS[k].total)}</T>}
      <T x={430} y={230} s={12} f={C.crema} o={k >= STRIPS.length - 1 ? 1 : 0}>{`union ${UNION}`}</T>
    </Svg>
  );
}

// 9 · BentleyOttmannSetup. The sweep crosses the eight segments; beside it the search tree's order, top to bottom. As two
// segments become neighbours they are tested; a crossing found ahead drops onto the axis as a new event, and when the
// sweep reaches it the two swap places in the order.
export function BentleyOttmannSetup({ t }: StepCtx) {
  const x = lerp(0, 20, seg(t, 0.3, 3.9));
  const act = t >= 0.3 ? activeAt(x) : [];
  const found = XPTS.map((p, i) => {
    const [a, b] = CROSSING[i];
    const firstAdj = EVENT_X.find((e, k) => k + 1 < EVENT_X.length && (() => {
      const o = activeAt((e + EVENT_X[k + 1]) / 2);
      const ia = o.indexOf(a), ib = o.indexOf(b);
      return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
    })());
    return { p, at: firstAdj ?? p[0] };
  });
  return (
    <Svg label="The sweep crosses the eight segments; beside it, the search tree's order from top to bottom. As two segments become neighbours they are tested; a crossing found ahead drops onto the axis as a new event, and when the sweep reaches it the two segments swap places in the order" h={300}>
      <Field sweep={t >= 0.3 ? x : undefined} hl={(i) => (act.includes(i) ? C.crema : C.taupe)} />
      <line x1={gx(0)} y1={262} x2={gx(20)} y2={262} stroke={C.line} />
      {found.map(({ p, at }, i) => (x >= at ? (
        <g key={i}>
          <circle cx={gx(p[0])} cy={gy(p[1])} r={6} fill="none" stroke={C.cherryText} strokeWidth={2} />
          <circle cx={gx(p[0])} cy={262} r={4} fill={C.cherryText} />
        </g>
      ) : null))}
      <T x={380} y={30} s={12} f={C.latte}>search tree order</T>
      {act.map((i, r) => (
        <g key={i}>
          <rect x={380} y={42 + r * 30} width={90} height={24} rx={3} fill={C.band} stroke={C.crema} />
          <T x={425} y={59 + r * 30} s={12} f={C.crema} a="middle">{`segment ${i + 1}`}</T>
        </g>
      ))}
      <T x={gx(0)} y={286} s={12} f={C.cherryText} o={x >= found[0].at ? 1 : 0}>crossings join the events</T>
    </Svg>
  );
}

// 10 · CorrectnessInvariant. Two segments that will cross, with a third between them. While it sits between, they are not
// neighbours and cannot swap; when the sweep passes its end, the two become neighbours, are tested, and their crossing
// is queued before the sweep reaches it.
export function CorrectnessInvariant({ t }: StepCtx) {
  const A: Sg = [[0, 2], [20, 14]], B: Sg = [[0, 14], [20, 4]], M: Sg = [[0, 8], [7, 8.5]];
  const P = crossAt(A, B);
  const sx = (v: number) => 60 + v * 22;
  const sy = (v: number) => 30 + v * 14;
  const x = lerp(0, 20, seg(t, 0.3, 3.4));
  const adjacent = x > M[1][0];
  const tested = adjacent;
  return (
    <Svg label="Two segments that will cross, and a third between them. While the third sits between, the two are not neighbours and cannot swap. When the sweep passes its end, the two become neighbours, are tested, and their crossing is queued before the sweep reaches it" h={300}>
      {[A, B].map((s, i) => <line key={i} x1={sx(s[0][0])} y1={sy(s[0][1])} x2={sx(s[1][0])} y2={sy(s[1][1])} stroke={tested ? C.caramel : C.crema} strokeWidth={2} />)}
      <line x1={sx(M[0][0])} y1={sy(M[0][1])} x2={sx(M[1][0])} y2={sy(M[1][1])} stroke={adjacent ? C.taupe : C.cinnamon} strokeWidth={2} />
      <line x1={sx(x)} y1={14} x2={sx(x)} y2={sy(16)} stroke={C.caramel} strokeWidth={1.6} opacity={0.8} />
      {tested && <circle cx={sx(P[0])} cy={sy(P[1])} r={7} fill="none" stroke={C.cherryText} strokeWidth={2} />}
      {!adjacent && <T x={300} y={284} s={13} f={C.cinnamon} a="middle">a third between them: no swap possible</T>}
      {adjacent && <T x={300} y={284} s={13} f={C.caramel} a="middle">neighbours now: tested, crossing queued</T>}
    </Svg>
  );
}

// 11 · PredictCrossoverPoint. Cost against the number of crossings k, at fixed n: the scan's n² is flat; the sweep's
// (n + k) log n climbs. After answering: the lines cross, and past it, with k near n², the sweep is the dearer one.
export function PredictCrossoverPoint({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X0 = 70, X1 = 540, Y0 = 230, Y1 = 40;
  const draw = easeInOut(seg(t, 0.3, 1.6));
  const scanY = 0.55;
  const sweepY = (f: number) => 0.04 + f * 0.9;
  const cx = (scanY - 0.04) / 0.9;
  const show = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const px = (f: number) => X0 + f * (X1 - X0);
  const py = (v: number) => Y0 - v * (Y0 - Y1);
  return (
    <Svg label="Cost against the number of crossings at a fixed number of segments: the scan's n squared is flat; the sweep's n plus k times log n climbs. After answering: the lines cross, and beyond it, with crossings near n squared, the sweep costs more" h={300}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">crossings k →</T>
      <T x={X0 - 8} y={Y1 + 4} s={12} f={C.latte} a="end">cost</T>
      <line x1={px(0)} y1={py(scanY)} x2={px(draw)} y2={py(scanY)} stroke={C.cinnamon} strokeWidth={2.4} />
      <line x1={px(0)} y1={py(sweepY(0))} x2={px(draw)} y2={py(sweepY(draw))} stroke={C.caramel} strokeWidth={2.4} />
      <T x={px(0.02)} y={py(scanY) - 10} s={12} f={C.cinnamon} o={draw >= 1 ? 1 : 0}>scan: n²</T>
      <T x={px(0.85) - 12} y={py(sweepY(0.85)) - 10} s={12} f={C.caramel} a="end" o={draw >= 1 ? 1 : 0}>sweep: (n + k) log n</T>
      {answered && <rect x={px(cx)} y={Y1} width={px(1) - px(cx)} height={Y0 - Y1} fill={C.cherry} opacity={0.25 * show} />}
      {!answered && <T x={300} y={284} s={13} f={C.crema} a="middle" o={draw}>k near n²: still faster?</T>}
      {answered && <T x={300} y={284} s={13} f={C.cherryText} a="middle" o={show}>dense crossings: the sweep loses</T>}
    </Svg>
  );
}

// 12 · ScalingCurve. Three rows, n = 50, 200, 1,000, on one log axis: the pairs a scan tests (blue) grow with n², the
// crossings found (white) stay small: 1,225 against 3, 19,900 against 5, 499,500 against 48.
const SCALE = [
  { n: '50', pairs: 1225, k: 3 },
  { n: '200', pairs: 19900, k: 5 },
  { n: '1,000', pairs: 499500, k: 48 },
];
export function ScalingCurve({ t }: StepCtx) {
  const X0 = 110, W = 420;
  const wOf = (v: number) => (log10(v) / 6) * W;
  return (
    <Svg label="Three rows on one log axis, n of 50, 200 and 1,000: the pairs a scan tests, in blue, grow with n squared, while the crossings found, in white, stay small: 1,225 against 3, 19,900 against 5, 499,500 against 48" h={300}>
      <T x={X0} y={24} s={12} f={C.latte}>log scale</T>
      {SCALE.map((r, i) => {
        const g = easeOut(seg(t, 0.3 + i * 1.1, 1.0 + i * 1.1));
        const y = 50 + i * 72;
        const on = g >= 1;
        return (
          <g key={r.n} opacity={t >= 0.3 + i * 1.1 ? 1 : 0}>
            <T x={X0 - 12} y={y + 22} s={13} f={C.crema} a="end">{`n = ${r.n}`}</T>
            <rect x={X0} y={y} width={wOf(r.pairs) * g} height={16} fill={C.cinnamon} />
            <rect x={X0} y={y + 22} width={Math.max(2, wOf(r.k) * g)} height={16} fill={C.caramel} />
            <T x={X0 + wOf(r.pairs) + 8} y={y + 13} s={12} f={C.cinnamon} o={on ? 1 : 0}>{r.pairs.toLocaleString('en-US')}</T>
            <T x={X0 + wOf(r.k) + 8} y={y + 35} s={12} f={C.caramel} o={on ? 1 : 0}>{String(r.k)}</T>
          </g>
        );
      })}
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={t >= 3.8 ? 1 : 0}>pairs grow as n²; crossings stay few</T>
    </Svg>
  );
}

// 13 · GeometricPrimitive. A segment and a point. As the point moves across, the shaded side flips and the sign beside it reads
// + then −. Then the point sits almost on the line with fractional coordinates: the sign flickers, red.
export function GeometricPrimitive({ t }: StepCtx) {
  const A: Pt = [2, 12], B: Pt = [18, 4];
  const cx = (v: number) => 60 + v * 22;
  const cy = (v: number) => 20 + v * 14;
  const m = seg(t, 0.4, 2.2);
  const P: Pt = [10, lerp(4, 12, m)];
  const sgn = Math.sign(cross(A, B, P));
  const fuzzy = t >= 2.6;
  const flick = fuzzy ? (Math.floor(t * 8) % 2 ? 1 : -1) : sgn;
  const Q: Pt = fuzzy ? [10, 8] : P;
  return (
    <Svg label="A segment and a point. As the point moves across the line, the shaded side flips and the sign of the cross product reads plus, then minus. Then the point sits almost on the line with fractional coordinates, and the sign flickers, in red" h={300}>
      <polygon points={`${cx(0)},${cy(0)} ${cx(20)},${cy(0)} ${cx(20)},${cy(lerp(A[1], B[1], 1.125))} ${cx(0)},${cy(lerp(A[1], B[1], -0.125))}`} fill={C.cinnamon} opacity={0.08} />
      <line x1={cx(A[0])} y1={cy(A[1])} x2={cx(B[0])} y2={cy(B[1])} stroke={C.crema} strokeWidth={2} />
      <circle cx={cx(Q[0])} cy={cy(Q[1])} r={6} fill={fuzzy ? C.cherryText : C.caramel} />
      <T x={540} y={80} s={13} f={C.latte} a="end">sign</T>
      <T x={540} y={110} s={20} f={fuzzy ? C.cherryText : C.caramel} a="end">{flick > 0 ? '+' : flick < 0 ? '−' : '0'}</T>
      {!fuzzy && <T x={300} y={284} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>integers: the sign is exact</T>}
      {fuzzy && <T x={300} y={284} s={13} f={C.cherryText} a="middle">floating point near zero: unreliable</T>}
    </Svg>
  );
}

// 14 · DuckDBIEJoin. Two tables' rows as bars; they sort on the first inequality (bars slide into order), merge into one
// sorted run, and the merged positions sort again on the second inequality: the sweep's idea, inside a join.
export function DuckDBIEJoin({ t }: StepCtx) {
  const L = [5, 2, 7, 3], R = [4, 6, 1, 8];
  const W2: Record<number, number> = { 5: 3, 2: 8, 7: 1, 3: 6, 4: 2, 6: 7, 1: 5, 8: 4 }; // each row's second key
  const s1 = easeInOut(seg(t, 0.4, 1.2));
  const mg = easeInOut(seg(t, 1.6, 2.4));
  const s2 = easeInOut(seg(t, 2.8, 3.6));
  const rank = (arr: number[], v: number) => [...arr].sort((a, b) => a - b).indexOf(v);
  const all = [...L.map((v) => ({ v, side: 0 })), ...R.map((v) => ({ v, side: 1 }))];
  const merged = [...all].sort((a, b) => a.v - b.v);
  return (
    <Svg label="Two tables' rows as bars. Each table sorts on the first inequality, bars sliding into order; the two merge into one sorted run; then the merged positions sort again on the second inequality: the same sort-the-endpoints idea, inside a query engine's join" h={300}>
      <T x={60} y={30} s={12} f={C.crema} o={1 - mg}>table A</T>
      <T x={330} y={30} s={12} f={C.cinnamon} o={1 - mg}>table B</T>
      {all.map((r, i) => {
        const own = r.side ? R : L;
        const idx = r.side ? i - L.length : i;
        const yA = 46 + lerp(idx, rank(own, r.v), s1) * 26;
        const xA = r.side ? 330 : 60;
        const m = merged.indexOf(r);
        const x = lerp(xA, 200, mg);
        const m2 = [...all].sort((a, b) => W2[a.v] - W2[b.v]).indexOf(r);
        const y = lerp(yA, 46 + lerp(m, m2, s2) * 26, mg);
        return <rect key={i} x={x} y={y} width={r.v * 22} height={18} rx={2} fill={r.side ? C.cinnamon : C.crema} opacity={0.85} />;
      })}
      <T x={300} y={284} s={13} f={C.crema} a="middle">{s2 > 0 ? 'sort again on the second condition' : mg > 0 ? 'merge the two sort orders' : 'sort each side on the first condition'}</T>
    </Svg>
  );
}

// 15 · Recap. Three small panels, each with its own sweep line passing: the skyline over a heap, the union over cover
// counts, the crossings over a search tree. Then the one skeleton beneath all three.
export function Recap({ t }: StepCtx) {
  const sw = seg(t, 0.3, 3.0);
  const cap = easeOut(seg(t, 3.3, 3.7));
  const panels = [
    { x: 20, name: 'skyline', ds: 'max-heap' },
    { x: 210, name: 'union area', ds: 'cover counts' },
    { x: 400, name: 'crossings', ds: 'search tree' },
  ];
  return (
    <Svg label="Three small panels, each with its own sweep line passing: the skyline over a max-heap, the union area over cover counts, the crossings over a search tree. One skeleton beneath all three: events, an active set, a tie rule" h={300}>
      {panels.map((p, i) => (
        <g key={p.name}>
          <rect x={p.x} y={30} width={180} height={150} rx={4} fill="none" stroke={C.mocha} />
          <g transform={`translate(${p.x + 10},${40}) scale(${i === 0 ? 0.42 : i === 1 ? 0.42 : 0.6})`}>
            {i === 0 && <polyline points={KEYS.reduce<string[]>((acc, [x, h], j) => [...acc, `${bx(x) - 40},${by(j ? KEYS[j - 1][1] : 0) - 50}`, `${bx(x) - 40},${by(h) - 50}`], []).join(' ')} fill="none" stroke={C.crema} strokeWidth={4} />}
            {i === 1 && RECTS.map(([a, b, c, d], j) => <rect key={j} x={rx(a) - 50} y={ry(d) - 20} width={(c - a) * 40} height={(d - b) * 36} fill="none" stroke={C.crema} strokeWidth={3} />)}
            {i === 2 && SEGS.map(([p0, q], j) => <line key={j} x1={gx(p0[0]) - 30} y1={gy(p0[1]) - 10} x2={gx(q[0]) - 30} y2={gy(q[1]) - 10} stroke={C.crema} strokeWidth={2.2} />)}
          </g>
          <line x1={p.x + 10 + sw * 160} y1={36} x2={p.x + 10 + sw * 160} y2={174} stroke={C.caramel} strokeWidth={2} />
          <T x={p.x + 90} y={204} s={12} f={C.crema} a="middle">{p.name}</T>
          <T x={p.x + 90} y={226} s={12} f={C.caramel} a="middle" o={sw >= 0.3 * (i + 1) ? 1 : 0}>{p.ds}</T>
        </g>
      ))}
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={cap}>events, an active set, a tie rule</T>
    </Svg>
  );
}
