import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a structure as the textbook draws it; latte = labels;
// caramel = the thing to look at (the run being written, the smallest element picked); cinnamon
// (rare) = the second design compared; cherry/cherryText = what the memory budget costs (rows
// spilled, extra passes).
//
// Every printed number is examples.py's or the sources': 20,000,000 rows, a budget of 200,000,
// 100 runs, 1 pass with every run open and 3 at a merge order of 7 (100 → 15 → 3 → 1); the small
// instance's 2,000 rows, budget 50, 40 runs, 3 passes at order 4 (40 → 10 → 3 → 1), simulated
// and by formula; PostgreSQL's 4 to 1,024 partitions. The rows' values and the share of the
// skewed stream that spills come from seeded runs, so they are drawn as shape only.

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

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

/** Bar heights for drawing unsorted rows (shape only). */
const VALS = [7, 3, 9, 1, 6, 4, 8, 2, 5, 10, 3, 7];

// 1 · Hook and predict: runs, and merge passes
export function OrderByHook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const q = easeOut(seg(t, 1.2, 1.8));
  const cut = answered ? easeOut(seg(s, 0.2, 1.2)) : 0;
  const fan = answered ? easeInOut(seg(s, 1.2, 2.2)) : 0;
  return (
    <Svg label="20,000,000 rows to order, room for 200,000 at once. After answering, the rows split into 100 sorted runs, and with every run's buffer open at once a single merge pass folds all hundred into one" h={280}>
      <g opacity={a}>
        <T x={30} y={30} s={12} f={C.latte}>20,000,000 rows, ORDER BY amount</T>
        <rect x={30} y={42} width={500} height={22} fill={C.crema} opacity={0.3} />
        <rect x={30} y={42} width={5} height={22} fill={C.caramel} />
        <T x={30} y={86} s={12} f={C.caramel}>memory: 200,000 rows</T>
      </g>
      {Array.from({ length: 99 }).map((_, i) => (
        <line key={i} x1={35 + i * 5} y1={42} x2={35 + i * 5} y2={64} stroke={C.band} strokeWidth={1} opacity={cut} />
      ))}
      <g opacity={q}>
        <T x={30} y={130} s={12} f={C.crema}>sorted runs</T>
        <T x={250} y={130} s={14} f={cut > 0.5 ? C.caramel : C.taupe}>{cut > 0.5 ? '100' : '?'}</T>
        <T x={30} y={160} s={12} f={C.crema}>merge passes, every run open</T>
        <T x={350} y={160} s={14} f={fan > 0.5 ? C.caramel : C.taupe}>{fan > 0.5 ? '1' : '?'}</T>
      </g>
      <g opacity={fan}>
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={i} x1={40 + i * 54} y1={192} x2={300} y2={248} stroke={C.latte} strokeWidth={1} />
        ))}
        <rect x={250} y={248} width={100} height={16} fill={C.caramel} opacity={0.7} />
      </g>
    </Svg>
  );
}

