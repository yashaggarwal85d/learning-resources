import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key/run at rest; latte = secondary labels; taupe =
// not-yet-touched regions; caramel = the thing to look at (the run being found, the merge
// happening, the power being computed); cinnamon (rare) = the alternative being compared (the
// old scheme against the new); cherry/cherryText = the bad outcome (the broken invariant, the
// crash, the losing galloping case).

function runBar(x: number, baseY: number, length: number, label: string, colour = C.crema, scale = 1.6) {
  const h = length * scale;
  return (
    <g key={`${x}-${label}`}>
      <rect x={x} y={baseY - h} width={34} height={h} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + 17} y={baseY + 16} s={11} a="middle" f={C.latte}>{label}</T>
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A stack of run-length bars with an exception mark over the topmost entries" h={280}>
      <g opacity={a}>
        {[120, 80, 45, 30].map((v, i) => runBar(80 + i * 100, 200, v, String(v), i === 0 ? C.cherry : C.crema, 1.1))}
      </g>
      <g opacity={b}>
        <T x={300} y={40} s={13} a="middle" f={C.cherryText}>an invariant breaks</T>
        <T x={300} y={236} s={12} a="middle" f={C.latte}>found by formal verification, 2015</T>
      </g>
    </Svg>
  );
}

// 2 · Predict: the invariant
export function PredictInvariant({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Run lengths 120, 80, 45 and 30 with a question mark over whether 120 is still longer than the next two combined" h={260}>
      <g opacity={a}>
        {[120, 80, 45, 30].map((v, i) => runBar(70 + i * 110, 200, v, String(v), C.taupe, 1.1))}
      </g>
      <T x={300} y={236} s={12} a="middle" f={C.caramel}>still 120 &gt; 80 + 45?</T>
    </Svg>
  );
}

// 3 · Run detection
export function RunDetection({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const vals = [3, 2, 1, 3, 4, 5, 0];
  return (
    <Svg label="Seven keys, a descending prefix reversed in place, then continuing into an ascending stretch" h={260}>
      <g opacity={a}>
        {vals.map((v, i) => runBar(50 + i * 60, 190, v, String(v), i < 3 ? C.caramel : C.taupe, 10))}
      </g>
      <g opacity={b}>
        <T x={300} y={240} s={12} a="middle" f={C.latte}>reversed, then extended</T>
      </g>
    </Svg>
  );
}

// 4 · Minrun
export function Minrun({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A short run topped up to minrun length by binary insertion sort" h={260}>
      <g opacity={a}>
        <rect x={60} y={160} width={80} height={24} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={100} y={145} s={11} a="middle" f={C.latte}>short run</T>
        <path d="M150 172 L220 172" stroke={C.latte} strokeWidth={1.3} fill="none" />
        <rect x={230} y={160} width={200} height={24} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={330} y={145} s={11} a="middle" f={C.latte}>topped up to minrun</T>
      </g>
      <g opacity={b}>
        <T x={300} y={220} s={12} a="middle" f={C.caramel}>binary insertion sort</T>
      </g>
    </Svg>
  );
}

// 5 · Minrun choice (N=2112)
export function MinrunChoice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="N=2112 split into 66 runs of 32, leaving an unbalanced tail, against 64 runs of 33 with none" h={260}>
      <g opacity={a}>
        <T x={160} y={70} s={12} a="middle" f={C.cherryText}>minrun 32: unbalanced tail</T>
        <T x={440} y={70} s={12} a="middle" f={C.caramel}>minrun 33: no tail</T>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={`a${i}`} x={60 + i * 25} y={120} width={18} height={60} fill="none" stroke={C.cherry} strokeWidth={1.2} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={`b${i}`} x={340 + i * 25} y={120} width={18} height={60} fill="none" stroke={C.crema} strokeWidth={1.2} />
        ))}
      </g>
      <T x={300} y={226} s={12} a="middle" f={C.latte}>N divmod minrun, exactly</T>
    </Svg>
  );
}

// 6 · Galloping
export function Galloping({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const steps = [0, 1, 3, 7];
  return (
    <Svg label="A galloping search jumping to positions 0, 1, 3 and 7 in a run, doubling the gap each time" h={260}>
      <g opacity={a}>
        {steps.map((s, i) => (
          <circle key={i} cx={80 + s * 40} cy={150} r={10} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        ))}
        <path d={`M80 150 L${80 + 7 * 40} 150`} stroke={C.latte} strokeWidth={1.2} strokeDasharray="3 3" fill="none" />
      </g>
      <T x={300} y={210} s={12} a="middle" f={C.caramel}>wins at i=6, MIN_GALLOP=7</T>
    </Svg>
  );
}

// 7 · Predict: broken leg
export function PredictBrokenLeg({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A short winning streak with galloping needing more comparisons than linear search" h={260}>
      <g opacity={a}>
        <T x={180} y={120} s={12} a="middle" f={C.latte}>linear: 3</T>
        <T x={420} y={120} s={12} a="middle" f={C.caramel}>gallop: 4?</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.cherryText}>can galloping lose?</T>
    </Svg>
  );
}

