import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md style, carried from Chapter 15's own grammar): crema = a key or value; latte = secondary
// labels (a count, an index); taupe = memory not yet touched; caramel = the thing to look at (the pointer being compared,
// the slot being filled); cinnamon (rare) = the alternative being compared (bottom-up beside top-down); cherryText = the
// broken (unstable) outcome. The chapter's own 16-key deck (examples.py, fixed in topic 48):
// [7,3,9,3,1,12,5,6,8,9,10,11,4,2,3,13].
// Every printed number is examples.py's: merging [1..8] with [9..16] costs 8 comparisons, the perfectly interleaved
// merge 15 (= 8 + 8 - 1); the stability merge of (3,a) (5,x) with (3,b) (3,c) (9,y), taking left on a tie, and its
// one-character break; buffer peaks on the deck: full 16, half 8, min(A,B) 8; natural merge sort: sorted input 1 run,
// reversed 16 runs, the deck 7 runs of 16, 500 random 200-key shuffles averaging 100.7 runs; worst case 17 against the
// floor 16 at n = 8, 9,217 against 8,770 at n = 1,024, and the largest gap/n up to 200,000 is 0.529. Top-down and
// bottom-up comparison counts are drawn as shape (equal at 16, splits shown at 13), never printed.

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

function Cell({ x, y, v, c = C.crema, o = 1, w = 26, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={24} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.4} />
      <T x={x + w / 2} y={y + 17} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

/** A merge of two sorted lists, step by step: which side each output came from, and whether a comparison was paid. */
function mergeTrace(L: number[], R: number[]) {
  const out: { v: number; side: 'L' | 'R'; idx: number; cmp: boolean }[] = [];
  let i = 0;
  let j = 0;
  while (i < L.length && j < R.length) {
    if (L[i] <= R[j]) out.push({ v: L[i], side: 'L', idx: i++, cmp: true });
    else out.push({ v: R[j], side: 'R', idx: j++, cmp: true });
  }
  while (i < L.length) out.push({ v: L[i], side: 'L', idx: i++, cmp: false });
  while (j < R.length) out.push({ v: R[j], side: 'R', idx: j++, cmp: false });
  return out;
}

const ODD = [1, 3, 5, 7, 9, 11, 13, 15];
const EVEN = [2, 4, 6, 8, 10, 12, 14, 16];
const LO = [1, 2, 3, 4, 5, 6, 7, 8];
const HI = [9, 10, 11, 12, 13, 14, 15, 16];
const MX = (i: number) => 60 + i * 30;

/** Two sorted rows merging into one: k = how many outputs have been placed (fractional = the one in flight). */
function MergeView({ L, R, k, yL = 40, yR = 80, yO = 170, xL = 60, xR = 60, showCmp = true }: { L: number[]; R: number[]; k: number; yL?: number; yR?: number; yO?: number; xL?: number; xR?: number; showCmp?: boolean }) {
  const tr = mergeTrace(L, R);
  const placed = Math.floor(k);
  const f = easeInOut(k - placed);
  return (
    <g>
      {L.map((v, i) => {
        const o = tr.findIndex((e) => e.side === 'L' && e.idx === i);
        const gone = o < placed;
        const flying = o === placed && f > 0;
        const x = gone ? MX(o) : flying ? lerp(xL + i * 30, MX(o), f) : xL + i * 30;
        const y = gone ? yO : flying ? lerp(yL, yO, f) : yL;
        return <Cell key={`L${i}`} x={x} y={y} v={v} c={gone ? C.crema : flying ? C.caramel : C.latte} />;
      })}
      {R.map((v, i) => {
        const o = tr.findIndex((e) => e.side === 'R' && e.idx === i);
        const gone = o < placed;
        const flying = o === placed && f > 0;
        const x = gone ? MX(o) : flying ? lerp(xR + i * 30, MX(o), f) : xR + i * 30;
        const y = gone ? yO : flying ? lerp(yR, yO, f) : yR;
        return <Cell key={`R${i}`} x={x} y={y} v={v} c={gone ? C.crema : flying ? C.caramel : C.latte} />;
      })}
      {showCmp &&
        tr.slice(0, Math.min(placed + 1, tr.length)).map((e, i) =>
          e.cmp ? <circle key={i} cx={MX(i) + 13} cy={yO < yL ? yO - 8 : yO + 36} r={3} fill={C.caramel} opacity={i < placed ? 0.9 : f} /> : null,
        )}
    </g>
  );
}

// 1 · Opening. Two sorted rows of eight, perfectly interleaved, merge into one row; a dot under each output marks a
// comparison paid. How many it takes depends on how the two rows interleave.
export function Opening({ t }: StepCtx) {
  const k = clamp((t - 0.3) / 2.6, 0, 1) * 16;
  return (
    <Svg label="Two sorted rows of eight keys merge into one sorted row, a dot marking each comparison paid; how many depends on how they interleave" h={280}>
      <T x={30} y={30} s={12} f={C.latte}>two sorted lists</T>
      <MergeView L={ODD} R={EVEN} k={k} yL={40} yR={76} yO={150} />
      <T x={30} y={140} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>one list</T>
      <T x={300} y={250} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.6, 3.1))}>how many comparisons? it depends</T>
    </Svg>
  );
}

