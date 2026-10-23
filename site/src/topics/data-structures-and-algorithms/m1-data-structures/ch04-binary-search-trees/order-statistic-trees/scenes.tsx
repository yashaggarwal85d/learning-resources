import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a node's own key; latte = secondary labels (a node's
// computed size); caramel = the thing to look at (the comparison path, the rotation, the field
// being checked); cinnamon = the alternative being compared; cherry = the bad outcome (not used
// much here, since nothing degrades in this topic -- reserved for the crossed-out "needs the
// whole subtree" box in step 8).

function node(cx: number, cy: number, r: number, colour = C.crema, opacity = 1) {
  return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={colour} opacity={opacity} />;
}

function sizeLabel(cx: number, cy: number, opacity = 1) {
  return (
    <circle key={`${cx}-${cy}-sz`} cx={cx + 10} cy={cy - 8} r={5} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={opacity} />
  );
}

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 0.6, width = 1.4) {
  return <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// 1 · Opening: topic 24's tree gaining a size label beside every node
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A balanced tree with each node gaining a small subtree-size label beside its key" h={300}>
      {edge(170, 60, 110, 130)}
      {edge(170, 60, 230, 130)}
      {edge(110, 130, 85, 190)}
      {edge(110, 130, 135, 190)}
      {node(170, 60, 10, C.crema)}
      {node(110, 130, 8, C.crema)}
      {node(230, 130, 8, C.crema)}
      {node(85, 190, 6, C.crema)}
      {node(135, 190, 6, C.crema)}
      {sizeLabel(170, 60, a)}
      {sizeLabel(110, 130, a)}
      {sizeLabel(230, 130, a)}
      {sizeLabel(85, 190, a)}
      {sizeLabel(135, 190, a)}
      <T x={30} y={260} s={13} f={C.latte} o={a}>membership was free — rank and select next</T>
    </Svg>
  );
}

// 2 · Size augmentation: size = left.size + right.size + 1
export function SizeAugmentation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A node with its two children's sizes summing, plus one, into its own size label" h={280}>
      {edge(170, 60, 110, 130)}
      {edge(170, 60, 230, 130)}
      {node(170, 60, 10, C.crema)}
      {sizeLabel(170, 60, 1)}
      {node(110, 130, 8, C.crema)}
      {sizeLabel(110, 130, 1)}
      {node(230, 130, 8, C.crema)}
      {sizeLabel(230, 130, 1)}
      <path d="M 120 140 L 160 70" stroke={C.caramel} strokeWidth={1.4} opacity={a} markerEnd="url(#arrow)" />
      <path d="M 220 140 L 180 70" stroke={C.caramel} strokeWidth={1.4} opacity={a} markerEnd="url(#arrow)" />
      <T x={30} y={250} s={13} f={C.latte} o={a}>children's sizes, summed, plus one for itself</T>
    </Svg>
  );
}

// 3 · Predict: which sizes need updating on insert
export function InsertPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A new key about to be inserted, with the root-to-new-leaf path highlighted" h={280}>
      {edge(170, 60, 110, 130, C.caramel, Math.max(0.5, pulse), 2)}
      {edge(110, 130, 85, 190, C.caramel, Math.max(0.5, pulse), 2)}
      {node(170, 60, 9, C.crema)}
      {node(110, 130, 8, C.crema)}
      {node(85, 190, 6, C.caramel, pulse)}
      {node(230, 130, 8, C.crema, 0.4)}
      {!answered && <T x={30} y={250} s={15} f={C.caramel} o={pulse}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={240} s={13} f={C.caramel}>every node on the root-to-leaf path</T>
          <T x={30} y={262} s={13} f={C.latte}>each one just gained one new descendant</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Insert reveal: path sizes incrementing, rest of tree dimmed
export function InsertReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="The insert path's size labels incrementing one by one, the rest of the tree dimmed" h={300}>
      {edge(170, 60, 110, 130, C.caramel, 1, 2)}
      {edge(110, 130, 85, 190, C.caramel, 1, 2)}
      {edge(170, 60, 230, 130, C.latte, 0.25)}
      {node(170, 60, 9, C.crema)}
      {sizeLabel(170, 60, Math.max(0.3, a))}
      {node(110, 130, 8, C.crema)}
      {sizeLabel(110, 130, Math.max(0.3, a))}
      {node(85, 190, 6, C.caramel, a)}
      {sizeLabel(85, 190, Math.max(0.3, a))}
      {node(230, 130, 8, C.crema, 0.25)}
      <T x={30} y={270} s={13} f={C.latte} o={a}>one path, one increment at every stop</T>
    </Svg>
  );
}

