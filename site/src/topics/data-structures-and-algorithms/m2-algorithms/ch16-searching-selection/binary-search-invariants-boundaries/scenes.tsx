import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq, Reticle } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, Chapter 16's own): crema = a candidate at rest; latte = secondary
// labels (an index, a predicate's name, a rank); taupe = the eliminated region; caramel = the
// thing to look at this beat (mid, the predicate lamp, the sorted half); cherry/cherryText = the
// bug or the bad outcome. The topic's own 12-element sorted array (examples.py): one run of three
// equal keys at value 3, and single values elsewhere.
const ARRAY = [1, 3, 3, 3, 5, 7, 7, 9, 11, 11, 13, 15];

function Cell({ x, y, v, w = 38, color = C.crema, highlight = false }: { x: number; y: number; v: number | string; w?: number; color?: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={3} fill="none" stroke={highlight ? C.caramel : color} strokeWidth={highlight ? 1.8 : 1.1} />
      <T x={x + w / 2} y={y + 18} s={13} f={highlight ? C.caramel : color} a="middle">{v}</T>
    </g>
  );
}

function Bracket({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <path d={`M${x1} ${y + 8}V${y}H${x2}V${y + 8}`} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={(x1 + x2) / 2} y={y - 8} s={12} f={C.caramel} a="middle">{label}</T>
    </g>
  );
}

// 1 · Opening: a million-key array, and what a sorted order buys — about twenty steps.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A row standing for a million sorted keys, with the question of how many steps it takes to find one" h={260}>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={30 + i * 39} y={60} width={34} height={26} rx={2} fill="none" stroke={C.crema} strokeWidth={1} opacity={0.75} />
      ))}
      <T x={300} y={54} s={12} f={C.latte} a="middle">1,000,000 keys, sorted</T>
      <T x={300} y={140} s={14} f={C.crema} a="middle" o={a}>how many steps to find one — or learn it isn't there?</T>
      <T x={300} y={200} s={20} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>?</T>
    </Svg>
  );
}

// 2 · PredictMillion: the worst-case iteration count for a million keys.
export function PredictMillion({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="1,000,000 keys with the formula ceiling of log base two of n plus one waiting to be revealed" h={240}>
      <T x={30} y={40} s={13} f={C.latte} o={a}>1,000,000 keys, present or absent</T>
      <Eq x={300} y={110} a="middle">⌈log₂(n + 1)⌉</Eq>
      {answer !== null && (
        <T x={300} y={180} s={16} f={C.caramel} a="middle">20 — every iteration halves the range</T>
      )}
    </Svg>
  );
}

// 3 · HalfOpenInvariant: [lo, hi) over the array, vs a closed range.
export function HalfOpenInvariant({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The twelve-element array bracketed as a half-open range lo to hi, the answer always inside it" h={280}>
      {ARRAY.map((v, i) => <Cell key={i} x={20 + i * 46} y={60} v={v} highlight={i >= 2 && i <= 8} />)}
      <Bracket x1={20} x2={20 + ARRAY.length * 46 - 8} y={48} label="[lo, hi)" />
      <T x={30} y={126} s={13} f={C.latte} o={a}>lo is always a candidate;</T>
      <T x={30} y={144} s={13} f={C.latte} o={a}>hi is always one past the last candidate</T>
      <T x={30} y={168} s={13} f={C.crema} o={a}>invariant, every iteration: the answer,</T>
      <T x={30} y={186} s={13} f={C.crema} o={a}>if it exists, lies in [lo, hi)</T>
      <T x={30} y={222} s={12} f={C.quiet} o={a}>a closed [lo, hi] version needs lo &gt; hi to stop —</T>
      <T x={30} y={244} s={12} f={C.quiet} o={a}>half-open needs only lo == hi</T>
    </Svg>
  );
}

// 4 · FourQuestions: lower_bound and upper_bound on the run of three 3s.
export function FourQuestions({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="lower_bound landing at the first of three equal keys, upper_bound landing just past the last of them" h={280}>
      {ARRAY.map((v, i) => <Cell key={i} x={20 + i * 46} y={70} v={v} highlight={v === 3} />)}
      <g opacity={a}>
        <Reticle x={20 + 1 * 46 + 19} y={83} w={44} h={34} t={t} at={0.4} />
        <T x={20 + 1 * 46 + 19} y={130} s={12} f={C.caramel} a="middle">lower_bound(3) = 1</T>
      </g>
      <g opacity={a}>
        <Reticle x={20 + 4 * 46 + 19} y={83} w={44} h={34} t={t} at={0.7} color={C.second} />
        <T x={20 + 4 * 46 + 19} y={160} s={12} f={C.second} a="middle">upper_bound(3) = 4</T>
      </g>
      <T x={30} y={200} s={13} f={C.latte} o={a}>count(3) = upper_bound − lower_bound = 3</T>
      <T x={30} y={226} s={13} f={C.latte} o={a}>first/last occurrence of 3: index 1 and index 3</T>
    </Svg>
  );
}

