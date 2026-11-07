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
function Coin({ x, y, k, f = C.caramel }: { x: number; y: number; k: number; f?: string }) {
  return <circle cx={x} cy={y} r={5 * k} fill="none" stroke={f} strokeWidth={2} opacity={k} />;
}

// Every behaviour here traces to each vendor's own documentation (SOURCES.md); every number is examples.py's own literal
// or assert: the 50 TiB runaway against a 10 TiB cap, the 1000-credit quota, the job preempted at unit 47, the 60%
// break-even, the 20% cost budget.

// 0 · No cap: the query's scan bar runs the whole table while the bill's coins pile up behind it. Then the same query with
// a cap: it hits the wall at once, bounces, and nothing is charged.
export function RunawayQueryHook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const scan = easeInOut(seg(t, 0.4, 2.0));
  const hit = easeOut(seg(t, 2.8, 3.1));
  const bounce = easeOut(seg(t, 3.1, 3.4));
  return (
    <Svg label="A query with no limit and no filter, unguarded then guarded" h={250}>
      <Cell x={25} y={40} w={160} label="no filter, no cap" o={k(0)} />
      <rect x={190} y={46} width={385} height={16} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.1)} />
      <rect x={190} y={46} width={385 * scan} height={16} rx={2} fill={C.second} />
      {t > 2.0 && (
        <T x={575} y={36} s={11} f={C.second} a="end" o={k(2.0)}>
          the whole table, 50 TiB
        </T>
      )}
      {Array.from({ length: 10 }, (_, j) => (
        <Coin key={j} x={200 + j * 22} y={92} k={easeOutBack(seg(t, 0.6 + j * 0.15, 0.9 + j * 0.15))} f={C.cherryText} />
      ))}
      {t > 2.2 && (
        <T x={430} y={96} s={11} f={C.cherryText} o={k(2.2)}>
          nothing stops it
        </T>
      )}
      <Cell x={25} y={150} w={150} label="same query" o={k(2.4)} />
      <rect x={258} y={136} width={8} height={56} rx={2} fill={C.caramel} opacity={k(2.5)} />
      {t > 2.6 && (
        <T x={270} y={130} s={11} f={C.caramel} o={k(2.6)}>
          cap: 10 TiB
        </T>
      )}
      <Req x1={180} x2={250} y={164} k={hit} back={bounce} f={C.cherryText} />
      <Cross x={290} y={164} k={k(3.3)} />
      {t > 3.6 && (
        <T x={310} y={169} s={13} f={C.focus} o={k(3.6)}>
          fails at once: $0
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(4.1)}>
          stopped before the bill, not after it
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Four controls in a row above a timeline split by the moment money is spent. Once answered, the guardrail
// drops to the side before the spend; the other three stay, reporting after it.
export function PredictStopsVsFlags({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const down = answer !== null ? easeInOut(seg(s, 0.1, 0.5)) : 0;
  const left = answer !== null ? easeInOut(seg(s, 0.5, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const chips = ['tag', 'alert', 'guardrail', 'dashboard'];
  return (
    <Svg label="A tag, an alert, and a guardrail — which one actually stops the money?" h={250}>
      {chips.map((c, i) => {
        const g = i === 2;
        const x = g ? lerp(305, 90, left) : 25 + i * 140;
        const y = g ? lerp(40, 136, down) : 40;
        return (
          <Cell key={c} x={x} y={y} w={120} label={c} o={k(i * 0.15) * (!g && down > 0 ? 1 - 0.4 * down : 1)} stroke={g && left >= 1 ? C.focus : C.mocha} f={g && left >= 1 ? C.focus : C.crema} />
        );
      })}
      <line x1={25} y1={196} x2={575} y2={196} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.5)} />
      <line x1={300} y1={96} x2={300} y2={204} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(0.6)} />
      <T x={25} y={216} s={11} f={C.taupe} o={k(0.7)}>
        before the spend
      </T>
      <T x={575} y={216} s={11} f={C.taupe} a="end" o={k(0.7)}>
        after the spend
      </T>
      {left >= 1 && (
        <T x={440} y={112} s={11} f={C.taupe} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
          the rest only report
        </T>
      )}
      <Verdict answer={answer} text="only the guardrail refuses" y={244} />
    </Svg>
  );
}

// 2 · The estimate runs first: a 50 TiB bar against a 10 TiB cap line. It fails, $0, and the table's bytes stay unread.
// Then a 5 TiB estimate fits under the cap, a sliver of the table is read, and it runs for $31.25.
export function MaxBytesBilled({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const est = easeOut(seg(t, 0.5, 1.2));
  const est2 = easeOut(seg(t, 2.8, 3.2));
  const read = easeOut(seg(t, 3.4, 3.8));
  const px = 300 / 50;
  return (
    <Svg label="A byte estimate checked before execution, blocking the query before any charge" h={250}>
      <Cell x={25} y={36} w={150} label="estimate first" o={k(0)} />
      <rect x={200} y={42} width={50 * px * est} height={16} rx={2} fill={C.cherryText} opacity={est > 0 ? 1 : 0} />
      {t > 1.2 && (
        <T x={508} y={55} s={11} f={C.cherryText} o={k(1.2)}>
          50 TiB
        </T>
      )}
      <line x1={260} y1={30} x2={260} y2={68} stroke={C.caramel} strokeWidth={2} opacity={k(0.3)} />
      <T x={260} y={22} s={11} f={C.caramel} a="middle" o={k(0.3)}>
        cap: 10 TiB
      </T>
      {t > 1.6 && (
        <T x={200} y={92} s={12} f={C.focus} o={k(1.6)}>
          fails before reading: $0 charged
        </T>
      )}
      <T x={25} y={134} s={11} f={C.taupe} o={k(0.1)}>
        the table
      </T>
      {Array.from({ length: 10 }, (_, j) => (
        <Pip key={j} x={210 + j * 28} y={130} s={14} f={j === 0 && read > 0.5 ? C.second : C.mocha} o={k(0.1)} />
      ))}
      {t > 2.1 && t < 3.4 && (
        <T x={485} y={134} s={11} f={C.taupe} o={k(2.1)}>
          untouched
        </T>
      )}
      <Cell x={25} y={170} w={150} label="guarded query" o={k(2.5)} />
      <rect x={200} y={176} width={5 * px * est2} height={16} rx={2} fill={C.second} opacity={est2 > 0 ? 1 : 0} />
      <line x1={260} y1={166} x2={260} y2={202} stroke={C.caramel} strokeWidth={2} opacity={k(2.5)} />
      <MiniTick x={236} y={160} k={k(3.2)} />
      {t > 3.6 && (
        <T x={272} y={189} s={12} f={C.second} o={k(3.6)}>
          5 TiB fits, runs: $31.25
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={236} s={11} f={C.crema} o={k(4.1)}>
          checked before a single byte is read
        </T>
      )}
    </Svg>
  );
}

// 3 · Top lane, time: the warehouse runs, billing ticks every second, it goes idle and auto-suspends, and the ticks stop.
// Bottom lane, spend: 700 warehouse credits and 300 cloud-services credits stack up to the 1000 quota, and it locks.
export function WarehouseAndMonitor({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = clamp(seg(t, 0.3, 2.0));
  const xr = lerp(25, 400, run);
  const a = easeOut(seg(t, 2.4, 3.0));
  const b = easeOut(seg(t, 3.0, 3.4));
  const qx = 25 + 400;
  return (
    <Svg label="An idle warehouse auto-suspending, and a resource monitor acting at a credit threshold" h={250}>
      <T x={25} y={24} s={11} f={C.taupe} o={k(0)}>
        auto-suspend reacts to time
      </T>
      <line x1={25} y1={50} x2={Math.min(xr, 200)} y2={50} stroke={C.second} strokeWidth={3} />
      {xr > 200 && <line x1={200} y1={50} x2={Math.min(xr, 300)} y2={50} stroke={C.mocha} strokeWidth={2} strokeDasharray="4 3" />}
      {Array.from({ length: 23 }, (_, j) => {
        const x = 31 + j * 12;
        return x < Math.min(xr, 300) ? <line key={j} x1={x} y1={60} x2={x} y2={68} stroke={C.caramel} strokeWidth={1.5} /> : null;
      })}
      {t > 0.9 && (
        <T x={60} y={86} s={11} f={C.second} o={k(0.9)}>
          busy
        </T>
      )}
      {t > 1.4 && (
        <T x={220} y={86} s={11} f={C.taupe} o={k(1.4)}>
          idle
        </T>
      )}
      <rect x={302} y={40} width={4} height={20} fill={C.focus} opacity={k(1.6)} />
      <rect x={310} y={40} width={4} height={20} fill={C.focus} opacity={k(1.6)} />
      {t > 1.8 && (
        <T x={324} y={55} s={12} f={C.focus} o={k(1.8)}>
          suspended: billing stops
        </T>
      )}
      <T x={25} y={124} s={11} f={C.taupe} o={k(2.2)}>
        a resource monitor reacts to spend
      </T>
      <rect x={25} y={140} width={280 * a} height={18} rx={2} fill={C.second} opacity={a > 0 ? 1 : 0} />
      <rect x={305} y={140} width={120 * b} height={18} rx={2} fill={C.caramel} opacity={b > 0 ? 1 : 0} />
      <line x1={qx} y1={130} x2={qx} y2={168} stroke={C.cherryText} strokeWidth={2} opacity={k(2.3)} />
      <T x={qx + 10} y={136} s={11} f={C.cherryText} o={k(2.3)}>
        quota: 1000
      </T>
      {t > 2.8 && (
        <T x={25} y={180} s={11} f={C.second} o={k(2.8)}>
          700 warehouse
        </T>
      )}
      {t > 3.3 && (
        <T x={305} y={180} s={11} f={C.caramel} o={k(3.3)}>
          300 services
        </T>
      )}
      <Lock x={qx + 14} y={150} k={k(3.6)} f={C.cherryText} />
      {t > 4.0 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(4.0)}>
          both act on their own; neither only alerts
        </T>
      )}
    </Svg>
  );
}

// 4 · Coins flow from the job to the bill, each carrying a budget tag. In the bill they land under the right budget. But
// the place a gate would stand is empty: the tag stops nothing.
export function TaggingNotCapping({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A budget policy's tag attached to spend that happens regardless" h={250}>
      <Cell x={25} y={70} w={130} label="serverless job" o={k(0)} />
      <rect x={430} y={50} width={145} height={70} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.1)} />
      <T x={442} y={68} s={11} f={C.taupe} o={k(0.1)}>
        the bill
      </T>
      {[0, 1, 2, 3, 4].map((j) => {
        const m = easeInOut(seg(t, 0.4 + j * 0.3, 1.2 + j * 0.3));
        if (m <= 0) return null;
        const x = lerp(170, 455 + j * 24, m);
        const y = lerp(84, 98, m);
        return (
          <g key={j}>
            <Coin x={x} y={y} k={1} />
            <rect x={x + 4} y={y - 12} width={8} height={6} rx={1} fill={C.focus} />
          </g>
        );
      })}
      {t > 2.7 && (
        <T x={575} y={146} s={11} f={C.focus} a="end" o={k(2.7)}>
          the right budget, later
        </T>
      )}
      <MiniTick x={560} y={56} k={k(2.9)} />
      <Hole x={290} y={56} w={20} h={60} o={k(3.1)} stroke={C.cherryText} />
      {t > 3.3 && (
        <T x={300} y={146} s={11} f={C.cherryText} a="middle" o={k(3.3)}>
          no gate here
        </T>
      )}
      {t > 3.7 && (
        <T x={300} y={210} s={12} f={C.crema} a="middle" o={k(3.7)}>
          a label on the spend, not a stop
        </T>
      )}
    </Svg>
  );
}

