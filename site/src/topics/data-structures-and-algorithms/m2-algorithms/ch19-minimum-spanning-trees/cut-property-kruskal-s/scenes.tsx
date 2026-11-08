import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a vertex/edge as given; latte = secondary labels (a weight); taupe = an edge not
// yet considered, or a rejected edge (thin, dashed); caramel = the thing to look at (the edge being considered, the
// cut, the tree edge just added); cinnamon (rare) = the alternative being compared, the shortest-path tree against the
// MST; cherryText = the bad outcome (an edge that closes a cycle, the heaviest edge on a cycle). Every printed number
// is examples.py's: the ten links (AB 4, AC 2, AB 7, BC 3, BD 5, CD 1, CE 6, DE 2, DF 8, EF 3); the sorted order;
// accepted CD, AC, DE, BC, EF, total 11; the cut {A, C} and its lightest crossing edge C–D, 1; the triangle's heaviest
// A–B, 4; 89 spanning trees (55 without the 7), one at 11, the next at 12; the tie square's four trees of weight 3; the
// shortest-path tree from A, 12; every weight shifted by −20, total 11 − 100 = −89. The histogram is the same brute
// force examples.py runs, drawn as bar heights only.

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
const POS: Record<string, P> = { A: [80, 135], B: [220, 45], C: [220, 225], D: [380, 45], E: [380, 225], F: [520, 135] };
type E = { k: string; u: string; v: string; w: number };
// examples.py's EDGES, in its own listed order.
const EDGES: E[] = [
  { k: 'AB4', u: 'A', v: 'B', w: 4 }, { k: 'AC2', u: 'A', v: 'C', w: 2 }, { k: 'AB7', u: 'A', v: 'B', w: 7 },
  { k: 'BC3', u: 'B', v: 'C', w: 3 }, { k: 'BD5', u: 'B', v: 'D', w: 5 }, { k: 'CD1', u: 'C', v: 'D', w: 1 },
  { k: 'CE6', u: 'C', v: 'E', w: 6 }, { k: 'DE2', u: 'D', v: 'E', w: 2 }, { k: 'DF8', u: 'D', v: 'F', w: 8 },
  { k: 'EF3', u: 'E', v: 'F', w: 3 },
];
const byKey = (k: string) => EDGES.find((e) => e.k === k)!;
/** Where each weight sits beside its edge. */
const WPOS: Record<string, P> = {
  AB4: [158, 102], AC2: [140, 194], AB7: [118, 62], BC3: [208, 140], BD5: [300, 36], CD1: [324, 152],
  CE6: [300, 244], DE2: [392, 140], DF8: [462, 82], EF3: [462, 196],
};

/** examples.py's kruskal: stable sort by weight, scan, union-find vetoes cycles. */
function kruskal(shift = 0) {
  const order = [...EDGES].map((e) => ({ ...e, w: e.w + shift })).sort((a, b) => a.w - b.w);
  const parent: Record<string, string> = Object.fromEntries(Object.keys(POS).map((v) => [v, v]));
  const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const accepted: string[] = [];
  const verdict = order.map((e) => {
    if (accepted.length === 5) return false;
    const a = find(e.u), b = find(e.v);
    if (a === b) return false;
    parent[b] = a;
    accepted.push(e.k);
    return true;
  });
  return { order, verdict, accepted };
}
const KR = kruskal();
const MST = KR.accepted; // CD1, AC2, DE2, BC3, EF3
const MST_W = MST.reduce((s, k) => s + byKey(k).w, 0); // 11
const SPT = ['AB4', 'AC2', 'CD1', 'DE2', 'EF3']; // examples.py's sp_tree from A
const SPT_W = SPT.reduce((s, k) => s + byKey(k).w, 0); // 12

