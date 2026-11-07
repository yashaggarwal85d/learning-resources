import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key at rest; latte = secondary labels; taupe = keys not yet touched;
// caramel = the thing to look at (the root being pulled, the sift-down path, the depth counter); cinnamon (rare) = the
// alternative compared (quicksort's own recursion, merge sort's bound); cherryText = the bad outcome (a reordered equal
// key, a cache-line miss, the quadratic danger).
// Every printed number is examples.py's: the deck (n = 16) builds with 24 comparisons, 84 in all; on 1,024 keys build
// 1,887, random 17,316, sorted 18,060, reversed 16,407; the floor ceil(lg n!) = 8,770, merge sort's worst case 9,217;
// ratios 1.97x, 2.06x, 1.87x; at most 2*ceil(lg n) = 20 comparisons per sift-down; a heap of 1,048,576 keys, 8 keys per
// 64-byte line, average path 20.0 nodes touching 17.9 distinct lines; the tagged deck's 3s go a, c, f -> c, a, f. The
// libstdc++, JDK and Rust lines are quoted from SOURCES.md. Traces on the deck are computed here by examples.py's rules.

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

/** One frame of a heapsort trace: element ids in slot order, the slot being sifted, and the live heap size. */
type Frame = { ids: number[]; hot: number; end: number };

/** examples.py's heapsort, recording a frame after every swap. Returns the build frames and the sort frames. */
function heapTrace(vals: number[]) {
  const ids = vals.map((_, i) => i);
  const n = vals.length;
  const build: Frame[] = [];
  const sort: Frame[] = [];
  const sift = (start: number, end: number, out: Frame[]) => {
    let i = start;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let g = i;
      if (l < end && vals[ids[g]] < vals[ids[l]]) g = l;
      if (r < end && vals[ids[g]] < vals[ids[r]]) g = r;
      if (g === i) break;
      [ids[i], ids[g]] = [ids[g], ids[i]];
      i = g;
      out.push({ ids: [...ids], hot: i, end });
    }
  };
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    build.push({ ids: [...ids], hot: i, end: n });
    sift(i, n, build);
  }
  for (let end = n - 1; end > 0; end--) {
    [ids[0], ids[end]] = [ids[end], ids[0]];
    sort.push({ ids: [...ids], hot: 0, end });
    sift(0, end, sort);
  }
  return { build, sort, start: vals.map((_, i) => i) };
}

/** Slot of element `id` at fractional frame k: slides between consecutive frames. */
function slotAt(frames: Frame[], first: number[], k: number, id: number) {
  const f0 = Math.floor(k);
  const A = f0 < 0 ? first : frames[Math.min(f0, frames.length - 1)].ids;
  const B = frames[clamp(f0 + 1, 0, frames.length - 1)].ids;
  const s0 = A.indexOf(id);
  const s1 = k < 0 || f0 >= frames.length - 1 ? s0 : B.indexOf(id);
  return { s0, s1, fr: easeInOut(clamp(k - f0, 0, 1)) };
}

