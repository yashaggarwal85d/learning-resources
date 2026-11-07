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
function Cell({
  x,
  y,
  w,
  h = 30,
  label,
  o = 1,
  stroke = C.mocha,
  f = C.crema,
  fill = C.cocoa,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  o?: number;
  stroke?: string;
  f?: string;
  fill?: string;
}) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

/** One row of the accumulating snapshot: three milestone cells, each filled by its own progress. */
function Milestones({ y, p, o = 1, names = ['ordered', 'shipped', 'delivered'] }: { y: number; p: number[]; o?: number; names?: string[] }) {
  return (
    <g opacity={o}>
      {names.map((n, i) => (
        <g key={n}>
          <rect x={25 + i * 190} y={y} width={170} height={30} rx={4} fill={C.cocoa} stroke={p[i] > 0 ? C.focus : C.mocha} strokeWidth={1.5} />
          <rect x={25 + i * 190} y={y} width={170 * p[i]} height={30} rx={4} fill={C.focus} opacity={0.3} />
          <T x={110 + i * 190} y={y + 20} s={12} f={p[i] > 0 ? C.crema : C.latte} a="middle">
            {n}
          </T>
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. Four shapes, each with a strip of its own behaviour: events dropping in irregularly, one tick per period,
// one row filling in place, and keys with no measurement.
export function Hook({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['transaction', 'one row per event'],
    ['periodic snapshot', 'one row per period'],
    ['accumulating', 'one row, updated'],
    ['factless', 'no measurement at all'],
  ];
  return (
    <Svg label="transaction, snapshot, accumulating, factless" h={250}>
      {rows.map(([label, value], i) => {
        const y = 40 + i * 58;
        const k = easeOut(seg(t, 0.5 + i * 0.8, 1.0 + i * 0.8));
        const p = seg(t, 0.8 + i * 0.8, 1.8 + i * 0.8);
        return (
          <g key={label}>
            <Row y={y} label={label} value={value} k={k} />
            {i === 0 && [0.05, 0.12, 0.17, 0.55, 0.9].map((x, j) => <circle key={j} cx={25 + 550 * x} cy={y + 16} r={3.5} fill={C.crema} opacity={p > x ? 1 : 0} />)}
            {i === 1 && Array.from({ length: 10 }, (_, j) => <rect key={j} x={25 + j * 55} y={y + 11} width={3} height={10} fill={C.crema} opacity={p > j / 10 ? 1 : 0} />)}
            {i === 2 && <rect x={25} y={y + 12} width={550 * p} height={8} rx={4} fill={C.focus} opacity={0.6} />}
            {i === 3 && [0.1, 0.3, 0.5, 0.7].map((x, j) => <circle key={j} cx={25 + 550 * x} cy={y + 16} r={4} fill="none" stroke={C.crema} opacity={p > x ? 1 : 0} />)}
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Transaction. Events land on a timeline, two close together and one far off; each drops its own row, and the
// empty stretch gets nothing.
const EV: [number, string][] = [
  [90, '40.00'],
  [175, '30.00'],
  [470, '75.00'],
];
export function RevealTransaction({ t }: StepCtx) {
  const gap = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="a row exists only if the event happened" h={230}>
      <Row y={40} label="transaction row" value="a measurement event" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="dense, or sparse" value="never padded" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <line x1={25} y1={130} x2={25 + 550 * easeInOut(seg(t, 0.4, 1.0))} y2={130} stroke={C.mocha} strokeWidth={2} />
      {EV.map(([x, a], i) => {
        const e = easeOutBack(seg(t, 1.0 + i * 0.5, 1.3 + i * 0.5));
        const d = easeOut(seg(t, 1.3 + i * 0.5, 1.7 + i * 0.5));
        return (
          <g key={x}>
            <circle cx={x} cy={130} r={6 * clamp(e)} fill={C.focus} />
            <g opacity={d}>
              <rect x={x - 40} y={lerp(135, 160, d)} width={80} height={26} rx={4} fill={C.cocoa} stroke={C.focus} />
              <T x={x} y={lerp(152, 177, d)} s={12} f={C.crema} a="middle">
                {a}
              </T>
            </g>
          </g>
        );
      })}
      <rect x={235} y={160} width={185} height={26} rx={4} fill="none" stroke={C.latte} strokeDasharray="4 4" opacity={gap * 0.6} />
      <T x={327} y={207} s={11} f={C.latte} a="middle" o={gap}>
        nothing happened: no row
      </T>
    </Svg>
  );
}

// 3 · Predict: an idle account. Two accounts, one with an activity dot today and one without; then the question.
export function PredictPeriodicSnapshot({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.6));
  return (
    <Svg label="an idle account, an idle day — still a row?" h={210}>
      <Row y={40} label="account, no activity" value="still get a row?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={60} w={200} h={26} label="account A" o={k} />
      <circle cx={245} cy={73} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={315} y={60} w={200} h={26} label="account B" o={k} />
      <circle cx={535} cy={73} r={5} fill="none" stroke={C.latte} strokeDasharray="2 2" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <AnswerRow y={140} label="idle account, today" answer={answer} value="still a row" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="the grain is the period, not the event" />
    </Svg>
  );
}

// 4 · Periodic, measured. Three days, two accounts, no activity: each day's column still fills with both accounts.
export function RevealPeriodicMeasured({ t }: StepCtx) {
  return (
    <Svg label="every account, every day, active or not" h={230}>
      <Row y={40} label="two accounts" value="present every day" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="no balance moved" value="rows still inserted" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {['A', 'B'].map((a, r) => (
        <T key={a} x={25} y={150 + r * 40} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
          {`account ${a}`}
        </T>
      ))}
      {[0, 1, 2].map((d) => {
        const k = easeOut(seg(t, 0.9 + d * 0.6, 1.3 + d * 0.6));
        return (
          <g key={d}>
            <T x={200 + d * 135} y={120} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
              {`day ${d + 1}`}
            </T>
            {[0, 1].map((r) => (
              <rect key={r} x={145 + d * 135} y={lerp(126, 132, 1 - k) + r * 40} width={110} height={28} rx={4} fill={C.focus} opacity={0.4 * k} stroke={C.focus} strokeOpacity={k} />
            ))}
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · Accumulating. The row is inserted once when the pipeline begins; then the same row's milestone cells fill in,
// one by one, and the row count never changes.
export function RevealAccumulatingQuote({ t }: StepCtx) {
  const ins = easeOut(seg(t, 0.6, 1.1));
  return (
    <Svg label="inserted once, updated after" h={220}>
      <Row y={40} label="pipeline begins" value="row inserted once" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="pipeline moves" value="same row, updated" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.5))} />
      <g transform={`translate(${((1 - ins) * -30).toFixed(1)} 0)`}>
        <Milestones y={120} o={ins} p={[easeOut(seg(t, 1.0, 1.4)), easeOut(seg(t, 2.4, 2.9)), easeOut(seg(t, 3.2, 3.7))]} />
      </g>
      <T x={300} y={185} s={12} f={C.latte} a="middle" o={ins}>
        row count: 1
      </T>
    </Svg>
  );
}

// 6 · Predict: how many rows after three milestones? Three milestones light along a line; then the question.
export function PredictAccumulatingRows({ t, answer }: StepCtx) {
  return (
    <Svg label="ordered, shipped, delivered — row count now?" h={210}>
      <Row y={40} label="three milestones" value="how many rows?" k={easeOut(seg(t, 0.1, 0.5))} />
      <line x1={60} y1={78} x2={60 + 480 * easeInOut(seg(t, 0.3, 1.2))} y2={78} stroke={C.mocha} strokeWidth={2} />
      {['ordered', 'shipped', 'delivered'].map((m, i) => (
        <g key={m} opacity={easeOut(seg(t, 0.4 + i * 0.3, 0.7 + i * 0.3))}>
          <circle cx={60 + i * 240} cy={78} r={6} fill={C.focus} />
          <T x={60 + i * 240} y={104} s={11} f={C.latte} a="middle">
            {m}
          </T>
        </g>
      ))}
      <AnswerRow y={145} label="rows after all three" answer={answer} value="still one" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="every milestone updates the same row" y={190} />
    </Svg>
  );
}

// 7 · Accumulating, measured. The one row fills milestone by milestone; then the two lags are computed from the dates:
// 1 day from order to ship, 2 days from ship to delivery.
export function RevealAccumulatingMeasured({ t }: StepCtx) {
  const l1 = easeInOut(seg(t, 2.2, 2.7));
  const l2 = easeInOut(seg(t, 2.9, 3.4));
  return (
    <Svg label="one row, three milestones, two lags computed" h={250}>
      <Row y={40} label="row count" value="stayed at one" k={easeOut(seg(t, 0.3, 0.8))} />
      <Milestones y={65} p={[easeOut(seg(t, 0.6, 1.0)), easeOut(seg(t, 1.1, 1.5)), easeOut(seg(t, 1.6, 2.0))]} />
      <path d={`M110 100 l0 10 l${190 * l1} 0`} fill="none" stroke={C.focus} strokeWidth={2} opacity={l1 > 0 ? 1 : 0} />
      <path d={`M300 100 l0 18 l${190 * l2} 0`} fill="none" stroke={C.second} strokeWidth={2} opacity={l2 > 0 ? 1 : 0} />
      <Row y={175} label="order to ship" value="1 day" valueColor={C.focus} k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={225} label="ship to deliver" value="2 days" valueColor={C.second} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 8 · Factless. A row of nothing but keys, its fact slot empty; then coverage minus activity leaves what never happened.
export function RevealFactlessQuote({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.6, 1.0));
  const sub = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="coverage minus activity finds what didn't happen" h={230}>
      <Row y={40} label="no numeric fact" value="just dimension keys" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="coverage - activity" value="what never happened" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      {['date key', 'student key', 'class key'].map((l, i) => (
        <Cell key={l} x={25 + i * 140} y={115} w={130} h={28} label={l} o={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))} />
      ))}
      <rect x={445} y={115} width={130} height={28} rx={4} fill="none" stroke={C.latte} strokeDasharray="4 4" opacity={k} />
      <T x={510} y={134} s={11} f={C.latte} a="middle" o={k}>
        no fact
      </T>
      <T x={300} y={lerp(190, 184, sub)} s={14} f={C.crema} a="middle" o={sub}>
        could have happened − did happen
      </T>
      <T x={300} y={lerp(220, 214, easeOut(seg(t, 3.3, 3.8)))} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.8))}>
        = never happened
      </T>
    </Svg>
  );
}

// 9 · Factless, measured. Three students expected; the two who attended slide up onto their places and cancel; the
// one left over lights up as missing.
export function RevealFactlessMeasured({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.4, 2.2));
  const gone = easeOut(seg(t, 2.2, 2.6));
  const miss = easeOut(seg(t, 2.7, 3.2));
  return (
    <Svg label="three expected, two attended, one missing" h={230}>
      <Row y={40} label="coverage table" value="students expected" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="minus activity" value="one found missing" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {[0, 1, 2].map((i) => {
        const att = i !== 1;
        return (
          <g key={i}>
            <Cell
              x={25 + i * 190}
              y={120}
              w={170}
              label={`student ${i + 1}`}
              o={easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1)) * (att ? 1 - 0.8 * gone : 1)}
              stroke={!att && miss > 0 ? C.focus : C.mocha}
              f={!att && miss > 0 ? C.focus : C.crema}
            />
            {att && <Cell x={25 + i * 190} y={lerp(175, 120, m)} w={170} label="attended" o={easeOut(seg(t, 0.8, 1.1)) * (1 - gone)} stroke={C.second} />}
          </g>
        );
      })}
      <T x={300} y={lerp(198, 192, miss)} s={13} f={C.focus} a="middle" o={miss}>
        missing
      </T>
    </Svg>
  );
}

// 10 · Predict: a late correction. A correction drops toward the four shapes; then the question.
export function PredictAdditivityVerdict({ t, answer }: StepCtx) {
  const d = easeInOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="a late correction — which type just re-sums?" h={210}>
      <Row y={40} label="late correction" value="which types absorb it?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={240} y={lerp(54, 68, d)} w={120} h={24} label="+ correction" o={easeOut(seg(t, 0.3, 0.5))} stroke={C.focus} />
      <AnswerRow y={140} label="just sums it in" answer={answer} value="per-event, per-period" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="the milestone table recomputes instead" />
    </Svg>
  );
}

// 11 · The split. The correction drops into the transaction and snapshot tables as one more number; the accumulating
// table's lag has to go round again and be recomputed.
export function RevealAdditivityVerdict({ t }: StepCtx) {
  const d = (i: number) => easeInOut(seg(t, 0.8 + i * 0.4, 1.3 + i * 0.4));
  const rc = seg(t, 2.6, 3.6);
  return (
    <Svg label="transaction, snapshot: re-sum. accumulating: recompute." h={230}>
      <Row y={40} label="transaction, snapshot" value="additive as usual" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={85} label="accumulating lags" value="recomputed, not summed" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      {['transaction', 'snapshot', 'accumulating'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={150} w={170} label={l} o={easeOut(seg(t, 0.2, 0.5))} stroke={i < 2 && d(i) >= 1 ? C.focus : i === 2 && rc > 0 ? C.second : C.mocha} />
      ))}
      {[0, 1].map((i) => (
        <T key={i} x={110 + i * 190} y={lerp(112, 140, d(i))} s={14} f={C.focus} a="middle" o={d(i) > 0 && d(i) < 1 ? 1 : d(i) >= 1 ? 0 : 0}>
          +
        </T>
      ))}
      {[0, 1].map((i) => (
        <T key={i} x={110 + i * 190} y={200} s={12} f={C.focus} a="middle" o={d(i) >= 1 ? 1 : 0}>
          summed in
        </T>
      ))}
      <path
        d="M470 196 A 20 10 0 1 0 510 196"
        fill="none"
        stroke={C.second}
        strokeWidth={2}
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - rc}
        transform={`rotate(${(rc * 360).toFixed(0)} 490 196)`}
        opacity={rc > 0 && rc < 1 ? 1 : 0}
      />
      <T x={490} y={200} s={12} f={C.second} a="middle" o={rc >= 1 ? 1 : 0}>
        lag recomputed
      </T>
    </Svg>
  );
}

// 12 · Recap. Four shapes, each answering its own question, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four types, measured" h={250}>
      <Row y={45} label="transaction" value="dense, or sparse" k={easeOut(seg(t, 0.6, 1.1))} />
      <Row y={100} label="periodic snapshot" value="every entity, every period" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={155} label="accumulating" value="updated row" k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={210} label="factless" value="did it happen at all" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 13 · Prove: a ticket pipeline. Three steps along a line; after the answer one row fills step by step and the verdict
// lands with a tick.
export function ProveTicketPipeline({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const p = (i: number) => (answer !== null ? easeOut(seg(s, 0.1 + i * 0.25, 0.4 + i * 0.25)) : 0);
  const k = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.2, 1.6)) : 0;
  return (
    <Svg label="opened, first response, closed — which type?" h={230}>
      <Row y={40} label="ticket pipeline" value="defined start and end" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="which fact table" answer={answer} value="accumulating" k={easeOut(seg(t, 0.4, 0.9))} />
      <Milestones y={115} p={[p(0), p(1), p(2)]} o={easeOut(seg(t, 0.6, 1.0))} names={['opened', 'responded', 'closed']} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            one row, updated at each step
          </T>
          <rect x={170} y={202} width={260 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