/** Every 5-edge subset that spans: examples.py's brute force, giving each tree's weight. */
function treeWeights() {
  const out: number[] = [];
  const n = EDGES.length;
  for (let m = 0; m < 1 << n; m++) {
    let bits = 0;
    for (let i = 0; i < n; i++) if (m & (1 << i)) bits++;
    if (bits !== 5) continue;
    const parent: Record<string, string> = Object.fromEntries(Object.keys(POS).map((v) => [v, v]));
    const find = (x: string): string => (parent[x] === x ? x : (parent[x] = find(parent[x])));
    let ok = true;
    let w = 0;
    for (let i = 0; i < n && ok; i++)
      if (m & (1 << i)) {
        const a = find(EDGES[i].u), b = find(EDGES[i].v);
        if (a === b) ok = false;
        else {
          parent[b] = a;
          w += EDGES[i].w;
        }
      }
    if (ok) out.push(w);
  }
  return out;
}
const WEIGHTS = treeWeights(); // 89 of them

function Edge({ e, stroke = C.taupe, w = 1.4, dash, p = 1, o = 1, label = true, lf }: { e: E; stroke?: string; w?: number; dash?: string; p?: number; o?: number; label?: boolean; lf?: string }) {
  const [x1, y1] = POS[e.u];
  const [x2, y2] = POS[e.v];
  const q = clamp(p, 0, 1);
  const bend = e.k === 'AB7';
  const cx = 105, cy = 40;
  // A partial quadratic for the multi-edge, a partial line for the rest.
  const d = bend
    ? `M${x1} ${y1} Q${lerp(x1, cx, q)} ${lerp(y1, cy, q)} ${(1 - q) * (1 - q) * x1 + 2 * (1 - q) * q * cx + q * q * x2} ${(1 - q) * (1 - q) * y1 + 2 * (1 - q) * q * cy + q * q * y2}`
    : `M${x1} ${y1} L${lerp(x1, x2, q)} ${lerp(y1, y2, q)}`;
  return (
    <g opacity={o}>
      {q > 0 && <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeDasharray={dash} />}
      {label && <T x={WPOS[e.k][0]} y={WPOS[e.k][1]} s={12} f={lf ?? C.latte} a="middle">{String(e.w)}</T>}
    </g>
  );
}
function Vertex({ id, stroke = C.crema, o = 1, at }: { id: string; stroke?: string; o?: number; at?: P }) {
  const [x, y] = at ?? POS[id];
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={14} fill={C.band} stroke={stroke} strokeWidth={1.8} />
      <T x={x} y={y + 5} s={13} f={stroke} a="middle">{id}</T>
    </g>
  );
}
function Graph({ style, vs, wo = 1 }: { style?: (e: E) => { stroke?: string; w?: number; dash?: string; p?: number; lf?: string } | undefined; vs?: (v: string) => string; wo?: number }) {
  return (
    <g>
      {EDGES.map((e) => {
        const st = style?.(e) ?? {};
        return <Edge key={e.k} e={e} {...st} o={1} label={wo > 0} />;
      })}
      {Object.keys(POS).map((v) => <Vertex key={v} id={v} stroke={vs?.(v) ?? C.crema} />)}
    </g>
  );
}