// 8 · Old invariant
export function OldInvariant({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A run stack where each entry is bigger than the next two combined, loosely Fibonacci" h={260}>
      <g opacity={a}>
        {[21, 13, 8, 5, 3].map((v, i) => runBar(70 + i * 95, 200, v, String(v), C.crema, 4))}
      </g>
      <T x={300} y={236} s={12} a="middle" f={C.latte}>bigger than the next two, combined</T>
    </Svg>
  );
}

// 9 · Bug scale
export function BugScale({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A stack check reaching only the top three entries while the break sits one level deeper, against a counterexample of 67 million elements" h={270}>
      <g opacity={a}>
        {[120, 80, 45, 30].map((v, i) => runBar(80 + i * 100, 200, v, String(v), i < 3 ? C.taupe : C.taupe, 1.1))}
        <rect x={168} y={70} width={210} height={22} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={273} y={64} s={11} a="middle" f={C.caramel}>checked: top three</T>
      </g>
      <g opacity={b}>
        <T x={300} y={240} s={12} a="middle" f={C.cherryText}>crash at 67,000,000+ elements</T>
      </g>
    </Svg>
  );
}

// 10 · Powersort
export function Powersort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A small merge tree with two run pairs labelled by the depth of the node joining them" h={270}>
      <g opacity={a}>
        <circle cx={300} cy={60} r={10} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <path d="M300 70 L220 130 M300 70 L380 130" stroke={C.taupe} strokeWidth={1.3} fill="none" />
        <circle cx={220} cy={140} r={10} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <circle cx={380} cy={140} r={10} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={220} y={166} s={11} a="middle" f={C.latte}>power 3</T>
        <T x={380} y={166} s={11} a="middle" f={C.latte}>power 1</T>
      </g>
      <T x={300} y={226} s={12} a="middle" f={C.caramel}>depth in the ideal merge tree</T>
    </Svg>
  );
}

// 11 · Pochmann
export function Pochmann({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const oldRuns = [40, 40, 40, 40, 40, 40, 40, 35];
  const newRuns = [40, 40, 40, 39, 39, 39, 39, 39];
  return (
    <Svg label="315 elements split eight ways: the old scheme leaving one short run of 35, the new scheme spreading the shortfall" h={270}>
      <g opacity={a}>
        {oldRuns.map((v, i) => runBar(40 + i * 32, 110, v, '', i === 7 ? C.cherry : C.taupe, 1.4))}
        {newRuns.map((v, i) => runBar(40 + i * 32, 220, v, '', C.crema, 1.4))}
      </g>
      <T x={300} y={70} s={11} a="middle" f={C.latte}>old: one run of 35</T>
      <T x={300} y={244} s={11} a="middle" f={C.caramel}>new: 39s and 40s</T>
    </Svg>
  );
}

// 12 · Driftsort
export function Driftsort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Two labelled sources, quicksort's average case and mergesort's worst case, combining into one bar named driftsort" h={260}>
      <g opacity={a}>
        <T x={170} y={110} s={12} a="middle" f={C.crema}>quicksort: fast average</T>
        <T x={430} y={110} s={12} a="middle" f={C.cinnamon}>mergesort: fast worst case</T>
        <path d="M170 130 L300 180 M430 130 L300 180" stroke={C.latte} strokeWidth={1.2} fill="none" />
        <rect x={220} y={185} width={160} height={28} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={300} y={203} s={12} a="middle" f={C.caramel}>driftsort</T>
      </g>
      <T x={300} y={236} s={11} a="middle" f={C.latte}>Rust's stable sort since 1.81</T>
    </Svg>
  );
}

// 13 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const rows = ['detect what exists', 'check the promise', 'two sorts, one counter'];
  return (
    <Svg label="Three short lessons listed in a column" h={240}>
      <g opacity={a}>
        {rows.map((r, i) => (
          <T key={r} x={300} y={90 + i * 40} s={13} a="middle" f={C.crema}>{r}</T>
        ))}
      </g>
    </Svg>
  );
}

// 14 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A key split into digits instead of being compared whole, pointing toward radix sort" h={250}>
      <g opacity={a}>
        <T x={300} y={100} s={13} a="middle" f={C.latte}>every sort so far: compare the whole key</T>
        <path d="M300 120 L300 150" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <T x={300} y={180} s={13} a="middle" f={C.caramel}>read it one digit at a time instead</T>
      </g>
    </Svg>
  );
}
