import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's: the 16-leaf sum tree's work 15, span 4, parallelism 3.75; the chain's span
// 15; the greedy schedule's real steps 15, 8, 5, 4, 4 at 1, 2, 4, 8, 16 workers; merge sort's span doubling ×2.0, work
// ×2.13, parallelism 8.0 at 65,536; the 16,383-addition stealing tree, zero steals on one worker. The seeded stealing
// simulation (its step counts and steal shares) is drawn as shape only. Task movements in the deque scenes are
// illustrations and print nothing.

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

// The 16-leaf sum tree: leaves at the bottom, additions in four levels above them.
const LEAF_X = (i: number) => 40 + i * 32;
type Node = { x: number; y: number; level: number; kids: [number, number] | null; idx: number };
const TREE: Node[] = (() => {
  const nodes: Node[] = [];
  let level: number[] = [];
  for (let i = 0; i < 16; i++) {
    nodes.push({ x: LEAF_X(i), y: 250, level: 0, kids: null, idx: i });
    level.push(i);
  }
  let lv = 1;
  while (level.length > 1) {
    const next: number[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const a = nodes[level[i]], b = nodes[level[i + 1]];
      nodes.push({ x: (a.x + b.x) / 2, y: 250 - lv * 50, level: lv, kids: [level[i], level[i + 1]], idx: nodes.length });
      next.push(nodes.length - 1);
    }
    level = next;
    lv++;
  }
  return nodes;
})();
const ADDS = TREE.filter((n) => n.kids);
// One longest chain: root, its left child, down the left edge to a leaf.
const SPAN_PATH = (() => {
  const path: number[] = [TREE.length - 1];
  while (TREE[path[path.length - 1]].kids) path.push(TREE[path[path.length - 1]].kids![0]);
  return path;
})();

function SumTree({ lit, nodeCol, edgeCol, pathOn = 0 }: { lit: (n: Node) => number; nodeCol: (n: Node) => string; edgeCol?: string; pathOn?: number }) {
  return (
    <g>
      {ADDS.map((n) =>
        n.kids!.map((k) => {
          const onPath = SPAN_PATH.includes(n.idx) && SPAN_PATH.includes(k);
          return <line key={`${n.idx}-${k}`} x1={n.x} y1={n.y} x2={TREE[k].x} y2={TREE[k].y} stroke={onPath && pathOn > 0 ? C.caramel : edgeCol ?? C.mocha} strokeWidth={onPath && pathOn > 0 ? 2.6 : 1} opacity={onPath && pathOn > 0 ? pathOn : 1} />;
        }),
      )}
      {TREE.map((n) => (n.kids ? <circle key={n.idx} cx={n.x} cy={n.y} r={8} fill={nodeCol(n)} opacity={0.35 + 0.65 * lit(n)} /> : <rect key={n.idx} x={n.x - 5} y={n.y - 5} width={10} height={10} fill={C.latte} />))}
    </g>
  );
}

// 1 · Opening. A common clock runs four bars: a tree-shaped program on one core and on sixteen (the sixteen-core run
// stops early: the seeded simulation's step counts, drawn as shape only), then a same-sized chain on one core and on
// sixteen, both running the whole way.
const STEAL_STEPS_1 = 16383, STEAL_STEPS_16 = 1190; // examples.py's simulation; the 16-worker count is seeded (shape)
export function Opening({ t }: StepCtx) {
  const clock = seg(t, 0.4, 3.2);
  const rows = [
    { label: 'tree, 1 core', len: 1, col: C.latte },
    { label: 'tree, 16 cores', len: STEAL_STEPS_16 / STEAL_STEPS_1, col: C.caramel },
    { label: 'chain, 1 core', len: 1, col: C.latte },
    { label: 'chain, 16 cores', len: 1, col: C.cherryText },
  ];
  const X0 = 170, W = 390;
  return (
    <Svg label="A common clock runs four bars. A tree-shaped program on one core runs the whole way; on sixteen cores it stops a small fraction of the way along. A chain of the same size runs the whole way on one core and on sixteen" h={280}>
      {rows.map((r, i) => {
        const y = 40 + i * 52 + (i >= 2 ? 20 : 0);
        const w = Math.min(clock, r.len) * W;
        const done = clock >= r.len;
        return (
          <g key={r.label}>
            <T x={X0 - 10} y={y + 14} s={12} f={r.col} a="end">{r.label}</T>
            <rect x={X0} y={y} width={W} height={20} fill="none" stroke={C.mocha} />
            <rect x={X0} y={y} width={w} height={20} fill={r.col === C.cherryText ? C.cherry : r.col} stroke={r.col === C.cherryText ? C.cherryText : 'none'} />
            {done && clock > 0 && <T x={X0 + w + 6} y={y + 15} s={12} f={r.col}>done</T>}
          </g>
        );
      })}
      <line x1={X0 + clock * W} y1={30} x2={X0 + clock * W} y2={240} stroke={C.crema} strokeDasharray="3 3" opacity={clock > 0 && clock < 1 ? 0.8 : 0} />
      <T x={300} y={268} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.7))}>same size; only the shape differs</T>
    </Svg>
  );
}