// 5 · PredictAbsent: where lower_bound and upper_bound land for an absent key.
export function PredictAbsent({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="The array with a gap between seven and nine, where the absent key six would be inserted" h={280}>
      {ARRAY.map((v, i) => <Cell key={i} x={20 + i * 46} y={70} v={v} highlight={i === 5 || i === 6} />)}
      <T x={30} y={140} s={13} f={C.latte} o={a}>key 6 is absent — between the two 7s' run and nothing else</T>
      {answer !== null && (
        <>
          <T x={30} y={180} s={14} f={C.crema}>lower_bound(6) = upper_bound(6) = 5 —</T>
          <T x={30} y={200} s={14} f={C.crema}>the same insertion point</T>
        </>
      )}
    </Svg>
  );
}

// 6 · TheBug: the naive midpoint line, and who shipped it.
export function TheBug({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="The line mid equals low plus high all divided by two, with a note that it shipped in Programming Pearls and in the JDK for nine years" h={320}>
      <Eq x={30} y={70} s={18}>mid = (low + high) / 2</Eq>
      <T x={30} y={108} s={13} f={C.latte} o={a}>Bentley, Programming Pearls —</T>
      <T x={30} y={126} s={13} f={C.latte} o={a}>and the JDK's own Arrays.binarySearch,</T>
      <T x={30} y={144} s={13} f={C.latte} o={a}>written by the engineer who later</T>
      <T x={30} y={162} s={13} f={C.latte} o={a}>found the bug in his own code</T>
      <T x={30} y={198} s={13} f={C.cherryText} o={a}>low + high overflows a fixed-width</T>
      <T x={30} y={216} s={13} f={C.cherryText} o={a}>signed int once it's large enough</T>
      <T x={30} y={240} s={13} f={C.cherryText} o={a}>the sum wraps negative — array lengths</T>
      <T x={30} y={258} s={13} f={C.cherryText} o={a}>around 2^30 (about a billion)</T>
    </Svg>
  );
}

// 7 · ReproducedOverflow: 70 + 90 on an 8-bit signed int, naive against safe.
export function ReproducedOverflow({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Seventy plus ninety on an eight-bit signed integer wrapping to minus ninety-six, the naive midpoint going negative, the safe midpoint staying correct at eighty" h={300}>
      <T x={30} y={30} s={13} f={C.latte}>low = 70, high = 90 — eight-bit signed range: −128 … 127</T>
      <Eq x={30} y={70}>70 + 90 = 160</Eq>
      <T x={260} y={70} s={13} f={C.cherryText} o={a}>&gt; 127 — overflows</T>
      <Eq x={30} y={110} f={C.cherryText}>wraps to −96</Eq>
      <Eq x={30} y={150} f={C.cherryText}>naive_mid = −96 / 2 = −48</Eq>
      <T x={300} y={150} s={13} f={C.cherryText} o={a}>negative — out of bounds</T>
      <Eq x={30} y={200} f={C.caramel}>safe_mid = 70 + (90 − 70) / 2 = 80</Eq>
      <T x={30} y={230} s={13} f={C.crema} o={a}>80 — correctly inside [70, 90]</T>
    </Svg>
  );
}

// 8 · ProvingItEnds: the range width shrinking, iteration by iteration.
export function ProvingItEnds({ t }: StepCtx) {
  const widths = [12, 6, 3, 1, 0];
  return (
    <Svg label="The range width shrinking from twelve down to zero over four iterations, then a jump to twenty iterations for a million keys" h={320}>
      {widths.map((w, i) => {
        const k = easeOut(seg(t, 0.15 + i * 0.22, 0.6 + i * 0.22));
        return (
          <g key={i} opacity={k}>
            <rect x={30 + i * 100} y={60} width={Math.max(2, w * 7)} height={24} fill={C.crema} opacity={0.5} />
            <T x={30 + i * 100} y={104} s={12} f={C.latte}>hi−lo = {w}</T>
          </g>
        );
      })}
      <T x={30} y={150} s={13} f={C.latte} o={easeOut(seg(t, 1.3, 1.9))}>strictly shrinking every iteration —</T>
      <T x={30} y={168} s={13} f={C.latte} o={easeOut(seg(t, 1.3, 1.9))}>never stuck, never negative</T>
      <T x={30} y={204} s={16} f={C.caramel} o={easeOut(seg(t, 1.6, 2.2))}>1,000,000 keys → at most 20 iterations,</T>
      <T x={30} y={226} s={16} f={C.caramel} o={easeOut(seg(t, 1.6, 2.2))}>⌈log₂(1,000,001)⌉</T>
    </Svg>
  );
}

// 9 · Recap: half-open, overflow-safe midpoint, the iteration bound.
export function Recap({ t }: StepCtx) {
  const panels = [
    { l1: '[lo, hi)', l2: 'half-open' },
    { l1: 'low+((high−low)/2)', l2: 'overflow-safe' },
    { l1: '⌈log₂(n+1)⌉', l2: 'iterations' },
  ];
  return (
    <Svg label="Three panels recapping the topic: the half-open convention, the overflow-safe midpoint, and the iteration bound" h={260}>
      {panels.map((p, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25))}>
          <circle cx={100 + i * 200} cy={90} r={34} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={100 + i * 200} y={95} s={11} f={C.crema} a="middle">{p.l1}</T>
          <T x={100 + i * 200} y={150} s={13} f={C.latte} a="middle">{p.l2}</T>
        </g>
      ))}
      <T x={300} y={230} s={13} f={C.latte} a="middle">binary search on the answer, next</T>
    </Svg>
  );
}