// 5 · A preemptible job's progress bar runs toward unit 100, a checkpoint every 10. At unit 47 the instance is taken. Only
// the stretch back to checkpoint 40 is redone, 7 units; without checkpoints all 47 would be. Then it resumes.
export function PreemptionCheckpoint({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const u = 5;
  const x0 = 50;
  const run = easeInOut(seg(t, 0.4, 2.0));
  const resume = easeInOut(seg(t, 3.6, 4.6));
  const hit = t > 2.0;
  return (
    <Svg label="A preemption mid-job, and a checkpoint limiting how much work is actually lost" h={250}>
      <T x={25} y={24} s={11} f={C.taupe} o={k(0)}>
        preemptible: a fraction of the price, taken at any time
      </T>
      <rect x={x0} y={60} width={100 * u} height={18} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.1)} />
      {Array.from({ length: 9 }, (_, j) => (
        <line key={j} x1={x0 + (j + 1) * 10 * u} y1={54} x2={x0 + (j + 1) * 10 * u} y2={84} stroke={C.mocha} strokeWidth={1} opacity={k(0.2)} />
      ))}
      <rect x={x0} y={60} width={47 * u * run} height={18} rx={2} fill={C.second} />
      {hit && <rect x={x0 + 40 * u} y={60} width={7 * u} height={18} fill={C.cherryText} />}
      {resume > 0 && <rect x={x0 + 40 * u} y={60} width={60 * u * resume} height={18} rx={2} fill={C.focus} />}
      {hit && <path d={`M${x0 + 47 * u + 4} 30 l-8 14 h7 l-4 12 l11 -16 h-7 l4 -10 z`} fill={C.cherryText} opacity={k(2.0)} />}
      {t > 2.2 && (
        <T x={x0 + 47 * u + 14} y={44} s={11} f={C.cherryText} o={k(2.2)}>
          preempted at 47
        </T>
      )}
      {t > 2.5 && (
        <T x={x0 + 40 * u} y={104} s={11} f={C.second} a="middle" o={k(2.5)}>
          checkpoint 40
        </T>
      )}
      {t > 2.8 && (
        <T x={x0 + 40 * u + 60} y={128} s={12} f={C.cherryText} o={k(2.8)}>
          redone: 7 units
        </T>
      )}
      <rect x={x0} y={160} width={47 * u * easeOut(seg(t, 3.0, 3.4))} height={14} rx={2} fill={C.cherryText} opacity={t > 3.0 ? 0.85 : 0} />
      {t > 3.4 && (
        <T x={x0 + 47 * u + 12} y={172} s={11} f={C.cherryText} o={k(3.4)}>
          no checkpoints: all 47 redone
        </T>
      )}
      {t > 4.6 && (
        <T x={25} y={226} s={12} f={C.focus} o={k(4.6)}>
          resumed from 40, not from zero
        </T>
      )}
    </Svg>
  );
}

