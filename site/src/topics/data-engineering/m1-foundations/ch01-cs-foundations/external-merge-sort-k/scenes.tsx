import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// External merge sort, drawn from examples.py: 1 TiB of data, 16 GiB of memory, 1 MiB blocks; 64 quicksort runs, 32
// replacement-selection runs, 16,384 buffers, fan-in 16,383, 2 passes, 7 passes two at a time. The small keys in the
// snowplow and the four-run merge are illustrative sequences, simulated here with the real algorithms.

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

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));

/** A run: a vertical strip of sorted keys, drawn as bars rising left to right. */
const RunCell = ({ x, y, w, h, o = 1, sorted = 1, c = C.primary }: { x: number; y: number; w: number; h: number; o?: number; sorted?: number; c?: string }) => {
  const RAW = [0.7, 0.2, 0.9, 0.4, 0.6, 0.3];
  const SRT = [0.2, 0.3, 0.4, 0.6, 0.7, 0.9];
  return o <= 0 ? null : (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={C.panel} stroke={C.line} strokeWidth={1} />
      {RAW.map((r, i) => {
        const v = lerp(r, SRT[i], sorted);
        return <rect key={i} x={x + 3 + (i * (w - 6)) / 6} y={y + h - 3 - v * (h - 6)} width={(w - 6) / 6 - 1} height={v * (h - 6)} fill={c} opacity={0.85} />;
      })}
    </g>
  );
};

// 1 · A hash table that outgrows its memory box spills out of it (red); a sort cuts the data into pieces that each fit,
// and the pieces pass through the same box one at a time.
export function Problem({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 0.2, 1.3));
  const spill = easeOut(seg(t, 1.0, 1.5));
  const piece = seg(t, 1.9, 3.4) * 4;
  return (
    <Svg label="A hash table that outgrows memory must spill and recurse; a sort splits into making runs and merging them instead" h={300}>
      <T x={25} y={30} s={13} f={C.secondary} o={fade(t, 0, 0.3)}>
        memory
      </T>
      <rect x={25} y={42} width={150} height={90} rx={4} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={fade(t, 0, 0.3)} />
      <rect x={35} y={52} width={Math.min(130, 210 * grow)} height={70} rx={3} fill={C.second} opacity={0.35} />
      {spill > 0 && <rect x={175} y={52} width={80 * spill} height={70} rx={3} fill={C.bad} />}
      <T x={25} y={160} s={13} f={C.badText} o={spill}>
        hash table: spills, recurses
      </T>
      <g opacity={fade(t, 1.7, 2.0)}>
        <T x={270} y={30} s={13} f={C.secondary}>
          a sort: pieces that fit
        </T>
        {[0, 1, 2, 3].map((i) => {
          const k = easeInOut(seg(piece, i, i + 0.8));
          const x = lerp(300 + i * 70, 40 + i * 32, k);
          const y = lerp(52, 200, k);
          return <RunCell key={i} x={x} y={y} w={60} h={70} sorted={easeInOut(seg(piece, i + 0.3, i + 0.6))} c={C.focus} />;
        })}
      </g>
      <T x={25} y={292} s={13} f={C.focus} o={fade(t, 3.2, 3.5)}>
        no piece needs the whole thing to fit
      </T>
    </Svg>
  );
}

