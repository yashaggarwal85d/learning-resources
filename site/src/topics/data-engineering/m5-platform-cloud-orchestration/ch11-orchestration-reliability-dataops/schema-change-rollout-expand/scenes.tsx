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

// Every value here is examples.py's own: the orders fields amount, total_amount and order_id, the schemas orders_v1 and
// orders_v2_expand, the consumers dashboard_revenue, dashboard_finance and dashboard_ops, the laggard's KeyError on
// 'amount', and the dual-write window that closed at tick 2 against its limit of 5.

const CONS = ['dashboard_revenue', 'dashboard_finance', 'dashboard_ops'];

/** The two fields on the left and the three consumers on the right, each consumer's line landing on the field it reads.
 * `to(i)` runs 0 (amount) to 1 (total_amount); `gone` fades amount out; `bad(i)` paints a consumer's line red. */
function Readers({ k, to, gone = 0, bad = () => false, newOn = 1 }: { k: number; to: (i: number) => number; gone?: number; bad?: (i: number) => boolean; newOn?: number }) {
  return (
    <g>
      <Cell x={25} y={80} w={170} h={24} label="amount" o={k * (1 - gone)} stroke={C.caramel} />
      <Hole x={25} y={80} w={170} h={24} o={gone} stroke={C.cherryText} />
      <Cell x={25} y={120} w={170} h={24} label="total_amount" o={k * newOn} stroke={C.focus} />
      {CONS.map((c, i) => {
        const y = 60 + i * 40;
        const m = to(i);
        return (
          <g key={c}>
            <Fan x1={374} y1={y + 12} x2={200} y2={lerp(92, 132, m)} k={k} f={bad(i) ? C.cherryText : m > 0.5 ? C.focus : C.caramel} />
            <Cell x={380} y={y} w={195} h={24} label={c} o={k} stroke={bad(i) ? C.cherryText : C.mocha} />
          </g>
        );
      })}
    </g>
  );
}

