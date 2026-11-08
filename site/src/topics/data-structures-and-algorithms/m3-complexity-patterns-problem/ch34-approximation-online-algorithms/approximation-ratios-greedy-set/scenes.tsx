import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's: the growing family at k = 3 (28 elements: two rows of 14, blocks of 4, 8 and
// 16, greedy 3 against 2), and at k = 3, 5, 8, 12: n = 28, 124, 1,020, 16,380, greedy 3, 5, 8, 12, ratios 1.5, 2.5,
// 4.0, 6.0 against ln n = 3.33, 4.82, 6.93, 9.70; K6,6's matching of 6, cover of 12, optimum 6; sixty random graphs,
// worst ratio 2.0 (each graph's own ratio, seeded, drawn as shape only). Feige's 1998 bound is the title's. The small
// graphs and instances shown moving elsewhere are illustrations and print nothing.

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

// The k = 3 family: two rows of 14 cells; block 1 = columns 0–1, block 2 = 2–5, block 3 = 6–13 (both rows each).
const COLS = 14;
const BLOCK_OF = (c: number) => (c < 2 ? 0 : c < 6 ? 1 : 2);
const GREEDY_ORDER = [2, 1, 0]; // block 3 (16 new), then block 2 (8), then block 1 (4)
const GAIN = [4, 8, 16];

function FamilyGrid({ x0, y0, cw, ch, cellCol }: { x0: number; y0: number; cw: number; ch: number; cellCol: (r: number, c: number) => string }) {
  return (
    <g>
      {[0, 1].map((r) => Array.from({ length: COLS }, (_, c) => (
        <rect key={`${r}-${c}`} x={x0 + c * cw} y={y0 + r * (ch + 6)} width={cw - 3} height={ch} rx={2} fill={cellCol(r, c)} stroke={C.mocha} strokeWidth={0.6} />
      )))}
    </g>
  );
}

// 1 · Opening. The k = 3 family: 28 elements in two rows of 14. Greedy takes the biggest uncovered bite three times
// (block 3, block 2, block 1); then the two row sets alone cover it all: 3 picks against 2.
export function Opening({ t }: StepCtx) {
  const g = stepIdx(t, 0.3, 2.1, 3);
  const rows = easeOut(seg(t, 2.6, 3.2));
  const cap = easeOut(seg(t, 3.4, 3.9));
  const picked = (c: number) => g >= 0 && GREEDY_ORDER.slice(0, g + 1).includes(BLOCK_OF(c));
  return (
    <Svg label="The family at k three: twenty-eight elements in two rows of fourteen. Greedy takes the biggest uncovered bite three times, block three, block two, block one. Then the two row sets alone cover everything: three picks against two" h={280}>
      <T x={40} y={34} s={12} f={C.caramel}>greedy: biggest bite first</T>
      <FamilyGrid x0={40} y0={50} cw={36} ch={26} cellCol={(_, c) => (picked(c) ? C.caramel : C.band)} />
      {GREEDY_ORDER.map((b, i) => {
        const c0 = b === 0 ? 0 : b === 1 ? 2 : 6, c1 = b === 0 ? 2 : b === 1 ? 6 : 14;
        return <T key={b} x={40 + ((c0 + c1) / 2) * 36} y={130} s={12} f={C.caramel} a="middle" o={g >= i ? 1 : 0}>pick {i + 1}</T>;
      })}
      <g opacity={rows}>
        <T x={40} y={164} s={12} f={C.cinnamon}>best: the two rows</T>
        <FamilyGrid x0={40} y0={176} cw={36} ch={14} cellCol={() => C.cinnamon} />
      </g>
      <T x={40} y={250} s={13} f={C.crema} o={cap}>greedy 3, best 2, and a proof of how far</T>
    </Svg>
  );
}

