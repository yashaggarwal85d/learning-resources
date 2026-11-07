import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = textbook structure/in-memory data; latte =
// secondary labels; caramel = the thing to look at; cinnamon (rare) = the system's modification
// vs the textbook (label propagation's rounds); cherry/cherryText = bad outcome (an over-merge
// across a weak bridge).
//
// Every printed number is examples.py's: twenty-four records in three groups of eight, the two
// bridges at 0.58 and 0.62, the sweep's thresholds and cluster sizes (24; 16 and 8; 8, 8 and 8),
// record 0's entity id going from 0 to 10 on the last pair, the lineage graph's components of 6
// and 3, label propagation's 10 rounds landing on 16 and 8 (each node's settling round traced
// by the same loop). The within-group scores come from a seeded draw, so they are drawn as
// shape only: "0.90 or higher" is the range the draw is taken from.

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

/** Question opacity: shown until the reveal starts, then gone at once. */
const rev = (ask: number, r: number) => (r > 0 ? 0 : ask);

/** examples.py's match graph: chains inside each group of eight, three extra strong pairs, two weak bridges. */
const STRONG: [number, number][] = [
  ...[0, 1, 2].flatMap((g) => Array.from({ length: 7 }, (_, i) => [g * 8 + i, g * 8 + i + 1] as [number, number])),
  [0, 3],
  [10, 14],
  [17, 21],
];
const BRIDGES: [number, number, string][] = [
  [7, 8, '0.58'],
  [15, 16, '0.62'],
];

/** Node j of group g on an arc over the top of its group's circle: 0 at the lower left, 7 at the lower right. */
function pos(id: number, cx0 = 110, gap = 190, cy = 140, r = 50): [number, number] {
  const g = Math.floor(id / 8);
  const j = id % 8;
  const ang = ((210 - (j * 240) / 7) * Math.PI) / 180;
  return [cx0 + g * gap + r * Math.cos(ang), cy - r * Math.sin(ang)];
}

function Graph({ o = 1, cut = [0, 0], nodeFill, cy = 140, groups = [0, 1, 2], showBridges = 1 }: { o?: number; cut?: number[]; nodeFill?: (id: number) => string; cy?: number; groups?: number[]; showBridges?: number }) {
  const P = (id: number) => pos(id, 110, 190, cy);
  const inG = (id: number) => groups.includes(Math.floor(id / 8));
  return (
    <g opacity={o}>
      {STRONG.filter(([a]) => inG(a)).map(([a, b]) => (
        <line key={`${a}-${b}`} x1={P(a)[0]} y1={P(a)[1]} x2={P(b)[0]} y2={P(b)[1]} stroke={C.latte} strokeWidth={1.5} />
      ))}
      {BRIDGES.filter(([a, b]) => inG(a) && inG(b)).map(([a, b], i) => (
        <line key={i} x1={P(a)[0]} y1={P(a)[1]} x2={P(b)[0]} y2={P(b)[1]} stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 3" opacity={showBridges * (1 - cut[i])} />
      ))}
      {Array.from({ length: 24 }, (_, id) => id)
        .filter(inG)
        .map((id) => (
          <circle key={id} cx={P(id)[0]} cy={P(id)[1]} r={6} fill={nodeFill ? nodeFill(id) : C.crema} />
        ))}
    </g>
  );
}

