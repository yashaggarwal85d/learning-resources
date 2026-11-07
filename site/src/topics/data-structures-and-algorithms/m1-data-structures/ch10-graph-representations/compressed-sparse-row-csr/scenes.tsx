import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a vertex or stored value; latte = labels; taupe = memory not yet touched;
// caramel = the array being built right now, the slice being read; cinnamon = the alternative being compared (the
// adjacency list's scattered allocations, the reverse scan); cherryText = a cache miss, a corrupted cursor. The
// small graph is examples.py's own (A..F, ten edges, A->B twice): offsets [0,3,5,7,9,10,10], targets in edge order,
// CSC offsets [0,0,2,4,6,8,10]. The large graph's hub positions are seed-dependent and drawn as shape only; its
// printed counts (1,995 and 250 cache lines, 8.0x) are examples.py's.

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

type Pt = [number, number];
const VS = ['A', 'B', 'C', 'D', 'E', 'F'];
const ES: [string, string][] = [['A', 'B'], ['A', 'C'], ['A', 'B'], ['B', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'E'], ['D', 'F'], ['E', 'F']];
const OFFSETS = [0, 3, 5, 7, 9, 10, 10];
const DEG = [3, 2, 2, 2, 1, 0];
const TARGETS = ES.map((e) => e[1]); // edges arrive sorted by source, so the scatter fills slots in edge order
const COL_OFFSETS = [0, 0, 2, 4, 6, 8, 10];
const COL_TARGETS = ['A', 'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E']; // sources, grouped by destination A..F
const CHAINS: Record<string, string[]> = { A: ['B', 'C', 'B'], B: ['C', 'D'], C: ['D', 'E'], D: ['E', 'F'], E: ['F'], F: [] };

/** A row of boxes; `vals[i]` undefined leaves box i empty. */
function Row({ x, y, w = 44, n, vals = [], hot = [], label, o = 1, c = C.crema, lc = C.latte }: { x: number; y: number; w?: number; n: number; vals?: (string | number | undefined)[]; hot?: number[]; label?: string; o?: number; c?: string; lc?: string }) {
  return (
    <g opacity={o}>
      {label && <T x={x} y={y - 10} s={12} f={lc}>{label}</T>}
      {Array.from({ length: n }, (_, i) => {
        const h = hot.includes(i);
        return (
          <g key={i}>
            <rect x={x + i * w} y={y} width={w - 4} height={26} rx={3} fill={C.roast} stroke={h ? C.caramel : vals[i] === undefined ? C.mocha : c} strokeWidth={h ? 2 : 1.1} />
            {vals[i] !== undefined && <T x={x + i * w + (w - 4) / 2} y={y + 18} s={13} f={h ? C.caramel : c} a="middle">{vals[i]}</T>}
          </g>
        );
      })}
    </g>
  );
}

function Check({ x, y, t, at, c = C.caramel }: { x: number; y: number; t: number; at: number; c?: string }) {
  return <Draw pts={[[x - 6, y], [x - 2, y + 5], [x + 7, y - 6]]} t={t} from={at} to={at + 0.2} stroke={c} w={2} pen={false} />;
}

// Scattered "heap" spots for the ten list entries (fixed, hand-placed).
const HEAP: Pt[] = [[330, 60], [470, 100], [390, 170], [520, 40], [300, 220], [450, 240], [540, 180], [360, 110], [500, 130], [420, 40]];

