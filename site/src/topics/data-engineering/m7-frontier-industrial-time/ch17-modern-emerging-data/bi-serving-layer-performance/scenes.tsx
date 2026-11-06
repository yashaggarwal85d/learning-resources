import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// BI serving-layer performance. The topic has no examples.py; nothing here is a measured number. "Thirty seconds" is
// the hook's own scenario. The four lanes are an illustrated ceiling, not any engine's documented limit; queries in
// them are scheduled by a real first-free-lane rule so the queue is honest to the picture. BI Engine's one large fact
// table with up to four small dimension tables, its named exclusions and its fallback to standard slots, and the
// Databricks disk cache's copy-on-first-read and automatic eviction follow the FACT-CHECK's quoted vendor docs.

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

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** A table glyph: a header bar and `rows` row lines, at (x, y), w wide. */
const Tbl = ({ x, y, w, rows, c = C.line, o = 1 }: { x: number; y: number; w: number; rows: number; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={8 + rows * 8} rx={2} fill={C.panel} stroke={c} strokeWidth={1.2} />
      <rect x={x} y={y} width={w} height={8} rx={2} fill={c} opacity={0.6} />
      {Array.from({ length: rows - 1 }, (_, i) => (
        <line key={i} x1={x + 4} y1={y + 16 + i * 8} x2={x + w - 4} y2={y + 16 + i * 8} stroke={C.line} strokeWidth={0.8} />
      ))}
    </g>
  );

/**
 * Four lanes (the illustrated ceiling) and a queue. `arrivals` are start times of identical queries, each `dur` long.
 * A query takes the first free lane at or after it arrives; until then it waits in the queue. Returns the drawing.
 */
const Lanes = ({ x, y, t, arrivals, dur, lanes = 4, laneW = 220 }: { x: number; y: number; t: number; arrivals: number[]; dur: number; lanes?: number; laneW?: number }) => {
  const free = Array(lanes).fill(0);
  const sched = arrivals.map((a) => {
    let best = 0;
    for (let j = 1; j < lanes; j++) if (free[j] < free[best]) best = j;
    const start = Math.max(a, free[best]);
    free[best] = start + dur;
    return { a, start, lane: best };
  });
  const waiting = sched.filter((q) => t >= q.a && t < q.start);
  return (
    <g>
      {Array.from({ length: lanes }, (_, j) => (
        <rect key={j} x={x} y={y + j * 22} width={laneW} height={16} rx={2} fill={C.band} stroke={C.line} strokeWidth={1} />
      ))}
      <line x1={x - 6} y1={y - 4} x2={x - 6} y2={y + lanes * 22 - 2} stroke={C.focus} strokeWidth={1.6} />
      {sched.map((q, i) => {
        const p = (t - q.start) / dur;
        return p < 0 || p > 1 ? null : <rect key={i} x={x + 2 + p * (laneW - 40)} y={y + q.lane * 22 + 2} width={36} height={12} rx={2} fill={q.start > q.a + 0.01 ? C.badText : C.primary} />;
      })}
      {waiting.map((q, i) => (
        <rect key={`w${i}`} x={x - 22 - i * 16} y={y + lanes * 11 - 6} width={12} height={12} rx={2} fill={C.badText} />
      ))}
    </g>
  );
};

// 0 · Left: all quarter, the same short query bar, again and again. Right: Monday morning, the same bar arrives in a
// crowd and waits — a red wait bar stretches in front of it: queued thirty seconds. The query bar itself never changes.
export function Hook({ t }: StepCtx) {
  const wait = easeInOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="a dashboard, fast all quarter, suddenly queues every Monday morning. The query itself never changed." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={24} s={12} f={C.secondary}>
          all quarter
        </T>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={25} y={40 + i * 18} width={40} height={10} rx={2} fill={C.primary} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.3 + i * 0.1))} />
        ))}
        <T x={80} y={140} s={12} f={C.focus} o={easeOut(seg(t, 0.7, 1.0))}>
          fast every time
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <T x={300} y={24} s={12} f={C.secondary}>
          Monday morning
        </T>
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i}>
            <rect x={300} y={40 + i * 18} width={220 * wait * (1 - i * 0.08)} height={10} rx={2} fill={C.badText} opacity={0.5} />
            <rect x={300 + 220 * wait * (1 - i * 0.08)} y={40 + i * 18} width={40} height={10} rx={2} fill={C.primary} />
          </g>
        ))}
        <T x={575} y={160} s={12} f={C.badText} a="end" o={easeOut(seg(t, 2.0, 2.3))}>
          queued thirty seconds
        </T>
      </g>
      <T x={300} y={190} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 2.3, 2.6))}>
        the query bar is the same width
      </T>
    </Svg>
  );
}