// 2 · The terabyte as 64 cells of 16 GiB (one memory load each). Phase one sorts them cell by cell; phase two merges them
// into one sorted output on the right.
export function TwoPhases({ t }: StepCtx) {
  const facts = fade(t, 0.2, 0.6);
  const p1 = seg(t, 1.0, 2.2) * 64;
  const p2 = easeInOut(seg(t, 2.4, 3.5));
  return (
    <Svg label="One terabyte, sixteen gibibytes of memory, one mebibyte blocks: phase one makes runs, phase two merges them" h={330}>
      {['1 TiB data', '16 GiB memory', '1 MiB blocks'].map((v, i) => (
        <T key={v} x={25 + i * 190} y={28} s={13} f={C.primary} o={facts}>
          {v}
        </T>
      ))}
      <T x={25} y={68} s={13} f={C.focus} o={fade(t, 0.9, 1.2)}>
        phase one: 64 runs
      </T>
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8);
        const c = i % 8;
        const done = p1 > i;
        return <rect key={i} x={25 + c * 30} y={82 + r * 28} width={24} height={22} rx={2} fill={done ? C.focus : C.band} stroke={C.line} strokeWidth={0.8} opacity={facts} />;
      })}
      <rect
        x={25 + (Math.min(63, Math.floor(p1)) % 8) * 30 - 3}
        y={82 + Math.floor(Math.min(63, Math.floor(p1)) / 8) * 28 - 3}
        width={30}
        height={28}
        rx={3}
        fill="none"
        stroke={C.second}
        strokeWidth={1.6}
        opacity={p1 > 0 && p1 < 64 ? 1 : 0}
      />
      <T x={360} y={68} s={13} f={C.second} o={fade(t, 2.3, 2.6)}>
        phase two: merge
      </T>
      {p2 > 0 &&
        Array.from({ length: 8 }, (_, r) => <line key={r} x1={265} y1={93 + r * 28} x2={lerp(265, 360, p2)} y2={lerp(93 + r * 28, 190, p2)} stroke={C.second} strokeWidth={1.2} opacity={0.7} />)}
      <rect x={360} y={82} width={36} height={220 * p2} rx={3} fill={C.second} opacity={0.8} />
      <T x={410} y={190} s={13} f={C.second} o={fade(t, 3.3, 3.6)}>
        sorted output
      </T>
    </Svg>
  );
}

// 3 · Memory fills with unsorted keys, the keys sort in place, and the load drops into the run grid as one run. The
// counter climbs to 64 = 1 TiB / 16 GiB.
export function QuicksortRuns({ t }: StepCtx) {
  const N = 64;
  const cols = 16;
  const cyc = seg(t, 0.3, 1.6) * 2;
  const k = cyc % 1;
  const first = cyc < 2;
  const written = first ? Math.floor(cyc) : 2 + Math.floor(easeOut(seg(t, 1.6, 2.8)) * (N - 2));
  return (
    <Svg label="Loading memory, sorting it, and spilling it as one run, repeated: a terabyte over sixteen gibibyte loads gives sixty-four runs" h={330}>
      <T x={25} y={28} s={13} f={C.secondary}>
        memory: load, sort, write
      </T>
      {first && cyc > 0 && <RunCell x={25} y={40 + 120 * easeInOut(seg(k, 0.75, 1))} w={150} h={80} sorted={easeInOut(seg(k, 0.25, 0.7))} c={C.focus} o={1 - seg(k, 0.9, 1)} />}
      <rect x={20} y={36} width={160} height={88} rx={4} fill="none" stroke={C.secondary} strokeWidth={1.2} strokeDasharray="4 3" />
      <T x={575} y={28} s={13} f={C.secondary} a="end">
        runs written
      </T>
      <T x={575} y={70} s={30} f={C.focus} a="end">
        {`${written}`}
      </T>
      {Array.from({ length: N }, (_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const on = i < written;
        return <rect key={i} x={25 + c * 34} y={160 + r * 34} width={28} height={28} rx={4} fill={on ? C.focus : C.band} opacity={on ? 1 : 0.7} />;
      })}
      <T x={25} y={318} s={14} f={C.primary} o={fade(t, 2.8, 3.2)}>
        1 TiB / 16 GiB = 64 runs
      </T>
    </Svg>
  );
}

