import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** The split: a storage box on the left and a compute box on the right, joined by a network line drawn by `n`. */
function Split({ y = 30, k = 1, n = 1, sub = true }: { y?: number; k?: number; n?: number; sub?: boolean }) {
  return (
    <g opacity={k}>
      <rect x={25} y={y} width={200} height={70} rx={5} fill={C.cocoa} stroke={C.second} strokeWidth={1.6} />
      <T x={40} y={y + 28} s={13} f={C.crema}>
        storage
      </T>
      {sub && (
        <T x={40} y={y + 54} s={11} f={C.latte}>
          Capacitor, on Colossus
        </T>
      )}
      <rect x={370} y={y} width={190} height={70} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} />
      <T x={385} y={y + 28} s={13} f={C.crema}>
        compute
      </T>
      {sub && (
        <T x={385} y={y + 54} s={11} f={C.latte}>
          Dremel, on Borg
        </T>
      )}
      <line x1={227} y1={y + 35} x2={lerp(227, 368, n)} y2={y + 35} stroke={C.latte} strokeWidth={2} strokeDasharray="6 4" />
    </g>
  );
}

// 1 · Hook. Snowflake's stack of kept blocks on the left, fading; a second platform appears on a different foundation slab.
export function Hook({ t }: StepCtx) {
  const s = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="snowflake's immutability was one proprietary design. here's a second, on genuinely different infrastructure." h={200}>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={40 + i * 8}
          y={40 + i * 8}
          width={100}
          height={26}
          rx={2}
          fill={C.cocoa}
          stroke={C.latte}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1)) * (1 - 0.6 * s)}
        />
      ))}
      <T x={40} y={140} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.9))}>
        Snowflake: blocks kept
      </T>
      <Cell x={340} y={50} w={180} h={32} label="BigQuery" stroke={C.focus} o={s} />
      <rect x={320} y={100} width={220} height={10} fill={C.second} opacity={easeOut(seg(t, 2.4, 2.8))} />
      <T x={320} y={140} s={11} f={C.second} o={easeOut(seg(t, 2.8, 3.2))}>
        a different foundation
      </T>
    </Svg>
  );
}

// 2 · Predict. One box holding both a disk and a gear; does it still do both jobs?
export function PredictStorageComputeSplit({ t, answer }: StepCtx) {
  return (
    <Svg label="one engine once stored the data and ran the query. still true today, or did those jobs split?" h={200}>
      <rect x={150} y={20} width={300} height={60} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.6} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={175} y={56} s={13} f={C.crema} o={easeOut(seg(t, 0.5, 0.8))}>
        holds bytes
      </T>
      <T x={425} y={56} s={13} f={C.crema} a="end" o={easeOut(seg(t, 0.9, 1.2))}>
        runs queries
      </T>
      <line x1={300} y1={28} x2={300} y2={72} stroke={C.mocha} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.4, 1.8))} />
      <AnswerRow y={130} label="today" answer={answer} value="split apart" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={178} text="two separate systems now" />
    </Svg>
  );
}

// 3 · The split itself. Storage on the left, compute on the right, the Jupiter network drawn between; packets ride it.
export function RevealCapacitorColossusBorg({ t }: StepCtx) {
  const n = easeInOut(seg(t, 1.6, 2.4));
  const p = seg(t, 2.4, 4.4);
  return (
    <Svg label="they split: capacitor storage on colossus, dremel compute on borg, joined by the jupiter network." h={230}>
      <Split y={30} k={1} n={n} />
      {[0, 1, 2].map((i) => {
        const q = (p * 2 + i / 3) % 1;
        return <rect key={i} x={lerp(230, 352, q)} y={61} width={12} height={8} fill={C.second} opacity={p > 0 && p < 1 ? 1 : 0} />;
      })}
      <T x={297} y={140} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
        the Jupiter network
      </T>
      <T x={25} y={190} s={11} f={C.second} o={easeOut(seg(t, 0.6, 1.0))}>
        column-oriented, shared
      </T>
      <T x={370} y={190} s={11} f={C.focus} o={easeOut(seg(t, 1.2, 1.6))}>
        a separate cluster
      </T>
    </Svg>
  );
}