// 1 · The query, alone, with "make it faster?" and "something else?". After the answer the two outside numbers appear as
// a picture: queries arriving at once climb past a fixed ceiling line; the rest queue. "faster query" is struck and
// "bigger reservation, or spread the load" lights.
export function PredictConcurrencyVsSpeed({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const climb = on ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  return (
    <Svg label="what two numbers, outside the query, explain this, and which lever actually fixes it?" h={215}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={20} w={190} label="faster query" stroke={on && s > 1.2 ? C.badText : undefined} />
        <Box x={25} y={66} w={190} label="something else" lit={on && s > 1.5} />
      </g>
      <Cross x={232} y={36} k={on ? easeOut(seg(s, 1.2, 1.4)) : 0} />
      <Tick x={232} y={82} k={on ? easeOut(seg(s, 1.5, 1.7)) : 0} />
      <T x={300} y={110} s={13} f={C.focus} a="middle" o={on ? 0 : easeOut(seg(t, 0.6, 1.0))}>
        two numbers, outside the query: ?
      </T>
      {on && (
        <g>
          <line x1={330} y1={90} x2={570} y2={90} stroke={C.focus} strokeWidth={1.6} />
          <T x={330} y={22} s={12} f={C.focus}>
            ceiling: queries at once
          </T>
          {Array.from({ length: 8 }, (_, i) => {
            const h = Math.min(1, climb * 1.6 - i * 0.08) * (i < 4 ? 70 : 70 + (i - 3) * 10);
            return h <= 0 ? null : <rect key={i} x={340 + i * 28} y={160 - h} width={20} height={h} rx={2} fill={160 - h < 90 ? C.badText : C.primary} />;
          })}
          <line x1={330} y1={160} x2={570} y2={160} stroke={C.line} />
          <T x={330} y={180} s={12} f={C.secondary} o={easeOut(seg(s, 0.6, 0.9))}>
            Monday's load
          </T>
          <T x={25} y={206} s={12} f={C.focus} o={easeOut(seg(s, 1.7, 2.1))}>
            bigger reservation, or spread the load
          </T>
        </g>
      )}
    </Svg>
  );
}

// 2 · The big source table on the left. Once, on a clock tick, the aggregation runs and a small rollup appears. Then
// four dashboards each send their query — to the small rollup, never the big table.
export function RevealRollupsAndMaterializedViews({ t }: StepCtx) {
  const agg = easeInOut(seg(t, 0.8, 1.6));
  const q = seg(t, 2.0, 3.0);
  return (
    <Svg label="compute the expensive aggregation once, on a schedule; every dashboard queries the small result instead." h={200}>
      <Tbl x={25} y={20} w={120} rows={18} o={easeOut(seg(t, 0, 0.3))} />
      <T x={85} y={190} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        source table
      </T>
      <g opacity={easeOut(seg(t, 0.5, 0.8))}>
        <circle cx={200} cy={90} r={16} fill="none" stroke={C.secondary} strokeWidth={1.3} />
        <line x1={200} y1={90} x2={200} y2={80} stroke={C.secondary} strokeWidth={1.3} />
        <line x1={200} y1={90} x2={200 + 8 * Math.sin(agg * 6.28)} y2={90 - 8 * Math.cos(agg * 6.28)} stroke={C.focus} strokeWidth={1.3} />
        <T x={200} y={130} s={12} f={C.secondary} a="middle">
          once
        </T>
      </g>
      {agg > 0 && agg < 1 && <rect x={lerp(150, 260, agg)} y={80} width={20} height={20} rx={2} fill={C.second} />}
      <Tbl x={265} y={74} w={80} rows={3} c={C.second} o={agg >= 1 ? 1 : 0} />
      <T x={305} y={130} s={12} f={C.second} a="middle" o={agg >= 1 ? 1 : 0}>
        rollup
      </T>
      {[0, 1, 2, 3].map((i) => {
        const y = 24 + i * 44;
        const o = easeOut(seg(t, 1.7 + i * 0.1, 2.0 + i * 0.1));
        const p = (q * 2 + i * 0.25) % 1;
        return (
          <g key={i} opacity={o}>
            <rect x={480} y={y} width={95} height={30} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
            <T x={527} y={y + 20} s={12} f={C.primary} a="middle">
              {`dash ${i + 1}`}
            </T>
            <line x1={345} y1={90} x2={480} y2={y + 15} stroke={C.line} strokeWidth={1} />
            {q > 0 && q < 1 && <circle cx={lerp(480, 345, p)} cy={lerp(y + 15, 90, p)} r={3} fill={C.second} />}
          </g>
        );
      })}
      <T x={575} y={196} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        small cost, every time
      </T>
    </Svg>
  );
}

// 3 · The first query takes the long path to the engine; its result drops into the cache. The same query again takes
// the short path and reuses it, ✓. Then the source changes, red, and the cached result greys to "stale?" — fresh only
// as far as its invalidation policy reaches.
export function RevealResultCaching({ t }: StepCtx) {
  const q1 = seg(t, 0.4, 1.4);
  const stored = q1 >= 1;
  const q2 = seg(t, 1.8, 2.2);
  const chg = easeOut(seg(t, 2.8, 3.1));
  return (
    <Svg label="a cached result is only as fresh as its invalidation policy accounts for." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={84} w={100} label="query" />
        <Box x={260} y={30} w={130} label="cache" stroke={stored ? (chg > 0.5 ? C.badText : C.second) : C.line} />
        <Box x={460} y={130} w={115} label="engine" stroke={chg > 0.5 ? C.badText : undefined} />
        <line x1={125} y1={100} x2={460} y2={146} stroke={C.line} strokeWidth={1} />
        <line x1={125} y1={100} x2={260} y2={46} stroke={C.line} strokeWidth={1} />
      </g>
      {q1 > 0 && q1 < 1 && (
        <circle cx={q1 < 0.5 ? lerp(125, 460, q1 * 2) : lerp(460, 325, (q1 - 0.5) * 2)} cy={q1 < 0.5 ? lerp(100, 146, q1 * 2) : lerp(146, 62, (q1 - 0.5) * 2)} r={4} fill={C.primary} />
      )}
      {q2 > 0 && q2 < 1 && <circle cx={lerp(125, 260, q2)} cy={lerp(100, 46, q2)} r={4} fill={C.second} />}
      <Tick x={410} y={46} k={easeOut(seg(t, 2.2, 2.4)) * (1 - chg)} color={C.second} />
      <T x={410} y={78} s={12} f={C.second} o={easeOut(seg(t, 2.2, 2.4)) * (1 - chg)}>
        reused
      </T>
      <T x={410} y={78} s={12} f={C.badText} o={chg}>
        stale?
      </T>
      <T x={575} y={190} s={12} f={C.badText} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        the data changed underneath
      </T>
    </Svg>
  );
}

// 4 · BI Engine: a reservation's memory holds the preferred tables — one large fact table and up to four small
// dimension tables around it. A query on them runs fast, in memory. A query on something it can't accelerate (JSON
// columns, wildcard or external tables) drops, dashed, to standard slots, and still runs ✓.
export function RevealBigQueryBIEngine({ t }: StepCtx) {
  const fast = seg(t, 1.8, 2.2);
  const slow = seg(t, 2.8, 4.0);
  return (
    <Svg label="a fast, in-memory analysis service that caches a reservation's preferred tables." h={264}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={25} y={20} width={300} height={150} rx={6} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="5 4" />
        <T x={37} y={40} s={12} f={C.second}>
          in memory: preferred tables
        </T>
      </g>
      <Tbl x={140} y={70} w={70} rows={7} c={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      {[
        [55, 62],
        [255, 62],
        [55, 128],
        [255, 128],
      ].map(([x, y], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.8 + i * 0.15, 1.1 + i * 0.15))}>
          <line x1={x < 140 ? x + 40 : x} y1={y + 12} x2={x < 140 ? 140 : 210} y2={100} stroke={C.line} strokeWidth={1} />
          <Tbl x={x} y={y} w={40} rows={2} />
        </g>
      ))}
      <T x={25} y={190} s={12} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        one large fact + up to four small
      </T>
      {fast > 0 && fast < 1 && <circle cx={lerp(575, 210, fast)} cy={60} r={4} fill={C.focus} />}
      <T x={575} y={60} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.1, 2.4))}>
        fast
      </T>
      <g opacity={easeOut(seg(t, 2.6, 2.9))}>
        <T x={25} y={216} s={12} f={C.secondary}>
          JSON, wildcard, external tables
        </T>
        <rect x={400} y={226} width={175} height={30} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
        <T x={487} y={246} s={12} f={C.primary} a="middle">
          standard slots
        </T>
        <path d="M30 224 V241 H400" fill="none" stroke={C.secondary} strokeWidth={1.2} strokeDasharray="4 3" />
      </g>
      {slow > 0 && slow < 1 && <circle cx={lerp(30, 400, slow)} cy={241} r={4} fill={C.secondary} />}
      <Tick x={560} y={206} k={easeOut(seg(t, 4.0, 4.3))} />
      <T x={545} y={210} s={12} f={C.focus} a="end" o={easeOut(seg(t, 4.0, 4.3))}>
        still runs
      </T>
    </Svg>
  );
}