// 4 · The snowplow, run on a small sequence: memory holds three keys. Each beat the smallest key that can still join the
// current run leaves for the run strip, and the next input takes its slot; a key smaller than the last one written is
// parked (grey) for the next run. Then the run lengths: about twice memory on random data, one run on sorted data.
const RS: { slots: (number | null)[]; tags: number[]; pop: number; val: number; run: number }[] = [
  { slots: [5, 9, 2], tags: [1, 1, 1], pop: 2, val: 2, run: 1 },
  { slots: [5, 9, 7], tags: [1, 1, 1], pop: 0, val: 5, run: 1 },
  { slots: [8, 9, 7], tags: [1, 1, 1], pop: 2, val: 7, run: 1 },
  { slots: [8, 9, 1], tags: [1, 1, 2], pop: 0, val: 8, run: 1 },
  { slots: [6, 9, 1], tags: [2, 1, 2], pop: 1, val: 9, run: 1 },
  { slots: [6, 3, 1], tags: [2, 2, 2], pop: 2, val: 1, run: 2 },
];
export function ReplacementSelection({ t }: StepCtx) {
  const beat = seg(t, 0.6, 2.6) * RS.length;
  const i = Math.min(RS.length - 1, Math.floor(beat));
  const f = RS[i];
  const k = beat - i;
  const outs = RS.slice(0, beat >= RS.length ? RS.length : i).map((r) => r);
  const lens = fade(t, 2.9, 3.3);
  return (
    <Svg label="Popping the smallest from a heap and still fitting in the new item if it is larger makes runs about twice as long, so half as many runs" h={330}>
      <T x={25} y={28} s={13} f={C.secondary}>
        memory: 3 keys
      </T>
      {f.slots.map((v, j) => {
        const leaving = j === f.pop && beat < RS.length;
        const parked = f.tags[j] > f.run;
        return v === null ? null : (
          <g key={j} opacity={leaving ? 1 - easeOut(seg(k, 0.3, 0.6)) : 1}>
            <rect x={25 + j * 56} y={40} width={44} height={40} rx={4} fill={C.panel} stroke={parked ? C.line : leaving ? C.focus : C.secondary} strokeWidth={leaving ? 2 : 1.2} />
            <T x={47 + j * 56} y={66} s={15} a="middle" f={parked ? C.quiet : C.primary}>
              {`${v}`}
            </T>
          </g>
        );
      })}
      <T x={25} y={108} s={13} f={C.quiet} o={f.tags.some((g) => g > f.run) ? 1 : 0}>
        grey: waits for the next run
      </T>
      <T x={270} y={28} s={13} f={C.secondary}>
        runs written
      </T>
      {outs.map((r, j) => {
        const x = 270 + j * 46 + (r.run > 1 ? 20 : 0);
        return (
          <g key={j}>
            <rect x={x} y={40} width={40} height={40} rx={4} fill={C.panel} stroke={r.run > 1 ? C.second : C.focus} strokeWidth={1.4} />
            <T x={x + 20} y={66} s={15} a="middle" f={r.run > 1 ? C.second : C.focus}>
              {`${r.val}`}
            </T>
          </g>
        );
      })}
      <g opacity={lens}>
        <T x={25} y={176} s={13} f={C.secondary}>
          memory
        </T>
        <rect x={150} y={164} width={110} height={14} rx={3} fill={C.secondary} />
        <T x={25} y={212} s={13} f={C.secondary}>
          random data
        </T>
        <rect x={150} y={200} width={220 * easeInOut(seg(t, 3.0, 3.5))} height={14} rx={3} fill={C.focus} />
        <T x={575} y={212} s={13} f={C.focus} a="end" o={fade(t, 3.4, 3.7)}>
          about 2× memory
        </T>
        <T x={25} y={248} s={13} f={C.secondary}>
          sorted data
        </T>
        <rect x={150} y={236} width={420 * easeInOut(seg(t, 3.5, 4.0))} height={14} rx={3} fill={C.second} />
        <T x={575} y={282} s={13} f={C.second} a="end" o={fade(t, 3.9, 4.2)}>
          one run for the whole file
        </T>
        <T x={25} y={318} s={14} f={C.primary} o={fade(t, 3.6, 4.0)}>
          64 runs → 32 runs
        </T>
      </g>
    </Svg>
  );
}

