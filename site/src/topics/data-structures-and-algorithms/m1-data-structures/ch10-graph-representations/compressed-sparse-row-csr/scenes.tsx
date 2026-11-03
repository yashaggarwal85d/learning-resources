import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a vertex or stored value, drawn once it exists; latte =
// secondary labels (weight, index, degree); taupe = memory not yet touched; caramel = the
// representation/array being built right now; cinnamon (rare) = the alternative being compared;
// cherry/cherryText = a cache miss. The chapter's own small graph (identical to topic 36's,
// examples.py): A,B,C,D,E,F; edges A->B(4), A->C(2), A->B(7) [multi-edge], B->C(3), B->D(5),
// C->D(1), C->E(6), D->E(2), D->F(8), E->F(3). Offsets = [0,3,5,7,9,10,10]; targets (as letters,
// in A,B,C,D,E,F id order) = [B,C,B, C,D, D,E, E,F, F].

const VERTICES = ['A', 'B', 'C', 'D', 'E', 'F'];
const OFFSETS = [0, 3, 5, 7, 9, 10, 10];
const TARGETS = ['B', 'C', 'B', 'C', 'D', 'D', 'E', 'E', 'F', 'F']; // flat, in A..F order
const OUT_DEGREE = [3, 2, 2, 2, 1, 0];

function vertexPositions() {
  const xs = [40, 140, 240, 340, 440, 540];
  const ys = [120, 60, 180, 60, 180, 120];
  return Object.fromEntries(VERTICES.map((v, i) => [v, { x: xs[i], y: ys[i] }]));
}

function AdjacencyListMini({ a, highlightV }: { a: number; highlightV?: string }) {
  const chains: Record<string, string[]> = { A: ['B', 'C', 'B'], B: ['C', 'D'], C: ['D', 'E'], D: ['E', 'F'], E: ['F'], F: [] };
  return (
    <>
      {VERTICES.map((v, i) => (
        <g key={v} opacity={a}>
          <T x={30} y={34 + i * 30} s={13} f={v === highlightV ? C.caramel : C.crema}>{v}</T>
          <T x={55} y={34 + i * 30} s={12} f={C.quiet}>&rarr;</T>
          {chains[v].length === 0 ? (
            <T x={78} y={34 + i * 30} s={11} f={C.quiet}>(none)</T>
          ) : (
            chains[v].map((w, j) => (
              <rect key={j} x={78 + j * 44} y={22 + i * 30} width={36} height={20} rx={3} fill="none" stroke={v === highlightV ? C.caramel : C.crema} strokeWidth={1.2} />
            ))
          )}
          {chains[v].map((w, j) => (
            <T key={j} x={96 + j * 44} y={34 + i * 30} s={11} f={v === highlightV ? C.caramel : C.quiet} a="middle">{w}</T>
          ))}
        </g>
      ))}
    </>
  );
}

function FlatArray({ x, y, boxW, count, label, a, filled, highlightIdx, color = C.crema }: { x: number; y: number; boxW: number; count: number; label: string; a: number; filled?: (string | number)[]; highlightIdx?: number[]; color?: string }) {
  const hl = new Set(highlightIdx ?? []);
  return (
    <g opacity={a}>
      <T x={x} y={y - 12} s={12} f={C.latte}>{label}</T>
      {Array.from({ length: count }).map((_, i) => (
        <g key={i}>
          <rect x={x + i * boxW} y={y} width={boxW - 4} height={28} rx={3} fill="none" stroke={hl.has(i) ? C.caramel : color} strokeWidth={hl.has(i) ? 1.8 : 1.2} />
          {filled && filled[i] !== undefined && (
            <T x={x + i * boxW + (boxW - 4) / 2} y={y + 19} s={12} f={hl.has(i) ? C.caramel : color} a="middle">{filled[i]}</T>
          )}
        </g>
      ))}
    </g>
  );
}

// 1 · Opening: the adjacency list's own cost at billion-edge scale.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.0, 2.2));
  return (
    <Svg label="The chapter's adjacency list, with a caption scaling its per-edge cost up to billions of edges" h={300}>
      <AdjacencyListMini a={a} />
      <g opacity={b}>
        <T x={320} y={60} s={13} f={C.latte}>one billion edges:</T>
        <T x={320} y={86} s={13} f={C.caramel}>one allocation per edge</T>
        <T x={320} y={112} s={13} f={C.caramel}>one pointer per edge</T>
      </g>
    </Svg>
  );
}

// 2 · TwoArrays: offsets and targets, empty, sized.
export function TwoArrays({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.1));
  const b = easeOut(seg(t, 0.9, 1.8));
  return (
    <Svg label="Two empty flat arrays: offsets with seven slots, targets with ten" h={280}>
      <FlatArray x={40} y={60} boxW={44} count={7} label="offsets — length V + 1" a={a} />
      <FlatArray x={40} y={150} boxW={44} count={10} label="targets — length E" a={b} />
      <T x={40} y={220} s={12} f={C.latte} o={b}>no per-vertex allocation at all</T>
    </Svg>
  );
}