// 5 · Databricks' disk cache: remote storage on the left, a worker's local disk on the right. The first read crosses
// the long way and leaves a copy. Later reads stay local, quick. Then a remote file changes, red, and the local copy
// is evicted by itself — nobody clears it by hand.
export function RevealDatabricksSQL({ t }: StepCtx) {
  const r1 = seg(t, 0.6, 1.6);
  const copy = r1 >= 1;
  const reads = [1.9, 2.2, 2.5];
  const chg = easeOut(seg(t, 3.0, 3.2));
  const evict = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="an automatic disk cache of remote reads, invalidated by Databricks itself on any file change." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={24} s={12} f={C.secondary}>
          remote storage
        </T>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={25 + i * 40} y={40} width={30} height={40} rx={2} fill={C.panel} stroke={i === 1 && chg > 0.5 ? C.badText : C.line} strokeWidth={1.2} />
        ))}
        <T x={365} y={24} s={12} f={C.secondary}>
          local disk
        </T>
        <rect x={365} y={36} width={210} height={52} rx={4} fill="none" stroke={C.line} strokeWidth={1.2} />
      </g>
      {r1 > 0 && r1 < 1 && <rect x={lerp(65, 455, r1)} y={44} width={30} height={40} rx={2} fill={C.second} opacity={0.7} />}
      {copy && <rect x={455} y={44} width={30} height={40} rx={2} fill={C.second} opacity={0.7 * (1 - evict)} />}
      <T x={25} y={120} s={12} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        first read: fetched, copied
      </T>
      {reads.map((r, i) => {
        const p = seg(t, r, r + 0.25);
        return p > 0 && p < 1 ? <circle key={i} cx={470} cy={lerp(140, 88, p)} r={4} fill={C.second} /> : null;
      })}
      <T x={575} y={120} s={12} f={C.second} a="end" o={easeOut(seg(t, 1.9, 2.2))}>
        later reads: local
      </T>
      <T x={25} y={176} s={12} f={C.badText} o={chg}>
        a file changes
      </T>
      <T x={575} y={176} s={12} f={C.focus} a="end" o={evict}>
        evicted, nobody clears it
      </T>
    </Svg>
  );
}