// 2 · Predict. [1..8] above [9..16]; the two head pointers and their first comparison. After answering: each of the left
// keys is compared once against 9 and drops out; the right row then slides down untouched: 8 comparisons.
export function PredictMergeBest({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const k = answered ? clamp((s - 0.2) / 1.6, 0, 1) * 16 : 0;
  return (
    <Svg label="Merging 1 to 8 with 9 to 16: after answering, every left key is compared once against 9 and copied out, then the right list empties with no comparisons at all: 8 comparisons" h={280}>
      <g opacity={a}>
        {/* the output row sits above both inputs, so the left keys rise into it without crossing the right row */}
        <MergeView L={LO} R={HI} k={k} yL={110} yR={156} yO={44} />
      </g>
      {!answered && <path d={`M${60 + 13} 137 L${60 + 13} 153`} stroke={C.caramel} strokeWidth={2} opacity={a * pulse} />}
      {!answered && <T x={300} y={240} s={14} a="middle" f={C.caramel} o={pulse * a}>how many comparisons?</T>}
      {answered && <T x={300} y={240} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.4, 1.8))}>8: the right list is never compared</T>}
    </Svg>
  );
}

// 3 · The merge procedure. The perfectly interleaved rows merge pointer by pointer: each step compares the two heads,
// copies the smaller out and advances its pointer. The last key needs no comparison: 15 = 8 + 8 - 1, the most a merge
// costs.
export function MergeProcedure({ t }: StepCtx) {
  const k = clamp((t - 0.3) / 3.2, 0, 1) * 16;
  const tr = mergeTrace(ODD, EVEN);
  const placed = Math.floor(k);
  const cur = tr[Math.min(placed, 15)];
  const li = tr.slice(0, placed).filter((e) => e.side === 'L').length;
  const ri = tr.slice(0, placed).filter((e) => e.side === 'R').length;
  return (
    <Svg label="The perfectly interleaved rows merge pointer by pointer: each step compares the two heads and copies the smaller; the last key needs no comparison, so it costs 15, one less than 16, the most a merge can cost" h={300}>
      <MergeView L={ODD} R={EVEN} k={k} yL={40} yR={86} yO={170} />
      {placed < 15 && (
        <g>
          <path d={`M${60 + li * 30 + 13} 30 l-6 -10 l12 0 z`} fill={C.caramel} />
          <path d={`M${60 + ri * 30 + 13} 120 l-6 10 l12 0 z`} fill={C.caramel} />
        </g>
      )}
      {cur && !cur.cmp && placed >= 15 && <T x={MX(15) + 13} y={226} s={12} a="middle" f={C.latte}>free</T>}
      <T x={300} y={262} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.6, 4.1))}>15 = 8 + 8 − 1: the most a merge costs</T>
    </Svg>
  );
}