function Cell({ x, y, v, c = C.crema, o = 1, w = 30, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 18} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

/** Tree position of heap slot i (levels 0-4, sixteen slots). */
function treeXY(i: number): [number, number] {
  const L = Math.floor(Math.log2(i + 1));
  const j = i + 1 - 2 ** L;
  return [30 + ((j + 0.5) * 540) / 2 ** L, 40 + L * 50];
}

// 1 · Opening. A quicksort recursion on a crafted input deepens round after round, each range one key shorter, the
// work piling up red; a question over the promise; then a heap forms beside it: n log n, in place, no spare array.
export function Opening({ t }: StepCtx) {
  const deep = clamp((t - 0.2) / 1.6, 0, 1) * 8;
  const heap = easeOutBack(seg(t, 2.2, 2.8));
  const HEAP: [number, number][] = [
    [440, 120],
    [400, 160],
    [480, 160],
    [380, 200],
    [420, 200],
    [460, 200],
    [500, 200],
  ];
  return (
    <Svg label="A quicksort recursion on a crafted input deepens round after round, each range just one key shorter, the work piling up toward quadratic; then a heap forms beside it, promising n log n in place" h={280}>
      <T x={40} y={36} s={12} f={C.cinnamon}>quicksort, crafted input</T>
      {Array.from({ length: 8 }, (_, d) => (
        <rect key={d} x={40 + d * 8} y={52 + d * 24} width={(260 - d * 16) * clamp(deep - d, 0, 1)} height={14} rx={2} fill="none" stroke={d < 3 ? C.cinnamon : C.cherryText} strokeWidth={1.4} />
      ))}
      <T x={40} y={262} s={12} f={C.cherryText} o={easeOut(seg(t, 1.6, 2.0))}>depth n: quadratic</T>
      <g opacity={clamp(heap, 0, 1)} transform={`translate(0 ${lerp(16, 0, clamp(heap, 0, 1))})`}>
        {[
          [0, 1],
          [0, 2],
          [1, 3],
          [1, 4],
          [2, 5],
          [2, 6],
        ].map(([p, c]) => (
          <path key={`${p}-${c}`} d={`M${HEAP[p][0]} ${HEAP[p][1]} L${HEAP[c][0]} ${HEAP[c][1]}`} stroke={C.latte} strokeWidth={1.2} />
        ))}
        {HEAP.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={10} fill={C.roast} stroke={i === 0 ? C.caramel : C.crema} strokeWidth={1.5} />
        ))}
        <T x={440} y={240} s={13} a="middle" f={C.caramel}>n log n, in place</T>
      </g>
    </Svg>
  );
}

// 2 · Predict. The floor, 8,770 comparisons at 1,024 keys, grows; a dashed heapsort bar pulses with a question. After
// answering: heapsort's 17,316 grows, and two copies of the floor stack beside it, nearly level: 1.97 times.
export function PredictRatio({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const H = (v: number) => v / 100;
  const floor = easeOut(seg(t, 0.2, 1.0));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const grow = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const stack = answered ? easeOutBack(seg(s, 1.0, 1.6)) : 0;
  const base = 230;
  return (
    <Svg label="The floor at 1,024 keys is 8,770 comparisons; heapsort's bar is a question. After answering, heapsort's 17,316 rises to nearly two copies of the floor stacked: 1.97 times" h={290}>
      <T x={300} y={24} s={12} a="middle" f={C.latte}>1,024 random keys, comparisons</T>
      <rect x={140} y={base - H(8770) * floor} width={70} height={H(8770) * floor} rx={2} fill={C.taupe} opacity={0.6} />
      <T x={175} y={base + 18} s={12} a="middle" f={C.latte}>floor</T>
      <T x={175} y={base - H(8770) - 8} s={12} a="middle" f={C.crema} o={floor}>8,770</T>
      {!answered && <rect x={300} y={base - H(17316)} width={70} height={H(17316)} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="5 4" opacity={pulse} />}
      {!answered && <T x={335} y={base - H(8770)} s={18} a="middle" f={C.caramel} o={pulse}>?</T>}
      {answered && <rect x={300} y={base - H(17316) * grow} width={70} height={H(17316) * grow} rx={2} fill={C.caramel} opacity={0.85} />}
      <T x={335} y={base + 18} s={12} a="middle" f={C.latte}>heapsort</T>
      {answered && <T x={335} y={base - H(17316) - 8} s={12} a="middle" f={C.caramel} o={grow}>17,316</T>}
      {answered &&
        [0, 1].map((k) => (
          <rect key={k} x={400} y={base - H(8770) * (k + 1) * clamp(stack, 0, 1.05)} width={40} height={H(8770) * clamp(stack, 0, 1.05)} rx={2} fill="none" stroke={C.latte} strokeWidth={1.3} />
        ))}
      {answered && <T x={450} y={base - H(8770) + 4} s={12} f={C.latte} o={clamp(stack, 0, 1)}>× 2</T>}
      {answered && <T x={300} y={278} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.6, 2.0))}>1.97 times the floor</T>}
    </Svg>
  );
}