// 5 · Predict. Before: 32 longer runs against 64 shorter ones. After: one strip of memory as cache lines; the heap's sift
// jumps around it one key at a time (each jump a miss, red), while quicksort's two pointers sweep one cached block.
const JUMPS = [3, 17, 8, 22, 1, 13, 26, 6, 19, 11];
export function WhyQuicksortPredict({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="A heap sift scatters across memory one item at a time; a quicksort partition stays inside the cache" h={300}>
      <T x={25} y={30} s={13} f={C.second} o={fade(t, 0.2, 0.5)}>
        snowplow heap: 32 runs
      </T>
      <rect x={25} y={40} width={540 * easeInOut(seg(t, 0.3, 0.9))} height={12} rx={3} fill={C.second} opacity={0.8} />
      <T x={25} y={82} s={13} f={C.focus} o={fade(t, 0.6, 0.9)}>
        quicksort: 64 runs
      </T>
      {[0, 1].map((h) => (
        <rect key={h} x={25 + h * 272} y={92} width={268 * easeInOut(seg(t, 0.7 + h * 0.2, 1.2 + h * 0.2))} height={12} rx={3} fill={C.focus} opacity={0.8} />
      ))}
      {!on && (
        <T x={300} y={170} s={16} f={C.focus} a="middle" o={fade(t, 1.3, 1.7)}>
          why give up longer runs?
        </T>
      )}
      {on && (
        <g opacity={fade(s, 0.1, 0.4)}>
          <T x={25} y={150} s={13} f={C.secondary}>
            memory, in cache lines
          </T>
          {Array.from({ length: 28 }, (_, i) => {
            const hitHeap = JUMPS.slice(0, Math.floor(seg(s, 0.4, 2.0) * JUMPS.length)).includes(i);
            return <rect key={i} x={25 + i * 19.5} y={160} width={16} height={22} rx={2} fill={hitHeap ? C.bad : C.band} />;
          })}
          <T x={25} y={208} s={13} f={C.badText} o={fade(s, 0.8, 1.1)}>
            heap sift: a miss per key
          </T>
          <rect x={25 + 8 * 19.5 - 3} y={226} width={6 * 19.5 + 3} height={28} rx={3} fill="none" stroke={C.focus} strokeWidth={1.4} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={25 + (8 + i) * 19.5} y={229} width={16} height={22} rx={2} fill={C.band} />
          ))}
          {[0, 1].map((p) => {
            const m = easeInOut(seg(s, 1.2, 2.4));
            const x = p === 0 ? lerp(25 + 8 * 19.5 + 8, 25 + 10.5 * 19.5, m) : lerp(25 + 13 * 19.5 + 8, 25 + 11 * 19.5, m);
            return <path key={p} d={`M ${x} 258 l -5 8 h 10 Z`} fill={C.focus} />;
          })}
          <T x={25} y={290} s={13} f={C.focus} o={fade(s, 1.6, 2.0)}>
            quicksort: two pointers, one cached block
          </T>
        </g>
      )}
    </Svg>
  );
}

