import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Reticle } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, shared with topic 94): crema = a booking that exists; latte =
// secondary labels; taupe = not yet reached or discarded; caramel (focus) = the thing to look
// at right now; cinnamon (rare) = the alternative rule compared beside the one in focus;
// cherry/cherryText = the bad outcome (a conflict, a booking a better rule would have kept).

const BOOKINGS: [number, number, number][] = [
  [75, 120, 5],
  [210, 270, 4],
  [345, 495, 6],
  [480, 660, 5],
  [255, 300, 1],
  [435, 615, 3],
  [180, 210, 5],
  [120, 300, 8],
  [90, 120, 6],
  [270, 330, 8],
];

const X0 = 20;
const SCALE = 0.72; // canvas units per minute
const toX = (min: number) => X0 + min * SCALE;
const rowY = (i: number) => 30 + i * 22;

function Ruler({ y, label }: { y: number; label: string }) {
  return (
    <g>
      <line x1={X0} y1={y} x2={toX(660)} y2={y} stroke={C.mocha} strokeWidth={1} />
      <T x={toX(660)} y={y - 6} s={11} f={C.taupe} a="end">{label}</T>
    </g>
  );
}

function BookingBars({ t, order, colorOf }: { t: number; order: [number, number, number][]; colorOf: (b: [number, number, number], i: number) => string }) {
  return (
    <>
      {order.map((b, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.05, 0.6 + i * 0.05));
        const [s, e] = b;
        const y = rowY(i);
        return (
          <g key={i} opacity={a}>
            <rect x={toX(s)} y={y} width={(e - s) * SCALE} height={14} rx={2} fill="none" stroke={colorOf(b, i)} strokeWidth={1.3} />
          </g>
        );
      })}
    </>
  );
}

// 1 · Opening: ten bookings on the ruler, nothing picked yet.
export function Opening({ t }: StepCtx) {
  return (
    <Svg label="Ten bookings on a day's ruler, one room, waiting to be picked" h={280}>
      <Ruler y={250} label="08:00 — 19:00" />
      <BookingBars t={t} order={BOOKINGS} colorOf={() => C.crema} />
      <T x={X0} y={270} s={12} f={C.latte}>ten bookings, one room, keep only the ones that never overlap</T>
    </Svg>
  );
}

// 2 · PredictBestRule
export function PredictBestRule({ t, answer }: StepCtx) {
  return (
    <Svg label="Four candidate rules for picking the most bookings; which one always wins" h={240}>
      {['earliest start', 'shortest booking', 'fewest conflicts', 'earliest finish'].map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={220} height={28} rx={4} fill="none" stroke={answer !== null && i === 3 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 3 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 3 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
      {answer !== null && <T x={280} y={62} s={13} f={C.crema}>keeps five of ten</T>}
    </Svg>
  );
}

// 3 · EarliestStartFails: 3 kept.
export function EarliestStartFails({ t }: StepCtx) {
  const kept = new Set([0, 7, 2]); // (75,120) (120,300) (345,495) by index in BOOKINGS
  const colorOf = (_b: [number, number, number], i: number) => (kept.has(i) ? C.caramel : C.taupe);
  return (
    <Svg label="Earliest-start-first keeps three of the ten bookings" h={280}>
      <Ruler y={250} label="08:00 — 19:00" />
      <BookingBars t={t} order={BOOKINGS} colorOf={colorOf} />
      <Reticle x={toX(210)} y={rowY(1) + 7} w={80} h={20} t={t} at={0.7} color={C.cherryText} />
      <T x={X0} y={270} s={12} f={C.cherryText}>3 kept — the long early booking blocks four others</T>
    </Svg>
  );
}

// 4 · ShortestFirstFails: 4 kept.
export function ShortestFirstFails({ t }: StepCtx) {
  const kept = new Set([6, 8, 4, 2]); // (180,210) (90,120) (255,300) (345,495)
  const colorOf = (_b: [number, number, number], i: number) => (kept.has(i) ? C.caramel : C.taupe);
  return (
    <Svg label="Shortest-booking-first keeps four of the ten bookings" h={280}>
      <Ruler y={250} label="08:00 — 19:00" />
      <BookingBars t={t} order={BOOKINGS} colorOf={colorOf} />
      <Reticle x={toX(300)} y={rowY(9) + 7} w={60} h={20} t={t} at={0.7} color={C.cherryText} />
      <T x={X0} y={270} s={12} f={C.cherryText}>4 kept — taking less room still blocks the right room</T>
    </Svg>
  );
}

// 5 · EarliestFinishWinsAndTrap: 5 kept, plus the 8-interval fewest-conflicts trap.
const EIGHT: [number, number][] = [[2, 7], [3, 5], [3, 7], [6, 8], [7, 10], [8, 11], [10, 12], [11, 14]];
export function EarliestFinishWinsAndTrap({ t }: StepCtx) {
  const kept = new Set([0, 6, 1, 9, 2]); // (75,120) (180,210) (210,270) (270,330) (345,495)
  const colorOf = (_b: [number, number, number], i: number) => (kept.has(i) ? C.caramel : C.taupe);
  const b = easeOut(seg(t, 0.55, 1.1));
  const scale2 = 24;
  const fcKept = new Set([7, 1, 4]); // indices kept by fewest-conflicts: (11,14) (3,5) (7,10)
  return (
    <Svg label="Earliest-finish-first keeps five of the ten; a separate eight-booking set traps fewest-conflicts at three against four" h={300}>
      <Ruler y={250} label="08:00 — 19:00" />
      <BookingBars t={t} order={BOOKINGS} colorOf={colorOf} />
      <T x={X0} y={270} s={12} f={C.caramel}>5 kept — the most of any rule tried</T>
      <g opacity={b}>
        <T x={X0} y={290} s={11} f={C.taupe}>separate 8-booking set: fewest-conflicts keeps 3, earliest-finish keeps 4</T>
        {EIGHT.map(([s, e], i) => (
          <rect key={i} x={X0 + s * scale2} y={210} width={(e - s) * scale2} height={8} rx={1.5} fill="none" stroke={fcKept.has(i) ? C.cinnamon : C.mocha} strokeWidth={1} />
        ))}
      </g>
    </Svg>
  );
}

// 6 · ExchangeProof: abstract swap between an optimal set and the greedy set.
export function ExchangeProof({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 1.1));
  return (
    <Svg label="The exchange argument: swap the optimal schedule's first booking for the greedy choice" h={240}>
      <T x={30} y={40} s={12} f={C.cinnamon}>optimal</T>
      <rect x={100} y={28} width={90} height={20} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.3} />
      <rect x={200} y={28} width={60} height={20} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.3} opacity={0.5} />
      <T x={30} y={100} s={12} f={C.caramel}>greedy</T>
      <rect x={100 + 20 * k} y={88} width={70} height={20} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.8} />
      <rect x={200} y={88} width={60} height={20} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.3} opacity={0.5} />
      <Reticle x={135 + 20 * k} y={98} w={90} h={28} t={t} at={0.6} />
      <T x={30} y={150} s={12} f={C.latte}>swap the first pick; it finishes no later</T>
      <T x={30} y={175} s={12} f={C.latte}>nothing after it can newly collide</T>
    </Svg>
  );
}

