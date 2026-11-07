import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (DESIGN.md, carried from this chapter's own earlier topics): crema = a key or value; latte = secondary
// labels (a count, an index); taupe = memory not yet touched; caramel (the focus colour) = the pivot or the pointer being
// compared; cinnamon (rare) = the alternative scheme shown beside the one in focus; cherryText = the bad outcome (the
// quadratic blow-up).
// Every printed number is examples.py's or a quoted source: all-equal n = 1,024: Lomuto 523,776, Hoare 12,286, three-way
// 1,024 comparisons; Lomuto's recursion depth on sorted input 0 against 2*ceil(lg(n+1)) = 22; random pivot (n = 1,000,
// 200 trials) 10,977 measured against the formula's 10,986; median-of-three on n = 256: sorted 1,802, reversed 2,857,
// loose ceiling 4,096; the two-run killer at n = 512: 66,048 against random 4,902 (13.5x), and cost / n^2 0.258, 0.254,
// 0.252, 0.251 for n = 128..1,024; four distinct values: Lomuto 132,498, Hoare 12,509, three-way 2,528; random
// distinct: Hoare 2,376 swaps, three-way 10,845. The JDK's DualPivotQuicksort (MAX_RECURSION_DEPTH, heapSort,
// tryMergeRuns, countingSort), "1.9n ln n vs 2.0n ln n", "about 7-8% faster", BlockQuicksort's blocks of 128 and "80%
// over ... std::sort" are quoted from SOURCES.md. The traces on the deck's first eight keys are computed here by the
// same partition rules examples.py uses.

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
const EIGHT = DECK.slice(0, 8);

function Cell({ x, y, v, c = C.crema, o = 1, w = 30, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 18} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

function Arrow({ x, y, label, c = C.caramel, up = false, o = 1 }: { x: number; y: number; label: string; c?: string; up?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <path d={up ? `M${x - 6} ${y + 10} l6 -10 l6 10 z` : `M${x - 6} ${y - 10} l6 10 l6 -10 z`} fill={c} />
      <T x={x} y={up ? y + 26 : y - 14} s={12} a="middle" f={c}>{label}</T>
    </g>
  );
}

/** A frame of a partition trace: element ids in slot order, plus the cursors to draw. */
type Frame = { ids: number[]; cur: Record<string, number> };

function lomutoFrames(vals: number[]): Frame[] {
  const ids = vals.map((_, i) => i);
  const hi = vals.length - 1;
  const p = vals[hi];
  const out: Frame[] = [];
  let i = -1;
  for (let j = 0; j < hi; j++) {
    if (vals[ids[j]] <= p) {
      i++;
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    out.push({ ids: [...ids], cur: { j, i } });
  }
  [ids[i + 1], ids[hi]] = [ids[hi], ids[i + 1]];
  out.push({ ids: [...ids], cur: { i: i + 1 } });
  return out;
}

function hoareFrames(vals: number[]): Frame[] {
  const ids = vals.map((_, i) => i);
  const p = vals[Math.floor((vals.length - 1) / 2)];
  const out: Frame[] = [];
  let i = -1;
  let j = vals.length;
  for (;;) {
    i++;
    while (vals[ids[i]] < p) i++;
    j--;
    while (p < vals[ids[j]]) j--;
    if (i >= j) {
      out.push({ ids: [...ids], cur: { i, j } });
      return out;
    }
    out.push({ ids: [...ids], cur: { i, j } });
    [ids[i], ids[j]] = [ids[j], ids[i]];
    out.push({ ids: [...ids], cur: { i, j } });
  }
}

/** Plays a list of frames: each element slides from its slot in frame k to its slot in frame k+1. */
function Play({ vals, frames, k, X, y, pivotId, colour }: { vals: number[]; frames: Frame[]; k: number; X: (i: number) => number; y: number; pivotId: number; colour?: (id: number, slot: number) => string }) {
  const n = frames.length;
  const f0 = Math.min(Math.floor(k), n - 1);
  const f1 = Math.min(f0 + 1, n - 1);
  const fr = easeInOut(clamp(k - Math.floor(k), 0, 1));
  const A = f0 < 0 ? vals.map((_, i) => i) : frames[f0].ids;
  const B = frames[f1].ids;
  return (
    <g>
      {vals.map((v, id) => {
        const s0 = A.indexOf(id);
        const s1 = k < 0 ? s0 : B.indexOf(id);
        const moving = s0 !== s1;
        const x = lerp(X(s0), X(s1), fr);
        const yy = y - (moving ? Math.sin(fr * Math.PI) * 22 * (s1 > s0 ? 1 : -1) : 0);
        return <Cell key={id} x={x} y={yy} v={v} c={id === pivotId ? C.caramel : colour ? colour(id, s0) : C.crema} fill={id === pivotId} />;
      })}
    </g>
  );
}

// 1 · Opening. Fourteen equal keys, the last one the pivot. Lomuto's split lands at the far end every time, so the
// range bracket shrinks by one key per round. Then the counts on 1,024 equal keys: Lomuto 523,776 against three-way 1,024.
export function Opening({ t }: StepCtx) {
  const N = 14;
  const X = (i: number) => 40 + i * 37;
  const shrink = Math.floor(clamp((t - 0.4) / 1.4, 0, 1) * 10);
  const bars = easeOut(seg(t, 2.0, 2.9));
  return (
    <Svg label="Fourteen equal keys: the textbook partition shrinks the range by one key per round. On 1,024 equal keys it makes 523,776 comparisons; a three-way partition makes 1,024" h={300}>
      {Array.from({ length: N }, (_, i) => (
        <Cell key={i} x={X(i)} y={40} v={7} w={30} c={i >= N - shrink ? C.taupe : i === N - 1 - shrink ? C.caramel : C.crema} fill={i === N - 1 - shrink} />
      ))}
      <path d={`M${X(0)} 76 L${X(0)} 84 L${X(N - 1 - shrink) + 30} 84 L${X(N - 1 - shrink) + 30} 76`} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={40} y={106} s={12} f={C.cherryText} o={easeOut(seg(t, 0.6, 1.0))}>shrinks by one key per round</T>
      <T x={40} y={150} s={12} f={C.latte} o={bars}>1,024 equal keys, comparisons</T>
      <rect x={40} y={162} width={500 * bars} height={16} rx={2} fill={C.cherryText} opacity={0.85} />
      <T x={40} y={198} s={12} f={C.cherryText} o={bars}>textbook: 523,776</T>
      <rect x={40} y={212} width={Math.max(2, 500 * (1024 / 523776)) * bars} height={16} rx={2} fill={C.caramel} />
      <T x={40} y={248} s={12} f={C.caramel} o={bars}>three-way: 1,024</T>
      <T x={300} y={284} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 2.9, 3.3))}>paying for a danger that isn't there</T>
    </Svg>
  );
}