// 1 · Opening. The six chains of the adjacency list; then each of its ten entries drifts off into its own scattered
// spot on the heap, a pointer trailing back to the one before: one allocation and one pointer per edge.
export function Opening({ t }: StepCtx) {
  const RY = (i: number) => 40 + i * 34;
  const fly = (j: number) => easeInOut(seg(t, 1.0 + j * 0.1, 1.6 + j * 0.1));
  let j = -1;
  const entries: { v: string; w: string; i: number; k: number; j: number }[] = [];
  VS.forEach((v, i) => CHAINS[v].forEach((w, k) => entries.push({ v, w, i, k, j: ++j })));
  const pos = (e: (typeof entries)[number]): Pt => [lerp(70 + e.k * 44, HEAP[e.j][0], fly(e.j)), lerp(RY(e.i) - 14, HEAP[e.j][1], fly(e.j))];
  return (
    <Svg label="The adjacency list's ten entries each drift to their own scattered spot in memory, each a separate allocation linked by a pointer" h={290}>
      {VS.map((v, i) => <T key={v} x={30} y={RY(i)} s={13} f={C.crema} o={easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08))}>{v}</T>)}
      {entries.map((e) => {
        const prev = entries.find((p) => p.v === e.v && p.k === e.k - 1);
        const [x, y] = pos(e);
        const k = easeOut(seg(t, 0.2 + e.j * 0.05, 0.5 + e.j * 0.05));
        const src: Pt = prev ? [pos(prev)[0] + 18, pos(prev)[1] + 10] : [44, RY(e.i) - 5];
        return (
          <g key={e.j} opacity={k}>
            <line x1={src[0]} y1={src[1]} x2={x} y2={y + 10} stroke={fly(e.j) > 0 ? C.cinnamon : C.latte} strokeWidth={1} opacity={0.8} />
            <rect x={x} y={y} width={36} height={20} rx={3} fill={C.roast} stroke={fly(e.j) > 0 ? C.cinnamon : C.crema} strokeWidth={1.2} />
            <T x={x + 18} y={y + 15} s={12} f={C.crema} a="middle">{e.w}</T>
          </g>
        );
      })}
      <T x={30} y={262} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.4, 2.8))}>one allocation, one pointer, per edge</T>
      <T x={30} y={284} s={13} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.3))}>at a billion edges: a billion of each</T>
    </Svg>
  );
}

// 2 · Two flat arrays. The scattered entries gather into one flat row of 10 (targets, length E); above it a row of
// 7 (offsets, length V + 1). Its last box pulses: one more than there are vertices.
export function TwoArrays({ t }: StepCtx) {
  const gather = (j: number) => easeInOut(seg(t, 0.3 + j * 0.06, 1.1 + j * 0.06));
  const off = easeOut(seg(t, 1.4, 1.8));
  const extra = t > 2.2 ? 0.5 + 0.5 * Math.sin((t - 2.2) * 5) : 0;
  return (
    <Svg label="The scattered entries gather into one flat targets array of length E, ten; above it the offsets array of length V plus 1, seven, its extra last slot highlighted" h={270}>
      <Row x={40} y={70} n={7} label="offsets: V + 1 = 7" o={off} />
      <rect x={40 + 6 * 44 - 2} y={68} width={44} height={30} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} opacity={extra} />
      <T x={40 + 7 * 44 + 6} y={88} s={12} f={C.caramel} o={t > 2.2 ? 1 : 0}>one extra?</T>
      <T x={40} y={150} s={12} f={C.latte} o={gather(9)}>targets: E = 10</T>
      {TARGETS.map((w, j) => {
        const k = gather(j);
        const x = lerp(HEAP[j][0], 40 + j * 44, k);
        const y = lerp(HEAP[j][1] - 40, 160, k);
        return (
          <g key={j} opacity={1 - 0.0 * k}>
            <rect x={x} y={y} width={lerp(36, 40, k)} height={lerp(20, 26, k)} rx={3} fill={C.roast} stroke={k >= 1 ? C.mocha : C.cinnamon} strokeWidth={1.1} opacity={k > 0 ? 1 : 0.3} />
          </g>
        );
      })}
      <T x={40} y={236} s={13} f={C.crema} o={easeOut(seg(t, 1.8, 2.2))}>no per-vertex allocation at all</T>
    </Svg>
  );
}

