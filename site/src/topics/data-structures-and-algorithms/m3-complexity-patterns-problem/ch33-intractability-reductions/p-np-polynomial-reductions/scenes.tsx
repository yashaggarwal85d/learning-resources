import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's or the title's: 60 vertices and a set of 30, 435 pair checks against about
// 1.18 × 10^17 candidate sets; the bin-packing items 4, 8, 1, 4, 2, 1 in bins of 10, two bins, packed [4, 1, 4, 1] and
// [8, 2]; the self-reduction's n + 1 = 13 calls on 12 vertices, traced on examples.py's own seeded graph (seed 0,
// edge chance 0.3, largest independent set 7); the reduction (G, k) → (G, n − k) checked on 235,880 pairs with 0
// mismatches; Karp's list of 21. The join-order curve is drawn as shape only.

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

// examples.py's random_graph(12, 0.3, seed 0): its 12 edges, its self-reduction trace and its witness of size 7.
const G12_EDGES: [number, number][] = [[0, 4], [1, 3], [1, 6], [2, 7], [3, 6], [3, 9], [4, 7], [4, 10], [5, 7], [5, 9], [6, 8], [7, 8]];
const DROPPED = [false, true, false, false, true, false, true, true, false, true, false, false]; // removal kept the answer yes
const WITNESS = [0, 2, 3, 5, 8, 10, 11];
const VX = (v: number, cx = 300, cy = 140, rx = 150, ry = 100) => cx + rx * Math.cos((v / 12) * Math.PI * 2 - Math.PI / 2);
const VY = (v: number, cx = 300, cy = 140, rx = 150, ry = 100) => cy + ry * Math.sin((v / 12) * Math.PI * 2 - Math.PI / 2);

function Graph12({ col, edgeCol, ox = 0, oy = 0, sc = 1, r = 11, labels = true }: { col: (v: number) => string; edgeCol?: (a: number, b: number) => string; ox?: number; oy?: number; sc?: number; r?: number; labels?: boolean }) {
  const x = (v: number) => ox + 300 + 150 * sc * Math.cos((v / 12) * Math.PI * 2 - Math.PI / 2);
  const y = (v: number) => oy + 140 + 100 * sc * Math.sin((v / 12) * Math.PI * 2 - Math.PI / 2);
  return (
    <g>
      {G12_EDGES.map(([a, b]) => <line key={`${a}-${b}`} x1={x(a)} y1={y(a)} x2={x(b)} y2={y(b)} stroke={edgeCol ? edgeCol(a, b) : C.mocha} strokeWidth={1.4} />)}
      {Array.from({ length: 12 }, (_, v) => (
        <g key={v}>
          <circle cx={x(v)} cy={y(v)} r={r} fill={C.band} stroke={col(v)} strokeWidth={1.8} />
          {labels && <T x={x(v)} y={y(v) + 4} s={12} f={col(v)} a="middle">{v}</T>}
        </g>
      ))}
    </g>
  );
}

// 1 · Opening. Sixty vertices; thirty of them are proposed. Checking the proposal sweeps the pairs among the thirty
// (435 checks), fast. Finding one means facing about 1.18 × 10^17 candidate sets, a bar that runs off the frame.
export function Opening({ t }: StepCtx) {
  const pick = easeOut(seg(t, 0.3, 1.0));
  const sweep = seg(t, 1.2, 2.4);
  const ok = easeOut(seg(t, 2.4, 2.8));
  const find = easeInOut(seg(t, 3.0, 4.4));
  const pos = (i: number) => ({ x: 40 + (i % 20) * 27, y: 40 + Math.floor(i / 20) * 34 });
  const chosen = (i: number) => (i * 7) % 2 === 0; // every other vertex, an illustration of a set of thirty
  const sel = Array.from({ length: 60 }, (_, i) => i).filter(chosen);
  const pairIdx = Math.floor(sweep * 40);
  return (
    <Svg label="Sixty vertices, thirty of them proposed as a set with no two connected. Checking the proposal sweeps the pairs among the thirty, 435 quick checks. Finding one means facing about 1.18 times ten to the seventeen candidate sets, a bar that runs off the frame" h={290}>
      {Array.from({ length: 60 }, (_, i) => {
        const p = pos(i);
        return <circle key={i} cx={p.x} cy={p.y} r={6} fill={chosen(i) ? C.caramel : C.latte} opacity={chosen(i) ? 0.3 + 0.7 * pick : 0.5} />;
      })}
      {sweep > 0 && sweep < 1 && Array.from({ length: 3 }, (_, k) => {
        const a = sel[(pairIdx + k * 7) % 30], b = sel[(pairIdx * 3 + k * 11 + 5) % 30];
        const pa = pos(a), pb = pos(b);
        return <line key={k} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={C.caramel} strokeWidth={1.2} />;
      })}
      <T x={40} y={162} s={13} f={C.caramel} o={ok}>check a set of 30: 435 pair checks</T>
      <g opacity={find > 0 ? 1 : 0}>
        <T x={40} y={210} s={13} f={C.cherryText}>find one: 1.18 × 10^17 sets to try</T>
        <rect x={40} y={222} width={510 * find} height={18} fill={C.cherry} stroke={C.cherryText} />
        <path d={`M${550 + 0 * find} 231 l-10 -9 l0 18 Z`} fill={C.cherryText} opacity={find >= 1 ? 1 : 0} />
      </g>
    </Svg>
  );
}

