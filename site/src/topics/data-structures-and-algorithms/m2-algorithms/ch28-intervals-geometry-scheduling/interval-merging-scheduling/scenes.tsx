import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, shared with topic 94): crema = a booking that exists; latte = secondary labels; taupe =
// not yet reached or discarded; caramel = the thing to look at right now (the booking kept, the sweep); cinnamon (rare)
// = the alternative compared beside the one in focus; cherryText = the bad outcome (a conflict, a booking a better rule
// would have kept).
//
// Every number is examples.py's: the ten bookings (minutes after 08:00, with weights); earliest start keeps 3, shortest
// first 4, earliest finish 5; on the eight-interval set fewest conflicts keeps 3 against earliest finish's 4; the swap
// set; merge (5, 15) (10, 20) (30, 50) (40, 60) (62, 68) (65, 70) into (5, 20) (30, 60) (62, 70); insert (18, 35) to
// get (5, 60) (62, 70); 3 rooms by heap and by +1/−1 sweep; earliest finish's weight 28 against the table's 29. The
// greedy runs, the merge, the heap, the sweep and the table are replayed here by the loops examples.py runs.

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

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

type B = readonly [number, number, number];
const BOOKINGS: B[] = [
  [75, 120, 5], [210, 270, 4], [345, 495, 6], [480, 660, 5], [255, 300, 1],
  [435, 615, 3], [180, 210, 5], [120, 300, 8], [90, 120, 6], [270, 330, 8],
];
const overlaps = (a: readonly number[], b: readonly number[]) => a[0] < b[1] && b[0] < a[1];
/** examples.py's greedy_by_key: take each in key order, keep it if compatible with every kept one. Returns the order and verdicts. */
function greedy<T extends readonly number[]>(xs: T[], key: (b: T) => number) {
  const order = [...xs].sort((a, b) => key(a) - key(b));
  const kept: T[] = [];
  const verdict = order.map((b) => {
    if (kept.every((k) => !overlaps(b, k))) {
      kept.push(b);
      return true;
    }
    return false;
  });
  return { order, verdict, kept };
}
const BY_START = greedy(BOOKINGS, (b) => b[0]); // 3 kept
const BY_LEN = greedy(BOOKINGS, (b) => b[1] - b[0]); // 4 kept
const BY_FINISH = greedy(BOOKINGS, (b) => b[1]); // 5 kept
const EIGHT: [number, number][] = [[2, 7], [3, 5], [3, 7], [6, 8], [7, 10], [8, 11], [10, 12], [11, 14]];
const conflicts = (iv: readonly number[]) => EIGHT.filter((j) => j !== iv && overlaps(iv, j)).length;
const EIGHT_FC = greedy(EIGHT, conflicts); // 3
const EIGHT_EF = greedy(EIGHT, (b) => b[1]); // 4

// The day's ruler: minute 0 is 08:00, minute 660 is 19:00. Rows in start order.
const X0 = 30, SC = 0.8;
const tx = (m: number) => X0 + m * SC;
const ROWS = [...BOOKINGS].sort((a, b) => a[0] - b[0]);
const rowOf = (b: B) => ROWS.indexOf(b);
const RY = (i: number) => 22 + i * 20;
const RULER = 228;

function Ruler() {
  return (
    <g>
      <line x1={tx(0)} y1={RULER} x2={tx(660)} y2={RULER} stroke={C.line} />
      <T x={tx(0)} y={RULER + 18} s={12} f={C.taupe}>08:00</T>
      <T x={tx(660)} y={RULER + 18} s={12} f={C.taupe} a="end">19:00</T>
    </g>
  );
}
/** One booking as a bar on its row. */
function Bar({ b, c = C.crema, fill, dash, o = 1, w, y }: { b: B; c?: string; fill?: string; dash?: string; o?: number; w?: boolean; y?: number }) {
  const yy = y ?? RY(rowOf(b));
  return (
    <g opacity={o}>
      <rect x={tx(b[0])} y={yy} width={(b[1] - b[0]) * SC} height={14} rx={2} fill={fill ?? 'none'} stroke={c} strokeWidth={1.4} strokeDasharray={dash} />
      {w && <T x={tx(b[0]) + ((b[1] - b[0]) * SC) / 2} y={yy + 11} s={12} f={fill ? C.espresso : c} a="middle">{String(b[2])}</T>}
    </g>
  );
}

/** A greedy run played out: each booking in the rule's order lights, then is kept (filled) or refused (red, dashed). */
function GreedyRun({ run, t, a, b, highlight }: { run: ReturnType<typeof greedy<B>>; t: number; a: number; b: number; highlight?: (x: B) => boolean }) {
  const k = stepIdx(t, a, b, run.order.length);
  return (
    <g>
      {ROWS.map((x) => {
        const j = run.order.indexOf(x);
        if (j > k) return <Bar key={x.join()} b={x} c={C.taupe} />;
        const kept = run.verdict[j];
        const cur = j === k && t < b;
        if (kept) return <Bar key={x.join()} b={x} c={C.caramel} fill={cur ? C.caramel : C.crema} />;
        const hl = highlight?.(x) && t >= b;
        return <Bar key={x.join()} b={x} c={cur || hl ? C.cherryText : C.mocha} dash="4 3" />;
      })}
    </g>
  );
}

