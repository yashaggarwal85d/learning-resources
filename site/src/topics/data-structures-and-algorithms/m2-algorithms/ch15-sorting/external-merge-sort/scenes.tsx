import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key or run at rest; latte = secondary labels; taupe = disk not yet touched;
// caramel = the thing to look at (the run being written, the winner climbing the tree); cinnamon (rare) = the held-back
// key waiting for the next run, or the in-memory alternative; cherryText = the bad outcome (the pass count jumping).
// Every printed number is examples.py's (its asserts or input data) or a quoted source: 1,000,000 keys at memory 4,000
// -> 250 runs; 200,000 random keys at memory 1,000 -> interior runs average 2.0 x memory; 10,000 sorted keys at memory
// 100 -> 1 run, reversed -> 100 runs of 100; N = 2^27, M = 2^23, B = 512 -> 16 runs, fan-in 16,383, 1 pass, 262,144
// blocks per scan, 1,048,576 transfers in all; 16 runs at fan-in 2, 4, 16 -> 4, 2, 1 passes; the halving table (runs 16
// to 512, fan-in 16,383 to 511, passes 1 then 2); 14 comparisons per item at fan-in 16,383. Small traces run on the
// chapter's own 16-key deck, computed here by examples.py's own rules; DuckDB's lines are quoted from SOURCES.md.

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

function Cell({ x, y, v, c = C.crema, o = 1, w = 30, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 18} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

/** The halving table, examples.py's pass_table: memory exponent, runs, fan-in, passes. */
const TABLE: [string, string, string, number][] = [
  ['2²³', '16', '16,383', 1],
  ['2²²', '32', '8,191', 1],
  ['2²¹', '64', '4,095', 1],
  ['2²⁰', '128', '2,047', 1],
  ['2¹⁹', '256', '1,023', 1],
  ['2¹⁸', '512', '511', 2],
];

// 1 · Opening. A small memory box beside a file ten times its width. The file is cut into 16 sorted runs; one merge pass
// funnels them into one sorted file; four arrows: every byte read twice and written twice.
export function Opening({ t }: StepCtx) {
  const file = easeOut(seg(t, 0.2, 0.9));
  const cut = easeOut(seg(t, 1.0, 1.6));
  const merge = easeInOut(seg(t, 2.0, 3.0));
  const W = 500;
  return (
    <Svg label="A memory box beside a file ten times its size. The file is cut into 16 sorted runs, and one merge pass funnels them into a single sorted file; every byte is read twice and written twice" h={260}>
      <rect x={40} y={30} width={50} height={30} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} />
      <T x={65} y={78} s={12} a="middle" f={C.crema}>memory</T>
      <rect x={120} y={30} width={(W - 80) * file} height={30} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
      <T x={330} y={78} s={12} a="middle" f={C.cinnamon} o={file}>file: ten times memory</T>
      {Array.from({ length: 16 }, (_, i) => {
        const x0 = 40 + i * 32;
        return (
          <rect key={i} x={lerp(x0, 200, merge)} y={lerp(110, 190, merge)} width={lerp(28, 200, merge)} height={lerp(26, 20, merge)} rx={2} fill={C.caramel} opacity={cut * lerp(0.75, 0.06, merge)} />
        );
      })}
      <T x={40} y={156} s={12} f={C.caramel} o={cut * (1 - merge)}>16 sorted runs</T>
      <rect x={200} y={190} width={200} height={20} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={merge} />
      <T x={300} y={180} s={12} a="middle" f={C.caramel} o={merge}>one merge pass</T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        {['read', 'write', 'read', 'write'].map((l, i) => (
          <T key={i} x={60 + i * 130} y={244} s={12} f={i % 2 ? C.caramel : C.crema}>{l} ×1</T>
        ))}
      </g>
    </Svg>
  );
}

