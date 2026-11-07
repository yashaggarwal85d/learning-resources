import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key/run at rest; latte = secondary labels; taupe = not-yet-touched regions;
// caramel = the thing to look at (the run being found, the merge happening, the power being computed); cinnamon (rare)
// = the alternative being compared (the old scheme against the new); cherryText = the bad outcome (the broken
// invariant, the crash, the losing galloping case).
// Every printed number is examples.py's or a quoted source: [3, 2, 1, 3, 4, 5, 0] -> a descending run of 3 reversed
// to 1, 2, 3 and extended by 3, 4, 5; N = 2,112 -> minrun 33, 64 runs, no remainder; galloping against linear search
// for i = 0..11 (crossover i = 6, MIN_GALLOP = 7, i = 2: linear 3, gallop 4); the stack 120, 80, 25, 20, 30 -> 120, 80,
// 45, 30, "120 ≤ 80 + 45"; "67+ million elements"; node powers 1, 3, 1; 315 elements: old 40 x 7 + 35, new "39 39 40 39
// 39 40 39 40"; driftsort's max(n / 2, min(n, 8MB)): 1,000 -> 1,000 and 10,000,000 -> 5,000,000. The deck's runs are
// found here by examples.py's own count_run rule. Quotes are from SOURCES.md.

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

const DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13];

/** examples.py's count_run: a non-decreasing stretch, or a strictly decreasing one. Returns [start, end, descending]. */
function runsOf(a: number[]): [number, number, boolean][] {
  const out: [number, number, boolean][] = [];
  let s = 0;
  while (s < a.length) {
    let e = s;
    const desc = s + 1 < a.length && a[s + 1] < a[s];
    while (e + 1 < a.length && (desc ? a[e + 1] < a[e] : a[e + 1] >= a[e])) e++;
    out.push([s, e, desc]);
    s = e + 1;
  }
  return out;
}