// 2 · PredictSelfReduction. A yes/no oracle beside the 12-vertex graph. After answering, its calls tick out as boxes:
// one to confirm, then one per vertex: 13 in all.
export function PredictSelfReduction({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const calls = answered ? stepIdx(s, 0.2, 2.6, 13) : -1;
  const done = answered ? easeOut(seg(s, 2.7, 3.2)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="A yes-or-no oracle beside a twelve-vertex graph. After answering, its calls tick out as boxes: one to confirm a set exists, then one per vertex, thirteen in all" h={290}>
      <g opacity={a}>
        <Graph12 col={() => C.latte} ox={-120} oy={-14} sc={0.8} r={10} />
        <rect x={440} y={50} width={120} height={60} rx={6} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={500} y={86} s={13} f={C.cinnamon} a="middle">yes / no</T>
        {!answered && <T x={500} y={150} s={16} f={C.taupe} a="middle">? calls</T>}
      </g>
      {Array.from({ length: 13 }, (_, k) => (
        <rect key={k} x={60 + k * 38} y={240} width={30} height={22} rx={3} fill={k === 0 ? C.cinnamon : C.caramel} opacity={k <= calls ? 0.9 : 0} />
      ))}
      <T x={440} y={150} s={13} f={C.caramel} o={done}>1 + 12 = 13 calls</T>
    </Svg>
  );
}

// 3 · PNPCertificateVerifier. Two lanes. P: an instance enters a solver and a yes or no comes out, within a
// polynomial clock. NP: an instance travels with a certificate into a verifier, which checks it within that clock.
export function PNPCertificateVerifier({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.3, 1.6));
  const np = easeInOut(seg(t, 2.0, 3.4));
  const pOut = easeOut(seg(t, 1.6, 2.0));
  const npOut = easeOut(seg(t, 3.4, 3.8));
  const lane = (y: number, title: string, box: string, prog: number, out: number, cert: boolean, col: string) => (
    <g>
      <T x={30} y={y - 14} s={12} f={col}>{title}</T>
      <rect x={lerp(30, 220, prog)} y={y} width={70} height={30} rx={3} fill="none" stroke={C.crema} opacity={prog < 1 ? 1 : 0} />
      <T x={lerp(65, 255, prog)} y={y + 20} s={12} f={C.crema} a="middle" o={prog < 1 ? 1 : 0}>instance</T>
      {cert && (
        <g opacity={prog < 1 ? 1 : 0}>
          <rect x={lerp(30, 220, prog)} y={y + 34} width={70} height={24} rx={3} fill={C.caramel} opacity={0.85} />
          <T x={lerp(65, 255, prog)} y={y + 51} s={12} f={C.band} a="middle">proof</T>
        </g>
      )}
      <rect x={300} y={y - 4} width={130} height={cert ? 66 : 38} rx={5} fill="none" stroke={col} strokeWidth={1.6} />
      <T x={365} y={y + (cert ? 34 : 20)} s={12} f={col} a="middle">{box}</T>
      <rect x={300} y={y + (cert ? 68 : 40)} width={130 * clamp(prog * 1.2, 0, 1)} height={4} fill={col} />
      <T x={460} y={y + 20} s={14} f={col} o={out}>yes / no</T>
    </g>
  );
  return (
    <Svg label="Two lanes. In P, an instance goes into a solver and a yes or no comes out within a polynomial time clock. In NP, an instance travels with a certificate, a proof, into a verifier that checks the proof within that same clock" h={290}>
      {lane(50, 'P: solve it', 'solver', p, pOut, false, C.crema)}
      {lane(170, 'NP: check a proof', 'verifier', np, npOut, true, C.caramel)}
      <T x={30} y={282} s={12} f={C.latte} o={npOut}>under each box: time, a power of the length</T>
    </Svg>
  );
}

