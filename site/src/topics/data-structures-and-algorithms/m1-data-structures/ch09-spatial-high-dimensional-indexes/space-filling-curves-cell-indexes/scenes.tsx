import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the grid's own live state; latte = secondary labels
// (a coordinate pair, a curve's own step number); taupe = a cell not yet visited; caramel =
// the thing to look at (the curve's own path as it's traced, cell by cell); cinnamon (rare) =
// the alternative being compared (Z-order's path set directly against Hilbert's); cherry with
// cherryText = the bad outcome (two near-neighbour cells landing far apart in row-major order).

const CELL = 36;
const GX = 40;
const GY = 40;

function cellPos(x: number, y: number) {
  return { cx: GX + x * CELL + CELL / 2, cy: GY + y * CELL + CELL / 2 };
}

// A small 4x4 grid, each cell drawn once, labeled with its own real coordinates.
function grid(n: number, colour = C.taupe) {
  const items: React.ReactNode[] = [];
  for (let x = 0; x < n; x++) {
    for (let y = 0; y < n; y++) {
      items.push(
        <rect key={`g-${x}-${y}`} x={GX + x * CELL} y={GY + y * CELL} width={CELL} height={CELL} fill="none" stroke={colour} strokeWidth={1} />,
      );
    }
  }
  return items;
}

// Trace a curve's own visiting order as a connected path, revealed up to fraction `a`.
function tracePath(path: [number, number][], a: number, colour = C.caramel) {
  const n = path.length;
  const upto = Math.max(1, Math.floor(a * n));
  const pts = path.slice(0, upto).map(([x, y]) => cellPos(x, y));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ');
  return (
    <>
      <path d={d} fill="none" stroke={colour} strokeWidth={1.8} opacity={Math.min(1, a * 1.3)} />
      {pts.map((p, i) => (
        <circle key={`tp-${i}`} cx={p.cx} cy={p.cy} r={4} fill={colour} opacity={Math.min(1, a * 1.3)} />
      ))}
    </>
  );
}

// Z-order's own real traced path over a 4x4 grid (interleaved bits, order 2).
const ZORDER_PATH: [number, number][] = [
  [0, 0], [1, 0], [0, 1], [1, 1],
  [2, 0], [3, 0], [2, 1], [3, 1],
  [0, 2], [1, 2], [0, 3], [1, 3],
  [2, 2], [3, 2], [2, 3], [3, 3],
];

// Hilbert's own real traced path over the identical 4x4 grid.
const HILBERT_PATH: [number, number][] = [
  [0, 0], [1, 0], [1, 1], [0, 1],
  [0, 2], [0, 3], [1, 3], [1, 2],
  [2, 2], [2, 3], [3, 3], [3, 2],
  [3, 1], [2, 1], [2, 0], [3, 0],
];

function label(x: number, y: number, text: string, colour = C.latte) {
  const { cx, cy } = cellPos(x, y);
  return (
    <T key={`l-${x}-${y}`} x={cx} y={cy + 4} s={11} f={colour} a="middle">
      {text}
    </T>
  );
}

// 1 · Opening: two neighbouring grid points, how far apart once ordered into one line
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A small grid of points, two neighbouring cells highlighted" h={260}>
      {grid(4)}
      <circle {...cellPos(1, 2)} r={6} fill={C.cherry} />
      <circle {...cellPos(1, 1)} r={6} fill={C.cherry} />
      <T x={GX} y={GY + 4 * CELL + 24} s={13} f={C.cherryText} o={a}>
        two grid neighbours — how far apart in one line?
      </T>
    </Svg>
  );
}

// 2 · NaiveReveal: row-major numbering, a vertical neighbour's own large gap
export function NaiveReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.9));
  const n = 4;
  return (
    <Svg label="The grid numbered row by row, a vertically adjacent pair's own large gap highlighted" h={260}>
      {grid(n)}
      {Array.from({ length: n }).map((_, y) =>
        Array.from({ length: n }).map((__, x) => label(x, y, String(y * n + x), C.crema)),
      )}
      <circle {...cellPos(1, 1)} r={5} fill="none" stroke={C.cherry} strokeWidth={2} opacity={a} />
      <circle {...cellPos(1, 2)} r={5} fill="none" stroke={C.cherry} strokeWidth={2} opacity={a} />
      <T x={GX} y={GY + n * CELL + 24} s={13} f={C.cherryText} o={a}>
        one row down, a jump of a whole row's width
      </T>
    </Svg>
  );
}

// 3 · ZOrderPredict: the grid about to be traced by interleaved bits
export function ZOrderPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="The same grid, a question mark over the ordering about to be traced" h={260}>
      {grid(4)}
      <circle {...cellPos(2, 2)} r={6} fill={C.caramel} opacity={Math.max(0.4, pulse)} />
      <T x={GX} y={GY + 4 * CELL + 24} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'close in most places — but not at every boundary' : 'does interleaving bits fix every neighbour pair, or only some?'}
      </T>
    </Svg>
  );
}

// 4 · ZOrderReveal: the Z-order path traced cell by cell by bit-interleaving
export function ZOrderReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1));
  return (
    <Svg label="Z-order's own path traced cell by cell by bit-interleaving" h={260}>
      {grid(4)}
      {tracePath(ZORDER_PATH, a, C.caramel)}
      <T x={GX} y={GY + 4 * CELL + 24} s={13} f={C.crema} o={a}>
        every cell visited once, tied to both coordinates
      </T>
    </Svg>
  );
}

