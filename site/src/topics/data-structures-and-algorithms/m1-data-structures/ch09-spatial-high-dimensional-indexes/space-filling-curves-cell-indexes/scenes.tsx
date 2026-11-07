import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the grid and its live state; latte = labels; caramel = the thing to look at
// (the pair being measured, the Hilbert curve); cinnamon = the compared ordering (Z-order); cherryText = the jump
// across a boundary. The grid is examples.py's own 8x8, and its three orderings are computed here by the same
// functions (row-major, Morton interleaving, the standard Hilbert xy-to-d); every printed distance is printed by
// examples.py.

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

type Pt = [number, number];
const N = 8;

const rowMajor = (x: number, y: number) => y * N + x;
const morton = (x: number, y: number) => {
  let z = 0;
  for (let i = 0; i < 3; i++) {
    z |= ((x >> i) & 1) << (2 * i);
    z |= ((y >> i) & 1) << (2 * i + 1);
  }
  return z;
};
/** The standard Hilbert xy-to-d over an n x n grid (examples.py's hilbert_code, with n as a parameter). */
const hilbert = (n: number, x0: number, y0: number) => {
  let x = x0;
  let y = y0;
  let d = 0;
  for (let s = n / 2; s >= 1; s = Math.floor(s / 2)) {
    const rx = (x & s) > 0 ? 1 : 0;
    const ry = (y & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry === 0) {
      if (rx === 1) {
        x = n - 1 - x;
        y = n - 1 - y;
      }
      [x, y] = [y, x];
    }
  }
  return d;
};

/** The cells of an n x n grid in the order a code visits them. */
function order(n: number, code: (x: number, y: number) => number): Pt[] {
  const out: Pt[] = Array(n * n);
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) out[code(x, y)] = [x, y];
  return out;
}
const ROW = order(N, rowMajor);
const ZED = order(N, morton);
const HIL = order(N, (x, y) => hilbert(N, x, y));

function Grid({ gx, gy, c, o = 1, stroke = C.mocha }: { gx: number; gy: number; c: number; o?: number; stroke?: string }) {
  return (
    <g opacity={o}>
      {Array.from({ length: N * N }, (_, k) => (
        <rect key={k} x={gx + (k % N) * c} y={gy + Math.floor(k / N) * c} width={c} height={c} fill="none" stroke={stroke} strokeWidth={0.8} />
      ))}
    </g>
  );
}

const centre = (gx: number, gy: number, c: number, p: Pt): Pt => [gx + p[0] * c + c / 2, gy + p[1] * c + c / 2];

function Mark({ gx, gy, c, p, f = C.caramel, o = 1 }: { gx: number; gy: number; c: number; p: Pt; f?: string; o?: number }) {
  return <rect x={gx + p[0] * c + 2} y={gy + p[1] * c + 2} width={c - 4} height={c - 4} rx={3} fill={f} opacity={o} />;
}

// 1 · Opening. An 8x8 map with two neighbouring cells marked. Every cell drops out of the grid into one long line
// (row by row); the two marked cells land apart, with a question mark between them.
export function Opening({ t }: StepCtx) {
  const c = 22;
  const gx = 30;
  const gy = 40;
  const A: Pt = [0, 3];
  const B: Pt = [0, 4];
  const lineY = 250;
  const LX = (k: number) => 30 + k * 8.5;
  const q = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="An eight by eight map with two neighbouring cells; squeezed cell by cell into one line, the two neighbours land apart" h={310}>
      <Grid gx={gx} gy={gy} c={c} />
      <T x={260} y={60} s={13} f={C.latte}>two neighbours on a map</T>
      {ROW.map((p, k) => {
        const m = (p[0] === A[0] && p[1] === A[1]) || (p[0] === B[0] && p[1] === B[1]);
        const kk = easeInOut(seg(t, 0.8 + k * 0.025, 1.4 + k * 0.025));
        const [cx, cy] = centre(gx, gy, c, p);
        const x = lerp(cx - c / 2 + 2, LX(k), kk);
        const y = lerp(cy - c / 2 + 2, lineY, kk);
        const w = lerp(c - 4, 7, kk);
        return <rect key={k} x={x} y={y} width={w} height={lerp(c - 4, 14, kk)} rx={2} fill={m ? C.caramel : C.mocha} opacity={m ? 1 : 0.4 + 0.6 * kk} />;
      })}
      <T x={30} y={236} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>one line</T>
      <g opacity={q}>
        <path d={`M ${LX(24) + 3} 272 L ${LX(24) + 3} 278 L ${LX(32) + 3} 278 L ${LX(32) + 3} 272`} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={(LX(24) + LX(32)) / 2 + 3} y={292} s={14} f={C.caramel} a="middle">?</T>
      </g>
    </Svg>
  );
}