// 3 · Pass one. Each edge is counted at its source (A's counter climbs to 3, B's to 2...). Then a running total
// sweeps left to right: each offsets box gets the total of every degree before it, the step "+3", "+2" shown
// between boxes; the extra last box ends at 10, the end of F's (empty) slice.
export function PassOneCount({ t }: StepCtx) {
  const counted = ES.filter((_, i) => t >= 0.3 + i * 0.12).length;
  const deg = VS.map((v) => ES.slice(0, counted).filter((e) => e[0] === v).length);
  const sweepAt = (i: number) => 1.9 + i * 0.32;
  const filled = OFFSETS.map((v, i) => (t >= sweepAt(i) ? v : undefined));
  const cur = OFFSETS.findIndex((_, i) => t < sweepAt(i));
  return (
    <Svg label="Each edge adds one to its source's count: A 3, B 2, C 2, D 2, E 1, F 0; a running total sweeps left to right to fill offsets 0, 3, 5, 7, 9, 10, 10" h={290}>
      <T x={40} y={24} s={12} f={C.latte}>pass one: count each source</T>
      {VS.map((v, i) => (
        <g key={v}>
          <T x={62 + i * 44} y={56} s={13} f={C.crema} a="middle">{v}</T>
          <T x={62 + i * 44} y={80} s={14} f={deg[i] > 0 ? C.caramel : C.latte} a="middle">{deg[i]}</T>
        </g>
      ))}
      <T x={40} y={118} s={12} f={C.latte}>offsets: running total</T>
      <Row x={40} y={150} n={7} vals={filled} hot={cur > 0 ? [cur - 1] : cur === -1 ? [6] : []} />
      {DEG.map((d, i) => (
        <T key={i} x={40 + i * 44 + 40} y={140} s={12} f={C.caramel} a="middle" o={easeOut(seg(t, sweepAt(i + 1) - 0.2, sweepAt(i + 1)))}>+{d}</T>
      ))}
      <T x={40 + 6 * 44 + 20} y={200} s={12} f={C.caramel} a="middle" o={easeOut(seg(t, sweepAt(6), sweepAt(6) + 0.3))}>end</T>
      <T x={40} y={250} s={13} f={C.crema} o={easeOut(seg(t, 4.0, 4.3))}>each box: every degree before it</T>
    </Svg>
  );
}

// 4 · Predict. The finished offsets; a write cursor hovers over it, pulsing: use offsets itself as the cursor?
// After answering: offsets is locked (its outline caramel, "where each slice starts"), and a separate cursor row,
// a copy, appears beneath it.
export function PassTwoPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const copy = answered ? easeOut(seg(s, 0.3, 0.8)) : 0;
  return (
    <Svg label="The finished offsets array with a write cursor hovering over it; after answering, offsets stays locked as where each slice starts and a separate copy becomes the cursor" h={270}>
      <Row x={40} y={70} n={7} vals={OFFSETS} label="offsets (finished)" c={answered ? C.caramel : C.crema} />
      {!answered && (
        <g opacity={pulse}>
          <path d={`M ${62} 46 l -6 -10 l 12 0 z`} fill={C.cherryText} />
          <T x={80} y={42} s={12} f={C.cherryText}>write here as you go?</T>
        </g>
      )}
      {answered && <T x={360} y={88} s={12} f={C.caramel} o={easeOut(seg(s, 0.1, 0.4))}>where slices start: keep</T>}
      <Row x={40} y={140} n={7} vals={OFFSETS} label="cursor: a copy" o={copy} c={C.cinnamon} lc={C.cinnamon} />
      {!answered && <T x={30} y={250} s={15} f={C.cherryText} o={pulse}>reuse offsets as the cursor?</T>}
      {answered && <T x={30} y={250} s={13} f={C.caramel} o={easeOut(seg(s, 0.9, 1.3))}>no: the cursor is its own copy</T>}
    </Svg>
  );
}

// 5 · Pass two, the scatter. Edge by edge: the edge appears, its target drops into targets at the slot its source's
// cursor points to, and that cursor ticks forward by one. Then A's slice, targets[0:3] = B, C, B, is set beside A's
// chain from the adjacency list: identical, multi-edge and all.
export function PassTwoScatter({ t }: StepCtx) {
  const at = (i: number) => 0.4 + i * 0.28;
  const done = ES.filter((_, i) => t >= at(i) + 0.2).length;
  const cursor = VS.map((v, i) => OFFSETS[i] + ES.slice(0, done).filter((e) => e[0] === v).length);
  const curEdge = ES.findIndex((_, i) => t < at(i) + 0.2);
  const cmp = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="Each edge in turn drops its target into the slot its source's cursor points at, and that cursor moves on; A's finished slice B, C, B matches A's adjacency-list chain" h={320}>
      <Row x={40} y={40} n={7} vals={OFFSETS} label="offsets" c={C.latte} />
      <Row x={40} y={100} n={7} vals={[...cursor, OFFSETS[6]]} label="cursor" c={C.cinnamon} lc={C.cinnamon} hot={curEdge >= 0 && t >= at(curEdge) ? [VS.indexOf(ES[curEdge][0])] : []} />
      {curEdge >= 0 && t >= at(curEdge) && <T x={360} y={118} s={14} f={C.caramel}>{ES[curEdge][0]} &rarr; {ES[curEdge][1]}</T>}
      <Row x={40} y={170} n={10} vals={TARGETS.map((w, i) => (i < done ? w : undefined))} label="targets" hot={curEdge >= 0 && t >= at(curEdge) ? [curEdge] : []} />
      {ES.map(([, w], i) => {
        const k = easeIn(seg(t, at(i), at(i) + 0.2));
        return k > 0 && k < 1 ? <T key={i} x={40 + i * 44 + 20} y={lerp(140, 188, k)} s={13} f={C.caramel} a="middle">{w}</T> : null;
      })}
      <g opacity={cmp}>
        <path d={`M ${40} 202 L ${40} 210 L ${40 + 3 * 44 - 4} 210 L ${40 + 3 * 44 - 4} 202`} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={40} y={234} s={12} f={C.caramel}>A&apos;s slice</T>
        <T x={40} y={276} s={12} f={C.latte}>A&apos;s chain</T>
        {CHAINS.A.map((w, j) => (
          <g key={j}>
            <rect x={130 + j * 44} y={260} width={36} height={22} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.1} />
            <T x={148 + j * 44} y={276} s={13} f={C.crema} a="middle">{w}</T>
          </g>
        ))}
        <T x={270} y={276} s={13} f={C.caramel}>same three</T>
      </g>
      <Check x={392} y={270} t={t} at={4.2} />
    </Svg>
  );
}
const easeIn = (x: number) => x * x;