// 1 · Opening. Ten bookings slide onto the day. Every colliding pair flashes a red link, the quadratic check; then all
// twenty endpoints drop onto the ruler and one line sweeps across them once.
const PAIRS: [B, B][] = [];
ROWS.forEach((a, i) => ROWS.forEach((b, j) => {
  if (j > i && overlaps(a, b)) PAIRS.push([a, b]);
}));
export function Opening({ t }: StepCtx) {
  const pk = stepIdx(t, 0.9, 2.0, PAIRS.length);
  const drop = easeInOut(seg(t, 2.2, 2.8));
  const sweep = seg(t, 2.9, 3.8);
  return (
    <Svg label="Ten bookings slide onto the day's ruler. Every pair that collides flashes a red link, the check that looks quadratic. Then all twenty endpoints drop onto the ruler in sorted order and one line sweeps across them once" h={300}>
      <Ruler />
      {ROWS.map((b, i) => <Bar key={i} b={b} o={easeOut(seg(t, 0.1 + i * 0.06, 0.4 + i * 0.06)) * (1 - 0.7 * drop)} />)}
      {pk >= 0 && drop < 1 && PAIRS.slice(0, pk + 1).map(([a, b], i) => {
        const m = Math.max(a[0], b[0]);
        return <line key={i} x1={tx(m)} y1={RY(rowOf(a)) + 7} x2={tx(m)} y2={RY(rowOf(b)) + 7} stroke={C.cherryText} strokeWidth={1.4} opacity={(i === pk ? 1 : 0.45) * (1 - drop)} />;
      })}
      {drop > 0 && ROWS.flatMap((b, i) => [0, 1].map((e) => (
        <circle key={`${i}${e}`} cx={tx(b[e])} cy={lerp(RY(i) + 7, RULER, drop)} r={3.5} fill={e ? C.latte : C.crema} />
      )))}
      {sweep > 0 && <line x1={tx(660 * sweep)} y1={12} x2={tx(660 * sweep)} y2={RULER + 6} stroke={C.caramel} strokeWidth={2} />}
      {drop <= 0 && <T x={300} y={284} s={13} f={C.cherryText} a="middle" o={pk >= 0 ? 1 : 0}>check every pair?</T>}
      {drop > 0 && <T x={300} y={284} s={13} f={C.caramel} a="middle" o={drop}>sort the endpoints, walk once</T>}
    </Svg>
  );
}

// 2 · PredictBestRule. The ten bookings; four rule names light in turn, each lighting the booking it would take first.
// After answering: earliest finish stays lit, its first pick filled.
const RULES: { name: string; first: B }[] = [
  { name: 'start earliest', first: BY_START.order[0] },
  { name: 'shortest first', first: BY_LEN.order[0] },
  { name: 'fewest conflicts', first: [...BOOKINGS].sort((a, b) => BOOKINGS.filter((j) => j !== a && overlaps(a, j)).length - BOOKINGS.filter((j) => j !== b && overlaps(b, j)).length)[0] },
  { name: 'finish earliest', first: BY_FINISH.order[0] },
];
export function PredictBestRule({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const cyc = t < 0.3 ? -1 : Math.floor(((t - 0.3) / 0.55) % 4);
  const r = answered ? 3 : cyc;
  const lit = answered ? easeOut(seg(s, 0.2, 0.6)) : 1;
  return (
    <Svg label="The ten bookings; four rules light in turn, start earliest, shortest first, fewest conflicts, finish earliest, each lighting the booking it would take first. After answering: finish earliest stays lit" h={300}>
      <Ruler />
      {ROWS.map((b, i) => <Bar key={i} b={b} c={r >= 0 && RULES[r].first === b ? C.caramel : C.crema} fill={r >= 0 && RULES[r].first === b ? C.caramel : undefined} />)}
      {r >= 0 && <T x={300} y={284} s={13} f={answered ? C.caramel : C.crema} a="middle" o={lit}>{answered ? `${RULES[3].name}: keeps ${BY_FINISH.kept.length} of 10` : `${RULES[r].name}?`}</T>}
    </Svg>
  );
}

// 3 · EarliestStartFails. The rule runs in start order: kept bookings fill, refused ones go dashed. Three kept; the four
// short bookings the long early one blocked turn red.
const LONG = BY_START.kept.find((b) => b[1] - b[0] === Math.max(...BY_START.kept.map((k) => k[1] - k[0])))!;
const BLOCKED_BY_LONG = BOOKINGS.filter((b) => b !== LONG && overlaps(b, LONG)); // the four it blocks
export function EarliestStartFails({ t }: StepCtx) {
  const cap = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="Start earliest, in order: each booking either fills, kept, or goes dashed, refused. Three are kept. The long early booking it took blocks four shorter ones, which turn red" h={300}>
      <Ruler />
      <GreedyRun run={BY_START} t={t} a={0.3} b={2.8} highlight={(x) => BLOCKED_BY_LONG.includes(x)} />
      <T x={300} y={284} s={13} f={C.cherryText} a="middle" o={cap}>{`${BY_START.kept.length} kept: one long booking blocks ${BLOCKED_BY_LONG.length}`}</T>
    </Svg>
  );
}