// 6 · Two at a time costs a full read-and-write of the data per level (six levels stack up, red). Then the k-way merge:
// four runs, a heap holding each run's front key, the smallest popping to the output and its run refilling the heap.
const RUNS = [
  [3, 8, 12],
  [1, 9, 14],
  [5, 6, 15],
  [2, 10, 11],
];
const ORDER: [number, number][] = [];
{
  const ptr = [0, 0, 0, 0];
  for (let n = 0; n < 12; n++) {
    let best = -1;
    for (let r = 0; r < 4; r++) if (ptr[r] < 3 && (best < 0 || RUNS[r][ptr[r]] < RUNS[best][ptr[best]])) best = r;
    ORDER.push([best, RUNS[best][ptr[best]]]);
    ptr[best]++;
  }
}
export function KWayMerge({ t }: StepCtx) {
  const levels = seg(t, 0.4, 1.4) * 6;
  const kw = fade(t, 1.8, 2.1);
  const pops = Math.floor(seg(t, 2.2, 3.8) * 8);
  const ptr = [0, 0, 0, 0];
  for (let n = 0; n < pops; n++) ptr[ORDER[n][0]]++;
  return (
    <Svg label="A min-heap holds every run's front item and pops the smallest to the output, folding all runs down in a single pass" h={340}>
      {kw <= 0 && (
        <T x={25} y={28} s={13} f={C.badText} o={fade(t, 0.3, 0.6)}>
          two at a time: a full pass per level
        </T>
      )}
      {kw < 1 && Array.from({ length: 6 }, (_, l) => <rect key={l} x={25} y={44 + l * 18} width={540 * clamp01(levels - l)} height={10} rx={3} fill={C.bad} opacity={1 - kw} />)}
      {kw > 0 && (
        <g opacity={kw}>
          {RUNS.map((run, r) => (
            <g key={r}>
              <T x={45 + r * 70} y={28} s={13} f={C.secondary} a="middle">
                {`run ${r + 1}`}
              </T>
              {run.map((v, j) =>
                j < ptr[r] + 1 ? null : (
                  <g key={j}>
                    <rect x={25 + r * 70} y={44 + (j - ptr[r] - 1) * 30} width={40} height={24} rx={3} fill={C.panel} stroke={C.line} />
                    <T x={45 + r * 70} y={61 + (j - ptr[r] - 1) * 30} s={13} a="middle" f={C.primary}>
                      {`${v}`}
                    </T>
                  </g>
                ),
              )}
            </g>
          ))}
          <T x={25} y={150} s={13} f={C.second}>
            heap: each run's front key
          </T>
          {RUNS.map((run, r) =>
            ptr[r] < 3 ? (
              <g key={r}>
                <rect x={25 + r * 70} y={162} width={40} height={28} rx={14} fill={C.panel} stroke={C.second} strokeWidth={1.4} />
                <T x={45 + r * 70} y={181} s={13} a="middle" f={C.second}>
                  {`${run[ptr[r]]}`}
                </T>
              </g>
            ) : null,
          )}
          <T x={25} y={232} s={13} f={C.focus}>
            output
          </T>
          {ORDER.slice(0, pops).map(([, v], n) => (
            <g key={n}>
              <rect x={25 + n * 44} y={244} width={38} height={26} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.3} />
              <T x={44 + n * 44} y={262} s={13} a="middle" f={C.focus}>
                {`${v}`}
              </T>
            </g>
          ))}
          <T x={25} y={318} s={14} f={C.primary} o={fade(t, 3.6, 4.0)}>
            one read, one write of every block: one pass
          </T>
        </g>
      )}
    </Svg>
  );
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// 7 · Five long streams on the left (their lengths run off the frame); the heap in the middle holds one key from each,
// and keys flow out to the right in order. Then each stream gets its buffer: the part that actually costs memory.
export function HeapqMerge({ t }: StepCtx) {
  const flow = t > 0.6 ? (t - 0.6) * 1.4 : 0;
  const buf = fade(t, 2.4, 2.9);
  return (
    <Svg label="Holding one record per stream and yielding the smallest forever merges any number of sorted streams in bounded memory" h={320}>
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i} opacity={fade(t, 0.1 + i * 0.08, 0.4 + i * 0.08)}>
          <T x={25} y={46 + i * 40} s={13} f={C.secondary}>
            {`stream ${i + 1}`}
          </T>
          <rect x={120} y={34 + i * 40} width={180} height={16} rx={3} fill={C.band} />
          {buf > 0 && <rect x={250} y={34 + i * 40} width={50} height={16} rx={3} fill="none" stroke={C.second} strokeWidth={1.5} opacity={buf} />}
          <circle cx={340} cy={42 + i * 40} r={8} fill={C.focus} opacity={fade(t, 0.4, 0.7)} />
        </g>
      ))}
      <rect x={325} y={24} width={30} height={196} rx={6} fill="none" stroke={C.focus} strokeWidth={1.3} opacity={fade(t, 0.4, 0.7)} />
      <T x={340} y={244} s={13} f={C.focus} a="middle" o={fade(t, 0.5, 0.8)}>
        heap
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const p = (flow + i / 6) % 1;
        return flow > 0 ? <circle key={i} cx={lerp(370, 570, p)} cy={122} r={5} fill={C.focus} opacity={Math.sin(Math.PI * p)} /> : null;
      })}
      <T x={575} y={102} s={13} f={C.focus} a="end" o={fade(t, 1.0, 1.3)}>
        yielded in order
      </T>
      <T x={25} y={276} s={14} f={C.primary} o={fade(t, 1.4, 1.8)}>
        in memory: one key per stream
      </T>
      <T x={25} y={304} s={14} f={C.second} o={buf}>
        what it does need: a buffer per run
      </T>
    </Svg>
  );
}

