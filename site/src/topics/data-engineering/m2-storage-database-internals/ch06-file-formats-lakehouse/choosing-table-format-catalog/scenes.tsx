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

type W = 'full' | 'none' | 'append-only' | 'catalog-dependent' | 'config-dependent';
/** The sourced support matrix from examples.py: engine, Iceberg write, Delta write (every engine reads both). */
const MATRIX: [string, W, W][] = [
  ['Spark', 'full', 'full'],
  ['Flink', 'full', 'full'],
  ['Trino', 'full', 'config-dependent'],
  ['DuckDB', 'catalog-dependent', 'append-only'],
  ['Snowflake', 'full', 'none'],
  ['BigQuery', 'full', 'none'],
  ['Redshift', 'full', 'none'],
];

/** One write-support mark at (x, y): a filled dot for full, a ring for a conditional write, a small cross for none (read only). */
function Mark({ x, y, w, k = 1 }: { x: number; y: number; w: W; k?: number }) {
  if (w === 'none') return <Cross x={x} y={y} k={k} />;
  if (w === 'full') return <circle cx={x} cy={y} r={6} fill={C.focus} opacity={k} />;
  return <circle cx={x} cy={y} r={6} fill="none" stroke={C.second} strokeWidth={2} opacity={k} />;
}

/** The matrix itself: engine names down the left, Iceberg and Delta columns, rows drawn in from `t0`, one every `dt`. */
function Matrix({ t, t0, dt = 0.25, y0 = 50, hi = [] as string[], dim = 1 }: { t: number; t0: number; dt?: number; y0?: number; hi?: string[]; dim?: number }) {
  return (
    <g>
      <T x={190} y={y0 - 26} s={12} f={C.latte} a="middle" o={easeOut(seg(t, t0 - 0.3, t0))}>
        Iceberg
      </T>
      <T x={270} y={y0 - 26} s={12} f={C.latte} a="middle" o={easeOut(seg(t, t0 - 0.3, t0))}>
        Delta
      </T>
      {MATRIX.map(([e, i, d], r) => {
        const k = easeOut(seg(t, t0 + r * dt, t0 + 0.3 + r * dt));
        const on = hi.length === 0 || hi.includes(e);
        return (
          <g key={e} opacity={on ? 1 : dim}>
            <T x={25} y={y0 + r * 26 + 4} s={12} f={hi.includes(e) ? C.crema : C.latte} o={k}>
              {e}
            </T>
            <Mark x={190} y={y0 + r * 26} w={i} k={k} />
            <Mark x={270} y={y0 + r * 26} w={d} k={k} />
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. The section's pieces as a row of pips gather into one question box; two format cards hang under it.
export function Hook({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.8, 1.8));
  return (
    <Svg label="every mechanism this section needed now exists. this topic closes it: which format do you actually pick?" h={200}>
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={lerp(40 + i * 66, 300, g)} cy={lerp(30, 60, g)} r={5} fill={C.mocha} opacity={easeOut(seg(t, 0.1 + i * 0.06, 0.3 + i * 0.06)) * (1 - seg(t, 1.6, 1.9))} />
      ))}
      <Cell x={190} y={45} w={220} h={32} label="which format?" stroke={C.second} o={easeOut(seg(t, 1.7, 2.1))} />
      <Cell x={150} y={130} w={120} h={30} label="Iceberg" o={easeOut(seg(t, 2.4, 2.8))} />
      <Cell x={330} y={130} w={120} h={30} label="Delta" o={easeOut(seg(t, 2.6, 3.0))} />
      <T x={300} y={190} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        decided from evidence
      </T>
    </Svg>
  );
}

// 2 · Predict. Seven engine pips fall toward two format bins, each with a "?" count.
export function PredictMoreWriters({ t, answer }: StepCtx) {
  return (
    <Svg label="more engines can write one of these two formats today than the other. which one?" h={200}>
      {MATRIX.map(([e], i) => (
        <circle key={e} cx={130 + i * 52} cy={25} r={6} fill={C.latte} opacity={easeOut(seg(t, 0.1 + i * 0.12, 0.3 + i * 0.12))} />
      ))}
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        engines
      </T>
      <Cell x={130} y={60} w={140} h={30} label="Iceberg: ?" o={easeOut(seg(t, 1.2, 1.6))} />
      <Cell x={330} y={60} w={140} h={30} label="Delta: ?" o={easeOut(seg(t, 1.4, 1.8))} />
      <AnswerRow y={140} label="more writers" answer={answer} value="Iceberg" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={184} text="open from day one, not bound to one engine" />
    </Svg>
  );
}

// 3 · The matrix, row by row; the write counts tally on the right: Iceberg 7, Delta 4.
export function RevealMatrix({ t }: StepCtx) {
  const ic = MATRIX.filter((m) => m[1] !== 'none').length;
  const shown = Math.min(MATRIX.length, Math.max(0, Math.floor((t - 0.4) / 0.3) + 1));
  const icN = MATRIX.slice(0, shown).filter((m) => m[1] !== 'none').length;
  const dcN = MATRIX.slice(0, shown).filter((m) => m[2] !== 'none').length;
  return (
    <Svg label="a real matrix, built from each engine's own current docs. most write iceberg; several only read delta." h={230}>
      <Matrix t={t} t0={0.4} dt={0.3} y0={50} />
      <Row y={90} label="" value={`Iceberg writers: ${t > 0.4 ? icN : 0}`} valueColor={icN === ic ? C.focus : C.crema} k={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={140} label="" value={`Delta writers: ${t > 0.4 ? dcN : 0}`} k={easeOut(seg(t, 0.4, 0.7))} />
      <T x={575} y={190} s={11} f={C.latte} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        ✕ read only · ○ narrower
      </T>
    </Svg>
  );
}

// 4 · Cloud writes. Snowflake and BigQuery rows lift; their Iceberg dots pulse; "read-only external table" is struck through.
export function RevealCloudWritesReal({ t }: StepCtx) {
  const st = easeOut(seg(t, 2.6, 3.2));
  const p = 6 + 3 * Math.sin(seg(t, 1.0, 2.4) * Math.PI);
  return (
    <Svg label="snowflake and bigquery both genuinely write iceberg today, for real. not a read-only external table." h={230}>
      <Matrix t={t + 3} t0={0.4} dt={0} y0={50} hi={['Snowflake', 'BigQuery']} dim={0.35} />
      <circle cx={190} cy={154} r={p} fill="none" stroke={C.focus} strokeWidth={2} opacity={seg(t, 1.0, 1.3)} />
      <circle cx={190} cy={180} r={p} fill="none" stroke={C.focus} strokeWidth={2} opacity={seg(t, 1.0, 1.3)} />
      <T x={420} y={100} s={12} f={C.focus} o={easeOut(seg(t, 1.4, 1.8))}>
        real DML writes
      </T>
      <T x={420} y={150} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>
        read-only table
      </T>
      <line x1={418} y1={146} x2={418 + 110 * st} y2={146} stroke={C.cherryText} strokeWidth={2} />
    </Svg>
  );
}

// 5 · Predict. Three writer engines and an upsert-heavy tag point at this chapter's table; can Delta survive?
export function PredictWorkloadSurvives({ t, answer }: StepCtx) {
  const w = ['Snowflake', 'BigQuery', 'DuckDB'];
  return (
    <Svg label="this chapter's own table needs snowflake, bigquery, and duckdb to all write it, upsert-heavy. does delta survive?" h={230}>
      {w.map((e, i) => (
        <g key={e}>
          <Cell x={25} y={20 + i * 40} w={120} h={28} label={e} o={easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25))} />
          <line x1={147} y1={34 + i * 40} x2={lerp(147, 328, easeInOut(seg(t, 1.0, 1.6)))} y2={lerp(34 + i * 40, 74, easeInOut(seg(t, 1.0, 1.6)))} stroke={C.mocha} strokeWidth={1.4} />
        </g>
      ))}
      <Cell x={330} y={58} w={180} h={32} label="analytics.events" stroke={C.focus} o={easeOut(seg(t, 1.4, 1.8))} />
      <T x={330} y={116} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
        upsert-heavy
      </T>
      <AnswerRow y={170} label="Delta, here" answer={answer} value="ruled out" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={212} text="two can't write it; one only appends" />
    </Svg>
  );
}

// 6 · Delta blocked. Each writer engine's line into the Delta column ends in a cross (DuckDB's: append-only, no upsert); Iceberg ticks all three.
export function RevealDeltaBlocked({ t }: StepCtx) {
  const w: [string, string][] = [
    ['Snowflake', 'no write'],
    ['BigQuery', 'no write'],
    ['DuckDB', 'append only'],
  ];
  return (
    <Svg label="no. all three writer engines block delta here, for real -- the framework rules it out mechanically." h={230}>
      <T x={300} y={24} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        Iceberg
      </T>
      <T x={440} y={24} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        Delta
      </T>
      {w.map(([e, why], i) => {
        const y = 60 + i * 50;
        const k = easeOut(seg(t, 0.6 + i * 0.7, 1.0 + i * 0.7));
        return (
          <g key={e}>
            <T x={25} y={y + 4} s={13} f={C.crema} o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))}>
              {e}
            </T>
            <MiniTick x={294} y={y} k={easeOut(seg(t, 3.0, 3.4))} />
            <Cross x={440} y={y} k={k} />
            <T x={460} y={y + 4} s={11} f={C.cherryText} o={k}>
              {why}
            </T>
          </g>
        );
      })}
      <T x={25} y={215} s={12} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        candidates left: iceberg
      </T>
    </Svg>
  );
}