// 1 · Opening. Six sites, then the ten priced links draw in; the cheapest, C–D at 1, glows. Then three problems where
// that same cheapest-first instinct fails are crossed red, and the question stands: what makes it right here?
export function Opening({ t }: StepCtx) {
  const sites = easeOut(seg(t, 0.2, 0.7));
  const links = EDGES.map((_, i) => easeInOut(seg(t, 0.7 + i * 0.1, 1.0 + i * 0.1)));
  const cheap = easeOut(seg(t, 2.0, 2.4));
  const fails = [0, 1, 2].map((i) => easeOut(seg(t, 2.6 + i * 0.35, 2.9 + i * 0.35)));
  const q = t > 4.1;
  return (
    <Svg label="Six sites, then ten priced links draw in, and the cheapest, C to D at 1, glows. Then three problems where cheapest-first fails, coin change, knapsack and the travelling salesman, are crossed in red: what makes it right here?" h={300}>
      {EDGES.map((e, i) => (
        <Edge key={e.k} e={e} p={links[i]} stroke={e.k === 'CD1' && cheap > 0 ? C.caramel : C.taupe} w={e.k === 'CD1' && cheap > 0 ? 3 : 1.4} label={links[i] >= 1} lf={e.k === 'CD1' && cheap > 0 ? C.caramel : undefined} />
      ))}
      {Object.keys(POS).map((v) => <Vertex key={v} id={v} o={sites} />)}
      {!q &&
        ['coin change', 'knapsack', 'travelling salesman'].map((c, i) => (
          <g key={c} opacity={fails[i]}>
            <T x={[90, 250, 430][i]} y={282} s={12} f={C.cherryText} a="middle">{c}</T>
            <line x1={[90, 250, 430][i] - c.length * 4} y1={278} x2={[90, 250, 430][i] + c.length * 4} y2={278} stroke={C.cherryText} strokeWidth={1.4} />
          </g>
        ))}
      {q && <T x={300} y={282} s={13} f={C.caramel} a="middle">cheapest first, and here it's right: why?</T>}
    </Svg>
  );
}

// 2 · PredictSameTree. The cheapest network draws in, thick; a label asks about the cheapest routes from A. After
// answering: the shortest-path tree from A draws in blue: it takes A–B (4) where the network takes B–C (3), 12 vs 11.
export function PredictSameTree({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const mst = MST.map((_, i) => easeInOut(seg(t, 0.3 + i * 0.25, 0.55 + i * 0.25)));
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const spt = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const diff = answered ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="The cheapest network connecting every site draws in thick. A label asks about the cheapest routes out from site A. After answering: the shortest-path tree from A draws in blue; it takes A to B at 4 where the network takes B to C at 3, 12 against 11" h={300}>
      <Graph
        wo={1}
        style={(e) => {
          const i = MST.indexOf(e.k);
          if (answered && e.k === 'AB4') return { stroke: C.cinnamon, w: 3, p: spt, lf: C.cinnamon };
          if (i >= 0) return { stroke: e.k === 'BC3' && diff > 0 ? C.caramel : C.crema, w: 3, p: mst[i], lf: e.k === 'BC3' && diff > 0 ? C.caramel : undefined };
          return { dash: '5 4' };
        }}
        vs={(v) => (v === 'A' ? (answered ? C.cinnamon : C.caramel) : C.crema)}
      />
      <T x={30} y={22} s={12} f={C.crema}>cheapest network</T>
      {!answered && <T x={570} y={22} s={12} f={C.cinnamon} a="end" o={pulse}>cheapest routes from A?</T>}
      {answered && <T x={570} y={22} s={12} f={C.cinnamon} a="end" o={spt}>routes from A: A–B, not B–C</T>}
      {answered && <T x={300} y={282} s={13} f={C.caramel} a="middle" o={diff}>{`network ${MST_W}, routes from A ${SPT_W}: different trees`}</T>}
    </Svg>
  );
}

// 3 · GenericAlgorithm. Start with none picked; five slots below. Safe edges join in no particular order, E–F, A–C,
// B–C, D–E, C–D, each filling a slot, and the run stops at five, enough to span six sites.
const GENERIC = ['EF3', 'AC2', 'BC3', 'DE2', 'CD1'];
export function GenericAlgorithm({ t }: StepCtx) {
  const add = GENERIC.map((_, i) => easeInOut(seg(t, 0.5 + i * 0.55, 0.85 + i * 0.55)));
  const stop = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="Start with no edges picked and five empty slots. Safe edges join in no particular order, E to F, A to C, B to C, D to E, C to D, each filling a slot; the run stops at five, enough to span six sites" h={300}>
      <Graph style={(e) => {
        const i = GENERIC.indexOf(e.k);
        return i >= 0 && add[i] > 0 ? { stroke: C.caramel, w: 3, p: add[i] } : { dash: '5 4' };
      }} />
      <T x={30} y={274} s={12} f={C.latte}>picked</T>
      {GENERIC.map((k, i) => (
        <g key={k}>
          <rect x={110 + i * 62} y={256} width={54} height={26} rx={4} fill={add[i] >= 1 ? C.cocoa : 'none'} stroke={add[i] >= 1 ? C.caramel : C.line} />
          <T x={137 + i * 62} y={274} s={12} f={C.crema} a="middle" o={add[i] >= 1 ? 1 : 0}>{`${k[0]}${k[1]}`}</T>
        </g>
      ))}
      <T x={430} y={274} s={12} f={C.caramel} o={stop}>stop at five</T>
      <T x={570} y={22} s={12} f={C.latte} a="end" o={easeOut(seg(t, 0.3, 0.7))}>add any safe edge</T>
    </Svg>
  );
}

