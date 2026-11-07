import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's or a quoted source's: the naive rule's 27 chains over 6 orderings, split
// exactly 4, 4, 4, 5, 5, 5; n^n mod n! for n = 3 to 6; Sattolo's single cycle of 4 and its 6 outcomes; the Mersenne
// Twister's 2,080-item limit and log₂ 52! = 225.6 bits; the buffered shuffle's exact 3/4 and 0.704 against a uniform
// 0.167. Weir's 5,034 of 10,000 and the Fisher–Yates article's 0–99 mod 16, 0–3 about 17% more often, are quoted
// (SOURCES.md §1, §3). The seeded 60,000-run counts are drawn as shape only; which positions a draw picks in a trace is
// an illustration (each trace is the topic's own loop run on those picks).

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

/** Run a swap loop on picks: swaps[k] = [i, j]; returns the arrangement after each swap (index 0 = start). */
function runSwaps(start: string[], swaps: [number, number][]) {
  const states = [start.slice()];
  let a = start.slice();
  for (const [i, j] of swaps) {
    a = a.slice();
    [a[i], a[j]] = [a[j], a[i]];
    states.push(a);
  }
  return states;
}

/** Position (slot, lift) of each card while swap k plays with progress u. */
function cardSlots(states: string[][], k: number, u: number) {
  const from = states[Math.max(0, Math.min(k, states.length - 1))];
  const to = states[Math.max(0, Math.min(k + 1, states.length - 1))];
  const out: Record<string, { slot: number; lift: number }> = {};
  from.forEach((c, p) => {
    const q = to.indexOf(c);
    const e = easeInOut(u);
    out[c] = { slot: lerp(p, q, e), lift: p === q ? 0 : Math.sin(Math.PI * e) * (p < q ? 1 : -1) };
  });
  return out;
}

function Card({ x, y, c, col, w = 44, h = 56, fill = 'none' }: { x: number; y: number; c: string; col: string; w?: number; h?: number; fill?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill} stroke={col} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 6} s={16} f={col} a="middle">{c}</T>
    </g>
  );
}

const NAMES = ['ABC', 'ACB', 'BAC', 'BCA', 'CAB', 'CBA'];
// The naive rule's 27 choice chains on three cards, enumerated exactly (examples.py: 4, 4, 4, 5, 5, 5).
const EXACT27 = (() => {
  const counts: Record<string, number> = Object.fromEntries(NAMES.map((n) => [n, 0]));
  for (let c = 0; c < 27; c++) {
    const ch = [Math.floor(c / 9), Math.floor(c / 3) % 3, c % 3];
    const a = ['A', 'B', 'C'];
    ch.forEach((j, i) => ([a[i], a[j]] = [a[j], a[i]]));
    counts[a.join('')] += 1;
  }
  return NAMES.map((n) => counts[n]);
})();
// examples.py's seeded 60,000 runs of the naive rule, drawn as shape only.
const NAIVE_SEEDED = [9047, 10948, 11197, 11093, 8836, 8879];

// 1 · Opening. Three cards; the naive rule swaps each position with any position (picks an illustration). Then its
// 27 equally likely choice chains drop, one dot each, onto the six orderings, and land 4 or 5 apiece: never even.
export function Opening({ t }: StepCtx) {
  const states = runSwaps(['A', 'B', 'C'], [[0, 2], [1, 0], [2, 1]]);
  const k = stepIdx(t, 0.2, 1.7, 3);
  const u = k < 0 ? 0 : seg(t, 0.2 + k * 0.5, 0.6 + k * 0.5);
  const pos = cardSlots(states, Math.max(k, 0), k < 0 ? 0 : u);
  const drop = seg(t, 1.9, 3.3);
  const cap = easeOut(seg(t, 3.3, 3.8));
  const bx = (b: number) => 60 + b * 84;
  let n = 0;
  return (
    <Svg label="Three cards. The rule swaps each position with any position at all. Then its twenty-seven equally likely choice chains drop, one dot each, onto the six orderings, and land four or five apiece, never evenly" h={300}>
      {['A', 'B', 'C'].map((c) => (
        <Card key={c} x={200 + pos[c].slot * 70} y={24 - pos[c].lift * 14} c={c} col={C.crema} w={50} h={50} />
      ))}
      {k >= 0 && (
        <T x={300} y={100} s={12} f={C.caramel} a="middle">position {k + 1}: swap with any</T>
      )}
      {NAMES.map((nm, b) => (
        <g key={nm} opacity={drop > 0 ? 1 : 0}>
          <line x1={bx(b) - 4} y1={226} x2={bx(b) + 52} y2={226} stroke={C.line} />
          <T x={bx(b) + 24} y={246} s={12} f={C.latte} a="middle">{nm}</T>
          <T x={bx(b) + 24} y={268} s={13} f={EXACT27[b] === 5 ? C.caramel : C.cherryText} a="middle" o={cap}>{EXACT27[b]}</T>
        </g>
      ))}
      {NAMES.map((nm, b) =>
        Array.from({ length: EXACT27[b] }, (_, d) => {
          const order = n++;
          const f = easeOut(clamp(drop * 27 - order * 0.85, 0, 1));
          if (f <= 0) return null;
          const tx = bx(b) + 12 + (d % 2) * 24, ty = 214 - Math.floor(d / 2) * 18;
          return <circle key={`${nm}-${d}`} cx={lerp(300, tx, f)} cy={lerp(118, ty, f)} r={6} fill={EXACT27[b] === 5 ? C.caramel : C.latte} />;
        }),
      )}
      <T x={300} y={292} s={12} f={C.latte} a="middle" o={cap}>27 chains, 6 orderings: never even</T>
    </Svg>
  );
}