// 2 · PredictSumSpeedup. Sixteen numbers and their tree of fifteen additions. After answering, the levels fire one
// step at a time: four steps, then the ceiling 15 / 4 = 3.75.
export function PredictSumSpeedup({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const level = answered ? stepIdx(s, 0.2, 2.2, 4) : -1;
  const ceil = answered ? easeOut(seg(s, 2.4, 3.0)) : 0;
  const a = easeOut(seg(t, 0.2, 1.0));
  return (
    <Svg label="Sixteen numbers and the tree of fifteen additions that sums them. After answering, the levels fire one step at a time: four steps in all, and the speed-up ceiling, fifteen over four, 3.75" h={290}>
      <g opacity={a}>
        <SumTree lit={(n) => (n.level <= level + 1 ? 1 : 0)} nodeCol={(n) => (n.level <= level + 1 ? C.caramel : C.latte)} />
      </g>
      {[1, 2, 3, 4].map((lv) => (
        <T key={lv} x={590} y={250 - lv * 50 + 4} s={12} f={C.caramel} a="end" o={level + 1 >= lv ? 1 : 0}>step {lv}</T>
      ))}
      <T x={300} y={282} s={13} f={C.crema} a="middle" o={ceil}>15 / 4 = 3.75: the speed-up ceiling</T>
    </Svg>
  );
}

// 3 · WorkSpanParallelism. The same tree: all fifteen additions light (work 15), then the longest chain down from the
// root (span 4), then their ratio, 3.75.
export function WorkSpanParallelism({ t }: StepCtx) {
  const work = stepIdx(t, 0.3, 1.8, 15);
  const span = easeOut(seg(t, 2.0, 2.7));
  const par = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="The same tree. All fifteen additions light one by one: the work, fifteen. Then the longest chain down from the root: the span, four. Then their ratio, the parallelism, 3.75" h={290}>
      <SumTree lit={(n) => (ADDS.indexOf(n) <= work ? 1 : 0)} nodeCol={(n) => (span > 0 && SPAN_PATH.includes(n.idx) ? C.caramel : ADDS.indexOf(n) <= work ? C.crema : C.latte)} pathOn={span} />
      <T x={20} y={34} s={13} f={C.crema} o={work >= 14 ? 1 : 0}>work 15</T>
      <T x={20} y={56} s={13} f={C.caramel} o={span}>span 4</T>
      <T x={590} y={34} s={13} f={C.crema} a="end" o={par}>15 / 4 = 3.75</T>
      <T x={590} y={56} s={12} f={C.latte} a="end" o={par}>parallelism</T>
    </Svg>
  );
}