// 6 · Cost against utilization over a 730-hour term. On demand at $1.00 an hour climbs from zero; the commitment at $0.60
// an hour sits flat at $438. They cross at 60%: below it on demand was cheaper, above it the commitment wins.
export function CommitmentBreakeven({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ux = (p: number) => 60 + p * 4.8;
  const cy = (usd: number) => 210 - (usd / 730) * 160;
  const od = easeInOut(seg(t, 0.4, 1.5));
  const cm = easeInOut(seg(t, 1.5, 2.2));
  return (
    <Svg label="A committed discount that only wins above its own break-even utilization" h={250}>
      <T x={25} y={24} s={11} f={C.taupe} o={k(0)}>
        on demand $1.00/h, committed $0.60/h
      </T>
      <T x={575} y={24} s={11} f={C.taupe} a="end" o={k(0)}>
        a 730-hour term
      </T>
      <line x1={60} y1={210} x2={540} y2={210} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.1)} />
      <T x={540} y={228} s={11} f={C.taupe} a="end" o={k(0.1)}>
        utilization
      </T>
      <line x1={ux(0)} y1={cy(0)} x2={lerp(ux(0), ux(100), od)} y2={lerp(cy(0), cy(730), od)} stroke={C.second} strokeWidth={2.5} />
      <line x1={ux(0)} y1={cy(438)} x2={lerp(ux(0), ux(100), cm)} y2={cy(438)} stroke={C.caramel} strokeWidth={2.5} />
      {t > 2.2 && (
        <T x={540} y={cy(438) + 20} s={11} f={C.caramel} a="end" o={k(2.2)}>
          committed: $438
        </T>
      )}
      <circle cx={ux(60)} cy={cy(438)} r={6 * easeOutBack(seg(t, 2.5, 2.9))} fill={C.crema} />
      <line x1={ux(60)} y1={cy(438)} x2={ux(60)} y2={lerp(cy(438), 210, k(2.8))} stroke={C.crema} strokeWidth={1} strokeDasharray="3 3" />
      {t > 2.9 && (
        <T x={ux(60)} y={244} s={12} f={C.crema} a="middle" o={k(2.9)}>
          break-even: 60%
        </T>
      )}
      {t > 3.4 && (
        <T x={70} y={96} s={11} f={C.second} o={k(3.4)}>
          below it, on demand was cheaper
        </T>
      )}
      {t > 3.9 && (
        <T x={ux(60) + 14} y={190} s={11} f={C.caramel} o={k(3.9)}>
          above: commitment wins
        </T>
      )}
    </Svg>
  );
}

