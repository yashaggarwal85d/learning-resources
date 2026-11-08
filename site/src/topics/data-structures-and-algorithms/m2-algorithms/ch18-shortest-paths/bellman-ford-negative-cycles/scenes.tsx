import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = a vertex with a tentative distance; latte = secondary labels (an
// edge weight, a rate, a round); taupe = an edge checked with no change; caramel = the thing to look at this beat (the
// edge being relaxed, the distance just improved); cherryText = the bad outcome (a negative cycle, the variant that
// does more work). Every printed number is examples.py's: WORST_ORDER_ADJ, the chain 0→1→2→3→4 of −1 edges listed
// 3→4, 2→3, 1→2, 0→1, ending at [0, −1, −2, −3, −4] after 4 of 4 rounds; the rates 0.90, 0.86, 1.31 and their round
// trip 1.0139, the cycle {USD, EUR, GBP}; the star (Bellman-Ford 14, SPFA 7) and the 6-stage diamond chain
// (Bellman-Ford 36, SPFA 63). The sweeps run here by the same loop examples.py uses.

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
function Arrow({ from, to, stroke = C.line, w = 1.5, p = 1, o = 1, r = 16 }: { from: P; to: P; stroke?: string; w?: number; p?: number; o?: number; r?: number }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const sx = x1 + ux * (r + 1), sy = y1 + uy * (r + 1);
  const ex = x2 - ux * (r + 3), ey = y2 - uy * (r + 3);
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

function Vertex({ at, label, stroke = C.latte, text = C.crema, w = 2, o = 1, r = 16, s = 13 }: { at: P; label: string; stroke?: string; text?: string; w?: number; o?: number; r?: number; s?: number }) {
  return (
    <g opacity={o}>
      <circle cx={at[0]} cy={at[1]} r={r} fill={C.band} stroke={stroke} strokeWidth={w} />
      <T x={at[0]} y={at[1] + 5} s={s} f={text} a="middle">{label}</T>
    </g>
  );
}

const fmt = (d: number) => (d === Infinity ? '∞' : d < 0 ? `−${-d}` : String(d));

// examples.py's WORST_ORDER_ADJ: the chain 0 → 1 → 2 → 3 → 4, every edge −1, its edge list in the dict's own order.
const EDGE_LIST: [number, number, number][] = [[3, 4, -1], [2, 3, -1], [1, 2, -1], [0, 1, -1]];
const CX = (i: number) => 80 + i * 110;
const CY = 80;

type Check = { round: number; e: number; improved: boolean; dist: number[] };
/** examples.py's bellman_ford on the chain: every edge check of every round, with the distances after it. */
function sweep() {
  const dist = [0, Infinity, Infinity, Infinity, Infinity];
  const out: Check[] = [];
  for (let r = 1; r < 5; r++) {
    let changed = false;
    EDGE_LIST.forEach(([u, v, w], e) => {
      const improved = dist[u] + w < dist[v];
      if (improved) {
        dist[v] = dist[u] + w;
        changed = true;
      }
      out.push({ round: r, e, improved, dist: [...dist] });
    });
    if (!changed) break;
  }
  return out;
}
const SWEEP = sweep();
const ROUND_END = [1, 2, 3, 4].map((r) => SWEEP.filter((c) => c.round === r).slice(-1)[0].dist);

function Chain({ dist, hiEdge = -1, hiColour = C.caramel, fresh = -1 }: { dist: number[]; hiEdge?: number; hiColour?: string; fresh?: number }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const e = EDGE_LIST.findIndex(([u]) => u === i);
        const on = e === hiEdge;
        return (
          <g key={i}>
            <Arrow from={[CX(i), CY]} to={[CX(i + 1), CY]} stroke={on ? hiColour : C.line} w={on ? 2.5 : 1.5} />
            <T x={(CX(i) + CX(i + 1)) / 2} y={CY + 22} s={12} f={C.latte} a="middle">−1</T>
          </g>
        );
      })}
      {[0, 1, 2, 3, 4].map((v) => (
        <g key={v}>
          <Vertex at={[CX(v), CY]} label={String(v)} stroke={v === fresh ? C.caramel : dist[v] === Infinity ? C.mocha : C.crema} />
          <T x={CX(v)} y={CY - 26} s={13} f={v === fresh ? C.caramel : dist[v] === Infinity ? C.taupe : C.crema} a="middle">{fmt(dist[v])}</T>
        </g>
      ))}
    </g>
  );
}

