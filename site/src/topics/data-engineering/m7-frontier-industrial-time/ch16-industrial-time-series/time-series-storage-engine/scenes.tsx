import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Time-series storage engines, drawn from examples.py's simulations at each engine's documented constants: two-hour
// blocks compacted 3 → 2, the capacity formula's 0.235 GB, the out-of-order rule at head max 10,000, five one-day
// chunks, and InfluxDB 3's 5,403 / 4,500 / 903 split.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** A strip of WAL segments that light up to `k` (0–1), from left. */
const Wal = ({ x, y, n, w, k, o = 1, c = C.second }: { x: number; y: number; n: number; w: number; k: number; o?: number; c?: string }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * w + 1} y={y} width={w - 2} height={14} fill={k * n > i ? c : 'none'} stroke={c} strokeWidth={1} />
      ))}
    </g>
  );

// 0 · Two servers. A: its in-memory head empties red on a crash; then the WAL on disk replays segment by segment and the
// head fills back, slowly. B: a file-copy restore copies the three finished blocks on disk, each ticked — the head,
// only ever in memory, was never in the copy, and stays a red dashed hole.
export function Hook({ t }: StepCtx) {
  const crash = seg(t, 0.6, 0.9);
  const replay = seg(t, 1.2, 4.6);
  const headFill = crash < 1 ? 1 - crash : replay;
  const bx = (i: number) => 150 + i * 106;
  return (
    <Svg
      label="a crashed server replays its write-ahead log for over ten minutes before it's ready, while a second server restored from a file-copy backup is missing hours no WAL could replay"
      h={200}
    >
      <T x={25} y={44} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        crashed
      </T>
      <rect x={150} y={26} width={100} height={28} rx={4} fill="none" stroke={crash > 0 && replay < 1 ? C.badText : C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={152} y={28} width={96 * headFill} height={24} rx={3} fill={C.focus} opacity={0.25} />
      <T x={200} y={45} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        head
      </T>
      <Wal x={300} y={33} n={10} w={27} k={1} o={easeOut(seg(t, 0.2, 0.5)) * 0.35} />
      <Wal x={300} y={33} n={10} w={27} k={replay} o={replay > 0 ? 1 : 0} c={C.focus} />
      <T x={300} y={74} s={12} f={C.quiet} o={easeOut(seg(t, 0.2, 0.5))}>
        WAL on disk
      </T>
      <T x={575} y={74} s={12} f={C.focus} a="end" o={replay > 0 && replay < 1 ? 1 : 0}>
        replaying…
      </T>

      <T x={25} y={144} s={13} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        restored
      </T>
      {[0, 1, 2].map((i) => {
        const cp = easeOut(seg(t, 1.6 + i * 0.5, 2.0 + i * 0.5));
        return (
          <g key={i} opacity={easeOut(seg(t, 1.0, 1.3))}>
            <rect x={bx(i)} y={126} width={98} height={28} rx={3} fill={cp > 0.5 ? C.panel : 'none'} stroke={C.secondary} strokeWidth={1.2} />
            <T x={bx(i) + 42} y={145} s={12} f={C.secondary} a="middle">
              block
            </T>
            <Tick x={bx(i) + 82} y={139} k={cp} />
          </g>
        );
      })}
      <rect x={bx(3)} y={126} width={98} height={28} rx={3} fill="none" stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 3.4, 3.8))} />
      <T x={bx(3) + 49} y={145} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        head
      </T>
      <T x={575} y={184} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 4.0, 4.4))}>
        never copied
      </T>
    </Svg>
  );
}