// 2 · Row-major. The numbers 0..63 fill the grid row by row while the row-major path draws, with its long return
// jump at the end of every row. Then one step down, from (0, 3) to (0, 4), is 8 apart in the ordering.
export function NaiveReveal({ t }: StepCtx) {
  const c = 28;
  const gx = 30;
  const gy = 36;
  const pts = ROW.map((p) => [centre(gx, gy, c, p)[0], centre(gx, gy, c, p)[1] + 9] as Pt);
  const dim = 1 - 0.6 * easeOut(seg(t, 0.4, 1.0));
  const pair = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="Row-major numbers the grid row by row, jumping back at the end of every row; one step down from (0, 3) to (0, 4) is 8 apart" h={290}>
      <Grid gx={gx} gy={gy} c={c} />
      {ROW.map((p, k) => (
        <T key={k} x={centre(gx, gy, c, p)[0]} y={centre(gx, gy, c, p)[1] + 4} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.2 + k * 0.025, 0.4 + k * 0.025)) * dim}>{k}</T>
      ))}
      <Draw pts={pts} t={t} from={0.3} to={2.0} stroke={C.crema} w={1.3} pen={false} o={0.7} />
      <Mark gx={gx} gy={gy} c={c} p={[0, 3]} o={pair * 0.85} />
      <Mark gx={gx} gy={gy} c={c} p={[0, 4]} o={pair * 0.85} />
      <Draw pts={pts.slice(24, 33)} t={t} from={2.6} to={3.2} stroke={C.cherryText} w={2.6} pen={false} />
      <T x={290} y={130} s={13} f={C.latte} o={pair}>one step down,</T>
      <T x={290} y={154} s={14} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>8 apart</T>
    </Svg>
  );
}

// 3 · Predict. Interleaving, shown on examples.py's own hand-check: x = 3 (011) and y = 5 (101) weave, a bit from
// each in turn, into 100111 = 39. Does that keep every neighbour close? After answering: on the grid, one pair
// stays 1 apart (caramel) and one pair across the middle jumps 11 (red).
export function ZOrderPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const c = 24;
  const gx = 360;
  const gy = 40;
  const weave = easeInOut(seg(t, 0.4, 1.4));
  const xb = ['0', '1', '1'];
  const yb = ['1', '0', '1'];
  return (
    <Svg label="x equals 3, bits 011, and y equals 5, bits 101, interleaved into 100111, which is 39; after answering, a pair near the origin stays 1 apart and a pair across the middle jumps 11" h={290}>
      <T x={30} y={34} s={13} f={C.latte}>x = 3</T>
      <T x={30} y={64} s={13} f={C.latte}>y = 5</T>
      {xb.map((b, i) => <T key={`x${i}`} x={lerp(110 + i * 22, 110 + (2 * i + 1) * 20, weave)} y={lerp(34, 120, weave)} s={16} f={C.cinnamon} a="middle">{b}</T>)}
      {yb.map((b, i) => <T key={`y${i}`} x={lerp(110 + i * 22, 110 + 2 * i * 20, weave)} y={lerp(64, 120, weave)} s={16} f={C.crema} a="middle">{b}</T>)}
      <T x={30} y={160} s={14} f={C.caramel} o={easeOut(seg(t, 1.5, 1.8))}>= 39</T>
      <Grid gx={gx} gy={gy} c={c} />
      <Mark gx={gx} gy={gy} c={c} p={[3, 5]} f={C.cinnamon} o={easeOut(seg(t, 1.6, 1.9))} />
      {answered && (
        <>
          <Mark gx={gx} gy={gy} c={c} p={[0, 0]} o={easeOut(seg(s, 0.2, 0.5))} />
          <Mark gx={gx} gy={gy} c={c} p={[1, 0]} o={easeOut(seg(s, 0.2, 0.5))} />
          <Mark gx={gx} gy={gy} c={c} p={[3, 4]} f={C.cherryText} o={easeOut(seg(s, 0.6, 0.9))} />
          <Mark gx={gx} gy={gy} c={c} p={[4, 4]} f={C.cherryText} o={easeOut(seg(s, 0.6, 0.9))} />
          <T x={gx} y={gy + 8 * c + 22} s={12} f={C.caramel} o={easeOut(seg(s, 0.4, 0.7))}>1 apart</T>
          <T x={gx + 100} y={gy + 8 * c + 22} s={12} f={C.cherryText} o={easeOut(seg(s, 0.8, 1.1))}>11 apart</T>
        </>
      )}
      {!answered && <T x={30} y={270} s={15} f={C.cherryText} o={pulse}>every neighbour close?</T>}
      {answered && <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.6))}>most, not all</T>}
    </Svg>
  );
}

