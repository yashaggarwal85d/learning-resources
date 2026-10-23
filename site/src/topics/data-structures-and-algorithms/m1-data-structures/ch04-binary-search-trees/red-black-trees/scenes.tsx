import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a node's own key; latte = secondary labels; taupe = a
// null/empty child; caramel = the thing to look at (the violation, the rotation, the invariant
// being checked); cinnamon = the alternative being compared (a balanced height vs an unbalanced
// one); cherry = the bad outcome (a violated colour invariant, before the fix). Red/black rings
// use cherry (red ring) and a plain outline (black ring) per CHAPTER.md's "Colour invariants" rule.

function node(cx: number, cy: number, r: number, colour = C.crema, opacity = 1) {
  return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={colour} opacity={opacity} />;
}

function ring(cx: number, cy: number, r: number, red: boolean, opacity = 1) {
  return (
    <circle
      key={`${cx}-${cy}-ring`}
      cx={cx}
      cy={cy}
      r={r + 3}
      fill="none"
      stroke={red ? C.cherry : C.latte}
      strokeWidth={2.2}
      opacity={opacity}
    />
  );
}

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 0.6, width = 1.4) {
  return <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// 1 · Opening: topic 23's long chain fading, replaced by a short, colour-ringed tree
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A long degenerate chain of nodes fading, a short tree with red and black rings taking its place" h={300}>
      <T x={30} y={24} s={13} f={C.cherry}>before: one long chain</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          {i > 0 && edge(60, 40 + (i - 1) * 32, 60, 40 + i * 32, C.cherry, Math.max(0.2, 0.6 * (1 - a)))}
          {node(60, 40 + i * 32, 6, C.cherry, Math.max(0.15, 0.6 * (1 - a)))}
        </g>
      ))}
      <T x={200} y={24} s={13} f={C.crema} o={a}>now: short, colour-ringed</T>
      {edge(230, 60, 200, 110, C.latte, Math.max(0.3, a))}
      {edge(230, 60, 260, 110, C.latte, Math.max(0.3, a))}
      {node(230, 60, 9, C.crema, a)}
      {ring(230, 60, 9, false, a)}
      {node(200, 110, 7, C.crema, a)}
      {ring(200, 110, 7, true, a)}
      {node(260, 110, 7, C.crema, a)}
      {ring(260, 110, 7, true, a)}
      <T x={30} y={260} s={13} f={C.latte} o={a}>one rule stops the chain from ever forming</T>
    </Svg>
  );
}

// 2 · The five invariants, highlighted one at a time
export function FiveInvariants({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.1, 0.6));
  const a2 = easeOut(seg(t, 0.6, 1.1));
  const a3 = easeOut(seg(t, 1.1, 1.6));
  const a4 = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="A small red-black tree with its root, a red node, and equal black-depth paths highlighted in turn" h={300}>
      {edge(170, 50, 110, 110)}
      {edge(170, 50, 230, 110)}
      {edge(110, 110, 85, 170)}
      {edge(110, 110, 135, 170)}
      {node(170, 50, 10, C.crema, Math.max(0.5, a1))}
      {ring(170, 50, 10, false, Math.max(0.5, a1))}
      {node(110, 110, 8, C.crema, Math.max(0.5, a2))}
      {ring(110, 110, 8, true, Math.max(0.5, a2))}
      {node(230, 110, 8, C.crema)}
      {ring(230, 110, 8, false)}
      {node(85, 170, 6, C.crema)}
      {ring(85, 170, 6, false)}
      {node(135, 170, 6, C.crema)}
      {ring(135, 170, 6, false)}
      <T x={30} y={250} s={12} f={C.latte} o={a1}>the root: always black</T>
      <T x={30} y={268} s={12} f={C.latte} o={a2}>a red node: never a red child</T>
      <T x={30} y={286} s={12} f={C.latte} o={a3}>every path down: the same count of black nodes</T>
    </Svg>
  );
}