// 3 · PassOneCount: degrees, then the prefix sum filling offsets.
export function PassOneCount({ t }: StepCtx) {
  const degreesIn = easeOut(seg(t, 0.1, 1.0));
  const sweep = seg(t, 1.0, 2.4);
  const filled = OFFSETS.map((v, i) => (sweep >= i / 6 ? v : undefined));
  return (
    <Svg label="Each vertex's own out-degree counted, then swept left to right into offsets as a running total" h={300}>
      <g opacity={degreesIn}>
        {VERTICES.map((v, i) => (
          <T key={v} x={60 + i * 80} y={40} s={12} f={C.latte} a="middle">{v}: {OUT_DEGREE[i]}</T>
        ))}
      </g>
      <FlatArray x={40} y={100} boxW={44} count={7} label="offsets" a={1} filled={filled as (string | number)[]} color={C.quiet} highlightIdx={[Math.min(6, Math.floor(sweep * 7))]} />
      <T x={40} y={170} s={12} f={C.latte}>each box: the total of every degree before it</T>
    </Svg>
  );
}

// 4 · PassTwoPredict: can the cursor reuse offsets directly?
export function PassTwoPredictViz({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  return (
    <Svg label="The finished offsets array, with a question mark over whether a second pass can write into it directly" h={260}>
      <FlatArray x={40} y={60} boxW={44} count={7} label="offsets (finished)" a={a} filled={OFFSETS} />
      <T x={300} y={160} s={28} f={C.caramel} a="middle" o={a}>?</T>
      <T x={40} y={200} s={12} f={C.latte} o={a}>can pass two write into this array directly?</T>
    </Svg>
  );
}

// 5 · PassTwoScatter: the real scatter, cursor ticking, then cross-check against the list.
export function PassTwoScatter({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const scatter = seg(t, 0.8, 2.2);
  const filledCount = Math.floor(scatter * TARGETS.length);
  const filled = TARGETS.map((v, i) => (i < filledCount ? v : undefined));
  const cmp = easeOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="A separate cursor scattering edges into targets, then A's own finished slice set beside its adjacency-list chain" h={320}>
      <FlatArray x={40} y={50} boxW={44} count={10} label="targets" a={a} filled={filled as (string | number)[]} highlightIdx={[Math.min(9, filledCount)]} />
      <g opacity={cmp}>
        <T x={40} y={150} s={12} f={C.latte}>A's own slice (targets[0:3]):</T>
        <T x={40} y={176} s={13} f={C.caramel}>B, C, B</T>
        <T x={40} y={210} s={12} f={C.latte}>A's own chain (topic 36):</T>
        <T x={40} y={236} s={13} f={C.crema}>B, C, B — identical</T>
      </g>
    </Svg>
  );
}

// 6 · CSCPredict: who points at F?
export function CSCPredictViz({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  return (
    <Svg label="Vertex F highlighted, with CSR's own targets array and the question of which structure answers who points at F" h={260}>
      <FlatArray x={40} y={50} boxW={44} count={10} label="targets (CSR, source-ordered)" a={a} filled={TARGETS} color={C.quiet} />
      <T x={300} y={170} s={16} f={C.caramel} a="middle" o={a}>who points at F?</T>
      <T x={40} y={210} s={12} f={C.latte} o={a}>which array answers this in one lookup?</T>
    </Svg>
  );
}

// 7 · CSCReveal: CSC's own arrays, F's and B's slices.
export function CSCReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  const colTargets = ['A', 'A', 'B', 'C', 'B', 'C', 'D', 'D', 'E', 'E']; // by destination A..F
  return (
    <Svg label="CSC's own arrays, with F's own slice reading D, E and B's own slice reading A, A" h={300}>
      <FlatArray x={40} y={50} boxW={44} count={10} label="targets (CSC, destination-ordered)" a={a} filled={colTargets} color={C.quiet} highlightIdx={[8, 9]} />
      <g opacity={a}>
        <T x={40} y={140} s={12} f={C.latte}>F's own slice:</T>
        <T x={40} y={166} s={13} f={C.caramel}>D, E</T>
        <T x={300} y={140} s={12} f={C.latte}>B's own slice:</T>
        <T x={300} y={166} s={13} f={C.caramel}>A, A</T>
      </g>
    </Svg>
  );
}

// 8 · WhyReorderHook: hubs scattered across a huge id range.
export function WhyReorderHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const dots = [40, 210, 95, 480, 330, 560, 150, 420];
  return (
    <Svg label="A handful of busy hub vertices scattered at random, far-apart ids across a strip of two million" h={240}>
      <rect x={30} y={100} width={540} height={10} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} opacity={a} />
      <T x={30} y={90} s={11} f={C.quiet} o={a}>vertex ids, 0 to 2,000,000</T>
      {dots.map((x, i) => (
        <circle key={i} cx={30 + (x / 600) * 540} cy={105} r={4} fill={C.caramel} opacity={a} />
      ))}
      <T x={30} y={150} s={12} f={C.latte} o={a}>a few vertices, read constantly, sitting far apart</T>
    </Svg>
  );
}