// 3 · Build the max-heap. The deck as a tree; every non-leaf, from the last one back to the root, lights up and sifts
// down, swapping with its larger child until both children are smaller: 24 comparisons for these 16 keys, 1,887 for
// 1,024.
const BUILD = heapTrace(DECK);
export function BuildHeap({ t }: StepCtx) {
  const F = BUILD.build;
  const k = clamp((t - 0.3) / 0.13, -1, F.length - 1);
  const cur = F[clamp(Math.floor(k), 0, F.length - 1)];
  const done = t > 0.3 + 0.13 * F.length;
  const edges = Array.from({ length: 15 }, (_, i) => i + 1);
  return (
    <Svg label="The deck's sixteen keys as a tree. Every non-leaf from the last one back to the root sifts down, swapping with its larger child, until every parent is at least as large as its children: 24 comparisons here, 1,887 on 1,024 keys" h={300}>
      {edges.map((c) => {
        const [x1, y1] = treeXY(Math.floor((c - 1) / 2));
        const [x2, y2] = treeXY(c);
        return <path key={c} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={C.mocha} strokeWidth={1.2} />;
      })}
      {DECK.map((v, id) => {
        const { s0, s1, fr } = slotAt(F, BUILD.start, k, id);
        const [x0, y0] = treeXY(s0);
        const [x1, y1] = treeXY(s1);
        const hot = !done && k >= 0 && s0 === cur.hot;
        return (
          <g key={id}>
            <circle cx={lerp(x0, x1, fr)} cy={lerp(y0, y1, fr)} r={15} fill={C.roast} stroke={hot ? C.caramel : done ? C.crema : C.latte} strokeWidth={hot ? 2 : 1.4} />
            <T x={lerp(x0, x1, fr)} y={lerp(y0, y1, fr) + 4} s={12} a="middle" f={hot ? C.caramel : C.crema}>{v}</T>
          </g>
        );
      })}
      <T x={300} y={278} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 0.3 + 0.13 * F.length, 0.7 + 0.13 * F.length))}>16 keys: 24 comparisons · 1,024 keys: 1,887</T>
    </Svg>
  );
}

// 4 · Swap, shrink, sift. The built heap as an array. Round after round the root swaps to the end of the live range,
// the range shrinks by one, and the new root sifts down; the sorted suffix grows from the right, slowly at first and
// then fast, in the same sixteen cells.
export function SwapShrinkSift({ t }: StepCtx) {
  const F = BUILD.sort;
  const first = BUILD.build[BUILD.build.length - 1].ids;
  const p = clamp((t - 0.3) / 3.8, 0, 1);
  const k = p * p * (F.length - 1) - (p === 0 ? 1 : 0);
  const cur = F[clamp(Math.floor(k), 0, F.length - 1)];
  const end = k < 0 ? 16 : k >= F.length - 1 ? 0 : cur.end;
  const X = (i: number) => 30 + i * 34;
  return (
    <Svg label="The built heap as an array. Each round the root swaps to the end of the live range, the range shrinks by one and the new root sifts down; the sorted suffix grows from the right in the same sixteen cells, with no second array" h={240}>
      <T x={30} y={40} s={12} f={C.caramel}>heap</T>
      <T x={X(15) + 28} y={40} s={12} a="end" f={C.crema} o={end < 16 ? 1 : 0}>sorted</T>
      {DECK.map((v, id) => {
        const { s0, s1, fr } = slotAt(F, first, k, id);
        const moving = s0 !== s1;
        const sorted = s0 >= end;
        const x = lerp(X(s0), X(s1), fr);
        const y = 90 - (moving ? Math.sin(fr * Math.PI) * 26 * (s1 > s0 ? 1 : -1) : 0);
        return <Cell key={id} x={x} y={y} v={v} w={28} c={sorted ? C.crema : s0 === 0 || moving ? C.caramel : C.latte} fill={sorted} />;
      })}
      {end > 0 && <path d={`M${X(0)} 152 L${X(0)} 160 L${X(end - 1) + 28} 160 L${X(end - 1) + 28} 152`} fill="none" stroke={C.caramel} strokeWidth={1.3} />}
      {end < 16 && <path d={`M${X(end)} 152 L${X(end)} 160 L${X(15) + 28} 160 L${X(15) + 28} 152`} fill="none" stroke={C.crema} strokeWidth={1.3} />}
      <T x={300} y={196} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>root to the end, shrink, sift down</T>
      <T x={300} y={222} s={12} a="middle" f={C.crema} o={easeOut(seg(t, 3.9, 4.3))}>same sixteen cells: no second array</T>
    </Svg>
  );
}

