import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16's own): crema = a candidate at rest; latte = secondary labels (an index, a
// predicate's name, a rank); taupe = the eliminated region; caramel = the thing to look at this beat (mid, the boundary);
// cinnamon (rare) = the second search beside the first (upper_bound); cherryText = the bug or the bad outcome.
// Every printed number is examples.py's or a quoted source: the array [1, 3, 3, 3, 5, 7, 7, 9, 11, 11, 13, 15];
// lower_bound(3) = 1, upper_bound(3) = 4, count 3; first/last 11 at 8, 9; lower_bound(6) = upper_bound(6) = 5; 70 + 90 =
// 160 wraps to -96, naive mid -48, safe mid 80; the 8-bit range -128..127; widths 12, 6, 3, 1, 0 (lower_bound of 3); 20
// iterations at 1,000,000. Bloch's lines and "nine years or so" are quoted from SOURCES.md. Traces run here by the same
// loop examples.py uses.

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

const ARRAY = [1, 3, 3, 3, 5, 7, 7, 9, 11, 11, 13, 15];
const X = (i: number) => 30 + i * 42;

/** examples.py's lower_bound (strict = false) or upper_bound (strict = true): the [lo, hi) after every iteration. */
function trace(x: number, strict: boolean) {
  let lo = 0;
  let hi = ARRAY.length;
  const out: { lo: number; hi: number; mid: number }[] = [{ lo, hi, mid: -1 }];
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (strict ? ARRAY[mid] <= x : ARRAY[mid] < x) lo = mid + 1;
    else hi = mid;
    out.push({ lo, hi, mid });
  }
  return out;
}

/** The array row, with cells inside [lo, hi) bright and the rest faded; a dashed ghost at index 12, one past the end. */
function Row({ y, lo, hi, mark = -1, markColour = C.caramel }: { y: number; lo: number; hi: number; mark?: number; markColour?: string }) {
  return (
    <g>
      {ARRAY.map((v, i) => {
        const inside = i >= lo - 0.01 && i < hi - 0.01;
        const c = i === mark ? markColour : inside ? C.crema : C.taupe;
        return (
          <g key={i} opacity={inside || i === mark ? 1 : 0.45}>
            <rect x={X(i)} y={y} width={36} height={26} rx={3} fill={C.roast} stroke={c} strokeWidth={i === mark ? 1.8 : 1.2} />
            <T x={X(i) + 18} y={y + 18} s={12} a="middle" f={c}>{v}</T>
          </g>
        );
      })}
      <rect x={X(12)} y={y} width={36} height={26} rx={3} fill="none" stroke={C.latte} strokeDasharray="3 3" strokeWidth={1} />
    </g>
  );
}

function Pointer({ x, y, label, c, up = false }: { x: number; y: number; label: string; c: string; up?: boolean }) {
  return (
    <g>
      <path d={up ? `M${x - 5} ${y + 9} l5 -9 l5 9 z` : `M${x - 5} ${y - 9} l5 9 l5 -9 z`} fill={c} />
      <T x={x} y={up ? y + 24 : y - 13} s={12} a="middle" f={c}>{label}</T>
    </g>
  );
}

/** Plays a lower/upper_bound trace: lo and hi slide between iterations, mid flashes. */
function Search({ t, t0, per, x, strict, y, c }: { t: number; t0: number; per: number; x: number; strict: boolean; y: number; c: string }) {
  const tr = trace(x, strict);
  const k = clamp((t - t0) / per, 0, tr.length - 1);
  const i0 = Math.floor(k);
  const i1 = Math.min(i0 + 1, tr.length - 1);
  const f = easeInOut(clamp((k - i0 - 0.4) / 0.6, 0, 1));
  const lo = lerp(tr[i0].lo, tr[i1].lo, f);
  const hi = lerp(tr[i0].hi, tr[i1].hi, f);
  const mid = i1 > i0 && k - i0 < 0.7 ? tr[i1].mid : -1;
  const done = k >= tr.length - 1;
  return (
    <g>
      <Row y={y} lo={lo} hi={hi} mark={done ? tr[tr.length - 1].lo : mid} markColour={c} />
      <Pointer x={X(lo) + 4} y={y + 32} label="lo" c={c} up />
      <Pointer x={X(hi) + 32} y={y + 32} label="hi" c={C.latte} up />
      {mid >= 0 && <Pointer x={X(mid) + 18} y={y - 4} label="mid" c={c} />}
    </g>
  );
}

