import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16's own): crema = a candidate at rest; latte = secondary labels; taupe = the
// discarded side; caramel = the thing to look at this beat (the pivot, the kept side, the target rank); cinnamon (rare)
// = the alternative beside it (a full sort, median-of-medians against quickselect); cherryText = the bad outcome (the
// quadratic pivot, the extra cost).
// Every printed number is examples.py's (seeded prints and asserts) or a quoted source: median of 1,000,000 keys
// 3,621,203 comparisons against a full-sort estimate of 19,931,569; first-element pivot at n = 200, 19,900 against a
// random pivot's 410; median-of-medians' first pivot discards 492 smaller and 507 larger of 1,000; at n = 2,000
// quickselect 7,253 against median-of-medians 15,499; over 5 trials quickselect 8,030 against Floyd-Rivest 6,537;
// introselect's depth limit 38 at 1,000,000; "30th and 70th percentiles" and the heapselect sentence from SOURCES.md.
// The small worked rows are the sibling topic's staircase matrix values (examples.py there), traced here.

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

// The first three rows of the previous topic's staircase matrix, read row by row: fifteen keys, not sorted as a whole.
const GROUPS = [
  [1, 4, 7, 11, 15],
  [2, 5, 8, 12, 19],
  [3, 6, 9, 16, 22],
];
const KEYS = GROUPS.flat();
const MEDIAN = [...KEYS].sort((a, b) => a - b)[7];

function Cell({ x, y, v, c = C.crema, o = 1, w = 32, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 18} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

/** Horizontal comparison bars with labels; widths relative to the largest. */
function Bars({ rows, y, t0, t }: { rows: [string, number, string, string][]; y: number; t0: number; t: number }) {
  const max = Math.max(...rows.map((r) => r[1]));
  return (
    <g>
      {rows.map(([lab, v, txt, c], i) => {
        const g = easeOut(seg(t, t0 + i * 0.4, t0 + 0.6 + i * 0.4));
        const w = Math.max(3, (v / max) * 330);
        return (
          <g key={lab}>
            <T x={30} y={y + i * 34 + 13} s={12} f={c}>{lab}</T>
            <rect x={150} y={y + i * 34} width={w * g} height={16} rx={2} fill={c} opacity={0.85} />
            <T x={158 + w} y={y + i * 34 + 13} s={12} f={c} o={g}>{txt}</T>
          </g>
        );
      })}
    </g>
  );
}

// 1 · Opening. Fifteen unsorted keys. A full sort lines every one of them up (a ghost row); but only one rank is
// wanted: the median lights, and the rest of the ghost fades away.
export function Opening({ t }: StepCtx) {
  const X = (i: number) => 30 + i * 36;
  const sorted = [...KEYS].sort((a, b) => a - b);
  const ghost = easeInOut(seg(t, 0.4, 1.4));
  const fade = easeOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="Fifteen unsorted keys. A full sort would line every one of them up, but only one rank is wanted: the median lights up, and the rest of the sorted order is never needed" h={220}>
      {KEYS.map((v, i) => (
        <Cell key={i} x={X(i)} y={30} v={v} c={v === MEDIAN && fade > 0.5 ? C.caramel : C.latte} />
      ))}
      {sorted.map((v, i) => {
        const from = KEYS.indexOf(v);
        const med = v === MEDIAN;
        return <Cell key={`s${i}`} x={lerp(X(from), X(i), ghost)} y={lerp(30, 110, ghost)} v={v} c={med ? C.caramel : C.cinnamon} o={ghost * (med ? 1 : 1 - fade * 0.85)} fill={med} />;
      })}
      <T x={30} y={170} s={12} f={C.cinnamon} o={ghost * (1 - fade)}>a full sort ranks every key</T>
      <T x={30} y={170} s={12} f={C.caramel} o={fade}>only one rank was asked for: the median</T>
    </Svg>
  );
}