// 5 · Three shapes. Under each bar a glyph of its input (scattered, rising, falling); the bars rise one by one to
// 17,316, 18,060 and 16,407 comparisons, then a band from the lowest to the highest shows how close they sit.
export function ThreeShapes({ t }: StepCtx) {
  const ROWS: [string, number, string, number[]][] = [
    ['random', 17316, '17,316', [5, 2, 7, 1, 6, 3, 8, 4]],
    ['sorted', 18060, '18,060', [1, 2, 3, 4, 5, 6, 7, 8]],
    ['reversed', 16407, '16,407', [8, 7, 6, 5, 4, 3, 2, 1]],
  ];
  const H = (v: number) => v / 110;
  const base = 210;
  const band = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="Heapsort on 1,024 keys: random 17,316 comparisons, sorted 18,060, reversed 16,407; three very different inputs, three nearly equal bars" h={290}>
      <rect x={95} y={base - H(18060)} width={420 * band} height={H(18060) - H(16407)} fill={C.caramel} opacity={0.18} />
      {ROWS.map(([lab, v, txt, glyph], i) => {
        const g = easeOut(seg(t, 0.4 + i * 0.6, 1.1 + i * 0.6));
        const x = 110 + i * 150;
        return (
          <g key={lab}>
            {glyph.map((h, j) => (
              <rect key={j} x={x + j * 9} y={272 - h * 3} width={6} height={h * 3} fill={C.latte} opacity={easeOut(seg(t, 0.1 + i * 0.6, 0.5 + i * 0.6))} />
            ))}
            <rect x={x} y={base - H(v) * g} width={70} height={H(v) * g} rx={2} fill={C.crema} opacity={0.8} />
            <T x={x + 35} y={base - H(v) - 8} s={12} a="middle" f={C.crema} o={g}>{txt}</T>
            <T x={x + 35} y={base + 18} s={12} a="middle" f={C.latte} o={g}>{lab}</T>
          </g>
        );
      })}
      <T x={300} y={20} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>all within a fifth of each other</T>
    </Svg>
  );
}

