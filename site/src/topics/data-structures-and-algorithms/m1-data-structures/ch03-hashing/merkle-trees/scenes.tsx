import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the tree, the root-to-leaf path);
// cinnamon = the compared alternative (content-defined chunking); cherry = the one failure/cost
// frame (a mismatched root, a changed leaf, fixed-offset chunking's blast radius). At most two
// accents per step.

function node(cx: number, cy: number, r: number, colour = C.caramel, opacity = 1) {
  return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={colour} opacity={opacity} />;
}

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 0.6, width = 1.4) {
  return <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={width} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// A small, fixed 4-leaf tree layout reused across steps: leaves at y=220, two internal nodes at
// y=140, one root at y=60.
const LEAF_X = [60, 140, 220, 300];
const MID_X = [100, 260];
const ROOT_X = 180;

function treeSkeleton(leafColour = C.caramel, midColour = C.caramel, rootColour = C.caramel, opacities = [1, 1, 1, 1]) {
  return (
    <>
      {edge(LEAF_X[0], 220, MID_X[0], 140)}
      {edge(LEAF_X[1], 220, MID_X[0], 140)}
      {edge(LEAF_X[2], 220, MID_X[1], 140)}
      {edge(LEAF_X[3], 220, MID_X[1], 140)}
      {edge(MID_X[0], 140, ROOT_X, 60)}
      {edge(MID_X[1], 140, ROOT_X, 60)}
      {LEAF_X.map((x, i) => node(x, 220, 8, leafColour, opacities[i]))}
      {node(MID_X[0], 140, 9, midColour)}
      {node(MID_X[1], 140, 9, midColour)}
      {node(ROOT_X, 60, 11, rootColour)}
    </>
  );
}

// 1 · Opening: a ring dissolving into two side-by-side copies of the same data
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A ring of machines fading, two copies of the same data appearing side by side with a question mark between them" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>before: where does this key live?</T>
      <circle cx={170} cy={70} r={34} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={0.6 * (1 - a)} />
      <T x={30} y={200} s={13} f={C.caramel} o={a}>now: do these two copies even agree?</T>
      {fill(60, 220, 70, 46, C.caramel, a)}
      {fill(220, 220, 70, 46, C.caramel, a)}
      <T x={160} y={250} s={18} f={C.cherry} o={a}>?</T>
    </Svg>
  );
}

// 2 · Tree built: leaves rising into one root
export function TreeBuilt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="Four leaf hashes rising through two internal nodes into one root hash at the top" h={260}>
      {treeSkeleton(C.caramel, C.caramel, C.caramel, [a, a, a, a])}
      <T x={30} y={250} s={13} f={C.latte} o={a}>one root hash speaks for every leaf beneath it</T>
    </Svg>
  );
}

// 3 · Predict: do matching roots mean everything agrees?
export function RootMatchPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="Two complete trees side by side, both root hashes glowing the same colour, asking what that match proves" h={280}>
      <g transform="translate(-70,0) scale(0.75)">{treeSkeleton(C.caramel, C.caramel, C.caramel)}</g>
      <g transform="translate(260,0) scale(0.75)">{treeSkeleton(C.caramel, C.caramel, C.caramel)}</g>
      {node(180, 45, 10, C.cinnamon, pulse)}
      {!answered && <T x={30} y={255} s={15} f={C.caramel} o={pulse}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={240} s={13} f={C.caramel}>every leaf underneath is guaranteed identical</T>
          <T x={30} y={262} s={13} f={C.latte}>one comparison, as strong as comparing them all</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Root mismatch: the two roots now visibly differ
export function RootMismatch({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Two trees whose root hashes now differ, the mismatch highlighted at the top" h={280}>
      <g transform="translate(-70,0) scale(0.75)">{treeSkeleton(C.caramel, C.caramel, C.cherry)}</g>
      <g transform="translate(260,0) scale(0.75)">{treeSkeleton(C.caramel, C.caramel, C.caramel)}</g>
      <T x={30} y={255} s={13} f={C.cherry} o={a}>the roots disagree — but not yet where</T>
    </Svg>
  );
}

// 5 · Predict: how many hashes to find the one changed leaf?
export function WalkDownPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="A tree with its root mismatched, asking how many hashes must be checked to find the one leaf that changed" h={280}>
      {treeSkeleton(C.caramel, C.caramel, C.cherry, [1, 1, pulse, 1])}
      {!answered && <T x={30} y={255} s={15} f={C.caramel} o={pulse}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={240} s={13} f={C.caramel}>only the one path from root to leaf — about log n</T>
          <T x={30} y={262} s={13} f={C.latte}>every sibling path stays untouched</T>
        </>
      )}
    </Svg>
  );
}