// 2 · Predict. Three dashed bars, n, n log n and n², pulse. After answering: at a million keys, quickselect's measured
// 3,621,203 grows beside a full sort's 19,931,569.
export function PredictComparisons({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  return (
    <Svg label="Is finding the median of a million keys about n, n log n, or n squared comparisons? After answering: quickselect measured 3,621,203 comparisons against a full sort's estimated 19,931,569" h={240}>
      <T x={30} y={24} s={12} f={C.latte}>median of 1,000,000 keys</T>
      {!answered &&
        ['n', 'n log n', 'n²'].map((l, i) => (
          <g key={l} opacity={pulse}>
            <T x={30} y={68 + i * 40} s={13} f={C.caramel}>{l}</T>
            <rect x={130} y={56 + i * 40} width={[80, 240, 420][i]} height={16} rx={2} fill="none" stroke={C.caramel} strokeDasharray="5 4" strokeWidth={1.3} />
          </g>
        ))}
      {answered && (
        <Bars
          t={s}
          t0={0.2}
          y={50}
          rows={[
            ['quickselect', 3621203, '3,621,203', C.caramel],
            ['full sort', 19931569, '19,931,569', C.cinnamon],
          ]}
        />
      )}
      {!answered && <T x={300} y={216} s={14} a="middle" f={C.caramel} o={pulse}>which one?</T>}
      {answered && <T x={300} y={180} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.2, 1.6))}>a small constant times n</T>}
    </Svg>
  );
}

// 3 · Quickselect. The fifteen keys, target the median. A pivot lifts out, the keys part around it; the side without
// the target greys out and is dropped for good; the kept side partitions again, until the pivot lands on the rank.
type QFrame = { lo: number; hi: number; order: number[]; pivot: number };
const QS: QFrame[] = (() => {
  const order = KEYS.map((_, i) => i);
  const out: QFrame[] = [{ lo: 0, hi: 14, order: [...order], pivot: -1 }];
  let lo = 0;
  let hi = 14;
  const k = 7;
  while (lo <= hi) {
    const midSlot = lo + Math.floor((hi - lo) / 3); // a fixed stand-in for a random pick
    const pid = order[midSlot];
    const p = KEYS[pid];
    const seg0 = order.slice(lo, hi + 1);
    const small = seg0.filter((id) => KEYS[id] < p);
    const big = seg0.filter((id) => KEYS[id] > p);
    const re = [...small, pid, ...big];
    re.forEach((id, j) => (order[lo + j] = id));
    const at = lo + small.length;
    out.push({ lo, hi, order: [...order], pivot: pid });
    if (at === k) break;
    if (k < at) hi = at - 1;
    else lo = at + 1;
  }
  return out;
})();
export function Quickselect({ t }: StepCtx) {
  const X = (i: number) => 30 + i * 36;
  const per = 0.9;
  const k = clamp((t - 0.3) / per, 0, QS.length - 1);
  const i0 = Math.floor(k);
  const i1 = Math.min(i0 + 1, QS.length - 1);
  const f = easeInOut(clamp((k - i0) / 0.6, 0, 1));
  const range = QS[Math.min(i1, QS.length - 1)];
  const done = k >= QS.length - 1;
  return (
    <Svg label="Fifteen keys, looking for the median. A pivot is chosen and the keys part around it; the side that cannot hold the median is discarded for good, and only the kept side is partitioned again, until the pivot lands on the median's rank. On a million keys this took 3,621,203 comparisons against a full sort's 19,931,569" h={250}>
      <T x={30} y={22} s={12} f={C.latte}>target: the median, rank 8 of 15</T>
      {KEYS.map((v, id) => {
        const s0 = QS[i0].order.indexOf(id);
        const s1 = QS[i1].order.indexOf(id);
        const slot = lerp(s0, s1, f);
        const inside = s1 >= range.lo && s1 <= range.hi;
        const isP = id === QS[i1].pivot && i1 > 0;
        const y = 50 - (isP ? Math.sin(f * Math.PI) * 18 : 0);
        return <Cell key={id} x={X(slot)} y={y} v={v} c={done && isP ? C.caramel : isP ? C.caramel : inside ? C.crema : C.taupe} o={inside || isP ? 1 : 0.3} fill={isP} />;
      })}
      <path d={`M${X(range.lo)} 90 L${X(range.lo)} 96 L${X(range.hi) + 32} 96 L${X(range.hi) + 32} 90`} fill="none" stroke={C.caramel} strokeWidth={1.4} />
      <T x={30} y={130} s={12} f={C.crema} o={easeOut(seg(t, 0.8, 1.1))}>one side kept, the other dropped for good</T>
      <T x={30} y={156} s={13} f={C.caramel} o={done ? easeOut(seg(t, 0.3 + per * (QS.length - 1), 0.6 + per * (QS.length - 1))) : 0}>median found: {MEDIAN}</T>
      <g opacity={easeOut(seg(t, 3.6, 4.0))}>
        <T x={30} y={200} s={12} f={C.caramel}>1,000,000 keys: 3,621,203 comparisons</T>
        <T x={30} y={224} s={12} f={C.cinnamon}>a full sort: about 19,931,569</T>
      </g>
    </Svg>
  );
}