// 1 · Opening. A long sorted row; a bracket halves it, and halves again, twenty times, each halving dropping a dot,
// until it closes on one place.
export function Opening({ t }: StepCtx) {
  const k = clamp((t - 0.3) / 0.11, 0, 20);
  const n = Math.floor(k);
  let a = 30;
  let b = 570;
  for (let i = 0; i < n; i++) {
    const m = (a + b) / 2;
    if (i % 3 === 1) b = m;
    else a = m;
  }
  return (
    <Svg label="A million sorted keys drawn as a long row. A bracket halves the range again and again, twenty times, until it closes on a single place" h={240}>
      <T x={300} y={30} s={12} a="middle" f={C.latte}>1,000,000 keys, sorted</T>
      {Array.from({ length: 108 }, (_, i) => (
        <rect key={i} x={30 + i * 5} y={50} width={3.4} height={30 + (i * 0.3)} fill={C.crema} opacity={30 + i * 5 >= a - 3 && 30 + i * 5 <= b + 3 ? 0.85 : 0.15} />
      ))}
      <path d={`M${a} 128 L${a} 136 L${Math.max(b, a + 2)} 136 L${Math.max(b, a + 2)} 128`} fill="none" stroke={C.caramel} strokeWidth={1.6} />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={60 + i * 24} cy={170} r={5} fill={C.caramel} />
      ))}
      <T x={300} y={220} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.6, 3.0))}>each comparison halves what's left</T>
    </Svg>
  );
}

// 2 · Predict. The formula waits beside a million-wide bar with a pulsing bracket. After answering: the bar halves step
// by step into a staircase of 20 bars, each half the one above, ending at zero: 20.
export function PredictMillion({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const steps = answered ? clamp((s - 0.2) / 1.4, 0, 1) * 20 : 0;
  return (
    <Svg label="A million keys and the formula ceiling of log base two of n plus one. After answering, the range halves twenty times down to nothing: 20 comparisons" h={260}>
      <T x={30} y={26} s={12} f={C.latte}>1,000,000 keys, present or absent</T>
      <rect x={30} y={36} width={540} height={10} rx={2} fill={C.crema} opacity={0.8} />
      <Eq x={300} y={88} a="middle">⌈log₂(n + 1)⌉</Eq>
      {!answered && <path d={`M30 54 L30 60 L${30 + 270 + 120 * Math.sin(t * 2)} 60 L${30 + 270 + 120 * Math.sin(t * 2)} 54`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={pulse} />}
      {answered &&
        Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={30} y={110 + i * 6} width={Math.max(1.5, 540 / 2 ** (i + 1))} height={4} rx={1} fill={C.caramel} opacity={clamp(steps - i, 0, 1) * 0.9} />
        ))}
      {answered && <T x={300} y={170} s={16} a="middle" f={C.caramel} o={easeOut(seg(s, 1.5, 1.9))}>20 halvings</T>}
      {!answered && <T x={300} y={200} s={14} a="middle" f={C.caramel} o={pulse}>how many comparisons?</T>}
    </Svg>
  );
}

// 3 · The half-open invariant. lo at index 0, hi at 12, one past the end (a dashed ghost). The search for 3 runs:
// every iteration keeps the answer inside [lo, hi), the bright cells; the range closes to empty, lo == hi, at index 1.
export function HalfOpenInvariant({ t }: StepCtx) {
  return (
    <Svg label="The array with lo at index 0 and hi at 12, one past the last candidate. Searching for 3, every iteration keeps the answer inside the half-open range [lo, hi) until it is empty, lo equal to hi, at index 1" h={250}>
      <T x={30} y={24} s={12} f={C.caramel}>answer always in [lo, hi)</T>
      <Search t={t} t0={0.6} per={0.6} x={3} strict={false} y={80} c={C.caramel} />
      {ARRAY.map((_, i) => (
        <T key={i} x={X(i) + 18} y={52} s={12} a="middle" f={C.latte} o={0.6}>{i}</T>
      ))}
      <T x={X(12) + 18} y={52} s={12} a="middle" f={C.latte} o={0.6}>12</T>
      <T x={30} y={176} s={12} f={C.caramel} o={easeOut(seg(t, 3.1, 3.4))}>empty: lo == hi</T>
      <T x={30} y={208} s={12} f={C.latte} o={easeOut(seg(t, 3.3, 3.6))}>closed [lo, hi]: stop at lo &gt; hi instead</T>
    </Svg>
  );
}