// 6 · Four lanes: the ceiling. Identical queries arrive faster and faster; the first four take lanes, the rest stack
// up in red in front of the ceiling line, each query exactly as short as before.
export function RevealConcurrencyCeilings({ t }: StepCtx) {
  const arr = [0.3, 0.6, 0.9, 1.2, 1.5, 1.65, 1.8, 1.95, 2.1, 2.2, 2.3, 2.4];
  return (
    <Svg label="a reservation or capacity ceiling: past it, queries queue or fail, whatever the query's own speed." h={220}>
      <T x={300} y={24} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        four lanes: the ceiling
      </T>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Lanes x={300} y={40} t={t} arrivals={arr} dur={1.2} laneW={270} />
      </g>
      <T x={25} y={170} s={12} f={C.badText} o={easeOut(seg(t, 2.0, 2.3))}>
        the rest queue
      </T>
      <T x={575} y={170} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        same query length
      </T>
      <T x={300} y={206} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        past the ceiling: queue, or fail
      </T>
    </Svg>
  );
}

// 7 · Four lines with their pictures: a slider over rollup · materialized view · cache, BI Engine's star of tables, the
// disk cache's local copy, and the four lanes with a queue.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['rollup, view, cache', 'one lever, three granularities'],
    ['BI Engine', 'preferred tables, documented limits'],
    ['disk cache', 'local copies, evicted on change'],
    ['the ceiling', 'full lanes queue, any query speed'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  const sl = (Math.sin(t * 2) + 1) / 2;
  return (
    <Svg label="three levers for the same data-change-vs-query-repeat trade-off; two named engines; a ceiling that queues regardless of query speed." h={300}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)}>
          <T x={25} y={40 + i * 70} s={13} f={C.secondary}>
            {a}
          </T>
          <T x={25} y={62 + i * 70} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        <line x1={470} y1={46} x2={570} y2={46} stroke={C.line} strokeWidth={2} />
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={470 + j * 50} cy={46} r={3} fill={C.secondary} />
        ))}
        <circle cx={470 + sl * 100} cy={46} r={6} fill={C.focus} />
      </g>
      <g opacity={k(1)}>
        <Tbl x={505} y={98} w={30} rows={3} c={C.focus} />
        {[
          [470, 96],
          [550, 96],
          [470, 124],
          [550, 124],
        ].map(([x, y], j) => (
          <rect key={j} x={x} y={y} width={18} height={12} rx={1} fill={C.panel} stroke={C.line} />
        ))}
      </g>
      <g opacity={k(2)}>
        <rect x={470} y={170} width={22} height={28} rx={2} fill={C.panel} stroke={C.line} />
        <rect x={545} y={170} width={22} height={28} rx={2} fill={C.second} opacity={0.7 * (1 - easeOut(seg(t, 3.0, 3.4)) * 0.6)} />
        <line x1={496} y1={184} x2={540} y2={184} stroke={C.line} strokeDasharray="3 3" />
      </g>
      <g opacity={k(3)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={490} y={236 + j * 10} width={80} height={6} rx={1} fill={C.primary} />
        ))}
        {[0, 1].map((j) => (
          <rect key={j} x={462 + j * 12} y={249} width={8} height={8} rx={1} fill={C.badText} />
        ))}
      </g>
    </Svg>
  );
}