// 4 · The worst case. Sorted input with the first key as pivot: each round's range is one shorter, rows stacking into
// a triangle; beside it a random pivot's rows halve away. Then the counts at 200 keys: 19,900 against 410.
export function WorstCase({ t }: StepCtx) {
  const rows = clamp((t - 0.3) / 1.8, 0, 1) * 10;
  return (
    <Svg label="On sorted input with the first element as pivot every round discards one key, so the rows stack into a triangle; a random pivot's rows halve away. At 200 keys: 19,900 comparisons against 410" h={260}>
      <T x={30} y={22} s={12} f={C.cherryText}>first-key pivot, sorted input</T>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={30 + i * 6} y={34 + i * 12} width={(240 - i * 12) * clamp(rows - i, 0, 1)} height={9} rx={1} fill={C.cherryText} opacity={0.8} />
      ))}
      <T x={320} y={22} s={12} f={C.caramel}>random pivot</T>
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={320} y={34 + i * 12} width={(240 / 2 ** i) * clamp(rows - i * 2, 0, 1)} height={9} rx={1} fill={C.caramel} opacity={0.8} />
      ))}
      <g opacity={easeOut(seg(t, 2.4, 2.8))}>
        <T x={30} y={190} s={12} f={C.latte}>200 keys</T>
        <T x={30} y={214} s={13} f={C.cherryText}>19,900 comparisons</T>
        <T x={320} y={214} s={13} f={C.caramel}>410</T>
      </g>
      <T x={30} y={246} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>a triangle, not a shrinking sum</T>
    </Svg>
  );
}