// 2 · Run generation: fill, sort, write, repeat
export function RunGeneration({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const cyc = Math.max(0, (t - 0.5) / 1.1);
  const n = Math.min(3, Math.floor(cyc));
  const ph = cyc - Math.floor(cyc);
  const fill = n >= 3 ? 1 : Math.min(1, ph / 0.35);
  const sortP = n >= 3 ? 1 : Math.max(0, Math.min(1, (ph - 0.4) / 0.35));
  const runs = stepIdx(t, 3.9, 4.6, 40);
  const sorted = [...VALS].sort((p, q) => p - q);
  return (
    <Svg label="A memory array fills with rows, sorts them with an ordinary sort, and writes them out as a run, then starts empty again. On the small instance, 2,000 rows at a budget of 50 make 40 runs, each verified sorted" h={280}>
      <T x={30} y={28} s={12} f={C.latte} o={a}>memory, one budget's worth</T>
      <rect x={30} y={40} width={250} height={110} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      {VALS.map((v, i) => {
        const j = sorted.indexOf(v) + VALS.slice(0, i).filter((w) => w === v).length;
        const x = lerp(40 + i * 20, 40 + j * 20, easeInOut(sortP));
        return <rect key={i} x={x} y={145 - v * 10} width={14} height={v * 10} fill={sortP > 0.98 ? C.caramel : C.crema} opacity={i / VALS.length < fill ? 0.7 : 0} />;
      })}
      <T x={30} y={176} s={12} f={C.crema} o={sortP}>an ordinary sort, then out to disk</T>
      <g opacity={a}>
        <T x={330} y={28} s={12} f={C.latte}>runs on disk</T>
        {Array.from({ length: n }).map((_, i) => (
          <rect key={i} x={330 + i * 70} y={46} width={60} height={14} fill={C.caramel} opacity={0.6} />
        ))}
      </g>
      {Array.from({ length: 40 }).map((_, i) => (
        <rect key={i} x={30 + i * 13.5} y={206} width={10} height={14} fill={C.caramel} opacity={i <= runs ? 0.6 : 0} />
      ))}
      <T x={30} y={250} s={12} f={C.caramel} o={runs >= 39 ? 1 : 0}>2,000 rows ÷ 50 = 40 runs, each one sorted</T>
    </Svg>
  );
}

// 3 · Four departures from the textbook
export function FourDepartures({ t }: StepCtx) {
  const k = stepIdx(t, 0.3, 4.6, 4);
  const end = easeOut(seg(t, 4.9, 5.5));
  const rows: [string, string, string][] = [
    ['polyphase merge', 'balanced merge', 'tape drives stopped being scarce'],
    ['replacement selection', 'quicksort for runs', 'for generating the runs'],
    ['one block at a time', 'preread a fair share', 'from each tape, to stay sequential'],
    ['a written final merge', 'final merge on the fly', 'when nothing needs random access'],
  ];
  return (
    <Svg label="PostgreSQL's four departures: a balanced merge for polyphase, since tape drives stopped being scarce; quicksort instead of replacement selection to make runs; preread a fair share from each tape to stay sequential; and the final merge done on the fly" h={290}>
      {rows.map(([old, nw, why], i) => {
        const y = 34 + i * 60;
        return (
          <g key={i} opacity={i <= k ? 1 : 0}>
            <T x={30} y={y} s={12} f={C.taupe}>{old}</T>
            <T x={300} y={y} s={12} f={C.caramel}>{`→ ${nw}`}</T>
            <T x={30} y={y + 22} s={11} f={C.latte}>{why}</T>
          </g>
        );
      })}
      <T x={300} y={278} s={12} a="middle" f={C.crema} o={end}>which old constraint moved?</T>
    </Svg>
  );
}

/** Draw a merge cascade: counts per level as rows of blocks. */
function Cascade({ levels, x0, y0, o = 1, col = C.caramel }: { levels: number[]; x0: number; y0: number; o?: number; col?: string }) {
  return (
    <g opacity={o}>
      {levels.map((n, l) => {
        const w = Math.min(5, 250 / n - 1);
        return (
          <g key={l}>
            {Array.from({ length: n }).map((_, i) => (
              <rect key={i} x={x0 + i * (w + 1)} y={y0 + l * 34} width={Math.max(2, w)} height={16} fill={col} opacity={0.6} />
            ))}
            <T x={x0 - 8} y={y0 + l * 34 + 13} s={12} a="end" f={C.latte}>{`${n}`}</T>
          </g>
        );
      })}
    </g>
  );
}

// 4 · Predict: only a few tapes open at once
export function PredictMergeOrder({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 1.0, 1.6));
  const ask = easeOut(seg(t, 2.0, 2.5));
  const lv = answered ? stepIdx(s, 0.2, 1.6, 4) : 0;
  return (
    <Svg label="A hundred runs. With every run open, one pass. With only a few tapes open at a time, after answering: 100 runs fold to 15, then 3, then 1, three passes" h={270}>
      <g opacity={a}>
        <T x={30} y={28} s={12} f={C.latte}>every run open at once: 1 pass</T>
        <Cascade levels={[100, 1]} x0={60} y0={40} />
      </g>
      <g opacity={b}>
        <T x={330} y={28} s={12} f={C.latte}>a few tapes open</T>
        <Cascade levels={[100, 15, 3, 1].slice(0, lv + 1)} x0={360} y0={40} col={C.cherry} />
      </g>
      <T x={300} y={250} s={12} a="middle" f={C.caramel} o={answered ? 0 : ask}>does the pass count move?</T>
      <T x={300} y={250} s={12} a="middle" f={C.cherryText} o={lv >= 3 ? 1 : 0}>three passes; memory traded for time</T>
    </Svg>
  );
}

