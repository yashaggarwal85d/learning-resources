import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16's own): crema = a candidate at rest; latte = secondary labels; taupe = the
// eliminated region; caramel = the thing to look at this beat (mid, the sorted half, the corner); cinnamon (rare) =
// the second structure beside the first; cherryText = the bad outcome (the duplicate trap, the broken order).
// Every printed number is examples.py's (its prints, asserts or input data): [0, 1, 2, 4, 5, 6, 7] rotated to [4, 5,
// 6, 7, 0, 1, 2]; 0 found at index 4 in 3 comparisons; rotation point index 4, value 0; 200 keys, all 1 but a 2 at 198,
// found in 198 comparisons against 6 on a clean rotation; the staircase matrix, 16 at (2, 3) in 4 steps; the row-major
// matrix, 16 at (1, 2) in 3 comparisons. Traces run here by examples.py's own loops.

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

const BASE = [0, 1, 2, 4, 5, 6, 7];
const ROT = [4, 5, 6, 7, 0, 1, 2];
const STAIR = [
  [1, 4, 7, 11, 15],
  [2, 5, 8, 12, 19],
  [3, 6, 9, 16, 22],
  [10, 13, 14, 17, 24],
  [18, 21, 23, 26, 30],
];
const ROWMAJ = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
];
const X = (i: number) => 70 + i * 66;

function Cell({ x, y, v, c = C.crema, o = 1, w = 50, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={28} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 19} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

function Br({ a, b, y, c, o = 1, label }: { a: number; b: number; y: number; c: string; o?: number; label?: string }) {
  return (
    <g opacity={o}>
      <path d={`M${X(a)} ${y - 6} L${X(a)} ${y} L${X(b) + 50} ${y} L${X(b) + 50} ${y - 6}`} fill="none" stroke={c} strokeWidth={1.5} />
      {label && <T x={(X(a) + X(b) + 50) / 2} y={y + 18} s={12} a="middle" f={c}>{label}</T>}
    </g>
  );
}

/** examples.py's search_rotated(ROT, 0): one frame per comparison. */
const SEARCH: { lo: number; hi: number; mid: number; leftSorted: boolean; goLeft: boolean | null }[] = (() => {
  let lo = 0;
  let hi = ROT.length - 1;
  const out: { lo: number; hi: number; mid: number; leftSorted: boolean; goLeft: boolean | null }[] = [];
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (ROT[mid] === 0) {
      out.push({ lo, hi, mid, leftSorted: ROT[lo] <= ROT[mid], goLeft: null });
      break;
    }
    const leftSorted = ROT[lo] <= ROT[mid];
    const goLeft = leftSorted ? ROT[lo] <= 0 && 0 < ROT[mid] : !(ROT[mid] < 0 && 0 <= ROT[hi]);
    out.push({ lo, hi, mid, leftSorted, goLeft });
    if (goLeft) hi = mid - 1;
    else lo = mid + 1;
  }
  return out;
})();

// 1 · Opening. The sorted row; a cut falls after 2 and the two pieces swap places: [4, 5, 6, 7, 0, 1, 2]. Each piece
// stays in order; a seam marks where they meet.
export function Opening({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.8, 1.8));
  const lift = Math.sin(sw * Math.PI) * 30;
  return (
    <Svg label="The sorted row 0, 1, 2, 4, 5, 6, 7 is cut after 2 and the two pieces swap places: 4, 5, 6, 7, 0, 1, 2. Each piece is still in order; a seam marks where they meet" h={220}>
      {BASE.map((v, i) => {
        const to = ROT.indexOf(v);
        const first = i < 3;
        return <Cell key={v} x={lerp(X(i), X(to), sw)} y={70 + (first ? lift : -lift)} v={v} c={first ? C.cinnamon : C.crema} />;
      })}
      <path d={`M${X(2) + 58} 52 L${X(2) + 58} 116`} stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.3, 0.7)) * (1 - sw)} />
      <path d={`M${X(4) - 8} 52 L${X(4) - 8} 116`} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.9, 2.2))} />
      <Br a={0} b={3} y={130} c={C.crema} o={easeOut(seg(t, 2.1, 2.4))} label="in order" />
      <Br a={4} b={6} y={130} c={C.cinnamon} o={easeOut(seg(t, 2.3, 2.6))} label="in order" />
      <T x={300} y={200} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>binary search still works</T>
    </Svg>
  );
}