// 1 · Samples stream into the in-memory head and, one for one, onto the WAL on disk. Then Prometheus's capacity
// formula assembles: 15 days × 129.7 samples a second (1,297 series every 10 s) × 1.5 bytes = 0.235 GB.
export function RevealHeadWal({ t }: StepCtx) {
  const flow = seg(t, 0.3, 2.4);
  const dots = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Svg
      label="Prometheus keeps the current block in memory secured by a write-ahead log, and the documented capacity formula run against the plant's own series count gives the disk this needs"
      h={200}
    >
      <T x={25} y={34} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        memory
      </T>
      <rect x={160} y={18} width={200} height={26} rx={4} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={260} y={36} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        head block
      </T>
      <T x={25} y={78} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        disk
      </T>
      <Wal x={160} y={66} n={10} w={20} k={flow} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={575} y={78} s={12} f={C.second} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        WAL
      </T>
      {dots.map((i) => {
        const u = seg(t, 0.3 + i * 0.25, 0.8 + i * 0.25);
        if (u <= 0 || u >= 1) return null;
        return (
          <g key={i}>
            <circle cx={lerp(440, 370, u)} cy={31} r={3.5} fill={C.focus} />
            <circle cx={lerp(440, 370, u)} cy={73} r={3.5} fill={C.second} />
          </g>
        );
      })}
      <T x={480} y={54} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 0.3, 0.6)) * (1 - seg(t, 2.4, 2.7))}>
        samples
      </T>

      {[
        { x: 25, v: '15 days', l: 'retention', a: 2.6 },
        { x: 165, v: '× 129.7 /s', l: '1,297 ÷ 10 s', a: 3.1 },
        { x: 340, v: '× 1.5 B', l: 'per sample', a: 3.6 },
      ].map((p) => (
        <g key={p.l} opacity={easeOut(seg(t, p.a, p.a + 0.35))}>
          <T x={p.x} y={130} s={15} f={C.primary} w={600}>
            {p.v}
          </T>
          <T x={p.x} y={150} s={11} f={C.quiet}>
            {p.l}
          </T>
        </g>
      ))}
      <T x={575} y={186} s={18} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.3, 4.8))}>
        = 0.235 GB
      </T>
    </Svg>
  );
}

// 2 · Six and a half hours of ingestion on a time axis: three two-hour blocks and the live head. Compaction slides the
// first two together into one 0–4 h block: 3 blocks → 2. Then a query bracket covering 5:00–5:30 drops in; the 0–4 h
// block's own range says it can't overlap, so it dims, skipped unread; only the 4–6 h block opens.
export function RevealCompaction({ t }: StepCtx) {
  const hx = (h: number) => 40 + h * 80;
  const merge = easeInOut(seg(t, 1.2, 2.2));
  const q = easeOut(seg(t, 3.0, 3.6));
  const skip = easeOut(seg(t, 3.7, 4.3));
  return (
    <Svg label="compaction merges a full block with its neighbors into one longer block, and every block's own time range lets a query decide whether to read it at all" h={200}>
      <line x1={hx(0)} y1={110} x2={hx(6.5)} y2={110} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      {[0, 2, 4, 6].map((h) => (
        <T key={h} x={hx(h)} y={128} s={11} f={C.quiet} a="middle" o={easeOut(seg(t, 0, 0.3))}>
          {`${h} h`}
        </T>
      ))}
      {merge < 1 ? (
        [0, 1].map((i) => (
          <rect
            key={i}
            x={hx(i * 2) + 2 + (i === 1 ? -2 * merge : 0)}
            y={60}
            width={156 + 2 * merge}
            height={40}
            rx={4}
            fill={C.panel}
            stroke={C.secondary}
            strokeWidth={1.2}
            opacity={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))}
          />
        ))
      ) : (
        <rect x={hx(0) + 2} y={60} width={316} height={40} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.4} opacity={1 - 0.7 * skip} />
      )}
      {merge >= 1 && (
        <T x={hx(2)} y={85} s={13} f={C.secondary} a="middle" o={1 - 0.6 * skip}>
          0–4 h
        </T>
      )}
      <rect x={hx(4) + 2} y={60} width={156} height={40} rx={4} fill={C.panel} stroke={skip > 0.5 ? C.focus : C.secondary} strokeWidth={skip > 0.5 ? 1.8 : 1.2} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={hx(5)} y={85} s={13} f={skip > 0.5 ? C.focus : C.secondary} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        4–6 h
      </T>
      <rect x={hx(6) + 2} y={60} width={36} height={40} rx={4} fill="none" stroke={C.focus} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.7, 1.0))} />
      <T x={hx(6.25)} y={50} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        head
      </T>
      <T x={25} y={32} s={14} f={C.focus} w={600} o={easeOut(seg(t, 2.1, 2.5))}>
        3 blocks → 2
      </T>

      <path d={`M${hx(5)} ${150} V${142} H${hx(5.5)} V${150}`} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={q} transform={`translate(0 ${(1 - q) * 14})`} />
      <T x={hx(5.25)} y={170} s={12} f={C.focus} a="middle" o={q}>
        query
      </T>
      <T x={hx(2)} y={170} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 4.2, 4.6))}>
        skipped, never opened
      </T>
    </Svg>
  );
}

