import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// BI tools as the warehouse's consumer. The topic has no examples.py; nothing here is a measured number. The hook's
// "tripled" is the scenario's own word, drawn as a bar three times the height of the nights before it. The extract and
// live hit counters count the clicks drawn on screen, nothing more. Direct Lake's per-column load and its fallback
// follow the FACT-CHECK's quoted Microsoft documentation.

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

/** A warehouse cylinder at (x, y). */
const Wh = ({ x, y, w = 110, h = 90, c = C.secondary, o = 1, label = 'warehouse' }: { x: number; y: number; w?: number; h?: number; c?: string; o?: number; label?: string }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <g fill={C.panel} stroke={c} strokeWidth={1.3}>
        <path d={`M${x} ${y + 7} v${h - 14} a${w / 2} 7 0 0 0 ${w} 0 v${-(h - 14)}`} />
        <ellipse cx={x + w / 2} cy={y + 7} rx={w / 2} ry={7} />
      </g>
      <T x={x + w / 2} y={y + h / 2 + 10} s={12} f={C.secondary} a="middle">
        {label}
      </T>
    </g>
  );

/** A small bar chart glyph standing for a dashboard. */
const Chart = ({ x, y, o = 1 }: { x: number; y: number; o?: number }) => (
  <g opacity={o}>
    {[18, 30, 22, 38].map((h, i) => (
      <rect key={i} x={x + i * 14} y={y - h} width={10} height={h} rx={1} fill={C.secondary} />
    ))}
  </g>
);

/** Click ripple at (x, y), age a in seconds (drawn for the first 0.5 s). */
const Click = ({ x, y, a }: { x: number; y: number; a: number }) =>
  a < 0 || a > 0.5 ? null : <circle cx={x} cy={y} r={4 + a * 24} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={1 - a * 2} />;

// 0 · The same dashboard tile throughout. A mode switch slides from "extract" to "live". The warehouse's nightly cost
// bars stand level, then after the switch the next bar rises to three times their height, red: tripled.
export function Hook({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.7, 1.1));
  const rise = easeOut(seg(t, 1.3, 2.0));
  return (
    <Svg label="a dashboard moves from extract to live mode; the warehouse's query cost triples overnight." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={25} y={20} width={210} height={110} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        <Chart x={45} y={110} />
        <T x={115} y={46} s={12} f={C.secondary}>
          dashboard
        </T>
        <rect x={25} y={146} width={210} height={28} rx={14} fill={C.band} stroke={C.line} strokeWidth={1.1} />
        <rect x={lerp(27, 131, sw)} y={148} width={102} height={24} rx={12} fill={sw > 0.5 ? C.badText : C.secondary} opacity={0.35} />
        <T x={78} y={165} s={12} f={sw < 0.5 ? C.focus : C.quiet} a="middle">
          extract
        </T>
        <T x={182} y={165} s={12} f={sw > 0.5 ? C.focus : C.quiet} a="middle">
          live
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={320} y={26} s={12} f={C.secondary}>
          cost per night
        </T>
        <line x1={320} y1={170} x2={560} y2={170} stroke={C.line} strokeWidth={1.2} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={330 + i * 50} y={130} width={34} height={40} rx={2} fill={C.secondary} />
        ))}
        <rect x={480} y={170 - 120 * rise} width={34} height={120 * rise} rx={2} fill={C.badText} />
      </g>
      <T x={575} y={194} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.0, 2.3))}>
        tripled
      </T>
      <T x={25} y={208} s={12} f={C.secondary} o={easeOut(seg(t, 2.2, 2.6))}>
        the dashboard didn't change
      </T>
    </Svg>
  );
}