// 2 · PredictNaiveOutcome. Six bars for the six orderings against a dashed fair share of 10,000. After answering, the
// bars grow to the seeded run's counts (shape only): three high, three low.
export function PredictNaiveOutcome({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const grow = answered ? easeOut(seg(s, 0.2, 1.4)) : 0;
  const base = 230, sc = 150 / 12000;
  const a = easeOut(seg(t, 0.2, 0.8));
  return (
    <Svg label="Six bars, one per ordering of three cards, against a dashed fair share of ten thousand out of sixty thousand. After answering, the bars grow to a seeded run's counts: three orderings high, three low" h={290}>
      <line x1={50} y1={base} x2={560} y2={base} stroke={C.line} />
      <line x1={50} y1={base - 10000 * sc} x2={560} y2={base - 10000 * sc} stroke={C.latte} strokeDasharray="5 4" opacity={a} />
      <T x={560} y={base - 10000 * sc - 8} s={12} f={C.latte} a="end" o={a}>fair: 10,000</T>
      {NAMES.map((nm, b) => {
        const v = NAIVE_SEEDED[b];
        const hi = EXACT27[b] === 5;
        const h = v * sc * grow;
        return (
          <g key={nm} opacity={a}>
            {!answered && <rect x={70 + b * 80} y={base - 10000 * sc} width={44} height={10000 * sc} fill="none" stroke={C.taupe} strokeDasharray="3 3" />}
            {!answered && <T x={92 + b * 80} y={base - 60} s={16} f={C.taupe} a="middle">?</T>}
            <rect x={70 + b * 80} y={base - h} width={44} height={h} fill={hi ? C.caramel : C.cherry} stroke={hi ? 'none' : C.cherryText} />
            <T x={92 + b * 80} y={base + 20} s={12} f={C.latte} a="middle">{nm}</T>
          </g>
        );
      })}
      <T x={50} y={276} s={12} f={C.caramel} o={grow}>three high</T>
      <T x={160} y={276} s={12} f={C.cherryText} o={grow}>three low, every run</T>
    </Svg>
  );
}

// 3 · FisherYatesReveal. Four cards. From the last position down to the second, a bracket marks what is not yet
// placed, a draw lands inside it, the two cards swap, and the position locks. The draw shrinks: from 4, then 3, then 2.
const FY_SWAPS: [number, number][] = [[3, 1], [2, 0], [1, 1]]; // picks an illustration
export function FisherYatesReveal({ t }: StepCtx) {
  const states = runSwaps(['A', 'B', 'C', 'D'], FY_SWAPS);
  const k = stepIdx(t, 0.4, 4.0, 3);
  const local = k < 0 ? 0 : seg(t, 0.4 + k * 1.2, 1.6 + k * 1.2);
  const pos = cardSlots(states, Math.max(k, 0), k < 0 ? 0 : seg(local, 0.45, 0.85));
  const sx = (p: number) => 110 + p * 100;
  const i = k < 0 ? -1 : FY_SWAPS[k][0];
  const j = k < 0 ? -1 : FY_SWAPS[k][1];
  const bracket = easeOut(seg(local, 0, 0.2));
  const mark = easeOut(seg(local, 0.2, 0.4));
  const lockedUpTo = k < 0 ? 4 : local >= 0.9 ? i : i + 1;
  const done = t >= 4.0;
  return (
    <Svg label="Four cards. From the last position down to the second, a bracket marks the cards not yet placed, a draw lands inside it, the two cards swap, and that position locks. Each draw comes from a smaller range: four, then three, then two" h={290}>
      {[0, 1, 2, 3].map((p) => {
        const locked = p >= lockedUpTo || (done && p === 0);
        return <rect key={p} x={sx(p) - 6} y={84} width={62} height={74} rx={6} fill="none" stroke={locked ? C.caramel : C.mocha} strokeWidth={locked ? 1.6 : 1} />;
      })}
      {['A', 'B', 'C', 'D'].map((c) => (
        <Card key={c} x={sx(pos[c].slot)} y={92 - pos[c].lift * 30} c={c} col={C.crema} w={50} h={58} />
      ))}
      {k >= 0 && (
        <g>
          <path d={`M${sx(0) - 4} 196 L${sx(0) - 4} 204 L${sx(i) + 54} 204 L${sx(i) + 54} 196`} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={bracket} />
          <T x={sx(0) - 4} y={228} s={12} f={C.caramel} o={bracket}>draw from {i + 1} not yet placed</T>
          <path d={`M${sx(j) + 25} ${lerp(56, 74, mark)} l-7 -10 l14 0 Z`} fill={C.caramel} opacity={mark} />
        </g>
      )}
      <T x={sx(0) - 4} y={44} s={12} f={C.latte}>last position first, moving left</T>
      <T x={300} y={270} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>4, then 3, then 2: each range smaller</T>
    </Svg>
  );
}

// 4 · CorrectnessByCounting. Three cards: the chain tree of Fisher–Yates draws, 3 choices then 2, ends in 6 leaves,
// and each leaf is a different ordering: 3 × 2 = 6 = 3!, one chain per ordering.
const FY3_LEAVES = (() => {
  const out: string[] = [];
  for (let j2 = 0; j2 < 3; j2++)
    for (let j1 = 0; j1 < 2; j1++) {
      const a = ['A', 'B', 'C'];
      [a[2], a[j2]] = [a[j2], a[2]];
      [a[1], a[j1]] = [a[j1], a[1]];
      out.push(a.join(''));
    }
  return out;
})();
export function CorrectnessByCounting({ t }: StepCtx) {
  const lvl1 = easeOut(seg(t, 0.4, 1.2));
  const lvl2 = easeOut(seg(t, 1.4, 2.2));
  const leaves = easeOut(seg(t, 2.4, 3.2));
  const eq = easeOut(seg(t, 3.4, 4.0));
  const rx = 300, ry = 36;
  const m1 = (a: number) => 120 + a * 180;
  const lf = (a: number, b: number) => m1(a) - 45 + b * 90;
  return (
    <Svg label="For three cards, the tree of Fisher-Yates draws: three choices, then two, ending in six leaves, and each leaf is a different ordering. Three times two is six, three factorial: one chain per ordering" h={290}>
      <circle cx={rx} cy={ry} r={6} fill={C.caramel} />
      {[0, 1, 2].map((a) => (
        <g key={a}>
          <line x1={rx} y1={ry} x2={lerp(rx, m1(a), lvl1)} y2={lerp(ry, 100, lvl1)} stroke={C.latte} strokeWidth={1.4} />
          <circle cx={m1(a)} cy={100} r={5} fill={C.crema} opacity={lvl1} />
          {[0, 1].map((b) => (
            <g key={b}>
              <line x1={m1(a)} y1={100} x2={lerp(m1(a), lf(a, b), lvl2)} y2={lerp(100, 160, lvl2)} stroke={C.latte} strokeWidth={1.4} opacity={lvl1 >= 1 ? 1 : 0} />
              <rect x={lf(a, b) - 24} y={166} width={48} height={24} rx={3} fill="none" stroke={C.caramel} opacity={leaves} />
              <T x={lf(a, b)} y={183} s={13} f={C.caramel} a="middle" o={leaves}>{FY3_LEAVES[a * 2 + b]}</T>
            </g>
          ))}
        </g>
      ))}
      <T x={560} y={72} s={12} f={C.latte} a="end" o={lvl1}>first draw: 3</T>
      <T x={560} y={134} s={12} f={C.latte} a="end" o={lvl2}>second draw: 2</T>
      <T x={300} y={236} s={15} f={C.crema} a="middle" o={eq}>3 × 2 = 6 = 3!</T>
      <T x={300} y={262} s={12} f={C.caramel} a="middle" o={eq}>six different leaves: one chain each</T>
    </Svg>
  );
}

// 5 · NaiveShuffleCounted. The naive rule's tree, 3 then 9 then 27 leaves; then the count against the orderings for
// n = 3 to 6: n^n leaves a remainder by n! every time, so no even split exists.
const MODS = [
  { n: 3, nn: '27', f: '6', r: '3' },
  { n: 4, nn: '256', f: '24', r: '16' },
  { n: 5, nn: '3,125', f: '120', r: '5' },
  { n: 6, nn: '46,656', f: '720', r: '576' },
];
export function NaiveShuffleCounted({ t }: StepCtx) {
  const lv = [easeOut(seg(t, 0.3, 0.8)), easeOut(seg(t, 0.8, 1.3)), easeOut(seg(t, 1.3, 1.8))];
  const rows = (r: number) => easeOut(seg(t, 2.0 + r * 0.5, 2.4 + r * 0.5));
  const x1 = (a: number) => 140 + a * 160;
  const x2 = (a: number) => 92 + a * 52;
  const x3 = (a: number) => 76 + a * 17.3;
  return (
    <Svg label="The naive rule's tree for three cards: three, then nine, then twenty-seven leaves. Then the count against the orderings for three to six cards: n to the n leaves a remainder when divided by n factorial every time, so no even split exists" h={300}>
      <circle cx={300} cy={14} r={4} fill={C.caramel} />
      {[0, 1, 2].map((a) => (
        <g key={a}>
          <line x1={300} y1={14} x2={x1(a)} y2={40} stroke={C.latte} opacity={lv[0]} />
          {[0, 1, 2].map((b) => (
            <g key={b}>
              <line x1={x1(a)} y1={40} x2={x2(a * 3 + b)} y2={66} stroke={C.latte} opacity={lv[1]} />
              {[0, 1, 2].map((c) => (
                <line key={c} x1={x2(a * 3 + b)} y1={66} x2={x3(a * 9 + b * 3 + c)} y2={92} stroke={C.latte} opacity={lv[2]} />
              ))}
            </g>
          ))}
        </g>
      ))}
      {Array.from({ length: 27 }, (_, i) => <circle key={i} cx={x3(i)} cy={94} r={3} fill={C.crema} opacity={lv[2]} />)}
      <T x={560} y={118} s={12} f={C.latte} a="end" o={lv[2]}>27 chains</T>
      <T x={60} y={136} s={12} f={C.latte}>cards</T>
      <T x={170} y={136} s={12} f={C.latte} a="end">chains</T>
      <T x={300} y={136} s={12} f={C.latte} a="end">orderings</T>
      <T x={430} y={136} s={12} f={C.cherryText} a="end">left over</T>
      {MODS.map((m, r) => (
        <g key={m.n} opacity={rows(r)}>
          <T x={60} y={164 + r * 28} s={14} f={C.crema}>{m.n}</T>
          <T x={170} y={164 + r * 28} s={14} f={C.crema} a="end">{m.nn}</T>
          <T x={300} y={164 + r * 28} s={14} f={C.crema} a="end">{m.f}</T>
          <T x={430} y={164 + r * 28} s={14} f={C.cherryText} a="end">{m.r}</T>
        </g>
      ))}
      <T x={450} y={248} s={12} f={C.cherryText} o={rows(3)}>never zero</T>
    </Svg>
  );
}

// 6 · RandomComparatorSort. Three items asked pairwise by a comparator that answers at random: the answers form a
// cycle, so there is no order to find. Weir's measurement of the ballot (SOURCES.md §3): Internet Explorer last
// 5,034 times in 10,000, against a fair share of one in five.
export function RandomComparatorSort({ t }: StepCtx) {
  const tri = [
    { x: 120, y: 40, c: 'A' },
    { x: 200, y: 160, c: 'B' },
    { x: 40, y: 160, c: 'C' },
  ];
  const arrows = [0, 1, 2].map((e) => easeOut(seg(t, 0.3 + e * 0.5, 0.7 + e * 0.5)));
  const cyc = easeOut(seg(t, 1.9, 2.4));
  const bars = easeOut(seg(t, 2.6, 3.6));
  const X0 = 320, SC = 230;
  return (
    <Svg label="Three items asked pairwise by a comparator that answers at random: A before B, B before C, C before A, a cycle with no order in it. Then Rob Weir's ten thousand runs of the ballot: Internet Explorer last 5,034 times, against a fair share of one in five" h={290}>
      {tri.map((p) => <Card key={p.c} x={p.x} y={p.y} c={p.c} col={C.crema} w={40} h={40} />)}
      {[0, 1, 2].map((e) => {
        const a = tri[e], b = tri[(e + 1) % 3];
        const ax = a.x + 20, ay = a.y + 20, bx = b.x + 20, by = b.y + 20;
        const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
        const sx = ax + (dx / L) * 28, sy = ay + (dy / L) * 28;
        const ex = lerp(sx, bx - (dx / L) * 30, arrows[e]), ey = lerp(sy, by - (dy / L) * 30, arrows[e]);
        return (
          <g key={e} opacity={arrows[e] > 0 ? 1 : 0}>
            <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={cyc > 0 ? C.cherryText : C.caramel} strokeWidth={1.8} />
            <circle cx={ex} cy={ey} r={3.5} fill={cyc > 0 ? C.cherryText : C.caramel} />
          </g>
        );
      })}
      <T x={30} y={240} s={12} f={C.cherryText} o={cyc}>a before b before c before a</T>
      <T x={30} y={262} s={12} f={C.cherryText} o={cyc}>no order to find</T>
      <g opacity={bars}>
        <T x={X0} y={40} s={12} f={C.latte}>browser ballot, 10,000 runs</T>
        <T x={X0} y={68} s={12} f={C.latte}>fair share of last place</T>
        <rect x={X0} y={78} width={0.2 * SC * bars} height={18} fill={C.latte} />
        <T x={X0} y={128} s={12} f={C.cherryText}>I.E. last</T>
        <rect x={X0} y={138} width={0.5034 * SC * bars} height={18} fill={C.cherry} stroke={C.cherryText} />
        <T x={X0} y={182} s={14} f={C.cherryText} o={bars >= 1 ? 1 : 0}>5,034 of 10,000</T>
        <T x={X0 + 0.2 * SC + 6} y={92} s={12} f={C.latte}>1 in 5</T>
      </g>
    </Svg>
  );
}

// 7 · PredictGeneratorReach. A ring of generator states, each pointing at one ordering in a large field of orderings.
// After answering, the orderings no state points at go dark: at most one reachable ordering per state.
const RING = 12;
const FIELD = 60;
const HITS = Array.from({ length: RING }, (_, i) => (i * 23 + 7) % FIELD); // illustration
export function PredictGeneratorReach({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const dark = answered ? easeOut(seg(s, 0.3, 1.0)) : 0;
  const cx = 110, cy = 140, R = 70;
  const fx = (i: number) => 260 + (i % 10) * 30;
  const fy = (i: number) => 60 + Math.floor(i / 10) * 30;
  return (
    <Svg label="A ring of twelve generator states, each pointing at one ordering in a field of sixty orderings. After answering, the orderings no state points at go dark: at most one reachable ordering per state" h={290}>
      {Array.from({ length: RING }, (_, i) => {
        const ang = (i / RING) * Math.PI * 2 - Math.PI / 2;
        const x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang);
        const ar = easeOut(seg(t, 0.4 + i * 0.12, 0.8 + i * 0.12));
        const h = HITS[i];
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={6} fill={C.caramel} />
            <line x1={x} y1={y} x2={lerp(x, fx(h) + 10, ar)} y2={lerp(y, fy(h) + 10, ar)} stroke={C.caramel} strokeWidth={0.8} opacity={0.35 * (1 - dark) + 0.15} />
          </g>
        );
      })}
      {Array.from({ length: FIELD }, (_, i) => {
        const hit = HITS.includes(i);
        return <rect key={i} x={fx(i)} y={fy(i)} width={20} height={20} rx={2} fill={hit ? C.caramel : C.latte} opacity={hit ? 0.9 : 0.6 * (1 - dark) + 0.08} />;
      })}
      <T x={cx} y={250} s={12} f={C.caramel} a="middle">generator states</T>
      <T x={410} y={250} s={12} f={C.latte} a="middle">orderings</T>
      <T x={410} y={276} s={12} f={C.caramel} a="middle" o={dark}>at most one per state</T>
    </Svg>
  );
}