// Out-of-order axis shared by steps 3–4: timestamps 9,940 to 10,010 s, the head's max time at 10,000.
const ox = (v: number) => 40 + (v - 9940) * 7.4;

const OooAxis = ({ y, o, labels = true }: { y: number; o: number; labels?: boolean }) => (
  <g opacity={o}>
    <line x1={ox(9940)} y1={y} x2={ox(10010)} y2={y} stroke={C.line} strokeWidth={1.2} />
    {labels &&
      [9950, 9990, 10000].map((v) => (
        <T key={v} x={ox(v)} y={y + 20} s={11} f={C.quiet} a="middle">
          {v.toLocaleString('en-US')}
        </T>
      ))}
    <line x1={ox(10000)} y1={y - 26} x2={ox(10000)} y2={y + 6} stroke={C.focus} strokeWidth={1.6} />
  </g>
);

// 3 · The axis with the head's max time at 10,000. The rejection line starts at 10,000; the window widens and the line
// slides back to 9,990, pale blue shading what is now accepted. "Rule gone?" Before the answer, nothing more. After it,
// a much older sample at 9,950 drops toward the axis, hits the line's far side and is crossed out: the line moved.
export function PredictWindow({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const widen = easeInOut(seg(t, 1.2, 2.4));
  const lineV = lerp(10000, 9990, widen);
  const drop = on ? easeIn(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="widening the out-of-order window accepts older stray samples that were dropped before — does that remove the rejection rule, or only move where it falls?" h={200}>
      <OooAxis y={120} o={easeOut(seg(t, 0, 0.4))} />
      <T x={ox(10000)} y={78} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        head max
      </T>
      <rect x={ox(lineV)} y={92} width={ox(10000) - ox(lineV)} height={28} fill={C.second} opacity={0.25} />
      <line x1={ox(lineV)} y1={88} x2={ox(lineV)} y2={126} stroke={C.badText} strokeWidth={1.8} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={ox(9990) - 10} y={66} s={12} f={C.second} a="end" o={easeOut(seg(t, 2.2, 2.6))}>
        window 10 s
      </T>
      {!on ? (
        <T x={200} y={184} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
          rule gone?
        </T>
      ) : (
        <g>
          <circle cx={ox(9950)} cy={lerp(40, 112, drop)} r={6} fill={drop > 0.98 ? C.badText : C.focus} />
          <T x={ox(9950) + 14} y={44} s={12} f={C.primary} o={1 - drop}>
            9,950
          </T>
          <Cross x={ox(9950)} y={96} k={easeOutBack(seg(s, 1.0, 1.4))} />
          <T x={200} y={184} s={14} f={C.badText} a="middle" w={600} o={easeOut(seg(s, 1.3, 1.7))}>
            the line moved
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · Two runs of the same rule, sample ≥ head max − window. Top, window 0: the line sits on 10,000 and a sample at 9,995
// drops in and is crossed out. Bottom, window 10: the line sits on 9,990; 9,995 drops in and is ticked, 9,950 drops in
// and is crossed out, exactly as before.
export function RevealWindow({ t }: StepCtx) {
  const Drop = ({ v, y, a, ok }: { v: number; y: number; a: number; ok: boolean }) => {
    const d = easeIn(seg(t, a, a + 0.5));
    if (seg(t, a - 0.3, a) <= 0) return null;
    return (
      <g>
        <circle cx={ox(v)} cy={lerp(y - 40, y - 8, d)} r={5} fill={d > 0.98 ? (ok ? C.focus : C.badText) : C.primary} />
        <T x={ox(v) + (ok ? -12 : 12)} y={y - 34} s={12} f={C.primary} a={ok ? 'end' : 'start'}>
          {v.toLocaleString('en-US')}
        </T>
        {ok ? <Tick x={ox(v) + 12} y={y - 12} k={easeOutBack(seg(t, a + 0.5, a + 0.8))} /> : <Cross x={ox(v) + (v > 9990 ? 18 : 0)} y={y - 22} k={easeOutBack(seg(t, a + 0.5, a + 0.8))} />}
      </g>
    );
  };
  return (
    <Svg label="with the default window any late sample is rejected; widening it accepts a sample within the new window while one still older is rejected exactly as before" h={200}>
      <T x={25} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        window 0
      </T>
      <OooAxis y={70} o={easeOut(seg(t, 0, 0.3))} labels={false} />
      <Drop v={9995} y={70} a={0.6} ok={false} />

      <T x={25} y={110} s={13} f={C.secondary} o={easeOut(seg(t, 1.7, 2.0))}>
        window 10
      </T>
      <OooAxis y={160} o={easeOut(seg(t, 1.7, 2.0))} />
      <rect x={ox(9990)} y={132} width={ox(10000) - ox(9990)} height={28} fill={C.second} opacity={0.25 * easeOut(seg(t, 2.0, 2.3))} />
      <line x1={ox(9990)} y1={128} x2={ox(9990)} y2={166} stroke={C.badText} strokeWidth={1.8} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.0, 2.3))} />
      <Drop v={9995} y={160} a={2.6} ok={true} />
      <Drop v={9950} y={160} a={3.6} ok={false} />
    </Svg>
  );
}

// 5 · Five one-day chunks, each holding its 24 hourly rows as ticks. A query for day 3 descends as a bracket; day 3
// lights up and the other four dim: 1 of 5 chunks touched.
export function RevealChunks({ t }: StepCtx) {
  const cx = (i: number) => 30 + i * 110;
  const q = easeOut(seg(t, 2.0, 2.6));
  const dim = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="a hypertable splits data into time-partitioned chunks instead of blocks, and a query naming one day's range touches only that day's chunk, not the whole table" h={200}>
      {[0, 1, 2, 3, 4].map((i) => {
        const hit = i === 2;
        const k = easeOut(seg(t, 0.1 + i * 0.25, 0.5 + i * 0.25));
        return (
          <g key={i} opacity={k * (hit ? 1 : 1 - 0.65 * dim)}>
            <rect x={cx(i)} y={80} width={100} height={50} rx={4} fill={C.panel} stroke={hit && dim > 0.5 ? C.focus : C.secondary} strokeWidth={hit && dim > 0.5 ? 1.8 : 1.1} />
            {Array.from({ length: 24 }, (_, h) => (
              <line key={h} x1={cx(i) + 6 + h * 3.85} y1={112} x2={cx(i) + 6 + h * 3.85} y2={122} stroke={hit && dim > 0.5 ? C.focus : C.line} strokeWidth={1.2} />
            ))}
            <T x={cx(i) + 50} y={102} s={13} f={hit && dim > 0.5 ? C.focus : C.secondary} a="middle">
              {`day ${i + 1}`}
            </T>
          </g>
        );
      })}
      <g opacity={q} transform={`translate(0 ${(1 - q) * -20})`}>
        <path d={`M${cx(2)} 62 V54 H${cx(2) + 100} V62`} fill="none" stroke={C.focus} strokeWidth={1.6} />
        <T x={cx(2) + 50} y={44} s={13} f={C.focus} a="middle">
          query: day 3
        </T>
      </g>
      <T x={300} y={170} s={14} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 3.4, 3.8))}>
        1 of 5 chunks touched
      </T>
    </Svg>
  );
}

