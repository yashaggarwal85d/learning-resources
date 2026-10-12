import { useEffect, useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, fmt, seg } from '../../../../../reels/anim';
import { C, SERIF, Svg, T } from '../../../../../reels/kit';

// Every number shown here is computed or asserted by examples.py. Trees are drawn top-down, one row per level; the per-level
// totals sit in caramel at the right margin (x = 540, end-anchored), one column, read straight down: the column is the answer.

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

/** A notation letter set in the serif inside a mono line, so Θ never reads as 0. */
const G = ({ children }: { children: string }) => <tspan fontFamily={SERIF}>{children}</tspan>;

/** The column of a recursion tree: a^i * f(n / b^i) for i = 0 .. log_b n. */
const levels = (a: number, b: number, f: (m: number) => number, n: number) => {
  const out: number[] = [];
  for (let i = 0, m = n; m >= 1; i++, m /= b) out.push(a ** i * f(m));
  return out;
};
const one = (v: number) => (Math.round(v * 10) / 10).toString();

/** The row height shared by the trees. */
const ROW = (i: number) => 36 + 42 * i;
/** Centre of node j on level k of a balanced binary tree drawn across x = 50..410. */
const CX = (k: number, j: number) => 50 + ((j + 0.5) * 360) / 2 ** k;

// 1 · The problem: a vector and three recursive procedures, each with its count as a recurrence and a ? for the answer.
const CARDS: [string, string][] = [
  ['merge sort', 'T(n) = 2T(n/2) + n'],
  ['binary search', 'T(n) = T(n/2) + 1'],
  ['median of medians', 'T(n) = T(n/5) + T(7n/10) + n'],
];