// 2 · Predict. [4, 5, 6, 7, 0, 1, 2], target 0; a line drops through the middle, 7, pulsing. After answering: the left
// half 4 to 7 is bracketed sorted; 0 is not in 4..7, so an arrow jumps to the right half.
export function PredictRotated({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const brk = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const jump = answered ? easeInOut(seg(s, 0.9, 1.5)) : 0;
  return (
    <Svg label="4, 5, 6, 7, 0, 1, 2, searching for 0, with a line through the middle element 7. After answering: the left half 4 to 7 is sorted, 0 is not inside it, so the search goes right" h={240}>
      <T x={70} y={30} s={12} f={C.latte}>target 0</T>
      {ROT.map((v, i) => (
        <Cell key={i} x={X(i)} y={60} v={v} c={i === 3 ? C.caramel : answered && i > 3 && jump > 0.5 ? C.crema : answered && i <= 3 ? C.latte : C.crema} />
      ))}
      <path d={`M${X(3) + 25} 48 L${X(3) + 25} 100`} stroke={C.caramel} strokeWidth={1.6} opacity={answered ? 1 : pulse} />
      {answered && <Br a={0} b={3} y={110} c={C.caramel} o={brk} label="sorted: 4..7, no 0 here" />}
      {answered && <path d={`M${X(1) + 25} 150 Q${X(3) + 25} ${150 + 40 * jump} ${lerp(X(1) + 25, X(5) + 25, jump)} 150`} fill="none" stroke={C.cinnamon} strokeWidth={1.6} opacity={jump > 0 ? 1 : 0} />}
      {!answered && <T x={300} y={200} s={14} a="middle" f={C.caramel} o={pulse}>which half is sorted?</T>}
      {answered && <T x={300} y={214} s={13} a="middle" f={C.cinnamon} o={easeOut(seg(s, 1.4, 1.8))}>go right</T>}
    </Svg>
  );
}

// 3 · The sorted half, every step. The search for 0 plays: lo, mid and hi; a[lo] against a[mid] brackets the sorted
// half; one comparison decides whether 0 sits inside it; the range jumps. Found at index 4 after 3 comparisons.
export function SortedHalf({ t }: StepCtx) {
  const per = 1.1;
  const k = clamp((t - 0.3) / per, 0, SEARCH.length - 0.01);
  const i = Math.floor(k);
  const f = k - i;
  const st = SEARCH[i];
  const found = st.goLeft === null && f > 0.3;
  return (
    <Svg label="Searching 4, 5, 6, 7, 0, 1, 2 for 0: at each midpoint, a[lo] against a[mid] shows which half is sorted, one more comparison shows whether 0 lies inside it, and the search moves; 0 is found at index 4 after 3 comparisons" h={260}>
      {ROT.map((v, j) => (
        <Cell key={j} x={X(j)} y={60} v={v} c={j === st.mid ? C.caramel : j >= st.lo && j <= st.hi ? C.crema : C.taupe} o={j >= st.lo && j <= st.hi ? 1 : 0.35} fill={found && j === st.mid} />
      ))}
      {[
        ['lo', st.lo],
        ['mid', st.mid],
        ['hi', st.hi],
      ].map(([l, j], n) => (
        <T key={l as string} x={X(j as number) + 25} y={n === 1 ? 46 : 112} s={12} a="middle" f={n === 1 ? C.caramel : C.latte} o={l === 'hi' && st.hi === st.mid ? 0 : 1}>{l as string}</T>
      ))}
      {!found && (
        <g opacity={easeOut(clamp((f - 0.2) / 0.2, 0, 1))}>
          {st.leftSorted ? <Br a={st.lo} b={st.mid} y={130} c={C.caramel} /> : <Br a={st.mid} b={st.hi} y={130} c={C.caramel} />}
          <T x={70} y={164} s={12} f={C.caramel}>sorted half: {st.leftSorted ? 'left' : 'right'}</T>
          <T x={70} y={188} s={12} f={st.goLeft ? C.crema : C.cinnamon} o={easeOut(clamp((f - 0.5) / 0.2, 0, 1))}>0 {st.goLeft ? 'inside it: go left' : 'not inside it: go right'}</T>
        </g>
      )}
      <T x={70} y={236} s={13} f={C.caramel} o={found ? 1 : 0}>found at index 4: 3 comparisons</T>
    </Svg>
  );
}

// 4 · The rotation point. The same loop, a different test: a[mid] > a[hi]? lo and hi close in: 7 > 2 sends lo past
// mid; 1 and then 0 are not bigger than a[hi], so hi falls; they meet at index 4, value 0, the minimum.
export function RotationPoint({ t }: StepCtx) {
  const FR = [
    { lo: 0, hi: 6, mid: -1 },
    { lo: 4, hi: 6, mid: 3 },
    { lo: 4, hi: 5, mid: 5 },
    { lo: 4, hi: 4, mid: 4 },
  ];
  const k = clamp((t - 0.4) / 0.85, 0, 3);
  const i0 = Math.floor(k);
  const i1 = Math.min(i0 + 1, 3);
  const f = easeInOut(clamp((k - i0 - 0.5) / 0.5, 0, 1));
  const lo = lerp(FR[i0].lo, FR[i1].lo, f);
  const hi = lerp(FR[i0].hi, FR[i1].hi, f);
  const mid = i1 > i0 ? FR[i1].mid : -1;
  const done = k >= 3;
  return (
    <Svg label="Finding the rotation point of 4, 5, 6, 7, 0, 1, 2: the test is a[mid] greater than a[hi]. 7 is greater than 2, so lo moves past it; 1 and 0 are not greater, so hi comes down; lo and hi meet at index 4, value 0, the minimum" h={240}>
      <T x={70} y={26} s={12} f={C.latte}>test: a[mid] &gt; a[hi]?</T>
      {ROT.map((v, j) => (
        <Cell key={j} x={X(j)} y={60} v={v} c={done && j === 4 ? C.caramel : j === mid ? C.caramel : j >= lo - 0.01 && j <= hi + 0.01 ? C.crema : C.taupe} o={j >= lo - 0.01 && j <= hi + 0.01 ? 1 : 0.35} fill={done && j === 4} />
      ))}
      <path d={`M${X(lo) + 25} 100 l-5 9 l10 0 z`} fill={C.crema} />
      <T x={X(lo) + 25} y={124} s={12} a="middle" f={C.crema}>lo</T>
      <path d={`M${X(hi) + 25} 100 l-5 9 l10 0 z`} fill={C.latte} opacity={Math.abs(hi - lo) < 0.3 ? 0 : 1} />
      <T x={X(hi) + 25} y={124} s={12} a="middle" f={C.latte} o={Math.abs(hi - lo) < 0.3 ? 0 : 1}>hi</T>
      {mid >= 0 && !done && (
        <T x={70} y={170} s={12} f={ROT[mid] > ROT[FR[i0].hi] ? C.cinnamon : C.crema}>
          {ROT[mid]} &gt; {ROT[FR[i0].hi]}? {ROT[mid] > ROT[FR[i0].hi] ? 'yes: lo = mid + 1' : 'no: hi = mid'}
        </T>
      )}
      <T x={70} y={210} s={13} f={C.caramel} o={done ? 1 : 0}>rotation point: index 4, value 0</T>
    </Svg>
  );
}

// 5 · Duplicates. Two hundred bars, all 1 but a single 2 near the end. a[lo], a[mid], a[hi] all equal: lo can only creep
// one step at a time, the eliminated bars greying out one by one, to the 2 at 198: 198 comparisons. Beside it, a clean
// rotation of 200 keys: 6 hops.
export function Duplicates({ t }: StepCtx) {
  const N = 200;
  const P = (i: number) => 40 + i * 2.6;
  const lo = clamp((t - 0.4) / 3.0, 0, 1) * 198;
  const hop = clamp((t - 0.6) / 1.8, 0, 1) * 6;
  const HOPS = [0.5, 0.25, 0.375, 0.3125, 0.34375, 0.328125];
  return (
    <Svg label="Two hundred keys, all 1 except a 2 at index 198. With a[lo], a[mid] and a[hi] equal the search can only shrink by one, so lo creeps across almost the whole array: 198 comparisons. A clean rotation of 200 keys takes 6" h={270}>
      <T x={40} y={24} s={12} f={C.latte}>200 keys: all 1, one 2</T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={P(i)} y={i === 198 ? 44 : 56} width={1.8} height={i === 198 ? 30 : 18} fill={i === 198 ? C.caramel : C.crema} opacity={i < lo ? 0.15 : 0.8} />
      ))}
      <path d={`M${P(lo)} 82 l-5 9 l10 0 z`} fill={C.cherryText} />
      <T x={40} y={118} s={12} f={C.cherryText} o={easeOut(seg(t, 0.8, 1.2))}>lo, mid, hi all equal: shrink by one</T>
      <T x={40} y={142} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>found at 198: 198 comparisons</T>
      <T x={40} y={192} s={12} f={C.crema} o={easeOut(seg(t, 0.5, 0.9))}>clean rotation, 200 keys</T>
      <rect x={40} y={202} width={520} height={14} rx={2} fill="none" stroke={C.latte} strokeWidth={1.1} />
      {HOPS.map((h, i) => (
        <circle key={i} cx={40 + h * 520} cy={209} r={4.5} fill={C.caramel} opacity={clamp(hop - i, 0, 1)} />
      ))}
      <T x={40} y={244} s={12} f={C.caramel} o={easeOut(seg(t, 2.4, 2.8))}>6 comparisons</T>
    </Svg>
  );
}