// 4 · Top-down. The deck splits level by level (16, 8s, 4s, 2s, 1s), then merges back up: each level's pieces turn
// sorted, bottom to top, a merge at every node.
const lvlX = (i: number, l: number) => 40 + i * 27 + Math.floor(i / (16 >> l)) * 5;
function chunks(a: number[], size: number, sorted: boolean) {
  const out: number[] = [];
  for (let i = 0; i < a.length; i += size) {
    const c = a.slice(i, i + size);
    out.push(...(sorted ? [...c].sort((x, y) => x - y) : c));
  }
  return out;
}
export function TopDown({ t }: StepCtx) {
  return (
    <Svg label="The 16-key deck splits into halves, quarters, pairs and single keys, then merges back up level by level, every node a merge of two sorted halves" h={300}>
      {[0, 1, 2, 3, 4].map((l) => {
        const down = easeOut(seg(t, 0.1 + l * 0.3, 0.4 + l * 0.3));
        const upAt = 1.8 + (4 - l) * 0.45;
        const merged = l === 4 || t >= upAt;
        const row = chunks(DECK, 16 >> l, merged);
        const flash = l < 4 && t >= upAt && t < upAt + 0.4;
        return (
          <g key={l} opacity={down}>
            {row.map((v, i) => (
              <Cell key={i} x={lvlX(i, l)} y={30 + l * 46} v={v} w={23} c={flash ? C.caramel : merged && l < 4 ? C.crema : C.latte} fill={flash} />
            ))}
          </g>
        );
      })}
      <T x={300} y={282} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.3, 3.7))}>every node: a merge of two sorted halves</T>
    </Svg>
  );
}

// 5 · Bottom-up. The deck as sixteen width-one runs; a sweep merges adjacent pairs at width 1, then 2, 4, 8, one pass per
// row, left to right, no recursion: the same merges, built from the bottom.
export function BottomUp({ t }: StepCtx) {
  const widths = [1, 2, 4, 8, 16];
  return (
    <Svg label="The deck as sixteen single-key runs; one pass per width merges adjacent runs of width 1, 2, 4 and 8, left to right, with no recursion, until one sorted run remains" h={300}>
      {widths.map((w, l) => {
        const t0 = 0.2 + l * 0.75;
        const sweep = clamp((t - t0) / 0.6, 0, 1);
        const row = chunks(DECK, w, true);
        return (
          <g key={w} opacity={l === 0 ? easeOut(seg(t, 0.1, 0.4)) : sweep > 0 ? 1 : 0}>
            {l > 0 && <T x={30} y={30 + l * 46 + 17} s={12} f={C.latte}>{`×2`}</T>}
            {row.map((v, i) => {
              const on = l === 0 || i < sweep * 16;
              return <Cell key={i} x={lvlX(i, 4 - l) + 18} y={30 + l * 46} v={on ? v : ''} w={23} c={on ? (l === 4 ? C.caramel : C.crema) : C.taupe} />;
            })}
          </g>
        );
      })}
      <T x={30} y={47} s={12} f={C.latte}>1s</T>
    </Svg>
  );
}