function Cell({ x, y, v, c = C.crema, o = 1, w = 30, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 18} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

function Bracket({ x0, x1, y, c, o = 1 }: { x0: number; x1: number; y: number; c: string; o?: number }) {
  return <path d={`M${x0} ${y - 6} L${x0} ${y} L${x1} ${y} L${x1} ${y - 6}`} fill="none" stroke={c} strokeWidth={1.4} opacity={o} />;
}

/** A pending-run stack, bottom first, drawn as horizontal bars. */
function Stack({ runs, y0, o = 1, colour }: { runs: number[]; y0: number; o?: number; colour?: (i: number) => string }) {
  return (
    <g opacity={o}>
      {runs.map((r, i) => (
        <g key={i}>
          <rect x={130} y={y0 + i * 26} width={r * 2.4} height={16} rx={2} fill={colour ? colour(i) : C.crema} opacity={0.8} />
          <T x={120} y={y0 + i * 26 + 13} s={12} a="end" f={colour ? colour(i) : C.crema}>{r}</T>
        </g>
      ))}
    </g>
  );
}

// 1 · Opening. The deck; a scan sweeps it and every stretch already in order lights up under a bracket: real data
// arrives with runs. Then a crack: two libraries, one bug.
export function Opening({ t }: StepCtx) {
  const X = (i: number) => 30 + i * 34;
  const RUNS = runsOf(DECK);
  const scan = clamp((t - 0.3) / 1.8, 0, 1) * 16;
  return (
    <Svg label="The deck; a scan sweeps it and every stretch already in order lights up under a bracket. Then a crack: two real libraries had to repair the same bug in the sort built on this idea" h={240}>
      {DECK.map((v, i) => {
        const inLong = RUNS.some(([a, b]) => b > a && i >= a && i <= b && scan > b);
        return <Cell key={i} x={X(i)} y={60} v={v} w={28} c={inLong ? C.caramel : i < scan ? C.crema : C.latte} />;
      })}
      <path d={`M${X(Math.min(scan, 15.5)) + 14} 50 l-6 -10 l12 0 z`} fill={C.caramel} opacity={scan < 16 ? 1 : 0} />
      {RUNS.map(([a, b]) => (
        <Bracket key={a} x0={X(a)} x1={X(b) + 28} y={100} c={C.caramel} o={scan > b ? 1 : 0} />
      ))}
      <T x={300} y={140} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>already in order: use it</T>
      <g opacity={easeOut(seg(t, 2.8, 3.2))}>
        <path d="M262 176 l12 14 l-8 4 l14 16" fill="none" stroke={C.cherryText} strokeWidth={2} />
        <T x={300} y={200} s={12} f={C.cherryText}>two libraries, one bug</T>
      </g>
    </Svg>
  );
}

// 2 · Predict. The stack 120, 80, 25, 20, 30. The 25 and 20 merge into 45; a bracket checks the top three, 80, 45 and
// 30, and passes. A question over 120. After answering: 80 + 45 laid end to end overtakes 120: broken.
export function PredictInvariant({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const m = easeInOut(seg(t, 0.4, 1.2));
  const runs = m < 1 ? [120, 80, 25, 20, 30] : [120, 80, 45, 30];
  const chk = easeOut(seg(t, 1.3, 1.7));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const sum = answered ? easeInOut(seg(s, 0.2, 1.1)) : 0;
  return (
    <Svg label="The run stack 120, 80, 25, 20, 30; 25 and 20 merge into 45 and the check on the top three, 80, 45, 30, passes. After answering, 80 plus 45 laid end to end is longer than 120: the rule is broken at the bottom" h={290}>
      <T x={30} y={16} s={12} f={C.latte}>pending runs, bottom first</T>
      {m < 1 ? (
        <g>
          <Stack runs={[120, 80]} y0={40} />
          <rect x={130} y={92} width={25 * 2.4 + 20 * 2.4 * m} height={16} rx={2} fill={C.caramel} opacity={0.85} />
          <rect x={lerp(130, 130 + 60, m)} y={lerp(118, 98, m)} width={20 * 2.4} height={16} rx={2} fill={C.caramel} opacity={0.85 * (1 - m * 0.5)} />
          <T x={120} y={105} s={12} a="end" f={C.caramel}>25</T>
          <T x={120} y={131} s={12} a="end" f={C.caramel} o={1 - m}>20</T>
          <rect x={130} y={lerp(144, 118, m)} width={30 * 2.4} height={16} rx={2} fill={C.crema} opacity={0.8} />
          <T x={120} y={lerp(157, 131, m)} s={12} a="end" f={C.crema}>30</T>
        </g>
      ) : (
        <Stack runs={runs} y0={40} colour={(i) => (i === 0 ? (answered ? C.cherryText : C.crema) : i === 2 ? C.caramel : C.crema)} />
      )}
      <g opacity={chk}>
        <path d="M100 62 L94 62 L94 140 L100 140" fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={20} y={104} s={12} f={C.caramel}>top 3 ✓</T>
      </g>
      {!answered && <T x={430} y={53} s={16} f={C.caramel} o={pulse * chk}>?</T>}
      {answered && (
        <g>
          <rect x={130} y={lerp(66, 28, sum)} width={80 * 2.4} height={8} rx={2} fill={C.crema} opacity={0.9 * sum} />
          <rect x={130 + 80 * 2.4 * sum} y={lerp(92, 28, sum)} width={45 * 2.4} height={8} rx={2} fill={C.caramel} opacity={0.9 * sum} />
        </g>
      )}
      {!answered && <T x={300} y={250} s={14} a="middle" f={C.caramel} o={pulse}>does the rule still hold for 120?</T>}
      {answered && <T x={300} y={250} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.1, 1.5))}>120 ≤ 80 + 45: broken below the check</T>}
    </Svg>
  );
}

// 3 · Run detection. CPython's example [3, 2, 1, 3, 4, 5, 0]: the scan finds 3 > 2 > 1, strictly descending; the three
// reverse in place (3 and 1 swap) to 1, 2, 3; the run keeps going through 3, 4, 5 and stops at 0.
export function RunDetection({ t }: StepCtx) {
  const A = [3, 2, 1, 3, 4, 5, 0];
  const X = (i: number) => 90 + i * 62;
  const scan1 = clamp((t - 0.3) / 0.8, 0, 1) * 2;
  const rev = easeInOut(seg(t, 1.3, 2.0));
  const ext = clamp((t - 2.2) / 1.0, 0, 1) * 3;
  const slot = (i: number) => (i === 0 ? lerp(0, 2, rev) : i === 2 ? lerp(2, 0, rev) : i);
  const lift = (i: number) => (i === 0 || i === 2 ? Math.sin(rev * Math.PI) * (i === 0 ? -24 : 24) : 0);
  return (
    <Svg label="CPython's example [3, 2, 1, 3, 4, 5, 0]: the scan finds 3, 2, 1 strictly descending; the three reverse in place to 1, 2, 3, and the run extends through 3, 4, 5, stopping at 0" h={250}>
      {A.map((v, i) => {
        const inDesc = i <= 2 && i <= scan1 + 0.01;
        const inExt = i >= 3 && i <= 5 && i - 3 < ext;
        const c = i === 6 && ext >= 3 ? C.cherryText : inExt || (inDesc && rev >= 1) ? C.caramel : inDesc ? C.cinnamon : C.latte;
        return <Cell key={i} x={X(slot(i))} y={70 + lift(i)} v={v} w={40} c={c} />;
      })}
      <Bracket x0={X(0)} x1={X(2) + 40} y={116} c={C.cinnamon} o={easeOut(seg(t, 1.0, 1.2)) * (1 - easeOut(seg(t, 2.2, 2.5)))} />
      <T x={X(0)} y={140} s={12} f={C.cinnamon} o={easeOut(seg(t, 1.0, 1.2)) * (1 - easeOut(seg(t, 2.0, 2.2)))}>descending: reverse</T>
      <Bracket x0={X(0)} x1={X(2 + ext) + 40 * clamp(ext, 0, 1)} y={116} c={C.caramel} o={rev >= 1 ? 1 : 0} />
      <T x={X(0)} y={176} s={12} f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>1, 2, 3, extended by 3, 4, 5</T>
      <T x={X(6) + 20} y={140} s={12} a="middle" f={C.cherryText} o={easeOut(seg(t, 3.2, 3.6))}>stop</T>
    </Svg>
  );
}