// The currency triangle, examples.py's RATES.
const CUR: Record<string, P> = { USD: [300, 50], EUR: [460, 180], GBP: [140, 180] };
const LEGS: [string, string, string][] = [['USD', 'EUR', '0.90'], ['EUR', 'GBP', '0.86'], ['GBP', 'USD', '1.31']];
const LEG_LABEL: Record<string, P> = { 'USD-EUR': [418, 104], 'EUR-GBP': [300, 206], 'GBP-USD': [182, 104] };
function Triangle({ labels, hiLeg = -1, hiColour = C.caramel, traced = 0 }: { labels: (i: number) => string; hiLeg?: number; hiColour?: string; traced?: number }) {
  return (
    <g>
      {LEGS.map(([a, b], i) => {
        const tr = traced > i;
        const on = i === hiLeg || tr;
        return (
          <g key={i}>
            <Arrow from={CUR[a]} to={CUR[b]} stroke={on ? hiColour : C.line} w={on ? 2.5 : 1.5} r={24} />
            <T x={LEG_LABEL[`${a}-${b}`][0]} y={LEG_LABEL[`${a}-${b}`][1]} s={12} f={on ? hiColour : C.latte} a="middle">{labels(i)}</T>
          </g>
        );
      })}
      {Object.entries(CUR).map(([c, p]) => <Vertex key={c} at={p} label={c} r={22} s={12} />)}
    </g>
  );
}

// 1 · Opening. A coin goes around the loop, USD → EUR → GBP → USD, through rates 0.90, 0.86, 1.31, and comes home
// as 1.0139 of what it left with: a loop that pays, a negative cycle.
export function Opening({ t }: StepCtx) {
  const trip = easeInOut(seg(t, 0.3, 2.1));
  const k = Math.min(2, Math.floor(trip * 3));
  const f = trip * 3 - k;
  const [a, b] = [CUR[LEGS[k][0]], CUR[LEGS[k][1]]];
  const coin: P = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  const home = easeOut(seg(t, 2.1, 2.5));
  const cap = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="A coin goes around a loop of exchanges, dollars to euros at 0.90, euros to pounds at 0.86, pounds back to dollars at 1.31, and comes home as 1.0139 of what it left with" h={270}>
      <Triangle labels={(i) => `× ${LEGS[i][2]}`} hiLeg={trip > 0 && trip < 1 ? k : -1} />
      {trip > 0 && trip < 1 && <circle cx={coin[0]} cy={coin[1]} r={7} fill={C.caramel} />}
      <T x={300} y={124} s={14} f={C.caramel} a="middle" o={home}>× 1.0139</T>
      <T x={300} y={144} s={12} f={C.latte} a="middle" o={home}>more than it left with</T>
      <T x={300} y={248} s={13} f={C.cherryText} a="middle" o={cap}>exactly what a negative cycle means</T>
    </Svg>
  );
}