// 2 · Predict. Sixteen equal keys, the last the pivot; the scan sweeps the range. After answering: the range shrinks by
// one key per round, rounds stacking like a staircase: 523,776 comparisons at 1,024 keys, about n²/2.
export function PredictLomutoEqual({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const N = 16;
  const X = (i: number) => 30 + i * 34;
  const sweep = clamp((t - 0.3) / 1.6, 0, 1) * (N - 1);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const stairs = answered ? clamp((s - 0.2) / 1.2, 0, 1) * 8 : 0;
  return (
    <Svg label="Sixteen equal keys with the last as pivot and a scan sweeping the range; after answering, the range shrinks by one key per round, a staircase of rounds: 523,776 comparisons at 1,024 keys" h={300}>
      {Array.from({ length: N }, (_, i) => (
        <Cell key={i} x={X(i)} y={40} v={7} w={28} c={i === N - 1 ? C.caramel : i < sweep ? C.crema : C.latte} fill={i === N - 1} />
      ))}
      {!answered && <path d={`M${X(Math.min(sweep, N - 2)) + 14} 30 l-6 -10 l12 0 z`} fill={C.caramel} />}
      {answered &&
        Array.from({ length: 8 }, (_, r) => (
          <rect key={r} x={X(0)} y={82 + r * 16} width={(X(N - 1 - r) + 28 - X(0)) * clamp(stairs - r, 0, 1)} height={10} rx={2} fill={C.cherryText} opacity={0.75} />
        ))}
      {!answered && <T x={300} y={250} s={14} a="middle" f={C.caramel} o={pulse}>roughly how many comparisons?</T>}
      {answered && <T x={300} y={250} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.3, 1.7))}>523,776: about n²/2, one key per round</T>}
    </Svg>
  );
}

