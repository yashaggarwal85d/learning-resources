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

// Every value here is examples.py's own: orders.cust_id, its three table-level readers (customer_summary, revenue_dashboard,
// shipping_report) against the two column-level ones, customer_key, analytics-team and logistics-team, and the
// uninstrumented nightly_partner_export. Counts of the planted truth are drawn as marks, never printed.

type N = { x: number; y: number; d: number; dash?: boolean; sq?: boolean };

/** Nodes and edges of a lineage graph; `lit(i)` brightens a node, `on(i)` draws an edge, `f` colours what is lit. */
function Graph({ nodes, edges, lit, on, f = C.second, o = 1 }: { nodes: N[]; edges: [number, number][]; lit: (i: number) => number; on: (i: number) => number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      {edges.map(([a, b], i) => {
        const g = clamp(on(i));
        const A = nodes[a];
        const B = nodes[b];
        return <line key={i} x1={A.x} y1={A.y} x2={lerp(A.x, B.x, g)} y2={lerp(A.y, B.y, g)} stroke={g > 0.99 ? f : C.mocha} strokeWidth={1.3} opacity={g > 0 ? 1 : 0} />;
      })}
      {edges.map(([a, b], i) => {
        const A = nodes[a];
        const B = nodes[b];
        return <line key={`b${i}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={C.mocha} strokeWidth={1} opacity={0.35} />;
      })}
      {nodes.map((n, i) => {
        const l = clamp(lit(i));
        const fill = l > 0.5 ? f : C.cocoa;
        return n.sq ? (
          <rect key={i} x={n.x - 9} y={n.y - 9} width={18} height={18} rx={2} fill={fill} stroke={C.latte} strokeWidth={1.3} strokeDasharray={n.dash ? '3 2' : undefined} />
        ) : (
          <circle key={i} cx={n.x} cy={n.y} r={9} fill={fill} stroke={n.dash ? C.cherryText : C.latte} strokeWidth={1.3} strokeDasharray={n.dash ? '3 2' : undefined} />
        );
      })}
    </g>
  );
}

const BR: N[] = [
  { x: 60, y: 125, d: 0 },
  { x: 180, y: 60, d: 1 },
  { x: 180, y: 125, d: 1 },
  { x: 180, y: 190, d: 1 },
  { x: 300, y: 40, d: 2 },
  { x: 300, y: 100, d: 2 },
  { x: 300, y: 160, d: 2 },
  { x: 300, y: 215, d: 2 },
  { x: 420, y: 70, d: 3 },
  { x: 420, y: 140, d: 3 },
  { x: 420, y: 205, d: 3 },
  { x: 60, y: 40, d: -1 },
  { x: 540, y: 140, d: 4 },
];
const BRE: [number, number][] = [
  [11, 0],
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [1, 5],
  [2, 5],
  [2, 6],
  [3, 7],
  [5, 8],
  [6, 9],
  [7, 10],
  [9, 12],
];

// 0 · Hook. orders.cust_id is to be renamed. The catalog lights three tables. Then the planted truth fans out behind them, a
// dozen or so marks and two dashboards, and off on its own a dashed script that nothing ever connects to.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const truth = [
    [420, 40],
    [470, 60],
    [520, 40],
    [440, 100],
    [500, 110],
    [550, 90],
    [420, 160],
    [480, 170],
    [540, 150],
    [450, 210],
    [520, 200],
  ];
  return (
    <Svg label="renaming one column. the catalog undercounts; one reader is never seen at all" h={250}>
      <Cell x={25} y={110} w={140} label="orders.cust_id" o={k(0)} stroke={C.cherryText} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={165} y1={124} x2={218} y2={54 + i * 70} k={k(0.6 + i * 0.15)} f={C.latte} />
          <Cell x={220} y={40 + i * 70} w={140} label="a table" o={k(0.7 + i * 0.15)} />
        </g>
      ))}
      {t > 1.2 && (
        <T x={220} y={234} s={11} f={C.taupe} o={k(1.2) * (1 - k(2.0))}>
          the catalog: three
        </T>
      )}
      {truth.map(([x, y], i) => (
        <g key={i}>
          <line x1={360} y1={54 + Math.floor(i / 4) * 70} x2={x} y2={y} stroke={C.mocha} strokeWidth={1} opacity={k(2.2 + i * 0.08)} />
          <circle cx={x} cy={y} r={7} fill={C.second} opacity={k(2.2 + i * 0.08)} />
        </g>
      ))}
      <rect x={545} y={196} width={16} height={16} rx={2} fill={C.second} opacity={k(3.2)} />
      <rect x={545} y={226} width={16} height={16} rx={2} fill={C.second} opacity={k(3.3)} />
      <circle cx={400} cy={232} r={9} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="3 2" opacity={k(3.6)} />
      {t > 3.8 && (
        <T x={25} y={234} s={11} f={C.cherryText} o={k(3.8)}>
          a script nobody wired up
        </T>
      )}
    </Svg>
  );
}

// 1 · The blast radius. A small lineage graph. The change lights one node; a wave walks every arrow downstream, layer by
// layer, lighting all it reaches. The node upstream of the change stays dark: not part of the radius.
export function RevealBlastRadius({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const wave = (t - 1.0) / 0.7;
  return (
    <Svg label="blast radius: walk the graph downstream from the change, list what it touches" h={250}>
      <Graph nodes={BR} edges={BRE} lit={(i) => (BR[i].d >= 0 && wave >= BR[i].d ? 1 : 0)} on={(i) => (BRE[i][0] === 11 ? 0 : wave - BR[BRE[i][0]].d)} f={C.second} o={k(0)} />
      <circle cx={60} cy={125} r={14} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={k(0.6)} />
      {t > 0.6 && (
        <T x={25} y={160} s={11} f={C.cherryText} o={k(0.6)}>
          the change
        </T>
      )}
      {t > 4.2 && (
        <T x={575} y={232} s={11} f={C.second} a="end" o={k(4.2)}>
          the blast radius: all it reaches
        </T>
      )}
    </Svg>
  );
}

const READERS = ['customer_summary', 'revenue_dashboard', 'shipping_report'];

// 2 · Predict: column or table. orders, with cust_id marked for dropping, and its three readers, all joined at table level.
// Once answered, the column-level arrows from cust_id reach only the first two; shipping_report dims out.
export function PredictColumnVsTable({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="dropping a column: table-level, column-level, or neither finds every dependent?" h={250}>
      <rect x={25} y={60} width={150} height={110} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={k(0)} />
      <T x={39} y={82} s={12} f={C.crema} o={k(0)}>
        orders
      </T>
      <Cell x={37} y={94} w={126} h={26} label="cust_id" stroke={C.cherryText} o={k(0.2)} />
      <rect x={37} y={128} width={126} height={26} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
      {READERS.map((n, i) => (
        <g key={n}>
          <line x1={175} y1={115} x2={328} y2={54 + i * 60} stroke={C.latte} strokeWidth={1.2} opacity={k(0.5) * (1 - a * 0.7)} />
          {i < 2 && <line x1={163} y1={107} x2={lerp(163, 328, a)} y2={lerp(107, 54 + i * 60, a)} stroke={C.focus} strokeWidth={1.8} />}
          <Cell x={330} y={40 + i * 60} w={190} label={n} o={k(0.6 + i * 0.1) * (i === 2 ? 1 - 0.6 * a : 1)} stroke={a > 0.5 && i < 2 ? C.focus : C.mocha} />
        </g>
      ))}
      {answer === null && t > 1.0 && (
        <T x={550} y={120} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="column-level: two, not three" y={228} />
    </Svg>
  );
}

// 3 · Column-level narrows. Left, the table-level set: all three readers. Right, the column-level set: the two whose
// customer_key is built from cust_id, shipping_report dropped. A bracket marks the right set as a strict subset.
export function RevealColumnNarrows({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="measured: column-level finds fewer, more precise dependents than table-level" h={250}>
      <T x={25} y={30} s={11} f={C.latte} o={k(0)}>
        table-level
      </T>
      <T x={325} y={30} s={11} f={C.focus} o={k(2.0)}>
        column-level
      </T>
      {READERS.map((n, i) => (
        <g key={n}>
          <Cell x={25} y={44 + i * 44} w={250} label={n} o={k(0.4 + i * 0.3)} stroke={C.latte} />
          {i < 2 ? <Cell x={325} y={44 + i * 44} w={250} label={n} o={k(2.4 + i * 0.3)} stroke={C.focus} /> : <Hole x={325} y={44 + i * 44} w={250} o={k(3.0)} />}
        </g>
      ))}
      <Cross x={450} y={146} k={k(3.2)} />
      {t > 3.6 && (
        <T x={325} y={200} s={11} f={C.focus} o={k(3.6)}>
          fewer, and the right ones
        </T>
      )}
      {t > 4.0 && (
        <T x={325} y={222} s={11} f={C.taupe} o={k(4.0)}>
          cust_id to customer_key
        </T>
      )}
    </Svg>
  );
}

// 4 · Stale propagation. The same graph. An upstream node turns red; the same walk runs forward and rings every downstream
// node with a dashed red mark, labelled with the reason.
export function ElaborateStalePropagation({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const wave = (t - 1.2) / 0.7;
  return (
    <Svg label="the same walk, run forward: mark every downstream dataset potentially stale" h={250}>
      <Graph nodes={BR} edges={BRE} lit={(i) => (i === 0 && t > 0.6 ? 1 : 0)} on={(i) => (BRE[i][0] === 11 ? 0 : wave - BR[BRE[i][0]].d)} f={C.cherryText} o={k(0)} />
      {BR.map((n, i) => (n.d > 0 ? <circle key={i} cx={n.x} cy={n.y} r={14} fill="none" stroke={C.cherryText} strokeWidth={1.3} strokeDasharray="3 3" opacity={wave >= n.d ? 1 : 0} /> : null))}
      {t > 0.6 && (
        <T x={25} y={160} s={11} f={C.cherryText} o={k(0.6)}>
          upstream failed
        </T>
      )}
      {t > 4.0 && (
        <T x={575} y={232} s={11} f={C.cherryText} a="end" o={k(4.0)}>
          stale? because upstream failed
        </T>
      )}
    </Svg>
  );
}

// 5 · Owner notification. Ten affected tables resolve through the catalog to one owner, and collapse into a single message
// to analytics-team listing both real tables. Below, the deprecation loop: the same lookup, repeated until every reader answers.
export function ElaborateOwnerNotification({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g = easeInOut(seg(t, 1.6, 2.4));
  const mv = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="resolve each affected node to its owner, dedupe to one notice per owner" h={250}>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <Fan x1={46} y1={30 + i * 18} x2={148} y2={104} k={k(0.6 + i * 0.05) * (1 - g)} f={C.mocha} />
          <Pip x={lerp(40, 150, g)} y={lerp(30 + i * 18, 104, g)} f={C.second} o={k(0.2 + i * 0.05) * (1 - k(2.4))} s={9} />
        </g>
      ))}
      <Cell x={150} y={90} w={110} label="catalog" o={k(0.8)} />
      <rect x={lerp(270, 400, mv)} y={96} width={24} height={16} rx={2} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={k(2.4)} />
      <path d={`M${lerp(270, 400, mv)} 96 l12 9 l12 -9`} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={k(2.4)} />
      <Cell x={430} y={90} w={145} label="analytics-team" o={k(2.6)} stroke={t > 3.4 ? C.focus : C.mocha} />
      {t > 3.4 && (
        <T x={430} y={140} s={11} f={C.focus} o={k(3.4)}>
          one message
        </T>
      )}
      <path d="M60 222 a14 14 0 1 1 14 14" fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(3.8)} transform={`rotate(${(t * 90).toFixed(1)} 60 222)`} />
      {t > 3.8 && (
        <T x={90} y={226} s={11} f={C.latte} o={k(3.8)}>
          deprecation: repeated until every reader answers
        </T>
      )}
    </Svg>
  );
}

const PT: N[] = [
  { x: 40, y: 125, d: 0 },
  { x: 150, y: 40, d: 1 },
  { x: 150, y: 95, d: 1 },
  { x: 150, y: 150, d: 1 },
  { x: 150, y: 205, d: 1 },
  { x: 270, y: 30, d: 2 },
  { x: 270, y: 75, d: 2 },
  { x: 270, y: 120, d: 2 },
  { x: 270, y: 165, d: 2 },
  { x: 270, y: 210, d: 2 },
  { x: 390, y: 60, d: 3 },
  { x: 390, y: 120, d: 3 },
  { x: 390, y: 180, d: 3, sq: true },
  { x: 390, y: 225, d: 3, sq: true },
  { x: 520, y: 200, d: 9, dash: true },
];
const PTE: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 5],
  [1, 6],
  [2, 7],
  [3, 8],
  [4, 9],
  [6, 10],
  [7, 11],
  [8, 12],
  [9, 13],
];

// 6 · Predict: the planted truth. Eleven tables and two dashboards hang off the change; the dashed script sits apart. Once
// answered, the walk lights everything it can reach and the script stays dark, crossed.
export function PredictPlantedTruth({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const wave = answer !== null ? s / 0.25 : -1;
  return (
    <Svg label="eleven real dependents, two dashboards, one reader no tool instruments -- how many missed?" h={250}>
      <Graph nodes={PT} edges={PTE} lit={(i) => (PT[i].d < 9 && wave >= PT[i].d ? 1 : 0)} on={(i) => wave - PT[PTE[i][0]].d} f={C.focus} o={k(0)} />
      <Cross x={520} y={200} k={answer !== null ? easeOut(seg(s, 1.0, 1.3)) : 0} />
      {answer === null && t > 1.0 && (
        <T x={520} y={110} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
    </Svg>
  );
}

// 7 · The planted-truth answer. The walk lights every reachable node and its owner is ticked; the dashed
// nightly_partner_export never lights under any walk: never recorded.
export function RevealPlantedTruthAnswer({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const wave = (t - 0.6) / 0.6;
  return (
    <Svg label="measured: every reachable owner notified; the unwired export was never recorded at all" h={250}>
      <Graph nodes={PT} edges={PTE} lit={(i) => (PT[i].d < 9 && wave >= PT[i].d ? 1 : 0)} on={(i) => wave - PT[PTE[i][0]].d} f={C.focus} o={k(0)} />
      {PT.map((n, i) => (n.d > 0 && n.d < 9 ? <MiniTick key={i} x={n.x + 14} y={n.y - 4} k={k(3.0 + n.d * 0.15)} /> : null))}
      {t > 3.4 && (
        <T x={575} y={176} s={11} f={C.cherryText} a="end" o={k(3.4)}>
          nightly_partner_export
        </T>
      )}
      {t > 3.8 && (
        <T x={575} y={236} s={11} f={C.cherryText} a="end" o={k(3.8)}>
          never recorded
        </T>
      )}
    </Svg>
  );
}

const RECAP: [string, boolean][] = [
  ['follow the arrows as far as they go', true],
  ['column by column: exactly who needs to know', true],
  ['missed readers: never zero', false],
];

// 8 · Recap. Two ticked truths, and the honest third, crossed: whatever was never wired up stays unseen.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="blast radius is a graph walk; the graph is only as complete as what it records" h={250}>
      {RECAP.map(([n, ok], i) => (
        <g key={n}>
          {ok ? <MiniTick x={25} y={44 + i * 50} k={k(0.6 + i * 1.2)} /> : <Cross x={32} y={46 + i * 50} k={k(0.6 + i * 1.2)} />}
          <T x={55} y={50 + i * 50} s={12} f={ok ? C.crema : C.cherryText} o={k(0.5 + i * 1.2)}>
            {n}
          </T>
        </g>
      ))}
      {t > 4.0 && (
        <T x={55} y={214} s={11} f={C.taupe} o={k(4.0)}>
          only what someone wired up ever reports
        </T>
      )}
    </Svg>
  );
}