// 7 · Three CI runs against a +20% cost budget line: the baseline at $100, a run at $110 passes, a run at $135 crosses the
// line and the build goes red, exactly like a failed test.
export function CostRegressionGate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const bx = (usd: number) => 160 + (usd / 135) * 280;
  const runs = [
    { label: 'baseline: $100', v: 100, ok: true, d: 0.2 },
    { label: 'run: $110, +10%', v: 110, ok: true, d: 1.0 },
    { label: 'run: $135, +35%', v: 135, ok: false, d: 1.8 },
  ];
  return (
    <Svg label="A pipeline's cost crossing a stated budget, turning a green CI run red" h={250}>
      <line x1={bx(120)} y1={36} x2={bx(120)} y2={176} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(0)} />
      <T x={bx(120)} y={28} s={11} f={C.caramel} a="middle" o={k(0)}>
        budget: +20%
      </T>
      {runs.map((r, i) => {
        const y = 50 + i * 46;
        const g = easeOut(seg(t, r.d, r.d + 0.5));
        const res = k(r.d + 0.6);
        return (
          <g key={r.label}>
            <T x={25} y={y + 13} s={11} f={C.crema} o={k(r.d)}>
              {r.label}
            </T>
            <rect x={160} y={y} width={(bx(r.v) - 160) * g} height={18} rx={2} fill={r.ok ? C.second : C.cherryText} opacity={g > 0 ? 1 : 0} />
            {t > r.d + 0.6 && <Cell x={480} y={y - 5} w={95} label={r.ok ? 'passes' : 'fails'} o={res} stroke={r.ok ? C.focus : C.cherryText} f={r.ok ? C.focus : C.cherryText} />}
          </g>
        );
      })}
      {t > 2.9 && (
        <T x={25} y={214} s={12} f={C.cherryText} o={k(2.9)}>
          the build goes red, like a failed test
        </T>
      )}
      {t > 3.5 && (
        <T x={25} y={238} s={11} f={C.taupe} o={k(3.5)}>
          nobody waits days for the invoice
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Two bins, blocks and labels. The byte cap and the monitor drop into blocks; the tag drops into labels. Below
// them the discount, flexibility traded for price, and the cost gate, the bill failing a build.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const chips = [
    { x: 40, label: 'byte cap', d: 0.4 },
    { x: 160, label: 'monitor', d: 0.9 },
    { x: 330, label: 'tag', d: 1.4 },
  ];
  return (
    <Svg label="The three-part recap of this topic's point" h={250}>
      <Hole x={25} y={50} w={260} h={60} o={k(0)} stroke={C.focus} />
      <T x={25} y={40} s={12} f={C.focus} o={k(0)}>
        blocks
      </T>
      <Hole x={315} y={50} w={260} h={60} o={k(0.1)} stroke={C.caramel} />
      <T x={315} y={40} s={12} f={C.caramel} o={k(0.1)}>
        only labels
      </T>
      {chips.map((c) => {
        const drop = easeOutBack(seg(t, c.d, c.d + 0.4));
        return drop > 0 ? <Cell key={c.label} x={c.x} y={lerp(44, 66, drop)} w={110} label={c.label} o={clamp(drop * 2)} /> : null;
      })}
      <Cell x={25} y={140} w={260} label="discount for flexibility" o={k(2.2)} />
      <Cell x={315} y={140} w={260} label="the bill fails a build" o={k(2.8)} stroke={C.cherryText} />
      {t > 3.5 && (
        <T x={300} y={214} s={13} f={C.crema} a="middle" o={k(3.5)}>
          mixing up blocks and labels is the risk
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. An overnight query, four candidate changes and the charge. Once answered, only the byte cap stands
// between them; it refuses the query before the charge, and the other three dim.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const opts = ['budget tag', 'byte cap', 'preemptible', 'dashboard'];
  return (
    <Svg label="An unattended overnight job, no cap configured, picking what would have actually stopped it" h={250}>
      <Cell x={25} y={94} w={160} label="overnight query" o={k(0)} stroke={C.cherryText} f={C.cherryText} />
      {opts.map((m, i) => {
        const cap = i === 1;
        return (
          <Cell
            key={m}
            x={215}
            y={34 + i * 40}
            w={160}
            label={m}
            o={k(0.3 + i * 0.15) * (v > 0 && !cap ? 1 - 0.5 * v : 1)}
            stroke={cap && v > 0.5 ? C.focus : C.mocha}
            f={cap && v > 0.5 ? C.focus : C.crema}
          />
        );
      })}
      <Cell x={445} y={94} w={130} label="the charge" o={k(1.0)} />
      <Fan x1={190} y1={106} x2={210} y2={88} k={v} f={C.focus} />
      <Cross x={410} y={88} k={v} />
      {v > 0.5 && (
        <T x={215} y={208} s={11} f={C.taupe} o={v}>
          the rest report, or reprice
        </T>
      )}
      <Verdict answer={answer} text="the cap runs before the charge" y={238} />
    </Svg>
  );
}