// 4 · ShortestFirstFails. The rule runs shortest first. Four kept; the bookings earliest finish would have kept but this
// rule refused turn red.
export function ShortestFirstFails({ t }: StepCtx) {
  const cap = easeOut(seg(t, 3.0, 3.4));
  const lost = BY_FINISH.kept.filter((b) => !BY_LEN.kept.includes(b));
  return (
    <Svg label="Shortest first: each booking either fills, kept, or goes dashed, refused. Four are kept. Bookings that fit together elsewhere, refused because a short one sat in their way, turn red" h={300}>
      <Ruler />
      <GreedyRun run={BY_LEN} t={t} a={0.3} b={2.8} highlight={(x) => lost.includes(x)} />
      <T x={300} y={284} s={13} f={C.cherryText} a="middle" o={cap}>{`${BY_LEN.kept.length} kept: a short one in the wrong place`}</T>
    </Svg>
  );
}

// 5 · EarliestFinishWinsAndTrap. Finish earliest runs: five kept. Then a separate eight-interval set: fewest conflicts
// first keeps three (blue) against finish earliest's four (white).
export function EarliestFinishWinsAndTrap({ t }: StepCtx) {
  const second = t >= 2.9;
  const ex = (v: number) => 60 + (v - 2) * 40;
  const fc = stepIdx(t, 3.1, 3.7, EIGHT.length);
  const ef = stepIdx(t, 3.8, 4.4, EIGHT.length);
  return (
    <Svg label="Finish earliest runs on the ten bookings and keeps five, the most of any rule. Then a separate set of eight: fewest conflicts first keeps three, in blue, against finish earliest's four, in white" h={300}>
      {!second && (
        <g>
          <Ruler />
          <GreedyRun run={BY_FINISH} t={t} a={0.3} b={2.4} />
          <T x={300} y={284} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 2.4, 2.7))}>{`${BY_FINISH.kept.length} kept, the most of any`}</T>
        </g>
      )}
      {second && (
        <g>
          <T x={300} y={24} s={12} f={C.latte} a="middle">a separate set of eight</T>
          {EIGHT.map((iv, i) => (
            <rect key={i} x={ex(iv[0])} y={40 + i * 14} width={(iv[1] - iv[0]) * 40} height={10} rx={2} fill="none" stroke={C.taupe} strokeWidth={1.2} />
          ))}
          <T x={50} y={186} s={12} f={C.cinnamon} a="end">FC</T>
          {EIGHT_FC.order.map((iv, j) => (j <= fc && EIGHT_FC.verdict[j] ? <rect key={j} x={ex(iv[0])} y={176} width={(iv[1] - iv[0]) * 40} height={12} rx={2} fill={C.cinnamon} /> : null))}
          <T x={50} y={216} s={12} f={C.caramel} a="end">EF</T>
          {EIGHT_EF.order.map((iv, j) => (j <= ef && EIGHT_EF.verdict[j] ? <rect key={j} x={ex(iv[0])} y={206} width={(iv[1] - iv[0]) * 40} height={12} rx={2} fill={C.caramel} /> : null))}
          <T x={300} y={284} s={13} f={C.crema} a="middle" o={ef >= EIGHT.length - 1 ? 1 : 0}>{`fewest conflicts ${EIGHT_FC.kept.length}, finish earliest ${EIGHT_EF.kept.length}`}</T>
        </g>
      )}
    </Svg>
  );
}

