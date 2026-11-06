import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a vertex/edge as given; latte = secondary labels; taupe =
// an edge not yet considered, or a rejected edge (thin, dashed); caramel = the thing to look at
// (the edge being considered, the cut line, the tree edge just added); cinnamon (rare) = the
// alternative being compared, always the shortest-path tree against the MST; cherry/cherryText =
// the bad outcome (an edge that closes a cycle).

type Pos = Record<string, [number, number]>;

const POS: Pos = {
  A: [90, 150],
  B: [230, 55],
  C: [230, 245],
  D: [390, 55],
  E: [390, 245],
  F: [530, 150],
};

type EKey = 'AB4' | 'AC2' | 'AB7' | 'BC3' | 'BD5' | 'CD1' | 'CE6' | 'DE2' | 'DF8' | 'EF3';

const EDGE_ENDS: Record<EKey, [string, string]> = {
  AB4: ['A', 'B'],
  AC2: ['A', 'C'],
  AB7: ['A', 'B'],
  BC3: ['B', 'C'],
  BD5: ['B', 'D'],
  CD1: ['C', 'D'],
  CE6: ['C', 'E'],
  DE2: ['D', 'E'],
  DF8: ['D', 'F'],
  EF3: ['E', 'F'],
};

const EDGE_WEIGHT: Record<EKey, string> = {
  AB4: '4',
  AC2: '2',
  AB7: '7',
  BC3: '3',
  BD5: '5',
  CD1: '1',
  CE6: '6',
  DE2: '2',
  DF8: '8',
  EF3: '3',
};

function vertex(id: string, colour: string = C.crema, opacity = 1) {
  const [x, y] = POS[id];
  return (
    <g key={id} opacity={opacity}>
      <circle cx={x} cy={y} r={14} fill="none" stroke={colour} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} a="middle" f={colour}>{id}</T>
    </g>
  );
}

function edgeLine(key: EKey, colour: string = C.taupe, dashed = false, thick = false, opacity = 1) {
  const [u, v] = EDGE_ENDS[key];
  const [x1, y1] = POS[u];
  const [x2, y2] = POS[v];
  const bend = key === 'AB7';
  const mx = (x1 + x2) / 2 + (bend ? -40 : 0);
  const my = (y1 + y2) / 2 + (bend ? -10 : 0);
  const d = bend ? `M${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}` : `M${x1} ${y1} L${x2} ${y2}`;
  const labelX = bend ? mx : (x1 + x2) / 2;
  const labelY = bend ? my - 8 : (y1 + y2) / 2 - 8;
  return (
    <g key={`${key}-line`} opacity={opacity}>
      <path d={d} stroke={colour} strokeWidth={thick ? 2.6 : 1.4} strokeDasharray={dashed ? '5 4' : undefined} fill="none" />
      <T x={labelX} y={labelY} s={13} a="middle" f={C.latte}>{EDGE_WEIGHT[key]}</T>
    </g>
  );
}

const ALL_EDGES: EKey[] = ['AB4', 'AC2', 'AB7', 'BC3', 'BD5', 'CD1', 'CE6', 'DE2', 'DF8', 'EF3'];
const MST_EDGES: EKey[] = ['CD1', 'AC2', 'DE2', 'BC3', 'EF3'];

function baseGraph(edgeColour: (k: EKey) => string = (k: EKey) => (MST_EDGES.includes(k) ? C.crema : C.taupe), vertexColour: () => string = () => C.crema, opacity = 1) {
  return (
    <g opacity={opacity}>
      {ALL_EDGES.map((k) => edgeLine(k, edgeColour(k), !MST_EDGES.includes(k), MST_EDGES.includes(k)))}
      {Object.keys(POS).map((v) => vertex(v, vertexColour()))}
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Six sites and ten priced links; which five keep every site connected at the lowest total cost" h={320}>
      <g opacity={a}>{baseGraph(() => C.taupe)}</g>
      <T x={300} y={300} s={13} a="middle" f={C.latte} o={b}>ten links, six sites &mdash; cheapest-first: is it right?</T>
    </Svg>
  );
}

// 2 · Predict same tree
export function PredictSameTree({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="One network priced as a whole, against routes priced from a single head-office site" h={320}>
      <g opacity={a}>
        <T x={150} y={30} s={12} a="middle" f={C.caramel}>cheapest network</T>
        {baseGraph()}
      </g>
      <T x={450} y={30} s={12} a="middle" f={C.cinnamon} o={b}>cheapest routes from A?</T>
    </Svg>
  );
}

// 3 · Generic algorithm
export function GenericAlgorithm({ t }: StepCtx) {
  const n = Math.min(MST_EDGES.length, Math.floor(seg(t, 0.2, 2.4) * MST_EDGES.length) + 1);
  const added = MST_EDGES.slice(0, n);
  return (
    <Svg label="Edges added one at a time, each one safe, until five edges are picked" h={320}>
      {ALL_EDGES.map((k) =>
        edgeLine(k, added.includes(k) ? C.caramel : C.taupe, !added.includes(k), added.includes(k)),
      )}
      {Object.keys(POS).map((v) => vertex(v))}
      <T x={300} y={300} s={13} a="middle" f={C.latte}>repeatedly add a safe edge, stop at five</T>
    </Svg>
  );
}

