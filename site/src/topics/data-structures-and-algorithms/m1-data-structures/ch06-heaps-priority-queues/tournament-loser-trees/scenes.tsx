import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a heap/tree's own live state; latte = secondary labels;
// taupe = an empty/discarded slot; caramel = the thing to look at (the run a winner came from,
// the path being replayed); cinnamon = the alternative being compared (a heap-based merge
// against a loser tree); cherry = the bad outcome (a full root-to-leaf re-examination a loser
// tree would have skipped).

function run(x: number, y: number, w: number, slots: number, colour = C.crema, opacity = 1, filled = slots) {
  const slotW = w / slots;
  const items = [] as React.ReactNode[];
  items.push(<rect key={`${x}-${y}-r`} x={x} y={y} width={w} height={16} rx={2} fill="none" stroke={colour} strokeWidth={1.3} opacity={opacity} />);
  for (let i = 0; i < slots; i++) {
    const sx = x + i * slotW + slotW / 2;
    const isFilled = i < filled;
    items.push(<circle key={`${x}-${y}-s${i}`} cx={sx} cy={y + 8} r={2.4} fill={isFilled ? colour : 'none'} stroke={isFilled ? 'none' : C.taupe} strokeWidth={1} opacity={opacity} />);
  }
  return items;
}

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

// 1 · Opening: k short sealed runs feeding into one output stream
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="Four short sealed runs feeding into one merged output stream" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>k already-sorted runs, each with its own current head</T>
      {[0, 1, 2, 3].map((i) => (
        <g key={`run-${i}`}>{run(30, 44 + i * 26, 160, 5, C.crema, 1, 5)}</g>
      ))}
      <path d="M 200 80 L 300 80" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {run(300, 72, 160, 5, C.caramel, a, 3)}
      <T x={30} y={200} s={13} f={C.crema} o={a}>of every run's current head, which is smallest, right now?</T>
    </Svg>
  );
}

// 2 · NaiveReveal: a sweep across all k heads
export function NaiveReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.9));
  const heads = [8, 3, 11, 5];
  return (
    <Svg label="A sweep comparing every run's current head to find the smallest" h={220}>
      <T x={30} y={24} s={13} f={C.latte}>scan every head, keep the smallest seen so far</T>
      {heads.map((v, i) => (
        <g key={`h-${i}`}>
          <circle cx={70 + i * 90} cy={70} r={18} fill="none" stroke={v === 3 ? C.caramel : C.crema} strokeWidth={v === 3 ? 2 : 1.3} opacity={Math.max(0.3, a)} />
          <T x={70 + i * 90} y={75} s={13} f={v === 3 ? C.caramel : C.crema} a="middle" o={a}>{v}</T>
        </g>
      ))}
      <path d="M 70 100 L 340 100" stroke={C.latte} strokeWidth={1.2} opacity={a} strokeDasharray="3,2" />
      <T x={30} y={160} s={13} f={C.cherryText} o={a}>one comparison per still-active run beyond the first, every output</T>
    </Svg>
  );
}

// 3 · HeapPredict: the heads redrawn as heap leaves, pop-and-refill pending
export function HeapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="The k heads redrawn as a small heap, a question mark over the pop-and-refill step" h={240}>
      {edge(150, 60, 100, 110, C.latte, 1)}
      {edge(150, 60, 200, 110, C.latte, 1)}
      {node(150, 60, 16, C.caramel, Math.max(0.5, pulse))}
      {node(100, 110, 14, C.crema)}
      {node(200, 110, 14, C.crema)}
      <T x={30} y={180} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'roughly two comparisons per level — both children checked' : 'what does a heap-based merge cost per output?'}
      </T>
    </Svg>
  );
}

// 4 · HeapReveal: a sift-down path, both children highlighted at each level
export function HeapReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.45, 0.95));
  return (
    <Svg label="A sift-down path where both children are compared at every level on the way down" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>sift-down: find the smaller child, then decide whether to swap</T>
      {edge(150, 60, 100, 120, C.cinnamon, 1)}
      {edge(150, 60, 200, 120, C.cinnamon, 1)}
      {node(150, 60, 16, C.crema)}
      {node(100, 120, 14, C.cinnamon, Math.max(0.4, a))}
      {node(200, 120, 14, C.cinnamon, Math.max(0.4, a))}
      <T x={60} y={150} s={13} f={C.cinnamon} o={a}>two comparisons at this level: which child, then swap or stop</T>
      {edge(100, 120, 70, 180, C.cinnamon, b)}
      {edge(100, 120, 130, 180, C.cinnamon, b)}
      {node(70, 180, 12, C.cinnamon, Math.max(0.3, b))}
      {node(130, 180, 12, C.cinnamon, Math.max(0.3, b))}
      <T x={30} y={220} s={13} f={C.crema} o={b}>every level touched costs two comparisons, not one</T>
    </Svg>
  );
}