// 7 · DuckDB's two paths. Upper: through a catalog gate, then full writes. Lower: no gate, but update and merge are crossed out.
export function RevealDuckdbNuance({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.6));
  const b = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="duckdb's two write paths run opposite directions: iceberg needs a catalog, delta needs none but stays append-only." h={230}>
      <Cell x={25} y={90} w={110} h={32} label="DuckDB" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <path d={`M137 100 L${lerp(137, 230, a)} ${lerp(100, 45, a)}`} stroke={C.focus} strokeWidth={1.6} fill="none" />
      <Cell x={232} y={30} w={110} h={30} label="catalog" stroke={C.second} o={easeOut(seg(t, 1.2, 1.5))} />
      <Req x1={344} x2={420} y={45} k={easeOut(seg(t, 1.6, 2.0))} f={C.focus} />
      <T x={425} y={50} s={12} f={C.focus} o={easeOut(seg(t, 1.9, 2.2))}>
        Iceberg: full
      </T>
      <path d={`M137 112 L${lerp(137, 230, b)} ${lerp(112, 170, b)}`} stroke={C.latte} strokeWidth={1.6} fill="none" />
      <T x={232} y={176} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        no catalog · Delta: append
      </T>
      {['update', 'merge', 'replace'].map((w, i) => (
        <g key={w} opacity={easeOut(seg(t, 3.3 + i * 0.25, 3.6 + i * 0.25))}>
          <T x={232 + i * 100} y={212} s={11} f={C.latte}>
            {w}
          </T>
          <line x1={230 + i * 100} y1={208} x2={232 + i * 100 + w.length * 8} y2={208} stroke={C.cherryText} strokeWidth={2} />
        </g>
      ))}
    </Svg>
  );
}