// 2 · Predict. A memory bar halves while the file stays put; a question over the pass count. After answering: the
// pass count across the six memory sizes, a flat line at 1 that jumps to 2 only at the end.
export function PredictHalve({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const half = easeInOut(seg(t, 0.4, 1.2));
  const steps = answered ? clamp((s - 0.2) / 1.4, 0, 1) * 6 : 0;
  return (
    <Svg label="Memory halves while the file stays the same size. After answering: across six memory sizes the merge-pass count stays at 1 five times and jumps to 2 only at the last" h={260}>
      <T x={40} y={28} s={12} f={C.crema}>memory</T>
      <rect x={130} y={16} width={lerp(240, 120, half)} height={16} rx={2} fill={C.crema} opacity={0.8} />
      <T x={40} y={60} s={12} f={C.cinnamon}>file</T>
      <rect x={130} y={48} width={420} height={16} rx={2} fill="none" stroke={C.cinnamon} strokeWidth={1.3} />
      {answered && (
        <g>
          {TABLE.map(([m, , , p], i) => {
            const on = clamp(steps - i, 0, 1);
            return (
              <g key={m} opacity={on}>
                <rect x={80 + i * 80} y={200 - p * 50} width={50} height={p * 50} rx={2} fill={p > 1 ? C.cherryText : C.caramel} opacity={0.85} />
                <T x={105 + i * 80} y={190 - p * 50} s={12} a="middle" f={p > 1 ? C.cherryText : C.caramel}>{p}</T>
                <T x={105 + i * 80} y={218} s={12} a="middle" f={C.latte}>{m}</T>
              </g>
            );
          })}
          <T x={40} y={110} s={12} f={C.latte} o={easeOut(seg(s, 0.2, 0.5))}>merge passes, by memory</T>
        </g>
      )}
      {!answered && <T x={300} y={150} s={14} a="middle" f={C.caramel} o={pulse}>do the passes double?</T>}
      {answered && <T x={300} y={250} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 1.6, 2.0))}>five halvings, no change; then one jump</T>}
    </Svg>
  );
}

// 3 · Simple runs. The deck on disk; a memory window takes the next slice, the slice sorts in place, and is written out
// as a run below; again until the file is gone. Then the measured case: 1,000,000 keys at memory 4,000, 250 runs.
export function SimpleRuns({ t }: StepCtx) {
  const X = (i: number) => 30 + i * 34;
  const M = 4;
  const per = 0.8;
  const k = clamp((t - 0.3) / per, 0, 4);
  return (
    <Svg label="The deck on disk. A memory window takes the next slice, sorts it, and writes it out as a sorted run, until the file is gone. Measured: 1,000,000 keys at a memory limit of 4,000 give exactly 250 runs" h={260}>
      <T x={30} y={22} s={12} f={C.latte}>file</T>
      {DECK.map((v, i) => {
        const chunk = Math.floor(i / M);
        const left = clamp(k - chunk, 0, 1);
        return <Cell key={i} x={X(i)} y={30} v={v} w={28} c={C.latte} o={1 - easeOut(clamp(left * 2, 0, 1)) * 0.75} />;
      })}
      <rect x={X(Math.min(Math.floor(k), 3) * M) - 4} y={24} width={4 * 34 + 2} height={38} rx={4} fill="none" stroke={C.crema} strokeWidth={1.4} opacity={k < 4 ? 1 : 0} />
      {[0, 1, 2, 3].map((c) => {
        const slice = DECK.slice(c * M, c * M + M);
        const sorted = [...slice].sort((a, b) => a - b);
        const p = clamp(k - c, 0, 1);
        const sortP = easeInOut(clamp((p - 0.2) / 0.5, 0, 1));
        return slice.map((v, j) => {
          const to = sorted.indexOf(v) + slice.slice(0, j).filter((w) => w === v).length;
          return <Cell key={`${c}-${j}`} x={lerp(X(c * M + j), X(c * M + to), sortP)} y={lerp(30, 110, easeOut(clamp(p * 3, 0, 1)))} v={v} w={28} c={sortP >= 1 ? C.caramel : C.crema} o={p > 0 ? 1 : 0} />;
        });
      })}
      {[0, 1, 2, 3].map((c) => (
        <path key={c} d={`M${X(c * M)} 146 L${X(c * M)} 152 L${X(c * M + 3) + 28} 152 L${X(c * M + 3) + 28} 146`} fill="none" stroke={C.caramel} strokeWidth={1.3} opacity={clamp(k - c - 0.7, 0, 0.3) / 0.3} />
      ))}
      <T x={30} y={172} s={12} f={C.caramel} o={easeOut(seg(t, 1.0, 1.3))}>read a block, sort it, write a run</T>
      <T x={30} y={220} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>1,000,000 keys, memory 4,000: 250 runs</T>
    </Svg>
  );
}