export function Opening({ t }: StepCtx) {
  return (
    <Svg label="A vector of a million 64-bit keys and three recursive procedures on it: merge sort, binary search and median of medians, each with its step count written as a recurrence and a question mark" h={380}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = easeOut(seg(t, i * 0.05, 0.3 + i * 0.05));
        return (
          <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * -10})`}>
            <rect x={30 + i * 42} y={18} width={38} height={30} rx={5} fill={C.roast} stroke={C.mocha} />
            <T x={30 + i * 42 + 19} y={38} s={13} f={C.crema} a="middle">{i < 11 ? i : '…'}</T>
          </g>
        );
      })}
      <T x={30} y={72} s={13} f={C.taupe}>n = 1,000,000 keys, 64-bit</T>
      <line x1={16} y1={52} x2={16} y2={290} stroke={C.mocha} strokeWidth={2} opacity={easeOut(seg(t, 0.8, 2.2))} />
      {CARDS.map(([name, rec], i) => {
        const a = easeOut(seg(t, 0.9 + i * 0.6, 1.4 + i * 0.6));
        const q = easeOutBack(seg(t, 2.6 + i * 0.1, 2.9 + i * 0.1));
        const y = 96 + i * 92;
        return (
          <g key={name}>
            <g opacity={a} transform={`translate(${(1 - a) * 24} 0)`}>
              <line x1={16} y1={y + 38} x2={30} y2={y + 38} stroke={C.mocha} strokeWidth={2} />
              <rect x={30} y={y} width={515} height={76} rx={14} fill={C.roast} stroke={C.mocha} />
              <T x={48} y={y + 28} s={13} f={C.latte}>{name}</T>
              <T x={48} y={y + 58} s={15} f={C.crema} w={600}>{rec}</T>
            </g>
            <g opacity={q}>
              <T x={528} y={y + 52} s={26} f={C.caramel} a="end" serif w={700}>?</T>
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · The recursion tree of merge sort on 64 keys, level by level, with the column of totals.
export function MergeTree({ t, portrait }: StepCtx) {
  const sizes = [64, 32, 16, 8];
  const rule = easeOut(seg(t, 3.9, 4.3));
  return (
    <Svg label="Recursion tree of merge sort on 64 keys: seven levels, every level totals 64, the sum is 448" h={380}>
      {Array.from({ length: 7 }, (_, i) => {
        const a = easeOut(seg(t, 0.2 + 0.55 * i, 0.6 + 0.55 * i));
        const y = ROW(i);
        const n = 2 ** i;
        return (
          <g key={i} opacity={a}>
            {!portrait && <T x={22} y={y + 5} s={13} f={C.taupe}>L{i}</T>}
            {i > 0 &&
              Array.from({ length: n }, (_, j) => (
                <line key={j} x1={CX(i - 1, j >> 1)} y1={ROW(i - 1) + (i - 1 <= 3 ? 12 : 2)} x2={CX(i, j)} y2={y - (i <= 3 ? 12 : 2)} stroke={C.mocha} strokeWidth={i > 4 ? 0.7 : 1.2} />
              ))}
            {Array.from({ length: n }, (_, j) =>
              i <= 3 ? (
                <g key={j}>
                  <rect x={CX(i, j) - 17} y={y - 12} width={34} height={24} rx={5} fill={C.roast} stroke={C.mocha} />
                  <T x={CX(i, j)} y={y + 5} s={13} f={C.crema} a="middle">{sizes[i]}</T>
                </g>
              ) : (
                <circle key={j} cx={CX(i, j)} cy={y} r={i === 4 ? 3 : i === 5 ? 2.4 : 1.8} fill={C.taupe} />
              ),
            )}
            <T x={540} y={y + 5} s={15} f={C.caramel} a="end" w={600}>64</T>
          </g>
        );
      })}
      <line x1={440} y1={ROW(6) + 16} x2={545} y2={ROW(6) + 16} stroke={C.latte} strokeWidth={1.5} opacity={rule} />
      <T x={540} y={ROW(6) + 44} s={20} f={C.caramel} a="end" w={700} o={rule}>448</T>
      <T x={540} y={ROW(6) + 66} s={13} f={C.latte} a="end" o={rule}>= 64 × 7 levels</T>
    </Svg>
  );
}

// 3 · Predict: eight calls on each half, f = n²: what does the leaf level total?
export function LeafPredict({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const col = levels(8, 2, (m) => m * m, 64);
  const counts = ['512', '4,096', '32,768'];
  // level 1: eight boxes, the first wide enough for its label
  const widths = [54, 36, 36, 36, 36, 36, 36, 36];
  let x = 50;
  const l1 = widths.map((w) => {
    const c = x + w / 2;
    x += w + 8;
    return { c, w };
  });
  return (
    <Svg label="A recursion tree with eight calls on each half and n squared work per call on 64 keys: the root level costs 4,096, the leaf count and the column of level totals fill in once you answer" h={380}>
      {/* level 0 */}
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={204} y={ROW(0) - 12} width={52} height={24} rx={5} fill={C.roast} stroke={C.mocha} />
        <T x={230} y={ROW(0) + 5} s={13} f={C.crema} a="middle">4,096</T>
        <T x={540} y={ROW(0) + 5} s={15} f={C.caramel} a="end" w={600}>{fmt(col[0])}</T>
      </g>
      {/* level 1 */}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        {l1.map((b, j) => (
          <g key={j}>
            <line x1={230} y1={ROW(0) + 12} x2={b.c} y2={ROW(1) - 12} stroke={C.mocha} strokeWidth={1.2} />
            <rect x={b.c - b.w / 2} y={ROW(1) - 12} width={b.w} height={24} rx={5} fill={C.roast} stroke={C.mocha} />
            {j === 0 && <T x={b.c} y={ROW(1) + 5} s={13} f={C.crema} a="middle">1,024</T>}
          </g>
        ))}
        <T x={420} y={ROW(1) + 5} s={13} f={C.taupe}>× 8</T>
        <T x={540} y={ROW(1) + 5} s={15} f={C.caramel} a="end" w={600}>{fmt(col[1])}</T>
      </g>
      {/* level 2: 64 dots */}
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        {Array.from({ length: 64 }, (_, j) => (
          <circle key={j} cx={50 + ((j + 0.5) * 360) / 64} cy={ROW(2)} r={2.2} fill={C.taupe} />
        ))}
      </g>
      {/* levels 3..6: density strips with counts */}
      {[3, 4, 5, 6].map((i) => {
        const a = easeOut(seg(t, 0.55 + 0.15 * (i - 3), 0.85 + 0.15 * (i - 3)));
        return (
          <g key={i} opacity={a}>
            <rect x={110} y={ROW(i) - 5} width={300} height={10} rx={3} fill={C.taupe} opacity={0.3 + 0.12 * (i - 3)} />
            {i < 6 ? shown && <T x={30} y={ROW(i) + 5} s={13} f={C.taupe} o={easeOut(seg(s, 0, 0.4))}>{counts[i - 3]}</T> : shown ? <T x={30} y={ROW(i) + 5} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.5))}>262,144</T> : <T x={30} y={ROW(i) + 5} s={13} f={C.taupe}>?</T>}
          </g>
        );
      })}
      {/* the column */}
      {[2, 3, 4, 5, 6].map((i) => {
        const at = (i - 2) * 0.3;
        const f = shown ? easeOut(seg(s, at + 0.12, at + 0.3)) : 0;
        const q = shown ? 1 - seg(s, at, at + 0.12) : 1;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.3 + 0.1 * i, 0.6 + 0.1 * i))}>
            {q > 0 && <T x={540} y={ROW(i) + 5} s={15} f={C.taupe} a="end" o={q}>?</T>}
            <T x={540} y={ROW(i) + 5} s={15} f={C.caramel} a="end" w={600} o={f}>{fmt(col[i])}</T>
          </g>
        );
      })}
      {shown && (
        <g opacity={easeOut(seg(s, 1.7, 2.1))}>
          <line x1={440} y1={ROW(6) + 16} x2={545} y2={ROW(6) + 16} stroke={C.latte} strokeWidth={1.5} />
          <T x={540} y={ROW(6) + 44} s={20} f={C.caramel} a="end" w={700}>520,192</T>
          <T x={540} y={ROW(6) + 66} s={15} f={C.crema} a="end">leaves win: <G>Θ</G>(n³)</T>
        </g>
      )}
    </Svg>
  );
}

// 4 · Three shapes of the column: shrinking, flat, growing.
export function ThreeShapes({ t }: StepCtx) {
  const cols = [
    { x: 30, rec: '2T(n/2) + n²', c: levels(2, 2, (m) => m * m, 64), ratio: '× ½ per level', v1: 'root wins', ends: '4,096 … 64' },
    { x: 210, rec: '2T(n/2) + n', c: levels(2, 2, (m) => m, 64), ratio: '× 1', v1: 'tie', ends: '64 … 64' },
    { x: 390, rec: '8T(n/2) + n²', c: levels(8, 2, (m) => m * m, 64), ratio: '× 2', v1: 'leaves win', ends: '4,096 … 262,144' },
  ];
  return (
    <Svg label="Three level-total columns for 64 keys: 2T(n/2)+n² shrinks and the root wins, 2T(n/2)+n is flat so every level ties, 8T(n/2)+n² grows and the leaves win" h={360}>
      {cols.map((col, k) => {
        const t0 = 0.2 + k * 1.2;
        const max = Math.max(...col.c);
        const done = easeOut(seg(t, t0 + 0.9, t0 + 1.3));
        return (
          <g key={k}>
            <T x={col.x} y={36} s={15} f={C.crema} w={600} o={easeOut(seg(t, t0 - 0.1, t0 + 0.2))}>{col.rec}</T>
            {col.c.map((v, i) => {
              const a = easeOut(seg(t, t0 + i * 0.12, t0 + 0.3 + i * 0.12));
              return <rect key={i} x={col.x} y={64 + i * 22} width={Math.max(2, (v / max) * 120 * a)} height={14} rx={3} fill={C.caramel} />;
            })}
            <T x={col.x} y={232} s={13} f={C.taupe} o={done}>{col.ratio}</T>
            <T x={col.x} y={254} s={13} f={C.latte} o={done}>{col.ends}</T>
            <T x={col.x} y={292} s={15} f={C.caramel} w={700} o={done}>{col.v1}</T>
            <T x={col.x} y={314} s={15} f={C.caramel} w={700} o={done}>
              <G>Θ</G>
              {k === 0 ? '(n²)' : k === 1 ? '(n log n)' : '(n³)'}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · The statement: f against the watershed, five recurrences and their cases.
export function Watershed({ t }: StepCtx) {
  const rows: [string, string, string, string, string][] = [
    ['8T(n/2) + n²', 'n³', 'n²', '1: ', '(n³)'],
    ['3T(n/2) + n', 'n^1.585', 'n', '1: ', '(n^1.585)'],
    ['2T(n/2) + n', 'n', 'n', '2: ', '(n log n)'],
    ['T(n/2) + 1', 'n⁰ = 1', '1', '2: ', '(log n)'],
    ['2T(n/2) + n²', 'n', 'n²', '3: ', '(n²)'],
  ];
  const X = [30, 165, 285, 345];
  return (
    <Svg label="Five recurrences with their watershed, driving function and Master theorem case: 8T(n/2)+n² case 1, 3T(n/2)+n case 1, 2T(n/2)+n case 2, T(n/2)+1 case 2, 2T(n/2)+n² case 3" h={380}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={X[0]} y={30} s={13} f={C.taupe}>recurrence</T>
        <T x={X[1]} y={30} s={13} f={C.taupe}>watershed</T>
        <T x={X[2]} y={30} s={13} f={C.taupe}>f(n)</T>
        <T x={X[3]} y={30} s={13} f={C.taupe}>case</T>
      </g>
      {rows.map(([rec, ws, f, cs, th], i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6));
        const b = easeOut(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6));
        const y = 76 + i * 56;
        return (
          <g key={rec}>
            <g opacity={a}>
              <line x1={30} y1={y - 26} x2={545} y2={y - 26} stroke={C.cocoa} />
              <T x={X[0]} y={y} s={13} f={C.crema}>{rec}</T>
              <T x={X[1]} y={y} s={13} f={C.crema}>{ws}</T>
              <T x={X[2]} y={y} s={13} f={C.latte}>{f}</T>
            </g>
            <T x={X[3]} y={y} s={15} f={C.caramel} w={700} o={b}>
              {cs}
              <G>Θ</G>
              {th}
            </T>
          </g>
        );
      })}
      <T x={30} y={364} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 4))}>regularity: 2·(n/2)² = ½·n² ≤ c·n², c = ½ &lt; 1</T>
    </Svg>
  );
}

// 6 · The gap: f = n log n, the ratio between neighbouring levels drifts towards 1 at the top.
export function Gap({ t }: StepCtx) {
  const tot = [384, 320, 256, 192, 128, 64];
  const ratios = ['× 0.83', '× 0.80', '× 0.75', '× 0.67', '× 0.50'];
  const pulse = 1 - 0.35 * Math.sin(Math.PI * seg(t, 3.4, 4));
  return (
    <Svg label="Level totals of 2T(n/2) + n log n on 64 keys: 384, 320, 256, 192, 128, 64; neighbouring ratios 0.83, 0.80, 0.75, 0.67, 0.50 keep changing, so no constant fits; the six levels sum to 1,344" h={380}>
      <T x={30} y={28} s={15} f={C.crema} w={600}>2T(n/2) + n log₂ n</T>
      <T x={30} y={50} s={13} f={C.latte}>watershed n, f = n log₂ n:</T>
      <T x={30} y={68} s={13} f={C.latte}>above it, but not by any n^ε</T>
      {tot.map((v, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.4, 0.6 + i * 0.4));
        const y = 92 + i * 34;
        return (
          <g key={i}>
            <rect x={30} y={y} width={(v / 384) * 300 * a} height={22} rx={4} fill={C.caramel} />
            <T x={30 + (v / 384) * 300 + 10} y={y + 17} s={15} f={C.crema} w={600} o={a}>{v}</T>
            {i < 5 && <T x={440} y={y + 36} s={13} f={C.taupe} o={easeOut(seg(t, 0.5 + i * 0.4, 0.9 + i * 0.4)) * pulse}>{ratios[i]}</T>}
          </g>
        );
      })}
      <T x={30} y={304} s={13} f={C.taupe} o={easeOut(seg(t, 2.4, 2.8))}>+ 64 leaves × T(1) = 64</T>
      <g opacity={easeOut(seg(t, 3.0, 3.4))}>
        <line x1={30} y1={314} x2={330} y2={314} stroke={C.latte} strokeWidth={1.5} />
        <T x={30} y={341} s={20} f={C.caramel} w={700}>1,344</T>
        <T x={130} y={341} s={13} f={C.latte}>= 64 × 21, six levels</T>
        <T x={30} y={364} s={13} f={C.latte}>T(64) = 1,408 with the leaves</T>
      </g>
    </Svg>
  );
}

// 7 and 8 · Lopsided trees: sizes shown by bar width, level totals in the column.
type TNode = { size: number; x0: number; x1: number };
function buildTree(f1: number, f2: number, depth: number) {
  const out: TNode[][] = [[{ size: 1000, x0: 50, x1: 410 }]];
  for (let l = 1; l <= depth; l++) {
    const next: TNode[] = [];
    for (const nd of out[l - 1]) {
      const w = nd.x1 - nd.x0;
      next.push({ size: nd.size * f1, x0: nd.x0, x1: nd.x0 + w * f1 });
      next.push({ size: nd.size * f2, x0: nd.x1 - w * f2, x1: nd.x1 });
    }
    out.push(next);
  }
  return out;
}
const mid = (n: TNode) => (n.x0 + n.x1) / 2;

function TreeRows({ tree, t, beat, start, lastRow }: { tree: TNode[][]; t: number; beat: number; start: number; lastRow: number }) {
  return (
    <>
      {tree.map((level, i) => {
        if (i > lastRow) return null;
        const a = easeOut(seg(t, start + beat * i, start + beat * i + 0.4));
        const y = ROW(i);
        return (
          <g key={i} opacity={a}>
            {i > 0 &&
              level.map((nd, j) => {
                const p = tree[i - 1][j >> 1];
                return <line key={j} x1={mid(p)} y1={y - 30} x2={mid(nd)} y2={y - (i <= 2 ? 14 : 3)} stroke={C.mocha} strokeWidth={i > 3 ? 0.8 : 1.2} />;
              })}
            {level.map((nd, j) => (
              <g key={j}>
                {i <= 2 && (
                  <T x={mid(nd)} y={y + 1} s={13} f={C.crema} a="middle">
                    {fmt(nd.size)}
                  </T>
                )}
                <rect x={mid(nd) - Math.max(1.6, nd.size * 0.09) / 2} y={y + 6} width={Math.max(1.6, nd.size * 0.09)} height={6} rx={2} fill={i <= 2 ? C.latte : C.taupe} />
              </g>
            ))}
          </g>
        );
      })}
    </>
  );
}

export function SelectionTree({ t }: StepCtx) {
  const tree = buildTree(1 / 5, 7 / 10, 5);
  const vals = Array.from({ length: 6 }, (_, i) => 1000 * 0.9 ** i);
  const end = easeOut(seg(t, 3.8, 4.2));
  return (
    <Svg label="Recursion tree of T(n) = T(n/5) + T(7n/10) + n on 1,000 keys: node sizes 1,000; 200 and 700; 40, 140, 140, 490. Each level totals 9/10 of the one above: 1,000, 900, 810, 729, 656, 590, so the sum stays under 10,000" h={380}>
      <TreeRows tree={tree} t={t} beat={0.6} start={0.2} lastRow={5} />
      {vals.map((v, i) => (
        <T key={i} x={540} y={ROW(i) + 10} s={15} f={C.caramel} a="end" w={600} o={easeOut(seg(t, 0.2 + 0.6 * i, 0.6 + 0.6 * i))}>
          {fmt(v)}
        </T>
      ))}
      <T x={468} y={(ROW(0) + ROW(1)) / 2 + 12} s={13} f={C.taupe} a="end" o={easeOut(seg(t, 1.1, 1.5))}>× 9/10</T>
      <T x={540} y={ROW(5) + 34} s={15} f={C.taupe} a="end" o={end}>…</T>
      <line x1={400} y1={ROW(5) + 46} x2={545} y2={ROW(5) + 46} stroke={C.latte} strokeWidth={1.5} opacity={end} />
      <T x={540} y={ROW(5) + 72} s={20} f={C.caramel} a="end" w={700} o={end}>&lt; 10,000</T>
      <T x={540} y={ROW(5) + 94} s={13} f={C.latte} a="end" o={end}>= 1,000 × (1 + 9/10 + 81/100 + …)</T>
      <T x={30} y={ROW(5) + 118} s={13} f={C.latte} o={easeOut(seg(t, 4.4, 4.8))}>exact, with floors and T(0) = T(1) = 1: T(1,000) = 6,532</T>
    </Svg>
  );
}

// 8 · Predict: groups of 3, T(n/3) + T(2n/3) + n.
export function ThirdsPredict({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const tree = buildTree(1 / 3, 2 / 3, 5);
  return (
    <Svg label="Recursion tree of T(n) = T(n/3) + T(2n/3) + n on 1,000 keys: sizes 333 and 667, then 111, 222, 222, 444; the level totals appear once you answer" h={380}>
      <TreeRows tree={tree} t={t} beat={0.2} start={0} lastRow={5} />
      {Array.from({ length: 6 }, (_, i) => {
        const at = i === 0 ? 0 : (i - 1) * 0.3;
        const f = i === 0 ? 1 : shown ? easeOut(seg(s, at + 0.12, at + 0.3)) : 0;
        const q = i === 0 ? 0 : shown ? 1 - seg(s, at, at + 0.12) : 1;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.1 + 0.2 * i, 0.4 + 0.2 * i))}>
            {q > 0 && <T x={540} y={ROW(i) + 10} s={15} f={C.taupe} a="end" o={q}>?</T>}
            <T x={540} y={ROW(i) + 10} s={15} f={C.caramel} a="end" w={600} o={f}>1,000</T>
          </g>
        );
      })}
      {shown && (
        <g opacity={easeOut(seg(s, 1.8, 2.2))}>
          <T x={468} y={(ROW(0) + ROW(1)) / 2 + 12} s={13} f={C.taupe} a="end">× 1</T>
          <line x1={400} y1={ROW(5) + 46} x2={545} y2={ROW(5) + 46} stroke={C.latte} strokeWidth={1.5} />
          <T x={540} y={ROW(5) + 72} s={15} f={C.caramel} a="end" w={700}>× log n levels: <G>Θ</G>(n log n)</T>
          <T x={30} y={ROW(5) + 94} s={13} f={C.latte}>exact, with floors and T(0) = T(1) = 1: T(1,000) = 10,526 ≈ 1.06 · n log₂ n</T>
        </g>
      )}
    </Svg>
  );
}

// 9 · The exponent p: phi(p) = (1/5)^p + (7/10)^p crosses 1 at p = 0.84.
export function ExponentP({ t, portrait }: StepCtx) {
  const phi = (p: number) => 0.2 ** p + 0.7 ** p;
  const X0 = portrait ? 70 : 60;
  const X1 = portrait ? 520 : 350;
  const Y0 = portrait ? 220 : 300; // phi = 0.5
  const Y1 = portrait ? 40 : 60; // phi = 2
  const px = (p: number) => X0 + (p / 1.5) * (X1 - X0);
  const py = (v: number) => Y0 - ((v - 0.5) / 1.5) * (Y0 - Y1);
  const draw = easeOut(seg(t, 0.8, 2.4)) * 1.5;
  const pts: string[] = [];
  for (let p = 0; p <= draw + 1e-9; p += 0.02) pts.push(`${pts.length ? 'L' : 'M'}${px(p).toFixed(1)} ${py(phi(p)).toFixed(1)}`);
  const P = 0.8398;
  const hit = easeOutBack(seg(t, 1.8, 2.2));
  const cards: [string, string][] = [
    ['2T(n/2) + n', 'p = 1'],
    ['8T(n/2) + n²', 'p = 3'],
    ['T(n/3) + T(2n/3)', 'p = 1'],
  ];
  return (
    <Svg label="The curve (1/5)^p + (7/10)^p falls from 2 at p = 0 and crosses 1 at p = 0.84, so for f(n) = n the selection recurrence is linear" h={380}>
      <g opacity={easeOut(seg(t, 0, 0.6))}>
        <line x1={X0} y1={Y0} x2={X1 + 10} y2={Y0} stroke={C.taupe} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 10} stroke={C.taupe} />
        {[0, 0.5, 1, 1.5].map((p) => (
          <T key={p} x={px(p)} y={Y0 + 20} s={13} f={C.taupe} a="middle">{p}</T>
        ))}
        {[0.5, 1, 1.5, 2].map((v) => (
          <T key={v} x={X0 - 8} y={py(v) + 5} s={13} f={C.taupe} a="end">{v}</T>
        ))}
        <line x1={X0} y1={py(1)} x2={X1} y2={py(1)} stroke={C.taupe} strokeDasharray="5 5" />
        <T x={X1 + 8} y={py(1) + 5} s={13} f={C.taupe}>= 1</T>
        <T x={X0 + 6} y={Y1 - 20} s={13} f={C.latte}>(1/5)^p + (7/10)^p</T>
      </g>
      <path d={pts.join(' ')} stroke={C.caramel} strokeWidth={3.5} fill="none" />
      <g opacity={hit}>
        <line x1={px(P)} y1={py(1)} x2={px(P)} y2={Y0} stroke={C.caramel} strokeDasharray="2 4" />
        <circle cx={px(P)} cy={py(1)} r={6} fill={C.caramel} />
        <T x={px(P) + 14} y={py(1) - 16} s={20} f={C.caramel} serif w={700}>p ≈ 0.84</T>
      </g>
      {portrait ? (
        <g>
          {cards.map(([rec, p], i) => (
            <T key={rec} x={30} y={266 + i * 24} s={13} f={C.latte} o={easeOut(seg(t, 2.8 + i * 0.5, 3.2 + i * 0.5))}>
              {rec}: {p}
            </T>
          ))}
          <T x={30} y={352} s={15} f={C.crema} w={600} o={easeOut(seg(t, 4.2, 4.6))}>f(n) = n, p &lt; 1 ⇒ T(n) = <G>Θ</G>(n)</T>
        </g>
      ) : (
        <g>
          {cards.map(([rec, p], i) => {
            const a = easeOut(seg(t, 2.8 + i * 0.5, 3.2 + i * 0.5));
            return (
              <g key={rec} opacity={a}>
                <T x={412} y={100 + i * 62} s={13} f={C.latte}>{rec}</T>
                <T x={412} y={122 + i * 62} s={15} f={C.caramel} w={600}>{p}</T>
              </g>
            );
          })}
          <T x={30} y={352} s={15} f={C.crema} w={600} o={easeOut(seg(t, 4.2, 4.6))}>f(n) = n, p &lt; 1 ⇒ T(n) = <G>Θ</G>(n)</T>
        </g>
      )}
    </Svg>
  );
}

// 10 · Predict: the proof that proves nothing, then the real ratio T(n)/n.
export function FalseProof({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  const chain = ['guess: T(n) ≤ c·n', 'T(n) = 2T(n/2) + n', '≤ 2·c·(n/2) + n', '= c·n + n', '= O(n)'];
  const ks = [1, 4, 7, 10, 13, 16, 19];
  const ns = ['2¹', '2⁴', '2⁷', '2¹⁰', '2¹³', '2¹⁶', '2¹⁹'];
  const strike = easeOut(seg(s, 0, 0.3));
  const x0 = portrait ? 30 : 320;
  const pitch = portrait ? 70 : 31;
  const base = portrait ? 336 : 320;
  const unit = portrait ? 3.2 : 9;
  return (
    <Svg label="The false proof: the induction step for the guess T(n) ≤ c·n ends at c·n + n, which is larger than c·n, so it proves nothing; the real ratio T(n)/n climbs 2, 5, 8, 11, 14, 17, 20" h={360}>
      {chain.map((line, i) => (
        <g key={i} opacity={easeOut(seg(t, i * 0.3, 0.3 + i * 0.3))}>
          <T x={30} y={52 + i * 40} s={15} f={i === 4 ? C.latte : C.crema} w={i === 0 ? 700 : 500}>{line}</T>
          {i === 4 && !shown && <T x={112} y={52 + i * 40} s={15} f={C.caramel} w={700}>?</T>}
        </g>
      ))}
      {shown && (
        <g>
          <rect x={30} y={52 + 4 * 40 - 7} width={58 * strike} height={3} fill={C.cherry} />
          <T x={110} y={52 + 4 * 40} s={13} f={C.cherryText} o={strike}>needed: ≤ c·n</T>
        </g>
      )}
      {shown && (
        <g>
          <T x={x0} y={portrait ? 246 : 40} s={13} f={C.latte} o={easeOut(seg(s, 0.4, 0.7))}>T(n)/n keeps climbing</T>
          {ks.map((k, i) => {
            const a = easeOut(seg(s, 0.5 + i * 0.25, 0.8 + i * 0.25));
            const h = (k + 1) * unit * a;
            const cx = x0 + i * pitch + (portrait ? 14 : 11);
            return (
              <g key={k}>
                <rect x={cx - (portrait ? 14 : 11)} y={base - h} width={portrait ? 28 : 22} height={h} rx={3} fill={i === 6 ? C.cherry : C.caramel} />
                <T x={cx} y={base - h - 6} s={15} f={C.crema} a="middle" w={600} o={a}>{k + 1}</T>
                <T x={cx} y={base + 20} s={13} f={C.taupe} a="middle" o={a}>{ns[i]}</T>
              </g>
            );
          })}
        </g>
      )}
    </Svg>
  );
}

// 11 and 15 · Two induction attempts: the naive guess fails by a lower-order term, the strengthened guess closes.
function Attempt({ y, label, color, lines, bad, o }: { y: number; label: string; color: string; lines: string[]; bad: boolean; o: number }) {
  return (
    <g opacity={o}>
      <rect x={30} y={y} width={515} height={112} rx={14} fill={C.roast} stroke={bad ? C.cherry : C.mocha} />
      <T x={46} y={y + 28} s={20} f={color} w={700} serif>{label}</T>
      {lines.map((l, i) => (
        <T key={i} x={46} y={y + 54 + i * 24} s={15} f={bad && i === 2 ? C.cherryText : C.crema}>{l}</T>
      ))}
      {bad ? (
        <g stroke={C.cherryText} strokeWidth={3} strokeLinecap="round">
          <line x1={500} y1={y + 24} x2={522} y2={y + 46} />
          <line x1={522} y1={y + 24} x2={500} y2={y + 46} />
        </g>
      ) : (
        <path d={`M500 ${y + 36} L508 ${y + 46} L524 ${y + 24}`} stroke={C.caramel} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );
}

export function StrengthenGuess({ t }: StepCtx) {
  return (
    <Svg label="Merge sort's call count C(n) = 2C(n/2) + 1: the guess c·n fails by the plus 1, the guess c·n − d closes the induction; the exact counts are 3, 7, 15, 127, 2,047, which is 2n − 1" h={360}>
      <T x={30} y={28} s={15} f={C.crema} w={600} o={easeOut(seg(t, 0, 0.3))}>C(n) = 2C(n/2) + 1: calls of merge sort</T>
      <Attempt y={44} label="guess c·n" color={C.cinnamon} lines={['≤ 2·c·(n/2) + 1', '= c·n + 1', '> c·n: not closed']} bad o={easeOut(seg(t, 0.4, 0.8))} />
      <Attempt y={166} label="guess c·n − d" color={C.caramel} lines={['≤ 2·(c·n/2 − d) + 1', '= c·n − 2d + 1', '≤ c·n − d if d ≥ 1']} bad={false} o={easeOut(seg(t, 2.0, 2.4))} />
      <g opacity={easeOut(seg(t, 3.9, 4.3))}>
        <T x={30} y={314} s={13} f={C.latte}>n = 2, 4, 8, 64, 1,024</T>
        <T x={30} y={336} s={15} f={C.crema} w={600}>C(n) = 3, 7, 15, 127, 2,047 = 2n − 1</T>
      </g>
    </Svg>
  );
}

// 12 · Back to the problem: step 1's picture with every ? replaced by the answer.
export function Closing({ t }: StepCtx) {
  const cards: { name: string; verdict: ReactNode; count: string }[] = [
    { name: 'merge sort · T(n) = 2T(n/2) + n', verdict: <>case 2: <G>Θ</G>(n log n)</>, count: '1,000,000 keys: T = 20,951,424 units' },
    { name: 'binary search · T(n) = T(n/2) + 1', verdict: <>case 2, watershed 1: <G>Θ</G>(log n)</>, count: '1,000,000 keys: 20 probes' },
    { name: 'median of medians · T(n/5) + T(7n/10) + n', verdict: <>Akra–Bazzi, p ≈ 0.84: <G>Θ</G>(n)</>, count: '1,000,000 keys: T = 8,832,605 units < 10n' },
  ];
  return (
    <Svg label="Back to the problem: merge sort is Theta of n log n, T = 20,951,424 units of work on a million keys; binary search is Theta of log n, 20 probes; median of medians is linear, T = 8,832,605 units, under 10n" h={380}>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, i * 0.03, 0.2 + i * 0.03))}>
          <rect x={30 + i * 42} y={14} width={38} height={22} rx={4} fill={C.roast} stroke={C.mocha} />
          <T x={30 + i * 42 + 19} y={30} s={13} f={C.crema} a="middle">{i < 11 ? i : '…'}</T>
        </g>
      ))}
      {cards.map((c, i) => {
        const y = 56 + i * 108;
        const a = easeOut(seg(t, 0.4 + i * 0.7, 0.8 + i * 0.7));
        const b = easeOut(seg(t, 0.8 + i * 0.7, 1.1 + i * 0.7));
        return (
          <g key={c.name}>
            <rect x={30} y={y} width={515} height={98} rx={14} fill={C.roast} stroke={C.mocha} opacity={a} />
            <T x={46} y={y + 24} s={13} f={C.latte} o={a}>{c.name}</T>
            <T x={46} y={y + 52} s={15} f={C.caramel} w={700} o={b}>{c.verdict}</T>
            <T x={46} y={y + 82} s={15} f={C.crema} w={600} o={b}>{c.count}</T>
            {b < 1 && <T x={528} y={y + 56} s={26} f={C.caramel} a="end" serif w={700} o={a * (1 - b)}>?</T>}
          </g>
        );
      })}
    </Svg>
  );
}

// 13 and 14 · Prove it: a column of level totals for 64 keys; the growth is revealed after the answer.
function ColumnQuestion({ label, tot, shown, s, ratio, first, verdict, ratios }: { label: string; tot: string[]; shown: boolean; s: number; ratio?: string; first: number; verdict: ReactNode; ratios?: string[] }) {
  return (
    <>
      <g>
        {tot.map((v, i) => {
          const val = Number(v.replace(/,/g, ''));
          const max = Number(tot[tot.length - 1].replace(/,/g, ''));
          const vis = i < 1 ? 1 : shown ? easeOut(seg(s, (i - 1) * 0.25 + 0.12, (i - 1) * 0.25 + 0.4)) : 0;
          const q = i < 1 ? 0 : shown ? 1 - seg(s, (i - 1) * 0.25, (i - 1) * 0.25 + 0.12) : 1;
          const y = 50 + i * 34;
          return (
            <g key={i}>
              <rect x={30} y={y} width={Math.max(3, (val / max) * 300) * vis} height={22} rx={4} fill={C.caramel} />
              <T x={30 + Math.max(3, (val / max) * 300) * vis + 10} y={y + 17} s={15} f={C.crema} w={600} o={vis}>{v}</T>
              {q > 0 && <T x={30} y={y + 17} s={15} f={C.taupe} o={q}>?</T>}
              {ratios && i < tot.length - 1 && i >= 1 && <T x={440} y={y + 36} s={13} f={C.taupe} o={shown ? easeOut(seg(s, i * 0.25 + 0.2, i * 0.25 + 0.5)) : 0}>{ratios[i]}</T>}
              {i === 0 && <T x={440} y={y + 36} s={13} f={C.taupe} o={shown ? easeOut(seg(s, 0.2, 0.5)) : 0}>{ratios ? ratios[0] : ratio}</T>}
            </g>
          );
        })}
      </g>
      <T x={30} y={first} s={13} f={C.latte}>{label}</T>
      <g opacity={shown ? easeOut(seg(s, 1.6, 2.0)) : 1}>
        <T x={30} y={first + 30} s={17} f={C.caramel} w={700}>{shown ? verdict : 'which end of the column wins?'}</T>
      </g>
    </>
  );
}

export function Q1({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  return (
    <Svg label={shown ? 'Level totals of 7T(n/2) + n² on 64 keys: 4,096, 7,168, 12,544, 21,952, 38,416, 67,228, 117,649; each level is 7/4 of the one above, so the leaves win' : 'Level totals of 7T(n/2) + n² on 64 keys: the root level is 4,096; the rest of the column appears once you answer'} h={340}>
      <g opacity={easeOut(seg(t, 0, 0.5))}>
        <ColumnQuestion label="7T(n/2) + n², n = 64" tot={['4,096', '7,168', '12,544', '21,952', '38,416', '67,228', '117,649']} shown={shown} s={s} ratio="× 7/4" first={300} verdict={<>leaves win: <G>Θ</G>(n^2.81)</>} />
      </g>
    </Svg>
  );
}

export function Q2({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  return (
    <Svg label={shown ? 'Level totals of 2T(n/2) + n/log n on 64 keys: 10.7, 12.8, 16, 21.3, 32, 64; neighbouring ratios 1.2, 1.25, 1.33, 1.5, 2 keep growing, so no constant fits and no case applies' : 'Level totals of 2T(n/2) + n/log n on 64 keys: the root level is 10.7; the rest of the column appears once you answer'} h={340}>
      <g opacity={easeOut(seg(t, 0, 0.5))}>
        <ColumnQuestion label="2T(n/2) + n/log n, n = 64" tot={['10.7', '12.8', '16', '21.3', '32', '64']} shown={shown} s={s} ratios={['× 1.2', '× 1.25', '× 1.33', '× 1.5', '× 2']} first={270} verdict="no constant fits: no case applies" />
      </g>
    </Svg>
  );
}

export function Q3({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const s = useSinceAnswer(shown);
  return (
    <Svg label="Substitution on 4T(n/2) + n: the guess c·n² ends at c·n² + n and fails; the guess c₁·n² − c₂·n closes; the exact counts are 6, 28, 120, 8,128, 2,096,128, which is 2n² − n" h={340}>
      <Attempt y={14} label="guess c·n²" color={C.cinnamon} lines={['≤ 4·c·(n/2)² + n', '= c·n² + n', '> c·n²: a larger c never helps']} bad o={easeOut(seg(t, 0, 0.5))} />
      {shown ? (
        <Attempt y={138} label="guess c₁·n² − c₂·n" color={C.caramel} lines={['≤ 4·(c₁·n²/4 − c₂·n/2) + n', '= c₁·n² − 2c₂·n + n', '≤ c₁·n² − c₂·n if c₂ ≥ 1']} bad={false} o={easeOut(seg(s, 0, 0.4))} />
      ) : (
        <g>
          <rect x={30} y={138} width={515} height={112} rx={14} fill="none" stroke={C.mocha} strokeDasharray="6 6" />
          <T x={288} y={202} s={26} f={C.taupe} a="middle" serif>?</T>
        </g>
      )}
      <g opacity={shown ? easeOut(seg(s, 0.8, 1.2)) : 0.0}>
        <T x={30} y={276} s={13} f={C.latte}>n = 2, 4, 8, 64, 1,024</T>
        <T x={30} y={298} s={15} f={C.crema} w={600}>T(n) = 6, 28, 120, 8,128, 2,096,128</T>
        <T x={30} y={322} s={15} f={C.caramel} w={700}>= 2n² − n</T>
      </g>
    </Svg>
  );
}
