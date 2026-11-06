import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// TSDB vs warehouse vs lakehouse, drawn on examples.py's synthetic week (1,297 series at 10 s, 78,442,560 rows): the
// cells each access path touches, the 93,263-row join, the /bin/bash.0044 and /bin/bash.58 cost chain, and the tier overlap.
// Query timings are machine-dependent and are not shown; row counts are.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

type Pt = readonly [number, number];

// The synthetic week from examples.py: 1,297 series × one week at 10 s. Work orders sit on every 5th series (259 of
// them), each one hour long, starting at these hours of the week (DuckDB's own hash, as examples.py computes it).
// prettier-ignore
const WO_HOURS = [0,147,127,41,47,12,39,138,153,2,121,133,56,108,54,1,52,38,150,93,9,34,36,120,113,120,150,97,41,5,104,88,24,61,30,74,60,56,56,52,27,10,95,147,50,46,120,48,116,130,10,162,140,82,43,10,67,75,105,73,41,161,8,87,152,83,58,103,163,79,91,107,121,149,122,150,86,47,87,12,93,74,57,37,111,56,81,106,36,105,103,71,36,91,157,81,149,87,97,99,20,92,158,154,113,6,65,118,94,57,139,14,66,13,29,102,110,57,83,147,5,158,106,106,117,116,107,100,73,36,44,65,132,138,36,23,58,151,151,154,15,25,29,9,61,31,53,87,131,25,85,128,84,143,158,63,114,136,75,166,122,151,81,145,47,152,74,93,54,103,122,77,37,134,11,118,143,3,87,77,63,11,75,120,132,17,100,5,32,151,34,137,79,89,90,53,133,24,162,24,41,43,120,90,82,25,74,58,160,33,101,83,101,143,22,134,167,119,39,117,75,142,73,93,141,28,57,52,159,41,153,32,39,148,74,44,89,34,127,62,11,25,149,1,46,41,38,136,26,86,38,116,96,8,53,35,49,93,162];

/** The week as a rectangle: series down, hours across. `kind` picks which cells one access path touches. */
const WeekGrid = ({ x, y, w, h, kind, k, o = 1 }: { x: number; y: number; w: number; h: number; kind: 'newest' | 'stretch' | 'across' | 'join'; k: number; o?: number }) => {
  const hx = (hr: number) => x + (hr / 168) * w;
  const sy = (s: number) => y + (s / 1297) * h;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} fill={C.panel} stroke={C.line} strokeWidth={1} />
      {kind === 'newest' && <circle cx={x + w - 2} cy={sy(42)} r={3} fill={C.focus} opacity={k} />}
      {kind === 'stretch' && <rect x={x} y={sy(42) - 1.5} width={4} height={3} fill={C.focus} opacity={k} />}
      {kind === 'across' && <rect x={x} y={y} width={4} height={h * k} fill={C.focus} />}
      {kind === 'join' && WO_HOURS.map((hr, i) => (i / WO_HOURS.length < k ? <rect key={i} x={hx(hr)} y={sy(i * 5)} width={3} height={1.4} fill={C.second} /> : null))}
    </g>
  );
};