// 2 · RatioPromise. An optimum line and a proved ceiling at ρ times it. Instances arrive as dots: the approximation
// algorithm's all land under the ceiling; a heuristic's land mostly low, then one far above with no warning.
export function RatioPromise({ t }: StepCtx) {
  const Y0 = 220, opt = 170, ceil = 90;
  const a = easeOut(seg(t, 0.2, 0.8));
  const algY = [150, 120, 160, 100, 140, 130, 110, 155, 125, 96];
  const heurY = [160, 150, 165, 40, 155];
  // The optimum and the proved ceiling draw first; instances then fall in from above and come to rest where they
  // land. Every one of the algorithm's stops under the ceiling; one of the heuristic's sails over it, with a ring.
  const fallA = (i: number) => easeOut(seg(t, 0.9 + i * 0.17, 1.25 + i * 0.17));
  const fallH = (i: number) => easeOut(seg(t, 2.6 + i * 0.2, 2.95 + i * 0.2));
  const nA = algY.filter((_, i) => fallA(i) >= 1).length;
  const nH = heurY.filter((_, i) => fallH(i) >= 1).length;
  return (
    <Svg label="An optimum line and a proved ceiling at a fixed multiple of it. Instances arrive as dots: the approximation algorithm's all land under the ceiling, on every one. A heuristic's land mostly low, then one far above, with no warning in advance" h={280}>
      <Draw pts={[[40, opt], [560, opt]]} t={t} from={0.1} to={0.7} stroke={C.crema} w={1.4} pen={false} />
      <T x={560} y={opt + 18} s={12} f={C.crema} a="end" o={a}>optimum</T>
      <Draw pts={[[40, ceil], [360, ceil]]} t={t} from={0.3} to={0.9} stroke={C.caramel} w={1.6} dash="5 4" pen={false} />
      <T x={40} y={ceil - 10} s={12} f={C.caramel} o={a}>proved ceiling: ρ × optimum</T>
      {algY.map((y, i) => {
        const k = fallA(i);
        return k > 0 ? <circle key={i} cx={60 + i * 30} cy={lerp(Y0 + 20, y, k)} r={5} fill={C.caramel} opacity={clamp(k * 3)} /> : null;
      })}
      {heurY.map((y, i) => {
        const k = fallH(i);
        const bad = y < ceil;
        return k > 0 ? (
          <g key={i}>
            <circle cx={400 + i * 30} cy={lerp(Y0 + 20, y, k)} r={5} fill={bad ? C.cherryText : C.latte} opacity={clamp(k * 3)} />
            {bad && k >= 1 && <circle cx={400 + i * 30} cy={y} r={5 + 14 * easeOut(seg(t, 3.35, 3.9))} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={1 - easeOut(seg(t, 3.35, 3.9))} />}
          </g>
        ) : null;
      })}
      <T x={60} y={Y0 + 30} s={12} f={C.caramel} o={nA >= algY.length ? 1 : 0}>proved, every instance</T>
      <T x={400} y={Y0 + 30} s={12} f={C.cherryText} o={nH >= 4 ? 1 : 0}>heuristic: no promise</T>
    </Svg>
  );
}

// 3 · GreedyRule. The k = 3 grid again, one pick at a time. Each pick charges its newly covered elements 1 over how
// many it covered: 16 elements at 1/16, then 8 at 1/8, then 4 at 1/4.
export function GreedyRule({ t }: StepCtx) {
  const g = stepIdx(t, 0.4, 3.4, 3);
  const sum = easeOut(seg(t, 3.6, 4.2));
  const cellCol = (_: number, c: number) => {
    const at = GREEDY_ORDER.indexOf(BLOCK_OF(c));
    return g >= at ? [C.caramel, C.crema, C.latte][at] : C.band;
  };
  return (
    <Svg label="The same grid, one greedy pick at a time. Each pick charges its newly covered elements one over how many it covered: sixteen elements at a sixteenth each, then eight at an eighth, then four at a quarter" h={280}>
      <FamilyGrid x0={40} y0={40} cw={36} ch={26} cellCol={cellCol} />
      {GREEDY_ORDER.map((b, i) => (
        <T key={b} x={40} y={130 + i * 26} s={13} f={[C.caramel, C.crema, C.latte][i]} o={g >= i ? 1 : 0}>
          {`pick ${i + 1}: ${GAIN[b]} new, each charged 1/${GAIN[b]}`}
        </T>
      ))}
      <T x={40} y={236} s={12} f={C.caramel} o={sum}>charges add up to a harmonic sum</T>
      <T x={40} y={258} s={12} f={C.latte} o={sum}>H(largest set) × optimum, at most</T>
    </Svg>
  );
}