// 6 · Predict. CSR's targets, with each slot's source shown above it; F pulses: who points at F? After answering, a
// marker scans every one of the ten slots, finding F twice (slots 8 and 9): a full scan, not a lookup.
export function CSCPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const scan = answered ? seg(s, 0.2, 1.4) : 0;
  const at = Math.min(9, Math.floor(scan * 10));
  return (
    <Svg label="CSR's targets ordered by source; asking who points at F means scanning every slot, finding F only at the last two; a second structure ordered by destination answers it directly" h={270}>
      {ES.map(([u], i) => <T key={i} x={40 + i * 44 + 20} y={50} s={12} f={C.latte} a="middle">{u}</T>)}
      <T x={40} y={30} s={12} f={C.latte}>source</T>
      <Row x={40} y={60} n={10} vals={TARGETS} hot={answered ? TARGETS.map((w, i) => (w === 'F' && i <= at ? i : -1)).filter((i) => i >= 0) : []} />
      {answered && scan < 1 && <rect x={40 + at * 44 - 2} y={58} width={44} height={30} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={2} />}
      <T x={40} y={130} s={16} f={C.caramel} o={answered ? 1 : pulse}>who points at F?</T>
      {answered && <T x={40} y={170} s={13} f={C.cinnamon} o={easeOut(seg(s, 1.3, 1.6))}>this array: scan all ten</T>}
      {answered && <T x={40} y={196} s={13} f={C.caramel} o={easeOut(seg(s, 1.6, 1.9))}>a second pair, by destination</T>}
    </Svg>
  );
}

// 7 · CSC. Each edge flips (A->B becomes B<-A) and the identical two passes run by destination: offsets fill with
// in-degree totals (0, 0, 2, 4, 6, 8, 10), the sources scatter into place. F's slice reads D, E; B's reads A, A,
// both halves of the multi-edge.
export function CSCReveal({ t }: StepCtx) {
  const flip = easeInOut(seg(t, 0.2, 0.8));
  const offAt = (i: number) => 1.0 + i * 0.12;
  const scatAt = (i: number) => 1.9 + i * 0.12;
  const slices = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="Every edge flipped to destination first; the same two passes give CSC offsets 0, 0, 2, 4, 6, 8, 10 and sources grouped by destination; F's slice is D, E and B's is A, A" h={300}>
      <T x={40} y={24} s={12} f={C.latte}>flip every edge</T>
      {ES.map(([u, v], i) => (
        <g key={i}>
          <T x={40 + i * 50} y={50} s={12} f={C.crema} o={1 - flip}>{u}&rarr;{v}</T>
          <T x={40 + i * 50} y={50} s={12} f={C.cinnamon} o={flip}>{v}&larr;{u}</T>
        </g>
      ))}
      <Row x={40} y={100} n={7} vals={COL_OFFSETS.map((v, i) => (t >= offAt(i) ? v : undefined))} label="CSC offsets (by destination)" />
      <Row x={40} y={170} n={10} vals={COL_TARGETS.map((v, i) => (t >= scatAt(i) ? v : undefined))} label="CSC sources" hot={slices > 0 ? [0, 1, 8, 9] : []} />
      <g opacity={slices}>
        <T x={40} y={230} s={13} f={C.caramel}>B&apos;s slice: A, A</T>
        <T x={40 + 8 * 44} y={230} s={13} f={C.caramel}>F&apos;s: D, E</T>
      </g>
      <T x={40} y={280} s={13} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>same two passes, swapped</T>
    </Svg>
  );
}