// 2 · PredictNegativeCycle. The chain after its 4 rounds, distances final. One extra round sweeps every edge and each
// one checks off with no change. After answering: a small loop beside it keeps improving on every pass, the thing
// that extra round would have caught.
export function PredictNegativeCycle({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const sw = clamp((t - 0.3) / 0.35, 0, 4);
  const e = Math.floor(sw);
  const loop = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const spin = answered ? (s * 1.4) % 1 : 0;
  const L: P[] = [[300, 170], [360, 220], [240, 220]];
  const kk = Math.floor(spin * 3) % 3;
  const ff = spin * 3 - Math.floor(spin * 3);
  const dot: P = [lerp(L[kk][0], L[(kk + 1) % 3][0], ff), lerp(L[kk][1], L[(kk + 1) % 3][1], ff)];
  return (
    <Svg label="The chain after its four rounds, every distance final. One extra round sweeps every edge and each checks off with no change. After answering: a small loop beside it keeps improving on every pass, what that round would have caught" h={270}>
      <Chain dist={ROUND_END[3]} hiEdge={sw < 4 ? e : -1} hiColour={C.caramel} />
      {EDGE_LIST.map(([u], i) => (
        <T key={i} x={(CX(u) + CX(u + 1)) / 2} y={CY + 44} s={12} f={C.taupe} a="middle" o={sw > i + 0.6 ? 1 : 0}>no change</T>
      ))}
      <T x={30} y={22} s={12} f={C.latte}>one extra round</T>
      {!answered && <T x={300} y={200} s={13} f={C.crema} a="middle" o={sw >= 4 ? 1 : 0}>nothing improves: no negative cycle?</T>}
      {answered && (
        <g opacity={loop}>
          {L.map((p, i) => <Arrow key={i} from={p} to={L[(i + 1) % 3]} stroke={C.cherryText} r={8} />)}
          {L.map((p, i) => <circle key={`v${i}`} cx={p[0]} cy={p[1]} r={8} fill={C.band} stroke={C.cherryText} strokeWidth={2} />)}
          <circle cx={dot[0]} cy={dot[1]} r={4} fill={C.caramel} />
          <T x={222} y={194} s={13} f={C.cherryText} a="end">a negative cycle</T>
          <T x={222} y={220} s={13} f={C.cherryText} a="end">keeps improving</T>
        </g>
      )}
    </Svg>
  );
}

// 3 · RelaxationMechanism. examples.py's sweep on the chain: the cursor runs down the whole edge list, 3→4, 2→3, 1→2,
// 0→1, every round; only one edge improves per round. Round 1 to 4: n − 1 rounds, no queue, no closest-first.
const SB = 0.2;
export function RelaxationMechanism({ t }: StepCtx) {
  const i = clamp(Math.floor((t - 0.3) / SB), -1, SWEEP.length - 1);
  const done = t > 0.3 + SWEEP.length * SB + 0.05;
  const cur = i >= 0 && !done ? SWEEP[i] : null;
  const dist = i >= 0 ? SWEEP[i].dist : [0, Infinity, Infinity, Infinity, Infinity];
  const fresh = cur && cur.improved ? EDGE_LIST[cur.e][1] : -1;
  const round = cur ? cur.round : done ? 4 : 1;
  return (
    <Svg label="Bellman-Ford's sweep on the chain: a cursor runs down the whole edge list, 3 to 4, 2 to 3, 1 to 2, 0 to 1, in every round, and only one edge improves each round; rounds 1 through 4, n minus one, no queue" h={270}>
      <Chain dist={dist} hiEdge={cur ? cur.e : -1} hiColour={cur?.improved ? C.caramel : C.taupe} fresh={fresh} />
      <T x={30} y={170} s={12} f={C.latte}>edges</T>
      {EDGE_LIST.map(([u, v], e) => {
        const on = cur?.e === e;
        return (
          <g key={e}>
            <rect x={100 + e * 100} y={152} width={80} height={28} rx={4} fill={C.band} stroke={on ? (cur?.improved ? C.caramel : C.crema) : C.line} strokeWidth={on ? 2 : 1} />
            <T x={140 + e * 100} y={171} s={13} f={on ? C.caramel : C.crema} a="middle">{`${u}→${v}`}</T>
          </g>
        );
      })}
      <T x={30} y={214} s={13} f={C.crema}>{`round ${round} of 4`}</T>
      {[1, 2, 3, 4].map((r) => (
        <rect key={r} x={180 + (r - 1) * 26} y={203} width={20} height={14} rx={2} fill={r < round || (done && r <= 4) ? C.crema : r === round ? C.caramel : C.band} stroke={C.line} />
      ))}
      <T x={300} y={252} s={13} f={C.latte} a="middle" o={done ? 1 : easeOut(seg(t, 0.3, 0.8))}>every edge, every round: no queue</T>
    </Svg>
  );
}

// 4 · WorstOrderTightness. A table of the distances at the end of each round: each round adds exactly one cell, a
// staircase, and the last vertex's −4 only lands in round 4: 4 of 4 possible rounds.
export function WorstOrderTightness({ t }: StepCtx) {
  const rows = [0, 1, 2, 3].map((r) => easeOut(seg(t, 0.3 + r * 0.55, 0.65 + r * 0.55)));
  const last = easeOut(seg(t, 2.6, 3.0));
  const TX = (v: number) => 160 + v * 80;
  const TY = (r: number) => 70 + r * 36;
  // Each round is the round before, copied down a row; then one improvement hops a single edge to the right,
  // from the vertex that just settled to its neighbour. The staircase those hops leave is the worst order.
  const hop = (r: number) => easeInOut(seg(t, 0.5 + r * 0.55, 0.85 + r * 0.55));
  const stairs: [number, number][] = [];
  for (let r = 0; r < 4; r++) stairs.push([TX(r + 1), TY(r) + 13], [TX(r + 1), TY(r + 1) - 14]);
  stairs.pop();
  return (
    <Svg label="A table of distances at the end of each round: each round adds exactly one new cell, a staircase, and the last vertex's minus 4 only lands in round 4, 4 of 4 possible rounds" h={270}>
      {[0, 1, 2, 3, 4].map((v) => <T key={v} x={TX(v)} y={36} s={12} f={C.latte} a="middle">{String(v)}</T>)}
      {[0, 1, 2, 3].map((r) => (
        <g key={r} opacity={rows[r]} transform={`translate(0 ${((1 - rows[r]) * -24).toFixed(2)})`}>
          <T x={40} y={TY(r) + 5} s={12} f={C.latte}>{`round ${r + 1}`}</T>
          {ROUND_END[r].map((d, v) => {
            const isNew = v === r + 1;
            const shown = !isNew || hop(r) >= 1;
            return (
              <g key={v}>
                <rect x={TX(v) - 30} y={TY(r) - 14} width={60} height={26} rx={3} fill={isNew ? C.cocoa : 'none'} stroke={isNew ? (r === 3 ? C.caramel : C.crema) : C.line} />
                <T x={TX(v)} y={TY(r) + 5} s={13} f={shown ? (d === Infinity ? C.taupe : isNew ? C.caramel : C.crema) : C.taupe} a="middle">{shown ? fmt(d) : fmt(r === 0 ? Infinity : ROUND_END[r - 1][v])}</T>
              </g>
            );
          })}
          {hop(r) > 0 && hop(r) < 1 && (
            <circle cx={lerp(TX(r), TX(r + 1), hop(r))} cy={TY(r) - Math.sin(Math.PI * hop(r)) * 16} r={5} fill={C.caramel} />
          )}
        </g>
      ))}
      <Draw pts={stairs} t={t} from={0.9} to={2.7} stroke={C.secondary} w={1.2} pen={false} dash="3 4" />
      <Reticle x={TX(4)} y={TY(3) - 1} w={70} h={34} t={t} at={2.6} />
      <T x={300} y={236} s={13} f={C.caramel} a="middle" o={last}>settled on round 4 of 4: the bound is tight</T>
    </Svg>
  );
}

// 5 · ArbitrageDetection. The rates become weights: each × r turns into −log r, so the profitable product becomes a
// sum below zero. The extra round still finds an improving edge, and the predecessors trace back around all three
// currencies: {USD, EUR, GBP}.
export function ArbitrageDetection({ t }: StepCtx) {
  const morph = t > 1.0;
  const sum = easeOut(seg(t, 1.3, 1.8));
  const flash = easeOut(seg(t, 2.1, 2.5));
  const traced = clamp((t - 2.7) / 0.35, 0, 3);
  const cap = easeOut(seg(t, 3.8, 4.2));
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);
  return (
    <Svg label="The currency loop's rates become weights, minus the log of each rate, so the profitable product becomes a sum below zero. One extra round still finds an improving edge, and the predecessors trace back around all three currencies" h={290}>
      <Triangle labels={(i) => (morph ? `−log ${LEGS[i][2]}` : `× ${LEGS[i][2]}`)} hiLeg={flash > 0 && traced === 0 ? 2 : -1} hiColour={C.cherryText} traced={traced} />
      {!morph && <T x={300} y={124} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>product 1.0139 &gt; 1</T>}
      {morph && <T x={300} y={124} s={13} f={C.caramel} a="middle" o={sum}>sum &lt; 0</T>}
      {flash > 0 && traced < 3 && <T x={300} y={146} s={12} f={C.cherryText} a="middle" o={pulse}>still improves</T>}
      <T x={300} y={250} s={13} f={C.cherryText} a="middle" o={cap}>{`cycle traced: {USD, EUR, GBP}`}</T>
    </Svg>
  );
}