// 4 · Replacement selection. A heap of a few slots fed from the deck: each step the smallest key not smaller than the
// last written goes out to the current run, and the next input takes its slot; a key too small waits (blue) for the
// next run. The runs come out 5, 8, 3 long, the middle one twice the heap. Then the measured average, 2.0 x memory.
type SnowState = { heap: [number, boolean][]; runs: number[][]; next: number };
const SNOW: SnowState[] = (() => {
  const M = 4;
  let cur = DECK.slice(0, M);
  let held: number[] = [];
  let next = M;
  const runs: number[][] = [[]];
  const out: SnowState[] = [];
  const snap = () => out.push({ heap: [...cur.map((v) => [v, false] as [number, boolean]), ...held.map((v) => [v, true] as [number, boolean])], runs: runs.map((r) => [...r]), next });
  snap();
  while (cur.length || held.length) {
    if (!cur.length) {
      cur = held;
      held = [];
      runs.push([]);
      snap();
      continue;
    }
    cur.sort((a, b) => a - b);
    const k = cur.shift() as number;
    runs[runs.length - 1].push(k);
    if (next < DECK.length) {
      const n = DECK[next++];
      if (n >= k) cur.push(n);
      else held.push(n);
    }
    snap();
  }
  return out;
})();
export function Snowplow({ t }: StepCtx) {
  const k = Math.min(SNOW.length - 1, Math.floor(clamp((t - 0.3) / 0.19, 0, 99)));
  const st = SNOW[k];
  const heap = [...st.heap].sort((a, b) => Number(a[1]) - Number(b[1]) || a[0] - b[0]);
  return (
    <Svg label="Replacement selection on the deck with a heap of four slots: each step the smallest key not smaller than the last one written goes to the current run, the next input takes its place, and a key too small waits for the next run. The runs come out 5, 8 and 3 keys long. On 200,000 random keys at memory 1,000, interior runs average 2.0 times memory" h={290}>
      <T x={30} y={22} s={12} f={C.latte}>input</T>
      {DECK.map((v, i) => (
        <Cell key={i} x={30 + i * 34} y={30} v={v} w={28} c={C.latte} o={i < st.next ? 0.2 : 1} />
      ))}
      <T x={30} y={92} s={12} f={C.crema}>heap</T>
      {heap.map(([v, held], i) => (
        <Cell key={i} x={90 + i * 40} y={74} v={v} w={32} c={held ? C.cinnamon : C.crema} fill={held} />
      ))}
      <T x={270} y={92} s={12} f={C.cinnamon} o={easeOut(seg(t, 1.0, 1.3))}>blue: waits for the next run</T>
      {st.runs.map((r, j) => (
        <g key={j}>
          <T x={30} y={146 + j * 36} s={12} f={C.latte}>run {j + 1}</T>
          {r.map((v, i) => (
            <Cell key={i} x={90 + i * 34} y={128 + j * 36} v={v} w={28} c={j === st.runs.length - 1 ? C.caramel : C.crema} />
          ))}
        </g>
      ))}
      <T x={30} y={278} s={12} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>200,000 random keys: runs average 2.0 × memory</T>
    </Svg>
  );
}

// 5 · Ordered input. Two tapes at memory 100. Sorted keys: one run grows the whole length, nothing ever held back.
// Reversed keys: the run is cut every memory-length, a hundred cuts.
export function OrderedInput({ t }: StepCtx) {
  const g = clamp((t - 0.3) / 1.6, 0, 1);
  const r = clamp((t - 2.0) / 1.6, 0, 1);
  return (
    <Svg label="Ten thousand sorted keys at memory 100 give one run the whole length; ten thousand reversed keys give 100 runs of 100, no better than the simple method" h={240}>
      <T x={40} y={30} s={12} f={C.crema}>10,000 sorted keys, memory 100</T>
      <rect x={40} y={42} width={520 * g} height={18} rx={2} fill={C.caramel} opacity={0.85} />
      <T x={40} y={84} s={12} f={C.caramel} o={easeOut(seg(t, 1.8, 2.1))}>1 run</T>
      <T x={40} y={130} s={12} f={C.crema} o={easeOut(seg(t, 1.9, 2.2))}>reversed</T>
      {Array.from({ length: 100 }, (_, i) => (
        <rect key={i} x={40 + i * 5.2} y={142} width={4.2} height={18} fill={C.cherryText} opacity={r * 100 > i ? 0.85 : 0} />
      ))}
      <T x={40} y={184} s={12} f={C.cherryText} o={easeOut(seg(t, 3.6, 4.0))}>100 runs of 100</T>
      <T x={40} y={214} s={12} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>no better than the simple method</T>
    </Svg>
  );
}