// 3 · Predict: two consecutive red nodes, what must happen?
export function ViolationPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A new red node landing directly below another red node, flagged" h={280}>
      {edge(170, 60, 110, 130)}
      {edge(110, 130, 90, 190, C.cherry, Math.max(0.5, pulse), 2.2)}
      {node(170, 60, 9, C.crema)}
      {ring(170, 60, 9, false)}
      {node(110, 130, 8, C.crema, pulse)}
      {ring(110, 130, 8, true, pulse)}
      {node(90, 190, 6, C.crema, pulse)}
      {ring(90, 190, 6, true, pulse)}
      {!answered && <T x={30} y={255} s={15} f={C.cherry} o={pulse}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={240} s={13} f={C.caramel}>recolour, and rotate only if recolouring can't fix it</T>
          <T x={30} y={262} s={13} f={C.latte}>the BST property never broke — this is a different rule</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Fix reveal: recolouring climbs, rotation ends it
export function FixReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="The two-red violation resolving: recolouring climbing up, then one rotation finishing the fix" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>recolour upward</T>
      {edge(170, 50, 110, 110, C.latte, Math.max(0.3, a))}
      {node(170, 50, 9, C.crema, Math.max(0.4, 1 - a * 0.3))}
      {ring(170, 50, 9, a < 0.5, Math.max(0.4, 1))}
      {node(110, 110, 7, C.crema)}
      {ring(110, 110, 7, false)}
      <T x={220} y={24} s={13} f={C.caramel} o={a}>one rotation, if that's not enough</T>
      {edge(260, 70, 230, 120, C.caramel, Math.max(0.3, a), 2)}
      {edge(260, 70, 290, 120, C.latte, Math.max(0.3, a))}
      {node(260, 70, 8, C.crema, a)}
      {ring(260, 70, 8, false, a)}
      {node(230, 120, 7, C.crema, a)}
      {ring(230, 120, 7, false, a)}
      {node(290, 120, 7, C.crema, a)}
      {ring(290, 120, 7, false, a)}
      <T x={30} y={270} s={13} f={C.latte} o={a}>recolouring is cheap and tried first</T>
    </Svg>
  );
}

// 5 · 2-3-4 encoding: a black node and its red children as one node
export function TwoThreeFourEncoding({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A black node with two red children circled together, redrawn beside it as a single 2-3-4 tree node" h={300}>
      {edge(110, 70, 70, 130)}
      {edge(110, 70, 150, 130)}
      {node(110, 70, 9, C.crema)}
      {ring(110, 70, 9, false)}
      {node(70, 130, 7, C.crema)}
      {ring(70, 130, 7, true)}
      {node(150, 130, 7, C.crema)}
      {ring(150, 130, 7, true)}
      <circle cx={110} cy={100} r={55} fill="none" stroke={C.caramel} strokeWidth={1.4} strokeDasharray="4 3" opacity={Math.max(0.3, a)} />
      <path d="M 170 100 L 230 100" stroke={C.latte} strokeWidth={1.4} opacity={a} markerEnd="url(#arrow)" />
      {fill(250, 85, 70, 30, C.caramel, Math.max(0.3, a))}
      <T x={255} y={105} s={12} f={C.crema} o={a}>one 2-3-4 node</T>
      <T x={30} y={270} s={13} f={C.latte} o={a}>a binary tree, pretending to be a wider one</T>
    </Svg>
  );
}

// 6 · Predict: the rotation bound across every insert/delete
export function RotationBoundPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A long sequence of inserts and deletes scrolling past, each one needing a fixup" h={280}>
      {Array.from({ length: 6 }, (_, i) => fill(20 + i * 42, 60, 30, 18, C.latte, 0.3 + 0.1 * i))}
      {fill(20 + 5 * 42, 60, 30, 18, C.caramel, pulse)}
      {!answered && <T x={30} y={200} s={15} f={C.caramel} o={pulse}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={190} s={13} f={C.caramel}>at most two for an insert, at most three for a delete</T>
          <T x={30} y={212} s={13} f={C.latte}>the recolouring climb can be long; the rotation never is</T>
        </>
      )}
    </Svg>
  );
}