// 6 · Power of two, or not. At 16 both strategies split exactly in half and their comparison bars grow to the same
// length. At 13, top-down splits 6 | 7 and bottom-up 8 | 5 (then 4, 4, 4, 1): different pieces, so the counts can differ.
export function PowerOfTwo({ t }: StepCtx) {
  const bars = easeOut(seg(t, 0.2, 1.0));
  const eq = easeOut(seg(t, 1.0, 1.3));
  const s13 = easeOut(seg(t, 1.6, 2.1));
  const lv2 = easeOut(seg(t, 2.4, 2.9));
  const end = easeOut(seg(t, 3.2, 3.6));
  const seg13 = (sizes: number[], y: number, c: string, o: number) => {
    let x = 170;
    return sizes.map((n, i) => {
      const el = <rect key={i} x={x} y={y} width={n * 26 - 4} height={18} rx={3} fill="none" stroke={c} strokeWidth={1.5} opacity={o} />;
      const lab = <T key={`l${i}`} x={x + (n * 26 - 4) / 2} y={y + 13} s={12} a="middle" f={c} o={o}>{n}</T>;
      x += n * 26;
      return [el, lab];
    });
  };
  return (
    <Svg label="At 16 keys, top-down and bottom-up split exactly in half and pay the same comparisons. At 13 keys, top-down splits 6 and 7 while bottom-up splits 8 and 5, so their counts can differ" h={320}>
      <T x={30} y={30} s={12} f={C.latte}>16 keys</T>
      <T x={30} y={58} s={12} f={C.crema}>top-down</T>
      <rect x={170} y={46} width={300 * bars} height={14} rx={2} fill={C.crema} />
      <T x={30} y={84} s={12} f={C.cinnamon}>bottom-up</T>
      <rect x={170} y={72} width={300 * bars} height={14} rx={2} fill={C.cinnamon} />
      <T x={480} y={72} s={12} f={C.caramel} o={eq}>equal</T>
      <line x1={30} y1={110} x2={570} y2={110} stroke={C.mocha} opacity={s13} />
      <T x={30} y={136} s={12} f={C.latte} o={s13}>13 keys, how each splits</T>
      <T x={30} y={168} s={12} f={C.crema} o={s13}>top-down</T>
      {seg13([6, 7], 154, C.crema, s13)}
      <T x={30} y={228} s={12} f={C.cinnamon} o={s13}>bottom-up</T>
      {seg13([8, 5], 214, C.cinnamon, s13)}
      {seg13([3, 3, 3, 4], 180, C.crema, lv2)}
      {seg13([4, 4, 4, 1], 240, C.cinnamon, lv2)}
      <T x={300} y={300} s={13} a="middle" f={C.caramel} o={end}>different pieces: the counts can differ</T>
    </Svg>
  );
}

// 7 · Stability. Left (3,a) (5,x), right (3,b) (3,c) (9,y). Top: the merge takes left on a tie (<=): 3a, 3b, 3c, 5x, 9y.
// Bottom: the one-character change (<): the right 3s jump first, 3b, 3c, 3a: equal keys out of order.
const TL = ['3a', '5x'];
const TR = ['3b', '3c', '9y'];
function tagTrace(strict: boolean) {
  const out: string[] = [];
  let i = 0;
  let j = 0;
  const k = (s: string) => Number(s[0]);
  while (i < TL.length && j < TR.length) {
    if (strict ? k(TL[i]) < k(TR[j]) : k(TL[i]) <= k(TR[j])) out.push(TL[i++]);
    else out.push(TR[j++]);
  }
  while (i < TL.length) out.push(TL[i++]);
  while (j < TR.length) out.push(TR[j++]);
  return out;
}
export function StabilityDemo({ t }: StepCtx) {
  const rows: { strict: boolean; y: number; lab: string; t0: number }[] = [
    { strict: false, y: 30, lab: 'take left on a tie (≤)', t0: 0.3 },
    { strict: true, y: 170, lab: 'one character changed (<)', t0: 2.2 },
  ];
  return (
    <Svg label="Merging 3a, 5x with 3b, 3c, 9y: taking the left key on a tie gives 3a, 3b, 3c, 5x, 9y, stable; with strict less-than the right 3s go first, 3b, 3c, 3a, and equal keys trade places" h={320}>
      {rows.map(({ strict, y, lab, t0 }) => {
        const out = tagTrace(strict);
        const k = clamp((t - t0) / 1.4, 0, 1) * out.length;
        const bad = strict && t > t0 + 1.5;
        return (
          <g key={lab} opacity={easeOut(seg(t, t0 - 0.2, t0))}>
            <T x={30} y={y} s={12} f={strict ? C.cherryText : C.caramel}>{lab}</T>
            {[...TL.map((v, i) => ({ v, x: 60 + i * 52, yy: y + 14 })), ...TR.map((v, i) => ({ v, x: 200 + i * 52, yy: y + 14 }))].map(({ v, x, yy }) => {
              const o = out.indexOf(v);
              const f = easeInOut(clamp(k - o, 0, 1));
              const isThree = v[0] === '3';
              return (
                <Cell key={v} x={lerp(x, 360 + o * 42, f)} y={lerp(yy, yy + 58, f)} v={v} w={36} c={bad && isThree ? C.cherryText : isThree ? C.caramel : C.crema} />
              );
            })}
          </g>
        );
      })}
      <T x={360} y={140} s={12} f={C.caramel} o={easeOut(seg(t, 1.8, 2.1))}>3a, 3b, 3c: kept</T>
      <T x={360} y={282} s={12} f={C.cherryText} o={easeOut(seg(t, 3.7, 4.0))}>3a now after 3b, 3c</T>
    </Svg>
  );
}

