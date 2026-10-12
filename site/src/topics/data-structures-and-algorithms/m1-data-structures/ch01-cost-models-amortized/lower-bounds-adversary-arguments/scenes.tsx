import { useEffect, useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, MONO, Svg, T } from '../../../../../reels/kit';

// Every number shown here is computed or asserted by examples.py. Trees are drawn top-down; the per-level budget sits in caramel at the
// right margin (x = 540, end-anchored), one column, read straight down. Colour grammar of the chapter: caramel = what is counted and the
// bound that holds, cinnamon = the comparison model (large text and shapes only), cherry fills with cherryText labels = the bad outcome.

/** Seconds since the learner answered a predict step (the player's clock is already finished by then), so reveals can animate. */
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

const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));

/** Text with a line through it (a refuted promise stays readable). */
const Struck = ({ x, y, s = 13, f = C.taupe, o = 0.6, children }: { x: number; y: number; s?: number; f?: string; o?: number; children: ReactNode }) => (
  <text x={x} y={y} fontSize={s} style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))`, textDecoration: 'line-through' }} fill={f} opacity={o} fontFamily={MONO} fontWeight={500} letterSpacing="0.03em">
    {children}
  </text>
);

const Cell = ({ x, y, w = 38, h = 28, label, o = 1, stroke = C.mocha, fill = C.roast, f = C.crema, s = 13 }: { x: number; y: number; w?: number; h?: number; label: ReactNode; o?: number; stroke?: string; fill?: string; f?: string; s?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={5} fill={fill} stroke={stroke} />
    <T x={x + w / 2} y={y + h / 2 + 4.5} s={s} f={f} a="middle">
      {label}
    </T>
  </g>
);

/** The vector as the chapter draws it: a row of cells (the last one "…"). */
const VectorRow = ({ t, y = 18 }: { t: number; y?: number }) => (
  <>
    {Array.from({ length: 12 }, (_, i) => {
      const a = easeOut(seg(t, i * 0.05, 0.3 + i * 0.05));
      return (
        <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * -10})`}>
          <rect x={30 + i * 42} y={y} width={38} height={30} rx={5} fill={C.roast} stroke={C.mocha} />
          <T x={30 + i * 42 + 19} y={y + 20} s={13} f={C.crema} a="middle">
            {i < 11 ? i : '…'}
          </T>
        </g>
      );
    })}
  </>
);

// 1 · The problem: a vector of a million keys and three promises about every input.
const CLAIMS: [string, string][] = [
  ['sort any input', '≤ 15,000,000 comparisons'],
  ['min and max', '≤ 1,200,000 comparisons'],
  ['all distinct?', '≤ 5,000,000 comparisons'],
];