// 6 · The loser tree. Eight sorted runs (the deck in pairs) feed a tournament; the smallest head climbs to the top,
// lighting one comparison per level, and leaves for the output; the run's next key replays only its own path. Then the
// cost at fan-in 16,383: 14 comparisons per item.
const PAIRS = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => [DECK[2 * i], DECK[2 * i + 1]].sort((a, b) => a - b));
export function LoserTreeMerge({ t }: StepCtx) {
  const OUT = 4;
  const k = clamp((t - 0.4) / 0.6, 0, OUT);
  const done = Math.floor(k);
  const ptr = PAIRS.map(() => 0);
  const outs: number[] = [];
  const winners: number[] = [];
  for (let n = 0; n < done; n++) {
    let best = -1;
    PAIRS.forEach((r, i) => {
      if (ptr[i] < r.length && (best < 0 || r[ptr[i]] < PAIRS[best][ptr[best]])) best = i;
    });
    outs.push(PAIRS[best][ptr[best]]);
    winners.push(best);
    ptr[best]++;
  }
  let win = -1;
  PAIRS.forEach((r, i) => {
    if (ptr[i] < r.length && (win < 0 || r[ptr[i]] < PAIRS[win][ptr[win]])) win = i;
  });
  const climb = clamp((k - done) / 0.7, 0, 1) * 3;
  const LX = (i: number) => 60 + i * 64;
  const node = (lvl: number, i: number): [number, number] => {
    const span = 2 ** lvl;
    return [LX(i * span) + ((span - 1) * 64) / 2 + 15, 150 - lvl * 36];
  };
  return (
    <Svg label="Eight sorted runs from the deck feed a tournament. The smallest head climbs to the top, one comparison per level, and leaves for the output; the next key from that run replays only its own path. At a fan-in of 16,383, that is 14 comparisons per item" h={300}>
      {PAIRS.map((r, i) => (
        <g key={i}>
          {r.map((v, j) => (
            <Cell key={j} x={LX(i)} y={170 + j * 30} v={v} w={30} c={j === ptr[i] ? (i === win ? C.caramel : C.crema) : C.latte} o={j < ptr[i] ? 0.15 : 1} />
          ))}
        </g>
      ))}
      {[1, 2, 3].map((lvl) =>
        Array.from({ length: 8 / 2 ** lvl }, (_, i) => {
          const [x, y] = node(lvl, i);
          const [x1, y1] = node(lvl - 1, 2 * i);
          const [x2, y2] = node(lvl - 1, 2 * i + 1);
          const onPath = win >= 0 && Math.floor(win / 2 ** lvl) === i && climb >= lvl;
          return (
            <g key={`${lvl}-${i}`}>
              <path d={`M${x1} ${lvl === 1 ? 168 : y1} L${x} ${y} L${x2} ${lvl === 1 ? 168 : y2}`} fill="none" stroke={onPath ? C.caramel : C.mocha} strokeWidth={onPath ? 2 : 1.2} />
              <circle cx={x} cy={y} r={5} fill={onPath ? C.caramel : C.roast} stroke={C.latte} strokeWidth={1} />
            </g>
          );
        }),
      )}
      <T x={60} y={22} s={12} f={C.latte}>output</T>
      {outs.map((v, i) => (
        <Cell key={i} x={130 + i * 36} y={8} v={v} w={30} c={C.caramel} />
      ))}
      <T x={60} y={290} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>fan-in 16,383: 14 comparisons per item</T>
    </Svg>
  );
}

