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
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own: daily_revenue_job reading orders and writing analytics.daily_revenue, the START and
// COMPLETE events sharing one runId, the schema facet's revenue DOUBLE, and region_norm's lineage: region alone from the SQL
// text, region and locale_config from the plan, {table_prefix}_orders unresolved against us_orders resolved.

// 0 · Hook. orders feeds two unknown transforms into daily_revenue, whose revenue column is red. The catalog only says
// "derived from orders". Below, the real question: does the SQL text equal the engine's plan?
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a column in daily_revenue is wrong. Which inputs, which transforms, produced it?" h={250}>
      <Cell x={25} y={60} w={110} label="orders" o={k(0.6)} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Req x1={135 + i * 120} x2={165 + i * 120} y={74} k={k(1.0 + i * 0.3)} />
          <Hole x={165 + i * 120} y={60} w={90} o={k(1.1 + i * 0.3)} />
          {t > 1.3 + i * 0.3 && (
            <T x={210 + i * 120} y={79} s={13} f={C.taupe} a="middle" o={k(1.3 + i * 0.3)}>
              ?
            </T>
          )}
        </g>
      ))}
      <Req x1={375} x2={405} y={74} k={k(1.6)} />
      <Cell x={405} y={60} w={170} label="revenue" o={k(0)} stroke={C.cherryText} />
      {t > 0.9 && (
        <T x={25} y={124} s={11} f={C.taupe} o={k(0.9)}>
          catalog: derived from orders
        </T>
      )}
      <Cell x={25} y={170} w={150} label="the SQL text" o={k(2.8)} />
      {t > 3.2 && (
        <T x={210} y={189} s={15} f={C.cherryText} a="middle" o={k(3.2)}>
          = ?
        </T>
      )}
      <Cell x={245} y={170} w={185} label="what the engine ran" o={k(3.0)} />
    </Svg>
  );
}

// 1 · The object model. A job, the defined work. Runs fan out of it, one per occurrence. The middle run then reaches its two
// datasets: orders in, analytics.daily_revenue out.
export function RevealObjectModel({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="OpenLineage's own model: a Job, a Run, a Dataset" h={250}>
      <Cell x={25} y={36} w={180} label="daily_revenue_job" o={k(0.3)} stroke={C.second} />
      {t > 0.6 && (
        <T x={220} y={55} s={11} f={C.second} o={k(0.6)}>
          job: the work
        </T>
      )}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={70} y1={64} x2={60 + i * 90} y2={110} k={k(1.2 + i * 0.2)} f={C.latte} />
          <Cell x={25 + i * 90} y={112} w={76} label="run" o={k(1.3 + i * 0.2)} stroke={i === 1 && t > 2.4 ? C.focus : C.mocha} />
        </g>
      ))}
      {t > 2.0 && (
        <T x={25} y={170} s={11} f={C.focus} o={k(2.0)}>
          run: one occurrence
        </T>
      )}
      <Fan x1={153} y1={126} x2={338} y2={104} k={k(2.8)} f={C.focus} />
      <Fan x1={153} y1={126} x2={338} y2={184} k={k(3.1)} f={C.focus} />
      <Cell x={340} y={90} w={120} label="orders" o={k(2.8)} />
      <Cell x={340} y={170} w={235} label="analytics.daily_revenue" o={k(3.1)} />
      {t > 3.6 && (
        <T x={340} y={234} s={11} f={C.taupe} o={k(3.6)}>
          datasets: what it touched
        </T>
      )}
    </Svg>
  );
}

/** An event card: a header and labelled rows; a row whose value is null shows an empty dashed slot. */
function Event({ x, y, title, rows, o = 1, stroke = C.mocha }: { x: number; y: number; title: string; rows: [string, string | null, number][]; o?: number; stroke?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={250} height={34 + rows.length * 30} rx={5} fill={C.cocoa} stroke={stroke} strokeWidth={1.4} />
      <T x={x + 12} y={y + 22} s={12} f={C.crema}>
        {title}
      </T>
      {rows.map(([l, v, vo], i) => (
        <g key={l}>
          <T x={x + 12} y={y + 52 + i * 30} s={11} f={C.taupe}>
            {l}
          </T>
          {v === null ? (
            <rect x={x + 80} y={y + 40 + i * 30} width={150} height={16} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 3" />
          ) : (
            <T x={x + 80} y={y + 52 + i * 30} s={11} f={C.second} o={vo}>
              {v}
            </T>
          )}
        </g>
      ))}
    </g>
  );
}