// 4 · Minrun. A short run, the deck's first two keys reversed to 3, 7; a dashed box marks minrun. The next keys come
// in one at a time: a probe halves the run to find the slot, the key drops in, the run grows to fill the box. Then
// on random data: every run close to minrun.
export function Minrun({ t }: StepCtx) {
  const IN = [9, 3, 1, 12, 5, 6];
  const X = (i: number) => 60 + i * 52;
  const per = 0.42;
  const k = clamp((t - 0.6) / per, 0, IN.length);
  const done = Math.floor(k);
  const fr = k - done;
  // State after `done` insertions, starting from the run [3, 7].
  const run = [3, 7];
  for (let j = 0; j < done; j++) {
    const key = IN[j];
    let lo = 0;
    let hi = run.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (key <= run[mid]) hi = mid;
      else lo = mid + 1;
    }
    run.splice(lo, 0, key);
  }
  const next = done < IN.length ? IN[done] : null;
  let at = run.length;
  const probes: number[] = [];
  if (next !== null) {
    let lo = 0;
    let hi = run.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      probes.push(mid);
      if (next <= run[mid]) hi = mid;
      else lo = mid + 1;
    }
    at = lo;
  }
  const probe = probes.length ? probes[Math.min(probes.length - 1, Math.floor(clamp(fr / 0.6, 0, 0.999) * probes.length))] : -1;
  const drop = easeInOut(clamp((fr - 0.6) / 0.4, 0, 1));
  return (
    <Svg label="A short run, 3 and 7, and a dashed box marking minrun. The next keys 9, 3, 1, 12, 5, 6 come in one at a time; a probe halves the run to find each key's slot and the key drops in, until the run fills the box. On random data every run ends up close to minrun long" h={280}>
      <rect x={X(0) - 6} y={64} width={X(7) + 46 - X(0)} height={40} rx={4} fill="none" stroke={C.latte} strokeDasharray="5 4" strokeWidth={1.2} />
      <T x={X(0) - 6} y={56} s={12} f={C.latte}>minrun</T>
      {run.map((v, i) => (
        <Cell key={`${i}-${v}`} x={X(i >= at && next !== null ? i + drop : i)} y={71} v={v} w={40} c={C.caramel} />
      ))}
      {next !== null && <Cell x={lerp(X(run.length + 0.6), X(at), drop)} y={lerp(140, 71, drop)} v={next} w={40} c={C.crema} />}
      {probe >= 0 && drop === 0 && <path d={`M${X(probe) + 20} 122 l-6 10 l12 0 z`} fill={C.cinnamon} />}
      <T x={X(0)} y={190} s={12} f={C.cinnamon} o={easeOut(seg(t, 0.8, 1.2))}>binary search for the slot, stable</T>
      <g opacity={easeOut(seg(t, 3.3, 3.7))}>
        <T x={X(0)} y={230} s={12} f={C.latte}>random data:</T>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={190 + i * 60} y={220} width={52} height={12} rx={2} fill={C.crema} opacity={0.8} />
        ))}
        <T x={190} y={258} s={12} f={C.crema}>every run close to minrun</T>
      </g>
    </Svg>
  );
}