// 3 · The partition contract. The deck's sixteen keys; pivot 6 lifts out; every smaller key slides left, every larger
// key right; the pivot drops into the split between them.
export function PartitionContract({ t }: StepCtx) {
  const X = (i: number) => 30 + i * 34;
  const P = 6;
  const lift = easeOut(seg(t, 0.3, 0.7));
  const move = easeInOut(seg(t, 0.9, 2.0));
  const drop = easeOut(seg(t, 2.0, 2.4));
  const small = DECK.map((v, i) => [v, i]).filter(([v]) => v < P);
  const large = DECK.map((v, i) => [v, i]).filter(([v]) => v > P);
  const pIdx = DECK.indexOf(P);
  const target = (i: number) => {
    const si = small.findIndex(([, j]) => j === i);
    if (si >= 0) return si;
    const li = large.findIndex(([, j]) => j === i);
    return small.length + 1 + li;
  };
  return (
    <Svg label="The deck's sixteen keys around pivot 6: every smaller key moves left, every larger key moves right, and the pivot lands at the split between them" h={280}>
      {DECK.map((v, i) => {
        if (i === pIdx) {
          return <Cell key={i} x={lerp(X(i), X(small.length), drop)} y={lerp(lerp(60, 20, lift), 60, drop)} v={v} c={C.caramel} fill w={28} />;
        }
        return <Cell key={i} x={lerp(X(i), X(target(i)), move)} y={60} v={v} w={28} c={v < P ? C.crema : C.cinnamon} />;
      })}
      <g opacity={easeOut(seg(t, 2.3, 2.7))}>
        <T x={X(small.length / 2 - 0.5) + 14} y={116} s={12} a="middle" f={C.crema}>nothing larger</T>
        <T x={X(small.length) + 14} y={116} s={12} a="middle" f={C.caramel}>split</T>
        <T x={X(small.length + 1 + large.length / 2 - 0.5) + 14} y={116} s={12} a="middle" f={C.cinnamon}>nothing smaller</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>which pivot, and how to rearrange?</T>
    </Svg>
  );
}

// 4 · Lomuto. The deck's first eight keys, last key (6) as pivot. A scan cursor j walks left to right; every key at or
// below the pivot swaps behind the boundary i; finally the pivot swaps into the boundary's slot.
export function Lomuto({ t }: StepCtx) {
  const X = (i: number) => 120 + i * 48;
  const frames = lomutoFrames(EIGHT);
  const k = clamp((t - 0.4) / 0.4, -1, frames.length - 1) ;
  const cur = frames[Math.max(0, Math.min(Math.floor(k), frames.length - 1))].cur;
  const done = k >= frames.length - 1;
  return (
    <Svg label="Lomuto partition on 7, 3, 9, 3, 1, 12, 5, 6 with pivot 6: one scan index j walks right and every key at or below the pivot swaps behind the boundary i; the pivot then swaps into place" h={300}>
      <Play vals={EIGHT} frames={frames} k={k} X={X} y={100} pivotId={7} colour={(id, slot) => (k >= 0 && slot <= (cur.i ?? -1) && EIGHT[id] <= 6 ? C.crema : C.latte)} />
      {!done && k >= 0 && cur.j !== undefined && <Arrow x={X(cur.j) + 15} y={156} label="j scan" c={C.latte} up />}
      {k >= 0 && (cur.i ?? -1) >= 0 && <Arrow x={X(cur.i) + 15} y={86} label="i boundary" />}
      <T x={300} y={244} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>one scan, one boundary: simple</T>
      <T x={300} y={268} s={12} a="middle" f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>and simple to defeat</T>
    </Svg>
  );
}

// 5 · Hoare. The same eight keys, the middle key as pivot; i walks in from the left and j from the right, each stopping on
// a key not strictly on its side (an equal key included), and the pair swaps. Below: on 1,024 equal keys, Hoare's 12,286
// comparisons against Lomuto's 523,776.
export function Hoare({ t }: StepCtx) {
  const X = (i: number) => 120 + i * 48;
  const frames = hoareFrames(EIGHT);
  const k = clamp((t - 0.4) / 0.45, -1, frames.length - 1);
  const cur = frames[Math.max(0, Math.min(Math.floor(k), frames.length - 1))].cur;
  const pivotId = Math.floor((EIGHT.length - 1) / 2);
  const bars = easeOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="Hoare partition on the same eight keys with the middle key as pivot: i walks in from the left and j from the right, each stopping on an equal or out-of-place key, and the pair swaps. On 1,024 equal keys: 12,286 comparisons against Lomuto's 523,776" h={300}>
      <Play vals={EIGHT} frames={frames} k={k} X={X} y={70} pivotId={pivotId} />
      {k >= 0 && <Arrow x={X(cur.i) + 15} y={126} label="i →" up />}
      {k >= 0 && <Arrow x={X(cur.j) + 15} y={56} label="← j" c={C.cinnamon} />}
      <g opacity={bars}>
        <T x={30} y={196} s={12} f={C.latte}>1,024 equal keys</T>
        <rect x={150} y={208} width={380 * bars} height={14} rx={2} fill={C.cherryText} opacity={0.8} />
        <T x={30} y={220} s={12} f={C.cherryText}>Lomuto</T>
        <rect x={150} y={236} width={Math.max(3, 380 * (12286 / 523776)) * bars} height={14} rx={2} fill={C.caramel} />
        <T x={30} y={248} s={12} f={C.caramel}>Hoare</T>
        <T x={166} y={248} s={12} f={C.caramel}>12,286</T>
        <T x={300} y={282} s={12} a="middle" f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>stops on equal keys: splits in the middle</T>
      </g>
    </Svg>
  );
}