// 1 · Hook: one middling pair joins two clusters; does raising the threshold change things smoothly?
export function OverMergeHook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 1.0));
  const b = easeOut(seg(t, 1.2, 2.0));
  const ask = easeOut(seg(t, 2.6, 3.4));
  const slide = answered ? easeInOut(seg(s, 0.2, 2.4)) : easeInOut(seg(t, 3.4, 5.0)) * 0.3;
  const th = lerp(0.5, 0.7, slide);
  const cut = th >= 0.58 ? 1 : 0;
  const lab = answered ? easeOut(seg(s, 2.6, 3.2)) : 0;
  const sx = (v: number) => 120 + (v - 0.5) * 1800;
  return (
    <Svg label="Two clusters of eight records joined by one weak pair scored 0.58. A threshold slider moves up from 0.50. After answering: nothing changes until it crosses 0.58, then the bridge drops and the cluster jumps apart" h={280}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>scored pairs, joined by union</T>
      <Graph o={a} groups={[0, 1]} showBridges={b} cut={[cut, 0]} nodeFill={(id) => (cut && id >= 8 ? C.latte : C.crema)} />
      <T x={250} y={196} s={12} a="middle" f={C.cherryText} o={b}>0.58</T>
      <g opacity={b}>
        <line x1={sx(0.5)} y1={226} x2={sx(0.7)} y2={226} stroke={C.mocha} strokeWidth={2} />
        <line x1={sx(0.58)} y1={218} x2={sx(0.58)} y2={234} stroke={C.cherryText} strokeWidth={1.5} />
        <circle cx={sx(th)} cy={226} r={7} fill={C.caramel} />
        <T x={sx(0.5) - 10} y={231} s={12} a="end" f={C.taupe}>0.50</T>
        <T x={sx(0.7) + 10} y={231} s={12} f={C.taupe}>0.70</T>
      </g>
      <T x={300} y={266} s={13} a="middle" f={C.caramel} o={rev(ask, slide > 0.3 && answered ? 1 : 0)}>raise the threshold: smooth, or a jump?</T>
      <T x={300} y={266} s={13} a="middle" f={C.caramel} o={lab}>flat, then one jump at 0.58</T>
    </Svg>
  );
}

// 2 · Union-find recap: find with path compression, union by size
export function UnionFindRecap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const walk = stepIdx(t, 1.0, 2.2, 3);
  const comp = easeInOut(seg(t, 2.4, 3.2));
  const join = easeInOut(seg(t, 3.6, 4.6));
  const R: [number, number] = [180, 60];
  const Y: [number, number] = [180, 120];
  const X: [number, number] = [180, 180];
  const S: [number, number] = [420, 60];
  const S1: [number, number] = [420, 120];
  const xPos: [number, number] = [lerp(X[0], 120, comp), lerp(X[1], 120, comp)];
  const sTo: [number, number] = [lerp(S[0], 260, join), lerp(S[1], 120, join)];
  const s1To: [number, number] = [lerp(S1[0], 260, join), lerp(S1[1], 180, join)];
  return (
    <Svg label="find(x) climbs x to y to the root, then points x straight at the root. union joins two roots by size: the smaller tree's root goes under the larger's" h={260}>
      <g opacity={a}>
        <line x1={xPos[0]} y1={xPos[1]} x2={comp > 0.5 ? R[0] : Y[0]} y2={comp > 0.5 ? R[1] : Y[1]} stroke={C.latte} strokeWidth={1.5} />
        <line x1={Y[0]} y1={Y[1]} x2={R[0]} y2={R[1]} stroke={C.latte} strokeWidth={1.5} />
        <line x1={s1To[0]} y1={s1To[1]} x2={sTo[0]} y2={sTo[1]} stroke={C.latte} strokeWidth={1.5} />
        {join > 0 && <line x1={sTo[0]} y1={sTo[1]} x2={R[0]} y2={R[1]} stroke={C.caramel} strokeWidth={2} opacity={join} />}
        {[
          ['root', R, walk >= 2],
          ['y', Y, walk >= 1],
          ['x', xPos, walk >= 0],
          ['s', sTo, false],
          ['', s1To, false],
        ].map(([n, p, on], i) => (
          <g key={i}>
            <circle cx={(p as number[])[0]} cy={(p as number[])[1]} r={16} fill={C.roast} stroke={on ? C.caramel : C.crema} strokeWidth={on ? 2.5 : 1.5} />
            <T x={(p as number[])[0]} y={(p as number[])[1] + 5} s={12} a="middle" f={C.crema}>{(n as string) === 'root' ? 'r' : (n as string)}</T>
          </g>
        ))}
      </g>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={walk >= 0 && comp === 0 ? 1 : 0}>find(x): climb to the root</T>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={comp > 0 && join === 0 ? 1 : 0}>compress: x now points at the root</T>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={join > 0 ? 1 : 0}>union by size: smaller root goes under</T>
    </Svg>
  );
}