// 6 · Proof path: the one disagreeing path re-lit level by level
export function ProofPath({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.1, 0.6));
  const a2 = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="The one root-to-leaf path re-lit level by level as the walk proceeds, every sibling path left untouched" h={280}>
      {edge(LEAF_X[0], 220, MID_X[0], 140, C.latte, 0.3)}
      {edge(LEAF_X[1], 220, MID_X[0], 140, C.latte, 0.3)}
      {edge(LEAF_X[3], 220, MID_X[1], 140, C.latte, 0.3)}
      {edge(MID_X[0], 140, ROOT_X, 60, C.latte, 0.3)}
      {edge(LEAF_X[2], 220, MID_X[1], 140, C.cherry, 1, 3 * a1)}
      {edge(MID_X[1], 140, ROOT_X, 60, C.cherry, 1, 3 * a2)}
      {node(LEAF_X[0], 220, 8, C.crema, 0.4)}
      {node(LEAF_X[1], 220, 8, C.crema, 0.4)}
      {node(LEAF_X[3], 220, 8, C.crema, 0.4)}
      {node(LEAF_X[2], 220, 9, C.cherry)}
      {node(MID_X[0], 140, 9, C.crema, 0.4)}
      {node(MID_X[1], 140, 10, C.cherry, Math.max(0.4, a1))}
      {node(ROOT_X, 60, 12, C.cherry, Math.max(0.4, a2))}
      <T x={30} y={255} s={13} f={C.latte} o={Math.max(a1, a2)}>one branch down, level by level, to the exact leaf</T>
    </Svg>
  );
}

// 7 · Production uses: three small labelled icons
export function ProductionUses({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="Three small hash-tree icons labelled database repair, version-control history, and a certificate log" h={280}>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${40 + i * 110},40) scale(0.5)`}>
          {treeSkeleton(C.caramel, C.caramel, C.caramel, [a, a, a, a])}
        </g>
      ))}
      <T x={40} y={190} s={12} f={C.latte} o={a}>database repair</T>
      <T x={150} y={190} s={12} f={C.latte} o={a}>version control</T>
      <T x={260} y={190} s={12} f={C.latte} o={a}>certificate log</T>
      <T x={30} y={230} s={13} f={C.caramel} o={a}>three systems, one tree</T>
    </Svg>
  );
}

// 8 · Content-defined chunking vs fixed-offset
export function ContentDefinedChunking({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="The same data stream split two ways: fixed-offset chunks all shifting after one edit, content-defined chunks with only the nearby one shifting" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>fixed-offset: every boundary after the edit shifts</T>
      {Array.from({ length: 8 }, (_, i) => fill(30 + i * 36, 36, 30, 18, i < 2 ? C.caramel : C.cherry, Math.max(0.3, a)))}
      <T x={30} y={150} s={13} f={C.latte}>content-defined: only the one nearby chunk shifts</T>
      {Array.from({ length: 8 }, (_, i) => fill(30 + i * 36, 162, 30 + (i % 3) * 6, 18, i === 2 ? C.cinnamon : C.caramel, Math.max(0.3, a)))}
      <T x={30} y={260} s={13} f={C.caramel} o={a}>boundaries set by content, not a byte count</T>
    </Svg>
  );
}

// 9 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Two measured bar pairs: hashes checked finding one changed leaf, and chunks reshaped by one edit" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>finding one changed leaf: a walk checks far fewer hashes</T>
      {fill(30, 36, 220, 16, C.cherry, 0.6)}
      {fill(30, 56, 40 * a, 16, C.caramel, Math.max(0.3, a))}
      <T x={30} y={120} s={13} f={C.crema}>one edit: fixed-offset vs content-defined chunking</T>
      {fill(30, 132, 220 * b, 16, C.cherry, Math.max(0.3, b))}
      {fill(30, 152, 6, 16, C.caramel, Math.max(0.3, b))}
      <T x={30} y={220} s={13} f={C.latte}>both measured, on the same tree and the same stream</T>
    </Svg>
  );
}