// 6 · Recurse on the smaller side. Sorted input: each Lomuto split leaves an empty side and one key fewer. The empty side
// is the recursive call (depth stays 0); the larger side is looped on (a loop arrow). The stack meter stays at 0 against
// the bound 2*ceil(lg(n+1)) = 22.
export function StackBound({ t }: StepCtx) {
  const rounds = Math.floor(clamp((t - 0.3) / 2.4, 0, 1) * 8);
  const bound = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="On sorted input each split leaves an empty side, which is the recursive call, and one key fewer on the side that is looped on; the recursion depth stays at 0 against a bound of 22" h={300}>
      {Array.from({ length: 8 }, (_, r) => {
        const on = r < rounds;
        const w = 300 - r * 30;
        return (
          <g key={r} opacity={on ? 1 : r === rounds ? 0.4 : 0}>
            <rect x={60} y={30 + r * 24} width={w} height={14} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} />
            <rect x={60 + w + 4} y={30 + r * 24} width={6} height={14} rx={1} fill={C.caramel} />
          </g>
        );
      })}
      <path d={`M380 50 q30 0 30 30 q0 30 -30 30`} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={easeOut(seg(t, 0.8, 1.2))} />
      <T x={418} y={84} s={12} f={C.caramel} o={easeOut(seg(t, 0.8, 1.2))}>loop on the larger</T>
      <g opacity={easeOut(seg(t, 0.5, 0.9))}>
        <rect x={470} y={120} width={30} height={132} rx={3} fill="none" stroke={C.latte} />
        <rect x={472} y={250} width={26} height={1} fill={C.caramel} />
        <T x={485} y={272} s={12} a="middle" f={C.caramel}>depth 0</T>
      </g>
      <line x1={462} y1={lerp(250, 120, bound)} x2={508} y2={lerp(250, 120, bound)} stroke={C.cherryText} strokeWidth={1.6} opacity={bound} />
      <T x={455} y={124} s={12} a="end" f={C.cherryText} o={bound}>bound 22</T>
      <T x={60} y={240} s={12} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>recurse on the smaller side, loop on the larger</T>
    </Svg>
  );
}

// 7 · Random pivot. Many runs land as dots scattered around the formula's line (shape: each run is seed-dependent);
// their average slides in: 10,977 measured against the formula's 10,986, a 0.999 ratio. Expected, over the coin flips.
export function RandomPivot({ t }: StepCtx) {
  const DOTS = Array.from({ length: 40 }, (_, i) => {
    const r = Math.sin(i * 12.9898) * 43758.5453;
    const u = r - Math.floor(r);
    const r2 = Math.sin(i * 78.233) * 12543.123;
    const u2 = r2 - Math.floor(r2);
    return [70 + i * 11.5, 130 + (u + u2 - 1) * 46] as [number, number];
  });
  const line = easeOut(seg(t, 0.2, 0.6));
  const avg = easeInOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="Many random-pivot runs land as dots scattered around the formula's line; their average lands at 10,977 against the formula's 10,986, a ratio of 0.999" h={300}>
      <line x1={60} y1={130} x2={540} y2={130} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="6 4" opacity={line} />
      <T x={540} y={120} s={12} a="end" f={C.caramel} o={line}>formula 10,986</T>
      {DOTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.5} fill={C.crema} opacity={clamp((t - 0.5) / 1.4 * 40 - i, 0, 1) * (1 - avg * 0.6)} />
      ))}
      <line x1={60} y1={lerp(200, 131.5, avg)} x2={540} y2={lerp(200, 131.5, avg)} stroke={C.cinnamon} strokeWidth={2} opacity={avg} />
      <T x={60} y={226} s={12} f={C.cinnamon} o={avg}>measured average 10,977 (ratio 0.999)</T>
      <T x={60} y={260} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>expected: averaged over the coin flips, any input</T>
    </Svg>
  );
}