// 1 · Three modes in a column, "fresh, without the cost: ?". After the answer live is struck, the per-column load lights
// with ✓ "where available", and extract gets ✓ "a chosen refresh interval".
export function PredictWhichModeWouldHaveWorked({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const rows: [string, string][] = [
    ['live', 'cost on every click'],
    ['per-column load', 'where available'],
    ['extract', 'chosen refresh interval'],
  ];
  return (
    <Svg label="which mode gives fresh data without that cost?" h={180}>
      {rows.map(([l, n], i) => {
        const y = 22 + i * 46;
        const k = on ? easeOut(seg(s, 0.2 + i * 0.4, 0.6 + i * 0.4)) : 0;
        return (
          <g key={l} opacity={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))}>
            <Box x={25} y={y} w={200} label={l} lit={on && i === 1 && k > 0.5} stroke={on && i === 0 && k > 0.5 ? C.badText : undefined} />
            {on && (i === 0 ? <Cross x={242} y={y + 16} k={k} /> : <Tick x={242} y={y + 16} k={k} />)}
            <T x={262} y={y + 21} s={12} f={i === 0 ? C.badText : C.focus} o={k}>
              {n}
            </T>
          </g>
        );
      })}
      <T x={575} y={170} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 0.8, 1.2))}>
        fresh, without the cost: ?
      </T>
    </Svg>
  );
}

// 2 · A two-by-two: who sells it (commercial, open source) against what it does (modeling layer, dashboarding). Looker
// drops into commercial modeling, Power BI and Tableau into commercial dashboarding, Superset and Metabase into open
// source dashboarding. The open-source modeling cell stays empty.
export function RevealToolsByCategory({ t }: StepCtx) {
  const cells: [string, number, number, number][] = [
    ['Looker / LookML', 0, 0, 0.8],
    ['Power BI', 0, 1, 1.6],
    ['Tableau', 0, 1, 1.9],
    ['Superset', 1, 1, 2.6],
    ['Metabase', 1, 1, 2.9],
  ];
  const slot: Record<string, number> = { 'Power BI': 0, Tableau: 1, Superset: 0, Metabase: 1 };
  const grid = easeOut(seg(t, 0, 0.5));
  return (
    <Svg label="five tools, by category: commercial or open-source, modeling layer or plain dashboarding." h={300}>
      <g opacity={grid}>
        <T x={292} y={26} s={12} f={C.secondary} a="middle">
          commercial
        </T>
        <T x={482} y={26} s={12} f={C.secondary} a="middle">
          open source
        </T>
        <T x={25} y={90} s={12} f={C.secondary}>
          modeling
        </T>
        <T x={25} y={190} s={12} f={C.secondary}>
          dashboarding
        </T>
        {[0, 1].map((c) =>
          [0, 1].map((r) => <rect key={`${c}${r}`} x={200 + c * 190} y={40 + r * 90} width={180} height={r === 0 ? 80 : 120} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.1} />),
        )}
      </g>
      {cells.map(([l, c, r, st]) => {
        const k = easeOutBack(seg(t, st, st + 0.4));
        const y = r === 0 ? 86 : 162 + slot[l] * 48;
        return k <= 0 ? null : (
          <g key={l} opacity={Math.min(1, k)}>
            <T x={290 + c * 190} y={lerp(y - 20, y, k)} s={12} f={r === 0 ? C.focus : C.primary} a="middle">
              {l}
            </T>
          </g>
        );
      })}
      <T x={300} y={284} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        who sells it ≠ what it does
      </T>
    </Svg>
  );
}