// 8 · SeedModuloLimits. First: eight states can light at most eight of twelve outcomes, whatever the mapping. Then
// the Fisher–Yates article's example (SOURCES.md §1): a hundred values, 0 to 99, folded by remainder into 16 bins —
// bins 0 to 3 get seven values, the rest six, about 17% more often.
export function SeedModuloLimits({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const fold = seg(t, 1.4, 3.6);
  const cap = easeOut(seg(t, 3.6, 4.1));
  const bx = (b: number) => 64 + b * 30;
  const base = 250;
  return (
    <Svg label="Eight generator states light at most eight of twelve outcomes, whatever the mapping. Then a hundred values, zero to ninety-nine, fold by remainder into sixteen bins: bins zero to three collect seven values each, the rest six, about seventeen percent more often" h={290}>
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={64 + i * 22} cy={30} r={5} fill={C.caramel} opacity={a} />)}
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={300 + i * 22} y={22} width={16} height={16} rx={2} fill={i % 3 === 2 ? 'none' : C.caramel} stroke={i % 3 === 2 ? C.taupe : 'none'} opacity={a} />)}
      <T x={64} y={62} s={12} f={C.caramel} o={a}>8 states</T>
      <T x={300} y={62} s={12} f={C.latte} o={a}>at most 8 of 12 outcomes</T>
      <T x={64} y={100} s={12} f={C.latte} o={fold > 0 ? 1 : 0}>0 to 99, remainder by 16</T>
      {Array.from({ length: 100 }, (_, v) => {
        const b = v % 16;
        const lvl = Math.floor(v / 16);
        const f = easeOut(clamp(fold * 100 / 6 - v / 6, 0, 1));
        if (f <= 0) return null;
        return <rect key={v} x={bx(b) + 3} y={base - (lvl + 1) * 16 * f - 0} width={20} height={13} rx={1} fill={b < 4 ? C.caramel : C.latte} opacity={0.4 + 0.5 * f} />;
      })}
      {Array.from({ length: 16 }, (_, b) => <T key={b} x={bx(b) + 13} y={base + 16} s={12} f={b < 4 ? C.caramel : C.latte} a="middle" o={fold > 0 ? 1 : 0}>{b}</T>)}
      <T x={560} y={100} s={12} f={C.caramel} a="end" o={cap}>0–3: about 17%</T>
      <T x={560} y={118} s={12} f={C.caramel} a="end" o={cap}>more often</T>
    </Svg>
  );
}