// 8 · Predict. A triangle: stable, in place, n log n worst case. Merge sort sits on the stable / n log n edge, reaching for
// the in-place corner. After answering: the corner stays out of reach; the price is labelled: a second array.
export function PredictThreeGuarantees({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const tri = easeOut(seg(t, 0.1, 0.8));
  const chip = easeOutBack(seg(t, 0.8, 1.3));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const reach = answered ? Math.sin(Math.min(s, 1.2) * Math.PI * 1.5) * (1 - easeOut(seg(s, 0.8, 1.2))) : 0.4 * Math.sin(t * 3);
  const P: Record<string, [number, number]> = { stable: [300, 50], inplace: [150, 210], nlogn: [450, 210] };
  const mid: [number, number] = [(P.stable[0] + P.nlogn[0]) / 2, (P.stable[1] + P.nlogn[1]) / 2];
  return (
    <Svg label="A triangle of three guarantees: stable, in place, and n log n in the worst case; merge sort sits on the stable and n log n edge and cannot reach in place; after answering: no real comparison sort has all three, and merge sort pays with a second array" h={300}>
      <Draw pts={[P.stable, P.inplace, P.nlogn, P.stable]} t={t} from={0.1} to={0.8} stroke={C.mocha} w={1.4} pen={false} />
      {(
        [
          ['stable', P.stable, 0, -14],
          ['in place', P.inplace, 0, 30],
          ['n log n worst case', P.nlogn, 0, 30],
        ] as [string, [number, number], number, number][]
      ).map(([lab, [x, y], dx, dy]) => (
        <g key={lab} opacity={tri}>
          <circle cx={x} cy={y} r={7} fill={C.roast} stroke={lab === 'in place' && answered ? C.cherryText : C.crema} strokeWidth={1.6} />
          <T x={x + dx} y={y + dy} s={12} a="middle" f={lab === 'in place' && answered ? C.cherryText : C.crema}>{lab}</T>
        </g>
      ))}
      <g opacity={clamp(chip, 0, 1)}>
        <circle cx={lerp(mid[0], lerp(mid[0], P.inplace[0], 0.35), Math.max(0, reach))} cy={lerp(mid[1], lerp(mid[1], P.inplace[1], 0.35), Math.max(0, reach))} r={9} fill={C.caramel} />
        <T x={mid[0] + 16} y={mid[1] - 8} s={12} f={C.caramel}>merge sort</T>
      </g>
      {!answered && <T x={300} y={280} s={14} a="middle" f={C.caramel} o={pulse * tri}>all three at once?</T>}
      {answered && <T x={300} y={280} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.0, 1.4))}>no: merge sort pays a second array</T>}
    </Svg>
  );
}