// 4 · ChainRedraw. The fifteen additions slide out of the tree into one long chain, each waiting on the last: span
// 4 becomes span 15, parallelism 3.75 becomes 1.0.
export function ChainRedraw({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.4, 2.2));
  const lab = easeOut(seg(t, 2.4, 3.0));
  const chainPos = (k: number) => ({ x: 60 + k * 34, y: 236 - k * 13 });
  return (
    <Svg label="The fifteen additions slide out of the tree into one long chain, each waiting on the one before. The span goes from four to fifteen, and the parallelism from 3.75 to 1.0" h={290}>
      {TREE.filter((n) => !n.kids).map((n) => <rect key={n.idx} x={n.x - 5} y={n.y - 5} width={10} height={10} fill={C.latte} opacity={1 - m} />)}
      {ADDS.map((n) => n.kids!.map((k) => (TREE[k].kids ? null : <line key={`${n.idx}-${k}`} x1={n.x} y1={n.y} x2={TREE[k].x} y2={TREE[k].y} stroke={C.mocha} opacity={1 - m} />)))}
      {ADDS.map((n) => n.kids!.map((k) => {
        if (!TREE[k].kids) return null;
        const a = ADDS.indexOf(n), b = ADDS.indexOf(TREE[k]);
        const p = { x: lerp(n.x, chainPos(a).x, m), y: lerp(n.y, chainPos(a).y, m) };
        const q = { x: lerp(TREE[k].x, chainPos(b).x, m), y: lerp(TREE[k].y, chainPos(b).y, m) };
        return <line key={`${n.idx}-${k}`} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.mocha} opacity={1 - m} />;
      }))}
      {ADDS.slice(0, -1).map((_, k) => {
        const p = chainPos(k), q = chainPos(k + 1);
        return <line key={k} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={C.cherryText} strokeWidth={1.6} opacity={m} />;
      })}
      {ADDS.map((n, k) => (
        <circle key={n.idx} cx={lerp(n.x, chainPos(k).x, m)} cy={lerp(n.y, chainPos(k).y, m)} r={8} fill={m >= 1 ? C.cherryText : C.crema} />
      ))}
      <T x={20} y={34} s={13} f={C.crema} o={1 - lab}>span 4, parallelism 3.75</T>
      <T x={20} y={34} s={13} f={C.cherryText} o={lab}>span 15, parallelism 1.0</T>
      <T x={590} y={270} s={12} f={C.latte} a="end" o={lab}>same 15 additions, one order</T>
    </Svg>
  );
}

// 5 · SortSpanRecurrence. Merge sort's recursion as rows of segments: n at the top, two halves of n/2, four of n/4.
// The halves run side by side, so the span follows just one segment per row; the merges along it add n + n/2 + n/4….
export function SortSpanRecurrence({ t }: StepCtx) {
  const X0 = 60, W = 480;
  const rows = [0, 1, 2, 3];
  const grow = (r: number) => easeOut(seg(t, 0.3 + r * 0.4, 0.7 + r * 0.4));
  const path = easeOut(seg(t, 2.1, 2.9));
  const eq = easeOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="Merge sort's recursion as rows of segments: the whole input on top, then two halves, four quarters, eight eighths. The halves run side by side, so the span follows only one segment per row, and the merges along that path add n, plus half of n, plus a quarter" h={290}>
      {rows.map((r) => {
        const parts = 2 ** r;
        const w = W / parts;
        return (
          <g key={r} opacity={grow(r)}>
            {Array.from({ length: parts }, (_, k) => {
              const onPath = k === 0 && path > 0;
              return <rect key={k} x={X0 + k * w + 2} y={40 + r * 46} width={w - 4} height={24} rx={2} fill={onPath ? C.caramel : 'none'} fillOpacity={onPath ? path : 0} stroke={onPath ? C.caramel : C.latte} strokeWidth={onPath ? 1.6 : 1} />;
            })}
            <T x={X0 - 8} y={57 + r * 46} s={12} f={C.latte} a="end">{['n', 'n/2', 'n/4', 'n/8'][r]}</T>
          </g>
        );
      })}
      <T x={X0} y={236} s={14} f={C.crema} o={eq}>span(n) = span(n/2) + n</T>
      <T x={X0} y={262} s={12} f={C.caramel} o={eq}>one half's span, plus the sequential merge</T>
    </Svg>
  );
}

// 6 · SortSpanMeasured. Merge sort from n = 2 to 65,536 on a doubling axis: each doubling multiplies the span by 2.0
// and the work by a little more (2.13 at the end), so the parallelism, work over span, climbs a step at a time to 8.0.
const SORT_PAR = [1.0, 1.33, 1.71, 2.13, 2.58, 3.05, 3.53, 4.02, 4.51, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0]; // n = 2 … 65,536
export function SortSpanMeasured({ t }: StepCtx) {
  const X0 = 70, X1 = 550, Y0 = 220, Y1 = 60;
  const px = (k: number) => X0 + (k / 15) * (X1 - X0);
  const py = (v: number) => Y0 - (v / 8) * (Y0 - Y1);
  const d = easeInOut(seg(t, 0.8, 3.0));
  const hdr = easeOut(seg(t, 0.2, 0.7));
  const end = easeOut(seg(t, 3.0, 3.5));
  const shown = SORT_PAR.filter((_, k) => k <= d * 15 + 1e-9);
  return (
    <Svg label="Merge sort from two to 65,536 keys on a doubling axis. Each doubling multiplies the span by 2.0 and the work by a little more, 2.13 at the end, so the parallelism climbs step by step to 8.0" h={290}>
      <T x={X0} y={26} s={12} f={C.crema} o={hdr}>doubling n: span × 2.0, work × 2.13</T>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
      <T x={X0 - 8} y={Y1 + 4} s={12} f={C.latte} a="end">8</T>
      <T x={X0 - 8} y={Y0 + 4} s={12} f={C.latte} a="end">0</T>
      <polyline points={shown.map((v, k) => `${px(k)},${py(v)}`).join(' ')} fill="none" stroke={C.caramel} strokeWidth={2.4} />
      {shown.map((v, k) => <circle key={k} cx={px(k)} cy={py(v)} r={3} fill={C.caramel} />)}
      <T x={X1} y={py(8) - 10} s={13} f={C.caramel} a="end" o={end}>8.0 at 65,536</T>
      <T x={X0} y={Y0 + 20} s={12} f={C.latte}>n = 2</T>
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">65,536</T>
      <T x={X0} y={272} s={12} f={C.crema}>parallelism = work / span, still climbing</T>
    </Svg>
  );
}