// 8 · Median of three. A sorted row and a reversed row; first, middle and last light up; their median is the true middle
// key, the pivot. Measured on 256 keys: sorted 1,802 and reversed 2,857 comparisons, both far under the 4,096 ceiling.
export function MedianOfThree({ t }: StepCtx) {
  const X = (i: number) => 120 + i * 40;
  const ROWS: { lab: string; vals: number[]; y: number }[] = [
    { lab: 'sorted', vals: [1, 2, 3, 4, 5, 6, 7, 8, 9], y: 30 },
    { lab: 'reversed', vals: [9, 8, 7, 6, 5, 4, 3, 2, 1], y: 90 },
  ];
  const pick = easeOut(seg(t, 0.6, 1.0));
  const med = easeOut(seg(t, 1.2, 1.6));
  const bars = easeOut(seg(t, 2.0, 2.8));
  const W = (v: number) => (v / 4096) * 380;
  return (
    <Svg label="On a sorted and a reversed row, first, middle and last are sampled and their median is the true middle key. Measured on 256 keys: sorted 1,802 and reversed 2,857 comparisons, both far under a loose ceiling of 4,096" h={300}>
      {ROWS.map((r) => (
        <g key={r.lab}>
          <T x={30} y={r.y + 18} s={12} f={C.latte}>{r.lab}</T>
          {r.vals.map((v, i) => {
            const sampled = i === 0 || i === 4 || i === 8;
            const isMed = i === 4;
            return <Cell key={i} x={X(i)} y={r.y} v={v} w={30} c={isMed && med > 0.5 ? C.caramel : sampled && pick > 0.5 ? C.cinnamon : C.crema} fill={isMed && med > 0.5} />;
          })}
        </g>
      ))}
      <g opacity={bars}>
        <T x={30} y={166} s={12} f={C.latte}>256 keys, comparisons</T>
        <rect x={120} y={176} width={W(4096) * bars} height={14} rx={2} fill="none" stroke={C.taupe} strokeDasharray="4 3" />
        <T x={120 + W(4096)} y={170} s={12} a="end" f={C.taupe}>ceiling 4,096</T>
        <rect x={120} y={200} width={W(1802) * bars} height={14} rx={2} fill={C.crema} />
        <T x={30} y={212} s={12} f={C.crema}>sorted</T>
        <T x={128 + W(1802)} y={212} s={12} f={C.crema}>1,802</T>
        <rect x={120} y={224} width={W(2857) * bars} height={14} rx={2} fill={C.cinnamon} />
        <T x={30} y={236} s={12} f={C.cinnamon}>reversed</T>
        <T x={128 + W(2857)} y={236} s={12} f={C.cinnamon}>2,857</T>
      </g>
    </Svg>
  );
}

// 9 · Predict. The killer input at 16 keys: 0, 2, 4, ... 14 then 1, 3, ... 15, two ascending runs. First, middle and
// last are sampled. After answering: their median is 14, one of the largest keys, and the split is lopsided: 14 keys
// on one side, 1 on the other.
const KILL = [...Array.from({ length: 8 }, (_, i) => i * 2), ...Array.from({ length: 8 }, (_, i) => i * 2 + 1)];
export function PredictMo3Killer({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X = (i: number) => 30 + i * 34;
  const a = easeOut(seg(t, 0.1, 0.6));
  const pick = easeOut(seg(t, 0.8, 1.2));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const med = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const split = answered ? easeInOut(seg(s, 0.7, 1.4)) : 0;
  const order = [...KILL].sort((x, y) => (x < 14 ? 0 : x === 14 ? 1 : 2) - (y < 14 ? 0 : y === 14 ? 1 : 2));
  return (
    <Svg label="Two ascending runs stitched together, 0, 2, 4 up to 14 then 1, 3 up to 15; first, middle and last are sampled. After answering: their median is 14, so the split leaves 14 keys on one side and 1 on the other" h={300}>
      {KILL.map((v, i) => {
        const sampled = i === 0 || i === 7 || i === 15;
        const tgt = order.indexOf(v);
        return <Cell key={v} x={lerp(X(i), X(tgt), split)} y={60} v={v} w={28} o={a} c={v === 14 && med > 0.5 ? C.caramel : sampled && pick > 0.5 ? C.cinnamon : i < 8 ? C.crema : C.latte} fill={v === 14 && med > 0.5} />;
      })}
      <path d={`M${X(0)} 98 L${X(0)} 106 L${X(7) + 28} 106 L${X(7) + 28} 98`} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={a * (1 - split)} />
      <path d={`M${X(8)} 98 L${X(8)} 106 L${X(15) + 28} 106 L${X(15) + 28} 98`} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={a * (1 - split)} />
      {!answered && <T x={300} y={250} s={14} a="middle" f={C.caramel} o={pulse * a}>can anything defeat it?</T>}
      {answered && <T x={X(6)} y={140} s={12} a="middle" f={C.cherryText} o={split}>14 keys</T>}
      {answered && <T x={X(15) + 14} y={140} s={12} a="middle" f={C.cherryText} o={split}>1</T>}
      {answered && <T x={300} y={250} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.4, 1.8))}>yes: two sorted runs, stitched</T>}
    </Svg>
  );
}

