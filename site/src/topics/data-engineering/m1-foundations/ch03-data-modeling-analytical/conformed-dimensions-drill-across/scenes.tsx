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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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

// 1 · Hook. Orders and tickets each join to the one shared date; the summed amount comes out as a question mark.
export function Hook({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.8, 1.4));
  const b = easeInOut(seg(t, 1.4, 2.0));
  const q = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="orders fact + tickets fact, same shared date" h={220}>
      <Row y={40} label="orders fact" value="joined on shared date" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={85} label="tickets fact" value="joined on shared date" k={easeOut(seg(t, 1.2, 1.7))} />
      <Cell x={25} y={120} w={150} label="orders" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={225} y={120} w={150} label="date" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      <Cell x={425} y={120} w={150} label="tickets" o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={175} y1={134} x2={175 + 50 * a} y2={134} stroke={C.focus} strokeWidth={2} />
      <line x1={425} y1={134} x2={425 - 50 * b} y2={134} stroke={C.focus} strokeWidth={2} />
      <T x={300} y={lerp(196, 190, q)} s={16} f={C.cherryText} a="middle" o={q}>
        sum of amounts: trustworthy?
      </T>
    </Svg>
  );
}

// 2 · Conformed. Two date dimensions, one per process; each column is joined to its twin and ticked: same names,
// same values.
export function RevealConformedDimension({ t }: StepCtx) {
  const cols = ['date', 'month', 'year'];
  return (
    <Svg label="same column names, same domain contents" h={220}>
      <Row y={40} label="conformed dimension" value="same names, same domain" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={85} label="only then" value="fact tables comparable" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {[0, 1].map((r) => (
        <g key={r} opacity={easeOut(seg(t, 0.3 + r * 0.3, 0.7 + r * 0.3))}>
          {cols.map((c, i) => (
            <Cell key={c} x={25 + i * 190} y={115 + r * 62} w={170} label={c} stroke={easeOut(seg(t, 1.8 + i * 0.3, 2.2 + i * 0.3)) > 0.9 ? C.focus : C.mocha} />
          ))}
        </g>
      ))}
      {cols.map((c, i) => {
        const k = easeInOut(seg(t, 1.6 + i * 0.3, 2.1 + i * 0.3));
        return <line key={c} x1={110 + i * 190} y1={143} x2={110 + i * 190} y2={143 + 34 * k} stroke={C.focus} strokeWidth={2} />;
      })}
    </Svg>
  );
}

// 3 · Predict: is a shared date enough? Orders, date, tickets in a line; then the question.
export function PredictDirectJoin({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.6));
  return (
    <Svg label="a conformed date, joined directly — safe?" h={210}>
      <Row y={40} label="date is conformed" value="safe to join and sum?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={62} w={130} label="orders" o={k} />
      <Cell x={235} y={62} w={130} label="date" o={k} stroke={C.focus} />
      <Cell x={445} y={62} w={130} label="tickets" o={k} />
      <line x1={155} y1={76} x2={155 + 80 * easeInOut(seg(t, 0.6, 1.0))} y2={76} stroke={C.latte} strokeWidth={1.5} />
      <line x1={445} y1={76} x2={445 - 80 * easeInOut(seg(t, 0.8, 1.2))} y2={76} stroke={C.latte} strokeWidth={1.5} />
      <AnswerRow y={140} label="do the grains match" answer={answer} value="not promised" f={C.cherryText} k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="a shared dimension doesn't share grain" f={C.cherryText} />
    </Svg>
  );
}