// 7–9 · The schedule plot for the 16-leaf tree: steps against workers 1 to 16 on a doubling axis.
const W15 = 15, S4 = 4;
const PS = [1, 2, 4, 8, 16];
const REAL = [15, 8, 5, 4, 4];
const BX = (p: number) => 90 + Math.log2(p) * 110;
const BY = (v: number) => 250 - v * 10.5;
const curve = (f: (p: number) => number, upto = 1) =>
  Array.from({ length: 41 }, (_, k) => 2 ** ((k / 40) * 4 * upto)).map((p) => `${BX(p)},${BY(f(p))}`).join(' ');
function Axes() {
  return (
    <g>
      <line x1={BX(1)} y1={BY(0)} x2={BX(16)} y2={BY(0)} stroke={C.line} />
      <line x1={BX(1)} y1={BY(0)} x2={BX(1)} y2={BY(20)} stroke={C.line} />
      {PS.map((p) => <T key={p} x={BX(p)} y={BY(0) + 18} s={12} f={C.latte} a="middle">{p}</T>)}
      <T x={BX(16)} y={BY(0) + 38} s={12} f={C.latte} a="end">workers</T>
      <T x={BX(1) - 10} y={BY(20) + 4} s={12} f={C.latte} a="end">steps</T>
      <T x={BX(1) - 10} y={BY(15) + 4} s={12} f={C.latte} a="end">15</T>
      <T x={BX(1) - 10} y={BY(4) + 4} s={12} f={C.latte} a="end">4</T>
    </g>
  );
}
function Floors({ a, b, labels = true }: { a: number; b: number; labels?: boolean }) {
  const floor = Array.from({ length: 41 }, (_, k) => 2 ** ((k / 40) * 4)).map((p) => `${BX(p)},${BY(Math.max(W15 / p, S4))}`);
  return (
    <g>
      <polygon points={[...floor, `${BX(16)},${BY(0)}`, `${BX(1)},${BY(0)}`].join(' ')} fill={C.cherry} opacity={0.25 * b} />
      <polyline points={curve((p) => W15 / p, a)} fill="none" stroke={C.crema} strokeWidth={1.8} />
      <line x1={BX(1)} y1={BY(S4)} x2={BX(1) + (BX(16) - BX(1)) * b} y2={BY(S4)} stroke={C.cinnamon} strokeWidth={1.8} />
      <T x={BX(1.7) + 6} y={BY(W15 / 1.7) + 16} s={12} f={C.crema} o={labels && a >= 1 ? 1 : 0}>work / p</T>
      <T x={BX(1) + 8} y={BY(S4) + 18} s={12} f={C.cinnamon} o={b >= 1 ? 1 : 0}>span</T>
    </g>
  );
}

// 7 · TwoLaws. The two floors: work shared among p workers (a falling curve) and the span (a flat line). Everything
// under the higher of the two is shaded: no schedule reaches it.
export function TwoLaws({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 1.6));
  const b = easeInOut(seg(t, 1.8, 2.8));
  const cap = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="Steps against workers from one to sixteen. Two floors: the work shared among the workers, a falling curve, and the span, a flat line at four. Everything under the higher of the two is shaded: no schedule reaches it" h={290}>
      <Axes />
      <Floors a={a} b={b} />
      <T x={BX(16)} y={BY(19)} s={12} f={C.cherryText} a="end" o={cap}>shaded: no schedule gets here</T>
    </Svg>
  );
}