// 9 · DeckTooLarge. Bits needed against bits held: a 32-bit generator's state is a short bar; the orderings of a
// 52-card deck need log₂ 52! = 225.6 bits, the rest of that bar out of reach. Then the Mersenne Twister: every
// ordering of up to 2,080 items, not 2,081.
export function DeckTooLarge({ t }: StepCtx) {
  const X0 = 40, SC = 2.2;
  const g = easeOut(seg(t, 0.3, 1.0));
  const d = easeInOut(seg(t, 1.2, 2.6));
  const mt = easeOut(seg(t, 2.9, 3.5));
  const test = easeOut(seg(t, 3.7, 4.2));
  return (
    <Svg label="Bits needed against bits held. A thirty-two-bit generator's state is a short bar. The orderings of a fifty-two-card deck need 225.6 bits, and the rest of that bar is out of reach. Then the Mersenne Twister covers every ordering of up to 2,080 items, not 2,081" h={290}>
      <T x={X0} y={34} s={12} f={C.latte}>a 32-bit generator</T>
      <rect x={X0} y={44} width={32 * SC * g} height={20} fill={C.caramel} />
      <T x={X0} y={98} s={12} f={C.latte}>orderings of 52 cards</T>
      <rect x={X0} y={108} width={32 * SC * d} height={20} fill={C.caramel} />
      <rect x={X0 + 32 * SC} y={108} width={Math.max(0, (225.6 - 32) * SC * d)} height={20} fill={C.cherry} stroke={C.cherryText} opacity={d > 0 ? 1 : 0} />
      <T x={X0 + 225.6 * SC} y={98} s={13} f={C.crema} a="end" o={d >= 1 ? 1 : 0}>225.6 bits</T>
      <T x={X0 + 32 * SC + 8} y={148} s={12} f={C.cherryText} o={d >= 1 ? 1 : 0}>never reachable</T>
      <g opacity={mt}>
        <T x={X0} y={196} s={12} f={C.latte}>Mersenne Twister, period 2^19937 − 1</T>
        <T x={X0} y={220} s={14} f={C.crema}>every order of up to 2,080 items</T>
      </g>
      <T x={X0} y={262} s={12} f={C.latte} o={test}>a few orders tested is not every order covered</T>
    </Svg>
  );
}

