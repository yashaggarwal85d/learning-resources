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

// Every value here is examples.py's own: the eight-model graph from src_orders to rpt_customer_ltv, the change to
// stg_orders, the columns order_id, amount, total_amount and updated_at, the 2,000-row table with six planted bugs and its
// first 100 rows as the sample, and the p95 figures 72, 85 and 104 against a 90-second SLO. Build costs and counts are
// computed, so they are drawn as pips and lengths, never printed.

/** The shop's model graph: each node's x, y and width. */
const NODES: Record<string, [number, number, number]> = {
  src_orders: [25, 50, 120],
  src_customers: [25, 130, 120],
  stg_orders: [165, 50, 120],
  stg_customers: [165, 130, 120],
  fct_orders: [305, 50, 115],
  dim_customers: [305, 130, 115],
  rpt_revenue_daily: [430, 50, 145],
  rpt_customer_ltv: [430, 130, 145],
};
const EDGES: [string, string][] = [
  ['src_orders', 'stg_orders'],
  ['src_customers', 'stg_customers'],
  ['stg_orders', 'fct_orders'],
  ['stg_customers', 'fct_orders'],
  ['stg_customers', 'dim_customers'],
  ['fct_orders', 'rpt_revenue_daily'],
  ['fct_orders', 'rpt_customer_ltv'],
  ['dim_customers', 'rpt_customer_ltv'],
];
/** stg_orders and everything downstream of it: examples.py's asserted selection. */
const REACH = new Set(['stg_orders', 'fct_orders', 'rpt_revenue_daily', 'rpt_customer_ltv']);

/** A graph node: a box with its model name at s11. */
function Node({ m, o = 1, stroke = C.mocha, f = C.crema, dash = false }: { m: string; o?: number; stroke?: string; f?: string; dash?: boolean }) {
  const [x, y, w] = NODES[m];
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} strokeDasharray={dash ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + 17} s={11} f={f} a="middle">
        {m}
      </T>
    </g>
  );
}

/** The graph's edges, each drawn by `ek(edge index)` in `col(edge index)`. */
function Edges({ ek, col }: { ek: (i: number) => number; col: (i: number) => string }) {
  return (
    <g>
      {EDGES.map(([a, b], i) => {
        const [ax, ay, aw] = NODES[a];
        const [bx, by] = NODES[b];
        const k = ek(i);
        if (k <= 0) return null;
        const x1 = ax + aw;
        const y1 = ay + 13;
        return <line key={a + b} x1={x1} y1={y1} x2={lerp(x1, bx, k)} y2={lerp(y1, by + 13, k)} stroke={col(i)} strokeWidth={1.4} />;
      })}
    </g>
  );
}

/** The graph's column order, left to right, so sweeps can light it in build order. */
function colOf(m: string) {
  return [25, 165, 305, 430].indexOf(NODES[m][0]);
}