// 8 · BrentBoundReveal. The greedy ceiling, work / p + span, draws above the floors; the band between is where every
// greedy schedule lands, within a factor of two of the best.
export function BrentBoundReveal({ t }: StepCtx) {
  const c = easeInOut(seg(t, 0.4, 2.0));
  const band = easeOut(seg(t, 2.2, 2.8));
  const cap = easeOut(seg(t, 3.2, 3.8));
  const ceilPts = Array.from({ length: 41 }, (_, k) => 2 ** ((k / 40) * 4)).map((p) => `${BX(p)},${BY(W15 / p + S4)}`);
  const floorPts = Array.from({ length: 41 }, (_, k) => 2 ** (4 - (k / 40) * 4)).map((p) => `${BX(p)},${BY(Math.max(W15 / p, S4))}`);
  return (
    <Svg label="The greedy ceiling, work over workers plus span, draws above the two floors. The band between them is where every greedy schedule lands, never more than twice the best possible" h={290}>
      <Axes />
      <Floors a={1} b={1} />
      <polygon points={[...ceilPts, ...floorPts].join(' ')} fill={C.caramel} opacity={0.18 * band} />
      <polyline points={curve((p) => W15 / p + S4, c)} fill="none" stroke={C.caramel} strokeWidth={2.4} />
      <T x={BX(2) + 10} y={BY(W15 / 2 + S4) - 8} s={12} f={C.caramel} o={c >= 1 ? 1 : 0}>work / p + span</T>
      <T x={BX(16)} y={BY(19)} s={12} f={C.caramel} a="end" o={cap}>greedy: within 2× of best</T>
    </Svg>
  );
}

// 9 · BrentBoundMeasured. The greedy schedule's real step counts drop in one worker count at a time: 15, 8, 5, 4, 4,
// every one inside the band; past eight workers the count sits on the span and stops falling.
export function BrentBoundMeasured({ t }: StepCtx) {
  const ceilPts = Array.from({ length: 41 }, (_, k) => 2 ** ((k / 40) * 4)).map((p) => `${BX(p)},${BY(W15 / p + S4)}`);
  const floorPts = Array.from({ length: 41 }, (_, k) => 2 ** (4 - (k / 40) * 4)).map((p) => `${BX(p)},${BY(Math.max(W15 / p, S4))}`);
  const k = stepIdx(t, 0.3, 3.0, 5);
  const flat = easeOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="The greedy schedule's real step counts drop in, one worker count at a time: fifteen, eight, five, four, four, each inside the band. Past eight workers the count sits on the span and stops falling" h={290}>
      <Axes />
      <Floors a={1} b={1} labels={false} />
      <polygon points={[...ceilPts, ...floorPts].join(' ')} fill={C.caramel} opacity={0.18} />
      <polyline points={ceilPts.join(' ')} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={0.6} />
      {PS.map((p, i) => (
        <g key={p} opacity={i <= k ? 1 : 0}>
          <circle cx={BX(p)} cy={BY(REAL[i])} r={6} fill={C.caramel} />
          <T x={BX(p) + (i === 0 ? 12 : 0)} y={BY(REAL[i]) - 12} s={13} f={C.caramel} a={i === 0 ? 'start' : 'middle'}>{REAL[i]}</T>
        </g>
      ))}
      <T x={BX(16)} y={BY(19)} s={12} f={C.latte} a="end" o={flat}>past the span, more workers buy nothing</T>
    </Svg>
  );
}

// Deques for the stealing scenes: each worker's column of tasks, oldest (largest remaining subtree) on top.
function Deque({ x, y, sizes, col, label }: { x: number; y: number; sizes: number[]; col: string; label: string }) {
  return (
    <g>
      <rect x={x - 44} y={y} width={88} height={130} rx={4} fill="none" stroke={C.mocha} />
      {sizes.map((w, i) => <rect key={i} x={x - w / 2} y={y + 8 + i * 24} width={w} height={18} rx={2} fill={col} opacity={0.85} />)}
      <T x={x} y={y + 152} s={12} f={C.latte} a="middle">{label}</T>
    </g>
  );
}