// 4 · Drilling across. Each process is summed on its own, labelled by the shared date; the two finished answers then
// slide side by side. The fact tables never touch.
export function RevealDrillAcross({ t }: StepCtx) {
  const lane = (y: number, t0: number, src: string, res: string) => {
    const a = easeInOut(seg(t, t0, t0 + 0.4));
    const b = easeInOut(seg(t, t0 + 0.4, t0 + 0.8));
    const m = easeInOut(seg(t, 2.6, 3.4));
    return (
      <g>
        <Cell x={25} y={y} w={110} label={src} o={easeOut(seg(t, t0 - 0.2, t0))} />
        <line x1={135} y1={y + 14} x2={135 + 40 * a} y2={y + 14} stroke={C.latte} strokeWidth={1.5} />
        <Cell x={175} y={y} w={120} label="sum by date" o={a} />
        <line x1={295} y1={y + 14} x2={295 + 40 * b} y2={y + 14} stroke={C.latte} strokeWidth={1.5} />
        <Cell x={lerp(335, 455, m)} y={lerp(y, 145 + (y > 140 ? 14 : -14), m)} w={120} label={res} o={b} stroke={C.focus} />
      </g>
    );
  };
  return (
    <Svg label="two queries, aligned by sort-merge, never joined" h={230}>
      <Row y={40} label="drilling across" value="two separate queries" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="aligned by" value="sort-merge, not a join" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      {lane(115, 0.6, 'orders', '145.00')}
      {lane(175, 1.2, 'tickets', '95 min')}
    </Svg>
  );
}

// 5 · The bus matrix. Processes down the side, conformed dimensions across the top; a tick lands wherever a process
// uses a dimension.
const BUS: [string, boolean[]][] = [
  ['orders', [true, true, true]],
  ['tickets', [true, true, false]],
  ['shipments', [true, false, true]],
];
export function RevealBusMatrix({ t }: StepCtx) {
  let n = 0;
  return (
    <Svg label="processes down, conformed dimensions across" h={240}>
      <Row y={40} label="rows" value="business processes" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="columns" value="conformed dimensions" valueColor={C.focus} k={easeOut(seg(t, 0.9, 1.4))} />
      {['date', 'customer', 'product'].map((d, i) => (
        <T key={d} x={260 + i * 115} y={128} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.0 + i * 0.1, 1.3 + i * 0.1))}>
          {d}
        </T>
      ))}
      {BUS.map(([p, uses], r) => (
        <g key={p}>
          <T x={25} y={160 + r * 30} s={12} f={C.latte} o={easeOut(seg(t, 0.5 + r * 0.1, 0.8 + r * 0.1))}>
            {p}
          </T>
          <line x1={25} y1={168 + r * 30} x2={575} y2={168 + r * 30} stroke={C.mocha} opacity={0.5 * easeOut(seg(t, 0.5, 0.8))} />
          {uses.map((u, c) => {
            if (!u) return null;
            const k = easeOut(seg(t, 1.8 + n * 0.22, 2.1 + n++ * 0.22));
            return <path key={c} d={`M${250 + c * 115} ${154 + r * 30} l6 6 l12 -13`} fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray="30" strokeDashoffset={30 * (1 - k)} />;
          })}
        </g>
      ))}
    </Svg>
  );
}

