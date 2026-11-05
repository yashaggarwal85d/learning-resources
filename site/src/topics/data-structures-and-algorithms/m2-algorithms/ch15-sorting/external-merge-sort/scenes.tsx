import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a block/run at rest; latte = secondary labels; taupe =
// not-yet-touched regions or held-back items; caramel = the thing to look at (the memory
// window, the output pointer, the merge in progress); cinnamon (rare) = the alternative being
// compared (cascade merge against k-way, or a comparison sort's own cost); cherry/cherryText =
// the bad outcome (the worst-case run, a jump in the pass count).

function cell(x: number, y: number, w: number, h: number, label: string, colour = C.crema, labelColour = C.latte) {
  return (
    <g key={`${x}-${y}-${label}`}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={12} a="middle" f={labelColour}>{label}</T>
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A file far longer than the memory window sliding over it" h={260}>
      <g opacity={a}>
        <T x={300} y={60} s={12} a="middle" f={C.latte}>the file, on disk</T>
        {Array.from({ length: 10 }).map((_, i) => cell(30 + i * 54, 78, 44, 26, '', C.taupe))}
      </g>
      <g opacity={b}>
        <T x={300} y={160} s={12} a="middle" f={C.caramel}>memory window, far smaller</T>
        {cell(200, 180, 200, 36, 'M items', C.caramel, C.caramel)}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.latte}>one merge pass finishes it</T>
    </Svg>
  );
}

// 2 · Predict: halve the memory
export function PredictHalve({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Memory window shrinking to half its size, same file" h={260}>
      <g opacity={a}>
        {cell(150, 90, 300, 40, 'M items', C.crema)}
        <path d="M300 140 L300 170" stroke={C.latte} strokeWidth={1.2} fill="none" />
        {cell(225, 180, 150, 30, 'M / 2 items', C.caramel, C.caramel)}
      </g>
      <T x={300} y={236} s={12} a="middle" f={C.latte}>do the merge passes double?</T>
    </Svg>
  );
}

// 3 · Simple run generation
export function SimpleRuns({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Read a block, sort it in memory, write it out as a run" h={260}>
      <g opacity={a}>
        <T x={150} y={70} s={12} a="middle" f={C.latte}>read + sort M items</T>
        {cell(60, 90, 180, 36, 'unsorted block', C.taupe)}
      </g>
      <g opacity={b}>
        <T x={450} y={70} s={12} a="middle" f={C.caramel}>write a run</T>
        {cell(360, 90, 180, 36, 'sorted run', C.crema)}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.latte}>repeat until the file is gone</T>
    </Svg>
  );
}

// 4 · Replacement selection, the snowplow
export function Snowplow({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="A heap outputs the smallest key not smaller than the last written" h={260}>
      <g opacity={a}>
        <T x={150} y={70} s={12} a="middle" f={C.latte}>heap of M items</T>
        {Array.from({ length: 5 }).map((_, i) => cell(60 + i * 56, 90, 44, 32, '', i === 2 ? C.caramel : C.crema))}
      </g>
      <g opacity={b}>
        <T x={450} y={70} s={12} a="middle" f={C.taupe}>too small: held back</T>
        {cell(380, 90, 180, 32, 'next run', C.taupe, C.taupe)}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.caramel}>run grows past M, on average twice M</T>
    </Svg>
  );
}

// 5 · Ordered input
export function OrderedInput({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Sorted input makes one run; reversed input makes no better than simple" h={260}>
      <g opacity={a}>
        <T x={150} y={80} s={12} a="middle" f={C.caramel}>sorted in: one giant run</T>
        {cell(60, 100, 280, 30, 'the whole file, one run', C.crema)}
      </g>
      <g opacity={b}>
        <T x={450} y={160} s={12} a="middle" f={C.cherryText}>reversed in: every key held back</T>
        {Array.from({ length: 4 }).map((_, i) => cell(380 + i * 44, 180, 36, 26, '', C.cherry))}
      </g>
      <T x={300} y={240} s={11} a="middle" f={C.latte}>never worse than the simple method</T>
    </Svg>
  );
}

// 6 · Multi-way merge, the loser tree
export function LoserTreeMerge({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="k run strips feeding a tournament into one output strip" h={260}>
      <g opacity={a}>
        {Array.from({ length: 5 }).map((_, i) => cell(40 + i * 60, 60, 48, 26, `run`, C.taupe))}
        <path d="M80 86 L300 150 M160 86 L300 150 M240 86 L300 150 M320 86 L300 150 M400 86 L300 150" stroke={C.latte} strokeWidth={1} fill="none" />
        {cell(240, 150, 120, 30, 'loser tree', C.caramel, C.caramel)}
      </g>
      <T x={300} y={236} s={12} a="middle" f={C.latte}>log k comparisons per output item, not k</T>
    </Svg>
  );
}