// 4 · The Z path. The curve through z = 0, 1, 2, ... draws over the grid: small Zs, then Zs of Zs. A dot rides
// along it; at z = 39 it rings cell (3, 5), the hand-checked code. Every cell, once.
export function ZOrderReveal({ t }: StepCtx) {
  const c = 30;
  const gx = 30;
  const gy = 30;
  const pts = ZED.map((p) => centre(gx, gy, c, p));
  const prog = clamp((t - 0.3) / 3.0);
  const k = Math.min(63, Math.floor(prog * 63));
  const ring = t > 0.3 + (39 / 63) * 3.0 ? easeOutBack(seg(t, 0.3 + (39 / 63) * 3.0, 0.55 + (39 / 63) * 3.0)) : 0;
  return (
    <Svg label="The Z-order curve draws through every cell in order of its interleaved code, small Z shapes nested in larger ones, reaching cell (3, 5) at code 39" h={290}>
      <Grid gx={gx} gy={gy} c={c} />
      <Draw pts={pts} t={t} from={0.3} to={3.3} stroke={C.cinnamon} w={1.8} pen={false} />
      {t > 0.3 && t < 3.4 && <circle cx={pts[k][0]} cy={pts[k][1]} r={5} fill={C.cinnamon} />}
      {ring > 0.001 && <rect x={gx + 3 * c} y={gy + 5 * c} width={c} height={c} rx={3} fill="none" stroke={C.caramel} strokeWidth={2.4} opacity={clamp(ring)} />}
      <T x={300} y={60} s={13} f={C.cinnamon}>z = interleaved bits</T>
      <T x={300} y={90} s={13} f={C.caramel} o={clamp(ring)}>(3, 5) at z = 39</T>
      <T x={300} y={200} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>every cell, exactly once</T>
    </Svg>
  );
}

// 5 · The boundary. The Z path, faint. Near the origin, (0, 0) and (1, 0) sit 1 apart along it. Then (0, 3) and
// (0, 4), either side of the y = 4 boundary (red line): a dot runs the curve from one to the other, the stretch
// it covers lighting red: 22 apart.
export function BoundaryReveal({ t }: StepCtx) {
  const c = 30;
  const gx = 30;
  const gy = 30;
  const pts = ZED.map((p) => centre(gx, gy, c, p));
  const a = morton(0, 3);
  const b = morton(0, 4);
  const near = easeOut(seg(t, 0.3, 0.7));
  const line = easeOut(seg(t, 1.3, 1.6));
  const run = seg(t, 1.8, 3.2);
  const at = Math.floor(lerp(a, b, run));
  return (
    <Svg label="Along the Z curve, (0, 0) and (1, 0) are 1 apart; (0, 3) and (0, 4), on either side of the y equals 4 boundary, are 22 apart" h={290}>
      <Grid gx={gx} gy={gy} c={c} />
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.cinnamon} strokeWidth={1.2} opacity={0.4} />
      <Mark gx={gx} gy={gy} c={c} p={[0, 0]} o={near * 0.8} />
      <Mark gx={gx} gy={gy} c={c} p={[1, 0]} o={near * 0.8} />
      <T x={300} y={50} s={13} f={C.caramel} o={near}>(0,0)&ndash;(1,0): 1 apart</T>
      <line x1={gx - 6} y1={gy + 4 * c} x2={gx + 8 * c + 6} y2={gy + 4 * c} stroke={C.cherryText} strokeWidth={2} opacity={line} strokeDasharray="5 4" />
      <Mark gx={gx} gy={gy} c={c} p={[0, 3]} f={C.cherryText} o={line * 0.8} />
      <Mark gx={gx} gy={gy} c={c} p={[0, 4]} f={C.cherryText} o={line * 0.8} />
      {run > 0 && <polyline points={pts.slice(a, at + 1).map((p) => p.join(',')).join(' ')} fill="none" stroke={C.cherryText} strokeWidth={2.4} />}
      {run > 0 && run < 1 && <circle cx={pts[at][0]} cy={pts[at][1]} r={5} fill={C.cherryText} />}
      <T x={300} y={150} s={13} f={C.latte} o={line}>across the boundary:</T>
      <T x={300} y={176} s={16} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.5))}>22 apart</T>
    </Svg>
  );
}

