import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key at rest; latte = secondary labels (index, count, tag letter); taupe = keys
// not yet touched / the unsorted region; caramel = the thing to look at (the keys compared this beat, the wire lighting
// up); cinnamon (rare) = the alternative being compared; cherryText = the bad outcome (an unstable swap, a wasted
// comparison, an overhead).
// Every printed number is examples.py's or a quoted source line: the planning keys [5, 2, 4, 6, 1, 3] with 9 inversions,
// 12 comparisons and 9 moves; the 16-key deck's selection sort at 120 comparisons (n(n-1)/2); bubble 49 adjacent swaps
// against insertion 49 shifts (a swap is two writes, a shift one); the tagged keys (3,a) (1,b) (3,c) (2,d) (1,e) that
// selection sort leaves as ... (3,c) (3,a); libstdc++'s _S_threshold = 16; Rust's sort13_optimal (13), sort9_optimal (9),
// else 1; the network [(0,1), (2,3), (0,2), (1,3), (1,2)] checked on all 24 permutations and all 16 zero-one inputs;
// size 5 = ceil(lg 4!) and the optimal 8-input network's 19 against ceil(lg 8!) = 16.

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

const KEYS = [5, 2, 4, 6, 1, 3];
const KX = (slot: number) => 120 + slot * 66;
const BASE = 200;
const KH = (v: number) => 18 + v * 18;

/** A key as a bar standing on the baseline, its value under it. */
function Key({ x, y = BASE, v, c = C.crema, o = 1, label }: { x: number; y?: number; v: number; c?: string; o?: number; label?: string }) {
  return (
    <g opacity={o}>
      <rect x={x - 18} y={y - KH(v)} width={36} height={KH(v)} rx={3} fill={C.roast} stroke={c} strokeWidth={1.6} />
      <T x={x} y={y + 18} s={13} a="middle" f={c}>{label ?? String(v)}</T>
    </g>
  );
}