// Hub positions along the big id strip (shape only: the real ones are seed-dependent).
const HUBX = [62, 141, 188, 247, 305, 352, 418, 466, 503, 548];

// 8 · Zoom out. The ten-slot array stretches into a strip of two million ids. A few hubs light up, scattered;
// edges from everywhere converge on them, again and again: read constantly, sitting far apart.
export function WhyReorderHook({ t }: StepCtx) {
  const zoom = easeInOut(seg(t, 0.2, 1.0));
  const hubs = easeOut(seg(t, 1.1, 1.5));
  const srcs = Array.from({ length: 24 }, (_, i) => 40 + ((i * 97) % 520));
  return (
    <Svg label="The small array stretches into a strip of two million ids; a few hub vertices sit scattered across it and edges from everywhere keep landing on them" h={260}>
      <rect x={lerp(40, 30, zoom)} y={110} width={lerp(436, 540, zoom)} height={lerp(26, 12, zoom)} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      <T x={30} y={98} s={12} f={C.latte} o={zoom}>vertex ids, 0 to 2,000,000</T>
      {HUBX.map((x, i) => <circle key={i} cx={x} cy={116} r={5} fill={C.caramel} opacity={hubs} />)}
      {srcs.map((sx, i) => {
        const h = HUBX[(i * 7) % HUBX.length];
        const k = clamp((t - 1.6 - (i % 8) * 0.12) % 0.96 / 0.5);
        const on = t > 1.6 + (i % 8) * 0.12;
        return on ? <line key={i} x1={sx} y1={200} x2={lerp(sx, h, k)} y2={lerp(200, 124, k)} stroke={C.latte} strokeWidth={1} opacity={0.6 * (1 - k * 0.5)} /> : null;
      })}
      <T x={30} y={230} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>read constantly, sitting far apart</T>
    </Svg>
  );
}

// 9 · Three ways to relabel, each moving the same eight vertices. Degree sort: dots sized by degree slide into
// descending order. BFS / RCM: from the sparsest vertex, the visit spreads outward and the order follows it.
// Community: two clusters, mixed along the line, gather into two runs.
export function ThreeStrategies({ t }: StepCtx) {
  const sizes = [3, 9, 4, 12, 2, 7, 5, 10];
  const rank = [...sizes.keys()].sort((a, b) => sizes[b] - sizes[a]);
  const d = easeInOut(seg(t, 0.5, 1.3));
  const bfsOrder = [4, 0, 2, 6, 1, 5, 7, 3];
  const b = (j: number) => t >= 1.9 + j * 0.15;
  const cl = [0, 1, 0, 1, 1, 0, 1, 0];
  const g = easeInOut(seg(t, 3.2, 4.0));
  const clPos = (i: number) => {
    const same = cl.slice(0, i).filter((c) => c === cl[i]).length;
    return cl[i] === 0 ? same : 4 + same;
  };
  const X = (j: number) => 220 + j * 44;
  return (
    <Svg label="Degree sort slides vertices into descending degree; breadth-first order numbers them as a visit spreads from the sparsest; community order gathers each cluster into one run" h={300}>
      <T x={30} y={60} s={13} f={C.caramel}>degree sort</T>
      {sizes.map((sz, i) => <circle key={i} cx={lerp(X(i), X(rank.indexOf(i)), d)} cy={56} r={3 + sz} fill="none" stroke={C.crema} strokeWidth={1.3} />)}
      <T x={30} y={150} s={13} f={C.caramel}>BFS / RCM</T>
      {bfsOrder.map((v, j) => j < 7 && <line key={j} x1={X(j)} y1={146} x2={X(j + 1)} y2={146} stroke={b(j + 1) ? C.caramel : C.mocha} strokeWidth={1.4} />)}
      {bfsOrder.map((v, j) => <circle key={v} cx={X(j)} cy={146} r={8} fill={b(j) ? C.caramel : C.roast} stroke={C.crema} strokeWidth={1.2} />)}
      <T x={30} y={240} s={13} f={C.caramel}>community</T>
      {cl.map((c, i) => <circle key={i} cx={lerp(X(i), X(clPos(i)), g)} cy={236} r={8} fill={c ? C.cinnamon : C.crema} opacity={0.9} />)}
      <T x={30} y={290} s={13} f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>one goal: neighbours at nearby ids</T>
    </Svg>
  );
}