// 0 · Hook. The whole graph lights up column by column in red: a full CI run rebuilds every model. Then the colour drains and
// only stg_orders and its downstream light up again: the same change through a state-aware build.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const full = (m: string) => easeOut(seg(t, 0.4 + colOf(m) * 0.35, 0.7 + colOf(m) * 0.35));
  const drain = easeOut(seg(t, 2.3, 2.7));
  const slim = (m: string) => (REACH.has(m) ? easeOut(seg(t, 2.8 + colOf(m) * 0.25, 3.1 + colOf(m) * 0.25)) : 0);
  return (
    <Svg label="one model changed. whole project rebuilt." h={250}>
      <T x={25} y={30} s={11} f={drain > 0.5 ? C.focus : C.cherryText} o={k(0)}>
        {drain > 0.5 ? 'a state-aware build, one change' : 'a full CI run, every pull request'}
      </T>
      <Edges ek={() => k(0.1)} col={() => C.mocha} />
      {Object.keys(NODES).map((m) => {
        const r = full(m) * (1 - drain);
        const g = slim(m);
        return <Node key={m} m={m} o={k(0)} stroke={g > 0.5 ? C.focus : r > 0.5 ? C.cherryText : C.mocha} f={drain > 0.5 && !REACH.has(m) ? C.taupe : C.crema} />;
      })}
      {t > 2.0 && t < 2.5 && (
        <T x={25} y={200} s={11} f={C.cherryText} o={k(2.0) * (1 - drain)}>
          most of it untouched, rebuilt anyway
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={200} s={12} f={C.crema} o={k(3.9)}>
          only the change and what sits downstream
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. stg_orders is marked changed and a full rebuild is labelled safe. Is everything the only safe set? Once
// answered, the reachable set rings in focus and everything else dims.
export function PredictSafetyRequiresEverything({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="is a full rebuild the only safe option?" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        a full rebuild: certainly safe
      </T>
      <Edges ek={() => k(0.1)} col={(i) => (v > 0.5 && REACH.has(EDGES[i][0]) && REACH.has(EDGES[i][1]) ? C.focus : C.mocha)} />
      {Object.keys(NODES).map((m) => (
        <Node key={m} m={m} o={k(0) * (v > 0 && !REACH.has(m) ? 1 - 0.6 * v : 1)} stroke={m === 'stg_orders' ? C.cherryText : v > 0.5 && REACH.has(m) ? C.focus : C.mocha} />
      ))}
      <T x={225} y={98} s={11} f={C.cherryText} a="middle" o={k(0.6)}>
        changed
      </T>
      {answer === null && t > 1.2 && (
        <T x={300} y={200} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="changed + downstream is just as safe" y={222} />
    </Svg>
  );
}

// 2 · state:modified plus defer. A comparison line sweeps the graph against the stored manifest and flags stg_orders; the
// selection spreads down its edges; everything else turns to a dashed outline, deferred to production.
export function RevealStateModifiedDefer({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sweep = easeInOut(seg(t, 0.3, 1.4));
  const sx = lerp(20, 580, sweep);
  const sel = (m: string) => (m === 'stg_orders' ? k(1.0) : REACH.has(m) ? k(1.6 + (colOf(m) - 1) * 0.4) : 0);
  const def = k(3.0);
  return (
    <Svg label="changed, plus downstream. rest deferred." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        compared with the stored manifest
      </T>
      {sweep > 0 && sweep < 1 && <line x1={sx} y1={42} x2={sx} y2={166} stroke={C.second} strokeWidth={1.5} />}
      <Edges ek={() => k(0.1)} col={(i) => (REACH.has(EDGES[i][0]) && REACH.has(EDGES[i][1]) && sel(EDGES[i][1]) > 0.5 ? C.focus : C.mocha)} />
      {Object.keys(NODES).map((m) => {
        const on = sel(m) > 0.5;
        const deferred = !REACH.has(m) && def > 0.5;
        return (
          <Node
            key={m}
            m={m}
            o={k(0) * (deferred ? 0.6 : 1)}
            stroke={m === 'stg_orders' && on ? C.cherryText : on ? C.focus : deferred ? C.taupe : C.mocha}
            f={deferred ? C.taupe : C.crema}
            dash={deferred}
          />
        );
      })}
      {t > 1.0 && (
        <T x={225} y={98} s={11} f={C.cherryText} a="middle" o={k(1.0)}>
          state:modified
        </T>
      )}
      {t > 1.6 && (
        <T x={502} y={180} s={11} f={C.focus} a="middle" o={k(2.6)}>
          + downstream
        </T>
      )}
      {t > 3.0 && (
        <T x={25} y={210} s={11} f={C.taupe} o={k(3.0)}>
          defer: the rest resolves to production
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={234} s={12} f={C.crema} o={k(3.8)}>
          built once already, not rebuilt
        </T>
      )}
    </Svg>
  );
}

// 3 · A virtual environment. The plan rings the four affected models in dev as a dashed preview and ticks them verified.
// Production points at its old tables; the pointers fade and redraw onto dev's, a pointer swap with nothing recomputed.
export function RevealVirtualEnvironment({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ms = ['stg_orders', 'fct_orders', 'rpt_revenue_daily', 'rpt_customer_ltv'];
  const ys = [50, 86, 122, 158];
  const swap = easeInOut(seg(t, 2.2, 2.6));
  const draw = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="already built. point production at it." h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        dev: built and tested
      </T>
      <T x={575} y={34} s={11} f={C.taupe} a="end" o={k(0)}>
        production: old tables
      </T>
      {ms.map((m, i) => (
        <g key={m}>
          <Cell x={25} y={ys[i]} w={165} label={m} o={k(0.1 + i * 0.08)} stroke={draw > 0.5 ? C.focus : C.mocha} />
          <Cell x={410} y={ys[i]} w={165} label={m} o={k(0.1 + i * 0.08) * (1 - 0.6 * swap)} f={swap > 0.5 ? C.taupe : C.crema} />
          <Fan x1={330} y1={118} x2={410} y2={ys[i] + 14} k={k(0.6) * (1 - swap)} f={C.latte} />
          <Fan x1={270} y1={118} x2={190} y2={ys[i] + 14} k={draw} f={C.focus} />
        </g>
      ))}
      <Hole x={18} y={44} w={179} h={148} o={k(0.9) * (1 - draw)} stroke={C.second} />
      {t > 0.9 && t < 2.6 && (
        <T x={25} y={210} s={11} f={C.second} o={k(0.9) * (1 - draw)}>
          the plan: a preview, nothing computed
        </T>
      )}
      <MiniTick x={200} y={42} k={k(1.6)} />
      <T x={300} y={114} s={12} f={C.crema} a="middle" o={k(0.4)}>
        prod
      </T>
      {t > 3.6 && (
        <T x={25} y={234} s={12} f={C.crema} o={k(3.6)}>
          a pointer swap: no recompute, no data moved
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. Before and after: the same model-level contract box, ticked on both sides, and its three columns. The middle
// column after the change is a "?". Once answered it becomes total_amount, and the consumer reading amount is crossed out.
export function PredictContractUnchangedMeansSafe({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const before = ['order_id', 'amount', 'updated_at'];
  return (
    <Svg label="same model. does unchanged mean safe?" h={250}>
      {[25, 320].map((x, side) => (
        <g key={x}>
          <T x={x} y={30} s={11} f={C.taupe} o={k(side * 0.2)}>
            {side === 0 ? 'before' : 'after'}
          </T>
          <Cell x={x} y={42} w={130} label="name, grain" o={k(side * 0.2)} />
          <MiniTick x={x + 140} y={56} k={k(0.5 + side * 0.2)} />
          {before.map((c, i) => {
            const mid = side === 1 && i === 1;
            return (
              <Cell
                key={c}
                x={x}
                y={90 + i * 34}
                w={130}
                label={mid ? (v > 0.5 ? 'total_amount' : '?') : c}
                o={k(0.3 + side * 0.2 + i * 0.06)}
                stroke={mid && v > 0.5 ? C.cherryText : C.mocha}
                f={mid && v > 0.5 ? C.cherryText : mid ? C.taupe : C.crema}
              />
            );
          })}
        </g>
      ))}
      <T x={470} y={142} s={11} f={C.latte} o={k(1.0)}>
        reads amount
      </T>
      <Cross x={460} y={138} k={v} />
      <Verdict answer={answer} text="one renamed column is still breaking" y={222} f={C.cherryText} />
    </Svg>
  );
}

// 5 · Two paths to the same new name. Straight to total_amount: amount is crossed out and flagged breaking. Expand first:
// amount stays beside the new column, flagged only as an addition, with a tick.
export function RevealColumnBreakingChange({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="skip expand: breaking. expand first: not." h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        straight to the new name
      </T>
      <Cell x={25} y={46} w={90} label="amount" o={k(0.2)} stroke={t > 1.4 ? C.cherryText : C.mocha} />
      <Req x1={120} x2={155} y={60} k={k(0.6)} />
      <Cell x={160} y={46} w={125} label="total_amount" o={k(0.8)} />
      <Cross x={70} y={60} k={k(1.4)} />
      <T x={305} y={65} s={11} f={C.cherryText} o={k(1.7)}>
        breaking: column removed
      </T>
      <T x={25} y={118} s={11} f={C.taupe} o={k(2.3)}>
        expand first
      </T>
      <Cell x={25} y={130} w={90} label="amount" o={k(2.5)} stroke={C.focus} />
      <T x={137} y={149} s={15} f={C.crema} a="middle" o={k(2.8)}>
        +
      </T>
      <Cell x={160} y={130} w={125} label="total_amount" o={k(2.9)} stroke={C.focus} />
      <MiniTick x={305} y={144} k={k(3.3)} />
      <T x={325} y={149} s={11} f={C.focus} o={k(3.3)}>
        non-breaking: column added
      </T>
      {t > 4.0 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(4.0)}>
          same destination; only one path warns
        </T>
      )}
    </Svg>
  );
}

// 6 · The seeded sample. The full table as one long strip with its six planted bugs dropped in at their real positions. A
// scan over the whole strip rings all six; the first 100 rows as a short sample scan ring only the bug that lands inside.
export function RevealSeededSample({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const bugs = [98, 308, 663, 808, 1333, 1941];
  const bx = (id: number) => 25 + (id / 2000) * 550;
  const full = easeInOut(seg(t, 1.6, 2.6));
  const samp = easeInOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="fast and small. how much of the bug count?" h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        full table: 2,000 rows, six planted bugs
      </T>
      <rect x={25} y={50} width={550} height={24} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {bugs.map((b, i) => (
        <g key={b}>
          <line x1={bx(b)} y1={lerp(40, 52, k(0.4 + i * 0.12))} x2={bx(b)} y2={lerp(62, 72, k(0.4 + i * 0.12))} stroke={C.cherryText} strokeWidth={2.2} opacity={k(0.4 + i * 0.12)} />
          {full * 550 + 25 > bx(b) && <circle cx={bx(b)} cy={62} r={9} fill="none" stroke={C.focus} strokeWidth={1.6} />}
        </g>
      ))}
      {full > 0 && full < 1 && <line x1={25 + full * 550} y1={44} x2={25 + full * 550} y2={80} stroke={C.second} strokeWidth={1.5} />}
      {t > 2.6 && (
        <T x={25} y={100} s={11} f={C.focus} o={k(2.6)}>
          the full table catches all six
        </T>
      )}
      <T x={25} y={136} s={11} f={C.taupe} o={k(2.8)}>
        sample: the first 100 rows
      </T>
      <rect x={25} y={148} width={550} height={24} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 3" opacity={k(2.8) * 0.6} />
      <rect x={25} y={148} width={27.5} height={24} rx={2} fill="none" stroke={C.second} strokeWidth={1.8} opacity={k(2.8)} />
      {bugs.map((b) => (
        <line key={b} x1={bx(b)} y1={152} x2={bx(b)} y2={168} stroke={C.cherryText} strokeWidth={2.2} opacity={k(2.9) * (b < 100 ? 1 : 0.3)} />
      ))}
      {samp > 0.9 && <circle cx={bx(98)} cy={160} r={9} fill="none" stroke={C.focus} strokeWidth={1.6} />}
      {t > 3.6 && (
        <T x={25} y={200} s={11} f={C.cherryText} o={k(3.6)}>
          the rest fall outside it, unseen
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(4.1)}>
          faster, at a measured cost in coverage
        </T>
      )}
    </Svg>
  );
}

// 7 · Two gates that fail on more than a value. Left: the edge from fct_orders down to rpt_revenue_daily vanishes and is
// crossed out. Right: p95 bars for baseline, an OK change and a slow one against the 90-second SLO line; the slow bar
// crosses it and turns red.
export function RevealLineageSlaGate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const gone = easeOut(seg(t, 0.9, 1.4));
  const sc = 1.1;
  const bars: [string, number][] = [
    ['base 72', 72],
    ['ok 85', 85],
    ['slow 104', 104],
  ];
  return (
    <Svg label="wrong value. broken lineage. breached SLO." h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        lineage
      </T>
      <Cell x={25} y={46} w={110} label="fct_orders" o={k(0)} />
      <line x1={80} y1={74} x2={80} y2={130} stroke={gone > 0.5 ? C.cherryText : C.latte} strokeWidth={1.6} strokeDasharray={gone > 0.5 ? '4 4' : undefined} opacity={k(0.2) * (1 - 0.6 * gone)} />
      <Cell x={25} y={130} w={165} label="rpt_revenue_daily" o={k(0.2)} />
      <Cross x={80} y={102} k={gone} />
      {t > 1.5 && (
        <T x={25} y={188} s={11} f={C.cherryText} o={k(1.5)}>
          edge gone: gate fails
        </T>
      )}
      <T x={330} y={34} s={11} f={C.taupe} o={k(1.9)}>
        p95, seconds
      </T>
      {bars.map(([l, v], i) => {
        const g = easeOut(seg(t, 2.1 + i * 0.4, 2.6 + i * 0.4));
        const over = v > 90 && v * sc * g > 90 * sc;
        return (
          <g key={l} opacity={g > 0 ? 1 : 0}>
            <T x={330} y={74 + i * 40} s={11} f={C.latte}>
              {l}
            </T>
            <rect x={430} y={60 + i * 40} width={v * sc * g} height={18} rx={2} fill={over ? C.cherryText : C.latte} />
          </g>
        );
      })}
      <line x1={430 + 90 * sc} y1={50} x2={430 + 90 * sc} y2={150} stroke={C.second} strokeWidth={1.6} strokeDasharray="5 4" opacity={k(1.9)} />
      <T x={430 + 90 * sc} y={168} s={11} f={C.second} a="middle" o={k(1.9)}>
        SLO 90
      </T>
      {t > 3.5 && (
        <T x={330} y={188} s={11} f={C.cherryText} o={k(3.5)}>
          past the SLO: gate fails
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={230} s={12} f={C.crema} o={k(4.1)}>
          both caught in CI, before the merge
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Five cards slide in: the two state-aware mechanisms, the column check, the measured sample, the wider gate.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['state:modified + defer', 'virtual env: promote', 'a column-level check', 'a sample, measured', 'a gate on lineage and SLO'];
  return (
    <Svg label="state-aware. column-aware. gate-aware." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.6;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = i === 4 ? 25 : 25 + (i % 2) * 285;
        const y = 40 + Math.floor(i / 2) * 54;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={i === 4 ? 550 : 265} label={p} o={a} /> : null;
      })}
      {t > 3.9 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.9)}>
          fast and safe, together
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. stg_orders changed. A full rebuild lights a pip for every model; the state-aware row waits on a "?". Once
// answered, its pips fill for the changed model and its downstream only, the rest left hollow.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const ms = Object.keys(NODES);
  return (
    <Svg label="same change. full rebuild vs state-aware." h={250}>
      <T x={25} y={36} s={11} f={C.cherryText} o={k(0)}>
        changed: stg_orders
      </T>
      <T x={25} y={84} s={12} f={C.crema} o={k(0.1)}>
        full rebuild
      </T>
      {ms.map((m, i) => (
        <Pip key={m} x={300 + i * 34} y={80} o={k(0.3 + i * 0.08)} f={C.latte} s={14} />
      ))}
      <T x={25} y={144} s={12} f={C.crema} o={k(0.6)}>
        state:modified+ --defer
      </T>
      {answer === null && t > 1.2 && (
        <T x={420} y={145} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      {answer !== null &&
        ms.map((m, i) => {
          const a = easeOut(seg(s, 0.1 + i * 0.08, 0.4 + i * 0.08));
          return REACH.has(m) ? (
            <Pip key={m} x={300 + i * 34} y={140} o={a} f={C.focus} s={14} />
          ) : (
            <rect key={m} x={293 + i * 34} y={133} width={14} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={a} />
          );
        })}
      <Verdict answer={answer} text="it genuinely builds fewer" y={222} />
    </Svg>
  );
}