function Tick({ x, y, ok, o = 1 }: { x: number; y: number; ok: boolean; o?: number }) {
  return ok ? (
    <path d={`M${x - 5} ${y} l3 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2} strokeLinecap="round" opacity={o} />
  ) : (
    <path d={`M${x - 5} ${y - 5} l10 10 M${x + 5} ${y - 5} l-10 10`} fill="none" stroke={C.cherryText} strokeWidth={2.2} strokeLinecap="round" opacity={o} />
  );
}

// 1 · The slowest algorithm gets the last word. A library sort's range splits in half, then quarters, then eighths; each
// short piece is checked ("short?") and handed to insertion sort, lighting up.
export function Hook({ t }: StepCtx) {
  const levels = [1, 2, 4, 8];
  const W = 480;
  const X0 = 60;
  const handoff = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="A library sort's range splits into halves, quarters and eighths; every short piece is handed to insertion sort, the slowest algorithm, which lights up at the bottom" h={300}>
      {levels.map((n, l) => {
        const a = easeOut(seg(t, 0.2 + l * 0.5, 0.6 + l * 0.5));
        const w = W / n;
        return (
          <g key={n} opacity={a}>
            {Array.from({ length: n }, (_, i) => {
              const leaf = l === 3;
              return (
                <rect key={i} x={X0 + i * w + 3} y={40 + l * 44} width={w - 6} height={24} rx={3} fill={leaf && handoff > 0.5 ? C.cocoa : 'none'} stroke={leaf && handoff > 0.5 ? C.caramel : l === 0 ? C.crema : C.latte} strokeWidth={leaf && handoff > 0.5 ? 2 : 1.3} />
              );
            })}
          </g>
        );
      })}
      <T x={300} y={57} s={12} a="middle" f={C.crema} o={easeOut(seg(t, 0.2, 0.6))}>a fast library sort</T>
      <T x={300} y={226} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 1.9, 2.3))}>short? then…</T>
      <T x={300} y={250} s={14} a="middle" f={C.caramel} o={handoff}>insertion sort</T>
      <T x={300} y={284} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 3.3, 3.8))}>quadratic, and it gets the last word</T>
    </Svg>
  );
}

// 2 · Predict. Keys 5, 2, 4, 6, 1, 3 as bars. After answering: the 9 out-of-order pairs draw as red arcs one by one, then
// the counts: 12 comparisons, 9 on pairs that started backwards.
const INV: [number, number][] = [];
for (let i = 0; i < KEYS.length; i++) for (let j = i + 1; j < KEYS.length; j++) if (KEYS[i] > KEYS[j]) INV.push([i, j]);
export function InsertionPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const arcs = answered ? clamp((s - 0.2) / 0.12, 0, INV.length) : 0;
  const nums = answered ? easeOut(seg(s, 1.4, 1.8)) : 0;
  return (
    <Svg label="Keys 5, 2, 4, 6, 1, 3; after answering, the 9 pairs that start out of order draw as red arcs: insertion sort makes 12 comparisons, and 9 of them are on those backward pairs" h={300}>
      {KEYS.map((v, i) => (
        <Key key={i} x={KX(i)} v={v} o={easeOut(seg(t, 0.1 + i * 0.12, 0.4 + i * 0.12))} />
      ))}
      {INV.map(([i, j], k) => {
        const on = clamp(arcs - k, 0, 1);
        const xa = KX(i);
        const xb = KX(j);
        const h = 20 + (j - i) * 9;
        return on > 0 ? <path key={k} d={`M${xa} 230 Q${(xa + xb) / 2} ${230 + h} ${xb} 230`} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={on * 0.85} /> : null;
      })}
      {!answered && <T x={300} y={40} s={14} a="middle" f={C.caramel} o={pulse}>how many comparisons, how many wasted?</T>}
      {answered && <T x={300} y={40} s={13} a="middle" f={C.caramel} o={nums}>12 comparisons; 9 on backward pairs</T>}
    </Svg>
  );
}

// 3 · Insertion sort, the whole motion. The actual run on 5, 2, 4, 6, 1, 3: each round lifts the next key, slides the
// larger keys one slot right, and drops it into the gap. A mark per shift collects below; at the end, 9 moves = 9
// inversions.
type Round = { k: number; before: number[]; after: number[] };
const ROUNDS: Round[] = (() => {
  const out: Round[] = [];
  const a = [...KEYS];
  for (let i = 1; i < a.length; i++) {
    const before = [...a];
    const k = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > k) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = k;
    out.push({ k, before, after: [...a] });
  }
  return out;
})();
export function InsertionSort({ t }: StepCtx) {
  const R = 0.7;
  const T0 = 0.3;
  const r = clamp(Math.floor((t - T0) / R), 0, ROUNDS.length - 1);
  const p = clamp((t - T0 - r * R) / R, 0, 1);
  const round = ROUNDS[r];
  const done = t >= T0 + ROUNDS.length * R;
  const lift = easeOut(clamp(p / 0.25, 0, 1)) * (1 - easeInOut(clamp((p - 0.75) / 0.2, 0, 1)));
  const shift = easeInOut(clamp((p - 0.25) / 0.3, 0, 1));
  const slide = easeInOut(clamp((p - 0.5) / 0.25, 0, 1));
  const shiftsSoFar = ROUNDS.slice(0, r).reduce((n, rd) => n + rd.before.filter((v, i) => i < rd.before.indexOf(rd.k) && v > rd.k).length, 0);
  const shiftsNow = round.before.filter((v, i) => i < round.before.indexOf(round.k) && v > round.k).length;
  const marks = done ? 9 : shiftsSoFar + (shift >= 1 ? shiftsNow : 0);
  return (
    <Svg label="Insertion sort on 5, 2, 4, 6, 1, 3: each round lifts the next key, slides every larger key one slot right, and drops it into the gap; the 9 shifts equal the 9 inversions" h={300}>
      {KEYS.map((v) => {
        if (done) return <Key key={v} x={KX(ROUNDS[ROUNDS.length - 1].after.indexOf(v))} v={v} />;
        const from = round.before.indexOf(v);
        const to = round.after.indexOf(v);
        const isK = v === round.k;
        const x = isK ? lerp(KX(from), KX(to), slide) : lerp(KX(from), KX(to), shift);
        const y = isK ? BASE - 70 * lift : BASE;
        const sortedZone = from <= round.before.indexOf(round.k);
        return <Key key={v} x={x} y={y} v={v} c={isK ? C.caramel : sortedZone ? C.crema : C.taupe} />;
      })}
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={140 + i * 36} y={250} width={24} height={8} rx={2} fill={C.caramel} opacity={i < marks ? 0.9 : 0.12} />
      ))}
      <T x={130} y={258} s={12} a="end" f={C.latte}>moves</T>
      <T x={300} y={290} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 4.0, 4.4))}>9 moves = 9 inversions, exactly</T>
    </Svg>
  );
}

// 4 · Selection sort. The same six keys: each round a scan bar sweeps the whole unsorted part, the smallest key lights,
// and one swap brings it to the front. The scan length never shrinks with how sorted the input is: on the 16-key deck,
// 120 comparisons, n(n-1)/2.
const SEL: { before: number[]; min: number; i: number; after: number[] }[] = (() => {
  const out: { before: number[]; min: number; i: number; after: number[] }[] = [];
  const a = [...KEYS];
  for (let i = 0; i < a.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[m]) m = j;
    const before = [...a];
    [a[i], a[m]] = [a[m], a[i]];
    out.push({ before, min: m, i, after: [...a] });
  }
  return out;
})();
export function SelectionSort({ t }: StepCtx) {
  const R = 0.62;
  const T0 = 0.2;
  const r = clamp(Math.floor((t - T0) / R), 0, SEL.length - 1);
  const p = clamp((t - T0 - r * R) / R, 0, 1);
  const rd = SEL[r];
  const done = t >= T0 + SEL.length * R;
  const scan = clamp(p / 0.55, 0, 1);
  const swap = easeInOut(clamp((p - 0.6) / 0.35, 0, 1));
  const scanX = lerp(KX(rd.i) - 26, KX(KEYS.length - 1) + 26, scan);
  return (
    <Svg label="Selection sort on 5, 2, 4, 6, 1, 3: each round scans the whole unsorted part for the smallest key and swaps it to the front; on the 16-key deck it makes 120 comparisons, n(n-1)/2, however sorted the input" h={300}>
      {KEYS.map((v) => {
        if (done) return <Key key={v} x={KX(SEL[SEL.length - 1].after.indexOf(v))} v={v} />;
        const from = rd.before.indexOf(v);
        const to = rd.after.indexOf(v);
        const moving = from !== to;
        const x = lerp(KX(from), KX(to), swap);
        const y = BASE - (moving ? Math.sin(swap * Math.PI) * 40 * (from === rd.min ? 1 : -0.5) : 0);
        const isMin = from === rd.min && scan >= 1;
        return <Key key={v} x={x} y={y} v={v} c={isMin ? C.caramel : from < rd.i ? C.crema : C.taupe} />;
      })}
      {!done && (
        <g>
          <rect x={KX(rd.i) - 26} y={44} width={scanX - (KX(rd.i) - 26)} height={8} rx={2} fill={C.latte} opacity={0.6} />
          <line x1={scanX} y1={40} x2={scanX} y2={BASE} stroke={C.latte} strokeWidth={1.2} strokeDasharray="3 3" />
        </g>
      )}
      <T x={300} y={30} s={12} a="middle" f={C.latte} o={done ? 0 : 1}>scan the whole unsorted part</T>
      <g opacity={easeOut(seg(t, 3.5, 3.9))}>
        <T x={300} y={258} s={13} a="middle" f={C.caramel}>16-key deck: 120 comparisons</T>
        <T x={300} y={282} s={12} a="middle" f={C.latte}>= n(n−1)/2, sorted input or not</T>
      </g>
    </Svg>
  );
}

// 5 · Bubble sort, and an unstable swap. Writes on the 16-key deck: bubble's 49 adjacent swaps at two writes each against
// insertion's 49 one-write shifts. Then selection sort on (3,a) (1,b) (3,c) (2,d) (1,e): its second swap carries 3a past
// 3c, and the result ends 3c, 3a.
const TAGGED: [number, string][] = [
  [3, 'a'],
  [1, 'b'],
  [3, 'c'],
  [2, 'd'],
  [1, 'e'],
];
const TSTEPS: string[][] = (() => {
  const a = TAGGED.map(([k, g]) => `${k}${g}`);
  const out = [[...a]];
  for (let i = 0; i < a.length; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) if (Number(a[j][0]) < Number(a[m][0])) m = j;
    if (m !== i) {
      [a[i], a[m]] = [a[m], a[i]];
      out.push([...a]);
    }
  }
  return out;
})();
export function BubbleInstability({ t }: StepCtx) {
  const bars = easeOut(seg(t, 0.2, 1.2));
  const TX = (i: number) => 140 + i * 76;
  const st = clamp((t - 2.2) / 0.5, 0, TSTEPS.length - 1);
  const s0 = Math.floor(st);
  const f = easeInOut(st - s0);
  const A = TSTEPS[s0];
  const B = TSTEPS[Math.min(s0 + 1, TSTEPS.length - 1)];
  const flip = t > 3.4 ? easeOut(seg(t, 3.8, 4.2)) : 0;
  return (
    <Svg label="On the 16-key deck bubble sort makes 49 adjacent swaps at two writes each against insertion sort's 49 one-write shifts. Then selection sort on 3a, 1b, 3c, 2d, 1e carries 3a past 3c, ending with 3c ahead of 3a" h={320}>
      <T x={30} y={26} s={12} f={C.latte}>writes, 16-key deck</T>
      <T x={30} y={56} s={12} f={C.cherryText}>bubble</T>
      <rect x={130} y={44} width={392 * bars} height={14} rx={2} fill={C.cherryText} opacity={0.75} />
      <T x={130} y={78} s={12} f={C.latte} o={bars}>49 swaps × 2 writes</T>
      <T x={30} y={106} s={12} f={C.caramel}>insertion</T>
      <rect x={130} y={94} width={196 * bars} height={14} rx={2} fill={C.caramel} />
      <T x={130} y={128} s={12} f={C.latte} o={bars}>49 shifts × 1 write</T>
      <line x1={30} y1={150} x2={570} y2={150} stroke={C.mocha} opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={30} y={176} s={12} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>selection sort, equal keys tagged</T>
      {A.map((lab) => {
        const i0 = A.indexOf(lab);
        const i1 = B.indexOf(lab);
        const moving = i0 !== i1;
        const x = lerp(TX(i0), TX(i1), f);
        const y = 220 - (moving ? Math.sin(f * Math.PI) * 26 : 0);
        const three = lab[0] === '3';
        const bad = three && flip > 0.5;
        return (
          <g key={lab} opacity={easeOut(seg(t, 1.9, 2.3))}>
            <rect x={x - 24} y={y - 16} width={48} height={30} rx={4} fill={C.roast} stroke={bad ? C.cherryText : three ? C.caramel : C.crema} strokeWidth={1.6} />
            <T x={x} y={y + 4} s={13} a="middle" f={bad ? C.cherryText : three ? C.caramel : C.crema}>{lab}</T>
          </g>
        );
      })}
      <T x={300} y={290} s={13} a="middle" f={C.cherryText} o={flip}>3c now ahead of 3a: unstable</T>
    </Svg>
  );
}

// 6 · Stable, in place, or both. Two axes draw (stable / not, in place / extra memory); the four cells open; insertion
// and bubble drop into stable-and-in-place, selection into in-place-but-unstable; the two other cells stay open.
export function StableInPlaceTable({ t }: StepCtx) {
  const ax = easeOut(seg(t, 0.1, 0.6));
  const cells = easeOut(seg(t, 0.5, 1.0));
  const chips: { name: string; cell: [number, number]; dx: number; c: string; t0: number }[] = [
    { name: 'insertion', cell: [0, 0], dx: -36, c: C.caramel, t0: 1.2 },
    { name: 'bubble', cell: [0, 0], dx: 44, c: C.crema, t0: 1.7 },
    { name: 'selection', cell: [1, 0], dx: 0, c: C.cherryText, t0: 2.2 },
  ];
  const CX = (c: number) => 250 + c * 170;
  const CY = (r: number) => 100 + r * 90;
  return (
    <Svg label="A two-by-two grid of stable or not against in place or not: insertion and bubble sort are stable and in place, selection sort is in place but not stable; the other two combinations are separate properties to get" h={300}>
      <g opacity={ax}>
        <T x={CX(0)} y={40} s={12} a="middle" f={C.latte}>in place</T>
        <T x={CX(1)} y={40} s={12} a="middle" f={C.latte}>extra memory</T>
        <T x={150} y={CY(0) + 4} s={12} a="end" f={C.latte}>stable</T>
        <T x={150} y={CY(1) + 4} s={12} a="end" f={C.latte}>unstable</T>
      </g>
      {[0, 1].map((r) =>
        [0, 1].map((c) => (
          <rect key={`${r}${c}`} x={CX(c) - 80} y={CY(r) - 36} width={160} height={72} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={cells} />
        )),
      )}
      {chips.map((ch) => {
        const k = easeOutBack(seg(t, ch.t0, ch.t0 + 0.5));
        const tx = CX(ch.cell[1]) + ch.dx;
        const ty = CY(ch.cell[0]);
        return (
          <g key={ch.name} opacity={clamp(k, 0, 1)} transform={`translate(${lerp(tx, tx, k)} ${lerp(ty - 60, ty, clamp(k, 0, 1.1))})`}>
            <T x={0} y={4} s={12} a="middle" f={ch.c}>{ch.name}</T>
          </g>
        );
      })}
      <T x={300} y={278} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.2, 3.7))}>two separate properties</T>
    </Svg>
  );
}

// 7 · Predict. A range splits recursively down to tiny pieces. After answering: for one tiny piece, the recursion and
// call overhead (red) outweighs insertion sort's straight loop (white): below a small size, insertion wins.
export function CutoffPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const levels = [1, 2, 4, 8, 16];
  const bars = answered ? easeOut(seg(s, 0.3, 1.0)) : 0;
  return (
    <Svg label="A range splits into smaller and smaller pieces; after answering, for a tiny piece the cost of recursing and calling outweighs insertion sort's simple loop, so switching really saves something" h={300}>
      {levels.map((n, l) => {
        const a = easeOut(seg(t, 0.1 + l * 0.25, 0.4 + l * 0.25));
        const w = 480 / n;
        return (
          <g key={n} opacity={a}>
            {Array.from({ length: n }, (_, i) => (
              <rect key={i} x={60 + i * w + 2} y={30 + l * 30} width={w - 4} height={18} rx={2} fill={answered && l === 4 && i === 0 ? C.cocoa : 'none'} stroke={answered && l === 4 && i === 0 ? C.caramel : C.latte} strokeWidth={1.2} />
            ))}
          </g>
        );
      })}
      {answered && (
        <g>
          <T x={60} y={214} s={12} f={C.cherryText} o={bars}>recurse + call</T>
          <rect x={200} y={203} width={300 * bars} height={14} rx={2} fill={C.cherryText} opacity={0.8} />
          <T x={60} y={244} s={12} f={C.caramel} o={bars}>insertion loop</T>
          <rect x={200} y={233} width={110 * bars} height={14} rx={2} fill={C.caramel} />
        </g>
      )}
      {!answered && <T x={300} y={278} s={14} a="middle" f={C.caramel} o={pulse}>does switching really save anything?</T>}
      {answered && <T x={300} y={278} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.0, 1.4))}>yes: below a small size, it wins</T>}
    </Svg>
  );
}

// 8 · Three real libraries, one small cutoff. A range-length axis 0..20. libstdc++: _S_threshold = 16, insertion sort
// below. Rust: insertion below 9, sort9_optimal from 9, sort13_optimal from 13. Each row fills in at its own cutoffs.
export function SmallSortCutoff({ t }: StepCtx) {
  const X = (n: number) => 150 + n * 20;
  const axis = easeOut(seg(t, 0.1, 0.6));
  const lib = easeInOut(seg(t, 0.8, 1.8));
  const r1 = easeInOut(seg(t, 2.2, 2.9));
  const r2 = easeOut(seg(t, 2.9, 3.4));
  const r3 = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="Range length from 0 to 20: libstdc++ uses insertion sort below its threshold of 16; Rust uses insertion sort below 9, a fixed 9-element network from 9 and a 13-element network from 13" h={300}>
      <g opacity={axis}>
        <line x1={X(0)} y1={210} x2={X(20)} y2={210} stroke={C.mocha} strokeWidth={1.2} />
        {[0, 9, 13, 16, 20].map((n) => (
          <g key={n}>
            <line x1={X(n)} y1={206} x2={X(n)} y2={214} stroke={C.latte} />
            <T x={X(n)} y={232} s={12} a="middle" f={C.latte}>{n}</T>
          </g>
        ))}
        <T x={X(20)} y={252} s={12} a="end" f={C.latte}>range length</T>
      </g>
      <T x={30} y={84} s={12} f={C.crema} o={axis}>libstdc++</T>
      <rect x={X(0)} y={70} width={(X(16) - X(0)) * lib} height={22} rx={3} fill={C.caramel} />
      <T x={X(8)} y={60} s={12} a="middle" f={C.caramel} o={lib}>insertion</T>
      <rect x={X(16)} y={70} width={(X(20) - X(16)) * lib} height={22} rx={3} fill="none" stroke={C.latte} />
      <line x1={X(16)} y1={62} x2={X(16)} y2={204} stroke={C.caramel} strokeWidth={1.2} strokeDasharray="3 3" opacity={lib} />
      <T x={X(16) + 6} y={60} s={12} f={C.caramel} o={lib}>16</T>
      <T x={30} y={150} s={12} f={C.crema} o={axis}>Rust</T>
      <rect x={X(0)} y={136} width={(X(9) - X(0)) * r1} height={22} rx={3} fill={C.caramel} />
      <rect x={X(9)} y={136} width={(X(13) - X(9)) * r2} height={22} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
      <rect x={X(13)} y={136} width={(X(20) - X(13)) * r3} height={22} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
      <T x={X(4.5)} y={128} s={12} a="middle" f={C.caramel} o={r1}>insertion</T>
      <T x={X(11)} y={176} s={12} a="middle" f={C.cinnamon} o={r2}>net 9</T>
      <T x={X(16.5)} y={176} s={12} a="middle" f={C.cinnamon} o={r3}>net 13</T>
      <T x={300} y={284} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 4.1, 4.6))}>no recursion, no call, memory in order</T>
    </Svg>
  );
}

// 9 · A fixed sequence, no branch to mispredict. Four wires and the network (0,1), (2,3), (0,2), (1,3), (1,2), drawn
// column by column; the permutation 3, 1, 2, 0 flows through, swapping where a comparator finds a pair out of order. The
// first two comparators share a column: they could run side by side.
const NET: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [1, 2],
];
const NCOL = [0, 0, 1, 1, 2];
const IN4 = [3, 1, 2, 0];
const NSTATES: number[][] = (() => {
  const out = [[...IN4]];
  const a = [...IN4];
  for (const [i, j] of NET) {
    if (a[i] > a[j]) [a[i], a[j]] = [a[j], a[i]];
    out.push([...a]);
  }
  return out;
})();
export function SortingNetworkWires({ t }: StepCtx) {
  const WY = (w: number) => 60 + w * 46;
  const CXc = (c: number) => 200 + c * 110;
  const draw = (k: number) => easeOut(seg(t, 0.3 + NCOL[k] * 0.45, 0.6 + NCOL[k] * 0.45));
  const flow = clamp((t - 1.8) / 2.2, 0, 1) * 3;
  const col = Math.floor(flow);
  const colF = flow - col;
  const stateAfterCol = (c: number) => NSTATES[[0, 2, 4, 5][c]];
  return (
    <Svg label="Four wires and five compare-and-exchange operations fixed in advance; the keys 3, 1, 2, 0 flow left to right and come out 0, 1, 2, 3; the first two comparators share a column and could run side by side" h={300}>
      {[0, 1, 2, 3].map((w) => (
        <line key={w} x1={90} y1={WY(w)} x2={530} y2={WY(w)} stroke={C.mocha} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      ))}
      {NET.map(([i, j], k) => {
        const x = CXc(NCOL[k]) + (k === 3 ? 34 : 0);
        const lit = col === NCOL[k] && colF > 0.3 && colF < 0.9;
        return (
          <g key={k} opacity={draw(k)}>
            <line x1={x} y1={WY(i)} x2={x} y2={WY(j)} stroke={lit ? C.caramel : C.crema} strokeWidth={lit ? 2.4 : 1.6} />
            <circle cx={x} cy={WY(i)} r={4} fill={lit ? C.caramel : C.crema} />
            <circle cx={x} cy={WY(j)} r={4} fill={lit ? C.caramel : C.crema} />
          </g>
        );
      })}
      {[0, 1, 2, 3].map((w) => {
        const c = Math.min(col, 2);
        const from = c === 0 ? NSTATES[0] : stateAfterCol(c);
        const to = stateAfterCol(Math.min(c + 1, 3));
        const done = flow >= 3;
        const v = done ? NSTATES[5][w] : colF < 0.6 ? from[w] : to[w];
        const x = done ? 548 : lerp(c === 0 ? 70 : CXc(c - 1) + 50, CXc(c) + 50, easeInOut(colF));
        return (
          <g key={w} opacity={easeOut(seg(t, 1.6, 1.9))}>
            <circle cx={x} cy={WY(w)} r={12} fill={C.roast} stroke={done ? C.caramel : C.crema} strokeWidth={1.5} />
            <T x={x} y={WY(w) + 4} s={12} a="middle" f={done ? C.caramel : C.crema}>{String(v)}</T>
          </g>
        );
      })}
      <T x={CXc(0)} y={250} s={12} a="middle" f={C.caramel} o={easeOut(seg(t, 0.6, 1.0))}>side by side</T>
      <T x={300} y={282} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.8, 4.3))}>fixed in advance: no branch to guess</T>
    </Svg>
  );
}

// 10 · Checked against every input it can see. All 24 orderings of four distinct keys run through the network, each
// earning a tick; then all 16 zero-one patterns, each earning a tick. 24 of 24, 16 of 16.
function perms(a: number[]): number[][] {
  if (a.length <= 1) return [a];
  return a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}
const P24 = perms([0, 1, 2, 3]);
const Z16 = Array.from({ length: 16 }, (_, m) => [3, 2, 1, 0].map((b) => (m >> b) & 1));
export function NetworkChecked({ t }: StepCtx) {
  const p = clamp((t - 0.2) / 2.0, 0, 1) * 24;
  const z = clamp((t - 2.5) / 1.4, 0, 1) * 16;
  return (
    <Svg label="All 24 orderings of four distinct keys run through the network and each comes out sorted; then all 16 patterns of zeros and ones, each sorted too" h={320}>
      <T x={30} y={22} s={12} f={C.latte}>all 24 orderings</T>
      {P24.map((q, i) => {
        const on = clamp(p - i, 0, 1);
        const x = 40 + (i % 6) * 90;
        const y = 50 + Math.floor(i / 6) * 26;
        return (
          <g key={i} opacity={0.35 + 0.65 * on}>
            <T x={x} y={y} s={12} f={C.crema}>{q.join('')}</T>
            <Tick x={x + 52} y={y - 4} ok o={on} />
          </g>
        );
      })}
      <T x={30} y={176} s={12} f={C.latte} o={easeOut(seg(t, 2.3, 2.6))}>all 16 zero-one patterns</T>
      {Z16.map((q, i) => {
        const on = clamp(z - i, 0, 1);
        const x = 40 + (i % 8) * 68;
        const y = 204 + Math.floor(i / 8) * 26;
        return (
          <g key={i} opacity={easeOut(seg(t, 2.3, 2.6)) * (0.35 + 0.65 * on)}>
            <T x={x} y={y} s={12} f={C.crema}>{q.join('')}</T>
            <Tick x={x + 50} y={y - 4} ok o={on} />
          </g>
        );
      })}
      <T x={300} y={300} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 4.0, 4.4))}>24 of 24, 16 of 16: sorted</T>
    </Svg>
  );
}

// 11 · The bound, briefly. Four inputs: the network's 5 comparators line up against the floor ceil(lg 4!) = 5 and meet it
// exactly. Eight inputs: the optimal network's 19 against ceil(lg 8!) = 16, three past the floor.
export function BoundBriefly({ t }: StepCtx) {
  const U = 22;
  const X0 = 140;
  const n4 = clamp((t - 0.3) / 0.8, 0, 1) * 5;
  const f4 = easeInOut(seg(t, 1.2, 1.7));
  const meet = easeOut(seg(t, 1.8, 2.2));
  const n8 = clamp((t - 2.4) / 1.0, 0, 1) * 19;
  const f8 = easeInOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="Four inputs: the network's 5 comparators meet the floor of ceil(lg 4!) = 5 exactly. Eight inputs: the optimal network's 19 comparators against a floor of 16" h={300}>
      <T x={30} y={74} s={13} f={C.crema}>4 inputs</T>
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={X0 + i * U} y={60} width={U - 4} height={20} rx={2} fill={C.crema} opacity={clamp(n4 - i, 0, 1)} />
      ))}
      <line x1={X0 + 5 * U - 2} y1={lerp(70, 46, f4)} x2={X0 + 5 * U - 2} y2={lerp(70, 94, f4)} stroke={C.caramel} strokeWidth={2} opacity={f4} />
      <T x={X0 + 5 * U + 8} y={74} s={12} f={C.caramel} o={meet}>5 = ⌈lg 4!⌉: met exactly</T>
      <T x={30} y={174} s={13} f={C.crema} o={easeOut(seg(t, 2.3, 2.6))}>8 inputs</T>
      {Array.from({ length: 19 }, (_, i) => (
        <rect key={i} x={X0 + i * 20} y={160} width={16} height={20} rx={2} fill={i >= 16 && f8 > 0.5 ? C.cherryText : C.crema} opacity={clamp(n8 - i, 0, 1)} />
      ))}
      <line x1={X0 + 16 * 20 - 2} y1={lerp(170, 146, f8)} x2={X0 + 16 * 20 - 2} y2={lerp(170, 194, f8)} stroke={C.caramel} strokeWidth={2} opacity={f8} />
      <T x={X0 + 16 * 20 - 2} y={214} s={12} a="middle" f={C.caramel} o={f8}>⌈lg 8!⌉ = 16</T>
      <T x={X0 + 19 * 20 + 6} y={176} s={12} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>19</T>
      <T x={300} y={268} s={13} a="middle" f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>oblivious, still a comparison sort</T>
    </Svg>
  );
}

// 12 · Recap. Four small sorts as icons (lift and shift, scan for the smallest, swap neighbours, a fixed network) settle
// onto one shared floor line; a recursive split's tiny leaves light up as insertion sort; then a split-and-merge glyph:
// merge sort, next.
export function Recap({ t }: StepCtx) {
  const NAMES = ['insertion', 'selection', 'bubble', 'network'];
  const floor = easeOut(seg(t, 1.5, 2.0));
  const leaves = easeOut(seg(t, 2.4, 2.9));
  const next = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="Insertion, selection, bubble sort and a fixed network all settle onto one shared floor; a recursive sort's tiny leaves still hand off to insertion sort; merge sort, next" h={300}>
      {NAMES.map((n, i) => {
        const k = easeOutBack(seg(t, 0.2 + i * 0.3, 0.7 + i * 0.3));
        const x = 90 + i * 140;
        return (
          <g key={n} opacity={clamp(k, 0, 1)} transform={`translate(0 ${lerp(-30, 0, clamp(k, 0, 1))})`}>
            <rect x={x - 54} y={50} width={108} height={30} rx={4} fill="none" stroke={i === 0 ? C.caramel : C.crema} strokeWidth={i === 0 ? 2 : 1.3} />
            <T x={x} y={70} s={12} a="middle" f={i === 0 ? C.caramel : C.crema}>{n}</T>
          </g>
        );
      })}
      <line x1={30} y1={104} x2={lerp(30, 570, floor)} y2={104} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="6 4" />
      <T x={300} y={126} s={12} a="middle" f={C.latte} o={floor}>one shared floor</T>
      <g opacity={leaves}>
        <rect x={150} y={150} width={300} height={16} rx={2} fill="none" stroke={C.latte} />
        {[0, 1].map((i) => <rect key={i} x={150 + i * 152} y={176} width={148} height={14} rx={2} fill="none" stroke={C.latte} />)}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={150 + i * 76} y={200} width={72} height={12} rx={2} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.4} />)}
        <T x={300} y={232} s={12} a="middle" f={C.caramel}>tiny leaves: insertion sort</T>
      </g>
      <T x={300} y={278} s={13} a="middle" f={C.crema} o={next}>how close does recursion get? merge sort, next</T>
    </Svg>
  );
}