// 3 · The chapter's match graph: three strong groups of eight, two weak bridges
export function MatchGraph({ t }: StepCtx) {
  const g = [0, 1, 2].map((i) => easeOut(seg(t, 0.2 + i * 0.6, 0.9 + i * 0.6)));
  const br = easeOut(seg(t, 2.4, 3.2));
  const note = easeOut(seg(t, 3.6, 4.4));
  return (
    <Svg label="Twenty-four records in three groups of eight, each held together by strong pairs scored 0.90 or higher. Two weak pairs, 0.58 and 0.62, are the only bridges between groups" h={280}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Graph o={g[i]} groups={[i]} />
          <T x={110 + i * 190} y={56} s={12} a="middle" f={C.crema} o={g[i]}>{`group ${i}: 8`}</T>
        </g>
      ))}
      <Graph o={br} showBridges={1} nodeFill={() => C.crema} />
      <T x={205} y={196} s={12} a="middle" f={C.cherryText} o={br}>0.58</T>
      <T x={395} y={196} s={12} a="middle" f={C.cherryText} o={br}>0.62</T>
      <g opacity={note}>
        <T x={300} y={236} s={13} a="middle" f={C.crema}>inside a group: 0.90 or higher</T>
        <T x={300} y={264} s={12} a="middle" f={C.cherryText}>two fragile bridges, built on purpose</T>
      </g>
    </Svg>
  );
}