// 4 · Four questions. lower_bound(3) runs and lands on index 1, the first 3; upper_bound(3), the same loop with one
// comparison flipped, lands on 4, one past the last; the bracket between them counts 3. Then 11: first 8, last 9.
export function FourQuestions({ t }: StepCtx) {
  const both = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="lower_bound of 3 lands on index 1, the first 3; upper_bound of 3, the same loop with one comparison flipped, lands on 4, one past the last; their difference counts the three 3s. For 11, first occurrence 8 and last 9" h={300}>
      <T x={570} y={22} s={12} a="end" f={C.caramel}>lower_bound(3): a[mid] &lt; x</T>
      <Search t={t} t0={0.3} per={0.42} x={3} strict={false} y={40} c={C.caramel} />
      <T x={570} y={130} s={12} a="end" f={C.cinnamon} o={easeOut(seg(t, 0.4, 0.8))}>upper_bound(3): a[mid] ≤ x</T>
      <Search t={t} t0={0.4} per={0.42} x={3} strict={true} y={148} c={C.cinnamon} />
      <g opacity={both}>
        <path d={`M${X(1)} 236 L${X(1)} 244 L${X(4)} 244 L${X(4)} 236`} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={X(1)} y={264} s={12} f={C.crema}>4 − 1 = 3 threes</T>
      </g>
      <T x={300} y={264} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>11: first 8, last 9</T>
    </Svg>
  );
}

// 5 · Predict. 6 is not in the array. Both searches set off; a question over where they land. After answering: both
// arrows stop on index 5, and a ghost 6 drops in just before the 7 there: where 6 would go.
export function PredictAbsent({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const land = answered ? easeOutBack(seg(s, 0.2, 0.8)) : 0;
  const wob = 2 * Math.sin(t * 3);
  return (
    <Svg label="6 is not in the array. After answering, lower_bound and upper_bound both return 5, the first position a larger value occupies: where 6 would go" h={260}>
      <T x={30} y={24} s={12} f={C.latte}>x = 6, absent</T>
      <Row y={70} lo={0} hi={12} mark={answered ? 5 : -1} />
      <Pointer x={answered ? lerp(X(6), X(5) + 18, clamp(land, 0, 1)) : X(6 + wob) + 18} y={64} label="lower" c={C.caramel} />
      <Pointer x={answered ? lerp(X(3), X(5) + 18, clamp(land, 0, 1)) : X(3 - wob) + 18} y={106} label="upper" c={C.cinnamon} up />
      {answered && (
        <g opacity={clamp(land, 0, 1)}>
          <rect x={X(5) - 4} y={lerp(140, 166, clamp(land, 0, 1))} width={30} height={22} rx={3} fill="none" stroke={C.caramel} strokeDasharray="3 3" />
          <T x={X(5) + 11} y={lerp(155, 181, clamp(land, 0, 1))} s={12} a="middle" f={C.caramel}>6</T>
        </g>
      )}
      {!answered && <T x={300} y={230} s={14} a="middle" f={C.caramel} o={pulse}>where does each one land?</T>}
      {answered && <T x={300} y={230} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 0.9, 1.3))}>both 5: where 6 would go</T>}
    </Svg>
  );
}