// 5 · Choosing minrun. N = 2,112. With minrun 32 the runs pair off level by level and leave a short tail: the last
// merge is lopsided. With minrun 33: 64 runs, no remainder, and every level pairs off evenly down to one.
export function MinrunChoice({ t }: StepCtx) {
  const W = 520;
  const lv32 = clamp((t - 0.5) / 1.2, 0, 1) * 6;
  const lv33 = clamp((t - 2.0) / 1.2, 0, 1) * 6;
  const tail = (32 * 2) / 2112;
  const rowOf = (levels: number, y: number, withTail: boolean, colour: string) => {
    const L = Math.floor(levels);
    const parts = 2 ** (6 - L);
    const body = withTail ? 1 - tail : 1;
    return (
      <g>
        {Array.from({ length: parts }, (_, i) => (
          <rect key={i} x={40 + (i * W * body) / parts + 1} y={y} width={Math.max(1, (W * body) / parts - 2)} height={16} rx={1} fill={colour} opacity={0.8} />
        ))}
        {withTail && <rect x={40 + W * body + 1} y={y} width={W * tail - 2} height={16} rx={1} fill={C.cherryText} opacity={0.9} />}
      </g>
    );
  };
  return (
    <Svg label="N = 2,112. With minrun 32 the runs pair off level by level and leave a short tail, so the last merge joins a huge block to a tiny one. With minrun 33: 64 runs, no remainder, and every level pairs off evenly down to one" h={280}>
      <T x={300} y={24} s={12} a="middle" f={C.latte}>N = 2,112</T>
      <T x={40} y={60} s={12} f={C.cinnamon}>minrun 32</T>
      {rowOf(lv32, 72, true, C.cinnamon)}
      <T x={40} y={114} s={12} f={C.cherryText} o={easeOut(seg(t, 1.7, 2.0))}>last merge: huge + tiny</T>
      <T x={40} y={170} s={12} f={C.caramel} o={easeOut(seg(t, 1.8, 2.1))}>minrun 33: 64 runs, no remainder</T>
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>{rowOf(lv33, 182, false, C.caramel)}</g>
      <T x={40} y={226} s={12} f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>every merge balanced</T>
    </Svg>
  );
}

// 6 · Galloping. For A[0] belonging at B[i], i = 0..11: linear search's comparisons climb one per step, galloping's
// climb in stairs. The bars rise in pairs; galloping loses at i = 2 and 4, ties elsewhere, first wins at i = 6;
// MIN_GALLOP = 7 marks the threshold just past it.
export function Galloping({ t }: StepCtx) {
  const LIN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const GAL = [1, 2, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8];
  const X = (i: number) => 70 + i * 42;
  const H = (v: number) => v * 13;
  const base = 230;
  return (
    <Svg label="Comparisons to find where A[0] belongs at B[i], for i from 0 to 11: linear search 1 to 12, one more each step; galloping 1, 2, 4, 4, 6, 6, 6, 6, 8, 8, 8, 8. Galloping loses at 2 and 4, first wins at 6; MIN_GALLOP is 7" h={290}>
      <T x={40} y={22} s={12} f={C.crema}>linear</T>
      <T x={110} y={22} s={12} f={C.caramel}>galloping</T>
      <T x={210} y={22} s={12} f={C.latte}>comparisons</T>
      {LIN.map((l, i) => {
        const g = easeOut(seg(t, 0.3 + i * 0.12, 0.7 + i * 0.12));
        const lose = GAL[i] > l;
        return (
          <g key={i}>
            <rect x={X(i)} y={base - H(l) * g} width={14} height={H(l) * g} rx={1} fill={C.crema} opacity={0.6} />
            <rect x={X(i) + 16} y={base - H(GAL[i]) * g} width={14} height={H(GAL[i]) * g} rx={1} fill={lose ? C.cherryText : C.caramel} opacity={0.9} />
            <T x={X(i) + 15} y={base + 18} s={12} a="middle" f={C.latte} o={g}>{i}</T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 2.2, 2.6))}>
        <T x={X(2) + 15} y={base - H(4) - 8} s={12} a="middle" f={C.cherryText}>loses</T>
        <path d={`M${X(6) + 15} 58 L${X(6) + 15} ${base - H(7) - 6}`} stroke={C.caramel} strokeWidth={1.4} />
        <T x={X(6) + 15} y={50} s={12} a="middle" f={C.caramel}>first win: i = 6</T>
      </g>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <path d={`M${X(7) - 4} 124 L${X(7) - 4} ${base}`} stroke={C.crema} strokeWidth={1.2} strokeDasharray="4 4" />
        <T x={X(7) + 2} y={272} s={12} f={C.crema}>MIN_GALLOP = 7</T>
      </g>
      <T x={40} y={248} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>i</T>
    </Svg>
  );
}

// 7 · Predict. A[0] and the row B[0..7]. Two searches set off together: linear steps one cell at a time, galloping
// leaps 0, 1, 3. After answering: the key belongs at B[2]: linear stops after 3 comparisons, galloping needs 4.
export function PredictBrokenLeg({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X = (i: number) => 90 + i * 56;
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const go = clamp((t - 0.3) / 1.6, 0, 1) * 3;
  const LIN = [0, 1, 2];
  const GAL = [0, 1, 3, 2];
  const tick = answered ? clamp((s - 0.2) / 1.2, 0, 1) * 4 : 0;
  return (
    <Svg label="A key A[0] and a row B[0] to B[7]. Linear search steps one cell at a time; galloping leaps to 0, 1, 3. After answering: the key belongs at B[2]; linear search needs 3 comparisons, galloping 4" h={290}>
      <Cell x={40} y={30} v="A[0]" w={44} c={C.caramel} fill />
      {Array.from({ length: 8 }, (_, i) => (
        <Cell key={i} x={X(i)} y={100} v={`B${i}`} w={44} c={answered && i === 2 ? C.caramel : C.latte} />
      ))}
      {!answered && <path d={`M${X(Math.min(go, 2)) + 22} 94 l-6 -10 l12 0 z`} fill={C.crema} />}
      {!answered && <path d={`M${X([0, 1, 3, 3][Math.min(3, Math.floor(go))]) + 22} 132 l-6 10 l12 0 z`} fill={C.caramel} />}
      <T x={40} y={180} s={12} f={C.crema}>linear</T>
      <T x={40} y={214} s={12} f={C.caramel}>galloping</T>
      {answered &&
        LIN.map((c, i) => <Cell key={`l${i}`} x={150 + i * 48} y={164} v={`B${c}`} w={40} c={C.crema} o={clamp(tick - i, 0, 1)} />)}
      {answered &&
        GAL.map((c, i) => <Cell key={`g${i}`} x={150 + i * 48} y={198} v={`B${c}`} w={40} c={i === 3 ? C.cherryText : C.caramel} o={clamp(tick - i, 0, 1)} />)}
      {answered && <T x={360} y={180} s={12} f={C.crema} o={easeOut(seg(s, 1.4, 1.7))}>3</T>}
      {answered && <T x={360} y={214} s={12} f={C.cherryText} o={easeOut(seg(s, 1.4, 1.7))}>4</T>}
      {!answered && <T x={300} y={270} s={14} a="middle" f={C.caramel} o={pulse}>can galloping cost more?</T>}
      {answered && <T x={300} y={270} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.7, 2.1))}>at B[2]: 4 against 3</T>}
    </Svg>
  );
}