// 6 · ExchangeProof. An optimal schedule (blue) and the greedy one (white) on a small set. The optimal's first booking
// slides out and the earliest-finishing one slides in: it ends no later (a dashed line marks both ends). Repeat for the
// next; the greedy schedule is reached, and it even fits one more.
const SYN: [number, number][] = [[0, 4], [1, 5], [4, 7], [6, 9], [8, 10]];
const SYN_EF = greedy(SYN, (b) => b[1]).kept; // (0,4) (4,7) (8,10)
const SYN_OPT: [number, number][] = [[1, 5], [6, 9]];
export function ExchangeProof({ t }: StepCtx) {
  const ex = (v: number) => 80 + v * 44;
  const s1 = easeInOut(seg(t, 0.6, 1.3));
  const s2 = easeInOut(seg(t, 2.0, 2.7));
  const extra = easeOut(seg(t, 3.1, 3.5));
  const row: [number, number][] = [
    [lerp(SYN_OPT[0][0], SYN_EF[0][0], s1), lerp(SYN_OPT[0][1], SYN_EF[0][1], s1)],
    [lerp(SYN_OPT[1][0], SYN_EF[1][0], s2), lerp(SYN_OPT[1][1], SYN_EF[1][1], s2)],
  ];
  const mark = s2 > 0 ? 1 : 0;
  const endA = mark ? SYN_EF[1][1] : SYN_EF[0][1];
  const endB = mark ? SYN_OPT[1][1] : SYN_OPT[0][1];
  return (
    <Svg label="An optimal schedule, in blue, and the greedy one. The optimal's first booking slides out and the earliest-finishing booking slides in; it ends no later, marked by two dashed lines. The same swap on the next booking reaches the greedy schedule, which even fits one more, without ever losing one" h={300}>
      <T x={30} y={44} s={12} f={C.latte}>all</T>
      {SYN.map((iv, i) => <rect key={i} x={ex(iv[0])} y={32 + (i % 2) * 18} width={(iv[1] - iv[0]) * 44} height={12} rx={2} fill="none" stroke={C.taupe} strokeWidth={1.2} />)}
      <T x={30} y={132} s={12} f={C.cinnamon}>swap</T>
      {row.map(([a, b], i) => <rect key={i} x={ex(a)} y={120} width={(b - a) * 44} height={16} rx={2} fill={(i === 0 ? s1 : s2) >= 1 ? C.caramel : C.cinnamon} />)}
      {extra > 0 && <rect x={ex(SYN_EF[2][0])} y={120} width={(SYN_EF[2][1] - SYN_EF[2][0]) * 44} height={16} rx={2} fill={C.caramel} opacity={extra} />}
      {(s1 > 0 && s1 < 1) || (s2 > 0 && s2 < 1) || (t > 1.3 && t < 2.0) || (t > 2.7 && t < 3.1) ? (
        <g>
          <line x1={ex(endA)} y1={110} x2={ex(endA)} y2={160} stroke={C.caramel} strokeDasharray="4 3" />
          <line x1={ex(endB)} y1={110} x2={ex(endB)} y2={160} stroke={C.cinnamon} strokeDasharray="4 3" />
          <T x={(ex(endA) + ex(endB)) / 2} y={178} s={12} f={C.crema} a="middle">ends no later</T>
        </g>
      ) : null}
      <T x={300} y={240} s={13} f={C.crema} a="middle" o={extra}>{`optimal ${SYN_OPT.length}, swapped ${SYN_EF.length}: nothing lost`}</T>
    </Svg>
  );
}

// 7 · MergeSweep. Six intervals in start order; a sweep line walks them. Each one either stretches the current merged
// interval (it starts before that ends) or closes it and opens a new one. Everything left of the sweep is final.
const TO_MERGE: [number, number][] = [[30, 50], [5, 15], [40, 60], [65, 70], [10, 20], [62, 68]];
const SORTED_M = [...TO_MERGE].sort((a, b) => a[0] - b[0]);
function mergeSteps(xs: [number, number][]) {
  const out: [number, number][][] = [];
  const m: [number, number][] = [];
  for (const [s, e] of xs) {
    if (m.length && s < m[m.length - 1][1]) m[m.length - 1] = [m[m.length - 1][0], Math.max(m[m.length - 1][1], e)];
    else m.push([s, e]);
    out.push(m.map((x) => [...x] as [number, number]));
  }
  return out;
}
const MERGE_STEPS = mergeSteps(SORTED_M);
const MERGED = MERGE_STEPS[MERGE_STEPS.length - 1]; // (5,20) (30,60) (62,70)
const mx = (v: number) => 40 + v * 7;
export function MergeSweep({ t }: StepCtx) {
  const k = stepIdx(t, 0.4, 3.0, SORTED_M.length);
  const cur = k >= 0 ? MERGE_STEPS[k] : [];
  const sweepX = k >= 0 ? mx(SORTED_M[k][0]) : mx(0);
  return (
    <Svg label="Six intervals sorted by start; a sweep line walks them. Each one either stretches the current merged interval, because it starts before that one ends, or closes it and opens a new one: five to twenty, thirty to sixty, sixty-two to seventy. Everything left of the sweep is final" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>sorted by start</T>
      {SORTED_M.map((iv, i) => <rect key={i} x={mx(iv[0])} y={36 + i * 18} width={(iv[1] - iv[0]) * 7} height={12} rx={2} fill={i <= k ? C.crema : 'none'} stroke={i === k ? C.caramel : C.taupe} strokeWidth={1.3} opacity={i <= k ? 0.8 : 1} />)}
      {k >= 0 && <rect x={mx(0)} y={30} width={sweepX - mx(0)} height={200} fill={C.caramel} opacity={0.05} />}
      {k >= 0 && <line x1={sweepX} y1={30} x2={sweepX} y2={236} stroke={C.caramel} strokeWidth={2} />}
      <T x={30} y={170} s={12} f={C.caramel}>merged</T>
      {cur.map((iv, i) => (
        <g key={i}>
          <rect x={mx(iv[0])} y={180} width={(iv[1] - iv[0]) * 7} height={16} rx={2} fill={C.caramel} />
          {k >= SORTED_M.length - 1 && <T x={mx(iv[0]) + ((iv[1] - iv[0]) * 7) / 2} y={216} s={12} f={C.crema} a="middle">{`${iv[0]}–${iv[1]}`}</T>}
        </g>
      ))}
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={k >= 2 ? 1 : 0}>left of the sweep: final</T>
    </Svg>
  );
}