// 7 · Fan-in is bought with buffers. Memory split into block buffers, one per run plus one for output: as the fan-in
// grows, the slices shrink. Then DuckDB's two sentences side by side.
export function FanInLimit({ t }: StepCtx) {
  const ks = [3, 7, 15];
  const stage = Math.min(2, Math.floor(clamp((t - 0.3) / 0.7, 0, 2.99)));
  const k = ks[stage];
  const W = 480;
  return (
    <Svg label="Memory split into block buffers, one per input run and one for output; as the fan-in grows, each buffer shrinks, so k is at most memory over block size, minus one. DuckDB: k-way merge minimizes I/O for external sorting; cascade merge is more efficient in memory" h={280}>
      <T x={40} y={24} s={12} f={C.latte}>memory</T>
      {Array.from({ length: k + 1 }, (_, i) => (
        <rect key={`${k}-${i}`} x={40 + (i * W) / (k + 1) + 1} y={34} width={W / (k + 1) - 2} height={28} rx={2} fill={i === k ? C.caramel : C.crema} opacity={i === k ? 0.85 : 0.6} />
      ))}
      <T x={40} y={86} s={12} f={C.crema}>one buffer per input run</T>
      <T x={520} y={86} s={12} a="end" f={C.caramel}>output</T>
      <T x={40} y={120} s={12} f={C.caramel} o={easeOut(seg(t, 2.2, 2.6))}>fan-in k ≤ M / B − 1</T>
      <g opacity={easeOut(seg(t, 2.8, 3.2))}>
        <T x={40} y={170} s={12} f={C.crema}>K-way: "... because it minimizes I/O."</T>
        <T x={40} y={196} s={12} f={C.cinnamon}>Cascade: "... in-memory sorting because</T>
        <T x={40} y={216} s={12} f={C.cinnamon}>it is more efficient than K-way merge."</T>
      </g>
      <g opacity={easeOut(seg(t, 3.4, 3.8))}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + i * 60} y={244} width={50} height={12} rx={2} fill={C.cinnamon} opacity={0.7} />
        ))}
        <path d="M65 260 Q95 272 125 260 M185 260 Q215 272 245 260" fill="none" stroke={C.cinnamon} strokeWidth={1.2} />
        <T x={300} y={256} s={12} f={C.cinnamon}>two at a time, in memory</T>
      </g>
    </Svg>
  );
}

// 8 · The running example. 2^27 keys, memory 2^23, blocks of 512: 16 runs; fan-in 16,383; one pass. Then the bill:
// four scans of 262,144 blocks laid end to end, read and write for run generation, read and write for the merge,
// 1,048,576 in all.
export function RunningExample({ t }: StepCtx) {
  const W = 480;
  const LAB = ['read', 'write', 'read', 'write'];
  return (
    <Svg label="2 to the 27 keys, memory 2 to the 23, blocks of 512: 16 runs, fan-in up to 16,383, one merge pass. The bill: four scans of 262,144 blocks, read and write for run generation and again for the merge, 1,048,576 block transfers in all" h={280}>
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <T x={40} y={26} s={12} f={C.latte}>N = 2²⁷ keys · M = 2²³ · B = 512</T>
      </g>
      {[
        ['16 runs', 0.6],
        ['fan-in 16,383', 1.0],
        ['1 merge pass', 1.4],
      ].map(([l, s0], i) => (
        <T key={l as string} x={40 + i * 180} y={62} s={12} f={C.caramel} o={easeOut(seg(t, s0 as number, (s0 as number) + 0.3))}>{l as string}</T>
      ))}
      <T x={40} y={110} s={12} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>one scan: 262,144 blocks</T>
      <rect x={40} y={120} width={(W / 4) * easeOut(seg(t, 1.9, 2.3))} height={16} rx={2} fill={C.crema} opacity={0.8} />
      {LAB.map((l, i) => {
        const g = easeOut(seg(t, 2.5 + i * 0.35, 2.85 + i * 0.35));
        return (
          <g key={i}>
            <rect x={40 + (i * W) / 4 + 1} y={170} width={(W / 4 - 2) * g} height={16} rx={2} fill={i < 2 ? C.crema : C.caramel} opacity={0.85} />
            <T x={40 + (i * W) / 4 + W / 8} y={206} s={12} a="middle" f={C.latte} o={g}>{l}</T>
          </g>
        );
      })}
      <T x={40 + W / 4} y={228} s={12} a="middle" f={C.crema} o={easeOut(seg(t, 3.2, 3.5))}>run generation</T>
      <T x={40 + (3 * W) / 4} y={228} s={12} a="middle" f={C.caramel} o={easeOut(seg(t, 3.9, 4.2))}>merge</T>
      <T x={40} y={262} s={12} f={C.caramel} o={easeOut(seg(t, 4.2, 4.6))}>1,048,576 transfers: four scans</T>
    </Svg>
  );
}

