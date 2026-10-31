import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeInOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's shared language): crema = an element or stored
// entry; latte = secondary labels; taupe = not yet touched; caramel = the thing to look at (the
// find path, the node being linked in); cinnamon = the alternative being compared; cherry (with
// cherryText) = the bad outcome. At most two accents per step.

function node(x: number, y: number, colour = C.crema, opacity = 1, r = 9) {
  return <circle key={`${x}-${y}-n`} cx={x} cy={y} r={r} fill="none" stroke={colour} strokeWidth={1.6} opacity={opacity} />;
}
function cell(x: number, y: number, w: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}-c`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}
function link(x1: number, y1: number, x2: number, y2: number, colour = C.crema, opacity = 1) {
  return <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1.6} opacity={opacity} />;
}

// 1 · Ten million matches, one chain
export function Hook({ t }: StepCtx) {
  const n = Math.min(6, Math.floor(seg(t, 0.2, 2.2) * 6) + 1);
  return (
    <Svg label="Six records chained one under the next, each pointing up at the one before it, drawn growing downward as the hook's worst case" h={340}>
      <T x={30} y={26} s={13} f={C.latte}>ten million "same entity?" pairs arrive</T>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          {node(90, 60 + i * 42, i === n - 1 ? C.caramel : C.crema)}
          <T x={115} y={64 + i * 42} s={12} f={C.latte}>record {i + 1}</T>
          {i > 0 && link(90, 69 + (i - 1) * 42, 90, 51 + i * 42, C.crema)}
        </g>
      ))}
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 1.8, 2.6))}>
        one chain, n records deep
      </T>
      <T x={30} y={322} s={13} f={C.latte} o={easeOut(seg(t, 1.8, 2.6))}>
        every lookup walks the whole thing
      </T>
    </Svg>
  );
}

// 2 · Three operations, one forest
export function Forest({ t }: StepCtx) {
  const aLabel = easeOut(seg(t, 0.1, 0.8));
  const aArray = easeOut(seg(t, 0.5, 1.4));
  const aForest = easeOut(seg(t, 1.2, 2.2));
  const idx = ['0', '1', '2', '3', '4', '5'];
  const parent = ['0', '0', '0', '3', '3', '0']; // two small trees: {0,1,2} and {3,4,5}, root 0 and 3
  return (
    <Svg label="The parent array as a row of indexed cells holding each element's parent, with the two small trees it makes drawn below" h={360}>
      <T x={30} y={24} s={13} f={C.latte} o={aLabel}>
        MakeSet &middot; Find &middot; Union
      </T>
      {idx.map((v, i) => (
        <g key={i} opacity={aArray}>
          {cell(30 + i * 50, 42, 40, 40, C.crema)}
          <T x={50 + i * 50} y={36} s={11} a="middle" f={C.taupe}>
            {v}
          </T>
          <T x={50 + i * 50} y={66} s={13} a="middle" f={C.crema}>
            {parent[i]}
          </T>
        </g>
      ))}
      <g opacity={aForest}>
        <T x={30} y={130} s={13} f={C.latte}>
          two roots, each pointing at itself
        </T>
        {[0, 3].map((root) => (
          <g key={root}>
            {node(80 + root * 35, 170, C.caramel)}
            <T x={80 + root * 35} y={174} s={11} a="middle" f={C.ink}>
              {root}
            </T>
          </g>
        ))}
        {[1, 2].map((i) => (
          <g key={i}>
            {node(80 + i * 35, 230)}
            <T x={80 + i * 35} y={234} s={11} a="middle" f={C.ink}>
              {i}
            </T>
            {link(80 + i * 35, 221, 80, 179, C.crema)}
          </g>
        ))}
        {[4, 5].map((i) => (
          <g key={i}>
            {node(80 + i * 35, 230)}
            <T x={80 + i * 35} y={234} s={11} a="middle" f={C.ink}>
              {i}
            </T>
            {link(80 + i * 35, 221, 185, 179, C.crema)}
          </g>
        ))}
        <T x={30} y={300} s={13} f={C.latte}>
          Find walks up to a root; Union points one root at the other
        </T>
      </g>
    </Svg>
  );
}

// 3 · How deep does the chain get? (predict)
export function AdversarialChain({ t }: StepCtx) {
  const n = Math.min(8, Math.floor(seg(t, 0.2, 1.8) * 8) + 1); // drawn compressed: 8 stand for sixteen
  return (
    <Svg label="A chain of elements growing one under the next under the worst merge order, with the deepest node's Find path about to walk every one of them" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>
        sixteen elements, merged worst-case
      </T>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          {node(300, 50 + i * 32, i === n - 1 ? C.caramel : C.crema)}
          {i > 0 && link(300, 59 + (i - 1) * 32, 300, 41 + i * 32, i === n - 1 ? C.caramel : C.crema)}
        </g>
      ))}
      <T x={320} y={50 + (n - 1) * 32 + 5} s={12} f={C.caramel} o={easeOut(seg(t, 1.6, 2.2))}>
        Find here walks every node above it
      </T>
      <T x={30} y={300} s={13} f={C.latte}>
        depth fifteen, on the real sixteen
      </T>
    </Svg>
  );
}

// 4 · Union by rank bounds the height
export function RankBound({ t }: StepCtx) {
  // A doubling merge: four rounds, the same shape examples.py's doubling_pairs produces.
  const round = Math.min(4, Math.floor(seg(t, 0.2, 2.4) * 4) + 1);
  const rows = [
    { y: 280, n: 8, label: 'rank 0: eight singles' },
    { y: 220, n: 4, label: 'rank 1: four pairs' },
    { y: 160, n: 2, label: 'rank 2: two quads' },
    { y: 100, n: 1, label: 'rank 3: one tree' },
  ];
  return (
    <Svg label="Four rounds of merging equal-rank trees, the rank rising by one each round, the tree's height never exceeding log base two of the element count" h={340}>
      {rows.slice(0, round).map((row, ri) => (
        <g key={ri} opacity={easeOut(seg(t, 0.2 + ri * 0.5, 0.6 + ri * 0.5))}>
          {Array.from({ length: row.n }, (_, i) => {
            const spacing = 480 / row.n;
            const x = 60 + spacing * i + spacing / 2;
            return node(x, row.y, ri === round - 1 ? C.caramel : C.crema, 1, 7);
          })}
          <T x={30} y={row.y + 4} s={11} f={C.latte}>
            {row.label}
          </T>
        </g>
      ))}
      <T x={30} y={320} s={13} f={C.caramel} o={easeOut(seg(t, 2.0, 2.6))}>
        height tight to log base two of sixteen: four rounds, no more
      </T>
    </Svg>
  );
}

// 5 · Path compression collapses it
export function Compression({ t }: StepCtx) {
  const before = Math.min(8, Math.floor(seg(t, 0.1, 0.8) * 8) + 1);
  const sweep = seg(t, 1.0, 2.0);
  const after = easeInOut(sweep);
  return (
    <Svg label="The same chain before compression, each node pointing to the next, and after one Find, every node swinging straight to the root" h={340}>
      <T x={30} y={22} s={13} f={C.latte}>
        before: the chain from the predict
      </T>
      {Array.from({ length: before }, (_, i) => (
        <g key={i} opacity={1 - after}>
          {node(90, 50 + i * 30, C.crema)}
          {i > 0 && link(90, 59 + (i - 1) * 30, 90, 41 + i * 30, C.crema)}
        </g>
      ))}
      <T x={120} y={50 + 7 * 30} s={12} f={C.crema} o={1 - after}>
        root
      </T>
      <g opacity={after}>
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            {node(90 + (i % 4) * 90, 170 + Math.floor(i / 4) * 60, i === 7 ? C.caramel : C.crema)}
            {i < 7 && link(90 + (i % 4) * 90, 170 + Math.floor(i / 4) * 60, 90 + 7 * 90 - 7 * 90, 170 + 60, C.caramel, 0.4)}
          </g>
        ))}
        <T x={30} y={310} s={13} f={C.caramel}>
          every node swings straight to the root, in one pass
        </T>
      </g>
    </Svg>
  );
}

// 6 · What does typical cost look like? (predict)
export function TypicalCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Three bars: a tall one for the naive rule's parent-pointer reads per operation, and two short ones for rank alone and rank with compression, measured on the same long random workload" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>
        parent-pointer reads per operation, same workload
      </T>
      <T x={30} y={60} s={12} f={C.crema}>naive</T>
      <Bar x={120} y={50} w={a * 420} h={22} full={420} fill={C.cherry} />
      <T x={30} y={110} s={12} f={C.crema}>rank only</T>
      <Bar x={120} y={100} w={a * 10} h={22} full={420} fill={C.crema} />
      <T x={30} y={160} s={12} f={C.crema}>rank + compression</T>
      <Bar x={120} y={150} w={a * 7} h={22} full={420} fill={C.caramel} />
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 1.2, 1.8))}>
        a handful of reads, not a scan of the structure
      </T>
    </Svg>
  );
}

// 7 · The O(alpha(n)) amortized bound
export function AlphaBound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const curvePts: [number, number][] = Array.from({ length: 40 }, (_, i) => {
    const x = 60 + i * 12;
    const n = Math.pow(2, i / 2);
    const alpha = Math.min(4.6, 0.7 * Math.log(Math.max(2, Math.log(Math.max(2, Math.log(n + 2))))) + 1.2);
    return [x, 260 - alpha * 30];
  });
  const path = curvePts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  return (
    <Svg label="A curve of alpha(n) against n climbing from one toward four as n grows astronomically, staying under five for any n a machine could ever hold, next to the amortized versus worst-case statement" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>
        α(n), as n climbs toward anything a machine could hold
      </T>
      <line x1={60} y1={260} x2={540} y2={260} stroke={C.line} strokeWidth={1.2} />
      <line x1={60} y1={100} x2={60} y2={260} stroke={C.line} strokeWidth={1.2} />
      <path d={path} stroke={C.caramel} strokeWidth={2} fill="none" opacity={a} />
      <line x1={60} y1={110} x2={540} y2={110} stroke={C.cinnamon} strokeDasharray="4 4" strokeWidth={1.2} opacity={a} />
      <T x={545} y={114} s={12} f={C.cinnamon}>under five</T>
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 1.0, 1.6))}>
        amortized over many calls — one call can still cost Θ(log n)
      </T>
    </Svg>
  );
}

// 8 · Same structure, three uses
export function ThreeUses({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.1, 0.9));
  const a2 = easeOut(seg(t, 0.9, 1.7));
  const a3 = easeOut(seg(t, 1.7, 2.5));
  return (
    <Svg label="Three panels fed by the same union-find calls: Kruskal's cycle test, incremental connected components, and entity-resolution clustering, the last one marked with its one limit" h={360}>
      <g opacity={a1}>
        <T x={30} y={30} s={13} f={C.caramel}>Kruskal's cycle test</T>
        <T x={30} y={52} s={12} f={C.latte}>sorted edges: accept only across different sets</T>
        <T x={30} y={72} s={12} f={C.crema}>five accepted, five already-together</T>
      </g>
      <g opacity={a2}>
        <T x={30} y={120} s={13} f={C.caramel}>incremental connected components</T>
        <T x={30} y={142} s={12} f={C.latte}>same calls, read as "which component is this vertex in"</T>
      </g>
      <g opacity={a3}>
        <T x={30} y={210} s={13} f={C.caramel}>entity-resolution clustering</T>
        <T x={30} y={232} s={12} f={C.latte}>a match decision becomes a Union call</T>
        <T x={30} y={254} s={12} f={C.cherryText}>one limit: no Split &mdash; a wrong merge cannot be undone</T>
      </g>
      <T x={30} y={310} s={13} f={C.latte} o={a3}>
        the cheapest common building block, not the whole algorithm
      </T>
    </Svg>
  );
}

// 9 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const lines = ['MakeSet, Find, Union', 'rank: height ≤ log₂ n', 'compression: pays forward', 'α(n): amortized, under five', 'no Split: the one limit'];
  return (
    <Svg label="Five lines recapping the topic: the three operations, the rank bound, compression, the amortized number, and the one structural limit" h={340}>
      {lines.map((l, i) => (
        <T key={i} x={40} y={70 + i * 44} s={15} f={i === lines.length - 1 ? C.cherryText : C.crema} o={easeOut(seg(t, 0.15 * i, 0.15 * i + 0.6))}>
          {l}
        </T>
      ))}
      <T x={40} y={70 + lines.length * 44 + 10} s={13} f={C.latte} o={a}>
        one invariant, one trick, one number
      </T>
    </Svg>
  );
}

// 10 · Prove it (predict)
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  return (
    <Svg label="Two records already merged into one cluster, with an attempted Split operation crossed out in red: no such operation exists on this structure" h={320}>
      <T x={30} y={30} s={13} f={C.latte}>
        two records, merged on a decision that turns out wrong
      </T>
      {node(150, 100, C.crema)}
      {node(230, 100, C.crema)}
      {link(159, 100, 221, 100, C.crema)}
      <T x={120} y={130} s={12} f={C.crema}>record A</T>
      <T x={210} y={130} s={12} f={C.crema}>record B</T>
      <g opacity={a}>
        <line x1={150} y1={180} x2={230} y2={180} stroke={C.cherry} strokeWidth={2.2} />
        <line x1={160} y1={165} x2={220} y2={195} stroke={C.cherryText} strokeWidth={2.2} />
        <line x1={220} y1={165} x2={160} y2={195} stroke={C.cherryText} strokeWidth={2.2} />
        <T x={150} y={220} s={13} f={C.cherryText}>no Split exists on this structure</T>
      </g>
      <T x={30} y={270} s={13} f={C.latte} o={a}>
        the fix: rebuild from the corrected pairs
      </T>
    </Svg>
  );
}
