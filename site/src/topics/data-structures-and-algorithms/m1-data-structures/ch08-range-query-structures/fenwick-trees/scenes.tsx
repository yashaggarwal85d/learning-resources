import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the array's own live state; latte = secondary labels
// (an index, a bit position); taupe = a slot not yet touched; caramel = the thing to look at
// (the exact indices an update or query actually visits); cinnamon = the naive scan/rebuild
// set directly against the Fenwick path; cherry/cherryText = the full O(n) work a naive
// approach pays that the Fenwick tree skips.

const COUNTS = [3, 5, 2, 8, 1, 4, 6, 2, 9, 3, 5, 7, 1, 2, 4];
const N = COUNTS.length;

function bits(n: number) {
  return n.toString(2).padStart(4, '0');
}

// one row of N slots; `touched` indices (1-based) light up in `colour`. Labels (the slot's own
// value) are drawn only for touched slots when the row is narrow, so phone-width text never collides.
function row(x: number, y: number, w: number, touched: number[], colour = C.caramel, reveal = 1, labelAll = true) {
  const slotW = w / N;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const idx = i + 1;
    const isTouched = touched.includes(idx);
    const sx = x + i * slotW;
    items.push(
      <rect
        key={`r-${x}-${y}-${i}`}
        x={sx}
        y={y}
        width={slotW - 2}
        height={20}
        rx={2}
        fill={isTouched ? colour : 'none'}
        stroke={isTouched ? colour : C.taupe}
        strokeWidth={1.2}
        opacity={isTouched ? reveal : 0.6}
      />,
    );
    if (labelAll || isTouched) {
      items.push(
        <T key={`l-${x}-${y}-${i}`} x={sx + slotW / 2 - 1} y={y + 14} s={13} f={isTouched ? C.ink : C.latte} a="middle">
          {String(COUNTS[i])}
        </T>,
      );
    }
  }
  return items;
}

// a jump-path diagram: indices connected in sequence, each annotated with its binary form
function jumpPath(x: number, y: number, indices: number[], t: number, start: number, beat: number, dir: 'fwd' | 'back') {
  const items: React.ReactNode[] = [];
  const dx = 130;
  indices.forEach((idx, i) => {
    const k = easeOut(seg(t, start + i * beat, start + i * beat + 0.35));
    const cx = x + i * dx;
    items.push(
      <g key={`jp-${i}`} opacity={Math.max(0.25, k)}>
        <circle cx={cx} cy={y} r={18} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={cx} y={y + 5} s={15} f={C.caramel} a="middle">
          {idx}
        </T>
        <T x={cx} y={y + 32} s={13} f={C.latte} a="middle">
          {bits(idx)}
        </T>
      </g>,
    );
    if (i > 0) {
      const px = x + (i - 1) * dx;
      const kk = easeOut(seg(t, start + i * beat - beat * 0.5, start + i * beat));
      items.push(
        <line
          key={`je-${i}`}
          x1={dir === 'fwd' ? px + 18 : px - 18}
          y1={y}
          x2={dir === 'fwd' ? px + 18 + (cx - px - 36) * kk : px - 18 - (px - cx - 36) * kk}
          y2={y}
          stroke={C.caramel}
          strokeWidth={1.6}
          opacity={kk}
          markerEnd="url(#arrow)"
        />,
      );
    }
  });
  return items;
}

// 1 · Opening: the 15-slot array, a cached running total lit then invalidated by one edit
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  const b = easeOut(seg(t, 0.55, 1));
  return (
    <Svg label="Fifteen per-minute event-count slots; a cached running total lights up, then an edit to one slot invalidates it" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>
        per-minute event counts
      </T>
      {row(30, 40, 540, [], C.crema, 1)}
      <rect x={30} y={70} width={540 * a} height={14} rx={3} fill={C.cocoa} />
      <rect x={30} y={70} width={540 * a} height={14} rx={3} fill="none" stroke={C.crema} strokeWidth={1} />
      <T x={30} y={100} s={13} f={C.crema} o={a}>
        a cached running total, built once
      </T>
      <rect x={30 + 540 * 0.3} y={70} width={6} height={14} fill={C.cherry} opacity={b} />
      <T x={30} y={135} s={13} f={C.cherryText} o={b}>
        one minute's count changes —
      </T>
      <T x={30} y={155} s={13} f={C.cherryText} o={b}>
        the cache goes stale past that point
      </T>
      <T x={30} y={185} s={13} f={C.latte} o={b}>
        rescan, or rebuild — either way, O(n)
      </T>
    </Svg>
  );
}