// 5 · Passes measured, and checked on the small instance
export function PassesMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const big = stepIdx(t, 0.6, 2.2, 4);
  const small = stepIdx(t, 2.5, 4.0, 4);
  const end = easeOut(seg(t, 4.3, 4.9));
  return (
    <Svg label="The hook's 100 runs, merging 7 at a time: 100, 15, 3, 1, three passes. The small instance's 40 runs, 4 at a time: 40, 10, 3, 1, three passes, simulated and by formula alike. The run count never moved; only the passes did" h={290}>
      <g opacity={a}>
        <T x={30} y={26} s={12} f={C.latte}>hook: 7 open at a time</T>
        <Cascade levels={[100, 15, 3, 1].slice(0, big + 1)} x0={60} y0={40} />
        <T x={330} y={26} s={12} f={C.latte}>small: 4 at a time</T>
        <Cascade levels={[40, 10, 3, 1].slice(0, small + 1)} x0={360} y0={40} col={C.cinnamon} />
      </g>
      <T x={30} y={200} s={12} f={C.caramel} o={big >= 3 ? 1 : 0}>3 passes</T>
      <T x={330} y={200} s={12} f={C.cinnamon} o={small >= 3 ? 1 : 0}>3 passes, simulated = formula</T>
      <T x={300} y={264} s={12} a="middle" f={C.crema} o={end}>100 runs either way; only the passes move</T>
    </Svg>
  );
}