// 5 · Median of medians. The fifteen keys stand as three groups of five; each group's median lights; the median of
// those three, 8, becomes the pivot. Keys provably smaller (below and left of it) and provably larger (above and right)
// shade in; then the measured discard on 1,000 keys and the quoted bound.
export function MedianOfMedians({ t }: StepCtx) {
  const CX = (g: number) => 150 + g * 90;
  const RY = (r: number) => 24 + r * 32;
  const med = easeOut(seg(t, 0.6, 1.0));
  const piv = easeOut(seg(t, 1.4, 1.8));
  const sh = easeOut(seg(t, 2.2, 2.7));
  const mm = [...GROUPS.map((g) => g[2])].sort((a, b) => a - b)[1];
  return (
    <Svg label="The fifteen keys as three groups of five, each sorted; their medians are 7, 8 and 9, and the median of those, 8, is the pivot. Keys provably smaller and provably larger shade in. On 1,000 keys the first such pivot discarded 492 smaller and 507 larger: between the 30th and 70th percentiles" h={300}>
      <T x={30} y={RY(2) + 18} s={12} f={C.latte}>groups of 5</T>
      {GROUPS.map((g, gi) =>
        g.map((v, r) => {
          const isMed = r === 2;
          const pg = GROUPS.map((x) => x[2]).indexOf(mm);
          const smaller = r <= 2 && g[2] <= mm && !(gi === pg && r === 2);
          const larger = r >= 2 && g[2] >= mm && !(gi === pg && r === 2);
          const isPivot = gi === pg && r === 2;
          const c = isPivot && piv > 0.5 ? C.caramel : smaller && sh > 0.5 ? C.crema : larger && sh > 0.5 ? C.cinnamon : isMed && med > 0.5 ? C.caramel : C.latte;
          return <Cell key={`${gi}-${r}`} x={CX(gi)} y={RY(r)} v={v} w={40} c={c} fill={isPivot && piv > 0.5} />;
        }),
      )}
      <T x={460} y={RY(2) + 18} s={12} f={C.caramel} o={piv}>pivot {mm}</T>
      <T x={30} y={RY(0) + 18} s={12} f={C.crema} o={sh}>≤ pivot</T>
      <T x={460} y={RY(4) + 18} s={12} f={C.cinnamon} o={sh}>≥ pivot</T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <T x={30} y={204} s={12} f={C.crema}>1,000 keys: 492 smaller, 507 larger</T>
        <T x={30} y={228} s={12} f={C.caramel}>"between the 30th and 70th percentiles"</T>
      </g>
      <T x={30} y={262} s={12} f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>at most seven in ten survive, every round</T>
    </Svg>
  );
}

// 6 · Why nobody uses it. The same 2,000 keys, the same rank: quickselect's 7,253 comparisons, then median-of-medians'
// 15,499 running more than twice as long.
export function WhyNobodyUsesIt({ t }: StepCtx) {
  return (
    <Svg label="The same 2,000 keys, the same rank: quickselect makes 7,253 comparisons, median-of-medians 15,499, its worst-case guarantee paid for in everyday work" h={200}>
      <T x={30} y={24} s={12} f={C.latte}>same 2,000 keys, same rank</T>
      <Bars
        t={t}
        t0={0.3}
        y={44}
        rows={[
          ['quickselect', 7253, '7,253', C.caramel],
          ['med. of meds', 15499, '15,499', C.cherryText],
        ]}
      />
      <T x={30} y={160} s={12} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>groups of five sorted, two recursions a round</T>
      <T x={30} y={186} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>a guarantee, at a measured price</T>
    </Svg>
  );
}