// 10 · SattoloReveal. The same loop on four cards, but each draw strictly below the current position (picks an
// illustration). Then where each card went: one arrow from its start to its end, and the arrows close one cycle
// through all four, none left in place. examples.py: cycle length 4 every run, 6 = 3! outcomes.
const SAT_SWAPS: [number, number][] = [[3, 0], [2, 1], [1, 0]];
// Each card takes the place of the next one round the ring: A where D was, D where B was, B where C was, C where A was.
const RING4 = ['A', 'D', 'B', 'C'];
export function SattoloReveal({ t }: StepCtx) {
  const start = ['A', 'B', 'C', 'D'];
  const states = runSwaps(start, SAT_SWAPS);
  const k = stepIdx(t, 0.3, 2.7, 3);
  const local = k < 0 ? 0 : seg(t, 0.3 + k * 0.8, 1.1 + k * 0.8);
  const pos = cardSlots(states, Math.max(k, 0), k < 0 ? 0 : seg(local, 0.35, 0.85));
  const sx = (p: number) => 110 + p * 100;
  const i = k < 0 ? -1 : SAT_SWAPS[k][0];
  const cyc = easeInOut(seg(t, 2.9, 3.8));
  const cap = easeOut(seg(t, 3.8, 4.3));
  return (
    <Svg label="The same loop on four cards, but each draw lands strictly below the current position. Then an arrow from where each card started to where it ended: the arrows close one cycle through all four, none left in place" h={290}>
      {['A', 'B', 'C', 'D'].map((c) => (
        <Card key={c} x={sx(pos[c].slot)} y={40 - pos[c].lift * 24} c={c} col={C.crema} w={50} h={56} />
      ))}
      {k >= 0 && t < 2.9 && (
        <g>
          <path d={`M${sx(0) - 4} 112 L${sx(0) - 4} 120 L${sx(i - 1) + 54} 120 L${sx(i - 1) + 54} 112`} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
          <T x={sx(0) - 4} y={142} s={12} f={C.cinnamon}>draw strictly below position {i + 1}</T>
        </g>
      )}
      {RING4.map((c, n) => {
        const a1 = -Math.PI / 2 + (n * Math.PI) / 2, a2 = a1 + Math.PI / 2, am = (a1 + a2) / 2;
        const p1 = { x: 300 + 64 * Math.cos(a1), y: 178 + 44 * Math.sin(a1) };
        const p2 = { x: 300 + 64 * Math.cos(a2), y: 178 + 44 * Math.sin(a2) };
        const cpx = 300 + 100 * Math.cos(am), cpy = 178 + 70 * Math.sin(am);
        const u = clamp(cyc * 4 - n, 0, 1);
        const sh = (q: { x: number; y: number }, to: { x: number; y: number }) => {
          const dx = to.x - q.x, dy = to.y - q.y, L = Math.hypot(dx, dy);
          return { x: q.x + (dx / L) * 16, y: q.y + (dy / L) * 16 };
        };
        const s1 = sh(p1, { x: cpx, y: cpy }), s2 = sh(p2, { x: cpx, y: cpy });
        return (
          <g key={c} opacity={cyc > 0 ? 1 : 0}>
            <T x={p1.x} y={p1.y + 5} s={15} f={C.caramel} a="middle">{c}</T>
            {u > 0 && <path d={`M${s1.x} ${s1.y} Q${cpx} ${cpy} ${s2.x} ${s2.y}`} fill="none" stroke={C.caramel} strokeWidth={1.6} strokeDasharray={`${u * 200} 200`} />}
            {u >= 1 && <circle cx={s2.x} cy={s2.y} r={3.5} fill={C.caramel} />}
          </g>
        );
      })}
      <T x={300} y={252} s={13} f={C.caramel} a="middle" o={cap}>one cycle of 4, nobody in place</T>
      <T x={300} y={276} s={12} f={C.latte} a="middle" o={cap}>6 = 3! possible outcomes</T>
    </Svg>
  );
}

