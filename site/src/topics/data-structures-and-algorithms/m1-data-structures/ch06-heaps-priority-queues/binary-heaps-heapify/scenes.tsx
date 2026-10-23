import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the heap's own live state; latte = secondary labels;
// taupe = an empty/untouched slot; caramel = the thing to look at (the value moving, the measured
// bar); cinnamon = the alternative being compared (one-at-a-time insertion); cherry = the bad
// outcome (an out-of-order pair, before it's fixed).

function node(cx: number, cy: number, r: number, colour = C.crema, opacity = 1, label?: string) {
  return (
    <g key={`${cx}-${cy}-n`} opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={colour} strokeWidth={1.4} />
      {label !== undefined && (
        <T x={cx} y={cy + 4} s={13} f={colour} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 1) {
  return <line key={`${x1}-${y1}-${x2}-${y2}-e`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1.2} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// An array drawn as a row of boxed slots, each holding a value.
function array(x: number, y: number, slotW: number, values: number[], colours: string[], opacity = 1) {
  return values.map((v, i) => (
    <g key={`${x}-${y}-a${i}`} opacity={opacity}>
      <rect x={x + i * slotW} y={y} width={slotW - 3} height={22} rx={3} fill="none" stroke={colours[i] ?? C.crema} strokeWidth={1.3} />
      <T x={x + i * slotW + (slotW - 3) / 2} y={y + 15} s={13} f={colours[i] ?? C.crema} a="middle">
        {v}
      </T>
    </g>
  ));
}

// 1 · Opening: a loose scatter of values settling into one highlighted minimum
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const pts = [[70, 70], [140, 50], [210, 90], [280, 60], [350, 80], [420, 55]];
  const minIdx = 1;
  return (
    <Svg label="A loose scatter of values settling into one highlighted minimum" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>no sorting, no page, no pointer</T>
      {pts.map(([x, y], i) => (
        <circle key={`p-${i}`} cx={x} cy={y + 40} r={i === minIdx ? 10 : 7} fill="none" stroke={i === minIdx ? C.caramel : C.crema} strokeWidth={i === minIdx ? 2 : 1.3} opacity={Math.max(0.3, a)} />
      ))}
      <T x={30} y={190} s={13} f={C.crema} o={a}>just: what's smallest, right now, as things keep arriving</T>
      <T x={30} y={225} s={13} f={C.latte} o={a}>binary heaps, next</T>
    </Svg>
  );
}

// 2 · ArrayTree: the same array drawn flat, then redrawn as the implicit tree it represents
export function ArrayTree({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.8));
  const values = [4, 9, 7, 15, 12, 20];
  const cols = values.map(() => C.crema);
  cols[2] = C.caramel;
  return (
    <Svg label="An array drawn as a flat row, then redrawn as the implicit tree it represents" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>one flat array — no pointers at all</T>
      {array(30, 36, 60, values, cols)}
      <T x={320} y={52} s={13} f={C.caramel} o={a}>i = 2</T>
      <T x={30} y={100} s={13} f={C.crema} o={a}>children at 2i+1, 2i+2 — parent at floor((i−1)/2)</T>
      {edge(130, 170, 90, 210, C.latte, a)}
      {edge(130, 170, 170, 210, C.latte, a)}
      {edge(90, 210, 60, 250, C.latte, a)}
      {edge(90, 210, 120, 250, C.latte, a)}
      {node(130, 170, 16, C.crema, 1, '4')}
      {node(90, 210, 16, C.caramel, 1, '7')}
      {node(170, 210, 16, C.crema, 1, '9')}
      {node(60, 250, 14, C.crema, Math.max(0.4, a), '15')}
      {node(120, 250, 14, C.crema, Math.max(0.4, a), '12')}
      <T x={220} y={250} s={13} f={C.latte} o={a}>index 2's children sit at indices 5, 6</T>
    </Svg>
  );
}

// 3 · Predict: a value appended past the array's current end, a question mark over it
export function SiftUpPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  const values = [4, 9, 7, 15, 12, 20, 3];
  const cols = values.map((_, i) => (i === 6 ? C.cherry : C.crema));
  return (
    <Svg label="An array with one value freshly appended past its own end, pulsing with a question" h={220}>
      {array(30, 60, 55, values, cols, 1)}
      <circle cx={30 + 6 * 55 + 26} cy={55} r={10} fill="none" stroke={C.cherry} strokeWidth={1.4} opacity={Math.max(0.5, pulse)} />
      <T x={30 + 6 * 55 + 26} y={59} s={13} f={C.cherry} a="middle">?</T>
      <T x={30} y={150} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'it walks up toward the root, swapping until the order holds again' : "what has to happen before this array is a valid heap again?"}
      </T>
    </Svg>
  );
}

