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

// Every rate and ratio here comes from examples.py: real public per-unit rates (Glue's $0.44/DPU-hour, Dataproc's
// $0.06/DCU-hour) and a break-even formula solved numerically.

// 0 · One day, two meters. A cursor sweeps the day: the provisioned row bills a thin flat strip all day; the serverless
// row bills only the six busy hours, but tall. Then the two days' totals as bars.
export function NearlyDoubled({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hx = (h: number) => 130 + (h / 24) * 440;
  const cur = clamp(seg(t, 0.2, 2.4)) * 24;
  const seen = (a: number, b: number) => Math.max(0, Math.min(cur, b) - a);
  return (
    <Svg label="A job's daily cost on a provisioned cluster, then on serverless after the move" h={250}>
      <T x={25} y={74} s={12} f={C.crema} o={k(0)}>
        provisioned
      </T>
      <rect x={hx(0)} y={66} width={(seen(0, 24) / 24) * 440} height={8} fill={C.second} opacity={0.8} />
      <T x={25} y={140} s={12} f={C.crema} o={k(0)}>
        serverless
      </T>
      <rect x={hx(9)} y={100} width={(seen(9, 15) / 24) * 440} height={44} fill={C.cherryText} opacity={0.8} />
      <line x1={hx(0)} y1={150} x2={hx(24)} y2={150} stroke={C.mocha} strokeWidth={1.2} opacity={k(0)} />
      <line x1={hx(cur)} y1={40} x2={hx(cur)} y2={150} stroke={C.latte} strokeWidth={1.2} opacity={cur < 24 ? 1 : 0} />
      <T x={130} y={34} s={11} f={C.latte} o={k(0)}>
        one day; the job runs six hours of it
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={k(2.6)}>
        provisioned, flat rate: $2.88 a day
      </T>
      <rect x={330} y={180} width={130 * k(2.6)} height={12} rx={3} fill={C.second} />
      {t > 3.2 && (
        <>
          <T x={25} y={222} s={11} f={C.cherryText} o={k(3.2)}>
            serverless, "to save money": $5.28 a day
          </T>
          <rect x={330} y={212} width={238 * k(3.2)} height={12} rx={3} fill={C.cherryText} />
        </>
      )}
    </Svg>
  );
}

// 1 · Predict. Two jobs' days, each under the same flat reservation: job A busy six hours, job B six minutes, a sliver.
// Once answered, everything around job B's sliver lights as reservation paid for and idle.
export function PredictWhichJob({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const g = easeInOut(seg(t, 0.2, 1.0));
  return (
    <Svg label="Job A running six hours a day against Job B running six minutes a day" h={250}>
      <T x={25} y={62} s={12} f={C.crema} o={k(0)}>
        job A: six hours
      </T>
      <rect x={180} y={44} width={395} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 3" opacity={k(0)} />
      <rect x={280} y={48} width={99 * g} height={20} rx={3} fill={C.second} />
      <T x={25} y={132} s={12} f={C.crema} o={k(0.1)}>
        job B: six minutes
      </T>
      <rect
        x={180}
        y={114}
        width={395}
        height={28}
        rx={4}
        fill={C.cherryText}
        fillOpacity={0.25 * v}
        stroke={v > 0.5 ? C.cherryText : C.mocha}
        strokeWidth={1.2}
        strokeDasharray="4 3"
        opacity={k(0.1)}
      />
      <rect x={280} y={118} width={3 * g} height={20} rx={1} fill={C.second} />
      <T x={180} y={34} s={11} f={C.latte} o={k(0.3)}>
        one day under a flat reservation
      </T>
      {v > 0 && (
        <T x={180} y={164} s={11} f={C.cherryText} o={v}>
          idle, still billed flat: serverless skips all of it
        </T>
      )}
      <Verdict answer={answer} text="the short one gets cheaper on serverless" y={220} />
    </Svg>
  );
}

// 2 · Five units, five rows, each beside a small picture of what it counts: a fixed slab, a ticking consumption meter, a
// block with a floor, a unit that grows with data touched, and BigQuery's bytes.
export function FiveBillingUnits({ t }: StepCtx) {
  const units: [string, string][] = [
    ['AWS Glue', 'DPU-hour · 4 vCPU + 16 GB · $0.44/hr'],
    ['AWS EMR Serverless', 'vCPU-second + GB-second, actually consumed'],
    ['Google Dataproc Serverless', 'DCU · 12-DCU session floor · $0.06/hr'],
    ['Databricks serverless', 'DBU · moves with the data touched'],
    ['Google BigQuery', 'bytes scanned on-demand, or bought slots'],
  ];
  const grow = 0.5 + 0.5 * Math.sin(t * 3);
  return (
    <Svg label="One vendor's own billing unit at a time, named and sourced" h={240}>
      {units.map(([name, unit], i) => {
        const d = 0.2 + i * 0.95;
        const y = 20 + i * 44;
        const k = easeOut(seg(t, d, d + 0.4));
        const hi = (i === 0 || i === 3) && t > 4.9;
        return (
          <g key={name} opacity={k}>
            <T x={65} y={y + 10} s={12} f={hi ? C.focus : C.crema}>
              {name}
            </T>
            <T x={65} y={y + 31} s={11} f={C.latte}>
              {unit}
            </T>
            {i === 0 && <rect x={25} y={y + 2} width={26} height={26} rx={3} fill={C.second} opacity={0.8} />}
            {i === 1 && <rect x={25} y={y + 10} width={26 * clamp((t - d) % 1)} height={10} rx={2} fill={C.second} />}
            {i === 2 && (
              <g>
                <rect x={25} y={y + 2} width={26} height={26} rx={3} fill="none" stroke={C.second} strokeDasharray="3 2" />
                <rect x={25} y={y + 16} width={26} height={12} rx={2} fill={C.second} opacity={0.8} />
              </g>
            )}
            {i === 3 && <rect x={38 - 13 * grow} y={y + 15 - 13 * grow} width={26 * grow} height={26 * grow} rx={3} fill={C.focus} opacity={0.8} />}
            {i === 4 && [0, 1, 2].map((j) => <rect key={j} x={25 + j * 9} y={y + 8} width={7} height={14} rx={1} fill={C.caramel} />)}
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · A query runs and its bytes-scanned bar fills as the billed meter; only after it ends does a receipt slide out
// reporting slot-ms. Then the misreading is struck through and corrected.
export function SlotMsGap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = easeInOut(seg(t, 0.3, 1.6));
  const rec = easeOut(seg(t, 1.8, 2.4));
  const strike = easeInOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="Slot-ms as it looks at first versus what BigQuery's own docs actually say" h={250}>
      <Cell x={25} y={30} w={140} label="query runs" o={k(0)} />
      <T x={180} y={36} s={11} f={C.caramel} o={k(0.2)}>
        bytes scanned: what is billed
      </T>
      <rect x={180} y={44} width={395 * run} height={14} rx={3} fill={C.caramel} />
      {rec > 0 && <Cell x={180} y={lerp(64, 76, rec)} w={250} label="receipt: slot-ms used" o={rec} stroke={C.latte} f={C.latte} />}
      <T x={25} y={150} s={13} f={C.crema} o={k(2.5)}>
        slot-ms: what you pay?
      </T>
      <line x1={22} y1={145} x2={lerp(22, 200, strike)} y2={145} stroke={C.cherryText} strokeWidth={2} opacity={strike > 0 ? 1 : 0} />
      {t > 3.3 && (
        <T x={25} y={186} s={12} f={C.caramel} o={k(3.3)}>
          no: a usage metric, reported after the fact
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={214} s={12} f={C.caramel} o={k(3.8)}>
          you pay bytes scanned, or slots you bought
        </T>
      )}
    </Svg>
  );
}

// 4 · One job shape, two conversions. Glue fits it into DPU slabs of 4 vCPU + 16 GB each and prices them; Dataproc adds a
// driver and an executor of 4 DCUs each, then its session floor lifts the total to 12.
export function SameJobConverted({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const floor = easeInOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="One job's resource shape converted into Glue DPU-hours and Dataproc DCU-hours" h={250}>
      <Cell x={155} y={24} w={290} label="8 vCPU, 32 GB, ten minutes a run" o={k(0)} />
      <T x={25} y={86} s={12} f={C.crema} o={k(0.4)}>
        AWS Glue
      </T>
      {[0, 1].map((i) => (
        <Cell key={i} x={25 + i * 120} y={96} w={110} label="DPU" o={k(0.7 + i * 0.3)} stroke={C.second} />
      ))}
      <T x={25} y={142} s={11} f={C.latte} o={k(0.9)}>
        each 4 vCPU + 16 GB
      </T>
      <T x={25} y={176} s={12} f={C.second} o={k(1.6)}>
        2 DPUs, $0.1467 the run
      </T>
      <T x={315} y={86} s={12} f={C.crema} o={k(1.8)}>
        Dataproc Serverless
      </T>
      <Cell x={315} y={96} w={80} label="driver 4" o={k(2.0)} />
      <Cell x={400} y={96} w={90} label="executor 4" o={k(2.2)} />
      <Hole x={495} y={96} w={80} o={floor} stroke={C.caramel} />
      {floor >= 1 && (
        <T x={535} y={115} s={11} f={C.caramel} a="middle">
          floor
        </T>
      )}
      <rect x={315} y={132} width={260 * floor} height={4} rx={1} fill={C.caramel} />
      <T x={315} y={152} s={11} f={C.caramel} o={k(2.8)}>
        12-DCU session floor
      </T>
      <T x={315} y={176} s={12} f={C.caramel} o={k(3.4)}>
        12 DCUs, $0.12 the run
      </T>
      {t > 3.9 && (
        <T x={300} y={226} s={11} f={C.latte} a="middle" o={k(3.9)}>
          a published rate on one side, a documented floor on the other
        </T>
      )}
    </Svg>
  );
}

// 5 · Four hidden costs, each with its own small moving picture: a gap before the run starts, capacity stepping up after
// demand, run times that jitter, and a platform version trailing the latest.
export function FourHiddenCosts({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['cold start', 'minutes lost, once'],
    ['autoscaling lag', 'capacity arrives late'],
    ['noisy neighbours', 'unpredictable, every run'],
    ['version lag', "the upgrade isn't yours"],
  ];
  return (
    <Svg label="The four costs serverless trades for per-second billing, revealed one at a time" h={240}>
      {rows.map(([name, sub], i) => {
        const d = 0.2 + i * 1.1;
        const y = 24 + i * 52;
        const k = easeOut(seg(t, d, d + 0.4));
        const a = clamp(seg(t, d + 0.2, d + 1.0));
        return (
          <g key={name} opacity={k}>
            <T x={25} y={y + 18} s={12} f={C.crema}>
              {name}
            </T>
            <T x={360} y={y + 18} s={11} f={C.cherryText}>
              {sub}
            </T>
            {i === 0 && (
              <g>
                <line x1={180} y1={y + 14} x2={230} y2={y + 14} stroke={C.mocha} strokeWidth={2} strokeDasharray="3 3" />
                <rect x={232} y={y + 8} width={110 * clamp((a - 0.4) / 0.6)} height={12} rx={2} fill={C.second} />
              </g>
            )}
            {i === 1 && (
              <g>
                <path d={`M180 ${y + 28} H220 V${y + 4} H340`} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="200" strokeDashoffset={200 * (1 - a)} />
                <path d={`M180 ${y + 28} H265 V${y + 4} H340`} fill="none" stroke={C.second} strokeWidth={2} strokeDasharray="220" strokeDashoffset={220 * (1 - a)} />
              </g>
            )}
            {i === 2 && [0, 1, 2].map((j) => <rect key={j} x={180} y={y + 2 + j * 9} width={80 + 50 * Math.abs(Math.sin(t * 3 + j * 1.7))} height={6} rx={2} fill={C.second} />)}
            {i === 3 && (
              <g>
                <rect x={180} y={y + 4} width={160 * a} height={8} rx={2} fill={C.latte} />
                <rect x={180} y={y + 16} width={110 * a} height={8} rx={2} fill={C.second} />
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Every default has a documented way out. Each vendor's row slides its override switch from default to on.
export function EscapeHatches({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['AWS Glue', 'pin a fixed worker type and count'],
    ['AWS EMR Serverless', 'configure pre-initialized capacity'],
    ['Google Dataproc Serverless', 'the 12-DCU session floor itself'],
    ['Google BigQuery', 'buy baseline slot capacity'],
  ];
  return (
    <Svg label="One vendor's own documented override of its serverless default at a time" h={240}>
      {rows.map(([name, hatch], i) => {
        const d = 0.2 + i * 1.0;
        const y = 22 + i * 52;
        const k = easeOut(seg(t, d, d + 0.35));
        const on = easeInOut(seg(t, d + 0.4, d + 0.8));
        return (
          <g key={name} opacity={k}>
            <T x={25} y={y + 11} s={12} f={C.crema}>
              {name}
            </T>
            <T x={25} y={y + 32} s={11} f={on >= 1 ? C.focus : C.latte}>
              {hatch}
            </T>
            <rect x={520} y={y + 6} width={44} height={20} rx={10} fill={on > 0.5 ? C.focus : 'none'} fillOpacity={0.35} stroke={on > 0.5 ? C.focus : C.mocha} strokeWidth={1.5} />
            <circle cx={lerp(531, 553, on)} cy={y + 16} r={7} fill={on > 0.5 ? C.focus : C.latte} />
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · The crossing. Provisioned's flat $2.88 line draws across; serverless's line rises from zero through $5.28 at six
// hours. Their crossing drops a marker to the axis: 3.27 hours a day, the same division the code runs.
export function BreakEvenChart({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hx = (h: number) => 70 + h * 62;
  const cy = (c: number) => 200 - c * 26;
  const flat = easeInOut(seg(t, 0.3, 1.2));
  const rise = easeInOut(seg(t, 1.2, 2.4));
  const hEnd = 6.5 * rise;
  const mark = k(2.6);
  return (
    <Svg label="Provisioned's flat line and serverless's rising line crossing at the break-even point" h={250}>
      <line x1={hx(0)} y1={cy(0)} x2={hx(8)} y2={cy(0)} stroke={C.mocha} strokeWidth={1.2} />
      <line x1={hx(0)} y1={cy(0)} x2={hx(0)} y2={cy(6.2)} stroke={C.mocha} strokeWidth={1.2} />
      <T x={hx(8)} y={222} s={11} f={C.latte} a="end">
        hours busy a day
      </T>
      <line x1={hx(0)} y1={cy(2.88)} x2={lerp(hx(0), hx(8), flat)} y2={cy(2.88)} stroke={C.second} strokeWidth={2.5} />
      <T x={hx(8)} y={cy(2.88) + 18} s={11} f={C.second} a="end" o={k(1.0)}>
        provisioned: flat, $2.88 a day
      </T>
      <line x1={hx(0)} y1={cy(0)} x2={hx(hEnd)} y2={cy(0.88 * hEnd)} stroke={C.caramel} strokeWidth={2.5} />
      <T x={hx(0.6)} y={cy(4.6)} s={11} f={C.caramel} o={k(1.6)}>
        serverless: rising
      </T>
      {rise >= 1 && <circle cx={hx(6)} cy={cy(5.28)} r={4} fill={C.cherryText} />}
      {rise >= 1 && (
        <T x={hx(6) - 10} y={cy(5.28) - 8} s={11} f={C.cherryText} a="end">
          six hours: $5.28
        </T>
      )}
      {mark > 0 && (
        <g opacity={mark}>
          <line x1={hx(3.27)} y1={cy(2.88)} x2={hx(3.27)} y2={lerp(cy(2.88), cy(0), mark)} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" />
          <circle cx={hx(3.27)} cy={cy(2.88)} r={5} fill="none" stroke={C.focus} strokeWidth={2} />
        </g>
      )}
      {t > 3.0 && (
        <T x={hx(3.27)} y={222} s={12} f={C.focus} a="middle" o={k(3.0)}>
          3.27 hours a day
        </T>
      )}
      {t > 3.6 && (
        <T x={300} y={244} s={11} f={C.latte} a="middle" o={k(3.6)}>
          flat daily cost ÷ serverless cost per busy hour
        </T>
      )}
    </Svg>
  );
}

// 8 · Two answers to re-runs. Top: Glue keeps its bookmark inside itself; a different engine can't read it. Bottom: the
// table's own snapshot log sits in the table, and any engine that shows up reads where to start.
export function BookmarksVsIncremental({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const reach = easeInOut(seg(t, 1.0, 1.5));
  const any = (i: number) => easeInOut(seg(t, 2.6 + i * 0.3, 3.1 + i * 0.3));
  return (
    <Svg label="Glue's own job bookmarks against a table format's portable incremental-read API" h={250}>
      <T x={25} y={28} s={12} f={C.crema} o={k(0)}>
        Glue job bookmarks
      </T>
      <rect x={25} y={38} width={260} height={56} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <Cell x={40} y={52} w={100} label="Glue job" o={k(0.2)} />
      <Cell x={155} y={52} w={115} label="bookmark" o={k(0.4)} stroke={C.caramel} f={C.caramel} />
      <Cell x={445} y={52} w={130} label="another engine" o={k(0.8)} />
      <line x1={440} y1={66} x2={lerp(440, 300, reach)} y2={66} stroke={C.cherryText} strokeWidth={1.8} opacity={reach > 0 ? 1 : 0} />
      {reach >= 1 && <Cross x={312} y={84} k={k(1.5)} />}
      <T x={25} y={136} s={12} f={C.crema} o={k(2.0)}>
        table format incremental reads
      </T>
      <rect x={25} y={146} width={260} height={56} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(2.0)} />
      {[0, 1, 2, 3].map((j) => (
        <rect key={j} x={45 + j * 30} y={166} width={22} height={16} rx={2} fill={C.second} opacity={k(2.2) * (0.4 + j * 0.2)} />
      ))}
      <T x={175} y={178} s={11} f={C.second} o={k(2.3)}>
        snapshot log
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={440} y1={160 + i * 14} x2={lerp(440, 290, any(i))} y2={160 + i * 14} stroke={C.focus} strokeWidth={1.5} opacity={any(i) > 0 ? 1 : 0} />
          <Pip x={450} y={160 + i * 14} s={9} f={C.focus} o={k(2.4)} />
        </g>
      ))}
      <T x={465} y={178} s={11} f={C.focus} o={k(2.4)}>
        any engine
      </T>
      {t > 3.8 && (
        <T x={300} y={236} s={12} f={C.focus} a="middle" o={k(3.8)}>
          portable beats one vendor's tool, forever
        </T>
      )}
    </Svg>
  );
}

// 9 · Recap: three lines, each beside a small moving picture of its idea.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.7, 0.5 + i * 0.7));
  const items = ['five units, one of them not a billing unit', 'four hidden costs, four documented escape hatches', 'break-even utilisation decides, not a guess'];
  return (
    <Svg label="The three-part recap of this topic's point" h={230}>
      {items.map((l, i) => (
        <T key={l} x={110} y={48 + i * 60} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2, 3, 4].map((j) => (
          <rect key={j} x={25 + j * 13} y={36} width={10} height={14} rx={2} fill={j === 4 ? 'none' : C.second} stroke={C.second} strokeDasharray={j === 4 ? '2 2' : undefined} />
        ))}
      </g>
      <g opacity={k(1)}>
        <rect x={25} y={98} width={44} height={16} rx={8} fill="none" stroke={C.focus} />
        <circle cx={lerp(33, 61, easeInOut(seg(t, 1.0, 1.6)))} cy={106} r={6} fill={C.focus} />
      </g>
      <g opacity={k(2)}>
        <line x1={25} y1={170} x2={90} y2={170} stroke={C.second} strokeWidth={2} />
        <line x1={25} y1={186} x2={lerp(25, 90, easeInOut(seg(t, 1.6, 2.4)))} y2={lerp(186, 150, easeInOut(seg(t, 1.6, 2.4)))} stroke={C.caramel} strokeWidth={2} />
      </g>
    </Svg>
  );
}

// 10 · Prove it. The axis carries the break-even mark at 3.27 hours; the job's marker slides out to four hours. Once
// answered, the side past the line lights as provisioned territory.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const hx = (h: number) => 60 + h * 80;
  const slide = easeInOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="A job running four hours a day against this topic's own break-even line of just over three hours" h={250}>
      <rect x={hx(3.27)} y={50} width={(hx(6) - hx(3.27)) * v} height={40} fill={C.second} opacity={0.25} />
      <line x1={hx(0)} y1={90} x2={hx(6)} y2={90} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={hx(3.27)} y1={44} x2={hx(3.27)} y2={96} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" />
      <T x={hx(3.27)} y={36} s={11} f={C.focus} a="middle">
        break-even: 3.27 hours a day
      </T>
      <Pip x={lerp(hx(0), hx(4), slide)} y={90} s={12} f={answer !== null ? C.second : C.crema} />
      {slide >= 1 && (
        <T x={hx(4)} y={116} s={11} f={C.crema} a="middle">
          this job: four hours a day
        </T>
      )}
      {v > 0 && (
        <T x={hx(4.8)} y={136} s={11} f={C.second} a="middle" o={v}>
          provisioned cheaper
        </T>
      )}
      <AnswerRow y={170} label="cheaper here" answer={answer} value="provisioned" k={easeOut(seg(t, 1.8, 2.2))} />
      <Verdict answer={answer} text="past the line, the flat rate already covers it" y={222} />
    </Svg>
  );
}