// 6 · The bug. Bloch's line, then where it shipped: Programming Pearls, then the JDK. A fixed-width gauge fills as low
// and high grow, the sum runs past the top and wraps to the negative end; the timeline: "nine years or so".
export function TheBug({ t }: StepCtx) {
  const fill = easeInOut(seg(t, 1.6, 2.8));
  const wrap = fill > 0.8;
  return (
    <Svg label="The line int mid = (low + high) / 2, shipped in Bentley's Programming Pearls and in the JDK's Arrays.binarySearch. A fixed-width integer fills as low plus high grows, runs past the maximum and wraps negative; the bug lay in wait for nine years or so" h={280}>
      <T x={30} y={34} s={13} f={C.cherryText}>int mid = (low + high) / 2;</T>
      {['Programming Pearls', 'JDK Arrays.binarySearch'].map((l, i) => {
        const a = easeOutBack(seg(t, 0.4 + i * 0.4, 0.8 + i * 0.4));
        return (
          <g key={l} opacity={clamp(a, 0, 1)}>
            <rect x={30 + i * 250} y={54} width={230} height={26} rx={13} fill="none" stroke={C.crema} strokeWidth={1.3} />
            <T x={145 + i * 250} y={72} s={12} a="middle" f={C.crema}>{l}</T>
          </g>
        );
      })}
      <T x={30} y={120} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>low + high, fixed width</T>
      <rect x={30} y={130} width={540} height={18} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} />
      <rect x={300} y={132} width={Math.min(fill / 0.8, 1) * 268} height={14} rx={2} fill={C.crema} opacity={0.8} />
      {wrap && <rect x={32} y={132} width={((fill - 0.8) / 0.2) * 120} height={14} rx={2} fill={C.cherryText} opacity={0.85} />}
      <T x={300} y={168} s={12} a="middle" f={C.latte}>0</T>
      <T x={566} y={168} s={12} a="end" f={C.latte}>max</T>
      <T x={30} y={168} s={12} f={C.cherryText} o={wrap ? 1 : 0}>negative</T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <path d="M30 220 L540 220" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="5 4" />
        <circle cx={30} cy={220} r={5} fill={C.crema} />
        <circle cx={540} cy={220} r={5} fill={C.cherryText} />
        <T x={30} y={250} s={12} f={C.crema}>shipped</T>
        <T x={540} y={250} s={12} a="end" f={C.cherryText}>"nine years or so"</T>
      </g>
    </Svg>
  );
}

// 7 · Reproduced on 8 bits. A number line from -128 to 127 with 70 and 90 marked. Their sum runs right to 160, past 127,
// and wraps round to -96; halved, -48, red, out of bounds. Then the safe line steps from 70 by half the gap: 80.
export function ReproducedOverflow({ t }: StepCtx) {
  const P = (v: number) => 300 + (v / 128) * 260;
  const run = easeInOut(seg(t, 0.6, 1.6));
  const wrapP = easeInOut(seg(t, 1.6, 2.3));
  const half = easeInOut(seg(t, 2.5, 3.0));
  const safe = easeInOut(seg(t, 3.4, 4.1));
  const sumX = run < 1 ? lerp(P(0), P(127), run) : lerp(P(-128), P(-96), wrapP);
  return (
    <Svg label="An 8-bit signed number line from -128 to 127 with 70 and 90 marked. Their sum, 160, runs past 127 and wraps to -96; halved it gives -48, a negative index. The safe line, low plus half of high minus low, gives 80" h={290}>
      <Eq x={30} y={34} s={18}>70 + 90 = 160</Eq>
      <path d={`M${P(-128)} 110 L${P(127)} 110`} stroke={C.latte} strokeWidth={1.4} />
      {[-128, 0, 127].map((v) => (
        <g key={v}>
          <path d={`M${P(v)} 104 L${P(v)} 116`} stroke={C.latte} strokeWidth={1.2} />
          <T x={P(v)} y={134} s={12} a="middle" f={C.latte}>{v}</T>
        </g>
      ))}
      {[70, 90].map((v) => (
        <g key={v}>
          <circle cx={P(v)} cy={110} r={5} fill={C.crema} />
          <T x={P(v)} y={94} s={12} a="middle" f={C.crema}>{v}</T>
        </g>
      ))}
      <path d={`M${P(0)} 74 L${sumX} 74`} stroke={run < 1 ? C.crema : C.cherryText} strokeWidth={2} opacity={run > 0 && wrapP === 0 ? 1 : 0} />
      {run >= 1 && <path d={`M${P(127)} 74 Q${P(127) + 20} 50 300 48 Q${P(-128) - 20} 50 ${P(-128)} 74 L${sumX} 74`} fill="none" stroke={C.cherryText} strokeWidth={1.6} />}
      <T x={P(-96)} y={160} s={12} a="middle" f={C.cherryText} o={wrapP >= 1 ? 1 : 0}>−96</T>
      <circle cx={lerp(P(-96), P(-48), half)} cy={110} r={6} fill={C.cherryText} opacity={half > 0 ? 1 : 0} />
      <T x={30} y={200} s={13} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))}>naive mid: −48, out of bounds</T>
      <circle cx={lerp(P(70), P(80), safe)} cy={110} r={6} fill={C.caramel} opacity={safe > 0 ? 1 : 0} />
      <T x={P(80)} y={160} s={12} a="middle" f={C.caramel} o={safe >= 1 ? 1 : 0}>80</T>
      <T x={30} y={240} s={13} f={C.caramel} o={easeOut(seg(t, 3.6, 4.0))}>safe: 70 + (90 − 70) / 2 = 80</T>
    </Svg>
  );
}