// 5 · Select walk: comparing target rank against left subtree size
export function SelectWalk({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.1, 0.5));
  const a2 = easeOut(seg(t, 0.5, 0.9));
  const a3 = easeOut(seg(t, 0.9, 1.3));
  return (
    <Svg label="A select query walking down, comparing the target rank against each node's left subtree size" h={300}>
      {edge(170, 50, 110, 110, C.caramel, Math.max(0.3, a1), 2)}
      {edge(110, 110, 135, 170, C.caramel, Math.max(0.3, a2), 2)}
      {node(170, 50, 9, C.crema, Math.max(0.4, a1))}
      {sizeLabel(170, 50, 1)}
      {node(110, 110, 7, C.crema, Math.max(0.4, a2))}
      {sizeLabel(110, 110, 1)}
      {node(135, 170, 6, C.caramel, Math.max(0.4, a3))}
      <T x={30} y={240} s={13} f={C.latte} o={a1}>too big: go left</T>
      <T x={30} y={258} s={13} f={C.latte} o={a2}>too small: subtract, go right</T>
      <T x={30} y={276} s={13} f={C.crema} o={a3}>exactly right: stop</T>
    </Svg>
  );
}

// 6 · Predict: how many sizes a rotation touches
export function RotationPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A rotation about to fire on two nodes, their size labels shown before the fixup" h={280}>
      {edge(170, 60, 110, 130, C.caramel, Math.max(0.5, pulse), 2.2)}
      {edge(110, 130, 85, 190)}
      {edge(110, 130, 135, 190)}
      {node(170, 60, 9, C.caramel, pulse)}
      {sizeLabel(170, 60, 1)}
      {node(110, 130, 8, C.caramel, pulse)}
      {sizeLabel(110, 130, 1)}
      {node(85, 190, 6, C.crema)}
      {node(135, 190, 6, C.crema)}
      {!answered && <T x={30} y={250} s={15} f={C.caramel} o={pulse}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={240} s={13} f={C.caramel}>only the two nodes incident to the rotated edge</T>
          <T x={30} y={262} s={13} f={C.latte}>every other node keeps its own descendants</T>
        </>
      )}
    </Svg>
  );
}

// 7 · Rotation reveal: two labels update, everything else frozen
export function RotationReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A rotation firing: only the two incident nodes' size labels update, everything else frozen" h={300}>
      <g transform={`translate(${-20 + 40 * a},0)`}>
        {edge(170, 60, 230, 120, C.caramel, 1, 2)}
        {edge(230, 120, 200, 180)}
        {node(170, 60, 9, C.crema, Math.max(0.4, 1 - a * 0.2))}
        {sizeLabel(170, 60, Math.max(0.3, a))}
        {node(230, 120, 9, C.caramel, a)}
        {sizeLabel(230, 120, Math.max(0.3, a))}
        {node(200, 180, 6, C.crema, 0.4)}
      </g>
      <T x={30} y={270} s={13} f={C.latte} o={a}>two parents change, two sizes recompute</T>
    </Svg>
  );
}

// 8 · General rule: computable-from-children box vs needs-whole-subtree box
export function GeneralRule({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A box labelled 'computable from a node and its two children' beside a crossed-out box labelled 'needs the whole subtree'" h={280}>
      {fill(30, 50, 140, 60, C.caramel, Math.max(0.3, a))}
      <T x={40} y={75} s={12} f={C.crema} o={a}>from this node</T>
      <T x={40} y={92} s={12} f={C.crema} o={a}>and its two children</T>
      {fill(220, 50, 140, 60, C.taupe, 0.5)}
      <T x={230} y={75} s={12} f={C.cherry} o={a}>needs the whole</T>
      <T x={230} y={92} s={12} f={C.cherry} o={a}>subtree — too costly</T>
      <line x1={220} y1={45} x2={360} y2={115} stroke={C.cherry} strokeWidth={2} opacity={a} />
      <T x={30} y={200} s={13} f={C.latte} o={a}>size qualifies. survives a rotation for free.</T>
    </Svg>
  );
}

// 9 · Rank query: climbing up, accumulating left sizes from right turns
export function RankQuery({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A rank query climbing from a node up to the root, adding a left subtree's size at every right-child step" h={300}>
      {edge(170, 60, 230, 130, C.caramel, Math.max(0.4, a), 2)}
      {edge(230, 130, 200, 190, C.caramel, Math.max(0.4, a), 2)}
      {node(170, 60, 9, C.crema)}
      {sizeLabel(170, 60, 1)}
      {node(230, 130, 7, C.crema)}
      {sizeLabel(230, 130, 1)}
      {node(200, 190, 6, C.caramel, a)}
      <path d="M 200 185 Q 215 150 225 138" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      <T x={30} y={250} s={13} f={C.latte} o={a}>up from a right child: add the left side's size</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Two measured bar pairs: a select query's comparisons against tree height, and the number of sizes one rotation recomputes" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>select comparisons vs. tree height</T>
      {fill(30, 36, 180 * a, 16, C.caramel, Math.max(0.3, a))}
      {fill(30, 56, 180 * a, 16, C.latte, 0.6)}
      <T x={30} y={130} s={13} f={C.crema}>sizes recomputed by one rotation</T>
      {fill(30, 142, 20 * b, 14, C.caramel, Math.max(0.3, b))}
      {fill(30, 160, 220, 14, C.latte, 0.3)}
      <T x={30} y={220} s={13} f={C.latte}>tied to height, not a wider scan</T>
    </Svg>
  );
}