// 6 · SPFAPredict. The star: Bellman-Ford's sweeps 14 relaxations, the queue variant 7. After answering: the 6-stage
// diamond chain, built so every correction arrives late: Bellman-Ford 36, the queue variant 63.
export function SPFAPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const star = easeOut(seg(t, 0.3, 0.9));
  const bars = easeOut(seg(t, 1.0, 1.8));
  const nums = easeOut(seg(t, 1.8, 2.2));
  const chain = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const bars2 = answered ? easeOut(seg(s, 0.7, 1.5)) : 0;
  const nums2 = answered ? easeOut(seg(s, 1.5, 1.9)) : 0;
  const SC = 300 / 63;
  const BX = 250;
  return (
    <Svg label="The star graph: Bellman-Ford's sweeps make 14 relaxations, the queue variant 7. After answering: a six-stage chain of diamonds built so every correction arrives late: Bellman-Ford 36, the queue variant 63" h={290}>
      <g opacity={star}>
        {Array.from({ length: 7 }, (_, i) => {
          const a = -Math.PI / 2 + (i / 7) * Math.PI * 2;
          return (
            <g key={i}>
              <line x1={110} y1={70} x2={110 + 44 * Math.cos(a)} y2={70 + 44 * Math.sin(a)} stroke={C.line} strokeWidth={1.3} />
              <circle cx={110 + 44 * Math.cos(a)} cy={70 + 44 * Math.sin(a)} r={5} fill={C.crema} />
            </g>
          );
        })}
        <circle cx={110} cy={70} r={7} fill={C.caramel} />
      </g>
      <T x={BX} y={40} s={12} f={C.latte}>plain sweeps</T>
      <rect x={BX} y={46} width={14 * SC * bars} height={16} fill={C.crema} />
      <T x={BX + 14 * SC + 10} y={59} s={13} f={C.crema} o={nums}>14</T>
      <T x={BX} y={90} s={12} f={C.latte}>queue variant</T>
      <rect x={BX} y={96} width={7 * SC * bars} height={16} fill={C.caramel} />
      <T x={BX + 7 * SC + 10} y={109} s={13} f={C.caramel} o={nums}>7</T>
      {answered && (
        <g opacity={chain}>
          {Array.from({ length: 6 }, (_, i) => {
            const x0 = 40 + i * 32;
            return (
              <g key={i}>
                <line x1={x0} y1={200} x2={x0 + 32} y2={200} stroke={C.line} strokeWidth={1.3} />
                <path d={`M${x0} 200 L${x0 + 16} 180 L${x0 + 32} 200`} fill="none" stroke={C.cherryText} strokeWidth={1.3} />
                <circle cx={x0 + 16} cy={180} r={3} fill={C.latte} />
                <circle cx={x0} cy={200} r={4} fill={C.crema} />
              </g>
            );
          })}
          <circle cx={232} cy={200} r={4} fill={C.crema} />
          <T x={40} y={232} s={12} f={C.latte}>6 diamonds</T>
          <T x={BX + 20} y={160} s={12} f={C.latte}>plain sweeps</T>
          <rect x={BX + 20} y={166} width={36 * SC * 0.9 * bars2} height={16} fill={C.crema} />
          <T x={BX + 20 + 36 * SC * 0.9 + 10} y={179} s={13} f={C.crema} o={nums2}>36</T>
          <T x={BX + 20} y={210} s={12} f={C.latte}>queue variant</T>
          <rect x={BX + 20} y={216} width={63 * SC * 0.9 * bars2} height={16} fill={C.cherryText} />
          <T x={BX + 20} y={252} s={13} f={C.cherryText} o={nums2}>63: worse than plain</T>
        </g>
      )}
      {!answered && <T x={300} y={200} s={13} f={C.crema} a="middle" o={nums}>worst case: ever strictly less?</T>}
      {answered && <T x={300} y={282} s={13} f={C.caramel} a="middle" o={nums2}>the same worst-case bound</T>}
    </Svg>
  );
}