// 9 · The buffer, three ways. One merge of two halves, three times: the full version copies both halves out, the half
// version only the left half, Timsort's only the shorter run. Then the deck's measured peaks: 16, 8, 8.
export function BufferStrategies({ t }: StepCtx) {
  const ROWS: { lab: string; copyL: number; copyR: number; peak: number; t0: number; c: string }[] = [
    { lab: 'full copy', copyL: 8, copyR: 8, peak: 16, t0: 0.3, c: C.cherryText },
    { lab: 'half copy', copyL: 8, copyR: 0, peak: 8, t0: 1.2, c: C.crema },
    { lab: 'min(A, B)', copyL: 8, copyR: 0, peak: 8, t0: 2.1, c: C.caramel },
  ];
  return (
    <Svg label="Three ways to pay for the merge buffer on the 16-key deck: copying the whole range peaks at 16 slots, copying only the left half at 8, copying only the shorter run at 8, and it can be smaller still" h={320}>
      <T x={30} y={24} s={12} f={C.latte}>peak buffer, 16-key deck</T>
      {ROWS.map((r, i) => {
        const y = 50 + i * 82;
        const k = easeInOut(seg(t, r.t0, r.t0 + 0.7));
        const n = easeOut(seg(t, r.t0 + 0.6, r.t0 + 0.9));
        return (
          <g key={r.lab} opacity={easeOut(seg(t, r.t0 - 0.2, r.t0))}>
            <T x={30} y={y + 14} s={12} f={r.c}>{r.lab}</T>
            {Array.from({ length: 16 }, (_, j) => (
              <rect key={j} x={150 + j * 18} y={y} width={15} height={18} rx={2} fill="none" stroke={j < 8 ? C.crema : C.cinnamon} strokeWidth={1.2} />
            ))}
            {Array.from({ length: r.copyL + r.copyR }, (_, j) => (
              <rect key={`b${j}`} x={150 + j * 18} y={lerp(y, y + 30, k)} width={15} height={12} rx={2} fill={r.c} opacity={k > 0 ? 0.85 : 0} />
            ))}
            <T x={450} y={y + 14} s={13} f={r.c} o={n}>{r.peak}</T>
          </g>
        );
      })}
      <T x={300} y={306} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>min(A, B): the shorter run, smaller still on uneven runs</T>
    </Svg>
  );
}

// 10 · Natural merge sort. A cursor sweeps the deck once and cuts it wherever a key drops: 7 runs. Adjacent runs merge
// pairwise until one remains. Then a sorted input: one run, nothing to merge.
const RUNS: number[][] = (() => {
  const out: number[][] = [];
  let cur = [DECK[0]];
  for (let i = 1; i < DECK.length; i++) {
    if (DECK[i] < DECK[i - 1]) {
      out.push(cur);
      cur = [];
    }
    cur.push(DECK[i]);
  }
  out.push(cur);
  return out;
})();
export function NaturalMergeSort({ t }: StepCtx) {
  const sweep = clamp((t - 0.2) / 1.6, 0, 1) * 16;
  const starts: number[] = [];
  let acc = 0;
  RUNS.forEach((r) => {
    starts.push(acc);
    acc += r.length;
  });
  const runOf = (i: number) => starts.filter((s0) => s0 <= i).length - 1;
  const merged = easeOut(seg(t, 2.2, 2.7));
  const sortedRow = easeOut(seg(t, 3.2, 3.7));
  const X = (i: number) => 40 + i * 33;
  return (
    <Svg label="One linear pass cuts the deck wherever a key drops, finding 7 runs; adjacent runs then merge pairwise; a sorted input is a single run with nothing to merge" h={300}>
      {DECK.map((v, i) => {
        const seen = i < sweep;
        const r = runOf(i);
        return <Cell key={i} x={X(i)} y={50} v={v} w={28} c={seen ? (r % 2 === 0 ? C.caramel : C.cinnamon) : C.latte} />;
      })}
      {starts.slice(1).map((s0, j) => (
        <line key={j} x1={X(s0) - 3} y1={40} x2={X(s0) - 3} y2={84} stroke={C.cherryText} strokeWidth={1.8} opacity={sweep > s0 ? 1 : 0} />
      ))}
      <path d={`M${X(Math.min(sweep, 15.99)) + 14} 30 l-6 -10 l12 0 z`} fill={C.caramel} opacity={sweep < 16 ? 1 : 0} />
      <T x={300} y={108} s={12} a="middle" f={C.crema} o={sweep >= 16 ? 1 : 0}>7 runs, found in one pass</T>
      <g opacity={merged}>
        {[0, 2, 4].map((j) => {
          const x0 = X(starts[j]);
          const x1 = X(starts[j + 1] + RUNS[j + 1].length - 1) + 28;
          return <path key={j} d={`M${x0} 124 L${x0} 134 L${x1} 134 L${x1} 124`} fill="none" stroke={C.crema} strokeWidth={1.4} />;
        })}
        <T x={300} y={156} s={12} a="middle" f={C.latte}>adjacent runs merge in pairs</T>
      </g>
      <g opacity={sortedRow}>
        <T x={30} y={196} s={12} f={C.latte}>sorted input</T>
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={X(i)} y={206} width={28} height={18} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.2} />
        ))}
        <path d={`M${X(0)} 234 L${X(0)} 242 L${X(15) + 28} 242 L${X(15) + 28} 234`} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={300} y={268} s={13} a="middle" f={C.caramel}>1 run: nothing to merge</T>
      </g>
    </Svg>
  );
}