// 4 · ConsequencesOfDefinitions. A circle P draws inside a larger circle NP: solving is a proof. Then a dashed arrow
// from NP back onto P with a question mark, the open question; then the letters spelled out.
export function ConsequencesOfDefinitions({ t }: StepCtx) {
  const np = easeOut(seg(t, 0.2, 0.8));
  const p = easeOut(seg(t, 0.8, 1.4));
  const q = easeOut(seg(t, 2.0, 2.8));
  const nm = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="A circle P draws inside a larger circle NP, because solving is itself a proof. Then a dashed arrow from NP back onto P with a question mark: the open question. Then the letters spelled out: nondeterministic polynomial time" h={290}>
      <ellipse cx={220} cy={140} rx={170 * np} ry={110 * np} fill="none" stroke={C.caramel} strokeWidth={1.6} />
      <T x={330} y={60} s={14} f={C.caramel} o={np}>NP</T>
      <ellipse cx={180} cy={150} rx={70 * p} ry={50 * p} fill={C.crema} fillOpacity={0.12} stroke={C.crema} strokeWidth={1.6} />
      <T x={180} y={156} s={14} f={C.crema} a="middle" o={p}>P</T>
      <g opacity={q}>
        <path d="M330 120 Q300 100 254 136" fill="none" stroke={C.cinnamon} strokeWidth={1.6} strokeDasharray="5 4" />
        <T x={420} y={130} s={14} f={C.cinnamon}>P = NP ?</T>
        <T x={420} y={154} s={12} f={C.latte}>open</T>
      </g>
      <T x={40} y={276} s={12} f={C.latte} o={nm}>NP: nondeterministic polynomial time</T>
    </Svg>
  );
}

