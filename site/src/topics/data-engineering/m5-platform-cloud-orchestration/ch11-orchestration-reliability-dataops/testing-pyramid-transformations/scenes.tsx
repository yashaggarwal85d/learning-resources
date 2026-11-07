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

// Every value here is examples.py's own: the mocked rows (order 1 at 10, order 2 at -5, order 3 at 20) and the expected
// 10.0 and 20.0, the merge counterexample a = {x: 500.0} and b = {x: 0.0}, the golden lines, the 5-second recency check,
// and the floats 0.1, 0.7 and 0.3. The two floating-point totals are computed, so they are named, never printed.

const RUNGS = ['unit tests', 'properties', 'golden snapshot', 'in pipeline'];

/** The pyramid's four rungs, bottom to top, centred on `cx`; `lit(i)` brightens a rung. */
function Pyramid({ cx, k, lit }: { cx: number; k: number; lit: (i: number) => boolean }) {
  return (
    <g>
      {RUNGS.map((r, i) => {
        const w = 200 - i * 30;
        return <Cell key={r} x={cx - w / 2} y={170 - i * 34} w={w} label={r} o={k * (lit(i) ? 1 : 0.35)} stroke={lit(i) ? C.focus : C.mocha} />;
      })}
    </g>
  );
}

// 0 · Twenty CI runs tick green; the colleague's machine ticks too, except one cross. The cause: a GROUP BY's two rows
// swapping places under an assertion that compared them by position.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const swap = easeInOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="passed in CI. failed on a colleague's machine." h={250}>
      <T x={25} y={44} s={12} f={C.crema} o={k(0)}>
        in CI
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <MiniTick key={i} x={230 + i * 17} y={38} k={easeOut(seg(t, 0.2 + i * 0.03, 0.35 + i * 0.03))} />
      ))}
      <T x={25} y={94} s={12} f={C.crema} o={k(0.9)}>
        a colleague's machine
      </T>
      {Array.from({ length: 20 }, (_, i) =>
        i === 13 ? <Cross key={i} x={236 + i * 17} y={86} k={k(1.5)} /> : <MiniTick key={i} x={230 + i * 17} y={88} k={easeOut(seg(t, 1.0 + i * 0.03, 1.15 + i * 0.03))} />,
      )}
      <T x={25} y={156} s={11} f={C.taupe} o={k(2.2)}>
        a GROUP BY's row order
      </T>
      <Cell x={lerp(230, 330, swap)} y={140} w={90} label="alice" o={k(2.3)} />
      <Cell x={lerp(330, 230, swap)} y={140} w={90} label="bob" o={k(2.3)} />
      {t > 3.2 && (
        <T x={25} y={204} s={12} f={C.cherryText} o={k(3.2)}>
          the assertion leaned on that order
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={234} s={11} f={C.taupe} o={k(3.8)}>
          never guaranteed to begin with
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. A row of passing ticks. Proof? Once answered, the row-order bug that sat beneath them all along is revealed.
export function PredictPassingProves({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="does a passing test prove correctness?" h={250}>
      {Array.from({ length: 12 }, (_, i) => (
        <MiniTick key={i} x={34 + i * 24} y={70} k={easeOut(seg(t, 0.1 + i * 0.05, 0.25 + i * 0.05))} />
      ))}
      <Hole x={25} y={100} w={300} h={34} o={k(0.6) * (1 - v)} />
      <Cell x={25} y={100} w={300} h={34} label="row-order bug, there all along" o={v} stroke={C.cherryText} f={C.cherryText} />
      {answer === null && t > 1.0 && (
        <T x={460} y={110} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: the test and machine just agreed" y={222} />
    </Svg>
  );
}

// 2 · The pyramid's bottom rung lights. Mocked rows go through stg_orders; the negative row drops and the two expected rows
// come out with a tick.
export function RevealUnitTests({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = ['order 1: 10', 'order 2: -5', 'order 3: 20'];
  return (
    <Svg label="mocked input. expected output. nothing materialized." h={250}>
      <Pyramid cx={125} k={k(0)} lit={(i) => i === 0} />
      <T x={260} y={40} s={11} f={C.taupe} o={k(0.4)}>
        mocked input
      </T>
      {rows.map((r, i) => (
        <T key={r} x={260} y={62 + i * 20} s={11} f={i === 1 ? C.cherryText : C.crema} o={k(0.5 + i * 0.1) * (i === 1 && t > 1.8 ? 0.35 : 1)}>
          {r}
        </T>
      ))}
      <Fan x1={370} y1={82} x2={414} y2={82} k={k(1.2)} />
      <Cell x={420} y={68} w={130} label="stg_orders" o={k(1.2)} />
      <T x={420} y={122} s={11} f={C.taupe} o={k(1.8)}>
        expected output
      </T>
      {['order 1: 10.0', 'order 3: 20.0'].map((r, i) => (
        <T key={r} x={420} y={144 + i * 20} s={11} f={C.focus} o={k(2.0 + i * 0.15)}>
          {r}
        </T>
      ))}
      <MiniTick x={548} y={150} k={k(2.5)} />
      {t > 3.0 && (
        <T x={260} y={200} s={11} f={C.crema} o={k(3.0)}>
          dbt unit test, or pytest on local Spark
        </T>
      )}
      {t > 3.6 && (
        <T x={260} y={228} s={11} f={C.taupe} o={k(3.6)}>
          fast, isolated, no full model run
        </T>
      )}
    </Svg>
  );
}

// 3 · The second rung lights. A rule is stated once; generated inputs stream past it and pass, until one lands red: the
// counterexample, and the total it lowered.
export function RevealPropertyBased({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="one rule. many generated inputs. a real counterexample." h={250}>
      <Pyramid cx={125} k={k(0)} lit={(i) => i === 1} />
      <Cell x={260} y={36} w={315} label="rule: a merge never lowers a total" o={k(0.3)} />
      {Array.from({ length: 20 }, (_, j) => (
        <Pip key={j} x={268 + j * 15} y={92} s={9} f={j === 19 ? C.cherryText : C.focus} o={easeOut(seg(t, 0.6 + j * 0.1, 0.7 + j * 0.1))} />
      ))}
      {t > 2.8 && (
        <T x={260} y={130} s={11} f={C.cherryText} o={k(2.8)}>
          {'a = {x: 500.0}, b = {x: 0.0}'}
        </T>
      )}
      {t > 3.2 && (
        <T x={260} y={152} s={11} f={C.cherryText} o={k(3.2)}>
          the buggy merge lowered the total
        </T>
      )}
      {t > 3.8 && (
        <T x={260} y={200} s={12} f={C.crema} o={k(3.8)}>
          one example proves one example
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. A narrow test checks one cell of the output and ticks. Tomorrow's change lands elsewhere? Once answered,
// three other cells turn red while the narrow test still ticks.
export function PredictTomorrowRegression({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const changed = (r: number, c: number) => (r === 1 && c === 2) || (r === 2 && c === 1) || (r === 2 && c === 3);
  return (
    <Svg label="does today's passing test catch tomorrow's regression?" h={250}>
      <Cell x={25} y={60} w={200} label="narrow unit test" o={k(0)} />
      <Fan x1={230} y1={74} x2={256} y2={74} k={k(0.3)} f={C.focus} />
      {Array.from({ length: 12 }, (_, j) => {
        const r = Math.floor(j / 4);
        const c = j % 4;
        const bad = changed(r, c) && v > 0.5;
        return (
          <rect
            key={j}
            x={260 + c * 75}
            y={60 + r * 34}
            width={65}
            height={26}
            rx={3}
            fill="none"
            stroke={bad ? C.cherryText : j === 0 ? C.focus : C.mocha}
            strokeWidth={bad || j === 0 ? 2 : 1.3}
            opacity={k(0.2 + j * 0.03)}
          />
        );
      })}
      <MiniTick x={286} y={72} k={k(0.6)} />
      {v > 0.5 && (
        <T x={260} y={180} s={11} f={C.cherryText} o={v}>
          changed, never checked
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={120} y={150} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: it checks only what it names" y={222} />
    </Svg>
  );
}

// 5 · The golden lines are frozen behind a lock. Today's whole output is diffed against them line by line; after a
// precision change every line comes back red, a change the narrow test walked past.
export function RevealGoldenSnapshot({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const gold = ['order 1: $10.00', 'order 2: $20.50', 'order 3: $5.25'];
  const bad = t > 2.2;
  return (
    <Svg label="the whole known-good output, diffed every time." h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        frozen baseline
      </T>
      <Lock x={140} y={32} k={k(0.3)} f={C.focus} />
      {gold.map((g, i) => (
        <T key={g} x={25} y={64 + i * 24} s={12} f={C.crema} o={k(0.2 + i * 0.1)}>
          {g}
        </T>
      ))}
      <T x={320} y={36} s={11} f={C.taupe} o={k(0.8)}>
        today's whole output
      </T>
      {gold.map((g, i) => (
        <g key={g}>
          <Fan x1={200} y1={60 + i * 24} x2={314} y2={60 + i * 24} k={k(1.2 + i * 0.15)} f={bad ? C.cherryText : C.taupe} />
          <rect x={320} y={50 + i * 24} width={150} height={16} rx={2} fill="none" stroke={bad ? C.cherryText : C.mocha} strokeWidth={bad ? 2 : 1.3} opacity={k(0.9)} />
        </g>
      ))}
      {bad && (
        <T x={320} y={140} s={11} f={C.cherryText} o={k(2.2)}>
          precision changed
        </T>
      )}
      {t > 2.8 && (
        <T x={25} y={176} s={11} f={C.taupe} o={k(2.8)}>
          the narrow test walked right past it
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={228} s={12} f={C.crema} o={k(3.8)}>
          the whole output, compared on every change
        </T>
      )}
    </Svg>
  );
}

// 6 · The top rung lights. Real data flows through the live pipeline past an expectation gate; one bad record is caught
// there, where pre-merge CI never looked.
export function RevealTopRung({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="inside the live pipeline, not before it." h={250}>
      <Pyramid cx={125} k={k(0)} lit={(i) => i === 3} />
      <Hole x={260} y={40} w={140} o={k(0.3)} />
      <T x={330} y={58} s={11} f={C.taupe} a="middle" o={k(0.3)}>
        pre-merge CI
      </T>
      <T x={410} y={58} s={11} f={C.taupe} o={k(0.5)}>
        never sees prod
      </T>
      <line x1={260} y1={120} x2={575} y2={120} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.6)} />
      <Cell x={380} y={106} w={120} label="expectation" o={k(0.7)} stroke={t > 2.4 ? C.cherryText : C.focus} />
      {Array.from({ length: 8 }, (_, j) => {
        const bad = j === 5;
        const d = 0.8 + j * 0.25;
        const m = seg(t, d, d + 0.9);
        const x = bad ? lerp(260, 372, Math.min(1, m * 1.6)) : lerp(260, 575, m);
        const hidden = x > 374 && x < 506;
        return m > 0 && (bad || m < 1) && !hidden ? <Pip key={j} x={x} y={120} s={9} f={bad ? C.cherryText : C.second} /> : null;
      })}
      {t > 2.8 && (
        <T x={260} y={176} s={11} f={C.cherryText} o={k(2.8)}>
          a real violation, caught in production
        </T>
      )}
      {t > 3.8 && (
        <T x={260} y={228} s={12} f={C.crema} o={k(3.8)}>
          this rung checks production itself
        </T>
      )}
    </Svg>
  );
}

// 7 · Three causes, three rows: a naive assertion crosses out, then the assertion that matches the claim ticks.
export function RevealFlakiness({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    ['ordering', 'compare by position', 'compare sorted'],
    ['time', 'exact timestamp', 'within 5 seconds'],
    ['floats', 'exact equality', 'isclose'],
  ];
  return (
    <Svg label="ordering. time. floating point." h={250}>
      {rows.map(([c, bad, good], i) => {
        const y = 50 + i * 60;
        const d = 0.3 + i * 1.2;
        return (
          <g key={c}>
            <T x={25} y={y} s={12} f={C.crema} o={k(d)}>
              {c}
            </T>
            <T x={150} y={y} s={11} f={C.cherryText} o={k(d + 0.2)}>
              {bad}
            </T>
            <Cross x={330} y={y - 4} k={k(d + 0.4)} />
            <T x={360} y={y} s={11} f={C.focus} o={k(d + 0.8)}>
              {good}
            </T>
            <MiniTick x={545} y={y - 6} k={k(d + 1.0)} />
          </g>
        );
      })}
      {t > 4.2 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(4.2)}>
          a short, nameable list of causes
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. The whole pyramid lights rung by rung, fast and narrow at the base, slow and broad at the top, with the three
// flaky causes beneath it all.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="four rungs. three real causes of flakiness." h={250}>
      <Pyramid cx={200} k={1} lit={(i) => t > 0.3 + i * 0.6} />
      <T x={330} y={188} s={11} f={C.taupe} o={k(0.6)}>
        fast and narrow
      </T>
      <T x={330} y={86} s={11} f={C.taupe} o={k(2.2)}>
        slow and broad
      </T>
      <Cell x={25} y={210} w={350} h={24} label="ordering, time, floating point" o={k(3.2)} stroke={C.cherryText} />
    </Svg>
  );
}

// 9 · Prove it. The same three floats summed forward and in reverse, each into its own total. Once answered, the two
// totals land and do not match.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="same three numbers. does the order change the total?" h={250}>
      <T x={25} y={64} s={15} f={C.crema} o={k(0)}>
        0.1 + 0.7 + 0.3
      </T>
      <T x={25} y={124} s={15} f={C.crema} o={k(0.3)}>
        0.3 + 0.7 + 0.1
      </T>
      <Fan x1={190} y1={58} x2={294} y2={58} k={k(0.6)} />
      <Fan x1={190} y1={118} x2={294} y2={118} k={k(0.7)} />
      <Hole x={300} y={44} w={130} o={k(0.8) * (1 - v)} />
      <Hole x={300} y={104} w={130} o={k(0.8) * (1 - v)} />
      <Cell x={300} y={44} w={130} label="one total" o={v} stroke={C.cherryText} />
      <Cell x={300} y={104} w={130} label="another" o={v} stroke={C.cherryText} />
      {v > 0.5 && (
        <T x={450} y={92} s={15} f={C.cherryText} o={v}>
          not equal
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={480} y={92} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="yes: two different floats" y={222} />
    </Svg>
  );
}