// 3 · Extract: a full copy flows from the warehouse into the tool. Clicks ripple inside the tool and are answered from
// the copy; the warehouse stays dark. Then the scheduled refresh: one more copy, and the warehouse's hit count ticks.
export function RevealImportExtract({ t }: StepCtx) {
  const copy = easeInOut(seg(t, 0.3, 1.0));
  const ref = easeInOut(seg(t, 2.6, 3.2));
  const clicks = [1.3, 1.6, 1.9, 2.2];
  const hits = (copy >= 1 ? 1 : 0) + (ref >= 1 ? 1 : 0);
  return (
    <Svg label="a copy of the data lives inside the tool; the warehouse is hit only on refresh." h={180}>
      <Wh x={25} y={30} o={easeOut(seg(t, 0, 0.3))} c={copy > 0 && copy < 1 ? C.focus : ref > 0 && ref < 1 ? C.focus : C.line} />
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={330} y={20} width={245} height={110} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        <T x={345} y={40} s={12} f={C.secondary}>
          the tool
        </T>
        <rect x={345} y={52} width={120} height={64} rx={3} fill={C.band} stroke={copy >= 1 ? C.second : C.line} strokeWidth={1.2} />
        <T x={405} y={90} s={12} f={C.second} a="middle" o={copy >= 1 ? 1 : 0}>
          copy
        </T>
      </g>
      {copy > 0 && copy < 1 && <rect x={lerp(140, 345, copy)} y={60} width={50} height={40} rx={2} fill={C.second} opacity={0.7} />}
      {ref > 0 && ref < 1 && <rect x={lerp(140, 345, ref)} y={60} width={50} height={40} rx={2} fill={C.second} opacity={0.7} />}
      {clicks.map((c, i) => (
        <Click key={i} x={510 + (i % 2) * 30} y={70 + (i % 3) * 18} a={t - c} />
      ))}
      <T x={25} y={150} s={12} f={C.secondary} o={easeOut(seg(t, 0.4, 0.7))}>
        warehouse queries: {hits}
      </T>
      <T x={575} y={150} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        clicks answered locally
      </T>
      <T x={575} y={172} s={12} f={C.second} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        next refresh, on schedule
      </T>
    </Svg>
  );
}

// 4 · Live: no copy. Each click in the tool sends a query line across to the warehouse, which lights every time, and the
// hit count climbs click by click.
export function RevealLiveQuery({ t }: StepCtx) {
  const clicks = [0.8, 1.15, 1.5, 1.85, 2.2, 2.55];
  const hits = clicks.filter((c) => t >= c + 0.35).length;
  const busy = clicks.some((c) => t >= c && t < c + 0.4);
  return (
    <Svg label="every interaction re-queries the warehouse directly; freshness is perfect, load scales with usage." h={180}>
      <Wh x={25} y={30} o={easeOut(seg(t, 0, 0.3))} c={busy ? C.badText : C.line} />
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={330} y={20} width={245} height={110} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        <T x={345} y={40} s={12} f={C.secondary}>
          the tool, no copy
        </T>
        <Chart x={345} y={115} />
      </g>
      {clicks.map((c, i) => {
        const p = seg(t, c, c + 0.35);
        return (
          <g key={i}>
            <Click x={510 + (i % 2) * 30} y={70 + (i % 3) * 18} a={t - c} />
            {p > 0 && p < 1 && <circle cx={lerp(500, 140, p)} cy={lerp(75, 70, p)} r={4} fill={C.badText} />}
          </g>
        );
      })}
      <T x={25} y={150} s={12} f={hits > 0 ? C.badText : C.secondary} o={easeOut(seg(t, 0.4, 0.7))}>
        warehouse queries: {hits}
      </T>
      <T x={575} y={150} s={12} f={C.focus} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        always current
      </T>
      <T x={575} y={172} s={12} f={C.badText} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        a cost on every click
      </T>
    </Svg>
  );
}