// 7 · Floyd-Rivest. A long strip of keys; a handful are sampled out and sorted; two bounds around the target's
// rank drop back onto the strip; one pass splits it three ways; only the narrow middle band goes on to quickselect.
// Then the averages over 5 trials: 8,030 against 6,537.
export function FloydRivest({ t }: StepCtx) {
  const N = 60;
  const P = (i: number) => 30 + i * 9;
  const H = (i: number) => 10 + ((i * 37) % 41);
  const pick = [3, 11, 17, 24, 31, 38, 46, 53];
  const byH = [...pick].sort((a, b) => H(a) - H(b));
  const U = H(byH[3]);
  const V = H(byH[5]);
  const samp = easeInOut(seg(t, 0.3, 1.0));
  const bounds = easeOut(seg(t, 1.3, 1.7));
  const split = easeOut(seg(t, 2.0, 2.6));
  const base = 100;
  return (
    <Svg label="A long strip of keys. A small random sample is drawn and sorted; two bounds around the target rank are read off it and laid across the strip; one pass splits everything into below, between and above, and only the narrow middle band goes on to quickselect. Averaged over 5 trials: quickselect 8,030 comparisons, Floyd-Rivest 6,537" h={290}>
      {Array.from({ length: N }, (_, i) => {
        const band = H(i) >= U && H(i) <= V;
        return <rect key={i} x={P(i)} y={base - H(i)} width={6} height={H(i)} rx={1} fill={band && split > 0.5 ? C.caramel : C.crema} opacity={split > 0.5 && !band ? 0.2 : pick.includes(i) && samp > 0 ? 0.3 : 0.8} />;
      })}
      {pick.map((i) => {
        const r = byH.indexOf(i);
        return <rect key={i} x={lerp(P(i), 380 + r * 16, samp)} y={lerp(base - H(i), 190 - H(i), samp)} width={10} height={H(i)} rx={1} fill={C.cinnamon} opacity={samp > 0 ? 0.9 : 0} />;
      })}
      <T x={380} y={210} s={12} f={C.cinnamon} o={samp}>sample, sorted</T>
      <g opacity={bounds}>
        <path d={`M30 ${base - U} L570 ${base - U}`} stroke={C.caramel} strokeWidth={1} strokeDasharray="4 4" />
        <path d={`M30 ${base - V} L570 ${base - V}`} stroke={C.caramel} strokeWidth={1} strokeDasharray="4 4" />
        <T x={30} y={140} s={12} f={C.caramel}>two bounds from the sample</T>
      </g>
      <T x={30} y={166} s={12} f={C.caramel} o={split}>one pass: keep the band</T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <T x={30} y={246} s={12} f={C.latte}>average of 5 trials, 2,000 keys</T>
        <T x={30} y={272} s={12} f={C.crema}>quickselect 8,030</T>
        <T x={250} y={272} s={12} f={C.caramel}>Floyd-Rivest 6,537</T>
      </g>
    </Svg>
  );
}

// 8 · Predict. quickselect runs; a depth counter fills; at the limit a box flips to its fallback, a question mark.
// After answering: the textbook's "median of medians" crosses out, the header's "heap select" lights.
export function PredictLibrary({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const depth = clamp((t - 0.2) / 1.6, 0, 1);
  const cross = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const lit = answered ? easeOutBack(seg(s, 0.7, 1.2)) : 0;
  return (
    <Svg label="Quickselect runs while a depth counter fills; at the limit it switches to a fallback. Which fallback does the standard library use? After answering: not the textbook's median of medians but a heap select" h={250}>
      <rect x={30} y={30} width={160} height={30} rx={15} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={110} y={50} s={12} a="middle" f={C.crema}>quickselect</T>
      <rect x={30} y={76} width={160} height={10} rx={2} fill="none" stroke={C.latte} strokeWidth={1} />
      <rect x={30} y={76} width={160 * depth} height={10} rx={2} fill={C.caramel} opacity={0.8} />
      <T x={30} y={106} s={12} f={C.latte}>depth</T>
      <path d="M200 45 L250 45" stroke={C.latte} strokeWidth={1.2} />
      <rect x={260} y={22} width={260} height={30} rx={15} fill="none" stroke={C.latte} strokeWidth={1.3} opacity={answered ? 1 : pulse} />
      <T x={390} y={42} s={12} a="middle" f={C.latte}>median of medians</T>
      {answered && <path d="M270 37 L510 37" stroke={C.cherryText} strokeWidth={2} opacity={cross} />}
      <rect x={260} y={66} width={260} height={30} rx={15} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.4} opacity={clamp(lit, 0, 1)} />
      <T x={390} y={86} s={12} a="middle" f={C.caramel} o={clamp(lit, 0, 1)}>heap select</T>
      {!answered && <T x={300} y={200} s={14} a="middle" f={C.caramel} o={pulse}>which fallback ships?</T>}
      {answered && <T x={300} y={200} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.2, 1.6))}>not the textbook's</T>}
    </Svg>
  );
}