// 2 · Predict: START and COMPLETE. Two event cards for one run, both with an open outputs slot. Once answered, START's slot
// stays empty and COMPLETE's fills with the dataset it wrote.
export function PredictStartComplete({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.3, 0.8)) : 0;
  return (
    <Svg label="START, then later COMPLETE. Does COMPLETE already know the output at START?" h={250}>
      <Event
        x={25}
        y={36}
        title="START"
        rows={[
          ['inputs', 'orders', 1],
          ['outputs', null, 0],
        ]}
        o={k(0)}
      />
      <Event
        x={325}
        y={36}
        title="COMPLETE"
        rows={[
          ['inputs', 'orders', 1],
          ['outputs', a > 0 ? 'daily_revenue' : null, a],
        ]}
        o={k(0.6)}
        stroke={a > 0.5 ? C.focus : C.mocha}
      />
      {a > 0.5 && <Cross x={250} y={133} k={a} />}
      {answer === null && t > 1.0 && (
        <T x={300} y={180} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="only at COMPLETE: the output did not exist yet" y={214} />
    </Svg>
  );
}

// 3 · Additive events. START lands with an empty outputs slot. COMPLETE arrives later, a dashed line tying the two runIds;
// its outputs slot fills with analytics.daily_revenue and a schema facet chip, revenue DOUBLE, attaches.
export function RevealAdditiveEvents({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const fill = k(2.4);
  return (
    <Svg label="measured: no -- START has no output; COMPLETE adds it later, same run id" h={250}>
      <Event
        x={25}
        y={30}
        title="START"
        rows={[
          ['runId', 'same', 1],
          ['outputs', null, 0],
        ]}
        o={k(0.3)}
      />
      <MiniTick x={240} y={98} k={k(1.0)} f={C.taupe} />
      <Event
        x={325}
        y={30}
        title="COMPLETE"
        rows={[
          ['runId', 'same', 1],
          ['outputs', fill > 0 ? 'daily_revenue' : null, fill],
        ]}
        o={k(1.6)}
        stroke={C.focus}
      />
      <path d={`M140 77 C 200 ${lerp(77, 30, k(2.0))}, 380 ${lerp(77, 30, k(2.0))}, 440 77`} fill="none" stroke={C.second} strokeWidth={1.3} strokeDasharray="4 3" opacity={k(2.0)} />
      <Cell x={325 + 80} y={lerp(200, 150, easeOutBack(seg(t, 3.2, 3.8)))} w={170} label="revenue DOUBLE" o={k(3.2)} stroke={C.second} />
      {t > 3.8 && (
        <T x={25} y={210} s={11} f={C.taupe} o={k(3.8)}>
          nothing about the output before this moment
        </T>
      )}
    </Svg>
  );
}

const FACETS = ['schema', 'column lineage', 'data quality', 'SQL'];

// 4 · Facets. Four optional chips attach to one event, one by one. The event travels to a reader that knows three of them,
// ticked; an unknown fifth chip is simply skipped, and the reader still ticks: not broken.
export function ElaborateFacets({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="facets: optional, versioned attachments -- schema, column lineage, quality, SQL" h={250}>
      <rect x={25} y={90} width={150} height={60} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={k(0)} />
      <T x={40} y={125} s={12} f={C.crema} o={k(0)}>
        run event
      </T>
      {FACETS.map((n, i) => {
        const y = 30 + i * 52;
        return (
          <g key={n}>
            <Fan x1={175} y1={120} x2={218} y2={y + 14} k={k(0.6 + i * 0.4)} f={C.second} />
            <Cell x={220} y={y} w={150} label={n} o={k(0.7 + i * 0.4)} stroke={C.second} />
            {i < 3 && <MiniTick x={384} y={y + 10} k={k(3.4 + i * 0.15)} />}
          </g>
        );
      })}
      <Cell x={220} y={214} w={150} h={26} label="unknown" o={k(2.6) * (1 - 0.5 * k(3.4))} f={C.taupe} />
      <T x={385} y={232} s={11} f={C.taupe} o={k(3.4)}>
        skipped
      </T>
      <Cell x={440} y={106} w={135} label="reader" o={k(3.0)} stroke={t > 4.0 ? C.focus : C.mocha} />
      <MiniTick x={500} y={152} k={k(4.0)} />
    </Svg>
  );
}

const SQL = ['SELECT normalize_region(region) AS region_norm,', '  CASE WHEN country = ... END AS revenue', 'FROM {table_prefix}_orders'];

// 5 · Predict: SQL text versus the plan. The query's three lines type in. Once answered, the text parse's finding (region, and an
// unresolved name) and the plan's (region plus locale_config, and us_orders) drop in under it.
export function PredictSqlVsPlan({ t, answer }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  return (
    <Svg label="a CASE, a UDF, a dynamic table name. Does SQL text find the same lineage as the plan?" h={250}>
      {SQL.map((l, i) => (
        <T key={i} x={25} y={36 + i * 22} s={11} f={C.crema} o={k(i * 0.25)}>
          {l}
        </T>
      ))}
      <AnswerRow y={130} label="text parse" answer={answer} value="region; unresolved" k={k(0.8)} f={C.cherryText} />
      <AnswerRow y={170} label="the plan" answer={answer} value="+ locale_config; us_orders" k={k(1.0)} />
      <Verdict answer={answer} text="not the same: the plan sees more" y={222} />
    </Svg>
  );
}

// 6 · Measured. Left, the text parse: region feeds region_norm, a dashed empty slot where a second input should be, and the
// table stuck as a red placeholder. Right, the plan: region and locale_config both feed region_norm, and the table is us_orders.
export function RevealSqlMissesEdges({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="measured: no -- text parse misses the UDF's hidden input and the dynamic table" h={250}>
      <T x={25} y={28} s={11} f={C.taupe} o={k(0)}>
        SQL text parse
      </T>
      <T x={325} y={28} s={11} f={C.taupe} o={k(2.4)}>
        the runtime plan
      </T>
      <Cell x={25} y={40} w={120} label="region" o={k(0.3)} />
      <Hole x={155} y={40} w={120} o={k(0.6)} stroke={C.cherryText} />
      <Fan x1={85} y1={68} x2={145} y2={120} k={k(0.8)} f={C.latte} />
      <Cell x={85} y={122} w={130} label="region_norm" o={k(0.9)} />
      <Cell x={25} y={190} w={250} label="{table_prefix}_orders" o={k(1.4)} stroke={C.cherryText} />
      <Cell x={325} y={40} w={110} label="region" o={k(2.6)} />
      <Cell x={445} y={40} w={130} label="locale_config" o={k(2.9)} stroke={C.focus} />
      <Fan x1={380} y1={68} x2={445} y2={120} k={k(3.0)} f={C.latte} />
      <Fan x1={510} y1={68} x2={455} y2={120} k={k(3.2)} f={C.focus} />
      <Cell x={385} y={122} w={130} label="region_norm" o={k(3.0)} />
      <Cell x={325} y={190} w={250} label="us_orders" o={k(3.6)} stroke={C.focus} />
      <MiniTick x={445} y={235} k={k(4.0)} />
    </Svg>
  );
}

const ENGINES = ['Spark', 'Flink', 'dbt'];

// 7 · Integrations. The separate Airflow package slides into Airflow itself and is gone as a separate box. Then Spark, Flink
// and dbt each send a pip from their own internals to the same event card.
export function ElaborateIntegrations({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mv = easeInOut(seg(t, 0.8, 1.8));
  return (
    <Svg label="Airflow's integration is now built in; Spark, Flink, dbt each emit the same shape" h={250}>
      <rect x={230} y={30} width={170} height={52} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={k(0)} />
      <T x={244} y={50} s={12} f={C.crema} o={k(0)}>
        Airflow
      </T>
      <Cell
        x={lerp(25, 244, mv)}
        y={lerp(40, 54, mv)}
        w={lerp(170, 142, mv)}
        h={lerp(28, 22, mv)}
        label={mv > 0.6 ? 'built in' : 'separate package'}
        o={k(0.2)}
        stroke={mv > 0.9 ? C.focus : C.mocha}
      />
      {ENGINES.map((n, i) => {
        const y = 110 + i * 46;
        const p = clamp((t - 2.4 - i * 0.5) / 0.8);
        return (
          <g key={n}>
            <Cell x={25} y={y} w={120} label={n} o={k(2.2 + i * 0.3)} />
            <line x1={145} y1={y + 14} x2={418} y2={150} stroke={C.mocha} strokeWidth={1} opacity={k(2.2 + i * 0.3)} />
            {p > 0 && p < 1 && <Pip x={lerp(150, 412, p)} y={lerp(y + 14, 150, p)} f={C.second} s={8} />}
          </g>
        );
      })}
      <Cell x={420} y={136} w={155} label="the same event" o={k(2.6)} stroke={t > 3.2 ? C.second : C.mocha} />
    </Svg>
  );
}

const CONSUMERS = ['Marquez', 'DataHub', 'cloud catalogs'];

// 8 · Marquez and the other readers. A stream of event pips leaves the emitter and splits three ways: into Marquez, the
// reference server, and into DataHub and the cloud catalogs, all reading the same events.
export function RevealMarquezConsumers({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="Marquez: the reference implementation, open-sourced by WeWork" h={250}>
      <Cell x={25} y={106} w={120} label="events" o={k(0)} />
      {CONSUMERS.map((n, i) => {
        const y = 36 + i * 70;
        const on = t > 0.8 + (i === 0 ? 0 : 2.0 + i * 0.4);
        return (
          <g key={n}>
            <line x1={145} y1={120} x2={330} y2={y + 14} stroke={C.mocha} strokeWidth={1.2} opacity={on ? 1 : 0} />
            {on &&
              [0, 1].map((j) => {
                const p = ((((t - 0.8) * 0.8 + j * 0.5) % 1) + 1) % 1;
                return <Pip key={j} x={lerp(150, 324, p)} y={lerp(120, y + 14, p)} f={C.second} s={7} />;
              })}
            <Cell x={330} y={y} w={160} label={n} o={k(i === 0 ? 0.6 : 2.6 + i * 0.4)} stroke={i === 0 ? C.focus : C.mocha} />
          </g>
        );
      })}
      {t > 1.4 && (
        <T x={500} y={55} s={11} f={C.focus} o={k(1.4)}>
          reference
        </T>
      )}
      {t > 1.8 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(1.8)}>
          Marquez: open-sourced by WeWork
        </T>
      )}
    </Svg>
  );
}

// 9 · The gaps. Inside the dashed instrumented boundary a small graph lights up. A path decided at runtime and never emitted
// draws as a red ghost; a one-off export runs out of the boundary to a manual copy the graph never sees.
export function ElaborateStaticLineageGaps({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="static lineage misses: anything decided at runtime, anything that leaves the system" h={250}>
      <rect x={25} y={30} width={360} height={180} rx={6} fill="none" stroke={C.latte} strokeWidth={1.3} strokeDasharray="6 4" opacity={k(0)} />
      <T x={39} y={50} s={11} f={C.taupe} o={k(0)}>
        what got instrumented
      </T>
      <Cell x={45} y={70} w={100} label="source" o={k(0.4)} />
      <Cell x={265} y={70} w={100} label="table" o={k(0.6)} />
      <Req x1={145} x2={265} y={84} k={k(0.8)} />
      <Cell x={45} y={160} w={100} label="lookup" o={k(1.4)} />
      <path d="M145 174 C 220 174, 260 140, 300 100" fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="3 4" opacity={k(1.8)} />
      {t > 2.0 && (
        <T x={180} y={200} s={11} f={C.cherryText} o={k(2.0)}>
          decided at runtime
        </T>
      )}
      <path d={`M365 84 C 400 84, 410 140, ${lerp(365, 428, k(3.0))} 150`} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="3 4" opacity={k(2.8)} />
      <Cell x={430} y={136} w={145} label="a manual copy" o={k(3.2)} stroke={C.cherryText} />
      {t > 3.6 && (
        <T x={430} y={190} s={11} f={C.cherryText} o={k(3.6)}>
          never in the graph
        </T>
      )}
    </Svg>
  );
}

const RECAP = ['a job, a run, a dataset', 'events that add up over time', 'facets: optional, safely skipped', 'the plan knows more than the text'];

// 10 · Recap. The four lines land in order, each ticked.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="Job/Run/Dataset events, additive; facets attach meaning; SQL parse misses what a plan sees" h={250}>
      {RECAP.map((n, i) => (
        <g key={n}>
          <MiniTick x={25} y={44 + i * 46} k={k(0.6 + i * 1.0)} />
          <T x={50} y={50 + i * 46} s={12} f={C.crema} o={k(0.5 + i * 1.0)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}