// 0 · The plant's traffic as one source dot. First a single line runs to one shape, labelled "demo", ticked. Then
// three more lines branch to three other shapes — a stretch, an across-all band, a join to a work order — until four
// different access paths hang off the one source and the caption says no one shape covers them.
export function Hook({ t }: StepCtx) {
  const ends = [36, 82, 128, 174];
  const labels = ['newest', 'a stretch', 'across all', 'join'];
  const path = (yy: number): Pt[] => Array.from({ length: 13 }, (_, i) => [lerp(150, 300, i / 12), lerp(105, yy, easeInOut(i / 12))] as const);
  return (
    <Svg label="a vendor demo shows one engine handling every query a plant could ask, but the plant's own workload splits into access paths no single demo query shape covers" h={200}>
      <circle cx={150} cy={105} r={6} fill={C.focus} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={25} y={101} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        plant
      </T>
      <T x={25} y={118} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        traffic
      </T>
      {ends.map((yy, i) => {
        const a = i === 0 ? 0.3 : 1.6 + (i - 1) * 0.5;
        const k = easeOut(seg(t, a + 0.6, a + 0.9));
        return (
          <g key={i}>
            <Draw pts={path(yy)} t={t} from={a} to={a + 0.6} stroke={i === 0 ? C.focus : C.second} w={1.8} />
            <g opacity={k}>
              {i === 0 && (
                <g>
                  <line x1={315} y1={yy} x2={365} y2={yy} stroke={C.line} strokeWidth={1.4} />
                  <circle cx={365} cy={yy} r={4} fill={C.focus} />
                </g>
              )}
              {i === 1 && (
                <g>
                  <line x1={315} y1={yy} x2={375} y2={yy} stroke={C.line} strokeWidth={1.4} />
                  <line x1={330} y1={yy} x2={360} y2={yy} stroke={C.focus} strokeWidth={3} />
                </g>
              )}
              {i === 2 && (
                <g>
                  {[0, 1, 2].map((j) => (
                    <line key={j} x1={315} y1={yy - 8 + j * 8} x2={375} y2={yy - 8 + j * 8} stroke={C.line} strokeWidth={1.4} />
                  ))}
                  <rect x={340} y={yy - 12} width={8} height={24} fill={C.focus} opacity={0.6} />
                </g>
              )}
              {i === 3 && (
                <g>
                  <line x1={315} y1={yy} x2={350} y2={yy} stroke={C.line} strokeWidth={1.4} />
                  <rect x={356} y={yy - 7} width={20} height={14} fill="none" stroke={C.second} strokeWidth={1.2} />
                  <line x1={340} y1={yy} x2={356} y2={yy} stroke={C.second} strokeWidth={1.4} strokeDasharray="2 2" />
                </g>
              )}
              <T x={395} y={yy + 5} s={13} f={i === 0 ? C.focus : C.primary}>
                {labels[i]}
              </T>
            </g>
          </g>
        );
      })}
      <T x={575} y={41} s={12} f={C.focus} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        demo
      </T>
      <T x={25} y={194} s={13} f={C.badText} w={600} o={easeOut(seg(t, 4.0, 4.5))}>
        no one shape covers all
      </T>
    </Svg>
  );
}