// 8 · The 16 GiB bar is cut into 1 MiB buffers (the cut marks sweep along it while the count climbs to 16,384); one
// buffer slides off to the output, and what is left is the fan-in, 16,383.
export function FanInCalc({ t }: StepCtx) {
  const cut = easeInOut(seg(t, 0.4, 2.0));
  const out = easeInOut(seg(t, 2.2, 2.8));
  return (
    <Svg
      label="Sixteen gibibytes of memory in one-mebibyte blocks gives sixteen thousand three hundred eighty four buffers; one goes to the output, leaving a fan-in of sixteen thousand three hundred eighty three"
      h={300}
    >
      <T x={25} y={28} s={13} f={C.secondary}>
        16 GiB of memory, cut into 1 MiB buffers
      </T>
      <rect x={25} y={42} width={500} height={34} rx={4} fill={C.band} stroke={C.line} />
      {Array.from({ length: 64 }, (_, i) => {
        const x = 25 + (i + 1) * (500 / 64);
        return x - 25 <= cut * 500 && i < 63 ? <line key={i} x1={x} y1={42} x2={x} y2={76} stroke={C.secondary} strokeWidth={0.8} /> : null;
      })}
      <rect x={lerp(525 - 500 / 64, 540, out)} y={lerp(42, 100, out)} width={500 / 64} height={34} rx={2} fill={C.focus} opacity={fade(t, 2.0, 2.2)} />
      <T x={575} y={156} s={13} f={C.focus} a="end" o={fade(t, 2.6, 2.9)}>
        output buffer
      </T>
      <T x={25} y={120} s={22} f={C.primary}>
        {`${fmt(16_384 * cut)} buffers`}
      </T>
      <T x={25} y={196} s={13} f={C.secondary} o={fade(t, 2.8, 3.1)}>
        every other buffer reads one run
      </T>
      <T x={25} y={240} s={26} f={C.focus} o={fade(t, 3.0, 3.4)}>
        fan-in: 16,383
      </T>
      <T x={25} y={276} s={13} f={C.quiet} o={fade(t, 3.3, 3.6)}>
        a ceiling set by memory, not a choice
      </T>
    </Svg>
  );
}