// 5 · TournamentPredict: the same heads redrawn as a bracket's first-round pairs
export function TournamentPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="The same heads redrawn as a tournament bracket's first-round pairs" h={240}>
      {[[60, 120], [160, 120], [260, 120], [360, 120]].map(([x, y], i) => (
        <g key={`p-${i}`}>{node(x, y, 14, C.crema)}</g>
      ))}
      {edge(60, 120, 110, 70, C.latte, 1)}
      {edge(160, 120, 110, 70, C.latte, 1)}
      {edge(260, 120, 310, 70, C.latte, 1)}
      {edge(360, 120, 310, 70, C.latte, 1)}
      {node(110, 70, 14, C.caramel, Math.max(0.5, pulse))}
      {node(310, 70, 14, C.caramel, Math.max(0.5, pulse))}
      <T x={30} y={200} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'yes — one comparison per round, fewer than a heap' : 'can a single-elimination bracket beat a heap here?'}
      </T>
    </Svg>
  );
}

// 6 · TournamentReveal: games resolving round by round up to one overall winner
export function TournamentReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="A bracket's games resolving round by round up to a single overall winner" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>one game, one comparison, per layer — on the way up</T>
      {[[60, 160], [160, 160], [260, 160], [360, 160]].map(([x, y], i) => (
        <g key={`p-${i}`}>{node(x, y, 12, C.crema)}</g>
      ))}
      {edge(60, 160, 110, 110, C.caramel, a)}
      {edge(160, 160, 110, 110, C.caramel, a)}
      {edge(260, 160, 310, 110, C.caramel, a)}
      {edge(360, 160, 310, 110, C.caramel, a)}
      {node(110, 110, 13, C.caramel, Math.max(0.4, a))}
      {node(310, 110, 13, C.caramel, Math.max(0.4, a))}
      {edge(110, 110, 210, 60, C.caramel, b)}
      {edge(310, 110, 210, 60, C.caramel, b)}
      {node(210, 60, 14, C.caramel, Math.max(0.4, b))}
      <T x={30} y={220} s={13} f={C.crema} o={b}>same depth as the heap's tree — one comparison per level, not two</T>
    </Svg>
  );
}

// 7 · LoserTreeReveal: one leaf refilled, its path up lighting up, the rest untouched
export function LoserTreeReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  const b = easeOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="One leaf refilled, its path to the root lighting up while the rest of the bracket stays still" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>a leaf refills — only its own path to the root replays</T>
      {node(60, 160, 12, C.taupe, Math.max(0.3, 1 - a))}
      {node(160, 160, 12, C.caramel, Math.max(0.5, a))}
      {node(260, 160, 12, C.taupe, Math.max(0.3, 1 - a))}
      {node(360, 160, 12, C.taupe, Math.max(0.3, 1 - a))}
      {edge(60, 160, 110, 110, C.taupe, Math.max(0.2, 1 - a))}
      {edge(160, 160, 110, 110, C.caramel, a)}
      {node(110, 110, 13, C.caramel, Math.max(0.4, a))}
      {edge(260, 160, 310, 110, C.taupe, Math.max(0.2, 1 - a))}
      {edge(360, 160, 310, 110, C.taupe, Math.max(0.2, 1 - a))}
      {node(310, 110, 13, C.taupe, Math.max(0.3, 1 - b))}
      {edge(110, 110, 210, 60, C.caramel, b)}
      {edge(310, 110, 210, 60, C.taupe, Math.max(0.2, 1 - b))}
      {node(210, 60, 14, C.caramel, Math.max(0.4, b))}
      <T x={30} y={220} s={13} f={C.crema} o={b}>every other node is untouched</T>
    </Svg>
  );
}

// 8 · ExternalSortReveal: several on-disk runs merging through a bracket into one output run
export function ExternalSortReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.8));
  return (
    <Svg label="Several on-disk runs merging through a bracket into one output run" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>external sorting's merge phase, and LSM compaction's own merge step</T>
      {[0, 1, 2, 3].map((i) => (
        <g key={`r-${i}`}>{run(30, 44 + i * 26, 140, 5, C.cinnamon, 1, 5)}</g>
      ))}
      <path d="M 180 85 L 300 85" stroke={C.caramel} strokeWidth={1.6} opacity={a} markerEnd="url(#arrow)" />
      {run(300, 77, 180, 6, C.caramel, a, 6)}
      <T x={30} y={200} s={13} f={C.crema} o={a}>a wider merge pass needs fewer passes over the same runs</T>
    </Svg>
  );
}

// 9 · Prove it: measured comparisons-per-output for all three approaches
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  const b = easeOut(seg(t, 0.55, 1.05));
  const c = easeOut(seg(t, 0.95, 1.4));
  return (
    <Svg label="Three comparisons-per-output bars: naive scan, heap-based merge, and loser tree" h={260}>
      <T x={30} y={24} s={13} f={C.crema}>comparisons per output, identical runs, each structure measured</T>
      {fill(30, 36, 300 * a, 18, C.latte, Math.max(0.3, a))}
      <T x={30} y={78} s={13} f={C.latte} o={a}>naive scan</T>
      {fill(30, 96, 190 * b, 18, C.cinnamon, Math.max(0.3, b))}
      <T x={30} y={138} s={13} f={C.cinnamon} o={b}>heap-based merge</T>
      {fill(30, 156, 130 * c, 18, C.caramel, Math.max(0.3, c))}
      <T x={30} y={198} s={13} f={C.caramel} o={c}>loser tree</T>
      <T x={30} y={230} s={13} f={C.latte} o={c}>a real margin — smaller than a rough per-level estimate suggests</T>
    </Svg>
  );
}