// 7 · MergeSweep: sort by start, extend or start new.
const TO_MERGE: [number, number][] = [[30, 50], [5, 15], [40, 60], [65, 70], [10, 20], [62, 68]];
const MERGED_RESULT: [number, number][] = [[5, 20], [30, 60], [62, 70]];
export function MergeSweep({ t }: StepCtx) {
  const sortScale = 6;
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Merging intervals: sort by start, extend the current interval or start a new one" h={260}>
      <T x={20} y={24} s={11} f={C.taupe}>sorted by start</T>
      {[...TO_MERGE].sort((p, q) => p[0] - q[0]).map(([s, e], i) => (
        <rect key={i} x={20 + s * sortScale} y={40} width={(e - s) * sortScale} height={14} rx={2} fill="none" stroke={C.taupe} strokeWidth={1} />
      ))}
      <T x={20} y={90} s={11} f={C.caramel}>merged, left to right</T>
      {MERGED_RESULT.map(([s, e], i) => (
        <rect key={i} x={20 + s * sortScale} y={106 + i * 0} width={Math.max(3, (e - s) * sortScale * a)} height={16} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.6} />
      ))}
      <T x={20} y={160} s={12} f={C.latte}>everything left of the sweep is already final</T>
    </Svg>
  );
}

// 8 · InsertIntoMerged
export function InsertIntoMerged({ t }: StepCtx) {
  const sortScale = 6;
  const k = easeOut(seg(t, 0.3, 1));
  const newIv: [number, number] = [18, 35];
  return (
    <Svg label="Inserting one interval into an already-merged list absorbs the run it overlaps" h={240}>
      {MERGED_RESULT.map(([s, e], i) => (
        <rect key={i} x={20 + s * sortScale} y={50} width={(e - s) * sortScale} height={16} rx={2} fill="none" stroke={C.taupe} strokeWidth={1} />
      ))}
      <rect x={20 + newIv[0] * sortScale} y={80} width={(newIv[1] - newIv[0]) * sortScale} height={16} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={k} />
      <Reticle x={20 + 12 * sortScale} y={58} w={90} h={26} t={t} at={0.55} />
      <T x={20} y={130} s={12} f={C.latte}>linear scan: O(n)</T>
      <T x={20} y={155} s={12} f={C.latte}>binary search the place: O(log n + r), shift still O(n)</T>
    </Svg>
  );
}