// 1 · The decision matrix as four miniature weeks — 1,297 series down, 168 hours across — each lighting only the cells
// its access path touches: one newest point, one hour of one series (360 rows), one hour across every series (466,920),
// and 259 one-hour work-order windows (93,263 matched rows). Same 78,442,560 rows under all four.
export function RevealMatrix({ t }: StepCtx) {
  const rows: { l: string; kind: 'newest' | 'stretch' | 'across' | 'join'; r: string; c: string }[] = [
    { l: 'newest reading', kind: 'newest', r: '1 row', c: C.focus },
    { l: '1 h, one sensor', kind: 'stretch', r: '360 rows', c: C.focus },
    { l: '1 h, all sensors', kind: 'across', r: '466,920', c: C.focus },
    { l: 'join work orders', kind: 'join', r: '93,263', c: C.second },
  ];
  return (
    <Svg label="a last-value lookup, a range scan, a cross-series aggregation, and a join to business data, all measured against the same synthetic week of the plant's own series count" h={260}>
      <T x={300} y={22} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 0, 0.4))}>
        same week: 78,442,560 rows
      </T>
      {rows.map((r, i) => {
        const y = 40 + i * 54;
        const a = 0.4 + i * 1.15;
        const k = easeOut(seg(t, a + 0.3, a + 0.9));
        return (
          <g key={i} opacity={easeOut(seg(t, a, a + 0.3))}>
            <T x={25} y={y + 23} s={13} f={C.primary}>
              {r.l}
            </T>
            <WeekGrid x={240} y={y} w={180} h={36} kind={r.kind} k={k} />
            <T x={575} y={y + 23} s={14} f={r.c} a="end" w={600} o={easeOut(seg(t, a + 0.8, a + 1.1))}>
              {r.r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · One node box takes the metrics row with a tick. Then its own documentation's three limits land one by one, each
// crossed: a dashed second node that never joins (not clustered), a copy arrow that goes nowhere (not replicated), and
// the node's own disk flashing red (not durable against a node outage).
export function RevealPrometheusRow({ t }: StepCtx) {
  const lim = [
    { l: 'not clustered', a: 1.8 },
    { l: 'not replicated', a: 2.9 },
    { l: 'not node-loss safe', a: 4.0 },
  ];
  const diskBad = seg(t, 4.2, 4.3) > 0;
  return (
    <Svg
      label="Prometheus-style engines are built for this write rate and query shape, but their own documentation names the limitation: not clustered, not replicated, not durable against a node outage"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={30} y={60} width={150} height={70} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
        <T x={105} y={88} s={13} f={C.focus} a="middle" w={600}>
          one node
        </T>
        <rect x={55} y={102} width={100} height={14} rx={2} fill={diskBad ? C.bad : 'none'} stroke={diskBad ? C.badText : C.secondary} strokeWidth={1.1} />
        <T x={105} y={113} s={10} f={diskBad ? C.focus : C.secondary} a="middle">
          disk
        </T>
      </g>
      <T x={30} y={34} s={13} f={C.focus} o={easeOut(seg(t, 0.6, 1.0))}>
        metrics row
      </T>
      <Tick x={150} y={29} k={easeOutBack(seg(t, 0.9, 1.3))} />
      <rect x={200} y={60} width={60} height={70} rx={5} fill="none" stroke={C.line} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.8, 2.2)) * (1 - 0.6 * seg(t, 2.4, 2.8))} />
      {lim.map((x, i) => {
        const y = 60 + i * 44;
        return (
          <g key={i}>
            <Cross x={300} y={y + 6} k={easeOutBack(seg(t, x.a + 0.3, x.a + 0.7))} />
            <T x={320} y={y + 11} s={14} f={C.primary} o={easeOut(seg(t, x.a, x.a + 0.3))}>
              {x.l}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · History as a bar: one week, then it stretches to three years. Before the answer: "cheaper or pricier?". After
// it, the bar splits — the newest two weeks stay white as the hot tier, the rest turns pale blue as the lakehouse — and
// the join glyph drops onto the lakehouse part: the engine underneath changed.
export function PredictJoinCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const grow = easeInOut(seg(t, 1.0, 2.6));
  const W = 520;
  const wk = W / 156;
  const len = lerp(wk, W, grow);
  const split = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const drop = on ? easeIn(seg(s, 0.9, 1.5)) : 0;
  return (
    <Svg label="a join to business data runs against one week of history today — as the plant keeps years of history instead of weeks, does the join get cheaper, or more expensive, to run?" h={200}>
      <rect x={40 + W - len} y={100} width={len} height={22} fill={split > 0.5 ? C.second : C.secondary} opacity={easeOut(seg(t, 0, 0.3))} />
      {split > 0 && <rect x={40 + W - 2 * wk} y={100} width={2 * wk} height={22} fill={C.focus} opacity={split} />}
      <T x={40 + W} y={142} s={12} f={C.quiet} a="end" o={1 - grow}>
        1 week
      </T>
      <T x={40} y={142} s={12} f={C.quiet} o={easeOut(seg(t, 2.4, 2.8))}>
        3 years
      </T>
      <g transform={`translate(${on ? lerp(0, -220, split) : 0} ${on ? lerp(0, 52, drop) : 0})`} opacity={easeOut(seg(t, 0.3, 0.6))}>
        <line x1={480} y1={40} x2={515} y2={40} stroke={C.line} strokeWidth={1.4} />
        <rect x={521} y={33} width={20} height={14} fill="none" stroke={C.second} strokeWidth={1.2} />
        <line x1={505} y1={40} x2={521} y2={40} stroke={C.second} strokeWidth={1.4} strokeDasharray="2 2" />
        <T x={470} y={45} s={12} f={C.primary} a="end">
          join
        </T>
      </g>
      {!on ? (
        <T x={300} y={184} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
          cheaper or pricier?
        </T>
      ) : (
        <g>
          <T x={575} y={142} s={12} f={C.focus} a="end" o={split}>
            hot tier
          </T>
          <T x={150} y={142} s={12} f={C.second} o={split}>
            lakehouse
          </T>
          <T x={300} y={184} s={14} f={C.focus} a="middle" w={600} o={easeOut(seg(s, 1.4, 1.8))}>
            the right engine changes
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · Three engines, three pictures of one bet. ClickHouse: sorted granules with a sparse mark over every one, and the
// lookup jumps straight to the last granule. QuestDB: three stacked storage layers with the newest row on top. InfluxDB
// 3: a small in-memory cache already holding the newest value. All three arrows land on the same "cheap lookup".
export function RevealHighRateEngines({ t }: StepCtx) {
  const rowY = (i: number) => 30 + i * 64;
  return (
    <Svg label="ClickHouse's sparse primary key, QuestDB's three-tier storage, and InfluxDB 3's in-memory cache are three different names for the same bet: make the common lookup cheap" h={260}>
      {[
        { n: 'ClickHouse', m: 'sparse index' },
        { n: 'QuestDB', m: 'three tiers' },
        { n: 'InfluxDB 3', m: 'last-value cache' },
      ].map((e, i) => (
        <g key={e.n} opacity={easeOut(seg(t, i * 1.3, i * 1.3 + 0.4))}>
          <T x={25} y={rowY(i) + 20} s={14} f={C.primary} w={600}>
            {e.n}
          </T>
          <T x={575} y={rowY(i) + 20} s={13} f={C.second} a="end">
            {e.m}
          </T>
        </g>
      ))}
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        {Array.from({ length: 6 }, (_, j) => (
          <g key={j}>
            <rect x={170 + j * 30} y={rowY(0) + 10} width={26} height={16} fill={j === 5 && seg(t, 0.9, 1.0) > 0 ? C.focus : C.panel} stroke={C.line} strokeWidth={1} />
            <line x1={170 + j * 30} y1={rowY(0) + 2} x2={170 + j * 30} y2={rowY(0) + 8} stroke={C.second} strokeWidth={1.6} />
          </g>
        ))}
        <path d={`M170 ${rowY(0) - 2} Q 260 ${rowY(0) - 22} ${330} ${rowY(0) + 6}`} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 1.0))} />
      </g>
      <g opacity={easeOut(seg(t, 1.5, 1.9))}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={180 + j * 10} y={rowY(1) + 2 + j * 9} width={130 - j * 20} height={7} fill={j === 0 && seg(t, 2.2, 2.3) > 0 ? C.focus : C.panel} stroke={C.line} strokeWidth={1} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 2.8, 3.2))}>
        <rect x={180} y={rowY(2) + 4} width={60} height={24} rx={4} fill="none" stroke={C.second} strokeWidth={1.4} />
        <circle cx={210} cy={rowY(2) + 16} r={4} fill={seg(t, 3.4, 3.5) > 0 ? C.focus : C.second} />
        <line x1={250} y1={rowY(2) + 16} x2={320} y2={rowY(2) + 16} stroke={C.line} strokeWidth={1.4} />
      </g>
      {[0, 1, 2].map((i) => (
        <Draw key={i} pts={[[345, rowY(i) + 16] as const, [300, 226] as const]} t={t} from={3.8 + i * 0.15} to={4.4 + i * 0.15} stroke={C.focus} w={1.2} pen={false} />
      ))}
      <T x={300} y={248} s={14} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 4.6, 5.0))}>
        same bet: a cheap newest-value lookup
      </T>
    </Svg>
  );
}

// 5 · One series' readings as ticks; a one-hour work-order bar settles over them and the ticks underneath light up.
// Then the view pulls back to the whole week, where all 259 work orders land across every fifth series: 93,263 matched
// rows, run in DuckDB — the engine under a table format on object storage.
export function RevealLakehouseJoin({ t }: StepCtx) {
  const wo = easeOut(seg(t, 0.6, 1.2));
  const back = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="the join to a synthetic work-order table runs successfully against the full history in DuckDB, the same engine a table format over object storage would use underneath" h={200}>
      <g opacity={1 - back}>
        <T x={25} y={64} s={12} f={C.quiet}>
          one series
        </T>
        {Array.from({ length: 40 }, (_, i) => {
          const inside = i >= 14 && i <= 25;
          return <line key={i} x1={150 + i * 10} y1={70} x2={150 + i * 10} y2={84} stroke={inside && wo > 0.9 ? C.focus : C.line} strokeWidth={1.4} />;
        })}
        <rect x={286} y={lerp(20, 44, wo)} width={112} height={16} rx={3} fill="none" stroke={C.second} strokeWidth={1.4} opacity={wo} />
        <T x={342} y={lerp(14, 38, wo)} s={12} f={C.second} a="middle" o={wo}>
          work order, 1 h
        </T>
      </g>
      <g opacity={back}>
        <T x={25} y={40} s={12} f={C.quiet}>
          the whole week
        </T>
        <WeekGrid x={150} y={28} w={420} h={84} kind="join" k={seg(t, 2.4, 3.6)} />
      </g>
      <T x={25} y={150} s={14} f={C.second} w={600} o={easeOut(seg(t, 3.6, 4.0))}>
        93,263 matched rows
      </T>
      <Tick x={300} y={145} k={easeOutBack(seg(t, 3.9, 4.3))} />
      <T x={25} y={184} s={13} f={C.primary} o={easeOut(seg(t, 4.3, 4.7))}>
        DuckDB: the engine under a table format
      </T>
    </Svg>
  );
}

// 6 · The cost chain, factor by factor: 1,297 series × 8,640 points a day × 1.5 B. Two retentions run through it: 14
// days becomes a bar of 0.2192 GB, three years a bar of 29.04 GB; at $0.02 per GB-month they cost $0.0044 and $0.58.
export function RevealCapacityChain({ t }: StepCtx) {
  const W = 300;
  const hot = easeOut(seg(t, 2.0, 2.6));
  const lake = easeInOut(seg(t, 3.0, 4.2));
  return (
    <Svg
      label="series count times sampling rate times retention times bytes per point, priced at a documented $0.02 per gigabyte, gives a two-week hot tier and a three-year lakehouse tier two different numbers"
      h={200}
    >
      {[
        { v: '1,297 series', x: 25, a: 0 },
        { v: '× 8,640 /day', x: 200, a: 0.4 },
        { v: '× 1.5 B', x: 380, a: 0.8 },
      ].map((p) => (
        <T key={p.v} x={p.x} y={30} s={14} f={C.primary} w={600} o={easeOut(seg(t, p.a, p.a + 0.35))}>
          {p.v}
        </T>
      ))}
      <T x={575} y={30} s={14} f={C.second} a="end" w={600} o={easeOut(seg(t, 1.2, 1.6))}>
        × days
      </T>

      <T x={25} y={86} s={13} f={C.secondary} o={easeOut(seg(t, 1.8, 2.1))}>
        14 days
      </T>
      <rect x={130} y={92} width={Math.max(2, (W * 0.2192) / 29.04) * hot} height={14} fill={C.focus} />
      <T x={150} y={104} s={13} f={C.focus} o={easeOut(seg(t, 2.4, 2.8))}>
        0.2192 GB
      </T>
      <T x={575} y={104} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 2.6, 3.0))}>
        $0.0044/mo
      </T>

      <T x={25} y={146} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.1))}>
        3 years
      </T>
      <rect x={130} y={152} width={W * lake} height={14} fill={C.second} />
      <T x={130} y={186} s={13} f={C.second} o={easeOut(seg(t, 4.1, 4.5))}>
        29.04 GB
      </T>
      <T x={575} y={164} s={14} f={C.second} a="end" w={600} o={easeOut(seg(t, 4.3, 4.7))}>
        $0.58/mo
      </T>
      <T x={575} y={194} s={11} f={C.quiet} a="end" o={easeOut(seg(t, 4.7, 5.1))}>
        at $0.02 per GB-month
      </T>
    </Svg>
  );
}