// 4 · Partitioning, then clustering. Segments: most dim; inside a survivor, sorted blocks: most dim again.
export function RevealPartitioningClustering({ t }: StepCtx) {
  const p1 = easeOut(seg(t, 0.8, 1.4));
  const z = easeInOut(seg(t, 1.8, 2.4));
  const p2 = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="partitioning narrows the scan to matching segments; clustering sorts rows into blocks a filter can skip." h={230}>
      <T x={25} y={24} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        partitions
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={25 + i * 68} y={34} width={60} height={30} rx={2} fill={C.cocoa} stroke={i === 5 ? C.focus : C.mocha} strokeWidth={1.4} opacity={i === 5 ? 1 : 1 - 0.75 * p1} />
      ))}
      <path d={`M365 66 L${lerp(365, 25, z)} 104 M425 66 L${lerp(425, 575, z)} 104`} stroke={C.focus} strokeWidth={1.2} fill="none" opacity={z > 0 ? 1 : 0} />
      <T x={25} y={128} s={12} f={C.latte} o={z}>
        clustered blocks, inside one partition
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={25 + i * 46} y={140} width={40} height={26} rx={2} fill={C.cocoa} stroke={i === 7 ? C.focus : C.mocha} strokeWidth={1.2} opacity={z * (i === 7 ? 1 : 1 - 0.75 * p2)} />
      ))}
      <T x={25} y={210} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        the same idea, twice: narrower each pass
      </T>
    </Svg>
  );
}

// 5 · Materialized views. The base table keeps changing (rows tick in); the saved answer box refreshes itself each time, no hand on it.
export function RevealMaterializedViews({ t }: StepCtx) {
  const ticks = Math.floor(seg(t, 0.6, 3.6) * 6);
  return (
    <Svg label="a materialized view stays current on its own, in the background, as the base table changes." h={230}>
      <rect x={25} y={30} width={200} height={110} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} />
      <T x={40} y={54} s={12} f={C.crema}>
        base table
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={40} y={68 + i * 11} width={150} height={6} fill={i < ticks ? C.second : C.mocha} opacity={i < ticks ? 1 : 0.4} />
      ))}
      <Req x1={227} x2={360} y={85} k={easeOut(seg(t, 0.8, 1.2))} label="kept current" f={C.focus} />
      <rect x={365} y={55} width={190} height={60} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.8} />
      <T x={380} y={80} s={12} f={C.crema}>
        saved answer
      </T>
      <circle cx={380} cy={100} r={4} fill={C.focus} opacity={ticks > 0 ? 0.5 + 0.5 * Math.sin(t * 8) : 0} />
      <T x={395} y={104} s={11} f={C.focus} o={ticks > 0 ? 1 : 0}>
        refreshed
      </T>
      <T x={25} y={190} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        nobody refreshes it by hand
      </T>
    </Svg>
  );
}

// 6 · Predict. A repeated question arrives again and again; every copy still has to run. Can one be skipped?
export function PredictRepeatedQuery({ t, answer }: StepCtx) {
  return (
    <Svg label="pruning and precomputed views both speed up a query that still has to run. can one skip running it at all?" h={200}>
      {[0, 1, 2, 3].map((i) => (
        <Req key={i} x1={25} x2={395} y={24 + i * 18} k={easeInOut(seg(t, 0.3 + i * 0.35, 1.0 + i * 0.35))} f={C.latte} />
      ))}
      <Cell x={400} y={30} w={150} h={40} label="the engine" o={easeOut(seg(t, 0.1, 0.4))} />
      <AnswerRow y={130} label="a repeated query" answer={answer} value="can skip running" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={178} text="a cache in front catches it" />
    </Svg>
  );
}