// 4 · Splink: connected components, one union per matching pair
export function SplinkQuote({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const u = stepIdx(t, 1.4, 3.6, STRONG.length);
  const done = easeOut(seg(t, 3.8, 4.6));
  const gc = [C.crema, C.cinnamon, C.caramel];
  return (
    <Svg label="cluster_pairwise_predictions_at_threshold: the connected components graph clustering algorithm. Each matching pair is one union; when the pairs run out, each record's find is its entity id" h={280}>
      <g opacity={a}>
        <T x={300} y={24} s={12} a="middle" f={C.latte}>cluster_pairwise_predictions_at_threshold</T>
        <T x={300} y={50} s={13} a="middle" f={C.caramel}>connected components</T>
      </g>
      <g opacity={a}>
        {Array.from({ length: 24 }, (_, id) => (
          <circle key={id} cx={pos(id, 110, 190, 150)[0]} cy={pos(id, 110, 190, 150)[1]} r={6} fill={done > 0.5 ? gc[Math.floor(id / 8)] : C.mocha} />
        ))}
        {STRONG.map(([x, y], i) =>
          i <= u ? <line key={i} x1={pos(x, 110, 190, 150)[0]} y1={pos(x, 110, 190, 150)[1]} x2={pos(y, 110, 190, 150)[0]} y2={pos(y, 110, 190, 150)[1]} stroke={i === u && done === 0 ? C.caramel : C.latte} strokeWidth={i === u ? 2.5 : 1.5} /> : null,
        )}
      </g>
      <T x={300} y={236} s={13} a="middle" f={C.crema} o={u >= 0 && done === 0 ? 1 : 0}>one union per matching pair</T>
      <T x={300} y={236} s={13} a="middle" f={C.caramel} o={done}>one find per record: its entity id</T>
    </Svg>
  );
}

// 5 · Record 0's entity id as the pairs land, strongest first
export function RepresentativeTrace({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const k = stepIdx(t, 0.8, 4.6, 27); // pairs landed so far (0 to 26)
  const x = (i: number) => 60 + i * 18;
  const idAt = (i: number) => (i >= 26 ? 10 : 0);
  return (
    <Svg label="Record 0's entity id after each of the twenty-six pairs, strongest first. It stays 0 through twenty-five pairs; the 0.62 bridge joins groups one and two without touching it; the last pair, the 0.58 bridge, finally changes it to 10" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte} o={a}>record 0's entity id, pair by pair</T>
      <g opacity={a}>
        <line x1={x(0)} y1={170} x2={x(26)} y2={170} stroke={C.mocha} />
        <T x={x(0) - 10} y={115} s={12} a="end" f={C.taupe}>10</T>
        <T x={x(0) - 10} y={155} s={12} a="end" f={C.taupe}>0</T>
        <T x={x(26)} y={190} s={12} a="end" f={C.taupe}>pairs, strongest first →</T>
      </g>
      {Array.from({ length: Math.max(0, k + 1) }, (_, i) => (
        <circle key={i} cx={x(i)} cy={idAt(i) === 10 ? 110 : 150} r={i >= 25 ? 6 : 4} fill={i === 26 ? C.caramel : i === 25 ? C.cherryText : C.crema} />
      ))}
      <g opacity={k >= 25 ? 1 : 0}>
        <T x={x(25) - 8} y={226} s={12} a="end" f={C.cherryText}>0.62 bridge: groups 1, 2 join</T>
      </g>
      <g opacity={k >= 26 ? 1 : 0}>
        <line x1={x(25)} y1={150} x2={x(26)} y2={110} stroke={C.caramel} strokeWidth={2} />
        <T x={x(26)} y={92} s={12} a="end" f={C.caramel}>0.58 bridge: 0 → 10</T>
        <T x={300} y={254} s={12} a="middle" f={C.latte}>only the bridges reach record 0</T>
      </g>
    </Svg>
  );
}

// 6 · The sweep: largest cluster against the threshold, two jumps at the bridge scores
export function ThresholdSweep({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const pts: [number, number, string][] = [
    [0.5, 24, '24'],
    [0.55, 24, '24'],
    [0.59, 16, '16 + 8'],
    [0.6, 16, '16 + 8'],
    [0.63, 8, '8 + 8 + 8'],
    [0.7, 8, '8 + 8 + 8'],
  ];
  const k = stepIdx(t, 1.0, 4.0, 6);
  const br = easeOut(seg(t, 4.3, 5.1));
  const x = (v: number) => 80 + (v - 0.5) * 2200;
  const y = (n: number) => 200 - n * 6;
  return (
    <Svg label="Largest cluster against threshold: 24 at 0.50 and 0.55, 16 at 0.59 and 0.60, 8 at 0.63 and 0.70. The two drops sit exactly at the bridge scores 0.58 and 0.62" h={280}>
      <g opacity={a}>
        <T x={20} y={18} s={12} f={C.latte}>largest cluster</T>
        <line x1={x(0.5)} y1={200} x2={x(0.7)} y2={200} stroke={C.mocha} />
        <T x={x(0.7)} y={262} s={12} a="end" f={C.taupe}>threshold (score) →</T>
      </g>
      {pts.map(([v, n, lab], i) =>
        i <= k ? (
          <g key={v}>
            {i > 0 && <polyline points={`${x(pts[i - 1][0])},${y(pts[i - 1][1])} ${x(v)},${y(pts[i - 1][1])} ${x(v)},${y(n)}`} fill="none" stroke={C.crema} strokeWidth={2} />}
            <circle cx={x(v)} cy={y(n)} r={5} fill={C.caramel} />
            <T x={i === 2 ? x(v) - 4 : i === 3 ? x(v) + 4 : x(v)} y={i === 3 ? 240 : 222} s={12} a={i === 2 ? 'end' : i === 3 ? 'start' : 'middle'} f={C.taupe}>{v.toFixed(2)}</T>
            {(i === 0 || i === 2 || i === 4) && <T x={x(v) + 8} y={y(n) - 10} s={12} f={C.crema}>{lab}</T>}
          </g>
        ) : null,
      )}
      <g opacity={br}>
        <T x={x(0.62) + 30} y={34} s={12} f={C.cherryText}>the bridges</T>
        {[0.58, 0.62].map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={40} x2={x(v)} y2={200} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" />
            <T x={x(v)} y={34} s={12} a="middle" f={C.cherryText}>{v.toFixed(2)}</T>
          </g>
        ))}
      </g>
    </Svg>
  );
}

// 7 · No split: union merges, nothing un-merges; the way back is a rebuild
export function NoSplit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const join = easeInOut(seg(t, 0.8, 1.8));
  const ask = easeOut(seg(t, 2.0, 2.6));
  const rebuild = stepIdx(t, 3.0, 4.6, 6);
  const L: [number, number] = [200, 70];
  const Rt: [number, number] = [400, 70];
  const rTo: [number, number] = [lerp(Rt[0], 260, join), lerp(Rt[1], 130, join)];
  return (
    <Svg label="union joins two roots: one now points at the other. There is no split: no record of which edge caused the merge. Going back means rebuilding from the edge list at the new threshold" h={270}>
      <g opacity={a}>
        <circle cx={L[0]} cy={L[1]} r={18} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
        <T x={L[0]} y={L[1] + 5} s={12} a="middle" f={C.crema}>16</T>
        {join > 0 && <line x1={rTo[0]} y1={rTo[1]} x2={L[0]} y2={L[1]} stroke={C.caramel} strokeWidth={2} />}
        <circle cx={rTo[0]} cy={rTo[1]} r={18} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
        <T x={rTo[0]} y={rTo[1] + 5} s={12} a="middle" f={C.crema}>8</T>
        <T x={300} y={24} s={12} a="middle" f={C.latte}>union: one parent pointer</T>
      </g>
      <g opacity={ask}>
        <T x={420} y={135} s={13} f={C.cherryText}>split? ✕</T>
        <T x={420} y={158} s={12} f={C.latte}>no edge remembered</T>
      </g>
      <g opacity={rebuild >= 0 ? 1 : 0}>
        <T x={60} y={200} s={12} f={C.crema}>rebuild from the edge list</T>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={60 + i * 80} y={214} width={70} height={14} fill={i <= rebuild ? C.crema : C.cocoa} />
        ))}
      </g>
    </Svg>
  );
}

