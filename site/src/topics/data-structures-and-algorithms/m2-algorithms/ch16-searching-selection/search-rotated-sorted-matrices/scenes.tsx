import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16): crema = a candidate at rest; latte = secondary
// labels; taupe = the eliminated region; caramel = the thing to look at this beat (the
// sorted half, the current corner cell); cherry/cherryText = the bad outcome (duplicates
// degrading the search). This topic's own arrays/matrices (examples.py): the rotated
// array [4,5,6,7,0,1,2]; a 5x5 staircase matrix; a 3x4 row-major matrix.
const ROTATED = [4, 5, 6, 7, 0, 1, 2];
const STAIRCASE = [
  [1, 4, 7, 11, 15],
  [2, 5, 8, 12, 19],
  [3, 6, 9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30],
];

function Cell({ x, y, v, w = 44, color = C.crema, highlight = false }: { x: number; y: number; v: number | string; w?: number; color?: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={28} rx={3} fill="none" stroke={highlight ? C.caramel : color} strokeWidth={highlight ? 1.8 : 1.1} />
      <T x={x + w / 2} y={y + 19} s={13} f={highlight ? C.caramel : color} a="middle">{v}</T>
    </g>
  );
}

// 1 · Opening: a sorted array, cut and swapped.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A sorted array rotated at an unknown point, with the question of whether binary search still works" h={240}>
      {ROTATED.map((v, i) => <Cell key={i} x={40 + i * 60} y={70} v={v} highlight={i >= 4} />)}
      <T x={300} y={140} s={13} f={C.latte} a="middle" o={a}>sorted, then rotated — does binary search still work?</T>
      <T x={300} y={175} s={18} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>?</T>
    </Svg>
  );
}

// 2 · PredictRotated: which half is sorted, searching for 0.
export function PredictRotated({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="The rotated array split at its middle element, seven, with the question of which half is sorted" h={240}>
      {ROTATED.map((v, i) => <Cell key={i} x={40 + i * 60} y={70} v={v} highlight={i === 3} />)}
      <T x={40 + 1.5 * 60} y={130} s={12} f={C.latte} a="middle" o={a}>left half</T>
      <T x={40 + 5 * 60} y={130} s={12} f={C.latte} a="middle" o={a}>right half</T>
      {answer !== null && (
        <T x={300} y={170} s={14} f={C.crema} a="middle">left [4,5,6,7] is sorted — 0 is not in it, so search right</T>
      )}
    </Svg>
  );
}

// 3 · SortedHalf: the invariant, one comparison each.
export function SortedHalf({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  return (
    <Svg label="The rotated array with the sorted half coloured and the target range check drawn beside it" h={260}>
      {ROTATED.map((v, i) => <Cell key={i} x={40 + i * 60} y={60} v={v} highlight={i <= 3} />)}
      <T x={30} y={130} s={13} f={C.latte} o={a}>a[lo] ≤ a[mid] → the left half is sorted</T>
      <T x={30} y={156} s={13} f={C.crema} o={a}>is the target within [a[lo], a[mid])? one comparison, then recurse</T>
    </Svg>
  );
}

// 4 · RotationPoint: the same halving, a different predicate.
export function RotationPoint({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The rotated array with the minimum, zero, marked as the rotation point the same search locates" h={240}>
      {ROTATED.map((v, i) => <Cell key={i} x={40 + i * 60} y={70} v={v} highlight={i === 4} />)}
      <T x={40 + 4 * 60 + 22} y={130} s={12} f={C.caramel} a="middle" o={a}>rotation point</T>
      <T x={300} y={170} s={13} f={C.latte} a="middle" o={a}>search for the boundary where a[mid] &gt; a[hi] stops holding</T>
    </Svg>
  );
}

// 5 · Duplicates: an adversarial array, almost a full linear scan.
export function Duplicates({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const n = 18;
  return (
    <Svg label="A long row of identical values with one different value near the end, forcing nearly a full scan to find it" h={240}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={30 + i * 30} y={70} width={25} height={25} rx={2} fill="none" stroke={i === n - 2 ? C.cherry : C.quiet} strokeWidth={i === n - 2 ? 1.8 : 1} />
      ))}
      <T x={30 + (n - 2) * 30 + 12} y={60} s={11} f={C.cherryText} a="middle" o={a}>the one different value</T>
      <T x={300} y={140} s={13} f={C.latte} a="middle" o={a}>a[lo] == a[mid] == a[hi] → can't tell which half is sorted</T>
      <T x={300} y={166} s={13} f={C.cherryText} a="middle" o={a}>200 elements, 198 comparisons to find it</T>
    </Svg>
  );
}

// 6 · PredictStaircase: does binary search apply to a staircase matrix?
export function PredictStaircase({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A five by five matrix sorted along every row and column, with a question of whether one binary search covers it" h={260}>
      {STAIRCASE.map((row, r) => row.map((v, c) => (
        <Cell key={`${r}-${c}`} x={40 + c * 50} y={40 + r * 34} v={v} w={42} />
      )))}
      {answer !== null && (
        <T x={300} y={236} s={13} f={C.crema} a="middle" o={a}>no single monotone predicate covers the whole matrix</T>
      )}
    </Svg>
  );
}

// 7 · StaircaseWalk: corner walk, O(m+n).
export function StaircaseWalk({ t }: StepCtx) {
  const path = [[0, 4], [1, 4], [1, 3], [2, 3]];
  const idx = Math.min(path.length - 1, Math.floor(seg(t, 0.1, 1) * path.length));
  const [r, c] = path[idx];
  return (
    <Svg label="A walker starting at the top right corner of the staircase matrix, stepping left or down toward the target sixteen" h={260}>
      {STAIRCASE.map((row, rr) => row.map((v, cc) => (
        <Cell key={`${rr}-${cc}`} x={40 + cc * 50} y={40 + rr * 34} v={v} w={42} highlight={rr === r && cc === c} />
      )))}
      <T x={300} y={236} s={13} f={C.latte} a="middle">smaller than target → step left; bigger → step down</T>
    </Svg>
  );
}

// 8 · RowMajorContrast: a flattened matrix vs the staircase one.
export function RowMajorContrast({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const ROW_MAJOR = [1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60];
  return (
    <Svg label="A row-major matrix flattened into one ascending row, contrasted with the staircase matrix which cannot flatten the same way" h={260}>
      {ROW_MAJOR.map((v, i) => <Cell key={i} x={20 + i * 46} y={50} v={v} w={40} highlight={i === 6} />)}
      <T x={300} y={110} s={13} f={C.latte} a="middle" o={a}>row-major: one ascending sequence — ordinary binary search, O(log(mn))</T>
      <T x={300} y={150} s={13} f={C.cherryText} a="middle" o={a}>staircase: row 1 starts at 2, below row 0's last value 15 — not one sequence</T>
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const panels = [
    { l1: 'rotated array', l2: 'which half is sorted' },
    { l1: 'staircase matrix', l2: 'which direction shrinks' },
    { l1: 'row-major matrix', l2: 'one flattened order?' },
  ];
  return (
    <Svg label="Three panels recapping the topic: the rotated array, the staircase matrix, and the row-major matrix" h={260}>
      {panels.map((p, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25))}>
          <circle cx={100 + i * 200} cy={90} r={34} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={100 + i * 200} y={95} s={11} f={C.crema} a="middle">{p.l1}</T>
          <T x={100 + i * 200} y={150} s={13} f={C.latte} a="middle">{p.l2}</T>
        </g>
      ))}
      <T x={300} y={230} s={13} f={C.latte} a="middle">quickselect and median-of-medians, next</T>
    </Svg>
  );
}