// 8 · InsertIntoMerged. The merged list as three cells; the new interval 18–35 arrives. A binary search probes for the
// first cell ending after 18; the new interval absorbs every cell it overlaps, 5–20 and 30–60, into 5–60; the cell after
// it shifts left one slot.
const NEW: [number, number] = [18, 35];
function insertMerged(m: [number, number][], [s, e]: [number, number]) {
  let i = 0;
  const res: [number, number][] = [];
  while (i < m.length && m[i][1] < s) res.push(m[i++]);
  let lo = s, hi = e;
  const absorbed: number[] = [];
  while (i < m.length && m[i][0] <= hi) {
    lo = Math.min(lo, m[i][0]);
    hi = Math.max(hi, m[i][1]);
    absorbed.push(i++);
  }
  res.push([lo, hi]);
  return { res: [...res, ...m.slice(i)], absorbed };
}
const INS = insertMerged(MERGED, NEW); // (5,60) (62,70), absorbed 0 and 1
export function InsertIntoMerged({ t }: StepCtx) {
  const cw = 120, cx = (i: number) => 60 + i * (cw + 16);
  const drop = easeOut(seg(t, 0.2, 0.7));
  const probe = stepIdx(t, 0.9, 1.7, 2);
  const absorb = easeInOut(seg(t, 2.0, 2.7));
  const shift = easeInOut(seg(t, 3.0, 3.6));
  const after = MERGED.length - 1 - INS.absorbed[INS.absorbed.length - 1];
  return (
    <Svg label="The merged list as three cells: five to twenty, thirty to sixty, sixty-two to seventy. The new interval eighteen to thirty-five drops in. A binary search probes for the first cell ending after eighteen; the new interval absorbs the two cells it overlaps into five to sixty, and the cell after it shifts left one slot" h={300}>
      <T x={300} y={40} s={13} f={C.caramel} a="middle" o={drop * (1 - absorb)}>{`new ${NEW[0]}–${NEW[1]}`}</T>
      {absorb < 1 && MERGED.map((iv, i) => {
        const inAbs = INS.absorbed.includes(i);
        const probed = (probe === 0 && i === 1) || (probe === 1 && i === 0);
        return (
          <g key={i} opacity={inAbs ? 1 - absorb : 1} transform={!inAbs && shift > 0 ? `translate(${-shift * (cw + 16) * (INS.absorbed.length - 1)},0)` : undefined}>
            <rect x={cx(i)} y={100} width={cw} height={40} rx={3} fill={C.band} stroke={probed ? C.caramel : C.latte} strokeWidth={probed ? 2.2 : 1.2} />
            <T x={cx(i) + cw / 2} y={125} s={13} f={C.crema} a="middle">{`${iv[0]}–${iv[1]}`}</T>
          </g>
        );
      })}
      {absorb > 0 && (
        <g>
          <rect x={cx(0)} y={100} width={lerp(cw * 2 + 16, cw, absorb)} height={40} rx={3} fill={C.band} stroke={C.caramel} strokeWidth={2} opacity={absorb} />
          <T x={cx(0) + lerp(cw * 2 + 16, cw, absorb) / 2} y={125} s={13} f={C.caramel} a="middle" o={absorb >= 1 ? 1 : 0}>{`${INS.res[0][0]}–${INS.res[0][1]}`}</T>
        </g>
      )}
      {absorb >= 1 && (
        <g transform={`translate(${-shift * (cw + 16)},0)`}>
          <rect x={cx(2)} y={100} width={cw} height={40} rx={3} fill={C.band} stroke={C.latte} strokeWidth={1.2} />
          <T x={cx(2) + cw / 2} y={125} s={13} f={C.crema} a="middle">{`${MERGED[2][0]}–${MERGED[2][1]}`}</T>
        </g>
      )}
      <T x={60} y={190} s={12} f={C.caramel} o={probe >= 0 ? 1 : 0}>find the place: O(log n + r)</T>
      <T x={60} y={220} s={12} f={C.cherryText} o={shift}>{`shift ${after} after it: O(n)`}</T>
    </Svg>
  );
}