const LIN: Record<string, [number, number]> = {
  customers_raw: [90, 50],
  customers_clean: [270, 50],
  orders_raw: [90, 96],
  orders_clean: [270, 96],
  orders_daily_agg: [460, 96],
  revenue_dashboard: [460, 142],
  inventory_raw: [90, 206],
  inventory_clean: [270, 206],
  stock_alerts: [460, 206],
};
const LIN_EDGES: [string, string][] = [
  ['orders_raw', 'orders_clean'],
  ['orders_clean', 'orders_daily_agg'],
  ['orders_daily_agg', 'revenue_dashboard'],
  ['customers_raw', 'customers_clean'],
  ['customers_clean', 'orders_clean'],
  ['inventory_raw', 'inventory_clean'],
  ['inventory_clean', 'stock_alerts'],
];
const BIG = new Set(['customers_raw', 'customers_clean', 'orders_raw', 'orders_clean', 'orders_daily_agg', 'revenue_dashboard']);

// 8 · Lineage: the same structure, components as blast radius
export function LineageComponents({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const e = stepIdx(t, 1.0, 3.4, LIN_EDGES.length);
  const box = easeOut(seg(t, 3.7, 4.5));
  const note = easeOut(seg(t, 4.8, 5.5));
  return (
    <Svg label="Datasets and jobs joined by feeds-into edges, one union each. The orders, customers and revenue datasets form one component of 6; inventory and stock alerts, one of 3. A component is a blast radius" h={290}>
      {LIN_EDGES.map(([u, v], i) => (
        <line key={i} x1={LIN[u][0]} y1={LIN[u][1] - 4} x2={LIN[v][0]} y2={LIN[v][1] - 4} stroke={i === e ? C.caramel : C.mocha} strokeWidth={i === e ? 2.5 : 1.5} opacity={i <= e ? 1 : 0} />
      ))}
      {Object.entries(LIN).map(([n, [x, y]]) => (
        <g key={n} opacity={a}>
          <rect x={x - n.length * 5 - 6} y={y - 16} width={n.length * 10 + 12} height={22} fill={C.ink} />
          <T x={x} y={y} s={12} a="middle" f={box > 0.5 ? (BIG.has(n) ? C.caramel : C.cinnamon) : C.crema}>{n}</T>
        </g>
      ))}
      <g opacity={box}>
        <rect x={14} y={28} width={572} height={128} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        <T x={580} y={150} s={12} a="end" f={C.caramel}>6</T>
        <rect x={14} y={184} width={572} height={32} fill="none" stroke={C.cinnamon} strokeWidth={1.5} />
        <T x={580} y={210} s={12} a="end" f={C.cinnamon}>3</T>
      </g>
      <T x={300} y={262} s={13} a="middle" f={C.crema} o={note}>a component = everything a change can reach</T>
    </Svg>
  );
}

/** Label propagation at threshold 0.60 (examples.py's loop): the round in which each record reached its final label. */
const SETTLED = [0, 1, 2, 1, 2, 3, 4, 5, 0, 1, 2, 3, 4, 4, 3, 4, 5, 6, 7, 8, 8, 7, 8, 9];

// 9 · Predict: a round-based algorithm with no shared parent array
export function DistributedAlternative({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.9));
  const split = easeOut(seg(t, 1.0, 2.0));
  const ask = easeOut(seg(t, 2.6, 3.4));
  const round = answered ? stepIdx(s, 0.2, 3.0, 11) : -1; // 0 to 10
  const end = answered ? easeOut(seg(s, 3.1, 3.6)) : 0;
  const final = (id: number) => (id < 8 ? C.crema : C.cinnamon);
  return (
    <Svg label="The match graph at threshold 0.60 split across three machines with no shared parent array. After answering: each round every node takes the smallest label among its neighbours; the last node settles in round 9 and round 10 confirms nothing changed, ten rounds against union-find's one pass" h={290}>
      <g opacity={split}>
        {[0, 1, 2].map((m) => (
          <rect key={m} x={42 + m * 190} y={64} width={136} height={124} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
        ))}
        <T x={300} y={24} s={12} a="middle" f={C.latte}>three machines, no shared parent array</T>
      </g>
      <Graph o={a} cut={[1, 0]} nodeFill={(id) => (round >= 0 && SETTLED[id] <= round ? final(id) : C.mocha)} />
      <T x={300} y={236} s={13} a="middle" f={C.caramel} o={rev(ask, round >= 0 ? 1 : 0)}>rounds needed, against one pass?</T>
      <T x={300} y={236} s={13} a="middle" f={C.cinnamon} o={round >= 0 && end === 0 ? 1 : 0}>{`round ${Math.max(0, round)}`}</T>
      <g opacity={end}>
        <T x={300} y={236} s={14} a="middle" f={C.cinnamon}>10 rounds against 1 pass</T>
        <T x={300} y={264} s={12} a="middle" f={C.latte}>same clusters: 16 and 8</T>
      </g>
    </Svg>
  );
}