// 6 · The fan-out. Two orders joined straight through to three tickets: every pair draws a line, six rows, and the
// order amount summed over them comes out at 435.00.
export function RevealFanOut({ t }: StepCtx) {
  const ord: [number, string][] = [
    [120, '70.00'],
    [165, '75.00'],
  ];
  const tic: [number, string][] = [
    [110, '30 min'],
    [145, '45 min'],
    [180, '20 min'],
  ];
  const sum = easeOut(seg(t, 2.8, 3.3));
  let n = 0;
  return (
    <Svg label="joined directly: rows multiply, sum inflates" h={250}>
      <Row y={40} label="joined directly" value="row count multiplies" valueColor={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="order total" value="comes out inflated" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      {ord.map(([y, l]) => (
        <Cell key={l} x={25} y={y} w={110} label={l} o={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      {tic.map(([y, l]) => (
        <Cell key={l} x={465} y={y} w={110} label={l} o={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      {ord.map(([oy]) =>
        tic.map(([ty]) => {
          const k = easeInOut(seg(t, 0.9 + n * 0.22, 1.3 + n++ * 0.22));
          return <line key={`${oy}-${ty}`} x1={135} y1={oy + 14} x2={lerp(135, 465, k)} y2={lerp(oy + 14, ty + 14, k)} stroke={C.cherryText} strokeWidth={1.5} opacity={0.8} />;
        }),
      )}
      <T x={300} y={lerp(238, 232, sum)} s={15} f={C.cherryText} a="middle" o={sum}>
        6 rows, amount sums to 435.00
      </T>
    </Svg>
  );
}

// 7 · Aggregate first. The two orders fold into 145.00 and the three tickets into 95 min, each at the date's grain;
// then one line joins one row to one row.
export function RevealAggregateFirst({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.8, 1.6));
  const b = easeInOut(seg(t, 1.2, 2.0));
  const j = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="summarize each table first, then join the summaries" h={230}>
      <Row y={40} label="each fact table" value="summed to shared grain" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="then joined" value="one row meets one row" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {['70.00', '75.00'].map((l, i) => (
        <Cell key={l} x={25} y={lerp(120 + i * 40, 140, a)} w={110} label={l} o={(1 - a) * easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <Cell x={25} y={140} w={110} label="145.00" o={a} stroke={C.focus} />
      {['30 min', '45 min', '20 min'].map((l, i) => (
        <Cell key={l} x={465} y={lerp(115 + i * 30, 140, b)} w={110} h={26} label={l} o={(1 - b) * easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <Cell x={465} y={140} w={110} label="95 min" o={b} stroke={C.focus} />
      <line x1={135} y1={154} x2={135 + 330 * j} y2={154} stroke={C.focus} strokeWidth={2} />
      <T x={300} y={180} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        one row to one row
      </T>
    </Svg>
  );
}

// 8 · Predict: which total is real? Both totals stand side by side; then the question.
export function PredictWhichIsCorrect({ t, answer }: StepCtx) {
  return (
    <Svg label="two totals came out — which one is real?" h={210}>
      <Row y={40} label="fanned-out total" value="435.00" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={85} label="aggregate-first total" value="145.00" k={easeOut(seg(t, 0.6, 1.0))} />
      <AnswerRow y={140} label="which is correct" answer={answer} value="145.00" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="nothing multiplies the smaller one" />
    </Svg>
  );
}

// 9 · Independent confirmation. Each process summed alone, with no join anywhere: 145.00 and 95 min, each ticked; the
// inflated 435.00 is struck through.
export function RevealIndependentConfirmation({ t }: StepCtx) {
  const st = easeInOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="each fact table, summed alone, confirms it" h={240}>
      <Row y={40} label="summed alone" value="no join involved" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="matches" value="the aggregate-first figure" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      {[
        ['orders, alone', '145.00'],
        ['tickets, alone', '95 min'],
      ].map(([l, v], i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.6, 1.4 + i * 0.6));
        return (
          <g key={l}>
            <T x={25} y={140 + i * 40} s={13} f={C.latte} o={k}>
              {l}
            </T>
            <T x={420} y={140 + i * 40} s={15} f={C.focus} a="end" o={k}>
              {v}
            </T>
            <Tick y={128 + i * 40} k={easeOut(seg(t, 2.6 + i * 0.3, 3.0 + i * 0.3))} />
          </g>
        );
      })}
      <T x={300} y={222} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>
        435.00
      </T>
      <line x1={255} y1={217} x2={255 + 90 * st} y2={217} stroke={C.cherryText} strokeWidth={2} />
    </Svg>
  );
}

// 10 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="conformed, planned, aggregated before joining" h={220}>
      <Row y={50} label="conformed dimension" value="makes facts comparable" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={110} label="bus matrix" value="where it gets planned" k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={170} label="drilling across" value="aggregate, then join" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 11 · Prove: a third process. Three processes on the shared date; after the answer each is summed on its own and the
// verdict lands with a tick.
export function ProveThirdFactTable({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const p = (i: number) => (answer !== null ? easeOut(seg(s, 0.1 + i * 0.2, 0.4 + i * 0.2)) : 0);
  const k = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.2, 1.6)) : 0;
  return (
    <Svg label="a third fact table, same conformed date" h={230}>
      <Row y={40} label="third fact table" value="join directly, or first?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the safe way" answer={answer} value="finish it first" k={easeOut(seg(t, 0.4, 0.9))} />
      {['orders', 'tickets', 'third'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={115} w={170} label={l} o={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))} stroke={p(i) > 0 ? C.focus : C.mocha} />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            summed alone, then side by side
          </T>
          <rect x={170} y={202} width={260 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