// 9 · A small instance. Sixteen runs, three rows. Fan-in 2 pairs them off four times; fan-in 4 merges in two passes;
// fan-in 16 in one. Each row collapses pass by pass, its count appearing at the end.
export function SmallInstance({ t }: StepCtx) {
  const ROWS: [number, number][] = [
    [2, 4],
    [4, 2],
    [16, 1],
  ];
  return (
    <Svg label="Sixteen runs. With a fan-in of 2 they merge in 4 passes, with 4 in 2 passes, with 16 in 1" h={260}>
      {ROWS.map(([f, p], r) => {
        const y = 40 + r * 74;
        const prog = clamp((t - 0.3 - r * 0.2) / 2.6, 0, 1) * p;
        const lvl = Math.floor(prog);
        const fr = easeInOut(prog - lvl);
        const n0 = Math.max(1, 16 / f ** lvl);
        const n1 = Math.max(1, n0 / f);
        const parts = lvl >= p ? 1 : fr > 0.5 ? n1 : n0;
        return (
          <g key={f}>
            <T x={30} y={y + 14} s={12} f={C.latte}>fan-in {f}</T>
            {Array.from({ length: parts }, (_, i) => (
              <rect key={i} x={140 + (i * 300) / parts + 1} y={y} width={300 / parts - 2} height={20} rx={2} fill={lvl >= p ? C.caramel : C.crema} opacity={0.75} />
            ))}
            <T x={540} y={y + 14} s={12} a="end" f={C.caramel} o={lvl >= p ? 1 : 0}>{p} {p === 1 ? 'pass' : 'passes'}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Predict. The memory bar halves, again and again, each time a question mark over the pass count. After
// answering: the table's rows drop in, the pass column mostly 1, the last 2.
export function PredictTable({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const h = Math.min(5, Math.floor(clamp((t - 0.3) / 0.4, 0, 5.99)));
  const rows = answered ? clamp((s - 0.2) / 1.2, 0, 1) * 6 : 0;
  return (
    <Svg label="Memory halves again and again while the file and block size stay fixed; how often does the merge-pass count change? After answering, the pass counts appear: 1, 1, 1, 1, 1, then 2" h={260}>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={40} y={30 + i * 32} width={320 / 2 ** i} height={18} rx={2} fill={C.crema} opacity={i <= h ? 0.8 : 0} />
          {!answered && i <= h && <T x={420} y={44 + i * 32} s={14} f={C.caramel} o={pulse}>?</T>}
          {answered && (
            <T x={420} y={44 + i * 32} s={13} f={TABLE[i][3] > 1 ? C.cherryText : C.caramel} o={clamp(rows - i, 0, 1)}>{TABLE[i][3]} {TABLE[i][3] > 1 ? 'passes' : 'pass'}</T>
          )}
        </g>
      ))}
      {!answered && <T x={300} y={248} s={13} a="middle" f={C.caramel} o={pulse}>how often does it change?</T>}
    </Svg>
  );
}

// 11 · The table. Six rows drop in: memory 2^23 down to 2^18, runs 16 to 512, fan-in 16,383 to 511, passes. The last
// row lights red: fan-in 511 has dropped below 512 runs, and the passes jump to 2.
export function ThresholdTable({ t }: StepCtx) {
  const COLS = ['memory', 'runs', 'fan-in', 'passes'];
  const CX = [60, 190, 320, 470];
  const red = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="Memory 2^23 to 2^18: runs 16, 32, 64, 128, 256, 512; fan-in 16,383, 8,191, 4,095, 2,047, 1,023, 511; passes 1, 1, 1, 1, 1, then 2 once the fan-in drops below the run count" h={280}>
      {COLS.map((c, i) => (
        <T key={c} x={CX[i]} y={26} s={12} f={C.latte}>{c}</T>
      ))}
      <path d="M50 36 L560 36" stroke={C.mocha} strokeWidth={1.2} />
      {TABLE.map(([m, r, f, p], i) => {
        const o = easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35));
        const last = i === 5;
        const c = last && red > 0.5 ? C.cherryText : C.crema;
        return (
          <g key={m} opacity={o} transform={`translate(0 ${lerp(-8, 0, o)})`}>
            <T x={CX[0]} y={60 + i * 30} s={12} f={c}>{m}</T>
            <T x={CX[1]} y={60 + i * 30} s={12} f={c}>{r}</T>
            <T x={CX[2]} y={60 + i * 30} s={12} f={c}>{f}</T>
            <T x={CX[3]} y={60 + i * 30} s={12} f={last ? c : C.caramel}>{p}</T>
          </g>
        );
      })}
      <rect x={50} y={42 + 5 * 30} width={510} height={26} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={red} />
      <T x={40} y={262} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>fan-in 511 below 512 runs: a second pass</T>
    </Svg>
  );
}

// 12 · Where it runs. Four chips, a sort operator, a sort-merge join, a spilling aggregation, an LSM compaction, each
// sending its runs down into the same merge; then DuckDB's buffer manager unloading blocks to disk.
export function WhereItRuns({ t }: StepCtx) {
  const CH = ['sort operator', 'sort-merge join', 'spilling aggregation', 'LSM compaction'];
  const flow = (t * 0.8) % 1;
  return (
    <Svg label="A sort operator, a sort-merge join, a spilling aggregation and an LSM compaction all send their runs into the same k-way merge. DuckDB: the buffer manager can unload blocks from memory to disk" h={280}>
      {CH.map((c, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.35, 0.6 + i * 0.35));
        const x = 30;
        const y = 16 + i * 38;
        return (
          <g key={c} opacity={clamp(a, 0, 1)}>
            <rect x={x} y={y} width={250} height={28} rx={14} fill="none" stroke={C.crema} strokeWidth={1.3} />
            <T x={x + 125} y={y + 19} s={12} a="middle" f={C.crema}>{c}</T>
            <path d={`M${x + 252} ${y + 14} L380 87`} stroke={C.latte} strokeWidth={1.1} />
            <circle cx={lerp(x + 252, 380, flow)} cy={lerp(y + 14, 87, flow)} r={3} fill={C.caramel} opacity={t > 1.8 ? 1 : 0} />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.6, 2.0))}>
        <rect x={380} y={72} width={150} height={30} rx={4} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.5} />
        <T x={455} y={92} s={12} a="middle" f={C.caramel}>k-way merge</T>
      </g>
      <g opacity={easeOut(seg(t, 2.8, 3.2))}>
        <T x={30} y={210} s={12} f={C.crema}>DuckDB: "The buffer manager can unload</T>
        <T x={30} y={230} s={12} f={C.crema}>blocks from memory to disk."</T>
      </g>
    </Svg>
  );
}