// 4 · CutProperty. A–C is already picked. A ring separates {A, C} from the rest; each crossing edge lights in turn,
// A–B 4, A–B 7, B–C 3, C–D 1, C–E 6; the lightest, C–D 1, thickens; then the tree's edges appear and C–D is one.
const CROSS = ['AB4', 'AB7', 'BC3', 'CD1', 'CE6'];
export function CutProperty({ t }: StepCtx) {
  const ring = easeOut(seg(t, 0.3, 0.9));
  const scan = clamp((t - 1.0) / 0.3, 0, 5);
  const pick = easeOut(seg(t, 2.6, 3.1));
  const tree = easeOut(seg(t, 3.5, 4.2));
  return (
    <Svg label="A to C is already picked. A ring separates A and C from the rest; each crossing edge lights in turn, A to B at 4, A to B at 7, B to C at 3, C to D at 1, C to E at 6; the lightest, C to D, thickens, and the minimum tree's edges appear with C to D among them" h={300}>
      <Graph style={(e) => {
        if (e.k === 'AC2') return { stroke: C.crema, w: 3 };
        const i = CROSS.indexOf(e.k);
        if (e.k === 'CD1' && pick > 0) return { stroke: C.caramel, w: 4, lf: C.caramel };
        if (i >= 0 && scan > i) return { stroke: Math.floor(scan) === i && pick === 0 ? C.caramel : C.crema, w: 1.8 };
        if (tree > 0 && MST.includes(e.k)) return { stroke: C.crema, w: 3 };
        return { dash: '5 4' };
      }} />
      <ellipse cx={150} cy={180} rx={lerp(30, 105, ring)} ry={lerp(16, 42, ring)} transform="rotate(35 150 180)" fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="6 4" opacity={ring} />
      <T x={30} y={22} s={12} f={C.caramel} o={ring}>cut: {'{A, C}'} | the rest</T>
      {tree === 0 && <T x={300} y={282} s={13} f={C.caramel} a="middle" o={pick}>lightest crossing edge: C–D, 1</T>}
      {tree > 0 && <T x={300} y={282} s={13} f={C.crema} a="middle" o={tree}>C–D, 1 is in the minimum tree</T>}
    </Svg>
  );
}

// 5 · CycleProperty. The triangle A–B–C lights with its weights 4, 3, 2; the heaviest, A–B 4, turns red. The minimum
// tree draws over the graph and A–B 4 is not in it.
export function CycleProperty({ t }: StepCtx) {
  const tri = easeOut(seg(t, 0.3, 1.0));
  const heavy = easeOut(seg(t, 1.3, 1.8));
  const tree = MST.map((_, i) => easeInOut(seg(t, 2.2 + i * 0.2, 2.45 + i * 0.2)));
  const cap = easeOut(seg(t, 3.5, 3.9));
  const TRI = ['AB4', 'BC3', 'AC2'];
  return (
    <Svg label="The triangle A, B, C lights with weights 4, 3 and 2; the heaviest, A to B at 4, turns red. The minimum tree then draws over the graph, and A to B at 4 is not in it" h={300}>
      <Graph style={(e) => {
        const ti = MST.indexOf(e.k);
        if (e.k === 'AB4' && heavy > 0) return { stroke: C.cherryText, w: 3, lf: C.cherryText };
        if (ti >= 0 && tree[ti] > 0) return { stroke: C.caramel, w: 3, p: tree[ti] };
        if (TRI.includes(e.k) && tri > 0) return { stroke: C.crema, w: 2 };
        return { dash: '5 4' };
      }} />
      <path d="M 80 135 L 220 45 L 220 225 Z" fill={C.crema} opacity={0.06 * tri} />
      {cap === 0 && <T x={300} y={282} s={13} f={C.cherryText} a="middle" o={heavy}>heaviest on the cycle: A–B, 4</T>}
      {cap > 0 && <T x={300} y={282} s={13} f={C.cherryText} a="middle" o={cap}>A–B, 4: in no minimum tree</T>}
    </Svg>
  );
}