// 8 · The old invariant. Runs pile on the stack, each one shorter than the two below it combined, the way Fibonacci
// numbers grow; merges only ever join neighbours. Then the author's own words.
export function OldInvariant({ t }: StepCtx) {
  const FIB = [55, 34, 21, 13, 8, 5];
  const pair = easeOut(seg(t, 1.8, 2.3));
  return (
    <Svg label="Runs pile on the stack, each longer than the two above it combined, the way Fibonacci numbers grow; merges only join neighbours, for stability. Then CPython's own words: the first thing I made up that didn't obviously suck, loosely based on the Fibonacci sequence" h={300}>
      <T x={40} y={24} s={12} f={C.latte}>each run longer than the next two combined</T>
      {FIB.map((f, i) => {
        const g = easeOutBack(seg(t, 0.2 + i * 0.22, 0.6 + i * 0.22));
        return <rect key={i} x={40} y={40 + i * 22} width={f * 5 * clamp(g, 0, 1.05)} height={14} rx={2} fill={i >= 4 ? C.caramel : C.crema} opacity={0.8} />;
      })}
      <g opacity={pair}>
        <path d={`M${40 + 34 * 5 + 10} 62 Q${40 + 34 * 5 + 40} 73 ${40 + 21 * 5 + 10} 84`} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={300} y={84} s={12} f={C.caramel}>merge neighbours only: stable</T>
      </g>
      <g opacity={easeOut(seg(t, 2.6, 3.0))}>
        <T x={40} y={208} s={12} f={C.crema}>"the first thing I made up that didn't</T>
        <T x={40} y={228} s={12} f={C.crema}>obviously suck ;-)"</T>
        <T x={40} y={256} s={12} f={C.latte}>"loosely based on ... the Fibonacci sequence"</T>
      </g>
    </Svg>
  );
}