// 10 · Ten rounds against one pass, identical clusters
export function RoundsVersusPass({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const pass = easeInOut(seg(t, 0.8, 1.8));
  const r = stepIdx(t, 1.8, 4.2, 10);
  const same = easeOut(seg(t, 4.4, 5.2));
  const W = 400;
  return (
    <Svg label="Union-find walks the edge list once. Label propagation sweeps every node and its neighbours ten times. Both land on clusters of 16 and 8" h={270}>
      <g opacity={a}>
        <T x={20} y={46} s={13} f={C.caramel}>union-find</T>
        <rect x={160} y={32} width={W} height={18} fill={C.cocoa} />
        <rect x={160} y={32} width={W * pass} height={18} fill={C.caramel} />
        <T x={160 + W} y={72} s={12} a="end" f={C.caramel} o={pass >= 1 ? 1 : 0}>1 pass</T>
        <T x={20} y={110} s={13} f={C.cinnamon}>label propagation</T>
      </g>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={160} y={124 + i * 9} width={W} height={6} fill={i <= r ? C.cinnamon : C.cocoa} opacity={a} />
      ))}
      <T x={150} y={214} s={12} a="end" f={C.cinnamon} o={r >= 9 ? 1 : 0}>10 rounds</T>
      <T x={360} y={252} s={13} a="middle" f={C.crema} o={same}>both: clusters of 16 and 8</T>
    </Svg>
  );
}

// 11 · Recap: unordered grouping, then order kept on disk
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const sort = easeInOut(seg(t, 1.4, 2.8));
  const tree = easeOut(seg(t, 2.9, 3.6));
  const next = easeOut(seg(t, 3.8, 4.5));
  const scatter: [number, number][] = [
    [120, 70], [200, 120], [90, 150], [260, 60], [170, 180], [240, 160], [60, 100], [300, 130],
  ];
  return (
    <Svg label="Records grouped with no order among them slide into a sorted row of keys under a small index tree: the next topic keeps order itself, inside a storage engine" h={260}>
      {scatter.map(([x, y], i) => (
        <rect key={i} x={lerp(x, 120 + i * 46, sort) - 14} y={lerp(y, 150, sort) - 10} width={28} height={20} fill={C.roast} stroke={sort > 0.5 ? C.caramel : C.crema} strokeWidth={1.5} opacity={a} />
      ))}
      <g opacity={tree}>
        <rect x={250} y={60} width={110} height={24} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={265 + i * 27} y1={84} x2={120 + i * 92 + 23} y2={140} stroke={C.mocha} strokeWidth={1.5} />
        ))}
      </g>
      <T x={300} y={226} s={13} a="middle" f={C.caramel} o={next}>next: search trees inside storage engines</T>
    </Svg>
  );
}