// 8 · Proving it ends. The search for 3, its range width after each iteration stacked as bars: 12, 6, 3, 1, 0, each
// strictly shorter; then the bound at a million keys, 20 iterations.
export function ProvingItEnds({ t }: StepCtx) {
  const W = [12, 6, 3, 1, 0];
  return (
    <Svg label="Searching for 3, the range width after each iteration: 12, 6, 3, 1, 0, every one strictly smaller, so the loop must end. At a million keys, at most 20 iterations" h={260}>
      <T x={30} y={24} s={12} f={C.latte}>hi − lo, each iteration</T>
      {W.map((w, i) => {
        const g = easeOut(seg(t, 0.3 + i * 0.5, 0.7 + i * 0.5));
        return (
          <g key={i} opacity={g}>
            <rect x={80} y={40 + i * 30} width={Math.max(2, w * 40) * g} height={18} rx={2} fill={w === 0 ? C.caramel : C.crema} opacity={0.8} />
            <T x={70} y={54 + i * 30} s={12} a="end" f={w === 0 ? C.caramel : C.crema}>{w}</T>
          </g>
        );
      })}
      <T x={30} y={214} s={12} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>strictly shrinking: it must end</T>
      <T x={30} y={244} s={12} f={C.caramel} o={easeOut(seg(t, 3.4, 3.8))}>1,000,000 keys: at most 20 iterations</T>
    </Svg>
  );
}

// 9 · Recap. Three habits as chips: [lo, hi), the safe midpoint, the iteration bound. Then a row of yes/no lamps that
// flips exactly once, and a bracket closing on the flip: the same loop, a different question.
export function Recap({ t }: StepCtx) {
  const CH = ['[lo, hi)', 'lo + (hi − lo) / 2', '⌈log₂(n + 1)⌉'];
  const LAMP = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1];
  const close = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="Three habits: the half-open range, the overflow-safe midpoint, the iteration bound. Then a row of yes-or-no tests that flips exactly once, and the same loop closing on the flip" h={240}>
      {CH.map((c, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.35, 0.6 + i * 0.35));
        return (
          <g key={c} opacity={clamp(a, 0, 1)}>
            <rect x={[30, 180, 400][i]} y={20} width={[130, 200, 170][i]} height={30} rx={15} fill="none" stroke={C.caramel} strokeWidth={1.3} />
            <T x={[95, 280, 485][i]} y={40} s={12} a="middle" f={C.caramel}>{c}</T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.6, 2.0))}>
        {LAMP.map((l, i) => (
          <circle key={i} cx={X(i) + 18} cy={120} r={10} fill={l ? C.caramel : 'none'} stroke={l ? C.caramel : C.latte} strokeWidth={1.3} />
        ))}
        <T x={30} y={92} s={12} f={C.latte}>a yes/no test that flips once</T>
      </g>
      <path d={`M${lerp(X(0), X(5), close)} 142 L${lerp(X(0), X(5), close)} 150 L${lerp(X(11) + 36, X(5) + 2, close)} 150 L${lerp(X(11) + 36, X(5) + 2, close)} 142`} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={easeOut(seg(t, 2.2, 2.4))} />
      <T x={300} y={200} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.3, 3.7))}>search on the answer, next</T>
    </Svg>
  );
}