// 6 · Against the bounds. Three bars rise: the floor 8,770, merge sort's worst case 9,217, heapsort 17,316. Two copies
// of the floor lay end to end under heapsort's bar; then the ratios 1.97, 2.06, 1.87; then why: one sift-down makes at
// most 2 comparisons on each of 10 levels, 20.
export function AgainstBounds({ t }: StepCtx) {
  const W = (v: number) => v / 50;
  const ROWS: [string, number, string, string][] = [
    ['floor', 8770, '8,770', C.latte],
    ['merge sort', 9217, '9,217', C.cinnamon],
    ['heapsort', 17316, '17,316', C.caramel],
  ];
  const twice = easeInOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="At 1,024 keys: the floor is 8,770 comparisons, merge sort's worst case 9,217, heapsort 17,316, about two floors end to end: 1.97, 2.06 and 1.87 times on random, sorted and reversed input, because each sift-down makes at most 2 comparisons on each of 10 levels" h={300}>
      {ROWS.map(([lab, v, txt, c], i) => {
        const g = easeOut(seg(t, 0.2 + i * 0.4, 0.9 + i * 0.4));
        return (
          <g key={lab}>
            <T x={30} y={44 + i * 34} s={12} f={c}>{lab}</T>
            <rect x={130} y={32 + i * 34} width={W(v) * g} height={14} rx={2} fill={c} opacity={0.85} />
            <T x={136 + W(v)} y={44 + i * 34} s={12} f={c} o={g}>{txt}</T>
          </g>
        );
      })}
      {[0, 1].map((k) => (
        <rect key={k} x={lerp(130, 130 + k * W(8770), twice)} y={lerp(32, 118, twice)} width={W(8770)} height={10} rx={2} fill="none" stroke={C.latte} strokeWidth={1.3} opacity={twice > 0 ? 1 : 0} />
      ))}
      <g opacity={easeOut(seg(t, 2.5, 2.9))}>
        <T x={30} y={170} s={12} f={C.latte}>heapsort ÷ floor</T>
        <T x={30} y={192} s={12} f={C.caramel}>random 1.97× · sorted 2.06× · reversed 1.87×</T>
      </g>
      <g opacity={easeOut(seg(t, 3.3, 3.7))}>
        <T x={30} y={240} s={12} f={C.crema}>one sift-down: at most 2 per level</T>
        {Array.from({ length: 10 }, (_, i) => (
          <rect key={i} x={30 + i * 22} y={254} width={16} height={12} rx={2} fill={C.caramel} opacity={easeOut(seg(t, 3.5 + i * 0.05, 3.7 + i * 0.05)) * 0.8} />
        ))}
        <T x={260} y={265} s={12} f={C.caramel} o={easeOut(seg(t, 4.0, 4.3))}>× 2 = 20</T>
      </g>
    </Svg>
  );
}

// 7 · Poor locality. Memory drawn to scale for the first 64 slots, cut into 64-byte lines of 8 keys. A sift-down's path
// hops from index i to about 2i: the first hops stay inside line 0, then every hop lands on a new line. Below, the
// tally on a heap of 1,048,576 keys: 20.0 nodes per path, 17.9 distinct lines, against a scan of 20 keys, a few lines.
export function CacheLines({ t }: StepCtx) {
  const PATH = [0, 1, 3, 7, 15, 31, 63];
  const X = (i: number) => 40 + i * 8;
  const hops = clamp((t - 0.4) / 2.0, 0, 1) * (PATH.length - 1);
  const tally = clamp((t - 2.6) / 1.4, 0, 1) * 20;
  return (
    <Svg label="Memory to scale for the first 64 slots in 64-byte lines of 8 keys. A sift-down path hops from index i to about 2i; after the first few hops every hop lands on a new line. On a heap of 1,048,576 keys a path of 20.0 nodes touches 17.9 distinct lines on average; a scan of 20 keys would touch a few" h={300}>
      <T x={40} y={28} s={12} f={C.latte}>memory, 8 keys per 64-byte line</T>
      {Array.from({ length: 8 }, (_, l) => (
        <g key={l}>
          <rect x={X(l * 8)} y={90} width={62} height={20} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} />
          <rect x={X(l * 8)} y={90} width={62} height={20} rx={2} fill={C.cherryText} opacity={PATH.slice(4).some((p, j) => Math.floor(p / 8) === l && hops >= j + 4) ? 0.35 : l === 0 && hops >= 0 ? 0.15 : 0} />
        </g>
      ))}
      {PATH.map((p, j) => {
        if (j === 0) return <circle key={p} cx={X(p) + 4} cy={100} r={4} fill={C.caramel} />;
        const a = clamp(hops - (j - 1), 0, 1);
        const x0 = X(PATH[j - 1]) + 4;
        const x1 = X(p) + 4;
        const mid = (x0 + x1) / 2;
        const lift = Math.min(10 + (x1 - x0) * 0.35, 120);
        return (
          <g key={p}>
            <path d={`M${x0} 90 Q${mid} ${90 - lift} ${x1} 90`} fill="none" stroke={C.caramel} strokeWidth={1.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - a} opacity={a > 0 ? 1 : 0} />
            <circle cx={x1} cy={100} r={4} fill={j >= 4 ? C.cherryText : C.caramel} opacity={a >= 1 ? 1 : 0} />
          </g>
        );
      })}
      <T x={40} y={134} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>index i, then about 2i</T>
      <T x={40} y={160} s={12} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.7))}>each further hop: a new line</T>
      <T x={40} y={196} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>1,048,576 keys: a path of 20.0 nodes</T>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={40 + i * 26} y={206} width={20} height={14} rx={2} fill={i < 3 ? C.crema : C.cherryText} opacity={clamp(tally - i, 0, 1) * 0.85} />
      ))}
      <T x={40} y={244} s={12} f={C.cherryText} o={easeOut(seg(t, 4.0, 4.4))}>17.9 distinct lines on average</T>
      <g opacity={easeOut(seg(t, 4.3, 4.7))}>
        <T x={40} y={284} s={12} f={C.crema}>a scan of 20 keys:</T>
        {[0, 1, 2].map((l) => (
          <rect key={l} x={220 + l * 70} y={272} width={62} height={16} rx={2} fill="none" stroke={C.crema} strokeWidth={1.3} />
        ))}
      </g>
    </Svg>
  );
}

