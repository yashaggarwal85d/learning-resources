import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's own): crema = a decision already made (a queen
// placed, a digit written, an edge to a visited node); latte = secondary labels (depth, node
// count, a candidate set); taupe = the part of the tree or board not yet visited; caramel = the
// thing to look at: the node being expanded and the path from the root to it; cinnamon (rare) =
// the alternative being compared, always the smarter search against the plainer one; cherry with
// cherryText = the bad outcome: a dead end, drawn at the moment the branch is abandoned.

function nodeDot(x: number, y: number, r = 7, colour: string = C.taupe, filled = false) {
  return <circle cx={x} cy={y} r={r} fill={filled ? colour : 'none'} stroke={colour} strokeWidth={1.6} />;
}

function edge(x1: number, y1: number, x2: number, y2: number, colour: string = C.taupe, thick = false) {
  return <path d={`M${x1} ${y1} L${x2} ${y2}`} stroke={colour} strokeWidth={thick ? 2.4 : 1.2} fill="none" />;
}

function board(cx: number, cy: number, n: number, cell: number, queens: number[] = []) {
  const half = (n * cell) / 2;
  const cells = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const x = cx - half + c * cell;
      const y = cy - half + r * cell;
      cells.push(<rect key={`${r}-${c}`} x={x} y={y} width={cell} height={cell} fill={(r + c) % 2 === 0 ? C.roast : C.panel} stroke={C.mocha} strokeWidth={0.5} />);
    }
  }
  const marks = queens.map((c, r) =>
    c < 0 ? null : (
      <circle key={`q${r}`} cx={cx - half + c * cell + cell / 2} cy={cy - half + r * cell + cell / 2} r={cell * 0.32} fill={C.crema} />
    ),
  );
  return (
    <g>
      {cells}
      {marks}
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Eight queens: four billion placements, ninety-two right, two thousand fifty-seven calls" h={300}>
      <g opacity={a}>{board(300, 140, 8, 15, [3, 0, 4, 7, 1, 6, 2, 5])}</g>
      <g opacity={b}>
        <T x={300} y={265} s={13} a="middle" f={C.cinnamon}>test them all: four billion checks</T>
        <T x={300} y={288} s={13} a="middle" f={C.caramel}>this search: two thousand fifty-seven calls</T>
      </g>
    </Svg>
  );
}

