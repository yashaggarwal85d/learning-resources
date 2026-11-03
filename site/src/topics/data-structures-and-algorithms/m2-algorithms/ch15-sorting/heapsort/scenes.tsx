import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key at rest; latte = secondary labels; taupe = keys
// not yet touched / the unsorted-becomes-heap region; caramel = the thing to look at (the root
// being pulled, the sift-down path, the depth counter); cinnamon (rare) = the alternative being
// compared (quicksort's own recursion against heapsort's fallback); cherry/cherryText = the bad
// outcome (a reordered equal key, a cache-line miss).

function keyBar(x: number, baseY: number, value: number, label: string, colour = C.crema) {
  const h = value * 12;
  return (
    <g key={`${x}-${label}`}>
      <rect x={x} y={baseY - h} width={22} height={h} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + 11} y={baseY + 16} s={11} a="middle" f={C.latte}>{label}</T>
    </g>
  );
}

const DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13];

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A quicksort recursion deepening on a crafted input, with a question mark over its promise" h={280}>
      <g opacity={a}>
        {[1, 2, 3, 4].map((d) => (
          <rect key={d} x={160 + d * 10} y={60 + d * 24} width={280 - d * 20} height={16} fill="none" stroke={C.cherry} strokeWidth={1.3} />
        ))}
        <T x={300} y={50} s={12} a="middle" f={C.cherry}>recursion deepening</T>
      </g>
      <g opacity={b}>
        <T x={300} y={220} s={13} a="middle" f={C.caramel}>still promises n log n</T>
        <T x={300} y={242} s={12} a="middle" f={C.latte}>a second sort waits in the wings</T>
      </g>
    </Svg>
  );
}

// 2 · Predict: the ratio to the information-theoretic floor
export function PredictRatio({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A bar for the information-theoretic floor and a taller bar for heapsort, with a question mark over the ratio" h={260}>
      <g opacity={a}>
        <rect x={220} y={200 - 8770 / 220} width={50} height={8770 / 220} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <T x={245} y={214} s={11} a="middle" f={C.latte}>floor</T>
        <rect x={320} y={60} width={50} height={140} fill="none" stroke={C.caramel} strokeWidth={1.6} strokeDasharray="4 4" />
        <T x={345} y={214} s={11} a="middle" f={C.latte}>heapsort?</T>
      </g>
      <T x={300} y={240} s={13} a="middle" f={C.caramel}>how many times the floor?</T>
    </Svg>
  );
}

// 3 · Build the max-heap
export function BuildHeap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  const nodes = [50, 30, 40, 20, 25, 35, 15];
  const xs = [300, 220, 380, 180, 260, 340, 420];
  const ys = [50, 110, 110, 170, 170, 170, 170];
  return (
    <Svg label="A small tree being sifted down from the last non-leaf to the root, building a max-heap" h={260}>
      <g opacity={a}>
        {[[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].map(([p, c], i) => (
          <path key={i} d={`M${xs[p]} ${ys[p] + 10} L${xs[c]} ${ys[c] - 10}`} stroke={C.taupe} strokeWidth={1.2} fill="none" />
        ))}
        {nodes.map((v, i) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r={16} fill="none" stroke={i === 1 ? C.caramel : C.crema} strokeWidth={1.6} />
        ))}
      </g>
      <g opacity={b}>
        <T x={300} y={230} s={12} a="middle" f={C.latte}>bottom-up, one pass</T>
      </g>
    </Svg>
  );
}

// 4 · Swap, shrink, sift
export function SwapShrinkSift({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const vals = DECK.slice(0, 8);
  return (
    <Svg label="The root bar swapped to the end of a shrinking heap, the sorted suffix growing to its right" h={280}>
      <g opacity={a}>
        {vals.map((v, i) => keyBar(70 + i * 60, 190, v, String(v), i === 0 ? C.caramel : i === 7 ? C.crema : C.taupe))}
      </g>
      <g opacity={b}>
        <path d="M90 60 L430 60" stroke={C.caramel} strokeWidth={1.4} fill="none" markerEnd="url(#none)" />
        <T x={260} y={46} s={12} a="middle" f={C.caramel}>root to the end</T>
        <T x={300} y={230} s={12} a="middle" f={C.latte}>heap shrinks, suffix grows</T>
      </g>
    </Svg>
  );
}

// 5 · The cost on three shapes
export function ThreeShapes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const rows = [
    { label: 'random', n: 17316 },
    { label: 'sorted', n: 18060 },
    { label: 'reversed', n: 16407 },
  ];
  return (
    <Svg label="Three bars of nearly equal height for heapsort's comparison count on random, sorted and reversed input" h={260}>
      <g opacity={a}>
        {rows.map((r, i) => (
          <g key={r.label}>
            <rect x={140 + i * 110} y={200 - r.n / 120} width={60} height={r.n / 120} fill="none" stroke={C.crema} strokeWidth={1.6} />
            <T x={170 + i * 110} y={216} s={11} a="middle" f={C.latte}>{r.label}</T>
          </g>
        ))}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.caramel}>almost identical counts</T>
    </Svg>
  );
}