// 11 · AccidentalBug. Fixed points per run for four items: a true shuffle spreads over 0, 1, 2 and 4 (its exact
// distribution, drawn as shape) with an average of one; the accidental strict draw piles every run at zero.
const FY4_FIXED = [9, 8, 6, 0, 1]; // permutations of 4 by fixed-point count (exact; shape only)
export function AccidentalBug({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  const b = easeOut(seg(t, 1.8, 2.8));
  const cap = easeOut(seg(t, 3.0, 3.6));
  const panel = (x0: number, vals: number[], col: string, g: number, title: string) => (
    <g>
      <T x={x0} y={40} s={12} f={col}>{title}</T>
      <line x1={x0} y1={210} x2={x0 + 220} y2={210} stroke={C.line} />
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={x0 + 8 + i * 42} y={210 - v * 140 * g} width={30} height={v * 140 * g} fill={col === C.cherryText ? C.cherry : C.caramel} stroke={col === C.cherryText ? C.cherryText : 'none'} />
          <T x={x0 + 23 + i * 42} y={230} s={12} f={C.latte} a="middle">{i}</T>
        </g>
      ))}
    </g>
  );
  return (
    <Svg label="Fixed points per run for four items. A true shuffle spreads across zero, one, two and four fixed points, about one on average. The accidental strict draw puts every run at zero" h={290}>
      {panel(30, FY4_FIXED.map((v) => v / 24), C.caramel, a, 'true shuffle')}
      {panel(320, [1, 0, 0, 0, 0], C.cherryText, b, 'strict draw by mistake')}
      <T x={30} y={262} s={12} f={C.caramel} o={cap}>about 1 in place, on average</T>
      <T x={320} y={262} s={12} f={C.cherryText} o={cap}>0 in place, every run</T>
      <T x={300} y={284} s={12} f={C.latte} a="middle" o={a}>items left in place</T>
    </Svg>
  );
}