// The Hilbert curve at order 1, 2 and 3, scaled to the same square.
const hilbertPts = (n: number, gx: number, gy: number, side: number): Pt[] =>
  order(n, (x, y) => hilbert(n, x, y)).map((p) => [gx + (p[0] + 0.5) * (side / n), gy + (p[1] + 0.5) * (side / n)]);

// 6 · Predict. The same pair either side of the boundary, with only the first, coarsest Hilbert step drawn (a U
// through the four quadrants). Can a recursive curve keep them together? After answering: the full curve's one
// step joining them lights: 1 apart.
export function HilbertPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const c = 30;
  const gx = 30;
  const gy = 30;
  const full = hilbertPts(N, gx, gy, 8 * c);
  const i3 = hilbert(N, 0, 3);
  const i4 = hilbert(N, 0, 4);
  return (
    <Svg label="The pair either side of the boundary under a coarse Hilbert U; after answering, the full Hilbert curve joins them in a single step, 1 apart" h={290}>
      <Grid gx={gx} gy={gy} c={c} />
      <polyline points={hilbertPts(2, gx, gy, 8 * c).map((p) => p.join(',')).join(' ')} fill="none" stroke={C.caramel} strokeWidth={2} opacity={answered ? 0.25 : 0.6} />
      {answered && <polyline points={full.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.caramel} strokeWidth={1.2} opacity={0.45 * easeOut(seg(s, 0.1, 0.5))} />}
      <line x1={gx - 6} y1={gy + 4 * c} x2={gx + 8 * c + 6} y2={gy + 4 * c} stroke={C.cherryText} strokeWidth={2} strokeDasharray="5 4" opacity={answered ? 0.5 : pulse} />
      <Mark gx={gx} gy={gy} c={c} p={[0, 3]} f={answered ? C.caramel : C.cherryText} o={0.8} />
      <Mark gx={gx} gy={gy} c={c} p={[0, 4]} f={answered ? C.caramel : C.cherryText} o={0.8} />
      {answered && <Draw pts={[full[Math.min(i3, i4)], full[Math.max(i3, i4)]]} t={s} from={0.5} to={0.8} stroke={C.caramel} w={3.4} pen={false} />}
      {!answered && <T x={300} y={150} s={15} f={C.cherryText} o={pulse}>keep these together?</T>}
      {answered && <T x={300} y={150} s={16} f={C.caramel} o={easeOut(seg(s, 0.8, 1.2))}>1 apart</T>}
    </Svg>
  );
}