// 4 · SiftUpReveal: the new value walking up the tree one swap at a time
export function SiftUpReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.45, 0.9));
  const c = easeOut(seg(t, 0.85, 1.3));
  const path = [[120, 260], [80, 200], [120, 140]];
  const step = a < 1 ? 0 : b < 1 ? 1 : 2;
  const pos = path[Math.min(step, 2)];
  return (
    <Svg label="A new value walking up the tree one swap at a time, the rest of the heap undisturbed" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>compare with parent — swap if out of order, else stop</T>
      {edge(120, 140, 80, 200, C.latte, 1)}
      {edge(120, 140, 160, 200, C.latte, 1)}
      {edge(80, 200, 60, 260, C.latte, 1)}
      {edge(80, 200, 120, 260, C.latte, 1)}
      {node(120, 140, 16, C.crema, 1, '4')}
      {node(160, 200, 16, C.crema, 1, '9')}
      {node(60, 260, 14, C.crema, Math.max(0.3, 1 - c), '7')}
      <circle cx={pos[0]} cy={pos[1]} r={14} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={pos[0]} y={pos[1] + 4} s={13} f={C.caramel} a="middle">3</T>
      <T x={30} y={290} s={13} f={C.crema} o={c}>only this one root-ward path ever moves</T>
    </Svg>
  );
}

// 5 · SiftDownReveal: the root replaced, walking down toward whichever child is smaller
export function SiftDownReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.45, 0.95));
  const path = [[120, 140], [160, 200], [180, 260]];
  const step = a < 1 ? 0 : b < 1 ? 1 : 2;
  const pos = path[Math.min(step, 2)];
  return (
    <Svg label="The root refilled from the array's last element, walking down toward the smaller child" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>last element fills the root, then walks down toward the smaller child</T>
      {edge(120, 140, 80, 200, C.latte, 1)}
      {edge(120, 140, 160, 200, C.latte, 1)}
      {edge(160, 200, 140, 260, C.latte, 1)}
      {edge(160, 200, 180, 260, C.latte, 1)}
      {node(80, 200, 16, C.crema, 1, '7')}
      {node(140, 260, 14, C.crema, 1, '12')}
      {node(180, 260, 14, C.cherry, Math.max(0.4, 1 - b), '9')}
      <circle cx={pos[0]} cy={pos[1]} r={14} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={pos[0]} y={pos[1] + 4} s={13} f={C.caramel} a="middle">20</T>
      <T x={30} y={290} s={13} f={C.crema} o={b}>same move as sift-up, aimed the other way</T>
    </Svg>
  );
}

// 6 · BuildReveal: two side-by-side swap-count bars on the identical input
export function BuildReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.8));
  const b = easeOut(seg(t, 0.6, 1.3));
  return (
    <Svg label="Two swap-count bars, one-at-a-time against bottom-up, on the identical input" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>n insertions, one path repaired each time — O(n log n) total</T>
      {fill(30, 36, 320 * a, 20, C.cinnamon, Math.max(0.3, a))}
      <T x={30} y={92} s={13} f={C.latte} o={b}>same n elements, sifted down from the bottom instead — O(n) total</T>
      {fill(30, 104, 32 * b, 20, C.caramel, Math.max(0.3, b))}
      <T x={30} y={160} s={13} f={C.crema} o={b}>only the order of operations changed — the total cost fell</T>
    </Svg>
  );
}

// 7 · Prove it: the measured swap counts from examples.py
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.8));
  const b = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="Measured swap counts for one-at-a-time insertion and the bottom-up build, same input" h={260}>
      <T x={30} y={24} s={13} f={C.crema}>4000 elements, decreasing order — the adversarial case for sift-up</T>
      {fill(30, 40, 340 * a, 18, C.cinnamon, Math.max(0.3, a))}
      <T x={380} y={54} s={13} f={C.cinnamon} o={a}>39,917 swaps</T>
      {fill(30, 68, 34 * b, 18, C.caramel, Math.max(0.3, b))}
      <T x={380} y={82} s={13} f={C.caramel} o={b}>3,990 swaps</T>
      <T x={30} y={130} s={13} f={C.latte} o={b}>a ~10x gap — measured by examples.py, not assumed</T>
      <T x={30} y={170} s={13} f={C.crema} o={b}>both end at a valid heap, checked at every node</T>
    </Svg>
  );
}
