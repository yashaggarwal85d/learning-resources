import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 18): crema = unrelaxed vertex; latte = secondary labels
// (a distance estimate, a round counter, a relaxation count); taupe = a vertex no longer of
// interest this beat; caramel = the thing to look at this beat (the edge being relaxed, the
// round counter, the queue); cherry/cherryText = the bad outcome (a detected negative cycle,
// SPFA's own extra work). This topic's own graphs (examples.py): WORST_ORDER_ADJ (a 5-vertex
// chain, worst relaxation order); ARBITRAGE_ADJ (3 currencies, USD/EUR/GBP); the SPFA
// adversarial diamond chain (build_spfa_adversary).

const CHAIN_POS: Record<number, readonly [number, number]> = {
  0: [60, 140],
  1: [175, 140],
  2: [290, 140],
  3: [405, 140],
  4: [520, 140],
};
const CHAIN_EDGES: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4]];

function ArrowDefs() {
  return (
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" fill={C.quiet} />
      </marker>
    </defs>
  );
}

function ChainNode({ i, fill, label }: { i: number; fill: string; label?: string }) {
  const [x, y] = CHAIN_POS[i];
  return (
    <g>
      <circle cx={x} cy={y} r={16} fill={C.band} stroke={fill} strokeWidth={2.5} />
      <T x={x} y={y + 5} s={13} f={fill} a="middle">{String(i)}</T>
      {label && <T x={x} y={y - 24} s={11} f={C.latte} a="middle">{label}</T>}
    </g>
  );
}

function ChainEdge({ a, b, color = C.line }: { a: number; b: number; color?: string }) {
  const [x1, y1] = CHAIN_POS[a];
  const [x2, y2] = CHAIN_POS[b];
  return <line x1={x1 + 18} y1={y1} x2={x2 - 18} y2={y2} stroke={color} strokeWidth={1.5} markerEnd="url(#arrow)" />;
}

// 1 · Opening: a loop of currency conversions, more money at the end.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const CUR_POS: Record<string, readonly [number, number]> = { USD: [350, 90], EUR: [200, 220], GBP: [500, 220] };
  const pairs: [string, string][] = [['USD', 'EUR'], ['EUR', 'GBP'], ['GBP', 'USD']];
  return (
    <Svg label="A loop of three currency conversions that leaves more money at the end than it started with" h={280}>
      <ArrowDefs />
      {pairs.map(([x, y], i) => {
        const [x1, y1] = CUR_POS[x];
        const [x2, y2] = CUR_POS[y];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.line} strokeWidth={1.5} markerEnd="url(#arrow)" />;
      })}
      {Object.entries(CUR_POS).map(([name, [x, y]]) => (
        <g key={name}>
          <circle cx={x} cy={y} r={20} fill={C.band} stroke={C.crema} strokeWidth={2.5} />
          <T x={x} y={y + 5} s={12} f={C.crema} a="middle">{name}</T>
        </g>
      ))}
      <T x={350} y={260} s={13} f={C.latte} a="middle" o={a}>a round trip that pays for itself, and then some</T>
    </Svg>
  );
}

// 2 · PredictNegativeCycle.
export function PredictNegativeCycle({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A final relaxation round finding no improvement anywhere, asking what that proves about negative cycles" h={280}>
      <ArrowDefs />
      {CHAIN_EDGES.map(([x, y], i) => <ChainEdge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4].map((v) => <ChainNode key={v} i={v} fill={C.crema} />)}
      <T x={290} y={190} s={13} f={C.latte} a="middle" o={a}>a clean final round —</T>
      <T x={290} y={212} s={13} f={C.latte} a="middle" o={a}>proof of no negative cycle, or not?</T>
      {answer !== null && (
        <>
          <T x={290} y={238} s={14} f={C.focus} a="middle">yes — a negative cycle would always</T>
          <T x={290} y={260} s={14} f={C.focus} a="middle">find one more improvement</T>
        </>
      )}
    </Svg>
  );
}

// 3 · RelaxationMechanism: relax every edge, repeat |V|-1 times.
export function RelaxationMechanism({ t }: StepCtx) {
  const round = Math.min(4, Math.floor(easeOut(seg(t, 0.3, 2.8)) * 4.3));
  const settled = [0, 1, 2, 3, 4].filter((v) => v <= round);
  return (
    <Svg label="Every edge relaxed on every round, repeated up to |V| minus one times" h={280}>
      <ArrowDefs />
      {CHAIN_EDGES.map(([x, y], i) => <ChainEdge key={i} a={x} b={y} color={i < round ? C.caramel : C.line} />)}
      {[0, 1, 2, 3, 4].map((v) => <ChainNode key={v} i={v} fill={settled.includes(v) ? C.taupe : C.crema} label={settled.includes(v) ? 'settled' : undefined} />)}
      <T x={290} y={225} s={13} f={C.latte} a="middle">round {Math.max(1, round)} of up to 4 — every edge relaxed,</T>
      <T x={290} y={247} s={13} f={C.latte} a="middle">not just one vertex's</T>
    </Svg>
  );
}