// 9 · Introselect. The depth budget at a million keys, std::__lg(n) * 2 = 38, as a column of ticks; quickselect's
// recursion climbs it; at zero budget the range goes to __heap_select, the header's own fallback, not median of
// medians; Wikipedia's own sentence about most C++ libraries.
export function Introselect({ t }: StepCtx) {
  const used = clamp((t - 0.3) / 1.8, 0, 1) * 38;
  const fall = easeOut(seg(t, 2.1, 2.5));
  return (
    <Svg label="At a million keys the depth budget is std::__lg(n) times 2, 38. Quickselect's recursion uses it up; at zero the remaining range goes to __heap_select, the installed header's fallback, rather than median of medians. Most C++ standard libraries combine quickselect and heapselect, with an n log n worst case" h={290}>
      <T x={30} y={24} s={12} f={C.latte}>1,000,000 keys: std::__lg(n) * 2 = 38</T>
      {Array.from({ length: 38 }, (_, i) => (
        <rect key={i} x={30 + i * 14} y={38} width={10} height={14} rx={1} fill={i < used ? C.caramel : 'none'} stroke={C.caramel} strokeWidth={0.8} opacity={i < used ? 0.85 : 0.4} />
      ))}
      <g opacity={fall}>
        <rect x={30} y={80} width={220} height={30} rx={15} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.4} />
        <T x={140} y={100} s={12} a="middle" f={C.caramel}>__heap_select</T>
        <rect x={290} y={80} width={250} height={30} rx={15} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={0.5} />
        <T x={415} y={100} s={12} a="middle" f={C.latte} o={0.6}>median of medians</T>
        <path d="M300 95 L530 95" stroke={C.cherryText} strokeWidth={1.6} />
      </g>
      <T x={30} y={146} s={12} f={C.crema} o={easeOut(seg(t, 2.7, 3.1))}>read from the installed header</T>
      <g opacity={easeOut(seg(t, 3.4, 3.8))}>
        <T x={30} y={192} s={12} f={C.crema}>"in most C++ Standard Library implementations,</T>
        <T x={30} y={214} s={12} f={C.crema}>a different "introselect" algorithm is used,</T>
        <T x={30} y={236} s={12} f={C.crema}>which combines quickselect and heapselect"</T>
      </g>
    </Svg>
  );
}

// 10 · Recap. Three answers this chapter found, as chips: a key, a boundary, a rank. Then a few nodes and edges appear,
// and a ring spreads out from one of them, layer by layer: breadth-first search, next.
export function Recap({ t }: StepCtx) {
  const CH = ['a key', 'a boundary', 'a rank'];
  const NODES: [number, number][] = [
    [300, 130],
    [230, 100],
    [370, 100],
    [250, 170],
    [360, 175],
    [170, 130],
    [440, 140],
  ];
  const EDGES = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 5],
  ];
  const DIST = [0, 1, 1, 1, 1, 2, 2];
  const wave = clamp((t - 2.0) / 1.2, 0, 1) * 2.2;
  return (
    <Svg label="This chapter's answers were single values: a key, a boundary, a rank. Next, a structure: a small graph, explored layer by layer outward from one node by breadth-first search" h={230}>
      {CH.map((c, i) => {
        const a = clamp(easeOutBack(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3)), 0, 1);
        return (
          <g key={c} opacity={a}>
            <rect x={60 + i * 170} y={14} width={140} height={28} rx={14} fill="none" stroke={C.caramel} strokeWidth={1.3} />
            <T x={130 + i * 170} y={33} s={12} a="middle" f={C.caramel}>{c}</T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.4, 1.8))}>
        {EDGES.map(([a, b]) => (
          <path key={`${a}-${b}`} d={`M${NODES[a][0]} ${NODES[a][1]} L${NODES[b][0]} ${NODES[b][1]}`} stroke={C.mocha} strokeWidth={1.3} />
        ))}
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={10} fill={wave >= DIST[i] ? C.caramel : C.roast} stroke={C.crema} strokeWidth={1.3} />
        ))}
      </g>
      <circle cx={300} cy={130} r={wave * 70} fill="none" stroke={C.caramel} strokeWidth={1.2} opacity={wave > 0 && wave < 2.2 ? 0.6 : 0} />
      <T x={300} y={222} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>breadth-first search, next</T>
    </Svg>
  );
}