// 7 · Recap. The chain's negative distances, answered. Two chips: closest vertex's edges against every edge. Then a
// 5 × 5 grid fills one row per source, one run each: the whole table at once is next.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const chips = easeOut(seg(t, 1.0, 1.5));
  const fade = 1 - easeOut(seg(t, 1.9, 2.2));
  const rows = [0, 1, 2, 3, 4].map((r) => easeOut(seg(t, 2.2 + r * 0.2, 2.4 + r * 0.2)));
  const cap = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="The chain with its negative distances, answered. Then two labels: Dijkstra relaxes the closest vertex's edges, Bellman-Ford every edge. Then a five by five table fills one row per source, one run each: the whole table at once is next" h={270}>
      <g opacity={a * fade}>
        <Chain dist={ROUND_END[3]} />
        <g opacity={chips}>
          <rect x={60} y={150} width={220} height={30} rx={15} fill="none" stroke={C.latte} />
          <T x={170} y={170} s={12} f={C.latte} a="middle">Dijkstra: closest's edges</T>
          <rect x={320} y={150} width={220} height={30} rx={15} fill="none" stroke={C.caramel} />
          <T x={430} y={170} s={12} f={C.caramel} a="middle">Bellman-Ford: every edge</T>
        </g>
      </g>
      {[0, 1, 2, 3, 4].map((r) => (
        <g key={r} opacity={rows[r]}>
          <T x={180} y={52 + r * 30} s={12} f={C.latte} a="end">{`from ${r}`}</T>
          {[0, 1, 2, 3, 4].map((c) => <rect key={c} x={200 + c * 40} y={38 + r * 30} width={34} height={22} rx={3} fill={C.cocoa} stroke={C.line} />)}
        </g>
      ))}
      <T x={300} y={226} s={13} f={C.caramel} a="middle" o={cap}>one run per source, or the whole table at once: next</T>
    </Svg>
  );
}