// 8 · The refresh schedule: ticks at one rate, then the new ticks double it. The same four lanes; at double the rate
// the queries pile up in front of the ceiling. After the answer: each query's length ✓ unchanged, the
// arrivals ×2 in red.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const base = [0.1, 0.5, 0.9, 1.3, 1.7, 2.1, 2.5];
  const dbl = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5];
  const k = on ? easeInOut(seg(s, 0.1, 0.5)) : 0;
  return (
    <Svg label="refresh frequency doubles; queries queue, even though each individual query runs just as fast as before." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={24} s={12} f={C.secondary}>
          refreshes
        </T>
        {dbl.map((d, i) => (
          <line
            key={i}
            x1={130 + d * 70}
            y1={14}
            x2={130 + d * 70}
            y2={28}
            stroke={base.includes(d) ? C.primary : C.badText}
            strokeWidth={1.6}
            opacity={base.includes(d) ? 1 : easeOut(seg(t, 0.8, 1.2))}
          />
        ))}
        <T x={575} y={24} s={12} f={C.badText} a="end" o={easeOut(seg(t, 0.9, 1.2))}>
          ×2
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <Lanes x={300} y={50} t={on ? 3.4 + s : t + 0.6} arrivals={dbl.map((d) => d * 1.4)} dur={1.6} laneW={270} />
      </g>
      <T x={25} y={170} s={13} f={C.focus} o={on ? 0 : easeOut(seg(t, 1.6, 2.0))}>
        what changed: ?
      </T>
      {on && (
        <g opacity={k}>
          <Tick x={30} y={160} k={1} />
          <T x={45} y={165} s={12} f={C.focus}>
            each query: same speed
          </T>
          <T x={45} y={188} s={12} f={C.badText}>
            arrivals at the ceiling: doubled
          </T>
        </g>
      )}
    </Svg>
  );
}
