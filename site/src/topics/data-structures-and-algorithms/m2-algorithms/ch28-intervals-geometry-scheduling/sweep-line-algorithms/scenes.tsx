import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutExpo, seg } from '../../../../../reels/anim';
import { C, Svg, T, Reticle } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, shared with the previous topic): crema = something that exists;
// latte = secondary labels; taupe = not yet reached or discarded; caramel (focus) = the thing
// to look at right now; cherry/cherryText = the bad outcome or a crossing.

const EIGHT_SEGMENTS: [[number, number], [number, number]][] = [
  [[18, 2], [15, 8]],
  [[1, 0], [4, 18]],
  [[15, 11], [10, 0]],
  [[8, 15], [6, 13]],
  [[17, 17], [3, 6]],
  [[18, 17], [8, 19]],
  [[2, 13], [10, 2]],
  [[11, 13], [8, 14]],
];
const CROSSING_PAIRS = new Set(['0-2', '2-6']); // from examples.py's CROSSINGS_EIGHT

const GX = 16; // grid origin x
const GY = 16; // grid origin y
const GS = 11; // grid scale
const gx = (v: number) => GX + v * GS;
const gy = (v: number) => GY + v * GS;

function SegmentField({ t }: { t: number }) {
  return (
    <>
      {EIGHT_SEGMENTS.map(([p1, p2], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.05, 0.5 + i * 0.05));
        return (
          <line
            key={i}
            x1={gx(p1[0])} y1={gy(p1[1])} x2={gx(p2[0])} y2={gy(p2[1])}
            stroke={C.crema} strokeWidth={1.4} opacity={a}
          />
        );
      })}
    </>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const b = easeOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="Eight segments: twenty-eight pairs, only two cross" h={260}>
      <SegmentField t={t} />
      <T x={20} y={240} s={13} f={C.latte}>eight segments, twenty-eight pairs</T>
      <g opacity={b}>
        <T x={20} y={258} s={13} f={C.caramel}>only two pairs cross</T>
      </g>
    </Svg>
  );
}

