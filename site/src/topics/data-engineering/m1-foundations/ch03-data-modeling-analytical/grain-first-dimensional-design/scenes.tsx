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

/** A table row of cells: `cells` are [width, label, colour] left to right from x. */
function Cells({ x, y, cells, o = 1, h = 26 }: { x: number; y: number; cells: [number, string, string][]; o?: number; h?: number }) {
  let cx = x;
  return (
    <g opacity={o}>
      {cells.map(([w, l, f], i) => {
        const x0 = cx;
        cx += w + 4;
        return (
          <g key={i}>
            <rect x={x0} y={y} width={w} height={h} rx={3} fill={C.cocoa} stroke={f} />
            <T x={x0 + w / 2} y={y + h / 2 + 4.5} s={11} f={f === C.mocha ? C.crema : f} a="middle">
              {l}
            </T>
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. The same order kept two ways: one row for the whole order, or one row per line. Asked which product sold,
// the order row can only answer with a question mark; the line rows light up their product cells.
export function Hook({ t }: StepCtx) {
  const q = easeOut(seg(t, 2.6, 3.0));
  const lit = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="one row per order vs. one row per line" h={250}>
      <T x={25} y={36} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        one row per order
      </T>
      <Cells
        x={25}
        y={50}
        cells={[
          [120, 'order', C.mocha],
          [126, '70.00', C.mocha],
        ]}
        o={easeOut(seg(t, 0.3, 0.7))}
      />
      <T x={150} y={lerp(112, 106, q)} s={16} f={C.cherryText} a="middle" o={q}>
        which product? ?
      </T>
      <T x={315} y={36} s={13} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        one row per line
      </T>
      {[0, 1].map((i) => (
        <Cells
          key={i}
          x={315}
          y={50 + i * 32}
          cells={[
            [60, 'line', C.mocha],
            [100, 'product', lit > 0 ? C.focus : C.mocha],
            [90, i === 0 ? '40.00' : '30.00', C.mocha],
          ]}
          o={easeOut(seg(t, 1.1 + i * 0.2, 1.5 + i * 0.2))}
        />
      ))}
      <Row y={180} label="order grain" value="can't answer a line question" k={easeOut(seg(t, 3.2, 3.7))} />
      <Row y={225} label="line grain" value="answers it directly" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 2 · Four decisions, in order. Each lands in turn; the second, the grain, is the one that's marked.
export function RevealFourSteps({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['first', 'the business process'],
    ['second', 'the grain'],
    ['third', 'the dimensions'],
    ['fourth', 'the facts'],
  ];
  const mark = easeOut(seg(t, 3.6, 4.1));
  return (
    <Svg label="process, grain, dimensions, facts — in order" h={260}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={45 + i * 55} label={label} value={value} valueColor={i === 1 && mark > 0 ? C.focus : C.crema} k={easeOut(seg(t, 0.8 + i * 0.7, 1.3 + i * 0.7))} />
      ))}
      <rect x={575 - 100 * mark} y={112} width={100 * mark} height={3} fill={C.focus} />
    </Svg>
  );
}

// 3 · Binding. The grain lands first; then dimensions, facts and queries each draw a line back up to it.
export function RevealGrainIsBinding({ t }: StepCtx) {
  const g = easeOutBack(seg(t, 0.6, 1.0));
  const kids = ['dimensions', 'facts', 'queries'];
  return (
    <Svg label="declared once, binding on everything after" h={230}>
      <Row y={40} label="grain" value="what one row represents" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="once declared" value="binding on the rest" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <g opacity={clamp(g)}>
        <rect x={225} y={110} width={150} height={32} rx={6} fill={C.cocoa} stroke={C.focus} strokeWidth={2} />
        <T x={300} y={131} s={13} f={C.focus} a="middle">
          grain
        </T>
      </g>
      {kids.map((l, i) => {
        const a = easeInOut(seg(t, 2.2 + i * 0.35, 2.7 + i * 0.35));
        const x = 25 + i * 190;
        return (
          <g key={l}>
            <line x1={300} y1={142} x2={lerp(300, x + 85, a)} y2={lerp(142, 180, a)} stroke={C.focus} strokeWidth={1.5} />
            <g opacity={a}>
              <rect x={x} y={180} width={170} height={30} rx={5} fill={C.cocoa} stroke={C.mocha} />
              <T x={x + 85} y={200} s={12} f={C.crema} a="middle">
                {l}
              </T>
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Predict: order or line? An order holding two lines; then the question.
export function PredictGrainChoice({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="order-line process — grain at order, or at line?" h={210}>
      <Row y={40} label="order-line process" value="order, or line?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={150} y={58} width={300} height={56} rx={6} fill="none" stroke={C.mocha} opacity={k} />
      {[0, 1].map((i) => (
        <rect key={i} x={160} y={65 + i * 22} width={280} height={18} rx={3} fill={C.mocha} opacity={easeOut(seg(t, 0.6 + i * 0.2, 0.9 + i * 0.2))} />
      ))}
      <AnswerRow y={150} label="one row per" answer={answer} value="order line" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="the most basic unit the process produces" y={192} />
    </Svg>
  );
}

// 5 · Atomic grain, proven. Two line totals, 40.00 and 30.00, slide end to end into exactly the order's 70.00.
export function RevealAtomicGrain({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.4, 2.4));
  const tot = easeOut(seg(t, 2.4, 2.8));
  const sc = 400 / 70;
  return (
    <Svg label="line totals, summed, reproduce the order total exactly" h={250}>
      <Row y={40} label="lines, by region" value="sums to the order total" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="lines, rolled up" value="sums to the order total" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <rect x={25} y={lerp(120, 180, m)} width={40 * sc} height={24} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={2} />
        <T x={35} y={lerp(137, 197, m)} s={12} f={C.crema}>
          40.00
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.7, 1.1))}>
        <rect x={lerp(25, 25 + 40 * sc, m)} y={lerp(150, 180, m)} width={30 * sc} height={24} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={2} />
        <T x={lerp(35, 35 + 40 * sc, m)} y={lerp(167, 197, m)} s={12} f={C.crema}>
          30.00
        </T>
      </g>
      <T x={440} y={197} s={14} f={C.focus} o={tot}>
        = 70.00
      </T>
      <T x={300} y={lerp(240, 234, tot)} s={12} f={C.latte} a="middle" o={tot}>
        exactly the order total
      </T>
      <Tick y={182} k={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}

// 6 · What the coarse grain costs. The order-level table's columns; the product column it never had shows up as an
// empty, dashed slot; a line question runs into it and bounces.
export function RevealCoarseGrainLoses({ t }: StepCtx) {
  const slot = easeOut(seg(t, 1.6, 2.1));
  const q = seg(t, 2.6, 3.6);
  const qx = q < 0.6 ? lerp(300, 430, easeOut(q / 0.6)) : lerp(430, 380, easeOut((q - 0.6) / 0.4));
  return (
    <Svg label="no line columns exist, at all" h={230}>
      <Row y={40} label="order-level table" value="no product column" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a line question" value="structurally unanswerable" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      {[0, 1, 2].map((r) => (
        <Cells
          key={r}
          x={25}
          y={120 + r * 30}
          cells={[
            [130, r === 0 ? 'order_id' : '', C.mocha],
            [130, r === 0 ? 'region' : '', C.mocha],
            [130, r === 0 ? 'order_total' : '', C.mocha],
          ]}
          o={easeOut(seg(t, 0.4 + r * 0.15, 0.8 + r * 0.15))}
        />
      ))}
      <rect x={445} y={120} width={130} height={86} rx={3} fill="none" stroke={C.cherryText} strokeDasharray="5 4" opacity={slot} />
      <T x={510} y={137} s={11} f={C.cherryText} a="middle" o={slot}>
        product?
      </T>
      {q > 0 && q < 1 && <circle cx={qx} cy={175} r={6} fill={C.cherryText} />}
    </Svg>
  );
}

// 7 · Additive. The line totals stack to 70.00 grouped by region, then again grouped by order: correct both ways.
export function RevealAdditiveMeasure({ t }: StepCtx) {
  const sc = 400 / 70;
  const grp = (y: number, t0: number, label: string) => {
    const a = easeOut(seg(t, t0, t0 + 0.4));
    const b = easeOut(seg(t, t0 + 0.4, t0 + 0.8));
    const d = easeOut(seg(t, t0 + 0.8, t0 + 1.1));
    return (
      <g>
        <T x={25} y={y - 8} s={12} f={C.latte} o={a}>
          {label}
        </T>
        <rect x={25} y={y} width={40 * sc * a} height={18} rx={3} fill={C.focus} opacity={0.6} />
        <rect x={25 + 40 * sc} y={y} width={30 * sc * b} height={18} rx={3} fill={C.second} opacity={0.6} />
        <T x={440} y={y + 14} s={13} f={C.focus} o={d}>
          70.00
        </T>
        <Tick y={y + 4} k={d} />
      </g>
    );
  };
  return (
    <Svg label="correct, summed by any dimension, measured" h={230}>
      <Row y={40} label="line total" value="additive, measured" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="summed any way" value="always correct" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {grp(135, 0.8, 'grouped by region')}
      {grp(195, 1.9, 'grouped by order')}
    </Svg>
  );
}

// 8 · Predict: across time? Two accounts' balances stack fine, with a tick; then the question about time.
export function PredictBalanceAcrossTime({ t, answer }: StepCtx) {
  return (
    <Svg label="a balance sums across accounts — across time too?" h={210}>
      <Row y={40} label="balance, across accounts" value="sums correctly" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={62} width={180 * easeOut(seg(t, 0.4, 0.8))} height={18} rx={3} fill={C.focus} opacity={0.6} />
      <rect x={205} y={62} width={140 * easeOut(seg(t, 0.8, 1.2))} height={18} rx={3} fill={C.second} opacity={0.6} />
      <Tick y={64} k={easeOut(seg(t, 1.2, 1.5))} />
      <AnswerRow y={140} label="balance, across time" answer={answer} value="no, meaningless" f={C.cherryText} k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="summing quarters' balances means nothing" f={C.cherryText} />
    </Svg>
  );
}

// 9 · Semi-additive, with real numbers. Four quarterly balances fly into one stack of 460.00, which means nothing; the
// fourth quarter's own 150.00 lights up as the real year-end.
const QB = [100, 120, 90, 150];
export function RevealSemiAdditive({ t }: StepCtx) {
  const u = 0.25;
  const fly = (i: number) => easeInOut(seg(t, 1.0 + i * 0.2, 1.6 + i * 0.2));
  const sum = easeOut(seg(t, 2.2, 2.6));
  const ye = easeOut(seg(t, 2.8, 3.3));
  let acc = 0;
  return (
    <Svg label="summed across time: meaningless. the last one: correct." h={250}>
      <Row y={40} label="four balances, summed" value="a meaningless number" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={85} label="the correct year-end" value="the last quarter alone" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {QB.map((v, i) => {
        const h = v * u;
        const x = 30 + i * 72;
        const k = easeOut(seg(t, 0.2 + i * 0.12, 0.6 + i * 0.12));
        const by = 215 - acc - h;
        acc += h;
        const f = fly(i);
        return (
          <g key={i}>
            <rect x={x} y={215 - h * k} width={40} height={h * k} rx={2} fill={i === 3 && ye > 0 ? C.focus : C.mocha} />
            <T x={x + 20} y={234} s={11} f={i === 3 && ye > 0 ? C.focus : C.latte} a="middle" o={k}>
              {`${v}.00`}
            </T>
            {f > 0 && <rect x={lerp(x, 360, f)} y={lerp(215 - h, by, f)} width={40} height={h} rx={2} fill={C.cherryText} opacity={0.75} />}
          </g>
        );
      })}
      <T x={415} y={lerp(165, 160, sum)} s={14} f={C.cherryText} o={sum}>
        460.00
      </T>
      <T x={415} y={182} s={11} f={C.cherryText} o={sum}>
        means nothing
      </T>
    </Svg>
  );
}

// 10 · Non-additive. East's margin 0.25 and West's 0.60 as bars; the naive average lands at 0.4250; the margin
// recomputed from summed revenue and cost lands at 0.3667: a different number.
export function RevealNonAdditive({ t }: StepCtx) {
  const s = 400;
  const a = easeOut(seg(t, 1.4, 1.9));
  const b = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="naively averaged vs. recomputed from sums" h={230}>
      <Row y={40} label="margin, averaged naively" value="0.4250" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.7))} />
      <Row y={85} label="margin, recomputed" value="0.3667" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      {[
        ['east', 0.25],
        ['west', 0.6],
      ].map(([l, m], i) => (
        <g key={l as string} opacity={easeOut(seg(t, 0.3 + i * 0.3, 0.7 + i * 0.3))}>
          <T x={25} y={142 + i * 32} s={12} f={C.latte}>
            {`${l} ${(m as number).toFixed(2)}`}
          </T>
          <rect x={120} y={128 + i * 32} width={s * (m as number) * easeOut(seg(t, 0.4 + i * 0.3, 1.0 + i * 0.3))} height={20} rx={3} fill={C.mocha} />
        </g>
      ))}
      <line x1={120 + s * 0.425} y1={118} x2={120 + s * 0.425} y2={118 + 68 * a} stroke={C.cherryText} strokeWidth={2.5} />
      <T x={120 + s * 0.425} y={112} s={11} f={C.cherryText} a="middle" o={a}>
        average
      </T>
      <line x1={120 + s * 0.3667} y1={118} x2={120 + s * 0.3667} y2={118 + 68 * b} stroke={C.focus} strokeWidth={2.5} />
      <T x={120 + s * 0.3667} y={206} s={11} f={C.focus} a="middle" o={b}>
        recomputed
      </T>
    </Svg>
  );
}

// 11 · The fix. Revenue is summed (200 + 100 = 300), cost is summed (150 + 40 = 190), and only then is the ratio
// taken: (300 − 190) ÷ 300 = 0.3667.
export function RevealNonAdditiveFix({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 0.8, 1.2));
  const r2 = easeOut(seg(t, 1.4, 1.8));
  const c1 = easeOut(seg(t, 1.2, 1.6));
  const c2 = easeOut(seg(t, 1.8, 2.2));
  const q = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="sum the components first, the ratio last" h={240}>
      <Row y={40} label="revenue, cost" value="sum these first" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="the ratio itself" value="computed last" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <T x={25} y={135} s={13} f={C.latte} o={r1}>
        revenue
      </T>
      <T x={150} y={135} s={14} f={C.crema} o={r1}>
        200 + 100
      </T>
      <T x={300} y={135} s={14} f={C.crema} o={r2}>
        = 300
      </T>
      <T x={25} y={175} s={13} f={C.latte} o={c1}>
        cost
      </T>
      <T x={150} y={175} s={14} f={C.crema} o={c1}>
        150 + 40
      </T>
      <T x={300} y={175} s={14} f={C.crema} o={c2}>
        = 190
      </T>
      <T x={300} y={lerp(225, 218, q)} s={16} f={C.focus} a="middle" o={q}>
        (300 − 190) ÷ 300 = 0.3667
      </T>
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="grain first, binding; three measure classes, measured" h={220}>
      <Row y={50} label="four steps" value="grain declared first" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={110} label="additive / semi" value="anywhere, or not over time" k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={170} label="non-additive" value="only its components sum" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 13 · Prove: a per-unit ratio. After the answer the ratio is rebuilt from its sums and the verdict lands with a tick.
export function ProveShippingRatio({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a per-unit ratio — sum directly, or fix first?" h={230}>
      <Row y={40} label="shipping cost per unit" value="sum it directly?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="or fix it first" answer={answer} value="fix it first" k={easeOut(seg(t, 0.4, 0.9))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(150, 142, k)} s={16} f={C.focus} a="middle" o={k}>
            Σ shipping cost ÷ Σ units
          </T>
          <T x={300} y={lerp(198, 190, k)} s={14} f={C.crema} a="middle" o={k}>
            sum each part, divide once
          </T>
          <rect x={170} y={202} width={260 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