// 10 · The killer, measured. At 512 keys: 66,048 comparisons against random input's 4,902, 13.5 times. Then cost / n²
// for n = 128, 256, 512, 1,024: 0.258, 0.254, 0.252, 0.251, four bars at the same height: quadratic.
export function Mo3Killer({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const H = (v: number) => v * 480;
  const RAT: [string, number][] = [
    ['128', 0.258],
    ['256', 0.254],
    ['512', 0.252],
    ['1,024', 0.251],
  ];
  return (
    <Svg label="At 512 keys the killer input costs 66,048 comparisons against 4,902 for random input, 13.5 times; cost divided by n squared stays flat at about a quarter, 0.258, 0.254, 0.252, 0.251, from 128 to 1,024 keys" h={320}>
      <T x={30} y={26} s={12} f={C.latte}>512 keys, comparisons</T>
      <rect x={130} y={38} width={400 * a} height={14} rx={2} fill={C.cherryText} opacity={0.85} />
      <T x={30} y={50} s={12} f={C.cherryText}>killer</T>
      <T x={530} y={70} s={12} a="end" f={C.cherryText} o={a}>66,048</T>
      <rect x={130} y={80} width={Math.max(3, 400 * (4902 / 66048)) * a} height={14} rx={2} fill={C.crema} />
      <T x={30} y={92} s={12} f={C.crema}>random</T>
      <T x={170} y={92} s={12} f={C.crema} o={a}>4,902 (13.5×)</T>
      <T x={30} y={128} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.8))}>cost ÷ n², by size</T>
      {RAT.map(([n, r], i) => {
        const g = easeOutBack(seg(t, 1.6 + i * 0.35, 2.1 + i * 0.35));
        const x = 150 + i * 100;
        return (
          <g key={n}>
            <rect x={x} y={290 - H(r) * clamp(g, 0, 1.05)} width={44} height={H(r) * clamp(g, 0, 1.05)} rx={2} fill={C.cherryText} opacity={0.8} />
            <T x={x + 22} y={290 - H(r) - 8} s={12} a="middle" f={C.cherryText} o={clamp(g, 0, 1)}>{r.toFixed(3)}</T>
            <T x={x + 22} y={308} s={12} a="middle" f={C.latte} o={clamp(g, 0, 1)}>{n}</T>
          </g>
        );
      })}
      <line x1={140} y1={290 - H(0.25)} x2={560} y2={290 - H(0.25)} stroke={C.caramel} strokeDasharray="5 4" opacity={easeOut(seg(t, 3.4, 3.8))} />
      <T x={230} y={128} s={12} f={C.caramel} o={easeOut(seg(t, 3.6, 4.0))}>flat: quadratic</T>
    </Svg>
  );
}

// 11 · Three-way. Ten four-valued keys from examples.py's input around pivot 3 (the first key): lt grows from the left, gt from the right, i sweeps between;
// the equal keys gather in the middle, done. Then four distinct values: Lomuto 132,498, Hoare 12,509, three-way 2,528;
// and random distinct keys: three-way 10,845 swaps against Hoare 2,376.
function threeWayFrames(vals: number[]): Frame[] {
  const ids = vals.map((_, i) => i);
  const p = vals[0];
  let lt = 0;
  let i = 0;
  let gt = vals.length - 1;
  const out: Frame[] = [];
  while (i <= gt) {
    const v = vals[ids[i]];
    if (v < p) {
      [ids[lt], ids[i]] = [ids[i], ids[lt]];
      lt++;
      i++;
    } else if (v > p) {
      [ids[i], ids[gt]] = [ids[gt], ids[i]];
      gt--;
    } else i++;
    out.push({ ids: [...ids], cur: { lt, i, gt } });
  }
  return out;
}
export function ThreeWay({ t }: StepCtx) {
  // Keys 2-11 of examples.py's four_distinct_values (seed 50); the pivot is the first, 3.
  const ROW = [3, 3, 2, 4, 3, 1, 3, 2, 1, 2];
  const X = (i: number) => 60 + i * 50;
  const frames = threeWayFrames(ROW);
  const k = clamp((t - 0.3) / 0.16, -1, frames.length - 1);
  const cur = frames[Math.max(0, Math.min(Math.floor(k), frames.length - 1))].cur;
  const bars = easeOut(seg(t, 2.6, 3.4));
  const W = (v: number) => Math.max(3, (v / 132498) * 360);
  return (
    <Svg label="A three-way partition of four-valued keys around 3: lt grows from the left, gt from the right, and every key equal to the pivot gathers in the middle, done. On four distinct values: Lomuto 132,498, Hoare 12,509, three-way 2,528 comparisons; on random distinct keys three-way makes 10,845 swaps against Hoare's 2,376" h={300}>
      <Play vals={ROW} frames={frames} k={k} X={X} y={40} pivotId={-1} colour={(id) => (ROW[id] === 3 ? C.caramel : ROW[id] < 3 ? C.crema : C.cinnamon)} />
      {k >= 0 && (
        <g>
          <Arrow x={X(cur.lt) + 15} y={96} label="lt" up c={C.crema} />
          <Arrow x={X(Math.min(cur.i, ROW.length - 1)) + 15} y={30} label="i" c={C.caramel} />
          <Arrow x={X(Math.max(cur.gt, 0)) + 15} y={96} label="gt" up c={C.cinnamon} />
        </g>
      )}
      <g opacity={bars}>
        <T x={30} y={166} s={12} f={C.latte}>four distinct values, 1,024 keys</T>
        {(
          [
            ['Lomuto', 132498, '132,498', C.cherryText],
            ['Hoare', 12509, '12,509', C.cinnamon],
            ['three-way', 2528, '2,528', C.caramel],
          ] as [string, number, string, string][]
        ).map(([n, v, lab, c], i) => (
          <g key={n}>
            <T x={30} y={190 + i * 22} s={12} f={c}>{n}</T>
            <rect x={130} y={179 + i * 22} width={W(v) * bars} height={12} rx={2} fill={c} opacity={0.85} />
            <T x={140 + W(v)} y={190 + i * 22} s={12} f={c}>{lab}</T>
          </g>
        ))}
      </g>
      <T x={30} y={268} s={12} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>random distinct keys, swaps:</T>
      <T x={30} y={290} s={12} f={C.cherryText} o={easeOut(seg(t, 3.7, 4.1))}>three-way 10,845 · Hoare 2,376</T>
    </Svg>
  );
}