// 0 · The amount header flips to total_amount in one deploy. Three dashboards still reading amount lose their lines, and by
// morning they are blank.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const flip = t > 1.0;
  return (
    <Svg label="renamed in one deploy. dashboards went blank." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        orders, one deploy
      </T>
      {!flip && <Cell x={25} y={40} w={200} label="amount" o={k(0)} />}
      {flip && <Cell x={25} y={40} w={200} label="total_amount" o={k(1.0)} stroke={C.second} />}
      {CONS.map((c, i) => {
        const y = 30 + i * 60;
        const cut = k(1.4 + i * 0.2);
        return (
          <g key={c}>
            <line x1={230} y1={54} x2={374} y2={y + 14} stroke={cut > 0 ? C.cherryText : C.caramel} strokeWidth={1.5} strokeDasharray={cut > 0 ? '4 3' : undefined} opacity={k(0.3)} />
            <Cross x={302} y={(54 + y + 14) / 2} k={cut} />
            <Cell x={380} y={y} w={195} label={c} o={k(0.2) * (1 - 0.5 * k(2.2))} stroke={cut > 0 ? C.cherryText : C.mocha} />
          </g>
        );
      })}
      {t > 2.4 && (
        <T x={380} y={226} s={11} f={C.cherryText} o={k(2.4)}>
          blank by morning
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(3.6)}>
          the rename was fine; one step was not
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The deploy marker slides along the day to a quiet hour. Safe now? Once answered, the consumer's line to the
// renamed table still breaks.
export function PredictSingleDeploy({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const slide = easeInOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="can timing alone make a single-deploy rename safe?" h={250}>
      <line x1={25} y1={70} x2={575} y2={70} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <circle cx={lerp(300, 520, slide)} cy={70} r={6} fill={C.caramel} opacity={k(0.1)} />
      <T x={520} y={52} s={11} f={C.caramel} a="middle" o={k(1.2)}>
        a quiet hour
      </T>
      <Cell x={25} y={120} w={200} label="reads amount" o={k(0.2)} stroke={v > 0.5 ? C.cherryText : C.mocha} />
      <Fan x1={230} y1={134} x2={374} y2={134} k={k(0.4)} f={v > 0.5 ? C.cherryText : C.caramel} />
      <Cell x={380} y={120} w={195} label="orders, renamed" o={k(0.3)} />
      <Cross x={302} y={134} k={v} />
      {answer === null && t > 1.0 && (
        <T x={300} y={196} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: it has to be split into phases" y={222} />
    </Svg>
  );
}

// 2 · Expand adds total_amount beside amount. Migrate swings each consumer's line across, one at a time. Contract removes
// amount once nothing reads it.
export function RevealPhases({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const phase = t < 1.2 ? 0 : t < 3.2 ? 1 : 2;
  return (
    <Svg label="expand. migrate. contract." h={250}>
      {['expand', 'migrate', 'contract'].map((p, i) => (
        <T key={p} x={25 + i * 190} y={36} s={12} f={phase === i ? C.focus : C.taupe} o={k(0.1 + i * 0.1)}>
          {p}
        </T>
      ))}
      <Readers k={k(0)} newOn={k(0.5)} to={(i) => easeInOut(seg(t, 1.5 + i * 0.5, 1.9 + i * 0.5))} gone={easeOut(seg(t, 3.4, 3.8))} />
      {t > 3.9 && (
        <T x={25} y={220} s={12} f={C.crema} o={k(3.9)}>
          three separate phases, in order
        </T>
      )}
    </Svg>
  );
}

// 3 · orders_v1 and orders_v2_expand side by side. Old data flows to a new reader: BACKWARD ticks. New data flows to an old
// reader: FORWARD ticks. Both hold, so FULL lights and expand may ship.
export function RevealCompatibilityModes({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="backward. forward. full." h={250}>
      <Cell x={25} y={40} w={170} label="orders_v1" o={k(0)} />
      <T x={25} y={90} s={11} f={C.taupe} o={k(0.2)}>
        order_id, amount
      </T>
      <Cell x={390} y={40} w={185} label="orders_v2_expand" o={k(0.1)} />
      <T x={390} y={90} s={11} f={C.taupe} o={k(0.3)}>
        order_id, amount,
      </T>
      <T x={390} y={110} s={11} f={C.focus} o={k(0.4)}>
        total_amount, defaulted
      </T>
      <Fan x1={200} y1={50} x2={384} y2={50} k={k(1.0)} f={C.second} />
      <Fan x1={384} y1={62} x2={200} y2={62} k={k(2.0)} f={C.second} />
      <T x={25} y={150} s={12} f={C.crema} o={k(1.2)}>
        BACKWARD: new reader, old data
      </T>
      <MiniTick x={320} y={144} k={k(1.5)} />
      <T x={25} y={180} s={12} f={C.crema} o={k(2.2)}>
        FORWARD: old reader, new data
      </T>
      <MiniTick x={320} y={174} k={k(2.5)} />
      {t > 3.4 && (
        <T x={25} y={214} s={12} f={C.focus} o={k(3.4)}>
          FULL: both hold, so expand may ship
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. Expand passed every check; two consumers have moved to total_amount, dashboard_ops still reads amount.
// Contract now? Once answered, amount fades and the laggard's line turns red and is cut.
export function PredictEarlyContract({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="is contracting right after expand just as safe?" h={250}>
      <T x={25} y={40} s={11} f={C.focus} o={k(0)}>
        expand: every check passed
      </T>
      <Readers k={k(0.2)} to={(i) => (i < 2 ? 1 : 0)} gone={v * 0.7} bad={(i) => i === 2 && v > 0.5} />
      <Cross x={287} y={122} k={v} />
      {answer === null && t > 1.0 && (
        <T x={300} y={200} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: one consumer is still on amount" y={222} />
    </Svg>
  );
}

// 5 · Contract runs with dashboard_ops behind. amount disappears; the laggard's line breaks with a real KeyError, and the
// two migrated consumers keep their ticks.
export function RevealPrematureContract({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const gone = easeOut(seg(t, 1.0, 1.4));
  return (
    <Svg label="one consumer still unmigrated. contract runs anyway." h={250}>
      <T x={25} y={40} s={11} f={C.cherryText} o={k(0.6)}>
        contract, too early
      </T>
      <Readers k={k(0)} to={(i) => (i < 2 ? 1 : 0)} gone={gone} bad={(i) => i === 2 && t > 1.6} />
      <Cross x={287} y={122} k={k(1.6)} />
      {t > 2.0 && (
        <T x={380} y={196} s={11} f={C.cherryText} o={k(2.0)}>
          KeyError: 'amount'
        </T>
      )}
      {[0, 1].map((i) => (
        <MiniTick key={i} x={556} y={70 + i * 40} k={k(2.6 + i * 0.15)} />
      ))}
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.8)}>
          only the laggard breaks
        </T>
      )}
    </Svg>
  );
}

// 6 · The producer writes records with both fields, tick by tick. The dual-write window bar runs from tick 0 and closes at
// tick 2, well inside the limit of 5; the next record carries only total_amount.
export function RevealDualWrite({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const X = (tick: number) => 200 + tick * 70;
  const bar = easeInOut(seg(t, 0.6, 2.4));
  return (
    <Svg label="both fields, written at once -- for a measured window." h={250}>
      <Cell x={25} y={40} w={140} label="producer" o={k(0)} />
      {[1, 2, 3].map((tick) => {
        const d = 0.4 + (tick - 1) * 0.9;
        const both = tick <= 2;
        return (
          <g key={tick} opacity={k(d)}>
            {both && <rect x={X(tick) - 8} y={44} width={16} height={10} rx={2} fill={C.caramel} />}
            <rect x={X(tick) - 8} y={60} width={16} height={10} rx={2} fill={C.focus} />
          </g>
        );
      })}
      <T x={25} y={84} s={11} f={C.caramel} o={k(0.5)}>
        amount
      </T>
      <T x={95} y={84} s={11} f={C.focus} o={k(0.5)}>
        total_amount
      </T>
      <line x1={X(0)} y1={120} x2={X(5)} y2={120} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={X(i)} y1={114} x2={X(i)} y2={126} stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
      ))}
      <rect x={X(0)} y={136} width={(X(2) - X(0)) * bar} height={10} rx={3} fill={C.second} />
      <T x={X(0)} y={166} s={11} f={C.second} o={k(0.8)}>
        the dual-write window
      </T>
      <line x1={X(5)} y1={100} x2={X(5)} y2={150} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="3 2" opacity={k(1.4)} />
      <T x={X(5)} y={92} s={11} f={C.caramel} a="middle" o={k(1.4)}>
        at most 5
      </T>
      {t > 3.0 && (
        <T x={X(2)} y={192} s={11} f={C.focus} a="middle" o={k(3.0)}>
          closed at tick 2
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.9)}>
          measured, and it ends
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. The three phases as cards, then the rule that gates expand and the window that ends.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="three phases. one rule. one bounded window." h={250}>
      {['expand', 'migrate', 'contract'].map((p, i) => (
        <Cell key={p} x={lerp(25 + i * 190 - 16, 25 + i * 190, k(0.3 + i * 0.35))} y={40} w={170} label={p} o={k(0.3 + i * 0.35)} stroke={C.focus} />
      ))}
      <Cell x={25} y={100} w={550} label="a compatibility rule decides whether expand ships" o={k(1.8)} />
      <Cell x={25} y={150} w={550} label="a dual-write window with a measured end" o={k(2.6)} stroke={C.second} />
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          never deployed as one breaking change
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The real rollout with dashboard_ops left behind, and contract about to run. Once answered, amount goes,
// the laggard's line breaks with its KeyError, and the other two keep working.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="one consumer, deliberately left behind. what happens?" h={250}>
      <T x={25} y={40} s={11} f={C.taupe} o={k(0)}>
        orders: amount to total_amount
      </T>
      <Readers k={k(0.2)} to={(i) => (i < 2 ? 1 : 0)} gone={v} bad={(i) => i === 2 && v > 0.5} />
      <Cross x={287} y={122} k={v} />
      {v > 0.5 && (
        <T x={380} y={196} s={11} f={C.cherryText} o={v}>
          KeyError: 'amount'
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={200} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="a real error, naming that consumer" y={226} />
    </Svg>
  );
}