// 4 · PredictFamily. The family grows: each new block doubles. After answering, greedy's pick count climbs with k
// (3, 5, 8, 12) while the optimum stays at 2.
const FAM = [
  { k: 3, n: '28', g: 3, r: '1.5', ln: '3.33', lnv: 3.33 },
  { k: 5, n: '124', g: 5, r: '2.5', ln: '4.82', lnv: 4.82 },
  { k: 8, n: '1,020', g: 8, r: '4.0', ln: '6.93', lnv: 6.93 },
  { k: 12, n: '16,380', g: 12, r: '6.0', ln: '9.70', lnv: 9.7 },
];
export function PredictFamily({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? stepIdx(s, 0.2, 2.2, 4) : -1;
  const blocks = stepIdx(t, 0.2, 1.8, 4);
  return (
    <Svg label="The family grows: each new block doubles the last, and two row sets still cover everything. After answering, greedy's pick count climbs with k, three, five, eight, twelve, while the optimum stays at two" h={280}>
      {Array.from({ length: 4 }, (_, j) => {
        const w = 8 * 2 ** j;
        const x = 40 + (2 ** j - 1) * 8 + j * 4;
        return <rect key={j} x={x} y={40} width={w} height={34} fill={C.latte} opacity={j <= blocks ? 0.7 : 0} stroke={C.band} />;
      })}
      <T x={40} y={94} s={12} f={C.latte} o={blocks >= 0 ? 1 : 0}>each block doubles</T>
      <line x1={60} y1={240} x2={560} y2={240} stroke={C.line} opacity={answered ? 1 : 0} />
      {FAM.map((f, i) => (
        <g key={f.k} opacity={i <= k ? 1 : 0}>
          <rect x={90 + i * 120} y={240 - f.g * 10} width={36} height={f.g * 10} fill={C.caramel} />
          <rect x={130 + i * 120} y={220} width={36} height={20} fill={C.cinnamon} />
          <T x={108 + i * 120} y={232 - f.g * 10} s={12} f={C.caramel} a="middle">{f.g}</T>
          <T x={128 + i * 120} y={262} s={12} f={C.latte} a="middle">k = {f.k}</T>
        </g>
      ))}
      <T x={560} y={40} s={12} f={C.caramel} a="end" o={k >= 3 ? 1 : 0}>greedy keeps climbing</T>
      <T x={560} y={62} s={12} f={C.cinnamon} a="end" o={k >= 3 ? 1 : 0}>optimum: 2</T>
    </Svg>
  );
}

// 5 · FamilyMeasured. Ratio against n on a log axis: greedy's 1.5, 2.5, 4.0, 6.0 at n = 28, 124, 1,020, 16,380,
// climbing alongside ln n = 3.33, 4.82, 6.93, 9.70.
export function FamilyMeasured({ t }: StepCtx) {
  const X0 = 80, X1 = 520, Y0 = 230, Y1 = 40;
  const px = (lnv: number) => X0 + ((lnv - 3) / 7) * (X1 - X0);
  const py = (v: number) => Y0 - (v / 10) * (Y0 - Y1);
  const k = stepIdx(t, 0.4, 2.8, 4);
  const ln = easeInOut(seg(t, 3.0, 4.0));
  const ratios = [1.5, 2.5, 4.0, 6.0];
  return (
    <Svg label="Ratio against the number of elements, on a log axis: greedy's 1.5, 2.5, 4.0 and 6.0 at 28, 124, 1,020 and 16,380 elements, climbing alongside the natural log of n, 3.33, 4.82, 6.93 and 9.70" h={290}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
      {FAM.map((f) => <T key={f.k} x={px(f.lnv)} y={Y0 + 18} s={12} f={C.latte} a="middle">{f.n}</T>)}
      <T x={X1} y={Y0 + 40} s={12} f={C.latte} a="end">elements n, log scale</T>
      <polyline points={FAM.filter((_, i) => i <= k).map((f, i) => `${px(f.lnv)},${py(ratios[i])}`).join(' ')} fill="none" stroke={C.caramel} strokeWidth={2.2} />
      {FAM.map((f, i) => (
        <g key={f.k} opacity={i <= k ? 1 : 0}>
          <circle cx={px(f.lnv)} cy={py(ratios[i])} r={5} fill={C.caramel} />
          <T x={px(f.lnv)} y={py(ratios[i]) + 20} s={12} f={C.caramel} a="middle">{f.r}</T>
        </g>
      ))}
      <polyline points={FAM.filter((_, i) => i <= ln * 3 + 1e-9).map((f) => `${px(f.lnv)},${py(f.lnv)}`).join(' ')} fill="none" stroke={C.cinnamon} strokeWidth={1.6} strokeDasharray="5 4" />
      {FAM.map((f, i) => <T key={f.k} x={px(f.lnv)} y={py(f.lnv) - 10} s={12} f={C.cinnamon} a="middle" o={ln * 3 >= i ? 1 : 0}>{f.ln}</T>)}
      <T x={X0 + 10} y={Y1} s={12} f={C.cinnamon} o={ln}>dashed: ln n</T>
      <T x={X0 + 10} y={Y1 + 22} s={12} f={C.caramel} o={k >= 0 ? 1 : 0}>solid: greedy / optimum</T>
    </Svg>
  );
}

// 6 · FeigeBound. Ratio against n: everything under (1 − ε) ln n is shaded, out of reach in polynomial time unless
// P = NP (Feige, 1998); greedy's harmonic bound runs just above that shading.
export function FeigeBound({ t }: StepCtx) {
  const X0 = 80, X1 = 540, Y0 = 220, Y1 = 50;
  const shade = easeOut(seg(t, 0.3, 1.3));
  const g = easeInOut(seg(t, 1.6, 2.8));
  const cap = easeOut(seg(t, 3.0, 3.6));
  const pts = (off: number, d = 1) => Array.from({ length: 31 }, (_, i) => i / 30).filter((u) => u <= d + 1e-9).map((u) => `${lerp(X0, X1, u)},${Y0 - (Math.log(2 + u * 60) + off) * 30}`);
  return (
    <Svg h={290} label="Approximation ratio against n. Everything under one minus epsilon times the natural log of n is shaded: out of reach for any polynomial algorithm unless P equals NP, Feige 1998. Greedy's harmonic bound runs just above the shading">
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 20} stroke={C.line} />
      <polygon points={[...pts(-0.4), `${X1},${Y0}`, `${X0},${Y0}`].join(' ')} fill={C.cherry} opacity={0.35 * shade} />
      <polyline points={pts(-0.4).join(' ')} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={shade} />
      <polyline points={pts(0.2, g).join(' ')} fill="none" stroke={C.caramel} strokeWidth={2.4} />
      <T x={X0} y={258} s={12} f={C.cherryText} o={shade}>shaded: below (1 − ε) ln n</T>
      <T x={X0 + 10} y={40} s={12} f={C.caramel} o={g >= 1 ? 1 : 0}>greedy's H(n), right at the ceiling</T>
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">n</T>
      <T x={X0} y={280} s={12} f={C.latte} o={cap}>out of reach, Feige 1998, unless P = NP</T>
    </Svg>
  );
}