// 9 · Why it breaks. The stack after the merge, 120, 80, 45, 30; the check's bracket covers only the top three and
// passes; 120 sits outside it, red: 120 ≤ 80 + 45. Then the scale: the smallest crashing input, 67+ million elements,
// a bar running off the frame; and Python had it too.
export function BugScale({ t }: StepCtx) {
  const look = easeOut(seg(t, 0.4, 0.9));
  const red = easeOut(seg(t, 1.3, 1.7));
  const big = easeInOut(seg(t, 2.4, 3.6));
  return (
    <Svg label="The stack after the merge, 120, 80, 45, 30: the check covers only the top three and passes, while 120 is no longer longer than 80 plus 45. The smallest crashing input needs over 67 million elements; the bug was in Python too, ever since the method was introduced" h={300}>
      <Stack runs={[120, 80, 45, 30]} y0={30} colour={(i) => (i === 0 ? (red > 0.5 ? C.cherryText : C.crema) : C.crema)} />
      <g opacity={look}>
        <path d="M100 56 L94 56 L94 134 L100 134" fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={20} y={98} s={12} f={C.caramel}>checked</T>
      </g>
      <T x={428} y={44} s={12} f={C.cherryText} o={red}>missed</T>
      <T x={130} y={168} s={12} f={C.cherryText} o={red}>"120 ≤ 80 + 45"</T>
      <g opacity={easeOut(seg(t, 2.2, 2.5))}>
        <T x={40} y={210} s={12} f={C.latte}>smallest crashing input</T>
        <rect x={40} y={220} width={lerp(8, 560, big)} height={14} rx={2} fill={C.cherryText} opacity={0.8} />
        <T x={40} y={254} s={12} f={C.cherryText} o={big}>"67+ million elements"</T>
      </g>
      <T x={40} y={286} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>"present in Python as well"</T>
    </Svg>
  );
}

// 10 · Powersort. Three pairs of runs, each on a line of n = 80. Dyadic gridlines appear level by level (halves,
// quarters, eighths); the first gridline that falls between a pair's two midpoints lights up, and its level is the
// pair's power: 40 and 40 -> 1; 10 and 10 -> 3; 10 and 60 -> 1.
export function Powersort({ t }: StepCtx) {
  const W = 400;
  const X0 = 140;
  const P = (v: number) => X0 + (v / 80) * W;
  const PAIRS: [string, number, number, number, number][] = [
    ['40, 40', 0, 40, 40, 1],
    ['10, 10', 0, 10, 10, 3],
    ['10, 60', 10, 10, 60, 1],
  ];
  const lvl = clamp((t - 0.6) / 1.8, 0, 1) * 3;
  return (
    <Svg label="Three pairs of runs on a line of 80. Gridlines appear at halves, quarters, eighths; the first gridline between a pair's two midpoints sets its power: 40 and 40 power 1, 10 and 10 power 3, 10 and 60 power 1" h={300}>
      {[1, 2, 3].map((L) =>
        Array.from({ length: 2 ** L - 1 }, (_, j) => {
          const x = X0 + ((j + 1) * W) / 2 ** L;
          if (L > 1 && (j + 1) % 2 === 0) return null;
          return <path key={`${L}-${j}`} d={`M${x} 30 L${x} 250`} stroke={C.mocha} strokeWidth={4 - L} opacity={clamp(lvl - (L - 1), 0, 1)} />;
        }),
      )}
      {PAIRS.map(([lab, s, a, b, pw], r) => {
        const y = 50 + r * 70;
        const m1 = s + a / 2;
        const m2 = s + a + b / 2;
        const hit = lvl >= pw;
        const gx = X0 + Math.ceil((m1 / 80) * 2 ** pw) * (W / 2 ** pw);
        return (
          <g key={lab} opacity={easeOut(seg(t, 0.1 + r * 0.15, 0.5 + r * 0.15))}>
            <T x={30} y={y + 13} s={12} f={C.latte}>{lab}</T>
            <rect x={P(s) + 1} y={y} width={P(s + a) - P(s) - 2} height={18} rx={2} fill={C.crema} opacity={0.7} />
            <rect x={P(s + a) + 1} y={y} width={P(s + a + b) - P(s + a) - 2} height={18} rx={2} fill={C.latte} opacity={0.6} />
            <circle cx={P(m1)} cy={y + 9} r={4} fill={C.caramel} />
            <circle cx={P(m2)} cy={y + 9} r={4} fill={C.caramel} />
            <path d={`M${gx} ${y - 6} L${gx} ${y + 24}`} stroke={C.caramel} strokeWidth={2.4} opacity={hit ? 1 : 0} />
            <T x={gx + 6} y={y + 40} s={12} f={C.caramel} o={hit ? easeOut(seg(t, 0.6 + (pw / 3) * 1.8, 1.0 + (pw / 3) * 1.8)) : 0}>power {pw}</T>
          </g>
        );
      })}
      <T x={300} y={280} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>depth in an ideal merge tree, computed exactly</T>
    </Svg>
  );
}

