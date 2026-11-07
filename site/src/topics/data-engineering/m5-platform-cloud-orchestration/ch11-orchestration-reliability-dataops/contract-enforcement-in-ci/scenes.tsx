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

// Every value here is examples.py's own: the contract for fct_orders at version 1.2.0, its columns order_id, customer_id,
// amount and order_ts, its rule amount >= 0, its latency target of 1 d and its owner, the rename to cust_id, the
// out-of-band row with order_id 4 and an amount of -5, and the three downstream tables and their three owning teams.

const DOWN = ['rpt_revenue_daily', 'dim_customer_ltv', 'finance_dashboard'];
const OWNERS = ['data-platform-team', 'analytics-team', 'finance-reporting-team'];

// 0 · Hook. The producer's rename, its own tests ticked, fans out to three downstream tables that turn red one by one. Then
// the same rename meets a written contract: rejected in CI, and the three tables go back to safe, ticked.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const reset = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="every test green. three dashboards broke anyway." h={250}>
      <Cell x={25} y={46} w={205} label="customer_id to cust_id" o={k(0)} />
      <MiniTick x={25} y={96} k={k(0.3)} />
      <T x={45} y={104} s={11} f={C.focus} o={k(0.3)}>
        own tests: green
      </T>
      {DOWN.map((d, i) => {
        const br = seg(t, 1.2 + i * 0.3, 1.3 + i * 0.3) > 0 && reset < 0.5;
        const safe = t > 3.6 + i * 0.15;
        return (
          <g key={d}>
            <Fan x1={230} y1={60} x2={400} y2={54 + i * 40} k={k(0.6) * (1 - 0.7 * reset)} f={C.latte} />
            <Cell x={400} y={40 + i * 40} w={175} label={d} o={k(0.6)} stroke={br ? C.cherryText : safe ? C.focus : C.mocha} />
            <Cross x={385} y={54 + i * 40} k={br ? 1 : 0} />
          </g>
        );
      })}
      {t > 1.9 && t < 2.6 && (
        <T x={25} y={132} s={11} f={C.cherryText} o={k(1.9) * (1 - reset)}>
          broken in production, no warning
        </T>
      )}
      <Cell x={25} y={150} w={205} label="against a contract" o={k(2.7)} stroke={C.second} />
      {t > 3.1 && (
        <T x={25} y={206} s={11} f={C.cherryText} o={k(3.1)}>
          rejected in CI, three owners named
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={234} s={12} f={C.crema} o={k(4.1)}>
          caught in minutes, before it ships
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The pipeline's own publish, ticked by write-audit-publish, feeds three readers marked "?". Once answered, the
// readers turn red: nothing protects them unless something promises it.
export function PredictCIProtectsConsumers({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="safe to deploy. safe for who reads it?" h={250}>
      <Cell x={25} y={66} w={175} label="its own publish" o={k(0)} stroke={C.focus} />
      <MiniTick x={210} y={80} k={k(0.3)} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={235} y1={80} x2={400} y2={54 + i * 40} k={k(0.5)} f={C.latte} />
          <Cell x={400} y={40 + i * 40} w={175} label="a reader" o={k(0.6 + i * 0.1)} stroke={v > 0.5 ? C.cherryText : C.mocha} />
        </g>
      ))}
      {answer === null && t > 1.2 && (
        <T x={320} y={180} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="nothing protects them unless promised" y={222} f={C.cherryText} />
    </Svg>
  );
}

// 2 · The contract as code. A file card draws for fct_orders at version 1.2.0, and its four sections slide in one by one:
// schema, quality, slaProperties, team.
export function RevealContractAsCode({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows: [string, string][] = [
    ['schema', 'order_id, customer_id, amount, order_ts'],
    ['quality', 'amount >= 0'],
    ['slaProperties', 'latency, 1 d'],
    ['team', 'finance-platform-team, Owner'],
  ];
  const card = easeInOut(seg(t, 0, 0.5));
  return (
    <Svg label="schema, quality, SLAs, ownership. one file." h={250}>
      <rect x={25} y={24} width={550} height={176} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="1460" strokeDashoffset={1460 * (1 - card)} />
      <T x={45} y={50} s={12} f={C.crema} o={k(0.3)}>
        fct_orders, version 1.2.0
      </T>
      {rows.map(([key, val], i) => {
        const a = k(0.8 + i * 0.6);
        return (
          <g key={key} opacity={a} transform={`translate(${((1 - a) * 12).toFixed(2)} 0)`}>
            <T x={45} y={88 + i * 30} s={11} f={C.second}>
              {key}
            </T>
            <T x={170} y={88 + i * 30} s={11} f={C.latte}>
              {val}
            </T>
          </g>
        );
      })}
      {t > 3.6 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.6)}>
          one versioned file, not four documents
        </T>
      )}
    </Svg>
  );
}