// 7 · Hilbert, built by recursion. Order 1: a U through four quadrants. Order 2: each quadrant replaced by a smaller
// U, turned so its ends meet its neighbours'. Order 3: again, every cell once. Then the boundary pair: 1 apart on
// Hilbert, against 22 on Z-order.
export function HilbertReveal({ t }: StepCtx) {
  const c = 30;
  const gx = 30;
  const gy = 30;
  const side = 8 * c;
  const lv = [2, 4, 8].map((n) => hilbertPts(n, gx, gy, side));
  const fadeOut = (j: number) => 1 - easeOut(seg(t, 1.0 + j * 1.0, 1.3 + j * 1.0));
  const pair = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="The Hilbert curve built by recursion: a U through four quadrants, then each quadrant a smaller turned U, then again; the boundary pair ends up 1 apart, against 22 on Z-order" h={290}>
      <Grid gx={gx} gy={gy} c={c} />
      <Draw pts={lv[0]} t={t} from={0.2} to={0.8} stroke={C.caramel} w={2.6} pen={false} o={fadeOut(0) * 0.9 + 0.1} />
      <Draw pts={lv[1]} t={t} from={1.1} to={1.9} stroke={C.caramel} w={2} pen={false} o={fadeOut(1) * 0.8 + 0.2} />
      <Draw pts={lv[2]} t={t} from={2.1} to={3.1} stroke={C.caramel} w={1.6} pen={false} />
      <T x={300} y={50} s={13} f={C.caramel} o={easeOut(seg(t, 0.2, 0.5)) * fadeOut(0)}>a U over 4 quadrants</T>
      <T x={300} y={50} s={13} f={C.caramel} o={easeOut(seg(t, 1.1, 1.4)) * fadeOut(1)}>each quadrant: a turned U</T>
      <T x={300} y={50} s={13} f={C.caramel} o={easeOut(seg(t, 2.1, 2.4))}>again: every cell once</T>
      <Mark gx={gx} gy={gy} c={c} p={[0, 3]} o={pair * 0.8} />
      <Mark gx={gx} gy={gy} c={c} p={[0, 4]} o={pair * 0.8} />
      <T x={300} y={150} s={13} f={C.latte} o={pair}>the boundary pair:</T>
      <T x={300} y={176} s={14} f={C.caramel} o={pair}>Hilbert: 1 apart</T>
      <T x={300} y={200} s={14} f={C.cinnamon} o={easeOut(seg(t, 3.6, 3.9))}>Z-order: 22 apart</T>
    </Svg>
  );
}

// 8 · Three systems, three choices. Geohash: a square run through by a Z, its cells read off as a short string.
// S2: a cube, unfolded, a Hilbert U on each of its six faces. H3: a hexagon and its six neighbours, every centre the
// same distance away; beside it a square, whose corner neighbour sits farther than its edge neighbour.
export function CellIndexReveal({ t }: StepCtx) {
  const p1 = easeOut(seg(t, 0.3, 0.7));
  const p2 = easeOut(seg(t, 1.5, 1.9));
  const p3 = easeOut(seg(t, 2.8, 3.2));
  const zSmall = order(4, (x, y) => {
    let z = 0;
    for (let i = 0; i < 2; i++) {
      z |= ((x >> i) & 1) << (2 * i);
      z |= ((y >> i) & 1) << (2 * i + 1);
    }
    return z;
  }).map((p) => [40 + (p[0] + 0.5) * 30, 50 + (p[1] + 0.5) * 30] as Pt);
  const faces: Pt[] = [[260, 80], [300, 80], [340, 80], [380, 80], [300, 40], [300, 120]];
  const hex = (cx: number, cy: number, r: number) => Array.from({ length: 6 }, (_, i) => `${cx + r * Math.cos((Math.PI / 3) * i + Math.PI / 6)},${cy + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)}`).join(' ');
  const hx = 480;
  const hy = 210;
  const hr = 20;
  return (
    <Svg label="Geohash runs a Z-order curve and spells the cell as a short string; S2 unfolds a cube and runs a Hilbert curve on each of six faces; H3 uses hexagons, whose six neighbours are all the same distance away, where a square's corner neighbour is farther than its edge neighbour" h={320}>
      <g opacity={p1}>
        <T x={40} y={34} s={13} f={C.cinnamon}>geohash</T>
        <rect x={40} y={50} width={120} height={120} fill="none" stroke={C.mocha} />
        <Draw pts={zSmall} t={t} from={0.4} to={1.3} stroke={C.cinnamon} w={1.6} pen={false} />
        <T x={40} y={196} s={12} f={C.latte}>Z-order, as a string</T>
      </g>
      <g opacity={p2}>
        <T x={250} y={24} s={13} f={C.caramel}>S2</T>
        {faces.map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width={38} height={38} fill="none" stroke={C.latte} strokeWidth={1} />
            <Draw pts={[[x + 10, y + 28], [x + 10, y + 10], [x + 28, y + 10], [x + 28, y + 28]]} t={t} from={1.7 + i * 0.12} to={1.9 + i * 0.12} stroke={C.caramel} w={1.6} pen={false} />
          </g>
        ))}
        <T x={250} y={186} s={12} f={C.latte}>Hilbert on 6 cube faces</T>
      </g>
      <g opacity={p3}>
        <T x={440} y={150} s={13} f={C.crema}>H3</T>
        <polygon points={hex(hx, hy, hr)} fill={C.roast} stroke={C.caramel} strokeWidth={1.6} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i;
          const nx = hx + Math.sqrt(3) * hr * Math.cos(a);
          const ny = hy + Math.sqrt(3) * hr * Math.sin(a);
          return (
            <g key={i}>
              <polygon points={hex(nx, ny, hr)} fill="none" stroke={C.latte} strokeWidth={1} />
              <Draw pts={[[hx, hy], [nx, ny]]} t={t} from={3.2 + i * 0.06} to={3.4 + i * 0.06} stroke={C.caramel} w={1.4} pen={false} />
            </g>
          );
        })}
        <T x={300} y={300} s={12} f={C.caramel}>hexagon: 6 equal</T>
        <g transform="translate(40 230)">
          {[0, 1, 2].map((i) => [0, 1, 2].map((j) => <rect key={`${i}${j}`} x={i * 22} y={j * 22} width={22} height={22} fill={i === 1 && j === 1 ? C.roast : 'none'} stroke={i === 1 && j === 1 ? C.crema : C.mocha} strokeWidth={1} />))}
          <Draw pts={[[33, 33], [55, 33]]} t={t} from={3.6} to={3.8} stroke={C.crema} w={1.6} pen={false} />
          <Draw pts={[[33, 33], [55, 55]]} t={t} from={3.8} to={4.0} stroke={C.cherryText} w={1.6} pen={false} />
        </g>
        <T x={110} y={262} s={12} f={C.cherryText} o={easeOut(seg(t, 3.9, 4.2))}>square: corner farther</T>
      </g>
    </Svg>
  );
}