// 8 · Unstable. examples.py's tagged deck; the three 3s marked. The whole heapsort plays on it; the 3s are carried by
// distant swaps; at the end they read c, a, f where they went in a, c, f. No second row ever appears: in place.
const TAGGED: [number, string][] = [
  [3, 'a'],
  [7, 'b'],
  [3, 'c'],
  [1, 'd'],
  [9, 'e'],
  [3, 'f'],
  [5, 'g'],
  [2, 'h'],
];
const TAG = heapTrace(TAGGED.map(([v]) => v));
export function Unstable({ t }: StepCtx) {
  const F = [...TAG.build, ...TAG.sort];
  const k = clamp((t - 0.6) / (2.4 / F.length), -1, F.length - 1);
  const X = (i: number) => 60 + i * 62;
  const end = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="The tagged deck: 3a 7b 3c 1d 9e 3f 5g 2h. Heapsort runs on it in place; the three 3s are carried by distant swaps and come out c, a, f, where they went in a, c, f" h={240}>
      <T x={60} y={30} s={12} f={C.latte}>input order of the 3s: a, c, f</T>
      {TAGGED.map(([v, tag], id) => {
        const { s0, s1, fr } = slotAt(F, TAG.start, k, id);
        const moving = s0 !== s1;
        const y = 80 - (moving ? Math.sin(fr * Math.PI) * 24 * (s1 > s0 ? 1 : -1) : 0);
        return <Cell key={id} x={lerp(X(s0), X(s1), fr)} y={y} v={`${v}${tag}`} w={40} c={v === 3 ? C.caramel : C.latte} fill={v === 3} />;
      })}
      <T x={60} y={160} s={13} f={C.cherryText} o={end}>output order: c, a, f</T>
      <T x={60} y={196} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>in place: O(1) extra memory</T>
    </Svg>
  );
}