// 5 · BoundaryReveal: a tight in-quadrant gap beside a large boundary-crossing gap
export function BoundaryReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.85));
  return (
    <Svg label="A tight gap inside one quadrant beside a large gap across a quadrant boundary" h={260}>
      {grid(4)}
      {tracePath(ZORDER_PATH, 1, C.taupe)}
      <circle {...cellPos(0, 0)} r={5} fill="none" stroke={C.crema} strokeWidth={2} />
      <circle {...cellPos(1, 0)} r={5} fill="none" stroke={C.crema} strokeWidth={2} />
      <circle {...cellPos(1, 2)} r={5} fill="none" stroke={C.cherry} strokeWidth={2} opacity={a} />
      <circle {...cellPos(2, 2)} r={5} fill="none" stroke={C.cherry} strokeWidth={2} opacity={a} />
      <T x={GX} y={GY + 4 * CELL + 24} s={13} f={C.cherryText} o={a}>
        crossing a quadrant boundary jumps the ordering far
      </T>
    </Svg>
  );
}

// 6 · HilbertPredict: the same boundary pair, a sketched Hilbert turn beside it
export function HilbertPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="The boundary pair again, beside a sketched Hilbert path's own turn there" h={260}>
      {grid(4)}
      <circle {...cellPos(1, 2)} r={5} fill="none" stroke={C.cherry} strokeWidth={2} />
      <circle {...cellPos(2, 2)} r={5} fill="none" stroke={C.cherry} strokeWidth={2} />
      <path d={`M ${cellPos(1, 2).cx} ${cellPos(1, 2).cy} L ${cellPos(2, 2).cx} ${cellPos(2, 2).cy}`} stroke={C.caramel} strokeWidth={2} opacity={Math.max(0.4, pulse)} strokeDasharray="4,3" />
      <T x={GX} y={GY + 4 * CELL + 24} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'yes — recursion keeps this pair adjacent' : 'can a recursively built curve avoid this exact jump?'}
      </T>
    </Svg>
  );
}

// 7 · HilbertReveal: the Hilbert path traced beside Z-order's own path
export function HilbertReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1));
  return (
    <Svg label="The Hilbert path traced by its own recursive construction, beside Z-order's path" h={260}>
      {grid(4)}
      {tracePath(ZORDER_PATH, 1, C.cinnamon)}
      {tracePath(HILBERT_PATH, a, C.caramel)}
      <T x={GX} y={GY + 4 * CELL + 24} s={13} f={C.crema} o={a}>
        the same boundary pair stays adjacent here
      </T>
    </Svg>
  );
}

// 8 · CellIndexReveal: three panels, one per production system, each its own choice
export function CellIndexReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.4, 0.8));
  const c = easeOut(seg(t, 0.7, 1.1));
  return (
    <Svg label="Three panels: geohash, S2, and H3, each one's own distinguishing choice" h={260}>
      <T x={30} y={24} s={13} f={C.crema} o={a}>geohash: Z-order over latitude and longitude</T>
      <T x={30} y={54} s={13} f={C.crema} o={b}>S2: a cube's six faces, a Hilbert curve on each</T>
      <T x={30} y={84} s={13} f={C.crema} o={c}>H3: hexagons — every neighbour equidistant</T>
      <g opacity={a}>
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={`sq-${i}`} x={30 + i * 20} y={110} width={16} height={16} fill="none" stroke={C.latte} strokeWidth={1} />
        ))}
      </g>
      <g opacity={c}>
        <polygon points="80,170 96,179 96,197 80,206 64,197 64,179" fill="none" stroke={C.caramel} strokeWidth={1.4} />
      </g>
    </Svg>
  );
}

// 9 · Prove it: three grouped bars, one per measured pair, three orderings each
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.4, 0.8));
  const c = easeOut(seg(t, 0.7, 1.1));
  const bar = (x: number, y: number, w: number, colour: string, op: number) => (
    <rect x={x} y={y} width={Math.max(2, w)} height={14} fill={colour} opacity={Math.max(0.3, op)} />
  );
  return (
    <Svg label="Three near-neighbour pairs, each one's real distance in row-major, Z-order, and Hilbert order" h={280}>
      <T x={30} y={20} s={12} f={C.latte}>origin pair</T>
      {bar(30, 28, 8 * a, C.crema, a)}
      {bar(30, 46, 8 * a, C.cinnamon, a)}
      {bar(30, 64, 24 * a, C.caramel, a)}
      <T x={30} y={90} s={12} f={C.latte} o={b}>boundary pair (horizontal)</T>
      {bar(30, 98, 8 * b, C.crema, b)}
      {bar(30, 116, 88 * b, C.cinnamon, b)}
      {bar(30, 134, 8 * b, C.caramel, b)}
      <T x={30} y={160} s={12} f={C.latte} o={c}>boundary pair (vertical)</T>
      {bar(30, 168, 64 * c, C.crema, c)}
      {bar(30, 186, 176 * c, C.cinnamon, c)}
      {bar(30, 204, 8 * c, C.caramel, c)}
      <T x={30} y={240} s={13} f={C.crema} o={c}>row-major / Z-order / Hilbert — not always the smallest</T>
    </Svg>
  );
}