// 10 · PredictIdleWorker. Four workers, each with its own deque; worker 3's is empty. After answering, it picks a
// victim at random and takes the oldest task off the top of that victim's deque.
export function PredictIdleWorker({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const mv = answered ? easeInOut(seg(s, 0.5, 1.6)) : 0;
  const pick = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const X = [80, 220, 360, 500];
  const decks = [[72, 52, 36], [64, 44], [], [72, 56, 40, 28]];
  return (
    <Svg label="Four workers, each with its own deque of ready tasks; worker three's is empty. After answering, it picks another worker at random and takes the oldest task off the top of that worker's deque" h={250}>
      <g opacity={a}>
        {X.map((x, w) => (
          <Deque key={w} x={x} y={40} sizes={w === 0 && mv > 0 ? decks[w].slice(1) : decks[w]} col={w === 2 ? C.caramel : C.latte} label={`worker ${w + 1}`} />
        ))}
        {decks[2].length === 0 && <T x={X[2]} y={110} s={16} f={C.taupe} a="middle" o={1 - pick}>?</T>}
      </g>
      {answered && (
        <g>
          <path d={`M${X[2]} 34 Q${(X[0] + X[2]) / 2} -6 ${X[0]} 34`} fill="none" stroke={C.caramel} strokeDasharray="5 4" strokeWidth={1.6} opacity={pick} />
          <rect x={lerp(X[0] - 36, X[2] - 36, mv)} y={48 - Math.sin(Math.PI * mv) * 30} width={72} height={18} rx={2} fill={C.caramel} opacity={mv > 0 ? 1 : 0} />
          <T x={X[1]} y={238} s={12} f={C.caramel} a="middle" o={mv}>a random victim; the oldest task</T>
        </g>
      )}
    </Svg>
  );
}

// 11 · WorkStealingReveal. Worker 1 runs depth-first off the bottom of its own deque: pop the newest task, push its
// two halves. Worker 2, idle, steals from the top of worker 1's deque: the oldest task, with the most work beneath.
export function WorkStealingReveal({ t }: StepCtx) {
  const x1 = 170, x2 = 430;
  const own = stepIdx(t, 0.3, 2.3, 2);
  const steal = easeInOut(seg(t, 2.6, 3.6));
  const lab = easeOut(seg(t, 3.7, 4.2));
  const stacks = [
    [80, 60, 44],
    [80, 60, 32, 32],
    [80, 60, 32, 20, 20],
  ];
  const cur = stacks[own + 1];
  const shown = steal > 0 ? cur.slice(1) : cur;
  return (
    <Svg label="Worker one runs depth-first off the bottom of its own deque: pop the newest task, push its two halves. Worker two, idle, steals from the top of worker one's deque: the oldest task, with the most work still beneath it" h={290}>
      <rect x={x1 - 50} y={40} width={100} height={150} rx={4} fill="none" stroke={C.mocha} />
      {shown.map((w, i) => <rect key={`${own}-${i}`} x={x1 - w / 2} y={48 + i * 26} width={w} height={20} rx={2} fill={C.latte} opacity={0.85} />)}
      <rect x={x2 - 50} y={40} width={100} height={150} rx={4} fill="none" stroke={C.mocha} />
      {steal > 0 && <rect x={lerp(x1 - 40, x2 - 40, steal)} y={lerp(48, 164, steal) - Math.sin(Math.PI * steal) * 40} width={80} height={20} rx={2} fill={C.caramel} />}
      <T x={x1} y={212} s={12} f={C.latte} a="middle">worker 1</T>
      <T x={x2} y={212} s={12} f={C.latte} a="middle">worker 2</T>
      <path d={`M${x1 + 60} ${56 + (shown.length - 1) * 26} l10 -5 l0 10 Z`} fill={C.crema} opacity={own >= 0 ? 1 : 0} />
      <T x={x1 + 74} y={60 + (shown.length - 1) * 26} s={12} f={C.crema} o={own >= 0 ? 1 : 0}>owner: newest</T>
      <T x={300} y={252} s={12} f={C.caramel} a="middle" o={lab}>thief: the top, oldest, most work beneath</T>
      <T x={300} y={276} s={12} f={C.latte} a="middle" o={lab}>owner: the bottom, depth-first</T>
    </Svg>
  );
}

// 12 · WorkStealingBound. A fork-and-join tree where each task's result returns straight to its parent (dashed return
// arrows, the fully strict shape); then the bound: expected time work / p plus a constant times the span.
export function WorkStealingBound({ t }: StepCtx) {
  const fork = easeOut(seg(t, 0.3, 1.3));
  const ret = easeOut(seg(t, 1.5, 2.5));
  const eq = easeOut(seg(t, 2.8, 3.4));
  const nodes = [
    { x: 300, y: 40 },
    { x: 180, y: 100 }, { x: 420, y: 100 },
    { x: 120, y: 160 }, { x: 240, y: 160 }, { x: 360, y: 160 }, { x: 480, y: 160 },
  ];
  const parent = [-1, 0, 0, 1, 1, 2, 2];
  return (
    <Svg label="A fork-and-join tree where each task's result returns straight to the task that spawned it: the fully strict shape. Then the bound: the expected time is the work over the workers, plus a constant times the span" h={290}>
      {nodes.map((n, i) => {
        if (i === 0) return null;
        const p = nodes[parent[i]];
        return (
          <g key={i}>
            <line x1={p.x} y1={p.y} x2={lerp(p.x, n.x, fork)} y2={lerp(p.y, n.y, fork)} stroke={C.latte} strokeWidth={1.4} />
            <path d={`M${n.x + 10} ${n.y - 6} Q${(n.x + p.x) / 2 + 22} ${(n.y + p.y) / 2 + 4} ${p.x + (n.x > p.x ? 12 : -12) * 0 + 8} ${p.y + 8}`} fill="none" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="4 3" opacity={ret} />
          </g>
        );
      })}
      {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={9} fill={i === 0 ? C.caramel : C.crema} opacity={i === 0 ? 1 : fork} />)}
      <T x={560} y={210} s={12} f={C.caramel} a="end" o={ret}>each result returns to its parent</T>
      <T x={300} y={250} s={15} f={C.crema} a="middle" o={eq}>E[T] = work / p + O(span)</T>
      <T x={300} y={276} s={12} f={C.latte} a="middle" o={eq}>no coordinator anywhere</T>
    </Svg>
  );
}