// The tie square, examples.py's W–X–Y–Z with every edge 1.
const SQ: Record<string, P> = { W: [210, 70], X: [390, 70], Y: [390, 210], Z: [210, 210] };
const SQE: [string, string][] = [['W', 'X'], ['X', 'Y'], ['Y', 'Z'], ['Z', 'W']];

// 6 · PredictTie. The square with a ring around W: its two crossing edges, W–X and Z–W, both weigh 1 and both pulse.
// After answering: both turn white: each is safe, for a different minimum tree.
export function PredictTie({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const ring = easeOut(seg(t, 0.3, 0.9));
  const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 4));
  const safe = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="A square W, X, Y, Z with every edge weighing 1, and a ring around W: its two crossing edges, W to X and Z to W, both pulse. After answering: both turn white, each one safe for a different minimum tree" h={290}>
      {SQE.map(([a, b]) => {
        const crossing = a === 'W' || b === 'W';
        const [x1, y1] = SQ[a];
        const [x2, y2] = SQ[b];
        return (
          <g key={a + b}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={crossing ? (answered ? C.caramel : C.crema) : C.taupe} strokeWidth={crossing ? 3 : 1.6} opacity={crossing && !answered && ring > 0 ? pulse : 1} />
            <T x={(x1 + x2) / 2 + (y1 === y2 ? 0 : x1 > 300 ? 16 : -16)} y={(y1 + y2) / 2 + (y1 === y2 ? (y1 < 100 ? -10 : 22) : 4)} s={12} f={C.latte} a="middle">1</T>
          </g>
        );
      })}
      {Object.keys(SQ).map((v) => <Vertex key={v} id={v} at={SQ[v]} stroke={v === 'W' ? C.caramel : C.crema} />)}
      <circle cx={SQ.W[0]} cy={SQ.W[1]} r={lerp(14, 40, ring)} fill="none" stroke={C.caramel} strokeDasharray="5 4" opacity={ring} />
      {!answered && <T x={300} y={262} s={13} f={C.crema} a="middle" o={ring}>two lightest crossing edges: which one is safe?</T>}
      {answered && <T x={300} y={262} s={13} f={C.caramel} a="middle" o={safe}>both: each is safe for some minimum tree</T>}
    </Svg>
  );
}

// 7 · KruskalRun. examples.py's sorted strip: CD1, AC2, DE2, BC3, EF3, AB4, BD5, CE6, AB7, DF8. A cursor scans it; the
// first five are accepted and thicken on the graph, the last five each flash red where they would close a cycle.
const KB = 0.42;
export function KruskalRun({ t }: StepCtx) {
  const i = clamp(Math.floor((t - 0.3) / KB), -1, 9);
  const p = i < 0 ? 0 : clamp((t - 0.3 - i * KB) / KB, 0, 1);
  const done = t > 0.3 + 10 * KB;
  const cap = easeOut(seg(t, 4.5, 4.9));
  return (
    <Svg label="The ten edges sorted by weight in a strip: C D 1, A C 2, D E 2, B C 3, E F 3, A B 4, B D 5, C E 6, A B 7, D F 8. A cursor scans it; the first five are accepted and thicken on the graph, the last five each flash red where they would close a cycle" h={300}>
      <Graph style={(e) => {
        const j = KR.order.findIndex((o) => o.k === e.k);
        if (j > i) return { dash: '5 4' };
        if (KR.verdict[j]) return { stroke: j === i && !done ? C.caramel : C.crema, w: 3 };
        if (j === i && !done) return { stroke: C.cherryText, w: 2.5, dash: '5 4', lf: C.cherryText };
        return { stroke: C.mocha, dash: '3 4' };
      }} />
      {KR.order.map((e, j) => {
        const seen = j <= i;
        const ok = KR.verdict[j];
        const cur = j === i && !done;
        return (
          <g key={e.k} transform={`translate(0 ${cur ? -4 * Math.sin(p * Math.PI) : 0})`}>
            <rect x={30 + j * 54} y={256} width={48} height={26} rx={4} fill={seen && ok ? C.cocoa : 'none'} stroke={cur ? (ok ? C.caramel : C.cherryText) : seen ? (ok ? C.crema : C.mocha) : C.line} strokeWidth={cur ? 2 : 1} />
            <T x={54 + j * 54} y={274} s={12} f={seen && !ok ? C.cherryText : C.crema} a="middle">{e.k}</T>
          </g>
        );
      })}
      {cap === 0 ? (
        <T x={30} y={14} s={12} f={C.latte}>sorted, scanned once; union-find vetoes cycles</T>
      ) : (
        <T x={30} y={14} s={12} f={C.caramel} o={cap}>{`5 kept, 5 rejected: total ${MST_W}`}</T>
      )}
    </Svg>
  );
}