// 4 · Cut property
export function CutProperty({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  const b = easeOut(seg(t, 1.1, 2.0));
  const c = easeOut(seg(t, 2.1, 2.8));
  return (
    <Svg label="A closed curve cuts A and C away from the rest; the lightest crossing edge locks on" h={320}>
      {ALL_EDGES.filter((k) => k !== 'CD1' && k !== 'BC3').map((k) => edgeLine(k, MST_EDGES.includes(k) ? C.crema : C.taupe, !MST_EDGES.includes(k), MST_EDGES.includes(k)))}
      {Object.keys(POS).map((v) => vertex(v))}
      <ellipse cx={160} cy={200} rx={110} ry={95} fill="none" stroke={C.caramel} strokeWidth={1.6} strokeDasharray="4 3" opacity={a} />
      <g opacity={b}>
        {edgeLine('CD1', C.caramel, false, true)}
        {edgeLine('BC3', C.caramel, false, true)}
      </g>
      <T x={300} y={300} s={13} a="middle" f={C.caramel} o={c}>lightest crossing edge: C&ndash;D, weight one &mdash; safe</T>
    </Svg>
  );
}

// 5 · Cycle property
export function CycleProperty({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.0));
  const b = easeOut(seg(t, 1.1, 2.0));
  return (
    <Svg label="Triangle A, B, C; its heaviest edge A-B is absent from the minimum spanning tree" h={320}>
      {ALL_EDGES.filter((k) => k !== 'AB4' && k !== 'AC2' && k !== 'BC3').map((k) => edgeLine(k, MST_EDGES.includes(k) ? C.crema : C.taupe, !MST_EDGES.includes(k), MST_EDGES.includes(k)))}
      {Object.keys(POS).map((v) => vertex(v))}
      <g opacity={a}>
        {edgeLine('AB4', C.cherry, false, true)}
        {edgeLine('AC2', C.caramel, false, true)}
        {edgeLine('BC3', C.caramel, false, true)}
      </g>
      <T x={300} y={300} s={13} a="middle" f={C.cherryText} o={b}>heaviest edge on the triangle: absent from the MST</T>
    </Svg>
  );
}

// 6 · Predict tie
export function PredictTie({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Two edges tie for lightest crossing a cut" h={320}>
      <g opacity={a}>
        <ellipse cx={310} cy={150} rx={240} ry={120} fill="none" stroke={C.caramel} strokeWidth={1.6} strokeDasharray="4 3" />
        <T x={150} y={100} s={12} a="middle" f={C.caramel}>edge one, weight two</T>
        <T x={470} y={100} s={12} a="middle" f={C.caramel}>edge two, weight two</T>
      </g>
      <T x={300} y={300} s={13} a="middle" f={C.latte}>does one single edge stay safe?</T>
    </Svg>
  );
}

// 7 · Kruskal run
export function KruskalRun({ t }: StepCtx) {
  const sorted: EKey[] = ['CD1', 'AC2', 'DE2', 'BC3', 'EF3', 'AB4', 'BD5', 'CE6', 'AB7', 'DF8'];
  const n = Math.min(sorted.length, Math.floor(seg(t, 0.1, 2.6) * sorted.length) + 1);
  const scanned = sorted.slice(0, n);
  return (
    <Svg label="Edges scanned in sorted order; union-find vetoes the ones that close a cycle" h={330}>
      {ALL_EDGES.map((k) => {
        if (!scanned.includes(k)) return edgeLine(k, C.taupe);
        return edgeLine(k, MST_EDGES.includes(k) ? C.caramel : C.cherry, !MST_EDGES.includes(k), MST_EDGES.includes(k));
      })}
      {Object.keys(POS).map((v) => vertex(v))}
      <g>
        {sorted.map((k, i) => (
          <rect key={k} x={40 + i * 54} y={300} width={46} height={20} fill="none"
            stroke={i < n ? (MST_EDGES.includes(k) ? C.caramel : C.cherry) : C.taupe} strokeWidth={1.3} />
        ))}
      </g>
      <T x={300} y={280} s={12} a="middle" f={C.latte}>sorted strip &mdash; thick: accepted, dashed: rejected</T>
    </Svg>
  );
}

// 8 · Why sort dominates
export function WhySortDominates({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A tall bar for the sort against a short bar for union-find on the same edge list" h={300}>
      <g opacity={a}>
        <T x={60} y={60} s={12} f={C.crema}>sort</T>
        <rect x={150} y={48} width={360} height={24} fill={C.caramel} opacity={0.85} />
      </g>
      <g opacity={b}>
        <T x={60} y={110} s={12} f={C.crema}>union-find</T>
        <rect x={150} y={98} width={30} height={24} fill={C.crema} opacity={0.85} />
      </g>
      <T x={300} y={260} s={13} a="middle" f={C.latte}>the sort is the part that grows with the edge list</T>
    </Svg>
  );
}