// 6 · Against the bounds
export function AgainstBounds({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A bar for the information-theoretic floor, a bar for merge sort's worst case, and a taller bar for heapsort" h={260}>
      <g opacity={a}>
        <rect x={120} y={200 - 8770 / 130} width={60} height={8770 / 130} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <T x={150} y={216} s={11} a="middle" f={C.latte}>floor</T>
        <rect x={230} y={200 - 9217 / 130} width={60} height={9217 / 130} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={260} y={216} s={11} a="middle" f={C.latte}>merge sort</T>
        <rect x={340} y={200 - 17316 / 130} width={60} height={17316 / 130} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={370} y={216} s={11} a="middle" f={C.latte}>heapsort</T>
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.latte}>about twice the floor</T>
    </Svg>
  );
}

// 7 · Poor locality: cache lines
export function CacheLines({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const steps = 7;
  return (
    <Svg label="A path down a heap jumping to farther and farther indices, each one landing on a new cache line" h={270}>
      <g opacity={a}>
        {Array.from({ length: steps }).map((_, i) => (
          <rect
            key={i}
            x={60 + i * 55}
            y={60 + i * 4}
            width={30}
            height={20}
            fill="none"
            stroke={i < 2 ? C.crema : C.cherry}
            strokeWidth={1.4}
          />
        ))}
        <path d={`M75 80 ${Array.from({ length: steps - 1 }).map((_, i) => `L${115 + i * 55} ${84 + i * 4}`).join(' ')}`} stroke={C.caramel} strokeWidth={1.3} fill="none" />
      </g>
      <T x={300} y={220} s={12} a="middle" f={C.cherryText}>17.9 of 20 are new lines</T>
    </Svg>
  );
}

// 8 · Unstable
export function Unstable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const tagged = [
    { v: 3, tag: 'a' },
    { v: 7, tag: 'b' },
    { v: 3, tag: 'c' },
    { v: 1, tag: 'd' },
    { v: 9, tag: 'e' },
    { v: 3, tag: 'f' },
  ];
  return (
    <Svg label="Three tagged bars tied at the same value, shown in input order, then in a different order after heapsort" h={280}>
      <g opacity={a}>
        {tagged.map((k, i) => keyBar(60 + i * 65, 180, k.v, `${k.v}${k.tag}`, k.v === 3 ? C.caramel : C.taupe))}
        <T x={300} y={46} s={12} a="middle" f={C.latte}>input order: a, c, f</T>
      </g>
      <g opacity={b}>
        <T x={300} y={230} s={12} a="middle" f={C.cherryText}>output order: c, a, f</T>
      </g>
    </Svg>
  );
}

// 9 · Introsort fallback
export function IntrosortFallback({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="A depth counter climbing on a quicksort recursion, crossing a limit, and the range switching colour to heapsort" h={280}>
      <g opacity={a}>
        {[1, 2, 3, 4, 5].map((d) => (
          <rect key={d} x={0} y={40 + d * 26} width={20} height={16} fill={d >= 4 ? C.caramel : 'none'} stroke={d >= 4 ? C.caramel : C.cinnamon} strokeWidth={1.3} />
        ))}
        <path d="M30 170 L30 60" stroke={C.latte} strokeWidth={1.2} strokeDasharray="3 3" fill="none" />
        <T x={60} y={64} s={11} a="start" f={C.latte}>limit</T>
      </g>
      <g opacity={b}>
        <rect x={180} y={160} width={260} height={30} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={310} y={180} s={12} a="middle" f={C.caramel}>switch to heapsort</T>
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.latte}>three real sorts, one idea</T>
    </Svg>
  );
}

// 10 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const rows = [
    { label: 'quicksort', note: 'speed' },
    { label: 'heapsort', note: 'worst case' },
    { label: 'merge sort', note: 'stability' },
  ];
  return (
    <Svg label="Three sorts named beside what each one guarantees, with none of them yet reading the input's own order" h={260}>
      <g opacity={a}>
        {rows.map((r, i) => (
          <g key={r.label}>
            <T x={140} y={80 + i * 44} s={13} a="start" f={C.crema}>{r.label}</T>
            <T x={420} y={80 + i * 44} s={12} a="end" f={C.latte}>{r.note}</T>
          </g>
        ))}
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.caramel}>none reads the input's order</T>
    </Svg>
  );
}