// 3 · The gate. Top: a straight rename is classified breaking_no_path and crossed out, blocked. Bottom: the rename whose new
// column names what it deprecates is classified with a migration path, ticked, let through.
export function RevealBreakingChangeGate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="no path: blocked. expand first: allowed." h={250}>
      <Cell x={25} y={50} w={205} label="customer_id to cust_id" o={k(0)} />
      <Req x1={235} x2={258} y={64} k={k(0.4)} />
      <T x={265} y={69} s={11} f={C.cherryText} o={k(0.8)}>
        breaking_no_path
      </T>
      <Cross x={420} y={64} k={k(1.3)} />
      <T x={440} y={69} s={11} f={C.cherryText} o={k(1.3)}>
        blocked
      </T>
      {t > 1.6 && (
        <T x={265} y={92} s={11} f={C.taupe} o={k(1.6)}>
          before it ever merges
        </T>
      )}
      <Cell x={25} y={134} w={205} label="deprecates customer_id" o={k(2.2)} stroke={C.focus} />
      <Req x1={235} x2={258} y={148} k={k(2.5)} />
      <T x={265} y={153} s={11} f={C.focus} o={k(2.8)}>
        breaking_with_migration_path
      </T>
      <MiniTick x={265} y={170} k={k(3.3)} />
      <T x={285} y={178} s={11} f={C.focus} o={k(3.3)}>
        let through
      </T>
      {t > 4.0 && (
        <T x={25} y={230} s={12} f={C.crema} o={k(4.0)}>
          the gate reads the contract
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. Two ways into fct_orders: a pull request through the CI gate, and an out-of-band job straight in, its gate
// spot marked "?". Once answered, that second path turns red: no PR, so no CI run.
export function PredictGateCatchesEverything({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="caught before the merge. caught every time?" h={250}>
      <Cell x={440} y={95} w={135} label="fct_orders" o={k(0)} />
      <Cell x={25} y={46} w={145} label="pull request" o={k(0.1)} />
      <Req x1={175} x2={215} y={60} k={k(0.3)} />
      <Cell x={220} y={46} w={100} label="CI gate" o={k(0.4)} stroke={C.focus} />
      <Fan x1={320} y1={60} x2={440} y2={104} k={k(0.6)} f={C.focus} />
      <Cell x={25} y={150} w={145} label="out-of-band job" o={k(0.8)} stroke={v > 0.5 ? C.cherryText : C.mocha} />
      <Fan x1={170} y1={164} x2={440} y2={116} k={k(1.0)} f={v > 0.5 ? C.cherryText : C.latte} />
      {answer === null && t > 1.4 && (
        <T x={270} y={180} s={15} f={C.taupe} a="middle" o={k(1.4)}>
          ?
        </T>
      )}
      {answer !== null && (
        <T x={220} y={196} s={11} f={C.cherryText} o={v}>
          no pull request, no CI run
        </T>
      )}
      <Verdict answer={answer} text="a write that skips CI still needs a check" y={234} />
    </Svg>
  );
}

// 5 · Runtime enforcement. An out-of-band job's two rows reach the contract checked at write time: order_id 3 passes into
// fct_orders with a tick; order_id 4 is crossed out and its two violations spell out beside it.
export function RevealRuntimeEnforcement({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="never went through CI. caught anyway." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        an out-of-band job: no pull request
      </T>
      <Cell x={25} y={50} w={130} label="order_id 3" o={k(0.2)} />
      <Cell x={25} y={110} w={130} label="order_id 4" o={k(0.3)} stroke={t > 2.2 ? C.cherryText : C.mocha} />
      <Req x1={160} x2={290} y={64} k={k(0.6)} />
      <Req x1={160} x2={290} y={124} k={k(0.7)} f={t > 2.2 ? C.cherryText : C.crema} />
      <line x1={300} y1={44} x2={300} y2={150} stroke={C.second} strokeWidth={2} opacity={k(0.9)} />
      <T x={300} y={168} s={11} f={C.second} a="middle" o={k(0.9)}>
        contract, at write
      </T>
      <Cell x={440} y={50} w={135} label="fct_orders" o={k(0.4)} />
      <Fan x1={305} y1={64} x2={436} y2={64} k={k(1.5)} f={C.focus} />
      <MiniTick x={360} y={84} k={k(1.9)} />
      <Cross x={300} y={124} k={k(2.2)} />
      <T x={320} y={120} s={11} f={C.cherryText} o={k(2.5)}>
        missing customer_id
      </T>
      <T x={320} y={144} s={11} f={C.cherryText} o={k(2.9)}>
        amount -5, below 0
      </T>
      {t > 3.4 && (
        <T x={25} y={202} s={11} f={C.taupe} o={k(3.4)}>
          no CI gate ever saw this write
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(4.0)}>
          the same contract, checked when it lands
        </T>
      )}
    </Svg>
  );
}

// 6 · Lineage notification. An approved change to fct_orders fans out to its three downstream tables, and each fans on to
// its owning team, who light up as they are notified.
export function RevealLineageNotification({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="one change. three owners found." h={250}>
      <Cell x={25} y={95} w={120} label="fct_orders" o={k(0)} stroke={C.focus} />
      <MiniTick x={80} y={140} k={k(0.2)} />
      <T x={25} y={162} s={11} f={C.focus} o={k(0.2)}>
        approved
      </T>
      {DOWN.map((d, i) => (
        <g key={d}>
          <Fan x1={145} y1={109} x2={205} y2={54 + i * 55} k={k(0.5 + i * 0.25)} f={C.latte} />
          <Cell x={205} y={40 + i * 55} w={165} label={d} o={k(0.6 + i * 0.25)} />
          <Fan x1={370} y1={54 + i * 55} x2={388} y2={54 + i * 55} k={k(1.7 + i * 0.4)} f={C.focus} />
          <T x={395} y={58 + i * 55} s={11} f={t > 2.2 + i * 0.4 ? C.focus : C.latte} o={k(1.7 + i * 0.4)}>
            {OWNERS[i]}
          </T>
        </g>
      ))}
      {t > 3.3 && (
        <T x={25} y={212} s={11} f={C.taupe} o={k(3.3)}>
          found by the lineage graph
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(3.9)}>
          every owner notified, unasked
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in, one per mechanism.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['a contract as code', 'a producer-side CI gate', 'a check at write time', 'lineage tells owners'];
  return (
    <Svg label="four mechanisms. one closed gap." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.7;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          no change its own promises reject
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The same rename, twice, at the same gate: once with no migration path, once through expand first. Once
// answered, the first is crossed out at the gate and the second runs on through with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const b = answer !== null ? easeOut(seg(s, 0.4, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="one rename blocked. one rename allowed." h={250}>
      <Cell x={25} y={60} w={180} label="no migration path" o={k(0)} />
      <Cell x={25} y={130} w={180} label="expand first" o={k(0.2)} />
      <Req x1={210} x2={290} y={74} k={k(0.4)} />
      <Req x1={210} x2={290} y={144} k={k(0.5)} />
      <line x1={302} y1={50} x2={302} y2={170} stroke={C.second} strokeWidth={2} opacity={k(0.3)} />
      <T x={302} y={40} s={11} f={C.second} a="middle" o={k(0.3)}>
        CI gate
      </T>
      {answer === null && t > 1.2 && (
        <T x={420} y={112} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Cross x={302} y={74} k={a} />
      <Fan x1={312} y1={144} x2={520} y2={144} k={b} f={C.focus} />
      <MiniTick x={535} y={140} k={b} />
      <Verdict answer={answer} text="only the no-path rename is blocked" y={222} />
    </Svg>
  );
}