// 5 · ThreeFlavors. Items 4, 8, 1, 4, 2, 1 and bins of 10. Decision: do they fit in two bins? yes. Search: the packing
// [4, 1, 4, 1] and [8, 2] builds. Optimization: the fewest bins is 2, since one bin cannot hold them.
const ITEMS = [4, 8, 1, 4, 2, 1];
const PACK = [[0, 2, 3, 5], [1, 4]]; // item indices of [4, 1, 4, 1] and [8, 2]
export function ThreeFlavors({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const dec = easeOut(seg(t, 1.0, 1.5));
  const srch = easeInOut(seg(t, 1.8, 3.0));
  const opt = easeOut(seg(t, 3.3, 3.9));
  const U = 14;
  const binX = [330, 450];
  return (
    <Svg label="Items four, eight, one, four, two and one, and bins of size ten. Decision: do they fit in two bins? Yes. Search: the packing four, one, four, one and eight, two builds. Optimization: the fewest bins is two, since one bin cannot hold them all" h={290}>
      {ITEMS.map((w, i) => {
        const b = PACK[0].includes(i) ? 0 : 1;
        const k = PACK[b].indexOf(i);
        const below = PACK[b].slice(0, k).reduce((s2, j) => s2 + ITEMS[j], 0);
        const tx = binX[b] + 6, ty = 236 - (below + w) * U;
        const y = lerp(40, ty, srch);
        const sx = 40 + ITEMS.slice(0, i).reduce((s2, v) => s2 + v, 0) * 11;
        return (
          <g key={i} opacity={a}>
            <rect x={lerp(sx, tx, srch)} y={srch > 0 ? y : 40} width={srch > 0 ? lerp(w * 11, 68, srch) : w * 11} height={srch > 0 ? lerp(22, w * U - 2, srch) : 22} rx={2} fill={C.crema} opacity={0.85} stroke={C.band} />
            <T x={lerp(sx + (w * 11) / 2, tx + 34, srch)} y={srch > 0 ? lerp(56, ty + (w * U) / 2 + 4, srch) : 56} s={12} f={C.band} a="middle">{w}</T>
          </g>
        );
      })}
      {binX.map((x, b) => <rect key={b} x={x} y={236 - 10 * U - 2} width={80} height={10 * U + 4} rx={3} fill="none" stroke={C.latte} />)}
      <T x={40} y={100} s={12} f={C.latte} o={a}>bins of 10</T>
      <T x={40} y={140} s={13} f={C.crema} o={dec}>decision: fits in 2? yes</T>
      <T x={40} y={170} s={13} f={C.caramel} o={srch >= 1 ? 1 : 0}>search: here is a packing</T>
      <T x={40} y={200} s={13} f={C.cinnamon} o={opt}>optimization: fewest is 2</T>
      <T x={40} y={262} s={12} f={C.latte} o={opt}>theory uses the yes/no form</T>
    </Svg>
  );
}

// 6 · SelfReductionWalkthrough. examples.py's own 12-vertex graph and largest independent set size 7. Call 1 confirms
// a set of 7 exists; then each vertex in turn is removed and the oracle asked again: a vertex whose removal keeps the
// answer yes is dropped (fades), one whose removal flips it to no is kept (caramel). Seven remain: 13 calls.
export function SelfReductionWalkthrough({ t }: StepCtx) {
  const first = easeOut(seg(t, 0.2, 0.6));
  const v = stepIdx(t, 0.8, 4.4, 12);
  const end = easeOut(seg(t, 4.4, 4.9));
  const state = (u: number) => (u < v ? (DROPPED[u] ? 'gone' : 'kept') : u === v ? 'asking' : 'open');
  return (
    <Svg label="Examples' own twelve-vertex graph, whose largest independent set has seven vertices. Call one confirms a set of seven exists. Then each vertex in turn is removed and the oracle asked again: if the answer stays yes the vertex is dropped for good; if it flips to no the vertex is kept. Seven remain, after thirteen calls" h={300}>
      <g>
        {G12_EDGES.map(([a, b]) => {
          const gone = state(a) === 'gone' || state(b) === 'gone';
          return <line key={`${a}-${b}`} x1={VX(a)} y1={VY(a)} x2={VX(b)} y2={VY(b)} stroke={C.mocha} strokeWidth={1.4} opacity={gone ? 0.15 : 1} />;
        })}
        {Array.from({ length: 12 }, (_, u) => {
          const st = state(u);
          const col = st === 'kept' ? C.caramel : st === 'asking' ? C.cinnamon : C.latte;
          return (
            <g key={u} opacity={st === 'gone' ? 0.2 : 1}>
              <circle cx={VX(u)} cy={VY(u)} r={12} fill={C.band} stroke={col} strokeWidth={st === 'asking' ? 2.6 : 1.8} />
              <T x={VX(u)} y={VY(u) + 4} s={12} f={col} a="middle">{u}</T>
            </g>
          );
        })}
      </g>
      <T x={20} y={26} s={12} f={C.cinnamon} o={first}>call 1: a set of 7? yes</T>
      {v >= 0 && v < 12 && end <= 0 && (
        <T x={20} y={280} s={12} f={DROPPED[v] ? C.latte : C.caramel}>
          {`call ${v + 2}: without ${v}? ${DROPPED[v] ? 'yes, drop it' : 'no, keep it'}`}
        </T>
      )}
      <T x={20} y={280} s={12} f={C.caramel} o={end}>7 kept, no two joined: 13 calls</T>
    </Svg>
  );
}

// 7 · KarpReductionDefinition. Two ovals, A (known hard) and B (new), each split into yes and no halves. Arrows f map
// yes-instances into B's yes half and no-instances into its no half. Then the direction: from A to B, never back.
export function KarpReductionDefinition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const arrows = [0, 1, 2, 3].map((k) => easeInOut(seg(t, 1.0 + k * 0.4, 1.5 + k * 0.4)));
  const dir = easeOut(seg(t, 3.0, 3.6));
  const back = easeOut(seg(t, 3.8, 4.4));
  const pts = [
    { a: { x: 120, y: 90 }, b: { x: 460, y: 80 }, yes: true },
    { a: { x: 150, y: 120 }, b: { x: 440, y: 110 }, yes: true },
    { a: { x: 120, y: 180 }, b: { x: 460, y: 190 }, yes: false },
    { a: { x: 160, y: 200 }, b: { x: 430, y: 170 }, yes: false },
  ];
  return (
    <Svg label="Two ovals, problem A, already known hard, and problem B, the new one, each split into a yes half and a no half. Arrows of a quick function f map every yes-instance of A into B's yes half and every no-instance into B's no half. The direction runs from A to B, never back" h={290}>
      <g opacity={a}>
        {[140, 450].map((cx, i) => (
          <g key={cx}>
            <ellipse cx={cx} cy={140} rx={90} ry={90} fill="none" stroke={C.latte} />
            <line x1={cx - 90} y1={145} x2={cx + 90} y2={145} stroke={C.mocha} strokeDasharray="3 3" />
            <T x={cx} y={42} s={13} f={i === 0 ? C.caramel : C.crema} a="middle">{i === 0 ? 'A, known hard' : 'B, new'}</T>
            <T x={cx + (i === 0 ? -70 : 50)} y={80} s={12} f={C.latte}>yes</T>
            <T x={cx + (i === 0 ? -70 : 50)} y={220} s={12} f={C.latte}>no</T>
          </g>
        ))}
      </g>
      {pts.map((p, k) => (
        <g key={k} opacity={arrows[k] > 0 ? 1 : 0}>
          <circle cx={p.a.x} cy={p.a.y} r={5} fill={p.yes ? C.caramel : C.latte} />
          <line x1={p.a.x + 6} y1={p.a.y} x2={lerp(p.a.x + 6, p.b.x - 6, arrows[k])} y2={lerp(p.a.y, p.b.y, arrows[k])} stroke={p.yes ? C.caramel : C.latte} strokeWidth={1.4} />
          <circle cx={p.b.x} cy={p.b.y} r={5} fill={p.yes ? C.caramel : C.latte} opacity={arrows[k] >= 1 ? 1 : 0} />
        </g>
      ))}
      <g opacity={dir}>
        <line x1={200} y1={262} x2={390} y2={262} stroke={C.caramel} strokeWidth={2} />
        <path d="M390 262 l-10 -6 l0 12 Z" fill={C.caramel} />
        <T x={295} y={252} s={12} f={C.caramel} a="middle">hard → new</T>
      </g>
      <T x={295} y={286} s={12} f={C.cherryText} a="middle" o={back}>never new → hard</T>
    </Svg>
  );
}