// 9 · The fallback. A quicksort recursion descends, a depth counter climbing beside it toward a limit proportional to
// lg n; when it crosses, the current range turns caramel and is finished by heapsort. Then three real systems' own
// lines, one by one: libstdc++, the JDK, Rust.
export function IntrosortFallback({ t }: StepCtx) {
  const depth = clamp((t - 0.2) / 1.6, 0, 1) * 6;
  const LIMIT = 4;
  const cross = easeOut(seg(t, 1.6, 2.0));
  const LINES: [string, string][] = [
    ['libstdc++', 'if (__depth_limit == 0)'],
    ['JDK', 'heapSort(a, low, high);'],
    ['Rust', 'let limit = 2 * (len | 1).ilog2();'],
  ];
  return (
    <Svg label="A quicksort recursion descends while a depth counter climbs toward a limit proportional to lg n; when it crosses, the range is finished by heapsort. libstdc++ checks if (__depth_limit == 0), the JDK calls heapSort(a, low, high), and Rust sets let limit = 2 * (len | 1).ilog2()" h={310}>
      {Array.from({ length: 6 }, (_, d) => {
        const on = clamp(depth - d, 0, 1);
        const heap = d >= LIMIT;
        return (
          <rect key={d} x={60 + d * 10} y={30 + d * 22} width={(300 - d * 20) * on} height={14} rx={2} fill={heap ? C.caramel : 'none'} fillOpacity={heap ? 0.35 * cross : 0} stroke={heap ? C.caramel : C.cinnamon} strokeWidth={1.4} opacity={heap ? cross : 1} />
        );
      })}
      <rect x={30} y={30} width={10} height={depth * 22} fill={C.caramel} opacity={0.7} />
      <path d={`M24 ${26 + LIMIT * 22} L420 ${26 + LIMIT * 22}`} stroke={C.cherryText} strokeWidth={1.2} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.3, 0.7))} />
      <T x={430} y={34 + LIMIT * 22} s={12} f={C.cherryText} o={easeOut(seg(t, 0.3, 0.7))}>limit ∝ lg n</T>
      <T x={430} y={34 + 5 * 22} s={12} f={C.caramel} o={cross}>heapsort</T>
      {LINES.map(([who, code], i) => (
        <g key={who} opacity={easeOut(seg(t, 2.4 + i * 0.6, 2.8 + i * 0.6))}>
          <T x={30} y={200 + i * 34} s={12} f={C.latte}>{who}</T>
          <T x={130} y={200 + i * 34} s={12} f={C.crema}>{code}</T>
        </g>
      ))}
    </Svg>
  );
}

// 10 · Recap. Three chips: quicksort for speed, heapsort for the worst case, merge sort for stability. Then the deck
// itself, and the stretches already in order inside it light up: none of the three looked at them. Next topic.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string][] = [
    ['quicksort', 'speed', C.cinnamon],
    ['heapsort', 'the worst case', C.caramel],
    ['merge sort', 'stability', C.crema],
  ];
  const X = (i: number) => 30 + i * 34;
  // The deck's ascending runs (maximal non-decreasing stretches): [7] [3 9] [3] [1 12] [5 6 8 9 10 11] [4] [2 3 13].
  const RUNS: [number, number][] = [
    [1, 2],
    [4, 5],
    [6, 11],
    [13, 15],
  ];
  const inRun = (i: number) => RUNS.some(([a, b]) => i >= a && i <= b);
  const glow = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="Quicksort for speed, heapsort for the worst case, merge sort for stability. Then the deck, whose stretches already in order light up: none of the three sorts looked at them" h={250}>
      {ROWS.map(([n, what, c], i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.4, 0.7 + i * 0.4));
        return (
          <g key={n} opacity={clamp(a, 0, 1)} transform={`translate(${lerp(-20, 0, clamp(a, 0, 1))} 0)`}>
            <rect x={30} y={20 + i * 36} width={140} height={26} rx={13} fill="none" stroke={c} strokeWidth={1.4} />
            <T x={100} y={38 + i * 36} s={12} a="middle" f={c}>{n}</T>
            <T x={190} y={38 + i * 36} s={12} f={C.latte}>{what}</T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.6, 2.0))}>
        {DECK.map((v, i) => (
          <Cell key={i} x={X(i)} y={150} v={v} w={28} c={inRun(i) && glow > 0.5 ? C.caramel : C.latte} />
        ))}
      </g>
      {RUNS.map(([a, b], j) => (
        <path key={a} d={`M${X(a)} 184 L${X(a)} 190 L${X(b) + 28} 190 L${X(b) + 28} 184`} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={easeOut(seg(t, 2.4 + j * 0.15, 2.7 + j * 0.15))} />
      ))}
      <T x={300} y={230} s={12} a="middle" f={C.caramel} o={easeOut(seg(t, 3.3, 3.7))}>already in order: none of them looked</T>
    </Svg>
  );
}