// 11 · Run counts by input shape, as a share of the keys: random 200-key shuffles average 100.7 runs of 200; the deck
// 7 of 16; sorted 1 of 16; reversed 16 of 16, one run per key, the worst a detector can see.
export function FiveShapes({ t }: StepCtx) {
  const ROWS: { lab: string; runs: string; frac: number; c: string }[] = [
    { lab: 'random', runs: '100.7 of 200', frac: 100.7 / 200, c: C.crema },
    { lab: 'the deck', runs: '7 of 16', frac: 7 / 16, c: C.crema },
    { lab: 'sorted', runs: '1 of 16', frac: 1 / 16, c: C.caramel },
    { lab: 'reversed', runs: '16 of 16', frac: 1, c: C.cherryText },
  ];
  return (
    <Svg label="Runs as a share of keys: random 200-key shuffles average 100.7 runs, close to half; the deck has 7 of 16; sorted input 1 of 16; reversed input 16 of 16, one run per key" h={300}>
      <T x={30} y={26} s={12} f={C.latte}>runs found, per key</T>
      {ROWS.map((r, i) => {
        const y = 52 + i * 52;
        const g = easeOut(seg(t, 0.3 + i * 0.7, 0.9 + i * 0.7));
        return (
          <g key={r.lab} opacity={easeOut(seg(t, 0.2 + i * 0.7, 0.4 + i * 0.7))}>
            <T x={30} y={y + 13} s={12} f={r.c}>{r.lab}</T>
            <rect x={130} y={y} width={Math.max(3, 280 * r.frac * g)} height={16} rx={2} fill={r.c} opacity={0.85} />
            <T x={130} y={y + 34} s={12} f={C.latte} o={g}>{r.runs}</T>
          </g>
        );
      })}
      <line x1={270} y1={44} x2={270} y2={250} stroke={C.mocha} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={274} y={262} s={12} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>half</T>
    </Svg>
  );
}