// 8 · WorkedReductionISVC. The same 12-vertex graph: its independent set of 7 lights, then the other 5 vertices turn
// cinnamon and every edge lights as covered by one of them. (G, 7) maps to (G, 12 − 7 = 5). Then the exhaustive check:
// 235,880 pairs, 0 mismatches.
export function WorkedReductionISVC({ t }: StepCtx) {
  const is = easeOut(seg(t, 0.3, 1.0));
  const vc = easeOut(seg(t, 1.3, 2.0));
  const cov = stepIdx(t, 2.0, 3.4, 12);
  const map = easeOut(seg(t, 3.5, 4.0));
  const chk = easeOut(seg(t, 4.3, 4.8));
  const inW = (v: number) => WITNESS.includes(v);
  return (
    <Svg label="The same twelve-vertex graph. Its independent set of seven lights; then the other five vertices turn blue, and every edge lights as covered by one of those five. G with seven maps to G with twelve minus seven, five. Then the exhaustive check: 235,880 pairs, zero mismatches" h={300}>
      <g>
        {G12_EDGES.map(([a, b], k) => <line key={`${a}-${b}`} x1={VX(a, 300, 132, 140, 92)} y1={VY(a, 300, 132, 140, 92)} x2={VX(b, 300, 132, 140, 92)} y2={VY(b, 300, 132, 140, 92)} stroke={k <= cov ? C.cinnamon : C.mocha} strokeWidth={k <= cov ? 2.2 : 1.4} />)}
        {Array.from({ length: 12 }, (_, v) => {
          const col = inW(v) ? (is > 0 ? C.caramel : C.latte) : vc > 0 ? C.cinnamon : C.latte;
          return (
            <g key={v}>
              <circle cx={VX(v, 300, 132, 140, 92)} cy={VY(v, 300, 132, 140, 92)} r={11} fill={C.band} stroke={col} strokeWidth={1.8} />
              <T x={VX(v, 300, 132, 140, 92)} y={VY(v, 300, 132, 140, 92) + 4} s={12} f={col} a="middle">{v}</T>
            </g>
          );
        })}
      </g>
      <T x={20} y={26} s={12} f={C.caramel} o={is}>independent: 7</T>
      <T x={580} y={26} s={12} f={C.cinnamon} a="end" o={vc}>the rest cover: 5</T>
      <T x={20} y={258} s={13} f={C.crema} o={map}>(G, k) → (G, n − k): (G, 7) → (G, 5)</T>
      <T x={20} y={284} s={12} f={C.caramel} o={chk}>every graph to 6 vertices: 235,880 pairs, 0 mismatches</T>
    </Svg>
  );
}