// 7 · Rotation bound reveal: tall climb, constant-size rotation at the end
export function RotationBoundReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A tall, thin climb of recolouring with a single, fixed-size rotation glyph at its base" h={300}>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          {i > 0 && edge(80, 40 + (i - 1) * 28, 80, 40 + i * 28, C.latte, Math.max(0.3, a))}
          {node(80, 40 + i * 28, 6, C.crema, Math.max(0.3, a))}
        </g>
      ))}
      <T x={30} y={24} s={13} f={C.latte}>the climb: as tall as the tree</T>
      {node(220, 190, 9, C.crema, a)}
      {ring(220, 190, 9, false, a)}
      {node(190, 230, 7, C.crema, a)}
      {ring(190, 230, 7, false, a)}
      {node(250, 230, 7, C.crema, a)}
      {ring(250, 230, 7, false, a)}
      {edge(220, 190, 190, 230, C.caramel, Math.max(0.5, a), 2.2)}
      {edge(220, 190, 250, 230, C.caramel, Math.max(0.5, a), 2.2)}
      <T x={170} y={270} s={13} f={C.caramel} o={a}>the rotation: never taller than this</T>
    </Svg>
  );
}

// 8 · Height bound: this tree next to topic 23's long chain, same keys
export function HeightBound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="A short red-black tree next to a long degenerate chain, same keys, heights labelled" h={300}>
      <T x={30} y={24} s={13} f={C.crema}>red-black tree: short</T>
      {edge(90, 50, 60, 90)}
      {edge(90, 50, 120, 90)}
      {node(90, 50, 8, C.crema)}
      {ring(90, 50, 8, false)}
      {node(60, 90, 6, C.crema)}
      {ring(60, 90, 6, true)}
      {node(120, 90, 6, C.crema)}
      {ring(120, 90, 6, true)}
      <T x={200} y={24} s={13} f={C.cherry} o={a}>unbalanced BST: one long chain</T>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          {i > 0 && edge(200, 40 + (i - 1) * 32, 200, 40 + i * 32, C.cherry, Math.max(0.3, a))}
          {node(200, 40 + i * 32, 6, C.cherry, Math.max(0.3, a))}
        </g>
      ))}
      <T x={30} y={270} s={13} f={C.latte} o={a}>same worst-case order, wildly different height</T>
    </Svg>
  );
}

// 9 · Production uses
export function ProductionUses({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Three labelled icons for std::map, Java TreeMap, and Linux kernel subsystems, each beside a small red-black tree glyph" h={280}>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={Math.max(0.3, easeOut(seg(t, 0.2 * i, 0.2 * i + 0.6)))}>
          {node(60 + i * 110, 70, 10, C.crema)}
          {ring(60 + i * 110, 70, 10, i % 2 === 0, 1)}
        </g>
      ))}
      <T x={20} y={120} s={12} f={C.latte} o={a}>std::map</T>
      <T x={130} y={120} s={12} f={C.latte} o={a}>Java TreeMap</T>
      <T x={240} y={120} s={12} f={C.latte} o={a}>Linux kernel subsystems</T>
      <T x={30} y={260} s={13} f={C.crema} o={a}>the scheme actually running underneath each one</T>
    </Svg>
  );
}

// 10 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Two measured bar pairs: height of a red-black tree vs a plain BST under the same worst-case order, and the largest rotation count ever seen" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>height: red-black tree vs plain BST, same keys</T>
      {fill(30, 36, 20 * a, 16, C.caramel, Math.max(0.3, a))}
      {fill(30, 56, 220, 16, C.cherry, 0.6)}
      <T x={30} y={130} s={13} f={C.crema}>largest rotation count ever seen: insert and delete</T>
      {fill(30, 142, 40 * b, 14, C.caramel, Math.max(0.3, b))}
      {fill(30, 160, 40 * b, 14, C.caramel, Math.max(0.3, b))}
      <T x={30} y={220} s={13} f={C.latte}>both comfortably inside the sourced bound</T>
    </Svg>
  );
}