// 9 · FlinkSessionWindows. Records arrive out of order, each opening its own window on the time axis; whenever two
// windows touch, they merge on the spot. The same six arrive; the same three sessions remain.
const ARRIVALS = TO_MERGE; // examples.py's input order
const LIVE = ARRIVALS.map((_, i) => mergeSteps([...ARRIVALS.slice(0, i + 1)].sort((a, b) => a[0] - b[0])).slice(-1)[0]);
export function FlinkSessionWindows({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 3.0, ARRIVALS.length);
  const cur = k >= 0 ? LIVE[k] : [];
  const fresh = k >= 0 ? ARRIVALS[k] : null;
  return (
    <Svg label="Records arrive out of order, each opening its own window on the time axis; whenever two windows touch they merge on the spot, live. All six arrive and the same three sessions remain" h={300}>
      <T x={30} y={30} s={12} f={C.latte}>a stream: each record opens a window</T>
      <line x1={mx(0)} y1={170} x2={mx(75)} y2={170} stroke={C.line} />
      {fresh && <rect x={mx(fresh[0])} y={70} width={(fresh[1] - fresh[0]) * 7} height={16} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.6} />}
      {fresh && <circle cx={mx(fresh[0])} cy={78} r={4} fill={C.caramel} />}
      {cur.map((iv, i) => <rect key={`${iv[0]}-${i}`} x={mx(iv[0])} y={140} width={(iv[1] - iv[0]) * 7} height={22} rx={3} fill={C.crema} opacity={0.85} />)}
      <T x={30} y={130} s={12} f={C.crema}>sessions so far</T>
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={k >= ARRIVALS.length - 1 ? 1 : 0}>{`${MERGED.length} sessions: the same merge, never stopping`}</T>
    </Svg>
  );
}