// 7 · Two lanes over the hot tier's 14 days. The hot lane fills; the lakehouse lane reaches two days into it, and those
// two days glow red in both lanes: 22,412,160 points held twice. Below, a reading for day 3 arrives on day 8, after the
// day-5 export ran: it drops into the hot tier only, and the lakehouse is crossed out.
export function RevealTierBoundary({ t }: StepCtx) {
  const dx = (d: number) => 150 + d * 29;
  const hotK = easeOut(seg(t, 0.2, 1.0));
  const lakeK = easeOut(seg(t, 0.8, 1.5));
  const both = easeOut(seg(t, 1.6, 2.1));
  const late = seg(t, 3.4, 4.2);
  const lx = (d: number) => 360 + d * 21;
  return (
    <Svg
      label="exporting the hot tier to the lakehouse after a lag leaves a window where a point sits in both tiers at once, and a reading that arrives after its day's export already ran reaches only the hot tier"
      h={200}
    >
      <T x={25} y={34} s={13} f={C.secondary} o={hotK}>
        hot, 14 d
      </T>
      <rect x={dx(0)} y={22} width={(dx(14) - dx(0)) * hotK} height={16} fill={C.focus} opacity={0.75} />
      <T x={25} y={66} s={13} f={C.second} o={lakeK}>
        lakehouse
      </T>
      <rect x={dx(-0.3)} y={54} width={(dx(2) - dx(-0.3)) * lakeK} height={16} fill={C.second} />
      <rect x={dx(0)} y={18} width={dx(2) - dx(0)} height={56} fill="none" stroke={C.badText} strokeWidth={1.8} opacity={both} />
      <T x={dx(2) + 12} y={66} s={13} f={C.badText} w={600} o={easeOut(seg(t, 2.0, 2.4))}>
        22,412,160 points twice
      </T>

      <g opacity={easeOut(seg(t, 2.7, 3.0))}>
        <line x1={lx(0)} y1={150} x2={lx(10)} y2={150} stroke={C.line} strokeWidth={1.2} />
        {[0, 3, 5, 8, 10].map((d) => (
          <T key={d} x={lx(d)} y={168} s={11} f={C.quiet} a="middle">
            {String(d)}
          </T>
        ))}
        <line x1={lx(5)} y1={118} x2={lx(5)} y2={156} stroke={C.second} strokeWidth={1.6} strokeDasharray="4 3" />
        <T x={lx(5)} y={112} s={11} f={C.second} a="middle">
          export ran
        </T>
      </g>
      <T x={25} y={146} s={13} f={C.primary} o={easeOut(seg(t, 2.8, 3.1))}>
        day-3 reading
      </T>
      <circle
        cx={late < 0.5 ? lx(8) : lerp(lx(8), lx(3), easeInOut((late - 0.5) * 2))}
        cy={late < 0.5 ? lerp(110, 144, easeIn(late * 2)) : 144}
        r={5}
        fill={late >= 1 ? C.badText : C.focus}
        opacity={easeOut(seg(t, 3.2, 3.4))}
      />
      <T x={25} y={176} s={12} f={C.quiet} o={easeOut(seg(t, 3.0, 3.3))}>
        arrives day 8
      </T>
      <T x={25} y={196} s={13} f={C.badText} w={600} o={easeOut(seg(t, 4.4, 4.8))}>
        hot tier only
      </T>
      <Cross x={250} y={190} k={easeOutBack(seg(t, 4.6, 5.0))} />
      <T x={268} y={196} s={12} f={C.badText} o={easeOut(seg(t, 4.6, 5.0))}>
        lakehouse
      </T>
    </Svg>
  );
}