// 8 · WhySortDominates. Two bars as the edge list grows: the sort's bar grows faster than union-find's, which barely
// moves. Then a pre-sorted list (or a radix sort) takes the sort's bar down, and union-find's share is what's left.
export function WhySortDominates({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 0.3, 2.0));
  const cut = easeInOut(seg(t, 2.4, 3.2));
  const sortW = lerp(60, 380, grow) * lerp(1, 0.08, cut);
  const ufW = lerp(20, 70, grow);
  const cap = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="Two cost bars as the edge list grows: the sort's grows far faster than union-find's, which barely moves. Then a pre-sorted list, or a radix sort on integer weights, takes the sort's bar down, and union-find's share is what's left" h={240}>
      <T x={30} y={30} s={12} f={C.latte}>{`edge list: ${grow < 0.5 ? 'short' : 'long'}`}</T>
      <T x={30} y={78} s={12} f={C.crema}>sort</T>
      <rect x={150} y={64} width={sortW} height={20} fill={cut > 0 ? C.taupe : C.crema} />
      <T x={30} y={128} s={12} f={C.crema}>union-find</T>
      <rect x={150} y={114} width={ufW} height={20} fill={C.caramel} />
      {cut > 0 && <T x={150 + sortW + 10} y={79} s={12} f={C.latte} o={cut}>pre-sorted, or radix</T>}
      <T x={300} y={196} s={13} f={C.caramel} a="middle" o={cap}>which half matters depends on the sort</T>
    </Svg>
  );
}

// 9 · TieTrap. The square with every edge 1, then its four minimum trees one beside another, each leaving out a
// different edge, each of weight 3.
export function TieTrap({ t }: StepCtx) {
  const trees = [0, 1, 2, 3].map((i) => easeOut(seg(t, 0.5 + i * 0.5, 0.8 + i * 0.5)));
  const cap = easeOut(seg(t, 2.8, 3.2));
  // One square, every edge the same weight, sits in the middle; four copies peel off it to their own slots, and in each
  // the three tree edges draw in while a different fourth edge is left out, dashed.
  const slide = [0, 1, 2, 3].map((i) => easeInOut(seg(t, 0.3 + i * 0.5, 0.8 + i * 0.5)));
  const S = (i: number, v: string): P => [lerp(280, 70 + i * 140, slide[i]) + (SQ[v][0] - 210) / 3.6, 90 + (SQ[v][1] - 70) / 2];
  return (
    <Svg label="The square with every edge weighing 1, then its four minimum trees side by side, each leaving out a different edge, each weighing 3" h={240}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={t < 0.3 ? easeOut(seg(t, 0, 0.3)) : 1}>
          {SQE.map(([a, b], j) => {
            const [x1, y1] = S(i, a);
            const [x2, y2] = S(i, b);
            const out = j === (i + 2) % 4;
            const k = trees[i];
            return (
              <g key={j}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.mocha} strokeWidth={1.2} strokeDasharray={out && k > 0 ? '4 4' : undefined} />
                {!out && k > 0 && <line x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" />}
              </g>
            );
          })}
          {Object.keys(SQ).map((v) => {
            const [x, y] = S(i, v);
            return <circle key={v} cx={x} cy={y} r={6} fill={C.band} stroke={C.crema} strokeWidth={1.5} />;
          })}
          <T x={70 + i * 140 + 25} y={lerp(198, 186, trees[i])} s={12} f={C.crema} a="middle" o={trees[i]}>weight 3</T>
        </g>
      ))}
      <T x={300} y={226} s={13} f={C.caramel} a="middle" o={cap}>four minimum trees, all tied</T>
    </Svg>
  );
}