// 13 · Handoff. The sorted file; a search halves it, and halves again, a bracket shrinking onto one key. Binary search
// invariants and boundaries, next.
export function Handoff({ t }: StepCtx) {
  const S = [...DECK].sort((a, b) => a - b);
  const X = (i: number) => 30 + i * 34;
  const target = S.indexOf(9);
  const ranges: [number, number][] = [];
  let lo = 0;
  let hi = 15;
  ranges.push([lo, hi]);
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (S[mid] < 9) lo = mid + 1;
    else hi = mid;
    ranges.push([lo, hi]);
  }
  const k = clamp((t - 0.4) / 0.5, 0, ranges.length - 1);
  const i0 = Math.floor(k);
  const i1 = Math.min(i0 + 1, ranges.length - 1);
  const f = easeInOut(k - i0);
  const a = lerp(ranges[i0][0], ranges[i1][0], f);
  const b = lerp(ranges[i0][1], ranges[i1][1], f);
  return (
    <Svg label="The deck, sorted. A search halves the range again and again, the bracket shrinking onto one key: binary search, next" h={200}>
      {S.map((v, i) => (
        <Cell key={i} x={X(i)} y={60} v={v} w={28} c={i === target && k >= ranges.length - 1 ? C.caramel : i >= a - 0.01 && i <= b + 0.01 ? C.crema : C.latte} o={i >= a - 0.01 && i <= b + 0.01 ? 1 : 0.35} />
      ))}
      <path d={`M${X(a)} 100 L${X(a)} 106 L${X(b) + 28} 106 L${X(b) + 28} 100`} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <T x={300} y={150} s={12} a="middle" f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>sorted: halve, halve, halve</T>
      <T x={300} y={180} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>binary search, next</T>
    </Svg>
  );
}