// 12 · Worst case against the floor. n = 8: merge sort's worst 17 against ceil(lg 8!) = 16, one over. n = 1,024: 9,217
// against 8,770, about five percent over. Across n up to 200,000 the gap stays under 0.529 n.
export function WorstCaseGap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  const b = easeOut(seg(t, 1.4, 2.1));
  const c = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="At 8 keys merge sort's worst case is 17 comparisons against a floor of 16; at 1,024 keys, 9,217 against 8,770, about five percent above; up to 200,000 keys the gap stays under 0.529 n" h={300}>
      <T x={30} y={30} s={12} f={C.latte}>worst case vs the floor</T>
      <T x={30} y={66} s={12} f={C.crema} o={a}>n = 8</T>
      <rect x={130} y={54} width={(17 / 17) * 340 * a} height={16} rx={2} fill={C.crema} />
      <line x1={130 + (16 / 17) * 340} y1={46} x2={130 + (16 / 17) * 340} y2={96} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={130 + (16 / 17) * 340} y={110} s={12} a="end" f={C.caramel} o={a}>floor 16</T>
      <T x={478} y={66} s={12} f={C.crema} o={a}>17</T>
      <T x={30} y={156} s={12} f={C.crema} o={b}>n = 1,024</T>
      <rect x={130} y={144} width={340 * b} height={16} rx={2} fill={C.crema} />
      <line x1={130 + (8770 / 9217) * 340} y1={136} x2={130 + (8770 / 9217) * 340} y2={186} stroke={C.caramel} strokeWidth={2} opacity={b} />
      <T x={130 + (8770 / 9217) * 340} y={200} s={12} a="end" f={C.caramel} o={b}>floor 8,770</T>
      <T x={478} y={156} s={12} f={C.crema} o={b}>9,217</T>
      <T x={300} y={248} s={13} a="middle" f={C.caramel} o={c}>gap under 0.529 n, up to n = 200,000</T>
      <T x={300} y={272} s={12} a="middle" f={C.latte} o={c}>it never grows faster than the input</T>
    </Svg>
  );
}

// 13 · Recap. Three chips: n log n guaranteed, stable by one rule, a second array paid. Then the other way to divide: a
// pivot drops into a row and the keys part, smaller left, larger right: no merge needed. Quicksort, next.
export function Recap({ t }: StepCtx) {
  const CH = ['n log n always', 'stable, one rule', 'a second array'];
  const piv = easeOutBack(seg(t, 2.0, 2.5));
  const part = easeInOut(seg(t, 2.5, 3.3));
  const KS = [5, 2, 8, 1, 9, 3, 7];
  const P = 6;
  const left = KS.filter((v) => v < P);
  const right = KS.filter((v) => v > P);
  return (
    <Svg label="Merge sort: n log n guaranteed, stable by one rule, a second array paid. Next: choose a pivot and move smaller keys left and larger keys right, so the halves never need merging: quicksort" h={300}>
      {CH.map((c, i) => (
        <g key={c} opacity={easeOut(seg(t, 0.2 + i * 0.4, 0.6 + i * 0.4))}>
          <rect x={30 + i * 184} y={30} width={170} height={32} rx={4} fill="none" stroke={i === 2 ? C.cherryText : C.caramel} strokeWidth={1.4} />
          <T x={115 + i * 184} y={51} s={12} a="middle" f={i === 2 ? C.cherryText : C.caramel}>{c}</T>
        </g>
      ))}
      <g opacity={easeOut(seg(t, 1.6, 2.0))}>
        {KS.map((v, i) => {
          const li = left.indexOf(v);
          const ri = right.indexOf(v);
          const tx = li >= 0 ? 100 + li * 36 : 360 + ri * 36;
          return <Cell key={v} x={lerp(110 + i * 40, tx, part)} y={140} v={v} w={28} c={li >= 0 ? C.crema : C.cinnamon} />;
        })}
      </g>
      <g opacity={clamp(piv, 0, 1)} transform={`translate(0 ${lerp(-40, 0, clamp(piv, 0, 1))})`}>
        <Cell x={290} y={110} v={P} w={28} c={C.caramel} fill />
      </g>
      <T x={300} y={210} s={12} a="middle" f={C.latte} o={part}>smaller · pivot · larger: no merge back</T>
      <T x={300} y={264} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.2, 3.7))}>quicksort and partitioning, next</T>
    </Svg>
  );
}