// 12 · Dual pivot. Two pivots lift out of a row and the keys part three ways: below the first, between, above the
// second. Then the JDK's own source, line by line: a recursion depth limit falling back to heap sort, a run check, a
// counting sort. Then the papers' own words: 1.9n ln n against 2.0n ln n; three pivots about 7-8% faster.
export function DualPivot({ t }: StepCtx) {
  const ROW = DECK.slice(0, 10);
  const P1 = 3;
  const P2 = 9;
  const X = (i: number) => 60 + i * 50;
  const part = easeInOut(seg(t, 0.5, 1.5));
  const grp = (v: number) => (v < P1 ? 0 : v <= P2 ? 1 : 2);
  const sorted = ROW.map((v, i) => [v, i]).sort((a, b) => grp(a[0]) - grp(b[0]) || a[1] - b[1]);
  const LINES = ['MAX_RECURSION_DEPTH = 64 * DELTA', 'heapSort(...): the fallback', 'tryMergeRuns(...): runs', 'countingSort(...): small ranges'];
  return (
    <Svg label="Two pivots split a row three ways. The JDK's own DualPivotQuicksort source carries a recursion depth limit with a heap sort fallback, a check for existing runs, and counting sort; the papers report 1.9n ln n against 2.0n ln n comparisons, and three pivots about 7 to 8 percent faster" h={300}>
      {ROW.map((v, i) => {
        const tgt = sorted.findIndex(([, j]) => j === i);
        const isP = (v === P1 && i === 1) || (v === P2 && i === 2);
        return <Cell key={i} x={lerp(X(i), X(tgt) + grp(v) * 6, part)} y={40} v={v} w={30} c={isP ? C.caramel : [C.crema, C.latte, C.cinnamon][grp(v)]} fill={isP} />;
      })}
      <T x={300} y={96} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>below · between · above: three parts</T>
      {LINES.map((l, i) => (
        <T key={l} x={40} y={136 + i * 22} s={12} f={C.crema} o={easeOut(seg(t, 1.8 + i * 0.3, 2.1 + i * 0.3))}>{l}</T>
      ))}
      <T x={40} y={236} s={12} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>JDK source, read directly</T>
      <g opacity={easeOut(seg(t, 3.4, 3.8))}>
        <T x={40} y={264} s={12} f={C.caramel}>"1.9n ln n vs 2.0n ln n"</T>
        <T x={40} y={288} s={12} f={C.caramel}>3 pivots: "about 7-8% faster"</T>
      </g>
    </Svg>
  );
}

