import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the thing to look at (the node rotating, the colour
// invariant being checked); cinnamon = the alternative being compared (balanced vs unbalanced
// height); cherry = the bad outcome (a degenerate, linked-list-shaped tree). At most two accents
// per step.

function node(cx: number, cy: number, r: number, colour = C.caramel, opacity = 1) {
  return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={colour} opacity={opacity} />;
}

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 0.6, width = 1.4) {
  return <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// 1 · Opening: a hash table fading, a BST growing in its place
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A row of hash-table slots fading, a small ordered binary search tree growing in its place" h={280}>
      <T x={30} y={26} s={13} f={C.latte}>before: no order at all</T>
      {Array.from({ length: 5 }, (_, i) => fill(30 + i * 56, 46, 44, 24, C.taupe, 0.6 * (1 - a)))}
      <T x={30} y={190} s={13} f={C.caramel} o={a}>now: order, kept on purpose</T>
      {edge(170, 210, 110, 240, C.latte, 0.6 * a)}
      {edge(170, 210, 230, 240, C.latte, 0.6 * a)}
      {node(170, 210, 9, C.caramel, a)}
      {node(110, 240, 7, C.crema, a)}
      {node(230, 240, 7, C.crema, a)}
    </Svg>
  );
}

// 2 · Search/insert: a comparison path from root down
export function SearchInsert({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A small BST with a search path lit from the root down to a new leaf" h={280}>
      {edge(170, 60, 110, 130)}
      {edge(170, 60, 230, 130)}
      {edge(110, 130, 80, 200)}
      {edge(110, 130, 140, 200, C.caramel, Math.max(0.3, a), 2.4)}
      {node(170, 60, 10, C.crema)}
      {node(110, 130, 9, C.crema)}
      {node(230, 130, 9, C.crema)}
      {node(80, 200, 7, C.crema)}
      {node(140, 200, 7, C.caramel, a)}
      <T x={30} y={250} s={13} f={C.latte} o={a}>smaller, go left; bigger, go right</T>
    </Svg>
  );
}

// 3 · Predict: what shape results from sorted insertion?
export function DegeneratePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A handful of timestamps about to be inserted in already-sorted order, asking what shape results" h={280}>
      {Array.from({ length: 5 }, (_, i) => node(60 + i * 56, 60, 7, C.caramel, 0.5 + 0.5 * pulse))}
      {Array.from({ length: 4 }, (_, i) => edge(60 + i * 56, 60, 60 + (i + 1) * 56, 60, C.latte, 0.5))}
      {!answered && <T x={30} y={255} s={15} f={C.caramel} o={pulse}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={240} s={13} f={C.caramel}>one long chain — height equal to the key count</T>
          <T x={30} y={262} s={13} f={C.latte}>every node has only a right child</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Degenerate reveal: random order (shallow) vs sorted order (chain), side by side
export function DegenerateReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="The same key set drawn two ways: a shallow tree from random insertion, a long chain from sorted insertion" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>random order: shallow</T>
      {edge(90, 50, 60, 90)}
      {edge(90, 50, 120, 90)}
      {node(90, 50, 8, C.crema)}
      {node(60, 90, 6, C.crema)}
      {node(120, 90, 6, C.crema)}
      <T x={200} y={24} s={13} f={C.cherry} o={a}>sorted order: one long chain</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          {i > 0 && edge(200, 40 + (i - 1) * 32, 200, 40 + i * 32, C.cherry, Math.max(0.3, a))}
          {node(200, 40 + i * 32, 6, C.cherry, Math.max(0.3, a))}
        </g>
      ))}
      <T x={30} y={270} s={13} f={C.cherry} o={a}>same keys, same property, wildly different height</T>
    </Svg>
  );
}

// 5 · Delete by successor: the two-child case
export function DeleteSuccessor({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A two-child node being deleted, its in-order successor sliding up from the right subtree into its place" h={280}>
      {edge(170, 60, 110, 130, C.cherry, 0.6)}
      {edge(170, 60, 230, 130)}
      {edge(230, 130, 200, 190)}
      {node(170, 60, 10, C.cherry, 0.7)}
      {node(110, 130, 8, C.crema)}
      {node(230, 130, 8, C.crema)}
      {node(200, 190, 7, C.caramel, a)}
      <path d="M 200 185 Q 185 120 172 68" fill="none" stroke={C.caramel} strokeWidth={2} opacity={a} markerEnd="url(#arrow)" />
      <T x={30} y={250} s={13} f={C.latte} o={a}>the successor: smallest key in the right subtree</T>
    </Svg>
  );
}

// 6 · In-order traversal
export function InOrderTraversal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const nodes = [[170, 60], [110, 130], [230, 130], [80, 190], [140, 190]];
  return (
    <Svg label="A small BST walked left-subtree, node, right-subtree, each visited key appearing in a growing sorted list" h={300}>
      {edge(170, 60, 110, 130)}
      {edge(170, 60, 230, 130)}
      {edge(110, 130, 80, 190)}
      {edge(110, 130, 140, 190)}
      {nodes.map(([x, y], i) => node(x, y, 7, C.crema))}
      {Array.from({ length: 5 }, (_, i) => fill(30 + i * 56, 250, 36, 18, C.caramel, Math.max(0.2, easeOut(seg(t, 0.1 * i, 0.1 * i + 0.3)))))}
      <T x={30} y={280} s={13} f={C.latte} o={a}>left, visit, right — every time</T>
    </Svg>
  );
}

// 7 · Rotation: a two-frame before/after move
export function Rotation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  const x1 = -40 + 80 * a;
  return (
    <Svg label="A small subtree rotating: one node promoted, its parent demoted, pointers re-linked" h={280}>
      <g transform={`translate(${x1},0)`}>
        {a < 0.5 ? (
          <>
            {edge(170, 60, 110, 120)}
            {edge(170, 60, 230, 120, C.caramel, 1, 2)}
            {edge(230, 120, 200, 180)}
            {node(170, 60, 9, C.crema)}
            {node(110, 120, 7, C.crema)}
            {node(230, 120, 9, C.caramel)}
            {node(200, 180, 6, C.crema)}
          </>
        ) : (
          <>
            {edge(170, 60, 110, 120, C.caramel, 1, 2)}
            {edge(170, 60, 230, 120)}
            {edge(110, 120, 85, 180)}
            {node(170, 60, 9, C.caramel)}
            {node(110, 120, 9, C.crema)}
            {node(230, 120, 7, C.crema)}
            {node(85, 180, 6, C.crema)}
          </>
        )}
      </g>
      <T x={30} y={250} s={13} f={C.latte} o={1}>shape changes — order never does</T>
    </Svg>
  );
}

// 8 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Two measured bar pairs: height under random vs sorted insertion order, and a rotation's in-order sequence unchanged" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>height: random order vs sorted order, same keys</T>
      {fill(30, 36, 20 * a, 16, C.caramel, Math.max(0.3, a))}
      {fill(30, 56, 220, 16, C.cherry, 0.6)}
      <T x={30} y={130} s={13} f={C.crema}>a rotation's in-order sequence, before and after</T>
      {fill(30, 142, 180 * b, 14, C.caramel, Math.max(0.3, b))}
      {fill(30, 160, 180 * b, 14, C.caramel, Math.max(0.3, b))}
      <T x={30} y={220} s={13} f={C.latte}>identical sequence, both times</T>
    </Svg>
  );
}