// 9 · FlinkSessionWindows
export function FlinkSessionWindows({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Apache Flink's session windows merge exactly like the interval merge just shown" h={220}>
      <T x={20} y={30} s={12} f={C.latte}>each record starts its own window</T>
      {[0, 14, 30, 60, 75].map((x, i) => (
        <rect key={i} x={30 + x * 3} y={50} width={18} height={14} rx={2} fill="none" stroke={C.taupe} strokeWidth={1} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <T x={20} y={110} s={12} f={C.caramel}>closer than the gap: merged</T>
      <rect x={30} y={130} width={18 + 14 * 3 + 44 * a} height={16} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.6} />
      <rect x={30 + 75 * 3} y={130} width={18} height={16} rx={2} fill="none" stroke={C.taupe} strokeWidth={1} />
    </Svg>
  );
}

// 10 · PredictMinRooms
export function PredictMinRooms({ t, answer }: StepCtx) {
  return (
    <Svg label="How many rooms do the ten bookings need at minimum" h={260}>
      <Ruler y={230} label="08:00 — 19:00" />
      <BookingBars t={t} order={BOOKINGS} colorOf={() => C.crema} />
      {answer !== null && <T x={X0} y={250} s={13} f={C.caramel}>three bookings open at the busiest moment</T>}
    </Svg>
  );
}

// 11 · MinHeapRooms: depth 3 run.
const ROOM_ROWS = [
  [[75, 120], [180, 210], [345, 495]],
  [[90, 120], [210, 270], [435, 615]],
  [[120, 300], [255, 300], [270, 330], [480, 660]],
] as const;
export function MinHeapRooms({ t }: StepCtx) {
  const peak = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="A min-heap of end times schedules the ten bookings into three rooms" h={280}>
      <Ruler y={250} label="08:00 — 19:00" />
      {ROOM_ROWS.map((row, r) =>
        row.map(([s, e], i) => (
          <rect key={`${r}-${i}`} x={toX(s)} y={30 + r * 24} width={(e - s) * SCALE} height={14} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.3} />
        )),
      )}
      <T x={X0} y={270} s={12} f={C.taupe}>room 1</T>
      <rect x={400} y={200} width={14} height={40 * peak} fill={C.caramel} opacity={0.85} />
      <T x={400} y={268} s={11} f={C.caramel}>depth = 3</T>
    </Svg>
  );
}

// 12 · PlusMinusSweep
export function PlusMinusSweep({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A simpler plus-one minus-one sweep over sorted endpoints finds the same peak of three" h={220}>
      <line x1={X0} y1={150} x2={toX(660)} y2={150} stroke={C.mocha} strokeWidth={1} />
      <rect x={X0} y={150 - 3 * 24 * a} width={toX(660) - X0} height={3 * 24 * a} fill="none" />
      <polyline
        points={`${toX(75)},150 ${toX(75)},${150 - 24} ${toX(90)},${150 - 24} ${toX(90)},${150 - 48} ${toX(120)},${150 - 48} ${toX(120)},${150 - 72} ${toX(180)},${150 - 72} ${toX(300)},${150 - 48} ${toX(495)},150`}
        fill="none"
        stroke={C.caramel}
        strokeWidth={1.8}
        opacity={a}
      />
      <T x={X0} y={150 - 72 - 8} s={12} f={C.caramel}>peak = 3</T>
      <T x={X0} y={190} s={12} f={C.latte}>+1 at every start, −1 at every end, sorted</T>
    </Svg>
  );
}

// 13 · PredictWeightedSting
export function PredictWeightedSting({ t, answer }: StepCtx) {
  return (
    <Svg label="Does earliest-finish-first still win once bookings carry weights" h={220}>
      {BOOKINGS.slice(0, 5).map(([s, e, w], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.08, 0.5 + i * 0.08))}>
          <rect x={30 + i * 100} y={40} width={80} height={24} rx={3} fill="none" stroke={C.crema} strokeWidth={1.2} />
          <T x={40 + i * 100} y={57} s={13} f={C.latte}>w = {w}</T>
        </g>
      ))}
      {answer !== null && <T x={30} y={110} s={13} f={C.cherryText}>28 against a better 29</T>}
    </Svg>
  );
}

// 14 · WeightedTable
export function WeightedTable({ t }: StepCtx) {
  const n = 10;
  const filled = Math.floor(easeOut(seg(t, 0.2, 1.1)) * n);
  return (
    <Svg label="The DP table fills left to right and reaches twenty-nine against the greedy set's twenty-eight" h={240}>
      {Array.from({ length: n }, (_, j) => (
        <rect key={j} x={20 + j * 32} y={40} width={26} height={26} rx={2} fill="none" stroke={j < filled ? C.caramel : C.mocha} strokeWidth={j < filled ? 1.6 : 1} />
      ))}
      <T x={20} y={90} s={12} f={C.cherryText}>greedy set: 28</T>
      <T x={20} y={115} s={12} f={C.caramel}>table OPT(n): 29</T>
    </Svg>
  );
}

// 15 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Four passes over one sorted order: merge, greedy choice, heap, and table" h={240}>
      {['merge', 'greedy', 'heap', 'table'].map((label, i) => (
        <g key={label} opacity={easeOut(seg(t, 0.1 + i * 0.15, 0.5 + i * 0.15))}>
          <rect x={30 + i * 130} y={60} width={100} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
          <T x={40 + i * 130} y={79} s={13} f={C.crema}>{label}</T>
        </g>
      ))}
      <line x1={30} y1={130} x2={30 + 520 * a} y2={130} stroke={C.mocha} strokeWidth={1.5} />
      <T x={30} y={155} s={12} f={C.latte}>one sorted order underneath all of them</T>
    </Svg>
  );
}