// 8 · Five lanes, each a tiny picture: the week grid, the single node, the three shortcuts as one dot, the join box,
// and a red overlap band at the tier boundary.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 32 + i * 50;
  const k = (i: number) => easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
  const texts = [
    { l: 'matrix', r: 'same data', c: C.focus },
    { l: 'metrics row', r: 'Prometheus-style', c: C.focus },
    { l: 'newest value', r: 'one shortcut', c: C.second },
    { l: 'join, years', r: 'lakehouse', c: C.second },
    { l: 'tier boundary', r: 'dupes or drops', c: C.badText },
  ];
  return (
    <Svg
      label="a decision matrix measured on the same data, Prometheus-style engines owning the metrics row, three high-rate engines sharing one shortcut, the lakehouse owning the join, a cost chain, and a tiering boundary that duplicates or drops"
      h={260}
    >
      <WeekGrid x={25} y={lane(0) - 12} w={110} h={22} kind="across" k={k(0)} o={k(0)} />
      <rect x={45} y={lane(1) - 12} width={70} height={22} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.4} opacity={k(1)} />
      <g opacity={k(2)}>
        {[0, 1, 2].map((j) => (
          <line key={j} x1={30 + j * 30} y1={lane(2) - 10} x2={110} y2={lane(2)} stroke={C.line} strokeWidth={1.2} />
        ))}
        <circle cx={115} cy={lane(2)} r={5} fill={C.second} />
      </g>
      <g opacity={k(3)}>
        <line x1={25} y1={lane(3)} x2={90} y2={lane(3)} stroke={C.line} strokeWidth={1.4} />
        <rect x={96} y={lane(3) - 8} width={30} height={16} fill="none" stroke={C.second} strokeWidth={1.3} />
      </g>
      <g opacity={k(4)}>
        <rect x={25} y={lane(4) - 10} width={110} height={8} fill={C.focus} opacity={0.75} />
        <rect x={25} y={lane(4) + 2} width={40} height={8} fill={C.second} />
        <rect x={45} y={lane(4) - 12} width={20} height={24} fill="none" stroke={C.badText} strokeWidth={1.4} />
      </g>
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)}>
          <T x={165} y={lane(i) + 5} s={14} f={C.primary}>
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