// 2 · Enumeration trees
export function EnumerationTrees({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const b = easeOut(seg(t, 1.5, 2.6));
  const c = easeOut(seg(t, 2.7, 3.6));
  function miniTree(cx: number, label: string, leaves: number, colour: string) {
    const xs = Array.from({ length: Math.min(leaves, 8) }, (_, i) => cx - 60 + (i * 120) / Math.max(1, Math.min(leaves, 8) - 1));
    return (
      <g>
        {nodeDot(cx, 40, 8, colour)}
        {xs.map((x, i) => (
          <g key={i}>
            {edge(cx, 47, x, 90, colour)}
            {nodeDot(x, 90, 5, colour)}
          </g>
        ))}
        <T x={cx} y={118} s={12} a="middle" f={C.latte}>{label}</T>
      </g>
    );
  }
  return (
    <Svg label="Choose, explore, undo: subsets, permutations, combinations of the same four elements" h={200}>
      <g opacity={a}>{miniTree(100, 'subsets', 16, C.caramel)}</g>
      <g opacity={b}>{miniTree(300, 'permutations', 24, C.crema)}</g>
      <g opacity={c}>{miniTree(500, 'combinations', 6, C.cinnamon)}</g>
      <T x={300} y={170} s={12} a="middle" f={C.latte}>sixteen, twenty-four, and six leaves</T>
    </Svg>
  );
}

// 3 · Unpruned progression
export function UnprunedProgression({ t }: StepCtx) {
  const n = Math.min(3, Math.floor(seg(t, 0.2, 2.8) * 4));
  const STAGES = [
    { label: 'every placement', w: 560, colour: C.cinnamon },
    { label: 'one per row', w: 210, colour: C.cinnamon },
    { label: 'no shared column', w: 50, colour: C.latte },
    { label: 'the first prune', w: 14, colour: C.caramel },
  ];
  return (
    <Svg label="Four billion, to sixteen million, to forty thousand three hundred twenty, then the first prune" h={260}>
      {STAGES.map((s, i) => (
        <g key={i} opacity={i <= n ? 1 : 0.15}>
          <rect x={20} y={40 + i * 55} width={s.w} height={28} fill="none" stroke={s.colour} strokeWidth={1.8} />
          <T x={30} y={40 + i * 55 + 19} s={12} f={s.colour}>{s.label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 4 · Predict node count
export function PredictNodeCount({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="How many nodes does the pruned four-queens search actually visit" h={280}>
      <g opacity={a}>{board(300, 110, 4, 22, [1, 3, 0, 2])}</g>
      <T x={300} y={220} s={13} a="middle" f={C.cinnamon}>seventeen, twenty-four, or two fifty-six?</T>
      <T x={300} y={245} s={12} a="middle" f={C.latte}>a prune removes a subtree, not one leaf</T>
    </Svg>
  );
}

// 5 · Pruned tree
export function PrunedTree({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Four queens: seventeen nodes, two solutions. Eight queens: two thousand fifty-seven calls" h={300}>
      <g opacity={a}>
        {board(300, 110, 4, 20, [1, 3, 0, 2])}
        <T x={300} y={200} s={13} a="middle" f={C.caramel}>n = 4: seventeen nodes, two solutions</T>
      </g>
      <g opacity={b}>
        <T x={300} y={240} s={13} a="middle" f={C.caramel}>n = 8: two thousand fifty-seven calls</T>
        <T x={300} y={263} s={13} a="middle" f={C.latte}>ninety-two solutions, first after 114</T>
      </g>
    </Svg>
  );
}

// 6 · Unsound prune
export function UnsoundPrune({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Node counts grow unevenly; an unsound edge-avoiding prune loses every solution" h={300}>
      <g opacity={a}>
        {board(300, 120, 8, 15, [0, 6, 4, 7, 1, 3, 5, 2])}
        <T x={300} y={225} s={12} a="middle" f={C.cherryText}>queen refused near the edge</T>
      </g>
      <g opacity={b}>
        <T x={300} y={255} s={12} a="middle" f={C.latte}>first solution: eight then twelve queens</T>
        <T x={300} y={278} s={12} a="middle" f={C.cherryText}>unsound prune: zero of ninety-two survive</T>
      </g>
    </Svg>
  );
}

// 7 · Sudoku grid
export function SudokuGrid({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const cell = 20;
  const cx = 300, cy = 130;
  const half = (9 * cell) / 2;
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const x = cx - half + c * cell, y = cy - half + r * cell;
      const box = Math.floor(r / 3) + Math.floor(c / 3);
      cells.push(<rect key={`${r}-${c}`} x={x} y={y} width={cell} height={cell} fill={box % 2 === 0 ? C.roast : C.panel} stroke={C.mocha} strokeWidth={0.5} />);
    }
  }
  const peerCells: Array<[number, number]> = [];
  for (let c = 0; c < 9; c++) if (c !== 1) peerCells.push([4, c]);
  for (let r = 0; r < 9; r++) if (r !== 4) peerCells.push([r, 1]);
  const peers = peerCells.map(([r, c], i) => (
    <rect key={i} x={cx - half + c * cell} y={cy - half + r * cell} width={cell} height={cell} fill={C.cocoa} opacity={0.7} />
  ));
  return (
    <Svg label="Eighty-one squares, twenty-seven units, twenty peers per square" h={280}>
      {cells}
      <g opacity={a}>{peers}</g>
      <rect x={cx - half + cell} y={cy - half + 4 * cell} width={cell} height={cell} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={300} y={225} s={13} a="middle" f={C.caramel}>one square, twenty peers highlighted</T>
    </Svg>
  );
}

// 8 · Constraint propagation
export function ConstraintPropagation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Two propagation rules reach a fixed point; sixty-one squares still remain uncertain" h={280}>
      <g opacity={a}>
        <T x={300} y={50} s={13} a="middle" f={C.caramel}>rule one: clear a decided peer's digit</T>
        <T x={300} y={78} s={13} a="middle" f={C.caramel}>rule two: a unit's last place gets it</T>
      </g>
      <g opacity={b}>
        <rect x={60} y={140} width={480} height={30} fill="none" stroke={C.latte} strokeWidth={1.6} />
        <rect x={60} y={140} width={480 * (20 / 64)} height={30} fill={C.crema} />
        <T x={300} y={195} s={13} a="middle" f={C.latte}>twenty decided, sixty-one uncertain</T>
        <T x={300} y={222} s={12} a="middle" f={C.cherryText}>over 4.6e38 combinations remain</T>
      </g>
    </Svg>
  );
}

// 9 · Search plus propagation
export function SearchPlusPropagation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  const positions = [80, 140, 200, 260, 320, 380, 440, 500, 560];
  return (
    <Svg label="Branch, propagate, recurse: solved after twenty-five possibilities, nine squares branched" h={240}>
      <g opacity={a}>
        {positions.map((x, i) => (
          <g key={i}>
            {nodeDot(x, 100, 6, i < positions.length - 1 ? C.caramel : C.taupe)}
            {i > 0 && edge(positions[i - 1], 100, x, 100, C.caramel)}
          </g>
        ))}
      </g>
      <T x={300} y={160} s={13} a="middle" f={C.latte}>nine squares branched, twenty-five tried</T>
      <T x={300} y={185} s={13} a="middle" f={C.caramel}>propagation does the rest</T>
    </Svg>
  );
}

// 10 · Predict ordering
export function PredictOrdering({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Does branching order matter at all, once propagation is already running" h={240}>
      <g opacity={a}>
        <T x={150} y={100} s={12} a="middle" f={C.cinnamon}>first empty square</T>
        <T x={450} y={100} s={12} a="middle" f={C.caramel}>fewest candidates</T>
      </g>
      <T x={300} y={190} s={13} a="middle" f={C.latte}>which order actually wins?</T>
    </Svg>
  );
}

// 11 · Ordering measured
export function OrderingMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="First empty: unsolved after three million placements. Fewest candidates: solved after 481" h={260}>
      <g opacity={a}>
        <rect x={60} y={60} width={480} height={28} fill={C.cinnamon} />
        <T x={300} y={110} s={12} a="middle" f={C.cinnamon}>first empty: three million, unsolved</T>
      </g>
      <g opacity={b}>
        <rect x={60} y={150} width={4} height={28} fill={C.caramel} />
        <T x={300} y={200} s={12} a="middle" f={C.caramel}>fewest candidates: 481, solved</T>
      </g>
    </Svg>
  );
}

// 12 · Heavy tail
export function HeavyTail({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const dots = Array.from({ length: 30 }, (_, i) => i);
  return (
    <Svg label="Norvig's own runs split fast and slow; this topic's own run shows the same shape, smaller" h={260}>
      <g opacity={a}>
        {dots.map((i) => (
          <circle key={i} cx={40 + i * 17} cy={i < 27 ? 80 : 60} r={4} fill={i < 27 ? C.crema : C.cherryText} />
        ))}
        <T x={300} y={115} s={12} a="middle" f={C.latte}>twenty-seven fast, three near 190s</T>
      </g>
      <g opacity={b}>
        <T x={300} y={160} s={12} a="middle" f={C.caramel}>this topic's own thirty seeds: same shape</T>
      </g>
    </Svg>
  );
}

// 13 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="The tree is the algorithm; pruning and branching decide its size. Two pointers, next" h={240}>
      <g opacity={a}>
        <T x={300} y={90} s={13} a="middle" f={C.caramel}>pruning and branching decide tree size</T>
      </g>
      <g opacity={b}>
        <T x={300} y={120} s={13} a="middle" f={C.latte}>next: one linear pass, no tree</T>
      </g>
      <T x={300} y={190} s={13} a="middle" f={C.latte}>two pointers, next</T>
    </Svg>
  );
}