// 6 · A sort-merge join's own spill: one heavy key
export function SortMergeJoinSpill({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const buf = stepIdx(t, 0.8, 3.0, 14);
  const spill = easeOut(seg(t, 3.2, 3.8));
  const end = easeOut(seg(t, 4.2, 4.8));
  const left = ['a', 'b', 'k', 'k', 'k', 'k', 'k', 'm'];
  const right = ['b', 'k', 'k', 'k', 'k', 'n'];
  return (
    <Svg label="Two sorted sides of a join. One key, k, repeats heavily on both. The join buffers every row sharing the current key; the buffer grows past its threshold and spills to disk, and the operator reports that spill size on its own" h={280}>
      <g opacity={a}>
        <T x={30} y={28} s={12} f={C.latte}>two sorted sides</T>
        {left.map((k, i) => (
          <g key={`l${i}`}>
            <rect x={30 + i * 36} y={40} width={30} height={22} fill="none" stroke={k === 'k' ? C.caramel : C.mocha} strokeWidth={1.2} />
            <T x={45 + i * 36} y={56} s={12} a="middle" f={k === 'k' ? C.caramel : C.latte}>{k}</T>
          </g>
        ))}
        {right.map((k, i) => (
          <g key={`r${i}`}>
            <rect x={30 + i * 36} y={76} width={30} height={22} fill="none" stroke={k === 'k' ? C.caramel : C.mocha} strokeWidth={1.2} />
            <T x={45 + i * 36} y={92} s={12} a="middle" f={k === 'k' ? C.caramel : C.latte}>{k}</T>
          </g>
        ))}
      </g>
      <T x={30} y={130} s={12} f={C.latte} o={a}>buffer for key k</T>
      <rect x={30} y={140} width={300} height={24} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={a} />
      <line x1={230} y1={134} x2={230} y2={170} stroke={C.cinnamon} strokeWidth={1.6} opacity={a} />
      <T x={230} y={186} s={11} a="middle" f={C.cinnamon} o={a}>threshold</T>
      {Array.from({ length: 14 }).map((_, i) => (
        <rect key={i} x={34 + i * 21} y={144} width={17} height={16} fill={i >= 9 ? C.cherry : C.caramel} opacity={i <= buf ? 0.75 : 0} />
      ))}
      <g opacity={spill}>
        <rect x={380} y={140} width={120} height={24} fill={C.cherry} opacity={0.6} />
        <T x={440} y={130} s={12} a="middle" f={C.cherryText}>spilled to disk</T>
        <T x={440} y={186} s={11} a="middle" f={C.latte}>its own spill size</T>
      </g>
      <T x={30} y={240} s={12} f={C.crema} o={end}>one heavy key, not the sort, takes the memory</T>
    </Svg>
  );
}

// 7 · A shuffle read is an external sort
export function ShuffleReadSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const fetch = easeInOut(seg(t, 0.8, 2.0));
  const merge = stepIdx(t, 2.3, 4.0, 12);
  const end = easeOut(seg(t, 4.2, 4.8));
  return (
    <Svg label="Four map tasks each hold a sorted block. The reduce side fetches all four into an external sorter, which merges them, smallest first, into one ordered stream: the same spill-and-merge shape as before" h={270}>
      {[0, 1, 2, 3].map((m) => (
        <g key={m} opacity={a}>
          <rect x={30} y={30 + m * 46} width={110} height={30} fill="none" stroke={C.crema} strokeWidth={1.2} />
          <T x={85} y={50 + m * 46} s={12} a="middle" f={C.crema}>{`map ${m + 1}`}</T>
          <line x1={140} y1={45 + m * 46} x2={lerp(140, 270, fetch)} y2={lerp(45 + m * 46, 120, fetch)} stroke={C.latte} strokeWidth={1.2} />
        </g>
      ))}
      <g opacity={fetch}>
        <rect x={270} y={96} width={130} height={48} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={335} y={116} s={12} a="middle" f={C.caramel}>external</T>
        <T x={335} y={134} s={12} a="middle" f={C.caramel}>sorter</T>
      </g>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={420 + (i % 6) * 24} y={102 + Math.floor(i / 6) * 22} width={18} height={4 + i * 1.2} fill={C.caramel} opacity={i <= merge ? 0.7 : 0} />
      ))}
      <T x={300} y={236} s={12} a="middle" f={C.crema} o={end}>receiving a shuffle is itself an external sort</T>
    </Svg>
  );
}