// A small graph for the vertex-cover scenes (illustration).
const VC_P = [
  { x: 120, y: 60 }, { x: 240, y: 50 }, { x: 360, y: 70 }, { x: 470, y: 60 },
  { x: 100, y: 170 }, { x: 220, y: 160 }, { x: 340, y: 180 }, { x: 460, y: 170 },
];
const VC_E: [number, number][] = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [3, 7], [4, 5], [5, 6], [6, 7], [1, 6]];
const MATCH = [0, 2, 7, 9]; // edge indices taken by the scan: (0,1), (2,3), (4,5), (6,7)
const VC_MIN = [1, 2, 4, 7, 5]; // a cover drawn in the intro (illustration)

function VCGraph({ edgeCol, nodeCol, ring }: { edgeCol: (i: number) => string; nodeCol: (v: number) => string; ring?: (v: number) => boolean }) {
  return (
    <g>
      {VC_E.map(([a, b], i) => <line key={i} x1={VC_P[a].x} y1={VC_P[a].y} x2={VC_P[b].x} y2={VC_P[b].y} stroke={edgeCol(i)} strokeWidth={edgeCol(i) === C.mocha ? 1.2 : 2.6} />)}
      {VC_P.map((p, v) => (
        <g key={v}>
          <circle cx={p.x} cy={p.y} r={11} fill={C.band} stroke={nodeCol(v)} strokeWidth={1.8} />
          {ring?.(v) && <circle cx={p.x} cy={p.y} r={17} fill="none" stroke={C.caramel} strokeWidth={1.6} />}
        </g>
      ))}
    </g>
  );
}