// 6 · InfluxDB 3's four stages as boxes: write buffer → WAL (≤ 1 s) → queryable buffer → Parquet. Below, thirty minutes
// of writes fill a timeline; at 10, 20 and 30 minutes everything older than five minutes turns pale blue — persisted.
// The end state from examples.py: 5,403 samples through the WAL, 4,500 in Parquet, 903 still in memory.
export function RevealInfluxPipeline({ t }: StepCtx) {
  const mx = (m: number) => 40 + m * 16;
  const now = 30 * seg(t, 1.6, 4.4);
  const persisted = now >= 30 ? 25 : now >= 20 ? 15 : now >= 10 ? 5 : 0;
  const stage = (i: number) => easeOut(seg(t, i * 0.3, 0.3 + i * 0.3));
  return (
    <Svg label="a write lands in a memory buffer, reaches the WAL within a second, stays queryable for several minutes, then the oldest part is persisted to Parquet on a fixed clock" h={260}>
      <Box x={25} y={26} w={100} label="buffer" o={stage(0)} />
      <Box x={160} y={26} w={90} label="WAL" o={stage(1)} stroke={C.second} f={C.second} />
      <Box x={285} y={26} w={135} label="queryable" o={stage(2)} />
      <Box x={455} y={26} w={120} label="Parquet" o={stage(3)} stroke={C.second} f={C.second} />
      {[125, 250, 420].map((x, i) => (
        <line key={x} x1={x + 2} y1={42} x2={x + 33} y2={42} stroke={C.line} strokeWidth={1.4} opacity={stage(i + 1)} />
      ))}
      <T x={142} y={80} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        ≤ 1 s
      </T>
      <T x={515} y={80} s={12} f={C.second} a="middle" o={easeOut(seg(t, 1.1, 1.4))}>
        every 10 min
      </T>

      <line x1={mx(0)} y1={150} x2={mx(30)} y2={150} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 1.3, 1.6))} />
      {[0, 10, 20, 30].map((m) => (
        <T key={m} x={mx(m)} y={168} s={11} f={C.quiet} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
          {`${m} min`}
        </T>
      ))}
      <rect x={mx(0)} y={124} width={mx(now) - mx(0)} height={20} fill={C.focus} opacity={0.8} />
      <rect x={mx(0)} y={124} width={mx(persisted) - mx(0)} height={20} fill={C.second} />
      <T x={mx(12.5)} y={198} s={13} f={C.second} a="middle" w={600} o={easeOut(seg(t, 4.5, 4.9))}>
        4,500 in Parquet
      </T>
      <T x={575} y={114} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.6, 5.0))}>
        903 in memory
      </T>
      <T x={300} y={240} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 5.0, 5.4))}>
        5,403 samples through the WAL
      </T>
    </Svg>
  );
}