// 9 · ThreeStrategies: naming degree sort, RCM, community order.
export function ThreeStrategies({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.2, 0.9));
  const a2 = easeOut(seg(t, 0.9, 1.6));
  const a3 = easeOut(seg(t, 1.6, 2.3));
  return (
    <Svg label="Three named reordering strategies: degree sort, BFS/RCM, community order" h={260}>
      {[
        { a: a1, label: 'degree sort', sub: 'by raw degree alone' },
        { a: a2, label: 'BFS / RCM', sub: 'by breadth-first visiting order' },
        { a: a3, label: 'community order', sub: 'by detected cluster membership' },
      ].map((row, i) => (
        <g key={row.label} opacity={row.a}>
          <T x={40} y={50 + i * 60} s={14} f={C.caramel}>{row.label}</T>
          <T x={40} y={74 + i * 60} s={12} f={C.latte}>{row.sub}</T>
        </g>
      ))}
    </Svg>
  );
}

// 10 · DegreeSortPredict: what happens to a cache line once hubs are packed.
export function DegreeSortPredictViz({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="The scattered-hub strip beside an empty after-degree-sort strip, asking what a cache line now holds" h={260}>
      <T x={30} y={40} s={12} f={C.latte} o={a}>before degree sort</T>
      <rect x={30} y={50} width={540} height={10} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} opacity={a} />
      <T x={30} y={120} s={12} f={C.latte} o={a}>after degree sort</T>
      <rect x={30} y={130} width={60} height={10} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <T x={300} y={190} s={16} f={C.caramel} a="middle" o={a}>what fills one cache line now?</T>
    </Svg>
  );
}

// 11 · MeasuredPayoff: 1,995 vs 250 cache lines, real bars.
export function MeasuredPayoff({ t }: StepCtx) {
  const grow1 = easeOut(seg(t, 0.2, 1.3));
  const grow2 = easeOut(seg(t, 1.3, 2.4));
  const maxW = 440;
  return (
    <Svg label="Two bars: 1,995 distinct cache lines before reordering, 250 after — an 8.0x drop" h={260}>
      <T x={30} y={50} s={12} f={C.latte}>before: 1,995 cache lines</T>
      <Bar x={30} y={60} w={maxW * grow1} h={22} full={maxW} fill={C.cherryText} />
      <T x={30} y={140} s={12} f={C.latte}>after: 250 cache lines</T>
      <Bar x={30} y={150} w={maxW * (250 / 1995) * grow2} h={22} full={maxW} fill={C.caramel} />
      <T x={30} y={210} s={14} f={C.crema} o={grow2}>8.0&times; fewer</T>
    </Svg>
  );
}

// 12b · ProveIt: the real numbers, measured not assumed.
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="The real numbers examples.py measures: array sizes on the small graph, and the cache-line drop on the large one" h={260}>
      <g opacity={a}>
        <T x={30} y={50} s={12} f={C.latte}>small graph: offsets length 7, targets length 10</T>
        <T x={30} y={76} s={12} f={C.latte}>every slice matches topic 36's adjacency list exactly</T>
      </g>
      <g opacity={b}>
        <T x={30} y={130} s={12} f={C.latte}>2,000,000 vertices, 2,000 hubs, 90% of edges on them</T>
        <T x={30} y={156} s={13} f={C.crema}>1,995 cache lines before reorder, 250 after</T>
        <T x={30} y={190} s={14} f={C.caramel}>measured directly — not timed, not estimated</T>
      </g>
    </Svg>
  );
}

// 12 · Recap: CSR, CSC, reordering together.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="CSR, CSC and reordering drawn together as three small panels under one heading" h={260}>
      <T x={300} y={40} s={14} f={C.crema} a="middle" o={a}>how a graph's own edges sit in memory</T>
      {['CSR', 'CSC', 'reordering'].map((name, i) => (
        <g key={name} opacity={a}>
          <rect x={60 + i * 170} y={70} width={140} height={90} rx={4} fill="none" stroke={C.quiet} strokeWidth={1.2} />
          <T x={130 + i * 170} y={120} s={13} f={C.caramel} a="middle">{name}</T>
        </g>
      ))}
    </Svg>
  );
}