// 7 · VertexCoverIntro. A small network; chosen vertices light one at a time, and each lights the edges it touches,
// until every edge is touched.
export function VertexCoverIntro({ t }: StepCtx) {
  const k = stepIdx(t, 0.4, 2.6, VC_MIN.length);
  const chosen = VC_MIN.slice(0, k + 1);
  const cap = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="A small network. Chosen vertices light one at a time, and each lights every edge it touches, until every edge in the network is touched" h={260}>
      <VCGraph edgeCol={(i) => (chosen.includes(VC_E[i][0]) || chosen.includes(VC_E[i][1]) ? C.cinnamon : C.mocha)} nodeCol={(v) => (chosen.includes(v) ? C.caramel : C.latte)} />
      <T x={40} y={232} s={12} f={C.crema} o={cap}>every edge touched: a vertex cover</T>
      <T x={40} y={254} s={12} f={C.latte} o={cap}>fewest possible: NP-hard</T>
    </Svg>
  );
}

// 8 · MatchingConstruction. The scan takes an edge (caramel), and every other edge at its endpoints goes dim; it repeats
// until no edge is free: a maximal matching of 4. Both endpoints of every matched edge are ringed: a cover of 8. The
// optimum needs one endpoint per matched edge, at least 4, so the cover is at most twice it.
export function MatchingConstruction({ t }: StepCtx) {
  const m = stepIdx(t, 0.3, 2.3, MATCH.length);
  const ring = easeOut(seg(t, 2.6, 3.2));
  const lb = easeOut(seg(t, 3.6, 4.3));
  const fin = easeOut(seg(t, 4.6, 5.2));
  const taken = MATCH.slice(0, m + 1);
  const usedV = new Set(taken.flatMap((i) => VC_E[i]));
  return (
    <Svg label="The scan takes an edge, and every other edge at its two endpoints goes dim; it repeats until no free edge is left, a maximal matching of four edges. Both endpoints of every matched edge are ringed: a cover of eight. The optimum must take one endpoint of each matched edge, at least four, so the cover is at most twice the optimum" h={290}>
      <VCGraph
        edgeCol={(i) => (taken.includes(i) ? C.caramel : VC_E[i].some((v) => usedV.has(v)) ? C.mocha : C.latte)}
        nodeCol={(v) => (usedV.has(v) ? C.caramel : C.latte)}
        ring={(v) => ring > 0 && usedV.has(v)}
      />
      <T x={40} y={226} s={12} f={C.caramel} o={m >= 3 ? 1 : 0}>maximal matching: 4 edges</T>
      <T x={330} y={226} s={12} f={C.caramel} o={ring}>cover: their 8 endpoints</T>
      <T x={40} y={254} s={12} f={C.cinnamon} o={lb}>optimum ≥ 4: one end of each</T>
      <T x={40} y={278} s={13} f={C.crema} o={fin}>8 = 2 × 4 ≤ 2 × optimum</T>
    </Svg>
  );
}