// 9 · PredictWrongDirection. An arrow drawn from the new problem to the known-hard one. After answering, the two
// stand as bars: the new problem is pinned at or below the known one, and its own height stays unknown.
export function PredictWrongDirection({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const bars = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="An arrow drawn from the new problem to the known-hard one. After answering, the two stand as bars: the known problem's height, and the new problem capped at or below it, its own height still unknown" h={260}>
      <g opacity={a}>
        <rect x={60} y={60} width={140} height={40} rx={5} fill="none" stroke={C.crema} />
        <T x={130} y={85} s={13} f={C.crema} a="middle">new</T>
        <rect x={380} y={60} width={160} height={40} rx={5} fill="none" stroke={C.caramel} />
        <T x={460} y={85} s={13} f={C.caramel} a="middle">known hard</T>
        <line x1={204} y1={80} x2={370} y2={80} stroke={C.cherryText} strokeWidth={2} />
        <path d="M376 80 l-10 -6 l0 12 Z" fill={C.cherryText} />
      </g>
      <g opacity={bars}>
        <line x1={60} y1={220} x2={540} y2={220} stroke={C.line} />
        <rect x={400} y={130} width={120} height={90} fill={C.caramel} opacity={0.8} />
        <rect x={80} y={130} width={120} height={90} fill="none" stroke={C.crema} strokeDasharray="4 3" />
        <T x={140} y={180} s={16} f={C.crema} a="middle">?</T>
        <T x={60} y={246} s={12} f={C.crema}>new ≤ known: an upper bound only</T>
      </g>
    </Svg>
  );
}

// 10 · WrongDirectionVacuous. A 2-colourability instance is solved outright (its vertices two-coloured), then the
// "reduction" ignores the graph and outputs one of two fixed instances: a lone vertex asking for 1 (yes), or one edge
// asking for 2 (no). The arrow carries no information about the target.
export function WrongDirectionVacuous({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.2, 0.8));
  const col = stepIdx(t, 1.0, 2.2, 6);
  const out = easeOut(seg(t, 2.6, 3.4));
  const cap = easeOut(seg(t, 3.6, 4.2));
  const ring = Array.from({ length: 6 }, (_, i) => ({ x: 110 + 70 * Math.cos((i / 6) * Math.PI * 2), y: 120 + 70 * Math.sin((i / 6) * Math.PI * 2) }));
  return (
    <Svg label="A two-colourability instance is solved outright, its six vertices coloured in two alternating colours. Then the so-called reduction ignores the graph and outputs one of two fixed instances: a lone vertex asking for a set of one, which is yes, or a single edge asking for a set of two, which is no" h={290}>
      <g opacity={g}>
        {ring.map((p, i) => {
          const q = ring[(i + 1) % 6];
          return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.mocha} strokeWidth={1.4} />;
        })}
        {ring.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={10} fill={i <= col ? (i % 2 ? C.crema : C.cinnamon) : C.band} stroke={C.latte} />)}
        <T x={40} y={226} s={12} f={C.latte}>solve the easy problem first</T>
      </g>
      <g opacity={out}>
        <line x1={220} y1={120} x2={320} y2={120} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="5 4" />
        <rect x={340} y={50} width={200} height={56} rx={5} fill="none" stroke={C.caramel} />
        <circle cx={380} cy={78} r={8} fill={C.caramel} />
        <T x={400} y={83} s={12} f={C.caramel}>k = 1: yes</T>
        <rect x={340} y={130} width={200} height={56} rx={5} fill="none" stroke={C.latte} />
        <circle cx={370} cy={158} r={8} fill={C.latte} /><circle cx={410} cy={158} r={8} fill={C.latte} />
        <line x1={378} y1={158} x2={402} y2={158} stroke={C.latte} />
        <T x={430} y={163} s={12} f={C.latte}>k = 2: no</T>
      </g>
      <T x={340} y={226} s={12} f={C.cherryText} o={cap}>fixed outputs: proves nothing</T>
    </Svg>
  );
}