// 2 · LowBitReveal: indices in binary, lowest set bit highlighted
export function LowBitReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  const indices = [5, 6, 8, 11];
  return (
    <Svg label="Four indices in binary, each one's lowest set bit highlighted" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>
        a slot's range is set by
      </T>
      <T x={30} y={44} s={13} f={C.latte}>
        its index's lowest set bit
      </T>
      {indices.map((n, i) => {
        const b = bits(n);
        const lowBitPos = b.length - 1 - Math.log2(n & -n);
        return (
          <g key={`idx-${i}`} opacity={Math.max(0.3, a)}>
            <T x={75 + i * 135} y={90} s={15} f={C.crema} a="middle">
              {n}
            </T>
            {b.split('').map((ch, j) => (
              <T key={`bit-${i}-${j}`} x={30 + i * 135 + j * 22} y={130} s={15} f={j === lowBitPos ? C.caramel : C.latte} a="middle" w={j === lowBitPos ? 700 : 500}>
                {ch}
              </T>
            ))}
            <T x={75 + i * 135} y={160} s={13} f={C.caramel} a="middle">
              lowbit {n & -n}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · UpdatePredict: minute 5 highlighted, candidate touch-counts as options
export function UpdatePredict({ answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Minute five highlighted in the fifteen-slot array; how many slots does updating it touch?" h={220}>
      <T x={30} y={24} s={13} f={C.latte}>
        updating minute 5 —
      </T>
      <T x={30} y={44} s={13} f={C.latte}>
        how many slots does it touch?
      </T>
      {row(30, 60, 540, [5], C.caramel, 1)}
      <T x={30} y={130} s={13} f={answered ? C.crema : C.cherryText}>
        {answered ? 'three jumps, one lowest set bit each' : 'one slot, three, or all fifteen?'}
      </T>
    </Svg>
  );
}

// 4 · UpdateReveal: the real jump sequence 5 -> 6 -> 8
export function UpdateReveal({ t }: StepCtx) {
  return (
    <Svg label="The real update jump sequence: five to six to eight" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>
        minute 5 (0101) adds its own
      </T>
      <T x={30} y={44} s={13} f={C.latte}>
        lowest set bit each step
      </T>
      {jumpPath(80, 110, [5, 6, 8], t, 0.15, 0.5, 'fwd')}
      <T x={30} y={190} s={13} f={C.crema}>three slots touched: 5, 6, 8</T>
      <T x={30} y={210} s={13} f={C.crema}>then past the array — stop</T>
    </Svg>
  );
}

// 5 · QueryPredict: index 11 in binary, candidate jump counts
export function QueryPredict({ answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Minute eleven highlighted; how many slots does its prefix-sum query visit?" h={220}>
      <T x={30} y={24} s={13} f={C.latte}>
        a query through minute 11 —
      </T>
      <T x={30} y={44} s={13} f={C.latte}>
        same arithmetic, run backward
      </T>
      {row(30, 60, 540, [11], C.caramel, 1)}
      <T x={30} y={130} s={13} f={answered ? C.crema : C.cherryText}>
        {answered ? 'three — same arithmetic, subtracting now' : 'one slot, three, or eleven?'}
      </T>
    </Svg>
  );
}

// 6 · QueryReveal: the real jump sequence 11 -> 10 -> 8, running total accumulating
export function QueryReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 1.3, 1.8));
  return (
    <Svg label="The real query jump sequence: eleven to ten to eight, summing as it goes" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>
        minute 11 (1011) subtracts its own
      </T>
      <T x={30} y={44} s={13} f={C.latte}>
        lowest set bit each step
      </T>
      {jumpPath(80, 110, [11, 10, 8], t, 0.15, 0.5, 'back')}
      <T x={30} y={190} s={13} f={C.crema} o={Math.max(0.3, a)}>
        three slots summed: 11, 10, 8 —
      </T>
      <T x={30} y={210} s={13} f={C.crema} o={Math.max(0.3, a)}>
        the running total through minute 11
      </T>
    </Svg>
  );
}

// 7 · RangeReveal: two prefix bars subtracted to a range bar; the two-tree range-add
export function RangeReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  const b = easeOut(seg(t, 0.55, 1));
  const c = easeOut(seg(t, 1.0, 1.5));
  return (
    <Svg label="Two prefix-sum bars subtracted into one range-sum bar; a range-wide correction via two Fenwick trees" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>
        range sum, minutes 5 through 11
      </T>
      <rect x={30} y={40} width={300 * a} height={16} rx={3} fill={C.crema} opacity={Math.max(0.3, a)} />
      <T x={30} y={72} s={13} f={C.crema} o={a}>prefix through 11</T>
      <rect x={30} y={88} width={40 * b} height={16} rx={3} fill={C.latte} opacity={Math.max(0.3, b)} />
      <T x={30} y={120} s={13} f={C.latte} o={b}>minus prefix through 4</T>
      <rect x={30} y={136} width={260 * c} height={16} rx={3} fill={C.caramel} opacity={Math.max(0.3, c)} />
      <T x={30} y={168} s={13} f={C.caramel} o={c}>= 30, minutes 5..11</T>
      <T x={30} y={210} s={13} f={C.latte} o={c}>
        two Fenwick trees together extend
      </T>
      <T x={30} y={230} s={13} f={C.latte} o={c}>
        this to a range-wide update
      </T>
      <T x={30} y={258} s={13} f={C.crema} o={c}>
        +10 to every minute, 5 through 11 —
      </T>
      <T x={30} y={278} s={13} f={C.crema} o={c}>
        range sum still correct: 100
      </T>
    </Svg>
  );
}

// 8 · TwoDPredict: a 4x4 grid beside the 1D array, same jump-arrow language
export function TwoDPredict({ answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A small four-by-four grid drawn beside the one-dimensional array" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>
        the same arithmetic, a second axis
      </T>
      {row(30, 40, 240, [], C.crema, 1, false)}
      <T x={30} y={78} s={13} f={C.latte}>1D array</T>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <rect key={`g-${r}-${c}`} x={340 + c * 30} y={30 + r * 30} width={26} height={26} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} />
        )),
      )}
      <T x={340} y={160} s={13} f={C.latte}>4-by-4 grid</T>
      <T x={30} y={200} s={13} f={answered ? C.crema : C.cherryText}>
        {answered ? 'the same index jumps, nested along a second axis' : 'a new mechanism, or the same jumps, twice?'}
      </T>
    </Svg>
  );
}