// 10 · Predict. The id strip cut into cache lines of 8; the hubs scattered, one per line (each line outlined red, a
// miss). An empty packed range waits at the start. After answering: the hubs slide into the packed range, and its few
// lines now each hold several hubs.
export function DegreeSortPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const pack = answered ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const LW = 27; // one cache line on this strip
  return (
    <Svg label="Scattered hubs each sit in their own cache line of eight values; after answering, they pack into the first few lines, several busy vertices per line" h={260}>
      <T x={30} y={40} s={12} f={C.latte}>cache lines of 8 ids</T>
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={30 + i * LW} y={60} width={LW - 2} height={24} fill="none" stroke={C.mocha} strokeWidth={1} />)}
      {HUBX.map((x, i) => {
        const line = Math.floor((x - 30) / LW);
        return <rect key={`l${i}`} x={30 + line * LW} y={60} width={LW - 2} height={24} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={(1 - pack) * (answered ? 1 : pulse)} />;
      })}
      {[0, 1].map((l) => <rect key={`p${l}`} x={30 + l * LW} y={60} width={LW - 2} height={24} fill="none" stroke={C.caramel} strokeWidth={2} opacity={pack} />)}
      {HUBX.map((x, i) => {
        const px = 30 + 4 + (i % 5) * 4.4 + Math.floor(i / 5) * LW;
        return <circle key={i} cx={lerp(x, px, pack)} cy={72} r={3.2} fill={C.caramel} />;
      })}
      {!answered && <T x={30} y={200} s={15} f={C.cherryText} o={pulse}>what fills one line now?</T>}
      {answered && <T x={30} y={200} s={13} f={C.caramel} o={easeOut(seg(s, 1.0, 1.4))}>several busy vertices per line</T>}
    </Svg>
  );
}

// 11 · The payoff. Before: hubs scattered, nearly one line each (a long row of red lines). After degree sort: the
// same hubs packed eight to a line. Bars: 1,995 lines before, 250 after, 8.0x fewer.
export function MeasuredPayoff({ t }: StepCtx) {
  const pack = easeInOut(seg(t, 0.6, 1.8));
  const g1 = easeOut(seg(t, 2.0, 2.8));
  const g2 = easeOut(seg(t, 2.8, 3.4));
  const W = 440;
  return (
    <Svg label="Two thousand hubs scattered across nearly as many cache lines pack eight to a line: 1,995 lines before, 250 after, 8.0 times fewer" h={300}>
      {Array.from({ length: 64 }, (_, i) => {
        const x0 = 30 + i * 8.4;
        const x1 = 30 + Math.floor(i / 8) * 8.4 * 1.0;
        return <rect key={i} x={lerp(x0, x1 + (i % 8) * 1.0, pack)} y={40} width={lerp(7, 8.4 / 1, pack) - 1} height={20} fill={C.cherryText} opacity={lerp(0.85, 0.25, pack)} />;
      })}
      {Array.from({ length: 8 }, (_, i) => <rect key={`p${i}`} x={30 + i * 8.4} y={40} width={7.4} height={20} fill={C.caramel} opacity={pack} />)}
      <T x={30} y={84} s={12} f={C.latte}>{pack < 0.5 ? 'before: one line per hub, nearly' : 'after: eight hubs per line'}</T>
      <T x={30} y={130} s={13} f={C.cherryText} o={g1}>before: 1,995 lines</T>
      <rect x={30} y={140} width={W * g1} height={20} rx={2} fill={C.cherryText} />
      <T x={30} y={196} s={13} f={C.caramel} o={g2}>after: 250 lines</T>
      <rect x={30} y={206} width={W * (250 / 1995) * g2} height={20} rx={2} fill={C.caramel} />
      <T x={30} y={270} s={16} f={C.crema} o={easeOut(seg(t, 3.5, 3.9))}>8.0x fewer, values unchanged</T>
    </Svg>
  );
}