// 12 · PredictTooLargeForMemory. Records in a disk far larger than a small memory box. After answering, each record
// takes a random key and the records sort by key into a new order (keys an illustration).
const KEYS = [0.71, 0.18, 0.93, 0.42, 0.05, 0.66, 0.29, 0.84];
export function PredictTooLargeForMemory({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const tag = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const sort = answered ? easeInOut(seg(s, 1.0, 2.2)) : 0;
  const a = easeOut(seg(t, 0.2, 0.8));
  const rank = KEYS.map((k) => KEYS.filter((o) => o < k).length);
  return (
    <Svg label="Eight records on a disk far larger than a small memory box. After answering, each record takes an independent random key, and the records sort by that key into a new order" h={290}>
      <rect x={30} y={30} width={360} height={240} rx={6} fill="none" stroke={C.mocha} opacity={a} />
      <T x={40} y={22} s={12} f={C.latte} o={a}>disk</T>
      <rect x={440} y={30} width={120} height={60} rx={6} fill="none" stroke={C.cinnamon} opacity={a} />
      <T x={450} y={22} s={12} f={C.cinnamon} o={a}>memory</T>
      {KEYS.map((k, i) => {
        const y = lerp(44 + i * 27, 44 + rank[i] * 27, sort);
        return (
          <g key={i} opacity={a}>
            <rect x={44} y={y} width={180} height={20} rx={2} fill={C.band} stroke={C.latte} />
            <T x={54} y={y + 15} s={12} f={C.latte}>record {String.fromCharCode(65 + i)}</T>
            <rect x={240} y={y} width={120 * k * tag} height={20} rx={2} fill={C.caramel} opacity={0.8} />
          </g>
        );
      })}
      <T x={440} y={130} s={12} f={C.caramel} o={tag}>a random key each,</T>
      <T x={440} y={150} s={12} f={C.caramel} o={tag}>then sort by it</T>
    </Svg>
  );
}

// 13 · ThreeMemoryOptions. Three lanes. Keyed sort: records take keys and settle in key order. Buckets: records
// scatter at random into three buckets, each then shuffled in memory. A buffer: a window of three slots slides along
// the stream (cinnamon: one pass, but not perfectly even).
export function ThreeMemoryOptions({ t }: StepCtx) {
  const l1 = easeInOut(seg(t, 0.3, 1.5));
  const l2 = easeInOut(seg(t, 1.7, 2.9));
  const l3 = seg(t, 3.1, 4.6);
  const recs = 9;
  const BK = [2, 0, 1, 1, 2, 0, 0, 2, 1]; // bucket of each record (illustration)
  const K1 = [5, 2, 8, 0, 6, 3, 7, 1, 4]; // key rank of each record (illustration)
  return (
    <Svg label="Three lanes. Keyed sort: records take random keys and settle in key order. Buckets: records scatter at random into three buckets, each small enough to shuffle in memory. A buffer: a window of three slots slides along the stream in one pass, without perfect evenness" h={300}>
      <T x={30} y={30} s={12} f={C.crema}>1 · key each record, sort</T>
      {Array.from({ length: recs }, (_, i) => (
        <rect key={i} x={lerp(40 + i * 30, 40 + K1[i] * 30, l1)} y={42} width={24} height={20} rx={2} fill={C.latte} opacity={0.4 + 0.06 * i} />
      ))}
      <T x={30} y={106} s={12} f={C.crema}>2 · random buckets, shuffle each</T>
      {Array.from({ length: recs }, (_, i) => {
        const slot = BK.slice(0, i).filter((b) => b === BK[i]).length;
        return <rect key={i} x={lerp(40 + i * 30, 40 + BK[i] * 110 + slot * 30, l2)} y={lerp(118, 132, l2)} width={24} height={20} rx={2} fill={C.latte} opacity={0.4 + 0.06 * i} />;
      })}
      {[0, 1, 2].map((b) => <rect key={b} x={34 + b * 110} y={126} width={100} height={32} rx={4} fill="none" stroke={C.crema} opacity={l2} />)}
      <T x={30} y={196} s={12} f={C.cinnamon}>3 · stream through a buffer</T>
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={40 + i * 32} y={210} width={24} height={20} rx={2} fill={C.latte} opacity={0.5} />)}
      <rect x={36 + Math.min(13, Math.floor(l3 * 14)) * 32} y={204} width={96} height={32} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={2} opacity={l3 > 0 ? 1 : 0} />
      <T x={30} y={270} s={12} f={C.cinnamon} o={easeOut(seg(t, 3.4, 3.9))}>one pass, a bounded window, not quite even</T>
    </Svg>
  );
}