// 11 · Pochmann's refinement. 315 elements. The old scheme: seven runs of 40 and a short 35. The new: 39 39 40 39 39 40
// 39 40, in CPython's own order; pairs bracket under it, never differing by more than one.
export function Pochmann({ t }: StepCtx) {
  const OLD = [40, 40, 40, 40, 40, 40, 40, 35];
  const NEW = [39, 39, 40, 39, 39, 40, 39, 40];
  const X = (i: number) => 40 + i * 66;
  const H = (v: number) => v * 1.6;
  const row = (vals: number[], base: number, t0: number, colour: (v: number) => string) =>
    vals.map((v, i) => {
      const g = easeOut(seg(t, t0 + i * 0.1, t0 + 0.4 + i * 0.1));
      return (
        <g key={i}>
          <rect x={X(i)} y={base - H(v) * g} width={56} height={H(v) * g} rx={2} fill={colour(v)} opacity={0.8} />
          <T x={X(i) + 28} y={base + 18} s={12} a="middle" f={colour(v)} o={g}>{v}</T>
        </g>
      );
    });
  return (
    <Svg label="315 elements. The old scheme: seven runs of 40 and one short run of 35. The new scheme: 39 39 40 39 39 40 39 40; merged pairs never differ by more than one" h={300}>
      <T x={40} y={24} s={12} f={C.cinnamon}>old: fixed minrun = 40</T>
      {row(OLD, 100, 0.2, (v) => (v === 35 ? C.cherryText : C.cinnamon))}
      <T x={40} y={160} s={12} f={C.caramel} o={easeOut(seg(t, 1.6, 1.9))}>new: 39s and 40s</T>
      {row(NEW, 240, 1.8, () => C.caramel)}
      {[0, 1, 2, 3].map((p) => (
        <Bracket key={p} x0={X(2 * p)} x1={X(2 * p + 1) + 56} y={282} c={C.crema} o={easeOut(seg(t, 3.2 + p * 0.15, 3.5 + p * 0.15))} />
      ))}
    </Svg>
  );
}

// 12 · Driftsort. A pipeline lights up stage by stage: detect runs, stable quicksort, and past the depth limit,
// mergesort, not heapsort. Then the scratch it allocates, max(n / 2, min(n, 8MB)): drawn as a curve, rising with n
// then bending to n / 2; the two measured points, 1,000 -> 1,000 and 10,000,000 -> 5,000,000.
export function Driftsort({ t }: StepCtx) {
  const STAGES: [string, string][] = [
    ['find runs', C.crema],
    ['quicksort', C.cinnamon],
    ['mergesort', C.caramel],
  ];
  const curve = clamp((t - 2.4) / 1.4, 0, 1);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const n = i / 40;
    const v = Math.max(n / 2, Math.min(n, 0.3));
    pts.push([340 + n * 225, 280 - v * 150]);
  }
  const shown = pts.slice(0, Math.max(2, Math.round(curve * pts.length)));
  return (
    <Svg label="Driftsort by Orson Peters and Lukas Bergdoll: find runs, stable quicksort, and past the depth limit fall back to mergesort, not heapsort. Scratch memory max(n / 2, min(n, 8MB)): 1,000 elements for n = 1,000, 5,000,000 for n = 10,000,000" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>Rust 1.81 stable sort: driftsort</T>
      {STAGES.map(([lab, c], i) => {
        const g = easeOutBack(seg(t, 0.3 + i * 0.4, 0.7 + i * 0.4));
        return (
          <g key={lab} opacity={clamp(g, 0, 1)}>
            <rect x={30 + i * 180} y={40} width={150} height={28} rx={14} fill="none" stroke={c} strokeWidth={1.4} />
            <T x={105 + i * 180} y={59} s={12} a="middle" f={c}>{lab}</T>
            {i > 0 && <path d={`M${i * 180 + 2} 54 l20 0`} stroke={C.latte} strokeWidth={1.2} />}
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.5, 1.9))}>
        <T x={390} y={92} s={12} f={C.latte}>past the depth limit</T>
        <T x={390} y={116} s={12} f={C.cherryText}>not heapsort</T>
      </g>
      <g opacity={easeOut(seg(t, 2.2, 2.6))}>
        <T x={30} y={150} s={12} f={C.crema}>scratch: max(n / 2, min(n, 8MB))</T>
        <path d="M340 280 L570 280 M340 280 L340 130" stroke={C.mocha} strokeWidth={1.2} />
        <T x={570} y={296} s={12} a="end" f={C.latte}>n</T>
      </g>
      <path d={`M${shown.map(([x, y]) => `${x} ${y}`).join(' L')}`} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g opacity={easeOut(seg(t, 3.8, 4.2))}>
        <T x={30} y={220} s={12} f={C.crema}>1,000 → 1,000</T>
        <T x={30} y={244} s={12} f={C.crema}>10,000,000 → 5,000,000</T>
      </g>
    </Svg>
  );
}