// 7 · Three names, three vocabularies: Thanos's sidecar, Mimir's ingesters, VictoriaMetrics as long-term storage. From
// each, block glyphs fall into one shared object-storage box; then a stateless query layer slides in on top.
export function RevealScaledOut({ t }: StepCtx) {
  const names = [
    { n: 'Thanos', v: 'sidecar', x: 25 },
    { n: 'Mimir', v: 'ingesters', x: 210 },
    { n: 'VictoriaMetrics', v: 'long-term', x: 395 },
  ];
  return (
    <Svg
      label="Thanos, Mimir and VictoriaMetrics describe different architectures in their own words, but all three push the same block format to object storage behind a stateless query layer"
      h={200}
    >
      <g opacity={easeOut(seg(t, 3.8, 4.4))} transform={`translate(0 ${(1 - easeOut(seg(t, 3.8, 4.4))) * -12})`}>
        <rect x={25} y={10} width={550} height={28} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={300} y={29} s={13} f={C.focus} a="middle">
          stateless query layer
        </T>
      </g>
      {names.map((p, i) => (
        <g key={p.n} opacity={easeOut(seg(t, i * 0.4, 0.4 + i * 0.4))}>
          <rect x={p.x} y={54} width={180} height={42} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
          <T x={p.x + 90} y={71} s={12} f={C.primary} a="middle" w={600}>
            {p.n}
          </T>
          <T x={p.x + 90} y={89} s={11} f={C.quiet} a="middle">
            {p.v}
          </T>
          {[0, 1].map((j) => {
            const u = easeIn(seg(t, 1.8 + i * 0.3 + j * 0.4, 2.4 + i * 0.3 + j * 0.4));
            return u > 0 && u < 1 ? <rect key={j} x={p.x + 70 + j * 18} y={lerp(100, 150, u)} width={14} height={10} fill={C.second} /> : null;
          })}
        </g>
      ))}
      <g opacity={easeOut(seg(t, 1.3, 1.7))}>
        <rect x={25} y={156} width={550} height={34} rx={4} fill={C.panel} stroke={C.second} strokeWidth={1.4} />
        <T x={300} y={178} s={13} f={C.second} a="middle">
          object storage: the same blocks
        </T>
      </g>
    </Svg>
  );
}