// 12 · Prove it. The small graph: offsets (7) and targets (10) rebuilt, then each vertex's slice checked against its
// adjacency-list chain, A to F, a tick each. The big graph: 2,000,000 vertices, 2,000 hubs, 1,995 lines down to 250.
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const big = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="Every CSR slice of the small graph checked against its adjacency-list chain; on 2,000,000 vertices with 2,000 hubs, 1,995 cache lines before reordering and 250 after" h={300}>
      <Row x={40} y={40} w={34} n={7} vals={OFFSETS} label="offsets" o={a} />
      <Row x={40} y={100} w={34} n={10} vals={TARGETS} o={a} label="targets" />
      {VS.map((v, i) => {
        const at = 0.8 + i * 0.22;
        const lo = OFFSETS[i];
        const hi = OFFSETS[i + 1];
        const on = t >= at && t < at + 0.22;
        return (
          <g key={v}>
            {on && hi > lo && <rect x={40 + lo * 34 - 2} y={98} width={(hi - lo) * 34} height={30} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />}
            <T x={60 + i * 50} y={164} s={13} f={C.crema} o={t >= at ? 1 : 0.3}>{v}</T>
            <Check x={78 + i * 50} y={160} t={t} at={at + 0.1} />
          </g>
        );
      })}
      <T x={40} y={190} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>every slice = its adjacency-list chain</T>
      <g opacity={big}>
        <T x={40} y={232} s={12} f={C.latte}>2,000,000 vertices, 2,000 hubs</T>
        <rect x={40} y={244} width={300} height={12} rx={2} fill={C.cherryText} />
        <T x={350} y={255} s={12} f={C.cherryText}>1,995</T>
        <rect x={40} y={264} width={300 * (250 / 1995)} height={12} rx={2} fill={C.caramel} />
        <T x={90} y={275} s={12} f={C.caramel}>250 lines</T>
      </g>
    </Svg>
  );
}

// 13 · Recap. Three panels come alive in turn: CSR (two flat arrays fill), CSC (arrows flip), reordering (scattered
// dots pack together). One question underneath: how a graph's edges sit in memory.
export function Recap({ t }: StepCtx) {
  const p = (i: number) => easeOut(seg(t, 0.2 + i * 0.9, 0.5 + i * 0.9));
  const fill = (i: number) => t >= 0.4 + i * 0.06;
  const flip = easeInOut(seg(t, 1.4, 1.9));
  const pack = easeInOut(seg(t, 2.3, 3.0));
  const dots = [8, 30, 52, 70, 95, 118];
  return (
    <Svg label="Three panels: CSR's two flat arrays, CSC's flipped edges, and reordering packing scattered vertices together, under one question: how a graph's edges sit in memory" h={240}>
      <g opacity={p(0)}>
        <rect x={30} y={40} width={160} height={120} rx={4} fill="none" stroke={C.mocha} />
        <T x={42} y={62} s={13} f={C.caramel}>CSR</T>
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={42 + i * 20} y={80} width={16} height={14} fill={fill(i) ? C.crema : 'none'} stroke={C.latte} strokeWidth={0.8} />)}
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={42 + i * 14} y={110} width={11} height={14} fill={fill(i + 7) ? C.caramel : 'none'} stroke={C.latte} strokeWidth={0.8} />)}
      </g>
      <g opacity={p(1)}>
        <rect x={220} y={40} width={160} height={120} rx={4} fill="none" stroke={C.mocha} />
        <T x={232} y={62} s={13} f={C.cinnamon}>CSC</T>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${300} ${88 + i * 22}) scale(${lerp(1, -1, flip)} 1)`}>
            <line x1={-30} y1={0} x2={30} y2={0} stroke={C.cinnamon} strokeWidth={1.6} />
            <path d="M 30 0 l -8 -5 M 30 0 l -8 5" stroke={C.cinnamon} strokeWidth={1.6} />
          </g>
        ))}
      </g>
      <g opacity={p(2)}>
        <rect x={410} y={40} width={160} height={120} rx={4} fill="none" stroke={C.mocha} />
        <T x={422} y={62} s={13} f={C.crema}>reordering</T>
        <line x1={422} y1={110} x2={558} y2={110} stroke={C.mocha} />
        {dots.map((x, i) => <circle key={i} cx={lerp(422 + x, 426 + i * 9, pack)} cy={110} r={4} fill={C.caramel} />)}
      </g>
      <T x={30} y={206} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>how a graph&apos;s edges sit in memory</T>
    </Svg>
  );
}