// 13 · Block partition. A block of elements is compared against the pivot in one sweep, each outcome written into a
// buffer cell (no branch on the result); then the swaps replay from the buffer. The paper proposes blocks of 128 and
// reports "80% over ... std::sort".
export function BlockPartition({ t }: StepCtx) {
  const BLK = DECK.slice(0, 12);
  const P = 6;
  const X = (i: number) => 40 + i * 44;
  const cmp = clamp((t - 0.3) / 1.2, 0, 1) * BLK.length;
  const replay = easeInOut(seg(t, 1.9, 2.9));
  const big = BLK.map((v, i) => [v, i]).filter(([v]) => v > P).map(([, i]) => i);
  return (
    <Svg label="A block of keys is compared against the pivot in one sweep, each outcome stored in a buffer with no branch on it; the swaps then replay from the buffer. The paper proposes blocks of 128 elements and reports 80 percent faster than GCC's std::sort" h={300}>
      <T x={40} y={26} s={12} f={C.latte}>a block, pivot {P}</T>
      {BLK.map((v, i) => {
        const done = i < cmp;
        return (
          <g key={i}>
            <Cell x={X(i)} y={lerp(40, 40 + (v > P ? 0 : 0), replay)} v={v} w={34} c={done ? (v > P ? C.cinnamon : C.crema) : C.latte} />
            <rect x={X(i) + 7} y={86} width={20} height={20} rx={2} fill={done ? (v > P ? C.cinnamon : C.roast) : 'none'} stroke={C.latte} strokeWidth={1} />
            <T x={X(i) + 17} y={101} s={12} a="middle" f={v > P ? C.espresso : C.crema} o={done ? 1 : 0}>{v > P ? '1' : '0'}</T>
          </g>
        );
      })}
      <T x={220} y={26} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>outcomes buffered, no branch</T>
      {big.map((i, k) => (
        <path key={i} d={`M${X(i) + 17} 112 Q${X(i) + 17} ${150 + k * 6} ${X(BLK.length - 1 - k) + 17} 112`} fill="none" stroke={C.cinnamon} strokeWidth={1.2} opacity={replay * (i < BLK.length - 1 - k ? 1 : 0)} />
      ))}
      <T x={40} y={210} s={12} f={C.cinnamon} o={easeOut(seg(t, 2.4, 2.8))}>then the swaps replay from the buffer</T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <T x={40} y={248} s={12} f={C.crema}>proposed block: 128 elements</T>
        <T x={40} y={272} s={12} f={C.caramel}>"80% over ... std::sort"</T>
      </g>
    </Svg>
  );
}

// 14 · Recap. The three counts on 1,024 equal keys again; every fix (random, median of three, a depth counter) chips in
// beside the danger; then a heap triangle forms: heapsort, next.
export function Recap({ t }: StepCtx) {
  const bars = easeOut(seg(t, 0.2, 0.9));
  const FIX = ['random pivot', 'median of three', 'depth limit'];
  const heap = easeOutBack(seg(t, 2.6, 3.2));
  const W = (v: number) => Math.max(3, (v / 523776) * 330);
  return (
    <Svg label="On 1,024 equal keys: Lomuto 523,776, Hoare 12,286, three-way 1,024 comparisons. Random pivots, median of three and a depth limit all guard the same danger; heapsort, next" h={300}>
      {(
        [
          ['Lomuto', 523776, '523,776', C.cherryText],
          ['Hoare', 12286, '12,286', C.cinnamon],
          ['three-way', 1024, '1,024', C.caramel],
        ] as [string, number, string, string][]
      ).map(([n, v, lab, c], i) => (
        <g key={n}>
          <T x={30} y={40 + i * 26} s={12} f={c} o={bars}>{n}</T>
          <rect x={130} y={29 + i * 26} width={W(v) * bars} height={13} rx={2} fill={c} opacity={0.85} />
          <T x={140 + W(v)} y={40 + i * 26} s={12} f={c} o={bars}>{lab}</T>
        </g>
      ))}
      {FIX.map((f, i) => (
        <g key={f} opacity={easeOutBack(seg(t, 1.2 + i * 0.35, 1.6 + i * 0.35)) > 0 ? clamp(easeOutBack(seg(t, 1.2 + i * 0.35, 1.6 + i * 0.35)), 0, 1) : 0}>
          <rect x={30 + i * 180} y={130} width={160} height={28} rx={14} fill="none" stroke={C.crema} strokeWidth={1.3} />
          <T x={110 + i * 180} y={149} s={12} a="middle" f={C.crema}>{f}</T>
        </g>
      ))}
      <g opacity={clamp(heap, 0, 1)} transform={`translate(0 ${lerp(20, 0, clamp(heap, 0, 1))})`}>
        {(
          [
            [300, 190],
            [260, 220],
            [340, 220],
            [240, 250],
            [280, 250],
          ] as [number, number][]
        ).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={9} fill={C.roast} stroke={C.caramel} strokeWidth={1.4} />
        ))}
        <T x={380} y={226} s={13} f={C.caramel}>heapsort, next</T>
      </g>
    </Svg>
  );
}