// 9 · PredictTight. K6,6: six vertices on each side, every pair joined. After answering, a matching of 6 lights, its
// cover takes all 12 vertices, while one side alone (6, cinnamon) already covers every edge: exactly 2.
export function PredictTight({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const mt = answered ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const cov = answered ? easeOut(seg(s, 1.1, 1.7)) : 0;
  const opt = answered ? easeOut(seg(s, 1.9, 2.5)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const ax = 180, bx = 420, y = (i: number) => 40 + i * 32;
  return (
    <Svg label="K six six: six vertices on each side, every pair joined. After answering, a matching of six edges lights, its cover takes all twelve vertices, while one side alone, six vertices, already covers every edge: exactly two times the optimum" h={290}>
      <g opacity={a}>
        {Array.from({ length: 6 }, (_, i) => Array.from({ length: 6 }, (_, j) => <line key={`${i}-${j}`} x1={ax} y1={y(i)} x2={bx} y2={y(j)} stroke={C.mocha} strokeWidth={0.8} />))}
      </g>
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={ax} y1={y(i)} x2={bx} y2={y(i)} stroke={C.caramel} strokeWidth={2.4} opacity={mt} />)}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} opacity={a}>
          <circle cx={ax} cy={y(i)} r={9} fill={C.band} stroke={opt > 0 ? C.cinnamon : cov > 0 ? C.caramel : C.latte} strokeWidth={2} />
          <circle cx={bx} cy={y(i)} r={9} fill={C.band} stroke={cov > 0 && opt <= 0 ? C.caramel : C.latte} strokeWidth={2} />
        </g>
      ))}
      <T x={40} y={262} s={12} f={C.caramel} o={cov}>cover from the matching: 12</T>
      <T x={330} y={262} s={12} f={C.cinnamon} o={opt}>one side: 6</T>
      <T x={330} y={284} s={13} f={C.crema} o={opt}>12 / 6 = 2, exactly</T>
    </Svg>
  );
}

// 10 · RandomGraphCheck. Sixty random graphs drop in one by one as dots at their measured ratio (seeded: shape only),
// under a ceiling line at 2; the worst seen sits right on it, 2.0.
const RG = [2.0, 1.667, 1.333, 1.2, 1.143, 2.0, 1.333, 1.333, 2.0, 1.429, 1.6, 2.0, 1.2, 2.0, 2.0, 1.143, 1.6, 1.6, 1.333, 1.333, 1.429, 1.333, 2.0, 1.111, 2.0, 2.0, 1.333, 1.5, 1.667, 2.0, 1.333, 1.6, 1.0, 1.6, 1.429, 1.429, 2.0, 1.0, 2.0, 2.0, 2.0, 1.6, 1.333, 1.6, 1.6, 1.5, 1.429, 1.25, 2.0, 1.5, 2.0, 2.0, 1.429, 1.333, 1.0, 1.5, 1.5, 1.333, 1.333, 2.0];
export function RandomGraphCheck({ t }: StepCtx) {
  const X0 = 70, X1 = 550, Y0 = 220;
  const py = (r: number) => Y0 - (r - 0.8) * 130;
  const cap = easeOut(seg(t, 3.4, 4.0));
  // Sixty graphs drop in, each falling to its measured ratio. Then a scan runs along the ceiling: it never finds a
  // dot above the line, and every graph that sits right on it rings as the scan passes.
  const land = (i: number) => easeOut(seg(t, 0.4 + i * (2.8 / 60), 0.7 + i * (2.8 / 60)));
  const scan = seg(t, 3.25, 4.3);
  const sx = lerp(X0, X1, scan);
  return (
    <Svg label="Sixty random graphs drop in one by one as dots at their measured ratio of cover to optimum, under a ceiling line at two. The worst one seen sits right on the line, 2.0" h={290}>
      <line x1={X0} y1={py(2)} x2={X1} y2={py(2)} stroke={C.cherryText} strokeDasharray="5 4" strokeWidth={1.6} />
      <T x={X0 - 8} y={py(2) + 4} s={12} f={C.cherryText} a="end">2</T>
      <line x1={X0} y1={py(1)} x2={X1} y2={py(1)} stroke={C.line} />
      <T x={X0 - 8} y={py(1) + 4} s={12} f={C.latte} a="end">1</T>
      {scan > 0 && scan < 1 && <line x1={sx} y1={py(2) - 18} x2={sx} y2={py(1) + 10} stroke={C.focus} strokeWidth={1.2} />}
      {RG.map((r, i) => {
        const k = land(i);
        return k > 0 ? <circle key={i} cx={X0 + 6 + i * 8} cy={lerp(58, py(r), k)} r={3.5} fill={r >= 2 ? C.caramel : C.latte} opacity={clamp(k * 3)} /> : null;
      })}
      {RG.map((r, i) => {
        const x = X0 + 6 + i * 8;
        const k = clamp((sx - x) / 40);
        return r >= 2 && scan < 1 && k > 0 && k < 1 ?<circle key={`p${i}`} cx={x} cy={py(r)} r={3.5 + 8 * k} fill="none" stroke={C.caramel} strokeWidth={1.2} opacity={1 - k} /> : null;
      })}
      <T x={X0} y={40} s={12} f={C.latte}>60 random graphs, 4 to 13 vertices</T>
      <T x={X0} y={262} s={12} f={C.caramel} o={cap}>never above 2; worst seen 2.0</T>
    </Svg>
  );
}