// 8 · June 2024. A month strip of days; three markers drop onto the 3rd (Polaris), 4th (Tabular) and 12th (Unity Catalog).
export function RevealJuneTimeline({ t }: StepCtx) {
  const ev: [number, string, string, number][] = [
    [4, 'Databricks + Tabular', C.focus, 0],
    [12, 'Unity Catalog, open source', C.second, 1],
    [3, 'Snowflake Polaris Catalog', C.second, 2],
  ];
  const dx = (d: number) => 40 + (d - 1) * 17.5;
  return (
    <Svg label="three real announcements, the same month: tabular, unity catalog, polaris -- all june." h={250}>
      <T x={25} y={28} s={13} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        June 2024
      </T>
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={dx(i + 1) - 6} y={50} width={12} height={12} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1} opacity={easeOut(seg(t, 0.2 + i * 0.015, 0.5 + i * 0.015))} />
      ))}
      {ev.map(([d, l, f, i]) => {
        const k = easeOut(seg(t, 0.9 + i * 1.0, 1.3 + i * 1.0));
        const y = 110 + i * 46;
        return (
          <g key={l} opacity={k}>
            <rect x={dx(d) - 6} y={50} width={12} height={12} rx={2} fill={f} />
            <line x1={dx(d)} y1={64} x2={dx(d)} y2={lerp(64, y - 14, k)} stroke={f} strokeWidth={1.4} />
            <T x={dx(d) + 10} y={y} s={12} f={C.crema}>
              {l}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Convergence. The three events and the matrix each send a line into one box: Iceberg REST.
export function RevealConvergence({ t }: StepCtx) {
  const c = easeInOut(seg(t, 1.2, 2.4));
  const src = ['Tabular', 'Unity Catalog', 'Polaris', 'the matrix'];
  return (
    <Svg label="the market's convergence on iceberg rest isn't a trend line -- it's three named decisions, one month, plus this matrix." h={230}>
      {src.map((s, i) => (
        <g key={s}>
          <Cell x={25} y={20 + i * 48} w={150} h={28} label={s} stroke={i === 3 ? C.focus : C.mocha} o={easeOut(seg(t, 0.1 + i * 0.25, 0.4 + i * 0.25))} />
          <line x1={177} y1={34 + i * 48} x2={lerp(177, 358, c)} y2={lerp(34 + i * 48, 106, c)} stroke={i === 3 ? C.focus : C.mocha} strokeWidth={1.5} />
        </g>
      ))}
      <Cell x={360} y={88} w={180} h={36} label="Iceberg REST" stroke={C.focus} o={easeOut(seg(t, 2.2, 2.6))} />
      <T x={360} y={160} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        decisions, not a trend line
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real matrix, a real framework, applied to this chapter's own table: iceberg, over a rest catalog. next: trino." h={250}>
      <Row y={40} label="the matrix" value="from engines' own docs" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="the framework" value="rules Delta out here" k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="this table" value="Iceberg, over REST" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