// 10 · SpanningTreeCounts. Every spanning tree, enumerated by brute force, stacks into a histogram by weight: 89 in
// all. The single tree at 11 lights, then the next cheapest, at 12.
export function SpanningTreeCounts({ t }: StepCtx) {
  const lo = Math.min(...WEIGHTS), hi = Math.max(...WEIGHTS);
  const fill = easeInOut(seg(t, 0.3, 2.4));
  const count = easeOut(seg(t, 2.4, 2.8));
  const min = easeOut(seg(t, 3.0, 3.4));
  const second = easeOut(seg(t, 3.7, 4.1));
  const BX = (w: number) => 60 + (w - lo) * 26;
  const sorted = [...WEIGHTS].sort((a, b) => a - b);
  const shown = Math.floor(fill * sorted.length);
  const stackIdx: Record<number, number> = {};
  return (
    <Svg label="Every spanning tree of the graph, enumerated, stacks into a histogram by weight, 89 in all. The single tree at weight 11 lights, then the next cheapest, at 12" h={290}>
      {sorted.slice(0, shown).map((w, i) => {
        const k = (stackIdx[w] = (stackIdx[w] ?? -1) + 1);
        const isMin = w === lo;
        const is2 = w === lo + 1;
        return <rect key={i} x={BX(w) - 10} y={220 - (k + 1) * 14} width={20} height={11} rx={2} fill={isMin && min > 0 ? C.caramel : is2 && second > 0 ? C.crema : C.mocha} />;
      })}
      <line x1={40} y1={224} x2={BX(hi) + 20} y2={224} stroke={C.line} />
      {[lo, hi].map((w) => <T key={w} x={BX(w)} y={242} s={12} f={C.latte} a="middle">{String(w)}</T>)}
      <T x={570} y={40} s={13} f={C.crema} a="end" o={count}>{`${WEIGHTS.length} spanning trees`}</T>
      <T x={40} y={40} s={12} f={C.caramel} o={min}>the only one at 11</T>
      <T x={40} y={62} s={12} f={C.crema} o={second}>next cheapest: 12</T>
      <T x={300} y={276} s={13} f={C.caramel} a="middle" o={second}>the cut property picks out the one</T>
    </Svg>
  );
}

// 11 · MstVsShortestPath. The minimum tree draws in (11); then the shortest-path tree from A (12) draws over it in
// blue. They share four edges; the two that differ, B–C 3 and A–B 4, are lit.
export function MstVsShortestPath({ t }: StepCtx) {
  const mst = easeInOut(seg(t, 0.3, 1.2));
  const spt = easeInOut(seg(t, 1.5, 2.4));
  const diff = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="The minimum spanning tree draws in, weight 11; then the shortest-path tree from A, weight 12, draws over it in blue. They share four edges; the two that differ, B to C at 3 and A to B at 4, light up" h={300}>
      <Graph style={(e) => {
        const inM = MST.includes(e.k), inS = SPT.includes(e.k);
        if (inM && inS) return { stroke: C.crema, w: 3, p: mst };
        if (inM) return { stroke: diff > 0 ? C.caramel : C.crema, w: diff > 0 ? 4 : 3, p: mst, lf: diff > 0 ? C.caramel : undefined };
        if (inS) return { stroke: C.cinnamon, w: diff > 0 ? 4 : 3, p: spt, lf: spt > 0 ? C.cinnamon : undefined };
        return { dash: '5 4' };
      }} vs={(v) => (v === 'A' && spt > 0 ? C.cinnamon : C.crema)} />
      <T x={30} y={22} s={13} f={C.caramel} o={mst}>{`minimum tree: ${MST_W}`}</T>
      <T x={570} y={22} s={13} f={C.cinnamon} a="end" o={spt}>{`routes from A: ${SPT_W}`}</T>
      <T x={300} y={282} s={13} f={C.crema} a="middle" o={diff}>B–C, 3 kept; no route from A would take it</T>
    </Svg>
  );
}