// 7 · Fan-in limit
export function FanInLimit({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="One buffer per run plus one for output; in memory, two at a time instead" h={260}>
      <g opacity={a}>
        <T x={150} y={70} s={12} a="middle" f={C.caramel}>external: k buffers, large fan-in</T>
        {Array.from({ length: 6 }).map((_, i) => cell(40 + i * 42, 90, 32, 26, '', C.caramel))}
      </g>
      <g opacity={b}>
        <T x={450} y={160} s={12} a="middle" f={C.cinnamon}>in memory: cascade, two at a time</T>
        {cell(380, 180, 70, 30, 'run A', C.cinnamon)}
        {cell(460, 180, 70, 30, 'run B', C.cinnamon)}
      </g>
      <T x={300} y={236} s={11} a="middle" f={C.latte}>fan-in is an I/O argument</T>
    </Svg>
  );
}

// 8 · Running example, measured
export function RunningExample({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Sixteen runs, one merge pass, four times a scan in total" h={260}>
      <g opacity={a}>
        <T x={160} y={80} s={12} a="middle" f={C.caramel}>run generation: one scan</T>
        <rect x={60} y={100} width={200} height={28} fill={C.caramel} opacity={0.85} />
        <T x={440} y={150} s={12} a="middle" f={C.cinnamon}>one merge pass: another scan</T>
        <rect x={340} y={170} width={220} height={28} fill={C.cinnamon} opacity={0.85} />
      </g>
      <T x={300} y={236} s={11} a="middle" f={C.latte}>four times a single scan, total</T>
    </Svg>
  );
}

// 9 · Small instance, worked
export function SmallInstance({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const c = easeOut(seg(t, 2.4, 3.3));
  return (
    <Svg label="Sixteen runs, three fan-ins, three different pass counts" h={260}>
      <g opacity={a}>
        <T x={120} y={70} s={12} a="middle" f={C.latte}>fan-in 2</T>
        {cell(40 + 0, 90, 160, 28, 'four passes', C.taupe)}
      </g>
      <g opacity={b}>
        <T x={300} y={140} s={12} a="middle" f={C.latte}>fan-in 4</T>
        {cell(220, 160, 160, 28, 'two passes', C.crema)}
      </g>
      <g opacity={c}>
        <T x={480} y={210} s={12} a="middle" f={C.caramel}>fan-in 16: one pass</T>
      </g>
      <T x={300} y={244} s={11} a="middle" f={C.latte}>same formula, every instance</T>
    </Svg>
  );
}

// 10 · Predict: the threshold table
export function PredictTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Memory halved again and again; does the pass count move each time?" h={260}>
      <g opacity={a}>
        {Array.from({ length: 6 }).map((_, i) => cell(40 + i * 86, 90, 70, 36, '', i < 5 ? C.crema : C.caramel))}
      </g>
      <T x={300} y={236} s={12} a="middle" f={C.latte}>how often does the pass count jump?</T>
    </Svg>
  );
}

// 11 · The threshold table, computed
export function ThresholdTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Five steps unchanged, then one jump once the threshold is crossed" h={260}>
      <g opacity={a}>
        <T x={180} y={70} s={12} a="middle" f={C.latte}>five halvings: pass count unchanged</T>
        {Array.from({ length: 5 }).map((_, i) => cell(30 + i * 76, 90, 60, 30, '1', C.crema))}
      </g>
      <g opacity={b}>
        <T x={520} y={160} s={12} a="middle" f={C.cherryText}>sixth halving: jumps</T>
        {cell(470, 180, 60, 30, '2', C.cherry, C.cherryText)}
      </g>
      <T x={300} y={240} s={11} a="middle" f={C.latte}>a logarithm, not a line</T>
    </Svg>
  );
}

// 12 · Where this runs for real
export function WhereItRuns({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A sort operator, a sort-merge join, a spilling aggregate, LSM compaction" h={260}>
      <g opacity={a}>
        {cell(40, 70, 140, 34, 'sort operator', C.crema)}
        {cell(200, 70, 140, 34, 'sort-merge join', C.crema)}
      </g>
      <g opacity={b}>
        {cell(360, 70, 140, 34, 'spilling aggregate', C.crema)}
        {cell(40, 140, 140, 34, 'LSM compaction', C.crema)}
      </g>
      <T x={300} y={240} s={11} a="middle" f={C.caramel}>the same k-way merge, every time</T>
    </Svg>
  );
}

// 13 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A sorted file, then the search it makes cheap" h={260}>
      <g opacity={a}>
        <T x={150} y={100} s={12} a="middle" f={C.caramel}>a sorted file</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={12} a="middle" f={C.latte}>one key found in a few steps</T>
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.latte}>binary search, next</T>
    </Svg>
  );
}