// 9 · Tie trap
export function TieTrap({ t }: StepCtx) {
  const sq: Pos = { P: [200, 90], Q: [400, 90], R: [400, 250], S: [200, 250] };
  const a = easeOut(seg(t, 0.1, 1.4));
  const idx = Math.min(3, Math.floor(seg(t, 1.5, 2.6) * 4));
  const trees: [string, string][][] = [
    [['P', 'Q'], ['Q', 'R'], ['R', 'S']],
    [['P', 'Q'], ['Q', 'R'], ['P', 'S']],
    [['P', 'Q'], ['R', 'S'], ['P', 'S']],
    [['Q', 'R'], ['R', 'S'], ['P', 'S']],
  ];
  return (
    <Svg label="A four-cycle, all edges weight one; four different spanning trees tie as minimum" h={300}>
      {Object.entries(sq).map(([id, [x, y]]) => (
        <g key={id}>
          <circle cx={x} cy={y} r={12} fill="none" stroke={C.crema} strokeWidth={1.6} />
          <T x={x} y={y + 4} s={12} a="middle" f={C.crema}>{id}</T>
        </g>
      ))}
      {[['P', 'Q'], ['Q', 'R'], ['R', 'S'], ['S', 'P']].map(([u, v]) => {
        const [x1, y1] = sq[u];
        const [x2, y2] = sq[v];
        const active = trees[idx].some(([a2, b2]) => (a2 === u && b2 === v) || (a2 === v && b2 === u));
        return <line key={`${u}-${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? C.caramel : C.taupe} strokeWidth={active ? 2.4 : 1.2} strokeDasharray={active ? undefined : '4 3'} opacity={a} />;
      })}
      <T x={300} y={280} s={13} a="middle" f={C.latte}>tree {idx + 1} of four, each weight three</T>
    </Svg>
  );
}

// 10 · Spanning tree counts
export function SpanningTreeCounts({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Eighty-nine spanning trees in total; exactly one achieves the minimum weight" h={300}>
      <g opacity={a}>
        <T x={60} y={70} s={12} f={C.crema}>all spanning trees</T>
        <rect x={220} y={56} width={320} height={26} fill={C.crema} opacity={0.5} />
        <T x={60} y={130} s={12} f={C.caramel}>minimum weight</T>
        <rect x={220} y={116} width={4} height={26} fill={C.caramel} />
      </g>
      <T x={300} y={260} s={13} a="middle" f={C.latte}>eighty-nine trees, one of them minimum</T>
    </Svg>
  );
}

// 11 · MST vs shortest-path tree
export function MstVsShortestPath({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  const SP_EDGES: EKey[] = ['AC2', 'AB4', 'CD1', 'DE2', 'EF3'];
  return (
    <Svg label="The minimum spanning tree beside the shortest-path tree from A on the identical graph" h={330}>
      <g opacity={a}>
        <T x={150} y={30} s={12} a="middle" f={C.caramel}>MST, weight eleven</T>
        {ALL_EDGES.map((k) => edgeLine(k, MST_EDGES.includes(k) ? C.caramel : C.taupe, !MST_EDGES.includes(k), MST_EDGES.includes(k)))}
        {Object.keys(POS).map((v) => vertex(v))}
      </g>
      <T x={450} y={30} s={12} a="middle" f={C.cinnamon} o={b}>shortest-path tree from A, weight twelve</T>
      <g opacity={b}>
        {SP_EDGES.map((k) => edgeLine(k, C.cinnamon, false, true, 0.0))}
      </g>
      <T x={300} y={300} s={13} a="middle" f={C.latte} o={b}>differ by exactly one</T>
    </Svg>
  );
}

// 12 · Negative weights
export function NegativeWeights({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Every weight shifted by the same amount, even into negative numbers; the identical five edges are accepted" h={300}>
      <g opacity={a}>
        <T x={300} y={60} s={12} a="middle" f={C.latte}>weights: one, two, two, three, three, &hellip;</T>
      </g>
      <g opacity={b}>
        <T x={300} y={84} s={12} a="middle" f={C.caramel}>shifted: negative nineteen, &hellip;</T>
      </g>
      <T x={300} y={260} s={13} a="middle" f={C.latte}>relative order unchanged &mdash; the same tree wins</T>
    </Svg>
  );
}

// 13 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="The whole edge list sorted first, against a cut that is simply the tree already built" h={280}>
      <g opacity={a}>
        <T x={300} y={100} s={12} a="middle" f={C.caramel}>Kruskal: sort the whole edge list first</T>
      </g>
      <g opacity={b}>
        <T x={300} y={124} s={12} a="middle" f={C.latte}>the cut can be the tree already built</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.latte}>Prim's algorithm, next</T>
    </Svg>
  );
}