// 8 · PostgreSQL's hash aggregation: partition, never sort
export function HashPartitionedSpill({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const full = easeOut(seg(t, 0.8, 1.4));
  const rows = stepIdx(t, 1.8, 4.6, 12);
  const end = easeOut(seg(t, 4.9, 5.5));
  const tape = [2, 0, 3, 1, 1, 2, 0, 3, 2, 1, 3, 0];
  return (
    <Svg label="An in-memory hash table full of groups. Each row for a new group is hashed to one of the logical tapes, between 4 and 1,024 of them, and written there as it is. Nothing is sorted: the partitioning alone keeps it correct" h={280}>
      <g opacity={a}>
        <rect x={30} y={40} width={180} height={150} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={30} y={28} s={12} f={C.latte}>hash table, in memory</T>
        {Array.from({ length: 24 }).map((_, i) => (
          <rect key={i} x={40 + (i % 6) * 28} y={50 + Math.floor(i / 6) * 34} width={22} height={24} fill={C.crema} opacity={0.35 * full} />
        ))}
        <T x={120} y={212} s={12} a="middle" f={C.cherryText} o={full}>full</T>
      </g>
      {[0, 1, 2, 3].map((k) => (
        <g key={k} opacity={a}>
          <rect x={380} y={40 + k * 40} width={180} height={28} fill="none" stroke={C.latte} strokeWidth={1.2} />
          <T x={370} y={59 + k * 40} s={11} a="end" f={C.latte}>{`tape ${k + 1}`}</T>
        </g>
      ))}
      {tape.map((k, i) => {
        const vis = i <= rows;
        const n = tape.slice(0, i).filter((x) => x === k).length;
        return <rect key={i} x={386 + n * 20} y={46 + k * 40} width={16} height={16} fill={C.caramel} opacity={vis ? 0.75 : 0} />;
      })}
      <T x={250} y={120} s={12} a="middle" f={C.caramel} o={rows >= 0 ? 1 : 0}>hash →</T>
      <T x={380} y={214} s={11} f={C.latte} o={a}>4 to 1,024 tapes</T>
      <T x={30} y={262} s={12} f={C.crema} o={end}>written as they come: nothing is sorted</T>
    </Svg>
  );
}

// 9 · Spark's fallback: the hash map becomes a sort
export function SortBasedFallback({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const sortP = easeInOut(seg(t, 1.0, 2.4));
  const spill = easeOut(seg(t, 2.6, 3.2));
  const merge = easeOut(seg(t, 3.6, 4.4));
  const end = easeOut(seg(t, 4.8, 5.5));
  const sorted = [...VALS].sort((p, q) => p - q);
  return (
    <Svg label="Spark's hash map, out of memory, sorts its own entries by key, spills them as a sorted run, and from then on aggregates by sort: an external sorter merges the spill back in" h={280}>
      <T x={30} y={28} s={12} f={C.latte} o={a}>Spark: the hash map, out of memory</T>
      {VALS.map((v, i) => {
        const j = sorted.indexOf(v) + VALS.slice(0, i).filter((w) => w === v).length;
        return <rect key={i} x={lerp(30 + i * 20, 30 + j * 20, sortP)} y={150 - v * 9} width={14} height={v * 9} fill={sortP > 0.98 ? C.cinnamon : C.crema} opacity={a * 0.7} />;
      })}
      <T x={30} y={176} s={12} f={C.cinnamon} o={sortP}>sorted by key</T>
      <g opacity={spill}>
        <rect x={300} y={110} width={120} height={22} fill={C.cinnamon} opacity={0.6} />
        <T x={360} y={100} s={11} a="middle" f={C.latte}>spilled run</T>
      </g>
      <g opacity={merge}>
        <path d="M420 121 L470 121" stroke={C.latte} strokeWidth={1.2} />
        <rect x={470} y={100} width={90} height={42} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={515} y={126} s={11} a="middle" f={C.caramel}>merge</T>
      </g>
      <T x={30} y={244} s={12} f={C.crema} o={end}>a hash structure that turns into a sort</T>
    </Svg>
  );
}

/** Which of a hundred stream rows overflow: shape only, the same for both designs. */
const OVER = Array.from({ length: 100 }, (_, i) => (i * 37) % 100 < 43);

// 10 · Both designs spill the identical rows
export function SpillComparisonMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const k = stepIdx(t, 0.6, 2.6, 100);
  const after = easeOut(seg(t, 3.0, 3.6));
  const end = easeOut(seg(t, 4.0, 4.6));
  const grid = (x0: number, col: string) =>
    OVER.map((o, i) => <rect key={i} x={x0 + (i % 10) * 24} y={50 + Math.floor(i / 10) * 14} width={20} height={10} fill={i <= k && o ? col : 'none'} fillOpacity={0.75} stroke={C.mocha} strokeWidth={0.6} />);
  return (
    <Svg label="The same skewed stream through both designs, a hundred cells each: the identical cells overflow in both. Afterwards PostgreSQL hashes them into unsorted partitions and Spark sorts them once before merging" h={260}>
      <g opacity={a}>
        <T x={30} y={36} s={12} f={C.latte}>PostgreSQL</T>
        {grid(30, C.cherry)}
        <T x={320} y={36} s={12} f={C.latte}>Spark</T>
        {grid(320, C.cherry)}
      </g>
      <g opacity={after}>
        <T x={30} y={208} s={12} f={C.crema}>then hashed to partitions</T>
        <T x={320} y={208} s={12} f={C.cinnamon}>then sorted once</T>
      </g>
      <T x={300} y={246} s={12} a="middle" f={C.caramel} o={end}>the budget decides what spills; the design, how</T>
    </Svg>
  );
}

// 11 · The merge kernel: always the smallest available element
export function MergeKernelRecap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const k = stepIdx(t, 0.8, 3.8, 9);
  const end = easeOut(seg(t, 4.1, 4.7));
  const runs = [
    [1, 4, 8],
    [2, 3, 9],
    [5, 6, 7],
  ];
  // the merge order, taking the smallest head each time
  const order: [number, number][] = [];
  const idx = [0, 0, 0];
  for (let s0 = 0; s0 < 9; s0++) {
    let best = -1;
    for (let r = 0; r < 3; r++) if (idx[r] < 3 && (best < 0 || runs[r][idx[r]] < runs[best][idx[best]])) best = r;
    order.push([best, idx[best]]);
    idx[best]++;
  }
  const taken = (r: number, i: number) => order.findIndex(([rr, ii]) => rr === r && ii === i);
  return (
    <Svg label="Three sorted runs. Again and again the smallest head among them is picked and appended to the output, until one sorted sequence remains: the merge kernel inside a sort's spill, a hash aggregation's fallback, compaction and shuffle reads" h={270}>
      {runs.map((run, r) => (
        <g key={r} opacity={a}>
          <T x={30} y={54 + r * 40} s={12} f={C.latte}>{`run ${r + 1}`}</T>
          {run.map((v, i) => {
            const at = taken(r, i);
            return <rect key={i} x={100 + i * 24} y={40 + r * 40 + (10 - v)} width={18} height={v + 10} fill={C.crema} opacity={at <= k ? 0.15 : 0.6} />;
          })}
        </g>
      ))}
      {order.map(([r, i], s0) => {
        const v = runs[r][i];
        return <rect key={s0} x={300 + s0 * 28} y={110 + (10 - v) * 2} width={22} height={v * 2 + 20} fill={C.caramel} opacity={s0 <= k ? 0.75 : 0} />;
      })}
      <T x={300} y={90} s={12} f={C.caramel} o={a}>always the smallest head next</T>
      <T x={30} y={220} s={12} f={C.crema} o={end}>a heap or a tree of losers does the picking</T>
      <T x={30} y={244} s={12} f={C.latte} o={end}>the same kernel: compaction, shuffle reads</T>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.9, 1.5));
  const meet = easeInOut(seg(t, 1.9, 2.9));
  const end = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="Two answers to missing memory: split by hash, or into sorted pieces merged back. Both end at the same move, picking the smallest available item over and over. Next, the structure that does the picking" h={240}>
      <g opacity={a}>
        <rect x={30} y={40} width={220} height={34} fill="none" stroke={C.crema} strokeWidth={1.2} />
        <T x={140} y={62} s={12} a="middle" f={C.crema}>split by hash</T>
      </g>
      <g opacity={b}>
        <rect x={30} y={100} width={220} height={34} fill="none" stroke={C.crema} strokeWidth={1.2} />
        <T x={140} y={122} s={12} a="middle" f={C.crema}>sorted runs, merged</T>
      </g>
      <g opacity={meet}>
        <path d="M250 57 L330 88 M250 117 L330 88" stroke={C.latte} strokeWidth={1.2} fill="none" />
        <rect x={330} y={70} width={240} height={36} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={450} y={93} s={12} a="middle" f={C.caramel}>pick the smallest, again</T>
      </g>
      <T x={30} y={190} s={13} f={C.caramel} o={end}>next: the structure that does the picking</T>
    </Svg>
  );
}