// 12 · NegativeWeights. The sorted strip with its weights; every weight slides down by 20 into the negatives (−19,
// −18, …) and the order doesn't change. Kruskal runs again and accepts the identical five; the total, 11 − 100 = −89.
export function NegativeWeights({ t }: StepCtx) {
  const shift = easeInOut(seg(t, 0.5, 1.5));
  const neg = t > 1.0;
  const acc = easeOut(seg(t, 1.9, 2.6));
  const cap = easeOut(seg(t, 2.9, 3.3));
  const NEG = kruskal(-20);
  return (
    <Svg label="The ten edges sorted by weight; every weight slides down by 20 into the negatives and the order doesn't change. Kruskal accepts the identical five edges, and the total becomes 11 minus 100, minus 89" h={240}>
      <T x={30} y={30} s={12} f={C.latte}>{neg ? 'every weight − 20' : 'sorted by weight'}</T>
      {KR.order.map((e, j) => {
        const w = neg ? NEG.order[j].w : e.w;
        const ok = KR.verdict[j] && NEG.verdict[j];
        return (
          <g key={e.k} transform={`translate(0 ${shift * 60})`}>
            <rect x={30 + j * 54} y={50} width={48} height={44} rx={4} fill={acc > 0 && ok ? C.cocoa : 'none'} stroke={acc > 0 && ok ? C.caramel : C.line} />
            <T x={54 + j * 54} y={68} s={12} f={C.crema} a="middle">{`${e.u}${e.v}`}</T>
            <T x={54 + j * 54} y={86} s={12} f={neg ? C.cinnamon : C.latte} a="middle">{w < 0 ? `−${-w}` : String(w)}</T>
          </g>
        );
      })}
      <T x={300} y={190} s={13} f={C.caramel} a="middle" o={acc}>the same five accepted</T>
      <T x={300} y={216} s={13} f={C.crema} a="middle" o={cap}>{`total ${MST_W} − 100 = −${100 - MST_W}`}</T>
    </Svg>
  );
}

// 13 · Handoff. Kruskal needs the whole sorted list first. Instead, let the cut be the tree built so far: a ring around
// A takes the cheapest edge leaving it, A–C 2, and grows to {A, C}; then C–D 1; the tree grows outward. Prim's, next.
const PRIM = ['AC2', 'CD1', 'DE2', 'BC3', 'EF3'];
const PRIM_SETS = [['A'], ['A', 'C'], ['A', 'C', 'D'], ['A', 'C', 'D', 'E'], ['A', 'B', 'C', 'D', 'E'], ['A', 'B', 'C', 'D', 'E', 'F']];
export function Handoff({ t }: StepCtx) {
  const list = easeOut(seg(t, 0.2, 0.6));
  const listOut = easeOut(seg(t, 1.0, 1.3));
  const k = clamp((t - 1.4) / 0.42, 0, 5);
  const cap = easeOut(seg(t, 3.6, 3.95));
  const set = PRIM_SETS[Math.floor(k)];
  return (
    <Svg label="Kruskal needs the whole sorted edge list first. Instead the cut is the tree built so far: a ring around A takes the cheapest edge leaving it, A to C, and the tree grows to C, then D, E, B and F. Prim's algorithm, next" h={300}>
      <Graph style={(e) => {
        const i = PRIM.indexOf(e.k);
        return i >= 0 && k > i ? { stroke: C.caramel, w: 3, p: clamp((k - i) * 1.5, 0, 1) } : { dash: '5 4' };
      }} vs={(v) => (k > 0 && set.includes(v) ? C.caramel : C.crema)} />
      <g opacity={list * (1 - listOut)}>
        <T x={300} y={282} s={13} f={C.latte} a="middle">Kruskal: the whole edge list, sorted, first</T>
      </g>
      {k > 0 && set.map((v) => <circle key={v} cx={POS[v][0]} cy={POS[v][1]} r={24} fill="none" stroke={C.caramel} strokeDasharray="4 4" opacity={0.7} />)}
      {k > 0 && <T x={300} y={282} s={13} f={C.caramel} a="middle">the cut: the tree so far against the rest</T>}
      {cap > 0 && <T x={570} y={22} s={13} f={C.caramel} a="end" o={cap}>Prim's algorithm, next</T>}
    </Svg>
  );
}