// 11 · SideBySide. Ratio against n: set cover's guarantee climbs with ln n; vertex cover's stays flat at 2.
export function SideBySide({ t }: StepCtx) {
  const X0 = 80, X1 = 540, Y0 = 230;
  const a = easeInOut(seg(t, 0.3, 2.0));
  const b = easeInOut(seg(t, 2.0, 3.2));
  const lnPts = Array.from({ length: 31 }, (_, i) => i / 30).filter((u) => u <= a + 1e-9).map((u) => `${lerp(X0, X1, u)},${Y0 - Math.log(3 + u * 400) * 28}`);
  return (
    <Svg label="Ratio against n. Set cover's guarantee climbs with the natural log of n, with no ceiling. Vertex cover's stays flat at two, on every graph" h={280}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={30} stroke={C.line} />
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">input size n</T>
      <polyline points={lnPts.join(' ')} fill="none" stroke={C.caramel} strokeWidth={2.4} />
      <line x1={X0} y1={Y0 - 2 * 28} x2={lerp(X0, X1, b)} y2={Y0 - 2 * 28} stroke={C.cinnamon} strokeWidth={2.4} />
      <T x={X1} y={Y0 - Math.log(403) * 28 - 10} s={12} f={C.caramel} a="end" o={a >= 1 ? 1 : 0}>set cover: ln n, climbing</T>
      <T x={X1} y={Y0 - 2 * 28 + 20} s={12} f={C.cinnamon} a="end" o={b >= 1 ? 1 : 0}>vertex cover: 2, flat</T>
    </Svg>
  );
}

// 12 · Recap. Three bars: a quantity computable fast, below the unknown optimum (dashed), and the algorithm's answer
// bounded against the computable one. Then the next two problems: bins and machines.
export function Recap({ t }: StepCtx) {
  const lb = easeOut(seg(t, 0.3, 0.9));
  const opt = easeOut(seg(t, 1.0, 1.6));
  const alg = easeOut(seg(t, 1.8, 2.4));
  const nx = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="Three bars: a quantity computable fast, sitting below the unknown optimum, drawn dashed, and the algorithm's answer, bounded against the computable quantity, not the optimum. Then the next two problems: packing bins and scheduling machines" h={280}>
      <T x={30} y={44} s={12} f={C.caramel}>computable lower bound</T>
      <rect x={250} y={30} width={120 * lb} height={20} fill={C.caramel} />
      <T x={30} y={84} s={12} f={C.latte}>optimum, unknown</T>
      <rect x={250} y={70} width={160 * opt} height={20} fill="none" stroke={C.latte} strokeDasharray="4 3" />
      <T x={30} y={124} s={12} f={C.crema}>our answer ≤ ρ × bound</T>
      <rect x={250} y={110} width={220 * alg} height={20} fill={C.crema} />
      <g opacity={nx}>
        <T x={30} y={190} s={12} f={C.cinnamon}>next, the same trick:</T>
        {[0, 1, 2].map((k) => <rect key={k} x={30 + k * 40} y={204} width={30} height={46} rx={2} fill="none" stroke={C.cinnamon} />)}
        <T x={30} y={274} s={12} f={C.cinnamon}>bins</T>
        {[0, 1, 2].map((k) => <rect key={k} x={250} y={204 + k * 16} width={80 + k * 40} height={12} rx={2} fill={C.cinnamon} opacity={0.6} />)}
        <T x={250} y={274} s={12} f={C.cinnamon}>machines</T>
      </g>
    </Svg>
  );
}