// 9 · Prove it. examples.py's three pairs, three orderings each: (0,0)-(1,0) at the origin 1, 1, 3; (3,4)-(4,4)
// across x = 4: 1, 11, 1; (0,3)-(0,4) across y = 4: 8, 22, 1. Averages 3.33, 11.33, 1.67.
export function ProveIt({ t }: StepCtx) {
  const pairs: [string, number[]][] = [
    ['origin (0,0)-(1,0)', [1, 1, 3]],
    ['across x=4 (3,4)-(4,4)', [1, 11, 1]],
    ['across y=4 (0,3)-(0,4)', [8, 22, 1]],
  ];
  const cols = [C.crema, C.cinnamon, C.caramel];
  const S = 12;
  return (
    <Svg label="Measured distances: at the origin, row-major 1, Z-order 1, Hilbert 3; across x equals 4, 1, 11 and 1; across y equals 4, 8, 22 and 1; averages 3.33, 11.33 and 1.67" h={350}>
      <T x={30} y={24} s={12} f={C.crema}>row-major</T>
      <T x={150} y={24} s={12} f={C.cinnamon}>Z-order</T>
      <T x={250} y={24} s={12} f={C.caramel}>Hilbert</T>
      {pairs.map(([name, ds], i) => {
        const y0 = 46 + i * 84;
        return (
          <g key={name}>
            <T x={30} y={y0 + 4} s={12} f={C.latte} o={easeOut(seg(t, 0.2 + i * 0.7, 0.4 + i * 0.7))}>{name}</T>
            {ds.map((d, j) => {
              const g = easeInOut(seg(t, 0.4 + i * 0.7 + j * 0.12, 0.8 + i * 0.7 + j * 0.12));
              const y = y0 + 12 + j * 21;
              return (
                <g key={j}>
                  <rect x={30} y={y} width={d * S * g} height={12} rx={2} fill={cols[j]} />
                  <T x={30 + d * S + 8} y={y + 11} s={12} f={cols[j]} o={g}>{d}</T>
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={30} y={310} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>averages</T>
      <T x={130} y={310} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.3))}>3.33</T>
      <T x={210} y={310} s={13} f={C.cinnamon} o={easeOut(seg(t, 3.2, 3.5))}>11.33</T>
      <T x={300} y={310} s={13} f={C.caramel} o={easeOut(seg(t, 3.4, 3.7))}>1.67</T>
      <T x={30} y={338} s={12} f={C.latte} o={easeOut(seg(t, 3.7, 4.0))}>at the origin, Hilbert is not the closest</T>
    </Svg>
  );
}