// 14 · BufferedShuffleMeasured. examples.py's exact departure chances for six items through a buffer: rows are arrival
// order, columns departure slot, brightness the chance. Cells left of each row's edge are zero (red outline): an item
// cannot leave more than b − 1 slots early. The first item takes the first two slots 3/4 of the time (b = 2), the
// first three 0.704 (b = 3), against a uniform 0.167 everywhere.
const M2 = [
  [1 / 2, 1 / 4, 1 / 8, 1 / 16, 1 / 32, 1 / 32],
  [1 / 2, 1 / 4, 1 / 8, 1 / 16, 1 / 32, 1 / 32],
  [0, 1 / 2, 1 / 4, 1 / 8, 1 / 16, 1 / 16],
  [0, 0, 1 / 2, 1 / 4, 1 / 8, 1 / 8],
  [0, 0, 0, 1 / 2, 1 / 4, 1 / 4],
  [0, 0, 0, 0, 1 / 2, 1 / 2],
];
const M3 = [
  [1 / 3, 2 / 9, 4 / 27, 8 / 81, 8 / 81, 8 / 81],
  [1 / 3, 2 / 9, 4 / 27, 8 / 81, 8 / 81, 8 / 81],
  [1 / 3, 2 / 9, 4 / 27, 8 / 81, 8 / 81, 8 / 81],
  [0, 1 / 3, 2 / 9, 4 / 27, 4 / 27, 4 / 27],
  [0, 0, 1 / 3, 2 / 9, 2 / 9, 2 / 9],
  [0, 0, 0, 1 / 3, 1 / 3, 1 / 3],
];
export function BufferedShuffleMeasured({ t }: StepCtx) {
  const cell = 24;
  const grid = (x0: number, M: number[][], title: string, g: number) => (
    <g>
      <T x={x0} y={34} s={12} f={C.crema}>{title}</T>
      {M.map((row, r) =>
        row.map((v, c) => {
          const on = easeOut(clamp(g * 6 - r, 0, 1));
          return (
            <rect key={`${r}-${c}`} x={x0 + c * cell} y={46 + r * cell} width={cell - 3} height={cell - 3} rx={2}
              fill={v > 0 ? C.caramel : 'none'} fillOpacity={Math.min(1, v * 1.8) * on} stroke={v > 0 ? 'none' : C.cherryText} strokeOpacity={on} strokeWidth={1} />
          );
        }),
      )}
    </g>
  );
  const a = seg(t, 0.3, 1.8);
  const b = seg(t, 1.6, 3.1);
  const cap = easeOut(seg(t, 3.3, 3.9));
  return (
    <Svg label="Exact departure chances for six items through a buffer: rows are arrival order, columns are departure slot, brightness is the chance. Cells left of each row's edge are zero, outlined in red: an item cannot leave more than the buffer size minus one slots early, but its chances trail off to the right. The first item takes the first two slots three quarters of the time with a buffer of two, the first three 0.704 of the time with a buffer of three, against a uniform 0.167" h={300}>
      {grid(40, M2, 'buffer of 2', a)}
      {grid(330, M3, 'buffer of 3', b)}
      <T x={40} y={210} s={12} f={C.latte} o={a > 0 ? 1 : 0}>rows: arrival · columns: departure</T>
      <T x={40} y={240} s={12} f={C.caramel} o={cap}>item 1, first two slots: 3/4</T>
      <T x={330} y={240} s={12} f={C.caramel} o={cap}>first three: 0.704</T>
      <T x={40} y={266} s={12} f={C.cherryText} o={cap}>red: never that early</T>
      <T x={330} y={266} s={12} f={C.latte} o={cap}>uniform: 0.167 each</T>
    </Svg>
  );
}

// 15 · Recap. Four cards shuffled by Fisher–Yates once more, then the chain count written under them, n · (n − 1) · … · 1
// = n!, one chain per ordering; then a single pass, the next question.
export function Recap({ t }: StepCtx) {
  const states = runSwaps(['A', 'B', 'C', 'D'], FY_SWAPS);
  const k = stepIdx(t, 0.2, 1.8, 3);
  const pos = cardSlots(states, Math.max(k, 0), k < 0 ? 0 : seg(t, 0.2 + k * 0.53, 0.65 + k * 0.53));
  const eq = easeOut(seg(t, 2.0, 2.6));
  const next = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="Four cards shuffled by Fisher-Yates once more. Under them, the chain count: four times three times two times one, four factorial, one chain per ordering. Then a single arrow along a stream: the next question, a single pass" h={260}>
      {['A', 'B', 'C', 'D'].map((c) => (
        <Card key={c} x={120 + pos[c].slot * 70} y={30 - pos[c].lift * 16} c={c} col={C.caramel} w={50} h={50} />
      ))}
      <T x={300} y={120} s={15} f={C.crema} a="middle" o={eq}>4 · 3 · 2 · 1 = 4!</T>
      <T x={300} y={144} s={12} f={C.caramel} a="middle" o={eq}>one chain per ordering</T>
      <g opacity={next}>
        <line x1={60} y1={196} x2={520} y2={196} stroke={C.cinnamon} strokeWidth={1.6} />
        <path d="M520 196 l-10 -6 l0 12 Z" fill={C.cinnamon} />
        <T x={60} y={226} s={12} f={C.cinnamon}>next: what one pass can say</T>
      </g>
    </Svg>
  );
}