// 11 · NPHardNPComplete. Problems in NP as dots, each sending an arrow to one problem X: X is NP-hard. X moves inside
// the NP region: NP-complete. A small sample of easy instances inside X stays untouched by either label.
export function NPHardNPComplete({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const arr = easeInOut(seg(t, 0.9, 2.2));
  const move = easeInOut(seg(t, 2.6, 3.4));
  const lab = easeOut(seg(t, 3.4, 3.9));
  const dots = Array.from({ length: 9 }, (_, i) => ({ x: 90 + (i % 3) * 60, y: 90 + Math.floor(i / 3) * 50 }));
  const xp = { x: lerp(470, 280, move), y: lerp(140, 140, move) };
  return (
    <Svg label="Problems in NP as dots, each sending an arrow to one problem X: that makes X NP-hard. Then X moves inside the NP region: NP-hard and in NP makes it NP-complete" h={290}>
      <ellipse cx={180} cy={140} rx={150} ry={110} fill="none" stroke={C.latte} opacity={a} />
      <T x={60} y={40} s={13} f={C.latte} o={a}>NP</T>
      {dots.map((d, i) => (
        <g key={i} opacity={a}>
          <circle cx={d.x} cy={d.y} r={6} fill={C.crema} />
          <line x1={d.x + 6} y1={d.y} x2={lerp(d.x + 6, xp.x - 18, arr)} y2={lerp(d.y, xp.y, arr)} stroke={C.caramel} strokeWidth={1} opacity={0.7} />
        </g>
      ))}
      <circle cx={xp.x} cy={xp.y} r={18} fill={C.band} stroke={C.caramel} strokeWidth={2.2} />
      <T x={xp.x} y={xp.y + 5} s={14} f={C.caramel} a="middle">X</T>
      <T x={470} y={196} s={13} f={C.caramel} a="middle" o={arr >= 1 && move <= 0 ? 1 : 0}>NP-hard</T>
      <T x={470} y={196} s={13} f={C.caramel} a="middle" o={lab}>NP-complete</T>
      <T x={470} y={220} s={12} f={C.latte} a="middle" o={lab}>hard and in NP</T>
      <T x={20} y={280} s={12} f={C.latte} o={lab}>both: worst case, not every instance</T>
    </Svg>
  );
}

// 12 · CookLevinProblemList. Circuit satisfiability sits at the root with nothing arrowing into it (proved directly);
// arrows fan out from it to twenty-one problems, the next year's list; every later hardness proof hangs off that fan.
export function CookLevinProblemList({ t }: StepCtx) {
  const root = easeOut(seg(t, 0.2, 0.9));
  const fan = easeInOut(seg(t, 1.2, 3.2));
  const cap = easeOut(seg(t, 3.5, 4.1));
  return (
    <Svg label="Circuit satisfiability sits at the root with nothing pointing into it: it was proved hard directly. Arrows fan out from it to twenty-one problems, the list assembled the following year, and every later hardness proof hangs off that fan" h={290}>
      <rect x={220} y={30} width={160} height={40} rx={6} fill={C.caramel} opacity={root} />
      <T x={300} y={56} s={13} f={C.band} a="middle" o={root}>circuit SAT</T>
      <T x={400} y={56} s={12} f={C.latte} o={root}>proved directly</T>
      {Array.from({ length: 21 }, (_, i) => {
        const x = 40 + (i % 11) * 52 + (i >= 11 ? 26 : 0);
        const y = i >= 11 ? 210 : 150;
        const f = clamp(fan * 21 - i, 0, 1);
        return (
          <g key={i} opacity={f > 0 ? 1 : 0}>
            <line x1={300} y1={70} x2={lerp(300, x, f)} y2={lerp(70, y - 8, f)} stroke={C.latte} strokeWidth={0.8} />
            <circle cx={x} cy={y} r={7} fill={C.crema} opacity={f} />
          </g>
        );
      })}
      <T x={300} y={260} s={13} f={C.crema} a="middle" o={cap}>21 problems, the next year</T>
      <T x={300} y={284} s={12} f={C.latte} a="middle" o={cap}>each hard by a chain of reductions</T>
    </Svg>
  );
}

// 13 · HidingInDataSystems. Left: bin packing tagged NP-hard. Right: a join-order search space against table count,
// a curve that climbs out of the frame (shape only); the planner's pruned path stays low.
export function HidingInDataSystems({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const c = easeInOut(seg(t, 1.0, 3.0));
  const p = easeOut(seg(t, 3.2, 3.8));
  const X0 = 280, X1 = 560, Y0 = 230;
  const fact = (n: number) => Array.from({ length: n }, (_, i) => i + 1).reduce((x, y) => x * y, 1);
  const pts = Array.from({ length: 10 }, (_, k) => k + 1).filter((n) => n - 1 <= c * 9 + 1e-9).map((n) => `${X0 + ((n - 1) / 9) * (X1 - X0)},${Math.max(20, Y0 - Math.log10(fact(n)) * 60)}`);
  return (
    <Svg label="Left, bin packing tagged NP-hard by a real reduction. Right, the number of join orders against the number of tables, a curve that climbs out of the frame, while a planner's pruned search stays low" h={290}>
      <g opacity={a}>
        <rect x={30} y={90} width={200} height={60} rx={6} fill="none" stroke={C.caramel} />
        <T x={130} y={118} s={13} f={C.caramel} a="middle">bin packing</T>
        <T x={130} y={138} s={12} f={C.latte} a="middle">NP-hard, by reduction</T>
      </g>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={20} stroke={C.line} />
      <polyline points={pts.join(' ')} fill="none" stroke={C.cherryText} strokeWidth={2.2} />
      <line x1={X0} y1={Y0 - 10} x2={X0 + (X1 - X0) * p} y2={Y0 - 30 * p} stroke={C.cinnamon} strokeWidth={2} />
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">tables joined</T>
      <T x={X0 + 10} y={40} s={12} f={C.cherryText} o={c}>join orders</T>
      <T x={X0} y={276} s={12} f={C.cinnamon} o={p}>planner works around it</T>
    </Svg>
  );
}

// 14 · WhatThisDoesNot. One reduction drawn solid and ticked; the long chain of gadget reductions behind every classic
// problem drawn dashed, not built. Then three exits from a hard problem: approximate, use structure, prune a search.
export function WhatThisDoesNot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const ch = easeOut(seg(t, 1.0, 1.8));
  const ex = [0, 1, 2].map((k) => easeOut(seg(t, 2.4 + k * 0.5, 2.9 + k * 0.5)));
  const exits = ['approximate', 'use structure', 'prune a search'];
  return (
    <Svg label="One reduction drawn solid and checked; the long chain of gadget reductions behind every classic problem drawn dashed, not built here. Then three ways out of a hard problem: approximate it, use its structure, or search with pruning" h={290}>
      <g opacity={a}>
        <rect x={30} y={40} width={90} height={30} rx={4} fill="none" stroke={C.caramel} />
        <T x={75} y={60} s={12} f={C.caramel} a="middle">IS</T>
        <line x1={120} y1={55} x2={170} y2={55} stroke={C.caramel} strokeWidth={2} />
        <rect x={170} y={40} width={90} height={30} rx={4} fill="none" stroke={C.caramel} />
        <T x={215} y={60} s={12} f={C.caramel} a="middle">VC</T>
        <T x={30} y={96} s={12} f={C.caramel}>built and checked</T>
      </g>
      <g opacity={ch}>
        {[0, 1, 2, 3].map((k) => <rect key={k} x={300 + k * 70} y={40} width={50} height={30} rx={4} fill="none" stroke={C.latte} strokeDasharray="4 3" />)}
        {[0, 1, 2].map((k) => <line key={k} x1={350 + k * 70} y1={55} x2={370 + k * 70} y2={55} stroke={C.latte} strokeDasharray="3 3" />)}
        <T x={300} y={96} s={12} f={C.latte}>the gadget chain: not built</T>
      </g>
      {exits.map((e, k) => (
        <g key={e} opacity={ex[k]}>
          <line x1={300} y1={150} x2={lerp(300, 100 + k * 200, ex[k])} y2={lerp(150, 200, ex[k])} stroke={C.cinnamon} strokeWidth={1.4} />
          <T x={100 + k * 200} y={222} s={12} f={C.cinnamon} a="middle">{e}</T>
        </g>
      ))}
      <circle cx={300} cy={150} r={10} fill={C.cherry} stroke={C.cherryText} opacity={ex[0] > 0 ? 1 : 0} />
      <T x={300} y={268} s={12} f={C.latte} a="middle" o={ex[2]}>still ahead</T>
    </Svg>
  );
}

// 15 · Recap. A single arrow, hard → new, the whole subject. Then one number twice: its value as a long bar, and the
// few digits it takes to write, a short one: which does "polynomial" measure?
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  const v = easeInOut(seg(t, 1.6, 3.0));
  const d = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="A single arrow from known-hard to new: the whole subject is its direction. Then one number shown twice: its value as a long bar, and the handful of digits it takes to write, a short one. Which does polynomial measure?" h={260}>
      <g opacity={a}>
        <rect x={60} y={30} width={140} height={36} rx={5} fill="none" stroke={C.caramel} />
        <T x={130} y={53} s={12} f={C.caramel} a="middle">known hard</T>
        <line x1={204} y1={48} x2={376} y2={48} stroke={C.caramel} strokeWidth={2} />
        <path d="M382 48 l-10 -6 l0 12 Z" fill={C.caramel} />
        <rect x={390} y={30} width={140} height={36} rx={5} fill="none" stroke={C.crema} />
        <T x={460} y={53} s={12} f={C.crema} a="middle">new</T>
      </g>
      <T x={60} y={124} s={12} f={C.cinnamon} o={v > 0 ? 1 : 0}>a number's value</T>
      <rect x={60} y={134} width={480 * v} height={18} fill={C.cinnamon} />
      <T x={60} y={190} s={12} f={C.crema} o={d}>its length in digits</T>
      <rect x={60} y={200} width={40 * d} height={18} fill={C.crema} />
      <T x={300} y={250} s={13} f={C.caramel} a="middle" o={d}>fast in which one?</T>
    </Svg>
  );
}