// 13 · StealsSimulated. The 16,383-addition tree run through the stealing simulation at 1, 2, 4, 8 and 16 workers:
// each row's full bar is the work, its caramel part the share that was stolen (seeded, shape only): zero for one
// worker, rising with more, staying a small slice.
const STEAL_SHARE = [0, 0.073, 0.119, 0.138, 0.15]; // examples.py's seeded run, drawn as shape only
export function StealsSimulated({ t }: StepCtx) {
  const X0 = 140, W = 420;
  return (
    <Svg label="The tree of 16,383 additions run through the stealing simulation at one, two, four, eight and sixteen workers. Each full bar is the work; its bright part is the share that changed hands through a steal: zero for one worker, rising with more, and staying a small slice" h={290}>
      <T x={X0} y={30} s={12} f={C.latte}>each bar: all 16,383 additions</T>
      {PS.map((p, i) => {
        const g = easeOut(seg(t, 0.4 + i * 0.5, 0.9 + i * 0.5));
        const y = 50 + i * 40;
        return (
          <g key={p} opacity={g > 0 ? 1 : 0.3}>
            <T x={X0 - 12} y={y + 15} s={12} f={C.latte} a="end">{p === 1 ? '1 worker' : `${p} workers`}</T>
            <rect x={X0} y={y} width={W} height={20} fill="none" stroke={C.mocha} />
            <rect x={X0} y={y} width={W * STEAL_SHARE[i] * g} height={20} fill={C.caramel} />
            {p === 1 && <T x={X0 + 8} y={y + 15} s={12} f={C.latte} o={g}>0 steals</T>}
          </g>
        );
      })}
      <T x={X0} y={268} s={12} f={C.caramel} o={easeOut(seg(t, 3.0, 3.5))}>stolen share: rising, still small</T>
    </Svg>
  );
}

// 14 · RealSystems. Three rows, each with a small deque and a steal: Cilk, built around this scheduler; Rayon's join,
// the same protocol, with its warning that blocking one half on the other can deadlock; Tokio, stealing too, for
// tasks that wait on the network (cinnamon: a different point on the design).
export function RealSystems({ t }: StepCtx) {
  const rows = [
    { name: 'Cilk', note: 'built around this scheduler', col: C.caramel },
    { name: 'Rayon join', note: 'same protocol', col: C.caramel },
    { name: 'Tokio', note: 'steals too, for tasks waiting on I/O', col: C.cinnamon },
  ];
  return (
    <Svg label="Three rows, each with a small deque and a steal. Cilk, built around this scheduler. Rayon's join, the same protocol, warning that blocking one half on the other inside it can deadlock. Tokio, stealing from per-worker queues too, but for tasks that wait on the network" h={290}>
      {rows.map((r, i) => {
        const y = 30 + i * 84;
        const a = easeOut(seg(t, 0.3 + i * 1.4, 0.8 + i * 1.4));
        const st = easeInOut(seg(t, 0.8 + i * 1.4, 1.5 + i * 1.4));
        return (
          <g key={r.name} opacity={a}>
            {[0, 1, 2].map((k) => <rect key={k} x={30} y={y + k * 14} width={36 - k * 8} height={10} rx={1} fill={r.col} opacity={k === 0 && st > 0 ? 0.2 : 0.8} />)}
            <rect x={lerp(30, 90, st)} y={y - Math.sin(Math.PI * st) * 10} width={36} height={10} rx={1} fill={r.col} opacity={st > 0 ? 1 : 0} />
            <rect x={86} y={y - 4} width={44} height={46} rx={3} fill="none" stroke={C.mocha} />
            <T x={150} y={y + 12} s={14} f={r.col}>{r.name}</T>
            <T x={150} y={y + 34} s={12} f={C.latte}>{r.note}</T>
          </g>
        );
      })}
      <T x={150} y={30 + 84 + 54} s={12} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.9))}>blocking one half on the other: deadlock</T>
    </Svg>
  );
}