// 5 · Direct Lake: OneLake holds a Delta table's columns; the tool's slots start empty. A query asks for column B: it
// loads from storage the first time; the next ask is answered in memory. Column D loads the same way. One column can't
// load this way, and that request falls back, dashed, to querying the source.
export function RevealDirectLake({ t }: StepCtx) {
  const cols = ['A', 'B', 'C', 'D'];
  const loadB = easeInOut(seg(t, 0.9, 1.5));
  const loadD = easeInOut(seg(t, 2.2, 2.8));
  const fb = easeOut(seg(t, 3.3, 3.8));
  const loaded = (i: number) => (i === 1 ? loadB >= 1 : i === 3 ? loadD >= 1 : false);
  return (
    <Svg label="Direct Lake loads Delta tables from OneLake on demand, per column, the first time it's queried." h={230}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={22} s={12} f={C.secondary}>
          OneLake: Delta columns
        </T>
        {cols.map((c, i) => (
          <g key={c}>
            <rect x={25 + i * 44} y={34} width={36} height={110} rx={2} fill={C.band} stroke={C.line} strokeWidth={1.1} />
            <T x={43 + i * 44} y={162} s={12} f={C.secondary} a="middle">
              {c}
            </T>
          </g>
        ))}
        <T x={345} y={22} s={12} f={C.secondary}>
          the model, in memory
        </T>
        {cols.map((c, i) => (
          <rect
            key={c}
            x={345 + i * 56}
            y={34}
            width={46}
            height={110}
            rx={2}
            fill={loaded(i) ? C.second : 'none'}
            opacity={loaded(i) ? 0.55 : 1}
            stroke={C.line}
            strokeWidth={1.1}
            strokeDasharray={loaded(i) ? undefined : '4 3'}
          />
        ))}
      </g>
      {loadB > 0 && loadB < 1 && <rect x={lerp(69, 401, loadB)} y={34} width={36} height={110} rx={2} fill={C.second} opacity={0.7} />}
      {loadD > 0 && loadD < 1 && <rect x={lerp(157, 513, loadD)} y={34} width={36} height={110} rx={2} fill={C.second} opacity={0.7} />}
      <T x={575} y={186} s={12} f={C.focus} a="end" o={easeOut(seg(t, 1.4, 1.7)) * (1 - easeOut(seg(t, 2.0, 2.2)))}>
        first ask of B: load it
      </T>
      <Click x={424} y={90} a={t - 1.85} />
      <T x={575} y={186} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.2, 2.4))}>
        next ask: already in memory
      </T>
      <g opacity={fb}>
        <path d={`M300 204 H${lerp(300, 140, fb)}`} stroke={C.secondary} strokeWidth={1.3} strokeDasharray="4 3" />
        <T x={575} y={222} s={12} f={C.secondary} a="end">
          can't load: query the source
        </T>
      </g>
    </Svg>
  );
}

// 6 · One compiled metric at the top. Five tools below, each tagged with whichever mode it uses. One pulse leaves the
// metric for every tool: whatever the mode, each reads the same definition.
export function RevealHeadlessBI({ t }: StepCtx) {
  const tools: [string, string][] = [
    ['Looker', 'live'],
    ['Power BI', 'per-column'],
    ['Tableau', 'extract'],
    ['Superset', 'live'],
    ['Metabase', 'extract'],
  ];
  const pulse = seg(t, 1.6, 2.6);
  return (
    <Svg label="one compiled metric; any of these tools reads the same one." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Box x={200} y={20} w={200} label="one metric" lit />
      </g>
      {tools.map(([n, m], i) => {
        const x = 65 + i * 112;
        const o = easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15));
        return (
          <g key={n} opacity={o}>
            <line x1={300} y1={52} x2={x} y2={140} stroke={pulse >= 1 ? C.second : C.line} strokeWidth={1.2} />
            {pulse > 0 && pulse < 1 && <circle cx={lerp(300, x, pulse)} cy={lerp(52, 140, pulse)} r={4} fill={C.second} />}
            <circle cx={x} cy={146} r={6} fill={pulse >= 1 ? C.second : C.primary} />
            <T x={x} y={172} s={12} f={C.primary} a="middle">
              {n}
            </T>
            <T x={x} y={192} s={11} f={C.quiet} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
              {m}
            </T>
          </g>
        );
      })}
      <T x={300} y={228} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        any tool, any mode, the same definition
      </T>
    </Svg>
  );
}