// 9 · Predict. Pass 1 is drawn (build the runs: read and write everything). After the answer, the 64 runs funnel into a
// single merge bar: 2 passes. Two at a time would stack seven such bars.
export function PassesPredict({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="One terabyte, sixteen gibibytes, one-mebibyte blocks: sixty four runs against a fan-in of sixteen thousand three hundred eighty three settles at two passes" h={330}>
      <T x={25} y={28} s={13} f={C.secondary} o={fade(t, 0.2, 0.5)}>
        pass 1: build 64 runs
      </T>
      <rect x={25} y={40} width={540 * easeInOut(seg(t, 0.3, 1.0))} height={14} rx={3} fill={C.focus} />
      <T x={25} y={88} s={13} f={C.secondary} o={fade(t, 1.0, 1.3)}>
        merge passes, fan-in 16,383
      </T>
      {!on && (
        <T x={300} y={140} s={22} f={C.focus} a="middle" o={fade(t, 1.3, 1.7)}>
          ?
        </T>
      )}
      {on && (
        <g>
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={i}
              x1={25 + i * 36}
              y1={100}
              x2={lerp(25 + i * 36, 300, easeInOut(seg(s, 0.1, 0.7)))}
              y2={lerp(100, 120, easeInOut(seg(s, 0.1, 0.7)))}
              stroke={C.focus}
              strokeWidth={1}
              opacity={0.6}
            />
          ))}
          <rect x={25} y={124} width={540 * easeInOut(seg(s, 0.6, 1.2))} height={14} rx={3} fill={C.focus} />
          <T x={25} y={176} s={22} f={C.focus} o={fade(s, 1.2, 1.5)}>
            2 passes
          </T>
          <T x={25} y={214} s={13} f={C.second} o={fade(s, 1.5, 1.8)}>
            two at a time: 7 passes
          </T>
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={25} y={226 + i * 13} width={540 * easeInOut(seg(s, 1.6 + i * 0.12, 1.9 + i * 0.12))} height={8} rx={2} fill={C.second} opacity={0.75} />
          ))}
        </g>
      )}
    </Svg>
  );
}

// 10 · One fixed memory bar, split into more and more buffers (4 → 64): each buffer shrinks. Under it, the disk's reads:
// long sequential stretches at first, then short reads separated by red seeks.
export function BufferTension({ t }: StepCtx) {
  const g = seg(t, 0.6, 2.4);
  const k = Math.round(Math.pow(2, 2 + g * 4));
  const seek = clamp01((k - 4) / 60);
  return (
    <Svg label="Splitting a fixed memory budget across more runs shrinks each buffer, turning sequential reads into seeks" h={300}>
      <T x={25} y={28} s={13} f={C.secondary}>
        fixed memory
      </T>
      <T x={575} y={28} s={13} f={C.focus} a="end">
        {`${k} buffers`}
      </T>
      <rect x={25} y={40} width={550} height={30} rx={4} fill={C.band} stroke={C.line} />
      {Array.from({ length: k - 1 }, (_, i) => (
        <line key={i} x1={25 + ((i + 1) * 550) / k} y1={40} x2={25 + ((i + 1) * 550) / k} y2={70} stroke={C.secondary} strokeWidth={1} />
      ))}
      <T x={25} y={118} s={13} f={C.secondary} o={fade(t, 1.4, 1.7)}>
        what the disk does
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const seg0 = 550 / 10;
        const read = seg0 * lerp(1, 0.35, seek);
        return (
          <g key={i} opacity={fade(t, 1.4, 1.7)}>
            <rect x={25 + i * seg0} y={130} width={read - 1} height={18} rx={2} fill={C.focus} opacity={0.85} />
            {seek > 0.05 && <rect x={25 + i * seg0 + read} y={130} width={seg0 - read - 1} height={18} rx={2} fill={C.bad} />}
          </g>
        );
      })}
      <T x={25} y={196} s={14} f={C.badText} o={fade(t, 2.4, 2.8)}>
        small buffers: seeking, not streaming
      </T>
      <T x={25} y={236} s={13} f={C.quiet} o={fade(t, 3.0, 3.4)}>
        the fan-in from memory is an upper bound
      </T>
    </Svg>
  );
}