// 15 · WhatWasNotBuilt. One deque holding a single last task: the owner reaches from the bottom and a thief from the
// top, both arriving at once; the task flashes red. A dashed box closes over it: named, not built here.
export function WhatWasNotBuilt({ t }: StepCtx) {
  const reach = easeInOut(seg(t, 0.3, 1.6));
  const clash = easeOut(seg(t, 1.6, 2.0));
  const box = easeOut(seg(t, 2.4, 3.0));
  const x = 300, y = 120;
  return (
    <Svg label="One deque holding a single last task. The owner reaches for it from the bottom and a thief from the top, arriving together, and the task flashes red. Then a dashed box closes over it: a known race, named, not built here" h={280}>
      <rect x={x - 50} y={60} width={100} height={110} rx={4} fill="none" stroke={C.mocha} />
      <rect x={x - 36} y={y - 10} width={72} height={20} rx={2} fill={clash > 0 ? C.cherry : C.latte} stroke={clash > 0 ? C.cherryText : 'none'} strokeWidth={1.6} />
      <line x1={x - 160} y1={y + 40} x2={lerp(x - 160, x - 40, reach)} y2={lerp(y + 40, y + 6, reach)} stroke={C.crema} strokeWidth={2} />
      <line x1={x + 160} y1={y - 40} x2={lerp(x + 160, x + 40, reach)} y2={lerp(y - 40, y - 6, reach)} stroke={C.caramel} strokeWidth={2} />
      <T x={x - 160} y={y + 60} s={12} f={C.crema} a="middle">owner</T>
      <T x={x + 160} y={y - 50} s={12} f={C.caramel} a="middle">thief</T>
      <rect x={x - 200} y={36} width={400} height={180} rx={6} fill="none" stroke={C.latte} strokeDasharray="6 5" opacity={box} />
      <T x={x} y={244} s={13} f={C.latte} a="middle" o={box}>a known race: named, not built here</T>
    </Svg>
  );
}

// 16 · Recap. The sum tree beside four deques, one machine's cores; then a second machine appears across a link
// (cinnamon): the next question, once memory is no longer shared.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  const b = easeOut(seg(t, 2.0, 2.7));
  return (
    <Svg label="One machine: the sum tree beside four deques, its cores. Then a second machine across a network link: the next question, once memory is no longer shared" h={260}>
      <g opacity={a}>
        <rect x={30} y={30} width={250} height={160} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        {[0, 1, 2, 3].map((w) => [0, 1, 2].map((k) => <rect key={`${w}-${k}`} x={50 + w * 56} y={110 + k * 22} width={40 - k * 8} height={14} rx={1} fill={C.latte} opacity={0.8} />))}
        <circle cx={155} cy={52} r={6} fill={C.caramel} />
        {[0, 1].map((k) => <line key={k} x1={155} y1={52} x2={115 + k * 80} y2={84} stroke={C.latte} />)}
        {[0, 1].map((k) => <circle key={k} cx={115 + k * 80} cy={84} r={5} fill={C.crema} />)}
        <T x={30} y={214} s={12} f={C.caramel}>work, span, stealing: one machine</T>
      </g>
      <g opacity={b}>
        <line x1={280} y1={110} x2={330} y2={110} stroke={C.cinnamon} strokeWidth={1.6} strokeDasharray="5 4" />
        <rect x={330} y={30} width={240} height={160} rx={6} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
        <T x={450} y={116} s={13} f={C.cinnamon} a="middle">another machine</T>
        <T x={330} y={240} s={12} f={C.cinnamon}>next: memory not shared</T>
      </g>
    </Svg>
  );
}