// 7 · Three modes, each with its own small rhythm: extract's copies on a schedule, live's query on every click, the
// per-column load filling slots once. Under them, one metric whose lines draw up to all three; brackets lock onto it.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['extract', 'cost on a schedule'],
    ['live', 'fresh, paid per click'],
    ['per-column load', 'in between, where available'],
    ['one metric', 'what every tool reads'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  // extract: a copy rides across on each scheduled run
  const run = ((t - 0.5) / 1.2) % 1;
  // live: every click fires its own query
  const click = ((t - 1.2) / 0.45) % 1;
  return (
    <Svg label="three query modes, one load-vs-freshness trade-off each. One compiled metric, many tools." h={260}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)} transform={`translate(${((1 - k(i)) * -24).toFixed(1)} 0)`}>
          <T x={25} y={34 + i * 60} s={13} f={i === 3 ? C.focus : C.secondary}>
            {a}
          </T>
          <T x={25} y={56 + i * 60} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2].map((j) => (
          <line key={j} x1={460 + j * 40} y1={28} x2={460 + j * 40} y2={52} stroke={C.second} strokeWidth={1.2} />
        ))}
        {t > 0.5 && <rect x={lerp(450, 538, easeInOut(clamp(run * 1.6)))} y={34} width={14} height={12} rx={2} fill={C.second} />}
      </g>
      <g opacity={k(1)}>
        <line x1={445} y1={100} x2={575} y2={100} stroke={C.line} />
        {t > 1.2 && [0, 1].map((j) => <circle key={j} cx={lerp(450, 570, (click + j * 0.5) % 1)} cy={100} r={4} fill={C.badText} />)}
      </g>
      <g opacity={k(2)}>
        {[0, 1, 2, 3].map((j) => {
          const on = j === 1 || j === 3;
          const h = on ? 28 * easeOutBack(seg(t, 2.2 + j * 0.15, 2.5 + j * 0.15)) : 28;
          return <rect key={j} x={460 + j * 26} y={on ? 174 - h : 146} width={20} height={on ? Math.max(0, h) : 28} rx={2} fill={on ? C.second : 'none'} stroke={C.line} strokeDasharray={on ? undefined : '3 3'} />;
        })}
      </g>
      <g opacity={k(3)}>
        <rect x={470} y={210} width={80} height={24} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
      </g>
      {/* one compiled metric, read by every tool: a line draws up from it to each mode */}
      {[0, 1, 2].map((j) => (
        <Draw key={j} pts={[[510, 210], [470 + j * 40, 192]]} t={t} from={3.2 + j * 0.15} to={3.5 + j * 0.15} stroke={C.second} w={1.3} />
      ))}
      <Reticle x={510} y={222} w={96} h={36} t={t} at={3.85} />
    </Svg>
  );
}

// 8 · A week of two lines that should agree, Metabase and Looker, slowly pulling apart. "First check: ?". After the
// answer each line is traced back: one still to the shared metric ✓, the other to its own hand-written SQL, red.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const w = easeInOut(seg(t, 0.2, 1.6));
  const pts = (d: number) =>
    Array.from({ length: 8 }, (_, i) => {
      const x = 25 + i * 40;
      const y = 80 - i * 3 + (d * i * i) / 1.5;
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
    })
      .slice(0, Math.max(1, Math.ceil(w * 8)))
      .join(' ');
  return (
    <Svg label="a week later, Metabase and Looker disagree on the same active-users number. What's the first thing to check?" h={200}>
      <path d={pts(0)} fill="none" stroke={C.primary} strokeWidth={1.6} />
      <path d={pts(1.6)} fill="none" stroke={on && s > 1.0 ? C.badText : C.second} strokeWidth={1.6} />
      <T x={25} y={20} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        one week
      </T>
      <T x={315} y={62} s={12} f={C.primary} o={easeOut(seg(t, 1.4, 1.7))}>
        Looker
      </T>
      <T x={315} y={115} s={12} f={on && s > 1.0 ? C.badText : C.second} o={easeOut(seg(t, 1.4, 1.7))}>
        Metabase
      </T>
      <T x={575} y={186} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.8, 2.2))}>
        first check: ?
      </T>
      {on && (
        <g>
          <g opacity={easeOut(seg(s, 0.2, 0.5))}>
            <Box x={435} y={40} w={140} label="one metric" lit />
            <line x1={390} y1={58} x2={435} y2={56} stroke={C.second} strokeWidth={1.3} />
          </g>
          <Tick x={412} y={84} k={easeOut(seg(s, 0.5, 0.8))} />
          <g opacity={easeOut(seg(s, 0.9, 1.2))}>
            <Box x={435} y={98} w={140} label="its own SQL" stroke={C.badText} f={C.badText} />
            <line x1={412} y1={111} x2={435} y2={114} stroke={C.badText} strokeWidth={1.3} strokeDasharray="4 3" />
          </g>
          <T x={25} y={186} s={12} f={C.secondary} o={easeOut(seg(s, 1.5, 1.9))}>
            still reading the one definition?
          </T>
        </g>
      )}
    </Svg>
  );
}