// 11 · Predict. The fan-in slider runs to its ceiling and one pass disappears; each buffer shrinks to a sliver. After the
// answer, the disk's reads break into a storm of seeks, and the slider settles back at a few hundred.
export function MaxFanInPredict({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const run = easeInOut(seg(t, 0.3, 1.2));
  const back = on ? easeInOut(seg(s, 1.6, 2.4)) : 0;
  const pos = lerp(lerp(0.1, 1, run), 0.12, back);
  return (
    <Svg label="Cranking the fan-in to its ceiling drops the pass count by one but can turn streaming reads into a storm of seeks" h={300}>
      <T x={25} y={28} s={13} f={C.secondary}>
        fan-in
      </T>
      <line x1={25} y1={50} x2={565} y2={50} stroke={C.line} strokeWidth={3} />
      <circle cx={25 + 540 * pos} cy={50} r={9} fill={C.focus} />
      <T x={565} y={80} s={13} f={C.secondary} a="end">
        16,383
      </T>
      <T x={25} y={80} s={13} f={C.secondary} o={back}>
        a few hundred
      </T>
      <T x={25} y={122} s={13} f={C.secondary}>
        each buffer
      </T>
      <rect x={150} y={110} width={lerp(300, 12, pos)} height={14} rx={3} fill={C.second} />
      {!on && (
        <T x={300} y={190} s={16} f={C.focus} a="middle" o={fade(t, 1.2, 1.6)}>
          one pass fewer: sooner?
        </T>
      )}
      {on && (
        <g>
          {Array.from({ length: 24 }, (_, i) => (
            <rect key={i} x={25 + i * 23} y={160} width={8} height={18} rx={2} fill={C.focus} opacity={fade(s, 0.1 + i * 0.02, 0.3 + i * 0.02)} />
          ))}
          {Array.from({ length: 24 }, (_, i) => (
            <rect key={i} x={34 + i * 23} y={160} width={12} height={18} rx={2} fill={C.bad} opacity={fade(s, 0.4 + i * 0.02, 0.6 + i * 0.02) * (1 - back)} />
          ))}
          <T x={25} y={214} s={14} f={C.badText} o={fade(s, 0.9, 1.2)}>
            often, no: it gets slower
          </T>
          <T x={25} y={252} s={13} f={C.quiet} o={fade(s, 2.2, 2.6)}>
            real engines cap fan-in at a few hundred
          </T>
        </g>
      )}
    </Svg>
  );
}

// 12 · The merge as one small machine in the middle (run columns → heap → output). Three uses light in turn around it;
// then the two dials that tune it: run length and fan-in.
export function Verdict({ t }: StepCtx) {
  const uses = ['ORDER BY spill', 'sort-merge join', 'LSM compaction'];
  return (
    <Svg label="An order-by spill, a sort-merge join and compaction are the same k-way merge, tuned by run length and fan-in" h={300}>
      {[0, 1, 2, 3].map((r) => (
        <rect key={r} x={360 + r * 26} y={40} width={18} height={60} rx={3} fill={C.band} stroke={C.line} opacity={fade(t, 0.1, 0.4)} />
      ))}
      <rect x={360} y={118} width={96} height={22} rx={11} fill="none" stroke={C.second} strokeWidth={1.5} opacity={fade(t, 0.2, 0.5)} />
      {Array.from({ length: 4 }, (_, i) => {
        const p = ((t > 0.6 ? t - 0.6 : 0) * 1.2 + i / 4) % 1;
        return t > 0.6 ? <circle key={i} cx={408} cy={lerp(140, 200, p)} r={4} fill={C.focus} opacity={Math.sin(Math.PI * p)} /> : null;
      })}
      <rect x={360} y={200} width={96} height={16} rx={3} fill={C.focus} opacity={fade(t, 0.3, 0.6)} />
      {uses.map((u, i) => {
        const k = fade(t, 0.6 + i * 0.6, 1.0 + i * 0.6);
        return (
          <g key={u} opacity={k} transform={`translate(${20 * (1 - k)} 0)`}>
            <T x={25} y={60 + i * 50} s={15} f={C.primary}>
              {u}
            </T>
            <line x1={250} y1={55 + i * 50} x2={350} y2={128} stroke={C.line} strokeDasharray="3 3" />
          </g>
        );
      })}
      <T x={25} y={250} s={13} f={C.focus} o={fade(t, 2.6, 3.0)}>
        tune it in two places: run length, fan-in
      </T>
    </Svg>
  );
}