// 9 · TwoDReveal: nested jump path across both axes, arriving at the measured total
export function TwoDReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  const b = easeOut(seg(t, 0.55, 1));
  return (
    <Svg label="A nested jump path across rows and columns of the grid, arriving at the measured prefix sum" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>
        one jump sequence per row,
      </T>
      <T x={30} y={44} s={13} f={C.latte}>
        nested inside one per column
      </T>
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => {
          const k = easeOut(seg(t, 0.1 + r * 0.15 + c * 0.05, 0.4 + r * 0.15 + c * 0.05));
          return (
            <rect
              key={`g2-${r}-${c}`}
              x={120 + c * 50}
              y={50 + r * 50}
              width={44}
              height={44}
              rx={3}
              fill="none"
              stroke={C.caramel}
              strokeWidth={1.4}
              opacity={Math.max(0.25, k)}
            />
          );
        }),
      )}
      <T x={30} y={270} s={13} f={C.crema} o={Math.max(0.3, b)}>
        full grid prefix sum: 73
      </T>
      <T x={30} y={290} s={13} f={C.crema} o={Math.max(0.3, b)}>
        verified by brute force
      </T>
    </Svg>
  );
}

// 10 · ProveIt: naive-vs-Fenwick workload bars, real measured counts
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.55, 1.1));
  return (
    <Svg label="Two bars: naive cached-prefix cost against Fenwick index-jump cost, over ten updates and ten queries" h={260}>
      <T x={30} y={24} s={13} f={C.crema}>
        ten updates, ten queries,
      </T>
      <T x={30} y={44} s={13} f={C.crema}>
        the same 15-slot array
      </T>
      <rect x={30} y={60} width={300 * a} height={28} rx={4} fill={C.cherry} opacity={Math.max(0.3, a)} />
      <T x={340 * a + 30} y={79} s={15} f={C.cherryText} o={a}>
        97
      </T>
      <T x={30} y={106} s={13} f={C.cherryText} o={a}>
        naive cached total — slot-touches
      </T>
      <rect x={30} y={132} width={300 * (47 / 97) * b} height={28} rx={4} fill={C.caramel} opacity={Math.max(0.3, b)} />
      <T x={30 + 300 * (47 / 97) * b + 10} y={151} s={15} f={C.crema} o={b}>
        47
      </T>
      <T x={30} y={178} s={13} f={C.crema} o={b}>
        Fenwick tree — index jumps
      </T>
    </Svg>
  );
}