// 9 · Two workloads given only as an access path and a retention: "newest, 14 days" and "join, 3 years". Before the
// answer each points at "tier: ?". After it, the matrix's own rows answer: the first lands in the hot tier, the second
// in the lakehouse — no vendor name anywhere.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const rows = [
    { l: 'newest, 14 days', r: 'hot tier', c: C.focus },
    { l: 'join, 3 years', r: 'lakehouse', c: C.second },
  ];
  return (
    <Svg
      label="given only an access path and a retention window, not a vendor name, can the matrix alone say which tier a workload belongs on, without guessing at any engine's marketing claim?"
      h={200}
    >
      {rows.map((r, i) => {
        const y = 60 + i * 64;
        const k = on ? easeOut(seg(s, 0.3 + i * 0.4, 0.8 + i * 0.4)) : 0;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.5, 0.4 + i * 0.5))}>
            <T x={25} y={y} s={14} f={C.primary} w={600}>
              {r.l}
            </T>
            <line x1={270} y1={y - 5} x2={lerp(270, 380, on ? k : easeOut(seg(t, 1.2, 1.8)))} y2={y - 5} stroke={on ? r.c : C.line} strokeWidth={1.6} />
            {!on ? (
              <T x={575} y={y} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.8, 2.2))}>
                tier: ?
              </T>
            ) : (
              <T x={575} y={y} s={14} f={r.c} a="end" w={600} o={k}>
                {r.r}
              </T>
            )}
          </g>
        );
      })}
      {on && (
        <T x={300} y={186} s={12} f={C.quiet} a="middle" o={easeOut(seg(s, 1.4, 1.8))}>
          no vendor name needed
        </T>
      )}
    </Svg>
  );
}