// 7 · BI Engine. A cache box slides in front of the engine; the repeated questions stop at it and bounce straight back.
export function RevealBiEngine({ t }: StepCtx) {
  const c = easeOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="an in-memory caching service sits in front of the engine, speeding up the exact queries run most often." h={230}>
      <Cell x={420} y={40} w={140} h={40} label="the engine" o={0.5} />
      <g opacity={c} transform={`translate(0 ${((1 - c) * -20).toFixed(2)})`}>
        <rect x={250} y={30} width={130} height={60} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.8} />
        <T x={315} y={58} s={12} f={C.crema} a="middle">
          BI Engine
        </T>
        <T x={315} y={78} s={11} f={C.latte} a="middle">
          in memory
        </T>
      </g>
      {[0, 1, 2].map((i) => (
        <Req key={i} x1={25} x2={245} y={44 + i * 16} k={easeInOut(seg(t, 1.2 + i * 0.4, 1.8 + i * 0.4))} back={easeOut(seg(t, 1.8 + i * 0.4, 2.2 + i * 0.4))} f={C.focus} />
      ))}
      <T x={25} y={140} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        answered before the engine runs
      </T>
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        same question, same table, no change needed
      </T>
    </Svg>
  );
}

// 8 · Two load paths. Above, one big block drops in from outside storage; below, rows trickle in one at a time; same table.
export function RevealLoadPaths({ t }: StepCtx) {
  const b = easeInOut(seg(t, 0.4, 1.4));
  const s = seg(t, 2.0, 4.4);
  return (
    <Svg label="loading splits two ways: one batch job that fills a table once, or a stream that keeps writing rows." h={230}>
      <Cell x={25} y={20} w={150} h={28} label="outside storage" o={easeOut(seg(t, 0.1, 0.3))} />
      <rect x={lerp(180, 360, b)} y={22} width={60} height={24} fill={C.second} opacity={b > 0 && b < 1 ? 1 : 0} />
      <T x={25} y={76} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>
        one batch, all at once
      </T>
      <rect x={430} y={20} width={130} height={150} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} />
      <T x={445} y={44} s={12} f={C.crema}>
        one table
      </T>
      <Cell x={25} y={130} w={150} h={28} label="a stream" o={easeOut(seg(t, 1.8, 2.1))} />
      {Array.from({ length: 6 }, (_, i) => {
        const q = clamp(s * 3 - i * 0.35);
        return <circle key={i} cx={lerp(180, 425, q)} cy={144} r={4} fill={C.focus} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
      <T x={25} y={196} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        a steady trickle, row after row
      </T>
    </Svg>
  );
}

// 9 · Exactly-once streaming. The old path: a row may slip or double (a dashed ghost). The new path: each write carries its offset,
// counted 1, 2, 3 with no gaps.
export function RevealExactlyOnceStreaming({ t }: StepCtx) {
  const o = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="the modern streaming path guarantees exactly-once delivery with stream offsets, replacing an older best-effort method." h={230}>
      <T x={25} y={30} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        older stream: best effort
      </T>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={260 + i * 60}
          y={18}
          width={44}
          height={20}
          rx={2}
          fill="none"
          stroke={i === 2 ? C.cherryText : C.latte}
          strokeWidth={1.4}
          strokeDasharray={i === 2 ? '4 3' : undefined}
          opacity={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))}
        />
      ))}
      <T x={25} y={64} s={11} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.6))}>
        probably every row, eventually
      </T>
      <T x={25} y={120} s={12} f={C.crema} o={o}>
        Storage Write API: offsets
      </T>
      {['a', 'b', 'c', 'd'].map((l, i) => {
        const k = easeOut(seg(t, 2.4 + i * 0.3, 2.7 + i * 0.3));
        return (
          <g key={l} opacity={k}>
            <rect x={260 + i * 60} y={106} width={44} height={22} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} />
            <T x={282 + i * 60} y={122} s={11} f={C.crema} a="middle">
              {l}
            </T>
          </g>
        );
      })}
      <T x={25} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        every row, exactly once
      </T>
    </Svg>
  );
}

// 10 · Recap. The split drawn once more, and the consequences listed under it.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="storage and compute split apart, joined over a network -- pruning, caching and two load paths all follow. next: redshift." h={250}>
      <Split y={14} n={easeInOut(seg(t, 0.2, 1.0))} sub={false} />
      <Row y={130} label="narrowing" value="by segment, then block" k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={175} label="repeats" value="caught before they run" k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={220} label="loading" value="batch, or a stream" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}