// 8 · Four lanes with tiny pictures: head + WAL, a skipped block, a window line that moved, and the memory | storage
// divide every engine draws.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 40 + i * 58;
  const k = (i: number) => easeOut(seg(t, i * 1.2, i * 1.2 + 0.5));
  const texts = [
    { l: 'head + WAL', r: 'crash safe', c: C.focus },
    { l: 'blocks by time', r: 'skipped unread', c: C.secondary },
    { l: 'late window', r: 'moves the line', c: C.badText },
    { l: 'memory | storage', r: 'the design', c: C.focus },
  ];
  return (
    <Svg
      label="a head block in memory, a WAL for crash safety, blocks pruned by time range, a shifting late-data window, and three engines agreeing the memory/object-storage line is where the architecture lives"
      h={260}
    >
      <g opacity={k(0)}>
        <rect x={25} y={lane(0) - 14} width={60} height={14} rx={2} fill="none" stroke={C.focus} strokeWidth={1.2} />
        <Wal x={25} y={lane(0) + 4} n={5} w={22} k={seg(t, 0.2, 0.9)} />
      </g>
      <g opacity={k(1)}>
        <rect x={25} y={lane(1) - 10} width={55} height={22} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
        <rect x={85} y={lane(1) - 10} width={55} height={22} rx={3} fill="none" stroke={C.focus} strokeWidth={1.6} />
      </g>
      <g opacity={k(2)}>
        <line x1={25} y1={lane(2) + 6} x2={140} y2={lane(2) + 6} stroke={C.line} strokeWidth={1.2} />
        <line
          x1={lerp(125, 95, easeInOut(seg(t, 2.6, 3.2)))}
          y1={lane(2) - 12}
          x2={lerp(125, 95, easeInOut(seg(t, 2.6, 3.2)))}
          y2={lane(2) + 10}
          stroke={C.badText}
          strokeWidth={1.6}
          strokeDasharray="3 3"
        />
      </g>
      <g opacity={k(3)}>
        <line x1={82} y1={lane(3) - 14} x2={82} y2={lane(3) + 12} stroke={C.focus} strokeWidth={2} />
        <rect x={30} y={lane(3) - 6} width={40} height={10} fill={C.focus} opacity={0.4} />
        <rect x={94} y={lane(3) - 6} width={40} height={10} fill={C.second} />
      </g>
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)}>
          <T x={160} y={lane(i) + 5} s={14} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 5} s={14} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · The hook's two servers again, each a head box beside its disk. Before the answer, "lost: ?" on both. After it,
// A's WAL replays into its head (tick, "lost nothing"); B's head, never in the copy, stays red ("lost the head").
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const rep = on ? seg(s, 0.2, 1.2) : 0;
  return (
    <Svg label="given the hook's two servers, can what each one lost be stated exactly from the structure alone, without guessing at either server's configuration?" h={200}>
      {[0, 1].map((i) => {
        const y = 50 + i * 80;
        const k = easeOut(seg(t, i * 0.6, 0.4 + i * 0.6));
        const bad = i === 1 && on && rep > 0.5;
        return (
          <g key={i} opacity={k}>
            <T x={25} y={y + 5} s={13} f={C.secondary}>
              {i === 0 ? 'WAL replay' : 'file copy'}
            </T>
            <rect
              x={160}
              y={y - 14}
              width={80}
              height={26}
              rx={4}
              fill={i === 0 ? C.focus : 'none'}
              fillOpacity={i === 0 ? 0.25 * rep : 0}
              stroke={bad ? C.badText : C.focus}
              strokeWidth={1.4}
              strokeDasharray={bad ? '4 3' : undefined}
            />
            <T x={200} y={y + 4} s={12} f={bad ? C.badText : C.focus} a="middle">
              head
            </T>
            {i === 0 ? <Wal x={260} y={y - 7} n={5} w={20} k={on ? rep : 1} c={C.second} /> : <Wal x={260} y={y - 7} n={5} w={20} k={1} c={C.secondary} />}
          </g>
        );
      })}
      {!on ? (
        <g opacity={easeOut(seg(t, 1.6, 2.0))}>
          <T x={575} y={55} s={14} f={C.focus} a="end">
            lost: ?
          </T>
          <T x={575} y={135} s={14} f={C.focus} a="end">
            lost: ?
          </T>
        </g>
      ) : (
        <g>
          <T x={575} y={55} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(s, 1.1, 1.5))}>
            lost nothing
          </T>
          <T x={575} y={135} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(s, 1.3, 1.7))}>
            lost the head
          </T>
        </g>
      )}
    </Svg>
  );
}