// 2 · PredictNeighborTests
export function PredictNeighborTests({ t, answer }: StepCtx) {
  const opts = ['all twenty-eight pairs', 'pairs overlapping in x', 'only neighbor pairs', 'half at random'];
  return (
    <Svg label="Which pairs does a sweep need to test" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={260} height={28} rx={4} fill="none" stroke={answer !== null && i === 2 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 2 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 2 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · SweepSkeleton
export function SweepSkeleton({ t }: StepCtx) {
  const x = 40 + easeOut(seg(t, 0.1, 0.9)) * 480;
  const events = [90, 170, 260, 340, 420];
  return (
    <Svg label="A sweep line moves across events, updating an active set" h={220}>
      <line x1={20} y1={120} x2={560} y2={120} stroke={C.mocha} strokeWidth={1} />
      {events.map((ex, i) => (
        <circle key={i} cx={ex} cy={120} r={3.5} fill={x >= ex ? C.caramel : C.taupe} />
      ))}
      <line x1={x} y1={40} x2={x} y2={200} stroke={C.caramel} strokeWidth={1.6} />
      <T x={20} y={40} s={13} f={C.latte}>events</T>
      <rect x={20} y={160} width={160} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={30} y={178} s={13} f={C.caramel}>active set</T>
      <T x={20} y={210} s={13} f={C.latte}>for each event in order: update, then record</T>
    </Svg>
  );
}

// 4 · TieBreakingBug
export function TieBreakingBug({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="Ends must be processed before starts at a tied coordinate" h={220}>
      <line x1={40} y1={100} x2={520} y2={100} stroke={C.mocha} strokeWidth={1} />
      <rect x={60} y={70} width={200} height={20} rx={2} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <rect x={260} y={70} width={200} height={20} rx={2} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <line x1={260} y1={60} x2={260} y2={100} stroke={C.cherry} strokeWidth={1.6} opacity={a} />
      <T x={230} y={50} s={13} f={C.cherryText} o={a}>end before start, here</T>
      <T x={40} y={150} s={13} f={C.latte}>get the order backwards and these register as overlapping</T>
    </Svg>
  );
}

// 5 · SkylineSetup
const BUILDINGS: [number, number, number][] = [[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]];
const BX = 20, BS = 15;
const bx = (v: number) => BX + v * BS;

export function SkylineSetup({ t }: StepCtx) {
  return (
    <Svg label="Five buildings, left edge, right edge and height" h={240}>
      {BUILDINGS.map(([l, r, h], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.1, 0.5 + i * 0.1));
        return (
          <rect key={i} x={bx(l)} y={200 - h * 7} width={(r - l) * BS} height={h * 7} fill="none" stroke={C.crema} strokeWidth={1.3} opacity={a} />
        );
      })}
      <line x1={20} y1={200} x2={400} y2={200} stroke={C.mocha} strokeWidth={1} />
      <T x={20} y={220} s={13} f={C.latte}>left and right edges are events</T>
      <T x={20} y={238} s={13} f={C.latte}>a max-heap of heights, with lazy deletion</T>
    </Svg>
  );
}

// 6 · SkylineWalk
const SKYLINE: [number, number][] = [[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]];
export function SkylineWalk({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const pts = SKYLINE.map(([x, h]) => `${bx(x)},${200 - h * 7}`);
  const polyPoints = SKYLINE.map(([x, h], i) => {
    const prevH = i === 0 ? 0 : SKYLINE[i - 1][1];
    return `${bx(x)},${200 - prevH * 7} ${bx(x)},${200 - h * 7}`;
  }).join(' ');
  return (
    <Svg label="The skyline outline: seven key points" h={240}>
      <line x1={20} y1={200} x2={400} y2={200} stroke={C.mocha} strokeWidth={1} />
      <polyline points={polyPoints} fill="none" stroke={C.caramel} strokeWidth={1.8} opacity={a} />
      {SKYLINE.map(([x, h], i) => (
        <circle key={i} cx={bx(x)} cy={200 - h * 7} r={3} fill={C.caramel} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <T x={20} y={225} s={13} f={C.latte}>seven key points, one per change in the maximum</T>
    </Svg>
  );
}

// 7 · PredictUnionAreaStructure
export function PredictUnionAreaStructure({ t, answer }: StepCtx) {
  const opts = ['a running count', 'a cover-count segment tree', 'a sorted array, rebuilt each event', 'a hash set of covered rows'];
  return (
    <Svg label="What structure holds the active set for a union area" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={300} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · UnionAreaReveal
const RECTS: [number, number, number, number][] = [[0, 0, 4, 3], [2, 1, 6, 5], [5, 0, 8, 2]];
const RX = 40, RS = 30;
const rx = (v: number) => RX + v * RS;
const ry = (v: number) => 200 - v * RS;
export function UnionAreaReveal({ t }: StepCtx) {
  return (
    <Svg label="Three rectangles: sum thirty-four, union twenty-nine" h={240}>
      {RECTS.map(([x0, y0, x1, y1], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.15, 0.5 + i * 0.15));
        return (
          <rect key={i} x={rx(x0)} y={ry(y1)} width={(x1 - x0) * RS} height={(y1 - y0) * RS} fill="none" stroke={i === 1 ? C.caramel : C.crema} strokeWidth={1.3} opacity={a} />
        );
      })}
      <T x={20} y={220} s={13} f={C.latte}>sum of the three areas: thirty-four</T>
      <T x={20} y={238} s={13} f={C.caramel}>union: twenty-nine</T>
    </Svg>
  );
}

// 9 · BentleyOttmannSetup
export function BentleyOttmannSetup({ t }: StepCtx) {
  const x = 60 + easeOut(seg(t, 0.2, 0.9)) * 150;
  return (
    <Svg label="Events are endpoints and discovered crossings; active set ordered by height" h={260}>
      <SegmentField t={1} />
      <line x1={gx(x / GS)} y1={0} x2={gx(x / GS)} y2={220} stroke={C.caramel} strokeWidth={1.4} opacity={0.8} />
      <T x={20} y={240} s={13} f={C.latte}>endpoints and discovered crossings are events</T>
      <T x={20} y={258} s={13} f={C.latte}>the tree orders segments by height at the sweep</T>
    </Svg>
  );
}

// 10 · CorrectnessInvariant
export function CorrectnessInvariant({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="Two segments can only cross after becoming neighbors" h={240}>
      <rect x={60} y={60} width={160} height={24} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.4} />
      <T x={70} y={77} s={13} f={C.caramel}>segment a</T>
      <rect x={60} y={94} width={160} height={24} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.4} />
      <T x={70} y={111} s={13} f={C.caramel}>segment b</T>
      <Reticle x={140} y={106} w={180} h={64} t={t} at={0.55} color={C.focus} />
      <T x={60} y={180} s={13} f={C.latte} o={a}>neighbors are tested; a crossing is queued</T>
    </Svg>
  );
}

// 11 · PredictCrossoverPoint
export function PredictCrossoverPoint({ t, answer }: StepCtx) {
  const opts = ['yes, always faster', 'no, the log factor makes it slower', 'only for small n', 'always exactly equal'];
  return (
    <Svg label="At k near n squared, is the sweep still faster" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={300} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 12 · ScalingCurve
const SCALE_N = [50, 200, 1000];
const SCALE_K = [3, 5, 48];
const SCALE_PAIRS = [1225, 19900, 499500];
export function ScalingCurve({ t }: StepCtx) {
  const maxPairs = 499500;
  return (
    <Svg label="Crossings stay small; the pairs a scan would test do not" h={260}>
      {SCALE_N.map((n, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.2, 0.55 + i * 0.2));
        const y = 40 + i * 60;
        const pairW = (SCALE_PAIRS[i] / maxPairs) * 400 * a;
        const kW = (SCALE_K[i] / maxPairs) * 400 * a;
        return (
          <g key={n}>
            <T x={20} y={y - 6} s={12} f={C.latte}>n = {n === 50 ? 'fifty' : n === 200 ? 'two hundred' : 'one thousand'}</T>
            <rect x={120} y={y} width={pairW} height={10} fill={C.taupe} />
            <rect x={120} y={y + 14} width={kW} height={10} fill={C.caramel} />
          </g>
        );
      })}
      <T x={120} y={230} s={12} f={C.taupe}>pairs a scan tests</T>
      <T x={300} y={230} s={12} f={C.caramel}>crossings found</T>
    </Svg>
  );
}

// 13 · GeometricPrimitive
export function GeometricPrimitive({ t }: StepCtx) {
  const a = easeOutExpo(seg(t, 0.3, 1));
  return (
    <Svg label="The sign of a cross product decides which side a point falls on" h={220}>
      <line x1={60} y1={160} x2={420} y2={60} stroke={C.crema} strokeWidth={1.4} />
      <circle cx={280 - 40 * a} cy={110 - 10 * a} r={4} fill={C.caramel} />
      <T x={300 - 40 * a} y={100 - 10 * a} s={12} f={C.caramel}>sign tells the side</T>
      <T x={20} y={178} s={13} f={C.latte}>exact on integers</T>
      <T x={20} y={198} s={13} f={C.latte}>broken by ties and rounding error</T>
    </Svg>
  );
}

// 14 · DuckDBIEJoin
export function DuckDBIEJoin({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="DuckDB sorts on two conditions, the same endpoint-order idea" h={220}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={`l${i}`} x={60} y={30 + i * 20} width={60} height={14} rx={2} fill="none" stroke={C.crema} strokeWidth={1} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <rect key={`r${i}`} x={160} y={30 + i * 20} width={60} height={14} rx={2} fill="none" stroke={C.crema} strokeWidth={1} />
      ))}
      <rect x={280} y={30} width={160} height={94} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <T x={290} y={50} s={12} f={C.caramel} o={a}>merged on condition one</T>
      <T x={290} y={70} s={12} f={C.caramel} o={a}>sorted on condition two</T>
      <T x={20} y={180} s={13} f={C.latte}>sort, merge, sort again — no sweep line, same idea</T>
    </Svg>
  );
}

// 15 · Recap
export function Recap({ t }: StepCtx) {
  const labels = ['skyline', 'union area', 'segment crossings'];
  return (
    <Svg label="One skeleton, three active-set structures, three problems" h={220}>
      {labels.map((label, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.2, 0.55 + i * 0.2));
        return (
          <g key={label} opacity={a}>
            <rect x={40 + i * 170} y={60} width={140} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
            <T x={60 + i * 170} y={95} s={13} f={C.caramel}>{label}</T>
          </g>
        );
      })}
      <T x={20} y={160} s={13} f={C.latte}>events, an active set, a tie rule — one skeleton</T>
    </Svg>
  );
}