// 13 · Recap. Three chips, each with its own small picture: runs bracketed (detect what's there), a stack bracket that
// must reach the bottom (check the promise), a counter switching one algorithm to another (one counter stitches two).
export function Recap({ t }: StepCtx) {
  const a = (i: number) => easeOutBack(seg(t, 0.3 + i * 0.9, 0.8 + i * 0.9));
  const X = (i: number) => 330 + i * 26;
  const deck = DECK.slice(4, 12);
  const sw = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="Three lessons: detect what is already there; check a merge policy's promise as carefully as the merge; the fast case and the worst case are two algorithms stitched together by one counter" h={260}>
      {['detect what is there', 'check the promise', 'one counter, two sorts'].map((lab, i) => (
        <g key={lab} opacity={clamp(a(i), 0, 1)} transform={`translate(${lerp(-20, 0, clamp(a(i), 0, 1))} 0)`}>
          <rect x={30} y={30 + i * 70} width={250} height={30} rx={15} fill="none" stroke={C.caramel} strokeWidth={1.4} />
          <T x={155} y={50 + i * 70} s={12} a="middle" f={C.caramel}>{lab}</T>
        </g>
      ))}
      <g opacity={clamp(a(0), 0, 1)}>
        {deck.map((v, i) => (
          <rect key={i} x={X(i)} y={50 - v * 2.5} width={20} height={v * 2.5} rx={1} fill={i >= 2 ? C.caramel : C.latte} opacity={0.8} />
        ))}
        <Bracket x0={X(2)} x1={X(7) + 20} y={60} c={C.caramel} o={easeOut(seg(t, 0.8, 1.1))} />
      </g>
      <g opacity={clamp(a(1), 0, 1)}>
        {[120, 80, 45, 30].map((r, i) => (
          <rect key={r} x={330} y={86 + i * 10} width={r * 1.6} height={7} rx={1} fill={i === 0 ? C.cherryText : C.crema} opacity={0.8} />
        ))}
        <path d={`M324 ${lerp(96, 86, easeOut(seg(t, 1.7, 2.1)))} L320 ${lerp(96, 86, easeOut(seg(t, 1.7, 2.1)))} L320 124 L324 124`} fill="none" stroke={C.caramel} strokeWidth={1.4} />
      </g>
      <g opacity={clamp(a(2), 0, 1)}>
        <rect x={330} y={172} width={110} height={24} rx={12} fill="none" stroke={C.cinnamon} strokeWidth={1.3} opacity={1 - sw * 0.6} />
        <T x={385} y={188} s={12} a="middle" f={C.cinnamon} o={1 - sw * 0.6}>fast case</T>
        <rect x={460} y={172} width={110} height={24} rx={12} fill="none" stroke={C.caramel} strokeWidth={1.3} opacity={0.4 + sw * 0.6} />
        <T x={515} y={188} s={12} a="middle" f={C.caramel} o={0.4 + sw * 0.6}>worst case</T>
        <circle cx={lerp(385, 515, sw)} cy={216} r={5} fill={C.caramel} />
      </g>
    </Svg>
  );
}

// 14 · Handoff. The deck's keys stop comparing and fall, one by one, into ten buckets by their last digit: reading a
// digit instead of comparing two keys. Counting, radix and bucket sort, next.
export function Handoff({ t }: StepCtx) {
  const X = (i: number) => 30 + i * 34;
  const B = (d: number) => 40 + d * 54;
  const counts = Array(10).fill(0) as number[];
  const slots = DECK.map((v) => counts[v % 10]++);
  return (
    <Svg label="The deck's keys fall one by one into ten buckets by their last digit: no comparison between keys, just a digit read. Counting, radix and bucket sort, next" h={280}>
      {DECK.map((v, i) => {
        const g = easeInOut(seg(t, 0.4 + i * 0.12, 0.9 + i * 0.12));
        const d = v % 10;
        return <Cell key={i} x={lerp(X(i), B(d) + 4, g)} y={lerp(30, 210 - slots[i] * 30, g)} v={v} w={28} c={g >= 1 ? C.caramel : C.crema} />;
      })}
      {Array.from({ length: 10 }, (_, d) => (
        <g key={d} opacity={easeOut(seg(t, 0.1, 0.5))}>
          <path d={`M${B(d)} 160 L${B(d)} 240 L${B(d) + 36} 240 L${B(d) + 36} 160`} fill="none" stroke={C.latte} strokeWidth={1.2} />
          <T x={B(d) + 18} y={258} s={12} a="middle" f={C.latte}>{d}</T>
        </g>
      ))}
      <T x={300} y={86} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>read a digit, compare nothing</T>
    </Svg>
  );
}