export function Opening({ t }: StepCtx) {
  return (
    <Svg label="A vector of a million 64-bit keys and three promises that hold for every input, using only comparisons: sort any input in at most 15,000,000 comparisons, find the minimum and maximum in at most 1,200,000, decide whether all keys are distinct in at most 5,000,000; each has a question mark" h={380}>
      <VectorRow t={t} />
      <T x={30} y={72} s={13} f={C.taupe}>
        n = 1,000,000 keys · 64-bit
      </T>
      <line x1={16} y1={52} x2={16} y2={96 + 2 * 92 + 38} stroke={C.mocha} strokeWidth={2} opacity={fade(t, 0.8, 2.2)} />
      {CLAIMS.map(([name, promise], i) => {
        const a = fade(t, 0.9 + i * 0.6, 1.4 + i * 0.6);
        const q = easeOutBack(seg(t, 2.6 + i * 0.1, 2.9 + i * 0.1));
        const y = 96 + i * 92;
        return (
          <g key={name}>
            <g opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
              <line x1={16} y1={y + 38} x2={30} y2={y + 38} stroke={C.mocha} strokeWidth={2} />
              <rect x={30} y={y} width={515} height={76} rx={14} fill={C.roast} stroke={C.mocha} />
              <T x={48} y={y + 28} s={13} f={C.latte}>
                {name}
              </T>
              <T x={48} y={y + 58} s={15} f={C.crema} w={600}>
                {promise}
              </T>
            </g>
            <g opacity={q}>
              <T x={528} y={y + 52} s={26} f={C.caramel} a="end" serif w={700}>
                ?
              </T>
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Insertion sort on three keys, drawn as the tree of its comparisons.
type TNode = { id: string; x: number; y: number; label: string; leaf?: boolean; at: number };
const LEVEL_Y = [52, 132, 212, 292];
const NODES: TNode[] = [
  { id: 'r', x: 230, y: LEVEL_Y[0], label: 'a : b', at: 0.2 },
  { id: 'L1', x: 130, y: LEVEL_Y[1], label: 'b : c', at: 1.8 },
  { id: 'R1', x: 330, y: LEVEL_Y[1], label: 'a : c', at: 0.6 },
  { id: 'abc', x: 70, y: LEVEL_Y[2], label: 'a<b<c', leaf: true, at: 2.4 },
  { id: 'L2', x: 185, y: LEVEL_Y[2], label: 'a : c', at: 2.4 },
  { id: 'bac', x: 275, y: LEVEL_Y[2], label: 'b<a<c', leaf: true, at: 1.2 },
  { id: 'R2', x: 385, y: LEVEL_Y[2], label: 'b : c', at: 2.4 },
  { id: 'acb', x: 150, y: LEVEL_Y[3], label: 'a<c<b', leaf: true, at: 3.0 },
  { id: 'cab', x: 220, y: LEVEL_Y[3], label: 'c<a<b', leaf: true, at: 3.0 },
  { id: 'bca', x: 350, y: LEVEL_Y[3], label: 'b<c<a', leaf: true, at: 3.0 },
  { id: 'cba', x: 420, y: LEVEL_Y[3], label: 'c<b<a', leaf: true, at: 3.0 },
];
const EDGES: [string, string, '<' | '>'][] = [
  ['r', 'L1', '<'],
  ['r', 'R1', '>'],
  ['L1', 'abc', '<'],
  ['L1', 'L2', '>'],
  ['R1', 'bac', '<'],
  ['R1', 'R2', '>'],
  ['L2', 'acb', '<'],
  ['L2', 'cab', '>'],
  ['R2', 'bca', '<'],
  ['R2', 'cba', '>'],
];

export function SortTree({ t }: StepCtx) {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  const path = [byId.r, byId.R1, byId.bac]; // the input b < a < c: a : b is ">" and a : c is "<"
  // the dot's position along the path over 0.6 .. 1.6 s
  const k = seg(t, 0.6, 1.6) * 2;
  const i0 = Math.min(1, Math.floor(k));
  const f = k - i0;
  const dx = lerp(path[i0].x, path[i0 + 1].x, f);
  const dy = lerp(path[i0].y + 12, path[i0 + 1].y - 12, f);
  const lit = seg(t, 1.5, 1.7);
  return (
    <Svg label="The decision tree of insertion sort on three keys a, b, c: a comparison at every node, a sorted order at each of the six leaves, depths 2, 3, 3, 2, 3, 3; the right margin shows a level can hold at most 1, 2, 4, 8 leaves" h={380}>
      {EDGES.map(([from, to, lab]) => {
        const p = byId[from];
        const c = byId[to];
        const a = fade(t, c.at, c.at + 0.4);
        const y2 = c.y - (c.leaf ? 8 : 12);
        return (
          <g key={from + to} opacity={a}>
            <line x1={p.x} y1={p.y + 12} x2={c.x} y2={y2} stroke={C.mocha} strokeWidth={1.4} />
            <T x={(p.x + c.x) / 2 + (lab === '<' ? -10 : 10)} y={(p.y + 12 + y2) / 2 + 4} s={13} f={C.taupe} a="middle">
              {lab}
            </T>
          </g>
        );
      })}
      {NODES.map((n) => {
        const a = fade(t, n.at, n.at + 0.4);
        const hot = n.id === 'bac' ? lit : 0;
        return n.leaf ? (
          <g key={n.id} opacity={a}>
            <T x={n.x} y={n.y + 5} s={13} f={hot > 0.5 ? C.caramel : C.crema} w={hot > 0.5 ? 700 : 500} a="middle">
              {n.label}
            </T>
          </g>
        ) : (
          <g key={n.id} opacity={a}>
            <rect x={n.x - 31} y={n.y - 12} width={62} height={24} rx={6} fill={C.cocoa} stroke={C.mocha} />
            <T x={n.x} y={n.y + 5} s={13} f={C.crema} a="middle">
              {n.label}
            </T>
          </g>
        );
      })}
      <circle cx={dx} cy={dy} r={6} fill={C.caramel} opacity={seg(t, 0.55, 0.65) * (1 - seg(t, 1.7, 1.9))} />
      <T x={540} y={24} s={13} f={C.taupe} a="end" o={fade(t, 0.2, 0.5)}>
        can hold
      </T>
      {[
        ['1', 0.3],
        ['2', 1.8],
        ['4', 2.4],
        ['8', 3.0],
      ].map(([v, at], i) => (
        <T key={v as string} x={540} y={LEVEL_Y[i] + 5} s={15} f={C.caramel} a="end" w={600} o={fade(t, at as number, (at as number) + 0.3)}>
          {v as string}
        </T>
      ))}
      <T x={30} y={356} s={13} f={C.latte} o={fade(t, 3.6, 4.0)}>
        unit: one comparison · comparison model
      </T>
    </Svg>
  );
}

// 3 · Predict: can two comparisons sort three keys? Six order cards against two comparison slots.
const ORDERS = ['abc', 'acb', 'bac', 'bca', 'cab', 'cba'];
const ALIVE1 = [true, true, false, false, true, false]; // after a : b answered "a < b"
const ALIVE2 = [false, true, false, false, true, false]; // after b : c answered "b > c"
export function TwoLevels({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const dim1 = shown ? fade(s, 0, 0.3) : 0;
  const dim2 = shown ? fade(s, 0.3, 0.6) : 0;
  return (
    <Svg label={shown ? 'Six possible orders of three keys; after two comparisons the adversary keeps the larger half each time: 6, then 3, then 2 orders remain, so a third comparison is needed; two answers allow at most 4 leaves, fewer than 6' : 'Six possible orders of three keys and two empty comparison slots; the question is whether two comparisons can always finish'} h={250}>
      <T x={30} y={24} s={13} f={C.latte} o={fade(t, 0, 0.3)}>
        6 possible orders
      </T>
      {ORDERS.map((o, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const alive = 1 - Math.max(ALIVE1[i] ? 0 : dim1, ALIVE2[i] ? 0 : dim2);
        const a = fade(t, 0.1 + i * 0.07, 0.4 + i * 0.07);
        return (
          <g key={o} opacity={a * (0.3 + 0.7 * alive)}>
            <rect x={30 + col * 92} y={38 + row * 46} width={80} height={36} rx={7} fill={C.roast} stroke={shown && alive > 0.9 ? C.caramel : C.mocha} />
            <T x={70 + col * 92} y={61 + row * 46} s={15} f={C.crema} a="middle">
              {o}
            </T>
          </g>
        );
      })}
      {[0, 1].map((i) => {
        const text = ['a : b → a<b', 'b : c → b>c'][i];
        const on = shown && (i === 0 ? s > 0 : s > 0.3);
        return (
          <g key={i} opacity={fade(t, 0.5 + i * 0.2, 0.8 + i * 0.2)}>
            <rect x={330} y={38 + i * 46} width={215} height={36} rx={7} fill="none" stroke={on ? C.mocha : C.taupe} strokeDasharray={on ? undefined : '5 5'} />
            <T x={342} y={61 + i * 46} s={13} f={on ? C.crema : C.taupe}>
              {on ? text : `comparison ${i + 1}`}
            </T>
          </g>
        );
      })}
      {!shown && (
        <T x={540} y={150} s={15} f={C.taupe} a="end">
          → ?
        </T>
      )}
      {shown && (
        <g opacity={fade(s, 0.6, 0.9)}>
          <rect x={330} y={130} width={215} height={36} rx={7} fill="none" stroke={C.caramel} />
          <T x={342} y={153} s={13} f={C.caramel}>
            comparison 3
          </T>
        </g>
      )}
      {shown && (
        <>
          <T x={30} y={156} s={15} f={C.caramel} o={fade(s, 0.6, 0.9)}>
            after 2: 2 orders left
          </T>
          <T x={30} y={206} s={15} f={C.caramel} w={700} o={fade(s, 0.9, 1.2)}>
            2 answers → at most 4 leaves &lt; 6
          </T>
        </>
      )}
    </Svg>
  );
}

// 4 · The leaf budget: levels of a binary tree hold 1, 2, 4, … leaves; 5! = 120 needs level 7.
const CAP = ['1', '2', '4', '8', '16', '32', '64', '128'];
const LY = (k: number) => 36 + 36 * k;
export function LeafBudget({ t }: StepCtx) {
  const tree = [
    [265],
    [190, 340],
    [150, 230, 300, 380],
  ];
  return (
    <Svg label="Level k of a binary tree holds at most 2 to the k leaves: 1, 2, 4, 8, 16, 32, 64, 128; the 5! = 120 orders of five keys fit between 64 and 128, so the height is at least 7; the table gives 3 for 3 keys, 22 for 10 keys and 18,488,885 for a million" h={400}>
      {CAP.map((v, k) => {
        const at = 0.2 + 0.35 * k;
        const a = fade(t, at, at + 0.3);
        const dimmed = k === 6 ? 1 - 0.55 * fade(t, 3.2, 3.5) : 1;
        return (
          <g key={k} opacity={a}>
            <T x={22} y={LY(k) + 5} s={13} f={C.taupe}>
              level {k}
            </T>
            <line x1={110} y1={LY(k)} x2={420} y2={LY(k)} stroke={C.mocha} strokeWidth={1} />
            <T x={540} y={LY(k) + 5} s={15} f={k === 6 ? C.taupe : C.caramel} a="end" w={600} o={dimmed}>
              {v}
            </T>
          </g>
        );
      })}
      {tree.map((row, k) =>
        row.map((x, j) => (
          <g key={`${k}-${j}`} opacity={fade(t, 0.2 + 0.35 * k, 0.5 + 0.35 * k)}>
            {k > 0 && <line x1={tree[k - 1][j >> 1]} y1={LY(k - 1) + 5} x2={x} y2={LY(k) - 5} stroke={C.mocha} strokeWidth={1.2} />}
            <circle cx={x} cy={LY(k)} r={5} fill={C.roast} stroke={C.crema} />
          </g>
        )),
      )}
      {/* 5! = 120 sits between level 6 (64) and level 7 (128) */}
      <g opacity={fade(t, 2.9, 3.2)} transform={`translate(${(1 - fade(t, 2.9, 3.2)) * -40} 0)`}>
        <line x1={110} y1={LY(6) + 18} x2={420} y2={LY(6) + 18} stroke={C.crema} strokeDasharray="6 5" strokeWidth={1.5} />
        <T x={112} y={LY(6) + 14} s={15} f={C.crema}>
          5! = 120 orders
        </T>
      </g>
      <T x={540} y={LY(7) + 38} s={17} f={C.caramel} a="end" w={700} o={fade(t, 3.5, 3.8)}>
        height ≥ 7
      </T>
      <g opacity={fade(t, 3.9, 4.3)}>
        <T x={30} y={366} s={13} f={C.latte}>
          n = 3 → 3 · n = 10 → 22
        </T>
        <T x={30} y={390} s={15} f={C.crema} w={600}>
          n = 1,000,000 → 18,488,885
        </T>
      </g>
    </Svg>
  );
}

// 5 · The average order: moving the two deepest sibling leaves under the shallowest leaf can only lower the average.
type Shape = Shape[] | null; // null = a leaf
// Leaf depths 1, 2, 3, 4, 5, 5 (a caterpillar); then 2, 2, 2, 3, 4, 4 after hanging its two deepest leaves under the depth-1 leaf (their parent
// becomes a leaf at depth 4); then 2, 2, 3, 3, 3, 3 after the same move on the right-hand chain.
const TREE1: Shape = [null, [null, [null, [null, [null, null]]]]];
const TREE2: Shape = [[null, null], [null, [null, [null, null]]]];
const TREE3: Shape = [[null, null], [[null, null], [null, null]]];
type Laid = { x: number; y: number; depth: number; leaf: boolean; parent: number; id: number };
function layout(shape: Shape, cx: number): Laid[] {
  const out: Laid[] = [];
  let leafNo = 0;
  const leaves = (sh: Shape): number => (sh === null ? 1 : sh.reduce((n, c) => n + leaves(c), 0));
  const total = leaves(shape);
  const rec = (sh: Shape, depth: number, parent: number): number => {
    const id = out.length;
    if (sh === null) {
      out.push({ x: cx - ((total - 1) * 24) / 2 + 24 * leafNo++, y: 44 + 34 * depth, depth, leaf: true, parent, id });
      return out[id].x;
    }
    out.push({ x: 0, y: 44 + 34 * depth, depth, leaf: false, parent, id });
    const xs = sh.map((c) => rec(c, depth + 1, id));
    out[id].x = (xs[0] + xs[xs.length - 1]) / 2;
    return out[id].x;
  };
  rec(shape, 0, -1);
  return out;
}
const SUMS = [20, 17, 16];
const AVGS = ['3.33', '2.83', '2.67'];
const FLOOR_BAR = 2.585 * 30; // log2 6 = 2.585 on the bar scale

export function AverageDepth({ t }: StepCtx) {
  const cxs = [85, 285, 480];
  const shapes: Shape[] = [TREE1, TREE2, TREE3];
  const laid = shapes.map((sh, i) => layout(sh, cxs[i]));
  const appear = [0.2, 1.6, 2.8];
  // caramel arcs from tree k's deepest leaves to the new pair's place under the shallowest leaf in tree k + 1
  const arcs: [[number, number], [number, number]][][] = [
    [
      [[laid[0][laid[0].length - 2].x, laid[0][laid[0].length - 2].y], [laid[1][2].x, laid[1][2].y]],
      [[laid[0][laid[0].length - 1].x, laid[0][laid[0].length - 1].y], [laid[1][3].x, laid[1][3].y]],
    ],
    [
      [[laid[1][laid[1].length - 2].x, laid[1][laid[1].length - 2].y], [laid[2][6].x, laid[2][6].y]],
      [[laid[1][laid[1].length - 1].x, laid[1][laid[1].length - 1].y], [laid[2][7].x, laid[2][7].y]],
    ],
  ];
  return (
    <Svg label="Three binary trees with six leaves: leaf depths 1, 2, 3, 4, 5, 5 with average 3.33; moving the two deepest leaves under the shallowest gives 2, 2, 2, 3, 4, 4 with average 2.83, and again 2, 2, 3, 3, 3, 3 with average 2.67, close to the floor log2 6 = 2.585; for a million keys the average is at least 18,488,884" h={380}>
      {laid.map((nodes, k) => {
        const a = fade(t, appear[k], appear[k] + 0.6);
        return (
          <g key={k} opacity={a}>
            {nodes.map((n) =>
              n.parent >= 0 ? <line key={'e' + n.id} x1={nodes[n.parent].x} y1={nodes[n.parent].y} x2={n.x} y2={n.y} stroke={C.mocha} strokeWidth={1.3} /> : null,
            )}
            {nodes.map((n) =>
              n.leaf ? (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={5} fill={C.crema} />
                  <T x={n.x} y={n.y + 20} s={13} f={C.latte} a="middle">
                    {n.depth}
                  </T>
                </g>
              ) : (
                <circle key={n.id} cx={n.x} cy={n.y} r={3} fill={C.taupe} />
              ),
            )}
            <T x={cxs[k] - 60} y={262} s={13} f={C.latte}>
              sum {SUMS[k]}
            </T>
            <T x={cxs[k] - 60} y={284} s={15} f={C.caramel} w={700}>
              avg {AVGS[k]}
            </T>
            <rect x={cxs[k] - 60} y={298} width={(SUMS[k] / 6) * 30} height={8} rx={4} fill={C.caramel} />
          </g>
        );
      })}
      {arcs.map((pair, k) =>
        pair.map(([[x1, y1], [x2, y2]], j) => {
          const p = seg(t, appear[k + 1] - 0.5, appear[k + 1] + 0.3);
          const mx = (x1 + x2) / 2;
          const my = Math.min(y1, y2) - 40;
          return (
            <path
              key={`${k}-${j}`}
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              fill="none"
              stroke={C.caramel}
              strokeWidth={1.8}
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - p}
              opacity={p > 0 && p < 1 ? 1 : p >= 1 ? 0.22 : 0}
            />
          );
        }),
      )}
      {/* the floor: log2 6 = 2.585 on the same bar scale, as a dashed tick across the three bars */}
      <g opacity={fade(t, 3.6, 4.0)}>
        {cxs.map((cx) => (
          <line key={cx} x1={cx - 60 + FLOOR_BAR} y1={292} x2={cx - 60 + FLOOR_BAR} y2={312} stroke={C.crema} strokeDasharray="3 3" strokeWidth={1.5} />
        ))}
        <T x={30} y={336} s={13} f={C.taupe}>
          dashed: log₂ 6 = 2.585
        </T>
        <T x={30} y={362} s={13} f={C.latte}>
          a million keys: average ≥ 18,488,884
        </T>
      </g>
    </Svg>
  );
}

// 6 · Count the answers: three problems, three answer counts, three ceilings of log2 K, each met by a known algorithm.
const ROWS: { title: string; k: string; bound: string; algo: string }[] = [
  { title: 'search the sorted vector', k: 'K = 1,000,001', bound: '⌈log₂ K⌉ = 20', algo: 'binary search: 20 probes (3-way)' },
  { title: 'merge two sorted runs of 4', k: 'K = 70', bound: '⌈log₂ K⌉ = 7', algo: 'standard merge: 7' },
  { title: 'sort 5 keys', k: 'K = 120', bound: '⌈log₂ K⌉ = 7', algo: 'best tree: 7' },
];
export function CountAnswers({ t }: StepCtx) {
  return (
    <Svg label="Three problems with their number of possible answers K: searching the sorted vector has 1,000,001 and needs 20 probes, merging two runs of 4 has 70 and needs 7, sorting 5 keys has 120 and needs 7; each matches a known algorithm" h={350}>
      <T x={30} y={26} s={13} f={C.taupe} o={fade(t, 0.2, 0.5)}>
        K answers → ≥ ⌈log₂ K⌉ yes/no questions
      </T>
      {ROWS.map((r, i) => {
        const y0 = 70 + i * 100;
        const b = 0.6 + i * 0.9;
        return (
          <g key={r.title}>
            <line x1={30} y1={y0 - 22} x2={545} y2={y0 - 22} stroke={C.cocoa} opacity={fade(t, b, b + 0.3)} />
            <T x={30} y={y0} s={13} f={C.latte} o={fade(t, b, b + 0.3)}>
              {r.title}
            </T>
            <T x={30} y={y0 + 26} s={15} f={C.crema} w={600} o={fade(t, b, b + 0.3)}>
              {r.k}
            </T>
            <T x={205} y={y0 + 26} s={15} f={C.caramel} w={600} o={fade(t, b + 0.3, b + 0.6)}>
              {r.bound}
            </T>
            <T x={30} y={y0 + 52} s={13} f={C.latte} o={fade(t, b + 0.5, b + 0.8)}>
              {r.algo}
            </T>
            <T x={540} y={y0 + 34} s={22} f={C.caramel} a="end" w={700} o={easeOutBack(seg(t, b + 0.7, b + 0.9))}>
              =
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Predict: the maximum of n keys needs n - 1 comparisons, far above counting's 20. Every key but one must lose once.
export function MaxPredict({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  return (
    <Svg label={shown ? 'Eight keys scanned for the maximum: seven comparisons make seven losers, so a million keys need 999,999 comparisons' : 'Eight keys of the vector; the largest of a million has a million possible answers, counting gives 20 questions, the comparisons needed are unknown'} h={240}>
      <T x={30} y={24} s={13} f={C.latte} o={fade(t, 0, 0.3)}>
        largest of n keys: n possible answers
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const a = fade(t, 0.1 + i * 0.05, 0.4 + i * 0.05);
        const lost = shown && i < 7 ? fade(s, i * 0.1, i * 0.1 + 0.15) : 0;
        return (
          <g key={i}>
            <Cell x={30 + i * 62} y={40} w={50} h={34} label={`k${'₁₂₃₄₅₆₇₈'[i]}`} o={a} stroke={i === 7 && shown ? C.caramel : C.mocha} />
            <T x={55 + i * 62} y={96} s={13} f={C.cherryText} a="middle" o={lost}>
              lost
            </T>
          </g>
        );
      })}
      <T x={30} y={146} s={15} f={C.caramel} o={fade(t, 0.5, 0.8)}>
        counting: ⌈log₂ 1,000,000⌉ = 20 questions
      </T>
      {shown ? (
        <>
          <T x={30} y={178} s={15} f={C.caramel} o={fade(s, 0.9, 1.1)}>
            7 losers of 8 keys need 7 comparisons
          </T>
          <g opacity={fade(s, 1.1, 1.4)}>
            <T x={30} y={216} s={15} f={C.latte}>
              a million keys:
            </T>
            <T x={235} y={218} s={22} f={C.caramel} w={700} serif>
              999,999
            </T>
          </g>
        </>
      ) : (
        <T x={30} y={190} s={15} f={C.taupe}>
          comparisons needed: ?
        </T>
      )}
    </Svg>
  );
}

// 8 · An adversary decides the input last: six answers leave two inputs that disagree on the maximum.
const TR: [string, string, string][] = [
  ['k₁ : k₂', '→ k₂', ''],
  ['k₃ : k₄', '→ k₄', ''],
  ['k₅ : k₆', '→ k₆', ''],
  ['k₇ : k₈', '→ k₈', ''],
  ['k₂ : k₄', '→ k₄', ''],
  ['k₆ : k₈', '→ k₈', ''],
];
const LOSERS = [1, 3, 5, 7, 2, 6]; // the keys that lost, in transcript order (k1 lost to k2, ...)
export function TwoInputs({ t }: StepCtx) {
  const lostAt = (k: number) => LOSERS.indexOf(k);
  return (
    <Svg label="A tournament on eight keys that stops after six comparisons: keys k4 and k8 never lost; input A is the values 1 to 8 with maximum k8, input B raises k4 to 9 with maximum k4, and both give all six answers, so the algorithm is wrong on one of them" h={380}>
      {TR.map(([q, a], i) => (
        <T key={i} x={i < 3 ? 30 : 200} y={46 + (i % 3) * 24} s={13} f={C.crema} o={fade(t, 0.2 + i * 0.3, 0.45 + i * 0.3)}>
          {q} {a}
        </T>
      ))}
      <T x={540} y={46} s={15} f={C.caramel} a="end" w={600} o={fade(t, 1.8, 2.1)}>
        6 comparisons &lt; 7
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const k = i + 1;
        const lostTime = lostAt(k) >= 0 ? 0.3 + lostAt(k) * 0.3 : 99;
        const unbeaten = k === 4 || k === 8;
        const hi = unbeaten ? fade(t, 2.0, 2.3) : 0;
        return (
          <g key={k}>
            <Cell x={30 + i * 62} y={150} w={50} h={30} label={`k${'₁₂₃₄₅₆₇₈'[i]}`} stroke={hi > 0.5 ? C.caramel : C.mocha} />
            <rect x={44 + i * 62} y={186} width={22} height={4} rx={2} fill={C.taupe} opacity={fade(t, lostTime + 0.2, lostTime + 0.4)} />
            {unbeaten && (
              <T x={55 + i * 62} y={210} s={13} f={C.caramel} a="middle" o={hi}>
                never lost
              </T>
            )}
          </g>
        );
      })}
      {(['A', 'B'] as const).map((name, r) => {
        const y = 240 + r * 48;
        const b = r === 0 ? 2.5 : 3.0;
        return (
          <g key={name} opacity={fade(t, b, b + 0.4)}>
            <T x={30} y={y + 20} s={13} f={C.latte}>
              input {name}
            </T>
            {Array.from({ length: 8 }, (_, i) => {
              const raised = r === 1 && i === 3;
              const v = raised ? 9 : i + 1;
              const rise = raised ? fade(t, 3.1, 3.5) : 1;
              return <Cell key={i} x={118 + i * 38} y={y + (raised ? (1 - rise) * 4 : 0)} w={32} h={28} label={raised && rise < 0.5 ? '4' : v} stroke={raised ? C.caramel : C.mocha} f={raised ? C.caramel : C.crema} />;
            })}
            <T x={432} y={y + 20} s={15} f={C.crema} w={600}>
              max {r === 0 ? 'k₈' : 'k₄'}
            </T>
          </g>
        );
      })}
      <g opacity={fade(t, 3.9, 4.3)}>
        <rect x={30} y={340} width={290} height={28} rx={14} fill={C.cherry} fillOpacity={0.4} stroke={C.cherry} />
        <T x={46} y={359} s={15} f={C.cherryText} w={600}>
          wrong on one of them
        </T>
      </g>
    </Svg>
  );
}

// 9 · Predict: minimum and maximum of eight keys. Pairing first.
export function MinMaxPredict({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const qOpacity = shown ? 1 - fade(s, 0, 0.2) : 1;
  const move = shown ? fade(s, 0, 0.5) : 0;
  // pair i = keys (2i, 2i + 1): the winner (the larger) rises, the loser drops; the larger of each pair is the second key
  const X = (i: number) => 30 + i * 50;
  return (
    <Svg label={shown ? 'Eight keys paired up: 4 comparisons, then the maximum of the 4 winners takes 3 and the minimum of the 4 losers takes 3, 4 + 3 + 3 = 10 instead of 13' : 'Eight keys; two scans take 7 comparisons for the maximum and 6 for the minimum, 13 in all; the fewest any algorithm can guarantee is unknown'} h={240}>
      <T x={30} y={24} s={13} f={C.latte} o={qOpacity * fade(t, 0, 0.3)}>
        max: scan, 7 comparisons
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <Cell x={X(i)} y={92} w={40} h={28} label={`k${'₁₂₃₄₅₆₇₈'[i]}`} o={fade(t, 0.05 * i, 0.3 + 0.05 * i) * (shown ? 1 - 0.55 * move : 1)} />
          {shown && i % 2 === 1 && <Cell x={X(i)} y={lerp(92, 34, move)} w={40} h={28} label={`k${'₁₂₃₄₅₆₇₈'[i]}`} stroke={C.caramel} o={move} />}
          {shown && i % 2 === 0 && <Cell x={X(i)} y={lerp(92, 150, move)} w={40} h={28} label={`k${'₁₂₃₄₅₆₇₈'[i]}`} o={move} />}
        </g>
      ))}
      {[0, 1, 2, 3].map((p) => (
        <line key={p} x1={X(2 * p)} y1={130} x2={X(2 * p + 1) + 40} y2={130} stroke={C.taupe} strokeWidth={1.5} opacity={shown ? fade(s, 0, 0.3) : 0} />
      ))}
      <T x={30} y={152} s={13} f={C.latte} o={qOpacity * fade(t, 0.4, 0.7)}>
        min: scan the other 7, 6 comparisons
      </T>
      <T x={30} y={186} s={15} f={C.caramel} o={qOpacity * fade(t, 0.6, 0.9)}>
        13 comparisons
      </T>
      <T x={30} y={222} s={15} f={C.taupe} o={qOpacity * fade(t, 0.8, 1.1)}>
        fewest possible: ?
      </T>
      {shown && (
        <>
          <T x={540} y={52} s={13} f={C.caramel} a="end" o={fade(s, 0.5, 0.8)}>
            winners: 3
          </T>
          <T x={540} y={112} s={13} f={C.latte} a="end" o={fade(s, 0.3, 0.6)}>
            pairs: 4
          </T>
          <T x={540} y={168} s={13} f={C.caramel} a="end" o={fade(s, 0.7, 1.0)}>
            losers: 3
          </T>
          <g opacity={fade(s, 0.9, 1.2)}>
            <T x={30} y={218} s={22} f={C.caramel} w={700} serif>
              4 + 3 + 3 = 10
            </T>
            <Struck x={300} y={218} s={20}>
              13
            </Struck>
          </g>
        </>
      )}
    </Svg>
  );
}

// 10 · The scoreboard: the referee keeps four columns; the units counter climbs to 14 while the comparisons counter stops at 10.
const BOARD: [number, number, number, number][] = [
  [1, 2, 1, 2], [3, 4, 3, 2], [5, 6, 5, 2], [7, 8, 7, 2], [3, 1, 3, 1], [5, 3, 5, 1], [7, 5, 7, 1], [2, 4, 2, 1], [4, 6, 4, 1], [6, 8, 6, 1],
];
const EV_T = [0.6, 0.9, 1.2, 1.5, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6]; // seconds of each comparison
type St = 0 | 1 | 2 | 3; // untested, only won, only lost, both
function boardStates(): St[][] {
  const out: St[][] = [Array(8).fill(0)];
  for (const [x, y, w] of BOARD) {
    const s = [...out[out.length - 1]] as St[];
    const l = w === x ? y : x;
    s[w - 1] = (s[w - 1] === 0 ? 1 : s[w - 1] === 2 ? 3 : s[w - 1]) as St;
    s[l - 1] = (s[l - 1] === 0 ? 2 : s[l - 1] === 1 ? 3 : s[l - 1]) as St;
    out.push(s);
  }
  return out;
}
const STATES = boardStates();
const COLX = [75, 205, 335, 465];
const slotOf = (states: St[], key: number) => {
  const col = states[key];
  let row = 0;
  for (let k = 0; k < key; k++) if (states[k] === col) row++;
  return { x: COLX[col], y: 130 + row * 26 };
};
export function Scoreboard({ t }: StepCtx) {
  let done = 0;
  while (done < EV_T.length && t >= EV_T[done]) done++;
  const units = BOARD.slice(0, done).reduce((n, e) => n + e[3], 0);
  const pos = (key: number) => {
    // the key moves at the event that changes its column; it glides over 0.28 s
    let cur = slotOf(STATES[0], key);
    for (let e = 1; e <= EV_T.length; e++) {
      const next = slotOf(STATES[e], key);
      const p = easeOut(seg(t, EV_T[e - 1], EV_T[e - 1] + 0.28));
      if (next.x !== cur.x || next.y !== cur.y) cur = { x: lerp(cur.x, next.x, p), y: lerp(cur.y, next.y, p) };
    }
    return cur;
  };
  const pulse = (e: number) => 1 - seg(t, EV_T[e], EV_T[e] + 0.35);
  return (
    <Svg label="The referee's scoreboard for eight keys with four columns: untested, only won, only lost, both. The pairing algorithm makes 10 comparisons while the units counter climbs to 14, the 2n - 2 units any correct answer needs; at most 4 comparisons can give two units" h={410}>
      <T x={30} y={20} s={13} f={C.taupe}>
        comparisons
      </T>
      <T x={30} y={54} s={20} f={C.crema} w={700}>
        {done}
      </T>
      <T x={540} y={20} s={13} f={C.taupe} a="end">
        units
      </T>
      <T x={540} y={54} s={20} f={C.caramel} a="end" w={700}>
        {units}
        <tspan fill={C.taupe}> / 14</tspan>
      </T>
      {['untested', 'only won', 'only lost', 'both'].map((h, c) => (
        <T key={h} x={COLX[c]} y={94} s={13} f={C.latte} a="middle">
          {h}
        </T>
      ))}
      {Array.from({ length: 8 }, (_, k) => {
        const p = pos(k);
        let flash = 0;
        for (let e = 0; e < done; e++) if (BOARD[e][2] - 1 === k || (BOARD[e][0] === k + 1 || BOARD[e][1] === k + 1)) flash = Math.max(flash, pulse(e) * (BOARD[e][3] === 2 ? 1 : 0.6));
        return (
          <g key={k} opacity={fade(t, 0.05 * k, 0.3 + 0.05 * k)}>
            <rect x={p.x - 22} y={p.y - 12} width={44} height={22} rx={5} fill={C.roast} stroke={flash > 0.3 ? C.caramel : C.mocha} />
            <T x={p.x} y={p.y + 4} s={13} f={C.crema} a="middle">
              {`k${'₁₂₃₄₅₆₇₈'[k]}`}
            </T>
          </g>
        );
      })}
      <g opacity={fade(t, 4.0, 4.4)}>
        <T x={30} y={346} s={13} f={C.latte}>
          two untested keys → 2 units, at most 4 times
        </T>
        <T x={30} y={368} s={13} f={C.latte}>
          any other comparison → at most 1 unit
        </T>
      </g>
      <T x={30} y={396} s={15} f={C.caramel} w={700} o={fade(t, 4.5, 4.9)}>
        ≥ 4 + (14 − 8) = 10
      </T>
    </Svg>
  );
}

// 11 · Predict: are all keys distinct? Two answers, so counting promises one question.
export function DistinctPredict({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  return (
    <Svg label={shown ? 'Are all keys distinct: two possible answers, counting gives one question, but a million keys cost at least 18,488,885 comparisons, as many as sorting' : 'Are all keys distinct: two possible answers, yes or no, counting gives one question; the worst case on a million keys is unknown'} h={250}>
      <T x={30} y={22} s={13} f={C.latte} o={fade(t, 0, 0.3)}>
        are all keys distinct?
      </T>
      <g opacity={fade(t, 0.1, 0.5)}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={30 + i * 42} y={34} width={38} height={26} rx={5} fill={C.roast} stroke={C.mocha} />
        ))}
      </g>
      {['yes', 'no'].map((a, i) => (
        <g key={a} opacity={fade(t, 0.5 + i * 0.15, 0.8 + i * 0.15)}>
          <rect x={30 + i * 100} y={80} width={84} height={30} rx={15} fill="none" stroke={C.latte} />
          <T x={72 + i * 100} y={100} s={15} f={C.crema} a="middle">
            {a}
          </T>
        </g>
      ))}
      <T x={30} y={144} s={15} f={C.caramel} o={fade(t, 1.0, 1.3)}>
        K = 2 → ⌈log₂ 2⌉ = 1 question
      </T>
      {shown ? (
        <>
          <T x={30} y={182} s={17} f={C.caramel} w={700} o={fade(s, 0, 0.5)}>
            ≥ 18,488,885 = ⌈log₂ 1,000,000!⌉
          </T>
          <T x={30} y={212} s={13} f={C.latte} o={fade(s, 0.5, 0.9)}>
            as many as sorting: proof in the next step
          </T>
        </>
      ) : (
        <T x={30} y={182} s={15} f={C.taupe}>
          a million keys, worst case: ?
        </T>
      )}
    </Svg>
  );
}

// 12 · Distinctness: lay the keys out in sorted order; a neighbour pair never compared lets the adversary make them equal.
const SORTED_KEYS = [3, 7, 1, 5, 2, 8, 4, 6]; // k3 k7 k1 k5 k2 k8 k4 k6, smallest to largest
const POS = (k: number) => SORTED_KEYS.indexOf(k);
const PX = (p: number) => 70 + 62 * p;
const DOT_Y = 120;
const RECORDED: [number, number][] = [[3, 7], [7, 1], [1, 5], [2, 8], [8, 4], [4, 6], [7, 5], [2, 6]];
export function Neighbours({ t }: StepCtx) {
  const slide = easeOut(seg(t, 3.2, 3.7));
  const xOf = (k: number) => (k === 2 ? lerp(PX(POS(2)), PX(POS(5)), slide) : PX(POS(k)));
  const merged = seg(t, 3.7, 3.9);
  const sub = '₀₁₂₃₄₅₆₇₈';
  return (
    <Svg label="Eight keys on a number line in sorted order; six of the seven neighbour pairs and two other pairs were compared, but k5 and k2 never; the adversary slides k2 onto k5, every answer stays the same, the algorithm still says distinct and is now wrong; so every distinct answer needs all 7 neighbour comparisons, at least ⌈log₂ 8!⌉ = 16" h={350}>
      <line x1={40} y1={DOT_Y} x2={540} y2={DOT_Y} stroke={C.taupe} opacity={fade(t, 0.1, 0.4)} />
      {SORTED_KEYS.map((k, p) => {
        const a = fade(t, 0.2 + p * 0.07, 0.5 + p * 0.07);
        const labelOp = k === 2 ? a * (1 - seg(t, 3.2, 3.5)) : a;
        return (
          <g key={k}>
            <circle cx={xOf(k)} cy={DOT_Y} r={7} fill={C.crema} opacity={a} />
            <T x={xOf(k)} y={DOT_Y - 20} s={13} f={C.crema} a="middle" o={labelOp}>
              {`k${sub[k]}`}
            </T>
          </g>
        );
      })}
      {RECORDED.map(([x, y], i) => {
        const neigh = Math.abs(POS(x) - POS(y)) === 1;
        const a = fade(t, 1.0 + i * 0.2, 1.3 + i * 0.2);
        const x1 = xOf(x);
        const x2 = xOf(y);
        const peak = neigh ? 18 : 34;
        return (
          <path
            key={i}
            d={`M ${x1} ${DOT_Y + 8} Q ${(x1 + x2) / 2} ${DOT_Y + 8 + peak * 2} ${x2} ${DOT_Y + 8}`}
            fill="none"
            stroke={neigh ? C.caramel : C.taupe}
            strokeWidth={neigh ? 2.4 : 1.6}
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset={1 - a}
          />
        );
      })}
      <g opacity={fade(t, 2.9, 3.2) * (1 - 0.4 * slide)}>
        <line x1={PX(3) + 8} y1={190} x2={PX(4) - 8} y2={190} stroke={C.taupe} strokeDasharray="4 4" />
        <line x1={PX(3) + 8} y1={184} x2={PX(3) + 8} y2={196} stroke={C.taupe} />
        <line x1={PX(4) - 8} y1={184} x2={PX(4) - 8} y2={196} stroke={C.taupe} />
        <T x={(PX(3) + PX(4)) / 2} y={214} s={13} f={C.taupe} a="middle">
          never compared
        </T>
      </g>
      <g opacity={merged}>
        <circle cx={PX(POS(5))} cy={DOT_Y} r={13} fill="none" stroke={C.cherryText} strokeWidth={2} />
        <T x={PX(POS(5))} y={66} s={13} f={C.cherryText} a="middle">
          k₅ = k₂: not distinct
        </T>
      </g>
      <g opacity={fade(t, 2.0, 2.4)}>
        <rect x={30} y={236} width={300} height={30} rx={15} fill={slide >= 1 && t > 3.9 ? C.cherry : 'none'} fillOpacity={0.45} stroke={t > 3.9 ? C.cherry : C.latte} />
        <T x={46} y={256} s={15} f={C.crema}>
          algorithm says: distinct
        </T>
      </g>
      <T x={30} y={300} s={13} f={C.latte} o={fade(t, 4.3, 4.6)}>
        'distinct' needs all 7 neighbours compared
      </T>
      <T x={30} y={326} s={15} f={C.caramel} w={700} o={fade(t, 4.6, 4.9)}>
        ⇒ order known ⇒ 8 keys: ≥ ⌈log₂ 8!⌉ = 16
      </T>
    </Svg>
  );
}

// 13 · What a lower bound rules out: a fence around one model and one problem; the escapes go around it.
const ESC = [
  { x: 18, y: 14, a: 'radix sort', b: '4 passes, keys as digits', c: 'changes: the model', from: [150, 120], to: [120, 82] },
  { x: 290, y: 14, a: 'hash set', b: 'distinct? expected O(n)', c: 'changes: the model', from: [450, 120], to: [480, 82] },
  { x: 18, y: 300, a: 'already sorted', b: 'checked in 999,999', c: 'changes: the input', from: [150, 260], to: [120, 298] },
  { x: 290, y: 300, a: 'smallest half first', b: 'linear time', c: 'changes: the problem', from: [450, 260], to: [480, 298] },
] as const;
export function Scope({ t }: StepCtx) {
  return (
    <Svg label="The comparison model as a fence with the sorting bound of at least 18,488,885 inside; a comparison sort claiming 15 million is stopped at the wall; radix sort, a hash set, an already sorted input and a different problem all go around the fence by changing the model, the guarantee, the input or the problem; every correct algorithm needs at least n to read the keys" h={410}>
      <g opacity={fade(t, 0.2, 0.6)}>
        <rect x={150} y={120} width={300} height={140} rx={18} fill="none" stroke={C.cinnamon} strokeWidth={2.5} />
        <T x={300} y={150} s={17} f={C.cinnamon} a="middle" w={700}>
          comparison model
        </T>
      </g>
      <g opacity={fade(t, 0.9, 1.2)}>
        <T x={300} y={190} s={15} f={C.caramel} a="middle" w={600}>
          sorting: ≥ 18,488,885
        </T>
        <T x={300} y={218} s={13} f={C.latte} a="middle">
          worst case and average
        </T>
      </g>
      <g opacity={fade(t, 1.2, 1.4)}>
        <line x1={24} y1={190} x2={fade(t, 1.2, 1.6) * 118 + 24} y2={190} stroke={C.taupe} strokeWidth={2} />
        <line x1={146} y1={178} x2={146} y2={202} stroke={C.taupe} strokeWidth={3} opacity={seg(t, 1.5, 1.6)} />
        <T x={24} y={172} s={13} f={C.latte}>
          claim A: no
        </T>
      </g>
      {ESC.map((e, i) => {
        const at = 1.9 + i * 0.6;
        const a = fade(t, at, at + 0.4);
        const p = seg(t, at, at + 0.5);
        const [fx, fy] = e.from;
        const [tx, ty] = e.to;
        return (
          <g key={e.a}>
            <line x1={fx} y1={fy} x2={lerp(fx, tx, p)} y2={lerp(fy, ty, p)} stroke={C.taupe} strokeWidth={1.6} strokeDasharray="4 4" />
            <g opacity={a}>
              <rect x={e.x} y={e.y} width={255} height={66} rx={12} fill={C.roast} stroke={C.mocha} />
              <T x={e.x + 12} y={e.y + 20} s={13} f={C.crema} w={600}>
                {e.a}
              </T>
              <T x={e.x + 12} y={e.y + 39} s={13} f={C.latte}>
                {e.b}
              </T>
              <T x={e.x + 12} y={e.y + 57} s={13} f={C.taupe}>
                {e.c}
              </T>
            </g>
          </g>
        );
      })}
      <T x={30} y={398} s={13} f={C.taupe} o={fade(t, 4.3, 4.7)}>
        any correct algorithm: Ω(n) to read the keys
      </T>
    </Svg>
  );
}

// 14 · Back to the problem: the three promises, refuted, with the way out.
const VERDICTS: { l1: string; l2: string; l3: string }[] = [
  { l1: 'sort any input · ≤ 15,000,000', l2: 'some input needs ≥ 18,488,885', l3: 'unless it stops comparing: radix sort' },
  { l1: 'min and max · ≤ 1,200,000', l2: 'some input needs ≥ 1,499,998', l3: 'pairing meets it: 1,499,998' },
  { l1: 'all distinct? · ≤ 5,000,000', l2: 'some input needs ≥ 18,488,885', l3: 'unless it hashes: expected O(n)' },
];
export function Closing({ t }: StepCtx) {
  return (
    <Svg label="The three promises refuted: sorting in 15,000,000 comparisons is impossible because some input needs at least 18,488,885, minimum and maximum in 1,200,000 because some input needs at least 1,499,998, and distinctness in 5,000,000 because some input needs at least 18,488,885; sorting and distinctness escape by leaving comparisons, radix sort or hashing, and pairing meets the min and max bound" h={380}>
      <VectorRow t={t} y={10} />
      <T x={30} y={64} s={13} f={C.taupe}>
        n = 1,000,000 keys · 64-bit
      </T>
      {VERDICTS.map((v, i) => {
        const y = 82 + i * 98;
        const at = 0.8 + i * 0.7;
        const flip = easeOutBack(seg(t, at, at + 0.3));
        return (
          <g key={v.l1}>
            <rect x={30} y={y} width={515} height={86} rx={14} fill={C.roast} stroke={C.mocha} />
            <Struck x={48} y={y + 24} s={13}>
              {v.l1}
            </Struck>
            <T x={48} y={y + 50} s={15} f={C.caramel} w={700} o={fade(t, at, at + 0.4)}>
              {v.l2}
            </T>
            <T x={48} y={y + 74} s={13} f={C.latte} o={fade(t, at + 0.3, at + 0.7)}>
              {v.l3}
            </T>
            <T x={528} y={y + 56} s={26} f={C.cherryText} a="end" w={700} o={flip}>
              ✗
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 15 · Prove it 1: merging two sorted runs of 8; the interleaved input makes every adjacent pair a necessary comparison.
export function Q1Merge({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const sub = (i: number) => '₁₂₃₄₅₆₇₈'[i];
  const mp = fade(s, 0, 0.5);
  return (
    <Svg label={shown ? 'Two sorted runs of 8 interleave into one row; every one of the 15 adjacent pairs comes from different runs and must be compared directly, so 15 = 2n - 1 comparisons are needed, one more than counting gives' : 'Two sorted runs of 8 keys; counting the C(16, 8) = 12,870 interleavings gives 14 comparisons; the worst case of every merge is unknown'} h={250}>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <Cell x={30 + i * 36} y={16} w={30} h={26} label={`a${sub(i)}`} o={fade(t, 0.03 * i, 0.3 + 0.03 * i) * (shown ? 1 - 0.7 * mp : 1)} />
          <Cell x={30 + i * 36} y={52} w={30} h={26} label={`b${sub(i)}`} o={fade(t, 0.03 * i + 0.2, 0.5 + 0.03 * i) * (shown ? 1 - 0.7 * mp : 1)} f={C.latte} />
        </g>
      ))}
      {shown &&
        Array.from({ length: 16 }, (_, j) => {
          const isA = j % 2 === 0;
          const i = j >> 1;
          return <Cell key={j} x={30 + j * 31} y={lerp(isA ? 16 : 52, 108, mp)} w={27} h={26} label={`${isA ? 'a' : 'b'}${sub(i)}`} f={isA ? C.crema : C.latte} o={mp} s={13} stroke={C.mocha} />;
        })}
      {shown &&
        Array.from({ length: 15 }, (_, j) => (
          <path key={j} d={`M ${30 + j * 31 + 13} ${138} Q ${30 + j * 31 + 29} ${152} ${30 + (j + 1) * 31 + 13} ${138}`} fill="none" stroke={C.caramel} strokeWidth={1.8} opacity={fade(s, 0.2 + j * 0.02, 0.5 + j * 0.02)} />
        ))}
      <T x={30} y={186} s={15} f={C.caramel} o={fade(t, 0.5, 0.8)}>
        counting: C(16, 8) = 12,870 → 14
      </T>
      {shown ? (
        <T x={30} y={222} s={17} f={C.caramel} w={700} o={fade(s, 0.8, 1.1)}>
          15 = 2n − 1: every adjacent pair
        </T>
      ) : (
        <T x={30} y={222} s={15} f={C.taupe}>
          every merge, worst case: ?
        </T>
      )}
    </Svg>
  );
}

// 16 · Prove it 2: an adversary whose answers can contradict each other proves nothing.
const V: Record<string, [number, number]> = { a: [90, 56], b: [230, 56], c: [160, 150] };
export function Q2Cycle({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const arrows: [string, string][] = [['a', 'b'], ['b', 'c'], ['c', 'a']];
  return (
    <Svg label={shown ? 'The student adversary answers a beats b, b beats c, c beats a: a cycle, so no input fits the answers and the argument proves nothing' : 'Three keys a, b, c and a student adversary that always answers that the first key named is larger; does it prove n - 1 comparisons for the maximum?'} h={250}>
      <rect x={300} y={24} width={245} height={86} rx={12} fill={C.roast} stroke={C.mocha} opacity={fade(t, 0.3, 0.6) * (shown ? 0.45 : 1)} />
      <g opacity={fade(t, 0.3, 0.6) * (shown ? 0.45 : 1)}>
        <T x={314} y={48} s={13} f={C.latte}>
          student's adversary:
        </T>
        <T x={314} y={68} s={13} f={C.crema}>
          the first key named
        </T>
        <T x={314} y={88} s={13} f={C.crema}>
          is larger
        </T>
      </g>
      {shown && (
        <polygon points={`${V.a[0]},${V.a[1]} ${V.b[0]},${V.b[1]} ${V.c[0]},${V.c[1]}`} fill={C.cherry} fillOpacity={0.35 * fade(s, 0.5, 0.8)} stroke="none" />
      )}
      {arrows.map(([from, to], i) => {
        const [x1, y1] = V[from];
        const [x2, y2] = V[to];
        const p = shown ? seg(s, i * 0.15, i * 0.15 + 0.3) : 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;
        const sx = x1 + ux * 24;
        const sy = y1 + uy * 20;
        const ex = lerp(sx, x2 - ux * 26, p);
        const ey = lerp(sy, y2 - uy * 22, p);
        return (
          <g key={from + to} opacity={p > 0 ? 1 : 0}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={C.crema} strokeWidth={2} />
            <circle cx={ex} cy={ey} r={3.5} fill={C.crema} />
          </g>
        );
      })}
      {Object.entries(V).map(([k, [x, y]]) => (
        <Cell key={k} x={x - 18} y={y - 14} w={36} h={28} label={k} o={fade(t, 0.1, 0.4)} f={C.crema} s={15} />
      ))}
      {shown && (
        <g opacity={fade(s, 0.5, 0.8)}>
          <T x={314} y={140} s={13} f={C.crema}>
            a : b → a
          </T>
          <T x={314} y={160} s={13} f={C.crema}>
            b : c → b
          </T>
          <T x={314} y={180} s={13} f={C.crema}>
            c : a → c
          </T>
        </g>
      )}
      {shown ? (
        <T x={30} y={222} s={15} f={C.cherryText} w={700} o={fade(s, 0.7, 1.0)}>
          a &gt; b &gt; c &gt; a: no input
        </T>
      ) : (
        <T x={30} y={222} s={15} f={C.taupe}>
          proves n − 1?
        </T>
      )}
    </Svg>
  );
}

// 17 · Prove it 3: which claim does the comparison-sorting bound refute?
const CARDS: { lines: string[]; why: string; hit?: boolean }[] = [
  { lines: ['Radix sort orders', 'them in 4 passes'], why: 'not comparisons' },
  { lines: ['A comparison sort', 'checks sorted input', 'in 999,999'], why: 'an easy input' },
  { lines: ['A comparison sort', 'averages 17 million', 'on random orders'], why: '', hit: true },
  { lines: ['A selection finds', 'the 10 largest', 'in O(n)'], why: 'another problem' },
];
export function Q3Refute({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  return (
    <Svg label={shown ? 'Four claims about a million keys: only the comparison sort averaging 17 million on random orders is refuted, because any comparison sort averages at least 18,488,884; radix sort is not comparisons, sorted input is an easy input, and selection is another problem' : 'Four claims about a million 64-bit keys; which one does the comparison-sorting lower bound refute?'} h={260}>
      {CARDS.map((c, i) => {
        const x = 20 + (i % 2) * 272;
        const y = 14 + Math.floor(i / 2) * 104;
        const hit = !!c.hit;
        const reveal = shown ? (hit ? fade(s, 0, 0.5) : fade(s, 0.4, 0.9)) : 0;
        return (
          <g key={i} opacity={fade(t, 0.1 + i * 0.12, 0.4 + i * 0.12)}>
            <rect x={x} y={y} width={255} height={92} rx={12} fill={hit && shown ? C.cherry : C.roast} fillOpacity={hit && shown ? 0.25 + 0.2 * reveal : 1} stroke={hit && shown ? C.cherry : C.mocha} />
            {c.lines.map((l, k) => (
              <T key={k} x={x + 12} y={y + 20 + k * 18} s={13} f={C.crema}>
                {l}
              </T>
            ))}
            {hit && shown && (
              <T x={x + 12} y={y + 20 + 3 * 18} s={13} f={C.cherryText} w={700} o={reveal}>
                average ≥ 18,488,884
              </T>
            )}
            {!hit && shown && (
              <T x={x + 12} y={y + 20 + 3 * 18} s={13} f={C.taupe} o={reveal}>
                outside: {c.why}
              </T>
            )}
          </g>
        );
      })}
      <T x={30} y={246} s={15} f={C.taupe} o={fade(t, 0.8, 1.1)}>
        which one does the sorting bound refute?
      </T>
    </Svg>
  );
}