// 4 · WorstOrderTightness: the exact chain where the bound is needed in full.
export function WorstOrderTightness({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A chain built so the correct distances only finish settling on the very last permitted round" h={260}>
      <ArrowDefs />
      {CHAIN_EDGES.map(([x, y], i) => <ChainEdge key={i} a={x} b={y} color={C.cherryText} />)}
      {[0, 1, 2, 3, 4].map((v) => <ChainNode key={v} i={v} fill={C.crema} />)}
      <T x={290} y={215} s={13} f={C.latte} a="middle" o={a}>stabilises only on round four of four —</T>
      <T x={290} y={237} s={13} f={C.latte} a="middle" o={a}>the bound is tight, not just safe</T>
    </Svg>
  );
}

// 5 · ArbitrageDetection: the currency graph as a negative cycle, detected and traced back.
export function ArbitrageDetection({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const CUR_POS: Record<string, readonly [number, number]> = { USD: [350, 90], EUR: [200, 220], GBP: [500, 220] };
  const pairs: [string, string][] = [['USD', 'EUR'], ['EUR', 'GBP'], ['GBP', 'USD']];
  return (
    <Svg label="The currency loop reduced to edge weights, detected as a negative cycle, and traced back edge by edge" h={300}>
      <ArrowDefs />
      {pairs.map(([x, y], i) => {
        const [x1, y1] = CUR_POS[x];
        const [x2, y2] = CUR_POS[y];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.cherryText} strokeWidth={2} markerEnd="url(#arrow)" />;
      })}
      {Object.entries(CUR_POS).map(([name, [x, y]]) => (
        <g key={name}>
          <circle cx={x} cy={y} r={20} fill={C.band} stroke={C.cherryText} strokeWidth={2.5} />
          <T x={x} y={y + 5} s={12} f={C.cherryText} a="middle">{name}</T>
        </g>
      ))}
      <T x={350} y={262} s={13} f={C.latte} a="middle" o={a}>weight = negative log of the exchange rate;</T>
      <T x={350} y={284} s={13} f={C.latte} a="middle" o={a}>the loop sums negative</T>
    </Svg>
  );
}

// 6 · SPFAPredict: does the queue-driven variant ever cost as much as plain Bellman-Ford?
export function SPFAPredict({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A queue-driven variant that only re-relaxes a vertex whose own distance just improved, asked about its own worst case" h={340}>
      <T x={150} y={70} s={13} f={C.crema} a="middle" o={a}>favourable graph:</T>
      <T x={150} y={92} s={13} f={C.crema} a="middle" o={a}>most vertices settle once,</T>
      <T x={150} y={114} s={13} f={C.crema} a="middle" o={a}>never re-queued</T>
      <T x={450} y={70} s={13} f={C.cherryText} a="middle" o={a}>built-to-order graph:</T>
      <T x={450} y={92} s={13} f={C.cherryText} a="middle" o={a}>every vertex re-queued,</T>
      <T x={450} y={114} s={13} f={C.cherryText} a="middle" o={a}>over and over</T>
      <T x={300} y={200} s={13} f={C.latte} a="middle" o={a}>does the worst case ever beat</T>
      <T x={300} y={222} s={13} f={C.latte} a="middle" o={a}>plain Bellman-Ford's own bound?</T>
      {answer !== null && (
        <>
          <T x={300} y={254} s={14} f={C.focus} a="middle">no — the worst case is the identical bound,</T>
          <T x={300} y={276} s={14} f={C.focus} a="middle">not a better one</T>
        </>
      )}
    </Svg>
  );
}

// 7 · Recap.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The relaxation mechanism shared by every algorithm in this chapter, handed off to the all-pairs question" h={260}>
      <ArrowDefs />
      {CHAIN_EDGES.map(([x, y], i) => <ChainEdge key={i} a={x} b={y} />)}
      {[0, 1, 2, 3, 4].map((v) => <ChainNode key={v} i={v} fill={C.taupe} />)}
      <T x={290} y={215} s={13} f={C.latte} a="middle" o={a}>one shared mechanism, two different rules</T>
      <T x={290} y={237} s={13} f={C.latte} a="middle" o={a}>for when to stop trusting it</T>
    </Svg>
  );
}