// 10 · PredictMinRooms. The ten bookings; a sweep line runs across the day. After answering: it stops at the busiest
// moment and the three bookings open there light.
const EVENTS = BOOKINGS.flatMap((b) => [[b[0], 1], [b[1], -1]] as [number, number][]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const RUN: { at: number; n: number }[] = [];
EVENTS.reduce((n, [at, d]) => {
  RUN.push({ at, n: n + d });
  return n + d;
}, 0);
const PEAK = Math.max(...RUN.map((r) => r.n));
const PEAK_AT = RUN.find((r) => r.n === PEAK)!.at;
const OPEN_AT_PEAK = BOOKINGS.filter((b) => b[0] <= PEAK_AT && PEAK_AT < b[1]);
export function PredictMinRooms({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const roam = t < 0.3 ? 0 : (((t - 0.3) / 2.2) % 1 + 1) % 1;
  const settle = answered ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const x = answered ? lerp(tx(660 * roam), tx(PEAK_AT + 5), settle) : tx(660 * roam);
  return (
    <Svg label="The ten bookings and a line sweeping across the day: how many rooms? After answering: the line stops at the busiest moment and the three bookings open there light" h={300}>
      <Ruler />
      {ROWS.map((b, i) => <Bar key={i} b={b} c={settle >= 1 && OPEN_AT_PEAK.includes(b) ? C.caramel : C.crema} fill={settle >= 1 && OPEN_AT_PEAK.includes(b) ? C.caramel : undefined} />)}
      <line x1={x} y1={12} x2={x} y2={RULER + 6} stroke={C.caramel} strokeWidth={2} />
      {!answered && <T x={300} y={284} s={13} f={C.crema} a="middle">how many rooms?</T>}
      {answered && <T x={300} y={284} s={13} f={C.caramel} a="middle" o={settle >= 1 ? 1 : 0}>{`${PEAK} open at once: ${PEAK} rooms`}</T>}
    </Svg>
  );
}

// 11 · MinHeapRooms. Bookings in start order drop into rooms: three lanes. Before each one, the earliest end among the
// rooms in use (the heap's top) is marked; at or before the new start, that room is reused, otherwise a new lane opens.
function rooms() {
  const lanes: B[][] = [];
  const steps: { b: B; lane: number; reused: boolean; top: number | null }[] = [];
  for (const b of ROWS) {
    const ends = lanes.map((l) => l[l.length - 1][1]);
    const top = ends.length ? Math.min(...ends) : null;
    if (top !== null && top <= b[0]) {
      const lane = ends.indexOf(top);
      lanes[lane].push(b);
      steps.push({ b, lane, reused: true, top });
    } else {
      lanes.push([b]);
      steps.push({ b, lane: lanes.length - 1, reused: false, top });
    }
  }
  return { lanes, steps };
}
const ROOMS = rooms();
export function MinHeapRooms({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 3.6, ROOMS.steps.length);
  const LY = (l: number) => 50 + l * 50;
  const st = k >= 0 ? ROOMS.steps[k] : null;
  return (
    <Svg label="Bookings in start order drop into rooms. Before each, the earliest end among the rooms in use, the heap's top, is marked on the ruler; if it is at or before the new start that room is reused, otherwise a new room opens. Three rooms in the end, the busiest moment's count" h={300}>
      <Ruler />
      {[0, 1, 2].map((l) => <T key={l} x={tx(0)} y={LY(l) + 11} s={12} f={l < (k >= 0 ? Math.max(...ROOMS.steps.slice(0, k + 1).map((x) => x.lane)) + 1 : 0) ? C.latte : C.mocha}>{`room ${l + 1}`}</T>)}
      {ROOMS.steps.map((x, i) => (i <= k ? <Bar key={i} b={x.b} y={LY(x.lane)} c={i === k ? C.caramel : C.crema} fill={i === k ? C.caramel : undefined} /> : null))}
      {st && st.top !== null && <line x1={tx(st.top)} y1={RULER - 14} x2={tx(st.top)} y2={RULER + 4} stroke={st.reused ? C.caramel : C.cherryText} strokeWidth={2.5} />}
      {st && <T x={300} y={284} s={13} f={st.reused ? C.crema : C.cherryText} a="middle">{k >= ROOMS.steps.length - 1 ? `${ROOMS.lanes.length} rooms = the busiest moment's ${PEAK}` : st.reused ? 'earliest end has passed: reuse' : 'every room still busy: open one'}</T>}
    </Svg>
  );
}

// 12 · PlusMinusSweep. Every start becomes +1 and every end −1, sorted along the ruler; a sweep walks them and the
// running total draws itself as a step line above, peaking at 3.
export function PlusMinusSweep({ t }: StepCtx) {
  const marks = easeOut(seg(t, 0.2, 0.7));
  const k = stepIdx(t, 0.9, 3.2, RUN.length);
  const py = (n: number) => 170 - n * 36;
  const pts: string[] = [`${tx(0)},${py(0)}`];
  let prev = 0;
  RUN.slice(0, k + 1).forEach((r) => {
    pts.push(`${tx(r.at)},${py(prev)}`, `${tx(r.at)},${py(r.n)}`);
    prev = r.n;
  });
  const peak = k >= RUN.findIndex((r) => r.n === PEAK);
  return (
    <Svg label="Every start becomes plus one and every end minus one, sorted along the ruler; a sweep walks them and the running total draws a step line above, peaking at three, the same answer without a heap" h={300}>
      <Ruler />
      <line x1={tx(0)} y1={170} x2={tx(660)} y2={170} stroke={C.mocha} strokeDasharray="3 4" />
      {EVENTS.map(([at, d], i) => (
        <path key={i} d={d > 0 ? `M${tx(at)} ${RULER - 12} l-4 8 l8 0 Z` : `M${tx(at)} ${RULER + 12} l-4 -8 l8 0 Z`} fill={d > 0 ? C.crema : C.cherryText} opacity={marks} />
      ))}
      {k >= 0 && <polyline points={pts.join(' ')} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
      {k >= 0 && <line x1={tx(RUN[k].at)} y1={20} x2={tx(RUN[k].at)} y2={RULER} stroke={C.caramel} strokeWidth={1} opacity={0.5} />}
      {peak && <T x={tx(PEAK_AT)} y={py(PEAK) - 10} s={13} f={C.caramel} a="middle">{`peak ${PEAK}`}</T>}
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={k >= RUN.length - 1 ? 1 : 0}>the same answer, no heap</T>
    </Svg>
  );
}

// 13 · PredictWeightedSting. The bookings now carry weights, printed in their bars. Finish earliest's five fill and
// total 28. After answering: a different set outlines in blue, worth more.
function weighted() {
  const jobs = [...BOOKINGS].sort((a, b) => a[1] - b[1]);
  const fin = jobs.map((j) => j[1]);
  const p = (j: number) => {
    let lo = 0, hi = j;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (fin[m] <= jobs[j][0]) lo = m + 1;
      else hi = m;
    }
    return lo - 1;
  };
  const OPT = [0];
  for (let j = 1; j <= jobs.length; j++) OPT.push(Math.max(OPT[j - 1], jobs[j - 1][2] + OPT[p(j - 1) + 1]));
  const chosen: B[] = [];
  let j = jobs.length;
  while (j > 0) {
    const take = jobs[j - 1][2] + OPT[p(j - 1) + 1];
    if (take >= OPT[j - 1] && take === OPT[j]) {
      chosen.unshift(jobs[j - 1]);
      j = p(j - 1) + 1;
    } else j--;
  }
  return { jobs, OPT, chosen, p };
}
const W = weighted(); // OPT[n] = 29
const GREEDY_W = BY_FINISH.kept.reduce((s, b) => s + b[2], 0); // 28
export function PredictWeightedSting({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const wts = easeOut(seg(t, 0.2, 0.6));
  const ef = easeOut(seg(t, 0.9, 1.4));
  const alt = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="Each booking now carries a weight, printed in its bar. Finish earliest's five bookings fill, worth 28 together. After answering: a different set, outlined in blue, is worth more" h={300}>
      <Ruler />
      {ROWS.map((b, i) => {
        const inEF = BY_FINISH.kept.includes(b);
        const inAlt = W.chosen.includes(b);
        return <Bar key={i} b={b} w={wts > 0} c={alt > 0 && inAlt ? C.cinnamon : inEF && ef > 0 ? C.caramel : C.crema} fill={inEF && ef >= 1 && alt <= 0 ? C.crema : undefined} />;
      })}
      {!answered && <T x={300} y={284} s={13} f={C.crema} a="middle" o={ef}>{`finish earliest: worth ${GREEDY_W}. The most?`}</T>}
      {answered && <T x={300} y={284} s={13} f={C.cinnamon} a="middle" o={alt}>{`another set is worth more than ${GREEDY_W}`}</T>}
    </Svg>
  );
}

// 14 · WeightedTable. The bookings in finish order, weights in their bars; the table OPT fills left to right, each cell
// the larger of skip (the cell before) and take (its weight plus the cell at p(j), an arrow found by binary search).
// The table ends at 29; the chosen set lights, against the greedy's 28.
export function WeightedTable({ t }: StepCtx) {
  const n = W.jobs.length;
  const k = stepIdx(t, 0.3, 3.6, n);
  const cw = 44, cx = (j: number) => 70 + j * cw;
  const done = t >= 3.8;
  const by = (j: number) => 18 + j * 17;
  const sx = 0.62, ox = 30;
  return (
    <Svg label="The bookings in finish order with their weights; below, the table fills left to right. Each cell is the larger of skipping, the cell before, and taking, the booking's weight plus the cell at its last compatible booking, found by binary search. The table ends at 29, and the chosen set lights, against finish earliest's 28" h={300}>
      {W.jobs.map((b, j) => {
        const on = done ? W.chosen.includes(b) : j === k;
        const pj = k >= 0 ? W.p(k) : -2;
        const isP = !done && j === pj;
        return (
          <g key={j}>
            <rect x={ox + b[0] * sx} y={by(j)} width={(b[1] - b[0]) * sx} height={11} rx={2} fill={on ? C.caramel : 'none'} stroke={isP ? C.cinnamon : on ? C.caramel : C.taupe} strokeWidth={isP ? 2 : 1.2} />
            <T x={ox + b[1] * sx + 6} y={by(j) + 10} s={12} f={on ? C.caramel : C.latte}>{String(b[2])}</T>
          </g>
        );
      })}
      <T x={44} y={214} s={12} f={C.latte} a="end">OPT</T>
      {Array.from({ length: n + 1 }, (_, j) => (
        <g key={j}>
          <rect x={cx(j) - 20} y={196} width={40} height={26} rx={3} fill={C.band} stroke={j === k + 1 && !done ? C.caramel : j === n && done ? C.caramel : C.mocha} strokeWidth={j === k + 1 || (j === n && done) ? 2 : 1} />
          <T x={cx(j)} y={214} s={13} f={j === n && done ? C.caramel : C.crema} a="middle" o={j <= k + 1 ? 1 : 0}>{String(W.OPT[j])}</T>
        </g>
      ))}
      {k >= 0 && !done && W.p(k) + 1 !== k && (
        <path d={`M${cx(k + 1)} 226 Q${(cx(k + 1) + cx(W.p(k) + 1)) / 2} 250 ${cx(W.p(k) + 1)} 226`} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
      )}
      <T x={300} y={284} s={13} f={C.crema} a="middle" o={done ? 1 : 0}>{`table ${W.OPT[n]} against finish earliest's ${GREEDY_W}`}</T>
    </Svg>
  );
}

// 15 · Recap. One ruler with the endpoints sorted; a sweep line crosses it while four small pictures light in turn
// above it: the merge, the greedy, the rooms, the table. Then: the sweep line, next.
export function Recap({ t }: StepCtx) {
  const sweep = seg(t, 0.3, 3.3);
  const names = ['a merge', 'a greedy pick', 'a heap of ends', 'a table'];
  const k = stepIdx(t, 0.3, 3.3, 4);
  const next = easeOut(seg(t, 3.6, 4.0));
  return (
    <Svg label="One ruler with every endpoint sorted; a sweep line crosses it while four names light in turn: a merge, a greedy pick, a heap of ends, a table. Then: the sweep line, next" h={300}>
      <Ruler />
      {ROWS.map((b, i) => <Bar key={i} b={b} c={tx(b[0]) <= tx(660 * sweep) ? C.crema : C.taupe} />)}
      <line x1={tx(660 * sweep)} y1={12} x2={tx(660 * sweep)} y2={RULER + 6} stroke={C.caramel} strokeWidth={2.2} />
      {next <= 0 && k >= 0 && <T x={300} y={284} s={13} f={C.crema} a="middle">{`sort once, walk once: ${names[k]}`}</T>}
      {next > 0 && <T x={300} y={284} s={13} f={C.caramel} a="middle" o={next}>the sweep line, next</T>}
    </Svg>
  );
}