// 6 · Predict. The staircase matrix; arrows run along every row and down every column. Then the matrix unrolls into one
// long strip, with a question. After answering: the strip's break lights red, 15 then 2: no single sorted order.
const SX = (c: number) => 130 + c * 56;
const SY = (r: number) => 20 + r * 34;
export function PredictStaircase({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const arrows = easeOut(seg(t, 0.2, 0.7));
  const brk = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const FLAT = STAIR.flat().slice(0, 10);
  return (
    <Svg label="A matrix sorted along every row and down every column. Read row by row it is not one sorted sequence: after answering, the step from 15 at the end of the first row to 2 at the start of the second lights up" h={260}>
      {STAIR.map((row, r) => row.map((v, c) => <Cell key={`${r}-${c}`} x={SX(c)} y={SY(r)} v={v} w={46} c={C.crema} />))}
      <path d={`M${SX(0)} 196 L${SX(4) + 46} 196`} stroke={C.caramel} strokeWidth={1.4} opacity={arrows} />
      <path d={`M${SX(4) + 40} 191 l6 5 l-6 5`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={arrows} />
      <path d={`M108 ${SY(0)} L108 ${SY(4) + 28}`} stroke={C.caramel} strokeWidth={1.4} opacity={arrows} />
      <path d={`M103 ${SY(4) + 22} l5 6 l5 -6`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={arrows} />
      {FLAT.map((v, i) => (
        <Cell key={i} x={40 + i * 52} y={214} v={v} w={44} c={answered && (i === 4 || i === 5) ? C.cherryText : C.latte} o={easeOut(seg(t, 0.8 + i * 0.05, 1.1 + i * 0.05))} />
      ))}
      {answered && <path d={`M${40 + 4 * 52 + 44} 228 L${40 + 5 * 52} 228`} stroke={C.cherryText} strokeWidth={2.4} opacity={brk} />}
      {!answered && <T x={570} y={110} s={13} a="end" f={C.caramel} o={pulse}>one boundary?</T>}
      {answered && <T x={570} y={110} s={13} a="end" f={C.cherryText} o={brk}>15, then 2: no</T>}
    </Svg>
  );
}

// 7 · The staircase walk. From the top-right corner, searching 16: 15 is smaller, so its whole row drops away; 19 is
// bigger, its whole column drops; 12 smaller, its row drops; 16, found at (2, 3), after 4 steps.
export function StaircaseWalk({ t }: StepCtx) {
  const PATH: [number, number][] = [
    [0, 4],
    [1, 4],
    [1, 3],
    [2, 3],
  ];
  const k = clamp((t - 0.4) / 0.85, 0, 3);
  const n = Math.floor(k);
  const f = easeInOut(clamp((k - n - 0.4) / 0.6, 0, 1));
  const goneRows = new Set<number>();
  const goneCols = new Set<number>();
  for (let i = 0; i < n; i++) {
    const [r, c] = PATH[i];
    if (STAIR[r][c] < 16) goneRows.add(r);
    else goneCols.add(c);
  }
  const [r0, c0] = PATH[n];
  const [r1, c1] = PATH[Math.min(n + 1, 3)];
  const cx = lerp(SX(c0), SX(c1), f);
  const cy = lerp(SY(r0), SY(r1), f);
  const done = k >= 3;
  return (
    <Svg label="Searching the staircase matrix for 16 from the top-right corner: 15 is smaller so its row is dropped and the walk steps down; 19 is bigger so its column is dropped and the walk steps left; 12 is smaller, down again; 16 is found at row 2, column 3, after 4 steps" h={260}>
      {STAIR.map((row, r) =>
        row.map((v, c) => {
          const gone = goneRows.has(r) || goneCols.has(c);
          return <Cell key={`${r}-${c}`} x={SX(c)} y={SY(r)} v={v} w={46} c={done && r === 2 && c === 3 ? C.caramel : gone ? C.taupe : C.crema} o={gone ? 0.3 : 1} fill={done && r === 2 && c === 3} />;
        }),
      )}
      <rect x={cx - 3} y={cy - 3} width={52} height={34} rx={5} fill="none" stroke={C.caramel} strokeWidth={2} />
      {!done && (
        <T x={30} y={210} s={12} f={STAIR[r0][c0] < 16 ? C.crema : C.cinnamon}>
          {STAIR[r0][c0]} {STAIR[r0][c0] < 16 ? '< 16: drop the row, step down' : '> 16: drop the column, step left'}
        </T>
      )}
      <T x={30} y={210} s={13} f={C.caramel} o={done ? 1 : 0}>16 at (2, 3): 4 steps</T>
      <T x={30} y={240} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>one row or column gone per step: O(m + n)</T>
    </Svg>
  );
}

// 8 · Row-major contrast. The 3 x 4 matrix where each row starts above the last one's end slides into one strip of 12;
// binary search runs on the strip, mid 5, 8, 6, each mapped back to its cell; 16 at (1, 2) in 3 comparisons. Then the
// staircase's first two rows: 15 then 2, no such order.
export function RowMajorContrast({ t }: StepCtx) {
  const flat = easeInOut(seg(t, 0.3, 1.1));
  const MIDS = [5, 8, 6];
  const k = clamp((t - 1.3) / 0.6, 0, 3);
  const n = Math.min(2, Math.floor(k));
  const mid = MIDS[n];
  const done = k >= 2.6;
  const FX = (i: number) => 40 + i * 44;
  return (
    <Svg label="A matrix where each row starts above the previous row's end flattens into one sorted strip of 12; binary search tests positions 5, 8 and 6, each mapped back to a cell by division and remainder, and finds 16 at row 1, column 2 in 3 comparisons. The staircase matrix fails the rule: its first row ends at 15 and its second starts at 2" h={290}>
      {ROWMAJ.map((row, r) =>
        row.map((v, c) => {
          const i = r * 4 + c;
          const x = lerp(170 + c * 60, FX(i), flat);
          const y = lerp(20 + r * 34, 60, flat);
          const hot = k > 0 && i === mid;
          return <Cell key={i} x={x} y={y} v={v} w={38} c={done && i === 6 ? C.caramel : hot ? C.caramel : C.crema} fill={done && i === 6} />;
        }),
      )}
      {k > 0 && (
        <g>
          <path d={`M${FX(mid) + 19} 100 l-5 9 l10 0 z`} fill={C.caramel} />
          <T x={FX(mid) + 19} y={124} s={12} a="middle" f={C.caramel}>{mid}</T>
          <T x={40} y={156} s={12} f={C.crema}>
            {mid} → ({Math.floor(mid / 4)}, {mid % 4}) = {ROWMAJ[Math.floor(mid / 4)][mid % 4]}
          </T>
        </g>
      )}
      <T x={300} y={156} s={13} f={C.caramel} o={done ? 1 : 0}>16 at (1, 2): 3 comparisons</T>
      <g opacity={easeOut(seg(t, 3.4, 3.8))}>
        <T x={40} y={200} s={12} f={C.latte}>staircase, rows 0 and 1:</T>
        {[15, 2].map((v, i) => (
          <Cell key={v} x={280 + i * 60} y={182} v={v} w={46} c={C.cherryText} />
        ))}
        <T x={40} y={250} s={12} f={C.cherryText}>15 then 2: no flattened order</T>
      </g>
    </Svg>
  );
}

// 9 · Recap. Three small pictures: a rotated row with its sorted half bracketed; a corner walk; a flattened strip. Then
// the staircase's numbers spilled into a jumble: the k-th smallest, with no order to search at all.
export function Recap({ t }: StepCtx) {
  const a = (i: number) => clamp(easeOutBack(seg(t, 0.2 + i * 0.5, 0.6 + i * 0.5)), 0, 1);
  const JUMBLE = [STAIR[2][3], STAIR[0][1], STAIR[4][0], STAIR[1][0], STAIR[3][2], STAIR[0][4], STAIR[2][1], STAIR[4][3]];
  return (
    <Svg label="Three invariants: which half of a rotated array is sorted, which way a corner walk shrinks a staircase matrix, and whether one flattened order exists. Then numbers with no order at all: find the k-th smallest" h={250}>
      <g opacity={a(0)}>
        {ROT.map((v, i) => (
          <rect key={i} x={30 + i * 22} y={40 - (v + 1) * 3.5} width={16} height={(v + 1) * 3.5} rx={1} fill={i < 4 ? C.caramel : C.crema} opacity={0.8} />
        ))}
        <T x={30} y={66} s={12} f={C.latte}>sorted half</T>
      </g>
      <g opacity={a(1)}>
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}-${c}`} x={230 + c * 18} y={8 + r * 14} width={14} height={10} rx={1} fill="none" stroke={C.crema} strokeWidth={1} />))}
        <path d="M297 13 L297 27 L279 27 L279 41" fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={230} y={80} s={12} f={C.latte}>corner walk</T>
      </g>
      <g opacity={a(2)}>
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={410 + i * 20} y={40 - (i + 1) * 3} width={14} height={(i + 1) * 3} rx={1} fill={C.cinnamon} opacity={0.8} />
        ))}
        <T x={410} y={66} s={12} f={C.latte}>one flat order</T>
      </g>
      <g opacity={easeOut(seg(t, 2.0, 2.4))}>
        {JUMBLE.map((v, i) => (
          <Cell key={i} x={40 + i * 64} y={130 + (i % 2) * 8 * Math.sin(t * 2 + i)} v={v} w={46} c={C.latte} />
        ))}
      </g>
      <T x={300} y={222} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>no order at all: the k-th smallest?</T>
    </Svg>
  );
}
